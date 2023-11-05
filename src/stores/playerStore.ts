import { defineStore } from 'pinia';

export const usePlayerStore = defineStore('player', {
  state: () => ({
    playerName: ''
  }),
  actions: {
    setPlayerName(name: string) {
      this.playerName = name;
    }
  }
});
