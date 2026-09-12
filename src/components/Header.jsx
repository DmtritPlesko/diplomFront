import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Header.css'

const Header = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="header-nav">
      <Link to="/" className="logo">
        🔍 DestructAnalyzer
      </Link>

      <nav className="nav-links">
        <Link to="/">Главная</Link>
        {user && <Link to="/analyzer">Анализатор</Link>}

        {user ? (
          <div className="user-menu">
            <span className="user-name">👤 {user.name || user.email}</span>
            <button onClick={handleLogout} className="logout-btn">
              Выйти
            </button>
          </div>
        ) : (
          <div className="auth-buttons">
            <Link to="/login" className="login-btn">Войти</Link>
            <Link to="/register" className="register-btn">Регистрация</Link>
          </div>
        )}
      </nav>
    </header>
  )
}

export default Header