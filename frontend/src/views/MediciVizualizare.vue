<template>
  <div class="medici">
    <div class="antet">
      <h1>Medici</h1>
      <button class="btn-primar" @click="arataFormularAdaugare = true">Adaugă Medic</button>
    </div>

    <div v-if="mediciStore.incarcare">Se încarcă...</div>
    <div v-if="mediciStore.eroare" class="eroare">{{ mediciStore.eroare }}</div>

    <!-- Formular adăugare -->
    <div v-if="arataFormularAdaugare" class="formular-container">
      <h2>Medic Nou</h2>
      <form @submit.prevent="adaugaMedic">
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
            <label>Specializare</label>
            <input v-model="formular.specializare" />
          </div>
          <div class="camp">
            <label>Telefon</label>
            <input v-model="formular.telefon" />
          </div>
        </div>
        <div class="butoane-formular">
          <button type="submit" class="btn-primar" :disabled="mediciStore.incarcare">
            Salvează
          </button>
          <button type="button" class="btn-contur" @click="anuleaza">Anulează</button>
        </div>
      </form>
    </div>

    <!-- Formular editare -->
    <div v-if="medicDeeditat" class="formular-container">
      <h2>Editează Medic</h2>
      <form @submit.prevent="salveazaEditare">
        <div class="rand-campuri">
          <div class="camp">
            <label>Nume *</label>
            <input v-model="formularEditare.nume" required />
          </div>
          <div class="camp">
            <label>Prenume *</label>
            <input v-model="formularEditare.prenume" required />
          </div>
        </div>
        <div class="rand-campuri">
          <div class="camp">
            <label>Specializare</label>
            <input v-model="formularEditare.specializare" />
          </div>
          <div class="camp">
            <label>Telefon</label>
            <input v-model="formularEditare.telefon" />
          </div>
        </div>
        <div class="butoane-formular">
          <button type="submit" class="btn-primar" :disabled="mediciStore.incarcare">
            Salvează
          </button>
          <button type="button" class="btn-contur" @click="anuleazaEditare">Anulează</button>
        </div>
      </form>
    </div>

    <!-- Lista medici -->
    <table v-if="mediciStore.medici.length > 0">
      <thead>
        <tr>
          <th>Nume</th>
          <th>Prenume</th>
          <th>Email</th>
          <th>Specializare</th>
          <th>Telefon</th>
          <th>Acțiuni</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="medic in mediciStore.medici" :key="medic.idMedic">
          <td>{{ medic.nume }}</td>
          <td>{{ medic.prenume }}</td>
          <td>{{ medic.email }}</td>
          <td>{{ medic.specializare ?? '-' }}</td>
          <td>{{ medic.telefon ?? '-' }}</td>
          <td class="td-actiuni">
            <button class="btn-contur" @click="incepeEditare(medic)">Editează</button>
            <button class="btn-contur-rosu" @click="dezactiveaza(medic.idMedic)">
              Dezactivează
            </button>
            <button class="btn-contur-rosu" @click="stergeDefinitiv(medic.idMedic)">
              Șterge
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-else-if="!mediciStore.incarcare">Nu există medici înregistrați.</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMediciStore } from '../stores/medici'
import type { Medic } from '../types'

const mediciStore = useMediciStore()
const arataFormularAdaugare = ref(false)
const medicDeeditat = ref<Medic | null>(null)

const formularGol = () => ({
  nume: '',
  prenume: '',
  email: '',
  parola: '',
  specializare: '',
  telefon: '',
})

const formular = ref(formularGol())

const formularEditare = ref({
  nume: '',
  prenume: '',
  specializare: '',
  telefon: '',
})

onMounted(() => {
  mediciStore.incarcaToti()
})

async function adaugaMedic() {
  await mediciStore.creeaza({
    ...formular.value,
    specializare: formular.value.specializare || undefined,
    telefon: formular.value.telefon || undefined,
  })
  if (!mediciStore.eroare) {
    anuleaza()
  }
}

function anuleaza() {
  arataFormularAdaugare.value = false
  formular.value = formularGol()
}

function incepeEditare(medic: Medic) {
  medicDeeditat.value = medic
  formularEditare.value = {
    nume: medic.nume,
    prenume: medic.prenume,
    specializare: medic.specializare ?? '',
    telefon: medic.telefon ?? '',
  }
}

async function salveazaEditare() {
  if (!medicDeeditat.value) return
  await mediciStore.actualizeaza(medicDeeditat.value.idMedic, {
    ...formularEditare.value,
    specializare: formularEditare.value.specializare || undefined,
    telefon: formularEditare.value.telefon || undefined,
  })
  if (!mediciStore.eroare) {
    anuleazaEditare()
  }
}

function anuleazaEditare() {
  medicDeeditat.value = null
}

async function dezactiveaza(id: number) {
  if (confirm('Ești sigur că vrei să dezactivezi acest medic?')) {
    await mediciStore.dezactiveaza(id)
  }
}

async function stergeDefinitiv(id: number) {
  if (
    confirm(
      'Ești sigur că vrei să ȘTERGI DEFINITIV acest medic? Medicul nu trebuie să aibă pacienți!',
    )
  ) {
    await mediciStore.stergeDefinitiv(id)
  }
}
</script>

<style scoped>
.medici {
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

h1 { font-size: 1.8rem; color: #2d3748; }
h2 { font-size: 1.2rem; color: #2d3748; margin-bottom: 1.2rem; }

.btn-primar {
  padding: 0.5rem 1.2rem;
  background-color: white;
  color: #2d7d46;
  border: 2px solid #2d7d46;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
}
.btn-primar:hover { background-color: #2d7d46; color: white; }

.btn-contur {
  padding: 0.4rem 0.9rem;
  background-color: white;
  color: #2d7d46;
  border: 2px solid #2d7d46;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  margin-right: 0.4rem;
  transition: background-color 0.2s, color 0.2s;
}
.btn-contur:hover { background-color: #2d7d46; color: white; }

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
  transition: background-color 0.2s, color 0.2s;
}
.btn-contur-rosu:hover { background-color: #e74c3c; color: white; }

.formular-container {
  background: white;
  padding: 1.5rem 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 1.5rem;
  border-top: 4px solid #2d7d46;
}

.rand-campuri { display: flex; gap: 1rem; }
.camp { flex: 1; margin-bottom: 1rem; }
.camp label { display: block; margin-bottom: 0.4rem; font-weight: 600; font-size: 0.9rem; color: #2d3748; }
.camp input {
  width: 100%;
  padding: 0.6rem 0.8rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.2s;
}
.camp input:focus { border-color: #2d7d46; }

.butoane-formular { display: flex; gap: 1rem; margin-top: 0.5rem; }

table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

th {
  background-color: #2d7d46;
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

.td-actiuni { white-space: nowrap; }
tbody tr:nth-child(odd) td { background-color: #ffffff; }
tbody tr:nth-child(even) td { background-color: #f7f9fb; }
tbody tr:hover td { background-color: #e8f5ee; }

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
  .medici { padding: 1.5rem 1rem; }
  .rand-campuri { flex-direction: column; gap: 0; }
}
</style>
