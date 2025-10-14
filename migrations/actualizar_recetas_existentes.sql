-- =============================================================================
-- SCRIPT: ACTUALIZAR RECETAS EXISTENTES
-- =============================================================================
-- Descripción: Asigna líneas, sublíneas y tiempos de preparación a recetas
-- Fecha: 2024-12-14
-- =============================================================================

-- PASO 1: Verificar las categorías de receta existentes
SELECT 
    id,
    nombre,
    isreceta
FROM inv_categorias
WHERE isreceta = 1
ORDER BY nombre;

-- PASO 2: Ver las líneas existentes para categorías de receta
SELECT 
    l.id,
    l.codigo,
    l.nombre AS nombre_linea,
    c.nombre AS categoria,
    c.isreceta
FROM inv_lineas l
INNER JOIN inv_categorias c ON l.id_categoria = c.id
WHERE c.isreceta = 1
ORDER BY c.nombre, l.nombre;

-- PASO 3: Ver las sublíneas existentes
SELECT 
    s.id,
    s.codigo,
    s.nombre AS nombre_sublinea,
    l.nombre AS nombre_linea,
    c.nombre AS categoria,
    c.isreceta
FROM inv_sublineas s
INNER JOIN inv_lineas l ON s.id_linea = l.id
INNER JOIN inv_categorias c ON l.id_categoria = c.id
WHERE c.isreceta = 1
ORDER BY c.nombre, l.nombre, s.nombre;

-- PASO 4: Ver las recetas existentes sin líneas/sublíneas asignadas
SELECT 
    p.id,
    p.codigo,
    p.nombre,
    p.id_categoria,
    p.id_sublineas,
    p.tipo_menu,
    p.id_clase_servicio,
    c.nombre AS categoria,
    c.isreceta,
    cs.nombre AS clase_servicio
FROM inv_productos p
LEFT JOIN inv_categorias c ON p.id_categoria = c.id
LEFT JOIN inv_clase_servicios cs ON p.id_clase_servicio = cs.id
WHERE (c.isreceta = 1 OR p.id_clase_servicio IS NOT NULL)
ORDER BY p.nombre;

-- PASO 5: Ver las recetas y sus utilidades (tiempo de preparación)
SELECT 
    p.id,
    p.nombre,
    p.tipo_menu,
    u.tiempo_preparacion,
    u.id AS utilidad_id
FROM inv_productos p
LEFT JOIN inv_utilidades_producto u ON p.id_producto = u.id
LEFT JOIN inv_categorias c ON p.id_categoria = c.id
WHERE (c.isreceta = 1 OR p.id_clase_servicio IS NOT NULL)
ORDER BY p.nombre;

-- =============================================================================
-- ACTUALIZACIÓN DE RECETAS
-- =============================================================================

-- Primero, crear/verificar líneas para recetas si no existen
-- Nota: Ajustar según las categorías de receta existentes en tu base de datos

-- Ejemplo: Crear línea de "Platos principales" si no existe
INSERT INTO inv_lineas (codigo, nombre, id_categoria, estado)
SELECT 'LR001', 'PLATOS PRINCIPALES', id, 1
FROM inv_categorias
WHERE isreceta = 1 AND nombre ILIKE '%comida%'
AND NOT EXISTS (
    SELECT 1 FROM inv_lineas WHERE codigo = 'LR001'
)
LIMIT 1;

-- Ejemplo: Crear línea de "Bebidas" si no existe
INSERT INTO inv_lineas (codigo, nombre, id_categoria, estado)
SELECT 'LR002', 'BEBIDAS', id, 1
FROM inv_categorias
WHERE isreceta = 1 AND nombre ILIKE '%bebida%'
AND NOT EXISTS (
    SELECT 1 FROM inv_lineas WHERE codigo = 'LR002'
)
LIMIT 1;

-- Ejemplo: Crear línea de "Postres" si no existe
INSERT INTO inv_lineas (codigo, nombre, id_categoria, estado)
SELECT 'LR003', 'POSTRES', id, 1
FROM inv_categorias
WHERE isreceta = 1 AND nombre ILIKE '%postre%'
AND NOT EXISTS (
    SELECT 1 FROM inv_lineas WHERE codigo = 'LR003'
)
LIMIT 1;

