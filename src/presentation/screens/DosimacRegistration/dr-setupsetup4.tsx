import React, { useEffect, useState } from 'react'
import { Dimensions, Image, Pressable, StyleSheet, View, ScrollView } from 'react-native'
import { Appbar, TextInput, Text, Button, useTheme, RadioButton, Card, Banner, Portal, Dialog, Subheading, Paragraph, Divider, Menu, ActivityIndicator } from 'react-native-paper';
import { MainButton } from '../../components/shared/MainButton '
import { useTranslation } from 'react-i18next'
import { globalStyles } from '../../theme/theme';
import { bleSubscribeNotify, blehandleMTU, bleConnection, bleDisconnection } from '../../../device/ble/bleLibrary';
import { useFocusEffect } from '@react-navigation/native';
import { farmStore, stmStore } from '../../../stores/store';
import { MasterState, dosimacInfo, dosimacSetup, pcomActiveRequestState, pcomActiveSetupState, pcomCheckStatus, pcomDosimacSetup, pcomRequestDosimacStatus, pcomSendB, pcomSetDeviceId, pcomStopStateMachine } from '../../../libraries/comunications/dosimacBleMessages';
// import { ScrollView } from 'react-native-gesture-handler';
import { DosimacInfo } from '../../../sharedTypes/dosimacSetup';
import { globals } from '../../../sharedTypes/globlaVars';

const errorList = [
   { id: 0, msg: "Sin accion" },
   { id: 1, msg: "Nombre WIFI no configurado (SSID)" },
   { id: 2, msg: "Conectando con router" },
   { id: 3, msg: "Error en la conexion con el router (SSID, password)" },
   { id: 4, msg: "Conectado con router, pendiente de conexion con el servidor" },
   { id: 5, msg: "Error en la conexion con el servidor. Revise la IP" },
   { id: 6, msg: "Conectado con servidor, pendiente de respuesta" },
   { id: 7, msg: "Corral ocupado" },
   { id: 8, msg: "Corral desconocido" },
   { id: 9, msg: "Corral no existente" },
   { id: 10, msg: "Error desconocido" },
   { id: 11, msg: "Corral configurado" },
   { id: 12, msg: "Timeout sin respuesta del servidor" },
   { id: 13, msg: "Equipo ya asociado a otro corral" }


]

