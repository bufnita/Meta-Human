import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import EcranAutentificare from '../screens/EcranAutentificare';
import EcranAcasa from '../screens/EcranAcasa';
import EcranMonitorizare from '../screens/EcranMonitorizare';
import EcranAlerte from '../screens/EcranAlerte';
import EcranRecomandari from '../screens/EcranRecomandari';
import EcranPacienti from '../screens/EcranPacienti';
import EcranPacientDetalii from '../screens/EcranPacientDetalii';
import EcranMedici from '../screens/EcranMedici';

const Stiva = createNativeStackNavigator();

export default function Navigare() {
  return (
    <Stiva.Navigator
      initialRouteName="Autentificare"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stiva.Screen name="Autentificare" component={EcranAutentificare} />
      <Stiva.Screen name="Acasa" component={EcranAcasa} />
      <Stiva.Screen name="Monitorizare" component={EcranMonitorizare} />
      <Stiva.Screen name="Alerte" component={EcranAlerte} />
      <Stiva.Screen name="Recomandari" component={EcranRecomandari} />
      <Stiva.Screen name="Pacienti" component={EcranPacienti} />
      <Stiva.Screen name="PacientDetalii" component={EcranPacientDetalii} />
      <Stiva.Screen name="Medici" component={EcranMedici} />
    </Stiva.Navigator>
  );
}
