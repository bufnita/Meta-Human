<template>
  <div class="pacienti">
    <div class="antet">
      <h1>Pacienți</h1>
      <button class="btn-primar" @click="deschideFormular">Adaugă Pacient</button>
    </div>

    <div v-if="pacientiStore.incarcare">Se încarcă...</div>
    <div v-if="pacientiStore.eroare" class="eroare">{{ pacientiStore.eroare }}</div>

    <!-- Formular adăugare -->
    <div v-if="arataFormular" class="formular-container">
      <h2>Pacient Nou</h2>
      <form @submit.prevent="adaugaPacient">
        <div class="rand-campuri">
          <div class="camp">
            <label>Nume *</label>
            <input v-model="formular.nume" required />
          </div>
          <div class="camp">
            <label>Prenume *</label>
            <input v-model="formular.prenume" required />
          </div>
        </div>
        <div class="rand-campuri">
          <div class="camp">
            <label>Vârstă *</label>
            <input v-model.number="formular.varsta" type="number" min="1" required />
          </div>
          <div class="camp">
            <label>CNP</label>
            <input v-model="formular.cnp" maxlength="13" />
          </div>
        </div>
        <div class="rand-campuri">
          <div class="camp">
            <label>Email *</label>
            <input v-model="formular.email" type="email" required />
          </div>
          <div class="camp">
            <label>Parolă * (min. 6 caractere)</label>
            <input v-model="formular.parola" type="password" minlength="6" required />
          </div>
        </div>
        <div class="rand-campuri">
          <div class="camp">
            <label>Telefon</label>
            <input v-model="formular.telefon" />
          </div>
          <div class="camp">
            <label>Adresă</label>
            <input v-model="formular.adresa" />
          </div>
        </div>
        <div class="rand-campuri">
          <div class="camp">
            <label>Profesie</label>
            <input v-model="formular.profesie" />
          </div>
          <div class="camp">
            <label>Loc de muncă</label>
            <input v-model="formular.locMunca" />
          </div>
        </div>
        <!-- Dropdown medici doar pentru Admin -->
        <div v-if="utilizatorStore.esteAdmin" class="camp">
          <label>Medic *</label>
          <div v-if="seIncarcaMedici" class="medici-loading">Se încarcă medicii...</div>
          <select v-else v-model.number="formular.idMedic" required class="select-medic">
            <option :value="undefined" disabled>— Selectează medicul —</option>
            <option v-for="medic in medici" :key="medic.idMedic" :value="medic.idMedic">
              #{{ medic.idMedic }} — {{ medic.nume }} {{ medic.prenume }} ({{ medic.email }})
            </option>
          </select>
        </div>
        <div class="butoane-formular">
          <button type="submit" class="btn-primar" :disabled="pacientiStore.incarcare">
            Salvează
          </button>
          <button type="button" class="btn-contur" @click="anuleaza">Anulează</button>
        </div>
      </form>
    </div>

    <!-- Lista pacienți -->
    <table v-if="pacientiStore.pacienti.length > 0">
      <thead>
        <tr>
          <th>Nume</th>
          <th>Prenume</th>
          <th>Vârstă</th>
          <th>Telefon</th>
          <th>Email</th>
          <th>Activ</th>
          <th>Acțiuni</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="pacient in pacientiStore.pacienti"
          :key="pacient.idPacient"
          :class="{ inactiv: !pacient.activ }"
        >
          <td data-label="Nume">{{ pacient.nume }}</td>
          <td data-label="Prenume">{{ pacient.prenume }}</td>
          <td data-label="Vârstă">{{ pacient.varsta }}</td>
          <td data-label="Telefon">{{ pacient.telefon ?? '-' }}</td>
          <td data-label="Email">{{ pacient.email ?? '-' }}</td>
          <td data-label="Activ">
            <span :class="pacient.activ ? 'badge-activ' : 'badge-inactiv'">
              {{ pacient.activ ? 'Activ' : 'Inactiv' }}
            </span>
          </td>
          <td class="td-actiuni">
            <button class="btn-contur" @click="router.push(`/pacienti/${pacient.idPacient}`)">
              Detalii
            </button>
            <button
              class="btn-contur-rosu"
              @click="dezactiveazaPacient(pacient.idPacient)"
              :disabled="!pacient.activ"
            >
              Dezactivează
            </button>
            <button
              v-if="utilizatorStore.esteAdmin"
              class="btn-contur-rosu"
              @click="stergeDefinitiv(pacient.idPacient)"
            >
              Șterge
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-else-if="!pacientiStore.incarcare">Nu există pacienți înregistrați.</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePacientiStore } from '../stores/pacienti'
import { useUtilizatorStore } from '../stores/utilizator'
import { mediciApi } from '../api/medici'
import type { Medic } from '../types'

const router = useRouter()
const pacientiStore = usePacientiStore()
const utilizatorStore = useUtilizatorStore()

const arataFormular = ref(false)
const medici = ref<Medic[]>([])
const seIncarcaMedici = ref(false)

const formularGol = () => ({
  nume: '',
  prenume: '',
  varsta: 0,
  cnp: '',
  email: '',
  parola: '',
  telefon: '',
  adresa: '',
  profesie: '',
  locMunca: '',
  idMedic: undefined as number | undefined,
})

const formular = ref(formularGol())

onMounted(() => {
  pacientiStore.incarcaLista()
})

