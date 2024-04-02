import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const HighlightedWord = ({ word }) => {
    if (!word) return null;

    const getWordParts = (word) => {
        if (!word) return ['', '', ''];
        const middleIndex = Math.floor(word.length / 2);
        let before, middle, after;
    
        if (word.length % 2 === 0) {
            // For even-length words, highlight the letter immediately after the middle point
            before = word.substring(0, middleIndex);
            middle = word[middleIndex]; // Choose one middle letter for even-length words
            after = word.substring(middleIndex + 1);
        } else {
            // For odd-length words, highlight the exact middle letter
            before = word.substring(0, middleIndex);
            middle = word[middleIndex];
            after = word.substring(middleIndex + 1);
        }
    
        return [before, middle, after];
    };

    const [before, middle, after] = getWordParts(word);

    return (
        <View style={styles.textContainer}>
            <Text style={styles.text}>
                {before}
                <Text style={styles.middle}>{middle}</Text>
                {after}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    textContainer: {
        flex: 1, // Use flex to make the container expand to the entire screen
        justifyContent: 'center', // This will center the text vertically
        alignItems: 'center', // And this horizontally
    },
    text: {
        fontSize: 24,
        color: '#000',
        fontWeight: 'bold'
    },
    middle: {
        color: 'red',
    },
});

export default HighlightedWord;
