import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createAgent } from '@/lib/agents';
import fs from 'fs/promises';
import path from 'path';

// GET /api/tasks - получить задачи
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {};
    if (projectId) where.projectId = projectId;
    if (status) where.status = status;

    const tasks = await db.agentTask.findMany({
      where,
      include: {
        agent: true,
        project: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка при получении задач' },
      { status: 500 }
    );
  }
}

// POST /api/tasks - создать и выполнить задачу
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, agentRole, type, input, autoExecute = true } = body;

    // Получаем или создаём агента
    const agent = await db.agent.upsert({
      where: { id: agentRole },
      create: {
        id: agentRole,
        name: getAgentName(agentRole),
        role: agentRole,
        status: 'busy'
      },
      update: { status: 'busy' }
    });

    // Создаём задачу
    const task = await db.agentTask.create({
      data: {
        projectId,
        agentId: agent.id,
        type,
        title: getTaskTitle(type),
        input: JSON.stringify(input),
        status: autoExecute ? 'in_progress' : 'pending'
      }
    });

    // Если нужно выполнить сразу
    if (autoExecute) {
      const result = await executeAgentTask(agentRole, type, input);

      // Обновляем задачу
      await db.agentTask.update({
        where: { id: task.id },
        data: {
          status: result.success ? 'completed' : 'error',
          output: JSON.stringify(result.data),
          error: result.error,
          completedAt: new Date()
        }
      });

      // Если есть артефакты, сохраняем их
      if (result.artifacts) {
        for (const artifact of result.artifacts) {
          if (artifact.type === 'image' && artifact.content) {
            const fileName = `${type}_${Date.now()}.png`;
            const filePath = path.join('/home/z/my-project/download', fileName);
            const buffer = Buffer.from(artifact.content, 'base64');
            await fs.writeFile(filePath, buffer);

            await db.asset.create({
              data: {
                projectId,
                type: 'image',
                name: fileName,
                url: `/download/${fileName}`,
                metadata: JSON.stringify({ taskId: task.id })
              }
            });
          }
        }
      }

      // Добавляем лог
      await db.projectLog.create({
        data: {
          projectId,
          level: result.success ? 'info' : 'error',
          message: result.success 
            ? `Задача "${type}" выполнена успешно`
            : `Ошибка в задаче "${type}": ${result.error}`,
          metadata: JSON.stringify({ taskId: task.id })
        }
      });

      // Обновляем статус агента
      await db.agent.update({
        where: { id: agent.id },
        data: { status: 'idle', lastActiveAt: new Date() }
      });

      return NextResponse.json({
        success: result.success,
        task: {
          ...task,
          status: result.success ? 'completed' : 'error',
          output: result.data,
          error: result.error
        },
        artifacts: result.artifacts
      });
    }

    return NextResponse.json({ success: true, task });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка при создании задачи' },
      { status: 500 }
    );
  }
}

// PUT /api/tasks - выполнить отложенную задачу
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { taskId } = body;

    const task = await db.agentTask.findUnique({
      where: { id: taskId },
      include: { agent: true, project: true }
    });

    if (!task) {
      return NextResponse.json(
        { success: false, error: 'Задача не найдена' },
        { status: 404 }
      );
    }

    if (task.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: `Задача уже ${task.status}` },
        { status: 400 }
      );
    }

    // Обновляем статус
    await db.agentTask.update({
      where: { id: taskId },
      data: { status: 'in_progress', startedAt: new Date() }
    });

    // Выполняем
    const input = task.input ? JSON.parse(task.input) : {};
    const result = await executeAgentTask(task.agent.role, task.type, input);

    // Обновляем результат
    await db.agentTask.update({
      where: { id: taskId },
      data: {
        status: result.success ? 'completed' : 'error',
        output: JSON.stringify(result.data),
        error: result.error,
        completedAt: new Date()
      }
    });

    await db.agent.update({
      where: { id: task.agentId },
      data: { status: 'idle', lastActiveAt: new Date() }
    });

    return NextResponse.json({
      success: result.success,
      result: result
    });
  } catch (error) {
    console.error('Error executing task:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка при выполнении задачи' },
      { status: 500 }
    );
  }
}

async function executeAgentTask(
  agentRole: string, 
  type: string, 
  input: Record<string, unknown>
) {
  const agent = createAgent(agentRole as 'producer' | 'writer' | 'artist' | 'voice' | 'editor' | 'blender');
  await agent.initialize();
  
  return await agent.execute({ type, data: input });
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

function getTaskTitle(type: string): string {
  const titles: Record<string, string> = {
    plan_project: 'Планирование проекта',
    create_tasks: 'Создание задач',
    write_scenario: 'Написание сценария',
    write_dialogue: 'Написание диалогов',
    generate_character: 'Генерация персонажа',
    generate_scene: 'Генерация сцены',
    create_storyboard: 'Создание раскадровки',
    generate_background: 'Генерация фона',
    generate_voice: 'Генерация голоса',
    create_edit_plan: 'План монтажа',
    generate_ffmpeg: 'Генерация FFmpeg команды',
    create_scene: 'Создание 3D сцены',
    render_scene: 'Рендер сцены'
  };
  return titles[type] || type;
}
