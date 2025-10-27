import Joi from 'joi';

export const createBookSchema = {
  body: Joi.object({
    title: Joi.string()
      .trim()
      .min(1)
      .max(255)
      .required()
      .messages({
        'string.min': 'Title must be at least 1 character long',
        'string.max': 'Title must be at most 255 characters long',
        'any.required': 'Title is required',
        'string.empty': 'Title cannot be empty',
      }),
    author: Joi.string()
      .trim()
      .min(1)
      .max(255)
      .required()
      .messages({
        'string.min': 'Author must be at least 1 character long',
        'string.max': 'Author must be at most 255 characters long',
        'any.required': 'Author is required',
        'string.empty': 'Author cannot be empty',
      }),
    description: Joi.string()
      .trim()
      .min(1)
      .required()
      .messages({
        'string.min': 'Description must be at least 1 character long',
        'any.required': 'Description is required',
        'string.empty': 'Description cannot be empty',
      }),
    coverImageUrl: Joi.string()
      .uri()
      .max(500)
      .default('/book-cover-default.png')
      .messages({
        'string.uri': 'Cover image URL must be a valid URI',
        'string.max': 'Cover image URL must be at most 500 characters long',
      }),
    isForSale: Joi.boolean().default(false),
    isForTrade: Joi.boolean().default(false),
    priceValue: Joi.when('isForSale', {
      is: true,
      then: Joi.number()
        .positive()
        .precision(2)
        .required()
        .messages({
          'number.positive': 'Price must be a positive number',
          'any.required': 'Price is required when book is for sale',
        }),
      otherwise: Joi.number().positive().precision(2).allow(null).optional(),
    }),
    publicationYear: Joi.number()
      .integer()
      .min(1000)
      .max(new Date().getFullYear() + 5)
      .required()
      .messages({
        'number.min': 'Publication year must be at least 1000',
        'number.max': 'Publication year cannot be in the future more than 5 years',
        'any.required': 'Publication year is required',
      }),
    genre: Joi.string()
      .trim()
      .max(50)
      .default('Другое')
      .messages({
        'string.max': 'Genre must be at most 50 characters long',
      }),
  }),
};

export const updateBookSchema = {
  body: Joi.object({
    title: Joi.string().trim().min(1).max(255).messages({
      'string.min': 'Title must be at least 1 character long',
      'string.max': 'Title must be at most 255 characters long',
      'string.empty': 'Title cannot be empty',
    }),
    author: Joi.string().trim().min(1).max(255).messages({
      'string.min': 'Author must be at least 1 character long',
      'string.max': 'Author must be at most 255 characters long',
      'string.empty': 'Author cannot be empty',
    }),
    description: Joi.string().trim().min(1).messages({
      'string.min': 'Description must be at least 1 character long',
      'string.empty': 'Description cannot be empty',
    }),
    coverImageUrl: Joi.string().uri().max(500).messages({
      'string.uri': 'Cover image URL must be a valid URI',
      'string.max': 'Cover image URL must be at most 500 characters long',
    }),
    isForSale: Joi.boolean(),
    isForTrade: Joi.boolean(),
    priceValue: Joi.number().positive().precision(2).allow(null),
    publicationYear: Joi.number()
      .integer()
      .min(1000)
      .max(new Date().getFullYear() + 5)
      .messages({
        'number.min': 'Publication year must be at least 1000',
        'number.max': 'Publication year cannot be in the future more than 5 years',
      }),
    genre: Joi.string().trim().max(50).messages({
      'string.max': 'Genre must be at most 50 characters long',
    }),
  }).min(1).messages({
    'object.min': 'At least one field must be provided',
  }),
  params: Joi.object({
    id: Joi.string().uuid().required().messages({
      'string.guid': 'Book ID must be a valid UUID',
      'any.required': 'Book ID is required',
    }),
  }),
};

export const getBookSchema = {
  params: Joi.object({
    id: Joi.string().uuid().required().messages({
      'string.guid': 'Book ID must be a valid UUID',
      'any.required': 'Book ID is required',
    }),
  }),
};

export const deleteBookSchema = {
  params: Joi.object({
    id: Joi.string().uuid().required().messages({
      'string.guid': 'Book ID must be a valid UUID',
      'any.required': 'Book ID is required',
    }),
  }),
};

export const getBooksQuerySchema = {
  query: Joi.object({
    search: Joi.string().trim().max(255).allow(''),
    genre: Joi.string().trim().max(50),
    forSale: Joi.string().valid('true', 'false').messages({
      'any.only': 'forSale must be either true or false',
    }),
    forTrade: Joi.string().valid('true', 'false').messages({
      'any.only': 'forTrade must be either true or false',
    }),
  }),
};

