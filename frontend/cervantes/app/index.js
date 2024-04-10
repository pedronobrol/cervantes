import React from 'react';
import { useState, useEffect } from 'react';
import { Modal, Alert, StyleSheet, View, FlatList, TextInput, Text, TouchableOpacity, ScrollView, SafeAreaView, Image, ActivityIndicator } from 'react-native';
import { router, Link } from 'expo-router';
import { PickDocument, listIds, getData, deleteData} from './utils';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
//import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Page() {
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(false); 
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState(''); // State for search query
  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase())
  ); // Filter books based on search query

  const uploadButton = async () => {
    //await AsyncStorage.clear();
    setIsLoading(true);
    try {
      await PickDocument();
      await loadBooks();
    } catch (error) {
      console.error('Failed to pick document:', error);
      Alert.alert('Failed to upload the document. Try again later.');
      setIsLoading(false);
    }
  }

  const quickRead = async () => {
    router.push('quickread');
  }
  
  const toggleMenu = () => {
    setIsMenuVisible(!isMenuVisible);
  };

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
      //console.log(ids);
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
    //AsyncStorage.clear();
    loadBooks();
  }, [])
  return (
    <SafeAreaView style={styles.container}>
         <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
          <Icon name="menu" size={30} color="#000" />
        </TouchableOpacity>
        <Modal
          animationType="fade"
          transparent={true}
          visible={isMenuVisible}
          onRequestClose={toggleMenu}
         >
          <View style={styles.menuContainer}>
            <ScrollView style={styles.menuItems}>
            <TouchableOpacity onPress={toggleMenu} style={styles.menuCloseButton}>
              <Icon name="close" size={30} color="#000" />
            </TouchableOpacity>
            <Text style={styles.menuText}>What do you want to do?</Text>
            <Link href="/" style={styles.menuItem}>How to use the app</Link>
            <TouchableOpacity onPress={() => {
            // Close the modal first to ensure the UI is responsive
            toggleMenu();
            // Delay the upload logic slightly to ensure the modal has time to close
            setTimeout(() => {
              uploadButton();
            }, 1000); // Adjust delay as needed
          }}>
              <Text style={styles.menuItem}>Upload document</Text>
            </TouchableOpacity>
            <Link href="/" style={styles.menuItem}>Open URL</Link>
            <Link href="/" style={styles.menuItem}>Paste text</Link>
            <Link href="/" style={styles.menuItem}>Settings</Link>
            </ScrollView>
            {/* Add more menu items here */}
          </View>
        </Modal>
        
        <Image style={styles.icon} source={require('../assets/icon.png')} />
        <Text style={styles.iconText}>Turbo Reader</Text>
        {/* <Text style={styles.title}>Continue reading</Text> */}
          {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Filter as you wish"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

        {isLoading ? (
        <>
          <ActivityIndicator style={styles.loading} size="large" color="#0000ff" /> 
        </>
      ) : books.length ? (
          <FlatList
            data={filteredBooks}
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
      <TouchableOpacity style={styles.uploadButton} onPress={quickRead}>
        <Text style={styles.buttonText}>Quick read</Text>
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
    fontSize: 28,
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
  icon: {
    width: 80,
    height: 80,
    alignSelf: 'center',
    marginTop: 20,
  },
  iconText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 0,
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
  },
  menuButton: {
    position: 'absolute',
    left: 20,
    top: 20,
  },
  menuContainer: {
    flex: 1,
    justifyContent: 'center', // Centers the children vertically in the container
    alignItems: 'center', // Centers the children horizontally in the container
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background for modal overlay
    padding: 0,
  },
  menuCloseButton: {
    alignSelf: 'flex-end', // Positions the close button at the end of the container
    marginTop: 50,
    marginBottom: 20,
    marginRight: 20,
  },
  menuItems: {
    width: '100%', // Takes full width to align the text
    backgroundColor: '#ffffff', // White background for the menu items area
    borderRadius: 20, // Rounded corners for modern look
    paddingVertical: 20, // Vertical padding for breathing space
    paddingHorizontal: 10, // Horizontal padding for alignment
  },
  menuText: {
    fontSize: 20, // Larger font for prominence
    textAlign: 'center', // Center-align text for better readability
    marginBottom: 20, // Spacing between the text and menu items
  },
  menuItem: {
    fontSize: 18,
    color: '#333333', // Dark text for better readability
    padding: 10, // Padding around each menu item for tap ease
    marginVertical: 5, // Spacing between menu items
    backgroundColor: '#f2f2f2', // Slightly off-white background for each item
    borderRadius: 10, // Rounded corners for each item
    overflow: 'hidden', // Ensures the background does not bleed past the border radius
    textAlign: 'center', // Center-align text
    fontWeight: 'bold', // Bold font for prominence
  },
  searchBar: {
    fontSize: 18,
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    margin: 20,
    marginBottom: 0, // Adjust based on your layout
    backgroundColor: '#F9F9F9', // Light grey background
  },
});
