# ⚡ Guía Rápida - AuditPro en Ubuntu

## 🚀 Instalación en 5 Minutos

### Opción 1: Script Automático (Recomendado)

```bash
# Descargar e instalar automáticamente
wget -O - https://raw.githubusercontent.com/tu-repo/auditpro/main/scripts/install-ubuntu.sh | sudo bash
```

### Opción 2: Comandos Manuales

```bash
# 1. Actualizar sistema
sudo apt update && sudo apt upgrade -y

# 2. Instalar Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Instalar Nginx
sudo apt install -y nginx

# 4. Instalar SSL
sudo apt install -y certbot python3-certbot-nginx

# 5. Configurar dominio
sudo certbot --nginx -d tu-dominio.com

# 6. Crear directorio
sudo mkdir -p /var/www/auditpro
sudo chown -R $USER:$USER /var/www/auditpro

# 7. Subir aplicación
cd /var/www/auditpro
# Sube tus archivos aquí

# 8. Construir aplicación
npm install
npm run build

# 9. Configurar Nginx
sudo nano /etc/nginx/sites-available/auditpro
# Pega la configuración de Nginx

# 10. Activar sitio
sudo ln -s /etc/nginx/sites-available/auditpro /etc/nginx/sites-enabled/
sudo systemctl reload nginx
```

## 📁 Estructura de Archivos

```
/var/www/auditpro/          # Directorio principal
├── dist/                   # Archivos construidos (producción)
├── src/                    # Código fuente
├── package.json            # Dependencias
├── .env.production        # Variables de entorno
└── vite.config.js         # Configuración de Vite
```

## 🔧 Comandos Útiles

```bash
# Ver estado del sistema
auditpro-status

# Hacer backup
auditpro-backup

# Actualizar aplicación
auditpro-update

# Ver logs en tiempo real
sudo tail -f /var/log/nginx/auditpro.access.log

# Reiniciar servicios
sudo systemctl restart nginx
```

## 🌐 URLs Importantes

- **Aplicación:** https://tu-dominio.com
- **Dashboard:** https://tu-dominio.com/dashboard
- **Configuración:** https://tu-dominio.com/configuration

## 🔒 Variables de Entorno

Crear `/var/www/auditpro/.env.production`:

```env
VITE_FILEMAKER_SERVER=tu-servidor-filemaker.com
VITE_FILEMAKER_DATABASE=AuditPro
VITE_FILEMAKER_USERNAME=api_user
VITE_FILEMAKER_PASSWORD=contraseña_segura
VITE_FILEMAKER_SSL_VERIFY=true
VITE_MOCK_DATA=false
```

## 🆘 Solución Rápida de Problemas

### Error 502 Bad Gateway

```bash
sudo systemctl status nginx
sudo nginx -t
sudo systemctl restart nginx
```

### Error SSL

```bash
sudo certbot renew
sudo systemctl reload nginx
```

### Permisos

```bash
sudo chown -R www-data:www-data /var/www/auditpro/dist
sudo chmod -R 755 /var/www/auditpro/dist
```

## 📞 Ayuda

- **Logs:** `/var/log/nginx/auditpro.error.log`
- **Configuración:** `/etc/nginx/sites-available/auditpro`
- **Estado SSL:** `sudo certbot certificates`

¡Listo! Tu AuditPro estará funcionando en minutos. 🎉
