import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Fallback image generation using deterministic seeds and free services
// When AI image generation becomes available, this can be switched back

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, type } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Create a deterministic seed from the prompt for consistency
    const hash = crypto.createHash('md5').update(prompt).digest('hex').substring(0, 8);
    const seed = parseInt(hash, 16);

    let imageUrl: string;

    if (type === 'character') {
      // Use DiceBear for character portraits with various animation-like styles
      // Different styles for variety: adventurer, avataaars, bottts, fun-emoji, lorelei
      const styles = ['adventurer', 'avataaars', 'lorelei', 'notionists', 'shapes'];
      const styleIndex = seed % styles.length;
      const style = styles[styleIndex];

      // DiceBear generates consistent avatars based on seed
      imageUrl = `https://api.dicebear.com/7.x/${style}/png?seed=${seed}&size=512`;

      // Fetch the image and convert to base64
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error('Failed to generate character image');
      }

      const imageBuffer = await imageResponse.arrayBuffer();
      const base64 = Buffer.from(imageBuffer).toString('base64');

      return NextResponse.json({
        success: true,
        image: `data:image/png;base64,${base64}`,
        source: 'dicebear',
        style: style
      });
    } else {
      // For scenes, use multiple approaches for better variety
      // Try to find contextual images from free services

      // Extract keywords from prompt for better matching
      const keywords = extractKeywords(prompt);

      // Use Picsum with seed for consistent, high-quality images
      // The seed ensures the same prompt always gets the same image
      imageUrl = `https://picsum.photos/seed/${seed}/512/512`;

      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error('Failed to generate scene image');
      }

      const imageBuffer = await imageResponse.arrayBuffer();
      const base64 = Buffer.from(imageBuffer).toString('base64');

      return NextResponse.json({
        success: true,
        image: `data:image/jpeg;base64,${base64}`,
        source: 'picsum',
        keywords: keywords
      });
    }

  } catch (error: any) {
    console.error('Image generation error:', error);
    return NextResponse.json(
      { error: error?.message ?? 'Failed to generate image' },
      { status: 500 }
    );
  }
}

// Extract relevant keywords from the prompt for image matching
function extractKeywords(prompt: string): string[] {
  const stopWords = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
    'style', 'animation', 'animated', 'scene', 'image', 'picture', 'quality',
    'high', 'cinematic', 'beautiful', 'detailed', 'portrait', 'design'
  ]);

  const words = prompt.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));

  return [...new Set(words)].slice(0, 5);
}
