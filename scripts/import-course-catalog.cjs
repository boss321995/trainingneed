const fs = require('fs/promises')
const path = require('path')
const crypto = require('crypto')
const db = require('../backend/config/database')

const COURSE_FILE = path.resolve(__dirname, '../public/course.txt')

const getPackageCode = (name, cache) => {
  if (cache.codesByName.has(name)) {
    return cache.codesByName.get(name)
  }

  const normalized = name
    .normalize('NFKC')
    .trim()
    .replace(/\s+/g, '_')

  const sanitized = normalized.replace(/[^\p{Letter}\p{Number}_-]/gu, '')
  let baseCode = sanitized ? sanitized.toUpperCase() : ''

  if (!baseCode) {
    baseCode = `PKG_${crypto.createHash('md5').update(name).digest('hex').slice(0, 8).toUpperCase()}`
  }

  let candidate = baseCode.slice(0, 50)
  let suffix = 1
  while (cache.usedCodes.has(candidate)) {
    suffix += 1
    const suffixStr = `_${suffix}`
    candidate = `${baseCode.slice(0, 50 - suffixStr.length)}${suffixStr}`
  }

  cache.usedCodes.add(candidate)
  cache.codesByName.set(name, candidate)
  return candidate
}

const parseLine = (line) => {
  if (!line) return null

  const parts = line
    .split(/\t+/)
    .map((part) => part.trim())
    .filter(Boolean)

  if (parts.length < 3) return null

  const [packageName, courseCode, ...courseNameParts] = parts
  const courseName = courseNameParts.join(' ').trim()

  if (!packageName || !courseCode || !courseName) return null

  if (courseCode === 'รหัสหลักสูตร' || packageName === 'แพ็คเกจ') {
    return null
  }

  return {
    packageName,
    courseCode,
    courseName
  }
}

const ensureTables = async () => {
  await db.execute('SET FOREIGN_KEY_CHECKS = 0')
  try {
    await db.execute('DROP TABLE IF EXISTS course_catalog')
    await db.execute('DROP TABLE IF EXISTS course_packages')
  } finally {
    await db.execute('SET FOREIGN_KEY_CHECKS = 1')
  }

  await db.execute(`
    CREATE TABLE course_packages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      package_code VARCHAR(100) NOT NULL UNIQUE,
      package_name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `)

  await db.execute(`
    CREATE TABLE course_catalog (
      id INT AUTO_INCREMENT PRIMARY KEY,
      package_id INT NOT NULL,
      course_code VARCHAR(100) NOT NULL,
      course_name VARCHAR(255) NOT NULL,
      duration VARCHAR(100),
      training_hours DECIMAL(5,2),
      supplier VARCHAR(255),
      division VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_course_per_package (package_id, course_code),
      CONSTRAINT fk_course_catalog_package FOREIGN KEY (package_id)
        REFERENCES course_packages(id) ON DELETE CASCADE
    )
  `)
}

const readCourses = async () => {
  const content = await fs.readFile(COURSE_FILE, 'utf8')
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  return lines.map(parseLine).filter(Boolean)
}

const importData = async () => {
  await ensureTables()
  const rows = await readCourses()

  if (rows.length === 0) {
    console.warn('No course rows parsed. Tables were recreated but remain empty.')
    return
  }

  const codeCache = {
    usedCodes: new Set(),
    codesByName: new Map()
  }
  const packageIdMap = new Map()

  const uniquePackageNames = Array.from(new Set(rows.map((row) => row.packageName)))

  for (const name of uniquePackageNames) {
  const packageCode = getPackageCode(name, codeCache)

    const [existing] = await db.execute('SELECT id FROM course_packages WHERE package_code = ?', [packageCode])

    if (existing.length > 0) {
      const packageId = existing[0].id
      await db.execute('UPDATE course_packages SET package_name = ? WHERE id = ?', [name, packageId])
      packageIdMap.set(name, packageId)
      continue
    }

    const [result] = await db.execute(
      'INSERT INTO course_packages (package_code, package_name) VALUES (?, ?)',
      [packageCode, name]
    )
    packageIdMap.set(name, result.insertId)
  }

  const seenCourses = new Set()

  for (const row of rows) {
    const packageId = packageIdMap.get(row.packageName)

    if (!packageId) {
      console.warn(`Package not found for course: ${row.courseName}`)
      continue
    }

    const courseKey = `${packageId}:${row.courseCode}`
    if (seenCourses.has(courseKey)) {
      continue
    }
    seenCourses.add(courseKey)

    await db.execute(
      `INSERT INTO course_catalog (package_id, course_code, course_name, duration, training_hours, supplier, division)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        packageId,
        row.courseCode,
        row.courseName,
        null,
        null,
        null,
        null
      ]
    )
  }

  console.log(`Imported ${seenCourses.size} courses across ${packageIdMap.size} packages.`)
}

importData()
  .then(() => {
    console.log('Course catalog import completed.')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Import failed:', error)
    process.exit(1)
  })
