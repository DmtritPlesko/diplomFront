import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Home.css'

const Home = () => {
  const { user } = useAuth()

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <h1>🔍 Анализатор деструктивной информации</h1>
          <p className="hero-subtitle">
            Проверяйте сообщения и тексты на наличие деструктивного контента.
            Быстро, точно, безопасно.
          </p>

          {user ? (
            <Link to="/analyzer" className="cta-btn">
              🚀 Перейти к анализатору
            </Link>
          ) : (
            <div className="hero-buttons">
              <Link to="/register" className="cta-btn">
                Начать бесплатно
              </Link>
              <Link to="/login" className="cta-btn-secondary">
                У меня есть аккаунт
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="features-section">
        <h2>Возможности</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Быстрый анализ</h3>
            <p>Результат за секунды. Просто вставьте текст и нажмите кнопку.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Точность</h3>
            <p>Алгоритм находит деструктивные слова и оценивает уровень опасности.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Наглядность</h3>
            <p>Процент деструктивности, подсветка опасных слов и рекомендации.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📄</div>
            <h3>Экспорт в PDF</h3>
            <p>Сохраняйте отчёты об анализе в удобном формате.</p>
          </div>
        </div>
      </section>

      <section className="how-section">
        <h2>Как это работает</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Зарегистрируйтесь</h3>
            <p>Создайте аккаунт за 30 секунд</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Вставьте текст</h3>
            <p>Скопируйте сообщение или текст</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Получите результат</h3>
            <p>Узнайте процент деструктивности</p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <p>© 2024 DestructAnalyzer. Дипломный проект.</p>
      </footer>
    </div>
  )
}

export default Home