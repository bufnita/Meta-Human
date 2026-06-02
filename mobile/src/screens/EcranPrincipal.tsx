import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import RNBluetoothClassic, {
  BluetoothDevice,
} from 'react-native-bluetooth-classic';
import { trimiteMarsuratoare } from '../api/masuratori';

export default function EcranPrincipal() {
  const [conectat, setConectat] = useState(false);
  const [temperatura, setTemperatura] = useState<number | null>(null);
  const [ecg, setEcg] = useState<number | null>(null);
  const [dispozitiv, setDispozitiv] = useState<BluetoothDevice | null>(null);
  const [seTrimiite, setSeTrimiite] = useState(false);

  useEffect(() => {
    cerePermisiuni();
  }, []);

  const cerePermisiuni = async () => {
    if (Platform.OS === 'android') {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
    }
  };

  const conectareBluetooth = async () => {
    try {
      const dispozitivePereche = await RNBluetoothClassic.getBondedDevices();
      const hc05 = dispozitivePereche.find(
        d => d.name === 'HC-05' || d.name === 'HC05',
      );

      if (!hc05) {
        Alert.alert(
          'Eroare',
          'HC-05 nu a fost găsit. Asociați dispozitivul Bluetooth întâi.',
        );
        return;
      }

      const conexiune = await hc05.connect();
      if (conexiune) {
        setDispozitiv(hc05);
        setConectat(true);
        citesteDatele(hc05);
      }
    } catch {
      Alert.alert('Eroare', 'Nu s-a putut conecta la HC-05.');
    }
  };

  const citesteDatele = (dev: BluetoothDevice) => {
    dev.onDataReceived(eveniment => {
      try {
        const date = JSON.parse(eveniment.data);
        if (date.temperatura !== undefined) setTemperatura(date.temperatura);
        if (date.ecg !== undefined) setEcg(date.ecg);
        trimiteLaBackend(date);
      } catch {
        // date incomplete, ignoram
      }
    });
  };

  const trimiteLaBackend = async (date: any) => {
    if (seTrimiite) return;
    setSeTrimiite(true);
    try {
      if (date.temperatura !== undefined) {
        await trimiteMarsuratoare(
          1,
          'temperatura',
          date.temperatura,
          '°C',
          'bluetooth',
        );
      }
      if (date.ecg !== undefined) {
        await trimiteMarsuratoare(1, 'ecg', date.ecg, 'mV', 'bluetooth');
      }
    } catch {
      // eroare silentioasa la trimitere
    } finally {
      setSeTrimiite(false);
    }
  };

  const deconectare = async () => {
    try {
      if (dispozitiv) {
        await dispozitiv.disconnect();
      }
      setConectat(false);
      setDispozitiv(null);
      setTemperatura(null);
      setEcg(null);
    } catch {
      Alert.alert('Eroare', 'Nu s-a putut deconecta.');
    }
  };

  return (
    <View style={stiluri.container}>
      <Text style={stiluri.titlu}>MetaHuman</Text>

      <View
        style={[
          stiluri.stareConexiune,
          conectat ? stiluri.conectat : stiluri.deconectat,
        ]}
      >
        <Text style={stiluri.textStare}>
          {conectat ? '● Conectat la HC-05' : '○ Deconectat'}
        </Text>
      </View>

      <View style={stiluri.cardSenzori}>
        <Text style={stiluri.eticheta}>Temperatură</Text>
        <Text style={stiluri.valoare}>
          {temperatura !== null ? `${temperatura} °C` : '---'}
        </Text>
      </View>

      <View style={stiluri.cardSenzori}>
        <Text style={stiluri.eticheta}>ECG</Text>
        <Text style={stiluri.valoare}>{ecg !== null ? `${ecg}` : '---'}</Text>
      </View>

      <TouchableOpacity
        style={[
          stiluri.buton,
          conectat ? stiluri.butonDeconectat : stiluri.butonConectat,
        ]}
        onPress={conectat ? deconectare : conectareBluetooth}
      >
        <Text style={stiluri.textButon}>
          {conectat ? 'Deconectare Bluetooth' : 'Conectare Bluetooth'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const stiluri = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#f5f5f5',
  },
  titlu: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2d7a45',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 24,
  },
  stareConexiune: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    alignItems: 'center',
  },
  conectat: {
    backgroundColor: '#d4edda',
  },
  deconectat: {
    backgroundColor: '#f8d7da',
  },
  textStare: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  cardSenzori: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  eticheta: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  valoare: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  buton: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  butonConectat: {
    backgroundColor: '#2d7a45',
  },
  butonDeconectat: {
    backgroundColor: '#c0392b',
  },
  textButon: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
