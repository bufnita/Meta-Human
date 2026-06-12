import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { formateazaDataOraRomania } from '../utils/dataOra';

type Masuratoare = {
  idMasuratoare: number;
  tipParametru: string;
  valoare: number;
  unitateMasura: string;
  dataOra: string;
  stare: string;
};

type TipMetrica = 'temperatura' | 'ecg' | 'puls';

type ValoriLive = Record<TipMetrica, number | null>;

type PachetBluetooth = {
  temperatura?: number | null;
  ecg?: number | null;
  puls?: number | null;
  electroziDesprinsi?: boolean;
  semnalEcgValid?: boolean;
};

type PoliticaMetrica = {
  staleAfterMs: number;
  sendIntervalMs: number;
  minChangeToSend: number;
  minElapsedForChangeMs: number;
  unitate: string;
};

const VALORI_LIVE_INITIALE: ValoriLive = {
  temperatura: null,
  ecg: null,
  puls: null,
};

const TIPURI_METRICE: TipMetrica[] = ['temperatura', 'ecg', 'puls'];

const POLITICI_METRICE: Record<TipMetrica, PoliticaMetrica> = {
  temperatura: {
    staleAfterMs: 45000,
    sendIntervalMs: 30000,
    minChangeToSend: 0.2,
    minElapsedForChangeMs: 10000,
    unitate: '°C',
  },
  ecg: {
    staleAfterMs: 6000,
    sendIntervalMs: 20000,
    minChangeToSend: 15,
    minElapsedForChangeMs: 10000,
    unitate: 'raw',
  },
  puls: {
    staleAfterMs: 10000,
    sendIntervalMs: 12000,
    minChangeToSend: 4,
    minElapsedForChangeMs: 8000,
    unitate: 'bpm',
  },
};

const NUMAR_MAXIM_MOSTRE_PULS = 5;
const NUMAR_MAXIM_MOSTRE_ECG = 8;
const INTERVAL_VERIFICARE_VALORI_MS = 1000;
const INTERVAL_TRIMITERE_BACKEND_MS = 5000;

