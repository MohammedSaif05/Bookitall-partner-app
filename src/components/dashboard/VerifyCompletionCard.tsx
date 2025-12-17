/**
 * VerifyCompletionCard
 * Dark call-to-action card used for onboarding / store completion steps
 *
 * @format
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, GestureResponderEvent, ViewStyle } from 'react-native';
import { SvgProps } from 'react-native-svg';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/fonts';
import { hs, vs, ms } from '../../theme/scaling';
import RightArrowIcon from '../../assets/svg/icons/rightarrow.svg';

interface VerifyCompletionCardProps {
  title: string;
  description: string;
  icon: React.FC<SvgProps>;
  onPress?: (event: GestureResponderEvent) => void;
  style?: ViewStyle;
  disabled?: boolean;
}

const VerifyCompletionCard: React.FC<VerifyCompletionCardProps> = ({
  title,
  description,
  icon: Icon,
  onPress,
  style,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={disabled ? 1 : 0.85}
      style={[styles.container, disabled && styles.containerDisabled, style]}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
    >
      <View style={[styles.iconCircle, disabled && styles.iconCircleDisabled]}>
        <Icon width={hs(20)} height={hs(20)} />
      </View>

      <View style={styles.textContainer}>
        <Text style={[styles.line, disabled && styles.textDisabled]}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}> - {description}</Text>
        </Text>
      </View>

      <RightArrowIcon width={hs(18)} height={hs(18)} opacity={disabled ? 0.5 : 1} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2F2F2F',
    borderRadius: ms(16),
    paddingHorizontal: hs(12),
    paddingVertical: vs(16),
  },
  iconCircle: {
    width: ms(40),
    height: ms(40),
    borderRadius: ms(20),
    backgroundColor: colors.background.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: hs(12),
  },
  textContainer: {
    flex: 1,
  },
  line: {
    ...typography.body,
    color: colors.text.white,
  },
  title: {
    fontFamily: typography.label.fontFamily,
    fontSize: typography.label.fontSize,
    fontWeight: '700',
  },
  description: {
    fontFamily: typography.body.fontFamily,
    fontSize: typography.body.fontSize,
  },
  containerDisabled: {
    backgroundColor: '#5E5E5E',
  },
  iconCircleDisabled: {
    opacity: 0.6,
  },
  textDisabled: {
    opacity: 0.7,
  },
});

export default VerifyCompletionCard;


