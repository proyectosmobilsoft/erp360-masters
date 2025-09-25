import { supabase } from './supabaseClient';

export interface UnidadServicioData {
  id?: number;
  codigo?: number;
  nombre_servicio: string;
  id_sucursal: number;
  no_ppl?: number;
  activo?: boolean;
  created_at?: string;
  updated_at?: string;
  gen_sucursales?: {
    id: number;
    nombre: string;
  } | null;
  municipio?: {
    id: number;
    nombre: string;
  } | null;
}

export interface UnidadServicioForm {
  codigo?: string;
  nombre_servicio: string;
  id_sucursal: number;
  no_ppl: number;
}

export const unidadServiciosService = {
  // Listar todas las unidades de servicio
  async listUnidadesServicio() {
    const { data, error } = await supabase
      .from('prod_unidad_servicios')
      .select(`
        id,
        codigo,
        nombre_servicio,
        id_sucursal,
        no_ppl,
        activo,
        created_at,
        updated_at,
        gen_sucursales!id_sucursal (
          id,
          nombre,
          municipio:gen_municipios!id_municipio (
            id,
            nombre
          )
        )
      `)
      .order('id', { ascending: false });
    if (error) throw error;
    return data as UnidadServicioData[];
  },

  // Crear una nueva unidad de servicio
  async createUnidadServicio(unidadData: UnidadServicioData) {
    console.log("➕ unidadServiciosService: createUnidadServicio llamado con:", unidadData);
    
    const { data: newUnidad, error: userError } = await supabase
      .from('prod_unidad_servicios')
      .insert(unidadData)
      .select()
      .single();
    if (userError) throw userError;

    return newUnidad;
  },

  // Actualizar una unidad de servicio
  async updateUnidadServicio(id: number, unidadData: Partial<UnidadServicioData>) {
    console.log("🔄 unidadServiciosService: updateUnidadServicio llamado con:", { id, unidadData });
    
    const { data: updatedUnidad, error: userError } = await supabase
      .from('prod_unidad_servicios')
      .update(unidadData)
      .eq('id', id)
      .select()
      .single();
      
    if (userError) {
      console.error('❌ Error actualizando unidad de servicio en BD:', userError);
      throw userError;
    }
    
    console.log('✅ Unidad de servicio actualizada exitosamente:', updatedUnidad);
    return updatedUnidad;
  },

  // Inactivar una unidad de servicio
  async deactivateUnidadServicio(id: number) {
    const { data, error } = await supabase
      .from('prod_unidad_servicios')
      .update({ activo: false })
      .eq('id', id);
    if (error) throw error;
    return data;
  },
  
  // Activar una unidad de servicio
  async activateUnidadServicio(id: number) {
    const { data, error } = await supabase
      .from('prod_unidad_servicios')
      .update({ activo: true })
      .eq('id', id);
    if (error) throw error;
    return data;
  },

  // Eliminar una unidad de servicio permanentemente
  async deleteUnidadServicioPermanent(id: number) {
    const { data, error } = await supabase
      .from('prod_unidad_servicios')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return data;
  },

  // Obtener el siguiente código disponible
  async getNextCodigo(): Promise<string> {
    const { data, error } = await supabase
      .from('prod_unidad_servicios')
      .select('codigo')
      .order('codigo', { ascending: false })
      .limit(1);

    if (error) {
      console.error('❌ Error obteniendo siguiente código:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      return '001'; // Primer código si no hay unidades
    }

    // Obtener el último código y incrementarlo
    const lastCodigo = data[0].codigo;
    const nextNumber = parseInt(lastCodigo.toString()) + 1;
    return nextNumber.toString().padStart(3, '0');
  }
};
