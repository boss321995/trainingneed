const express = require('express')
const jwt = require('jsonwebtoken')
const {
  mapEmployeeToUser,
  findEmployeeByIdentifiers,
  regenerateSession,
  persistSessionUser,
  destroySession,
  loadSessionUser
} = require('../utils/auth-helpers')

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

router.post('/login', async (req, res) => {
  const { employeeId } = req.body || {}

  if (!employeeId) {
    return res.status(400).json({ ok: false, error: 'กรุณาระบุรหัสพนักงาน' })
  }

  try {
    const employee = await findEmployeeByIdentifiers(employeeId)

    if (!employee) {
      return res.status(401).json({ ok: false, error: 'ไม่พบรหัสพนักงาน' })
    }

    const user = mapEmployeeToUser(employee)

    await regenerateSession(req)
    await persistSessionUser(req, user)

    return res.json({
      ok: true,
      user,
      session: {
        expiresAt: Date.now() + (req.session.cookie?.originalMaxAge ?? req.session.cookie.maxAge ?? 0)
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({ ok: false, error: 'เกิดข้อผิดพลาดในระบบ' })
  }
})

router.get('/session', async (req, res) => {
  try {
    const user = await loadSessionUser(req)

    if (!user) {
      return res.status(401).json({ ok: false, error: 'ไม่พบเซสชันหรือเซสชันหมดอายุ' })
    }

    return res.json({ ok: true, user })
  } catch (error) {
    console.error('Session validation error:', error)
    return res.status(500).json({ ok: false, error: 'ไม่สามารถตรวจสอบเซสชันได้' })
  }
})

router.post('/validate', async (req, res) => {
  try {
    const sessionUser = await loadSessionUser(req)
    if (sessionUser) {
      return res.json({ ok: true, user: sessionUser, session: true })
    }

    const { token } = req.body || {}

    if (!token) {
      return res.status(401).json({ ok: false, error: 'Token หรือ Session required' })
    }

    let employee = null

    try {
      const decoded = jwt.verify(token, JWT_SECRET)
      employee = await findEmployeeByIdentifiers(decoded.id)
    } catch (err) {
      // Ignore JWT verification error – we'll try other identifier formats below.
    }

    if (!employee) {
      employee = await findEmployeeByIdentifiers(token)
    }

    if (!employee) {
      return res.status(401).json({ ok: false, error: 'Employee not found' })
    }

    const user = mapEmployeeToUser(employee)
    return res.json({ ok: true, user, session: false })
  } catch (error) {
    console.error('Token validation error:', error)
    return res.status(500).json({ ok: false, error: 'Server error' })
  }
})

router.post('/logout', async (req, res) => {
  const cookieName = process.env.SESSION_COOKIE_NAME || 'trainingneed.sid'
  try {
    await destroySession(req)
    res.clearCookie(cookieName, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      secure: process.env.NODE_ENV === 'production'
    })
    return res.json({ ok: true })
  } catch (error) {
    console.error('Logout error:', error)
    return res.status(500).json({ ok: false, error: 'ไม่สามารถออกจากระบบได้' })
  }
})

module.exports = router
