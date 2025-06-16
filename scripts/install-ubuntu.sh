#!/bin/bash

# 🚀 Script de Instalación Automática de AuditPro en Ubuntu
# Autor: Asistente de Desarrollo
# Versión: 1.0

set -e  # Salir si algún comando falla

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funciones de utilidad
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# Banner
echo -e "${BLUE}"
cat << "EOF"
  ╔══════════════════════════════════════════════════╗
  ║              AUDITPRO INSTALLER                  ║
  ║         Instalación Automática en Ubuntu        ║
  ╚══════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Verificar que se ejecuta como root
if [[ $EUID -ne 0 ]]; then
   log_error "Este script debe ejecutarse como root (sudo)"
fi

# Verificar Ubuntu
if ! grep -q "Ubuntu" /etc/os-release; then
    log_error "Este script está diseñado para Ubuntu"
fi

# Variables configurables
DOMAIN=""
EMAIL=""
APP_DIR="/var/www/auditpro"
NODE_VERSION="18"

# Función para solicitar configuración
get_user_input() {
    log_info "Configuración inicial"
    
    echo -n "Ingresa tu dominio (ej: auditpro.empresa.com): "
    read DOMAIN
    
    echo -n "Ingresa tu email para SSL (ej: admin@empresa.com): "
    read EMAIL
    
    if [[ -z "$DOMAIN" || -z "$EMAIL" ]]; then
        log_error "El dominio y email son requeridos"
    fi
    
    log_info "Configuración:"
    log_info "Dominio: $DOMAIN"
    log_info "Email: $EMAIL"
    log_info "Directorio: $APP_DIR"
    
    echo -n "¿Continuar con la instalación? (y/n): "
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        log_error "Instalación cancelada"
    fi
}

# Actualizar sistema
update_system() {
    log_info "Actualizando sistema Ubuntu..."
    apt update
    apt upgrade -y
    apt install -y curl wget git unzip software-properties-common build-essential
    log_success "Sistema actualizado"
}

# Configurar firewall
setup_firewall() {
    log_info "Configurando firewall UFW..."
    ufw --force enable
    ufw allow ssh
    ufw allow 80
    ufw allow 443
    log_success "Firewall configurado"
}

# Instalar Node.js
install_nodejs() {
    log_info "Instalando Node.js $NODE_VERSION..."
    
    # Desinstalar versiones previas
    apt remove -y nodejs npm || true
    
    # Instalar desde NodeSource
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
    apt-get install -y nodejs
    
    # Verificar instalación
    node_version=$(node --version)
    npm_version=$(npm --version)
    
    log_success "Node.js instalado: $node_version"
    log_success "NPM instalado: $npm_version"
}

# Instalar y configurar Nginx
install_nginx() {
    log_info "Instalando Nginx..."
    apt install -y nginx
    systemctl start nginx
    systemctl enable nginx
    
    # Remover configuración default
    rm -f /etc/nginx/sites-enabled/default
    
    log_success "Nginx instalado y habilitado"
}

# Configurar Nginx para AuditPro
configure_nginx() {
    log_info "Configurando Nginx para AuditPro..."
    
    cat > "/etc/nginx/sites-available/auditpro" << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;
    
    # SSL configurado por Certbot
    
    # Headers de seguridad
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Configuración de la aplicación
    location / {
        root $APP_DIR/dist;
        try_files \$uri \$uri/ /index.html;
        
        # Cache para archivos estáticos
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # Logs
    access_log /var/log/nginx/auditpro.access.log;
    error_log /var/log/nginx/auditpro.error.log;
}
EOF
    
    # Activar sitio
    ln -sf /etc/nginx/sites-available/auditpro /etc/nginx/sites-enabled/
    
    # Verificar configuración
    nginx -t
    systemctl reload nginx
    
    log_success "Nginx configurado para AuditPro"
}

# Instalar SSL con Let's Encrypt
install_ssl() {
    log_info "Instalando certificado SSL..."
    
    # Instalar Certbot
    apt install -y certbot python3-certbot-nginx
    
    # Obtener certificado
    certbot --nginx --non-interactive --agree-tos --email "$EMAIL" -d "$DOMAIN" -d "www.$DOMAIN"
    
    # Configurar renovación automática
    (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
    
    log_success "SSL configurado para $DOMAIN"
}

# Crear estructura de directorios
create_directories() {
    log_info "Creando directorios de aplicación..."
    
    mkdir -p "$APP_DIR"
    mkdir -p /var/log/auditpro
    mkdir -p /var/backups/auditpro
    
    # Crear usuario para la aplicación
    id -u auditpro &>/dev/null || useradd -r -s /bin/false auditpro
    
    log_success "Directorios creados"
}

# Crear aplicación de ejemplo
create_sample_app() {
    log_info "Creando aplicación de ejemplo..."
    
    cd "$APP_DIR"
    
    # Crear package.json básico
    cat > package.json << EOF
{
  "name": "auditpro",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.8"
  }
}
EOF
    
    # Crear estructura básica
    mkdir -p src public
    
    # HTML básico
    cat > public/index.html << EOF
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AuditPro - Sistema de Auditorías</title>
    <link rel="icon" type="image/svg+xml" href="/shield.svg">
</head>
<body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
</body>
</html>
EOF
    
    # App básica de React
    cat > src/main.jsx << EOF
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
EOF
    
    cat > src/App.jsx << EOF
import React from 'react'

function App() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{
        background: 'white',
        padding: '3rem',
        borderRadius: '1rem',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        maxWidth: '500px'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: '#0ea5e9',
          borderRadius: '1rem',
          margin: '0 auto 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
          </svg>
        </div>
        <h1 style={{ color: '#1f2937', marginBottom: '1rem', fontSize: '2rem' }}>
          🎉 AuditPro Instalado
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '2rem', lineHeight: '1.6' }}>
          Tu sistema de auditorías está funcionando correctamente en <strong>$DOMAIN</strong>
        </p>
        <div style={{ 
          background: '#f3f4f6', 
          padding: '1rem', 
          borderRadius: '0.5rem',
          marginBottom: '2rem'
        }}>
          <p style={{ color: '#374151', margin: 0 }}>
            <strong>Siguiente paso:</strong> Sube tu aplicación AuditPro completa a este directorio
          </p>
        </div>
        <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
          Directorio: <code>$APP_DIR</code>
        </p>
      </div>
    </div>
  )
}

