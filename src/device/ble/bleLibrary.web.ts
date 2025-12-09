/// <reference types="web-bluetooth" />

import { PeripheralInfoUnified } from "../../sharedTypes/types";

// =============================
// TIPOS E INTERFACES
// =============================

export interface BlePeripheral {
    id: string;
    name: string | null;
    advertising?: string | null;
    peripheral?: any;
}

export type PeripheralInfo = {
    id: string;
    name: string | null;
    services: string[];
    serial?: string | null;
};

export type ScanMode = "any" | "dosimac";

type WebBleHandle = {
    device: BluetoothDevice;
    server: BluetoothRemoteGATTServer;
    service?: BluetoothRemoteGATTService;
    writeChar?: BluetoothRemoteGATTCharacteristic;
    notifyChar?: BluetoothRemoteGATTCharacteristic;
};

type ConnEvent = { id: string; name?: string | null };
type ConnCb = (id: string) => void;
type DiscCb = (id: string, error?: any) => void;

// =============================
// CONSTANTES UUID DOSIMAC
// =============================

const SERVICE_UUID: BluetoothServiceUUID = 0xaff2;
const CHAR_WRITE_UUID: BluetoothCharacteristicUUID = 0xcff1;
const CHAR_NOTIFY_UUID: BluetoothCharacteristicUUID = 0xcff5;
const AFF2_STR = "0000aff2-0000-1000-8000-00805f9b34fb" as BluetoothServiceUUID;

// =============================
// ESTADO INTERNO
// =============================

export let devices: BlePeripheral[] = [];
export let conectedDevices: BlePeripheral[] = [];

const handles = new Map<string, WebBleHandle>();
let selectedDeviceId: string | null = null;

const _scanEmitter = new EventTarget();
let _scanListenerInstalled = false;
let _scanListenerFn: ((e: Event) => void) | null = null;

const _connEmitter = new EventTarget();
const advListeners = new Map<string, (ev: BluetoothAdvertisingEvent) => void>();
const advLabelById = new Map<string, string>();

let dosimacNotifyHandler: ((data: number[]) => void) | null = null;

// =============================
// FUNCIONES HELPER INTERNAS
// =============================

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function ensureSupport() {
    if (typeof navigator === "undefined" || !("bluetooth" in navigator)) {
        throw new Error(
            "Web Bluetooth no está soportado. Usa Chrome/Edge sobre HTTPS o localhost."
        );
    }
    if (typeof window !== "undefined" && !window.isSecureContext) {
        throw new Error("Web Bluetooth requiere contexto seguro (HTTPS o localhost).");
    }
}

function toArrayBuffer(view: Uint8Array): ArrayBuffer {
    if (
        view.byteOffset === 0 &&
        view.buffer instanceof ArrayBuffer &&
        view.byteLength === view.buffer.byteLength
    ) {
        return view.buffer;
    }
    const ab = new ArrayBuffer(view.byteLength);
    new Uint8Array(ab).set(
        new Uint8Array(view.buffer, view.byteOffset, view.byteLength)
    );
    return ab;
}

function emitConn(event: "connected" | "disconnected", payload: ConnEvent) {
    _connEmitter.dispatchEvent(new CustomEvent(event, { detail: payload }));
}

const clearDevices = () => {
    devices = [];
    conectedDevices = [];
    selectedDeviceId = null;
    handles.clear();
    advLabelById.clear();
};

// =============================
// ADVERTISING (manufacturerData)
// =============================

export const getAdvTailLabel = (id: string) => advLabelById.get(id) ?? null;

