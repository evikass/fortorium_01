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
import { useToast } from '@/hooks/use-toast';
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
  Search,
  Volume2
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
  const { toast } = useToast();
  
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
  
  // Изображения для всех сцен
  const [sceneImages, setSceneImages] = useState<Record<number, any>>({});
  const [generatingScene, setGeneratingScene] = useState<number | null>(null);
  
  // Озвучка
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(false);
  
  // Видео
  const [generatingVideo, setGeneratingVideo] = useState(false);
  const [projectVideo, setProjectVideo] = useState<string | null>(null);
  
  // Проекты для сохранения
  const [savedProjects, setSavedProjects] = useState<any[]>([]);
  
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

  // ============================================
  // ДЕМО-РЕЖИМ
  // ============================================
  const loadDemoProject = () => {
    const demoScript = {
      title: "Кот-астронавт",
      logline: "Отважный кот по имени Мурзик мечтает полететь на Луну и находит неожиданного союзника в лице мудрой совы.",
      mood: "Вдохновляющий и весёлый",
      characters: [
        { name: "Мурзик", description: "Отважный рыжий кот с большими мечтами", traits: ["смелый", "любознательный", "находчивый"] },
        { name: "Сова Афина", description: "Мудрая наставница с секретами космоса", traits: ["мудрая", "загадочная", "добрая"] },
        { name: "Космический Мышь", description: "Весёлый помощник на станции", traits: ["забавный", "технически подкованный"] }
      ],
      scenes: [
        {
          number: 1,
          title: "Мечты под звёздами",
          location: "Крыша дома Мурзика",
          description: "Ночной сад, яркие звёзды. Мурзик смотрит на Луну с крыши своего дома, мечтая о космическом путешествии.",
          dialogue: [
            { character: "Мурзик", line: "Однажды я полечу туда... к этим сверкающим огням!" },
            { character: "Мурзик", line: "Каждый шаг приближает меня к мечте." }
          ],
          action: "Кот смотрит на звёздное небо, его глаза полны решимости. Камера плавно поднимается к Луне.",
          duration: 8
        },
        {
          number: 2,
          title: "Мудрый совет",
          location: "Старый дуб в парке",
          description: "Мурзик встречает Сову Афину, которая рассказывает ему о секретном космическом проекте.",
          dialogue: [
            { character: "Сова Афина", line: "Я вижу в твоих глазах огонь, юный путешественник." },
            { character: "Мурзик", line: "Я мечтаю полететь на Луну! Но как?" },
            { character: "Сова Афина", line: "Есть место... Космическая станция на холме. Они ищут смельчаков." }
          ],
          action: "Сова таинственно перебирает перья, свет луны создаёт магическую атмосферу.",
          duration: 10
        },
        {
          number: 3,
          title: "Космическая тренировка",
          location: "Секретная космическая станция",
          description: "Мурзик проходит необычные тренировки с Космическим Мышью.",
          dialogue: [
            { character: "Космический Мышь", line: "Добро пожаловать, кадет! Готов к невесомости?" },
            { character: "Мурзик", line: "Это невероятно! Я готов ко всему!" },
            { character: "Космический Мышь", line: "Тогда пристегни усы - мы взлетаем!" }
          ],
          action: "Смешные сцены тренировок в невесомости, кот пытается поймать летающие игрушки.",
          duration: 8
        },
        {
          number: 4,
          title: "Путь к звёздам",
          location: "В космосе / Луна",
          description: "Мурзик в скафандре смотрит на Землю из иллюминатора, затем ступает на поверхность Луны.",
          dialogue: [
            { character: "Мурзик", line: "Смотри, Афина! Я сделал это! Я на Луне!" },
            { character: "Мурзик", line: "Мечты сбываются, если верить и действовать!" }
          ],
          action: "Эпичный кадр кота на Луне с Землёй на горизонте. Медленные прыжки в низкой гравитации.",
          duration: 6
        }
      ],
      totalDuration: 32
    };

    setNewProject({
      title: "Кот-астронавт",
      description: "Отважный кот мечтает полететь на Луну и находит неожиданных друзей",
      style: 'pixar',
      duration: 32
    });
    
    setScript(demoScript);
    setWorkResult({
      agents: {
        writer: 'AI-Сценарист',
        artist: null,
        animator: null
      }
    });
    
    setSceneImages({});
    setStoryboard(null);
  };

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
      toast({
        title: "⚠️ Внимание",
        description: "Сначала заполните название и описание проекта",
        variant: "destructive"
      });
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
      toast({
        title: "⚠️ Внимание",
        description: "Сначала нужен сценарий! Нажмите 'Сценарий' или 'Запустить производство'",
        variant: "destructive"
      });
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

  // Генерация изображения для конкретной сцены
  const generateSceneImage = async (sceneIndex: number) => {
    if (!script?.scenes?.[sceneIndex]) return;
    
    setGeneratingScene(sceneIndex);
    
    try {
      const scene = script.scenes[sceneIndex];
      
      const res = await fetch('/api/work', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_storyboard',
          projectId: projects[0]?.id || 'default',
          data: {
            sceneTitle: scene.title,
            sceneDescription: scene.description || scene.action,
            style: newProject.style
          }
        })
      });
      
      const data = await res.json();
      
      if (data.success && data.image?.imageUrl) {
        setSceneImages(prev => ({
          ...prev,
          [sceneIndex]: data.image
        }));
      }
    } catch (error) {
      console.error('Error generating scene image:', error);
    } finally {
      setGeneratingScene(null);
    }
  };

  // Генерация изображений для всех сцен
  const generateAllSceneImages = async () => {
    if (!script?.scenes) return;
    
    setIsLoading(true);
    setWorkProgress('🎨 Генерация изображений для всех сцен...');
    
    const newImages: Record<number, any> = {};
    
    for (let i = 0; i < script.scenes.length; i++) {
      setWorkProgress(`🎨 Генерация изображения ${i + 1}/${script.scenes.length}...`);
      
      const scene = script.scenes[i];
      
      try {
        const res = await fetch('/api/work', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create_storyboard',
            projectId: projects[0]?.id || 'default',
            data: {
              sceneTitle: scene.title,
              sceneDescription: scene.description || scene.action,
              style: newProject.style
            }
          })
        });
        
        const data = await res.json();
        
        if (data.success && data.image?.imageUrl) {
          newImages[i] = data.image;
        }
      } catch (error) {
        console.error(`Error generating image for scene ${i}:`, error);
      }
    }
    
    setSceneImages(newImages);
    setWorkProgress('✅ Все изображения сгенерированы!');
    setIsLoading(false);
    setTimeout(() => setWorkProgress(''), 3000);
  };

  // Озвучка текста через TTS
  const playDialogue = async (text: string, character: string) => {
    if (playingAudio) {
      setPlayingAudio(null);
      return;
    }
    
    try {
      setPlayingAudio(character);
      
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, character })
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.audioUrl) {
          const audio = new Audio(data.audioUrl);
          audio.onended = () => setPlayingAudio(null);
          audio.play();
        }
      }
    } catch (error) {
      console.error('TTS error:', error);
      setPlayingAudio(null);
    }
  };

  // Экспорт проекта
  const exportProject = () => {
    if (!script) {
      toast({
        title: "⚠️ Нет данных",
        description: "Сначала создайте сценарий для экспорта",
        variant: "destructive"
      });
      return;
    }
    
    const exportData = {
      project: {
        title: newProject.title,
        description: newProject.description,
        style: newProject.style,
        createdAt: new Date().toISOString()
      },
      script,
      storyboard,
      sceneImages,
      animation: workResult?.animation,
      agents: workResult?.agents
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fortorium_${newProject.title.replace(/\s+/g, '_')}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Генерация видео из изображений
  const generateVideo = async () => {
    if (!script?.scenes || Object.keys(sceneImages).length === 0) {
      toast({
        title: "⚠️ Недостаточно данных",
        description: "Сначала сгенерируйте изображения для сцен (кнопка 🎨)",
        variant: "destructive"
      });
      return;
    }
    
    setGeneratingVideo(true);
    setWorkProgress('🎬 Генерация видео...');
    
    try {
      // Собираем все изображения
      const images = Object.entries(sceneImages)
        .filter(([_, img]) => img?.imageUrl)
        .map(([idx, img]) => ({
          sceneIndex: parseInt(idx),
          imageUrl: img.imageUrl,
          duration: script.scenes[parseInt(idx)]?.duration || 5
        }));
      
      const res = await fetch('/api/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images,
          projectId: projects[0]?.id,
          title: script.title
        })
      });
      
      const data = await res.json();
      
      if (data.success && data.videoUrl) {
        setProjectVideo(data.videoUrl);
        setWorkProgress('✅ Видео готово!');
      } else {
        setWorkProgress('⚠️ Видео генерируется в фоновом режиме');
      }
    } catch (error) {
      console.error('Video generation error:', error);
      setWorkProgress('❌ Ошибка генерации видео');
    } finally {
      setGeneratingVideo(false);
      setTimeout(() => setWorkProgress(''), 3000);
    }
  };

  useEffect(() => {
    fetchStudioData();
    fetchDirectorReport();
    fetchPendingCandidates();
    fetchTasks();
    loadFromLocalStorage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============================================
  // ЛОКАЛЬНОЕ ХРАНИЛИЩЕ
  // ============================================
  
  // Сохранение проекта в localStorage
  const saveToLocalStorage = () => {
    if (!script) return;
    
    const projectData = {
      version: '1.7.0',
      savedAt: new Date().toISOString(),
      project: newProject,
      script,
      storyboard,
      sceneImages,
      workResult
    };
    
    localStorage.setItem('fortorium_current_project', JSON.stringify(projectData));
    toast({
      title: "💾 Сохранено",
      description: "Проект сохранён в браузере",
    });
  };
  
  // Загрузка из localStorage
  const loadFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem('fortorium_current_project');
      if (saved) {
        const data = JSON.parse(saved);
        if (data.script) {
          setScript(data.script);
          setNewProject(data.project || newProject);
          setStoryboard(data.storyboard);
          setSceneImages(data.sceneImages || {});
          setWorkResult(data.workResult);
          console.log('📂 Проект загружен из localStorage');
        }
      }
    } catch (e) {
      console.error('Ошибка загрузки из localStorage:', e);
    }
  };
  
  // Очистка localStorage
  const clearLocalStorage = () => {
    if (confirm('Удалить сохранённый проект?')) {
      localStorage.removeItem('fortorium_current_project');
      setScript(null);
      setStoryboard(null);
      setSceneImages({});
      setWorkResult(null);
      toast({
        title: "🗑️ Удалено",
        description: "Сохранённый проект удалён из браузера",
      });
    }
  };

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
        toast({
          title: "✅ Готово",
          description: "База данных инициализирована!",
        });
        fetchStudioData();
      } else {
        toast({
          title: "❌ Ошибка",
          description: data.error,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "❌ Ошибка",
        description: "Не удалось инициализировать базу данных",
        variant: "destructive"
      });
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
        // НЕ переключаем вкладку - остаёмся на студии
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

                {/* Quick Stats Dashboard */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
                  <div className="p-2 bg-white/5 rounded-lg text-center">
                    <div className="text-2xl">📝</div>
                    <div className="text-white font-bold">{tasks.filter(t => t.type === 'script').length}</div>
                    <div className="text-white/50 text-xs">Сценариев</div>
                  </div>
                  <div className="p-2 bg-white/5 rounded-lg text-center">
                    <div className="text-2xl">🎨</div>
                    <div className="text-white font-bold">{Object.keys(sceneImages).length}</div>
                    <div className="text-white/50 text-xs">Изображений</div>
                  </div>
                  <div className="p-2 bg-white/5 rounded-lg text-center">
                    <div className="text-2xl">🎬</div>
                    <div className="text-white font-bold">{projects.filter(p => p.status === 'in_progress').length}</div>
                    <div className="text-white/50 text-xs">В работе</div>
                  </div>
                  <div className="p-2 bg-white/5 rounded-lg text-center">
                    <div className="text-2xl">✅</div>
                    <div className="text-white font-bold">{projects.filter(p => p.status === 'completed').length}</div>
                    <div className="text-white/50 text-xs">Завершено</div>
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
                    onClick={loadDemoProject}
                    variant="outline"
                    className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
                  >
                    🎭 Демо
                  </Button>
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
                    {/* Pipeline Status */}
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${script ? 'bg-green-500' : 'bg-gray-500'}`} title="Сценарий" />
                      <div className={`w-3 h-3 rounded-full ${Object.keys(sceneImages).length > 0 ? 'bg-green-500' : 'bg-gray-500'}`} title="Изображения" />
                      <div className={`w-3 h-3 rounded-full ${workResult?.animation ? 'bg-green-500' : 'bg-gray-500'}`} title="Анимация" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Pipeline Progress Bar */}
                  {script && (
                    <div className="p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-white/60">Прогресс производства</span>
                        <span className="text-white font-medium">
                          {Math.round(
                            (script ? 25 : 0) +
                            (Object.keys(sceneImages).length > 0 ? 35 : 0) +
                            (workResult?.animation ? 25 : 0) +
                            (projectVideo ? 15 : 0)
                          )}%
                        </span>
                      </div>
                      <Progress 
                        value={
                          (script ? 25 : 0) +
                          (Object.keys(sceneImages).length > 0 ? 35 : 0) +
                          (workResult?.animation ? 25 : 0) +
                          (projectVideo ? 15 : 0)
                        } 
                        className="h-2"
                      />
                      <div className="flex justify-between mt-2 text-xs text-white/40">
                        <span className={script ? 'text-green-400' : ''}>✍️ Сценарий</span>
                        <span className={Object.keys(sceneImages).length > 0 ? 'text-green-400' : ''}>🎨 Изображения</span>
                        <span className={workResult?.animation ? 'text-green-400' : ''}>🎬 Анимация</span>
                        <span className={projectVideo ? 'text-green-400' : ''}>🎥 Видео</span>
                      </div>
                    </div>
                  )}

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

                      {/* Scenes with Images */}
                      {script.scenes?.length > 0 && (
                        <div className="space-y-3 mt-4">
                          <div className="flex items-center justify-between">
                            <h5 className="text-white/60 text-xs">Сцены ({script.scenes.length}):</h5>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={generateAllSceneImages}
                              disabled={isLoading || !script?.scenes}
                              className="h-6 text-xs border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
                            >
                              🎨 Сгенерировать все изображения
                            </Button>
                          </div>
                          {script.scenes.map((scene: any, i: number) => (
                            <div key={i} className="p-3 bg-white/5 rounded-lg border border-white/10">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <span className="text-white font-medium text-sm">Сцена {scene.number}:</span>{' '}
                                  <span className="text-amber-300">{scene.title}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs border-white/20 text-white/60">
                                    {scene.duration}с
                                  </Badge>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => generateSceneImage(i)}
                                    disabled={generatingScene !== null}
                                    className="h-6 w-6 p-0"
                                    title="Сгенерировать изображение"
                                  >
                                    {generatingScene === i ? (
                                      <Loader2 className="w-3 h-3 animate-spin text-purple-400" />
                                    ) : sceneImages[i]?.imageUrl ? (
                                      <CheckCircle className="w-3 h-3 text-green-400" />
                                    ) : (
                                      <Palette className="w-3 h-3 text-white/40" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                              
                              <p className="text-white/60 text-xs mb-2">{scene.description}</p>
                              
                              {/* Scene Image */}
                              {sceneImages[i]?.imageUrl && (
                                <img 
                                  src={sceneImages[i].imageUrl}
                                  alt={`Сцена ${scene.number}`}
                                  className="w-full rounded-lg border border-white/10 mb-2"
                                />
                              )}
                              
                              {/* Dialogues */}
                              {scene.dialogue?.length > 0 && (
                                <div className="space-y-1.5 mt-2">
                                  {scene.dialogue.map((d: any, di: number) => (
                                    <div 
                                      key={di} 
                                      className={`flex items-center gap-2 p-1.5 rounded ${
                                        playingAudio === `${i}-${di}` ? 'bg-green-500/20' : 'bg-white/5'
                                      }`}
                                    >
                                      <span className="text-amber-300 font-medium text-xs min-w-[80px]">
                                        {d.character}:
                                      </span>
                                      <span className="text-white/70 text-xs flex-1">"{d.line}"</span>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => playDialogue(d.line, d.character)}
                                        className="h-5 w-5 p-0"
                                        title="Озвучить"
                                      >
                                        {playingAudio === `${i}-${di}` ? (
                                          <Mic className="w-3 h-3 text-green-400" />
                                        ) : (
                                          <Volume2 className="w-3 h-3 text-white/40" />
                                        )}
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              )}
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

                  {/* Export & Video Actions */}
                  {script && (
                    <div className="space-y-2 pt-4 border-t border-white/10">
                      <div className="flex gap-2">
                        <Button
                          onClick={saveToLocalStorage}
                          variant="outline"
                          className="flex-1 border-blue-500/30 text-blue-300 hover:bg-blue-500/10"
                        >
                          💾 Сохранить в браузере
                        </Button>
                        <Button
                          onClick={exportProject}
                          variant="outline"
                          className="flex-1 border-green-500/30 text-green-300 hover:bg-green-500/10"
                        >
                          📥 Экспорт JSON
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={clearLocalStorage}
                          variant="outline"
                          className="flex-1 border-red-500/30 text-red-300 hover:bg-red-500/10"
                        >
                          🗑️ Очистить
                        </Button>
                        <Button
                          onClick={generateVideo}
                          disabled={generatingVideo || Object.keys(sceneImages).length === 0}
                          className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                        >
                          {generatingVideo ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Создаём видео...
                            </>
                          ) : (
                            <>
                              🎬 Создать видео
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Video Result */}
                  {projectVideo && (
                    <div className="p-4 bg-gradient-to-r from-pink-500/10 to-rose-500/10 rounded-lg border border-pink-500/20">
                      <h4 className="text-pink-400 font-medium mb-3 flex items-center gap-2">
                        🎬 Готовое видео
                      </h4>
                      <video 
                        src={projectVideo} 
                        controls 
                        className="w-full rounded-lg border border-white/10"
                      />
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
              <div className="flex gap-2">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          try {
                            const data = JSON.parse(event.target?.result as string);
                            if (data.project && data.script) {
                              setNewProject({
                                title: data.project.title,
                                description: data.project.description,
                                style: data.project.style || 'disney',
                                duration: 30
                              });
                              setScript(data.script);
                              setStoryboard(data.storyboard);
                              setSceneImages(data.sceneImages || {});
                              setWorkResult({ animation: data.animation, agents: data.agents });
                              toast({
                                title: "✅ Проект загружен",
                                description: `${data.project.title} успешно загружен`,
                              });
                            }
                          } catch (err) {
                            toast({
                              title: "❌ Ошибка",
                              description: "Не удалось загрузить файл. Проверьте формат.",
                              variant: "destructive"
                            });
                          }
                        };
                        reader.readAsText(file);
                      }
                    }}
                  />
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    📂 Загрузить проект
                  </Button>
                </label>
                <Button onClick={() => setActiveTab('studio')} className="bg-gradient-to-r from-purple-500 to-pink-500">
                  <Plus className="w-4 h-4 mr-2" />
                  Новый проект
                </Button>
              </div>
            </div>

            {/* Текущий проект из сессии */}
            {script && (
              <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 flex items-center justify-center text-2xl">
                        🎬
                      </div>
                      <div>
                        <CardTitle className="text-white">{script.title || newProject.title}</CardTitle>
                        <CardDescription className="text-white/60">{script.logline || newProject.description}</CardDescription>
                      </div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      Текущий проект
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="p-2 bg-white/5 rounded text-center">
                      <div className="text-2xl">📝</div>
                      <div className="text-white font-bold">{script.scenes?.length || 0}</div>
                      <div className="text-white/50 text-xs">Сцен</div>
                    </div>
                    <div className="p-2 bg-white/5 rounded text-center">
                      <div className="text-2xl">🎨</div>
                      <div className="text-white font-bold">{Object.keys(sceneImages).length}</div>
                      <div className="text-white/50 text-xs">Изображений</div>
                    </div>
                    <div className="p-2 bg-white/5 rounded text-center">
                      <div className="text-2xl">👥</div>
                      <div className="text-white font-bold">{script.characters?.length || 0}</div>
                      <div className="text-white/50 text-xs">Персонажей</div>
                    </div>
                    <div className="p-2 bg-white/5 rounded text-center">
                      <div className="text-2xl">⏱️</div>
                      <div className="text-white font-bold">{script.totalDuration || 30}с</div>
                      <div className="text-white/50 text-xs">Длительность</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-white/60 mb-4">
                    <span>🎨 {ANIMATION_STYLES.find(s => s.value === newProject.style)?.label}</span>
                    <span>🎭 {script.mood || 'Приключение'}</span>
                  </div>

                  {/* Персонажи */}
                  {script.characters?.length > 0 && (
                    <div className="mb-4">
                      <div className="text-white/60 text-xs mb-2">Персонажи:</div>
                      <div className="flex flex-wrap gap-2">
                        {script.characters.map((c: any, i: number) => (
                          <Badge key={i} variant="outline" className="border-amber-500/30 text-amber-300">
                            {c.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4 border-t border-white/10">
                    <Button
                      onClick={() => setActiveTab('studio')}
                      variant="outline"
                      className="flex-1 border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
                    >
                      ✏️ Редактировать
                    </Button>
                    <Button
                      onClick={exportProject}
                      variant="outline"
                      className="flex-1 border-green-500/30 text-green-300 hover:bg-green-500/10"
                    >
                      📥 Экспорт
                    </Button>
                    <Button
                      onClick={generateAllSceneImages}
                      disabled={isLoading}
                      className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500"
                    >
                      🎨 Генерировать все
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Проекты из БД */}
            {projects.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Сохранённые проекты</h3>
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
              </div>
            )}

            {/* Пустое состояние */}
            {projects.length === 0 && !script && (
              <Card className="bg-white/5 border-white/10 border-dashed">
                <CardContent className="py-12 text-center">
                  <Film className="w-12 h-12 text-white/20 mx-auto mb-4" />
                  <p className="text-white/60 mb-4">Нет проектов</p>
                  <p className="text-white/40 text-sm mb-4">Создайте проект на вкладке "Студия"</p>
                  <Button onClick={() => setActiveTab('studio')} className="bg-gradient-to-r from-purple-500 to-pink-500">
                    <Plus className="w-4 h-4 mr-2" />
                    Перейти к созданию
                  </Button>
                </CardContent>
              </Card>
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
      <footer className="text-center py-6 text-white/40 text-sm border-t border-white/5">
        <div className="flex items-center justify-between max-w-7xl mx-auto px-4">
          <div>
            ФОРТОРИУМ © 2024 | 
            <a href="https://github.com/evikass/fortorium_01" className="text-purple-400 hover:underline ml-1">GitHub</a>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs bg-purple-500/20 px-2 py-1 rounded text-purple-300">
              v1.7.0
            </span>
          </div>
        </div>
      </footer>

      {/* Version Badge - Fixed Bottom Right */}
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-gradient-to-r from-purple-600/90 to-pink-600/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg border border-white/10">
          <span className="text-white text-xs font-medium">ФОРТОРИУМ v1.7.0</span>
        </div>
      </div>
    </div>
  );
}

