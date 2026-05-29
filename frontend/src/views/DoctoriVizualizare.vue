<template>
  <div class="doctori">
    <div class="antet">
      <h1>Doctori</h1>
      <button @click="arataFormularAdaugare = true">Adauga Doctor</button>
    </div>

    <div v-if="doctoriStore.incarcare">Se incarca...</div>
    <div v-if="doctoriStore.eroare" class="eroare">{{ doctoriStore.eroare }}</div>

    <!-- Formular adaugare -->
    <div v-if="arataFormularAdaugare" class="formular-container">
      <h2>Doctor Nou</h2>
      <form @submit.prevent="adaugaDoctor">
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
            <label>Email</label>
            <input v-model="formular.email" type="email" required />
          </div>
          <div class="camp">
            <label>Telefon</label>
            <input v-model="formular.telefon" />
          </div>
        </div>
        <div class="rand-campuri">
          <div class="camp">
            <label>Specializare</label>
            <input v-model="formular.specializare" required />
          </div>
          <div class="camp">
            <label>Numar Parafa</label>
            <input v-model="formular.numarParafa" required />
          </div>
        </div>
        <div class="butoane-formular">
          <button type="submit" :disabled="doctoriStore.incarcare">Salveaza</button>
          <button type="button" @click="anuleaza">Anuleaza</button>
        </div>
      </form>
    </div>

    <!-- Lista doctori -->
    <table v-if="doctoriStore.doctori.length > 0">
      <thead>
        <tr>
          <th>Nume</th>
          <th>Prenume</th>
          <th>Email</th>
          <th>Telefon</th>
          <th>Specializare</th>
          <th>Numar Parafa</th>
          <th>Actiuni</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="doctor in doctoriStore.doctori" :key="doctor.id">
          <td>{{ doctor.nume }}</td>
          <td>{{ doctor.prenume }}</td>
          <td>{{ doctor.email }}</td>
          <td>{{ doctor.telefon }}</td>
          <td>{{ doctor.specializare }}</td>
          <td>{{ doctor.numarParafa }}</td>
          <td>
            <button class="sterge" @click="stergeDoctor(doctor.id)">Sterge</button>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-else-if="!doctoriStore.incarcare">Nu exista doctori inregistrati.</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useDoctoriStore } from '../stores/doctori'

const doctoriStore = useDoctoriStore()
const arataFormularAdaugare = ref(false)

const formular = ref({
  nume: '',
  prenume: '',
  email: '',
  telefon: '',
  specializare: '',
  numarParafa: '',
})

onMounted(() => {
  doctoriStore.incarcaTotiDoctorii()
})

async function adaugaDoctor() {
  await doctoriStore.adaugaDoctor(formular.value)
  if (!doctoriStore.eroare) {
    anuleaza()
  }
}

function anuleaza() {
  arataFormularAdaugare.value = false
  formular.value = {
    nume: '',
    prenume: '',
    email: '',
    telefon: '',
    specializare: '',
    numarParafa: '',
  }
}

async function stergeDoctor(id: number) {
  if (confirm('Esti sigur ca vrei sa stergi acest doctor?')) {
    await doctoriStore.stergeDoctor(id)
  }
}
</script>

<style scoped>
.doctori {
  padding: 2rem;
}
.antet {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}
.formular-container {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
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
  margin-bottom: 0.3rem;
  font-weight: bold;
}
.camp input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}
table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
}
th {
  background-color: #3498db;
  color: white;
  padding: 0.75rem;
  text-align: left;
}
td {
  padding: 0.75rem;
  border-bottom: 1px solid #eee;
}
tr:hover {
  background-color: #f8f9fa;
}
button {
  padding: 0.4rem 0.8rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 0.3rem;
}
button.sterge {
  background-color: #e74c3c;
}
.butoane-formular {
  display: flex;
  gap: 1rem;
}
.eroare {
  background-color: #e74c3c;
  color: white;
  padding: 0.5rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}
</style>
