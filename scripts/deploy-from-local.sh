#!/bin/bash

# 📦 Script para desplegar AuditPro desde computadora local al servidor

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# Variables
SERVER_USER=""
SERVER_HOST=""
SERVER_DIR="/var/www/auditpro"
BUILD_DIR="dist"

# Banner
echo -e "${BLUE}"
cat << "EOF"
  ╔══════════════════════════════════════════════════╗
  ║            AUDITPRO DEPLOYMENT                   ║
  ║        Despliegue desde Local a Servidor        ║
  ╚══════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Solicitar configuración
get_deployment_config() {
    log_info "Configuración de despliegue"
    
    echo -n "Usuario del servidor (ej: root): "
    read SERVER_USER
    
    echo -n "IP o dominio del servidor (ej: 192.168.1.100): "
    read SERVER_HOST
    
    if [[ -z "$SERVER_USER" || -z "$SERVER_HOST" ]]; then
        log_error "Usuario y servidor son requeridos"
    fi
    
    log_info "Configuración:"
    log_info "Servidor: $SERVER_USER@$SERVER_HOST"
    log_info "Directorio remoto: $SERVER_DIR"
    
    echo -n "¿Continuar con el despliegue? (y/n): "
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        log_error "Despliegue cancelado"
    fi
}

# Verificar dependencias locales
check_dependencies() {
    log_info "Verificando dependencias locales..."
    
    # Verificar Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js no está instalado"
    fi
    
    # Verificar npm
    if ! command -v npm &> /dev/null; then
        log_error "npm no está instalado"
    fi
    
    # Verificar ssh
    if ! command -v ssh &> /dev/null; then
        log_error "SSH no está disponible"
    fi
    
    # Verificar scp
    if ! command -v scp &> /dev/null; then
        log_error "SCP no está disponible"
    fi
    
    log_success "Dependencias verificadas"
}

# Verificar estructura del proyecto
check_project_structure() {
    log_info "Verificando estructura del proyecto..."
    
    if [[ ! -f "package.json" ]]; then
        log_error "No se encontró package.json. ¿Estás en el directorio correcto?"
    fi
    
    if [[ ! -f "vite.config.ts" && ! -f "vite.config.js" ]]; then
        log_warning "No se encontró vite.config. ¿Es un proyecto Vite?"
    fi
    
    log_success "Estructura del proyecto verificada"
}

# Instalar dependencias
install_dependencies() {
    log_info "Instalando dependencias..."
    
    npm install
    
    log_success "Dependencias instaladas"
}

# Construir aplicación
build_application() {
    log_info "Construyendo aplicación para producción..."
    
    # Limpiar build anterior
    rm -rf $BUILD_DIR
    
    # Configurar variables de entorno de producción
    if [[ ! -f ".env.production" ]]; then
        log_warning "No se encontró .env.production, usando .env si existe"
        if [[ -f ".env" ]]; then
            cp .env .env.production
        fi
    fi
    
    # Construir
    npm run build
    
    if [[ ! -d "$BUILD_DIR" ]]; then
        log_error "Error en el build. No se creó el directorio $BUILD_DIR"
    fi
    
    log_success "Aplicación construida exitosamente"
}

# Verificar conexión SSH
test_ssh_connection() {
    log_info "Verificando conexión SSH..."
    
    if ! ssh -o ConnectTimeout=10 -o BatchMode=yes "$SERVER_USER@$SERVER_HOST" exit 2>/dev/null; then
        log_error "No se pudo conectar al servidor. Verifica credenciales y conectividad"
    fi
    
    log_success "Conexión SSH verificada"
}

# Crear backup en servidor
create_remote_backup() {
    log_info "Creando backup en el servidor..."
    
    ssh "$SERVER_USER@$SERVER_HOST" << 'EOF'
if [[ -d "/var/www/auditpro/dist" ]]; then
    backup_dir="/var/backups/auditpro/deployment_$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$backup_dir"
    cp -r /var/www/auditpro/dist "$backup_dir/"
    echo "Backup creado en: $backup_dir"
fi
EOF
    
    log_success "Backup creado en el servidor"
}

