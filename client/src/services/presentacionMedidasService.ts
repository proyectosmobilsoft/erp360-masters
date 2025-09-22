import { supabase } from './supabaseClient';

export interface PresentacionMedidaData {
  id: number;
  nombre: string;
  id_medida: number | null;
  estado: number;
  inv_medidas?: {
    id: number;
    nombre: string;
    abreviatura: string;
  };
}

export interface PresentacionMedidaForm {
  nombre: string;
  id_medida: number | null;
}

export const presentacionMedidasService = {
  // Obtener todas las presentaciones de medidas
  listPresentacionesMedidas: async (): Promise<PresentacionMedidaData[]> => {
    const { data, error } = await supabase
      .from('inv_presentacion_medidas')
      .select(`
        *,
        inv_medidas (
          id,
          nombre,
          abreviatura
        )
      `)
      .order('id', { ascending: true });

    if (error) {
      console.error('Error listing presentaciones medidas:', error);
      throw error;
    }
    return data;
  },

  // Crear nueva presentación de medida
  createPresentacionMedida: async (data: PresentacionMedidaForm): Promise<PresentacionMedidaData> => {
    const presentacionMedidaData = {
      nombre: data.nombre,
      id_medida: data.id_medida,
      estado: 1 // Activo por defecto
    };

    const { data: result, error } = await supabase
      .from('inv_presentacion_medidas')
      .insert([presentacionMedidaData])
      .select()
      .single();

    if (error) {
      console.error('Error creating presentacion medida:', error);
      throw error;
    }
    return result;
  },

  // Actualizar presentación de medida
  updatePresentacionMedida: async (id: number, data: PresentacionMedidaForm): Promise<PresentacionMedidaData> => {
    const { data: result, error } = await supabase
      .from('inv_presentacion_medidas')
      .update({
        nombre: data.nombre,
        id_medida: data.id_medida
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating presentacion medida:', error);
      throw error;
    }
    return result;
  },

  // Activar/Desactivar presentación de medida
  togglePresentacionMedidaStatus: async (id: number, estado: number): Promise<PresentacionMedidaData> => {
    const { data: result, error } = await supabase
      .from('inv_presentacion_medidas')
      .update({ estado })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error toggling presentacion medida status:', error);
      throw error;
    }
    return result;
  },

  // Eliminar permanentemente presentación de medida
  deletePresentacionMedidaPermanent: async (id: number): Promise<void> => {
    // Verificar si la presentación está activa
    const { data: presentacion, error: fetchError } = await supabase
      .from('inv_presentacion_medidas')
      .select('estado')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching presentacion medida:', fetchError);
      throw new Error('No se pudo verificar el estado de la presentación de medida');
    }

    if (presentacion.estado === 1) {
      throw new Error('No se puede eliminar una presentación de medida activa. Desactívela primero.');
    }

    // Eliminar directamente sin verificar referencias
    const { error } = await supabase
      .from('inv_presentacion_medidas')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting presentacion medida:', error);
      throw error;
    }
  }
};
