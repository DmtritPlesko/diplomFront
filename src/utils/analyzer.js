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

// Проверяем границы слова с учётом юникода (кириллица, латиница)
const buildRegex = (word) =>
  new RegExp(`(?<![\\p{L}\\p{N}])${escapeRegex(word)}(?![\\p{L}\\p{N}])`, 'giu')

// === Основной локальный анализ ===
export function performLocalAnalysis(inputText) {
  const lower = inputText.toLowerCase()
  const found = new Map() // word -> pattern meta

  for (const pattern of PATTERNS) {
    try {
      const re = buildRegex(pattern.word)
      if (re.test(lower)) {
        found.set(pattern.word, pattern)
      }
    } catch {
      // fallback если regex не собрался (маловероятно)
      if (lower.includes(pattern.word)) {
        found.set(pattern.word, pattern)
      }
    }
  }

  const totalWeight = [...found.values()].reduce((sum, p) => sum + p.weight, 0)

  // Нормализация: 100 = примерно 10-12 совпадений тяжёлых слов
  const score = Math.min(Math.round(totalWeight * 1.2), 100)

  // Уникальные категории
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

  // Уровень риска
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

// === Безопасная подсветка: возвращает массив токенов ===
// [{ text: "..." , isDanger: true, color: "#ef4444" }, ...]
export function tokenizeWithHighlights(inputText, foundWords) {
  if (!foundWords || foundWords.length === 0) {
    return [{ text: inputText, isDanger: false }]
  }

  // Строим один большой regex из всех найденных слов (сортировка по длине!)
  const sorted = [...foundWords].sort((a, b) => b.length - a.length)
  const pattern = sorted.map(escapeRegex).join('|')
  const regex = new RegExp(`(${pattern})`, 'giu')

  const parts = inputText.split(regex)
  const dangerSet = new Set(sorted.map((w) => w.toLowerCase()))

  return parts
    .filter((p) => p !== '')
    .map((part) => {
      const isDanger = dangerSet.has(part.toLowerCase())
      return { text: part, isDanger }
    })
}