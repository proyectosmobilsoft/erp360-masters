import { supabase } from './supabaseClient';

export interface UnidadServicioData {
  id?: number;
  codigo?: number;
  nombre_servicio: string;
  id_municipio: number;
  no_ppl?: number;
  activo?: boolean;
  created_at?: string;
  updated_at?: string;
  gen_municipios?: {
    id: number;
    nombre: string;
  } | null;
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
        id_municipio,
        no_ppl,
        activo,
        created_at,
        updated_at,
        gen_municipios!id_municipio_FK (
          id,
          nombre
        )
      `)
      .order('id', { ascending: false });
    if (error) throw error;
    return data as UnidadServicioData[];
  },

  // Crear una nueva unidad de servicio
  async createUnidadServicio(unidadData: UnidadServicioData) {
    console.log("➕ unidadServiciosService: createUnidadServicio llamado con:", unidadData);
    
    // Validar código único si se proporciona
    if (unidadData.codigo) {
      const { data: existingUnidades, error: checkError } = await supabase
        .from('prod_unidad_servicios')
        .select('id, codigo, nombre_servicio')
        .eq('codigo', unidadData.codigo);
      
      if (checkError) {
        console.error('❌ Error verificando código único:', checkError);
        throw new Error('Error verificando la unicidad del código');
      }
      
      if (existingUnidades && existingUnidades.length > 0) {
        console.error('❌ Código ya existe:', existingUnidades);
        throw new Error(`El código '${unidadData.codigo}' ya está en uso por: ${existingUnidades[0].nombre_servicio}`);
      }
    }
    
    // Excluir el campo id para que se genere automáticamente
    const { id, ...unidadDataWithoutId } = unidadData;
    
    const { data: newUnidad, error: userError } = await supabase
      .from('prod_unidad_servicios')
      .insert(unidadDataWithoutId)
      .select()
      .single();
    if (userError) throw userError;

    return newUnidad;
  },

  // Actualizar una unidad de servicio
  async updateUnidadServicio(id: number, unidadData: Partial<UnidadServicioData>) {
    console.log("🔄 unidadServiciosService: updateUnidadServicio llamado con:", { id, unidadData });
    
    // Validar código único si se está actualizando
    if (unidadData.codigo) {
      const { data: existingUnidades, error: checkError } = await supabase
        .from('prod_unidad_servicios')
        .select('id, codigo, nombre_servicio')
        .eq('codigo', unidadData.codigo)
        .neq('id', id);
      
      if (checkError) {
        console.error('❌ Error verificando código único:', checkError);
        throw new Error('Error verificando la unicidad del código');
      }
      
      if (existingUnidades && existingUnidades.length > 0) {
        console.error('❌ Código duplicado encontrado:', existingUnidades);
        throw new Error(`El código '${unidadData.codigo}' ya está en uso por otra unidad: ${existingUnidades[0].nombre_servicio}`);
      }
    }
    
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
  }
};
