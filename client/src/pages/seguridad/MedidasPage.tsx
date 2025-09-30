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
import * as medidasDetalleService from '@/services/medidasDetalleService';
import { MedidaDetalleData, MedidaDetalleForm, MedidaDetalleCreate } from '@/services/medidasDetalleService';

// Form Component
interface MedidaFormComponentProps {
  medida?: MedidaData | null;
  editingMedida?: MedidaData | null;
  onSubmit: (data: MedidaForm & { detalles?: any[] }) => void;
  isLoading: boolean;
  onCancel: () => void;
  toast: any; // Función toast para mostrar notificaciones
}

const MedidaFormComponent: React.FC<MedidaFormComponentProps> = ({ 
  medida, 
  editingMedida,
  onSubmit, 
  isLoading, 
  onCancel,
  toast
}) => {
  const [formData, setFormData] = useState<MedidaForm>({
    codigo: medida?.codigo || "",
    nombre: medida?.nombre || "",
    abreviatura: medida?.abreviatura || "",
    clase_medida: medida?.clase_medida || "",
    cantidad: 1, // Siempre 1 y deshabilitado
    val_excedente: medida?.val_excedente || 0,
    conversion_factor: medida?.conversion_factor || 1000, // Valor por defecto 1000
    medida_principal: true, // Siempre true y deshabilitado
  });

  // Estado para la tabla de detalles
  const [detalles, setDetalles] = useState<MedidaDetalleForm[]>([]);
  const [detallesCargados, setDetallesCargados] = useState(false);

  // Estado para formateo de valor excedente
  const [valorExcedenteDisplay, setValorExcedenteDisplay] = useState<string>('0');

  // Estado para formateo de conversión factor
  const [conversionFactorDisplay, setConversionFactorDisplay] = useState<string>('1000');

  // Estado para formateo de valores excedente en detalles
  const [detallesValorDisplay, setDetallesValorDisplay] = useState<{[key: number]: string}>({});

  // Estado para formateo de factores en detalles
  const [detallesFactorDisplay, setDetallesFactorDisplay] = useState<{[key: number]: string}>({});

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
      cantidad: 1, // Siempre 1 y deshabilitado
      val_excedente: editingMedida?.val_excedente || 0,
      conversion_factor: editingMedida?.conversion_factor || 1000, // Valor por defecto 1000
      medida_principal: true, // Siempre true y deshabilitado
    });

    // Inicializar valor de display para valor excedente
    if (editingMedida?.val_excedente && editingMedida.val_excedente > 0) {
      setValorExcedenteDisplay(editingMedida.val_excedente.toString());
    } else {
      setValorExcedenteDisplay('0');
    }

    // Inicializar valor de display para conversión factor
    if (editingMedida?.conversion_factor && editingMedida.conversion_factor > 0) {
      setConversionFactorDisplay(editingMedida.conversion_factor.toString());
    } else {
      setConversionFactorDisplay('1000');
    }

    // Cargar detalles si se está editando una medida
    if (editingMedida?.id) {
      cargarDetalles(editingMedida.id);
    } else {
      setDetalles([]);
      setDetallesCargados(false);
    }
  }, [editingMedida]);

  // Función para cargar detalles de una medida
  const cargarDetalles = async (idMedida: number) => {
    try {
      const detallesData = await medidasDetalleService.listMedidasDetalle(idMedida);
      
      // Usar el valor de cantidad que ya está guardado en la BD (factor calculado)
      const detallesConFactor = detallesData.map(detalle => {
        return { ...detalle, cantidad: detalle.cantidad };
      });
      
      setDetalles(detallesConFactor);
      
      // Inicializar valores de display para los detalles cargados
      const valoresDisplay: {[key: number]: string} = {};
      const factoresDisplay: {[key: number]: string} = {};
      detallesConFactor.forEach(detalle => {
        valoresDisplay[detalle.id] = detalle.val_excedente > 0 ? detalle.val_excedente.toString() : '0';
        // Formatear el factor con coma como separador decimal (sin decimales innecesarios)
        const factorFormateado = detalle.cantidad > 0 
          ? (detalle.cantidad % 1 === 0 
              ? detalle.cantidad.toString() 
              : detalle.cantidad.toString().replace('.', ','))
          : '0';
        factoresDisplay[detalle.id] = factorFormateado;
      });
      setDetallesValorDisplay(valoresDisplay);
      setDetallesFactorDisplay(factoresDisplay);
      
      setDetallesCargados(true);
    } catch (error) {
      console.error('Error cargando detalles:', error);
      setDetalles([]);
      setDetallesCargados(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Pasar tanto los datos del formulario como los detalles
    onSubmit({ ...formData, detalles });
  };

  const handleGuardar = () => {
    // Pasar tanto los datos del formulario como los detalles
    onSubmit({ ...formData, detalles });
  };

  // Funciones para manejar la tabla de detalles
  const agregarDetalle = async () => {
    if (!editingMedida?.id) {
      // Si no hay medida principal, crear un detalle temporal con ID único negativo
      const nuevoDetalle: MedidaDetalleForm = {
        id: -Date.now(), // ID temporal único negativo, será generado por la BD
        id_medida: 0,
        codigo: "",
        nombre: "",
        abreviatura: "",
        clase_medida: "",
        cantidad: 0, // Factor calculado (se calculará automáticamente cuando se ingrese val_excedente)
        val_excedente: 0,
        medida_principal: false,
      };
      setDetalles([...detalles, nuevoDetalle]);
      
      // Inicializar valores de display para el nuevo detalle
      setDetallesValorDisplay(prev => ({ ...prev, [nuevoDetalle.id]: '0' }));
      setDetallesFactorDisplay(prev => ({ ...prev, [nuevoDetalle.id]: '0' }));
      return;
    }

    // Si hay medida principal, generar código dinámico
    try {
      // Recopilar códigos pendientes (medida principal + detalles existentes)
      const codigosPendientes = [
        formData.codigo, // Código de la medida principal
        ...detalles.map(detalle => detalle.codigo).filter(Boolean) // Códigos de detalles existentes
      ].filter(Boolean) as string[];

      const codigo = await medidasDetalleService.generateCodigo(
        formData.clase_medida || "",
        formData.abreviatura || "",
        true,
        editingMedida.id,
        codigosPendientes
      );
      
      const nuevoDetalle: MedidaDetalleForm = {
        id: 0, // ID temporal, será generado por la BD
        id_medida: editingMedida.id,
        codigo,
        nombre: "",
        abreviatura: "",
        clase_medida: formData.clase_medida || "",
        cantidad: 0, // Factor calculado (se calculará automáticamente cuando se ingrese val_excedente)
        val_excedente: 0,
        medida_principal: false,
      };
      setDetalles([...detalles, nuevoDetalle]);
      
      // Inicializar valores de display para el nuevo detalle
      setDetallesValorDisplay(prev => ({ ...prev, [nuevoDetalle.id]: '0' }));
      setDetallesFactorDisplay(prev => ({ ...prev, [nuevoDetalle.id]: '0' }));
    } catch (error) {
      console.error('Error generando código:', error);
      // Fallback con código simple
      const nuevoDetalle: MedidaDetalleForm = {
        id: Date.now(),
        id_medida: editingMedida.id,
        codigo: "DET001",
        nombre: "",
        abreviatura: "",
        clase_medida: formData.clase_medida || "",
        cantidad: 0, // Factor calculado (se calculará automáticamente cuando se ingrese val_excedente)
        val_excedente: 0,
        medida_principal: false,
      };
      setDetalles([...detalles, nuevoDetalle]);
      
      // Inicializar valores de display para el nuevo detalle
      setDetallesValorDisplay(prev => ({ ...prev, [nuevoDetalle.id]: '0' }));
      setDetallesFactorDisplay(prev => ({ ...prev, [nuevoDetalle.id]: '0' }));
    }
  };

  const actualizarDetalle = async (id: number, campo: string, valor: string | number) => {
    // Convertir a mayúsculas si es texto
    if ((campo === 'nombre' || campo === 'abreviatura') && typeof valor === 'string') {
      valor = valor.toUpperCase();
    }

    // Actualizar el detalle
    const detalleActualizado = detalles.map(detalle => {
      if (detalle.id === id) {
        const detalleActualizado = { ...detalle, [campo]: valor };
        
        // Si se actualiza val_excedente, calcular cantidad (factor calculado)
        if (campo === 'val_excedente' && typeof valor === 'number') {
          const conversionFactor = formData.conversion_factor || 1000;
          const factorCalculado = conversionFactor > 0 ? valor / conversionFactor : 0;
          // Redondear eliminando decimales innecesarios (como se muestra en el input)
          const factorRedondeado = parseFloat(factorCalculado.toFixed(4));
          detalleActualizado.cantidad = factorRedondeado;
        }
        
        // Si se actualiza cantidad, no hacer cálculo automático aquí
        // El cálculo se hace en handleDetalleFactorBlur
        
        return detalleActualizado;
      }
      return detalle;
    });
    setDetalles(detalleActualizado);

    // Si se cambió clase_medida o abreviatura, regenerar código
    if (campo === 'clase_medida' || campo === 'abreviatura') {
      try {
        const detalle = detalleActualizado.find(d => d.id === id);
        if (detalle && detalle.clase_medida && detalle.abreviatura) {
          // Para detalles, usar un ID temporal si no hay medida principal
          const idMedida = editingMedida?.id || 0;
          
          // Recopilar códigos pendientes (medida principal + otros detalles)
          const codigosPendientes = [
            formData.codigo, // Código de la medida principal
            ...detalles
              .filter(d => d.id !== detalle.id) // Excluir el detalle actual
              .map(d => d.codigo)
              .filter(Boolean) // Códigos de otros detalles
          ].filter(Boolean) as string[];

          const codigo = await medidasDetalleService.generateCodigo(
            detalle.clase_medida,
            detalle.abreviatura,
            true,
            idMedida,
            codigosPendientes
          );
          
          setDetalles(detalleActualizado.map(d => 
            d.id === id ? { ...d, codigo } : d
          ));
        }
      } catch (error) {
        console.error('Error regenerando código:', error);
        // Fallback: generar código simple
        const detalle = detalleActualizado.find(d => d.id === id);
        if (detalle && detalle.clase_medida && detalle.abreviatura) {
          const prefijoClase = detalle.clase_medida.charAt(0).toUpperCase();
          const prefijoAbreviatura = detalle.abreviatura.charAt(0).toUpperCase();
          const codigoFallback = `${prefijoClase}${prefijoAbreviatura}01`;
          
          setDetalles(detalleActualizado.map(d => 
            d.id === id ? { ...d, codigo: codigoFallback } : d
          ));
        }
      }
    }
  };

  const eliminarDetalle = async (id: number) => {
    try {
      // Si el detalle tiene ID > 0, significa que ya existe en la BD, eliminarlo
      if (id > 0) {
        await medidasDetalleService.deleteMedidaDetalle(id);
      }
      // Si ID < 0, es un detalle temporal, solo eliminar del estado local
      
      // Eliminar del estado local usando el ID único
      setDetalles(detalles.filter(detalle => detalle.id !== id));
      
      // Limpiar los valores de display
      setDetallesValorDisplay(prev => {
        const newDisplay = { ...prev };
        delete newDisplay[id];
        return newDisplay;
      });
      
      setDetallesFactorDisplay(prev => {
        const newDisplay = { ...prev };
        delete newDisplay[id];
        return newDisplay;
      });
      
    } catch (error) {
      console.error('Error eliminando detalle:', error);
      toast({
        title: '❌ Error al Eliminar',
        description: 'No se pudo eliminar el detalle. Intente nuevamente.',
        variant: 'destructive',
        className: "bg-red-50 border-red-200 text-red-800",
      });
    }
  };

  // Funciones de formateo para valor excedente (igual que en productos)
  const formatCurrencyDisplay = (value: string) => {
    if (!value) return '0';

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
    if (!value) return '0';

    // Remover caracteres no numéricos excepto punto decimal
    let cleanValue = value.replace(/[^0-9.]/g, '');

    // Si no hay punto decimal, agregar .00
    if (!cleanValue.includes('.')) {
      const formattedInteger = cleanValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return `${formattedInteger}.00`;
    } else {
      // Si hay punto decimal, formatear
      const [integerPart, decimalPart] = cleanValue.split('.');
      const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return `${formattedInteger}.${decimalPart}`;
    }
  };

  const handleValorExcedenteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Si el campo está vacío, mostrar 0
    if (inputValue === '') {
      setValorExcedenteDisplay('0');
      setFormData(prev => ({
        ...prev,
        val_excedente: 0
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
    setValorExcedenteDisplay(formatted);

    // Convertir a número y actualizar el estado
    const numericValue = parseFloat(cleanValue) || 0;
    setFormData(prev => ({
      ...prev,
      val_excedente: numericValue
    }));
  };

  const handleValorExcedenteBlur = () => {
    const formatted = formatOnBlur(valorExcedenteDisplay);
    setValorExcedenteDisplay(formatted);
  };

  const handleValorExcedenteFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  // Funciones de formateo para conversión factor
  const handleConversionFactorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Si el campo está vacío, mostrar 0
    if (inputValue === '') {
      setConversionFactorDisplay('0');
      setFormData(prev => ({ ...prev, conversion_factor: 0 }));
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
    setConversionFactorDisplay(formatted);

    // Convertir a número y actualizar el estado
    const numericValue = parseFloat(cleanValue) || 0;
    setFormData(prev => ({ ...prev, conversion_factor: numericValue }));
  };

  const handleConversionFactorBlur = () => {
    const formatted = formatOnBlur(conversionFactorDisplay);
    setConversionFactorDisplay(formatted);
  };

  const handleConversionFactorFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  // Funciones de formateo para valor excedente en detalles
  const handleDetalleValorExcedenteChange = (detalleId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Si el campo está vacío, mostrar 0
    if (inputValue === '') {
      setDetallesValorDisplay(prev => ({ ...prev, [detalleId]: '0' }));
      actualizarDetalle(detalleId, 'val_excedente', 0);
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
    setDetallesValorDisplay(prev => ({ ...prev, [detalleId]: formatted }));

    // Convertir a número y actualizar el detalle
    const numericValue = parseFloat(cleanValue) || 0;
    actualizarDetalle(detalleId, 'val_excedente', numericValue);
  };

  const handleDetalleValorExcedenteBlur = (detalleId: number) => {
    const currentValue = detallesValorDisplay[detalleId] || '0';
    const formatted = formatOnBlur(currentValue);
    setDetallesValorDisplay(prev => ({ ...prev, [detalleId]: formatted }));
  };

  const handleDetalleValorExcedenteFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  // Funciones de formateo para factor en detalles
  const handleDetalleFactorChange = (detalleId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Si el campo está vacío, mostrar vacío
    if (inputValue === '') {
      setDetallesFactorDisplay(prev => ({ ...prev, [detalleId]: '' }));
      return;
    }

    // Remover todos los caracteres no numéricos excepto punto y coma decimal
    let cleanValue = inputValue.replace(/[^0-9.,]/g, '');

    // Convertir coma a punto para el cálculo interno
    cleanValue = cleanValue.replace(',', '.');

    // Asegurar que solo haya un punto decimal
    const parts = cleanValue.split('.');
    if (parts.length > 2) {
      cleanValue = parts[0] + '.' + parts.slice(1).join('');
    }

    // Limitar a 4 decimales
    if (parts.length === 2 && parts[1].length > 4) {
      cleanValue = parts[0] + '.' + parts[1].substring(0, 4);
    }

    // Convertir de vuelta a coma para el display
    cleanValue = cleanValue.replace('.', ',');

    // Solo actualizar display, no hacer cálculo aún
    setDetallesFactorDisplay(prev => ({ ...prev, [detalleId]: cleanValue }));
  };

  const handleDetalleFactorFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  const handleDetalleFactorBlur = (detalleId: number) => {
    const currentValue = detallesFactorDisplay[detalleId] || '';
    
    // Si el campo está vacío, establecer en 0
    if (currentValue === '') {
      setDetallesFactorDisplay(prev => ({ ...prev, [detalleId]: '0' }));
      actualizarDetalle(detalleId, 'cantidad', 0);
      return;
    }

    // Convertir a número (reemplazar coma por punto para parseFloat)
    const numericValue = parseFloat(currentValue.replace(',', '.')) || 0;
    
    // Hacer el cálculo: valor_ingresado ÷ conversion_factor
    const conversionFactor = formData.conversion_factor || 1000;
    const resultadoCalculado = conversionFactor > 0 ? numericValue / conversionFactor : 0;
    
    // Redondear eliminando decimales innecesarios (como se muestra en el input)
    const resultadoRedondeado = parseFloat(resultadoCalculado.toFixed(4));
    
    // Actualizar el detalle con el resultado del cálculo
    actualizarDetalle(detalleId, 'cantidad', resultadoRedondeado);
    
    // Actualizar el display con el resultado formateado (sin decimales innecesarios)
    const resultadoFormateado = resultadoRedondeado % 1 === 0 
      ? resultadoRedondeado.toString() 
      : resultadoRedondeado.toString().replace('.', ',');
    
    setDetallesFactorDisplay(prev => ({ 
      ...prev, 
      [detalleId]: resultadoFormateado
    }));
  };

  const handleInputChange = (field: keyof MedidaForm, value: string | number | boolean) => {
    // No permitir cambios manuales al código cuando se está creando
    if (field === 'codigo' && !editingMedida) {
      return;
    }

    // Convertir nombre y abreviatura a mayúsculas
    if ((field === 'nombre' || field === 'abreviatura') && typeof value === 'string') {
      value = value.toUpperCase();
    }

    // Actualizar el estado primero
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Generar código dinámico cuando cambie la clase de medida o abreviatura
    if ((field === 'clase_medida' || field === 'abreviatura') && typeof value === 'string') {
      const generateDynamicCode = async () => {
        try {
          const claseMedida = field === 'clase_medida' ? value : formData.clase_medida;
          const abreviatura = field === 'abreviatura' ? value : formData.abreviatura;
          
          if (claseMedida && abreviatura) {
            // Recopilar códigos pendientes de detalles existentes
            const codigosPendientes = detalles
              .map(detalle => detalle.codigo)
              .filter(Boolean) as string[];

            const codigoGenerado = await medidasDetalleService.generateCodigo(
              claseMedida, 
              abreviatura, 
              false, 
              undefined, 
              codigosPendientes
            );
            
            if (editingMedida) {
              // Si se está editando, actualizar el código en el formData
              setFormData(prev => ({ ...prev, codigo: codigoGenerado }));
            } else {
              // Si se está creando, actualizar nextCodigo
              setNextCodigo(codigoGenerado);
            }
          }
        } catch (error) {
          console.error('Error generando código:', error);
        }
      };

      generateDynamicCode();
    }
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
            {/* Código - Dinámico con prefijos P/V */}
            <div className="col-span-1 space-y-2">
              <Label htmlFor="codigo" className="text-sm font-medium">Código</Label>
              <Input
                id="codigo"
                value={editingMedida ? formData.codigo : (nextCodigo || "Seleccione clase")}
                onChange={(e) => handleInputChange('codigo', e.target.value)}
                readOnly={true}
                className="h-8 text-sm bg-red-50 border-red-200 text-red-600 font-bold cursor-default"
                autoComplete="off"
              />
            </div>

            {/* Nombre - Más grande */}
            <div className="col-span-3 space-y-2">
              <Label htmlFor="nombre" className="text-sm font-medium">Nombre *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                required
                className="h-8 text-sm border-gray-200 focus:border-cyan-500 focus:ring-cyan-500/20"
                autoComplete="off"
              />
            </div>

            {/* Abreviatura - Más pequeña */}
            <div className="col-span-2 space-y-2">
              <Label htmlFor="abreviatura" className="text-sm font-medium">Abreviatura *</Label>
              <Input
                id="abreviatura"
                value={formData.abreviatura}
                onChange={(e) => handleInputChange('abreviatura', e.target.value)}
                required
                className="h-8 text-sm border-gray-200 focus:border-cyan-500 focus:ring-cyan-500/20"
                autoComplete="off"
                maxLength={10}
              />
            </div>

            {/* Medida Principal - Checkbox siempre marcado y deshabilitado */}
            <div className="col-span-1 space-y-2">
              <Label className="text-sm font-medium">Principal</Label>
              <div className="flex items-center justify-center h-8 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-md px-3">
                <div className="flex items-center space-x-2">
                  <input
                    id="medida_principal"
                    type="checkbox"
                    checked={true}
                    disabled
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded cursor-not-allowed"
                  />
                  <span className="text-sm font-medium text-green-700">
                    Sí
                  </span>
                </div>
              </div>
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="clase_medida" className="text-sm font-medium">Clase de Medida</Label>
              <Select
                value={formData.clase_medida || "sin_clase"}
                onValueChange={(value) => handleInputChange('clase_medida', value === "sin_clase" ? "" : value)}
              >
                <SelectTrigger className="h-8 text-sm border-gray-200 focus:border-cyan-500 focus:ring-cyan-500/20">
                  <SelectValue placeholder="Seleccionar clase" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sin_clase">Sin clase</SelectItem>
                  <SelectItem value="Peso">Peso</SelectItem>
                  <SelectItem value="Volumen">Volumen</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Factor - Mismo tamaño que clase */}
            <div className="col-span-1 space-y-2">
              <Label htmlFor="factor" className="text-sm font-medium">Factor</Label>
              <Input
                id="cantidad"
                type="number"
                step="0.001"
                value={1}
                disabled
                className="h-8 text-sm bg-gray-100 border-gray-300 text-gray-600 cursor-not-allowed"
                autoComplete="off"
              />
            </div>

            {/* Conversión Factor - Formateado con separadores de miles */}
            <div className="col-span-2 space-y-2">
              <Label htmlFor="conversion_factor" className="text-sm font-medium">Conversión Factor</Label>
              <Input
                id="conversion_factor"
                type="text"
                value={formatCurrencyDisplay(conversionFactorDisplay)}
                onChange={handleConversionFactorChange}
                onFocus={handleConversionFactorFocus}
                onBlur={handleConversionFactorBlur}
                className="h-8 text-sm text-right border-gray-200 focus:border-cyan-500 focus:ring-cyan-500/20"
                autoComplete="off"
                placeholder="0"
              />
            </div>
          </div>

        </form>

        {/* Tabla de Detalles */}
        <div className="mt-8">
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Conversiones de Medida</h3>
            <Button
              type="button"
              onClick={agregarDetalle}
              className="bg-cyan-600 hover:bg-cyan-700 text-white shadow-md hover:shadow-lg transition-all duration-200 rounded-full p-2"
              size="icon"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>

          {detalles.length > 0 ? (
            <div className="rounded-lg border border-gray-200 shadow-sm bg-white overflow-hidden">
              <Table>
                <TableHeader className="bg-gradient-to-r from-cyan-50 to-blue-50">
                  <TableRow className="border-b border-cyan-200">
                    <TableHead className="px-3 py-3 text-center w-16 text-cyan-700 font-semibold">Acciones</TableHead>
                    <TableHead className="px-3 py-3 w-20 text-cyan-700 font-semibold text-center">Código</TableHead>
                    <TableHead className="px-3 py-3 w-32 text-cyan-700 font-semibold text-center">Nombre</TableHead>
                    <TableHead className="px-3 py-3 w-24 text-cyan-700 font-semibold text-center">Abreviatura</TableHead>
                    <TableHead className="px-3 py-3 w-32 text-cyan-700 font-semibold text-center">Clase</TableHead>
                    <TableHead className="px-3 py-3 w-28 text-cyan-700 font-semibold text-center">Factor</TableHead>
                    <TableHead className="px-3 py-3 w-32 text-cyan-700 font-semibold text-center">Excedente</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detalles.map((detalle, index) => (
                    <TableRow key={detalle.id} className={`hover:bg-cyan-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                      <TableCell className="px-3 py-3 text-left">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => eliminarDetalle(detalle.id || 0)}
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-all duration-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                      <TableCell className="px-3 py-3 text-left">
                        <Input
                          value={detalle.codigo}
                          className="h-8 text-sm bg-red-50 border-red-200 text-red-600 font-bold cursor-default"
                          readOnly
                        />
                      </TableCell>
                      <TableCell className="px-3 py-3 text-left">
                        <Input
                          value={detalle.nombre}
                          onChange={(e) => actualizarDetalle(detalle.id || 0, 'nombre', e.target.value.toUpperCase())}
                          className="h-8 text-sm border-gray-200 focus:border-cyan-500 focus:ring-cyan-500/20"
                        />
                      </TableCell>
                      <TableCell className="px-3 py-3 text-left">
                        <Input
                          value={detalle.abreviatura}
                          onChange={(e) => actualizarDetalle(detalle.id || 0, 'abreviatura', e.target.value.toUpperCase())}
                          className="h-8 text-sm border-gray-200 focus:border-cyan-500 focus:ring-cyan-500/20"
                          maxLength={10}
                        />
                      </TableCell>
                      <TableCell className="px-3 py-3 text-left">
                        <Select
                          value={detalle.clase_medida || "sin_clase"}
                          onValueChange={(value) => actualizarDetalle(detalle.id || 0, 'clase_medida', value === "sin_clase" ? "" : value)}
                        >
                          <SelectTrigger className="h-8 text-sm border-gray-200 focus:border-cyan-500 focus:ring-cyan-500/20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sin_clase">Sin clase</SelectItem>
                            <SelectItem value="Peso">Peso</SelectItem>
                            <SelectItem value="Volumen">Volumen</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="px-3 py-3 text-left">
                        <Input
                          type="text"
                          value={detallesFactorDisplay[detalle.id] || (detalle.cantidad === 0 ? '' : detalle.cantidad.toString())}
                          onChange={(e) => handleDetalleFactorChange(detalle.id || 0, e)}
                          onFocus={handleDetalleFactorFocus}
                          onBlur={() => handleDetalleFactorBlur(detalle.id || 0)}
                          className="h-8 text-sm text-right border-gray-200 focus:border-cyan-500 focus:ring-cyan-500/20"
                          placeholder="0.0000"
                        />
                      </TableCell>
                      <TableCell className="px-3 py-3 text-left">
                        <Input
                          type="text"
                          value={formatCurrencyDisplay(detallesValorDisplay[detalle.id] || '0')}
                          onChange={(e) => handleDetalleValorExcedenteChange(detalle.id || 0, e)}
                          onFocus={handleDetalleValorExcedenteFocus}
                          onBlur={() => handleDetalleValorExcedenteBlur(detalle.id || 0)}
                          className="h-8 text-sm text-right border-gray-200 focus:border-cyan-500 focus:ring-cyan-500/20"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <Ruler className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">No hay detalles agregados</p>
              <p className="text-sm">Haz clic en el botón + para comenzar</p>
            </div>
          )}

          {/* Botones compactos debajo de la tabla */}
          <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="h-8 px-4 text-sm border-gray-300 hover:bg-gray-50"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleGuardar}
              disabled={isLoading}
              className="h-8 px-4 text-sm bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-3 h-3 mr-1" />
                  Guardar
                </>
              )}
            </Button>
          </div>
        </div>
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
    mutationFn: async ({ data, detalles }: { data: MedidaForm; detalles: any[] }) => {
      startLoading();
      const medidaData: MedidaData = {
        id: 0, // ID temporal para creación
        codigo: data.codigo!,
        nombre: data.nombre,
        abreviatura: data.abreviatura,
        clase_medida: data.clase_medida || undefined,
        cantidad: data.cantidad,
        val_excedente: data.val_excedente,
        conversion_factor: data.conversion_factor,
        medida_principal: data.medida_principal || false,
        estado: 1
      };
      
      // Crear la medida principal
      const medidaCreada = await medidasService.createMedida(medidaData);
      
      // Guardar los detalles asociados
      if (detalles && detalles.length > 0) {
        for (const detalle of detalles) {
          if (detalle.nombre && detalle.abreviatura) {
            // Usar el valor de cantidad directamente (ya está calculado y formateado)
            const factorNumericValue = detalle.cantidad || 0;
            
            const detalleData: MedidaDetalleCreate = {
              id_medida: medidaCreada.id,
              codigo: detalle.codigo,
              nombre: detalle.nombre,
              abreviatura: detalle.abreviatura,
              clase_medida: detalle.clase_medida,
              cantidad: factorNumericValue, // Factor calculado (valor / conversion_factor)
              val_excedente: detalle.val_excedente,
              medida_principal: detalle.medida_principal,
              estado: 1
            };
            await medidasDetalleService.createMedidaDetalle(detalleData);
          }
        }
      }
      
      return medidaCreada;
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
    mutationFn: async ({ id, data, detalles }: { id: number; data: Partial<MedidaData>; detalles: any[] }) => {
      // Actualizar la medida principal
      const medidaActualizada = await medidasService.updateMedida(id, data);
      
      // Actualizar los detalles asociados
      if (detalles) {
        // Obtener detalles existentes en la BD
        const detallesExistentes = await medidasDetalleService.listMedidasDetalle(id);
        const detallesExistentesIds = detallesExistentes.map(d => d.id);
        
        // Procesar cada detalle en el estado actual
        for (const detalle of detalles) {
          if (detalle.nombre && detalle.abreviatura) {
            // Usar el valor de cantidad directamente (ya está calculado y formateado)
            const factorNumericValue = detalle.cantidad || 0;
            
            const detalleData: MedidaDetalleData = {
              id: detalle.id || 0,
              id_medida: id,
              codigo: detalle.codigo,
              nombre: detalle.nombre,
              abreviatura: detalle.abreviatura,
              clase_medida: detalle.clase_medida,
              cantidad: factorNumericValue, // Factor calculado (valor / conversion_factor)
              val_excedente: detalle.val_excedente,
              medida_principal: detalle.medida_principal,
              estado: 1
            };
            
            if (detalle.id && detalle.id > 0) {
              // Actualizar detalle existente
              await medidasDetalleService.updateMedidaDetalle(detalle.id, detalleData);
            } else {
              // Crear nuevo detalle (ID será generado por la BD)
              const { id, ...detalleDataSinId } = detalleData;
              const detalleCreate: MedidaDetalleCreate = detalleDataSinId;
              await medidasDetalleService.createMedidaDetalle(detalleCreate);
            }
          }
        }
        
        // Eliminar detalles que ya no están en la lista actual
        const detallesActualesIds = detalles.filter(d => d.id && d.id > 0).map(d => d.id);
        const detallesAEliminar = detallesExistentesIds.filter(id => !detallesActualesIds.includes(id));
        
        for (const idAEliminar of detallesAEliminar) {
          await medidasDetalleService.deleteMedidaDetalle(idAEliminar);
        }
      }
      
      return medidaActualizada;
    },
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
        (medida.codigo?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-cyan-800 flex items-center gap-2">
          <Ruler className="w-8 h-8 text-cyan-600" />
          Gestión de Medidas
        </h1>
      </div>
      
      <Tabs value={activeTab} onValueChange={(value) => {
        setActiveTab(value);
        // Si se cambia al tab formulario sin estar editando, limpiar estado
        if (value === "formulario" && !editingMedida) {
          setEditingMedida(null);
        }
      }} className="w-full">
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
                    <TableRow className="text-center font-semibold text-gray-700">
                      <TableHead className="px-2 py-1 text-teal-600 w-20 text-center">Acciones</TableHead>
                      <TableHead className="px-4 py-3 w-20 text-center">Código</TableHead>
                      <TableHead className="px-4 py-3 text-center">Nombre</TableHead>
                      <TableHead className="px-4 py-3 w-24 text-center">Abreviatura</TableHead>
                      <TableHead className="px-4 py-3 text-center">Clase</TableHead>
                      <TableHead className="px-4 py-3 w-20 text-center">Factor</TableHead>
                      <TableHead className="px-4 py-3 w-24 text-center">Excedente</TableHead>
                      <TableHead className="px-4 py-3 w-24 text-center">Principal</TableHead>
                      <TableHead className="px-4 py-3 w-24 text-center">Estado</TableHead>
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
                          <TableCell className="px-3 py-2 text-sm text-gray-900 font-medium w-20 text-left">
                            {medida.codigo}
                          </TableCell>
                          <TableCell className="px-3 py-2 text-sm text-gray-900 text-left">
                            {medida.nombre}
                          </TableCell>
                          <TableCell className="px-3 py-2 text-sm text-gray-900 w-24 text-left">
                            {medida.abreviatura}
                          </TableCell>
                          <TableCell className="px-3 py-2 text-sm text-gray-900 text-left">
                            {medida.clase_medida || "-"}
                          </TableCell>
                          <TableCell className="px-3 py-2 text-sm text-gray-900 w-20 text-left">
                            {medida.cantidad}
                          </TableCell>
                          <TableCell className="px-3 py-2 text-sm text-gray-900 w-24 text-left">
                            {medida.val_excedente || "0.00"}
                          </TableCell>
                          <TableCell className="px-3 py-2 text-sm text-gray-900 w-24 text-left">
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
                          <TableCell className="px-3 py-2 text-left">
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
            medida={null}
            editingMedida={editingMedida}
            onSubmit={(data) => {
              if (editingMedida) {
                // Filtrar el campo detalles del data para evitar error de Supabase
                const { detalles, ...medidaData } = data as any;
                updateMedidaMutation.mutate({ 
                  id: editingMedida.id!, 
                  data: medidaData as Partial<MedidaData>,
                  detalles: detalles || []
                });
              } else {
                // Para crear, no incluir el id ni detalles
                const { id, detalles, ...createData } = data as any;
                createMedidaMutation.mutate({ 
                  data: createData,
                  detalles: detalles || []
                });
              }
            }}
            isLoading={createMedidaMutation.isPending || updateMedidaMutation.isPending}
            onCancel={() => {
              setEditingMedida(null);
              setActiveTab("medidas");
            }}
            toast={toast}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MedidasPage;
