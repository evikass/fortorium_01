import { NextRequest, NextResponse } from 'next/server';

// База эмодзи для разных типов агентов
const AGENT_AVATARS: Record<string, string[]> = {
  writer: ['📝', '✍️', '📜', '📖', '✒️'],
  artist: ['🎨', '🖌️', '🖼️', '🎭', '🌈'],
  animator: ['🎬', '🎞️', '🎥', '📽️', '🎦'],
  voice: ['🎤', '🎙️', '🎵', '🎶', '🔊'],
  editor: ['✂️', '🎞️', '🎬', '💻', '🖥️'],
  blender: ['🧊', '🖥️', '💎', '🔮', '🌀'],
  producer: ['👔', '📊', '💼', '📋', '🎯']
};

// Шаблоны имён для разных ролей
const AGENT_NAME_TEMPLATES: Record<string, { firstNames: string[]; lastNames: string[] }> = {
  writer: {
    firstNames: ['Александр', 'Мария', 'Дмитрий', 'Анна', 'Иван', 'Елена'],
    lastNames: ['Словесник', 'Перов', 'Страницева', 'Романова', 'Текстов', 'Сюжетов']
  },
  artist: {
    firstNames: ['Виктор', 'Ольга', 'Артём', 'София', 'Максим', 'Дарья'],
    lastNames: ['Кистев', 'Красокина', 'Рисунков', 'Палитров', 'Цветов', 'Холстов']
  },
  animator: {
    firstNames: ['Никита', 'Алиса', 'Кирилл', 'Вера', 'Арсений', 'Милана'],
    lastNames: ['Движенин', 'Кадров', 'Мультов', 'Аниматов', 'Сценычев', 'Роликов']
  },
  voice: {
    firstNames: ['Глеб', 'Валерия', 'Роман', 'Кристина', 'Олег', 'Яна'],
    lastNames: ['Голосов', 'Звуков', 'Тонов', 'Речев', 'Мелодиев', 'Интонаций']
  },
  editor: {
    firstNames: ['Павел', 'Наталья', 'Сергей', 'Екатерина', 'Андрей', 'Юлия'],
    lastNames: ['Монтажов', 'Кадров', 'Режиссёров', 'Сценычев', 'Монтов', 'Сборов']
  },
  blender: {
    firstNames: ['Денис', 'Алина', 'Георгий', 'Варвара', 'Станислав', 'Элина'],
    lastNames: ['Рендеров', 'Моделев', '3Деев', 'Полигональев', 'Шейдеров', 'Сценычев']
  },
  producer: {
    firstNames: ['Михаил', 'Елизавета', 'Артём', 'Анастасия', 'Владимир', 'Полина'],
    lastNames: ['Продакшнов', 'Менеджеров', 'Организов', 'Контрольский', 'Планов', 'Сроков']
  }
};

// Специализации для разных ролей
const ROLE_SPECIALIZATIONS: Record<string, string[]> = {
  writer: ['комедия', 'драма', 'приключения', 'фэнтези', 'детские истории', 'короткометражки', 'сериалы'],
  artist: ['2D анимация', '3D моделирование', 'персонажи', 'фоны', 'концепт-арт', 'раскадровка', 'стилизация'],
  animator: ['персонажи', 'окружение', 'эффекты', 'липсинк', 'камера', 'движение', 'трансформации'],
  voice: ['мужские голоса', 'женские голоса', 'детские голоса', 'озвучка животных', 'закадровый голос', 'песни'],
  editor: ['монтаж видео', 'цветокоррекция', 'звуковой дизайн', 'субтитры', 'эффекты', 'сборка'],
  blender: ['моделирование', 'текстуры', 'освещение', 'анимация', 'рендер', 'симуляции', 'геометрические ноды']
};

// Дополнительные навыки для разных ролей
const ROLE_EXTRA_SKILLS: Record<string, string[]> = {
  writer: ['сюжет', 'диалоги', 'персонажи', 'структура', 'драматургия', 'юмор', 'эмоции'],
  artist: ['рисование', 'композиция', 'цвет', 'персонажи', 'фоны', 'стилизация', 'анатомия'],
  animator: ['движение', 'тайминг', 'сцены', 'персонажи', 'эффекты', 'липсинк', 'камера'],
  voice: ['голос', 'эмоции', 'персонажи', 'интонация', 'диалоги', 'песни', 'акценты'],
  editor: ['монтаж', 'звук', 'эффекты', 'цветокоррекция', 'сборка', 'субтитры', 'переходы'],
  blender: ['моделирование', 'текстуры', 'освещение', 'рендер', 'анимация', 'симуляции', 'нодовая система']
};

