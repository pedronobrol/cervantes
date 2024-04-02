import * as React from 'react';
import {TouchableOpacity, Alert, Text, View, ScrollView, StyleSheet, Button, Dimensions, useWindowDimensions } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import RenderHtml from 'react-native-render-html';
import axios from 'axios';
import { adaptHTML, getData, storeData, listIds } from './util';


export default function App() {
  const [HTML, SetHTML] = React.useState('');
  const { width } = useWindowDimensions();


  const PickDocument = async () => {
    try {
      let result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
      if (result.canceled == false) {
        const file = result.assets[0];
        const formData = new FormData();
        formData.append('file', {
          uri: file.uri,
          name: file.name,
          type: file.mimeType,
          size: file.size,
        });

        const { data } = await axios.post('http://172.20.10.10:33/extract_html', formData, {
          headers: {
            Accept: "application/json",
            "Content-Type": "multipart/form-data",
          },
        });
        let html = adaptHTML(data.pages[0], width/1.3);
        //Save data to local storage with key uri. Add name to object to be saved
        await storeData(file.name, data);
        
        const ids = listIds();
        console.log(ids[0]);
        let x = await getData(file.name);
        console.log(x);
      }

    } catch (e) {
      console.log(e);
    }
  };

const renderers = {
  span: ({ tnode, TDefaultRenderer, ...props }) => {
    // Assuming the ID attribute is correctly set in your HTML
    const id = tnode.attributes.id;
    const textContent = tnode.domNode.textContent;

    const onPress = () => {
      console.log(`Pressed ${id}: ${textContent}`);
      Alert.alert(`Pressed ${id}`, textContent);
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
  return (
    <ScrollView>
        <Text>a todos los ciudadanos; pero eso </Text>

      <View style={styles.htmlContainer}>
        <RenderHtml contentWidth={width/4}
        source={{ html: HTML }}
        renderers={renderers}
        />
      </View>
      <Button title="Pick Document" onPress={PickDocument} />
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1, // Makes sure the container takes up the full space
    justifyContent: 'space-between', // Distributes space between items
    paddingHorizontal: 10, // Adds some padding on the sides
  },
  htmlContainer: {
    width: '100%', // Ensures the container takes up 100% of the width of its parent
    alignItems: 'center', // Centers the RenderHtml component
    marginBottom: 20, // Adds some space below the RenderHtml component
  },
});

