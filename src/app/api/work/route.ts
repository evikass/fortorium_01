import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { db } from '@/lib/db';

// Инициализация AI
async function getAI() {
  return await ZAI.create();
}

// ============================================
// АГЕНТ-СЦЕНАРИСТ
// ============================================
async function writerAgent(projectTitle: string, projectDescription: string, style: string) {
  const zai = await getAI();
  
  const prompt = `Ты профессиональный сценарист анимации. Создай короткий сценарий для мультфильма.

Название: ${projectTitle}
Описание идеи: ${projectDescription}
Стиль: ${style}

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

Сделай сценарий интересным, с эмоциями и динамикой. 3-5 сцен.`;

  const response = await zai.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.8
  });

  const content = response.choices[0]?.message?.content || '';
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  
  // Fallback
  return {
    title: projectTitle,
    logline: projectDescription,
    characters: [{ name: "Главный герой", description: "Протагонист истории", traits: ["смелый", "добрый"] }],
    scenes: [
      { number: 1, title: "Начало", location: "Неизвестно", description: projectDescription, dialogue: [], action: "История начинается", duration: 10 }
    ],
    totalDuration: 30,
    mood: "приключенческий"
  };
}

// ============================================
// АГЕНТ-ХУДОЖНИК (генерация изображений)
// ============================================
async function artistAgent(sceneTitle: string, sceneDescription: string, style: string) {
  const zai = await getAI();
  
  const stylePrompts: Record<string, string> = {
    ghibli: 'Studio Ghibli style, Miyazaki, watercolor, magical, soft colors, anime',
    disney: 'Disney 2D animation style, classic animation, vibrant colors, expressive',
    pixar: 'Pixar 3D style, modern 3D animation, cinematic lighting, detailed',
    anime: 'Anime style, Japanese animation, bright colors, stylized',
    cartoon: 'Modern cartoon style, bright and colorful, fun, playful'
  };
  
  const stylePrompt = stylePrompts[style] || stylePrompts.disney;
  const imagePrompt = `${stylePrompt}, ${sceneDescription}, scene from animation, ${sceneTitle}, high quality, detailed`;
  
  try {
    const imageResponse = await zai.images.generations.create({
      prompt: imagePrompt,
      size: '1024x1024'
    });
    
    return {
      success: true,
      imageUrl: `data:image/png;base64,${imageResponse.data[0].base64}`,
      prompt: imagePrompt
    };
  } catch (error) {
    console.error('Image generation error:', error);
    return {
      success: false,
      error: 'Не удалось сгенерировать изображение',
      prompt: imagePrompt
    };
  }
}

