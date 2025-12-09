
import { Buffer } from "buffer";
import { bleConnection, bleDisconnection, bleDosimacWrite, bleSubscribeNotify, blehandleMTU } from "../../device/ble/bleLibrary";
// import { BLETestingScreen } from "../../presentation/screens/Debug/BLETesting/BLETestingScreen";
import { Parser } from "./cti-parser";
import { DosimacInfo, DosimacSetup } from '../../sharedTypes/dosimacSetup';
import { useState } from "react";
import { stmStore } from "../../stores/store";
import { registerDosimacNotifyHandler } from "../../device/ble/bleLibrary.web";

registerDosimacNotifyHandler((arr: number[]) => {
   const buf = Buffer.from(arr);
   pcomProccessResponse(buf, buf.length);
});


//DEFINICION DE TIPOS ********************************************************************

type iFrameMsg = {
   data: Buffer,
   length: number
}

type STMinfo = {

   state: number,
   responseRecieved: number,
   waitRetries: number,
   stateRetries: number
   error: number;


}


export type MasterState = {
   actualJob: number;
   timerId: ReturnType<typeof setTimeout> | null;
   isInitialized: boolean;
   bleDevice: string;
   dInfoComState: number;
   dInfomanState: number;
   forceStop: boolean;
   unControlError: boolean;
};



//DEFINICION DE VARIABLES ****************************************************************     
const parser = new Parser();

export let dosimacInfo: DosimacInfo = {
   deviceIp: "",
   gateWay: "",
   subnetMask: "",
   connectionState: 0,
   deviceState: 0,
   idAnimal: 0,
   crotal: 0,
   swVersion: 0,
   hwVersion: 0,
   ssid: "",
   wifiPassword: "",
   serverIp: "",
   deviceType: 0,
   phase: 0,
   deviceNumber: 0,
   nfcTag: "",
   corral: 0,
   current(current: any) { return null; }
};
export let dosimacSetup: DosimacSetup = {
   ssid: "",
   wifiPassword: "",
   serverIp: "",
   deviceType: 0,
   phase: 0,
   deviceNumber: 0,
   nfcTag: "",
   corral: 0
};
//const sfarm = farmStore((state) => state.farm);
// let stateRequestMachine:number = 0;
// let stateSetupMachine:number = 0;
// let requestStatusRecivedResponse:number = 0;
// let setupConfigRecivedResponse:number = 0;
let requestState: STMinfo = { state: 0, responseRecieved: 0, waitRetries: 0, stateRetries: 0, error: 0 };
let setupState: STMinfo = { state: 0, responseRecieved: 0, waitRetries: 0, stateRetries: 0, error: 0 };
let inicialState: STMinfo = { state: 0, responseRecieved: 0, waitRetries: 0, stateRetries: 0, error: 0 };

let masterState: MasterState = {
   actualJob: 0,
   timerId: null,
   isInitialized: false,
   bleDevice: "",
   dInfoComState: -1,
   dInfomanState: 0,
   forceStop: false,
   unControlError: false,
};

// const stmError = stmStore((state) => state.error);
// const stmSubState = stmStore((state) => state.subState);
// const stmJob = stmStore((state) => state.jobId);
// const setStmError = stmStore((state) => state.SetError);
// const setStmSubState = stmStore((state) => state.SetSubState);
// const setStmJob = stmStore((state) => state.SetJobId);




// let manState={
//    state:0,
//    error:0
// }

// export const fmanState=() => {
//    return manState;
// }

//*************************************************************************************** */
// Definicion de los custom hooks para conectar esta funcionalidad con el componente visual

// export const useManState = (inicalState: number = 0) => {
//    const [msError, iSetmsError] = useState(false);
//    const [msActualJob, iSetActualJob] = useState(inicalState);
//    const [msSubState, iSetmsSubState] = useState(0);
//    const activeRequestState = () => { handleActiveRequestState() }
//    const activeSetupState = () => { handleActiveSetupState() }
//    const SetError = (valor: boolean) => { iSetmsError(valor) }
//    const SetActualJob = (job: number) => { iSetActualJob(job) }
//    const SetSubState = (valor: number) => { iSetmsSubState(valor) }

//    return {
//       msError,
//       msActualJob,
//       msSubState,
//       SetError,
//       SetActualJob,
//       SetSubState,
//       activeRequestState,
//       activeSetupState
//    }
// }


//export const interfaceManState = useManState(0)

// IMPLEMENTACION DEL PROGRMA ************************************************************




//Inicio del envio de informacion
export const pcomSendB = () => {

   console.log("****************ENVIO DE LA B ********************************")
   console.log("****************ENVIO DE LA B ********************************")
   console.log("****************ENVIO DE LA B ********************************")
   console.log("****************ENVIO DE LA B ********************************")
   console.log("****************ENVIO DE LA B ********************************")
   console.log("****************ENVIO DE LA B ********************************")
   console.log("****************ENVIO DE LA B ********************************")
   console.log("****************ENVIO DE LA B ********************************")
   const data = Buffer.from([66])
   bleDosimacWrite(data);



}


