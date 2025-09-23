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
  CheckCircle,
  Trash2
} from 'lucide-react';
import { productosService, ProductoData, ProductoForm, CategoriaData } from '@/services/productosService';
import { MedidaData, medidasService } from '@/services/medidasService';
import { SublineaData as SublineaDataFull } from '@/services/sublineasService';
import { lineasService, LineaData } from '@/services/lineasService';
import { tiposService, TipoData } from '@/services/tiposService';
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
      className={`w-full h-full border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer transition-colors ${
        isDragOver 
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
  lineas,
  tipos,
  interfacesContables,
  presentacionesMedidas,
  onSubmit, 
  isLoading, 
  onCancel
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
    tipo_menu: producto?.tipo_menu || 0,
    no_ciclo: producto?.no_ciclo || 0,
    id_tipo_zona: producto?.id_tipo_zona || undefined,
    ultimo_costo: producto?.ultimo_costo || 0,
    id_proveedor: producto?.id_proveedor || undefined,
    frecuencia: producto?.frecuencia || 0,
    controla_existencia: producto?.controla_existencia || 0,
    controla_lotes: producto?.controla_lotes || 0,
    imgruta: producto?.imgruta || "",
  });

  // Estados para manejar las dependencias
  const [lineasFiltradas, setLineasFiltradas] = useState<LineaData[]>([]);
  const [sublineasFiltradas, setSublineasFiltradas] = useState<SublineaDataFull[]>([]);

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
      id_tipo_producto: producto?.id_tipo_producto || 0,
      id_categoria: producto?.id_categoria || 0,
      id_linea: 0, // Campo temporal para manejar la línea seleccionada
      id_sublineas: producto?.id_sublineas || 0,
      id_interfaz_contable: producto?.id_interfaz_contable || undefined,
      id_marca: producto?.id_marca || undefined,
      id_color: producto?.id_color || undefined,
      referencia: producto?.referencia || "",
      id_clase_servicio: producto?.id_clase_servicio || undefined,
      id_tipo_zona: producto?.id_tipo_zona || undefined,
      ultimo_costo: producto?.ultimo_costo || 0,
      id_proveedor: producto?.id_proveedor || undefined,
      frecuencia: producto?.frecuencia || 0,
      controla_existencia: producto?.controla_existencia || 0,
      controla_lotes: producto?.controla_lotes || 0,
      imgruta: producto?.imgruta || "",
    });
  }, [producto]);

  // Manejar edición de producto específicamente
  React.useEffect(() => {
    if (editingProducto) {
      // Obtener la línea de la sublínea
      const idLinea = editingProducto.inv_sublineas?.id_linea || 0;
      
      setFormData({
        id: editingProducto.id || 0,
        codigo: editingProducto.codigo || "",
        nombre: editingProducto.nombre || "",
        id_medida: editingProducto.id_medida || 0,
        id_tipo_producto: editingProducto.id_tipo_producto || 0,
        id_categoria: editingProducto.id_categoria || 0,
        id_linea: idLinea, // Usar la línea de la sublínea
        id_sublineas: editingProducto.id_sublineas || 0,
        id_interfaz_contable: editingProducto.id_interfaz_contable || undefined,
        id_marca: editingProducto.id_marca || undefined,
        id_color: editingProducto.id_color || undefined,
        id_clase_servicio: editingProducto.id_clase_servicio || undefined,
        id_tipo_zona: editingProducto.id_tipo_zona || undefined,
        id_proveedor: editingProducto.id_proveedor || undefined,
        referencia: editingProducto.referencia || "",
        ultimo_costo: editingProducto.ultimo_costo || 0,
        frecuencia: editingProducto.frecuencia || 0,
        controla_existencia: editingProducto.controla_existencia || 0,
        controla_lotes: editingProducto.controla_lotes || 0,
        imgruta: editingProducto.imgruta || "",
      });

      // Filtrar líneas inmediatamente para la categoría del producto
      if (editingProducto.id_categoria && editingProducto.id_categoria > 0) {
        const lineasDeCategoria = lineas.filter(linea => linea.id_categoria === editingProducto.id_categoria);
        setLineasFiltradas(lineasDeCategoria);
        console.log("🔍 Líneas filtradas para edición:", lineasDeCategoria.length, lineasDeCategoria.map(l => ({ id: l.id, nombre: l.nombre })));
      }

      // Filtrar sublíneas inmediatamente para la línea del producto
      if (idLinea && idLinea > 0) {
        const sublineasDeLinea = sublineas.filter(sub => sub.id_linea === idLinea);
        setSublineasFiltradas(sublineasDeLinea);
        console.log("🔍 Sublíneas filtradas para edición:", sublineasDeLinea.length, sublineasDeLinea.map(s => ({ id: s.id, nombre: s.nombre })));
        console.log("🔍 ID de sublínea del producto:", editingProducto.id_sublineas);
      }
    }
  }, [editingProducto, lineas, sublineas]);

  // Filtrar líneas cuando cambie la categoría (solo si no estamos editando)
  React.useEffect(() => {
    if (!editingProducto && formData.id_categoria && formData.id_categoria > 0) {
      const lineasDeCategoria = lineas.filter(linea => linea.id_categoria === formData.id_categoria);
      setLineasFiltradas(lineasDeCategoria);
      
      // Resetear línea y sublínea cuando cambie la categoría
      setFormData(prev => ({
        ...prev,
        id_linea: 0,
        id_sublineas: 0
      }));
    } else if (!editingProducto) {
      setLineasFiltradas([]);
    }
  }, [formData.id_categoria, lineas, editingProducto]);

  // Filtrar sublíneas cuando cambie la línea (solo si no estamos editando)
  React.useEffect(() => {
    if (!editingProducto) {
      console.log("🔄 Filtrando sublíneas para línea:", formData.id_linea, "Total sublíneas:", sublineas.length);
      if (formData.id_linea && formData.id_linea > 0) {
        const sublineasDeLinea = sublineas.filter(sub => sub.id_linea === formData.id_linea);
        console.log("📋 Sublíneas encontradas:", sublineasDeLinea.length, sublineasDeLinea.map(s => ({ id: s.id, nombre: s.nombre, id_linea: s.id_linea })));
        setSublineasFiltradas(sublineasDeLinea);
        
        // Resetear sublínea cuando cambie la línea
        setFormData(prev => ({
          ...prev,
          id_sublineas: 0
        }));
      } else {
        setSublineasFiltradas([]);
      }
    }
  }, [formData.id_linea, sublineas, editingProducto]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convertir empaques al formato esperado por el servicio
    const empaquesData = empaques.map(empaque => ({
      id_presentacion: presentacionesMedidas.find(p => p.nombre === empaque.tipo)?.id || 0,
      factor: parseFloat(empaque.factor) || 0,
      descripcion: empaque.descripcion
    }));

    // Filtrar campos que no existen en la tabla de productos
    const { id_linea, ...productoData } = formData;

    // Incluir empaques en los datos del producto
    const dataWithEmpaques = {
      ...productoData,
      empaques: empaquesData
    };

    onSubmit(dataWithEmpaques);
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

      // Si cambia la categoría, resetear línea y sublínea
      if (field === 'id_categoria') {
        newData.id_linea = undefined;
        newData.id_sublineas = 0;
      }

      // Si cambia la línea, resetear sublínea
      if (field === 'id_linea') {
        newData.id_sublineas = 0;
      }

      return newData;
    });
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
    console.log("🔧 generateDescripcion llamado:", { tipo, factor, id_medida: formData.id_medida });
    console.log("🔧 Medidas disponibles:", medidas);
    
    if (tipo && factor && formData.id_medida && formData.id_medida > 0) {
      const medida = medidas.find(m => m.id === formData.id_medida);
      console.log("🔧 Medida encontrada:", medida);
      
      if (medida && medida.abreviatura) {
        const descripcion = `${tipo} X ${factor}${medida.abreviatura}`;
        console.log("🔧 Descripción generada:", descripcion);
        setEmpaqueForm(prev => {
          console.log("🔧 Estado anterior:", prev);
          console.log("🔧 Actualizando empaqueForm con descripción:", descripcion);
          const nuevoEstado = {
            ...prev,
            descripcion
          };
          console.log("🔧 Nuevo estado que se va a establecer:", nuevoEstado);
          return nuevoEstado;
        });
      } else {
        console.log("❌ No se encontró abreviatura:", medida);
      }
    } else {
      console.log("❌ Faltan datos:", { tipo, factor, id_medida: formData.id_medida });
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

  // Log para debuggear empaqueForm
  React.useEffect(() => {
    console.log("📝 empaqueForm actualizado:", empaqueForm);
  }, [empaqueForm]);

  // Filtrar presentaciones por unidad seleccionada
  const presentacionesFiltradas = useMemo(() => {
    if (!formData.id_medida || formData.id_medida === 0) {
      return [];
    }
    return presentacionesMedidas.filter(presentacion => 
      presentacion.id_medida === formData.id_medida
    );
  }, [presentacionesMedidas, formData.id_medida]);

  // Limpiar formulario de empaques cuando cambie la unidad
  React.useEffect(() => {
    console.log("🧹 Limpiando empaqueForm porque cambió id_medida:", formData.id_medida);
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
          {editingProducto ? 'Editar Producto' : 'Nuevo Producto'}
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
                onChange={(e) => handleInputChange('nombre', e.target.value)}
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
                        {tipos.map((tipo) => (
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

                {/* Tercera fila de características */}
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
                            {medida.nombre}
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
                  value={editingProducto ? formData.codigo : (nextCodigo || "Cargando...")}
                  readOnly={true}
                  className="h-8 text-sm bg-red-50 border-red-200 text-red-600 font-bold cursor-default"
                autoComplete="off"
              />
            </div>

              {/* IMAGEN - más compacto */}
              <div className="space-y-1">
                <div className="flex items-center">
                  <Label className="text-sm font-medium">IMAGEN</Label>
                </div>
                <div className="h-32">
                  <ImageUpload
                    value={formData.imgruta}
                    onChange={(value) => handleInputChange('imgruta', value)}
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
            </div>
          </div>

          {/* Tabs de navegación en la parte inferior - más compacto */}
          <div className="border-t pt-3">
            <Tabs defaultValue="precio" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-cyan-100/60 p-1 rounded-lg">
                <TabsTrigger 
                  value="precio" 
                  className="text-xs data-[state=active]:bg-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md transition-all duration-300"
                >
                  Precio y Existencias
                </TabsTrigger>
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
              </TabsList>
              
              <TabsContent value="precio" className="mt-3">
                <div className="grid grid-cols-12 gap-4">
                  {/* Columna izquierda - Costos e Inventario */}
            <div className="col-span-3 space-y-2">
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
                          className="h-8 text-sm pl-8 bg-yellow-25"
                          autoComplete="off"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <Label htmlFor="existencia_actual" className="text-sm font-medium">Existencia Actual</Label>
                      </div>
                      <Input
                        id="existencia_actual"
                type="number"
                        className="h-8 text-sm bg-yellow-25"
                autoComplete="off"
              />
            </div>

                    <div className="space-y-1">
                      <div className="flex items-center">
                        <Label htmlFor="frecuencia_compra" className="text-sm font-medium">Frecuencia de Compra</Label>
                      </div>
                      <div className="flex gap-2">
                        <Select>
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
                        <Button type="button" variant="outline" size="sm" className="h-8 px-3">
                          Días
                        </Button>
                      </div>
                    </div>
            </div>

                  {/* Columna central - Precios */}
            <div className="col-span-3 space-y-2">
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <Label htmlFor="precio_mayorista" className="text-sm font-medium">Precio Mayorista</Label>
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                        <Input
                          id="precio_mayorista"
                          type="text"
                          value={formatCurrencyDisplay(precioMayoristaDisplay)}
                          onChange={handlePrecioMayoristaChange}
                          onFocus={handlePrecioMayoristaFocus}
                          onBlur={handlePrecioMayoristaBlur}
                          className="h-8 text-sm pl-8 bg-yellow-25"
                          autoComplete="off"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <Label htmlFor="precio_minorista" className="text-sm font-medium">Precio Minorista</Label>
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                        <Input
                          id="precio_minorista"
                          type="text"
                          value={formatCurrencyDisplay(precioMinoristaDisplay)}
                          onChange={handlePrecioMinoristaChange}
                          onFocus={handlePrecioMinoristaFocus}
                          onBlur={handlePrecioMinoristaBlur}
                          className="h-8 text-sm pl-8 bg-yellow-25"
                          autoComplete="off"
                        />
                      </div>
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
                          className="h-8 text-sm pl-8 bg-yellow-25"
                          autoComplete="off"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Columna derecha - Grilla de Almacenes */}
                  <div className="col-span-6 space-y-2">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium underline">Almacenes</Label>
                      <div className="h-48 border border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
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
                          value="0"
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
                          value="1.5"
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
                              value="14050101"
                              readOnly
                              className="h-8 text-sm bg-yellow-25 w-20 text-gray-400"
                              autoComplete="off"
                            />
                            <Input
                              type="text"
                              value="INVENTARIO ALIMENTOS"
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
                              value="14050202"
                              readOnly
                              className="h-8 text-sm bg-yellow-25 w-20 text-gray-400"
                              autoComplete="off"
                            />
                            <Input
                              type="text"
                              value="IVA"
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
                              value="23654003"
                              readOnly
                              className="h-8 text-sm bg-yellow-25 w-20 text-gray-400"
                              autoComplete="off"
                            />
                            <Input
                              type="text"
                              value="RET. PRODUCTOS AGROPECUARIOS 1.5%"
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
                              value="61351401"
                              readOnly
                              className="h-8 text-sm bg-yellow-25 w-20 text-gray-400"
                              autoComplete="off"
                            />
                            <Input
                              type="text"
                              value="VTA DE INSUMO, MATE PRIMA AGROPE Y FLORE"
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
                              value="41351401"
                              readOnly
                              className="h-8 text-sm bg-yellow-25 w-20 text-gray-400"
                              autoComplete="off"
                            />
                            <Input
                              type="text"
                              value="VTA DE INSUMO, MATER PRIMA AGROPE Y FLOR"
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
                              value="24080501"
                              readOnly
                              className="h-8 text-sm bg-yellow-25 w-20 text-gray-400"
                              autoComplete="off"
                            />
                            <Input
                              type="text"
                              value="IVA GENERADO"
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
                        onChange={() => {}} // Forzar re-render
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
    queryFn: medidasService.listMedidas,
  });


  const { data: categorias = [] } = useQuery({
    queryKey: ["categorias"],
    queryFn: productosService.listCategorias,
  });

  const { data: sublineas = [] } = useQuery({
    queryKey: ["sublineas"],
    queryFn: sublineasService.listSublineas,
  });

  const { data: lineas = [] } = useQuery({
    queryKey: ["lineas"],
    queryFn: lineasService.listLineas,
  });

  const { data: tipos = [] } = useQuery({
    queryKey: ["tipos"],
    queryFn: tiposService.listTipos,
  });

  const { data: interfacesContables = [] } = useQuery({
    queryKey: ["interfacesContables"],
    queryFn: interfazContableService.listInterfacesContables,
  });

  const { data: presentacionesMedidas = [] } = useQuery({
    queryKey: ["presentacionesMedidas"],
    queryFn: presentacionMedidasService.listPresentacionesMedidas,
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
            sublineas={sublineas as SublineaDataFull[]}
            lineas={lineas}
            tipos={tipos}
            interfacesContables={interfacesContables}
            presentacionesMedidas={presentacionesMedidas}
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
