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
  Tag, 
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
import { sublineasService, SublineaData, SublineaForm, LineaData } from '@/services/sublineasService';

// Form Component
interface SublineaFormComponentProps {
  sublinea?: SublineaData | null;
  editingSublinea?: SublineaData | null;
  lineas: LineaData[];
  onSubmit: (data: SublineaForm) => void;
  isLoading: boolean;
  onCancel: () => void;
}

const SublineaFormComponent: React.FC<SublineaFormComponentProps> = ({ 
  sublinea, 
  editingSublinea,
  lineas,
  onSubmit, 
  isLoading, 
  onCancel
}) => {
  const [formData, setFormData] = useState<SublineaForm>({
    id_linea: sublinea?.id_linea || 0,
    codigo: sublinea?.codigo || "",
    nombre: sublinea?.nombre || "",
  });

  const [nextCodigo, setNextCodigo] = useState<string>("");

  // Obtener el siguiente código disponible cuando se crea una nueva sublínea
  React.useEffect(() => {
    if (!editingSublinea) {
      sublineasService.getNextCodigo()
        .then(codigo => {
          setNextCodigo(codigo);
          setFormData(prev => ({ ...prev, codigo }));
        })
        .catch(error => {
          console.error('Error obteniendo siguiente código:', error);
          setNextCodigo("01");
          setFormData(prev => ({ ...prev, codigo: "01" }));
        });
    }
  }, [editingSublinea]);

  // Reiniciar formulario cuando cambie editingSublinea
  React.useEffect(() => {
    setFormData({
      id: sublinea?.id || 0,
      id_linea: sublinea?.id_linea || 0,
      codigo: sublinea?.codigo || "",
      nombre: sublinea?.nombre || "",
    });
  }, [sublinea]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (field: keyof SublineaForm, value: string | number) => {
    // No permitir cambios manuales al código cuando se está creando
    if (field === 'codigo' && !editingSublinea) {
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
        <Tag className="w-5 h-5 text-cyan-600" />
        <h2 className="text-lg font-semibold text-cyan-800">
          {editingSublinea ? 'Editar Sublínea' : 'Nueva Sublínea'}
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
                value={editingSublinea ? formData.codigo : (nextCodigo || "Cargando...")}
                onChange={(e) => handleInputChange('codigo', e.target.value)}
                readOnly={!editingSublinea}
                className="h-8 text-sm bg-red-50 border-red-200 text-red-600 font-bold cursor-default"
                autoComplete="off"
              />
            </div>

            {/* Nombre */}
            <div className="col-span-7 space-y-2">
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

            {/* Línea */}
            <div className="col-span-3 space-y-2">
              <Label htmlFor="id_linea" className="text-sm font-medium">Línea *</Label>
              <Select
                value={formData.id_linea.toString()}
                onValueChange={(value) => handleInputChange('id_linea', parseInt(value))}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {lineas.map((linea) => (
                    <SelectItem key={linea.id} value={linea.id.toString()}>
                      {linea.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Segunda fila */}
          <div className="grid grid-cols-12 gap-4">
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
const SublineasPage: React.FC = () => {
  const { startLoading, stopLoading } = useLoading();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Estados
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("active");
  const [activeTab, setActiveTab] = useState("sublineas");
  const [editingSublinea, setEditingSublinea] = useState<SublineaData | null>(null);

  // Queries
  const { data: sublineas = [], isLoading } = useQuery({
    queryKey: ["sublineas"],
    queryFn: sublineasService.listSublineas,
  });

  // Log cuando los datos cambien
  React.useEffect(() => {
    console.log("📊 Datos de sublíneas actualizados:", sublineas);
    console.log("📊 Estados de sublíneas:", sublineas.map(s => ({ id: s.id, nombre: s.nombre, estado: s.estado })));
  }, [sublineas]);

  const { data: lineas = [] } = useQuery({
    queryKey: ["lineas"],
    queryFn: sublineasService.listLineas,
  });

  // Mutations
  const createSublineaMutation = useMutation({
    mutationFn: async (data: SublineaForm) => {
      startLoading();
      const sublineaData = {
        id: 0, // ID temporal para creación
        id_linea: data.id_linea,
        codigo: data.codigo!,
        nombre: data.nombre,
        estado: 1
      } as SublineaData;
      
      return await sublineasService.createSublinea(sublineaData);
    },
    onSuccess: () => {
      stopLoading();
      toast({
        title: "✅ Sublínea Creada",
        description: "La nueva sublínea ha sido creada exitosamente y está lista para usar.",
        className: "bg-green-50 border-green-200 text-green-800",
      });
      queryClient.invalidateQueries({ queryKey: ['sublineas'] });
      setActiveTab("sublineas");
      setEditingSublinea(null);
    },
    onError: (error: any) => {
      stopLoading();
      console.error('Error al crear sublínea:', error);
      toast({
        title: '❌ Error al Crear',
        description: error.message || 'No se pudo crear la sublínea. Verifique los datos e intente nuevamente.',
        variant: 'destructive',
        className: "bg-red-50 border-red-200 text-red-800",
      });
    },
  });

  const updateSublineaMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<SublineaData> }) =>
      sublineasService.updateSublinea(id, data),
    onSuccess: () => {
      stopLoading();
      toast({
        title: "✅ Sublínea Actualizada",
        description: "Los cambios en la sublínea han sido guardados exitosamente.",
        className: "bg-green-50 border-green-200 text-green-800",
      });
      queryClient.invalidateQueries({ queryKey: ['sublineas'] });
      setActiveTab("sublineas");
      setEditingSublinea(null);
    },
    onError: (error: any) => {
      stopLoading();
      console.error('Error al actualizar sublínea:', error);
      toast({
        title: '❌ Error al Actualizar',
        description: error.message || 'No se pudo actualizar la sublínea. Verifique los datos e intente nuevamente.',
        variant: 'destructive',
        className: "bg-red-50 border-red-200 text-red-800",
      });
    },
  });

  const activateSublineaMutation = useMutation({
    mutationFn: sublineasService.activateSublinea,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sublineas'] });
      toast({
        title: '✅ Sublínea Activada',
        description: 'La sublínea ha sido activada correctamente y está disponible para uso.',
        className: "bg-green-50 border-green-200 text-green-800",
      });
    },
    onError: (error: any) => {
      console.error('Error al activar sublínea:', error);
      toast({
        title: '❌ Error al Activar',
        description: error.message || 'No se pudo activar la sublínea. Intente nuevamente.',
        variant: 'destructive',
        className: "bg-red-50 border-red-200 text-red-800",
      });
    },
  });

  const deactivateSublineaMutation = useMutation({
    mutationFn: sublineasService.deactivateSublinea,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sublineas'] });
      toast({
        title: '⚠️ Sublínea Desactivada',
        description: 'La sublínea ha sido desactivada y ya no está disponible para uso.',
        className: "bg-yellow-50 border-yellow-200 text-yellow-800",
      });
    },
    onError: (error: any) => {
      console.error('Error al desactivar sublínea:', error);
      toast({
        title: '❌ Error al Desactivar',
        description: error.message || 'No se pudo desactivar la sublínea. Intente nuevamente.',
        variant: 'destructive',
        className: "bg-red-50 border-red-200 text-red-800",
      });
    },
  });

  const deleteSublineaMutation = useMutation({
    mutationFn: sublineasService.deleteSublineaPermanent,
    onSuccess: (deletedSublinea) => {
      queryClient.invalidateQueries({ queryKey: ['sublineas'] });
      toast({
        title: '✅ Sublínea Eliminada',
        description: `La sublínea "${deletedSublinea.nombre}" ha sido eliminada permanentemente de la base de datos`,
        className: "bg-green-50 border-green-200 text-green-800",
      });
    },
    onError: (error: any) => {
      console.error('Error al eliminar sublínea:', error);
      toast({
        title: '❌ Error al Eliminar',
        description: error.message || 'No se pudo eliminar la sublínea. Verifique que no tenga referencias en otras tablas.',
        variant: 'destructive',
        className: "bg-red-50 border-red-200 text-red-800",
      });
    },
  });

  // Filtros
  const sublineasFiltradas = useMemo(() => {
    console.log("🔍 Filtrando sublíneas. Total:", sublineas.length, "Filtros:", { searchTerm, statusFilter });
    const filtered = (sublineas as SublineaData[]).filter((sublinea: SublineaData) => {
      const matchesSearch = 
        (sublinea.codigo?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (sublinea.nombre?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (sublinea.inv_lineas?.nombre?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "active" && sublinea.estado === 1) ||
        (statusFilter === "inactive" && sublinea.estado === 0);
      
      return matchesSearch && matchesStatus;
    });
    console.log("🔍 Sublíneas filtradas:", filtered.length, "IDs:", filtered.map(s => s.id));
    return filtered;
  }, [sublineas, searchTerm, statusFilter]);

  // Handlers
  const handleEditarSublinea = (sublinea: SublineaData) => {
    setEditingSublinea(sublinea);
    setActiveTab("formulario");
  };

  const handleNuevaSublinea = () => {
    setEditingSublinea(null);
    setActiveTab("formulario");
  };

  const handleActivateSublinea = (id: number) => {
    activateSublineaMutation.mutate(id);
  };

  const handleDeactivateSublinea = (id: number) => {
    deactivateSublineaMutation.mutate(id);
  };

  const handleDeleteSublinea = (id: number) => {
    deleteSublineaMutation.mutate(id);
  };

  return (
    <div className="p-4 max-w-full mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-extrabold text-cyan-800 flex items-center gap-2 mb-2">
          <Tag className="w-8 h-8 text-cyan-600" />
          Gestión de Sublíneas
        </h1>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-cyan-100/60 p-1 rounded-lg">
          <TabsTrigger
            value="sublineas"
            className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md transition-all duration-300"
          >
            <Tag className="w-4 h-4 mr-2" />
            Sublíneas
          </TabsTrigger>
          <TabsTrigger
            value="formulario"
            onClick={handleNuevaSublinea}
            className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            {editingSublinea ? 'Editar Sublínea' : 'Nueva Sublínea'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sublineas" className="mt-6">
          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 border-b border-cyan-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="w-5 h-5 text-cyan-600" />
                  <span className="text-lg font-semibold text-gray-700">SUBLÍNEAS</span>
                </div>
                <div className="flex space-x-2">
                  <Can action="accion-crear-sublinea">
                    <Button
                      onClick={handleNuevaSublinea}
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
                      placeholder="Buscar por código, nombre o línea..."
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
                      <TableHead className="px-4 py-3">Línea</TableHead>
                      <TableHead className="px-4 py-3 w-24">Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          <div className="flex items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin mr-2" />
                            Cargando sublíneas...
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : sublineasFiltradas.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          No hay sublíneas disponibles.
                        </TableCell>
                      </TableRow>
                    ) : (
                      sublineasFiltradas.map((sublinea: SublineaData) => (
                        <TableRow key={sublinea.id} className="hover:bg-gray-50">
                          <TableCell className="px-2 py-1">
                            <div className="flex items-center justify-start gap-1">
                              <Can action="accion-editar-sublinea">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleEditarSublinea(sublinea)}
                                        aria-label="Editar sublínea"
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

                              {sublinea.estado === 1 ? (
                                <Can action="accion-desactivar-sublinea">
                                  <AlertDialog>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <AlertDialogTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              aria-label="Inactivar sublínea"
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
                                          Esta acción inactivará la sublínea "{sublinea.nombre}".
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleDeactivateSublinea(sublinea.id!)}
                                        >
                                          Inactivar
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </Can>
                              ) : (
                                <Can action="accion-activar-sublinea">
                                  <AlertDialog>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <AlertDialogTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              aria-label="Activar sublínea"
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
                                          Esta acción activará la sublínea "{sublinea.nombre}".
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleActivateSublinea(sublinea.id!)}
                                        >
                                          Activar
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </Can>
                              )}

                              {/* Botón de eliminar para sublíneas inactivas */}
                              {sublinea.estado === 0 && (
                                <Can action="accion-eliminar-sublinea">
                                  <AlertDialog>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <AlertDialogTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              aria-label="Eliminar sublínea"
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
                                              ¿Estás seguro de que deseas eliminar permanentemente la sublínea <strong>"{sublinea.nombre}"</strong>?
                                            </p>
                                          </div>
                                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                            <div className="flex items-center gap-2 text-yellow-800 font-semibold mb-2">
                                              <Info className="h-4 w-4" />
                                              IMPACTO
                                            </div>
                                            <ul className="text-yellow-700 text-sm space-y-1">
                                              <li>• La sublínea será eliminada permanentemente de la base de datos</li>
                                              <li>• Los productos asociados a esta sublínea perderán la referencia</li>
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
                                          onClick={() => handleDeleteSublinea(sublinea.id!)}
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
                            {sublinea.codigo}
                          </TableCell>
                          <TableCell className="px-3 py-2 text-sm text-gray-900">
                            {sublinea.nombre}
                          </TableCell>
                          <TableCell className="px-3 py-2 text-sm text-gray-900">
                            {sublinea.inv_lineas?.nombre || "-"}
                          </TableCell>
                          <TableCell className="px-3 py-2">
                            <Badge
                              variant={sublinea.estado === 1 ? "default" : "secondary"}
                              className={
                                sublinea.estado === 1
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }
                            >
                              {sublinea.estado === 1 ? "Activo" : "Inactivo"}
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
          <SublineaFormComponent
            sublinea={editingSublinea}
            editingSublinea={editingSublinea}
            lineas={lineas}
            onSubmit={(data) => {
              if (editingSublinea) {
                updateSublineaMutation.mutate({ id: editingSublinea.id!, data });
              } else {
                // Para crear, no incluir el id
                const { id, ...createData } = data as any;
                createSublineaMutation.mutate(createData);
              }
            }}
            isLoading={createSublineaMutation.isPending || updateSublineaMutation.isPending}
            onCancel={() => {
              setEditingSublinea(null);
              setActiveTab("sublineas");
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SublineasPage;
