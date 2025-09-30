import React, { useState, useMemo, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { useLoading } from '@/contexts/LoadingContext';
import { Can } from '@/contexts/PermissionsContext';
import { 
  Package, 
  Plus, 
  Edit, 
  Lock, 
  CheckCircle, 
  Trash2, 
  Search, 
  Loader2,
  Save
} from 'lucide-react';
import { bodegasService, BodegaData, BodegaForm } from '@/services/bodegasService';
import { unidadServiciosService } from '@/services/unidadServiciosService';

const BodegasPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("bodegas");
  const [editingBodega, setEditingBodega] = useState<BodegaData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  
  const { toast } = useToast();
  const { startLoading, stopLoading } = useLoading();
  const queryClient = useQueryClient();

  // Queries
  const { data: bodegas = [], isLoading } = useQuery({
    queryKey: ['bodegas'],
    queryFn: bodegasService.listBodegas,
  });


  const { data: unidadesServicio = [] } = useQuery({
    queryKey: ['unidades-servicio'],
    queryFn: unidadServiciosService.listUnidadesServicio,
  });

  // Mutaciones
  const createBodegaMutation = useMutation({
    mutationFn: async (data: BodegaForm) => {
      startLoading();
      // No enviar el código en la creación, será autoincrementable
      const { codigo, ...createData } = data;
      return await bodegasService.createBodega(createData);
    },
    onSuccess: () => {
      stopLoading();
      toast({
        title: "Bodega creada",
        description: "La bodega ha sido creada exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ['bodegas'] });
      setActiveTab("bodegas");
      setEditingBodega(null);
    },
    onError: (error: any) => {
      stopLoading();
      console.error('❌ Error creando bodega:', error);
      toast({
        title: "Error",
        description: error.message || "Error al crear la bodega",
        variant: "destructive",
      });
    },
  });

  const updateBodegaMutation = useMutation({
    mutationFn: async ({ id, ...data }: BodegaForm & { id: number }) => {
      startLoading();
      const { codigo, ...updateData } = data;
      return await bodegasService.updateBodega(id, updateData);
    },
    onSuccess: () => {
      stopLoading();
      toast({
        title: "Bodega actualizada",
        description: "La bodega ha sido actualizada exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ['bodegas'] });
      setActiveTab("bodegas");
      setEditingBodega(null);
    },
    onError: (error: any) => {
      stopLoading();
      console.error('❌ Error actualizando bodega:', error);
      toast({
        title: "Error",
        description: error.message || "Error al actualizar la bodega",
        variant: "destructive",
      });
    },
  });

  const activateBodegaMutation = useMutation({
    mutationFn: async (id: number) => {
      startLoading();
      return await bodegasService.activateBodega(id);
    },
    onSuccess: () => {
      stopLoading();
      toast({
        title: "Bodega activada",
        description: "La bodega ha sido activada exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ['bodegas'] });
    },
    onError: (error: any) => {
      stopLoading();
      console.error('❌ Error activando bodega:', error);
      toast({
        title: "Error al activar bodega",
        description: error.message || "Hubo un error al activar la bodega",
        variant: "destructive",
      });
    },
  });

  const deactivateBodegaMutation = useMutation({
    mutationFn: async (id: number) => {
      startLoading();
      return await bodegasService.deactivateBodega(id);
    },
    onSuccess: () => {
      stopLoading();
      toast({
        title: "Bodega inactivada",
        description: "La bodega ha sido inactivada exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ['bodegas'] });
    },
    onError: (error: any) => {
      stopLoading();
      console.error('❌ Error inactivando bodega:', error);
      toast({
        title: "Error al inactivar bodega",
        description: error.message || "Hubo un error al inactivar la bodega",
        variant: "destructive",
      });
    },
  });

  const deleteBodegaMutation = useMutation({
    mutationFn: async (id: number) => {
      console.log('🔄 Iniciando eliminación de bodega ID:', id);
      startLoading();
      const result = await bodegasService.deleteBodegaPermanent(id);
      console.log('✅ Bodega eliminada exitosamente:', result);
      return result;
    },
    onSuccess: () => {
      stopLoading();
      toast({
        title: "Bodega eliminada",
        description: "La bodega ha sido eliminada exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ['bodegas'] });
    },
    onError: (error: any) => {
      stopLoading();
      console.error('❌ Error eliminando bodega:', error);
      toast({
        title: "Error al eliminar bodega",
        description: error.message || "Hubo un error al eliminar la bodega",
        variant: "destructive",
      });
    },
  });

  // Filtrar bodegas
  const filteredBodegas = useMemo(() => {
    return bodegas.filter(bodega => {
      const matchesSearch = bodega.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           bodega.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (bodega.unidad_nombre || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || 
                           (statusFilter === "active" && bodega.estado === 1) ||
                           (statusFilter === "inactive" && bodega.estado === 0);
      
      return matchesSearch && matchesStatus;
    });
  }, [bodegas, searchTerm, statusFilter]);

  const handleEditarBodega = (bodega: BodegaData) => {
    setEditingBodega(bodega);
    setActiveTab("formulario");
  };

  const handleNuevaBodega = () => {
    setEditingBodega(null);
    setActiveTab("formulario");
  };

  const handleEliminarBodega = (id: number) => {
    console.log('🗑️ Intentando eliminar bodega con ID:', id);
    deleteBodegaMutation.mutate(id);
  };

  const handleActivarBodega = (id: number) => {
    activateBodegaMutation.mutate(id);
  };

  const handleInactivarBodega = (id: number) => {
    deactivateBodegaMutation.mutate(id);
  };

  return (
    <div className="p-4 max-w-full mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-cyan-800 flex items-center gap-2">
          <Package className="w-8 h-8 text-cyan-600" />
          Gestión de Bodegas
        </h1>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-cyan-100/60 p-1 rounded-lg">
          <TabsTrigger
            value="bodegas"
            className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md transition-all duration-300"
          >
            <Package className="w-4 h-4 mr-2" />
            Bodegas
          </TabsTrigger>
          <TabsTrigger
            value="formulario"
            onClick={handleNuevaBodega}
            className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            {editingBodega ? 'Editar Bodega' : 'Nueva Bodega'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bodegas" className="mt-6">
          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 border-b border-cyan-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-cyan-600" />
                  <span className="text-lg font-semibold text-gray-700">BODEGAS</span>
                </div>
                <div className="flex space-x-2">
                  <Can action="accion-crear-bodega">
                    <Button
                      onClick={handleNuevaBodega}
                      className="bg-brand-lime hover:bg-green-500 hover:shadow-md transition-all duration-200"
                      size="sm"
                    >
                      Adicionar Registro
                    </Button>
                  </Can>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {/* Filtros */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Buscar por nombre, código o unidad de servicio..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10"
                    />
                  </div>
                </div>
                <div className="min-w-[180px]">
                  <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as "all" | "active" | "inactive")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrar por estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="active">Solo activos</SelectItem>
                      <SelectItem value="inactive">Solo inactivos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Tabla */}
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader className="bg-cyan-50">
                    <TableRow className="text-center font-semibold text-gray-700">
                      <TableHead className="px-2 py-1 text-teal-600 text-center">Acciones</TableHead>
                      <TableHead className="px-4 py-3 text-center">Código</TableHead>
                      <TableHead className="px-4 py-3 text-center">Nombre</TableHead>
                      <TableHead className="px-4 py-3 text-center">Unidad de Servicio</TableHead>
                      <TableHead className="px-4 py-3 text-center">Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Cargando bodegas...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredBodegas.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                          No se encontraron bodegas
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredBodegas.map((bodega) => (
                        <TableRow key={bodega.id} className="hover:bg-cyan-50/50 transition-colors">
                          <TableCell className="px-2 py-1 text-left">
                            <div className="flex items-center justify-start gap-1">
                              <Can action="accion-editar-bodega">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleEditarBodega(bodega)}
                                        aria-label="Editar bodega"
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

                              {bodega.estado === 1 ? (
                                <Can action="accion-inactivar-bodega">
                                  <AlertDialog>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <AlertDialogTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              aria-label="Inactivar bodega"
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
                                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Esta acción inactivará la bodega "{bodega.nombre}".
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleInactivarBodega(bodega.id!)}
                                        >
                                          Inactivar
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </Can>
                              ) : (
                                <Can action="accion-activar-bodega">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => handleActivarBodega(bodega.id!)}
                                          aria-label="Activar bodega"
                                        >
                                          <CheckCircle className="h-5 w-5 text-green-600 hover:text-green-800 transition-colors" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Activar</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </Can>
                              )}

                              {bodega.estado === 0 && (
                                <Can action="accion-eliminar-bodega">
                                  <AlertDialog>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <AlertDialogTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              aria-label="Eliminar bodega"
                                            >
                                              <Trash2 className="h-5 w-5 text-red-600 hover:text-red-800 transition-colors" />
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
                                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Esta acción no se puede deshacer. Se eliminará permanentemente la bodega "{bodega.nombre}".
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleEliminarBodega(bodega.id!)}
                                          className="bg-red-600 hover:bg-red-700"
                                        >
                                          Eliminar
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </Can>
                              )}
                            </div>
                          </TableCell>
                                                     <TableCell className="px-3 py-2 text-sm text-gray-900 font-medium text-left">{bodega.codigo}</TableCell>
                           <TableCell className="px-3 py-2 text-sm text-gray-900 text-left">
                             <div>
                               <div className="font-medium">{bodega.nombre}</div>
                               <div className="text-xs text-gray-500 mt-1">
                                 {bodega.tipo_bodega === 1 ? 'Cocina Interna' : 'Almacenaje'}
                               </div>
                             </div>
                           </TableCell>
                           <TableCell className="px-3 py-2 text-sm text-gray-900 text-left">{bodega.unidad_nombre || 'N/A'}</TableCell>
                          <TableCell className="px-3 py-2 text-left">
                            <Badge 
                              variant={bodega.estado === 1 ? "default" : "secondary"}
                              className={bodega.estado === 1 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                            >
                              {bodega.estado === 1 ? 'Activo' : 'Inactivo'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="formulario" className="mt-6">
          <BodegaFormComponent
            bodega={editingBodega}
            editingBodega={editingBodega}
            unidadesServicio={unidadesServicio}
            onSubmit={(data) => {
              if (editingBodega) {
                updateBodegaMutation.mutate({ ...data, id: editingBodega.id! });
              } else {
                // Para crear, no incluir el id
                const { id, ...createData } = data as any;
                createBodegaMutation.mutate(createData);
              }
            }}
            isLoading={createBodegaMutation.isPending || updateBodegaMutation.isPending}
            onCancel={() => {
              setEditingBodega(null);
              setActiveTab("bodegas");
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface BodegaFormProps {
  bodega?: BodegaData | null;
  editingBodega?: BodegaData | null;
  unidadesServicio: any[];
  onSubmit: (data: BodegaForm) => void;
  isLoading: boolean;
  onCancel: () => void;
}

const BodegaFormComponent: React.FC<BodegaFormProps> = ({ 
  bodega, 
  editingBodega,
  unidadesServicio,
  onSubmit, 
  isLoading, 
  onCancel
}) => {
  const [formData, setFormData] = useState<BodegaForm>({
    codigo: bodega?.codigo || "",
    nombre: bodega?.nombre || "",
    id_unidad: bodega?.id_unidad || 0,
    tipo_bodega: bodega?.tipo_bodega || 0,
    estado: bodega?.estado || 1,
  });

  const [nextCodigo, setNextCodigo] = useState<string>("");

  // Obtener el siguiente código disponible cuando se crea una nueva bodega
  React.useEffect(() => {
    if (!editingBodega) {
      bodegasService.getNextCodigo()
        .then(codigo => setNextCodigo(codigo))
        .catch(error => {
          console.error('Error obteniendo siguiente código:', error);
          setNextCodigo("001");
        });
    }
  }, [editingBodega]);

  // Reiniciar formulario cuando cambie editingBodega
  React.useEffect(() => {
    setFormData({
      codigo: bodega?.codigo || "",
      nombre: bodega?.nombre || "",
      id_unidad: bodega?.id_unidad || 0,
      tipo_bodega: bodega?.tipo_bodega || 0,
      estado: bodega?.estado || 1,
    });
  }, [bodega]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (field: keyof BodegaForm, value: string | number) => {
    // No permitir cambios manuales al código cuando se está creando
    if (field === 'codigo' && !editingBodega) {
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="bg-white rounded-lg border shadow-lg">
      {/* Header del formulario */}
      <div className="flex items-center gap-2 p-6 border-b bg-gradient-to-r from-cyan-50 to-blue-50">
        <Package className="w-5 h-5 text-cyan-600" />
        <h2 className="text-lg font-semibold text-cyan-800">
          {editingBodega ? 'Editar Bodega' : 'Nueva Bodega'}
        </h2>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Todos los campos en una sola fila */}
          <div className="grid grid-cols-12 gap-4">
            {/* Código */}
            <div className="col-span-2 space-y-2">
              <Label htmlFor="codigo" className="text-sm font-medium">Código</Label>
              <Input
                id="codigo"
                value={editingBodega ? formData.codigo : (nextCodigo || "Cargando...")}
                onChange={(e) => handleInputChange('codigo', e.target.value)}
                readOnly={!editingBodega}
                className="h-8 text-sm bg-red-50 border-red-200 text-red-600 font-bold cursor-default"
                autoComplete="off"
              />
            </div>

            {/* Nombre */}
            <div className="col-span-4 space-y-2">
              <Label htmlFor="nombre" className="text-sm font-medium">Nombre *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                required
                className="h-8 text-sm"
                autoComplete="off"
              />
            </div>

            {/* Unidad de Servicios */}
            <div className="col-span-3 space-y-2">
              <Label htmlFor="unidad" className="text-sm font-medium">Unidad de Servicios *</Label>
              <Select
                value={formData.id_unidad.toString()}
                onValueChange={(value) => handleInputChange('id_unidad', parseInt(value))}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {unidadesServicio.map((unidad) => (
                    <SelectItem key={unidad.id} value={unidad.id.toString()}>
                      {unidad.nombre_servicio}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tipo de Bodega */}
            <div className="col-span-3 space-y-2">
              <Label className="text-sm font-medium">Tipo de Bodega *</Label>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="almacenaje"
                    name="tipo_bodega"
                    value="0"
                    checked={formData.tipo_bodega === 0}
                    onChange={(e) => handleInputChange('tipo_bodega', parseInt(e.target.value))}
                    className="w-4 h-4 text-cyan-600 focus:ring-cyan-500 focus:ring-2"
                    autoComplete="off"
                  />
                  <Label htmlFor="almacenaje" className="text-sm font-medium text-gray-700 cursor-pointer">Almacenaje</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="cocina_interna"
                    name="tipo_bodega"
                    value="1"
                    checked={formData.tipo_bodega === 1}
                    onChange={(e) => handleInputChange('tipo_bodega', parseInt(e.target.value))}
                    className="w-4 h-4 text-cyan-600 focus:ring-cyan-500 focus:ring-2"
                    autoComplete="off"
                  />
                  <Label htmlFor="cocina_interna" className="text-sm font-medium text-gray-700 cursor-pointer">Cocina Interna</Label>
                </div>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BodegasPage;