export async function startWatchAdvertisements(id: string) {
    ensureSupport();
    const dev = devices.find((d) => d.id === id)?.peripheral as
        | BluetoothDevice
        | undefined;
    if (!dev) throw new Error("[WEB][adv] Device no encontrado");

    if (!("watchAdvertisements" in dev)) {
        console.warn("[WEB][adv] watchAdvertisements no soportado en este navegador");
        return;
    }
    if (advListeners.has(id)) return;

    const listener = (ev: any) => {
        try {
            console.log("[ADV] name=", ev.device?.name ?? null);
            console.log("[ADV] rssi=", ev.rssi, "txPower=", ev.txPower);
            console.log("[ADV] uuids=\n", ev.uuids ?? []);

            for (const [companyId, dataView] of ev.manufacturerData || []) {
                const bytes = new Uint8Array(dataView.buffer);
                const companyHex = companyId.toString(16).padStart(4, "0").toUpperCase();
                console.log("[ADV] mfg companyId=0x" + companyHex, "bytes=\n", bytes);

                const ascii = Array.from(bytes)
                    .filter((b) => b >= 32 && b <= 126)
                    .map((b) => String.fromCharCode(b))
                    .join("");
                console.log("[ADV] ascii mfg =", ascii);

                const match = ascii.match(/DOSIMAC-[IG]_([0-9A-Za-z]{4})$/);
                if (match) {
                    const label = match[1].toUpperCase();
                    const devId = (ev.device?.id ?? id) as string;
                    console.log("[ADV] adv label (manufacturerData) =", label, "para", devId);
                    advLabelById.set(devId, label);
                }
            }

            for (const [uuid, dataView] of ev.serviceData || []) {
                const bytes = new Uint8Array(dataView.buffer);
                console.log("[ADV] svcData", uuid, bytes);
            }
        } catch (e) {
            console.warn("[ADV] error manejando advertisement:", e);
        }
    };

    dev.addEventListener("advertisementreceived", listener as EventListener);
    console.log("[WEB][adv] calling watchAdvertisements()…");
    await (dev as any).watchAdvertisements();
    advListeners.set(id, listener);
    console.log("[WEB][adv] ahora escuchando anuncios de", id);
}

export async function stopWatchAdvertisements(id: string) {
    const listener = advListeners.get(id);
    const dev = devices.find((d) => d.id === id)?.peripheral as
        | BluetoothDevice
        | undefined;

    if (dev && listener) {
        dev.removeEventListener("advertisementreceived", listener as EventListener);
        console.log("[WEB][adv] listener eliminado para", id);
    }
    advListeners.delete(id);
    advLabelById.delete(id);
}

// =============================
// API PÚBLICA - INICIALIZACIÓN
// =============================

export const BleStart = () => {
    ensureSupport();
    clearDevices();
};

export const bleAddListener = () => {
    if (_scanListenerInstalled) return;
    _scanListenerFn = (e: Event) => {
        const d = (e as CustomEvent<BlePeripheral>).detail;
        if (!devices.some((x) => x.id === d.id)) {
            devices.push(d);
        }
    };
    _scanEmitter.addEventListener("scanResult", _scanListenerFn as EventListener);
    _scanListenerInstalled = true;
};

export const bleRemoveListener = () => {
    if (_scanListenerInstalled && _scanListenerFn) {
        _scanEmitter.removeEventListener("scanResult", _scanListenerFn as EventListener);
        _scanListenerInstalled = false;
        _scanListenerFn = null;
    }
};

// =============================
// ESCANEO
// =============================

