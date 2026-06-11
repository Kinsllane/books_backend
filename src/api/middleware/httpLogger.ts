import { Request, Response, NextFunction } from 'express';

export const httpLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
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
  
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    
    // Логируем в консоль
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    const userId = req.user ? (req.user as any).id : '-';
    const logMessage = `[HTTP] ${req.method} ${req.originalUrl} ${res.statusCode} ${responseTime}ms | IP: ${ip} | User: ${userId}`;
    
    if (res.statusCode >= 400) {
      console.warn(logMessage);
    } else {
      console.log(logMessage);
    }
  });
  
  next();
};