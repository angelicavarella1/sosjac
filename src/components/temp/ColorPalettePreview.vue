<template>
  <div class="p-6 bg-gray-100 min-h-screen font-sans text-gray-800">
    <h1 class="text-3xl font-bold mb-8 border-b-2 border-gray-200 pb-2">
      🎨 Paleta de Cores – Famílias Visuais
    </h1>

    <ColorFamily title="⚪ Neutros (Cinzas & Brancos)" :colors="neutrals" />
    <ColorFamily title="🔵 Azuis & Turquesas" :colors="blues" />
    <ColorFamily title="🟢 Verdes" :colors="greens" />
    <ColorFamily title="🔴 Vermelhos, Laranjas & Marrom" :colors="reds" />
    <ColorFamily title="🟣 Roxos, Lilases & Magentas" :colors="purples" />
    <ColorFamily title="🤍 Brancos & Tons Claros" :colors="lights" />
  </div>
</template>

<script setup lang="ts">
import ColorFamily from '@/components/temp/ColorFamily.vue'

const neutrals = [
  { name: 'Black', hex: '#000000', textClass: 'text-white' },
  { name: 'grey11', hex: '#1C1C1C', textClass: 'text-white' },
  { name: 'grey21', hex: '#363636', textClass: 'text-white' },
  { name: 'grey31', hex: '#4F4F4F', textClass: 'text-white' },
  { name: 'DimGray', hex: '#696969', textClass: 'text-white' },
  { name: 'Gray', hex: '#808080', textClass: 'text-white' },
  { name: 'DarkGray', hex: '#A9A9A9', textClass: 'text-white' },
  { name: 'Silver', hex: '#C0C0C0', textClass: 'text-white' },
  { name: 'LightGrey', hex: '#D3D3D3', textClass: 'text-white' },
  { name: 'Gainsboro', hex: '#DCDCDC', textClass: 'text-gray-800' },
  { name: 'WhiteSmoke', hex: '#F5F5F5', textClass: 'text-gray-800' },
  { name: 'Beige', hex: '#F5F5DC', textClass: 'text-gray-800' },
  { name: 'AntiqueWhite', hex: '#FAEBD7', textClass: 'text-gray-800' },
  { name: 'Ivory', hex: '#FFFFF0', textClass: 'text-gray-800' },
  { name: 'Linen', hex: '#FAF0E6', textClass: 'text-gray-800' },
  { name: 'Snow', hex: '#FFFAFA', textClass: 'text-gray-800' },
  { name: 'Seashell', hex: '#FFF5EE', textClass: 'text-gray-800' },
  { name: 'FloralWhite', hex: '#FFFAF0', textClass: 'text-gray-800' },
]

const blues = [
  { name: 'Navy', hex: '#000080', textClass: 'text-white' },
  { name: 'DarkBlue', hex: '#00008B', textClass: 'text-white' },
  { name: 'MediumBlue', hex: '#0000CD', textClass: 'text-white' },
  { name: 'Blue', hex: '#0000FF', textClass: 'text-white' },
  { name: 'DodgerBlue', hex: '#1E90FF', textClass: 'text-white' },
  { name: 'DeepSkyBlue', hex: '#00BFFF', textClass: 'text-white' },
  { name: 'LightSkyBlue', hex: '#87CEFA', textClass: 'text-white' },
  { name: 'SkyBlue', hex: '#87CEEB', textClass: 'text-white' },
  { name: 'LightBlue', hex: '#ADD8E6', textClass: 'text-white' },
  { name: 'SteelBlue', hex: '#4682B4', textClass: 'text-white' },
  { name: 'LightSteelBlue', hex: '#B0C4DE', textClass: 'text-white' },
  { name: 'SlateGray', hex: '#708090', textClass: 'text-white' },
  { name: 'LightSlateGray', hex: '#778899', textClass: 'text-white' },
  { name: 'MidnightBlue', hex: '#191970', textClass: 'text-white' },
  { name: 'SlateBlue', hex: '#6A5ACD', textClass: 'text-white' },
  { name: 'SlateBlue1', hex: '#836FFF', textClass: 'text-white' },
  { name: 'SlateBlue3', hex: '#6959CD', textClass: 'text-white' },
  { name: 'DarkSlateBlue', hex: '#483D8B', textClass: 'text-white' },
  { name: 'MediumSlateBlue', hex: '#7B68EE', textClass: 'text-white' },
  { name: 'CornflowerBlue', hex: '#6495ED', textClass: 'text-white' },
  { name: 'RoyalBlue', hex: '#4169E1', textClass: 'text-white' },
  { name: 'Aqua/Cyan', hex: '#00FFFF', textClass: 'text-white' },
  { name: 'DarkTurquoise', hex: '#00CED1', textClass: 'text-white' },
  { name: 'Turquoise', hex: '#40E0D0', textClass: 'text-white' },
  { name: 'MediumTurquoise', hex: '#48D1CC', textClass: 'text-white' },
  { name: 'LightSeaGreen', hex: '#20B2AA', textClass: 'text-white' },
  { name: 'DarkCyan', hex: '#008B8B', textClass: 'text-white' },
  { name: 'Teal', hex: '#008080', textClass: 'text-white' },
  { name: 'Aquamarine', hex: '#7FFFD4', textClass: 'text-white' },
  { name: 'MediumAquamarine', hex: '#66CDAA', textClass: 'text-white' },
  { name: 'CadetBlue', hex: '#5F9EA0', textClass: 'text-white' },
  { name: 'DarkSlateGray', hex: '#2F4F4F', textClass: 'text-white' },
  { name: 'PaleTurquoise', hex: '#AFEEEE', textClass: 'text-white' },
  { name: 'Azure', hex: '#F0FFFF', textClass: 'text-gray-800' },
  { name: 'LightCyan', hex: '#E0FFFF', textClass: 'text-gray-800' },
  { name: 'PowderBlue', hex: '#B0E0E6', textClass: 'text-white' },
]

