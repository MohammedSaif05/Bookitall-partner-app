/**
 * ManageScreen
 * Manage services, inventory, or configuration
 *
 * @format
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/fonts';
import { hs, vs } from '../../theme/scaling';

const ManageScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage</Text>
      <Text style={styles.subtitle}>
        Use this screen to manage services, pricing, inventory, or other configurations.
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

export default ManageScreen;


