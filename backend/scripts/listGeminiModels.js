require('dotenv').config()

const fetch = global.fetch || ((...args) => import('node-fetch').then(({ default: nodeFetch }) => nodeFetch(...args)))

const apiKey = process.env.GEMINI_API_KEY

if (!apiKey) {
  console.error('✖️  GEMINI_API_KEY ไม่ได้ถูกตั้งค่าใน .env หรือ environment')
  process.exit(1)
}

const versions = [
  process.env.GEMINI_API_VERSION?.trim() || 'v1',
  'v1beta'
]

async function listModels(version) {
  const url = `https://generativelanguage.googleapis.com/${version}/models?key=${apiKey}`
  const res = await fetch(url)
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`ListModels ${version} ล้มเหลว (HTTP ${res.status}): ${body}`)
  }
  const data = await res.json()
  return data.models || []
}

;(async () => {
  const seen = new Set()
  for (const version of versions) {
    if (seen.has(version)) continue
    seen.add(version)

    try {
      const models = await listModels(version)
      console.log(`\n▼ Models สำหรับ API ${version} (${models.length} รายการ)`)
      models
        .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
        .forEach(model => {
          const supports = Array.isArray(model.supportedGenerationMethods)
            ? model.supportedGenerationMethods.join(', ')
            : 'unknown'
          console.log(`  • ${model.name} (methods: ${supports})`)
        })
    } catch (error) {
      console.error(`\n✖️  ไม่สามารถเรียก ListModels (${version}) ได้:`, error.message)
    }
  }
})()
