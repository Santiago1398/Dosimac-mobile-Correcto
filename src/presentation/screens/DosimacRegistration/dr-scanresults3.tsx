import React, { useEffect, useRef, useState } from 'react';
import { View, Platform } from 'react-native';
import { ActivityIndicator, Appbar, Text, Button, Portal, Dialog } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import * as ble from '../../../device/ble/bleLibrary';
import { MainButton } from '../../components/shared/MainButton ';
import { BlePeripheral } from '../../../device/ble/bleLibrary';
import { Buffer } from 'buffer';
import { startScanning } from '../../../device/ble/bleLibrary.web';
import { PeripheralInfoUnified } from '../../../sharedTypes/types';

export const DRScanResultsScreen = ({ navigation, route }: any) => {
   const { t } = useTranslation();

   // Helpers ASCII (para nativo)
   const ASCII = (s: string) => s.split('').map(c => c.charCodeAt(0));
   const bytesToAscii = (bytes: number[]) => String.fromCharCode(...bytes.map(b => b & 0xff));

   const [scanning, setScanning] = useState(true);
   const [startState, setStartState] = useState(0);
   const [hasDevices, setHasDevices] = useState(false);
   const knownAff2IdsRef = React.useRef(new Set<string>());
   const [visible, setVisible] = useState(false);
   const [checked, setChecked] = useState(false);
   const [statusMsg, setStatusMsg] = useState<string | null>(null);
   const [pairing, setPairing] = useState(false);

   const hideDialog = () => {
      setVisible(false);
      navigation.navigate('DR-NEWUPDATE');
   };

   // refs que no disparan rerenders
   const lastSelectedIdRef = useRef<string | null>(null);

   // Cuando abras el chooser (en otra pantalla), puedes usar esto si lo necesitas:
   const handleChooseWeb = async () => {
      const dev = await startScanning();     // <- función web
      if (dev) lastSelectedIdRef.current = dev.id;
   };

   // Prefijos OUI permitidos como respaldo (solo nativo)
   const ALLOWED_OUIS = ['E8:6B:EA'];

   // labels[id] = serial devuelto por bleConnection (WEB)
   const [labels, setLabels] = useState<Record<string, string>>({});

   function shortLabelFromSerial(serial: string | null | undefined): string {
      if (typeof serial !== 'string') return 'UNKN';
      const clean = serial.replace(/[^0-9A-Fa-f]/g, '').toUpperCase();
      return (clean.slice(-4) || 'UNKN');
   }

   // Agujas según la operación (1 = I, 3 = G). Fallback genérico. (nativo)
   function getNeedles(): string[] {
      const op = Number(route?.params?.operacion) || 0;
      if (op === 1) return ['DOSIMAC-I'];
      if (op === 3) return ['DOSIMAC-G'];
      return ['DOSIMAC'];
   }

   // ===== Extractores de advertising (nativo) =====
   function extractAdvBytesIOS(adv: any): number[] | null {
      if (!adv) return null;
      if (Array.isArray(adv.manufacturerRawData)) return adv.manufacturerRawData;

      if (adv.manufacturerData && typeof adv.manufacturerData === 'object') {
         const k = Object.keys(adv.manufacturerData)[0];
         if (k && Array.isArray(adv.manufacturerData[k])) return adv.manufacturerData[k];
      }

      if (adv.serviceData && typeof adv.serviceData === 'object') {
         const k = Object.keys(adv.serviceData)[0];
         const p: any = k ? adv.serviceData[k] : undefined;
         const bytes = Array.isArray(p) ? p : Array.isArray(p?.bytes) ? p.bytes : undefined;
         if (Array.isArray(bytes)) return bytes;
      }
      return null;
   }

   function base64ToBytes(b64: string): number[] {
      try {
         const bin = Buffer.from(b64, 'base64').toString('binary');
         const out: number[] = [];
         for (let i = 0; i < bin.length; i++) out.push(bin.charCodeAt(i) & 0xff);
         return out;
      } catch {
         return [];
      }
   }

   function getAdvBytes(d: any): number[] | null {
      if (Array.isArray((d as any).advBytes) && (d as any).advBytes.length) return (d as any).advBytes;

      const adv: any = d.peripheral?.advertising || d.advertising || {};

      // iOS
      const iosBytes = extractAdvBytesIOS(adv);
      if (Array.isArray(iosBytes)) return iosBytes;

      // Android / variantes
      if (adv?.manufacturerData?.bytes && Array.isArray(adv.manufacturerData.bytes)) {
         return adv.manufacturerData.bytes;
      }
      if (typeof adv?.manufacturerData === 'string') {
         const arr = base64ToBytes(adv.manufacturerData);
         if (arr.length) return arr;
      }
      if (typeof adv?.manufacturerData?.data === 'string') {
         const arr = base64ToBytes(adv.manufacturerData.data);
         if (arr.length) return arr;
      }
      if (Array.isArray(adv?.manufacturerRawData)) {
         return adv.manufacturerRawData;
      }
      if (adv?.rawData?.bytes && Array.isArray(adv.rawData.bytes)) {
         return adv.rawData.bytes;
      }

      // fallback "17,67,..." como texto
      if (typeof d.advertising === 'string' && d.advertising.includes(',')) {
         const arr = d.advertising.split(',').map((n: string) => Number(n));
         if (arr.every((x: any) => Number.isFinite(x))) return arr;
      }
      return null;
   }

   // ===== Filtro secundario por OUI (nativo) =====
   function macHasAllowedPrefix(id?: string | null) {
      if (!id) return false;
      const mac = id.toUpperCase();
      const parts = mac.split(':');
      if (parts.length >= 3) {
         const oui = parts.slice(0, 3).join(':');
         return ALLOWED_OUIS.includes(oui);
      }
      return false;
   }

   // ===== Dispositivo nuestro según operacion (NATIVO) =====
   function isOurs(d: BlePeripheral): boolean {
      const bytes = getAdvBytes(d);
      if (Array.isArray(bytes) && bytes.length) {
         const s = bytesToAscii(bytes).toUpperCase();
         const needles = getNeedles();
         return needles.some(n => s.includes(n));
      }
      return macHasAllowedPrefix(d.id);
   }

   // ===== Etiqueta corta desde MAC (últimos 2 octetos, ej. "CBCA") =====
   function getDeviceLabel(d: BlePeripheral): string {
      const id = d.id || '';
      const mac = id.includes(':')
         ? id.split(':').slice(-2).join('')
         : id.replace(/[^0-9A-Fa-f]/g, '').slice(-4);
      return mac ? mac.toUpperCase() : 'UNKN';
   }

   // ===== En web: nuestro = tiene serial en labels[id] (viene de manufacturerData) =====
   const isOursWeb = (d: { id: string }) => {
      return !!labels[d.id];
   };

   // ========= LÓGICA NATIVA =========
   // Máquina de estados solo en nativo (escaneo clásico)
   useEffect(() => {
      if (Platform.OS === 'web') return; // no hagas nada en web

      const timer = setTimeout(() => {
         if (startState < 2) {
            setStartState(startState + 1);
         } else {
            // fin
            setScanning(false);
            setHasDevices(ble.devices.some(isOurs));

            // debug opcional
            ble.devices.forEach((device, idx) => {
               const adv = getAdvBytes(device) ?? [];
               console.log(`-----: ${idx + 1}`);
               console.log('ID:', device.id, 'NAME:', device.name ?? 'null');
               console.log('ADV BYTES:', adv);
            });
         }
      }, startBleStateMachine());

      return () => clearTimeout(timer);
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [startState]);

   const startBleStateMachine = (): number => {
      if (Platform.OS === 'web') return 0; // seguridad extra
      let tiempo = 0;
      switch (startState) {
         case 0:
            tiempo = 500;
            break;
         case 1:
            ble.startScanning?.();
            tiempo = 3000;
            break;
         case 2:
            ble.stopScanning?.();
            tiempo = 100;
            break;
         default:
            break;
      }
      return tiempo;
   };

   // ========= LÓGICA WEB =========
   useEffect(() => {
      if (Platform.OS !== 'web') return;

      let cancelled = false;
      const GRACE_MS = 900; // tiempo para mostrar diálogo si no hay ninguno

      const run = async () => {
         console.log('[RESULTS][web] start…');
         setScanning(true);
         setStatusMsg('Emparejando…');

         // Recuperar si venimos con lastId y el array quedó vacío
         const lastId = route?.params?.lastId as (string | null | undefined);
         const needsRecover = (!ble.devices || ble.devices.length === 0) && lastId;

         if (needsRecover) {
            try {
               const getDevices = (navigator.bluetooth as any)?.getDevices;
               if (getDevices) {
                  const granted: BluetoothDevice[] = await getDevices.call(navigator.bluetooth);
                  const found = granted?.find(d => d.id === lastId);
                  if (found && !ble.devices.some(x => x.id === found.id)) {
                     ble.devices.push({ id: found.id, name: found.name ?? null, peripheral: found });
                     console.log('[RESULTS][web] recovered device from getDevices:', found.id, found.name);
                  } else {
                     console.warn('[RESULTS][web] lastId no recuperado desde getDevices().');
                  }
               } else {
                  console.warn('[RESULTS][web] navigator.bluetooth.getDevices() no disponible.');
               }
            } catch (e) {
               console.warn('[RESULTS][web] getDevices() failed:', e);
            }
         }

         console.log('[RESULTS][web] devices actuales:', ble.devices);

         // Mapa local de seriales (manufacturerData)
         const localLabels: Record<string, string> = {};

         // Intenta conectar/leer servicios para cada device
         for (const d of ble.devices) {
            try {
               const info = await ble.bleConnection(d.id) as PeripheralInfoUnified;
               // info.serial viene de manufacturerData ASCII (DOSIMAC-[IG]_XXXX)
               if (info.serial) {
                  localLabels[d.id] = info.serial;
                  console.log('[RESULTS][web] serial desde manufacturerData para', d.id, ':', info.serial);
               } else {
                  console.log('[RESULTS][web] SIN serial manufacturerData para', d.id);
               }
            } catch (e) {
               console.warn('[RESULTS][web] connect/read failed:', e);
            } finally {
               await new Promise(r => setTimeout(r, 150));
               try { await ble.bleDisconnection(d.id); } catch { }
            }
         }

         setStatusMsg(null);
         if (cancelled) return;

         // Actualizamos labels de golpe
         setLabels(localLabels);

         const anyOurs = Object.keys(localLabels).length > 0;
         console.log('[RESULTS][web] anyOurs (solo manufacturerData)?', anyOurs);

         setHasDevices(anyOurs);
         setScanning(false);
         setChecked(true);

         if (!anyOurs) {
            setTimeout(() => { if (!cancelled) setVisible(true); }, GRACE_MS);
         }
      };

      run();
      return () => { cancelled = true; };
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [route?.params?.lastId]);

   // ========= RENDER =========

   const RenderIsScanning = () => (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
         <ActivityIndicator size="large" />
         <View>
            <Text style={{ fontFamily: 'Roboto-Ligth', fontSize: 20 }}>
               {t('common:SearchingDevices')}
            </Text>
         </View>
      </View>
   );

   const RenderDevicesNotFound = () => (
      <View style={{ alignItems: 'center', marginVertical: 60 }}>
         <Portal>
            <Dialog visible={visible} onDismiss={hideDialog}>
               <Dialog.Icon icon="warning" color="red" size={60} />
               <Dialog.Title style={{ color: 'red' }}>{t('common:Aviso')}</Dialog.Title>
               <Dialog.Content>
                  <Text variant="bodyLarge">{t('common:No_hay_dispositivos')}</Text>
               </Dialog.Content>
               <Dialog.Actions>
                  <Button onPress={hideDialog}>{t('common:Aceptar')}</Button>
               </Dialog.Actions>
            </Dialog>
         </Portal>
      </View>
   );

   const FullScreenOverlay: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <View style={{
         position: 'absolute',
         top: 0, bottom: 0, left: 0, right: 0,
         backgroundColor: 'rgba(0,0,0,0.25)',
         alignItems: 'center',
         justifyContent: 'center',
         zIndex: 50,
         padding: 18
      }}>
         <View style={{
            backgroundColor: '#fff',
            padding: 18,
            borderRadius: 12,
            minWidth: 240,
            alignItems: 'center'
         }}>
            {children}
         </View>
      </View>
   );

   const renderDevice = (device: BlePeripheral) => {
      let ours: boolean;
      let label: string;

      if (Platform.OS === 'web') {
         // WEB: solo consideramos “nuestros” a los que tienen serial (manufacturerData)
         const serial = labels[device.id];
         ours = !!serial;

         if (!ours) {
            console.log('[RESULTS][web] renderDevice skip (sin serial manufacturerData)', {
               id: device.id,
               name: device.name,
            });
            return null;
         }

         const tail4 = shortLabelFromSerial(serial);
         label = tail4; // BECA / 4286 / etc
         console.log('[RESULTS][web] renderDevice', {
            id: device.id,
            name: device.name,
            ours,
            serial,
            label,
         });
      } else {
         // NATIVO: usar heurística antigua (advertising + OUI)
         ours = isOurs(device);
         if (!ours) return null;

         label = getDeviceLabel(device);
         console.log('[RESULTS][native] renderDevice', {
            id: device.id,
            name: device.name,
            ours,
            label,
         });
      }

      return (
         <View key={device.id} style={{ marginTop: 15 }}>
            <MainButton
               onPress={() =>
                  navigation.navigate('DR-SETUP', { id: device.id, operacion: route.params.operacion })
               }
               label={label}
               size={3}
            />
         </View>
      );
   };

   return (
      <View style={{ flex: 1 }}>
         <Appbar.Header elevated>
            <Appbar.BackAction onPress={navigation.goBack} />
            <Appbar.Content title={t('common:DosimacList')} />
         </Appbar.Header>

         {scanning ? (
            <RenderIsScanning />
         ) : hasDevices ? (
            <View style={{ marginTop: 60, marginHorizontal: 40 }}>
               {ble.devices.map(device => renderDevice(device))}
            </View>
         ) : checked ? (
            <RenderDevicesNotFound />
         ) : null}

         {pairing && (
            <FullScreenOverlay>
               <ActivityIndicator size="large" />
               <Text style={{ marginTop: 12 }}>
                  {t('common:Pairing') || 'Emparejando…'}
               </Text>
            </FullScreenOverlay>
         )}

         {!!statusMsg && (
            <FullScreenOverlay>
               <ActivityIndicator size="large" />
               <Text style={{ marginTop: 12, fontWeight: '600' }}>{statusMsg}</Text>
            </FullScreenOverlay>
         )}
      </View>
   );
};
