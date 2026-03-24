'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { 
  Film, 
  Palette, 
  Mic, 
  Video, 
  Bot, 
  Play, 
  Plus,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Settings,
  Monitor,
  Sparkles,
  Clapperboard,
  Wand2
} from 'lucide-react';

// Типы данных
interface Agent {
  id: string;
  name: string;
  role: string;
  status: string;
  lastActiveAt: string | null;
}

interface Task {
  id: string;
  type: string;
  title: string;
  status: string;
  agentId: string;
  agent?: Agent;
  input: string | null;
  output: string | null;
  error: string | null;
  createdAt: string;
  completedAt: string | null;
}

interface Scene {
  id: string;
  order: number;
  title: string;
  description: string;
  duration: number;
  imageUrl: string | null;
  videoUrl: string | null;
}

interface Project {
  id: string;
  title: string;
  description: string;
  style: string;
  duration: number;
  status: string;
  useBlender: boolean;
  createdAt: string;
  tasks: Task[];
  scenes: Scene[];
}

interface BlenderConnection {
  id: string;
  name: string;
  host: string;
  port: number;
  status: string;
}

// Карта стилей
const ANIMATION_STYLES = [
  { value: 'ghibli', label: 'Studio Ghibli', description: 'Миядзаки, акварель, магия' },
  { value: 'disney', label: 'Disney 2D', description: 'Классическая диснеевская анимация' },
  { value: 'pixar', label: 'Pixar 3D', description: 'Современный 3D, кинематографичность' },
  { value: 'anime', label: 'Anime', description: 'Японская анимация, яркие цвета' },
  { value: 'cartoon', label: 'Modern Cartoon', description: 'Современный мульт, яркий и весёлый' },
];

// Карта агентов
const AGENTS = [
  { role: 'producer', name: 'Продюсер', icon: Bot, color: 'bg-purple-500' },
  { role: 'writer', name: 'Сценарист', icon: Clapperboard, color: 'bg-blue-500' },
  { role: 'artist', name: 'Художник', icon: Palette, color: 'bg-pink-500' },
  { role: 'animator', name: 'Аниматор', icon: Film, color: 'bg-orange-500' },
  { role: 'voice', name: 'Озвучка', icon: Mic, color: 'bg-green-500' },
  { role: 'editor', name: 'Монтажёр', icon: Video, color: 'bg-red-500' },
  { role: 'blender', name: 'Blender', icon: Monitor, color: 'bg-cyan-500' },
];

