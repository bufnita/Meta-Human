import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { culori } from '../styles/tema';

export default function ButonTab({
  titlu,
  activ,
  onPress,
}: {
  titlu: string;
  activ: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[stiluri.tab, activ ? stiluri.tabActiv : null]}
      onPress={onPress}
    >
      <Text style={[stiluri.textTab, activ ? stiluri.textTabActiv : null]}>
        {titlu}
      </Text>
    </TouchableOpacity>
  );
}

const stiluri = StyleSheet.create({
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 6,
  },
  tabActiv: {
    backgroundColor: '#fff',
  },
  textTab: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: 'bold',
    fontSize: 13,
  },
  textTabActiv: {
    color: culori.primar,
  },
});
