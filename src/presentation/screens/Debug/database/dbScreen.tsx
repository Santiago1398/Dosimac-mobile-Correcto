/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { FlatList } from 'react-native-gesture-handler';
import { DataTable } from 'react-native-paper';
import { blue100 } from 'react-native-paper/lib/typescript/styles/themes/v2/colors';
import {openDatabase} from 'react-native-sqlite-storage';
var SQLite = require('react-native-sqlite-storage') 


//var db = SQLite.openDatabase({name: 'UserDatabase.db', createFromLocation: '~UserDatabase.db'})


// const db = openDatabase({
//    name: 'UserDatabase',
//    location: 'default'
//   });
interface Lista{
   name: string;
   password: string;
   user_id: number;
}

let lista:Lista[] = [];

const db = SQLite.openDatabase('test.db', '1.0', '', 1)

export default function DbScreen() {
   const [renderFlag,setRenderFlag] =useState(false)
   const [isRefreshing, setIsRefreshing] = useState(false)
   const [sLista,SetsLista] = useState<Lista[]>([])

   const itemLista:Lista = {
      name: 'Luis',
      password: '777777',
      user_id: 10000,
   }

   const handleDb=()=> {
      //const db = SQLite.openDatabase('test.db', '1.0', '', 1)
      lista=[];
      db.transaction(function(txn) {
        txn.executeSql('DROP TABLE IF EXISTS Users', [])
        txn.executeSql(
          'CREATE TABLE IF NOT EXISTS Users(user_id INTEGER PRIMARY KEY NOT NULL, name VARCHAR(32), password VARCHAR(32))',
          []
        )
        txn.executeSql('INSERT INTO Users (name,password) VALUES (:name,:password)', ['nora','1234'])
        txn.executeSql('INSERT INTO Users (name,password) VALUES (:name,:password)', ['takuya','5678'])
        const tempList:Lista[] =[];
        txn.executeSql('SELECT * FROM `users`', [], function(tx, res) {
          for (let i = 0; i < res.rows.length; ++i) {
            console.log('item:', res.rows.item(i))
            lista.push(res.rows.item(i));
            tempList.push(res.rows.item(i));
            //SetsLista(lista);
            // SetsLista([...sLista,res.rows.item(i)]);

          }
          SetsLista(tempList);
        })
      })      
      // setRenderFlag(!renderFlag);

   }

   const handleSelect=async ()=>{

      console.log('--------');
      //lista=[];
      const tempList:Lista[] =[];
      db.transaction(function(txn) {
         txn.executeSql('SELECT * FROM `users`', [], function(tx, res) {
           for (let i = 0; i < res.rows.length; ++i) {
             console.log('item:', res.rows.item(i))
             lista.push(res.rows.item(i));
             tempList.push(res.rows.item(i));
             //SetsLista(lista);
            //  SetsLista([...sLista,...res.rows.item(i)]);
           }
         })
       })      
       //setRenderFlag(!renderFlag);
       SetsLista(tempList);
   }

   const handleInsert=async ()=>{
      await db.transaction(function(txn) {
         txn.executeSql('INSERT INTO Users (name,password) VALUES (:name,:password)', ['Miguel','0000'])
         txn.executeSql('INSERT INTO Users (name,password) VALUES (:name,:password)', ['Elisa','1111'])
        })

        lista.push(itemLista);
        lista.push(itemLista);
        //setRenderFlag(!renderFlag);
        const tempList:Lista[] =[];
        tempList.push(itemLista);
        tempList.push(itemLista);
        SetsLista([...sLista,...tempList])
       
   }

   const handleDelete=async ()=>{
      await db.transaction(function(txn) {
         txn.executeSql('DELETE FROM Users WHERE name=:name', ['Miguel'])
       })
       handleSelect();
       
   }

   const handleClose=async ()=>{
      db.close();
      console.log('db closed');
   }

   const handleOpen=()=>{
      
      // db.open();
      // console.log('db opened');
   }

   const debugData=()=>{
      console.log(lista);
   }

   const onRefresh = () => {
      //set isRefreshing to true
      setIsRefreshing(true)
      // callApiMethod()
      // and set isRefreshing to false at the end of your callApiMethod()
  }

  const deleteLista=()=>{
       lista=[];
       //setRenderFlag(!renderFlag);
  }
  
   const handleRender=(item:Lista)=>{
      return (
         <View style={{ flexDirection: 'row' }}>
            <View style={{ flex:1, backgroundColor: 'lightblue'}}>
               <Text style={{ fontSize: 14, fontWeight: 'bold', textAlign: 'left'}}>{item.user_id}</Text>
            </View>
            <View style={{ flex:1, backgroundColor: 'lightblue'}}>
               <Text style={{ fontSize: 14, fontWeight: 'bold' , textAlign: 'left'}}>{item.name}</Text>
            </View>
            <View style={{ flex:1, backgroundColor: 'lightblue'}}>
               <Text style={{ fontSize: 14, fontWeight: 'bold' , textAlign: 'left'}}>{item.password}</Text>
            </View>
        </View>
         // <Text>{item.name}    {item.password}</Text>
      )

   }

   //This will be our footer component
   const endComponent = () => {
   return (
     <View>
       
       <Text style={{paddingVertical:5}}> </Text>

     </View>
   );
 };

 const header=()=>{
   return (
      <View style={{ flexDirection: 'row',paddingBottom:10 }}>
         <View style={styles.headerContainer}>
            <Text style={styles.headerText}>col1</Text>
         </View>
         <View style={styles.headerContainer}>
            <Text style={styles.headerText}>col2</Text>
         </View>
         <View style={styles.headerContainer}>
            <Text style={styles.headerText}>col3</Text>
         </View>
     </View>
      // <Text>{item.name}    {item.password}</Text>
   )

}

   return (
      <View style={{flex:1}}>
         <View style={{flex:1}}>
            <Pressable onPress={()=>handleDb()}>
               <Text style={styles.boton}>Create/Insert</Text>
            </Pressable>
            <Pressable onPress={()=>handleSelect()}>
               <Text style={styles.boton}>select</Text>
            </Pressable>
            <Pressable onPress={()=>handleInsert()}>
               <Text style={styles.boton}>Insert</Text>
            </Pressable>
            <Pressable onPress={()=>handleDelete()}>
               <Text style={styles.boton}>Delete</Text>
            </Pressable>
            <Pressable onPress={()=>deleteLista()}>
               <Text style={styles.boton}>Delete List</Text>
            </Pressable>
            <Pressable onPress={()=>handleOpen()}>
               <Text style={styles.boton}>Open DB</Text>
            </Pressable>
            <Pressable onPress={()=>debugData()}>
               <Text style={styles.boton}>show list</Text>
            </Pressable>
            {/* <Pressable onPress={()=>setRenderFlag(!renderFlag)}>
               <Text style={styles.boton}>Force list</Text>
            </Pressable> */}
         </View>


         <View style={{flex:1}}>
         <FlatList 
            
            ListFooterComponent={endComponent}
            ListHeaderComponent={header}
            style={styles.lista}
            // horizontal={false}
            // numColumns={2}
            
            // onRefresh={onRefresh}
            onRefresh={() => console.log('refreshing')}

            // refreshing={isRefreshing}
            // data={lista}
            data={sLista}
            // renderItem={({item})=><Text>{item.name}    {item.password}</Text>}
            renderItem={({item})=>handleRender(item)}
            // keyExtractor={(item)=>item.user_id}
            // extraData={renderFlag}
         />
         </View>


         {/* <View style={styles.container}>
            <DataTable style={{fontSize:20}}>
                <DataTable.Header  style={styles.head} >
                    <DataTable.Title textStyle={{fontSize:20}}>Name</DataTable.Title>
                    <DataTable.Title>Email</DataTable.Title>
                    <DataTable.Title numeric>Age</DataTable.Title>
                </DataTable.Header>
                
                {sLista.map((item) => (
                  // key={item.user_id}
                  <DataTable.Row > 
                     <DataTable.Cell> {item.user_id}</DataTable.Cell>
                     <DataTable.Cell> {item.name}</DataTable.Cell>
                     <DataTable.Cell> {item.password}</DataTable.Cell>
                  </DataTable.Row>
                  ))}

            </DataTable>
         </View> */}


      </View>
   )
}

const styles=StyleSheet.create({
boton:{
   backgroundColor:'lightgray',
   padding:10,
   borderRadius:5,
   margin:3,
   marginHorizontal:10,
   color:'black',
   
},
lista:{
   backgroundColor:'lightblue',
   fontSize:10,
   
   color:'black',
   padding:10,
},
container: { flex: 1, paddingTop: 10, paddingHorizontal: 10,backgroundColor: '#fff' },
head: { height: 44, backgroundColor: 'lavender', fontSize:30 },
row: { height: 40, backgroundColor: 'lightyellow' },
headerContainer:{
   flex: 1,
   backgroundColor:'lightgreen',
   paddingHorizontal:10,

},
headerText:{
   color:'black',

   fontSize: 16, 
   fontWeight: 'bold', 
   textAlign: 'left',
   paddingVertical:10,

}


})




