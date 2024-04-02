import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import axios, { all } from 'axios';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';

const adjustHtmlStylesForScreenSize = (htmlContent, width) => {
    const originalWidth = htmlContent.match(/width:(\d+(\.\d+)?)(pt|px)/)
    const scaleFactor = width/originalWidth[1];
  
    // Adjusts font-size, top, left, and width properties
    const adjustStyle = (match, p1, offset, string) => {
      const originalValue = parseFloat(p1);
      const adjustedValue = originalValue * scaleFactor;
      //console.log(`Adjusting ${p1} to ${adjustedValue.toFixed(2)}`);
      return match.replace(p1, adjustedValue.toFixed(2));
    };

  
    let adjustedHtmlContent = htmlContent
      .replace(/font-size:(\d+(\.\d+)?)(pt|px)/g, adjustStyle)
      .replace(/width:(\d+(\.\d+)?)(pt|px)/g, adjustStyle)
      .replace(/top:(\d+(\.\d+)?)(pt|px)/g, adjustStyle)
      .replace(/left:(\d+(\.\d+)?)(pt|px)/g, adjustStyle)
      .replace(/transform:matrix\(([^,]+),/, adjustStyle)
      .replace(/transform:matrix\([^,]+,([^,]+),/, adjustStyle)
      .replace(/transform:matrix\([^,]+,[^,]+,([^,]+),/, adjustStyle)
      .replace(/transform:matrix\([^,]+,[^,]+,[^,]+,([^,]+),/, adjustStyle)
      .replace(/transform:matrix\([^,]+,[^,]+,[^,]+,[^,]+,([^,]+),/, adjustStyle)
      .replace(/transform:matrix\([^,]+,[^,]+,[^,]+,[^,]+,[^,]+,([^,]+)\)/, adjustStyle);
      
    return adjustedHtmlContent;
  };

const wrapWordsWithSpans = (html, currentWord) => {
  let wordId = 0;
  // Split by " " to rudimentarily parse words; this could be enhanced with a more sophisticated regex for better accuracy.
  return html.replace(/>([^<]+)</g, (match, textContent) =>
    '>' + textContent.split(' ').map(word => {
      // Ensure the word is not empty or just whitespace before wrapping
      if (!word.trim()) return word;
      wrappedWord = '';
      if (currentWord === wordId) {
        wrappedWord = `<span id="${wordId}" style="background-color: yellow;">${word}</span>`;
      } else {
        wrappedWord = `<span id="${wordId}">${word}</span>`;
      }
      wordId++;
      return wrappedWord;
    }).join(' ') + '<'
  );
}

export const getWords = (html) => {
  words = [];
  // Split by " " to rudimentarily parse words; this could be enhanced with a more sophisticated regex for better accuracy.
  html.replace(/>([^<]+)</g, (match, textContent) =>
    '>' + textContent.split(' ').map(word => {
    words.push(word);
    })
  );
  return words;
}

export const adaptHTML = (htmlContent, width, currentWord) => {
  const wrappedHtml = wrapWordsWithSpans(htmlContent, currentWord);
  const adjustedHtml = adjustHtmlStylesForScreenSize(wrappedHtml, width);
  //const adjustedHtml = adjustHtmlStylesForScreenSize(wrappedHtml, null, null);
  return adjustedHtml;
}

export const getData = async (id) => {
  try {
    const jsonValue = await AsyncStorage.getItem(id);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    // error reading value
  }
};

export const deleteData = async (id) => {
  try {
    await AsyncStorage.removeItem(id);
  } catch (e) {
    // error reading value
  }
}

export const storeData = async (baseId, value) => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    let suffix = 0; // Start with no suffix
    let newId;

    do {
      suffix += 1; // Increment suffix starting from 1
      newId = `${baseId}${suffix > 1 ? suffix : ''}`; // Append suffix if greater than 1
    } while (allKeys.includes(newId)); // Check if the newly formed ID exists
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(newId, jsonValue);
  } catch (e) {
    // saving error
  }
};

export const listIds = async () => {
  try {
    return await AsyncStorage.getAllKeys();
  } catch (e) {
    // saving error
  }
};

export const PickDocument = async () => {
  console.log("Picking document");
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

      const { data } = await axios.post('http://192.168.18.244:33/extract_html', formData, {
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
      });
      data.current_page = 1;
      data.current_word = 0;
      await storeData(file.name, data);
      }

  } catch (e) {
    console.log(e);
  }
};