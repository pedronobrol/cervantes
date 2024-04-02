import React from 'react';
import { View, Text, Button } from 'react-native';
import { Link } from 'expo-router';

export default function Home() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Home Screen</Text>
      <Link to="/index">Go to Details</Link>
    </View>
  );
}
