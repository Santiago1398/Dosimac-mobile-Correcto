/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Pressable, ScrollView } from 'react-native';
import NfcManager, { NfcEvents, NfcTech } from 'react-native-nfc-manager';
import { globalStyles } from '../../../theme/theme';
import { useNavigation } from '@react-navigation/native';


// // Pre-step, call this before any NFC operations
// NfcManager.start();


export const NfcScreen = () => {

   const [tagId, SetTagId] = useState<string | null>("No data");
   const [tagReadStatus, SetTagReadStatus] = useState<string>(" ");
   const [tagCounter, SetTagCounter] = useState(0);
   const [hasNfc, setHasNFC] = useState<boolean>(false);


   const navigation = useNavigation() as any;


   async function readNdef() {

      if (!hasNfc) return;

      try {
         SetTagId(" ");
         SetTagReadStatus("...Reading...");
         await NfcManager.requestTechnology(NfcTech.Ndef);
         // the resolved tag object will contain `ndefMessage` property
         const tag = await NfcManager.getTag();
         SetTagId(tag.id);
         SetTagCounter(tagCounter + 1);

         console.log(tag)
         SetTagReadStatus(" ");
         //console.warn('Tag found', tag);
      } catch (ex) {
         console.log('Oops!', ex);
      } finally {
         // stop the nfc scanning
         NfcManager.cancelTechnologyRequest();
      }
   }

   const doRegisterTagReader = async () => {
      await NfcManager.setEventListener(NfcEvents.DiscoverTag, (tag) => {
         console.log('tag found')
         SetTagId(tag.id);
         SetTagCounter(tagCounter + 1);

         console.log(tag)

      })

      await NfcManager.registerTagEvent();
   }

   useEffect(() => {
      NfcManager.setEventListener(NfcEvents.DiscoverTag, (tag) => {
         console.log('tag found')
         SetTagId(tag.id);
         SetTagCounter(a => a + 1);

         console.log(tag)

      })


      return () => {
         NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
      }
   }, [])



   const readTag = async () => {
      await NfcManager.registerTagEvent();
   }

   const cancelReadTag = async () => {
      await NfcManager.registerTagEvent();
   }


   useEffect(() => {
      const checkIsSupported = async () => {
         const deviceIsSupported = await NfcManager.isSupported()

         setHasNFC(deviceIsSupported)
         console.log(deviceIsSupported)
         if (deviceIsSupported) {
            await NfcManager.start()
         }
      }

      checkIsSupported()
   }, [])

   useEffect(() => {
      const unsubscribe = navigation.addListener('transitionStart', (e) => {
         // Do something
         console.log('transitionEnd');
         if (e.data.closing) {
            console.log('closing');
            NfcManager.cancelTechnologyRequest();

            NfcManager.unregisterTagEvent().catch(() => 0);
            NfcManager.setEventListener(NfcEvents.DiscoverTag, null);



            //handleDosimacDisconnection();
         }
      });

      return unsubscribe;
   }, [navigation]);



   return (
      <>
         <ScrollView style={styles.wrapper}>
            <TouchableOpacity
               onPress={readNdef}>
               <Text style={globalStyles.primaryText}>Touch to read a Tag</Text>
            </TouchableOpacity>

            <TouchableOpacity
               onPress={readTag}>
               <Text style={globalStyles.primaryText}>Touch to read a Tag 2</Text>
            </TouchableOpacity>
            <Pressable
               onPress={() => { SetTagId(" "); SetTagCounter(3) }}
            >
               <Text> Clear tag</Text>
            </Pressable>
         </ScrollView>
         <View style={styles.container2}>
            <Text style={styles.primaryText}> {tagReadStatus}</Text>
            <Text style={styles.primaryText}> {tagId}</Text>
            <Text style={styles.primaryText}> {tagCounter}</Text>
            <Text style={styles.primaryText}> {hasNfc ? "NFC OK" : "NFC not ok"}</Text>


         </View>
      </>
   )
}

const HasNfcError = (error: boolean): string => {
   return error ? "NFC suppported" : "NFC not supported"
   // if (!error)
   //    return "NFC not suppported"
   // else
   //    return "NFC supported"


}

const styles = StyleSheet.create({
   wrapper: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',

   },
   container2: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#FFCFF',
   },
   primaryText: {
      fontSize: 20,
      padding: 20

   }

});