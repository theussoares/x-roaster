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
        <span v-if="pendingCount > 0" class="tab-badge">{{ pendingCount }}</span>
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

        <!-- Top action bar -->
        <div class="visitor-actions-bar">
          <div class="action-buttons">
            <button @click="openAddVisitor" class="btn-add">+ Cadastrar Visitante</button>
            <button @click="showPaste = !showPaste" class="btn-ghost">
              {{ showPaste ? '▲ Fechar' : '📋 Colar do WhatsApp' }}
            </button>
          </div>
          <button v-if="visitantes.length > 0" @click="clearVisitantes" class="btn-danger-ghost">Limpar tudo</button>
        </div>

        <!-- Paste area (collapsible) -->
        <Transition name="slide-down">
          <div v-if="showPaste" class="paste-box">
            <textarea
              v-model="pasteText"
              placeholder="Cole aqui a lista do WhatsApp…&#10;&#10;Visitantes: 16/05&#10;Nome: Arthur Lopes&#10;Idade: 15 anos&#10;Celular: não tem&#10;Bairro: Vila Alegre"
              class="visitor-textarea"
            ></textarea>
            <div class="paste-footer">
              <p v-if="parseError" class="parse-error">{{ parseError }}</p>
              <button @click="parseVisitantes" class="btn-parse" :disabled="!pasteText.trim()">
                ⚡ Processar e adicionar
              </button>
            </div>
          </div>
        </Transition>

        <!-- Warn: no PGs -->
        <div v-if="visitantes.length > 0 && pgs.length === 0" class="warn-box">
          ⚠️ Nenhum PG cadastrado. <button @click="tab = 'pgs'" class="btn-link">Cadastre os PGs primeiro</button>.
        </div>

        <!-- Empty state -->
        <div v-if="visitantes.length === 0 && !showPaste" class="empty-state">
          <div class="empty-icon">👥</div>
          <p>Nenhum visitante registrado ainda.</p>
          <p class="empty-sub">Cadastre manualmente ou cole a lista do WhatsApp.</p>
        </div>

        <!-- Stats + Filter chips -->
        <div v-if="visitantes.length > 0" class="visitors-controls">
          <div class="visitors-stats">
            <span>{{ visitantes.length }} visitante{{ visitantes.length !== 1 ? 's' : '' }}</span>
            <span class="dot">·</span>
            <span class="stat-assigned">{{ assignedCount }} atribuído{{ assignedCount !== 1 ? 's' : '' }}</span>
            <span class="dot">·</span>
            <span class="stat-pending">{{ pendingCount }} pendente{{ pendingCount !== 1 ? 's' : '' }}</span>
          </div>
          <div class="filter-chips">
            <button
              v-for="f in FILTERS"
              :key="f.value"
              @click="filter = f.value"
              :class="['chip', { active: filter === f.value }]"
            >{{ f.label }}</button>
          </div>
        </div>

        <!-- Visitor cards -->
        <div v-if="filteredVisitors.length > 0" class="visitor-list">
          <div
            v-for="visitor in filteredVisitors"
            :key="visitor.id"
            class="visitor-card"
            :class="{ assigned: visitor.pgAtribuido }"
          >
            <!-- Card header -->
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
              <button @click="removeVisitor(visitor.id)" class="btn-icon btn-del" title="Remover visitante">🗑️</button>
            </div>

            <!-- Assigned block -->
            <div v-if="visitor.pgAtribuido" class="assigned-block">
              <div class="assigned-status">
                <div class="check-icon">✓</div>
                <div class="assigned-info">
                  <span class="assigned-label">Atribuído ao PG</span>
                  <span class="assigned-pg-name" :style="{ color: getPG(visitor.pgAtribuido)?.cor || '#10b981' }">
                    {{ getPG(visitor.pgAtribuido)?.nome || 'PG desconhecido' }}
                  </span>
                </div>
                <button @click="unassignVisitor(visitor.id)" class="btn-reassign">Alterar</button>
              </div>

              <!-- WhatsApp send button -->
              <a
                v-if="getPG(visitor.pgAtribuido)?.telefone"
                :href="getWhatsAppUrl(visitor)"
                target="_blank"
                rel="noopener noreferrer"
                class="btn-whatsapp"
              >
                <span class="wpp-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </span>
                Enviar para {{ getPG(visitor.pgAtribuido)?.lider }}
              </a>
              <div v-else class="no-phone-hint">
                ℹ️ Adicione o WhatsApp do líder do PG para enviar direto
              </div>
            </div>

            <!-- PG Suggestions -->
            <div v-if="!visitor.pgAtribuido" class="suggestions-area">
              <div v-if="pgs.length === 0" class="no-pgs-hint">
                Cadastre PGs na aba "Pequenos Grupos"
              </div>
              <template v-else>
                <p class="suggestions-label">PGs sugeridos por bairro:</p>
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
                      <button @click="assignVisitor(visitor.id, pg.id)" class="btn-assign">Atribuir</button>
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

        <div v-else-if="visitantes.length > 0" class="empty-filter">
          Nenhum visitante {{ filter === 'pending' ? 'pendente' : 'atribuído' }}.
        </div>

        <!-- Export -->
        <div v-if="assignedCount > 0" class="export-section">
          <div class="export-header">
            <h2 class="section-title">Resumo para WhatsApp</h2>
            <button @click="copyToClipboard" class="btn-copy" :class="{ copied: justCopied }">
              {{ justCopied ? '✓ Copiado!' : '📋 Copiar tudo' }}
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

    <!-- ─── Modal: Add/Edit PG ─── -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showPGModal" class="modal-overlay" @click.self="closePGModal">
          <div class="modal-box">
            <div class="modal-header">
              <h2>{{ editingPG ? 'Editar PG' : 'Novo Pequeno Grupo' }}</h2>
              <button @click="closePGModal" class="modal-close">✕</button>
            </div>
            <form @submit.prevent="savePG" class="pg-form">
              <div class="form-group">
                <label>Nome do PG *</label>
                <input v-model="pgForm.nome" placeholder="Ex: PG da Família Silva" required />
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Líder *</label>
                  <input v-model="pgForm.lider" placeholder="Nome do líder" required />
                </div>
                <div class="form-group">
                  <label>WhatsApp do líder</label>
                  <input v-model="pgForm.telefone" placeholder="67 9 9999-9999" />
                </div>
              </div>
              <div class="form-group">
                <label>Bairro *</label>
                <input v-model="pgForm.bairro" placeholder="Ex: Nova Três Lagoas" required />
              </div>
              <div class="form-group">
                <label>Endereço</label>
                <input v-model="pgForm.endereco" placeholder="Rua, número (opcional)" />
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Dia da semana</label>
                  <select v-model="pgForm.diaSemana">
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
                  <input v-model="pgForm.horario" placeholder="Ex: 19:30" />
                </div>
              </div>
              <div class="form-group">
                <label>Cor de identificação</label>
                <div class="color-picker">
                  <button
                    v-for="color in PG_COLORS"
                    :key="color"
                    type="button"
                    @click="pgForm.cor = color"
                    class="color-swatch"
                    :class="{ selected: pgForm.cor === color }"
                    :style="{ background: color }"
                  ></button>
                </div>
              </div>
              <div class="form-actions">
                <button type="button" @click="closePGModal" class="btn-cancel">Cancelar</button>
                <button type="submit" class="btn-submit">{{ editingPG ? 'Salvar' : 'Criar PG' }}</button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ─── Modal: Add Visitor ─── -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showVisitorModal" class="modal-overlay" @click.self="closeVisitorModal">
          <div class="modal-box">
            <div class="modal-header">
              <h2>Cadastrar Visitante</h2>
              <button @click="closeVisitorModal" class="modal-close">✕</button>
            </div>
            <form @submit.prevent="saveVisitor" class="pg-form">
              <div class="form-group">
                <label>Nome *</label>
                <input v-model="visitorForm.nome" placeholder="Nome completo" required autofocus />
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Idade</label>
                  <input v-model="visitorForm.idade" placeholder="Ex: 17" type="number" min="0" max="120" />
                </div>
                <div class="form-group">
                  <label>Celular</label>
                  <input v-model="visitorForm.celular" placeholder="67 9 9999-9999" />
                </div>
              </div>
              <div class="form-group">
                <label>Bairro *</label>
                <input v-model="visitorForm.bairro" placeholder="Ex: Vila Alegre" required />
              </div>
              <div class="form-group">
                <label>Data do culto</label>
                <input v-model="visitorForm.data" type="date" />
              </div>
              <div class="form-actions">
                <button type="button" @click="closeVisitorModal" class="btn-cancel">Cancelar</button>
                <button type="submit" class="btn-submit">Cadastrar</button>
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

