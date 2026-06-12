import AsyncStorage from '@react-native-async-storage/async-storage';

const CHEIE_COADA_MASURATORI_OFFLINE =
  '@metahuman/coada-masuratori-offline-v1';

export type MasuratoareOffline = {
  idLocal: string;
  idPacient: number;
  tipParametru: string;
  valoare: number;
  unitate: string;
  sursa: string;
  dataOra: string;
};

type CerereMasuratoareOffline = Omit<MasuratoareOffline, 'idLocal'>;

type RezultatSincronizareMasuratoriOffline<T> = {
  sincronizate: Array<{
    masuratoare: MasuratoareOffline;
    raspuns: T;
  }>;
  numarRamase: number;
  aFostSarita: boolean;
};

let sincronizareInCurs = false;

export async function adaugaMasuratoareOffline(
  masuratoare: CerereMasuratoareOffline,
) {
  const coada = await obtineMasuratoriOffline();
  const elementNou: MasuratoareOffline = {
    idLocal: creeazaIdLocal(),
    ...masuratoare,
  };

  coada.push(elementNou);
  await scrieMasuratoriOffline(coada);

  return elementNou;
}

export async function obtineMasuratoriOffline() {
  try {
    const continutSalvat = await AsyncStorage.getItem(
      CHEIE_COADA_MASURATORI_OFFLINE,
    );

    if (!continutSalvat) {
      return [] as MasuratoareOffline[];
    }

    const coadaParsata = JSON.parse(continutSalvat);

    if (!Array.isArray(coadaParsata)) {
      return [] as MasuratoareOffline[];
    }

    return coadaParsata
      .map(normalizeazaMasuratoareOffline)
      .filter(
        (masuratoare): masuratoare is MasuratoareOffline =>
          masuratoare !== null,
      );
  } catch {
    return [] as MasuratoareOffline[];
  }
}

export async function stergeMasuratoareOffline(idLocal: string) {
  const coada = await obtineMasuratoriOffline();
  const coadaActualizata = coada.filter(
    masuratoare => masuratoare.idLocal !== idLocal,
  );

  await scrieMasuratoriOffline(coadaActualizata);
}

export async function sincronizeazaMasuratoriOffline<T>(
  trimiteMasuratoare: (masuratoare: MasuratoareOffline) => Promise<T>,
): Promise<RezultatSincronizareMasuratoriOffline<T>> {
  if (sincronizareInCurs) {
    const coadaExistenta = await obtineMasuratoriOffline();
    return {
      sincronizate: [],
      numarRamase: coadaExistenta.length,
      aFostSarita: true,
    };
  }

  sincronizareInCurs = true;

  try {
    const coada = await obtineMasuratoriOffline();
    const sincronizate: Array<{
      masuratoare: MasuratoareOffline;
      raspuns: T;
    }> = [];
    let indexCurent = 0;

    for (; indexCurent < coada.length; indexCurent += 1) {
      const masuratoare = coada[indexCurent];

      try {
        const raspuns = await trimiteMasuratoare(masuratoare);
        sincronizate.push({ masuratoare, raspuns });
      } catch {
        break;
      }
    }

    const toateAuFostTrimise = indexCurent >= coada.length;
    const coadaRamasa = toateAuFostTrimise ? [] : coada.slice(indexCurent);

    if (sincronizate.length > 0 || coadaRamasa.length !== coada.length) {
      await scrieMasuratoriOffline(coadaRamasa);
    }

    return {
      sincronizate,
      numarRamase: coadaRamasa.length,
      aFostSarita: false,
    };
  } finally {
    sincronizareInCurs = false;
  }
}

async function scrieMasuratoriOffline(coada: MasuratoareOffline[]) {
  if (!coada.length) {
    await AsyncStorage.removeItem(CHEIE_COADA_MASURATORI_OFFLINE);
    return;
  }

  await AsyncStorage.setItem(
    CHEIE_COADA_MASURATORI_OFFLINE,
    JSON.stringify(coada),
  );
}

function normalizeazaMasuratoareOffline(
  masuratoare: any,
): MasuratoareOffline | null {
  const idLocal = String(masuratoare?.idLocal ?? '').trim();
  const idPacient = Number(masuratoare?.idPacient);
  const tipParametru = String(masuratoare?.tipParametru ?? '').trim();
  const valoare = Number(masuratoare?.valoare);
  const unitate = String(masuratoare?.unitate ?? '').trim();
  const sursa = String(masuratoare?.sursa ?? '').trim();
  const dataOra = String(masuratoare?.dataOra ?? '').trim();

  if (
    !idLocal ||
    !Number.isFinite(idPacient) ||
    !tipParametru ||
    !Number.isFinite(valoare) ||
    !unitate ||
    !sursa ||
    !dataOra
  ) {
    return null;
  }

  return {
    idLocal,
    idPacient,
    tipParametru,
    valoare,
    unitate,
    sursa,
    dataOra,
  };
}

function creeazaIdLocal() {
  return `offline-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}