-- Crear sublíneas para cada línea
-- Sublíneas para Platos Principales
INSERT INTO inv_sublineas (codigo, nombre, id_linea, estado)
SELECT 'SLR001', 'CARNES', id, 1
FROM inv_lineas
WHERE codigo = 'LR001'
AND NOT EXISTS (
    SELECT 1 FROM inv_sublineas WHERE codigo = 'SLR001'
);

INSERT INTO inv_sublineas (codigo, nombre, id_linea, estado)
SELECT 'SLR002', 'PESCADOS', id, 1
FROM inv_lineas
WHERE codigo = 'LR001'
AND NOT EXISTS (
    SELECT 1 FROM inv_sublineas WHERE codigo = 'SLR002'
);

INSERT INTO inv_sublineas (codigo, nombre, id_linea, estado)
SELECT 'SLR003', 'AVES', id, 1
FROM inv_lineas
WHERE codigo = 'LR001'
AND NOT EXISTS (
    SELECT 1 FROM inv_sublineas WHERE codigo = 'SLR003'
);

INSERT INTO inv_sublineas (codigo, nombre, id_linea, estado)
SELECT 'SLR004', 'PASTAS', id, 1
FROM inv_lineas
WHERE codigo = 'LR001'
AND NOT EXISTS (
    SELECT 1 FROM inv_sublineas WHERE codigo = 'SLR004'
);

INSERT INTO inv_sublineas (codigo, nombre, id_linea, estado)
SELECT 'SLR005', 'VEGETARIANOS', id, 1
FROM inv_lineas
WHERE codigo = 'LR001'
AND NOT EXISTS (
    SELECT 1 FROM inv_sublineas WHERE codigo = 'SLR005'
);

-- Sublíneas para Bebidas
INSERT INTO inv_sublineas (codigo, nombre, id_linea, estado)
SELECT 'SLR006', 'CALIENTES', id, 1
FROM inv_lineas
WHERE codigo = 'LR002'
AND NOT EXISTS (
    SELECT 1 FROM inv_sublineas WHERE codigo = 'SLR006'
);

INSERT INTO inv_sublineas (codigo, nombre, id_linea, estado)
SELECT 'SLR007', 'FRIAS', id, 1
FROM inv_lineas
WHERE codigo = 'LR002'
AND NOT EXISTS (
    SELECT 1 FROM inv_sublineas WHERE codigo = 'SLR007'
);

INSERT INTO inv_sublineas (codigo, nombre, id_linea, estado)
SELECT 'SLR008', 'JUGOS NATURALES', id, 1
FROM inv_lineas
WHERE codigo = 'LR002'
AND NOT EXISTS (
    SELECT 1 FROM inv_sublineas WHERE codigo = 'SLR008'
);

-- Sublíneas para Postres
INSERT INTO inv_sublineas (codigo, nombre, id_linea, estado)
SELECT 'SLR009', 'TORTAS', id, 1
FROM inv_lineas
WHERE codigo = 'LR003'
AND NOT EXISTS (
    SELECT 1 FROM inv_sublineas WHERE codigo = 'SLR009'
);

INSERT INTO inv_sublineas (codigo, nombre, id_linea, estado)
SELECT 'SLR010', 'HELADOS', id, 1
FROM inv_lineas
WHERE codigo = 'LR003'
AND NOT EXISTS (
    SELECT 1 FROM inv_sublineas WHERE codigo = 'SLR010'
);

-- =============================================================================
-- ACTUALIZAR RECETAS CON LÍNEAS Y SUBLÍNEAS SEGÚN SU NOMBRE
-- =============================================================================

-- Actualizar recetas de CARNES
UPDATE inv_productos p
SET id_sublineas = (
    SELECT s.id 
    FROM inv_sublineas s 
    WHERE s.codigo = 'SLR001' 
    LIMIT 1
)
WHERE EXISTS (
    SELECT 1 FROM inv_categorias c 
    WHERE c.id = p.id_categoria AND c.isreceta = 1
)
AND (
    LOWER(p.nombre) LIKE '%carne%' 
    OR LOWER(p.nombre) LIKE '%res%'
    OR LOWER(p.nombre) LIKE '%cerdo%'
    OR LOWER(p.nombre) LIKE '%lomo%'
    OR LOWER(p.nombre) LIKE '%chuleta%'
    OR LOWER(p.nombre) LIKE '%bistec%'
);

