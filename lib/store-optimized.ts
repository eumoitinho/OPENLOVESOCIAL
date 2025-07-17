import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';

// Exemplo de store otimizada
interface StoreState {
  // Estado
  user: any;
  posts: any[];
  isLoading: boolean;
  
  // Actions
  setUser: (user: any) => void;
  setPosts: (posts: any[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useStore = create<StoreState>()(
  subscribeWithSelector((set) => ({
    // Estado inicial
    user: null,
    posts: [],
    isLoading: false,
    
    // Actions otimizadas
    setUser: (user) => set({ user }, false, 'setUser'),
    setPosts: (posts) => set({ posts }, false, 'setPosts'),
    setLoading: (isLoading) => set({ isLoading }, false, 'setLoading'),
  }))
);

// Selectors otimizados
export const useUser = () => useStore((state) => state.user);
export const usePosts = () => useStore((state) => state.posts);
export const useIsLoading = () => useStore((state) => state.isLoading);

// Selector com shallow comparison para múltiplos valores
export const useUserAndPosts = () => 
  useStore(
    (state) => ({ user: state.user, posts: state.posts }),
    shallow
  );
