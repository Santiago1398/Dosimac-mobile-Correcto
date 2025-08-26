import React from 'react'
import { Pressable, StyleSheet, Text, View, Alert, ScrollView } from 'react-native';
import { List, TextInput } from 'react-native-paper'
// import { Divider } from 'react-native-paper'
import Icon from 'react-native-vector-icons/Ionicons';
import { ListItem } from '../../components/shared/ListItem';
import { useNavigation } from '@react-navigation/native';

//Dhttps://ionic.io/ionicons




export const MaternityScreen = () => {
  const [corral, setCorral] = React.useState('');
  const navigation=useNavigation();

  
  const goAnimalNoFeed = () => {
  
    navigation.navigate('MAT-ANINOFEED' as never)
    console.log('Pulsado**')
  }
  
  return (

    // <ListItem icon='bookmark-outline' label='Hola mundo' value='4' onPress={()=>Alert.alert('He pulsado')}/>
    <ScrollView className='flex-1 bg-gray-100'>
      <View >

        {/* contenedor  de bloque estado*/}
        <View className=' mx-4 pt-10'>
          <View>
            <Text className='text-lg font-semibold text-black'>Estado</Text>
          </View>


          <View className='bg-gray-200 rounded-lg  mt-3 py-4'>


            <ListItem icon='bookmark-outline' label='Animales no alimentados' value='4' onPress={() => navigation.navigate('MAT-ANINOFEED' as never)} hasNavigation />
            <ListItem icon='bookmarks-outline' label='Incidencias alimentacion' value='4' onPress={() => navigation.navigate('MAT-FEEDISSUE' as never)} hasNavigation />
            <ListItem icon='book-outline' label='Incidencias máquinas' value='0' onPress={() => navigation.navigate('MAT-DEVICEISSUE' as never)} hasNavigation />


          </View>
        </View>
        {/* {-- --} */}

        <View className=' mx-4 pt-8'>
          <View>
            <Text className='text-lg font-semibold text-black'>Corral</Text>
          </View>

          <View className='bg-gray-200 rounded-lg  mt-3 py-4'>
            <View className='flex-row justify-between'>
              <View className='pl-3'>
                <TextInput className='w-60 ' keyboardType='number-pad' label="Corral number" mode="outlined" placeholder="" value={corral} onChangeText={setCorral} />
              </View>
              <View>
                <Pressable style={{ marginTop: 20, marginRight: 30 }} onPress={() => navigation.navigate('MAT-CORRALDETAIL' as never)}>
                  <Icon name="search" size={30} color="black" />
                </Pressable>
              </View>


            </View>

          </View>
        </View>

      </View >


    </ScrollView>




  )
}


const styles = StyleSheet.create({

  headerText: {
    color: 'black',

    fontSize: 56,
    fontWeight: 'bold',
    textAlign: 'left',
    paddingVertical: 10,

  },
  Container: {
    flex: 1,
    alignContent: 'center',
    justifyContent: 'center',

    alignItems: 'center',
    //marginTop: 30,
    //backgroundColor:'lightgrey',
    paddingHorizontal: 10,
  }
});