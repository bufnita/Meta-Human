import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import Card from '../components/Card';
import Badge from '../components/Badge';
import RandInfo from '../components/RandInfo';
import { obtineRecomandariPacient } from '../api/pacient';
import { culori } from '../styles/tema';

type Recomandare = {
  idRecomandare: number;
  tipActivitate: string;
  durataZilnica?: string | null;
  alteIndicatii?: string | null;
  dataInceput: string;
  dataSfarsit?: string | null;
  stare: string;
};

export default function EcranRecomandari({ navigation }: any) {
  const [recomandari, setRecomandari] = useState<Recomandare[]>([]);
  const [seIncarca, setSeIncarca] = useState(false);

  useEffect(() => {
    incarcaDate();
  }, []);

  const incarcaDate = async () => {
    setSeIncarca(true);

    try {
      const raspuns = await obtineRecomandariPacient();
      setRecomandari(raspuns ?? []);
    } catch {
      setRecomandari([]);
    } finally {
      setSeIncarca(false);
    }
  };

  return (
    <View style={stiluri.container}>
      <Antet navigation={navigation} titlu="Recomandări" />

      <ScrollView contentContainerStyle={stiluri.continut}>
        {seIncarca ? (
          <ActivityIndicator color={culori.primar} />
        ) : recomandari.length ? (
          recomandari.map(recomandare => (
            <Card key={recomandare.idRecomandare}>
              <View style={stiluri.antetCard}>
                <Text style={stiluri.titlu}>{recomandare.tipActivitate}</Text>
                <Badge text={recomandare.stare} />
              </View>

              <RandInfo eticheta="Durată zilnică" valoare={recomandare.durataZilnica} />
              <RandInfo eticheta="Data început" valoare={formateazaDataScurta(recomandare.dataInceput)} />
              <RandInfo eticheta="Data sfârșit" valoare={formateazaDataScurta(recomandare.dataSfarsit)} />
              <RandInfo eticheta="Emis de către" valoare="-" />

              {recomandare.alteIndicatii ? (
                <Text style={stiluri.indicatii}>{recomandare.alteIndicatii}</Text>
              ) : null}
            </Card>
          ))
        ) : (
          <Card>
            <Text style={stiluri.textGol}>Nu există recomandări înregistrate pentru contul tău.</Text>
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

function formateazaDataScurta(data?: string | null) {
  if (!data) return '-';
  const dataConvertita = new Date(data);
  if (Number.isNaN(dataConvertita.getTime())) return '-';
  return dataConvertita.toLocaleDateString('ro-RO');
}

const stiluri = StyleSheet.create({
  container: { flex: 1, backgroundColor: culori.fundal },
  navbar: { backgroundColor: culori.primar, paddingTop: 44, paddingHorizontal: 20, paddingBottom: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logo: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  inapoi: { color: '#fff', fontWeight: 'bold' },
  continut: { padding: 20, paddingBottom: 40 },
  antetCard: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  titlu: { color: culori.text, fontWeight: 'bold', fontSize: 16, flex: 1 },
  indicatii: { color: culori.text, lineHeight: 20, marginTop: 10 },
  textGol: { color: culori.textSecundar },
});
