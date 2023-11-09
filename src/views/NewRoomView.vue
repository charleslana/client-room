<template>
  <div v-if="player && room">
    <h1>NewRoomView</h1>
    <p>
      Jogador: <b>{{ playerName }}</b>
    </p>
    <p>
      Sala:
      <b>{{ $route.params.roomName }} {{ room.password ? `(senha: ${room.password})` : '' }}</b>
    </p>
    <p>
      Dono da sala: <b>{{ player.isRoomOwner ? 'sim' : 'não' }}</b>
    </p>
    <button @click="leaveRoom">Sair</button>
    <br />
    <br />
    <div class="flex">
      <div class="user-list">
        <h1>Lista de usuários ({{ players.length }})</h1>
        <ul>
          <li
            v-for="(p, index) in players"
            :key="index"
            :class="{ 'f-bold': p.name === player.name }"
          >
            {{ p.name }} {{ p.isRoomOwner ? '(dono)' : '' }}
            <button
              v-if="player.isRoomOwner && p.name !== player.name"
              @click="removePlayer(p.name)"
            >
              remover
            </button>
          </li>
        </ul>
      </div>
      <div class="user-message">
        <h1>Mensagens do chat</h1>
        <div class="chat-messages" ref="chatMessagesRef">
          <div v-for="(message, index) in chatMessages" :key="index">
            <strong>{{ message.playerName }}:</strong> {{ message.message }}
          </div>
        </div>
        <input
          type="text"
          placeholder="Digite uma mensagem"
          v-model="message"
          @keydown.enter.prevent="sendMessage"
        />
        <button @click="sendMessage">Enviar</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import router from '@/router';
import { usePlayerStore } from '@/stores/playerStore';
import socket from '@/config/socket';
import { nextTick, onMounted, onUnmounted, ref } from 'vue';
import type { IPlayer } from '@/interface/IPlayer';
import type { IChat } from '@/interface/IChat';
import type { IRoom } from '@/interface/IRoom';

const playerStore = usePlayerStore();
const playerName = playerStore.playerName;
const roomName = router.currentRoute.value.params.roomName;
const player = ref<IPlayer>();
const room = ref<IRoom>();
const players = ref<IPlayer[]>([]);
const chatMessagesRef = ref<HTMLElement | null>(null);
const chatMessages = ref<IChat[]>([]);
const message = ref('');

onMounted(() => {
  socket.emit('get-user-room-info', roomName);
  socket.emit('get-players-in-room', roomName);
  socket.emit('get-chat-messages-in-room', roomName);
});

onUnmounted(() => {
  socket.removeListener('leave-room-success');
  socket.removeListener('user-room-info');
  socket.removeListener('players-in-room');
  socket.removeListener('receive-message-in-room');
  socket.removeListener('leave-room-automatically');
});

window.addEventListener('load', () => {
  router.push({ name: 'home' });
});

const leaveRoom = (): void => {
  socket.emit('leave-room', roomName);
};

const scrollChat = (): void => {
  nextTick(() => {
    if (chatMessagesRef.value) {
      chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight;
    }
  });
};

const sendMessage = (): void => {
  if (message.value) {
    socket.emit('send-message-in-room', message.value, roomName);
    message.value = '';
    scrollChat();
  }
};

const removePlayer = (playerName: string): void => {
  socket.emit('remove-room-player', roomName, playerName);
};

socket.on('leave-room-success', () => {
  router.replace({ name: 'room' });
});

socket.on('user-room-info', (iPlayer: IPlayer, iRoom: IRoom) => {
  player.value = iPlayer;
  room.value = iRoom;
});

socket.on('players-in-room', (playerList: IPlayer[]) => {
  players.value = playerList;
});

socket.on('receive-message-in-room', (chat: IChat) => {
  chatMessages.value.push(chat);
  scrollChat();
});

socket.on('leave-room-automatically', (name: string) => {
  if (name === playerName) {
    leaveRoom();
  }
});
</script>

<style scoped></style>
