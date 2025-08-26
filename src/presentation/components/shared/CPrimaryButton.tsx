/* eslint-disable prettier/prettier */
import React from 'react'
import { globalStyles } from '../../theme/theme';
import { Pressable, Text } from 'react-native';


//const navigation=useNavigation();
interface Props {
   onPress:()=>void;
   label:string;
}

export const CPrimaryButton = ({onPress,label}:Props) => {
  return (
   
      <Pressable 
         onPress={() => onPress()}
         android_ripple={{color:'lightgreen'}}
         
         style={globalStyles.primaryButton} >
            
         <Text style={globalStyles.bottonText}>{label}</Text>

      </Pressable> 
      

  )
}
