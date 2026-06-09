import React from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardTypeOptions } from 'react-native';
import { culori } from '../styles/tema';

export default function CampText({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
}) {
  return (
    <View style={stiluri.camp}>
      <Text style={stiluri.label}>{label}</Text>
      <TextInput
        style={[stiluri.input, multiline ? stiluri.multiline : null]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        multiline={multiline}
      />
    </View>
  );
}

const stiluri = StyleSheet.create({
  camp: {
    marginBottom: 12,
  },
  label: {
    color: culori.text,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: culori.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
    color: culori.text,
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
});
