<template>
  <div>
    <div class="w-full max-w-5xl mx-auto p-4 mt-6">
      <div v-if="loading" class="flex flex-col items-center justify-center min-h-screen p-6">
        <p class="text-xl font-semibold text-darkslategray">Carregando detalhes...</p>
        <div class="mt-4 h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-dodgerblue"></div>
      </div>

      <div v-else-if="denuncia" class="max-w-4xl mx-auto p-6 bg-white rounded shadow-md mt-6 space-y-6">
        <NavigationButtons />
        <h1 class="text-2xl font-bold text-darkslateblue">{{ denuncia.titulo }}</h1>
        <p class="text-darkslategray">Categoria: {{ formatCategoria(denuncia.categoria) }}</p>
        <div class="flex items-center space-x-2">
          <p class="text-darkslategray">Status:</p>
          <span class="px-2 py-1 text-xs rounded-full border border-slategray text-darkslategray">
            {{ formatStatus(denuncia.status) }}
          </span>
        </div>
        <p class="text-darkslategray">Criada em: {{ formatarData(denuncia.created_at) }}</p>

        <!-- Mensagem de sucesso -->
        <div v-if="successMessage" class="bg-aquamarine text-darkslategray p-3 rounded-lg text-center font-medium">
          {{ successMessage }}
        </div>

        <div class="rounded p-4 bg-white border border-darkslategray">
          <h2 class="mb-2 text-lg font-semibold">Autor da denúncia</h2>
          <p><strong>Nome:</strong> {{ autor?.nome || 'Não informado' }}</p>
          <p><strong>Email:</strong> {{ autor?.email || 'Não informado' }}</p>
        </div>

        <div class="rounded p-4 bg-white border border-darkslategray">
          <h2 class="mb-2 text-lg font-semibold">Descrição</h2>
          <p class="whitespace-pre-line text-darkslategray">{{ denuncia.descricao }}</p>
        </div>

        <!-- Localização e Mídias -->
        <div class="flex flex-col space-y-6 md:flex-row md:space-x-6 md:space-y-0">
          <div class="flex-1 rounded p-4 bg-white border border-darkslategray">
            <h2 class="mb-2 text-lg font-semibold">Localização</h2>
            <div
              v-if="denuncia.latitude && denuncia.longitude"
              class="h-[300px] w-full overflow-hidden rounded shadow mb-2"
            >
              <iframe
                :src="getMapaIframeUrl(denuncia.latitude, denuncia.longitude)"
                width="100%"
                height="100%"
                frameborder="0"
              ></iframe>
            </div>
            <a
              class="mb-2 block underline text-royalblue"
              :href="getMapaLink(denuncia.latitude, denuncia.longitude)"
              target="_blank"
            >
              Ver no OpenStreetMap
            </a>
            <p class="text-darkslategray">{{ denuncia.endereco || 'Endereço não informado' }}</p>
            <p v-if="denuncia.complemento" class="text-darkslategray">Complemento: {{ denuncia.complemento }}</p>
          </div>

          <!-- ✅ Seção de Mídias Atualizada -->
          <div class="flex-1">
            <h2 class="mb-2 text-lg font-semibold">Mídias</h2>
            <div v-if="midias.length" class="space-y-3">
              <!-- Visualização principal -->
              <div v-if="midiaSelecionada" class="h-[300px] w-full overflow-hidden rounded shadow bg-gray-100 flex items-center justify-center relative">
                <template v-if="midiaSelecionada.tipo === 'foto'">
                  <img
                    :src="getMidiaUrl(midiaSelecionada)"
                    :alt="`Visualização principal`"
                    class="h-full w-full object-contain"
                    @error="midiaSelecionada.error = true"
                  />
                  <div v-if="midiaSelecionada.error" class="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-600 text-sm">
                    Falha ao carregar imagem
                  </div>
                </template>
                <template v-else-if="midiaSelecionada.tipo === 'video'">
                  <video controls class="h-full w-full object-contain" @error="midiaSelecionada.error = true">
                    <source :src="getMidiaUrl(midiaSelecionada)" :type="getVideoType(getFileExtension(midiaSelecionada.caminho))" />
                    Seu navegador não suporta este vídeo.
                  </video>
                  <div v-if="midiaSelecionada.error" class="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-600 text-sm">
                    Falha ao carregar vídeo
                  </div>
                </template>
              </div>

              <!-- Miniaturas (máximo 5) -->
              <div v-if="midias.length > 1" class="pt-2">
                <div class="flex space-x-2 overflow-x-auto pb-1">
                  <div
                    v-for="(item, i) in midias.slice(0, 5)"
                    :key="i"
                    @click="selecionarMidia(item)"
                    class="flex-none w-16 h-16 rounded border-2 cursor-pointer flex items-center justify-center"
                    :class="midiaSelecionada === item ? 'border-dodgerblue' : 'border-gray-300'"
                  >
                    <template v-if="item.tipo === 'foto'">
                      <img
                        :src="getMidiaUrl(item)"
                        :alt="`Miniatura ${i + 1}`"
                        class="w-full h-full object-cover rounded"
                        @error="item.error = true"
                      />
                    </template>
                    <template v-else-if="item.tipo === 'video'">
                      <div class="w-full h-full bg-black rounded flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </template>
                  </div>
                </div>
              </div>
            </div>
            <div
              v-else
              class="h-[300px] w-full flex items-center justify-center rounded bg-lightsteelblue shadow italic text-gray-500"
            >
              Nenhuma mídia anexada.
            </div>
          </div>
        </div>

        <!-- Anexos -->
        <div v-if="anexos.length" class="mt-6">
          <h3 class="text-lg font-semibold mb-2">📎 Anexos</h3>
          <ul class="space-y-2">
            <li v-for="anexo in anexos" :key="anexo.id">
              <a :href="anexo.url" target="_blank" class="text-blue-600 hover:underline">
                📄 {{ anexo.nome_arquivo }}
              </a>
              <span class="text-xs text-gray-500 ml-2">({{ anexo.tipo }})</span>
            </li>
          </ul>
        </div>

        <!-- ✅ Botão de Anexos: só aparece se status for 'pendente' -->
        <div v-if="denuncia.status === 'pendente'" class="mt-4">
          <button
            @click="abrirModalAnexos"
            class="px-4 py-2 bg-gray-700 text-white rounded flex items-center gap-2 hover:bg-gray-800"
          >
            📎 Ver/Adicionar Anexos
          </button>
        </div>

        <!-- ✅ Comentários: SÓ PARA ADMINISTRADORES -->
        <div v-if="auth.isAdmin" class="mt-6">
          <h3 class="text-lg font-semibold mb-2">💬 Comentários</h3>
          <div v-if="comentarios.length" class="space-y-3">
            <div v-for="com in comentarios" :key="com.id" class="p-3 bg-gray-50 rounded border">
              <div class="flex justify-between text-sm text-gray-600 mb-1">
                <span>{{ com.autor?.nome || 'Usuário' }}</span>
                <span>{{ formatarData(com.created_at) }}</span>
              </div>
              <p>{{ com.comentario }}</p>
            </div>
          </div>
          <p v-else class="text-gray-500 italic">Nenhum comentário ainda.</p>

          <!-- Formulário de novo comentário (só aparece se for admin) -->
          <div class="mt-4 pt-4 border-t border-gray-200">
            <h4 class="font-medium text-gray-800 mb-2">Adicionar comentário</h4>
            <textarea
              v-model="novoComentario"
              placeholder="Escreva seu comentário..."
              class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dodgerblue"
              rows="3"
            ></textarea>
            <button
              @click="adicionarComentario"
              :disabled="!novoComentario.trim() || enviandoComentario"
              class="mt-2 px-4 py-2 bg-dodgerblue text-white rounded-lg hover:bg-royalblue disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <span v-if="enviandoComentario">Enviando...</span>
              <span v-else>Enviar comentário</span>
            </button>
          </div>
        </div>

        <!-- ✅ Sugestão de Secretarias: SÓ PARA ADMINISTRADORES -->
        <div
          v-if="auth.isAdmin && sugestoesSecretarias.length"
          class="mt-6 rounded border p-4 bg-white border-darkslategray"
        >
          <h2 class="mb-2 text-lg font-semibold">Sugestão de Secretarias</h2>
          <ul class="space-y-1">
            <li v-for="s in sugestoesSecretarias" :key="s.id" class="flex flex-wrap items-center gap-2">
              <button
                @click="abrirModalEmail(s)"
                class="underline text-royalblue hover:text-darkslateblue font-medium text-left"
              >
                {{ s.nome }} ({{ s.email }})
              </button>
              <a
                v-if="s.site"
                :href="s.site.trim()"
                target="_blank"
                rel="noopener noreferrer"
                class="text-sm text-aquamarine hover:text-mediumaquamarine font-medium"
              >
                🌐 Site oficial
              </a>
            </li>
          </ul>
          <p class="mt-2 text-sm text-darkslategray">
            Clique no nome da secretaria para enviar um e-mail.
          </p>
        </div>

        <!-- Botões de Status (Admin) -->
        <div v-if="auth.user?.role === 'admin' && denuncia.status === 'pendente'" class="mt-6 flex flex-wrap gap-4">
          <button
            @click="atualizarStatus('aberta', 'Denúncia marcada como aberta com sucesso!')"
            class="px-4 py-2 bg-royalblue text-white rounded transition hover:bg-darkslateblue"
          >
            Marcar como Aberta
          </button>
          <button
            @click="atualizarStatus('rejeitada', 'Denúncia rejeitada com sucesso!')"
            class="px-4 py-2 bg-slategray text-white rounded transition hover:bg-darkslategray"
          >
            Rejeitar
          </button>
        </div>

        <div v-if="auth.user?.role === 'admin' && (denuncia.status === 'aberta' || denuncia.status === 'em_progresso')" class="mt-6 flex flex-wrap gap-4">
          <button
            @click="atualizarStatus('concluida', 'Denúncia marcada como concluída com sucesso!')"
            class="px-4 py-2 bg-dodgerblue text-white rounded transition hover:bg-royalblue"
          >
            Marcar como Concluída
          </button>
        </div>

        <!-- ✅ Botão Gerar PDF: só para administradores -->
        <div v-if="auth.isAdmin" class="mt-6 flex flex-wrap gap-4">
          <button
            @click="gerarPDF"
            class="px-4 py-2 bg-dodgerblue text-white rounded transition hover:bg-royalblue"
          >
            Gerar PDF
          </button>
        </div>
      </div>

      <div v-else class="max-w-4xl mx-auto p-6 bg-white rounded shadow-md mt-6 text-center text-red-500">
        <p>Denúncia não encontrada ou você não tem permissão para visualizá-la.</p>
      </div>
    </div>

    <!-- ✅ Modal de Anexos -->
    <div v-if="showModalAnexos" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold">Anexos da Denúncia</h3>
          <button @click="fecharModalAnexos" class="text-gray-500">&times;</button>
        </div>

        <!-- Upload -->
        <div class="mb-4">
          <label class="block mb-2">Adicionar novo anexo</label>
          <input type="file" @change="handleFileUpload" class="w-full" />
          <button @click="uploadAnexo" :disabled="!arquivoParaUpload" class="mt-2 px-3 py-1 bg-green-600 text-white rounded">
            Enviar Anexo
          </button>
        </div>

        <!-- Lista de anexos -->
        <div v-if="anexos.length" class="mt-4">
          <ul class="space-y-2">
            <li v-for="anexo in anexos" :key="anexo.id">
              <a :href="anexo.url" target="_blank" class="text-blue-600 hover:underline">
                📄 {{ anexo.nome_arquivo }}
              </a>
              <span class="text-xs text-gray-500 ml-2">({{ anexo.tipo }})</span>
            </li>
          </ul>
        </div>
        <p v-else class="text-gray-500">Nenhum anexo ainda.</p>
      </div>
    </div>

    <!-- ✅ Modal de E-mail para Secretaria -->
    <div v-if="showModalEmail" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold">📧 Editar e Enviar E-mail</h3>
          <button @click="fecharModalEmail" class="text-gray-500 text-2xl">&times;</button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Para:</label>
            <input
              v-model="emailPara"
              type="email"
              class="w-full p-2 border border-gray-300 rounded"
              placeholder="email@secretaria.gov.br"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Assunto:</label>
            <input
              v-model="emailAssunto"
              type="text"
              class="w-full p-2 border border-gray-300 rounded"
              placeholder="Assunto do e-mail"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Mensagem:</label>
            <textarea
              v-model="emailCorpo"
              class="w-full p-2 border border-gray-300 rounded font-mono text-sm"
              rows="12"
              placeholder="Escreva sua mensagem..."
            ></textarea>
          </div>
        </div>

        <div class="flex justify-end gap-2 mt-6">
          <button
            @click="fecharModalEmail"
            class="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            @click="enviarEmailParaSecretaria"
            :disabled="enviandoEmail"
            class="px-4 py-2 bg-dodgerblue text-white rounded hover:bg-royalblue disabled:opacity-50"
          >
            <span v-if="enviandoEmail">Enviando...</span>
            <span v-else>Enviar E-mail</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/api/supabaseClient'
