import Joi from 'joi';

export const registerSchema = {
  body: Joi.object({
    username: Joi.string()
      .alphanum()
      .min(3)
      .max(100)
      .required()
      .messages({
        'string.alphanum': 'Username must contain only alphanumeric characters',
        'string.min': 'Username must be at least 3 characters long',
        'string.max': 'Username must be at most 100 characters long',
        'any.required': 'Username is required',
        'string.empty': 'Username cannot be empty',
      }),
    password: Joi.string()
      .min(6)
      .max(255)
      .required()
      .messages({
        'string.min': 'Password must be at least 6 characters long',
        'string.max': 'Password must be at most 255 characters long',
        'any.required': 'Password is required',
        'string.empty': 'Password cannot be empty',
      }),
  }),
};

export const loginSchema = {
  body: Joi.object({
    username: Joi.string()
      .required()
      .messages({
        'any.required': 'Username is required',
        'string.empty': 'Username cannot be empty',
      }),
    password: Joi.string()
      .required()
      .messages({
        'any.required': 'Password is required',
        'string.empty': 'Password cannot be empty',
      }),
  }),
};

