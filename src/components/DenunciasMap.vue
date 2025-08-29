<template>
  <div class="map-container">
    <div id="map" ref="map"></div>
  </div>
</template>

<script>
import { supabase } from '../services/supabaseClient'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Correção dos ícones
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
})

export default {
  data() { return { map: null, markers: [] } },
  async mounted() {
    this.$nextTick(async () => {
      await this.initMap()
      await this.loadReports()
    })
  },
  methods: {
    initMap() {
      const jacCoords = [-22.95693, -42.95019]
      if (this.map) this.map.remove()
      this.map = L.map('map').setView(jacCoords, 16)
      L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(this.map)
      L.marker(jacCoords).addTo(this.map).bindPopup('Jardim Atlântico Central').openPopup()
    },
    async loadReports() {
      const { data, error } = await supabase.from('denuncia').select('*')
      if (error) console.error('Erro ao carregar denúncias:', error)
      this.markers.forEach(m => this.map.removeLayer(m))
      this.markers = []
      data.forEach(r => {
        const color = r.status === 'resolvido' ? '#38a169' : r.status === 'em_andamento' ? '#dd6b20' : '#e53e3e'
        const marker = L.circleMarker([r.latitude, r.longitude], { radius: 10, fillColor: color, color: '#000', weight: 2 }).addTo(this.map)
        const popupContent = `<div style="font-family: 'Inter', sans-serif; max-width: 300px;"><h3>${r.titulo}</h3><p>Status: <strong style="color:${color}">${r.status}</strong></p><p>Categoria: ${r.categoria}</p></div>`
        marker.bindPopup(popupContent)
        this.markers.push(marker)
      })
    }
  },
  beforeUnmount() { if (this.map) this.map.remove() }
}
</script>

<style>
.map-container {
  height: 500px;
  border-radius: 12px;
  overflow: hidden;
  margin: 20px 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  background: #1e3a8a;
  border: 2px solid #3b82f6;
}
#map {
  width: 100%;
  height: 100%;
  background: #1e3a8a;
  border-radius: 10px;
}
</style>