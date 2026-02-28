import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

// Generate random stars
const generateStars = (count) => {
  const stars = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      id: i,
      left: Math.random() * width,
      top: Math.random() * height,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.8 + 0.2,
      delay: Math.random() * 3,
    });
  }
  return stars;
};

const stars = generateStars(150);

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {/* Stars */}
      {stars.map((star) => (
        <View
          key={star.id}
          style={[
            styles.star,
            {
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              opacity: star.opacity,
            },
          ]}
        />
      ))}
      {/* Welcome Text */}
      <Text style={styles.welcomeText}>welcome manny :)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
  },
  star: {
    position: 'absolute',
    backgroundColor: '#ffffff',
    borderRadius: 999,
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 2,
  },
  welcomeText: {
    position: 'absolute',
    top: height / 2 - 30,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
    textShadowColor: 'rgba(100, 150, 255, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
});
