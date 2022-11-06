import React, { useState, useEffect } from 'react';

import { SafeAreaView, Text, View, StyleSheet, Alert, TouchableOpacity, TextInput, FlatList } from 'react-native';

import { openDatabase } from 'react-native-sqlite-storage';

import { NavigationContainer, useIsFocused } from '@react-navigation/native';

import { createStackNavigator } from '@react-navigation/stack';


var db = openDatabase({ name: 'trip.db' });

function HomeScreen({ navigation }) {

  const [S_Name, setName] = useState('');
  const [S_Destination, setDestination] = useState();
  const [S_Dot, setDot] = useState('');
  const [S_Require, setRequire] = useState();
  const [S_Description, setDescription] = useState('');

  useEffect(() => {
    db.transaction(function (txn) {
      txn.executeSql(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='Trips_Table'",
        [],
        function (tx, res) {
          console.log('item:', res.rows.length);
          if (res.rows.length == 0) {
            txn.executeSql('DROP TABLE IF EXISTS Trips_Table', []);
            txn.executeSql(
              'CREATE TABLE IF NOT EXISTS Trips_Table(Trips_id INTEGER PRIMARY KEY AUTOINCREMENT, Trips_name VARCHAR(255), Trips_destination VARCHAR(255), Trips_dot VARCHAR(255), Trips_requireAssessment VARCHAR(255), Trips_description VARCHAR(255))',
              []
            );
          }
        }
      );
    })

  }, []);

  const insertData = () => {

    if (S_Name == '' || S_Destination == '' ||  S_Dot == '' || S_Require == ''|| S_Description == '' ) {
      Alert.alert('Please Enter All the Values');
    } else {

      db.transaction(function (tx) {
        tx.executeSql(
          'INSERT INTO Trips_Table (Trips_name, Trips_destination, Trips_dot, Trips_requireAssessment, Trips_description) VALUES (?,?,?,?,?)',
          [S_Name, S_Destination, S_Dot, S_Require, S_Description],
          (tx, results) => {
            console.log('Results', results.rowsAffected);
            if (results.rowsAffected > 0) {
              Alert.alert('Data Inserted Successfully....');
            } else Alert.alert('Failed....');
          }
        );
      });

    }
  }

  navigateToViewScreen = () => {

    navigation.navigate('ViewAllTripsScreen');
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.mainContainer}>

        <Text style={{ fontSize: 24, textAlign: 'center', color: '#000' }}>
          Insert Data Into SQLite Database
        </Text>

        <TextInput
          style={styles.textInputStyle}
          onChangeText={
            (text) => setName(text)
          }
          placeholder="Enter Trips Name"
          value={S_Name} />

        <TextInput
          style={styles.textInputStyle}
          onChangeText={
            (text) => setDestination(text)
          }
          placeholder="Enter Trips Destination"
          value={S_Destination} />

        <TextInput
          style={[styles.textInputStyle, { marginBottom: 20 }]}
          onChangeText={
            (text) => setDot(text)
          }
          placeholder="Enter Date of the trip"
          value={S_Dot} />

        <TextInput
          style={[styles.textInputStyle, { marginBottom: 20 }]}
          onChangeText={
            (text) => setRequire(text)
          }
          placeholder="Enter require"
          value={S_Require} />

        <TextInput
          style={[styles.textInputStyle, { marginBottom: 20 }]}
          onChangeText={
            (text) => setDescription(text)
          }
          placeholder="Enter Description"
          value={S_Description} />
          

        <TouchableOpacity
          style={styles.touchableOpacity}
          onPress={insertData}>

          <Text style={styles.touchableOpacityText}> Click Here To Insert Data Into SQLite Database </Text>

        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.touchableOpacity, { marginTop: 20, backgroundColor: '#33691E' }]}
          onPress={navigateToViewScreen}>

          <Text style={styles.touchableOpacityText}> Click Here View All Tripss List </Text>

        </TouchableOpacity>

      </View>

    </SafeAreaView>
  );
};

function ViewAllTripsScreen({ navigation }) {

  const [items, setItems] = useState([]);
  const [empty, setEmpty] = useState([]);

  const isFocused = useIsFocused();

  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM Trips_Table',
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

  const navigateToEditScreen = (id, name, destination, dot, requireAssessment, description) => {

    navigation.navigate('EditRecordScreen', {
      Trips_id: id,
      Trips_name: name,
      Trips_destination: destination,
      Trips_dot: dot,
      Trips_requireAssessment: requireAssessment,
      Trips_description: description,

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
              <View key={item.Trips_id} style={{ padding: 20 }}>

                <TouchableOpacity onPress={() => navigateToEditScreen(item.Trips_id, item.Trips_name, item.Trips_destination, item.Trips_dot, item.Trips_requireAssessment, item.Trips_description)} >
                  <Text style={styles.itemsStyle}> Id: {item.Trips_id} </Text>
                  <Text style={styles.itemsStyle}> Name: {item.Trips_name} </Text>
                  <Text style={styles.itemsStyle}> Destination: {item.Trips_destination} </Text>
                  <Text style={styles.itemsStyle}> Date of Trip: {item.Trips_dot} </Text>
                  <Text style={styles.itemsStyle}> RequireAssessment: {item.Trips_requireAssessment} </Text>
                  <Text style={styles.itemsStyle}> Description: {item.Trips_description} </Text>
                </TouchableOpacity>
              </View>
            }
          />
        }
      </View>
    </SafeAreaView>

  );
}

