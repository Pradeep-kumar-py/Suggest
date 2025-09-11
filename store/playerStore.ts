import { create } from 'zustand';

interface VideoPlayerState {
  currentPlayingId: string | null;
  setCurrentPlayingId: (id: string | null) => void;
  pauseAllVideos: () => void;
}

export const useVideoPlayerStore = create<VideoPlayerState>((set, get) => ({
  currentPlayingId: null,
  
  setCurrentPlayingId: (id: string | null) => {
    set({ currentPlayingId: id });
  },
  
  pauseAllVideos: () => {
    set({ currentPlayingId: null });
  },
}));