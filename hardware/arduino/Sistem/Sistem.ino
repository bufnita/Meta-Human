/*
  MetaHumanDevice.ino

  Cod pentru placa Arduino a dispozitivului MetaHuman.

  Placa citește temperatura prin senzorul DS18B20, citește semnalul ECG
  prin modulul AD8232 și transmite valorile prin Serial Monitor și prin
  modulul Bluetooth HC-05.

  Datele sunt transmise în format JSON pentru a putea fi preluate ușor
  de aplicația mobilă.
*/

#include <OneWire.h>
#include <DallasTemperature.h>
#include <SoftwareSerial.h>

/*
  Pinii utilizați pentru componentele conectate la placa Arduino.
*/

const int pinTemperatura = 2;
const int pinEcg = A0;
const int pinLeadPlus = 10;
const int pinLeadMinus = 11;

const int pinBluetoothRx = 4;
const int pinBluetoothTx = 3;

/*
  Obiect pentru comunicarea OneWire cu senzorul DS18B20.
  Senzorul DS18B20 folosește o singură linie de date.
*/

OneWire magistralaOneWire(pinTemperatura);

/*
  Obiect pentru citirea temperaturii prin biblioteca DallasTemperature.
*/

DallasTemperature senzorTemperatura(&magistralaOneWire);

/*
  Obiect pentru comunicarea serială cu modulul Bluetooth HC-05.
  Pinul D4 primește date de la modulul Bluetooth.
  Pinul D3 transmite date către modulul Bluetooth.
*/

SoftwareSerial bluetooth(pinBluetoothRx, pinBluetoothTx);

/*
  Variabile pentru controlul timpului dintre citiri.

  Temperatura este citită la un interval mai mare, deoarece senzorul DS18B20
  are nevoie de timp pentru conversia valorii măsurate.

  Pachetul de date este transmis mai des, pentru ca semnalul ECG să poată fi
  urmărit mai fluent.
*/

unsigned long timpUltimaCitireTemperatura = 0;
unsigned long timpUltimaTrimitereDate = 0;

const unsigned long intervalCitireTemperatura = 1000;
const unsigned long intervalTrimitereDate = 100;

/*
  Variabile pentru păstrarea ultimei temperaturi citite corect.
*/

float ultimaTemperatura = 0.0;
bool temperaturaValida = false;

/*
  Funcția setup rulează o singură dată la pornirea plăcii.

  Se pornește comunicarea serială pentru testarea pe calculator.
  Se pornește comunicarea cu modulul Bluetooth.
  Se pornește senzorul de temperatură.
  Se configurează pinii LO+ și LO- ca intrări digitale.
*/

void setup() {
  Serial.begin(9600);
  bluetooth.begin(9600);

  senzorTemperatura.begin();

  pinMode(pinLeadPlus, INPUT);
  pinMode(pinLeadMinus, INPUT);

  Serial.println("MetaHuman pornit");
  bluetooth.println("MetaHuman pornit");
}

/*
  Funcția loop rulează continuu după pornirea plăcii.

  Citirea temperaturii și trimiterea datelor sunt controlate cu millis,
  pentru ca placa să nu fie blocată prin întârzieri mari.
*/

void loop() {
  unsigned long timpCurent = millis();

  if (timpCurent - timpUltimaCitireTemperatura >= intervalCitireTemperatura) {
    timpUltimaCitireTemperatura = timpCurent;
    citesteTemperatura();
  }

  if (timpCurent - timpUltimaTrimitereDate >= intervalTrimitereDate) {
    timpUltimaTrimitereDate = timpCurent;
    trimiteDate();
  }
}

/*
  Funcția citește temperatura de la senzorul DS18B20.

  Dacă valoarea citită se află în intervalul tehnic al senzorului,
  temperatura este considerată validă.

  Dacă valoarea este în afara intervalului, temperatura este marcată ca
  invalidă și va fi transmisă ca null în mesajul JSON.
*/

void citesteTemperatura() {
  senzorTemperatura.requestTemperatures();

  float temperaturaCitita = senzorTemperatura.getTempCByIndex(0);

  if (temperaturaCitita >= -55.0 && temperaturaCitita <= 125.0) {
    ultimaTemperatura = temperaturaCitita;
    temperaturaValida = true;
  } else {
    temperaturaValida = false;
  }
}

/*
  Funcția citește valoarea analogică a semnalului ECG.

  Modulul AD8232 trimite semnalul către pinul A0.
  Valoarea returnată de analogRead este cuprinsă între 0 și 1023.
*/

int citesteEcg() {
  int valoareEcg = analogRead(pinEcg);

  return valoareEcg;
}

/*
  Funcția verifică starea pinului LO+.

  Valoarea HIGH indică faptul că modulul AD8232 semnalează o problemă
  de contact pentru unul dintre electrozi.
*/

bool verificaLeadPlusDesprins() {
  return digitalRead(pinLeadPlus) == HIGH;
}

/*
  Funcția verifică starea pinului LO-.

  Valoarea HIGH indică faptul că modulul AD8232 semnalează o problemă
  de contact pentru unul dintre electrozi.
*/

bool verificaLeadMinusDesprins() {
  return digitalRead(pinLeadMinus) == HIGH;
}

/*
  Funcția verifică dacă există cel puțin un electrod desprins.

  Rezultatul este folosit pentru a marca pachetul de date ca fiind afectat
  de o problemă de contact la electrozi.
*/

bool verificaElectroziDesprinsi() {
  bool leadPlusDesprins = verificaLeadPlusDesprins();
  bool leadMinusDesprins = verificaLeadMinusDesprins();

  return leadPlusDesprins || leadMinusDesprins;
}

/*
  Funcția construiește mesajul JSON transmis de placă.

  Mesajul conține temperatura, valoarea ECG, starea electrozilor și timpul
  intern al plăcii exprimat în milisecunde.
*/

String construiesteMesajJson() {
  int valoareEcg = citesteEcg();

  bool leadPlusDesprins = verificaLeadPlusDesprins();
  bool leadMinusDesprins = verificaLeadMinusDesprins();
  bool electroziDesprinsi = verificaElectroziDesprinsi();

  String mesaj = "{";

  mesaj += "\"temperatura\":";

  if (temperaturaValida) {
    mesaj += String(ultimaTemperatura, 2);
  } else {
    mesaj += "null";
  }

  mesaj += ",";
  mesaj += "\"ecg\":";
  mesaj += String(valoareEcg);

  mesaj += ",";
  mesaj += "\"leadPlusDesprins\":";
  mesaj += leadPlusDesprins ? "true" : "false";

  mesaj += ",";
  mesaj += "\"leadMinusDesprins\":";
  mesaj += leadMinusDesprins ? "true" : "false";

  mesaj += ",";
  mesaj += "\"electroziDesprinsi\":";
  mesaj += electroziDesprinsi ? "true" : "false";

  mesaj += ",";
  mesaj += "\"timpMs\":";
  mesaj += String(millis());

  mesaj += "}";

  return mesaj;
}

/*
  Funcția trimite mesajul JSON.

  Serial Monitor este folosit pentru testarea pe calculator.
  Bluetooth este folosit pentru transmiterea datelor către aplicația mobilă.
*/

void trimiteDate() {
  String mesaj = construiesteMesajJson();

  Serial.println(mesaj);
  bluetooth.println(mesaj);
}