async function deschideFormular() {
  arataFormular.value = true
  if (utilizatorStore.esteAdmin && medici.value.length === 0) {
    seIncarcaMedici.value = true
    try {
      medici.value = await mediciApi.obtineToti()
    } catch {
      // eroare silentioasa
    } finally {
      seIncarcaMedici.value = false
    }
  }
}

async function adaugaPacient() {
  const cerere = {
    ...formular.value,
    cnp: formular.value.cnp || undefined,
    telefon: formular.value.telefon || undefined,
    adresa: formular.value.adresa || undefined,
    profesie: formular.value.profesie || undefined,
    locMunca: formular.value.locMunca || undefined,
    idMedic: utilizatorStore.esteAdmin ? formular.value.idMedic : undefined,
  }
  await pacientiStore.creeaza(cerere)
  if (!pacientiStore.eroare) {
    anuleaza()
  }
}

function anuleaza() {
  arataFormular.value = false
  formular.value = formularGol()
}

async function dezactiveazaPacient(id: number) {
  if (confirm('Ești sigur că vrei să dezactivezi acest pacient?')) {
    await pacientiStore.dezactiveaza(id)
  }
}

async function stergeDefinitiv(id: number) {
  if (
    confirm('Ești sigur că vrei să ȘTERGI DEFINITIV acest pacient? Acțiunea este ireversibilă!')
  ) {
    await pacientiStore.stergeDefinitiv(id)
  }
}
</script>

<style scoped>
.pacienti {
  padding: 3rem;
  min-height: calc(100vh - 60px);
  background-color: #f0f4f8;
}

.antet {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #e2e8f0;
}

h1 {
  font-size: 1.8rem;
  color: #2d3748;
}
h2 {
  font-size: 1.2rem;
  color: #2d3748;
  margin-bottom: 1.2rem;
}

.btn-primar {
  padding: 0.5rem 1.2rem;
  background-color: white;
  color: #0047ab;
  border: 2px solid #0047ab;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.2s,
    color 0.2s;
}
.btn-primar:hover {
  background-color: #0047ab;
  color: white;
}

.btn-contur {
  padding: 0.4rem 0.9rem;
  background-color: white;
  color: #0047ab;
  border: 2px solid #0047ab;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  margin-right: 0.4rem;
  transition:
    background-color 0.2s,
    color 0.2s;
}
.btn-contur:hover {
  background-color: #0047ab;
  color: white;
}

.btn-contur-rosu {
  padding: 0.4rem 0.9rem;
  background-color: white;
  color: #e74c3c;
  border: 2px solid #e74c3c;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  margin-right: 0.4rem;
  transition:
    background-color 0.2s,
    color 0.2s;
}
.btn-contur-rosu:hover {
  background-color: #e74c3c;
  color: white;
}

.formular-container {
  background: white;
  padding: 1.5rem 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 1.5rem;
  border-top: 4px solid #0047ab;
}

.rand-campuri {
  display: flex;
  gap: 1rem;
}

.camp {
  flex: 1;
  margin-bottom: 1rem;
}

.camp label {
  display: block;
  margin-bottom: 0.4rem;
  font-weight: 600;
  font-size: 0.9rem;
  color: #2d3748;
}

.camp input,
.select-medic {
  width: 100%;
  padding: 0.6rem 0.8rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.2s;
  background-color: white;
  color: #2d3748;
}
.camp input:focus,
.select-medic:focus {
  border-color: #0047ab;
}

.medici-loading {
  padding: 0.6rem 0.8rem;
  color: #718096;
  font-size: 0.9rem;
}

.butoane-formular {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

th {
  background-color: #0047ab;
  color: white;
  padding: 0.9rem 0.75rem;
  text-align: left;
  font-size: 0.9rem;
  font-weight: 600;
}

td {
  padding: 0.75rem;
  border-bottom: 1px solid #eee;
  font-size: 0.95rem;
  color: #2d3748;
}

.td-actiuni {
  white-space: nowrap;
}

tbody tr:nth-child(odd) td {
  background-color: #ffffff;
}
tbody tr:nth-child(even) td {
  background-color: #f7f9fb;
}
tbody tr:hover td {
  background-color: #eaf1ff;
}

tr.inactiv td {
  color: #a0aec0;
}

.badge-activ {
  background-color: #c6f6d5;
  color: #276749;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.badge-inactiv {
  background-color: #fed7d7;
  color: #c53030;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

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
  .pacienti {
    padding: 1.5rem 1rem;
  }
  .rand-campuri {
    flex-direction: column;
    gap: 0;
  }
  table thead {
    display: none;
  }
  table,
  tbody,
  tr,
  td {
    display: block;
    width: 100%;
  }
  table {
    background: transparent;
    box-shadow: none;
    border-radius: 0;
  }
  tbody tr {
    background: white !important;
    border-radius: 12px;
    padding: 1rem;
    margin-bottom: 1rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    border-top: 4px solid #0047ab;
    border-left: 1px solid #e2e8f0;
    border-right: 1px solid #e2e8f0;
    border-bottom: 1px solid #e2e8f0;
  }
  tbody tr:nth-child(even) td,
  tbody tr:nth-child(odd) td,
  tbody tr:hover td {
    background: transparent !important;
  }
  td {
    padding: 0.35rem 0;
    border: none;
    font-size: 0.9rem;
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid #f0f4f8;
  }
  td:last-child {
    border-bottom: none;
  }
  td::before {
    content: attr(data-label);
    font-weight: 600;
    color: #0047ab;
    font-size: 0.85rem;
  }
  .td-actiuni {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }
  .td-actiuni::before {
    display: none;
  }
}
</style>
