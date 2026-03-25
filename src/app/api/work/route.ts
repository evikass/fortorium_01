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
    console.log('⚠️ SDK не инициализирован, используем fallback');
    return null;
  }
}

// ============================================
// FALLBACK: Pollinations.ai (бесплатный, без ключа)
// ============================================
async function generateWithPollinations(prompt: string, style: string): Promise<{ success: boolean; imageUrl: string | null; prompt: string }> {
  const stylePrompts: Record<string, string> = {
    ghibli: 'Studio Ghibli style, Miyazaki, watercolor, magical',
    disney: 'Disney animation style, vibrant colors',
    pixar: 'Pixar 3D style, cinematic',
    anime: 'Anime style, Japanese animation',
    cartoon: 'Modern cartoon style, colorful'
  };
  
  const stylePrompt = stylePrompts[style] || stylePrompts.disney;
  const fullPrompt = `${stylePrompt}, ${prompt}, high quality, detailed, 4k`;
  
  // Pollinations.ai - бесплатный API для генерации изображений
  const encodedPrompt = encodeURIComponent(fullPrompt);
  const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&seed=${Date.now()}`;
  
  console.log('🌸 Pollinations URL:', imageUrl.substring(0, 80) + '...');
  
  // Проверяем что изображение доступно
  try {
    const checkResponse = await fetch(imageUrl, { method: 'HEAD' });
    if (checkResponse.ok) {
      return { success: true, imageUrl, prompt: fullPrompt };
    }
  } catch (e) {
    console.log('⚠️ Pollinations не ответил');
  }
  
  return { success: false, imageUrl: null, prompt: fullPrompt };
}

// ============================================
// АГЕНТ-ХУДОЖНИК
// ============================================
async function artistAgent(sceneTitle: string, sceneDescription: string, style: string) {
  console.log('🎨 Запуск художника для:', sceneTitle);
  
  // Пробуем SDK
  const zai = await createZAI();
  
  if (zai) {
    try {
      console.log('✅ Использую SDK');
      
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
      console.log(`⏱️ SDK: ${elapsed}ms`);
      
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
      console.log('⚠️ SDK ошибка:', e?.message);
    }
  }
  
  // Fallback: Pollinations.ai
  console.log('🌸 Использую Pollinations.ai fallback');
  const result = await generateWithPollinations(`${sceneDescription}, scene titled "${sceneTitle}"`, style);
  
  if (result.success) {
    return {
      success: true,
      imageUrl: result.imageUrl,
      prompt: result.prompt,
      generationTime: 5000,
      source: 'pollinations'
    };
  }
  
  // Последний fallback: placeholder
  const placeholderUrl = `https://picsum.photos/seed/${Date.now()}/1024/1024`;
  
  return {
    success: true,
    imageUrl: placeholderUrl,
    prompt: sceneDescription,
    generationTime: 100,
    source: 'placeholder',
    warning: 'Используется тестовое изображение'
  };
}

// ============================================
// АГЕНТ-СЦЕНАРИСТ
// ============================================
async function writerAgent(projectTitle: string, projectDescription: string, style: string) {
  console.log('🎬 Запуск сценариста для:', projectTitle);
  
  const zai = await createZAI();
  
  if (zai) {
    try {
      const prompt = `Ты профессиональный сценарист анимации в стиле ${style}. Создай короткий сценарий для мультфильма.

Название: ${projectTitle}
Описание идеи: ${projectDescription}

Создай сценарий в формате JSON:
{
  "title": "Название",
  "logline": "Краткое описание",
  "characters": [{"name": "Имя", "description": "Описание", "traits": []}],
  "scenes": [{"number": 1, "title": "Название", "location": "Место", "description": "Описание", "dialogue": [], "action": "", "duration": 5}],
  "totalDuration": 30,
  "mood": "настроение"
}

3-5 сцен. Отвечай ТОЛЬКО JSON!`;

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
      { name: "Главный Герой", description: "Протагонист истории", traits: ["смелый", "добрый"] },
      { name: "Верный Друг", description: "Помощник героя", traits: ["верный", "оптимист"] }
    ],
    scenes: [
      {
        number: 1,
        title: "Начало пути",
        location: "Дом героя",
        description: `${projectDescription}. Приключение начинается.`,
        dialogue: [{ character: "Главный Герой", line: "Вперёд к приключениям!" }],
        action: "Герой отправляется в путь",
        duration: 8
      },
      {
        number: 2,
        title: "Испытание",
        location: "В пути",
        description: "Герои преодолевают препятствия.",
        dialogue: [{ character: "Верный Друг", line: "Мы справимся вместе!" }],
        action: "Преодоление трудностей",
        duration: 7
      },
      {
        number: 3,
        title: "Триумф",
        location: "Цель",
        description: "Победа и достижение цели.",
        dialogue: [{ character: "Главный Герой", line: "Мы сделали это!" }],
        action: "Празднование победы",
        duration: 7
      }
    ],
    totalDuration: 22
  };
}

// ============================================
// API ENDPOINTS
// ============================================

export async function GET() {
  return NextResponse.json({ 
    success: true, 
    version: '3.1.6',
    features: ['pollinations-fallback', 'picsum-fallback']
  });
}

export async function POST(request: NextRequest) {
  console.log('='.repeat(50));
  console.log('📥 API work request v3.1.6');
  
  try {
    const body = await request.json();
    const { action, data } = body;
    
    console.log('📋 Action:', action);
    
    switch (action) {
      case 'write_script': {
        const title = data?.title || 'Новый проект';
        const description = data?.description || 'Приключения';
        const style = data?.style || 'disney';
        
        const script = await writerAgent(title, description, style);
        
        return NextResponse.json({
          success: true,
          message: '✍️ Сценарий создан!',
          script
        });
      }
      
      case 'create_storyboard': {
        const { sceneTitle, sceneDescription, style } = data;
        
        const result = await artistAgent(sceneTitle, sceneDescription, style || 'disney');
        
        return NextResponse.json({
          success: result.success,
          message: result.success 
            ? `🎨 Изображение создано! (${result.source})` 
            : '⚠️ Ошибка генерации',
          image: result
        });
      }
      
      case 'run_full_pipeline': {
        const title = data?.title || 'Новый проект';
        const description = data?.description || 'Приключения';
        const style = data?.style || 'disney';
        
        const results: any = {};
        
        console.log('📝 Генерация сценария...');
        results.script = await writerAgent(title, description, style);
        
        if (results.script?.scenes?.[0]) {
          console.log('🎨 Генерация изображения...');
          results.storyboard = await artistAgent(
            results.script.scenes[0].title,
            results.script.scenes[0].description,
            style
          );
        }
        
        return NextResponse.json({
          success: true,
          message: '🚀 Пайплайн выполнен!',
          results
        });
      }
      
      default:
        return NextResponse.json({ success: false, error: 'Неизвестное действие' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('❌ Критическая ошибка:', error);
    return NextResponse.json({ 
      success: false, 
      error: error?.message || String(error)
    }, { status: 500 });
  }
}
