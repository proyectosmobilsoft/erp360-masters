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
import { tiposService, TipoData, TipoForm } from '@/services/tiposService';

// Form Component
interface TipoFormComponentProps {
  tipo?: TipoData | null;
  editingTipo?: TipoData | null;
  onSubmit: (data: TipoForm) => void;
  isLoading: boolean;
  onCancel: () => void;
}

export const TipoFormComponent: React.FC<TipoFormComponentProps> = ({ 
  tipo, 
  editingTipo,
  onSubmit, 
  isLoading, 
  onCancel
}) => {
  const [formData, setFormData] = useState<TipoForm>({
    codigo: tipo?.codigo || "",
    nombre: tipo?.nombre || "",
    es_receta: tipo?.es_receta || false,
  });

  const [nextCodigo, setNextCodigo] = useState<string>("");

  // Obtener el siguiente código disponible cuando se crea un nuevo tipo
  React.useEffect(() => {
    if (!editingTipo) {
      tiposService.getNextCodigo()
        .then(codigo => {
          setNextCodigo(codigo);
          setFormData(prev => ({ ...prev, codigo }));
        })
        .catch(error => {
          console.error('Error obteniendo siguiente código:', error);
        });
    }
  }, [editingTipo]);

  // Actualizar formulario cuando cambie editingTipo
  React.useEffect(() => {
    if (editingTipo) {
      setFormData({
        codigo: editingTipo.codigo || "",
        nombre: editingTipo.nombre || "",
        es_receta: editingTipo.es_receta || false,
      });
    } else {
      // Si no hay editingTipo, usar los datos del tipo o valores por defecto
      setFormData({
        codigo: tipo?.codigo || "",
        nombre: tipo?.nombre || "",
        es_receta: tipo?.es_receta || false,
      });
    }
  }, [editingTipo, tipo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (field: keyof TipoForm, value: string | boolean) => {
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
          {editingTipo ? 'Editar Tipo' : 'Nuevo Tipo'}
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
                value={editingTipo ? formData.codigo : (nextCodigo || "Cargando...")}
                onChange={(e) => handleInputChange('codigo', e.target.value)}
                readOnly={!editingTipo}
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

            {/* Es Receta */}
            <div className="col-span-3 space-y-2">
              <Label htmlFor="es_receta" className="text-sm font-medium">Es Receta</Label>
              <div className="flex items-center space-x-2">
                <input
                  id="es_receta"
                  type="checkbox"
                  checked={formData.es_receta || false}
                  onChange={(e) => handleInputChange('es_receta', e.target.checked)}
                  className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Sí</span>
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

// Main Component
const TiposPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("tipos");
  const [editingTipo, setEditingTipo] = useState<TipoData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("active");

  const { toast } = useToast();
  const { startLoading, stopLoading } = useLoading();
  const queryClient = useQueryClient();

  // Queries
  const { data: tipos = [], isLoading } = useQuery({
    queryKey: ['tipos'],
    queryFn: tiposService.listTipos,
  });

  // Mutations
  const createTipoMutation = useMutation({
    mutationFn: async (data: TipoForm) => {
      startLoading();
      const tipoData = {
        codigo: data.codigo!,
        nombre: data.nombre,
        es_receta: data.es_receta || false,
        estado: 1
      };
      
      return await tiposService.createTipo(tipoData);
    },
    onSuccess: () => {
      stopLoading();
      toast({
        title: "✅ Tipo Creado",
        description: "El nuevo tipo ha sido creado exitosamente y está listo para usar.",
        className: "bg-green-50 border-green-200 text-green-800",
      });
      queryClient.invalidateQueries({ queryKey: ['tipos'] });
      setActiveTab("tipos");
      setEditingTipo(null);
    },
    onError: (error: any) => {
      stopLoading();
      console.error('Error al crear tipo:', error);
      toast({
        title: '❌ Error al Crear',
        description: error.message || 'No se pudo crear el tipo. Verifique los datos e intente nuevamente.',
        variant: 'destructive',
        className: "bg-red-50 border-red-200 text-red-800",
      });
    },
  });

  const updateTipoMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<TipoData> }) => {
      startLoading();
      return tiposService.updateTipo(id, data);
    },
    onSuccess: () => {
      stopLoading();
      toast({
        title: "✅ Tipo Actualizado",
        description: "Los cambios en el tipo han sido guardados exitosamente.",
        className: "bg-green-50 border-green-200 text-green-800",
      });
      queryClient.invalidateQueries({ queryKey: ['tipos'] });
      setActiveTab("tipos");
      setEditingTipo(null);
    },
    onError: (error: any) => {
      stopLoading();
      console.error('Error al actualizar tipo:', error);
      toast({
        title: '❌ Error al Actualizar',
        description: error.message || 'No se pudo actualizar el tipo. Verifique los datos e intente nuevamente.',
        variant: 'destructive',
        className: "bg-red-50 border-red-200 text-red-800",
      });
    },
  });

  const activateTipoMutation = useMutation({
    mutationFn: tiposService.activateTipo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tipos'] });
      toast({
        title: '✅ Tipo Activado',
        description: 'El tipo ha sido activado correctamente y está disponible para uso.',
        className: "bg-green-50 border-green-200 text-green-800",
      });
    },
    onError: (error: any) => {
      console.error('Error al activar tipo:', error);
      toast({
        title: '❌ Error al Activar',
        description: error.message || 'No se pudo activar el tipo. Intente nuevamente.',
        variant: 'destructive',
        className: "bg-red-50 border-red-200 text-red-800",
      });
    },
  });

  const deactivateTipoMutation = useMutation({
    mutationFn: tiposService.deactivateTipo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tipos'] });
      toast({
        title: '⚠️ Tipo Desactivado',
        description: 'El tipo ha sido desactivado y ya no está disponible para uso.',
        className: "bg-yellow-50 border-yellow-200 text-yellow-800",
      });
    },
    onError: (error: any) => {
      console.error('Error al desactivar tipo:', error);
      toast({
        title: '❌ Error al Desactivar',
        description: error.message || 'No se pudo desactivar el tipo. Intente nuevamente.',
        variant: 'destructive',
        className: "bg-red-50 border-red-200 text-red-800",
      });
    },
  });

  const deleteTipoMutation = useMutation({
    mutationFn: tiposService.deleteTipoPermanent,
    onSuccess: (deletedTipo) => {
      queryClient.invalidateQueries({ queryKey: ['tipos'] });
      toast({
        title: '✅ Tipo Eliminado',
        description: `El tipo "${deletedTipo.nombre}" ha sido eliminado permanentemente de la base de datos`,
        className: "bg-green-50 border-green-200 text-green-800",
      });
    },
    onError: (error: any) => {
      console.error('Error al eliminar tipo:', error);
      toast({
        title: '❌ Error al Eliminar',
        description: error.message || 'No se pudo eliminar el tipo. Verifique que no tenga referencias en otras tablas.',
        variant: 'destructive',
        className: "bg-red-50 border-red-200 text-red-800",
      });
    },
  });

  // Filtros
  const tiposFiltradas = useMemo(() => {
    console.log("🔍 Filtrando tipos. Total:", tipos.length, "Filtros:", { searchTerm, statusFilter });
    const filtered = (tipos as TipoData[]).filter((tipo: TipoData) => {
      const matchesSearch = 
        (tipo.codigo?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (tipo.nombre?.toLowerCase() || '').includes(searchTerm.toLowerCase());

      const matchesStatus = 
        statusFilter === "all" || 
        (statusFilter === "active" && (tipo.estado === 1 || tipo.estado === undefined)) ||
        (statusFilter === "inactive" && tipo.estado === 0);

      return matchesSearch && matchesStatus;
    });

    console.log("✅ Tipos filtradas:", filtered.length);
    return filtered;
  }, [tipos, searchTerm, statusFilter]);

  // Handlers
  const handleCrearTipo = () => {
    setEditingTipo(null);
    setActiveTab("formulario");
  };

  const handleEditarTipo = (tipo: TipoData) => {
    setEditingTipo(tipo);
    setActiveTab("formulario");
  };

  const handleSubmitTipo = (data: TipoForm) => {
    if (editingTipo) {
      updateTipoMutation.mutate({ 
        id: editingTipo.id!, 
        data: {
          codigo: data.codigo,
          nombre: data.nombre,
          es_receta: data.es_receta
        }
      });
    } else {
      createTipoMutation.mutate(data);
    }
  };

  const handleActivateTipo = (id: number) => {
    activateTipoMutation.mutate(id);
  };

  const handleDeactivateTipo = (id: number) => {
    deactivateTipoMutation.mutate(id);
  };

  const handleDeleteTipo = (id: number) => {
    deleteTipoMutation.mutate(id);
  };

  return (
    <div className="p-4 max-w-full mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-cyan-800 flex items-center gap-2">
          <Tag className="w-8 h-8 text-cyan-600" />
          Gestión de Tipos de Producto
        </h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-cyan-100/60 p-1 rounded-lg">
          <TabsTrigger
            value="tipos"
            className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md transition-all duration-300"
          >
            <Tag className="w-4 h-4 mr-2" />
            Tipos
          </TabsTrigger>
          <TabsTrigger
            value="formulario"
            onClick={handleCrearTipo}
            className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            {editingTipo ? 'Editar Tipo' : 'Nuevo Tipo'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tipos" className="mt-6">
          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 border-b border-cyan-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="w-5 h-5 text-cyan-600" />
                  <span className="text-lg font-semibold text-gray-700">TIPOS</span>
                </div>
                <div className="flex space-x-2">
                  <Can action="accion-crear-tipo">
                    <Button
                      onClick={handleCrearTipo}
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
                      placeholder="Buscar por código o nombre..."
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
                      <TableHead className="px-4 py-3 w-20 text-center">Código</TableHead>
                      <TableHead className="px-4 py-3 text-center">Nombre</TableHead>
                      <TableHead className="px-4 py-3 w-24 text-center">Es Receta</TableHead>
                      <TableHead className="px-4 py-3 w-24 text-center">Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          <div className="flex items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin mr-2" />
                            Cargando tipos...
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : tiposFiltradas.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          No hay tipos disponibles.
                        </TableCell>
                      </TableRow>
                    ) : (
                  tiposFiltradas.map((tipo: TipoData) => (
                    <TableRow key={tipo.id} className="hover:bg-gray-50">
                      <TableCell className="px-2 py-1">
                        <div className="flex items-center justify-start gap-1">
                          <Can action="accion-editar-tipo">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEditarTipo(tipo)}
                                    aria-label="Editar tipo"
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

                          {tipo.estado === 1 ? (
                            <Can action="accion-desactivar-tipo">
                              <AlertDialog>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          aria-label="Inactivar tipo"
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
                                      Esta acción inactivará el tipo "{tipo.nombre}".
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeactivateTipo(tipo.id!)}
                                    >
                                      Inactivar
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </Can>
                          ) : (
                            <Can action="accion-activar-tipo">
                              <AlertDialog>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          aria-label="Activar tipo"
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
                                      Esta acción activará el tipo "{tipo.nombre}".
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleActivateTipo(tipo.id!)}
                                    >
                                      Activar
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </Can>
                          )}

                          {/* Botón de eliminar para tipos inactivos */}
                          {tipo.estado === 0 && (
                            <Can action="accion-eliminar-tipo">
                              <AlertDialog>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          aria-label="Eliminar tipo"
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
                                          ¿Estás seguro de que deseas eliminar permanentemente el tipo <strong>"{tipo.nombre}"</strong>?
                                        </p>
                                      </div>
                                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                        <div className="flex items-center gap-2 text-yellow-800 font-semibold mb-2">
                                          <Info className="h-4 w-4" />
                                          IMPACTO
                                        </div>
                                        <ul className="text-yellow-700 text-sm space-y-1">
                                          <li>• El tipo será eliminado permanentemente de la base de datos</li>
                                          <li>• Los productos asociados a este tipo perderán la referencia</li>
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
                                      onClick={() => handleDeleteTipo(tipo.id!)}
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
                      <TableCell className="px-3 py-2 text-sm text-gray-900 font-medium w-20 text-left">
                        {tipo.codigo}
                      </TableCell>
                      <TableCell className="px-3 py-2 text-sm text-gray-900 text-left">
                        {tipo.nombre}
                      </TableCell>
                      <TableCell className="px-3 py-2 text-sm text-gray-900 w-24 text-left">
                        {tipo.es_receta ? (
                          <Badge variant="default" className="bg-blue-100 text-blue-800">
                            Sí
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                            No
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="px-3 py-2 text-left">
                        <Badge
                          variant={tipo.estado === 1 ? "default" : "secondary"}
                          className={
                            tipo.estado === 1
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {tipo.estado === 1 ? "Activo" : "Inactivo"}
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
          <TipoFormComponent
            tipo={null}
            editingTipo={editingTipo}
            onSubmit={handleSubmitTipo}
            isLoading={createTipoMutation.isPending || updateTipoMutation.isPending}
            onCancel={() => {
              setEditingTipo(null);
              setActiveTab("tipos");
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TiposPage;
