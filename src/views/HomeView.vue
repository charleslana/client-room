<template>
  <div>
    <h1>Entrar</h1>
    <input
      v-model="playerName"
      ref="playNameRef"
      placeholder="Nome (max. 15 caracteres)"
      @keydown.enter.prevent="joinRoom"
    />
    <small>O nome do usuário deve ser apenas letras e números.</small>
    <div>
      <small class="red" v-if="messageFailed">{{ messageFailed }}</small>
    </div>
    <button @click="joinRoom">Entrar</button>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, type Ref } from 'vue';
import { useRouter } from 'vue-router';
import { usePlayerStore } from '@/stores/playerStore';
import socket from '@/config/socket';

const playerName = ref('');
const route = useRouter();
const playerStore = usePlayerStore();
const playNameRef: Ref<HTMLElement | null> = ref(null);
const messageFailed = ref('');

onMounted(() => {
  if (playNameRef.value) {
    playNameRef.value.focus();
  }
});

onUnmounted(() => {
  socket.removeListener('join-success');
  socket.removeListener('user-join-failed');
});

const joinRoom = (): void => {
  if (playerName.value.trim() === '') {
    return;
  }
  messageFailed.value = '';
  socket.connect();
  socket.emit('join', playerName.value.trim());
};

socket.on('join-success', () => {
  playerStore.setPlayerName(playerName.value.trim());
  route.replace({ name: 'lobby' });
});

socket.on('user-join-failed', (message: string) => {
  messageFailed.value = message;
});
</script>

<style scoped></style>
