/**
 * StoreCompletionProgress
 * Shows a "Your store is X% complete" label with a slim progress bar
 *
 * @format
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/fonts';
import { vs } from '../../theme/scaling';

interface StoreCompletionProgressProps {
  /**
   * Progress value between 0 and 1 (e.g. 0.25 for 25%)
   */
  progress: number;
  /**
   * Optional container style overrides
   */
  style?: ViewStyle;
}

const StoreCompletionProgress: React.FC<StoreCompletionProgressProps> = ({
  progress,
  style,
}) => {
  const clampedProgress = Math.max(0, Math.min(progress, 1));
  const percentageLabel = `${Math.round(clampedProgress * 100)}%`;

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>Your store is {percentageLabel} complete</Text>
      <View style={styles.track}>
        <View style={[styles.fill, { flex: clampedProgress }]} />
        {/* Remaining space keeps the pill outline even */}
        <View style={{ flex: 1 - clampedProgress }} />
      </View>
    </View>
  );
};

const BAR_HEIGHT = vs(10);

const styles = StyleSheet.create({
  container: {
    marginBottom: vs(12),
  },
  label: {
    ...typography.body,
    fontSize: 15,
    color: colors.text.primary,
    marginBottom: vs(4),
  },
  track: {
    flexDirection: 'row',
    alignItems: 'center',
    height: BAR_HEIGHT,
    borderRadius: BAR_HEIGHT / 2,
    borderWidth: 1,
    borderColor: colors.border.dark,
    overflow: 'hidden',
    backgroundColor: colors.background.primary,
  },
  fill: {
    height: '100%',
    backgroundColor: colors.text.primary,
  },
});

export default StoreCompletionProgress;


