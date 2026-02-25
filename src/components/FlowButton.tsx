import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AI from '../assets/svgs/AIIcon';
import PreMade from '../assets/svgs/pre-made';
import SelfMade from '../assets/svgs/self-made';
import { RootStackParamList } from '../navigations/RootNavigation';
import { NavigationProp, useNavigation } from '@react-navigation/native';


const { width, height } = Dimensions.get('window');

const BOTTOM_NAV_HEIGHT = 60;

const OVERLAY_COLOR = 'rgba(55, 55, 55, 0.52)';

const FloatingMenu = () => {
  const insets = useSafeAreaInsets();
  const [isOpen, setIsOpen] = useState(false);

  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const menuScale = useRef(new Animated.Value(0)).current;
  const menuOpacity = useRef(new Animated.Value(0)).current;
  const fabRotation = useRef(new Animated.Value(0)).current;

  const toggleMenu = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(menuScale, {
          toValue: 1,
          friction: 8,
          tension: 120,
          useNativeDriver: true,
        }),
        Animated.timing(menuOpacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(fabRotation, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(menuScale, {
          toValue: 0,
          duration: 160,
          useNativeDriver: true,
        }),
        Animated.timing(menuOpacity, {
          toValue: 0,
          duration: 160,
          useNativeDriver: true,
        }),
        Animated.timing(fabRotation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isOpen, overlayOpacity, menuScale, menuOpacity, fabRotation]);

  const overlayAnimatedStyle = {
    opacity: overlayOpacity,
  };

  const menuAnimatedStyle = {
    opacity: menuOpacity,
    transform: [
      {
        scale: menuScale,
      },
    ],
  };

  const fabRotateInterpolate = fabRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '135deg'],
  });

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const menuItems = [
    { label: 'AI-made Goals', icon: <AI width={24} height={24} />, onPress: () => navigation.navigate('AiGoalsScreen') },
    { label: 'Pre-made Goals', icon: <PreMade width={24} height={24} />, onPress: () => {} },
    { label: 'Self-made Goals', icon: <SelfMade width={24} height={24} />, onPress: () => {} },
  ];

  const handleMenuItemPress = (item: (typeof menuItems)[number]) => {
    toggleMenu();
    item.onPress?.();
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Full-screen dark gray overlay – covers entire screen including bottom nav */}
      <Animated.View
        pointerEvents={isOpen ? 'auto' : 'none'}
        style={[styles.overlay, overlayAnimatedStyle]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={toggleMenu} />
      </Animated.View>

      <View style={[styles.fabContainer, { bottom: BOTTOM_NAV_HEIGHT + insets.bottom + 24 }]}>
        <Animated.View style={[styles.menuTooltipWrap, menuAnimatedStyle]}>
          <View style={styles.menuTooltip}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                activeOpacity={0.7}
                onPress={() => handleMenuItemPress(item)}
              >
                <View style={styles.iconContainer}>{item.icon}</View>
                <Text style={styles.menuText}>{item.label}</Text>
                {index < menuItems.length - 1 ? (
                  <View style={styles.separator} />
                ) : null}
              </TouchableOpacity>
            ))}
            <View style={styles.tail} />
          </View>
        </Animated.View>

        <Animated.View style={[styles.fabWrap, { transform: [{ rotate: fabRotateInterpolate }] }]}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={toggleMenu}
            style={styles.fab}
          >
            <Text style={styles.fabIcon}>+</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    width,
    height,
    backgroundColor: OVERLAY_COLOR,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    alignItems: 'flex-end',
  },
  fabWrap: {
    width: 60,
    height: 60,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF6B00',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  fabIcon: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: '300',
  },
  menuTooltipWrap: {
    marginBottom: 20,
    marginRight: -10,
  },
  menuTooltip: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    width: 220,
    paddingVertical: 5,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  iconContainer: {
    width: 30,
    marginRight: 10,
    alignItems: 'center',
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  separator: {
    position: 'absolute',
    bottom: 0,
    left: 15,
    right: 15,
    height: 1,
    backgroundColor: '#F0F0F0',
  },
  tail: {
    position: 'absolute',
    bottom: -10,
    right: 25,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FFF',
  },
});

export default FloatingMenu;
