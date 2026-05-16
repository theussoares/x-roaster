<template>
  <div class="fishing-game">

    <!-- ─── Ocean Background ─── -->
    <div class="ocean-bg">
      <div class="sky"></div>
      <div class="sea">
        <div class="wave wave-1"></div>
        <div class="wave wave-2"></div>
        <div class="wave wave-3"></div>
        <div class="sea-glow"></div>
      </div>
      <div class="bubble-field">
        <div v-for="n in 10" :key="n" class="bbl" :class="`bbl-${n}`"></div>
      </div>
    </div>

    <!-- ─── Header ─── -->
    <header class="fg-header">
      <NuxtLink to="/" class="back-btn">← Voltar</NuxtLink>
      <h1 class="fg-title">🎣 Pesca da Sorte</h1>
      <div class="chances-badge" :class="{ depleted: chances === 0 }">
        <span class="chances-num">{{ chances }}</span>
        <span class="chances-lbl">chances</span>
      </div>
    </header>

    <!-- ─── Fishing Scene ─── -->
    <div class="scene">

      <!-- Rod + line -->
      <div class="rod-wrap" :class="`gs-${gameState}`">
        <svg class="rod-svg" viewBox="0 0 130 220" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="rodGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%"   stop-color="#4a2c0a"/>
              <stop offset="40%"  stop-color="#b87333"/>
              <stop offset="100%" stop-color="#f0d080"/>
            </linearGradient>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%"   stop-color="#a0d8ef" stop-opacity="0.9"/>
              <stop offset="100%" stop-color="#a0d8ef" stop-opacity="0.2"/>
            </linearGradient>
          </defs>
          <!-- Rod body -->
          <line x1="18" y1="210" x2="118" y2="18"
                stroke="url(#rodGrad)" stroke-width="6"
                stroke-linecap="round"/>
          <!-- Guides -->
          <circle cx="45" cy="168" r="4" fill="none" stroke="#c8a060" stroke-width="2"/>
          <circle cx="72" cy="110" r="3" fill="none" stroke="#c8a060" stroke-width="2"/>
          <circle cx="98"  cy="55"  r="2.5" fill="none" stroke="#c8a060" stroke-width="1.5"/>
          <!-- Reel -->
          <rect x="8" y="188" width="22" height="16" rx="4" fill="#888" stroke="#666" stroke-width="1"/>
          <circle cx="19" cy="196" r="5" fill="#aaa" stroke="#777" stroke-width="1"/>
        </svg>

        <!-- Fishing line (CSS) -->
        <div class="f-line" :class="{ 'line-cast': gameState !== 'idle' }"></div>

        <!-- Hook bob -->
        <div class="hook" v-if="gameState !== 'idle' && gameState !== 'casting'"></div>

        <!-- ZZZ idle -->
        <div class="zzz-wrap" v-if="gameState === 'idle'">
          <span class="zz zz1">z</span>
          <span class="zz zz2">z</span>
          <span class="zz zz3">Z</span>
        </div>

        <!-- Ripple when line is in water -->
        <div class="ripple-wrap" v-if="gameState === 'waiting' || gameState === 'biting'">
          <div class="rp rp1"></div>
          <div class="rp rp2"></div>
          <div class="rp rp3"></div>
        </div>
      </div>

      <!-- Water surface divider -->
      <div class="water-surface-line"></div>
    </div>

    <!-- ─── Bottom UI Panel ─── -->
    <div class="ui-area">

      <!-- IDLE -->
      <Transition name="fade">
        <div v-if="gameState === 'idle'" class="panel">
          <p class="panel-info" v-if="chances > 0">
            Você tem <strong>{{ chances }}</strong> {{ chances === 1 ? 'chance' : 'chances' }} de pesca!
          </p>
          <p class="panel-info depleted-txt" v-else>Sem chances restantes.</p>
          <button class="btn-cast" @click="cast" :disabled="chances === 0">
            🎣&nbsp; Lançar Vara
          </button>
        </div>
      </Transition>

      <!-- CASTING / WAITING -->
      <Transition name="fade">
        <div v-if="gameState === 'casting' || gameState === 'waiting'" class="panel panel-wait">
          <div class="dots">
            <span></span><span></span><span></span>
          </div>
          <p class="wait-txt">
            {{ gameState === 'casting' ? 'Lançando a linha…' : 'Aguardando mordida…' }}
          </p>
        </div>
      </Transition>

      <!-- BITING – progress bar -->
      <Transition name="slide-up">
        <div v-if="gameState === 'biting'" class="panel panel-bite">
          <p class="bite-alert">🐟 Peixe na isca! Clique em PUXAR!</p>

          <div class="bar-wrap">
            <!-- Zone strips -->
            <div class="zone-bar">
              <div class="zone z-miss">Miss</div>
              <div class="zone z-common">Comum</div>
              <div class="zone z-rare">Raro</div>
              <div class="zone z-epic">Épico</div>
              <div class="zone z-legendary">Lendário</div>
            </div>

            <!-- Moving indicator -->
            <div class="ind-track">
              <div class="ind" :style="{ left: progress + '%' }">
                <div class="ind-arrow"></div>
              </div>
            </div>

            <!-- 100% star label -->
            <div class="bar-labels">
              <span>0%</span>
              <span>50%</span>
              <span>100% ⭐</span>
            </div>
          </div>

          <button class="btn-pull" @click="pull">PUXAR!</button>
        </div>
      </Transition>

    </div>

    <!-- ─── Reward Modal ─── -->
    <Transition name="reward-pop">
      <div class="reward-overlay" v-if="gameState === 'reward'" @click.self="resetGame">
        <div class="reward-card" :class="currentReward?.rarity">
          <div class="card-shimmer"></div>
          <div class="card-body">
            <div class="rarity-tag">{{ currentReward?.rarityLabel }}</div>
            <div class="r-icon">{{ currentReward?.icon }}</div>
            <div class="r-name">{{ currentReward?.name }}</div>
            <div class="r-desc">{{ currentReward?.description }}</div>
            <div class="r-score">
              Precisão: <span class="score-val">{{ pullScore }}%</span>
            </div>
            <button class="btn-continue" @click="resetGame">
              {{ chances > 0 ? '🎣 Pescar Novamente' : '🏆 Finalizar' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'

/* ── Types ── */
type GameState = 'idle' | 'casting' | 'waiting' | 'biting' | 'reward'
type Rarity    = 'miss' | 'common' | 'rare' | 'epic' | 'legendary'

interface Reward {
  rarity:      Rarity
  rarityLabel: string
  icon:        string
  name:        string
  description: string
}

/* ── Reward table ── */
const REWARDS: Record<Rarity, Reward> = {
  miss: {
    rarity: 'miss', rarityLabel: 'Escapou!',
    icon: '💨', name: 'Linha Vazia',
    description: 'O peixe escapou. Tente novamente!'
  },
  common: {
    rarity: 'common', rarityLabel: 'Comum',
    icon: '🐟', name: 'Peixinho Prateado',
    description: '+5 Tickets de Rifa'
  },
  rare: {
    rarity: 'rare', rarityLabel: 'Raro',
    icon: '🐠', name: 'Peixe Tropical',
    description: '+20 Tickets de Rifa'
  },
  epic: {
    rarity: 'epic', rarityLabel: 'Épico',
    icon: '🦈', name: 'Tubarão Furioso',
    description: '+50 Tickets de Rifa'
  },
  legendary: {
    rarity: 'legendary', rarityLabel: '✨ LENDÁRIO ✨',
    icon: '🐉', name: 'Dragão Marinho',
    description: '+100 Tickets + Bônus Especial!'
  },
}

function scoreToRarity(score: number): Rarity {
  if (score <= 20) return 'miss'
  if (score <= 50) return 'common'
  if (score <= 75) return 'rare'
  if (score <= 90) return 'epic'
  return 'legendary'
}

/* ── Route – read ?chances=N ── */
const route = useRoute()
const initialChances = Number(route.query.chances) || 5

/* ── State ── */
const chances       = ref(initialChances)
const gameState     = ref<GameState>('idle')
const progress      = ref(0)
const pullScore     = ref(0)
const currentReward = ref<Reward | null>(null)

let animId: number | null = null
let timers: ReturnType<typeof setTimeout>[] = []
let direction = 1
let speed     = 0.45

function clearAll() {
  if (animId !== null) { cancelAnimationFrame(animId); animId = null }
  timers.forEach(clearTimeout)
  timers = []
}

/* ── Cast ── */
function cast() {
  if (chances.value === 0) return
  chances.value--
  gameState.value = 'casting'
  direction = 1
  speed     = 0.45

  const t1 = setTimeout(() => {
    gameState.value = 'waiting'
    const bite = 1400 + Math.random() * 2200
    const t2 = setTimeout(startBiting, bite)
    timers.push(t2)
  }, 1100)
  timers.push(t1)
}

/* ── Biting animation ── */
function startBiting() {
  gameState.value = 'biting'
  progress.value  = 0

  let last: number | null = null

  function tick(ts: number) {
    if (last === null) last = ts
    const dt = ts - last
    last = ts

    progress.value += direction * speed * (dt / 10)

    if (progress.value >= 100) {
      progress.value = 100
      direction = -1
      speed = Math.min(speed + 0.04, 1.4)
    } else if (progress.value <= 0) {
      progress.value = 0
      direction = 1
      speed = Math.min(speed + 0.04, 1.4)
    }

    if (gameState.value === 'biting') animId = requestAnimationFrame(tick)
  }

  animId = requestAnimationFrame(tick)
}

/* ── Pull ── */
function pull() {
  if (gameState.value !== 'biting') return
  clearAll()

  pullScore.value     = Math.round(progress.value)
  currentReward.value = REWARDS[scoreToRarity(pullScore.value)]
  gameState.value     = 'reward'
}

/* ── Reset ── */
function resetGame() {
  clearAll()
  gameState.value     = 'idle'
  progress.value      = 0
  currentReward.value = null
}

onUnmounted(clearAll)
</script>

<style scoped>
/* ─── Base ─── */
.fishing-game {
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  font-family: 'Outfit', sans-serif;
  color: #f0f4ff;
  display: flex;
  flex-direction: column;
  user-select: none;
}

/* ─── Ocean Background ─── */
.ocean-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}
.sky {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 52%;
  background: linear-gradient(180deg, #040d1a 0%, #0b1f3a 50%, #0e2f52 100%);
}
.sea {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 52%;
  background: linear-gradient(180deg, #0a2545 0%, #061828 60%, #030f1e 100%);
  overflow: hidden;
}
.sea-glow {
  position: absolute;
  bottom: 0; left: 50%;
  transform: translateX(-50%);
  width: 70%;
  height: 200px;
  background: radial-gradient(ellipse at center, rgba(0,180,180,0.12) 0%, transparent 70%);
}

/* Waves */
.wave {
  position: absolute;
  top: 0;
  left: -100%;
  width: 300%;
  height: 60px;
  background: rgba(255,255,255,0.03);
  border-radius: 50% 50% 0 0 / 30px 30px 0 0;
  animation: waveMove linear infinite;
}
.wave-1 { animation-duration: 8s;  height: 40px; top: -10px; opacity: 0.6; }
.wave-2 { animation-duration: 11s; height: 30px; top:  -5px; opacity: 0.4; animation-direction: reverse; }
.wave-3 { animation-duration: 14s; height: 50px; top:  -18px; opacity: 0.25; }

@keyframes waveMove {
  0%   { transform: translateX(0); }
  100% { transform: translateX(33.33%); }
}

/* Bubbles */
.bubble-field { position: absolute; inset: 0; pointer-events: none; }
.bbl {
  position: absolute;
  bottom: -20px;
  border-radius: 50%;
  background: rgba(120,200,255,0.15);
  border: 1px solid rgba(120,200,255,0.25);
  animation: bubbleRise linear infinite;
}
.bbl-1  { width:6px;  height:6px;  left:8%;   animation-duration:7s;  animation-delay:0s;   }
.bbl-2  { width:4px;  height:4px;  left:18%;  animation-duration:9s;  animation-delay:1.5s; }
.bbl-3  { width:8px;  height:8px;  left:28%;  animation-duration:6s;  animation-delay:0.8s; }
.bbl-4  { width:3px;  height:3px;  left:38%;  animation-duration:11s; animation-delay:3s;   }
.bbl-5  { width:5px;  height:5px;  left:50%;  animation-duration:8s;  animation-delay:2s;   }
.bbl-6  { width:7px;  height:7px;  left:60%;  animation-duration:10s; animation-delay:0.5s; }
.bbl-7  { width:4px;  height:4px;  left:72%;  animation-duration:7s;  animation-delay:4s;   }
.bbl-8  { width:9px;  height:9px;  left:80%;  animation-duration:12s; animation-delay:1s;   }
.bbl-9  { width:3px;  height:3px;  left:88%;  animation-duration:9s;  animation-delay:2.5s; }
.bbl-10 { width:6px;  height:6px;  left:95%;  animation-duration:6s;  animation-delay:3.5s; }

@keyframes bubbleRise {
  0%   { transform: translateY(0)   translateX(0);   opacity: 0; }
  10%  { opacity: 1; }
  90%  { opacity: 0.6; }
  100% { transform: translateY(-60vh) translateX(20px); opacity: 0; }
}

/* ─── Header ─── */
.fg-header {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.75rem;
  background: rgba(0,0,0,0.35);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.back-btn {
  color: #a0b8d8;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  transition: color 0.2s;
}
.back-btn:hover { color: #fff; }

.fg-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  background: linear-gradient(90deg, #7ee8fa, #80ff72);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.chances-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(0,150,255,0.15);
  border: 1px solid rgba(0,180,255,0.3);
  border-radius: 12px;
  padding: 0.4rem 1rem;
  transition: all 0.3s;
}
.chances-badge.depleted {
  background: rgba(255,60,60,0.12);
  border-color: rgba(255,60,60,0.3);
}
.chances-num  { font-size: 1.6rem; font-weight: 700; line-height: 1; }
.chances-lbl  { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.7; }

/* ─── Fishing Scene ─── */
.scene {
  position: relative;
  z-index: 5;
  flex: 1;
  min-height: 280px;
  display: flex;
  align-items: flex-end;
}

.water-surface-line {
  position: absolute;
  left: 0; right: 0;
  top: 50%;
  height: 2px;
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(100,200,255,0.3) 20%,
    rgba(100,200,255,0.5) 50%,
    rgba(100,200,255,0.3) 80%,
    transparent 100%);
}

/* ─── Rod ─── */
.rod-wrap {
  position: absolute;
  left: 6%;
  top: 8%;
  width: 220px;
  height: 260px;
}
.rod-svg {
  width: 130px;
  height: 220px;
  filter: drop-shadow(0 0 8px rgba(180,130,50,0.4));
}

/* Casting animation */
.rod-wrap.gs-casting .rod-svg {
  animation: rodCast 1.1s ease-in-out forwards;
}
@keyframes rodCast {
  0%   { transform: rotate(0deg); }
  30%  { transform: rotate(-20deg); }
  60%  { transform: rotate(15deg); }
  100% { transform: rotate(0deg); }
}

/* Biting shake */
.rod-wrap.gs-biting .rod-svg {
  animation: rodShake 0.4s ease-in-out infinite;
}
@keyframes rodShake {
  0%, 100% { transform: rotate(0deg); }
  25%       { transform: rotate(-3deg); }
  75%       { transform: rotate(3deg); }
}

/* Fishing line */
.f-line {
  position: absolute;
  top: 18px;
  left: 118px;
  width: 1.5px;
  height: 40px;
  background: rgba(160,216,239,0.6);
  transform-origin: top center;
  transition: height 0.8s ease;
}
.f-line.line-cast {
  height: 200px;
  animation: lineBob 2s ease-in-out infinite;
}
@keyframes lineBob {
  0%, 100% { transform: rotate(-3deg); }
  50%       { transform: rotate(3deg); }
}

/* Hook */
.hook {
  position: absolute;
  top: 218px;
  left: 112px;
  width: 12px;
  height: 12px;
  border: 2px solid #a0d8ef;
  border-top: none;
  border-radius: 0 0 10px 10px;
  animation: hookBob 2s ease-in-out infinite;
}
@keyframes hookBob {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-6px); }
}

/* ZZZ */
.zzz-wrap {
  position: absolute;
  top: 10px;
  left: 125px;
  display: flex;
  flex-direction: column-reverse;
  gap: 2px;
}
.zz {
  font-size: 0.85rem;
  font-weight: 700;
  color: rgba(160,200,255,0.7);
  animation: zzzFloat 1.8s ease-in-out infinite;
}
.zz1 { animation-delay: 0s;    font-size: 0.7rem;  }
.zz2 { animation-delay: 0.4s;  font-size: 0.85rem; }
.zz3 { animation-delay: 0.8s;  font-size: 1.1rem;  }
@keyframes zzzFloat {
  0%   { transform: translateY(0)    translateX(0);   opacity: 0.4; }
  50%  { transform: translateY(-8px) translateX(4px); opacity: 1;   }
  100% { transform: translateY(-16px) translateX(0);  opacity: 0;   }
}

/* Ripple */
.ripple-wrap {
  position: absolute;
  top: 216px;
  left: 96px;
}
.rp {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(100,200,255,0.4);
  animation: rippleOut 1.8s ease-out infinite;
}
.rp1 { width:16px; height:6px; top:-3px; left:-8px; animation-delay:0s; }
.rp2 { width:30px; height:10px; top:-5px; left:-15px; animation-delay:0.4s; }
.rp3 { width:46px; height:14px; top:-7px; left:-23px; animation-delay:0.8s; }

@keyframes rippleOut {
  0%   { transform: scale(0.6); opacity: 0.8; }
  100% { transform: scale(1.4); opacity: 0; }
}

/* ─── Bottom UI area ─── */
.ui-area {
  position: relative;
  z-index: 10;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(14px);
  border-top: 1px solid rgba(255,255,255,0.07);
}

.panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  width: 100%;
  max-width: 520px;
}

/* Idle panel */
.panel-info {
  font-size: 1rem;
  color: #a0c0e0;
  margin: 0;
}
.panel-info strong { color: #fff; }
.depleted-txt { color: #f87171; }

.btn-cast {
  padding: 0.9rem 2.8rem;
  font-size: 1.1rem;
  font-weight: 700;
  background: linear-gradient(135deg, #0070cc, #00b8d9);
  color: #fff;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  letter-spacing: 0.04em;
  box-shadow: 0 0 24px rgba(0,180,255,0.35);
  transition: transform 0.15s, box-shadow 0.15s;
}
.btn-cast:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 0 36px rgba(0,180,255,0.5);
}
.btn-cast:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Waiting panel */
.panel-wait { opacity: 0.85; }
.wait-txt { font-size: 1rem; color: #7ee8fa; letter-spacing: 0.05em; margin: 0; }
.dots { display: flex; gap: 6px; }
.dots span {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: #7ee8fa;
  animation: dotPulse 1.2s ease-in-out infinite;
}
.dots span:nth-child(2) { animation-delay: 0.2s; }
.dots span:nth-child(3) { animation-delay: 0.4s; }
@keyframes dotPulse {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50%       { transform: scale(1.5); opacity: 1; }
}

/* ─── Bite / Progress Bar panel ─── */
.panel-bite {
  gap: 1.2rem;
}
.bite-alert {
  font-size: 1.1rem;
  font-weight: 700;
  color: #ffd700;
  margin: 0;
  animation: biteAlert 0.6s ease-in-out infinite alternate;
}
@keyframes biteAlert {
  from { text-shadow: 0 0 6px rgba(255,215,0,0.4); }
  to   { text-shadow: 0 0 18px rgba(255,215,0,0.9); }
}

.bar-wrap {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* Zone colored strips */
.zone-bar {
  display: flex;
  width: 100%;
  height: 36px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.1);
}
.zone {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.75);
}
.z-miss      { flex: 0 0 20%; background: rgba(80,80,90,0.7);    }
.z-common    { flex: 0 0 30%; background: rgba(30,100,200,0.55); }
.z-rare      { flex: 0 0 25%; background: rgba(140,40,220,0.55); }
.z-epic      { flex: 0 0 15%; background: rgba(220,100,20,0.65); }
.z-legendary { flex: 0 0 10%; background: rgba(220,180,0,0.7);
               animation: legendaryGlow 0.8s ease-in-out infinite alternate; }
@keyframes legendaryGlow {
  from { box-shadow: inset 0 0 10px rgba(255,215,0,0.3); }
  to   { box-shadow: inset 0 0 24px rgba(255,215,0,0.7); }
}

/* Indicator track */
.ind-track {
  position: relative;
  width: 100%;
  height: 28px;
}
.ind {
  position: absolute;
  top: 0;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: left 0s; /* no CSS transition – JS drives it */
}
.ind-arrow {
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 14px solid #fff;
  filter: drop-shadow(0 0 6px rgba(255,255,255,0.8));
}

.bar-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.65rem;
  color: rgba(255,255,255,0.4);
  padding: 0 2px;
}

/* Pull button */
.btn-pull {
  padding: 1rem 3.5rem;
  font-size: 1.4rem;
  font-weight: 900;
  background: linear-gradient(135deg, #ff6b00, #ffcc00);
  color: #1a0a00;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  letter-spacing: 0.1em;
  box-shadow: 0 0 30px rgba(255,150,0,0.5);
  animation: pullPulse 0.7s ease-in-out infinite alternate;
}
@keyframes pullPulse {
  from { box-shadow: 0 0 20px rgba(255,150,0,0.4); transform: scale(1); }
  to   { box-shadow: 0 0 45px rgba(255,180,0,0.75); transform: scale(1.04); }
}
.btn-pull:active { transform: scale(0.96); }

/* ─── Reward Overlay ─── */
.reward-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0,0,10,0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.reward-card {
  position: relative;
  width: min(380px, 92vw);
  border-radius: 24px;
  overflow: hidden;
  border: 2px solid rgba(255,255,255,0.12);
  box-shadow: 0 0 60px rgba(0,0,0,0.6);
}

/* Rarity card backgrounds */
.reward-card.miss      { background: linear-gradient(160deg, #1a1a2e 0%, #16213e 100%); }
.reward-card.common    { background: linear-gradient(160deg, #0d1b3e 0%, #1a3560 100%);
                          border-color: rgba(80,140,255,0.3); }
.reward-card.rare      { background: linear-gradient(160deg, #1a0a3e 0%, #3a1060 100%);
                          border-color: rgba(160,80,255,0.4); }
.reward-card.epic      { background: linear-gradient(160deg, #2a0e00 0%, #5a2000 100%);
                          border-color: rgba(255,130,30,0.4); }
.reward-card.legendary { background: linear-gradient(160deg, #1a1000 0%, #3a2e00 100%);
                          border-color: rgba(255,215,0,0.5);
                          box-shadow: 0 0 80px rgba(255,200,0,0.35); }

/* Shimmer effect */
.card-shimmer {
  position: absolute;
  top: -60%;
  left: -60%;
  width: 220%;
  height: 220%;
  background: linear-gradient(
    135deg,
    transparent 35%,
    rgba(255,255,255,0.06) 50%,
    transparent 65%
  );
  animation: shimmerMove 2.5s linear infinite;
  pointer-events: none;
}
@keyframes shimmerMove {
  0%   { transform: translateX(-60%) translateY(-60%); }
  100% { transform: translateX(60%)  translateY(60%); }
}

.card-body {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 2.2rem 2rem;
  text-align: center;
}

.rarity-tag {
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  padding: 0.3rem 1rem;
  border-radius: 50px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.15);
}
.reward-card.legendary .rarity-tag {
  background: rgba(255,200,0,0.15);
  border-color: rgba(255,200,0,0.4);
  color: #ffd700;
}
.reward-card.epic .rarity-tag      { color: #ff9020; }
.reward-card.rare .rarity-tag      { color: #c080ff; }
.reward-card.common .rarity-tag    { color: #60a0ff; }
.reward-card.miss .rarity-tag      { color: #aaa; }

.r-icon {
  font-size: 4.5rem;
  line-height: 1;
  animation: iconBounce 0.6s cubic-bezier(0.36,0.07,0.19,0.97) both;
}
@keyframes iconBounce {
  0%   { transform: scale(0) rotate(-15deg); opacity: 0; }
  60%  { transform: scale(1.2) rotate(5deg); opacity: 1; }
  100% { transform: scale(1) rotate(0deg); }
}

.r-name {
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0;
}
.r-desc {
  font-size: 0.95rem;
  color: rgba(255,255,255,0.6);
  margin: 0;
}
.r-score {
  font-size: 0.8rem;
  color: rgba(255,255,255,0.45);
}
.score-val { color: #7ee8fa; font-weight: 700; }

.btn-continue {
  margin-top: 0.5rem;
  padding: 0.8rem 2.2rem;
  font-size: 1rem;
  font-weight: 700;
  background: rgba(255,255,255,0.1);
  color: #fff;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 50px;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
}
.btn-continue:hover {
  background: rgba(255,255,255,0.18);
  transform: translateY(-2px);
}

/* ─── Transitions ─── */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from,  .fade-leave-to      { opacity: 0; }

.slide-up-enter-active { transition: all 0.35s cubic-bezier(0.22,1,0.36,1); }
.slide-up-leave-active { transition: all 0.2s ease-in; }
.slide-up-enter-from   { opacity: 0; transform: translateY(30px); }
.slide-up-leave-to     { opacity: 0; transform: translateY(20px); }

.reward-pop-enter-active { transition: all 0.4s cubic-bezier(0.22,1,0.36,1); }
.reward-pop-leave-active { transition: all 0.25s ease-in; }
.reward-pop-enter-from   { opacity: 0; transform: scale(0.85); }
.reward-pop-leave-to     { opacity: 0; transform: scale(0.9); }
</style>
