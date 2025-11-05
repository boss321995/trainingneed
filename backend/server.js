require('dotenv').config()
const express = require('express')
const cors = require('cors')
const session = require('express-session')
const MySQLStoreFactory = require('express-mysql-session')
const dbPool = require('./config/database')
const authRoutes = require('./routes/auth')
const employeeRoutes = require('./routes/employees')
const trainingRoutes = require('./routes/training')
const reportRoutes = require('./routes/reports')
const assignmentRoutes = require('./routes/assignments')
const courseRoutes = require('./routes/courses')

const app = express()
const PORT = 4001

const allowedOrigins = (process.env.FRONTEND_ORIGIN || 'http://localhost:3000,http://127.0.0.1:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

const MySQLStore = MySQLStoreFactory(session)

const sessionStore = new MySQLStore({
  ...dbPool.sessionConfig,
  clearExpired: true,
  checkExpirationInterval: 15 * 60 * 1000,
  expiration: parseInt(process.env.SESSION_MAX_AGE || `${1000 * 60 * 60 * 8}`, 10),
  createDatabaseTable: true,
  schema: {
    tableName: 'training_sessions',
    columnNames: {
      session_id: 'session_id',
      expires: 'expires',
      data: 'data'
    }
  }
})

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true)
    }
    return callback(new Error(`Origin ${origin} not allowed by CORS`))
  },
  credentials: true
}))
app.use(session({
  key: process.env.SESSION_COOKIE_NAME || 'trainingneed.sid',
  secret: process.env.SESSION_SECRET || 'training-need-secret',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: parseInt(process.env.SESSION_MAX_AGE || `${1000 * 60 * 60 * 8}`, 10)
  }
}))
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/employee', employeeRoutes)
app.use('/api/training-needs', trainingRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/assignments', assignmentRoutes)
app.use('/api/courses', courseRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Training Need Backend is running' })
})

app.listen(PORT, () => {
  console.log(`Mock backend server running on http://localhost:${PORT}`)
  console.log('Available endpoints:')
  console.log('POST /api/auth/login - Login with employee ID')
  console.log('POST /api/auth/validate - Validate JWT token')
  console.log('GET /api/employee/:id - Get employee info')
  console.log('POST /api/training-needs - Submit training need')
  console.log('GET /api/reports - Get reports with filters')
  console.log('GET /api/reports/export - Export reports as CSV')
  console.log('GET /api/assignments/subordinates - Get subordinates (Manager only)')
  console.log('GET /api/courses/job-levels - Get job levels')
  console.log('GET /api/courses/packages - Get course packages')
  console.log('GET /api/courses/packages/search - Search packages')
  console.log('GET /api/courses/courses - Get courses by package')
  console.log('GET /api/courses/courses/search - Search courses')
})
