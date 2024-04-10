// WpmSelector.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';

const WpmSelector = ({ initialWpm, onWpmChange }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const wpmOptions = [100, 200, 300, 400, 500, 600, 800, 1200, 1400,]; // Example WPM options

  const toggleModal = () => setModalVisible(!modalVisible);

  const handleWpmSelect = (wpm) => {
    onWpmChange(wpm); // Call the passed-in callback function to update parent state
    toggleModal(); // Close the modal
  };

  return (
    <View>
      <TouchableOpacity onPress={toggleModal}>
        <Text style={styles.wpmText}>{initialWpm} wpm</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent onRequestClose={toggleModal}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {wpmOptions.map((wpm) => (
              <TouchableOpacity key={wpm} style={styles.wpmOption} onPress={() => handleWpmSelect(wpm)}>
                <Text style={styles.wpmOptionText}>{wpm} wpm</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  wpmText: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  wpmOption: {
    backgroundColor: '#2196F3',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  wpmOptionText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default WpmSelector;
