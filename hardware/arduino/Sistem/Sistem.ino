/*
  MetaHumanDevice.ino

  Cod pentru placa Arduino a dispozitivului MetaHuman.

  Placa citește temperatura prin senzorul DS18B20, citește semnalul ECG
  prin modulul AD8232, estimează pulsul pe baza vârfurilor ECG și transmite
  valorile prin Serial Monitor și prin modulul Bluetooth HC-05.

  Datele sunt transmise în format JSON pentru aplicația mobilă.
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
*/

OneWire magistralaOneWire(pinTemperatura);

/*
  Obiect pentru citirea temperaturii.
*/

DallasTemperature senzorTemperatura(&magistralaOneWire);

/*
  Obiect pentru comunicarea cu modulul Bluetooth HC-05.
*/

SoftwareSerial bluetooth(pinBluetoothRx, pinBluetoothTx);

/*
  Intervale de timp.
*/

unsigned long timpUltimaCitireTemperatura = 0;
unsigned long timpUltimaCitireEcg = 0;
unsigned long timpUltimaTrimitereDate = 0;
unsigned long timpStartFereastraCalitate = 0;

const unsigned long intervalCitireTemperatura = 1000;
const unsigned long intervalCitireEcg = 10;          // 10 ms = aproximativ 100 citiri/secundă
const unsigned long intervalTrimitereDate = 100;    // trimite pachet la 100 ms
const unsigned long durataFereastraCalitate = 2000; // 2 secunde pentru estimarea calității semnalului

/*
  Variabile pentru temperatură.
*/

float ultimaTemperatura = 0.0;
bool temperaturaValida = false;

/*
  Variabile pentru ECG.
*/

int ultimaValoareEcgRaw = 0;

/*
  Linia de bază este o medie lentă a semnalului ECG.
  O folosim pentru a scoate componenta constantă și pentru a detecta mai bine vârfurile.
*/

float linieBazaEcg = 512.0;
int semnalEcgFiltrat = 0;

/*
  Variabile pentru verificarea calității semnalului ECG.
*/

int minimEcgFereastra = 1023;
int maximEcgFereastra = 0;
int amplitudineEcg = 0;

bool semnalEcgValid = false;

/*
  Praguri orientative pentru a considera că semnalul ECG este utilizabil.

  Dacă amplitudinea este prea mică, cel mai probabil nu există contact bun.
  Dacă amplitudinea este prea mare, semnalul poate fi zgomot puternic sau saturație.
*/

const int amplitudineMinimaValida = 35;
const int amplitudineMaximaValida = 850;

const int limitaInferioaraSaturatie = 30;
const int limitaSuperioaraSaturatie = 990;

/*
  Variabile pentru calculul pulsului.
*/

int pulsCalculat = 0;
bool pulsValid = false;

unsigned long timpUltimVarf = 0;
bool semnalPestePragAnterior = false;

/*
  Praguri pentru puls.
*/

const int pulsMinimAcceptat = 40;
const int pulsMaximAcceptat = 180;

/*
  Perioada minimă dintre două bătăi, ca să evităm detectări false.
  300 ms înseamnă maximum 200 bpm.
*/

const unsigned long timpRefractarVarf = 300;

/*
  Dacă nu mai detectăm vârfuri timp de câteva secunde, pulsul devine invalid.
*/

const unsigned long timpMaximFaraVarfValid = 3000;

/*
  setup rulează o singură dată.
*/

void setup() {
  Serial.begin(9600);
  bluetooth.begin(9600);

  senzorTemperatura.begin();

  pinMode(pinLeadPlus, INPUT);
  pinMode(pinLeadMinus, INPUT);

  timpStartFereastraCalitate = millis();

  Serial.println("MetaHuman pornit");
  bluetooth.println("MetaHuman pornit");
}

/*
  loop rulează continuu.
*/

void loop() {
  unsigned long timpCurent = millis();

  if (timpCurent - timpUltimaCitireTemperatura >= intervalCitireTemperatura) {
    timpUltimaCitireTemperatura = timpCurent;
    citesteTemperatura();
  }

  if (timpCurent - timpUltimaCitireEcg >= intervalCitireEcg) {
    timpUltimaCitireEcg = timpCurent;
    citesteSiProceseazaEcg();
  }

  if (timpCurent - timpUltimaTrimitereDate >= intervalTrimitereDate) {
    timpUltimaTrimitereDate = timpCurent;
    trimiteDate();
  }
}

/*
  Citește temperatura de la senzorul DS18B20.
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
  Verifică LO+.
  HIGH înseamnă contact problematic / electrod desprins.
*/

bool verificaLeadPlusDesprins() {
  return digitalRead(pinLeadPlus) == HIGH;
}

/*
  Verifică LO-.
  HIGH înseamnă contact problematic / electrod desprins.
*/

bool verificaLeadMinusDesprins() {
  return digitalRead(pinLeadMinus) == HIGH;
}

/*
  Verifică dacă există cel puțin un electrod desprins.
*/

bool verificaElectroziDesprinsi() {
  return verificaLeadPlusDesprins() || verificaLeadMinusDesprins();
}

/*
  Citește și procesează ECG.

  Aici facem:
  1. citire raw de pe A0;
  2. actualizare linie de bază;
  3. calcul semnal filtrat;
  4. verificare calitate semnal;
  5. detectare vârfuri pentru puls.
*/

