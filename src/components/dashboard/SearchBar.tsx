/**
 * SearchBar Component
 * Reusable search input component
 *
 * @format
 */

import React from 'react';
import { View, TextInput, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/fonts';
import { hs, vs, ms } from '../../theme/scaling';
import SearchIcon from '../../assets/svg/icons/search.svg';

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  style?: ViewStyle;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search...',
  value,
  onChangeText,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={colors.text.secondary}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <SearchIcon width={hs(20)} height={vs(20)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: ms(12),
    paddingHorizontal: hs(16),
    paddingVertical: vs(12),
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  input: {
    flex: 1,
    ...typography.body,
    fontSize: 16,
    color: colors.text.primary,
    padding: 0,
    marginRight: hs(8),
  },
});

export default SearchBar;

