import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

import authRoutes from './src/routes/auth.js';
import userRoutes from './src/routes/users.js';
import professorRoutes from './src/routes/professors.js';
import courseRoutes from './src/routes/courses.js';
import publicacionesRoutes from './src/routes/realeses.js';


dotenv.config();
const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json())
app.use(express.urlencoded({extended:true}))

//rutas
app.use('/api/auth',authRoutes);
app.use('/api/publicaciones',publicacionesRoutes);
app.use('/api/cursos',courseRoutes);
app.use('/api/catedraticos',professorRoutes);
app.use('/api/usuarios',userRoutes);

app.get('/api/test', (req,res) =>{
    res.json({
        message:'Backend funcionando bien',
        database:'sistema de catedraticos',
        timestamp: new Date().toISOString
    });
});

//manejo de errores

app.use((err,req,res,next)=>{
    console.error('ERROR:',err.stack);
    res.status(500).json({
        message:'ERROR DEL SERVIDOR',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    })
});

app.use((req,res)=>{
    res.status(404).json({
        message: 'RUTA NO ENCONTRADA'
    });
});

app.listen(PORT,()=>{
    console.log(`Servidor ejecutandose en http://localhost:${PORT}`)
    console.log(`Entorno: ${process.env.NODE_ENV}`)
});