void citesteSiProceseazaEcg() {
  unsigned long timpCurent = millis();

  int valoareRaw = analogRead(pinEcg);
  ultimaValoareEcgRaw = valoareRaw;

  /*
    Actualizăm linia de bază lent.
    0.95 păstrează istoricul, 0.05 adaugă valoarea nouă.
  */

  linieBazaEcg = (linieBazaEcg * 0.95) + (valoareRaw * 0.05);

  /*
    Semnalul filtrat este diferența față de linia de bază.
  */

  semnalEcgFiltrat = valoareRaw - (int)linieBazaEcg;

  /*
    Actualizăm minimul și maximul din fereastra curentă.
  */

  if (valoareRaw < minimEcgFereastra) {
    minimEcgFereastra = valoareRaw;
  }

  if (valoareRaw > maximEcgFereastra) {
    maximEcgFereastra = valoareRaw;
  }

  /*
    La fiecare 2 secunde recalculăm amplitudinea semnalului.
  */

  if (timpCurent - timpStartFereastraCalitate >= durataFereastraCalitate) {
    amplitudineEcg = maximEcgFereastra - minimEcgFereastra;

    bool electroziDesprinsi = verificaElectroziDesprinsi();

    bool semnalPreaMic = amplitudineEcg < amplitudineMinimaValida;
    bool semnalPreaMare = amplitudineEcg > amplitudineMaximaValida;

    bool semnalSaturat =
      ultimaValoareEcgRaw <= limitaInferioaraSaturatie ||
      ultimaValoareEcgRaw >= limitaSuperioaraSaturatie;

    /*
      Semnalul este considerat valid doar dacă:
      - LO+ și LO- nu indică desprindere;
      - amplitudinea nu este prea mică;
      - amplitudinea nu este exagerat de mare;
      - semnalul nu este saturat aproape de 0 sau 1023.
    */

    semnalEcgValid =
      !electroziDesprinsi &&
      !semnalPreaMic &&
      !semnalPreaMare &&
      !semnalSaturat;

    /*
      Resetăm fereastra.
    */

    minimEcgFereastra = 1023;
    maximEcgFereastra = 0;
    timpStartFereastraCalitate = timpCurent;
  }

  /*
    Calculăm pulsul doar dacă semnalul ECG este valid.
  */

  if (semnalEcgValid) {
    detecteazaVarfPentruPuls(timpCurent);
  } else {
    pulsValid = false;
    pulsCalculat = 0;
    semnalPestePragAnterior = false;
  }

  /*
    Dacă nu s-a mai detectat un vârf de prea mult timp, pulsul nu mai este valid.
  */

  if (timpUltimVarf > 0 && timpCurent - timpUltimVarf > timpMaximFaraVarfValid) {
    pulsValid = false;
    pulsCalculat = 0;
  }
}

/*
  Detectează vârfurile ECG pentru calculul pulsului.

  Metoda este simplificată:
  - se folosește un prag dinamic;
  - se detectează trecerea peste prag;
  - se calculează intervalul dintre două vârfuri;
  - intervalul se transformă în BPM.
*/

void detecteazaVarfPentruPuls(unsigned long timpCurent) {
  int pragDinamic = amplitudineEcg * 0.35;

  if (pragDinamic < 35) {
    pragDinamic = 35;
  }

  bool semnalPestePrag = semnalEcgFiltrat > pragDinamic;

  /*
    Detectăm doar trecerea din jos în sus peste prag.
  */

  if (semnalPestePrag && !semnalPestePragAnterior) {
    unsigned long timpDeLaUltimulVarf = timpCurent - timpUltimVarf;

    /*
      Ignorăm vârfurile prea apropiate.
    */

    if (timpUltimVarf == 0 || timpDeLaUltimulVarf > timpRefractarVarf) {
      if (timpUltimVarf > 0) {
        int pulsNou = 60000 / timpDeLaUltimulVarf;

        if (pulsNou >= pulsMinimAcceptat && pulsNou <= pulsMaximAcceptat) {
          pulsCalculat = pulsNou;
          pulsValid = true;
        }
      }

      timpUltimVarf = timpCurent;
    }
  }

  semnalPestePragAnterior = semnalPestePrag;
}

/*
  Construiește mesajul JSON transmis de placă.
*/

String construiesteMesajJson() {
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

  /*
    Dacă semnalul ECG nu este valid, trimitem null.
    Așa aplicația nu mai afișează valori raw din zgomot.
  */

  if (semnalEcgValid) {
    mesaj += String(ultimaValoareEcgRaw);
  } else {
    mesaj += "null";
  }

  mesaj += ",";
  mesaj += "\"puls\":";

  /*
    Pulsul este trimis doar dacă a fost calculat valid.
  */

  if (pulsValid) {
    mesaj += String(pulsCalculat);
  } else {
    mesaj += "null";
  }

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
  mesaj += "\"semnalEcgValid\":";
  mesaj += semnalEcgValid ? "true" : "false";

  mesaj += ",";
  mesaj += "\"amplitudineEcg\":";
  mesaj += String(amplitudineEcg);

  mesaj += ",";
  mesaj += "\"timpMs\":";
  mesaj += String(millis());

  mesaj += "}";

  return mesaj;
}

/*
  Trimite datele prin Serial Monitor și Bluetooth.
*/

void trimiteDate() {
  String mesaj = construiesteMesajJson();

  Serial.println(mesaj);
  bluetooth.println(mesaj);
}