<!-- src/components/temp/ColorFamily.vue -->
<template>
  <div class="mb-10 p-6 bg-white rounded-xl shadow-md">
    <h2 class="text-xl font-semibold mb-4 text-gray-800">{{ title }}</h2>
    <div class="flex flex-wrap gap-3">
      <div
        v-for="color in colors"
        :key="color.name"
        class="w-24 h-24 rounded-lg flex flex-col items-center justify-center text-xs font-bold shadow relative group cursor-pointer transition-transform hover:scale-105"
        :class="color.textClass"
        :style="{ backgroundColor: color.hex }"
      >
        <span class="text-center break-words">{{ color.name }}</span>
        <span class="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full bg-black text-white text-[10px] rounded px-1 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {{ color.hex }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Color {
  name: string
  hex: string
  textClass: string
}

defineProps<{
  title: string
  colors: Color[]
}>()
</script>