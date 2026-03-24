import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createAgent } from '@/lib/agents';

// GET /api/projects - получить все проекты
export async function GET() {
  try {
    const projects = await db.animationProject.findMany({
      include: {
        tasks: {
          include: {
            agent: true
          }
        },
        scenes: {
          orderBy: { order: 'asc' }
        },
        assets: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка при получении проектов' },
      { status: 500 }
    );
  }
}

// POST /api/projects - создать новый проект
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, style, duration, useBlender } = body;

    // Создаём проект
    const project = await db.animationProject.create({
      data: {
        title,
        description,
        style: style || 'disney',
        duration: duration || 30,
        useBlender: useBlender || false,
        status: 'draft'
      }
    });

    // Создаём агентов для проекта
    const agentRoles = ['producer', 'writer', 'artist', 'voice', 'editor'] as const;
    
    for (const role of agentRoles) {
      await db.agent.upsert({
        where: { id: role },
        create: {
          id: role,
          name: getAgentName(role),
          role: role,
          status: 'idle'
        },
        update: { status: 'idle' }
      });
    }

    // Если нужен Blender, создаём соответствующего агента
    if (useBlender) {
      await db.agent.upsert({
        where: { id: 'blender' },
        create: {
          id: 'blender',
          name: 'Blender Оператор',
          role: 'blender',
          status: 'idle'
        },
        update: { status: 'idle' }
      });
    }

    // Запускаем агента-продюсера для планирования
    const producer = createAgent('producer');
    await producer.initialize();
    
    const planResult = await producer.execute({
      type: 'plan_project',
      data: {
        title,
        description,
        style: style || 'disney',
        duration: duration || 30
      }
    });

    // Если планирование успешно, создаём сцены
    if (planResult.success && planResult.data?.plan?.scenes) {
      for (const scene of planResult.data.plan.scenes) {
        await db.scene.create({
          data: {
            projectId: project.id,
            order: scene.order,
            title: scene.title,
            description: scene.description,
            duration: scene.duration
          }
        });
      }

      // Добавляем лог
      await db.projectLog.create({
        data: {
          projectId: project.id,
          level: 'info',
          message: 'Проект успешно спланирован',
          metadata: JSON.stringify({ scenesCount: planResult.data.plan.scenes.length })
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      project,
      plan: planResult.data?.plan
    });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка при создании проекта' },
      { status: 500 }
    );
  }
}

function getAgentName(role: string): string {
  const names: Record<string, string> = {
    producer: 'Продюсер',
    writer: 'Сценарист',
    artist: 'Художник',
    voice: 'Озвучка',
    editor: 'Монтажёр',
    blender: 'Blender Оператор'
  };
  return names[role] || role;
}
