/* eslint-disable prettier/prettier */
import React from 'react';
//import { createMaterialBottomTabNavigator } from 'react-native-paper/react-navigation';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { HamburgerMenu } from '../components/shared/HamburgerMenu';
import { DRSetup } from '../screens/DosimacRegistration/dr-setupsetup4';
import { DRSetupInfo } from '../screens/DosimacRegistration/dr-setupInfo';

//const Tab = createMaterialBottomTabNavigator();
const TabDr = createMaterialTopTabNavigator();


export const  TopTabDrSetupNavigator=()=> {
  return (
   <>
      {/* <HamburgerMenu/> */}

   

      <TabDr.Navigator
         
     >


         <TabDr.Screen name="DRSETUP" component={DRSetup} 
          options={{ title: 'Setup'}}
            />
         <TabDr.Screen name="DRINFO" component={DRSetupInfo} 
          options={{ title: 'info'}}
         />
         
      </TabDr.Navigator>
      </>
  );
}