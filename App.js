import React, { useState, useEffect } from 'react';

import { RefreshControl, SafeAreaView, Text, View, StyleSheet, Alert, TouchableOpacity, TextInput, FlatList } from 'react-native';

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
  const showAlert = [];

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

  const checkValid=()=>{
    let formIsValid = true;
    let regexCheckData = "^(3[01]|[12][0-9]|0?[1-9])/(1[0-2]|0?[1-9])/(?:[0-9]{2})?[0-9]{2}$";

    if (S_Name == '' || S_Destination == '' ||  S_Dot == '' || S_Require == ''|| S_Description == '' ) {
      Alert.alert('Please Enter All the Values');
      formIsValid = false;
    } 
    else {

      if(S_Require == "Yes" || S_Require == "No"){
        formIsValid = true;
      }else{
        formIsValid = false;
        Alert.alert("Risk Assessment: this line is just fill in 'Yes' or 'No'");
      }
      if (!S_Dot.match(regexCheckData)) {
        formIsValid = false;
        Alert.alert('dateOfTrip: isValid Date time: form d/m/yy or dd/mm/yyyy');
      }
    }
      return formIsValid;
    
  }

  const insertData = () => {
    
    if(checkValid()){
      db.transaction(function (tx) {
        tx.executeSql(
          'INSERT INTO Trips_Table (Trips_name, Trips_destination, Trips_dot, Trips_requireAssessment, Trips_description) VALUES (?,?,?,?,?)',
          [S_Name, S_Destination, S_Dot, S_Require, S_Description],
          (tx, results) => {
            console.log('Results', results.rowsAffected);
            if (results.rowsAffected > 0) {
              // Alert.alert('Data Inserted Successfully....');
              navigation.navigate('ViewAllTripsScreen');
            } else Alert.alert('Failed....');
          }
        );
      });
    }
}
  
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.mainContainer}>

        <Text style={{ fontSize: 24, textAlign: 'center', color: '#000' }}>
          ADD YOUR TRIP
        </Text>

        <Text style={{fontSize: 20}}>Name</Text>
        <TextInput
          style={styles.textInputStyle}
          onChangeText={
            (text) => setName(text)
          }
          placeholder="Enter Trips Name"
          value={S_Name} />

        <Text style={{fontSize: 20}}>Destination</Text>
        <TextInput
          style={styles.textInputStyle}
          onChangeText={
            (text) => setDestination(text)
          }
          placeholder="Enter Trips Destination"
          value={S_Destination} />

        <Text style={{fontSize: 20}}>Date of the Trip</Text>
        <TextInput
          style={[styles.textInputStyle]}
          onChangeText={
            (text) => setDot(text)
          }
          placeholder="Enter Date of the trip"
          value={S_Dot} />

        <Text style={{fontSize: 20}}>Require Risk Assessment</Text>
        <TextInput
          style={[styles.textInputStyle]}
          onChangeText={
            (text) => setRequire(text)
          }
          placeholder="Enter require"
          value={S_Require} />

        <Text style={{fontSize: 20}}>Description</Text>
        <TextInput
          style={[styles.textInputStyle, { marginBottom: 20, height: 100, textAlignVertical: 'top' }]}
          onChangeText={
            (text) => setDescription(text)
          }
          placeholder="Enter Description"
          value={S_Description} 
          TextInput multiline={true}/>
          

        <TouchableOpacity
          style={styles.touchableOpacity}
          onPress={insertData}>

          <Text style={styles.touchableOpacityText}> ADD </Text>

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

  const deleteAllRecord = () => {
    db.transaction((tx) => {
      tx.executeSql(
        'DELETE FROM Trips_Table',
        Alert.alert("Delete All Record!!!")
      );
    });
    navigation.navigate('HomeScreen');
  }

  const Addtrip = () => {
    navigation.navigate('HomeScreen');
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
        <View>
          <TouchableOpacity
            style={[styles.touchableOpacity, { marginTop: 20, borderRadius: 0}]}
            onPress={Addtrip}>
            <Text style={styles.touchableOpacityText}>ADD Trip</Text>
          </TouchableOpacity>
        </View>
        <View>
          <TouchableOpacity
            style={[styles.touchableOpacity, { backgroundColor: 'red', borderRadius: 0 }]}
            onPress={deleteAllRecord}>
            <Text style={styles.touchableOpacityText}>Delete All Record </Text>
          </TouchableOpacity>
        </View>
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
  const showAlert = [];

  useEffect(() => {

    setID(route.params.Trips_id);
    setName(route.params.Trips_name);
    setDestination(route.params.Trips_destination);
    setDot(route.params.Trips_dot);
    setRequire(route.params.Trips_requireAssessment);
    setDescription(route.params.Trips_description);

  }, []);

  const editData = () => {

    const checkValid=()=>{
      let formIsValid = true;
      let regexCheckData = "^(3[01]|[12][0-9]|0?[1-9])/(1[0-2]|0?[1-9])/(?:[0-9]{2})?[0-9]{2}$";
  
      if (S_Name == '' || S_Destination == '' ||  S_Dot == '' || S_Require == ''|| S_Description == '' ) {
        Alert.alert('Please Enter All the Values');
        formIsValid = false;
      } 
      else {
  
        if(S_Require == "Yes" || S_Require == "No"){
          formIsValid = true;
        }else{
          formIsValid = false;
          Alert.alert("Risk Assessment: this line is just fill in 'Yes' or 'No'");
        }
        if (!S_Dot.match(regexCheckData)) {
          formIsValid = false;
          Alert.alert('dateOfTrip: isValid Date time: form d/m/yy or dd/mm/yyyy');
        }
      }
        return formIsValid;
    }

    if(checkValid()){
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
          Edit YOUR TRIP
        </Text>

        <Text style={{fontSize: 20}}>Name</Text>
        <TextInput
          style={styles.textInputStyle}
          onChangeText={
            (text) => setName(text)
          }
          placeholder="Enter Trips Name"
          value={S_Name} />

        <Text style={{fontSize: 20}}>Destination</Text>
        <TextInput
          style={styles.textInputStyle}
          onChangeText={
            (text) => setDestination(text)
          }
          placeholder="Enter Trips Destination"
          value={S_Destination} />

        <Text style={{fontSize: 20}}>Date of the trip</Text>
        <TextInput
          style={[styles.textInputStyle]}
          onChangeText={
            (text) => setDot(text)
          }
          placeholder="Enter Date of the trip"
          value={S_Dot} />


        <Text style={{fontSize: 20}}>Require Risk Assessment</Text>
        <TextInput
          style={[styles.textInputStyle]}
          onChangeText={
            (text) => setRequire(text)
          }
          placeholder="Enter require"
          value={S_Require} />

        <Text style={{fontSize: 20}}>Description</Text>
        <TextInput
          style={[styles.textInputStyle, { marginBottom: 20 , height: 100, textAlignVertical: 'top'  }]}
          onChangeText={
            (text) => setDescription(text)
          }
          placeholder="Enter Description"
          value={S_Description}
          TextInput multiline={true}
          />

        <TouchableOpacity
          style={[styles.touchableOpacity, { marginTop: 20, backgroundColor: 'yellow' }]}
          onPress={editData}>

          <Text style={styles.touchableOpacityText}>Update</Text>

        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.touchableOpacity, { marginTop: 20, backgroundColor: 'red' }]}
          onPress={deleteRecord}>

          <Text style={styles.touchableOpacityText}>Delete</Text>

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

        <Stack.Screen name="ViewAllTripsScreen" component={ViewAllTripsScreen} />

        <Stack.Screen name="HomeScreen" component={HomeScreen} />

        <Stack.Screen name="EditRecordScreen" component={EditRecordScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    padding: 10,
  },

  touchableOpacity: {
    backgroundColor: '#0a354f',
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
    width: '100%',
    borderWidth: 1,
    borderColor: 'grey',
    borderRadius: 7,
    marginTop: 15,
  },

  itemsStyle: {
    fontSize: 22,
    color: '#000'
  }
});