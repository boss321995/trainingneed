const express = require('express')
const router = express.Router()
const db = require('../config/database')
const { authenticateToken, requireManagerLevel } = require('../middleware/auth')

// Get employees available for assignment/selection (manager or assigned delegate)
router.get('/subordinates', authenticateToken, async (req, res) => {
  const userId = req.user.id
  const userLevel = req.user.level
  const isManager = userLevel >= 8

  console.log('Fetching subordinate list for user:', userId, 'manager:', isManager)

  try {
    const buildResponse = (rows) => rows.map(emp => ({
      id: emp.ID8,
      fullname: emp.FULLNAME,
      position: emp.POSITION_N,
      department: emp.DEPARTMENT,
      section: emp.SECTION_N,
      level: emp.LEVEL,
      is_assigned: emp.is_assigned
    }))

    if (isManager) {
      const [managerInfo] = await db.execute(
        `SELECT SECTION_N FROM hrnt WHERE ID8 = ?`,
        [userId]
      )

      if (managerInfo.length === 0) {
        return res.status(404).json({ error: 'Manager not found' })
      }

      const managerSection = managerInfo[0].SECTION_N

      const [employees] = await db.execute(
        `SELECT h.ID8, h.FULLNAME, h.DEPARTMENT, h.SECTION_N, h.POSITION_N, h.LEVEL,
                CASE 
                  WHEN ta.employee_id IS NOT NULL THEN 1 
                  ELSE 0 
                END as is_assigned
         FROM hrnt h
         LEFT JOIN training_assignments ta ON h.ID8 = ta.employee_id AND ta.is_active = 1
         WHERE (h.IDPH1 = ? OR h.IDPH2 = ?) 
           AND h.SECTION_N = ?
           AND h.ID8 != ?
         ORDER BY h.FULLNAME`,
        [userId, userId, managerSection, userId]
      )

      console.log('Manager view employees:', employees.length)
      return res.json(buildResponse(employees))
    }

    // Verify this user has been delegated access
    const [assignmentRows] = await db.execute(
      `SELECT assigned_by FROM training_assignments WHERE employee_id = ? AND is_active = 1`,
      [userId]
    )

    if (assignmentRows.length === 0) {
      return res.status(403).json({
        error: 'คุณไม่มีสิทธิ์เข้าถึงรายชื่อพนักงานในส่วนงาน'
      })
    }

    // Determine section to scope employees by
    let sectionName = req.user.section
    if (!sectionName) {
      const [personInfo] = await db.execute(
        `SELECT SECTION_N FROM hrnt WHERE ID8 = ?`,
        [userId]
      )
      sectionName = personInfo?.[0]?.SECTION_N || ''
    }

    if (!sectionName) {
      return res.status(400).json({ error: 'ไม่พบข้อมูลส่วนงานของผู้ใช้' })
    }

    const [peers] = await db.execute(
      `SELECT h.ID8, h.FULLNAME, h.DEPARTMENT, h.SECTION_N, h.POSITION_N, h.LEVEL,
              CASE 
                WHEN ta.employee_id IS NOT NULL THEN 1 
                ELSE 0 
              END as is_assigned
       FROM hrnt h
       LEFT JOIN training_assignments ta ON h.ID8 = ta.employee_id AND ta.is_active = 1
       WHERE h.SECTION_N = ?
       ORDER BY h.FULLNAME`,
      [sectionName]
    )

    console.log('Assigned delegate view employees:', peers.length)
    return res.json(buildResponse(peers))
  } catch (error) {
    console.error('Error fetching subordinates:', error)
    res.status(500).json({ error: 'Server error: ' + error.message })
  }
})

