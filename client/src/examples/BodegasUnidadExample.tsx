import React from 'react';
import BodegasUnidadTable, { BodegaUnidadData } from '@/components/BodegasUnidadTable';
import { useBodegasUnidad } from '@/hooks/useBodegasUnidad';

// Ejemplo de uso básico
export const BodegasUnidadBasicExample: React.FC = () => {
  const { bodegas, isLoading } = useBodegasUnidad({ 
    unidadId: 1, 
    enabled: true 
  });

  if (isLoading) {
    return <div>Cargando bodegas...</div>;
  }

  return (
    <div className="p-4">
      <BodegasUnidadTable 
        bodegas={bodegas}
        unidadNombre="Unidad de Servicio Principal"
      />
    </div>
  );
};

// Ejemplo con datos estáticos
export const BodegasUnidadStaticExample: React.FC = () => {
  const staticBodegas: BodegaUnidadData[] = [
    {
      id: 1,
      codigo: "001",
      nombre: "BODEGA PRINCIPAL",
      tipo_bodega: 0,
      estado: 1,
      sede_nombre: "SUCURSAL PRINCIPAL"
    },
    {
      id: 2,
      codigo: "002",
      nombre: "BODEGA COCINA",
      tipo_bodega: 1,
      estado: 1,
      sede_nombre: "SUCURSAL NORTE"
    },
    {
      id: 3,
      codigo: "003",
      nombre: "BODEGA ALMACEN",
      tipo_bodega: 0,
      estado: 0,
      sede_nombre: "SUCURSAL SUR"
    }
  ];

  const handleBodegaClick = (bodega: BodegaUnidadData) => {
    console.log('Bodega clickeada:', bodega);
    // Aquí puedes manejar la navegación o acción
  };

  return (
    <div className="p-4">
      <BodegasUnidadTable 
        bodegas={staticBodegas}
        unidadNombre="Unidad de Ejemplo"
        onBodegaClick={handleBodegaClick}
        defaultExpandedGroups={['ALMACENAJE', 'COCINA']}
        emptyMessage="No se encontraron bodegas para esta unidad"
      />
    </div>
  );
};

// Ejemplo con personalización completa
export const BodegasUnidadCustomExample: React.FC = () => {
  const { bodegas, isLoading, error } = useBodegasUnidad({ 
    unidadId: 2,
    enabled: true 
  });

  if (error) {
    return <div>Error al cargar las bodegas: {error.message}</div>;
  }

  return (
    <div className="p-6 bg-gray-50">
      <div className="bg-white rounded-lg shadow-md p-4">
        <BodegasUnidadTable 
          bodegas={bodegas}
          showTitle={true}
          className="custom-bodegas-table"
          defaultExpandedGroups={['COCINA']}
          onBodegaClick={(bodega) => {
            alert(`Bodega seleccionada: ${bodega.nombre}`);
          }}
          emptyMessage="Esta unidad no tiene bodegas asignadas"
        />
      </div>
    </div>
  );
};
