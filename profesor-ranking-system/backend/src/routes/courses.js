import express from 'express';
import db from '../config/database.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Obtener todos los cursos
router.get('/', async (req, res) => {
    try {
        const { area, page = "1", limit = "20" } = req.query;

        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(Math.max(1, parseInt(limit) || 20), 100);
        const offset = (pageNum - 1) * limitNum;

        let baseQuery = `
            SELECT c.*, 
                   COUNT(DISTINCT ic.catedratico_id) as total_catedraticos,
                   COUNT(DISTINCT ca.usuario_id) as estudiantes_aprobados
            FROM cursos c 
            LEFT JOIN imparticion_cursos ic ON c.id = ic.curso_id 
            LEFT JOIN cursos_aprobados ca ON c.id = ca.curso_id`;

        let params = [];

        if (area && area.trim() !== '') {
            baseQuery += ` WHERE c.area = ?`;
            params.push(area.trim());
        }

        baseQuery += ` GROUP BY c.id ORDER BY c.codigo_curso LIMIT ${limitNum} OFFSET ${offset}`;

        console.log('Courses Query:', baseQuery);
        console.log('Courses Params:', params);

        const [cursos] = await db.execute(baseQuery, params);

        // Query para contar total
        let countQuery = `SELECT COUNT(*) as total FROM cursos c`;
        if (area && area.trim() !== '') {
            countQuery += ` WHERE c.area = ?`;
        }

        const [countResult] = await db.execute(countQuery, params);
        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limitNum);

        res.json({
            cursos,
            pagination: {
                current_page: pageNum,
                total_pages: totalPages,
                total_items: total,
                items_per_page: limitNum
            }
        });

    } catch (error) {
        console.error('Error obteniendo cursos:', error);
        res.status(500).json({ 
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Obtener curso por ID con detalles
router.get('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        
        if (isNaN(id)) {
            return res.status(400).json({ message: 'ID de curso inválido' });
        }

        // Información básica del curso
        const [cursos] = await db.execute(
            `SELECT c.*, 
                    COUNT(DISTINCT ic.catedratico_id) as total_catedraticos,
                    COUNT(DISTINCT ca.usuario_id) as estudiantes_aprobados
             FROM cursos c 
             LEFT JOIN imparticion_cursos ic ON c.id = ic.curso_id 
             LEFT JOIN cursos_aprobados ca ON c.id = ca.curso_id
             WHERE c.id = ?
             GROUP BY c.id`,
            [id]
        );

        if (cursos.length === 0) {
            return res.status(404).json({ message: 'Curso no encontrado' });
        }

        const curso = cursos[0];

        // Catedráticos que han impartido este curso
        const [catedraticos] = await db.execute(
            `SELECT cat.*, ic.anio, ic.semestre
             FROM catedraticos cat 
             JOIN imparticion_cursos ic ON cat.id = ic.catedratico_id
             WHERE ic.curso_id = ? 
             ORDER BY ic.anio DESC, ic.semestre DESC`,
            [id]
        );

        // Publicaciones recientes sobre este curso
        const [publicaciones] = await db.execute(
            `SELECT p.*, u.nombres, u.apellidos
             FROM publicaciones p 
             JOIN usuarios u ON p.usuario_id = u.id 
             WHERE p.curso_id = ? 
             ORDER BY p.fecha_creacion DESC 
             LIMIT 10`,
            [id]
        );

        const cursoCompleto = {
            ...curso,
            catedraticos,
            publicaciones_recientes: publicaciones.map(pub => ({
                ...pub,
                usuario_nombre: `${pub.nombres} ${pub.apellidos}`
            }))
        };

        res.json(cursoCompleto);

    } catch (error) {
        console.error('Error obteniendo curso:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Buscar cursos por nombre o código
router.get('/buscar/:termino', async (req, res) => {
    try {
        const { termino } = req.params;
        const searchTerm = `%${termino}%`;

        const [cursos] = await db.execute(
            `SELECT c.*, 
                    COUNT(DISTINCT ic.catedratico_id) as total_catedraticos
             FROM cursos c 
             LEFT JOIN imparticion_cursos ic ON c.id = ic.curso_id 
             WHERE (c.codigo_curso LIKE ? OR c.nombre_curso LIKE ?)
             GROUP BY c.id 
             ORDER BY c.codigo_curso
             LIMIT 50`,
            [searchTerm, searchTerm]
        );

        res.json(cursos);

    } catch (error) {
        console.error('Error buscando cursos:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Obtener áreas disponibles
router.get('/meta/areas', async (req, res) => {
    try {
        const [areas] = await db.execute(
            `SELECT DISTINCT area, COUNT(*) as total_cursos 
             FROM cursos 
             GROUP BY area 
             ORDER BY area`
        );

        res.json(areas);

    } catch (error) {
        console.error('Error obteniendo áreas:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Agregar curso aprobado para el usuario actual
router.post('/aprobar/:cursoId', authMiddleware, async (req, res) => {
    try {
        const cursoId = parseInt(req.params.cursoId);
        const { anio_aprobacion, semestre_aprobacion } = req.body;

        if (isNaN(cursoId)) {
            return res.status(400).json({ message: 'ID de curso inválido' });
        }

        if (!anio_aprobacion || !semestre_aprobacion) {
            return res.status(400).json({ message: 'Año y semestre de aprobación son obligatorios' });
        }

        // Verificar que el curso existe
        const [cursos] = await db.execute('SELECT id FROM cursos WHERE id = ?', [cursoId]);
        if (cursos.length === 0) {
            return res.status(404).json({ message: 'Curso no encontrado' });
        }

        // Verificar si ya está aprobado
        const [existente] = await db.execute(
            'SELECT id FROM cursos_aprobados WHERE usuario_id = ? AND curso_id = ?',
            [parseInt(req.user.userId), cursoId]
        );

        if (existente.length > 0) {
            return res.status(409).json({ message: 'El curso ya está marcado como aprobado' });
        }

        // Agregar curso aprobado
        await db.execute(
            'INSERT INTO cursos_aprobados (usuario_id, curso_id, anio_aprobacion, semestre_aprobacion) VALUES (?, ?, ?, ?)',
            [parseInt(req.user.userId), cursoId, parseInt(anio_aprobacion), parseInt(semestre_aprobacion)]
        );

        res.status(201).json({ message: 'Curso agregado como aprobado exitosamente' });

    } catch (error) {
        console.error('Error agregando curso aprobado:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

export default router;