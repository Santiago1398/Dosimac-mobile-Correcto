import React, { useEffect } from 'react'
import { Pressable, View } from 'react-native'
import { Appbar, Text, Button, useTheme, RadioButton, Card, List } from 'react-native-paper';
import { MainButton } from '../../components/shared/MainButton '
import { useTranslation } from 'react-i18next'
import { globalStyles } from '../../theme/theme';
import { useFocusEffect } from '@react-navigation/native';
import { farmFacility } from '../../../sharedTypes/farmInterface';



export const DRSetupInfo = ({ navigation, route }) => {

   const { t } = useTranslation();


   const handleRender2 = (item: farmFacility) => {
      return (

         <List.Item
            style={{ paddingHorizontal: 10 }}
            titleStyle={{ fontSize: 16, fontWeight: '600', textAlign: 'left', color: '#0a0a0a' }}
            descriptionStyle={{ fontSize: 16, fontWeight: '100', textAlign: 'left', color: '#940909', paddingTop: 5 }}
            title={item.name.toUpperCase()}
            description={`${item.location}    ${item.province}`}
            // left={props => <List.Icon {...props} icon="folder" />}
            left={props => <List.Icon {...props} icon="house" style={{}} />}
            // right={() => <Switch disabled style={styles.centered} />}
            right={() => <RadioButton value={item.id.toString()} />}


         // onPress={() =>  alert(item.name+'      id: '+item.id.toString()) }

         // onPress={() =>  navigation.navigate("Farm detalils",{id:item.id,isNewFarm:false,SetectedValue:Number(value)})}




         />
      );
   };


   return (
      <View>

         {/* <Appbar.Header elevated>

            <Appbar.BackAction onPress={navigation.goBack} />
            <Appbar.Content title={t('common:DosimacSetup')} />

         </Appbar.Header> */}



         <View style={{ marginHorizontal: 30, marginTop: 40, borderWidth: 1, borderRadius: 10, borderColor: 'lightgrey' }}>

            <Card
               mode='contained'

            >

               <Card.Content >
                  <Text style={{ fontFamily: 'Poppins-Light ', fontSize: 18 }}>Presione sobre el boton para buscar dispositivos DOSIMAC</Text>
                  {/* <Text> {route.params.id}</Text> */}
               </Card.Content>

            </Card>
         </View>


      </View>

   )
}
