import React, { useState } from 'react';
import { FlatList, Text, TouchableOpacity, View, StyleSheet, PanResponder } from 'react-native';

const SwipeToDeleteFlatList = () => {
  const [data, setData] = useState([
    { id: '1', text: 'Item 1' },
    { id: '2', text: 'Item 2' },
    { id: '3', text: 'Item 3' },
    { id: '4', text: 'Item4'}
  ]);

  const handleDeleteItem = (id) => {
    const updatedData = data.filter((item) => item.id !== id);
    setData(updatedData);
  };

  const panResponder = (id) => {
    let dx = 0;

    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        dx = gestureState.dx;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (dx > 50) {
          // Swipe right threshold, you can adjust this value
          handleDeleteItem(id);
        }
      },
    });
  };

  const renderItem = ({ item }) => (
    <View {...panResponder(item.id).panHandlers}>
      <TouchableOpacity>
        <View style={styles.item}>
          <Text>{item.text}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
    />
  );
};

const styles = StyleSheet.create({
  item: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default SwipeToDeleteFlatList;