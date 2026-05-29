<template>
  <div class="pacienti">
    <div class="antet">
      <h1>Pacienți</h1>
      <button class="btn-primar" @click="arataFormularAdaugare = true">Adaugă Pacient</button>
    </div>

    <div v-if="pacientiStore.incarcare">Se încarcă...</div>
    <div v-if="pacientiStore.eroare" class="eroare">{{ pacientiStore.eroare }}</div>

    <!-- Formular adaugare -->
    <div v-if="arataFormularAdaugare" class="formular-container">
      <h2>Pacient Nou</h2>
      <form @submit.prevent="adaugaPacient">
        <div class="rand-campuri">
          <div class="camp">
            <label>Nume</label>
            <input v-model="formular.nume" required />
          </div>
          <div class="camp">
            <label>Prenume</label>
            <input v-model="formular.prenume" required />
          </div>
        </div>
        <div class="rand-campuri">
          <div class="camp">
            <label>CNP</label>
            <input v-model="formular.cnp" required />
          </div>
          <div class="camp">
            <label>Data Nașterii</label>
            <input v-model="formular.dataNasterii" type="date" required />
          </div>
        </div>
        <div class="rand-campuri">
          <div class="camp">
            <label>Telefon</label>
            <input v-model="formular.telefon" />
          </div>
          <div class="camp">
            <label>Email</label>
            <input v-model="formular.email" type="email" />
          </div>
        </div>
        <div class="camp">
          <label>Adresă</label>
          <input v-model="formular.adresa" />
        </div>
        <div class="butoane-formular">
          <button type="submit" class="btn-primar" :disabled="pacientiStore.incarcare">
            Salvează
          </button>
          <button type="button" class="btn-contur" @click="anuleaza">Anulează</button>
        </div>
      </form>
    </div>

    <!-- Lista pacienti -->
    <table v-if="pacientiStore.pacienti.length > 0">
      <thead>
        <tr>
          <th>Nume</th>
          <th>Prenume</th>
          <th>CNP</th>
          <th>Telefon</th>
          <th>Email</th>
          <th>Acțiuni</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="pacient in pacientiStore.pacienti" :key="pacient.id">
          <td data-label="Nume">{{ pacient.nume }}</td>
          <td data-label="Prenume">{{ pacient.prenume }}</td>
          <td data-label="CNP">{{ pacient.cnp }}</td>
          <td data-label="Telefon">{{ pacient.telefon }}</td>
          <td data-label="Email">{{ pacient.email }}</td>
          <td class="td-actiuni">
            <button class="btn-contur" @click="router.push(`/pacienti/${pacient.id}`)">
              Detalii
            </button>
            <button class="btn-contur-rosu" @click="stergePacient(pacient.id)">Șterge</button>
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

const router = useRouter()
const pacientiStore = usePacientiStore()

const arataFormularAdaugare = ref(false)

const formular = ref({
  nume: '',
  prenume: '',
  cnp: '',
  telefon: '',
  email: '',
  adresa: '',
  dataNasterii: '',
})

onMounted(() => {
  pacientiStore.incarcaTotiPacientii()
})

async function adaugaPacient() {
  await pacientiStore.adaugaPacient({
    ...formular.value,
    dataNasterii: new Date(formular.value.dataNasterii).toISOString(),
  })
  if (!pacientiStore.eroare) {
    anuleaza()
  }
}

function anuleaza() {
  arataFormularAdaugare.value = false
  formular.value = {
    nume: '',
    prenume: '',
    cnp: '',
    telefon: '',
    email: '',
    adresa: '',
    dataNasterii: '',
  }
}

async function stergePacient(id: number) {
  if (confirm('Ești sigur că vrei să ștergi acest pacient?')) {
    await pacientiStore.stergePacient(id)
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
  color: #2d7d46;
  border: 2px solid #2d7d46;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.2s,
    color 0.2s;
}

.btn-primar:hover {
  background-color: #2d7d46;
  color: white;
}

.btn-contur {
  padding: 0.4rem 0.9rem;
  background-color: white;
  color: #2d7d46;
  border: 2px solid #2d7d46;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.2s,
    color 0.2s;
  margin-right: 0.4rem;
}

.btn-contur:hover {
  background-color: #2d7d46;
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
  border-top: 4px solid #2d7d46;
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

.camp input:focus {
  border-color: #2d7d46;
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

.td-actiuni {
  white-space: nowrap;
}

tr:hover td {
  background-color: #f0f4f8;
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

tbody tr:nth-child(odd) td {
  background-color: #ffffff;
}

tbody tr:nth-child(even) td {
  background-color: #f7f9fb;
}

tbody tr:hover td {
  background-color: #e8f5ee;
}

@media (max-width: 640px) {
  .pacienti {
    padding: 1.5rem 1rem;
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
    border-top: 4px solid #2d7d46;
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
    color: #2d7d46;
    font-size: 0.85rem;
  }

  .td-actiuni {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 0.5rem;
    padding-top: 0.5rem;
  }

  .td-actiuni::before {
    display: none;
  }
}
</style>
