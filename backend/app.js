require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { sequelize, Task, User } = require('./models');

const app = express();
// justo después de app = express() y app.use(express.json()):
const cors = require('cors');
app.use(cors());       // ⚠️ PERMITE TODO ORIGIN, TODO MÉTODO, TODO HEADER
app.options('*', cors());



// 3) Middleware de autenticación
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token      = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// 4) Endpoints de tareas
app.get('/tasks', authenticateToken, async (req, res) => {
  try {
    const where = req.user.role === 'admin' 
      ? {} 
      : { userId: req.user.id };
    const includeUser = req.user.role === 'admin';
    const tasks = await Task.findAll({
      where,
      include: includeUser
        ? [{ model: User, attributes: ['id','username','email'] }]
        : []
    });
    res.json(tasks);
  } catch {
    res.status(500).json({ error: 'Error al obtener las tareas.' });
  }
});

app.post('/tasks', authenticateToken, async (req, res) => {
  try {
    const { title, description, status, dueDate } = req.body;
    const task = await Task.create({
      title, description, status,
      userId: req.user.id,
      dueDate
    });
    res.json(task);
  } catch {
    res.status(500).json({ error: 'Error al crear la tarea.' });
  }
});

app.put('/tasks/:id', authenticateToken, async (req, res) => {
  try {
    const { title, description, status, dueDate } = req.body;
    const filter = req.user.role === 'admin'
      ? { id: req.params.id }
      : { id: req.params.id, userId: req.user.id };
    const task = await Task.findOne({ where: filter });
    if (!task) return res.status(404).json({ error: 'Tarea no encontrada.' });

    await task.update({
      title, description, status,
      dueDate: dueDate !== undefined ? dueDate : task.dueDate
    });
    res.json(task);
  } catch {
    res.status(500).json({ error: 'Error al actualizar la tarea.' });
  }
});

app.delete('/tasks/:id', authenticateToken, async (req, res) => {
  try {
    const filter = req.user.role === 'admin'
      ? { id: req.params.id }
      : { id: req.params.id, userId: req.user.id };
    const task = await Task.findOne({ where: filter });
    if (!task) return res.status(404).json({ error: 'Tarea no encontrada.' });

    await task.destroy();
    res.json({ message: 'Tarea eliminada.' });
  } catch {
    res.status(500).json({ error: 'Error al eliminar la tarea.' });
  }
});

// 5) Endpoints de usuario
app.post('/register', async (req, res) => {
  try {
    const { username, email, password, secretCode } = req.body;
    if (await User.findOne({ where: { email } })) {
      return res.status(400).json({ error: 'El usuario ya existe.' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const role = secretCode?.trim().toUpperCase() === 'ADMIN1234'
      ? 'admin'
      : 'user';
    const user = await User.create({ username, email, password: hashed, role });
    res.json({ message: 'Usuario creado.', user: { id: user.id, role: user.role } });
  } catch {
    res.status(500).json({ error: 'Error al registrar el usuario.' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ error: 'Usuario no encontrado.' });
    if (!await bcrypt.compare(password, user.password)) {
      return res.status(400).json({ error: 'Contraseña incorrecta.' });
    }
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '1h' }
    );
    res.json({ token });
  } catch {
    res.status(500).json({ error: 'Error en el login.' });
  }
});

app.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    res.json(user);
  } catch {
    res.status(500).json({ error: 'Error al obtener el perfil.' });
  }
});

// 6) Arranque del servidor
const PORT = process.env.PORT || 3000;
sequelize.authenticate()
  .then(() => {
    console.log('Conexión establecida.');
    app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
  })
  .catch(err => {
    console.error('No se pudo conectar a la BD:', err);
    process.exit(1);
  });
