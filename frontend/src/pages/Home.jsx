import React from 'react'
import LoginPage from '../components/forms/LoginPage'

const Home = () => {
  const handleLogin = (userData) => {
    console.log('Logged in:', userData)
  }

  return <LoginPage onLogin={handleLogin} />
}

export default Home