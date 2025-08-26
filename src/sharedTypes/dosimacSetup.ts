export interface DosimacSetup {

   ssid: string;
   wifiPassword: string;
   serverIp: string;
   deviceType:number;
   phase:number;
   deviceNumber:number;
   nfcTag:string;
   corral:number;

}


export interface DosimacInfo extends DosimacSetup{
   deviceIp: string;
   gateWay:string;
   subnetMask:string;
   connectionState:number;
   deviceState:number;
   idAnimal:number; //Número del animal
   crotal:number;
   swVersion:number;
   hwVersion:number;

   
}



