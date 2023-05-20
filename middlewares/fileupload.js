const multer = require('multer')
const path = require('path')
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images')
  },
  filename: (req, file, cb) => {
    const fileData = path.parse(file.originalname)
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, fileData.name + '-' + uniqueSuffix + fileData.ext)
  },
})

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true)
    } else {
      cb(new Error('Invalid File Type'), false)
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 2,
  },
}).single('profilePic')

const uploadMiddleware = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            err: 'File Size Too Large',
          })
        } else {
          return res.status(400).json({
            success: false,
            err: err.message,
          })
        }
      } else {
        //invalid file error handling
        return res.status(400).json({
          success: false,
          err: err.message,
        })
      }
    }

    //No file select
    if (!req.file) {
      return res.status(400).json({
        success: false,
        err: 'Profile Picture is Required',
      })
    }
    next()
  })
}

module.exports = uploadMiddleware
