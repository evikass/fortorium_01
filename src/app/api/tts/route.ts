import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

// TTS API - озвучка текста
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, character } = body;
    
    if (!text) {
      return NextResponse.json({ error: 'Текст не указан' }, { status: 400 });
    }
    
    console.log('🎤 TTS запрос:', { character, textLength: text.length });
    
    // Инициализируем AI
    const zai = await ZAI.create();
    
    if (!zai) {
      return NextResponse.json({ error: 'AI не инициализирован' }, { status: 500 });
    }
    
    // Генерируем речь
    try {
      const response = await zai.audio.speech.create({
        input: text,
        voice: character === 'Директор' ? 'onyx' : 
               character?.includes('женщ') || character?.includes('Девушка') ? 'nova' : 
               character?.includes('стар') ? 'echo' : 'alloy',
        response_format: 'mp3'
      });
      
      // Получаем аудио данные
      const audioBuffer = await response.arrayBuffer();
      const base64Audio = Buffer.from(audioBuffer).toString('base64');
      
      console.log('✅ Аудио сгенерировано:', base64Audio.length);
      
      return NextResponse.json({
        success: true,
        audioUrl: `data:audio/mp3;base64,${base64Audio}`,
        character,
        textLength: text.length
      });
      
    } catch (ttsError: any) {
      console.error('❌ Ошибка TTS:', ttsError?.message || ttsError);
      
      // Возвращаем заглушку если TTS не работает
      return NextResponse.json({
        success: false,
        error: 'TTS недоступен',
        message: 'Озвучка будет добавлена позже'
      });
    }
    
  } catch (error) {
    console.error('❌ Ошибка в TTS API:', error);
    return NextResponse.json({ 
      success: false, 
      error: String(error) 
    }, { status: 500 });
  }
}
