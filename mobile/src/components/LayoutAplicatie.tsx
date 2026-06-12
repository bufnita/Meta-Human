import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ViewStyle,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { culori } from '../styles/tema';

type TabAplicatie =
  | 'Acasa'
  | 'Monitorizare'
  | 'Alerte'
  | 'Recomandari'
  | 'Pacienti'
  | 'Medici';

type RolUtilizator = 'Pacient' | 'Medic' | 'Admin';

export default function LayoutAplicatie({
  children,
  navigation,
  activ,
  titlu,
  scroll = true,
  contentStyle,
}: {
  children: React.ReactNode;
  navigation: any;
  activ: TabAplicatie;
  titlu?: string;
  scroll?: boolean;
  contentStyle?: ViewStyle;
}) {
  const [rol, setRol] = useState<RolUtilizator>('Pacient');
  const [numeUtilizator, setNumeUtilizator] = useState('');

  useEffect(() => {
    incarcaUtilizator();
  }, []);

  const incarcaUtilizator = async () => {
    const utilizatorSalvat = await AsyncStorage.getItem('utilizator');

    if (!utilizatorSalvat) {
      navigation.replace('Autentificare');
      return;
    }

    const utilizator = JSON.parse(utilizatorSalvat);
    const rolCurent = (utilizator.rol ?? utilizator.Rol ?? 'Pacient') as RolUtilizator;
    const nume = utilizator.nume ?? utilizator.Nume ?? '';
    const prenume = utilizator.prenume ?? utilizator.Prenume ?? '';

    setRol(rolCurent);
    setNumeUtilizator(`${nume} ${prenume}`.trim());
  };

  const deconectare = async () => {
    await AsyncStorage.clear();
    navigation.replace('Autentificare');
  };

  const taburi = construiesteTaburi(rol);

  const continut = (
    <View style={[stiluri.continut, contentStyle]}>
      {titlu ? <Text style={stiluri.titluPagina}>{titlu}</Text> : null}
      {children}
    </View>
  );

  return (
    <View style={stiluri.container}>
      <View style={stiluri.navbar}>
        <View style={stiluri.brandRand}>
          <View style={stiluri.logoBox}>
            <Text style={stiluri.logoLitera}>M</Text>
          </View>

          <View>
            <Text style={stiluri.logoText}>MetaHuman</Text>
            {numeUtilizator ? (
              <Text style={stiluri.utilizator}>{numeUtilizator}</Text>
            ) : null}
          </View>
        </View>

        <TouchableOpacity onPress={deconectare}>
          <Text style={stiluri.deconectare}>Deconectare</Text>
        </TouchableOpacity>
      </View>

      <View style={stiluri.taburi}>
        {taburi.map(tab => (
          <TouchableOpacity
            key={tab.ecran}
            style={[stiluri.tab, activ === tab.ecran ? stiluri.tabActiv : null]}
            onPress={() => navigation.navigate(tab.ecran)}
          >
            <Text
              style={[
                stiluri.textTab,
                activ === tab.ecran ? stiluri.textTabActiv : null,
              ]}
            >
              {tab.titlu}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {scroll ? (
        <ScrollView contentContainerStyle={stiluri.scroll}>{continut}</ScrollView>
      ) : (
        continut
      )}
    </View>
  );
}

function construiesteTaburi(rol: RolUtilizator) {
  if (rol === 'Pacient') {
    return [
      { titlu: 'Acasă', ecran: 'Acasa' as TabAplicatie },
      { titlu: 'Monitorizare', ecran: 'Monitorizare' as TabAplicatie },
      { titlu: 'Alerte', ecran: 'Alerte' as TabAplicatie },
      { titlu: 'Recomandări', ecran: 'Recomandari' as TabAplicatie },
    ];
  }

  if (rol === 'Admin') {
    return [
      { titlu: 'Acasă', ecran: 'Acasa' as TabAplicatie },
      { titlu: 'Monitorizare', ecran: 'Monitorizare' as TabAplicatie },
      { titlu: 'Alerte', ecran: 'Alerte' as TabAplicatie },
      { titlu: 'Recomandări', ecran: 'Recomandari' as TabAplicatie },
      { titlu: 'Pacienți', ecran: 'Pacienti' as TabAplicatie },
      { titlu: 'Medici', ecran: 'Medici' as TabAplicatie },
    ];
  }

  return [
    { titlu: 'Acasă', ecran: 'Acasa' as TabAplicatie },
    { titlu: 'Monitorizare', ecran: 'Monitorizare' as TabAplicatie },
    { titlu: 'Alerte', ecran: 'Alerte' as TabAplicatie },
    { titlu: 'Recomandări', ecran: 'Recomandari' as TabAplicatie },
    { titlu: 'Pacienți', ecran: 'Pacienti' as TabAplicatie },
  ];
}

const stiluri = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: culori.fundal,
  },
  navbar: {
    backgroundColor: culori.primar,
    paddingTop: 44,
    paddingHorizontal: 18,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandRand: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  logoLitera: {
    color: culori.primar,
    fontWeight: 'bold',
    fontSize: 20,
  },
  logoText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  utilizator: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    marginTop: 2,
  },
  deconectare: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  taburi: {
    flexDirection: 'row',
    backgroundColor: culori.primar,
    paddingHorizontal: 10,
    paddingBottom: 10,
    flexWrap: 'wrap',
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 6,
  },
  tabActiv: {
    backgroundColor: '#fff',
  },
  textTab: {
    color: 'rgba(255,255,255,0.85)',
    fontWeight: 'bold',
    fontSize: 13,
  },
  textTabActiv: {
    color: culori.primar,
  },
  scroll: {
    paddingBottom: 40,
  },
  continut: {
    padding: 20,
  },
  titluPagina: {
    fontSize: 24,
    fontWeight: 'bold',
    color: culori.text,
    marginBottom: 18,
  },
});
