import React, { useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet, Dimensions, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView, PanGestureHandler, State } from 'react-native-gesture-handler';

const { width, height } = Dimensions.get('window');
const Stack = createNativeStackNavigator();

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

// Icon Component with Drag and Spring Back
function DraggableIcon({ children, onDragEnd, style }) {
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const onGestureEvent = Animated.event(
    [
      {
        nativeEvent: {
          translationX: translateX,
          translationY: translateY,
        },
      },
    ],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX, translationY } = event.nativeEvent;
      
      // If dragged far enough (threshold of 50), trigger navigation
      const distance = Math.sqrt(translationX * translationX + translationY * translationY);
      if (distance > 50) {
        onDragEnd();
      }
      
      // Spring back to original position
      Animated.spring(translateX, {
        toValue: 0,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }).start();
      
      Animated.spring(translateY, {
        toValue: 0,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }
  };

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
    >
      <Animated.View
        style={[
          style,
          {
            transform: [{ translateX }, { translateY }],
          },
        ]}
      >
        {children}
      </Animated.View>
    </PanGestureHandler>
  );
}

// Earth Icon
function EarthIcon({ navigation }) {
  return (
    <DraggableIcon
      style={styles.earthContainer}
      onDragEnd={() => navigation.navigate('Earth')}
    >
      <Text style={styles.iconLarge}>🌍</Text>
    </DraggableIcon>
  );
}

// Moon Icon
function MoonIcon({ navigation }) {
  return (
    <DraggableIcon
      style={styles.moonContainer}
      onDragEnd={() => navigation.navigate('Moon')}
    >
      <Text style={styles.iconMedium}>🌙</Text>
    </DraggableIcon>
  );
}

// Galaxy Icon
function GalaxyIcon({ navigation }) {
  return (
    <DraggableIcon
      style={styles.galaxyContainer}
      onDragEnd={() => navigation.navigate('Galaxy')}
    >
      <Text style={styles.iconMedium}>✨</Text>
    </DraggableIcon>
  );
}

// Home Screen
function HomeScreen({ navigation }) {
  return (
    <GestureHandlerRootView style={styles.container}>
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
      
      {/* Earth - Center */}
      <EarthIcon navigation={navigation} />
      
      {/* Moon - Top Right */}
      <MoonIcon navigation={navigation} />
      
      {/* Galaxy - Bottom Left */}
      <GalaxyIcon navigation={navigation} />
    </GestureHandlerRootView>
  );
}

// Planet/Screen Components
function EarthScreen({ navigation }) {
  return (
    <View style={styles.screenContainer}>
      <Text style={styles.backButton} onPress={() => navigation.goBack()}>← Back</Text>
      <Text style={styles.screenText}>earth</Text>
    </View>
  );
}

function MoonScreen({ navigation }) {
  return (
    <View style={styles.screenContainer}>
      <Text style={styles.backButton} onPress={() => navigation.goBack()}>← Back</Text>
      <Text style={styles.screenText}>moon</Text>
    </View>
  );
}

function GalaxyScreen({ navigation }) {
  return (
    <View style={styles.screenContainer}>
      <Text style={styles.backButton} onPress={() => navigation.goBack()}>← Back</Text>
      <Text style={styles.screenText}>galaxy</Text>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0a0a1a' },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Earth" component={EarthScreen} />
        <Stack.Screen name="Moon" component={MoonScreen} />
        <Stack.Screen name="Galaxy" component={GalaxyScreen} />
      </Stack.Navigator>
    </NavigationContainer>
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
  // Icon Positions
  earthContainer: {
    position: 'absolute',
    top: height / 2 - 50,
    left: width / 2 - 40,
  },
  moonContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
  },
  galaxyContainer: {
    position: 'absolute',
    bottom: 60,
    left: 20,
  },
  iconLarge: {
    fontSize: 80,
  },
  iconMedium: {
    fontSize: 60,
  },
  // Screen styles
  screenContainer: {
    flex: 1,
    backgroundColor: '#0a0a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenText: {
    color: '#ffffff',
    fontSize: 48,
    fontWeight: 'bold',
    textShadowColor: 'rgba(100, 150, 255, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});
