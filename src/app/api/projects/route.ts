import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/projects - получить все проекты
export async function GET() {
  try {
    const projects = await db.animationProject.findMany({
      include: {
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

    if (!title || !description) {
      return NextResponse.json(
        { success: false, error: 'Укажите название и описание' },
        { status: 400 }
      );
    }

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

    // Добавляем лог создания
    await db.projectLog.create({
      data: {
        projectId: project.id,
        level: 'info',
        message: `Проект "${title}" создан`
      }
    });

    return NextResponse.json({ 
      success: true, 
      project 
    });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка при создании проекта: ' + (error instanceof Error ? error.message : 'неизвестная ошибка') },
      { status: 500 }
    );
  }
}
