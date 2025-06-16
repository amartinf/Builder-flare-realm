# 🚀 Guía de Instalación en Ubuntu Server

Esta guía te ayudará a instalar AuditPro en un servidor Ubuntu de forma completa y segura.

## 📋 Prerrequisitos

- **Ubuntu Server 20.04 LTS o superior**
- **Acceso root o sudo**
- **Dominio apuntando al servidor** (opcional pero recomendado)
- **Mínimo 2GB RAM, 1 CPU, 20GB disco**

## 🛠️ Instalación Automática (Recomendada)

### Opción 1: Script de Instalación Completa

```bash
# Descargar y ejecutar script de instalación
curl -fsSL https://raw.githubusercontent.com/tu-repo/auditpro/main/scripts/install-ubuntu.sh | sudo bash
```

### Opción 2: Instalación Manual Paso a Paso

Sigue los pasos detallados a continuación:

---

## 📦 Paso 1: Preparar el Servidor

### Actualizar Sistema

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git unzip software-properties-common
```

### Configurar Firewall

```bash
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw status
```

---

## 🟢 Paso 2: Instalar Node.js

### Método 1: NodeSource (Recomendado)

```bash
# Instalar Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalación
node --version  # Debe mostrar v18.x.x
npm --version   # Debe mostrar 9.x.x
```

### Método 2: Usando NVM

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
nvm alias default 18
```

---

## 🌐 Paso 3: Instalar y Configurar Nginx

### Instalar Nginx

```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Configurar Nginx para AuditPro

```bash
sudo nano /etc/nginx/sites-available/auditpro
```

**Contenido del archivo:**

```nginx
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;

    # Redirigir a HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tu-dominio.com www.tu-dominio.com;

    # Configuración SSL (se configurará más adelante)
    ssl_certificate /etc/letsencrypt/live/tu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tu-dominio.com/privkey.pem;

    # Configuración de seguridad SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_session_timeout 10m;
    ssl_session_cache shared:SSL:10m;
    ssl_prefer_server_ciphers on;

    # Headers de seguridad
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Configuración de archivos estáticos
    location / {
        root /var/www/auditpro/dist;
        try_files $uri $uri/ /index.html;

        # Cache para archivos estáticos
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Configuración para API (si tienes backend)
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Logs
    access_log /var/log/nginx/auditpro.access.log;
    error_log /var/log/nginx/auditpro.error.log;
}
```

### Activar configuración

```bash
sudo ln -s /etc/nginx/sites-available/auditpro /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔒 Paso 4: Configurar SSL con Let's Encrypt

### Instalar Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### Obtener certificado SSL

```bash
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com
```

### Configurar renovación automática

```bash
sudo crontab -e
# Agregar esta línea:
0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 📁 Paso 5: Desplegar la Aplicación

### Crear directorio de aplicación

```bash
sudo mkdir -p /var/www/auditpro
sudo chown -R $USER:$USER /var/www/auditpro
cd /var/www/auditpro
```

### Método 1: Desde Repositorio Git

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/auditpro.git .

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.production
nano .env.production
```

### Método 2: Subir archivos manualmente

```bash
# En tu computadora local, construir la aplicación
npm run build

# Comprimir archivos
tar -czf auditpro-build.tar.gz dist/

# Subir al servidor (desde tu computadora)
scp auditpro-build.tar.gz user@tu-servidor:/var/www/auditpro/

# En el servidor, extraer archivos
cd /var/www/auditpro
tar -xzf auditpro-build.tar.gz
```

### Configurar variables de entorno de producción

```bash
nano /var/www/auditpro/.env.production
```

**Contenido del archivo:**

```env
# Configuración de producción
VITE_FILEMAKER_SERVER=tu-servidor-filemaker.com
VITE_FILEMAKER_DATABASE=AuditPro
VITE_FILEMAKER_USERNAME=api_user_prod
VITE_FILEMAKER_PASSWORD=contraseña_segura_produccion

# Configuración de seguridad
VITE_FILEMAKER_SSL_VERIFY=true
VITE_DEVELOPMENT_MODE=false
VITE_MOCK_DATA=false

# URL de la aplicación
VITE_APP_URL=https://tu-dominio.com
```

### Construir para producción

```bash
cd /var/www/auditpro
npm run build

# Verificar que se creó la carpeta dist
ls -la dist/
```

---

## 🔄 Paso 6: Configurar PM2 (Para aplicaciones Node.js)

Si tienes backend de Node.js, usa PM2:

### Instalar PM2

```bash
sudo npm install -g pm2
```

### Crear archivo de configuración PM2

```bash
nano /var/www/auditpro/ecosystem.config.js
```

**Contenido:**

```javascript
module.exports = {
  apps: [
    {
      name: "auditpro-api",
      script: "./server/index.js", // Ruta a tu servidor backend
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
      error_file: "/var/log/pm2/auditpro-error.log",
      out_file: "/var/log/pm2/auditpro-out.log",
      log_file: "/var/log/pm2/auditpro.log",
    },
  ],
};
```

### Iniciar aplicación con PM2

