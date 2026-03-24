import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Проверяем подключение к БД
    await prisma.$connect();
    
    // Пытаемся создать таблицы через raw SQL
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "AnimationProject" (
        "id" TEXT PRIMARY KEY,
        "title" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "style" TEXT,
        "duration" INTEGER DEFAULT 30,
        "status" TEXT DEFAULT 'draft',
        "finalVideoUrl" TEXT,
        "thumbnailUrl" TEXT,
        "blenderScenePath" TEXT,
        "useBlender" BOOLEAN DEFAULT false,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Agent" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "role" TEXT NOT NULL,
        "description" TEXT,
        "status" TEXT DEFAULT 'idle',
        "config" TEXT,
        "lastActiveAt" TIMESTAMP,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "AgentTask" (
        "id" TEXT PRIMARY KEY,
        "projectId" TEXT NOT NULL,
        "agentId" TEXT NOT NULL,
        "parentTaskId" TEXT,
        "type" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "input" TEXT,
        "output" TEXT,
        "status" TEXT DEFAULT 'pending',
        "error" TEXT,
        "priority" INTEGER DEFAULT 5,
        "startedAt" TIMESTAMP,
        "completedAt" TIMESTAMP,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Scene" (
        "id" TEXT PRIMARY KEY,
        "projectId" TEXT NOT NULL,
        "order" INTEGER NOT NULL,
        "title" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "duration" REAL DEFAULT 5.0,
        "imageUrl" TEXT,
        "videoUrl" TEXT,
        "audioUrl" TEXT,
        "blenderFile" TEXT,
        "cameraPath" TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Asset" (
        "id" TEXT PRIMARY KEY,
        "projectId" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "url" TEXT NOT NULL,
        "metadata" TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "ProjectLog" (
        "id" TEXT PRIMARY KEY,
        "projectId" TEXT NOT NULL,
        "agentId" TEXT,
        "level" TEXT NOT NULL,
        "message" TEXT NOT NULL,
        "metadata" TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "BlenderConnection" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "host" TEXT NOT NULL,
        "port" INTEGER DEFAULT 9876,
        "apiKey" TEXT,
        "status" TEXT DEFAULT 'disconnected',
        "lastConnected" TIMESTAMP,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "CharacterTemplate" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "stylePrompt" TEXT NOT NULL,
        "referenceImages" TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Создаём базовых агентов если их нет
    const agents = [
      { id: 'producer', name: 'Продюсер', role: 'producer' },
      { id: 'writer', name: 'Сценарист', role: 'writer' },
      { id: 'artist', name: 'Художник', role: 'artist' },
      { id: 'animator', name: 'Аниматор', role: 'animator' },
      { id: 'voice', name: 'Озвучка', role: 'voice' },
      { id: 'editor', name: 'Монтажёр', role: 'editor' },
      { id: 'blender', name: 'Blender Оператор', role: 'blender' }
    ];

    for (const agent of agents) {
      await prisma.$executeRaw`
        INSERT INTO "Agent" ("id", "name", "role", "status", "createdAt")
        SELECT ${agent.id}, ${agent.name}, ${agent.role}, 'idle', CURRENT_TIMESTAMP
        WHERE NOT EXISTS (SELECT 1 FROM "Agent" WHERE "id" = ${agent.id})
      `;
    }

    return NextResponse.json({ 
      success: true, 
      message: 'База данных инициализирована',
      tables: ['AnimationProject', 'Agent', 'AgentTask', 'Scene', 'Asset', 'ProjectLog', 'BlenderConnection', 'CharacterTemplate']
    });
  } catch (error) {
    console.error('DB Init Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: String(error) 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