type FilterValue = 'all' | 'pending' | 'assigned'

/* ─── Constants ─── */
const PG_COLORS = [
  '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b',
  '#ef4444', '#06b6d4', '#f97316', '#84cc16',
  '#ec4899', '#14b8a6'
]

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: 'all',      label: 'Todos' },
  { value: 'pending',  label: 'Pendentes' },
  { value: 'assigned', label: 'Atribuídos' },
]

const DEFAULT_PG_FORM = () => ({
  nome: '', lider: '', bairro: '', endereco: '',
  diaSemana: '', horario: '', telefone: '', cor: '#10b981'
})

const DEFAULT_VISITOR_FORM = () => ({
  nome: '', idade: '', celular: '', bairro: '',
  data: new Date().toISOString().slice(0, 10)
})

/* ─── State ─── */
const tab              = ref<'pgs' | 'visitantes'>('pgs')
const pgs              = ref<PG[]>([])
const visitantes       = ref<Visitante[]>([])
const filter           = ref<FilterValue>('all')
const pasteText        = ref('')
const parseError       = ref('')
const showPaste        = ref(false)
const showPGModal      = ref(false)
const showVisitorModal = ref(false)
const editingPG        = ref<PG | null>(null)
const justCopied       = ref(false)
const pgForm           = ref(DEFAULT_PG_FORM())
const visitorForm      = ref(DEFAULT_VISITOR_FORM())

