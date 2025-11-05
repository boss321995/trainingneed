const normalizeModelName = (value) => {
  const raw = (value || '').trim().replace(/^models\//, '')
  if (!raw) {
    return 'gemini-2.0-flash'
  }

  if (/-latest$/.test(raw) || /-\d{3}$/.test(raw)) {
    return raw
  }

  if (/gemini-1\.5-(flash|pro)$/.test(raw)) {
    return `${raw}-latest`
  }

  if (/gemini-2\.(0|5)-(flash|pro)$/.test(raw)) {
    return `${raw}`
  }

  return raw
}

const DEFAULT_MODEL = normalizeModelName(process.env.GEMINI_MODEL)
const DEFAULT_API_VERSION = (process.env.GEMINI_API_VERSION || 'v1').trim()

const resolveResponseMime = () => {
  const explicit = (process.env.GEMINI_RESPONSE_MIME || '').trim()
  if (explicit.toLowerCase() === 'none') {
    return null
  }
  if (explicit) {
    return explicit
  }
  if (/beta/i.test(DEFAULT_API_VERSION)) {
    return 'application/json'
  }
  return null
}

const DEFAULT_RESPONSE_MIME = resolveResponseMime()

if (process.env.DEBUG_GEMINI_CONFIG === 'true') {
  console.log('[GeminiClassifier] defaults:', {
    model: DEFAULT_MODEL,
    apiVersion: DEFAULT_API_VERSION,
    responseMime: DEFAULT_RESPONSE_MIME || '(none)'
  })
}

const buildEndpoint = (model, apiVersion = DEFAULT_API_VERSION) => {
  const override = (process.env.GEMINI_API_URL || '').trim()
  if (override) {
    return override
      .replace('{model}', model)
      .replace(':model', model)
      .replace('{version}', apiVersion)
  }
  return `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent`
}

const pick = (value, fallback = '') => {
  if (value === null || value === undefined) {
    return fallback
  }
  const trimmed = String(value).trim()
  return trimmed.length === 0 ? fallback : trimmed
}

const truncate = (value, max = 400) => {
  const text = pick(value)
  if (text.length <= max) {
    return text
  }
  return `${text.slice(0, max - 3)}...`
}

const stripCodeFence = (text = '') => {
  const trimmed = text.trim()
  if (!trimmed.startsWith('```')) {
    return trimmed
  }

  const fenceMatch = trimmed.match(/^```(?:json|javascript|js)?\s*\n?/i)
  if (fenceMatch) {
    const withoutOpening = trimmed.slice(fenceMatch[0].length)
    const closingIndex = withoutOpening.lastIndexOf('```')
    if (closingIndex !== -1) {
      return withoutOpening.slice(0, closingIndex).trim()
    }
    return withoutOpening.trim()
  }

  const closingIndex = trimmed.lastIndexOf('```')
  if (closingIndex > 0) {
    return trimmed.slice(3, closingIndex).trim()
  }

  return trimmed
}

const sanitizeGeminiJson = (text = '') => {
  let cleaned = stripCodeFence(text)
  cleaned = cleaned.replace(/[\u200B-\u200D\uFEFF]/g, '').trim()

  const firstBrace = cleaned.indexOf('{')
  const lastBrace = cleaned.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1)
  }

  return cleaned
}

const tryParseGeminiJson = (text, debugLabel = '') => {
  const attempts = Array.from(new Set([
    text,
    sanitizeGeminiJson(text)
  ].filter(Boolean)))

  for (const candidate of attempts) {
    try {
      return JSON.parse(candidate)
    } catch (error) {
      if (process.env.DEBUG_GEMINI_CONFIG === 'true') {
        console.warn('[GeminiClassifier] JSON parse failed', {
          attempt: debugLabel,
          candidate: candidate.slice(0, 200)
        })
      }
    }
  }

  return null
}

