<template>
  <div>
    <h1>HomeView</h1>
    <input
      v-model="playerName"
      ref="playNameRef"
      placeholder="Digite seu nome"
      @keydown.enter.prevent="joinRoom"
    />
    <div>
      <small v-if="messageFailed">{{ messageFailed }}</small>
    </div>
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
const playNameRef: Ref<HTMLElement | null> = ref(null);
const messageFailed = ref('');

onMounted(() => {
  if (playNameRef.value) {
    playNameRef.value.focus();
  }
});

const joinRoom = (): void => {
  if (playerName.value.trim() === '') {
    return;
  }
  messageFailed.value = '';
  socket.emit('join', playerName.value.trim());
};

socket.on('join-success', () => {
  playerStore.setPlayerName(playerName.value.trim());
  route.replace({ name: 'room' });
});

socket.on('user-join-failed', (message: string) => {
  messageFailed.value = message;
});
</script>

<style scoped>
small {
  color: red;
}
</style>