/* ─── Persistence ─── */
// TODO: swap these two save/load functions for Supabase calls when ready
function savePGs() {
  localStorage.setItem('church-pgs', JSON.stringify(pgs.value))
}
function saveVisitantes() {
  localStorage.setItem('church-visitantes', JSON.stringify(visitantes.value))
}

onMounted(() => {
  try {
    const rawPGs = localStorage.getItem('church-pgs')
    if (rawPGs) pgs.value = JSON.parse(rawPGs)

    const rawVisitantes = localStorage.getItem('church-visitantes')
    if (rawVisitantes) visitantes.value = JSON.parse(rawVisitantes)
  } catch { /* ignore corrupt data */ }
})

/* ─── Computed ─── */
const assignedCount = computed(() => visitantes.value.filter(v => v.pgAtribuido).length)
const pendingCount  = computed(() => visitantes.value.filter(v => !v.pgAtribuido).length)

const filteredVisitors = computed(() => {
  if (filter.value === 'pending')  return visitantes.value.filter(v => !v.pgAtribuido)
  if (filter.value === 'assigned') return visitantes.value.filter(v =>  v.pgAtribuido)
  return visitantes.value
})

const pgsWithVisitors = computed(() =>
  pgs.value
    .map(pg => ({ ...pg, visitors: visitantes.value.filter(v => v.pgAtribuido === pg.id) }))
    .filter(pg => pg.visitors.length > 0)
)

/* ─── PG Management ─── */
function openAddPG() {
  editingPG.value = null
  pgForm.value = DEFAULT_PG_FORM()
  showPGModal.value = true
}

function editPG(pg: PG) {
  editingPG.value = pg
  pgForm.value = {
    nome: pg.nome, lider: pg.lider, bairro: pg.bairro,
    endereco: pg.endereco || '', diaSemana: pg.diaSemana || '',
    horario: pg.horario || '', telefone: pg.telefone || '',
    cor: pg.cor || '#10b981'
  }
  showPGModal.value = true
}

function removePG(id: string) {
  if (!confirm('Remover este PG?')) return
  pgs.value = pgs.value.filter(pg => pg.id !== id)
  savePGs()
}

function savePG() {
  if (editingPG.value) {
    const idx = pgs.value.findIndex(pg => pg.id === editingPG.value!.id)
    if (idx !== -1) pgs.value[idx] = { id: editingPG.value.id, ...pgForm.value }
  } else {
    pgs.value.push({ id: crypto.randomUUID(), ...pgForm.value })
  }
  savePGs()
  closePGModal()
}

function closePGModal() {
  showPGModal.value = false
  editingPG.value = null
}

