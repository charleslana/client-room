<template>
  <div>
    <h1>HomeView</h1>
    <input
      v-model="playerName"
      ref="nameInput"
      placeholder="Digite seu nome"
      @keydown.enter.prevent="joinRoom"
    />
    <button @click="joinRoom">Entrar</button>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, type Ref } from 'vue';
import { useRouter } from 'vue-router';
import { usePlayerStore } from '@/stores/playerStore';
import socket from '@/config/socket';

const playerName = ref('');
const route = useRouter();
const playerStore = usePlayerStore();
const nameInput: Ref<HTMLElement | null> = ref(null);

const joinRoom = () => {
  socket.emit('join', playerName.value);

  socket.on('join-response', (response: string) => {
    if (response === 'success') {
      playerStore.setPlayerName(playerName.value);
      route.replace({ name: 'room' });
    } else {
      console.log('Falha ao entrar na sala');
    }
  });
};

onMounted(() => {
  if (nameInput.value) {
    nameInput.value.focus();
  }
});
</script>

<style scoped></style>
