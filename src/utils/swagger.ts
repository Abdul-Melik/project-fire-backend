import swaggerJsdoc from 'swagger-jsdoc';
import { config } from 'dotenv';
config();
// Swagger definition
const swaggerOptions = {
	swaggerDefinition: {
		info: {
			title: 'Project Fire API',
			description: 'Documentation for project fire API',
			version: '1.0.0',
			contact: {
				name: 'Ant Colony',
			},
			servers: [`http://localhost:${process.env.PORT}`],
		},
	},
	apis: ['./src/docs/employees/*.ts'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

export default swaggerDocs;
