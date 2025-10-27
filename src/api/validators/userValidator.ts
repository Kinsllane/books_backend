import Joi from 'joi';

export const getUserSchema = {
  params: Joi.object({
    id: Joi.string()
      .uuid()
      .required()
      .messages({
        'string.guid': 'User ID must be a valid UUID',
        'any.required': 'User ID is required',
      }),
  }),
};

export const updateProfileSchema = {
  body: Joi.object({
    name: Joi.string()
      .alphanum()
      .min(3)
      .max(100)
      .messages({
        'string.alphanum': 'Name must contain only alphanumeric characters',
        'string.min': 'Name must be at least 3 characters long',
        'string.max': 'Name must be at most 100 characters long',
        'string.empty': 'Name cannot be empty',
      }),
    avatarUrl: Joi.string()
      .uri()
      .max(500)
      .messages({
        'string.uri': 'Avatar URL must be a valid URI',
        'string.max': 'Avatar URL must be at most 500 characters long',
      }),
    bio: Joi.string()
      .trim()
      .max(5000)
      .messages({
        'string.max': 'Bio must be at most 5000 characters long',
      }),
    password: Joi.string()
      .min(6)
      .max(255)
      .messages({
        'string.min': 'Password must be at least 6 characters long',
        'string.max': 'Password must be at most 255 characters long',
        'string.empty': 'Password cannot be empty',
      }),
  }).min(1).messages({
    'object.min': 'At least one field must be provided',
  }),
};

export const topUpBalanceSchema = {
  body: Joi.object({
    amount: Joi.number()
      .positive()
      .precision(2)
      .max(100000)
      .required()
      .messages({
        'number.positive': 'Amount must be a positive number',
        'number.max': 'Amount cannot exceed 100000',
        'any.required': 'Amount is required',
      }),
  }),
};

export const deleteUserSchema = {
  params: Joi.object({
    id: Joi.string()
      .uuid()
      .required()
      .messages({
        'string.guid': 'User ID must be a valid UUID',
        'any.required': 'User ID is required',
      }),
  }),
};

