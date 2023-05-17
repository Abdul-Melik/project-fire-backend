import swaggerJSDoc from "swagger-jsdoc";
import { config } from "dotenv";
config();
// Swagger definition
const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Project fire",
    version: "1.0.0",
    description: "API documentation for project fire",
  },
  servers: [
    {
      url: `http://localhost:${process.env.PORT}`, // Update with your server URL
    },
  ],
};

// Options for the swagger-jsdoc plugin
const options = {
  swaggerDefinition,
  apis: ["./routes/*.ts"], // Specify the path to your route files
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
