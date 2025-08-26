/* eslint-disable prettier/prettier */

import { openDatabase } from 'react-native-sqlite-storage';
import { farmFacility } from '../sharedTypes/farmInterface';
import { farmStore } from '../stores/store';



let SQLite = require('react-native-sqlite-storage');

const db = SQLite.openDatabase('farmdb.db', '1.0', '', 1);
// const [dbFarmlistChange,setdbFarmlistChange] = useState(false);

export const InicialiceFarmDataTable = async () => {

  await db.transaction((txn) => {

    txn.executeSql(
      `CREATE TABLE IF NOT EXISTS farms(
         id INTEGER PRIMARY KEY NOT NULL,
         name VARCHAR(32),
         location VARCHAR(32),
         province VARCHAR(32),
         userName VARCHAR(32),
         password VARCHAR(32),
         ssid VARCHAR(32),
         wifiPassword VARCHAR(32),
         serverIp VARCHAR(32)
         )`, []);

  });

}


export const CreateFarmDataTable = async () => {


  await db.transaction((txn) => {
    txn.executeSql('DROP TABLE IF EXISTS farms', [])

  });
  await InicialiceFarmDataTable();

  // db.transaction((txn)=> {
  //    txn.executeSql('DROP TABLE IF EXISTS Users', []);
  //    txn.executeSql(
  //       `CREATE TABLE IF NOT EXISTS farms(
  //       id INTEGER PRIMARY KEY NOT NULL,
  //       name VARCHAR(32),
  //       location VARCHAR(32),
  //       province VARCHAR(32),
  //       userName VARCHAR(32),
  //       password VARCHAR(32),
  //       ssid VARCHAR(32),
  //       wifiPassword VARCHAR(32),
  //       serverIp VARCHAR(32)
  //       )`,[] );

  //       }

}


export const InsertFarmData = async (farmData: farmFacility) => {
  await db.transaction((txn) => {
    txn.executeSql(
      `INSERT INTO farms (name,location,province,userName,password,ssid,wifiPassword,serverIp) VALUES (:name,:location,:province,:userName,:password,:ssid,:wifiPassword,:serverIp)`,
      [farmData.name, farmData.location, farmData.province, farmData.userName, farmData.password, farmData.ssid, farmData.wifiPassword, farmData.serverIp]
    );
  }
  )
}



export const UpdateFarmData = (farmData: farmFacility) => {
  console.log('update farm data: ', farmData);
  db.transaction((txn) => {
    txn.executeSql(
      `UPDATE farms SET name=:name,location=:location,province=:province,userName=:userName,password=:password,ssid=:ssid,wifiPassword=:wifiPassword,serverIp=:serverIp WHERE id=:id`,
      [farmData.name, farmData.location, farmData.province, farmData.userName, farmData.password, farmData.ssid, farmData.wifiPassword, farmData.serverIp, farmData.id]
    );
  }
  )
}



export const deleteAllFarms = async () => {
  try {
    await db.executeSql('DELETE FROM farms');


    console.log('All records deleted from farms table');
  } catch (error) {
    console.log('Error deleting records from farms table: ', error);
    throw error;
  }
};

export const DeleteFarmData = (farmData: farmFacility) => {
  db.transaction((txn) => {
    txn.executeSql(
      `DELETE FROM farms WHERE id=:id`,
      [farmData.id]
    );
  }
  )
}

export const deleteFarmById = async (id: number) => {
  await db.transaction((txn) => {
    txn.executeSql(
      `DELETE FROM farms WHERE id=:id`,
      [id]
    );
  })

  console.log(`Record with id ${id} deleted from farms table`);
};

export const deleteFarmById2 = async (id: number) => {

  try {
    await db.executeSql('DELETE FROM farms WHERE id = ?', [id]);
    console.log(`Record with id ${id} deleted from farms table`);
  } catch (error) {
    console.log('Error deleting record from farms table: ', error);
    throw error;
  }
};

// export const GetFarmData=():farmFacility[]=>{
//    db.transaction((txn)=> {
//       txn.executeSql(
//          `SELECT * FROM farms`,
//          []
//          );
//       }
//    )
// }


export const GetFarmsList = (): Promise<farmFacility[]> => {
  return new Promise((resolve, reject) => {
    db.transaction((txn) => {
      txn.executeSql(
        `SELECT * FROM farms`,
        [],
        (tx, results) => {
          let data = [];
          for (let i = 0; i < results.rows.length; ++i) {
            data.push(results.rows.item(i));
          }
          //   console.log('GetFarmsList', data);
          resolve(data);
        },
        (error) => {
          console.log("Error executing sql: ", error);
          reject(error);
        }
      );
    });
  });
};

export const GetFarmsList2 = async (): Promise<farmFacility[]> => {
  try {
    const dbResult = await db.executeSql('SELECT * FROM farms');
    let farmList = [];
    for (let i = 0; i < dbResult[0].rows.length; i++) {
      farmList.push(dbResult[0].rows.item(i));
    }
    return farmList;
  } catch (error) {
    console.log("Error executing sql: ", error);
    throw error;
  }
};




export const GetFarmDataById = (id: number): Promise<farmFacility> => {
  return new Promise((resolve, reject) => {
    db.transaction((txn) => {
      txn.executeSql(
        `SELECT * FROM farms WHERE id=:id`,
        [id], (tx, results) => {
          console.log('item:', results.rows.item(0))
          resolve(results.rows.item(0));
        }
      );
    }
    )
  })
}


