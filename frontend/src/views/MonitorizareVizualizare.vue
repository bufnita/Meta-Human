<template>
  <div class="monitorizare">
    <div class="header">
      <h1>Monitorizare</h1>
    </div>

    <div class="carduri-monitorizare">
      <div class="card-masurare">
        <h2>Temperatură</h2>
        <div class="valoare">
          36.7 <span>°C</span>
        </div>
      </div>

      <div class="card-masurare">
        <h2>ECG</h2>
        <div class="valoare">
          512 <span>raw</span>
        </div>
      </div>

      <div class="card-masurare">
        <h2>Puls</h2>
        <div class="valoare">
          - <span>bpm</span>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="antet-card">
        <h2>Istoric măsurători</h2>
      </div>

      <table>
        <thead>
          <tr>
            <th>Parametru</th>
            <th>Valoare</th>
            <th>Unitate</th>
            <th>Data și ora</th>
            <th>Stare</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>temperatura</td>
            <td>36.7</td>
            <td>°C</td>
            <td>03.06.2026, 20:15</td>
            <td>Normal</td>
          </tr>
          <tr>
            <td>ecg</td>
            <td>512</td>
            <td>raw</td>
            <td>03.06.2026, 20:15</td>
            <td>Preluat</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.monitorizare {
  padding: 3rem;
  min-height: calc(100vh - 60px);
  background-color: #f0f4f8;
}

.header {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #e2e8f0;
}

h1 {
  font-size: 1.8rem;
  color: #2d3748;
}

.carduri-monitorizare {
  display: grid;
  grid-template-columns: repeat(3, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.card-masurare,
.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border-top: 4px solid #0047AB;
}

.card-masurare {
  padding: 2rem;
}

.card {
  padding: 2rem;
}

.card-masurare h2,
.card h2 {
  color: #2d3748;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.valoare {
  font-size: 2.4rem;
  font-weight: 700;
  color: #0047AB;
  margin-bottom: 0.5rem;
}

.valoare span {
  font-size: 1rem;
  color: #718096;
  margin-left: 0.3rem;
}

.card-masurare p {
  color: #718096;
  font-size: 0.9rem;
}

.antet-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  background-color: #0047AB;
  color: white;
  padding: 0.8rem;
  text-align: left;
}

td {
  padding: 0.8rem;
  border-bottom: 1px solid #e2e8f0;
}

@media (max-width: 768px) {
  .monitorizare {
    padding: 1.5rem 1rem;
  }

  .carduri-monitorizare {
    grid-template-columns: 1fr;
  }

  table {
    display: block;
    overflow-x: auto;
  }
}
</style>