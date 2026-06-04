<template>
  <div class="recomandari">
    <div class="header">
      <h1>Recomandări</h1>
    </div>

    <div class="lista-recomandari">
      <div class="card-recomandare">
        <div class="antet-card">
          <h2>Monitorizare zilnică</h2>
          <span class="badge">Activă</span>
        </div>

        <div class="rand-info">
          <span>Durată zilnică</span>
          <strong>10 minute</strong>
        </div>

        <div class="rand-info">
          <span>Data început</span>
          <strong>03.06.2026</strong>
        </div>

        <div class="rand-info">
          <span>Data sfârșit</span>
          <strong>-</strong>
        </div>

        <div class="rand-info">
          <span>Emis de către</span>
          <strong>-</strong>
        </div>
      </div>

      <div class="card-recomandare">
        <div class="antet-card">
          <h2>Repaus și observare</h2>
          <span class="badge">Activă</span>
        </div>

        <div class="rand-info">
          <span>Durată zilnică</span>
          <strong>15 minute</strong>
        </div>

        <div class="rand-info">
          <span>Data început</span>
          <strong>03.06.2026</strong>
        </div>

        <div class="rand-info">
          <span>Data sfârșit</span>
          <strong>-</strong>
        </div>

        <div class="rand-info">
          <span>Emis de către</span>
          <strong>-</strong>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.recomandari {
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

.lista-recomandari {
  display: grid;
  gap: 1rem;
}

.card-recomandare {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border-top: 4px solid #0047AB;
}

.antet-card {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

h2 {
  font-size: 1.1rem;
  color: #2d3748;
}

.badge {
  background: #eaf1ff;
  color: #0047AB;
  border-radius: 999px;
  padding: 0.3rem 0.7rem;
  font-size: 0.8rem;
  font-weight: 700;
}

.rand-info {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #e2e8f0;
  padding: 0.7rem 0;
}

.rand-info span {
  color: #718096;
}

.indicatii {
  margin-top: 1rem;
  color: #4a5568;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .recomandari {
    padding: 1.5rem 1rem;
  }

  .rand-info {
    flex-direction: column;
    gap: 0.25rem;
  }
}
</style>