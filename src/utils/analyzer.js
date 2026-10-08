import dictionary from '../data/destructiveWords.json'

// === Разворачиваем словарь в плоский список один раз при загрузке модуля ===
export const PATTERNS = Object.entries(dictionary.categories).flatMap(
  ([key, category]) =>
    category.words.map((word) => ({
      word: word.toLowerCase(),
      weight: category.weight,
      category: key,
      label: category.label,
      color: category.color,
    }))
)

// Сортируем по длине (длинные фразы проверяем первыми)
PATTERNS.sort((a, b) => b.word.length - a.word.length)

// === Утилиты ===
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// ⚠️ БЕЗ флага g — иначе .test() хранит lastIndex и ломается на повторных вызовах
const buildTestRegex = (word) =>
  new RegExp(`(?<![\\p{L}\\p{N}])${escapeRegex(word)}(?![\\p{L}\\p{N}])`, 'iu')

// Для подсветки нужен g — здесь split по всем вхождениям
const buildHighlightRegex = (words) => {
  const pattern = words.map(escapeRegex).join('|')
  return new RegExp(`(${pattern})`, 'giu')
}

// === Основной локальный анализ ===
export function performLocalAnalysis(inputText) {
  const lower = inputText.toLowerCase()
  const found = new Map()

  for (const pattern of PATTERNS) {
    try {
      const re = buildTestRegex(pattern.word)  // каждый раз новая, без g
      if (re.test(lower)) {
        found.set(pattern.word, pattern)
      }
    } catch {
      if (lower.includes(pattern.word)) {
        found.set(pattern.word, pattern)
      }
    }
  }

  const totalWeight = [...found.values()].reduce((sum, p) => sum + p.weight, 0)
  const score = Math.min(Math.round(totalWeight * 1.2), 100)

  const categoriesMap = new Map()
  for (const p of found.values()) {
    if (!categoriesMap.has(p.category)) {
      categoriesMap.set(p.category, {
        key: p.category,
        label: p.label,
        color: p.color,
        count: 0,
      })
    }
    categoriesMap.get(p.category).count += 1
  }
  const categories = [...categoriesMap.values()]

  let level = 'Безопасно'
  let color = '#10b981'
  let recommendation = 'Текст не содержит деструктивных элементов'

  if (score > 70) {
    level = 'Критический'
    color = '#ef4444'
    recommendation =
      'Текст содержит явные деструктивные элементы. Рекомендуется дополнительная проверка.'
  } else if (score > 40) {
    level = 'Высокий'
    color = '#f97316'
    recommendation = 'Текст содержит потенциально опасные элементы.'
  } else if (score > 20) {
    level = 'Средний'
    color = '#eab308'
    recommendation = 'Текст содержит отдельные деструктивные элементы.'
  } else if (score > 0) {
    level = 'Низкий'
    color = '#84cc16'
    recommendation = 'Текст содержит минимальные деструктивные элементы.'
  }

  return {
    score,
    level,
    color,
    recommendation,
    foundWords: [...found.keys()],
    foundDetails: [...found.values()],
    categories,
    wordCount: inputText.split(/\s+/).filter((w) => w.length > 0).length,
    charCount: inputText.length,
  }
}

// === Безопасная подсветка ===
export function tokenizeWithHighlights(inputText, foundWords) {
  if (!foundWords || foundWords.length === 0) {
    return [{ text: inputText, isDanger: false }]
  }

  const sorted = [...foundWords].sort((a, b) => b.length - a.length)
  const regex = buildHighlightRegex(sorted)  // тут g нужен и корректен
  const parts = inputText.split(regex)
  const dangerSet = new Set(sorted.map((w) => w.toLowerCase()))

  return parts
    .filter((p) => p !== '')
    .map((part) => ({
      text: part,
      isDanger: dangerSet.has(part.toLowerCase()),
    }))
}