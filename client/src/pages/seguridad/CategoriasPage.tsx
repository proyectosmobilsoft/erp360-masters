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
  CheckCircle
} from 'lucide-react';
import { categoriasService, CategoriaData, CategoriaForm } from '@/services/categoriasService';

// Form Component
interface CategoriaFormComponentProps {
  categoria?: CategoriaData | null;
  editingCategoria?: CategoriaData | null;
  onSubmit: (data: CategoriaForm) => void;
  isLoading: boolean;
  onCancel: () => void;
}

const CategoriaFormComponent: React.FC<CategoriaFormComponentProps> = ({ 
  categoria, 
  editingCategoria,
  onSubmit, 
  isLoading, 
  onCancel
}) => {
  const [formData, setFormData] = useState<CategoriaForm>({
    nombre: categoria?.nombre || "",
    isreceta: categoria?.isreceta || 0,
    requiere_empaques: categoria?.requiere_empaques || 0,
    imgruta: categoria?.imgruta || "",
  });

  const [nextCodigo, setNextCodigo] = useState<number>(0);

  // Obtener el siguiente código disponible cuando se crea una nueva categoría
  React.useEffect(() => {
    if (!editingCategoria) {
      categoriasService.getNextCodigo()
        .then(codigo => {
          setNextCodigo(codigo);
          setFormData(prev => ({ ...prev, id: codigo }));
        })
        .catch(error => {
          console.error('Error obteniendo siguiente código:', error);
          setNextCodigo(1);
          setFormData(prev => ({ ...prev, id: 1 }));
        });
    }
  }, [editingCategoria]);

  // Reiniciar formulario cuando cambie editingCategoria
  React.useEffect(() => {
    setFormData({
      id: categoria?.id || 0,
      nombre: categoria?.nombre || "",
      isreceta: categoria?.isreceta || 0,
      requiere_empaques: categoria?.requiere_empaques || 0,
      imgruta: categoria?.imgruta || "",
    });
  }, [categoria]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (field: keyof CategoriaForm, value: string | number) => {
    // No permitir cambios manuales al código cuando se está creando
    if (field === 'id' && !editingCategoria) {
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
          {editingCategoria ? 'Editar Categoría' : 'Nueva Categoría'}
        </h2>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Todos los campos en una sola fila */}
          <div className="grid grid-cols-12 gap-4">
            {/* ID */}
            <div className="col-span-2 space-y-2">
              <Label htmlFor="id" className="text-sm font-medium">ID</Label>
              <Input
                id="id"
                value={editingCategoria ? (formData.id || "") : (nextCodigo || "Cargando...")}
                onChange={(e) => handleInputChange('id', parseInt(e.target.value))}
                readOnly={!editingCategoria}
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
              <Label htmlFor="isreceta" className="text-sm font-medium">Es Receta</Label>
              <Select
                value={formData.isreceta.toString()}
                onValueChange={(value) => handleInputChange('isreceta', parseInt(value))}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No</SelectItem>
                  <SelectItem value="1">Sí</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Segunda fila */}
          <div className="grid grid-cols-12 gap-4">
            {/* Requiere Empaques */}
            <div className="col-span-6 space-y-2">
              <Label htmlFor="requiere_empaques" className="text-sm font-medium">Requiere Empaques</Label>
              <Select
                value={formData.requiere_empaques.toString()}
                onValueChange={(value) => handleInputChange('requiere_empaques', parseInt(value))}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No</SelectItem>
                  <SelectItem value="1">Sí</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Ruta de Imagen */}
            <div className="col-span-6 space-y-2">
              <Label htmlFor="imgruta" className="text-sm font-medium">Ruta de Imagen</Label>
              <Input
                id="imgruta"
                value={formData.imgruta}
                onChange={(e) => handleInputChange('imgruta', e.target.value)}
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
const CategoriasPage: React.FC = () => {
  const { startLoading, stopLoading } = useLoading();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Estados
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("active");
  const [activeTab, setActiveTab] = useState("categorias");
  const [editingCategoria, setEditingCategoria] = useState<CategoriaData | null>(null);

  // Queries
  const { data: categorias = [], isLoading } = useQuery({
    queryKey: ["categorias"],
    queryFn: categoriasService.listCategorias,
  });

  // Log cuando los datos cambien
  React.useEffect(() => {
    console.log("📊 Datos de categorías actualizados:", categorias);
  }, [categorias]);

  // Mutations
  const createCategoriaMutation = useMutation({
    mutationFn: async (data: CategoriaForm) => {
      startLoading();
      const categoriaData: CategoriaData = {
        id: data.id!,
        nombre: data.nombre,
        isreceta: data.isreceta,
        requiere_empaques: data.requiere_empaques,
        estado: 1,
        imgruta: data.imgruta
      };
      
      return await categoriasService.createCategoria(categoriaData);
    },
    onSuccess: () => {
      stopLoading();
      toast({
        title: "Categoría creada",
        description: "La categoría ha sido creada exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      setActiveTab("categorias");
      setEditingCategoria(null);
    },
    onError: (error: any) => {
      stopLoading();
      console.error('Error al crear categoría:', error);
      toast({
        title: 'Error',
        description: error.message || 'Error al crear la categoría',
        variant: 'destructive',
      });
    },
  });

  const updateCategoriaMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CategoriaData> }) =>
      categoriasService.updateCategoria(id, data),
    onSuccess: () => {
      stopLoading();
      toast({
        title: "Categoría actualizada",
        description: "La categoría ha sido actualizada exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      setActiveTab("categorias");
      setEditingCategoria(null);
    },
    onError: (error: any) => {
      stopLoading();
      console.error('Error al actualizar categoría:', error);
      toast({
        title: 'Error',
        description: error.message || 'Error al actualizar la categoría',
        variant: 'destructive',
      });
    },
  });

  const activateCategoriaMutation = useMutation({
    mutationFn: categoriasService.activateCategoria,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      toast({
        title: 'Éxito',
        description: 'Categoría activada correctamente',
      });
    },
    onError: (error: any) => {
      console.error('Error al activar categoría:', error);
      toast({
        title: 'Error',
        description: error.message || 'Error al activar la categoría',
        variant: 'destructive',
      });
    },
  });

  const deactivateCategoriaMutation = useMutation({
    mutationFn: categoriasService.deactivateCategoria,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      toast({
        title: 'Éxito',
        description: 'Categoría desactivada correctamente',
      });
    },
    onError: (error: any) => {
      console.error('Error al desactivar categoría:', error);
      toast({
        title: 'Error',
        description: error.message || 'Error al desactivar la categoría',
        variant: 'destructive',
      });
    },
  });

  // Filtros
  const categoriasFiltradas = useMemo(() => {
    console.log("🔍 Filtrando categorías. Total:", categorias.length, "Filtros:", { searchTerm, statusFilter });
    const filtered = (categorias as CategoriaData[]).filter((categoria: CategoriaData) => {
      const matchesSearch = 
        categoria.id.toString().includes(searchTerm) ||
        categoria.nombre.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "active" && categoria.estado === 1) ||
        (statusFilter === "inactive" && categoria.estado === 0);
      
      return matchesSearch && matchesStatus;
    });
    console.log("🔍 Categorías filtradas:", filtered.length, "IDs:", filtered.map(c => c.id));
    return filtered;
  }, [categorias, searchTerm, statusFilter]);

  // Handlers
  const handleEditarCategoria = (categoria: CategoriaData) => {
    setEditingCategoria(categoria);
    setActiveTab("formulario");
  };

  const handleNuevaCategoria = () => {
    setEditingCategoria(null);
    setActiveTab("formulario");
  };

  const handleActivateCategoria = (id: number) => {
    activateCategoriaMutation.mutate(id);
  };

  const handleDeactivateCategoria = (id: number) => {
    deactivateCategoriaMutation.mutate(id);
  };

  return (
    <div className="p-4 max-w-full mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-extrabold text-cyan-800 flex items-center gap-2 mb-2">
          <Tag className="w-8 h-8 text-cyan-600" />
          Gestión de Categorías
        </h1>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-cyan-100/60 p-1 rounded-lg">
          <TabsTrigger
            value="categorias"
            className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md transition-all duration-300"
          >
            <Tag className="w-4 h-4 mr-2" />
            Categorías
          </TabsTrigger>
          <TabsTrigger
            value="formulario"
            onClick={handleNuevaCategoria}
            className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            {editingCategoria ? 'Editar Categoría' : 'Nueva Categoría'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="categorias" className="mt-6">
          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 border-b border-cyan-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="w-5 h-5 text-cyan-600" />
                  <span className="text-lg font-semibold text-gray-700">CATEGORÍAS</span>
                </div>
                <div className="flex space-x-2">
                  <Can action="accion-crear-categoria">
                    <Button
                      onClick={handleNuevaCategoria}
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
                      placeholder="Buscar por ID o nombre..."
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
                      <TableHead className="px-4 py-3 w-20">ID</TableHead>
                      <TableHead className="px-4 py-3">Nombre</TableHead>
                      <TableHead className="px-4 py-3">Es Receta</TableHead>
                      <TableHead className="px-4 py-3">Requiere Empaques</TableHead>
                      <TableHead className="px-4 py-3 w-24">Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          <div className="flex items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin mr-2" />
                            Cargando categorías...
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : categoriasFiltradas.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          No hay categorías disponibles.
                        </TableCell>
                      </TableRow>
                    ) : (
                      categoriasFiltradas.map((categoria: CategoriaData) => (
                        <TableRow key={categoria.id} className="hover:bg-gray-50">
                          <TableCell className="px-2 py-1">
                            <div className="flex items-center justify-start gap-1">
                              <Can action="accion-editar-categoria">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleEditarCategoria(categoria)}
                                        aria-label="Editar categoría"
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

                              {categoria.estado === 1 ? (
                                <Can action="accion-desactivar-categoria">
                                  <AlertDialog>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <AlertDialogTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              aria-label="Inactivar categoría"
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
                                          Esta acción inactivará la categoría "{categoria.nombre}".
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleDeactivateCategoria(categoria.id!)}
                                        >
                                          Inactivar
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </Can>
                              ) : (
                                <Can action="accion-activar-categoria">
                                  <AlertDialog>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <AlertDialogTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              aria-label="Activar categoría"
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
                                          Esta acción activará la categoría "{categoria.nombre}".
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleActivateCategoria(categoria.id!)}
                                        >
                                          Activar
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </Can>
                              )}

                            </div>
                          </TableCell>
                          <TableCell className="px-3 py-2 text-sm text-gray-900 font-medium w-20">
                            {categoria.id}
                          </TableCell>
                          <TableCell className="px-3 py-2 text-sm text-gray-900">
                            {categoria.nombre}
                          </TableCell>
                          <TableCell className="px-3 py-2 text-sm text-gray-900">
                            {categoria.isreceta === 1 ? 'Sí' : 'No'}
                          </TableCell>
                          <TableCell className="px-3 py-2 text-sm text-gray-900">
                            {categoria.requiere_empaques === 1 ? 'Sí' : 'No'}
                          </TableCell>
                          <TableCell className="px-3 py-2">
                            <Badge
                              variant={categoria.estado === 1 ? "default" : "secondary"}
                              className={
                                categoria.estado === 1
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }
                            >
                              {categoria.estado === 1 ? "Activo" : "Inactivo"}
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
          <CategoriaFormComponent
            categoria={editingCategoria}
            editingCategoria={editingCategoria}
            onSubmit={(data) => {
              if (editingCategoria) {
                updateCategoriaMutation.mutate({ id: editingCategoria.id!, data });
              } else {
                // Para crear, no incluir el id
                const { id, ...createData } = data as any;
                createCategoriaMutation.mutate(createData);
              }
            }}
            isLoading={createCategoriaMutation.isPending || updateCategoriaMutation.isPending}
            onCancel={() => {
              setEditingCategoria(null);
              setActiveTab("categorias");
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CategoriasPage;
