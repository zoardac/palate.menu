import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    console.log('[WAITLIST] Received:', body);

    const { email } = body;

    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ error: 'A valid email is required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log('[WAITLIST] Posting to Formspark...');

    const res = await fetch('https://submit.formspark.io/f/tH9jwnWcF', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const responseText = await res.text();
    console.log('[WAITLIST] Formspark status:', res.status);
    console.log('[WAITLIST] Formspark response:', responseText);

    if (!res.ok) {
      return new Response(JSON.stringify({ error: `Formspark error: ${res.status} — ${responseText}` }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('[WAITLIST ERROR]', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
