import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ error: 'A valid email is required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const normalized = email.toLowerCase().trim();

    // Store in Vercel KV if available, otherwise log
    // To enable: run `vercel env add KV_REST_API_URL` and `vercel env add KV_REST_API_TOKEN`
    // after linking a KV store in your Vercel dashboard.
    const kvUrl = import.meta.env.KV_REST_API_URL;
    const kvToken = import.meta.env.KV_REST_API_TOKEN;

    if (kvUrl && kvToken) {
      const key = `waitlist:${normalized}`;
      const timestamp = new Date().toISOString();

      // Check for duplicate
      const checkRes = await fetch(`${kvUrl}/get/${key}`, {
        headers: { Authorization: `Bearer ${kvToken}` },
      });
      const existing = await checkRes.json();

      if (existing.result) {
        return new Response(JSON.stringify({ error: 'You\'re already on the list.' }), {
          status: 409,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Store the entry
      await fetch(`${kvUrl}/set/${key}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${kvToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(timestamp),
      });

      // Append to a sorted list for easy export
      await fetch(`${kvUrl}/lpush/waitlist:all`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${kvToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(`${normalized}|${timestamp}`),
      });
    } else {
      // Fallback: log to console (visible in Vercel function logs)
      console.log(`[WAITLIST] New signup: ${normalized} at ${new Date().toISOString()}`);
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[WAITLIST ERROR]', err);
    return new Response(JSON.stringify({ error: 'Server error. Please try again.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