-- Actualizar recetas de PESCADOS
UPDATE inv_productos p
SET id_sublineas = (
    SELECT s.id 
    FROM inv_sublineas s 
    WHERE s.codigo = 'SLR002' 
    LIMIT 1
)
WHERE EXISTS (
    SELECT 1 FROM inv_categorias c 
    WHERE c.id = p.id_categoria AND c.isreceta = 1
)
AND (
    LOWER(p.nombre) LIKE '%pescado%' 
    OR LOWER(p.nombre) LIKE '%salmon%'
    OR LOWER(p.nombre) LIKE '%atun%'
    OR LOWER(p.nombre) LIKE '%trucha%'
    OR LOWER(p.nombre) LIKE '%tilapia%'
    OR LOWER(p.nombre) LIKE '%merluza%'
);

-- Actualizar recetas de AVES
UPDATE inv_productos p
SET id_sublineas = (
    SELECT s.id 
    FROM inv_sublineas s 
    WHERE s.codigo = 'SLR003' 
    LIMIT 1
)
WHERE EXISTS (
    SELECT 1 FROM inv_categorias c 
    WHERE c.id = p.id_categoria AND c.isreceta = 1
)
AND (
    LOWER(p.nombre) LIKE '%pollo%' 
    OR LOWER(p.nombre) LIKE '%pavo%'
    OR LOWER(p.nombre) LIKE '%gallina%'
);

-- Actualizar recetas de PASTAS
UPDATE inv_productos p
SET id_sublineas = (
    SELECT s.id 
    FROM inv_sublineas s 
    WHERE s.codigo = 'SLR004' 
    LIMIT 1
)
WHERE EXISTS (
    SELECT 1 FROM inv_categorias c 
    WHERE c.id = p.id_categoria AND c.isreceta = 1
)
AND (
    LOWER(p.nombre) LIKE '%pasta%' 
    OR LOWER(p.nombre) LIKE '%espagueti%'
    OR LOWER(p.nombre) LIKE '%lasaña%'
    OR LOWER(p.nombre) LIKE '%ravioli%'
    OR LOWER(p.nombre) LIKE '%fettuccine%'
);

-- Actualizar recetas VEGETARIANAS
UPDATE inv_productos p
SET id_sublineas = (
    SELECT s.id 
    FROM inv_sublineas s 
    WHERE s.codigo = 'SLR005' 
    LIMIT 1
)
WHERE EXISTS (
    SELECT 1 FROM inv_categorias c 
    WHERE c.id = p.id_categoria AND c.isreceta = 1
)
AND (
    LOWER(p.nombre) LIKE '%vegetariano%' 
    OR LOWER(p.nombre) LIKE '%vegano%'
    OR LOWER(p.nombre) LIKE '%ensalada%'
    OR LOWER(p.nombre) LIKE '%verduras%'
);

-- Actualizar recetas de BEBIDAS CALIENTES
UPDATE inv_productos p
SET id_sublineas = (
    SELECT s.id 
    FROM inv_sublineas s 
    WHERE s.codigo = 'SLR006' 
    LIMIT 1
)
WHERE EXISTS (
    SELECT 1 FROM inv_categorias c 
    WHERE c.id = p.id_categoria AND c.isreceta = 1
)
AND (
    LOWER(p.nombre) LIKE '%cafe%' 
    OR LOWER(p.nombre) LIKE '%te %'
    OR LOWER(p.nombre) LIKE '%chocolate caliente%'
    OR LOWER(p.nombre) LIKE '%aromática%'
);

-- Actualizar recetas de BEBIDAS FRÍAS
UPDATE inv_productos p
SET id_sublineas = (
    SELECT s.id 
    FROM inv_sublineas s 
    WHERE s.codigo = 'SLR007' 
    LIMIT 1
)
WHERE EXISTS (
    SELECT 1 FROM inv_categorias c 
    WHERE c.id = p.id_categoria AND c.isreceta = 1
)
AND (
    LOWER(p.nombre) LIKE '%gaseosa%' 
    OR LOWER(p.nombre) LIKE '%refresco%'
    OR LOWER(p.nombre) LIKE '%limonada%'
    OR LOWER(p.nombre) LIKE '%agua%'
);