# Subir archivos al servidor
upload_files() {
    log_info "Subiendo archivos al servidor..."
    
    # Crear archivo temporal con los archivos a subir
    tar -czf "auditpro-deploy-$(date +%Y%m%d_%H%M%S).tar.gz" -C "$BUILD_DIR" .
    
    # Subir archivo comprimido
    scp "auditpro-deploy-"*.tar.gz "$SERVER_USER@$SERVER_HOST:/tmp/"
    
    # Extraer en el servidor
    ssh "$SERVER_USER@$SERVER_HOST" << EOF
cd /tmp
latest_file=\$(ls -t auditpro-deploy-*.tar.gz | head -1)
mkdir -p "$SERVER_DIR/dist"
tar -xzf "\$latest_file" -C "$SERVER_DIR/dist"
chown -R www-data:www-data "$SERVER_DIR/dist"
chmod -R 755 "$SERVER_DIR/dist"
rm "\$latest_file"
EOF
    
    # Limpiar archivo local
    rm auditpro-deploy-*.tar.gz
    
    log_success "Archivos subidos y configurados"
}

# Configurar variables de entorno en servidor
setup_env_variables() {
    log_info "Configurando variables de entorno..."
    
    if [[ -f ".env.production" ]]; then
        scp ".env.production" "$SERVER_USER@$SERVER_HOST:$SERVER_DIR/"
        log_success "Variables de entorno configuradas"
    else
        log_warning "No se encontró .env.production"
    fi
}

# Reiniciar servicios
restart_services() {
    log_info "Reiniciando servicios en el servidor..."
    
    ssh "$SERVER_USER@$SERVER_HOST" << 'EOF'
# Verificar configuración de Nginx
nginx -t

# Recargar Nginx
systemctl reload nginx

# Si hay PM2, reiniciar
if command -v pm2 &> /dev/null; then
    pm2 restart all || true
fi
EOF
    
    log_success "Servicios reiniciados"
}

# Verificar despliegue
verify_deployment() {
    log_info "Verificando despliegue..."
    
    # Obtener dominio del servidor
    DOMAIN=$(ssh "$SERVER_USER@$SERVER_HOST" "grep 'server_name' /etc/nginx/sites-available/auditpro | head -1 | awk '{print \$2}' | sed 's/;//'")
    
    if [[ -n "$DOMAIN" ]]; then
        log_info "Verificando https://$DOMAIN"
        
        if curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN" | grep -q "200"; then
            log_success "Aplicación accesible en https://$DOMAIN"
        else
            log_warning "La aplicación puede no estar respondiendo correctamente"
        fi
    fi
    
    # Verificar archivos en servidor
    ssh "$SERVER_USER@$SERVER_HOST" << 'EOF'
if [[ -f "/var/www/auditpro/dist/index.html" ]]; then
    echo "✅ Archivos desplegados correctamente"
    echo "📁 Último archivo modificado: $(stat -c %y /var/www/auditpro/dist/index.html)"
else
    echo "��� Error: No se encontró index.html"
fi
EOF
}

# Función principal
main() {
    log_info "Iniciando despliegue de AuditPro..."
    
    get_deployment_config
    check_dependencies
    check_project_structure
    install_dependencies
    build_application
    test_ssh_connection
    create_remote_backup
    upload_files
    setup_env_variables
    restart_services
    verify_deployment
    
    log_success "¡Despliegue completado exitosamente!"
    
    echo -e "${GREEN}"
    cat << EOF

🎉 ¡AuditPro desplegado exitosamente!

🌐 Tu aplicación está disponible en el servidor
🔧 Para verificar el estado: ssh $SERVER_USER@$SERVER_HOST 'auditpro-status'
📊 Para ver logs: ssh $SERVER_USER@$SERVER_HOST 'tail -f /var/log/nginx/auditpro.access.log'

EOF
    echo -e "${NC}"
}

# Ejecutar despliegue
main "$@"
