import { supabase } from './supabaseClient';

export interface ClaseServicioData {
  id: number;
  nombre: string;
  orden: number;
  estado: number;
}

export interface ClaseServicioForm {
  id?: number;
  nombre: string;
  orden: number;
  estado?: number;
}

/**
 * Lista todas las clases de servicio activas
 */
export const listClaseServicios = async (): Promise<ClaseServicioData[]> => {
  try {
    const { data, error } = await supabase
      .from('inv_clase_servicios')
      .select('*')
      .eq('estado', 1)
      .order('orden', { ascending: true });

    if (error) {
      console.error('Error al obtener clases de servicio:', error);
      throw error;
    }

    return data as ClaseServicioData[];
  } catch (error) {
    console.error('Error en listClaseServicios:', error);
    throw error;
  }
};

/**
 * Crea una nueva clase de servicio
 */
export const createClaseServicio = async (claseServicio: ClaseServicioForm): Promise<ClaseServicioData> => {
  try {
    const { data, error } = await supabase
      .from('inv_clase_servicios')
      .insert([claseServicio])
      .select('*')
      .single();

    if (error) {
      console.error('Error al crear clase de servicio:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error en createClaseServicio:', error);
    throw error;
  }
};

/**
 * Actualiza una clase de servicio existente
 */
export const updateClaseServicio = async (id: number, claseServicio: Partial<ClaseServicioForm>): Promise<ClaseServicioData> => {
  try {
    const { data, error } = await supabase
      .from('inv_clase_servicios')
      .update(claseServicio)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Error al actualizar clase de servicio:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error en updateClaseServicio:', error);
    throw error;
  }
};

/**
 * Activa una clase de servicio
 */
export const activateClaseServicio = async (id: number): Promise<void> => {
  try {
    const { error } = await supabase
      .from('inv_clase_servicios')
      .update({ estado: 1 })
      .eq('id', id);

    if (error) {
      console.error('Error al activar clase de servicio:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error en activateClaseServicio:', error);
    throw error;
  }
};

/**
 * Desactiva una clase de servicio
 */
export const deactivateClaseServicio = async (id: number): Promise<void> => {
  try {
    const { error } = await supabase
      .from('inv_clase_servicios')
      .update({ estado: 0 })
      .eq('id', id);

    if (error) {
      console.error('Error al desactivar clase de servicio:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error en deactivateClaseServicio:', error);
    throw error;
  }
};

export const claseServiciosService = {
  listClaseServicios,
  createClaseServicio,
  updateClaseServicio,
  activateClaseServicio,
  deactivateClaseServicio,
};