export default function EcranMonitorizare({ navigation }: any) {
  const [conectat, setConectat] = useState(false);
  const [valoriLive, setValoriLive] = useState<ValoriLive>({
    ...VALORI_LIVE_INITIALE,
  });
  const [dispozitiv, setDispozitiv] = useState<BluetoothDevice | null>(null);
  const [idPacient, setIdPacient] = useState<number | null>(null);
  const [masuratori, setMasuratori] = useState<Masuratoare[]>([]);
  const [seIncarca, setSeIncarca] = useState(false);

  const bufferBluetoothRef = useRef('');
  const mostrePulsRef = useRef<number[]>([]);
  const mostreEcgRef = useRef<number[]>([]);
  const valoriLiveRef = useRef<ValoriLive>({ ...VALORI_LIVE_INITIALE });
  const trimitereInCursRef = useRef(false);
  const ascultatorDateRef = useRef<{ remove?: () => void } | null>(null);
  const ultimeleValoriValideRef = useRef<
    Record<TipMetrica, { valoare: number; timestamp: number } | null>
  >({
    temperatura: null,
    ecg: null,
    puls: null,
  });
  const ultimeleValoriTrimiseRef = useRef<
    Record<TipMetrica, { valoare: number | null; timestamp: number }>
  >({
    temperatura: { valoare: null, timestamp: 0 },
    ecg: { valoare: null, timestamp: 0 },
    puls: { valoare: null, timestamp: 0 },
  });
  const ultimeleActualizariAfisateRef = useRef<Record<TipMetrica, number>>({
    temperatura: 0,
    ecg: 0,
    puls: 0,
  });

  const cerePermisiuni = useCallback(async () => {
    if (Platform.OS === 'android') {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
    }
  }, []);

  const incarcaIstoric = useCallback(async () => {
    setSeIncarca(true);

    try {
      const raspuns = await obtineIstoricMasuratori(20);
      setMasuratori(extrageMasuratoriDinRaspuns(raspuns));
    } catch {
      setMasuratori([]);
    } finally {
      setSeIncarca(false);
    }
  }, []);

  const incarcaDate = useCallback(async () => {
    const idSalvat = await AsyncStorage.getItem('idPacient');

    if (idSalvat) {
      setIdPacient(Number(idSalvat));
    }

    await incarcaIstoric();
  }, [incarcaIstoric]);

  const reseteazaStareaLive = () => {
    bufferBluetoothRef.current = '';
    mostrePulsRef.current = [];
    mostreEcgRef.current = [];
    valoriLiveRef.current = { ...VALORI_LIVE_INITIALE };
    ultimeleValoriValideRef.current = {
      temperatura: null,
      ecg: null,
      puls: null,
    };
    ultimeleValoriTrimiseRef.current = {
      temperatura: { valoare: null, timestamp: 0 },
      ecg: { valoare: null, timestamp: 0 },
      puls: { valoare: null, timestamp: 0 },
    };
    ultimeleActualizariAfisateRef.current = {
      temperatura: 0,
      ecg: 0,
      puls: 0,
    };
    setValoriLive({ ...VALORI_LIVE_INITIALE });
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
        opresteAscultareaBluetooth();
        reseteazaStareaLive();
        setDispozitiv(hc05);
        setConectat(true);
        citesteDatele(hc05);
      }
    } catch {
      Alert.alert('Eroare', 'Nu s-a putut conecta la HC-05.');
    }
  };

  const opresteAscultareaBluetooth = useCallback(() => {
    ascultatorDateRef.current?.remove?.();
    ascultatorDateRef.current = null;
    bufferBluetoothRef.current = '';
  }, []);

  const citesteDatele = (dev: BluetoothDevice) => {
    const ascultator = dev.onDataReceived(eveniment => {
      proceseazaFragmentBluetooth(eveniment.data);
    });

    if (
      ascultator &&
      typeof (ascultator as { remove?: () => void }).remove === 'function'
    ) {
      ascultatorDateRef.current = ascultator as { remove?: () => void };
    }
  };

  const proceseazaFragmentBluetooth = (fragment: string) => {
    if (!fragment) {
      return;
    }

    const fragmentCuratat = fragment.trim();

    if (fragmentCuratat && incearcaProceseazaJson(fragmentCuratat)) {
      bufferBluetoothRef.current = '';
      return;
    }

    bufferBluetoothRef.current += fragment;

    const { mesaje, rest } = extrageMesajeJsonDinBuffer(
      bufferBluetoothRef.current,
    );

    bufferBluetoothRef.current = rest;

    mesaje.forEach(mesaj => {
      incearcaProceseazaJson(mesaj);
    });
  };

  const proceseazaLinieBluetooth = (linie: string) => {
    const linieCuratata = linie.trim();

    if (!linieCuratata || !linieCuratata.startsWith('{')) {
      return false;
    }

    try {
      const date: PachetBluetooth = JSON.parse(linieCuratata);
      proceseazaPachetBluetooth(date);
      return true;
    } catch {
      // Liniile incomplete sau nevalide sunt ignorate.
      return false;
    }
  };

  const incearcaProceseazaJson = (text: string) => {
    const textCuratat = text.trim();

    if (!textCuratat.startsWith('{') || !textCuratat.endsWith('}')) {
      return false;
    }

    return proceseazaLinieBluetooth(textCuratat);
  };

  const proceseazaPachetBluetooth = (date: PachetBluetooth) => {
    const timpCurent = Date.now();
    const actualizari: Partial<ValoriLive> = {};

    if (esteNumarValid(date.temperatura)) {
      const temperaturaStabilizata = rotunjeste(date.temperatura, 1);
      const temperaturaCurenta = valoriLiveRef.current.temperatura;

      ultimeleValoriValideRef.current.temperatura = {
        valoare: temperaturaStabilizata,
        timestamp: timpCurent,
      };

      if (
        temperaturaCurenta === null ||
        Math.abs(temperaturaStabilizata - temperaturaCurenta) >= 0.2 ||
        timpCurent - ultimeleActualizariAfisateRef.current.temperatura >= 5000
      ) {
        actualizari.temperatura = temperaturaStabilizata;
        ultimeleActualizariAfisateRef.current.temperatura = timpCurent;
      }
    }

    const semnalEcgDisponibil =
      date.electroziDesprinsi !== true && date.semnalEcgValid !== false;

    if (!semnalEcgDisponibil) {
      mostreEcgRef.current = [];
    }

    if (semnalEcgDisponibil && esteNumarValid(date.ecg)) {
      mostreEcgRef.current = adaugaMostraLimitata(
        mostreEcgRef.current,
        Math.round(date.ecg),
        NUMAR_MAXIM_MOSTRE_ECG,
      );

      const ecgStabilizat = Math.round(calculeazaMedie(mostreEcgRef.current));
      const ecgCurent = valoriLiveRef.current.ecg;

      ultimeleValoriValideRef.current.ecg = {
        valoare: ecgStabilizat,
        timestamp: timpCurent,
      };

      if (
        ecgCurent === null ||
        Math.abs(ecgStabilizat - ecgCurent) >= 10 ||
        timpCurent - ultimeleActualizariAfisateRef.current.ecg >= 800
      ) {
        actualizari.ecg = ecgStabilizat;
        ultimeleActualizariAfisateRef.current.ecg = timpCurent;
      }
    }

    if (esteNumarValid(date.puls) && date.puls >= 30 && date.puls <= 220) {
      mostrePulsRef.current = adaugaMostraLimitata(
        mostrePulsRef.current,
        Math.round(date.puls),
        NUMAR_MAXIM_MOSTRE_PULS,
      );

      const pulsStabilizat = Math.round(calculeazaMedie(mostrePulsRef.current));
      const pulsCurent = valoriLiveRef.current.puls;

      ultimeleValoriValideRef.current.puls = {
        valoare: pulsStabilizat,
        timestamp: timpCurent,
      };

      if (
        pulsCurent === null ||
        Math.abs(pulsStabilizat - pulsCurent) >= 2 ||
        timpCurent - ultimeleActualizariAfisateRef.current.puls >= 1200
      ) {
        actualizari.puls = pulsStabilizat;
        ultimeleActualizariAfisateRef.current.puls = timpCurent;
      }
    } else if (!semnalEcgDisponibil) {
      mostrePulsRef.current = [];
    }

    if (Object.keys(actualizari).length) {
      setValoriLive(curent => ({ ...curent, ...actualizari }));
    }
  };

  const curataValorileExpirate = useCallback(() => {
    const timpCurent = Date.now();
    const actualizari: Partial<ValoriLive> = {};

    TIPURI_METRICE.forEach(tip => {
      const ultimaValoareValida = ultimeleValoriValideRef.current[tip];

      if (
        (!ultimaValoareValida ||
          timpCurent - ultimaValoareValida.timestamp >
            POLITICI_METRICE[tip].staleAfterMs) &&
        valoriLiveRef.current[tip] !== null
      ) {
        actualizari[tip] = null;
      }
    });

    if (Object.keys(actualizari).length) {
      setValoriLive(curent => ({ ...curent, ...actualizari }));
    }
  }, []);

  const trebuieTrimisaMetrica = useCallback((tip: TipMetrica, timpCurent: number) => {
    const valoare = valoriLiveRef.current[tip];
    const politica = POLITICI_METRICE[tip];
    const ultimaValoareValida = ultimeleValoriValideRef.current[tip];
    const ultimaTrimitere = ultimeleValoriTrimiseRef.current[tip];

    if (valoare === null || !ultimaValoareValida) {
      return false;
    }

    if (timpCurent - ultimaValoareValida.timestamp > politica.staleAfterMs) {
      return false;
    }

    if (ultimaTrimitere.timestamp === 0 || ultimaTrimitere.valoare === null) {
      return true;
    }

    if (timpCurent - ultimaTrimitere.timestamp >= politica.sendIntervalMs) {
      return true;
    }

    return (
      Math.abs(valoare - ultimaTrimitere.valoare) >= politica.minChangeToSend &&
      timpCurent - ultimaTrimitere.timestamp >= politica.minElapsedForChangeMs
    );
  }, []);

  const trimiteValoriDisponibile = useCallback(async () => {
    if (!idPacient || !conectat || trimitereInCursRef.current) {
      return;
    }

    const timpCurent = Date.now();
    const metriciDeTrimis = TIPURI_METRICE.filter(tip =>
      trebuieTrimisaMetrica(tip, timpCurent),
    );

    if (!metriciDeTrimis.length) {
      return;
    }

    trimitereInCursRef.current = true;

    try {
      for (const tip of metriciDeTrimis) {
        const valoare = valoriLiveRef.current[tip];

        if (valoare === null) {
          continue;
        }

        const raspuns = await trimiteMasuratoare(
          idPacient,
          tip,
          valoare,
          POLITICI_METRICE[tip].unitate,
          'bluetooth',
        );

        ultimeleValoriTrimiseRef.current[tip] = {
          valoare,
          timestamp: Date.now(),
        };

        const masuratoareNoua = normalizeazaMasuratoare(raspuns);

        if (masuratoareNoua) {
          setMasuratori(curent =>
            [masuratoareNoua, ...curent]
              .filter(
                (item, index, lista) =>
                  lista.findIndex(
                    existent => existent.idMasuratoare === item.idMasuratoare,
                  ) === index,
              )
              .slice(0, 20),
          );
        }
      }
    } catch {
      // Erorile temporare de rețea sunt ignorate pentru a nu întrerupe monitorizarea.
    } finally {
      trimitereInCursRef.current = false;
    }
  }, [conectat, idPacient, trebuieTrimisaMetrica]);

  const deconectareBluetooth = async () => {
    try {
      opresteAscultareaBluetooth();

      if (dispozitiv) {
        await dispozitiv.disconnect();
      }

      setConectat(false);
      setDispozitiv(null);
      reseteazaStareaLive();
    } catch {
      Alert.alert('Eroare', 'Nu s-a putut deconecta.');
    }
  };

  useEffect(() => {
    valoriLiveRef.current = valoriLive;
  }, [valoriLive]);

  useEffect(() => {
    const initializare = async () => {
      await cerePermisiuni();
      await incarcaDate();
    };

    initializare().catch(() => {
      // Permisiunile sau istoricul pot eșua separat fără a bloca ecranul.
    });

    return () => {
      opresteAscultareaBluetooth();
    };
  }, [cerePermisiuni, incarcaDate, opresteAscultareaBluetooth]);

  useEffect(() => {
    if (!conectat) {
      return;
    }

    const interval = setInterval(() => {
      curataValorileExpirate();
    }, INTERVAL_VERIFICARE_VALORI_MS);

    return () => {
      clearInterval(interval);
    };
  }, [conectat, curataValorileExpirate]);

  useEffect(() => {
    if (!conectat || !idPacient) {
      return;
    }

    const interval = setInterval(() => {
      trimiteValoriDisponibile().catch(() => {
        // Trimiterile eșuate sunt ignorate; intervalul următor va reîncerca.
      });
    }, INTERVAL_TRIMITERE_BACKEND_MS);

    return () => {
      clearInterval(interval);
    };
  }, [conectat, idPacient, trimiteValoriDisponibile]);

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
          valoare={formateazaValoareLive('temperatura', valoriLive.temperatura)}
        />

        <CardMasurare
          titlu="ECG"
          valoare={formateazaValoareLive('ecg', valoriLive.ecg)}
        />

        <CardMasurare
          titlu="Puls"
          valoare={formateazaValoareLive('puls', valoriLive.puls)}
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
                <View style={stiluri.randListaAntet}>
                  <View style={stiluri.randText}>
                    <Text style={stiluri.randTitlu}>
                      {obtineEtichetaParametru(m.tipParametru)}
                    </Text>
                    <Text style={stiluri.randSubtitlu}>
                      {formateazaData(m.dataOra)}
                    </Text>
                  </View>

                  <Text style={stiluri.randValoare}>
                    {formateazaMasurare(m)}
                  </Text>
                </View>

                <Text style={stiluri.randMeta}>Stare: {m.stare || '-'}</Text>
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
  return formateazaDataOraRomania(data);
}

