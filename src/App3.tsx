
/// <reference types="nativewind/types" />

/* eslint-disable prettier/prettier */
import { NavigationContainer } from '@react-navigation/native';
import React from 'react'
import { SafeAreaView } from 'react-native';
import { PaperProvider,MD3LightTheme,MD3DarkTheme} from 'react-native-paper';
import { SideMenuNavigator } from './presentation/routes/SideMenuNavigator';

import Icon from 'react-native-vector-icons/MaterialIcons';
import { InicialiceFarmDataTable } from './FarmDB/farmsDB';
import { InicializeProgram } from './sharedTypes/globlaVars';
import { RequestBluetoothPermissions } from './libraries/permissions/permissions'; // Adjust the path accordingly
// import { MD3LightTheme, PaperProvider } from 'react-native-paper';

const theme = {
   ...MD3LightTheme, // or MD3DarkTheme
   colors: {
     ...MD3LightTheme.colors,
     primary: "rgb(0, 104, 116)",//'#3498db',
     secondary: '#f1c40f',
     tertiary: '#a1b2c3',
     brandPrimary: '#fefefe',
     brandSecondary: 'red',     
     primaryContainer:"rgb(120, 69, 172)"
   },
 };
 

export const  App3=()=> {

   InicialiceFarmDataTable();
   RequestBluetoothPermissions();
   // requestBluetoothPermissions();
   return (
     

      <NavigationContainer>
         <PaperProvider
               theme={theme}
               settings={{
               icon:(props)=><Icon {...props} />

            }}
         >

            <SafeAreaView style={{flex:1}}>
               {/* <RequestBluetoothPermissions/>                */}
               <InicializeProgram />
               <SideMenuNavigator/>
            </SafeAreaView>

         </PaperProvider>
      </NavigationContainer>
   )

}

// <Icon name="accessibility-outline"  size={25}/>