// Assign employee to training system (only one per manager)
router.post('/assign', authenticateToken, requireManagerLevel, async (req, res) => {
  const { employeeIds } = req.body // Array of employee IDs
  const managerId = req.user.id
  const managerName = req.user.name
  
  if (!employeeIds || !Array.isArray(employeeIds) || employeeIds.length === 0) {
    return res.status(400).json({ error: 'Employee IDs required' })
  }
  
  if (employeeIds.length > 1) {
    return res.status(400).json({ error: 'Can only assign one employee at a time' })
  }
  
  try {
    // Check if manager already has an active assignment
    const [existingAssignments] = await db.execute(
      `SELECT employee_id, employee_name FROM training_assignments 
       WHERE assigned_by = ? AND is_active = 1`,
      [managerId]
    )
    
    if (existingAssignments.length > 0) {
      return res.status(400).json({ 
        error: `คุณได้มอบหมาย ${existingAssignments[0].employee_name} ไปแล้ว กรุณายกเลิกการมอบหมายเดิมก่อน` 
      })
    }
    
    // Get manager's section information
    const [managerInfo] = await db.execute(
      `SELECT SECTION_N FROM hrnt WHERE ID8 = ?`,
      [managerId]
    )
    
    if (managerInfo.length === 0) {
      return res.status(404).json({ error: 'Manager not found' })
    }
    
    const managerSection = managerInfo[0].SECTION_N
    
    // Verify employee is under this manager's supervision and in same section
    const placeholders = employeeIds.map(() => '?').join(',')
    const [subordinates] = await db.execute(
      `SELECT ID8, FULLNAME, DEPARTMENT, SECTION_N 
       FROM hrnt 
       WHERE ID8 IN (${placeholders}) 
         AND (IDPH1 = ? OR IDPH2 = ?)
         AND SECTION_N = ?`,
      [...employeeIds, managerId, managerId, managerSection]
    )
    
    if (subordinates.length !== employeeIds.length) {
      return res.status(403).json({ 
        error: 'คุณไม่สามารถมอบหมายพนักงานที่ไม่ใช่ลูกน้องในส่วนงานของคุณได้' 
      })
    }
    
    // Insert or update assignments
    const assignments = subordinates.map(emp => [
      emp.ID8,
      emp.FULLNAME,
      managerId,
      managerName,
      emp.DEPARTMENT,
      emp.SECTION_N
    ])
    
    for (const assignment of assignments) {
      await db.execute(
        `INSERT INTO training_assignments 
         (employee_id, employee_name, assigned_by, assigned_by_name, department, section)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
         assigned_by = VALUES(assigned_by),
         assigned_by_name = VALUES(assigned_by_name),
         is_active = 1,
         updated_at = CURRENT_TIMESTAMP`,
        assignment
      )
    }
    
    res.json({ 
      message: `มอบหมายสิทธิ์ให้พนักงาน ${assignments.length} คนเรียบร้อยแล้ว`,
      assigned: subordinates.map(emp => ({
        id: emp.ID8,
        name: emp.FULLNAME
      }))
    })
    
  } catch (error) {
    console.error('Error assigning employees:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Remove assignment
router.delete('/assign/:employeeId', authenticateToken, requireManagerLevel, async (req, res) => {
  const { employeeId } = req.params
  const managerId = req.user.id
  
  try {
    // Verify this manager assigned this employee
    const [result] = await db.execute(
      `UPDATE training_assignments 
       SET is_active = 0, updated_at = CURRENT_TIMESTAMP
       WHERE employee_id = ? AND assigned_by = ? AND is_active = 1`,
      [employeeId, managerId]
    )
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        error: 'ไม่พบการมอบหมายนี้หรือคุณไม่มีสิทธิ์ยกเลิก' 
      })
    }
    
    res.json({ message: 'ยกเลิกการมอบหมายเรียบร้อยแล้ว' })
    
  } catch (error) {
    console.error('Error removing assignment:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Get current user's assignment status
router.get('/my-status', authenticateToken, async (req, res) => {
  const userId = req.user.id
  const userLevel = req.user.level
  
  try {
    let status = {
      canAccess: false,
      role: 'none',
      assignedBy: null
    }
    
    // Check if manager level
    if (userLevel >= 8) {
      status.canAccess = true
      status.role = 'manager'
    } else {
      // Check if assigned
      const [assignments] = await db.execute(
        `SELECT ta.*, m.FULLNAME as manager_name 
         FROM training_assignments ta 
         JOIN hrnt m ON ta.assigned_by = m.ID8 
         WHERE ta.employee_id = ? AND ta.is_active = 1`,
        [userId]
      )
      
      if (assignments.length > 0) {
        status.canAccess = true
        status.role = 'assigned'
        status.assignedBy = {
          id: assignments[0].assigned_by,
          name: assignments[0].manager_name,
          assignedAt: assignments[0].assigned_at
        }
      }
    }
    
    res.json(status)
    
  } catch (error) {
    console.error('Error checking status:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router