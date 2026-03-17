import type { APIRoute } from 'astro';
import { put, list, del } from '@vercel/blob';

const BLOB_KEY = 'waitlist/signups.json';

async function getSignups(): Promise<string[]> {
  try {
    const { blobs } = await list({ prefix: 'waitlist/signups' });
    if (!blobs.length) return [];
    const res = await fetch(blobs[0].downloadUrl);
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

    // Delete old blob first, then write fresh (Blob doesn't overwrite by default)
    const { blobs } = await list({ prefix: 'waitlist/signups' });
    if (blobs.length) await del(blobs[0].url);

    await put(BLOB_KEY, JSON.stringify(signups), {
      access: 'private',
      contentType: 'application/json',
      addRandomSuffix: false,
    });

    console.log(`[WAITLIST] New signup: ${normalized} (total: ${signups.length})`);

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
