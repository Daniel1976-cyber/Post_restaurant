require('dotenv').config();
const express = require("express");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(express.json());
app.use(express.static("public"));

const SUPABASE_URL        = "https://oyurzisrjxxdqkxcxzae.supabase.co";
const SUPABASE_ANON_KEY   = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95dXJ6aXNyanh4ZHFreGN4emFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5MzI5NjQsImV4cCI6MjA5MTUwODk2NH0.LFZiRwZNTpNh07Zdx2XgruCUmJbSv8O0NnklXw8Px_o";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95dXJ6aXNyanh4ZHFreGN4emFlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTkzMjk2NCwiZXhwIjoyMDkxNTA4OTY0fQ.dspjNRFGk9FVej1Cr_Vnp5xx308tvjdf4RloGNcKZm0";
const PORT = process.env.PORT || 3000;

console.log("\n🔑 Supabase URL:", SUPABASE_URL); 
console.log("🔑 Anon Key:   ",            SUPABASE_ANON_KEY   ? "✅" : "❌ ERROR");
console.log("🔑 Service Key:",            SUPABASE_SERVICE_KEY ? "✅" : "❌ ERROR");

const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false }
});
const supabase = supabaseAdmin;
const queryWithTimeout = async (promise, name, ms = 10000) => {
  let timeoutId;
  const timeout = new Promise((resolve) => {
    timeoutId = setTimeout(() => {
      resolve({ data: null, error: { message: `timeout after ${ms}ms` } });
    }, ms);
  });
  const result = await Promise.race([promise, timeout]);
  clearTimeout(timeoutId);
  if (result.error && result.error.message && result.error.message.includes('fetch failed')) {
    console.error(`❌ ${name}:`, result.error.message);
  }
  return result;
};

// ================================
// 🔧 CONFIG PUBLICA (solo anon key)
// ================================
app.get("/config", (req, res) => {
  res.json({ url: SUPABASE_URL, anonKey: SUPABASE_ANON_KEY });
});

// ================================
// 🧾 CREAR PEDIDO
// ================================
app.post("/pedido", async (req, res) => {
  const { data, error } = await supabase
    .from("pedidos")
    .insert([{ id: Date.now(), mesa: req.body.mesa, estado: "pendiente", total: 0 }])
    .select();
  if (error) return res.status(500).json(error);
  res.json(data[0]);
});

// ================================
// ➕ AGREGAR PRODUCTO AL PEDIDO
// ================================
app.post("/detalle", async (req, res) => {
  const item = req.body;
  const { error: errorDetalle } = await supabase.from("detalle").insert([item]);
  if (errorDetalle) return res.status(500).json(errorDetalle);

  const { data: producto, error: errorProducto } = await supabase
    .from("productos").select("*").eq("nombre", item.producto).single();
  if (errorProducto) return res.status(500).json(errorProducto);

  const { data: pedido, error: errorPedido } = await supabase
    .from("pedidos").select("*").eq("id", item.pedido_id).single();
  if (errorPedido) return res.status(500).json(errorPedido);

  const nuevoTotal = (pedido.total || 0) + producto.precio * item.cantidad;
  const { error: errorUpdate } = await supabase
    .from("pedidos").update({ total: nuevoTotal }).eq("id", pedido.id);
  if (errorUpdate) return res.status(500).json(errorUpdate);

  res.json({ ok: true });
});

// ================================
// 🔄 CAMBIAR ESTADO DEL PEDIDO
// ================================
app.post("/estado", async (req, res) => {
  const { id, estado } = req.body;
  const { error } = await supabase.from("pedidos").update({ estado }).eq("id", id);
  if (error) return res.status(500).json(error);
  res.json({ ok: true });
});

