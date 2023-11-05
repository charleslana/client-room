<template>
  <div>
    <h1>RoomView</h1>
    <p>Jogador: {{ playerName }}</p>
    <p>Sala: {{ currentRoom }}</p>
    <button @click="leaveRoom">Sair</button>
    <br />
    <br />
    <div class="flex">
      <div class="create-room">
        <h1>Criar sala</h1>
        <input v-model="newRoom" placeholder="Nome da Sala" @keydown.enter.prevent="createRoom" />
        <button @click="createRoom">Criar Sala</button>
      </div>
      <div class="user-list">
        <h1>Lista de usuários ({{ players.length }})</h1>
        <ul>
          <li v-for="player in players" :key="player">{{ player }}</li>
        </ul>
      </div>
      <div class="user-message">
        <h1>Mensagens do chat</h1>
        <div class="chat-messages" ref="messagesRef">
          <div v-for="message in chatMessages" :key="message.id">
            <strong>{{ message.playerName }}:</strong> {{ message.text }}
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
import { usePlayerStore } from '@/stores/playerStore';
import { useRouter } from 'vue-router';
import socket from '@/config/socket';
import { onMounted, ref } from 'vue';

const playerStore = usePlayerStore();
const playerName = playerStore.playerName;
const router = useRouter();
const players = ref<string[]>([]);
const message = ref('');
const messagesRef = ref<HTMLElement | null>(null);
const chatMessages = ref<ChatMessage[]>([]);
const currentRoom = ref('Main Room');
const newRoom = ref('');

interface ChatMessage {
  id: number;
  playerName: string;
  text: string;
}

const leaveRoom = () => {
  socket.emit('leave-main-room', playerName);
  socket.emit('logout');
  router.push({ name: 'home' });
};

const sendMessage = () => {
  if (message.value) {
    if (messagesRef.value) {
      messagesRef.value.scrollTop = messagesRef.value.scrollHeight;
    }
    const chatMessage: ChatMessage = {
      id: 0,
      playerName: playerName,
      text: message.value
    };
    socket.emit('send-message-main-room', chatMessage);
    message.value = '';
  }
};

const createRoom = () => {
  if (newRoom.value.trim() === '') {
    return;
  }
  socket.emit('leave-main-room', playerName);
  socket.emit('create-room', newRoom.value, playerName);
  router.replace({ name: 'room-name', params: { roomName: newRoom.value } });
};

window.addEventListener('load', () => {
  router.push({ name: 'home' });
});

socket.on('players-main-room', (playerList: string[]) => {
  players.value = playerList;
});

socket.on('receive-message-main-room', (receivedMessage: ChatMessage) => {
  chatMessages.value.push(receivedMessage);

  if (messagesRef.value) {
    messagesRef.value.scrollTop = messagesRef.value.scrollHeight;
  }
});

onMounted(() => {
  if (playerName) {
    socket.emit('get-players-main-room');
    socket.emit('get-chat-messages-main-room', playerName);
  }
});
</script>

<style scoped>
.flex {
  display: flex;
}

.user-list {
  width: 100%;
  border: 1px solid green;
}

.create-room {
  width: 100%;
  border: 1px solid gray;
}

.user-message {
  width: 100%;
  border: 1px solid orange;
  display: flex;
  flex-direction: column;
}

.chat-messages {
  height: 300px;
  overflow-y: scroll;
  scroll-behavior: smooth;
  border: 1px solid blue;
}
</style>
