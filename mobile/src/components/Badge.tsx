import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { culori } from '../styles/tema';

export default function Badge({ text }: { text: string }) {
  return <Text style={stiluri.badge}>{text}</Text>;
}

const stiluri = StyleSheet.create({
  badge: {
    backgroundColor: culori.succesFundal,
    color: culori.primar,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
  },
});
