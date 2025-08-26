import { Buffer } from 'buffer';
import BleManager from 'react-native-ble-manager';
import { NativeEventEmitter, NativeModules } from 'react-native';
import { Parser } from '../../libraries/comunications/cti-parser';
import { pcomProccessResponse, pcomResponseClassifier } from '../../libraries/comunications/dosimacBleMessages';


const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);



//!Vars definitions
export interface BlePeripheral {
  id: string;
  name: string | null;
  advertising?: string | null;
  peripheral: any;
}

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

export const startScanning = () => {
  clearDevices();
  console.log('Start Scanning...');
  BleManager.scan([], 3, false, { matchMode: 2 }).then(() => {
    console.log('Scanning...');
  });
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




export const bleConnection = (id: string) => {
  if (id.length > 0) {
    BleManager.connect(id)
      .then(() => {
        console.log('Connected to ' + id);
        selectedDevice = id;
        return BleManager.retrieveServices(id);
      })
      .then((peripheralInfo) => {
        console.log(peripheralInfo);
      })
      .catch((error) => {
        console.log('Connection error ....', error);
      });
  }
  else {
    console.log('BLEConnection: No device selected');
  }


}

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










