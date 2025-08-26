/* eslint-disable prettier/prettier */
import React, { useEffect } from 'react'
import { Text, View } from 'react-native'
import { farmStore } from '../../../../stores/store';
import { Appbar } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

export const StateViewScreen=({navigation})=> {

   
   const sfarm=farmStore((state)=> state.farm);
   const sfarmId=farmStore((state)=> state.farmId);
   
   const { t } = useTranslation();

   // const loadStore = async () => {
   //    await farmStore.persist.rehydrate();
   //  }
  
   //  useEffect(() => {
  
   //     loadStore();
  
   //  }, [])
       
  return (
   
    <View>
      <Appbar.Header elevated>
        
        <Appbar.BackAction onPress={navigation.goBack} />
        <Appbar.Content title={t('common:EstadoStore')} />
        
      </Appbar.Header>      

      <View style={{padding:20}}>

      <View style={{paddingVertical:0} }>
         <Text style={{fontWeight:'600'}}>Farm info:</Text>
         
         {sfarm?(<Text style={{fontWeight:'600'}}>
         
         {sfarm.id} -- 
         {sfarm.name} --
         {sfarm.location} --
         {sfarm.province} --   
         {sfarm.ssid} -- 
         {sfarm.wifiPassword}  --
         {sfarm.userName} -- 
         {sfarm.password} -- 
         {sfarm.serverIp} -- 
         </Text >
         ):<></>}
         
      </View>
      <View style={{paddingVertical:20}}>
         <Text style={{fontWeight:'800'}}>Farm id:</Text>
         <Text style={{fontWeight:'600'}}>
         {sfarmId}

         </Text>
      </View>
      </View>
    </View>
  )
}
