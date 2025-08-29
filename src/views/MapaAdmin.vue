<template>
  <!-- Cabeçalho Fixo -->
  <header class="bg-blue-800 text-white shadow-lg px-6 py-4 fixed top-0 left-0 right-0 z-50 flex items-center justify-between">
    <div class="flex items-center">
      <img src="/favicon.ico" alt="Logo SOSJAC" class="w-8 h-8 mr-3" />
      <h1 class="text-xl font-bold">SOSJAC</h1>
    </div>
    <h2 class="text-lg font-semibold flex-1 text-center">🗺️ Mapa Administrativo</h2>
    <button @click="handleLogout" class="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg shadow transition">
      Sair
    </button>
  </header>

  <!-- Espaço para o header fixo -->
  <div class="h-16"></div>

  <!-- Conteúdo principal -->
  <main class="min-h-screen bg-blue-950 pt-8 pb-8 px-6">
    <!-- Botão Voltar -->
    <div class="p-6 flex justify-end">
      <button
        @click="$router.back()"
        class="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg transition-transform duration-200 transform hover:scale-105 font-semibold"
      >
        <span>←</span>
        <span>Voltar</span>
      </button>
    </div>

    <!-- Título -->
    <div class="max-w-6xl mx-auto bg-blue-800 rounded-xl shadow p-6 mb-6 text-center">
      <h2 class="text-2xl font-bold text-white">🗺️ Mapa de Todas as Denúncias</h2>
      <p class="text-blue-200">Visualização completa para administração</p>
    </div>

    <!-- Mapa -->
    <div class="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-6">
      <div id="map" ref="map" class="w-full h-96 md:h-[500px] rounded-lg"></div>
    </div>

    <!-- ✅ RODAPÉ COM AUTORIA -->
    <footer class="p-6 text-center text-blue-300 text-sm bg-blue-900 border-t border-blue-700">
      <p>Projeto desenvolvido por <strong class="text-white">Angélica Varella</strong> ❤️</p>
    </footer>
  </main>
</template>

<script>
import { supabase } from '../services/supabaseClient'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Correção dos ícones do Leaflet (sem espaços extras)
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
})

export default {
  data() {
    return {
      user: null,
      map: null,
      markers: []
    }
  },
  async mounted() {
    const { data } = await supabase.auth.getUser()
    this.user = data.user
    if (!this.user) return this.$router.push('/login')

    const {  adminData, error } = await supabase
      .from('admins')
      .select('email')
      .eq('email', this.user.email)
      .single()

    if (error || !adminData) {
      this.$router.push('/home')
      return
    }

    this.$nextTick(() => {
      this.initMap()
      this.loadReports()
    })
  },
  methods: {
    initMap() {
      // ✅ Coordenada correta do Jardim Atlântico Central
      const jacCoords = [-22.956591, -42.953240]
      if (this.map) this.map.remove()
      this.map = L.map('map').setView(jacCoords, 16)

      L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(this.map)
    },
    getCategoriaLabel(categoria) {
      const labels = {
        iluminacao_publica: 'ILUMINAÇÃO PÚBLICA',
        saneamento_basico: 'SANEAMENTO BÁSICO',
        limpeza_conservacao: 'LIMPEZA E CONSERVAÇÃO DAS VIAS',
        pavimentacao_asfalto: 'PAVIMENTAÇÃO E ASFALTO',
        seguranca_publica: 'SEGURANÇA PÚBLICA',
        posto_saude: 'POSTO DE SAÚDE',
        outros: 'OUTROS'
      }
      return labels[categoria] || categoria
    },
    async loadReports() {
      const { data, error } = await supabase.from('denuncia').select('*').order('created_at', { ascending: false })
      if (error) {
        console.error('Erro ao carregar denúncias:', error)
        return
      }

      this.markers.forEach(m => this.map.removeLayer(m))
      this.markers = []

      data.forEach(r => {
        const color = r.status === 'resolvido' ? '#38a169' : r.status === 'em_analise' ? '#dd6b20' : '#e53e3e'
        const marker = L.circleMarker([r.latitude, r.longitude], {
          radius: 10,
          fillColor: color,
          color: '#fff',
          weight: 2,
          opacity: 0.8
        }).addTo(this.map)

        // ✅ Popup com categoria completa
        const popupContent = `
          <div class="font-sans max-w-xs">
            <h3 class="font-bold text-gray-800">${r.titulo}</h3>
            <p class="text-sm"><strong>Status:</strong> <span style="color:${color}">${r.status}</span></p>
            <p class="text-sm"><strong>Categoria:</strong> ${this.getCategoriaLabel(r.categoria)}</p>
            <p class="text-sm"><strong>Data:</strong> ${new Date(r.created_at).toLocaleString('pt-BR')}</p>
            <p class="text-sm"><strong>Usuário:</strong> ${r.email_usuario}</p>
          </div>
        `
        marker.bindPopup(popupContent)
        this.markers.push(marker)
      })
    },
    async handleLogout() {
      await supabase.auth.signOut()
      this.$router.push('/login')
    }
  },
  beforeUnmount() {
    if (this.map) this.map.remove()
  }
}
</script>

<style scoped>
#map {
  height: 500px;
  background: #f0f0f0;
  border-radius: 8px;
}
</style>