export const startScanning = async (filter: "dosimac" | "cti" | "any" = "any") => {
    ensureSupport();

    let filterOpts: any = { acceptAllDevices: false, optionalServices: [] };

    if (filter === "dosimac") {
        console.log("[WEB][scan] chooser con filtro manufacturerData (0xE502) para DOSIMAC…");
        filterOpts = {
            filters: [{ manufacturerData: [{ companyIdentifier: 0xE502 }] }],
            optionalServices: [SERVICE_UUID],
        };
    } else if (filter === "cti") {
        console.log("[WEB][scan] chooser con filtro manufacturerData (0x05E5) para CTI…");
        filterOpts = {
            filters: [{ manufacturerData: [{ companyIdentifier: 0x05E5 }] }],
            optionalServices: [0xAFF2],
        };
    } else {
        console.log("[WEB][scan] chooser acceptAllDevices…");
        filterOpts = {
            acceptAllDevices: true,
            optionalServices: [SERVICE_UUID, 0xAFF2],
        };
    }

    try {
        const device: BluetoothDevice = await navigator.bluetooth.requestDevice(filterOpts);
        console.log("[WEB][scan] seleccionado:", device.id, device.name ?? null);

        // 🔥 NUEVO: Conectar AQUÍ MISMO, antes de retornar
        console.log("[WEB][scan] conectando GATT dentro del chooser...");

        if (!device.gatt) {
            throw new Error("[WEB][scan] device.gatt es null");
        }

        // Registrar handle y listeners ANTES de conectar
        let handle = handles.get(device.id);
        if (!handle) {
            handle = {
                device,
                server: device.gatt,
            };
            handles.set(device.id, handle);

            // Listener de desconexión
            const devAny = device as any;
            if (!devAny._hasDiscListener) {
                device.addEventListener("gattserverdisconnected", () => {
                    console.warn("[WEB] ❌ disconnected", device.id, device.name ?? null);

                    const h = handles.get(device.id);
                    if (h) {
                        h.service = undefined;
                        h.writeChar = undefined;
                        h.notifyChar = undefined;
                    }
                    handles.delete(device.id);

                    if (selectedDeviceId === device.id) {
                        selectedDeviceId = null;
                    }

                    advLabelById.delete(device.id);
                    emitConn("disconnected", { id: device.id, name: device.name });
                });
                devAny._hasDiscListener = true;
            }
        }

        selectedDeviceId = device.id;

        // Intentar conectar usando connectWithEvent
        try {
            await connectWithEvent(device);
            console.log("[WEB][scan] ✅ GATT conectado exitosamente");
        } catch (e) {
            console.error("[WEB][scan] ⚠️ Error conectando GATT:", e);
            // No lanzamos error, dejamos que el flujo continúe
            // La app podrá reintentar en DR-SETUP
        }

        // Añadir a la lista de devices
        const existingIdx = devices.findIndex((d) => d.id === device.id);
        if (existingIdx >= 0) {
            devices[existingIdx] = {
                id: device.id,
                name: device.name ?? null,
                peripheral: device,
            };
        } else {
            devices.push({
                id: device.id,
                name: device.name ?? null,
                peripheral: device,
            });
        }

        return {
            id: device.id,
            name: device.name ?? null,
            services: [],
            rssi: null,
            manufacturerData: null,
        };
    } catch (err: any) {
        if (err?.name === "NotFoundError") {
            console.log("[WEB][scan] usuario canceló el chooser");
        } else {
            console.error("[WEB][scan] error:", err);
        }
        return null;
    }
};

export const stopScanning = () => {
    /* no-op en web */
};

