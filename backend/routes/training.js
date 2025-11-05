const express = require('express')
const router = express.Router()
const db = require('../config/database')
const { authenticateToken, canAccessTraining } = require('../middleware/auth')

const ALLOWED_LEARNING_MODES = new Set(['onsite', 'online', 'elearning'])
const ALLOWED_DEVELOPMENT_TYPES = new Set(['upskill', 'reskill'])
const DEFAULT_LEARNING_MODE = 'onsite'

const idVariants = (value) => {
  if (value === null || value === undefined) return []
  const raw = String(value)
  const variants = new Set([raw])
  const stripped = raw.replace(/^0+/, '')
  if (stripped) {
    variants.add(stripped)
    variants.add(stripped.padStart(8, '0'))
  }
  return Array.from(variants)
}

const buildPlaceholders = (values) => values.map(() => '?').join(', ')

const normalizeValue = (value) => {
  if (value === null || value === undefined) {
    return ''
  }
  if (typeof value === 'string') {
    return value.trim()
  }
  return String(value).trim()
}

const mapParticipantRow = (row = {}) => {
  const developmentType = normalizeValue(row.development_type).toLowerCase()
  return {
    id: row.id,
    training_need_id: row.training_need_id,
    employee_id: normalizeValue(row.employee_id),
    name: normalizeValue(row.participant_name),
    participant_name: normalizeValue(row.participant_name),
    position: normalizeValue(row.position),
    section: normalizeValue(row.section),
    raw_input: normalizeValue(row.raw_input),
    development_type: developmentType || '',
    created_at: row.created_at,
    updated_at: row.updated_at
  }
}

const buildSectionSummary = (records = []) => {
  const summary = {
    totalRequests: records.length,
    totalParticipants: 0,
    upskillParticipants: 0,
    reskillParticipants: 0,
    rosterRequests: 0,
    missingRosterRequests: 0,
    uniqueCourses: 0,
    senders: [],
    participants: [],
    fallbackAggregates: []
  }

  const courseSet = new Set()
  const senderSet = new Set()

  records.forEach(record => {
    const roster = Array.isArray(record.participant_roster) ? record.participant_roster : []
    const total = Number(record.participant_total) || 0
    const upskill = Number(record.upskill_participants) || 0
    const reskill = Number(record.reskill_participants) || 0

    summary.totalParticipants += total
    summary.upskillParticipants += upskill
    summary.reskillParticipants += reskill

    if (roster.length > 0) {
      summary.rosterRequests += 1
      roster.forEach(participant => {
        summary.participants.push({
          request_id: record.id,
          course_title: record.course_title,
          package_name: normalizeValue(record.selected_package_name) || normalizeValue(record.custom_package_name) || '',
          participant_name: participant.name || participant.participant_name || '',
          employee_id: participant.employee_id || '',
          position: participant.position || '',
          development_type: participant.development_type || '',
          department: record.department,
          section: record.section,
          requester: record.employee_name || record.requested_by || '',
          quarter: record.quarter,
          created_at: participant.created_at || record.created_at
        })
      })
    } else {
      summary.missingRosterRequests += 1
      summary.fallbackAggregates.push({
        request_id: record.id,
        course_title: record.course_title,
        package_name: normalizeValue(record.selected_package_name) || normalizeValue(record.custom_package_name) || '',
        department: record.department,
        section: record.section,
        requester: record.employee_name || record.requested_by || '',
        participants: total,
        upskill_participants: upskill,
        reskill_participants: reskill,
        quarter: record.quarter,
        created_at: record.created_at
      })
    }

    if (record.course_title) {
      courseSet.add(String(record.course_title).toLowerCase())
    }

    const sender = record.employee_name || record.requested_by
    if (sender) {
      senderSet.add(sender)
    }
  })

  summary.uniqueCourses = courseSet.size
  summary.senders = Array.from(senderSet)

  summary.participants.sort((a, b) => {
    const dateA = new Date(a.created_at || 0)
    const dateB = new Date(b.created_at || 0)
    return dateB - dateA
  })

  return summary
}

