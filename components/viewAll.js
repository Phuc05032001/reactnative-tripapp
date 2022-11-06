import React, { useState, useEffect } from 'react';

import { SafeAreaView, Text, View, StyleSheet, Alert, TouchableOpacity, TextInput, FlatList } from 'react-native';

import { openDatabase } from 'react-native-sqlite-storage';

import { NavigationContainer, useIsFocused } from '@react-navigation/native';

import { createStackNavigator } from '@react-navigation/stack';

var db = openDatabase({ name: 'SchoolDatabase.db' });

function ViewAllStudentScreen({ navigation }) {

    const [items, setItems] = useState([]);
    const [empty, setEmpty] = useState([]);
  
    const isFocused = useIsFocused();
  
    useEffect(() => {
      db.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM Student_Table',
          [],
          (tx, results) => {
            var temp = [];
            for (let i = 0; i < results.rows.length; ++i)
              temp.push(results.rows.item(i));
            setItems(temp);
  
            if (results.rows.length >= 1) {
              setEmpty(false);
            } else {
              setEmpty(true)
            }
  
          }
        );
  
      });
    }, [isFocused]);
  
    const listViewItemSeparator = () => {
      return (
        <View
          style={{
            height: 1,
            width: '100%',
            backgroundColor: '#000'
          }}
        />
      );
    };
  
    const emptyMSG = (status) => {
      return (
        <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
  
          <Text style={{ fontSize: 25, textAlign: 'center' }}>
            No Record Inserted Database is Empty...
            </Text>
  
        </View>
      );
    }
  
    const navigateToEditScreen = (id, name, phoneNumber, address) => {
  
      navigation.navigate('EditRecordScreen', {
        student_id: id,
        student_name: name,
        student_phone: phoneNumber,
        student_address: address
      });
    }
  
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          {empty ? emptyMSG(empty) :
  
            <FlatList
              data={items}
              ItemSeparatorComponent={listViewItemSeparator}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) =>
                <View key={item.student_id} style={{ padding: 20 }}>
                  <TouchableOpacity onPress={() => navigateToEditScreen(item.student_id, item.student_name, item.student_phone, item.student_address)} >
                    <Text style={styles.itemsStyle}> Id: {item.student_id} </Text>
                    <Text style={styles.itemsStyle}> Name: {item.student_name} </Text>
                    <Text style={styles.itemsStyle}> Phone Number: {item.student_phone} </Text>
                    <Text style={styles.itemsStyle}> Address: {item.student_address} </Text>
                  </TouchableOpacity>
                </View>
              }
            />
          }
        </View>
      </SafeAreaView>
  
    );
  }

  export default ViewAllStudentScreen;