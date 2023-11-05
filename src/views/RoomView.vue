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
        <div class="flex flex-column">
          <div>
            <h1>Criar sala</h1>
            <input
              v-model="newRoom"
              placeholder="Nome da Sala"
              @keydown.enter.prevent="createRoom"
            />
            <div>
              <small v-if="messageFailed">{{ messageFailed }}</small>
            </div>
            <button @click="createRoom">Criar Sala</button>
          </div>
          <div class="rooms">
            <div v-for="(room, index) in rooms" :key="index" class="room-card">
              <h2>{{ room }}</h2>
              <button @click="joinRoom(room)">Entrar</button>
            </div>
          </div>
        </div>
      </div>
      <div class="user-list">
        <h1>Lista de usuários ({{ players.length }})</h1>
        <ul>
          <li v-for="player in players" :key="player">{{ player }}</li>
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
import { usePlayerStore } from '@/stores/playerStore';
import { useRouter } from 'vue-router';
import socket from '@/config/socket';
import { nextTick, onMounted, ref } from 'vue';
import type { IChat } from '@/interface/IChat';

const playerStore = usePlayerStore();
const playerName = playerStore.playerName;
const router = useRouter();
const players = ref<string[]>([]);
const message = ref('');
const chatMessagesRef = ref<HTMLElement | null>(null);
const chatMessages = ref<IChat[]>([]);
const currentRoom = ref('Main Room');
const newRoom = ref('');
const rooms = ref<string[]>([]);
const messageFailed = ref('');

onMounted(() => {
  if (playerName) {
    socket.emit('get-players-main-room');
    socket.emit('get-chat-messages-main-room');
    socket.emit('get-rooms');
  }
});

const scrollChat = (): void => {
  nextTick(() => {
    if (chatMessagesRef.value) {
      chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight;
    }
  });
};

const leaveRoom = (): void => {
  socket.emit('leave-main-room');
};

const sendMessage = (): void => {
  if (message.value) {
    socket.emit('send-message-main-room', message.value);
    message.value = '';
    scrollChat();
  }
};

const createRoom = (): void => {
  if (newRoom.value.trim() === '') {
    return;
  }
  messageFailed.value = '';
  socket.emit('create-room', newRoom.value);
};

const joinRoom = (room: string): void => {
  socket.emit('join-room', room);
};

window.addEventListener('load', () => {
  router.push({ name: 'home' });
});

socket.on('players-main-room', (playerList: string[]) => {
  players.value = playerList;
});

socket.on('leave-main-room-success', () => {
  router.replace({ name: 'home' });
});

socket.on('receive-message-main-room', (chat: IChat) => {
  chatMessages.value.push(chat);
  scrollChat();
});

socket.on('room-created', (roomName: string) => {
  router.replace({ name: 'room-name', params: { roomName } });
});

socket.on('room-creation-failed', (message: string) => {
  messageFailed.value = message;
});

socket.on('rooms', (roomList: string[]) => {
  rooms.value = roomList;
});

socket.on('join-room-success', (roomName: string) => {
  router.replace({ name: 'room-name', params: { roomName: roomName } });
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

.flex-column {
  flex-direction: column;
}

.rooms {
  display: flex;
  flex-wrap: wrap;
}

.room-card {
  border: 1px solid #ccc;
  padding: 10px;
  margin: 10px;
  border-radius: 5px;
}

small {
  color: red;
}
</style>
