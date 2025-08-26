/* eslint-disable no-trailing-spaces */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable prettier/prettier */
import React from 'react';

import { createStackNavigator } from '@react-navigation/stack';
import { HomeDebugScreen } from '../screens/Debug/HomeDebugScreen/HomeDebugScreen';
import { BLETestingScreen } from '../screens/Debug/BLETesting/BLETestingScreen';
import { NfcScreen } from '../screens/Debug/NFC/NfcScreen';
import { NfcScreen2 } from '../screens/Debug/NFC/NfcScreen2';
import DbScreen from '../screens/Debug/database/dbScreen';
import { useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';
import { HomeScreen } from '../screens/HomeScreen/HomeScreen';
import { HamburgerMenu } from '../components/shared/HamburgerMenu';
// import {ProductsScreen} from '../screens/products/ProductsScreen';
// import { SettingsScreen } from '../screens/settings/SettingsScreen';
// import { ProductScreen } from '../screens/products/ProductScreen';

const Stack = createStackNavigator();

export const MainStackNavigator = () => {

  const navigator = useNavigation();

  //to hide de title
  useEffect(() => {
    navigator.setOptions({
      headerShown: false,

    });

  }, []);


  return (
    <Stack.Navigator screenOptions={{
      headerStyle: {
        elevation: 5,
      }

    }}>

      <HamburgerMenu />

      <Stack.Screen name="Home" component={HomeScreen} />

      {/* <Stack.Screen name="BLE Testing" component={BLETestingScreen} />
      
      <Stack.Screen name="Tag Reader" component={NfcScreen} />

      <Stack.Screen name="Tag Reader2" component={NfcScreen2} />

      <Stack.Screen name="DB Test" component={DbScreen} /> */}



    </Stack.Navigator>
  );
}