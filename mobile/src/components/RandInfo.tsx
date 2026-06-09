import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { culori } from '../styles/tema';

export default function RandInfo({
  eticheta,
  valoare,
}: {
  eticheta: string;
  valoare?: string | number | null;
}) {
  return (
    <View style={stiluri.rand}>
      <Text style={stiluri.eticheta}>{eticheta}</Text>
      <Text style={stiluri.valoare}>{valoare === null || valoare === undefined || valoare === '' ? '-' : String(valoare)}</Text>
    </View>
  );
}

const stiluri = StyleSheet.create({
  rand: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: culori.borderDeschis,
    paddingVertical: 8,
  },
  eticheta: {
    color: culori.textSecundar,
    flex: 1,
  },
  valoare: {
    color: culori.primar,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'right',
  },
});
