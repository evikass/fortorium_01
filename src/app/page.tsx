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
} from '@/components/ui/dialog';
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
  Wand2,
  Users,
  Briefcase,
  UserPlus,
  MessageSquare,
  Star,
  Heart,
  Zap,
  Search
} from 'lucide-react';

// Типы
interface AgentType {
  id: string;
  name: string;
  role: string;
  description: string;
  baseSkills: string[];
  specializations: string[];
  baseCost: number;
  rarity: string;
  avatarEmoji: string;
}

interface Candidate {
  id: string;
  name: string;
  role: string;
  description: string;
  skills: string[];
  specializations: string[];
  experience: string;
  rating: number;
  salary: number;
  avatarEmoji: string;
}

interface HiredAgent {
  id: string;
  name: string;
  role: string;
  description: string;
  avatarEmoji: string;
  skills: string[];
  status: string;
  mood: number;
  energy: number;
  level: number;
  salary: number;
}

interface Project {
  id: string;
  title: string;
  description: string;
  style: string;
  duration: number;
  status: string;
}

interface Director {
  name: string;
  status: string;
  budget: number;
  reputation: number;
}

// Роли агентов
const AGENT_ROLES = [
  { value: 'writer', label: 'Сценарист', icon: '📝' },
  { value: 'artist', label: 'Художник', icon: '🎨' },
  { value: 'animator', label: 'Аниматор', icon: '🎬' },
  { value: 'voice', label: 'Озвучка', icon: '🎤' },
  { value: 'editor', label: 'Монтажёр', icon: '✂️' },
  { value: 'blender', label: 'Blender 3D', icon: '🧊' },
];

// Стили анимации
const ANIMATION_STYLES = [
  { value: 'ghibli', label: 'Studio Ghibli', description: 'Миядзаки, акварель, магия' },
  { value: 'disney', label: 'Disney 2D', description: 'Классическая диснеевская анимация' },
  { value: 'pixar', label: 'Pixar 3D', description: 'Современный 3D, кинематографичность' },
  { value: 'anime', label: 'Anime', description: 'Японская анимация, яркие цвета' },
  { value: 'cartoon', label: 'Modern Cartoon', description: 'Современный мульт, яркий и весёлый' },
];