```bash
cd /var/www/auditpro
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## 🛡️ Paso 7: Configuración de Seguridad

### Configurar fail2ban

```bash
sudo apt install -y fail2ban

# Configurar para Nginx
sudo nano /etc/fail2ban/jail.local
```

**Contenido:**

```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[nginx-http-auth]
enabled = true

[nginx-noscript]
enabled = true

[nginx-badbots]
enabled = true

[nginx-noproxy]
enabled = true
```

```bash
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### Configurar permisos de archivos

```bash
sudo chown -R www-data:www-data /var/www/auditpro/dist
sudo chmod -R 755 /var/www/auditpro/dist
```

---

## 📊 Paso 8: Monitoreo y Logs

### Configurar logrotate

```bash
sudo nano /etc/logrotate.d/auditpro
```

**Contenido:**

```
/var/log/nginx/auditpro*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data adm
    postrotate
        if [ -f /var/run/nginx.pid ]; then
            kill -USR1 `cat /var/run/nginx.pid`
        fi
    endscript
}
```

### Scripts de monitoreo

```bash
# Script para verificar estado
nano /usr/local/bin/auditpro-status.sh
```

**Contenido:**

```bash
#!/bin/bash
echo "=== AuditPro Status ==="
echo "Nginx: $(systemctl is-active nginx)"
echo "SSL Certificate:"
certbot certificates | grep -A2 "tu-dominio.com"
echo "Disk usage:"
df -h /var/www/auditpro
echo "Memory usage:"
free -h
echo "Last 5 nginx errors:"
tail -5 /var/log/nginx/auditpro.error.log
```

```bash
chmod +x /usr/local/bin/auditpro-status.sh
```

---

## 🔄 Paso 9: Scripts de Actualización

### Script de actualización automática

```bash
nano /usr/local/bin/update-auditpro.sh
```

**Contenido:**

```bash
#!/bin/bash
set -e

echo "🚀 Actualizando AuditPro..."

# Backup actual
backup_dir="/var/backups/auditpro/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$backup_dir"
cp -r /var/www/auditpro/dist "$backup_dir/"

cd /var/www/auditpro

# Actualizar código
git pull origin main

# Instalar dependencias
npm install

# Construir aplicación
npm run build

# Reiniciar servicios
sudo systemctl reload nginx

# Si tienes PM2
# pm2 restart auditpro-api

echo "✅ AuditPro actualizado exitosamente"
echo "📁 Backup guardado en: $backup_dir"
```

```bash
chmod +x /usr/local/bin/update-auditpro.sh
```

---

## 🧪 Paso 10: Verificación

### Verificar instalación

```bash
# Verificar servicios
sudo systemctl status nginx
sudo systemctl status certbot

# Verificar SSL
curl -I https://tu-dominio.com

# Verificar aplicación
curl -s https://tu-dominio.com | grep -o "<title>.*</title>"

# Verificar logs
tail -f /var/log/nginx/auditpro.access.log
```

### Test de performance

```bash
# Instalar herramientas de testing
sudo apt install -y apache2-utils

# Test de carga básico
ab -n 100 -c 10 https://tu-dominio.com/
```

---

## 🔧 Mantenimiento

### Comandos útiles

```bash
# Ver estado general
/usr/local/bin/auditpro-status.sh

# Actualizar aplicación
/usr/local/bin/update-auditpro.sh

# Ver logs en tiempo real
tail -f /var/log/nginx/auditpro.access.log

# Verificar certificados SSL
certbot certificates

# Renovar SSL manualmente
sudo certbot renew

# Reiniciar servicios
sudo systemctl restart nginx
```

### Backup automático

```bash
# Agregar a crontab
crontab -e

# Backup diario a las 2 AM
0 2 * * * /usr/local/bin/backup-auditpro.sh
```

---

## 🚨 Solución de Problemas

### Error 502 Bad Gateway

```bash
# Verificar que nginx esté corriendo
sudo systemctl status nginx

# Verificar configuración
sudo nginx -t

# Ver logs de error
tail -20 /var/log/nginx/error.log
```

### Error de SSL

```bash
# Verificar certificados
certbot certificates

# Renovar certificados
sudo certbot renew --dry-run
```

### Problemas de permisos

```bash
# Corregir permisos
sudo chown -R www-data:www-data /var/www/auditpro/dist
sudo chmod -R 755 /var/www/auditpro/dist
```

---

## 📞 URLs y Accesos

Después de la instalación:

- **Aplicación:** https://tu-dominio.com
- **Dashboard:** https://tu-dominio.com/dashboard
- **Configuración:** https://tu-dominio.com/configuration
- **Logs:** `/var/log/nginx/auditpro.*.log`
- **Archivos:** `/var/www/auditpro/`

---

## 🛡️ Mejores Prácticas de Seguridad

1. **Cambiar contraseñas por defecto**
2. **Configurar SSH con llaves**
3. **Actualizar sistema regularmente**
4. **Monitorear logs constantemente**
5. **Hacer backups regulares**
6. **Configurar alertas de monitoreo**

¡Tu aplicación AuditPro ya está lista en producción! 🎉