export const bleConnection = async (id: string) => {
    ensureSupport();
    if (!id) throw new Error("BLEConnection: No device selected");

    // 🔥 CAMBIO: Establecer selectedDeviceId INMEDIATAMENTE
    selectedDeviceId = id;
    console.log("[WEB] bleConnection: selectedDeviceId establecido:", id);

    let device: BluetoothDevice | undefined;
    const devEntry = devices.find((d) => d.id === id);
    if (devEntry) {
        device = devEntry.peripheral as BluetoothDevice;
        console.log("[WEB] bleConnection: device encontrado en array devices");
    } else {
        console.warn("[WEB] bleConnection: device NO en array, intentando recuperar...");
        try {
            const getDevices = (navigator.bluetooth as any)?.getDevices;
            if (getDevices) {
                const granted: BluetoothDevice[] = await getDevices.call(navigator.bluetooth);
                device = granted.find(d => d.id === id);
                if (device) {
                    console.log("[WEB] bleConnection: ✅ device recuperado desde getDevices()");
                    devices.push({
                        id: device.id,
                        name: device.name ?? null,
                        peripheral: device,
                    });
                } else {
                    console.error("[WEB] bleConnection: device no encontrado en getDevices()");
                }
            } else {
                console.warn("[WEB] bleConnection: getDevices() no disponible");
            }
        } catch (e) {
            console.error("[WEB] bleConnection: error en getDevices():", e);
        }
    }

    if (!device) {
        throw new Error(
            `Device ${id} no encontrado. devices.length=${devices.length}`
        );
    }

    console.log("[WEB] bleConnection: conectando a", device.id, device.name ?? null);
    const gatt = device.gatt;
    if (!gatt) {
        throw new Error("[WEB] bleConnection: device.gatt es null");
    }

    let handle = handles.get(id);
    if (!handle) {
        console.log("[WEB] bleConnection: creando nuevo handle");
        handle = {
            device,
            server: gatt,
        };
        handles.set(id, handle);

        const devAny = device as any;
        if (!devAny._hasDiscListener) {
            device.addEventListener("gattserverdisconnected", () => {
                console.warn("[WEB] ❌ gattserverdisconnected event:", device.id, device.name ?? null);
                const h = handles.get(device.id);
                if (h) {
                    // 🔥 CAMBIO: Solo limpiar las características, NO el handle completo
                    console.log("[WEB] gattserverdisconnected: limpiando características del handle");
                    h.service = undefined;
                    h.writeChar = undefined;
                    h.notifyChar = undefined;
                }

                // 🔥 CAMBIO CRÍTICO: NO eliminar el handle ni selectedDeviceId
                // handles.delete(device.id);  ← ❌ COMENTADO
                // if (selectedDeviceId === device.id) {
                //     selectedDeviceId = null;  ← ❌ COMENTADO
                // }

                console.log("[WEB] gattserverdisconnected: handle y selectedDeviceId preservados para reconexión");

                advLabelById.delete(device.id);
                emitConn("disconnected", { id: device.id, name: device.name });
            });
            devAny._hasDiscListener = true;
            console.log("[WEB] bleConnection: listener de desconexión registrado");
        }
    } else {
        console.log("[WEB] bleConnection: usando handle existente");
    }

    // 🔥 CAMBIO: Si ya está conectado, NO intentar conectar de nuevo
    if (!handle.server.connected) {
        console.log("[WEB] bleConnection: GATT NO conectado, conectando con evento...");
        try {
            await connectWithEvent(device);
            console.log("[WEB] bleConnection: ✅ GATT conectado via evento");
        } catch (e) {
            console.error("[WEB] bleConnection: ❌ error conectando GATT:", e);
            throw e;
        }
    } else {
        console.log("[WEB] bleConnection: ✅ GATT ya está conectado, no es necesario conectar");
    }

    const serialLabel = getAdvTailLabel(device.id) ?? null;
    return {
        id: device.id,
        name: device.name ?? null,
        services: [],
        serial: serialLabel,
    };
};;

async function connectWithEvent(device: BluetoothDevice): Promise<void> {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            cleanup();
            reject(new Error("[connectWithEvent] Timeout esperando conexión GATT (10s)"));
        }, 10000);

        let connected = false;

        const onConnected = () => {
            if (connected) return;
            connected = true;
            console.log("[connectWithEvent] ✅ evento 'gattserverconnected' recibido");
            cleanup();
            setTimeout(() => resolve(), 300);
        };

        const onDisconnected = () => {
            if (connected) return;
            console.warn("[connectWithEvent] ❌ 'gattserverdisconnected' antes de conectar");
            cleanup();
            reject(new Error("[connectWithEvent] Desconectado antes de establecer conexión"));
        };

        const cleanup = () => {
            clearTimeout(timeout);
            device.removeEventListener("gattserverconnected", onConnected);
            device.removeEventListener("gattserverdisconnected", onDisconnected);
        };

        device.addEventListener("gattserverconnected", onConnected, { once: true });
        device.addEventListener("gattserverdisconnected", onDisconnected, { once: true });

        console.log("[connectWithEvent] llamando a gatt.connect()...");
        device.gatt!.connect().catch((err) => {
            if (connected) return;
            console.error("[connectWithEvent] error en gatt.connect():", err);
            cleanup();
            reject(err);
        });
    });
}


