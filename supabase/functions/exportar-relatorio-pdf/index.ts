import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

// 🔐 CHAVE DE API DO PDFSHIFT
const PDFSHIFT_API_KEY = Deno.env.get("PDFSHIFT_API_KEY") ?? "";
const PDFSHIFT_URL = "https://api.pdfshift.io/v3/convert/pdf";

serve(async (req) => {
  const headers = new Headers({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Content-Type": "application/json",
  });

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  try {
    const body = await req.json();
    const { denunciaId } = body;

    if (!denunciaId) {
      return new Response(
        JSON.stringify({ error: "denunciaId é obrigatório" }),
        { status: 400, headers }
      );
    }

    // ✅ Cria client Supabase com Service Role Key
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SERVICE_ROLE_KEY") ?? ""
    );

    // ✅ Consulta a denúncia com join do usuário
    const { data: denuncia, error: denunciaError } = await supabase
      .from("denuncias")
      .select(`*, usuarios(nome, email)`)
      .eq("id", denunciaId)
      .single();

    if (denunciaError) throw denunciaError;
    const usuario = denuncia.usuarios;

    // ✅ Função para formatar categoria
    const formatCategoria = (cat: string): string => {
      const map: Record<string, string> = {
        iluminacao_publica: "Iluminação Pública",
        saneamento_basico: "Saneamento Básico",
        limpeza_conservacao: "Limpeza e Conservação",
        pavimentacao_asfalto: "Pavimentação/Asfalto",
        seguranca_publica: "Segurança Pública",
        posto_saude: "Posto de Saúde",
        outros: "Outros",
      };
      return map[cat] || cat;
    };

    // ✅ Monta HTML do relatório
    const html = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>Denúncia SOSJAC</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
          h1 { color: #003366; border-bottom: 2px solid #eee; }
          .header { text-align: center; margin-bottom: 30px; }
          .section { margin: 20px 0; }
          .label { font-weight: bold; color: #333; }
          .value { margin-left: 8px; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📋 DENÚNCIA SOSJAC</h1>
          <p style="font-size: 14px;">Secretaria Municipal de [NOME DA CIDADE]</p>
        </div>

        <div class="section">
          <span class="label">ID da denúncia:</span>
          <span class="value">${denuncia.id}</span>
        </div>

        <div class="section">
          <span class="label">Título:</span>
          <span class="value">${denuncia.titulo}</span>
        </div>

        <div class="section">
          <span class="label">Descrição:</span>
          <div class="value">${denuncia.descricao.replace(/\n/g, "<br>")}</div>
        </div>

        <div class="section">
          <span class="label">Categoria:</span>
          <span class="value">${formatCategoria(denuncia.categoria)}</span>
        </div>

        <div class="section">
          <span class="label">Local:</span>
          <span class="value">${denuncia.endereco || "Não informado"}</span>
        </div>

        <div class="section">
          <span class="label">Data de registro:</span>
          <span class="value">${new Date(denuncia.created_at).toLocaleString("pt-BR")}</span>
        </div>

        <div class="section">
          <span class="label">Denunciante:</span>
          <span class="value">${usuario?.nome || "Anônimo"} (${usuario?.email || "Não informado"})</span>
        </div>

        <div class="footer">
          Sistema SOSJAC — Cidadania Ativa e Transparência Pública<br>
          Gerado em: ${new Date().toLocaleString("pt-BR")}
        </div>
      </body>
      </html>
    `.trim();

    // ✅ Chamada ao PDFShift
    const response = await fetch(PDFSHIFT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${btoa("api:" + PDFSHIFT_API_KEY)}`,
      },
      body: JSON.stringify({
        source: html,
        format: "A4",
        margin: "20mm",
        timeout: 10000,
        enable_javascript: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[PDFShift] Erro:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Falha ao gerar PDF via PDFShift", details: errorText }),
        { status: 500, headers }
      );
    }

    const pdfBuffer = await response.arrayBuffer();

    // ✅ Retorna PDF como download
    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="denuncia_${denunciaId}.pdf"`,
        "Cache-Control": "no-cache",
      },
    });

  } catch (err: any) {
    console.error("[exportar-relatorio-pdf] erro geral:", err);
    return new Response(
      JSON.stringify({ error: "Erro interno ao gerar PDF", details: err.message }),
      { status: 500, headers }
    );
  }
});
