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
   * Inactive dot border/stroke color
   * @default colors.text.primary
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
  inactiveColor = colors.text.primary,
}) => {
  const isActive = (index: number) => index === activeIndex;

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
              // Active dot: filled with activeColor
              // Inactive dot: transparent background with border
              backgroundColor: isActive(index) ? activeColor : 'transparent',
              borderWidth: isActive(index) ? 0 : 1,
              borderColor: inactiveColor,
              marginRight: index < totalDots - 1 ? spacing : 0,
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

