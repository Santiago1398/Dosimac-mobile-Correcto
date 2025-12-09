import { Buffer } from 'buffer';
import BleManager from 'react-native-ble-manager';
import { NativeEventEmitter, NativeModules } from 'react-native';
import { Parser } from '../../libraries/comunications/cti-parser';
import { pcomProccessResponse, pcomResponseClassifier } from '../../libraries/comunications/dosimacBleMessages';
import { PeripheralInfoUnified } from '../../sharedTypes/types';


const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);



//!Vars definitions
export interface BlePeripheral {
  id: string;
  name: string | null;
  advertising?: string | null;
  peripheral: any;
}

export type PeripheralInfo = {
  id: string;
  name: string | null;
  services: string[];
  serial?: string | null; // <-- añade este opcional
};


export let devices: BlePeripheral[];
export let conectedDevices: BlePeripheral[];

// let selectedDevice:Peripheral | null;
let selectedDevice: any | null;

const buffer = Buffer.from([66])  //Esto es una B
let contador: number = 0;

//const parser=new Parser();


//!Implementations

export const BleStart = () => {
  console.log("BleStart called");
  clearDevices();
  BleManager.start({ showAlert: false });
}

export const bleAddListener = () => {
  bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral);
}

export const bleRemoveListener = () => {
  bleManagerEmitter.removeAllListeners('BleManagerDiscoverPeripheral');
}

// añade un tipo compartido arriba (opcional)
export type ScanMode = "any" | "dosimac";

// Acepta un parámetro opcional aunque no lo uses en nativo
export const startScanning = (mode?: ScanMode) => {
  clearDevices();
  console.log('Start Scanning...', mode); // ignorado en nativo
  BleManager.scan([], 3, false, { matchMode: 2 }).then(() => {
    console.log('Scanning...');
  });
  return Promise.resolve(undefined); // para compatibilidad con web
};


const handleDiscoverPeripheral = (peripheral: BlePeripheral) => {
  console.log('Got ble peripheral', peripheral);
  if (!devices.some(device => device.id === peripheral.id)) {
    const peritemp: BlePeripheral = {
      id: peripheral.id,
      name: peripheral.name,
      //Utilizamos 10 digitos del advertising para identificar el equipo
      advertising: (peripheral.advertising as any)?.rawData?.bytes?.slice(0, 8)?.toString(),
      peripheral: peripheral,
    }
    // devices.push(peripheral);
    devices.push(peritemp);
  }

};



export const stopScanning = () => {
  console.log("Trying to stopped scanning...");
  BleManager.stopScan().then(() => {
    console.log("Scan stopped");
  });
};

const clearDevices = () => {
  devices = [];
  selectedDevice = null;
};





export const bleConnection = async (id: string): Promise<PeripheralInfoUnified> => {
  if (!id) throw new Error('BLEConnection: No device selected');

  await BleManager.connect(id);
  console.log('Connected to ' + id);

  // MUY IMPORTANTE: algunos stacks requieren un pequeño delay antes de retrieveServices
  await new Promise(r => setTimeout(r, 150));

  const peripheralInfo: any = await BleManager.retrieveServices(id);
  // Normaliza servicios a string lowercase
  const services: string[] = Array.isArray(peripheralInfo?.services)
    ? peripheralInfo.services.map((s: any) =>
      (s?.uuid ?? String(s)).toString().toLowerCase()
    )
    : [];

  // Si más adelante lees el serial en nativo, ponlo aquí; de momento null
  const serial: string | null = null;

  // Nombre si lo tienes cacheado
  const name: string | null =
    peripheralInfo?.advertising?.localName ??
    peripheralInfo?.name ??
    null;

  return {
    id,
    name,
    services,
    serial,
  };
};


export const bleSubscribeGeneric = async (
  serviceUUID: string,
  characteristicUUID: string,
  onValue: (value: number[]) => void
) => {
  if (!selectedDevice) throw new Error('No device selected');

  // listener SOLO para ese device/servicio/char
  const listener = bleManagerEmitter.addListener(
    'BleManagerDidUpdateValueForCharacteristic',
    ({ value, peripheral, characteristic, service }) => {
      const sameDev = peripheral?.toLowerCase?.() === selectedDevice?.toLowerCase?.();
      const sameSvc = service?.toLowerCase?.() === serviceUUID?.toLowerCase?.();
      const sameChr = characteristic?.toLowerCase?.() === characteristicUUID?.toLowerCase?.();
      if (sameDev && sameSvc && sameChr) {
        onValue(value as number[]);
      }
    }
  );

  // habilita notificaciones
  await BleManager.startNotification(selectedDevice, serviceUUID, characteristicUUID);

  // devuelve handle para limpiar
  return {
    remove: async () => {
      try { await BleManager.stopNotification(selectedDevice!, serviceUUID, characteristicUUID); } catch { }
      try { listener.remove(); } catch { }
    }
  };
};



