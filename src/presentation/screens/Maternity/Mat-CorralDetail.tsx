import { View, Text, Image, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
// import { Image } from 'react-native-reanimated/lib/typescript/Animated'
import { CerdoMaternidad } from '../../../assets'
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { CorralMatInfo } from '../../../libraries/interfaces/corral-Info.interface';

const ipServer:string='http://192.168.1.238:3010'
const corralInfoUrl:string=ipServer+'/corral/19'
export const MatCorralDetail = () => {
   const [isDeviceError, setDeviceError] = useState(true)
   const [hasDiasSinAlimentar, setHasDiasSinAlimentar] = useState(true)
   // const [quote, setQuote] = useState<CorralMatInfo>;
   const [corraInfo, setCorralInfo] = useState<CorralMatInfo | null>(null);
   const [requestError, setRequestError] = useState(false);


   
   const requestInfo=() => {
      //Fech info form the backend
      // Simulamos un error en el dispositivo
      console.log("llamada axios:"+ corralInfoUrl)
      axios.get(corralInfoUrl) 
      .then((response) => {         
         // handle the response from the backend
         // console.log('EXITO LLAMADA AXIOS -------')
         console.log(response.data)
         console.log(response.data.animal)
         setCorralInfo(response.data)
         
      })
      .catch((error) => {
         // handle the error from the backend
         console.log('Error axios' + error)
      })
      
   


   }

    const requestInfo2= async () => {
      //Fech info form the backend
      // Simulamos un error en el dispositivo
      // const abortController = new AbortController();

      
      // try {
      // const respuesta=await axios.get(corralInfoUrl)    
      // console.log(respuesta.status)
      // console.log(respuesta.data)
      // } catch (error) {
      //    console.log('Error axios' + error)         
         
      }
      

      // .then((response) => {         
      //    // handle the response from the backend
      //    console.log('EXITO LLAMADA AXIOS -------')
      //    console.log(response.data)
      //    console.log(response.data.animal)
      //    setCorralInfo(response.data)
         
      // })
      // .catch((error) => {
      //    // handle the error from the backend
      //    console.log('Error axios' + error)
      // })
   


   // }


   useEffect(() => {
      requestInfo()
   }, [])

   
   return (

      
      <ScrollView className='flex-1 bg-gray-100 '>
         <Text>{corraInfo?.animal?'hay animal':'no hay animal'}</Text>
         <Image source={CerdoMaternidad} className="w-fit h-2/3  absolute translate-x-3 translate-y-60 opacity-40 " />

         <View className='mx-4'>
            {/* Contenedor Principal    */}

            {/* Error en el dispositivo del corral */}
            {isDeviceError &&
               <View className='mt-3 h-8 bg-red-500 rounded-md flex-col justify-center items-center'>
                  <Text className='text-white font-normal text-base'>Error:  El motor no funciona</Text>
               </View>
            }

            {/* ID - CROTAL - CICLO */}

            <View className='flex-row justify-between mt-4'>
               <View className='flex-row items-end'>
                  <Text className='text-base text-gray-500 px-2  bg-gray-200 rounded-full'>ID</Text>
                  <Text className='text-xl text-gray-600 font-semibold'>1235</Text>
               </View>
               <View className='flex-row items-end'>
                  <Text className='text-base text-gray-500 px-2  bg-gray-200 rounded-full'>Crotal</Text>
                  <Text className='text-xl text-gray-600 font-semibold'>123456789</Text>
               </View>
               <View className='flex-row items-end'>
                  <Text className='text-base text-gray-500 px-2 bg-gray-200 rounded-full'> Cicle</Text>
                  <Text className='text-xl text-gray-600 font-semibold'> 5</Text>
               </View>

            </View>

            {/* SUBESTADO - DIA */}

            <View className='flex-row justify-between mx-8 mt-6 items-end'>
               <View className='flex-row flex-1'>
                  <Text className='text-3xl text-blue-900 font-semibold'>Parto</Text>
               </View>
               <View className='flex-row flex-1 justify-end '>
                  <Text className='text-base text-gray-500 px-2 bg-gray-200 rounded-full'> Dia</Text>
                  <Text className='text-xl text-gray-600 font-semibold pl-2'>5</Text>

               </View>

            </View>



            {/* ALIMENTACION */}
            {/* Cantidad alimentacion dia */}

            <View className='flex-row justify-between mt-6'>
               <View className='flex-col'>
                  {/*  Cantidad sin comer */}
                  <View className='flex-row items-baseline'>
                     <Text className='text-6xl text-gray-600 font-semibold tracking-tighter  '>11000</Text>
                     <Text className='text-xl text-gray-600 font-normal ml-1 '>gr</Text>
                  </View>
                  {/* barra Progreso */}
                  <View className=''>
                     <View className='w-fit h-3 bg-gray-300 rounded-full'></View>
                     <View className='w-10/12 h-3 bg-green-500 rounded-full absolute '></View>
                  </View>
                  {/* Cantidad total dia */}
                  <View className='flex-row justify-between'>
                     <Text className='font-normal text-md'>12000 gr</Text>
                     <Text className='font-normal text-md'>92%</Text>

                  </View>
               </View>


               {/* Intervalos de alimentacion */}
               <View className='flex-col justify-end'>
                  {/* Pinta intervalos */}
                  <View className='flex-row '>
                     <View className='flex-row items-end ml-1'>
                        <View className='h-12 w-2 bg-gray-500 absolute rounded-t-full'></View>
                        <View className='h-10 w-2 bg-green-500 rounded-t-full'></View>
                     </View>
                     <View className='flex-row items-end ml-1'>
                        <View className='h-12 w-2 bg-gray-500 absolute rounded-t-full'></View>
                        <View className='h-12 w-2 bg-green-500 rounded-t-full'></View>
                     </View>
                     <View className='flex-row items-end ml-1'>
                        <View className='h-12 w-2 bg-gray-500 absolute rounded-t-full'></View>
                        <View className='h-5 w-2 bg-red-600 rounded-t-full'></View>
                     </View>
                     <View className='flex-row items-end ml-1'>
                        <View className='h-12 w-2 bg-gray-500 absolute rounded-t-full'></View>
                        <View className='h-12 w-2 bg-green-500 rounded-t-full'></View>
                     </View>
                     <View className='flex-row items-end ml-1'>
                        <View className='h-12 w-6 bg-gray-500 absolute rounded-t-full'></View>
                        <View className='h-5 w-6 bg-green-500 rounded-t-full'></View>
                     </View>
                     <View className='flex-row items-end ml-1'>
                        <View className='h-12 w-2 bg-gray-500  rounded-t-full'></View>
                        {/* <View className='h-10 w-2 bg-green-500 rounded-t-md'></View> */}
                     </View>
                     <View className='flex-row items-end ml-1'>
                        <View className='h-12 w-2 bg-gray-500  rounded-t-full'></View>
                        {/* <View className='h-10 w-2 bg-green-500 rounded-t-md'></View> */}
                     </View>
                     <View className='flex-row items-end ml-1'>
                        <View className='h-12 w-2 bg-gray-500  rounded-t-full'></View>
                        {/* <View className='h-10 w-2 bg-green-500 rounded-t-md'></View> */}
                     </View>

                  </View>
                  {/* Cantidad intervalo actual */}
                  <View className='flex-row justify-between'>
                     <Text className='font-normal text-md'>200/600</Text>
                     <Text className='font-normal text-md'>33%</Text>
                  </View>

               </View>

               {/* Fin bloque alimentacion */}
            </View>
            {/* Aviso días sin alimentar */}
            {hasDiasSinAlimentar &&
               <View className='mt-4 h-8 bg-red-500 rounded-md flex-col justify-center items-center'>
                  <Text className='text-white font-normal text-base'>2 días sins alimentar</Text>
               </View>
            }

            {/* Resto informacion animal */}
            <View className='flex-col stretch'>

               <View className='flex-row justify-between mt-6'>
                  <View className='flex-col'>
                     <Text className='text-lg text-gray-600 font-normal'>Curva</Text>
                     <View className='flex-row'>
                        <Icon name='book-outline' size={20} color="black" style={{ paddingTop: 4, marginRight: 5 }} />
                        <Text className='text-xl text-gray-600 font-bold font-mono'>Multiparas</Text>
                     </View>
                  </View>

                  <View className='flex-col'>
                     <Text className='text-lg text-gray-600 font-normal'>Correción</Text>
                     <View className='flex-row'>
                        <Icon name='book-outline' size={20} color="black" style={{ paddingTop: 4, marginRight: 5 }} />
                        <Text className='text-xl text-gray-600 font-bold font-mono'>100% curva</Text>
                     </View>
                  </View>
               </View>

               <View className='flex-row justify-between mt-5'>
                  <View className='flex-col'>
                     <Text className='text-lg text-gray-600 font-normal'>Fecha entrada</Text>
                     <View className='flex-row'>
                        <Icon name='book-outline' size={20} color="black" style={{ paddingTop: 4, marginRight: 5 }} />
                        <Text className='text-xl text-gray-600 font-bold font-mono'>10/12/2021</Text>
                     </View>
                  </View>
                  <View className='flex-col'>
                     <Text className='text-lg text-gray-600 font-normal'>Fecha parto</Text>
                     <View className='flex-row'>
                        <Icon name='book-outline' size={20} color="black" style={{ paddingTop: 4, marginRight: 5 }} />
                        <Text className='text-xl text-gray-600 font-bold font-mono'>12/12/2021</Text>
                     </View>
                  </View>
               </View>

               <View className='flex-row justify-between mt-5'>
                  <View className='flex-col'>
                     <Text className='text-lg text-gray-600 font-normal'>Nave</Text>
                     <View className='flex-row'>
                        <Icon name='book-outline' size={20} color="black" style={{ paddingTop: 4, marginRight: 5 }} />
                        <Text className='text-xl text-gray-600 font-bold font-mono'>G-1</Text>
                     </View>
                  </View>
                  <View className='flex-col'>
                     <Text className='text-lg text-gray-600 font-normal'>Corral</Text>
                     <View className='flex-row'>
                        <Icon name='book-outline' size={20} color="black" style={{ paddingTop: 4, marginRight: 5 }} />
                        <Text className='text-xl text-gray-600 font-bold font-mono'>21</Text>
                     </View>
                  </View>
               </View>

               <View className='flex-row justify-between mt-5'>
                  <View className='flex-col'>
                     <Text className='text-lg text-gray-600 font-normal'>Última alimentacion</Text>
                     <View className='flex-row'>
                        <Icon name='book-outline' size={20} color="black" style={{ paddingTop: 4, marginRight: 5 }} />
                        <Text className='text-xl text-gray-600 font-bold font-mono'>17/12/2021</Text>
                     </View>
                  </View>

               </View>

            </View>


         </View>

         {/* DIAS SIN ALIMENTAR */}

         {/* INFORMACION VARIA */}






      </ScrollView>

   )
}