// Create new training need (requires authorization)
router.post('/', authenticateToken, canAccessTraining, async (req, res) => {
  const {
    employee_id,
    course_type,
    course_types,
    course_title,
    quarter,
    participants,
    learning_mode,
    participant_details,
    free_text,
    job_levels,
    selected_package_code,
    selected_package_name,
    selected_course_id,
    custom_package_name,
    training_objective,
    expected_outcome,
    strategic_plan_name,
    strategic_plan_path,
    strategic_objective_code,
    strategic_strategy_code,
    strategic_tactic_code,
    strategic_action_plan_code,
    is_manual_course,
    course_duration
  } = req.body

  const normalizedEmployeeId = typeof employee_id === 'string' ? employee_id.trim() : employee_id
  const normalizedCourseTitle = typeof course_title === 'string' ? course_title.trim() : course_title
  const participantCount = parseInt(participants, 10)

  if (!normalizedEmployeeId) {
    return res.status(400).json({ ok: false, error: 'Missing employee id' })
  }

  if (!normalizedCourseTitle) {
    return res.status(400).json({ ok: false, error: 'Missing course title' })
  }

  if (!Number.isFinite(participantCount) || participantCount <= 0) {
    return res.status(400).json({ ok: false, error: 'Participants must be greater than zero' })
  }

  try {
    const resolvedQuarter = quarter || null
    const resolvedCourseTypes = course_types || course_type || ''
    const resolvedPackageCode = selected_package_code || null
    const resolvedPackageName = selected_package_name || null
    const resolvedCourseId = selected_course_id || null
    const resolvedManualFlag = is_manual_course ? 1 : 0
    const resolvedCourseDuration = course_duration || null
    const requestedLearningMode = (learning_mode || '').toString().toLowerCase()
    const resolvedLearningMode = ALLOWED_LEARNING_MODES.has(requestedLearningMode)
      ? requestedLearningMode
      : DEFAULT_LEARNING_MODE
    const participantDetails = Array.isArray(participant_details)
      ? participant_details
      : Array.isArray(participant_details?.value)
        ? participant_details.value
        : []

    // Get employee info
    const variants = idVariants(normalizedEmployeeId)
    if (variants.length === 0) {
      return res.status(400).json({ ok: false, error: 'Invalid employee id' })
    }

    const placeholders = buildPlaceholders(variants)
    const [employees] = await db.execute(
      `SELECT ID8, FULLNAME, DEPARTMENT_S, DEPARTMENT, SECTION_N, SEC, 
              POSITION_N, IDPH1, IDPH2, LEVEL 
       FROM hrnt WHERE ID8 IN (${placeholders}) OR ID0 IN (${placeholders}) LIMIT 1`,
      [...variants, ...variants]
    )

    if (employees.length === 0) {
      return res.status(404).json({ ok: false, error: 'Employee not found' })
    }

    const employee = employees[0]

    // Insert training need with new fields
    const connection = await db.getConnection()

    try {
      await connection.beginTransaction()

      const [result] = await connection.execute(
        `INSERT INTO training_needs 
         (employee_id, employee_name, department, department_short, section, section_code,
          position, course_types, course_title, course_duration, quarter, learning_mode, participants, free_text,
          training_objective, expected_outcome, requested_by, requested_by_level,
          supervisor_id, supervisor2_id, status, job_levels, selected_package_code, selected_package_name,
          selected_course_id, custom_package_name, is_manual_course, strategic_plan_name, strategic_plan_path,
          strategic_objective_code, strategic_strategy_code, strategic_tactic_code, strategic_action_plan_code)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          employee.ID8,
          employee.FULLNAME,
          employee.DEPARTMENT,
          employee.DEPARTMENT_S,
          employee.SECTION_N,
          employee.SEC,
          employee.POSITION_N,
          resolvedCourseTypes,
          course_title,
          resolvedCourseDuration,
          resolvedQuarter,
          resolvedLearningMode,
          participantCount,
          free_text || '',
          training_objective || '',
          expected_outcome || '',
          employee.FULLNAME,
          employee.LEVEL || 0,
          employee.IDPH1,
          employee.IDPH2,
          req.user.level >= 8 ? 'submitted' : 'draft', // Managers submit directly, others save as draft
          job_levels || null, // JSON array of job level IDs
          resolvedPackageCode,
          resolvedPackageName,
          resolvedCourseId,
          custom_package_name || null,
          resolvedManualFlag,
          strategic_plan_name || null,
          strategic_plan_path || null,
          strategic_objective_code || null,
          strategic_strategy_code || null,
          strategic_tactic_code || null,
          strategic_action_plan_code || null
        ]
      )

      const trainingNeedId = result.insertId

      if (Array.isArray(participantDetails) && participantDetails.length > 0) {
        for (const detail of participantDetails) {
          const employeeId = detail?.employee_id ? String(detail.employee_id).trim() : null
          const name = detail?.name ? String(detail.name).trim() : (detail?.fullname ? String(detail.fullname).trim() : null)
          const position = detail?.position ? String(detail.position).trim() : null
          const section = detail?.section ? String(detail.section).trim() : null
          const rawInput = detail?.raw ? String(detail.raw).trim() : (detail?.display ? String(detail.display).trim() : null)
          const developmentTypeRaw = detail?.development_type ? String(detail.development_type).trim().toLowerCase() : null
          const developmentType = developmentTypeRaw && ALLOWED_DEVELOPMENT_TYPES.has(developmentTypeRaw)
            ? developmentTypeRaw
            : null

          if (!employeeId && !name && !rawInput) {
            continue
          }

          await connection.execute(
            `INSERT INTO training_need_participants
             (training_need_id, employee_id, participant_name, position, section, raw_input, development_type)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              trainingNeedId,
              employeeId || null,
              name || null,
              position || null,
              section || null,
              rawInput || null,
              developmentType || 'upskill'
            ]
          )
        }
      }

      await connection.commit()

      const [newRecord] = await connection.execute(
        'SELECT * FROM training_needs WHERE id = ?',
        [trainingNeedId]
      )

      res.json({
        ok: true,
        id: trainingNeedId,
        message: 'Training need submitted successfully',
        data: newRecord[0]
      })
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('Database error:', error)
    res.status(500).json({ ok: false, error: 'Server error' })
  }
})

