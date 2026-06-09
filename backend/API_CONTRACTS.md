# Contracte API — MetaHuman Backend

Referință pentru toate rutele REST: ce face fiecare, cine o poate apela, ce JSON trimiți și ce primești.

## Convenții generale

| Aspect | Regulă |
|--------|--------|
| **Format JSON** | camelCase (`idMedic`, `email`, `tipParametru`) |
| **Autentificare** | Header `Authorization: Bearer {token}` (JWT de la login) |
| **Erori** | `{ "mesaj": "..." }` — 400, 403, 404 |
| **Ștergere reușită** | `204 No Content` (fără body) |
| **Login eșuat** | `401 Unauthorized` (fără body) |
| **Parole** | Se trimit la creare; **nu** apar niciodată în răspuns |

### Roluri

| Rol | Descriere scurtă |
|-----|------------------|
| **Admin** | Gestionează medici; vede/editează/șterge orice pacient |
| **Medic** | Gestionează proprii pacienți; alerte globale |
| **Pacient** | Trimite măsurători/ECG; își vede propriul istoric |

### Status cont: dezactivare, reactivare, ștergere

| Acțiune | Rută | Efect |
|---------|------|--------|
| **Dezactivare** | `PATCH .../dezactivare` | Cont oprit (`Activ = false`), date păstrate, legătura medic–pacient **rămâne** |
| **Reactivare** | `PATCH .../activare` | Cont repornit (`Activ = true`) |
| **Ștergere** | `DELETE /api/pacienti\|medici/{id}` | Tot șters din DB — **doar Admin** |
| **Reatribuire medic** | `PUT /api/pacienti/{id}` cu alt `idMedic` | Admin reatribuie pacientul |
| **Ștergere medic** | Posibilă doar dacă **zero** pacienți (inclusiv dezactivați) |

Lista pacienților/medici: **activi** întâi (A→Z după nume), apoi **inactivi** (A→Z).

---

## Autentificare

### `POST /api/auth/login`

**Ce face:** Verifică email + parolă. Dacă contul e activ, returnează un token JWT pentru restul apelurilor.

**Cine:** Oricine (fără token).

**Trimite:**
```json
{
  "email": "medic@example.com",
  "parola": "parola123"
}
```

**Primești (200):**
```json
{
  "email": "medic@example.com",
  "token": "eyJhbG...",
  "rol": "Medic",
  "nume": "Popescu",
  "prenume": "Ion"
}
```

`rol` poate fi `"Admin"`, `"Medic"` sau `"Pacient"`.

---

## Medici — doar Admin

Toate rutele de mai jos necesită JWT cu rol **Admin**.

### `GET /api/medici`

**Ce face:** Listează toți medicii din sistem.

**Trimite:** —

**Primești (200):**
```json
[
  {
    "idMedic": 1,
    "nume": "Popescu",
    "prenume": "Ion",
    "email": "medic@example.com",
    "specializare": "Cardiologie",
    "telefon": "0712345678"
  }
]
```

### `GET /api/medici/{id}`

**Ce face:** Detaliile unui singur medic, după ID.

**Trimite:** —

**Primești (200):** același obiect ca un element din listă. ID inexistent → **404**.

### `POST /api/medici`

**Ce face:** Creează medic nou **și** contul lui de login. Parola se salvează hash-uită în DB; nu se returnează în răspuns.

**Trimite:**
```json
{
  "nume": "Popescu",
  "prenume": "Ion",
  "email": "medic@example.com",
  "parola": "parola123",
  "specializare": "Cardiologie",
  "telefon": "0712345678"
}
```

**Primești (201):**
```json
{
  "idMedic": 1,
  "nume": "Popescu",
  "prenume": "Ion",
  "email": "medic@example.com",
  "specializare": "Cardiologie",
  "telefon": "0712345678"
}
```

Email duplicat → **400**.

### `PUT /api/medici/{id}`

**Ce face:** Actualizează datele medicului (nume, specializare, telefon). **Nu** schimbă email-ul sau parola.

**Trimite:**
```json
{
  "nume": "Popescu",
  "prenume": "Ion",
  "specializare": "Cardiologie",
  "telefon": "0712345678"
}
```

**Primești (200):** medicul actualizat (`RaspunsMedicDTO`).

### `PATCH /api/medici/{id}/dezactivare`

**Ce face:** Dezactivează medicul. Contul devine inactiv — nu se mai poate loga. Rândul medic rămâne în DB; pacienții **rămân legați** de el.

