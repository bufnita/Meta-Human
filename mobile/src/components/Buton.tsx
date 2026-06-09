import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { culori } from '../styles/tema';

export function ButonPrimar({
  text,
  onPress,
  disabled,
  style,
}: {
  text: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}) {
  return (
    <TouchableOpacity
      style={[stiluri.primar, disabled ? stiluri.disabled : null, style]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={stiluri.textPrimar}>{text}</Text>
    </TouchableOpacity>
  );
}

export function ButonContur({
  text,
  onPress,
  disabled,
  danger,
}: {
  text: string;
  onPress: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[
        stiluri.contur,
        danger ? stiluri.conturDanger : null,
        disabled ? stiluri.disabled : null,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[stiluri.textContur, danger ? stiluri.textDanger : null]}>
        {text}
      </Text>
    </TouchableOpacity>
  );
}

const stiluri = StyleSheet.create({
  primar: {
    backgroundColor: culori.primar,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  textPrimar: {
    color: '#fff',
    fontWeight: 'bold',
  },
  contur: {
    borderWidth: 1,
    borderColor: culori.primar,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginRight: 8,
    marginTop: 8,
  },
  textContur: {
    color: culori.primar,
    fontWeight: 'bold',
    fontSize: 13,
  },
  conturDanger: {
    borderColor: culori.eroare,
  },
  textDanger: {
    color: culori.eroare,
  },
  disabled: {
    opacity: 0.6,
  },
});