export default function AnimationStudio() {
  // Состояния
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [blenderConnections, setBlenderConnections] = useState<BlenderConnection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('projects');

  // Форма нового проекта
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    style: 'disney',
    duration: 30,
    useBlender: false
  });

  // Форма Blender подключения
  const [blenderForm, setBlenderForm] = useState({
    name: '',
    host: '',
    port: 9876,
    apiKey: ''
  });

  // Загрузка данных
  const fetchProjects = useCallback(async () => {
    try {
      const response = await fetch('/api/projects');
      const data = await response.json();
      if (data.success) {
        setProjects(data.projects);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  }, []);

  const fetchBlenderConnections = useCallback(async () => {
    try {
      const response = await fetch('/api/blender');
      const data = await response.json();
      if (data.success) {
        setBlenderConnections(data.connections);
      }
    } catch (error) {
      console.error('Error fetching Blender connections:', error);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
    fetchBlenderConnections();
  }, [fetchProjects, fetchBlenderConnections]);

  // Создание проекта
  const handleCreateProject = async () => {
    if (!newProject.title || !newProject.description) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProject)
      });

      const data = await response.json();
      if (data.success) {
        setProjects([data.project, ...projects]);
        setSelectedProject(data.project);
        setNewProject({
          title: '',
          description: '',
          style: 'disney',
          duration: 30,
          useBlender: false
        });
        setActiveTab('pipeline');
      }
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Выполнение задачи агента
  const executeAgentTask = async (agentRole: string, taskType: string, input: Record<string, unknown>) => {
    if (!selectedProject) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProject.id,
          agentRole,
          type: taskType,
          input
        })
      });

      const data = await response.json();
      if (data.success) {
        // Обновляем проект
        await fetchProjects();
        const updated = projects.find(p => p.id === selectedProject.id);
        if (updated) setSelectedProject(updated);
      }
    } catch (error) {
      console.error('Error executing task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Подключение к Blender
  const handleTestBlenderConnection = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/blender', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...blenderForm,
          action: 'test'
        })
      });

      const data = await response.json();
      alert(data.success ? '✅ Подключение успешно!' : `❌ ${data.message}`);
    } catch (error) {
      console.error('Error testing connection:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveBlenderConnection = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/blender', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...blenderForm,
          action: 'create'
        })
      });

      const data = await response.json();
      if (data.success) {
        setBlenderConnections([...blenderConnections, data.connection]);
        setBlenderForm({ name: '', host: '', port: 9876, apiKey: '' });
      }
    } catch (error) {
      console.error('Error saving connection:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Запуск полного пайплайна
  const runFullPipeline = async () => {
    if (!selectedProject) return;

    // 1. Сценарий
    await executeAgentTask('writer', 'write_scenario', {
      title: selectedProject.title,
      description: selectedProject.description,
      style: selectedProject.style,
      duration: selectedProject.duration
    });

    // 2. Раскадровка
    await executeAgentTask('artist', 'create_storyboard', {
      scenes: selectedProject.scenes,
      style: selectedProject.style
    });

    // 3. Озвучка (если есть диалоги)
    // await executeAgentTask('voice', 'generate_voice', {...});

    // 4. Монтаж
    await executeAgentTask('editor', 'create_edit_plan', {
      scenes: selectedProject.scenes,
      totalDuration: selectedProject.duration,
      style: selectedProject.style
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                <Wand2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">AI Animation Studio</h1>
                <p className="text-sm text-white/60">Мультиагентная анимационная студия без людей</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {AGENTS.map(agent => (
                <div
                  key={agent.role}
                  className={`p-2 rounded-lg ${agent.color} opacity-80 hover:opacity-100 transition-opacity`}
                  title={agent.name}
                >
                  <agent.icon className="w-5 h-5 text-white" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger value="projects" className="data-[state=active]:bg-white/10">
              <Film className="w-4 h-4 mr-2" />
              Проекты
            </TabsTrigger>
            <TabsTrigger value="pipeline" className="data-[state=active]:bg-white/10">
              <Play className="w-4 h-4 mr-2" />
              Пайплайн
            </TabsTrigger>
            <TabsTrigger value="agents" className="data-[state=active]:bg-white/10">
              <Bot className="w-4 h-4 mr-2" />
              Агенты
            </TabsTrigger>
            <TabsTrigger value="blender" className="data-[state=active]:bg-white/10">
              <Monitor className="w-4 h-4 mr-2" />
              Blender
            </TabsTrigger>
          </TabsList>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* New Project Form */}
              <Card className="lg:col-span-1 bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Новый проект
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    Опишите идею для мультфильма
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-white/80">Название</label>
                    <Input
                      value={newProject.title}
                      onChange={e => setNewProject({ ...newProject, title: e.target.value })}
                      placeholder="Мой первый мультфильм"
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-white/80">Описание идеи</label>
                    <Textarea
                      value={newProject.description}
                      onChange={e => setNewProject({ ...newProject, description: e.target.value })}
                      placeholder="Кот-астронавт отправляется на Луну..."
                      className="bg-white/5 border-white/10 text-white min-h-[100px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-white/80">Стиль анимации</label>
                    <Select
                      value={newProject.style}
                      onValueChange={value => setNewProject({ ...newProject, style: value })}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-white/10">
                        {ANIMATION_STYLES.map(style => (
                          <SelectItem key={style.value} value={style.value}>
                            <div>
                              <div className="font-medium">{style.label}</div>
                              <div className="text-xs text-white/60">{style.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-white/80">Длительность (секунды)</label>
                    <Input
                      type="number"
                      value={newProject.duration}
                      onChange={e => setNewProject({ ...newProject, duration: parseInt(e.target.value) || 30 })}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="useBlender"
                      checked={newProject.useBlender}
                      onChange={e => setNewProject({ ...newProject, useBlender: e.target.checked })}
                      className="rounded"
                    />
                    <label htmlFor="useBlender" className="text-sm text-white/80">
                      Использовать Blender (3D сцены)
                    </label>
                  </div>

                  <Button
                    onClick={handleCreateProject}
                    disabled={isLoading || !newProject.title || !newProject.description}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4 mr-2" />
                    )}
                    Создать проект
                  </Button>
                </CardContent>
              </Card>

              {/* Projects List */}
              <div className="lg:col-span-2 space-y-4">
                <h2 className="text-xl font-semibold text-white">Ваши проекты</h2>
                {projects.length === 0 ? (
                  <Card className="bg-white/5 border-white/10 border-dashed">
                    <CardContent className="py-12 text-center">
                      <Film className="w-12 h-12 text-white/20 mx-auto mb-4" />
                      <p className="text-white/60">Нет проектов. Создайте первый!</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {projects.map(project => (
                      <Card
                        key={project.id}
                        className={`bg-white/5 border-white/10 cursor-pointer transition-all hover:bg-white/10 ${
                          selectedProject?.id === project.id ? 'ring-2 ring-purple-500' : ''
                        }`}
                        onClick={() => {
                          setSelectedProject(project);
                          setActiveTab('pipeline');
                        }}
                      >
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-white text-lg">{project.title}</CardTitle>
                            <Badge variant={
                              project.status === 'completed' ? 'default' :
                              project.status === 'in_progress' ? 'secondary' : 'outline'
                            }>
                              {project.status}
                            </Badge>
                          </div>
                          <CardDescription className="text-white/60 line-clamp-2">
                            {project.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-4 text-sm text-white/60">
                            <span>🎨 {ANIMATION_STYLES.find(s => s.value === project.style)?.label}</span>
                            <span>⏱️ {project.duration}с</span>
                            <span>🎬 {project.scenes?.length || 0} сцен</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Pipeline Tab */}
          <TabsContent value="pipeline" className="space-y-6">
            {selectedProject ? (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Pipeline Steps */}
                <div className="lg:col-span-3 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-white">
                      Пайплайн: {selectedProject.title}
                    </h2>
                    <Button
                      onClick={runFullPipeline}
                      disabled={isLoading}
                      className="bg-gradient-to-r from-green-500 to-emerald-500"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4 mr-2" />
                      )}
                      Запустить весь пайплайн
                    </Button>
                  </div>

                  {/* Pipeline Cards */}
                  <div className="space-y-4">
                    {/* 1. Сценарий */}
                    <Card className="bg-white/5 border-white/10">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500 rounded-lg">
                              <Clapperboard className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-white">Сценарий</CardTitle>
                              <CardDescription className="text-white/60">
                                Написание сценария и диалогов
                              </CardDescription>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => executeAgentTask('writer', 'write_scenario', {
                              title: selectedProject.title,
                              description: selectedProject.description,
                              style: selectedProject.style,
                              duration: selectedProject.duration
                            })}
                            disabled={isLoading}
                            variant="outline"
                            className="border-white/20 text-white hover:bg-white/10"
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Запустить
                          </Button>
                        </div>
                      </CardHeader>
                    </Card>

                    {/* 2. Раскадровка */}
                    <Card className="bg-white/5 border-white/10">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-pink-500 rounded-lg">
                              <Palette className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-white">Раскадровка</CardTitle>
                              <CardDescription className="text-white/60">
                                Генерация изображений и раскадровка
                              </CardDescription>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => executeAgentTask('artist', 'create_storyboard', {
                              scenes: selectedProject.scenes,
                              style: selectedProject.style
                            })}
                            disabled={isLoading}
                            variant="outline"
                            className="border-white/20 text-white hover:bg-white/10"
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Запустить
                          </Button>
                        </div>
                      </CardHeader>
                    </Card>

                    {/* 3. Анимация */}
                    <Card className="bg-white/5 border-white/10">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-500 rounded-lg">
                              <Film className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-white">Анимация</CardTitle>
                              <CardDescription className="text-white/60">
                                Оживление статичных кадров
                              </CardDescription>
                            </div>
                          </div>
                          <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                            Скоро
                          </Badge>
                        </div>
                      </CardHeader>
                    </Card>

                    {/* 4. Озвучка */}
                    <Card className="bg-white/5 border-white/10">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500 rounded-lg">
                              <Mic className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-white">Озвучка</CardTitle>
                              <CardDescription className="text-white/60">
                                Генерация голосов и музыки
                              </CardDescription>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => executeAgentTask('voice', 'create_music', {
                              scene: selectedProject.description,
                              mood: 'adventure',
                              duration: selectedProject.duration
                            })}
                            disabled={isLoading}
                            variant="outline"
                            className="border-white/20 text-white hover:bg-white/10"
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Запустить
                          </Button>
                        </div>
                      </CardHeader>
                    </Card>

                    {/* 5. Монтаж */}
                    <Card className="bg-white/5 border-white/10">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-500 rounded-lg">
                              <Video className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-white">Монтаж</CardTitle>
                              <CardDescription className="text-white/60">
                                Сборка финального ролика
                              </CardDescription>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => executeAgentTask('editor', 'create_edit_plan', {
                              scenes: selectedProject.scenes,
                              totalDuration: selectedProject.duration,
                              style: selectedProject.style
                            })}
                            disabled={isLoading}
                            variant="outline"
                            className="border-white/20 text-white hover:bg-white/10"
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Запустить
                          </Button>
                        </div>
                      </CardHeader>
                    </Card>
                  </div>
                </div>

                {/* Scenes Panel */}
                <div className="lg:col-span-1">
                  <Card className="bg-white/5 border-white/10 sticky top-4">
                    <CardHeader>
                      <CardTitle className="text-white text-lg">Сцены</CardTitle>
                      <CardDescription className="text-white/60">
                        {selectedProject.scenes?.length || 0} сцен в проекте
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[400px] pr-4">
                        {selectedProject.scenes?.map((scene, index) => (
                          <div
                            key={scene.id}
                            className="p-3 bg-white/5 rounded-lg mb-2 hover:bg-white/10 cursor-pointer"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="border-purple-500 text-purple-400">
                                {scene.order}
                              </Badge>
                              <span className="text-white text-sm font-medium">
                                {scene.title}
                              </span>
                            </div>
                            <p className="text-white/60 text-xs line-clamp-2">
                              {scene.description}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-white/40">
                                ⏱️ {scene.duration}с
                              </span>
                              {scene.imageUrl && (
                                <Badge variant="outline" className="text-xs border-green-500 text-green-400">
                                  Изображение
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <Card className="bg-white/5 border-white/10">
                <CardContent className="py-12 text-center">
                  <Film className="w-12 h-12 text-white/20 mx-auto mb-4" />
                  <p className="text-white/60">Выберите проект для работы с пайплайном</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Agents Tab */}
          <TabsContent value="agents" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {AGENTS.map(agent => (
                <Card key={agent.role} className="bg-white/5 border-white/10">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`p-3 ${agent.color} rounded-xl`}>
                        <agent.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-white">{agent.name}</CardTitle>
                        <Badge variant="outline" className="border-green-500 text-green-400 mt-1">
                          Активен
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white/60 text-sm">
                      {getAgentDescription(agent.role)}
                    </p>
                    <Separator className="my-4 bg-white/10" />
                    <div className="space-y-2">
                      <h4 className="text-white/80 text-sm font-medium">Возможности:</h4>
                      <ul className="text-white/60 text-xs space-y-1">
                        {getAgentCapabilities(agent.role).map((cap, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-green-400" />
                            {cap}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Blender Tab */}
          <TabsContent value="blender" className="space-y-6">
            <Alert className="bg-cyan-500/10 border-cyan-500/30">
              <Monitor className="w-4 h-4 text-cyan-400" />
              <AlertTitle className="text-cyan-400">Интеграция с Blender</AlertTitle>
              <AlertDescription className="text-white/60">
                Подключите ваш домашний компьютер с Blender для создания 3D сцен и рендеров.
                На домашнем компьютере должен быть запущен сервер Blender.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Connection Form */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Новое подключение
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-white/80">Название</label>
                    <Input
                      value={blenderForm.name}
                      onChange={e => setBlenderForm({ ...blenderForm, name: e.target.value })}
                      placeholder="Мой компьютер"
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-white/80">IP адрес / Хост</label>
                    <Input
                      value={blenderForm.host}
                      onChange={e => setBlenderForm({ ...blenderForm, host: e.target.value })}
                      placeholder="192.168.1.100"
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-white/80">Порт</label>
                    <Input
                      type="number"
                      value={blenderForm.port}
                      onChange={e => setBlenderForm({ ...blenderForm, port: parseInt(e.target.value) || 9876 })}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-white/80">API ключ (опционально)</label>
                    <Input
                      type="password"
                      value={blenderForm.apiKey}
                      onChange={e => setBlenderForm({ ...blenderForm, apiKey: e.target.value })}
                      placeholder="secret-key"
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleTestBlenderConnection}
                      disabled={isLoading || !blenderForm.host}
                      variant="outline"
                      className="flex-1 border-white/20 text-white hover:bg-white/10"
                    >
                      Тест
                    </Button>
                    <Button
                      onClick={handleSaveBlenderConnection}
                      disabled={isLoading || !blenderForm.name || !blenderForm.host}
                      className="flex-1 bg-cyan-500 hover:bg-cyan-600"
                    >
                      Сохранить
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Saved Connections */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Сохранённые подключения</CardTitle>
                </CardHeader>
                <CardContent>
                  {blenderConnections.length === 0 ? (
                    <p className="text-white/60 text-center py-8">
                      Нет сохранённых подключений
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {blenderConnections.map(conn => (
                        <div
                          key={conn.id}
                          className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${
                              conn.status === 'connected' ? 'bg-green-500' : 'bg-red-500'
                            }`} />
                            <div>
                              <p className="text-white text-sm font-medium">{conn.name}</p>
                              <p className="text-white/60 text-xs">{conn.host}:{conn.port}</p>
                            </div>
                          </div>
                          <Badge variant={conn.status === 'connected' ? 'default' : 'outline'}>
                            {conn.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Blender Scripts Info */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Как настроить сервер Blender</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-white/60">
                  Для работы с Blender на вашем домашнем компьютере нужно запустить сервер,
                  который будет принимать команды от студии.
                </p>
                <div className="bg-black/30 rounded-lg p-4 font-mono text-sm text-white/80 overflow-x-auto">
                  <pre>{`# blender_server.py - запустите на домашнем компьютере
from http.server import HTTPServer, BaseHTTPRequestHandler
import bpy
import json

class BlenderHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        data = json.loads(self.rfile.read(content_length))
        
        # Выполняем скрипт в Blender
        exec(data['script'], {'bpy': bpy})
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(b'{"success": true}')

# Запуск на порту 9876
server = HTTPServer(('0.0.0.0', 9876), BlenderHandler)
server.serve_forever()`}</pre>
                </div>
                <p className="text-white/60 text-sm">
                  Запустите: <code className="bg-white/10 px-2 py-1 rounded">blender -b -P blender_server.py</code>
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

// Helper functions
function getAgentDescription(role: string): string {
  const descriptions: Record<string, string> = {
    producer: 'Координирует весь процесс создания, распределяет задачи между агентами',
    writer: 'Пишет сценарии, диалоги и описания сцен',
    artist: 'Создаёт концепт-арты, персонажей и раскадровки',
    animator: 'Оживляет статичные кадры в анимацию',
    voice: 'Генерирует голоса персонажей и музыку',
    editor: 'Собирает финальный ролик, накладывает эффекты',
    blender: 'Управляет Blender для создания 3D сцен'
  };
  return descriptions[role] || '';
}

function getAgentCapabilities(role: string): string[] {
  const capabilities: Record<string, string[]> = {
    producer: ['Планирование проекта', 'Создание задач', 'Контроль качества', 'Координация агентов'],
    writer: ['Написание сценариев', 'Диалоги персонажей', 'Описание сцен', 'Адаптация стиля'],
    artist: ['Концепт-арты', 'Раскадровки', 'Дизайн персонажей', 'Фоны и окружение'],
    animator: ['Анимация персонажей', 'Синхронизация губ', 'Движение камеры', 'Спецэффекты'],
    voice: ['Генерация голосов', 'Фоновая музыка', 'Звуковые эффекты', 'Эмоциональная окраска'],
    editor: ['Монтаж видео', 'Добавление аудио', 'Субтитры', 'Экспорт в различных форматах'],
    blender: ['3D моделирование', 'Настройка освещения', 'Анимация камеры', 'Рендеринг']
  };
  return capabilities[role] || [];
}