export default function AnimationStudio() {
  // Состояния
  const [activeTab, setActiveTab] = useState('studio');
  const [isLoading, setIsLoading] = useState(false);
  
  // Данные студии
  const [director, setDirector] = useState<Director>({ name: 'Директор', status: 'active', budget: 0, reputation: 50 });
  const [hiredAgents, setHiredAgents] = useState<HiredAgent[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [agentTypes, setAgentTypes] = useState<AgentType[]>([]);
  
  // Кандидаты на утверждение
  const [pendingCandidates, setPendingCandidates] = useState<Candidate[]>([]);
  const [actionMessage, setActionMessage] = useState<string>('');
  
  // Директор
  const [directorReport, setDirectorReport] = useState<string>('');
  const [directorAnalysis, setDirectorAnalysis] = useState<any>(null);
  
  // Работа агентов
  const [workProgress, setWorkProgress] = useState<string>('');
  const [workResult, setWorkResult] = useState<any>(null);
  const [script, setScript] = useState<any>(null);
  const [storyboard, setStoryboard] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  
  // Модальные окна
  const [showHireDialog, setShowHireDialog] = useState(false);
  const [showCandidateDialog, setShowCandidateDialog] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  // Форма нового проекта
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    style: 'disney',
    duration: 30,
  });

  // Форма поиска кандидатов
  const [vacancyForm, setVacancyForm] = useState({
    role: 'writer',
    title: '',
    requiredSkills: '',
    experienceLevel: 'any'
  });

  // Загрузка данных
  const fetchStudioData = useCallback(async () => {
    try {
      // Загружаем нанятых агентов
      const agentsRes = await fetch('/api/agents/hire');
      if (agentsRes.ok) {
        const data = await agentsRes.json();
        if (data.success) {
          setHiredAgents(data.agents.map((a: any) => ({
            ...a,
            skills: typeof a.skills === 'string' ? JSON.parse(a.skills) : a.skills
          })));
        }
      }
    } catch (error) {
      console.error('Error fetching studio data:', error);
    }
  }, []);

  const fetchDirectorReport = useCallback(async () => {
    try {
      const res = await fetch('/api/director');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setDirectorReport(data.report);
          setDirectorAnalysis(data.analysis);
          setDirector(prev => ({ ...prev, status: data.director?.status || 'active' }));
        }
      }
    } catch (error) {
      console.error('Error fetching director report:', error);
    }
  }, []);

  // Загрузка выполненных задач
  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch('/api/work');
      const data = await res.json();
      if (data.success) {
        setTasks(data.tasks);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  }, []);

  // Запуск полного пайплайна производства
  const runProduction = async (projectId: string) => {
    setIsLoading(true);
    setWorkProgress('🚀 Запускаем производство...');
    setWorkResult(null);
    
    try {
      const res = await fetch('/api/work', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'run_full_pipeline',
          projectId
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        setWorkProgress('');
        setWorkResult(data.results);
        
        if (data.results.script) {
          setScript(data.results.script);
        }
        if (data.results.storyboard) {
          setStoryboard(data.results.storyboard);
        }
        
        fetchTasks();
        fetchDirectorReport();
      } else {
        setWorkProgress(`❌ Ошибка: ${data.error}`);
      }
    } catch (error) {
      setWorkProgress(`❌ Ошибка: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Запуск сценариста
  const runWriter = async () => {
    if (!newProject.title || !newProject.description) {
      alert('Сначала создайте проект или заполните название и описание');
      return;
    }
    
    setIsLoading(true);
    setWorkProgress('✍️ Сценарист работает...');
    
    try {
      // Сначала создаём проект если его нет
      let projectId = projects[0]?.id;
      
      if (!projectId) {
        const createRes = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newProject)
        });
        const createData = await createRes.json();
        if (createData.success) {
          projectId = createData.project.id;
          setProjects([createData.project, ...projects]);
        }
      }
      
      const res = await fetch('/api/work', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'write_script',
          projectId
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        setWorkProgress(`✅ ${data.message}`);
        setScript(data.script);
        setWorkResult({
          ...workResult,
          agents: {
            ...workResult?.agents,
            writer: data.virtualAgent ? 'AI-Сценарист' : (data.task?.agent?.name || 'AI-Сценарист')
          }
        });
        fetchTasks();
      } else {
        setWorkProgress(`❌ ${data.error}`);
      }
    } catch (error) {
      setWorkProgress(`❌ Ошибка: ${error}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setWorkProgress(''), 3000);
    }
  };

  // Запуск художника
  const runArtist = async () => {
    if (!script?.scenes?.[0]) {
      alert('Сначала нужен сценарий!');
      return;
    }
    
    setIsLoading(true);
    setWorkProgress('🎨 Художник создаёт раскадровку...');
    
    try {
      const firstScene = script.scenes[0];
      
      const res = await fetch('/api/work', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_storyboard',
          projectId: projects[0]?.id || 'default',
          data: {
            sceneTitle: firstScene.title,
            sceneDescription: firstScene.description,
            style: newProject.style
          }
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        setWorkProgress(`✅ ${data.message}`);
        setStoryboard(data.image);
        fetchTasks();
      } else {
        setWorkProgress(`❌ ${data.error}`);
      }
    } catch (error) {
      setWorkProgress(`❌ Ошибка: ${error}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setWorkProgress(''), 3000);
    }
  };

  useEffect(() => {
    fetchStudioData();
    fetchDirectorReport();
    fetchPendingCandidates();
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Загрузка кандидатов на утверждение
  const fetchPendingCandidates = async () => {
    try {
      const res = await fetch('/api/candidates');
      const data = await res.json();
      if (data.success) {
        setPendingCandidates(data.candidates);
      }
    } catch (error) {
      console.error('Error fetching pending candidates:', error);
    }
  };

  // Утвердить кандидата
  const approveCandidate = async (candidateId: string) => {
    setIsLoading(true);
    setActionMessage('');
    try {
      const res = await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId, action: 'approve' })
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(data.message);
        setPendingCandidates(prev => prev.filter(c => c.id !== candidateId));
        if (data.agent) {
          setHiredAgents(prev => [...prev, { ...data.agent, avatarEmoji: '🤖', level: 1, description: '' }]);
        }
        setTimeout(() => setActionMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error approving candidate:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Отклонить кандидата
  const rejectCandidate = async (candidateId: string) => {
    setIsLoading(true);
    setActionMessage('');
    try {
      const res = await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId, action: 'reject' })
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(data.message);
        setPendingCandidates(prev => prev.filter(c => c.id !== candidateId));
        if (data.newCandidate) {
          setPendingCandidates(prev => [...prev, data.newCandidate]);
        }
        setTimeout(() => setActionMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error rejecting candidate:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Инициализация БД
  const initDatabase = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/init-db');
      const data = await res.json();
      if (data.success) {
        alert('✅ База данных инициализирована!');
        fetchStudioData();
      } else {
        alert('❌ Ошибка: ' + data.error);
      }
    } catch (error) {
      alert('❌ Ошибка инициализации');
    } finally {
      setIsLoading(false);
    }
  };

  // Создание проекта
  const createProject = async () => {
    if (!newProject.title || !newProject.description) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProject)
      });

      const data = await res.json();
      if (data.success) {
        setProjects([data.project, ...projects]);
        setNewProject({ title: '', description: '', style: 'disney', duration: 30 });
        setActiveTab('team');
      }
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Поиск кандидатов
  const searchCandidates = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/hr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'find_candidates',
          role: vacancyForm.role,
          title: vacancyForm.title || `Специалист ${vacancyForm.role}`,
          requiredSkills: vacancyForm.requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
          experienceLevel: vacancyForm.experienceLevel
        })
      });

      const data = await res.json();
      if (data.success) {
        setCandidates(data.candidates);
        setShowHireDialog(false);
        setShowCandidateDialog(true);
      }
    } catch (error) {
      console.error('Error searching candidates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Наем кандидата
  const hireCandidate = async (candidate: Candidate) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/agents/hire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: candidate.name,
          role: candidate.role,
          description: candidate.description,
          skills: candidate.skills,
          specializations: candidate.specializations,
          salary: candidate.salary,
          avatarEmoji: candidate.avatarEmoji
        })
      });

      const data = await res.json();
      if (data.success) {
        setHiredAgents([...hiredAgents, data.agent]);
        setCandidates(candidates.filter(c => c.id !== candidate.id));
        setSelectedCandidate(null);
        setShowCandidateDialog(false);
        fetchStudioData();
      }
    } catch (error) {
      console.error('Error hiring candidate:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Увольнение агента
  const fireAgent = async (agentId: string) => {
    if (!confirm('Уволить этого агента?')) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/agents/hire?agentId=${agentId}`, {
        method: 'DELETE'
      });

      const data = await res.json();
      if (data.success) {
        setHiredAgents(hiredAgents.filter(a => a.id !== agentId));
      }
    } catch (error) {
      console.error('Error firing agent:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Получить цвет статуса
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'idle':
        return 'bg-green-500';
      case 'busy':
      case 'working':
        return 'bg-yellow-500';
      case 'error':
      case 'tired':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Получить цвет настроения
  const getMoodColor = (mood: number) => {
    if (mood >= 70) return 'text-green-500';
    if (mood >= 40) return 'text-yellow-500';
    return 'text-red-500';
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
                <h1 className="text-2xl font-bold text-white tracking-wider">ФОРТОРИУМ</h1>
                <p className="text-sm text-white/60">Анимационная студия будущего</p>
              </div>
            </div>

            {/* Studio Stats */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg">
                <span className="text-lg">👔</span>
                <span className="text-white text-sm font-medium">{director.status === 'active' ? 'Директор онлайн' : 'Директор занят'}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg">
                <span className="text-lg">🎬</span>
                <span className="text-white text-sm font-medium">{projects.length} проектов</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg">
                <span className="text-lg">⭐</span>
                <span className="text-white text-sm font-medium">{director.reputation}%</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg">
                <span className="text-lg">👥</span>
                <span className="text-white text-sm font-medium">{hiredAgents.length} агентов</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger value="studio" className="data-[state=active]:bg-white/10">
              <span className="mr-2">🏢</span> Студия
            </TabsTrigger>
            <TabsTrigger value="team" className="data-[state=active]:bg-white/10">
              <Users className="w-4 h-4 mr-2" /> Команда
            </TabsTrigger>
            <TabsTrigger value="hr" className="data-[state=active]:bg-white/10">
              <UserPlus className="w-4 h-4 mr-2" /> HR Отдел
            </TabsTrigger>
            <TabsTrigger value="projects" className="data-[state=active]:bg-white/10">
              <Film className="w-4 h-4 mr-2" /> Проекты
            </TabsTrigger>
          </TabsList>

          {/* Studio Tab */}
          <TabsContent value="studio" className="space-y-6">
            {/* Director Card */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center text-3xl">
                    👔
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-white text-xl">Директор ФОРТОРИУМ</CardTitle>
                      <Badge className={`${director.status === 'hiring' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'bg-green-500/20 text-green-400 border-green-500/30'}`}>
                        {director.status === 'hiring' ? 'Ищет специалистов' : director.status === 'active' ? 'Управляет' : 'Онлайн'}
                      </Badge>
                    </div>
                    <CardDescription className="text-white/60">
                      AI-директор координирует работу студии
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={initDatabase}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Инициализировать БД
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="p-3 bg-white/5 rounded-lg">
                    <div className="text-white/60 text-sm">Проектов</div>
                    <div className="text-white text-2xl font-bold">{projects.length}</div>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg">
                    <div className="text-white/60 text-sm">Репутация</div>
                    <div className="text-white text-2xl font-bold">{director.reputation}%</div>
                    <Progress value={director.reputation} className="mt-2 h-1" />
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg">
                    <div className="text-white/60 text-sm">Команда</div>
                    <div className="text-white text-2xl font-bold">{hiredAgents.length} чел.</div>
                  </div>
                </div>

                {/* Director Analysis */}
                {directorAnalysis && (
                  <div className="space-y-4">
                    {/* Decisions */}
                    {directorAnalysis.decisions?.length > 0 && (
                      <div className="p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-lg border border-amber-500/20">
                        <h4 className="text-amber-400 font-medium mb-2 flex items-center gap-2">
                          🎯 Решения директора
                        </h4>
                        <div className="space-y-1">
                          {directorAnalysis.decisions.map((d: string, i: number) => (
                            <p key={i} className="text-white/80 text-sm">{d}</p>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recommendations */}
                    {directorAnalysis.recommendations?.length > 0 && (
                      <div className="p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg border border-blue-500/20">
                        <h4 className="text-blue-400 font-medium mb-2 flex items-center gap-2">
                          💡 Рекомендации
                        </h4>
                        <div className="space-y-1">
                          {directorAnalysis.recommendations.map((r: string, i: number) => (
                            <p key={i} className="text-white/80 text-sm">• {r}</p>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Missing Roles */}
                    {directorAnalysis.teamAnalysis?.missingRoles?.length > 0 && (
                      <div className="p-4 bg-white/5 rounded-lg">
                        <h4 className="text-white/80 font-medium mb-2">⚠️ Не хватает специалистов:</h4>
                        <div className="flex flex-wrap gap-2">
                          {directorAnalysis.teamAnalysis.missingRoles.map((r: any, i: number) => (
                            <Badge key={i} variant="outline" className="border-red-500/30 text-red-400">
                              {r.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Next Action */}
                    {directorAnalysis.nextAction && (
                      <div className="flex items-center gap-3 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                        <span className="text-2xl">🎮</span>
                        <div>
                          <span className="text-purple-400 font-medium">Следующий шаг: </span>
                          <span className="text-white/80">
                            {directorAnalysis.nextAction === 'review_candidates' 
                              ? 'Рассмотреть кандидатов на утверждение' 
                              : directorAnalysis.nextAction.startsWith('hire_') 
                                ? `Нанять ${directorAnalysis.nextAction.replace('hire_', '')}` 
                                : 'Создать новый проект'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Full Report */}
                {directorReport && (
                  <div className="mt-4 p-4 bg-white/5 rounded-lg">
                    <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Полный отчёт
                    </h4>
                    <pre className="text-white/70 text-sm whitespace-pre-wrap font-sans">{directorReport}</pre>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-white/5 border-white/10 hover:bg-white/10 cursor-pointer transition-colors" onClick={() => setActiveTab('hr')}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center text-2xl">
                      🤝
                    </div>
                    <div>
                      <h3 className="text-white font-medium">HR Отдел</h3>
                      <p className="text-white/60 text-sm">Найм новых агентов</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10 hover:bg-white/10 cursor-pointer transition-colors" onClick={() => setActiveTab('team')}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center text-2xl">
                      👥
                    </div>
                    <div>
                      <h3 className="text-white font-medium">Команда</h3>
                      <p className="text-white/60 text-sm">{hiredAgents.length} агентов</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10 hover:bg-white/10 cursor-pointer transition-colors" onClick={() => setActiveTab('projects')}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-pink-500/20 flex items-center justify-center text-2xl">
                      🎬
                    </div>
                    <div>
                      <h3 className="text-white font-medium">Проекты</h3>
                      <p className="text-white/60 text-sm">{projects.length} проектов</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Pending Candidates - Кандидаты на утверждение */}
            {pendingCandidates.length > 0 && (
              <Card className="bg-white/5 border-white/10 border-2 border-amber-500/30">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 flex items-center justify-center text-2xl">
                      📋
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-white text-lg">Кандидаты на утверждение</CardTitle>
                      <CardDescription className="text-white/60">
                        HR нашёл {pendingCandidates.length} кандидатов. Примите решение.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {actionMessage && (
                    <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-sm">
                      {actionMessage}
                    </div>
                  )}
                  <div className="space-y-3">
                    {pendingCandidates.map(candidate => (
                      <div key={candidate.id} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
                        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-xl">
                          {candidate.avatarEmoji}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium">{candidate.name}</span>
                            <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-400">
                              {candidate.role}
                            </Badge>
                            <span className="text-yellow-400 text-xs flex items-center gap-1">
                              <Star className="w-3 h-3" /> {candidate.rating}
                            </span>
                          </div>
                          <div className="text-white/60 text-xs">{candidate.description}</div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => approveCandidate(candidate.id)}
                            disabled={isLoading}
                            className="bg-green-500 hover:bg-green-600 text-white"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Принять
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => rejectCandidate(candidate.id)}
                            disabled={isLoading}
                            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Отклонить
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* New Project Form */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Создать новый проект
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-white/80">Название</label>
                    <Input
                      value={newProject.title}
                      onChange={e => setNewProject({ ...newProject, title: e.target.value })}
                      placeholder="Мой мультфильм"
                      className="bg-white/5 border-white/10 text-white"
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
                            {style.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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

                <div className="flex justify-end gap-2 flex-wrap">
                  <Button
                    onClick={runWriter}
                    disabled={isLoading || !newProject.title || !newProject.description}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    ✍️ Сценарий
                  </Button>
                  <Button
                    onClick={async () => {
                      if (!newProject.title || !newProject.description) return;
                      setIsLoading(true);
                      setWorkProgress('🚀 Создаём проект и запускаем производство...');
                      
                      try {
                        // Создаём проект
                        const createRes = await fetch('/api/projects', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(newProject)
                        });
                        const createData = await createRes.json();
                        
                        if (createData.success) {
                          const projectId = createData.project.id;
                          setProjects([createData.project, ...projects]);
                          
                          // Запускаем полный пайплайн
                          setWorkProgress('✍️ Сценарист пишет сценарий...');
                          
                          const workRes = await fetch('/api/work', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              action: 'run_full_pipeline',
                              projectId
                            })
                          });
                          
                          const workData = await workRes.json();
                          
                          if (workData.success) {
                            setWorkProgress('✅ Производство завершено!');
                            setWorkResult(workData.results);
                            
                            if (workData.results.script) {
                              setScript(workData.results.script);
                            }
                            if (workData.results.storyboard) {
                              setStoryboard(workData.results.storyboard);
                            }
                            
                            fetchTasks();
                            fetchDirectorReport();
                          } else {
                            setWorkProgress(`❌ Ошибка: ${workData.error}`);
                          }
                        }
                      } catch (error) {
                        setWorkProgress(`❌ Ошибка: ${error}`);
                      } finally {
                        setIsLoading(false);
                        setTimeout(() => setWorkProgress(''), 5000);
                      }
                    }}
                    disabled={isLoading || !newProject.title || !newProject.description}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                    Запустить производство
                  </Button>
                  <Button
                    onClick={createProject}
                    disabled={isLoading || !newProject.title || !newProject.description}
                    className="bg-gradient-to-r from-purple-500 to-pink-500"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                    Создать проект
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Production Section - Работа агентов */}
            {(workProgress || script || storyboard || tasks.length > 0) && (
              <Card className="bg-white/5 border-white/10 border-2 border-green-500/30">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20 flex items-center justify-center text-2xl">
                      🎬
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-white text-lg">Производство</CardTitle>
                      <CardDescription className="text-white/60">
                        Результаты работы AI-агентов
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progress */}
                  {workProgress && (
                    <div className="p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 text-sm flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {workProgress}
                    </div>
                  )}

                  {/* Script Result */}
                  {script && (
                    <div className="p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-lg border border-amber-500/20">
                      <h4 className="text-amber-400 font-medium mb-3 flex items-center gap-2">
                        ✍️ Сценарий: {script.title}
                        {workResult?.agents?.writer && (
                          <span className="text-white/50 text-xs font-normal">
                            от {workResult.agents.writer}
                          </span>
                        )}
                      </h4>
                      <p className="text-white/80 text-sm mb-3">{script.logline}</p>
                      
                      {/* Characters */}
                      {script.characters?.length > 0 && (
                        <div className="mb-3">
                          <h5 className="text-white/60 text-xs mb-2">Персонажи:</h5>
                          <div className="flex flex-wrap gap-2">
                            {script.characters.map((c: any, i: number) => (
                              <Badge key={i} variant="outline" className="border-amber-500/30 text-amber-300">
                                {c.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Scenes */}
                      {script.scenes?.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="text-white/60 text-xs">Сцены ({script.scenes.length}):</h5>
                          {script.scenes.map((scene: any, i: number) => (
                            <div key={i} className="p-2 bg-white/5 rounded text-xs">
                              <span className="text-white font-medium">Сцена {scene.number}:</span>{' '}
                              <span className="text-white/70">{scene.title}</span>
                              <span className="text-white/50 ml-2">({scene.duration}с)</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="mt-3 text-white/50 text-xs">
                        Общая длительность: {script.totalDuration}с | Настроение: {script.mood}
                      </div>
                    </div>
                  )}

                  {/* Storyboard Result */}
                  {storyboard && (
                    <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
                      <h4 className="text-purple-400 font-medium mb-3 flex items-center gap-2">
                        🎨 Раскадровка
                        {workResult?.agents?.artist && (
                          <span className="text-white/50 text-xs font-normal">
                            от {workResult.agents.artist}
                          </span>
                        )}
                      </h4>
                      {storyboard.imageUrl ? (
                        <img 
                          src={storyboard.imageUrl} 
                          alt="Раскадровка" 
                          className="w-full rounded-lg border border-white/10"
                        />
                      ) : (
                        <div className="p-8 bg-white/5 rounded-lg border border-white/10 text-center">
                          <span className="text-4xl">🖼️</span>
                          <p className="text-white/60 text-sm mt-2">Изображение генерируется...</p>
                          <p className="text-white/40 text-xs mt-1">{storyboard.prompt?.substring(0, 100)}...</p>
                        </div>
                      )}
                      {storyboard.prompt && (
                        <p className="text-white/50 text-xs mt-2">Prompt: {storyboard.prompt}</p>
                      )}
                    </div>
                  )}

                  {/* Animation Plan */}
                  {workResult?.animation && (
                    <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg border border-cyan-500/20">
                      <h4 className="text-cyan-400 font-medium mb-3 flex items-center gap-2">
                        🎬 План анимации
                        {workResult?.agents?.animator && (
                          <span className="text-white/50 text-xs font-normal">
                            от {workResult.agents.animator}
                          </span>
                        )}
                      </h4>
                      <p className="text-white/70 text-sm mb-2">Стиль: {workResult.animation.animationStyle}</p>
                      <p className="text-white/70 text-sm mb-2">Длительность: {workResult.animation.totalDuration}с</p>
                      
                      {workResult.animation.scenes?.length > 0 && (
                        <div className="space-y-2">
                          {workResult.animation.scenes.map((s: any, i: number) => (
                            <div key={i} className="p-2 bg-white/5 rounded text-xs">
                              <span className="text-white font-medium">Сцена {s.sceneNumber}:</span>{' '}
                              <span className="text-cyan-300">{s.animation?.cameraMovement}</span>
                              <span className="text-white/40 ml-2">({s.animation?.timing?.start}s - {s.animation?.timing?.end}s)</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Agents Work Summary */}
                  {workResult?.agents && (
                    <div className="p-3 bg-white/5 rounded-lg">
                      <h5 className="text-white/60 text-xs mb-2">👥 Работали над проектом:</h5>
                      <div className="flex flex-wrap gap-2">
                        {workResult.agents.writer && (
                          <Badge variant="outline" className="border-amber-500/30 text-amber-300">
                            ✍️ {workResult.agents.writer}
                          </Badge>
                        )}
                        {workResult.agents.artist && (
                          <Badge variant="outline" className="border-purple-500/30 text-purple-300">
                            🎨 {workResult.agents.artist}
                          </Badge>
                        )}
                        {workResult.agents.animator && (
                          <Badge variant="outline" className="border-cyan-500/30 text-cyan-300">
                            🎬 {workResult.agents.animator}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tasks History */}
                  {tasks.length > 0 && (
                    <div>
                      <h5 className="text-white/60 text-xs mb-2">Последние задачи:</h5>
                      <div className="space-y-1">
                        {tasks.slice(0, 5).map((task, i) => (
                          <div key={i} className="flex items-center gap-2 p-2 bg-white/5 rounded text-xs">
                            <Badge className={task.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}>
                              {task.status}
                            </Badge>
                            <span className="text-white/80">{task.title}</span>
                            <span className="text-white/40 ml-auto">{task.agent?.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Нанятые агенты ({hiredAgents.length})</h2>
              <Button onClick={() => { setShowHireDialog(true); }} className="bg-gradient-to-r from-blue-500 to-cyan-500">
                <UserPlus className="w-4 h-4 mr-2" />
                Нанять агента
              </Button>
            </div>

            {hiredAgents.length === 0 ? (
              <Card className="bg-white/5 border-white/10 border-dashed">
                <CardContent className="py-12 text-center">
                  <Users className="w-12 h-12 text-white/20 mx-auto mb-4" />
                  <p className="text-white/60 mb-4">Команда пуста. Нанмите первых агентов!</p>
                  <Button onClick={() => { setShowHireDialog(true); }} className="bg-gradient-to-r from-blue-500 to-cyan-500">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Найти кандидатов
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {hiredAgents.map(agent => (
                  <Card key={agent.id} className="bg-white/5 border-white/10">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 flex items-center justify-center text-2xl">
                          {agent.avatarEmoji}
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-white text-base">{agent.name}</CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge className={`text-xs ${getStatusColor(agent.status)}`}>
                              {agent.status}
                            </Badge>
                            <span className="text-white/60 text-xs">Ур. {agent.level}</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => fireAgent(agent.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-white/60 text-sm mb-3">{agent.description}</p>
                      
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="p-2 bg-white/5 rounded">
                          <div className="text-white/60 text-xs flex items-center gap-1">
                            <Heart className="w-3 h-3" /> Настроение
                          </div>
                          <div className={`text-sm font-medium ${getMoodColor(agent.mood)}`}>
                            {agent.mood}%
                          </div>
                          <Progress value={agent.mood} className="mt-1 h-1" />
                        </div>
                        <div className="p-2 bg-white/5 rounded">
                          <div className="text-white/60 text-xs flex items-center gap-1">
                            <Zap className="w-3 h-3" /> Энергия
                          </div>
                          <div className="text-sm font-medium text-white">
                            {agent.energy}%
                          </div>
                          <Progress value={agent.energy} className="mt-1 h-1" />
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {agent.skills.slice(0, 3).map((skill, i) => (
                          <Badge key={i} variant="outline" className="text-xs border-white/20 text-white/60">
                            {skill}
                          </Badge>
                        ))}
                      </div>

                      <div className="mt-3 pt-3 border-t border-white/10 flex justify-between items-center">
                        <span className="text-white/60 text-sm">Зарплата: ${agent.salary}</span>
                        <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                          <MessageSquare className="w-3 h-3 mr-1" />
                          Задача
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* HR Tab */}
          <TabsContent value="hr" className="space-y-6">
            {/* HR Manager Card */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-3xl">
                    🤝
                  </div>
                  <div>
                    <CardTitle className="text-white text-xl">HR Менеджер</CardTitle>
                    <CardDescription className="text-white/60">
                      Поиск и наём специалистов для студии
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Vacancy Form */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Создать вакансию
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-white/80">Роль</label>
                    <Select
                      value={vacancyForm.role}
                      onValueChange={value => setVacancyForm({ ...vacancyForm, role: value })}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-white/10">
                        {AGENT_ROLES.map(role => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.icon} {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-white/80">Уровень опыта</label>
                    <Select
                      value={vacancyForm.experienceLevel}
                      onValueChange={value => setVacancyForm({ ...vacancyForm, experienceLevel: value })}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-white/10">
                        <SelectItem value="any">Любой</SelectItem>
                        <SelectItem value="junior">Junior</SelectItem>
                        <SelectItem value="middle">Middle</SelectItem>
                        <SelectItem value="senior">Senior</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-white/80">Требуемые навыки (через запятую)</label>
                  <Input
                    value={vacancyForm.requiredSkills}
                    onChange={e => setVacancyForm({ ...vacancyForm, requiredSkills: e.target.value })}
                    placeholder="комедия, диалоги, сюжет"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>

                <Button
                  onClick={searchCandidates}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                  Найти кандидатов
                </Button>
              </CardContent>
            </Card>

            {/* Candidates */}
            {candidates.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Найденные кандидаты ({candidates.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {candidates.map(candidate => (
                    <Card key={candidate.id} className="bg-white/5 border-white/10">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20 flex items-center justify-center text-2xl">
                            {candidate.avatarEmoji}
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-white text-base">{candidate.name}</CardTitle>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-400">
                                {candidate.role}
                              </Badge>
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-400" />
                                <span className="text-white/60 text-xs">{candidate.rating}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-white/60 text-sm mb-3">{candidate.description}</p>
                        
                        <div className="mb-3">
                          <div className="text-white/60 text-xs mb-1">Навыки:</div>
                          <div className="flex flex-wrap gap-1">
                            {candidate.skills.map((skill, i) => (
                              <Badge key={i} variant="outline" className="text-xs border-white/20 text-white/60">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="mb-3">
                          <div className="text-white/60 text-xs mb-1">Опыт:</div>
                          <p className="text-white/80 text-sm">{candidate.experience}</p>
                        </div>

                        <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                          <span className="text-white/60 text-sm">Зарплата: ${candidate.salary}</span>
                          <Button
                            onClick={() => hireCandidate(candidate)}
                            size="sm"
                            className="bg-gradient-to-r from-green-500 to-emerald-500"
                          >
                            <UserPlus className="w-3 h-3 mr-1" />
                            Нанять
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Проекты студии</h2>
              <Button onClick={() => setActiveTab('studio')} className="bg-gradient-to-r from-purple-500 to-pink-500">
                <Plus className="w-4 h-4 mr-2" />
                Новый проект
              </Button>
            </div>

            {projects.length === 0 ? (
              <Card className="bg-white/5 border-white/10 border-dashed">
                <CardContent className="py-12 text-center">
                  <Film className="w-12 h-12 text-white/20 mx-auto mb-4" />
                  <p className="text-white/60 mb-4">Нет активных проектов</p>
                  <Button onClick={() => setActiveTab('studio')} className="bg-gradient-to-r from-purple-500 to-pink-500">
                    <Plus className="w-4 h-4 mr-2" />
                    Создать первый проект
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {projects.map(project => (
                  <Card key={project.id} className="bg-white/5 border-white/10">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-white">{project.title}</CardTitle>
                          <CardDescription className="text-white/60">{project.description}</CardDescription>
                        </div>
                        <Badge className={
                          project.status === 'completed' ? 'bg-green-500' :
                          project.status === 'in_progress' ? 'bg-yellow-500' : 'bg-gray-500'
                        }>
                          {project.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-white/60">
                        <span>🎨 {ANIMATION_STYLES.find(s => s.value === project.style)?.label}</span>
                        <span>⏱️ {project.duration}с</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Hire Dialog */}
      <Dialog open={showHireDialog} onOpenChange={setShowHireDialog}>
        <DialogContent className="bg-slate-900 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Найм нового агента
            </DialogTitle>
            <DialogDescription className="text-white/60">
              Создайте вакансию, и HR найдёт подходящих кандидатов
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm text-white/80">Роль</label>
              <Select
                value={vacancyForm.role}
                onValueChange={value => setVacancyForm({ ...vacancyForm, role: value })}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/10">
                  {AGENT_ROLES.map(role => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.icon} {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/80">Требуемые навыки</label>
              <Input
                value={vacancyForm.requiredSkills}
                onChange={e => setVacancyForm({ ...vacancyForm, requiredSkills: e.target.value })}
                placeholder="комедия, диалоги..."
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowHireDialog(false)} className="border-white/20 text-white">
              Отмена
            </Button>
            <Button onClick={searchCandidates} disabled={isLoading} className="bg-gradient-to-r from-blue-500 to-cyan-500">
              {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Найти кандидатов
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Candidate Dialog */}
      <Dialog open={showCandidateDialog} onOpenChange={setShowCandidateDialog}>
        <DialogContent className="bg-slate-900 border-white/10 max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Users className="w-5 h-5" />
              Найденные кандидаты
            </DialogTitle>
            <DialogDescription className="text-white/60">
              Выберите кандидата для найма в команду
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 max-h-[60vh] overflow-y-auto">
            {candidates.map(candidate => (
              <Card key={candidate.id} className="bg-white/5 border-white/10">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-xl">
                      {candidate.avatarEmoji}
                    </div>
                    <div>
                      <div className="text-white font-medium">{candidate.name}</div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{candidate.role}</Badge>
                        <span className="text-yellow-400 text-xs flex items-center gap-1">
                          <Star className="w-3 h-3" /> {candidate.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-white/60 text-sm mb-2">{candidate.description}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {candidate.skills.slice(0, 3).map((skill, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{skill}</Badge>
                    ))}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60 text-sm">${candidate.salary}</span>
                    <Button size="sm" onClick={() => hireCandidate(candidate)} className="bg-green-500 hover:bg-green-600">
                      Нанять
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="text-center py-6 text-white/40 text-sm">
        ФОРТОРИУМ © 2024 | 
        <a href="https://github.com/evikass/fortorium_01" className="text-purple-400 hover:underline ml-1">GitHub</a>
      </footer>
    </div>
  );
}