// Описания для разных уровней опыта
const EXPERIENCE_DESCRIPTIONS: Record<string, string[]> = {
  junior: [
    'Начинающий специалист с хорошим потенциалом',
    'Выпускник профильных курсов, готов к обучению',
    'Энтузиаст с базовыми навыками и желанием развиваться'
  ],
  middle: [
    'Опытный специалист с несколькими успешными проектами',
    'Уверенный профессионал, способный работать самостоятельно',
    'Специалист с хорошим портфолио и стабильными результатами'
  ],
  senior: [
    'Ведущий специалист с богатым опытом в индустрии',
    'Эксперт с множеством успешных проектов и наград',
    'Наставник с глубоким пониманием всех аспектов работы'
  ],
  any: [
    'Универсальный специалист с разносторонним опытом',
    'Креативный профессионал с нестандартным подходом',
    'Талантливый специалист с отличным портфолио'
  ]
};

// Генерация кандидата
function generateCandidate(role: string, requiredSkills: string[], experienceLevel: string, preferredStyle?: string) {
  const nameTemplate = AGENT_NAME_TEMPLATES[role] || AGENT_NAME_TEMPLATES.writer;
  const avatars = AGENT_AVATARS[role] || ['🤖'];
  const specializations = ROLE_SPECIALIZATIONS[role] || [];
  const extraSkills = ROLE_EXTRA_SKILLS[role] || [];
  const expDescs = EXPERIENCE_DESCRIPTIONS[experienceLevel] || EXPERIENCE_DESCRIPTIONS.any;

  const firstName = nameTemplate.firstNames[Math.floor(Math.random() * nameTemplate.firstNames.length)];
  const lastName = nameTemplate.lastNames[Math.floor(Math.random() * nameTemplate.lastNames.length)];

  // Смешиваем требуемые навыки с дополнительными
  const allSkills = [...new Set([...requiredSkills, ...extraSkills.slice(0, 3)])];
  const selectedSkills = allSkills.slice(0, 4 + Math.floor(Math.random() * 2));

  // Выбираем специализации
  const selectedSpecs = specializations
    .sort(() => Math.random() - 0.5)
    .slice(0, 2 + Math.floor(Math.random() * 2));

  // Рейтинг зависит от уровня опыта
  const baseRating = experienceLevel === 'senior' ? 85 : 
                     experienceLevel === 'middle' ? 75 : 
                     experienceLevel === 'junior' ? 65 : 70;
  const rating = baseRating + Math.floor(Math.random() * 10) - 5;

  // Зарплата зависит от уровня
  const baseSalary = experienceLevel === 'senior' ? 35 : 
                     experienceLevel === 'middle' ? 20 : 
                     experienceLevel === 'junior' ? 10 : 15;
  const salary = baseSalary + Math.floor(Math.random() * 15);

  return {
    id: `candidate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: `${firstName} ${lastName}`,
    role,
    description: expDescs[Math.floor(Math.random() * expDescs.length)],
    skills: selectedSkills,
    specializations: selectedSpecs,
    preferredStyle: preferredStyle || 'универсальный',
    experience: experienceLevel === 'senior' ? 'Более 5 лет опыта' : 
                experienceLevel === 'middle' ? '3-5 лет опыта' : 
                experienceLevel === 'junior' ? '1-2 года опыта' : '2-4 года опыта',
    rating: Math.min(95, Math.max(60, rating)),
    salary: Math.min(50, Math.max(5, salary)),
    avatarEmoji: avatars[Math.floor(Math.random() * avatars.length)]
  };
}

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

    switch (action) {
      case 'find_candidates': {
        const role = data.role || 'writer';
        const requiredSkills = data.requiredSkills || [];
        const experienceLevel = data.experienceLevel || 'any';
        const preferredStyle = data.preferredStyle;
        const count = data.count || 3;

        const candidates = [];
        for (let i = 0; i < count; i++) {
          candidates.push(generateCandidate(role, requiredSkills, experienceLevel, preferredStyle));
        }

        return NextResponse.json({
          success: true,
          vacancy: {
            role,
            title: data.title || `Специалист ${role}`,
            requiredSkills,
            experienceLevel,
            preferredStyle
          },
          candidates: candidates.sort((a, b) => b.rating - a.rating)
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