//Dosimac request configuration information
export const pcomRequestDosimacStatus = () => {

   let payLoad: Buffer;
   let buff1: iFrameMsg;
   console.log("Call to tmsgRequestDosimacStatus*****")

   // payLoad=Buffer.from(payLoadRequestDosimacStatus());
   payLoad = payLoadRequestDosimacStatus()

   console.log("Payload: ", payLoad);
   console.log("Payload length: ", payLoad.length);


   buff1 = parser.responseContructor(0x1C, 0x02, payLoad, payLoad.length, false);

   console.log("buff1: " + buff1.data.toString('hex'));
   console.log("buff1 length: ", buff1.data.length)


   bleDosimacWrite(buff1.data);

}

const payLoadRequestDosimacStatus = (): Buffer => {

   const payLoad = Buffer.alloc(4);

   payLoad.writeUInt16LE(1, 0) //Version
   payLoad.writeUInt16LE(3, 2) //Tipo de informacion=> Peticion de estado

   return payLoad;

}


//SETUP CONFIGURATION:----------------------------------------------------------------

export const pcomDosimacSetup = () => {

   let payLoad: Buffer;
   let buff1: iFrameMsg;
   console.log("Call to tmsgDosimacSetup*****")
   console.log("[WEB][SETUP] dosimacSetup ANTES DE payloadSetup:", {
      ssid: dosimacSetup.ssid,
      wifiPassword: dosimacSetup.wifiPassword,
      serverIp: dosimacSetup.serverIp,
      deviceType: dosimacSetup.deviceType,
      phase: dosimacSetup.phase,
      deviceNumber: dosimacSetup.deviceNumber,
      corral16: dosimacSetup.corral,
      corral32: (dosimacSetup as any).corral32 ?? null,
      swVersion: dosimacInfo.swVersion,
   });


   payLoad = payloadSetup()

   console.log("Payload setup: ", payLoad);
   console.log("Payload setup length: ", payLoad.length);


   buff1 = parser.responseContructor(0x1C, 0x02, payLoad, payLoad.length, false);

   console.log("buff1 setup: " + buff1.data.toString('hex'));
   console.log("buff1 setup length: ", buff1.data.length)


   bleDosimacWrite(buff1.data);

}


// const payloadSetup = (): Buffer => {


//    console.log("Inside payloadSetup");
//    const payLoad = Buffer.alloc(148);

//    payLoad.writeUInt16LE(1, 0) //Version
//    payLoad.writeUInt16LE(1, 2) //Tipo de informacion=> Setup configuration

//    payLoad.write(dosimacSetup.ssid, 4, 32, 'utf16le') //ssid unicode 64bytes //
//    payLoad.write(dosimacSetup.wifiPassword, 68, 32, 'ascii') //password wifi 32bytes//
//    payLoad.write(dosimacSetup.serverIp, 100, 32, 'ascii') //ip servidor 32bytes //

//    payLoad.writeUInt16LE(dosimacSetup.deviceType, 132) //Tipo de equipo  2 byte //
//    payLoad.writeUInt8(dosimacSetup.phase, 134) //Fase 1 byte //
//    payLoad.writeUInt8(dosimacSetup.deviceNumber, 135) //Numero de maquina 2 byte //

//    //payLoad.writeBigUInt64LE(BigInt(dosimacSetup.nfcTag), 136) //tag ncf 64 bytes //payLoad.writeBigUInt64LE(0x0101010101010101n,136) //tag ncf 64 bytes
//    //payLoad.writeBigUInt64LE(0x0101010101010101n,136) //tag ncf 64 bytes

//    payLoad.writeUInt16LE(dosimacSetup.corral, 144) //corral 2 bytes

//    payLoad.writeUInt16LE(9, 146) //reserva 2 bytes





//    //* Test data
//    // payLoad.write("CTICONTROL_IN", 4, 32, 'utf16le') //ssid unicode 64bytes
//    // payLoad.write("Free43aba", 68, 32, 'ascii') //password wifi 32bytes
//    // payLoad.write("192.168.10.70", 100, 32, 'ascii') //ip servidor 32bytes

//    // payLoad.writeUInt16LE(1, 132) //Tipo de equipo  2 byte
//    // payLoad.writeUInt8(1, 134) //Fase 1 byte
//    // payLoad.writeUInt8(1, 135) //Numero de maquina 2 byte

//    // payLoad.writeInt32LE(0x01020304, 136) //tag ncf 64 bytes //payLoad.writeBigUInt64LE(0x0101010101010101n,136) //tag ncf 64 bytes


//    // payLoad.writeUInt16LE(278, 144) //corral 2 bytes
//    // payLoad.writeUInt16LE(9, 146) //reserva 2 bytes
//    //* End Test data

