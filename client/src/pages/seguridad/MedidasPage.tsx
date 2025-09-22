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
import { medidasService, MedidaData, MedidaForm } from '@/services/medidasService';

// Form Component
interface MedidaFormComponentProps {
  medida?: MedidaData | null;
  editingMedida?: MedidaData | null;
  onSubmit: (data: MedidaForm) => void;
  isLoading: boolean;
  onCancel: () => void;
}

const MedidaFormComponent: React.FC<MedidaFormComponentProps> = ({ 
  medida, 
  editingMedida,
  onSubmit, 
  isLoading, 
  onCancel
}) => {
  const [formData, setFormData] = useState<MedidaForm>({
    codigo: medida?.codigo || "",
    nombre: medida?.nombre || "",
    abreviatura: medida?.abreviatura || "",
    clase_medida: medida?.clase_medida || "",
    cantidad: medida?.cantidad || 1,
    val_excedente: medida?.val_excedente || 0,
    medida_principal: medida?.medida_principal || false,
  });

  const [nextCodigo, setNextCodigo] = useState<string>("");

  // Obtener el siguiente código disponible cuando se crea una nueva medida
  React.useEffect(() => {
    if (!editingMedida) {
      medidasService.getNextCodigo()
        .then(codigo => {
          setNextCodigo(codigo);
          setFormData(prev => ({ ...prev, codigo }));
        })
        .catch(error => {
          console.error('Error obteniendo siguiente código:', error);
          setNextCodigo("M01");
          setFormData(prev => ({ ...prev, codigo: "M01" }));
        });
    }
  }, [editingMedida]);

  // Reiniciar formulario cuando cambie editingMedida
  React.useEffect(() => {
    setFormData({
      id: editingMedida?.id || 0,
      codigo: editingMedida?.codigo || "",
      nombre: editingMedida?.nombre || "",
      abreviatura: editingMedida?.abreviatura || "",
      clase_medida: editingMedida?.clase_medida || "",
      cantidad: editingMedida?.cantidad || 1,
      val_excedente: editingMedida?.val_excedente || 0,
      medida_principal: editingMedida?.medida_principal || false,
    });
  }, [editingMedida]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (field: keyof MedidaForm, value: string | number | boolean) => {
    // No permitir cambios manuales al código cuando se está creando
    if (field === 'codigo' && !editingMedida) {
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
        <Ruler className="w-5 h-5 text-cyan-600" />
        <h2 className="text-lg font-semibold text-cyan-800">
          {editingMedida ? 'Editar Medida' : 'Nueva Medida'}
        </h2>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Primera fila */}
          <div className="grid grid-cols-12 gap-4">
            {/* Código */}
            <div className="col-span-2 space-y-2">
              <Label htmlFor="codigo" className="text-sm font-medium">Código</Label>
              <Input
                id="codigo"
                value={editingMedida ? formData.id : (nextCodigo || "Cargando...")}
                onChange={(e) => handleInputChange('codigo', e.target.value)}
                readOnly={true}
                className="h-8 text-sm bg-red-50 border-red-200 text-red-600 font-bold cursor-default"
                autoComplete="off"
              />
            </div>

            {/* Abreviatura */}
            <div className="col-span-3 space-y-2">
              <Label htmlFor="abreviatura" className="text-sm font-medium">Abreviatura *</Label>
              <Input
                id="abreviatura"
                value={formData.abreviatura}
                onChange={(e) => handleInputChange('abreviatura', e.target.value)}
                required
                className="h-8 text-sm"
                autoComplete="off"
              />
            </div>

            {/* Cantidad */}
            <div className="col-span-3 space-y-2">
              <Label htmlFor="cantidad" className="text-sm font-medium">Cantidad *</Label>
              <Input
                id="cantidad"
                type="number"
                step="0.001"
                value={formData.cantidad}
                onChange={(e) => handleInputChange('cantidad', parseFloat(e.target.value) || 0)}
                required
                className="h-8 text-sm"
                autoComplete="off"
              />
            </div>

            {/* Valor Excedente */}
            <div className="col-span-4 space-y-2">
              <Label htmlFor="val_excedente" className="text-sm font-medium">Valor Excedente</Label>
              <Input
                id="val_excedente"
                type="number"
                step="0.01"
                value={formData.val_excedente}
                onChange={(e) => handleInputChange('val_excedente', parseFloat(e.target.value) || 0)}
                className="h-8 text-sm"
                autoComplete="off"
              />
            </div>
          </div>

          {/* Segunda fila */}
          <div className="grid grid-cols-12 gap-4">
            {/* Medida Principal */}
            <div className="col-span-3 space-y-2">
              <Label htmlFor="medida_principal" className="text-sm font-medium">Medida principal</Label>
              <div className="flex items-center space-x-2">
                <input
                  id="medida_principal"
                  type="checkbox"
                  checked={formData.medida_principal || false}
                  onChange={(e) => handleInputChange('medida_principal', e.target.checked)}
                  className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Sí</span>
              </div>
            </div>

            {/* Clase Medida */}
            <div className="col-span-4 space-y-2">
              <Label htmlFor="clase_medida" className="text-sm font-medium">Clase Medida</Label>
              <Select
                value={formData.clase_medida || "sin_clase"}
                onValueChange={(value) => handleInputChange('clase_medida', value === "sin_clase" ? "" : value)}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Seleccionar clase" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sin_clase">Sin clase</SelectItem>
                  <SelectItem value="Peso">Peso</SelectItem>
                  <SelectItem value="Volumen">Volumen</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Nombre */}
            <div className="col-span-5 space-y-2">
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
const MedidasPage: React.FC = () => {
  const { startLoading, stopLoading } = useLoading();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Estados
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("active");
  const [activeTab, setActiveTab] = useState("medidas");
  const [editingMedida, setEditingMedida] = useState<MedidaData | null>(null);

  // Queries
  const { data: medidas = [], isLoading } = useQuery({
    queryKey: ["medidas"],
    queryFn: medidasService.listMedidas,
  });

  // Log cuando los datos cambien
  React.useEffect(() => {
    console.log("📊 Datos de medidas actualizados:", medidas);
    console.log("📊 Estados de medidas:", medidas.map(m => ({ 
      id: m.id, 
      nombre: m.nombre, 
      estado: m.estado,
      tipoEstado: typeof m.estado,
      esActivo: m.estado === 1,
      esInactivo: m.estado === 0
    })));
  }, [medidas]);

  // Mutations
  const createMedidaMutation = useMutation({
    mutationFn: async (data: MedidaForm) => {
      startLoading();
      const medidaData: MedidaData = {
        id: 0, // ID temporal para creación
        codigo: data.codigo!,
        nombre: data.nombre,
        abreviatura: data.abreviatura,
        clase_medida: data.clase_medida || undefined,
        cantidad: data.cantidad,
        val_excedente: data.val_excedente,
        medida_principal: data.medida_principal || false,
        estado: 1
      };
      
      return await medidasService.createMedida(medidaData);
    },
    onSuccess: () => {
      stopLoading();
      toast({
        title: "✅ Medida Creada",
        description: "La nueva medida ha sido creada exitosamente y está lista para usar.",
        className: "bg-green-50 border-green-200 text-green-800",
      });
      queryClient.invalidateQueries({ queryKey: ['medidas'] });
      setActiveTab("medidas");
      setEditingMedida(null);
    },
    onError: (error: any) => {
      stopLoading();
      console.error('Error al crear medida:', error);
      toast({
        title: '❌ Error al Crear',
        description: error.message || 'No se pudo crear la medida. Verifique los datos e intente nuevamente.',
        variant: 'destructive',
        className: "bg-red-50 border-red-200 text-red-800",
      });
    },
  });

  const updateMedidaMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<MedidaData> }) =>
      medidasService.updateMedida(id, data),
    onSuccess: () => {
      stopLoading();
      toast({
        title: "✅ Medida Actualizada",
        description: "Los cambios en la medida han sido guardados exitosamente.",
        className: "bg-green-50 border-green-200 text-green-800",
      });
      queryClient.invalidateQueries({ queryKey: ['medidas'] });
      setActiveTab("medidas");
      setEditingMedida(null);
    },
    onError: (error: any) => {
      stopLoading();
      console.error('Error al actualizar medida:', error);
      toast({
        title: '❌ Error al Actualizar',
        description: error.message || 'No se pudo actualizar la medida. Verifique los datos e intente nuevamente.',
        variant: 'destructive',
        className: "bg-red-50 border-red-200 text-red-800",
      });
    },
  });

  const activateMedidaMutation = useMutation({
    mutationFn: medidasService.activateMedida,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medidas'] });
      toast({
        title: '✅ Medida Activada',
        description: 'La medida ha sido activada correctamente y está disponible para uso.',
        className: "bg-green-50 border-green-200 text-green-800",
      });
    },
    onError: (error: any) => {
      console.error('Error al activar medida:', error);
      toast({
        title: '❌ Error al Activar',
        description: error.message || 'No se pudo activar la medida. Intente nuevamente.',
        variant: 'destructive',
        className: "bg-red-50 border-red-200 text-red-800",
      });
    },
  });

  const deactivateMedidaMutation = useMutation({
    mutationFn: medidasService.deactivateMedida,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medidas'] });
      toast({
        title: '⚠️ Medida Desactivada',
        description: 'La medida ha sido desactivada y ya no está disponible para uso.',
        className: "bg-yellow-50 border-yellow-200 text-yellow-800",
      });
    },
    onError: (error: any) => {
      console.error('Error al desactivar medida:', error);
      toast({
        title: '❌ Error al Desactivar',
        description: error.message || 'No se pudo desactivar la medida. Intente nuevamente.',
        variant: 'destructive',
        className: "bg-red-50 border-red-200 text-red-800",
      });
    },
  });

  const deleteMedidaMutation = useMutation({
    mutationFn: medidasService.deleteMedidaPermanent,
    onSuccess: (deletedMedida) => {
      queryClient.invalidateQueries({ queryKey: ['medidas'] });
      toast({
        title: '✅ Medida Eliminada',
        description: `La medida "${deletedMedida.nombre}" ha sido eliminada permanentemente de la base de datos`,
        className: "bg-green-50 border-green-200 text-green-800",
      });
    },
    onError: (error: any) => {
      console.error('Error al eliminar medida:', error);
      toast({
        title: '❌ Error al Eliminar',
        description: error.message || 'No se pudo eliminar la medida. Verifique que no tenga referencias en otras tablas.',
        variant: 'destructive',
        className: "bg-red-50 border-red-200 text-red-800",
      });
    },
  });

  // Filtros
  const medidasFiltradas = useMemo(() => {
    console.log("🔍 Filtrando medidas. Total:", medidas.length, "Filtros:", { searchTerm, statusFilter });
    const filtered = (medidas as MedidaData[]).filter((medida: MedidaData) => {
      const matchesSearch = 
        (medida.id?.toString() || '').includes(searchTerm.toLowerCase()) ||
        (medida.nombre?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (medida.abreviatura?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (medida.clase_medida && medida.clase_medida.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "active" && (medida.estado === 1 || medida.estado === undefined)) ||
        (statusFilter === "inactive" && medida.estado === 0);
      
      return matchesSearch && matchesStatus;
    });
    console.log("🔍 Medidas filtradas:", filtered.length, "IDs:", filtered.map(m => m.id));
    return filtered;
  }, [medidas, searchTerm, statusFilter]);

  // Handlers
  const handleEditarMedida = (medida: MedidaData) => {
    setEditingMedida(medida);
    setActiveTab("formulario");
  };

  const handleNuevaMedida = () => {
    setEditingMedida(null);
    setActiveTab("formulario");
  };

  const handleActivateMedida = (id: number) => {
    activateMedidaMutation.mutate(id);
  };

  const handleDeactivateMedida = (id: number) => {
    deactivateMedidaMutation.mutate(id);
  };

  const handleDeleteMedida = (id: number) => {
    deleteMedidaMutation.mutate(id);
  };

  return (
    <div className="p-4 max-w-full mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-extrabold text-cyan-800 flex items-center gap-2 mb-2">
          <Ruler className="w-8 h-8 text-cyan-600" />
          Gestión de Medidas
        </h1>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-cyan-100/60 p-1 rounded-lg">
          <TabsTrigger
            value="medidas"
            className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md transition-all duration-300"
          >
            <Ruler className="w-4 h-4 mr-2" />
            Medidas
          </TabsTrigger>
          <TabsTrigger
            value="formulario"
            onClick={handleNuevaMedida}
            className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            {editingMedida ? 'Editar Medida' : 'Nueva Medida'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="medidas" className="mt-6">
          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 border-b border-cyan-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Ruler className="w-5 h-5 text-cyan-600" />
                  <span className="text-lg font-semibold text-gray-700">MEDIDAS</span>
                </div>
                <div className="flex space-x-2">
                  <Can action="accion-crear-medida">
                    <Button
                      onClick={handleNuevaMedida}
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
                      placeholder="Buscar por código, nombre, abreviatura o clase..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10"
                      autoComplete="off"
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
                    <TableRow className="text-left font-semibold text-gray-700">
                      <TableHead className="px-2 py-1 text-teal-600 w-20">Acciones</TableHead>
                      <TableHead className="px-4 py-3 w-20">Código</TableHead>
                      <TableHead className="px-4 py-3">Nombre</TableHead>
                      <TableHead className="px-4 py-3 w-24">Abreviatura</TableHead>
                      <TableHead className="px-4 py-3">Clase</TableHead>
                      <TableHead className="px-4 py-3 w-20">Cantidad</TableHead>
                      <TableHead className="px-4 py-3 w-24">Valor Excedente</TableHead>
                      <TableHead className="px-4 py-3 w-24">Principal</TableHead>
                      <TableHead className="px-4 py-3 w-24">Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={9} className="h-24 text-center">
                          <div className="flex items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin mr-2" />
                            Cargando medidas...
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : medidasFiltradas.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="h-24 text-center">
                          No hay medidas disponibles.
                        </TableCell>
                      </TableRow>
                    ) : (
                      medidasFiltradas.map((medida: MedidaData) => (
                        <TableRow key={medida.id} className="hover:bg-gray-50">
                          <TableCell className="px-2 py-1">
                            <div className="flex items-center justify-start gap-1">
                              <Can action="accion-editar-medida">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleEditarMedida(medida)}
                                        aria-label="Editar medida"
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

                              {(medida.estado === 1 || medida.estado === undefined) ? (
                                <Can action="accion-desactivar-medida">
                                  <AlertDialog>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <AlertDialogTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              aria-label="Inactivar medida"
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
                                          Esta acción inactivará la medida "{medida.nombre}".
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleDeactivateMedida(medida.id!)}
                                        >
                                          Inactivar
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </Can>
                              ) : (
                                <Can action="accion-activar-medida">
                                  <AlertDialog>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <AlertDialogTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              aria-label="Activar medida"
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
                                          Esta acción activará la medida "{medida.nombre}".
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleActivateMedida(medida.id!)}
                                        >
                                          Activar
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </Can>
                              )}

                              {/* Botón de eliminar para medidas inactivas */}
                              {medida.estado === 0 && (
                                <Can action="accion-eliminar-medida">
                                  <AlertDialog>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <AlertDialogTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              aria-label="Eliminar medida"
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
                                              ¿Estás seguro de que deseas eliminar permanentemente la medida <strong>"{medida.nombre}"</strong>?
                                            </p>
                                          </div>
                                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                            <div className="flex items-center gap-2 text-yellow-800 font-semibold mb-2">
                                              <Info className="h-4 w-4" />
                                              IMPACTO
                                            </div>
                                            <ul className="text-yellow-700 text-sm space-y-1">
                                              <li>• La medida será eliminada permanentemente de la base de datos</li>
                                              <li>• Los productos asociados a esta medida perderán la referencia</li>
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
                                          onClick={() => handleDeleteMedida(medida.id!)}
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
                          <TableCell className="px-3 py-2 text-sm text-gray-900 font-medium w-20">
                            {medida.id}
                          </TableCell>
                          <TableCell className="px-3 py-2 text-sm text-gray-900">
                            {medida.nombre}
                          </TableCell>
                          <TableCell className="px-3 py-2 text-sm text-gray-900 w-24">
                            {medida.abreviatura}
                          </TableCell>
                          <TableCell className="px-3 py-2 text-sm text-gray-900">
                            {medida.clase_medida || "-"}
                          </TableCell>
                          <TableCell className="px-3 py-2 text-sm text-gray-900 w-20">
                            {medida.cantidad}
                          </TableCell>
                          <TableCell className="px-3 py-2 text-sm text-gray-900 w-24">
                            {medida.val_excedente || "0.00"}
                          </TableCell>
                          <TableCell className="px-3 py-2 text-sm text-gray-900 w-24">
                            {medida.medida_principal ? (
                              <Badge variant="default" className="bg-blue-100 text-blue-800">
                                Sí
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                                No
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="px-3 py-2">
                            <Badge
                              variant={(medida.estado === 1 || medida.estado === undefined) ? "default" : "secondary"}
                              className={
                                (medida.estado === 1 || medida.estado === undefined)
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }
                            >
                              {(medida.estado === 1 || medida.estado === undefined) ? "Activo" : "Inactivo"}
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
          <MedidaFormComponent
            medida={editingMedida}
            editingMedida={editingMedida}
            onSubmit={(data) => {
              if (editingMedida) {
                updateMedidaMutation.mutate({ id: editingMedida.id!, data });
              } else {
                // Para crear, no incluir el id
                const { id, ...createData } = data as any;
                createMedidaMutation.mutate(createData);
              }
            }}
            isLoading={createMedidaMutation.isPending || updateMedidaMutation.isPending}
            onCancel={() => {
              setEditingMedida(null);
              setActiveTab("medidas");
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MedidasPage;
