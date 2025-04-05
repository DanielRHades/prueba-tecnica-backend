# Prueba Técnica Backend - Next.js con Apollo Server y GraphQL

## Explicación de Decisiones Técnicas

### 1. División de Resolvers y Types por Entidad
Se implementó una estructura de carpetas organizada por entidades (`users`, `countries`, `roles`, `sessions`, `userMonitorings`) para:
- Mejorar la mantenibilidad del código
- Separar claramente las responsabilidades
- Implementar tipos específicos para los argumentos de las queries

### 2. Estandarización de Errores
Se creó un sistema centralizado de manejo de errores para:
- Evitar la repetición de código en el manejo de errores
- Mantener consistencia en las respuestas de error
- Facilitar el debugging y monitoreo
- Implementar tipos de error específicos (VALIDATION, INTERNAL, etc.)

### 3. Implementación de DepthLimit
Se configuró un límite de profundidad de 3 niveles para:
- Prevenir bucles infinitos en consultas recursivas
- Optimizar el rendimiento de las consultas
- Proteger contra consultas maliciosas
- Mejorar la experiencia del usuario con mensajes de error claros

### 4. Consulta Raw SQL Segura
Se implemento la consulta Raw SQL con variables para:
- Prevenir inyecciones SQL
- Mantener la seguridad de la base de datos

### 5. Sistema de Paginación
Se implementó un sistema de paginación basado en cursor que:
- Utiliza el campo UUID como cursor
- Ordena los resultados de forma lexicográfica ascendente
- Limita los resultados a 10 registros por página
- Implementa skip para evitar duplicados entre páginas
- Optimiza el rendimiento de consultas grandes

### 6. Dockerización
Se implementó la containerización del proyecto para:
- Simplificar la configuración del entorno
- Facilitar el despliegue
- Mejorar la portabilidad

## Instrucciones para Ejecutar la Solución

### Requisitos Previos
- Node.js (versión 20 o superior)
- Docker
- PostgreSQL
- Variables de entorno configuradas (DATABASE_URL)

### Instalación
1. Clonar el repositorio
2. Instalar dependencias:
```bash
npm install
```

3. Generar el cliente de Prisma:
```bash
npx prisma generate
```

4. (Opcional) Ejecutar migraciones de la base de datos:

   En el archivo `Dockerfile` únicamente se ejecuta el comando `npx prisma generate`, ya que la imagen se construye utilizando un archivo `.env` (privado y local) que apunta a una base de datos remota en AWS que ya contiene datos y cuya estructura corresponde al archivo `schema.prisma`.

   Si deseas aplicar las migraciones localmente en una base de datos vacía (por ejemplo, para desarrollo o pruebas), puedes ejecutar:

```bash
npx prisma migrate dev
```

### Desarrollo
Para ejecutar el proyecto en modo desarrollo:
```bash
npm run dev
```

## Comandos Docker

### Construir la imagen
```bash
docker build -t prueba-tecnica-backend-nextjs .
```

### Ejecutar el contenedor
```bash
docker run --name backend-container -p 3000:3000 prueba-tecnica-backend-nextjs
```

## Propuesta de Despliegue

### Despliegue en AWS ECS con Fargate

Pasos para desplegar una imagen Docker en AWS ECS utilizando Fargate.

1.  **Configurar la CLI de AWS**

    Primero, asegúrate de tener la CLI de AWS instalada.

    Luego, configúrala con el comando:

    ```bash
    aws configure
    ```

    Completa con tus credenciales y la región deseada (ej. `us-east-2`):

    ```
    AWS Access Key ID [None]: <TU_ACCESS_KEY_ID>
    AWS Secret Access Key [None]: <TU_SECRET_ACCESS_KEY>
    Default region name [None]: <TU_REGION>
    Output format [None]: json
    ```

2.  **Crear usuario con permisos en IAM**

    Desde la consola de AWS:

    * Ve a **IAM > Users > Create User**.
    * Asigna un nombre al usuario.
    * Selecciona el tipo de acceso "Programmatic access".
    * Adjunta directamente la política **AmazonEC2ContainerRegistryFullAccess** a este usuario.

