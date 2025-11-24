/**
 * OnboardingCTAButton Component
 * Primary onboarding action button with arrow icon
 *
 * @format
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  TouchableOpacityProps,
} from 'react-native';
import RightArrowIcon from '../../assets/svg/icons/rightarrow.svg';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/fonts';
import { hs, vs, ms } from '../../theme/scaling';

type OnboardingCTAButtonProps = {
  label: string;
  loading?: boolean;
} & TouchableOpacityProps;

/**
 * OnboardingCTAButton - CTA button for onboarding flow
 */
const OnboardingCTAButton: React.FC<OnboardingCTAButtonProps> = ({
  label,
  disabled,
  loading = false,
  style,
  ...touchableProps
}) => {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[
        styles.button,
        isDisabled && styles.buttonDisabled,
        style,
      ]}
      disabled={isDisabled}
      {...touchableProps}
    >
      <Text style={styles.label}>{label}</Text>
      <RightArrowIcon
        width={ms(18)}
        height={ms(18)}
        stroke={colors.text.white}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: hs(8),
    backgroundColor: colors.button.primary,
    borderRadius: ms(12),
    paddingHorizontal: hs(24),
    minHeight: vs(44),
    width: '100%',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  label: {
    ...typography.button,
    color: colors.text.white,
  },
});

export default OnboardingCTAButton;



