/**
 * ProfileScreen
 * Partner profile and account settings
 *
 * @format
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/fonts';
import { hs, vs } from '../../theme/scaling';

const ProfileScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>
        Show partner details, account settings, and preferences here.
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

export default ProfileScreen;


