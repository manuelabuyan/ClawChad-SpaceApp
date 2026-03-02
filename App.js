import React, { useRef, useState, useEffect, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet, Dimensions, Animated, Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView, PanGestureHandler, State } from 'react-native-gesture-handler';

const { width, height } = Dimensions.get('window');
const Stack = createNativeStackNavigator();

// Individual sparkle star component
function SparkleStar({ id }) {
  const [position, setPosition] = useState({
    left: Math.random() * width,
    top: Math.random() * height,
    size: Math.random() * 3 + 1,
  });
  const opacity = useRef(new Animated.Value(0)).current;

  const sparkle = useCallback(() => {
    const duration = Math.random() * 4000 + 4000;
    const delay = Math.random() * 2000;

    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: duration / 2, delay, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: duration / 2, useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (finished) {
        setPosition({
          left: Math.random() * width,
          top: Math.random() * height,
          size: Math.random() * 3 + 1,
        });
        sparkle();
      }
    });
  }, [opacity]);

  useEffect(() => {
    sparkle();
  }, [sparkle]);

  return (
    <Animated.View
      style={[
        styles.star,
        {
          left: position.left,
          top: position.top,
          width: position.size,
          height: position.size,
          opacity: opacity,
        },
      ]}
    />
  );
}

// Stars container
function StarsBackground() {
  const [stars] = useState(() => Array.from({ length: 150 }, (_, i) => i));

  return (
    <>
      {stars.map((id) => (
        <SparkleStar key={id} id={id} />
      ))}
    </>
  );
}

function DraggableIcon({ children, onDragEnd, style }) {
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const hasDragged = useRef(false);

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX, translationY: translateY } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event) => {
    if (event.nativeEvent.state === State.BEGAN) {
      hasDragged.current = false;
    }
    if (event.nativeEvent.state === State.END) {
      const { translationX, translationY } = event.nativeEvent;
      const distance = Math.sqrt(translationX * translationX + translationY * translationY);
      if (distance > 50) {
        hasDragged.current = true;
        onDragEnd();
      }
      Animated.spring(translateX, { toValue: 0, friction: 5, tension: 40, useNativeDriver: true }).start();
      Animated.spring(translateY, { toValue: 0, friction: 5, tension: 40, useNativeDriver: true }).start();
    }
  };

  const onPress = () => {
    if (!hasDragged.current) {
      onDragEnd();
    }
  };

  return (
    <PanGestureHandler onGestureEvent={onGestureEvent} onHandlerStateChange={onHandlerStateChange}>
      <Animated.View style={[style, { transform: [{ translateX }, { translateY }] }]}>
        <Pressable onPress={onPress} style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
          {children}
        </Pressable>
      </Animated.View>
    </PanGestureHandler>
  );
}

function CustomEarthIcon() {
  return (
    <View style={styles.earthWrapper} pointerEvents="none">
      <View style={styles.planetBody}>
        <View style={styles.oceanBase}>
          <View style={styles.continent1} />
          <View style={styles.continent2} />
          <View style={styles.continent3} />
          <View style={styles.planetHighlight} />
        </View>
      </View>
      <View style={styles.planetGlow} />
    </View>
  );
}

function EarthIcon({ navigation }) {
  return (
    <DraggableIcon style={styles.earthContainer} onDragEnd={() => navigation.navigate('Earth')}>
      <CustomEarthIcon />
    </DraggableIcon>
  );
}

function CustomMoonIcon() {
  return (
    <View style={styles.moonWrapper} pointerEvents="none">
      <View style={styles.moonGlow} />
      <View style={styles.moonBody}>
        <View style={styles.moonInnerShadow}>
          <View style={styles.moonCrescent} />
        </View>
        <View style={styles.crater1} />
        <View style={styles.crater2} />
        <View style={styles.crater3} />
      </View>
    </View>
  );
}

function MoonIcon({ navigation }) {
  return (
    <DraggableIcon style={styles.moonContainer} onDragEnd={() => navigation.navigate('Moon')}>
      <CustomMoonIcon />
    </DraggableIcon>
  );
}

function CustomGalaxyIcon() {
  return (
    <View style={styles.galaxyWrapper} pointerEvents="none">
      <View style={styles.galaxyGlow} />
      <View style={styles.galaxyCore}>
        <View style={styles.galaxyCoreCenter} />
        <View style={styles.spiralArm1} />
        <View style={styles.spiralArm2} />
        <View style={styles.spiralArm3} />
      </View>
      <View style={[styles.galaxyStar, styles.star1]} />
      <View style={[styles.galaxyStar, styles.star2]} />
      <View style={[styles.galaxyStar, styles.star3]} />
      <View style={[styles.galaxyStar, styles.star4]} />
      <View style={[styles.galaxyStar, styles.star5]} />
    </View>
  );
}

function GalaxyIcon({ navigation }) {
  return (
    <DraggableIcon style={styles.galaxyContainer} onDragEnd={() => navigation.navigate('Galaxy')}>
      <CustomGalaxyIcon />
    </DraggableIcon>
  );
}

