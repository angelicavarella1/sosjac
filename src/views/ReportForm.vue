<template>
  <div class="min-h-screen bg-blue-900 text-white px-6 py-8">
    <!-- Botão Voltar -->
    <div class="mb-6">
      <button @click="$router.back()" class="flex items-center space-x-2 text-blue-300 hover:text-blue-200">
        <span>←</span>
        <span>Voltar</span>
      </button>
    </div>

    <div class="max-w-lg mx-auto bg-blue-800 rounded-xl shadow p-6">
      <h2 class="text-2xl font-bold mb-6 text-blue-300">📝 Registrar Denúncia</h2>
      <form @submit.prevent="submit" class="space-y-4">
        <input v-model="titulo" type="text" placeholder="Título" class="w-full px-4 py-3 border border-blue-500 rounded-lg bg-blue-700 text-white placeholder-blue-200" required />
        <select v-model="categoria" class="w-full px-4 py-3 border border-blue-500 rounded-lg bg-blue-700 text-white" required>
          <option value="" disabled>Selecione uma categoria</option>
          <option value="buraco">Buraco</option>
          <option value="alagamento">Alagamento</option>
          <option value="iluminacao">Iluminação</option>
          <option value="entulho">Entulho</option>
        </select>
        <textarea v-model="descricao" placeholder="Descrição" class="w-full px-4 py-3 border border-blue-500 rounded-lg bg-blue-700 text-white placeholder-blue-200" rows="4" required></textarea>
        <input type="file" @change="handleFileUpload" class="w-full" />
        <button type="submit" class="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-semibold">
          Enviar Denúncia
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import { supabase } from '../services/supabaseClient'

export default {
  data() {
    return {
      titulo: '',
      categoria: '',
      descricao: '',
      url_foto: '',
      latitude: null,
      longitude: null
    }
  },
  async mounted() {
    await this.getLocation()
  },
  methods: {
    async getLocation() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            this.latitude = position.coords.latitude
            this.longitude = position.coords.longitude
          },
          (error) => console.error(error)
        )
      }
    },
    handleFileUpload(event) {
      const file = event.target.files[0]
      if (file) {
        this.url_foto = URL.createObjectURL(file)
      }
    },
    async submit() {
      const { data, error } = await supabase.from('denuncia').insert({
        titulo: this.titulo,
        categoria: this.categoria,
        descricao: this.descricao,
        url_foto: this.url_foto,
        latitude: this.latitude,
        longitude: this.longitude,
        email_usuario: (await supabase.auth.getUser()).data.user.email,
        status: 'registrado'
      })

      if (error) {
        alert('Erro: ' + error.message)
      } else {
        this.$router.push('/home')
      }
    }
  }
}
</script>