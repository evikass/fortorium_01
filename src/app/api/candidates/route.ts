import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// База эмодзи для разных типов агентов
const AGENT_AVATARS: Record<string, string[]> = {
  writer: ['📝', '✍️', '📜', '📖', '✒️'],
  artist: ['🎨', '🖌️', '🖼️', '🎭', '🌈'],
  animator: ['🎬', '🎞️', '🎥', '📽️', '🎦'],
  voice: ['🎤', '🎙️', '🎵', '🎶', '🔊'],
  editor: ['✂️', '🎞️', '🎬', '💻', '🖥️'],
  blender: ['🧊', '🖥️', '💎', '🔮', '🌀']
};

// Шаблоны имён
const AGENT_NAMES: Record<string, { first: string[], last: string[] }> = {
  writer: { first: ['Александр', 'Мария', 'Дмитрий', 'Анна', 'Иван'], last: ['Словесник', 'Перов', 'Страницева', 'Романова', 'Текстов'] },
  artist: { first: ['Виктор', 'Ольга', 'Артём', 'София', 'Максим'], last: ['Кистев', 'Красокина', 'Рисунков', 'Палитров', 'Цветов'] },
  animator: { first: ['Никита', 'Алиса', 'Кирилл', 'Вера', 'Арсений'], last: ['Движенин', 'Кадров', 'Мультов', 'Аниматов', 'Роликов'] },
  voice: { first: ['Глеб', 'Валерия', 'Роман', 'Кристина', 'Олег'], last: ['Голосов', 'Звуков', 'Тонов', 'Речев', 'Мелодиев'] },
  editor: { first: ['Павел', 'Наталья', 'Сергей', 'Екатерина', 'Андрей'], last: ['Монтажов', 'Кадров', 'Режиссёров', 'Сборов', 'Сценычев'] },
  blender: { first: ['Денис', 'Алина', 'Георгий', 'Варвара', 'Станислав'], last: ['Рендеров', 'Моделев', '3Деев', 'Полигональев', 'Шейдеров'] }
};

const ROLE_SKILLS: Record<string, string[]> = {
  writer: ['сюжет', 'диалоги', 'персонажи', 'драматургия', 'юмор', 'структура'],
  artist: ['рисование', 'композиция', 'цвет', 'персонажи', 'фоны', 'стилизация'],
  animator: ['движение', 'тайминг', 'сцены', 'эффекты', 'липсинк', 'камера'],
  voice: ['голос', 'эмоции', 'персонажи', 'интонация', 'диалоги', 'акценты'],
  editor: ['монтаж', 'звук', 'эффекты', 'цветокоррекция', 'сборка', 'переходы'],
  blender: ['моделирование', 'текстуры', 'освещение', 'рендер', 'анимация', 'ноды']
};

const ROLE_SPECS: Record<string, string[]> = {
  writer: ['комедия', 'драма', 'приключения', 'фэнтези', 'детские'],
  artist: ['2D', '3D', 'персонажи', 'фоны', 'концепт-арт'],
  animator: ['персонажи', 'эффекты', 'окружение', 'липсинк'],
  voice: ['мужской голос', 'женский голос', 'детский', 'закадровый'],
  editor: ['монтаж', 'цветокоррекция', 'звук', 'эффекты'],
  blender: ['моделирование', 'текстуры', 'освещение', 'рендер']
};

function generateCandidate(role: string) {
  const names = AGENT_NAMES[role] || AGENT_NAMES.writer;
  const avatars = AGENT_AVATARS[role] || ['🤖'];
  const skills = ROLE_SKILLS[role] || [];
  const specs = ROLE_SPECS[role] || [];

  const firstName = names.first[Math.floor(Math.random() * names.first.length)];
  const lastName = names.last[Math.floor(Math.random() * names.last.length)];

  return {
    name: `${firstName} ${lastName}`,
    role,
    avatarEmoji: avatars[Math.floor(Math.random() * avatars.length)],
    skills: skills.sort(() => Math.random() - 0.5).slice(0, 3),
    specializations: specs.sort(() => Math.random() - 0.5).slice(0, 2),
    rating: 65 + Math.floor(Math.random() * 25),
    salary: 10 + Math.floor(Math.random() * 30),
    experience: ['2 года опыта', '3 года опыта', '5 лет опыта', '7 лет опыта'][Math.floor(Math.random() * 4)],
    description: [
      'Талантливый специалист с отличным портфолио',
      'Опытный профессионал с нестандартным подходом',
      'Креативный специалист с хорошими рекомендациями',
      'Универсальный профессионал с разносторонним опытом'
    ][Math.floor(Math.random() * 4)]
  };
}