// ================================
// 📊 OBTENER TODOS LOS DATOS
// ================================
app.get("/data", async (req, res) => {
  const { data: pedidos, error: e1 } = await queryWithTimeout(
    supabase.from("pedidos").select("*").order("id", { ascending: false }),
    'pedidos'
  );
  const { data: detalle, error: e2 } = await queryWithTimeout(
    supabase.from("detalle").select("*"),
    'detalle'
  );
  const { data: productos, error: e3 } = await queryWithTimeout(
    supabase.from("productos").select("*"),
    'productos'
  );
  const { data: mesas, error: e4 } = await queryWithTimeout(
    supabase.from("mesas").select("*"),
    'mesas'
  );

  // Log any errors for debugging
  if (e1) console.error("❌ pedidos:",   e1);
  if (e2) console.error("❌ detalle:",   e2);
  if (e3) console.error("❌ productos:", e3);
  if (e4) console.error("❌ mesas:",     e4);

  res.json({
    pedidos:   pedidos   || [],
    detalle:   detalle   || [],
    productos: productos || [],
    mesas:     mesas     || []
  });
});

// ================================
// 🔢 CAMBIAR CANTIDAD
// ================================
app.post("/cambiar-cantidad", async (req, res) => {
  const { itemId, delta } = req.body;
  const { data: item, error: errorItem } = await supabase
    .from("detalle").select("*").eq("id", itemId).single();
  if (errorItem || !item) return res.status(500).json(errorItem || { message: "Item no encontrado" });

  const pedidoId = item.pedido_id;
  const nuevaCantidad = item.cantidad + delta;

  if (delta === -999 || nuevaCantidad <= 0) {
    await supabase.from("detalle").delete().eq("id", itemId);
  } else {
    await supabase.from("detalle").update({ cantidad: nuevaCantidad }).eq("id", itemId);
  }

  const { data: items } = await supabase.from("detalle").select("*").eq("pedido_id", pedidoId);
  let nuevoTotal = 0;
  for (const i of (items || [])) {
    const { data: producto } = await supabase.from("productos").select("precio").eq("nombre", i.producto).single();
    if (producto) nuevoTotal += producto.precio * i.cantidad;
  }
  await supabase.from("pedidos").update({ total: nuevoTotal }).eq("id", pedidoId);
  res.json({ ok: true });
});

// ================================
// 👤 CREAR USUARIO
// ================================
app.post("/crear-usuario", async (req, res) => {
  const { email, password, rol } = req.body;
  const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
    email, password, email_confirm: true
  });
  if (userError) return res.status(500).json(userError);
  const userId = userData.user.id;
  const { error: perfilError } = await supabaseAdmin.from("perfiles").insert([{ id: userId, rol }]);
  if (perfilError) return res.status(500).json(perfilError);
  res.json({ ok: true, userId });
});

// ================================
// 🔐 CREAR USUARIO ADMIN (con validación básica)
// ================================
app.post("/crear-admin", async (req, res) => {
  const { email, password, adminToken } = req.body;
  const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "admin_token_123";
  
  if (adminToken !== ADMIN_TOKEN) {
    return res.status(403).json({ error: "Admin token inválido" });
  }
  
  const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
    email, password, email_confirm: true
  });
  if (userError) return res.status(500).json(userError);
  const userId = userData.user.id;
  const { error: perfilError } = await supabaseAdmin.from("perfiles").insert([{ id: userId, rol: "admin" }]);
  if (perfilError) return res.status(500).json(perfilError);
  res.json({ ok: true, userId, rol: "admin" });
});

