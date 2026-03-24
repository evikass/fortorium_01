import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/agents/hire - получить список нанятых агентов
export async function GET() {
  try {
    const agents = await db.hiredAgent.findMany({
      include: {
        tasks: {
          where: { status: 'completed' },
          take: 5
        }
      },
      orderBy: { hiredAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      agents
    });
  } catch (error) {
    console.error('Error fetching hired agents:', error);
    return NextResponse.json({
      success: false,
      error: 'Ошибка при получении списка агентов'
    }, { status: 500 });
  }
}

// POST /api/agents/hire - нанять нового агента
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      role,
      description,
      skills,
      specializations,
      preferredStyle,
      salary,
      avatarEmoji
    } = body;

    // Создаём нанятого агента
    const agent = await db.hiredAgent.create({
      data: {
        name,
        role,
        description,
        skills: JSON.stringify(skills || []),
        specializations: JSON.stringify(specializations || []),
        preferredStyle,
        salary: salary || 10,
        avatarEmoji: avatarEmoji || '🤖',
        status: 'idle',
        mood: 80,
        energy: 100
      }
    });

    // Логируем наём
    await db.projectLog.create({
      data: {
        projectId: 'studio',
        level: 'info',
        message: `Нанят новый сотрудник: ${name} (${role})`,
        metadata: JSON.stringify({ agentId: agent.id, role, salary })
      }
    });

    return NextResponse.json({
      success: true,
      agent: {
        ...agent,
        skills: JSON.parse(agent.skills),
        specializations: JSON.parse(agent.specializations)
      }
    });
  } catch (error) {
    console.error('Error hiring agent:', error);
    return NextResponse.json({
      success: false,
      error: 'Ошибка при найме агента'
    }, { status: 500 });
  }
}

// PUT /api/agents/hire - обновить статус агента
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, status, mood, energy } = body;

    const agent = await db.hiredAgent.update({
      where: { id: agentId },
      data: {
        ...(status && { status }),
        ...(mood !== undefined && { mood }),
        ...(energy !== undefined && { energy }),
        lastActiveAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      agent
    });
  } catch (error) {
    console.error('Error updating agent:', error);
    return NextResponse.json({
      success: false,
      error: 'Ошибка при обновлении агента'
    }, { status: 500 });
  }
}

// DELETE /api/agents/hire - уволить агента
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');

    if (!agentId) {
      return NextResponse.json({
        success: false,
        error: 'Требуется agentId'
      }, { status: 400 });
    }

    // Получаем информацию об агенте перед удалением
    const agent = await db.hiredAgent.findUnique({
      where: { id: agentId }
    });

    if (!agent) {
      return NextResponse.json({
        success: false,
        error: 'Агент не найден'
      }, { status: 404 });
    }

    // Удаляем агента
    await db.hiredAgent.delete({
      where: { id: agentId }
    });

    // Логируем увольнение
    await db.projectLog.create({
      data: {
        projectId: 'studio',
        level: 'warning',
        message: `Агент уволен: ${agent.name} (${agent.role})`,
        metadata: JSON.stringify({ agentId, role: agent.role })
      }
    });

    return NextResponse.json({
      success: true,
      message: `${agent.name} уволен из студии`
    });
  } catch (error) {
    console.error('Error firing agent:', error);
    return NextResponse.json({
      success: false,
      error: 'Ошибка при увольнении агента'
    }, { status: 500 });
  }
}
