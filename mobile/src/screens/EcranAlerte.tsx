import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { ButonContur } from '../components/Buton';
import { obtineAlertelePacientului, obtineToateAlertele, rezolvaAlerta, ignoraAlerta } from '../api/alerte';
import { culori } from '../styles/tema';

type Alerta = {
  idAlerta: number;
  pacientNume?: string;
  pacientPrenume?: string;
  tipAlerta: string;
  parametruAsociat: string;
  valoareConstatata: number;
  dataOra: string;
  mesaj: string;
  stare: string;
};

export default function EcranAlerte({ navigation }: any) {
  const [rol, setRol] = useState('Pacient');
  const [alerte, setAlerte] = useState<Alerta[]>([]);
  const [seIncarca, setSeIncarca] = useState(false);

  useEffect(() => {
    incarcaDate();
  }, []);

  const incarcaDate = async () => {
    const utilizatorSalvat = await AsyncStorage.getItem('utilizator');
    const utilizator = utilizatorSalvat ? JSON.parse(utilizatorSalvat) : null;
    const rolCurent = utilizator?.rol ?? utilizator?.Rol ?? 'Pacient';

    setRol(rolCurent);
    setSeIncarca(true);

    try {
      const raspuns = rolCurent === 'Pacient'
        ? await obtineAlertelePacientului()
        : await obtineToateAlertele();

      setAlerte(raspuns ?? []);
    } catch {
      setAlerte([]);
    } finally {
      setSeIncarca(false);
    }
  };

  const schimbaStare = async (idAlerta: number, actiune: 'rezolva' | 'ignora') => {
    try {
      if (actiune === 'rezolva') {
        await rezolvaAlerta(idAlerta);
      } else {
        await ignoraAlerta(idAlerta);
      }

      await incarcaDate();
    } catch {
      Alert.alert('Eroare', 'Alerta nu a putut fi actualizată.');
    }
  };

  return (
    <View style={stiluri.container}>
      <Antet navigation={navigation} titlu="Alerte" />

      <ScrollView contentContainerStyle={stiluri.continut}>
        {seIncarca ? (
          <ActivityIndicator color={culori.primar} />
        ) : alerte.length ? (
          alerte.map(alerta => (
            <Card key={alerta.idAlerta}>
              <View style={stiluri.antetCard}>
                <Text style={stiluri.titlu}>{alerta.tipAlerta}</Text>
                <Badge text={alerta.stare} />
              </View>

              {rol !== 'Pacient' ? (
                <Text style={stiluri.subtitlu}>
                  {alerta.pacientNume} {alerta.pacientPrenume}
                </Text>
              ) : null}

              <Text style={stiluri.text}>{alerta.mesaj || alerta.parametruAsociat}</Text>
              <Text style={stiluri.subtitlu}>{formateazaData(alerta.dataOra)}</Text>

              {rol !== 'Pacient' ? (
                <View style={stiluri.actiuni}>
                  <ButonContur text="Rezolvă" onPress={() => schimbaStare(alerta.idAlerta, 'rezolva')} />
                  <ButonContur text="Ignoră" onPress={() => schimbaStare(alerta.idAlerta, 'ignora')} />
                </View>
              ) : null}
            </Card>
          ))
        ) : (
          <Card>
            <Text style={stiluri.textGol}>Nu există alerte înregistrate.</Text>
          </Card>
        )}
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

function formateazaData(data?: string | null) {
  if (!data) return '-';
  const dataConvertita = new Date(data);
  if (Number.isNaN(dataConvertita.getTime())) return '-';
  return dataConvertita.toLocaleString('ro-RO');
}

const stiluri = StyleSheet.create({
  container: { flex: 1, backgroundColor: culori.fundal },
  navbar: { backgroundColor: culori.primar, paddingTop: 44, paddingHorizontal: 20, paddingBottom: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logo: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  inapoi: { color: '#fff', fontWeight: 'bold' },
  continut: { padding: 20, paddingBottom: 40 },
  antetCard: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  titlu: { color: culori.text, fontWeight: 'bold', fontSize: 16, flex: 1 },
  subtitlu: { color: culori.textSecundar, marginTop: 4 },
  text: { color: culori.text, marginTop: 8 },
  textGol: { color: culori.textSecundar },
  actiuni: { flexDirection: 'row', marginTop: 10, flexWrap: 'wrap' },
});
