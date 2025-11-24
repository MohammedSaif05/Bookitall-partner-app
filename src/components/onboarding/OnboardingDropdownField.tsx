/**
 * OnboardingDropdownField Component
 * Pressable row that opens dropdown selections
 *
 * @format
 */

import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import DropdownIcon from '../../assets/svg/icons/dropdown.svg';
import InfoIcon from '../../assets/svg/icons/info.svg';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/fonts';
import { vs, ms } from '../../theme/scaling';

type OnboardingDropdownFieldProps = {
  label: string;
  placeholder: string;
  value?: string;
  required?: boolean;
  showInfoIcon?: boolean;
  onPress?: () => void;
  errorText?: string;
};

/**
 * OnboardingDropdownField - displays label, value and dropdown affordance
 */
const OnboardingDropdownField: React.FC<OnboardingDropdownFieldProps> = ({
  label,
  placeholder,
  value,
  required = false,
  showInfoIcon = false,
  onPress,
  errorText,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.container}
      onPress={onPress}
    >
      <View style={styles.labelRow}>
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.asterisk}> *</Text>}
        </Text>
        {showInfoIcon && (
          <InfoIcon width={ms(18)} height={ms(18)} stroke={colors.text.primary} />
        )}
      </View>

      <View style={styles.inputRow}>
        <Text style={[styles.valueText, !value && styles.placeholder]}>
          {value || placeholder}
        </Text>
        <DropdownIcon
          width={ms(16)}
          height={ms(16)}
          stroke={colors.text.primary}
          opacity={0.8}
        />
      </View>
      {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: vs(12),
    marginBottom: vs(20),
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: vs(6),
  },
  label: {
    ...typography.label,
    color: colors.text.primary,
  },
  asterisk: {
    color: colors.text.primary,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: vs(2),
  },
  valueText: {
    ...typography.body,
    color: colors.text.primary,
  },
  placeholder: {
    color: colors.text.secondary,
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.status.error,
    marginTop: vs(6),
  },
});

export default OnboardingDropdownField;