export const bleDisconnection = (id: string) => {
    ensureSupport();

    console.log("[WEB] bleDisconnection:", id);

    const handle = handles.get(id);
    if (!handle) {
        console.log("[WEB] bleDisconnection: handle not found");
        return;
    }

    // 🔥 NUEVO: Desuscribirse de notificaciones ANTES de desconectar
    if (handle.notifyChar) {
        try {
            console.log("[WEB] bleDisconnection: deteniendo notificaciones");
            handle.notifyChar.stopNotifications().catch(e => {
                console.warn("[WEB] bleDisconnection: error deteniendo notificaciones:", e);
            });
        } catch (e) {
            console.warn("[WEB] bleDisconnection: error en stopNotifications:", e);
        }
    }

    // Desconectar GATT
    if (handle.server && handle.server.connected) {
        try {
            console.log("[WEB] bleDisconnection: desconectando GATT");
            handle.device.gatt?.disconnect();
            console.log("[WEB] bleDisconnection: ✅ GATT desconectado");
        } catch (e) {
            console.error("[WEB] bleDisconnection: error desconectando:", e);
        }
    }

    // Limpiar handle
    handle.service = undefined;
    handle.writeChar = undefined;
    handle.notifyChar = undefined;

    // 🔥 OPCIONAL: Remover del handles Map si quieres olvidarlo completamente
    // handles.delete(id);

    // if (selectedDeviceId === id) {
    //     selectedDeviceId = null;
    // }

    console.log("[WEB] bleDisconnection: ✅ Desconexión completa");
};

export const bleIsConnected = async (id: string) => {
    const handle = handles.get(id);
    return !!handle?.server?.connected;
};

// =============================
// NOTIFICACIONES
// =============================

export const registerDosimacNotifyHandler = (handler: (data: number[]) => void) => {
    dosimacNotifyHandler = handler;
};

export const bleSubscribeNotify = async () => {
    ensureSupport();

    if (!selectedDeviceId) {
        console.error("[WEB][bleSubscribeNotify] no device selected");
        return;
    }

    const handle = handles.get(selectedDeviceId);
    if (!handle) {
        console.error("[WEB][bleSubscribeNotify] handle not found");
        return;
    }

    if (!handle.server.connected) {
        throw new Error("[WEB][bleSubscribeNotify] GATT no está conectado");
    }

    console.log("[WEB][bleSubscribeNotify] obteniendo servicio AFF2...");
    if (!handle.service) {
        handle.service = await handle.server.getPrimaryService(SERVICE_UUID);
        await sleep(100);
    }
    console.log("[WEB][bleSubscribeNotify] servicio AFF2 obtenido");

    console.log("[WEB][bleSubscribeNotify] obteniendo característica CFF5...");
    if (!handle.notifyChar) {
        handle.notifyChar = await handle.service.getCharacteristic(CHAR_NOTIFY_UUID);
    }
    console.log("[WEB][bleSubscribeNotify] característica CFF5 obtenida");

    // 🔥 CAMBIO: Verificar si ya está suscrito antes de intentar suscribirse
    const isNotifying = handle.notifyChar.properties.notify;

    try {
        // Solo llamar a startNotifications si NO está notificando ya
        if (!isNotifying || !(handle.notifyChar as any)._notifying) {
            await handle.notifyChar.startNotifications();
            console.log("[WEB][bleSubscribeNotify] ✅ notificaciones CFF5 activadas");
        } else {
            console.log("[WEB][bleSubscribeNotify] ⚠️ Ya estaba suscrito a notificaciones");
        }

        // 🔥 CRÍTICO: SIEMPRE asegurar que el handler está registrado
        // Remover listeners viejos primero
        const oldHandler = (handle.notifyChar as any)._changeHandler;
        if (oldHandler) {
            console.log("[WEB][bleSubscribeNotify] Removiendo handler antiguo");
            handle.notifyChar.removeEventListener("characteristicvaluechanged", oldHandler);
        }

        // Crear nuevo handler
        const newHandler = (event: any) => {
            const value: DataView = event.target.value;
            const arr: number[] = [];
            for (let i = 0; i < value.byteLength; i++) {
                arr.push(value.getUint8(i));
            }

            if (dosimacNotifyHandler) {
                dosimacNotifyHandler(arr);
            }
        };

        // Guardar referencia al handler para poder removerlo después
        (handle.notifyChar as any)._changeHandler = newHandler;

        // Añadir el nuevo listener
        handle.notifyChar.addEventListener("characteristicvaluechanged", newHandler);
        console.log("[WEB][bleSubscribeNotify] ✅ Handler de notificaciones registrado");

    } catch (e: any) {
        if (e.name === 'InvalidStateError' || e.message?.includes('already')) {
            console.log("[WEB][bleSubscribeNotify] ⚠️ Ya estaba suscrito, continuando...");
        } else {
            console.error("[WEB][bleSubscribeNotify] ❌ Error activando notificaciones:", e);
            throw e;
        }
    }
};

