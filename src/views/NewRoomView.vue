<template>
  <div>
    <h1>NewRoomView</h1>
    <p>Jogador: {{ playerName }}</p>
    <p>Sala: {{ $route.params.roomName }}</p>
  </div>
</template>

<script setup lang="ts">
import router from '@/router';
import { usePlayerStore } from '@/stores/playerStore';

const playerStore = usePlayerStore();
const playerName = playerStore.playerName;

window.addEventListener('load', () => {
  router.push({ name: 'home' });
});
</script>

<style scoped></style>
