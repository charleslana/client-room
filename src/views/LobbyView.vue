<template>
  <div>
    <h1>Lobby</h1>
    <p>
      Jogador: <b>{{ playerName }}</b>
    </p>
    <p>Sala: <b>Lobby</b></p>
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
              placeholder="Nome da Sala (letras e números)"
              @keydown.enter.prevent="createRoom"
            />
            <input
              v-model="password"
              placeholder="Senha (max. 6 caracteres)"
              @keydown.enter.prevent="createRoom"
            />
            <div>
              <small class="red" v-if="messageFailed">{{ messageFailed }}</small>
            </div>
            <button @click="createRoom">Criar Sala</button>
          </div>
          <br />
          <h1>Salas ({{ rooms.length }})</h1>
          <input
            v-model="roomNameFilter"
            placeholder="Buscar sala por nome"
            @keydown.enter.prevent="filterRoom"
          />
          <button v-if="!roomNameFiltered" @click="filterRoom">Filtrar</button>
          <button v-else @click="clearFilter">Limpar</button>
          <div class="rooms">
            <small v-if="rooms.length === 0">Nenhuma sala disponível</small>
            <div
              v-else
              v-for="(room, index) in rooms"
              :key="index"
              class="room-card bg-green"
              :class="{ 'bg-red': room.players.length >= 2 }"
            >
              <img v-if="room.password" :src="images.lockImage" alt="Ícone" class="room-icon" />
              <h2>{{ room.name }}</h2>
              <span v-if="room.players.length >= 2">Sala cheia</span>
              <button v-else @click="joinRoom(room)">Entrar</button>
            </div>
          </div>
        </div>
      </div>
      <div class="user-list">
        <h1>Lista de usuários ({{ players.length }})</h1>
        <ul>
          <li
            v-for="(player, index) in players"
            :key="index"
            :class="{ 'f-bold': player.name === playerName }"
          >
            {{ player.name }}
            <button v-if="player.name !== playerName" @click="openPrivateChat(player)">PM</button>
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
    <div v-if="privateChatOpen && selectedPlayer" class="private-chat-modal">
      <div class="header">
        <span>Chat Privado com {{ selectedPlayer.name }}</span>
        <button @click="togglePrivateChat">
          {{ privateChatMinimized ? '+' : '-' }}
        </button>
        <button @click="closePrivateChat">Fechar</button>
      </div>
      <div v-if="!privateChatMinimized" class="input-container">
        <input
          v-model="privateChatMessage"
          placeholder="Digite uma mensagem"
          ref="privateChatMessageRef"
          @keydown.enter.prevent="sendPrivateMessage"
        />
        <button @click="sendPrivateMessage">Enviar</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePlayerStore } from '@/stores/playerStore';
import { useRouter } from 'vue-router';
import socket from '@/config/socket';
import { nextTick, onMounted, onUnmounted, ref, type Ref } from 'vue';
import type { IChat } from '@/interface/IChat';
import type { IRoom } from '@/interface/IRoom';
import type { IPlayer } from '@/interface/IPlayer';
import images from '@/data/imageData';

const playerStore = usePlayerStore();
const playerName = playerStore.playerName;
const router = useRouter();
const players = ref<IPlayer[]>([]);
const message = ref('');
const chatMessagesRef = ref<HTMLElement | null>(null);
const chatMessages = ref<IChat[]>([]);
const newRoom = ref('');
const password = ref('');
const rooms = ref<IRoom[]>([]);
const messageFailed = ref('');
const roomNameFilter = ref('');
const roomNameFiltered = ref(false);
const privateChatOpen = ref(false);
const selectedPlayer = ref<IPlayer | null>(null);
const privateChatMessage = ref('');
const privateChatMinimized = ref(false);
const privateChatMessageRef: Ref<HTMLElement | null> = ref(null);

onMounted(() => {
  if (playerName) {
    socket.emit('get-players-lobby-room');
    socket.emit('get-chat-messages-lobby-room');
    getRooms();
  }
});

onUnmounted(() => {
  socket.removeListener('rooms');
  socket.removeListener('players-lobby-room');
  socket.removeListener('receive-message-lobby-room');
  socket.removeListener('leave-lobby-room-success');
  socket.removeListener('room-created');
  socket.removeListener('room-creation-failed');
  socket.removeListener('join-room-success');
  socket.removeListener('join-room-error');
  socket.removeListener('filtered-rooms');
  socket.removeListener('receive-private-message');
});

