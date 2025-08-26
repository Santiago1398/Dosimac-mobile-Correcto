import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

export const  GestationScreen=()=> {
  return (
    <View style={styles.Container}>
      <Text style={styles.headerText}>Gestation</Text>
    </View>
  )
}


const styles = StyleSheet.create({
  
  headerText: {
    color: 'black',

    fontSize: 56,
    fontWeight: 'bold',
    textAlign: 'left',
    paddingVertical: 10,

  },
  Container:{
    flex: 1, 
    alignContent: 'center',
    justifyContent: 'center',

    alignItems: 'center',
    //marginTop: 30,
    //backgroundColor:'lightgrey',
    paddingHorizontal: 10,
  },
  
});