**Trimite:** —

**Primești:** **204** (fără body).

### `PATCH /api/medici/{id}/activare`

**Ce face:** Reactivează medicul (`Utilizator.Activ = true`).

**Trimite:** —

**Primești:** **204** sau **400** (deja activ) / **404**.

### `DELETE /api/medici/{id}`

**Ce face:** **Șterge definitiv** medicul din baza de date (cont, sesiuni, alerte/recomandări/praguri orfane ale medicului).

**Condiție:** Nu poate avea **niciun pacient** cu acel `idMedic` (nici dezactivați). Dacă are → **400**.

**Trimite:** —

**Primești:** **204** sau **400** / **404**.

---

## Pacienți — Medic sau Admin

Toate rutele necesită JWT cu rol **Medic** sau **Admin**, exceptând `DELETE` (ștergere definitivă — doar Admin).

### `GET /api/pacienti`

**Ce face:** Listează pacienții.

- **Medic:** doar pacienții **lui** (`idMedic` = medicul logat).
- **Admin:** **toți** pacienții (activi și inactivi).

**Trimite:** —

**Primești (200):**
```json
[
  {
    "idPacient": 5,
    "idMedic": 1,
    "nume": "Ionescu",
    "prenume": "Maria",
    "varsta": 45,
    "cnp": "1234567890123",
    "telefon": "0722123456",
    "email": "maria@example.com",
    "activ": true
  }
]
```

### `GET /api/pacienti/{id}`

**Ce face:** Detalii complete despre un pacient.

- **Medic:** doar dacă pacientul e al lui.
- **Admin:** orice pacient.

**Trimite:** —

**Primești (200):**
```json
{
  "idPacient": 5,
  "idMedic": 1,
  "nume": "Ionescu",
  "prenume": "Maria",
  "varsta": 45,
  "cnp": "1234567890123",
  "adresa": "Str. Exemplu 1",
  "telefon": "0722123456",
  "email": "maria@example.com",
  "profesie": "Inginer",
  "locMunca": "UPT",
  "istoricMedical": null,
  "alergii": null,
  "consultatiiCardiologice": null,
  "activ": true
}
```

### `POST /api/pacienti`

**Ce face:** Creează pacient nou **și** cont de login (email + parolă). Pacientul e alocat unui medic.

- **Medic:** pacientul e alocat **automat** medicului logat (`idMedic` din body e ignorat).
- **Admin:** trebuie să trimită `idMedic` în body.

**Trimite:**
```json
{
  "idMedic": 1,
  "nume": "Ionescu",
  "prenume": "Maria",
  "varsta": 45,
  "cnp": "1234567890123",
  "adresa": "Str. Exemplu 1",
  "telefon": "0722123456",
  "email": "maria@example.com",
  "parola": "parola123",
  "profesie": "Inginer",
  "locMunca": "UPT"
}
```

**Primești (201):** pacientul creat (format scurt, ca în listă). Parola min. 6 caractere; email unic.

### `PUT /api/pacienti/{id}`

**Ce face:** Actualizează datele pacientului. **Nu** schimbă parola.

- **Medic:** doar pacienții lui.
- **Admin:** orice pacient; poate **reatribui medicul** trimițând `"idMedic": 2`.

**Trimite:** același body ca la POST, **fără** `parola`.

**Primești (200):** pacient actualizat (`RaspunsPacientDTO`).

### `PATCH /api/pacienti/{id}/dezactivare`

**Ce face:** Dezactivează pacientul. Pacientul + contul devin inactive. **Medicul rămâne același** (`idMedic` nu se schimbă).

- **Medic:** doar pacienții lui.
- **Admin:** orice pacient.

**Trimite:** —

**Primești:** **204**.

### `PATCH /api/pacienti/{id}/activare`

**Ce face:** Reactivează pacientul (`Pacient.Activ` + `Utilizator.Activ = true`).

- **Medic:** doar pacienții lui.
- **Admin:** orice pacient.

**Trimite:** —

**Primești:** **204** sau **400** (deja activ) / **404**.

### `DELETE /api/pacienti/{id}`

**Ce face:** **Șterge definitiv** pacientul din DB: măsurători, ECG, alerte, praguri, recomandări, dispozitive, cont login — tot ce ține de el.

**Cine:** **Doar Admin**.

**Trimite:** —