export const DRSetup = ({ navigation, route }) => {

   const { t } = useTranslation();
   const [name, setName] = useState('');
   const [corral, setCorral] = useState("");
   const [deviceNumber, setDeviceNumber] = useState("");
   const [visible, setVisible] = React.useState(false);
   const [visibleMenu, setVisibleMenu] = React.useState(false);
   const [isConfigured, setIsConfigured] = React.useState(false);
   const [hasTag, setHasTag] = React.useState(false);
   const [sendVisible, setSendVisible] = React.useState(false);
   const [waitingSetting, setWaitingSetting] = React.useState(true);
   const [tagVisible, setTagVisible] = React.useState(false);
   const [capturingTag, setCapturingTag] = React.useState(true);
   const [setupState, setSetupState] = useState(0);
   const [nfcTag, setNfcTag] = React.useState('');
   const [dInfoComState, setDInfoComState] = React.useState(0);
   const [dInfomanState, setDInfomanState] = React.useState(0);
   const [sendHasMsg, setSendHasMsg] = React.useState(false);
   const [sendMsg, setSendMsg] = React.useState("");
   const [sendHasError, setSendHasError] = React.useState(false);
   const [hasUnControError, SetHasUnControError] = React.useState(false);
   //const [state,setState]= useState(fmanState);
   // const manState=useManState(0)

   //Acceso al store
   const stmError = stmStore((state) => state.error);
   const stmSubState = stmStore((state) => state.subState);
   const stmJob = stmStore((state) => state.jobId);
   const setStmError = stmStore((state) => state.SetError);
   const setStmSubState = stmStore((state) => state.SetSubState);
   const setStmJob = stmStore((state) => state.SetJobId);

   const sfarm = farmStore((state) => state.farm);
   const sfarmId = farmStore((state) => state.farmId);
   const [startState, setStartState] = useState(0);
   //ConfigState, los siguientes valores. 0:No inicia, 1:Configurando 2:Terminada la configuracion
   const [configState, setConfigState] = useState(0);



   const mivar = 5;
   let masterState: MasterState = {
      actualJob: 0,
      timerId: undefined,
      isInitialized: false,
      bleDevice: '',
      dInfoComState: -1,
      dInfomanState: 0,
      forceStop: false,
      unControlError: false
   };



   //   useEffect(()=>{
   //       navigation.setOptions({
   //         headerShown: false,
   //         elevation:15


   //       });

   //     }, [] );

   useEffect(() => {
      const unsubscribe = navigation.addListener('transitionStart', (e) => {
         // Do something
         console.log('transitionEnd');
         if (e.data.closing) {
            console.log('closing');
            //  handleBLEDisconection();
            pcomStopStateMachine();
            //bleDisconnection(route.params.id);
            //handleDosimacDisconnection();
         }
      });

      return unsubscribe;
   }, [navigation]);



   // //Maquina de estados para el escanedo inicial
   // useEffect(() => {
   //    const incrementCount = () => {
   //       setSetupState(setupState + 1);
   //    };

   //    incrementCount()

   //    const timer = setTimeout(() => {

   //       incrementCount()

   //       // if (setupState < 2)
   //       //    incrementCount()
   //       // else {
   //       //    console.log("Setup timeOUt");
   //       //    setScanning(false);
   //       //    // console.log(ble.devices);
   //       //    let cdevices = 0;



   //       // }
   //    }, setupStateMachine());
   //    return () => clearTimeout(timer);

   // }, [setupState])




   // const setupStateMachine = (): number => {
   //    let tiempo: number = 0;


   //    switch (setupState) {
   //       case 0:
   //          bleSubscribeNotify();
   //          tiempo = 1000; //Wait 1 second before send MTU
   //          break;
   //       case 1:
   //          blehandleMTU();
   //          tiempo = 100;
   //          break;
   //       case 2:
   //          pcomSendB();
   //          tiempo = 100;
   //          break;
   //       case 3:
   //          pcomRequestDosimacStatus(); //* cada 3/5 segundos ire pasando de estado 2 y 3
   //          tiempo = 3000;
   //          break;
   //       case 4:
   //          tiempo = 100;
   //          break;
   //       case 5:
   //          tiempo = 100;
   //          break;
   //       case 6:
   //          tiempo = 100;
   //          break;
   //       case 7:
   //          tiempo = 100;
   //          break;


   //       default:
   //          break;
   //    }
   //    console.log("Tiempo: " + tiempo);
   //    return tiempo;

   // }


   useEffect(() => {

      // if (interfaceManState.msActualJob===0) {
      //    interfaceManState.activeRequestState();
      // }

      if (stmJob === 0) {
         pcomSetDeviceId(route.params.id);
         pcomActiveRequestState();
      }


   }, []);

   //Cada 0.2 segundos vemos desde el componente como va las maquinas de estado
   useEffect(() => {
      const incrementCount = () => {
         setStartState(startState + 1);
      };

      const timer = setTimeout(() => {
         incrementCount()
         masterState = pcomCheckStatus();
         SetHasUnControError(masterState.unControlError);
         setDInfoComState(masterState.dInfoComState);
         setDInfomanState(masterState.dInfomanState); //
         //En la variable configState, indicamos que estamos iniciando una conexion
         switch (configState) {
            case 0:
               if (masterState.dInfoComState === 1)
                  setConfigState(1);
               break;
            case 1:
               if (masterState.dInfoComState === 0 || masterState.dInfoComState === 2)
                  setConfigState(2);

               break;
            case 2:
               break;

         }


         if (dosimacInfo.corral > 0)
            setIsConfigured(true);
         console.log("****  CONEXION CON LA LIBRERIA ****")
         console.log(masterState)



      }, 1000);
      return () => clearTimeout(timer);

   }, [startState])



   useFocusEffect(
      React.useCallback(() => {

         return () => {
            setIsConfigured(false);
            pcomStopStateMachine();
            //bleDisconnection(route.params.id);
         }

      }, [])
   )

   //En cuanto se carga la pantalla, me conecto al equipo
   useEffect(() => {

      setConfigState(0);
      // bleConnection(route.params.id)
   }, [])


   const dohideDialog = () => {
      setVisible(false);

   }


   const dohideDialogTagCapture = () => {
      // if (!waiting)
      setTagVisible(false);
      setCapturingTag(true);

   }


   const dohideDialogSendConfiguration = (opcion: number = 0) => {
      if (opcion === 0 && configState === 2 && dInfoComState === 2)
         return; //No hago nada si no se ha configurado el equipo y no se ha enviado la configuracion
      if (!waitingSetting)
         setWaitingSetting(false);
      setSendVisible(false);
      setSendHasError(false);
      setSendMsg(""); //

   }
   const openMenu = () => {
      setVisibleMenu(true);

   }

   const closeMenu = () => {

      setVisibleMenu(false);
   }

   const sendButtonClick = () => {

      //Set the data structure with the data to send
      //setSendHasMsg(false);
      const data = parseInt(corral)

      console.log("CORRAL: ", data);
      if (!Number.isSafeInteger(data) || data <= 0) {
         setSendHasMsg(true);
         setSendMsg("Corral no valido");
         setSendVisible(true);
         setSendHasError(true);
         setWaitingSetting(false);
         return;
      }
      // if (route.params.operacion > 2) {
      if (globals.dispenserType > 2) {
         const data2 = parseInt(deviceNumber)
         console.log("DEVICE: ", data2);
         if (!Number.isSafeInteger(data2) || data2 <= 0 || data2 > 4) {
            setSendHasMsg(true);
            setSendMsg("Número de máquina no valido");
            setSendVisible(true);
            setSendHasError(true);
            setWaitingSetting(false);
            return;
         }
      }
      dosimacSetup.ssid = sfarm.ssid //
      dosimacSetup.wifiPassword = sfarm.wifiPassword; //
      dosimacSetup.serverIp = sfarm.serverIp; //

      if (globals.dispenserType <= 2)
         // if (route.params.operacion <= 2)         
         dosimacSetup.deviceType = 200;
      else
         dosimacSetup.deviceType = 203;

      // if (route.params.operacion <= 2)
      if (globals.dispenserType <= 2)
         dosimacSetup.phase = 3; //maternidad
      else
         dosimacSetup.phase = 2; //gestacion

      dosimacSetup.deviceNumber = parseInt(deviceNumber);
      dosimacSetup.nfcTag = nfcTag;
      console.log("SENDBUTTON corral: ", corral);
      dosimacSetup.corral = parseInt(corral);
      console.log("SENDBUTTON dosimacSetup.corral: ", dosimacSetup.corral);






      setWaitingSetting(true);
      setSendVisible(true);
      // pcomDosimacSetup();
      //Ponemos a cero el estado      
      masterState.dInfoComState = -1;
      masterState.dInfomanState = 0;
      //Inciciamos un nuevo ciclo de configuracion
      setConfigState(0);
      setDInfoComState(masterState.dInfoComState);
      setDInfomanState(masterState.dInfomanState); //
      pcomActiveSetupState();

   }

   return (
      <ScrollView>

         {/* <Appbar.Header elevated>

            <Appbar.BackAction onPress={navigation.goBack} />
            <Appbar.Content title={t('common:DosimacSetup')} />
            
         </Appbar.Header> */}



         {/* EL TIPO DE EQUIPO DE LA MAC, NO COINCIDE CON EL TIPO DE EQUIPO QUE QUEREMOS CONFIGURAR
            <Portal>
               <Dialog
                  visible={true}
                  onDismiss={dohideDialogSendConfiguration}
                  style={{ maxHeight: 0.6 * Dimensions.get('window').height }}

               >
                  
                  <Dialog.Title style={{ color: '#007263', alignSelf: 'center' }}>Error en el tipo de equipo</Dialog.Title>
                  <Dialog.Content
                     className='flex-col items-center '
                  >
                     <Text>No coincide el tipo de equipo seleccionado con el tipo de dosificador que quiere configurar</Text>

                  </Dialog.Content>
                  <Dialog.Actions>
                     <Button onPress={() => dohideDialogSendConfiguration(0)}>{waitingSetting ? "" : "Aceptar"}</Button>
                  </Dialog.Actions>
               </Dialog>
            </Portal> */}







         <View style={{ marginHorizontal: 20, marginTop: 20, borderWidth: 1, borderRadius: 10, borderColor: 'lightgrey' }}>

            {/*BANER */}
            <Banner
               visible={true}
               style={{ backgroundColor: isConfigured ? 'yellow' : '#eeeeee' }}

               actions={[
                  {
                     label: isConfigured ? 'show configuration' : "",
                     onPress: () => setVisible(true),

                  },
               ]}
               icon={({ size }) => (
                  <Image
                     source={require('../../../assets/images/configuracion_con_equipo.png')}
                     style={{
                        width: size,
                        height: size,
                     }}
                  />
               )}>
               <Text style={{ fontWeight: 'bold' }}> {t('common:Informacion')}</Text>
               {'\n'}
               {'\n'}
               <Text> {sfarm.name}</Text>
               {'\n'}
               <Text> SSID: {sfarm.ssid}</Text>
               {'\n'}
               <Text> Ipserver: {sfarm.serverIp}</Text>
            </Banner>

            {/*DIALOG CONFIGURACION */}
            <Portal>
               <Dialog
                  visible={visible}
                  onDismiss={dohideDialog}
                  style={{ maxHeight: 0.6 * Dimensions.get('window').height }}

               >
                  {/* <Dialog.Icon icon="house" color="black" size={30}/> */}
                  <Dialog.Title style={{ color: 'black' }}>Información</Dialog.Title>
                  {/* <Dialog.Content> */}
                  <Dialog.ScrollArea>

                     <ScrollView contentContainerStyle={{ paddingHorizontal: 24 }}>
                        {/* <TextComponent> */}
                        <Text variant="bodyLarge" >Version : { }</Text>
                        <Text variant="bodyLarge" >Tipo de Informacion: { }</Text>
                        <Text variant="bodyLarge" >SSID: {dosimacInfo.ssid}</Text>
                        <Text variant="bodyLarge" >SSID PSW: {"********"}</Text>
                        <Text variant="bodyLarge" >IP servidor: {dosimacInfo.serverIp}</Text>
                        <Text variant="bodyLarge" >IP equipo: {dosimacInfo.deviceIp}</Text>
                        <Text variant="bodyLarge" >IP Gateway: {dosimacInfo.gateWay}</Text>
                        <Text variant="bodyLarge" >Net mask: {dosimacInfo.subnetMask}</Text>
                        <Text variant="bodyLarge" >Tipo de equipo: {dosimacInfo.deviceType}</Text>
                        <Text variant="bodyLarge" >Número de Maquina: {dosimacInfo.deviceNumber}</Text>
                        <Text variant="bodyLarge" >Etiqueta corral: {""}</Text>
                        <Text variant="bodyLarge" >Número corral: {dosimacInfo.corral}</Text>
                        <Text variant="bodyLarge" >Estado conexion: {dosimacInfo.connectionState}</Text>
                        <Text variant="bodyLarge" >Estado equipo: {dosimacInfo.deviceState}</Text>
                        <Text variant="bodyLarge" >Id animal: {dosimacInfo.idAnimal}</Text>
                        <Text variant="bodyLarge" >Crotal: {dosimacInfo.crotal}</Text>
                        <Text variant="bodyLarge" >Version SW: {dosimacInfo.swVersion}</Text>
                        <Text variant="bodyLarge" >Version hW: {dosimacInfo.hwVersion}</Text>

                        {/* </TextComponent> */}
                     </ScrollView>


                     {/* </Dialog.Content> */}
                  </Dialog.ScrollArea>
                  <Dialog.Actions>
                     <Button onPress={dohideDialog}>Aceptar</Button>
                  </Dialog.Actions>
               </Dialog>
            </Portal>



            {/*DIALOG BOTON ENVIADO PULSADO */}
            <Portal>
               <Dialog
                  visible={sendVisible}
                  onDismiss={dohideDialogSendConfiguration}
                  style={{ maxHeight: 0.6 * Dimensions.get('window').height }}

               >
                  {/* <Dialog.Icon icon="house" color="black" size={30}/> */}
                  <Dialog.Title style={{ color: '#007263', alignSelf: 'center' }}>Envío de configuración</Dialog.Title>
                  <Dialog.Content
                     className='flex-col items-center '
                  >
                     {/* <Dialog.ScrollArea> */}

                     {/* <ScrollView contentContainerStyle={{ paddingHorizontal: 24 }}                        
                     > */}
                     {!sendHasError && (
                        configState === 2 ? "" : <ActivityIndicator animating={true} color={'green'} size={'large'} />)

                     }
                     <Text > </Text>

                     {!sendHasError &&
                        <>
                           {/* <Text variant="bodyLarge" >Estado conexion: {dInfoComState} {"\n"}Estado Maquina:  {dInfomanState}
                                 {"\n"}Conexion:  {configState}
                              </Text> */}
                           <Text className={`text-center text-xl text-black ${configState === 2 ? (dInfoComState === 2 ? 'text-blue-600' : 'text-red-600') : 'text-back'}`}>
                              {
                                 configState === 0 ? 'Iniciando conexion' :
                                    configState === 1 ? 'configurando...' :
                                       dInfoComState === 0 ? `Error configuración (${dInfomanState})` : '*Configuracion realizada*'
                              }
                           </Text>
                           {configState === 2 && dInfoComState === 2 ? (
                              <Pressable className='flex-row mt-8 w-auto h-12 rounded-lg bg-green-700 items-center justify-center'
                                 onPress={() => { dohideDialogSendConfiguration(1); pcomStopStateMachine(); navigation.navigate('DR-NEWUPDATE', { operacion: route.params.operacion }) }}>

                                 <Text className='text-center text-gray-100 text-lg px-14 font-semibold'>Salir</Text>

                              </Pressable>
                           ) : ((configState === 2 && dInfoComState === 0 && <Text className='text-lg text-slate-700 mt-2'>{errorList[dInfomanState].msg}</Text>))
                           }
                        </>
                     }
                     {sendHasMsg &&
                        <Text variant="bodyLarge" >{sendMsg} </Text>
                     }
                     {/* </TextComponent> */}
                     {/* </ScrollView> */}

                     {/* </Dialog.ScrollArea> */}
                  </Dialog.Content>
                  <Dialog.Actions>
                     <Button onPress={() => dohideDialogSendConfiguration(0)}>{waitingSetting ? "" : "Aceptar"}</Button>
                  </Dialog.Actions>
               </Dialog>
            </Portal>



            {/*DIALOG CAPTURANDO TAG */}
            <Portal>
               <Dialog
                  visible={tagVisible}
                  onDismiss={dohideDialogTagCapture}
                  style={{ maxHeight: 0.6 * Dimensions.get('window').height }}

               >
                  {/* <Dialog.Icon icon="house" color="black" size={30}/> */}
                  <Dialog.Title style={{ color: '#007263', alignSelf: 'center' }}>Capturar tag de corral</Dialog.Title>
                  <Dialog.Content>
                     {/* <Dialog.ScrollArea> */}

                     <ScrollView contentContainerStyle={{ paddingHorizontal: 24 }}>
                        {/* <TextComponent> */}
                        <ActivityIndicator animating={true} color={'green'} size={'large'} />
                        <Text > </Text>

                        <Text style={{ alignSelf: 'center' }} variant="bodyLarge" >capturando ... </Text>
                        {/* </TextComponent> */}
                     </ScrollView>

                     {/* </Dialog.ScrollArea> */}
                  </Dialog.Content>
                  <Dialog.Actions>
                     <Button onPress={dohideDialogTagCapture}>Aceptar</Button>
                  </Dialog.Actions>
               </Dialog>
            </Portal>

            {/*DIALOG DE ERROR INCONTROLABLE */}
            {/* <Portal>
                  <Dialog visible={visible} onDismiss={dohideDialog}>
                     <Dialog.Icon icon="warning" color="red" size={60} />
                     <Dialog.Title style={{ color: 'red' }}>Aviso</Dialog.Title>
                     <Dialog.Content>
                        <Text variant="bodyLarge" >No hay dispositivos</Text>
                     </Dialog.Content>
                     <Dialog.Actions>
                        <Button onPress={dohideDialog}>Aceptar</Button>
                     </Dialog.Actions>
                  </Dialog>
               </Portal> */}

            {/*MAIN SCREEN */}

         </View>

         <View style={{ marginTop: 20, gap: 10, marginHorizontal: 10, paddingHorizontal: 10 }}>

            {/*Visualizacion tag*/}

            <View style={{ flexDirection: 'row', gap: 15, justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
               {/* <TextInput right={<TextInput.Affix text="/100" />} label="Outlined input" selectTextOnFocus={true} selectionColor={'red'} secureTextEntry={true} style={{}} mode="outlined" placeholder="Farm Name" value={name} onChangeText={setName} /> */}
               <Image
                  source={require('../../../assets/images/rfid2tb.png')}
                  style={{
                     width: 80,
                     height: 80,
                     opacity: hasTag ? 1 : 0.2,
                  }}
               />

               {/* <Pressable
                  android_ripple={{ color: 'blue' }}
                  style={{ ...styles.boton2, }}
                  onPress={() => {openMenu()}}
               >
                  <Text style={styles.texto}>Corral Tag</Text>
               </Pressable> */}

               <Menu
                  visible={visibleMenu}
                  onDismiss={closeMenu}
                  anchor={
                     // <Button onPress={openMenu}>Show</Button>
                     <Pressable
                        android_ripple={{ color: 'blue' }}
                        style={{ ...styles.boton2, }}
                        onPress={() => { openMenu() }}
                     >
                        <Text style={styles.texto}>Corral Tag</Text>
                     </Pressable>



                  }
                  anchorPosition='top'


               >
                  <Menu.Item onPress={() => { setHasTag(true); setTagVisible(true); setVisibleMenu(false) }} title="Capturar tag" leadingIcon="content-copy" />
                  <Divider />
                  <Menu.Item onPress={() => { setHasTag(false) }} title="Borrar tag" leadingIcon="delete" />
               </Menu>

            </View>
            <TextInput style={{ marginTop: 5 }} keyboardType='number-pad' label={t('common:numeroCoral')} mode="outlined" placeholder={t('common:numeroCoral')} value={corral} onChangeText={setCorral} />
            {globals.dispenserType > 2 &&
               <TextInput style={{ marginTop: 5 }} keyboardType='number-pad' label={t('common:numeroMaquina')} mode="outlined" placeholder={t('common:numeroMaquina')} value={deviceNumber} onChangeText={setDeviceNumber} />
            }

         </View>

         {/* BOTONES*/}

         {/* <Divider  style={{
            marginTop: 40,
            marginHorizontal: 60,
            borderWidth: 0.5,
            borderColor: 'lightgrey',
          }} /> */}



         <View style={{ marginTop: 60, gap: 25, marginHorizontal: 10, paddingHorizontal: 10 }}>
            <Pressable
               android_ripple={{ color: 'blue' }}
               style={styles.boton}
               onPress={() => {
                  // submitData();
                  sendButtonClick();
                  // setSendVisible(!sendVisible);
               }}
            >
               <Text style={styles.texto}>{t('common:Enviar')}</Text>
            </Pressable>
            <Pressable
               android_ripple={{ color: 'blue' }}
               style={{ ...styles.boton, backgroundColor: 'darkred' }}
               onPress={() => {
                  // submitData();
                  pcomStopStateMachine();
                  navigation.navigate('DR-NEWUPDATE', { operacion: route.params.operacion });
               }}
            >
               <Text style={styles.texto}>{t('common:Salir')}</Text>
            </Pressable>

         </View>



      </ScrollView>

   )
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

   },

   boton2: {

      backgroundColor: '#4b4238',
      borderRadius: 10,
      padding: 10,
      marginBottom: 10,
      marginTop: 10,
      paddingHorizontal: 60,
      // width: '60%',
      // height: '60%',

      alignItems: 'center',

   },





})

