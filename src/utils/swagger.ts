import swaggerJsdoc from "swagger-jsdoc";

import env from "../utils/validateEnv";

const port = env.PORT;

const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: "Project Fire API",
      description: "Documentation for project fire API",
      version: "1.0.0",
      contact: {
        name: "Ant Colony",
      },
      servers: [`http://localhost:${port}`],
    },
  },
  apis: ["./src/docs/*.ts"],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

export default swaggerDocs;