**Primești:** **204** sau **403** / **404**.

### `GET /api/pacienti/{id}/istoric?ultimele=100`

**Ce face:** Ultimele N măsurători ale pacientului (cele mai recente prime).

**Cine:** Medic/Admin cu acces la acel pacient.

**Trimite:** — (query opțional `ultimele`, default 100)

**Primești (200):**
```json
{
  "idPacient": 5,
  "masuratori": [
    {
      "idMasuratoare": 10,
      "idPacient": 5,
      "tipParametru": "Puls",
      "valoare": 72,
      "unitateMasura": "bpm",
      "dataOra": "2026-05-30T10:00:00Z",
      "stare": "Prelucrat"
    }
  ]
}
```

### `GET /api/pacienti/{id}/alarme`

**Ce face:** Toate alertele generate pentru acel pacient (active, rezolvate, ignorate).

**Trimite:** —

**Primești (200):**
```json
[
  {
    "idAlerta": 1,
    "idPacient": 5,
    "pacientNume": "Ionescu",
    "pacientPrenume": "Maria",
    "tipAlerta": "DepasirePrag",
    "parametruAsociat": "Puls",
    "pragMinim": 60,
    "pragMaxim": 100,
    "valoareConstatata": 110,
    "dataOra": "2026-05-30T10:00:00Z",
    "durataPersistentaSec": 120,
    "mesaj": "Puls peste prag maxim.",
    "stare": "Activă"
  }
]
```

### `GET /api/pacienti/{id}/praguri`

**Ce face:** Pragurile de alertă configurate pentru pacient (ex. puls 60–100 timp de 2 minute).

**Trimite:** —

**Primești (200):**
```json
[
  {
    "idPrag": 1,
    "idPacient": 5,
    "tipParametru": "Puls",
    "valoareMinima": 60,
    "valoareMaxima": 100,
    "durataPersistentaSec": 120,
    "activ": true
  }
]
```

### `POST /api/pacienti/{id}/praguri`

**Ce face:** Adaugă un **prag nou** de alertă. Când măsurătorile depășesc pragul suficient de mult, se generează alerte automat.

**Trimite:**
```json
{
  "tipParametru": "Puls",
  "valoareMinima": 60,
  "valoareMaxima": 100,
  "durataPersistentaSec": 120,
  "activ": true
}
```

**Primești (201):** pragul creat (`RaspunsPragAlertaDTO`).

### `PUT /api/pacienti/{id}/praguri/{idPrag}`

**Ce face:** Actualizează un prag de alertă existent al pacientului.

**Cine:** Medicul responsabil sau Admin.

**Trimite:** același body ca la `POST /api/pacienti/{id}/praguri`.

**Primești (200):** pragul actualizat (`RaspunsPragAlertaDTO`).

### `DELETE /api/pacienti/{id}/praguri/{idPrag}`

**Ce face:** Șterge definitiv pragul de alertă selectat.

**Cine:** Medicul responsabil sau Admin.

**Primești:** **204** (fără body).

### `GET /api/pacienti/{id}/recomandari`

**Ce face:** Recomandările medicului pentru pacient (activitate, durată, perioadă).

**Trimite:** —

**Primești (200):**
```json
[
  {
    "idRecomandare": 1,
    "idPacient": 5,
    "tipActivitate": "Mers",
    "durataZilnica": "30 min",
    "alteIndicatii": "Evita efortul intens.",
    "dataInceput": "2026-05-30",
    "dataSfarsit": "2026-06-30",
    "stare": "Activa"
  }
]
```

### `POST /api/pacienti/{id}/recomandari`

**Ce face:** Adaugă o recomandare nouă pentru pacient (ex. „mers 30 min/zi”).

**Trimite:**
```json
{
  "tipActivitate": "Mers",
  "durataZilnica": "30 min",
  "alteIndicatii": "Evita efortul intens.",
  "dataInceput": "2026-05-30",
  "dataSfarsit": "2026-06-30"
}
```

**Primești (201):** recomandarea creată (`RaspunsRecomandareDTO`).

### `PUT /api/pacienti/{id}/recomandari/{idRecomandare}`

**Ce face:** Actualizează o recomandare existentă a pacientului.

**Cine:** Medicul responsabil sau Admin.

**Trimite:** același body ca la `POST /api/pacienti/{id}/recomandari`.

**Primești (200):** recomandarea actualizată (`RaspunsRecomandareDTO`).

