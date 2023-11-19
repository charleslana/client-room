<template>
  <div class="board">
    <div class="half">
      <div class="column" v-for="index in 3" :key="index">
        <div class="card" v-for="cardIndex in 4" :key="cardIndex"></div>
      </div>
      <div class="hand-card">
        <div>
          <div class="hand-column">
            <div class="card" v-for="cardIndex in 7" :key="cardIndex">
              <div class="flex">
                <div>1</div>
                <div>6</div>
              </div>
              <div>O que a carta faz</div>
            </div>
          </div>
        </div>
        <div>nome do adversário</div>
      </div>
    </div>
    <div class="half">
      <div class="column field">
        <div class="field-column">
          <div>0</div>
          <div>o que o campo faz</div>
          <div>0</div>
        </div>
      </div>
      <div class="column field">
        <div class="field-column">
          <div>0</div>
          <div>o que o campo faz</div>
          <div>0</div>
        </div>
      </div>
      <div class="column field">
        <div class="field-column">
          <div>0</div>
          <div>o que o campo faz</div>
          <div>0</div>
        </div>
      </div>
      <div class="middle">
        <div class="flex">
          <div>00:59</div>
          <div class="progress">
            <div class="progress-bar" style="width: 50%"></div>
          </div>
        </div>
        <div class="cube">1</div>
        <div><button>Snap</button></div>
        <div><button>Histórico</button></div>
        <div><button>Chat</button></div>
      </div>
    </div>
    <div class="half">
      <div class="column" v-for="index in 3" :key="index">
        <div class="card" v-for="cardIndex in 4" :key="cardIndex"></div>
      </div>
      <div class="hand-card">
        <div>
          <div class="hand-column">
            <div class="card" v-for="cardIndex in 7" :key="cardIndex">
              <div class="flex">
                <div>1</div>
                <div>6</div>
              </div>
              <div>O que a carta faz</div>
            </div>
          </div>
        </div>
        <div class="hand-detail">
          <div>Charles</div>
          <div class="stamina">1</div>
          <div><button>Finalizar turno</button></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.board {
  display: flex;
  justify-content: space-between;
  width: 100%;
  flex-direction: column;
}

.half {
  flex: 1;
  display: flex;
  flex-direction: row;
  width: 1056px;
}

.column {
  padding: 10px;
  border: 1px solid #ccc;
  margin: 5px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  width: auto;
  position: relative;
}

.divider {
  width: 100%;
  height: 2px;
  background-color: #ccc;
}

.card {
  flex: 1;
  padding: 10px;
  border: 1px solid #ccc;
  margin: 5px;
  height: 80px;
  width: 60px;
  border-radius: 10px;
}

.field {
  width: 172px;
  display: flex;
  justify-content: center;
  padding: 10px;
}

.field-column {
  border: 1px solid #ccc;
  width: 60px;
  height: 80px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.hand-card {
  display: flex;
  justify-content: space-between;
  width: 100%;
  align-items: center;
}

.hand-column {
  padding: 10px;
  border: 1px solid #ccc;
  margin: 5px;
  display: flex;
  width: auto;
  position: relative;
}

.hand-detail {
  display: flex;
  flex-direction: column;
}

.stamina {
  border: 1px solid blue;
  border-radius: 25px;
  padding: 20px;
  color: blue;
  width: -1px;
  margin: auto;
}

.middle {
  padding: 10px;
  border: 1px solid #ccc;
  margin: 5px;
  display: flex;
  justify-content: space-between;
  width: 500px;
  align-items: center;
}

.cube {
  border: 1px solid purple;
  padding: 20px;
  color: purple;
}

.progress {
  width: 100px;
  background-color: #ddd;
}

.progress-bar {
  height: 30px;
  background-color: #4caf50;
}

.flex {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.hand-column .card {
  padding: 0;
}

.hand-column .card .flex {
  margin-top: -10px;
}

.hand-column .card .flex div:nth-child(1) {
  color: blue;
  border: 1px solid blue;
  border-radius: 10px;
  padding: 2px;
  font-weight: bold;
}

.hand-column .card .flex div:nth-child(2) {
  color: orange;
  border: 1px solid orange;
  border-radius: 10px;
  padding: 2px;
  font-weight: bold;
}
</style>
