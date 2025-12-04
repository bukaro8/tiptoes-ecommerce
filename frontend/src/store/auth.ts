import { create } from "zustand";
import { mountStoreDevtool } from "simple-zustand-devtools";

interface User {
  user_id: string | null;
  username: string | null;
}

interface AuthState {
  allUserData: User | null;
  loading: boolean;

  user: () => User;               
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  isLoggedIn: () => boolean;
}

const useAuthStore = create<AuthState>((set, get) => ({
  allUserData: null,
  loading: false,

  user: () => ({
    user_id: get().allUserData?.user_id ?? null,
    username: get().allUserData?.username ?? null,
  }),

  setUser: (user) => set({ allUserData: user }),
  setLoading: (loading) => set({ loading }),
  isLoggedIn: () => get().allUserData !== null,
}));


if (import.meta.env.DEV) {
  mountStoreDevtool("Store", useAuthStore);
}

export { useAuthStore };
