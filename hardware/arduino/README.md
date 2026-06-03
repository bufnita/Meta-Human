# Sistem

## Componente

- Arduino compatibil UNO cu ATmega328P-AU
- Senzor temperatură DS18B20
- Modul ECG AD8232
- Modul Bluetooth HC-05
- Breadboard
- Fire Dupont
- Rezistor 4.7 kΩ pentru DS18B20
- Rezistoare 1 kΩ și 2.2 kΩ pentru RXD la modulul HC-05

## Conexiuni

### Alimentare breadboard 
• Arduino 5V pe șina roșie stânga +  
• Arduino GND pe șina albastră stânga -  
• Arduino 3.3V pe șina roșie dreapta +  
• Arduino GND pe șina albastră dreapta -  

### DS18B20 temperatură 
• DS18B20 roșu pe șina roșie stânga 5V  
• DS18B20 negru pe șina albastră stânga GND  
• DS18B20 galben la A10  
• B10 la Arduino D2  
• C10 cu rezistor 4.7 kΩ pe șina roșie stânga 5V  

### AD8232 ECG 
• AD8232 3.3V pe șina roșie dreapta 3.3V  
• AD8232 GND pe șina albastră dreapta GND  
• AD8232 OUTPUT la Arduino A0  
• AD8232 LO+ la Arduino D10  
• AD8232 LO- la Arduino D11  
• AD8232 SDN e neconectat 

### HC-05 Bluetooth 
• HC-05 VCC pe șina roșie dreapta 3.3V  
• HC-05 GND pe șina albastră dreapta GND  
• HC-05 TXD la Arduino D4  

### HC-05 RXD prin divizor pe rândul 45 
• Arduino D3 cu fir Dupont → F43  
• Rezistor 1 kΩ: G43 bridge cu G45  
• H45 catre HC-05 RXD  
• Rezistor 2.2 kΩ: I45 la șina albastră dreapta GND 

## Format date trimise

```json
{"temperatura":24.75,"ecg":512,"leadPlusDesprins":false,"leadMinusDesprins":false,"electroziDesprinsi":false,"timpMs":12345}
