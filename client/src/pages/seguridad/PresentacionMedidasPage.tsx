import React, { useState, useMemo, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Ruler,
  Plus,
  Edit,
  Lock,
  Search,
  Loader2,
  Save,
  RefreshCw,
  CheckCircle,
  Trash2,
  AlertTriangle,
  Info
} from 'lucide-react';
import { presentacionMedidasService, PresentacionMedidaData, PresentacionMedidaForm } from '@/services/presentacionMedidasService';
import { medidasService, MedidaData } from '@/services/medidasService';

// Form Component
interface PresentacionMedidaFormComponentProps {
  presentacionMedida?: PresentacionMedidaData | null;
  editingPresentacionMedida?: PresentacionMedidaData | null;
  medidas: MedidaData[];
  onSubmit: (data: PresentacionMedidaForm) => void;
  isLoading: boolean;
  onCancel: () => void;
}

export const PresentacionMedidaFormComponent: React.FC<PresentacionMedidaFormComponentProps> = ({ 
  presentacionMedida, 
  editingPresentacionMedida,
  medidas,
  onSubmit, 
  isLoading, 
  onCancel
}) => {
  const [formData, setFormData] = useState<PresentacionMedidaForm>({
    nombre: presentacionMedida?.nombre || "",
    id_medida: presentacionMedida?.id_medida || null,
  });

  // Actualizar formulario cuando cambie editingPresentacionMedida
  React.useEffect(() => {
    if (editingPresentacionMedida) {
      setFormData({
        nombre: editingPresentacionMedida.nombre || "",
        id_medida: editingPresentacionMedida.id_medida || null,
      });
    } else {
      // Si no hay editingPresentacionMedida, usar los datos de la presentacionMedida o valores por defecto
      setFormData({
        nombre: presentacionMedida?.nombre || "",
        id_medida: presentacionMedida?.id_medida || null,
      });
    }
  }, [editingPresentacionMedida, presentacionMedida]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (field: keyof PresentacionMedidaForm, value: string | number | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="bg-white rounded-lg border shadow-lg">
      {/* Header del formulario */}
      <div className="flex items-center gap-2 p-6 border-b bg-gradient-to-r from-cyan-50 to-blue-50">
        <Ruler className="w-5 h-5 text-cyan-600" />
        <h2 className="text-lg font-semibold text-cyan-800">
          {editingPresentacionMedida ? 'Editar Presentación Medida' : 'Nueva Presentación Medida'}
        </h2>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Primera fila - Nombre y Clase */}
          <div className="grid grid-cols-12 gap-4">
            {/* Nombre */}
            <div className="col-span-7 space-y-2">
              <div className="flex items-center">
                <Label htmlFor="nombre" className="text-sm font-medium">Nombre *</Label>
              </div>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                required
                className="h-8 text-sm"
                autoComplete="off"
              />
            </div>

            {/* Medida */}
            <div className="col-span-5 space-y-2">
              <div className="flex items-center">
                <Label htmlFor="id_medida" className="text-sm font-medium">Medida</Label>
              </div>
              <Select
                value={formData.id_medida?.toString() || ""}
                onValueChange={(value) => handleInputChange('id_medida', value === "" ? null : parseInt(value))}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Seleccionar medida" />
                </SelectTrigger>
                <SelectContent>
                  {medidas.map((medida) => (
                    <SelectItem key={medida.id} value={medida.id.toString()}>
                      {medida.nombre} ({medida.abreviatura})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

// Main Component
const PresentacionMedidasPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("presentaciones");
  const [editingPresentacionMedida, setEditingPresentacionMedida] = useState<PresentacionMedidaData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("active");

  const { toast } = useToast();
  const { startLoading, stopLoading } = useLoading();
  const queryClient = useQueryClient();

  // Queries
  const { data: presentacionesMedidas = [], isLoading } = useQuery({
    queryKey: ['presentacionesMedidas'],
    queryFn: presentacionMedidasService.listPresentacionesMedidas,
  });

  const { data: medidas = [] } = useQuery({
    queryKey: ['medidas'],
    queryFn: medidasService.listMedidas,
  });

  // Mutations
  const createPresentacionMedidaMutation = useMutation({
    mutationFn: async (data: PresentacionMedidaForm) => {
      startLoading();
      return await presentacionMedidasService.createPresentacionMedida(data);
    },
    onSuccess: () => {
      stopLoading();
      toast({
        title: "✅ Presentación Medida Creada",
        description: "La nueva presentación de medida ha sido creada exitosamente y está listo para usar.",
        className: "bg-green-50 border-green-200 text-green-800",
      });
      queryClient.invalidateQueries({ queryKey: ['presentacionesMedidas'] });
      setActiveTab("presentaciones");
      setEditingPresentacionMedida(null);
    },
    onError: (error: any) => {
      stopLoading();
      console.error('Error al crear presentación medida:', error);
      toast({
        title: '❌ Error al Crear',
        description: error.message || 'No se pudo crear la presentación de medida. Verifique los datos e intente nuevamente.',
        variant: 'destructive',
        className: "bg-red-50 border-red-200 text-red-800",
      });
    },
  });

  const updatePresentacionMedidaMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: PresentacionMedidaForm }) => {
      startLoading();
      return presentacionMedidasService.updatePresentacionMedida(id, data);
    },
    onSuccess: () => {
      stopLoading();
      toast({
        title: "✅ Presentación Medida Actualizada",
        description: "Los cambios en la presentación de medida han sido guardados exitosamente.",
        className: "bg-green-50 border-green-200 text-green-800",
      });
      queryClient.invalidateQueries({ queryKey: ['presentacionesMedidas'] });
      setActiveTab("presentaciones");
      setEditingPresentacionMedida(null);
    },
    onError: (error: any) => {
      stopLoading();
      console.error('Error al actualizar presentación medida:', error);
      toast({
        title: '❌ Error al Actualizar',
        description: error.message || 'No se pudo actualizar la presentación de medida. Verifique los datos e intente nuevamente.',
        variant: 'destructive',
        className: "bg-red-50 border-red-200 text-red-800",
      });
    },
  });

  const activatePresentacionMedidaMutation = useMutation({
    mutationFn: (id: number) => presentacionMedidasService.togglePresentacionMedidaStatus(id, 1),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presentacionesMedidas'] });
      toast({
        title: '✅ Presentación Medida Activada',
        description: 'La presentación de medida ha sido activada correctamente y está disponible para uso.',
        className: "bg-green-50 border-green-200 text-green-800",
      });
    },
    onError: (error: any) => {
      console.error('Error al activar presentación medida:', error);
      toast({
        title: '❌ Error al Activar',
        description: error.message || 'No se pudo activar la presentación de medida. Intente nuevamente.',
        variant: 'destructive',
        className: "bg-red-50 border-red-200 text-red-800",
      });
    },
  });

  const deactivatePresentacionMedidaMutation = useMutation({
    mutationFn: (id: number) => presentacionMedidasService.togglePresentacionMedidaStatus(id, 0),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presentacionesMedidas'] });
      toast({
        title: '⚠️ Presentación Medida Desactivada',
        description: 'La presentación de medida ha sido desactivada y ya no está disponible para uso.',
        className: "bg-yellow-50 border-yellow-200 text-yellow-800",
      });
    },
    onError: (error: any) => {
      console.error('Error al desactivar presentación medida:', error);
      toast({
        title: '❌ Error al Desactivar',
        description: error.message || 'No se pudo desactivar la presentación de medida. Intente nuevamente.',
        variant: 'destructive',
        className: "bg-red-50 border-red-200 text-red-800",
      });
    },
  });

  const deletePresentacionMedidaMutation = useMutation({
    mutationFn: presentacionMedidasService.deletePresentacionMedidaPermanent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presentacionesMedidas'] });
      toast({
        title: '✅ Presentación Medida Eliminada',
        description: 'La presentación de medida ha sido eliminada permanentemente de la base de datos',
        className: "bg-green-50 border-green-200 text-green-800",
      });
    },
    onError: (error: any) => {
      console.error('Error al eliminar presentación medida:', error);
      toast({
        title: '❌ Error al Eliminar',
        description: error.message || 'No se pudo eliminar la presentación de medida. Verifique que no tenga referencias en otras tablas.',
        variant: 'destructive',
        className: "bg-red-50 border-red-200 text-red-800",
      });
    },
  });

  // Filtros
  const presentacionesMedidasFiltradas = useMemo(() => {
    console.log("🔍 Filtrando presentaciones medidas. Total:", presentacionesMedidas.length, "Filtros:", { searchTerm, statusFilter });
    const filtered = (presentacionesMedidas as PresentacionMedidaData[]).filter((presentacionMedida: PresentacionMedidaData) => {
      const matchesSearch = 
        (presentacionMedida.nombre?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (presentacionMedida.inv_medidas?.nombre?.toLowerCase() || '').includes(searchTerm.toLowerCase());

      const matchesStatus = 
        statusFilter === "all" || 
        (statusFilter === "active" && (presentacionMedida.estado === 1 || presentacionMedida.estado === undefined)) ||
        (statusFilter === "inactive" && presentacionMedida.estado === 0);

      return matchesSearch && matchesStatus;
    });

    console.log("✅ Presentaciones medidas filtradas:", filtered.length);
    return filtered;
  }, [presentacionesMedidas, searchTerm, statusFilter]);

  // Handlers
  const handleCrearPresentacionMedida = () => {
    setEditingPresentacionMedida(null);
    setActiveTab("formulario");
  };

  const handleEditarPresentacionMedida = (presentacionMedida: PresentacionMedidaData) => {
    setEditingPresentacionMedida(presentacionMedida);
    setActiveTab("formulario");
  };

  const handleSubmitPresentacionMedida = (data: PresentacionMedidaForm) => {
    if (editingPresentacionMedida) {
      updatePresentacionMedidaMutation.mutate({ 
        id: editingPresentacionMedida.id!, 
        data: {
          nombre: data.nombre,
          id_medida: data.id_medida
        }
      });
    } else {
      createPresentacionMedidaMutation.mutate(data);
    }
  };

  const handleActivatePresentacionMedida = (id: number) => {
    activatePresentacionMedidaMutation.mutate(id);
  };

  const handleDeactivatePresentacionMedida = (id: number) => {
    deactivatePresentacionMedidaMutation.mutate(id);
  };

  const handleDeletePresentacionMedida = (id: number) => {
    deletePresentacionMedidaMutation.mutate(id);
  };

  return (
    <div className="p-4 max-w-full mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-cyan-800 flex items-center gap-2">
          <Ruler className="w-8 h-8 text-cyan-600" />
          Gestión de Presentación Medidas
        </h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-cyan-100/60 p-1 rounded-lg">
          <TabsTrigger
            value="presentaciones"
            className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md transition-all duration-300"
          >
            <Ruler className="w-4 h-4 mr-2" />
            Presentaciones
          </TabsTrigger>
          <TabsTrigger
            value="formulario"
            onClick={handleCrearPresentacionMedida}
            className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            {editingPresentacionMedida ? 'Editar Presentación' : 'Nueva Presentación'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="presentaciones" className="mt-6">
          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 border-b border-cyan-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Ruler className="w-5 h-5 text-cyan-600" />
                  <span className="text-lg font-semibold text-gray-700">PRESENTACIONES DE MEDIDAS</span>
                </div>
                <div className="flex space-x-2">
                  <Can action="accion-crear-presentacion-medida">
                    <Button
                      onClick={handleCrearPresentacionMedida}
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
                      placeholder="Buscar por nombre o medida..."
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
                      <SelectItem value="active">Activos</SelectItem>
                      <SelectItem value="inactive">Inactivos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Tabla */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader className="bg-cyan-50">
                    <TableRow className="text-center font-semibold text-gray-700">
                      <TableHead className="px-2 py-1 text-teal-600 w-20 text-center">Acciones</TableHead>
                      <TableHead className="px-4 py-3 text-center">Nombre</TableHead>
                      <TableHead className="px-4 py-3 w-32 text-center">Medida</TableHead>
                      <TableHead className="px-4 py-3 w-24 text-center">Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                          <div className="flex items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin mr-2" />
                            Cargando presentaciones...
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : presentacionesMedidasFiltradas.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                          No hay presentaciones de medidas disponibles.
                        </TableCell>
                      </TableRow>
                    ) : (
                  presentacionesMedidasFiltradas.map((presentacionMedida: PresentacionMedidaData) => (
                    <TableRow key={presentacionMedida.id} className="hover:bg-gray-50">
                      <TableCell className="px-2 py-1">
                        <div className="flex items-center justify-start gap-1">
                          <Can action="accion-editar-presentacion-medida">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEditarPresentacionMedida(presentacionMedida)}
                                    aria-label="Editar presentación medida"
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

                          {presentacionMedida.estado === 1 ? (
                            <Can action="accion-desactivar-presentacion-medida">
                              <AlertDialog>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          aria-label="Inactivar presentación medida"
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
                                      Esta acción inactivará la presentación de medida "{presentacionMedida.nombre}".
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeactivatePresentacionMedida(presentacionMedida.id!)}
                                    >
                                      Inactivar
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </Can>
                          ) : (
                            <Can action="accion-activar-presentacion-medida">
                              <AlertDialog>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          aria-label="Activar presentación medida"
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
                                      Esta acción activará la presentación de medida "{presentacionMedida.nombre}".
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleActivatePresentacionMedida(presentacionMedida.id!)}
                                    >
                                      Activar
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </Can>
                          )}

                          {/* Botón de eliminar para presentaciones inactivas */}
                          {presentacionMedida.estado === 0 && (
                            <Can action="accion-eliminar-presentacion-medida">
                              <AlertDialog>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          aria-label="Eliminar presentación medida"
                                        >
                                          <Trash2 className="h-5 w-5 text-red-600 hover:text-red-800 transition-colors" />
                                        </Button>
                                      </AlertDialogTrigger>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Eliminar permanentemente</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="flex items-center gap-2">
                                      <Trash2 className="h-5 w-5 text-red-600" />
                                      Confirmar Eliminación
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="space-y-3">
                                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                        <div className="flex items-center gap-2 text-red-800 font-semibold mb-2">
                                          <AlertTriangle className="h-4 w-4" />
                                          ADVERTENCIA
                                        </div>
                                        <p className="text-red-700 text-sm">
                                          ¿Estás seguro de que deseas eliminar permanentemente la presentación de medida <strong>"{presentacionMedida.nombre}"</strong>?
                                        </p>
                                      </div>
                                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                        <div className="flex items-center gap-2 text-yellow-800 font-semibold mb-2">
                                          <Info className="h-4 w-4" />
                                          IMPACTO
                                        </div>
                                        <ul className="text-yellow-700 text-sm space-y-1">
                                          <li>• La presentación de medida será eliminada permanentemente de la base de datos</li>
                                          <li>• Las medidas asociadas a esta presentación perderán la referencia</li>
                                          <li>• Esta acción no se puede deshacer</li>
                                        </ul>
                                      </div>
                                      <p className="text-gray-600">
                                        ¿Estás completamente seguro de que deseas continuar con esta eliminación?
                                      </p>
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeletePresentacionMedida(presentacionMedida.id!)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Sí, Eliminar
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </Can>
                          )}

                        </div>
                      </TableCell>
                      <TableCell className="px-3 py-2 text-sm text-gray-900 text-left">
                        {presentacionMedida.nombre}
                      </TableCell>
                      <TableCell className="px-3 py-2 text-sm text-gray-900 w-32 text-left">
                        {presentacionMedida.inv_medidas ? (
                          <Badge variant="default" className="bg-blue-100 text-blue-800">
                            {presentacionMedida.inv_medidas.nombre}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                            Sin medida
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="px-3 py-2 text-left">
                        <Badge
                          variant={presentacionMedida.estado === 1 ? "default" : "secondary"}
                          className={
                            presentacionMedida.estado === 1
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {presentacionMedida.estado === 1 ? "Activo" : "Inactivo"}
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
          <PresentacionMedidaFormComponent
            presentacionMedida={null}
            editingPresentacionMedida={editingPresentacionMedida}
            medidas={medidas}
            onSubmit={handleSubmitPresentacionMedida}
            isLoading={createPresentacionMedidaMutation.isPending || updatePresentacionMedidaMutation.isPending}
            onCancel={() => {
              setEditingPresentacionMedida(null);
              setActiveTab("presentaciones");
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PresentacionMedidasPage;
