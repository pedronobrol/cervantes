import React from 'react';
import { useState, useEffect } from 'react';
import {Keyboard, TextInput, SafeAreaView, View, Alert, Text, ScrollView, StyleSheet, useWindowDimensions, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import RenderHtml from 'react-native-render-html';
import { getData, adaptHTML } from '../utils';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Slider from '@react-native-community/slider';
import { useSwipe } from '../hooks/useSwipe'

export default function Details() {
  const { onTouchStart, onTouchEnd } = useSwipe(onSwipeLeft, onSwipeRight, 6)
  const [book, setBook] = useState([]);
  const [HTML, setHTML] = useState('');
  const [currentPage, setCurrentPage] = useState("1");
  const [pageTemp, setPageTemp] = useState("1");
  const [edit, setEdit] = useState(false);
  const [sliderValue, setSliderValue] = useState("100");

  const { width } = useWindowDimensions();
  const item = useLocalSearchParams();

  function onSwipeLeft(){
    console.log('SWIPE_LEFT')
}

  function onSwipeRight(){
      console.log('SWIPE_RIGHT')
  }

  const loadBook = async () => {
    try {
        let data = await getData(item.book);
        setBook(data);
        setCurrentPage(data.current_page.toString());
        setPageTemp(data.current_page.toString());
        setHTML(adaptHTML(data.pages[data.current_page - 1], width/1.3, 0));
    } catch (error) {
      console.error('Failed to load books from local storage:', error);
    }
  };

  const back = () => {
    router.push('/');
  }

  const play = () => {
    router.push(`play/${item.book}`, {title: item.book});
  }

  const change = (page) => {
    setPageTemp(page);
  }

  const go = (page) => {
    if (page === "" || !/^[0-9]+$/.test(page) || Number(page) < 1 || Number(page) > book.page_count){
      setPageTemp(currentPage);
      Keyboard.dismiss(); 
      setEdit(false);
      return;
    }
    Keyboard.dismiss(); 
    setEdit(false);
    setPageTemp(page);
    setCurrentPage(page);
    let newPage = adaptHTML(book.pages[Number(page) - 1], width/1.3, 0);
    setHTML(newPage);
  }

  const cancel = () => {
    setPageTemp(currentPage);
    Keyboard.dismiss(); 
    setEdit(false);
  }

  useEffect(() => {
    loadBook();
  }, []);   

  const renderers = {
    span: ({ tnode, TDefaultRenderer, ...props }) => {
      // Assuming the ID attribute is correctly set in your HTML
      const id = tnode.attributes.id;
      const onPress = () => {
        setHTML(adaptHTML(book.pages[Number(currentPage) - 1], width/1.3, Number(id)));
      };
  
      return (
        <TouchableOpacity onPress={onPress}>
          <Text>
            <TDefaultRenderer {...props} tnode={tnode} />
          </Text>
        </TouchableOpacity>
      );
    },
  };
  const MemoizedRenderHtml = React.memo(RenderHtml);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
      {edit ? (
         <TouchableOpacity style={styles.back} onPress={() => cancel()}> 
          <Icon name="window-close" size={32} color="#000" />
         </TouchableOpacity>
        ) :
      (
        <TouchableOpacity style={styles.back} onPress={back}>
          <Icon name="chevron-left" size={32} color="#000" />
        </TouchableOpacity>
      )}
      <View>
      <TextInput onFocus={() => setEdit(true)} style={styles.page} inputMode='numeric' keyboardType='numeric' onEndEditing={(text) => go(text)} onChangeText={(text) => change(text)} value={pageTemp}/>
      <Text style={styles.of}>of {book ? book.page_count : "" }</Text>
      </View>
      {edit ? (
      <TouchableOpacity style={styles.play} onPress={() => go(pageTemp)}> 
        <Icon name="check" size={32} color="#000" />
      </TouchableOpacity>
      ) : (
      <TouchableOpacity style={styles.play} onPress={play}>   
          <Icon name="play" size={32} color="#000" />
      </TouchableOpacity>)}
      </View>
    <ScrollView 
    minimumZoomScale={1} // No zoom
    maximumZoomScale={3}
    onTouchStart={onTouchStart} 
    onTouchEnd={onTouchEnd}
    >
      <View style={styles.htmlContainer}>
        <MemoizedRenderHtml contentWidth={width/4}
        source={{ html: HTML}}
        renderers={renderers}
        />
      </View>
  </ScrollView>
<View style={styles.sliderLabel}>
<Text>100</Text>
<Text style={{fontWeight: 'bold', fontSize: 18}}>{sliderValue}wpm</Text>
<Text>500</Text>
</View>
<Slider style={styles.slider}
  minimumValue={100}
  maximumValue={500}
  //onValueChange={(value) => setSliderValue(value)}
  onSlidingComplete={(value) => setSliderValue(value)}
  value = {100}
  step={100}
  minimumTrackTintColor="#000000"
  maximumTrackTintColor="#000000"
/>
  </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    padding: 0,
    margin: 0 
  },
  htmlContainer: {
    width: '100%', // Ensures the container takes up 100% of the width of its parent
    alignItems: 'center', // Centers the RenderHtml component
  },
  back: {
    top: 15,
    left: 15,
  },
  play: {
    top: 15,
    left: -15,
  },
  page: {
    top: 15,
    left: 0,
    fontWeight: 'bold',
    fontSize: 22,
    height: 40,
    margin: 12,
    padding: 10,
  },
  of: {
    top: 2,
    left: 14,
    fontSize: 12,
  },
  slider: {
    width: '100%',
    height: 40,
    position: 'absolute',
    bottom: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#fff',
  },
  sliderLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 18,
    marginBottom: 30,
    fontSize: 12,
  },
});

