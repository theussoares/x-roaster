<template>
  <div class="min-h-screen bg-neutral-950 text-neutral-200 font-sans selection:bg-rose-500 selection:text-white pb-20">
    <nav class="w-full p-6 flex justify-between items-center border-b border-neutral-900 bg-neutral-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div class="flex items-center gap-2">
        <Flame class="text-rose-500 w-6 h-6 animate-pulse" />
        <h1 class="font-bold text-xl tracking-tighter text-white">
          X VIBE <span class="text-rose-500">CHECK</span>
        </h1>
      </div>
      <button 
        @click="toggleLang"
        class="flex items-center gap-2 px-4 py-2 bg-neutral-900 rounded-full hover:bg-neutral-800 transition text-xs font-mono uppercase border border-neutral-800"
      >
        <Globe :size="14" />
        {{ lang === 'en' ? 'EN-US' : 'PT-BR' }}
      </button>
    </nav>

    <main class="max-w-3xl mx-auto px-4 pt-12 flex flex-col gap-8">
      <div class="text-center space-y-4">
        <h2 class="text-4xl md:text-6xl font-black tracking-tighter text-white cyber-glitch">
          {{ t.title }}
        </h2>
        <p class="text-neutral-400 text-lg max-w-lg mx-auto">
          {{ t.subtitle }}
        </p>
      </div>

      <div class="bg-neutral-900/50 p-1 rounded-2xl border border-neutral-800 shadow-2xl shadow-rose-900/10">
        <textarea
          class="w-full h-40 bg-neutral-950/80 rounded-xl p-4 text-neutral-300 focus:outline-none focus:ring-2 focus:ring-rose-500/50 resize-none font-mono text-sm"
          :placeholder="t.placeholder"
          v-model="inputText"
        ></textarea>
        <div class="p-2">
          <button
            @click="handleRoast"
            :disabled="loading || !inputText"
            class="w-full py-4 bg-rose-600 hover:bg-rose-500 disabled:bg-neutral-800 disabled:text-neutral-500 text-white font-black uppercase tracking-widest rounded-xl transition-all transform hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-rose-900/20"
          >
            <span v-if="loading" class="flex items-center gap-2">
              <RefreshCw class="animate-spin" /> {{ t.buttonLoading }}
            </span>
            <span v-else>{{ t.buttonRoast }}</span>
          </button>
        </div>
      </div>

      <div v-if="error" class="p-4 bg-red-900/20 border border-red-800 text-red-400 rounded-lg text-center text-sm font-mono">
        {{ error }}
      </div>

      <div v-if="result" class="animate-fade-in-up space-y-8">
        
        <div ref="cardRef" class="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden relative shadow-2xl shadow-neutral-950">
          <div class="bg-neutral-950 p-6 border-b border-neutral-800 flex justify-between items-center">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-gradient-to-br from-rose-500 to-purple-600 rounded-lg flex items-center justify-center font-bold text-2xl text-white">
                {{ result.verdict[0] }}
              </div>
              <div>
                <div class="text-xs text-neutral-500 font-mono uppercase tracking-widest">{{ t.shareTitle }}</div>
                <div class="text-xl font-bold text-white">{{ result.archetype }}</div>
              </div>
            </div>
            <div class="text-right">
               <div class="text-xs text-neutral-500 uppercase">VERDICT</div>
               <div class="text-rose-500 font-black text-2xl tracking-tighter">{{ result.verdict }}</div>
            </div>
          </div>

          <div class="p-6 space-y-6">
            <div class="bg-neutral-950/50 p-4 rounded-lg border border-neutral-800 italic text-neutral-400 text-sm">
              "{{ result.shortBio }}"
            </div>

            <p class="text-lg leading-relaxed text-neutral-200 font-medium">
              {{ result.roastText }}
            </p>

            <div>
              <h4 class="text-xs font-mono uppercase text-neutral-500 mb-3 flex items-center gap-2">
                <Terminal :size="12" /> {{ t.statsTitle }}
              </h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="bg-neutral-950 p-3 rounded-lg border border-neutral-800">
                   <div class="flex justify-between items-center mb-2">
                      <span class="text-sm text-neutral-400 flex items-center gap-2"><Skull :size="14"/> Cringe</span>
                      <span class="font-mono text-xs text-neutral-500">{{ result.stats.cringeLevel }}%</span>
                   </div>
                   <div class="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
                      <div class="h-full bg-rose-500" :style="{ width: result.stats.cringeLevel + '%' }"></div>
                   </div>
                </div>

                <div class="bg-neutral-950 p-3 rounded-lg border border-neutral-800">
                   <div class="flex justify-between items-center mb-2">
                      <span class="text-sm text-neutral-400 flex items-center gap-2"><Zap :size="14"/> Based</span>
                      <span class="font-mono text-xs text-neutral-500">{{ result.stats.basedLevel }}%</span>
                   </div>
                   <div class="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
                      <div class="h-full bg-blue-500" :style="{ width: result.stats.basedLevel + '%' }"></div>
                   </div>
                </div>

                <div class="bg-neutral-950 p-3 rounded-lg border border-neutral-800">
                   <div class="flex justify-between items-center mb-2">
                      <span class="text-sm text-neutral-400 flex items-center gap-2"><Terminal :size="14"/> Main Character</span>
                      <span class="font-mono text-xs text-neutral-500">{{ result.stats.mainCharacterSyndrome }}%</span>
                   </div>
                   <div class="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
                      <div class="h-full bg-yellow-500" :style="{ width: result.stats.mainCharacterSyndrome + '%' }"></div>
                   </div>
                </div>

                <div class="bg-neutral-950 p-3 rounded-lg border border-neutral-800 flex justify-between items-center">
                  <span class="text-sm text-neutral-400 flex items-center gap-2"><Brain :size="14"/> IQ Estimate</span>
                  <span class="font-bold text-white font-mono">{{ result.stats.iq }}</span>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4 pt-2">
              <div>
                <h5 class="text-xs uppercase text-green-500/80 mb-2 font-bold">Strengths (Sarcastic)</h5>
                <ul class="space-y-1">
                  <li v-for="(s, i) in result.strengths" :key="i" class="text-xs text-neutral-400 flex items-start gap-1">
                    <span class="text-green-500">+</span> {{ s }}
                  </li>
                </ul>
              </div>
              <div>
                <h5 class="text-xs uppercase text-red-500/80 mb-2 font-bold">Weaknesses</h5>
                <ul class="space-y-1">
                  <li v-for="(w, i) in result.weaknesses" :key="i" class="text-xs text-neutral-400 flex items-start gap-1">
                    <span class="text-red-500">-</span> {{ w }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <div class="bg-neutral-950 py-2 text-center border-t border-neutral-800">
            <span class="text-[10px] font-mono text-neutral-600 uppercase">Generated by X Vibe Check</span>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row gap-4">
           <button 
            @click="handleDownload"
            class="flex-1 py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <Download :size="18" /> {{ t.download }}
          </button>
        </div>

        <div class="mt-8 p-1 rounded-2xl bg-gradient-to-r from-rose-600 via-purple-600 to-blue-600">
           <a 
            :href="MONETIZATION_URL" 
            target="_blank" 
            rel="noopener noreferrer"
            class="block bg-neutral-950 hover:bg-neutral-900 transition-colors rounded-xl p-6 text-center group"
           >
             <h3 class="text-2xl font-bold text-white mb-1 group-hover:text-rose-400 transition-colors">
               {{ t.monetizationCta }}
             </h3>
             <p class="text-neutral-400 text-sm mb-4">
               {{ t.monetizationDesc }}
             </p>
             <div class="inline-flex items-center gap-2 text-rose-500 font-bold uppercase tracking-widest text-sm group-hover:gap-4 transition-all">
               Checkout <ArrowRight :size="16" />
             </div>
           </a>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { Flame, Globe, Terminal, Skull, Zap, Brain, RefreshCw, ArrowRight, Download } from 'lucide-vue-next';
import html2canvas from 'html2canvas';
import confetti from 'canvas-confetti';
import { DICTIONARY, MONETIZATION_URL } from '@/utils/constantes';
import type { Language, RoastResult } from '~/types';

const lang = ref<Language>('en');
const inputText = ref('');
const loading = ref(false);
const result = ref<RoastResult | null>(null);
const error = ref('');
const cardRef = ref<HTMLElement | null>(null);

const t = computed(() => DICTIONARY[lang.value]);

onMounted(() => {
  if (navigator.language.startsWith('pt')) {
    lang.value = 'pt';
  }
});

const toggleLang = () => {
  lang.value = lang.value === 'en' ? 'pt' : 'en';
};

const handleRoast = async () => {
  if (!inputText.value.trim()) return;
  
  loading.value = true;
  error.value = '';
  result.value = null;

  try {
    // Chamada segura para o servidor Nuxt
    const data = await $fetch<RoastResult>('/api/roast', {
      method: 'POST',
      body: { input: inputText.value, language: lang.value }
    });
    
    result.value = data;
    
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f43f5e', '#0ea5e9', '#ffffff']
    });
  } catch (err) {
    console.error(err);
    error.value = t.value.error;
  } finally {
    loading.value = false;
  }
};

const handleDownload = async () => {
  if (cardRef.value) {
    const canvas = await html2canvas(cardRef.value, {
      backgroundColor: '#0a0a0a',
      scale: 2,
    });
    const link = document.createElement('a');
    link.download = `vibe-check-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }
};
</script>

<style>
.cyber-glitch {
  text-shadow: 2px 0 #f43f5e, -2px 0 #0ea5e9;
}
</style>