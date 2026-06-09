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
import AsyncStorage from '@react-native-async-storage/async-storage';

import LayoutAplicatie from '../components/LayoutAplicatie';
import Card from '../components/Card';
import Badge from '../components/Badge';
import CampText from '../components/CampText';
import { ButonContur, ButonPrimar } from '../components/Buton';

import {
  obtinePacienti,
  creeazaPacient,
  actualizeazaPacient,
  dezactiveazaPacient,
  activeazaPacient,
  stergePacient,
} from '../api/pacienti';

import { culori } from '../styles/tema';

type Pacient = {
  idPacient: number;
  idMedic?: number;
  nume: string;
  prenume: string;
  varsta?: number;
  cnp?: string | null;
  email?: string | null;
  telefon?: string | null;
  adresa?: string | null;
  profesie?: string | null;
  locMunca?: string | null;
  activ?: boolean;
};

const formularGol = {
  nume: '',
  prenume: '',
  varsta: '',
  cnp: '',
  email: '',
  parola: '',
  telefon: '',
  adresa: '',
  profesie: '',
  locMunca: '',
};

export default function EcranPacienti({ navigation }: any) {
  const [rol, setRol] = useState('Medic');
  const [pacienti, setPacienti] = useState<Pacient[]>([]);
  const [seIncarca, setSeIncarca] = useState(false);

  const [formularDeschis, setFormularDeschis] = useState(false);
  const [pacientEditat, setPacientEditat] = useState<Pacient | null>(null);
  const [formular, setFormular] = useState(formularGol);

  useEffect(() => {
    incarcaRol();
    incarcaDate();
  }, []);

  const incarcaRol = async () => {
    const utilizatorSalvat = await AsyncStorage.getItem('utilizator');

    if (utilizatorSalvat) {
      const utilizator = JSON.parse(utilizatorSalvat);
      setRol(utilizator.rol ?? utilizator.Rol ?? 'Medic');
    }
  };

  const incarcaDate = async () => {
    setSeIncarca(true);

    try {
      const raspuns = await obtinePacienti();
      setPacienti(raspuns ?? []);
    } catch {
      setPacienti([]);
    } finally {
      setSeIncarca(false);
    }
  };

  const deschideCreare = () => {
    setPacientEditat(null);
    setFormular(formularGol);
    setFormularDeschis(true);
  };

  const deschideEditare = (pacient: Pacient) => {
    setPacientEditat(pacient);

    setFormular({
      nume: pacient.nume ?? '',
      prenume: pacient.prenume ?? '',
      varsta: pacient.varsta ? String(pacient.varsta) : '',
      cnp: pacient.cnp ?? '',
      email: pacient.email ?? '',
      parola: '',
      telefon: pacient.telefon ?? '',
      adresa: pacient.adresa ?? '',
      profesie: pacient.profesie ?? '',
      locMunca: pacient.locMunca ?? '',
    });

    setFormularDeschis(true);
  };

  const salveaza = async () => {
    if (!formular.nume || !formular.prenume || !formular.email || !formular.varsta) {
      Alert.alert('Eroare', 'Completați numele, prenumele, vârsta și email-ul.');
      return;
    }

    if (!pacientEditat && !formular.parola) {
      Alert.alert('Eroare', 'Parola este obligatorie la creare.');
      return;
    }

    const cerere = {
      nume: formular.nume,
      prenume: formular.prenume,
      varsta: Number(formular.varsta),
      cnp: formular.cnp || undefined,
      email: formular.email,
      parola: formular.parola || undefined,
      telefon: formular.telefon || undefined,
      adresa: formular.adresa || undefined,
      profesie: formular.profesie || undefined,
      locMunca: formular.locMunca || undefined,
    };

    try {
      if (pacientEditat) {
        await actualizeazaPacient(pacientEditat.idPacient, cerere);
      } else {
        await creeazaPacient(cerere);
      }

      setFormularDeschis(false);
      await incarcaDate();
    } catch {
      Alert.alert('Eroare', 'Pacientul nu a putut fi salvat.');
    }
  };

  const schimbaStare = async (pacient: Pacient) => {
    try {
      if (pacient.activ === false) {
        await activeazaPacient(pacient.idPacient);
      } else {
        await dezactiveazaPacient(pacient.idPacient);
      }

      await incarcaDate();
    } catch {
      Alert.alert('Eroare', 'Starea pacientului nu a putut fi actualizată.');
    }
  };

  const confirmaStergere = (pacient: Pacient) => {
    Alert.alert(
      'Confirmare',
      `Ștergeți pacientul ${pacient.nume} ${pacient.prenume}?`,
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
              await stergePacient(pacient.idPacient);
              await incarcaDate();
            } catch {
              Alert.alert('Eroare', 'Pacientul nu a putut fi șters.');
            }
          },
        },
      ],
    );
  };

  return (
    <LayoutAplicatie navigation={navigation} activ="Pacienti" titlu="Pacienți">
      <ButonPrimar text="Adaugă pacient" onPress={deschideCreare} />

      {seIncarca ? (
        <ActivityIndicator color={culori.primar} />
      ) : pacienti.length ? (
        pacienti.map(pacient => (
          <Card key={pacient.idPacient}>
            <View style={stiluri.antetCard}>
              <Text style={stiluri.titlu}>
                {pacient.nume} {pacient.prenume}
              </Text>

              <Badge text={pacient.activ === false ? 'Inactiv' : 'Activ'} />
            </View>

            <Text style={stiluri.subtitlu}>{pacient.email || '-'}</Text>
            <Text style={stiluri.subtitlu}>{pacient.telefon || '-'}</Text>

            <View style={stiluri.actiuni}>
              <ButonContur
                text="Detalii"
                onPress={() =>
                  navigation.navigate('PacientDetalii', {
                    idPacient: pacient.idPacient,
                  })
                }
              />

              <ButonContur
                text="Editează"
                onPress={() => deschideEditare(pacient)}
              />

              <ButonContur
                text={pacient.activ === false ? 'Activează' : 'Dezactivează'}
                danger={pacient.activ !== false}
                onPress={() => schimbaStare(pacient)}
              />

              {rol === 'Admin' ? (
                <ButonContur
                  text="Șterge"
                  danger
                  onPress={() => confirmaStergere(pacient)}
                />
              ) : null}
            </View>
          </Card>
        ))
      ) : (
        <Card>
          <Text style={stiluri.subtitlu}>Nu există pacienți înregistrați.</Text>
        </Card>
      )}

      <Modal visible={formularDeschis} animationType="slide">
        <ScrollView contentContainerStyle={stiluri.modalContinut}>
          <Text style={stiluri.titluPagina}>
            {pacientEditat ? 'Editare pacient' : 'Pacient nou'}
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
            label="Vârstă"
            value={formular.varsta}
            onChangeText={v => setFormular({ ...formular, varsta: v })}
            keyboardType="numeric"
          />

          <CampText
            label="CNP"
            value={formular.cnp}
            onChangeText={v => setFormular({ ...formular, cnp: v })}
          />

          <CampText
            label="Email"
            value={formular.email}
            onChangeText={v => setFormular({ ...formular, email: v })}
            keyboardType="email-address"
          />

          <CampText
            label={pacientEditat ? 'Parolă nouă, opțional' : 'Parolă'}
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
            label="Adresă"
            value={formular.adresa}
            onChangeText={v => setFormular({ ...formular, adresa: v })}
          />

          <CampText
            label="Profesie"
            value={formular.profesie}
            onChangeText={v => setFormular({ ...formular, profesie: v })}
          />

          <CampText
            label="Loc de muncă"
            value={formular.locMunca}
            onChangeText={v => setFormular({ ...formular, locMunca: v })}
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