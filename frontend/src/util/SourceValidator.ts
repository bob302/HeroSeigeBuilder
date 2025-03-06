// Функция для проверки безопасности значений в JSON
export function sanitizeJsonValues(data: any, path: string = ''): any {
  // Базовый случай для примитивных типов
  if (data === null || data === undefined) {
    return data;
  }
  
  // Проверка строк на наличие опасных URL
  if (typeof data === 'string') {
    // Проверка на потенциально опасные URL-схемы
    const dangerousSchemes = /^(javascript|data|vbscript|file):/i;
    if (dangerousSchemes.test(data)) {
      console.warn(`Обнаружено потенциально опасное значение по пути ${path}: ${data}`);
      
      // Для изображений заменяем на дефолтное
      if (path.endsWith('image') || path.includes('image.')) {
        return '/img/editor/f.png';
      }
      
      // Для других строк удаляем опасную часть
      return data.replace(dangerousSchemes, 'invalid:');
    }
    return data;
  }
  
  // Рекурсивная обработка массивов
  if (Array.isArray(data)) {
    return data.map((item, index) => 
      sanitizeJsonValues(item, `${path}[${index}]`)
    );
  }
  
  // Рекурсивная обработка объектов
  if (typeof data === 'object') {
    const result = { ...data };
    for (const key in result) {
      if (Object.prototype.hasOwnProperty.call(result, key)) {
        result[key] = sanitizeJsonValues(result[key], path ? `${path}.${key}` : key);
      }
    }
    return result;
  }
  
  // Числа, логические значения и другие примитивы возвращаем как есть
  return data;
}

// Расширенная функция валидации изображений (оставляем прежнюю версию)
export function isValidImageSource(imageUrl?: string): boolean {
  if (!imageUrl) return true;
  
  // Проверка на javascript: в URL
  if (imageUrl.toLowerCase().includes('javascript:')) {
    return false;
  }
  
  // Проверка на data: URL
  if (imageUrl.toLowerCase().startsWith('data:')) {
    return false;
  }
  
  // Проверка на другие потенциально опасные схемы
  if (/^(vbscript|file):/i.test(imageUrl)) {
    return false;
  }
  
  // Список разрешенных источников
  const allowedSources = [
    '/img/',
    '/classes/',
    '/runewords/',
    '/items/'
  ];
  
  // Проверка на внешние URL
  if (imageUrl.match(/^https?:\/\//i)) {
    try {
      const url = new URL(imageUrl);
      const allowedDomains = [
        'yourdomain.com',
        'cdn.yourdomain.com',
      ];
      
      return allowedDomains.some(domain => 
        url.hostname === domain || url.hostname.endsWith(`.${domain}`)
      );
    } catch (e) {
      // Если URL некорректный, считаем его небезопасным
      return false;
    }
  }
  
  return allowedSources.some(source => imageUrl.startsWith(source));
}

// Глобальная функция предварительной проверки всего JSON перед десериализацией
export function secureParse(jsonString: string): any {
  try {
    // Сначала парсим строку в объект
    const parsed = JSON.parse(jsonString);
    
    // Затем проверяем и очищаем все потенциально опасные значения
    return sanitizeJsonValues(parsed);
  } catch (error) {
    console.error('Ошибка при парсинге JSON:', error);
    throw new Error('Некорректный JSON формат');
  }
}