const jwt = require('jsonwebtoken')
const db = require('../config/database')

const {
  findEmployeeByIdentifiers,
  mapEmployeeToUser,
  loadSessionUser
} = require('../utils/auth-helpers')

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Middleware to verify active session first, then fall back to token-based auth
const authenticateToken = async (req, res, next) => {
  try {
    const sessionUser = await loadSessionUser(req)
    if (sessionUser) {
      req.user = sessionUser
      return next()
    }

    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token || token === 'undefined' || token === 'null') {
      return res.status(401).json({ error: 'ต้องเข้าสู่ระบบก่อนใช้งาน' })
    }

    let employee = null

    try {
      const decoded = jwt.verify(token, JWT_SECRET)
      employee = await findEmployeeByIdentifiers(decoded.id)
    } catch (err) {
      // Ignore verification error – fallback to raw identifier
    }

    if (!employee) {
      employee = await findEmployeeByIdentifiers(token)
    }

    if (!employee) {
      return res.status(401).json({ error: 'ไม่พบข้อมูลผู้ใช้งาน' })
    }

    req.user = mapEmployeeToUser(employee)
    return next()
  } catch (error) {
    console.error('Token or session verification failed:', error)
    return res.status(403).json({ error: 'ไม่สามารถยืนยันตัวตนได้' })
  }
}

// Check if user is manager level (8+) or higher
const requireManagerLevel = (req, res, next) => {
  if (req.user.level < 8) {
    return res.status(403).json({ 
      error: 'ต้องเป็นระดับผู้จัดการส่วนขึ้นไป (Level 8+) เท่านั้น' 
    })
  }
  next()
}

// Check if user can access training functions (manager or assigned by manager)
const canAccessTraining = async (req, res, next) => {
  const userId = req.user.id
  const userLevel = req.user.level
  
  // If user is manager level (8+), allow access
  if (userLevel >= 8) {
    req.canManage = true
    return next()
  }
  
  try {
    // Check if user has been assigned by a manager
    const [assignments] = await db.execute(
      `SELECT ta.*, m.FULLNAME as manager_name, m.LEVEL as manager_level
       FROM training_assignments ta 
       JOIN hrnt m ON ta.assigned_by = m.ID8 
       WHERE ta.employee_id = ? AND ta.is_active = 1`,
      [userId]
    )
    
    if (assignments.length > 0) {
      req.canManage = false
      req.assignedBy = assignments[0]
      return next()
    }
    
    return res.status(403).json({ 
      error: 'คุณไม่มีสิทธิ์เข้าถึงระบบ Training Need กรุณาติดต่อผู้จัดการส่วนเพื่อขอสิทธิ์' 
    })
    
  } catch (error) {
    console.error('Error checking training access:', error)
    return res.status(500).json({ error: 'Server error' })
  }
}

module.exports = {
  authenticateToken,
  requireManagerLevel,
  canAccessTraining
}