function formateazaValoareLive(tip: TipMetrica, valoare: number | null) {
  if (valoare === null) {
    return '---';
  }

  if (tip === 'temperatura') {
    return `${valoare.toFixed(1)} °C`;
  }

  if (tip === 'ecg') {
    return `${Math.round(valoare)} raw`;
  }

  return `${Math.round(valoare)} bpm`;
}

function formateazaMasurare(masuratoare: Masuratoare) {
  const unitate = (masuratoare.unitateMasura || '').trim();
  return unitate
    ? `${masuratoare.valoare} ${unitate}`
    : String(masuratoare.valoare);
}

function obtineEtichetaParametru(tipParametru?: string | null) {
  const cheie = (tipParametru || '').trim().toLowerCase();

  if (cheie === 'temperatura') {
    return 'Temperatură';
  }

  if (cheie === 'ecg') {
    return 'ECG';
  }

  if (cheie === 'puls') {
    return 'Puls';
  }

  return tipParametru || '-';
}

function normalizeazaMasuratoare(masuratoare: any): Masuratoare | null {
  const idMasuratoare = Number(
    masuratoare?.idMasuratoare ?? masuratoare?.IdMasuratoare,
  );
  const valoare = Number(masuratoare?.valoare ?? masuratoare?.Valoare);

  if (!Number.isFinite(idMasuratoare) || !Number.isFinite(valoare)) {
    return null;
  }

  return {
    idMasuratoare,
    tipParametru: String(
      masuratoare?.tipParametru ?? masuratoare?.TipParametru ?? '',
    ),
    valoare,
    unitateMasura: String(
      masuratoare?.unitateMasura ?? masuratoare?.UnitateMasura ?? '',
    ),
    dataOra: String(masuratoare?.dataOra ?? masuratoare?.DataOra ?? ''),
    stare: String(masuratoare?.stare ?? masuratoare?.Stare ?? ''),
  };
}

