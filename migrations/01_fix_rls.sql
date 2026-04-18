-- 1. Habilitar RLS en las tablas (si no lo están)
ALTER TABLE mesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE detalle ENABLE ROW LEVEL SECURITY;

-- 2. Políticas para 'mesas' (Lectura pública)
DROP POLICY IF EXISTS "Permitir lectura pública de mesas" ON mesas;
CREATE POLICY "Permitir lectura pública de mesas" ON mesas FOR SELECT USING (true);

-- 3. Políticas para 'productos' (Lectura pública)
DROP POLICY IF EXISTS "Permitir lectura pública de productos" ON productos;
CREATE POLICY "Permitir lectura pública de productos" ON productos FOR SELECT USING (true);

-- 4. Políticas para 'pedidos'
DROP POLICY IF EXISTS "Permitir lectura de pedidos" ON pedidos;
CREATE POLICY "Permitir lectura de pedidos" ON pedidos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir insertar pedidos" ON pedidos;
CREATE POLICY "Permitir insertar pedidos" ON pedidos FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir actualizar pedidos" ON pedidos;
CREATE POLICY "Permitir actualizar pedidos" ON pedidos FOR UPDATE USING (true);

-- 5. Políticas para 'detalle'
DROP POLICY IF EXISTS "Permitir lectura de detalle" ON detalle;
CREATE POLICY "Permitir lectura de detalle" ON detalle FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir insertar detalle" ON detalle;
CREATE POLICY "Permitir insertar detalle" ON detalle FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir actualizar detalle" ON detalle;
CREATE POLICY "Permitir actualizar detalle" ON detalle FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Permitir eliminar detalle" ON detalle;
CREATE POLICY "Permitir eliminar detalle" ON detalle FOR DELETE USING (true);
