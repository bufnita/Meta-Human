import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { autentificare } from '../api/autentificare';
import { culori } from '../styles/tema';

export default function EcranAutentificare({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [parola, setParola] = useState('');
  const [seIncarca, setSeIncarca] = useState(false);
  const [afiseazaSplash, setAfiseazaSplash] = useState(true);

  const scalaRipple = useRef(new Animated.Value(1)).current;
  const opacitateRipple = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    const animatie = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scalaRipple, {
            toValue: 1.7,
            duration: 1400,
            useNativeDriver: true,
          }),
          Animated.timing(scalaRipple, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(opacitateRipple, {
            toValue: 0,
            duration: 1400,
            useNativeDriver: true,
          }),
          Animated.timing(opacitateRipple, {
            toValue: 0.7,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ]),
    );

    animatie.start();

    const timer = setTimeout(() => {
      setAfiseazaSplash(false);
      animatie.stop();
    }, 1500);

    return () => {
      clearTimeout(timer);
      animatie.stop();
    };
  }, [opacitateRipple, scalaRipple]);

  const handleAutentificare = async () => {
    if (!email || !parola) {
      Alert.alert('Eroare', 'Completați email-ul și parola.');
      return;
    }

    setSeIncarca(true);

    try {
      const date = await autentificare(email, parola);

      const token = date.token ?? date.Token;
      const idPacient = date.idPacient ?? date.IdPacient ?? null;

      if (!token) {
        Alert.alert('Eroare', 'Răspunsul de autentificare nu conține token.');
        return;
      }

      await AsyncStorage.setItem('token', token);

      if (idPacient) {
        await AsyncStorage.setItem('idPacient', String(idPacient));
      }

      await AsyncStorage.setItem(
        'utilizator',
        JSON.stringify({
          email: date.email ?? date.Email,
          rol: date.rol ?? date.Rol,
          nume: date.nume ?? date.Nume,
          prenume: date.prenume ?? date.Prenume,
          idPacient,
        }),
      );

      navigation.replace('Acasa');
    } catch {
      Alert.alert(
        'Eroare',
        'Autentificarea nu a reușit. Verificați WireGuard, URL-ul backend-ului și datele contului.',
      );
    } finally {
      setSeIncarca(false);
    }
  };

  if (afiseazaSplash) {
    return (
      <View style={stiluri.splash}>
        <View style={stiluri.splashBrand}>
          <View style={stiluri.splashLogoContainer}>
            <Animated.View
              style={[
                stiluri.ripple,
                {
                  opacity: opacitateRipple,
                  transform: [{ scale: scalaRipple }],
                },
              ]}
            />

            <View style={stiluri.splashLogo}>
              <Text style={stiluri.splashLogoText}>M</Text>
            </View>
          </View>

          <Text style={stiluri.splashText}>MetaHuman</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={stiluri.container}>
      <View style={stiluri.logoContainer}>
        <View style={stiluri.logo}>
          <Text style={stiluri.logoText}>M</Text>
        </View>

        <Text style={stiluri.titlu}>MetaHuman</Text>
      </View>

      <View style={stiluri.card}>
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
          style={[stiluri.input, stiluri.inputParola]}
          placeholder="Parolă"
          value={parola}
          onChangeText={setParola}
          secureTextEntry={true}
          autoCapitalize="none"
          autoCorrect={false}
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
    </View>
  );
}

const stiluri = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: culori.primar,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashBrand: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  splashLogoContainer: {
    width: 110,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  ripple: {
    position: 'absolute',
    width: 86,
    height: 86,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.45)',
  },
  splashLogo: {
    width: 76,
    height: 76,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashLogoText: {
    color: culori.primar,
    fontSize: 34,
    fontWeight: 'bold',
  },
  splashText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: culori.fundal,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: culori.primar,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoText: {
    color: '#fff',
    fontSize: 34,
    fontWeight: 'bold',
  },
  titlu: {
    fontSize: 32,
    fontWeight: 'bold',
    color: culori.primar,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    borderTopWidth: 4,
    borderTopColor: culori.primar,
  },
  subtitlu: {
    fontSize: 18,
    color: culori.text,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
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
  inputParola: {
    color: '#000',
  },
  buton: {
    backgroundColor: culori.primar,
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
