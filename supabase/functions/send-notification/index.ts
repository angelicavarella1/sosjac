import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import webpush from "https://esm.sh/web-push@3.6.0";

// 🔐 Configuração VAPID para notificações push
webpush.setVapidDetails(
  'mailto:nao-responda@sosjac.org',
  Deno.env.get('VAPID_PUBLIC_KEY')!,
  Deno.env.get('VAPID_PRIVATE_KEY')!
);

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Função para buscar inscrição push do usuário
async function getSubscriptionByUserId(user_id: string) {
  const res = await fetch(`${supabaseUrl}/rest/v1/subscriptions?user_id=eq.${user_id}`, {
    method: 'GET',
    headers: {
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await res.json();
  return data.length > 0 ? data[0] : null;
}

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
    const { user_id, title, body, url } = await req.json();

    if (!user_id || !title) {
      return new Response(JSON.stringify({ error: 'Campos obrigatórios ausentes' }), { status: 400, headers });
    }

    const subscription = await getSubscriptionByUserId(user_id);
    if (!subscription) {
      return new Response(JSON.stringify({ message: 'Sem inscrição push para este usuário' }), { status: 200, headers });
    }

    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: { p256dh: subscription.p256dh, auth: subscription.auth }
      },
      JSON.stringify({ 
        title, 
        body: body || 'Clique para ver mais.', 
        url: url || '/dashboard' 
      })
    );

    return new Response(JSON.stringify({ success: true }), { status: 200, headers });

  } catch (err: any) {
    console.error('[send-notification] Erro:', err);
    return new Response(JSON.stringify({ error: err.message || 'Erro interno' }), { status: 500, headers });
  }
});
