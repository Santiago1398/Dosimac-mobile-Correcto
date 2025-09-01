/* eslint-disable prettier/prettier */

import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { View, Alert, ScrollView, Pressable, Text, StyleSheet } from 'react-native';
import { Appbar, Button, TextInput, } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { GetFarmDataById, InsertFarmData, UpdateFarmData, deleteFarmById } from '../../../FarmDB/farmsDB';
import { farmFacility } from '../../../sharedTypes/farmInterface';
import { vglobal } from '../../../sharedTypes/globlaVars';
import { farmStore } from '../../../stores/store';
import { useTogglePasswordVisibility } from '../../hooks/useTogglePasswordVisibility';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
//import Icon from 'react-native-vector-icons/MaterialIcons';
import Icon from 'react-native-vector-icons/Ionicons';
import { IonIcon } from '../../components/shared/IonIcon';






export const FarmScreen = ({ navigation, route }) => {

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [province, setProvince] = useState('');
  const [ssid, setSsid] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [userName, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [serverIp, setServerIp] = useState('');

  const sfarm = farmStore((state) => state.farm);
  const sfarmId = farmStore((state) => state.farmId);
  const UseSetFarm = farmStore((state) => state.UseSetFarm);
  const UseSetFarmId = farmStore((state) => state.UseSetFarmId);
  const UseSetNewFarm = farmStore((state) => state.UseSetNewFarm);
  const UsesetFarmDataChange = farmStore((state) => state.UsesetFarmDataChange);
  const setFirstElment = farmStore((state) => state.setFirstElement);
  const UseSetFirstElement = farmStore((state) => state.UseSetFirstElement);
  const UseSetFarmsAmount = farmStore((state) => state.UseSetFarmsAmount);
  const UseresetFarm = farmStore((state) => state.resetFarm);



  //const { passwordVisibility, rightIcon, handlePasswordVisibility } = useTogglePasswordVisibility();


  const [flatTextSecureEntry, setFlatTextSecurityEntry] = useState(true)
  const [UserSecureEntry, setUserSecurityEntry] = useState(true)










  let farmData2: farmFacility;

  const { t } = useTranslation();

  const fetchFarmData = async (id: number) => {
    const farmData: farmFacility = await GetFarmDataById(id);
    // console.log('-----');
    // console.log(farmData);

    setfarmdata(farmData);
  };

  const setfarmdata = (farmData: farmFacility) => {
    setName(farmData.name);
    setLocation(farmData.location);
    setProvince(farmData.province);
    setSsid(farmData.ssid);
    setWifiPassword(farmData.wifiPassword);
    setUsername(farmData.userName);
    setPassword(farmData.password);
    setServerIp(farmData.serverIp);

  }

  const fillFarmData2 = () => {
    farmData2 = {
      name: name,
      location: location,
      province: province,
      userName: userName,
      password: password,
      ssid: ssid,
      wifiPassword: wifiPassword,
      serverIp: serverIp,
      id: route.params.id,
    };
    // UseSetFarmId(route.params.id);
    // UseSetFarm(farmData2);
  }

  const Inicilizefarmdata = () => {
    setName('');
    setLocation('');
    setProvince('');
    setSsid('');
    setWifiPassword('');
    setUsername('');
    setPassword('');
    setServerIp('');

  }



  useFocusEffect(
    React.useCallback(() => {
      // console.log("Global2:",vglobal.farmId)
      // UseSetFarmId(route.params.id);
      // console.log("Global2:",vglobal.farm)
      // console.log("Store::::: ",sfarm);
      // console.log("Store ID::::: ",sfarmId);
      // vglobal.farmId=vglobal.farmId+1;

      console.log(route.params.id, route.params)
      if (route.params.isNewFarm)
        Inicilizefarmdata();
      else {

        fetchFarmData(route.params.id); // replace farmId with the actual id

      }
      //Alert.alert('Screen was focused');
      // Do something when the screen is focused
      return () => {
        // Alert.alert('Screen was unfocused');
        // Do something when the screen is unfocused
        // Useful for cleanup functions
      };
    }, [])
  );

  // const handleSubmit = () => {
  //   UpdateFarmData()
  // };



  const submitData = () => {
    fillFarmData2();

    if (route.params.isNewFarm) {
      InsertFarmData(farmData2)

    }
    else {
      // fillFarmData2()
      UpdateFarmData(farmData2)
      // vglobal.farm = farmData2
      // vglobal.farmId = farmData2.id
      // UseSetFarm(farmData2);
      // UseSetFarmId(farmData2.id);

    }
    UsesetFarmDataChange();

    if (route.params.id === 0) {
      if (!sfarm) {
        UseSetNewFarm(1);
      }

    } else
      if (route.params.id === sfarm.id) {
        UseSetNewFarm(route.params.id);
      }

  }

  const deleteFarm = async () => {
    vglobal.coinciden = false;
    if (route.params.isNewFarm) {
      Alert.alert('No se puede borrar una granja nueva')

    } else {
      await deleteFarmById(route.params.id);
      if (route.params.id === route.params.SetectedValue) {

        //UseSetFirstElement(true);
        //console.log('mismos elementos');
        //vglobal.coinciden = true;
        //navigation.navigate('Farm list',{setFirstElement:true});
        UseresetFarm();

      }

      navigation.goBack();
    }

  }


  return (
    <ScrollView>

      <Appbar.Header elevated>
        <Appbar.BackAction onPress={navigation.goBack} />
        <Appbar.Content title={t('common:DetallesInstalacion')} />
        {/* <Appbar.Action icon="done" onPress={() => {}} /> */}
        <Appbar.Action
  icon={(props) => (
    <MaterialCommunityIcons name="delete" size={props.size} color={props.color} />
  )}
  onPress={() => {
    Alert.alert('Borrar granja', 'Desea borrar la granja', [
      { text: 'OK', onPress: deleteFarm },
      { text: 'Cancelar' },
    ]);
  }}
/>
      </Appbar.Header>

      <View style={{ marginTop: 20, gap: 10, marginHorizontal: 10, paddingHorizontal: 10 }}>
        {/* <TextInput right={<TextInput.Affix text="/100" />} label="Outlined input" selectTextOnFocus={true} selectionColor={'red'} secureTextEntry={true} style={{}} mode="outlined" placeholder="Farm Name" value={name} onChangeText={setName} /> */}
        <TextInput label="Farm Name" mode="outlined" placeholder="Nombre de la granja" value={name} onChangeText={setName} />
        <TextInput label="Location" mode="outlined" placeholder="Poblacion" value={location} onChangeText={setLocation} />
        <TextInput label="Province" mode="outlined" placeholder="Provincia" value={province} onChangeText={setProvince} />
        <TextInput label="Wifi SSID" mode="outlined" placeholder="Nombre red WIFI" value={ssid} onChangeText={setSsid} />
        <TextInput label="Wifi password" mode="outlined" placeholder="Wifi Password" value={wifiPassword} onChangeText={setWifiPassword}

          secureTextEntry={flatTextSecureEntry}
          right={
            <TextInput.Icon
              icon={() => <IonIcon name={flatTextSecureEntry ? 'eye-outline' : 'eye-off-outline'} size={24} color="black" />}

              onPress={() => setFlatTextSecurityEntry(!flatTextSecureEntry)}
              forceTextInputFocus={false}
            />
          }
        />

        <TextInput label="User name" mode="outlined" placeholder="Nombre usuario" value={userName} onChangeText={setUsername} />
        <TextInput label="User password" mode="outlined" placeholder="Password usuario" value={password} onChangeText={setPassword}

          secureTextEntry={UserSecureEntry}
          right={
            <TextInput.Icon
              icon={() => <IonIcon name={UserSecureEntry ? 'eye-outline' : 'eye-off-outline'} size={24} color="black" />}

              onPress={() => setUserSecurityEntry(!UserSecureEntry)}
              forceTextInputFocus={false}
            />
          }
        />
        <TextInput keyboardType='number-pad' label="Server IP" mode="outlined" placeholder="IP Servidor" value={serverIp} onChangeText={setServerIp} />


        {/* <Pressable   onPress={() => {
            fillFarmData2()
            UpdateFarmData(farmData2)
            vglobal.farm =farmData2
            vglobal.farmId =farmData2.id
            // UseSetFarm(farmData2);
            // UseSetFarmId(farmData2.id);
          }} >
            <Text>
              {t('common:Guardar')}
          </Text>
        </Pressable> */}

        <Pressable
          android_ripple={{ color: 'blue' }}
          style={styles.boton}
          onPress={() => {
            submitData();
            // fillFarmData2()
            // UpdateFarmData(farmData2)
            // vglobal.farm = farmData2
            // vglobal.farmId = farmData2.id
            navigation.goBack();
            // // UseSetFarm(farmData2);
            // // UseSetFarmId(farmData2.id);
            // //InsertFarmData(farmData2)
          }}
        >
          <Text style={styles.texto}>{t('common:Guardar')}</Text>
        </Pressable>


      </View>
    </ScrollView>
  );
}






const styles = StyleSheet.create({
  container: {
    // flex: 1,
    // backgroundColor: 'white',
    paddingTop: 20,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',

  },
  boton: {

    backgroundColor: 'green',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',

  },
  texto: {
    fontSize: 20,
    color: 'white',

  }




})



