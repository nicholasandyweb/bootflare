import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get('url');
    const filename = searchParams.get('filename') || 'logo.png';

    if (!url) {
        return new NextResponse('Missing URL', { status: 400 });
    }

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch image');

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const headers = new Headers();
        headers.set('Content-Disposition', `attachment; filename="${filename}"`);
        headers.set('Content-Type', response.headers.get('Content-Type') || 'image/png');

        return new NextResponse(buffer, {
            status: 200,
            headers,
        });
    } catch (error) {
        console.error('Download proxy error:', error);
        return new NextResponse('Error fetching image', { status: 500 });
    }
}
