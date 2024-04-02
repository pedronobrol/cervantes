import React from 'react';
import { useState, useEffect, useRef } from 'react';
import {StyleSheet, View, Text, TouchableOpacity} from 'react-native';
import { router, useLocalSearchParams, Link } from 'expo-router';
import { getData, getWords } from '../utils';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTap } from '../hooks/useTap';
import HighlightedWord from './HighlightedWord'; 


export default function Details() {
    const { onTouchStart, onTouchEnd } = useTap(onDoubleTapLeft, onDoubleTapRight, onTap);
    const item = useLocalSearchParams();
    const [start, setStart] = useState(true);
    const [tapped, setTapped] = useState(false);
    const [bookState, setBookState] = useState({
        book: [],
        currentPage: 0,
        currentWord: 0,
        currentWords: [],
    });
    const [currentWord, setCurrentWord] = useState(0);
    const intervalId = useRef(null); // Using useRef to hold the interval ID

    const handleStart = async () => {
        setStart(false);
        createReadingInterval();
    }

    const createReadingInterval = () => {
        const wpm = 300; // Words per minute
        const interval = 60000 / wpm;
        // Clear any existing interval to avoid duplicates
        if (intervalId.current) clearInterval(intervalId.current);
        intervalId.current = setInterval(() => {
            if (currentWord < bookState.currentWords.length - 1) {
                setCurrentWord((currWord) => currWord + 1);
            } else {
                clearInterval(intervalId.current); // Stop the interval at the end of the book
            }
        }, interval);
    };
    
    function onDoubleTapLeft(){
        if (currentWord > 0) {
            setCurrentWord((currWord) => currWord - 1);
        }
        console.log('left')
    }
    
    function onDoubleTapRight(){
        if (currentWord < bookState.currentWords.length) {
            setCurrentWord((currWord) => currWord + 1);
        }
        console.log('right')
    }
    function onTap(){
        if (start) {
            return;
        }
        if(!tapped && intervalId.current) clearInterval(intervalId.current);
        else createReadingInterval();
        setTapped(!tapped);
        console.log('tap');
    }
    
    const loadBook = async () => {
        try {
            let data = await getData(item.book);
            const newCurrentWords = getWords(data.pages[data.current_page - 1]);
            console.log(newCurrentWords);
            setBookState({
                book: data,
                currentPage: data.current_page,
                currentWord: data.current_word,
                currentWords: newCurrentWords,
            });
            setCurrentWord(data.current_word);
        } catch (error) {
            console.error('Failed to load books from local storage:', error);
        }
    };

    const back = () => {
        router.push(`select/${item.book}`, {title: item.book});
      }
    

    useEffect(() => {
        loadBook();
    }, []);

    useEffect(() => {
        // Assuming you have stored the interval ID in a state or ref called intervalId
        return () => {
            if (intervalId.current) {
                clearInterval(intervalId.current);
            }
        };
    }, []);

    return (
        <View  style={styles.container}
        onTouchStart={onTouchStart} 
        onTouchEnd={onTouchEnd}>
            {tapped && 
             <View style={styles.header}>
                <TouchableOpacity style={styles.back} onPress={back}>
                    <Icon name="chevron-left" size={32} color="#000" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.play} onPress={() => setTapped(!tapped)}>
                    <Icon name="play-pause" size={32} color="#000" />
                </TouchableOpacity>
            </View>
            }
            {start ? (
                <View style={styles.contentContainer}>
                <Text style={styles.title}>How fast can you read?</Text>
                 <CountdownCircleTimer style={styles.countdown}
                 isPlaying
                 duration={3}
                 colors={['#004777', '#F7B801', '#A30000', '#A30000']}
                 colorsTime={[7, 5, 2, 0]}
                    onComplete={() => {handleStart()}}
               >
                 {({ remainingTime }) => <Text>{remainingTime}</Text>}
               </CountdownCircleTimer>
               </View>
            ) : (
                <HighlightedWord word={bookState.currentWords[currentWord]} />
            )
            }
            
        </View>
    );
}   

const styles = StyleSheet.create({
    container: {
        flex: 1, 
        padding: 0,
        margin: 0, 
        width: '100%',
        height: '100%'
    },
    back: {
        top: 15,
        left: 15,
      },
      play: {
        top: 15,
        left: -15,
      },
      header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        backgroundColor: '#fff',
      },
        title: {
            fontSize: 22,
            fontWeight: 'bold',
            marginLeft: 15,
            marginTop: 10,
            marginBottom: 30,
        },
        contentContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
});  