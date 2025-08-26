/* eslint-disable prettier/prettier */

import React, { useEffect } from 'react'
import { farmFacility } from './farmInterface';
import { farmStore } from '../stores/store';
import { View } from 'react-native';

// export let globalFarmId:number=0;
//export const isDebugMode: boolean = false;
export const isDebugMode: boolean = false;

export const globals: {
   dispenserType: number,
   farmNumber:number,

} =
{
   dispenserType: 0,
   farmNumber:0,
};

type GlobalVars = {
   farmId: number;
   farmName: string;
   farm: farmFacility;
   coinciden: boolean;
}

export let vglobal: GlobalVars = {
   farmId: 10,
   farmName: '',
   farm: {} as farmFacility,
   coinciden: false,
}  


//Este componente NO VISIBLE los utilizamos para la inicializacion
export const InicializeProgram = () => {

   const loadStore = async () => {
      await farmStore.persist.rehydrate();

   }

   useEffect(() => {

      loadStore();

   }, [])

   return (
      <View>
      </View>
   )
}

