/**
 * @swagger
 *   /api/projects:
 *   get:
 *     tags: [projects]
 *     description: This returns all projects from the database
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         description: Bearer token
 *         required: true
 *         type: string
 *     responses:
 *       '200':
 *         description: A successful response
 *       '400':
 *         description: Bad request
 *       '500':
 *         description: Internal server error
 */

/**
 * @swagger
 *   /api/projects/info:
 *   get:
 *     tags: [projects]
 *     description: This returns general project information for a specific year
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         description: Bearer token
 *         required: true
 *         type: string
 *       - in: query
 *         name: year
 *         type: date
 *     responses:
 *       '200':
 *         description: A successful response
 *       '400':
 *         description: Bad request
 *       '500':
 *         description: Internal server error
 */

/**
 * @swagger
 *   /api/projects/{projectId}:
 *   get:
 *     tags: [projects]
 *     description: This returns all the information about a specific project
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         description: Bearer token
 *         required: true
 *         type: string
 *       - in: path
 *         name: projectId
 *         type: string
 *     responses:
 *       '200':
 *         description: A successful response
 *       '400':
 *         description: Bad request
 *       '500':
 *         description: Internal server error
 */

/**
 * @swagger
 *   /api/projects:
 *   post:
 *     tags: [projects]
 *     description: This creates a project. Not all of the fields listed below are required
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         description: Bearer token
 *         required: true
 *         type: string
 *       - in: body
 *         name: request
 *         description: Request body
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               example: AudioWolf
 *             description:
 *               type: string
 *               example: music platform designed to use AI to track music trends
 *             startDate:
 *               type: date
 *               example: 2022-06-25
 *             endDate:
 *               type: date
 *               example: 2022-07-25
 *             actualEndDate:
 *               type: date
 *               example: 2022-07-30
 *             projectType:
 *               type: string
 *               example: fixed
 *             hourlyRate:
 *               type: number
 *               example: 85
 *             projectValueBAM:
 *               type: number
 *               example: 1500000
 *             salesChannel:
 *               type: string
 *               example: online
 *             projectStatus:
 *               type: string
 *               example: active
 *             finished:
 *               type: boolean
 *               example: false
 *             employees:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   employee:
 *                     type: string
 *                     example: 6459b7924dac4f2ba58bc491
 *                   fullTime:
 *                     type: boolean
 *                     example: true
 *     responses:
 *       '200':
 *         description: A successful response
 *       '400':
 *         description: Bad request
 *       '500':
 *         description: Internal server error
 */

/**
 * @swagger
 *   /api/projects/{projectId}:
 *   delete:
 *     tags: [projects]
 *     description: This deletes a project
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         description: Bearer token
 *         required: true
 *         type: string
 *       - in: path
 *         name: projectId
 *         type: string
 *     responses:
 *       '200':
 *         description: A successful response
 *       '400':
 *         description: Bad request
 *       '500':
 *         description: Internal server error
 */
