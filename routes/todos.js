const express = require('express')
const router = express.Router()

//controllers
const TodosController = require('../controllers/todosController')
const requiredAuth = require('../middlewares/requiredAuth')
const authorizeTodo = require('../middlewares/authorize')

router.get('/', TodosController.getAllTodos)
router.get('/completed', TodosController.getAllCompletedTodos)
router.get('/:id', TodosController.getTodo)
router.post('/', requiredAuth, TodosController.createTodo)
router.put(
  '/:id',
  requiredAuth,
  authorizeTodo('user', 'admin'),
  TodosController.updateTodo
)
router.delete(
  '/:id',
  requiredAuth,
  authorizeTodo('user', 'admin'),
  TodosController.deleteTodo
)
router.put('/:id/completed', TodosController.completeTodo)

module.exports = router
