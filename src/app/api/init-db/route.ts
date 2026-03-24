import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    await prisma.$connect();
    
    console.log('Creating tables...');

    // Создаём таблицы через raw SQL
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "StudioDirector" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL DEFAULT 'Директор',
        "status" TEXT DEFAULT 'active',
        "budget" REAL DEFAULT 1000.0,
        "reputation" INTEGER DEFAULT 50,
        "currentFocus" TEXT,
        "hiringPriority" TEXT,
        "lastDecisionAt" TIMESTAMP,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "DirectorDecision" (
        "id" TEXT PRIMARY KEY,
        "directorId" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "reasoning" TEXT,
        "impact" TEXT,
        "executed" BOOLEAN DEFAULT false,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "HRManager" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL DEFAULT 'HR Менеджер',
        "status" TEXT DEFAULT 'idle',
        "specialization" TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Vacancy" (
        "id" TEXT PRIMARY KEY,
        "hrManagerId" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "role" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "requiredSkills" TEXT NOT NULL,
        "preferredStyle" TEXT,
        "experienceLevel" TEXT DEFAULT 'any',
        "salary" REAL,
        "priority" INTEGER DEFAULT 5,
        "status" TEXT DEFAULT 'open',
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "closedAt" TIMESTAMP
      )
    `;

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "AgentCandidate" (
        "id" TEXT PRIMARY KEY,
        "vacancyId" TEXT NOT NULL,
        "hrManagerId" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "role" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "skills" TEXT NOT NULL,
        "style" TEXT,
        "experience" TEXT,
        "portfolioUrl" TEXT,
        "rating" INTEGER DEFAULT 0,
        "interviewNotes" TEXT,
        "status" TEXT DEFAULT 'pending',
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "HireRequest" (
        "id" TEXT PRIMARY KEY,
        "vacancyId" TEXT NOT NULL UNIQUE,
        "hrManagerId" TEXT NOT NULL,
        "candidateName" TEXT NOT NULL,
        "candidateRole" TEXT NOT NULL,
        "candidateSkills" TEXT NOT NULL,
        "status" TEXT DEFAULT 'pending',
        "approvedBy" TEXT,
        "rejectionReason" TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "processedAt" TIMESTAMP
      )
    `;

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "AgentType" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "role" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "baseSkills" TEXT NOT NULL,
        "specializations" TEXT NOT NULL,
        "baseCost" REAL DEFAULT 10.0,
        "rarity" TEXT DEFAULT 'common',
        "systemPrompt" TEXT NOT NULL,
        "avatarEmoji" TEXT DEFAULT '🤖',
        "isAvailable" BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "HiredAgent" (
        "id" TEXT PRIMARY KEY,
        "agentTypeId" TEXT,
        "name" TEXT NOT NULL,
        "role" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "avatarEmoji" TEXT DEFAULT '🤖',
        "skills" TEXT NOT NULL,
        "specializations" TEXT NOT NULL,
        "preferredStyle" TEXT,
        "level" INTEGER DEFAULT 1,
        "experience" INTEGER DEFAULT 0,
        "quality" INTEGER DEFAULT 50,
        "speed" INTEGER DEFAULT 50,
        "status" TEXT DEFAULT 'idle',
        "mood" INTEGER DEFAULT 80,
        "energy" INTEGER DEFAULT 100,
        "currentTaskId" TEXT,
        "tasksCompleted" INTEGER DEFAULT 0,
        "totalRating" REAL DEFAULT 0.0,
        "salary" REAL DEFAULT 10.0,
        "hiredAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "lastActiveAt" TIMESTAMP
      )
    `;

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "HiredAgentTask" (
        "id" TEXT PRIMARY KEY,
        "projectId" TEXT NOT NULL,
        "agentId" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "input" TEXT,
        "output" TEXT,
        "status" TEXT DEFAULT 'pending',
        "error" TEXT,
        "priority" INTEGER DEFAULT 5,
        "qualityScore" INTEGER,
        "reviewNotes" TEXT,
        "startedAt" TIMESTAMP,
        "completedAt" TIMESTAMP,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "AgentPerformance" (
        "id" TEXT PRIMARY KEY,
        "agentId" TEXT NOT NULL,
        "date" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "tasksCompleted" INTEGER DEFAULT 0,
        "averageQuality" REAL DEFAULT 0.0,
        "avgCompletionTime" REAL,
        "notes" TEXT
      )
    `;

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
        "assignedAgents" TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Добавляем недостающие колонки если их нет (PostgreSQL)
    try { await prisma.$executeRaw`ALTER TABLE "AnimationProject" ADD COLUMN "assignedAgents" TEXT`; } catch (e) { /* колонка уже существует */ }
    try { await prisma.$executeRaw`ALTER TABLE "AnimationProject" ADD COLUMN "useBlender" BOOLEAN DEFAULT false`; } catch (e) { /* колонка уже существует */ }
    try { await prisma.$executeRaw`ALTER TABLE "AnimationProject" ADD COLUMN "blenderScenePath" TEXT`; } catch (e) { /* колонка уже существует */ }
    try { await prisma.$executeRaw`ALTER TABLE "AnimationProject" ADD COLUMN "finalVideoUrl" TEXT`; } catch (e) { /* колонка уже существует */ }
    try { await prisma.$executeRaw`ALTER TABLE "AnimationProject" ADD COLUMN "thumbnailUrl" TEXT`; } catch (e) { /* колонка уже существует */ }

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
        "assignedAgentId" TEXT,
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
        "createdById" TEXT,
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

    // Создаём директора студии если его нет
    await prisma.$executeRaw`
      INSERT INTO "StudioDirector" ("id", "name", "status", "budget", "reputation", "createdAt")
      SELECT 'director_1', 'Директор Студии', 'active', 1000.0, 50, CURRENT_TIMESTAMP
      WHERE NOT EXISTS (SELECT 1 FROM "StudioDirector" WHERE "id" = 'director_1')
    `;

    // Создаём HR менеджера если его нет
    await prisma.$executeRaw`
      INSERT INTO "HRManager" ("id", "name", "status", "createdAt")
      SELECT 'hr_1', 'HR Менеджер', 'idle', CURRENT_TIMESTAMP
      WHERE NOT EXISTS (SELECT 1 FROM "HRManager" WHERE "id" = 'hr_1')
    `;

    // Создаём типы агентов
    const agentTypes = [
      { id: 'type_writer_comedy', name: 'Сценарист комедий', role: 'writer', description: 'Специализируется на юморе и комедийных ситуациях', skills: '["комедия","юмор","диалоги","ситуативный юмор"]', specializations: '["комедия","пародия","ситком"]', prompt: 'Ты сценарист комедий. Твоя специализация - создавать смешные диалоги и ситуации.' },
      { id: 'type_writer_drama', name: 'Сценарист драмы', role: 'writer', description: 'Специализируется на эмоциональных и глубоких историях', skills: '["драма","эмоции","персонажи","сюжет"]', specializations: '["драма","трагедия","психология"]', prompt: 'Ты сценарист драмы. Создаёшь глубокие эмоциональные истории.' },
      { id: 'type_artist_2d', name: 'Художник 2D', role: 'artist', description: 'Специализируется на 2D иллюстрациях', skills: '["2D","иллюстрация","раскадровка","персонажи"]', specializations: '["2D","раскадровка","концепт-арт"]', prompt: 'Ты 2D художник. Создаёшь стилизованные иллюстрации.' },
      { id: 'type_artist_anime', name: 'Художник аниме', role: 'artist', description: 'Специализируется на аниме стиле', skills: '["аниме","манга","персонажи","стилизация"]', specializations: '["аниме","манга","японский стиль"]', prompt: 'Ты художник в стиле аниме. Создаёшь персонажей и сцены в японском стиле.' },
      { id: 'type_animator_char', name: 'Аниматор персонажей', role: 'animator', description: 'Оживляет персонажей', skills: '["персонажи","движение","эмоции","липсинк"]', specializations: '["персонажи","лицевая анимация","жесты"]', prompt: 'Ты аниматор персонажей. Создаёшь живые движения и эмоции.' },
      { id: 'type_voice_male', name: 'Мужской голос', role: 'voice', description: 'Озвучивает мужских персонажей', skills: '["мужской голос","персонажи","эмоции","диалоги"]', specializations: '["мужской голос","закадровый голос","персонажи"]', prompt: 'Ты актёр озвучки с мужским голосом.' },
      { id: 'type_voice_female', name: 'Женский голос', role: 'voice', description: 'Озвучивает женских персонажей', skills: '["женский голос","персонажи","эмоции","диалоги"]', specializations: '["женский голос","детский голос","персонажи"]', prompt: 'Ты актёр озвучки с женским голосом.' },
      { id: 'type_editor_pro', name: 'Монтажёр-профессионал', role: 'editor', description: 'Профессиональный видеомонтаж', skills: '["монтаж","эффекты","звук","цветокоррекция"]', specializations: '["монтаж","эффекты","сборка"]', prompt: 'Ты профессиональный монтажёр.' },
      { id: 'type_blender_general', name: 'Blender универсал', role: 'blender', description: 'Универсальный специалист Blender', skills: '["моделирование","текстуры","освещение","рендер"]', specializations: '["3D","моделирование","рендер"]', prompt: 'Ты специалист по Blender. Создаёшь 3D контент.' }
    ];

    for (const type of agentTypes) {
      await prisma.$executeRaw`
        INSERT INTO "AgentType" ("id", "name", "role", "description", "baseSkills", "specializations", "baseCost", "rarity", "systemPrompt", "avatarEmoji", "isAvailable", "createdAt")
        SELECT ${type.id}, ${type.name}, ${type.role}, ${type.description}, ${type.skills}, ${type.specializations}, 10.0, 'common', ${type.prompt}, '🤖', true, CURRENT_TIMESTAMP
        WHERE NOT EXISTS (SELECT 1 FROM "AgentType" WHERE "id" = ${type.id})
      `;
    }

    return NextResponse.json({ 
      success: true, 
      message: 'База данных инициализирована',
      tables: [
        'StudioDirector', 'DirectorDecision', 'HRManager', 'Vacancy', 
        'AgentCandidate', 'HireRequest', 'AgentType', 'HiredAgent',
        'HiredAgentTask', 'AgentPerformance', 'AnimationProject', 
        'Scene', 'Asset', 'ProjectLog', 'BlenderConnection', 'CharacterTemplate'
      ],
      initialized: {
        director: true,
        hrManager: true,
        agentTypes: agentTypes.length
      }
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
