/**
 * DashboardHome Screen
 * Main dashboard overview for partners
 *
 * @format
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/fonts';
import { hs, vs } from '../../theme/scaling';

const DashboardHome: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.subtitle}>
        This is your main overview. You can plug in metrics, charts, and quick actions here.
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

export default DashboardHome;


