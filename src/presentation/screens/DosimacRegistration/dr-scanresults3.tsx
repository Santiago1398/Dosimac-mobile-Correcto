import React, { useEffect, useState } from 'react'
import { Pressable, View } from 'react-native'
import { ActivityIndicator, Appbar, Text, Button, useTheme, RadioButton, Card, Portal, Dialog } from 'react-native-paper';
import { MainButton } from '../../components/shared/MainButton '
import { useTranslation } from 'react-i18next'
import { globalStyles } from '../../theme/theme';
import * as ble from '../../../device/ble/bleLibrary';
import { PrimaryButton } from '../../components/shared/PrimaryButton';
// import { useNavigation } from '@react-navigation/native';
// import { bytesToString } from 'convert-string';
import { BlePeripheral } from '../../../device/ble/bleLibrary';

export const DRScanResultsScreen = ({ navigation, route }) => {

   const { t } = useTranslation();
   // const navigation=useNavigation();

   const [scanning, setScanning] = useState(true)
   const [isVisible, setIsVisible] = useState(true);
   const [startState, setStartState] = useState(0);
   const [contadorIntervalo, setContadorIntervalo] = useState(0);
   const [hasDevices, setHasDevices] = useState(false);

   const [visible, setVisible] = React.useState(true);

   const showDialog = () => setVisible(true);

   const hideDialog = () => setVisible(false);
   const deviceMark = [17, 68, 79, 83, 73, 77, 65, 67].toString(); //device.advertising son 10 caracteres

   useEffect(() => {
      console.log("inicio ------");

      ble.BleStart();
      ble.bleAddListener();
      return () => {
         ble.bleRemoveListener();
      }


   }, []);

   //Maquina de estados para el escanedo inicial
   useEffect(() => {
      const incrementCount = () => {
         setStartState(startState + 1);
      };

      const timer = setTimeout(() => {
         if (startState < 2)
            incrementCount()
         else {
            console.log("Inicio finalizado");
            setScanning(false);
            // console.log(ble.devices);
            let cdevices = 0;
            console.log(ble.devices.forEach(device => {
               cdevices++;
               console.log("-----: " + cdevices.toString());
               console.log(device.id);
               console.log(device.name);
               console.log(device);
            }));
            console.log(ble.devices.length);

            ble.devices.forEach(device => { if (device.advertising === deviceMark) setHasDevices(true) });




         }
      }, startBleStateMachine());
      return () => clearTimeout(timer);

   }, [startState])




   const startBleStateMachine = (): number => {
      let tiempo: number = 0;


      switch (startState) {
         case 0:
            tiempo = 500;
            // setStartState(1);
            break;
         case 1:
            ble.startScanning();
            // setStartState(1);
            tiempo = 3000;
            break;
         case 2:
            ble.stopScanning();
            // setStartState(0);
            tiempo = 100;
            break;
         default:
            break;
      }
      console.log("Tiempo: " + tiempo);
      return tiempo;

   }


   // useEffect(() => { 
   //    console.log("DRScanResultsScreen:useEffect called");
   //    console.log(ble.devices);
   //    console.log(ble.devices.length);
   //    console.log(ble.devices[0]);
   //    console.log(ble.devices[0].id);
   //    console.log(ble.devices[0].name);
   //    console.log(ble.devices[0].rssi);
   //    console.log(ble.devices[0].advertising);
   //    console.log(ble.devices[0].advertising.kCBAdvDataManufacturerData);
   //    console.log(ble.devices[0].advertising.kCBAdvDataServiceUUIDs);
   //    console.log(ble.devices[0].advertising.kCBAdvDataServiceData);
   //    console.log(ble.devices[0].advertising.kCBAdvDataLocalName);
   //    console.log(ble.devices[0].advertising.kCBAdvDataTxPowerLevel);
   //    console.log(ble.devices[0].advertising.kCBAdvData
   // } ,[]);

   const RenderIsScanning = () => {

      return (
         <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" />
            <View>

               <Text style={{ fontFamily: 'Roboto-Ligth', fontSize: 20 }}>Buscando equipos...</Text>


            </View>

         </View>
      )
   }

   const dohideDialog = () => {
      setVisible(false);
      navigation.navigate('DR-NEWUPDATE')
   }

   const RenderDevicesNotFound = () => {
      return (
         <View style={{ alignItems: 'center', marginVertical: 60 }}>
            <View>

               {/* <Text style={{ fontFamily: 'Roboto-Ligth', fontSize: 20 }}>No hay dispositivos</Text> */}
               <Portal>
                  <Dialog visible={visible} onDismiss={dohideDialog}>
                     <Dialog.Icon icon="warning" color="red" size={60} />
                     <Dialog.Title style={{ color: 'red' }}>Aviso</Dialog.Title>
                     <Dialog.Content>
                        <Text variant="bodyLarge" >No hay dispositivos</Text>
                     </Dialog.Content>
                     <Dialog.Actions>
                        <Button onPress={dohideDialog}>Aceptar</Button>
                     </Dialog.Actions>
                  </Dialog>
               </Portal>


            </View>

         </View>
      )
   }

   const renderDevice = (device: BlePeripheral) => {
      const milabel: string = device.id.slice(-5)
      const label: string = milabel.replace(":", "");
      // console.log("milabel: ",milabel);
      // console.log("label: ",label);
      console.log("Advertising rendering:", device.advertising);
      // const deviceMark=[17,68,79,83,73,77,65,67].toString(); //device.advertising son 10 caracteres
      if (device.advertising === deviceMark)

         // if (device.name === 'DOSIMAC') 

         // <TabDr.Screen name="DRSETUP" component={DRSetup} />
         return (

            <View key={device.id} style={{ marginTop: 15 }}>
               {/* <Text >{device.id}   {device.name}</Text> */}
               <MainButton onPress={() => navigation.navigate('DR-SETUP', { id: device.id,operacion:route.params.operacion })}
                  label={label}
                  size={3}

               />
               {/* <MainButton onPress={() => navigation.navigate('DR-SETUP', { 
                  screen:'DRSETUP',
                  params:{
                     id: device.id 
                  }
                  })}
                  // label={milabel.trimEnd().slice(-7)}
                  label={label}

                  size={3}
               /> */}
            </View>

         )
   }

   return (
      <View style={{ flex: 1 }}>

         <Appbar.Header elevated>

            <Appbar.BackAction onPress={navigation.goBack} />
            <Appbar.Content title={t('common:DosimacList')} />
            {/* <Appbar.Action icon="add" onPress={() => {}} /> */}
         </Appbar.Header>



         {scanning &&
            <RenderIsScanning />
         }
         {!scanning && (
            hasDevices ? (
               <View style={{ marginTop: 60, marginHorizontal: 40 }}>
                  {ble.devices.map(device => renderDevice(device))}
               </View>
            ) : (
               <View>
                  <RenderDevicesNotFound />
               </View>
            ))
         }


      </View>

   )
}
