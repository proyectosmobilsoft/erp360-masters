import { supabase } from './supabaseClient';

export interface SublineaData {
  id: number;
  id_linea: number;
  id_componente_menu?: number;
  codigo: string;
  nombre: string;
  estado: number;
  inv_lineas?: {
    id: number;
    nombre: string;
  };
}

export interface SublineaForm {
  id?: number;
  id_linea: number;
  id_componente_menu?: number;
  codigo: string;
  nombre: string;
  estado?: number;
}

export interface LineaData {
  id: number;
  nombre: string;
}

/**
 * Lista todas las sublíneas con información de líneas
 */
export const listSublineas = async (): Promise<SublineaData[]> => {
  try {
    const { data, error } = await supabase
      .from('inv_sublineas')
      .select(`
        *,
        inv_lineas!id_linea (
          id,
          nombre
        )
      `)
      .order('id', { ascending: false });

    if (error) {
      console.error('Error al obtener sublíneas:', error);
      throw error;
    }

    return data as unknown as SublineaData[];
  } catch (error) {
    console.error('Error en listSublineas:', error);
    throw error;
  }
};

/**
 * Lista todas las líneas para el select
 */
export const listLineas = async (): Promise<LineaData[]> => {
  try {
    const { data, error } = await supabase
      .from('inv_lineas')
      .select('id, nombre')
      .eq('estado', 1)
      .order('nombre', { ascending: true });

    if (error) {
      console.error('Error al obtener líneas:', error);
      throw error;
    }

    return data as unknown as LineaData[];
  } catch (error) {
    console.error('Error en listLineas:', error);
    throw error;
  }
};

/**
 * Crea una nueva sublínea
 */
export const createSublinea = async (sublinea: SublineaData): Promise<SublineaData> => {
  try {
    const { data, error } = await supabase
      .from('inv_sublineas')
      .insert([sublinea])
      .select(`
        *,
        inv_lineas!id_linea (
          id,
          nombre
        )
      `)
      .single();

    if (error) {
      console.error('Error al crear sublínea:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error en createSublinea:', error);
    throw error;
  }
};

/**
 * Actualiza una sublínea existente
 */
export const updateSublinea = async (id: number, sublinea: Partial<SublineaData>): Promise<SublineaData> => {
  try {
    const { data, error } = await supabase
      .from('inv_sublineas')
      .update(sublinea)
      .eq('id', id)
      .select(`
        *,
        inv_lineas!id_linea (
          id,
          nombre
        )
      `)
      .single();

    if (error) {
      console.error('Error al actualizar sublínea:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error en updateSublinea:', error);
    throw error;
  }
};

/**
 * Activa una sublínea
 */
export const activateSublinea = async (id: number): Promise<void> => {
  try {
    const { error } = await supabase
      .from('inv_sublineas')
      .update({ estado: 1 })
      .eq('id', id);

    if (error) {
      console.error('Error al activar sublínea:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error en activateSublinea:', error);
    throw error;
  }
};

/**
 * Desactiva una sublínea
 */
export const deactivateSublinea = async (id: number): Promise<void> => {
  try {
    const { error } = await supabase
      .from('inv_sublineas')
      .update({ estado: 0 })
      .eq('id', id);

    if (error) {
      console.error('Error al desactivar sublínea:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error en deactivateSublinea:', error);
    throw error;
  }
};

/**
 * Elimina permanentemente una sublínea
 */
export const deleteSublineaPermanent = async (id: number): Promise<{ id: number; nombre: string }> => {
  try {
    console.log('🗑️ sublineasService: deleteSublineaPermanent llamado con:', id);

    // Primero obtener la sublínea para el retorno
    const { data: sublinea, error: fetchError } = await supabase
      .from('inv_sublineas')
      .select('id, nombre')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error al obtener sublínea:', fetchError);
      throw fetchError;
    }

    console.log('📋 Sublínea encontrada:', sublinea);

    // Intentar eliminación directa primero
    const { error: deleteError } = await supabase
      .from('inv_sublineas')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error al eliminar sublínea:', deleteError);
      throw deleteError;
    }

    console.log('✅ Sublínea eliminada exitosamente');
    return { id: sublinea.id, nombre: sublinea.nombre };
  } catch (error) {
    console.error('Error en deleteSublineaPermanent:', error);
    throw error;
  }
};

/**
 * Obtiene el siguiente código disponible para una nueva sublínea
 */
export const getNextCodigo = async (): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('inv_sublineas')
      .select('codigo')
      .order('id', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error al obtener siguiente código:', error);
      throw error;
    }

    if (data && data.length > 0) {
      const lastCode = data[0].codigo;
      const nextNumber = parseInt(lastCode) + 1;
      return nextNumber.toString().padStart(2, '0');
    }

    return '01';
  } catch (error) {
    console.error('Error en getNextCodigo:', error);
    throw error;
  }
};

export const sublineasService = {
  listSublineas,
  listLineas,
  createSublinea,
  updateSublinea,
  activateSublinea,
  deactivateSublinea,
  deleteSublineaPermanent,
  getNextCodigo,
};
