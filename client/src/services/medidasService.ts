import { supabase } from './supabaseClient';

export interface MedidaData {
  id: number;
  codigo: string;
  nombre: string;
  abreviatura: string;
  clase_medida?: string;
  id_medida_principal?: number;
  id_unidad_hija?: number;
  cantidad: number;
  factor?: number;
  permite_cambio: number;
  val_excedente: number;
  estado: number;
}

export interface MedidaForm {
  id?: number;
  codigo: string;
  nombre: string;
  abreviatura: string;
  clase_medida?: string;
  id_medida_principal?: number;
  id_unidad_hija?: number;
  cantidad: number;
  factor?: number;
  permite_cambio: number;
  val_excedente: number;
  estado?: number;
}

/**
 * Lista todas las medidas
 */
export const listMedidas = async (): Promise<MedidaData[]> => {
  try {
    const { data, error } = await supabase
      .from('inv_medidas')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.error('Error al obtener medidas:', error);
      throw error;
    }

    console.log('🔍 Datos raw de medidas desde Supabase:', data);
    
    // Asegurar que el campo estado esté presente y sea un número
    const medidasConEstado = data?.map(medida => ({
      ...medida,
      estado: medida.estado !== undefined ? Number(medida.estado) : 1 // Default a activo si no hay estado
    })) || [];

    console.log('🔍 Medidas procesadas con estado:', medidasConEstado);
    
    return medidasConEstado as unknown as MedidaData[];
  } catch (error) {
    console.error('Error en listMedidas:', error);
    throw error;
  }
};

/**
 * Crea una nueva medida
 */
export const createMedida = async (medida: MedidaData): Promise<MedidaData> => {
  try {
    const { data, error } = await supabase
      .from('inv_medidas')
      .insert([medida])
      .select('*')
      .single();

    if (error) {
      console.error('Error al crear medida:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error en createMedida:', error);
    throw error;
  }
};

/**
 * Actualiza una medida existente
 */
export const updateMedida = async (id: number, medida: Partial<MedidaData>): Promise<MedidaData> => {
  try {
    const { data, error } = await supabase
      .from('inv_medidas')
      .update(medida)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Error al actualizar medida:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error en updateMedida:', error);
    throw error;
  }
};

/**
 * Activa una medida
 */
export const activateMedida = async (id: number): Promise<void> => {
  try {
    const { error } = await supabase
      .from('inv_medidas')
      .update({ estado: 1 })
      .eq('id', id);

    if (error) {
      console.error('Error al activar medida:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error en activateMedida:', error);
    throw error;
  }
};

/**
 * Desactiva una medida
 */
export const deactivateMedida = async (id: number): Promise<void> => {
  try {
    const { error } = await supabase
      .from('inv_medidas')
      .update({ estado: 0 })
      .eq('id', id);

    if (error) {
      console.error('Error al desactivar medida:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error en deactivateMedida:', error);
    throw error;
  }
};

/**
 * Elimina permanentemente una medida
 */
export const deleteMedidaPermanent = async (id: number): Promise<{ id: number; nombre: string }> => {
  try {
    console.log('🗑️ medidasService: deleteMedidaPermanent llamado con:', id);

    // Primero obtener la medida para el retorno
    const { data: medida, error: fetchError } = await supabase
      .from('inv_medidas')
      .select('id, nombre')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error al obtener medida:', fetchError);
      throw fetchError;
    }

    console.log('📋 Medida encontrada:', medida);

    // Intentar eliminación directa primero
    const { error: deleteError } = await supabase
      .from('inv_medidas')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error al eliminar medida:', deleteError);
      throw deleteError;
    }

    console.log('✅ Medida eliminada exitosamente');
    return { id: medida.id, nombre: medida.nombre };
  } catch (error) {
    console.error('Error en deleteMedidaPermanent:', error);
    throw error;
  }
};

/**
 * Obtiene el siguiente código disponible para una nueva medida
 */
export const getNextCodigo = async (): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('inv_medidas')
      .select('codigo')
      .order('id', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error al obtener siguiente código:', error);
      throw error;
    }

    if (data && data.length > 0) {
      const lastCode = data[0].codigo;
      // Si el código es numérico, incrementar
      if (/^\d+$/.test(lastCode)) {
        const nextNumber = parseInt(lastCode) + 1;
        return nextNumber.toString().padStart(2, '0');
      }
      // Si es alfanumérico, generar secuencia alfabética
      return 'M' + (data.length + 1).toString().padStart(2, '0');
    }

    return 'M01';
  } catch (error) {
    console.error('Error en getNextCodigo:', error);
    throw error;
  }
};

export const medidasService = {
  listMedidas,
  createMedida,
  updateMedida,
  activateMedida,
  deactivateMedida,
  deleteMedidaPermanent,
  getNextCodigo,
};
