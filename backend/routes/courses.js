const express = require('express')
const router = express.Router()
const db = require('../config/database')

// Get job levels (ใช้ระดับจากตาราง tn_course)
router.get('/job-levels', async (req, res) => {
  try {
    // สร้างระดับปฏิบัติงานคงที่
    const jobLevels = [
      { id: 1, level_name: 'ระดับปฏิบัติงาน', level_code: 'OPERATIONAL', description: 'พนักงานระดับปฏิบัติการทั่วไป' },
      { id: 2, level_name: 'ระดับหัวหน้างาน', level_code: 'SUPERVISOR', description: 'หัวหน้างาน' },
  { id: 3, level_name: 'ผู้จัดการส่วน', level_code: 'EXECUTIVE', description: 'ผู้จัดการส่วน' }
    ]
    res.json(jobLevels)
  } catch (error) {
    console.error('Error fetching job levels:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Get course packages from courses table joined with course_packages
router.get('/packages', async (req, res) => {
  try {
    const { search, limit } = req.query
    const params = []
    const conditions = []

    let query = `
      SELECT
        cp.id,
        cp.package_code,
        cp.package_name,
        COUNT(DISTINCT c.id) AS course_count
      FROM course_packages cp
      INNER JOIN courses c ON c.package_id = cp.id
    `

    if (search) {
      const like = `%${search}%`
      conditions.push(
        '(cp.package_name LIKE ? OR cp.package_code LIKE ? OR c.course_title LIKE ? OR c.course_code LIKE ?)' 
      )
      params.push(like, like, like, like)
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`
    }

    query += ' GROUP BY cp.id, cp.package_code, cp.package_name'
    query += ' ORDER BY cp.package_name'

    if (limit) {
      const limitValue = Number(limit)
      if (Number.isFinite(limitValue) && limitValue > 0) {
        query += ' LIMIT ?'
        params.push(limitValue)
      }
    }

    const [rows] = await db.execute(query, params)
    res.json(rows)
  } catch (error) {
    console.error('Error fetching packages:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Search packages with live search (legacy endpoint kept for compatibility)
router.get('/packages/search', async (req, res) => {
  try {
    const { q, limit } = req.query
    const params = []
    const conditions = []

    let query = `
      SELECT
        cp.id,
        cp.package_code,
        cp.package_name,
        COUNT(DISTINCT c.id) AS course_count
      FROM course_packages cp
      INNER JOIN courses c ON c.package_id = cp.id
    `

    if (q) {
      const like = `%${q}%`
      conditions.push(
        '(cp.package_name LIKE ? OR cp.package_code LIKE ? OR c.course_title LIKE ? OR c.course_code LIKE ?)' 
      )
      params.push(like, like, like, like)
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`
    }

    query += ' GROUP BY cp.id, cp.package_code, cp.package_name'
    query += ' ORDER BY cp.package_name'

    let limitValue = 20
    if (limit) {
      const parsed = Number(limit)
      if (Number.isInteger(parsed) && parsed > 0) {
        limitValue = parsed
      }
    }

    query += ' LIMIT ?'
    params.push(limitValue)

    const [rows] = await db.execute(query, params)
    res.json(rows)
  } catch (error) {
    console.error('Error searching packages:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Get courses by package
router.get('/courses', async (req, res) => {
  try {
    const { package_id, package_code, package_name, search } = req.query

    if (!package_id && !package_code && !package_name) {
      return res.status(400).json({ error: 'package_id, package_code, or package_name is required' })
    }

    let query = `
      SELECT
        c.id,
        c.course_code,
        c.course_title,
        c.description,
        c.duration_hours AS duration_hours,
        c.duration_hours AS duration,
        c.max_participants,
        cp.id AS package_id,
        cp.package_code,
        cp.package_name,
        tn.id AS tn_course_id,
        tn.cid AS tn_course_code
      FROM courses c
  LEFT JOIN course_packages cp ON c.package_id = cp.id
  LEFT JOIN tn_course tn ON tn.cid = SUBSTRING_INDEX(c.course_code, ':', 1)
      WHERE 1 = 1
    `

    const params = []

    if (package_id) {
      const packageIdValue = Number(package_id)
      if (!Number.isInteger(packageIdValue) || packageIdValue <= 0) {
        return res.status(400).json({ error: 'invalid package_id' })
      }
      query += ' AND c.package_id = ?'
      params.push(packageIdValue)
    }

    if (package_code) {
      query += ' AND cp.package_code = ?'
      params.push(package_code)
    }

    if (package_name) {
      query += ' AND cp.package_name = ?'
      params.push(package_name)
    }

    if (search) {
      const like = `%${search}%`
      query += ' AND (c.course_title LIKE ? OR c.course_code LIKE ? OR c.description LIKE ?)' 
      params.push(like, like, like)
    }

    query += ' ORDER BY c.course_title'

    const [rows] = await db.execute(query, params)
    res.json(rows)
  } catch (error) {
    console.error('Error fetching courses:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Search courses with live search
router.get('/courses/search', async (req, res) => {
  try {
    const { q, package_id, package_code, package_name, limit } = req.query

    let query = `
      SELECT
        c.id,
        c.course_code,
        c.course_title,
        c.description,
        c.duration_hours AS duration_hours,
        c.duration_hours AS duration,
        c.max_participants,
        cp.id AS package_id,
        cp.package_code,
        cp.package_name,
        tn.id AS tn_course_id,
        tn.cid AS tn_course_code
      FROM courses c
  LEFT JOIN course_packages cp ON c.package_id = cp.id
  LEFT JOIN tn_course tn ON tn.cid = SUBSTRING_INDEX(c.course_code, ':', 1)
      WHERE 1 = 1
    `

    const params = []

    if (q) {
      const like = `%${q}%`
      query += ' AND (c.course_title LIKE ? OR c.course_code LIKE ? OR c.description LIKE ?)' 
      params.push(like, like, like)
    }

    if (package_id) {
      const packageIdValue = Number(package_id)
      if (!Number.isInteger(packageIdValue) || packageIdValue <= 0) {
        return res.status(400).json({ error: 'invalid package_id' })
      }
      query += ' AND c.package_id = ?'
      params.push(packageIdValue)
    }

    if (package_code) {
      query += ' AND cp.package_code = ?'
      params.push(package_code)
    }

    if (package_name) {
      query += ' AND cp.package_name = ?'
      params.push(package_name)
    }

    query += ' ORDER BY c.course_title'

    let maxResults = 50
    if (limit) {
      const limitValue = Number(limit)
      if (Number.isInteger(limitValue) && limitValue > 0) {
        maxResults = limitValue
      }
    }

    query += ' LIMIT ?'
    params.push(maxResults)

    const [rows] = await db.execute(query, params)
    res.json(rows)
  } catch (error) {
    console.error('Error searching courses:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Get course details by ID
router.get('/courses/:id', async (req, res) => {
  try {
    const { id } = req.params

    const courseId = Number(id)
    if (!Number.isInteger(courseId) || courseId <= 0) {
      return res.status(400).json({ error: 'invalid course id' })
    }

    const [rows] = await db.execute(
      `SELECT 
         c.id,
         c.course_code,
         c.course_title,
         c.description,
         c.duration_hours AS duration_hours,
         c.duration_hours AS duration,
         c.max_participants,
         c.job_level_id,
         cp.id AS package_id,
         cp.package_code,
         cp.package_name,
         tn.id AS tn_course_id,
         tn.cid AS tn_course_code
       FROM courses c
  LEFT JOIN course_packages cp ON c.package_id = cp.id
  LEFT JOIN tn_course tn ON tn.cid = SUBSTRING_INDEX(c.course_code, ':', 1)
       WHERE c.id = ?`,
      [courseId]
    )

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' })
    }

    res.json(rows[0])
  } catch (error) {
    console.error('Error fetching course details:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Get detailed outline from tn_course table by cid or id
router.get('/tn-courses/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params
    const lookup = (req.query.lookup || '').toLowerCase()

    let query = ''
    let params = []
    const selectColumns = `SELECT
        id,
        cid,
        sap_code,
        course_name,
        training_type,
        target_group,
        course_section,
        job_fam,
        job_fam_sub,
        duration,
        daycount,
        occupy,
        dtype,
        cgroup,
        g_name,
        g_id,
        intro,
        objective,
        headsubject,
        htraining,
        evaluation_criteria,
        commitee,
        qualification_participants,
        competency,
        course_status,
        pid,
        source,
        app_date,
        newcourse,
        cid_ref,
        evaluation_lv,
        com_list,
        hcount,
        b_date
      FROM tn_course`

    if (lookup === 'id' || (/^id-/i.test(identifier) && identifier.length > 3)) {
      const rawId = lookup === 'id' ? identifier : identifier.replace(/^id-/i, '')
      const numericId = Number(rawId)
      if (!Number.isInteger(numericId) || numericId <= 0) {
        return res.status(400).json({ error: 'invalid course id' })
      }
      query = `${selectColumns}
      WHERE id = ?`
      params = [numericId]
    } else {
      const courseCode = identifier.trim()
      if (!courseCode) {
        return res.status(400).json({ error: 'invalid course code' })
      }
      const normalizedCode = courseCode.includes(':') ? courseCode.split(':')[0].trim() : courseCode
      if (normalizedCode && normalizedCode !== courseCode) {
        query = `${selectColumns}
        WHERE cid IN (?, ?)`
        params = [courseCode, normalizedCode]
      } else {
        query = `${selectColumns}
        WHERE cid = ?`
        params = [courseCode]
      }
    }

    const [rows] = await db.execute(query, params)

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Course outline not found' })
    }

    res.json(rows[0])
  } catch (error) {
    console.error('Error fetching tn_course outline:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router