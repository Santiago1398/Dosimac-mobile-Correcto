/* eslint-disable prettier/prettier */
/* eslint-disable no-trailing-spaces */

import { useNavigation, NavigationProp } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useEffect } from 'react';
import Drnewupdate from '../screens/DosimacRegistration/dr-newupdate1';
import { DRstartscanningScreen } from '../screens/DosimacRegistration/dr-startscanning2';
import { DRScanResultsScreen } from '../screens/DosimacRegistration/dr-scanresults3';
import { TopTabDrSetupNavigator } from './TopTabsDrSetupNavigator copy';
import { DRSetup } from '../screens/DosimacRegistration/dr-setupsetup4';
import Drsuccess from '../screens/DosimacRegistration/dr-success';
// import { DRSetup } from '../screens/DosimacRegistration/dr-setupsetup';

const DRegistationStack = createStackNavigator();


export const DRStackNavigator = ()=> {
   
   const navigator = useNavigation();
   

   useEffect(()=>{
      navigator.setOptions({
        headerShown: false,
         // headerStyle:{
         //     elevation:15,
         // },
        

        
        
      });
  
    }, [navigator] );
       
  return (
   <DRegistationStack.Navigator
      
      screenOptions={
         {
         headerShown: false,
         headerStyle:{
            elevation:5,
         },

      }}
   >

      <DRegistationStack.Screen name="DR-NEWUPDATE" component={Drnewupdate} />
      <DRegistationStack.Screen name="DR-STARTSCAN" component={DRstartscanningScreen} />
      <DRegistationStack.Screen name="DR-SCANRESULTS" component={DRScanResultsScreen} />
      <DRegistationStack.Screen name="DR-SETUP" component={DRSetup} 
            options={{ title: 'Dosimac Setup',headerShown: true, headerLeft:()=>null,headerStyle:{elevation:5} }}
      
      />
      <DRegistationStack.Screen name="DR-SUCCESS" component={Drsuccess} />
      {/* <DRegistationStack.Screen name="DR-SETUP" component={TopTabDrSetupNavigator} 
            options={{ title: 'Dosimac Setup',headerShown: true, headerLeft:()=>null,headerStyle:{elevation:5} }}
            //screenOptions={{}}
      /> */}
      
      
      {/* <DRegistationStack.Screen name="View State" component={StateViewScreen} /> */}


   </DRegistationStack.Navigator>
    
  );
};
