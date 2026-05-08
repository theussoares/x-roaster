<template>
  <div class="glass p-8 rounded-3xl flex flex-col gap-8 h-full min-w-[320px]">
    <div>
      <h2 class="text-2xl font-semibold mb-1">Personalizar</h2>
      <p class="text-text-muted text-sm">Crie seu design exclusivo</p>
    </div>

    <!-- Color Selection -->
    <div class="space-y-4">
      <label class="text-sm font-medium text-text-muted uppercase tracking-wider">Cores da Camisa</label>
      <div class="grid grid-cols-4 gap-3">
        <button
          v-for="color in colors"
          :key="color.value"
          @click="setShirtColor(color.value)"
          class="w-10 h-10 rounded-full border-2 transition-all duration-300 relative group"
          :class="shirtColor === color.value ? 'border-primary scale-110' : 'border-transparent'"
          :style="{ backgroundColor: color.value }"
        >
            <span class="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {{ color.name }}
            </span>
        </button>
      </div>
    </div>

    <!-- Logo Upload -->
    <div class="space-y-4">
      <label class="text-sm font-medium text-text-muted uppercase tracking-wider">Seu Logo</label>
      <div 
        class="border-2 border-dashed border-border-color rounded-2xl p-8 text-center hover:border-primary transition-colors cursor-pointer group"
        @click="fileInput?.click()"
      >
        <input 
            type="file" 
            ref="fileInput" 
            class="hidden" 
            accept="image/*" 
            @change="handleFileUpload"
        />
        <div class="flex flex-col items-center gap-2">
            <div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            </div>
            <span class="text-sm font-medium">Upload Image</span>
            <span class="text-xs text-text-muted">PNG, JPG ou SVG</span>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="mt-auto flex flex-col gap-3">
        <button @click="reset" class="text-sm text-text-muted hover:text-white transition-colors underline underline-offset-4">
            Reiniciar Design
        </button>
        <button class="btn-primary w-full justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
            Adicionar ao Carrinho
        </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCustomizer } from '~/composables/useCustomizer'

const { shirtColor, colors, setShirtColor, setLogo, reset } = useCustomizer()
const fileInput = ref<HTMLInputElement | null>(null)

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        setLogo(e.target.result as string)
      }
    }
    reader.readAsDataURL(file)
  }
}
</script>
