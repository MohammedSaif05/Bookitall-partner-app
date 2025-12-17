/**
 * BookingsScreen
 * List and manage bookings
 *
 * @format
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/fonts';
import { hs, vs } from '../../theme/scaling';

const BookingsScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bookings</Text>
      <Text style={styles.subtitle}>
        Here you can show upcoming, ongoing, and past bookings with filters and details.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    paddingHorizontal: hs(24),
    paddingTop: vs(24),
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: vs(8),
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
  },
});

export default BookingsScreen;


