import { Platform } from 'react-native';

/**
 * Converts React Native shadow styles to work cross-platform
 * On web: uses boxShadow
 * On native: uses shadowColor, shadowOffset, etc.
 * 
 * @param {Object} style - Style object containing shadow properties
 * @returns {Object} - Platform-specific style object
 */
export const createShadow = ({
  shadowColor = '#000',
  shadowOffset = { width: 0, height: 2 },
  shadowOpacity = 0.2,
  shadowRadius = 2,
  elevation = 2,
}) => {
  if (Platform.OS === 'web') {
    // For web, create a CSS box-shadow
    const { width, height } = shadowOffset;
    return {
      boxShadow: `${width}px ${height}px ${shadowRadius}px rgba(0, 0, 0, ${shadowOpacity})`,
    };
  } else {
    // For native, use the React Native shadow properties
    return {
      shadowColor,
      shadowOffset,
      shadowOpacity,
      shadowRadius,
      elevation,
    };
  }
};

/**
 * Safely applies pointerEvents property in a cross-platform way
 * 
 * @param {string} value - The pointerEvents value ('none', 'auto', etc)
 * @returns {Object} - Platform-specific style object
 */
export const createPointerEvents = (value) => {
  return Platform.OS === 'web' 
    ? { style: { pointerEvents: value } } 
    : { pointerEvents: value };
}; 