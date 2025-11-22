/**
 * PrimaryButton Component
 * Reusable primary button component with disabled state
 * 
 * @format
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, getColorWithOpacity } from '../../theme/colors';
import { typography } from '../../theme/fonts';
import { ms, vs, hs } from '../../theme/scaling';

interface PrimaryButtonProps {
  /**
   * Button label text
   */
  label: string;
  
  /**
   * Callback function when button is pressed
   */
  onPress: () => void;
  
  /**
   * Whether the button is disabled
   * @default false
   */
  disabled?: boolean;
  
  /**
   * Whether to show loading indicator
   * @default false
   */
  loading?: boolean;
  
  /**
   * Custom container style
   */
  containerStyle?: ViewStyle;
  
  /**
   * Custom text style
   */
  textStyle?: TextStyle;
  
  /**
   * Button height
   * @default 44
   */
  height?: number;
  
  /**
   * Full width button
   * @default true
   */
  fullWidth?: boolean;
}

/**
 * PrimaryButton - Primary action button component
 */
const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  label,
  onPress,
  disabled = false,
  loading = false,
  containerStyle,
  textStyle,
  height = vs(44),
  fullWidth = true,
}) => {
  const isDisabled = disabled || loading;
  
  const buttonBackgroundColor = isDisabled
    ? getColorWithOpacity(colors.button.primaryDisabled, 0.6)
    : colors.button.primary;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          height,
          backgroundColor: buttonBackgroundColor,
          width: fullWidth ? '100%' : undefined,
          opacity: isDisabled ? 0.6 : 1,
        },
        containerStyle,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={colors.text.white} size="small" />
      ) : (
        <Text
          style={[
            styles.buttonText,
            textStyle,
          ]}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: ms(12),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: hs(24),
    minHeight: vs(44),
  },
  buttonText: {
    ...typography.button,
    color: colors.text.white,
    textAlign: 'center',
  },
});

export default PrimaryButton;

