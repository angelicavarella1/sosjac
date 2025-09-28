// src/utils/formatters.ts

/**
 * Formata categorias de denúncias
 */
export const formatCategoria = (categoria: string): string => {
  const map: Record<string, string> = {
    iluminacao_publica: 'Iluminação Pública',
    saneamento_basico: 'Saneamento Básico',
    limpeza_conservacao: 'Limpeza e Conservação',
    pavimentacao_asfalto: 'Pavimentação/Asfalto',
    seguranca_publica: 'Segurança Pública',
    posto_saude: 'Posto de Saúde',
    outros: 'Outros',
  }
  return map[categoria] || categoria
}

/**
 * Formata status da denúncia
 */
export const formatStatus = (status: string): string => {
  const map: Record<string, string> = {
    pendente: 'Pendente',
    aprovada: 'Aprovada',
    rejeitada: 'Rejeitada',
  }
  return map[status] || status
}

/**
 * Formata nome da secretaria responsável
 */
export const formatSecretaria = (nome: string): string => {
  const map: Record<string, string> = {
    saude: 'Secretaria de Saúde',
    educacao: 'Secretaria de Educação',
    obras: 'Secretaria de Obras',
    transporte: 'Secretaria de Transporte',
    seguranca: 'Secretaria de Segurança',
    meio_ambiente: 'Secretaria de Meio Ambiente',
  }
  return map[nome] || nome
}

/**
 * Formata data e hora completas no padrão brasileiro
 */
export const formatDateTime = (isoString: string): string => {
  if (!isoString) return 'Data inválida'
  return new Date(isoString).toLocaleString('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Formata apenas a data no padrão brasileiro
 */
export const formatDate = (isoString: string): string => {
  if (!isoString) return 'Data inválida'
  return new Date(isoString).toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

/**
 * Formata apenas a hora no padrão brasileiro
 */
export const formatTime = (isoString: string): string => {
  if (!isoString) return 'Hora inválida'
  return new Date(isoString).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Aplica máscara em e-mails para ocultar parte do usuário
 */
export const maskEmail = (email: string): string => {
  if (!email || !email.includes('@')) return 'Não informado'
  const [local, domain] = email.split('@')
  return `${local.slice(0, 2)}***@${domain}`
}
