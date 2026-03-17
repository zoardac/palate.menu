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

    const resendKey = import.meta.env.RESEND_API_KEY;

    if (!resendKey) {
      console.error('[WAITLIST] Missing RESEND_API_KEY');
      return new Response(JSON.stringify({ error: 'Server misconfiguration.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: 'waitlist@resend.dev',
        to: 'brad.mclaughlin+palate@gmail.com',
        subject: '✦ New Palate waitlist signup',
        html: `
          <div style="font-family:Georgia,serif;max-width:480px;margin:0 auto;padding:40px 24px;color:#16120e;">
            <p style="font-size:22px;font-weight:300;margin:0 0 24px;">✦ New waitlist signup</p>
            <p style="font-size:16px;margin:0 0 8px;"><strong>Email:</strong> ${email}</p>
            <p style="font-size:13px;color:#7a6e62;margin:32px 0 0;">palate.menu</p>
          </div>
        `,
      }),
    });

    const data = await res.json();
    console.log('[WAITLIST] Resend response:', res.status, JSON.stringify(data));

    if (!res.ok) {
      throw new Error(`Resend error: ${res.status} — ${JSON.stringify(data)}`);
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