-- Actualizar recetas de JUGOS NATURALES
UPDATE inv_productos p
SET id_sublineas = (
    SELECT s.id 
    FROM inv_sublineas s 
    WHERE s.codigo = 'SLR008' 
    LIMIT 1
)
WHERE EXISTS (
    SELECT 1 FROM inv_categorias c 
    WHERE c.id = p.id_categoria AND c.isreceta = 1
)
AND (
    LOWER(p.nombre) LIKE '%jugo%' 
    OR LOWER(p.nombre) LIKE '%batido%'
    OR LOWER(p.nombre) LIKE '%smoothie%'
);

-- Actualizar recetas de TORTAS
UPDATE inv_productos p
SET id_sublineas = (
    SELECT s.id 
    FROM inv_sublineas s 
    WHERE s.codigo = 'SLR009' 
    LIMIT 1
)
WHERE EXISTS (
    SELECT 1 FROM inv_categorias c 
    WHERE c.id = p.id_categoria AND c.isreceta = 1
)
AND (
    LOWER(p.nombre) LIKE '%torta%' 
    OR LOWER(p.nombre) LIKE '%pastel%'
    OR LOWER(p.nombre) LIKE '%tarta%'
    OR LOWER(p.nombre) LIKE '%ponqué%'
);

-- Actualizar recetas de HELADOS
UPDATE inv_productos p
SET id_sublineas = (
    SELECT s.id 
    FROM inv_sublineas s 
    WHERE s.codigo = 'SLR010' 
    LIMIT 1
)
WHERE EXISTS (
    SELECT 1 FROM inv_categorias c 
    WHERE c.id = p.id_categoria AND c.isreceta = 1
)
AND (
    LOWER(p.nombre) LIKE '%helado%' 
    OR LOWER(p.nombre) LIKE '%gelato%'
);

-- =============================================================================
-- ASIGNAR TIEMPOS DE PREPARACIÓN SEGÚN TIPO DE RECETA
-- =============================================================================

-- Insertar o actualizar tiempos de preparación para recetas sin tiempo
-- Bebidas: 00:05:00 (5 minutos)
INSERT INTO inv_utilidades_producto (id_producto, id_indicie_dificultad, tasa_perdida, tasa_utilidad, tiempo_preparacion, nota, estado)
SELECT 
    p.id,
    1, -- dificultad baja
    0, -- sin pérdida
    0, -- sin utilidad adicional
    '00:05:00', -- 5 minutos
    'Tiempo asignado automáticamente',
    1
FROM inv_productos p
INNER JOIN inv_sublineas s ON p.id_sublineas = s.id
WHERE s.codigo IN ('SLR006', 'SLR007', 'SLR008')
AND NOT EXISTS (
    SELECT 1 FROM inv_utilidades_producto u WHERE u.id_producto = p.id
);

-- Pastas: 00:15:00 (15 minutos)
INSERT INTO inv_utilidades_producto (id_producto, id_indicie_dificultad, tasa_perdida, tasa_utilidad, tiempo_preparacion, nota, estado)
SELECT 
    p.id,
    2, -- dificultad media
    5, -- 5% pérdida
    0,
    '00:15:00',
    'Tiempo asignado automáticamente',
    1
FROM inv_productos p
INNER JOIN inv_sublineas s ON p.id_sublineas = s.id
WHERE s.codigo = 'SLR004'
AND NOT EXISTS (
    SELECT 1 FROM inv_utilidades_producto u WHERE u.id_producto = p.id
);

-- Aves: 00:25:00 (25 minutos)
INSERT INTO inv_utilidades_producto (id_producto, id_indicie_dificultad, tasa_perdida, tasa_utilidad, tiempo_preparacion, nota, estado)
SELECT 
    p.id,
    2,
    8,
    0,
    '00:25:00',
    'Tiempo asignado automáticamente',
    1
FROM inv_productos p
INNER JOIN inv_sublineas s ON p.id_sublineas = s.id
WHERE s.codigo = 'SLR003'
AND NOT EXISTS (
    SELECT 1 FROM inv_utilidades_producto u WHERE u.id_producto = p.id
);

-- Pescados: 00:20:00 (20 minutos)
INSERT INTO inv_utilidades_producto (id_producto, id_indicie_dificultad, tasa_perdida, tasa_utilidad, tiempo_preparacion, nota, estado)
SELECT 
    p.id,
    2,
    10,
    0,
    '00:20:00',
    'Tiempo asignado automáticamente',
    1
