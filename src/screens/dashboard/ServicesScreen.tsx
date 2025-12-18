/**
 * ServicesScreen
 * Screen for managing services
 *
 * @format
 */

import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TouchableWithoutFeedback, Keyboard, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/fonts';
import { hs, vs, ms } from '../../theme/scaling';
import BackIcon from '../../assets/svg/icons/back.svg';
import { useFocusEffect } from '@react-navigation/native';

// Illustration image (reuse existing)
const ILLUSTRATION = require('../../assets/webp/illustration_2.webp');

import type { RootStackScreenProps } from '../../navigation/types';

type ServicesScreenProps = RootStackScreenProps<'Services'>;

const ServicesScreen: React.FC<ServicesScreenProps> = ({ navigation }) => {
  // Handle Android hardware back button to navigate to DashboardHome
  useFocusEffect(
    useCallback(() => {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        navigation.navigate('Main', {
          screen: 'Dashboard',
          params: {
            screen: 'DashboardHome',
          },
        });
        return true; // Prevent default back behavior
      });

      return () => backHandler.remove();
    }, [navigation])
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('Main', {
                  screen: 'Dashboard',
                  params: {
                    screen: 'DashboardHome',
                  },
                });
              }}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <BackIcon width={hs(24)} height={vs(24)} />
            </TouchableOpacity>
            <Text style={styles.title}>Services</Text>
          </View>

          {/* Empty State Content */}
          <View style={styles.emptyStateContainer}>
            {/* Illustration */}
            <View style={styles.illustrationContainer}>
              <Image
                source={ILLUSTRATION}
                style={styles.illustration}
                resizeMode="contain"
              />
            </View>

            {/* Empty State Text */}
            <Text style={styles.emptyTitle}>No services added yet</Text>
            <Text style={styles.emptyDescription}>
              Create services so customers can start booking.
            </Text>
          </View>

          {/* Add Service Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.addButton}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('AddService')}
            >
              <Text style={styles.addButtonText}>Add Service   +</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    paddingHorizontal: hs(16),
    paddingTop: vs(16),
    paddingBottom: vs(12),
  },
  backButton: {
    marginBottom: vs(12),
    alignSelf: 'flex-start',
    padding: vs(4),
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
    fontSize: 28,
    fontWeight: '700',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: hs(24),
  },
  illustrationContainer: {
    marginBottom: vs(24),
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  illustration: {
    width: ms(200),
    height: ms(240),
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.text.primary,
    fontWeight: '700',
    marginBottom: vs(8),
    textAlign: 'center',
  },
  emptyDescription: {
    ...typography.body,
    color: colors.text.primary,
    textAlign: 'center',
    paddingHorizontal: hs(32),
    lineHeight: 22,
  },
  buttonContainer: {
    paddingHorizontal: hs(16),
    paddingBottom: vs(24),
    paddingTop: vs(12),
  },
  addButton: {
    backgroundColor: '#1F1F1F',
    borderRadius: ms(12),
    paddingVertical: vs(12),
    alignItems: 'center',
    justifyContent: 'center',
    // Shadow for elevation effect
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  addButtonText: {
    ...typography.button,
    color: colors.text.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ServicesScreen;


