require('dotenv').config();
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL || "https://oyurzisrjxxdqkxcxzae.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95dXJ6aXNyanh4ZHFreGN4emFlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTkzMjk2NCwiZXhwIjoyMDkxNTA4OTY0fQ.dspjNRFGk9FVej1Cr_Vnp5xx308tvjdf4RloGNcKZm0";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false }
});

// Datos iniciales de mesas
const mesasIniciales = [
  { nombre: "Mesa 1" },
  { nombre: "Mesa 2" },
  { nombre: "Mesa 3" },
  { nombre: "Mesa 4" },
  { nombre: "Mesa 5" },
  { nombre: "Mesa 6" },
  { nombre: "Mesa 7" },
  { nombre: "Mesa 8" }
];

// Datos iniciales de productos
const productosIniciales = [
  { nombre: "La Bandera", precio: 450, categoria: "Platos Fuertes" },
  { nombre: "Sancocho Dominicano", precio: 350, categoria: "Platos Fuertes" },
  { nombre: "Mangu con Tres Golpes", precio: 280, categoria: "Platos Fuertes" },
  { nombre: "Pechuga de Pollo", precio: 320, categoria: "Platos Fuertes" },
  { nombre: "Churrasco", precio: 450, categoria: "Platos Fuertes" },
  { nombre: "Arroz con Pollo", precio: 300, categoria: "Platos Fuertes" },
  { nombre: "Pica Pollo", precio: 280, categoria: "Platos Fuertes" },
  { nombre: "Locrio de Camarones", precio: 420, categoria: "Platos Fuertes" },
  { nombre: "Jugo de Naranja", precio: 80, categoria: "Bebidas" },
  { nombre: "Jugo de Chinola", precio: 80, categoria: "Bebidas" },
  { nombre: "Jugo de Guanabana", precio: 85, categoria: "Bebidas" },
  { nombre: "Refresco", precio: 50, categoria: "Bebidas" },
  { nombre: "Agua", precio: 35, categoria: "Bebidas" },
  { nombre: "Café", precio: 45, categoria: "Bebidas" },
  { nombre: "Té", precio: 40, categoria: "Bebidas" },
  { nombre: "Flan", precio: 120, categoria: "Postres" },
  { nombre: "Tres Leches", precio: 150, categoria: "Postres" },
  { nombre: "Helado", precio: 100, categoria: "Postres" },
  { nombre: "Majarete", precio: 110, categoria: "Postres" },
  { nombre: "Arroz con Leche", precio: 100, categoria: "Postres" }
];

async function inicializarDatos() {
  console.log("🔄 Inicializando datos en Supabase...");

  // Insertar mesas
  console.log("📋 Insertando mesas...");
  const { data: mesas, error: errorMesas } = await supabase
    .from("mesas")
    .insert(mesasIniciales)
    .select();

  if (errorMesas) {
    console.error("❌ Error al insertar mesas:", errorMesas);
  } else {
    console.log("✅ Mesas insertadas correctamente:", mesas.length, "mesas");
  }

  // Insertar productos
  console.log("🍽️ Insertando productos...");
  const { data: productos, error: errorProductos } = await supabase
    .from("productos")
    .insert(productosIniciales)
    .select();

  if (errorProductos) {
    console.error("❌ Error al insertar productos:", errorProductos);
  } else {
    console.log("✅ Productos insertados correctamente:", productos.length, "productos");
  }

  console.log("🎉 Inicialización completada!");
}

inicializarDatos().catch(console.error);
