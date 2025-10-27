import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export interface ValidationSchema {
  body?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
}

export const validate = (schema: ValidationSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: any[] = [];

    // Валидация body
    if (schema.body) {
      const { error } = schema.body.validate(req.body, { abortEarly: false });
      if (error) {
        errors.push({
          source: 'body',
          errors: error.details.map((detail) => ({
            message: detail.message,
            path: detail.path.join('.'),
          })),
        });
      }
    }

    // Валидация query
    if (schema.query) {
      const { error } = schema.query.validate(req.query, { abortEarly: false });
      if (error) {
        errors.push({
          source: 'query',
          errors: error.details.map((detail) => ({
            message: detail.message,
            path: detail.path.join('.'),
          })),
        });
      }
    }

    // Валидация params
    if (schema.params) {
      const { error } = schema.params.validate(req.params, { abortEarly: false });
      if (error) {
        errors.push({
          source: 'params',
          errors: error.details.map((detail) => ({
            message: detail.message,
            path: detail.path.join('.'),
          })),
        });
      }
    }

    // Если есть ошибки, возвращаем их
    if (errors.length > 0) {
      res.status(400).json({
        error: 'Validation error',
        details: errors,
      });
      return;
    }

    next();
  };
};