export const GetFarmDataById2 = async (id: number): Promise<farmFacility> => {
  return await db.transaction((txn) => {
    txn.executeSql(
      `SELECT * FROM farms WHERE id=:id`,
      [id], (tx, results) => {
        console.log('item2:', results.rows.item(0))
        return results.rows.item(0);
      }
    );
  }
  )
  // return undefined;
}

export const GetFarmDataByName = (name: string) => {
  db.transaction((txn) => {
    txn.executeSql(
      `SELECT * FROM farms WHERE name=:name`,
      [name]
    );
  }
  )
}


export const seedDbFarmList = () => {

  db.transaction((txn) => {
    itemLista.forEach((farm) => {
      txn.executeSql(
        `INSERT INTO farms (name,location,province,userName,password,ssid,wifiPassword,serverIp) VALUES (:name,:location,:province,:userName,:password,:ssid,:wifiPassword,:serverIp)`,
        [farm.name, farm.location, farm.province, farm.userName, farm.password, farm.ssid, farm.wifiPassword, farm.serverIp]
      );
    });
  });
};


// const SeedDbFarmList2=()=> {
//    //const db = SQLite.openDatabase('test.db', '1.0', '', 1)
//    lista=[];
//    db.transaction(function(txn) {
//      txn.executeSql('INSERT INTO Users (name,password) VALUES (:name,:password)', ['nora','1234'])
//      txn.executeSql('INSERT INTO Users (name,password) VALUES (:name,:password)', ['takuya','5678'])
//      const tempList:Lista[] =[];
//      txn.executeSql('SELECT * FROM `users`', [], function(tx, res) {
//        for (let i = 0; i < res.rows.length; ++i) {
//          console.log('item:', res.rows.item(i))
//          lista.push(res.rows.item(i));
//          tempList.push(res.rows.item(i));
//          //SetsLista(lista);
//          // SetsLista([...sLista,res.rows.item(i)]);

//        }
//        SetsLista(tempList);
//      })
//    })
//    // setRenderFlag(!renderFlag);

// }



const itemLista: farmFacility[] = [
  {
    name: 'Granja Santomera',
    location: 'Santomera',
    province: 'Murcia',
    userName: 'Alfonso',
    password: '123456',
    ssid: 'miwifi1',
    wifiPassword: '123456',
    serverIp: '192.168.1.1',
    id: 1,
  },
  {
    name: 'Granja Aljofrin',
    location: 'Aljofrin',
    province: 'Toledo',
    userName: 'roberto',
    password: '123456',
    ssid: 'miwifi2',
    wifiPassword: '123456',
    serverIp: '192.168.1.2',
    id: 2,
  },
  {
    name: 'Granja Castromonte',
    location: 'Castromonte',
    province: 'Valladolid',
    userName: 'Luis',
    password: '123456',
    ssid: 'miwifi3',
    wifiPassword: '123456',
    serverIp: '192.168.3.1',
    id: 3,
  },
  {
    name: 'Granja Combarro',
    location: 'Combarro',
    province: 'Galicia',
    userName: 'Saturnino',
    password: '123456',
    ssid: 'miwifi4',
    wifiPassword: '123456',
    serverIp: '192.168.1.2',
    id: 4,
  },
  {
    name: 'Granja Macarena',
    location: 'Macarena',
    province: 'Granada',
    userName: 'Victor',
    password: '123456',
    ssid: 'miwifi5',
    wifiPassword: '123456',
    serverIp: '192.168.1.1',
    id: 5,
  },
  {
    name: 'Granja 6',
    location: 'santomera',
    province: 'alicante',
    userName: 'pedro',
    password: '777777',
    ssid: 'miwifi2',
    wifiPassword: '999999',
    serverIp: '192.168.1.2',
    id: 6,
  },
  {
    name: 'Granja 7',
    location: 'churra',
    province: 'murcia',
    userName: 'Luis',
    password: '00000',
    ssid: 'miwifi',
    wifiPassword: '123456',
    serverIp: '192.168.1.1',
    id: 7,
  },
  {
    name: 'Granja 8',
    location: 'santomera',
    province: 'alicante',
    userName: 'pedro',
    password: '777777',
    ssid: 'miwifi2',
    wifiPassword: '999999',
    serverIp: '192.168.1.2',
    id: 8,
  },
  {
    name: 'Granja 9',
    location: 'churra',
    province: 'murcia',
    userName: 'Luis',
    password: '00000',
    ssid: 'miwifi',
    wifiPassword: '123456',
    serverIp: '192.168.1.1',
    id: 9,
  },

  {
    name: 'Granja 10',
    location: 'santomera',
    province: 'alicante',
    userName: 'pedro',
    password: '777777',
    ssid: 'miwifi2',
    wifiPassword: '999999',
    serverIp: '192.168.1.2',
    id: 10,
  },
  {
    name: 'Granja 11',
    location: 'churra',
    province: 'murcia',
    userName: 'Luis',
    password: '00000',
    ssid: 'miwifi',
    wifiPassword: '123456',
    serverIp: '192.168.1.1',
    id: 11,
  },
  {
    name: 'Granja 12',
    location: 'santomera',
    province: 'alicante',
    userName: 'pedro',
    password: '777777',
    ssid: 'miwifi2',
    wifiPassword: '999999',
    serverIp: '192.168.1.2',
    id: 12,
  },

];




