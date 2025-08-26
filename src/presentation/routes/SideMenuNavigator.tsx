/* eslint-disable react-native/no-inline-styles */
/* eslint-disable no-trailing-spaces */
/* eslint-disable prettier/prettier */
import React from 'react';
import { DrawerContentComponentProps, DrawerContentScrollView, DrawerItem, DrawerItemList, createDrawerNavigator } from '@react-navigation/drawer';
import { globalColors } from '../theme/theme';
import { Linking, View, useWindowDimensions } from 'react-native';
import { BottomTabNavigator } from './BottomTabNavigator';
import { IonIcon } from '../components/shared/IonIcon';
import { Divider } from 'react-native-paper';
import { LoginScreen } from '../screens/login/login';
import { LanguageSettingsScreen } from '../screens/settings/Languagesettings';
import { useTranslation } from 'react-i18next';
import { FarmListNavigator } from './FarmListNavigator';
import { DebugNavigator } from './DebugNavigator';
import { MaintenaceStackNavigator } from './MaintenaceStackNavigator';
import { DRStackNavigator } from './dr_StackNavigator';
import { isDebugMode } from '../../sharedTypes/globlaVars';



const Drawer = createDrawerNavigator();


export const SideMenuNavigator = () => {

   const dimensions = useWindowDimensions();
   const { t } = useTranslation();




   return (
      <Drawer.Navigator


         drawerContent={(props) => <CustomDrawerContent {...props} />}
         // initialRouteName={'Debug'}



         screenOptions={{
            headerShown: false,
            drawerType: 'slide',


            drawerActiveBackgroundColor: globalColors.primary,
            drawerActiveTintColor: 'white',
            drawerInactiveTintColor: globalColors.primary,

            drawerStyle: {
               marginTop: 30,
               //flex:1,
               //flexDirection:'row-reverse',


            },

            drawerItemStyle: {
               borderRadius: 100,
               paddingHorizontal: 20,
               // marginTop:5,
            }
         }}

      >

         {/* drawerContent={ (props)=><CustomDrawerContent {...props} /> } */}

         {/* <Drawer.Screen name="Home" component={StackNavigator} /> */}
         {/* <Drawer.Screen options={{ drawerIcon:({color})=>(<IonIcon name="folder-open" color={color}/>)}} name="Tabs" component={BottomTabNavigator} /> */}

         <Drawer.Screen options={{ drawerIcon: ({ color }) => (<IonIcon name="home-outline" color={color} />) }} name={t('common:Tabs')} component={BottomTabNavigator} />

         {/* <Drawer.Screen options={{drawerIcon:({color})=>(<IonIcon name="bluetooth" color={color}/>)}} name="BLE Testing" component={BLETestingScreen} /> */}

         {/* <Drawer.Screen options={{drawerIcon:({color})=>(<IonIcon name="airplane" color={color}/>)}} name="Farm List" component={FarmListScreen} /> */}
         
         <Drawer.Screen options={{ drawerIcon: ({ color }) => (<IonIcon name="add-outline" color={color} />) }} name={t('common:DosimacRegistration')} component={DRStackNavigator} />
         <Drawer.Screen options={{ drawerIcon: ({ color }) => (<IonIcon name="document-text-outline" color={color} />) }} name={t('common:Lista_instalaciones')} component={FarmListNavigator} />


         {/* <Drawer.Screen options={{drawerIcon:({color})=>(<IonIcon name="airplane" color={color}/>)}} name="Farm Settings" component={FarmScreen} /> */}
         {isDebugMode && (
            <>
               <Drawer.Screen options={{ drawerIcon: ({ color }) => (<IonIcon name="log-in-outline" color={color} />) }} name="Login" component={LoginScreen} />

               <Drawer.Screen options={{ drawerIcon: ({ color }) => (<IonIcon name="chatbubbles-outline" color={color} />) }} name="Language Settings" component={LanguageSettingsScreen} />
            </>
         )}
         {isDebugMode && (
            <>
               <Drawer.Screen options={{ drawerItemStyle: { marginTop: 40, paddingHorizontal: 20, }, drawerLabel: "Debug options", drawerIcon: ({ color }) => (<IonIcon name="bug-outline" color={color} />) }} name="Debug" component={DebugNavigator} />
               <Drawer.Screen options={{ drawerIcon: ({ color }) => (<IonIcon name="build-outline" color={color} />) }} name={t('common:Maintenance')} component={MaintenaceStackNavigator} />
            </>
         )}



      </Drawer.Navigator>
   );
};

const CustomDrawerContent = (props: DrawerContentComponentProps) => {
   // const navigation=useNavigation();
   return (

      <DrawerContentScrollView style={{ flex: 1, flexDirection: 'column' }} {...props}>
         {/* <View style={{
            height:200,
            backgroundColor:globalColors.primary,
            margin:30,
            borderRadius:50,

         }}
         /> */}
         {/* <DrawerItemList {...props} /> */}
         <View style={{ flex: 1 }}>

            <DrawerItemList {...props} />

         </View>

         {/* <Text>HOla</Text> */}

         {isDebugMode && (
            <View style={{ flex: 1, backgroundColor: 'white', marginTop: 300 }}>
               <Divider />

               <DrawerItem
                  // style={{flexDirection:'column-reverse'}}
                  label="CTIcontrol"
                  onPress={() => Linking.openURL('https://www.cticontrol.com')}
               //   onPress={() => navigation.navigate('Home Debug' as never)}

               />
               {/* <Button 
               title="Go somewhere" 
                  onPress={() => {
                  // Navigate using the `navigation` prop that you received
                  props.navigation.navigate('BLE Testing');
                  // props.navigation.navigate('Tag Reader');
                  
                  //HomeDebugScreen()

                  
               }}
            />
             */}
            </View>
         )}

      </DrawerContentScrollView>
   )

}