function EditRecordScreen({ route, navigation }) {

  const [S_Id, setID] = useState('');
  const [S_Name, setName] = useState('');
  const [S_Destination, setDestination] = useState();
  const [S_Dot, setDot] = useState('');
  const [S_Require, setRequire] = useState();
  const [S_Description, setDescription] = useState('');

  useEffect(() => {

    setID(route.params.Trips_id);
    setName(route.params.Trips_name);
    setDestination(route.params.Trips_destination);
    setDot(route.params.Trips_dot);
    setRequire(route.params.Trips_requireAssessment);
    setDescription(route.params.Trips_description);

  }, []);

  const editData = () => {
    db.transaction((tx) => {
      tx.executeSql(
        'UPDATE Trips_Table set Trips_name=?, Trips_destination=? , Trips_dot=? , Trips_requireAssessment=? , Trips_description=? where Trips_id=?',
        [S_Name, S_Destination, S_Dot, S_Require, S_Description, S_Id],
        (tx, results) => {
          console.log('Results', results.rowsAffected);
          if (results.rowsAffected > 0) {
            Alert.alert('Record Updated Successfully...')
          } else Alert.alert('Error');
        }
      );
    });
  }

  const deleteRecord = () => {
    db.transaction((tx) => {
      tx.executeSql(
        'DELETE FROM Trips_Table where Trips_id=?',
        [S_Id],
        (tx, results) => {
          console.log('Results', results.rowsAffected);
          if (results.rowsAffected > 0) {
            Alert.alert(
              'Done',
              'Record Deleted Successfully',
              [
                {
                  text: 'Ok',
                  onPress: () => navigation.navigate('ViewAllTripsScreen'),
                },
              ],
              { cancelable: false }
            );
          }
        }
      );
    });

  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.mainContainer}>

        <Text style={{ fontSize: 24, textAlign: 'center', color: '#000' }}>
          Edit Record In SQLite Database
        </Text>

        <TextInput
          style={styles.textInputStyle}
          onChangeText={
            (text) => setName(text)
          }
          placeholder="Enter Trips Name"
          value={S_Name} />

        <TextInput
          style={styles.textInputStyle}
          onChangeText={
            (text) => setDestination(text)
          }
          placeholder="Enter Trips Destination"
          value={S_Destination} />

        <TextInput
          style={[styles.textInputStyle]}
          onChangeText={
            (text) => setDot(text)
          }
          placeholder="Enter Date of the trip"
          value={S_Dot} />

        <TextInput
          style={[styles.textInputStyle]}
          onChangeText={
            (text) => setRequire(text)
          }
          placeholder="Enter require"
          value={S_Require} />

        <TextInput
          style={[styles.textInputStyle, { marginBottom: 20 }]}
          onChangeText={
            (text) => setDescription(text)
          }
          placeholder="Enter Description"
          value={S_Description} />

        <TouchableOpacity
          style={styles.touchableOpacity}
          onPress={editData}>

          <Text style={styles.touchableOpacityText}>Edit Record </Text>

        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.touchableOpacity, { marginTop: 20, backgroundColor: '#33691E' }]}
          onPress={deleteRecord}>

          <Text style={styles.touchableOpacityText}>Delete Current Record </Text>

        </TouchableOpacity>

      </View>

    </SafeAreaView>
  );
};

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>

        <Stack.Screen name="HomeScreen" component={HomeScreen} />

        <Stack.Screen name="ViewAllTripsScreen" component={ViewAllTripsScreen} />

        <Stack.Screen name="EditRecordScreen" component={EditRecordScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
  },

  touchableOpacity: {
    backgroundColor: '#0091EA',
    alignItems: 'center',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%'
  },

  touchableOpacityText: {
    color: '#FFFFFF',
    fontSize: 23,
    textAlign: 'center',
    padding: 8
  },

  textInputStyle: {
    height: 45,
    width: '90%',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#00B8D4',
    borderRadius: 7,
    marginTop: 15,
  },

  itemsStyle: {
    fontSize: 22,
    color: '#000'
  }
});