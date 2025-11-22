/**
 * DotIndicator Component
 * Displays pagination dots for carousel/swiper components
 * 
 * @format
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { ms } from '../../theme/scaling';

interface DotIndicatorProps {
  /**
   * Total number of dots
   */
  totalDots: number;
  
  /**
   * Currently active dot index (0-based)
   */
  activeIndex: number;
  
  /**
   * Size of each dot
   * @default 10
   */
  dotSize?: number;
  
  /**
   * Spacing between dots
   * @default 8
   */
  spacing?: number;
  
  /**
   * Active dot color
   * @default colors.text.primary
   */
  activeColor?: string;
  
  /**
   * Inactive dot color
   * @default colors.background.white
   */
  inactiveColor?: string;
}

/**
 * DotIndicator - Pagination indicator component
 */
const DotIndicator: React.FC<DotIndicatorProps> = ({
  totalDots,
  activeIndex,
  dotSize = ms(10),
  spacing = ms(8),
  activeColor = colors.text.primary,
  inactiveColor = colors.background.white,
}) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: totalDots }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            {
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              backgroundColor: index === activeIndex ? activeColor : inactiveColor,
              marginRight: index < totalDots - 1 ? spacing : 0,
              borderWidth: index === activeIndex ? 0 : 1,
              borderColor: inactiveColor === colors.background.white 
                ? colors.border.light 
                : inactiveColor,
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    // Dynamic styles applied inline
  },
});

export default DotIndicator;

