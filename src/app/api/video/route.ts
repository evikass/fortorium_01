import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { db } from '@/lib/db';

export const maxDuration = 120; // 2 минуты для видео

// Video Generation API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { images, projectId, title } = body;
    
    console.log('🎬 Video generation request:', { 
      imageCount: images?.length, 
      projectId,
      title 
    });
    
    if (!images || images.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Нет изображений для создания видео' 
      }, { status: 400 });
    }
    
    // Инициализируем AI
    const zai = await ZAI.create();
    
    if (!zai) {
      return NextResponse.json({ 
        success: false, 
        error: 'AI не инициализирован' 
      }, { status: 500 });
    }
    
    // Берём первое изображение для генерации видео
    const firstImage = images[0];
    
    // Извлекаем base64 из data URL
    const base64Data = firstImage.imageUrl?.replace(/^data:image\/\w+;base64,/, '');
    
    if (!base64Data) {
      return NextResponse.json({ 
        success: false, 
        error: 'Неверный формат изображения' 
      }, { status: 400 });
    }
    
    console.log('🎥 Генерация видео из изображения...');
    
    try {
      // Генерируем видео через AI SDK
      const videoResponse = await zai.videos.generate({
        image: base64Data,
        prompt: `Cinematic animation scene: ${title || 'Animation scene'}. Smooth camera movement, professional quality, high detail.`,
        duration: 5
      });
      
      if (videoResponse.videoUrl) {
        console.log('✅ Видео сгенерировано:', videoResponse.videoUrl);
        
        // Сохраняем информацию о видео в проект
        if (projectId) {
          try {
            await db.animationProject.update({
              where: { id: projectId },
              data: {
                finalVideoUrl: videoResponse.videoUrl,
                status: 'completed'
              }
            });
          } catch (dbError) {
            console.error('Error saving video to project:', dbError);
          }
        }
        
        return NextResponse.json({
          success: true,
          videoUrl: videoResponse.videoUrl,
          message: 'Видео успешно создано!'
        });
      }
      
    } catch (videoError: any) {
      console.error('❌ Ошибка генерации видео:', videoError?.message || videoError);
      
      // Если видео не генерируется, возвращаем заглушку
      return NextResponse.json({
        success: false,
        error: 'Видео генерация временно недоступна',
        message: 'Попробуйте позже или используйте изображения как раскадровку'
      });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Не удалось создать видео'
    });
    
  } catch (error) {
    console.error('❌ Ошибка в Video API:', error);
    return NextResponse.json({ 
      success: false, 
      error: String(error) 
    }, { status: 500 });
  }
}

// GET - получить статус генерации видео
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');
  
  try {
    if (projectId) {
      const project = await db.animationProject.findUnique({
        where: { id: projectId },
        select: { finalVideoUrl: true, status: true }
      });
      
      return NextResponse.json({
        success: true,
        videoUrl: project?.finalVideoUrl,
        status: project?.status
      });
    }
    
    return NextResponse.json({ success: false, error: 'Project ID не указан' });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
