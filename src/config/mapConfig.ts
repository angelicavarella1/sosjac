// src/config/mapConfig.ts
interface MapConfig {
  center: {
    lat: number
    lng: number
  }
  zoom: number
  tileLayerUrl: string
}

const mapConfig: MapConfig = {
  center: {
    lat: -22.956633, // Jardim Atlântico, Itaipuaçu
    lng: -42.952338
  },
  zoom: 15, // Zoom inicial
  tileLayerUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
}

export default mapConfig
