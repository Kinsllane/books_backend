import { Request, Response, NextFunction } from 'express';
import HttpLog from '../../models/logs/HttpLog';

export const httpLogger = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const startTime = Date.now();
  
  // Сохраняем оригинальный метод res.json и res.end
  const originalJson = res.json.bind(res);
  const originalEnd = res.end.bind(res);
  
  let responseBody: any = null;
  let requestBody: any = null;
  
  // Сохраняем тело запроса (кроме паролей)
  if (req.body && Object.keys(req.body).length > 0) {
    requestBody = { ...req.body };
    // Удаляем пароль из лога
    if (requestBody.password) {
      requestBody.password = '***hidden***';
    }
  }
  
  // Переопределяем res.json для сохранения ответа
  res.json = function(body: any): Response {
    responseBody = body;
    return originalJson(body);
  };
  
  res.end = function(chunk?: any): Response {
    return originalEnd(chunk);
  };
  
  res.on('finish', async () => {
    const responseTime = Date.now() - startTime;
    
    try {
      // Получаем IP адрес
      const ip = req.ip || req.connection.remoteAddress || 'unknown';
      
      // Получаем userId из запроса (если есть)
      const userId = req.user ? (req.user as any).id : undefined;
      
      // Логируем в MongoDB
      await HttpLog.create({
        method: req.method,
        url: req.originalUrl || req.url,
        statusCode: res.statusCode,
        responseTime,
        ip: ip.toString(),
        userAgent: req.get('user-agent'),
        userId,
        requestBody,
        responseBody,
        error: res.statusCode >= 400 ? 'HTTP Error' : undefined,
        timestamp: new Date()
      });
    } catch (error) {
      // Не прерываем выполнение при ошибке логирования
      console.error('Failed to log HTTP request:', error);
    }
  });
  
  next();
};

