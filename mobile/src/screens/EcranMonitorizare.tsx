import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  PermissionsAndroid,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNBluetoothClassic, { BluetoothDevice } from 'react-native-bluetooth-classic';
import { obtineIstoricMasuratori, trimiteMasuratoare } from '../api/masuratori';
import Card from '../components/Card';
import { ButonPrimar } from '../components/Buton';
import { culori } from '../styles/tema';

type Masuratoare = {
  idMasuratoare: number;
  tipParametru: string;
  valoare: number;
  unitateMasura: string;
  dataOra: string;
  stare: string;
};

export default function EcranMonitorizare({ navigation }: any) {
  const [conectat, setConectat] = useState(false);
  const [temperatura, setTemperatura] = useState<number | null>(null);
  const [ecg, setEcg] = useState<number | null>(null);
  const [puls, setPuls] = useState<number | null>(null);
  const [dispozitiv, setDispozitiv] = useState<BluetoothDevice | null>(null);
  const [seTrimite, setSeTrimite] = useState(false);
  const [idPacient, setIdPacient] = useState<number | null>(null);
  const [masuratori, setMasuratori] = useState<Masuratoare[]>([]);
  const [seIncarca, setSeIncarca] = useState(false);

  useEffect(() => {
    cerePermisiuni();
    incarcaDate();
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

  const incarcaDate = async () => {
    const idSalvat = await AsyncStorage.getItem('idPacient');

    if (idSalvat) {
      setIdPacient(Number(idSalvat));
    }

    await incarcaIstoric();
  };

  const incarcaIstoric = async () => {
    setSeIncarca(true);

    try {
      const raspuns = await obtineIstoricMasuratori(20);
      setMasuratori(raspuns.masuratori ?? raspuns.Masuratori ?? []);
    } catch {
      setMasuratori([]);
    } finally {
      setSeIncarca(false);
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

        if (date.temperatura !== undefined) {
          setTemperatura(date.temperatura);
        }

        if (date.electroziDesprinsi === true || date.semnalEcgValid === false) {
          setEcg(null);
          setPuls(null);
        } else {
          if (date.ecg !== undefined && date.ecg !== null) {
            setEcg(date.ecg);
          }

          if (date.puls !== undefined && date.puls !== null) {
            setPuls(date.puls);
          }
        }

        trimiteLaBackend(date);
      } catch {
        // Pachetele incomplete primite prin Bluetooth sunt ignorate.
      }
    });
  };

  const trimiteLaBackend = async (date: any) => {
    if (!idPacient || seTrimite) {
      return;
    }

    setSeTrimite(true);

    try {
      if (date.temperatura !== undefined && date.temperatura !== null) {
        await trimiteMasuratoare(
          idPacient,
          'temperatura',
          date.temperatura,
          '°C',
          'bluetooth',
        );
      }

      if (date.ecg !== undefined && date.ecg !== null) {
        await trimiteMasuratoare(
          idPacient,
          'ecg',
          date.ecg,
          'raw',
          'bluetooth',
        );
      }

      if (date.puls !== undefined && date.puls !== null) {
        await trimiteMasuratoare(
          idPacient,
          'puls',
          date.puls,
          'bpm',
          'bluetooth',
        );
      }
    } catch {
      // Nu afișăm alertă pentru fiecare pachet netrimis.
    } finally {
      setSeTrimite(false);
    }
  };

  const deconectareBluetooth = async () => {
    try {
      if (dispozitiv) {
        await dispozitiv.disconnect();
      }

      setConectat(false);
      setDispozitiv(null);
      setTemperatura(null);
      setEcg(null);
      setPuls(null);
    } catch {
      Alert.alert('Eroare', 'Nu s-a putut deconecta.');
    }
  };

  const ultimaTemperatura = masuratori.find(
    m => m.tipParametru.toLowerCase() === 'temperatura',
  );

  const ultimEcg = masuratori.find(
    m => m.tipParametru.toLowerCase() === 'ecg',
  );

  const ultimPuls = masuratori.find(
    m => m.tipParametru.toLowerCase() === 'puls',
  );

  return (
    <View style={stiluri.container}>
      <Antet navigation={navigation} titlu="Monitorizare" />

      <ScrollView contentContainerStyle={stiluri.continut}>
        <View
          style={[
            stiluri.stareConexiune,
            conectat ? stiluri.conectat : stiluri.deconectat,
          ]}
        >
          <Text style={stiluri.textStare}>
            {conectat ? 'Conectat la HC-05' : 'Deconectat'}
          </Text>
        </View>

        <CardMasurare
          titlu="Temperatură"
          valoare={
            temperatura !== null
              ? `${temperatura} °C`
              : ultimaTemperatura
                ? `${ultimaTemperatura.valoare} ${ultimaTemperatura.unitateMasura}`
                : '---'
          }
        />

        <CardMasurare
          titlu="ECG"
          valoare={
            ecg !== null
              ? `${ecg} raw`
              : ultimEcg
                ? `${ultimEcg.valoare} ${ultimEcg.unitateMasura}`
                : '---'
          }
        />

        <CardMasurare
          titlu="Puls"
          valoare={
            puls !== null
              ? `${puls} bpm`
              : ultimPuls
                ? `${ultimPuls.valoare} ${ultimPuls.unitateMasura}`
                : '---'
          }
        />

        <ButonPrimar
          text={conectat ? 'Deconectare Bluetooth' : 'Conectare Bluetooth'}
          onPress={conectat ? deconectareBluetooth : conectareBluetooth}
          style={conectat ? { backgroundColor: culori.eroare } : undefined}
        />

        <Card>
          <Text style={stiluri.sectiuneTitlu}>Istoric măsurători</Text>

          {seIncarca ? (
            <ActivityIndicator color={culori.primar} />
          ) : masuratori.length ? (
            masuratori.map(m => (
              <View key={m.idMasuratoare} style={stiluri.randLista}>
                <View style={stiluri.randText}>
                  <Text style={stiluri.randTitlu}>{m.tipParametru}</Text>
                  <Text style={stiluri.randSubtitlu}>
                    {formateazaData(m.dataOra)}
                  </Text>
                </View>

                <Text style={stiluri.randValoare}>
                  {m.valoare} {m.unitateMasura}
                </Text>
              </View>
            ))
          ) : (
            <Text style={stiluri.textGol}>
              Nu există măsurători înregistrate.
            </Text>
          )}
        </Card>
      </ScrollView>
    </View>
  );
}

