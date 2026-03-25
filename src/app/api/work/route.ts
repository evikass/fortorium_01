import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

// ============================================
// AI SDK для локальной работы
// ============================================
async function createZAI() {
  try {
    const ZAIModule = await import('z-ai-web-dev-sdk').then(m => m.default || m);
    return await ZAIModule.create();
  } catch (e) {
    console.log('⚠️ SDK не доступен, использую публичный API');
    return null;
  }
}

// ============================================
// POLLINATIONS.AI - бесплатный API (без ключа!)
// ============================================
function generatePollinationsUrl(prompt: string, style: string): string {
  const stylePrompts: Record<string, string> = {
    ghibli: 'Studio Ghibli style, Miyazaki, watercolor, magical, dreamy',
    disney: 'Disney animation style, vibrant colors, expressive characters',
    pixar: 'Pixar 3D style, cinematic lighting, detailed, beautiful',
    anime: 'Anime style, Japanese animation, stylized, dynamic',
    cartoon: 'Modern cartoon style, colorful, playful, fun'
  };
  
  const stylePrompt = stylePrompts[style] || stylePrompts.disney;
  const fullPrompt = `${stylePrompt}, ${prompt}, high quality detailed illustration`;
  
  const encodedPrompt = encodeURIComponent(fullPrompt);
  const seed = Math.floor(Math.random() * 1000000);
  
  // Pollinations.ai - генерирует изображение по URL
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&seed=${seed}`;
}

// ============================================
// АГЕНТ-ХУДОЖНИК
// ============================================
async function artistAgent(sceneTitle: string, sceneDescription: string, style: string) {
  console.log('🎨 Художник для сцены:', sceneTitle);
  
  const zai = await createZAI();
  
  if (zai) {
    try {
      console.log('✅ SDK доступен, генерирую...');
      
      const stylePrompts: Record<string, string> = {
        ghibli: 'Studio Ghibli style, Miyazaki, watercolor, magical atmosphere',
        disney: 'Disney animation style, vibrant colors, expressive',
        pixar: 'Pixar 3D style, cinematic lighting, detailed',
        anime: 'Anime style, Japanese animation, stylized',
        cartoon: 'Modern cartoon style, colorful, playful'
      };
      
      const stylePrompt = stylePrompts[style] || stylePrompts.disney;
      const imagePrompt = `${stylePrompt}, ${sceneDescription}, scene "${sceneTitle}", high quality illustration`;
      
      const startTime = Date.now();
      
      const imageResponse = await zai.images.generations.create({
        prompt: imagePrompt,
        size: '1024x1024'
      });
      
      const elapsed = Date.now() - startTime;
      console.log(`⏱️ SDK время: ${elapsed}ms`);
      
      if (imageResponse.data?.[0]?.base64) {
        return {
          success: true,
          imageUrl: `data:image/png;base64,${imageResponse.data[0].base64}`,
          prompt: imagePrompt,
          generationTime: elapsed,
          source: 'sdk'
        };
      } else if (imageResponse.data?.[0]?.url) {
        return {
          success: true,
          imageUrl: imageResponse.data[0].url,
          prompt: imagePrompt,
          generationTime: elapsed,
          source: 'sdk'
        };
      }
    } catch (e: any) {
      console.log('⚠️ SDK ошибка:', e?.message?.substring(0, 50));
    }
  }
  
  // Fallback: Pollinations.ai (работает везде, бесплатно!)
  console.log('🌸 Использую Pollinations.ai');
  
  const fullPrompt = `${sceneDescription}, scene "${sceneTitle}"`;
  const imageUrl = generatePollinationsUrl(fullPrompt, style);
  
  return {
    success: true,
    imageUrl,
    prompt: fullPrompt,
    generationTime: 100,
    source: 'pollinations',
    note: 'Сгенерировано через Pollinations.ai'
  };
}

// ============================================
// АГЕНТ-СЦЕНАРИСТ
// ============================================
async function writerAgent(projectTitle: string, projectDescription: string, style: string) {
  console.log('📝 Сценарист для:', projectTitle);
  
  const zai = await createZAI();
  
  if (zai) {
    try {
      const prompt = `Ты профессиональный сценарист анимации в стиле ${style}. Создай короткий сценарий.

Название: ${projectTitle}
Идея: ${projectDescription}

JSON формат:
{"title":"Название","logline":"Кратко","characters":[{"name":"Имя","description":"Описание"}],"scenes":[{"number":1,"title":"Сцена","location":"Место","description":"Описание","dialogue":[{"character":"Имя","line":"Реплика"}],"action":"Действие","duration":5}],"totalDuration":30,"mood":"настроение"}

3-5 сцен. Только JSON!`;

      const response = await zai.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8
      });

      const content = response.choices[0]?.message?.content || '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.log('⚠️ SDK сценарист ошибка');
    }
  }
  
  // Fallback сценарий
  return {
    title: projectTitle,
    logline: projectDescription,
    mood: style === 'ghibli' ? 'Волшебный' : 'Приключенческий',
    characters: [
      { name: "Главный Герой", description: "Протагонист" },
      { name: "Верный Друг", description: "Помощник" }
    ],
    scenes: [
      { number: 1, title: "Начало", location: "Дом", description: `${projectDescription}. Путешествие начинается.`, dialogue: [{ character: "Герой", line: "Вперёд!" }], action: "Начало пути", duration: 8 },
      { number: 2, title: "Путь", location: "Дорога", description: "Преодоление препятствий.", dialogue: [{ character: "Друг", line: "Мы справимся!" }], action: "Испытания", duration: 7 },
      { number: 3, title: "Победа", location: "Цель", description: "Триумф и достижение цели.", dialogue: [{ character: "Герой", line: "Мы сделали это!" }], action: "Победа", duration: 7 }
    ],
    totalDuration: 22
  };
}

// ============================================
// API ROUTES
// ============================================

export async function GET() {
  return NextResponse.json({ 
    success: true, 
    version: '3.1.7',
    features: ['sdk', 'pollinations-fallback'],
    message: 'API готов к работе!'
  });
}

export async function POST(request: NextRequest) {
  console.log('='.repeat(40));
  console.log('📥 Work API v3.1.7');
  
  try {
    const body = await request.json();
    const { action, data } = body;
    
    console.log('📋 Action:', action);
    
    switch (action) {
      case 'write_script': {
        const script = await writerAgent(
          data?.title || 'Проект',
          data?.description || 'Приключения',
          data?.style || 'disney'
        );
        return NextResponse.json({ success: true, message: '✍️ Сценарий создан!', script });
      }
      
      case 'create_storyboard': {
        const result = await artistAgent(
          data?.sceneTitle || 'Сцена',
          data?.sceneDescription || 'Описание',
          data?.style || 'disney'
        );
        return NextResponse.json({
          success: result.success,
          message: result.success ? `🎨 Изображение создано! (${result.source})` : '❌ Ошибка',
          image: result
        });
      }
      
      case 'run_full_pipeline': {
        const title = data?.title || 'Проект';
        const description = data?.description || 'Приключения';
        const style = data?.style || 'disney';
        
        const script = await writerAgent(title, description, style);
        
        let storyboard = null;
        if (script?.scenes?.[0]) {
          storyboard = await artistAgent(
            script.scenes[0].title,
            script.scenes[0].description,
            style
          );
        }
        
        return NextResponse.json({
          success: true,
          message: '🚀 Пайплайн выполнен!',
          results: { script, storyboard }
        });
      }
      
      default:
        return NextResponse.json({ success: false, error: 'Неизвестное действие' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('❌ Error:', error?.message);
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
