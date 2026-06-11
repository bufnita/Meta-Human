import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, Modal } from 'react-native';
import Card from '../components/Card';
import Badge from '../components/Badge';
import RandInfo from '../components/RandInfo';
import CampText from '../components/CampText';
import { ButonContur, ButonPrimar } from '../components/Buton';
import {
  obtinePacient,
  actualizeazaPacient,
  obtineIstoricPacient,
  obtineAlertePacientDupaId,
  obtinePraguriPacient,
  adaugaPragPacient,
  stergePragPacient,
  obtineRecomandariPacientDupaId,
  adaugaRecomandarePacient,
  stergeRecomandarePacient,
} from '../api/pacienti';
import { culori } from '../styles/tema';

export default function EcranPacientDetalii({ navigation, route }: any) {
  const idPacient = route.params?.idPacient;

  const [pacient, setPacient] = useState<any>(null);
  const [istoric, setIstoric] = useState<any[]>([]);
  const [alerte, setAlerte] = useState<any[]>([]);
  const [praguri, setPraguri] = useState<any[]>([]);
  const [recomandari, setRecomandari] = useState<any[]>([]);
  const [seIncarca, setSeIncarca] = useState(false);

  const [editare, setEditare] = useState(false);
  const [formularPacient, setFormularPacient] = useState<any>({});

  const [formularPragDeschis, setFormularPragDeschis] = useState(false);
  const [formularPrag, setFormularPrag] = useState({
    tipParametru: 'temperatura',
    valoareMinima: '',
    valoareMaxima: '',
    durataPersistentaSec: '1',
  });
  const eroareValidarePrag = obtineEroareValidarePrag(formularPrag);

  const [formularRecomandareDeschis, setFormularRecomandareDeschis] = useState(false);
  const [formularRecomandare, setFormularRecomandare] = useState({
    tipActivitate: '',
    durataZilnica: '',
    alteIndicatii: '',
    dataInceput: new Date().toISOString().slice(0, 10),
    dataSfarsit: '',
  });

  useEffect(() => {
    incarcaDate();
  }, []);

  const incarcaDate = async () => {
    setSeIncarca(true);

    try {
      const [detaliu, raspunsIstoric, raspunsAlerte, raspunsPraguri, raspunsRecomandari] =
        await Promise.all([
          obtinePacient(idPacient),
          obtineIstoricPacient(idPacient, 20),
          obtineAlertePacientDupaId(idPacient),
          obtinePraguriPacient(idPacient),
          obtineRecomandariPacientDupaId(idPacient),
        ]);

      setPacient(detaliu);
      setFormularPacient({
        nume: detaliu.nume ?? '',
        prenume: detaliu.prenume ?? '',
        varsta: detaliu.varsta ? String(detaliu.varsta) : '',
        cnp: detaliu.cnp ?? '',
        email: detaliu.email ?? '',
        telefon: detaliu.telefon ?? '',
        adresa: detaliu.adresa ?? '',
        profesie: detaliu.profesie ?? '',
        locMunca: detaliu.locMunca ?? '',
        parola: '',
      });
      setIstoric(raspunsIstoric.masuratori ?? raspunsIstoric.Masuratori ?? []);
      setAlerte(raspunsAlerte ?? []);
      setPraguri(raspunsPraguri ?? []);
      setRecomandari(raspunsRecomandari ?? []);
    } catch {
      Alert.alert('Eroare', 'Datele pacientului nu au putut fi încărcate.');
    } finally {
      setSeIncarca(false);
    }
  };

  const salveazaPacient = async () => {
    try {
      await actualizeazaPacient(idPacient, {
        ...formularPacient,
        varsta: Number(formularPacient.varsta),
        parola: formularPacient.parola || undefined,
      });
      setEditare(false);
      await incarcaDate();
    } catch {
      Alert.alert('Eroare', 'Datele pacientului nu au putut fi salvate.');
    }
  };

  const salveazaPrag = async () => {
    if (eroareValidarePrag) {
      return;
    }

    try {
      await adaugaPragPacient(idPacient, {
        tipParametru: formularPrag.tipParametru,
        valoareMinima: formularPrag.valoareMinima ? Number(formularPrag.valoareMinima) : null,
        valoareMaxima: formularPrag.valoareMaxima ? Number(formularPrag.valoareMaxima) : null,
        durataPersistentaSec: Number(formularPrag.durataPersistentaSec || 1),
        activ: true,
      });
      setFormularPragDeschis(false);
      await incarcaDate();
    } catch {
      Alert.alert('Eroare', 'Pragul nu a putut fi salvat.');
    }
  };

  const salveazaRecomandare = async () => {
    try {
      await adaugaRecomandarePacient(idPacient, {
        tipActivitate: formularRecomandare.tipActivitate,
        durataZilnica: formularRecomandare.durataZilnica || null,
        alteIndicatii: formularRecomandare.alteIndicatii || null,
        dataInceput: formularRecomandare.dataInceput,
        dataSfarsit: formularRecomandare.dataSfarsit || null,
        stare: 'Activa',
      });
      setFormularRecomandareDeschis(false);
      await incarcaDate();
    } catch {
      Alert.alert('Eroare', 'Recomandarea nu a putut fi salvată.');
    }
  };

  if (seIncarca && !pacient) {
    return (
      <View style={stiluri.centrat}>
        <ActivityIndicator color={culori.primar} />
      </View>
    );
  }

  return (
    <View style={stiluri.container}>
      <View style={stiluri.navbar}>
        <Text style={stiluri.logo}>Detalii pacient</Text>
        <ButonContur text="Înapoi" onPress={() => navigation.goBack()} />
      </View>

      <ScrollView contentContainerStyle={stiluri.continut}>
        <Card>
          <View style={stiluri.antetCard}>
            <Text style={stiluri.titlu}>{pacient?.nume} {pacient?.prenume}</Text>
            <Badge text={pacient?.activ === false ? 'Inactiv' : 'Activ'} />
          </View>

          {editare ? (
            <>
              <CampText label="Nume" value={formularPacient.nume} onChangeText={v => setFormularPacient({ ...formularPacient, nume: v })} />
              <CampText label="Prenume" value={formularPacient.prenume} onChangeText={v => setFormularPacient({ ...formularPacient, prenume: v })} />
              <CampText label="Vârstă" value={formularPacient.varsta} onChangeText={v => setFormularPacient({ ...formularPacient, varsta: v })} keyboardType="numeric" />
              <CampText label="CNP" value={formularPacient.cnp} onChangeText={v => setFormularPacient({ ...formularPacient, cnp: v })} />
              <CampText label="Email" value={formularPacient.email} onChangeText={v => setFormularPacient({ ...formularPacient, email: v })} />
              <CampText label="Telefon" value={formularPacient.telefon} onChangeText={v => setFormularPacient({ ...formularPacient, telefon: v })} />
              <CampText label="Adresă" value={formularPacient.adresa} onChangeText={v => setFormularPacient({ ...formularPacient, adresa: v })} />
              <CampText label="Profesie" value={formularPacient.profesie} onChangeText={v => setFormularPacient({ ...formularPacient, profesie: v })} />
              <CampText label="Loc de muncă" value={formularPacient.locMunca} onChangeText={v => setFormularPacient({ ...formularPacient, locMunca: v })} />
              <ButonPrimar text="Salvează" onPress={salveazaPacient} />
              <ButonContur text="Renunță la editare" onPress={() => setEditare(false)} />
            </>
          ) : (
            <>
              <RandInfo eticheta="CNP" valoare={pacient?.cnp} />
              <RandInfo eticheta="Vârstă" valoare={pacient?.varsta} />
              <RandInfo eticheta="Telefon" valoare={pacient?.telefon} />
              <RandInfo eticheta="Email" valoare={pacient?.email} />
              <RandInfo eticheta="Adresă" valoare={pacient?.adresa} />
              <RandInfo eticheta="Profesie" valoare={pacient?.profesie} />
              <RandInfo eticheta="Loc de muncă" valoare={pacient?.locMunca} />
              <ButonContur text="Editează date pacient" onPress={() => setEditare(true)} />
            </>
          )}
        </Card>

        <SectiuneLista titlu="Istoric măsurători" lista={istoric} campPrincipal="tipParametru" campSecundar="valoare" />
        <SectiuneLista titlu="Alerte" lista={alerte} campPrincipal="tipAlerta" campSecundar="stare" />

        <Card>
          <View style={stiluri.antetCard}>
            <Text style={stiluri.sectiuneTitlu}>Praguri de alertă</Text>
            <ButonContur text="+ Adaugă prag" onPress={() => setFormularPragDeschis(true)} />
          </View>

          {praguri.length ? praguri.map(prag => (
            <View key={prag.idPragAlerta ?? prag.idPrag} style={stiluri.randLista}>
              <View style={stiluri.randText}>
                <Text style={stiluri.randTitlu}>{prag.tipParametru}</Text>
                <Text style={stiluri.randSubtitlu}>Min: {prag.valoareMinima ?? '-'} · Max: {prag.valoareMaxima ?? '-'}</Text>
              </View>
              <ButonContur
                text="Șterge"
                danger
                onPress={async () => {
                  try {
                    await stergePragPacient(idPacient, prag.idPragAlerta ?? prag.idPrag);
                    await incarcaDate();
                  } catch {
                    Alert.alert('Eroare', 'Pragul nu a putut fi șters.');
                  }
                }}
              />
            </View>
          )) : <Text style={stiluri.textGol}>Nu există praguri configurate.</Text>}
        </Card>

        <Card>
          <View style={stiluri.antetCard}>
            <Text style={stiluri.sectiuneTitlu}>Recomandări</Text>
            <ButonContur text="+ Adaugă recomandare" onPress={() => setFormularRecomandareDeschis(true)} />
          </View>

          {recomandari.length ? recomandari.map(recomandare => (
            <View key={recomandare.idRecomandare} style={stiluri.randLista}>
              <View style={stiluri.randText}>
                <Text style={stiluri.randTitlu}>{recomandare.tipActivitate}</Text>
                <Text style={stiluri.randSubtitlu}>{recomandare.stare}</Text>
              </View>
              <ButonContur
                text="Șterge"
                danger
                onPress={async () => {
                  try {
                    await stergeRecomandarePacient(idPacient, recomandare.idRecomandare);
                    await incarcaDate();
                  } catch {
                    Alert.alert('Eroare', 'Recomandarea nu a putut fi ștearsă.');
                  }
                }}
              />
            </View>
          )) : <Text style={stiluri.textGol}>Nu există recomandări.</Text>}
        </Card>
      </ScrollView>

      <Modal visible={formularPragDeschis} animationType="slide">
        <ScrollView contentContainerStyle={stiluri.continut}>
          <Text style={stiluri.titluPagina}>Prag nou</Text>
          <CampText label="Tip parametru" value={formularPrag.tipParametru} onChangeText={v => setFormularPrag({ ...formularPrag, tipParametru: v })} />
          <CampText label="Valoare minimă" value={formularPrag.valoareMinima} onChangeText={v => setFormularPrag({ ...formularPrag, valoareMinima: v })} keyboardType="numeric" />
          <CampText label="Valoare maximă" value={formularPrag.valoareMaxima} onChangeText={v => setFormularPrag({ ...formularPrag, valoareMaxima: v })} keyboardType="numeric" />
          <CampText label="Durată persistență secunde" value={formularPrag.durataPersistentaSec} onChangeText={v => setFormularPrag({ ...formularPrag, durataPersistentaSec: v })} keyboardType="numeric" />
          {eroareValidarePrag ? (
            <Text style={stiluri.eroareFormular}>{eroareValidarePrag}</Text>
          ) : null}
          <ButonPrimar text="Salvează" onPress={salveazaPrag} disabled={!!eroareValidarePrag} />
          <ButonContur text="Anulează" onPress={() => setFormularPragDeschis(false)} />
        </ScrollView>
      </Modal>

      <Modal visible={formularRecomandareDeschis} animationType="slide">
        <ScrollView contentContainerStyle={stiluri.continut}>
          <Text style={stiluri.titluPagina}>Recomandare nouă</Text>
          <CampText label="Tip activitate" value={formularRecomandare.tipActivitate} onChangeText={v => setFormularRecomandare({ ...formularRecomandare, tipActivitate: v })} />
          <CampText label="Durată zilnică" value={formularRecomandare.durataZilnica} onChangeText={v => setFormularRecomandare({ ...formularRecomandare, durataZilnica: v })} />
          <CampText label="Data început" value={formularRecomandare.dataInceput} onChangeText={v => setFormularRecomandare({ ...formularRecomandare, dataInceput: v })} />
          <CampText label="Data sfârșit" value={formularRecomandare.dataSfarsit} onChangeText={v => setFormularRecomandare({ ...formularRecomandare, dataSfarsit: v })} />
          <CampText label="Alte indicații" value={formularRecomandare.alteIndicatii} onChangeText={v => setFormularRecomandare({ ...formularRecomandare, alteIndicatii: v })} multiline />
          <ButonPrimar text="Salvează" onPress={salveazaRecomandare} />
          <ButonContur text="Anulează" onPress={() => setFormularRecomandareDeschis(false)} />
        </ScrollView>
      </Modal>
    </View>
  );
}

