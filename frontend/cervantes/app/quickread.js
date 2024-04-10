import React from 'react';
import { useState, useEffect, useRef } from 'react';
import {ScrollView, StyleSheet, TextInput, SafeAreaView, View, Text, TouchableOpacity, ActivityIndicator} from 'react-native';
import {router } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import WpmSelector from './components/WpmSelector'; 
import * as Clipboard from 'expo-clipboard';

export default function quickRead() {
const [isLoading, setIsLoading] = useState(false);
const [wpm, setWpm] = useState(100); // Initial WPM value
const [pastedText, setPastedText] = useState(''); // State for the pasted text

const pasteText = async () => {
    const text = await Clipboard.getStringAsync();
    setPastedText(text); // Set the fetched text into state
  }


const back = async () => {
    router.push('/');
  }

const play = async () => {
    console.log('Play');
  }

useEffect(() => {
    pasteText();
  }
, []);


return (
    <SafeAreaView style={styles.container}>
        {isLoading ? (
        <View style={{flex: 1, justifyContent: 'center'}}>
            <ActivityIndicator size="large" color="#0000ff" />
        </View>
    ) : (
        <>
    <View style={styles.header}>
            <TouchableOpacity style={styles.back} onPress={back}>
            <Icon name="chevron-left" size={32} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.play} onPress={play}>   
                <Icon name="play" size={32} color="#000" />
        </TouchableOpacity>
    </View>
    <ScrollView style={styles.content}>
    <Text style={styles.title}>
        Read from your clipboard
    </Text>
    <View style={styles.clipboard}>
        <Text>
            {pastedText}
        </Text>
    </View>
    </ScrollView>
    <View style={styles.bottomBar}>
    <WpmSelector initialWpm={wpm} onWpmChange={setWpm} />
    </View>
    </>
    )}
    </SafeAreaView>
)}

const styles = StyleSheet.create({
    container: {
        flex: 1, 
        padding: 0,
        margin: 0 
      },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        backgroundColor: '#fff',
      },
      back: {
        top: 15,
        left: 15,
      },
      play: {
        top: 15,
        left: -15,
      },
      bottomBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 18,
        marginBottom: 30,
        fontSize: 12,
        borderTopWidth: 2, // Make the border slightly thicker for emphasis
        borderTopColor: '#007BFF', // Use a color that matches your app's theme for beauty
        // Additional styling for a more "beautiful" appearance
        shadowOpacity: 0.2,
        shadowRadius: 1,
        elevation: 2, // Elevation for Android - creates a drop shadow
        backgroundColor: 'white', 
      },
      textInput: {
        height: 100, // Adjust based on your preference
        borderColor: 'gray', // Border color
        borderWidth: 1, // Border width
        margin: 12, // Margin around the TextInput
        paddingHorizontal: 10, // Padding for the text inside
        borderRadius: 5, // Rounded corners
      },
      content: {
        flex: 1,
        padding: 12,
      },
      title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
      },
      clipboard: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      },
});