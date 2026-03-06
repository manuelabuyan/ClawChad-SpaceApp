import React, { useRef, useState, useEffect, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet, Dimensions, Animated, Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView, PanGestureHandler, State } from 'react-native-gesture-handler';

const { width, height } = Dimensions.get('window');
const Stack = createNativeStackNavigator();

// Global state for tracking held icons across the app
const heldIconsRef = { count: 0, lastReleasedCallback: null };

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
  const isHeld = useRef(false);

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
        // For drag release, handle like a press release
        handleRelease(onDragEnd);
      }
      Animated.spring(translateX, { toValue: 0, friction: 5, tension: 40, useNativeDriver: true }).start();
      Animated.spring(translateY, { toValue: 0, friction: 5, tension: 40, useNativeDriver: true }).start();
    }
  };

  const handlePressIn = () => {
    isHeld.current = true;
    heldIconsRef.count += 1;
    heldIconsRef.lastReleasedCallback = null;
  };

  const handleRelease = (callback) => {
    if (!isHeld.current) return;
    isHeld.current = false;

    heldIconsRef.count -= 1;

    if (heldIconsRef.count === 0) {
      // Last icon released - navigate to this one if it's the last held
      if (heldIconsRef.lastReleasedCallback) {
        heldIconsRef.lastReleasedCallback();
        heldIconsRef.lastReleasedCallback = null;
      } else {
        // Only one was held, navigate now
        callback();
      }
    } else {
      // Multiple icons held, mark this as the last released
      heldIconsRef.lastReleasedCallback = callback;
    }
  };

  const onPress = () => {
    if (!hasDragged.current) {
      handleRelease(onDragEnd);
    }
    hasDragged.current = false;
  };

  return (
    <PanGestureHandler onGestureEvent={onGestureEvent} onHandlerStateChange={onHandlerStateChange}>
      <Animated.View style={[style, { transform: [{ translateX }, { translateY }] }]}>
        <Pressable 
          onPressIn={handlePressIn}
          onPress={onPress} 
          style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}
        >
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
  "🦋 Some butterflies can taste with their feet",
  "🌴 The tallest tree ever recorded was 379 feet tall",
  "🦉 Owls don't make any noise when they fly",
  "🦎 Geckos can stick to surfaces using atomic forces",
  "🌊 The Great Barrier Reef is the largest living structure on Earth",
  "🦅 Eagles can see fish from hundreds of feet in the air",
  "🌋 The largest volcano in the solar system is on Mars, not Earth",
  "🐘 Elephants are the only mammals that can't jump",
  "🦒 A giraffe's neck has the same number of bones as humans",
  "🌊 There are more living organisms in a teaspoon of soil than people on Earth",
  "🦘 Kangaroos can't walk backwards",
  "🐻 Polar bears have black skin under their white fur",
  "🌵 Some cacti can live for 200 years",
  "🦑 Giant squids have the largest eyes in the animal kingdom",
  "🌊 The Pacific Ocean is wider than the moon"
];