import NavigationButtons from '@/components/NavigationButtons.vue'
import html2pdf from 'html2pdf.js'
import { useAuthStore } from '@/store/useAuthStore'

// Tipos
type StatusDenuncia = 'pendente' | 'aberta' | 'em_progresso' | 'concluida' | 'rejeitada'

interface DenunciaData {
  id: string
  titulo: string
  descricao: string
  status: StatusDenuncia
  endereco: string
  complemento: string | null
  latitude: number
  longitude: number
  created_at: string
  user_id: string
  denuncia_categorias: Array<{
    categorias: {
      nome: string | null
    } | null
  }> | null
}

interface DenunciaFormatada {
  id: string
  titulo: string
  descricao: string
  categoria: string
  status: StatusDenuncia
  endereco: string
  complemento: string | null
  latitude: number
  longitude: number
  created_at: string
  user_id: string
}

interface Autor {
  nome: string
  email: string
}

interface Midia {
  id: string
  denuncia_id: string
  caminho: string
  tipo: 'foto' | 'video'
  error?: boolean
}

interface SecretariaSugestao {
  id: number
  nome: string
  email: string
  site?: string | null
}

interface Comentario {
  id: string
  denuncia_id: string
  usuario_id: string
  comentario: string
  created_at: string
  autor?: Autor | null
}

