# Integración con FileMaker - Guía de Configuración

Esta aplicación AuditPro puede conectarse directamente con FileMaker Pro/Server usando la FileMaker Data API. Sigue esta guía para configurar la integración.

## 📋 Prerrequisitos

### FileMaker Server

- FileMaker Server 16 o superior
- FileMaker Data API habilitada
- Certificado SSL válido (recomendado para producción)

### Base de Datos FileMaker

- FileMaker Pro Advanced (para desarrollo)
- Privilegios de acceso configurados para API

## 🏗️ Estructura de la Base de Datos

### Tablas Requeridas

#### 1. Tabla: Audits

```
Campos requeridos:
- ID (Número, Clave primaria, Auto-entrada)
- Name (Texto)
- Type (Texto)
- Status (Texto)
- Progress (Número)
- DueDate (Fecha)
- Auditor (Texto)
- CreatedDate (Fecha)
- Description (Texto)
- NonConformityCount (Número, Calculado)
- EvidenceCount (Número, Calculado)
```

#### 2. Tabla: NonConformities

```
Campos requeridos:
- ID (Número, Clave primaria, Auto-entrada)
- Code (Texto, Único)
- Title (Texto)
- Description (Texto)
- AuditID (Número, Clave foránea)
- Audit (Texto)
- AuditType (Texto)
- Severity (Texto)
- Status (Texto)
- Assignee (Texto)
- Reporter (Texto)
- DueDate (Fecha)
- CreatedDate (Fecha)
- ClosedDate (Fecha)
- Category (Texto)
- Evidence (Texto)
- RootCause (Texto)
- CorrectiveAction (Texto)
```

#### 3. Tabla: Evidence

```
Campos requeridos:
- ID (Número, Clave primaria, Auto-entrada)
- AuditID (Número, Clave foránea)
- Name (Texto)
- Type (Texto)
- Size (Texto)
- UploadDate (Fecha)
- Description (Texto)
- Category (Texto)
- File (Contenedor)
```

#### 4. Tabla: Comments

```
Campos requeridos:
- ID (Número, Clave primaria, Auto-entrada)
- NonConformityID (Número, Clave foránea)
- Author (Texto)
- Content (Texto)
- Date (Marca de tiempo)
- Type (Texto)
```

### Layouts para API

Crea los siguientes layouts optimizados para la API:

#### 1. Layout: Audits_API

- Basado en tabla: Audits
- Incluir todos los campos de la tabla
- Sin botones ni elementos de navegación

#### 2. Layout: NonConformities_API

- Basado en tabla: NonConformities
- Incluir todos los campos de la tabla
- Sin botones ni elementos de navegación

#### 3. Layout: Evidence_API

- Basado en tabla: Evidence
- Incluir todos los campos de la tabla
- Campo contenedor para archivos

#### 4. Layout: Comments_API

- Basado en tabla: Comments
- Incluir todos los campos de la tabla

## 🔐 Configuración de Seguridad

### 1. Crear Usuario API

```
Nombre de cuenta: api_user
Contraseña: [contraseña segura]
Conjunto de privilegios: API_Access
```

### 2. Conjunto de Privilegios: API_Access

```
Datos:
- Audits: Crear, Editar, Eliminar, Ver registros
- NonConformities: Crear, Editar, Eliminar, Ver registros
- Evidence: Crear, Editar, Eliminar, Ver registros
- Comments: Crear, Editar, Eliminar, Ver registros

Layouts:
- Audits_API: Ver únicamente
- NonConformities_API: Ver únicamente
- Evidence_API: Ver únicamente
- Comments_API: Ver únicamente

Acceso extendido:
- Fmrest: Habilitado
```

### 3. Habilitar Data API en FileMaker Server

1. Abrir FileMaker Server Admin Console
2. Ir a Configuración > General
3. Habilitar "FileMaker Data API"
4. Configurar puerto (443 por defecto)
5. Reiniciar servicios si es necesario

## ⚙️ Configuración de la Aplicación React

### 1. Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
REACT_APP_FILEMAKER_SERVER=tu-servidor-filemaker.com
REACT_APP_FILEMAKER_DATABASE=AuditPro
REACT_APP_FILEMAKER_USERNAME=api_user
REACT_APP_FILEMAKER_PASSWORD=tu_contraseña_segura
```

### 2. Configuración SSL

Para desarrollo local con certificados auto-firmados:

```env
REACT_APP_FILEMAKER_SSL_VERIFY=false
```

Para producción siempre usar:

```env
REACT_APP_FILEMAKER_SSL_VERIFY=true
```

## 🧪 Pruebas de Conexión

### 1. Verificar API Disponible

```bash
curl -X POST https://tu-servidor.com/fmi/data/vLatest/databases/AuditPro/sessions \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic [base64(usuario:contraseña)]"
```

### 2. Respuesta Exitosa

```json
{
  "response": {
    "token": "token-de-sesion"
  },
  "messages": [
    {
      "code": "0",
      "message": "OK"
    }
  ]
}
```

## 📊 Campos Calculados Recomendados

### En tabla Audits:

```
NonConformityCount:
Count(NonConformities::ID)

EvidenceCount:
Count(Evidence::ID)
```

### En tabla NonConformities:

```
DaysOverdue:
If(Status ≠ "Cerrada" and DueDate < Get(CurrentDate);
   Get(CurrentDate) - DueDate;
   "")
```

## 🔄 Relaciones

Configura las siguientes relaciones:

```
Audits::ID = NonConformities::AuditID
Audits::ID = Evidence::AuditID
NonConformities::ID = Comments::NonConformityID
```

## 🚀 Despliegue

### Desarrollo

1. Usar FileMaker Pro Advanced
2. Habilitar Data API localmente
3. Usar certificados auto-firmados

### Producción

1. FileMaker Server con certificado SSL válido
2. Configurar firewall para puerto 443
3. Backup automatizado de la base de datos
4. Monitoreo de logs de API

## 🛠️ Solución de Problemas

### Error de Autenticación

- Verificar credenciales en `.env.local`
- Confirmar que el usuario tiene privilegios API
- Revisar que Data API esté habilitada

### Error de SSL

- Para desarrollo: Establecer `SSL_VERIFY=false`
- Para producción: Instalar certificado válido

### Error de Layout

- Verificar que los layouts existan
- Confirmar nombres exactos en `LAYOUTS` constante
- Revisar privilegios de acceso a layouts

### Error de Conexión

- Verificar URL del servidor
- Confirmar que puerto 443 esté abierto
- Revisar estado de FileMaker Server

## 📞 Soporte

Para soporte técnico:

1. Revisar logs de FileMaker Server
2. Verificar console de desarrollador del navegador
3. Comprobar Network tab para requests fallidos

## 🔧 Campos Adicionales Opcionales

Puedes agregar estos campos para funcionalidad extendida:

### Tabla Audits:

- Location (Texto)
- Department (Texto)
- AuditStandard (Texto)
- LeadAuditor (Texto)
- AuditTeam (Texto)

### Tabla NonConformities:

- Impact (Texto)
- Priority (Número)
- CostEstimate (Número)
- ResponsibleDepartment (Texto)

¡Con esta configuración tendrás una integración completa entre AuditPro y FileMaker!
