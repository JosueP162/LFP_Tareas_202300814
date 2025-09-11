import express from 'express';
import db from '../config/database.js';

const router = express.Router();

// Obtener todos los catedráticos
router.get('/', async (req, res) => {
    try {
        const [catedraticos] = await db.execute(
            `SELECT c.*, 
                    COUNT(DISTINCT ic.curso_id) as total_cursos,
                    COUNT(DISTINCT p.id) as total_publicaciones
             FROM catedraticos c 
             LEFT JOIN imparticion_cursos ic ON c.id = ic.catedratico_id 
             LEFT JOIN publicaciones p ON c.id = p.catedratico_id
             GROUP BY c.id 
             ORDER BY c.apellidos, c.nombres`
        );

        // Formatear los datos
        const catedraticosFormateados = catedraticos.map(cat => ({
            ...cat,
            nombre_completo: `${cat.nombres} ${cat.apellidos}`
        }));

        res.json(catedraticosFormateados);

    } catch (error) {
        console.error('Error obteniendo catedráticos:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Obtener catedrático por ID con sus cursos y publicaciones
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Obtener información del catedrático
        const [catedraticos] = await db.execute(
            `SELECT c.*, 
                    COUNT(DISTINCT ic.curso_id) as total_cursos,
                    COUNT(DISTINCT p.id) as total_publicaciones
             FROM catedraticos c 
             LEFT JOIN imparticion_cursos ic ON c.id = ic.catedratico_id 
             LEFT JOIN publicaciones p ON c.id = p.catedratico_id
             WHERE c.id = ?
             GROUP BY c.id`,
            [id]
        );

        if (catedraticos.length === 0) {
            return res.status(404).json({ message: 'Catedrático no encontrado' });
        }

        const catedratico = catedraticos[0];

        // Obtener cursos del catedrático
        const [cursos] = await db.execute(
            `SELECT c.*, ic.anio, ic.semestre
             FROM cursos c 
             JOIN imparticion_cursos ic ON c.id = ic.curso_id
             WHERE ic.catedratico_id = ? 
             ORDER BY ic.anio DESC, ic.semestre DESC`,
            [id]
        );

        // Obtener publicaciones recientes sobre el catedrático
        const [publicaciones] = await db.execute(
            `SELECT p.*, u.nombres, u.apellidos
             FROM publicaciones p 
             JOIN usuarios u ON p.usuario_id = u.id 
             WHERE p.catedratico_id = ? 
             ORDER BY p.fecha_creacion DESC 
             LIMIT 10`,
            [id]
        );

        const catedraticoCompleto = {
            ...catedratico,
            nombre_completo: `${catedratico.nombres} ${catedratico.apellidos}`,
            cursos,
            publicaciones_recientes: publicaciones.map(pub => ({
                ...pub,
                usuario_nombre: `${pub.nombres} ${pub.apellidos}`
            }))
        };

        res.json(catedraticoCompleto);

    } catch (error) {
        console.error('Error obteniendo catedrático:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Buscar catedráticos por nombre
router.get('/buscar/:nombre', async (req, res) => {
    try {
        const { nombre } = req.params;
        const searchTerm = `%${nombre}%`;

        const [catedraticos] = await db.execute(
            `SELECT c.*, 
                    COUNT(DISTINCT ic.curso_id) as total_cursos,
                    COUNT(DISTINCT p.id) as total_publicaciones
             FROM catedraticos c 
             LEFT JOIN imparticion_cursos ic ON c.id = ic.catedratico_id 
             LEFT JOIN publicaciones p ON c.id = p.catedratico_id
             WHERE (c.nombres LIKE ? OR c.apellidos LIKE ? OR CONCAT(c.nombres, ' ', c.apellidos) LIKE ?)
             GROUP BY c.id 
             ORDER BY c.apellidos, c.nombres`,
            [searchTerm, searchTerm, searchTerm]
        );

        const catedraticosFormateados = catedraticos.map(cat => ({
            ...cat,
            nombre_completo: `${cat.nombres} ${cat.apellidos}`
        }));

        res.json(catedraticosFormateados);

    } catch (error) {
        console.error('Error buscando catedráticos:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Obtener top catedráticos más populares (con más publicaciones)
router.get('/top/populares', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        const [catedraticos] = await db.execute(
            `SELECT c.*, 
                    COUNT(DISTINCT ic.curso_id) as total_cursos,
                    COUNT(DISTINCT p.id) as total_publicaciones
             FROM catedraticos c 
             LEFT JOIN imparticion_cursos ic ON c.id = ic.catedratico_id 
             LEFT JOIN publicaciones p ON c.id = p.catedratico_id
             GROUP BY c.id 
             HAVING total_publicaciones >= 1
             ORDER BY total_publicaciones DESC, total_cursos DESC
             LIMIT ?`,
            [limit]
        );

        const catedraticosFormateados = catedraticos.map((cat, index) => ({
            ...cat,
            nombre_completo: `${cat.nombres} ${cat.apellidos}`,
            ranking_position: index + 1
        }));

        res.json(catedraticosFormateados);

    } catch (error) {
        console.error('Error obteniendo top catedráticos:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

export default router;