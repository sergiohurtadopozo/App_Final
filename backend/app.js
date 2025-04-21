require('dotenv').config();
const express = require('express');
const cors = require('cors');   
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const { sequelize, Task, User } = require('./models');

const app = express();
app.use(express.json());
app.use(cors({
  origin: process.env.CORS_ORIGIN      // solo permite peticiones desde tu front
}));

/**
 * Middleware para verificar el token JWT.
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}


/* ----------- Endpoints para la gestión de Tareas ----------- */

app.get('/tasks', authenticateToken, async (req, res) => {
  try {
    let tasks;
    if (req.user.role === 'admin') {
      tasks = await Task.findAll({
        include: [{
          model: User,
          attributes: ['id', 'username', 'email']
        }]
      });
    } else {
      tasks = await Task.findAll({ where: { userId: req.user.id } });
    }
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las tareas.' });
  }
});

app.post('/tasks', authenticateToken, async (req, res) => {
  try {
    const { title, description, status, dueDate } = req.body;
    const newTask = await Task.create({
      title,
      description,
      status,
      userId: req.user.id,
      dueDate
    });
    res.json(newTask);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la tarea.' });
  }
});

app.put('/tasks/:id', authenticateToken, async (req, res) => {
  try {
    const { title, description, status, dueDate } = req.body;
    const id = req.params.id;
    let task;

    if (req.user.role === 'admin') {
      task = await Task.findByPk(id);
    } else {
      task = await Task.findOne({ where: { id, userId: req.user.id } });
    }

    if (!task) {
      return res.status(404).json({ error: 'Tarea no encontrada o no autorizada.' });
    }

    await task.update({
      title:       title       || task.title,
      description: description || task.description,
      status:      status      || task.status,
      dueDate:     dueDate !== undefined ? dueDate : task.dueDate
    });

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la tarea.' });
  }
});

app.delete('/tasks/:id', authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    let task;

    if (req.user.role === 'admin') {
      task = await Task.findByPk(id);
    } else {
      task = await Task.findOne({ where: { id, userId: req.user.id } });
    }

    if (!task) {
      return res.status(404).json({ error: 'Tarea no encontrada o no autorizada.' });
    }

    await task.destroy();
    res.json({ message: 'Tarea eliminada.' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la tarea.' });
  }
});


/* ----------- Endpoints para Autenticación y Gestión de Usuarios ----------- */

app.post('/register', async (req, res) => {
  const { username, email, password, secretCode } = req.body;
  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'El usuario ya existe.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const role = secretCode?.trim().toUpperCase() === 'ADMIN1234' ? 'admin' : 'user';

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role
    });

    res.json({
      message: 'Usuario creado correctamente.',
      user: { id: newUser.id, role: newUser.role }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error al registrar el usuario.' });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'Usuario no encontrado.' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Contraseña incorrecta.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error en el login.' });
  }
});

app.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el perfil.' });
  }
});


/* ----------- Static & SPA fallback ----------- */

// Sirve estáticos
app.use(express.static(path.join(__dirname, 'frontend', 'build')));

// Catch‑all con regex, no pasa por path‑to‑regexp para parámetros
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'build', 'index.html'));
});



/* ----------- Arranque del Servidor ----------- */

const PORT = process.env.PORT || 3000;

// Opcional: verificar conexión antes de arrancar
sequelize.authenticate()
  .then(() => {
    console.log('Conexión a la base de datos establecida.');
    app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
  })
  .catch(err => {
    console.error('No se pudo conectar a la base de datos:', err);
    process.exit(1);
  });
