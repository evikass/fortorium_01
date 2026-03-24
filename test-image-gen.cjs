const ZAI = require('z-ai-web-dev-sdk').default;

async function test() {
  try {
    console.log('Инициализация AI SDK...');
    const zai = await ZAI.create();
    console.log('✅ AI SDK инициализирован');
    
    console.log('Генерация тестового изображения...');
    const result = await zai.images.generations.create({
      prompt: 'A cute cat in cartoon style',
      size: '1024x1024'
    });
    
    console.log('✅ Изображение сгенерировано!');
    console.log('Base64 длина:', result.data[0].base64?.length || 0);
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    console.error('Stack:', error.stack);
  }
}

test();
