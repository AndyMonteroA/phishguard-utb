# Guía de Despliegue en Servidor VPS — PhishGuard UTB
Este documento detalla el paso a paso para configurar tu servidor VPS (basado en Ubuntu/Debian) y poner en producción la plataforma web **PhishGuard UTB**.

---

## Requisitos Previos
1. Un servidor VPS con **Ubuntu 22.04 LTS** o superior.
2. Acceso como usuario `root` o con privilegios `sudo`.
3. Un dominio o subdominio apuntando a la dirección IP de tu VPS (necesario para el certificado SSL y el inicio de sesión con Google).

---

## Paso 1: Actualizar el Sistema y Dependencias Básicas
Conéctate a tu VPS por SSH y ejecuta los siguientes comandos para actualizar el sistema e instalar las herramientas necesarias:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl wget build-essential
```

---

## Paso 2: Instalar Node.js (v20) y PM2
Instalamos Node.js desde la fuente oficial e instalamos PM2 de forma global para mantener el backend corriendo en segundo plano:

```bash
# Descargar e instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar versiones
node -v
npm -v

# Instalar PM2 globalmente
sudo npm install -g pm2
```

---

## Paso 3: Instalar y Configurar PostgreSQL
Instalamos el motor de base de datos PostgreSQL, creamos la base de datos y un usuario seguro:

```bash
# Instalar PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Iniciar y habilitar el servicio
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Entrar a la consola de PostgreSQL
sudo -i -u postgres psql
```

Dentro de la consola interactiva de PostgreSQL (`psql`), ejecuta los siguientes comandos (cambia `'TuContrasenaSegura'` por una clave fuerte):

```sql
-- 1. Crear base de datos
CREATE DATABASE phishguard_utb;

-- 2. Crear usuario administrador para la app
CREATE USER phishguard WITH PASSWORD 'TuContrasenaSegura';

-- 3. Asignar privilegios completos
GRANT ALL PRIVILEGES ON DATABASE phishguard_utb TO phishguard;

-- 4. Salir de la consola
\q
```

---

## Paso 4: Clonar el Proyecto y Configurar Variables de Entorno
Clonamos tu repositorio de GitHub en la ruta común para aplicaciones web (`/var/www`):

```bash
# Moverse a la carpeta www
cd /var/www

# Clonar repositorio (si es privado, te pedirá tus credenciales/token de GitHub)
sudo git clone https://github.com/AndyMonteroA/phishguard-utb.git
sudo chown -R $USER:$USER /var/www/phishguard-utb
cd phishguard-utb
```

### 1. Configurar Backend `.env`
Creamos el archivo de configuración del backend:

```bash
cd phishguard-backend
cp .env.example .env
nano .env
```

Modifica los valores en el editor `nano` de la siguiente manera:
```env
NODE_ENV=production
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=phishguard_utb
DB_USER=phishguard
DB_PASSWORD=TuContrasenaSegura  # La contraseña que creaste en PostgreSQL
JWT_SECRET=UnCodigoSuperLargoYSecreto2026!  # Escribe una clave aleatoria fuerte
JWT_EXPIRATION=24h
FRONTEND_URL=https://phishguardutb.online  # Tu dominio real
GOOGLE_CLIENT_ID=568294630065-oeushgct26pbou93mc7poeh1fdj9ivu0.apps.googleusercontent.com
```
*(Para guardar en `nano`, presiona `Ctrl + O`, luego `Enter` y sal con `Ctrl + X`)*.

### 2. Configurar Frontend `.env`
Creamos el archivo del frontend:

```bash
cd ../phishguard-frontend
nano .env
```

Ingresa el siguiente contenido:
```env
VITE_API_URL=https://phishguardutb.online/api
VITE_GOOGLE_CLIENT_ID=568294630065-oeushgct26pbou93mc7poeh1fdj9ivu0.apps.googleusercontent.com
```

---

## Paso 5: Instalar, Estructurar e Iniciar Backend
Instalamos las dependencias, creamos las tablas y cargamos todos los datos iniciales de la base de datos:

```bash
cd ../phishguard-backend

# Instalar dependencias de producción
npm install --production

# Crear tablas en la base de datos automáticamente
npm run setup

# Cargar los datos iniciales (Admin, Módulos, Contenidos, Preguntas, Logros)
npm run seed

# Iniciar el backend en segundo plano con PM2
pm2 start src/app.js --name "phishguard-api"

# Configurar PM2 para que inicie automáticamente si el VPS se reinicia
pm2 save
pm2 startup
```
*(Sigue las instrucciones en pantalla que te arroje el comando `pm2 startup` para habilitar el servicio del sistema)*.

---

## Paso 6: Compilar el Frontend
Compilamos los archivos del frontend React para generar el código estático optimizado para producción:

```bash
cd ../phishguard-frontend

# Instalar todas las dependencias
npm install

# Compilar proyecto
npm run build
```
Esto creará una carpeta llamada `dist` dentro de `phishguard-frontend` con todo tu sitio optimizado para ser servido por Nginx.

---

## Paso 7: Configurar Servidor Web Nginx
Nginx se encargará de servir el frontend estático y redirigir las peticiones de la API (`/api`) al backend Node.js en el puerto 5000.

```bash
# Instalar Nginx
sudo apt install -y nginx

# Crear archivo de configuración
sudo nano /etc/nginx/sites-available/phishguard
```

Pega la siguiente configuración (reemplaza `tu-dominio.com` con tu dominio real):

```nginx
server {
    listen 80;
    server_name phishguardutb.online www.phishguardutb.online;

    # Directorio donde se compilo el frontend React
    location / {
        root /var/www/phishguard-utb/phishguard-frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Redireccionar peticiones al Backend en el puerto 5000
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

Habilitamos el sitio y reiniciamos Nginx:

```bash
# Crear enlace simbólico para activar el sitio
sudo ln -s /etc/nginx/sites-available/phishguard /etc/nginx/sites-enabled/

# Desactivar la configuración por defecto de Nginx
sudo rm /etc/nginx/sites-enabled/default

# Probar que la sintaxis de Nginx sea correcta
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

---

## Paso 8: Instalar Certificado SSL (HTTPS) Gratis
Google OAuth requiere de forma obligatoria que tu dominio utilice HTTPS. Usaremos **Certbot** para obtener e instalar un certificado SSL de forma automática:

```bash
# Instalar snap y certbot
sudo apt install snapd
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot

# Vincular comando certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot

# Generar e instalar el certificado en Nginx
sudo certbot --nginx -d phishguardutb.online -d www.phishguardutb.online
```
*(Sigue las instrucciones en pantalla, ingresa tu correo y acepta los términos. Certbot modificará la configuración de Nginx para redirigir todo el tráfico HTTP a HTTPS de manera segura de forma automática).*

---

## Paso 9: Configurar el Cortafuegos (UFW)
Asegura tu servidor permitiendo únicamente las conexiones necesarias (SSH, HTTP y HTTPS):

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

---

## ¡Despliegue Finalizado!
Tu plataforma web ya está completamente activa y segura. 
- Puedes acceder al sitio web desde: `https://phishguardutb.online`
- El panel de administración está listo en: `https://phishguardutb.online/admin` (Credenciales por defecto: `admin@phishguard.utb.edu.ec` / `admin123`).
