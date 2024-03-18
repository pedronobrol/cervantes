import AsyncStorage from '@react-native-async-storage/async-storage';

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

const wrapWordsWithSpans = (html) => {
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


export const adaptHTML = (htmlContent, width) => {
  const wrappedHtml = wrapWordsWithSpans(htmlContent);
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

export const storeData = async (id, value) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(id, jsonValue);
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