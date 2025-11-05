// Mock database using real employee data structure from hrnt table

const employees = [
  {
    id: '1000062',
    employee_id: '01000062', 
    fullname: 'นาย ประจวบ ไกลถิ่น',
    name: 'ประจวบ',
    surname: 'ไกลถิ่น',
    title: 'นาย',
    position: 'วิศวกร 8',
    position_code: 'วศก.8',
    level: '08',
    department: 'สถาบันวิชาการ',
    department_short: 'สกบ.',
    section: 'ส่วนสนับสนุนการพัฒนาบุคลากร',
    section_code: 'สสกบ.',
    email: 'prachuap.k@ntplc.co.th',
  supervisor_id: '00292708', // IDPH1 (previously H1)
  supervisor2_id: '13200047', // IDPH2 (previously H2)  
    role: 'user'
  },
  {
    id: '292708',
    employee_id: '00292708',
    fullname: 'นาย สุรพงศ์ ระวังวงศ์',
    name: 'สุรพงศ์',
    surname: 'ระวังวงศ์',
    title: 'นาย',
    position: 'ผู้จัดการส่วน 8',
    position_code: 'ผส.8',
    level: '08',
    department: 'สถาบันวิชาการ',
    department_short: 'สกบ.',
    section: 'ส่วนสนับสนุนการพัฒนาบุคลากร',
    section_code: 'สสกบ.',
    email: 'surapong.r@ntplc.co.th',
  supervisor_id: '13200047', // IDPH1
  supervisor2_id: '13200047', // IDPH2
    role: 'manager'
  },
  {
    id: '13200047',
    employee_id: '13200047',
    fullname: 'นาง ประภาศรี ศิริวรรธนาภา',
    name: 'ประภาศรี',
    surname: 'ศิริวรรธนาภา',
    title: 'นาง',
    position: 'ผู้จัดการสถาบัน 11',
    position_code: 'ผจก.11',
    level: '11',
    department: 'สถาบันวิชาการ',
    department_short: 'สกบ.',
    section: 'สถาบันวิชาการ',
    section_code: 'สกบ.',
    email: 'prapasrs@ntplc.co.th',
  supervisor_id: '00270005', // IDPH1
  supervisor2_id: '00270005', // IDPH2
    role: 'hrd_admin'
  },
  {
    id: '305556',
    employee_id: '00305556',
    fullname: 'นาย พรศักดิ์ นัสธีทอง',
    name: 'พรศักดิ์',
    surname: 'นัสธีทอง',
    title: 'นาย',
    position: 'นักบริหารงานทั่วไป 7',
    position_code: 'นบง.7',
    level: '07',
    department: 'สถาบันวิชาการ',
    department_short: 'สกบ.',
    section: 'ส่วนพัฒนาบุคลากร',
    section_code: 'พสกบ.',
    email: 'ponsak.n@ntplc.co.th',
  supervisor_id: '13500384', // IDPH1
  supervisor2_id: '13200047', // IDPH2
    role: 'user'
  },
  {
    id: '13500384',
    employee_id: '13500384',
    fullname: 'นาง อินทิรา ศาสตรวาหา',
    name: 'อินทิรา',
    surname: 'ศาสตรวาหา',
    title: 'นาง',
    position: 'ผู้จัดการส่วน 10',
    position_code: 'ผส.10',
    level: '10',
    department: 'สถาบันวิชาการ',
    department_short: 'สกบ.',
    section: 'ส่วนพัฒนาบุคลากร',
    section_code: 'พสกบ.',
    email: 'intira@ntplc.co.th',
  supervisor_id: '13200047', // IDPH1
  supervisor2_id: '13200047', // IDPH2
    role: 'manager'
  }
]

const trainingNeeds = [
  {
    id: 1,
    employee_id: '1000062',
    employee_name: 'นาย ประจวบ ไกลถิ่น',
    department: 'สถาบันวิชาการ',
    section: 'ส่วนสนับสนุนการพัฒนาบุคลากร',
    course_type: 'technical',
    course_title: 'Advanced JavaScript Programming',
    quarter: 'Q1',
    participants: 10,
    free_text: 'จำเป็นสำหรับการพัฒนาระบบใหม่',
    created_at: '2025-01-15',
    status: 'pending'
  },
  {
    id: 2,
    employee_id: '305556',
    employee_name: 'นาย พรศักดิ์ นัสธีทอง',
    department: 'สถาบันวิชาการ',
    section: 'ส่วนพัฒนาบุคลากร',
    course_type: 'soft_skills',
    course_title: 'Leadership and Team Management',
    quarter: 'Q2',
    participants: 8,
    free_text: 'เพื่อพัฒนาทักษะการบริหารทีมงาน',
    created_at: '2025-02-01',
    status: 'pending'
  }
]

let nextId = 3

module.exports = {
  employees,
  trainingNeeds,
  nextId: () => nextId++
}