function extrageMasuratoriDinRaspuns(raspuns: any) {
  const lista =
    raspuns?.masuratori ??
    raspuns?.Masuratori ??
    raspuns?.data?.masuratori ??
    raspuns?.data?.Masuratori ??
    [];

  return Array.isArray(lista)
    ? lista
        .map(item => normalizeazaMasuratoare(item))
        .filter((item): item is Masuratoare => item !== null)
    : [];
}

function esteNumarValid(valoare: unknown): valoare is number {
  return typeof valoare === 'number' && Number.isFinite(valoare);
}

function rotunjeste(valoare: number, zecimale: number) {
  const factor = 10 ** zecimale;
  return Math.round(valoare * factor) / factor;
}

function calculeazaMedie(valori: number[]) {
  if (!valori.length) {
    return 0;
  }

  return valori.reduce((suma, valoare) => suma + valoare, 0) / valori.length;
}

function adaugaMostraLimitata(
  valori: number[],
  valoareNoua: number,
  limita: number,
) {
  return [...valori, valoareNoua].slice(-limita);
}

function extrageMesajeJsonDinBuffer(buffer: string) {
  const mesaje: string[] = [];
  let inSir = false;
  let caracterEscapat = false;
  let nivelAcolade = 0;
  let indexStart = -1;

  for (let index = 0; index < buffer.length; index += 1) {
    const caracter = buffer[index];

    if (caracterEscapat) {
      caracterEscapat = false;
      continue;
    }

    if (caracter === '\\') {
      caracterEscapat = true;
      continue;
    }

    if (caracter === '"') {
      inSir = !inSir;
      continue;
    }

    if (inSir) {
      continue;
    }

    if (caracter === '{') {
      if (nivelAcolade === 0) {
        indexStart = index;
      }

      nivelAcolade += 1;
      continue;
    }

    if (caracter === '}') {
      if (nivelAcolade === 0) {
        continue;
      }

      nivelAcolade -= 1;

      if (nivelAcolade === 0 && indexStart >= 0) {
        mesaje.push(buffer.slice(indexStart, index + 1));
        indexStart = -1;
      }
    }
  }

  const rest =
    nivelAcolade > 0 && indexStart >= 0 ? buffer.slice(indexStart) : '';

  return { mesaje, rest };
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
    gap: 6,
  },
  randListaAntet: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  randText: {
    flex: 1,
    minWidth: 0,
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
    fontSize: 16,
    textAlign: 'right',
    maxWidth: '45%',
  },
  randMeta: {
    color: culori.textSecundar,
    fontSize: 12,
  },
  textGol: {
    color: culori.textSecundar,
  },
});