//    console.log("End payloadSetup");
//    return payLoad;
// }

// === ANDROID: dosimacBleMessages.ts ===
// const payloadSetup = (): Buffer => {
//    console.log("Inside payloadSetup");

//    const isI = dosimacSetup.deviceType === 200;
//    const isG = dosimacSetup.deviceType === 203;
//    const sw = dosimacInfo.swVersion || 0;
//    const allowUint32 = (isI && sw >= 155) || (isG && sw >= 134);

//    const baseLen = 148;                  // layout clásico
//    const extraLen = allowUint32 ? 4 : 0;  // +4 al final si usamos corral32
//    const payLoad = Buffer.alloc(baseLen + extraLen);

//    // Cabecera
//    payLoad.writeUInt16LE(1, 0); // Version
//    payLoad.writeUInt16LE(1, 2); // Tipo => Setup configuration

//    // Cadenas
//    payLoad.write(dosimacSetup.ssid, 4, 32, 'utf16le'); // 4..67 (64B)
//    payLoad.write(dosimacSetup.wifiPassword, 68, 32, 'ascii');   // 68..99
//    payLoad.write(dosimacSetup.serverIp, 100, 32, 'ascii');   // 100..131

//    // Campos fijos
//    payLoad.writeUInt16LE(dosimacSetup.deviceType, 132);
//    payLoad.writeUInt8(dosimacSetup.phase, 134);
//    payLoad.writeUInt8(dosimacSetup.deviceNumber, 135);

//    // 136..143 NFC (queda en 0 si no lo usas)

//    // Corral 16-bit legado en 144..145 (si hay 32-bit, aquí va 0)
//    payLoad.writeUInt16LE(allowUint32 ? 0 : dosimacSetup.corral, 144);

//    // Reserva 146..147
//    payLoad.writeUInt16LE(9, 146);

//    // Corral 32-bit solo si procede, AL FINAL (offset 148..151)
//    if (allowUint32) {
//       const c32 = (dosimacSetup as any).corral32 ?? 0;
//       payLoad.writeUInt32LE(c32, 148);
//    }

//    console.log(
//       `[DOSIMAC][SETUP] ${new Date().toISOString()} ` +
//       `build payload: len=${payLoad.length}, sw=${sw}, type=${dosimacSetup.deviceType}, ` +
//       `allowUint32=${allowUint32}, corral16=${allowUint32 ? 0 : dosimacSetup.corral}, ` +
//       `corral32=${(dosimacSetup as any).corral32 ?? 0}`
//    );

//    console.log("End payloadSetup");
//    return payLoad;
// };

const payloadSetup = (): Buffer => {
   console.log("Inside payloadSetup");

   const isI = dosimacSetup.deviceType === 200;
   const isG = dosimacSetup.deviceType === 203;
   const sw = dosimacInfo.swVersion || 0;
   const allowUint32 =
      (isI && sw >= 155) ||
      (isG && sw >= 134);

   // 🔥 CAMBIO CRÍTICO: Tamaño variable según versión
   const baseLen = 148;
   const extraLen = allowUint32 ? 4 : 0;
   const totalLen = baseLen + extraLen;

   console.log("[PAYLOAD] ===== ANÁLISIS DETALLADO =====");
   console.log("[PAYLOAD] deviceType:", dosimacSetup.deviceType);
   console.log("[PAYLOAD] swVersion:", sw);
   console.log("[PAYLOAD] isI:", isI, "isG:", isG);
   console.log("[PAYLOAD] allowUint32:", allowUint32);
   console.log("[PAYLOAD] corral (uint16):", dosimacSetup.corral);
   console.log("[PAYLOAD] corral32:", (dosimacSetup as any).corral32);
   console.log("[PAYLOAD] totalLen:", totalLen, `(${baseLen} + ${extraLen})`);
   console.log("[PAYLOAD] ===========================");

   // 🔥 CAMBIO: Tamaño variable
   const payLoad = Buffer.alloc(totalLen);

   // Cabecera
   payLoad.writeUInt16LE(1, 0); // Versión
   payLoad.writeUInt16LE(1, 2); // Tipo => Setup configuration

   // Cadenas
   payLoad.write(dosimacSetup.ssid, 4, 32, "utf16le");    // 4..67 (64B)
   payLoad.write(dosimacSetup.wifiPassword, 68, 32, "ascii"); // 68..99
   payLoad.write(dosimacSetup.serverIp, 100, 32, "ascii");    // 100..131

   // Campos fijos
   payLoad.writeUInt16LE(dosimacSetup.deviceType, 132); // 132..133
   payLoad.writeUInt8(dosimacSetup.phase, 134);         // 134
   payLoad.writeUInt8(dosimacSetup.deviceNumber, 135);  // 135

   if (allowUint32) {
      // 🔥 VERSIÓN NUEVA: corral32
      const c32 = (dosimacSetup as any).corral32 ?? 0;

      // NFC a 0 (136..143)
      payLoad.fill(0, 136, 144);

      // Corral16 legado a 0 (144..145)
      payLoad.writeUInt16LE(0, 144);

      // Reserva (146..147)
      payLoad.writeUInt16LE(9, 146);

      // 🔥 CRÍTICO: Corral32 AL FINAL (148..151)
      payLoad.writeUInt32LE(c32, 148);

      console.log(`[PAYLOAD] ✅ Modo corral32: ${c32} en posición 148-151`);
   } else {
      // 🔥 VERSIÓN ANTIGUA: corral16

      // NFC a 0 (136..143)
      payLoad.fill(0, 136, 144);

      // Corral16 (144..145)
      payLoad.writeUInt16LE(dosimacSetup.corral, 144);

      // Reserva (146..147)
      payLoad.writeUInt16LE(9, 146);

      console.log(`[PAYLOAD] ✅ Modo corral16: ${dosimacSetup.corral} en posición 144-145`);
   }

   console.log(
      `[DOSIMAC][SETUP] ${new Date().toISOString()} ` +
      `len=${payLoad.length}, sw=${sw}, type=${dosimacSetup.deviceType}, ` +
      `allowUint32=${allowUint32}, corral16=${dosimacSetup.corral}, ` +
      `corral32=${(dosimacSetup as any).corral32 ?? 0}`
   );

   // 🔥 NUEVO: Log del payload completo en HEX para debug
   console.log("[PAYLOAD] Payload HEX:", payLoad.toString('hex'));
   console.log("[PAYLOAD] Últimos 8 bytes:", payLoad.slice(-8).toString('hex'));

   console.log("End payloadSetup");
   return payLoad;
};
export const pcomProccessResponse = (response: Buffer, length: number) => {

   parser.doParser(response, length);
   pcomResponseClassifier();

}

