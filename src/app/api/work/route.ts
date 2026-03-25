import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

// ============================================
// AI HELPERS - используем fetch напрямую
// ============================================
async function getAIConfig() {
  // Пробуем переменные окружения (для Vercel)
  let baseUrl = process.env.Z_AI_BASE_URL;
  let apiKey = process.env.Z_AI_API_KEY;
  
  // Если нет переменных, пробуем файл конфигурации (для локальной разработки)
  if (!baseUrl || !apiKey) {
    try {
      const fs = await import('fs');
      const path = await import('path');
      const os = await import('os');
      
      const configPaths = [
        path.join(process.cwd(), '.z-ai-config'),
        path.join(os.homedir(), '.z-ai-config'),
        '/etc/.z-ai-config'
      ];
      
      for (const filePath of configPaths) {
        try {
          const configStr = fs.readFileSync(filePath, 'utf-8');
          const config = JSON.parse(configStr);
          if (config.baseUrl && config.apiKey) {
            baseUrl = config.baseUrl;
            apiKey = config.apiKey;
            console.log('✅ Config loaded from:', filePath);
            break;
          }
        } catch (e) {
          // Continue
        }
      }
    } catch (e) {
      console.log('⚠️ Could not load config file');
    }
  } else {
    console.log('✅ Config loaded from environment variables');
  }
  
  return { baseUrl, apiKey };
}

// ============================================
// АГЕНТ-СЦЕНАРИСТ
// ============================================
async function writerAgent(projectTitle: string, projectDescription: string, style: string) {
  console.log('🎬 Запуск сценариста для:', projectTitle);
  
  let zai;
  try {
    zai = await ZAI.create();
    console.log('✅ ZAI создан');
  } catch (e) {
    console.error('❌ Ошибка ZAI:', e);
    zai = null;
  }
  
  if (zai) {
    const prompt = `Ты профессиональный сценарист анимации в стиле ${style}. Создай короткий сценарий для мультфильма.

Название: ${projectTitle}
Описание идеи: ${projectDescription}

Создай сценарий в формате JSON:
{
  "title": "Название сценария",
  "logline": "Краткое описание",
  "characters": [{"name": "Имя", "description": "Описание", "traits": []}],
  "scenes": [{"number": 1, "title": "Название", "location": "Место", "description": "Описание", "dialogue": [], "action": "", "duration": 5}],
  "totalDuration": 30,
  "mood": "настроение"
}

3-5 сцен. Отвечай ТОЛЬКО JSON!`;

    try {
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
  }
  
  // Fallback сценарий
  return {
    title: projectTitle,
    logline: projectDescription,
    mood: 'Приключенческий',
    characters: [
      { name: "Главный Герой", description: "Протагонист", traits: ["смелый", "добрый"] },
      { name: "Верный Друг", description: "Помощник", traits: ["верный", "оптимист"] }
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
// АГЕНТ-ХУДОЖНИК (генерация изображений)
// ============================================
async function artistAgent(sceneTitle: string, sceneDescription: string, style: string) {
  console.log('🎨 Запуск художника для:', sceneTitle);
  
  const { baseUrl, apiKey } = await getAIConfig();
  
  if (!baseUrl || !apiKey) {
    console.error('❌ Нет конфигурации AI');
    return {
      success: false,
      imageUrl: null,
      error: 'AI not configured. Set Z_AI_BASE_URL and Z_AI_API_KEY environment variables.',
      prompt: sceneDescription
    };
  }
  
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
  console.log('🔗 API:', baseUrl);
  
  try {
    const startTime = Date.now();
    
    const response = await fetch(`${baseUrl}/images/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        prompt: imagePrompt,
        size: '1024x1024',
        n: 1
      })
    });
    
    const elapsed = Date.now() - startTime;
    console.log(`⏱️ Время: ${elapsed}ms, Status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API error:', response.status, errorText.substring(0, 200));
      return {
        success: false,
        imageUrl: null,
        error: `API error: ${response.status}`,
        details: errorText.substring(0, 200),
        prompt: imagePrompt
      };
    }
    
    const data = await response.json();
    
    if (data.data?.[0]?.base64) {
      const base64 = data.data[0].base64;
      console.log('✅ Base64 получен, размер:', base64.length);
      
      return {
        success: true,
        imageUrl: `data:image/png;base64,${base64}`,
        prompt: imagePrompt,
        generationTime: elapsed
      };
    } else if (data.data?.[0]?.url) {
      console.log('✅ URL получен:', data.data[0].url);
      return {
        success: true,
        imageUrl: data.data[0].url,
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
      prompt: imagePrompt
    };
  }
}

// ============================================
// API ENDPOINTS
// ============================================

export async function GET() {
  return NextResponse.json({ success: true, tasks: [] });
}

export async function POST(request: NextRequest) {
  console.log('='.repeat(50));
  console.log('📥 API work request');
  
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
          message: result.success ? '🎨 Изображение создано!' : '⚠️ Ошибка генерации',
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
