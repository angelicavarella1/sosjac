<template>
  <div class="max-w-2xl mx-auto px-6 py-12">
    <h2 class="text-2xl font-bold mb-6">📝 Registrar Nova Denúncia</h2>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Título -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Título da Denúncia</label>
        <input
          v-model="titulo"
          type="text"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Ex: Buraco na Rua das Palmeiras"
          required
        />
      </div>

      <!-- Categoria -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Tipo do Problema</label>
        <select
          v-model="categoria"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          required
        >
          <option value="">Selecione uma categoria</option>
          <option value="buraco">Buraco na via</option>
          <option value="entulho">Entulho ou lixo</option>
          <option value="iluminacao">Falta de iluminação</option>
          <option value="alagamento">Alagamento / drenagem</option>
          <option value="mato_alto">Mato alto / terreno irregular</option>
          <option value="estrutura_precaria">Estrutura urbana precária</option>
          <option value="sinalizacao">Falta de sinalização</option>
        </select>
      </div>

      <!-- Descrição -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
        <textarea
          v-model="descricao"
          rows="4"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Descreva o problema com detalhes"
        ></textarea>
      </div>

      <!-- Foto -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Foto (opcional)</label>
        <input
          type="file"
          accept="image/*"
          @change="handleFileUpload"
          class="w-full"
        />
        <p v-if="url_foto" class="text-sm text-green-600 mt-1">Foto selecionada com sucesso.</p>
      </div>

      <!-- Localização -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Localização</label>
        <p class="text-sm text-gray-600 mb-2">A localização será capturada automaticamente.</p>
        <button
          type="button"
          @click="getLocation"
          class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          📍 Obter Localização
        </button>
        <p v-if="latitude" class="text-sm text-gray-800 mt-2">
          <strong>Latitude:</strong> {{ latitude }}<br>
          <strong>Longitude:</strong> {{ longitude }}
        </p>
      </div>

      <!-- Botão de envio -->
      <div class="flex space-x-4">
        <button
          type="submit"
          class="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
          :disabled="loading"
        >
          {{ loading ? 'Enviando...' : 'Enviar Denúncia' }}
        </button>
        <button
          type="button"
          @click="$router.back()"
          class="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700"
        >
          Cancelar
        </button>
      </div>
    </form>
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
      longitude: null,
      loading: false
    }
  },
  async mounted() {
    const user = await this.getCurrentUser()
    if (!user) {
      this.$router.push('/login')
    }
  },
  methods: {
    async getCurrentUser() {
      const { data } = await supabase.auth.getUser()
      return data.user
    },
    async getLocation() {
      if (!navigator.geolocation) {
        alert('Geolocalização não é suportada neste navegador.')
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.latitude = position.coords.latitude
          this.longitude = position.coords.longitude
        },
        (error) => {
          console.error('Erro ao obter localização:', error)
          alert('Não foi possível obter sua localização.')
        }
      )
    },
    handleFileUpload(event) {
      const file = event.target.files[0]
      if (file) {
        // Em produção, envie ao Supabase Storage
        this.url_foto = URL.createObjectURL(file)
        alert('Foto selecionada. Em produção, será enviada ao Supabase Storage.')
      }
    },
    async handleSubmit() {
      if (!this.titulo || !this.categoria || !this.latitude || !this.longitude) {
        alert('Preencha todos os campos obrigatórios.')
        return
      }

      this.loading = true

      const { error } = await supabase.from('denuncia').insert({
        titulo: this.titulo,
        categoria: this.categoria,
        descricao: this.descricao,
        url_foto: this.url_foto,
        latitude: this.latitude,
        longitude: this.longitude,
        email_usuario: (await this.getCurrentUser()).email,
        status: 'registrado'
      })

      this.loading = false

      if (error) {
        alert('Erro ao enviar denúncia: ' + error.message)
      } else {
        alert('Denúncia enviada com sucesso!')
        this.$router.push('/home')
      }
    }
  }
}
</script>