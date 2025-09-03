import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Plus, Search, MapPin, Save, RefreshCw, Loader2, Lock, CheckCircle, Building, ImagePlus, ChevronDown, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLoading } from "@/contexts/LoadingContext";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { zonasService, ZonaData, UnidadServicioData, ZonaDetalleData } from "@/services/zonasService";
import { Can } from "@/contexts/PermissionsContext";

interface ZonaForm {
  codigo: string;
  nombre: string;
  abreviatura: string;
  no_ppl: number;
  unidadServicioId: number;
  unidadesServicio: Array<{
    id_unidad_servicio: number;
    no_ppl: number;
  }>;
}

const ZonasPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("active");
  const [activeTab, setActiveTab] = useState("zonas");
  const [editingZona, setEditingZona] = useState<ZonaData | null>(null);
  const [selectedUnidades, setSelectedUnidades] = useState<number[]>([]);
  const [unidadesDetalle, setUnidadesDetalle] = useState<Array<{
    id_unidad_servicio: number;
    no_ppl: number;
    nombre_servicio: string;
    municipio: string;
  }>>([]);

  const { toast } = useToast();
  const { startLoading, stopLoading } = useLoading();
  const queryClient = useQueryClient();

  // Queries
  const { data: zonas = [], isLoading, refetch } = useQuery({
    queryKey: ["zonas"],
    queryFn: zonasService.listZonas,
  });

  const { data: unidadesServicio = [] } = useQuery({
    queryKey: ["unidades-servicio"],
    queryFn: zonasService.listUnidadesServicio,
  });

  // Mutations
  const createZonaMutation = useMutation({
    mutationFn: async (data: ZonaForm) => {
      startLoading();
      try {
        const zonaData: ZonaData = {
          codigo: data.codigo,
          nombre: data.nombre,
          abreviatura: data.abreviatura,
          no_ppl: data.no_ppl,
          activo: true
        };
        
        const newZona = await zonasService.createZona(zonaData);
        
        // Agregar unidades de servicio si se seleccionaron
        if (unidadesDetalle.length > 0) {
          await zonasService.updateZonaUnidadesServicio(newZona.id, unidadesDetalle.map(unidad => ({
            id_unidad_servicio: unidad.id_unidad_servicio,
            no_ppl: unidad.no_ppl
          })));
        }
        
        return newZona;
      } finally {
        stopLoading();
      }
    },
    onSuccess: () => {
      toast({
        title: "Zona creada",
        description: "La zona ha sido creada exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ["zonas"] });
      setActiveTab("zonas");
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error al crear zona",
        description: error.message || "Hubo un error al crear la zona",
        variant: "destructive",
      });
    },
  });

  const updateZonaMutation = useMutation({
    mutationFn: async (data: ZonaForm & { id: number }) => {
      startLoading();
      try {
        const zonaData: Partial<ZonaData> = {
          codigo: data.codigo,
          nombre: data.nombre,
          abreviatura: data.abreviatura,
          no_ppl: data.no_ppl,
        };
        
        // Actualizar datos básicos de la zona
        const updatedZona = await zonasService.updateZona(data.id, zonaData);
        
        // Actualizar unidades de servicio asociadas
        const unidadesToUpdate = unidadesDetalle.map(unidad => ({
          id_unidad_servicio: unidad.id_unidad_servicio,
          no_ppl: unidad.no_ppl
        }));
        
        await zonasService.updateZonaUnidadesServicio(data.id, unidadesToUpdate);
        
        return updatedZona;
      } finally {
        stopLoading();
      }
    },
    onSuccess: () => {
      toast({
        title: "Zona actualizada",
        description: "La zona ha sido actualizada exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ["zonas"] });
      setEditingZona(null);
      setActiveTab("zonas");
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error al actualizar zona",
        description: error.message || "Hubo un error al actualizar la zona",
        variant: "destructive",
      });
    },
  });

  const deleteZonaMutation = useMutation({
    mutationFn: async (id: number) => {
      startLoading();
      try {
        return await zonasService.deleteZonaPermanent(id);
      } finally {
        stopLoading();
      }
    },
    onSuccess: () => {
      toast({
        title: "Zona eliminada",
        description: "La zona ha sido eliminada exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ["zonas"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error al eliminar zona",
        description: error.message || "Hubo un error al eliminar la zona",
        variant: "destructive",
      });
    },
  });

  const activateZonaMutation = useMutation({
    mutationFn: async (id: number) => {
      startLoading();
      try {
        return await zonasService.activateZona(id);
      } finally {
        stopLoading();
      }
    },
    onSuccess: () => {
      toast({
        title: "Zona activada",
        description: "La zona ha sido activada exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ["zonas"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error al activar zona",
        description: error.message || "Hubo un error al activar la zona",
        variant: "destructive",
      });
    },
  });

  const deactivateZonaMutation = useMutation({
    mutationFn: async (id: number) => {
      startLoading();
      try {
        return await zonasService.deactivateZona(id);
      } finally {
        stopLoading();
      }
    },
    onSuccess: () => {
      toast({
        title: "Zona desactivada",
        description: "La zona ha sido desactivada exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ["zonas"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error al desactivar zona",
        description: error.message || "Hubo un error al desactivar la zona",
        variant: "destructive",
      });
    },
  });

  // Filtros
  const zonasFiltradas = useMemo(() => {
    let filtered = zonas;

    if (searchTerm) {
      filtered = filtered.filter(zona =>
        zona.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        zona.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (zona.abreviatura && zona.abreviatura.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter === "active") {
      filtered = filtered.filter(zona => zona.activo);
    } else if (statusFilter === "inactive") {
      filtered = filtered.filter(zona => !zona.activo);
    }

    return filtered;
  }, [zonas, searchTerm, statusFilter]);

  // Handlers
  const handleEliminarZona = async (id: number) => {
    deleteZonaMutation.mutate(id);
  };

  const handleActivarZona = async (id: number) => {
    activateZonaMutation.mutate(id);
  };

  const handleInactivarZona = async (id: number) => {
    deactivateZonaMutation.mutate(id);
  };

  const handleEditarZona = async (zona: ZonaData) => {
    setEditingZona(zona);
    setActiveTab("registro");
    
    // Cargar detalles de la zona (unidades de servicio asociadas)
    try {
      const detalles = await zonasService.getZonaDetalles(zona.id!);
      console.log("📋 Detalles de la zona cargados:", detalles);
      
      // Convertir detalles a formato de unidades detalle
      const unidadesDetalle = detalles.map((detalle: any) => ({
        id_unidad_servicio: detalle.id_unidad_servicio,
        no_ppl: detalle.no_ppl || 0,
        nombre_servicio: detalle.prod_unidad_servicios?.nombre_servicio || "",
        municipio: detalle.prod_unidad_servicios?.gen_municipios?.nombre || ""
      }));
      
      // Actualizar estado con las unidades de la zona
      setUnidadesDetalle(unidadesDetalle);
      setSelectedUnidades(detalles.map((d: any) => d.id_unidad_servicio));
      
    } catch (error) {
      console.error("❌ Error cargando detalles de la zona:", error);
      toast({
        title: '⚠️ Advertencia',
        description: 'No se pudieron cargar los detalles de la zona',
        variant: 'destructive',
      });
    }
  };

  const handleCrearZona = () => {
    setEditingZona(null);
    setActiveTab("registro");
    resetForm();
  };

  const resetForm = () => {
    setSelectedUnidades([]);
    setUnidadesDetalle([]);
  };

  const onSubmit = (data: ZonaForm) => {
    if (editingZona) {
      updateZonaMutation.mutate({ ...data, id: editingZona.id! });
    } else {
      createZonaMutation.mutate(data);
    }
  };

  return (
    <div className="p-4 max-w-full mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-extrabold text-cyan-800 flex items-center gap-2 mb-2">
          <MapPin className="w-8 h-8 text-cyan-600" />
          Gestión de Zonas
        </h1>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-cyan-100/60 p-1 rounded-lg">
          <TabsTrigger
            value="zonas"
            className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md transition-all duration-300"
          >
            Listado de Zonas
          </TabsTrigger>
          <TabsTrigger
            value="registro"
            className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md transition-all duration-300"
          >
            Registro de Zona
          </TabsTrigger>
        </TabsList>

        <TabsContent value="zonas" className="mt-6">
          {/* Header similar a perfiles */}
          <div className="bg-white rounded-lg border">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-orange-100 rounded flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-orange-600" />
                </div>
                <span className="text-lg font-semibold text-gray-700">ZONAS</span>
              </div>
              <div className="flex space-x-2">
                <Can action="accion-crear-zona">
                  <Button
                    onClick={handleCrearZona}
                    className="bg-brand-lime hover:bg-brand-lime/90"
                    size="sm"
                  >
                    Adicionar Registro
                  </Button>
                </Can>
              </div>
            </div>

            {/* Filtros y búsqueda */}
            <div className="flex flex-wrap items-center gap-4 p-3 bg-cyan-50 rounded-lg mb-4 shadow-sm">
              <div className="flex-1 min-w-[200px]">
                <Input
                  placeholder="Buscar por nombre, código o abreviatura..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
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

            {/* Tabla de zonas */}
            <div className="relative overflow-x-auto rounded-lg shadow-sm">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-20">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="animate-spin h-10 w-10 text-cyan-600" />
                    <span className="text-cyan-700 font-semibold">Cargando zonas...</span>
                  </div>
                </div>
              )}
              <Table className="min-w-[900px] w-full text-xs">
                <TableHeader className="bg-cyan-50">
                  <TableRow className="text-left font-semibold text-gray-700">
                    <TableHead className="px-2 py-1 text-teal-600">Acciones</TableHead>
                    <TableHead className="px-4 py-3">Código</TableHead>
                    <TableHead className="px-4 py-3">Nombre</TableHead>
                    <TableHead className="px-4 py-3">Abreviatura</TableHead>
                    <TableHead className="px-4 py-3">No. PPL</TableHead>
                    <TableHead className="px-4 py-3">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!isLoading && (zonasFiltradas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No hay zonas disponibles.
                      </TableCell>
                    </TableRow>
                  ) : (
                    zonasFiltradas.map((zona) => (
                      <TableRow key={zona.id} className="hover:bg-gray-50">
                        <TableCell className="px-2 py-1">
                          <div className="flex flex-row gap-1 items-center">
                            <Can action="accion-editar-zona">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleEditarZona(zona)}
                                      aria-label="Editar zona"
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

                            {zona.activo ? (
                              <Can action="accion-inactivar-zona">
                                <AlertDialog>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <AlertDialogTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            aria-label="Inactivar zona"
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
                                      <AlertDialogTitle>¿Inactivar zona?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        ¿Estás seguro de que deseas inactivar la zona{" "}
                                        <strong>{zona.nombre}</strong>?
                                        La zona no podrá ser usada hasta que sea reactivada.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleInactivarZona(zona.id!)}
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
                                <Can action="accion-activar-zona">
                                  <AlertDialog>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <AlertDialogTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              aria-label="Activar zona"
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
                                        <AlertDialogTitle>¿Activar zona?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          ¿Estás seguro de que deseas activar la zona{" "}
                                          <strong>{zona.nombre}</strong>?
                                          La zona podrá ser usada nuevamente.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleActivarZona(zona.id!)}
                                          className="bg-brand-lime hover:bg-brand-lime/90"
                                        >
                                          Activar
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </Can>
                                <Can action="accion-eliminar-zona">
                                  <AlertDialog>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <AlertDialogTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              aria-label="Eliminar zona"
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
                                        <AlertDialogTitle>¿Eliminar zona?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          ¿Estás seguro de que deseas eliminar permanentemente la zona{" "}
                                          <strong>{zona.nombre}</strong>?
                                          Esta acción no se puede deshacer.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleEliminarZona(zona.id!)}
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
                        <TableCell className="px-3 py-2 text-sm text-gray-900 font-medium">
                          {zona.codigo}
                        </TableCell>
                        <TableCell className="px-3 py-2 text-sm text-gray-900">
                          {zona.nombre}
                        </TableCell>
                        <TableCell className="px-3 py-2 text-sm text-gray-900">
                          {zona.abreviatura || "-"}
                        </TableCell>
                        <TableCell className="px-3 py-2 text-sm text-gray-900">
                          {zona.no_ppl || "-"}
                        </TableCell>
                        <TableCell className="px-3 py-2">
                          <Badge
                            variant={zona.activo ? "default" : "secondary"}
                            className={
                              zona.activo
                                ? "bg-brand-lime/10 text-brand-lime"
                                : "bg-gray-100 text-gray-800"
                            }
                          >
                            {zona.activo ? "Activo" : "Inactivo"}
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
          <div className="bg-white rounded-lg border">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-orange-100 rounded flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-orange-600" />
                </div>
                <span className="text-lg font-semibold text-gray-700">REGISTRO DE ZONAS</span>
              </div>
            </div>
            <div className="p-6">
              <ZonaForm 
                zona={editingZona}
                editingZona={editingZona}
                unidadesServicio={unidadesServicio}
                onSubmit={onSubmit}
                isLoading={createZonaMutation.isPending || updateZonaMutation.isPending}
                selectedUnidades={selectedUnidades}
                setSelectedUnidades={setSelectedUnidades}
                unidadesDetalle={unidadesDetalle}
                setUnidadesDetalle={setUnidadesDetalle}
                onCancel={() => {
                  setActiveTab("zonas");
                  setEditingZona(null);
                  resetForm();
                }}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Componente del formulario de zona
interface ZonaFormProps {
  zona?: ZonaData | null;
  editingZona?: ZonaData | null;
  unidadesServicio: UnidadServicioData[];
  onSubmit: (data: ZonaForm) => void;
  isLoading: boolean;
  selectedUnidades: number[];
  setSelectedUnidades: (unidades: number[]) => void;
  unidadesDetalle: Array<{
    id_unidad_servicio: number;
    no_ppl: number;
    nombre_servicio: string;
    municipio: string;
  }>;
  setUnidadesDetalle: (detalle: Array<{
    id_unidad_servicio: number;
    no_ppl: number;
    nombre_servicio: string;
    municipio: string;
  }>) => void;
  onCancel: () => void;
}

const ZonaForm: React.FC<ZonaFormProps> = ({ 
  zona, 
  editingZona,
  unidadesServicio, 
  onSubmit, 
  isLoading, 
  selectedUnidades, 
  setSelectedUnidades, 
  unidadesDetalle, 
  setUnidadesDetalle,
  onCancel
}) => {
  const [formData, setFormData] = useState<ZonaForm>({
    codigo: zona?.codigo || "008",
    nombre: zona?.nombre || "",
    abreviatura: zona?.abreviatura || "",
    no_ppl: zona?.no_ppl || 0,
    unidadServicioId: 0,
    unidadesServicio: [],
  });

  const [open, setOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      unidadesServicio: unidadesDetalle
    });
  };

  const handleInputChange = (field: keyof ZonaForm, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUnidadServicioChange = (unidadId: number, checked: boolean) => {
    if (checked) {
      const unidad = unidadesServicio.find(u => u.id === unidadId);
      if (unidad) {
        setSelectedUnidades([...selectedUnidades, unidadId]);
        setUnidadesDetalle([...unidadesDetalle, {
          id_unidad_servicio: unidadId,
          no_ppl: unidad.no_ppl || 0,
          nombre_servicio: unidad.nombre_servicio,
          municipio: unidad.gen_municipios?.nombre || ""
        }]);
      }
    } else {
      setSelectedUnidades(selectedUnidades.filter(id => id !== unidadId));
      setUnidadesDetalle(unidadesDetalle.filter(u => u.id_unidad_servicio !== unidadId));
    }
  };

  const handleUnidadPplChange = (unidadId: number, noPpl: number) => {
    setUnidadesDetalle(unidadesDetalle.map(u => 
      u.id_unidad_servicio === unidadId 
        ? { ...u, no_ppl: noPpl }
        : u
    ));
  };

  const removeUnidadDetalle = (unidadId: number) => {
    setSelectedUnidades(selectedUnidades.filter(id => id !== unidadId));
    setUnidadesDetalle(unidadesDetalle.filter(u => u.id_unidad_servicio !== unidadId));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Formulario como en la imagen */}
      <div className="space-y-4 mb-6">
        {/* Primera fila: Información de la Zona */}
        <div className="grid grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="codigo">Codigo</Label>
            <Input
              id="codigo"
              value={formData.codigo}
              onChange={(e) => handleInputChange('codigo', e.target.value)}
              className="border-blue-200"
            />
          </div>

          <div className="space-y-2 col-span-2">
            <Label htmlFor="nombre">Nombre de Zona *</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => handleInputChange('nombre', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="abreviatura">Abreviatura *</Label>
            <Input
              id="abreviatura"
              value={formData.abreviatura}
              onChange={(e) => handleInputChange('abreviatura', e.target.value)}
              required
            />
          </div>
        </div>


      </div>

      {/* Tabla de detalle con fila de agregar integrada */}
      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-cyan-50">
            <TableRow>
              <TableHead className="font-semibold text-gray-700 text-sm py-2">Codigo</TableHead>
              <TableHead className="font-semibold text-gray-700 text-sm py-2">Unidad De Servicio</TableHead>
              <TableHead className="font-semibold text-gray-700 text-sm py-2">Municipio</TableHead>
              <TableHead className="font-semibold text-gray-700 text-sm py-2">No PPL</TableHead>
              <TableHead className="font-semibold text-gray-700 text-sm py-2 w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Fila para agregar nueva unidad - diferenciada visualmente */}
            <TableRow className="bg-blue-50 border-b-2 border-blue-200">
              <TableCell className="py-2">
                <div className="h-8 flex items-center px-3 border border-gray-300 rounded-md bg-white text-sm text-gray-700 font-medium">
                  {unidadesServicio.find(u => u.id === formData.unidadServicioId)?.codigo || ""}
                </div>
              </TableCell>
              <TableCell className="py-2">
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="h-8 w-full justify-between text-sm"
                    >
                      {formData.unidadServicioId
                        ? unidadesServicio.find((unidad) => unidad.id === formData.unidadServicioId)?.nombre_servicio
                        : "Seleccionar unidad..."}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0">
                    <Command>
                      <CommandInput placeholder="Buscar unidad de servicio..." />
                      <CommandList>
                        <CommandEmpty>No se encontraron unidades.</CommandEmpty>
                        <CommandGroup>
                          {unidadesServicio.map((unidad) => (
                            <CommandItem
                              key={unidad.id}
                              value={`${unidad.nombre_servicio} ${unidad.gen_municipios?.nombre}`}
                              onSelect={() => {
                                handleInputChange('unidadServicioId', unidad.id || 0);
                                // Actualizar el No PPL con el valor de la unidad seleccionada
                                if (unidad) {
                                  handleInputChange('no_ppl', unidad.no_ppl || 0);
                                }
                                setOpen(false);
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  formData.unidadServicioId === unidad.id ? "opacity-100" : "opacity-0"
                                }`}
                              />
                              <div className="flex flex-col">
                                <span className="font-medium">{unidad.nombre_servicio}</span>
                                <span className="text-xs text-gray-500">{unidad.gen_municipios?.nombre}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </TableCell>
              <TableCell className="py-2">
                <div className="h-8 flex items-center px-3 border border-gray-300 rounded-md bg-white text-sm text-gray-700">
                  {unidadesServicio.find(u => u.id === formData.unidadServicioId)?.gen_municipios?.nombre || ""}
                </div>
              </TableCell>
              <TableCell className="py-2">
                <div className="h-8 flex items-center px-3 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-700 font-medium">
                  {unidadesServicio.find(u => u.id === formData.unidadServicioId)?.no_ppl || 0}
                </div>
              </TableCell>
              <TableCell className="py-2">
                <Button 
                  type="button" 
                  size="icon" 
                  variant="outline"
                  onClick={() => {
                    if (formData.unidadServicioId > 0) {
                      const unidad = unidadesServicio.find(u => u.id === formData.unidadServicioId);
                      if (unidad && !selectedUnidades.includes(formData.unidadServicioId)) {
                        handleUnidadServicioChange(formData.unidadServicioId, true);
                        // Limpiar campos después de agregar
                        handleInputChange('unidadServicioId', 0);
                      }
                    }
                  }}
                  className="h-7 w-7 bg-cyan-100 hover:bg-cyan-200 border-cyan-300"
                >
                  <Plus className="h-3 w-3 text-cyan-600" />
                </Button>
              </TableCell>
            </TableRow>

            {/* Separador visual entre fila de agregar y registros existentes */}
            {unidadesDetalle.length > 0 && (
              <TableRow>
                <TableCell colSpan={5} className="p-0">
                  <hr className="border-gray-300" />
                </TableCell>
              </TableRow>
            )}

            {/* Registros agregados */}
            {unidadesDetalle.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-gray-500 text-sm">
                  No hay unidades agregadas
                </TableCell>
              </TableRow>
            ) : (
              unidadesDetalle.map((unidad, index) => {
                const unidadServicio = unidadesServicio.find(u => u.id === unidad.id_unidad_servicio);
                return (
                  <TableRow key={unidad.id_unidad_servicio} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-sm py-2">{unidadServicio?.codigo || ""}</TableCell>
                    <TableCell className="text-sm py-2">{unidad.nombre_servicio}</TableCell>
                    <TableCell className="text-sm py-2">{unidad.municipio}</TableCell>
                    <TableCell className="text-sm py-2 font-medium">{unidad.no_ppl}</TableCell>
                    <TableCell className="py-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeUnidadDetalle(unidad.id_unidad_servicio)}
                        className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancelar
        </Button>
        <Can action={editingZona ? "accion-editar-zona" : "accion-crear-zona"}>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-cyan-600 hover:bg-cyan-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {editingZona ? 'Actualizando...' : 'Guardando...'}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Guardar
              </>
            )}
          </Button>
        </Can>
      </div>
    </form>
  );
};

export default ZonasPage;