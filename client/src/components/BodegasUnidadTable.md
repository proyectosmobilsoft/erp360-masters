# BodegasUnidadTable Component

Componente reutilizable para mostrar bodegas agrupadas por tipo (Almacenaje/Cocina) de una unidad de servicio específica.

## Características

- ✅ **Agrupación automática**: Por tipo de bodega (ALMACENAJE/COCINA)
- ✅ **Expansión/Colapso**: Grupos expandibles con animaciones
- ✅ **Información completa**: Código, nombre, sede, tipo y estado
- ✅ **Interactividad**: Click en bodegas para acciones personalizadas
- ✅ **Personalizable**: Títulos, mensajes y estilos configurables
- ✅ **Responsive**: Se adapta a diferentes tamaños de pantalla

## Instalación

### Dependencias requeridas

```bash
npm install @tanstack/react-query lucide-react
```

### Componentes UI necesarios

```typescript
// Asegúrate de tener estos componentes en tu proyecto
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
```

## Uso Básico

```tsx
import BodegasUnidadTable, { BodegaUnidadData } from '@/components/BodegasUnidadTable';

const bodegas: BodegaUnidadData[] = [
  {
    id: 1,
    codigo: "001",
    nombre: "BODEGA PRINCIPAL",
    tipo_bodega: 0, // 0: Almacenaje, 1: Cocina
    estado: 1, // 1: Activo, 0: Inactivo
    sede_nombre: "SUCURSAL PRINCIPAL"
  }
];

function MyComponent() {
  return (
    <BodegasUnidadTable 
      bodegas={bodegas}
      unidadNombre="Unidad de Servicio Principal"
    />
  );
}
```

## Uso con Hook

```tsx
import BodegasUnidadTable from '@/components/BodegasUnidadTable';
import { useBodegasUnidad } from '@/hooks/useBodegasUnidad';

function MyComponent() {
  const { bodegas, isLoading } = useBodegasUnidad({ 
    unidadId: 1,
    enabled: true 
  });

  if (isLoading) return <div>Cargando...</div>;

  return (
    <BodegasUnidadTable 
      bodegas={bodegas}
      unidadNombre="Mi Unidad"
    />
  );
}
```

## Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `bodegas` | `BodegaUnidadData[]` | **requerido** | Array de bodegas a mostrar |
| `unidadNombre` | `string` | `undefined` | Nombre de la unidad (se muestra en el título) |
| `showTitle` | `boolean` | `true` | Mostrar/ocultar el título |
| `className` | `string` | `""` | Clases CSS adicionales |
| `emptyMessage` | `string` | `"No hay bodegas..."` | Mensaje cuando no hay bodegas |
| `defaultExpandedGroups` | `string[]` | `['COCINA']` | Grupos expandidos por defecto |
| `onBodegaClick` | `(bodega: BodegaUnidadData) => void` | `undefined` | Callback al hacer click en una bodega |

## Tipos de Datos

```typescript
interface BodegaUnidadData {
  id: number;
  codigo: string;
  nombre: string;
  tipo_bodega: number; // 0: Almacenaje, 1: Cocina
  estado: number; // 1: Activo, 0: Inactivo
  sede_nombre: string;
}
```

## Estilos Personalizados

```tsx
// Ejemplo con estilos personalizados
<BodegasUnidadTable 
  bodegas={bodegas}
  className="my-custom-class"
  showTitle={false}
  emptyMessage="No se encontraron bodegas"
/>
```

```css
/* CSS personalizado */
.my-custom-class {
  border: 2px solid #e5e7eb;
  border-radius: 8px;
}

.my-custom-class .table-header {
  background: linear-gradient(90deg, #f3f4f6, #e5e7eb);
}
```

## Integración con Backend

### Función RPC de Supabase

