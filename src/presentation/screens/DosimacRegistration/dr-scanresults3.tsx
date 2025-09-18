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
import { Buffer } from 'buffer';


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
   const NEEDLES_ASCII: number[][] = [
      [68, 79, 83, 73, 77, 65, 67], // "DOSIMAC"
   ];
   const ALLOWED_OUIS = ['E8:6B:EA'];

   const deviceMark = [17, 68, 79, 83, 73, 77, 65, 67].toString(); //device.advertising son 10 caracteres

   function includesSubsequence(h: number[], n: number[]) {
      outer: for (let i = 0; i <= h.length - n.length; i++) {
         for (let j = 0; j < n.length; j++) {
            if ((h[i + j] & 0xff) !== (n[j] & 0xff)) continue outer;
         }
         return true;
      }
      return false;
   }
   function includesAnyNeedle(bytes: number[], needles: number[][]) {
      for (const n of needles) if (includesSubsequence(bytes, n)) return true;
      return false;
   }

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

   // ===== 5) Filtros de pertenencia (primero advertising; si no, OUI) =====
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

   function isOurs(d: BlePeripheral): boolean {
      const bytes = getAdvBytes(d);
      if (Array.isArray(bytes) && bytes.length) {
         return includesAnyNeedle(bytes, NEEDLES_ASCII); // ← SOLO DOSIMAC
      }
      return macHasAllowedPrefix(d.id);
   }

   // ===== 6) Etiqueta corta desde MAC (últimos 2 octetos, ej. "CBCA") =====
   function getDeviceLabel(d: BlePeripheral): string {
      const id = d.id || '';
      const mac = id.includes(':')
         ? id.split(':').slice(-2).join('')
         : id.replace(/[^0-9A-Fa-f]/g, '').slice(-4);
      return mac ? mac.toUpperCase() : 'UNKN';
   }

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
      const timer = setTimeout(() => {
         if (startState < 2) {
            setStartState(startState + 1);
         } else {
            console.log('Inicio finalizado');
            setScanning(false);

            // ⬇⬇⬇ Pega aquí el bloque ⬇⬇⬇
            const found = ble.devices.some(isOurs);
            setHasDevices(found);

            // (opcional) debug
            ble.devices.forEach((device, idx) => {
               const adv = getAdvBytes(device) ?? [];
               console.log(`-----: ${idx + 1}`);
               console.log('ID:', device.id, 'NAME:', device.name ?? 'null');
               console.log('ADV BYTES:', adv);
            });
            // ⬆⬆⬆ Fin del bloque ⬆⬆⬆
         }
      }, startBleStateMachine());

      return () => clearTimeout(timer);
   }, [startState]);




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

               <Text style={{ fontFamily: 'Roboto-Ligth', fontSize: 20 }}>{t('common:SearchingDevices')}</Text>


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
                     <Dialog.Title style={{ color: 'red' }}>{t('common:Aviso')}</Dialog.Title>
                     <Dialog.Content>
                        <Text variant="bodyLarge" >{t('common:No_hay_dispositivos')}</Text>
                     </Dialog.Content>
                     <Dialog.Actions>
                        <Button onPress={dohideDialog}>{t('common:Aceptar')}</Button>
                     </Dialog.Actions>
                  </Dialog>
               </Portal>


            </View>

         </View>
      )
   }

   const renderDevice = (device: BlePeripheral) => {
      if (!isOurs(device)) return null;         // ← SOLO DOSIMAC
      const label = getDeviceLabel(device);     // ← "CBCA" desde MAC
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
