# Guía Paso a Paso: Integración de Supabase Local con React Router

Esta guía está diseñada para principiantes. Te enseñará cómo configurar un entorno de desarrollo profesional donde tu base de datos de Supabase vivirá en tu computadora para hacer pruebas, y se actualizará automáticamente en la nube cuando subas tu código a GitHub.

---

## Requisitos Previos

Antes de empezar, asegúrate de tener instalado lo siguiente en tu computadora:

1. **Node.js**: Para ejecutar comandos de `npm` o `npx`.
2. **Git**: Para el control de versiones.
3. **Docker Desktop**: **¡MUY IMPORTANTE!** Es el motor que permite ejecutar una mini-versión de Supabase en tu computadora. Debes descargarlo desde docker.com, instalarlo y **mantenerlo abierto** en segundo plano mientras trabajas.
4. Una cuenta en Supabase con un proyecto ya creado.
5. Una cuenta en GitHub con tu proyecto ya subido a un repositorio.

---

## Paso 1: Instalar la Herramienta de Supabase (CLI)

Abre tu terminal en la carpeta de tu proyecto y ejecuta este comando. Esto instala las herramientas de Supabase en tu proyecto para que puedas usar los comandos.

```bash
npm install supabase --save-dev
```

## Paso 2: Inicializar Supabase en el Proyecto

Este comando crea una nueva carpeta llamada `supabase` en tu proyecto. Aquí se guardará la configuración y las "migraciones" (archivos que indican cómo crear tus tablas).

```bash
npx supabase init
```

## Paso 3: Iniciar Sesión en la Terminal

Tu terminal necesita permiso para conectarse a tu cuenta de Supabase.

**Paso recomendado (usando un Token manual para evitar errores):**

1. Ve a la página web de Supabase.
2. Entra a: `Configuración de tu cuenta (Avatar) > Access Tokens`.
3. Haz clic en **Generate new token**, ponle un nombre y copia el código que empieza con `sbp_...`.
4. En tu terminal, ejecuta este comando reemplazando con tu token:

```bash
npx supabase login --token sbp_aqui_va_tu_token_largo
```

## Paso 4: Vincular tu Proyecto Local con la Nube (Link)

Ahora le diremos a tu código a qué proyecto específico de Supabase pertenece.
Necesitarás el **Reference ID** de tu proyecto (lo encuentras en la URL de tu panel de Supabase: `<https://supabase.com/dashboard/project/ESTE-ES-EL-ID>`).

```bash
npx supabase link --project-ref TU_ID_DE_PROYECTO
```

_Nota: Te pedirá la contraseña de tu base de datos (la que creaste al fundar el proyecto)._

## Paso 5: Descargar Tablas Existentes (Pull)

_(Asegúrate de que Docker Desktop esté abierto y funcionando antes de este paso)._
Si ya habías creado tablas manualmente en la página web de Supabase, este comando las descargará y creará un archivo SQL en tu proyecto para que no las pierdas.

```bash
npx supabase db pull
```

## Paso 6: Crear una Nueva Tabla (Migración)

En lugar de ir a la web a crear tablas, ahora lo harás desde el código. Para crear un archivo para una nueva tabla, ejecuta:

```bash
npx supabase migration new crear_mi_nueva_tabla
```

Esto crea un archivo `.sql` dentro de la carpeta `supabase/migrations`. Ábrelo y escribe el código SQL para tu tabla. Por ejemplo:

```sql
CREATE TABLE tareas (
  id SERIAL PRIMARY KEY,
  titulo TEXT NOT NULL,
  completada BOOLEAN DEFAULT false
);
```

## Paso 7: Encender tu Base de Datos Local

Este es el comando mágico que usa Docker para crear un servidor de Supabase en tu propia computadora.

```bash
npx supabase start
```

_(La primera vez puede tardar unos minutos en descargar todo. Sé paciente)._

Al terminar, **te mostrará unas credenciales verdes en la terminal**. Copia la `API URL` y la `anon key`.

## Paso 8: Configurar Variables de Entorno (.env)

Para que tu aplicación web sepa a qué base de datos conectarse, debes crear un archivo llamado **exactamente** `.env` en la raíz de tu proyecto (junto al `package.json`).

Pega las credenciales que te dio el paso anterior de esta forma:

```env
VITE_SUPABASE_URL="http://127.0.0.1:54321"
VITE_SUPABASE_ANON_KEY="tu_anon_key_larguisima_aqui"
```

_Estas variables empiezan con `VITE_` porque React Router v7 usa Vite por debajo._

## Paso 9: Instalar el Cliente de Supabase para React

Abre una nueva pestaña en tu terminal (para no cerrar la que está corriendo Supabase) y ejecuta:

```bash
npm install @supabase/supabase-js
```

## Paso 10: Crear el Archivo de Conexión

Crea un archivo llamado `supabase.ts` dentro de la carpeta `app/`. Este archivo lee tus variables de entorno y crea el "puente" entre tu código React y tu base de datos.

**app/supabase.ts**

