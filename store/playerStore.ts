import { create } from 'zustand';

interface VideoPlayerState {
  currentPlayingId: string | null;
  videoPlayers: Map<string, any>;
  
  setCurrentPlayingId: (id: string | null) => void;
  registerPlayer: (id: string, player: any) => void;
  unregisterPlayer: (id: string) => void;
  pauseAllVideos: () => void;
}

export const useVideoPlayerStore = create<VideoPlayerState>((set, get) => ({
  currentPlayingId: null,
  videoPlayers: new Map(),
  
  setCurrentPlayingId: (id: string | null) => {
    const { currentPlayingId, videoPlayers } = get();
    
    // Prevent unnecessary state updates
    if (currentPlayingId === id) return;
    
    // Pause the currently playing video if there is one
    if (currentPlayingId && currentPlayingId !== id) {
      const currentPlayer = videoPlayers.get(currentPlayingId);
      if (currentPlayer) {
        try {
          currentPlayer.pause();
        } catch (error) {
          console.warn('Error pausing video:', error);
        }
      }
    }
    
    set({ currentPlayingId: id });
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
  
  pauseAllVideos: () => {
    const { videoPlayers } = get();
    videoPlayers.forEach((player) => {
      if (player) {
        try {
          player.pause();
        } catch (error) {
          console.warn('Error pausing video:', error);
        }
      }
    });
    set({ currentPlayingId: null });
  },
}));