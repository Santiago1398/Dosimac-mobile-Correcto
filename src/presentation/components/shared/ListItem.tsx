import { View, Text, Pressable } from 'react-native'
import React from 'react'
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import {clsx} from 'clsx';

//Dhttps://ionic.io/ionicons

const isNumeric = function(obj: any){
   return !Array.isArray( obj ) && (obj - parseFloat( obj ) + 1) >= 0;
 }


interface Props {
   onPress: () => void;
   label: string;
   icon: string;
   value: string;
   hasNavigation?: boolean;
   signalInfo?: boolean;
}
 
export const ListItem = ({ icon, label, value, onPress,hasNavigation=false,signalInfo=true }: Props) => {
   const { t } = useTranslation();
   let iValue:number;

   if (isNumeric(value)) 
      iValue=parseFloat(value)
   else
      iValue=0;

   

   return (
      <View className='bg-gray-00 rounded-lg  '>

         <Pressable className='active:bg-white py-2 rounded-lg mx-2' onPress={onPress}>
            <View className='flex-row pl-2 justify-between ' >
               <View className='flex-row'>
                  <Icon name={icon} size={20} color="black" style={{ paddingTop: 4 }} />
                  <Text className="pl-2 text-lg text-gray-900 font-normal h-10 justify-center tracking-tighter "> {label}</Text>
               </View>
               <View className='flex-row'>
                  <Text 
                     className={clsx("pl-2 text-xl font-normal h-10 justify-center tracking-tighter pr-5  text-slate-600", {
                     "text-red-800": iValue>0 && signalInfo,
                     })}> {value}</Text>
                  <Icon name="chevron-forward-outline" size={18} color="grey" style={{ paddingTop: 4, opacity: (hasNavigation ? 1 : 0) }} />

               </View>
            </View>
         </Pressable>
      </View>
   )
}