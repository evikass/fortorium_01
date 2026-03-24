import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Роли и их приоритеты для найма
const ROLE_PRIORITIES: Record<string, { priority: number; reason: string }> = {
  writer: { priority: 1, reason: 'Сценарист нужен для создания сюжетов и диалогов' },
  artist: { priority: 2, reason: 'Художник создаёт визуальный стиль и раскадровки' },
  animator: { priority: 3, reason: 'Аниматор оживляет персонажей и сцены' },
  voice: { priority: 4, reason: 'Озвучка придаёт голос персонажам' },
  editor: { priority: 5, reason: 'Монтажёр собирает финальный ролик' },
  blender: { priority: 6, reason: '3D специалист для Blender-сцен' }
};

// Генерация решения директора
function generateDirectorDecision(
  hiredAgents: any[],
  pendingCandidates: any[],
  projects: any[]
) {
  const decisions: string[] = [];
  const recommendations: string[] = [];
  
  // Анализ команды
  const agentRoles = hiredAgents.map(a => a.role);
  const teamSize = hiredAgents.length;
  
  // Проверяем каких ролей не хватает
  const missingRoles: string[] = [];
  for (const [role, info] of Object.entries(ROLE_PRIORITIES)) {
    if (!agentRoles.includes(role)) {
      missingRoles.push(role);
    }
  }
  
  // Формируем рекомендации
  if (teamSize === 0) {
    decisions.push('🎯 Студия пуста! Нужно нанять первых специалистов.');
    recommendations.push('Рекомендую начать со Сценариста и Художника.');
  } else if (missingRoles.length > 0) {
    const topMissing = missingRoles
      .sort((a, b) => ROLE_PRIORITIES[a].priority - ROLE_PRIORITIES[b].priority)[0];
    decisions.push(`⚠️ В команде не хватает: ${missingRoles.map(r => getRoleName(r)).join(', ')}.`);
    recommendations.push(`Приоритет: нанять ${getRoleName(topMissing)}. ${ROLE_PRIORITIES[topMissing].reason}`);
  } else {
    decisions.push('✅ Команда укомплектована по всем ключевым ролям.');
  }
  
  // Анализ кандидатов
  if (pendingCandidates.length > 0) {
    const topCandidate = pendingCandidates.sort((a, b) => b.rating - a.rating)[0];
    decisions.push(`📋 На рассмотрении ${pendingCandidates.length} кандидатов.`);
    recommendations.push(`Топ-кандидат: ${topCandidate.name} (${getRoleName(topCandidate.role)}) с рейтингом ${topCandidate.rating}.`);
  }
  
  // Анализ проектов
  if (projects.length === 0) {
    decisions.push('📽️ Нет активных проектов. Создайте первый проект!');
  } else {
    const activeProjects = projects.filter(p => p.status !== 'completed');
    decisions.push(`🎬 Активных проектов: ${activeProjects.length}.`);
  }
  
  // Настроение команды
  if (teamSize > 0) {
    const avgMood = Math.round(hiredAgents.reduce((sum, a) => sum + (a.mood || 80), 0) / teamSize);
    const avgEnergy = Math.round(hiredAgents.reduce((sum, a) => sum + (a.energy || 100), 0) / teamSize);
    
    if (avgMood < 50) {
      decisions.push(`😔 Среднее настроение команды: ${avgMood}%. Нужно дать отдых или интересные задачи.`);
    } else if (avgMood >= 80) {
      decisions.push(`😊 Команда в отличном настроении: ${avgMood}%.`);
    }
    
    if (avgEnergy < 50) {
      decisions.push(`🔋 Энергия команды на исходе: ${avgEnergy}%. Рекомендую перерыв.`);
    }
  }
  
  return {
    status: teamSize > 0 ? 'active' : 'hiring',
    decisions,
    recommendations,
    teamAnalysis: {
      totalAgents: teamSize,
      missingRoles: missingRoles.map(r => ({ role: r, name: getRoleName(r) })),
      pendingApprovals: pendingCandidates.length
    },
    nextAction: missingRoles.length > 0 
      ? `hire_${missingRoles[0]}` 
      : pendingCandidates.length > 0 
        ? 'review_candidates' 
        : 'create_project'
  };
}

