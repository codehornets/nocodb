import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    email: '',
    password: '',
  }),
  actions: {
    setEmail(email: string) {
      this.email = email
    },
    setPassword(password: string) {
      this.password = password
    },
  },
})
