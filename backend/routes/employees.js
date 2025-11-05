const express = require('express')
const router = express.Router()
const db = require('../config/database')

// Get employee by ID
router.get('/:id', async (req, res) => {
  const id = req.params.id
  
  try {
    const [employees] = await db.execute(
      `SELECT ID8, ID0, FULLNAME, DEPARTMENT_S, DEPARTMENT, SECTION, SECTION_N, SEC, 
              POSITION_N, EMAIL, IDPH1, IDPH2, H3, H4 
       FROM hrnt WHERE ID8 = ? OR ID0 = ?`,
      [id, id]
    )

    if (employees.length === 0) {
      return res.status(404).json({ error: 'Employee not found' })
    }

    const employee = employees[0]
    res.json({
      id: employee.ID8,
      employee_id: employee.ID8,
      name: employee.FULLNAME,
      fullname: employee.FULLNAME,
      position: employee.POSITION_N,
      department: employee.DEPARTMENT,
      department_short: employee.DEPARTMENT_S,
  section: employee.SECTION_N,
  section_code: employee.SEC,
  section_full_code: employee.SECTION,
      email: employee.EMAIL,
  supervisor_id: employee.IDPH1,
  supervisor2_id: employee.IDPH2
    })
  } catch (error) {
    console.error('Database error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Get employee with supervisor information
router.get('/:id/supervisor', async (req, res) => {
  const id = req.params.id
  
  try {
    // Get employee
    const [employees] = await db.execute(
      `SELECT ID8, ID0, FULLNAME, DEPARTMENT_S, DEPARTMENT, SECTION, SECTION_N, SEC, 
              POSITION_N, EMAIL, IDPH1, IDPH2, H3, H4 
       FROM hrnt WHERE ID8 = ? OR ID0 = ?`,
      [id, id]
    )

    if (employees.length === 0) {
      return res.status(404).json({ error: 'Employee not found' })
    }

    const employee = employees[0]
    
    // Get supervisors
    const supervisors = []
  if (employee.IDPH1) supervisors.push(employee.IDPH1)
  if (employee.IDPH2) supervisors.push(employee.IDPH2)
    
    let immediate_supervisor = null
    let higher_supervisor = null
    
    if (supervisors.length > 0) {
      const [supervisorData] = await db.execute(
        `SELECT ID8, FULLNAME, POSITION_N, DEPARTMENT, SECTION_N 
         FROM hrnt WHERE ID8 IN (${supervisors.map(() => '?').join(',')})`,
        supervisors
      )
      
  immediate_supervisor = supervisorData.find(s => s.ID8 === employee.IDPH1)
  higher_supervisor = supervisorData.find(s => s.ID8 === employee.IDPH2)
    }

    res.json({
      employee: {
        id: employee.ID8,
        employee_id: employee.ID8,
        name: employee.FULLNAME,
        position: employee.POSITION_N,
        department: employee.DEPARTMENT,
        section: employee.SECTION_N
      },
      immediate_supervisor: immediate_supervisor ? {
        id: immediate_supervisor.ID8,
        name: immediate_supervisor.FULLNAME,
        position: immediate_supervisor.POSITION_N,
        department: immediate_supervisor.DEPARTMENT
      } : null,
      higher_supervisor: higher_supervisor ? {
        id: higher_supervisor.ID8,
        name: higher_supervisor.FULLNAME,
        position: higher_supervisor.POSITION_N,
        department: higher_supervisor.DEPARTMENT
      } : null
    })
  } catch (error) {
    console.error('Database error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Get all employees with filtering
router.get('/', async (req, res) => {
  const { department, section, limit = 50 } = req.query
  
  try {
  let query = `SELECT ID8, ID0, FULLNAME, DEPARTMENT_S, DEPARTMENT, SECTION, SECTION_N, SEC, 
                        POSITION_N, EMAIL, IDPH1, IDPH2, LEVEL 
                 FROM hrnt WHERE 1=1`
    let params = []

    if (department) {
      query += ` AND (DEPARTMENT_S LIKE ? OR DEPARTMENT LIKE ?)`
      params.push(`%${department}%`, `%${department}%`)
    }

    if (section) {
      query += ` AND (SEC LIKE ? OR SECTION_N LIKE ?)`
      params.push(`%${section}%`, `%${section}%`)
    }

    query += ` ORDER BY FULLNAME LIMIT ?`
    params.push(parseInt(limit))

    const [employees] = await db.execute(query, params)

    const result = employees.map(emp => ({
      id: emp.ID8,
      employee_id: emp.ID8,
      name: emp.FULLNAME,
      fullname: emp.FULLNAME,
      position: emp.POSITION_N,
      department: emp.DEPARTMENT,
      department_short: emp.DEPARTMENT_S,
  section: emp.SECTION_N,
  section_code: emp.SEC,
  section_full_code: emp.SECTION,
      email: emp.EMAIL,
  supervisor_id: emp.IDPH1,
  supervisor2_id: emp.IDPH2
    }))

    res.json(result)
  } catch (error) {
    console.error('Database error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
