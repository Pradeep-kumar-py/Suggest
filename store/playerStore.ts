import { create } from 'zustand';

interface VideoPlayerState {
  currentPlayingId: string | null;
  setCurrentPlayingId: (id: string | null) => void;
  pauseAllVideos: () => void;
  videoPlayers: Map<string, any>;
  registerPlayer: (id: string, player: any) => void;
  unregisterPlayer: (id: string) => void;
}

export const useVideoPlayerStore = create<VideoPlayerState>((set, get) => ({
  currentPlayingId: null,
  videoPlayers: new Map(),
  
  setCurrentPlayingId: (id: string | null) => {
    const { currentPlayingId, videoPlayers } = get();
    
    // Pause the currently playing video if there is one
    if (currentPlayingId && currentPlayingId !== id) {
      const currentPlayer = videoPlayers.get(currentPlayingId);
      if (currentPlayer) {
        currentPlayer.pause();
      }
    }
    
    set({ currentPlayingId: id });
  },
  
  pauseAllVideos: () => {
    const { videoPlayers } = get();
    videoPlayers.forEach((player) => {
      if (player) {
        player.pause();
      }
    });
    set({ currentPlayingId: null });
  },
  
  registerPlayer: (id: string, player: any) => {
    const { videoPlayers } = get();
    const newPlayers = new Map(videoPlayers);
    newPlayers.set(id, player);
    set({ videoPlayers: newPlayers });
  },
  
  unregisterPlayer: (id: string) => {
    const { videoPlayers, currentPlayingId } = get();
    const newPlayers = new Map(videoPlayers);
    newPlayers.delete(id);
    
    // If the removed player was currently playing, reset currentPlayingId
    if (currentPlayingId === id) {
      set({ currentPlayingId: null });
    }
    
    set({ videoPlayers: newPlayers });
  },
}));