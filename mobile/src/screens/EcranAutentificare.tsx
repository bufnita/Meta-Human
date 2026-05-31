import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { autentificare } from '../api/autentificare';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function EcranAutentificare({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [parola, setParola] = useState('');
  const [seIncarca, setSeIncarca] = useState(false);

  const handleAutentificare = async () => {
    if (!email || !parola) {
      Alert.alert('Eroare', 'Completați email-ul și parola.');
      return;
    }
    setSeIncarca(true);
    try {
      const date = await autentificare(email, parola);
      await AsyncStorage.setItem('token', date.token);
      navigation.replace('Panou');
    } catch {
      Alert.alert('Eroare', 'Email sau parolă incorectă.');
    } finally {
      setSeIncarca(false);
    }
  };

  return (
    <View style={stiluri.container}>
      <Text style={stiluri.titlu}>MetaHuman</Text>
      <Text style={stiluri.subtitlu}>Autentificare</Text>

      <TextInput
        style={stiluri.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={stiluri.input}
        placeholder="Parolă"
        value={parola}
        onChangeText={setParola}
        secureTextEntry
      />

      <TouchableOpacity
        style={stiluri.buton}
        onPress={handleAutentificare}
        disabled={seIncarca}
      >
        {seIncarca ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={stiluri.textButon}>Intră în cont</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const stiluri = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f5f5f5',
  },
  titlu: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2d7a45',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitlu: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buton: {
    backgroundColor: '#2d7a45',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  textButon: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