FROM inv_productos p
INNER JOIN inv_sublineas s ON p.id_sublineas = s.id
WHERE s.codigo = 'SLR002'
AND NOT EXISTS (
    SELECT 1 FROM inv_utilidades_producto u WHERE u.id_producto = p.id
);

-- Carnes: 00:30:00 (30 minutos)
INSERT INTO inv_utilidades_producto (id_producto, id_indicie_dificultad, tasa_perdida, tasa_utilidad, tiempo_preparacion, nota, estado)
SELECT 
    p.id,
    3, -- dificultad alta
    10,
    0,
    '00:30:00',
    'Tiempo asignado automáticamente',
    1
FROM inv_productos p
INNER JOIN inv_sublineas s ON p.id_sublineas = s.id
WHERE s.codigo = 'SLR001'
AND NOT EXISTS (
    SELECT 1 FROM inv_utilidades_producto u WHERE u.id_producto = p.id
);

-- Vegetarianos: 00:15:00 (15 minutos)
INSERT INTO inv_utilidades_producto (id_producto, id_indicie_dificultad, tasa_perdida, tasa_utilidad, tiempo_preparacion, nota, estado)
SELECT 
    p.id,
    1,
    3,
    0,
    '00:15:00',
    'Tiempo asignado automáticamente',
    1
FROM inv_productos p
INNER JOIN inv_sublineas s ON p.id_sublineas = s.id
WHERE s.codigo = 'SLR005'
AND NOT EXISTS (
    SELECT 1 FROM inv_utilidades_producto u WHERE u.id_producto = p.id
);

-- Postres (Tortas): 00:45:00 (45 minutos)
INSERT INTO inv_utilidades_producto (id_producto, id_indicie_dificultad, tasa_perdida, tasa_utilidad, tiempo_preparacion, nota, estado)
SELECT 
    p.id,
    3,
    5,
    0,
    '00:45:00',
    'Tiempo asignado automáticamente',
    1
FROM inv_productos p
INNER JOIN inv_sublineas s ON p.id_sublineas = s.id
WHERE s.codigo = 'SLR009'
AND NOT EXISTS (
    SELECT 1 FROM inv_utilidades_producto u WHERE u.id_producto = p.id
);

-- Postres (Helados): 00:10:00 (10 minutos preparación)
INSERT INTO inv_utilidades_producto (id_producto, id_indicie_dificultad, tasa_perdida, tasa_utilidad, tiempo_preparacion, nota, estado)
SELECT 
    p.id,
    1,
    2,
    0,
    '00:10:00',
    'Tiempo asignado automáticamente',
    1
FROM inv_productos p
INNER JOIN inv_sublineas s ON p.id_sublineas = s.id
WHERE s.codigo = 'SLR010'
AND NOT EXISTS (
    SELECT 1 FROM inv_utilidades_producto u WHERE u.id_producto = p.id
);

-- =============================================================================
-- VERIFICACIÓN FINAL
-- =============================================================================

-- Ver recetas actualizadas con sus líneas, sublíneas y tiempos
SELECT 
    p.id,
    p.codigo,
    p.nombre AS receta,
    p.tipo_menu,
    c.nombre AS categoria,
    l.nombre AS linea,
    s.nombre AS sublinea,
    u.tiempo_preparacion,
    u.id_indicie_dificultad
FROM inv_productos p
INNER JOIN inv_categorias c ON p.id_categoria = c.id
LEFT JOIN inv_sublineas s ON p.id_sublineas = s.id
LEFT JOIN inv_lineas l ON s.id_linea = l.id
LEFT JOIN inv_utilidades_producto u ON p.id = u.id_producto
WHERE c.isreceta = 1
ORDER BY l.nombre, s.nombre, p.nombre;

-- Contar recetas por sublínea
SELECT 
    l.nombre AS linea,
    s.nombre AS sublinea,
    COUNT(p.id) AS cantidad_recetas
FROM inv_sublineas s
INNER JOIN inv_lineas l ON s.id_linea = l.id
LEFT JOIN inv_productos p ON p.id_sublineas = s.id
INNER JOIN inv_categorias c ON l.id_categoria = c.id
WHERE c.isreceta = 1
GROUP BY l.nombre, s.nombre
ORDER BY l.nombre, s.nombre;

-- =============================================================================
-- FIN DEL SCRIPT
-- =============================================================================

