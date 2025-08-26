/* eslint-disable prettier/prettier */
import React from 'react';
//import { createMaterialBottomTabNavigator } from 'react-native-paper/react-navigation';
import { BLETestingScreen } from '../screens/Debug/BLETesting/BLETestingScreen';
import { HomeDebugScreen } from '../screens/Debug/HomeDebugScreen/HomeDebugScreen';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { HamburgerMenu } from '../components/shared/HamburgerMenu';
import { NfcScreen } from '../screens/Debug/NFC/NfcScreen';
import { NfcScreen2 } from '../screens/Debug/NFC/NfcScreen2';

//const Tab = createMaterialBottomTabNavigator();
const Tab = createMaterialTopTabNavigator();


export const  TopTabsNavigator=()=> {
  return (
   <>
      <HamburgerMenu/>

      <Tab.Navigator>
         <Tab.Screen name="Home" component={HomeDebugScreen} />
         <Tab.Screen name="BLE testing" component={BLETestingScreen} />
         <Tab.Screen name="NFC test 1" component={NfcScreen} />
         <Tab.Screen name="NFC test 2" component={NfcScreen2} />
      </Tab.Navigator>
      </>
  );
}