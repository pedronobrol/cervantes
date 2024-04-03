import React from 'react';
import { useState, useEffect, useRef } from 'react';
import {StyleSheet, View, Text, TouchableOpacity} from 'react-native';
import { router, useLocalSearchParams, Link } from 'expo-router';
import { getData, getWords } from '../utils';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTap } from '../hooks/useTap';
import HighlightedWord from './HighlightedWord'; 
import AsyncStorage from '@react-native-async-storage/async-storage';


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
        wpm: 300,
    });
    //const [currentWord, setCurrentWord] = useState(0); 
    const intervalId = useRef(null); // Using useRef to hold the interval ID
    const preventIntervalCreation = useRef(false);

    const saveStateToLocal = async () => {
        // Implement this function to save the book state to local storage
        // save to local storage new page number and current word as well as wpm
        let book = bookState.book;
        book.current_page = bookState.currentPage;
        book.wpm = bookState.wpm;
        book.current_word = bookState.currentWord;
        await AsyncStorage.setItem(item.book, JSON.stringify(book));
    }

    const handleStart = async () => {
        setStart(false);
        createReadingInterval();
    }

    const setCurrentWord = (word) => {
        setBookState((prevState) => ({
            ...prevState,
            currentWord: word,
        }));
    }

    const createReadingInterval = () => {
        const wpm = bookState.wpm;
        const intervalDuration = 60000 / wpm;
        
        // Clear any existing interval to avoid duplicates
        if (intervalId.current) clearInterval(intervalId.current);
        
        intervalId.current = setInterval(() => {
            setBookState(prevState => {
                const nextWordIndex = prevState.currentWord + 1;
                
                // Check if there are more words in the current page
                if (nextWordIndex < prevState.currentWords.length) {
                    return { ...prevState, currentWord: nextWordIndex };
                } else {
                    // No more words in the current page, move to the next page if possible
                    const nextPageIndex = prevState.currentPage + 1;
                    
                    if (nextPageIndex <= prevState.book.pages.length) {
                        const newCurrentWords = getWords(prevState.book.pages[nextPageIndex - 1]);
                        
                        // Automatically restart the reading from the new page
                        // Notice we're not returning state here as we're setting it below after clearInterval
                        clearInterval(intervalId.current);
                        
                        return {
                            ...prevState,
                            currentPage: nextPageIndex,
                            currentWords: newCurrentWords,
                            currentWord: 0, // Start from the first word of the new page
                        };
                    } else {
                        // End of the book, handle accordingly
                        console.log("Reached the end of the book.");
                        clearInterval(intervalId.current);
                        return prevState;
                    }
                }
            });
        }, intervalDuration);
    };
    
    

   function onDoubleTapLeft() {
    setBookState(prevState => {
        if (prevState.currentWord > 0) {
            const nextWord = prevState.currentWord - 1;
            return { ...prevState, currentWord: nextWord };
        } else {
            // Optionally handle the case when you're at the start and can't go back further
            return prevState;
        }
    });
    console.log('left');
}
    
function onDoubleTapRight() {
    setBookState(prevState => {
        if (prevState.currentWord < prevState.currentWords.length - 1) { // -1 because array indices start at 0
            const nextWord = prevState.currentWord + 1;
            return { ...prevState, currentWord: nextWord };
        } else {
            // Optionally handle the case when you're at the end and can't go forward further
            return prevState;
        }
    });
    console.log('right');
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
            setBookState({
                book: data,
                currentPage: data.current_page,
                currentWord: data.current_word,
                currentWords: newCurrentWords,
                wpm: data.wpm,
            });
            setCurrentWord(data.current_word);
        } catch (error) {
            console.error('Failed to load books from local storage:', error);
        }
    };

    const back = async () => {
        await saveStateToLocal();
        router.push(`select/${item.book}`, {title: item.book});
      }
    

    useEffect(() => {
        loadBook();
    }, []);

    useEffect(() => {
        if (!start && !preventIntervalCreation.current) {
            // Only create the interval if it's not prevented
            createReadingInterval();
        }
    
        // Cleanup function to clear the interval when the component unmounts or before re-creating the interval
        return () => {
            if (intervalId.current) {
                clearInterval(intervalId.current);
            }
        };
        // This effect should be re-run if `start` changes or if the current page changes, but not for every word change
    }, [bookState.currentPage, start]);


    return (
        <View  style={styles.container}
        onTouchStart={onTouchStart} 
        onTouchEnd={onTouchEnd}>
            {tapped && 
             <View style={styles.header}>
                <TouchableOpacity style={styles.back} onPress={back}>
                    <Icon name="chevron-left" size={32} color="#000" />
                </TouchableOpacity>
                <Text style={styles.page}>{bookState.currentPage}</Text>
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
               <TouchableOpacity style={styles.skip} onPress={handleStart}>
                    <Text>Skip</Text>
                </TouchableOpacity>
               </View>
            ) : (
                <HighlightedWord word={bookState.currentWords[bookState.currentWord]} />
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
        page: {
            top: 0,
            left: 0,
            fontWeight: 'bold',
            fontSize: 22,
            height: 40,
            margin: 12,
            padding: 10,
          },
        skip: {
           marginTop: 20,
        }
});  