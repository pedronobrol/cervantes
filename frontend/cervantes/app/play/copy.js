import React from 'react';
import { useState, useEffect } from 'react';
import {StyleSheet, View, Text, TouchableOpacity, Pressable} from 'react-native';
import { router, useLocalSearchParams, Link } from 'expo-router';
import { getData, getWords } from '../utils';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';


let timer = null;
const TIMEOUT = 500
const debounce = (onSingle, onDouble) => {
  if (timer) {
    clearTimeout(timer);
    timer = null;
    onDouble();
  } else {
    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      onSingle();
    }, TIMEOUT);
  }
};


export default function Details() {
    const [tap, setTap] = useState("...");
    const item = useLocalSearchParams();
    const [start, setStart] = useState(true);
    const [touched, setTouched] = useState(true);
    const [bookState, setBookState] = useState({
        book: [],
        currentPage: 0,
        currentWord: 0,
        currentWords: [],
    });

    useEffect(() => {
        setTimeout(() => {
          setTap("...");
        }, 2000);
      }, [tap]);
    
      const onSingleTap = () => setTap("single tap");
      const onDoubleTap = () => setTap("double tap");

      const onPress = () => {
        debounce(onSingleTap, onDoubleTap);
      };
    
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

    return (
        <View>
            {touched && 
            <TouchableOpacity style={styles.back} onPress={back}>
                <Icon name="chevron-left" size={32} color="#000" />
            </TouchableOpacity>
            }
            {start ? (
                 <CountdownCircleTimer
                 isPlaying
                 duration={3}
                 colors={['#004777', '#F7B801', '#A30000', '#A30000']}
                 colorsTime={[7, 5, 2, 0]}
                    onComplete={() => {
                        setStart(false);
                        //return [true, 1500] // repeat animation in 1.5 seconds
                    }}
               >
                 {({ remainingTime }) => <Text>{remainingTime}</Text>}
               </CountdownCircleTimer>
            ) : (
                <>
                <Text>xxxxxxxxxxx {bookState.currentWords[bookState.currentWord]}</Text>
                <Pressable onPress={onPress}>
                <Text>{tap} YYYY</Text>
                </Pressable>
</>
            )
            }
            
        </View>
    );
}   

const styles = StyleSheet.create({
    container: {
      flex: 1,
      marginTop: 24,
    },
    back: {
        top: 15,
        left: 15,
      },
});  