import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Stability AI configuration
const STABILITY_API_KEY = process.env.STABILITY_API_KEY || 'sk-V2gw16jrcQEiWM0euXqCBzH2rbPjjT2w8MDpvJgiQvHYvPUu';
const STABILITY_API_URL = 'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image';

// Valid SDXL dimensions
const SDXL_DIMENSIONS = [
  { width: 1024, height: 1024 },
  { width: 1152, height: 896 },
  { width: 1216, height: 832 },
  { width: 1344, height: 768 },
  { width: 1536, height: 640 },
  { width: 640, height: 1536 },
  { width: 768, height: 1344 },
  { width: 832, height: 1216 },
  { width: 896, height: 1152 },
];

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
      // Select dimensions based on type
      // Characters: portrait (768x1344), Scenes: landscape (1344x768)
      const dimensions = type === 'character'
        ? SDXL_DIMENSIONS[6] // 768x1344 portrait
        : SDXL_DIMENSIONS[3]; // 1344x768 landscape

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
          height: dimensions.height,
          width: dimensions.width,
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
            source: 'stability-ai',
            dimensions: dimensions
          });
        }
      } else {
        const errorData = await stabilityResponse.json();
        console.log('Stability AI error:', errorData);
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
