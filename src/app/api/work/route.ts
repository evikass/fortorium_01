import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

// Увеличиваем таймаут для Vercel
export const maxDuration = 60;

// ============================================
// AI ИНИЦИАЛИЗАЦИЯ
// ============================================
async function getAI() {
  try {
    console.log('🔄 Инициализация AI SDK...');
    const zai = await ZAI.create();
    console.log('✅ AI SDK инициализирован успешно');
    return zai;
  } catch (e) {
    console.error('❌ Ошибка инициализации AI SDK:', e);
    return null;
  }
}

// ============================================
// АГЕНТ-СЦЕНАРИСТ
// ============================================
async function writerAgent(projectTitle: string, projectDescription: string, style: string) {
  const zai = await getAI();
  
  console.log('🎬 Запуск сценариста для:', projectTitle);
  
  if (zai) {
    const prompt = `Ты профессиональный сценарист анимации в стиле ${style}. Создай короткий сценарий для мультфильма.

Название: ${projectTitle}
Описание идеи: ${projectDescription}

Создай сценарий в формате JSON:
{
  "title": "Название сценария",
  "logline": "Краткое описание в одном предложении",
  "characters": [
    {"name": "Имя", "description": "Описание персонажа", "traits": ["черта1", "черта2"]}
  ],
  "scenes": [
    {
      "number": 1,
      "title": "Название сцены",
      "location": "Место действия",
      "description": "Описание что происходит",
      "dialogue": [
        {"character": "Имя", "line": "Реплика"}
      ],
      "action": "Описание действия",
      "duration": 5
    }
  ],
  "totalDuration": 30,
  "mood": "настроение сценария"
}

Сделай сценарий интересным, с эмоциями и динамикой. 3-5 сцен. Отвечай ТОЛЬКО JSON!`;

    try {
      const response = await zai.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8
      });

      const content = response.choices[0]?.message?.content || '';
      console.log('📝 AI ответ получен, длина:', content.length);
      
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log('✅ Сценарий создан успешно');
        return parsed;
      }
    } catch (e) {
      console.error('❌ AI ошибка:', e);
    }
  }
  
  console.log('⚠️ Использую fallback сценарий');
  
  return {
    title: projectTitle,
    logline: projectDescription,
    mood: style === 'ghibli' ? 'Волшебный и атмосферный' : style === 'disney' ? 'Семейный и весёлый' : 'Приключенческий',
    characters: [
      { name: "Главный Герой", description: "Протагонист истории", traits: ["смелый", "добрый", "любознательный"] },
      { name: "Верный Друг", description: "Помощник героя", traits: ["верный", "забавный", "оптимист"] }
    ],
    scenes: [
      {
        number: 1,
        title: "Завязка истории",
        location: "Дом главного героя",
        description: `${projectDescription}. Герой мечтает о великом приключении.`,
        dialogue: [
          { character: "Главный Герой", line: "Сегодня начинается моё приключение!" },
          { character: "Верный Друг", line: "Я с тобой, друг!" }
        ],
        action: "Герой собирает вещи и готовится к путешествию",
        duration: 8
      },
      {
        number: 2,
        title: "Путь к цели",
        location: "В пути",
        description: "Герои преодолевают препятствия на своём пути.",
        dialogue: [
          { character: "Главный Герой", line: "Смотри! Там впереди что-то интересное!" }
        ],
        action: "Путешественники идут через лес/город",
        duration: 7
      },
      {
        number: 3,
        title: "Триумф",
        location: "Цель путешествия",
        description: "Герои побеждают и достигают цели.",
        dialogue: [
          { character: "Главный Герой", line: "Мы сделали это!" }
        ],
        action: "Победная сцена, герои празднуют успех",
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
  const zai = await getAI();
  
  console.log('🎨 Запуск художника для:', sceneTitle);
  
  const stylePrompts: Record<string, string> = {
    ghibli: 'Studio Ghibli style, Miyazaki, watercolor, magical, soft colors, anime, dreamy atmosphere',
    disney: 'Disney 2D animation style, classic animation, vibrant colors, expressive characters',
    pixar: 'Pixar 3D style, modern 3D animation, cinematic lighting, detailed, beautiful composition',
    anime: 'Anime style, Japanese animation, bright colors, stylized, dynamic',
    cartoon: 'Modern cartoon style, bright and colorful, fun, playful, energetic'
  };
  
  const stylePrompt = stylePrompts[style] || stylePrompts.disney;
  const imagePrompt = `${stylePrompt}, ${sceneDescription}, scene from animation titled "${sceneTitle}", high quality, detailed, professional illustration`;
  
  console.log('🖼️ Промпт для генерации:', imagePrompt.substring(0, 100) + '...');
  
  if (zai) {
    try {
      console.log('⏳ Начинаю генерацию изображения...');
      
      const startTime = Date.now();
      const imageResponse = await zai.images.generations.create({
        prompt: imagePrompt,
        size: '1024x1024'
      });
      const elapsed = Date.now() - startTime;
      
      console.log(`✅ Изображение создано за ${elapsed}ms`);
      console.log('📊 Размер base64:', imageResponse.data[0].base64?.length || 0);
      
      if (imageResponse.data[0].base64) {
        return {
          success: true,
          imageUrl: `data:image/png;base64,${imageResponse.data[0].base64}`,
          prompt: imagePrompt,
          generationTime: elapsed
        };
      } else {
        console.error('❌ Base64 пустой!');
      }
    } catch (error: any) {
      console.error('❌ Ошибка генерации изображения:', error?.message || error);
    }
  } else {
    console.log('⚠️ AI не инициализирован');
  }
  
  return {
    success: false,
    imageUrl: null,
    prompt: imagePrompt,
    message: 'Не удалось сгенерировать изображение. Попробуйте ещё раз.'
  };
}

// ============================================
// АГЕНТ-АНИМАТОР
// ============================================
async function animatorAgent(scenes: any[]) {
  const zai = await getAI();
  
  console.log('🎬 Запуск аниматора для', scenes.length, 'сцен');
  
  if (zai) {
    const prompt = `Ты профессиональный аниматор. Создай детальное описание анимации для каждой сцены.

Сцены из сценария:
${JSON.stringify(scenes, null, 2)}

Для каждой сцены опиши анимацию в формате JSON. Отвечай ТОЛЬКО JSON!`;

    try {
      const response = await zai.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7
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
  
  return {
    scenes: scenes.map((s, i) => ({
      sceneNumber: i + 1,
      animation: {
        cameraMovement: i === 0 ? "Статичный кадр, затем медленный наезд" : "Плавное панорамирование",
        characterActions: ["Вход персонажа", "Основное действие", "Реакция"],
        timing: { start: i * 7, end: (i + 1) * 7 },
        transitions: i < scenes.length - 1 ? "Кросс-диссольв" : "Затухание"
      }
    })),
    totalDuration: scenes.length * 7,
    animationStyle: "Классическая 2D анимация"
  };
}

// ============================================
// ОСНОВНОЙ API
// ============================================

// GET - получить задачи
export async function GET(request: NextRequest) {
  return NextResponse.json({ success: true, tasks: [] });
}

// POST - выполнить работу
export async function POST(request: NextRequest) {
  console.log('='.repeat(50));
  console.log('📥 Новый запрос к API work');
  
  try {
    const body = await request.json();
    const { action, projectId, data } = body;
    
    console.log('📋 Action:', action);
    
    switch (action) {
      case 'write_script': {
        const title = data?.title || 'Новый проект';
        const description = data?.description || 'История о приключениях';
        const style = data?.style || 'disney';
        
        const script = await writerAgent(title, description, style);
        
        return NextResponse.json({
          success: true,
          message: `✍️ AI-Сценарист написал сценарий!`,
          script
        });
      }
      
      case 'create_storyboard': {
        const { sceneTitle, sceneDescription, style } = data;
        
        console.log('🎨 Генерация изображения для:', sceneTitle);
        
        const result = await artistAgent(sceneTitle, sceneDescription, style || 'disney');
        
        console.log('📤 Результат:', { 
          success: result.success, 
          hasImage: !!result.imageUrl
        });
        
        return NextResponse.json({
          success: result.success,
          message: result.success 
            ? `🎨 AI-Художник создал изображение!` 
            : '⚠️ Не удалось сгенерировать изображение',
          image: result
        });
      }
      
      case 'run_full_pipeline': {
        const title = data?.title || 'Новый проект';
        const description = data?.description || 'История о приключениях';
        const style = data?.style || 'disney';
        
        const results: any = {
          script: null,
          storyboard: null,
          animation: null
        };
        
        console.log('📝 Шаг 1: Генерация сценария...');
        results.script = await writerAgent(title, description, style);
        
        console.log('🎨 Шаг 2: Генерация раскадровки...');
        if (results.script?.scenes?.[0]) {
          const firstScene = results.script.scenes[0];
          results.storyboard = await artistAgent(
            firstScene.title,
            firstScene.description,
            style
          );
        }
        
        console.log('🎬 Шаг 3: Генерация плана анимации...');
        if (results.script?.scenes) {
          results.animation = await animatorAgent(results.script.scenes);
        }
        
        console.log('✅ Полный пайплайн завершён');
        
        return NextResponse.json({
          success: true,
          message: '🚀 Пайплайн выполнен!',
          results
        });
      }
      
      default:
        return NextResponse.json({ success: false, error: 'Неизвестное действие' }, { status: 400 });
    }
  } catch (error) {
    console.error('❌ Критическая ошибка:', error);
    return NextResponse.json({ 
      success: false, 
      error: String(error) 
    }, { status: 500 });
  }
}
