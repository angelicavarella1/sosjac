// src/data/SecretariasCategorias.ts

export const categoriasDenuncias = [
  'iluminacao_publica',
  'saneamento_basico',
  'limpeza_conservacao',
  'pavimentacao_asfalto',
  'seguranca_publica',
  'posto_saude',
  'outros'
];

// ✅ OBRIGATÓRIO: usar number[] (com colchetes)
export const categoriasPorSecretaria: Record<string, number[]> = {
  iluminacao_publica: [13],
  saneamento_basico: [50],
  limpeza_conservacao: [40],
  pavimentacao_asfalto: [48],
  seguranca_publica: [36],
  posto_saude: [35],
  outros: [56]
};