3.  **Crear y subir imagen a ECR**

    * **Crear repositorio en ECR:**

        ```bash
        aws ecr create-repository --repository-name prueba-tecnica-backend-repo
        ```

    * **Iniciar sesión en ECR:**

        ```bash
        aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.<tu-region>.amazonaws.com
        ```

        Reemplaza `<account-id>` y la región según corresponda.

    * **Etiquetar imagen local:**

        ```bash
        docker tag prueba-tecnica-backend-nextjs <account-id>[.dkr.ecr.<tu-region>.amazonaws.com/prueba-tecnica-backend-repo]
        ```

        Asegúrate de que `prueba-tecnica-backend-nextjs` sea el nombre de tu imagen local.

    * **Subir imagen al repositorio:**

        ```bash
        docker push <account-id>[.dkr.ecr.<tu-region>.amazonaws.com/prueba-tecnica-backend-repo]
        ```

4.  **Crear un IAM Role para ECS**

    Desde la consola de AWS:

    * Ve a **IAM > Roles > Create role**.
    * Selecciona **AWS service** como el tipo de entidad confiable.
    * Elige el caso de uso **Elastic Container Service** y luego **Elastic Container Service Task**.
    * Adjunta la política **AmazonECSTaskExecutionRolePolicy**.
    * Asigna el nombre **ecsTaskExecutionRole** a este rol.

5.  **Crear Task Definition**

    * Ir a **ECS > Task Definitions > Create new Task Definition**.
    * Selecciona **Fargate** como launch type.
    * Configura la definición de tarea:
        * **Task definition family name:** `prueba-tecnica-backend-task`
        * **Task Role:** `ecsTaskExecutionRole`
        * **CPU / Memory:** `0.5 vCPU`, `1 GB` (ajusta según tus necesidades)
    * En **Container definitions > Add container**:
        * **Name:** `backend`
        * **Image:** `URI de tu imagen en ECR` (ej. `<account-id>.dkr.ecr.<tu-region>.amazonaws.com/prueba-tecnica-backend-repo`)
        * **Port mappings:** `3000` (o el puerto que expone tu aplicación en el Dockerfile)

6.  **Crear Cluster ECS**

    * Ve a **ECS > Clusters > Create Cluster**.
    * Selecciona el tipo **Networking only (Fargate)**.
    * Asigna el nombre **prueba-tecnica-backend-cluster**.
    * Haz clic en **Crear**.

7.  **Crear Servicio**

    * Ve a tu Cluster (`prueba-tecnica-backend-cluster`) y haz clic en **Crear > Create Service**.
    * Configura el servicio:
        * **Launch type:** `Fargate`
        * **Task definition:** selecciona la tarea que creaste (`prueba-tecnica-backend-task`)
        * **Service name:** `backend-service`
        * **Number of tasks:** `1` (ajusta según la escalabilidad deseada)
    * En la sección de red:
        * **VPC:** selecciona tu VPC default.
        * **Subnets:** selecciona al menos dos subredes públicas.
        * **Auto-assign public IP:** `ENABLED`.
        * **Security Group:**
            * Crea un nuevo Security Group.
            * Agrega una regla de entrada para permitir tráfico TCP en el puerto `3000` desde `0.0.0.0/0` (esto es solo para pruebas; en producción, restringe el acceso).
    * Haz clic en **Continuar** y luego en **Lanzar el servicio**.

### Despliegue en AWS Lambda con Apollo Server

1. **Adaptar el servidor Apollo a Lambda**  
   Ya se ha integrado `@as-integrations/aws-lambda` para exportar un handler compatible con Lambda.

2. **Configurar API Gateway**  
   Crear una API HTTP en API Gateway que apunte al handler Lambda.

3. **Variables de entorno**  
   Definir las variables necesarias (como `DATABASE_URL`) en la configuración del Lambda o utilizando AWS Systems Manager (SSM).

4. **Base de datos**  
   Si se usa RDS (PostgreSQL en la nube), se puede acceder desde Lambda dentro de una VPC si se requiere acceso privado.