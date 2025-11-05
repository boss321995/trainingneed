const express = require('express')
const router = express.Router()
const db = require('../config/database')
const ExcelJS = require('exceljs')
const { authenticateToken, canAccessTraining } = require('../middleware/auth')
const { classifyCourses } = require('../services/geminiClassifier')

const FULL_ACCESS_SECTION_CODES = ['0010332601']

const normalizeString = (value) => {
  if (value === null || value === undefined) return ''
  return String(value).trim()
}

const CUSTOM_PACKAGE_KEYWORDS = ['อื่นๆ', 'อื่น ๆ', 'other', 'custom']

const DEFAULT_COURSE_LABEL = 'หลักสูตรไม่ระบุชื่อ'
const DEFAULT_PACKAGE_LABEL = 'ไม่ระบุแพ็คเกจ'

const resolveCourseName = (record = {}) => {
  const name = normalizeString(
    record.course_title ||
    record.selected_course_name ||
    record.course_types ||
    record.course_type
  )
  return name || DEFAULT_COURSE_LABEL
}

const resolvePackageName = (record = {}) => {
  const packageName = normalizeString(
    record.selected_package_name ||
    record.package_name ||
    record.custom_package_name ||
    record.package
  )
  return packageName || DEFAULT_PACKAGE_LABEL
}

const buildPlaceholders = (values) => values.map(() => '?').join(', ')

const STOPWORDS = new Set([
  '',
  'และ',
  'หรือ',
  'ที่',
  'ใน',
  'บน',
  'ของ',
  'จาก',
  'เพื่อ',
  'ให้',
  'กับ',
  'ซึ่ง',
  'การ',
  'ผู้',
  'พัฒนา',
  'ทักษะ',
  'หลักสูตร',
  'อบรม',
  'การอบรม',
  'ผู้เข้าอบรม',
  'ความ',
  'ด้าน',
  'ระดับ',
  'ส่วนงาน',
  'หน่วยงาน',
  'องค์กร',
  'จำนวน',
  'เพิ่มเติม',
  'ข้อมูล',
  'อื่นๆ',
  'อื่น',
  'อื่น ๆ',
  'เป็น',
  'เป้าหมาย',
  'ร่วม',
  'ภายใน',
  'ภายนอก',
  'บุคลากร',
  'การพัฒนา',
  'โครงการ',
  'การจัด',
  'เพื่อการ',
  'สำหรับ',
  'เรื่อง',
  'หัวข้อ'
])

const isCustomPackageRecord = (record = {}) => {
  if (!record || typeof record !== 'object') {
    return false
  }

  const code = normalizeString(record.selected_package_code || record.package_code || record.package || '').toUpperCase()
  if (code === 'CUSTOM') {
    return true
  }

  const manualFlag = Number(record.is_manual_course) === 1 || normalizeString(record.manual_source || record.manualSource)
  if (manualFlag) {
    return true
  }

  const packageName = normalizeString(
    record.selected_package_name ||
    record.package_name ||
    record.custom_package_name ||
    ''
  ).toLowerCase()

  if (packageName) {
    if (CUSTOM_PACKAGE_KEYWORDS.some(keyword => packageName.includes(keyword))) {
      return true
    }
  }

  return false
}

const filterCustomPackageItems = (items = []) => items.filter(isCustomPackageRecord)