// ============================================
// АГЕНТ-АНИМАТОР
// ============================================
async function animatorAgent(scenes: any[]) {
  const zai = await getAI();
  
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
}`;

  const response = await zai.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7
  });

  const content = response.choices[0]?.message?.content || '';
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  
  return { scenes: [], totalDuration: 30, animationStyle: "Базовая анимация" };
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
        
        // Найти сценариста
        const writer = await db.hiredAgent.findFirst({
          where: { role: 'writer', status: 'idle' }
        });
        
        if (!writer) {
          return NextResponse.json({ success: false, error: 'Нет доступного сценариста' }, { status: 400 });
        }
        
        // Обновляем статус агента
        await db.hiredAgent.update({
          where: { id: writer.id },
          data: { status: 'working' }
        });
        
        // Генерируем сценарий
        const script = await writerAgent(
          project.title,
          project.description,
          project.style || 'disney'
        );
        
        // Создаём задачу
        const task = await db.hiredAgentTask.create({
          data: {
            projectId: project.id,
            agentId: writer.id,
            type: 'script',
            title: `Сценарий: ${project.title}`,
            description: 'Написание сценария',
            status: 'completed',
            input: JSON.stringify({ title: project.title, description: project.description }),
            output: JSON.stringify(script),
            completedAt: new Date()
          }
        });
        
        // Возвращаем агента в idle
        await db.hiredAgent.update({
          where: { id: writer.id },
          data: { status: 'idle', tasksCompleted: { increment: 1 } }
        });
        
        return NextResponse.json({
          success: true,
          message: `✍️ ${writer.name} написал сценарий!`,
          script,
          task
        });
      }
      
      // ========================================
      // ХУДОЖНИК - создать раскадровку
      // ========================================
      case 'create_storyboard': {
        const { sceneTitle, sceneDescription, style } = data;
        
        const artist = await db.hiredAgent.findFirst({
          where: { role: 'artist', status: 'idle' }
        });
        
        if (!artist) {
          return NextResponse.json({ success: false, error: 'Нет доступного художника' }, { status: 400 });
        }
        
        await db.hiredAgent.update({
          where: { id: artist.id },
          data: { status: 'working' }
        });
        
        // Генерируем изображение
        const result = await artistAgent(sceneTitle, sceneDescription, style || 'disney');
        
        const task = await db.hiredAgentTask.create({
          data: {
            projectId: projectId || 'default',
            agentId: artist.id,
            type: 'storyboard',
            title: `Раскадровка: ${sceneTitle}`,
            description: sceneDescription,
            status: 'completed',
            input: JSON.stringify({ sceneTitle, sceneDescription, style }),
            output: JSON.stringify(result),
            completedAt: new Date()
          }
        });
        
        await db.hiredAgent.update({
          where: { id: artist.id },
          data: { status: 'idle', tasksCompleted: { increment: 1 } }
        });
        
        return NextResponse.json({
          success: true,
          message: `🎨 ${artist.name} создал раскадровку!`,
          image: result,
          task
        });
      }
      
      // ========================================
      // АНИМАТОР - описать анимацию
      // ========================================
      case 'plan_animation': {
        const { scenes } = data;
        
        const animator = await db.hiredAgent.findFirst({
          where: { role: 'animator', status: 'idle' }
        });
        
        if (!animator) {
          return NextResponse.json({ success: false, error: 'Нет доступного аниматора' }, { status: 400 });
        }
        
        await db.hiredAgent.update({
          where: { id: animator.id },
          data: { status: 'working' }
        });
        
        const animation = await animatorAgent(scenes);
        
        const task = await db.hiredAgentTask.create({
          data: {
            projectId: projectId || 'default',
            agentId: animator.id,
            type: 'animation',
            title: 'План анимации',
            description: 'Описание анимационных сцен',
            status: 'completed',
            input: JSON.stringify({ scenes }),
            output: JSON.stringify(animation),
            completedAt: new Date()
          }
        });
        
        await db.hiredAgent.update({
          where: { id: animator.id },
          data: { status: 'idle', tasksCompleted: { increment: 1 } }
        });
        
        return NextResponse.json({
          success: true,
          message: `🎬 ${animator.name} создал план анимации!`,
          animation,
          task
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
        
        const results = {
          script: null,
          storyboard: null,
          animation: null
        };
        
        // 1. Сценарист
        const writer = await db.hiredAgent.findFirst({
          where: { role: 'writer', status: 'idle' }
        });
        
        if (writer) {
          await db.hiredAgent.update({
            where: { id: writer.id },
            data: { status: 'working' }
          });
          
          results.script = await writerAgent(project.title, project.description, project.style || 'disney');
          
          await db.hiredAgent.update({
            where: { id: writer.id },
            data: { status: 'idle', tasksCompleted: { increment: 1 } }
          });
        }
        
        // 2. Художник - для первой сцены
        const artist = await db.hiredAgent.findFirst({
          where: { role: 'artist', status: 'idle' }
        });
        
        if (artist && results.script?.scenes?.[0]) {
          await db.hiredAgent.update({
            where: { id: artist.id },
            data: { status: 'working' }
          });
          
          const firstScene = results.script.scenes[0];
          results.storyboard = await artistAgent(
            firstScene.title,
            firstScene.description,
            project.style || 'disney'
          );
          
          await db.hiredAgent.update({
            where: { id: artist.id },
            data: { status: 'idle', tasksCompleted: { increment: 1 } }
          });
        }
        
        // 3. Аниматор
        const animator = await db.hiredAgent.findFirst({
          where: { role: 'animator', status: 'idle' }
        });
        
        if (animator && results.script?.scenes) {
          await db.hiredAgent.update({
            where: { id: animator.id },
            data: { status: 'working' }
          });
          
          results.animation = await animatorAgent(results.script.scenes);
          
          await db.hiredAgent.update({
            where: { id: animator.id },
            data: { status: 'idle', tasksCompleted: { increment: 1 } }
          });
        }
        
        // Обновляем статус проекта
        await db.animationProject.update({
          where: { id: project.id },
          data: { status: 'in_progress' }
        });
        
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
    console.error('Work error:', error);
    return NextResponse.json({ 
      success: false, 
      error: String(error) 
    }, { status: 500 });
  }
}