function HomeScreen({ navigation }) {
  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar style="light" />
      <StarsBackground />
      <EarthIcon navigation={navigation} />
      <MoonIcon navigation={navigation} />
      <GalaxyIcon navigation={navigation} />
    </GestureHandlerRootView>
  );
}

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
      <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0a0a1a' } }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Earth" component={EarthScreen} />
        <Stack.Screen name="Moon" component={MoonScreen} />
        <Stack.Screen name="Galaxy" component={GalaxyScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a1a' },
  star: { position: 'absolute', backgroundColor: '#ffffff', borderRadius: 999 },
  earthContainer: { position: 'absolute', top: height / 2 - 70, left: width / 2 - 70 },
  moonContainer: { position: 'absolute', top: height * 0.12, right: width * 0.08 },
  galaxyContainer: { position: 'absolute', bottom: height * 0.12, left: width * 0.08 },
  earthWrapper: { width: 140, height: 140, alignItems: 'center', justifyContent: 'center' },
  planetGlow: { position: 'absolute', width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(100, 200, 255, 0.15)', shadowColor: '#4fc3f7', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 25, elevation: 12 },
  planetBody: { width: 100, height: 100, borderRadius: 50, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 10 },
  oceanBase: { flex: 1, backgroundColor: '#2196f3', position: 'relative' },
  continent1: { position: 'absolute', width: 50, height: 35, backgroundColor: '#4caf50', borderRadius: 16, top: 16, left: 12, transform: [{ rotate: '-15deg' }], opacity: 0.9 },
  continent2: { position: 'absolute', width: 40, height: 28, backgroundColor: '#66bb6a', borderRadius: 14, bottom: 20, right: 14, transform: [{ rotate: '20deg' }], opacity: 0.85 },
  continent3: { position: 'absolute', width: 26, height: 20, backgroundColor: '#81c784', borderRadius: 10, top: 40, right: 12, opacity: 0.8 },
  planetHighlight: { position: 'absolute', top: 12, left: 14, width: 30, height: 16, backgroundColor: 'rgba(255, 255, 255, 0.25)', borderRadius: 14, transform: [{ rotate: '-20deg' }] },
  moonWrapper: { width: 110, height: 110, alignItems: 'center', justifyContent: 'center' },
  moonGlow: { position: 'absolute', width: 110, height: 110, borderRadius: 55, backgroundColor: 'rgba(200, 200, 255, 0.1)', shadowColor: '#e0e0ff', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 18, elevation: 10 },
  moonBody: { width: 75, height: 75, borderRadius: 37.5, backgroundColor: '#e8e8e8', overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  moonInnerShadow: { flex: 1, backgroundColor: '#d0d0d0', borderRadius: 37.5, position: 'relative' },
  moonCrescent: { position: 'absolute', width: 62, height: 62, borderRadius: 31, backgroundColor: '#0a0a1a', top: -12, right: -18 },
  crater1: { position: 'absolute', width: 14, height: 14, borderRadius: 7, backgroundColor: '#b8b8b8', top: 16, left: 14, opacity: 0.6 },
  crater2: { position: 'absolute', width: 8, height: 8, borderRadius: 4, backgroundColor: '#b0b0b0', bottom: 20, left: 25, opacity: 0.5 },
  crater3: { position: 'absolute', width: 6, height: 6, borderRadius: 3, backgroundColor: '#a8a8a8', top: 28, right: 16, opacity: 0.4 },
  galaxyWrapper: { width: 110, height: 110, alignItems: 'center', justifyContent: 'center' },
  galaxyGlow: { position: 'absolute', width: 110, height: 110, borderRadius: 55, backgroundColor: 'rgba(150, 50, 200, 0.1)', shadowColor: '#9c27b0', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 24, elevation: 10 },
  galaxyCore: { width: 70, height: 70, borderRadius: 35, backgroundColor: 'transparent', position: 'relative', alignItems: 'center', justifyContent: 'center' },
  galaxyCoreCenter: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#ffeb3b', shadowColor: '#ffeb3b', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 12, elevation: 6 },
  spiralArm1: { position: 'absolute', width: 56, height: 12, borderRadius: 6, backgroundColor: 'rgba(156, 39, 176, 0.6)', transform: [{ rotate: '45deg' }], top: 14, left: -8 },
  spiralArm2: { position: 'absolute', width: 48, height: 8, borderRadius: 4, backgroundColor: 'rgba(233, 30, 99, 0.5)', transform: [{ rotate: '-30deg' }], bottom: 14, right: -8 },
  spiralArm3: { position: 'absolute', width: 42, height: 7, borderRadius: 4, backgroundColor: 'rgba(33, 150, 243, 0.5)', transform: [{ rotate: '90deg' }], top: 20, right: 0 },
  galaxyStar: { position: 'absolute', backgroundColor: '#ffffff', borderRadius: 2, shadowColor: '#ffffff', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 4 },
  star1: { width: 6, height: 6, top: 8, left: 20 },
  star2: { width: 5, height: 5, top: 35, right: 14 },
  star3: { width: 5, height: 5, bottom: 28, left: 8 },
  star4: { width: 4, height: 4, bottom: 14, right: 28 },
  star5: { width: 6, height: 6, top: 55, left: 8 },
  screenContainer: { flex: 1, backgroundColor: '#0a0a1a', alignItems: 'center', justifyContent: 'center' },
  screenText: { color: '#ffffff', fontSize: 48, fontWeight: 'bold', textShadowColor: 'rgba(100, 150, 255, 0.8)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 20 },
  backButton: { position: 'absolute', top: 60, left: 20, color: '#ffffff', fontSize: 18, fontWeight: '600' },
});
