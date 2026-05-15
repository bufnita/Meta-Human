# Arhitectura și Implementarea Backend-ului (ASP.NET Core)
**Proiect:** MetaHuman - Sistem portabil de supraveghere a stării de sănătate
**Tehnologie:** C# / ASP.NET Core 8.0
**Mediul de execuție:** Container LXC (Linux) în rețeaua internă privată

## 1. Rolul și Responsabilitățile Backend-ului
Conform deciziilor de arhitectură, backend-ul este **nucleul logic al aplicației** (componenta centrală) și funcționează ca un API REST *stateless* 

Responsabilitățile sale principale sunt:
* **Validarea și procesarea datelor:** Preia măsurătorile și capturile ECG trimise de aplicația mobilă în format JSON și le validează.
* **Acces exclusiv la baza de date:** Este singura componentă din întregul sistem care are permisiunea să interogheze și să modifice datele din PostgreSQL (prin TCP/IP și SQL).
* **Generarea alertelor:** Conține logica de business pentru compararea valorilor măsurate cu pragurile configurate de medic și generează alerte dacă o abatere persistă o anumită durată de timp configurabilă.
* **Autentificare și Autorizare:** Gestionează sesiunile utilizatorilor (pe bază de roluri: Medic sau Pacient) utilizând tokenuri (JWT).
* **Deservirea interfeței web:** Furnizează date agregate (grafice, istoric, rapoarte) către frontend-ul Vue.js utilizat de medici.

## 2. Organizarea Internă a Codului în C#
Pentru ca responsabilitățile să fie separate și codul să rămână ușor de întreținut, proiectarea internă a backend-ului se împarte logic în următoarele straturi:

* **Controlere (Controllers):** Punctele finale (endpoints) care expun API-ul REST, interceptează cererile HTTP venite de la Nginx și returnează răspunsurile HTTP adecvate.
* **Servicii de Business (Services):** Clasele C# care conțin logica medicală și de aplicație (ex. `AlertService.cs` care calculează dacă o depășire de temperatură necesită declanșarea unei alerte).
* **Modele de Transfer de Date (DTOs):** Obiecte C# simplificate folosite pentru a primi sau trimite date JSON (ex. `MasuratoareDTO`), evitând expunerea directă a structurii bazei de date.
* **Componenta de Acces la Date (Data Access / Repositories):** Clasele care comunică cu PostgreSQL (folosind Entity Framework Core), mapând tabelele din baza de date (ex. `Pacient`, `Masuratoare`, `Alerta`) în entități C#.

## 3. Rute și Endpoint-uri API (Exemple)
Backend-ul expune o serie de rute API securizate (HTTPS intermediat de Nginx). Iată organizarea propusă a acestor endpoint-uri:

### Autentificare
* `POST /api/autentificare/login-medic` - Autentificarea medicului.
* `POST /api/autentificare/login-pacient` - Autentificarea pacientului.

### Gestionarea Pacienților (Accesibil Medicilor)
* `GET /api/pacienti` - Încărcarea listei de pacienți.
* `GET /api/pacienti/{id}` - Încărcarea fișei detaliate a pacientului.
* `GET /api/pacienti/{id}/istoric` - Solicitarea istoricului de măsurători.
* `GET /api/pacienti/{id}/alerte` - Solicitarea istoricului de alerte.

### Configurare și Recomandări
* `POST /api/pacienti/{id}/praguri` - Configurarea limitelor normale (valoare minimă/maximă și durata de persistență).
* `POST /api/pacienti/{id}/recomandari` - Salvarea unei noi recomandări (ex. activitate fizică, dietă).

### Achiziție Date (Accesibil Aplicației Mobile)
* `POST /api/masuratori` - Primirea și salvarea unei măsurători simple (ex. temperatură, puls).
* `POST /api/masuratori/ecg` - Primirea unei capturi ECG sub formă de secvență de valori.

## 4. Standardizarea Răspunsurilor și a Erorilor
Pentru a asigura o comunicare clară cu aplicația mobilă și interfața web, backend-ul C# trebuie să returneze răspunsuri standardizate bazate pe coduri de stare HTTP:

| Cod HTTP | Semnificație | Situație Tipică de Utilizare |
| :--- | :--- | :--- |
| **200 OK** | Operație reușită | Citirea datelor (ex: încărcarea istoricului pacientului). |
| **201 Created** | Resursă creată | Inserarea unei noi măsurători, alerte sau recomandări. |
| **400 Bad Request** | Cerere invalidă | JSON malformat, structură greșită sau date incomplete trimise de aplicația mobilă. |
| **401 Unauthorized** | Neautorizat | Lipsa tokenului JWT sau token expirat/invalid. |
| **403 Forbidden** | Acces interzis | Medicul încearcă să acceseze fișa unui pacient care nu îi este asociat. |
| **404 Not Found** | Resursă inexistentă | ID-ul pacientului căutat nu există în baza de date. |
| **500 Internal Server Error** | Eroare internă | Căderea conexiunii TCP cu PostgreSQL sau o excepție neprinsă în codul C#. |

## 5. Fluxul Datelor (Exemplu: Salvare Măsurătoare)
Atunci când un modul inteligent transmite o temperatură anormală, backend-ul va executa următorul flux:
1. Primește un `POST /api/masuratori` cu obiectul JSON de la aplicația mobilă.
2. Validează integritatea datelor și identitatea pacientului (Autentificare JWT).
3. Salvează valoarea curentă în tabelul `Masuratoare` din PostgreSQL.
4. Citește din tabelul `PragAlerta` limitele normale și durata de persistență configurate de medic.
5. Compară valoarea curentă cu pragurile. Dacă există o depășire, interoghează istoricul recent.
6. Dacă abaterea se menține peste durata minimă configurată (ex. 30 secunde), backend-ul inserează o nouă înregistrare în tabelul `Alerta`.
7. Returnează codul `201 Created` înapoi către aplicația mobilă.