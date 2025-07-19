 import React, { useState } from 'react';
import axios from 'axios';

const RegisterClient = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const { name, email, password } = formData;

  // Обработчик изменений в полях формы
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Обработчик отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Отправляем POST запрос на сервер GoTaxi-Admin для регистрации
      const response = await axios.post('http://localhost:3001/api/auth/register', {
        name,
        email,
        password,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log('Client registered successfully:', response.data);

      // Здесь можно добавить логику перенаправления или отображения успешного сообщения
    } catch (error) {
      console.error('Error registering client:', error.response.data);
    }
  };

  return (
    <div>
      <h1>Register Client</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default RegisterClient;
