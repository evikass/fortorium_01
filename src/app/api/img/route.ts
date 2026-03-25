import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const STABILITY_API_KEY = process.env.STABILITY_API_KEY;
const STABILITY_API_URL = 'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image';

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
      return NextResponse.json({ error: 'Prompt required' }, { status: 400 });
    }

    const enhancedPrompt = type === 'character'
      ? `Portrait of ${prompt}, animated character, digital art, high quality`
      : `Scene: ${prompt}, cinematic, animated style, high quality`;

    // Stability AI
    if (STABILITY_API_KEY) {
      try {
        const dim = type === 'character' ? SDXL_DIMENSIONS[6] : SDXL_DIMENSIONS[3];
        const res = await fetch(STABILITY_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${STABILITY_API_KEY}`,
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            text_prompts: [{ text: enhancedPrompt, weight: 1 }],
            cfg_scale: 7,
            height: dim.height,
            width: dim.width,
            steps: 30,
            samples: 1,
            style_preset: type === 'character' ? 'anime' : 'cinematic'
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.artifacts?.[0]?.base64) {
            return NextResponse.json({
              success: true,
              image: `data:image/png;base64,${data.artifacts[0].base64}`,
              source: 'stability'
            });
          }
        }
      } catch (e) {}
    }

    // Fallback
    const hash = crypto.createHash('md5').update(prompt).digest('hex').substring(0, 8);
    const seed = parseInt(hash, 16);

    if (type === 'character') {
      const styles = ['adventurer', 'avataaars', 'lorelei'];
      const url = `https://api.dicebear.com/7.x/${styles[seed % 3]}/png?seed=${seed}&size=512`;
      const r = await fetch(url);
      if (r.ok) {
        const buf = await r.arrayBuffer();
        return NextResponse.json({
          success: true,
          image: `data:image/png;base64,${Buffer.from(buf).toString('base64')}`,
          source: 'dicebear'
        });
      }
    }

    const url = `https://picsum.photos/seed/${seed}/512/512`;
    const r = await fetch(url);
    if (r.ok) {
      const buf = await r.arrayBuffer();
      return NextResponse.json({
        success: true,
        image: `data:image/jpeg;base64,${Buffer.from(buf).toString('base64')}`,
        source: 'picsum'
      });
    }

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><rect fill="#6366f1" width="512" height="512"/><text x="256" y="256" text-anchor="middle" fill="white" font-size="24">${type || 'image'}</text></svg>`;
    return NextResponse.json({
      success: true,
      image: `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`,
      source: 'placeholder'
    });

  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed' }, { status: 500 });
  }
}
