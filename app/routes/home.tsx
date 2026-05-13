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
  const formData = await request.formData();
  const intent = formData.get("intent"); // Identificamos qué acción quiere hacer el usuario

  // Si la intención es CREAR una tarea nueva
  if (intent === "create") {
    const nombre = formData.get("nombre");
    if (typeof nombre === "string" && nombre.trim().length > 0) {
      const { error } = await supabase.from("tarea_test").insert([{ nombre, completada: false }]);
      if (error) console.error("Error al guardar la tarea:", error);
    }
  } 
  // Si la intención es ACTUALIZAR (marcar completada/pendiente)
  else if (intent === "toggle") {
    const id = formData.get("id");
    const completadaActual = formData.get("completada") === "true"; // Convertimos el texto a boolean
    
    if (id) {
      // Actualizamos invirtiendo el valor actual de 'completada'
      const { error } = await supabase.from("tarea_test").update({ completada: !completadaActual }).eq("id", id);
      if (error) console.error("Error al actualizar la tarea:", error);
    }
  }
  return null;
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { tareas } = loaderData;

  return (
    <main className="p-8 font-sans container mx-auto">
      <h1 className="text-3xl font-bold mb-6">Mis Tareas (Desde Supabase Local)</h1>
      
      <Form method="post" className="mb-8 flex gap-2 max-w-md">
        <input type="hidden" name="intent" value="create" />
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
            <li key={tarea.id} className="flex items-center gap-4 mb-2">
              <span className={tarea.completada ? "line-through text-gray-500" : ""}>
                {tarea.nombre} - {tarea.completada ? "✅ Completada" : "⏳ Pendiente"}
              </span>
              
              {/* Formulario individual para cada tarea */}
              <Form method="post">
                <input type="hidden" name="intent" value="toggle" />
                <input type="hidden" name="id" value={tarea.id} />
                <input type="hidden" name="completada" value={tarea.completada?.toString()} />
                <button type="submit" className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-black cursor-pointer">
                  {tarea.completada ? "Deshacer" : "Completar"}
                </button>
              </Form>
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
