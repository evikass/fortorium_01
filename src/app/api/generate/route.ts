import { NextRequest, NextResponse } from 'next/server';

// TypeScript interfaces for the script structure
interface Dialogue {
  character: string;
  line: string;
}

interface Scene {
  number: number;
  title: string;
  location: string;
  description: string;
  duration: number;
  dialogue: Dialogue[];
}

interface Character {
  name: string;
  description: string;
  traits: string[];
}

interface Script {
  title: string;
  logline: string;
  totalDuration: number;
  characters: Character[];
  scenes: Scene[];
}

// Demo script templates based on animation style
const demoScripts: Record<string, Script> = {
  disney: {
    title: "Волшебное путешествие",
    logline: "Молодая девушка отправляется в невероятное приключение, чтобы спасти своё королевство от вечной зимы.",
    totalDuration: 90,
    characters: [
      { name: "Анна", description: "Смелая и добрая принцесса с огненно-рыжими волосами", traits: ["храбрая", "оптимистичная", "верная"] },
      { name: "Король Мороз", description: "Загадочный правитель ледяного дворца", traits: ["мудрый", "одинокий", "могущественный"] },
      { name: "Снежок", description: "Забавный снеговик, который мечтает о лете", traits: ["смешной", "наивный", "добродушный"] }
    ],
    scenes: [
      { number: 1, title: "Пробуждение", location: "Королевский дворец", description: "Анна просыпается и видит за окном снежный пейзаж. Она смотрит на портрет своих родителей и вспоминает легенду о Короле Морозе.", duration: 5, dialogue: [{ character: "Анна", line: "Каждый день одно и то же... Когда же наступит весна?" }] },
      { number: 2, title: "Путь начинается", location: "Заснеженный лес", description: "Анна собирает вещи и отправляется в опасное путешествие через заколдованный лес. Деревья шелестят таинственными голосами.", duration: 10, dialogue: [{ character: "Анна", line: "Я найду тебя, Король Мороз. Я верну весну в наше королевство!" }] },
      { number: 3, title: "Встреча со Снежком", location: "Ледяная поляна", description: "На пути Анна встречает ожившего снеговика, который рассказывает ей о тайной тропе к дворцу Короля Мороза.", duration: 8, dialogue: [{ character: "Снежок", line: "Привет! Я Снежок! Ты знаешь, я никогда не видел солнца. Говорят, оно тёплое!" }, { character: "Анна", line: "Помоги мне найти Короля Мороза, и ты увидишь настоящее солнце!" }] },
      { number: 4, title: "Ледяной дворец", location: "Дворец Короля Мороза", description: "Величественный дворец из кристально чистого льда сверкает под северным сиянием. Анна поднимается по ледяной лестнице.", duration: 12, dialogue: [{ character: "Король Мороз", line: "Кто смеет нарушить мой покой?" }, { character: "Анна", line: "Я пришла просить о весне. Мой народ страдает!" }] },
      { number: 5, title: "Испытание сердца", location: "Тронный зал", description: "Король Мороз предлагает Анне испытание - доказать, что её сердце чисто и полно любви к своему народу.", duration: 15, dialogue: [{ character: "Король Мороз", line: "Только чистое сердце может растопить вечный лёд. Докажи свою любовь!" }, { character: "Анна", line: "Я люблю свой народ больше жизни. Я готова на любую жертву ради них!" }] },
      { number: 6, title: "Чудо весны", location: "Королевство", description: "Сердце Анны растапливает заклятие. Снег тает, появляются первые цветы, и народ ликует.", duration: 10, dialogue: [{ character: "Снежок", line: "Смотрите! Это солнце! Оно такое... тёплое!" }, { character: "Анна", line: "Весна вернулась! Спасибо, Король Мороз!" }] }
    ]
  },
  ghibli: {
    title: "Духи древнего леса",
    logline: "Десятилетняя девочка попадает в мир духов и должна спасти древний лес от разрушения.",
    totalDuration: 100,
    characters: [
      { name: "Юки", description: "Любопытная девочка с чёрными волосами и добрым сердцем", traits: ["любознательная", "смелая", "добрая"] },
      { name: "Тоторо", description: "Великий дух леса, огромный пушистый защитник природы", traits: ["мудрый", "игривый", "могущественный"] },
      { name: "Хозяйка Леса", description: "Древняя дух-хранительница с женским обликом", traits: ["загадочная", "строгая", "справедливая"] }
    ],
    scenes: [
      { number: 1, title: "Переезд", location: "Старый дом у леса", description: "Юки переезжает с родителями в старинный дом на краю древнего леса. Она исследует загадочный чердак.", duration: 8, dialogue: [{ character: "Юки", line: "Этот дом... в нём что-то живёт. Я чувствую это." }] },
      { number: 2, title: "Первое знакомство", location: "Лесная тропа", description: "Юки забредает в чащу и встречает маленьких лесных духов, которые ведут её к Тоторо.", duration: 12, dialogue: [{ character: "Юки", line: "Вы кто? Вы живёте в этом лесу?" }] },
      { number: 3, title: "Встреча с Тоторо", location: "Священная поляна", description: "На огромном дереве Юки находит спящего Тоторо. Он просыпается и смотрит на неё мудрыми глазами.", duration: 15, dialogue: [{ character: "Тоторо", line: "*довольно урчит*" }, { character: "Юки", line: "Ты такой огромный! Ты настоящий дух леса?" }] },
      { number: 4, title: "Угроза", location: "Граница леса", description: "Юки узнаёт, что компания хочет вырубить часть леса для строительства. Духи встревожены.", duration: 10, dialogue: [{ character: "Хозяйка Леса", line: "Люди снова пришли разрушать. Ты должна остановить их, дитя." }] },
      { number: 5, title: "Магия ночи", location: "Древний храм", description: "Тоторо и Юки совершают ночной обряд, чтобы показать людям красоту леса через магические сны.", duration: 18, dialogue: [{ character: "Юки", line: "Я покажу им, что этот лес живой. Они должны понять!" }] },
      { number: 6, title: "Пробуждение", location: "Городская площадь", description: "Жители города видят чудесные сны о лесе и решают отменить строительство. Лес спасён.", duration: 12, dialogue: [{ character: "Юки", line: "Спасибо, Тоторо. Теперь все знают, как прекрасен лес." }] }
    ]
  },
  anime: {
    title: "Токийский защитник",
    logline: "Обычный школьник обретает силы древнего воина и защищает город от демонов.",
    totalDuration: 85,
    characters: [
      { name: "Кенжи", description: "Шестнадцатилетний парень с сильным чувством справедливости", traits: ["решительный", "добрый", "упорный"] },
      { name: "Мастер Рю", description: "Старый мастер боевых искусств, наставник Кенжи", traits: ["мудрый", "строгий", "заботливый"] },
      { name: "Тень", description: "Главный антагонист, повелитель демонов", traits: ["коварный", "могущественный", "загадочный"] }
    ],
    scenes: [
      { number: 1, title: "Обычный день", location: "Токийская школа", description: "Кенжи заканчивает уроки и идёт домой. Внезапно он видит странный свет в переулке.", duration: 6, dialogue: [{ character: "Кенжи", line: "Что это было? Нужно проверить..." }] },
      { number: 2, title: "Пробуждение силы", location: "Переулок", description: "Кенжи находит древний амулет и касается его. Сила древнего воина перетекает в него.", duration: 10, dialogue: [{ character: "Кенжи", line: "Эта сила... Я чувствую её! Что со мной происходит?" }] },
      { number: 3, title: "Наставник", location: "Старый храм", description: "Мастер Рю объясняет Кенжи его предназначение - защищать город от демонов.", duration: 12, dialogue: [{ character: "Мастер Рю", line: "Ты избран, Кенжи. Этот амулет веками защищал наш мир. Теперь твоя очередь." }] },
      { number: 4, title: "Первая битва", location: "Ночной город", description: "Демоны нападают на мирных жителей. Кенжи впервые использует свои силы в бою.", duration: 15, dialogue: [{ character: "Кенжи", line: "Я не позволю вам обидеть этих людей! Сила древних - со мной!" }] },
      { number: 5, title: "Тень наступает", location: "Заброшенное здание", description: "Тень, повелитель демонов, лично выходит против Кенжи. Битва не на жизнь, а на смерть.", duration: 18, dialogue: [{ character: "Тень", line: "Ты слаб, мальчишка! Твоя сила не сравнится с моей тьмой!" }, { character: "Кенжи", line: "Моя сила - в защите невинных. И я не сдамся!" }] },
      { number: 6, title: "Победа", location: "Восход над городом", description: "Кенжи побеждает Тень. Город спасён, но Кенжи знает, что это только начало.", duration: 8, dialogue: [{ character: "Кенжи", line: "Я буду защищать этот город. Это моя судьба." }] }
    ]
  },
  soviet: {
    title: "Приключения Чебурашки",
    logline: "Добрый и наивный Чебурашка с друзьями строит детский сад для всех зверей.",
    totalDuration: 45,
    characters: [
      { name: "Чебурашка", description: "Неизвестный науке зверёк с большими ушами и добрым сердцем", traits: ["добрый", "наивный", "трудолюбивый"] },
      { name: "Крокодил Гена", description: "Добродушный крокодил, работающий в зоопарке", traits: ["мудрый", "спокойный", "надёжный"] },
      { name: "Старуха Шапокляк", description: "Хитрая старушка с крысой Лариской, любящая шалости", traits: ["хитрая", "весёлая", "добрая внутри"] }
    ],
    scenes: [
      { number: 1, title: "Прибытие", location: "Городской зоопарк", description: "Чебурашка приезжает в ящике с апельсинами и знакомится с крокодилом Геной.", duration: 7, dialogue: [{ character: "Крокодил Гена", line: "Здравствуйте! А вы кто будете?" }, { character: "Чебурашка", line: "Я - Чебурашка. Меня никто не знает, потому что я неизвестный науке зверёк!" }] },
      { number: 2, title: "Идея", location: "Городская площадь", description: "Друзья видят грустных детей и решают построить детский сад для всех малышей города.", duration: 8, dialogue: [{ character: "Чебурашка", line: "Гена, давай построим детский сад! Чтобы всем малышам было где играть!" }] },
      { number: 3, title: "Козни Шапокляк", location: "Строительная площадка", description: "Старуха Шапокляк хочет помешать стройке, но её шутки оборачиваются против неё.", duration: 10, dialogue: [{ character: "Старуха Шапокляк", line: "Ха-ха! Я всё испорчу! Никто не будет играть в этом детском саду!" }] },
      { number: 4, title: "Помощь друзей", location: "Город", description: "Все жители города приходят помочь с постройкой. Каждый вносит свой вклад.", duration: 8, dialogue: [{ character: "Крокодил Гена", line: "Вместе мы всё можем! Главное - дружба и взаимопомощь!" }] },
      { number: 5, title: "Примирение", location: "Детский сад", description: "Шапокляк понимает, что была неправа, и решает тоже помочь.", duration: 7, dialogue: [{ character: "Старуха Шапокляк", line: "Ладно, уговорили. Давайте и я помогу. Крыса Лариска тоже хочет играть!" }] },
      { number: 6, title: "Открытие", location: "Детский сад", description: "Торжественное открытие детского сада. Все рады и счастливы.", duration: 5, dialogue: [{ character: "Чебурашка", line: "Ура! Теперь у всех есть место для игр! Это самый счастливый день!" }] }
    ]
  },
  pixar: {
    title: "Роботы с душой",
    logline: "Одинокий робот на заброшенной Земле находит любовь и надежду.",
    totalDuration: 95,
    characters: [
      { name: "Валл-И", description: "Маленький робот-уборщик с большим сердцем и коллекцией сокровищ", traits: ["любознательный", "романтичный", "трудолюбивый"] },
      { name: "Ева", description: "Современный робот-разведчик, элегантная и серьёзная", traits: ["целеустремлённая", "умная", "верная"] },
      { name: "Капитан", description: "Командир космического корабля, который устал от рутины", traits: ["добрый", "решительный", "мечтательный"] }
    ],
    scenes: [
      { number: 1, title: "Одинокие дни", location: "Заброшенный город", description: "Валл-И сгребает мусор и собирает интересные вещицы. Он смотрит старый мюзикл и мечтает о любви.", duration: 10, dialogue: [{ character: "Валл-И", line: "*грустно смотрит на экран и робко танцует*" }] },
      { number: 2, title: "Прибытие", location: "Пустырь", description: "Корабль приземляется, и появляется Ева. Валл-И сразу влюбляется.", duration: 12, dialogue: [{ character: "Валл-И", line: "*показывает найденный росток с надеждой и трепетом*" }] },
      { number: 3, title: "Приключение в космосе", location: "Космический корабль", description: "Валл-И следует за Евой на корабль людей. Он видит людей, которые забыли, как жить.", duration: 15, dialogue: [{ character: "Капитан", line: "Земля... Это звучит знакомо. Расскажите мне больше!" }] },
      { number: 4, title: "Борьба за растение", location: "Центр управления", description: "Автопилот хочет уничтожить растение, но Валл-И и Ева защищают его.", duration: 18, dialogue: [{ character: "Ева", line: "Валл-И, ты спас нас всех. Ты настоящий герой!" }] },
      { number: 5, title: "Возвращение домой", location: "Космос", description: "Корабль летит обратно на Землю. Люди готовы начать новую жизнь.", duration: 12, dialogue: [{ character: "Капитан", line: "Мы вернёмся домой. Мы будем сажать... пиццу! Нет, пиццу не сажают..." }] },
      { number: 6, title: "Новый мир", location: "Оживающая Земля", description: "Люди высаживаются и начинают восстанавливать планету. Валл-И и Ева держатся за руки.", duration: 10, dialogue: [{ character: "Валл-И", line: "*смотрит на Еву с любовью, пока они вместе сажают росток*" }] }
    ]
  }
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, style, duration } = body;

    // Validate input
    if (!title || !style) {
      return NextResponse.json(
        { error: "Название и стиль обязательны" },
        { status: 400 }
      );
    }

    // Get the demo script for the selected style or default to disney
    const selectedStyle = (style?.toLowerCase() ?? 'disney') as keyof typeof demoScripts;
    const baseScript = demoScripts[selectedStyle] ?? demoScripts.disney;

    // Customize the script based on user input
    const customScript: Script = {
      title: title ?? "Безымянный проект",
      logline: description ?? baseScript.logline,
      totalDuration: duration ?? baseScript.totalDuration,
      characters: baseScript.characters.map(char => ({
        ...char,
        traits: char.traits ?? []
      })),
      scenes: baseScript.scenes.map(scene => ({
        ...scene,
        dialogue: (scene.dialogue ?? []).map(d => ({
          character: d.character ?? "",
          line: d.line ?? ""
        }))
      }))
    };

    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 1500));

    return NextResponse.json(customScript);
  } catch (error) {
    console.error("Error generating script:", error);
    return NextResponse.json(
      { error: "Ошибка при генерации сценария" },
      { status: 500 }
    );
  }
}