interface Anexo {
  id: string
  denuncia_id: string
  url: string
  tipo: string
  nome_arquivo: string
}

// Injeções
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

// Refs
const denuncia = ref<DenunciaFormatada | null>(null)
const autor = ref<Autor | null>(null)
const midias = ref<Midia[]>([])
const comentarios = ref<Comentario[]>([])
const anexos = ref<Anexo[]>([])
const loading = ref(true)
const sugestoesSecretarias = ref<SecretariaSugestao[]>([])
const successMessage = ref('')

const midiaSelecionada = ref<Midia | null>(null)

// Refs para comentário
const novoComentario = ref('')
const enviandoComentario = ref(false)

// Refs para anexos
const showModalAnexos = ref(false)
const arquivoParaUpload = ref<File | null>(null)

// ✅ Refs para modal de e-mail
const showModalEmail = ref(false)
const emailPara = ref('')
const emailAssunto = ref('')
const emailCorpo = ref('')
const enviandoEmail = ref(false)

// Formatação
function formatarData(dataStr: string) {
  return new Date(dataStr).toLocaleString('pt-BR')
}

function formatCategoria(cat: string) {
  const map: Record<string, string> = {
    iluminacao_publica: 'Iluminação Pública',
    saneamento_basico: 'Saneamento Básico',
    limpeza_conservacao: 'Limpeza e Conservação',
    pavimentacao_asfalto: 'Pavimentação/Asfalto',
    seguranca_publica: 'Segurança Pública',
    posto_saude: 'Posto de Saúde',
    geral: 'Geral',
    outros: 'Outros'
  }
  return map[cat.toLowerCase()] || cat
}

