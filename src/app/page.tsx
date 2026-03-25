'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import {
  Film,
  Sparkles,
  Image as ImageIcon,
  Save,
  FolderOpen,
  Download,
  Trash2,
  Users,
  MapPin,
  Clock,
  MessageSquare,
  Play,
  RefreshCw,
  Palette,
  Zap,
  Star,
  Heart
} from 'lucide-react';

// ============ TypeScript Interfaces ============

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
  generatedImage?: string;
}

interface Character {
  name: string;
  description: string;
  traits: string[];
  generatedImage?: string;
}

interface Script {
  title: string;
  logline: string;
  totalDuration: number;
  characters: Character[];
  scenes: Scene[];
}

interface Project {
  id: string;
  title: string;
  description: string;
  style: string;
  duration: number;
  script: Script | null;
  createdAt: string;
  updatedAt: string;
}

// ============ Animation Styles ============

const ANIMATION_STYLES = [
  { value: 'disney', label: 'Disney', description: 'Классическая диснеевская анимация' },
  { value: 'ghibli', label: 'Studio Ghibli', description: 'Японская анимация в стиле Миядзаки' },
  { value: 'anime', label: 'Anime', description: 'Современный аниме-стиль' },
  { value: 'soviet', label: 'Советская анимация', description: 'Классическая советская мультипликация' },
  { value: 'pixar', label: 'Pixar', description: '3D анимация в стиле Pixar' },
];

// ============ Demo Project ============