const tokenizeThaiText = (text = '') => {
  const normalized = normalizeString(text)
    .toLowerCase()
    .replace(/[`~!@#$%^&*()_+\-=\[\]{};:'"\\|,<.>/?“”‘’]/g, ' ')

  return normalized
    .split(/\s+/)
    .map(token => token.trim())
    .filter(token => token.length >= 2 && !STOPWORDS.has(token))
}

const buildManualTopicLabel = (record = {}) => {
  const title = normalizeString(record.course_title)
  if (title) {
    return title
  }

  const objective = normalizeString(record.training_objective || record.objective || '')
  if (objective) {
    return objective.split(/\n|\.|,|;/).map(part => part.trim()).filter(Boolean)[0] || 'หัวข้อที่ไม่ระบุ'
  }

  const notes = normalizeString(record.free_text || record.custom_request || '')
  if (notes) {
    return notes.split(/\n|\.|,|;/).map(part => part.trim()).filter(Boolean)[0] || 'หัวข้อที่ไม่ระบุ'
  }

  const outcome = normalizeString(record.expected_outcome || '')
  if (outcome) {
    return outcome.split(/\n|\.|,|;/).map(part => part.trim()).filter(Boolean)[0] || 'หัวข้อที่ไม่ระบุ'
  }

  return 'หัวข้อที่ไม่ระบุ'
}

const buildManualInsights = (items = []) => {
  const topicMap = new Map()
  const termCount = new Map()
  const sectionSet = new Set()
  const departmentSet = new Set()

  items.forEach((record, index) => {
    const label = buildManualTopicLabel(record)
    const normalizedKey = normalizeString(label)
      .toLowerCase()
      .replace(/[^a-z0-9ก-๙\s]+/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    const key = normalizedKey ? normalizedKey.replace(/\s+/g, '-') : `manual-topic-${index + 1}`

    if (!topicMap.has(key)) {
      topicMap.set(key, {
        key,
        label,
        count: 0,
        sections: new Set(),
        departments: new Set(),
        examples: []
      })
    }

    const topic = topicMap.get(key)
    topic.count += 1

    const section = normalizeString(record.section || record.section_name || record.sectionName)
    const department = normalizeString(record.department || record.department_name || record.departmentName)
    if (section) {
      topic.sections.add(section)
      sectionSet.add(section)
    }
    if (department) {
      topic.departments.add(department)
      departmentSet.add(department)
    }

    const snippetSources = [
      normalizeString(record.training_objective || record.objective || ''),
      normalizeString(record.expected_outcome || ''),
      normalizeString(record.free_text || record.custom_request || '')
    ].filter(Boolean)

    const combinedSnippet = snippetSources.join(' ').trim()
    if (combinedSnippet && topic.examples.length < 3) {
      topic.examples.push({
        section,
        department,
        snippet: combinedSnippet.slice(0, 160)
      })
    }

    const textForTokens = [label, ...snippetSources].join(' ')
    tokenizeThaiText(textForTokens).forEach(term => {
      termCount.set(term, (termCount.get(term) || 0) + 1)
    })
  })

  const topics = Array.from(topicMap.values()).map(topic => ({
    key: topic.key,
    label: topic.label,
    count: topic.count,
    sections: Array.from(topic.sections),
    departments: Array.from(topic.departments),
    sectionCount: topic.sections.size,
    departmentCount: topic.departments.size,
    examples: topic.examples
  }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'th-TH'))

  const topTerms = Array.from(termCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([term, count]) => ({ term, count }))

  return {
    totalItems: items.length,
    uniqueTopics: topics.length,
  uniqueSections: sectionSet.size,
  uniqueDepartments: departmentSet.size,
    topics,
    topTerms
  }
}

const extractSectionPrefix = (value) => {
  if (!value) return ''
  const digits = value.replace(/[^0-9]/g, '')
  if (digits.length >= 4) {
    return digits.substring(0, 4)
  }
  return value.length >= 4 ? value.substring(0, 4) : ''
}

const normalizeSectionCode = (value) => {
  const raw = normalizeString(value)
  if (!raw) {
    return { raw: '', prefix4: '' }
  }
  return {
    raw,
    prefix4: extractSectionPrefix(raw)
  }
}

const sanitizeColumnForDigits = (column) => `REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(${column}, ' ', ''), '-', ''), '/', ''), '.', ''), '_', ''), '(', ''), ')', '')`

const buildSectionCandidates = (...values) => {
  const candidates = new Set()

  values.forEach(value => {
    const normalized = normalizeString(value)
    if (!normalized) return
    candidates.add(normalized)

    if (normalized.length >= 4) {
      candidates.add(normalized.substring(0, 4))
    }

    const digits = normalized.replace(/[^0-9]/g, '')
    if (digits) {
      candidates.add(digits)
      if (digits.length >= 10) {
        candidates.add(digits.substring(0, 10))
      }
      if (digits.length >= 4) {
        candidates.add(digits.substring(0, 4))
      }
    }
  })

  return Array.from(candidates).filter(Boolean)
}

const buildSectionKey = (record) => {
  const group = normalizeString(record.group_name)
  const department = normalizeString(record.department)
  const section = normalizeString(record.section)
  const sectionFull = normalizeString(record.section_full_name)
  const prefix = normalizeString(record.section_prefix)
  const code = normalizeString(record.section_code)
  const fallback = sectionFull || section || prefix || code || `section:${record.id}`
  return `${group}::${department}::${fallback}`
}

const computeSummary = (records = []) => {
  const total = records.length
  const month = new Date().getMonth()
  const currentQuarter = `Q${Math.floor(month / 3) + 1}`
  const thisQuarter = records.filter(item => item.quarter === currentQuarter).length

  const courseFrequency = new Map()
  const courseKeySet = new Set()
  const skillSet = new Set()
  let participantSum = 0
  let upskillTotal = 0
  let reskillTotal = 0

  const addSkillTokens = (value) => {
    const normalized = normalizeString(value)
    if (!normalized) {
      return
    }

    normalized
      .split(/[\n,;\/|]+/)
      .map(token => normalizeString(token.replace(/^[\[\("']+/, '').replace(/[\]\)"']+$/, '')))
      .filter(Boolean)
      .forEach(token => {
        skillSet.add(token.toLowerCase())
      })
  }

  records.forEach(item => {
    const courseNameRaw = normalizeString(
      item.course_title ||
      item.selected_course_name ||
      item.course_types
    )
    const courseLabel = courseNameRaw || 'หลักสูตรไม่ระบุชื่อ'
    courseFrequency.set(courseLabel, (courseFrequency.get(courseLabel) || 0) + 1)

    if (courseNameRaw) {
      courseKeySet.add(courseNameRaw.toLowerCase())
    }

    addSkillTokens(item.course_types)
    addSkillTokens(item.course_type)

    const resolvedParticipants = Number(item.participants_resolved) || Number(item.participants) || 0
    const upskillParticipants = Number(item.upskill_participants) || 0
    const reskillParticipants = Number(item.reskill_participants) || 0
    const rosterTotal = upskillParticipants + reskillParticipants

    if (rosterTotal > 0) {
      participantSum += rosterTotal
      upskillTotal += upskillParticipants
      reskillTotal += reskillParticipants
    } else {
      participantSum += resolvedParticipants
    }
  })

  let topCourse = ''
  if (courseFrequency.size > 0) {
    topCourse = Array.from(courseFrequency.entries()).reduce(
      (best, current) => (current[1] > best[1] ? current : best)
    )[0]
  }

  const avgParticipants = total > 0 ? Math.round(participantSum / total) : 0

  const statusCount = {}
  records.forEach(item => {
    const status = normalizeString(item.status) || 'ไม่ระบุ'
    statusCount[status] = (statusCount[status] || 0) + 1
  })

  return {
    total,
    thisQuarter,
    topCourse,
    avgParticipants,
    statusCount,
    courseCount: courseKeySet.size,
    skillCount: skillSet.size,
    developmentTypeTotals: {
      upskill: upskillTotal,
      reskill: reskillTotal
    }
  }
}

const formatThaiDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const sanitizeSheetName = (name, fallback) => {
  const cleanName = normalizeString(name).replace(/[\\\/?*\[\]:]/g, ' ').substring(0, 31).trim()
  if (cleanName.length === 0) {
    return fallback || 'Sheet'
  }
  return cleanName
}

const valueOrFallback = (value, fallback = '') => {
  const normalized = normalizeString(value)
  return normalized || fallback
}

const createNodeId = (prefix, ...parts) => {
  const normalizedParts = parts
    .map(part => normalizeString(part).toLowerCase())
    .filter(Boolean)
  if (!normalizedParts.length) {
    return `${prefix}:unknown`
  }
  return `${prefix}:${normalizedParts.join(':')}`
}

const sortThaiText = (a, b) => {
  const left = valueOrFallback(a)
  const right = valueOrFallback(b)
  return left.localeCompare(right, 'th-TH')
}

const buildOrgStructure = async () => {
  const [rows] = await db.execute(`
    SELECT DISTINCT
      h.DEP_GROUP AS group_short,
      h.DEP_GROUPNAME AS group_name,
      h.DEPARTMENT_S AS department_short,
      h.DEPARTMENT AS department_name,
      h.SEC AS section_short,
      h.SECTION_N AS section_name,
      h.SECTION AS section_code
    FROM hrnt h
    WHERE h.isactive = 1 AND h.notdel = 0
  `)

  const groupsMap = new Map()

  rows.forEach(row => {
    const groupShort = valueOrFallback(row.group_short)
    const groupName = valueOrFallback(row.group_name, groupShort)
    const groupDisplay = groupShort || groupName || 'ไม่ระบุ'
    if (!groupsMap.has(groupDisplay)) {
      groupsMap.set(groupDisplay, {
        id: createNodeId('group', groupShort, groupName, groupDisplay),
        groupShort,
        groupName,
        departments: new Map()
      })
    }

    const groupEntry = groupsMap.get(groupDisplay)

    const departmentShort = valueOrFallback(row.department_short)
    const departmentName = valueOrFallback(row.department_name, departmentShort)
    const departmentDisplay = departmentShort || departmentName || 'ไม่ระบุ'
    const departmentKey = `${groupEntry.id}::${departmentDisplay}`

    if (!groupEntry.departments.has(departmentKey)) {
      groupEntry.departments.set(departmentKey, {
        id: createNodeId('department', groupEntry.id, departmentShort, departmentName, departmentDisplay),
        departmentShort,
        departmentName,
        sections: new Map()
      })
    }

    const departmentEntry = groupEntry.departments.get(departmentKey)

    const sectionShort = valueOrFallback(row.section_short)
    const sectionName = valueOrFallback(row.section_name, sectionShort)
    const sectionCode = valueOrFallback(row.section_code)
    const sectionKey = `${departmentEntry.id}::${sectionCode || sectionShort || sectionName || 'ไม่ระบุ'}`

    if (!departmentEntry.sections.has(sectionKey)) {
      departmentEntry.sections.set(sectionKey, {
        id: createNodeId('section', departmentEntry.id, sectionCode, sectionShort, sectionName, sectionKey),
        sectionShort,
        sectionName,
        sectionCode
      })
    }
  })

  const groups = Array.from(groupsMap.values())
    .map(groupEntry => {
      const departments = Array.from(groupEntry.departments.values())
        .map(departmentEntry => {
          const sections = Array.from(departmentEntry.sections.values())
            .sort((a, b) => sortThaiText(a.sectionShort || a.sectionName || a.sectionCode, b.sectionShort || b.sectionName || b.sectionCode))
          return {
            id: departmentEntry.id,
            departmentShort: departmentEntry.departmentShort,
            departmentName: departmentEntry.departmentName,
            sections
          }
        })
        .sort((a, b) => sortThaiText(a.departmentShort || a.departmentName, b.departmentShort || b.departmentName))

      return {
        id: groupEntry.id,
        groupShort: groupEntry.groupShort,
        groupName: groupEntry.groupName,
        departments
      }
    })
    .sort((a, b) => sortThaiText(a.groupShort || a.groupName, b.groupShort || b.groupName))

  const totalDepartments = groups.reduce((sum, group) => sum + group.departments.length, 0)
  const totalSections = groups.reduce(
    (sum, group) => sum + group.departments.reduce((deptSum, department) => deptSum + department.sections.length, 0),
    0
  )

  return {
    groups,
    totals: {
      groups: groups.length,
      departments: totalDepartments,
      sections: totalSections
    }
  }
}

async function getReportData(user, filters = {}) {
  const { quarter, department, year, courseType, packageName, packageCode, groupName } = filters

  const rawSectionFull = normalizeString(user.sectionCodeFull)
  const rawSectionCode = normalizeString(user.sectionCode)
  const rawSectionName = normalizeString(user.section)
  const rawDepartmentShort = normalizeString(user.departmentShort || user.department_short)

  const userSectionCode = rawSectionFull || rawSectionCode || rawSectionName
  const userSectionPrefix = extractSectionPrefix(userSectionCode)
  const hasFullAccess = FULL_ACCESS_SECTION_CODES.includes(rawSectionFull || rawSectionCode)
  const sectionCandidates = buildSectionCandidates(rawSectionFull, rawSectionCode, rawSectionName, rawDepartmentShort)

  if (!hasFullAccess && userSectionPrefix.length < 4) {
    const error = new Error('ไม่พบข้อมูลสายงานสำหรับผู้ใช้ จึงไม่สามารถเข้าถึงรายงานได้')
    error.status = 403
    throw error
  }

  let query = `SELECT tn.*, 
                      h.FULLNAME as employee_name,
                      h.DEPARTMENT as employee_department,
                      h.DEPARTMENT_S as employee_department_short,
                      h.DEP_GROUP as employee_group_short,
                      h.DEP_GROUPNAME as employee_group_name,
                      h.GROUP_ID as employee_group_id,
                      h.GROUP_NAME as employee_group_line,
                      h.SECTION_N as employee_section,
                      h.SEC as employee_section_short,
                      h.SECTION as employee_section_code,
                      COALESCE(p.participant_total, 0) AS roster_participant_count,
                      COALESCE(p.upskill_count, 0) AS roster_upskill_count,
                      COALESCE(p.reskill_count, 0) AS roster_reskill_count
               FROM training_needs tn
               LEFT JOIN hrnt h ON tn.employee_id = h.ID8
               LEFT JOIN (
                 SELECT
                   training_need_id,
                   COUNT(*) AS participant_total,
                   SUM(CASE WHEN LOWER(COALESCE(development_type, '')) = 'reskill' THEN 1 ELSE 0 END) AS reskill_count,
                   SUM(CASE WHEN LOWER(COALESCE(development_type, '')) = 'upskill' THEN 1 ELSE 0 END) AS upskill_count
                 FROM training_need_participants
                 GROUP BY training_need_id
               ) p ON p.training_need_id = tn.id
               WHERE 1=1`
  const params = []

  if (quarter) {
    query += ' AND tn.quarter = ?'
    params.push(quarter)
  }

    if (quarter) {
    query += ' AND (tn.department LIKE ? OR h.DEPARTMENT LIKE ?)'
    params.push(`%${department}%`, `%${department}%`)
  }

  if (year) {
    query += ' AND YEAR(tn.created_at) = ?'
    params.push(year)
  }

  if (courseType) {
    query += ' AND tn.course_type = ?'
    params.push(courseType)
  }

  const packageNameFilter = normalizeString(packageName)
  const packageCodeFilter = normalizeString(packageCode).toUpperCase()
  const groupNameFilter = normalizeString(groupName)

  if (packageNameFilter) {
    query += ' AND (tn.selected_package_name LIKE ? OR tn.package_name LIKE ?)'
    params.push(`%${packageNameFilter}%`, `%${packageNameFilter}%`)
  }

  if (packageCodeFilter) {
    query += ' AND (UPPER(tn.selected_package_code) = ? OR UPPER(tn.package_code) = ?)'
    params.push(packageCodeFilter, packageCodeFilter)
  }

  if (groupNameFilter) {
    const groupNameUpper = groupNameFilter.toUpperCase()
    query += ' AND ((UPPER(TRIM(h.DEP_GROUPNAME)) = ?) OR (UPPER(TRIM(h.DEP_GROUP)) = ?))'
    params.push(groupNameUpper, groupNameUpper)
  }

  if (!hasFullAccess) {
    if (!sectionCandidates.length) {
      const error = new Error('ไม่พบข้อมูลสายงานสำหรับผู้ใช้ จึงไม่สามารถเข้าถึงรายงานได้')
      error.status = 403
      throw error
    }

    const sectionColumns = [
      'tn.section',
      'tn.section_code',
      'tn.department_short',
      'h.SEC',
      'h.SECTION',
      'h.SECTION_N'
    ]

    const numericCandidates = sectionCandidates.filter(value => /^\d+$/.test(value))
    const textCandidates = sectionCandidates.filter(value => !/^\d+$/.test(value))
    const clauses = []

    if (numericCandidates.length > 0) {
      sectionColumns.forEach(column => {
        const sanitizedColumn = sanitizeColumnForDigits(column)
        numericCandidates.forEach(code => {
          clauses.push(`${sanitizedColumn} LIKE ?`)
          params.push(`${code}%`)
        })
      })
    }

    if (textCandidates.length > 0) {
      sectionColumns.forEach(column => {
        textCandidates.forEach(candidate => {
          clauses.push(`${column} LIKE ?`)
          params.push(`${candidate}%`)
        })
      })
    }

    if (!clauses.length) {
      const error = new Error('ไม่พบสิทธิ์สำหรับชุดข้อมูลนี้')
      error.status = 403
      throw error
    }

    query += ` AND (${clauses.join(' OR ')})`
  }

  query += ' ORDER BY tn.created_at DESC'

  const [records] = await db.execute(query, params)

  const trainingNeedIds = records
    .map(item => Number.parseInt(item.id, 10))
    .filter(id => Number.isInteger(id) && id > 0)

  let participantRows = []
  if (trainingNeedIds.length > 0) {
    const placeholders = buildPlaceholders(trainingNeedIds)
    const [rows] = await db.execute(
      `SELECT id, training_need_id, employee_id, participant_name, position, section, raw_input, development_type, created_at, updated_at
         FROM training_need_participants
         WHERE training_need_id IN (${placeholders})
         ORDER BY training_need_id, participant_name IS NULL, participant_name, id`,
      trainingNeedIds
    )
    participantRows = rows
  }

  const participantsMap = new Map()
  participantRows.forEach(row => {
    if (!participantsMap.has(row.training_need_id)) {
      participantsMap.set(row.training_need_id, [])
    }

    participantsMap.get(row.training_need_id).push({
      id: row.id,
      employee_id: normalizeString(row.employee_id),
      name: normalizeString(row.participant_name),
      position: normalizeString(row.position),
      section: normalizeString(row.section),
      raw: normalizeString(row.raw_input),
      development_type: normalizeString(row.development_type).toLowerCase(),
      created_at: row.created_at,
      updated_at: row.updated_at
    })
  })

  const mapped = records.map(item => {
    const participantsList = participantsMap.get(item.id) || []
    const participantsCount = participantsList.length

    const rosterTotalFromDb = Number(item.roster_participant_count) || 0
    const rosterUpskillFromDb = Number(item.roster_upskill_count) || 0
    const rosterReskillFromDb = Number(item.roster_reskill_count) || 0
    const upskillFromRoster = participantsList.filter(person => person.development_type === 'upskill').length
    const reskillFromRoster = participantsList.filter(person => person.development_type === 'reskill').length

    const resolvedUpskill = participantsCount > 0 ? upskillFromRoster : rosterUpskillFromDb
    const resolvedReskill = participantsCount > 0 ? reskillFromRoster : rosterReskillFromDb
    const resolvedParticipantsFallback = rosterTotalFromDb > 0 ? rosterTotalFromDb : Number(item.participants) || 0
    const resolvedParticipants = participantsCount > 0 ? participantsCount : resolvedParticipantsFallback
    const developmentSource = participantsCount > 0
      ? 'roster'
      : (rosterTotalFromDb > 0 ? 'aggregated' : 'legacy')

    const sectionValue = normalizeString(item.section) || normalizeString(item.employee_section)
    const hrSectionCode = normalizeSectionCode(item.employee_section_code)
    const tnSectionCode = normalizeSectionCode(item.section_code)
    const resolvedSectionCode = tnSectionCode.raw || hrSectionCode.raw
    const resolvedSectionPrefix = tnSectionCode.prefix4 || hrSectionCode.prefix4

    const rawGroup = normalizeString(item.group_name) || normalizeString(item.department_group) || normalizeString(item.employee_group_name)
    const groupShort = normalizeString(
      item.group_short ||
      item.group_abbreviation ||
      item.department_group_short ||
      item.employee_group_short ||
      item.employee_group_id ||
      item.employee_group_line
    )
    const groupLine = normalizeString(item.employee_group_line)

    const rawDepartment = normalizeString(item.department) || normalizeString(item.employee_department)
    const departmentShort = normalizeString(item.department_short || item.employee_department_short)

    const resolvedGroup = groupShort || rawGroup
    const resolvedDepartment = departmentShort || rawDepartment

    const sectionShort = normalizeString(item.section_short || item.employee_section_short)
    const baseSection = sectionShort || sectionValue || resolvedSectionCode
    const sectionDisplay = baseSection || 'ไม่ระบุ'

    return {
      ...item,
      department: resolvedDepartment || rawDepartment || '',
      department_full_name: rawDepartment || '',
      department_short: departmentShort || '',
      group_name: resolvedGroup || rawGroup || '',
      group_full_name: rawGroup || '',
      group_short: groupShort || '',
      group_line: groupLine || '',
      section: sectionDisplay,
      section_full_name: sectionDisplay,
      section_short: sectionShort || '',
      section_code: resolvedSectionCode,
      section_prefix: resolvedSectionPrefix,
      employee_name: normalizeString(item.employee_name) || normalizeString(item.requested_by) || '',
      participants_resolved: resolvedParticipants,
      upskill_participants: resolvedUpskill,
      reskill_participants: resolvedReskill,
      development_participant_source: developmentSource,
      participant_roster: participantsList
    }
  })

  const courseSummaryMap = new Map()

  mapped.forEach(record => {
    const courseName = resolveCourseName(record)
    const courseKey = courseName.toLowerCase()
    if (!courseSummaryMap.has(courseKey)) {
      courseSummaryMap.set(courseKey, {
        key: courseKey || `course-${record.id}`,
        course_name: courseName,
        request_count: 0,
        total_participants: 0,
        upskill_participants: 0,
        reskill_participants: 0,
        packages: new Set(),
        groups: new Set(),
        departments: new Set(),
        sections: new Set(),
        request_entries: [],
        participant_roster: [],
        missing_roster_requests: [],
        last_requested_at: null
      })
    }

    const entry = courseSummaryMap.get(courseKey)
    entry.request_count += 1

    const totalParticipants = Number(record.participants_resolved) || Number(record.participants) || 0
    const upskillParticipants = Number(record.upskill_participants) || 0
    const reskillParticipants = Number(record.reskill_participants) || 0

    entry.total_participants += totalParticipants
    entry.upskill_participants += upskillParticipants
    entry.reskill_participants += reskillParticipants

    const packageName = resolvePackageName(record)
    entry.packages.add(packageName)

    const groupName = normalizeString(record.group_name || record.group_full_name || record.employee_group_name || record.employee_group_line) || 'ไม่ระบุ'
    entry.groups.add(groupName)

    const departmentName = normalizeString(record.department || record.department_full_name || record.employee_department) || 'ไม่ระบุ'
    entry.departments.add(departmentName)

    const sectionName = normalizeString(record.section || record.section_full_name || record.employee_section) || 'ไม่ระบุ'
    entry.sections.add(sectionName)

    if (!entry.last_requested_at || new Date(record.created_at) > new Date(entry.last_requested_at)) {
      entry.last_requested_at = record.created_at
    }

    const requestEntry = {
      request_id: record.id,
      course_name: courseName,
      package_name: packageName,
      group_name: groupName,
      department: departmentName,
      section: sectionName,
      requester: normalizeString(record.employee_name) || normalizeString(record.requested_by) || '',
      quarter: normalizeString(record.quarter),
      participants: totalParticipants,
      upskill_participants: upskillParticipants,
      reskill_participants: reskillParticipants,
      development_participant_source: record.development_participant_source,
      created_at: record.created_at,
      status: normalizeString(record.status),
      participant_roster: record.participant_roster || []
    }

    entry.request_entries.push(requestEntry)

    const rosterList = Array.isArray(record.participant_roster) ? record.participant_roster : []
    if (rosterList.length > 0) {
      rosterList.forEach(participant => {
        entry.participant_roster.push({
          ...participant,
          request_id: record.id,
          course_name: courseName,
          package_name: packageName,
          group_name: groupName,
          department: departmentName,
          section: sectionName,
          requester: requestEntry.requester,
          quarter: requestEntry.quarter,
          development_participant_source: requestEntry.development_participant_source,
          created_at: record.created_at
        })
      })
    } else if (totalParticipants > 0) {
      entry.missing_roster_requests.push({
        request_id: record.id,
        package_name: packageName,
        group_name: groupName,
        department: departmentName,
        section: sectionName,
        requester: requestEntry.requester,
        total_participants: totalParticipants,
        upskill_participants: upskillParticipants,
        reskill_participants: reskillParticipants,
        development_participant_source: requestEntry.development_participant_source,
        quarter: requestEntry.quarter,
        created_at: record.created_at
      })
    }
  })

  const courseSummary = Array.from(courseSummaryMap.values()).map(entry => {
    entry.request_entries.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    entry.participant_roster.sort((a, b) => {
      const courseCompare = String(a.course_name || '').localeCompare(String(b.course_name || ''), 'th-TH')
      if (courseCompare !== 0) {
        return courseCompare
      }
      const requestCompare = Number(a.request_id || 0) - Number(b.request_id || 0)
      if (requestCompare !== 0) {
        return requestCompare
      }
      return String(a.name || a.participant_name || '').localeCompare(String(b.name || b.participant_name || ''), 'th-TH')
    })

    return {
      key: entry.key,
      course_name: entry.course_name,
      request_count: entry.request_count,
      total_participants: entry.total_participants,
      upskill_participants: entry.upskill_participants,
      reskill_participants: entry.reskill_participants,
      packages: Array.from(entry.packages).sort((a, b) => a.localeCompare(b, 'th-TH')),
      groups: Array.from(entry.groups).sort((a, b) => a.localeCompare(b, 'th-TH')),
      departments: Array.from(entry.departments).sort((a, b) => a.localeCompare(b, 'th-TH')),
      sections: Array.from(entry.sections).sort((a, b) => a.localeCompare(b, 'th-TH')),
      request_entries: entry.request_entries,
      participant_roster: entry.participant_roster,
      missing_roster_requests: entry.missing_roster_requests,
      roster_available: entry.participant_roster.length > 0,
      roster_count: entry.participant_roster.length,
      last_requested_at: entry.last_requested_at
    }
  }).sort((a, b) => {
    if (b.total_participants !== a.total_participants) {
      return b.total_participants - a.total_participants
    }
    if (b.request_count !== a.request_count) {
      return b.request_count - a.request_count
    }
    return a.course_name.localeCompare(b.course_name, 'th-TH')
  })

  const latestBySection = new Map()
  mapped.forEach(record => {
    const key = buildSectionKey(record)
    const current = latestBySection.get(key)
    if (!current || new Date(record.created_at) > new Date(current.created_at)) {
      latestBySection.set(key, record)
    }
  })

  const uniqueSectionRecords = Array.from(latestBySection.values()).sort((a, b) => {
    const dateA = new Date(a.created_at)
    const dateB = new Date(b.created_at)
    return dateB - dateA
  })

  const summary = computeSummary(mapped)

  return {
    summary,
    items: uniqueSectionRecords,
    rawItems: mapped,
    courseSummary,
    hasFullAccess,
    userSectionPrefix
  }
}

// Get training reports with summary (filtered by section for authorized users)
router.get('/', authenticateToken, canAccessTraining, async (req, res) => {
  const { quarter, department, year, courseType, packageName, packageCode, groupName } = req.query

  try {
    const data = await getReportData(req.user, { quarter, department, year, courseType, packageName, packageCode, groupName })
    res.json({ summary: data.summary, items: data.items, rawItems: data.rawItems })
  } catch (error) {
    console.error('Failed to fetch reports:', error)
    const status = error.status || 500
      res.json({
        summary: data.summary,
        items: data.items,
        rawItems: data.rawItems,
        courseSummary: data.courseSummary
      })
    res.status(status).json({ error: message })
  }
})

router.get('/org-structure', authenticateToken, canAccessTraining, async (req, res) => {
  try {
    const rawSectionFull = valueOrFallback(req.user?.sectionCodeFull || req.user?.section_full_code)
    const rawSectionCode = valueOrFallback(req.user?.sectionCode || req.user?.section_code)
    const hasFullAccess = req.user?.role === 'hrd_admin' || FULL_ACCESS_SECTION_CODES.includes(rawSectionFull || rawSectionCode)

    if (!hasFullAccess) {
      return res.status(403).json({ error: 'สิทธิ์ไม่เพียงพอในการดูโครงสร้างทั้งหมด' })
    }

    const structure = await buildOrgStructure()
    res.json(structure)
  } catch (error) {
    console.error('Failed to fetch organization structure:', error)
    res.status(500).json({ error: 'ไม่สามารถโหลดโครงสร้างองค์กรได้' })
  }
})

// Export grouped report to Excel
router.get('/export', authenticateToken, canAccessTraining, async (req, res) => {
  const { quarter, department, year, courseType, packageName, packageCode, groupName } = req.query

  try {
    const data = await getReportData(req.user, { quarter, department, year, courseType, packageName, packageCode, groupName })

    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'Training Need Platform'
    workbook.created = new Date()

    const summarySheet = workbook.addWorksheet('สรุปภาพรวม', { views: [{ state: 'frozen', ySplit: 1 }] })
    summarySheet.columns = [
      { header: 'รายการ', key: 'label', width: 40 },
      { header: 'ค่า', key: 'value', width: 25 }
    ]
    summarySheet.getRow(1).font = { bold: true }

  summarySheet.addRow({ label: 'จำนวนทักษะที่มี', value: data.summary.skillCount })
  summarySheet.addRow({ label: 'จำนวนหลักสูตรที่มี', value: data.summary.courseCount })
  summarySheet.addRow({ label: 'จำนวนคำขอทั้งหมด', value: data.summary.total })
  summarySheet.addRow({ label: 'จำนวนคำขอในไตรมาสปัจจุบัน', value: data.summary.thisQuarter })

  const devTotals = data.summary.developmentTypeTotals || { upskill: 0, reskill: 0 }
  const upskillTotal = Number(devTotals.upskill) || 0
  const reskillTotal = Number(devTotals.reskill) || 0
  const combinedDevTotal = upskillTotal + reskillTotal

  summarySheet.addRow({ label: 'ผู้เข้าอบรม (Upskill)', value: upskillTotal })
  summarySheet.addRow({ label: 'ผู้เข้าอบรม (Reskill)', value: reskillTotal })
  summarySheet.addRow({ label: 'ผู้เข้าอบรมรวม (Upskill + Reskill)', value: combinedDevTotal })
  summarySheet.addRow({ label: 'หลักสูตรยอดนิยม', value: data.summary.topCourse || '-' })
    summarySheet.addRow({})
    summarySheet.addRow({ label: 'จำนวนคำขอตามสถานะ', value: '' })

    Object.entries(data.summary.statusCount || {}).forEach(([status, count]) => {
      summarySheet.addRow({ label: `- ${status}`, value: count })
    })

    summarySheet.columns.forEach(column => {
      column.alignment = { vertical: 'middle', horizontal: 'left' }
    })

    const groupsMap = new Map()
    data.rawItems.forEach(item => {
      const groupKey = item.group_name || item.group_full_name || 'ไม่ระบุ'
      const groupFull = item.group_full_name || ''

      if (!groupsMap.has(groupKey)) {
        groupsMap.set(groupKey, {
          fullName: groupFull,
          departments: new Map()
        })
      }

      const groupEntry = groupsMap.get(groupKey)
      if (!groupEntry.fullName && groupFull) {
        groupEntry.fullName = groupFull
      }

      const departmentKey = item.department || item.department_full_name || 'ไม่ระบุ'
      const departmentFull = item.department_full_name || ''

      if (!groupEntry.departments.has(departmentKey)) {
        groupEntry.departments.set(departmentKey, {
          fullName: departmentFull,
          rows: []
        })
      }

      const departmentEntry = groupEntry.departments.get(departmentKey)
      if (!departmentEntry.fullName && departmentFull) {
        departmentEntry.fullName = departmentFull
      }
      departmentEntry.rows.push(item)
    })

    const sortedGroups = Array.from(groupsMap.entries()).sort((a, b) =>
      a[0].localeCompare(b[0], 'th-TH')
    )

    if (sortedGroups.length === 0) {
      const worksheet = workbook.addWorksheet('ข้อมูล', { views: [{ state: 'frozen', ySplit: 1 }] })
      worksheet.columns = [
        { header: 'ข้อความ', key: 'message', width: 40 }
      ]
      worksheet.addRow({ message: 'ไม่มีข้อมูลสำหรับสายงานที่เลือก' })
    } else {
      sortedGroups.forEach(([groupAbbr, groupEntry], groupIndex) => {
        const sheetName = sanitizeSheetName(`${groupIndex + 1}.${groupAbbr}`, `สายงาน${groupIndex + 1}`)
        const worksheet = workbook.addWorksheet(sheetName, { views: [{ state: 'frozen', ySplit: 2 }] })

        worksheet.columns = [
          { header: 'ลำดับ', key: 'index', width: 8 },
          { header: 'ฝ่าย', key: 'department', width: 28 },
          { header: 'ส่วนงาน', key: 'section', width: 28 },
          { header: 'รหัสพนักงาน', key: 'employee_id', width: 18 },
          { header: 'ชื่อพนักงาน', key: 'employee_name', width: 28 },
          { header: 'ชื่อหลักสูตร', key: 'course_title', width: 45 },
          { header: 'ประเภทหลักสูตร', key: 'course_type', width: 20 },
          { header: 'ไตรมาส', key: 'quarter', width: 12 },
          { header: 'จำนวนผู้เข้าร่วม', key: 'participants', width: 20 },
          { header: 'Upskill', key: 'upskill_participants', width: 14 },
          { header: 'Reskill', key: 'reskill_participants', width: 14 },
          { header: 'วันที่ส่ง', key: 'created_at', width: 24 },
          { header: 'สถานะ', key: 'status', width: 18 }
        ]

        const headerRow = worksheet.getRow(1)
        headerRow.font = { bold: true }
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' }

        const groupInfoRow = worksheet.addRow({})
        worksheet.mergeCells(groupInfoRow.number, 1, groupInfoRow.number, worksheet.columnCount)
        const groupInfoCell = worksheet.getCell(groupInfoRow.number, 1)
        const groupDisplay = groupEntry.fullName && groupEntry.fullName !== groupAbbr
          ? `${groupAbbr} (${groupEntry.fullName})`
          : groupAbbr
        groupInfoCell.value = `สายงาน: ${groupDisplay}`
        groupInfoCell.font = { bold: true, size: 13 }
        groupInfoCell.alignment = { vertical: 'middle', horizontal: 'left' }

        const departments = Array.from(groupEntry.departments.entries()).sort((a, b) =>
          a[0].localeCompare(b[0], 'th-TH')
        )

        departments.forEach(([departmentAbbr, departmentEntry]) => {
          const departmentHeaderRow = worksheet.addRow({})
          worksheet.mergeCells(departmentHeaderRow.number, 1, departmentHeaderRow.number, worksheet.columnCount)
          const departmentCell = worksheet.getCell(departmentHeaderRow.number, 1)
          const departmentDisplay = departmentEntry.fullName && departmentEntry.fullName !== departmentAbbr
            ? `${departmentAbbr} (${departmentEntry.fullName})`
            : departmentAbbr
          departmentCell.value = `ฝ่าย: ${departmentDisplay}`
          departmentCell.font = { bold: true }
          departmentCell.alignment = { vertical: 'middle', horizontal: 'left' }

          departmentEntry.rows
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .forEach((item, rowIndex) => {
              worksheet.addRow({
                index: rowIndex + 1,
                department: departmentAbbr,
                section: item.section || '',
                employee_id: item.employee_id || '',
                employee_name: item.employee_name || '',
                course_title: item.course_title || '',
                course_type: item.course_types || item.course_type || '',
                quarter: item.quarter || '',
                participants: Number(item.participants_resolved || item.participants) || 0,
                upskill_participants: Number(item.upskill_participants) || 0,
                reskill_participants: Number(item.reskill_participants) || 0,
                created_at: formatThaiDate(item.created_at),
                status: item.status || ''
              })
            })

          // Add an empty row for spacing between departments
          worksheet.addRow({})
        })

        worksheet.columns.forEach(column => {
          column.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true }
        })
        worksheet.getColumn('index').alignment = { vertical: 'middle', horizontal: 'center' }
        worksheet.getColumn('participants').alignment = { vertical: 'middle', horizontal: 'center' }
        worksheet.getColumn('upskill_participants').alignment = { vertical: 'middle', horizontal: 'center' }
        worksheet.getColumn('reskill_participants').alignment = { vertical: 'middle', horizontal: 'center' }
        worksheet.getColumn('quarter').alignment = { vertical: 'middle', horizontal: 'center' }
      })
    }

    const buffer = await workbook.xlsx.writeBuffer()
    const filename = `training_needs_${new Date().toISOString().split('T')[0]}.xlsx`

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`
    )
    res.send(Buffer.from(buffer))
  } catch (error) {
    console.error('Failed to export Excel report:', error)
    const status = error.status || 500
    const message = error.status ? error.message : 'Server error'
    res.status(status).json({ error: message })
  }
})

