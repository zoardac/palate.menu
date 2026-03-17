import type { APIRoute } from 'astro';
import { put, head, getDownloadUrl } from '@vercel/blob';

const BLOB_KEY = 'waitlist/signups.json';

async function getSignups(): Promise<string[]> {
  try {
    const blob = await head(BLOB_KEY);
    const res = await fetch(blob.url);
    return await res.json();
  } catch {
    return [];
  }
}

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
    const signups = await getSignups();

    if (signups.includes(normalized)) {
      return new Response(JSON.stringify({ error: 'You\'re already on the list.' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    signups.push(normalized);

    await put(BLOB_KEY, JSON.stringify(signups), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
    });

    console.log(`[WAITLIST] New signup: ${normalized}`);

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