function SectiuneLista({ titlu, lista, campPrincipal, campSecundar }: any) {
  return (
    <Card>
      <Text style={stiluri.sectiuneTitlu}>{titlu}</Text>
      {lista.length ? lista.map((item: any, index: number) => (
        <View key={item.idMasuratoare ?? item.idAlerta ?? index} style={stiluri.randLista}>
          <View style={stiluri.randText}>
            <Text style={stiluri.randTitlu}>{item[campPrincipal]}</Text>
            <Text style={stiluri.randSubtitlu}>{String(item[campSecundar] ?? '-')}</Text>
          </View>
        </View>
      )) : <Text style={stiluri.textGol}>Nu există înregistrări.</Text>}
    </Card>
  );
}

function obtineEroareValidarePrag(formular: {
  tipParametru: string;
  valoareMinima: string;
  valoareMaxima: string;
  durataPersistentaSec: string;
}) {
  const tipParametru = formular.tipParametru.trim().toLowerCase();
  const valoareMinima = formular.valoareMinima === '' ? null : Number(formular.valoareMinima);
  const valoareMaxima = formular.valoareMaxima === '' ? null : Number(formular.valoareMaxima);
  const durataPersistentaSec = Number(formular.durataPersistentaSec);

  if (!tipParametru) {
    return 'Tipul parametrului este obligatoriu.';
  }

  if (!formular.durataPersistentaSec || !Number.isFinite(durataPersistentaSec) || durataPersistentaSec < 1) {
    return 'Durata de persistență trebuie să fie mai mare sau egală cu 1 secundă.';
  }

  if (
    (tipParametru === 'puls' || tipParametru === 'temperatura') &&
    ((valoareMinima !== null && valoareMinima < 0) ||
      (valoareMaxima !== null && valoareMaxima < 0))
  ) {
    return `Valorile negative nu sunt permise pentru ${tipParametru}.`;
  }

  const intervale: Record<string, { minim: number; maxim: number }> = {
    puls: { minim: 1, maxim: 300 },
    temperatura: { minim: 20, maxim: 45 },
    ecg: { minim: 0, maxim: 1023 },
  };
  const interval = intervale[tipParametru];

  if (
    interval &&
    ((valoareMinima !== null &&
      (!Number.isFinite(valoareMinima) ||
        valoareMinima < interval.minim ||
        valoareMinima > interval.maxim)) ||
      (valoareMaxima !== null &&
        (!Number.isFinite(valoareMaxima) ||
          valoareMaxima < interval.minim ||
          valoareMaxima > interval.maxim)))
  ) {
    return `Valorile pentru ${tipParametru} trebuie să fie între ${interval.minim} și ${interval.maxim}.`;
  }

  if (
    valoareMinima !== null &&
    valoareMaxima !== null &&
    valoareMinima >= valoareMaxima
  ) {
    return 'Valoarea minimă trebuie să fie mai mică decât valoarea maximă.';
  }

  return null;
}

const stiluri = StyleSheet.create({
  container: { flex: 1, backgroundColor: culori.fundal },
  centrat: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  navbar: { backgroundColor: culori.primar, paddingTop: 44, paddingHorizontal: 20, paddingBottom: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logo: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  continut: { padding: 20, paddingBottom: 40 },
  titluPagina: { fontSize: 24, fontWeight: 'bold', color: culori.text, marginBottom: 18 },
  antetCard: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap' },
  titlu: { color: culori.text, fontWeight: 'bold', fontSize: 18, flex: 1 },
  sectiuneTitlu: { color: culori.text, fontWeight: 'bold', fontSize: 16, marginBottom: 8 },
  randLista: { borderBottomWidth: 1, borderBottomColor: culori.border, paddingVertical: 12, flexDirection: 'row', justifyContent: 'space-between' },
  randText: { flex: 1, marginRight: 12 },
  randTitlu: { color: culori.text, fontWeight: 'bold', fontSize: 15, marginBottom: 4 },
  randSubtitlu: { color: culori.textSecundar, fontSize: 13 },
  textGol: { color: culori.textSecundar },
  eroareFormular: {
    backgroundColor: culori.eroareFundal,
    color: culori.eroare,
    borderColor: culori.eroare,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
});
