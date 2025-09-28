import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    // 1️⃣ Validar token de autenticação
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Missing or invalid token" }),
        { status: 401, headers }
      );
    }

    const supabaseAnon = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseAnon.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Invalid token" }),
        { status: 401, headers }
      );
    }

    // 2️⃣ Verificar se o usuário é administrador
    const { data: usuario, error: userDbError } = await supabaseAnon
      .from("usuarios")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (userDbError || !usuario?.is_admin) {
      return new Response(
        JSON.stringify({ error: "Forbidden: Only administrators can send emails" }),
        { status: 403, headers }
      );
    }

    // 3️⃣ Criar client com Service Role Key
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 4️⃣ Validar corpo da requisição
    const body = await req.json();
    const { denunciaId, secretariaEmail } = body;
    if (!denunciaId || !secretariaEmail) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: denunciaId, secretariaEmail" }),
        { status: 400, headers }
      );
    }

    // 5️⃣ Buscar denúncia + usuário
    const { data: denuncia, error: denunciaError } = await supabaseService
      .from("denuncias")
      .select("*, usuarios(nome, email)")
      .eq("id", denunciaId)
      .single();

    if (denunciaError) throw denunciaError;

    const usuarioDenunciante = denuncia.usuarios;

    // 6️⃣ Mapear categoria
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

    // 7️⃣ Montar e-mail
    const subject = `[SOSJAC] Nova Denúncia: ${denuncia.titulo}`;
    const text = `
Olá,

Uma nova denúncia foi registrada no sistema SOSJAC:

📌 Título: ${denuncia.titulo}
📝 Descrição: ${denuncia.descricao}
📍 Local: ${denuncia.endereco || "Não informado"}
📅 Data: ${new Date(denuncia.created_at).toLocaleString("pt-BR")}
🏷️ Categoria: ${formatCategoria(denuncia.categoria)}
👤 Denunciante: ${usuarioDenunciante?.nome || "Anônimo"} (${usuarioDenunciante?.email || "Não informado"})

Acesse o painel administrativo para acompanhar: https://sosjac.yourcity.gov.br/admin

Atenciosamente,
Equipe SOSJAC
    `.trim();

    // 8️⃣ Enviar e-mail via função nativa Supabase
    const { data: emailData, error: emailError } = await supabaseService.functions.invoke("send-email", {
      body: { to: secretariaEmail, subject, text },
    });

    if (emailError) throw emailError;

    // 9️⃣ Atualizar status da denúncia
    const { error: updateError } = await supabaseService
      .from("denuncias")
      .update({ status: "email_enviado" })
      .eq("id", denunciaId);

    if (updateError) throw updateError;

    // 1️⃣0️⃣ Resposta de sucesso
    return new Response(
      JSON.stringify({ success: true, message: "E-mail enviado com sucesso!" }),
      { status: 200, headers }
    );

  } catch (err: any) {
    console.error("[enviar-email] erro:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers }
    );
  }
});