export default App
EOF
    
    # Vite config
    cat > vite.config.js << EOF
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
})
EOF
    
    # Instalar dependencias y construir
    npm install
    npm run build
    
    # Configurar permisos
    chown -R www-data:www-data "$APP_DIR"
    chmod -R 755 "$APP_DIR"
    
    log_success "Aplicación de ejemplo creada y construida"
}

# Crear scripts de utilidad
create_utility_scripts() {
    log_info "Creando scripts de utilidad..."
    
    # Script de estado
    cat > /usr/local/bin/auditpro-status << 'EOF'
#!/bin/bash
echo "🔍 Estado de AuditPro"
echo "===================="
echo "Nginx: $(systemctl is-active nginx)"
echo "SSL: $(certbot certificates 2>/dev/null | grep -c "Valid:")"
echo "Espacio en disco: $(df -h /var/www/auditpro | tail -1 | awk '{print $5}')"
echo "Última modificación: $(stat -c %y /var/www/auditpro/dist/index.html 2>/dev/null || echo 'N/A')"
echo ""
echo "📊 Últimas 5 visitas:"
tail -5 /var/log/nginx/auditpro.access.log 2>/dev/null || echo "No hay logs disponibles"
EOF
    
    # Script de backup
    cat > /usr/local/bin/auditpro-backup << EOF
#!/bin/bash
backup_dir="/var/backups/auditpro/\$(date +%Y%m%d_%H%M%S)"
mkdir -p "\$backup_dir"
cp -r "$APP_DIR/dist" "\$backup_dir/"
echo "✅ Backup creado en: \$backup_dir"
# Limpiar backups antiguos (mantener últimos 7)
find /var/backups/auditpro -type d -mtime +7 -exec rm -rf {} + 2>/dev/null || true
EOF
    
    # Script de actualización
    cat > /usr/local/bin/auditpro-update << EOF
#!/bin/bash
set -e
echo "🚀 Actualizando AuditPro..."

# Hacer backup
/usr/local/bin/auditpro-backup

cd "$APP_DIR"

# Si existe git, hacer pull
if [ -d ".git" ]; then
    git pull origin main
    npm install
    npm run build
    systemctl reload nginx
    echo "✅ Aplicación actualizada desde Git"
else
    echo "ℹ️  Para actualizar, sube los nuevos archivos a $APP_DIR"
fi
EOF
    
    chmod +x /usr/local/bin/auditpro-*
    
    log_success "Scripts de utilidad creados"
}

# Configurar monitoreo básico
setup_monitoring() {
    log_info "Configurando monitoreo básico..."
    
    # Instalar fail2ban
    apt install -y fail2ban
    
    cat > /etc/fail2ban/jail.local << EOF
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
EOF
    
    systemctl enable fail2ban
    systemctl start fail2ban
    
    # Configurar logrotate
    cat > /etc/logrotate.d/auditpro << EOF
/var/log/nginx/auditpro*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 www-data adm
    postrotate
        if [ -f /var/run/nginx.pid ]; then
            kill -USR1 \`cat /var/run/nginx.pid\`
        fi
    endscript
}
EOF
    
    log_success "Monitoreo configurado"
}

# Función principal
main() {
    log_info "Iniciando instalación de AuditPro..."
    
    get_user_input
    update_system
    setup_firewall
    install_nodejs
    install_nginx
    configure_nginx
    install_ssl
    create_directories
    create_sample_app
    create_utility_scripts
    setup_monitoring
    
    log_success "¡Instalación completada!"
    
    echo -e "${GREEN}"
    cat << EOF

🎉 ¡AuditPro instalado exitosamente!

🌐 URLs:
   - Aplicación: https://$DOMAIN
   - Directorio: $APP_DIR

🛠️ Comandos útiles:
   - Estado: auditpro-status
   - Backup: auditpro-backup
   - Actualizar: auditpro-update

📁 Archivos importantes:
   - Aplicación: $APP_DIR
   - Logs Nginx: /var/log/nginx/auditpro.*
   - Configuración: /etc/nginx/sites-available/auditpro

🚀 Próximos pasos:
   1. Sube tu aplicación AuditPro completa a $APP_DIR
   2. Ejecuta: cd $APP_DIR && npm install && npm run build
   3. Configura variables de entorno en .env.production

EOF
    echo -e "${NC}"
}

# Ejecutar instalación
main "$@"
