import { supabase } from './supabaseClient';

export interface BodegaData {
  id?: number;
  codigo: string;
  nombre: string;
  id_unidad: number;
  tipo_bodega: number; // 0: Almacenaje, 1: Cocina Interna
  estado: number;
  created_at?: string;
  updated_at?: string;
  // Campos relacionados
  unidad_nombre?: string;
}

export interface BodegaForm {
  codigo?: string;
  nombre: string;
  id_unidad: number;
  tipo_bodega: number; // 0: Almacenaje, 1: Cocina Interna
  estado: number;
}

export interface BodegaUnidadData {
  id: number;
  codigo: string;
  nombre: string;
  tipo_bodega: number;
  estado: number;
}

export const bodegasService = {
  // Listar todas las bodegas
  async listBodegas(): Promise<BodegaData[]> {
    const { data, error } = await supabase
      .rpc('get_bodegas_with_relations');

    if (error) {
      console.error('❌ Error listando bodegas:', error);
      throw error;
    }

    return (data as BodegaData[]) || [];
  },

  // Crear nueva bodega
  async createBodega(bodegaData: Omit<BodegaForm, 'codigo'>): Promise<BodegaData> {
    const { data, error } = await supabase
      .from('gen_bodegas')
      .insert([bodegaData])
      .select(`
        id,
        codigo,
        nombre,
        id_unidad,
        tipo_bodega,
        estado,
        created_at,
        updated_at
      `)
      .single();

    if (error) {
      console.error('❌ Error creando bodega:', error);
      throw error;
    }

    // Obtener la bodega creada con sus relaciones
    const bodegaWithRelations = await this.getBodegaById(data.id);
    return bodegaWithRelations || data;
  },

  // Actualizar bodega
  async updateBodega(id: number, bodegaData: Partial<BodegaForm>): Promise<BodegaData> {
    const { data, error } = await supabase
      .from('gen_bodegas')
      .update(bodegaData)
      .eq('id', id)
      .select(`
        id,
        codigo,
        nombre,
        id_unidad,
        tipo_bodega,
        estado,
        created_at,
        updated_at
      `)
      .single();

    if (error) {
      console.error('❌ Error actualizando bodega:', error);
      throw error;
    }

    // Obtener la bodega actualizada con sus relaciones
    const bodegaWithRelations = await this.getBodegaById(data.id);
    return bodegaWithRelations || data;
  },

  // Activar bodega
  async activateBodega(id: number): Promise<BodegaData> {
    return this.updateBodega(id, { estado: 1 });
  },

  // Desactivar bodega
  async deactivateBodega(id: number): Promise<BodegaData> {
    return this.updateBodega(id, { estado: 0 });
  },

  // Eliminar bodega permanentemente
  async deleteBodegaPermanent(id: number): Promise<void> {
    console.log('🗑️ Servicio: Eliminando bodega ID:', id);
    const { error } = await supabase
      .from('gen_bodegas')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Error eliminando bodega:', error);
      throw error;
    }
    console.log('✅ Servicio: Bodega eliminada exitosamente');
  },

  // Obtener bodega por ID
  async getBodegaById(id: number): Promise<BodegaData | null> {
    const { data, error } = await supabase
      .rpc('get_bodegas_with_relations')
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ Error obteniendo bodega:', error);
      throw error;
    }

    return data as BodegaData | null;
  },

  // Obtener bodegas por unidad de servicio
  async getBodegasByUnidad(unidadId: number): Promise<BodegaUnidadData[]> {
    const { data, error } = await supabase
      .rpc('get_bodegas_by_unidad', { unidad_id: unidadId });

    if (error) {
      console.error('❌ Error obteniendo bodegas por unidad:', error);
      throw error;
    }

    return (data as BodegaUnidadData[]) || [];
  },

  // Obtener el siguiente código disponible
  async getNextCodigo(): Promise<string> {
    const { data, error } = await supabase
      .from('gen_bodegas')
      .select('codigo')
      .order('codigo', { ascending: false })
      .limit(1);

    if (error) {
      console.error('❌ Error obteniendo siguiente código:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      return '001'; // Primer código si no hay bodegas
    }

    // Obtener el último código y incrementarlo
    const lastCodigo = data[0].codigo;
    const nextNumber = parseInt(lastCodigo) + 1;
    return nextNumber.toString().padStart(3, '0');
  }
};