### `DELETE /api/pacienti/{id}/recomandari/{idRecomandare}`

**Ce face:** Șterge definitiv recomandarea selectată.

**Cine:** Medicul responsabil sau Admin.

**Primești:** **204** (fără body).

---

## Alerte globale — doar Medic

> **Notă:** Admin **nu** are acces la aceste rute (policy `"Medic"`).

### `GET /api/alerte`

**Ce face:** Toate alertele medicului logat (de la toți pacienții lui), indiferent de stare.

**Trimite:** —

**Primești (200):** array `RaspunsAlertaDTO` (vezi exemplu la `GET /api/pacienti/{id}/alarme`).

### `GET /api/alerte/active`

**Ce face:** Doar alertele **active** (nerezolvate, neignorate) ale medicului logat.

**Trimite:** —

**Primești (200):** array filtrat (stare `"Activă"`).

### `PUT /api/alerte/{id}/rezolva`

**Ce face:** Marchează o alertă ca **rezolvată** (medicul a tratat situația).

**Trimite:** — (fără body)

**Primești (200):** alerta actualizată (stare `"Rezolvată"`). Doar alertele **proprii** medicului.

### `PUT /api/alerte/{id}/ignora`

**Ce face:** Marchează o alertă ca **ignorată** (medicul a decis să nu o trateze).

**Trimite:** —

**Primești (200):** alerta actualizată (stare `"Ignorată"`).

---

## Măsurători — doar Pacient

Toate rutele necesită JWT cu rol **Pacient**.

### `POST /api/masuratori`

**Ce face:** Pacientul trimite o măsurătoare de la dispozitiv. Backend o salvează și **verifică automat** dacă trebuie generată o alertă.

**Condiție:** `idPacient` din body trebuie să fie **exact** pacientul logat.

**Trimite:**
```json
{
  "idPacient": 5,
  "tipParametru": "Puls",
  "valoare": 72,
  "unitate": "bpm",
  "dataOra": "2026-05-30T10:00:00Z",
  "sursa": "Dispozitiv",
  "observatii": null
}
```

**Primești (201):**
```json
{
  "idMasuratoare": 10,
  "idPacient": 5,
  "tipParametru": "Puls",
  "valoare": 72,
  "unitateMasura": "bpm",
  "dataOra": "2026-05-30T10:00:00Z",
  "stare": "Prelucrat"
}
```

### `POST /api/masuratori/ecg`

**Ce face:** Pacientul trimite o înregistrare ECG. Se salvează cu starea `"InAsteptare"` (validare ulterioară).

**Condiție:** `idPacient` = pacientul logat.

**Trimite:**
```json
{
  "idPacient": 5,
  "secventaValori": "1,2,3,4,5",
  "frecventaEsantionare": 250,
  "durataCapturiiSec": 30,
  "observatii": null
}
```

**Primești (201):**
```json
{
  "idInregistrareEcg": 1,
  "idPacient": 5,
  "dataOra": "2026-05-30T10:00:00Z",
  "stareValidare": "InAsteptare"
}
```

### `GET /api/masuratori/istoric?ultimele=100`

**Ce face:** Pacientul își vede **propriul** istoric de măsurători (ID-ul vine din JWT, nu din URL).

**Trimite:** — (query opțional `ultimele`, default 100)

**Primești (200):** același format ca `GET /api/pacienti/{id}/istoric`.

---

## Coduri HTTP — rezumat

| Cod | Semnificație |
|-----|--------------|
| **200** | Succes (citire, actualizare, login) |
| **201** | Resursă creată |
| **204** | Succes fără body (dezactivare, ștergere definitivă) |
| **400** | Cerere invalidă (validare, reguli business) |
| **401** | Neautorizat (JWT lipsă/expirat, credențiale greșite) |
| **403** | Acces interzis (rol incorect sau resursă altui medic) |
| **404** | Resursă inexistentă |

---

## Creare conturi (fără înregistrare publică)

Nu există `POST /api/auth/inregistrare`. Conturile se creează ierarhic:

| Cine | Ce creează | Cum |
|------|------------|-----|
| **Seed DB** | Admin (unic) | Insert manual în `utilizator` |
| **Admin** | Medic | `POST /api/medici` |
| **Medic / Admin** | Pacient (+ login) | `POST /api/pacienti` |

---

## Swagger

În mediul **Development**, documentația interactivă e disponibilă la:

`http://localhost:5000/swagger`
