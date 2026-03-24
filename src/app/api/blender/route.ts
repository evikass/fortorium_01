import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { BlenderAgent } from '@/lib/agents/blender-agent';

// GET /api/blender - получить список подключений
export async function GET() {
  try {
    const connections = await db.blenderConnection.findMany();
    return NextResponse.json({ success: true, connections });
  } catch (error) {
    console.error('Error fetching Blender connections:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка при получении подключений' },
      { status: 500 }
    );
  }
}

// POST /api/blender - создать/проверить подключение
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, host, port, apiKey, action, script, projectId } = body;

    if (action === 'test') {
      // Проверяем подключение
      const agent = new BlenderAgent();
      agent.setConnection({ host, port: port || 9876, apiKey });

      // Пытаемся подключиться
      const testResult = await agent.sendToBlenderHost(
        'import bpy; print("Connection test successful")',
        'test'
      );

      return NextResponse.json({
        success: testResult.success,
        message: testResult.success 
          ? 'Подключение успешно!' 
          : testResult.error
      });
    }

    if (action === 'create') {
      // Создаём новое подключение
      const connection = await db.blenderConnection.create({
        data: {
          name,
          host,
          port: port || 9876,
          apiKey,
          status: 'disconnected'
        }
      });

      return NextResponse.json({ success: true, connection });
    }

    if (action === 'execute') {
      // Выполняем скрипт на Blender
      const connection = await db.blenderConnection.findFirst({
        where: { status: 'connected' }
      });

      if (!connection) {
        return NextResponse.json(
          { success: false, error: 'Нет активного подключения к Blender' },
          { status: 400 }
        );
      }

      const agent = new BlenderAgent();
      agent.setConnection({
        host: connection.host,
        port: connection.port,
        apiKey: connection.apiKey || undefined
      });

      const result = await agent.sendToBlenderHost(script, 'execute');

      return NextResponse.json(result);
    }

    return NextResponse.json(
      { success: false, error: 'Неизвестное действие' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in Blender API:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка при работе с Blender' },
      { status: 500 }
    );
  }
}

// PUT /api/blender - обновить подключение
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    const connection = await db.blenderConnection.update({
      where: { id },
      data: {
        status,
        lastConnected: status === 'connected' ? new Date() : undefined
      }
    });

    return NextResponse.json({ success: true, connection });
  } catch (error) {
    console.error('Error updating Blender connection:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка при обновлении подключения' },
      { status: 500 }
    );
  }
}

// DELETE /api/blender - удалить подключение
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID подключения обязателен' },
        { status: 400 }
      );
    }

    await db.blenderConnection.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting Blender connection:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка при удалении подключения' },
      { status: 500 }
    );
  }
}
