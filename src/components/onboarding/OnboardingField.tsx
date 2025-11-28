/**
 * OnboardingField Component
 * Static form-like row used in onboarding preview states
 *
 * @format
 */

import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import type { SvgProps } from 'react-native-svg';
import InfoIcon from '../../assets/svg/icons/info.svg';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/fonts';
import { vs, ms } from '../../theme/scaling';

type OnboardingFieldProps = {
  label: string;
  placeholder: string;
  required?: boolean;
  showInfoIcon?: boolean;
  RightIcon?: React.FC<SvgProps>;
  value?: string;
  onChangeText?: (text: string) => void;
  onInfoPress?: () => void;
  tooltipText?: string;
  showTooltip?: boolean;
  errorText?: string;
  keyboardType?: 'default' | 'number-pad' | 'decimal-pad' | 'numeric' | 'email-address' | 'phone-pad';
  maxLength?: number;
  marginBottom?: number;
};

/**
 * OnboardingField - displays label, helper icon and placeholder text
 */
const OnboardingField: React.FC<OnboardingFieldProps> = ({
  label,
  placeholder,
  required = false,
  showInfoIcon = false,
  RightIcon,
  value,
  onChangeText,
  onInfoPress,
  tooltipText,
  showTooltip = false,
  errorText,
  keyboardType = 'default',
  maxLength,
  marginBottom,
}) => {
  const isEditable = typeof onChangeText === 'function';

  return (
    <View style={[styles.container, marginBottom !== undefined && { marginBottom }]}>
      <View style={styles.labelRowContainer}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>
            {label}
            {required && <Text style={styles.asterisk}> *</Text>}
          </Text>
          {showInfoIcon && (
            <TouchableOpacity
              onPress={onInfoPress}
              activeOpacity={0.8}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <InfoIcon width={ms(18)} height={ms(18)} stroke={colors.text.primary} />
            </TouchableOpacity>
          )}
        </View>
        {showTooltip && tooltipText ? (
          <View style={styles.tooltipWrapper}>
            <View style={styles.tooltipBubble}>
              <Text style={styles.tooltipText}>{tooltipText}</Text>
            </View>
            <View style={styles.tooltipArrow} />
          </View>
        ) : null}
      </View>

      {isEditable ? (
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.text.secondary}
          keyboardType={keyboardType}
          maxLength={maxLength}
        />
      ) : (
        <View style={styles.inputRow}>
          <Text style={styles.placeholder}>{placeholder}</Text>
          {RightIcon && (
            <RightIcon
              width={ms(18)}
              height={ms(18)}
              stroke={colors.text.primary}
              opacity={0.6}
            />
          )}
        </View>
      )}
      {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: vs(12),
    marginBottom: vs(20),
  },
  labelRowContainer: {
    position: 'relative',
    marginBottom: vs(6),
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
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
  input: {
    ...typography.body,
    color: colors.text.primary,
    paddingTop: 0,
    paddingBottom: 0,
  },
  tooltipWrapper: {
    position: 'absolute',
    top: vs(28),
    right: 0,
    alignItems: 'flex-end',
    zIndex: 1000,
    elevation: 10,
  },
  tooltipBubble: {
    paddingVertical: vs(8),
    paddingHorizontal: ms(12),
    backgroundColor: colors.button.primary,
    borderRadius: ms(12),
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  tooltipArrow: {
    position: 'absolute',
    top: -ms(6),
    right: ms(10),
    width: ms(12),
    height: ms(12),
    backgroundColor: colors.button.primary,
    transform: [{ rotate: '45deg' }],
    borderRadius: ms(2),
  },
  tooltipText: {
    ...typography.bodySmall,
    color: colors.text.white,
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.status.error,
    marginTop: vs(6),
  },
  placeholder: {
    ...typography.body,
    color: colors.text.secondary,
  },
});

export default OnboardingField;


