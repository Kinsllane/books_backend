import Joi from 'joi';

export const proposeTradeSchema = {
  body: Joi.object({
    initiatorBookId: Joi.string()
      .uuid()
      .required()
      .messages({
        'string.guid': 'Initiator book ID must be a valid UUID',
        'any.required': 'Initiator book ID is required',
      }),
    recipientBookId: Joi.string()
      .uuid()
      .required()
      .messages({
        'string.guid': 'Recipient book ID must be a valid UUID',
        'any.required': 'Recipient book ID is required',
      }),
  }),
};

export const respondToTradeSchema = {
  params: Joi.object({
    id: Joi.string()
      .uuid()
      .required()
      .messages({
        'string.guid': 'Trade ID must be a valid UUID',
        'any.required': 'Trade ID is required',
      }),
  }),
  body: Joi.object({
    response: Joi.string()
      .valid('accepted', 'rejected')
      .required()
      .messages({
        'any.only': 'Response must be either accepted or rejected',
        'any.required': 'Response is required',
      }),
  }),
};

export const cancelTradeSchema = {
  params: Joi.object({
    id: Joi.string()
      .uuid()
      .required()
      .messages({
        'string.guid': 'Trade ID must be a valid UUID',
        'any.required': 'Trade ID is required',
      }),
  }),
};

