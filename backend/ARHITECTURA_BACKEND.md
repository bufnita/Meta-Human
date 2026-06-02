# Arhitectura și Implementarea Backend-ului (ASP.NET Core)
**Proiect:** MetaHuman - Sistem portabil de supraveghere a stării de sănătate
**Tehnologie:** C# / ASP.NET Core 8.0
**Mediul de execuție:** Container LXC (Linux) în rețeaua internă privată

## 1. Rolul și Responsabilitățile Backend-ului
Conform deciziilor de arhitectură, backend-ul este **nucleul logic al aplicației** (componenta centrală) și funcționează ca un API REST *stateless*.

Responsabilitățile sale principale sunt:
* **Validarea și procesarea datelor:** Preia măsurătorile și capturile ECG trimise de aplicația mobilă în format JSON și le validează.
* **Acces exclusiv la baza de date:** Este singura componentă din întregul sistem care are permisiunea să interogheze și să modifice datele din PostgreSQL (prin TCP/IP și SQL).
* **Generarea alertelor:** Compară valorile măsurate cu pragurile configurate de medic și generează alerte când o abatere persistă durata minimă configurată.
* **Autentificare și Autorizare:** Gestionează accesul utilizatorilor pe bază de roluri (**Admin**, **Medic**, **Pacient**) utilizând tokenuri JWT.
* **Deservirea interfeței web:** Furnizează date agregate (grafice, istoric, rapoarte) către frontend-ul Vue.js.

## 2. Organizarea Internă a Codului în C#

### Convenții de implementare
Fluxul standard este **Controller → Service → DTO**:

1. **Controller** — primește HTTP, validează model binding, aplică policy JWT, traduce excepțiile în coduri HTTP.
2. **Service** — conține logica de business, verifică accesul la resurse (medic/pacient), interacționează cu EF Core.
3. **DTO** — formatele JSON de intrare/ieșire; entitățile EF nu sunt expuse direct în API.

### Straturi

| Strat | Rol | Exemple |
| :--- | :--- | :--- |
| **Controllers** | Endpoints REST | `AuthController`, `MediciController`, `PacientiController`, `AlerteController`, `MasuratoriController` |
| **Services** | Logică reutilizabilă | `JwtService`, `MedicService`, `PacientService`, `MasuratoareService`, `AlertService`, `PragAlertaService`, `EcgService`, `RecomandareService` |
| **Helpers** | Acces la context HTTP / claims JWT | `IUtilizatorCurentAccessor`, `UtilizatorCurentAccessor`, `IdentitateClinicalaResolver` |
| **Exceptions** | Erori de domeniu traduse în HTTP | `AccesInterzisException` (403), `ResursaNegasitaException` (404) |
| **DTOs** | Contract JSON | `CerereAutentificareDTO`, `CerereMedicDTO`, `CererePacientDTO`, `CerereMasuratoareDTO`, `CererePragAlertaDTO`, `CerereRecomandareDTO`, `CerereEcgDTO`, etc. |
| **Models** | Entități EF + `MetaHumanContext` | `Utilizator`, `Medic`, `Pacient`, `Masuratoare`, `PragAlerta`, `Alerta`, `Recomandare`, `Ecg` |
| **Enum roluri** | `RolUtilizator` | `Admin`, `Medic`, `Pacient` — conversie DB prin `RolUtilizatorExtensions` (`ToDbValue`, `TryFromDbValue`) |

### Planificat (neimplementat)
* **`DispozitivAsociat`** — legătura dispozitiv mobil ↔ pacient.
* **`SesiuneAutentificare`** — amânat (JWT rămâne stateless).
* **`POST /api/auth/inregistrare`** — **nu se va implementa** (fără self-registration).
* **Strat Repository** — opțional, dacă complexitatea crește.

### Creare conturi (fără înregistrare publică)

Nu există endpoint de înregistrare. Conturile se creează ierarhic:

| Cine creează | Ce creează | Cum |
| :--- | :--- | :--- |
| **Seed manual DB** | Admin (unic) | Insert în `utilizator` cu `rol = Admin` |
| **Admin** | Medic | `POST /api/medici` — `Utilizator` + `Medic` |
| **Medic** | Pacient (+ login) | `POST /api/pacienti` — `Utilizator` + `Pacient`; `IdMedic` din JWT |
| **Admin** | Pacient (+ login) | `POST /api/pacienti` — trebuie `idMedic` în body |

La creare pacient, `CererePacientDTO` cere `email` și `parola` (cont login). Dezactivarea (`DELETE` fără `/definitiv`) păstrează legătura `IdMedic`; nu dezalocă pacientul. Pentru ca un medic să nu mai aibă pacienți legați: Admin **reatribuie** (`PUT` cu alt `IdMedic`) sau **șterge definitiv** pacienții. Ștergerea definitivă a unui medic e permisă doar dacă nu există niciun rând în `Pacient` cu acel `IdMedic` (inclusiv pacienți dezactivați).

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
* **Cerere:** `CerereAutentificareDTO` — `email`, `parola`.
* **Răspuns:** `RaspunsAutentificareDTO` — `email`, `token`, `rol`, `nume`, `prenume`.
* **Flux:** validare DTO → verificare BCrypt + cont activ → validare rol → profil Medic/Pacient → JWT cu claim `role`.

### Policy-uri de autorizare

| Policy | Rol(uri) | Utilizare |
| :--- | :--- | :--- |
| `Admin` | Admin | CRUD medici |
| `Medic` | Medic | Alerte globale, rezolvare/ignorare |
| `Pacient` | Pacient | Trimitere măsurători și ECG |
| `MedicOrAdmin` | Medic sau Admin | Gestionare pacienți și sub-resurse |

