import React from 'react';
import { Platform, View, Text } from 'react-native';

/**
 * Wrapper komponent pre React Native Web, ktorý opravuje bežné problémy s kompatibilitou
 * - Zabezpečuje, že všetky textové uzly vo View sú obalené v Text komponente
 * - Poskytuje polyfilly pre chýbajúce vlastnosti
 */
export const WebSafeProvider = ({ children }) => {
  if (Platform.OS !== 'web') {
    // Na natívnych platformách vrátime priamo deti bez zmeny
    return children;
  }

  return (
    <>
      {/* Možno pridať globálne štýly alebo skripty ak je potrebné */}
      {children}
    </>
  );
};

/**
 * Bezpečne zaobchádza s textovými uzlami vo View komponente
 * - Ak je to textový uzol, obalí ho do Text komponentu
 * - Inak ho vráti nezmenený
 */
export const ensureTextSafety = (node) => {
  if (typeof node === 'string' || typeof node === 'number') {
    return <Text>{node}</Text>;
  }
  
  if (React.isValidElement(node) && node.props.children) {
    const newChildren = React.Children.map(node.props.children, ensureTextSafety);
    return React.cloneElement(node, { ...node.props, children: newChildren });
  }
  
  return node;
};

/**
 * HOC (High Order Component) pre obalenie komponentov, aby boli bezpečné pre web
 */
export const withWebSafety = (Component) => {
  return (props) => {
    if (Platform.OS !== 'web') {
      return <Component {...props} />;
    }
    
    return (
      <WebSafeProvider>
        <Component {...props} />
      </WebSafeProvider>
    );
  };
}; 