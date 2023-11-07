<template>
  <div v-if="player">
    <h1>NewRoomView</h1>
    <p>Jogador: {{ playerName }}</p>
    <p>Sala: {{ $route.params.roomName }}</p>
    <p>Dono da sala: {{ player.isRoomOwner ? 'sim' : 'não' }}</p>
    <button @click="leaveRoom">Sair</button>
  </div>
</template>

<script setup lang="ts">
import router from '@/router';
import { usePlayerStore } from '@/stores/playerStore';
import socket from '@/config/socket';
import { onMounted, onUnmounted, ref } from 'vue';
import type { IPlayer } from '@/interface/IPlayer';

const playerStore = usePlayerStore();
const playerName = playerStore.playerName;
const roomName = router.currentRoute.value.params.roomName;
const player = ref<IPlayer>();

onMounted(() => {
  socket.emit('get-user-room-info', roomName);
});

onUnmounted(() => {
  socket.removeListener('leave-room-success');
  socket.removeListener('user-room-info');
});

window.addEventListener('load', () => {
  router.push({ name: 'home' });
});

const leaveRoom = (): void => {
  socket.emit('leave-room', roomName);
};

socket.on('leave-room-success', () => {
  router.replace({ name: 'room' });
});

socket.on('user-room-info', (iPlayer: IPlayer) => {
  player.value = iPlayer;
});
</script>

<style scoped></style>
