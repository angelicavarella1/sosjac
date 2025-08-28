<template>
  <!-- Cabeçalho Fixo -->
  <header class="bg-blue-800 text-white shadow-lg px-6 py-4 fixed top-0 left-0 right-0 z-50 flex items-center justify-between">
    <!-- Ícone à esquerda -->
    <div class="flex items-center">
      <img src="/favicon.ico" alt="Logo SOSJAC" class="w-8 h-8 mr-3" />
      <h1 class="text-xl font-bold">SOSJAC</h1>
    </div>

    <!-- Título da página (centro) -->
    <h2 class="text-lg font-semibold flex-1 text-center">📝 Registrar Denúncia</h2>

    <!-- Usuário e Sair (direita) -->
    <div class="flex items-center space-x-4">
      <span class="text-sm">Olá, {{ user?.email }}</span>
      <button @click="handleLogout" class="bg-red-600 hover:bg-red-500 text-white text-sm px-3 py-1 rounded-lg">
        Sair
      </button>
    </div>
  </header>

  <!-- Conteúdo principal (com espaço para o cabeçalho fixo) -->
  <main class="min-h-screen bg-blue-900 pt-24 pb-8 px-6 text-white">
    <!-- Botão Voltar (no final, lado direito) -->
    <div class="text-right mb-6">
      <button
        @click="$router.back()"
        class="flex items-center space-x-2 ml-auto px-6 py-3 bg-blue-700 hover:bg-blue-600 text-white rounded-xl shadow-lg transition-transform duration-200 transform hover:scale-105 font-semibold"
      >
        <span>←</span>
        <span>Voltar</span>
      </button>
    </div>

    <div class="max-w-lg mx-auto bg-white rounded-xl shadow p-6">
      <form @submit.prevent="submit" class="space-y-4">
        <input
          v-model="titulo"
          type="text"
          placeholder="Título"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-800 placeholder-gray-500"
          required
        />
        <select
          v-model="categoria"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-800"
          required
        >
          <option value="" disabled>Selecione uma categoria</option>
          <option value="buraco">Buraco</option>
          <option value="alagamento">Alagamento</option>
          <option value="iluminacao">Iluminação</option>
          <option value="entulho">Entulho</option>
        </select>
        <textarea
          v-model="descricao"
          placeholder="Descrição"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-800 placeholder-gray-500"
          rows="4"
          required
        ></textarea>

        <!-- Upload da foto -->
        <div>
          <input type="file" @change="handleFileUpload" accept="image/*" class="w-full" />
          <!-- Aviso de sucesso -->
          <p v-if="fotoCarregada" class="text-green-600 text-sm mt-2">✅ Foto carregada com sucesso!</p>
          <p v-if="uploadError" class="text-red-600 text-sm mt-2">{{ uploadError }}</p>
        </div>

        <!-- Exibição das coordenadas -->
        <p class="text-sm text-gray-600">Coordenadas: {{ latitude }}, {{ longitude }}</p>

        <button
          type="submit"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
          :disabled="uploading"
        >
          {{ uploading ? 'Enviando...' : 'Enviar Denúncia' }}
        </button>
      </form>
    </div>
  </main>
</template>

<script>
import { supabase } from '../services/supabaseClient'

export default {
  data() {
    return {
      user: null,
      titulo: '',
      categoria: '',
      descricao: '',
      url_foto: '',
      latitude: null,
      longitude: null,
      fotoCarregada: false,
      uploadError: '',
      uploading: false
    }
  },
  async mounted() {
    const { data } = await supabase.auth.getUser()
    this.user = data.user
    await this.getLocation()
  },
  methods: {
    async getLocation() {
      // Coordenada de fallback escolhida por você
      const fallbackCoords = {
        latitude: -22.956588,
        longitude: -42.953254
      };

      if (!navigator.geolocation) {
        console.warn('Geolocalização não suportada')
        this.latitude = fallbackCoords.latitude
        this.longitude = fallbackCoords.longitude
        return
      }

      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            resolve,
            reject,
            {
              enableHighAccuracy: true,
              timeout: 10000,      // 10 segundos
              maximumAge: 60000    // Aceita cache de até 1 minuto
            }
          )
        })

        this.latitude = position.coords.latitude
        this.longitude = position.coords.longitude
        console.log('Localização obtida via GPS:', this.latitude, this.longitude)

      } catch (error) {
        console.error('Erro ao obter localização:', error)
        // Usa a coordenada que você escolheu
        this.latitude = fallbackCoords.latitude
        this.longitude = fallbackCoords.longitude
      }
    },
    async handleFileUpload(event) {
      const file = event.target.files[0]
      if (!file) return

      this.uploading = true
      this.uploadError = ''
      this.fotoCarregada = false

      // Nome único para a foto
      const fileName = `denuncia-${Date.now()}-${file.name}`

      // Faz upload para o bucket
      const { error } = await supabase.storage
        .from('fotos-denuncias')
        .upload(fileName, file)

      if (error) {
        this.uploadError = 'Erro ao carregar foto. Tente novamente.'
        this.uploading = false
        return
      }

      // Gera URL pública
      const { data } = supabase.storage
        .from('fotos-denuncias')
        .getPublicUrl(fileName)

      this.url_foto = data.publicUrl
      this.fotoCarregada = true
      this.uploading = false
    },
    async submit() {
      // Garante que a descrição nunca seja null
      const descricaoFinal = this.descricao?.trim() || 'Descrição não fornecida'

      const { data, error } = await supabase.from('denuncia').insert({
        titulo: this.titulo.trim(),
        categoria: this.categoria,
        descricao: descricaoFinal,
        url_foto: this.url_foto,
        latitude: this.latitude,
        longitude: this.longitude,
        email_usuario: this.user.email,
        status: 'registrado'
      })

      if (error) {
        alert('Erro: ' + error.message)
      } else {
        this.$router.push('/home')
      }
    },
    async handleLogout() {
      await supabase.auth.signOut()
      this.$router.push('/login')
    }
  }
}
</script>