// GET - получить кандидатов на утверждение
export async function GET() {
  try {
    // Проверяем pending кандидатов
    let pending = await db.agentCandidate.findMany({
      where: { status: 'pending' },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Если мало кандидатов - HR находит новых
    if (pending.length < 3) {
      // Создаём HR если нет
      let hr = await db.hRManager.findFirst();
      if (!hr) {
        hr = await db.hRManager.create({
          data: { name: 'HR Менеджер', status: 'searching' }
        });
      }

      // Создаём вакансию если нет
      let vacancy = await db.vacancy.findFirst();
      if (!vacancy) {
        vacancy = await db.vacancy.create({
          data: {
            hrManagerId: hr.id,
            title: 'Специалист',
            role: 'general',
            description: 'Поиск талантов',
            requiredSkills: '[]',
            status: 'open'
          }
        });
      }

      // Генерируем новых кандидатов
      const roles = ['writer', 'artist', 'animator', 'voice', 'editor', 'blender'];
      const needed = 5 - pending.length;

      for (let i = 0; i < needed; i++) {
        const role = roles[Math.floor(Math.random() * roles.length)];
        const c = generateCandidate(role);

        await db.agentCandidate.create({
          data: {
            vacancyId: vacancy.id,
            hrManagerId: hr.id,
            name: c.name,
            role: c.role,
            description: c.description,
            skills: JSON.stringify(c.skills),
            specializations: JSON.stringify(c.specializations),
            experience: c.experience,
            rating: c.rating,
            status: 'pending'
          }
        });
      }

      // Получаем обновлённый список
      pending = await db.agentCandidate.findMany({
        where: { status: 'pending' },
        orderBy: { createdAt: 'desc' },
        take: 10
      });
    }

    const candidates = pending.map(c => ({
      id: c.id,
      name: c.name,
      role: c.role,
      description: c.description,
      avatarEmoji: AGENT_AVATARS[c.role]?.[0] || '🤖',
      skills: JSON.parse(c.skills || '[]'),
      specializations: JSON.parse(c.specializations || '[]'),
      rating: c.rating,
      salary: 10 + Math.floor(Math.random() * 20),
      experience: c.experience || 'Опытный специалист'
    }));

    return NextResponse.json({
      success: true,
      candidates,
      message: pending.length < 3 ? 'HR нашёл новых кандидатов!' : 'Кандидаты на утверждение'
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// POST - утвердить или отклонить
export async function POST(request: NextRequest) {
  try {
    const { candidateId, action } = await request.json();

    const candidate = await db.agentCandidate.findUnique({
      where: { id: candidateId }
    });

    if (!candidate) {
      return NextResponse.json({ success: false, error: 'Кандидат не найден' }, { status: 404 });
    }

    if (action === 'approve') {
      // Нанимаем
      const hired = await db.hiredAgent.create({
        data: {
          name: candidate.name,
          role: candidate.role,
          description: candidate.description,
          skills: candidate.skills,
          specializations: candidate.specializations || '[]',
          salary: 15 + Math.floor(Math.random() * 20),
          status: 'idle',
          mood: 80 + Math.floor(Math.random() * 20),
          energy: 90 + Math.floor(Math.random() * 10),
          level: 1,
          quality: 50 + Math.floor(Math.random() * 30),
          speed: 50 + Math.floor(Math.random() * 30)
        }
      });

      await db.agentCandidate.update({
        where: { id: candidateId },
        data: { status: 'accepted' }
      });

      return NextResponse.json({
        success: true,
        message: `✅ ${candidate.name} принят в команду!`,
        agent: {
          id: hired.id,
          name: hired.name,
          role: hired.role,
          skills: JSON.parse(hired.skills || '[]'),
          status: hired.status,
          mood: hired.mood,
          energy: hired.energy,
          salary: hired.salary
        }
      });
    }

    if (action === 'reject') {
      await db.agentCandidate.update({
        where: { id: candidateId },
        data: { status: 'rejected' }
      });

      // HR ищет замену
      const roles = ['writer', 'artist', 'animator', 'voice', 'editor', 'blender'];
      const newC = generateCandidate(roles[Math.floor(Math.random() * roles.length)]);

      const vacancy = await db.vacancy.findFirst();
      const hr = await db.hRManager.findFirst();

      if (vacancy && hr) {
        const created = await db.agentCandidate.create({
          data: {
            vacancyId: vacancy.id,
            hrManagerId: hr.id,
            name: newC.name,
            role: newC.role,
            description: newC.description,
            skills: JSON.stringify(newC.skills),
            specializations: JSON.stringify(newC.specializations),
            experience: newC.experience,
            rating: newC.rating,
            status: 'pending'
          }
        });

        return NextResponse.json({
          success: true,
          message: `❌ ${candidate.name} отклонён`,
          newCandidate: { id: created.id, ...newC }
        });
      }

      return NextResponse.json({
        success: true,
        message: `❌ ${candidate.name} отклонён`
      });
    }

    return NextResponse.json({ success: false, error: 'Неизвестное действие' }, { status: 400 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
