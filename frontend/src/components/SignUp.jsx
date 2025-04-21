// src/components/SignUp.jsx
import React, { useState } from 'react';

import './Styles/SignUp.css';  // Asegúrate de que la ruta sea la correcta

function SignUp({ onAuthSuccess }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secretCode, setSecretCode] = useState(''); // Campo para el código
  const [message, setMessage] = useState('');

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, secretCode })
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(`Usuario registrado correctamente. Rol: ${data.user.role}`);
        onAuthSuccess && onAuthSuccess();
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      console.error("Error al registrar:", error);
      setMessage('Error interno al registrar.');
    }
  };

  return (
    <div className="signup-container">
      <h2>Registro</h2>
      <form onSubmit={handleSignUp} className="signup-form">
        <input
          type="text"
          placeholder="Nombre de usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Código de administrador (opcional)"
          value={secretCode}
          onChange={(e) => setSecretCode(e.target.value)}
        />
        <button type="submit">Registrarse</button>
      </form>
      {message && <p className="signup-message">{message}</p>}
    </div>
  );
}

export default SignUp;