function Antet({ navigation, titlu }: any) {
  return (
    <View style={stiluri.navbar}>
      <TouchableOpacity onPress={() => navigation.navigate('Acasa')}>
        <Text style={stiluri.inapoi}>Acasă</Text>
      </TouchableOpacity>

      <Text style={stiluri.logo}>{titlu}</Text>
    </View>
  );
}

function CardMasurare({ titlu, valoare }: { titlu: string; valoare: string }) {
  return (
    <Card>
      <Text style={stiluri.eticheta}>{titlu}</Text>
      <Text style={stiluri.valoare}>{valoare}</Text>
    </Card>
  );
}

function formateazaData(data?: string | null) {
  if (!data) {
    return '-';
  }

  const dataConvertita = new Date(data);

  if (Number.isNaN(dataConvertita.getTime())) {
    return '-';
  }

  return dataConvertita.toLocaleString('ro-RO');
}

const stiluri = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: culori.fundal,
  },
  navbar: {
    backgroundColor: culori.primar,
    paddingTop: 44,
    paddingHorizontal: 20,
    paddingBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  inapoi: {
    color: '#fff',
    fontWeight: 'bold',
  },
  continut: {
    padding: 20,
    paddingBottom: 40,
  },
  stareConexiune: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 18,
    alignItems: 'center',
  },
  conectat: {
    backgroundColor: culori.succesFundal,
  },
  deconectat: {
    backgroundColor: culori.eroareFundal,
  },
  textStare: {
    fontSize: 14,
    fontWeight: 'bold',
    color: culori.text,
  },
  eticheta: {
    fontSize: 14,
    color: culori.textSecundar,
    marginBottom: 8,
  },
  valoare: {
    fontSize: 30,
    fontWeight: 'bold',
    color: culori.primar,
  },
  sectiuneTitlu: {
    color: culori.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 14,
  },
  randLista: {
    borderBottomWidth: 1,
    borderBottomColor: culori.border,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  randText: {
    flex: 1,
    marginRight: 12,
  },
  randTitlu: {
    color: culori.text,
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 4,
  },
  randSubtitlu: {
    color: culori.textSecundar,
    fontSize: 13,
  },
  randValoare: {
    color: culori.primar,
    fontWeight: 'bold',
  },
  textGol: {
    color: culori.textSecundar,
  },
});