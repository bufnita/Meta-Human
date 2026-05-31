import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EcranAutentificare from '../screens/EcranAutentificare';
import EcranPrincipal from '../screens/EcranPrincipal';

const Stiva = createNativeStackNavigator();

export default function Navigare() {
  return (
    <NavigationContainer>
      <Stiva.Navigator
        initialRouteName="Autentificare"
        screenOptions={{ headerShown: false }}
      >
        <Stiva.Screen name="Autentificare" component={EcranAutentificare} />
        <Stiva.Screen name="Panou" component={EcranPrincipal} />
      </Stiva.Navigator>
    </NavigationContainer>
  );
}