export const pcomResponseClassifier = () => {

   console.log("******* RESPUESTA DOSIMAC BLE ******");

   if (parser.frameType === 28) {


      if (!parser.crcOk) {
         console.log("****--- CRC ERRONEO ---***");
      }

      switch (parser.msgType) {
         case 0x01:
            console.log("--- El movil puede enviar datos al dispositivo ---")
            requestState.responseRecieved = 1;
            setupState.responseRecieved = 1;
            break;
         case 0x02:
            setupState.responseRecieved = 1;

            console.log("--- Recibida trama de configuración ---")
            break;

         case 0x03:
            console.log("--- Procesamos Trama peticion estado ---")
            pcomresponseStatus();
            break;
         case 0x04:
            console.log("--- Recibida trama de peticion de estado ---")
            break;

      }
   }
   else {
      console.log("Error en el tipo de trama. Trama no esperada ", parser.frameType);
   }
}

const pcomresponseStatus = () => {


   //parser.payLoad.copy(dosimacInfo as unknown as Uint8Array ,0,0,parser.payLoad.length)
   //let dosimacInfox: DosimacInfo = {};

   // dosimacInfo.deviceIp="hola mundo"
   // console.log(dosimacInfo);


   requestState.responseRecieved = parser.payLoad.readUint16LE(2);
   setupState.responseRecieved = requestState.responseRecieved;
   console.log("(pcomresponseStatus): " + requestState.responseRecieved)

   if (requestState.responseRecieved === 2) { // || requestState.responseRecieved===4) {
      console.log("ES UNA TRAMA DE RESPUESTRA (pcomresponseStatus): " + requestState.responseRecieved)
      //Son respuestas sin carga de datos
      return;
   }



   dosimacInfo.deviceIp = parser.payLoad.toString('ascii', 132, 164);
   dosimacInfo.ssid = parser.payLoad.toString("utf16le", 4, 68);
   dosimacInfo.wifiPassword = parser.payLoad.toString('ascii', 68, 100);
   dosimacInfo.serverIp = parser.payLoad.toString('ascii', 100, 132);
   dosimacInfo.deviceIp = parser.payLoad.toString('ascii', 132, 164);
   dosimacInfo.gateWay = parser.payLoad.toString('ascii', 164, 196);
   dosimacInfo.subnetMask = parser.payLoad.toString('ascii', 196, 228);
   dosimacInfo.deviceType = parser.payLoad.readUint16LE(228);
   dosimacInfo.phase = parser.payLoad.readUint8(230); //parseInt(parser.payLoad.toString('hex', 230, 231));
   dosimacInfo.deviceNumber = parser.payLoad.readUint8(231);
   dosimacInfo.nfcTag = parser.payLoad.toString('hex', 232, 240);
   dosimacInfo.corral = parser.payLoad.readUint16LE(240);
   dosimacInfo.connectionState = parser.payLoad.readUint8(242)
   dosimacInfo.deviceState = parser.payLoad.readUint8(243)
   dosimacInfo.idAnimal = parser.payLoad.readUint32LE(244) //  parseInt(parser.payLoad.toString('hex', 244, 248)); //hex
   dosimacInfo.crotal = parseInt(parser.payLoad.toString('hex', 248, 256)); //hex
   dosimacInfo.swVersion = parser.payLoad.readUint16LE(256)
   dosimacInfo.hwVersion = parser.payLoad.readUint16LE(258)

   const corral16 = parser.payLoad.readUInt16LE(240); // legado
   const corral32 = parser.payLoad.readUInt32LE(136); // nuevo (STATUS lo trae aquí)

   const isI = dosimacInfo.deviceType === 200;
   const isG = dosimacInfo.deviceType === 203;
   const allowUint32 =
      (isI && dosimacInfo.swVersion >= 155) ||
      (isG && dosimacInfo.swVersion >= 134);

   const corralEfectivo = allowUint32 ? (corral16 === 0 ? corral32 : corral16) : corral16;
   dosimacInfo.corral = corralEfectivo;

   console.log(
      `[DOSIMAC][STATUS] v=${dosimacInfo.swVersion} type=${dosimacInfo.deviceType} ` +
      `allow32=${allowUint32} corral16=${corral16} corral32=${corral32} => efectivo=${corralEfectivo}`
   );
   console.log(
      `[DOSIMAC][STATUS] ${new Date().toISOString()} ` +
      `swVersion=${dosimacInfo.swVersion} hwVersion=${dosimacInfo.hwVersion} deviceType=${dosimacInfo.deviceType}`
   );





   // dosimacInfo.deviceType = parseInt(parser.payLoad.toString('hex', 228, 230));
   // dosimacInfo.phase = parseInt(parser.payLoad.toString('hex', 230, 231));
   // dosimacInfo.deviceNumber = parseInt(parser.payLoad.toString('hex', 231, 232));
   // dosimacInfo.nfcTag = parser.payLoad.toString('hex', 232, 240);
   // dosimacInfo.corral = parseInt(parser.payLoad.toString('hex', 240, 242));
   // dosimacInfo.connectionState = parseInt(parser.payLoad.toString('hex', 242, 243)); //hex
   // dosimacInfo.deviceState = parseInt(parser.payLoad.toString('hex', 243, 244)); //hex
   // dosimacInfo.idAnimal = parseInt(parser.payLoad.toString('hex', 244, 248)); //hex
   // dosimacInfo.crotal = parseInt(parser.payLoad.toString('hex', 248, 256)); //hex
   // dosimacInfo.swVersion = parseInt(parser.payLoad.toString('hex', 256, 258)); //hex
   // dosimacInfo.hwVersion = parseInt(parser.payLoad.toString('hex', 258, 260)); //hex

   masterState.dInfoComState = dosimacInfo.connectionState;
   masterState.dInfomanState = dosimacInfo.deviceState;


   //Visualizacion de datos
   if (process.env.BUILD_MODE === 'DEBUG') {

      console.log(parser.payLoad.toString('hex', 0, parser.payLoadSize));


      console.log("Version: ", parser.payLoad.readUint16LE(0).toString(16)) //Version
      console.log("Tipo Informacion: ", parser.payLoad.readUInt16LE(2).toString(16)) //Tipo de informacion=> Setup configuration

      console.log("SSID: ", dosimacInfo.ssid) //ssid unicode 64bytes
      console.log("WIFI PSW: ", dosimacInfo.wifiPassword) //password wifi 32bytes
      console.log("IP servidor: ", dosimacInfo.serverIp) //ip servidor 32bytes
      console.log("IP equipo: ", dosimacInfo.deviceIp) //ip servidor 32bytes
      console.log("IP Gateway: ", dosimacInfo.gateWay) //ip servidor 32bytes
      console.log("Net mask ", dosimacInfo.subnetMask) //ip servidor 32bytes
      console.log("Tipo equipo: ", dosimacInfo.deviceType)
      console.log("Nu Fase: ", dosimacInfo.phase) //Fase 1 byte
      console.log("Nu Maquina: ", dosimacInfo.deviceNumber) //Numero de maquina 2 byte
      console.log("Tag NFC: ", dosimacInfo.nfcTag) //tag ncf 8 bytes
      console.log("Nu corral: ", dosimacInfo.corral) //corral 2 bytes
      console.log("Estado conexion: ", dosimacInfo.connectionState) //Fase 1 byte
      console.log("Estado equipo: ", dosimacInfo.deviceState) //Fase 1 byte
      console.log("Id animal: ", dosimacInfo.idAnimal) //corral 2 bytes
      console.log("Crotal: ", dosimacInfo.crotal) //corral 2 bytes
      console.log("Version SW: ", dosimacInfo.swVersion) //reserva 2 bytes
      console.log("Version hW: ", dosimacInfo.hwVersion) //reserva 2 bytes
   }


   // console.log("Version: ", parser.payLoad.readUint16LE(0).toString(16)) //Version
   // console.log("Tipo Informacion: ", parser.payLoad.readUInt16LE(2).toString(16)) //Tipo de informacion=> Setup configuration

   // console.log("SSID: ", parser.payLoad.toString("utf16le", 4, 68)) //ssid unicode 64bytes
   // console.log("SSID PSW: ", parser.payLoad.toString('ascii', 68, 100)) //password wifi 32bytes
   // console.log("IP servidor: ", parser.payLoad.toString('ascii', 100, 132)) //ip servidor 32bytes
   // console.log("IP equipo: ", parser.payLoad.toString('ascii', 132, 164)) //ip servidor 32bytes
   // console.log("IP Gateway: ", parser.payLoad.toString('ascii', 164, 196)) //ip servidor 32bytes
   // console.log("Net mask ", parser.payLoad.toString('ascii', 196, 228)) //ip servidor 32bytes
   // console.log("Tipo equipo: ", parser.payLoad.toString('hex', 228, 230))
   // console.log("Nu Fase: ", parser.payLoad.toString('hex', 230, 231)) //Fase 1 byte
   // console.log("Nu Maquina: ", parser.payLoad.toString('hex', 231, 232)) //Numero de maquina 2 byte
   // console.log("Tag NFC: ", parser.payLoad.toString('hex', 232, 240)) //tag ncf 8 bytes
   // console.log("Nu corral: ", parser.payLoad.toString('hex', 240, 242)) //corral 2 bytes
   // console.log("Estado conexion: ", parser.payLoad.toString('hex', 242, 243)) //Fase 1 byte
   // console.log("Estado equipo: ", parser.payLoad.toString('hex', 243, 244)) //Fase 1 byte
   // console.log("Id animal: ", parser.payLoad.toString('hex', 244, 248)) //corral 2 bytes
   // console.log("Crotal: ", parser.payLoad.toString('hex', 248, 256)) //corral 2 bytes
   // console.log("Version SW: ", parser.payLoad.toString('hex', 256, 258)) //reserva 2 bytes
   // console.log("Version hW: ", parser.payLoad.toString('hex', 258, 260)) //reserva 2 bytes




}



