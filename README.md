# MetaHuman - Sistem portabil de supraveghere a stării de sănătate

**Echipa:** Umbrella Corporation
**Disciplina:** Inginerie Software (Anul 2, Info ID)

## Descrierea Proiectului
MetaHuman este un sistem informatic destinat monitorizării la distanță a stării de sănătate a pacienților prin intermediul unui dispozitiv purtabil și al unei infrastructuri software compuse din aplicație mobilă, interfață web și servicii backend [2]. Acesta permite colectarea, transmiterea, stocarea și vizualizarea parametrilor fiziologici (ECG, puls, temperatură) într-un mod organizat și securizat [1, 3, 4].

## Tehnologii Utilizate
* **Modul Inteligent (Hardware):** Arduino UNO, senzor ECG AD8232, senzor temperatură DS18B20, modul Bluetooth HC-05 [5].
* **Client Mobil:** Aplicație Android (rol de gateway IoT și UI pentru pacient) [1, 6].
* **Frontend Web:** Vue.js (interfață destinată exclusiv medicilor) [7, 8].
* **Backend API:** ASP.NET Core (logica de business și orchestrare REST) [7, 9].
* **Bază de Date:** PostgreSQL (izolată în rețeaua internă) [7, 10].
* **Infrastructură:** Virtualizare Proxmox cu containere LXC, Nginx ca reverse proxy și Wireguard VPN pentru management [7, 11].

## Structura Repository-ului (Monorepo)
* `/backend` - API-ul REST dezvoltat în C# (ASP.NET Core).
* `/frontend` - Interfața grafică dezvoltată în Vue.js.
* `/mobile` - Codul sursă pentru aplicația client Android.
* `/hardware` - Codul sursă C/C++ pentru placa Arduino.
* `/docs` - Documentația oficială a proiectului (Specificații, Proiectare, Teste de Acceptanță, Plan de Marketing) [12].

## Arhitectura Sistemului (Fluxul de Date)
Sistemul urmează o arhitectură client-server distribuită [1]. Fluxul datelor este următorul [1, 13]:

[ Arduino + Senzori ] 
       ↓ (Bluetooth)
[ Aplicație Mobilă Android ] 
       ↓ (HTTPS / JSON)
[ Nginx (Reverse Proxy) ] ← meta-human.net
       ↓
[ Backend ASP.NET API ] ↔ [ Bază de Date PostgreSQL ]
       ↑
[ Frontend Web Vue.js ] ← meta-human.net (HTTPS)

## Acces și Securitate
Pentru a menține un nivel ridicat de securitate, toate serviciile (Backend, Frontend, DB) comunică printr-o rețea internă privată [9]. Singurul punct de acces din exterior pentru clienți este serverul Nginx (prin `meta-human.net`) [1, 9]. Accesul dezvoltatorilor direct la mediile containerizate LXC se face exclusiv prin tunel criptat Wireguard [11].
