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
import { lineasService, LineaData, LineaForm, CategoriaData } from '@/services/lineasService';

// Form Component
interface LineaFormComponentProps {
  linea?: LineaData | null;
  editingLinea?: LineaData | null;
  categorias: CategoriaData[];
  onSubmit: (data: LineaForm) => void;
  isLoading: boolean;
  onCancel: () => void;
}

const LineaFormComponent: React.FC<LineaFormComponentProps> = ({
  linea,
  editingLinea,
  categorias,
  onSubmit,
  isLoading,
  onCancel
}) => {
  const [formData, setFormData] = useState<LineaForm>({
    codigo: linea?.codigo || "",
    nombre: linea?.nombre || "",
    id_categoria: linea?.id_categoria || 0,
  });

  const [nextCodigo, setNextCodigo] = useState<string>("");

  // Obtener el siguiente código disponible cuando se crea una nueva línea
  React.useEffect(() => {
    if (!editingLinea) {
      lineasService.getNextCodigo()
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
  }, [editingLinea]);

  // Reiniciar formulario cuando cambie editingLinea
  React.useEffect(() => {
    setFormData({
      codigo: linea?.codigo || "",
      nombre: linea?.nombre || "",
      id_categoria: linea?.id_categoria || 0,
    });
  }, [linea]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (field: keyof LineaForm, value: string | number) => {
    // No permitir cambios manuales al código cuando se está creando
    if (field === 'codigo' && !editingLinea) {
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
          {editingLinea ? 'Editar Línea' : 'Nueva Línea'}
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
                value={editingLinea ? formData.codigo : (nextCodigo || "Cargando...")}
                onChange={(e) => handleInputChange('codigo', e.target.value)}
                readOnly={!editingLinea}
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

            {/* Categoría */}
            <div className="col-span-3 space-y-2">
              <Label htmlFor="categoria" className="text-sm font-medium">Categoría *</Label>
              <Select
                value={formData.id_categoria.toString()}
                onValueChange={(value) => handleInputChange('id_categoria', parseInt(value))}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((categoria) => (
                    <SelectItem key={categoria.id} value={categoria.id.toString()}>
                      {categoria.nombre}
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
const LineasPage: React.FC = () => {
  const { startLoading, stopLoading } = useLoading();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Estados
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("active");
  const [activeTab, setActiveTab] = useState("lineas");
  const [editingLinea, setEditingLinea] = useState<LineaData | null>(null);

  // Queries
  const { data: lineas = [], isLoading } = useQuery({
    queryKey: ["lineas"],
    queryFn: lineasService.listLineas,
  });

  // Log cuando los datos cambien
  React.useEffect(() => {
    console.log("📊 Datos de líneas actualizados:", lineas);
    console.log("📊 Estados de líneas:", lineas.map(l => ({ id: l.id, nombre: l.nombre, estado: l.estado })));
  }, [lineas]);

  const { data: categorias = [] } = useQuery({
    queryKey: ["categorias"],
    queryFn: lineasService.listCategorias,
  });

  // Mutations
  const createLineaMutation = useMutation({
    mutationFn: async (data: LineaForm) => {
      startLoading();
      const lineaData: LineaData = {
        codigo: data.codigo!,
        nombre: data.nombre,
        id_categoria: data.id_categoria,
        estado: 1
      };

      return await lineasService.createLinea(lineaData);
    },
    onSuccess: () => {
      stopLoading();
      toast({
        title: "Línea creada",
        description: "La línea ha sido creada exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ['lineas'] });
      setActiveTab("lineas");
    },
    onError: (error: any) => {
      stopLoading();
      toast({
        title: "Error al crear línea",
        description: error.message || "Hubo un error al crear la línea",
        variant: "destructive",
      });
    },
  });

  const updateLineaMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: LineaForm }) => {
      startLoading();
      return await lineasService.updateLinea(id, data);
    },
    onSuccess: () => {
      stopLoading();
      toast({
        title: "Línea actualizada",
        description: "La línea ha sido actualizada exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ['lineas'] });
      setActiveTab("lineas");
      setEditingLinea(null);
    },
    onError: (error: any) => {
      stopLoading();
      toast({
        title: "Error al actualizar línea",
        description: error.message || "Hubo un error al actualizar la línea",
        variant: "destructive",
      });
    },
  });

  const deleteLineaMutation = useMutation({
    mutationFn: async (id: number) => {
      console.log("🗑️ Iniciando eliminación de línea con ID:", id);
      startLoading();
      try {
        const result = await lineasService.deleteLineaPermanent(id);
        console.log("✅ Eliminación exitosa, resultado:", result);
        return result;
      } catch (error) {
        console.error("❌ Error en eliminación:", error);
        throw error;
      } finally {
        stopLoading();
      }
    },
    onSuccess: (data) => {
      console.log("🎉 onSuccess llamado con data:", data);
      toast({
        title: "✅ Línea Eliminada",
        description: `La línea ha sido eliminada permanentemente de la base de datos`,
        className: "bg-green-50 border-green-200 text-green-800",
      });

      // Invalidar y refetch inmediatamente
      queryClient.invalidateQueries({ queryKey: ['lineas'] });
      queryClient.refetchQueries({ queryKey: ['lineas'] });

      console.log("🔄 Query invalidada y refetch ejecutado");
    },
    onError: (error: any) => {
      console.error("❌ onError llamado con error:", error);

      let errorMessage = "Hubo un error al eliminar la línea";

      // Verificar si es un error de restricción de clave foránea
      if (error.code === "23503" || error.message?.includes("foreign key constraint")) {
        errorMessage = "No se puede eliminar la línea porque tiene sublíneas o productos asociados. Primero elimine las sublíneas y productos relacionados.";
      } else if (error.message?.includes("violates foreign key constraint")) {
        errorMessage = "No se puede eliminar la línea porque tiene dependencias en otras tablas. Verifique que no haya sublíneas o productos asociados.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "❌ Error al Eliminar",
        description: errorMessage,
        variant: "destructive",
        className: "bg-red-50 border-red-200 text-red-800",
      });
    },
  });

  const activateLineaMutation = useMutation({
    mutationFn: async (id: number) => {
      startLoading();
      return await lineasService.activateLinea(id);
    },
    onSuccess: () => {
      stopLoading();
      toast({
        title: "Línea activada",
        description: "La línea ha sido activada exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ['lineas'] });
    },
    onError: (error: any) => {
      stopLoading();
      toast({
        title: "Error al activar línea",
        description: error.message || "Hubo un error al activar la línea",
        variant: "destructive",
      });
    },
  });

  const deactivateLineaMutation = useMutation({
    mutationFn: async (id: number) => {
      startLoading();
      return await lineasService.deactivateLinea(id);
    },
    onSuccess: () => {
      stopLoading();
      toast({
        title: "Línea desactivada",
        description: "La línea ha sido desactivada exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ['lineas'] });
    },
    onError: (error: any) => {
      stopLoading();
      toast({
        title: "Error al desactivar línea",
        description: error.message || "Hubo un error al desactivar la línea",
        variant: "destructive",
      });
    },
  });

  // Filtros
  const lineasFiltradas = useMemo(() => {
    console.log("🔍 Filtrando líneas. Total:", lineas.length, "Filtros:", { searchTerm, statusFilter });
    const filtered = (lineas as LineaData[]).filter((linea: LineaData) => {
      const matchesSearch = 
        (linea.codigo?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (linea.nombre?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (linea.inv_categorias?.nombre?.toLowerCase() || '').includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "all" ||
        (statusFilter === "active" && linea.estado === 1) ||
        (statusFilter === "inactive" && linea.estado === 0);

      return matchesSearch && matchesStatus;
    });
    console.log("🔍 Líneas filtradas:", filtered.length, "IDs:", filtered.map(l => l.id));
    return filtered;
  }, [lineas, searchTerm, statusFilter]);

  // Handlers
  const handleEditarLinea = (linea: LineaData) => {
    setEditingLinea(linea);
    setActiveTab("formulario");
  };

  const handleNuevaLinea = () => {
    setEditingLinea(null);
    setActiveTab("formulario");
  };

  const handleDeleteLinea = (id: number) => {
    console.log("🔥 handleDeleteLinea llamado con ID:", id);
    console.log("🔥 Estado de la mutación antes:", deleteLineaMutation.isPending);
    deleteLineaMutation.mutate(id);
  };

  const handleActivateLinea = (id: number) => {
    activateLineaMutation.mutate(id);
  };

  const handleDeactivateLinea = (id: number) => {
    deactivateLineaMutation.mutate(id);
  };

  return (
    <div className="p-4 max-w-full mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-extrabold text-cyan-800 flex items-center gap-2 mb-2">
          <Tag className="w-8 h-8 text-cyan-600" />
          Gestión de Líneas
        </h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-cyan-100/60 p-1 rounded-lg">
          <TabsTrigger
            value="lineas"
            className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md transition-all duration-300"
          >
            <Tag className="w-4 h-4 mr-2" />
            Líneas
          </TabsTrigger>
          <TabsTrigger
            value="formulario"
            onClick={handleNuevaLinea}
            className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            {editingLinea ? 'Editar Línea' : 'Nueva Línea'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lineas" className="mt-6">
          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 border-b border-cyan-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="w-5 h-5 text-cyan-600" />
                  <span className="text-lg font-semibold text-gray-700">LÍNEAS</span>
                </div>
                <div className="flex space-x-2">
                  <Can action="accion-crear-linea">
                    <Button
                      onClick={handleNuevaLinea}
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
                      placeholder="Buscar por código, nombre o categoría..."
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
                    <TableRow className="text-left font-semibold text-gray-700">
                      <TableHead className="px-2 py-1 text-teal-600 w-20">Acciones</TableHead>
                      <TableHead className="px-4 py-3 w-20">Código</TableHead>
                      <TableHead className="px-4 py-3">Nombre</TableHead>
                      <TableHead className="px-4 py-3">Categoría</TableHead>
                      <TableHead className="px-4 py-3 w-24">Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          <div className="flex items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin mr-2" />
                            Cargando líneas...
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : lineasFiltradas.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          No hay líneas disponibles.
                        </TableCell>
                      </TableRow>
                    ) : (
                      lineasFiltradas.map((linea: LineaData) => (
                        <TableRow key={linea.id} className="hover:bg-gray-50">
                          <TableCell className="px-2 py-1">
                            <div className="flex items-center justify-start gap-1">
                              <Can action="accion-editar-linea">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleEditarLinea(linea)}
                                        aria-label="Editar línea"
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

                              {linea.estado === 1 ? (
                                <Can action="accion-desactivar-linea">
                                  <AlertDialog>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <AlertDialogTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              aria-label="Inactivar línea"
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
                                          Esta acción inactivará la línea "{linea.nombre}".
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleDeactivateLinea(linea.id!)}
                                        >
                                          Inactivar
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </Can>
                              ) : (
                                <Can action="accion-activar-linea">
                                  <AlertDialog>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <AlertDialogTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              aria-label="Activar línea"
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
                                          Esta acción activará la línea "{linea.nombre}".
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleActivateLinea(linea.id!)}
                                        >
                                          Activar
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </Can>
                              )}

                              {/* Botón de eliminar para líneas inactivas */}
                              {linea.estado === 0 && (
                                <Can action="accion-eliminar-linea">
                                  <AlertDialog>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <AlertDialogTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              aria-label="Eliminar línea"
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
                                              ¿Estás seguro de que deseas eliminar permanentemente la línea <strong>"{linea.nombre}"</strong>?
                                            </p>
                                          </div>
                                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                            <div className="flex items-center gap-2 text-yellow-800 font-semibold mb-2">
                                              <Info className="h-4 w-4" />
                                              IMPACTO
                                            </div>
                                            <ul className="text-yellow-700 text-sm space-y-1">
                                              <li>• La línea será eliminada permanentemente de la base de datos</li>
                                              <li>• Las sublíneas asociadas a esta línea perderán la referencia</li>
                                              <li>• Los productos asociados a esta línea perderán la referencia</li>
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
                                          onClick={() => handleDeleteLinea(linea.id!)}
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
                            {linea.codigo}
                          </TableCell>
                          <TableCell className="px-3 py-2 text-sm text-gray-900">
                            {linea.nombre}
                          </TableCell>
                          <TableCell className="px-3 py-2 text-sm text-gray-900">
                            {linea.inv_categorias?.nombre || "-"}
                          </TableCell>
                          <TableCell className="px-3 py-2">
                            <Badge
                              variant={linea.estado === 1 ? "default" : "secondary"}
                              className={
                                linea.estado === 1
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }
                            >
                              {linea.estado === 1 ? "Activo" : "Inactivo"}
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
          <LineaFormComponent
            linea={editingLinea}
            editingLinea={editingLinea}
            categorias={categorias}
            onSubmit={(data) => {
              if (editingLinea) {
                updateLineaMutation.mutate({ id: editingLinea.id!, data });
              } else {
                // Para crear, no incluir el id
                const { id, ...createData } = data as any;
                createLineaMutation.mutate(createData);
              }
            }}
            isLoading={createLineaMutation.isPending || updateLineaMutation.isPending}
            onCancel={() => {
              setEditingLinea(null);
              setActiveTab("lineas");
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LineasPage;