function formatStatus(status: string) {
  const map: Record<string, string> = {
    pendente: 'Pendente',
    aberta: 'Aberta',
    em_progresso: 'Em Progresso',
    concluida: 'Concluída',
    rejeitada: 'Rejeitada'
  }
  return map[status] || status
}

function getMapaIframeUrl(lat: number, lng: number) {
  const zoom = 18
  const delta = 0.001
  return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - delta},${lat - delta},${lng + delta},${lat + delta}&layer=mapnik&marker=${lat},${lng}`
}

function getMapaLink(lat: number, lng: number) {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=18/${lat}/${lng}`
}

function getMidiaUrl(item: Midia) {
  if (!item.caminho) return ''
  const { data } = supabase.storage.from('fotos_videos').getPublicUrl(item.caminho)
  return data?.publicUrl || ''
}

function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || ''
}

function getVideoType(ext: string): string {
  const map: Record<string, string> = {
    mp4: 'mp4',
    webm: 'webm',
    ogg: 'ogg',
    mov: 'mp4',
    avi: 'mp4',
    mkv: 'webm',
    m4v: 'mp4'
  }
  return `video/${map[ext] || 'mp4'}`
}

function selecionarMidia(midia: Midia) {
  midiaSelecionada.value = midia
}

// Funções para anexos
function abrirModalAnexos() {
  showModalAnexos.value = true
}

