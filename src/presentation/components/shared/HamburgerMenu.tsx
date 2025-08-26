/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable prettier/prettier */
import { DrawerActions, useNavigation } from '@react-navigation/native';
import React, { useEffect } from 'react'
import { Pressable, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { globalColors } from '../../theme/theme';
import { IonIcon } from './IonIcon';

export const HamburgerMenu = () => {

   const navigation=useNavigation()

      useEffect(()=>{

         navigation.setOptions({
            // Icon:()=><Icon name="rocket-outline" size={30} />,
            headerLeft:()=>(
               // <Icon 
               //    style={{paddingLeft:10}}
               //    name="menu-outline" size={25}
               //    onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
               // />
               <Pressable
                  style={{marginLeft:10}}
                  onPress={() => navigation.dispatch(DrawerActions.toggleDrawer)}>
                  <IonIcon name="menu-outline" color={globalColors.primary}  size={35}/>
                  {/* <Text>Menu</Text> */}
               </Pressable>
            ),
         })

      }   
      ,[]);
      
  return ( <></> )
}
