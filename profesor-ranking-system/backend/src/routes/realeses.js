import express from 'express';
import db from '../config/database.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Obtener todas las publicaciones - Compatible con MySQL 8.0+
router.get('/', async (req, res) => {
    try {
        const { 
            curso_id, 
            catedratico_id, 
            page = "1", 
            limit = "10" 
        } = req.query;

        // Validación estricta para MySQL 8.0+
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(Math.max(1, parseInt(limit) || 10), 100); // Límite máximo de 100
        const offset = (pageNum - 1) * limitNum;

        console.log('Pagination params:', { pageNum, limitNum, offset });

        // Construir query dinámicamente SIN usar parámetros preparados para LIMIT/OFFSET
        let baseQuery = `
            SELECT p.id, p.mensaje, p.tipo_publicacion, p.fecha_creacion,
                   u.nombres as autor_nombres, 
                   u.apellidos as autor_apellidos,
                   u.registro_academico as autor_registro,
                   c.nombre_curso, 
                   c.codigo_curso,
                   cat.nombres as catedratico_nombres,
                   cat.apellidos as catedratico_apellidos
            FROM publicaciones p 
            JOIN usuarios u ON p.usuario_id = u.id 
            LEFT JOIN cursos c ON p.curso_id = c.id
            LEFT JOIN catedraticos cat ON p.catedratico_id = cat.id`;

        let whereConditions = [];
        let params = [];

        // Agregar filtros
        if (curso_id && !isNaN(parseInt(curso_id))) {
            whereConditions.push('p.curso_id = ?');
            params.push(parseInt(curso_id));
        }

        if (catedratico_id && !isNaN(parseInt(catedratico_id))) {
            whereConditions.push('p.catedratico_id = ?');
            params.push(parseInt(catedratico_id));
        }

        // Construir WHERE clause
        if (whereConditions.length > 0) {
            baseQuery += ' WHERE ' + whereConditions.join(' AND ');
        }

        // SOLUCION: Concatenar LIMIT/OFFSET directamente (no como parámetros)
        baseQuery += ` ORDER BY p.fecha_creacion DESC LIMIT ${limitNum} OFFSET ${offset}`;

        console.log('Final query:', baseQuery);
        console.log('Params:', params);

        // Ejecutar query principal
        const [publicaciones] = await db.execute(baseQuery, params);

        // Query para contar total
        let countQuery = `
            SELECT COUNT(*) as total 
            FROM publicaciones p 
            JOIN usuarios u ON p.usuario_id = u.id 
            LEFT JOIN cursos c ON p.curso_id = c.id
            LEFT JOIN catedraticos cat ON p.catedratico_id = cat.id`;

        if (whereConditions.length > 0) {
            countQuery += ' WHERE ' + whereConditions.join(' AND ');
        }

        const [countResult] = await db.execute(countQuery, params);
        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limitNum);

        // Formatear resultados
        const publicacionesFormateadas = publicaciones.map(pub => ({
            ...pub,
            autor_nombre: `${pub.autor_nombres} ${pub.autor_apellidos}`,
            catedratico_nombre: pub.catedratico_nombres ? 
                `${pub.catedratico_nombres} ${pub.catedratico_apellidos}` : null,
            objetivo: pub.curso_id ? 
                `${pub.codigo_curso} - ${pub.nombre_curso}` : 
                pub.catedratico_nombres ? `${pub.catedratico_nombres} ${pub.catedratico_apellidos}` : 'Sin objetivo'
        }));

        res.json({
            publicaciones: publicacionesFormateadas,
            pagination: {
                current_page: pageNum,
                total_pages: totalPages,
                total_items: total,
                items_per_page: limitNum
            }
        });

    } catch (error) {
        console.error('Error obteniendo publicaciones:', error);
        res.status(500).json({ 
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Versión alternativa usando PREPARE/EXECUTE (método más seguro para MySQL 8.0+)
router.get('/prepared', async (req, res) => {
    try {
        const { page = "1", limit = "10" } = req.query;
        
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(Math.max(1, parseInt(limit) || 10), 100);
        const offset = (pageNum - 1) * limitNum;

        // Usar transacción para PREPARE/EXECUTE/DEALLOCATE
        const connection = await db.getConnection();
        
        try {
            // Preparar statement
            await connection.execute(`
                PREPARE stmt FROM '
                    SELECT p.id, p.mensaje, p.tipo_publicacion, p.fecha_creacion,
                           u.nombres as autor_nombres, 
                           u.apellidos as autor_apellidos,
                           c.nombre_curso, 
                           cat.nombres as catedratico_nombres,
                           cat.apellidos as catedratico_apellidos
                    FROM publicaciones p 
                    JOIN usuarios u ON p.usuario_id = u.id 
                    LEFT JOIN cursos c ON p.curso_id = c.id
                    LEFT JOIN catedraticos cat ON p.catedratico_id = cat.id
                    ORDER BY p.fecha_creacion DESC 
                    LIMIT ? OFFSET ?'
            `);

            // Ejecutar con parámetros
            const [publicaciones] = await connection.execute(
                'EXECUTE stmt USING ?, ?', 
                [limitNum, offset]
            );

            // Limpiar statement
            await connection.execute('DEALLOCATE PREPARE stmt');

            const publicacionesFormateadas = publicaciones.map(pub => ({
                ...pub,
                autor_nombre: `${pub.autor_nombres} ${pub.autor_apellidos}`,
                catedratico_nombre: pub.catedratico_nombres ? 
                    `${pub.catedratico_nombres} ${pub.catedratico_apellidos}` : null
            }));

            res.json(publicacionesFormateadas);

        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Error con prepared statement:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Obtener publicación por ID
router.get('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        
        if (isNaN(id)) {
            return res.status(400).json({ message: 'ID inválido' });
        }

        const [publicaciones] = await db.execute(
            `SELECT p.*, 
                    u.nombres as autor_nombres, 
                    u.apellidos as autor_apellidos,
                    u.registro_academico as autor_registro,
                    c.nombre_curso, 
                    c.codigo_curso,
                    cat.nombres as catedratico_nombres,
                    cat.apellidos as catedratico_apellidos
             FROM publicaciones p 
             JOIN usuarios u ON p.usuario_id = u.id 
             LEFT JOIN cursos c ON p.curso_id = c.id
             LEFT JOIN catedraticos cat ON p.catedratico_id = cat.id
             WHERE p.id = ?`,
            [id]
        );

        if (publicaciones.length === 0) {
            return res.status(404).json({ message: 'Publicación no encontrada' });
        }

        const publicacion = publicaciones[0];
        const publicacionFormateada = {
            ...publicacion,
            autor_nombre: `${publicacion.autor_nombres} ${publicacion.autor_apellidos}`,
            catedratico_nombre: publicacion.catedratico_nombres ? 
                `${publicacion.catedratico_nombres} ${publicacion.catedratico_apellidos}` : null
        };

        res.json(publicacionFormateada);

    } catch (error) {
        console.error('Error obteniendo publicación:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

export default router;