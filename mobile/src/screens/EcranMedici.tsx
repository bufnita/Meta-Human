import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';

import LayoutAplicatie from '../components/LayoutAplicatie';
import Card from '../components/Card';
import Badge from '../components/Badge';
import CampText from '../components/CampText';
import { ButonContur, ButonPrimar } from '../components/Buton';

import {
  obtineMedici,
  creeazaMedic,
  actualizeazaMedic,
  dezactiveazaMedic,
  activeazaMedic,
  stergeMedic,
} from '../api/medici';

import { culori } from '../styles/tema';

type Medic = {
  idMedic: number;
  nume: string;
  prenume: string;
  email?: string | null;
  telefon?: string | null;
  specializare?: string | null;
  activ?: boolean;
};

const formularGol = {
  nume: '',
  prenume: '',
  email: '',
  parola: '',
  telefon: '',
  specializare: '',
};

export default function EcranMedici({ navigation }: any) {
  const [medici, setMedici] = useState<Medic[]>([]);
  const [seIncarca, setSeIncarca] = useState(false);

  const [formularDeschis, setFormularDeschis] = useState(false);
  const [medicEditat, setMedicEditat] = useState<Medic | null>(null);
  const [formular, setFormular] = useState(formularGol);

  useEffect(() => {
    incarcaDate();
  }, []);

  const incarcaDate = async () => {
    setSeIncarca(true);

    try {
      const raspuns = await obtineMedici();
      setMedici(raspuns ?? []);
    } catch {
      setMedici([]);
    } finally {
      setSeIncarca(false);
    }
  };

  const deschideCreare = () => {
    setMedicEditat(null);
    setFormular(formularGol);
    setFormularDeschis(true);
  };

  const deschideEditare = (medic: Medic) => {
    setMedicEditat(medic);

    setFormular({
      nume: medic.nume ?? '',
      prenume: medic.prenume ?? '',
      email: medic.email ?? '',
      parola: '',
      telefon: medic.telefon ?? '',
      specializare: medic.specializare ?? '',
    });

    setFormularDeschis(true);
  };

  const salveaza = async () => {
    if (!formular.nume || !formular.prenume || !formular.email) {
      Alert.alert('Eroare', 'Completați numele, prenumele și email-ul.');
      return;
    }

    if (!medicEditat && !formular.parola) {
      Alert.alert('Eroare', 'Parola este obligatorie la creare.');
      return;
    }

    const cerere = {
      nume: formular.nume,
      prenume: formular.prenume,
      email: formular.email,
      parola: formular.parola || undefined,
      telefon: formular.telefon || undefined,
      specializare: formular.specializare || undefined,
    };

    try {
      if (medicEditat) {
        await actualizeazaMedic(medicEditat.idMedic, cerere);
      } else {
        await creeazaMedic(cerere);
      }

      setFormularDeschis(false);
      await incarcaDate();
    } catch {
      Alert.alert('Eroare', 'Medicul nu a putut fi salvat.');
    }
  };

  const schimbaStare = async (medic: Medic) => {
    try {
      if (medic.activ === false) {
        await activeazaMedic(medic.idMedic);
      } else {
        await dezactiveazaMedic(medic.idMedic);
      }

      await incarcaDate();
    } catch {
      Alert.alert('Eroare', 'Starea medicului nu a putut fi actualizată.');
    }
  };

  const confirmaStergere = (medic: Medic) => {
    Alert.alert(
      'Confirmare',
      `Ștergeți medicul ${medic.nume} ${medic.prenume}?`,
      [
        {
          text: 'Anulează',
          style: 'cancel',
        },
        {
          text: 'Șterge',
          style: 'destructive',
          onPress: async () => {
            try {
              await stergeMedic(medic.idMedic);
              await incarcaDate();
            } catch {
              Alert.alert('Eroare', 'Medicul nu a putut fi șters.');
            }
          },
        },
      ],
    );
  };

  return (
    <LayoutAplicatie navigation={navigation} activ="Medici" titlu="Medici">
      <ButonPrimar text="Adaugă medic" onPress={deschideCreare} />

      {seIncarca ? (
        <ActivityIndicator color={culori.primar} />
      ) : medici.length ? (
        medici.map(medic => (
          <Card key={medic.idMedic}>
            <View style={stiluri.antetCard}>
              <Text style={stiluri.titlu}>
                {medic.nume} {medic.prenume}
              </Text>

              <Badge text={medic.activ === false ? 'Inactiv' : 'Activ'} />
            </View>

            <Text style={stiluri.subtitlu}>{medic.email || '-'}</Text>
            <Text style={stiluri.subtitlu}>{medic.specializare || '-'}</Text>

            <View style={stiluri.actiuni}>
              <ButonContur
                text="Editează"
                onPress={() => deschideEditare(medic)}
              />

              <ButonContur
                text={medic.activ === false ? 'Activează' : 'Dezactivează'}
                danger={medic.activ !== false}
                onPress={() => schimbaStare(medic)}
              />

              <ButonContur
                text="Șterge"
                danger
                onPress={() => confirmaStergere(medic)}
              />
            </View>
          </Card>
        ))
      ) : (
        <Card>
          <Text style={stiluri.subtitlu}>Nu există medici înregistrați.</Text>
        </Card>
      )}

      <Modal visible={formularDeschis} animationType="slide">
        <ScrollView contentContainerStyle={stiluri.modalContinut}>
          <Text style={stiluri.titluPagina}>
            {medicEditat ? 'Editare medic' : 'Medic nou'}
          </Text>

          <CampText
            label="Nume"
            value={formular.nume}
            onChangeText={v => setFormular({ ...formular, nume: v })}
          />

          <CampText
            label="Prenume"
            value={formular.prenume}
            onChangeText={v => setFormular({ ...formular, prenume: v })}
          />

          <CampText
            label="Email"
            value={formular.email}
            onChangeText={v => setFormular({ ...formular, email: v })}
            keyboardType="email-address"
          />

          <CampText
            label={medicEditat ? 'Parolă nouă, opțional' : 'Parolă'}
            value={formular.parola}
            onChangeText={v => setFormular({ ...formular, parola: v })}
            secureTextEntry
          />

          <CampText
            label="Telefon"
            value={formular.telefon}
            onChangeText={v => setFormular({ ...formular, telefon: v })}
          />

          <CampText
            label="Specializare"
            value={formular.specializare}
            onChangeText={v => setFormular({ ...formular, specializare: v })}
          />

          <ButonPrimar text="Salvează" onPress={salveaza} />

          <ButonContur
            text="Anulează"
            onPress={() => setFormularDeschis(false)}
          />
        </ScrollView>
      </Modal>
    </LayoutAplicatie>
  );
}

const stiluri = StyleSheet.create({
  antetCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  titlu: {
    color: culori.text,
    fontWeight: 'bold',
    fontSize: 16,
    flex: 1,
  },
  subtitlu: {
    color: culori.textSecundar,
    marginTop: 4,
  },
  actiuni: {
    flexDirection: 'row',
    marginTop: 10,
    flexWrap: 'wrap',
  },
  modalContinut: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: culori.fundal,
  },
  titluPagina: {
    fontSize: 24,
    fontWeight: 'bold',
    color: culori.text,
    marginBottom: 18,
  },
});