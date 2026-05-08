-- =====================================================================
-- Baza de date: MetaHuman
-- Strat de persistență: PostgreSQL (Container LXC 3)
-- =====================================================================

-- 1. TABELUL UTILIZATOR
CREATE TABLE Utilizator (
    id_utilizator SERIAL PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    hash_parola VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL,
    activ BOOLEAN NOT NULL,
    data_creare TIMESTAMP NOT NULL
);

-- 2. TABELUL MEDIC
CREATE TABLE Medic (
    id_medic SERIAL PRIMARY KEY,
    id_utilizator INTEGER UNIQUE REFERENCES Utilizator(id_utilizator),
    nume VARCHAR(100) NOT NULL,
    prenume VARCHAR(100) NOT NULL,
    specializare VARCHAR(100),
    telefon VARCHAR(20)
);

-- 3. TABELUL PACIENT
CREATE TABLE Pacient (
    id_pacient SERIAL PRIMARY KEY,
    id_utilizator INTEGER UNIQUE REFERENCES Utilizator(id_utilizator),
    id_medic INTEGER NOT NULL REFERENCES Medic(id_medic),
    nume VARCHAR(100) NOT NULL,
    prenume VARCHAR(100) NOT NULL,
    varsta INTEGER CHECK (varsta > 0),
    cnp VARCHAR(13) UNIQUE,
    adresa VARCHAR(255),
    telefon VARCHAR(20),
    email VARCHAR(150),
    profesie VARCHAR(100),
    loc_munca VARCHAR(150),
    istoric_medical TEXT,
    alergii TEXT,
    consultatii_cardiologice TEXT,
    activ BOOLEAN NOT NULL
);

-- 4. TABELUL DISPOZITIV ASOCIAT
CREATE TABLE DispozitivAsociat (
    id_dispozitiv SERIAL PRIMARY KEY,
    id_pacient INTEGER NOT NULL REFERENCES Pacient(id_pacient),
    identificator VARCHAR(100) NOT NULL UNIQUE,
    tip_dispozitiv VARCHAR(50) NOT NULL,
    stare_asociere VARCHAR(20) NOT NULL,
    versiune_firmware VARCHAR(50),
    data_asociere TIMESTAMP NOT NULL
);

-- 5. TABELUL PRAG ALERTA
CREATE TABLE PragAlerta (
    id_prag SERIAL PRIMARY KEY,
    id_pacient INTEGER NOT NULL REFERENCES Pacient(id_pacient),
    id_medic INTEGER NOT NULL REFERENCES Medic(id_medic),
    tip_parametru VARCHAR(30) NOT NULL,
    valoare_minima NUMERIC,
    valoare_maxima NUMERIC,
    durata_persistenta_sec INTEGER NOT NULL,
    activ BOOLEAN NOT NULL
);

-- 6. TABELUL MASURATOARE
CREATE TABLE Masuratoare (
    id_masuratoare SERIAL PRIMARY KEY,
    id_pacient INTEGER NOT NULL REFERENCES Pacient(id_pacient),
    tip_parametru VARCHAR(30) NOT NULL,
    valoare NUMERIC NOT NULL,
    unitate_masura VARCHAR(20) NOT NULL,
    data_ora TIMESTAMP NOT NULL,
    stare VARCHAR(20) NOT NULL,
    sursa VARCHAR(30) NOT NULL,
    observatii VARCHAR(255)
);

-- 7. TABELUL INREGISTRARE ECG
CREATE TABLE InregistrareECG (
    id_inregistrare_ecg SERIAL PRIMARY KEY,
    id_pacient INTEGER NOT NULL REFERENCES Pacient(id_pacient),
    secventa_valori TEXT NOT NULL,
    frecventa_esantionare INTEGER,
    durata_capturii_sec INTEGER NOT NULL,
    data_ora TIMESTAMP NOT NULL,
    observatii TEXT,
    stare_validare VARCHAR(20) NOT NULL
);

-- 8. TABELUL RECOMANDARE
CREATE TABLE Recomandare (
    id_recomandare SERIAL PRIMARY KEY,
    id_pacient INTEGER NOT NULL REFERENCES Pacient(id_pacient),
    id_medic INTEGER NOT NULL REFERENCES Medic(id_medic),
    tip_activitate VARCHAR(100) NOT NULL,
    durata_zilnica VARCHAR(50),
    alte_indicatii TEXT,
    data_inceput DATE NOT NULL,
    data_sfarsit DATE,
    stare VARCHAR(20) NOT NULL
);

-- 9. TABELUL ALERTA
CREATE TABLE Alerta (
    id_alerta SERIAL PRIMARY KEY,
    id_pacient INTEGER NOT NULL REFERENCES Pacient(id_pacient),
    id_medic INTEGER NOT NULL REFERENCES Medic(id_medic),
    tip_alerta VARCHAR(30) NOT NULL,
    parametru_asociat VARCHAR(30) NOT NULL,
    prag_minim NUMERIC,
    prag_maxim NUMERIC,
    valoare_constatata NUMERIC NOT NULL,
    data_ora TIMESTAMP NOT NULL,
    durata_persistenta_sec INTEGER NOT NULL,
    mesaj VARCHAR(255) NOT NULL,
    stare VARCHAR(20) NOT NULL
);

-- 10. TABELUL SESIUNE AUTENTIFICARE
CREATE TABLE SesiuneAutentificare (
    id_sesiune SERIAL PRIMARY KEY,
    id_utilizator INTEGER NOT NULL REFERENCES Utilizator(id_utilizator),
    token_reimprospatare VARCHAR(255) NOT NULL UNIQUE,
    expira_la TIMESTAMP NOT NULL,
    revocat BOOLEAN NOT NULL,
    data_creare TIMESTAMP NOT NULL
);

-- =====================================================================
-- CREARE INDECȘI PENTRU PERFORMANȚĂ
-- =====================================================================
CREATE INDEX idx_utilizator_email ON Utilizator(email);
CREATE INDEX idx_pacient_id_medic ON Pacient(id_medic);
CREATE INDEX idx_masuratoare_pacient_data ON Masuratoare(id_pacient, data_ora);
CREATE INDEX idx_alerta_pacient_data ON Alerta(id_pacient, data_ora);
CREATE INDEX idx_pragalerta_pacient_param ON PragAlerta(id_pacient, tip_parametru);