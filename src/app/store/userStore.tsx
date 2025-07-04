import { create } from 'zustand'

// Tipos para los estados
interface User {
  id: string
  nombre: string
  email: string
  // Agrega aquí las propiedades reales de tu usuario
}

interface Config {
  tema: string
  idioma: string
  // Agrega aquí las propiedades reales de tu configuración
}

// 1️⃣ Store de usuario
interface UserStore {
  user: User | null
  loading: boolean
  setUser: (userData: User | null) => void
  setLoading: (state: boolean) => void
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  loading: false,
  setUser: (userData) => set({ user: userData }),
  setLoading: (state) => set({ loading: state }),
}))

// 2️⃣ Store de configuración
interface ConfigStore {
  config: Config | null
  setConfig: (configData: Config | null) => void
}

export const useConfigStore = create<ConfigStore>((set) => ({
  config: null,
  setConfig: (configData) => set({ config: configData }),
}))