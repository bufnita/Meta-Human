# Arhitectura și Implementarea Backend-ului (ASP.NET Core)
**Proiect:** MetaHuman - Sistem portabil de supraveghere a stării de sănătate
**Tehnologie:** C# / ASP.NET Core 8.0
**Mediul de execuție:** Container LXC (Linux) în rețeaua internă privată

## 1. Rolul și Responsabilitățile Backend-ului
Conform deciziilor de arhitectură, backend-ul este **nucleul logic al aplicației** (componenta centrală) și funcționează ca un API REST *stateless*.

Responsabilitățile sale principale sunt:
* **Validarea și procesarea datelor:** Preia măsurătorile și capturile ECG trimise de aplicația mobilă în format JSON și le validează.
* **Acces exclusiv la baza de date:** Este singura componentă din întregul sistem care are permisiunea să interogheze și să modifice datele din PostgreSQL (prin TCP/IP și SQL).
* **Generarea alertelor:** Conține logica de business pentru compararea valorilor măsurate cu pragurile configurate de medic și generează alerte dacă o abatere persistă o anumită durată de timp configurabilă. *(Planificat — vezi secțiunea 5.)*
* **Autentificare și Autorizare:** Gestionează accesul utilizatorilor pe bază de roluri (**Admin**, **Medic**, **Pacient**) utilizând tokenuri JWT.
* **Deservirea interfeței web:** Furnizează date agregate (grafice, istoric, rapoarte) către frontend-ul Vue.js.

## 2. Organizarea Internă a Codului în C#
Pentru ca responsabilitățile să fie separate și codul să rămână ușor de întreținut, proiectarea internă a backend-ului se împarte logic în următoarele straturi:

* **Controlere (Controllers):** Punctele finale (endpoints) care expun API-ul REST, interceptează cererile HTTP venite de la Nginx și returnează răspunsurile HTTP adecvate.
  * Implementate: `AuthController`, `PacientiController`, `MasuratoriController`.
* **Servicii (Services):** Clase C# cu logică reutilizabilă.
  * Implementat: `JwtService` — generarea token-urilor JWT.
  * Planificat: `AlertService` — evaluarea pragurilor și generarea alertelor.
* **Modele de Transfer de Date (DTOs):** Obiecte C# simplificate pentru JSON (ex. `CerereAutentificareDTO`, `MasuratoareDTO`), evitând expunerea directă a structurii bazei de date acolo unde este posibil.
* **Entități și context EF (Models):** Maparea tabelelor PostgreSQL în entități C# prin `MetaHumanContext` (Entity Framework Core). Accesul la date se face în prezent direct din controllere; stratul Repository poate fi introdus ulterior dacă complexitatea crește.
* **Enum roluri (`RolUtilizator`):** `Admin`, `Medic`, `Pacient` — folosit în cod pentru validare și policy-uri JWT. În baza de date, coloana `utilizator.rol` rămâne `VARCHAR`; conversia se face prin `RolUtilizatorExtensions` (`ToDbValue`, `TryFromDbValue`).

## 3. Autentificare și Autorizare JWT

### Configurare
Setările JWT se citesc din secțiunea **`Autentificare`** din `appsettings.json` / `appsettings.Development.json`:

| Cheie | Descriere |
| :--- | :--- |
| `Autentificare:CheieJwt` | Cheia simetrică de semnare |
| `Autentificare:Emitent` | Issuer JWT |
| `Autentificare:Audienta` | Audience JWT |
| `Autentificare:DurataMinute` | Durata de valabilitate a token-ului |

> **Important:** Codul citește exclusiv `Autentificare:*`. Secțiunea veche `Jwt` din `appsettings.json` (dacă există) trebuie aliniată la acest format în producție.

### Login
* **Rută:** `POST /api/auth/login`
* **Cerere:** `CerereAutentificareDTO` — `email` (Required, EmailAddress, MaxLength 150), `parola` (Required, MinLength 6).
* **Răspuns:** `RaspunsAutentificareDTO` — `email`, `token`, `rol`, `nume`, `prenume`.
* **Flux:**
  1. Validare DTO → **400** dacă datele sunt invalide.
  2. Verificare email + parolă (BCrypt) + cont activ → **401** dacă eșuează.
  3. Validare rol cu `TryFromDbValue` (null, gol sau valoare necunoscută → **401**, fără token).
  4. Încărcare `nume`/`prenume` din `Medic` sau `Pacient` după rol; Admin nu are profil extins.
  5. Generare JWT prin `JwtService` (claim `role` = valoarea enum, ex. `"Medic"`).

