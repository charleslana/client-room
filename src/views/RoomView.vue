<template>
  <div v-if="player && room">
    <div class="flex custom-flex">
      <div>
        <h1>{{ $route.params.roomName }}</h1>
        <p>
          Jogador: <b>{{ playerName }}</b>
        </p>
        <p>
          Senha: <b>{{ room.password ? `(senha: ${room.password})` : '' }}</b>
          <button v-if="player.isRoomOwner" @click="changeRoomPassword">configurar senha</button>
        </p>
        <p>
          Dono da sala: <b>{{ player.isRoomOwner ? 'sim' : 'não' }}</b>
        </p>
        <button @click="leaveRoom">Sair</button>
      </div>
      <div>
        Iniciar batalha contra:
        {{ opponent && room.players.length > 1 ? opponent.name : 'esperando jogador' }}
        <button
          v-if="room.players.length === 1 || (player.isRoomOwner && opponent && !opponent.hasReady)"
        >
          Aguardando oponente
        </button>
        <button v-else-if="player.isRoomOwner" @click="startBattle">Iniciar partida</button>
        <button v-else-if="!isReady" @click="togglePlayerReady">Estou pronto</button>
        <button v-else @click="togglePlayerReady">Cancelar</button>
      </div>
    </div>
    <br />
    <br />
    <div class="flex">
      <div class="user-list">
        <h1>Lista de usuários ({{ room.players.length }})</h1>
        <ul>
          <li
            v-for="(p, index) in room.players"
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
        <h1>Mensagens da sala</h1>
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
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import type { IPlayer } from '@/interface/IPlayer';
import type { IChat } from '@/interface/IChat';
import type { IRoom } from '@/interface/IRoom';

const playerStore = usePlayerStore();
const playerName = playerStore.playerName;
const roomName = router.currentRoute.value.params.roomName;
const player = ref<IPlayer>();
const room = ref<IRoom>();
const chatMessagesRef = ref<HTMLElement | null>(null);
const chatMessages = ref<IChat[]>([]);
const message = ref('');
const opponent = ref<IPlayer>();
const isReady = ref<boolean>(false);

onMounted(() => {
  socket.emit('get-user-room-info', roomName);
  socket.emit('get-in-room', roomName);
  socket.emit('get-chat-messages-in-room', roomName);
});

onUnmounted(() => {
  socket.removeListener('leave-room-success');
  socket.removeListener('user-room-info');
  socket.removeListener('in-room');
  socket.removeListener('receive-message-in-room');
  socket.removeListener('leave-room-automatically');
  socket.removeListener('room-info');
  socket.removeListener('room-opponent');
  socket.removeListener('start-battle-success');
});

watch(
  room,
  () => {
    socket.emit('get-opponent-in-room', roomName);
  },
  {
    deep: true
  }
);

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

const changeRoomPassword = (): void => {
  if (room.value) {
    const newPassword = window.prompt(
      'digite a senha (max. 6 caracteres) (deixe em branco para remover a senha):',
      room.value.password
    );
    if (newPassword !== room.value.password) {
      socket.emit('change-room-password', roomName, newPassword);
    }
  }
};

const togglePlayerReady = (): void => {
  isReady.value = !isReady.value;
  socket.emit('update-player-room-ready', roomName, isReady.value);
  socket.emit('get-in-room', roomName);
};

const startBattle = (): void => {
  socket.emit('start-battle', roomName);
};

socket.on('leave-room-success', () => {
  router.replace({ name: 'lobby' });
});

socket.on('user-room-info', (iPlayer: IPlayer, iRoom: IRoom) => {
  player.value = iPlayer;
  room.value = iRoom;
});

socket.on('in-room', (iRoom: IRoom) => {
  room.value = iRoom;
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

socket.on('room-info', (iRoom: IRoom) => {
  room.value = iRoom;
});

socket.on('room-opponent', (iPlayer: IPlayer | undefined) => {
  opponent.value = iPlayer;
});

socket.on('start-battle-success', () => {
  router.push({ name: 'battle' });
});
</script>

<style scoped>
.custom-flex {
  justify-content: space-between;
  align-items: center;
}
</style>
