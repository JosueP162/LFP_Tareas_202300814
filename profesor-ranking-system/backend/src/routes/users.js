import express from 'express';
import db from '../config/database.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// 1. Buscar usuario por registro académico
router.get('/buscar/:registro', authMiddleware, async (req, res) => {
    try {
        const { registro } = req.params;

        console.log('Buscando registro:', registro);

        const [users] = await db.execute(
            'SELECT id, registro_academico, nombres, apellidos, email, fecha_creacion FROM usuarios WHERE registro_academico = ?',
            [registro]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const usuario = users[0];

        // Obtener cursos aprobados
        const [cursosAprobados] = await db.execute(
            `SELECT c.codigo_curso, c.nombre_curso, c.creditos, 
                    ca.anio_aprobacion, ca.semestre_aprobacion, ca.fecha_registro
             FROM cursos_aprobados ca 
             JOIN cursos c ON ca.curso_id = c.id 
             WHERE ca.usuario_id = ?
             ORDER BY ca.anio_aprobacion DESC, ca.semestre_aprobacion DESC`,
            [usuario.id]
        );

        const totalCreditos = cursosAprobados.reduce((total, curso) => total + curso.creditos, 0);

        res.json({
            ...usuario,
            cursosAprobados,
            totalCreditos,
            totalCursosAprobados: cursosAprobados.length
        });

    } catch (error) {
        console.error('Error en búsqueda de usuario:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// 2. Obtener perfil del usuario actual
router.get('/perfil', authMiddleware, async (req, res) => {
    try {
        console.log('Usuario actual:', req.user);

        const [users] = await db.execute(
            'SELECT id, registro_academico, nombres, apellidos, email, fecha_creacion FROM usuarios WHERE id = ?',
            [parseInt(req.user.userId)]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const usuario = users[0];

        // Cursos aprobados
        const [cursosAprobados] = await db.execute(
            `SELECT c.id, c.codigo_curso, c.nombre_curso, c.creditos, 
                    ca.anio_aprobacion, ca.semestre_aprobacion, ca.fecha_registro
             FROM cursos_aprobados ca 
             JOIN cursos c ON ca.curso_id = c.id 
             WHERE ca.usuario_id = ?
             ORDER BY ca.anio_aprobacion DESC, ca.semestre_aprobacion DESC`,
            [usuario.id]
        );

        // Publicaciones del usuario
        const [publicaciones] = await db.execute(
            `SELECT p.*, c.nombre_curso, c.codigo_curso,
                    cat.nombres as catedratico_nombres, cat.apellidos as catedratico_apellidos
             FROM publicaciones p
             LEFT JOIN cursos c ON p.curso_id = c.id
             LEFT JOIN catedraticos cat ON p.catedratico_id = cat.id
             WHERE p.usuario_id = ?
             ORDER BY p.fecha_creacion DESC
             LIMIT 10`,
            [usuario.id]
        );

        const totalCreditos = cursosAprobados.reduce((total, curso) => total + curso.creditos, 0);

        res.json({
            ...usuario,
            cursosAprobados,
            totalCreditos,
            totalCursosAprobados: cursosAprobados.length,
            publicaciones: publicaciones.map(pub => ({
                ...pub,
                objetivo: pub.curso_id ? 
                    `${pub.codigo_curso} - ${pub.nombre_curso}` : 
                    pub.catedratico_nombres ? `${pub.catedratico_nombres} ${pub.catedratico_apellidos}` : 'Sin objetivo'
            })),
            totalPublicaciones: publicaciones.length
        });

    } catch (error) {
        console.error('Error obteniendo perfil:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// 3. Actualizar perfil del usuario
router.put('/perfil', authMiddleware, async (req, res) => {
    try {
        const { nombres, apellidos, email } = req.body;

        if (!nombres || !apellidos || !email) {
            return res.status(400).json({ message: 'Nombres, apellidos y email son obligatorios' });
        }

        // Verificar email único
        const [existingUsers] = await db.execute(
            'SELECT id FROM usuarios WHERE email = ? AND id != ?',
            [email, parseInt(req.user.userId)]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({ message: 'El email ya está en uso por otro usuario' });
        }

        // Actualizar datos
        await db.execute(
            'UPDATE usuarios SET nombres = ?, apellidos = ?, email = ? WHERE id = ?',
            [nombres, apellidos, email, parseInt(req.user.userId)]
        );

        res.json({ message: 'Perfil actualizado exitosamente' });

    } catch (error) {
        console.error('Error actualizando perfil:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// 4. Agregar curso aprobado
router.post('/cursos-aprobados', authMiddleware, async (req, res) => {
    try {
        const { curso_id, anio_aprobacion, semestre_aprobacion } = req.body;

        if (!curso_id || !anio_aprobacion || !semestre_aprobacion) {
            return res.status(400).json({ message: 'Curso ID, año y semestre son obligatorios' });
        }

        // Verificar que el curso existe
        const [cursos] = await db.execute('SELECT id FROM cursos WHERE id = ?', [parseInt(curso_id)]);
        if (cursos.length === 0) {
            return res.status(404).json({ message: 'Curso no encontrado' });
        }

        // Verificar duplicado
        const [existente] = await db.execute(
            'SELECT id FROM cursos_aprobados WHERE usuario_id = ? AND curso_id = ?',
            [parseInt(req.user.userId), parseInt(curso_id)]
        );

        if (existente.length > 0) {
            return res.status(409).json({ message: 'El curso ya está marcado como aprobado' });
        }

        // Agregar curso
        await db.execute(
            'INSERT INTO cursos_aprobados (usuario_id, curso_id, anio_aprobacion, semestre_aprobacion) VALUES (?, ?, ?, ?)',
            [parseInt(req.user.userId), parseInt(curso_id), parseInt(anio_aprobacion), parseInt(semestre_aprobacion)]
        );

        res.status(201).json({ message: 'Curso agregado como aprobado exitosamente' });

    } catch (error) {
        console.error('Error agregando curso aprobado:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// 5. Eliminar curso aprobado
router.delete('/cursos-aprobados/:cursoId', authMiddleware, async (req, res) => {
    try {
        const cursoId = parseInt(req.params.cursoId);

        if (isNaN(cursoId)) {
            return res.status(400).json({ message: 'ID de curso inválido' });
        }

        const [result] = await db.execute(
            'DELETE FROM cursos_aprobados WHERE usuario_id = ? AND curso_id = ?',
            [parseInt(req.user.userId), cursoId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Curso aprobado no encontrado' });
        }

        res.json({ message: 'Curso eliminado de aprobados exitosamente' });

    } catch (error) {
        console.error('Error eliminando curso aprobado:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// 6. Obtener estadísticas del usuario
router.get('/estadisticas', authMiddleware, async (req, res) => {
    try {
        const userId = parseInt(req.user.userId);

        // Cursos aprobados por área
        const [cursosPorArea] = await db.execute(
            `SELECT c.area, COUNT(*) as total, SUM(c.creditos) as creditos
             FROM cursos_aprobados ca
             JOIN cursos c ON ca.curso_id = c.id
             WHERE ca.usuario_id = ?
             GROUP BY c.area
             ORDER BY total DESC`,
            [userId]
        );

        // Publicaciones por tipo
        const [publicacionesPorTipo] = await db.execute(
            `SELECT tipo_publicacion, COUNT(*) as total
             FROM publicaciones
             WHERE usuario_id = ?
             GROUP BY tipo_publicacion`,
            [userId]
        );

        // Progreso por año
        const [progresoPorAnio] = await db.execute(
            `SELECT anio_aprobacion, COUNT(*) as cursos_aprobados, SUM(c.creditos) as creditos
             FROM cursos_aprobados ca
             JOIN cursos c ON ca.curso_id = c.id
             WHERE ca.usuario_id = ?
             GROUP BY anio_aprobacion
             ORDER BY anio_aprobacion`,
            [userId]
        );

        res.json({
            cursos_por_area: cursosPorArea,
            publicaciones_por_tipo: publicacionesPorTipo,
            progreso_por_anio: progresoPorAnio
        });

    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

export default router;