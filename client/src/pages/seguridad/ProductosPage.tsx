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
  Search, 
  Loader2, 
  Save, 
  RefreshCw,
  CheckCircle
} from 'lucide-react';
import { productosService, ProductoData, ProductoForm, MedidaData, CategoriaData, SublineaData } from '@/services/productosService';

// Form Component
interface ProductoFormComponentProps {
  producto?: ProductoData | null;
  editingProducto?: ProductoData | null;
  medidas: MedidaData[];
  categorias: CategoriaData[];
  sublineas: SublineaData[];
  onSubmit: (data: ProductoForm) => void;
  isLoading: boolean;
  onCancel: () => void;
}

const ProductoFormComponent: React.FC<ProductoFormComponentProps> = ({ 
  producto, 
  editingProducto,
  medidas,
  categorias,
  sublineas,
  onSubmit, 
  isLoading, 
  onCancel
}) => {
  const [formData, setFormData] = useState<ProductoForm>({
    codigo: producto?.codigo || "",
    nombre: producto?.nombre || "",
    id_medida: producto?.id_medida || 0,
    id_tipo_producto: producto?.id_tipo_producto || 1,
    id_categoria: producto?.id_categoria || 0,
    id_sublineas: producto?.id_sublineas || 0,
    id_interfaz_contable: producto?.id_interfaz_contable || undefined,
    id_marca: producto?.id_marca || undefined,
    id_color: producto?.id_color || undefined,
    referencia: producto?.referencia || "",
    id_clase_servicio: producto?.id_clase_servicio || undefined,
    tipo_menu: producto?.tipo_menu || 0,
    no_ciclo: producto?.no_ciclo || 0,
    id_tipo_zona: producto?.id_tipo_zona || undefined,
    ultimo_costo: producto?.ultimo_costo || 0,
    id_proveedor: producto?.id_proveedor || undefined,
    frecuencia: producto?.frecuencia || 1,
    controla_existencia: producto?.controla_existencia || 0,
    controla_lotes: producto?.controla_lotes || 0,
    imgruta: producto?.imgruta || "",
  });

  const [nextCodigo, setNextCodigo] = useState<string>("");

  // Obtener el siguiente código disponible cuando se crea un nuevo producto
  React.useEffect(() => {
    if (!editingProducto) {
      productosService.getNextCodigo()
        .then(codigo => {
          setNextCodigo(codigo);
          setFormData(prev => ({ ...prev, codigo }));
        })
        .catch(error => {
          console.error('Error obteniendo siguiente código:', error);
          setNextCodigo("PROD001");
          setFormData(prev => ({ ...prev, codigo: "PROD001" }));
        });
    }
  }, [editingProducto]);

  // Reiniciar formulario cuando cambie editingProducto
  React.useEffect(() => {
    setFormData({
      id: producto?.id || 0,
      codigo: producto?.codigo || "",
      nombre: producto?.nombre || "",
      id_medida: producto?.id_medida || 0,
      id_tipo_producto: producto?.id_tipo_producto || 1,
      id_categoria: producto?.id_categoria || 0,
      id_sublineas: producto?.id_sublineas || 0,
      id_interfaz_contable: producto?.id_interfaz_contable || undefined,
      id_marca: producto?.id_marca || undefined,
      id_color: producto?.id_color || undefined,
      referencia: producto?.referencia || "",
      id_clase_servicio: producto?.id_clase_servicio || undefined,
      tipo_menu: producto?.tipo_menu || 0,
      no_ciclo: producto?.no_ciclo || 0,
      id_tipo_zona: producto?.id_tipo_zona || undefined,
      ultimo_costo: producto?.ultimo_costo || 0,
      id_proveedor: producto?.id_proveedor || undefined,
      frecuencia: producto?.frecuencia || 1,
      controla_existencia: producto?.controla_existencia || 0,
      controla_lotes: producto?.controla_lotes || 0,
      imgruta: producto?.imgruta || "",
    });
    
    // Sincronizar el display del último costo
    if (producto?.ultimo_costo) {
      setUltimoCostoDisplay(producto.ultimo_costo.toString());
    } else {
      setUltimoCostoDisplay('');
    }
  }, [producto]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (field: keyof ProductoForm, value: string | number) => {
    // No permitir cambios manuales al código en ningún caso
    if (field === 'codigo') {
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const [ultimoCostoDisplay, setUltimoCostoDisplay] = useState<string>('');

  const handleUltimoCostoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Si el campo está vacío, limpiar todo
    if (inputValue === '') {
      setUltimoCostoDisplay('');
      setFormData(prev => ({
        ...prev,
        ultimo_costo: 0
      }));
      return;
    }
    
    // Remover todos los caracteres no numéricos excepto un punto decimal
    let cleanValue = inputValue.replace(/[^0-9.]/g, '');
    
    // Asegurar que solo haya un punto decimal
    const parts = cleanValue.split('.');
    if (parts.length > 2) {
      cleanValue = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Limitar a 2 decimales
    if (parts.length === 2 && parts[1].length > 2) {
      cleanValue = parts[0] + '.' + parts[1].substring(0, 2);
    }
    
    // Actualizar el display
    setUltimoCostoDisplay(cleanValue);
    
    // Convertir a número y actualizar el estado
    const numericValue = parseFloat(cleanValue) || 0;
    setFormData(prev => ({
      ...prev,
      ultimo_costo: numericValue
    }));
  };

  const formatUltimoCostoDisplay = (value: string) => {
    if (!value) return '';
    
    // Si tiene punto decimal, formatear la parte entera
    if (value.includes('.')) {
      const [integerPart, decimalPart] = value.split('.');
      const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return `${formattedInteger}.${decimalPart}`;
    } else {
      // Solo parte entera, formatear con separadores de miles
      return value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
  };

  return (
    <div className="bg-white rounded-lg border shadow-lg">
      {/* Header del formulario */}
      <div className="flex items-center gap-2 p-6 border-b bg-gradient-to-r from-cyan-50 to-blue-50">
        <Package className="w-5 h-5 text-cyan-600" />
        <h2 className="text-lg font-semibold text-cyan-800">
          {editingProducto ? 'Editar Producto' : 'Nuevo Producto'}
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
                value={editingProducto ? formData.codigo : (nextCodigo || "Cargando...")}
                onChange={(e) => handleInputChange('codigo', e.target.value)}
                readOnly={true}
                className="h-8 text-sm bg-red-50 border-red-200 text-red-600 font-bold cursor-default"
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

            {/* Referencia */}
            <div className="col-span-4 space-y-2">
              <Label htmlFor="referencia" className="text-sm font-medium">Referencia</Label>
              <Input
                id="referencia"
                value={formData.referencia || ""}
                onChange={(e) => handleInputChange('referencia', e.target.value)}
                className="h-8 text-sm"
                autoComplete="off"
              />
            </div>
          </div>

          {/* Segunda fila */}
          <div className="grid grid-cols-12 gap-4">
            {/* Medida */}
            <div className="col-span-3 space-y-2">
              <Label htmlFor="id_medida" className="text-sm font-medium">Medida *</Label>
              <Select
                value={formData.id_medida.toString()}
                onValueChange={(value) => handleInputChange('id_medida', parseInt(value))}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {medidas.map((medida) => (
                    <SelectItem key={medida.id} value={medida.id.toString()}>
                      {medida.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Categoría */}
            <div className="col-span-3 space-y-2">
              <Label htmlFor="id_categoria" className="text-sm font-medium">Categoría *</Label>
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

            {/* Sublínea */}
            <div className="col-span-3 space-y-2">
              <Label htmlFor="id_sublineas" className="text-sm font-medium">Sublínea *</Label>
              <Select
                value={formData.id_sublineas.toString()}
                onValueChange={(value) => handleInputChange('id_sublineas', parseInt(value))}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sublineas.map((sublinea) => (
                    <SelectItem key={sublinea.id} value={sublinea.id.toString()}>
                      {sublinea.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Último Costo */}
            <div className="col-span-3 space-y-2">
              <Label htmlFor="ultimo_costo" className="text-sm font-medium">Último Costo</Label>
              <Input
                id="ultimo_costo"
                type="text"
                value={formatUltimoCostoDisplay(ultimoCostoDisplay)}
                onChange={handleUltimoCostoChange}
                placeholder="0.00"
                className="h-8 text-sm"
                autoComplete="off"
              />
            </div>
          </div>

          {/* Tercera fila */}
          <div className="grid grid-cols-12 gap-4">
            {/* Frecuencia */}
            <div className="col-span-3 space-y-2">
              <Label htmlFor="frecuencia" className="text-sm font-medium">Frecuencia</Label>
              <Input
                id="frecuencia"
                type="number"
                value={formData.frecuencia || ""}
                onChange={(e) => handleInputChange('frecuencia', parseInt(e.target.value) || 1)}
                className="h-8 text-sm"
                autoComplete="off"
              />
            </div>

            {/* Controla Existencia */}
            <div className="col-span-3 space-y-2">
              <Label htmlFor="controla_existencia" className="text-sm font-medium">Controla Existencia</Label>
              <Select
                value={formData.controla_existencia?.toString() || "0"}
                onValueChange={(value) => handleInputChange('controla_existencia', parseInt(value))}
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

            {/* Controla Lotes */}
            <div className="col-span-3 space-y-2">
              <Label htmlFor="controla_lotes" className="text-sm font-medium">Controla Lotes</Label>
              <Select
                value={formData.controla_lotes?.toString() || "0"}
                onValueChange={(value) => handleInputChange('controla_lotes', parseInt(value))}
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

            {/* Imagen Ruta */}
            <div className="col-span-3 space-y-2">
              <Label htmlFor="imgruta" className="text-sm font-medium">Imagen Ruta</Label>
              <Input
                id="imgruta"
                value={formData.imgruta || ""}
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
const ProductosPage: React.FC = () => {
  const { startLoading, stopLoading } = useLoading();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Estados
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("active");
  const [activeTab, setActiveTab] = useState("productos");
  const [editingProducto, setEditingProducto] = useState<ProductoData | null>(null);

  // Queries
  const { data: productos = [], isLoading } = useQuery({
    queryKey: ["productos"],
    queryFn: productosService.listProductos,
  });

  const { data: medidas = [] } = useQuery({
    queryKey: ["medidas"],
    queryFn: productosService.listMedidas,
  });

  const { data: categorias = [] } = useQuery({
    queryKey: ["categorias"],
    queryFn: productosService.listCategorias,
  });

  const { data: sublineas = [] } = useQuery({
    queryKey: ["sublineas"],
    queryFn: productosService.listSublineas,
  });

  // Log cuando los datos cambien
  React.useEffect(() => {
    console.log("📊 Datos de productos actualizados:", productos);
  }, [productos]);

  // Mutations
  const createProductoMutation = useMutation({
    mutationFn: async (data: ProductoForm) => {
      startLoading();
      const productoData = {
        id: 0, // ID temporal para creación
        codigo: data.codigo!,
        nombre: data.nombre,
        id_medida: data.id_medida,
        id_tipo_producto: data.id_tipo_producto,
        id_categoria: data.id_categoria,
        id_sublineas: data.id_sublineas,
        id_interfaz_contable: data.id_interfaz_contable || undefined,
        id_marca: data.id_marca || undefined,
        id_color: data.id_color || undefined,
        referencia: data.referencia || undefined,
        id_clase_servicio: data.id_clase_servicio || undefined,
        tipo_menu: data.tipo_menu || undefined,
        no_ciclo: data.no_ciclo || undefined,
        id_tipo_zona: data.id_tipo_zona || undefined,
        ultimo_costo: data.ultimo_costo || undefined,
        id_proveedor: data.id_proveedor || undefined,
        frecuencia: data.frecuencia || 1,
        controla_existencia: data.controla_existencia || undefined,
        controla_lotes: data.controla_lotes || undefined,
        imgruta: data.imgruta || undefined,
        id_usuario: undefined,
        fecsys: undefined,
        estado: 1
      } as ProductoData;
      
      return await productosService.createProducto(productoData);
    },
    onSuccess: () => {
      stopLoading();
      toast({
        title: "Producto creado",
        description: "El producto ha sido creado exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      setActiveTab("productos");
      setEditingProducto(null);
    },
    onError: (error: any) => {
      stopLoading();
      console.error('Error al crear producto:', error);
      toast({
        title: 'Error',
        description: error.message || 'Error al crear el producto',
        variant: 'destructive',
      });
    },
  });

  const updateProductoMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ProductoData> }) => {
      startLoading();
      return productosService.updateProducto(id, data);
    },
    onSuccess: () => {
      stopLoading();
      toast({
        title: "Producto actualizado",
        description: "El producto ha sido actualizado exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      setActiveTab("productos");
      setEditingProducto(null);
    },
    onError: (error: any) => {
      stopLoading();
      console.error('Error al actualizar producto:', error);
      toast({
        title: 'Error',
        description: error.message || 'Error al actualizar el producto',
        variant: 'destructive',
      });
    },
  });

  const activateProductoMutation = useMutation({
    mutationFn: productosService.activateProducto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      toast({
        title: 'Éxito',
        description: 'Producto activado correctamente',
      });
    },
    onError: (error: any) => {
      console.error('Error al activar producto:', error);
      toast({
        title: 'Error',
        description: error.message || 'Error al activar el producto',
        variant: 'destructive',
      });
    },
  });

  const deactivateProductoMutation = useMutation({
    mutationFn: productosService.deactivateProducto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      toast({
        title: 'Éxito',
        description: 'Producto desactivado correctamente',
      });
    },
    onError: (error: any) => {
      console.error('Error al desactivar producto:', error);
      toast({
        title: 'Error',
        description: error.message || 'Error al desactivar el producto',
        variant: 'destructive',
      });
    },
  });

  // Filtros
  const productosFiltrados = useMemo(() => {
    console.log("🔍 Filtrando productos. Total:", productos.length, "Filtros:", { searchTerm, statusFilter });
    const filtered = (productos as ProductoData[]).filter((producto: ProductoData) => {
      const matchesSearch = 
        (producto.codigo && producto.codigo.toLowerCase().includes(searchTerm.toLowerCase())) ||
        producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (producto.referencia && producto.referencia.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (producto.inv_medidas?.nombre && producto.inv_medidas.nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (producto.inv_categorias?.nombre && producto.inv_categorias.nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (producto.inv_sublineas?.nombre && producto.inv_sublineas.nombre.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "active" && producto.estado === 1) ||
        (statusFilter === "inactive" && producto.estado === 0);
      
      return matchesSearch && matchesStatus;
    });
    console.log("🔍 Productos filtrados:", filtered.length, "IDs:", filtered.map(p => p.id));
    return filtered;
  }, [productos, searchTerm, statusFilter]);

  // Handlers
  const handleEditarProducto = (producto: ProductoData) => {
    setEditingProducto(producto);
    setActiveTab("formulario");
  };

  const handleNuevoProducto = () => {
    setEditingProducto(null);
    setActiveTab("formulario");
  };

  const handleActivateProducto = (id: number) => {
    activateProductoMutation.mutate(id);
  };

  const handleDeactivateProducto = (id: number) => {
    deactivateProductoMutation.mutate(id);
  };

  return (
    <div className="p-4 max-w-full mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-extrabold text-cyan-800 flex items-center gap-2 mb-2">
          <Package className="w-8 h-8 text-cyan-600" />
          Gestión de Productos
        </h1>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-cyan-100/60 p-1 rounded-lg">
          <TabsTrigger
            value="productos"
            className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md transition-all duration-300"
          >
            <Package className="w-4 h-4 mr-2" />
            Productos
          </TabsTrigger>
          <TabsTrigger
            value="formulario"
            onClick={handleNuevoProducto}
            className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            {editingProducto ? 'Editar Producto' : 'Nuevo Producto'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="productos" className="mt-6">
          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 border-b border-cyan-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-cyan-600" />
                  <span className="text-lg font-semibold text-gray-700">PRODUCTOS</span>
                </div>
                <div className="flex space-x-2">
                  <Can action="accion-crear-producto">
                    <Button
                      onClick={handleNuevoProducto}
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
                      placeholder="Buscar por código, nombre, referencia, medida, categoría o sublínea..."
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
                      <TableHead className="px-4 py-3 w-24">Código</TableHead>
                      <TableHead className="px-4 py-3">Nombre</TableHead>
                      <TableHead className="px-4 py-3 w-24">Referencia</TableHead>
                      <TableHead className="px-4 py-3 w-24">Medida</TableHead>
                      <TableHead className="px-4 py-3 w-24">Categoría</TableHead>
                      <TableHead className="px-4 py-3 w-24">Sublínea</TableHead>
                      <TableHead className="px-4 py-3 w-24">Costo</TableHead>
                      <TableHead className="px-4 py-3 w-24">Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={9} className="h-24 text-center">
                          <div className="flex items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin mr-2" />
                            Cargando productos...
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : productosFiltrados.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="h-24 text-center">
                          No hay productos disponibles.
                        </TableCell>
                      </TableRow>
                    ) : (
                      productosFiltrados.map((producto: ProductoData) => (
                        <TableRow key={producto.id} className="hover:bg-gray-50">
                          <TableCell className="px-2 py-1">
                            <div className="flex items-center justify-start gap-1">
                              <Can action="accion-editar-producto">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleEditarProducto(producto)}
                                        aria-label="Editar producto"
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

                              {producto.estado === 1 ? (
                                <Can action="accion-desactivar-producto">
                                  <AlertDialog>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <AlertDialogTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              aria-label="Inactivar producto"
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
                                          Esta acción inactivará el producto "{producto.nombre}".
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleDeactivateProducto(producto.id!)}
                                        >
                                          Inactivar
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </Can>
                              ) : (
                                <Can action="accion-activar-producto">
                                  <AlertDialog>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <AlertDialogTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              aria-label="Activar producto"
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
                                          Esta acción activará el producto "{producto.nombre}".
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleActivateProducto(producto.id!)}
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
                          <TableCell className="px-3 py-2 text-sm text-gray-900 font-medium w-24">
                            {producto.codigo || "-"}
                          </TableCell>
                          <TableCell className="px-3 py-2 text-sm text-gray-900">
                            {producto.nombre}
                          </TableCell>
                          <TableCell className="px-3 py-2 text-sm text-gray-900 w-24">
                            {producto.referencia || "-"}
                          </TableCell>
                          <TableCell className="px-3 py-2 text-sm text-gray-900 w-24">
                            {producto.inv_medidas?.nombre || "-"}
                          </TableCell>
                          <TableCell className="px-3 py-2 text-sm text-gray-900 w-24">
                            {producto.inv_categorias?.nombre || "-"}
                          </TableCell>
                          <TableCell className="px-3 py-2 text-sm text-gray-900 w-24">
                            {producto.inv_sublineas?.nombre || "-"}
                          </TableCell>
                          <TableCell className="px-3 py-2 text-sm text-gray-900 w-24">
                            {producto.ultimo_costo ? `$${producto.ultimo_costo.toLocaleString()}` : "-"}
                          </TableCell>
                          <TableCell className="px-3 py-2">
                            <Badge
                              variant={producto.estado === 1 ? "default" : "secondary"}
                              className={
                                producto.estado === 1
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }
                            >
                              {producto.estado === 1 ? "Activo" : "Inactivo"}
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
          <ProductoFormComponent
            producto={editingProducto}
            editingProducto={editingProducto}
            medidas={medidas}
            categorias={categorias}
            sublineas={sublineas}
            onSubmit={(data) => {
              if (editingProducto) {
                updateProductoMutation.mutate({ id: editingProducto.id!, data });
              } else {
                // Para crear, no incluir el id
                const { id, ...createData } = data as any;
                createProductoMutation.mutate(createData);
              }
            }}
            isLoading={createProductoMutation.isPending || updateProductoMutation.isPending}
            onCancel={() => {
              setEditingProducto(null);
              setActiveTab("productos");
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductosPage;
