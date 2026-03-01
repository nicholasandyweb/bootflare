export async function GET() {
  try {
    return new Response('ok', {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    // Health endpoint must never throw.
    return new Response('error', { status: 200, headers: { 'Cache-Control': 'no-store' } });
  }
}
