/* eslint-disable prettier/prettier */

export enum eCorralStatus {Empty}
export enum eAnimalSubstate {Prepartum,Lactation,Weaning}
export enum eAnimalPhase{Cubricion,Gestation,Maternity,OutCubrion,OutGestation,OutMaternity}

export interface CorralMatInfo {
   animal: AnimalInfo ;
   feeding: AninalFeedingdInfo
   devices: CorralDevices;
   status:eCorralStatus;
   tag: string;
   
}

export interface AnimalInfo {
   pkid: bigint;
   id: number;
   crotal: bigint;
   phase: AnimalPhase;
   phaseName: string;
   subState: AnimalSubstate;
   systemEntryDate: Date;
   curve: AnimalCurve;
   feedCorrection: FeedCorrection;
   location:AnimalLocation;
}




interface AninalFeedingdInfo {
   calculatedDay: number;
   consumedToday: number;
   intervalAmount: number;
   interval: FeedingInterval[];
   actualInterval: number;
   feedingStatus: FeedingStatus
   noEatingDays: number;

}

export interface CorralDevices {
   devicesAmount: number;
   devices: Device[];

}

export interface AnimalPhase {
   id:number;
   name:string;
   entrydate:Date;
}

export interface FeedCorrection {
   id:string;
   value:number;
   name:string;

}

export interface AnimalSubstate {
   id:number;
   name:string;
   entrydate:Date;

}

export interface AnimalCurve {
   id:number;
   name:string;
   
}

export interface AnimalLocation {
   buildingName:string;
   corralName:number;
   moduleName:string;
}

export interface FeedingInterval {
   number:number;
   calculated:number;
   consumed:number;
   consumedPercentage:number;
   
}

export interface FeedingStatus {
   id:number;
   name:string;
}

export interface Device {
   type:number;
   mac:string;
   status:number;
   errorNumber:number;
   errorText:string;
}

 


// name: string;
//    location: string;
//    capacity: number;
//    currentOccupancy: number;
//    animals: string[];
//    feed: string[];
//    water: string[];
//    temperature: number;
//    humidity: number;
//    lastCleaned: Date;
//    lastFed: Date;
//    lastWatered: Date;
//    lastTemperatureCheck: Date;
//    lastHumidityCheck: Date;
//    lastOccupancyCheck: Date;
//    lastCleanedCheck: Date;
//    lastFedCheck: Date;
//    lastWateredCheck: Date;
//    lastTemperatureCheckCheck: Date;
//    lastHumidityCheckCheck: Date;
//    lastOccupancyCheckCheck: Date;
//    lastCleanedCheckCheck: Date;
//    lastFedCheckCheck: Date;
//    lastWateredCheckCheck: Date;
//    lastTemperatureCheckCheckCheck: Date;
//    lastHumidityCheckCheckCheck: Date;
//    lastOccupancyCheckCheckCheck: Date;
//    lastCleanedCheckCheckCheck: Date;
//    lastFedCheckCheckCheck: Date;
//    lastWateredCheckCheckCheck: Date;
//    lastTemperatureCheckCheckCheckCheck: Date;
//    lastHumidityCheckCheckCheckCheck: Date;
//    lastOccupancyCheckCheckCheckCheck: Date;
//    lastCleanedCheckCheckCheckCheck: Date;
//    lastFedCheckCheckCheckCheckCheck: Date;
//    lastWateredCheckCheckCheckCheckCheck: Date;
//    lastTemperatureCheckCheckCheckCheckCheck: Date;
//    lastHumidityCheckCheckCheckCheckCheck: Date;
//    lastOccupancyCheckCheckCheckCheckCheck: Date;
//    lastCleanedCheckCheckCheckCheckCheckCheck: Date;
//    lastFedCheckCheckCheckCheckCheckCheck: Date;
//    lastWateredCheckCheckCheckCheckCheckCheck: Date;
//    lastTemperatureCheckCheckCheckCheckCheckCheck: Date;
//    lastHumidityCheckCheckCheckCheckCheckCheck: Date;
//    lastOccupancyCheckCheckCheckCheckCheckCheck: Date;
//    lastCleanedCheckCheckCheckCheckCheckCheckCheck: Date;
//    lastFedCheckCheckCheckCheckCheckCheckCheck: Date;
//    lastWateredCheckCheckCheckCheckCheckCheckCheck: Date;
//    lastTemperatureCheckCheckCheckCheckCheckCheckCheck: Date;
//    lastHumidityCheckCheckCheckCheckCheckCheckCheck: Date;
//    lastOccupancyCheckCheckCheckCheckCheckCheckCheck: Date;
//    lastCleanedCheckCheckCheckCheckCheckCheckCheckCheck