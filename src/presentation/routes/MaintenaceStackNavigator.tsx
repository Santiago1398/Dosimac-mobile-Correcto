/* eslint-disable prettier/prettier */
/* eslint-disable no-trailing-spaces */

import { useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useEffect } from 'react';
import { FarmListScreen } from '../screens/FarmRegistration/FarmListScreen';
import { FarmScreen } from '../screens/FarmRegistration/FarmScreen';
import { MaintenanceScreen } from '../screens/Debug/Maintenance/MaintenaceScreen';
import { StateViewScreen } from '../screens/Debug/stateView/stateViewScreen';

const MaintenanceStack = createStackNavigator();


export const MaintenaceStackNavigator = ()=> {
   
   const navigator = useNavigation();
   

   useEffect(()=>{
      navigator.setOptions({
        headerShown: false,      
        
      });
  
    }, [navigator] );
       
  return (
   <MaintenanceStack.Navigator
      
      screenOptions={
         {
         headerShown: false,
         headerStyle:{
            elevation:5,
         },

      }}
   >

      <MaintenanceStack.Screen name="Maintenace" component={MaintenanceScreen} />
      
      <MaintenanceStack.Screen name="View State" component={StateViewScreen} />


   </MaintenanceStack.Navigator>
    
  );
};
