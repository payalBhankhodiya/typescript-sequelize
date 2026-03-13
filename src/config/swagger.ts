import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "My API",
      version: "1.0.0",
      description: "API Documentation",
    },
    servers: [
      {
        url: "http://localhost:9000",
      },
    ],

    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "token"
        },
      },
    },

    security: [
      {
        cookieAuth: [],
      },
    ],
  },

  apis: [
    "./src/controllers/*.ts",   
    "./src/routes/*.ts",
    "./src/models/*.ts"         
  ],
};

export const swaggerSpec = swaggerJsdoc(options);