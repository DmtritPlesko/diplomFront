import { useState } from 'react'
import apiClient from '../api/client'
import './Analyzer.css'

const Analyzer = () => {
  const [text, setText] = useState('')
  const [result, setResult] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState('')

  const analyzeText = async () => {
    if (!text.trim()) {
      setError('Введите текст для анализа')
      return
    }

    setIsAnalyzing(true)
    setError('')
    setResult(null)

    try {
      const response = await apiClient.post('/analyze', { text })
      setResult(response.data)
    } catch (err) {
      // Fallback: если бэк недоступен, делаем локальный анализ
      console.warn('Backend unavailable, using local analyzer')
      setResult(performLocalAnalysis(text))
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Локальный анализатор (если бэк недоступен)
  const performLocalAnalysis = (inputText) => {
    const lowerText = inputText.toLowerCase()
    const patterns = [
      { word: 'ненависть', weight: 10 },
      { word: 'убить', weight: 10 },
      { word: 'смерть', weight: 8 },
      { word: 'насилие', weight: 9 },
      { word: 'уничтожить', weight: 8 },
      { word: 'война', weight: 7 },
      { word: 'агрессия', weight: 7 },
      { word: 'террор', weight: 10 },
      { word: 'экстремизм', weight: 10 },
      { word: 'фашизм', weight: 9 },
      { word: 'нацизм', weight: 9 },
      { word: 'расизм', weight: 8 },
      { word: 'ксенофобия', weight: 8 },
      { word: 'угроза', weight: 6 },
      { word: 'деструктивный', weight: 8 },
      { word: 'пропаганда', weight: 7 },
    ]

    let totalWeight = 0
    const foundWords = []

    patterns.forEach(p => {
      if (lowerText.includes(p.word)) {
        totalWeight += p.weight
        foundWords.push(p.word)
      }
    })

    const score = Math.min(Math.round((totalWeight / 100) * 100), 100)

    let level = 'Безопасно'
    let color = '#10b981'
    let recommendation = 'Текст не содержит деструктивных элементов'

    if (score > 70) {
      level = 'Критический'
      color = '#ef4444'
      recommendation = 'Текст содержит явные деструктивные элементы. Рекомендуется дополнительная проверка.'
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
      foundWords: foundWords.length > 0 ? foundWords : [],
      wordCount: inputText.split(/\s+/).filter(w => w.length > 0).length,
      charCount: inputText.length,
    }
  }

  const highlightText = (inputText, words) => {
    if (!words || words.length === 0) return inputText

    let highlighted = inputText
    const sorted = [...words].sort((a, b) => b.length - a.length)

    sorted.forEach(word => {
      const regex = new RegExp(`(${word})`, 'gi')
      highlighted = highlighted.replace(regex, '<mark class="danger-word">$1</mark>')
    })
    return highlighted
  }

  const clearAnalysis = () => {
    setText('')
    setResult(null)
    setError('')
  }

  const getHighlightedText = () => {
    if (!result || !result.foundWords) return text
    return highlightText(text, result.foundWords)
  }

  return (
    <div className="analyzer-page">
      {/* Hero Header */}
      <div className="analyzer-hero">
        <div className="hero-content">
          <div className="hero-badge">🛡️ Анализ безопасности</div>
          <h1>Анализатор деструктивного контента</h1>
          <p>
            Вставьте текст или сообщение — система выявит потенциально опасные
            элементы и оценит уровень риска
          </p>
        </div>
        <div className="hero-decoration">
          <div className="pulse-circle"></div>
          <div className="pulse-circle"></div>
          <div className="pulse-circle"></div>
        </div>
      </div>

      <div className="analyzer-container">
        {/* Input Section */}
        <section className="input-card">
          <div className="card-header">
            <div className="card-title">
              <span className="title-icon">📝</span>
              <h2>Текст для анализа</h2>
            </div>
            <div className="card-meta">
              <span>{text.length} символов</span>
              <span>{text.split(/\s+/).filter(w => w.length > 0).length} слов</span>
            </div>
          </div>

          <textarea
            className="analyzer-textarea"
            value={text}
            onChange={(e) => {
              setText(e.target.value)
              setError('')
            }}
            placeholder="Вставьте текст, сообщение или фрагмент переписки для проверки..."
            rows={10}
            disabled={isAnalyzing}
          />

          {error && (
            <div className="error-banner">
              <span>⚠️</span> {error}
            </div>
          )}

          <div className="actions">
            <button
              className="btn-primary"
              onClick={analyzeText}
              disabled={isAnalyzing || !text.trim()}
            >
              {isAnalyzing ? (
                <>
                  <span className="spinner"></span>
                  Анализируем...
                </>
              ) : (
                <>
                  <span>🔍</span> Провести анализ
                </>
              )}
            </button>
            <button
              className="btn-secondary"
              onClick={clearAnalysis}
              disabled={isAnalyzing || (!text && !result)}
            >
              🗑️ Очистить
            </button>
          </div>
        </section>

        {/* Result Section */}
        {result && (
          <section className="result-container">
            {/* Score Card */}
            <div className="score-card" style={{ '--accent-color': result.color }}>
              <div className="score-visual">
                <svg className="score-ring" viewBox="0 0 200 200">
                  <circle
                    cx="100"
                    cy="100"
                    r="85"
                    className="ring-bg"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="85"
                    className="ring-progress"
                    style={{
                      strokeDasharray: `${2 * Math.PI * 85}`,
                      strokeDashoffset: `${2 * Math.PI * 85 * (1 - result.score / 100)}`,
                      stroke: result.color,
                    }}
                  />
                </svg>
                <div className="score-center">
                  <div className="score-value" style={{ color: result.color }}>
                    {result.score}%
                  </div>
                  <div className="score-caption">уровень риска</div>
                </div>
              </div>

              <div className="score-info">
                <div className="risk-level" style={{ backgroundColor: result.color }}>
                  {result.level}
                </div>
                <h3>Результат анализа</h3>
                <p>{result.recommendation}</p>

                <div className="stats-grid">
                  <div className="stat">
                    <div className="stat-value">{result.wordCount}</div>
                    <div className="stat-label">слов</div>
                  </div>
                  <div className="stat">
                    <div className="stat-value">{result.charCount}</div>
                    <div className="stat-label">символов</div>
                  </div>
                  <div className="stat">
                    <div className="stat-value">{result.foundWords?.length || 0}</div>
                    <div className="stat-label">найдено</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="progress-card">
              <div className="progress-header">
                <span>Шкала риска</span>
                <span style={{ color: result.color, fontWeight: 700 }}>{result.score}%</span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-thumb"
                  style={{
                    width: `${result.score}%`,
                    background: `linear-gradient(90deg, #10b981, ${result.color})`,
                  }}
                />
              </div>
              <div className="progress-legend">
                <span>✅ Безопасно</span>
                <span>⚠️ Средне</span>
                <span>🚨 Критично</span>
              </div>
            </div>

            {/* Found Words */}
            {result.foundWords?.length > 0 && (
              <div className="found-card">
                <h3>
                  <span>🔍</span> Найденные деструктивные элементы
                </h3>
                <div className="found-words">
                  {result.foundWords.map((word, i) => (
                    <span key={i} className="word-chip">
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Highlighted Text */}
            {text && result.foundWords?.length > 0 && (
              <div className="highlight-card">
                <h3>
                  <span>📌</span> Текст с подсветкой
                </h3>
                <div
                  className="highlighted-content"
                  dangerouslySetInnerHTML={{ __html: getHighlightedText() }}
                />
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  )
}

export default Analyzer