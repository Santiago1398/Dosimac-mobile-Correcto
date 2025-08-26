/* eslint-disable prettier/prettier */
import React from 'react'
import { globalStyles } from '../../theme/theme';
import { Pressable, Text } from 'react-native';
import { Button, MD3Theme, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';




//const navigation=useNavigation();
//const navigation=useNavigation();
interface Props {
   onPress: () => void;
   label: string;
   size?: number;
}

export const MainButton = ({ onPress, label,size }: Props) => {
   const { t } = useTranslation();
   const theme = useTheme<MD3Theme>();
   
   let myls = { lineHeight: 40, fontFamily: "Poppins-Medium", fontSize: 16 }; // Declare and assign a default value to myls variable

   if (size != null) {
      switch (size) {
         case 0:
            myls = { lineHeight: 40, fontFamily: "Poppins-Medium", fontSize: 16 }; // Update myls variable if xsize is null
         break;
         case 1:
            myls = { lineHeight: 60, fontFamily: "Poppins-Medium", fontSize: 30 }; // Declare and assign a default value to myls variable
         break;
         case 2:
            myls = { lineHeight: 80, fontFamily: "Segment7-4Gml", fontSize: 54 }; // Declare and assign a default value to myls variable
         break;
         case 3:
            myls = { lineHeight: 80, fontFamily: "Segment7-4Gml", fontSize: 66,  }; // Declare and assign a default value to myls variable
         break;

      }
   }
   return (

      <Button mode="contained" onPress={onPress}
         textColor='white'
         rippleColor={theme.colors.primary}
         // buttonColor='theme.colors.primary'
         disabled={false}
         // labelStyle={{ lineHeight: 40, fontFamily: "Poppins-Medium", fontSize: 16 }}
         labelStyle={myls}
         // theme={theme}
      >

         {/* {t('common:NewDmMaternity')} */}
         {t(label)}
      </Button>





   )
}
