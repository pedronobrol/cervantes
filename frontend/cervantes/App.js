import * as React from 'react';
import {TouchableOpacity, Alert, Text, View, ScrollView, StyleSheet, Button, Dimensions, useWindowDimensions } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import RenderHtml from 'react-native-render-html';
import axios from 'axios';

export default function App() {
  const [HTML, SetHTML] = React.useState('');

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

        const { data } = await axios.post('http://192.168.18.117:33/extract_html', formData, {
          headers: {
            Accept: "application/json",
            "Content-Type": "multipart/form-data",
          },
        });
        SetHTML(data.pages[0]);
      }

    } catch (e) {
      console.log(e);
    }
  };
  const { width } = useWindowDimensions();



const adjustHtmlStylesForScreenSize = (htmlContent, originalWidthPt) => {
  const screenWidth = 100; // Width of the screen in pixels
  // Convert screen width from pixels to points (assuming 1pt = 1.333px for simplicity)
  const screenWidthPt = screenWidth / 1.333;
  const scaleFactor = screenWidthPt / originalWidthPt;

  // Adjusts font-size, top, left, and width properties
  const adjustStyle = (match, p1, offset, string) => {
    const originalValue = parseFloat(p1);
    const adjustedValue = originalValue * scaleFactor;
    return match.replace(p1, adjustedValue.toFixed(2));
  };

  let adjustedHtmlContent = htmlContent
    .replace(/font-size:(\d+(\.\d+)?)(pt|px)/g, adjustStyle)
    .replace(/width:(\d+(\.\d+)?)(pt|px)/g, adjustStyle)
    .replace(/top:(\d+(\.\d+)?)(pt|px)/g, adjustStyle)
    .replace(/left:(\d+(\.\d+)?)(pt|px)/g, adjustStyle);

  return adjustedHtmlContent;
};

function wrapWordsWithSpans(html) {
  let wordId = 0;
  // Split by " " to rudimentarily parse words; this could be enhanced with a more sophisticated regex for better accuracy.
  return html.replace(/>([^<]+)</g, (match, textContent) =>
    '>' + textContent.split(' ').map(word => {
      // Ensure the word is not empty or just whitespace before wrapping
      if (!word.trim()) return word;
      const wrappedWord = `<span id="${wordId}">${word}</span>`;
      wordId++;
      return wrappedWord;
    }).join(' ') + '<'
  );
}

 // Function to handle word press
 const onWordPress = (id, word) => {
  console.log(`Pressed ${id}: ${word}`);
  Alert.alert(`Pressed ${id}`, word);
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
        <RenderHtml contentWidth={200}
        source={{ html: wrapWordsWithSpans(adjustHtmlStylesForScreenSize(HTML)) }}
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