const pcomInicializeDosimacInfo = () => {

   dosimacInfo.deviceIp = "";
   dosimacInfo.ssid = "";
   dosimacInfo.wifiPassword = "";
   dosimacInfo.serverIp = "";
   dosimacInfo.deviceIp = "";
   dosimacInfo.gateWay = "";
   dosimacInfo.subnetMask = "";
   dosimacInfo.deviceType = 0;
   dosimacInfo.phase = 0;
   dosimacInfo.deviceNumber = 0;
   dosimacInfo.nfcTag = "";
   dosimacInfo.corral = 0;
   dosimacInfo.connectionState = 0;
   dosimacInfo.deviceState = 0;
   dosimacInfo.idAnimal = 0;
   dosimacInfo.crotal = parseInt(parser.payLoad.toString('hex', 248, 256)); //hex
   dosimacInfo.swVersion = 0;
   dosimacInfo.hwVersion = 0;

}

//**** MAQUINAS DE ESTADO DEL PROTOCOLO */
const inicializeSMS = (man: STMinfo): STMinfo => {

   man.state = 0;
   man.error = 0;
   man.responseRecieved = 0;
   man.waitRetries = 0;
   man.stateRetries = 0;

   return man;

}
const startMasterStateMachine = () => {
   if (masterState.timerId) {
      clearTimeout(masterState.timerId);
      masterState.timerId = null;
   }

   masterState.timerId = setTimeout(() => {
      masterStateMachine();
   }, 200); // pequeño retraso inicial
};


