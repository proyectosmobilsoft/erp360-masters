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
  Info,
  Upload,
  X,
  Image as ImageIcon
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

            {/* Imagen de la Categoría */}
            <div className="col-span-6">
              <ImageUpload
                value={formData.imgruta}
                onChange={(value) => handleInputChange('imgruta', value)}
                onRemove={() => handleInputChange('imgruta', '')}
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

// Image Upload Component
interface ImageUploadProps {
  value: string | undefined;
  onChange: (value: string) => void;
  onRemove: () => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ value, onChange, onRemove }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: '❌ Archivo Inválido',
        description: 'Por favor selecciona un archivo de imagen válido (PNG, JPG, GIF)',
        variant: 'destructive',
        className: "bg-red-50 border-red-200 text-red-800",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: '❌ Archivo Demasiado Grande',
        description: 'La imagen es demasiado grande. El tamaño máximo permitido es 5MB',
        variant: 'destructive',
        className: "bg-red-50 border-red-200 text-red-800",
      });
      return;
    }

    setIsLoading(true);
    try {
      const compressedFile = await compressImage(file);
      const base64 = await convertToBase64(compressedFile);
      onChange(base64);
      toast({
        title: '✅ Imagen Cargada',
        description: 'La imagen se ha comprimido y cargado correctamente en base64',
        className: "bg-green-50 border-green-200 text-green-800",
      });
    } catch (error) {
      console.error('Error converting image to base64:', error);
      toast({
        title: '❌ Error al Procesar',
        description: 'Error al procesar la imagen. Intenta con otro archivo',
        variant: 'destructive',
        className: "bg-red-50 border-red-200 text-red-800",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calcular nuevas dimensiones (máximo 800x600)
        const maxWidth = 800;
        const maxHeight = 600;
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Dibujar la imagen redimensionada
        ctx?.drawImage(img, 0, 0, width, height);

        // Convertir a blob con compresión
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Error al comprimir la imagen'));
            }
          },
          'image/jpeg',
          0.8 // Calidad de compresión (0.8 = 80%)
        );
      };

      img.onerror = () => reject(new Error('Error al cargar la imagen'));
      img.src = URL.createObjectURL(file);
    });
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Imagen de la Categoría</Label>
      
      {value && value.trim() !== '' ? (
        <div className="relative group">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-center">
              <img
                src={value}
                alt="Imagen de categoría"
                className="max-h-32 max-w-32 object-contain rounded-lg"
              />
            </div>
            <div className="mt-2 text-center">
              <p className="text-sm text-gray-600">Imagen cargada correctamente</p>
            </div>
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={onRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
            isDragOver
              ? 'border-cyan-500 bg-cyan-50'
              : 'border-gray-300 hover:border-cyan-400 hover:bg-gray-50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('image-upload-input')?.click()}
        >
          <input
            id="image-upload-input"
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />
          
          {isLoading ? (
            <div className="flex flex-col items-center space-y-2">
              <Loader2 className="h-8 w-8 text-cyan-600 animate-spin" />
              <p className="text-sm text-gray-600">Procesando imagen...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <div className="p-3 bg-cyan-100 rounded-full">
                <Upload className="h-6 w-6 text-cyan-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Arrastra una imagen aquí o haz clic para seleccionar
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, GIF hasta 5MB (se comprimirá automáticamente)
                </p>
              </div>
            </div>
          )}
        </div>
      )}
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
        title: "✅ Categoría Creada",
        description: "La nueva categoría ha sido creada exitosamente y está lista para usar.",
        className: "bg-green-50 border-green-200 text-green-800",
      });
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      setActiveTab("categorias");
      setEditingCategoria(null);
    },
    onError: (error: any) => {
      stopLoading();
      console.error('Error al crear categoría:', error);
      toast({
        title: '❌ Error al Crear',
        description: error.message || 'No se pudo crear la categoría. Verifique los datos e intente nuevamente.',
        variant: 'destructive',
        className: "bg-red-50 border-red-200 text-red-800",
      });
    },
  });

  const updateCategoriaMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CategoriaData> }) =>
      categoriasService.updateCategoria(id, data),
    onSuccess: () => {
      stopLoading();
      toast({
        title: "✅ Categoría Actualizada",
        description: "Los cambios en la categoría han sido guardados exitosamente.",
        className: "bg-green-50 border-green-200 text-green-800",
      });
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      setActiveTab("categorias");
      setEditingCategoria(null);
    },
    onError: (error: any) => {
      stopLoading();
      console.error('Error al actualizar categoría:', error);
      toast({
        title: '❌ Error al Actualizar',
        description: error.message || 'No se pudo actualizar la categoría. Verifique los datos e intente nuevamente.',
        variant: 'destructive',
        className: "bg-red-50 border-red-200 text-red-800",
      });
    },
  });

  const activateCategoriaMutation = useMutation({
    mutationFn: categoriasService.activateCategoria,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      toast({
        title: '✅ Categoría Activada',
        description: 'La categoría ha sido activada correctamente y está disponible para uso.',
        className: "bg-green-50 border-green-200 text-green-800",
      });
    },
    onError: (error: any) => {
      console.error('Error al activar categoría:', error);
      toast({
        title: '❌ Error al Activar',
        description: error.message || 'No se pudo activar la categoría. Intente nuevamente.',
        variant: 'destructive',
        className: "bg-red-50 border-red-200 text-red-800",
      });
    },
  });

  const deactivateCategoriaMutation = useMutation({
    mutationFn: categoriasService.deactivateCategoria,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      toast({
        title: '⚠️ Categoría Desactivada',
        description: 'La categoría ha sido desactivada y ya no está disponible para uso.',
        className: "bg-yellow-50 border-yellow-200 text-yellow-800",
      });
    },
    onError: (error: any) => {
      console.error('Error al desactivar categoría:', error);
      toast({
        title: '❌ Error al Desactivar',
        description: error.message || 'No se pudo desactivar la categoría. Intente nuevamente.',
        variant: 'destructive',
        className: "bg-red-50 border-red-200 text-red-800",
      });
    },
  });

  const deleteCategoriaMutation = useMutation({
    mutationFn: categoriasService.deleteCategoriaPermanent,
    onSuccess: (deletedCategoria) => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      toast({
        title: '✅ Categoría Eliminada',
        description: `La categoría "${deletedCategoria.nombre}" ha sido eliminada permanentemente de la base de datos.`,
        className: "bg-green-50 border-green-200 text-green-800",
      });
    },
    onError: (error: any) => {
      console.error('Error al eliminar categoría:', error);
      toast({
        title: '❌ Error al Eliminar',
        description: error.message || 'No se pudo eliminar la categoría. Verifique que no tenga referencias en otras tablas.',
        variant: 'destructive',
        className: "bg-red-50 border-red-200 text-red-800",
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

  const handleDeleteCategoria = (id: number) => {
    deleteCategoriaMutation.mutate(id);
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

                              {/* Botón de eliminar para categorías inactivas */}
                              {categoria.estado === 0 && (
                                <Can action="accion-eliminar-categoria">
                                  <AlertDialog>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <AlertDialogTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              aria-label="Eliminar categoría"
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
                                              ¿Estás seguro de que deseas eliminar permanentemente la categoría <strong>"{categoria.nombre}"</strong>?
                                            </p>
                                          </div>
                                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                            <div className="flex items-center gap-2 text-yellow-800 font-semibold mb-2">
                                              <Info className="h-4 w-4" />
                                              IMPACTO
                                            </div>
                                            <ul className="text-yellow-700 text-sm space-y-1">
                                              <li>• La categoría será eliminada permanentemente de la base de datos</li>
                                              <li>• Los productos asociados a esta categoría perderán la referencia</li>
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
                                          onClick={() => handleDeleteCategoria(categoria.id!)}
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
