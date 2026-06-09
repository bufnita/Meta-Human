import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { culori, spatii } from '../styles/tema';

export default function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return <View style={[stiluri.card, style]}>{children}</View>;
}

const stiluri = StyleSheet.create({
  card: {
    backgroundColor: culori.card,
    borderRadius: spatii.raza,
    padding: spatii.card,
    borderTopWidth: 4,
    borderTopColor: culori.primar,
    marginBottom: 16,
  },
});
