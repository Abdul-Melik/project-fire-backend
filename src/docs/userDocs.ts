/**
 * @swagger
 *   /api/users/login:
 *   post:
 *     tags: [users]
 *     description: Use to log in and receive token
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: request
 *         description: Request body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *               example: test5@test.com
 *             password:
 *               type: string
 *               example: test5
 *             rememberMe:
 *               type: boolean
 *               example: true
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
 *   /api/users:
 *   get:
 *     tags: [users]
 *     description: Use to get all users in database
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
 *   /api/users/{userId}:
 *   get:
 *     tags: [users]
 *     description: Use to get a single user from the database
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         description: Bearer token
 *         required: true
 *         type: string
 *       - in: path
 *         name: userId
 *         description: Id of the user
 *         required: true
 *         schema:
 *           type: string
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
 *   /api/users/register:
 *   post:
 *     tags: [users]
 *     description: Use to create a user in the database
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: request
 *         description: Request body
 *         schema:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *               example: test5@test.com
 *             firstName:
 *               type: string
 *               example: Adnan
 *             lastName:
 *               type: string
 *               example: Silajdzic
 *             salary:
 *               type: number
 *               example: 4000
 *             tech stack:
 *               type: string[]
 *               example: [react, node]
 *             role:
 *               type: string
 *               example: guest
 *             password:
 *               type: string
 *               example: test5
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
 *   /api/users/{userId}:
 *   delete:
 *     tags: [users]
 *     description: Use to delete a specific user from the database
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         description: Bearer token
 *         required: true
 *         type: string
 *       - in: path
 *         name: userId
 *         description: Id of the user
 *         required: true
 *         schema:
 *           type: string
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
 *   /api/users/reset-password:
 *   post:
 *     tags: [users]
 *     description: Use send a reset password email
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: request
 *         description: Request body
 *         schema:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *               example: test5@test.com
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
 *   /api/users/{userId}/reset-password/{token}:
 *   post:
 *     tags: [users]
 *     description: Use to create a user in the database
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: request
 *         description: Request body
 *         schema:
 *           type: object
 *           properties:
 *             password:
 *               type: string
 *               example: password123
 *       - in: path
 *         name: userId
 *         description: Id of the user
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: token
 *         description: valid token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: A successful response
 *       '400':
 *         description: Bad request
 *       '500':
 *         description: Internal server error
 */
