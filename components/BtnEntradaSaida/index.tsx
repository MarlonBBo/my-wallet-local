import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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

  const entradaStyle = {
    transform: [
      { scale: animation },
      {
        translateX: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -85],
        }),
      },
    ],
  };

  const saidaStyle = {
    transform: [
      { scale: animation },
      {
        translateX: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -190],
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
        onPress={() => {
          router.push('/saida');
          toggleMenu();
        }}
      >
        <Feather name="arrow-up" size={20} color="#FFF" />
        <Text style={styles.buttonText}>Saída</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.secondary, entradaStyle]}
        onPress={() => {
          router.push('/entrada');
          toggleMenu();
        }}
      >
        <Feather name="arrow-down" size={20} color="#FFF" />
        <Text style={styles.buttonText}>Entrada</Text>
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
    position: 'absolute',
    backgroundColor: '#005A9C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    height: 48,
    bottom: 5,
    borderRadius: 24,
    paddingHorizontal: 15,
    gap: 5,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
