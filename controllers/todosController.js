const { default: mongoose } = require('mongoose')
const Todo = require('../models/Todo')
const User = require('../models/User')

// facebook.com?page=1&limit=2
const getAllTodos = async (req, res, next) => {
  const { page, limit } = req.query
  const pageNumber = parseInt(page) || 1
  const limitNumber = parseInt(limit) || 2
  const skip = (pageNumber - 1) * limitNumber
  try {
    const todos = await Todo.find()
      .skip(skip)
      .limit(limitNumber)
      .sort({ createdAt: 1 })
      .exec()
    const totalCount = await Todo.countDocuments()
    const hasNextPage = totalCount > skip + limitNumber
    const hasPreviousPage = pageNumber > 1
    const data = {
      ...todos,
      totalCount,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalCount / limitNumber),
      hasNextPage,
      hasPreviousPage,
      nextPage: hasNextPage ? pageNumber + 1 : null,
      previousPage: hasPreviousPage ? pageNumber - 1 : null,
    }
    res.json({
      success: true,
      data,
    })
  } catch (err) {
    next(err)
  }
  //Aggregation
  // const todos = await Todo.aggregate([
  //   {
  //     $count: 'total',
  //   },
  // ])
  //$match
  //$group

  // const todos = await Todo.aggregate([
  //   {
  //     $match: {
  //       title: 'Sample Task 3',
  //     },
  //   },
  //   {
  //     $count: 'total',
  //   },
  // ])

  // User.aggregate([{ $group: { _id: null, averageAge: { $avg: '$age' } } }])
  // User.aggregate([{ $group: { _id: '$gender', count: { $sum: 1 } } }])
  // User.aggregate([
  //   { $group: { _id: '$occupation', averageAge: { $avg: '$age' } } },
  //   { $sort: { averageAge: -1 } },
  //   { $limit: 1 },
  // ])

  //transaction
  // const session = await mongoose.startSession()
  // try{
  //    await session.withTransaction(async () => {
  //     //ist hit
  //     throw new Error('Trigger Error')
  //     //2nd hit
  //    })
  // }catch(err){

  // }finally{
  //   session.endSession()
  // }

  //18 years above (Ist Hit)
  //got salary (2nd hit)

  //salary transaction

  // const todos = await Todo.aggregate([
  //   {
  //     $group: {
  //       _id: '$title',
  //       count: {
  //         $sum: 1,
  //       },
  //     },
  //   },
  //   {
  //     $sort: {
  //       count: -1,
  //     },
  //   },
  //   {
  //     $limit: 4,
  //   },
  // ])

  // res.json({
  //   success: true,
  // })
  // console.log({ todos })
}
const createTodo = async (req, res, next) => {
  const userId = req.user.userId
  try {
    const todo = new Todo({
      title: req.body.title,
      description: req.body.description,
      user: userId,
    })
    //save todo
    const savedTodo = await todo.save()

    //find out user document
    const user = await User.findById(userId)

    user.todos.push(savedTodo._id)

    await user.save()

    res.status(201).json({
      success: true,
      data: savedTodo,
    })
  } catch (err) {
    next(err)
  }
}

const getTodo = async (req, res, next) => {
  try {
    const todo = await Todo.findById(req.params.id).populate({
      path: 'user',
      select: 'email',
    })
    if (!todo) {
      return res.status(404).json({ success: false, error: 'Todo Not Found' })
    }
    res.json({
      success: true,
      data: todo,
    })
  } catch (err) {
    next(err)
  }
}

const updateTodo = async (req, res, next) => {
  try {
    //finding the todo
    const todo = await Todo.findById(req.params.id)
    if (!todo) {
      return res.status(404).json({ success: false, error: 'Todo Not Found' })
    }
    const isOwner = todo.user.toString() === req.user.userId.toString()
    const isAdmin = req.user.roles.includes('admin')
    //todo must be created by the user
    if (!isOwner || !isAdmin) {
      return res
        .status(401)
        .json({ success: false, err: 'You are not authorized' })
    }

    todo.title = req.body.title
    todo.description = req.body.description
    const updatedTodos = await todo.save()

    res.json({
      success: true,
      data: updatedTodos,
    })
  } catch (err) {
    next(err)
  }
}

const deleteTodo = async (req, res, next) => {
  try {
    const todo = await Todo.findById(req.params.id)
    if (!todo) {
      return res.status(404).json({ success: false, error: 'Todo Not Found' })
    }
    //todo must be created by the user
    if (todo.user.toString() !== req.user.userId.toString()) {
      return res
        .status(401)
        .json({ success: false, err: 'You are not authorized' })
    }
    await Todo.findByIdAndDelete(req.params.id)

    res.json({ success: true, data: todo })
  } catch (err) {
    next(err)
  }
}

const completeTodo = async (req, res, next) => {
  try {
    const todo = await Todo.findById(req.params.id)
    if (!todo) {
      return res.status(404).json({ success: false, error: 'Todo Not Found' })
    }
    const completedTodo = await todo.completeTodo()

    res.json({ success: true, data: completedTodo })
  } catch (err) {
    next(err)
  }
}

const getAllCompletedTodos = async (req, res, next) => {
  try {
    const completedTodos = await Todo.find({
      completed: true,
    })
    res.json({ success: true, data: completedTodos })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  getAllTodos,
  createTodo,
  getTodo,
  updateTodo,
  deleteTodo,
  completeTodo,
  getAllCompletedTodos,
}
