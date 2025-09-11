import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db from '../config/database.js';

const router = express.Router();

// Registrar usuario
router.post('/register', async (req, res) => {
    try {
        const { registro_academico, nombres, apellidos, email, password } = req.body;

        if (!registro_academico || !nombres || !apellidos || !email || !password) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios' });
        }

        // Verificar si el usuario ya existe (usando async/await)
        const [existingUsers] = await db.execute(
            'SELECT * FROM usuarios WHERE registro_academico = ? OR email = ?',
            [registro_academico, email]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({ message: 'El registro académico o email ya están en uso' });
        }

        // Encriptar contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insertar nuevo usuario
        const [result] = await db.execute(
            'INSERT INTO usuarios (registro_academico, nombres, apellidos, email, password) VALUES (?, ?, ?, ?, ?)',
            [registro_academico, nombres, apellidos, email, hashedPassword]
        );

        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            userId: result.insertId
        });

    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Login usuario
router.post('/login', async (req, res) => {
    try {
        const { registro_academico, password } = req.body;

        if (!registro_academico || !password) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios' });
        }

        // Buscar usuario
        const [users] = await db.execute(
            'SELECT * FROM usuarios WHERE registro_academico = ?',
            [registro_academico]
        );

        if (users.length === 0) {
            return res.status(400).json({ message: 'Registro académico no encontrado' });
        }

        const user = users[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Contraseña incorrecta' });
        }

        // Crear token
        const token = jwt.sign(
            {
                userId: user.id,
                registro_academico: user.registro_academico,
                nombres: user.nombres,
                apellidos: user.apellidos,
                email: user.email
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            message: 'Login exitoso',
            token,
            user: {
                userId: user.id,
                registro_academico: user.registro_academico,
                nombres: user.nombres,
                apellidos: user.apellidos,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Recuperar contraseña
router.post('/forgot-password', async (req, res) => {
    try {
        const { registro_academico, email, new_password } = req.body;

        if (!registro_academico || !email || !new_password) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios' });
        }

        // Verificar registro y email
        const [users] = await db.execute(
            'SELECT * FROM usuarios WHERE registro_academico = ? AND email = ?',
            [registro_academico, email]
        );

        if (users.length === 0) {
            return res.status(400).json({ message: 'Los datos no coinciden' });
        }

        // Encriptar nueva contraseña
        const hashedPassword = await bcrypt.hash(new_password, 10);

        // Actualizar contraseña
        await db.execute(
            'UPDATE usuarios SET password = ? WHERE registro_academico = ? AND email = ?',
            [hashedPassword, registro_academico, email]
        );

        res.json({ message: 'Contraseña actualizada exitosamente' });

    } catch (error) {
        console.error('Error en forgot password:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

export default router;