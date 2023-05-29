/**
 * @swagger
 *   /api/employees:
 *   get:
 *     tags: [employees]
 *     description: This returns all employees from the database
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
 *   /api/employees/{employeeId}:
 *   get:
 *     tags: [employees]
 *     description: This returns a specific employee from the databse
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         description: Bearer token
 *         required: true
 *         type: string
 *       - in: path
 *         name: employeeId
 *         type: string
 *         required: true
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
 *   /api/employees/add:
 *   post:
 *     tags: [employees]
 *     description: This creates an employee in the databse
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
 *             firstName:
 *               type: string
 *               example: Adnan
 *             lastName:
 *               type: string
 *               example: Silajdzic
 *             salary:
 *               type: number
 *               example: 4000
 *             department:
 *               type: string
 *               example: Mobile
 *             techStack:
 *               type: string[]
 *               example: [react, node]
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
 *   /api/employees/{employeeId}:
 *   delete:
 *     tags: [employees]
 *     description: This deletes a specific employee from the databse
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         description: Bearer token
 *         required: true
 *         type: string
 *       - in: path
 *         name: employeeId
 *         description: Id of the employee you wish to delete
 *         type: string
 *     responses:
 *       '200':
 *         description: A successful response
 *       '400':
 *         description: Bad request
 *       '500':
 *         description: Internal server error
 */
