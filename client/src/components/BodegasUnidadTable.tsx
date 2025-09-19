import React, { useState, useMemo } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, Package, ChefHat } from 'lucide-react';

export interface BodegaUnidadData {
  id: number;
  codigo: string;
  nombre: string;
  tipo_bodega: number;
  estado: number;
  sede_nombre: string;
}

export interface BodegasUnidadTableProps {
  bodegas: BodegaUnidadData[];
  unidadNombre?: string;
  showTitle?: boolean;
  className?: string;
  emptyMessage?: string;
  defaultExpandedGroups?: string[];
  onBodegaClick?: (bodega: BodegaUnidadData) => void;
}

interface BodegaGroup {
  grupo: string;
  total: number;
  items: Array<{
    codigo: string;
    nombre: string;
    tipo: string;
    sede: string;
    estado: number;
  }>;
}

const BodegasUnidadTable: React.FC<BodegasUnidadTableProps> = ({
  bodegas,
  unidadNombre,
  showTitle = true,
  className = "",
  emptyMessage = "No hay bodegas asociadas a esta unidad de servicio",
  defaultExpandedGroups = ['COCINA'],
  onBodegaClick
}) => {
  // Estado para controlar grupos expandidos/colapsados
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(defaultExpandedGroups)
  );

  // Procesar bodegas agrupadas por tipo
  const bodegasData = useMemo((): BodegaGroup[] => {
    if (bodegas.length === 0) {
      return [];
    }

    const grouped = bodegas.reduce((acc, bodega) => {
      const tipo = bodega.tipo_bodega === 1 ? 'COCINA' : 'ALMACENAJE';
      if (!acc[tipo]) {
        acc[tipo] = [];
      }
      acc[tipo].push({
        codigo: bodega.codigo,
        nombre: bodega.nombre,
        tipo: tipo,
        sede: bodega.sede_nombre,
        estado: bodega.estado
      });
      return acc;
    }, {} as Record<string, any[]>);

    return Object.entries(grouped).map(([grupo, items]) => ({
      grupo,
      total: items.length,
      items
    }));
  }, [bodegas]);

  const toggleGroup = (grupo: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(grupo)) {
        newSet.delete(grupo);
      } else {
        newSet.add(grupo);
      }
      return newSet;
    });
  };

  const handleBodegaClick = (item: any) => {
    if (onBodegaClick) {
      // Encontrar la bodega original por código
      const bodegaOriginal = bodegas.find(b => b.codigo === item.codigo);
      if (bodegaOriginal) {
        onBodegaClick(bodegaOriginal);
      }
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {showTitle && (
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-800">
            Listado de bodegas de esta unidad
          </h3>
          {unidadNombre && (
            <span className="text-sm text-gray-600">({unidadNombre})</span>
          )}
        </div>
      )}
      
      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-cyan-50">
            <TableRow>
              <TableHead className="font-semibold text-gray-700 text-xs py-1 px-2">Código</TableHead>
              <TableHead className="font-semibold text-gray-700 text-xs py-1 px-2">Nombre de la bodega</TableHead>
              <TableHead className="font-semibold text-gray-700 text-xs py-1 px-2">Tipo</TableHead>
              <TableHead className="font-semibold text-gray-700 text-xs py-1 px-2">Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bodegasData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              bodegasData.map((grupo) => (
                <React.Fragment key={grupo.grupo}>
                  {/* Fila del grupo */}
                  <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-all duration-200">
                    <TableCell colSpan={5} className="py-1 px-2">
                      <div 
                        className="flex items-center gap-2 cursor-pointer hover:bg-white/50 p-1 rounded transition-all duration-200 group"
                        onClick={() => toggleGroup(grupo.grupo)}
                      >
                        <div className="flex items-center gap-1">
                          <div className="transition-transform duration-300 ease-in-out group-hover:scale-110">
                            {expandedGroups.has(grupo.grupo) ? (
                              <ChevronDown className="w-3 h-3 text-cyan-600" />
                            ) : (
                              <ChevronRight className="w-3 h-3 text-cyan-600" />
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            {grupo.grupo === 'ALMACENAJE' ? (
                              <Package className="w-3 h-3 text-blue-600" />
                            ) : (
                              <ChefHat className="w-3 h-3 text-orange-600" />
                            )}
                            <span className="font-semibold text-gray-800 group-hover:text-cyan-700 transition-colors duration-200 text-xs">
                              {grupo.grupo} - Total ({grupo.total})
                            </span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* Items del grupo - Solo se muestran cuando está expandido */}
                  {expandedGroups.has(grupo.grupo) && grupo.items.map((item, index) => (
                    <TableRow 
                      key={`${grupo.grupo}-${index}`} 
                      className={`hover:bg-cyan-50/50 transition-colors duration-200 border-l-2 border-l-transparent hover:border-l-cyan-300 ${
                        onBodegaClick ? 'cursor-pointer' : ''
                      }`}
                      style={{
                        animationDelay: `${index * 100}ms`,
                        animation: 'slideInFromTop 0.3s ease-out forwards'
                      }}
                      onClick={() => handleBodegaClick(item)}
                    >
                      <TableCell className="py-1 px-2 text-xs text-gray-900 font-medium">
                        <div className="flex items-center gap-1">
                          <div className="w-5 h-5 bg-cyan-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-cyan-700">{item.codigo}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-1 px-2 text-xs text-gray-900">
                        {item.nombre}
                      </TableCell>
                      <TableCell className="py-1 px-2">
                        <Badge 
                          variant="secondary" 
                          className={`text-xs px-1 py-0 ${
                            item.tipo === 'ALMACENAJE' 
                              ? 'bg-blue-100 text-blue-700 border-blue-200' 
                              : 'bg-orange-100 text-orange-700 border-orange-200'
                          }`}
                        >
                          {item.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-1 px-2">
                        <Badge 
                          variant={item.estado === 1 ? "default" : "secondary"}
                          className={`text-xs px-1 py-0 ${
                            item.estado === 1 
                              ? 'bg-green-100 text-green-700 border-green-200' 
                              : 'bg-gray-100 text-gray-700 border-gray-200'
                          }`}
                        >
                          {item.estado === 1 ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default BodegasUnidadTable;
