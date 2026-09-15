import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PurchasePayload {
  purchaseId: string
  productId: string
  productDescription: string
  dateTime: string        // ISO 8601
  amount: number
  currency: string
  clientId: string
  firstName: string
  lastName: string
  email: string
}

const REQUIRED_FIELDS: (keyof PurchasePayload)[] = [
  'purchaseId', 'productId', 'dateTime', 'amount', 'currency', 'email',
]

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Verify shared secret
  const secret = Deno.env.get('WEBHOOK_SECRET')
  if (!secret || req.headers.get('Authorization') !== `Bearer ${secret}`) {
    return json({ error: 'Unauthorized' }, 401)
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  let body: PurchasePayload
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid JSON' }, 400)
  }

  for (const field of REQUIRED_FIELDS) {
    if (body[field] === undefined || body[field] === null || body[field] === '') {
      return json({ error: `Missing required field: ${field}` }, 400)
    }
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )

  const { error } = await supabase.from('paperbell_purchases').upsert(
    {
      purchase_id:         body.purchaseId,
      product_id:          body.productId,
      product_description: body.productDescription,
      date_time:           body.dateTime,
      amount:              body.amount,
      currency:            body.currency,
      client_id:           body.clientId,
      first_name:          body.firstName,
      last_name:           body.lastName,
      email:               body.email,
    },
    { onConflict: 'purchase_id' },
  )

  if (error) {
    console.error('DB error:', error)
    return json({ error: 'Database error' }, 500)
  }

  return json({ ok: true, purchaseId: body.purchaseId }, 200)
})

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
