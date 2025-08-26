//Parseado de la informacion recibida

import { Buffer } from 'buffer';
import { bleDosimacWrite } from '../../device/ble/bleLibrary';
import { BLETestingScreen } from '../../presentation/screens/Debug/BLETesting/BLETestingScreen';


type FrameMsg = {
   data: Buffer,
   length: number
}

// type SendFuntion = (data: Buffer, functionSend:()=>{}) => functionSend(data);


//CRC16 IBM litle indian
//CRC16 ARC
const crc16ibm = (data: Buffer,length:number) => {

   const table = [
         0x0000, 0xc0c1, 0xc181, 0x0140, 0xc301, 0x03c0, 0x0280, 0xc241,
         0xc601, 0x06c0, 0x0780, 0xc741, 0x0500, 0xc5c1, 0xc481, 0x0440,
         0xcc01, 0x0cc0, 0x0d80, 0xcd41, 0x0f00, 0xcfc1, 0xce81, 0x0e40,
         0x0a00, 0xcac1, 0xcb81, 0x0b40, 0xc901, 0x09c0, 0x0880, 0xc841,
         0xd801, 0x18c0, 0x1980, 0xd941, 0x1b00, 0xdbc1, 0xda81, 0x1a40,
         0x1e00, 0xdec1, 0xdf81, 0x1f40, 0xdd01, 0x1dc0, 0x1c80, 0xdc41,
         0x1400, 0xd4c1, 0xd581, 0x1540, 0xd701, 0x17c0, 0x1680, 0xd641,
         0xd201, 0x12c0, 0x1380, 0xd341, 0x1100, 0xd1c1, 0xd081, 0x1040,
         0xf001, 0x30c0, 0x3180, 0xf141, 0x3300, 0xf3c1, 0xf281, 0x3240,
         0x3600, 0xf6c1, 0xf781, 0x3740, 0xf501, 0x35c0, 0x3480, 0xf441,
         0x3c00, 0xfcc1, 0xfd81, 0x3d40, 0xff01, 0x3fc0, 0x3e80, 0xfe41,
         0xfa01, 0x3ac0, 0x3b80, 0xfb41, 0x3900, 0xf9c1, 0xf881, 0x3840,
         0x2800, 0xe8c1, 0xe981, 0x2940, 0xeb01, 0x2bc0, 0x2a80, 0xea41,
         0xee01, 0x2ec0, 0x2f80, 0xef41, 0x2d00, 0xedc1, 0xec81, 0x2c40,
         0xe401, 0x24c0, 0x2580, 0xe541, 0x2700, 0xe7c1, 0xe681, 0x2640,
         0x2200, 0xe2c1, 0xe381, 0x2340, 0xe101, 0x21c0, 0x2080, 0xe041,
         0xa001, 0x60c0, 0x6180, 0xa141, 0x6300, 0xa3c1, 0xa281, 0x6240,
         0x6600, 0xa6c1, 0xa781, 0x6740, 0xa501, 0x65c0, 0x6480, 0xa441,
         0x6c00, 0xacc1, 0xad81, 0x6d40, 0xaf01, 0x6fc0, 0x6e80, 0xae41,
         0xaa01, 0x6ac0, 0x6b80, 0xab41, 0x6900, 0xa9c1, 0xa881, 0x6840,
         0x7800, 0xb8c1, 0xb981, 0x7940, 0xbb01, 0x7bc0, 0x7a80, 0xba41,
         0xbe01, 0x7ec0, 0x7f80, 0xbf41, 0x7d00, 0xbdc1, 0xbc81, 0x7c40,
         0xb401, 0x74c0, 0x7580, 0xb541, 0x7700, 0xb7c1, 0xb681, 0x7640,
         0x7200, 0xb2c1, 0xb381, 0x7340, 0xb101, 0x71c0, 0x7080, 0xb041,
         0x5000, 0x90c1, 0x9181, 0x5140, 0x9301, 0x53c0, 0x5280, 0x9241,
         0x9601, 0x56c0, 0x5780, 0x9741, 0x5500, 0x95c1, 0x9481, 0x5440,
         0x9c01, 0x5cc0, 0x5d80, 0x9d41, 0x5f00, 0x9fc1, 0x9e81, 0x5e40,
         0x5a00, 0x9ac1, 0x9b81, 0x5b40, 0x9901, 0x59c0, 0x5880, 0x9841,
         0x8801, 0x48c0, 0x4980, 0x8941, 0x4b00, 0x8bc1, 0x8a81, 0x4a40,
         0x4e00, 0x8ec1, 0x8f81, 0x4f40, 0x8d01, 0x4dc0, 0x4c80, 0x8c41,
         0x4400, 0x84c1, 0x8581, 0x4540, 0x8701, 0x47c0, 0x4680, 0x8641,
         0x8201, 0x42c0, 0x4380, 0x8341, 0x4100, 0x81c1, 0x8081, 0x4040
   ];

   
   let crc = 0x0000;
   for (let i = 0; i < length; i++)
         crc = (crc >>> 8) ^ table[(crc ^ data[i]) & 0xff];

   // for( const byte of data ){
   //     crc = crc >>> 8 ^ table[ ( crc ^ byte ) & 0xff ];       
   // }

   //**The result is in big endian**
   // We need to swap bytes since we have to compare with  data which comes
   // in little endian
   return ((crc  & 0xFF) << 8)
   | ((crc >> 8) & 0xFF);

   //return crc;
};



