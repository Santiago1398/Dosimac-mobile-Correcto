/* eslint-disable prettier/prettier */
import React, { useEffect } from 'react'
import { Pressable, StatusBar, Text, View } from 'react-native'
import { globalStyles } from '../../../theme/theme'
import { DrawerActions, NavigationProp, useNavigation } from '@react-navigation/native'
import { CPrimaryButton } from '../../../components/shared/CPrimaryButton'
import { HamburgerMenu } from '../../../components/shared/HamburgerMenu'
//import type { RootStackParams } from '../../routes/StackNavigator'

export const  HomeDebugScreen=()=> {

   // const navigation=useNavigation<NavigationProp<RootStackParams>>();
   const navigation=useNavigation();

   // useEffect(()=>{
   //    navigation.setOptions({
   //       headerLeft:()=>(
   //          <Pressable
   //             onPress={()=>navigation.dispatch(DrawerActions.toggleDrawer)}
   //          >
   //             <Text>Menu</Text>
   //          </Pressable>
   //       )
   //    })
   // },[])

  return (
   <>
      <StatusBar
        animated={true}
        backgroundColor="#61dafb"
        barStyle={'dark-content'}
        showHideTransition={'fade'}
        hidden={false}
      //   key={'status-bar-key'}

      />   
    <View style={globalStyles.contanier}>

         {/* <Pressable 
            style={globalStyles.primaryButton}
            onPress={()=>navigation.navigate('BLE Testing' as never)}
         >
            <Text style={globalStyles.bottonText}>BLE debug</Text>
            
         </Pressable> */}
         <HamburgerMenu />

         <CPrimaryButton
            onPress={()=>navigation.navigate('BLE Testing' as never)}
            label='BLE debug'
         />

         <CPrimaryButton
            onPress={()=>navigation.navigate('Tag Reader' as never)}
            label='NFC debug'
         />

         <CPrimaryButton
            onPress={()=>navigation.navigate('Tag Reader2' as never)}
            label='NFC debug v2'
         />

         <CPrimaryButton
            onPress={()=>navigation.navigate('DB Test' as never)}
            label='Database Test'
         />


   </View>
   </>
  )
}
