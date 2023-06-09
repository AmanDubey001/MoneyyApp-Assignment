import { Box, Button, Stack, TextInput } from '@react-native-material/core';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dimensions, StyleSheet, Text, View, ScrollView } from 'react-native';
import React from 'react';
import {PermissionsAndroid } from 'react-native';
// import RNFS from 'react-native';
// import Share from 'react-native';
import XLSX from 'xlsx';
import RNFetchBlob from 'react-native';




export default function App() {
  const [data, setData] = useState([
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
  ]);

  useEffect(() => {
  loadData();
  }, []);

  const saveData = async () => {
    try {
      const res = await AsyncStorage.setItem('ExcelSheetData', JSON.stringify(data));
      
    } catch (error) {
      console.log('Error saving data:', error);
    }
  };
  
  const loadData = async () => {
    try {
      const storedData = await AsyncStorage.getItem('ExcelSheetData');
      if (storedData !== null) {
        setData(JSON.parse(storedData));
      }
    } catch (error) {
      console.log('Error loading data:', error);
    }
  };

  const handleCellChange = (text, rowIndex, cellIndex) => {
    const newData = [...data];
    newData[rowIndex][cellIndex] = text;
    setData(newData);
    saveData();
  };

  function generateExcelContent(arrays) {
    const worksheet = XLSX.utils.aoa_to_sheet(arrays);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet 1');
    const excelContent = XLSX.write(workbook, {
      type: 'base64',
      bookType: 'xlsx',
    });
    return excelContent;
  }
  
  async function handleDownloadClick() {
    const arrays = [];
  
    try {
      const excelContent = generateExcelContent(arrays);
  
      const fileUrl = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${excelContent}`;
      const fileName = 'data.xlsx';
  
      if (Platform.OS === 'ios') {
        Alert.alert('File Downloaded', 'Excel file downloaded successfully.');
        return;
      }
  
      const downloadOptions = {
        fileCache: true,
        title: fileName,
        path: `${RNFetchBlob.fs.dirs.DownloadDir}/${fileName}`,
      };
  
      const res = await RNFetchBlob.config(downloadOptions).fetch('GET', fileUrl);
  
      if (res.respInfo.status === 200) {
        Alert.alert('File Downloaded', `Excel file downloaded to: ${res.path()}`);
      } else {
        Alert.alert('Download Failed', 'Failed to download the Excel file.');
      }
    } catch (error) {
      console.error('Failed to handle download click:', error);
      Alert.alert('Error', 'Failed to handle download click.');
    }
  }
  
  
  return (
    <Stack  mt={50} mb={30} center >
    <Button  title="Download" onPress={handleDownloadClick}/>
    <ScrollView contentContainerStyle={styles.container}>
    {data.map((row, rowIndex) => (
      <View key={rowIndex} style={styles.row}>
        {row.map((cell, cellIndex) => (
          <TextInput
            key={cellIndex}
            style={styles.cell}
            value={cell}
            onChangeText={(text) => handleCellChange(text, rowIndex, cellIndex)}
          />
        ))}
      </View>
    ))}
  </ScrollView>
  </Stack>

);
};

const deviceWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
container: {
  flexGrow: 1,
  padding: 10,
  alignItems: 'center',
},
row: {
  flexDirection: 'row',
  marginBottom: 5,
  width: deviceWidth - 20,
},
cell: {
  flex: 1,
  borderWidth: 1,
  borderColor: 'black',
  padding: 10,
},
});
   

