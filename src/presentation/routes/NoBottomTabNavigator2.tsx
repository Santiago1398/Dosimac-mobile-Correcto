/* eslint-disable prettier/prettier */
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Tab1Screen } from '../screens/tabs/Tab1Screen';
import { Tab2Screen } from '../screens/tabs/Tab2Screen';
import { Tab3Screen } from '../screens/tabs/Tab3Screen';
import { globalColors } from '../theme/theme';
import { Text } from 'react-native';
import { TopTabsNavigator } from './TopTabsNavigator';
import { HomeDebugScreen } from '../screens/Debug/HomeDebugScreen/HomeDebugScreen';
import { IonIcon } from '../components/shared/IonIcon';
import { DebugNavigator } from './DebugNavigator';
import { HomeScreen } from '../screens/HomeScreen/HomeScreen';
import { GestationScreen } from '../screens/Gestation/Gestation';
import { MaternityScreen } from '../screens/Maternity/Maternity';
import { MaternityStackNavigator } from './Mat-StackNavigator';

const Tab = createBottomTabNavigator();

export const BottomTabNavigator2 = () => {
  return (
    <Tab.Navigator
      sceneContainerStyle={{
        backgroundColor: globalColors.background,
      }}

      screenOptions={{
        tabBarActiveTintColor: globalColors.primary, //color del icono del tab seleccionado
        headerShown: true,
        tabBarLabelStyle: {
          marginBottom: 5,
        },
        headerStyle: {
          elevation: 0,
        },
        tabBarStyle: {
          borderTopWidth: 0,
          // elevation:0,
          borderColor: 'transparent',
          shadowColor: 'transparent',

        }
      }}


    >
      {/* <Tab.Screen name="Tab1" options={{title:"Inicio",tabBarIcon:({color})=>(<IonIcon name="home-outline" color={color}/>)}} component={Tab1Screen} /> */}
      <Tab.Screen name="Tab1" options={{ title: "Inicio", tabBarIcon: ({ color }) => (<IonIcon name="home-outline" color={color} />) }} component={HomeScreen} />
      {/* <Tab.Screen name="Tab2" options={{title:"Gestacion"}}component={Tab2Screen} /> */}
      <Tab.Screen name="Tab2" options={{ title: "Gestación", tabBarIcon: ({ color }) => (<IonIcon name="people-circle-outline" color={color} />) }} component={GestationScreen} />
      {/* <Tab.Screen name="Tab3" options={{title:"Maternidad"}}component={StackNavigator} /> */}
      {/* <Tab.Screen name="Tab3" options={{title:"Maternidad",tabBarIcon:({color})=>(<IonIcon name="person-circle-outline" color={color}/>)}}component={Tab3Screen} /> */}
      {/* <Tab.Screen name="Tab3" options={{title:"Maternidad",tabBarIcon:({color})=>(<IonIcon name="person-circle-outline" color={color}/>)}}component={HomeDebugScreen} /> */}
      <Tab.Screen name="Tab3" options={{ title: "Maternidad", tabBarIcon: ({ color }) => (<IonIcon name="person-circle-outline" color={color} />) }} component={MaternityStackNavigator} />

    </Tab.Navigator>
  );
};