const buildPrompt = (entries) => {
  const catalog = entries.map(entry => ({
    id: entry.id,
    title: truncate(entry.title, 120),
    objective: truncate(entry.objective, 220),
    outcome: truncate(entry.outcome, 220),
    notes: truncate(entry.notes, 200),
    courseType: truncate(entry.courseType, 60),
    department: truncate(entry.department, 80),
    strategicTags: entry.strategicTags
  }))

  return `คุณเป็นผู้ช่วยฝ่ายวางแผนการฝึกอบรมขององค์กรรัฐวิสาหกิจด้านการสื่อสารในประเทศไทย\n` +
    `ทำหน้าที่สกัดข้อมูลเพื่อจัดทำแผนปฏิบัติการฝึกอบรม โดยโฟกัสคำขอที่เลือกแพ็คเกจ “อื่นๆ (กำหนดเอง)” และวิเคราะห์ความต้องการตามสายงาน\n` +
    `ข้อกำหนด:\n` +
    `1. จัดกลุ่มหัวข้อเป็นไม่เกิน 6 หมวด โดยใช้ชื่อภาษาไทยที่สั้น กระชับ และสะท้อนจุดเน้นสำหรับการเตรียมแผนฝึกอบรม\n` +
    `2. เรียงลำดับหมวดจากความต้องการสูงไปต่ำ โดยพิจารณาจำนวนรายการในหมวดและจำนวนส่วนงาน/กลุ่มงานที่ร้องขอร่วมกัน\n` +
    `3. ในคำอธิบายแต่ละหมวดให้ระบุสายงานหรือกลุ่มงานหลักที่ร้องขอ ระบุความซ้ำซ้อนข้ามส่วนงาน และชี้โอกาสบูรณาการหลักสูตร\n` +
    `4. สรุปภาพรวมเชิงการวางแผน 2-3 ประโยค ระบุทิศทางเด่นและการเตรียมทรัพยากรที่ควรจัดไว้รองรับ\n` +
    `5. สร้าง priorityHighlights อย่างน้อย 3 รายการ (หรือเท่าที่มีข้อมูล) โดยระบุแพ็คเกจหรือหมวดที่ถูกเลือกบ่อยสุด พร้อมคำแนะนำเชิงปฏิบัติและระดับผลกระทบ\n` +
    `6. ให้ผลลัพธ์เป็น JSON ตามโครงสร้างต่อไปนี้ (ใช้ภาษาไทยทั้งหมด):\n` +
    `{
  "categories": [
    {
      "id": "slug-ไม่ซ้ำ",
      "label": "ชื่อหมวด",
      "description": "เหตุผลที่จัดกลุ่ม",
      "confidence": 0-1,
      "courseIds": ["id"...],
      "topTerms": ["คำสำคัญ",...],
      "strategicValue": "สูง|กลาง|ต่ำ"
    }
  ],
  "executiveSummary": "สรุปไม่เกิน 3 ประโยค",
  "priorityHighlights": [
    {
      "title": "โครงการ/หมวดที่ควรเร่ง",
      "recommendation": "การดำเนินการที่แนะนำ",
      "impact": "สูง|กลาง|ต่ำ"
    }
  ],
  "dataCoverage": {
    "totalCourses": จำนวนทั้งหมด,
    "analyzedCourses": จำนวนที่วิเคราะห์
  }
}\n` +
    `7. ถ้าไม่สามารถวิเคราะห์ได้ให้ระบุเหตุผลใน executiveSummary\n` +
    `ข้อมูลคำขอฝึกอบรม (JSON):\n` +
    `${JSON.stringify(catalog, null, 2)}`
}

const ensureFetch = async () => {
  if (typeof fetch !== 'undefined') {
    return fetch
  }
  const { default: nodeFetch } = await import('node-fetch')
  return nodeFetch
}

const parseGeminiResponse = (payload) => {
  if (!payload) {
    throw new Error('ไม่มีข้อมูลตอบกลับจาก Gemini')
  }

  const primaryCandidate = payload.candidates?.[0]
  if (!primaryCandidate) {
    throw new Error('Gemini ไม่ได้ส่งคำตอบกลับมา')
  }

  const partText = primaryCandidate.content?.parts?.[0]?.text || primaryCandidate.content?.parts?.[0]?.rawText
  if (!partText) {
    throw new Error('ไม่พบข้อความผลลัพธ์จาก Gemini')
  }

  const parsed = tryParseGeminiJson(partText, 'primary')
  if (parsed) {
    return parsed
  }

  const error = new Error('ไม่สามารถแปลงผลลัพธ์จาก Gemini เป็น JSON ได้')
  error.rawText = partText
  throw error
}

