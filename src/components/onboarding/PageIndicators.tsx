/**
 * PageIndicators Component
 * Displays onboarding progress dots
 *
 * @format
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { hs, vs, ms } from '../../theme/scaling';

type PageIndicatorsProps = {
  /**
   * Total number of steps in the flow
   * @default 4
   */
  totalSteps?: number;
  /**
   * Zero-based index of the active step
   * @default 0
   */
  currentStep?: number;
};

/**
 * PageIndicators - renders a sequence of dots indicating progress
 */
const PageIndicators: React.FC<PageIndicatorsProps> = ({
  totalSteps = 4,
  currentStep = 0,
}) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: totalSteps }).map((_, index) => {
        const isActive = index === currentStep;
        return (
          <View
            key={`indicator-${index}`}
            style={[
              styles.indicator,
              isActive ? styles.activeIndicator : styles.inactiveIndicator,
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(6),
  },
  indicator: {
    height: vs(8),
    borderRadius: ms(999),
  },
  activeIndicator: {
    width: hs(20),
    backgroundColor: colors.button.primary,
  },
  inactiveIndicator: {
    width: hs(8),
    backgroundColor: 'transparent',
    borderWidth: ms(1.5),
    borderColor: colors.border.dark,
    opacity: 0.9,
  },
});

export default PageIndicators;