export const bleSubscribeGeneric = async (
    serviceUUID: string,
    characteristicUUID: string,
    onValue: (value: number[]) => void
) => {
    if (!selectedDeviceId) throw new Error("No device selected");
    const handle = handles.get(selectedDeviceId);
    if (!handle) throw new Error("Handle no encontrado");

    const svc =
        handle.service ??
        (await handle.server.getPrimaryService(serviceUUID as BluetoothServiceUUID));
    handle.service = svc;

    const char = await svc.getCharacteristic(
        characteristicUUID as BluetoothCharacteristicUUID
    );

    const listener = (ev: Event) => {
        const target = ev.target as BluetoothRemoteGATTCharacteristic;
        if (target?.value) {
            const arr = Array.from(new Uint8Array(target.value.buffer));
            onValue(arr);
        }
    };

    char.addEventListener("characteristicvaluechanged", listener);
    await char.startNotifications();

    return {
        remove: async () => {
            try {
                await char.stopNotifications();
            } catch { }
            try {
                char.removeEventListener("characteristicvaluechanged", listener);
            } catch { }
        },
    };
};

// =============================
// ESCRITURA
// =============================

export const blehandleMTU = async () => {
    /* no-op en web */
};
export const bleDosimacWrite = async (data: Buffer) => {
    ensureSupport();

    // 🔥 CAMBIO: Si no hay device seleccionado, intentar recuperarlo
    if (!selectedDeviceId) {
        console.log("[WEB][bleDosimacWrite] no device selected, buscando devices...");

        // Intentar obtener el primer device disponible del Map de handles
        const allHandles = Array.from(handles.entries());
        if (allHandles.length > 0) {
            const [firstId, firstHandle] = allHandles[0];
            console.log("[WEB][bleDosimacWrite] ✅ usando device encontrado:", firstId);
            selectedDeviceId = firstId;
        } else {
            // Si no hay handles, intentar recuperar de navigator.bluetooth
            console.log("[WEB][bleDosimacWrite] no hay handles, buscando en navigator.bluetooth...");
            try {
                const granted: BluetoothDevice[] = await (navigator.bluetooth as any).getDevices();
                if (granted.length > 0) {
                    const device = granted[0];
                    console.log("[WEB][bleDosimacWrite] ✅ device recuperado:", device.id);
                    selectedDeviceId = device.id;

                    // Crear handle si no existe
                    if (!handles.has(device.id)) {
                        console.log("[WEB][bleDosimacWrite] creando handle para device recuperado");
                        handles.set(device.id, {
                            device,
                            server: device.gatt!,
                            service: undefined,
                            writeChar: undefined,
                            notifyChar: undefined,
                        });
                    }
                } else {
                    console.error("[WEB][bleDosimacWrite] ❌ no hay devices disponibles");
                    throw new Error("[WEB][bleDosimacWrite] no device available");
                }
            } catch (getDevicesError) {
                console.error("[WEB][bleDosimacWrite] ❌ error obteniendo devices:", getDevicesError);
                throw new Error("[WEB][bleDosimacWrite] no device selected and cannot recover");
            }
        }
    }

    const handle = handles.get(selectedDeviceId);
    if (!handle) {
        console.error("[WEB][bleDosimacWrite] ❌ handle not found for:", selectedDeviceId);
        throw new Error("[WEB][bleDosimacWrite] handle not found");
    }

    if (!handle.server.connected) {
        throw new Error("[WEB][bleDosimacWrite] GATT no está conectado");
    }

    console.log("[WEB][bleDosimacWrite] obteniendo servicio AFF2...");
    if (!handle.service) {
        handle.service = await handle.server.getPrimaryService(SERVICE_UUID);
        await sleep(100);
    }
    console.log("[WEB][bleDosimacWrite] servicio AFF2 obtenido");

    console.log("[WEB][bleDosimacWrite] obteniendo característica CFF1...");
    if (!handle.writeChar) {
        handle.writeChar = await handle.service.getCharacteristic(CHAR_WRITE_UUID);
    }
    console.log("[WEB][bleDosimacWrite] característica CFF1 obtenida");

    const uint8Array = new Uint8Array(data);

    // 🔥 CAMBIO: Manejar errores de escritura con reintentos
    try {
        await handle.writeChar.writeValueWithoutResponse(uint8Array);
        console.log("[WEB][bleDosimacWrite] ✅ datos escritos:", data.length, "bytes");
    } catch (e: any) {
        console.error("[WEB][bleDosimacWrite] ❌ Error escribiendo:", e);
        // Si falla, esperar y reintentar UNA vez
        if (e.name === 'NotSupportedError' || e.name === 'NetworkError') {
            console.log("[WEB][bleDosimacWrite] reintentando escritura en 200ms...");
            await sleep(200);
            try {
                await handle.writeChar.writeValueWithoutResponse(uint8Array);
                console.log("[WEB][bleDosimacWrite] ✅ datos escritos en reintento");
            } catch (retryError) {
                console.error("[WEB][bleDosimacWrite] ❌ Error en reintento:", retryError);
                throw retryError;
            }
        } else {
            throw e;
        }
    }
};