function fecharModalAnexos() {
  showModalAnexos.value = false
  arquivoParaUpload.value = null
}

function handleFileUpload(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files?.length) {
    arquivoParaUpload.value = input.files[0]
  }
}

async function uploadAnexo() {
  if (!arquivoParaUpload.value || !denuncia.value?.id) return

  const file = arquivoParaUpload.value

  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    alert('Apenas arquivos PDF são permitidos.')
    return
  }

  const { data: sessionData, error: authError } = await supabase.auth.getSession()
  if (authError || !sessionData.session?.user) {
    alert('Usuário não autenticado')
    return
  }

  try {
    const uniqueFileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`
    const filePath = `${denuncia.value.id}/${uniqueFileName}`

    const { error: uploadError } = await supabase.storage
      .from('denuncias')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    const { error: insertError } = await supabase
      .from('anexos')
      .insert({
        denuncia_id: denuncia.value.id,
        usuario_id: sessionData.session.user.id,
        arquivo_url: filePath,
        tipo_arquivo: 'documento'
      })

    if (insertError) throw insertError

    const { data: anexosData, error: anexosError } = await supabase
      .from('anexos')
      .select('*')
      .eq('denuncia_id', denuncia.value.id)

    if (anexosError) throw anexosError

    anexos.value = (anexosData || []).map((anexo: any) => {
      const publicUrl = supabase.storage
        .from('denuncias')
        .getPublicUrl(anexo.arquivo_url)
        .data.publicUrl || ''
      const nomeArquivo = anexo.arquivo_url.split('/').pop() || 'Documento.pdf'
      return {
        id: anexo.id,
        denuncia_id: anexo.denuncia_id,
        url: publicUrl,
        tipo: 'PDF',
        nome_arquivo: nomeArquivo
      }
    })

    arquivoParaUpload.value = null
    alert('Anexo PDF enviado com sucesso!')
  } catch (err: any) {
    console.error('Erro ao enviar anexo:', err)
    alert('Erro ao enviar anexo: ' + (err.message || 'tente novamente'))
  }
}

async function loadDenuncia() {
  loading.value = true
  denuncia.value = null
  autor.value = null
  midias.value = []
  comentarios.value = []
  anexos.value = []
  sugestoesSecretarias.value = []

  const id = route.params.id as string

  if (!id) {
    console.error('ID da denúncia não fornecido na rota.')
    loading.value = false
    return
  }

  const cleanId = id.trim()
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanId)) {
    console.error('ID inválido:', id)
    loading.value = false
    return
  }

  try {
    const { data: denunciaData, error: err } = await supabase
      .from('denuncias')
      .select(`
        id,
        titulo,
        descricao,
        status,
        endereco,
        complemento,
        latitude,
        longitude,
        created_at,
        user_id,
        denuncia_categorias (
          categorias (
            nome
          )
        )
      `)
      .eq('id', cleanId)
      .single()

    if (err || !denunciaData) {
      console.error('Erro ao carregar denúncia:', err || 'Nenhuma denúncia encontrada')
      loading.value = false
      return
    }

    let categoriaNomes: string[] = []
    if (denunciaData.denuncia_categorias) {
      for (const dc of denunciaData.denuncia_categorias) {
        const cats = (dc as any)?.categorias
        if (!cats) continue
        if (Array.isArray(cats)) {
          for (const cat of cats) {
            if (cat?.nome) categoriaNomes.push(cat.nome)
          }
        } else if ((cats as any).nome) {
          categoriaNomes.push((cats as any).nome)
        }
      }
    }

    denuncia.value = {
      ...denunciaData,
      categoria: categoriaNomes.length > 0 ? categoriaNomes.join(', ') : 'Geral'
    }

    if (denunciaData.user_id) {
      const { data: autorData, error: autorError } = await supabase
        .from('usuarios')
        .select('nome,email')
        .eq('id', denunciaData.user_id)
        .single()
      if (!autorError && autorData) {
        autor.value = autorData
      }
    }

    const { data: midiasData, error: midiasError } = await supabase
      .from('fotos_videos')
      .select('*')
      .eq('denuncia_id', cleanId)
    midias.value = (midiasData || []).map((item: any) => ({ ...item, error: false })) || []

    if (midias.value.length > 0) {
      midiaSelecionada.value = midias.value[0]
    }

    const { data: comentariosData, error: comentariosError } = await supabase
      .from('comentarios_denuncia')
      .select('id, denuncia_id, usuario_id, comentario, created_at')
      .eq('denuncia_id', cleanId)
      .order('created_at', { ascending: true })

    if (comentariosData && comentariosData.length > 0) {
      const userIds = comentariosData.map((c: any) => c.usuario_id)
      const { data: usuariosData, error: usuariosError } = await supabase
        .from('usuarios')
        .select('id, nome, email')
        .in('id', userIds)

      const usuarioMap = new Map<string, Autor>()
      if (usuariosData) {
        usuariosData.forEach((u: any) => usuarioMap.set(u.id, u))
      }

      comentarios.value = comentariosData.map((com: any) => ({
        ...com,
        autor: usuarioMap.get(com.usuario_id) || null
      }))
    } else {
      comentarios.value = []
    }

    const { data: anexosData, error: anexosError } = await supabase
      .from('anexos')
      .select('*')
      .eq('denuncia_id', cleanId)
    anexos.value = anexosData || []

    const categoriaNormalizada = denuncia.value.categoria
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '')

    const categoriaMap: Record<string, SecretariaSugestao[]> = {
      seguranca_publica: [
        {
          id: 9,
          nome: 'Secretaria de Segurança Cidadã',
          email: 'seguranca@municipio.gov.br',
          site: 'https://www.marica.rj.gov.br/secretaria/seguranca-cidada/'
        }
      ],
      posto_saude: [
        {
          id: 3,
          nome: 'Secretaria de Saúde',
          email: 'saude@municipio.gov.br',
          site: 'https://www.marica.rj.gov.br/secretaria/saude/'
        }
      ],
      pavimentacao_asfalto: [
        {
          id: 6,
          nome: 'Secretaria de Transportes e Postura',
          email: 'obras@municipio.gov.br',
          site: 'https://www.marica.rj.gov.br/secretaria/transportes-e-postura/'
        }
      ],
      limpeza_conservacao: [
        {
          id: 6,
          nome: 'Secretaria de Transportes e Postura',
          email: 'obras@municipio.gov.br',
          site: 'https://www.marica.rj.gov.br/secretaria/transportes-e-postura/'
        }
      ],
      iluminacao_publica: [
        {
          id: 6,
          nome: 'Secretaria de Energias Renováveis e Iluminação Pública',
          email: 'iluminacao@municipio.gov.br',
          site: 'https://www.marica.rj.gov.br/secretaria/energias-renovaveis-e-iluminacao-publica/'
        }
      ],
      saneamento_basico: [
        {
          id: 6,
          nome: 'Companhia de Saneamento de Maricá (SANEMAR)',
          email: 'sanemar@municipio.gov.br',
          site: 'https://www.marica.rj.gov.br/secretaria/companhia-de-saneamento-de-marica/'
        }
      ],
      geral: [
        {
          id: 9,
          nome: 'Secretaria de Segurança Cidadã',
          email: 'seguranca@municipio.gov.br',
          site: 'https://www.marica.rj.gov.br/secretaria/seguranca-cidada/'
        }
      ],
      outros: [
        {
          id: 9,
          nome: 'Secretaria de Segurança Cidadã',
          email: 'seguranca@municipio.gov.br',
          site: 'https://www.marica.rj.gov.br/secretaria/seguranca-cidada/'
        }
      ]
    }
    sugestoesSecretarias.value = categoriaMap[categoriaNormalizada] || categoriaMap['outros']
  } catch (e) {
    console.error('Erro ao carregar denúncia', e)
  } finally {
    loading.value = false
  }
}

async function adicionarComentario() {
  if (!novoComentario.value.trim() || !denuncia.value?.id || !auth.user?.id) return

  enviandoComentario.value = true
  try {
    const { error } = await supabase
      .from('comentarios_denuncia')
      .insert({
        denuncia_id: denuncia.value.id,
        usuario_id: auth.user.id,
        comentario: novoComentario.value.trim()
      })

    if (error) throw error

    const { data: comentariosData, error: comentariosError } = await supabase
      .from('comentarios_denuncia')
      .select('id, denuncia_id, usuario_id, comentario, created_at')
      .eq('denuncia_id', denuncia.value.id)
      .order('created_at', { ascending: true })

    if (comentariosData && comentariosData.length > 0) {
      const userIds = comentariosData.map((c: any) => c.usuario_id)
      const { data: usuariosData, error: usuariosError } = await supabase
        .from('usuarios')
        .select('id, nome, email')
        .in('id', userIds)

      const usuarioMap = new Map<string, Autor>()
      if (usuariosData) {
        usuariosData.forEach((u: any) => usuarioMap.set(u.id, u))
      }

      comentarios.value = comentariosData.map((com: any) => ({
        ...com,
        autor: usuarioMap.get(com.usuario_id) || null
      }))
    } else {
      comentarios.value = []
    }

    novoComentario.value = ''
  } catch (err: any) {
    console.error('Erro ao adicionar comentário:', err)
    alert('❌ Não foi possível enviar seu comentário. Tente novamente.')
  } finally {
    enviandoComentario.value = false
  }
}

function gerarPDF() {
  const element = document.querySelector('.max-w-4xl') as HTMLElement | null
  if (!element || !denuncia.value) return

  const denunciaAtual = denuncia.value

  const mapaIframe = element.querySelector('iframe')
  if (mapaIframe && denunciaAtual.latitude && denunciaAtual.longitude) {
    const img = document.createElement('img')
    img.src = `https://quickosm.maposmatic.org/staticmap?lat=${denunciaAtual.latitude}&lon=${denunciaAtual.longitude}&zoom=16&width=600&height=300`
    img.style.width = '100%'
    img.style.height = '300px'
    img.style.objectFit = 'cover'
    img.style.borderRadius = '0.5rem'
    mapaIframe.parentNode?.replaceChild(img, mapaIframe)
  }

  const imgs = Array.from(element.querySelectorAll('img'))
  const loadImage = (img: HTMLImageElement): Promise<void> => {
    return new Promise((resolve) => {
      if (img.complete) {
        resolve()
      } else {
        img.onload = () => resolve()
        img.onerror = () => resolve()
      }
    })
  }

  Promise.all(imgs.map(loadImage))
    .then(() => {
      html2pdf()
        .from(element)
        .set({
          margin: 10,
          filename: `denuncia_${denunciaAtual.id}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        })
        .save()
    })
    .catch(err => {
      console.error('Erro ao gerar PDF:', err)
      successMessage.value = '❌ Erro ao gerar PDF. Tente novamente.'
    })
}

async function atualizarStatus(novoStatus: StatusDenuncia, mensagem: string) {
  if (!denuncia.value?.id || !auth.user?.id) {
    successMessage.value = '❌ Usuário não autenticado.'
    return
  }

  try {
    const { error } = await supabase
      .from('denuncias')
      .update({
        status: novoStatus,
        data_avaliacao: new Date().toISOString(),
        avaliado_por: auth.user.id
      })
      .eq('id', denuncia.value.id)

    if (error) throw error

    denuncia.value!.status = novoStatus
    successMessage.value = `✅ ${mensagem}`

    await new Promise(r => setTimeout(r, 1500))
    router.push({ name: 'TodasDenuncias' })
  } catch (err: any) {
    console.error('Erro ao atualizar status:', err)
    successMessage.value = `❌ Erro: ${err.message || 'Tente novamente'}`
  }
}

function abrirModalEmail(secretaria: SecretariaSugestao) {
  if (!denuncia.value) return

  const categoriaFormatada = formatCategoria(denuncia.value.categoria)

  const corpoInicial = `Olá,

Uma nova denúncia foi registrada no sistema SOSJAC:

📌 Título: ${denuncia.value.titulo}
📝 Descrição: ${denuncia.value.descricao}
📍 Endereço: ${denuncia.value.endereco || "Não informado"}
🚪 Complemento: ${denuncia.value.complemento || "Não informado"}

📅 Data: ${new Date(denuncia.value.created_at).toLocaleString("pt-BR")}
🏷️ Categoria: ${categoriaFormatada}
👤 Denunciante: ${autor.value?.nome || "Anônimo"} (${autor.value?.email || "Não informado"})


Atenciosamente,

MOVIMENTO SOS-JAC
AMAJAC – Associação de Moradores e Amigos do Bairro Jardim Atlântico Central
Rua Izabel Cristina Ouvina, 112, Jardim Atlântico Central
Maricá – RJ, CEP: 24.934-405`

  emailPara.value = secretaria.email
  emailAssunto.value = `[SOSJAC] Nova Denúncia: ${denuncia.value.titulo}`
  emailCorpo.value = corpoInicial
  showModalEmail.value = true
}

async function enviarEmailParaSecretaria() {
  if (!emailPara.value || !emailAssunto.value || !emailCorpo.value) {
    alert('Preencha todos os campos do e-mail.')
    return
  }

  if (!denuncia.value) return

  const denunciaAtual = denuncia.value
  let corpoCompleto = emailCorpo.value

  if (midias.value.length > 0) {
    corpoCompleto += '\n\n📸 Fotos e Vídeos:\n'
    midias.value.forEach(m => {
      const url = supabase.storage.from('fotos_videos').getPublicUrl(m.caminho).data.publicUrl
      if (url) corpoCompleto += `- ${url}\n`
    })
  }

  if (anexos.value.length > 0) {
    corpoCompleto += '\n📎 Anexos (PDFs):\n'
    anexos.value.forEach(a => {
      corpoCompleto += `- ${a.url}\n`
    })
  }

  const subject = encodeURIComponent(emailAssunto.value)
  const body = encodeURIComponent(corpoCompleto)
  window.location.href = `mailto:${emailPara.value}?subject=${subject}&body=${body}`

  successMessage.value = '✅ E-mail aberto no seu app de mensagens!'
  fecharModalEmail()
  await new Promise(r => setTimeout(r, 1500))
  router.push({ name: 'TodasDenuncias' })
}

function fecharModalEmail() {
  showModalEmail.value = false
  emailPara.value = ''
  emailAssunto.value = ''
  emailCorpo.value = ''
}

onMounted(loadDenuncia)
</script>