```sql
-- Crear función para obtener bodegas por unidad
CREATE OR REPLACE FUNCTION get_bodegas_by_unidad(unidad_id integer)
RETURNS TABLE (
  id integer,
  codigo varchar,
  nombre varchar,
  tipo_bodega integer,
  estado integer,
  sede_nombre varchar
)
LANGUAGE sql
AS $$
  SELECT 
    gb.id,
    gb.codigo,
    gb.nombre,
    gb.tipo_bodega,
    gb.estado,
    gs.nombre as sede_nombre
  FROM gen_bodegas gb
  LEFT JOIN gen_sucursales gs ON gb.id_sucursal = gs.id
  WHERE gb.id_unidad = unidad_id
  ORDER BY gb.tipo_bodega, gb.nombre ASC;
$$;
```

### Servicio

```typescript
// bodegasService.ts
export const bodegasService = {
  async getBodegasByUnidad(unidadId: number): Promise<BodegaUnidadData[]> {
    const { data, error } = await supabase
      .rpc('get_bodegas_by_unidad', { unidad_id: unidadId });

    if (error) throw error;
    return data || [];
  }
};
```

## Ejemplos Avanzados

### Con Navegación

```tsx
import { useNavigate } from 'react-router-dom';

function BodegasWithNavigation() {
  const navigate = useNavigate();
  
  const handleBodegaClick = (bodega: BodegaUnidadData) => {
    navigate(`/bodegas/${bodega.id}`);
  };

  return (
    <BodegasUnidadTable 
      bodegas={bodegas}
      onBodegaClick={handleBodegaClick}
    />
  );
}
```

### Con Modal

```tsx
import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

function BodegasWithModal() {
  const [selectedBodega, setSelectedBodega] = useState<BodegaUnidadData | null>(null);

  return (
    <>
      <BodegasUnidadTable 
        bodegas={bodegas}
        onBodegaClick={setSelectedBodega}
      />
      
      <Dialog open={!!selectedBodega} onOpenChange={() => setSelectedBodega(null)}>
        <DialogContent>
          <h2>{selectedBodega?.nombre}</h2>
          <p>Código: {selectedBodega?.codigo}</p>
          <p>Sede: {selectedBodega?.sede_nombre}</p>
        </DialogContent>
      </Dialog>
    </>
  );
}
```

## Migración desde el Componente Original

Si estás migrando desde el componente original en `UnidadServiciosPage.tsx`:

1. **Reemplaza la tabla existente**:
```tsx
// Antes
<div className="space-y-4">
  <h3>Listado de bodegas de esta unidad</h3>
  {/* Tabla compleja aquí */}
</div>

// Después
<BodegasUnidadTable 
  bodegas={bodegasUnidad}
  unidadNombre={editingUnidad?.nombre_servicio}
/>
```

2. **Usa el hook personalizado**:
```tsx
// Antes
const { data: bodegasUnidad = [] } = useQuery({
  queryKey: ['bodegas-unidad', editingUnidad?.id],
  queryFn: () => bodegasService.getBodegasByUnidad(editingUnidad!.id!),
  enabled: !!editingUnidad?.id,
});

// Después
const { bodegas: bodegasUnidad } = useBodegasUnidad({ 
  unidadId: editingUnidad?.id,
  enabled: !!editingUnidad?.id 
});
```

## Troubleshooting

### Error: "Cannot find module '@/components/ui/table'"
- Asegúrate de tener los componentes UI instalados
- Verifica la configuración de path aliases en tu proyecto

### Error: "useBodegasUnidad is not defined"
- Importa el hook: `import { useBodegasUnidad } from '@/hooks/useBodegasUnidad'`
- Asegúrate de que el archivo del hook existe

### Las bodegas no se agrupan correctamente
- Verifica que `tipo_bodega` sea 0 (Almacenaje) o 1 (Cocina)
- Revisa que los datos tengan la estructura correcta

### Los grupos no se expanden
- Verifica que `defaultExpandedGroups` contenga los valores correctos
- Los valores deben ser exactamente 'ALMACENAJE' o 'COCINA'