router.get('/export/course-view', authenticateToken, canAccessTraining, async (req, res) => {
  const { quarter, department, year, courseType, packageName, packageCode, groupName, mode } = req.query

  try {
    const data = await getReportData(req.user, { quarter, department, year, courseType, packageName, packageCode, groupName })
    const courses = Array.isArray(data.courseSummary) ? data.courseSummary : []

    const normalizedMode = typeof mode === 'string' ? mode.toLowerCase() : 'full'
    const includeSummary = normalizedMode !== 'detail'
    const includeDetail = normalizedMode !== 'summary'

    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'Training Need Platform'
    workbook.created = new Date()

    if (includeSummary) {
      const summarySheet = workbook.addWorksheet('Course Summary', { views: [{ state: 'frozen', ySplit: 1 }] })
      summarySheet.columns = [
        { header: 'ลำดับ', key: 'index', width: 8 },
        { header: 'ชื่อหลักสูตร', key: 'course_name', width: 42 },
        { header: 'จำนวนคำขอ', key: 'request_count', width: 14 },
        { header: 'ผู้เข้าร่วมรวม', key: 'total_participants', width: 18 },
        { header: 'Upskill', key: 'upskill_participants', width: 14 },
        { header: 'Reskill', key: 'reskill_participants', width: 14 },
        { header: 'แพ็คเกจ', key: 'packages', width: 34 },
        { header: 'สายงาน', key: 'groups', width: 34 },
        { header: 'ฝ่าย', key: 'departments', width: 34 },
        { header: 'ส่วนงาน', key: 'sections', width: 34 },
        { header: 'มีรายชื่อผู้เข้าอบรม', key: 'roster_available', width: 18 },
        { header: 'อัปเดตล่าสุด', key: 'last_requested_at', width: 22 }
      ]
      summarySheet.getRow(1).font = { bold: true }

      if (!courses.length) {
        summarySheet.addRow({ index: '-', course_name: 'ไม่มีข้อมูลหลักสูตรในชุดตัวกรองนี้' })
      } else {
        courses.forEach((course, index) => {
          summarySheet.addRow({
            index: index + 1,
            course_name: course.course_name,
            request_count: course.request_count,
            total_participants: course.total_participants,
            upskill_participants: course.upskill_participants,
            reskill_participants: course.reskill_participants,
            packages: Array.isArray(course.packages) ? course.packages.join(', ') : '',
            groups: Array.isArray(course.groups) ? course.groups.join(', ') : '',
            departments: Array.isArray(course.departments) ? course.departments.join(', ') : '',
            sections: Array.isArray(course.sections) ? course.sections.join(', ') : '',
            roster_available: course.roster_available ? 'มีรายชื่อ' : 'ไม่มีรายชื่อ (รวมจำนวนเท่านั้น)',
            last_requested_at: formatThaiDate(course.last_requested_at)
          })
        })
      }

      summarySheet.columns.forEach(column => {
        column.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true }
      })
      summarySheet.getColumn('index').alignment = { vertical: 'middle', horizontal: 'center' }
      summarySheet.getColumn('request_count').alignment = { vertical: 'middle', horizontal: 'center' }
      summarySheet.getColumn('total_participants').alignment = { vertical: 'middle', horizontal: 'center' }
      summarySheet.getColumn('upskill_participants').alignment = { vertical: 'middle', horizontal: 'center' }
      summarySheet.getColumn('reskill_participants').alignment = { vertical: 'middle', horizontal: 'center' }
    }

    if (includeDetail) {
      const detailSheet = workbook.addWorksheet('Course Participants', { views: [{ state: 'frozen', ySplit: 1 }] })
      detailSheet.columns = [
        { header: 'ชื่อหลักสูตร', key: 'course_name', width: 40 },
        { header: 'รหัสคำขอ', key: 'request_id', width: 14 },
        { header: 'ผู้ร้องขอ', key: 'requester', width: 24 },
        { header: 'แพ็คเกจ', key: 'package_name', width: 30 },
        { header: 'สายงาน', key: 'group_name', width: 22 },
        { header: 'ฝ่าย', key: 'department', width: 22 },
        { header: 'ส่วนงาน', key: 'section', width: 22 },
        { header: 'ผู้เข้าอบรม', key: 'participant_name', width: 26 },
        { header: 'รหัสพนักงาน', key: 'employee_id', width: 18 },
        { header: 'ตำแหน่ง', key: 'position', width: 26 },
        { header: 'ประเภทการพัฒนา', key: 'development_type', width: 18 },
        { header: 'แหล่งข้อมูล', key: 'development_participant_source', width: 16 },
        { header: 'จำนวนรวม (ไม่มีรายชื่อ)', key: 'aggregate_total', width: 20 },
        { header: 'Upskill รวม', key: 'aggregate_upskill', width: 14 },
        { header: 'Reskill รวม', key: 'aggregate_reskill', width: 14 },
        { header: 'ไตรมาส', key: 'quarter', width: 10 },
        { header: 'วันที่ส่ง', key: 'created_at', width: 22 }
      ]
      detailSheet.getRow(1).font = { bold: true }

      let detailRowCount = 0

      courses.forEach(course => {
        const rosterRows = Array.isArray(course.participant_roster) ? course.participant_roster : []
        const fallbackRows = Array.isArray(course.missing_roster_requests) ? course.missing_roster_requests : []

        if (rosterRows.length === 0 && fallbackRows.length === 0) {
          detailSheet.addRow({
            course_name: course.course_name,
            request_id: '-',
            participant_name: 'ไม่มีข้อมูลรายชื่อผู้เข้าอบรม',
            aggregate_total: course.total_participants || 0
          })
          detailRowCount += 1
          detailSheet.addRow({})
          return
        }

        rosterRows.forEach(participant => {
          detailSheet.addRow({
            course_name: course.course_name,
            request_id: participant.request_id,
            requester: participant.requester || '',
            package_name: participant.package_name || '',
            group_name: participant.group_name || '',
            department: participant.department || '',
            section: participant.section || '',
            participant_name: participant.name || participant.participant_name || '',
            employee_id: participant.employee_id || '',
            position: participant.position || '',
            development_type: participant.development_type || '',
            development_participant_source: participant.development_participant_source || '',
            quarter: participant.quarter || '',
            created_at: formatThaiDate(participant.created_at)
          })
          detailRowCount += 1
        })

        fallbackRows.forEach(item => {
          detailSheet.addRow({
            course_name: course.course_name,
            request_id: item.request_id,
            requester: item.requester || '',
            package_name: item.package_name || '',
            group_name: item.group_name || '',
            department: item.department || '',
            section: item.section || '',
            development_participant_source: item.development_participant_source || '',
            aggregate_total: item.total_participants || 0,
            aggregate_upskill: item.upskill_participants || 0,
            aggregate_reskill: item.reskill_participants || 0,
            quarter: item.quarter || '',
            created_at: formatThaiDate(item.created_at)
          })
          detailRowCount += 1
        })

        detailSheet.addRow({})
      })

      if (detailRowCount === 0) {
        detailSheet.addRow({ course_name: 'ไม่มีข้อมูลผู้เข้าอบรมในชุดตัวกรองนี้' })
      }

      detailSheet.columns.forEach(column => {
        column.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true }
      })
      detailSheet.getColumn('request_id').alignment = { vertical: 'middle', horizontal: 'center' }
      detailSheet.getColumn('aggregate_total').alignment = { vertical: 'middle', horizontal: 'center' }
      detailSheet.getColumn('aggregate_upskill').alignment = { vertical: 'middle', horizontal: 'center' }
      detailSheet.getColumn('aggregate_reskill').alignment = { vertical: 'middle', horizontal: 'center' }
      detailSheet.getColumn('quarter').alignment = { vertical: 'middle', horizontal: 'center' }
    }

    const buffer = await workbook.xlsx.writeBuffer()
    const dateStamp = new Date().toISOString().split('T')[0]
    const modeLabel = normalizedMode === 'summary' || normalizedMode === 'detail' ? normalizedMode : 'full'
    const filename = `training_course_view_${modeLabel}_${dateStamp}.xlsx`

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`
    )
    res.send(Buffer.from(buffer))
  } catch (error) {
    console.error('Failed to export course view:', error)
    const status = error.status || 500
    const message = error.status ? error.message : 'Server error'
    res.status(status).json({ error: message })
  }
})

const sanitizeEntriesForGemini = (items = []) => {
  return items
    .slice(0, 40)
    .map((item, index) => {
      const fallbackId = `course-${index + 1}`
      return {
        id: normalizeString(item.id) || fallbackId,
        title: normalizeString(item.course_title) || normalizeString(item.course_types) || 'หลักสูตรที่ไม่ระบุชื่อ',
        objective: normalizeString(item.training_objective || item.objective || ''),
        outcome: normalizeString(item.expected_outcome || ''),
        notes: normalizeString(item.free_text || item.custom_request || ''),
        courseType: normalizeString(item.course_type || item.course_types || ''),
  department: normalizeString(item.department_full_name || item.department || item.employee_department || ''),
        strategicTags: [
          normalizeString(item.plan_name || ''),
          normalizeString(item.objective_code || ''),
          normalizeString(item.strategy_code || ''),
          normalizeString(item.tactic_code || ''),
          normalizeString(item.action_plan_code || '')
        ].filter(Boolean)
      }
    })
}

const attachCoverageToResult = (result, totalCourses, analyzedCourses) => {
  if (!result || typeof result !== 'object') {
    return result
  }

  if (!result.dataCoverage || typeof result.dataCoverage !== 'object') {
    result.dataCoverage = {}
  }

  result.dataCoverage.totalCourses = totalCourses
  result.dataCoverage.analyzedCourses = analyzedCourses

  return result
}

const buildFallbackAiResult = (entries = [], totalManual = entries.length) => {
  const byType = new Map()
  entries.forEach(entry => {
    const key = entry.courseType || 'หมวดอื่นๆ'
    if (!byType.has(key)) {
      byType.set(key, [])
    }
    byType.get(key).push(entry.id)
  })

  const categories = Array.from(byType.entries()).map(([label, courseIds]) => ({
    id: label.toLowerCase().replace(/[^a-z0-9ก-๙]+/gi, '-').replace(/^-+|-+$/g, '') || 'misc',
    label,
    description: 'จัดกลุ่มจากประเภทหลักสูตรที่ระบุในระบบ เนื่องจากไม่สามารถเรียกใช้ Gemini ได้',
    confidence: 0.3,
    courseIds,
    topTerms: [],
    strategicValue: 'กลาง'
  }))

  const result = {
    categories,
    executiveSummary: 'ไม่สามารถเชื่อมต่อกับ Gemini ได้ จึงจัดกลุ่มตามประเภทหลักสูตรจากข้อมูลดิบเป็นการชั่วคราว',
    priorityHighlights: [],
    usedFallback: true
  }

  return attachCoverageToResult(result, totalManual, entries.length)
}

router.post('/classify', authenticateToken, canAccessTraining, async (req, res) => {
  try {
    const payloadItems = Array.isArray(req.body?.items) ? req.body.items : []
    if (payloadItems.length === 0) {
      return res.status(400).json({ error: 'กรุณาส่งรายการหลักสูตรที่ต้องการวิเคราะห์' })
    }

    const manualItems = filterCustomPackageItems(payloadItems)
    const manualInsights = buildManualInsights(manualItems)

    const sanitizedEntries = sanitizeEntriesForGemini(manualItems)
    manualInsights.analyzedCount = sanitizedEntries.length
    manualInsights.packageFilter = 'custom-only'
    manualInsights.originalTotal = payloadItems.length
  manualInsights.filteredOut = payloadItems.length - manualItems.length

    if (manualItems.length === 0) {
      const emptyResult = attachCoverageToResult({
        categories: [],
        executiveSummary: 'ยังไม่มีคำขอที่เลือกแพ็คเกจ “อื่นๆ (กำหนดเอง)” ในข้อมูลที่ส่งเข้ามา จึงไม่สามารถจัดลำดับเนื้อหาเฉพาะได้',
        priorityHighlights: [],
        usedFallback: false
      }, 0, 0)

      return res.json({
        result: emptyResult,
        manualInsights,
        meta: {
          total: 0,
          filtered: true,
          note: 'no-custom-package-entries',
          originalRequested: payloadItems.length
        }
      })
    }

    try {
      const { data, model, apiVersion } = await classifyCourses(sanitizedEntries)
      const decoratedResult = attachCoverageToResult(data, manualInsights.totalItems, sanitizedEntries.length)
      return res.json({
        result: decoratedResult,
        manualInsights,
        meta: {
          total: sanitizedEntries.length,
          model,
          apiVersion,
          filtered: manualItems.length !== payloadItems.length,
          originalRequested: payloadItems.length,
          manualCount: manualItems.length,
          sentToGemini: sanitizedEntries.length
        }
      })
    } catch (error) {
      console.error('Gemini classification failed:', error)

      if (error.code === 'GEMINI_API_KEY_MISSING') {
        return res.status(500).json({ error: 'ระบบยังไม่ได้ตั้งค่า GEMINI_API_KEY บนเซิร์ฟเวอร์ จึงไม่สามารถเรียกใช้การวิเคราะห์ด้วย Gemini ได้' })
      }

      const fallback = buildFallbackAiResult(sanitizedEntries, manualInsights.totalItems)
      return res.status(207).json({
        result: fallback,
        manualInsights,
        meta: {
          total: sanitizedEntries.length,
          fallback: true,
          reason: error.message,
          attemptedModels: error.attemptedModels || [],
          filtered: manualItems.length !== payloadItems.length,
          originalRequested: payloadItems.length,
          manualCount: manualItems.length,
          sentToGemini: sanitizedEntries.length
        }
      })
    }
  } catch (err) {
    console.error('Failed to handle Gemini classification:', err)
    res.status(500).json({ error: err.message || 'ไม่สามารถประมวลผลคำขอวิเคราะห์ได้' })
  }
})

module.exports = router
