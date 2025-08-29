<template>
  <!-- Cabeçalho Fixo -->
  <header class="bg-blue-800 text-white shadow-lg px-6 py-4 fixed top-0 left-0 right-0 z-50 flex items-center justify-between">
    <div class="flex items-center">
      <img src="/favicon.ico" alt="Logo SOSJAC" class="w-8 h-8 mr-3" />
      <h1 class="text-xl font-bold">SOSJAC</h1>
    </div>
    <h2 class="text-lg font-semibold flex-1 text-center">📝 Registrar Denúncia</h2>
    <button @click="handleLogout" class="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg shadow transition">
      Sair
    </button>
  </header>

  <!-- Espaço para o header fixo -->
  <div class="h-16"></div>

  <!-- Conteúdo principal -->
  <main class="min-h-screen bg-blue-950 pt-8 pb-8 px-6">
    <div class="max-w-lg mx-auto bg-white rounded-2xl shadow-xl p-8">
      <form @submit.prevent="submit" class="space-y-6">
        <!-- Título -->
        <input
          v-model="titulo"
          type="text"
          placeholder="Título da denúncia"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-800 placeholder-gray-500"
          required
        />

        <!-- Categoria -->
        <select
          v-model="categoria"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-800"
          required
        >
          <option value="" disabled>Selecione uma categoria</option>
          <option value="iluminacao_publica">💡 ILUMINAÇÃO PÚBLICA</option>
          <option value="saneamento_basico">🚰 SANEAMENTO BÁSICO</option>
          <option value="limpeza_conservacao">🧹 LIMPEZA E CONSERVAÇÃO DAS VIAS</option>
          <option value="pavimentacao_asfalto">🛣️ PAVIMENTAÇÃO E ASFALTO</option>
          <option value="seguranca_publica">👮‍♂️ SEGURANÇA PÚBLICA</option>
          <option value="posto_saude">🏥 POSTO DE SAÚDE</option>
          <option value="outros">🔍 OUTROS</option>
        </select>

        <!-- Descrição -->
        <textarea
          v-model="descricao"
          placeholder="Descreva o problema com detalhes"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-800 placeholder-gray-500"
          rows="4"
          required
        ></textarea>

        <!-- Upload da foto -->
        <div>
          <input type="file" @change="handleFileUpload" accept="image/*" class="w-full" />
          <p v-if="fotoCarregada" class="text-green-600 text-sm mt-2">✅ Foto carregada com sucesso!</p>
          <p v-if="uploadError" class="text-red-600 text-sm mt-2">{{ uploadError }}</p>
        </div>

        <!-- Exibição das coordenadas -->
        <p class="text-sm text-gray-600">
          Localização: {{ latitude?.toFixed(6) }}, {{ longitude?.toFixed(6) }}
        </p>

        <!-- Botão de envio -->
        <button
          type="submit"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-transform duration-200 transform hover:scale-105"
          :disabled="uploading"
        >
          {{ uploading ? 'Enviando...' : 'Enviar Denúncia' }}
        </button>
      </form>
    </div>

    <!-- RODAPÉ COM AUTORIA -->
    <footer class="p-6 text-center text-blue-300 text-sm bg-blue-900 border-t border-blue-700">
      <p>Projeto desenvolvido por <strong class="text-white">Angélica Varella</strong> ❤️</p>
    </footer>
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
    if (!this.user) return this.$router.push('/login')
    await this.getLocation()
  },
  methods: {
    // ✅ ACENTO 1: Função de cálculo de distância (Haversine)
    // Adicionada para validar se a localização está perto do bairro
    getDistance(lat1, lon1, lat2, lon2) {
      const R = 6371 // Raio da Terra em km
      const dLat = (lat2 - lat1) * Math.PI / 180
      const dLon = (lon2 - lon1) * Math.PI / 180
      const a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
      return R * c // Distância em km
    },

    // ✅ ACENTO 2: Validação de distância + fallback
    async getLocation() {
      const fallbackCoords = {
        latitude: -22.956591,
        longitude: -42.953240
      }

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
              timeout: 10000,
              maximumAge: 60000
            }
          )
        })

        const lat = position.coords.latitude
        const lon = position.coords.longitude

        // ✅ Validar se está perto do bairro (2 km de raio)
        const distance = this.getDistance(lat, lon, fallbackCoords.latitude, fallbackCoords.longitude)

        if (distance > 2) {
          console.warn(`Localização muito distante (${distance.toFixed(2)} km). Usando fallback.`)
          this.latitude = fallbackCoords.latitude
          this.longitude = fallbackCoords.longitude
        } else {
          this.latitude = lat
          this.longitude = lon
          console.log('Localização obtida via GPS:', this.latitude, this.longitude)
        }
      } catch (error) {
        console.error('Erro ao obter localização:', error)
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

      const fileName = `denuncia-${Date.now()}-${file.name}`

      const { error } = await supabase.storage
        .from('fotos-denuncias')
        .upload(fileName, file)

      if (error) {
        this.uploadError = 'Erro ao carregar foto. Tente novamente.'
        this.uploading = false
        return
      }

      const { data } = supabase.storage
        .from('fotos-denuncias')
        .getPublicUrl(fileName)

      this.url_foto = data.publicUrl
      this.fotoCarregada = true
      this.uploading = false
    },

    // ✅ ACENTO 3: Garantir que latitude e longitude nunca sejam null
    async submit() {
      // Força o fallback se ainda não tiver coordenadas
      if (this.latitude === null || this.longitude === null) {
        this.latitude = -22.956591
        this.longitude = -42.953240
      }

      const descricaoFinal = this.descricao?.trim() || 'Descrição não fornecida'

      const { error } = await supabase.from('denuncia').insert({
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
        alert('Denúncia enviada com sucesso!')
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