```typescript
import { createClient } from "@supabase/supabase-js";

// Leer las variables del archivo .env local
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Exportar el cliente conectado
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

## Paso 11: ¡Subir a GitHub y Ver la Magia Automática!

Por último, solo necesitas guardar todos tus cambios (incluyendo tu nueva carpeta `supabase/migrations`) y subirlos a GitHub como lo haces normalmente:

```bash
git add .
git commit -m "Configura Supabase local y crea tabla de tareas"
git push origin develop
```

**¿Qué pasa después?**
Si configuraste la Integración de GitHub en el panel web de Supabase:

1. Al hacer este "push", Supabase detectará tu archivo de migración.
2. Supabase ejecutará automáticamente el archivo `.sql` en tu entorno de prueba en la nube.
3. ¡Tu tabla se creará sola en la nube sin que tengas que mover un dedo!

---

## Paso 13: Flujo de Trabajo Profesional (Ramas main y develop)
Para trabajar de forma segura y en equipo, te recomendamos esta estrategia:

1. **Local (Tu computadora):** Escribes código, creas migraciones (`.sql`) y pruebas todo con Docker localmente sin afectar a nadie.
2. **Rama `develop` (Entorno de Prueba):** Cuando haces `git push origin develop`, Supabase detecta los cambios y ejecuta las migraciones en tu base de datos de prueba (Preview Branch). Ideal para que pruebes tu aplicación antes del lanzamiento.
3. **Rama `main` (Producción):** Cuando todo funciona perfecto en `develop`, unes el código a `main` (mediante un Pull Request). Supabase aplicará esos mismos cambios de forma segura a tu base de datos real.

## Paso 14: Sincronizar Tablas del Panel Local al Código (Reset)
Si creaste una tabla de forma visual desde el panel de control local de Supabase (`http://127.0.0.1:54323`), debes guardarla en tu código para que pueda subir a la nube:

1. Genera un archivo de migración en blanco:
```bash
npx supabase migration new crear_tabla_tarea_test
```
2. Abre el archivo generado en `supabase/migrations/` y pega la definición SQL de tu tabla.
3. Aplica la migración limpiando la base de datos local con este comando:
```bash
npx supabase db reset
```
*Este comando borra la base de datos local y la reconstruye estrictamente usando tus archivos `.sql`, asegurando que tu código sea la única fuente de la verdad.*

## Paso 15: Leer y Guardar Datos en React Router
React Router v7 usa funciones llamadas `loader` (para leer datos antes de mostrar la página) y `action` (para atrapar envíos de formularios).

Ejemplo básico de cómo mostrar y agregar datos en `app/routes/home.tsx`:

```tsx
import { Form } from "react-router";
import { supabase } from "../supabase";
import type { Route } from "./+types/home";

// 1. LEER DATOS: Se ejecuta en el servidor antes de cargar la pantalla
export async function loader() {
  const { data: tareas, error } = await supabase.from("tarea_test").select("*");
  if (error) console.error(error);
  return { tareas: tareas || [] };
}

// 2. GUARDAR DATOS: Se ejecuta cuando envías un formulario (POST)
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const nombre = formData.get("nombre");

  if (typeof nombre === "string" && nombre.trim().length > 0) {
    const { error } = await supabase.from("tarea_test").insert([{ nombre, completada: false }]);
    if (error) console.error(error);
  }
  return null; // React Router recargará automáticamente la lista
}

// 3. MOSTRAR LA INTERFAZ
export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <main>
      <Form method="post">
        <input type="text" name="nombre" placeholder="Nueva tarea..." />
        <button type="submit">Agregar</button>
      </Form>
    </main>
  );
}
```

---

## Paso 16: Despliegue en Netlify (Producción)
Cuando estés listo para subir tu página a internet, Netlify es una excelente opción. Así debes configurarlo:

1. Crea un nuevo sitio en Netlify importando tu repositorio de GitHub.
2. En **Build settings**:
   * **Branch to deploy**: `main` (o la rama que uses para producción)
   * **Build command**: `npm run build`
   * **Publish directory**: `build/client`
3. En **Environment variables** (¡Muy importante!):
   * Agrega `VITE_SUPABASE_URL` y pega la URL real de tu proyecto en la nube (la encuentras en Supabase > *Settings > API*).
   * Agrega `VITE_SUPABASE_ANON_KEY` y pega la llave pública real de tu proyecto en la nube.
4. Haz clic en **Deploy**.

*Nota: Al poner estas variables de entorno en Netlify, le estamos diciendo a nuestra aplicación que cuando esté en internet (producción) use la base de datos real, ignorando las credenciales locales que usábamos en nuestra computadora.*

---

### 🛑 Apagar el Servidor Local

Cuando termines de trabajar por el día y quieras apagar el servidor local de Supabase y liberar espacio en Docker, ejecuta:

```bash
npx supabase stop
```

```

¡Este documento te servirá como una excelente guía de referencia o "chuleta"! Puedes abrirlo en tu editor de código o en GitHub para repasarlo cuando quieras.

¿Hay algún paso en la guía en el que te gustaría que profundicemos ahora mismo, o quieres que probemos hacer una consulta a la base de datos en tu página principal (`home.tsx`)?

<!--
[PROMPT_SUGGESTION]¿Me muestras un ejemplo de cómo leer los datos de mi base de datos en home.tsx?[/PROMPT_SUGGESTION]
[PROMPT_SUGGESTION]¿Qué hago si me equivoco al escribir un archivo SQL en la migración?[/PROMPT_SUGGESTION]


npm install @supabase/supabase-js

@@ -128,7 +140,7 @@

**¿Qué pasa después?**
Si configuraste la Integración de GitHub en el panel web de Supabase:
-1. Al hacer este "push", Supabase detectará tu archivo de migración.
+1. Al hacer este "push" y posteriormente un **Pull Request** en GitHub, Supabase detectará tus cambios.
2. Supabase ejecutará automáticamente el archivo `.sql` en tu entorno de prueba en la nube.
3. ¡Tu tabla se creará sola en la nube sin que tengas que mover un dedo!

```