const greens = [
  { name: 'DarkGreen', hex: '#006400', textClass: 'text-white' },
  { name: 'Green', hex: '#008000', textClass: 'text-white' },
  { name: 'ForestGreen', hex: '#228B22', textClass: 'text-white' },
  { name: 'LimeGreen', hex: '#32CD32', textClass: 'text-white' },
  { name: 'Lime', hex: '#00FF00', textClass: 'text-white' },
  { name: 'LawnGreen', hex: '#7CFC00', textClass: 'text-white' },
  { name: 'Chartreuse', hex: '#7FFF00', textClass: 'text-white' },
  { name: 'GreenYellow', hex: '#ADFF2F', textClass: 'text-white' },
  { name: 'YellowGreen', hex: '#9ACD32', textClass: 'text-white' },
  { name: 'OliveDrab', hex: '#6B8E23', textClass: 'text-white' },
  { name: 'DarkOliveGreen', hex: '#556B2F', textClass: 'text-white' },
  { name: 'Olive', hex: '#808000', textClass: 'text-white' },
  { name: 'MediumSpringGreen', hex: '#00FA9A', textClass: 'text-white' },
  { name: 'SpringGreen', hex: '#00FF7F', textClass: 'text-white' },
  { name: 'PaleGreen', hex: '#98FB98', textClass: 'text-gray-800' },
  { name: 'LightGreen', hex: '#90EE90', textClass: 'text-gray-800' },
  { name: 'DarkSeaGreen', hex: '#8FBC8F', textClass: 'text-white' },
  { name: 'MediumSeaGreen', hex: '#3CB371', textClass: 'text-white' },
  { name: 'SeaGreen', hex: '#2E8B57', textClass: 'text-white' },
]