// ================================
// 📈 ESTADÍSTICAS ADMIN
// ================================
app.get("/admin/stats", async (req, res) => {
  const { data: pedidos, error: e1 } = await queryWithTimeout(
    supabaseAdmin.from("pedidos").select("*").order("id", { ascending: false }),
    'admin.pedidos'
  );
  const { data: detalle, error: e2 } = await queryWithTimeout(
    supabaseAdmin.from("detalle").select("*"),
    'admin.detalle'
  );
  const { data: productos, error: e3 } = await queryWithTimeout(
    supabaseAdmin.from("productos").select("*"),
    'admin.productos'
  );

  if (e1) console.error("❌ admin pedidos:", e1.message);
  if (e2) console.error("❌ admin detalle:", e2.message);
  if (e3) console.error("❌ admin productos:", e3.message);

  const all = pedidos || [];
  const pagados = all.filter(p => p.estado === "pagado");
  const activos = all.filter(p => p.estado !== "pagado");
  const totalRevenue = pagados.reduce((sum, p) => sum + (p.total || 0), 0);

  // Ventas de hoy (si tienen created_at)
  const hoy = new Date().toISOString().split("T")[0];
  const hoyPagados = pagados.filter(p => p.created_at && p.created_at.startsWith(hoy));
  const totalHoy = hoyPagados.reduce((sum, p) => sum + (p.total || 0), 0);

  // Top productos
  const productosCount = {};
  (detalle || []).forEach(d => {
    productosCount[d.producto] = (productosCount[d.producto] || 0) + d.cantidad;
  });
  const topProductos = Object.entries(productosCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([nombre, cantidad]) => {
      const prod = (productos || []).find(p => p.nombre === nombre);
      return { nombre, cantidad, precio: prod?.precio || 0 };
    });

  res.json({
    totalRevenue,
    totalHoy,
    pedidosPagados: pagados.length,
    pedidosActivos: activos.length,
    topProductos,
  });
});

// ================================
// 👥 GESTIÓN DE USUARIOS (ADMIN)
// ================================

// Listar todos los usuarios
app.get("/admin/usuarios", async (req, res) => {
  try {
    const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    if (authError) return res.status(500).json(authError);

    const { data: perfiles, error: perfError } = await supabaseAdmin.from("perfiles").select("*");
    if (perfError) return res.status(500).json(perfError);

    const usuarios = users.map(u => {
      const perfil = perfiles.find(p => p.id === u.id);
      return {
        id: u.id,
        email: u.email,
        rol: perfil ? perfil.rol : 'sin rol',
        created_at: u.created_at
      };
    });
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Eliminar usuario
app.delete("/admin/usuarios/:id", async (req, res) => {
  const { id } = req.params;
  const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
  if (error) return res.status(500).json(error);
  // También borrar el perfil por si acaso, aunque cascade debería funcionar si está configurado en Postgres
  await supabaseAdmin.from("perfiles").delete().eq("id", id);
  res.json({ ok: true });
});

// ================================
// 📋 GESTIÓN DE PRODUCTOS (ADMIN)
// ================================

app.post("/admin/productos", async (req, res) => {
  const { id, nombre, precio, categoria } = req.body;
  const payload = { nombre, precio: Number(precio), categoria };
  
  let result;
  if (id) {
    result = await supabaseAdmin.from("productos").update(payload).eq("id", id);
  } else {
    // Si no tiene ID, es nuevo. Usamos insert. Pero productos tiene un trigger o es serial?
    result = await supabaseAdmin.from("productos").insert([payload]);
  }

  if (result.error) return res.status(500).json(result.error);
  res.json({ ok: true });
});

app.delete("/admin/productos/:id", async (req, res) => {
  const { id } = req.params;
  const { error } = await supabaseAdmin.from("productos").delete().eq("id", id);
  if (error) return res.status(500).json(error);
  res.json({ ok: true });
});

// ================================
// 🪑 GESTIÓN DE MESAS (ADMIN)
// ================================

app.post("/admin/mesas", async (req, res) => {
  const { nombre } = req.body;
  const { error } = await supabaseAdmin.from("mesas").insert([{ nombre }]);
  if (error) return res.status(500).json(error);
  res.json({ ok: true });
});

app.delete("/admin/mesas/:id", async (req, res) => {
  const { id } = req.params;
  const { error } = await supabaseAdmin.from("mesas").delete().eq("id", id);
  if (error) return res.status(500).json(error);
  res.json({ ok: true });
});

// ================================
// 🚀 INICIAR SERVIDOR
// ================================
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n🍽️  Los Taínos POS corriendo en http://localhost:${PORT}\n`);
  });
}

module.exports = app;