/* eslint-disable prettier/prettier */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { farmFacility } from '../sharedTypes/farmInterface';
import { GetFarmDataById } from '../FarmDB/farmsDB';
import { AsyncLocalStorage } from 'async_hooks';
import AsyncStorage from '@react-native-async-storage/async-storage';



interface appInfo {
   farm:farmFacility ;
   farmId:number;
   farmDataChange:boolean;
   setFirstElement:boolean;
   farmsAmount:number;
}

interface farmActions {
   UseSetFarm:(farm?:farmFacility )=>void
   UseSetFarmId:(id:number)=>void
   resetFarm:()=>void
   UseSetNewFarm:(id:number)=>void
   UsesetFarmDataChange:()=>void
   UseSetFirstElement:(val:boolean)=>void
   UseSetFarmsAmount:(amount:number)=>void
}
export const farmStore = create<appInfo&farmActions>()(

   persist(

      (set) =>({

         farm: undefined,
         farmId:0,
         farmDataChange:false,
         setFirstElement:false,
         farmsAmount:0,
         UseSetFarm: (vfarm) => set(() => ({ farm: vfarm })),
         UseSetFarmId: (vid) => set(() => ({ farmId: vid })),
         resetFarm: () => set(() => ({ farm: undefined,farmId:0 })),
         UseSetNewFarm:async (id:number)=> {
               const farmData:farmFacility = await GetFarmDataById(id);
               set({farm:farmData,farmId:id});
            },
         UsesetFarmDataChange:() =>  set((state) => ({ farmDataChange:!state.farmDataChange }) ),
         UseSetFirstElement:(val) =>  set(() => ({ setFirstElement:val })),
         UseSetFarmsAmount:(amount) =>  set(() => ({ farmsAmount:amount })),
      
      }),{name:"farm-store2",
         storage: createJSONStorage(()=>AsyncStorage)
      })

);


//StateMachine

interface bleSTMinfo {
   error:number;
   jobId:number;
   subState:number;
}

interface STMActions {
   SetError: (error: number) => void;
   SetJobId: (jobId: number) => void;
   SetSubState: (state: number) => void;
   resetSTM: () => void;
}

export const stmStore = create<bleSTMinfo & STMActions>()(
   (set) => ({
      error: 0,
      jobId: 0,
      subState: 0,
      SetError: (error) => set((state) => ({ error: error })),
      SetJobId: (jobId) => set((state) => ({ jobId: jobId })),
      SetSubState: (subState) => set((state) => ({ subState: subState })),
      resetSTM: () => set((state) => ({ subState: 0,error:0,jobId:0})),
   })
)



