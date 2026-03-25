import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Stability AI configuration
const STABILITY_API_KEY = process.env.STABILITY_API_KEY;
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

    console.log('Image generation request:', { prompt, type, hasApiKey: !!STABILITY_API_KEY });

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

    // Try Stability AI if API key is available
    if (STABILITY_API_KEY) {
      try {
        const dimensions = type === 'character'
          ? SDXL_DIMENSIONS[6] // 768x1344 portrait
          : SDXL_DIMENSIONS[3]; // 1344x768 landscape

        console.log('Trying Stability AI with dimensions:', dimensions);

        const stabilityResponse = await fetch(STABILITY_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${STABILITY_API_KEY}`,
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            text_prompts: [{ text: enhancedPrompt, weight: 1 }],
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
          if (data.artifacts?.[0]?.base64) {
            console.log('Stability AI success');
            return NextResponse.json({
              success: true,
              image: `data:image/png;base64,${data.artifacts[0].base64}`,
              source: 'stability-ai'
            });
          }
        } else {
          const errorText = await stabilityResponse.text();
          console.log('Stability AI failed:', stabilityResponse.status, errorText);
        }
      } catch (stabilityError: any) {
        console.log('Stability AI error:', stabilityError?.message);
      }
    } else {
      console.log('No Stability API key, using fallback');
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
  console.log('Using fallback for:', type);
  
  const hash = crypto.createHash('md5').update(prompt).digest('hex').substring(0, 8);
  const seed = parseInt(hash, 16);

  try {
    if (type === 'character') {
      const styles = ['adventurer', 'avataaars', 'lorelei', 'notionists'];
      const styleIndex = seed % styles.length;
      const style = styles[styleIndex];
      const imageUrl = `https://api.dicebear.com/7.x/${style}/png?seed=${seed}&size=512`;

      console.log('Fetching from DiceBear:', imageUrl);
      
      const imageResponse = await fetch(imageUrl, {
        headers: { 'Accept': 'image/png' }
      });
      
      if (!imageResponse.ok) {
        throw new Error(`DiceBear failed: ${imageResponse.status}`);
      }

      const imageBuffer = await imageResponse.arrayBuffer();
      const base64 = Buffer.from(imageBuffer).toString('base64');

      console.log('DiceBear success, size:', imageBuffer.byteLength);

      return NextResponse.json({
        success: true,
        image: `data:image/png;base64,${base64}`,
        source: 'dicebear'
      });
    } else {
      const imageUrl = `https://picsum.photos/seed/${seed}/512/512`;

      console.log('Fetching from Picsum:', imageUrl);
      
      const imageResponse = await fetch(imageUrl);
      
      if (!imageResponse.ok) {
        throw new Error(`Picsum failed: ${imageResponse.status}`);
      }

      const imageBuffer = await imageResponse.arrayBuffer();
      const base64 = Buffer.from(imageBuffer).toString('base64');

      console.log('Picsum success, size:', imageBuffer.byteLength);

      return NextResponse.json({
        success: true,
        image: `data:image/jpeg;base64,${base64}`,
        source: 'picsum'
      });
    }
  } catch (fallbackError: any) {
    console.error('Fallback error:', fallbackError);
    
    // Last resort: return a simple placeholder
    return NextResponse.json({
      success: true,
      image: generatePlaceholderSVG(type, prompt),
      source: 'placeholder'
    });
  }
}

// Generate a simple SVG placeholder as last resort
function generatePlaceholderSVG(type: string, prompt: string): string {
  const hash = crypto.createHash('md5').update(prompt).digest('hex').substring(0, 6);
  const color = type === 'character' ? `#${hash}` : `#${hash.substring(0, 6)}`;
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
    <rect width="512" height="512" fill="${color}"/>
    <text x="256" y="256" text-anchor="middle" fill="white" font-size="24" font-family="Arial">${type}</text>
    <text x="256" y="300" text-anchor="middle" fill="white" font-size="14" font-family="Arial">${prompt.substring(0, 30)}...</text>
  </svg>`;
  
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}
