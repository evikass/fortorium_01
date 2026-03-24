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

// Расширенные стили анимации
const ANIMATION_STYLES = [
  { value: 'ghibli', label: 'Studio Ghibli', description: 'Миядзаки, акварель, магия', icon: '🌸' },
  { value: 'disney', label: 'Disney 2D', description: 'Классическая диснеевская анимация', icon: '🏰' },
  { value: 'pixar', label: 'Pixar 3D', description: 'Современный 3D, кинематографичность', icon: '🧸' },
  { value: 'anime', label: 'Anime', description: 'Японская анимация, яркие цвета', icon: '⚡' },
  { value: 'cartoon', label: 'Modern Cartoon', description: 'Современный мульт, яркий и весёлый', icon: '🎨' },
  { value: 'claymation', label: 'Claymation', description: 'Пластилиновая анимация, Aardman style', icon: '🗿' },
  { value: 'watercolor', label: 'Watercolor', description: 'Акварельный стиль, нежные тона', icon: '🖼️' },
  { value: 'retro', label: 'Retro 80s', description: 'Ретро стиль, неоновые цвета', icon: '🕹️' },
  { value: 'stopmotion', label: 'Stop Motion', description: 'Кукольная анимация', icon: '🎭' },
  { value: 'comic', label: 'Comic Book', description: 'Комикс стиль, чёрные контуры', icon: '💥' },
  { value: 'soviet', label: 'Советская анимация', description: 'Союзмультфильм, классика, тёплые тона', icon: '🪆' },
  { value: 'soviet-puppet', label: 'Советская кукольная', description: 'Чебурашка, Винни, кукольный стиль', icon: '🧸' },
];

// Бесплатные агенты для генерации изображений
const FREE_IMAGE_AGENTS = [
  { 
    id: 'pollinations', 
    name: 'Pollinations AI', 
    icon: '🌸', 
    description: 'Бесплатная генерация без ограничений',
    baseUrl: 'https://image.pollinations.ai/prompt/',
    enabled: true
  },
  { 
    id: 'clipdrop', 
    name: 'ClipDrop', 
    icon: '🖼️', 
    description: 'Быстрая генерация изображений',
    baseUrl: null,
    enabled: false
  },
  { 
    id: 'lexica', 
    name: 'Lexica Art', 
    icon: '🎨', 
    description: 'Поиск готовых изображений',
    baseUrl: 'https://lexica.art/api/v1/search?q=',
    enabled: true
  },
  { 
    id: 'pexels', 
    name: 'Pexels', 
    icon: '📷', 
    description: 'Бесплатные стоковые фото',
    baseUrl: 'https://api.pexels.com/v1/search?query=',
    enabled: true
  },
  { 
    id: 'unsplash', 
    name: 'Unsplash', 
    icon: '🏞️', 
    description: 'Качественные фото для фонов',
    baseUrl: 'https://api.unsplash.com/search/photos?query=',
    enabled: true
  },
  { 
    id: 'placeholder', 
    name: 'Заглушка', 
    icon: '📦', 
    description: 'Плейсхолдер для превью',
    baseUrl: 'https://via.placeholder.com/512x512?text=',
    enabled: true
  }
];

// Настроения для саундтрека
const SOUNDTRACK_MOODS_CONFIG = [
  { value: 'adventure', labelRu: 'Приключение', labelEn: 'Adventure', icon: '🗺️', descRu: 'Вдохновляющая, героическая музыка', descEn: 'Inspiring, heroic music' },
  { value: 'epic', labelRu: 'Эпическая', labelEn: 'Epic', icon: '⚔️', descRu: 'Грандиозная, мощная оркестровая', descEn: 'Grand, powerful orchestral' },
  { value: 'playful', labelRu: 'Игривая', labelEn: 'Playful', icon: '🎮', descRu: 'Весёлая, лёгкая музыка', descEn: 'Fun, light music' },
  { value: 'dramatic', labelRu: 'Драматическая', labelEn: 'Dramatic', icon: '🎭', descRu: 'Эмоциональная, напряжённая', descEn: 'Emotional, intense' },
  { value: 'peaceful', labelRu: 'Спокойная', labelEn: 'Peaceful', icon: '🌿', descRu: 'Мягкая, расслабляющая', descEn: 'Soft, relaxing' },
];

// ============================================
// СИСТЕМА ГОЛОСОВ ДЛЯ ПЕРСОНАЖЕЙ (v2.9.0)
// ============================================
const VOICE_TYPES = [
  { id: 'narrator', name: 'Рассказчик', nameEn: 'Narrator', icon: '🎙️', pitch: 'medium', speed: 1.0, description: 'Нейтральный, спокойный голос' },
  { id: 'hero', name: 'Герой', nameEn: 'Hero', icon: '🦸', pitch: 'low', speed: 1.0, description: 'Уверенный, мужественный голос' },
  { id: 'heroine', name: 'Героиня', nameEn: 'Heroine', icon: '👸', pitch: 'high', speed: 1.0, description: 'Мягкий, женственный голос' },
  { id: 'child', name: 'Ребёнок', nameEn: 'Child', icon: '👶', pitch: 'high', speed: 1.2, description: 'Высокий, живой голос' },
  { id: 'elder', name: 'Старец', nameEn: 'Elder', icon: '👴', pitch: 'low', speed: 0.85, description: 'Мудрый, медленный голос' },
  { id: 'villain', name: 'Злодей', nameEn: 'Villain', icon: '😈', pitch: 'low', speed: 0.9, description: 'Тёмный, зловещий голос' },
  { id: 'fairy', name: 'Фея', nameEn: 'Fairy', icon: '🧚', pitch: 'high', speed: 1.1, description: 'Волшебный, нежный голос' },
  { id: 'robot', name: 'Робот', nameEn: 'Robot', icon: '🤖', pitch: 'medium', speed: 1.0, description: 'Синтетический, механический голос' },
  { id: 'creature', name: 'Существо', nameEn: 'Creature', icon: '🐲', pitch: 'medium', speed: 0.95, description: 'Необычный, сказочный голос' },
  { id: 'comedian', name: 'Комик', nameEn: 'Comedian', icon: '🤡', pitch: 'medium', speed: 1.15, description: 'Весёлый, энергичный голос' },
];

// Типы отношений между персонажами
const RELATIONSHIP_TYPES = [
  { id: 'friend', name: 'Друг', nameEn: 'Friend', icon: '🤝', color: '#4ade80' },
  { id: 'family', name: 'Семья', nameEn: 'Family', icon: '👨‍👩‍👧', color: '#f472b6' },
  { id: 'rival', name: 'Соперник', nameEn: 'Rival', icon: '⚔️', color: '#fb923c' },
  { id: 'mentor', name: 'Наставник', nameEn: 'Mentor', icon: '📚', color: '#60a5fa' },
  { id: 'love', name: 'Любовь', nameEn: 'Love', icon: '❤️', color: '#ef4444' },
  { id: 'enemy', name: 'Враг', nameEn: 'Enemy', icon: '💀', color: '#6b7280' },
];

// Жанры для генератора идей
const GENRES = [
  { value: 'adventure', label: 'Приключение', icon: '🗺️' },
  { value: 'fantasy', label: 'Фэнтези', icon: '✨' },
  { value: 'scifi', label: 'Научная фантастика', icon: '🚀' },
  { value: 'comedy', label: 'Комедия', icon: '😂' },
  { value: 'drama', label: 'Драма', icon: '🎭' },
  { value: 'musical', label: 'Мюзикл', icon: '🎵' },
  { value: 'mystery', label: 'Детектив', icon: '🔍' },
  { value: 'nature', label: 'Природа', icon: '🌿' },
];

// ============================================
// СИСТЕМА ПЕРЕВОДОВ (I18N)
// ============================================
const translations = {
  ru: {
    // Header
    appTitle: 'ФОРТОРИУМ',
    appSubtitle: 'Анимационная студия будущего',
    directorOnline: 'Директор онлайн',
    directorBusy: 'Директор занят',
    projects: 'проектов',
    agents: 'агентов',
    
    // Tabs
    studio: 'Студия',
    production: 'Производство',
    projectsTab: 'Проекты',
    team: 'Команда',
    
    // Studio
    newProject: 'Новый проект',
    projectName: 'Название проекта',
    projectNamePlaceholder: 'Название вашего мультфильма...',
    projectIdea: 'Описание идеи',
    projectIdeaPlaceholder: 'Кот-астронавт отправляется на Луну...',
    animationStyle: 'Стиль анимации',
    duration: 'Длительность (сек)',
    createScript: '📝 Сценарий',
    runProduction: '🚀 Запустить производство',
    demoProject: '🎭 Демо',
    generateIdeas: '💡 Идеи',
    
    // Production
    script: 'Сценарий',
    characters: 'Персонажи',
    scenes: 'Сцены',
    generateImages: '🎨 Все изображения',
    generateVideo: '🎬 Видео',
    slideshow: '🎬 Слайд-шоу',
    
    // Actions
    save: '💾 Сохранить',
    export: '📤 Экспорт',
    import: '📥 Импорт',
    undo: '↩️ Отменить',
    redo: '↪️ Повторить',
    copy: '📋 Копировать',
    clear: '🗑️ Очистить',
    printPdf: '📄 Печать/PDF',
    
    // Statistics
    statistics: 'Статистика проекта',
    progress: 'Прогресс',
    imagesGenerated: 'Изображений',
    charactersGenerated: 'Персонажей',
    style: 'Стиль',
    
    // Scene
    scene: 'Сцена',
    location: 'Локация',
    action: 'Действие',
    dialogue: 'Диалог',
    
    // Notes
    notes: 'Заметки',
    addNote: 'Добавить заметку',
    sceneNotes: 'Заметки к сцене',
    
    // Presentation
    presentationMode: 'Режим презентации',
    exitPresentation: 'Выйти (Esc)',
    prevScene: '◀ Назад',
    nextScene: 'Вперёд ▶',
    
    // Hotkeys
    hotkeys: 'Горячие клавиши',
    hotkeysHelp: 'Справка',
    
    // Theme
    darkTheme: '🌙 Тёмная',
    lightTheme: '☀️ Светлая',
    
    // Footer
    copyright: 'ФОРТОРИУМ © 2024',
    github: 'GitHub',
  },
  en: {
    // Header
    appTitle: 'FORTORIUM',
    appSubtitle: 'Animation Studio of the Future',
    directorOnline: 'Director Online',
    directorBusy: 'Director Busy',
    projects: 'projects',
    agents: 'agents',
    
    // Tabs
    studio: 'Studio',
    production: 'Production',
    projectsTab: 'Projects',
    team: 'Team',
    
    // Studio
    newProject: 'New Project',
    projectName: 'Project Name',
    projectNamePlaceholder: 'Your animation title...',
    projectIdea: 'Idea Description',
    projectIdeaPlaceholder: 'An astronaut cat goes to the Moon...',
    animationStyle: 'Animation Style',
    duration: 'Duration (sec)',
    createScript: '📝 Script',
    runProduction: '🚀 Run Production',
    demoProject: '🎭 Demo',
    generateIdeas: '💡 Ideas',
    
    // Production
    script: 'Script',
    characters: 'Characters',
    scenes: 'Scenes',
    generateImages: '🎨 All Images',
    generateVideo: '🎬 Video',
    slideshow: '🎬 Slideshow',
    
    // Actions
    save: '💾 Save',
    export: '📤 Export',
    import: '📥 Import',
    undo: '↩️ Undo',
    redo: '↪️ Redo',
    copy: '📋 Copy',
    clear: '🗑️ Clear',
    printPdf: '📄 Print/PDF',
    
    // Statistics
    statistics: 'Project Statistics',
    progress: 'Progress',
    imagesGenerated: 'Images',
    charactersGenerated: 'Characters',
    style: 'Style',
    
    // Scene
    scene: 'Scene',
    location: 'Location',
    action: 'Action',
    dialogue: 'Dialogue',
    
    // Notes
    notes: 'Notes',
    addNote: 'Add Note',
    sceneNotes: 'Scene Notes',
    
    // Presentation
    presentationMode: 'Presentation Mode',
    exitPresentation: 'Exit (Esc)',
    prevScene: '◀ Back',
    nextScene: 'Next ▶',
    
    // Hotkeys
    hotkeys: 'Hotkeys',
    hotkeysHelp: 'Help',
    
    // Theme
    darkTheme: '🌙 Dark',
    lightTheme: '☀️ Light',
    
    // Footer
    copyright: 'FORTORIUM © 2024',
    github: 'GitHub',
  }
};

type Language = 'ru' | 'en';

