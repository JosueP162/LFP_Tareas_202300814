. **Ejecutar el servidor**
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## 📋 Endpoints Disponibles

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/forgot-password` - Recuperar contraseña

### Publicaciones
- `GET /api/publicaciones` - Obtener todas las publicaciones
- `POST /api/publicaciones` - Crear nueva publicación
- `GET /api/publicaciones/:id/comentarios` - Obtener comentarios
- `POST /api/publicaciones/:id/comentarios` - Agregar comentario

### Cursos
- `GET /api/cursos` - Obtener todos los cursos
- `GET /api/cursos/:id` - Obtener curso por ID

### Catedráticos
- `GET /api/catedraticos` - Obtener todos los catedráticos
- `GET /api/catedraticos/:id` - Obtener catedrático por ID

### Usuarios
- `GET /api/usuarios/buscar/:registro` - Buscar usuario
- `GET /api/usuarios/perfil` - Obtener perfil actual
- `PUT /api/usuarios/perfil` - Actualizar perfil