const reds = [
  { name: 'Maroon', hex: '#800000', textClass: 'text-white' },
  { name: 'DarkRed', hex: '#8B0000', textClass: 'text-white' },
  { name: 'FireBrick', hex: '#B22222', textClass: 'text-white' },
  { name: 'Brown', hex: '#A52A2A', textClass: 'text-white' },
  { name: 'SaddleBrown', hex: '#8B4513', textClass: 'text-white' },
  { name: 'Sienna', hex: '#A0522D', textClass: 'text-white' },
  { name: 'Peru', hex: '#CD853F', textClass: 'text-white' },
  { name: 'Chocolate', hex: '#D2691E', textClass: 'text-white' },
  { name: 'SandyBrown', hex: '#F4A460', textClass: 'text-white' },
  { name: 'DarkKhaki', hex: '#BDB76B', textClass: 'text-white' },
  { name: 'Goldenrod', hex: '#DAA520', textClass: 'text-white' },
  { name: 'DarkGoldenrod', hex: '#B8860B', textClass: 'text-white' },
  { name: 'Khaki', hex: '#F0E68C', textClass: 'text-gray-800' },
  { name: 'NavajoWhite', hex: '#FFDEAD', textClass: 'text-gray-800' },
  { name: 'Wheat', hex: '#F5DEB3', textClass: 'text-gray-800' },
  { name: 'BurlyWood', hex: '#DEB887', textClass: 'text-gray-800' },
  { name: 'Tan', hex: '#D2B48C', textClass: 'text-gray-800' },
  { name: 'RosyBrown', hex: '#BC8F8F', textClass: 'text-gray-800' },
  { name: 'IndianRed', hex: '#CD5C5C', textClass: 'text-white' },
  { name: 'Crimson', hex: '#DC143C', textClass: 'text-white' },
  { name: 'Red', hex: '#FF0000', textClass: 'text-white' },
  { name: 'DarkOrange', hex: '#FF8C00', textClass: 'text-white' },
  { name: 'Orange', hex: '#FFA500', textClass: 'text-white' },
  { name: 'OrangeRed', hex: '#FF4500', textClass: 'text-white' },
  { name: 'Gold', hex: '#FFD700', textClass: 'text-gray-800' },
  { name: 'Yellow', hex: '#FFFF00', textClass: 'text-gray-800' },
  { name: 'LightSalmon', hex: '#FFA07A', textClass: 'text-white' },
  { name: 'Salmon', hex: '#FA8072', textClass: 'text-white' },
  { name: 'DarkSalmon', hex: '#E9967A', textClass: 'text-white' },
  { name: 'Coral', hex: '#FF7F50', textClass: 'text-white' },
  { name: 'Tomato', hex: '#FF6347', textClass: 'text-white' },
  { name: 'LightCoral', hex: '#F08080', textClass: 'text-white' },
]

const purples = [
  { name: 'Purple', hex: '#A020F0', textClass: 'text-white' },
  { name: 'DarkMagenta', hex: '#8B008B', textClass: 'text-white' },
  { name: 'Fuchsia/Magenta', hex: '#FF00FF', textClass: 'text-white' },
  { name: 'Violet', hex: '#EE82EE', textClass: 'text-white' },
  { name: 'Orchid', hex: '#DA70D6', textClass: 'text-white' },
  { name: 'Plum', hex: '#DDA0DD', textClass: 'text-white' },
  { name: 'MediumVioletRed', hex: '#C71585', textClass: 'text-white' },
  { name: 'DeepPink', hex: '#FF1493', textClass: 'text-white' },
  { name: 'HotPink', hex: '#FF69B4', textClass: 'text-white' },
  { name: 'PaleVioletRed', hex: '#DB7093', textClass: 'text-white' },
  { name: 'LightPink', hex: '#FFB6C1', textClass: 'text-white' },
  { name: 'Pink', hex: '#FFC0CB', textClass: 'text-white' },
  { name: 'MediumOrchid', hex: '#BA55D3', textClass: 'text-white' },
  { name: 'DarkOrchid', hex: '#9932CC', textClass: 'text-white' },
  { name: 'DarkViolet', hex: '#9400D3', textClass: 'text-white' },
  { name: 'BlueViolet', hex: '#8A2BE2', textClass: 'text-white' },
  { name: 'Indigo', hex: '#4B0082', textClass: 'text-white' },
  { name: 'MediumPurple', hex: '#9370DB', textClass: 'text-white' },
]

const lights = [
  { name: 'WhiteSmoke', hex: '#F5F5F5', textClass: 'text-gray-800' },
  { name: 'AliceBlue', hex: '#F0F8FF', textClass: 'text-gray-800' },
  { name: 'GhostWhite', hex: '#F8F8FF', textClass: 'text-gray-800' },
  { name: 'Honeydew', hex: '#F0FFF0', textClass: 'text-gray-800' },
  { name: 'MintCream', hex: '#F5FFFA', textClass: 'text-gray-800' },
  { name: 'Azure', hex: '#F0FFFF', textClass: 'text-gray-800' },
  { name: 'LightCyan', hex: '#E0FFFF', textClass: 'text-gray-800' },
  { name: 'PaleTurquoise', hex: '#AFEEEE', textClass: 'text-gray-800' },
  { name: 'LavenderBlush', hex: '#FFF0F5', textClass: 'text-gray-800' },
  { name: 'MistyRose', hex: '#FFE4E1', textClass: 'text-gray-800' },
  { name: 'Lavender', hex: '#E6E6FA', textClass: 'text-gray-800' },
  { name: 'Thistle', hex: '#D8BFD8', textClass: 'text-gray-800' },
]
</script>