window.addEventListener('load', () => {
  router.push({ name: 'home' });
});

const getRooms = (): void => {
  socket.emit('get-rooms');
  socket.on('rooms', (roomList: IRoom[]) => {
    rooms.value = roomList;
  });
};

const scrollChat = (): void => {
  nextTick(() => {
    if (chatMessagesRef.value) {
      chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight;
    }
  });
};

const leaveRoom = (): void => {
  socket.emit('leave-lobby-room');
};

const sendMessage = (): void => {
  if (message.value) {
    socket.emit('send-message-lobby-room', message.value);
    message.value = '';
    scrollChat();
  }
};

const createRoom = (): void => {
  if (newRoom.value.trim() === '') {
    return;
  }
  messageFailed.value = '';
  socket.emit('create-room', newRoom.value.trim(), password.value.trim());
};

const joinRoom = (room: IRoom): void => {
  if (room.password) {
    const password = window.prompt('A sala tem senha, digite a senha:');
    if (password !== null) {
      socket.emit('join-room', room.name, password);
    }
    return;
  }
  socket.emit('join-room', room.name, '');
};

const filterRoom = (): void => {
  if (roomNameFilter.value.trim() !== '') {
    roomNameFiltered.value = true;
    socket.emit('get-filter-room', roomNameFilter.value);
  }
};

const clearFilter = (): void => {
  roomNameFilter.value = '';
  roomNameFiltered.value = false;
  getRooms();
};

const openPrivateChat = (player: IPlayer): void => {
  selectedPlayer.value = player;
  privateChatOpen.value = true;
  nextTick(() => {
    if (privateChatMessageRef.value) {
      privateChatMessageRef.value.focus();
    }
  });
};

const closePrivateChat = (): void => {
  selectedPlayer.value = null;
  privateChatOpen.value = false;
};

const sendPrivateMessage = (): void => {
  if (selectedPlayer.value && privateChatMessage.value.trim() !== '') {
    chatMessages.value.push({
      playerName: playerName,
      message: `para ${selectedPlayer.value.name}: ${privateChatMessage.value} (PM)`
    });
    socket.emit('send-private-message', selectedPlayer.value.id, privateChatMessage.value);
    privateChatMessage.value = '';
    closePrivateChat();
  }
};

const togglePrivateChat = (): void => {
  privateChatMinimized.value = !privateChatMinimized.value;
};

socket.on('players-lobby-room', (room: IRoom) => {
  players.value = room.players;
});

socket.on('leave-lobby-room-success', () => {
  socket.disconnect();
  router.replace({ name: 'home' });
});

socket.on('receive-message-lobby-room', (chat: IChat) => {
  chatMessages.value.push(chat);
  scrollChat();
});

socket.on('room-created', (roomName: string) => {
  router.replace({ name: 'room-name', params: { roomName } });
});

socket.on('room-creation-failed', (message: string) => {
  messageFailed.value = message;
});

socket.on('rooms', (roomList: IRoom[]) => {
  rooms.value = roomList;
});

socket.on('join-room-success', (roomName: string) => {
  router.replace({ name: 'room-name', params: { roomName: roomName } });
});

socket.on('join-room-error', (message: string) => {
  alert(message);
});

socket.on('filtered-rooms', (roomList: IRoom[]) => {
  socket.removeListener('rooms');
  rooms.value = roomList;
});

socket.on('receive-private-message', (sendPlayer: string, message: string) => {
  chatMessages.value.push({
    playerName: sendPlayer,
    message: `para ${playerName}: ${message} (PM)`
  });
  scrollChat();
});
</script>

<style scoped>
.rooms {
  display: flex;
  flex-wrap: wrap;
}

.room-card {
  border: 1px solid #ccc;
  padding: 10px;
  margin: 10px;
  border-radius: 5px;
  position: relative;
}

.room-icon {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 12px;
  height: 12px;
}

.bg-green {
  background-color: green;
  color: white;
}

.bg-red {
  background-color: red;
  color: white;
}

.rooms span {
  color: white;
}

.private-chat-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  border: 1px solid #ccc;
  padding: 10px;
  max-width: 400px;
  width: 100%;
}

.private-chat-modal .header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #ccc;
  padding-bottom: 5px;
}

.private-chat-modal button {
  cursor: pointer;
  background: none;
  border: none;
  padding: 5px;
}

li {
  padding: 2px;
  list-style: none;
}
</style>
