import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

/**
 * SafeView komponent, ktorý zaisťuje, že všetky textové uzly sú obalené v Text komponente
 * Rieši problém "Unexpected text node" chyby pri zobrazení na webe
 */
const SafeView = ({ children, style, ...props }) => {
  // Na natívnych platformách nepotrebujeme špeciálne spracovanie
  if (Platform.OS !== 'web') {
    return <View style={style} {...props}>{children}</View>;
  }

  // Funkcia, ktorá rekurzívne kontroluje a obaľuje textové uzly
  const processChildren = (childNodes) => {
    if (!childNodes) return null;

    return React.Children.map(childNodes, child => {
      // Ak je to null alebo undefined, vrátime null
      if (child == null) return null;
      
      // Ak je to string alebo číslo, obal ho do Text komponentu
      if (typeof child === 'string' || typeof child === 'number') {
        return <Text>{child}</Text>;
      }
      
      // Ak je to React element s deťmi, spracuj jeho deti rekurzívne
      if (React.isValidElement(child) && child.props.children) {
        const newChildren = processChildren(child.props.children);
        return React.cloneElement(child, { ...child.props, children: newChildren });
      }
      
      // Inak vráť pôvodný element
      return child;
    });
  };

  return (
    <View style={style} {...props}>
      {processChildren(children)}
    </View>
  );
};

export default SafeView; 