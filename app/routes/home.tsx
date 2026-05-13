import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import { supabase } from "../supabase";
import { Form } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function loader() {
  // Consultamos todos los registros de la nueva tabla 'tarea_test'
  const { data: tareas, error } = await supabase.from("tarea_test").select("*");

  if (error) {
    console.error("Error al obtener tareas:", error);
    return { tareas: [] };
  }

  return { tareas };
}

export async function action({ request }: Route.ActionArgs) {
  // Esta función atrapa los datos del formulario cuando el usuario hace clic en "Agregar"
  const formData = await request.formData();
  const nombre = formData.get("nombre");

  if (typeof nombre === "string" && nombre.trim().length > 0) {
    // Insertamos la nueva tarea en la base de datos local
    const { error } = await supabase.from("tarea_test").insert([{ nombre, completada: false }]);
    if (error) console.error("Error al guardar la tarea:", error);
  }
  return null; // React Router volverá a ejecutar el "loader" automáticamente para recargar la lista
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { tareas } = loaderData;

  return (
    <main className="p-8 font-sans container mx-auto">
      <h1 className="text-3xl font-bold mb-6">Mis Tareas (Desde Supabase Local)</h1>
      
      <Form method="post" className="mb-8 flex gap-2 max-w-md">
        <input
          type="text"
          name="nombre"
          placeholder="Escribe una nueva tarea..."
          className="border border-gray-300 rounded px-4 py-2 flex-grow text-black"
          required
        />
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded font-medium hover:bg-blue-700 cursor-pointer">
          Agregar
        </button>
      </Form>

      {tareas && tareas.length > 0 ? (
        <ul className="list-disc pl-6 mb-12 text-lg space-y-2">
          {tareas.map((tarea: any) => (
            <li key={tarea.id}>
              {tarea.nombre} - {tarea.completada ? "✅ Completada" : "⏳ Pendiente"}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mb-12 text-gray-500">No hay tareas creadas. ¡Ve al Studio y agrega algunas!</p>
      )}

      <div className="border-t pt-8">
        <Welcome />
      </div>
    </main>
  );
}
