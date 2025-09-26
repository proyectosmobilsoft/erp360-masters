import React, { useState, useMemo, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { useLoading } from '@/contexts/LoadingContext';
import { Can } from '@/contexts/PermissionsContext';
import { useAuth } from '@/contexts/AuthContext';
import { ModernTimePicker } from '@/components/ui/modern-time-picker';
import {
  Package,
  Plus,
  Edit,
  Lock,
  Search,
  Loader2,
  Save,
  RefreshCw,
  CheckCircle,
  Trash2,
  ChevronDown,
  Eye,
  X
} from 'lucide-react';
import { productosService, ProductoData, ProductoForm, CategoriaData, UtilidadProducto } from '@/services/productosService';
import { MedidaData, medidasService } from '@/services/medidasService';
import { SublineaData as SublineaDataFull } from '@/services/sublineasService';
import { lineasService, LineaData } from '@/services/lineasService';
import { tiposService, TipoData } from '@/services/tiposService';
import { claseServiciosService, ClaseServicioData } from '@/services/claseServiciosService';
import { interfazContableService, InterfazContableData } from '@/services/interfazContableService';
import { presentacionMedidasService, PresentacionMedidaData } from '@/services/presentacionMedidasService';
import { productosUnidadesService, ProductoUnidadData } from '@/services/productosUnidadesService';
import { sublineasService } from '@/services/sublineasService';

// Image Upload Component
interface ImageUploadProps {
  value?: string;
  onChange: (value: string) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ value, onChange }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: '❌ Archivo no válido',
        description: 'Por favor selecciona un archivo de imagen válido.',
        variant: 'destructive',
        className: "bg-red-50 border-red-200 text-red-800",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: '❌ Archivo muy grande',
        description: 'El archivo debe ser menor a 5MB.',
        variant: 'destructive',
        className: "bg-red-50 border-red-200 text-red-800",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        onChange(result);
        toast({
          title: '✅ Imagen cargada',
          description: 'La imagen se ha cargado exitosamente.',
          className: "bg-green-50 border-green-200 text-green-800",
        });
      }
    };
    reader.readAsDataURL(file);
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

  const handleClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    };
    input.click();
  };

  return (
    <div
      className={`w-full h-full border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer transition-colors ${isDragOver
          ? 'border-cyan-500 bg-cyan-50'
          : value
            ? 'border-gray-300 bg-white'
            : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
        }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      {value ? (
        <div className="relative w-full h-full">
          <img
            src={value}
            alt="Imagen del producto"
            className="w-full h-full object-cover rounded-lg"
          />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
            }}
            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 text-xs"
          >
            ×
          </button>
        </div>
      ) : (
        <div className="text-center">
          <div className="text-gray-400 text-2xl mb-1">📷</div>
          <p className="text-gray-500 text-xs">
            Haz clic o arrastra
          </p>
          <p className="text-gray-400 text-xs">
            PNG, JPG hasta 5MB
          </p>
        </div>
      )}
    </div>
  );
};

// Form Component
interface ProductoFormComponentProps {
  producto?: ProductoData | null;
  editingProducto?: ProductoData | null;
  medidas: MedidaData[];
  categorias: CategoriaData[];
  sublineas: SublineaDataFull[];
  lineas: LineaData[];
  tipos: TipoData[];
  interfacesContables: InterfazContableData[];
  presentacionesMedidas: PresentacionMedidaData[];
  productos: ProductoData[];
  claseServicios: ClaseServicioData[];
  esReceta: boolean;
  user: any; // Usuario autenticado
  tiempoPreparacion: string;
  utilidadesProducto: UtilidadProducto;
  unidadTiempoPreparacion: number;
  medidasPrincipales: any[];
  onTiempoPreparacionChange: (value: string) => void;
  onUtilidadesProductoChange: (value: UtilidadProducto) => void;
  onUnidadTiempoPreparacionChange: (value: number) => void;
  onSubmit: (data: ProductoForm & { tiempoPreparacion?: string; utilidadesProducto?: UtilidadProducto }) => void;
  isLoading: boolean;
  onCancel: () => void;
  showIngredientesModalFormulario: boolean;
  setShowIngredientesModalFormulario: (value: boolean) => void;
  recetaSeleccionadaFormulario: {id: number, nombre: string} | null;
  setRecetaSeleccionadaFormulario: (value: {id: number, nombre: string} | null) => void;
  ingredientesRecetaFormulario: any[];
  setIngredientesRecetaFormulario: (value: any[]) => void;
  onVerIngredientesRecetaFormulario: (ingrediente: any) => void;
  // Props para unidades de servicio
  unidadesServicio: any[];
  unidadesServicioAsignadas: any[];
  nuevaUnidadServicio: {id_unidad_servicio: number; no_ppl: number};
  setNuevaUnidadServicio: (value: {id_unidad_servicio: number; no_ppl: number}) => void;
  handleAgregarUnidadServicio: () => void;
  handleEliminarUnidadServicio: (idUnidad: number) => void;
}

const ProductoFormComponent: React.FC<ProductoFormComponentProps> = ({
  producto,
  editingProducto,
  medidas,
  categorias,
  sublineas,
  lineas,
  tipos,
  interfacesContables,
  presentacionesMedidas,
  productos,
  claseServicios,
  esReceta,
  user,
  tiempoPreparacion,
  utilidadesProducto,
  unidadTiempoPreparacion,
  medidasPrincipales,
  onTiempoPreparacionChange,
  onUtilidadesProductoChange,
  onUnidadTiempoPreparacionChange,
  onSubmit,
  isLoading,
  onCancel,
  showIngredientesModalFormulario,
  setShowIngredientesModalFormulario,
  recetaSeleccionadaFormulario,
  setRecetaSeleccionadaFormulario,
  ingredientesRecetaFormulario,
  setIngredientesRecetaFormulario,
  onVerIngredientesRecetaFormulario,
  unidadesServicio,
  unidadesServicioAsignadas,
  nuevaUnidadServicio,
  setNuevaUnidadServicio,
  handleAgregarUnidadServicio,
  handleEliminarUnidadServicio
}) => {
  const [formData, setFormData] = useState<ProductoForm>({
    codigo: producto?.codigo || "",
    nombre: producto?.nombre || "",
    id_medida: producto?.id_medida || 0,
    id_tipo_producto: producto?.id_tipo_producto || 0,
    id_categoria: producto?.id_categoria || 0,
    id_linea: 0, // Campo temporal para manejar la línea seleccionada
    id_sublineas: producto?.id_sublineas || 0,
    id_interfaz_contable: producto?.id_interfaz_contable || undefined,
    id_marca: producto?.id_marca || undefined,
    id_color: producto?.id_color || undefined,
    referencia: producto?.referencia || "",
    id_clase_servicio: producto?.id_clase_servicio || undefined,
    tipo_menu: producto?.tipo_menu || "",
    no_ciclo: producto?.no_ciclo || 0,
    id_unidad_servicio: producto?.id_unidad_servicio || undefined,
    ultimo_costo: producto?.ultimo_costo || 0,
    id_proveedor: producto?.id_proveedor || undefined,
    frecuencia: producto?.frecuencia?.toString() || "semanal",
    controla_existencia: producto?.controla_existencia || 0,
    controla_lotes: producto?.controla_lotes || 0,
    imgbase64: producto?.imgbase64 || "",
  });

  // Actualizar formData cuando cambie el producto (para edición)
  React.useEffect(() => {
    console.log('🚀 useEffect de producto ejecutándose, producto:', producto);
    if (producto) {
      console.log('📝 Valores del producto:');
      console.log('  - tipo_menu:', producto.tipo_menu);
      
      setFormData(prev => {
        console.log('🔄 formData anterior:', prev);
        const newFormData = {
          ...prev,
          codigo: producto.codigo || "",
          nombre: producto.nombre || "",
          id_medida: producto.id_medida || 0,
          id_tipo_producto: producto.id_tipo_producto || 0,
          id_categoria: producto.id_categoria || 0,
          id_sublineas: producto.id_sublineas || 0,
          id_interfaz_contable: producto.id_interfaz_contable || undefined,
          id_marca: producto.id_marca || undefined,
          id_color: producto.id_color || undefined,
          referencia: producto.referencia || "",
          id_clase_servicio: producto.id_clase_servicio || undefined,
          tipo_menu: producto.tipo_menu || "",
          no_ciclo: producto.no_ciclo || 0,
          id_unidad_servicio: producto.id_unidad_servicio || undefined,
          ultimo_costo: producto.ultimo_costo || 0,
          id_proveedor: producto.id_proveedor || undefined,
          frecuencia: producto.frecuencia?.toString() || "semanal",
          controla_existencia: producto.controla_existencia || 0,
          controla_lotes: producto.controla_lotes || 0,
          imgbase64: producto.imgbase64 || "",
        };
        console.log('✅ Nuevo formData:', newFormData);
        return newFormData;
      });
    }
  }, [producto]);

  // Debug: mostrar formData cuando cambie
  React.useEffect(() => {
    console.log('🎯 formData actualizado:');
    console.log('  - tipo_menu:', formData.tipo_menu);
  }, [formData.tipo_menu]);

  // Estados para manejar las dependencias
  const [lineasFiltradas, setLineasFiltradas] = useState<LineaData[]>([]);
  const [sublineasFiltradas, setSublineasFiltradas] = useState<SublineaDataFull[]>([]);
  const [activeFormTab, setActiveFormTab] = useState<string>("precio");

  // Estados para ingredientes
  const [ingredienteForm, setIngredienteForm] = useState({
    id_producto: 0,
    cantidad: 1,
    unidad: "",
    costo_unitario: 0,
    total: 0,
    es_receta: false
  });
  const [ingredientes, setIngredientes] = useState<any[]>([]);
  const [totalIngredientes, setTotalIngredientes] = useState(0);
  const [totalPorciones, setTotalPorciones] = useState(0);

  // Función para calcular totales de ingredientes
  const calcularTotalesIngredientes = (ingredientesList: any[]) => {
    // Separar productos y recetas
    const productosIngredientes = ingredientesList.filter(ing => {
      const producto = productos.find(p => p.id === ing.id_producto);
      return producto && (!producto.id_clase_servicio || producto.id_clase_servicio === 0);
    });
    
    const recetasIngredientes = ingredientesList.filter(ing => {
      const producto = productos.find(p => p.id === ing.id_producto);
      return producto && producto.id_clase_servicio && producto.id_clase_servicio > 0;
    });

    // Calcular totales
    const totalProductos = productosIngredientes.reduce((sum, ing) => sum + ing.total, 0);
    const totalRecetas = recetasIngredientes.reduce((sum, ing) => sum + ing.total, 0);
    const totalGeneral = totalProductos + totalRecetas;

    return {
      totalProductos,
      totalRecetas,
      totalGeneral,
      cantidadRecetas: recetasIngredientes.length,
      totalPorciones: totalRecetas // Total de todas las recetas (suma de sus ingredientes)
    };
  };
  
  
  // Refs para mantener referencias a los valores actuales
  const tiempoPreparacionRef = React.useRef<string>("00:00:00");
  const utilidadesProductoRef = React.useRef<UtilidadProducto>({
    id_producto: 0,
    id_indicie_dificultad: 1,
    tasa_perdida: 0.00000,
    tasa_utilidad: 0.00000,
    tiempo_preparacion: "00:00:00",
    nota: "",
    estado: 1
  });
  
  // Actualizar refs cuando cambien los valores
  React.useEffect(() => {
    tiempoPreparacionRef.current = tiempoPreparacion;
    console.log('🔄 tiempoPreparacion actualizado:', tiempoPreparacion);
  }, [tiempoPreparacion]);
  
  React.useEffect(() => {
    utilidadesProductoRef.current = utilidadesProducto;
    console.log('🔄 utilidadesProducto actualizado:', utilidadesProducto);
  }, [utilidadesProducto]);
  
  
  // Funciones para convertir entre formato de tiempo y minutos
  const minutosATiempo = (minutos: number): string => {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    const segundos = 0; // Esta función es para convertir minutos a tiempo, no para preservar segundos
    return `${horas.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
  };
  
  const tiempoAMinutos = (tiempo: string): number => {
    const [horas, minutos] = tiempo.split(':').map(Number);
    return horas * 60 + minutos;
  };
  
  
  // Función para formatear tiempo correctamente
  const formatearTiempo = (tiempo: string): string => {
    if (!tiempo) return "00:00:00";
    
    const partes = tiempo.split(':');
    if (partes.length === 2) {
      // Si solo tiene horas y minutos, agregar segundos
      return tiempo + ':00';
    } else if (partes.length === 3) {
      // Si ya tiene segundos, asegurar que esté en formato correcto
      const [horas, minutos, segundos] = partes;
      return `${horas.padStart(2, '0')}:${minutos.padStart(2, '0')}:${segundos.padStart(2, '0')}`;
    }
    return tiempo;
  };

  // Función para manejar cambios en el tiempo (ya no se usa con TimePicker)
  // const handleTiempoChange = (tiempo: string | null) => {
  //   if (tiempo) {
  //     const tiempoFormateado = formatearTiempo(tiempo);
  //     
  //     console.log('🕐 Tiempo cambiado:', { original: tiempo, formateado: tiempoFormateado });
  //     
  //     onTiempoPreparacionChange(tiempoFormateado);
  //     onUtilidadesProductoChange({
  //       ...utilidadesProducto,
  //       tiempo_preparacion: tiempoFormateado
  //     });
  //   }
  // };
  
  // Función para guardar utilidades con valores actuales
  const saveUtilidadesWithCurrentValues = async (idProducto: number) => {
    try {
      const tiempoActual = tiempoPreparacionRef.current;
      const notaActual = utilidadesProductoRef.current.nota;
      
      console.log('🔍 Valores capturados para utilidades:', {
        tiempoPreparacion: tiempoActual,
        nota: notaActual,
        esReceta: esReceta
      });
      
      await productosService.saveOrUpdateProductoUtilidades(idProducto, {
        id_producto: idProducto,
        id_indicie_dificultad: 1,
        tasa_perdida: 0.00000,
        tasa_utilidad: 0.00000,
        tiempo_preparacion: tiempoActual,
        nota: notaActual,
        estado: 1
      });
      
      console.log('✅ Utilidades guardadas correctamente:', {
        id_producto: idProducto,
        tiempo_preparacion: tiempoActual,
        nota: notaActual
      });
    } catch (error) {
      console.error('Error al guardar utilidades:', error);
    }
  };
  const [openProductoSelect, setOpenProductoSelect] = useState(false);
  const [medidasFiltradas, setMedidasFiltradas] = useState<MedidaData[]>([]);
  const [costoInputValue, setCostoInputValue] = useState("");

  const [nextCodigo, setNextCodigo] = useState<string>("");
  const [codigoGenerado, setCodigoGenerado] = useState<string>("");

  // Función para truncar texto
  const truncateText = (text: string, maxLength: number = 50): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Función para formatear valores monetarios (local)
  const formatCurrencyLocal = (value: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };


  // Función para calcular costo de ingredientes de receta
  const calcularCostoReceta = async (idProducto: number): Promise<number> => {
    try {
      console.log('🍳 Calculando costo total de ingredientes de la receta...');
      const ingredientesReceta = await productosService.getProductoIngredientes(idProducto);
      console.log('📋 Ingredientes de la receta:', ingredientesReceta);
      
      // Calcular costo total de los ingredientes
      const costoTotalIngredientes = ingredientesReceta.reduce((total, ingrediente) => {
        const costoIngrediente = ingrediente.cantidad * (ingrediente.costo || 0);
        console.log(`💰 Ingrediente: ${ingrediente.cantidad} x ${ingrediente.costo} = ${costoIngrediente}`);
        return total + costoIngrediente;
      }, 0);
      
      console.log('💰 Costo total de ingredientes:', costoTotalIngredientes);
      return costoTotalIngredientes;
    } catch (error) {
      console.error('❌ Error al obtener ingredientes de la receta:', error);
      return 0;
    }
  };

  // Funciones para manejar ingredientes
  const handleIngredienteChange = async (field: string, value: any) => {
    // Si se selecciona un producto, manejar lógica async primero
      if (field === 'id_producto') {
        const productoSeleccionado = productos.find(p => p.id === parseInt(value));
        if (productoSeleccionado) {
        // Verificar si el producto es una receta (tiene id_clase_servicio)
        const esReceta = productoSeleccionado.id_clase_servicio && productoSeleccionado.id_clase_servicio > 0;
        
        let costoCalculado = productoSeleccionado.ultimo_costo || 0;
        
        // Si es receta, calcular costo total de ingredientes
        if (esReceta) {
          costoCalculado = await calcularCostoReceta(productoSeleccionado.id);
          if (costoCalculado === 0) {
            // Si hay error, usar el costo normal del producto
            costoCalculado = productoSeleccionado.ultimo_costo || 0;
          }
        }
        
        // Ahora actualizar el estado con toda la información
        setIngredienteForm(prev => {
          const newForm = { ...prev, [field]: value };
          
          newForm.costo_unitario = costoCalculado;
          setCostoInputValue(costoCalculado > 0 ? costoCalculado.toString() : '0.00');
          
          // IMPORTANTE: Limpiar el campo unidad al seleccionar un nuevo producto
          console.log('🧹 Limpiando campo unidad al seleccionar nuevo producto');
          newForm.unidad = "";
          
          if (esReceta) {
            // Si es receta: cantidad = 1, unidad = unidad del producto, campos deshabilitados
            newForm.cantidad = 1;
            newForm.es_receta = true; // Flag para deshabilitar campos
            
            // IMPORTANTE: Para recetas, RESETEAR y cargar TODAS las medidas para asegurar que la unidad correcta esté disponible
            console.log('🔄 Reseteando medidasFiltradas para receta');
            const todasLasMedidas = medidas.filter(m => m.estado === 1);
            setMedidasFiltradas(todasLasMedidas);
            
            // Buscar la medida del producto receta
            const medidaProductoReceta = medidas.find(m => m.id === productoSeleccionado.id_medida);
            const unidadReceta = medidaProductoReceta?.abreviatura || "";
            newForm.unidad = unidadReceta;
            
            console.log('🍳 Producto es receta, cargando TODAS las medidas:', {
              productoReceta: productoSeleccionado.nombre,
              id_medida_producto: productoSeleccionado.id_medida,
              medidaProductoReceta,
              unidadSeleccionada: unidadReceta,
              todasLasMedidas: todasLasMedidas.length,
              medidas: todasLasMedidas,
              medidasFiltradasAnteriores: medidasFiltradas.length,
              costoTotalIngredientes: newForm.costo_unitario,
              newForm: {
                cantidad: newForm.cantidad,
                unidad: newForm.unidad,
                es_receta: newForm.es_receta,
                costo_unitario: newForm.costo_unitario
              }
            });
          } else {
            // Si no es receta: comportamiento normal (lógica original)
            newForm.es_receta = false;
          
          // Filtrar medidas por la clase de medida del producto seleccionado
          const medidaProducto = medidas.find(m => m.id === productoSeleccionado.id_medida);
            
          if (medidaProducto && medidaProducto.clase_medida) {
              // Filtrar medidas que tengan la misma clase_medida
            const medidasFiltradas = medidas.filter(m => 
              m.clase_medida === medidaProducto.clase_medida && m.estado === 1
            );
              console.log('🔍 Filtrando medidas por clase:', {
                medidaProducto,
                clase_medida: medidaProducto.clase_medida,
                medidasFiltradas,
                totalMedidas: medidas.length
              });
            setMedidasFiltradas(medidasFiltradas);
          } else {
            // Si no hay clase de medida, mostrar todas las medidas activas
              console.log('⚠️ No hay clase_medida, mostrando todas las medidas:', {
                medidaProducto,
                medidasActivas: medidas.filter(m => m.estado === 1).length
              });
            setMedidasFiltradas(medidas.filter(m => m.estado === 1));
          }
          }
          
          // Calcular total inmediatamente al seleccionar producto
          newForm.total = newForm.cantidad * newForm.costo_unitario;
          return newForm;
        });
        
        return; // Salir temprano para evitar el setState duplicado
      }
    }
    
    // Para otros campos, usar lógica normal
    setIngredienteForm(prev => {
      const newForm = { ...prev, [field]: value };
      
      // Calcular total automáticamente
      if (field === 'cantidad' || field === 'costo_unitario') {
        newForm.total = newForm.cantidad * newForm.costo_unitario;
      }
      
      return newForm;
    });
  };


  // Función para manejar el cambio del input de costo (igual que último costo)
  const handleCostoInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Si el campo está vacío, mostrar 0.00
    if (inputValue === '') {
      setCostoInputValue('0.00');
      setIngredienteForm(prev => {
        const newForm = { ...prev, costo_unitario: 0 };
        newForm.total = newForm.cantidad * newForm.costo_unitario;
        return newForm;
      });
      return;
    }

    // Limpiar el valor, permitir solo números y punto
    let cleanValue = inputValue.replace(/[^0-9.]/g, '');

    // Asegurar que solo haya un punto decimal
    const parts = cleanValue.split('.');
    if (parts.length > 2) {
      cleanValue = parts[0] + '.' + parts.slice(1).join('');
    }

    // Formatear en tiempo real
    const formatted = formatCurrencyDisplay(cleanValue);
    setCostoInputValue(formatted);

    // Convertir a número y actualizar el estado
    const numericValue = parseFloat(cleanValue) || 0;
    setIngredienteForm(prev => {
      const newForm = { ...prev, costo_unitario: numericValue };
      newForm.total = newForm.cantidad * newForm.costo_unitario;
      return newForm;
    });
  };

  const handleCostoInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  const handleCostoInputBlur = () => {
    const formatted = formatOnBlur(costoInputValue);
    setCostoInputValue(formatted);
  };

  const handleAgregarIngrediente = () => {
    if (ingredienteForm.id_producto && ingredienteForm.cantidad > 0 && ingredienteForm.unidad) {
      const nuevoIngrediente = {
        id: Date.now(), // ID temporal
        ...ingredienteForm,
        nombre_producto: productos.find(p => p.id === ingredienteForm.id_producto)?.nombre || 'Producto'
      };
      
      const nuevosIngredientes = [...ingredientes, nuevoIngrediente];
      setIngredientes(nuevosIngredientes);
      
      // Calcular totales actualizados
      const totales = calcularTotalesIngredientes(nuevosIngredientes);
      setTotalIngredientes(totales.totalProductos);
      setTotalPorciones(totales.totalPorciones);
      
      // Limpiar formulario
      setIngredienteForm({
        id_producto: 0,
        cantidad: 1,
        unidad: "",
        costo_unitario: 0,
        total: 0,
        es_receta: false
      });
      setCostoInputValue("0.00");
    }
  };

  const handleEliminarIngrediente = (id: number) => {
    const ingredientesActualizados = ingredientes.filter(i => i.id !== id);
    setIngredientes(ingredientesActualizados);
    
    // Recalcular totales
    const totales = calcularTotalesIngredientes(ingredientesActualizados);
    setTotalIngredientes(totales.totalProductos);
    setTotalPorciones(totales.totalPorciones);
  };

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

  // Inicializar medidas filtradas cuando se cargan las medidas
  React.useEffect(() => {
    if (medidas.length > 0) {
      setMedidasFiltradas(medidas.filter(m => m.estado === 1));
    }
  }, [medidas]);

  // Detectar si la categoría seleccionada es receta
  React.useEffect(() => {
    if (formData.id_categoria && categorias.length > 0) {
      const categoriaSeleccionada = categorias.find(cat => cat.id === formData.id_categoria);
      const nuevaEsReceta = categoriaSeleccionada?.isreceta === 1;
      
      // Cambiar el tab activo según si es receta o no
      if (nuevaEsReceta) {
        setActiveFormTab("ingredientes");
      } else {
        setActiveFormTab("precio");
      }

      // Limpiar valores de los tabs al cambiar categoría
      setIngredientes([]);
      setTotalIngredientes(0);
      setTotalPorciones(0);
      setIngredienteForm({
        id_producto: 0,
        cantidad: 1,
        unidad: "",
        costo_unitario: 0,
        total: 0,
        es_receta: false
      });
      setCostoInputValue("0.00");
      // Solo resetear tiempo y tipo_menu si NO estamos editando
      if (!editingProducto) {
        console.log('🔄 Reseteando campos porque NO estamos editando');
        setFormData(prev => ({ 
          ...prev, 
          tiempo: 0, // Reset tiempo de preparación
          tipo_menu: "" // Reset tipo de menú
        }));
      } else {
        console.log('✅ NO reseteando campos porque estamos editando');
      }
    } else {
      setActiveFormTab("precio");
    }
  }, [formData.id_categoria, categorias]);

  // Notificar al componente padre cuando cambie esReceta
  React.useEffect(() => {
    if (formData.id_categoria && categorias.length > 0) {
      const categoriaSeleccionada = categorias.find(cat => cat.id === formData.id_categoria);
      const nuevaEsReceta = categoriaSeleccionada?.isreceta === 1;
      
      console.log('🔍 Categoría cambiada:', {
        id_categoria: formData.id_categoria,
        categoria: categoriaSeleccionada?.nombre,
        isreceta: categoriaSeleccionada?.isreceta,
        nuevaEsReceta
      });
      
      // Notificar al componente padre sobre el cambio
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('categoriaChanged', { 
          detail: { esReceta: nuevaEsReceta } 
        }));
      }
    }
  }, [formData.id_categoria, categorias]);

  // Reiniciar formulario cuando cambie editingProducto
  React.useEffect(() => {
    setFormData({
      id: producto?.id || 0,
      codigo: producto?.codigo || "",
      nombre: producto?.nombre || "",
      id_medida: producto?.id_medida || 0,
      id_tipo_producto: producto?.id_tipo_producto || 0,
      id_categoria: producto?.id_categoria || 0,
      id_linea: 0, // Campo temporal para manejar la línea seleccionada
      id_sublineas: producto?.id_sublineas || 0,
      id_interfaz_contable: producto?.id_interfaz_contable || undefined,
      id_marca: producto?.id_marca || undefined,
      id_color: producto?.id_color || undefined,
      referencia: producto?.referencia || "",
      id_clase_servicio: producto?.id_clase_servicio || undefined,
      id_unidad_servicio: producto?.id_unidad_servicio || undefined,
      ultimo_costo: producto?.ultimo_costo || 0,
      id_proveedor: producto?.id_proveedor || undefined,
      frecuencia: producto?.frecuencia?.toString() || "semanal",
      controla_existencia: producto?.controla_existencia || 0,
      controla_lotes: producto?.controla_lotes || 0,
      imgbase64: producto?.imgbase64 || "",
    });
  }, [producto]);

  // Manejar edición de producto específicamente
  React.useEffect(() => {
    if (editingProducto) {
      // Obtener la línea directamente de la sublínea del producto
      const idLinea = editingProducto.inv_sublineas?.id_linea || 0;
      const idCategoria = editingProducto.id_categoria || 0;

      // Inicializar formData con los valores correctos
      setFormData({
        id: editingProducto.id || 0,
        codigo: editingProducto.codigo || "",
        nombre: editingProducto.nombre || "",
        id_medida: editingProducto.id_medida || 0,
        id_tipo_producto: editingProducto.id_tipo_producto || 0,
        id_categoria: idCategoria,
        id_linea: idLinea,
        id_sublineas: editingProducto.id_sublineas || 0,
        id_interfaz_contable: editingProducto.id_interfaz_contable || undefined,
        id_marca: editingProducto.id_marca || undefined,
        id_color: editingProducto.id_color || undefined,
        id_clase_servicio: editingProducto.id_clase_servicio || undefined,
        id_unidad_servicio: editingProducto.id_unidad_servicio || undefined,
        id_proveedor: editingProducto.id_proveedor || undefined,
        referencia: editingProducto.referencia || "",
        ultimo_costo: editingProducto.ultimo_costo || 0,
        frecuencia: esReceta ? "" : (editingProducto.frecuencia?.toString() || "semanal"),
        controla_existencia: editingProducto.controla_existencia || 0,
        controla_lotes: editingProducto.controla_lotes || 0,
        imgbase64: editingProducto.imgbase64 || "",
      });

      // Filtrar líneas y sublíneas cuando los datos estén disponibles
      if (lineas.length > 0 && sublineas.length > 0) {
        // Filtrar líneas por categoría
        const lineasDeCategoria = lineas.filter(l => l.id_categoria === idCategoria);
        
        // Buscar la línea específica que necesitamos
        const lineaEspecifica = lineas.find(l => l.id === idLinea);
        
        // En modo edición, incluir la línea específica del producto aunque no pertenezca a la categoría
        let lineasFinales = lineasDeCategoria;
        if (editingProducto && lineaEspecifica && !lineasDeCategoria.find(l => l.id === idLinea)) {
          lineasFinales = [lineaEspecifica, ...lineasDeCategoria];
        }
        
        setLineasFiltradas(lineasFinales);
        
        // Filtrar sublíneas por línea
        const sublineasDeLinea = sublineas.filter(sub => sub.id_linea === idLinea);
        setSublineasFiltradas(sublineasDeLinea);
        
        // Establecer valores con timeout para asegurar que los selects estén listos
        setTimeout(() => {
          setFormData(prev => ({
            ...prev,
            id_linea: idLinea,
            id_categoria: idCategoria,
            id_sublineas: editingProducto.id_sublineas || 0,
            // Preservar tipo_menu y tiempo al editar
            tipo_menu: editingProducto.tipo_menu || prev.tipo_menu,
          }));
        }, 100);
      }
    }
  }, [editingProducto, lineas, sublineas]);

  // Filtrar líneas cuando cambie la categoría
  React.useEffect(() => {
    if (formData.id_categoria && formData.id_categoria > 0 && lineas.length > 0) {
      const lineasDeCategoria = lineas.filter(linea => linea.id_categoria === formData.id_categoria);
      setLineasFiltradas(lineasDeCategoria);

      // Solo resetear línea y sublínea si NO estamos editando
      if (!editingProducto) {
      setFormData(prev => ({
        ...prev,
        id_linea: 0,
        id_sublineas: 0
      }));
      }
    } else if (!editingProducto) {
      setLineasFiltradas([]);
    }
  }, [formData.id_categoria, lineas, editingProducto]);

  // Manejar líneas en modo edición - se ejecuta solo cuando se inicia la edición
  React.useEffect(() => {
    if (editingProducto && lineas.length > 0 && formData.id_linea && formData.id_linea > 0) {
      // Buscar la línea específica del producto
      const lineaEspecifica = lineas.find(l => l.id === formData.id_linea);
      if (lineaEspecifica) {
        // Obtener líneas de la categoría del producto
        const lineasDeCategoria = lineas.filter(l => l.id_categoria === formData.id_categoria);
        
        // Crear lista final: línea específica + líneas de categoría (sin duplicados)
        const lineasFinales = [lineaEspecifica, ...lineasDeCategoria.filter(l => l.id !== formData.id_linea)];
        
        setLineasFiltradas(lineasFinales);
      }
    }
  }, [editingProducto, lineas, formData.id_linea, formData.id_categoria]);

  // Filtrar sublíneas cuando cambie la línea (solo en modo creación)
  React.useEffect(() => {
    if (!editingProducto && formData.id_linea && formData.id_linea > 0 && sublineas.length > 0) {
        const sublineasDeLinea = sublineas.filter(sub => sub.id_linea === formData.id_linea);
        setSublineasFiltradas(sublineasDeLinea);

      // Resetear sublínea cuando cambie la línea en modo creación con timeout
      setTimeout(() => {
        setFormData(prev => ({
          ...prev,
          id_sublineas: 0
        }));
      }, 50);
    } else if (!editingProducto) {
        setSublineasFiltradas([]);
    }
  }, [formData.id_linea, sublineas, editingProducto]);

  // Generar código automáticamente cuando se seleccione una sublínea
  React.useEffect(() => {
    if (!editingProducto && formData.id_linea && formData.id_sublineas && formData.id_sublineas > 0) {
      generarCodigoProducto(formData.id_linea, formData.id_sublineas).then(codigo => {
        if (codigo) {
          setCodigoGenerado(codigo);
          setFormData(prev => ({ ...prev, codigo }));
        }
      });
    } else if (!editingProducto) {
      setCodigoGenerado("");
    }
  }, [formData.id_linea, formData.id_sublineas, editingProducto]);

  // Cargar ingredientes existentes cuando se edita un producto
  React.useEffect(() => {
    if (editingProducto && editingProducto.id) {
      productosService.getProductoIngredientes(editingProducto.id)
        .then(ingredientesExistentes => {
          const ingredientesFormateados = ingredientesExistentes.map(ing => ({
            id: ing.id,
            id_producto: ing.id_producto,
            cantidad: ing.cantidad,
            unidad: medidas.find(m => m.id === ing.id_medida)?.abreviatura || '',
            costo_unitario: ing.costo || 0,
            total: ing.cantidad * (ing.costo || 0),
            nombre_producto: productos.find(p => p.id === ing.id_producto)?.nombre || 'Producto'
          }));
          
          setIngredientes(ingredientesFormateados);
          
          // Recalcular totales
          const totalIng = ingredientesFormateados.reduce((sum, ing) => sum + ing.total, 0);
          setTotalIngredientes(totalIng);
          setTotalPorciones(totalIng);
        })
        .catch(error => {
          console.error('Error cargando ingredientes:', error);
        });
        
      // Cargar utilidades existentes
      productosService.getProductoUtilidades(editingProducto.id)
        .then(utilidadesExistentes => {
          if (utilidadesExistentes.length > 0) {
            const utilidad = utilidadesExistentes[0];
            onUtilidadesProductoChange(utilidad);
            onTiempoPreparacionChange(utilidad.tiempo_preparacion);
          }
        })
        .catch(error => {
          console.error('Error cargando utilidades:', error);
        });
    } else {
      // Limpiar ingredientes en modo creación
      setIngredientes([]);
      setTotalIngredientes(0);
      setTotalPorciones(0);
      
      // Limpiar utilidades en modo creación
      onUtilidadesProductoChange({
        id_producto: 0,
        id_indicie_dificultad: 1,
        tasa_perdida: 0.00000,
        tasa_utilidad: 0.00000,
        tiempo_preparacion: "00:00:00",
        nota: "",
        estado: 1
      });
      onTiempoPreparacionChange("00:00:00");
    }
  }, [editingProducto, medidas, productos]);


  const validateForm = () => {
    const errors: string[] = [];

    // Validaciones básicas
    if (!formData.nombre.trim()) {
      errors.push("El nombre es obligatorio");
    }
    if (!formData.codigo || formData.codigo.trim() === "") {
      errors.push("El código es obligatorio");
    }
    if (!formData.id_categoria || formData.id_categoria === 0) {
      errors.push("La categoría es obligatoria");
    }
    if (!formData.id_linea || formData.id_linea === 0) {
      errors.push("La línea es obligatoria");
    }
    if (!formData.id_sublineas || formData.id_sublineas === 0) {
      errors.push("La sublínea es obligatoria");
    }
    if (!formData.id_tipo_producto || formData.id_tipo_producto === 0) {
      errors.push("El tipo de producto es obligatorio");
    }

    // Validaciones específicas para recetas
    if (esReceta) {
      if (!formData.id_clase_servicio || formData.id_clase_servicio === 0) {
        errors.push("El servicio es obligatorio para recetas");
      }
      if (!formData.tipo_menu || formData.tipo_menu === "") {
        errors.push("El tipo de menú es obligatorio para recetas");
      }
    }

    // Validación adicional: verificar que la medida existe en la base de datos (solo si se seleccionó una)
    if (formData.id_medida && formData.id_medida > 0) {
      const medidaExiste = medidas.some(m => m.id === formData.id_medida);
      if (!medidaExiste) {
        errors.push("La unidad seleccionada no es válida");
      }
    }

    return errors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validar formulario
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      alert("Por favor corrija los siguientes errores:\n" + validationErrors.join("\n"));
      return;
    }

    // Convertir empaques al formato esperado por el servicio
    // Solo procesar empaques si hay alguno
    const empaquesData = empaques.length > 0 ? empaques
      .filter(empaque => {
        // Filtrar empaques válidos
        if (!empaque.tipo || empaque.tipo.trim() === '') {
          return false;
        }
        if (!empaque.factor || empaque.factor.trim() === '') {
          return false;
        }
        
        const presentacionId = presentacionesMedidas.find(p => p.nombre === empaque.tipo)?.id;
        if (!presentacionId) {
          console.warn(`No se encontró presentación para tipo: ${empaque.tipo}`);
          return false;
        }
        return true;
      })
      .map(empaque => ({
        id_presentacion: presentacionesMedidas.find(p => p.nombre === empaque.tipo)?.id!,
        factor: parseFloat(empaque.factor),
      descripcion: empaque.descripcion
      })) : [];

    // Convertir ingredientes al formato esperado por el servicio
    // Solo procesar ingredientes si hay alguno y si es una receta
    const ingredientesData = esReceta ? ingredientes
      .filter(ingrediente => {
        // Filtrar ingredientes válidos
        if (!ingrediente.id_producto || ingrediente.id_producto === 0) {
          return false;
        }
        if (!ingrediente.unidad || ingrediente.unidad.trim() === '') {
          return false;
        }
        if (!ingrediente.cantidad || ingrediente.cantidad <= 0) {
          return false;
        }
        
        const medidaId = medidas.find(m => m.abreviatura === ingrediente.unidad)?.id;
        if (!medidaId) {
          console.warn(`No se encontró medida para unidad: ${ingrediente.unidad}`);
          return false;
        }
        return true;
      })
      .map(ingrediente => ({
        id_producto: ingrediente.id_producto,
        id_medida: medidas.find(m => m.abreviatura === ingrediente.unidad)?.id!,
        cantidad: ingrediente.cantidad,
        costo: ingrediente.costo_unitario,
        estado: 1
      })) : [];

    // Filtrar campos que no existen en la tabla de productos
    const { id_linea, ...productoData } = formData;

    // Convertir id_medida = 0 a null para permitir productos sin medida
    const productoDataFinal = {
      ...productoData,
      id_medida: productoData.id_medida === 0 ? null : productoData.id_medida
    };

    // Incluir empaques e ingredientes en los datos del producto
    const dataWithEmpaques = {
      ...productoDataFinal,
      id_usuario: user?.id, // Agregar ID del usuario autenticado
      empaques: empaquesData,
      ingredientes: ingredientesData
    };

    // Debug: mostrar datos que se van a enviar
    console.log('📦 Datos a enviar:', {
      id_medida: dataWithEmpaques.id_medida,
      id_usuario: dataWithEmpaques.id_usuario,
      es_receta: esReceta,
      ingredientes_count: ingredientesData.length,
      empaques_count: empaquesData.length,
      ingredientes: ingredientesData,
      empaques: empaquesData,
      nombre: dataWithEmpaques.nombre
    });

    onSubmit({
      ...dataWithEmpaques,
      tiempoPreparacion,
      utilidadesProducto
    });
  };

  const handleInputChange = (field: keyof ProductoForm, value: string | number) => {
    // No permitir cambios manuales al código en ningún caso
    if (field === 'codigo') {
      return;
    }

    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };

      // Solo resetear en modo creación, no en edición
      if (!editingProducto) {
      // Si cambia la categoría, resetear línea y sublínea
      if (field === 'id_categoria') {
        newData.id_linea = undefined;
        newData.id_sublineas = 0;
          setCodigoGenerado(""); // Limpiar código generado
      }

      // Si cambia la línea, resetear sublínea
      if (field === 'id_linea') {
        newData.id_sublineas = 0;
          setCodigoGenerado(""); // Limpiar código generado
        }
      }

      return newData;
    });
  };

  // Función para generar código automáticamente
  const generarCodigoProducto = async (idLinea: number, idSublinea: number) => {
    try {
      // Obtener códigos de línea y sublínea
      const linea = lineas.find(l => l.id === idLinea);
      const sublinea = sublineas.find(s => s.id === idSublinea);
      
      if (!linea || !sublinea) {
        return "";
      }

      // Obtener el siguiente consecutivo para esta combinación
      const consecutivo = await productosService.getConsecutivoProducto(linea.codigo, sublinea.codigo);
      const codigoGenerado = `${linea.codigo}${sublinea.codigo}${consecutivo.toString().padStart(3, '0')}`;
      
      return codigoGenerado;
    } catch (error) {
      console.error('Error generando código:', error);
      return "";
    }
  };

  // Funciones para manejar empaques
  const handleEmpaqueTipoChange = (tipo: string) => {
    setEmpaqueForm(prev => {
      const newForm = {
        ...prev,
        tipo
      };
      return newForm;
    });

    // Generar descripción automáticamente si hay factor
    if (empaqueForm.factor) {
      generateDescripcion(tipo, empaqueForm.factor);
    }
  };

  const handleEmpaqueFactorChange = (factor: string) => {
    setEmpaqueForm(prev => {
      const newForm = {
        ...prev,
        factor
      };
      return newForm;
    });

    // Generar descripción automáticamente si hay tipo
    if (empaqueForm.tipo) {
      generateDescripcion(empaqueForm.tipo, factor);
    }
  };

  const generateDescripcion = (tipo: string, factor: string) => {
    if (tipo && factor && formData.id_medida && formData.id_medida > 0) {
      const medida = medidas.find(m => m.id === formData.id_medida);

      if (medida && medida.abreviatura) {
        const descripcion = `${tipo} X ${factor}${medida.abreviatura}`;
        setEmpaqueForm(prev => ({
            ...prev,
            descripcion
        }));
      }
    }
  };

  const handleAgregarEmpaque = () => {
    if (empaqueForm.tipo && empaqueForm.factor && empaqueForm.descripcion) {
      const nuevoEmpaque = {
        id: Date.now().toString(),
        tipo: empaqueForm.tipo,
        factor: empaqueForm.factor,
        descripcion: empaqueForm.descripcion
      };
      setEmpaques(prev => [...prev, nuevoEmpaque]);
      setEmpaqueForm({ tipo: '', factor: '', descripcion: '' });
    }
  };

  const handleEliminarEmpaque = (id: string) => {
    setEmpaques(prev => prev.filter(empaque => empaque.id !== id));
  };

  const [ultimoCostoDisplay, setUltimoCostoDisplay] = useState<string>('0.00');
  const [costoPromedioDisplay, setCostoPromedioDisplay] = useState<string>('0.00');
  const [precioMayoristaDisplay, setPrecioMayoristaDisplay] = useState<string>('0.00');
  const [precioMinoristaDisplay, setPrecioMinoristaDisplay] = useState<string>('0.00');
  const [precioPublicoDisplay, setPrecioPublicoDisplay] = useState<string>('0.00');

  // Estados para empaques asociados
  const [empaques, setEmpaques] = useState<Array<{
    id: string;
    tipo: string;
    factor: string;
    descripcion: string;
  }>>([]);
  const [empaqueForm, setEmpaqueForm] = useState({
    tipo: '',
    factor: '',
    descripcion: ''
  });



  // Inicializar valores de display cuando se edita un producto
  React.useEffect(() => {
    if (editingProducto) {
      if (editingProducto.ultimo_costo && editingProducto.ultimo_costo > 0) {
        const formatted = editingProducto.ultimo_costo.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
        setUltimoCostoDisplay(formatted);
      } else {
        setUltimoCostoDisplay('0.00');
      }
    }
  }, [editingProducto]);

  // Filtrar presentaciones por unidad seleccionada
  const presentacionesFiltradas = useMemo(() => {
    if (!formData.id_medida || formData.id_medida === 0) {
      return [];
    }
    return presentacionesMedidas.filter(presentacion =>
      presentacion.id_medida === formData.id_medida
    );
  }, [presentacionesMedidas, formData.id_medida]);

  // Filtrar tipos de producto según si es receta o no
  const tiposFiltrados = useMemo(() => {
    return tipos.filter(tipo => {
      if (esReceta) {
        return tipo.es_receta === true;
      } else {
        return tipo.es_receta === false;
      }
    });
  }, [tipos, esReceta]);

  // Limpiar formulario de empaques cuando cambie la unidad
  React.useEffect(() => {
    setEmpaqueForm({ tipo: '', factor: '', descripcion: '' });
    setEmpaques([]);
  }, [formData.id_medida]);

  // Cargar empaques existentes al editar producto
  React.useEffect(() => {
    if (editingProducto && editingProducto.id) {
      productosUnidadesService.getProductosUnidadesByProducto(editingProducto.id)
        .then(empaquesData => {
          // Convertir empaques de la base de datos al formato de la UI
          const empaquesUI = empaquesData.map(empaque => ({
            id: empaque.id.toString(),
            tipo: empaque.inv_presentacion_medidas?.nombre || '',
            factor: empaque.factor.toString(),
            descripcion: empaque.descripcion
          }));
          setEmpaques(empaquesUI);
        })
        .catch(error => {
          console.error('Error cargando empaques:', error);
          setEmpaques([]);
        });
    } else {
      setEmpaques([]);
    }
  }, [editingProducto]);

  // Sincronizar unidadTiempoPreparacion con formData.id_medida cuando es receta
  React.useEffect(() => {
    if (esReceta && unidadTiempoPreparacion > 0) {
      handleInputChange('id_medida', unidadTiempoPreparacion);
    }
  }, [esReceta, unidadTiempoPreparacion]);

  // Cargar unidadTiempoPreparacion desde formData.id_medida cuando se edita una receta
  React.useEffect(() => {
    if (esReceta && editingProducto && formData.id_medida && formData.id_medida > 0) {
      onUnidadTiempoPreparacionChange(formData.id_medida);
    }
  }, [esReceta, editingProducto, formData.id_medida, onUnidadTiempoPreparacionChange]);

  const handleUltimoCostoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Si el campo está vacío, mostrar 0.00
    if (inputValue === '') {
      setUltimoCostoDisplay('0.00');
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

    // Formatear en tiempo real
    const formatted = formatCurrencyDisplay(cleanValue);
    setUltimoCostoDisplay(formatted);

    // Convertir a número y actualizar el estado
    const numericValue = parseFloat(cleanValue) || 0;
    setFormData(prev => ({
      ...prev,
      ultimo_costo: numericValue
    }));
  };

  const handleCostoPromedioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue === '') {
      setCostoPromedioDisplay('0.00');
      return;
    }
    let cleanValue = inputValue.replace(/[^0-9.]/g, '');
    const parts = cleanValue.split('.');
    if (parts.length > 2) {
      cleanValue = parts[0] + '.' + parts.slice(1).join('');
    }
    if (parts.length === 2 && parts[1].length > 2) {
      cleanValue = parts[0] + '.' + parts[1].substring(0, 2);
    }

    // Formatear en tiempo real
    const formatted = formatCurrencyDisplay(cleanValue);
    setCostoPromedioDisplay(formatted);
  };

  const handlePrecioMayoristaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue === '') {
      setPrecioMayoristaDisplay('0.00');
      return;
    }
    let cleanValue = inputValue.replace(/[^0-9.]/g, '');
    const parts = cleanValue.split('.');
    if (parts.length > 2) {
      cleanValue = parts[0] + '.' + parts.slice(1).join('');
    }
    if (parts.length === 2 && parts[1].length > 2) {
      cleanValue = parts[0] + '.' + parts[1].substring(0, 2);
    }

    // Formatear en tiempo real
    const formatted = formatCurrencyDisplay(cleanValue);
    setPrecioMayoristaDisplay(formatted);
  };

  const handlePrecioMinoristaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue === '') {
      setPrecioMinoristaDisplay('0.00');
      return;
    }
    let cleanValue = inputValue.replace(/[^0-9.]/g, '');
    const parts = cleanValue.split('.');
    if (parts.length > 2) {
      cleanValue = parts[0] + '.' + parts.slice(1).join('');
    }
    if (parts.length === 2 && parts[1].length > 2) {
      cleanValue = parts[0] + '.' + parts[1].substring(0, 2);
    }

    // Formatear en tiempo real
    const formatted = formatCurrencyDisplay(cleanValue);
    setPrecioMinoristaDisplay(formatted);
  };

  const handlePrecioPublicoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue === '') {
      setPrecioPublicoDisplay('0.00');
      return;
    }
    let cleanValue = inputValue.replace(/[^0-9.]/g, '');
    const parts = cleanValue.split('.');
    if (parts.length > 2) {
      cleanValue = parts[0] + '.' + parts.slice(1).join('');
    }
    if (parts.length === 2 && parts[1].length > 2) {
      cleanValue = parts[0] + '.' + parts[1].substring(0, 2);
    }

    // Formatear en tiempo real
    const formatted = formatCurrencyDisplay(cleanValue);
    setPrecioPublicoDisplay(formatted);
  };

  const formatCurrencyDisplay = (value: string) => {
    if (!value) return '0.00';

    // Solo formatear separadores de miles, sin decimales automáticos
    if (value.includes('.')) {
      const [integerPart, decimalPart] = value.split('.');
      const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return `${formattedInteger}.${decimalPart}`;
    } else {
      // Solo parte entera, formatear con separadores de miles
      const formattedInteger = value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return formattedInteger;
    }
  };

  const formatOnBlur = (value: string) => {
    if (!value || value === '') return '0.00';

    // Remover comas para procesar el valor
    const cleanValue = value.replace(/,/g, '');

    // Si tiene punto decimal, formatear la parte entera y asegurar 2 decimales
    if (cleanValue.includes('.')) {
      const [integerPart, decimalPart] = cleanValue.split('.');
      const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

      // Asegurar que siempre tenga 2 decimales
      let paddedDecimal = decimalPart;
      if (decimalPart.length === 1) {
        paddedDecimal = decimalPart + '0';
      } else if (decimalPart.length === 0) {
        paddedDecimal = '00';
      } else if (decimalPart.length > 2) {
        paddedDecimal = decimalPart.substring(0, 2);
      }

      return `${formattedInteger}.${paddedDecimal}`;
    } else {
      // Solo parte entera, formatear con separadores de miles y agregar .00
      const formattedInteger = cleanValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return `${formattedInteger}.00`;
    }
  };

  const handleUltimoCostoBlur = () => {
    const formatted = formatOnBlur(ultimoCostoDisplay);
    setUltimoCostoDisplay(formatted);
  };

  const handleCostoPromedioBlur = () => {
    const formatted = formatOnBlur(costoPromedioDisplay);
    setCostoPromedioDisplay(formatted);
  };

  const handlePrecioMayoristaBlur = () => {
    const formatted = formatOnBlur(precioMayoristaDisplay);
    setPrecioMayoristaDisplay(formatted);
  };

  const handlePrecioMinoristaBlur = () => {
    const formatted = formatOnBlur(precioMinoristaDisplay);
    setPrecioMinoristaDisplay(formatted);
  };

  const handlePrecioPublicoBlur = () => {
    const formatted = formatOnBlur(precioPublicoDisplay);
    setPrecioPublicoDisplay(formatted);
  };

  const handleUltimoCostoFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  const handleCostoPromedioFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  const handlePrecioMayoristaFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  const handlePrecioMinoristaFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  const handlePrecioPublicoFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  return (
    <div className="bg-white rounded-lg border shadow-lg">
      {/* Header del formulario */}
      <div className="flex items-center gap-2 p-6 border-b bg-gradient-to-r from-cyan-50 to-blue-50">
        <Package className="w-5 h-5 text-cyan-600" />
        <h2 className="text-lg font-semibold text-cyan-800">
          {editingProducto ? (esReceta ? 'Editar Receta' : 'Editar Producto') : (esReceta ? 'Nueva Receta' : 'Nuevo Producto')}
        </h2>
      </div>

      <div className="p-3">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Layout principal: dos columnas más compacto */}
          <div className="grid grid-cols-12 gap-4">
            {/* Columna izquierda - Detalles del producto */}
            <div className="col-span-8 space-y-4">
              {/* Nombre */}
              <div className="space-y-1">
                <div className="flex items-center">
                  <Label htmlFor="nombre" className="text-sm font-medium">Nombre *</Label>
                </div>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange('nombre', e.target.value.toUpperCase())}
                  required
                  className="h-8 text-sm bg-yellow-25"
                  autoComplete="off"
                />
              </div>

              {/* Características - más compacto */}
              <div className="space-y-2">
                <div className="flex items-center">
                  <h3 className="text-sm font-normal text-gray-400">Características</h3>
                  <div className="flex-1 h-px bg-gray-300 ml-3"></div>
                </div>

                {/* Primera fila de características */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <Label htmlFor="id_categoria" className="text-sm font-medium">Categoria</Label>
                    </div>
                    <Select
                      value={formData.id_categoria > 0 ? formData.id_categoria.toString() : ""}
                      onValueChange={(value) => handleInputChange('id_categoria', parseInt(value))}
                    >
                      <SelectTrigger className="h-8 text-sm bg-yellow-25">
                        <SelectValue placeholder="Seleccionar categoría" className="text-gray-400" />
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

                  <div className="space-y-1">
                    <div className="flex items-center">
                      <Label htmlFor="id_tipo_producto" className="text-sm font-medium">Tipo Producto</Label>
                    </div>
                    <Select
                      value={formData.id_tipo_producto > 0 ? formData.id_tipo_producto.toString() : ""}
                      onValueChange={(value) => handleInputChange('id_tipo_producto', parseInt(value))}
                    >
                      <SelectTrigger className="h-8 text-sm bg-yellow-25">
                        <SelectValue placeholder="Seleccionar tipo" className="text-gray-400" />
                      </SelectTrigger>
                      <SelectContent>
                        {tiposFiltrados.map((tipo) => (
                          <SelectItem key={tipo.id} value={tipo.id?.toString() || "0"}>
                            {tipo.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Segunda fila de características */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <Label htmlFor="id_linea" className="text-sm font-medium">Línea</Label>
                    </div>
                    <Select
                      value={formData.id_linea?.toString() || "0"}
                      onValueChange={(value) => handleInputChange('id_linea', parseInt(value))}
                      disabled={lineasFiltradas.length === 0}
                    >
                      <SelectTrigger className="h-8 text-sm bg-yellow-25">
                        <SelectValue placeholder={
                          lineasFiltradas.length === 0
                            ? "Seleccione una categoría primero"
                            : "Seleccionar línea"
                        } className="text-gray-400" />
                      </SelectTrigger>
                      <SelectContent>
                        {lineasFiltradas.length === 0 ? (
                          <SelectItem value="0" disabled>
                            No hay líneas disponibles
                          </SelectItem>
                        ) : (
                          lineasFiltradas.map((linea) => (
                            <SelectItem key={linea.id} value={linea.id?.toString() || "0"}>
                              {linea.nombre}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center">
                      <Label htmlFor="id_sublineas" className="text-sm font-medium">Sublínea</Label>
                    </div>
                    <Select
                      value={formData.id_sublineas > 0 ? formData.id_sublineas.toString() : ""}
                      onValueChange={(value) => handleInputChange('id_sublineas', parseInt(value))}
                      disabled={sublineasFiltradas.length === 0}
                    >
                      <SelectTrigger className="h-8 text-sm bg-yellow-25">
                        <SelectValue placeholder={
                          sublineasFiltradas.length === 0
                            ? "Seleccione una línea primero"
                            : "Seleccionar sublínea"
                        } className="text-gray-400" />
                      </SelectTrigger>
                      <SelectContent>
                        {sublineasFiltradas.length === 0 ? (
                          <SelectItem value="0" disabled>
                            No hay sublíneas disponibles
                          </SelectItem>
                        ) : (
                          sublineasFiltradas.map((sublinea) => (
                            <SelectItem key={sublinea.id} value={sublinea.id.toString()}>
                              {sublinea.nombre}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Tercera fila de características - Solo para productos normales */}
                {!esReceta && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <Label htmlFor="id_medida" className="text-sm font-medium">Unidad</Label>
                    </div>
                    <Select
                      value={formData.id_medida && formData.id_medida > 0 ? formData.id_medida.toString() : ""}
                      onValueChange={(value) => handleInputChange('id_medida', parseInt(value))}
                    >
                      <SelectTrigger className="h-8 text-sm bg-yellow-25">
                        <SelectValue placeholder="Seleccionar unidad" className="text-gray-400" />
                      </SelectTrigger>
                      <SelectContent>
                        {medidas.map((medida) => (
                          <SelectItem key={medida.id} value={medida.id.toString()}>
                            {medida.abreviatura} - {medida.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center">
                      <Label htmlFor="referencia" className="text-sm font-medium">Referencia</Label>
                    </div>
                    <Input
                      id="referencia"
                      value={formData.referencia || ""}
                      onChange={(e) => handleInputChange('referencia', e.target.value)}
                      className="h-8 text-sm bg-yellow-25"
                      autoComplete="off"
                    />
                  </div>
                </div>
                )}
              </div>

            </div>

            {/* Columna derecha - Código e Imagen */}
            <div className="col-span-4 space-y-3">
              {/* Código */}
              <div className="space-y-1">
                <div className="flex items-center">
                  <Label htmlFor="codigo" className="text-sm font-medium">Código</Label>
                </div>
                <Input
                  id="codigo"
                  value={editingProducto ? formData.codigo : (codigoGenerado || "Seleccione línea y sublínea")}
                  readOnly={true}
                  className="h-8 text-sm bg-red-50 border-red-200 text-red-600 font-bold cursor-default"
                  autoComplete="off"
                />
              </div>

              {/* IMAGEN y CHECKBOXES - Solo para productos normales */}
              {!esReceta && (
                <>
              {/* IMAGEN - más compacto */}
              <div className="space-y-1">
                <div className="flex items-center">
                  <Label className="text-sm font-medium">IMAGEN</Label>
                </div>
                <div className="h-32">
                  <ImageUpload
                        value={formData.imgbase64}
                        onChange={(value) => handleInputChange('imgbase64', value)}
                  />
                </div>
              </div>

              {/* Checkboxes - debajo de la imagen */}
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <input
                    id="controla_existencia"
                    type="checkbox"
                    checked={formData.controla_existencia === 1}
                    onChange={(e) => handleInputChange('controla_existencia', e.target.checked ? 1 : 0)}
                    className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
                  />
                  <div className="flex items-center">
                    <Label htmlFor="controla_existencia" className="text-sm font-medium">
                      Controla Existencia
                    </Label>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    id="controla_lotes"
                    type="checkbox"
                    checked={formData.controla_lotes === 1}
                    onChange={(e) => handleInputChange('controla_lotes', e.target.checked ? 1 : 0)}
                    className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
                  />
                  <div className="flex items-center">
                    <Label htmlFor="controla_lotes" className="text-sm font-medium">
                      Controla Lotes
                    </Label>
                  </div>
                </div>
              </div>
                </>
              )}

              {/* CARACTERÍSTICAS DE LA RECETA - Solo para recetas */}
              {esReceta && (
                <div className="relative overflow-hidden rounded-lg border border-orange-200 shadow-md">
                  {/* Imagen de fondo de ingredientes de cocina */}
                  <div 
                    className="absolute inset-0 bg-center bg-no-repeat"
                    style={{
                      backgroundImage: `url('/src/assets/img/fondo-recetas.jpg')`,
                      backgroundSize: '45%'
                    }}
                  />
                  <div className="relative z-10 p-3">
                    {/* Servicio y Menú en una fila */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* Servicio */}
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-700">
                          Servicio <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={formData.id_clase_servicio?.toString() || ""}
                          onValueChange={(value) => handleInputChange('id_clase_servicio', parseInt(value))}
                        >
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue className="text-left" />
                          </SelectTrigger>
                          <SelectContent>
                            {claseServicios.map((servicio: ClaseServicioData) => (
                              <SelectItem key={servicio.id} value={servicio.id.toString()}>
                                {servicio.nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Menú */}
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-700">
                          Menú <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={formData.tipo_menu || ""}
                          onValueChange={(value) => {
                            console.log('🔄 Cambiando tipo_menu a:', value);
                            handleInputChange('tipo_menu', value);
                          }}
                        >
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue className="text-left" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Estandar">Estandar</SelectItem>
                            <SelectItem value="Especial">Especial</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Tiempo de Preparación */}
                    <div className="flex items-end gap-2">
                      <div className="flex-1 space-y-1">
                        <Label className="text-sm font-medium text-gray-700">Tiempo</Label>
                        <ModernTimePicker
                          value={tiempoPreparacion}
                          onChange={(tiempo) => {
                            const tiempoFormateado = formatearTiempo(tiempo);
                            onTiempoPreparacionChange(tiempoFormateado);
                            onUtilidadesProductoChange({
                              ...utilidadesProducto,
                              tiempo_preparacion: tiempoFormateado
                            });
                          }}
                          placeholder="Seleccionar tiempo"
                          className="w-full h-8 text-sm"
                          format="HH:mm:ss"
                          allowSeconds={true}
                        />
                      </div>
                      {esReceta && (
                        <div className="w-32 space-y-1">
                          <Label className="text-sm font-medium text-gray-700">Unidad</Label>
                          <Select
                            value={unidadTiempoPreparacion.toString()}
                            onValueChange={(value) => onUnidadTiempoPreparacionChange(parseInt(value))}
                          >
                            <SelectTrigger className="h-8 text-sm">
                              <SelectValue placeholder={unidadTiempoPreparacion === 0 ? "Unidad" : ""} />
                            </SelectTrigger>
                            <SelectContent>
                              {medidasPrincipales.map((medida) => (
                                <SelectItem key={medida.id} value={medida.id.toString()}>
                                  {medida.abreviatura} - {medida.nombre}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tabs de navegación en la parte inferior - más compacto */}
          <div className="border-t pt-3">
            <Tabs value={activeFormTab} onValueChange={setActiveFormTab} className="w-full">
              <TabsList className={`grid w-full ${esReceta ? 'grid-cols-3' : 'grid-cols-4'} bg-cyan-100/60 p-1 rounded-lg`}>
                {!esReceta && (
                <TabsTrigger
                  value="precio"
                  className="text-xs data-[state=active]:bg-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md transition-all duration-300"
                >
                  Precio y Existencias
                </TabsTrigger>
                )}
                {esReceta ? (
                  <>
                    <TabsTrigger
                      value="ingredientes"
                      className="text-xs data-[state=active]:bg-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md transition-all duration-300"
                    >
                      Ingredientes
                    </TabsTrigger>
                    <TabsTrigger
                      value="preparacion"
                      className="text-xs data-[state=active]:bg-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md transition-all duration-300"
                    >
                      Preparación
                    </TabsTrigger>
                    <TabsTrigger
                      value="unidades-servicio"
                      className="text-xs data-[state=active]:bg-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md transition-all duration-300"
                    >
                      Unidades de Servicio
                    </TabsTrigger>
                  </>
                ) : (
                  <>
                <TabsTrigger
                  value="contable"
                  className="text-xs data-[state=active]:bg-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md transition-all duration-300"
                >
                  Interfaz Contable
                </TabsTrigger>
                <TabsTrigger
                  value="historia"
                  className="text-xs data-[state=active]:bg-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md transition-all duration-300"
                >
                  Historia del Producto
                </TabsTrigger>
                <TabsTrigger
                  value="empaques"
                  className="text-xs data-[state=active]:bg-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md transition-all duration-300"
                >
                  Empaques Asociados
                </TabsTrigger>
                  </>
                )}
              </TabsList>

              <TabsContent value="precio" className="mt-3">
                <div className="grid grid-cols-12 gap-4">
                  {/* Columna izquierda - Costos e Inventario */}
                  <div className="col-span-6 space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <Label htmlFor="ultimo_costo" className="text-sm font-medium">Último Costo</Label>
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                          <Input
                            id="ultimo_costo"
                            type="text"
                            value={formatCurrencyDisplay(ultimoCostoDisplay)}
                            onChange={handleUltimoCostoChange}
                            onFocus={handleUltimoCostoFocus}
                            onBlur={handleUltimoCostoBlur}
                            className="h-8 text-sm pl-8 bg-yellow-25"
                            autoComplete="off"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center">
                          <Label htmlFor="costo_promedio" className="text-sm font-medium">Costo Promedio</Label>
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                          <Input
                            id="costo_promedio"
                            type="text"
                            value={formatCurrencyDisplay(costoPromedioDisplay)}
                            onChange={handleCostoPromedioChange}
                            onFocus={handleCostoPromedioFocus}
                            onBlur={handleCostoPromedioBlur}
                            className="h-8 text-sm pl-8 bg-gray-100 text-gray-400"
                            autoComplete="off"
                            disabled
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <Label htmlFor="existencia_actual" className="text-sm font-medium">Existencia</Label>
                        </div>
                        <Input
                          id="existencia_actual"
                          type="number"
                          value="0"
                          className="h-8 text-sm bg-gray-100 text-gray-400"
                          autoComplete="off"
                          disabled
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center">
                          <Label htmlFor="frecuencia_compra" className="text-sm font-medium">Frecuencia</Label>
                        </div>
                        <Select
                          value={formData.frecuencia || "semanal"}
                          onValueChange={(value) => handleInputChange('frecuencia', value)}
                        >
                          <SelectTrigger className="h-8 text-sm bg-yellow-25">
                            <SelectValue placeholder="Semanal" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="diaria">Diaria</SelectItem>
                            <SelectItem value="semanal">Semanal</SelectItem>
                            <SelectItem value="mensual">Mensual</SelectItem>
                            <SelectItem value="trimestral">Trimestral</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center">
                          <Label htmlFor="precio_publico" className="text-sm font-medium">Precio Público</Label>
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                          <Input
                            id="precio_publico"
                            type="text"
                            value={formatCurrencyDisplay(precioPublicoDisplay)}
                            onChange={handlePrecioPublicoChange}
                            onFocus={handlePrecioPublicoFocus}
                            onBlur={handlePrecioPublicoBlur}
                            className="h-8 text-sm pl-8 bg-gray-100 text-gray-400"
                            autoComplete="off"
                            disabled
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Columna derecha - Grilla de Almacenes */}
                  <div className="col-span-6 space-y-2">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium underline">Almacenes</Label>
                      <div className="h-32 border border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                        <span className="text-gray-500 font-medium">GRILLA PRECIOS</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="contable" className="mt-3">
                <div className="space-y-4">
                  {/* Interfaz Contable */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-5 gap-4">
                      <div className="col-span-3 space-y-1">
                        <div className="flex items-center">
                          <Label className="text-sm font-medium">Interfaz Contable</Label>
                        </div>
                        <Select>
                          <SelectTrigger className="h-8 text-sm bg-yellow-25">
                            <SelectValue placeholder="Seleccionar interfaz contable" />
                          </SelectTrigger>
                          <SelectContent>
                            {interfacesContables.map((interfaz) => (
                              <SelectItem key={interfaz.id} value={interfaz.id.toString()}>
                                {interfaz.nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center">
                          <Label htmlFor="iva" className="text-sm font-medium">% IVA</Label>
                        </div>
                        <Input
                          id="iva"
                          type="number"
                          value=""
                          readOnly
                          className="h-8 text-sm bg-yellow-25 text-gray-400"
                          autoComplete="off"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center">
                          <Label htmlFor="retencion" className="text-sm font-medium">% Retención</Label>
                        </div>
                        <Input
                          id="retencion"
                          type="number"
                          value=""
                          readOnly
                          className="h-8 text-sm bg-yellow-25 text-gray-400"
                          autoComplete="off"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Cuentas / Contabilidad */}
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <h4 className="text-sm font-normal text-gray-400">Cuentas / Contabilidad</h4>
                      <div className="flex-1 h-px bg-gray-300 ml-3"></div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <Label className="text-sm font-medium">Cuenta de Inv. o Compras</Label>
                          </div>
                          <div className="flex gap-2">
                            <Input
                              type="text"
                              value=""
                              readOnly
                              className="h-8 text-sm bg-yellow-25 w-20 text-gray-400"
                              autoComplete="off"
                            />
                            <Input
                              type="text"
                              value=""
                              readOnly
                              className="h-8 text-sm bg-yellow-25 flex-1 text-gray-400"
                              autoComplete="off"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center">
                            <Label className="text-sm font-medium">Cuenta de IVA en Compras</Label>
                          </div>
                          <div className="flex gap-2">
                            <Input
                              type="text"
                              value=""
                              readOnly
                              className="h-8 text-sm bg-yellow-25 w-20 text-gray-400"
                              autoComplete="off"
                            />
                            <Input
                              type="text"
                              value=""
                              readOnly
                              className="h-8 text-sm bg-yellow-25 flex-1 text-gray-400"
                              autoComplete="off"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center">
                            <Label className="text-sm font-medium">Cuenta Retención en Compras</Label>
                          </div>
                          <div className="flex gap-2">
                            <Input
                              type="text"
                              value=""
                              readOnly
                              className="h-8 text-sm bg-yellow-25 w-20 text-gray-400"
                              autoComplete="off"
                            />
                            <Input
                              type="text"
                              value=""
                              readOnly
                              className="h-8 text-sm bg-yellow-25 flex-1 text-gray-400"
                              autoComplete="off"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center">
                            <Label className="text-sm font-medium">Cuenta Costo Ventas o Producción</Label>
                          </div>
                          <div className="flex gap-2">
                            <Input
                              type="text"
                              value=""
                              readOnly
                              className="h-8 text-sm bg-yellow-25 w-20 text-gray-400"
                              autoComplete="off"
                            />
                            <Input
                              type="text"
                              value=""
                              readOnly
                              className="h-8 text-sm bg-yellow-25 flex-1 text-gray-400"
                              autoComplete="off"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <Label className="text-sm font-medium">Cuenta de Ventas o Ingreso</Label>
                          </div>
                          <div className="flex gap-2">
                            <Input
                              type="text"
                              value=""
                              readOnly
                              className="h-8 text-sm bg-yellow-25 w-20 text-gray-400"
                              autoComplete="off"
                            />
                            <Input
                              type="text"
                              value=""
                              readOnly
                              className="h-8 text-sm bg-yellow-25 flex-1 text-gray-400"
                              autoComplete="off"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center">
                            <Label className="text-sm font-medium">Cuenta de IVA en Ventas</Label>
                          </div>
                          <div className="flex gap-2">
                            <Input
                              type="text"
                              value=""
                              readOnly
                              className="h-8 text-sm bg-yellow-25 w-20 text-gray-400"
                              autoComplete="off"
                            />
                            <Input
                              type="text"
                              value=""
                              readOnly
                              className="h-8 text-sm bg-yellow-25 flex-1 text-gray-400"
                              autoComplete="off"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center">
                            <Label className="text-sm font-medium">Cuenta Retención en Ventas</Label>
                          </div>
                          <div className="flex gap-2">
                            <Input
                              type="text"
                              value=""
                              readOnly
                              className="h-8 text-sm bg-yellow-25 w-20 text-gray-400"
                              autoComplete="off"
                            />
                            <Input
                              type="text"
                              value=""
                              readOnly
                              className="h-8 text-sm bg-yellow-25 flex-1 text-gray-400"
                              autoComplete="off"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="historia" className="mt-3">
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <p className="text-gray-500">Historia del Producto</p>
                    <p className="text-sm text-gray-400 mt-2">Contenido de historial del producto</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="empaques" className="mt-3">
                <div className="space-y-4">
                  {/* Formulario para agregar empaques */}
                  <div className="grid grid-cols-12 gap-3 items-end">
                    <div className="col-span-4 space-y-1">
                      <div className="flex items-center">
                        <Label className="text-sm font-medium">Tipo Presentación</Label>
                      </div>
                      <Select
                        value={empaqueForm.tipo}
                        onValueChange={handleEmpaqueTipoChange}
                        disabled={!formData.id_medida || formData.id_medida === 0}
                      >
                        <SelectTrigger className="h-8 text-sm bg-yellow-25">
                          <SelectValue placeholder={
                            !formData.id_medida || formData.id_medida === 0
                              ? "Seleccione una unidad primero"
                              : "Seleccionar presentación"
                          } />
                        </SelectTrigger>
                        <SelectContent>
                          {presentacionesFiltradas.length === 0 ? (
                            <SelectItem value="0" disabled>
                              {!formData.id_medida || formData.id_medida === 0
                                ? "Seleccione una unidad primero"
                                : "No hay presentaciones disponibles"
                              }
                            </SelectItem>
                          ) : (
                            presentacionesFiltradas.map((presentacion: PresentacionMedidaData) => (
                              <SelectItem key={presentacion.id} value={presentacion.nombre}>
                                {presentacion.nombre}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2 space-y-1">
                      <div className="flex items-center">
                        <Label className="text-sm font-medium">Factor</Label>
                      </div>
                      <Input
                        type="text"
                        value={empaqueForm.factor}
                        onChange={(e) => handleEmpaqueFactorChange(e.target.value)}
                        className="h-8 text-sm bg-yellow-25"
                        autoComplete="off"
                        placeholder="Ej: 10"
                      />
                    </div>
                    <div className="col-span-5 space-y-1">
                      <div className="flex items-center">
                        <Label className="text-sm font-medium">Descripción</Label>
                      </div>
                      <Input
                        type="text"
                        value={empaqueForm.descripcion}
                        className="h-8 text-sm bg-yellow-25 text-gray-500"
                        autoComplete="off"
                        readOnly
                        placeholder="Se genera automáticamente"
                        onChange={() => { }} // Forzar re-render
                      />
                    </div>
                    <div className="col-span-1">
                      <Button
                        type="button"
                        onClick={handleAgregarEmpaque}
                        className="h-8 w-8 p-0 bg-cyan-600 hover:bg-cyan-700"
                        disabled={!empaqueForm.tipo || !empaqueForm.factor || !empaqueForm.descripcion}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Tabla de empaques */}
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Label className="text-sm font-medium">Empaques Asociados</Label>
                    </div>
                    <div className="border border-gray-300 rounded-lg overflow-hidden">
                      <div className="bg-cyan-100 px-4 py-2 text-sm font-medium text-gray-700">
                        <div className="grid grid-cols-4 gap-4">
                          <div>Tipo Presentación</div>
                          <div>Factor</div>
                          <div>Descripción</div>
                          <div></div>
                        </div>
                      </div>
                      <div className="bg-white">
                        {empaques.length === 0 ? (
                          <div className="px-4 py-8 text-center text-gray-500 text-sm">
                            No hay empaques asociados. Agregue uno usando el formulario superior.
                          </div>
                        ) : (
                          empaques.map((empaque) => (
                            <div key={empaque.id} className="px-4 py-2 border-b border-gray-200 last:border-b-0">
                              <div className="grid grid-cols-4 gap-4 items-center">
                                <div className="text-sm">{empaque.tipo}</div>
                                <div className="text-sm">{empaque.factor}</div>
                                <div className="text-sm">{empaque.descripcion}</div>
                                <div className="flex justify-end">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                    onClick={() => handleEliminarEmpaque(empaque.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Tabs para recetas */}
              {esReceta && (
                <>
                  <TabsContent value="ingredientes" className="mt-3">
                    <div className="space-y-4">
                      {/* Formulario para agregar ingredientes - Diseño actualizado */}
                      <div className="bg-blue-50 p-2 rounded-lg">
                        <div className="grid grid-cols-12 gap-3 items-end">
                          <div className="col-span-4 space-y-1">
                            <Label className="text-sm font-medium text-gray-700">Nombre del Producto</Label>
                            <Popover open={openProductoSelect} onOpenChange={setOpenProductoSelect}>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  aria-expanded={openProductoSelect}
                                  className="h-8 text-sm bg-yellow-50 border-yellow-200 justify-between w-full"
                                >
                                  {ingredienteForm.id_producto
                                    ? truncateText(productos.find((producto) => producto.id === ingredienteForm.id_producto)?.nombre || "")
                                    : "Seleccionar producto"}
                                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-[600px] p-0">
                                <Command>
                                  <CommandInput />
                                  <CommandList>
                                    <CommandEmpty>No se encontraron productos.</CommandEmpty>
                                    <CommandGroup>
                                      {productos
                                        .filter(producto => producto.estado === 1)
                                        .map((producto) => (
                                        <CommandItem
                                          key={producto.id}
                                          value={producto.nombre}
                                          onSelect={() => {
                                            handleIngredienteChange('id_producto', producto.id);
                                            setOpenProductoSelect(false);
                                          }}
                                        >
                                          {truncateText(producto.nombre, 60)}
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          </div>
                          <div className="col-span-1 space-y-1">
                            <Label className="text-sm font-medium text-gray-700">Cantidad</Label>
                            <Input
                              type="number"
                              value={ingredienteForm.cantidad}
                              onChange={(e) => handleIngredienteChange('cantidad', parseFloat(e.target.value) || 1)}
                              onFocus={(e) => e.target.select()}
                              className={`h-8 text-sm ${ingredienteForm.es_receta ? 'bg-gray-100' : 'bg-white'}`}
                              placeholder="1"
                              min="0"
                              step="0.01"
                              disabled={ingredienteForm.es_receta}
                            />
                          </div>
                          <div className="col-span-2 space-y-1">
                            <Label className="text-sm font-medium text-gray-700">Unidad</Label>
                            <Select
                              value={ingredienteForm.unidad}
                              onValueChange={(value) => handleIngredienteChange('unidad', value)}
                              disabled={ingredienteForm.es_receta}
                            >
                              <SelectTrigger className={`h-8 text-sm ${ingredienteForm.es_receta ? 'bg-gray-100' : 'bg-white'}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {medidasFiltradas.length > 0 ? (
                                  medidasFiltradas.map((medida) => (
                                    <SelectItem key={medida.id} value={medida.abreviatura}>
                                      {medida.abreviatura} - {medida.nombre}
                                    </SelectItem>
                                  ))
                                ) : (
                                  <>
                                    <SelectItem value="kg">Kg</SelectItem>
                                    <SelectItem value="g">g</SelectItem>
                                    <SelectItem value="l">L</SelectItem>
                                    <SelectItem value="ml">ml</SelectItem>
                                    <SelectItem value="unidad">Unidad</SelectItem>
                                    <SelectItem value="lb">Lb</SelectItem>
                                  </>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="col-span-2 space-y-1">
                            <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                              Costo <span className="text-gray-400">?</span>
                            </Label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                              <Input
                                type="text"
                                value={formatCurrencyDisplay(costoInputValue)}
                                onChange={handleCostoInputChange}
                                onFocus={handleCostoInputFocus}
                                onBlur={handleCostoInputBlur}
                                className="h-8 text-sm pl-8 bg-white"
                                placeholder="0.00"
                                autoComplete="off"
                              />
                            </div>
                          </div>
                          <div className="col-span-2 space-y-1">
                            <Label className="text-sm font-medium text-gray-700">Total</Label>
                            <Input
                              type="text"
                              value={ingredienteForm.total > 0 ? `$${ingredienteForm.total.toLocaleString()}` : ''}
                              className="h-8 text-sm bg-white font-medium text-green-600"
                              placeholder="$0"
                              readOnly
                            />
                          </div>
                          <div className="col-span-1 flex items-end">
                            <Button
                              type="button"
                              onClick={handleAgregarIngrediente}
                              className="h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700"
                              disabled={!ingredienteForm.id_producto || !ingredienteForm.cantidad || !ingredienteForm.unidad}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Tabla de ingredientes - Más compacta */}
                      <div className="space-y-1 mt-1">
                        <div className="border border-gray-300 rounded-lg overflow-hidden">
                          <div className="bg-blue-100 px-3 py-2 text-xs font-medium text-gray-700">
                            <div className="grid grid-cols-12 gap-2">
                              <div className="col-span-5">Producto/Receta</div>
                              <div className="col-span-1 text-center">Cantidad</div>
                              <div className="col-span-1 text-center">Unidad</div>
                              <div className="col-span-2">Costo</div>
                              <div className="col-span-2">Total</div>
                              <div className="col-span-1"></div>
                            </div>
                          </div>
                          <div className="bg-white">
                            {ingredientes.length === 0 ? (
                              <div className="px-3 py-6 text-center text-gray-500 text-xs">
                                No Rows To Show
                              </div>
                            ) : (
                              ingredientes.map((ingrediente) => {
                                // Verificar si es una receta (tiene id_clase_servicio > 0)
                                const productoEncontrado = productos.find(p => p.id === ingrediente.id_producto);
                                const esReceta = productoEncontrado?.id_clase_servicio && productoEncontrado.id_clase_servicio > 0;
                                
                                return (
                                <div 
                                  key={ingrediente.id} 
                                  className={`px-3 py-1.5 border-b border-gray-200 last:border-b-0 cursor-pointer transition-colors ${
                                    esReceta 
                                      ? 'bg-blue-50 hover:bg-blue-100 border-l-4 border-l-blue-400' 
                                      : 'hover:bg-gray-50'
                                  }`}
                                  onClick={() => esReceta && onVerIngredientesRecetaFormulario(ingrediente)}
                                  title={esReceta ? "Click para ver ingredientes de esta receta" : ""}
                                >
                                  <div className="grid grid-cols-12 gap-2 items-center">
                                    <div className="col-span-5 text-xs font-medium text-gray-900 truncate flex items-center gap-1">
                                      {ingrediente.nombre_producto}
                                      {esReceta && <span className="text-blue-600 text-[10px]">(Receta)</span>}
                                    </div>
                                    <div className="col-span-1 text-xs text-gray-700 text-center">{ingrediente.cantidad}</div>
                                    <div className="col-span-1 text-xs text-gray-700 text-center">{ingrediente.unidad}</div>
                                    <div className="col-span-2 text-xs text-gray-700">{formatCurrencyLocal(ingrediente.costo_unitario)}</div>
                                    <div className="col-span-2 text-xs font-medium text-green-600">{formatCurrencyLocal(ingrediente.total)}</div>
                                    <div className="col-span-1 flex justify-center">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-5 w-5 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                        onClick={(e) => {
                                          e.stopPropagation(); // Evitar que se abra el modal al hacer click en eliminar
                                          handleEliminarIngrediente(ingrediente.id);
                                        }}
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Resumen - Diseño mejorado */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                        <div className={`grid gap-6 ${calcularTotalesIngredientes(ingredientes).cantidadRecetas > 0 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                          <div className="text-center">
                            <div className="text-xs font-medium text-gray-600 mb-1">Costo Ingredientes</div>
                            <div className="text-lg font-bold text-blue-600">
                              ${totalIngredientes.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500">Solo productos</div>
                          </div>
                          {calcularTotalesIngredientes(ingredientes).cantidadRecetas > 0 && (
                            <div className="text-center">
                              <div className="text-xs font-medium text-gray-600 mb-1">Total Recetas</div>
                              <div className="text-lg font-bold text-indigo-600">
                                ${totalPorciones.toLocaleString()}
                              </div>
                              <div className="text-xs text-gray-500">Suma de ingredientes de recetas</div>
                            </div>
                          )}
                          <div className="text-center">
                            <div className="text-xs font-medium text-gray-600 mb-1">Costo Total</div>
                            <div className="text-lg font-bold text-green-600">
                              ${(totalIngredientes + calcularTotalesIngredientes(ingredientes).totalRecetas).toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500">Productos + Recetas</div>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-blue-200">
                          <div className="flex justify-between items-center text-xs text-gray-600">
                            <span>Total de ingredientes: {ingredientes.length}</span>
                            <span>Costo promedio por ingrediente: ${ingredientes.length > 0 ? (totalIngredientes / ingredientes.length).toFixed(2) : '0.00'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="preparacion" className="mt-3">
                    <div className="space-y-4">
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-green-800 mb-4">Preparación</h3>
                        <div className="space-y-3">
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Nota y/o Preparación</Label>
                            <textarea
                              className="w-full h-32 p-3 text-sm border border-gray-300 rounded-md bg-white resize"
                              placeholder="Escriba las notas o instrucciones de preparación aquí..."
                              value={utilidadesProducto.nota}
                              onChange={(e) => onUtilidadesProductoChange({
                                ...utilidadesProducto,
                                nota: e.target.value
                              })}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="unidades-servicio" className="mt-3">
                    <div className="space-y-4">
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-purple-800 mb-4">Unidades de Servicio</h3>
                        
                        {/* Formulario para agregar unidad de servicio */}
                        <div className="bg-white p-3 rounded-lg border border-purple-200 mb-4">
                          <div className="grid grid-cols-12 gap-3 items-end">
                            <div className="col-span-8 space-y-1">
                              <Label className="text-sm font-medium text-gray-700">Unidad de Servicio</Label>
                              <Select
                                value={nuevaUnidadServicio.id_unidad_servicio.toString()}
                                onValueChange={(value) => {
                                  const unidadSeleccionada = unidadesServicio.find(u => u.id === parseInt(value));
                                  setNuevaUnidadServicio({
                                    id_unidad_servicio: parseInt(value),
                                    no_ppl: unidadSeleccionada?.no_ppl || 1
                                  });
                                }}
                              >
                                <SelectTrigger className="h-8 text-sm bg-yellow-25">
                                  <SelectValue placeholder="Seleccionar unidad de servicio" />
                                </SelectTrigger>
                                <SelectContent>
                                  {unidadesServicio
                                    .filter(unidad => !unidadesServicioAsignadas.find(u => u.id === unidad.id))
                                    .map((unidad) => (
                                    <SelectItem key={unidad.id} value={unidad.id.toString()}>
                                      {unidad.nombre_servicio}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="col-span-2 space-y-1">
                              <Label className="text-sm font-medium text-gray-700">N° PPL</Label>
                              <Input
                                type="number"
                                value={nuevaUnidadServicio.no_ppl}
                                disabled
                                className="h-8 text-sm bg-gray-100 text-gray-600"
                                readOnly
                              />
                            </div>

                            <div className="col-span-2 flex justify-end">
                              <Button
                                type="button"
                                onClick={handleAgregarUnidadServicio}
                                disabled={nuevaUnidadServicio.id_unidad_servicio === 0}
                                className="h-8 px-4 bg-purple-600 hover:bg-purple-700 text-white"
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Agregar
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Lista de unidades asignadas */}
                        <div className="bg-white rounded-lg border border-purple-200">
                          <div className="p-3 border-b border-purple-200 bg-blue-100">
                            <h4 className="text-sm font-medium text-blue-800">Unidades Asignadas</h4>
                          </div>
                          
                          {unidadesServicioAsignadas.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">
                              <Package className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                              <p className="text-sm">No hay unidades de servicio asignadas</p>
                            </div>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="w-full">
                                <thead>
                                  <tr className="bg-blue-100">
                                    <th className="px-4 py-2 text-left text-sm font-medium text-blue-800">Código</th>
                                    <th className="px-4 py-2 text-left text-sm font-medium text-blue-800">Unidad</th>
                                    <th className="px-4 py-2 text-left text-sm font-medium text-blue-800">Municipio</th>
                                    <th className="px-4 py-2 text-center text-sm font-medium text-blue-800">N° PPL</th>
                                    <th className="px-4 py-2 text-center text-sm font-medium text-blue-800">Acción</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {unidadesServicioAsignadas.map((unidad, index) => (
                                    <tr key={unidad.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b border-gray-200`}>
                                      <td className="px-4 py-2 text-sm text-gray-900">{unidad.codigo || unidad.id}</td>
                                      <td className="px-4 py-2 text-sm text-gray-900">{unidad.nombre_servicio}</td>
                                      <td className="px-4 py-2 text-sm text-gray-900">{unidad.gen_sucursales?.municipio?.nombre || 'N/A'}</td>
                                      <td className="px-4 py-2 text-sm text-gray-900 text-center">{unidad.no_ppl}</td>
                                      <td className="px-4 py-2 text-center">
                                        <Button
                                          type="button"
                                          onClick={() => handleEliminarUnidadServicio(unidad.id)}
                                          variant="outline"
                                          size="sm"
                                          className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                          <X className="h-3 w-3" />
                                        </Button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </>
              )}
            </Tabs>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-3">
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
  const { user } = useAuth();

  // Estados
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("active");
  const [activeTab, setActiveTab] = useState("productos");
  const [editingProducto, setEditingProducto] = useState<ProductoData | null>(null);
  const [esReceta, setEsReceta] = useState<boolean>(false);
  const [verMenus, setVerMenus] = useState<boolean>(false); // Filtro para mostrar solo recetas
  const [isFiltering, setIsFiltering] = useState<boolean>(false); // Loading para el filtro
  
  // Estados para modal de ingredientes de receta
  const [showIngredientesModal, setShowIngredientesModal] = useState(false);
  const [recetaSeleccionada, setRecetaSeleccionada] = useState<{id: number, nombre: string} | null>(null);
  const [ingredientesReceta, setIngredientesReceta] = useState<any[]>([]);
  
  // Estados para modal de ingredientes en el formulario
  const [showIngredientesModalFormulario, setShowIngredientesModalFormulario] = useState(false);
  const [recetaSeleccionadaFormulario, setRecetaSeleccionadaFormulario] = useState<{id: number, nombre: string} | null>(null);
  const [ingredientesRecetaFormulario, setIngredientesRecetaFormulario] = useState<any[]>([]);
  
  // Estados para unidades de servicio
  const [unidadesServicio, setUnidadesServicio] = useState<any[]>([]);
  const [unidadesServicioAsignadas, setUnidadesServicioAsignadas] = useState<any[]>([]);
  const [nuevaUnidadServicio, setNuevaUnidadServicio] = useState<{id_unidad_servicio: number; no_ppl: number}>({
    id_unidad_servicio: 0,
    no_ppl: 1
  });

  // Función para formatear valores monetarios
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Funciones para manejar unidades de servicio
  const loadUnidadesServicio = async () => {
    try {
      const { unidadServiciosService } = await import('@/services/unidadServiciosService');
      const data = await unidadServiciosService.listUnidadesServicio();
      const unidadesActivas = data.filter(u => u.activo);
      setUnidadesServicio(unidadesActivas);
      
      // Cargar unidades asignadas si estamos editando un producto
      if (editingProducto && editingProducto.id_unidad_servicio) {
        const idsUnidades = editingProducto.id_unidad_servicio.split(',').map((id: string) => parseInt(id.trim())).filter(id => !isNaN(id));
        const unidadesAsignadas = unidadesActivas.filter(unidad => idsUnidades.includes(unidad.id!));
        setUnidadesServicioAsignadas(unidadesAsignadas);
      } else {
        setUnidadesServicioAsignadas([]);
      }
    } catch (error) {
      console.error('Error cargando unidades de servicio:', error);
    }
  };

  const handleAgregarUnidadServicio = () => {
    if (nuevaUnidadServicio.id_unidad_servicio > 0) {
      const unidad = unidadesServicio.find(u => u.id === nuevaUnidadServicio.id_unidad_servicio);
      if (unidad && !unidadesServicioAsignadas.find(u => u.id === nuevaUnidadServicio.id_unidad_servicio)) {
        const nuevaUnidad = {
          ...unidad,
          no_ppl: nuevaUnidadServicio.no_ppl
        };
        setUnidadesServicioAsignadas([...unidadesServicioAsignadas, nuevaUnidad]);
        setNuevaUnidadServicio({ id_unidad_servicio: 0, no_ppl: 1 });
      }
    }
  };

  const handleEliminarUnidadServicio = (idUnidad: number) => {
    setUnidadesServicioAsignadas(unidadesServicioAsignadas.filter(u => u.id !== idUnidad));
  };
  
  // Estados para utilidades del producto
  const [tiempoPreparacion, setTiempoPreparacion] = useState<string>("00:00:00");
  const [unidadTiempoPreparacion, setUnidadTiempoPreparacion] = useState<number>(0);
  const [utilidadesProducto, setUtilidadesProducto] = useState<UtilidadProducto>({
    id_producto: 0,
    id_indicie_dificultad: 1,
    tasa_perdida: 0.00000,
    tasa_utilidad: 0.00000,
    tiempo_preparacion: "00:00:00",
    nota: "",
    estado: 1
  });

  // Debug: mostrar el valor de esReceta
  React.useEffect(() => {
    console.log('🎯 esReceta actualizado:', esReceta);
  }, [esReceta]);

  // Función para manejar el cambio del switch con timeout
  const handleVerMenusChange = (checked: boolean) => {
    console.log('🔄 Switch cambiado a:', checked);
    setIsFiltering(true);
    
    // Timeout de 2 segundos
    setTimeout(() => {
      setVerMenus(checked);
      setIsFiltering(false);
    }, 2000);
  };

  // Función para obtener las columnas de la tabla según el filtro
  const getTableColumns = () => {
    if (verMenus) {
      // Columnas para recetas
      return [
        { key: 'acciones', label: 'Acciones', className: 'px-2 py-1 text-teal-600 w-20' },
        { key: 'codigo_nombre', label: 'Código / Nombre', className: 'px-4 py-3 w-64' },
        { key: 'tipo_servicio', label: 'Tipo Servicio', className: 'px-4 py-3 w-40' },
        { key: 'linea_sublinea', label: 'Línea / Sublínea', className: 'px-4 py-3 w-32' },
        { key: 'tipo_producto', label: 'Tipo Menu', className: 'px-4 py-3 w-24' },
        { key: 'estado', label: 'Estado', className: 'px-4 py-3 w-24' }
      ];
    } else {
      // Columnas para productos normales
      return [
        { key: 'acciones', label: 'Acciones', className: 'px-2 py-1 text-teal-600 w-20' },
        { key: 'codigo_nombre', label: 'Código / Nombre', className: 'px-4 py-3 w-64' },
        { key: 'referencia_medida', label: 'Referencia / Medida', className: 'px-4 py-3 w-40' },
        { key: 'linea_sublinea', label: 'Línea / Sublínea', className: 'px-4 py-3 w-32' },
        { key: 'costo', label: 'Costo', className: 'px-4 py-3 w-24' },
        { key: 'estado', label: 'Estado', className: 'px-4 py-3 w-24' }
      ];
    }
  };

  // Función para renderizar el contenido de una celda según el tipo
  const renderCellContent = (producto: ProductoData, columnKey: string) => {
    switch (columnKey) {
      case 'acciones':
        return (
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

            {/* Botón para ver ingredientes de recetas */}
            {producto.id_clase_servicio && producto.id_clase_servicio > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleVerIngredientesReceta(producto)}
                      aria-label="Ver ingredientes de receta"
                    >
                      <Eye className="h-5 w-5 text-blue-600 hover:text-blue-800 transition-colors" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Ver ingredientes</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

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
              <>
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

                <Can action="accion-eliminar-producto">
                  <AlertDialog>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Eliminar producto"
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
                        <AlertDialogTitle>¿Estás seguro de eliminar este producto?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción eliminará permanentemente el producto "{producto.nombre}" y todos sus datos relacionados. Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteProducto(producto.id!)}
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
        );
      
      case 'codigo_nombre':
        return (
          <div className="flex flex-col">
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs font-medium text-gray-900">
                {producto.codigo || "-"}
              </span>
              <span className="text-xs text-blue-600 font-medium">
                {producto.inv_categorias?.nombre || "-"}
              </span>
            </div>
            <span className="text-xs text-gray-600 mt-1 text-center">
              {producto.nombre}
            </span>
          </div>
        );
      
      case 'referencia_medida':
        return (
          <div className="flex flex-col">
            <span className="text-xs text-gray-900">
              {producto.referencia || "-"}
            </span>
            <span className="text-xs text-gray-600 mt-1">
              {producto.inv_medidas?.nombre || "-"}
            </span>
          </div>
        );
      
      case 'tipo_servicio':
        return (
          <div className="flex flex-col">
            <span className="text-xs text-gray-900">
              {producto.id_clase_servicio ? claseServicios.find(cs => cs.id === producto.id_clase_servicio)?.nombre || "-" : "-"}
            </span>
            <span className="text-xs text-gray-600 mt-1">
              {producto.tipo_menu || "-"}
            </span>
          </div>
        );
      
      case 'linea_sublinea':
        return (
          <div className="flex flex-col">
            <span className="text-xs text-gray-900">
              {producto.inv_sublineas?.inv_lineas?.nombre || "-"}
            </span>
            <span className="text-xs text-gray-600 mt-1">
              {producto.inv_sublineas?.nombre || "-"}
            </span>
          </div>
        );
      
      case 'costo':
        return (
          <div className="text-right">
            {producto.ultimo_costo ? (
              <span className="text-xs font-medium text-green-600">
                ${producto.ultimo_costo.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
              </span>
            ) : (
              <span className="text-xs text-gray-400">-</span>
            )}
          </div>
        );
      
      case 'tipo_producto':
        return (
          <div className="text-center">
            <span className="text-xs text-gray-900">
              {producto.id_tipo_producto ? tipos.find(t => t.id === producto.id_tipo_producto)?.nombre || "-" : "-"}
            </span>
          </div>
        );
      
      case 'estado':
        return (
          <div className="flex justify-center">
            <Badge variant={producto.estado === 1 ? "default" : "secondary"} className="text-xs">
              {producto.estado === 1 ? "Activo" : "Inactivo"}
            </Badge>
          </div>
        );
      
      default:
        return <span>-</span>;
    }
  };

  // Queries - consulta real a la base de datos según el filtro
  const { data: productos = [], isLoading, refetch } = useQuery({
    queryKey: ["productos", verMenus],
    queryFn: () => productosService.listProductos(verMenus), // Consulta real según el filtro
    staleTime: 0, // Deshabilitar cache para consultas en tiempo real
    refetchOnWindowFocus: false, // Evitar refetch automático
  });

  // Query separada para ingredientes (siempre todos los productos activos)
  const { data: productosParaIngredientes = [] } = useQuery({
    queryKey: ["productos-ingredientes"],
    queryFn: () => productosService.listProductos(false), // Siempre false para ingredientes
    staleTime: 0,
    refetchOnWindowFocus: false,
  });


  const { data: medidas = [] } = useQuery({
    queryKey: ["medidas"],
    queryFn: medidasService.listMedidas,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const { data: medidasPrincipales = [] } = useQuery({
    queryKey: ["medidas-principales"],
    queryFn: productosService.listMedidasPrincipales,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });


  const { data: categorias = [] } = useQuery({
    queryKey: ["categorias"],
    queryFn: productosService.listCategorias,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const { data: sublineas = [] } = useQuery({
    queryKey: ["sublineas"],
    queryFn: sublineasService.listSublineas,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const { data: lineas = [] } = useQuery({
    queryKey: ["lineas"],
    queryFn: lineasService.listLineas,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const { data: tipos = [] } = useQuery({
    queryKey: ["tipos"],
    queryFn: tiposService.listTipos,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const { data: claseServicios = [] } = useQuery({
    queryKey: ["claseServicios"],
    queryFn: claseServiciosService.listClaseServicios,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  // Determinar si es receta basándose en la categoría del producto en edición
  React.useEffect(() => {
    if (editingProducto && categorias.length > 0) {
      const categoriaSeleccionada = categorias.find(cat => cat.id === editingProducto.id_categoria);
      setEsReceta(categoriaSeleccionada?.isreceta === 1);
    } else {
      setEsReceta(false);
    }
  }, [editingProducto, categorias]);

  // Escuchar cambios de categoría desde el formulario
  React.useEffect(() => {
    const handleCategoriaChange = (event: CustomEvent) => {
      console.log('📡 Evento recibido:', event.detail);
      setEsReceta(event.detail.esReceta);
    };

    window.addEventListener('categoriaChanged', handleCategoriaChange as EventListener);
    
    return () => {
      window.removeEventListener('categoriaChanged', handleCategoriaChange as EventListener);
    };
  }, []);

  const { data: interfacesContables = [] } = useQuery({
    queryKey: ["interfacesContables"],
    queryFn: interfazContableService.listInterfacesContables,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const { data: presentacionesMedidas = [] } = useQuery({
    queryKey: ["presentacionesMedidas"],
    queryFn: presentacionMedidasService.listPresentacionesMedidas,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  // Log cuando los datos cambien

  // Refetch de todos los selects cuando se abre el formulario
  React.useEffect(() => {
    if (activeTab === "formulario") {
      console.log("🔄 Refetching todos los selects del formulario...");
      queryClient.invalidateQueries({ queryKey: ["medidas"] });
      queryClient.invalidateQueries({ queryKey: ["medidas-principales"] });
      queryClient.invalidateQueries({ queryKey: ["categorias"] });
      loadUnidadesServicio();
      queryClient.invalidateQueries({ queryKey: ["sublineas"] });
      queryClient.invalidateQueries({ queryKey: ["lineas"] });
      queryClient.invalidateQueries({ queryKey: ["tipos"] });
      queryClient.invalidateQueries({ queryKey: ["claseServicios"] });
      queryClient.invalidateQueries({ queryKey: ["interfacesContables"] });
      queryClient.invalidateQueries({ queryKey: ["presentacionesMedidas"] });
    }
  }, [activeTab, queryClient]);

  // Mutations
  const createProductoMutation = useMutation({
    mutationFn: async (data: ProductoForm & { tiempoPreparacion?: string; utilidadesProducto?: UtilidadProducto }) => {
      startLoading();
      
      const productoData = {
        // No incluir id para que sea autoincrementable
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
        tipo_menu: data.tipo_menu || "",
        no_ciclo: data.no_ciclo || undefined,
        id_unidad_servicio: data.id_unidad_servicio || undefined,
        ultimo_costo: data.ultimo_costo || undefined,
        id_proveedor: data.id_proveedor || undefined,
        frecuencia: esReceta ? null : (data.frecuencia || "semanal"),
        controla_existencia: data.controla_existencia || undefined,
        controla_lotes: data.controla_lotes || undefined,
        imgbase64: data.imgbase64 || undefined,
        id_usuario: user?.id,
        fecsys: new Date().toISOString(),
        estado: 1
      } as Omit<ProductoData, 'id'>;

      // Incluir ingredientes y empaques si existen (excluir campos de utilidades)
      const { tiempoPreparacion: _, utilidadesProducto: __, ...dataWithoutUtilidades } = data as any;
      const dataWithEmpaques = {
        ...productoData,
        empaques: dataWithoutUtilidades.empaques || [],
        ingredientes: dataWithoutUtilidades.ingredientes || []
      };

      // Debug: mostrar datos que se van a enviar
      console.log('📦 Datos de creación:', {
        id_usuario: dataWithEmpaques.id_usuario,
        frecuencia: dataWithEmpaques.frecuencia,
        esReceta: esReceta,
        ingredientes_count: (data as any).ingredientes?.length || 0
      });

      const producto = await productosService.createProducto(dataWithEmpaques);
      
      // Guardar utilidades si es una receta
      if (esReceta && producto.id && data.tiempoPreparacion && data.utilidadesProducto) {
        await productosService.saveOrUpdateProductoUtilidades(producto.id, {
          id_producto: producto.id,
          id_indicie_dificultad: 1,
          tasa_perdida: 0.00000,
          tasa_utilidad: 0.00000,
          tiempo_preparacion: data.tiempoPreparacion,
          nota: data.utilidadesProducto.nota,
          estado: 1
        });
      }
      
      return producto;
    },
    onSuccess: async (producto) => {
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
    mutationFn: async ({ id, data, tiempoPreparacion, utilidadesProducto }: { 
      id: number; 
      data: Partial<ProductoData>; 
      tiempoPreparacion?: string; 
      utilidadesProducto?: UtilidadProducto 
    }) => {
      startLoading();
      
      // Incluir ingredientes y empaques si existen (excluir campos de utilidades)
      const { tiempoPreparacion: _, utilidadesProducto: __, ...dataWithoutUtilidades } = data as any;
      const dataWithEmpaques = {
        ...dataWithoutUtilidades,
        empaques: dataWithoutUtilidades.empaques || [],
        ingredientes: dataWithoutUtilidades.ingredientes || [],
        id_unidad_servicio: data.id_unidad_servicio || undefined
      };
      const producto = await productosService.updateProducto(id, dataWithEmpaques);
      
      // Actualizar utilidades si es una receta
      if (esReceta && id && tiempoPreparacion && utilidadesProducto) {
        await productosService.saveOrUpdateProductoUtilidades(id, {
          id_producto: id,
          id_indicie_dificultad: 1,
          tasa_perdida: 0.00000,
          tasa_utilidad: 0.00000,
          tiempo_preparacion: tiempoPreparacion || "00:00:00",
          nota: utilidadesProducto?.nota || "",
          estado: 1
        });
      }
      
      return producto;
    },
    onSuccess: async (producto, variables) => {
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

  const deleteProductoMutation = useMutation({
    mutationFn: productosService.deleteProductoPermanent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      toast({
        title: 'Éxito',
        description: 'Producto eliminado permanentemente',
      });
    },
    onError: (error: any) => {
      console.error('Error al eliminar producto:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo eliminar el producto',
        variant: 'destructive',
      });
    },
  });

  // Filtros
  const productosFiltrados = useMemo(() => {
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
    
    // Ordenar por ID en orden descendente (último registro primero)
    return filtered.sort((a, b) => b.id - a.id);
  }, [productos, searchTerm, statusFilter]);

  // Handlers
  const handleEditarProducto = (producto: ProductoData) => {
    setEditingProducto(producto);
    setActiveTab("formulario");
  };

  // Función para abrir modal de ingredientes de receta
  const handleVerIngredientesReceta = async (producto: any) => {
    try {
      console.log('🍳 Abriendo modal de ingredientes para:', producto.nombre);
      setRecetaSeleccionada({ id: producto.id, nombre: producto.nombre });
      
      // Obtener ingredientes de la receta
      const ingredientes = await productosService.getProductoIngredientes(producto.id);
      console.log('📋 Ingredientes obtenidos:', ingredientes);
      
      // Obtener todos los productos para poder mostrar los nombres correctamente
      const todosLosProductos = await productosService.listProductos(false); // false = todos los productos
      console.log('📋 Todos los productos disponibles:', todosLosProductos.length);
      
      // Agregar información del producto a cada ingrediente
      const ingredientesConInfo = ingredientes.map(ingrediente => {
        const productoIngrediente = todosLosProductos.find(p => p.id === ingrediente.id_producto);
        return {
          ...ingrediente,
          producto_nombre: productoIngrediente?.nombre || `Producto no encontrado (ID: ${ingrediente.id_producto})`,
          producto_info: productoIngrediente
        };
      });
      
      console.log('📋 Ingredientes con información:', ingredientesConInfo);
      setIngredientesReceta(ingredientesConInfo);
      setShowIngredientesModal(true);
    } catch (error) {
      console.error('❌ Error al obtener ingredientes:', error);
      toast({
        title: "Error",
        description: "Error al cargar los ingredientes de la receta",
        variant: "destructive"
      });
    }
  };

  // Función para abrir modal de ingredientes de receta desde el formulario
  const handleVerIngredientesRecetaFormulario = async (ingrediente: any) => {
    try {
      console.log('🍳 Abriendo modal de ingredientes desde formulario para:', ingrediente.nombre_producto);
      
      // Buscar el producto en la lista de productos para obtener su información completa
      const productoIngrediente = productos.find(p => p.id === ingrediente.id_producto);
      
      if (!productoIngrediente) {
        toast({
          title: "Error",
          description: "No se pudo encontrar la información del producto",
          variant: "destructive"
        });
        return;
      }
      
      setRecetaSeleccionadaFormulario({ id: productoIngrediente.id, nombre: productoIngrediente.nombre });
      
      // Obtener ingredientes de la receta
      const ingredientes = await productosService.getProductoIngredientes(productoIngrediente.id);
      console.log('📋 Ingredientes obtenidos desde formulario:', ingredientes);
      
      // Obtener todos los productos para poder mostrar los nombres correctamente
      const todosLosProductos = await productosService.listProductos(false); // false = todos los productos
      
      // Agregar información del producto a cada ingrediente
      const ingredientesConInfo = ingredientes.map(ingrediente => {
        const productoIngrediente = todosLosProductos.find(p => p.id === ingrediente.id_producto);
        return {
          ...ingrediente,
          producto_nombre: productoIngrediente?.nombre || `Producto no encontrado (ID: ${ingrediente.id_producto})`,
          producto_info: productoIngrediente
        };
      });
      
      console.log('📋 Ingredientes con información desde formulario:', ingredientesConInfo);
      setIngredientesRecetaFormulario(ingredientesConInfo);
      setShowIngredientesModalFormulario(true);
    } catch (error) {
      console.error('❌ Error al obtener ingredientes desde formulario:', error);
      toast({
        title: "Error",
        description: "Error al cargar los ingredientes de la receta",
        variant: "destructive"
      });
    }
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

  const handleDeleteProducto = (id: number) => {
    deleteProductoMutation.mutate(id);
  };

  return (
    <div className="p-4 max-w-full mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-extrabold text-cyan-800 flex items-center gap-2 mb-2">
          <Package className="w-8 h-8 text-cyan-600" />
          Gestión de Productos/Recetas
        </h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-cyan-100/60 p-1 rounded-lg">
          <TabsTrigger
            value="productos"
            className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md transition-all duration-300"
          >
            <Package className="w-4 h-4 mr-2" />
            Productos/Recetas
          </TabsTrigger>
          <TabsTrigger
            value="formulario"
            onClick={handleNuevoProducto}
            className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            {editingProducto ? (esReceta ? 'Editar Receta' : 'Editar Producto') : (esReceta ? 'Nueva Receta' : 'Nuevo Producto')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="productos" className="mt-6">
          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 border-b border-cyan-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-cyan-600" />
                  <span className="text-lg font-semibold text-gray-700">PRODUCTOS/RECETAS</span>
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
                <div className="flex items-center gap-2 min-w-[140px]">
                  <Label htmlFor="ver-menus" className="text-sm font-medium text-cyan-600">
                    Ver Menús ?
                  </Label>
                  <Switch
                    id="ver-menus"
                    checked={verMenus}
                    onCheckedChange={handleVerMenusChange}
                    className="data-[state=checked]:bg-cyan-600 hover:bg-cyan-100 hover:shadow-md transition-all duration-200"
                  />
                </div>
              </div>

              {/* Tabla */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader className="bg-cyan-50">
                    <TableRow className="text-left font-semibold text-gray-700">
                      {getTableColumns().map((column) => (
                        <TableHead key={column.key} className={column.className}>
                          {column.label}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading || isFiltering ? (
                      <TableRow>
                        <TableCell colSpan={getTableColumns().length} className="h-24 text-center">
                          <div className="flex items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin mr-2" />
                            {isFiltering ? 'Filtrando productos...' : 'Cargando productos...'}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : productosFiltrados.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={getTableColumns().length} className="h-24 text-center">
                          No hay productos disponibles.
                        </TableCell>
                      </TableRow>
                    ) : (
                      productosFiltrados.map((producto: ProductoData) => (
                        <TableRow 
                          key={producto.id} 
                          className={`text-xs ${
                            producto.id_clase_servicio && producto.id_clase_servicio > 0 
                              ? 'bg-blue-50 hover:bg-blue-100 border-l-4 border-l-blue-400' 
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          {getTableColumns().map((column) => (
                            <TableCell key={column.key} className={column.className}>
                              {renderCellContent(producto, column.key)}
                          </TableCell>
                          ))}
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
            sublineas={sublineas as SublineaDataFull[]}
            lineas={lineas}
            tipos={tipos}
            interfacesContables={interfacesContables}
            presentacionesMedidas={presentacionesMedidas}
            productos={productosParaIngredientes}
            claseServicios={claseServicios}
            esReceta={esReceta}
            user={user}
            tiempoPreparacion={tiempoPreparacion}
            utilidadesProducto={utilidadesProducto}
            unidadTiempoPreparacion={unidadTiempoPreparacion}
            medidasPrincipales={medidasPrincipales as any[]}
            onTiempoPreparacionChange={setTiempoPreparacion}
            onUtilidadesProductoChange={setUtilidadesProducto}
            onUnidadTiempoPreparacionChange={setUnidadTiempoPreparacion}
            showIngredientesModalFormulario={showIngredientesModalFormulario}
            setShowIngredientesModalFormulario={setShowIngredientesModalFormulario}
            recetaSeleccionadaFormulario={recetaSeleccionadaFormulario}
            setRecetaSeleccionadaFormulario={setRecetaSeleccionadaFormulario}
            ingredientesRecetaFormulario={ingredientesRecetaFormulario}
            setIngredientesRecetaFormulario={setIngredientesRecetaFormulario}
            onVerIngredientesRecetaFormulario={handleVerIngredientesRecetaFormulario}
            unidadesServicio={unidadesServicio}
            unidadesServicioAsignadas={unidadesServicioAsignadas}
            nuevaUnidadServicio={nuevaUnidadServicio}
            setNuevaUnidadServicio={setNuevaUnidadServicio}
            handleAgregarUnidadServicio={handleAgregarUnidadServicio}
            handleEliminarUnidadServicio={handleEliminarUnidadServicio}
            onSubmit={(data) => {
              if (editingProducto) {
                // Incluir IDs de unidades de servicio al actualizar
                const dataWithUnidades = {
                  ...data,
                  id_unidad_servicio: unidadesServicioAsignadas.map(u => u.id).join(',') || undefined
                };
                updateProductoMutation.mutate({ 
                  id: editingProducto.id!, 
                  data: dataWithUnidades,
                  tiempoPreparacion: tiempoPreparacion,
                  utilidadesProducto: utilidadesProducto
                });
              } else {
                // Para crear, no incluir el id
                const { id, ...createData } = data as any;
                // Incluir IDs de unidades de servicio al crear
                const createDataWithUnidades = {
                  ...createData,
                  id_unidad_servicio: unidadesServicioAsignadas.map(u => u.id).join(',') || undefined
                };
                createProductoMutation.mutate({
                  ...createDataWithUnidades,
                  tiempoPreparacion: tiempoPreparacion,
                  utilidadesProducto: utilidadesProducto
                });
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

      {/* Modal para mostrar ingredientes de receta */}
      <Dialog open={showIngredientesModal} onOpenChange={setShowIngredientesModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              <span>Ingredientes de la Receta:</span>
              <span className="font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
                {recetaSeleccionada?.nombre}
              </span>
            </DialogTitle>
            <DialogDescription>
              Lista detallada de todos los ingredientes que componen esta receta
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            {ingredientesReceta.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Esta receta no tiene ingredientes configurados</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Resumen de costos */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-blue-900">Resumen de Costos</h3>
                        <p className="text-sm text-blue-700">
                          Total de ingredientes: {ingredientesReceta.length}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-900">
                          {formatCurrency(ingredientesReceta.reduce((total: number, ingrediente: any) => 
                            total + (ingrediente.cantidad * (ingrediente.costo || 0)), 0
                          ))}
                        </p>
                        <p className="text-xs text-blue-600">Costo total</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Tabla de ingredientes compacta */}
                <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-3 border-b border-gray-200">
                    <div className="grid grid-cols-12 gap-3 text-xs font-semibold text-blue-900">
                      <div className="col-span-5">Ingrediente</div>
                      <div className="col-span-1 text-center">Cant.</div>
                      <div className="col-span-1 text-center">Unidad</div>
                      <div className="col-span-2 text-right">Costo Unit.</div>
                      <div className="col-span-3 text-right">Costo Total</div>
                    </div>
                  </div>
                  
                  {/* Body */}
                  <div className="divide-y divide-gray-100">
                    {ingredientesReceta.map((ingrediente: any, index: number) => (
                      <div key={index} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                        <div className="grid grid-cols-12 gap-3 items-center">
                          <div className="col-span-5">
                            <div className="font-medium text-gray-900 text-sm truncate">
                              {ingrediente.producto_nombre || `Producto no encontrado (ID: ${ingrediente.id_producto})`}
                            </div>
                          </div>
                          <div className="col-span-1 text-center">
                            <span className="inline-flex items-center justify-center w-8 h-6 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                              {ingrediente.cantidad}
                            </span>
                          </div>
                          <div className="col-span-1 text-center">
                            <span className="text-xs text-gray-600 font-medium">
                              {medidas.find(m => m.id === ingrediente.id_medida)?.abreviatura || 'N/A'}
                            </span>
                          </div>
                          <div className="col-span-2 text-right">
                            <span className="text-xs text-gray-700">
                              {formatCurrency(ingrediente.costo || 0)}
                            </span>
                          </div>
                          <div className="col-span-3 text-right">
                            <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-100 text-green-800 text-xs font-semibold">
                              {formatCurrency(ingrediente.cantidad * (ingrediente.costo || 0))}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para mostrar ingredientes de receta desde el formulario */}
      <Dialog open={showIngredientesModalFormulario} onOpenChange={setShowIngredientesModalFormulario}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              <span>Ingredientes de la Receta:</span>
              <span className="font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
                {recetaSeleccionadaFormulario?.nombre}
              </span>
            </DialogTitle>
            <DialogDescription>
              Lista detallada de todos los ingredientes que componen esta receta
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            {ingredientesRecetaFormulario.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Esta receta no tiene ingredientes configurados</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Resumen de costos */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-blue-900">Resumen de Costos</h3>
                        <p className="text-sm text-blue-700">
                          Total de ingredientes: {ingredientesRecetaFormulario.length}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-900">
                          {formatCurrency(ingredientesRecetaFormulario.reduce((total: number, ingrediente: any) => 
                            total + (ingrediente.cantidad * (ingrediente.costo || 0)), 0
                          ))}
                        </p>
                        <p className="text-xs text-blue-600">Costo total</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Tabla de ingredientes compacta */}
                <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-3 border-b border-gray-200">
                    <div className="grid grid-cols-12 gap-3 text-xs font-semibold text-blue-900">
                      <div className="col-span-5">Ingrediente</div>
                      <div className="col-span-1 text-center">Cant.</div>
                      <div className="col-span-1 text-center">Unidad</div>
                      <div className="col-span-2 text-right">Costo Unit.</div>
                      <div className="col-span-3 text-right">Costo Total</div>
                    </div>
                  </div>
                  
                  {/* Body */}
                  <div className="divide-y divide-gray-100">
                    {ingredientesRecetaFormulario.map((ingrediente: any, index: number) => (
                      <div key={index} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                        <div className="grid grid-cols-12 gap-3 items-center">
                          <div className="col-span-5">
                            <div className="font-medium text-gray-900 text-sm truncate">
                              {ingrediente.producto_nombre || `Producto no encontrado (ID: ${ingrediente.id_producto})`}
                            </div>
                          </div>
                          <div className="col-span-1 text-center">
                            <span className="inline-flex items-center justify-center w-8 h-6 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                              {ingrediente.cantidad}
                            </span>
                          </div>
                          <div className="col-span-1 text-center">
                            <span className="text-xs text-gray-600 font-medium">
                              {medidas.find(m => m.id === ingrediente.id_medida)?.abreviatura || 'N/A'}
                            </span>
                          </div>
                          <div className="col-span-2 text-right">
                            <span className="text-xs text-gray-700">
                              {formatCurrency(ingrediente.costo || 0)}
                            </span>
                          </div>
                          <div className="col-span-3 text-right">
                            <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-100 text-green-800 text-xs font-semibold">
                              {formatCurrency(ingrediente.cantidad * (ingrediente.costo || 0))}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductosPage;
