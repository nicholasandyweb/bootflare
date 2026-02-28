import { NextRequest, NextResponse } from 'next/server';

const WP_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://bootflare.com';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { postId, authorName, authorEmail, content } = body;

    // Validate required fields
    if (!postId || !authorName || !authorEmail || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: postId, authorName, authorEmail, and content are required.' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(authorEmail)) {
      return NextResponse.json(
        { error: 'Invalid email address.' },
        { status: 400 }
      );
    }

    // Submit comment to WordPress REST API
    // Note: WordPress requires numeric post ID for the REST API
    const wpResponse = await fetch(`${WP_URL}/wp-json/wp/v2/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      body: JSON.stringify({
        post: parseInt(postId, 10),
        author_name: authorName,
        author_email: authorEmail,
        content: content,
      }),
    });

    const wpData = await wpResponse.json();

    if (!wpResponse.ok) {
      // WordPress returns error details in the response
      const errorMessage = wpData.message || 'Failed to submit comment to WordPress.';
      console.error('WordPress comment submission error:', wpData);
      return NextResponse.json(
        { error: errorMessage },
        { status: wpResponse.status }
      );
    }

    // Success - return the created comment info
    return NextResponse.json({
      success: true,
      message: 'Comment submitted successfully.',
      comment: {
        id: wpData.id,
        status: wpData.status, // 'approved', 'hold', etc.
      },
    });

  } catch (error) {
    console.error('Error submitting comment:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while submitting your comment.' },
      { status: 500 }
    );
  }
}
