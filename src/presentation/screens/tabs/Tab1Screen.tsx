/* eslint-disable prettier/prettier */
import { DrawerActions, useNavigation } from '@react-navigation/native'
import React, { useEffect } from 'react'
import { Pressable } from 'react-native'
import { Text, View } from 'react-native'
import { HamburgerMenu } from '../../components/shared/HamburgerMenu'

import Icon from 'react-native-vector-icons/Ionicons';
// const myIcon = <Icon name="rocket" size={30} color="#900" />;

export const Tab1Screen = () => {

   // const navigation=useNavigation()

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

   // }   
   // ,[]);

   return (
      <View>
         <HamburgerMenu />
         <Text>

            TAb1Screen

         </Text>
         {/* <Icon name="rocket-outline" size={30} color="#900" /> */}
      </View>
   )
}
