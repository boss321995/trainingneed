const db = require('../config/database')

const SESSION_REFRESH_INTERVAL = parseInt(process.env.SESSION_REFRESH_INTERVAL || `${5 * 60 * 1000}`, 10)

const EMPLOYEE_SELECT = `SELECT ID8, ID0, FULLNAME, DEPARTMENT_S, DEPARTMENT, SECTION, SECTION_N, SEC,
        POSITION_N, EMAIL, IDPH1, IDPH2, H3, H4, LEVEL
      FROM hrnt`

const mapEmployeeToUser = (employee) => ({
  id: employee.ID8,
  employee_id: employee.ID8,
  name: employee.FULLNAME,
  fullname: employee.FULLNAME,
  position: employee.POSITION_N,
  department: employee.DEPARTMENT,
  department_short: employee.DEPARTMENT_S,
  departmentCode: employee.DEPARTMENT_S,
  section: employee.SECTION_N,
  section_code: employee.SEC,
  section_full_code: employee.SECTION,
  sectionCode: employee.SEC,
  sectionCodeFull: employee.SECTION,
  email: employee.EMAIL,
  level: employee.LEVEL || 0,
  supervisor_id: employee.IDPH1,
  supervisor2_id: employee.IDPH2,
  role: (employee.LEVEL || 0) >= 8 ? 'manager' : 'employee'
})

const expandIdentifierCandidates = (identifier) => {
  if (!identifier) return []
  const value = String(identifier).trim()
  if (!value) return []

  const candidates = new Set([value])

  if (value.startsWith('token-')) {
    const [, raw] = value.split('-')
    if (raw) {
      candidates.add(raw)
      if (!raw.startsWith('0')) {
        candidates.add('0' + raw)
      }
    }
  } else if (!value.startsWith('0') && /^\d+$/.test(value)) {
    candidates.add('0' + value)
  }

  return Array.from(candidates)
}

const findEmployeeByIdentifiers = async (identifier) => {
  const candidates = Array.isArray(identifier)
    ? identifier.flatMap(expandIdentifierCandidates)
    : expandIdentifierCandidates(identifier)

  if (candidates.length === 0) return null

  const placeholders = candidates.map(() => '?').join(',')
  const query = `${EMPLOYEE_SELECT} WHERE ID8 IN (${placeholders}) OR ID0 IN (${placeholders}) LIMIT 1`
  const params = [...candidates, ...candidates]
  const [rows] = await db.execute(query, params)
  return rows.length > 0 ? rows[0] : null
}

const regenerateSession = (req) => new Promise((resolve, reject) => {
  req.session.regenerate((err) => {
    if (err) return reject(err)
    resolve()
  })
})

const persistSessionUser = (req, user) => new Promise((resolve, reject) => {
  req.session.userId = user.id
  req.session.user = user
  req.session.userRefreshedAt = Date.now()
  req.session.save((err) => {
    if (err) return reject(err)
    resolve()
  })
})

const destroySession = (req) => new Promise((resolve, reject) => {
  req.session.destroy((err) => {
    if (err) return reject(err)
    resolve()
  })
})

const loadSessionUser = async (req) => {
  if (!req.session || !req.session.userId) {
    return null
  }

  const shouldRefresh = !req.session.user || !req.session.userRefreshedAt ||
    Date.now() - req.session.userRefreshedAt > SESSION_REFRESH_INTERVAL

  if (!shouldRefresh) {
    return req.session.user
  }

  const employee = await findEmployeeByIdentifiers(req.session.userId)
  if (!employee) {
    await destroySession(req)
    return null
  }

  const user = mapEmployeeToUser(employee)
  await persistSessionUser(req, user)
  return user
}

module.exports = {
  mapEmployeeToUser,
  findEmployeeByIdentifiers,
  regenerateSession,
  persistSessionUser,
  destroySession,
  loadSessionUser
}
