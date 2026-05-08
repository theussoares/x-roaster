import { ref } from 'vue'

const shirtColor = ref('#ffffff')
const logoUrl = ref<string | null>(null)
const isExporting = ref(false)

export const useCustomizer = () => {
  const colors = [
    { name: 'Branco', value: '#ffffff' },
    { name: 'Preto', value: '#1a1a1a' },
    { name: 'Cinza', value: '#4b5563' },
    { name: 'Azul', value: '#1e40af' },
    { name: 'Vermelho', value: '#991b1b' },
    { name: 'Verde', value: '#064e3b' },
    { name: 'Rosa', value: '#db2777' },
    { name: 'Roxo', value: '#5b21b6' }
  ]

  const setShirtColor = (color: string) => {
    console.log('Setting shirt color to:', color)
    shirtColor.value = color
  }

  const setLogo = (url: string) => {
    console.log('Setting logo URL (length):', url.length)
    logoUrl.value = url
  }

  const reset = () => {
    shirtColor.value = '#ffffff'
    logoUrl.value = null
  }

  return {
    shirtColor,
    logoUrl,
    isExporting,
    colors,
    setShirtColor,
    setLogo,
    reset
  }
}
