import swaggerJsdoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'BookSwap API Documentation',
    version: '1.0.0',
    description: 'REST API documentation for BookSwap - Book trading platform',
    contact: {
      name: 'API Support',
      email: 'support@bookswap.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: 'http://localhost:3001',
      description: 'Development server'
    },
    {
      url: 'https://api.bookswap.com',
      description: 'Production server'
    }
  ],
  tags: [
    {
      name: 'Authentication',
      description: 'User authentication endpoints'
    },
    {
      name: 'Users',
      description: 'User management endpoints'
    },
    {
      name: 'Books',
      description: 'Book management endpoints'
    },
    {
      name: 'Trades',
      description: 'Book trading endpoints'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token obtained from login endpoint'
      }
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'User unique identifier'
          },
          name: {
            type: 'string',
            description: 'Username'
          },
          balance: {
            type: 'number',
            format: 'decimal',
            description: 'User balance in credits'
          },
          registrationDate: {
            type: 'string',
            format: 'date',
            description: 'User registration date'
          },
          role: {
            type: 'string',
            enum: ['user', 'admin'],
            description: 'User role'
          },
          avatarUrl: {
            type: 'string',
            description: 'URL to user avatar'
          },
          bio: {
            type: 'string',
            description: 'User bio'
          },
          createdAt: {
            type: 'string',
            format: 'date-time'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      Book: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'Book unique identifier'
          },
          title: {
            type: 'string',
            description: 'Book title'
          },
          author: {
            type: 'string',
            description: 'Book author'
          },
          isbn: {
            type: 'string',
            description: 'Book ISBN'
          },
          genre: {
            type: 'string',
            description: 'Book genre'
          },
          description: {
            type: 'string',
            description: 'Book description'
          },
          price: {
            type: 'number',
            format: 'decimal',
            description: 'Book price in credits'
          },
          stained: {
            type: 'boolean',
            description: 'Is book stained?'
          },
          forSale: {
            type: 'boolean',
            description: 'Is book for sale?'
          },
          forTrade: {
            type: 'boolean',
            description: 'Is book for trade?'
          },
          currentOwnerId: {
            type: 'string',
            format: 'uuid',
            description: 'Current owner ID'
          },
          createdAt: {
            type: 'string',
            format: 'date-time'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      Trade: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'Trade unique identifier'
          },
          initiatorId: {
            type: 'string',
            format: 'uuid',
            description: 'Trade initiator ID'
          },
          recipientId: {
            type: 'string',
            format: 'uuid',
            description: 'Trade recipient ID'
          },
          initiatorBookId: {
            type: 'string',
            format: 'uuid',
            description: 'Book offered by initiator'
          },
          recipientBookId: {
            type: 'string',
            format: 'uuid',
            description: 'Book offered by recipient'
          },
          status: {
            type: 'string',
            enum: ['pending', 'accepted', 'rejected', 'cancelled'],
            description: 'Trade status'
          },
          createdAt: {
            type: 'string',
            format: 'date-time'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            description: 'Error message'
          },
          details: {
            type: 'array',
            items: {
              type: 'object'
            },
            description: 'Error details (for validation errors)'
          }
        }
      },
      SuccessResponse: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            description: 'Success message'
          }
        }
      }
    }
  }
};

const options = {
  definition: swaggerDefinition,
  apis: ['./dist/api/routes/*.js', './src/api/routes/*.ts']
};

export const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;

