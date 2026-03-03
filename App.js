import React, { useRef, useState, useEffect, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet, Dimensions, Animated, Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView, PanGestureHandler, State } from 'react-native-gesture-handler';

const { width, height } = Dimensions.get('window');
const Stack = createNativeStackNavigator();

// Track active touches across all icons - only navigate when last one is released
const activeTouches = new Set();
let navigationLocked = false;

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

  useEffect(() => { sparkle(); }, [sparkle]);

  return (
    <Animated.View style={[
      styles.star,
      {
        left: position.left,
        top: position.top,
        width: position.size,
        height: position.size,
        opacity: opacity,
      },
    ]} />
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

function DraggableIcon({ children, onDragEnd, style, iconId }) {
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const hasDragged = useRef(false);
  const isActive = useRef(false);

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX, translationY: translateY } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event) => {
    if (event.nativeEvent.state === State.BEGAN) {
      hasDragged.current = false;
      isActive.current = true;
      activeTouches.add(iconId);
    }
    if (event.nativeEvent.state === State.END) {
      isActive.current = false;
      activeTouches.delete(iconId);

      const { translationX, translationY } = event.nativeEvent;
      const distance = Math.sqrt(translationX * translationX + translationY * translationY);

      // Only navigate if this was a valid drag AND no other touches are active AND not locked
      const shouldNavigate = distance > 50 && !navigationLocked && activeTouches.size === 0;

      if (shouldNavigate) {
        hasDragged.current = true;
        navigationLocked = true;
        onDragEnd();
        setTimeout(() => { navigationLocked = false; }, 500);
      }

      Animated.spring(translateX, { toValue: 0, friction: 5, tension: 40, useNativeDriver: true }).start();
      Animated.spring(translateY, { toValue: 0, friction: 5, tension: 40, useNativeDriver: true }).start();
    }
  };

  const onPress = () => {
    if (!hasDragged.current && !navigationLocked) {
      navigationLocked = true;
      onDragEnd();
      setTimeout(() => { navigationLocked = false; }, 500);
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
    <DraggableIcon style={styles.earthContainer} iconId="earth" onDragEnd={() => navigation.navigate('Earth')}>
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
    <DraggableIcon style={styles.moonContainer} iconId="moon" onDragEnd={() => navigation.navigate('Moon')}>
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
    <DraggableIcon style={styles.galaxyContainer} iconId="galaxy" onDragEnd={() => navigation.navigate('Galaxy')}>
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

const earthFacts = [
  "🌍 Earth is the only planet known to support life",
  "🌊 About 71% of Earth's surface is covered by water",
  "🌳 Earth is 4.54 billion years old",
  "🌬️ The atmosphere is 78% nitrogen, 21% oxygen",
  "🌎 A day is actually 23 hours 56 minutes 4 seconds",
  "🌋 Earth has more than 1,500 active volcanoes",
  "🐋 The blue whale is the largest animal ever to exist",
  "🌈 Rainbows are actually full circles, but we only see half",
  "🌪️ The fastest wind speed recorded was 253 mph in a tornado",
  "🦈 Sharks have been around longer than trees",
  "🌌 You can see about 2,500 stars with the naked eye",
  "🦘 Australia is wider than the moon",
  "🌡️ The hottest temperature recorded was 134°F in Death Valley",
  "❄️ The coldest temperature recorded was -128.6°F in Antarctica",
  "🌊 The deepest part of the ocean is 36,000 feet deep",
  "🌳 The Amazon rainforest produces 20% of the world's oxygen",
  "🐝 Bees can detect electric fields from flowers",
  "🦋 Some