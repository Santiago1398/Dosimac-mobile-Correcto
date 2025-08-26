/* eslint-disable prettier/prettier */
import React, { useEffect } from 'react'
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native'
import { CreateFarmDataTable, DeleteFarmData, deleteAllFarms, seedDbFarmList } from '../../../../FarmDB/farmsDB'
import { Appbar } from 'react-native-paper'
import { globalStyles } from '../../../theme/theme'
import { useTranslation } from 'react-i18next'
import { useNavigation } from '@react-navigation/native'
import { farmStore } from '../../../../stores/store'

export const MaintenanceScreen = () => {

  const UseSetNewFarm=farmStore((state)=> state.UseSetNewFarm);

  const { t } = useTranslation();
  const navigation = useNavigation();

  const deleteFarmsStore=()=>{
    deleteAllFarms();
    UseSetNewFarm(0);
    farmStore.persist.clearStorage();
  }

  const seedFarmsStore=()=>{
    deleteAllFarms();
    seedDbFarmList();
    UseSetNewFarm(1);
  }

  return (
    <View>
      <View>
      <Appbar.Header elevated>

        <Appbar.BackAction onPress={navigation.goBack} />
        <Appbar.Content title={t('common:Maintenance')} />
        {/* <Appbar.Action icon="add" onPress={() => { }} /> */}
      </Appbar.Header>
      </View>

      <View style={styles.container}>
        <Pressable
          android_ripple={{color:'blue'}}
          style={styles.boton}
          onPress={() => {
            seedFarmsStore();
            Alert.alert('Base de datos rellenada', 'Base de datos rellenada con datos de prueba');
          }}
        >
          <Text style={styles.texto}>Rellenar aplicacion con  datos</Text>
        </Pressable>
        <Pressable
          android_ripple={{color:'blue'}}
          style={styles.boton}
          onPress={() => {
            deleteFarmsStore();
            Alert.alert('Base de datos borrada', 'Se ha borrado la base de datos');
          }}
        >
          <Text style={styles.texto}>Reset de la aplicacion</Text>
        </Pressable>

        <Pressable
          android_ripple={{color:'blue'}}
          style={styles.boton}
          onPress={() => {
            navigation.navigate('View State' as never);
            
          }}
        >
          <Text style={styles.texto}>Ver el store</Text>
        </Pressable>

        

      </View>
    </View>

  )
}

const styles=StyleSheet.create({
  container: {
    // flex: 1,
    // backgroundColor: 'white',
    paddingTop:20,
    paddingHorizontal:20,
    justifyContent: 'center',
    alignItems: 'center',

  },
  boton:{
    
    backgroundColor:'green',
    borderRadius:10,
    padding:10,
    marginBottom:10,
    width:'100%',
    alignItems: 'center',
    
  },
  texto:{
    fontSize:20,
    color:'white',

  }

  
  

})


