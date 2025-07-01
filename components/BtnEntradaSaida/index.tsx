import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function BtnEntradaSaida() {
  const [isOpen, setIsOpen] = useState(false);
  const animation = useState(new Animated.Value(0))[0];

  const toggleMenu = () => {
    const toValue = isOpen ? 0 : 1;
    Animated.spring(animation, {
      toValue,
      friction: 6,
      useNativeDriver: true,
    }).start();
    setIsOpen(!isOpen);
  };

  const entradaSaidaStyle = {
    transform: [
      { scale: animation },
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -60],
        }),
      },
    ],
  };

  const saidaStyle = {
    transform: [
      { scale: animation },
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -120],
        }),
      },
    ],
  };

  const rotation = {
    transform: [
      {
        rotate: animation.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '45deg'],
        }),
      },
    ],
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, styles.secondary, saidaStyle]}
        onPress={() => router.push('/saida')}
      >
        <Feather name="arrow-up" size={20} color="#FFF" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.secondary, entradaSaidaStyle]}
        onPress={() => router.push('/entrada')}
      >
        <Feather name="arrow-down" size={20} color="#FFF" />
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.menu]} onPress={toggleMenu}>
        <Animated.View style={rotation}>
          <Feather name="plus" size={24} color="#FFF" />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    alignItems: 'center',
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 5,
  },
  menu: {
    backgroundColor: '#004880',

  },
  secondary: {
    flexDirection: "row",
    position: 'absolute',
    backgroundColor: '#004880',
    width: 48,
    height: 48,
    borderRadius: 24,
  },
});
