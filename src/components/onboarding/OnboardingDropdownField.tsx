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
  onInfoPress?: () => void;
  tooltipText?: string;
  showTooltip?: boolean;
  onPress?: () => void;
  errorText?: string;
  marginBottom?: number;
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
  onInfoPress,
  tooltipText,
  showTooltip = false,
  onPress,
  errorText,
  marginBottom,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[styles.container, marginBottom !== undefined && { marginBottom }]}
      onPress={onPress}
    >
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