### Policy-uri de autorizare
Definite în `Program.cs`:

| Policy | Rol necesar | Utilizare tipică |
| :--- | :--- | :--- |
| `Admin` | Admin | Gestionare sistem (planificat) |
| `Medic` | Medic | `PacientiController` |
| `Pacient` | Pacient | `MasuratoriController` |

Endpoint-urile protejate necesită header: `Authorization: Bearer {token}`.

## 4. Rute și Endpoint-uri API

Backend-ul expune rute API securizate (HTTPS intermediat de Nginx). Mai jos: ce este **implementat** și ce este **planificat**.

### Autentificare
| Metodă | Rută | Status | Autorizare |
| :--- | :--- | :--- | :--- |
| POST | `/api/auth/login` | Implementat | Public |

### Gestionarea Pacienților
| Metodă | Rută | Status | Autorizare |
| :--- | :--- | :--- | :--- |
| GET | `/api/pacienti` | Implementat | Policy `Medic` |
| GET | `/api/pacienti/{id}` | Implementat | Policy `Medic` |
| POST | `/api/pacienti` | Implementat | Policy `Medic` |
| GET | `/api/pacienti/{id}/istoric` | Planificat | Policy `Medic` |
| GET | `/api/pacienti/{id}/alerte` | Planificat | Policy `Medic` |

### Configurare și Recomandări
| Metodă | Rută | Status | Autorizare |
| :--- | :--- | :--- | :--- |
| POST | `/api/pacienti/{id}/praguri` | Planificat | Policy `Medic` |
| POST | `/api/pacienti/{id}/recomandari` | Planificat | Policy `Medic` |

### Achiziție Date (Aplicație Mobilă)
| Metodă | Rută | Status | Autorizare |
| :--- | :--- | :--- | :--- |
| POST | `/api/masuratori` | Implementat | Policy `Pacient` |
| GET | `/api/masuratori/test` | Implementat (debug) | Policy `Pacient` |
| POST | `/api/masuratori/ecg` | Planificat | Policy `Pacient` |

## 5. Standardizarea Răspunsurilor și a Erorilor
Pentru a asigura o comunicare clară cu aplicația mobilă și interfața web, backend-ul returnează răspunsuri bazate pe coduri de stare HTTP:

| Cod HTTP | Semnificație | Situație Tipică de Utilizare |
| :--- | :--- | :--- |
| **200 OK** | Operație reușită | Citirea datelor, login reușit. |
| **201 Created** | Resursă creată | Inserarea unei măsurători sau a unui pacient. |
| **400 Bad Request** | Cerere invalidă | JSON malformat, email invalid, parolă prea scurtă. |
| **401 Unauthorized** | Neautorizat | Lipsă token JWT, token expirat, credențiale greșite sau rol invalid la login. |
| **403 Forbidden** | Acces interzis | Token valid, dar rol incorect pentru endpoint (ex. Pacient pe `/api/pacienti`). |
| **404 Not Found** | Resursă inexistentă | ID pacient inexistent. |
| **500 Internal Server Error** | Eroare internă | Eroare DB sau excepție neprinsă. |

## 6. Fluxul Datelor (Exemplu: Salvare Măsurătoare)

### Implementat acum
1. Primește `POST /api/masuratori` cu `MasuratoareDTO` de la aplicația mobilă.
2. Validează JWT (rol **Pacient**).
3. Salvează valoarea în tabelul `Masuratoare`.
4. Returnează **201 Created**.

### Planificat (logică alerte)
5. Citește din `PragAlerta` limitele și durata de persistență configurate de medic.
6. Compară valoarea cu pragurile; dacă există depășire, interoghează istoricul recent.
7. Dacă abaterea persistă peste durata minimă, inserează în `Alerta`.
8. Returnează **201 Created** (cu eventuale informații despre alertă generată).

## 7. Infrastructură și Mediu
* **Port intern:** `5000` (`http://0.0.0.0:5000`) — expus prin Nginx ca reverse proxy.
* **Forwarded headers:** Configurate pentru Nginx (`X-Forwarded-For`, `X-Forwarded-Proto`).
* **CORS:** Configurabil prin `Cors:AllowAnyOrigin` (activ în Development).
* **Swagger:** Disponibil în mediul Development.
