const bearerAuth = [{ bearerAuth: [] }];

const errorResponse = {
  description: 'Request could not be completed.',
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/ErrorResponse' },
    },
  },
};

export const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Inventory API',
    version: '1.0.0',
    description:
      'A REST API for inventory management with role-based access control and auditable stock movements.',
  },
  servers: [{ url: 'http://localhost:3001', description: 'Local development server' }],
  tags: [
    { name: 'Health', description: 'Application status' },
    { name: 'Authentication', description: 'Access and current user' },
    { name: 'Categories', description: 'Product categories' },
    { name: 'Products', description: 'Inventory catalogue' },
    { name: 'Stock', description: 'Immutable stock movement history' },
  ],
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Check application health',
        responses: { '200': { description: 'API is available' } },
      },
    },
    '/api/v1/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register the initial administrator',
        description: 'This endpoint can only be used while no users exist.',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterInput' } } } },
        responses: { '201': { description: 'Administrator created' }, '403': errorResponse, '422': errorResponse },
      },
    },
    '/api/v1/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Sign in and obtain a Bearer token',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginInput' } } } },
        responses: { '200': { description: 'Authenticated successfully' }, '401': errorResponse, '422': errorResponse },
      },
    },
    '/api/v1/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Get the authenticated user',
        security: bearerAuth,
        responses: { '200': { description: 'Current user' }, '401': errorResponse },
      },
    },
    '/api/v1/categories': {
      get: {
        tags: ['Categories'],
        summary: 'List categories',
        security: bearerAuth,
        responses: { '200': { description: 'Category list' }, '401': errorResponse },
      },
      post: {
        tags: ['Categories'],
        summary: 'Create a category',
        security: bearerAuth,
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CategoryInput' } } } },
        responses: { '201': { description: 'Category created' }, '401': errorResponse, '403': errorResponse, '409': errorResponse },
      },
    },
    '/api/v1/categories/{id}': {
      patch: {
        tags: ['Categories'],
        summary: 'Rename a category',
        security: bearerAuth,
        parameters: [{ $ref: '#/components/parameters/Id' }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CategoryInput' } } } },
        responses: { '200': { description: 'Category updated' }, '401': errorResponse, '403': errorResponse, '404': errorResponse },
      },
    },
    '/api/v1/categories/{id}/deactivate': {
      patch: {
        tags: ['Categories'],
        summary: 'Deactivate a category without deleting it',
        security: bearerAuth,
        parameters: [{ $ref: '#/components/parameters/Id' }],
        responses: { '200': { description: 'Category deactivated' }, '401': errorResponse, '403': errorResponse, '404': errorResponse },
      },
    },
    '/api/v1/products': {
      get: {
        tags: ['Products'],
        summary: 'List active products with filters and pagination',
        security: bearerAuth,
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'categoryId', in: 'query', schema: { type: 'string' } },
        ],
        responses: { '200': { description: 'Paginated product list' }, '401': errorResponse },
      },
      post: {
        tags: ['Products'],
        summary: 'Create a product',
        security: bearerAuth,
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ProductInput' } } } },
        responses: { '201': { description: 'Product created' }, '401': errorResponse, '403': errorResponse, '404': errorResponse, '409': errorResponse },
      },
    },
    '/api/v1/products/{id}': {
      get: {
        tags: ['Products'],
        summary: 'Get a product by ID',
        security: bearerAuth,
        parameters: [{ $ref: '#/components/parameters/Id' }],
        responses: { '200': { description: 'Product details' }, '401': errorResponse, '404': errorResponse },
      },
      patch: {
        tags: ['Products'],
        summary: 'Update a product',
        security: bearerAuth,
        parameters: [{ $ref: '#/components/parameters/Id' }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ProductUpdateInput' } } } },
        responses: { '200': { description: 'Product updated' }, '401': errorResponse, '403': errorResponse, '404': errorResponse, '409': errorResponse },
      },
    },
    '/api/v1/products/{id}/deactivate': {
      patch: {
        tags: ['Products'],
        summary: 'Deactivate a product without losing its history',
        security: bearerAuth,
        parameters: [{ $ref: '#/components/parameters/Id' }],
        responses: { '200': { description: 'Product deactivated' }, '401': errorResponse, '403': errorResponse, '404': errorResponse },
      },
    },
    '/api/v1/stock/movements': {
      get: {
        tags: ['Stock'],
        summary: 'List stock movements',
        security: bearerAuth,
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
          { name: 'productId', in: 'query', schema: { type: 'string' } },
          { name: 'type', in: 'query', schema: { type: 'string', enum: ['IN', 'OUT'] } },
        ],
        responses: { '200': { description: 'Paginated movement history' }, '401': errorResponse },
      },
      post: {
        tags: ['Stock'],
        summary: 'Record an incoming or outgoing stock movement',
        description: 'An outgoing movement cannot make stock negative. Each movement is immutable and records its author.',
        security: bearerAuth,
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/StockMovementInput' } } } },
        responses: { '201': { description: 'Movement created and current stock calculated' }, '400': errorResponse, '401': errorResponse, '404': errorResponse },
      },
    },
    '/api/v1/stock/products/{productId}': {
      get: {
        tags: ['Stock'],
        summary: 'Get the calculated current stock for a product',
        security: bearerAuth,
        parameters: [{ name: 'productId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Product and calculated stock' }, '401': errorResponse, '404': errorResponse },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    parameters: {
      Id: { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: { error: { type: 'object', properties: { message: { type: 'string', example: 'Product not found.' } } } },
      },
      RegisterInput: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', example: 'Carlos' },
          email: { type: 'string', format: 'email', example: 'carlos@example.com' },
          password: { type: 'string', format: 'password', example: 'SafePassword123!' },
        },
      },
      LoginInput: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'carlos@example.com' },
          password: { type: 'string', format: 'password', example: 'SafePassword123!' },
        },
      },
      CategoryInput: {
        type: 'object',
        required: ['name'],
        properties: { name: { type: 'string', example: 'Electronics' } },
      },
      ProductInput: {
        type: 'object',
        required: ['sku', 'name', 'price', 'categoryId'],
        properties: {
          sku: { type: 'string', example: 'LAPTOP-001' },
          name: { type: 'string', example: 'Laptop Pro' },
          description: { type: 'string', example: 'Professional laptop' },
          price: { type: 'number', format: 'float', example: 1299.99 },
          categoryId: { type: 'string', example: 'cmrifoecj0000tga4fz4nwdlz' },
        },
      },
      ProductUpdateInput: {
        type: 'object',
        properties: {
          sku: { type: 'string', example: 'LAPTOP-001' },
          name: { type: 'string', example: 'Laptop Pro Updated' },
          description: { type: 'string' },
          price: { type: 'number', format: 'float', example: 1399.99 },
          categoryId: { type: 'string' },
        },
      },
      StockMovementInput: {
        type: 'object',
        required: ['productId', 'type', 'quantity'],
        properties: {
          productId: { type: 'string', example: 'cmrig2xiu000008a4rpoqwx5w' },
          type: { type: 'string', enum: ['IN', 'OUT'], example: 'IN' },
          quantity: { type: 'integer', minimum: 1, example: 10 },
          note: { type: 'string', example: 'Initial stock' },
        },
      },
    },
  },
};
