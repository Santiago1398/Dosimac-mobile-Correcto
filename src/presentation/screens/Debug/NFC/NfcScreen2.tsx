/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import NfcManager, { NfcEvents, NfcTech } from 'react-native-nfc-manager';
import { globalStyles } from '../../../theme/theme';
import { useNavigation } from '@react-navigation/native';


// Pre-step, call this before any NFC operations
NfcManager.start();


export const NfcScreen2 = () => {

   const [tagId,SetTagId] = useState<string|null>("No data");
   const [tagReadStatus,SetTagReadStatus] = useState<string>(" ");
   const [tagCounter,SetTagCounter] = useState(0);
   const [hasNfc, setHasNFC ] = useState<boolean>(false);
   

   const navigation=useNavigation();
   
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
      NfcManager.setEventListener(NfcEvents.DiscoverTag, (tag) => {
        console.log('tag found')
        SetTagId(tag.id);
        SetTagCounter(a=>a+1);

        console.log(tag)

      })
      return () => {
        NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
      }
    }, [])
  
  
    const doRegisterTagReader=async () => {
      await NfcManager.setEventListener(NfcEvents.DiscoverTag, (tag) => {
         console.log('tag found')
         SetTagId(tag.id);
         SetTagCounter(a=>a+1);
 
         console.log(tag)
 
       })

       await NfcManager.registerTagEvent();
   }

     const readTag = async () => {
      await NfcManager.registerTagEvent();
    }

    const cancelReadTag = async () => {
      NfcManager.unregisterTagEvent().catch(() => 0);
      NfcManager.setEventListener(NfcEvents.DiscoverTag, null);

    }

    
   return (
      <>
      <ScrollView style={styles.wrapper}>
         <TouchableOpacity  
            onPress={readTag}>
            <Text style={globalStyles.primaryText}>Touch to read a Tag</Text>
         </TouchableOpacity>

         <TouchableOpacity  
            onPress={cancelReadTag}>
            <Text style={globalStyles.primaryText}>Touch to cancel read a Tag</Text>
         </TouchableOpacity>         
         <TouchableOpacity  
            onPress={doRegisterTagReader}>
            <Text style={globalStyles.primaryText}>Touch to  read a Tag 2</Text>
         </TouchableOpacity>         

      </ScrollView>
      <View style={styles.container2}>
         <Text style={styles.primaryText}> {tagReadStatus}</Text>
         <Text style={styles.primaryText}> {tagId}</Text>
         <Text style={styles.primaryText}> {tagCounter}</Text>
          <Text style={styles.primaryText}> {hasNfc?"NFC OK":"NFC not ok"}</Text> 
          

      </View>
      </>
   )   
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
   primaryText:{
      fontSize: 20,
      padding:20

   }
 
});