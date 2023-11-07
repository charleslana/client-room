<template>
  <div>
    <h1>NewRoomView</h1>
    <p>Jogador: {{ playerName }}</p>
    <p>Sala: {{ $route.params.roomName }}</p>
    <button @click="leaveRoom">Sair</button>
  </div>
</template>

<script setup lang="ts">
import router from '@/router';
import { usePlayerStore } from '@/stores/playerStore';
import socket from '@/config/socket';
import { onUnmounted } from 'vue';

const playerStore = usePlayerStore();
const playerName = playerStore.playerName;
const currentRoom = router.currentRoute.value.params.roomName;

onUnmounted(() => {
  socket.removeListener('leave-room-success');
});

window.addEventListener('load', () => {
  router.push({ name: 'home' });
});

const leaveRoom = (): void => {
  socket.emit('leave-room', currentRoom);
};

socket.on('leave-room-success', () => {
  router.replace({ name: 'room' });
});
</script>

<style scoped></style>
