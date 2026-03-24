import { NextRequest, NextResponse } from 'next/server';
import { DirectorAgent, StudioStatus } from '@/lib/agents/director-agent';

const directorAgent = new DirectorAgent();

// GET /api/director - получить статус студии от директора
export async function GET() {
  try {
    await directorAgent.initialize();

    // Генерируем ежедневный отчёт
    const report = await directorAgent.generateDailyReport(
      [{ status: 'active', count: 1 }],
      [{ role: 'available', count: 5 }]
    );

    return NextResponse.json({
      success: true,
      director: {
        name: 'Директор',
        status: 'active',
        mood: '😊'
      },
      report
    });
  } catch (error) {
    console.error('Director Error:', error);
    return NextResponse.json({
      success: false,
      error: String(error)
    }, { status: 500 });
  }
}

// POST /api/director - запросить решение директора
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    await directorAgent.initialize();

    switch (action) {
      case 'analyze_studio': {
        const status: StudioStatus = {
          activeProjects: data.activeProjects || 0,
          hiredAgents: data.hiredAgents || 0,
          budget: data.budget || 1000,
          reputation: data.reputation || 50,
          pendingTasks: data.pendingTasks || 0
        };

        const analysis = await directorAgent.analyzeStudioStatus(status);

        return NextResponse.json({
          success: true,
          analysis
        });
      }

      case 'decide_hiring': {
        const decision = await directorAgent.decideHiring(
          data.projectNeeds || [],
          data.currentTeam || []
        );

        return NextResponse.json({
          success: true,
          decision
        });
      }

      case 'review_hire_request': {
        const review = await directorAgent.reviewHireRequest({
          name: data.candidateName,
          role: data.candidateRole,
          skills: data.candidateSkills || [],
          experience: data.experience || 'Не указан',
          salary: data.salary || 10
        });

        return NextResponse.json({
          success: true,
          review
        });
      }

      case 'daily_report': {
        const report = await directorAgent.generateDailyReport(
          data.projects || [],
          data.agents || []
        );

        return NextResponse.json({
          success: true,
          report
        });
      }

      default:
        return NextResponse.json({
          success: false,
          error: 'Неизвестное действие'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Director Error:', error);
    return NextResponse.json({
      success: false,
      error: String(error)
    }, { status: 500 });
  }
}