function getRoleName(role: string): string {
  const names: Record<string, string> = {
    writer: 'Сценарист',
    artist: 'Художник',
    animator: 'Аниматор',
    voice: 'Озвучка',
    editor: 'Монтажёр',
    blender: 'Blender 3D'
  };
  return names[role] || role;
}

// GET - получить статус и решения директора
export async function GET() {
  try {
    // Получаем данные студии
    const hiredAgents = await db.hiredAgent.findMany();
    const projects = await db.animationProject.findMany();
    
    // Получаем кандидатов на утверждение
    const pendingCandidates = await db.agentCandidate.findMany({
      where: { status: 'pending' }
    });
    
    // Генерируем решения директора
    const analysis = generateDirectorDecision(hiredAgents, pendingCandidates, projects);
    
    // Формируем отчёт
    const report = `📊 **Отчёт Директора ФОРТОРИУМ**

${analysis.decisions.join('\n')}

💡 **Рекомендации:**
${analysis.recommendations.map(r => '• ' + r).join('\n')}

🎮 **Следующий шаг:** ${analysis.nextAction === 'review_candidates' ? 'Рассмотреть кандидатов на утверждение' : analysis.nextAction.startsWith('hire_') ? `Нанять ${getRoleName(analysis.nextAction.replace('hire_', ''))}` : 'Создать новый проект'}`;
    
    return NextResponse.json({
      success: true,
      report,
      analysis,
      director: {
        name: 'Директор ФОРТОРИУМ',
        status: analysis.status,
        mood: 'focused'
      }
    });
  } catch (error) {
    console.error('Director error:', error);
    return NextResponse.json({ 
      success: false, 
      error: String(error) 
    }, { status: 500 });
  }
}

// POST - директор выполняет действие
export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json();
    
    switch (action) {
      case 'analyze_project': {
        // Анализ проекта и рекомендация команды
        const { title, description, style } = data;
        
        const teamRecommendation = [
          { role: 'writer', reason: 'Напишет сценарий по вашей идее', priority: 1 },
          { role: 'artist', reason: 'Создаст раскадровку и визуальный стиль', priority: 2 },
          { role: 'animator', reason: 'Оживит сцены', priority: 3 },
          { role: 'voice', reason: 'Озвучит персонажей', priority: 4 },
          { role: 'editor', reason: 'Соберёт финальный ролик', priority: 5 }
        ];
        
        return NextResponse.json({
          success: true,
          message: `Проект "${title}" проанализирован. Рекомендуемая команда:`,
          teamRecommendation,
          estimatedTime: '2-4 недели для короткометражки'
        });
      }
      
      case 'assign_task': {
        // Назначить задачу агенту
        const { agentId, task } = data;
        
        const agent = await db.hiredAgent.findUnique({
          where: { id: agentId }
        });
        
        if (!agent) {
          return NextResponse.json({ success: false, error: 'Агент не найден' }, { status: 404 });
        }
        
        // Обновляем статус агента
        await db.hiredAgent.update({
          where: { id: agentId },
          data: { 
            status: 'working',
            currentTaskId: `task_${Date.now()}`
          }
        });
        
        return NextResponse.json({
          success: true,
          message: `${agent.name} получил задачу: ${task}`,
          agent: { id: agent.id, name: agent.name, status: 'working' }
        });
      }
      
      case 'team_meeting': {
        // Собрание команды - генерация отчёта
        const agents = await db.hiredAgent.findMany();
        
        if (agents.length === 0) {
          return NextResponse.json({
            success: true,
            message: '👥 Собрание не проведено - команда пуста. Нанмите первых специалистов!',
            attendees: []
          });
        }
        
        const meetingReport = agents.map(a => ({
          name: a.name,
          role: getRoleName(a.role),
          status: a.status,
          mood: a.mood,
          energy: a.energy,
          message: a.status === 'working' 
            ? 'Работаю над задачей' 
            : a.status === 'tired' 
              ? 'Нужен отдых' 
              : 'Готов к работе'
        }));
        
        return NextResponse.json({
          success: true,
          message: `👥 Собрание проведено! Присутствовало: ${agents.length} человек.`,
          attendees: meetingReport
        });
      }
      
      default:
        return NextResponse.json({ success: false, error: 'Неизвестное действие' }, { status: 400 });
    }
  } catch (error) {
    console.error('Director action error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
