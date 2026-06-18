import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  Animated,
  PanResponder,
  Dimensions,
  TouchableWithoutFeedback,
  Platform,
  Keyboard,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
}

export default function BottomSheet({
  visible,
  onClose,
  title,
  children,
  showCloseButton = true,
}: BottomSheetProps) {
  const [showModal, setShowModal] = useState(visible);
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const keyboardOffset = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (visible) {
      setShowModal(true);
      Animated.timing(translateY, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 220,
        useNativeDriver: true,
      }).start(() => {
        setShowModal(false);
      });
    }
  }, [visible]);

  // Keyboard Listeners for precise position shifting
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(showEvent, (e) => {
      // Offset matches keyboard height exactly to sit on top of it, with a tiny extra gap
      const targetOffset = -e.endCoordinates.height - 4;
      Animated.timing(keyboardOffset, {
        toValue: targetOffset,
        duration: e.duration || 250,
        useNativeDriver: true,
      }).start();
    });

    const hideSubscription = Keyboard.addListener(hideEvent, (e) => {
      Animated.timing(keyboardOffset, {
        toValue: 0,
        duration: e.duration || 250,
        useNativeDriver: true,
      }).start();
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [insets.bottom]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only trigger pan responder if dragging down
        return gestureState.dy > 5;
      },
      onPanResponderGrant: () => {
        translateY.setOffset(0);
      },
      onPanResponderMove: (_, gestureState) => {
        // Drag downwards only
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        // If swiped down past threshold or high downward velocity
        if (gestureState.dy > 120 || gestureState.vy > 0.5) {
          Animated.timing(translateY, {
            toValue: SCREEN_HEIGHT,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            onClose();
          });
        } else {
          // Snap back
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 4,
          }).start();
        }
      },
    })
  ).current;

  // Interpolate backdrop opacity based on translateY position
  const backdropOpacity = translateY.interpolate({
    inputRange: [0, SCREEN_HEIGHT],
    outputRange: [0.6, 0],
    extrapolate: 'clamp',
  });

  const handleClose = () => {
    Animated.timing(translateY, {
      toValue: SCREEN_HEIGHT,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  if (!showModal) return null;

  const combinedTranslateY = Animated.add(translateY, keyboardOffset);
  const bottomSpacer = insets.bottom || 16;

  return (
    <Modal
      transparent
      visible={showModal}
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Stationary Backdrop Overlay */}
        <TouchableWithoutFeedback onPress={handleClose}>
          <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />
        </TouchableWithoutFeedback>

        {/* Sliding Sheet */}
        <Animated.View
          style={[
            styles.sheet,
            {
              transform: [{ translateY: combinedTranslateY }],
            },
          ]}
        >
          {/* Gesture Handler Header Area */}
          <View {...panResponder.panHandlers} style={styles.header}>
            <View style={styles.dragHandle} />
            {(title || showCloseButton) && (
              <View style={styles.headerTitleRow}>
                {title ? <Text style={styles.title}>{title}</Text> : <View />}
                {showCloseButton && (
                  <TouchableWithoutFeedback onPress={handleClose}>
                    <View style={styles.closeButton}>
                      <X size={20} stroke="#64748B" />
                    </View>
                  </TouchableWithoutFeedback>
                )}
              </View>
            )}
          </View>

          {/* Sheet Content */}
          <View style={styles.content}>{children}</View>
          
          {/* Static Bottom spacer matching safe area bottom to prevent layout sinking */}
          <View style={{ height: bottomSpacer }} />

          {/* Under-keyboard background cover extension to prevent transparent gap behind keyboard */}
          <View style={styles.underKeyboardExtension} />
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0F172A',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '85%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 24,
  },
  header: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 16,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    marginBottom: 12,
  },
  headerTitleRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 16 : 24,
  },
  underKeyboardExtension: {
    position: 'absolute',
    bottom: -600,
    left: 0,
    right: 0,
    height: 600,
    backgroundColor: '#FFFFFF',
  },
});