export const pcomActiveRequestState = (deviceId: string) => {  // 🔥 Recibe deviceId
   console.log("[pcomActiveRequestState] ===== INICIANDO REQUEST STATE =====");

   // 🔥 Aquí SÍ reseteamos TODO porque vamos a pedir info nueva
   resetAllStates();

   if (masterState.timerId !== undefined) {
      clearTimeout(masterState.timerId);
   }

   inicializeSMS(requestState);
   inicializeSMS(inicialState);

   masterState.forceStop = false;
   masterState.unControlError = false;
   masterState.isInitialized = false;
   masterState.bleDevice = deviceId;
   masterState.actualJob = 1;

   startMasterStateMachine();
};
// Añadir esta función NUEVA para reset selectivo
const resetStateMachines = () => {
   console.log("[RESET] Reseteando solo máquinas de estado");

   // Resetear máquinas de estado
   requestState = { state: 0, responseRecieved: 0, waitRetries: 0, stateRetries: 0, error: 0 };
   setupState = { state: 0, responseRecieved: 0, waitRetries: 0, stateRetries: 0, error: 0 };
   inicialState = { state: 0, responseRecieved: 0, waitRetries: 0, stateRetries: 0, error: 0 };

   // Resetear masterState
   if (masterState.timerId) {
      clearTimeout(masterState.timerId);
   }
   const oldDevice = masterState.bleDevice;
   masterState = {
      actualJob: 0,
      timerId: null,
      isInitialized: false,
      bleDevice: oldDevice,
      dInfoComState: -1,
      dInfomanState: 0,
      forceStop: false,
      unControlError: false,
   };

   console.log("[RESET] ✅ Máquinas de estado reseteadas");
};