const appendApiKey = (endpoint, apiKey) => {
  if (endpoint.includes('?')) {
    return `${endpoint}&key=${apiKey}`
  }
  return `${endpoint}?key=${apiKey}`
}

const createModelCandidates = (primaryModel) => {
  const candidates = [primaryModel]

  if (/gemini-1\.5-flash/.test(primaryModel)) {
    candidates.push('gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-flash-001')
  }

  if (/gemini-1\.5-pro/.test(primaryModel)) {
    candidates.push('gemini-1.5-pro', 'gemini-1.5-pro-latest', 'gemini-1.5-pro-001')
  }

  if (/gemini-2\.0-flash/.test(primaryModel)) {
    candidates.push('gemini-2.0-flash', 'gemini-2.0-flash-001', 'gemini-2.0-flash-lite', 'gemini-2.0-flash-lite-001')
  }

  if (/gemini-2\.0-pro/.test(primaryModel)) {
    candidates.push('gemini-2.0-pro', 'gemini-2.0-pro-001')
  }

  if (/gemini-2\.5-flash/.test(primaryModel)) {
    candidates.push('gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.5-flash-preview-05-20', 'gemini-2.5-flash-preview-09-2025')
  }

  if (/gemini-2\.5-pro/.test(primaryModel)) {
    candidates.push('gemini-2.5-pro', 'gemini-2.5-pro-preview-03-25', 'gemini-2.5-pro-preview-05-06')
  }

  return Array.from(new Set(candidates.map(normalizeModelName)))
}

const createVersionCandidates = (primaryVersion) => {
  const base = primaryVersion ? [primaryVersion] : []
  const extras = ['v1', 'v1beta']
  extras.forEach(version => {
    if (!base.includes(version)) {
      base.push(version)
    }
  })
  return base
}

const buildGenerationConfig = () => {
  const config = {
    temperature: 0.35,
    topP: 0.95
  }

  if (DEFAULT_RESPONSE_MIME) {
    config.responseMimeType = DEFAULT_RESPONSE_MIME
  }

  return config
}

const invokeGemini = async (fetchImpl, { model, prompt, apiKey, apiVersion }) => {
  const endpoint = buildEndpoint(model, apiVersion)
  const generationConfig = buildGenerationConfig()
  const response = await fetchImpl(appendApiKey(endpoint, apiKey), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig
    })
  })

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '')
    const error = new Error(`Gemini API ตอบกลับด้วยสถานะ ${response.status}: ${errorBody}`)
    error.status = response.status
    error.endpoint = endpoint
    error.model = model
    error.apiVersionTried = apiVersion
    throw error
  }

  const json = await response.json()
  return {
    data: parseGeminiResponse(json),
    raw: json,
    endpoint,
    model,
    apiVersion
  }
}

async function classifyCourses(entries = []) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    const error = new Error('ไม่ได้ตั้งค่า GEMINI_API_KEY ในสภาพแวดล้อมของเซิร์ฟเวอร์')
    error.code = 'GEMINI_API_KEY_MISSING'
    throw error
  }

  if (!Array.isArray(entries) || entries.length === 0) {
    throw new Error('ต้องมีข้อมูลหลักสูตรอย่างน้อย 1 รายการเพื่อวิเคราะห์')
  }

  const fetchImpl = await ensureFetch()
  const prompt = buildPrompt(entries)
  const modelCandidates = createModelCandidates(DEFAULT_MODEL)
  const versionCandidates = createVersionCandidates(DEFAULT_API_VERSION)

  const attempted = []
  let lastError

  for (const apiVersion of versionCandidates) {
    for (const model of modelCandidates) {
      try {
        const result = await invokeGemini(fetchImpl, { model, prompt, apiKey, apiVersion })
        return {
          data: result.data,
          model: result.model,
          apiVersion: result.apiVersion
        }
      } catch (error) {
        attempted.push({ model, apiVersion, status: error.status || null, message: error.message })
        if (error.status === 404) {
          lastError = error
          continue
        }
        error.attemptedModels = attempted
        throw error
      }
    }
  }

  if (lastError) {
    lastError.attemptedModels = attempted
    throw lastError
  }

  const error = new Error('ไม่สามารถเชื่อมต่อกับ Gemini ได้ (ลองหลายรุ่นแล้วยังล้มเหลว)')
  error.attemptedModels = attempted
  throw error
}

module.exports = {
  classifyCourses
}
