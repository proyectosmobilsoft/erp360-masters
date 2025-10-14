import React, { useState, useMemo, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Plus, Search, Building2, Save, RefreshCw, Loader2, Lock, CheckCircle, Building, ImagePlus, UtensilsCrossed } from 'lucide-react';
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
import { Switch } from '@/components/ui/switch';
import { sucursalesService, SucursalData } from '@/services/sucursalesService';
import { Can } from '@/contexts/PermissionsContext';
import { supabase } from '@/services/supabaseClient';

interface SucursalForm {
  codigo?: string;
  nombre: string;
  id_empresa: number;
  id_municipio: number;
  estado: number;
}

const SucursalesPage: React.FC = () => {
  const { toast } = useToast();
  const { startLoading, stopLoading } = useLoading();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("sucursales");
  const [editingSucursal, setEditingSucursal] = useState<SucursalData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("active");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Obtener datos de empresa del localStorage
  const empresaData = useMemo(() => {
    try {
      const stored = localStorage.getItem('empresaData');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error parsing empresaData from localStorage:', error);
      return null;
    }
  }, []);

  // Consulta de sucursales
  const { data: sucursales = [], isLoading } = useQuery({
    queryKey: ['sucursales'],
    queryFn: sucursalesService.listSucursales,
  });

  // Consulta de municipios
  const { data: municipios = [] } = useQuery({
    queryKey: ['municipios'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gen_municipios')
        .select('id, nombre')
        .order('nombre');
      if (error) throw error;
      return data;
    },
  });

  // Mutación para crear sucursal
  const createSucursalMutation = useMutation({
    mutationFn: async (data: SucursalForm) => {
      startLoading();
      try {
        return await sucursalesService.createSucursal(data);
      } finally {
        stopLoading();
      }
    },
    onSuccess: () => {
      toast({
        title: "Sucursal creada",
        description: "La sucursal ha sido creada exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ['sucursales'] });
      setActiveTab("sucursales");
      setEditingSucursal(null);
    },
    onError: (error: any) => {
      console.error('❌ Error creando sucursal:', error);
      toast({
        title: "Error",
        description: error.message || "Error al crear la sucursal",
        variant: "destructive",
      });
    },
  });

  // Mutación para actualizar sucursal
  const updateSucursalMutation = useMutation({
    mutationFn: async (data: SucursalForm & { id: number }) => {
      startLoading();
      try {
        const sucursalData: Partial<SucursalForm> = {
          codigo: data.codigo,
          nombre: data.nombre,
          id_empresa: data.id_empresa,
          id_municipio: data.id_municipio,
          estado: data.estado,
        };
        
        return await sucursalesService.updateSucursal(data.id, sucursalData);
      } finally {
        stopLoading();
      }
    },
    onSuccess: () => {
      toast({
        title: "Sucursal actualizada",
        description: "La sucursal ha sido actualizada exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ['sucursales'] });
      setActiveTab("sucursales");
      setEditingSucursal(null);
    },
    onError: (error: any) => {
      console.error('❌ Error actualizando sucursal:', error);
      toast({
        title: "Error",
        description: error.message || "Error al actualizar la sucursal",
        variant: "destructive",
      });
    },
  });

  // Mutación para activar sucursal
  const activateSucursalMutation = useMutation({
    mutationFn: async (id: number) => {
      startLoading();
      try {
        return await sucursalesService.activateSucursal(id);
      } finally {
        stopLoading();
      }
    },
    onSuccess: () => {
      toast({
        title: "Sucursal activada",
        description: "La sucursal ha sido activada exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ['sucursales'] });
    },
    onError: (error: any) => {
      console.error('❌ Error activando sucursal:', error);
      toast({
        title: "Error al activar sucursal",
        description: error.message || "Hubo un error al activar la sucursal",
        variant: "destructive",
      });
    },
  });

  // Mutación para inactivar sucursal
  const deactivateSucursalMutation = useMutation({
    mutationFn: async (id: number) => {
      startLoading();
      try {
        return await sucursalesService.deactivateSucursal(id);
      } finally {
        stopLoading();
      }
    },
    onSuccess: () => {
      toast({
        title: "Sucursal desactivada",
        description: "La sucursal ha sido desactivada exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ['sucursales'] });
    },
    onError: (error: any) => {
      console.error('❌ Error inactivando sucursal:', error);
      toast({
        title: "Error al desactivar sucursal",
        description: error.message || "Hubo un error al desactivar la sucursal",
        variant: "destructive",
      });
    },
  });

  // Mutación para eliminar sucursal
  const deleteSucursalMutation = useMutation({
    mutationFn: async (id: number) => {
      console.log('🔄 Iniciando eliminación de sucursal ID:', id);
      startLoading();
      try {
        const result = await sucursalesService.deleteSucursalPermanent(id);
        console.log('✅ Sucursal eliminada exitosamente:', result);
        return result;
      } catch (error) {
        console.error('❌ Error en deleteSucursalPermanent:', error);
        throw error;
      } finally {
        stopLoading();
      }
    },
    onSuccess: () => {
      toast({
        title: "Sucursal eliminada",
        description: "La sucursal ha sido eliminada exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ['sucursales'] });
    },
    onError: (error: any) => {
      console.error('❌ Error eliminando sucursal:', error);
      toast({
        title: "Error al eliminar sucursal",
        description: error.message || "Hubo un error al eliminar la sucursal",
        variant: "destructive",
      });
    },
  });

  // Filtrar sucursales
  const filteredSucursales = useMemo(() => {
    return sucursales.filter(sucursal => {
      const matchesSearch = sucursal.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           sucursal.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           sucursal.gen_municipios?.nombre.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || 
                           (statusFilter === "active" && sucursal.estado === 1) ||
                           (statusFilter === "inactive" && sucursal.estado === 0);
      
      return matchesSearch && matchesStatus;
    });
  }, [sucursales, searchTerm, statusFilter]);

  const handleEditarSucursal = (sucursal: SucursalData) => {
    setEditingSucursal(sucursal);
    setActiveTab("formulario");
  };

  const handleNuevaSucursal = () => {
    setEditingSucursal(null);
    setActiveTab("formulario");
  };

  const handleEliminarSucursal = (id: number) => {
    console.log('🗑️ Intentando eliminar sucursal con ID:', id);
    deleteSucursalMutation.mutate(id);
  };

  const handleActivarSucursal = (id: number) => {
    activateSucursalMutation.mutate(id);
  };

  const handleDesactivarSucursal = (id: number) => {
    deactivateSucursalMutation.mutate(id);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ['sucursales'] });
      await queryClient.refetchQueries({ queryKey: ['sucursales'] });
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
          Gestión de Sucursales
        </h1>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-cyan-100/60 p-1 rounded-lg">
          <TabsTrigger
            value="sucursales"
            className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md transition-all duration-300"
          >
            <Building2 className="w-4 h-4 mr-2" />
            Sucursales
          </TabsTrigger>
          <TabsTrigger
            value="formulario"
            onClick={handleNuevaSucursal}
            className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            {editingSucursal ? 'Editar Sucursal' : 'Nueva Sucursal'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sucursales" className="mt-6">
          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 border-b border-teal-200">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold text-teal-800 flex items-center gap-2">
                  <UtensilsCrossed className="w-6 h-6 text-teal-600" />
                  Gestión de Sucursales
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
                  <Can action="accion-crear-sucursal">
                    <Button
                      onClick={handleNuevaSucursal}
                      className="bg-teal-600 hover:bg-teal-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Nueva Sucursal
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
                      placeholder="Buscar por nombre, código o municipio..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
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

            <CardContent className="p-6">
              {/* Tabla */}
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader className="bg-cyan-50">
                    <TableRow className="text-center font-semibold text-gray-700">
                      <TableHead className="px-2 py-1 text-teal-600 text-center">Acciones</TableHead>
                      <TableHead className="px-4 py-3 text-center">Código</TableHead>
                      <TableHead className="px-4 py-3 text-center">Nombre</TableHead>
                      <TableHead className="px-4 py-3 text-center">Empresa</TableHead>
                      <TableHead className="px-4 py-3 text-center">Municipio</TableHead>
                      <TableHead className="px-4 py-3 text-center">Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(isLoading || isRefreshing) ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                            <span className="text-gray-600">{isRefreshing ? 'Actualizando sucursales...' : 'Cargando sucursales...'}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredSucursales.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          No se encontraron sucursales
                        </TableCell>
                      </TableRow>
                    ) : (
                                             filteredSucursales.map((sucursal) => (
                         <TableRow key={sucursal.id} className="hover:bg-cyan-50/50 transition-colors">
                           <TableCell className="px-2 py-1 text-left">
                             <div className="flex items-center justify-start gap-1">
                               <Can action="accion-editar-sucursal">
                                 <TooltipProvider>
                                   <Tooltip>
                                     <TooltipTrigger asChild>
                                       <Button
                                         variant="ghost"
                                         size="icon"
                                         onClick={() => handleEditarSucursal(sucursal)}
                                         aria-label="Editar sucursal"
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

                               {sucursal.estado === 1 ? (
                                 <Can action="accion-inactivar-sucursal">
                                   <AlertDialog>
                                     <TooltipProvider>
                                       <Tooltip>
                                         <TooltipTrigger asChild>
                                           <AlertDialogTrigger asChild>
                                             <Button
                                               variant="ghost"
                                               size="icon"
                                               aria-label="Inactivar sucursal"
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
                                           Esta acción inactivará la sucursal "{sucursal.nombre}".
                                         </AlertDialogDescription>
                                       </AlertDialogHeader>
                                       <AlertDialogFooter>
                                         <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                         <AlertDialogAction
                                           onClick={() => handleDesactivarSucursal(sucursal.id!)}
                                         >
                                           Inactivar
                                         </AlertDialogAction>
                                       </AlertDialogFooter>
                                     </AlertDialogContent>
                                   </AlertDialog>
                                 </Can>
                               ) : (
                                                                 <Can action="accion-activar-sucursal">
                                  <AlertDialog>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <AlertDialogTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              aria-label="Activar sucursal"
                                            >
                                              <CheckCircle className="h-5 w-5 text-green-600 hover:text-green-800 transition-colors" />
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
                                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Esta acción activará la sucursal "{sucursal.nombre}".
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleActivarSucursal(sucursal.id!)}
                                        >
                                          Activar
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </Can>
                               )}

                               {sucursal.estado === 0 && (
                                 <Can action="accion-eliminar-sucursal">
                                   <AlertDialog>
                                     <TooltipProvider>
                                       <Tooltip>
                                         <TooltipTrigger asChild>
                                           <AlertDialogTrigger asChild>
                                             <Button
                                               variant="ghost"
                                               size="icon"
                                               aria-label="Eliminar sucursal"
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
                                           Esta acción no se puede deshacer. Se eliminará permanentemente la sucursal "{sucursal.nombre}".
                                         </AlertDialogDescription>
                                       </AlertDialogHeader>
                                       <AlertDialogFooter>
                                         <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                         <AlertDialogAction
                                           onClick={() => handleEliminarSucursal(sucursal.id!)}
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
                           <TableCell className="px-3 py-2 text-sm text-gray-900 font-medium text-left">{sucursal.codigo}</TableCell>
                           <TableCell className="px-3 py-2 text-sm text-gray-900 text-left">{sucursal.nombre}</TableCell>
                           <TableCell className="px-3 py-2 text-sm text-gray-900 text-left">{sucursal.gen_empresa?.nombre || 'N/A'}</TableCell>
                           <TableCell className="px-3 py-2 text-sm text-gray-900 text-left">{sucursal.gen_municipios?.nombre || 'N/A'}</TableCell>
                           <TableCell className="px-3 py-2 text-left">
                             <Badge 
                               variant={sucursal.estado === 1 ? "default" : "secondary"}
                               className={sucursal.estado === 1 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                             >
                               {sucursal.estado === 1 ? 'Activo' : 'Inactivo'}
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
          <SucursalForm
            sucursal={editingSucursal}
            editingSucursal={editingSucursal}
            municipios={municipios}
            empresaData={empresaData}
            onSubmit={(data) => {
              if (editingSucursal) {
                updateSucursalMutation.mutate({ ...data, id: editingSucursal.id! });
              } else {
                // Para crear, no incluir el id
                const { id, ...createData } = data as any;
                createSucursalMutation.mutate(createData);
              }
            }}
            isLoading={createSucursalMutation.isPending || updateSucursalMutation.isPending}
            onCancel={() => {
              setEditingSucursal(null);
              setActiveTab("sucursales");
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface SucursalFormProps {
  sucursal?: SucursalData | null;
  editingSucursal: SucursalData | null;
  municipios: Array<{ id: number; nombre: string }>;
  empresaData: any;
  onSubmit: (data: SucursalForm) => void;
  isLoading: boolean;
  onCancel: () => void;
}

const SucursalForm: React.FC<SucursalFormProps> = ({ 
  sucursal, 
  editingSucursal,
  municipios, 
  empresaData,
  onSubmit, 
  isLoading, 
  onCancel
}) => {
  const [formData, setFormData] = useState<SucursalForm>({
    codigo: sucursal?.codigo || "",
    nombre: sucursal?.nombre || "",
    id_empresa: empresaData?.id || 1,
    id_municipio: sucursal?.id_municipio || 0,
    estado: sucursal?.estado || 1,
  });
  const [nextCodigo, setNextCodigo] = useState<string>("");

  // Obtener el siguiente código cuando se abre el formulario para crear
  React.useEffect(() => {
    if (!editingSucursal) {
      // Solo obtener el siguiente código si estamos creando una nueva sucursal
      sucursalesService.getNextCodigo()
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
  }, [editingSucursal]);

  // Reiniciar formulario cuando cambie editingSucursal
  React.useEffect(() => {
    setFormData({
      codigo: sucursal?.codigo || "",
      nombre: sucursal?.nombre || "",
      id_empresa: empresaData?.id || 1,
      id_municipio: sucursal?.id_municipio || 0,
      estado: sucursal?.estado || 1,
    });
  }, [sucursal, empresaData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (field: keyof SucursalForm, value: string | number) => {
    // No permitir cambios en el código si es autoincrementable
    if (field === 'codigo' && !editingSucursal) {
      return; // No actualizar el código en modo creación
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
        <Building2 className="w-5 h-5 text-cyan-600" />
        <h2 className="text-lg font-semibold text-cyan-800">
          {editingSucursal ? 'Editar Sucursal' : 'Nueva Sucursal'}
        </h2>
      </div>

      <div className="p-6">
                 {/* Información de la Empresa */}
         {empresaData && (
           <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
             <h3 className="text-xs font-medium text-blue-800 mb-2">Información de la Empresa</h3>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
               <div>
                 <span className="font-medium text-blue-700">Razón Social:</span>
                 <p className="text-gray-800 truncate">{empresaData.razon_social || 'N/A'}</p>
               </div>
               <div>
                 <span className="font-medium text-blue-700">NIT:</span>
                 <p className="text-gray-800">{empresaData.nit || 'N/A'}</p>
               </div>
               <div>
                 <span className="font-medium text-blue-700">Dirección:</span>
                 <p className="text-gray-800 truncate">{empresaData.direccion || 'N/A'}</p>
               </div>
               <div>
                 <span className="font-medium text-blue-700">Ciudad:</span>
                 <p className="text-gray-800">{empresaData.ciudad || 'N/A'}</p>
               </div>
               <div>
                 <span className="font-medium text-blue-700">Teléfono:</span>
                 <p className="text-gray-800">{empresaData.telefono || 'N/A'}</p>
               </div>
               <div>
                 <span className="font-medium text-blue-700">Email:</span>
                 <p className="text-gray-800 truncate">{empresaData.email || 'N/A'}</p>
               </div>
               <div>
                 <span className="font-medium text-blue-700">Representante:</span>
                 <p className="text-gray-800 truncate">{empresaData.representante_legal || 'N/A'}</p>
               </div>
               <div>
                 <span className="font-medium text-blue-700">Tipo Empresa:</span>
                 <p className="text-gray-800">{empresaData.tipo_empresa || 'N/A'}</p>
               </div>
             </div>
           </div>
         )}

                 <form onSubmit={handleSubmit} className="space-y-6">
           <div className="grid grid-cols-12 gap-4">
                                 {/* Código */}
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="codigo" className="text-sm font-medium">Código</Label>
                       <Input
                         id="codigo"
                         value={formData.codigo || "Cargando..."}
                         onChange={(e) => handleInputChange('codigo', e.target.value)}
                         readOnly={!editingSucursal}
                         className="h-8 text-sm bg-red-50 border-red-200 text-red-600 font-bold cursor-default"
                         placeholder={editingSucursal ? "Código" : "Cargando..."}
                         autoComplete="off"
                       />
                    </div>

             {/* Nombre */}
             <div className="col-span-6 space-y-2">
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

             {/* Municipio */}
             <div className="col-span-4 space-y-2">
               <Label htmlFor="municipio" className="text-sm font-medium">Municipio *</Label>
               <Select 
                 value={formData.id_municipio.toString()} 
                 onValueChange={(value) => handleInputChange('id_municipio', parseInt(value))}
               >
                 <SelectTrigger className="h-8 text-sm">
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                   {municipios.map((municipio) => (
                     <SelectItem key={municipio.id} value={municipio.id.toString()}>
                       {municipio.nombre}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             </div>
           </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="px-6"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="px-6 bg-cyan-600 hover:bg-cyan-700"
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

export default SucursalesPage;
