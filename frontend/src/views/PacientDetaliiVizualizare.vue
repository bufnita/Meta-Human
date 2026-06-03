<template>
  <div class="detalii-pacient">
    <div class="antet">
      <button class="btn-inapoi" @click="router.push('/pacienti')">← Înapoi</button>
      <h1 v-if="pacientiStore.pacientSelectat">
        {{ pacientiStore.pacientSelectat.nume }} {{ pacientiStore.pacientSelectat.prenume }}
        <span :class="pacientiStore.pacientSelectat.activ ? 'badge-activ' : 'badge-inactiv'">
          {{ pacientiStore.pacientSelectat.activ ? 'Activ' : 'Inactiv' }}
        </span>
      </h1>
    </div>

    <div v-if="pacientiStore.incarcare" class="incarcare">Se încarcă...</div>
    <div v-if="pacientiStore.eroare" class="eroare">{{ pacientiStore.eroare }}</div>

    <div v-if="pacientiStore.pacientSelectat" class="continut">
      <!-- Informații personale -->
      <div class="card">
        <h2>Informații Personale</h2>
        <div class="grid-info">
          <div class="rand-info">
            <span class="eticheta">CNP</span>
            <span>{{ pacientiStore.pacientSelectat.cnp ?? '-' }}</span>
          </div>
          <div class="rand-info">
            <span class="eticheta">Vârstă</span>
            <span>{{ pacientiStore.pacientSelectat.varsta }} ani</span>
          </div>
          <div class="rand-info">
            <span class="eticheta">Telefon</span>
            <span>{{ pacientiStore.pacientSelectat.telefon ?? '-' }}</span>
          </div>
          <div class="rand-info">
            <span class="eticheta">Email</span>
            <span>{{ pacientiStore.pacientSelectat.email ?? '-' }}</span>
          </div>
          <div class="rand-info">
            <span class="eticheta">Adresă</span>
            <span>{{ pacientiStore.pacientSelectat.adresa ?? '-' }}</span>
          </div>
          <div class="rand-info">
            <span class="eticheta">Profesie</span>
            <span>{{ pacientiStore.pacientSelectat.profesie ?? '-' }}</span>
          </div>
          <div class="rand-info">
            <span class="eticheta">Loc de muncă</span>
            <span>{{ pacientiStore.pacientSelectat.locMunca ?? '-' }}</span>
          </div>
          <div v-if="pacientiStore.pacientSelectat.istoricMedical" class="rand-info">
            <span class="eticheta">Istoric medical</span>
            <span>{{ pacientiStore.pacientSelectat.istoricMedical }}</span>
          </div>
          <div v-if="pacientiStore.pacientSelectat.alergii" class="rand-info">
            <span class="eticheta">Alergii</span>
            <span>{{ pacientiStore.pacientSelectat.alergii }}</span>
          </div>
          <div v-if="pacientiStore.pacientSelectat.consultatiiCardiologice" class="rand-info">
            <span class="eticheta">Consultații cardiologice</span>
            <span>{{ pacientiStore.pacientSelectat.consultatiiCardiologice }}</span>
          </div>
        </div>
      </div>

      <!-- Istoric măsurători -->
      <div class="card">
        <div class="antet-card">
          <h2>Istoric Măsurători</h2>
          <select v-model="numarMasuratori" @change="reincarcaIstoric">
            <option :value="10">Ultimele 10</option>
            <option :value="50">Ultimele 50</option>
            <option :value="100">Ultimele 100</option>
          </select>
        </div>

        <table v-if="pacientiStore.istoricMasuratori?.masuratori.length">
          <thead>
            <tr>
              <th>Parametru</th>
              <th>Valoare</th>
              <th>Unitate</th>
              <th>Data și Ora</th>
              <th>Stare</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="m in pacientiStore.istoricMasuratori.masuratori"
              :key="m.idMasuratoare"
            >
              <td>{{ m.tipParametru }}</td>
              <td>{{ m.valoare }}</td>
              <td>{{ m.unitateMasura }}</td>
              <td>{{ new Date(m.dataOra).toLocaleString('ro-RO') }}</td>
              <td>{{ m.stare }}</td>
            </tr>
          </tbody>
        </table>
        <p v-else>Nu există măsurători pentru acest pacient.</p>
      </div>

      <!-- Alerte pacient -->
      <div class="card">
        <h2>Alerte</h2>
        <table v-if="pacientiStore.alerte.length">
          <thead>
            <tr>
              <th>Parametru</th>
              <th>Valoare constatată</th>
              <th>Mesaj</th>
              <th>Stare</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="alerta in pacientiStore.alerte"
              :key="alerta.idAlerta"
              :class="{ 'row-activa': alerta.stare === 'Activă' }"
            >
              <td>{{ alerta.parametruAsociat }}</td>
              <td>{{ alerta.valoareConstatata }}</td>
              <td>{{ alerta.mesaj }}</td>
              <td>{{ alerta.stare }}</td>
              <td>{{ new Date(alerta.dataOra).toLocaleString('ro-RO') }}</td>
            </tr>
          </tbody>
        </table>
        <p v-else>Nu există alerte pentru acest pacient.</p>
      </div>

      <!-- Praguri de alertă -->
      <div class="card">
        <div class="antet-card">
          <h2>Praguri de Alertă</h2>
          <button class="btn-contur" @click="arataFormularPrag = !arataFormularPrag">
            {{ arataFormularPrag ? 'Anulează' : '+ Adaugă Prag' }}
          </button>
        </div>

        <div v-if="arataFormularPrag" class="sub-formular">
          <form @submit.prevent="adaugaPrag">
            <div class="rand-campuri">
              <div class="camp">
                <label>Tip parametru *</label>
                <input v-model="formularPrag.tipParametru" placeholder="ex: Puls" required />
              </div>
              <div class="camp">
                <label>Durată persistență (sec) *</label>
                <input v-model.number="formularPrag.durataPersistentaSec" type="number" min="1" required />
              </div>
            </div>
            <div class="rand-campuri">
              <div class="camp">
                <label>Valoare minimă</label>
                <input v-model.number="formularPrag.valoareMinima" type="number" step="0.01" />
              </div>
              <div class="camp">
                <label>Valoare maximă</label>
                <input v-model.number="formularPrag.valoareMaxima" type="number" step="0.01" />
              </div>
            </div>
            <div class="camp-checkbox">
              <input v-model="formularPrag.activ" type="checkbox" id="pragActiv" />
              <label for="pragActiv">Activ</label>
            </div>
            <button type="submit" class="btn-primar">Salvează Prag</button>
          </form>
        </div>

        <table v-if="pacientiStore.praguri.length">
          <thead>
            <tr>
              <th>Parametru</th>
              <th>Min</th>
              <th>Max</th>
              <th>Durată (sec)</th>
              <th>Activ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="prag in pacientiStore.praguri" :key="prag.idPrag">
              <td>{{ prag.tipParametru }}</td>
              <td>{{ prag.valoareMinima ?? '-' }}</td>
              <td>{{ prag.valoareMaxima ?? '-' }}</td>
              <td>{{ prag.durataPersistentaSec }}</td>
              <td>
                <span :class="prag.activ ? 'badge-activ' : 'badge-inactiv'">
                  {{ prag.activ ? 'Da' : 'Nu' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else-if="!arataFormularPrag">Nu există praguri configurate pentru acest pacient.</p>
      </div>

      <!-- Recomandări -->
      <div class="card">
        <div class="antet-card">
          <h2>Recomandări</h2>
          <button class="btn-contur" @click="arataFormularRecomandare = !arataFormularRecomandare">
            {{ arataFormularRecomandare ? 'Anulează' : '+ Adaugă Recomandare' }}
          </button>
        </div>

        <div v-if="arataFormularRecomandare" class="sub-formular">
          <form @submit.prevent="adaugaRecomandare">
            <div class="rand-campuri">
              <div class="camp">
                <label>Tip activitate *</label>
                <input v-model="formularRec.tipActivitate" placeholder="ex: Mers" required />
              </div>
              <div class="camp">
                <label>Durată zilnică</label>
                <input v-model="formularRec.durataZilnica" placeholder="ex: 30 min" />
              </div>
            </div>
            <div class="rand-campuri">
              <div class="camp">
                <label>Data început *</label>
                <input v-model="formularRec.dataInceput" type="date" required />
              </div>
              <div class="camp">
                <label>Data sfârșit</label>
                <input v-model="formularRec.dataSfarsit" type="date" />
              </div>
            </div>
            <div class="camp" style="flex: 1">
              <label>Alte indicații</label>
              <input v-model="formularRec.alteIndicatii" />
            </div>
            <button type="submit" class="btn-primar" style="margin-top: 0.5rem">
              Salvează Recomandare
            </button>
          </form>
        </div>

        <table v-if="pacientiStore.recomandari.length">
          <thead>
            <tr>
              <th>Activitate</th>
              <th>Durată zilnică</th>
              <th>Indicații</th>
              <th>De la</th>
              <th>Până la</th>
              <th>Stare</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="rec in pacientiStore.recomandari" :key="rec.idRecomandare">
              <td>{{ rec.tipActivitate }}</td>
              <td>{{ rec.durataZilnica ?? '-' }}</td>
              <td>{{ rec.alteIndicatii ?? '-' }}</td>
              <td>{{ rec.dataInceput }}</td>
              <td>{{ rec.dataSfarsit ?? '-' }}</td>
              <td>{{ rec.stare }}</td>
            </tr>
          </tbody>
        </table>
        <p v-else-if="!arataFormularRecomandare">Nu există recomandări pentru acest pacient.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePacientiStore } from '../stores/pacienti'

const route = useRoute()
const router = useRouter()
const pacientiStore = usePacientiStore()

const pacientId = Number(route.params.id)
const numarMasuratori = ref(10)
const arataFormularPrag = ref(false)
const arataFormularRecomandare = ref(false)

const formularPragGol = () => ({
  tipParametru: '',
  valoareMinima: undefined as number | undefined,
  valoareMaxima: undefined as number | undefined,
  durataPersistentaSec: 60,
  activ: true,
})
const formularPrag = ref(formularPragGol())

const formularRecGol = () => ({
  tipActivitate: '',
  durataZilnica: '',
  alteIndicatii: '',
  dataInceput: '',
  dataSfarsit: '',
})
const formularRec = ref(formularRecGol())

onMounted(async () => {
  await pacientiStore.incarcaDetaliu(pacientId)
  await pacientiStore.incarcaIstoric(pacientId, numarMasuratori.value)
  await pacientiStore.incarcaAlertePatient(pacientId)
  await pacientiStore.incarcaPraguri(pacientId)
  await pacientiStore.incarcaRecomandari(pacientId)
})

async function reincarcaIstoric() {
  await pacientiStore.incarcaIstoric(pacientId, numarMasuratori.value)
}

async function adaugaPrag() {
  await pacientiStore.adaugaPrag(pacientId, {
    ...formularPrag.value,
    durataPersistentaSec: formularPrag.value.durataPersistentaSec,
  })
  if (!pacientiStore.eroare) {
    arataFormularPrag.value = false
    formularPrag.value = formularPragGol()
  }
}

async function adaugaRecomandare() {
  await pacientiStore.adaugaRecomandare(pacientId, {
    tipActivitate: formularRec.value.tipActivitate,
    durataZilnica: formularRec.value.durataZilnica || undefined,
    alteIndicatii: formularRec.value.alteIndicatii || undefined,
    dataInceput: formularRec.value.dataInceput,
    dataSfarsit: formularRec.value.dataSfarsit || undefined,
  })
  if (!pacientiStore.eroare) {
    arataFormularRecomandare.value = false
    formularRec.value = formularRecGol()
  }
}
</script>

<style scoped>
.detalii-pacient {
  padding: 3rem;
  min-height: calc(100vh - 60px);
  background-color: #f0f4f8;
}

.antet {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #e2e8f0;
  flex-wrap: wrap;
}

h1 {
  font-size: 1.6rem;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

h2 {
  font-size: 1.1rem;
  color: #2d3748;
  margin-bottom: 1rem;
}

.btn-inapoi {
  padding: 0.5rem 1rem;
  background-color: white;
  color: #0047AB;
  border: 2px solid #0047AB;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
  white-space: nowrap;
}
.btn-inapoi:hover { background-color: #0047AB; color: white; }

.btn-primar {
  padding: 0.5rem 1.2rem;
  background-color: #0047AB;
  color: white;
  border: 2px solid #0047AB;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}
.btn-primar:hover { background-color: #00357f; }

.btn-contur {
  padding: 0.4rem 0.9rem;
  background-color: white;
  color: #0047AB;
  border: 2px solid #0047AB;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
}
.btn-contur:hover { background-color: #0047AB; color: white; }

.badge-activ {
  background-color: #c6f6d5;
  color: #276749;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge-inactiv {
  background-color: #fed7d7;
  color: #c53030;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.continut { display: flex; flex-direction: column; gap: 1.5rem; }

.card {
  background: white;
  padding: 1.5rem 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border-top: 4px solid #0047AB;
}

.antet-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.antet-card h2 { margin-bottom: 0; }

.grid-info {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem 1.5rem;
}

.rand-info {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 0.9rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background-color: #f8fbff;
}

.eticheta {
  font-weight: 700;
  color: #0047AB;
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.sub-formular {
  background: #f7f9fb;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border: 1px solid #e2e8f0;
}

.rand-campuri { display: flex; gap: 1rem; flex-wrap: wrap; }

.camp { flex: 1; min-width: 180px; margin-bottom: 0.75rem; }

.camp label {
  display: block;
  margin-bottom: 0.3rem;
  font-weight: 600;
  font-size: 0.85rem;
  color: #2d3748;
}

.camp input {
  width: 100%;
  padding: 0.55rem 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.2s;
}
.camp input:focus { border-color: #0047AB; }

.camp-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
  color: #2d3748;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 0.5rem;
}

th {
  background-color: #0047AB;
  color: white;
  padding: 0.75rem;
  text-align: left;
  font-size: 0.85rem;
  font-weight: 600;
}

td {
  padding: 0.65rem 0.75rem;
  border-bottom: 1px solid #eee;
  font-size: 0.9rem;
  color: #2d3748;
}

tbody tr:nth-child(odd) td { background-color: #ffffff; }
tbody tr:nth-child(even) td { background-color: #f7f9fb; }
tbody tr:hover td { background-color: #eaf1ff; }

.row-activa td { background-color: #fff8e1 !important; }

.incarcare { color: #718096; margin-bottom: 1rem; }

.eroare {
  background-color: #fff5f5;
  color: #c53030;
  border: 1px solid #feb2b2;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

@media (max-width: 640px) {
  .detalii-pacient { padding: 1.5rem 1rem; }
  .grid-info { grid-template-columns: 1fr; }
  .rand-campuri { flex-direction: column; gap: 0; }
  table thead { display: none; }
  table, tbody, tr, td { display: block; width: 100%; }
  tbody tr {
    background: white !important;
    border-radius: 8px;
    padding: 0.75rem;
    margin-bottom: 0.75rem;
    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
    border-left: 3px solid #0047AB;
  }
  tbody tr:nth-child(even) td,
  tbody tr:nth-child(odd) td,
  tbody tr:hover td { background: transparent !important; }
  td {
    padding: 0.3rem 0;
    border: none;
    font-size: 0.85rem;
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid #f0f4f8;
  }
  td:last-child { border-bottom: none; }
}
</style>
