import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LayoutAplicatie from '../components/LayoutAplicatie';
import Card from '../components/Card';
import { culori } from '../styles/tema';

export default function EcranAcasa({ navigation }: any) {
  const [rol, setRol] = useState('Pacient');

  useEffect(() => {
    incarcaRol();
  }, []);

  const incarcaRol = async () => {
    const utilizatorSalvat = await AsyncStorage.getItem('utilizator');

    if (utilizatorSalvat) {
      const utilizator = JSON.parse(utilizatorSalvat);
      setRol(utilizator.rol ?? utilizator.Rol ?? 'Pacient');
    }
  };

  return (
    <LayoutAplicatie navigation={navigation} activ="Acasa" titlu="Bun venit">
      <CardNavigare
        titlu="Monitorizare"
        descriere="Vizualizare măsurători și istoric pacient."
        onPress={() => navigation.navigate('Monitorizare')}
      />

      <CardNavigare
        titlu="Alerte"
        descriere="Consultare alerte active și istoric alerte."
        onPress={() => navigation.navigate('Alerte')}
      />

      <CardNavigare
        titlu="Recomandări"
        descriere="Indicații medicale pentru pacient."
        onPress={() => navigation.navigate('Recomandari')}
      />

      {rol === 'Medic' || rol === 'Admin' ? (
        <CardNavigare
          titlu="Pacienți"
          descriere="Listă pacienți, detalii, editare și praguri."
          onPress={() => navigation.navigate('Pacienti')}
        />
      ) : null}

      {rol === 'Admin' ? (
        <CardNavigare
          titlu="Medici"
          descriere="Administrare conturi și date medici."
          onPress={() => navigation.navigate('Medici')}
        />
      ) : null}
    </LayoutAplicatie>
  );
}

function CardNavigare({
  titlu,
  descriere,
  onPress,
}: {
  titlu: string;
  descriere: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress}>
      <Card>
        <Text style={stiluri.cardTitlu}>{titlu}</Text>
        <Text style={stiluri.cardDescriere}>{descriere}</Text>
      </Card>
    </TouchableOpacity>
  );
}

const stiluri = StyleSheet.create({
  cardTitlu: {
    color: culori.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  cardDescriere: {
    color: culori.textSecundar,
    fontSize: 14,
  },
});