// Función existente - ahora también resetea dosimacInfo
const resetAllStates = () => {
   console.log("[RESET] Reseteando TODOS los estados (incluido dosimacInfo)");

   resetStateMachines();

   // Resetear dosimacInfo
   pcomInicializeDosimacInfo();

   console.log("[RESET] ✅ Todo reseteado (estados + dosimacInfo)");
};
// const resetAllStates = () => {
//    console.log("[RESET] Reseteando TODOS los estados antes de nueva configuración");

//    // Resetear máquinas de estado
//    requestState = { state: 0, responseRecieved: 0, waitRetries: 0, stateRetries: 0, error: 0 };
//    setupState = { state: 0, responseRecieved: 0, waitRetries: 0, stateRetries: 0, error: 0 };
//    inicialState = { state: 0, responseRecieved: 0, waitRetries: 0, stateRetries: 0, error: 0 };

//    // Resetear masterState
//    if (masterState.timerId) {
//       clearTimeout(masterState.timerId);
//    }
//    const oldDevice = masterState.bleDevice;
//    masterState = {
//       actualJob: 0,
//       timerId: null,
//       isInitialized: false,
//       bleDevice: oldDevice,
//       dInfoComState: -1,
//       dInfomanState: 0,
//       forceStop: false,
//       unControlError: false,
//    };

//    // Resetear dosimacInfo
//    pcomInicializeDosimacInfo();

//    console.log("[RESET] ✅ Todos los estados reseteados");
// };


export const pcomActiveSetupState = (deviceId: string) => {
   console.log("[pcomActiveSetupState] ===== INICIANDO SETUP STATE =====");
   console.log("[pcomActiveSetupState] ANTES del reset:");
   console.log("[pcomActiveSetupState] dosimacSetup.corral:", dosimacSetup.corral);
   console.log("[pcomActiveSetupState] dosimacSetup.deviceNumber:", dosimacSetup.deviceNumber);
   console.log("[pcomActiveSetupState] dosimacInfo.swVersion:", dosimacInfo.swVersion);

   // 🔥 CAMBIO: Usar resetStateMachines en vez de resetAllStates
   // Esto NO resetea dosimacInfo, preservando swVersion
   resetStateMachines();

   if (masterState.timerId !== undefined) {
      clearTimeout(masterState.timerId);
   }

   inicializeSMS(setupState);
   inicializeSMS(inicialState);

   masterState.forceStop = false;
   masterState.unControlError = false;
   masterState.isInitialized = false;

   // 🔥 CRÍTICO: Establecer el device ID ANTES de arrancar
   masterState.bleDevice = deviceId;

   console.log("[pcomActiveSetupState] DESPUÉS del reset:");
   console.log("[pcomActiveSetupState] dosimacSetup.corral:", dosimacSetup.corral);
   console.log("[pcomActiveSetupState] dosimacSetup.deviceNumber:", dosimacSetup.deviceNumber);
   console.log("[pcomActiveSetupState] dosimacInfo.swVersion:", dosimacInfo.swVersion);
   console.log("[pcomActiveSetupState] bleDevice establecido:", masterState.bleDevice);

   masterState.actualJob = 2;

   startMasterStateMachine();
};

export const pcomSetDeviceId = (id: string) => {

   masterState.bleDevice = id;
   console.log("masterState.bleDevice: ", masterState.bleDevice);

}


export const pcomStopStateMachine = () => {
   if (masterState.timerId) {
      clearTimeout(masterState.timerId);
      masterState.timerId = null;
   }

   bleDisconnection(masterState.bleDevice);
   masterState.actualJob = 0;
   masterState.isInitialized = false;
   masterState.forceStop = true;
};


export const pcomCheckStatus = (): MasterState => {

   return masterState;
}

// Esta función hace el trabajo y reprograma el siguiente ciclo
const masterStateMachine = () => {
   let delay: number = 200; // valor por defecto

   if (!masterState.isInitialized) {
      if (masterState.forceStop) {
         // Si quieres que se pare del todo, simplemente no reprogramas nada
         return;
      }
      delay = inicialStateMachine();
   } else {
      switch (masterState.actualJob) {
         case 0:
            delay = 100;
            break;
         case 1:
            delay = stateMachineRequestState();
            break;
         case 2:
            delay = stateMachineSetupConfiguration();
            break;
         default:
            delay = 0;
            break;
      }
   }

   // Por seguridad: si hemos marcado que hay que parar, no continuamos
   if (masterState.forceStop) {
      return;
   }

   // ---- parte importante: limpiar y reprogramar ----
   if (masterState.timerId) {
      clearTimeout(masterState.timerId);
      masterState.timerId = null;
   }

   masterState.timerId = setTimeout(() => {
      masterStateMachine();
   }, delay);
};