// =============================
// LISTENERS DE ESTADO
// =============================

export const addConnectionListeners = (
    onConnect: ConnCb,
    onDisconnect: DiscCb
) => {
    const c1 = (e: Event) => {
        const { id } = (e as CustomEvent<ConnEvent>).detail;
        onConnect?.(id);
    };
    const c2 = (e: Event) => {
        const { id } = (e as CustomEvent<ConnEvent>).detail;
        onDisconnect?.(id, undefined);
    };
    _connEmitter.addEventListener("connected", c1 as EventListener);
    _connEmitter.addEventListener("disconnected", c2 as EventListener);

    return () => {
        try {
            _connEmitter.removeEventListener("connected", c1 as EventListener);
        } catch { }
        try {
            _connEmitter.removeEventListener("disconnected", c2 as EventListener);
        } catch { }
    };
};

export const addBtStateListener = (onState: (state: string) => void) => {
    let cancelled = false;
    Promise.resolve().then(() => {
        if (!cancelled) onState("on");
    });
    return () => {
        cancelled = true;
    };
};

export const isDeviceConnected = (id: string): boolean => {
    const handle = handles.get(id);
    // 🔥 CAMBIO: Verificar REALMENTE si está conectado
    if (!handle || !handle.server) return false;
    return handle.server.connected === true;
};