/* eslint-disable prettier/prettier */
import React, { useState, useEffect } from 'react';
import { View, Button, FlatList, Text, TouchableOpacity, Pressable, StyleSheet, ScrollView } from 'react-native';
import BleManager from 'react-native-ble-manager';
import { NativeEventEmitter, NativeModules } from 'react-native';
import { Buffer } from 'buffer';
import { useNavigation } from '@react-navigation/native';
import { Parser } from '../../../../libraries/comunications/cti-parser';
//import { msgRequestDosimacStatus } from '../../../../libraries/comunications/ble-messages';
//import { bytesToString } from "convert-string";


const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

type iFrameMsg = {
  data: Buffer,
  length: number
}



interface Peripheral {
  advertising: any;
  id: string;
  name?: string | null;
  connected: boolean;
  peripheral: any;
  services?: any[]; // ← si usas esto más abajo

}

export const BLETestingScreen = () => {
  const [devices, setDevices] = useState<Peripheral[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Peripheral | null>(null);
  const [notifyCounter, setNotifyCounter] = useState(0);
  const [response, setResponse] = useState('');
  const xperipherals = new Map()
  const [connectedDevices, setConnectedDevices] = useState([]);

  const parser = new Parser();


  const navigation = useNavigation();

  //const buffer = Buffer.from([65, 66, 67, 68, 69, 70, 71, 72, 73, 74,65]);
  const buffertest = Buffer.from([66])
  let contador: number = 0;

  const handleBLEDisconection = () => {
    handleDosimacDisconnection();

  }
  useEffect(() => {
    BleManager.start({ showAlert: false });

    bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral);

    return () => {
      bleManagerEmitter.removeAllListeners('BleManagerDiscoverPeripheral');
    };
  }, []);

  useEffect(() => {
    BleManager.start({ showAlert: false });

    bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral);

    return () => {
      bleManagerEmitter.removeAllListeners('BleManagerDiscoverPeripheral');
    };
  }, []);


  useEffect(() => {
    BleManager.start({ showAlert: false }).then(() => {
      console.log('BleManager initialized');
      handleGetConnectedDevices();
    });
  }, []);

  const handleGetConnectedDevices = () => {
    BleManager.getConnectedPeripherals([]).then(results => {
      if (results.length === 0) {
        console.log('No connected bluetooth devices');
      } else {
        for (let i = 0; i < results.length; i++) {
          let xperipheral = results[i];
          ///peripheral.connected = true;
          xperipherals.set(xperipheral.id, xperipheral);
          console.log('Connected bluetooth device', xperipheral);
          setConnectedDevices(Array.from(xperipherals.values()));
        }
        console.log('Number of conected bluetooth devices ' + xperipherals.size)
        xperipherals.forEach(xperipheral => console.log('Advertising::1:: ', xperipheral.advertising.rawData.data))
        xperipherals.forEach(xperipheral => console.log('Name::2:: ', xperipheral.name))
        xperipherals.forEach(xperipheral => console.log('device id::2:: ', xperipheral.id))

      }
    });
  };

  // const handleDiscoverPeripheral = (peripheral: Peripheral) => {
  //   console.log('Got ble peripheral', peripheral);
  //   setDevices((devices) => [...devices, peripheral]);
  // };

  const handleDiscoverPeripheral = (peripheral: Peripheral) => {

    console.log('------------ ');
    console.log('---- Got ble peripheral:::', peripheral);
    setDevices((devices) => {
      if (!devices.some(device => device.id === peripheral.id)) {
        //  BleManager.retrieveServices(peripheral.id);

        console.log('name:: ', peripheral.name)
        console.log('id:: ', peripheral.id)
        console.log('+++++ device::1:: ', peripheral.advertising.rawData)
        console.log('+++++ ADVERTISING::2:: ', peripheral.advertising.rawData.bytes)  //Esto son los datos almacenados en el advertising
        console.log('+++++ device::3:: ', peripheral.advertising.rawData.data)

        const advertising = peripheral.advertising.rawData.bytes.slice(0, 5).toString()
        const compara = [2, 1, 4, 2, 10].toString();
        console.log('+++++ ARRAY :: ', advertising)
        console.log('+++++ COMPARA :: ', compara)

        if (advertising == compara) {
          console.log('++++++++++++++ SON IGUALES +++++++++++++++++++++++++')
          console.log('++++++++++++++ SON IGUALES +++++++++++++++++++++++++')
          console.log('++++++++++++++ SON IGUALES +++++++++++++++++++++++++')
        }


        return [...devices, peripheral];
      } else {
        return devices;
      }
    });
  };

  const handleDevicePress = (device: Peripheral) => {
    BleManager.connect(device.id)
      .then(() => {
        console.log('Connected to ' + device.id);

        return BleManager.retrieveServices(device.id);
      })
      .then((peripheralInfo) => {
        const peripheral: Peripheral = {
          ...peripheralInfo,
          connected: true,
          peripheral: undefined
        };
        setSelectedDevice(peripheral);


        console.log('-------');
        console.log('Peripheral info:', peripheralInfo);

        console.log('Device info:Advert: ', peripheralInfo.advertising);
        console.log('Device info:Chara::', peripheralInfo.characteristics);
        console.log('Device info::Servi::', peripheralInfo.serviceUUIDs);
        console.log('Device info::ServiUUID::', peripheralInfo.services);

        console.log('Device info::name::', peripheralInfo.name);
        console.log('Device info::id::', peripheralInfo.id);

        //BleManager.disconnect(device.id);
      });

  };

  const handleScanPress = () => {
    console.log('Start Scanning...');
    BleManager.scan([], 5, true, { matchMode: 2 }).then(() => {
      console.log('Scanning...');
    });
  };

  const handleStopScanPress = () => {
    console.log("Trying to stopped scanning...");
    BleManager.stopScan().then(() => {
      console.log("Scan stopped");
    });
  };

  const handleClearPress = () => {
    setDevices([]);
    setSelectedDevice(null);
  };


  const handleDosimacConnection = () => {
    if (selectedDevice) {
      BleManager.connect(selectedDevice.id)
        .then(() => {
          console.log('Connected to ' + selectedDevice.id);
        })
        .catch((error) => {
          console.log('Connection error ....', error);
        });
    }
    else {
      console.log('No device selected');
    }


  };

  const sendBtoDevice = () => {

    handleDosimacWrite(buffertest)

  }

  const handleDosimacWrite = (request: Buffer) => {
    console.log("Dosimac write data: ", request)
    console.log("Dosimac write data length: ", request.length)

    if (selectedDevice) {
      BleManager.writeWithoutResponse(
        selectedDevice.id,
        "AFF2",
        "CFF1",
        // encode & extract raw `number[]`.
        // Each number should be in the 0-255 range as it is converted from a valid byte.
        request.toJSON().data,
        512
      )
        .then((data) => {
          // Success code
          console.log("Write/send ble successfull");
          console.log("Write: " + data);
          //handleDosimacDisconnection();
        })
        .catch((error) => {
          // Failure code
          console.log("Write Error... ");
          console.log(error);
          // console.log(buffer.toJSON().data)
        });
    }
    else {
      console.log('No device selected');
    }


  };


  const handleDosimacDisconnection = () => {
    if (selectedDevice) {
      BleManager.disconnect(selectedDevice.id)
        .then(() => {
          console.log('Disconected ' + selectedDevice.id);
          setSelectedDevice(null);
        })
        .catch((error) => {
          console.log('Disconnection error ....', error);

        })
    }
    else {
      console.log('No device selected');
    }


  };


  async function connectAndPrepare(peripheral, service, characteristic) {
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
        setNotifyCounter(notifyCounter + 1);
        const data = value as number[];
        console.log("Data type data: " + typeof (data));
        console.log("Data type value: " + typeof (value));
        console.log('Objet values json: ' + JSON.stringify(value));
        console.log('Objet keys: ' + Object.keys(value));
        console.log('Objet entries: ' + Object.entries(value));
        console.log('Objet values: ' + Object.values(value));
        const buff = Buffer.from(value);
        // const buff1=Buffer.from(Object.values(value));
        console.log('Buffer:: ', buff);
        console.log('Buffer data type: ' + typeof (buff));
        console.log('Buffer str:: ', buff.toString());
        console.log('Buffer size: ' + buff.length);

        // console.log('Buffer1:: ' , buff1);
        // console.log('Buffer1 data type: ' + typeof(buff1));
        // console.log('Buffer1 str:: ',  buff1.toString());
        // console.log('Buffer1 size: ' + buff1.length);

        console.log(`--Received: ${value} for characteristic ${characteristic} from device ${service}`);
        const cadena: string = String.fromCharCode.apply(null, data);
        console.log("Data type cadena: " + typeof (cadena));
        // value.map(citem=>console.log(citem)); 
        setResponse(cadena);
        parser.doParser(buff, buff.length);
        bleResponseClassifier();

        //console.log(`Datos: ${cadena}`);
        console.log(`(${notifyCounter}) ${contador}  ----------------------------------------------------`);
        incrementNotifyCounter();

      }
    );
    // Actions triggereng BleManagerDidUpdateValueForCharacteristic event
  }

  const incrementNotifyCounter = () => {
    //
    contador = contador + 1;
    setNotifyCounter(a => a + 1);

  }

  const SubscribeNotify = () => {
    if (selectedDevice) {

      connectAndPrepare(
        selectedDevice.id,
        "AFF2",
        "CFF5"
      );
    }
  }


  const handleBonding = () => {
    //if (selectedDevice) {
    BleManager.createBond("B0:B2:1C:A0:9D:46")
      .then(() => {
        console.log("createBond success or there is already an existing one");
      })
      .catch(() => {
        console.log("fail to bond");
      });
    // }
    // else {
    //   console.log('No device selected');
    // }    

  }

  const handleMTU = () => {
    if (selectedDevice) {
      BleManager.requestMTU(selectedDevice.id, 512)
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


  //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  //+++BLE COMUNICACION ++++INICIO+++++++++++++++++++++++++++++++++
  //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  const tmsgSendB = () => {

    const data = Buffer.from([66])
    handleDosimacWrite(data);



  }

  const DotmsgDosimacSetup = () => {

  }

  const tmsgDosimacSetup = () => {

    let payLoad: Buffer;
    let buff1: iFrameMsg;
    console.log("Call to tmsgDosimacSetup*****")


    payLoad = payloadSetup()

    console.log("Payload setup: ", payLoad);
    console.log("Payload setup length: ", payLoad.length);


    buff1 = parser.responseContructor(0x1C, 0x02, payLoad, payLoad.length, false);

    console.log("buff1 setup: " + buff1.data.toString('hex'));
    console.log("buff1 setup length: ", buff1.data.length)


    handleDosimacWrite(buff1.data);


  }


  const payloadSetup = (): Buffer => {

    const payLoad = Buffer.alloc(148);

    payLoad.writeUInt16LE(1, 0) //Version
    payLoad.writeUInt16LE(1, 2) //Tipo de informacion=> Setup configuration

    payLoad.write("CTICONTROL_IN", 4, 32, 'utf16le') //ssid unicode 64bytes
    payLoad.write("Free43aba", 68, 32, 'ascii') //password wifi 32bytes
    payLoad.write("192.168.10.70", 100, 32, 'ascii') //ip servidor 32bytes

    payLoad.writeUInt16LE(1, 132) //Tipo de equipo  2 byte
    payLoad.writeUInt8(1, 134) //Fase 1 byte
    payLoad.writeUInt8(1, 135) //Numero de maquina 2 byte

    payLoad.writeInt32LE(0x01020304, 136) //tag ncf 64 bytes //payLoad.writeBigUInt64LE(0x0101010101010101n,136) //tag ncf 64 bytes


    payLoad.writeUInt16LE(278, 144) //corral 2 bytes
    payLoad.writeUInt16LE(9, 146) //reserva 2 bytes


    return payLoad;
  }


  const tmsgRequestDosimacStatus = () => {

    let payLoad: Buffer;
    let buff1: iFrameMsg;
    console.log("Call to tmsgRequestDosimacStatus*****")

    // payLoad=Buffer.from(payLoadRequestDosimacStatus());
    payLoad = payLoadRequestDosimacStatus()

    console.log("Payload: ", payLoad);
    console.log("Payload length: ", payLoad.length);


    buff1 = parser.responseContructor(0x1C, 0x02, payLoad, payLoad.length, false);

    console.log("buff1: " + buff1.data.toString('hex'));
    console.log("buff1 length: ", buff1.data.length)


    handleDosimacWrite(buff1.data);

  }

  const payLoadRequestDosimacStatus = (): Buffer => {

    const payLoad = Buffer.alloc(4);

    payLoad.writeUInt16LE(1, 0) //Version
    payLoad.writeUInt16LE(3, 2) //Tipo de informacion=> Peticion de estado

    return payLoad;


  }

  const bleResponseClassifier = () => {

    console.log("******* RESPUESTA DOSIMAC BLE ******");

    if (parser.frameType === 28) {


      if (!parser.crcOk) {
        console.log("****--- CRC ERRONEO ---***");
      }

      switch (parser.msgType) {
        case 0x01:
          console.log("--- El movil puede enviar datos al dispositivo ---")
          break;
        case 0x02:
          console.log("--- Recibida trama de RESPUESTA de  configuración ---")
          break;
        case 0x03:
          console.log("--- *** Recibida trama de estado *** ---")
          responseStatus();
          break;
        case 0x04:
          console.log("--- Recibida trama Respuesta de peticion de estado ---")
          break;

      }
    }
    else {
      console.log("Error en el tipo de trama. Trama no esperada ", parser.frameType);
    }
  }



  const responseStatus = () => {


    let responseRt: number;

    console.log(parser.payLoad.toString('hex', 0, parser.payLoadSize));

    console.log("Version: ", parser.payLoad.readUint16LE(0).toString(16)) //Version
    console.log("Tipo Informacion: ", parser.payLoad.readUInt16LE(2).toString(16)) //Tipo de informacion=> Setup configuration

    responseRt = parser.payLoad.readUint16LE(0);
    if (responseRt === 2 || responseRt === 4) {
      //Son respuestas sin carga de datos
      return;
    }


    console.log("SSID: ", parser.payLoad.toString("utf16le", 4, 68)) //ssid unicode 64bytes
    console.log("SSID PSW: ", parser.payLoad.toString('ascii', 68, 100)) //password wifi 32bytes
    console.log("IP servidor: ", parser.payLoad.toString('ascii', 100, 132)) //ip servidor 32bytes

    // console.log("SSID: ",parser.payLoad.toString("hex",4,68)) //ssid unicode 64bytes
    // console.log("SSID PSW: ",parser.payLoad.toString('hex',68,100)) //password wifi 32bytes
    // console.log("IP servidor: ",parser.payLoad.toString('hex',100,132)) //ip servidor 32by

    console.log("IP equipo: ", parser.payLoad.toString('ascii', 132, 164)) //ip servidor 32bytes
    console.log("IP Gateway: ", parser.payLoad.toString('ascii', 164, 196)) //ip servidor 32bytes
    console.log("Net mask ", parser.payLoad.toString('ascii', 196, 228)) //ip servidor 32bytes
    console.log("Tipo equipo: ", parser.payLoad.toString('hex', 228, 230))
    console.log("Nu Fase: ", parser.payLoad.toString('hex', 230, 231)) //Fase 1 byte
    console.log("Nu Maquina: ", parser.payLoad.toString('hex', 231, 232)) //Numero de maquina 2 byte
    console.log("Tag NFC: ", parser.payLoad.toString('hex', 232, 240)) //tag ncf 8 bytes
    console.log("Nu corral: ", parser.payLoad.toString('hex', 240, 242)) //corral 2 bytes
    console.log("Estado conexion: ", parser.payLoad.toString('hex', 242, 243)) //Fase 1 byte
    console.log("Estado equipo: ", parser.payLoad.toString('hex', 243, 244)) //Fase 1 byte
    console.log("Id animal: ", parser.payLoad.toString('hex', 244, 248)) //corral 2 bytes
    console.log("Crotal: ", parser.payLoad.toString('hex', 248, 256)) //corral 2 bytes
    console.log("Version SW: ", parser.payLoad.toString('hex', 256, 258)) //reserva 2 bytes
    console.log("Version hW: ", parser.payLoad.toString('hex', 258, 260)) //reserva 2 bytes





    //  console.log("SSID: ",parser.payLoad.toString("utf-16le",4,68)) //ssid unicode 64bytes
    //  console.log("SSID PSW: ",parser.payLoad.toString('ascii',68,100)) //password wifi 32bytes
    //  console.log("IP servidor: ",parser.payLoad.toString('ascii',100,132)) //ip servidor 32bytes
    //  console.log("Nu Fase: ",parser.payLoad.toString('hex',132,134)) 
    //  console.log("Nu Fase: ",parser.payLoad.toString('hex',134)) //Fase 1 byte
    //  console.log("Nu Maquina: ",parser.payLoad.toString('hex',135)) //Numero de maquina 2 byte
    //  console.log("Tag NFC: ",parser.payLoad.toString('hex',136,200)) //tag ncf 64 bytes
    //  console.log("Nu corral: ",parser.payLoad.toString('hex',200,202)) //corral 2 bytes
    //  console.log("Reserva: ",parser.payLoad.toString('hex',202,204)) //reserva 2 bytes

  }

  //++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  //++++++++++++++++++++++++++++++++++++++++++++++++++++++++


  const renderFlatListHeader = () => {

    return (
      <View>
        <Button title="Scan Bluetooth Devices" onPress={handleScanPress} />
        {/* <View style={{ marginTop: 215 }}></View> */}
        <Button title="Stop Scanning" onPress={handleStopScanPress} />
        {/* <View style={{ marginTop: 215 }}></View> */}
        <Button title="Clear Devices" onPress={handleClearPress} />
        <Button title="Connect to DOSIMAC" onPress={handleDosimacConnection} />
        <Button title="Write B to DOSIMAC" onPress={tmsgSendB} />
        <Button title="Request Status to DOSIMAC" onPress={tmsgRequestDosimacStatus} />
        <Button title="DOSIMAC setup configuration" onPress={tmsgDosimacSetup} />


        <Button title="Disconect DOSIMAC" onPress={handleDosimacDisconnection} />
        <Button title="Subscribe DOSIMAC Notify" onPress={SubscribeNotify} />
        {/* <Button title="Set BONDING to DOSIMAC" onPress={handleBonding} /> */}
        <Button title="Set MTU 512" onPress={handleMTU} />
        <Button title="Parser test" onPress={parser.testresponse} />


      </View>
    )

  }

  const renderFlatListFooter = () => {
    return (
      <View style={{ marginHorizontal: 10 }}>
        {selectedDevice && (
          <>
            <Text> </Text>
            <Text >Selected device: {selectedDevice.id}</Text>
            <Text style={styles.secondaryText}>Name: {selectedDevice.name || 'Unnamed'}</Text>
            <Text>UUID: {selectedDevice.id}</Text>
            <Text>Services: {selectedDevice.services.map(service => service.uuid).join(', ')}</Text>
            <Text>Datos recibidos:</Text>
            <Text>{response}</Text>
          </>
        )}
      </View>
    )

  }

  return (
    <View>
      {/* <Button title="Scan Bluetooth Devices" onPress={handleScanPress} />
      <Button title="Stop Scanning" onPress={handleStopScanPress} />
      <Button title="Clear Devices" onPress={handleClearPress} />
      <Button title="Connect to DOSIMAC" onPress={handleDosimacConnection} />
      <Button title="Write to DOSIMAC" onPress={handleDosimacWrite} />
      <Button title="Disconect DOSIMAC" onPress={handleDosimacDisconnection} />
      <Button title="Subscribe DOSIMAC Notify" onPress={SubscribeNotify} />
      <Button title="Set BONDING to DOSIMAC" onPress={handleBonding} />
      <Button title="Set MTU 512" onPress={handleMTU} /> */}

      <View>
        <FlatList
          ListHeaderComponent={renderFlatListHeader}
          ListFooterComponent={renderFlatListFooter}

          data={devices}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <Pressable
              style={styles.botton}
              onPress={() => handleDevicePress(item)}>
              <Text style={styles.primaryText}>{item.name || 'Unnamed'}       {item.id}</Text>
            </Pressable>
          )}

        />
      </View>
      {/* <View>
      <ScrollView>
        {selectedDevice && (
          <>
            <Text> </Text>
            <Text >Selected device: {selectedDevice.id}</Text>
            <Text style={styles.secondaryText}>Name: {selectedDevice.name || 'Unnamed'}</Text>
            <Text>UUID: {selectedDevice.id}</Text>
            <Text>Services: {selectedDevice.services.map(service => service.uuid).join(', ')}</Text>
          </>
        )}
      </ScrollView>

    </View> */}





    </View>
  );
};



const styles = StyleSheet.create({
  botton: {
    backgroundColor: 'lightgray',
    padding: 10,
    borderRadius: 5,
    margin: 6,
    marginHorizontal: 10,
  },
  primaryText: {
    color: 'black',
    fontSize: 13,
  },
  secondaryText: {
    color: 'blue',
    fontSize: 13,
  },
  bottonHeader: {
    backgroundColor: 'blue',
    padding: 0,
    borderRadius: 5,
    margin: 2,
    marginHorizontal: 0,
  },
});

