import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Stability AI configuration
const STABILITY_API_KEY = process.env.STABILITY_API_KEY || 'sk-V2gw16jrcQEiWM0euXqCBzH2rbPjjT2w8MDpvJgiQvHYvPUu';
const STABILITY_API_URL = 'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image';

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

    // Enhance prompt based on type
    const enhancedPrompt = type === 'character'
      ? `Portrait art of ${prompt}, animated character design, expressive face, digital art style, high quality, detailed`
      : `Scene: ${prompt}, animated movie style, cinematic, beautiful, high quality, detailed`;

    try {
      // Try Stability AI first
      const stabilityResponse = await fetch(STABILITY_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${STABILITY_API_KEY}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          text_prompts: [
            {
              text: enhancedPrompt,
              weight: 1
            }
          ],
          cfg_scale: 7,
          height: 1024,
          width: 1024,
          steps: 30,
          samples: 1,
          style_preset: type === 'character' ? 'anime' : 'cinematic'
        }),
      });

      if (stabilityResponse.ok) {
        const data = await stabilityResponse.json();
        
        if (data.artifacts && data.artifacts[0] && data.artifacts[0].base64) {
          return NextResponse.json({
            success: true,
            image: `data:image/png;base64,${data.artifacts[0].base64}`,
            source: 'stability-ai'
          });
        }
      }
      
      // If Stability AI fails, log and fall back
      console.log('Stability AI failed, using fallback');
    } catch (stabilityError) {
      console.log('Stability AI error:', stabilityError);
    }

    // Fallback: Use deterministic image generation
    return await generateFallbackImage(prompt, type);

  } catch (error: any) {
    console.error('Image generation error:', error);
    return NextResponse.json(
      { error: error?.message ?? 'Failed to generate image' },
      { status: 500 }
    );
  }
}

// Fallback image generation using free services
async function generateFallbackImage(prompt: string, type: string): Promise<Response> {
  const hash = crypto.createHash('md5').update(prompt).digest('hex').substring(0, 8);
  const seed = parseInt(hash, 16);

  if (type === 'character') {
    const styles = ['adventurer', 'avataaars', 'lorelei', 'notionists', 'shapes'];
    const styleIndex = seed % styles.length;
    const style = styles[styleIndex];
    const imageUrl = `https://api.dicebear.com/7.x/${style}/png?seed=${seed}&size=512`;

    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error('Failed to generate fallback image');
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const base64 = Buffer.from(imageBuffer).toString('base64');

    return NextResponse.json({
      success: true,
      image: `data:image/png;base64,${base64}`,
      source: 'dicebear-fallback',
      style: style
    });
  } else {
    const imageUrl = `https://picsum.photos/seed/${seed}/512/512`;

    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error('Failed to generate fallback image');
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const base64 = Buffer.from(imageBuffer).toString('base64');

    return NextResponse.json({
      success: true,
      image: `data:image/jpeg;base64,${base64}`,
      source: 'picsum-fallback'
    });
  }
}