export const blehandleMTU = () => {
  if (selectedDevice) {
    BleManager.requestMTU(selectedDevice, 512)
      .then((mtu) => {
        // Success code
        console.log("MTU size changed to " + mtu + " bytes");
      })
      .catch((error) => {
        // Failure code
        console.log(error);
      });
  }
}

//*Con esta funcion envio la informacón al dosimac
export const bleDosimacWrite = (request: Buffer) => {
  if (selectedDevice) {
    BleManager.writeWithoutResponse(
      selectedDevice,
      "AFF2",
      "CFF1",
      // encode & extract raw `number[]`.
      // Each number should be in the 0-255 range as it is converted from a valid byte.
      request.toJSON().data,
      512
    )
      .then(() => {
        // Success code
        console.log("** Write Success**: ");

      })
      .catch((error) => {
        // Failure code
        console.log("Write Error... ");
        console.log(error);
        console.log(buffer.toJSON().data)

      });
  }
  else {
    console.log('bleDosimacWrite: No device selected');
  }


};

export const bleDisconnection = (id: string) => {
  if (id.length > 0) {
    BleManager.disconnect(id)
      .then(() => {
        console.log('Disconected ' + id);
        selectedDevice = null;
      })
      .catch((error) => {
        console.log('Disconnection error ....', error);

      })
  }
  else {
    console.log('bleDisconnection: No device selected');
  }


};



//Me suscribo a la notificicaicones para obtener respuesta de equipo
export const bleSubscribeNotify = () => {
  if (selectedDevice) {

    connectAndPrepare(
      selectedDevice,
      "AFF2",
      "CFF5"
    );
  }
}


type ConnCb = (id: string) => void;
type DiscCb = (id: string, error?: any) => void;

export const addConnectionListeners = (onConnect: ConnCb, onDisconnect: DiscCb) => {
  const subConn = bleManagerEmitter.addListener(
    'BleManagerConnectPeripheral',
    ({ peripheral }) => onConnect?.(peripheral)
  );
  const subDisc = bleManagerEmitter.addListener(
    'BleManagerDisconnectPeripheral',
    ({ peripheral, error }) => onDisconnect?.(peripheral, error)
  );
  return () => { try { subConn.remove(); } catch { } try { subDisc.remove(); } catch { }; };
};

export const addBtStateListener = (onState: (state: string) => void) => {
  const sub = bleManagerEmitter.addListener('BleManagerDidUpdateState', ({ state }) => onState?.(state));
  return () => { try { sub.remove(); } catch { } };
};

export const bleIsConnected = async (id: string) => {
  try { return await BleManager.isPeripheralConnected(id, []); } catch { return false; }
};



async function connectAndPrepare(peripheral: any, service: string, characteristic: string) {
  // Connect to device
  await BleManager.connect(peripheral);
  // Before startNotification you need to call retrieveServices
  await BleManager.retrieveServices(peripheral);
  // To enable BleManagerDidUpdateValueForCharacteristic listener
  await BleManager.startNotification(peripheral, service, characteristic);
  // Add event listener
  bleManagerEmitter.addListener(
    "BleManagerDidUpdateValueForCharacteristic",
    ({ value, peripheral, characteristic, service }) => {


      // Convert bytes array to string
      //const data = bytesToString(value);
      // setNotifyCounter(notifyCounter + 1);
      const data = value as number[];  //! Datos recibidos
      console.log(`Received ${data} for characteristic ${characteristic}`);
      const cadena: string = String.fromCharCode.apply(null, data);

      console.log(`Datos: ${cadena}`);
      // console.log(`(${notifyCounter}) ${contador}  ----------------------------------------------------`);
      incrementNotifyCounter();

      //creo un buffer con la respuesta, lo parse y envio al clasificador del mensaje
      const buff = Buffer.from(value);
      // console.log(buff.toString());
      pcomProccessResponse(buff, buff.length);
      // parser.doParser(buff,buff.length);
      // pcomResponseClassifier();

    }
  );
  // Actions triggereng BleManagerDidUpdateValueForCharacteristic event
}

const incrementNotifyCounter = () => {
  //
  contador = contador + 1;
  // setNotifyCounter(a=>a+1);

}



// export function readSerialLabel(id: string) {
//   throw new Error('Function not implemented.');
// }
// export function readSerialLabel(id: string) {
//   throw new Error('Function not implemented.');
// }
