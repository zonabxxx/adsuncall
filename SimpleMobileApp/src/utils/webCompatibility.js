import { Platform } from 'react-native';

/**
 * Konvertuje štýly tieňov na cross-platform kompatibilné štýly
 * Na webe: používa boxShadow
 * Na natívnych platformách: používa shadowColor, shadowOffset, atď.
 */
export const createShadow = ({
  shadowColor = '#000',
  shadowOffset = { width: 0, height: 2 },
  shadowOpacity = 0.2,
  shadowRadius = 2,
  elevation = 2,
}) => {
  if (Platform.OS === 'web') {
    const { width, height } = shadowOffset;
    return {
      boxShadow: `${width}px ${height}px ${shadowRadius}px rgba(0, 0, 0, ${shadowOpacity})`,
    };
  } else {
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
 * Bezpečne aplikuje vlastnosť pointerEvents cross-platform spôsobom
 */
export const applyPointerEvents = (value) => {
  return Platform.OS === 'web' 
    ? { style: { pointerEvents: value } } 
    : { pointerEvents: value };
};

/**
 * Určuje, či používať natívne animácie v závislosti od platformy
 */
export const shouldUseNativeDriver = () => Platform.OS !== 'web'; 