Endpoint-urile protejate necesită header: `Authorization: Bearer {token}`.

### Reguli de acces la date
* **Medic** vede doar pacienții alocați lui (`Pacient.IdMedic`).
* **Admin** vede toți pacienții; la creare pacient trebuie să trimită `IdMedic` în body.
* **Medic** la creare pacient primește automat `IdMedic` din JWT (ignoră câmpul din body).
* **Pacient** poate trimite măsurători doar pentru propriul profil (identificat din JWT) și poate citi istoricul propriu via `GET /api/masuratori/istoric`.

## 4. Rute și Endpoint-uri API

Rutele sunt REST pe resurse; **rolul se verifică prin JWT**, nu prin prefix în URL.
HTTPS este terminat la **Nginx**; backend-ul ascultă intern pe HTTP (vezi secțiunea 7).

### Autentificare
| Metodă | Rută | Autorizare |
| :--- | :--- | :--- |
| POST | `/api/auth/login` | Public |

### Medici (Admin)
| Metodă | Rută | Descriere |
| :--- | :--- | :--- |
| GET | `/api/medici` | Lista medicilor |
| GET | `/api/medici/{id}` | Detaliu medic |
| POST | `/api/medici` | Creare medic (+ cont Utilizator) |
| PUT | `/api/medici/{id}` | Actualizare medic |
| DELETE | `/api/medici/{id}` | Dezactivare cont medic |
| DELETE | `/api/medici/{id}/definitiv` | Ștergere definitivă medic (Admin; fără pacienți legați) |

### Pacienți (Medic sau Admin)
| Metodă | Rută | Descriere |
| :--- | :--- | :--- |
| GET | `/api/pacienti` | Lista pacienților (filtrată pentru Medic) |
| GET | `/api/pacienti/{id}` | Detaliu pacient (DTO) |
| POST | `/api/pacienti` | Creare pacient + cont Utilizator (email, parolă) |
| PUT | `/api/pacienti/{id}` | Actualizare pacient (Admin poate reatribui `IdMedic`) |
| DELETE | `/api/pacienti/{id}` | Dezactivare pacient + cont (Medic: proprii; Admin: orice) |
| DELETE | `/api/pacienti/{id}/definitiv` | Ștergere definitivă din DB (doar Admin) |
| GET | `/api/pacienti/{id}/istoric` | Istoric măsurători |
| GET | `/api/pacienti/{id}/alarme` | Alerte pentru pacient |
| GET | `/api/pacienti/{id}/praguri` | Praguri alertă configurate |
| POST | `/api/pacienti/{id}/praguri` | Configurare prag alertă |
| GET | `/api/pacienti/{id}/recomandari` | Recomandări active/istorice |
| POST | `/api/pacienti/{id}/recomandari` | Creare recomandare |

### Alerte globale (Medic)
| Metodă | Rută | Descriere |
| :--- | :--- | :--- |
| GET | `/api/alerte` | Toate alertele medicului curent |
| GET | `/api/alerte/active` | Alerte active |
| PUT | `/api/alerte/{id}/rezolva` | Marchează alertă rezolvată |
| PUT | `/api/alerte/{id}/ignora` | Marchează alertă ignorată |

### Achiziție date — aplicație mobilă (Pacient)
| Metodă | Rută | Descriere |
| :--- | :--- | :--- |
| POST | `/api/masuratori` | Salvare măsurătoare (+ evaluare alerte) |
| POST | `/api/masuratori/ecg` | Salvare captură ECG |
| GET | `/api/masuratori/istoric` | Istoric măsurători proprii (Pacient, JWT); query `ultimele` (default 100) |

## 5. Standardizarea Răspunsurilor și a Erorilor

| Cod HTTP | Semnificație | Situație tipică |
| :--- | :--- | :--- |
| **200 OK** | Succes | Citire, actualizare, login |
| **201 Created** | Resursă creată | Pacient, măsurătoare, prag, recomandare |
| **400 Bad Request** | Cerere invalidă | Validare DTO eșuată |
| **401 Unauthorized** | Neautorizat | Lipsă/expirat JWT, credențiale greșite |
| **403 Forbidden** | Acces interzis | Rol incorect sau resursă altui medic |
| **404 Not Found** | Inexistent | ID invalid |
| **500 Internal Server Error** | Eroare internă | Excepție neprinsă, eroare DB |

## 6. Fluxul Datelor (Exemplu: Salvare Măsurătoare)

1. Aplicația mobilă trimite `POST /api/masuratori` cu `CerereMasuratoareDTO`.
2. Backend validează JWT (rol **Pacient**) și identifică pacientul din token.
3. `MasuratoareService` salvează în tabelul `Masuratoare`.
4. `AlertService` evaluează pragurile active (`PragAlerta`) și istoricul recent.
5. Dacă abaterea persistă peste durata minimă, se inserează o înregistrare în `Alerta`.
6. Răspuns **201 Created** cu `RaspunsMasuratoareDTO`.

## 7. Infrastructură și Mediu

* **Ascultare internă:** `http://0.0.0.0:5000` — fără TLS în container; expus doar în rețeaua internă.
* **Nginx (reverse proxy):** termină HTTPS, forward către backend; setează `X-Forwarded-For` și `X-Forwarded-Proto`.
* **Forwarded headers:** Configurate în `Program.cs` pentru a reconstrui scheme/host corect.
* **CORS:** Configurabil prin `Cors:AllowAnyOrigin` (activ în Development).
* **Swagger:** Disponibil în mediul Development.
