import { supabase } from './supabaseClient';

export interface TipoData {
  id?: number;
  codigo: string;
  nombre: string;
  estado?: number;
  es_receta: boolean;
}

export interface TipoForm {
  codigo?: string;
  nombre: string;
  es_receta: boolean;
}

export const tiposService = {
  // Listar todos los tipos
  async listTipos() {
    const { data, error } = await supabase
      .from('inv_tipo_producto')
      .select(`
        id,
        codigo,
        nombre,
        estado,
        es_receta
      `)
      .order('id', { ascending: false });
    if (error) throw error;
    return data as unknown as TipoData[];
  },

  // Crear una nueva tipo
  async createTipo(tipoData: Omit<TipoData, 'id'>) {
    const { data, error } = await supabase
      .from('inv_tipo_producto')
      .insert([tipoData])
      .select()
      .single();
    if (error) throw error;
    return data as TipoData;
  },

  // Actualizar una tipo
  async updateTipo(id: number, updates: Partial<TipoData>) {
    const { data, error } = await supabase
      .from('inv_tipo_producto')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as TipoData;
  },

  // Activar una tipo
  async activateTipo(id: number) {
    const { data, error } = await supabase
      .from('inv_tipo_producto')
      .update({ estado: 1 })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as TipoData;
  },

  // Desactivar una tipo
  async deactivateTipo(id: number) {
    const { data, error } = await supabase
      .from('inv_tipo_producto')
      .update({ estado: 0 })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as TipoData;
  },

  // Eliminar una tipo permanentemente
  async deleteTipoPermanent(id: number) {
    console.log("🗑️ tiposService: deleteTipoPermanent llamado con:", id);
    
    try {
      // Primero verificar si el tipo existe
      const { data: tipo, error: tipoQueryError } = await supabase
        .from('inv_tipo_producto')
        .select('id, nombre, estado')
        .eq('id', id)
        .single();
      
      if (tipoQueryError) {
        console.error('Error obteniendo tipo:', tipoQueryError);
        throw new Error(`No se encontró el tipo con ID ${id}`);
      }
      
      console.log("📋 Tipo encontrado:", tipo);
      
      // Verificar que el tipo esté inactivo antes de eliminar
      if (tipo.estado === 1) {
        throw new Error('No se puede eliminar un tipo activo. Primero debe desactivarlo.');
      }
      
      // Verificar si hay referencias en otras tablas
      const { data: productosRef, error: productosError } = await supabase
        .from('inv_productos')
        .select('id')
        .eq('id_tipo_producto', id)
        .limit(1);

      if (productosError) {
        console.error('Error al verificar referencias en productos:', productosError);
      } else if (productosRef && productosRef.length > 0) {
        throw new Error('No se puede eliminar el tipo porque tiene productos asociados.');
      }

      // Intentar eliminar directamente
      const { error: deleteError } = await supabase
        .from('inv_tipo_producto')
        .delete()
        .eq('id', id);
      
      if (deleteError) {
        console.error('Error eliminando tipo directamente:', deleteError);
        throw new Error(`Error al eliminar el tipo: ${deleteError.message}`);
      }
      
      console.log("✅ Tipo eliminado exitosamente");
      return { id: tipo.id, nombre: tipo.nombre };
    } catch (error) {
      console.error('Error en deleteTipoPermanent:', error);
      throw error;
    }
  },

  // Obtener el siguiente código disponible para una nueva tipo
  async getNextCodigo(): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('inv_tipo_producto')
        .select('codigo')
        .order('codigo', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error obteniendo siguiente código:', error);
        return "01"; // Código por defecto si hay error
      }

      if (!data || data.length === 0) {
        return "01"; // Primer código si no hay registros
      }

      const lastCodigo = data[0].codigo;
      const nextNumber = parseInt(lastCodigo) + 1;
      return nextNumber.toString().padStart(2, '0');
    } catch (error) {
      console.error('Error en getNextCodigo:', error);
      return "01";
    }
  }
};

// Exportar las funciones individualmente para compatibilidad
export const {
  listTipos,
  createTipo,
  updateTipo,
  activateTipo,
  deactivateTipo,
  deleteTipoPermanent,
  getNextCodigo
} = tiposService;
