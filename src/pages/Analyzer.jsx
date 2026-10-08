import { useState } from 'react'
import apiClient from '../api/client'
import { performLocalAnalysis, tokenizeWithHighlights } from '../utils/analyzer'
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

  const clearAnalysis = () => {
    setText('')
    setResult(null)
    setError('')
  }

  // Безопасный рендер подсвеченного текста через массив токенов
  const renderHighlightedText = () => {
    if (!result?.foundWords?.length) return text
    const tokens = tokenizeWithHighlights(text, result.foundWords)
    return tokens.map((token, i) =>
      token.isDanger ? (
        <mark key={i} className="danger-word">
          {token.text}
        </mark>
      ) : (
        <span key={i}>{token.text}</span>
      )
    )
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
              <span>
                {text.split(/\s+/).filter((w) => w.length > 0).length} слов
              </span>
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
            <div
              className="score-card"
              style={{ '--accent-color': result.color }}
            >
              <div className="score-visual">
                <svg className="score-ring" viewBox="0 0 200 200">
                  <circle cx="100" cy="100" r="85" className="ring-bg" />
                  <circle
                    cx="100"
                    cy="100"
                    r="85"
                    className="ring-progress"
                    style={{
                      strokeDasharray: `${2 * Math.PI * 85}`,
                      strokeDashoffset: `${
                        2 * Math.PI * 85 * (1 - result.score / 100)
                      }`,
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
                <div
                  className="risk-level"
                  style={{ backgroundColor: result.color }}
                >
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
                    <div className="stat-value">
                      {result.foundWords?.length || 0}
                    </div>
                    <div className="stat-label">найдено</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="progress-card">
              <div className="progress-header">
                <span>Шкала риска</span>
                <span style={{ color: result.color, fontWeight: 700 }}>
                  {result.score}%
                </span>
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

            {/* Categories */}
            {result.categories?.length > 0 && (
              <div className="found-card">
                <h3>
                  <span>📊</span> Категории угроз
                </h3>
                <div className="found-words">
                  {result.categories.map((cat) => (
                    <span
                      key={cat.key}
                      className="word-chip"
                      style={{
                        background: `${cat.color}22`,
                        color: cat.color,
                        borderColor: `${cat.color}55`,
                      }}
                    >
                      {cat.label} · {cat.count}
                    </span>
                  ))}
                </div>
              </div>
            )}

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
                <div className="highlighted-content">
                  {renderHighlightedText()}
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  )
}

export default Analyzer