export class Parser {

   private packetHeader: number;
   private packetTail:number;
   private crc:number;
   private protocolVersion:number;
   private originNode:number;
   private destinyNode:number;
   private reserved:number;

   public frameType:number;
   public msgType:number;
   public payLoadSize:number;
   public payLoad:Buffer;
   public crcOk:boolean;

   private crcMsgSegment:Buffer;
   private crcMsgSegmentSize:number;
   private crcCalculated:number;
   
   private response:Buffer;
   private responseSize:number;
   // private msg
   

   
   constructor() {
      this.response = Buffer.alloc(3000);
      this.packetHeader = 0;
      this.packetTail = 0;
      this.crc = 0;
      this.reserved =0;
      this.protocolVersion = 0;
      this.originNode = 0;
      this.destinyNode = 0;
      this.frameType = 0;
      this.msgType = 0;
      this.payLoadSize = 0;
      this.payLoad = Buffer.alloc(2500);
      this.crcMsgSegment = Buffer.alloc(2500);
      this.crcMsgSegmentSize = 0;
      this.crcCalculated = 0;
      this.crcOk = false;
      this.responseSize = 0;

      // console.log("CTI Parser2 constructor");
   }

   doParser(msg:Buffer, msgLength:number){

      //Minimum length of a frame is 20 bytes
      // if (msg.length < 20)
      //    return;
      
      this.crcOk = false;
      this.packetHeader = msg.readUInt32BE(0); //offset: 0 - 4 bytes //msg.toString("hex",0,4);
      this.protocolVersion = msg.readUInt8(4); //offset: 4 - 1  bytes// msg.toString("hex",4,5);
      this.reserved=msg.readUInt8(5); //offset: 5 - 1  bytes
      this.originNode = msg.readUInt16LE(6); //offset: 6 - 1  bytes//msg.toString("hex",6,8);
      this.destinyNode = msg.readUInt16LE(8); //offset: 8 - 1  bytes //msg.toString("hex",8,10);
      this.frameType = msg.readUInt8(10);
      this.msgType = msg.readUInt8(11);
      this.payLoadSize = msg.readUInt16LE(12);
      //msg.copy(this.payLoad,0,14,this.payLoadSize) // msg.toString("hex",14,msg.length-6);
      msg.copy(this.payLoad,0,14,msgLength-6) // msg.toString("hex",14,msg.length-6);
      console.log('---PayLoad:---- '+this.payLoad.toString("hex",0,this.payLoadSize))     
      this.crc = msg.readUInt16BE(msgLength-6) // msg.toString("hex",msg.length-6,msg.length-4);
      this.packetTail = msg.readUInt32BE(msgLength-4)  //offset: msg.length-4 - 4 bytes //msg.toString("hex",msg.length-4,msg.length);
      
      //Crc calculations
      msg.copy(this.crcMsgSegment,0,4,msgLength-6)
      this.crcMsgSegmentSize = msgLength-10;

      //const buffx=Buffer.from(this.crcMsgSegment,  0,this.crcMsgSegmentSize)
      // this.crcCalculated = crc16ibm(buffx,this.crcMsgSegmentSize);
      this.crcCalculated = crc16ibm(this.crcMsgSegment,this.crcMsgSegmentSize);
      if (this.crcCalculated == this.crc)
         this.crcOk = true;
      else
         this.crcOk = false;

      
      

      if (process.env.BUILD_MODE==='DEBUG') 

      {
         console.log("***** CTI Parser ******")
         console.log('---Received Msg Parser: ',msg.toString('hex'));
         console.log('---Received Msg Parser size: ',msgLength);

         console.log('Packet Header: '+this.packetHeader.toString(16))

         console.log('Protocol Version: '+this.protocolVersion)
         console.log('Origin Node: '+this.originNode)
         console.log('Destiny Node: '+this.destinyNode)
         console.log('Frame Type: '+this.frameType)
         console.log('Msg Type: '+this.msgType)
         console.log('Pay Load Size: '+this.payLoadSize)
         console.log('PayLoad: '+this.payLoad.toString("hex",0,this.payLoadSize))
         console.log('CRC: '+this.crc.toString(16))
         console.log('Packet Tail: '+this.packetTail.toString(16))
         
         // console.log('CRC Segment: '+this.crcMsgSegment.toString('hex',0,this.crcMsgSegmentSize))
         console.log('CRC Segment size:'+this.crcMsgSegmentSize)
         // console.log(Buffer.from(this.crcSegment,'hex'))

         console.log('CRC calculated IBM litle indian: '+this.crcCalculated.toString(16))

         
         if (this.crcOk)
            console.log('CRC OK')
         else
            console.log('CRC Error')

         console.log("***** END CTI Parser ******")
      }
   }

    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    responseContructor=(frameType:number,msgType:number,payLoad:Buffer,payLoadSize:number,send:boolean=false):FrameMsg =>{
      
      this.responseSize = 20+payLoadSize;

      this.response.writeUInt32BE(parseInt('0xccaaaaaa'),0); //Packet header 4 bytes
      this.response.writeUInt8(2,4); //Protocol version 1 byte
      this.response.writeUInt8(0,5); //reserved 1 byte
      this.response.writeUInt16LE(0,6); //Origin node 2 byte
      this.response.writeUInt16LE(0,8); //destination node 2 byte
      this.response.writeUInt8(frameType,10); //frame type 1 byte
      this.response.writeUInt8(msgType,11); //msg type 1 byte
      this.response.writeUInt16LE(payLoadSize,12); //payload size 2 bytes
      payLoad.copy(this.response,14,0,payLoadSize)
      
      this.response.copy(this.crcMsgSegment,0,4,this.responseSize-6)
      this.crcMsgSegmentSize = this.responseSize-10;

      this.crc = crc16ibm(this.crcMsgSegment,this.crcMsgSegmentSize);

      this.response.writeUInt16BE(this.crc,14+payLoadSize); //CRC 2 bytes
      this.response.writeUInt32BE(parseInt('0xccbbbbbb'),16+payLoadSize); //Packet Tail  4 bytes


      const buffRest:Buffer=Buffer.allocUnsafe(this.responseSize);
      this.response.copy(buffRest,0,0,this.responseSize);


      console.log('RESPUESTA RESPONSE CONSTRUCTOR: ',buffRest.toString('hex'));
      console.log('RESPUESTA RESPONSE CONSTRUCTOR size: ',this.responseSize);

      if (send) {
         bleDosimacWrite(buffRest);
      }
      return ({data:buffRest,length:this.responseSize}); 

      // return ({data:this.response,length:this.responseSize}); 
    }

    testresponse=()=>{ 

      console.log("***** Test response *****")

      let payload:Buffer;

      payload=Buffer.from("010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",'hex');

      console.log('payload: ', payload.toString('hex'));
      const respuesta:FrameMsg=this.responseContructor(0x1C,0x01,payload,payload.length);

      this.doParser(Buffer.from(respuesta.data,0,respuesta.length),respuesta.length);

    }
   

}
   