function getRandomFacts(facts, count) {
  const shuffled = [...facts].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function EarthScreen({ navigation }) {
  const [currentFacts, setCurrentFacts] = useState(() => getRandomFacts(earthFacts, 3));

  const refreshFacts = () => {
    setCurrentFacts(getRandomFacts(earthFacts, 3));
  };

  return (
    <View style={styles.screenContainer}>
      <Text style={styles.backButton} onPress={() => navigation.goBack()}>← Back</Text>
      <View style={styles.iconWrapper}>
        <CustomEarthIcon />
      </View>
      <Text style={styles.screenText}>earth</Text>
      <Text style={styles.factsTitle}>Did you know?</Text>
      {currentFacts.map((fact, index) => (
        <Text key={index} style={styles.factItem}>{fact}</Text>
      ))}
      <Pressable style={styles.refreshButton} onPress={refreshFacts}>
        <Text style={styles.refreshText}>🔄 Refresh Facts</Text>
      </Pressable>
    </View>
  );
}

const moonFacts = [
  "🌙 The Moon formed about 4.5 billion years ago",
  "👣 Only 12 humans have walked on the Moon",
  "🙂 The Moon is moving 1.5 inches away from Earth yearly",
  "🌑 There's no sound on the Moon — it's silent",
  "🌡️ Temperatures range from 253°F to -387°F",
  "🚗 The Moon has less gravity — 16.5% of Earth's",
  "🌚 The Moon has 'moonquakes' just like earthquakes",
  "🌙 Neil Armstrong left 100 items on the Moon, including a gold olive branch",
  "🚩 The US flag on the Moon is probably bleached white by now",
  "🌑 The same side of the Moon always faces Earth",
  "👣 Footprints on the Moon will last for a million years",
  "🌙 The Moon is about 1/4 the size of Earth",
  "🌚 A full moon affects human sleep patterns",
  "🌙 The Moon has its own time zone: Lunar Standard Time",
  "👽 Scientists have found water ice on the Moon",
  "🌕 A blue moon isn't actually blue — it's just rare",
  "🌙 The Moon has no atmosphere to protect from meteors",
  "🌚 The dark patches on the Moon are ancient lava plains",
  "🌙 The Moon causes Earth's tides to rise and fall",
  "👞 The Apollo astronauts left 96 bags of poop on the Moon",
  "🌕 The Moon was once thought to have cheese on it",
  "🌙 It takes 27.3 days for the Moon to orbit Earth",
  "🌚 The Moon is drifting away 3.8 cm per year",
  "🌙 You would weigh 1/6 of your Earth weight on the Moon",
  "🌕 The Moon is slowly slowing down Earth's rotation",
  "🌙 Solar eclipses are only possible because the Moon perfectly covers the Sun",
  "🌚 The Moon has mountains higher than Mount Everest",
  "🌙 The first spacecraft to hit the Moon was in 1959 (Luna 2)",
  "🌕 The Moon's gravity causes bulges in Earth's oceans",
  "👨‍🚀 Eugene Cernan was the last person to walk on the Moon in 1972",
  "🌙 The Moon has about 500,000 craters visible from Earth",
  "🌚 A day on the Moon lasts about 29.5 Earth days"
];

function MoonScreen({ navigation }) {
  const [currentFacts, setCurrentFacts] = useState(() => getRandomFacts(moonFacts, 3));

  const refreshFacts = () => {
    setCurrentFacts(getRandomFacts(moonFacts, 3));
  };

  return (
    <View style={styles.screenContainer}>
      <Text style={styles.backButton} onPress={() => navigation.goBack()}>← Back</Text>
      <View style={styles.iconWrapper}>
        <CustomMoonIcon />
      </View>
      <Text style={styles.screenText}>moon</Text>
      <Text style={styles.factsTitle}>Lunar facts:</Text>
      {currentFacts.map((fact, index) => (
        <Text key={index} style={styles.factItem}>{fact}</Text>
      ))}
      <Pressable style={styles.refreshButton} onPress={refreshFacts}>
        <Text style={styles.refreshText}>🔄 Refresh Facts</Text>
      </Pressable>
    </View>
  );
}

const galaxyFacts = [
  "✨ The Milky Way has over 100 billion stars",
  "🌀 Galaxies come in three types: spiral, elliptical, irregular",
  "🌌 Andromeda is headed toward us — collision in 4.5 billion years",
  "⚫ Most large galaxies have a supermassive black hole at their center",
  "💫 The universe has over 2 trillion galaxies",
  "🔭 The oldest known galaxy formed just 250 million years after the Big Bang",
  "🌠 The Milky Way is 100,000 light-years across",
  "⚫ The largest known black hole is 66 billion times the mass of our sun",
  "🌌 Our solar system takes 230 million years to orbit the galaxy",
  "✨ A single teaspoon of neutron star weighs 6 billion tons",
  "🔭 The Hubble telescope can see 13.4 billion years into the past",
  "🌠 The Andromeda Galaxy is 2.5 million light-years away",
  "⚫ Time slows down near black holes (gravitational time dilation)",
  "🌌 Dark matter makes up 27% of the universe",
  "✨ The largest known galaxy is IC 1101, 6 million light-years wide",
  "🔭 Quasars are the brightest objects in the universe",
  "🌠 The Milky Way will collide with Andromeda in 4.5 billion years",
  "⚫ Nothing can escape a black hole's event horizon, not even light",
  "🌌 The observable universe is 93 billion light-years in diameter",
  "✨ Galaxies can cannibalize smaller galaxies",
  "🔭 The Sun and Earth are made of recycled stardust",
  "🌠 Neutron stars can spin 716 times per second",
  "⚫ Supermassive black holes can be billions of times the sun's mass",
  "🌌 Cosmic background radiation is leftover from the Big Bang",
  "✨ Some stars are 100 times bigger than our sun",
  "🔭 Light from the sun takes 8 minutes to reach Earth",
  "🌠 The Milky Way is part of the Local Group of galaxies",
  "⚫ Black holes can \"burp\" after eating stars",
  "🌌 The universe is expanding faster than the speed of light",
  "✨ Sirius is the brightest star in the night sky",
  "🔭 Gamma ray bursts are the most energetic events in the universe",
  "🌠 The nearest star system, Alpha Centauri, is 4.37 light-years away"
];

function GalaxyScreen({ navigation }) {
  const [currentFacts, setCurrentFacts] = useState(() => getRandomFacts(galaxyFacts, 3));

  const refreshFacts = () => {
    setCurrentFacts(getRandomFacts(galaxyFacts, 3));
  };

  return (
    <View style={styles.screenContainer}>
      <Text style={styles.backButton} onPress={() => navigation.goBack()}>← Back</Text>
      <View style={styles.iconWrapper}>
        <CustomGalaxyIcon />
      </View>
      <Text style={styles.screenText}>galaxy</Text>
      <Text style={styles.factsTitle}>Cosmic facts:</Text>
      {currentFacts.map((fact, index) => (
        <Text key={index} style={styles.factItem}>{fact}</Text>
      ))}
      <Pressable style={styles.refreshButton} onPress={refreshFacts}>
        <Text style={styles.refreshText}>🔄 Refresh Facts</Text>
      </Pressable>
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
  iconWrapper: {
    marginTop: 80,
    marginBottom: 20,
  },
  factsTitle: {
    color: '#9c27b0',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 30,
    marginBottom: 15,
    textShadowColor: 'rgba(156, 39, 176, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  factItem: {
    color: '#e0e0e0',
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
    paddingHorizontal: 30,
    lineHeight: 20,
  },
  refreshButton: {
    marginTop: 25,
    paddingHorizontal: 25,
    paddingVertical: 12,
    backgroundColor: '#4fc3f7',
    borderRadius: 25,
    shadowColor: '#4fc3f7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 8,
  },
  refreshText: {
    color: '#0a0a1a',
    fontSize: 16,
    fontWeight: '700',
  },
});
