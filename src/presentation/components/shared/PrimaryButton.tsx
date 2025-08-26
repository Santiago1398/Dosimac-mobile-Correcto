/* eslint-disable prettier/prettier */
import React from 'react'
import { globalStyles } from '../../theme/theme';
import { Pressable, Text } from 'react-native';
import { Button, MD3Theme, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';




//const navigation=useNavigation();
interface Props {
   onPress: () => void;
   label: string;
}

export const PrimaryButton = ({ onPress, label }: Props) => {
   const { t } = useTranslation();
   const theme = useTheme<MD3Theme>();
   return (

      <Button mode="contained" onPress={() => { }}
         textColor='white'
         rippleColor={theme.colors.primary}
         // buttonColor='theme.colors.primary'
         disabled={false}
         labelStyle={{ lineHeight: 25, fontFamily: "Poppins-Bold", fontSize: 18 }}
         // theme={theme}
      >

         {/* {t('common:NewDmMaternity')} */}
         {t(label)}
      </Button>





   )
}
