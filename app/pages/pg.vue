<template>
  <div class="pg-app">

    <!-- ─── Header ─── -->
    <header class="pg-header">
      <NuxtLink to="/" class="back-link">← Voltar</NuxtLink>
      <div class="header-title">
        <h1 class="site-title">PG <span class="accent">Connect</span></h1>
        <p class="site-sub">Atribuição de visitantes aos Pequenos Grupos</p>
      </div>
      <div class="header-badge">
        <span class="badge-num">{{ pgs.length }}</span>
        <span class="badge-lbl">PGs ativos</span>
      </div>
    </header>

    <!-- ─── Tabs ─── -->
    <div class="tab-bar">
      <button @click="tab = 'pgs'" :class="['tab-btn', { active: tab === 'pgs' }]">
        🏠 Pequenos Grupos
      </button>
      <button @click="tab = 'visitantes'" :class="['tab-btn', { active: tab === 'visitantes' }]">
        👥 Visitantes
      </button>
    </div>

    <!-- ─── Content ─── -->
    <div class="pg-content">

      <!-- ══ PGs Tab ══ -->
      <div v-if="tab === 'pgs'">
        <div class="section-header">
          <h2 class="section-title">Pequenos Grupos Cadastrados</h2>
          <button @click="openAddPG" class="btn-add">+ Adicionar PG</button>
        </div>

        <div v-if="pgs.length === 0" class="empty-state">
          <div class="empty-icon">🏠</div>
          <p>Nenhum PG cadastrado ainda.</p>
          <p class="empty-sub">Adicione os PGs para começar a atribuir visitantes.</p>
          <button @click="openAddPG" class="btn-add">Cadastrar primeiro PG</button>
        </div>

        <div class="pg-grid">
          <div
            v-for="pg in pgs"
            :key="pg.id"
            class="pg-card"
            :style="{ '--pg-color': pg.cor || '#10b981' }"
          >
            <div class="pg-card-top">
              <div class="pg-color-dot" :style="{ background: pg.cor || '#10b981' }"></div>
              <h3 class="pg-name">{{ pg.nome }}</h3>
              <div class="pg-actions">
                <button @click="editPG(pg)" class="btn-icon" title="Editar">✏️</button>
                <button @click="removePG(pg.id)" class="btn-icon btn-del" title="Remover">🗑️</button>
              </div>
            </div>
            <div class="pg-card-body">
              <div class="info-row">
                <span class="info-label">Líder</span>
                <span class="info-value">{{ pg.lider }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Bairro</span>
                <span class="info-value highlight">{{ pg.bairro }}</span>
              </div>
              <div v-if="pg.endereco" class="info-row">
                <span class="info-label">Endereço</span>
                <span class="info-value">{{ pg.endereco }}</span>
              </div>
              <div v-if="pg.diaSemana || pg.horario" class="info-row">
                <span class="info-label">Encontro</span>
                <span class="info-value">{{ [pg.diaSemana, pg.horario].filter(Boolean).join(' · ') }}</span>
              </div>
              <div v-if="pg.telefone" class="info-row">
                <span class="info-label">WhatsApp</span>
                <span class="info-value">{{ pg.telefone }}</span>
              </div>
            </div>
            <div class="pg-card-footer">
              <span class="visitors-count">
                {{ getAssignedCount(pg.id) }} visitante{{ getAssignedCount(pg.id) !== 1 ? 's' : '' }} atribuído{{ getAssignedCount(pg.id) !== 1 ? 's' : '' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- ══ Visitantes Tab ══ -->
      <div v-if="tab === 'visitantes'">

        <!-- Paste area -->
        <div class="paste-section">
          <div class="section-header">
            <h2 class="section-title">Colar Lista do WhatsApp</h2>
            <button v-if="visitantes.length > 0" @click="clearVisitantes" class="btn-ghost">Limpar tudo</button>
          </div>
          <div class="paste-box">
            <textarea
              v-model="pasteText"
              placeholder="Cole aqui a lista de visitantes copiada do WhatsApp…&#10;&#10;Visitantes: 16/05&#10;Nome: Arthur Lopes&#10;Idade: 15 anos&#10;Celular: não tem&#10;Bairro: Vila Alegre&#10;&#10;Visitantes: 16/05&#10;Nome: Karina&#10;…"
              class="visitor-textarea"
            ></textarea>
            <button @click="parseVisitantes" class="btn-parse" :disabled="!pasteText.trim()">
              ⚡ Processar Visitantes
            </button>
          </div>
          <p v-if="parseError" class="parse-error">{{ parseError }}</p>
        </div>

        <!-- Warning if no PGs -->
        <div v-if="visitantes.length > 0 && pgs.length === 0" class="warn-box">
          ⚠️ Nenhum PG cadastrado. <button @click="tab = 'pgs'" class="btn-link">Cadastre os PGs primeiro</button>.
        </div>

        <!-- Visitor cards -->
        <div v-if="visitantes.length > 0" class="visitors-section">
          <div class="visitors-stats">
            <span>{{ visitantes.length }} visitante{{ visitantes.length !== 1 ? 's' : '' }}</span>
            <span class="dot">·</span>
            <span class="stat-assigned">{{ assignedCount }} atribuído{{ assignedCount !== 1 ? 's' : '' }}</span>
            <span class="dot">·</span>
            <span class="stat-pending">{{ visitantes.length - assignedCount }} pendente{{ (visitantes.length - assignedCount) !== 1 ? 's' : '' }}</span>
          </div>

          <div class="visitor-list">
            <div
              v-for="visitor in visitantes"
              :key="visitor.id"
              class="visitor-card"
              :class="{ assigned: visitor.pgAtribuido }"
            >
              <div class="visitor-top">
                <div class="visitor-info">
                  <h3 class="visitor-name">{{ visitor.nome }}</h3>
                  <div class="visitor-meta">
                    <span v-if="visitor.idade">🎂 {{ visitor.idade }} anos</span>
                    <span v-if="visitor.celular && visitor.celular.toLowerCase() !== 'não tem'">📱 {{ visitor.celular }}</span>
                    <span class="bairro-tag">📍 {{ visitor.bairro || 'Bairro não informado' }}</span>
                    <span v-if="visitor.data" class="data-tag">📅 {{ visitor.data }}</span>
                  </div>
                </div>
                <div v-if="visitor.pgAtribuido" class="assigned-status">
                  <span class="check-icon">✓</span>
                  <div class="assigned-info">
                    <span class="assigned-label">Atribuído ao PG</span>
                    <span class="assigned-pg-name">{{ getPGName(visitor.pgAtribuido) }}</span>
                  </div>
                  <button @click="visitor.pgAtribuido = undefined" class="btn-reassign">Alterar</button>
                </div>
              </div>

              <!-- PG Suggestions -->
              <div v-if="!visitor.pgAtribuido" class="suggestions-area">
                <div v-if="pgs.length === 0" class="no-pgs-hint">
                  Cadastre PGs na aba "Pequenos Grupos"
                </div>
                <template v-else>
                  <p class="suggestions-label">PGs sugeridos (por proximidade de bairro):</p>
                  <div class="suggestions-list">
                    <div
                      v-for="(pg, i) in getSuggestions(visitor.bairro)"
                      :key="pg.id"
                      class="suggestion-item"
                      :class="{ 'is-match': isNeighborhoodMatch(visitor.bairro, pg.bairro) }"
                    >
                      <div class="sug-rank" :style="{ background: pg.cor || '#10b981' }">{{ i + 1 }}</div>
                      <div class="sug-details">
                        <strong>{{ pg.nome }}</strong>
                        <span>{{ pg.lider }} · {{ pg.bairro }}</span>
                        <span v-if="pg.diaSemana || pg.horario" class="sug-schedule">
                          🕐 {{ [pg.diaSemana, pg.horario].filter(Boolean).join(' ') }}
                        </span>
                      </div>
                      <div class="sug-right">
                        <span v-if="isNeighborhoodMatch(visitor.bairro, pg.bairro)" class="match-badge">mesmo bairro</span>
                        <button @click="assignVisitor(visitor.id, pg.id)" class="btn-assign">
                          Atribuir
                        </button>
                      </div>
                    </div>
                    <div v-if="getSuggestions(visitor.bairro).length === 0" class="no-suggestions">
                      Nenhum PG encontrado.
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>

        <!-- Export -->
        <div v-if="assignedCount > 0" class="export-section">
          <div class="export-header">
            <h2 class="section-title">Resumo para WhatsApp</h2>
            <button @click="copyToClipboard" class="btn-copy" :class="{ copied: justCopied }">
              {{ justCopied ? '✓ Copiado!' : '📋 Copiar' }}
            </button>
          </div>
          <div class="export-preview">
            <div v-for="pg in pgsWithVisitors" :key="pg.id" class="export-pg-block">
              <div class="export-pg-name">🏠 {{ pg.nome }} — {{ pg.bairro }}</div>
              <div class="export-pg-leader">Líder: {{ pg.lider }}{{ pg.telefone ? ' · ' + pg.telefone : '' }}</div>
              <div v-for="v in pg.visitors" :key="v.id" class="export-visitor-row">
                • {{ v.nome }} ({{ v.idade }} anos{{ (v.celular && v.celular.toLowerCase() !== 'não tem') ? ' · ' + v.celular : '' }}) — {{ v.bairro }}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- ─── Add/Edit PG Modal ─── -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
          <div class="modal-box">
            <div class="modal-header">
              <h2>{{ editingPG ? 'Editar PG' : 'Novo Pequeno Grupo' }}</h2>
              <button @click="closeModal" class="modal-close">✕</button>
            </div>
            <form @submit.prevent="savePG" class="pg-form">
              <div class="form-group">
                <label>Nome do PG *</label>
                <input v-model="form.nome" placeholder="Ex: PG da Família Silva" required />
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Líder *</label>
                  <input v-model="form.lider" placeholder="Nome do líder" required />
                </div>
                <div class="form-group">
                  <label>WhatsApp do líder</label>
                  <input v-model="form.telefone" placeholder="67 9 9999-9999" />
                </div>
              </div>
              <div class="form-group">
                <label>Bairro *</label>
                <input v-model="form.bairro" placeholder="Ex: Nova Três Lagoas" required />
              </div>
              <div class="form-group">
                <label>Endereço</label>
                <input v-model="form.endereco" placeholder="Rua, número (opcional)" />
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Dia da semana</label>
                  <select v-model="form.diaSemana">
                    <option value="">Selecionar</option>
                    <option>Segunda-feira</option>
                    <option>Terça-feira</option>
                    <option>Quarta-feira</option>
                    <option>Quinta-feira</option>
                    <option>Sexta-feira</option>
                    <option>Sábado</option>
                    <option>Domingo</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Horário</label>
                  <input v-model="form.horario" placeholder="Ex: 19:30" />
                </div>
              </div>
              <div class="form-group">
                <label>Cor de identificação</label>
                <div class="color-picker">
                  <button
                    v-for="color in PG_COLORS"
                    :key="color"
                    type="button"
                    @click="form.cor = color"
                    class="color-swatch"
                    :class="{ selected: form.cor === color }"
                    :style="{ background: color }"
                    :title="color"
                  ></button>
                </div>
              </div>
              <div class="form-actions">
                <button type="button" @click="closeModal" class="btn-cancel">Cancelar</button>
                <button type="submit" class="btn-submit">
                  {{ editingPG ? 'Salvar alterações' : 'Criar PG' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

/* ─── Types ─── */
interface PG {
  id: string
  nome: string
  lider: string
  bairro: string
  endereco?: string
  diaSemana?: string
  horario?: string
  telefone?: string
  cor?: string
}

interface Visitante {
  id: string
  nome: string
  idade: string
  celular: string
  bairro: string
  data: string
  pgAtribuido?: string
}

/* ─── Constants ─── */
const PG_COLORS = [
  '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b',
  '#ef4444', '#06b6d4', '#f97316', '#84cc16',
  '#ec4899', '#14b8a6'
]

const DEFAULT_FORM = () => ({
  nome: '', lider: '', bairro: '', endereco: '',
  diaSemana: '', horario: '', telefone: '', cor: '#10b981'
})

/* ─── State ─── */
const tab          = ref<'pgs' | 'visitantes'>('pgs')
const pgs          = ref<PG[]>([])
const visitantes   = ref<Visitante[]>([])
const pasteText    = ref('')
const parseError   = ref('')
const showModal    = ref(false)
const editingPG    = ref<PG | null>(null)
const justCopied   = ref(false)
const form         = ref(DEFAULT_FORM())

/* ─── Persistence ─── */
function savePGs() {
  localStorage.setItem('church-pgs', JSON.stringify(pgs.value))
}

onMounted(() => {
  try {
    const raw = localStorage.getItem('church-pgs')
    if (raw) pgs.value = JSON.parse(raw)
  } catch { /* ignore */ }
})

/* ─── PG Management ─── */
function openAddPG() {
  editingPG.value = null
  form.value = DEFAULT_FORM()
  showModal.value = true
}

function editPG(pg: PG) {
  editingPG.value = pg
  form.value = {
    nome: pg.nome, lider: pg.lider, bairro: pg.bairro,
    endereco: pg.endereco || '', diaSemana: pg.diaSemana || '',
    horario: pg.horario || '', telefone: pg.telefone || '',
    cor: pg.cor || '#10b981'
  }
  showModal.value = true
}

function removePG(id: string) {
  if (!confirm('Remover este PG?')) return
  pgs.value = pgs.value.filter(pg => pg.id !== id)
  savePGs()
}

function savePG() {
  if (editingPG.value) {
    const idx = pgs.value.findIndex(pg => pg.id === editingPG.value!.id)
    if (idx !== -1) {
      pgs.value[idx] = { id: editingPG.value.id, ...form.value }
    }
  } else {
    pgs.value.push({ id: crypto.randomUUID(), ...form.value })
  }
  savePGs()
  closeModal()
}

function closeModal() {
  showModal.value = false
  editingPG.value = null
}

function getAssignedCount(pgId: string) {
  return visitantes.value.filter(v => v.pgAtribuido === pgId).length
}

/* ─── Visitor Parsing ─── */
function cleanStr(s: string) {
  return s.replace(/\*/g, '').trim()
}

function parseVisitantes() {
  parseError.value = ''
  const text = pasteText.value.trim()
  if (!text) return

  // Split on each "Visitantes:" block
  const blocks = text.split(/(?=Visitantes?\s*:)/i).map(b => b.trim()).filter(Boolean)

  if (blocks.length === 0) {
    parseError.value = 'Nenhum visitante encontrado. Verifique o formato do texto.'
    return
  }

  const parsed: Visitante[] = []

  for (const block of blocks) {
    const nome = block.match(/Nome\s*:\s*(.+)/i)?.[1]
    if (!nome || !cleanStr(nome)) continue

    const data     = block.match(/Visitantes?\s*:\s*(\d{1,2}\/\d{1,2})/i)?.[1]?.trim() || ''
    const idadeRaw = block.match(/Idade\s*:\s*(.+)/i)?.[1]?.trim() || ''
    const idade    = idadeRaw.replace(/\D.*$/, '') // keep only leading digits
    const celular  = cleanStr(block.match(/Celular\s*:\s*(.+)/i)?.[1] || '')
    const bairroRaw = block.match(/\*?Bairro\s*:?\s*\*?\s*(.+)/i)?.[1] || ''
    const bairro   = cleanStr(bairroRaw)

    parsed.push({
      id: crypto.randomUUID(),
      nome: cleanStr(nome),
      idade,
      celular,
      bairro,
      data
    })
  }

  if (parsed.length === 0) {
    parseError.value = 'Nenhum visitante foi identificado. Verifique se o texto está no formato correto.'
    return
  }

  visitantes.value = parsed
  pasteText.value  = ''
}

/* ─── PG Suggestion Logic ─── */
function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function isNeighborhoodMatch(visitorBairro: string, pgBairro: string) {
  const vb = normalize(visitorBairro)
  const pb = normalize(pgBairro)
  if (!vb || !pb) return false
  return vb === pb || vb.includes(pb) || pb.includes(vb)
}

function getSuggestions(bairro: string): PG[] {
  const matches  = pgs.value.filter(pg => isNeighborhoodMatch(bairro, pg.bairro))
  const rest     = pgs.value.filter(pg => !matches.includes(pg)).sort((a, b) => a.nome.localeCompare(b.nome))
  return [...matches, ...rest].slice(0, 3)
}

/* ─── Assignment ─── */
const assignedCount = computed(() => visitantes.value.filter(v => v.pgAtribuido).length)

function assignVisitor(visitorId: string, pgId: string) {
  const v = visitantes.value.find(v => v.id === visitorId)
  if (v) v.pgAtribuido = pgId
}

function getPGName(pgId: string) {
  return pgs.value.find(pg => pg.id === pgId)?.nome || 'PG desconhecido'
}

function clearVisitantes() {
  if (!confirm('Limpar todos os visitantes?')) return
  visitantes.value = []
  pasteText.value  = ''
  parseError.value = ''
}

/* ─── Export ─── */
const pgsWithVisitors = computed(() =>
  pgs.value
    .map(pg => ({ ...pg, visitors: visitantes.value.filter(v => v.pgAtribuido === pg.id) }))
    .filter(pg => pg.visitors.length > 0)
)

function buildExportText() {
  const date = new Date().toLocaleDateString('pt-BR')
  const lines: string[] = [`*Atribuição de Visitantes - ${date}*\n`]
  for (const pg of pgsWithVisitors.value) {
    lines.push(`🏠 *${pg.nome}* — ${pg.bairro}`)
    lines.push(`Líder: ${pg.lider}${pg.telefone ? ' · ' + pg.telefone : ''}`)
    for (const v of pg.visitors) {
      const cel = v.celular && v.celular.toLowerCase() !== 'não tem' ? ` · ${v.celular}` : ''
      lines.push(`  • ${v.nome} (${v.idade} anos${cel}) — ${v.bairro}`)
    }
    lines.push('')
  }
  return lines.join('\n').trim()
}

async function copyToClipboard() {
  await navigator.clipboard.writeText(buildExportText())
  justCopied.value = true
  setTimeout(() => { justCopied.value = false }, 2000)
}
</script>

<style scoped>
/* ─── Root ─── */
.pg-app {
  min-height: 100vh;
  background: #0f172a;
  color: #f8fafc;
  font-family: 'Outfit', sans-serif;
  display: flex;
  flex-direction: column;
}

/* ─── Header ─── */
.pg-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.25rem 2rem;
  background: rgba(255,255,255,0.04);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255,255,255,0.08);
  position: sticky;
  top: 0;
  z-index: 20;
}

.back-link {
  color: #94a3b8;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 600;
  white-space: nowrap;
  transition: color 0.2s;
}
.back-link:hover { color: #fff; }

.header-title { flex: 1; }

.site-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.accent {
  background: linear-gradient(135deg, #10b981, #06b6d4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.site-sub {
  margin: 0;
  font-size: 0.8rem;
  color: #64748b;
}

.header-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(16,185,129,0.12);
  border: 1px solid rgba(16,185,129,0.3);
  border-radius: 12px;
  padding: 0.4rem 1rem;
  min-width: 64px;
}
.badge-num { font-size: 1.6rem; font-weight: 800; line-height: 1; color: #10b981; }
.badge-lbl { font-size: 0.6rem; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; }

/* ─── Tabs ─── */
.tab-bar {
  display: flex;
  gap: 0.5rem;
  padding: 1rem 2rem;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.tab-btn {
  padding: 0.6rem 1.5rem;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.1);
  background: transparent;
  color: #94a3b8;
  font-family: 'Outfit', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.tab-btn:hover { color: #fff; border-color: rgba(255,255,255,0.2); }
.tab-btn.active {
  background: linear-gradient(135deg, #10b981, #06b6d4);
  color: #fff;
  border-color: transparent;
  box-shadow: 0 4px 15px rgba(16,185,129,0.3);
}

/* ─── Content ─── */
.pg-content {
  flex: 1;
  padding: 2rem;
  max-width: 1100px;
  width: 100%;
  margin: 0 auto;
}

/* ─── Section header ─── */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  gap: 1rem;
}

.section-title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: #e2e8f0;
}

/* ─── Buttons ─── */
.btn-add {
  padding: 0.55rem 1.25rem;
  background: linear-gradient(135deg, #10b981, #06b6d4);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-family: 'Outfit', sans-serif;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.btn-add:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(16,185,129,0.4); }

.btn-ghost {
  padding: 0.5rem 1rem;
  background: transparent;
  color: #94a3b8;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 8px;
  font-family: 'Outfit', sans-serif;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-ghost:hover { color: #fff; border-color: rgba(255,255,255,0.25); }

.btn-link {
  background: none;
  border: none;
  color: #10b981;
  font-family: 'Outfit', sans-serif;
  font-size: inherit;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.25rem 0.4rem;
  border-radius: 6px;
  transition: background 0.15s;
}
.btn-icon:hover { background: rgba(255,255,255,0.08); }
.btn-del:hover { background: rgba(239,68,68,0.15); }

/* ─── Empty state ─── */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #64748b;
}
.empty-icon { font-size: 3rem; margin-bottom: 1rem; }
.empty-state p { margin: 0.25rem 0; }
.empty-sub { font-size: 0.875rem; margin-bottom: 1.5rem; }

/* ─── PG Grid ─── */
.pg-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.pg-card {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  border-top: 3px solid var(--pg-color, #10b981);
}
.pg-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0,0,0,0.3);
}

.pg-card-top {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1rem 0.75rem;
}

.pg-color-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.pg-name {
  flex: 1;
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pg-actions { display: flex; gap: 0.25rem; }

.pg-card-body {
  padding: 0 1rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.info-row {
  display: flex;
  gap: 0.75rem;
  font-size: 0.85rem;
  align-items: baseline;
}
.info-label {
  color: #64748b;
  min-width: 68px;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.info-value { color: #cbd5e1; }
.info-value.highlight { color: #10b981; font-weight: 600; }

.pg-card-footer {
  border-top: 1px solid rgba(255,255,255,0.06);
  padding: 0.5rem 1rem;
}
.visitors-count { font-size: 0.75rem; color: #475569; }

/* ─── Paste Box ─── */
.paste-section { margin-bottom: 2rem; }

.paste-box {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.visitor-textarea {
  width: 100%;
  min-height: 160px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 1rem;
  color: #e2e8f0;
  font-family: 'Outfit', sans-serif;
  font-size: 0.9rem;
  resize: vertical;
  box-sizing: border-box;
  transition: border-color 0.2s;
  line-height: 1.6;
}
.visitor-textarea:focus {
  outline: none;
  border-color: rgba(16,185,129,0.5);
}
.visitor-textarea::placeholder { color: #334155; }

.btn-parse {
  align-self: flex-start;
  padding: 0.75rem 2rem;
  background: linear-gradient(135deg, #10b981, #06b6d4);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-family: 'Outfit', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-parse:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16,185,129,0.4);
}
.btn-parse:disabled { opacity: 0.4; cursor: not-allowed; }

.parse-error {
  color: #f87171;
  font-size: 0.875rem;
  margin: 0;
  padding: 0.75rem 1rem;
  background: rgba(239,68,68,0.1);
  border: 1px solid rgba(239,68,68,0.2);
  border-radius: 8px;
}

.warn-box {
  background: rgba(245,158,11,0.1);
  border: 1px solid rgba(245,158,11,0.25);
  border-radius: 10px;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: #fbbf24;
  margin-bottom: 1.5rem;
}

/* ─── Visitors Stats ─── */
.visitors-section { }

.visitors-stats {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 1rem;
}
.dot { color: #334155; }
.stat-assigned { color: #10b981; font-weight: 600; }
.stat-pending  { color: #f59e0b; font-weight: 600; }

/* ─── Visitor Cards ─── */
.visitor-list { display: flex; flex-direction: column; gap: 1rem; }

.visitor-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  padding: 1.25rem;
  transition: border-color 0.2s;
}
.visitor-card.assigned {
  border-color: rgba(16,185,129,0.25);
  background: rgba(16,185,129,0.04);
}

.visitor-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.visitor-name {
  margin: 0 0 0.4rem;
  font-size: 1.1rem;
  font-weight: 700;
}

.visitor-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: #64748b;
}

.bairro-tag {
  background: rgba(6,182,212,0.12);
  color: #06b6d4;
  padding: 0.1rem 0.5rem;
  border-radius: 20px;
  border: 1px solid rgba(6,182,212,0.2);
}

.data-tag {
  color: #475569;
}

/* Assigned status */
.assigned-status {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(16,185,129,0.1);
  border: 1px solid rgba(16,185,129,0.2);
  border-radius: 12px;
  padding: 0.6rem 0.8rem;
  flex-shrink: 0;
}
.check-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #10b981;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
}
.assigned-info {
  display: flex;
  flex-direction: column;
}
.assigned-label { font-size: 0.65rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
.assigned-pg-name { font-size: 0.875rem; font-weight: 700; color: #10b981; }

.btn-reassign {
  background: none;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 6px;
  color: #64748b;
  font-family: 'Outfit', sans-serif;
  font-size: 0.75rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  transition: all 0.15s;
}
.btn-reassign:hover { color: #fff; border-color: rgba(255,255,255,0.25); }

/* ─── Suggestions ─── */
.suggestions-area {
  border-top: 1px solid rgba(255,255,255,0.06);
  padding-top: 1rem;
}

.suggestions-label {
  margin: 0 0 0.75rem;
  font-size: 0.78rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.no-pgs-hint {
  font-size: 0.875rem;
  color: #475569;
  font-style: italic;
}

.suggestions-list { display: flex; flex-direction: column; gap: 0.5rem; }

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 12px;
  transition: all 0.15s;
}
.suggestion-item:hover { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.12); }
.suggestion-item.is-match {
  border-color: rgba(16,185,129,0.3);
  background: rgba(16,185,129,0.06);
}

.sug-rank {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 800;
  color: #fff;
  flex-shrink: 0;
}

.sug-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}
.sug-details strong { font-size: 0.9rem; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sug-details span   { font-size: 0.78rem; color: #64748b; }
.sug-schedule       { color: #475569; }

.sug-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.4rem;
  flex-shrink: 0;
}

.match-badge {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #10b981;
  background: rgba(16,185,129,0.15);
  padding: 0.15rem 0.5rem;
  border-radius: 20px;
}

.btn-assign {
  padding: 0.45rem 1rem;
  background: rgba(16,185,129,0.15);
  color: #10b981;
  border: 1px solid rgba(16,185,129,0.3);
  border-radius: 8px;
  font-family: 'Outfit', sans-serif;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}
.btn-assign:hover {
  background: #10b981;
  color: #fff;
  box-shadow: 0 4px 12px rgba(16,185,129,0.4);
}

.no-suggestions { font-size: 0.875rem; color: #475569; font-style: italic; padding: 0.5rem 0; }

/* ─── Export ─── */
.export-section {
  margin-top: 2.5rem;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  padding: 1.5rem;
}

.export-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
}

.btn-copy {
  padding: 0.55rem 1.25rem;
  background: rgba(255,255,255,0.07);
  color: #e2e8f0;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 10px;
  font-family: 'Outfit', sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-copy:hover { background: rgba(255,255,255,0.12); }
.btn-copy.copied { background: rgba(16,185,129,0.15); color: #10b981; border-color: rgba(16,185,129,0.3); }

.export-preview {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.export-pg-block {
  padding: 1rem;
  background: rgba(0,0,0,0.2);
  border-radius: 10px;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  line-height: 1.8;
}
.export-pg-name   { font-weight: 700; color: #10b981; }
.export-pg-leader { color: #64748b; margin-bottom: 0.4rem; }
.export-visitor-row { color: #cbd5e1; }

/* ─── Modal ─── */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0,0,10,0.75);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-box {
  background: #1e293b;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 20px;
  width: 100%;
  max-width: 540px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 60px rgba(0,0,0,0.6);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 1.5rem 0;
}
.modal-header h2 { margin: 0; font-size: 1.25rem; font-weight: 800; }

.modal-close {
  background: none;
  border: none;
  color: #64748b;
  font-size: 1.1rem;
  cursor: pointer;
  padding: 0.25rem;
  line-height: 1;
  transition: color 0.15s;
}
.modal-close:hover { color: #fff; }

/* ─── Form ─── */
.pg-form {
  padding: 1.25rem 1.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-group label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748b;
}

.form-group input,
.form-group select {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  padding: 0.65rem 0.9rem;
  color: #f8fafc;
  font-family: 'Outfit', sans-serif;
  font-size: 0.9rem;
  transition: border-color 0.2s;
  width: 100%;
  box-sizing: border-box;
}
.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: rgba(16,185,129,0.5);
}
.form-group select option { background: #1e293b; }

/* Color picker */
.color-picker { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.color-swatch {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.15s;
}
.color-swatch:hover    { transform: scale(1.15); }
.color-swatch.selected { border-color: #fff; transform: scale(1.2); box-shadow: 0 0 0 2px rgba(255,255,255,0.3); }

/* Form actions */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 0.5rem;
}

.btn-cancel {
  padding: 0.65rem 1.25rem;
  background: transparent;
  color: #64748b;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  font-family: 'Outfit', sans-serif;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-cancel:hover { color: #fff; border-color: rgba(255,255,255,0.2); }

.btn-submit {
  padding: 0.65rem 1.5rem;
  background: linear-gradient(135deg, #10b981, #06b6d4);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-family: 'Outfit', sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-submit:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(16,185,129,0.4); }

/* ─── Modal transitions ─── */
.modal-enter-active { transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1); }
.modal-leave-active { transition: all 0.2s ease-in; }
.modal-enter-from   { opacity: 0; transform: scale(0.9); }
.modal-leave-to     { opacity: 0; transform: scale(0.95); }

/* ─── Scrollbar ─── */
::-webkit-scrollbar       { width: 6px; }
::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
</style>
