import React from 'react';
import { useState, useEffect } from 'react';
import { Alert, StyleSheet, View, FlatList, Text, TouchableOpacity, ScrollView, SafeAreaView, Image, ActivityIndicator } from 'react-native';
import { router, Link } from 'expo-router';
import { PickDocument, listIds, getData, deleteData} from './utils';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function Page() {
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(false); 

  const uploadButton = async () => {
    //await AsyncStorage.clear();
    setIsLoading(true);
    await PickDocument();
    await loadBooks();
  }
  const show = async (item) => {
    // pass item to show page
    router.push(`select/${item.title}`, {title: item.title});
  }
  const loadBooks = async () => {
    try {
      setIsLoading(true);
      book_list = [];
      setBooks([]);
      const ids = await listIds();
      console.log(ids);
      for (let index = 0; index < ids.length; index++){
        let id = ids[index];
        let data = await getData(id);
        let book = { id: index, title: id, totalPages: data.page_count, currentPage: data.current_page, currentWord: data.current_word};
        book_list.push(book);
      }
      setBooks(book_list);
    } catch (error) {
      console.error('Failed to load books from local storage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      "Delete Book", // Alert Title
      "Are you sure you want to delete this book?", // Alert Message
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        { text: "Yes", onPress: () => deleteBookConfirmed(id) } // Proceed with deletion
      ],
      { cancelable: false } // Prevent the alert from being dismissed by tapping outside of it
    );
  };
  
  const deleteBookConfirmed = async (id) => {
    await deleteData(id); // Implement this function to delete a book by its id
    loadBooks();
  };
  

  useEffect(() => {
    loadBooks();
  }, [])
  return (
    <SafeAreaView style={styles.container}>
      {/* Wrap content in a ScrollView to make it scrollable */}
        <Text style={styles.title}>Uploaded Books</Text>
        {isLoading ? (
        <ActivityIndicator style={styles.loading} size="large" color="#0000ff" /> // Show loading indicator
      ) : books.length ? (
          <FlatList
            data={books}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <>
              <TouchableOpacity style={styles.listItem} onPress={ ()=> show(item) } >
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemDetails}>
                  Page {item.currentPage} of {item.totalPages} ({((item.currentPage / item.totalPages) * 100).toFixed(0)}% complete)
                </Text>
              </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.title)}>
                <Icon name="delete" size={24} color="#000" />
                </TouchableOpacity>
                </>
            )}
            // This is not typically needed inside a ScrollView and could be problematic for performance
            // Consider removing the FlatList if not needed for large lists or adjust the approach
          />
        ) : (
          <>
          <Text style={styles.emptyMessage}>There are no books uploaded. Tap 'Upload Book' to add your first book.</Text>
          <Image style={styles.dog} source={require('../assets/dog.webp')} />
          </>
        )}
      {/* Fixed Button at the bottom */}
      <TouchableOpacity style={styles.uploadButton} onPress={uploadButton}>
        <Text style={styles.buttonText}>Upload Book</Text>
      </TouchableOpacity>
     </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 24,
  },

  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 15,
    marginTop: 10,
    marginBottom: 10,
  },
  listItem: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#dddddd',
    paddingHorizontal: 15,
    paddingVertical: 15,
    width: '100%',
  },
  itemTitle: {
    fontSize: 18,
    color: '#333333',
    fontWeight: 'bold',
  },
  itemDetails: {
    fontSize: 14,
    color: '#666666',
    marginTop: 5,
  },
  uploadButton: {
    padding: 10,
    backgroundColor: '#007bff',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
    borderRadius: 5,
    position: 'absolute', // Fix position to bottom
    bottom: 0,
    left: 20,
    right: 20,
  },
  buttonText: {
    fontSize: 18,
    color: '#ffffff',
  },
  emptyMessage: {
    marginTop: 20, // Adds some space above the message
    marginBottom: 0, // Removes the bottom margin to avoid double spacing
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    backgroundColor: '#f0f0f0', // Adds a light grey background for a subtle, clean look
    padding: 20, // Adds padding inside the message box for better text readability
    borderRadius: 10, // Rounds the corners for a softer, more modern appearance
    borderWidth: 1, // Adds a thin border
    borderColor: '#ddd', // Sets the border color to a light grey for a subtle outline
    elevation: 3, // Adds shadow for Android for a lifted effect
  },
  dog: {
    margin: 'auto',
    alignSelf: 'center',
  },
  deleteButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
  },
  loading : {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
