import { NextRequest, NextResponse } from 'next/server';
import { HRAgent, VacancyRequirement } from '@/lib/agents/hr-agent';

const hrAgent = new HRAgent();

// GET /api/hr - получить список доступных ролей
export async function GET() {
  const availableRoles = [
    { role: 'writer', name: 'Сценарист', description: 'Пишет сценарии и диалоги', emoji: '📝' },
    { role: 'artist', name: 'Художник', description: 'Создаёт визуальный контент', emoji: '🎨' },
    { role: 'animator', name: 'Аниматор', description: 'Оживляет персонажей и сцены', emoji: '🎬' },
    { role: 'voice', name: 'Озвучка', description: 'Озвучивает персонажей', emoji: '🎤' },
    { role: 'editor', name: 'Монтажёр', description: 'Собирает финальный ролик', emoji: '✂️' },
    { role: 'blender', name: 'Blender специалист', description: 'Создаёт 3D контент', emoji: '🧊' },
    { role: 'producer', name: 'Продюсер', description: 'Координирует проект', emoji: '👔' }
  ];

  return NextResponse.json({
    success: true,
    roles: availableRoles
  });
}

// POST /api/hr - найти кандидатов на вакансию
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    await hrAgent.initialize();

    switch (action) {
      case 'find_candidates': {
        const vacancy: VacancyRequirement = {
          role: data.role,
          title: data.title || `Специалист ${data.role}`,
          requiredSkills: data.requiredSkills || [],
          preferredStyle: data.preferredStyle,
          experienceLevel: data.experienceLevel || 'any',
          priority: data.priority || 5
        };

        const count = data.count || 3;
        const candidates = [];

        for (let i = 0; i < count; i++) {
          const candidate = await hrAgent.findCandidate(vacancy);
          candidates.push(candidate);
        }

        return NextResponse.json({
          success: true,
          vacancy,
          candidates: candidates.sort((a, b) => b.rating - a.rating)
        });
      }

      case 'interview': {
        const result = await hrAgent.interviewCandidate(
          data.candidate,
          data.vacancy
        );

        return NextResponse.json({
          success: true,
          interview: result
        });
      }

      case 'assess_fit': {
        const result = await hrAgent.assessProjectFit(
          data.candidate,
          data.projectStyle,
          data.projectNeeds
        );

        return NextResponse.json({
          success: true,
          assessment: result
        });
      }

      default:
        return NextResponse.json({
          success: false,
          error: 'Неизвестное действие'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('HR Error:', error);
    return NextResponse.json({
      success: false,
      error: String(error)
    }, { status: 500 });
  }
}
