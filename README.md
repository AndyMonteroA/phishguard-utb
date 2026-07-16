# PhishGuard UTB

Plataforma web de concientizacion sobre ataques de Ingenieria Social dirigida a estudiantes de la carrera de Sistemas de Informacion de la Universidad Tecnica de Babahoyo.

## Stack Tecnologico

| Capa | Tecnologia |
|------|------------|
| Frontend | React 19 + Vite 8 |
| Backend | Node.js + Express 5 |
| Base de Datos | PostgreSQL + Sequelize 6 |
| Autenticacion | JWT + Google OAuth 2.0 |
| Graficos | Chart.js |
| Animaciones | Framer Motion |

## Requisitos Previos

- Node.js 18+ (recomendado: 20+)
- PostgreSQL 14+
- npm 9+

## Instalacion Rapida

### 1. Clonar el repositorio
```bash
git clone https://github.com/TU_USUARIO/phishguard-utb.git
cd phishguard-utb
```

### 2. Configurar Backend
```bash
cd phishguard-backend
cp .env.example .env
# Editar .env con tus credenciales de PostgreSQL
npm install
```

### 3. Crear Base de Datos
```bash
# Opcion A: Manual
psql -U postgres -c "CREATE DATABASE phishguard_utb;"

# Opcion B: Con script SQL
psql -U postgres -f scripts/init.sql
```

### 4. Poblar la Base de Datos
```bash
npm run seed
```
Esto crea:
- 1 usuario admin (admin@phishguard.utb.edu.ec / admin123)
- 4 modulos de aprendizaje
- 15 contenidos educativos
- 40 preguntas de quiz
- 7 logros predefinidos

### 5. Configurar Frontend
```bash
cd ../phishguard-frontend
cp .env.example .env  # o crear .env manualmente
npm install
```

### 6. Iniciar en Desarrollo
Terminal 1 (Backend):
```bash
cd phishguard-backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd phishguard-frontend
npm run dev
```

### 7. Acceder
- Frontend: http://localhost:5173
- API: http://localhost:5000/api/health
- Admin: admin@phishguard.utb.edu.ec / admin123

## Google OAuth (Opcional)

Para habilitar el login con Google:

1. Ir a [Google Cloud Console](https://console.cloud.google.com)
2. Crear un nuevo proyecto
3. APIs y servicios > Credenciales > Crear credenciales > ID de cliente de OAuth
4. Tipo: Aplicacion web
5. Origenes autorizados: http://localhost:5173 (y tu dominio en produccion)
6. Copiar el Client ID
7. Agregar en ambos `.env`:
   - Backend: `GOOGLE_CLIENT_ID=tu-client-id`
   - Frontend: `VITE_GOOGLE_CLIENT_ID=tu-client-id`

## Despliegue en VPS (Produccion)

### 1. Preparar el servidor
```bash
# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Instalar PM2
sudo npm install -g pm2

# Instalar Nginx
sudo apt install -y nginx
```

### 2. Clonar y configurar
```bash
cd /var/www
git clone https://github.com/TU_USUARIO/phishguard-utb.git
cd phishguard-utb

# Backend
cd phishguard-backend
cp .env.example .env
nano .env  # Configurar credenciales de produccion
npm install --production

# Crear BD y poblar
sudo -u postgres psql -c "CREATE DATABASE phishguard_utb;"
sudo -u postgres psql -c "CREATE USER phishguard WITH PASSWORD 'tu_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE phishguard_utb TO phishguard;"
npm run seed

# Frontend
cd ../phishguard-frontend
npm install
npm run build
```

### 3. Configurar PM2
```bash
cd /var/www/phishguard-utb/phishguard-backend
pm2 start src/app.js --name phishguard-api
pm2 save
pm2 startup
```

### 4. Configurar Nginx
```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    # Frontend (archivos estaticos)
    location / {
        root /var/www/phishguard-utb/phishguard-frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # API (proxy al backend)
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/phishguard /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Estructura del Proyecto

```
phishguard-utb/
├── phishguard-backend/
│   ├── scripts/          # Scripts de BD (init.sql, setup-db.js)
│   ├── src/
│   │   ├── config/       # Configuracion (env, database)
│   │   ├── controllers/  # Logica de negocio (9 controladores)
│   │   ├── middlewares/  # Auth JWT, roles, validacion
│   │   ├── models/       # 11 modelos Sequelize
│   │   ├── routes/       # 11 grupos de rutas
│   │   ├── seeders/      # Datos iniciales
│   │   └── app.js        # Entry point Express
│   ├── .env.example
│   └── package.json
│
├── phishguard-frontend/
│   ├── src/
│   │   ├── components/   # Navbar, Footer, ProtectedRoute, NotificacionDropdown, IconMap
│   │   ├── context/      # AuthContext (JWT + roles)
│   │   ├── pages/        # 10 paginas + 6 admin
│   │   ├── services/     # api.js (Axios)
│   │   └── styles/       # global.css (design system)
│   ├── .env
│   └── index.html
│
└── README.md
```

## Funcionalidades

### Estudiante
- Registro / Login (email o Google)
- Encuesta diagnostica (8 preguntas)
- 4 modulos interactivos (Phishing, Pretexting, Vishing, Baiting)
- Quizzes con retroalimentacion inmediata
- Sistema de logros y gamificacion
- Notificaciones in-app
- Seguimiento de progreso
- Certificado digital en PDF

### Administrador
- Dashboard con estadisticas generales
- Gestion CRUD de modulos, contenidos y preguntas
- Gestion de estudiantes (activar/desactivar)
- Analitica avanzada con graficos (Chart.js)
- Exportacion de reportes a Excel

## Licencia

Proyecto academico - Universidad Tecnica de Babahoyo - FAFI
Carrera de Sistemas de Informacion - 6to Semestre - 2026
