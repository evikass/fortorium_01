import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { db } from '@/lib/db';

// Инициализация AI - z-ai-web-dev-sdk уже настроен!
let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null;

async function getAI() {
  if (!zaiInstance) {
    try {
      zaiInstance = await ZAI.create();
      console.log('✅ AI SDK инициализирован успешно');
    } catch (e) {
      console.error('❌ Ошибка инициализации AI SDK:', e);
      return null;
    }
  }
  return zaiInstance;
}

// ============================================
// АГЕНТ-СЦЕНАРИСТ
// ============================================
async function writerAgent(projectTitle: string, projectDescription: string, style: string) {
  const zai = await getAI();
  
  console.log('🎬 Запуск сценариста для:', projectTitle);
  
  // Если есть AI - используем его
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
      console.log('📝 AI ответ:', content.substring(0, 200) + '...');
      
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
  
  // Fallback - генерируем базовый сценарий на основе описания
  return {
    title: projectTitle,
    logline: projectDescription,
    mood: style === 'ghibli' ? 'Волшебный и атмосферный' : style === 'disney' ? 'Семейный и весёлый' : 'Приключенческий',
    characters: [
      { name: "Главный Герой", description: "Протагонист истории", traits: ["смелый", "добрый", "любознательный"] },
      { name: "Верный Друг", description: "Помощник героя", traits: ["верный", "забавный", "оптимист"] },
      { name: "Антагонист", description: "Противник героя", traits: ["хитрый", "амбициозный"] }
    ],
    scenes: [
      {
        number: 1,
        title: "Завязка истории",
        location: "Дом главного героя",
        description: `${projectDescription}. Герой мечтает о великом приключении.`,
        dialogue: [
          { character: "Главный Герой", line: "Сегодня начинается моё приключение!" },
          { character: "Верный Друг", line: "Я с тобой, друг! Это будет здорово!" }
        ],
        action: "Герой собирает вещи и готовится к путешествию",
        duration: 8
      },
      {
        number: 2,
        title: "Путь к цели",
        location: "В пути",
        description: "Герои преодолевают первые препятствия на своём пути.",
        dialogue: [
          { character: "Главный Герой", line: "Смотри! Там впереди что-то интересное!" },
          { character: "Верный Друг", line: "Нужно быть осторожными..." }
        ],
        action: "Путешественники идут через лес/город",
        duration: 7
      },
      {
        number: 3,
        title: "Испытание",
        location: "Таинственное место",
        description: "Герои сталкиваются с главным препятствием.",
        dialogue: [
          { character: "Антагонист", line: "Вы никогда не пройдёте!" },
          { character: "Главный Герой", line: "Мы справимся, если будем вместе!" }
        ],
        action: "Напряжённая сцена с препятствием",
        duration: 8
      },
      {
        number: 4,
        title: "Триумф",
        location: "Цель путешествия",
        description: "Герои побеждают и достигают цели.",
        dialogue: [
          { character: "Главный Герой", line: "Мы сделали это!" },
          { character: "Верный Друг", line: "Я знал, что у нас получится!" }
        ],
        action: "Победная сцена, герои празднуют успех",
        duration: 7
      }
    ],
    totalDuration: 30
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
  
  // Если есть AI - генерируем изображение
  if (zai) {
    try {
      console.log('🖼️ Генерация изображения:', imagePrompt.substring(0, 100) + '...');
      
      const imageResponse = await zai.images.generations.create({
        prompt: imagePrompt,
        size: '1024x1024'
      });
      
      console.log('✅ Изображение создано успешно');
      
      return {
        success: true,
        imageUrl: `data:image/png;base64,${imageResponse.data[0].base64}`,
        prompt: imagePrompt
      };
    } catch (error) {
      console.error('❌ Ошибка генерации изображения:', error);
    }
  }
  
  console.log('⚠️ Изображение не сгенерировано');
  
  // Fallback - возвращаем заглушку
  return {
    success: true,
    imageUrl: null,
    prompt: imagePrompt,
    message: 'Изображение будет сгенерировано при наличии AI'
  };
}

// ============================================
// АГЕНТ-АНИМАТОР
// ============================================
async function animatorAgent(scenes: any[]) {
  const zai = await getAI();
  
  console.log('🎬 Запуск аниматора для', scenes.length, 'сцен');
  
  // Если есть AI - используем его
  if (zai) {
    const prompt = `Ты профессиональный аниматор. Создай детальное описание анимации для каждой сцены.

Сцены из сценария:
${JSON.stringify(scenes, null, 2)}

Для каждой сцены опиши анимацию в формате JSON:
{
  "scenes": [
    {
      "sceneNumber": 1,
      "animation": {
        "cameraMovement": "описание движения камеры",
        "characterActions": ["действие персонажа 1"],
        "timing": {"start": 0, "end": 5},
        "transitions": "переход к следующей сцене",
        "effects": ["эффект 1"]
      }
    }
  ],
  "totalDuration": 30,
  "animationStyle": "описание стиля анимации"
}

Отвечай ТОЛЬКО JSON!`;

    try {
      const response = await zai.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7
      });

      const content = response.choices[0]?.message?.content || '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log('✅ План анимации создан');
        return parsed;
      }
    } catch (e) {
      console.error('❌ AI ошибка:', e);
    }
  }
  
  // Fallback - базовая анимация
  return {
    scenes: scenes.map((s, i) => ({
      sceneNumber: i + 1,
      animation: {
        cameraMovement: i === 0 ? "Статичный кадр, затем медленный наезд" : "Плавное панорамирование",
        characterActions: ["Вход персонажа", "Основное действие", "Реакция"],
        timing: { start: i * 7, end: (i + 1) * 7 },
        transitions: i < scenes.length - 1 ? "Кросс-диссольв" : "Затухание",
        effects: ["Световые блики", "Лёгкое размытие движения"]
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
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');
  
  try {
    const tasks = await db.hiredAgentTask.findMany({
      where: projectId ? { projectId } : {},
      include: { agent: true },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    
    return NextResponse.json({ success: true, tasks });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// POST - выполнить работу
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, projectId, agentId, data } = body;
    
    console.log('📋 Запрос:', action, 'projectId:', projectId);
    
    switch (action) {
      // ========================================
      // СЦЕНАРИСТ - написать сценарий
      // ========================================
      case 'write_script': {
        const project = await db.animationProject.findUnique({
          where: { id: projectId }
        });
        
        if (!project) {
          return NextResponse.json({ success: false, error: 'Проект не найден' }, { status: 404 });
        }
        
        // Найти сценариста ИЛИ использовать виртуального
        let writer = await db.hiredAgent.findFirst({
          where: { role: 'writer', status: 'idle' }
        });
        
        const virtualWriter = !writer;
        const writerName = writer?.name || 'AI-Сценарист';
        const writerId = writer?.id;
        
        if (writer) {
          await db.hiredAgent.update({
            where: { id: writer.id },
            data: { status: 'working' }
          });
        }
        
        // Генерируем сценарий
        const script = await writerAgent(
          project.title,
          project.description,
          project.style || 'disney'
        );
        
        // Создаём задачу
        const taskData: any = {
          projectId: project.id,
          type: 'script',
          title: `Сценарий: ${project.title}`,
          description: 'Написание сценария',
          status: 'completed',
          input: JSON.stringify({ title: project.title, description: project.description }),
          output: JSON.stringify(script),
          completedAt: new Date()
        };
        
        if (writerId) {
          taskData.agentId = writerId;
        }
        
        const task = await db.hiredAgentTask.create({ data: taskData });
        
        // Возвращаем агента в idle
        if (writer) {
          await db.hiredAgent.update({
            where: { id: writer.id },
            data: { status: 'idle', tasksCompleted: { increment: 1 } }
          });
        }
        
        console.log('✅ Сценарий готов');
        
        return NextResponse.json({
          success: true,
          message: `✍️ ${writerName} написал сценарий!`,
          script,
          task,
          virtualAgent: virtualWriter
        });
      }
      
      // ========================================
      // ХУДОЖНИК - создать раскадровку
      // ========================================
      case 'create_storyboard': {
        const { sceneTitle, sceneDescription, style } = data;
        
        let artist = await db.hiredAgent.findFirst({
          where: { role: 'artist', status: 'idle' }
        });
        
        const virtualArtist = !artist;
        const artistName = artist?.name || 'AI-Художник';
        const artistId = artist?.id;
        
        if (artist) {
          await db.hiredAgent.update({
            where: { id: artist.id },
            data: { status: 'working' }
          });
        }
        
        // Генерируем изображение
        const result = await artistAgent(sceneTitle, sceneDescription, style || 'disney');
        
        const taskData: any = {
          projectId: projectId || 'default',
          type: 'storyboard',
          title: `Раскадровка: ${sceneTitle}`,
          description: sceneDescription,
          status: 'completed',
          input: JSON.stringify({ sceneTitle, sceneDescription, style }),
          output: JSON.stringify(result),
          completedAt: new Date()
        };
        
        if (artistId) {
          taskData.agentId = artistId;
        }
        
        const task = await db.hiredAgentTask.create({ data: taskData });
        
        if (artist) {
          await db.hiredAgent.update({
            where: { id: artist.id },
            data: { status: 'idle', tasksCompleted: { increment: 1 } }
          });
        }
        
        return NextResponse.json({
          success: true,
          message: `🎨 ${artistName} создал раскадровку!`,
          image: result,
          task,
          virtualAgent: virtualArtist
        });
      }
      
      // ========================================
      // АНИМАТОР - описать анимацию
      // ========================================
      case 'plan_animation': {
        const { scenes } = data;
        
        let animator = await db.hiredAgent.findFirst({
          where: { role: 'animator', status: 'idle' }
        });
        
        const virtualAnimator = !animator;
        const animatorName = animator?.name || 'AI-Аниматор';
        const animatorId = animator?.id;
        
        if (animator) {
          await db.hiredAgent.update({
            where: { id: animator.id },
            data: { status: 'working' }
          });
        }
        
        const animation = await animatorAgent(scenes);
        
        const taskData: any = {
          projectId: projectId || 'default',
          type: 'animation',
          title: 'План анимации',
          description: 'Описание анимационных сцен',
          status: 'completed',
          input: JSON.stringify({ scenes }),
          output: JSON.stringify(animation),
          completedAt: new Date()
        };
        
        if (animatorId) {
          taskData.agentId = animatorId;
        }
        
        const task = await db.hiredAgentTask.create({ data: taskData });
        
        if (animator) {
          await db.hiredAgent.update({
            where: { id: animator.id },
            data: { status: 'idle', tasksCompleted: { increment: 1 } }
          });
        }
        
        return NextResponse.json({
          success: true,
          message: `🎬 ${animatorName} создал план анимации!`,
          animation,
          task,
          virtualAgent: virtualAnimator
        });
      }
      
      // ========================================
      // ПОЛНЫЙ ПАЙПЛАЙН - запустить всё
      // ========================================
      case 'run_full_pipeline': {
        const project = await db.animationProject.findUnique({
          where: { id: projectId }
        });
        
        if (!project) {
          return NextResponse.json({ success: false, error: 'Проект не найден' }, { status: 404 });
        }
        
        const results: any = {
          script: null,
          storyboard: null,
          animation: null,
          agents: {
            writer: null,
            artist: null,
            animator: null
          }
        };
        
        // 1. Сценарист
        let writer = await db.hiredAgent.findFirst({
          where: { role: 'writer', status: 'idle' }
        });
        
        const writerName = writer?.name || 'AI-Сценарист';
        results.agents.writer = writerName;
        
        if (writer) {
          await db.hiredAgent.update({
            where: { id: writer.id },
            data: { status: 'working' }
          });
        }
        
        results.script = await writerAgent(project.title, project.description, project.style || 'disney');
        
        if (writer) {
          await db.hiredAgent.update({
            where: { id: writer.id },
            data: { status: 'idle', tasksCompleted: { increment: 1 } }
          });
        }
        
        // 2. Художник - для первой сцены
        let artist = await db.hiredAgent.findFirst({
          where: { role: 'artist', status: 'idle' }
        });
        
        const artistName = artist?.name || 'AI-Художник';
        results.agents.artist = artistName;
        
        if (results.script?.scenes?.[0]) {
          if (artist) {
            await db.hiredAgent.update({
              where: { id: artist.id },
              data: { status: 'working' }
            });
          }
          
          const firstScene = results.script.scenes[0];
          results.storyboard = await artistAgent(
            firstScene.title,
            firstScene.description,
            project.style || 'disney'
          );
          
          if (artist) {
            await db.hiredAgent.update({
              where: { id: artist.id },
              data: { status: 'idle', tasksCompleted: { increment: 1 } }
            });
          }
        }
        
        // 3. Аниматор
        let animator = await db.hiredAgent.findFirst({
          where: { role: 'animator', status: 'idle' }
        });
        
        const animatorName = animator?.name || 'AI-Аниматор';
        results.agents.animator = animatorName;
        
        if (results.script?.scenes) {
          if (animator) {
            await db.hiredAgent.update({
              where: { id: animator.id },
              data: { status: 'working' }
            });
          }
          
          results.animation = await animatorAgent(results.script.scenes);
          
          if (animator) {
            await db.hiredAgent.update({
              where: { id: animator.id },
              data: { status: 'idle', tasksCompleted: { increment: 1 } }
            });
          }
        }
        
        // Обновляем статус проекта
        await db.animationProject.update({
          where: { id: project.id },
          data: { status: 'in_progress' }
        });
        
        console.log('✅ Полный пайплайн завершён');
        
        return NextResponse.json({
          success: true,
          message: '🚀 Пайплайн выполнен!',
          results,
          project
        });
      }
      
      default:
        return NextResponse.json({ success: false, error: 'Неизвестное действие' }, { status: 400 });
    }
  } catch (error) {
    console.error('❌ Ошибка:', error);
    return NextResponse.json({ 
      success: false, 
      error: String(error) 
    }, { status: 500 });
  }
}