export default function AnimationStudio() {
  // Состояния
  const [activeTab, setActiveTab] = useState('studio');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Язык
  const [language, setLanguage] = useState<Language>('ru');
  const t = translations[language];
  
  // Тема (dark/light)
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // AI генератор идей
  const [showIdeaGenerator, setShowIdeaGenerator] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState('adventure');
  const [generatedIdeas, setGeneratedIdeas] = useState<string[]>([]);
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
  
  // Навигация по сценам
  const [selectedSceneIndex, setSelectedSceneIndex] = useState(0);
  
  // Заметки к сценам
  const [sceneNotes, setSceneNotes] = useState<Record<number, string[]>>({});
  const [newNote, setNewNote] = useState('');
  const [showNotesPanel, setShowNotesPanel] = useState(false);
  
  // Режим презентации
  const [presentationMode, setPresentationMode] = useState(false);
  
  // Справка по горячим клавишам
  const [showHotkeysHelp, setShowHotkeysHelp] = useState(false);
  
  // Диалог шаринга проекта
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  
  // Drag & Drop для сцен
  const [draggedSceneIndex, setDraggedSceneIndex] = useState<number | null>(null);
  
  // Сохранённые шаблоны голосов
  const [voicePreviews, setVoicePreviews] = useState<Record<string, string>>({});
  
  // Выбранный агент для генерации изображений
  const [selectedImageAgent, setSelectedImageAgent] = useState<string>('pollinations');
  const [showImageAgentSelector, setShowImageAgentSelector] = useState(false);
  
  // Текущий выбранный агент
  const currentImageAgent = FREE_IMAGE_AGENTS.find(a => a.id === selectedImageAgent) || FREE_IMAGE_AGENTS[0];
  
  // AI Ассистент
  const [showAIChat, setShowAIChat] = useState(false);
  const [aiMessages, setAiMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [aiInput, setAiInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // Таймлайн сцен
  const [showTimeline, setShowTimeline] = useState(true);
  
  // История версий
  const [projectVersions, setProjectVersions] = useState<{ timestamp: Date; data: any; label: string }[]>([]);
  
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
  
  // Изображения персонажей
  const [characterImages, setCharacterImages] = useState<Record<string, any>>({});
  const [generatingCharacter, setGeneratingCharacter] = useState<string | null>(null);
  
  // Режим редактирования сценария
  const [editingScript, setEditingScript] = useState(false);
  const [editedScript, setEditedScript] = useState<string>('');
  
  // Слайд-шоу предпросмотр
  const [showSlideshow, setShowSlideshow] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Автосохранение
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  
  // Озвучка
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(false);
  
  // Видео
  const [generatingVideo, setGeneratingVideo] = useState(false);
  const [projectVideo, setProjectVideo] = useState<string | null>(null);
  
  // Саундтрек
  const [generatingSoundtrack, setGeneratingSoundtrack] = useState(false);
  const [projectSoundtrack, setProjectSoundtrack] = useState<string | null>(null);
  const [playingSoundtrack, setPlayingSoundtrack] = useState(false);
  const [soundtrackMood, setSoundtrackMood] = useState<'epic' | 'playful' | 'dramatic' | 'peaceful' | 'adventure'>('adventure');
  const [showSoundtrackDialog, setShowSoundtrackDialog] = useState(false);
  
  // Звуковые эффекты UI
  const [uiSoundEnabled, setUiSoundEnabled] = useState(false);
  
  // Проекты для сохранения
  const [savedProjects, setSavedProjects] = useState<any[]>([]);
  
  // ============================================
  // НОВЫЕ ФУНКЦИИ v2.9.0
  // ============================================
  
  // Голоса персонажей (mapping character name -> voice type id)
  const [characterVoices, setCharacterVoices] = useState<Record<string, string>>({});
  const [showVoiceSelector, setShowVoiceSelector] = useState(false);
  const [selectedCharacterForVoice, setSelectedCharacterForVoice] = useState<string | null>(null);
  
  // Отношения между персонажами
  const [characterRelations, setCharacterRelations] = useState<Array<{
    character1: string;
    character2: string;
    type: string;
  }>>([]);
  const [showRelationEditor, setShowRelationEditor] = useState(false);
  
  // Пакетные операции со сценами
  const [selectedScenes, setSelectedScenes] = useState<Set<number>>(new Set());
  const [showBatchEditDialog, setShowBatchEditDialog] = useState(false);
  const [batchDuration, setBatchDuration] = useState<number>(5);
  
  // Визуальный таймлайн
  const [showVisualTimeline, setShowVisualTimeline] = useState(true);
  
  // Статистика проекта
  const [showProjectStats, setShowProjectStats] = useState(false);
  
  // Модальные окна
  const [showHireDialog, setShowHireDialog] = useState(false);
  const [showCandidateDialog, setShowCandidateDialog] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  // ============================================
  // ИСТОРИЯ ДЕЙСТВИЙ (UNDO/REDO)
  // ============================================
  const [scriptHistory, setScriptHistory] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const MAX_HISTORY = 50;

  // Сохранить состояние в историю
  const saveToHistory = useCallback((newScript: any) => {
    if (!newScript) return;
    
    setScriptHistory(prev => {
      const newHistory = [...prev.slice(0, historyIndex + 1), newScript];
      if (newHistory.length > MAX_HISTORY) {
        return newHistory.slice(-MAX_HISTORY);
      }
      return newHistory;
    });
    setHistoryIndex(prev => Math.min(prev + 1, MAX_HISTORY - 1));
  }, [historyIndex]);

  // Отменить последнее действие
  const undoScript = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      setScript(scriptHistory[historyIndex - 1]);
      toast({
        title: "↩️ Отменено",
        description: `Возвращено к состоянию ${historyIndex}/${scriptHistory.length}`,
      });
    } else {
      toast({
        title: "⚠️ Невозможно отменить",
        description: "Нет предыдущих состояний",
        variant: "destructive"
      });
    }
  }, [historyIndex, scriptHistory, toast]);

  // Повторить отменённое действие
  const redoScript = useCallback(() => {
    if (historyIndex < scriptHistory.length - 1) {
      setHistoryIndex(prev => prev + 1);
      setScript(scriptHistory[historyIndex + 1]);
      toast({
        title: "↪️ Повторено",
        description: `Восстановлено состояние ${historyIndex + 2}/${scriptHistory.length}`,
      });
    } else {
      toast({
        title: "⚠️ Невозможно повторить",
        description: "Нет следующих состояний",
        variant: "destructive"
      });
    }
  }, [historyIndex, scriptHistory, toast]);

  // ============================================
  // ИМПОРТ ПРОЕКТА
  // ============================================
  const importProject = async (file: File) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (data.script) {
        setScript(data.script);
        saveToHistory(data.script);
        
        if (data.project) {
          setNewProject(data.project);
        }
        if (data.sceneImages) {
          setSceneImages(data.sceneImages);
        }
        if (data.characterImages) {
          setCharacterImages(data.characterImages);
        }
        if (data.storyboard) {
          setStoryboard(data.storyboard);
        }
        if (data.workResult) {
          setWorkResult(data.workResult);
        }
        
        toast({
          title: "📥 Проект импортирован",
          description: `Загружен: ${data.project?.title || 'Без названия'}`,
        });
      } else {
        throw new Error('Неверный формат файла');
      }
    } catch (error) {
      toast({
        title: "❌ Ошибка импорта",
        description: "Не удалось загрузить файл. Проверьте формат.",
        variant: "destructive"
      });
    }
  };

  // ============================================
  // СТАТИСТИКА ПРОЕКТА
  // ============================================
  const getProjectStats = () => {
    if (!script) return null;
    
    const totalScenes = script.scenes?.length || 0;
    const totalCharacters = script.characters?.length || 0;
    const totalDuration = script.totalDuration || script.scenes?.reduce((sum: number, s: any) => sum + (s.duration || 0), 0) || 0;
    const totalDialogue = script.scenes?.reduce((sum: number, s: any) => sum + (s.dialogue?.length || 0), 0) || 0;
    const generatedImages = Object.keys(sceneImages).length;
    const generatedCharacters = Object.keys(characterImages).length;
    
    const progress = totalScenes > 0 ? Math.round((generatedImages / totalScenes) * 100) : 0;
    
    return {
      totalScenes,
      totalCharacters,
      totalDuration,
      totalDialogue,
      generatedImages,
      generatedCharacters,
      progress,
      style: ANIMATION_STYLES.find(s => s.value === newProject.style)?.label || newProject.style
    };
  };

  // ============================================
  // ИНДИКАТОР АВТОСОХРАНЕНИЯ
  // ============================================
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  
  const formatSaveTime = (date: Date | null): string => {
    if (!date) return '';
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 10) return language === 'ru' ? 'только что' : 'just now';
    if (diff < 60) return language === 'ru' ? `${diff} сек. назад` : `${diff}s ago`;
    if (diff < 3600) return language === 'ru' ? `${Math.floor(diff / 60)} мин. назад` : `${Math.floor(diff / 60)}m ago`;
    return date.toLocaleTimeString(language === 'ru' ? 'ru-RU' : 'en-US', { hour: '2-digit', minute: '2-digit' });
  };

  // ============================================
  // ЭКСПОРТ В PDF
  // ============================================
  const exportToPdf = async () => {
    if (!script) {
      toast({
        title: language === 'ru' ? "⚠️ Нет данных" : "⚠️ No data",
        description: language === 'ru' ? "Сначала создайте сценарий" : "Create a script first",
        variant: "destructive"
      });
      return;
    }
    
    setIsExportingPdf(true);
    
    try {
      const styleName = ANIMATION_STYLES.find(s => s.value === newProject.style)?.label || newProject.style;
      
      // Создаём HTML для PDF
      const pdfContent = `
        <!DOCTYPE html>
        <html lang="${language}">
        <head>
          <meta charset="UTF-8">
          <title>${script.title} - ФОРТОРИУМ</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            @page { 
              margin: 2cm;
              size: A4;
            }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              font-size: 11pt;
              line-height: 1.6;
              color: #1a1a1a;
            }
            .cover {
              text-align: center;
              padding: 100px 0;
              page-break-after: always;
            }
            .cover h1 {
              font-size: 36pt;
              color: #6366f1;
              margin-bottom: 20px;
            }
            .cover .subtitle {
              font-size: 14pt;
              color: #666;
              font-style: italic;
            }
            .cover .meta {
              margin-top: 60px;
              font-size: 10pt;
              color: #888;
            }
            .section-title {
              font-size: 18pt;
              color: #6366f1;
              border-bottom: 2px solid #6366f1;
              padding-bottom: 10px;
              margin: 40px 0 20px;
            }
            .character-card {
              background: #f8f8ff;
              padding: 15px;
              margin: 15px 0;
              border-left: 4px solid #6366f1;
              page-break-inside: avoid;
            }
            .character-name {
              font-size: 14pt;
              font-weight: bold;
              color: #333;
            }
            .character-desc {
              font-style: italic;
              color: #555;
              margin: 5px 0;
            }
            .character-traits {
              font-size: 9pt;
              color: #888;
            }
            .scene {
              margin: 25px 0;
              padding: 20px;
              border: 1px solid #ddd;
              border-radius: 8px;
              page-break-inside: avoid;
            }
            .scene-header {
              font-size: 14pt;
              font-weight: bold;
              color: #333;
              margin-bottom: 10px;
            }
            .scene-location {
              font-style: italic;
              color: #666;
              margin-bottom: 15px;
              font-size: 10pt;
            }
            .dialogue {
              margin: 8px 15px;
              padding: 8px;
              background: #f9f9f9;
              border-radius: 4px;
            }
            .dialogue-character {
              font-weight: bold;
              color: #6366f1;
            }
            .dialogue-line {
              font-style: italic;
            }
            .action {
              background: #f0f0f0;
              padding: 10px;
              margin: 10px 0;
              border-radius: 4px;
              font-style: italic;
              color: #555;
            }
            .footer {
              margin-top: 50px;
              text-align: center;
              font-size: 9pt;
              color: #888;
              border-top: 1px solid #ddd;
              padding-top: 20px;
            }
            .info-box {
              background: #f5f5f5;
              padding: 15px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .info-row {
              margin: 5px 0;
            }
            .info-label {
              font-weight: bold;
              color: #333;
            }
          </style>
        </head>
        <body>
          <div class="cover">
            <h1>🎬 ${script.title}</h1>
            <p class="subtitle">${script.logline || ''}</p>
            <div class="meta">
              <p>${language === 'ru' ? 'Стиль' : 'Style'}: ${styleName}</p>
              <p>${language === 'ru' ? 'Длительность' : 'Duration'}: ${script.totalDuration || 30}${language === 'ru' ? ' секунд' : ' seconds'}</p>
              <p>${language === 'ru' ? 'Создано' : 'Created'}: ${new Date().toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US')}</p>
              <p style="margin-top: 20px;">ФОРТОРИУМ — ${language === 'ru' ? 'Анимационная студия будущего' : 'Animation Studio of the Future'}</p>
            </div>
          </div>
          
          <h2 class="section-title">👥 ${language === 'ru' ? 'Персонажи' : 'Characters'} (${script.characters?.length || 0})</h2>
          ${script.characters?.map((c: any) => `
            <div class="character-card">
              <div class="character-name">${c.name}</div>
              <div class="character-desc">${c.description || ''}</div>
              ${c.traits?.length ? `<div class="character-traits">${language === 'ru' ? 'Черты' : 'Traits'}: ${c.traits.join(', ')}</div>` : ''}
            </div>
          `).join('') || `<p>${language === 'ru' ? 'Персонажи не определены' : 'No characters defined'}</p>`}
          
          <h2 class="section-title">📝 ${language === 'ru' ? 'Сценарий' : 'Script'} (${script.scenes?.length || 0} ${language === 'ru' ? 'сцен' : 'scenes'})</h2>
          ${script.scenes?.map((scene: any) => `
            <div class="scene">
              <div class="scene-header">${language === 'ru' ? 'Сцена' : 'Scene'} ${scene.number}: ${scene.title}</div>
              <div class="scene-location">📍 ${scene.location || (language === 'ru' ? 'Локация не указана' : 'Location not specified')} | ⏱️ ${scene.duration || 5}${language === 'ru' ? 'с' : 's'}</div>
              <p style="margin: 10px 0;">${scene.description || ''}</p>
              ${scene.dialogue?.length ? `
                <div class="dialogues">
                  ${scene.dialogue.map((d: any) => `
                    <div class="dialogue">
                      <span class="dialogue-character">${d.character}:</span>
                      <span class="dialogue-line"> "${d.line}"</span>
                    </div>
                  `).join('')}
                </div>
              ` : ''}
              ${scene.action ? `<div class="action">🎬 ${scene.action}</div>` : ''}
            </div>
          `).join('') || `<p>${language === 'ru' ? 'Сцены не определены' : 'No scenes defined'}</p>`}
          
          <div class="footer">
            ${language === 'ru' ? 'Создано в' : 'Created in'} <strong>ФОРТОРИУМ</strong> — ${language === 'ru' ? 'Анимационная студия будущего' : 'Animation Studio of the Future'}<br>
            https://fortorium-01.vercel.app
          </div>
        </body>
        </html>
      `;
      
      // Открываем в новом окне для печати
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(pdfContent);
        printWindow.document.close();
        printWindow.focus();
        
        setTimeout(() => {
          printWindow.print();
        }, 500);
        
        toast({
          title: "📄 PDF " + (language === 'ru' ? 'готов' : 'ready'),
          description: language === 'ru' ? 'Используйте Ctrl+P для сохранения' : 'Use Ctrl+P to save',
        });
      }
    } catch (error) {
      toast({
        title: "❌ " + (language === 'ru' ? 'Ошибка' : 'Error'),
        description: language === 'ru' ? 'Не удалось создать PDF' : 'Failed to create PDF',
        variant: "destructive"
      });
    } finally {
      setIsExportingPdf(false);
    }
  };

  // ============================================
  // ШАРИНГ ПРОЕКТА
  // ============================================
  const generateShareLink = () => {
    if (!script) {
      toast({
        title: language === 'ru' ? "⚠️ Нет данных" : "⚠️ No data",
        description: language === 'ru' ? "Сначала создайте сценарий" : "Create a script first",
        variant: "destructive"
      });
      return;
    }
    
    const shareData = {
      project: newProject,
      script,
      sceneImages: Object.keys(sceneImages).length > 0 ? sceneImages : undefined,
      characterImages: Object.keys(characterImages).length > 0 ? characterImages : undefined,
      sharedAt: new Date().toISOString(),
      version: '2.6.0'
    };
    
    // Кодируем в base64
    const encoded = btoa(encodeURIComponent(JSON.stringify(shareData)));
    const link = `${window.location.origin}?share=${encoded}`;
    
    setShareLink(link);
    setShowShareDialog(true);
  };
  
  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink).then(() => {
      toast({
        title: "📋 " + (language === 'ru' ? 'Скопировано' : 'Copied'),
        description: language === 'ru' ? 'Ссылка скопирована в буфер обмена' : 'Link copied to clipboard',
      });
    });
  };
  
  // Загрузка проекта из share-ссылки
  const loadSharedProject = (encodedData: string) => {
    try {
      const decoded = JSON.parse(decodeURIComponent(atob(encodedData)));
      if (decoded.script) {
        setScript(decoded.script);
        setNewProject(decoded.project || newProject);
        if (decoded.sceneImages) setSceneImages(decoded.sceneImages);
        if (decoded.characterImages) setCharacterImages(decoded.characterImages);
        toast({
          title: "📥 " + (language === 'ru' ? 'Проект загружен' : 'Project loaded'),
          description: decoded.project?.title || (language === 'ru' ? 'Из общей ссылки' : 'From shared link'),
        });
      }
    } catch (e) {
      console.error('Failed to load shared project:', e);
    }
  };

  // ============================================
  // DRAG & DROP ДЛЯ СЦЕН
  // ============================================
  const handleSceneDragStart = (index: number) => {
    setDraggedSceneIndex(index);
  };
  
  const handleSceneDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedSceneIndex === null || draggedSceneIndex === index) return;
  };
  
  const handleSceneDrop = (targetIndex: number) => {
    if (draggedSceneIndex === null || draggedSceneIndex === targetIndex) return;
    
    const newScenes = [...(script?.scenes || [])];
    const draggedScene = newScenes[draggedSceneIndex];
    
    // Удаляем из старой позиции
    newScenes.splice(draggedSceneIndex, 1);
    // Вставляем в новую позицию
    newScenes.splice(targetIndex, 0, draggedScene);
    
    // Обновляем номера сцен
    newScenes.forEach((scene, idx) => {
      scene.number = idx + 1;
    });
    
    setScript({
      ...script,
      scenes: newScenes
    });
    
    // Обновляем индексы изображений
    const newSceneImages: Record<number, any> = {};
    newScenes.forEach((_, idx) => {
      const oldIdx = idx < targetIndex 
        ? (idx < draggedSceneIndex ? idx : idx + 1)
        : (idx > targetIndex ? idx : draggedSceneIndex);
      // Это упрощённая логика - в реальности нужно более сложное обновление
    });
    
    setDraggedSceneIndex(null);
    saveToHistory({ ...script, scenes: newScenes });
    
    toast({
      title: "🔄 " + (language === 'ru' ? 'Сцены перемещены' : 'Scenes reordered'),
      description: language === 'ru' ? `Сцена ${draggedSceneIndex + 1} перемещена` : `Scene ${draggedSceneIndex + 1} moved`,
    });
  };

  // ============================================
  // ГОЛОСОВОЕ ПРЕВЬЮ
  // ============================================
  const playVoicePreview = async (characterName: string) => {
    const character = script?.characters?.find((c: any) => c.name === characterName);
    if (!character) return;
    
    const previewText = language === 'ru' 
      ? `Привет! Меня зовут ${characterName}. Я ${character.description || 'персонаж'}.`
      : `Hello! My name is ${characterName}. I am ${character.description || 'a character'}.`;
    
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: previewText, character: characterName })
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.audioUrl) {
          const audio = new Audio(data.audioUrl);
          audio.play();
        }
      }
    } catch (error) {
      console.error('Voice preview error:', error);
    }
  };

  // ============================================
  // СИСТЕМА ГОЛОСОВ v2.9.0
  // ============================================
  
  // Установить голос персонажу
  const setCharacterVoice = (characterName: string, voiceId: string) => {
    setCharacterVoices(prev => ({
      ...prev,
      [characterName]: voiceId
    }));
    const voiceType = VOICE_TYPES.find(v => v.id === voiceId);
    toast({
      title: "🎙️ " + (language === 'ru' ? 'Голос установлен' : 'Voice set'),
      description: `${characterName}: ${voiceType?.name || voiceId}`,
    });
  };
  
  // Получить голос персонажа
  const getCharacterVoice = (characterName: string) => {
    return characterVoices[characterName] || 'narrator';
  };
  
  // Озвучить реплику с выбранным голосом
  const speakWithCharacterVoice = async (characterName: string, text: string) => {
    const voiceId = getCharacterVoice(characterName);
    const voiceType = VOICE_TYPES.find(v => v.id === voiceId);
    
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text, 
          character: characterName,
          voiceType: voiceId,
          pitch: voiceType?.pitch,
          speed: voiceType?.speed
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.audioUrl) {
          const audio = new Audio(data.audioUrl);
          audio.play();
        }
      }
    } catch (error) {
      console.error('TTS error:', error);
    }
  };

  // ============================================
  // ОТНОШЕНИЯ ПЕРСОНАЖЕЙ v2.9.0
  // ============================================
  
  // Добавить отношение между персонажами
  const addCharacterRelation = (char1: string, char2: string, type: string) => {
    // Проверяем, нет ли уже такого отношения
    const exists = characterRelations.some(
      r => (r.character1 === char1 && r.character2 === char2) ||
           (r.character1 === char2 && r.character2 === char1)
    );
    
    if (!exists) {
      setCharacterRelations(prev => [...prev, { character1: char1, character2: char2, type }]);
      toast({
        title: "🔗 " + (language === 'ru' ? 'Отношение добавлено' : 'Relation added'),
        description: `${char1} ↔ ${char2}`,
      });
    }
  };
  
  // Удалить отношение
  const removeCharacterRelation = (char1: string, char2: string) => {
    setCharacterRelations(prev => prev.filter(
      r => !((r.character1 === char1 && r.character2 === char2) ||
             (r.character1 === char2 && r.character2 === char1))
    ));
  };
  
  // Получить отношения персонажа
  const getCharacterRelations = (characterName: string) => {
    return characterRelations.filter(
      r => r.character1 === characterName || r.character2 === characterName
    );
  };

  // ============================================
  // ПАКЕТНЫЕ ОПЕРАЦИИ СО СЦЕНАМИ v2.9.0
  // ============================================
  
  // Переключить выбор сцены
  const toggleSceneSelection = (sceneIndex: number) => {
    setSelectedScenes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sceneIndex)) {
        newSet.delete(sceneIndex);
      } else {
        newSet.add(sceneIndex);
      }
      return newSet;
    });
  };
  
  // Выбрать все сцены
  const selectAllScenes = () => {
    if (script?.scenes) {
      setSelectedScenes(new Set(script.scenes.map((_: any, i: number) => i)));
    }
  };
  
  // Снять выбор со всех сцен
  const deselectAllScenes = () => {
    setSelectedScenes(new Set());
  };
  
  // Пакетное изменение длительности выбранных сцен
  const batchUpdateSceneDuration = (duration: number) => {
    if (!script?.scenes || selectedScenes.size === 0) return;
    
    const newScenes = script.scenes.map((scene: any, index: number) => {
      if (selectedScenes.has(index)) {
        return { ...scene, duration };
      }
      return scene;
    });
    
    setScript({
      ...script,
      scenes: newScenes,
      totalDuration: newScenes.reduce((sum: number, s: any) => sum + (s.duration || 0), 0)
    });
    
    saveToHistory({ ...script, scenes: newScenes });
    
    toast({
      title: "⏱️ " + (language === 'ru' ? 'Длительность изменена' : 'Duration updated'),
      description: language === 'ru' 
        ? `Обновлено ${selectedScenes.size} сцен` 
        : `Updated ${selectedScenes.size} scenes`,
    });
    
    setShowBatchEditDialog(false);
  };
  
  // Пакетная генерация изображений для выбранных сцен
  const batchGenerateSceneImages = async () => {
    if (!script?.scenes || selectedScenes.size === 0) return;
    
    setIsLoading(true);
    
    for (const index of selectedScenes) {
      setWorkProgress(`🎨 ${language === 'ru' ? 'Генерация' : 'Generating'} ${index + 1}/${script.scenes.length}...`);
      await generateSceneImage(index);
    }
    
    setWorkProgress('✅ ' + (language === 'ru' ? 'Готово!' : 'Done!'));
    setIsLoading(false);
    setTimeout(() => setWorkProgress(''), 2000);
  };
  
  // Удалить выбранные сцены
  const batchDeleteScenes = () => {
    if (!script?.scenes || selectedScenes.size === 0) return;
    
    const sortedIndexes = Array.from(selectedScenes).sort((a, b) => b - a);
    const newScenes = [...script.scenes];
    
    for (const index of sortedIndexes) {
      newScenes.splice(index, 1);
    }
    
    // Перенумеровываем сцены
    newScenes.forEach((scene, idx) => {
      scene.number = idx + 1;
    });
    
    setScript({
      ...script,
      scenes: newScenes,
      totalDuration: newScenes.reduce((sum: number, s: any) => sum + (s.duration || 0), 0)
    });
    
    saveToHistory({ ...script, scenes: newScenes });
    setSelectedScenes(new Set());
    
    toast({
      title: "🗑️ " + (language === 'ru' ? 'Сцены удалены' : 'Scenes deleted'),
      description: language === 'ru' 
        ? `Удалено ${sortedIndexes.length} сцен` 
        : `Deleted ${sortedIndexes.length} scenes`,
    });
  };

  // ============================================
  // ВИЗУАЛЬНЫЙ ТАЙМЛАЙН v2.9.0
  // ============================================
  
  // Рассчитать ширину сцены для таймлайна
  const getSceneTimelineWidth = (duration: number, totalDuration: number) => {
    const minWidth = 50; // минимальная ширина в пикселях
    const maxWidth = 300; // максимальная ширина
    const baseWidth = (duration / totalDuration) * 100; // процент от общей ширины
    return Math.max(minWidth, Math.min(maxWidth, baseWidth * 5));
  };
  
  // Получить цвет для сцены на таймлайне
  const getSceneColor = (index: number) => {
    const colors = [
      'from-purple-500 to-pink-500',
      'from-blue-500 to-cyan-500',
      'from-green-500 to-emerald-500',
      'from-orange-500 to-amber-500',
      'from-red-500 to-rose-500',
      'from-indigo-500 to-violet-500',
      'from-teal-500 to-green-500',
      'from-pink-500 to-rose-500',
    ];
    return colors[index % colors.length];
  };

  // ============================================
  // AI ГЕНЕРАТОР ИДЕЙ
  // ============================================
  const generateIdeas = async () => {
    setIsGeneratingIdeas(true);
    setGeneratedIdeas([]);
    
    try {
      const res = await fetch('/api/work', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_ideas',
          genre: selectedGenre,
          style: newProject.style
        })
      });
      
      const data = await res.json();
      
      if (data.ideas) {
        setGeneratedIdeas(data.ideas);
        toast({
          title: "💡 Идеи сгенерированы",
          description: `Получено ${data.ideas.length} идей для вашего проекта`,
        });
      } else {
        // Fallback: генерируем идеи локально
        const fallbackIdeas = generateFallbackIdeas(selectedGenre);
        setGeneratedIdeas(fallbackIdeas);
      }
    } catch (error) {
      // Если API недоступен, показываем локальные идеи
      const fallbackIdeas = generateFallbackIdeas(selectedGenre);
      setGeneratedIdeas(fallbackIdeas);
    } finally {
      setIsGeneratingIdeas(false);
    }
  };

  // Локальные идеи (fallback)
  const generateFallbackIdeas = (genre: string): string[] => {
    const ideasByGenre: Record<string, string[]> = {
      adventure: [
        "Маленький кораблик отправляется в плавание через океан, встречая дружелюбных китов и хитрых чаек",
        "Группа друзей находит древнюю карту и отправляется на поиски затерянного города",
        "Отважный почтальон должен доставить письмо через горы, леса и бурные реки"
      ],
      fantasy: [
        "Девочка находит волшебную дверь в своем шкафу, ведущую в мир говорящих животных",
        "Молодой волшебник должен спасти украденную звезду из замка злого колдуна",
        "Заколдованный принц в образе лягушки ищет того, кто сможет его расколдовать"
      ],
      scifi: [
        "Робот-няня на космической станции учится понимать человеческие эмоции",
        "Команда юных исследователей находит планету, где растения могут петь",
        "Мальчик находит старый космический корабль и отправляется в путешествие к звёздам"
      ],
      comedy: [
        "Неуклюжий пингвин мечтает стать профессиональным танцором",
        "Кот и мышь вынуждены работать вместе, чтобы спасти свой дом",
        "Семья роботов пытается понять, почему люди смеются над шутками"
      ],
      drama: [
        "Старый маяк хранит истории всех кораблей, которые он провожал",
        "Дерево в парке вспоминает все поколения детей, которые росли рядом с ним",
        "Два друга встречаются на том же месте каждые десять лет"
      ],
      musical: [
        "Город, где все говорят пением, встречает гостя, который не умеет петь",
        "Забытые инструменты в старом магазине мечтают снова звучать",
        "Хор птиц готовится к великому весеннему концерту"
      ],
      mystery: [
        "Детектив-белка расследует исчезновение всех орехов в лесу",
        "Юный сыщик находит зашифрованные послания в старых книгах библиотеки",
        "Команда друзей пытается разгадать тайну исчезнувшего призрака"
      ],
      nature: [
        "Путешествие капли воды от горного ручья до океана",
        "История о дереве, которое видело смену ста сезонов",
        "Бабочка мечтает увидеть весь мир за свою короткую жизнь"
      ]
    };
    
    return ideasByGenre[genre] || ideasByGenre.adventure;
  };

  // Выбрать идею и применить к проекту
  const applyIdea = (idea: string) => {
    setNewProject(prev => ({
      ...prev,
      description: idea,
      title: idea.split(' ').slice(0, 3).join(' ')
    }));
    setShowIdeaGenerator(false);
    toast({
      title: "✨ Идея применена",
      description: "Теперь можете создать сценарий на основе этой идеи",
    });
  };

  // ============================================
  // ПЕРЕКЛЮЧЕНИЕ ТЕМЫ
  // ============================================
  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
    document.documentElement.classList.toggle('light-mode');
    toast({
      title: isDarkMode ? "☀️ Светлая тема" : "🌙 Тёмная тема",
      description: "Тема интерфейса изменена",
    });
  };

  // ============================================
  // ЗАМЕТКИ К СЦЕНАМ
  // ============================================
  const addSceneNote = (sceneIndex: number, note: string) => {
    if (!note.trim()) return;
    setSceneNotes(prev => ({
      ...prev,
      [sceneIndex]: [...(prev[sceneIndex] || []), note.trim()]
    }));
    setNewNote('');
    toast({
      title: "📝 Заметка добавлена",
      description: `Заметка добавлена к сцене ${sceneIndex + 1}`,
    });
  };

  const removeSceneNote = (sceneIndex: number, noteIndex: number) => {
    setSceneNotes(prev => ({
      ...prev,
      [sceneIndex]: prev[sceneIndex]?.filter((_, i) => i !== noteIndex) || []
    }));
  };

  // ============================================
  // РЕЖИМ ПРЕЗЕНТАЦИИ
  // ============================================
  const startPresentation = () => {
    if (!script?.scenes || Object.keys(sceneImages).length === 0) {
      toast({
        title: language === 'ru' ? "⚠️ Нет изображений" : "⚠️ No Images",
        description: language === 'ru' ? "Сначала сгенерируйте изображения" : "Generate images first",
        variant: "destructive"
      });
      return;
    }
    setSelectedSceneIndex(0);
    setPresentationMode(true);
  };

  const nextPresentationScene = () => {
    if (!script?.scenes) return;
    if (selectedSceneIndex < script.scenes.length - 1) {
      setSelectedSceneIndex(prev => prev + 1);
    }
  };

  const prevPresentationScene = () => {
    if (selectedSceneIndex > 0) {
      setSelectedSceneIndex(prev => prev - 1);
    }
  };

  // Автопрокрутка в режиме презентации
  useEffect(() => {
    if (!presentationMode || !script?.scenes) return;
    
    const timer = setTimeout(() => {
      nextPresentationScene();
    }, 8000); // 8 секунд на слайд в презентации
    
    return () => clearTimeout(timer);
  }, [presentationMode, selectedSceneIndex]);

  // ============================================
  // ГОРЯЧИЕ КЛАВИШИ ДЛЯ ПРЕЗЕНТАЦИИ
  // ============================================
  useEffect(() => {
    if (!presentationMode) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPresentationMode(false);
      } else if (e.key === 'ArrowRight' || e.key === ' ') {
        nextPresentationScene();
      } else if (e.key === 'ArrowLeft') {
        prevPresentationScene();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [presentationMode, selectedSceneIndex]);

  // ============================================
  // ПЕРЕКЛЮЧЕНИЕ ЯЗЫКА
  // ============================================
  const toggleLanguage = () => {
    setLanguage(prev => prev === 'ru' ? 'en' : 'ru');
    toast({
      title: language === 'ru' ? "🇬🇧 English" : "🇷🇺 Русский",
      description: language === 'ru' ? "Language changed" : "Язык изменён",
    });
  };

  // ============================================
  // AI АССИСТЕНТ
  // ============================================
  const sendAiMessage = async () => {
    if (!aiInput.trim()) return;
    
    const userMessage = aiInput.trim();
    setAiInput('');
    setAiMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsAiLoading(true);
    
    try {
      // Формируем контекст для AI
      const context = {
        project: newProject,
        script: script,
        hasImages: Object.keys(sceneImages).length,
        hasCharacters: script?.characters?.length || 0,
        hasScenes: script?.scenes?.length || 0,
        style: newProject.style,
        language: language
      };
      
      const res = await fetch('/api/work', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ai_assistant',
          message: userMessage,
          context
        })
      });
      
      const data = await res.json();
      
      if (data.response) {
        setAiMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      } else {
        // Fallback ответ
        const fallbackResponse = getFallbackAiResponse(userMessage, context);
        setAiMessages(prev => [...prev, { role: 'assistant', content: fallbackResponse }]);
      }
    } catch (error) {
      // Fallback при ошибке
      const fallbackResponse = getFallbackAiResponse(userMessage, {
        project: newProject,
        script: script,
        hasImages: Object.keys(sceneImages).length,
        hasCharacters: script?.characters?.length || 0,
        hasScenes: script?.scenes?.length || 0,
        style: newProject.style,
        language: language
      });
      setAiMessages(prev => [...prev, { role: 'assistant', content: fallbackResponse }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Fallback ответы AI
  const getFallbackAiResponse = (message: string, context: any): string => {
    const lowerMessage = message.toLowerCase();
    const isRu = language === 'ru';
    
    if (lowerMessage.includes('помощь') || lowerMessage.includes('help')) {
      return isRu 
        ? '🎬 **Помощь по ФОРТОРИУМ:**\n\n1. **Создание проекта** - заполните название и описание\n2. **Генерация сценария** - нажмите "📝 Сценарий"\n3. **Изображения** - нажмите "🎨" для генерации\n4. **Презентация** - нажмите "📽️" для просмотра\n\nГорячие клавиши: ⌨️ в шапке'
        : '🎬 **FORTORIUM Help:**\n\n1. **Create project** - fill title and description\n2. **Generate script** - click "📝 Script"\n3. **Images** - click "🎨" to generate\n4. **Presentation** - click "📽️" to view\n\nHotkeys: ⌨️ in header';
    }
    
    if (lowerMessage.includes('идея') || lowerMessage.includes('idea')) {
      return isRu
        ? '💡 **Генерация идей:**\n\nНажмите кнопку "💡 Идеи" в шапке и выберите жанр!\n\nДоступные жанры:\n• 🗺️ Приключение\n• ✨ Фэнтези\n• 🚀 Sci-Fi\n• 😂 Комедия\n• 🎭 Драма'
        : '💡 **Idea Generation:**\n\nClick "💡 Ideas" button in header and select a genre!\n\nAvailable genres:\n• 🗺️ Adventure\n• ✨ Fantasy\n• 🚀 Sci-Fi\n• 😂 Comedy\n• 🎭 Drama';
    }
    
    if (lowerMessage.includes('стиль') || lowerMessage.includes('style')) {
      return isRu
        ? '🎨 **Стили анимации:**\n\n• 🌸 Studio Ghibli - Миядзаки, магия\n• 🏰 Disney 2D - классика\n• 🧸 Pixar 3D - современный 3D\n• ⚡ Anime - японский стиль\n• 🗿 Claymation - пластилин\n• 🖼️ Watercolor - акварель\n• 🕹️ Retro 80s - неон\n• 💥 Comic Book - комикс'
        : '🎨 **Animation Styles:**\n\n• 🌸 Studio Ghibli - Miyazaki, magic\n• 🏰 Disney 2D - classic\n• 🧸 Pixar 3D - modern 3D\n• ⚡ Anime - Japanese style\n• 🗿 Claymation - clay\n• 🖼️ Watercolor - watercolor\n• 🕹️ Retro 80s - neon\n• 💥 Comic Book - comic';
    }
    
    if (lowerMessage.includes('сцен') || lowerMessage.includes('scene')) {
      const sceneCount = context.hasScenes;
      return isRu
        ? `🎬 **Информация о сценах:**\n\nВ вашем проекте: **${sceneCount}** сцен\n\nНавигация: используйте боковую панель слева или стрелки ←/→ в режиме презентации.`
        : `🎬 **Scene Information:**\n\nYour project has: **${sceneCount}** scenes\n\nNavigation: use sidebar on the left or arrows ←/→ in presentation mode.`;
    }
    
    // Дефолтный ответ
    return isRu
      ? '🤖 Привет! Я AI-ассистент ФОРТОРИУМ.\n\nМогу помочь с:\n• Созданием сценария\n• Выбором стиля анимации\n• Идеями для проекта\n• Навигацией\n\nЗадайте вопрос!'
      : '🤖 Hello! I\'m FORTORIUM AI assistant.\n\nI can help with:\n• Script creation\n• Animation style selection\n• Project ideas\n• Navigation\n\nAsk me anything!';
  };

  // Быстрые команды для AI
  const quickAiCommands = [
    { label: language === 'ru' ? '💡 Идеи' : '💡 Ideas', command: language === 'ru' ? 'дай идеи для проекта' : 'give me project ideas' },
    { label: language === 'ru' ? '🎨 Стили' : '🎨 Styles', command: language === 'ru' ? 'расскажи о стилях' : 'tell me about styles' },
    { label: language === 'ru' ? '📊 Статус' : '📊 Status', command: language === 'ru' ? 'статус проекта' : 'project status' },
    { label: language === 'ru' ? '❓ Помощь' : '❓ Help', command: language === 'ru' ? 'помощь' : 'help' },
  ];

  // ============================================
  // ИСТОРИЯ ВЕРСИЙ
  // ============================================
  const saveVersion = (label: string = 'Auto-save') => {
    const version = {
      timestamp: new Date(),
      data: {
        project: newProject,
        script,
        sceneImages,
        characterImages,
        workResult
      },
      label
    };
    setProjectVersions(prev => [version, ...prev.slice(0, 19)]); // Храним до 20 версий
    toast({
      title: language === 'ru' ? "📦 Версия сохранена" : "📦 Version saved",
      description: label,
    });
  };

  const restoreVersion = (version: typeof projectVersions[0]) => {
    if (version?.data) {
      setNewProject(version.data.project || newProject);
      if (version.data.script) setScript(version.data.script);
      if (version.data.sceneImages) setSceneImages(version.data.sceneImages);
      if (version.data.characterImages) setCharacterImages(version.data.characterImages);
      if (version.data.workResult) setWorkResult(version.data.workResult);
      toast({
        title: language === 'ru' ? "⏪ Версия восстановлена" : "⏪ Version restored",
        description: `${version.label} (${version.timestamp?.toLocaleString?.() || 'Unknown'})`,
      });
    }
  };

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
        saveToHistory(data.script); // Сохраняем в историю
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
      const styleInfo = ANIMATION_STYLES.find(s => s.value === newProject.style);
      
      // Если выбран бесплатный агент (Pollinations)
      if (selectedImageAgent === 'pollinations') {
        const stylePrompt = getStylePrompt(newProject.style);
        const prompt = `${stylePrompt}, ${scene.title}, ${scene.description || scene.action}, detailed scene, high quality`;
        const encodedPrompt = encodeURIComponent(prompt);
        const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=768&nologo=true`;
        
        // Pollinations генерирует изображение напрямую по URL
        setSceneImages(prev => ({
          ...prev,
          [sceneIndex]: {
            imageUrl,
            prompt,
            agent: 'pollinations',
            generatedAt: new Date().toISOString()
          }
        }));
        
        toast({
          title: "🌸 " + (language === 'ru' ? 'Изображение готово' : 'Image ready'),
          description: language === 'ru' ? `Сцена ${sceneIndex + 1} через Pollinations AI` : `Scene ${sceneIndex + 1} via Pollinations AI`,
        });
      } else if (selectedImageAgent === 'placeholder') {
        // Заглушка для тестирования
        const text = encodeURIComponent(`Scene ${sceneIndex + 1}: ${scene.title}`);
        const imageUrl = `https://via.placeholder.com/1024x768/6366f1/ffffff?text=${text}`;
        
        setSceneImages(prev => ({
          ...prev,
          [sceneIndex]: {
            imageUrl,
            agent: 'placeholder',
            generatedAt: new Date().toISOString()
          }
        }));
      } else {
        // Используем стандартный API
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
      }
    } catch (error) {
      console.error('Error generating scene image:', error);
      toast({
        title: "❌ " + (language === 'ru' ? 'Ошибка' : 'Error'),
        description: language === 'ru' ? 'Не удалось сгенерировать изображение' : 'Failed to generate image',
        variant: "destructive"
      });
    } finally {
      setGeneratingScene(null);
    }
  };
  
  // Получить промпт для стиля
  const getStylePrompt = (style: string): string => {
    const stylePrompts: Record<string, string> = {
      ghibli: 'Studio Ghibli style, Hayao Miyazaki, anime, watercolor backgrounds, magical atmosphere, soft colors',
      disney: 'Disney animation style, classic 2D animation, vibrant colors, expressive characters',
      pixar: 'Pixar 3D style, modern CGI, cinematic lighting, detailed textures, warm colors',
      anime: 'Anime style, Japanese animation, vibrant colors, detailed eyes, dynamic poses',
      cartoon: 'Modern cartoon style, stylized characters, bold outlines, bright colors',
      claymation: 'Claymation style, stop motion, plasticine, Aardman animation, textured surfaces',
      watercolor: 'Watercolor painting style, soft edges, delicate colors, artistic, dreamy',
      retro: 'Retro 80s style, synthwave, neon colors, geometric shapes, nostalgic',
      stopmotion: 'Stop motion animation style, puppet animation, miniature sets, handcrafted look',
      comic: 'Comic book style, bold outlines, halftone dots, action poses, dynamic',
      soviet: 'Soviet animation style, Soyuzmultfilm, warm pastel colors, hand-drawn, nostalgic, classic Russian cartoon',
      'soviet-puppet': 'Soviet puppet animation style, Cheburashka, Winnie the Pooh, stop motion puppets, felt and fabric textures, warm lighting, nostalgic'
    };
    
    return stylePrompts[style] || stylePrompts.disney;
  };

  // ============================================
  // ГЕНЕРАЦИЯ САУНДТРЕКА
  // ============================================
  const generateSoundtrack = async () => {
    if (!script) {
      toast({
        title: language === 'ru' ? "⚠️ Нет данных" : "⚠️ No data",
        description: language === 'ru' ? "Сначала создайте сценарий" : "Create a script first",
        variant: "destructive"
      });
      return;
    }
    
    setGeneratingSoundtrack(true);
    
    try {
      // Используем TTS API для создания звукового сопровождения
      // На основе настроения проекта генерируем описание для музыки
      const moodDescription = {
        adventure: 'Inspiring orchestral adventure theme with strings and brass, cinematic',
        epic: 'Epic cinematic orchestral music with powerful drums and choir, heroic',
        playful: 'Playful cheerful music with pizzicato strings and woodwinds, fun',
        dramatic: 'Dramatic emotional music with piano and strings, intense',
        peaceful: 'Peaceful ambient music with soft piano and strings, relaxing'
      };
      
      const styleMusicMap: Record<string, string> = {
        ghibli: 'whimsical, magical, Joe Hisaishi style',
        disney: 'Disney musical style, Broadway inspired',
        pixar: 'modern cinematic, Randy Newman style',
        anime: 'anime soundtrack, J-pop influenced',
        cartoon: 'cartoon music, wacky, fun',
        claymation: 'quirky, British humor style',
        watercolor: 'soft piano, impressionist',
        retro: 'synthwave, 80s electronic',
        stopmotion: 'folk music, acoustic',
        comic: 'heroic, action music',
        soviet: 'Russian folk inspired, nostalgic, warm',
        'soviet-puppet': 'playful, children music, toy instruments'
      };
      
      const styleMusic = styleMusicMap[newProject.style] || styleMusicMap.disney;
      
      // Создаём текст для озвучки описания музыки (workaround)
      const musicPrompt = `${moodDescription[soundtrackMood]}, ${styleMusic}, for "${script.title}" animation project, ${script.totalDuration || 30} seconds`;
      
      // Генерируем несколько аудио сегментов
      const audioSegments = [];
      
      // Генерируем заголовок
      const moodConfig = SOUNDTRACK_MOODS_CONFIG.find(m => m.value === soundtrackMood);
      const titleText = language === 'ru' 
        ? `Музыкальная тема: ${script.title}. Настроение: ${moodConfig?.labelRu || 'Приключение'}`
        : `Musical theme: ${script.title}. Mood: ${moodConfig?.labelEn || 'Adventure'}`;
      
      // Используем TTS для создания аудио
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: titleText, 
          character: 'narrator',
          style: soundtrackMood
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.audioUrl) {
          setProjectSoundtrack(data.audioUrl);
          toast({
            title: "🎵 " + (language === 'ru' ? 'Саундтрек создан' : 'Soundtrack created'),
            description: language === 'ru' ? 'Музыкальная тема готова!' : 'Musical theme is ready!',
          });
        }
      } else {
        // Fallback - используем Web Audio API для простого тонга
        createSimpleSoundtrack();
      }
    } catch (error) {
      console.error('Soundtrack generation error:', error);
      // Fallback
      createSimpleSoundtrack();
    } finally {
      setGeneratingSoundtrack(false);
    }
  };
  
  // Создание простого саундтрека через Web Audio API
  const createSimpleSoundtrack = () => {
    // Создаём простой тон с частотой на основе настроения
    const frequencies: Record<string, number> = {
      adventure: 440,
      epic: 349,
      playful: 523,
      dramatic: 294,
      peaceful: 392
    };
    
    const freq = frequencies[soundtrackMood] || 440;
    
    // Создаём Data URL для простого синусоидального тона
    const sampleRate = 44100;
    const duration = 3; // 3 секунды
    const numSamples = sampleRate * duration;
    
    // Формируем WAV заголовок
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);
    
    // WAV заголовок
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, numSamples * 2, true);
    
    // Генерируем тон с затуханием
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t / (duration / 3)); // Затухание
      const sample = Math.sin(2 * Math.PI * freq * t) * envelope * 0.3;
      view.setInt16(44 + i * 2, sample * 0x7FFF, true);
    }
    
    const blob = new Blob([buffer], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    setProjectSoundtrack(url);
    
    toast({
      title: "🎵 " + (language === 'ru' ? 'Саундтрек создан' : 'Soundtrack created'),
      description: language === 'ru' ? 'Простая мелодия сгенерирована' : 'Simple melody generated',
    });
  };
  
  const playSoundtrack = () => {
    if (!projectSoundtrack) return;
    
    const audio = new Audio(projectSoundtrack);
    audio.play();
    setPlayingSoundtrack(true);
    audio.onended = () => setPlayingSoundtrack(false);
  };
  
  const stopSoundtrack = () => {
    setPlayingSoundtrack(false);
    // Останавливаем все аудио
    const audios = document.getElementsByTagName('audio');
    for (let i = 0; i < audios.length; i++) {
      audios[i].pause();
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

  // Генерация изображения персонажа
  const generateCharacterImage = async (characterName: string, characterDescription: string) => {
    if (!characterName || !characterDescription) return;
    
    setGeneratingCharacter(characterName);
    
    try {
      const stylePrompts: Record<string, string> = {
        ghibli: 'Studio Ghibli style, Miyazaki, anime character design',
        disney: 'Disney animation style, classic character design',
        pixar: 'Pixar 3D style, modern 3D character',
        anime: 'Anime style, Japanese animation character',
        cartoon: 'Modern cartoon style, stylized character'
      };
      
      const stylePrompt = stylePrompts[newProject.style] || stylePrompts.disney;
      const imagePrompt = `${stylePrompt}, character portrait of ${characterName}, ${characterDescription}, expressive face, professional character design, high quality`;
      
      const res = await fetch('/api/work', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_storyboard',
          projectId: projects[0]?.id || 'default',
          data: {
            sceneTitle: `Персонаж: ${characterName}`,
            sceneDescription: imagePrompt,
            style: newProject.style
          }
        })
      });
      
      const data = await res.json();
      
      if (data.success && data.image?.imageUrl) {
        setCharacterImages(prev => ({
          ...prev,
          [characterName]: data.image
        }));
        toast({
          title: "🎨 Персонаж создан",
          description: `Изображение ${characterName} готово!`,
        });
      }
    } catch (error) {
      console.error('Error generating character image:', error);
      toast({
        title: "❌ Ошибка",
        description: "Не удалось создать изображение персонажа",
        variant: "destructive"
      });
    } finally {
      setGeneratingCharacter(null);
    }
  };

  // Генерация всех персонажей
  const generateAllCharacterImages = async () => {
    if (!script?.characters) return;
    
    setIsLoading(true);
    setWorkProgress('🎨 Генерация персонажей...');
    
    for (let i = 0; i < script.characters.length; i++) {
      const char = script.characters[i];
      setWorkProgress(`🎨 Генерация персонажа ${i + 1}/${script.characters.length}: ${char.name}`);
      await generateCharacterImage(char.name, char.description);
    }
    
    setWorkProgress('✅ Все персонажи созданы!');
    setIsLoading(false);
    setTimeout(() => setWorkProgress(''), 3000);
  };

  // Редактирование сценария
  const startEditingScript = () => {
    setEditedScript(JSON.stringify(script, null, 2));
    setEditingScript(true);
  };

  const saveEditedScript = () => {
    try {
      const parsed = JSON.parse(editedScript);
      setScript(parsed);
      saveToHistory(parsed); // Сохраняем в историю для Undo
      setEditingScript(false);
      toast({
        title: "✅ Сохранено",
        description: "Сценарий обновлён (Ctrl+Z для отмены)",
      });
    } catch {
      toast({
        title: "❌ Ошибка",
        description: "Неверный формат JSON",
        variant: "destructive"
      });
    }
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
      characterImages,
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

  // Экспорт сценария в документ (для печати/PDF)
  const exportScriptDocument = () => {
    if (!script) {
      toast({
        title: "⚠️ Нет данных",
        description: "Сначала создайте сценарий",
        variant: "destructive"
      });
      return;
    }

    const styleName = ANIMATION_STYLES.find(s => s.value === newProject.style)?.label || newProject.style;
    
    const htmlContent = `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>${script.title} - Сценарий | ФОРТОРИУМ</title>
  <style>
    @page { margin: 2cm; }
    body { 
      font-family: 'Times New Roman', Georgia, serif;
      font-size: 12pt;
      line-height: 1.6;
      color: #1a1a1a;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 { 
      font-size: 24pt;
      text-align: center;
      border-bottom: 2px solid #333;
      padding-bottom: 10px;
      margin-bottom: 5px;
    }
    .subtitle {
      text-align: center;
      font-style: italic;
      color: #666;
      margin-bottom: 30px;
    }
    .meta {
      background: #f5f5f5;
      padding: 15px;
      margin-bottom: 30px;
      border-radius: 5px;
    }
    .meta-row { margin: 5px 0; }
    .meta-label { font-weight: bold; }
    h2 {
      font-size: 16pt;
      margin-top: 30px;
      border-bottom: 1px solid #ccc;
      padding-bottom: 5px;
    }
    .character-card {
      background: #fafafa;
      padding: 10px 15px;
      margin: 10px 0;
      border-left: 3px solid #6366f1;
    }
    .character-name { font-weight: bold; font-size: 14pt; }
    .character-desc { font-style: italic; color: #555; }
    .character-traits { color: #888; font-size: 10pt; }
    .scene {
      margin: 25px 0;
      padding: 15px;
      border: 1px solid #ddd;
      border-radius: 5px;
      page-break-inside: avoid;
    }
    .scene-header {
      font-size: 14pt;
      font-weight: bold;
      color: #333;
      margin-bottom: 10px;
    }
    .scene-location {
      font-style: italic;
      color: #666;
      margin-bottom: 10px;
    }
    .scene-description {
      margin-bottom: 15px;
    }
    .dialogue {
      margin: 8px 0;
      padding-left: 20px;
    }
    .dialogue-character {
      font-weight: bold;
      color: #6366f1;
    }
    .dialogue-line {
      font-style: italic;
    }
    .action {
      color: #555;
      font-style: italic;
      margin-top: 10px;
      padding: 5px 10px;
      background: #f9f9f9;
    }
    .footer {
      margin-top: 40px;
      text-align: center;
      font-size: 10pt;
      color: #888;
      border-top: 1px solid #ddd;
      padding-top: 15px;
    }
  </style>
</head>
<body>
  <h1>🎬 ${script.title}</h1>
  <div class="subtitle">${script.logline || ''}</div>
  
  <div class="meta">
    <div class="meta-row"><span class="meta-label">Стиль:</span> ${styleName}</div>
    <div class="meta-row"><span class="meta-label">Длительность:</span> ${script.totalDuration || 30} секунд</div>
    <div class="meta-row"><span class="meta-label">Настроение:</span> ${script.mood || 'Не указано'}</div>
    <div class="meta-row"><span class="meta-label">Создано:</span> ${new Date().toLocaleDateString('ru-RU')}</div>
  </div>
  
  <h2>👥 Персонажи (${script.characters?.length || 0})</h2>
  ${script.characters?.map((c: any) => `
    <div class="character-card">
      <div class="character-name">${c.name}</div>
      <div class="character-desc">${c.description || ''}</div>
      ${c.traits?.length ? `<div class="character-traits">Черты: ${c.traits.join(', ')}</div>` : ''}
    </div>
  `).join('') || '<p>Персонажи не определены</p>'}
  
  <h2>📝 Сценарий (${script.scenes?.length || 0} сцен)</h2>
  ${script.scenes?.map((scene: any) => `
    <div class="scene">
      <div class="scene-header">Сцена ${scene.number}: ${scene.title}</div>
      <div class="scene-location">📍 ${scene.location || 'Локация не указана'} | ⏱️ ${scene.duration || 5}с</div>
      <div class="scene-description">${scene.description || ''}</div>
      ${scene.dialogue?.length ? `
        <div class="dialogues">
          ${scene.dialogue.map((d: any) => `
            <div class="dialogue">
              <span class="dialogue-character">${d.character}:</span>
              <span class="dialogue-line">"${d.line}"</span>
            </div>
          `).join('')}
        </div>
      ` : ''}
      ${scene.action ? `<div class="action">🎬 ${scene.action}</div>` : ''}
    </div>
  `).join('') || '<p>Сцены не определены</p>'}
  
  <div class="footer">
    Создано в <strong>ФОРТОРИУМ</strong> — Анимационная студия будущего<br>
    https://fortorium-01.vercel.app
  </div>
</body>
</html>`;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
      toast({
        title: "📄 Документ создан",
        description: "Используйте Ctrl+P для сохранения в PDF",
      });
    }
  };

  // Копировать сценарий в буфер обмена
  const copyScriptToClipboard = () => {
    if (!script) return;
    
    const styleName = ANIMATION_STYLES.find(s => s.value === newProject.style)?.label || newProject.style;
    
    let text = `🎬 ${script.title}\n${script.logline || ''}\n\n`;
    text += `Стиль: ${styleName}\nДлительность: ${script.totalDuration || 30}с\nНастроение: ${script.mood || ''}\n\n`;
    
    if (script.characters?.length) {
      text += `👥 ПЕРСОНАЖИ:\n`;
      script.characters.forEach((c: any) => {
        text += `• ${c.name} — ${c.description || ''}\n`;
      });
      text += '\n';
    }
    
    if (script.scenes?.length) {
      text += `📝 СЦЕНАРИЙ:\n\n`;
      script.scenes.forEach((scene: any) => {
        text += `--- Сцена ${scene.number}: ${scene.title} ---\n`;
        text += `📍 ${scene.location || ''} | ⏱️ ${scene.duration || 5}с\n`;
        text += `${scene.description || ''}\n`;
        if (scene.dialogue?.length) {
          scene.dialogue.forEach((d: any) => {
            text += `${d.character}: "${d.line}"\n`;
          });
        }
        text += '\n';
      });
    }
    
    text += `\nСоздано в ФОРТОРИУМ — https://fortorium-01.vercel.app`;
    
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "📋 Скопировано",
        description: "Сценарий скопирован в буфер обмена",
      });
    });
  };

  // ============================================
  // СЛАЙД-ШОУ
  // ============================================
  const startSlideshow = () => {
    if (!script?.scenes || Object.keys(sceneImages).length === 0) {
      toast({
        title: "⚠️ Нет изображений",
        description: "Сначала сгенерируйте изображения для сцен",
        variant: "destructive"
      });
      return;
    }
    setCurrentSlide(0);
    setShowSlideshow(true);
  };

  const nextSlide = () => {
    if (!script?.scenes) return;
    const totalImages = Object.keys(sceneImages).length;
    if (currentSlide < totalImages - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      setShowSlideshow(false);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  // Автопрокрутка слайд-шоу
  useEffect(() => {
    if (!showSlideshow || !script?.scenes) return;
    
    const timer = setTimeout(() => {
      nextSlide();
    }, 5000); // 5 секунд на слайд
    
    return () => clearTimeout(timer);
  }, [showSlideshow, currentSlide]);

  // ============================================
  // АВТОСОХРАНЕНИЕ
  // ============================================
  useEffect(() => {
    if (!autoSaveEnabled || !script) return;
    
    const interval = setInterval(() => {
      setSaveStatus('saving');
      
      const projectData = {
        version: '2.6.0',
        savedAt: new Date().toISOString(),
        project: newProject,
        script,
        storyboard,
        sceneImages,
        characterImages,
        workResult
      };
      
      localStorage.setItem('fortorium_current_project', JSON.stringify(projectData));
      setLastSaveTime(new Date());
      setSaveStatus('saved');
    }, 60000); // Каждую минуту
    
    return () => clearInterval(interval);
  }, [autoSaveEnabled, script, newProject, storyboard, sceneImages, characterImages, workResult, historyIndex]);
  
  // Отслеживание изменений для статуса сохранения
  useEffect(() => {
    if (script && lastSaveTime) {
      setSaveStatus('unsaved');
    }
  }, [script, newProject, sceneImages, characterImages]);
  
  // Загрузка из share-ссылки при старте
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shareData = params.get('share');
    if (shareData) {
      loadSharedProject(shareData);
      // Очищаем URL от параметра share
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

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
  // ГОРЯЧИЕ КЛАВИШИ
  // ============================================
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + S - Сохранить
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (script) {
          saveToLocalStorage();
        }
      }
      // Ctrl/Cmd + N - Новый проект
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        setActiveTab('studio');
        setNewProject({ title: '', description: '', style: 'disney', duration: 30 });
      }
      // Ctrl/Cmd + D - Демо проект
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        loadDemoProject();
      }
      // Ctrl/Cmd + G - Генерировать все изображения
      if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
        e.preventDefault();
        if (script?.scenes) {
          generateAllSceneImages();
        }
      }
      // Ctrl/Cmd + E - Экспорт
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        if (script) {
          exportProject();
        }
      }
      // Escape - Отменить редактирование
      if (e.key === 'Escape' && editingScript) {
        setEditingScript(false);
      }
      // Ctrl/Cmd + Z - Отменить (Undo)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undoScript();
      }
      // Ctrl/Cmd + Y или Ctrl/Cmd + Shift + Z - Повторить (Redo)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redoScript();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [script, editingScript, undoScript, redoScript]);

  // ============================================
  // ШАБЛОНЫ ПРОЕКТОВ
  // ============================================
  const projectTemplates = [
    {
      name: "Приключение героя",
      description: "Классическая история о путешествии и самопознании",
      style: "disney",
      prompt: "Молодой герой отправляется в опасное путешествие, чтобы спасти свой дом. По пути он находит верных друзей и узнаёт о скрытых силах."
    },
    {
      name: "Волшебная сказка",
      description: "Магическая история в стиле Studio Ghibli",
      style: "ghibli",
      prompt: "В обычном мире открывается портал в волшебную страну. Главный герой должен восстановить равновесие между мирами."
    },
    {
      name: "Космическая одиссея",
      description: "Научно-фантастическое приключение в стиле Pixar",
      style: "pixar",
      prompt: "Команда исследователей отправляется к далёкой планете. Они обнаруживают удивительную цивилизацию и учатся понимать друг друга."
    },
    {
      name: "Дружба животных",
      description: "Трогательная история о животных друзьях",
      style: "cartoon",
      prompt: "Два разных животных становятся лучшими друзьями и вместе преодолевают препятствия в лесу."
    },
    {
      name: "Спортивная победа",
      description: "История о команде и победе над собой",
      style: "anime",
      prompt: "Нескладная команда мечтает победить в чемпионате. Каждый участник преодолевает свои страхи и слабости."
    }
  ];

  const applyTemplate = (template: typeof projectTemplates[0]) => {
    setNewProject({
      title: template.name,
      description: template.prompt,
      style: template.style,
      duration: 30
    });
    toast({
      title: "📋 Шаблон применён",
      description: template.name,
    });
  };

  // ============================================
  // ЛОКАЛЬНОЕ ХРАНИЛИЩЕ
  // ============================================
  
  // Сохранение проекта в localStorage
  const saveToLocalStorage = () => {
    if (!script) return;
    
    setSaveStatus('saving');
    
    const projectData = {
      version: '2.6.0',
      savedAt: new Date().toISOString(),
      project: newProject,
      script,
      storyboard,
      sceneImages,
      characterImages,
      workResult
    };
    
    localStorage.setItem('fortorium_current_project', JSON.stringify(projectData));
    setLastSaveTime(new Date());
    setSaveStatus('saved');
    toast({
      title: "💾 " + (language === 'ru' ? 'Сохранено' : 'Saved'),
      description: language === 'ru' ? 'Проект сохранён в браузере' : 'Project saved in browser',
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
    <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' : 'bg-gradient-to-br from-slate-100 via-purple-100 to-slate-200'}`}>
      {/* Header */}
      <header className={`border-b ${isDarkMode ? 'border-white/10 bg-black/20' : 'border-purple-200 bg-white/60'} backdrop-blur-sm`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                <Wand2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-purple-900'} tracking-wider`}>ФОРТОРИУМ</h1>
                <p className={`text-sm ${isDarkMode ? 'text-white/60' : 'text-purple-600'}`}>Анимационная студия будущего</p>
              </div>
            </div>

            {/* Studio Stats */}
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-3 py-1.5 ${isDarkMode ? 'bg-white/5' : 'bg-purple-100'} rounded-lg`}>
                <span className="text-lg">👔</span>
                <span className={`${isDarkMode ? 'text-white' : 'text-purple-900'} text-sm font-medium`}>{director.status === 'active' ? 'Директор онлайн' : 'Директор занят'}</span>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1.5 ${isDarkMode ? 'bg-white/5' : 'bg-purple-100'} rounded-lg`}>
                <span className="text-lg">🎬</span>
                <span className={`${isDarkMode ? 'text-white' : 'text-purple-900'} text-sm font-medium`}>{projects.length} проектов</span>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1.5 ${isDarkMode ? 'bg-white/5' : 'bg-purple-100'} rounded-lg`}>
                <span className="text-lg">⭐</span>
                <span className={`${isDarkMode ? 'text-white' : 'text-purple-900'} text-sm font-medium`}>{director.reputation}%</span>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1.5 ${isDarkMode ? 'bg-white/5' : 'bg-purple-100'} rounded-lg`}>
                <span className="text-lg">👥</span>
                <span className={`${isDarkMode ? 'text-white' : 'text-purple-900'} text-sm font-medium`}>{hiredAgents.length} агентов</span>
              </div>
              
              {/* Theme Toggle */}
              <Button
                onClick={toggleTheme}
                variant="outline"
                className={`${isDarkMode ? 'border-white/20 text-white hover:bg-white/10' : 'border-purple-200 text-purple-900 hover:bg-purple-100'}`}
              >
                {isDarkMode ? '☀️' : '🌙'}
              </Button>
              
              {/* Language Toggle */}
              <Button
                onClick={toggleLanguage}
                variant="outline"
                className={`${isDarkMode ? 'border-white/20 text-white hover:bg-white/10' : 'border-purple-200 text-purple-900 hover:bg-purple-100'}`}
              >
                {language === 'ru' ? '🇷🇺' : '🇬🇧'}
              </Button>
              
              {/* Hotkeys Help */}
              <Button
                onClick={() => setShowHotkeysHelp(true)}
                variant="outline"
                className={`${isDarkMode ? 'border-white/20 text-white hover:bg-white/10' : 'border-purple-200 text-purple-900 hover:bg-purple-100'}`}
              >
                ⌨️
              </Button>
              
              {/* Presentation Mode */}
              <Button
                onClick={startPresentation}
                disabled={!script?.scenes || Object.keys(sceneImages).length === 0}
                className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 disabled:opacity-50"
              >
                📽️ {language === 'ru' ? 'Презентация' : 'Present'}
              </Button>
              
              {/* Idea Generator Button */}
              <Button
                onClick={() => setShowIdeaGenerator(true)}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              >
                💡 {language === 'ru' ? 'Идеи' : 'Ideas'}
              </Button>
              
              {/* AI Assistant Button */}
              <Button
                onClick={() => setShowAIChat(true)}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
              >
                🤖 AI
              </Button>
              
              {/* Image Agent Selector Button */}
              <Button
                onClick={() => setShowImageAgentSelector(true)}
                variant="outline"
                className={`${isDarkMode ? 'border-white/20 text-white hover:bg-white/10' : 'border-purple-200 text-purple-900 hover:bg-purple-100'}`}
              >
                {FREE_IMAGE_AGENTS.find(a => a.id === selectedImageAgent)?.icon || '🎨'} {FREE_IMAGE_AGENTS.find(a => a.id === selectedImageAgent)?.name || 'AI Art'}
              </Button>
              
              {/* Share Button */}
              <Button
                onClick={generateShareLink}
                disabled={!script}
                variant="outline"
                className={`${isDarkMode ? 'border-white/20 text-white hover:bg-white/10' : 'border-purple-200 text-purple-900 hover:bg-purple-100'} disabled:opacity-50`}
              >
                🔗 {language === 'ru' ? 'Поделиться' : 'Share'}
              </Button>
              
              {/* PDF Export Button */}
              <Button
                onClick={exportToPdf}
                disabled={!script || isExportingPdf}
                variant="outline"
                className={`${isDarkMode ? 'border-white/20 text-white hover:bg-white/10' : 'border-purple-200 text-purple-900 hover:bg-purple-100'} disabled:opacity-50`}
              >
                {isExportingPdf ? (
                  <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> PDF...</>
                ) : (
                  <>📄 PDF</>
                )}
              </Button>
              
              {/* Soundtrack Button */}
              <Button
                onClick={() => setShowSoundtrackDialog(true)}
                disabled={!script}
                variant="outline"
                className={`${isDarkMode ? 'border-white/20 text-white hover:bg-white/10' : 'border-purple-200 text-purple-900 hover:bg-purple-100'} disabled:opacity-50`}
              >
                🎵 {language === 'ru' ? 'Музыка' : 'Music'}
              </Button>
            </div>
          </div>
          
          {/* Auto-save indicator */}
          <div className="flex items-center justify-end gap-2 mt-2 text-xs">
            {saveStatus === 'saving' ? (
              <span className={`${isDarkMode ? 'text-amber-400' : 'text-amber-600'} flex items-center gap-1`}>
                <Loader2 className="w-3 h-3 animate-spin" />
                {language === 'ru' ? 'Сохранение...' : 'Saving...'}
              </span>
            ) : saveStatus === 'unsaved' ? (
              <span className={`${isDarkMode ? 'text-orange-400' : 'text-orange-600'} flex items-center gap-1`}>
                ● {language === 'ru' ? 'Не сохранено' : 'Unsaved'}
              </span>
            ) : (
              <span className={`${isDarkMode ? 'text-green-400' : 'text-green-600'} flex items-center gap-1`}>
                ✓ {language === 'ru' ? 'Сохранено' : 'Saved'} {lastSaveTime && formatSaveTime(lastSaveTime)}
              </span>
            )}
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
                {/* Templates */}
                <div className="space-y-2">
                  <label className="text-sm text-white/80">📋 Быстрый старт (шаблоны):</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {projectTemplates.map((template, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        onClick={() => applyTemplate(template)}
                        className="h-auto py-2 flex-col items-start border-white/10 text-left hover:bg-white/10"
                      >
                        <span className="text-white font-medium text-sm">{template.name}</span>
                        <span className="text-white/50 text-xs">{template.description}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                <Separator className="bg-white/10" />

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
                    <label className={`text-sm ${isDarkMode ? 'text-white/80' : 'text-purple-700'}`}>Стиль анимации</label>
                    <Select
                      value={newProject.style}
                      onValueChange={value => setNewProject({ ...newProject, style: value })}
                    >
                      <SelectTrigger className={`${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-purple-200 text-purple-900'}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className={`${isDarkMode ? 'bg-slate-800 border-white/10' : 'bg-white border-purple-200'}`}>
                        {ANIMATION_STYLES.map(style => (
                          <SelectItem key={style.value} value={style.value} className={isDarkMode ? 'text-white' : 'text-purple-900'}>
                            <span className="flex items-center gap-2">
                              <span>{style.icon}</span>
                              <span>{style.label}</span>
                              <span className={`text-xs ${isDarkMode ? 'text-white/50' : 'text-purple-400'}`}>— {style.description}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={`text-sm ${isDarkMode ? 'text-white/80' : 'text-purple-700'}`}>Описание идеи</label>
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

                {/* Hotkeys hint */}
                <div className="pt-4 border-t border-white/10">
                  <p className="text-white/40 text-xs">
                    ⌨️ Горячие клавиши: <span className="text-white/60">Ctrl+S</span> сохранить • 
                    <span className="text-white/60"> Ctrl+D</span> демо • 
                    <span className="text-white/60"> Ctrl+G</span> генерировать • 
                    <span className="text-white/60"> Ctrl+E</span> экспорт
                  </p>
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
                      
                      {/* Characters with Images */}
                      {script.characters?.length > 0 && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="text-white/60 text-xs">Персонажи ({script.characters.length}):</h5>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setShowRelationEditor(true)}
                                className="h-6 text-xs border-pink-500/30 text-pink-300 hover:bg-pink-500/10"
                              >
                                🔗 Отношения
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={generateAllCharacterImages}
                                disabled={isLoading || generatingCharacter !== null}
                                className="h-6 text-xs border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
                              >
                                🎨 Создать всех
                              </Button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {script.characters.map((c: any, i: number) => {
                              const currentVoice = VOICE_TYPES.find(v => v.id === getCharacterVoice(c.name));
                              return (
                              <div 
                                key={i} 
                                className="p-2 bg-white/5 rounded-lg border border-white/10 flex items-center gap-2"
                              >
                                {characterImages[c.name]?.imageUrl ? (
                                  <img 
                                    src={characterImages[c.name].imageUrl}
                                    alt={c.name}
                                    className="w-10 h-10 rounded-full object-cover border-2 border-amber-500/30"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-lg">
                                    {generatingCharacter === c.name ? (
                                      <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                                    ) : (
                                      '🎭'
                                    )}
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="text-white text-sm font-medium truncate">{c.name}</div>
                                  <div className="text-white/40 text-xs truncate">
                                    {currentVoice?.icon} {currentVoice?.name || 'Рассказчик'}
                                  </div>
                                </div>
                                {/* Voice Selection Button v2.9.0 */}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => { setSelectedCharacterForVoice(c.name); setShowVoiceSelector(true); }}
                                  className="h-8 w-8 p-0 hover:bg-purple-500/20"
                                  title={language === 'ru' ? 'Выбрать голос' : 'Select voice'}
                                >
                                  🎙️
                                </Button>
                                {/* Voice Preview Button */}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => playVoicePreview(c.name)}
                                  className="h-8 w-8 p-0 hover:bg-blue-500/20"
                                  title={language === 'ru' ? 'Прослушать голос' : 'Preview voice'}
                                >
                                  <Volume2 className="w-3 h-3 text-blue-400" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => generateCharacterImage(c.name, c.description)}
                                  disabled={generatingCharacter !== null}
                                  className="h-8 w-8 p-0"
                                  title="Сгенерировать изображение"
                                >
                                  {generatingCharacter === c.name ? (
                                    <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
                                  ) : characterImages[c.name]?.imageUrl ? (
                                    <CheckCircle className="w-3 h-3 text-green-400" />
                                  ) : (
                                    <Palette className="w-3 h-3 text-white/40" />
                                  )}
                                </Button>
                              </div>
                            );})}
                          </div>
                        </div>
                      )}

                      {/* Scenes with Images */}
                      {script.scenes?.length > 0 && (
                        <div className="space-y-3 mt-4">
                          <div className="flex items-center justify-between">
                            <h5 className="text-white/60 text-xs">Сцены ({script.scenes.length}):</h5>
                            <div className="flex items-center gap-2">
                              {/* Batch Operations */}
                              {selectedScenes.size > 0 && (
                                <>
                                  <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-300">
                                    Выбрано: {selectedScenes.size}
                                  </Badge>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setShowBatchEditDialog(true)}
                                    className="h-6 text-xs border-blue-500/30 text-blue-300 hover:bg-blue-500/10"
                                  >
                                    ⏱️ Изменить время
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={batchGenerateSceneImages}
                                    disabled={isLoading}
                                    className="h-6 text-xs border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
                                  >
                                    🎨 Генерировать
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={batchDeleteScenes}
                                    className="h-6 text-xs border-red-500/30 text-red-300 hover:bg-red-500/10"
                                  >
                                    🗑️ Удалить
                                  </Button>
                                </>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={selectedScenes.size > 0 ? deselectAllScenes : selectAllScenes}
                                className="h-6 text-xs border-white/20 text-white/60 hover:bg-white/10"
                              >
                                {selectedScenes.size > 0 ? '✖ Снять выбор' : '✓ Выбрать все'}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={generateAllSceneImages}
                                disabled={isLoading || !script?.scenes}
                                className="h-6 text-xs border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
                              >
                                🎨 Сгенерировать все
                              </Button>
                            </div>
                          </div>
                          
                          {/* Visual Timeline v2.9.0 */}
                          {showVisualTimeline && script.scenes.length > 0 && (
                            <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-white/60 text-xs">📊 Визуальный таймлайн</span>
                                <span className="text-white/40 text-xs">
                                  {script.totalDuration || script.scenes.reduce((s: number, sc: any) => s + (sc.duration || 0), 0)}с
                                </span>
                              </div>
                              <div className="flex gap-1 overflow-x-auto pb-2">
                                {script.scenes.map((scene: any, i: number) => {
                                  const totalDur = script.totalDuration || script.scenes.reduce((s: number, sc: any) => s + (sc.duration || 0), 0);
                                  const width = getSceneTimelineWidth(scene.duration || 5, totalDur);
                                  const isSelected = selectedScenes.has(i);
                                  
                                  return (
                                    <div
                                      key={i}
                                      onClick={() => toggleSceneSelection(i)}
                                      className={`relative flex-shrink-0 h-12 rounded-lg cursor-pointer transition-all
                                        bg-gradient-to-r ${getSceneColor(i)} 
                                        ${isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' : 'opacity-80 hover:opacity-100'}
                                      `}
                                      style={{ width: `${width}px` }}
                                      title={`Сцена ${scene.number}: ${scene.title} (${scene.duration}с)`}
                                    >
                                      <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-white text-xs font-bold drop-shadow-lg">
                                          {scene.number}
                                        </span>
                                      </div>
                                      <div className="absolute bottom-0 left-0 right-0 bg-black/30 px-1 py-0.5 rounded-b-lg">
                                        <span className="text-white/80 text-[10px]">{scene.duration}с</span>
                                      </div>
                                      {sceneImages[i]?.imageUrl && (
                                        <div className="absolute top-1 right-1 w-2 h-2 bg-green-400 rounded-full" />
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                          
                          {script.scenes.map((scene: any, i: number) => (
                            <div key={i} className={`p-3 bg-white/5 rounded-lg border ${selectedScenes.has(i) ? 'border-amber-500/50 bg-amber-500/5' : 'border-white/10'}`}>
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  {/* Scene Selection Checkbox */}
                                  <input
                                    type="checkbox"
                                    checked={selectedScenes.has(i)}
                                    onChange={() => toggleSceneSelection(i)}
                                    className="w-4 h-4 rounded border-white/20 bg-white/5"
                                  />
                                  <div>
                                    <span className="text-white font-medium text-sm">Сцена {scene.number}:</span>{' '}
                                    <span className="text-amber-300">{scene.title}</span>
                                  </div>
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
                      {/* Export buttons row 1 */}
                      <div className="flex gap-2">
                        <Button
                          onClick={saveToLocalStorage}
                          variant="outline"
                          className="flex-1 border-blue-500/30 text-blue-300 hover:bg-blue-500/10"
                        >
                          💾 Сохранить
                        </Button>
                        <Button
                          onClick={exportProject}
                          variant="outline"
                          className="flex-1 border-green-500/30 text-green-300 hover:bg-green-500/10"
                        >
                          📥 JSON
                        </Button>
                        <Button
                          onClick={exportScriptDocument}
                          variant="outline"
                          className="flex-1 border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
                        >
                          📄 Печать/PDF
                        </Button>
                      </div>
                      {/* Export buttons row 2 */}
                      <div className="flex gap-2">
                        <Button
                          onClick={startSlideshow}
                          variant="outline"
                          disabled={Object.keys(sceneImages).length === 0}
                          className="flex-1 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 disabled:opacity-50"
                        >
                          🎬 Слайд-шоу
                        </Button>
                        <Button
                          onClick={copyScriptToClipboard}
                          variant="outline"
                          className="flex-1 border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
                        >
                          📋 Копировать
                        </Button>
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
                              Создаём...
                            </>
                          ) : (
                            <>
                              🎬 Видео
                            </>
                          )}
                        </Button>
                      </div>
                      
                      {/* Undo/Redo buttons */}
                      <div className="flex gap-2">
                        <Button
                          onClick={undoScript}
                          disabled={historyIndex <= 0}
                          variant="outline"
                          className="flex-1 border-blue-500/30 text-blue-300 hover:bg-blue-500/10 disabled:opacity-50"
                        >
                          ↩️ Отменить (Ctrl+Z)
                        </Button>
                        <Button
                          onClick={redoScript}
                          disabled={historyIndex >= scriptHistory.length - 1}
                          variant="outline"
                          className="flex-1 border-green-500/30 text-green-300 hover:bg-green-500/10 disabled:opacity-50"
                        >
                          ↪️ Повторить (Ctrl+Y)
                        </Button>
                        <label className="flex-1">
                          <input
                            type="file"
                            accept=".json"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                importProject(file);
                              }
                            }}
                          />
                          <Button
                            variant="outline"
                            className="w-full border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10"
                            asChild
                          >
                            <span>📥 Импорт</span>
                          </Button>
                        </label>
                      </div>
                      
                      {/* Statistics Panel */}
                      {getProjectStats() && (
                        <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-lg p-4 border border-white/10">
                          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                            📊 Статистика проекта
                          </h4>
                          <div className="grid grid-cols-4 gap-4 text-center">
                            <div className="bg-white/5 rounded-lg p-3">
                              <div className="text-2xl font-bold text-purple-400">{getProjectStats()?.totalScenes}</div>
                              <div className="text-xs text-white/60">Сцен</div>
                            </div>
                            <div className="bg-white/5 rounded-lg p-3">
                              <div className="text-2xl font-bold text-pink-400">{getProjectStats()?.totalCharacters}</div>
                              <div className="text-xs text-white/60">Персонажей</div>
                            </div>
                            <div className="bg-white/5 rounded-lg p-3">
                              <div className="text-2xl font-bold text-cyan-400">{getProjectStats()?.totalDuration}с</div>
                              <div className="text-xs text-white/60">Длительность</div>
                            </div>
                            <div className="bg-white/5 rounded-lg p-3">
                              <div className="text-2xl font-bold text-amber-400">{getProjectStats()?.totalDialogue}</div>
                              <div className="text-xs text-white/60">Реплик</div>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center gap-2">
                            <span className="text-sm text-white/60">Прогресс:</span>
                            <div className="flex-1 bg-white/10 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-green-400 to-emerald-400 h-2 rounded-full transition-all"
                                style={{ width: `${getProjectStats()?.progress}%` }}
                              />
                            </div>
                            <span className="text-sm text-green-400">{getProjectStats()?.progress}%</span>
                          </div>
                          <div className="mt-2 flex justify-between text-xs text-white/40">
                            <span>Изображений: {getProjectStats()?.generatedImages}/{getProjectStats()?.totalScenes}</span>
                            <span>Персонажей: {getProjectStats()?.generatedCharacters}/{getProjectStats()?.totalCharacters}</span>
                            <span>Стиль: {getProjectStats()?.style}</span>
                          </div>
                        </div>
                      )}
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

      {/* Slideshow Modal */}
      {showSlideshow && script?.scenes && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          <div className="relative w-full h-full flex flex-col">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h2 className="text-white text-xl font-bold">{script.title}</h2>
                  <span className="text-white/60 text-sm">
                    Сцена {currentSlide + 1} из {Object.keys(sceneImages).length}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setShowSlideshow(false)}
                  className="text-white hover:bg-white/10"
                >
                  ✕ Закрыть
                </Button>
              </div>
            </div>

            {/* Main Image */}
            <div className="flex-1 flex items-center justify-center p-8">
              {sceneImages[currentSlide]?.imageUrl ? (
                <img
                  src={sceneImages[currentSlide].imageUrl}
                  alt={`Сцена ${currentSlide + 1}`}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                />
              ) : (
                <div className="text-white/40 text-center">
                  <Film className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Изображение не сгенерировано</p>
                </div>
              )}
            </div>

            {/* Scene Info */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
              <div className="max-w-4xl mx-auto">
                <h3 className="text-white text-2xl font-bold mb-2">
                  {script.scenes[currentSlide]?.title}
                </h3>
                <p className="text-white/70 mb-4">
                  {script.scenes[currentSlide]?.description}
                </p>
                {script.scenes[currentSlide]?.dialogue?.length > 0 && (
                  <div className="space-y-2">
                    {script.scenes[currentSlide].dialogue.slice(0, 2).map((d: any, i: number) => (
                      <p key={i} className="text-white/60 text-sm">
                        <span className="text-amber-400 font-medium">{d.character}:</span> "{d.line}"
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Navigation */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Button
                variant="ghost"
                onClick={prevSlide}
                disabled={currentSlide === 0}
                className="text-white hover:bg-white/10 h-16 w-16 rounded-full"
              >
                ◀
              </Button>
            </div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <Button
                variant="ghost"
                onClick={nextSlide}
                className="text-white hover:bg-white/10 h-16 w-16 rounded-full"
              >
                ▶
              </Button>
            </div>

            {/* Progress Dots */}
            <div className="absolute bottom-32 left-1/2 -translate-x-1/2 flex gap-2">
              {Object.keys(sceneImages).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    i === currentSlide ? 'bg-white scale-125' : 'bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI Idea Generator Modal */}
      {showIdeaGenerator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-auto shadow-2xl`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-purple-900'} flex items-center gap-2`}>
                💡 Генератор идей
              </h2>
              <Button
                variant="ghost"
                onClick={() => setShowIdeaGenerator(false)}
                className={`${isDarkMode ? 'text-white hover:bg-white/10' : 'text-purple-900 hover:bg-purple-100'}`}
              >
                ✕
              </Button>
            </div>
            
            <p className={`${isDarkMode ? 'text-white/60' : 'text-purple-600'} mb-4`}>
              Выберите жанр и получите уникальные идеи для вашего мультфильма
            </p>
            
            {/* Genre Selection */}
            <div className="grid grid-cols-4 gap-2 mb-6">
              {GENRES.map(genre => (
                <button
                  key={genre.value}
                  onClick={() => setSelectedGenre(genre.value)}
                  className={`p-3 rounded-lg border-2 transition-all text-center ${
                    selectedGenre === genre.value
                      ? 'border-purple-500 bg-purple-500/20'
                      : isDarkMode
                        ? 'border-white/10 bg-white/5 hover:border-white/20'
                        : 'border-purple-200 bg-purple-50 hover:border-purple-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{genre.icon}</div>
                  <div className={`text-sm ${isDarkMode ? 'text-white' : 'text-purple-900'}`}>{genre.label}</div>
                </button>
              ))}
            </div>
            
            {/* Generate Button */}
            <Button
              onClick={generateIdeas}
              disabled={isGeneratingIdeas}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 py-6 text-lg mb-6"
            >
              {isGeneratingIdeas ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Генерируем идеи...
                </>
              ) : (
                <>✨ Сгенерировать идеи</>
              )}
            </Button>
            
            {/* Generated Ideas */}
            {generatedIdeas.length > 0 && (
              <div className="space-y-3">
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-purple-900'}`}>
                  Выберите идею:
                </h3>
                {generatedIdeas.map((idea, index) => (
                  <div
                    key={index}
                    onClick={() => applyIdea(idea)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      isDarkMode
                        ? 'border-white/10 bg-white/5 hover:border-purple-500 hover:bg-purple-500/10'
                        : 'border-purple-200 bg-purple-50 hover:border-purple-400 hover:bg-purple-100'
                    }`}
                  >
                    <p className={`${isDarkMode ? 'text-white' : 'text-purple-900'}`}>{idea}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Scene Navigation (When script is loaded) */}
      {script?.scenes && script.scenes.length > 0 && (
        <div className={`fixed left-4 top-1/2 -translate-y-1/2 z-40 ${isDarkMode ? 'bg-black/40' : 'bg-white/80'} backdrop-blur-sm rounded-xl p-2 border ${isDarkMode ? 'border-white/10' : 'border-purple-200'}`}>
          <div className="space-y-2">
            <div className={`text-xs ${isDarkMode ? 'text-white/60' : 'text-purple-600'} text-center mb-2`}>{language === 'ru' ? 'Сцены' : 'Scenes'}</div>
            {script.scenes.map((scene: any, index: number) => (
              <button
                key={index}
                onClick={() => setSelectedSceneIndex(index)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
                  selectedSceneIndex === index
                    ? 'bg-purple-500 text-white'
                    : isDarkMode
                      ? 'bg-white/10 text-white hover:bg-white/20'
                      : 'bg-purple-100 text-purple-900 hover:bg-purple-200'
                } ${sceneImages[index] ? 'ring-2 ring-green-500/50' : ''}`}
                title={scene.title}
              >
                {index + 1}
              </button>
            ))}
            {/* Notes toggle button */}
            <button
              onClick={() => setShowNotesPanel(!showNotesPanel)}
              className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm transition-all ${
                showNotesPanel
                  ? 'bg-amber-500 text-white'
                  : isDarkMode
                    ? 'bg-white/10 text-white hover:bg-white/20'
                    : 'bg-purple-100 text-purple-900 hover:bg-purple-200'
              }`}
              title={language === 'ru' ? 'Заметки' : 'Notes'}
            >
              📝
            </button>
          </div>
        </div>
      )}

      {/* Presentation Mode */}
      {presentationMode && script?.scenes && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col">
          {/* Top bar */}
          <div className="flex items-center justify-between p-4 bg-black/50">
            <h2 className="text-white text-xl font-bold">{script.title}</h2>
            <div className="flex items-center gap-4">
              <span className="text-white/60">
                {language === 'ru' ? `Сцена ${selectedSceneIndex + 1} из ${script.scenes.length}` : `Scene ${selectedSceneIndex + 1} of ${script.scenes.length}`}
              </span>
              <Button
                onClick={() => setPresentationMode(false)}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                ✕ {language === 'ru' ? 'Выход' : 'Exit'}
              </Button>
            </div>
          </div>
          
          {/* Main content */}
          <div className="flex-1 flex items-center justify-center relative">
            {sceneImages[selectedSceneIndex]?.imageUrl ? (
              <img
                src={sceneImages[selectedSceneIndex].imageUrl}
                alt={`Scene ${selectedSceneIndex + 1}`}
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <div className="text-white/40 text-center">
                <Film className="w-24 h-24 mx-auto mb-4 opacity-50" />
                <p className="text-xl">{language === 'ru' ? 'Изображение не сгенерировано' : 'Image not generated'}</p>
              </div>
            )}
            
            {/* Navigation arrows */}
            <button
              onClick={prevPresentationScene}
              disabled={selectedSceneIndex === 0}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-white text-2xl transition-all"
            >
              ◀
            </button>
            <button
              onClick={nextPresentationScene}
              disabled={selectedSceneIndex >= script.scenes.length - 1}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-white text-2xl transition-all"
            >
              ▶
            </button>
          </div>
          
          {/* Bottom info */}
          <div className="p-6 bg-gradient-to-t from-black via-black/80 to-transparent">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-white text-2xl font-bold mb-2">
                {script.scenes[selectedSceneIndex]?.title}
              </h3>
              <p className="text-white/70 text-lg mb-3">
                {script.scenes[selectedSceneIndex]?.description}
              </p>
              {script.scenes[selectedSceneIndex]?.dialogue?.length > 0 && (
                <div className="space-y-2">
                  {script.scenes[selectedSceneIndex].dialogue.slice(0, 2).map((d: any, i: number) => (
                    <p key={i} className="text-white/60">
                      <span className="text-amber-400 font-medium">{d.character}:</span> "{d.line}"
                    </p>
                  ))}
                </div>
              )}
            </div>
            
            {/* Progress dots */}
            <div className="flex justify-center gap-2 mt-4">
              {script.scenes.map((_: any, i: number) => (
                <button
                  key={i}
                  onClick={() => setSelectedSceneIndex(i)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    i === selectedSceneIndex ? 'bg-white scale-125' : 'bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Hotkeys Help Modal */}
      {showHotkeysHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-2xl p-6 max-w-lg w-full mx-4 shadow-2xl`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-purple-900'} flex items-center gap-2`}>
                ⌨️ {language === 'ru' ? 'Горячие клавиши' : 'Hotkeys'}
              </h2>
              <Button
                variant="ghost"
                onClick={() => setShowHotkeysHelp(false)}
                className={`${isDarkMode ? 'text-white hover:bg-white/10' : 'text-purple-900 hover:bg-purple-100'}`}
              >
                ✕
              </Button>
            </div>
            
            <div className="space-y-3">
              {[
                { key: 'Ctrl + S', action: language === 'ru' ? 'Сохранить проект' : 'Save project' },
                { key: 'Ctrl + N', action: language === 'ru' ? 'Новый проект' : 'New project' },
                { key: 'Ctrl + D', action: language === 'ru' ? 'Демо проект' : 'Demo project' },
                { key: 'Ctrl + G', action: language === 'ru' ? 'Генерировать изображения' : 'Generate images' },
                { key: 'Ctrl + E', action: language === 'ru' ? 'Экспорт проекта' : 'Export project' },
                { key: 'Ctrl + Z', action: language === 'ru' ? 'Отменить' : 'Undo' },
                { key: 'Ctrl + Y', action: language === 'ru' ? 'Повторить' : 'Redo' },
                { key: '← / →', action: language === 'ru' ? 'Навигация по сценам' : 'Navigate scenes' },
                { key: 'Space', action: language === 'ru' ? 'Следующая сцена (в презентации)' : 'Next scene (in presentation)' },
                { key: 'Escape', action: language === 'ru' ? 'Закрыть / Выйти' : 'Close / Exit' },
              ].map((item, index) => (
                <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${isDarkMode ? 'bg-white/5' : 'bg-purple-50'}`}>
                  <span className={`${isDarkMode ? 'text-white/80' : 'text-purple-700'}`}>{item.action}</span>
                  <kbd className={`px-3 py-1 rounded ${isDarkMode ? 'bg-purple-500/30 text-purple-300' : 'bg-purple-200 text-purple-900'} font-mono text-sm`}>
                    {item.key}
                  </kbd>
                </div>
              ))}
            </div>
            
            <Button
              onClick={() => setShowHotkeysHelp(false)}
              className="w-full mt-6 bg-gradient-to-r from-purple-500 to-pink-500"
            >
              {language === 'ru' ? 'Понятно!' : 'Got it!'}
            </Button>
          </div>
        </div>
      )}

      {/* Notes Panel */}
      {showNotesPanel && script?.scenes && (
        <div className={`fixed right-4 top-1/2 -translate-y-1/2 z-40 w-80 ${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl shadow-2xl border ${isDarkMode ? 'border-white/10' : 'border-purple-200'}`}>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-purple-900'}`}>
                📝 {language === 'ru' ? 'Заметки к сцене' : 'Scene Notes'} {selectedSceneIndex + 1}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotesPanel(false)}
                className={`${isDarkMode ? 'text-white hover:bg-white/10' : 'text-purple-900 hover:bg-purple-100'}`}
              >
                ✕
              </Button>
            </div>
            
            {/* Existing notes */}
            <div className="space-y-2 mb-4 max-h-60 overflow-auto">
              {sceneNotes[selectedSceneIndex]?.map((note, index) => (
                <div key={index} className={`p-2 rounded-lg ${isDarkMode ? 'bg-white/5' : 'bg-purple-50'} flex items-start justify-between gap-2`}>
                  <span className={`text-sm ${isDarkMode ? 'text-white/80' : 'text-purple-700'}`}>{note}</span>
                  <button
                    onClick={() => removeSceneNote(selectedSceneIndex, index)}
                    className="text-red-400 hover:text-red-300 text-xs"
                  >
                    ✕
                  </button>
                </div>
              )) || (
                <p className={`text-sm ${isDarkMode ? 'text-white/40' : 'text-purple-400'} text-center`}>
                  {language === 'ru' ? 'Нет заметок' : 'No notes yet'}
                </p>
              )}
            </div>
            
            {/* Add note */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addSceneNote(selectedSceneIndex, newNote)}
                placeholder={language === 'ru' ? 'Новая заметка...' : 'New note...'}
                className={`flex-1 px-3 py-2 rounded-lg ${isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder:text-white/40' : 'bg-purple-50 border-purple-200 text-purple-900 placeholder:text-purple-400'} border focus:outline-none focus:ring-2 focus:ring-purple-500`}
              />
              <Button
                onClick={() => addSceneNote(selectedSceneIndex, newNote)}
                className="bg-purple-500 hover:bg-purple-600"
              >
                +
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* AI Chat Modal */}
      {showAIChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-2xl w-full max-w-lg mx-4 h-[600px] flex flex-col shadow-2xl`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-purple-900'} flex items-center gap-2`}>
                🤖 {language === 'ru' ? 'AI Ассистент' : 'AI Assistant'}
              </h2>
              <Button
                variant="ghost"
                onClick={() => setShowAIChat(false)}
                className={`${isDarkMode ? 'text-white hover:bg-white/10' : 'text-purple-900 hover:bg-purple-100'}`}
              >
                ✕
              </Button>
            </div>
            
            {/* Quick Commands */}
            <div className="p-3 border-b border-white/10 flex gap-2 flex-wrap">
              {quickAiCommands.map((cmd, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setAiInput(cmd.command);
                  }}
                  className={`px-3 py-1.5 rounded-full text-sm ${isDarkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-purple-100 text-purple-900 hover:bg-purple-200'} transition-all`}
                >
                  {cmd.label}
                </button>
              ))}
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-auto p-4 space-y-4">
              {aiMessages.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-5xl mb-4">🤖</div>
                  <p className={`${isDarkMode ? 'text-white/60' : 'text-purple-600'}`}>
                    {language === 'ru' 
                      ? 'Привет! Я AI-ассистент. Задайте мне вопрос о вашем проекте.'
                      : 'Hello! I\'m AI assistant. Ask me anything about your project.'}
                  </p>
                </div>
              ) : (
                aiMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl ${
                        msg.role === 'user'
                          ? 'bg-purple-500 text-white rounded-br-md'
                          : isDarkMode
                            ? 'bg-white/10 text-white rounded-bl-md'
                            : 'bg-purple-100 text-purple-900 rounded-bl-md'
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-sm">{msg.content}</div>
                    </div>
                  </div>
                ))
              )}
              {isAiLoading && (
                <div className="flex justify-start">
                  <div className={`${isDarkMode ? 'bg-white/10' : 'bg-purple-100'} p-3 rounded-2xl rounded-bl-md`}>
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className={`text-sm ${isDarkMode ? 'text-white' : 'text-purple-900'}`}>
                        {language === 'ru' ? 'Думаю...' : 'Thinking...'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Input */}
            <div className="p-4 border-t border-white/10">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendAiMessage()}
                  placeholder={language === 'ru' ? 'Введите сообщение...' : 'Type a message...'}
                  className={`flex-1 px-4 py-2 rounded-xl ${isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder:text-white/40' : 'bg-purple-50 border-purple-200 text-purple-900 placeholder:text-purple-400'} border focus:outline-none focus:ring-2 focus:ring-purple-500`}
                />
                <Button
                  onClick={sendAiMessage}
                  disabled={!aiInput.trim() || isAiLoading}
                  className="bg-purple-500 hover:bg-purple-600 disabled:opacity-50 rounded-xl px-4"
                >
                  📤
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Agent Selector Modal */}
      {showImageAgentSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-2xl p-6 max-w-lg w-full mx-4 shadow-2xl`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-purple-900'} flex items-center gap-2`}>
                🎨 {language === 'ru' ? 'AI Художники' : 'AI Artists'}
              </h2>
              <Button
                variant="ghost"
                onClick={() => setShowImageAgentSelector(false)}
                className={`${isDarkMode ? 'text-white hover:bg-white/10' : 'text-purple-900 hover:bg-purple-100'}`}
              >
                ✕
              </Button>
            </div>
            
            <p className={`${isDarkMode ? 'text-white/60' : 'text-purple-600'} mb-4`}>
              {language === 'ru' 
                ? 'Выберите бесплатного AI-художника для генерации изображений:' 
                : 'Select a free AI artist to generate images:'}
            </p>
            
            {/* Agent Cards */}
            <div className="space-y-3">
              {FREE_IMAGE_AGENTS.filter(a => a.enabled).map(agent => (
                <button
                  key={agent.id}
                  onClick={() => {
                    setSelectedImageAgent(agent.id);
                    setShowImageAgentSelector(false);
                    toast({
                      title: `🎨 ${agent.name}`,
                      description: language === 'ru' ? 'Выбран для генерации изображений' : 'Selected for image generation',
                    });
                  }}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    selectedImageAgent === agent.id
                      ? 'border-purple-500 bg-purple-500/10'
                      : isDarkMode
                        ? 'border-white/10 hover:border-white/30 hover:bg-white/5'
                        : 'border-purple-200 hover:border-purple-400 hover:bg-purple-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{agent.icon}</span>
                    <div className="flex-1">
                      <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-purple-900'}`}>{agent.name}</div>
                      <div className={`text-sm ${isDarkMode ? 'text-white/60' : 'text-purple-600'}`}>{agent.description}</div>
                    </div>
                    {selectedImageAgent === agent.id && (
                      <CheckCircle className="w-5 h-5 text-purple-500" />
                    )}
                  </div>
                </button>
              ))}
            </div>
            
            {/* Free badge */}
            <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <span>✨</span>
                <span>
                  {language === 'ru' 
                    ? 'Все агенты работают бесплатно и без ограничений!' 
                    : 'All agents work for free without limits!'}
                </span>
              </div>
            </div>
            
            <Button
              onClick={() => setShowImageAgentSelector(false)}
              className="w-full mt-6 bg-gradient-to-r from-purple-500 to-pink-500"
            >
              {language === 'ru' ? 'Готово' : 'Done'}
            </Button>
          </div>
        </div>
      )}

      {/* Share Dialog */}
      {showShareDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-2xl p-6 max-w-lg w-full mx-4 shadow-2xl`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-purple-900'} flex items-center gap-2`}>
                🔗 {language === 'ru' ? 'Поделиться проектом' : 'Share Project'}
              </h2>
              <Button
                variant="ghost"
                onClick={() => setShowShareDialog(false)}
                className={`${isDarkMode ? 'text-white hover:bg-white/10' : 'text-purple-900 hover:bg-purple-100'}`}
              >
                ✕
              </Button>
            </div>
            
            <p className={`${isDarkMode ? 'text-white/60' : 'text-purple-600'} mb-4`}>
              {language === 'ru' 
                ? 'Скопируйте ссылку и отправьте коллегам. Они смогут открыть ваш проект.' 
                : 'Copy the link and share with colleagues. They can open your project.'}
            </p>
            
            {/* Share Link Input */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={shareLink}
                readOnly
                className={`flex-1 px-4 py-3 rounded-xl ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-purple-50 border-purple-200 text-purple-900'} border text-sm`}
              />
              <Button
                onClick={copyShareLink}
                className="bg-purple-500 hover:bg-purple-600 rounded-xl px-4"
              >
                📋 {language === 'ru' ? 'Копировать' : 'Copy'}
              </Button>
            </div>
            
            {/* QR Code Placeholder */}
            <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-white/5' : 'bg-purple-50'} text-center mb-4`}>
              <div className="text-6xl mb-2">📱</div>
              <p className={`text-sm ${isDarkMode ? 'text-white/60' : 'text-purple-600'}`}>
                {language === 'ru' ? 'Отсканируйте QR-код в мобильном приложении' : 'Scan QR code in mobile app'}
              </p>
            </div>
            
            {/* Social Share Buttons */}
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={() => window.open(`https://t.me/share/url?url=${encodeURIComponent(shareLink)}&text=${encodeURIComponent(script?.title || 'ФОРТОРИУМ проект')}`, '_blank')}
                variant="outline"
                className={`flex-1 ${isDarkMode ? 'border-white/20 text-white hover:bg-white/10' : 'border-purple-200 text-purple-900 hover:bg-purple-100'}`}
              >
                📱 Telegram
              </Button>
              <Button
                onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(shareLink)}`, '_blank')}
                variant="outline"
                className={`flex-1 ${isDarkMode ? 'border-white/20 text-white hover:bg-white/10' : 'border-purple-200 text-purple-900 hover:bg-purple-100'}`}
              >
                💬 WhatsApp
              </Button>
              <Button
                onClick={() => window.open(`mailto:?subject=${encodeURIComponent(script?.title || 'ФОРТОРИУМ проект')}&body=${encodeURIComponent(shareLink)}`, '_blank')}
                variant="outline"
                className={`flex-1 ${isDarkMode ? 'border-white/20 text-white hover:bg-white/10' : 'border-purple-200 text-purple-900 hover:bg-purple-100'}`}
              >
                ✉️ Email
              </Button>
            </div>
            
            <Button
              onClick={() => setShowShareDialog(false)}
              className="w-full mt-6 bg-gradient-to-r from-purple-500 to-pink-500"
            >
              {language === 'ru' ? 'Готово' : 'Done'}
            </Button>
          </div>
        </div>
      )}

      {/* Soundtrack Dialog */}
      {showSoundtrackDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-2xl p-6 max-w-lg w-full mx-4 shadow-2xl`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-purple-900'} flex items-center gap-2`}>
                🎵 {language === 'ru' ? 'Саундтрек проекта' : 'Project Soundtrack'}
              </h2>
              <Button
                variant="ghost"
                onClick={() => setShowSoundtrackDialog(false)}
                className={`${isDarkMode ? 'text-white hover:bg-white/10' : 'text-purple-900 hover:bg-purple-100'}`}
              >
                ✕
              </Button>
            </div>
            
            <p className={`${isDarkMode ? 'text-white/60' : 'text-purple-600'} mb-4`}>
              {language === 'ru' 
                ? 'Выберите настроение для музыкального сопровождения вашего проекта:' 
                : 'Select a mood for your project musical accompaniment:'}
            </p>
            
            {/* Mood Selection */}
            <div className="grid grid-cols-2 gap-2 mb-6">
              {SOUNDTRACK_MOODS_CONFIG.map(mood => (
                <button
                  key={mood.value}
                  onClick={() => setSoundtrackMood(mood.value as any)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    soundtrackMood === mood.value
                      ? 'border-purple-500 bg-purple-500/10'
                      : isDarkMode
                        ? 'border-white/10 hover:border-white/30 hover:bg-white/5'
                        : 'border-purple-200 hover:border-purple-400 hover:bg-purple-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{mood.icon}</span>
                    <div>
                      <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-purple-900'}`}>
                        {language === 'ru' ? mood.labelRu : mood.labelEn}
                      </div>
                      <div className={`text-xs ${isDarkMode ? 'text-white/60' : 'text-purple-600'}`}>
                        {language === 'ru' ? mood.descRu : mood.descEn}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            
            {/* Generate Button */}
            <Button
              onClick={generateSoundtrack}
              disabled={generatingSoundtrack}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 py-6 text-lg mb-4"
            >
              {generatingSoundtrack ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {language === 'ru' ? 'Генерация...' : 'Generating...'}
                </>
              ) : (
                <>🎵 {language === 'ru' ? 'Создать саундтрек' : 'Create Soundtrack'}</>
              )}
            </Button>
            
            {/* Current Soundtrack */}
            {projectSoundtrack && (
              <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-white/5' : 'bg-purple-50'} mb-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🎵</span>
                    <div>
                      <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-purple-900'}`}>
                        {language === 'ru' ? 'Музыкальная тема' : 'Musical Theme'}
                      </div>
                      <div className={`text-sm ${isDarkMode ? 'text-white/60' : 'text-purple-600'}`}>
                        {script?.title}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={playingSoundtrack ? stopSoundtrack : playSoundtrack}
                      className={`${playingSoundtrack ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                    >
                      {playingSoundtrack ? '⏹️' : '▶️'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Info */}
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <div className="flex items-center gap-2 text-blue-400 text-sm">
                <span>ℹ️</span>
                <span>
                  {language === 'ru' 
                    ? 'Саундтрек создаётся на основе стиля и настроения проекта' 
                    : 'Soundtrack is created based on project style and mood'}
                </span>
              </div>
            </div>
            
            <Button
              onClick={() => setShowSoundtrackDialog(false)}
              className="w-full mt-4"
              variant="outline"
            >
              {language === 'ru' ? 'Закрыть' : 'Close'}
            </Button>
          </div>
        </div>
      )}

      {/* Scene Timeline */}
      {script?.scenes && showTimeline && !presentationMode && (
        <div className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-40 ${isDarkMode ? 'bg-black/80' : 'bg-white/90'} backdrop-blur-sm rounded-xl p-3 border ${isDarkMode ? 'border-white/10' : 'border-purple-200'} shadow-2xl max-w-4xl w-full mx-4`}>
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-purple-900'}`}>
              📊 {language === 'ru' ? 'Таймлайн' : 'Timeline'}
            </span>
            <button
              onClick={() => setShowTimeline(false)}
              className={`ml-auto ${isDarkMode ? 'text-white/40 hover:text-white' : 'text-purple-400 hover:text-purple-600'}`}
            >
              ✕
            </button>
          </div>
          <div className="flex items-center gap-1 overflow-x-auto pb-2">
            {script.scenes.map((scene: any, index: number) => {
              const totalDuration = script.scenes.reduce((sum: number, s: any) => sum + (s.duration || 5), 0);
              const width = ((scene.duration || 5) / totalDuration) * 100;
              
              return (
                <div
                  key={index}
                  onClick={() => setSelectedSceneIndex(index)}
                  className={`relative cursor-pointer group transition-all ${
                    selectedSceneIndex === index ? 'ring-2 ring-purple-500' : ''
                  }`}
                  style={{ minWidth: `${Math.max(width * 3, 40)}px` }}
                >
                  <div
                    className={`h-8 rounded ${sceneImages[index] 
                      ? selectedSceneIndex === index 
                        ? 'bg-green-500' 
                        : 'bg-green-500/60'
                      : selectedSceneIndex === index
                        ? 'bg-purple-500'
                        : isDarkMode 
                          ? 'bg-white/20' 
                          : 'bg-purple-200'
                    } flex items-center justify-center`}
                  >
                    <span className={`text-xs font-medium ${isDarkMode ? 'text-white' : 'text-purple-900'}`}>
                      {index + 1}
                    </span>
                  </div>
                  <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded ${isDarkMode ? 'bg-slate-700' : 'bg-purple-100'} text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 ${isDarkMode ? 'text-white' : 'text-purple-900'}`}>
                    {scene.title} ({scene.duration || 5}с)
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className={`text-xs ${isDarkMode ? 'text-white/40' : 'text-purple-400'}`}>
              {language === 'ru' ? 'Всего:' : 'Total:'} {script.totalDuration || script.scenes.reduce((sum: number, s: any) => sum + (s.duration || 0), 0)}{language === 'ru' ? 'с' : 's'}
            </span>
            <span className={`text-xs ${isDarkMode ? 'text-white/40' : 'text-purple-400'}`}>
              {language === 'ru' ? 'Зелёный = изображение есть' : 'Green = image exists'}
            </span>
          </div>
        </div>
      )}

      {/* Version History Button */}
      {projectVersions.length > 0 && (
        <div className={`fixed left-4 bottom-4 z-40 ${isDarkMode ? 'bg-black/40' : 'bg-white/80'} backdrop-blur-sm rounded-xl p-2 border ${isDarkMode ? 'border-white/10' : 'border-purple-200'}`}>
          <button
            onClick={() => setShowTimeline(!showTimeline)}
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${isDarkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-purple-100 text-purple-900 hover:bg-purple-200'}`}
            title={language === 'ru' ? 'Показать/скрыть таймлайн' : 'Show/hide timeline'}
          >
            📊
          </button>
        </div>
      )}

      {/* Voice Selector Dialog v2.9.0 */}
      {showVoiceSelector && selectedCharacterForVoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-purple-900'} flex items-center gap-2`}>
                🎙️ {language === 'ru' ? 'Выбор голоса' : 'Voice Selection'}
              </h2>
              <Button
                variant="ghost"
                onClick={() => { setShowVoiceSelector(false); setSelectedCharacterForVoice(null); }}
                className={`${isDarkMode ? 'text-white hover:bg-white/10' : 'text-purple-900 hover:bg-purple-100'}`}
              >
                ✕
              </Button>
            </div>
            
            <p className={`${isDarkMode ? 'text-white/60' : 'text-purple-600'} mb-4`}>
              {language === 'ru' ? `Выберите голос для ${selectedCharacterForVoice}:` : `Select voice for ${selectedCharacterForVoice}:`}
            </p>
            
            <div className="grid grid-cols-2 gap-2">
              {VOICE_TYPES.map(voice => (
                <button
                  key={voice.id}
                  onClick={() => {
                    setCharacterVoice(selectedCharacterForVoice, voice.id);
                    setShowVoiceSelector(false);
                    setSelectedCharacterForVoice(null);
                  }}
                  className={`p-3 rounded-xl border-2 transition-all text-left ${
                    characterVoices[selectedCharacterForVoice] === voice.id
                      ? 'border-purple-500 bg-purple-500/10'
                      : isDarkMode
                        ? 'border-white/10 hover:border-white/30 hover:bg-white/5'
                        : 'border-purple-200 hover:border-purple-400 hover:bg-purple-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{voice.icon}</span>
                    <div>
                      <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-purple-900'}`}>
                        {language === 'ru' ? voice.name : voice.nameEn}
                      </div>
                      <div className={`text-xs ${isDarkMode ? 'text-white/60' : 'text-purple-600'}`}>
                        {voice.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Character Relations Dialog v2.9.0 */}
      {showRelationEditor && script?.characters && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-2xl p-6 max-w-lg w-full mx-4 shadow-2xl max-h-[80vh] overflow-y-auto`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-purple-900'} flex items-center gap-2`}>
                🔗 {language === 'ru' ? 'Отношения персонажей' : 'Character Relations'}
              </h2>
              <Button
                variant="ghost"
                onClick={() => setShowRelationEditor(false)}
                className={`${isDarkMode ? 'text-white hover:bg-white/10' : 'text-purple-900 hover:bg-purple-100'}`}
              >
                ✕
              </Button>
            </div>
            
            {/* Current Relations */}
            {characterRelations.length > 0 && (
              <div className="mb-6">
                <h3 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-white/80' : 'text-purple-800'}`}>
                  {language === 'ru' ? 'Текущие отношения:' : 'Current relations:'}
                </h3>
                <div className="space-y-2">
                  {characterRelations.map((rel, i) => {
                    const relType = RELATIONSHIP_TYPES.find(r => r.id === rel.type);
                    return (
                      <div key={i} className={`flex items-center justify-between p-2 rounded-lg ${isDarkMode ? 'bg-white/5' : 'bg-purple-50'}`}>
                        <div className="flex items-center gap-2">
                          <span className={isDarkMode ? 'text-white' : 'text-purple-900'}>{rel.character1}</span>
                          <span>{relType?.icon || '🔗'}</span>
                          <span className={isDarkMode ? 'text-white' : 'text-purple-900'}>{rel.character2}</span>
                          <Badge variant="outline" style={{ borderColor: relType?.color, color: relType?.color }}>
                            {language === 'ru' ? relType?.name : relType?.nameEn}
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeCharacterRelation(rel.character1, rel.character2)}
                          className="text-red-400 hover:text-red-300"
                        >
                          ✕
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Add New Relation */}
            <div className="space-y-4">
              <h3 className={`text-sm font-medium ${isDarkMode ? 'text-white/80' : 'text-purple-800'}`}>
                {language === 'ru' ? 'Добавить отношение:' : 'Add relation:'}
              </h3>
              
              <div className="grid grid-cols-3 gap-2 items-center">
                <select 
                  id="char1-select"
                  className={`p-2 rounded-lg ${isDarkMode ? 'bg-white/10 text-white border-white/20' : 'bg-white text-purple-900 border-purple-200'} border`}
                >
                  {script.characters.map((c: any) => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
                
                <select 
                  id="relation-type-select"
                  className={`p-2 rounded-lg ${isDarkMode ? 'bg-white/10 text-white border-white/20' : 'bg-white text-purple-900 border-purple-200'} border`}
                >
                  {RELATIONSHIP_TYPES.map(r => (
                    <option key={r.id} value={r.id}>{r.icon} {language === 'ru' ? r.name : r.nameEn}</option>
                  ))}
                </select>
                
                <select 
                  id="char2-select"
                  className={`p-2 rounded-lg ${isDarkMode ? 'bg-white/10 text-white border-white/20' : 'bg-white text-purple-900 border-purple-200'} border`}
                >
                  {script.characters.map((c: any) => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              
              <Button
                onClick={() => {
                  const char1 = (document.getElementById('char1-select') as HTMLSelectElement)?.value;
                  const char2 = (document.getElementById('char2-select') as HTMLSelectElement)?.value;
                  const type = (document.getElementById('relation-type-select') as HTMLSelectElement)?.value;
                  if (char1 && char2 && type && char1 !== char2) {
                    addCharacterRelation(char1, char2, type);
                  }
                }}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
              >
                ➕ {language === 'ru' ? 'Добавить отношение' : 'Add Relation'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Batch Edit Duration Dialog v2.9.0 */}
      {showBatchEditDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-purple-900'} flex items-center gap-2`}>
                ⏱️ {language === 'ru' ? 'Изменить длительность' : 'Change Duration'}
              </h2>
              <Button
                variant="ghost"
                onClick={() => setShowBatchEditDialog(false)}
                className={`${isDarkMode ? 'text-white hover:bg-white/10' : 'text-purple-900 hover:bg-purple-100'}`}
              >
                ✕
              </Button>
            </div>
            
            <p className={`${isDarkMode ? 'text-white/60' : 'text-purple-600'} mb-4`}>
              {language === 'ru' 
                ? `Изменить длительность для ${selectedScenes.size} выбранных сцен:` 
                : `Change duration for ${selectedScenes.size} selected scenes:`}
            </p>
            
            <div className="flex items-center gap-4 mb-6">
              <Input
                type="number"
                min={1}
                max={60}
                value={batchDuration}
                onChange={(e) => setBatchDuration(parseInt(e.target.value) || 5)}
                className={`${isDarkMode ? 'bg-white/10 border-white/20 text-white' : 'bg-white border-purple-200 text-purple-900'}`}
              />
              <span className={isDarkMode ? 'text-white/60' : 'text-purple-600'}>
                {language === 'ru' ? 'секунд' : 'seconds'}
              </span>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={() => setShowBatchEditDialog(false)}
                variant="outline"
                className="flex-1"
              >
                {language === 'ru' ? 'Отмена' : 'Cancel'}
              </Button>
              <Button
                onClick={() => batchUpdateSceneDuration(batchDuration)}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
              >
                ✅ {language === 'ru' ? 'Применить' : 'Apply'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center py-6 text-white/40 text-sm border-t border-white/5">
        <div className="flex items-center justify-between max-w-7xl mx-auto px-4">
          <div>
            ФОРТОРИУМ © 2024 | 
            <a href="https://github.com/evikass/fortorium_01" className="text-purple-400 hover:underline ml-1">GitHub</a>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs bg-purple-500/20 px-2 py-1 rounded text-purple-300">
              v2.9.0
            </span>
          </div>
        </div>
      </footer>

      {/* Version Badge - Fixed Bottom Right */}
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-gradient-to-r from-purple-600/90 to-pink-600/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg border border-white/10">
          <span className="text-white text-xs font-medium">ФОРТОРИУМ v2.9.0</span>
        </div>
      </div>
    </div>
  );
}

