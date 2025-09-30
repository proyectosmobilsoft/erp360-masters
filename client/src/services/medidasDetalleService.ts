import { supabase } from './supabaseClient';

export interface MedidaDetalleData {
  id: number;
  id_medida: number;
  codigo: string;
  nombre: string;
  abreviatura: string;
  clase_medida?: string;
  cantidad: number; // Factor calculado (valor / conversion_factor)
  val_excedente: number;
  medida_principal: boolean;
  estado: number;
  created_at?: string;
  updated_at?: string;
}

export interface MedidaDetalleForm {
  id: number;
  id_medida: number;
  codigo: string;
  nombre: string;
  abreviatura: string;
  clase_medida?: string;
  cantidad: number; // Factor calculado (valor / conversion_factor)
  val_excedente: number;
  medida_principal: boolean;
  estado?: number;
}

export interface MedidaDetalleCreate {
  id_medida: number;
  codigo: string;
  nombre: string;
  abreviatura: string;
  clase_medida?: string;
  cantidad: number; // Factor calculado (valor / conversion_factor)
  val_excedente: number;
  medida_principal: boolean;
  estado?: number;
}

/**
 * Lista todos los detalles de una medida específica
 */
export const listMedidasDetalle = async (idMedida: number): Promise<MedidaDetalleData[]> => {
  try {
    const { data, error } = await supabase
      .from('inv_medidas_detalle')
      .select('*')
      .eq('id_medida', idMedida)
      .order('id', { ascending: true });

    if (error) {
      console.error('Error al obtener detalles de medida:', error);
      throw error;
    }

    return data as MedidaDetalleData[];
  } catch (error) {
    console.error('Error en listMedidasDetalle:', error);
    throw error;
  }
};

/**
 * Crea un nuevo detalle de medida
 */
export const createMedidaDetalle = async (detalle: MedidaDetalleCreate): Promise<MedidaDetalleData> => {
  try {
    const { data, error } = await supabase
      .from('inv_medidas_detalle')
      .insert([detalle])
      .select()
      .single();

    if (error) {
      console.error('Error al crear detalle de medida:', error);
      throw error;
    }

    return data as MedidaDetalleData;
  } catch (error) {
    console.error('Error en createMedidaDetalle:', error);
    throw error;
  }
};

/**
 * Actualiza un detalle de medida existente
 */
export const updateMedidaDetalle = async (id: number, detalle: Partial<MedidaDetalleData>): Promise<MedidaDetalleData> => {
  try {
    const { data, error } = await supabase
      .from('inv_medidas_detalle')
      .update(detalle)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error al actualizar detalle de medida:', error);
      throw error;
    }

    return data as MedidaDetalleData;
  } catch (error) {
    console.error('Error en updateMedidaDetalle:', error);
    throw error;
  }
};

/**
 * Elimina un detalle de medida
 */
export const deleteMedidaDetalle = async (id: number): Promise<MedidaDetalleData> => {
  try {
    const { data, error } = await supabase
      .from('inv_medidas_detalle')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error al eliminar detalle de medida:', error);
      throw error;
    }

    return data as MedidaDetalleData;
  } catch (error) {
    console.error('Error en deleteMedidaDetalle:', error);
    throw error;
  }
};

/**
 * Genera el siguiente código para una medida o detalle
 */
export const generateCodigo = async (
  claseMedida: string, 
  abreviatura: string, 
  esDetalle: boolean = false, 
  idMedida?: number,
  codigosPendientes: string[] = []
): Promise<string> => {
  try {
    // Generar prefijo: primera letra de la clase + primera letra de la abreviatura
    const prefijoClase = claseMedida.charAt(0).toUpperCase();
    
    // Encontrar la primera letra en la abreviatura (ignorar números y símbolos)
    const primeraLetraMatch = abreviatura.match(/[A-Za-z]/);
    const prefijoAbreviatura = primeraLetraMatch ? primeraLetraMatch[0].toUpperCase() : 'X';
    
    const prefijo = `${prefijoClase}${prefijoAbreviatura}`;
    
    let nextNumber = 1;
    
    // Para ambos casos (medidas principales y detalles), obtener de la tabla inv_medidas
    const { supabase } = await import('./supabaseClient');
    const { data: medidas } = await supabase
      .from('inv_medidas')
      .select('codigo')
      .like('codigo', `${prefijo}%`);
    
    // Combinar códigos de la base de datos con códigos pendientes en memoria
    const todosLosCodigos = [
      ...(medidas || []).map(medida => medida.codigo).filter(Boolean),
      ...codigosPendientes
    ];
    
    // Filtrar SOLO los códigos que tengan el mismo prefijo
    const codigosConMismoPrefijo = todosLosCodigos.filter(codigo => 
      codigo && codigo.startsWith(prefijo)
    );
    
    // Debug: Log para verificar qué códigos se están considerando
    console.log('🔍 Debug generateCodigo:', {
      prefijo,
      codigosBD: (medidas || []).map(medida => medida.codigo),
      codigosPendientes,
      todosLosCodigos,
      codigosConMismoPrefijo
    });
    
    // Extraer números SOLO de los códigos con el mismo prefijo
    const numerosExistentes = codigosConMismoPrefijo
      .map(codigo => {
        const match = codigo?.match(/\d+$/);
        return match ? parseInt(match[0]) : 0;
      })
      .filter(num => num > 0);
    
    console.log('🔍 Números existentes para prefijo', prefijo, ':', numerosExistentes);
    
    nextNumber = numerosExistentes.length > 0 ? Math.max(...numerosExistentes) + 1 : 1;
    
    console.log('🔍 Siguiente número para prefijo', prefijo, ':', nextNumber);
    
    // Generar código con 2 dígitos
    const codigo = `${prefijo}${nextNumber.toString().padStart(2, '0')}`;
    
    return codigo;
  } catch (error) {
    console.error('Error generando código:', error);
    throw error;
  }
};

/**
 * Genera el siguiente código para un detalle de medida (mantener compatibilidad)
 */
export const generateDetalleCodigo = async (idMedida: number, claseMedida: string, abreviatura: string): Promise<string> => {
  return generateCodigo(claseMedida, abreviatura, true, idMedida);
};