const DEMO_PROJECT: Project = {
  id: 'demo-project',
  title: 'Волшебное путешествие',
  description: 'Молодая девушка отправляется в невероятное приключение, чтобы спасти своё королевство от вечной зимы.',
  style: 'disney',
  duration: 90,
  script: {
    title: 'Волшебное путешествие',
    logline: 'Молодая девушка отправляется в невероятное приключение, чтобы спасти своё королевство от вечной зимы.',
    totalDuration: 90,
    characters: [
      { name: 'Анна', description: 'Смелая и добрая принцесса с огненно-рыжими волосами', traits: ['храбрая', 'оптимистичная', 'верная'] },
      { name: 'Король Мороз', description: 'Загадочный правитель ледяного дворца', traits: ['мудрый', 'одинокий', 'могущественный'] },
      { name: 'Снежок', description: 'Забавный снеговик, который мечтает о лете', traits: ['смешной', 'наивный', 'добродушный'] }
    ],
    scenes: [
      { number: 1, title: 'Пробуждение', location: 'Королевский дворец', description: 'Анна просыпается и видит за окном снежный пейзаж. Она смотрит на портрет своих родителей и вспоминает легенду о Короле Морозе.', duration: 5, dialogue: [{ character: 'Анна', line: 'Каждый день одно и то же... Когда же наступит весна?' }] },
      { number: 2, title: 'Путь начинается', location: 'Заснеженный лес', description: 'Анна собирает вещи и отправляется в опасное путешествие через заколдованный лес. Деревья шелестят таинственными голосами.', duration: 10, dialogue: [{ character: 'Анна', line: 'Я найду тебя, Король Мороз. Я верну весну в наше королевство!' }] },
      { number: 3, title: 'Встреча со Снежком', location: 'Ледяная поляна', description: 'На пути Анна встречает ожившего снеговика, который рассказывает ей о тайной тропе к дворцу Короля Мороза.', duration: 8, dialogue: [{ character: 'Снежок', line: 'Привет! Я Снежок! Ты знаешь, я никогда не видел солнца. Говорят, оно тёплое!' }, { character: 'Анна', line: 'Помоги мне найти Короля Мороза, и ты увидишь настоящее солнце!' }] },
      { number: 4, title: 'Ледяной дворец', location: 'Дворец Короля Мороза', description: 'Величественный дворец из кристально чистого льда сверкает под северным сиянием.', duration: 12, dialogue: [{ character: 'Король Мороз', line: 'Кто смеет нарушить мой покой?' }] },
      { number: 5, title: 'Испытание сердца', location: 'Тронный зал', description: 'Король Мороз предлагает Анне испытание - доказать, что её сердце чисто и полно любви к своему народу.', duration: 15, dialogue: [{ character: 'Анна', line: 'Я люблю свой народ больше жизни!' }] },
      { number: 6, title: 'Чудо весны', location: 'Королевство', description: 'Сердце Анны растапливает заклятие. Снег тает, появляются первые цветы, и народ ликует.', duration: 10, dialogue: [{ character: 'Снежок', line: 'Смотрите! Это солнце!' }] }
    ]
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// ============ Helper Functions ============

const generateId = (): string => {
  return `project-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

const getStyleLabel = (styleValue: string | undefined | null): string => {
  const safeStyle = styleValue ?? '';
  const style = ANIMATION_STYLES.find(s => s.value === safeStyle);
  return style?.label ?? 'Неизвестный стиль';
};

const generatePollinationsUrl = (prompt: string | undefined | null): string => {
  const safePrompt = prompt ?? 'animation scene';
  const encodedPrompt = encodeURIComponent(safePrompt);
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=512&nologo=true`;
};

// ============ Validation Helpers ============

const isValidProject = (data: unknown): data is Project => {
  if (typeof data !== 'object' || data === null) return false;
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.style === 'string'
  );
};

const safeParseJson = <T,>(jsonString: string, fallback: T): T => {
  try {
    const parsed = JSON.parse(jsonString);
    return parsed as T;
  } catch {
    return fallback;
  }
};

// ============ Main Component ============

export default function FortoriumApp() {
  const { toast } = useToast();

  // ============ State with proper initialization ============

  const [project, setProject] = useState<Project>({
    id: generateId(),
    title: '',
    description: '',
    style: '',
    duration: 5,
    script: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  const [isGeneratingScript, setIsGeneratingScript] = useState<boolean>(false);
  const [generatingImages, setGeneratingImages] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<string>('create');

  // ============ Computed Values with null checks ============

  const scenesCount: number = project?.script?.scenes?.length ?? 0;
  const charactersCount: number = project?.script?.characters?.length ?? 0;
  const generatedImagesCount: number = (() => {
    const sceneImages = (project?.script?.scenes ?? []).filter(s => s?.generatedImage).length;
    const characterImages = (project?.script?.characters ?? []).filter(c => c?.generatedImage).length;
    return sceneImages + characterImages;
  })();
  const totalPossibleImages: number = scenesCount + charactersCount;
  const progressPercentage: number = totalPossibleImages > 0
    ? Math.round((generatedImagesCount / totalPossibleImages) * 100)
    : 0;

  // ============ Load from localStorage on mount ============

  useEffect(() => {
    try {
      const savedProject = localStorage.getItem('fortorium_project');
      if (savedProject) {
        const parsed = safeParseJson<unknown>(savedProject, null);
        if (isValidProject(parsed)) {
          setProject(parsed);
          toast({
            title: "Проект загружен",
            description: "Сохранённый проект успешно загружен",
          });
        }
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      // Clear corrupted data
      localStorage.removeItem('fortorium_project');
    }
  }, []);

  // ============ API Call for Script Generation ============

  const generateScript = useCallback(async () => {
    if (!project?.title || !project?.style) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, заполните название и выберите стиль",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingScript(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: project.title,
          description: project.description,
          style: project.style,
          duration: project.duration
        })
      });

      if (!response.ok) {
        throw new Error('Ошибка при генерации сценария');
      }

      const script: Script = await response.json();

      // Ensure all arrays have proper defaults
      const safeScript: Script = {
        title: script?.title ?? project.title,
        logline: script?.logline ?? project.description,
        totalDuration: script?.totalDuration ?? project.duration,
        characters: (script?.characters ?? []).map(char => ({
          name: char?.name ?? 'Персонаж',
          description: char?.description ?? '',
          traits: char?.traits ?? []
        })),
        scenes: (script?.scenes ?? []).map(scene => ({
          number: scene?.number ?? 0,
          title: scene?.title ?? 'Сцена',
          location: scene?.location ?? '',
          description: scene?.description ?? '',
          duration: scene?.duration ?? 0,
          dialogue: (scene?.dialogue ?? []).map(d => ({
            character: d?.character ?? '',
            line: d?.line ?? ''
          }))
        }))
      };

      setProject(prev => ({
        ...prev,
        script: safeScript,
        updatedAt: new Date().toISOString()
      }));

      setActiveTab('script');
      toast({
        title: "Сценарий создан!",
        description: `Создано ${(safeScript?.scenes?.length ?? 0)} сцен и ${(safeScript?.characters?.length ?? 0)} персонажей`,
      });
    } catch (error) {
      console.error('Error generating script:', error);
      toast({
        title: "Ошибка генерации",
        description: "Не удалось создать сценарий. Попробуйте снова.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingScript(false);
    }
  }, [project, toast]);

  // ============ Image Generation Functions ============

  const generateSceneImage = useCallback((sceneIndex: number) => {
    const scene = project?.script?.scenes?.[sceneIndex];
    if (!scene) return;

    const imageKey = `scene-${sceneIndex}`;
    setGeneratingImages(prev => new Set(prev).add(imageKey));

    const styleLabel = getStyleLabel(project?.style);
    const prompt = `Animation style scene: ${scene?.description ?? ''}, ${styleLabel} style, cinematic, beautiful, high quality`;

    const imageUrl = generatePollinationsUrl(prompt);

    // Simulate loading time for image generation
    setTimeout(() => {
      setProject(prev => {
        const newScenes = [...(prev?.script?.scenes ?? [])];
        if (newScenes[sceneIndex]) {
          newScenes[sceneIndex] = {
            ...newScenes[sceneIndex],
            generatedImage: imageUrl
          };
        }
        return {
          ...prev,
          script: {
            ...(prev?.script ?? { title: '', logline: '', totalDuration: 0, characters: [], scenes: [] }),
            scenes: newScenes
          },
          updatedAt: new Date().toISOString()
        };
      });

      setGeneratingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(imageKey);
        return newSet;
      });

      toast({
        title: "Изображение создано!",
        description: `Изображение для сцены "${scene?.title ?? ''}" готово`,
      });
    }, 1500);
  }, [project, toast]);

  const generateCharacterImage = useCallback((characterIndex: number) => {
    const character = project?.script?.characters?.[characterIndex];
    if (!character) return;

    const imageKey = `character-${characterIndex}`;
    setGeneratingImages(prev => new Set(prev).add(imageKey));

    const styleLabel = getStyleLabel(project?.style);
    const prompt = `Character portrait: ${character?.description ?? ''}, ${styleLabel} animation style, portrait, expressive, detailed`;

    const imageUrl = generatePollinationsUrl(prompt);

    setTimeout(() => {
      setProject(prev => {
        const newCharacters = [...(prev?.script?.characters ?? [])];
        if (newCharacters[characterIndex]) {
          newCharacters[characterIndex] = {
            ...newCharacters[characterIndex],
            generatedImage: imageUrl
          };
        }
        return {
          ...prev,
          script: {
            ...(prev?.script ?? { title: '', logline: '', totalDuration: 0, characters: [], scenes: [] }),
            characters: newCharacters
          },
          updatedAt: new Date().toISOString()
        };
      });

      setGeneratingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(imageKey);
        return newSet;
      });

      toast({
        title: "Портрет создан!",
        description: `Портрет персонажа "${character?.name ?? ''}" готов`,
      });
    }, 1500);
  }, [project, toast]);

  const generateAllSceneImages = useCallback(() => {
    const scenes = project?.script?.scenes ?? [];
    if (scenes.length === 0) {
      toast({
        title: "Нет сцен",
        description: "Сначала создайте сценарий",
        variant: "destructive"
      });
      return;
    }

    scenes.forEach((_, index) => {
      setTimeout(() => generateSceneImage(index), index * 500);
    });
  }, [project, generateSceneImage, toast]);

  const generateAllCharacterImages = useCallback(() => {
    const characters = project?.script?.characters ?? [];
    if (characters.length === 0) {
      toast({
        title: "Нет персонажей",
        description: "Сначала создайте сценарий",
        variant: "destructive"
      });
      return;
    }

    characters.forEach((_, index) => {
      setTimeout(() => generateCharacterImage(index), index * 500);
    });
  }, [project, generateCharacterImage, toast]);

  // ============ Save/Load/Export Functions ============

  const saveProject = useCallback(() => {
    try {
      localStorage.setItem('fortorium_project', JSON.stringify(project));
      toast({
        title: "Проект сохранён",
        description: "Проект успешно сохранён в локальное хранилище",
      });
    } catch (error) {
      console.error('Error saving project:', error);
      toast({
        title: "Ошибка сохранения",
        description: "Не удалось сохранить проект",
        variant: "destructive"
      });
    }
  }, [project, toast]);

  const loadProject = useCallback(() => {
    try {
      const savedProject = localStorage.getItem('fortorium_project');
      if (savedProject) {
        const parsed = safeParseJson<unknown>(savedProject, null);
        if (isValidProject(parsed)) {
          setProject(parsed);
          toast({
            title: "Проект загружен",
            description: "Проект успешно загружен из хранилища",
          });
        } else {
          throw new Error('Invalid project data');
        }
      } else {
        toast({
          title: "Нет сохранённых проектов",
          description: "Хранилище пусто",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error loading project:', error);
      localStorage.removeItem('fortorium_project');
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить проект. Возможно, данные повреждены.",
        variant: "destructive"
      });
    }
  }, [toast]);

  const exportProject = useCallback(() => {
    try {
      const dataStr = JSON.stringify(project, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
      const exportName = `fortorium-${project?.title ?? 'project'}-${Date.now()}.json`;

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportName);
      linkElement.click();

      toast({
        title: "Проект экспортирован",
        description: "Файл успешно скачан",
      });
    } catch (error) {
      console.error('Error exporting project:', error);
      toast({
        title: "Ошибка экспорта",
        description: "Не удалось экспортировать проект",
        variant: "destructive"
      });
    }
  }, [project, toast]);

  const clearProject = useCallback(() => {
    setProject({
      id: generateId(),
      title: '',
      description: '',
      style: '',
      duration: 5,
      script: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    localStorage.removeItem('fortorium_project');
    setActiveTab('create');
    toast({
      title: "Проект очищен",
      description: "Все данные удалены",
    });
  }, [toast]);

  const loadDemoProject = useCallback(() => {
    setProject(DEMO_PROJECT);
    setActiveTab('script');
    toast({
      title: "Демо-проект загружен",
      description: "Вы можете редактировать и генерировать изображения",
    });
  }, [toast]);

  // ============ Render ============

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      {/* Header */}
      <header className="border-b border-purple-500/20 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Film className="w-7 h-7 text-white" />
                </div>
                <Sparkles className="w-4 h-4 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  ФОРТОРИУМ
                </h1>
                <p className="text-xs text-gray-400">Анимационная студия будущего</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadDemoProject}
                className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
              >
                <Play className="w-4 h-4 mr-2" />
                Демо
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-3 max-w-md mx-auto bg-gray-800/50 border border-purple-500/20">
            <TabsTrigger
              value="create"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Создать
            </TabsTrigger>
            <TabsTrigger
              value="script"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500"
              disabled={!project?.script}
            >
              <Film className="w-4 h-4 mr-2" />
              Сценарий
            </TabsTrigger>
            <TabsTrigger
              value="images"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500"
              disabled={!project?.script}
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              Изображения
            </TabsTrigger>
          </TabsList>

          {/* Create Tab */}
          <TabsContent value="create" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Project Form */}
              <Card className="lg:col-span-2 bg-gray-800/50 border-purple-500/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-purple-300 flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Создание проекта
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Заполните информацию о вашем анимационном проекте
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-gray-300">Название проекта *</Label>
                    <Input
                      id="title"
                      value={project?.title ?? ''}
                      onChange={(e) => setProject(prev => ({ ...prev, title: e.target.value, updatedAt: new Date().toISOString() }))}
                      placeholder="Введите название вашего проекта"
                      className="bg-gray-900/50 border-purple-500/30 text-white placeholder:text-gray-500 focus:border-purple-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-gray-300">Описание / Логлайн</Label>
                    <Textarea
                      id="description"
                      value={project?.description ?? ''}
                      onChange={(e) => setProject(prev => ({ ...prev, description: e.target.value, updatedAt: new Date().toISOString() }))}
                      placeholder="Краткое описание вашего анимационного проекта..."
                      rows={3}
                      className="bg-gray-900/50 border-purple-500/30 text-white placeholder:text-gray-500 focus:border-purple-500 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="style" className="text-gray-300">Стиль анимации *</Label>
                      <Select
                        value={project?.style ?? ''}
                        onValueChange={(value) => setProject(prev => ({ ...prev, style: value, updatedAt: new Date().toISOString() }))}
                      >
                        <SelectTrigger className="bg-gray-900/50 border-purple-500/30 text-white">
                          <SelectValue placeholder="Выберите стиль" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-purple-500/30">
                          {ANIMATION_STYLES.map((style) => (
                            <SelectItem
                              key={style.value}
                              value={style.value}
                              className="text-white hover:bg-purple-500/20 focus:bg-purple-500/20"
                            >
                              {style.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration" className="text-gray-300">Длительность (минуты)</Label>
                      <Input
                        id="duration"
                        type="number"
                        min={1}
                        max={180}
                        value={project?.duration ?? 5}
                        onChange={(e) => setProject(prev => ({
                          ...prev,
                          duration: Math.max(1, parseInt(e.target.value) || 5),
                          updatedAt: new Date().toISOString()
                        }))}
                        className="bg-gray-900/50 border-purple-500/30 text-white focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={generateScript}
                    disabled={isGeneratingScript || !project?.title || !project?.style}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-6 text-lg"
                  >
                    {isGeneratingScript ? (
                      <>
                        <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                        Генерация сценария...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Создать сценарий
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Statistics & Actions */}
              <div className="space-y-6">
                {/* Project Stats */}
                <Card className="bg-gray-800/50 border-purple-500/20 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-purple-300 text-lg">Статистика проекта</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-purple-400">{scenesCount}</div>
                        <div className="text-xs text-gray-400">Сцен</div>
                      </div>
                      <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-pink-400">{charactersCount}</div>
                        <div className="text-xs text-gray-400">Персонажей</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Изображений</span>
                        <span className="text-purple-300">{generatedImagesCount} / {totalPossibleImages}</span>
                      </div>
                      <Progress value={progressPercentage} className="h-2 bg-gray-700 [&>div]:bg-gradient-to-r [&>div]:from-purple-500 [&>div]:to-pink-500" />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Стиль</span>
                      <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                        {getStyleLabel(project?.style)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                <Card className="bg-gray-800/50 border-purple-500/20 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-purple-300 text-lg">Действия</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      onClick={saveProject}
                      variant="outline"
                      className="w-full border-purple-500/30 text-purple-300 hover:bg-purple-500/20 justify-start"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Сохранить проект
                    </Button>
                    <Button
                      onClick={loadProject}
                      variant="outline"
                      className="w-full border-purple-500/30 text-purple-300 hover:bg-purple-500/20 justify-start"
                    >
                      <FolderOpen className="w-4 h-4 mr-2" />
                      Загрузить проект
                    </Button>
                    <Button
                      onClick={exportProject}
                      variant="outline"
                      className="w-full border-purple-500/30 text-purple-300 hover:bg-purple-500/20 justify-start"
                      disabled={!project?.script}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Экспортировать JSON
                    </Button>
                    <Separator className="bg-purple-500/20 my-2" />
                    <Button
                      onClick={clearProject}
                      variant="destructive"
                      className="w-full justify-start"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Очистить проект
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Script Tab */}
          <TabsContent value="script" className="space-y-6">
            {project?.script && (
              <>
                {/* Script Header */}
                <Card className="bg-gray-800/50 border-purple-500/20 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-2xl text-white flex items-center gap-2">
                          <Film className="w-6 h-6 text-purple-400" />
                          {project.script?.title ?? 'Безымянный проект'}
                        </CardTitle>
                        <CardDescription className="text-gray-400 mt-2 text-base">
                          {project.script?.logline ?? ''}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span>{project.script?.totalDuration ?? 0} мин</span>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Characters */}
                  <Card className="bg-gray-800/50 border-purple-500/20 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-purple-300 flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Персонажи ({charactersCount})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[500px] pr-4">
                        <div className="space-y-4">
                          {(project.script?.characters ?? []).map((character, index) => (
                            <Card key={`char-${index}`} className="bg-gray-900/50 border-purple-500/10">
                              <CardContent className="pt-4">
                                {character?.generatedImage && (
                                  <div className="mb-3 aspect-square rounded-lg overflow-hidden bg-gray-800">
                                    <img
                                      src={character.generatedImage}
                                      alt={character?.name ?? 'Персонаж'}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                )}
                                <h4 className="font-semibold text-white mb-1">{character?.name ?? 'Персонаж'}</h4>
                                <p className="text-sm text-gray-400 mb-2">{character?.description ?? ''}</p>
                                <div className="flex flex-wrap gap-1">
                                  {(character?.traits ?? []).map((trait, traitIndex) => (
                                    <Badge
                                      key={`trait-${index}-${traitIndex}`}
                                      variant="secondary"
                                      className="text-xs bg-pink-500/20 text-pink-300 border-pink-500/30"
                                    >
                                      {trait}
                                    </Badge>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  {/* Scenes */}
                  <Card className="lg:col-span-2 bg-gray-800/50 border-purple-500/20 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-purple-300 flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        Сцены ({scenesCount})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[500px] pr-4">
                        <div className="space-y-4">
                          {(project.script?.scenes ?? []).map((scene, index) => (
                            <Card key={`scene-${index}`} className="bg-gray-900/50 border-purple-500/10">
                              <CardContent className="pt-4">
                                <div className="flex items-start gap-4">
                                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                                    {scene?.number ?? index + 1}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="font-semibold text-white">{scene?.title ?? 'Сцена'}</h4>
                                      <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-300">
                                        <Clock className="w-3 h-3 mr-1" />
                                        {scene?.duration ?? 0} мин
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-purple-300 mb-1 flex items-center gap-1">
                                      <MapPin className="w-3 h-3" />
                                      {scene?.location ?? 'Неизвестно'}
                                    </p>
                                    <p className="text-sm text-gray-400 mb-3">{scene?.description ?? ''}</p>

                                    {(scene?.dialogue?.length ?? 0) > 0 && (
                                      <div className="space-y-2">
                                        {(scene?.dialogue ?? []).map((d, dIndex) => (
                                          <div
                                            key={`dialogue-${index}-${dIndex}`}
                                            className="flex gap-2 text-sm"
                                          >
                                            <span className="text-pink-400 font-medium shrink-0">
                                              {d?.character ?? ''}:
                                            </span>
                                            <span className="text-gray-300 italic">&ldquo;{d?.line ?? ''}&rdquo;</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          {/* Images Tab */}
          <TabsContent value="images" className="space-y-6">
            {project?.script && (
              <>
                {/* Actions Bar */}
                <Card className="bg-gray-800/50 border-purple-500/20 backdrop-blur-sm">
                  <CardContent className="py-4">
                    <div className="flex flex-wrap gap-3">
                      <Button
                        onClick={generateAllSceneImages}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      >
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Сгенерировать все сцены
                      </Button>
                      <Button
                        onClick={generateAllCharacterImages}
                        variant="outline"
                        className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Сгенерировать всех персонажей
                      </Button>
                      <div className="flex-1" />
                      <div className="flex items-center gap-2 text-gray-400">
                        <span className="text-sm">Прогресс:</span>
                        <Progress value={progressPercentage} className="w-32 h-2 bg-gray-700 [&>div]:bg-gradient-to-r [&>div]:from-purple-500 [&>div]:to-pink-500" />
                        <span className="text-sm text-purple-300">{progressPercentage}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Character Images */}
                  <Card className="bg-gray-800/50 border-purple-500/20 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-purple-300 flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Портреты персонажей
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        {(project.script?.characters ?? []).map((character, index) => {
                          const imageKey = `character-${index}`;
                          const isGenerating = generatingImages.has(imageKey);

                          return (
                            <Card key={`char-img-${index}`} className="bg-gray-900/50 border-purple-500/10 overflow-hidden">
                              <div className="aspect-square bg-gray-800 relative">
                                {character?.generatedImage ? (
                                  <img
                                    src={character.generatedImage}
                                    alt={character?.name ?? 'Персонаж'}
                                    className="w-full h-full object-cover"
                                  />
                                ) : isGenerating ? (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
                                  </div>
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-600">
                                    <Users className="w-12 h-12" />
                                  </div>
                                )}
                              </div>
                              <CardContent className="p-3">
                                <h4 className="font-medium text-white text-sm truncate">{character?.name ?? 'Персонаж'}</h4>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full mt-2 border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                                  onClick={() => generateCharacterImage(index)}
                                  disabled={isGenerating}
                                >
                                  {isGenerating ? (
                                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                                  ) : (
                                    <Zap className="w-3 h-3 mr-1" />
                                  )}
                                  {character?.generatedImage ? 'Пересоздать' : 'Создать'}
                                </Button>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Scene Images */}
                  <Card className="bg-gray-800/50 border-purple-500/20 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-purple-300 flex items-center gap-2">
                        <ImageIcon className="w-5 h-5" />
                        Изображения сцен
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2">
                        {(project.script?.scenes ?? []).map((scene, index) => {
                          const imageKey = `scene-${index}`;
                          const isGenerating = generatingImages.has(imageKey);

                          return (
                            <Card key={`scene-img-${index}`} className="bg-gray-900/50 border-purple-500/10 overflow-hidden">
                              <div className="aspect-square bg-gray-800 relative">
                                {scene?.generatedImage ? (
                                  <img
                                    src={scene.generatedImage}
                                    alt={scene?.title ?? 'Сцена'}
                                    className="w-full h-full object-cover"
                                  />
                                ) : isGenerating ? (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
                                  </div>
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-600">
                                    <Film className="w-12 h-12" />
                                  </div>
                                )}
                                <div className="absolute top-2 left-2 bg-purple-500/80 text-white text-xs font-bold px-2 py-1 rounded">
                                  {scene?.number ?? index + 1}
                                </div>
                              </div>
                              <CardContent className="p-3">
                                <h4 className="font-medium text-white text-sm truncate">{scene?.title ?? 'Сцена'}</h4>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full mt-2 border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                                  onClick={() => generateSceneImage(index)}
                                  disabled={isGenerating}
                                >
                                  {isGenerating ? (
                                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                                  ) : (
                                    <Zap className="w-3 h-3 mr-1" />
                                  )}
                                  {scene?.generatedImage ? 'Пересоздать' : 'Создать'}
                                </Button>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-purple-500/20 bg-gray-900/80 mt-auto">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-pink-500" />
              <span>ФОРТОРИУМ © {new Date().getFullYear()}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500" />
                Анимационная студия будущего
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
