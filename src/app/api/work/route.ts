import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

// Динамический импорт SDK для работы в Node.js окружении
async function createZAI() {
  // @ts-ignore
  const ZAIModule = await import('z-ai-web-dev-sdk').then(m => m.default || m);
  return await ZAIModule.create();
}

// ============================================
// АГЕНТ-СЦЕНАРИСТ
// ============================================
async function writerAgent(projectTitle: string, projectDescription: string, style: string) {
  console.log('🎬 Запуск сценариста для:', projectTitle);
  
  try {
    const zai = await createZAI();
    console.log('✅ ZAI создан');
    
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
    console.error('❌ AI ошибка:', e);
  }
  
  // Fallback сценарий
  return {
    title: projectTitle,
    logline: projectDescription,
    mood: 'Приключенческий',
    characters: [
      { name: "Главный Герой", description: "Протагонист", traits: ["смелый", "добрый"] },
      { name: "Верный Друг", description: "Помощник", traits: ["верный"] }
    ],
    scenes: [
      {
        number: 1,
        title: "Начало пути",
        location: "Дом героя",
        description: `${projectDescription}. Приключение начинается.`,
        dialogue: [{ character: "Главный Герой", line: "Вперёд!" }],
        action: "Герой отправляется в путь",
        duration: 8
      },
      {
        number: 2,
        title: "Испытание",
        location: "В пути",
        description: "Герои преодолевают препятствия.",
        dialogue: [{ character: "Верный Друг", line: "Мы справимся!" }],
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
// АГЕНТ-ХУДОЖНИК (генерация изображений)
// ============================================
async function artistAgent(sceneTitle: string, sceneDescription: string, style: string) {
  console.log('🎨 Запуск художника для:', sceneTitle);
  
  try {
    const zai = await createZAI();
    console.log('✅ ZAI создан для генерации');
    
    const stylePrompts: Record<string, string> = {
      ghibli: 'Studio Ghibli style, Miyazaki, watercolor, magical atmosphere',
      disney: 'Disney animation style, vibrant colors, expressive',
      pixar: 'Pixar 3D style, cinematic lighting, detailed',
      anime: 'Anime style, Japanese animation, stylized',
      cartoon: 'Modern cartoon style, colorful, playful'
    };
    
    const stylePrompt = stylePrompts[style] || stylePrompts.disney;
    const imagePrompt = `${stylePrompt}, ${sceneDescription}, scene "${sceneTitle}", high quality illustration`;
    
    console.log('🖼️ Промпт:', imagePrompt.substring(0, 80) + '...');
    
    const startTime = Date.now();
    
    const imageResponse = await zai.images.generations.create({
      prompt: imagePrompt,
      size: '1024x1024'
    });
    
    const elapsed = Date.now() - startTime;
    console.log(`⏱️ Время: ${elapsed}ms`);
    
    if (imageResponse.data?.[0]?.base64) {
      const base64 = imageResponse.data[0].base64;
      console.log('✅ Base64 размер:', base64.length);
      
      return {
        success: true,
        imageUrl: `data:image/png;base64,${base64}`,
        prompt: imagePrompt,
        generationTime: elapsed
      };
    } else if (imageResponse.data?.[0]?.url) {
      console.log('✅ URL:', imageResponse.data[0].url);
      return {
        success: true,
        imageUrl: imageResponse.data[0].url,
        prompt: imagePrompt,
        generationTime: elapsed
      };
    } else {
      console.error('❌ Нет изображения в ответе');
      return {
        success: false,
        imageUrl: null,
        error: 'No image in response',
        prompt: imagePrompt
      };
    }
  } catch (error: any) {
    console.error('❌ Ошибка генерации:', error?.message);
    return {
      success: false,
      imageUrl: null,
      error: error?.message,
      prompt: sceneDescription
    };
  }
}

// ============================================
// API ENDPOINTS
// ============================================

export async function GET() {
  return NextResponse.json({ success: true, tasks: [], version: '3.1.5' });
}

export async function POST(request: NextRequest) {
  console.log('='.repeat(50));
  console.log('📥 API work request v3.1.5');
  
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
          message: result.success ? '🎨 Изображение создано!' : `⚠️ ${result.error || 'Ошибка генерации'}`,
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