function getAssignedCount(pgId: string) {
  return visitantes.value.filter(v => v.pgAtribuido === pgId).length
}

function getPG(pgId: string): PG | undefined {
  return pgs.value.find(pg => pg.id === pgId)
}

/* ─── Manual Visitor Registration ─── */
function openAddVisitor() {
  visitorForm.value = DEFAULT_VISITOR_FORM()
  showVisitorModal.value = true
}

function saveVisitor() {
  const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  visitantes.value.unshift({
    id:      crypto.randomUUID(),
    nome:    visitorForm.value.nome.trim(),
    idade:   visitorForm.value.idade,
    celular: visitorForm.value.celular.trim() || 'não tem',
    bairro:  visitorForm.value.bairro.trim(),
    data:    visitorForm.value.data
              ? new Date(visitorForm.value.data + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
              : today
  })
  saveVisitantes()
  closeVisitorModal()
}

function closeVisitorModal() {
  showVisitorModal.value = false
}

function removeVisitor(id: string) {
  if (!confirm('Remover este visitante?')) return
  visitantes.value = visitantes.value.filter(v => v.id !== id)
  saveVisitantes()
}

/* ─── WhatsApp Paste Parsing ─── */
function cleanStr(s: string) {
  return s.replace(/\*/g, '').trim()
}

function parseVisitantes() {
  parseError.value = ''
  const text = pasteText.value.trim()
  if (!text) return

  const blocks = text.split(/(?=Visitantes?\s*:)/i).map(b => b.trim()).filter(Boolean)

  if (blocks.length === 0) {
    parseError.value = 'Nenhum visitante encontrado. Verifique o formato.'
    return
  }

  const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  const parsed: Visitante[] = []

  for (const block of blocks) {
    const nome = block.match(/Nome\s*:\s*(.+)/i)?.[1]
    if (!nome || !cleanStr(nome)) continue

    const data      = block.match(/Visitantes?\s*:\s*(\d{1,2}\/\d{1,2})/i)?.[1]?.trim() || today
    const idadeRaw  = block.match(/Idade\s*:\s*(.+)/i)?.[1]?.trim() || ''
    const idade     = idadeRaw.replace(/\D.*$/, '')
    const celular   = cleanStr(block.match(/Celular\s*:\s*(.+)/i)?.[1] || 'não tem')
    const bairroRaw = block.match(/\*?Bairro\s*:?\s*\*?\s*(.+)/i)?.[1] || ''
    const bairro    = cleanStr(bairroRaw)

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
    parseError.value = 'Nenhum visitante identificado. Verifique o formato do texto.'
    return
  }

  // Prepend new visitors (avoid duplicates by name+data)
  const existingKeys = new Set(visitantes.value.map(v => `${v.nome.toLowerCase()}|${v.data}`))
  const deduped = parsed.filter(v => !existingKeys.has(`${v.nome.toLowerCase()}|${v.data}`))

  visitantes.value = [...deduped, ...visitantes.value]
  saveVisitantes()
  pasteText.value  = ''
  showPaste.value  = false

  if (deduped.length < parsed.length) {
    parseError.value = `${parsed.length - deduped.length} visitante(s) já cadastrado(s) foram ignorados.`
  }
}

/* ─── PG Suggestion Logic ─── */
function normalize(s: string) {
  return s.toLowerCase()
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
  const matches = pgs.value.filter(pg => isNeighborhoodMatch(bairro, pg.bairro))
  const rest    = pgs.value.filter(pg => !matches.includes(pg)).sort((a, b) => a.nome.localeCompare(b.nome))
  return [...matches, ...rest].slice(0, 3)
}

/* ─── Assignment ─── */
function assignVisitor(visitorId: string, pgId: string) {
  const v = visitantes.value.find(v => v.id === visitorId)
  if (v) { v.pgAtribuido = pgId; saveVisitantes() }
}

function unassignVisitor(visitorId: string) {
  const v = visitantes.value.find(v => v.id === visitorId)
  if (v) { v.pgAtribuido = undefined; saveVisitantes() }
}

function clearVisitantes() {
  if (!confirm('Limpar todos os visitantes? Isso não pode ser desfeito.')) return
  visitantes.value = []
  pasteText.value  = ''
  parseError.value = ''
  saveVisitantes()
}

/* ─── WhatsApp Link ─── */
function getWhatsAppUrl(visitor: Visitante): string {
  const pg = getPG(visitor.pgAtribuido!)
  if (!pg?.telefone) return '#'

  let phone = pg.telefone.replace(/\D/g, '')
  if (!phone.startsWith('55')) phone = '55' + phone

  const cel = visitor.celular && visitor.celular.toLowerCase() !== 'não tem'
    ? visitor.celular : 'não informado'

  const msg = [
    `Olá ${pg.lider}! 👋`,
    ``,
    `Um visitante foi direcionado para o seu PG:`,
    ``,
    `*Nome:* ${visitor.nome}`,
    `*Idade:* ${visitor.idade ? visitor.idade + ' anos' : 'não informada'}`,
    `*Celular:* ${cel}`,
    `*Bairro:* ${visitor.bairro || 'não informado'}`,
    visitor.data ? `*Data da visita:* ${visitor.data}` : '',
    ``,
    `Aguardamos seu contato com ele! 🙏`
  ].filter(l => l !== undefined).join('\n')

  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
}

/* ─── Clipboard Export ─── */
function buildExportText() {
  const date  = new Date().toLocaleDateString('pt-BR')
  const lines = [`*Atribuição de Visitantes - ${date}*\n`]
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
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
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

.tab-badge {
  background: #ef4444;
  color: #fff;
  font-size: 0.65rem;
  font-weight: 800;
  padding: 0.1rem 0.45rem;
  border-radius: 20px;
  line-height: 1.4;
}

/* ─── Content ─── */
.pg-content {
  flex: 1;
  padding: 2rem;
  max-width: 1100px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
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

/* ─── Action bar ─── */
.visitor-actions-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
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

.btn-danger-ghost {
  padding: 0.5rem 1rem;
  background: transparent;
  color: #94a3b8;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  font-family: 'Outfit', sans-serif;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-danger-ghost:hover { color: #f87171; border-color: rgba(239,68,68,0.3); }

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
.btn-del:hover  { background: rgba(239,68,68,0.15); }

/* ─── Paste box ─── */
.paste-box {
  margin-bottom: 1.5rem;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.visitor-textarea {
  width: 100%;
  min-height: 140px;
  background: rgba(0,0,0,0.2);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  padding: 0.9rem;
  color: #e2e8f0;
  font-family: 'Outfit', sans-serif;
  font-size: 0.875rem;
  resize: vertical;
  box-sizing: border-box;
  transition: border-color 0.2s;
  line-height: 1.6;
}
.visitor-textarea:focus {
  outline: none;
  border-color: rgba(16,185,129,0.4);
}
.visitor-textarea::placeholder { color: #334155; }

.paste-footer {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-parse {
  padding: 0.65rem 1.75rem;
  background: linear-gradient(135deg, #10b981, #06b6d4);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-family: 'Outfit', sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.btn-parse:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16,185,129,0.4);
}
.btn-parse:disabled { opacity: 0.4; cursor: not-allowed; }

.parse-error {
  color: #f87171;
  font-size: 0.8rem;
  margin: 0;
  flex: 1;
}

/* ─── Warn / Empty ─── */
.warn-box {
  background: rgba(245,158,11,0.1);
  border: 1px solid rgba(245,158,11,0.25);
  border-radius: 10px;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: #fbbf24;
  margin-bottom: 1.5rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #64748b;
}
.empty-icon { font-size: 3rem; margin-bottom: 1rem; }
.empty-state p { margin: 0.25rem 0; }
.empty-sub { font-size: 0.875rem; margin-bottom: 1.5rem; }

.empty-filter {
  text-align: center;
  padding: 2rem;
  color: #475569;
  font-size: 0.875rem;
}

/* ─── Visitors stats + filter ─── */
.visitors-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.visitors-stats {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #64748b;
}
.dot            { color: #334155; }
.stat-assigned  { color: #10b981; font-weight: 600; }
.stat-pending   { color: #f59e0b; font-weight: 600; }

.filter-chips { display: flex; gap: 0.4rem; }
.chip {
  padding: 0.3rem 0.85rem;
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.1);
  background: transparent;
  color: #64748b;
  font-family: 'Outfit', sans-serif;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.chip:hover  { color: #fff; border-color: rgba(255,255,255,0.2); }
.chip.active {
  background: rgba(16,185,129,0.15);
  border-color: rgba(16,185,129,0.4);
  color: #10b981;
}

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
.info-value           { color: #cbd5e1; }
.info-value.highlight { color: #10b981; font-weight: 600; }

.pg-card-footer {
  border-top: 1px solid rgba(255,255,255,0.06);
  padding: 0.5rem 1rem;
}
.visitors-count { font-size: 0.75rem; color: #475569; }

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
  border-color: rgba(16,185,129,0.2);
  background: rgba(16,185,129,0.03);
}

.visitor-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.visitor-info { flex: 1; min-width: 0; }

.visitor-name {
  margin: 0 0 0.4rem;
  font-size: 1.05rem;
  font-weight: 700;
}

.visitor-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
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

.data-tag { color: #475569; }

/* ─── Assigned block ─── */
.assigned-block {
  border-top: 1px solid rgba(255,255,255,0.06);
  padding-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.assigned-status {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(16,185,129,0.08);
  border: 1px solid rgba(16,185,129,0.18);
  border-radius: 12px;
  padding: 0.65rem 0.9rem;
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
  flex: 1;
  display: flex;
  flex-direction: column;
}
.assigned-label   { font-size: 0.65rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
.assigned-pg-name { font-size: 0.9rem; font-weight: 700; }

.btn-reassign {
  background: none;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 6px;
  color: #64748b;
  font-family: 'Outfit', sans-serif;
  font-size: 0.75rem;
  cursor: pointer;
  padding: 0.25rem 0.6rem;
  transition: all 0.15s;
  white-space: nowrap;
}
.btn-reassign:hover { color: #fff; border-color: rgba(255,255,255,0.25); }

/* ─── WhatsApp button ─── */
.btn-whatsapp {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.65rem 1.25rem;
  background: #25d366;
  color: #fff;
  border-radius: 12px;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 700;
  transition: all 0.2s;
  align-self: flex-start;
}
.btn-whatsapp:hover {
  background: #1ebe5a;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(37,211,102,0.4);
}

.wpp-icon {
  display: flex;
  align-items: center;
}

.no-phone-hint {
  font-size: 0.78rem;
  color: #475569;
  font-style: italic;
}

/* ─── Suggestions ─── */
.suggestions-area {
  border-top: 1px solid rgba(255,255,255,0.06);
  padding-top: 1rem;
}

.suggestions-label {
  margin: 0 0 0.75rem;
  font-size: 0.75rem;
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
.suggestion-item:hover       { background: rgba(255,255,255,0.06); }
.suggestion-item.is-match    { border-color: rgba(16,185,129,0.25); background: rgba(16,185,129,0.05); }

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
.sug-details strong { font-size: 0.875rem; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
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
  padding: 0.4rem 0.9rem;
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
.btn-copy:hover  { background: rgba(255,255,255,0.12); }
.btn-copy.copied { background: rgba(16,185,129,0.15); color: #10b981; border-color: rgba(16,185,129,0.3); }

.export-preview { display: flex; flex-direction: column; gap: 1.25rem; }

.export-pg-block {
  padding: 1rem;
  background: rgba(0,0,0,0.2);
  border-radius: 10px;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  line-height: 1.8;
}
.export-pg-name     { font-weight: 700; color: #10b981; }
.export-pg-leader   { color: #64748b; margin-bottom: 0.4rem; }
.export-visitor-row { color: #cbd5e1; }

/* ─── Modals ─── */
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
.modal-header h2 { margin: 0; font-size: 1.2rem; font-weight: 800; }

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

/* ─── Forms ─── */
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
.color-picker   { display: flex; flex-wrap: wrap; gap: 0.5rem; }
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

/* ─── Transitions ─── */
.modal-enter-active { transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1); }
.modal-leave-active { transition: all 0.2s ease-in; }
.modal-enter-from   { opacity: 0; transform: scale(0.9); }
.modal-leave-to     { opacity: 0; transform: scale(0.95); }

.slide-down-enter-active { transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1); }
.slide-down-leave-active { transition: all 0.2s ease-in; }
.slide-down-enter-from   { opacity: 0; transform: translateY(-12px); }
.slide-down-leave-to     { opacity: 0; transform: translateY(-8px); }

/* ─── Scrollbar ─── */
::-webkit-scrollbar       { width: 6px; }
::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
</style>