// Get training needs for specific employee (requires authorization)
router.get('/employee/:employee_id', authenticateToken, canAccessTraining, async (req, res) => {
  const employee_id = req.params.employee_id
  
  try {
    // Get employee's section information
    const variants = idVariants(employee_id)
    if (variants.length === 0) {
      return res.status(404).json({ error: 'Employee not found' })
    }

    const placeholders = buildPlaceholders(variants)
    const [employeeInfo] = await db.execute(
      `SELECT SECTION_N FROM hrnt WHERE ID8 IN (${placeholders}) OR ID0 IN (${placeholders}) LIMIT 1`,
      [...variants, ...variants]
    )
    
    if (employeeInfo.length === 0) {
      return res.status(404).json({ error: 'Employee not found' })
    }
    
    const userSection = employeeInfo[0].SECTION_N
    
    // Get training needs for the specific employee
    const trainingPlaceholders = buildPlaceholders(variants)
    const [trainings] = await db.execute(
      `SELECT tn.*, h.FULLNAME as employee_name 
       FROM training_needs tn
       JOIN hrnt h ON tn.employee_id = h.ID8
       WHERE tn.employee_id IN (${trainingPlaceholders})
       ORDER BY tn.created_at DESC`,
      variants
    )
    
    res.json(trainings)
  } catch (error) {
    console.error('Database error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Get all training needs (for managers)
router.get('/', authenticateToken, canAccessTraining, async (req, res) => {
  const { department, status, quarter, limit = 100 } = req.query
  
  try {
    let query = 'SELECT * FROM training_needs WHERE 1=1'
    let params = []

    if (department) {
      query += ' AND department_short LIKE ?'
      params.push(`%${department}%`)
    }

    if (status) {
      query += ' AND status = ?'
      params.push(status)
    }

    if (quarter) {
      query += ' AND quarter = ?'
      params.push(quarter)
    }

    query += ' ORDER BY created_at DESC LIMIT ?'
    params.push(parseInt(limit))

    const [trainings] = await db.execute(query, params)
    res.json(trainings)
  } catch (error) {
    console.error('Database error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Update training need status
router.patch('/:id/status', async (req, res) => {
  const id = parseInt(req.params.id)
  const { status, comment } = req.body
  
  try {
    const [result] = await db.execute(
      'UPDATE training_needs SET status = ?, comment = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, comment || null, id]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ ok: false, error: 'Training need not found' })
    }

    // Get updated record
    const [updated] = await db.execute(
      'SELECT * FROM training_needs WHERE id = ?',
      [id]
    )
    
    res.json({ ok: true, message: 'Status updated successfully', data: updated[0] })
  } catch (error) {
    console.error('Database error:', error)
    res.status(500).json({ ok: false, error: 'Server error' })
  }
})

router.get('/my-section', authenticateToken, canAccessTraining, async (req, res) => {
  const userLevel = req.user.level || 0
  const userId = req.user.id
  const sectionCode = req.user.sectionCode || null
  const sectionName = req.user.section || null

  try {
    let query
    let params

    if (userLevel >= 8) {
      // Managers can see all requests within their section
      if (sectionCode) {
        query = 'SELECT * FROM training_needs WHERE section_code = ? ORDER BY created_at DESC'
        params = [sectionCode]
      } else if (sectionName) {
        query = 'SELECT * FROM training_needs WHERE section = ? ORDER BY created_at DESC'
        params = [sectionName]
      } else {
        return res.status(400).json({ error: 'ไม่พบส่วนงานของผู้ใช้' })
      }
    } else {
      // Assigned staff can see only their own requests
      const variants = idVariants(userId)
      if (variants.length === 0) {
        return res.status(400).json({ error: 'ไม่พบรหัสพนักงาน' })
      }
      const placeholders = buildPlaceholders(variants)
      query = `SELECT * FROM training_needs WHERE employee_id IN (${placeholders}) ORDER BY created_at DESC`
      params = variants
    }

    const [rows] = await db.execute(query, params)

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.json({ ok: true, summary: buildSectionSummary([]), records: [] })
    }

    const ids = rows
      .map(record => record?.id)
      .filter(value => Number.isFinite(Number(value)))

    const participantsMap = new Map()

    if (ids.length > 0) {
      const participantPlaceholders = buildPlaceholders(ids)
      const [participantRows] = await db.execute(
        `SELECT id, training_need_id, employee_id, participant_name, position, section, raw_input, development_type, created_at, updated_at
         FROM training_need_participants
         WHERE training_need_id IN (${participantPlaceholders})`,
        ids
      )

      participantRows.forEach(row => {
        const collection = participantsMap.get(row.training_need_id) || []
        collection.push(mapParticipantRow(row))
        participantsMap.set(row.training_need_id, collection)
      })
    }

  // Enrich requests with participant rosters and derived aggregates for the section dashboard
  const enrichedRecords = rows.map(record => {
      const roster = participantsMap.get(record.id) || []
      const totalFromRoster = roster.length
      const upskillCount = roster.filter(item => item.development_type === 'upskill').length
      const reskillCount = roster.filter(item => item.development_type === 'reskill').length
      const fallbackTotal = Number(record.participants) || 0
      const resolvedTotal = totalFromRoster > 0 ? totalFromRoster : fallbackTotal

      return {
        ...record,
        participant_roster: roster,
        participant_total: resolvedTotal,
        upskill_participants: upskillCount || Number(record.upskill_participants) || 0,
        reskill_participants: reskillCount || Number(record.reskill_participants) || 0
      }
    })

    const summary = buildSectionSummary(enrichedRecords)

    res.json({ ok: true, summary, records: enrichedRecords })
  } catch (error) {
    console.error('Error fetching section training needs:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

router.get('/plan-status', authenticateToken, canAccessTraining, async (req, res) => {
  const variants = idVariants(req.user.id)

  if (variants.length === 0) {
    return res.json({ hasSubmitted: false, count: 0 })
  }

  try {
    const placeholders = buildPlaceholders(variants)
    const [rows] = await db.execute(
      `SELECT COUNT(*) AS total
       FROM training_needs
       WHERE employee_id IN (${placeholders})`,
      variants
    )

    const count = rows[0]?.total || 0
    res.json({ hasSubmitted: count > 0, count })
  } catch (error) {
    console.error('Failed to fetch plan status:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

router.put('/:id', authenticateToken, canAccessTraining, async (req, res) => {
  const id = parseInt(req.params.id)
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: 'รหัสคำขอไม่ถูกต้อง' })
  }

  const {
    quarter,
    participants,
    free_text,
    training_objective,
    expected_outcome,
    course_title,
    course_types,
    job_levels,
    selected_package_code,
    selected_package_name,
    selected_course_id,
    custom_package_name,
    is_manual_course,
    strategic_plan_path,
    strategic_objective_code,
    strategic_strategy_code,
    strategic_tactic_code,
    strategic_action_plan_code,
    course_duration,
    learning_mode
  } = req.body

  try {
    const [existingRows] = await db.execute('SELECT * FROM training_needs WHERE id = ?', [id])
    if (existingRows.length === 0) {
      return res.status(404).json({ error: 'ไม่พบคำขอฝึกอบรม' })
    }

    const record = existingRows[0]
    const userLevel = req.user.level || 0
    const userId = req.user.id
    const sectionCode = req.user.sectionCode || null
    const sectionName = req.user.section || null

    const recordEmployee = String(record.employee_id)
    const recordSectionCode = record.section_code || null
    const recordSectionName = record.section || null

    let canEdit = false

    if (userLevel >= 8) {
      // Manager can edit within their section
      if (sectionCode && recordSectionCode && sectionCode === recordSectionCode) {
        canEdit = true
      } else if (!recordSectionCode && sectionName && recordSectionName === sectionName) {
        canEdit = true
      }
    } else {
      const variants = idVariants(userId)
      if (variants.includes(recordEmployee)) {
        canEdit = true
      }
    }

    if (!canEdit) {
      return res.status(403).json({ error: 'คุณไม่มีสิทธิ์แก้ไขคำขอนี้' })
    }

    const fields = []
    const params = []

    if (quarter !== undefined && quarter !== null) {
      fields.push('quarter = ?')
      params.push(quarter)
    }

    if (participants !== undefined && participants !== null) {
      const parsedParticipants = parseInt(participants, 10)
      fields.push('participants = ?')
      params.push(Number.isFinite(parsedParticipants) && parsedParticipants > 0 ? parsedParticipants : 1)
    }

    if (learning_mode !== undefined) {
      const normalizedMode = String(learning_mode || '').toLowerCase()
      fields.push('learning_mode = ?')
      params.push(ALLOWED_LEARNING_MODES.has(normalizedMode) ? normalizedMode : DEFAULT_LEARNING_MODE)
    }

    if (free_text !== undefined) {
      fields.push('free_text = ?')
      params.push(free_text || '')
    }

    if (training_objective !== undefined) {
      fields.push('training_objective = ?')
      params.push(training_objective || '')
    }

    if (expected_outcome !== undefined) {
      fields.push('expected_outcome = ?')
      params.push(expected_outcome || '')
    }

    if (course_title !== undefined) {
      fields.push('course_title = ?')
      params.push(course_title || record.course_title)
    }

    if (course_types !== undefined) {
      fields.push('course_types = ?')
      params.push(course_types || '')
    }

    if (job_levels !== undefined) {
      fields.push('job_levels = ?')
      params.push(job_levels || null)
    }

    if (selected_package_code !== undefined) {
      fields.push('selected_package_code = ?')
      params.push(selected_package_code || null)
    }

    if (selected_package_name !== undefined) {
      fields.push('selected_package_name = ?')
      params.push(selected_package_name || null)
    }

    if (selected_course_id !== undefined) {
      fields.push('selected_course_id = ?')
      params.push(selected_course_id || null)
    }

    if (custom_package_name !== undefined) {
      fields.push('custom_package_name = ?')
      params.push(custom_package_name || null)
    }

    if (is_manual_course !== undefined) {
      fields.push('is_manual_course = ?')
      params.push(is_manual_course ? 1 : 0)
    }

    if (strategic_plan_path !== undefined) {
      fields.push('strategic_plan_path = ?')
      params.push(strategic_plan_path || null)
    }

    if (strategic_objective_code !== undefined) {
      fields.push('strategic_objective_code = ?')
      params.push(strategic_objective_code || null)
    }

    if (strategic_strategy_code !== undefined) {
      fields.push('strategic_strategy_code = ?')
      params.push(strategic_strategy_code || null)
    }

    if (strategic_tactic_code !== undefined) {
      fields.push('strategic_tactic_code = ?')
      params.push(strategic_tactic_code || null)
    }

    if (strategic_action_plan_code !== undefined) {
      fields.push('strategic_action_plan_code = ?')
      params.push(strategic_action_plan_code || null)
    }

    if (course_duration !== undefined) {
      fields.push('course_duration = ?')
      params.push(course_duration || null)
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'ไม่พบข้อมูลสำหรับอัปเดต' })
    }

    fields.push('updated_at = CURRENT_TIMESTAMP')

    const updateQuery = `UPDATE training_needs SET ${fields.join(', ')} WHERE id = ?`
    params.push(id)

    await db.execute(updateQuery, params)

    const [updatedRows] = await db.execute('SELECT * FROM training_needs WHERE id = ?', [id])
    res.json({ ok: true, data: updatedRows[0] })
  } catch (error) {
    console.error('Error updating training need:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Get specific training need
router.get('/:id', authenticateToken, canAccessTraining, async (req, res) => {
  const id = parseInt(req.params.id)
  
  try {
    const [trainings] = await db.execute(
      'SELECT * FROM training_needs WHERE id = ?',
      [id]
    )

    if (trainings.length === 0) {
      return res.status(404).json({ error: 'Training need not found' })
    }

    res.json(trainings[0])
  } catch (error) {
    console.error('Database error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