const inicialStateMachine = (): number => {

   console.log("Inical state machine: ", inicialState.state);

   switch (inicialState.state) {
      case 0:
         console.log("Connecting to BLE Device: ", masterState.bleDevice);
         bleConnection(masterState.bleDevice);
         inicialState.state++;
         return 3000; //Wait 1 second before send MTU
         break;
      case 1:
         console.log("Subscribing to notifications");
         bleSubscribeNotify();
         inicialState.state++;
         return 200; //Wait 1 second before send MTU
         break;
      case 2:
         console.log("Requesting MTU");
         blehandleMTU();
         inicialState.state++;
         return 200; //
         break;
      case 3:
         console.log("Initialization completed");
         masterState.isInitialized = true;
         inicialState.state = 0;
         return 100; //
         break;
      default:
         return 100; //
         break;
   }


}

export const stateMachineRequestState = (): number => {

   console.log("stateMachineRequestState REQUEST: ", requestState.state, requestState.responseRecieved);

   switch (requestState.state) {
      case 0:
         requestState.responseRecieved = 0;
         pcomSendB();
         requestState.state++;
         return 200;
         break;
      case 1:
         if (requestState.responseRecieved === 0) {
            //Error: No ha llegado la respuesta. 
            requestState.waitRetries++;
            if (requestState.waitRetries > 60) {
               requestState.state = 0;
               requestState.waitRetries = 0;
               if (requestState.stateRetries < 3)
                  requestState.stateRetries++;
               else {
                  requestState.stateRetries = 0;
                  masterState.unControlError = true;
                  return 500; //! DEBE DAR ERROR

               }
            }
            return 200;
         }
         else { //Correcto: solo puede entrar aqui con un 1

            //requestState.state = 0;
            requestState.stateRetries = 0;
            requestState.waitRetries = 0;
            pcomRequestDosimacStatus();
            requestState.state = 0;
            return 2000; //Pido estado cada 2 segundos
         }
         break;
      case 2:
         requestState.state = 0;
         requestState.stateRetries = 0;
         requestState.waitRetries = 0;
         return 200;

         break;
      default:
         return 0;
         break;

   }



}


export const stateMachineSetupConfiguration = (): number => {

   console.log("stateMachine SETUP State: ", setupState.state, setupState.responseRecieved);

   switch (setupState.state) {
      case 0:
         setupState.responseRecieved = 0;
         pcomSendB();
         setupState.state++;
         console.log("HE ENVIADO LA B ************************************************")
         return 200;
         break;
      case 1:
         if (setupState.responseRecieved === 0) {
            //Error: No ha llegado la respuesta. 
            setupState.waitRetries++;
            if (setupState.waitRetries > 60) {
               setupState.state = 0;
               setupState.waitRetries = 0;
               if (setupState.stateRetries < 3)
                  setupState.stateRetries++;
               else {
                  setupState.stateRetries = 0;
                  masterState.unControlError = true;
                  return 500; //! DEBE DAR ERROR

               }
            }
            return 200;
         }
         else { //Correcto: solo puede entrar aqui con un 1

            //requestState.state = 0;
            setupState.stateRetries = 0;
            setupState.waitRetries = 0;
            setupState.responseRecieved = 0;
            setupState.state++;
            pcomDosimacSetup();

            return 300;
         }
         break;
      case 2:
         if (setupState.responseRecieved === 0) {
            setupState.waitRetries++;
            if (setupState.waitRetries > 10) {
               setupState.state = 0;
               setupState.waitRetries = 0;
               if (setupState.stateRetries < 3)
                  setupState.stateRetries++;
               else {
                  setupState.stateRetries = 0;
                  return 100; //! DEBE DAR ERROR

               }
            }

         }
         else {
            //Respuesta recibida->Todo OK
            //Hay que parar esta maquina de estados y pasar a la que pide el estado
            console.log("Vamos a RequestState");
            // pcomActiveRequestState();
            setupState.stateRetries = 0;
            setupState.waitRetries = 0;
            setupState.responseRecieved = 0;
            setupState.state++;
            return 1500;

         }
         return 500;

         break;
      case 3:

         pcomActiveRequestState(masterState.bleDevice);
         return 500;

   }

   return 5;

}





function getSecondsSince(start: Date): number {
   const now = new Date();
   const differenceInMilliseconds = now.getTime() - start.getTime();
   const differenceInSeconds = Math.floor(differenceInMilliseconds / 1000);
   return differenceInSeconds;
}

const start = new Date();
// Wait for some time...
console.log(getSecondsSince(start)); // This will log the number of seconds since `start`