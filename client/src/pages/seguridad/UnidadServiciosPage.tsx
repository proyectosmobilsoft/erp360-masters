import React, { useState, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Plus, Search, Building2, Save, RefreshCw, Loader2, Lock, CheckCircle, Building, ImagePlus, ChevronDown, ChevronRight, Package, ChefHat, UtensilsCrossed } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLoading } from '@/contexts/LoadingContext';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { unidadServiciosService, UnidadServicioData } from '@/services/unidadServiciosService';
import { useBodegasUnidad } from '@/hooks/useBodegasUnidad';
import BodegasUnidadTable from '@/components/BodegasUnidadTable';
import { Can } from '@/contexts/PermissionsContext';
import { supabase } from '@/services/supabaseClient';

interface UnidadServicioForm {
  codigo?: string;
  nombre_servicio: string;
  id_sucursal: number;
  no_ppl: number;
}

const UnidadServiciosPage: React.FC = () => {
  const { toast } = useToast();
  const { startLoading, stopLoading } = useLoading();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("unidades");
  const [editingUnidad, setEditingUnidad] = useState<UnidadServicioData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("active");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Consulta de unidades de servicio
  const { data: unidadesServicio = [], isLoading } = useQuery({
    queryKey: ['unidades-servicio'],
    queryFn: unidadServiciosService.listUnidadesServicio,
  });

  // Consulta de sucursales
  const { data: sucursales = [] } = useQuery({
    queryKey: ['sucursales'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gen_sucursales')
        .select('id, nombre')
        .order('nombre');
      if (error) throw error;
      return data;
    },
  });

  // Consulta de bodegas por unidad de servicio (solo cuando se está editando)
  const { bodegas: bodegasUnidad } = useBodegasUnidad({ 
    unidadId: editingUnidad?.id,
    enabled: !!editingUnidad?.id 
  });

  // Mutación para crear unidad de servicio
  const createUnidadServicioMutation = useMutation({
    mutationFn: async (data: UnidadServicioForm) => {
      startLoading();
      try {
        const unidadData: UnidadServicioData = {
          codigo: data.codigo!,
          nombre_servicio: data.nombre_servicio,
          id_sucursal: data.id_sucursal,
          no_ppl: data.no_ppl,
          activo: true
        };
        
        return await unidadServiciosService.createUnidadServicio(unidadData);
      } finally {
        stopLoading();
      }
    },
    onSuccess: () => {
      toast({
        title: "Unidad de servicio creada",
        description: "La unidad de servicio ha sido creada exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ['unidades-servicio'] });
      setActiveTab("unidades");
      setEditingUnidad(null);
    },
    onError: (error: any) => {
      console.error('❌ Error creando unidad de servicio:', error);
      toast({
        title: "Error",
        description: error.message || "Error al crear la unidad de servicio",
        variant: "destructive",
      });
    },
  });

  // Mutación para actualizar unidad de servicio
  const updateUnidadServicioMutation = useMutation({
    mutationFn: async (data: UnidadServicioForm & { id: number }) => {
      startLoading();
      try {
        const unidadData: Partial<UnidadServicioData> = {
          codigo: data.codigo ? parseInt(data.codigo) : undefined,
          nombre_servicio: data.nombre_servicio,
          id_sucursal: data.id_sucursal,
          no_ppl: data.no_ppl,
        };
        
        return await unidadServiciosService.updateUnidadServicio(data.id, unidadData);
      } finally {
        stopLoading();
      }
    },
    onSuccess: () => {
      toast({
        title: "Unidad de servicio actualizada",
        description: "La unidad de servicio ha sido actualizada exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ['unidades-servicio'] });
      setActiveTab("unidades");
      setEditingUnidad(null);
    },
    onError: (error: any) => {
      console.error('❌ Error actualizando unidad de servicio:', error);
      toast({
        title: "Error",
        description: error.message || "Error al actualizar la unidad de servicio",
        variant: "destructive",
      });
    },
  });

  // Mutación para activar unidad de servicio
  const activateUnidadServicioMutation = useMutation({
    mutationFn: async (id: number) => {
      startLoading();
      try {
        return await unidadServiciosService.activateUnidadServicio(id);
      } finally {
        stopLoading();
      }
    },
    onSuccess: () => {
      toast({
        title: "Unidad de servicio activada",
        description: "La unidad de servicio ha sido activada exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ['unidades-servicio'] });
    },
    onError: (error: any) => {
      console.error('❌ Error activando unidad de servicio:', error);
      toast({
        title: "Error al activar unidad de servicio",
        description: error.message || "Hubo un error al activar la unidad de servicio",
        variant: "destructive",
      });
    },
  });

  // Mutación para inactivar unidad de servicio
  const deactivateUnidadServicioMutation = useMutation({
    mutationFn: async (id: number) => {
      startLoading();
      try {
        return await unidadServiciosService.deactivateUnidadServicio(id);
      } finally {
        stopLoading();
      }
    },
    onSuccess: () => {
      toast({
        title: "Unidad de servicio desactivada",
        description: "La unidad de servicio ha sido desactivada exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ['unidades-servicio'] });
    },
    onError: (error: any) => {
      console.error('❌ Error inactivando unidad de servicio:', error);
      toast({
        title: "Error al desactivar unidad de servicio",
        description: error.message || "Hubo un error al desactivar la unidad de servicio",
        variant: "destructive",
      });
    },
  });

  // Mutación para eliminar unidad de servicio
  const deleteUnidadServicioMutation = useMutation({
    mutationFn: async (id: number) => {
      startLoading();
      try {
        return await unidadServiciosService.deleteUnidadServicioPermanent(id);
      } finally {
        stopLoading();
      }
    },
    onSuccess: () => {
      toast({
        title: "Unidad de servicio eliminada",
        description: "La unidad de servicio ha sido eliminada exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ['unidades-servicio'] });
    },
    onError: (error: any) => {
      console.error('❌ Error eliminando unidad de servicio:', error);
      toast({
        title: "Error al eliminar unidad de servicio",
        description: error.message || "Hubo un error al eliminar la unidad de servicio",
        variant: "destructive",
      });
    },
  });

  // Filtros
  const unidadesFiltradas = useMemo(() => {
    let filtered = unidadesServicio;

    if (searchTerm) {
      filtered = filtered.filter(unidad =>
        unidad.nombre_servicio.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unidad.codigo?.toString().includes(searchTerm) ||
        unidad.gen_sucursales?.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter === "active") {
      filtered = filtered.filter(unidad => unidad.activo);
    } else if (statusFilter === "inactive") {
      filtered = filtered.filter(unidad => !unidad.activo);
    }

    return filtered;
  }, [unidadesServicio, searchTerm, statusFilter]);

  // Handlers
  const handleEliminarUnidad = async (id: number) => {
    deleteUnidadServicioMutation.mutate(id);
  };

  const handleActivarUnidad = async (id: number) => {
    activateUnidadServicioMutation.mutate(id);
  };

  const handleInactivarUnidad = async (id: number) => {
    deactivateUnidadServicioMutation.mutate(id);
  };

  const handleEditarUnidad = (unidad: UnidadServicioData) => {
    setEditingUnidad(unidad);
    setActiveTab("registro");
  };

  const handleCrearUnidad = () => {
    setEditingUnidad(null);
    setActiveTab("registro");
  };

  const onSubmit = (data: UnidadServicioForm) => {
    if (editingUnidad) {
      updateUnidadServicioMutation.mutate({ ...data, id: editingUnidad.id! });
    } else {
      createUnidadServicioMutation.mutate(data);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ['unidades-servicio'] });
      await queryClient.refetchQueries({ queryKey: ['unidades-servicio'] });
    } catch (error) {
      console.error('Error al actualizar:', error);
      toast({
        title: '❌ Error al Actualizar',
        description: 'No se pudieron actualizar los datos. Intente nuevamente.',
        variant: 'destructive',
        className: "bg-red-50 border-red-200 text-red-800",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="p-4 max-w-full mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-cyan-800 flex items-center gap-2">
          <Building2 className="w-8 h-8 text-cyan-600" />
          Gestión de Unidad Servicios
        </h1>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-cyan-100/60 p-1 rounded-lg">
          <TabsTrigger
            value="unidades"
            className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md transition-all duration-300"
          >
            Listado de Unidad Servicios
          </TabsTrigger>
          <TabsTrigger
            value="registro"
            className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md transition-all duration-300"
          >
            Registro de Unidad Servicio
          </TabsTrigger>
        </TabsList>

        <TabsContent value="unidades" className="mt-6">
          {/* Header similar a perfiles */}
          <div className="bg-white rounded-lg border">
            <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 border-b border-teal-200">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold text-teal-800 flex items-center gap-2">
                  <UtensilsCrossed className="w-6 h-6 text-teal-600" />
                  Gestión de Unidad Servicios
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleRefresh}
                    variant="outline"
                    size="sm"
                    disabled={isRefreshing}
                    className="text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                  >
                    <RefreshCw className={`w-4 h-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Actualizar
                  </Button>
                  <Can action="accion-crear-unidad-servicio">
                    <Button
                      onClick={handleCrearUnidad}
                      className="bg-teal-600 hover:bg-teal-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Nueva Unidad
                    </Button>
                  </Can>
                </div>
              </div>
            </CardHeader>

            {/* Sección de Filtros */}
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Buscar por nombre, código o sucursal..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                      autoComplete="off"
                    />
                  </div>
                </div>
                <div className="w-full sm:w-48">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrar por estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="active">Activos</SelectItem>
                      <SelectItem value="inactive">Inactivos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="p-6">

            {/* Tabla de unidades de servicio */}
            <div className="relative overflow-x-auto rounded-lg shadow-sm">
              {(isLoading || isRefreshing) && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-20">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="animate-spin h-10 w-10 text-teal-600" />
                    <span className="text-gray-600 font-semibold">{isRefreshing ? 'Actualizando unidades de servicio...' : 'Cargando unidades de servicio...'}</span>
                  </div>
                </div>
              )}
              <Table className="min-w-[900px] w-full text-xs">
                <TableHeader className="bg-cyan-50">
                  <TableRow className="text-center font-semibold text-gray-700">
                    <TableHead className="px-2 py-1 text-teal-600 text-center">Acciones</TableHead>
                    <TableHead className="px-4 py-3 text-center">Código</TableHead>
                    <TableHead className="px-4 py-3 text-center">Nombre del Servicio</TableHead>
                    <TableHead className="px-4 py-3 text-center">Sucursal</TableHead>
                    <TableHead className="px-4 py-3 text-center">No. PPL</TableHead>
                    <TableHead className="px-4 py-3 text-center">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!(isLoading || isRefreshing) && (unidadesFiltradas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No hay unidades de servicio disponibles.
                      </TableCell>
                    </TableRow>
                  ) : (
                    unidadesFiltradas.map((unidad) => (
                      <TableRow key={unidad.id} className="hover:bg-gray-50">
                        <TableCell className="px-2 py-1 text-left">
                          <div className="flex flex-row gap-1 items-center">
                            <Can action="accion-editar-unidad-servicio">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleEditarUnidad(unidad)}
                                      aria-label="Editar unidad de servicio"
                                    >
                                      <Edit className="h-5 w-5 text-cyan-600 hover:text-cyan-800 transition-colors" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Editar</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </Can>

                            {unidad.activo ? (
                              <Can action="accion-inactivar-unidad-servicio">
                                <AlertDialog>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <AlertDialogTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            aria-label="Inactivar unidad de servicio"
                                          >
                                            <Lock className="h-5 w-5 text-yellow-600 hover:text-yellow-800 transition-colors" />
                                          </Button>
                                        </AlertDialogTrigger>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Inactivar</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>¿Inactivar unidad de servicio?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        ¿Estás seguro de que deseas inactivar la unidad de servicio{" "}
                                        <strong>{unidad.nombre_servicio}</strong>?
                                        La unidad no podrá ser usada hasta que sea reactivada.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleInactivarUnidad(unidad.id!)}
                                        className="bg-yellow-600 hover:bg-yellow-700"
                                      >
                                        Inactivar
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </Can>
                            ) : (
                              <>
                                <Can action="accion-activar-unidad-servicio">
                                  <AlertDialog>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <AlertDialogTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              aria-label="Activar unidad de servicio"
                                            >
                                              <CheckCircle className="h-5 w-5 text-brand-lime hover:text-brand-lime/80 transition-colors" />
                                            </Button>
                                          </AlertDialogTrigger>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Activar</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>¿Activar unidad de servicio?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          ¿Estás seguro de que deseas activar la unidad de servicio{" "}
                                          <strong>{unidad.nombre_servicio}</strong>?
                                          La unidad podrá ser usada nuevamente.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleActivarUnidad(unidad.id!)}
                                          className="bg-brand-lime hover:bg-brand-lime/90"
                                        >
                                          Activar
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </Can>
                                <Can action="accion-eliminar-unidad-servicio">
                                  <AlertDialog>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <AlertDialogTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              aria-label="Eliminar unidad de servicio"
                                            >
                                              <Trash2 className="h-5 w-5 text-rose-600 hover:text-rose-800 transition-colors" />
                                            </Button>
                                          </AlertDialogTrigger>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Eliminar</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>¿Eliminar unidad de servicio?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          ¿Estás seguro de que deseas eliminar permanentemente la unidad de servicio{" "}
                                          <strong>{unidad.nombre_servicio}</strong>?
                                          Esta acción no se puede deshacer.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleEliminarUnidad(unidad.id!)}
                                          className="bg-red-600 hover:bg-red-700"
                                        >
                                          Eliminar
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </Can>
                              </>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="px-3 py-2 text-sm text-gray-900 font-medium text-left">
                          {unidad.codigo}
                        </TableCell>
                        <TableCell className="px-3 py-2 text-sm text-gray-900 text-left">
                          {unidad.nombre_servicio}
                        </TableCell>
                        <TableCell className="px-3 py-2 text-sm text-gray-900 text-left">
                          {unidad.gen_sucursales?.nombre || "-"}
                        </TableCell>
                        <TableCell className="px-3 py-2 text-sm text-gray-900 text-left">
                          {unidad.no_ppl || "-"}
                        </TableCell>
                        <TableCell className="px-3 py-2 text-left">
                          <Badge
                            variant={unidad.activo ? "default" : "secondary"}
                            className={
                              unidad.activo
                                ? "bg-brand-lime/10 text-brand-lime"
                                : "bg-gray-100 text-gray-800"
                            }
                          >
                            {unidad.activo ? "Activo" : "Inactivo"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="registro" className="mt-6">
          <UnidadServicioForm
            onSubmit={onSubmit}
            editingUnidad={editingUnidad}
            sucursales={sucursales}
            isLoading={createUnidadServicioMutation.isPending || updateUnidadServicioMutation.isPending}
            onCancel={() => {
              setActiveTab("unidades");
              setEditingUnidad(null);
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Componente del formulario
interface UnidadServicioFormProps {
  onSubmit: (data: UnidadServicioForm) => void;
  editingUnidad: UnidadServicioData | null;
  sucursales: Array<{id: number, nombre: string}>;
  isLoading: boolean;
  onCancel: () => void;
}

const UnidadServicioForm: React.FC<UnidadServicioFormProps> = ({
  onSubmit,
  editingUnidad,
  sucursales,
  isLoading,
  onCancel
}) => {
  const [formData, setFormData] = useState<UnidadServicioForm>({
    codigo: editingUnidad?.codigo?.toString() || "",
    nombre_servicio: editingUnidad?.nombre_servicio || "",
    id_sucursal: editingUnidad?.id_sucursal || 0,
    no_ppl: editingUnidad?.no_ppl || 0,
  });
  const [nextCodigo, setNextCodigo] = useState<string>("");

  // Obtener el siguiente código cuando se abre el formulario para crear
  React.useEffect(() => {
    if (!editingUnidad) {
      // Solo obtener el siguiente código si estamos creando una nueva unidad
      unidadServiciosService.getNextCodigo()
        .then(codigo => {
          setNextCodigo(codigo);
          setFormData(prev => ({ ...prev, codigo }));
        })
        .catch(error => {
          console.error('Error obteniendo siguiente código:', error);
          setNextCodigo("001");
          setFormData(prev => ({ ...prev, codigo: "001" }));
        });
    }
  }, [editingUnidad]);

  // Hook para obtener bodegas de la unidad
  const { bodegas: bodegasUnidad } = useBodegasUnidad({ 
    unidadId: editingUnidad?.id,
    enabled: !!editingUnidad?.id 
  });

  const handleInputChange = (field: keyof UnidadServicioForm, value: string | number) => {
    // No permitir cambios en el código si es autoincrementable
    if (field === 'codigo' && !editingUnidad) {
      return; // No actualizar el código en modo creación
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white rounded-lg border">
        <div className="flex items-center gap-2 p-6 border-b">
          <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center">
            <Building2 className="w-4 h-4 text-cyan-600" />
          </div>
          <span className="text-lg font-semibold text-gray-700">
            {editingUnidad ? 'EDITAR UNIDAD DE SERVICIO' : 'REGISTRO DE UNIDAD DE SERVICIO'}
          </span>
        </div>
      
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Formulario como en la imagen */}
          <div className="space-y-4 mb-6">
            {/* Primera fila: Información de la Unidad de Servicio */}
            <div className="grid grid-cols-6 gap-1">
              <div className="space-y-1">
                <Label htmlFor="codigo" className="text-xs">Codigo</Label>
                <Input
                  id="codigo"
                  value={formData.codigo || "Cargando..."}
                  onChange={(e) => handleInputChange('codigo', e.target.value)}
                  readOnly={!editingUnidad}
                  className="border-red-200 bg-red-50 text-red-600 font-bold w-full h-8 text-xs cursor-default"
                  autoComplete="off"
                />
              </div>

              <div className="space-y-1 col-span-2">
                <Label htmlFor="nombre_servicio" className="text-xs">Unidad de Servicio a PPL *</Label>
                <Input
                  id="nombre_servicio"
                  value={formData.nombre_servicio}
                  onChange={(e) => handleInputChange('nombre_servicio', e.target.value)}
                  required
                  className="h-8 text-xs"
                  autoComplete="off"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="no_ppl" className="text-xs">No PPL *</Label>
                <Input
                  id="no_ppl"
                  type="number"
                  value={formData.no_ppl}
                  onChange={(e) => handleInputChange('no_ppl', parseInt(e.target.value) || 0)}
                  required
                  className="w-full h-8 text-xs"
                  autoComplete="off"
                />
              </div>

              <div className="space-y-1 col-span-2">
                <Label htmlFor="sucursal" className="text-xs">Sucursal *</Label>
                <Select
                  value={formData.id_sucursal.toString()}
                  onValueChange={(value) => handleInputChange('id_sucursal', parseInt(value))}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sucursales.map((sucursal) => (
                      <SelectItem key={sucursal.id} value={sucursal.id.toString()}>
                        {sucursal.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Sección de bodegas - Solo lectura */}
          <BodegasUnidadTable 
            bodegas={bodegasUnidad}
            unidadNombre={editingUnidad?.nombre_servicio}
            emptyMessage={editingUnidad ? 'No hay bodegas asociadas a esta unidad de servicio' : 'Selecciona una unidad para ver sus bodegas'}
          />

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancelar
            </Button>
            <Can action={editingUnidad ? "accion-editar-unidad-servicio" : "accion-crear-unidad-servicio"}>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-cyan-600 hover:bg-cyan-700 text-white"
              >
                {isLoading ? 'Guardando...' : 'Guardar'}
              </Button>
            </Can>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UnidadServiciosPage;
