/* eslint-disable prettier/prettier */
/* eslint-disable no-trailing-spaces */

import { useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useEffect } from 'react';
import { FarmListScreen } from '../screens/FarmRegistration/FarmListScreen';
import { FarmScreen } from '../screens/FarmRegistration/FarmScreen';

const FarmListStack = createStackNavigator();


export const FarmListNavigator = ()=> {
   
   const navigator = useNavigation();
   

   useEffect(()=>{
      navigator.setOptions({
        headerShown: false,      
        
      });
  
    }, [navigator] );
       
  return (
   <FarmListStack.Navigator
      
      screenOptions={
         {
         headerShown: false,
         headerStyle:{
            elevation:5,
         },

      }}
   >

      <FarmListStack.Screen name="Farm list" component={FarmListScreen} />
      
      <FarmListStack.Screen name="Farm detalils" component={FarmScreen} />


   </FarmListStack.Navigator>
    
  );
};
