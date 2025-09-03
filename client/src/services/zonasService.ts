import { supabase } from './supabaseClient';

export interface ZonaData {
  id?: number;
  codigo: string;
  nombre: string;
  abreviatura?: string;
  no_ppl?: number;
  activo?: boolean;
  created_at?: string;
  updated_at?: string;
}

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

export interface ZonaDetalleData {
  id?: number;
  id_zona: number;
  id_unidad_servicio: number;
  no_ppl?: number;
  created_at?: string;
  updated_at?: string;
  prod_unidad_servicios?: UnidadServicioData;
}

export const zonasService = {
  // Listar todas las zonas
  async listZonas() {
    const { data, error } = await supabase
      .from('prod_zonas_contrato')
      .select(`
        id,
        codigo,
        nombre,
        abreviatura,
        no_ppl,
        activo
      `)
      .order('id', { ascending: false });
    if (error) throw error;
    return data;
  },

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
      .eq('activo', true)
      .order('nombre_servicio', { ascending: true });
    if (error) throw error;
    return data as UnidadServicioData[];
  },

  // Obtener detalles de una zona
  async getZonaDetalles(idZona: number) {
    const { data, error } = await supabase
      .from('prod_zonas_detalle_contratos')
      .select(`
        id,
        id_zona,
        id_unidad_servicio,
        no_ppl,
        created_at,
        updated_at,
        prod_unidad_servicios (
          id,
          codigo,
          nombre_servicio,
          id_municipio,
          no_ppl,
          gen_municipios!id_municipio_FK (
            id,
            nombre
          )
        )
      `)
      .eq('id_zona', idZona);
    if (error) throw error;
    return data;
  },

  // Crear una nueva zona
  async createZona(zonaData: ZonaData) {
    console.log("➕ zonasService: createZona llamado con:", zonaData);
    
    // Validar código único
    const { data: existingZonas, error: checkError } = await supabase
      .from('prod_zonas_contrato')
      .select('id, codigo, nombre')
      .eq('codigo', zonaData.codigo);
    
    if (checkError) {
      console.error('❌ Error verificando código único:', checkError);
      throw new Error('Error verificando la unicidad del código');
    }
    
    if (existingZonas && existingZonas.length > 0) {
      console.error('❌ Código ya existe:', existingZonas);
      throw new Error(`El código '${zonaData.codigo}' ya está en uso por: ${existingZonas[0].nombre}`);
    }
    
    // Excluir el campo id para que se genere automáticamente
    const { id, ...zonaDataWithoutId } = zonaData;
    
    const { data: newZona, error: userError } = await supabase
      .from('prod_zonas_contrato')
      .insert(zonaDataWithoutId)
      .select()
      .single();
    if (userError) throw userError;

    return newZona;
  },

  // Actualizar una zona
  async updateZona(id: number, zonaData: Partial<ZonaData>) {
    console.log("🔄 zonasService: updateZona llamado con:", { id, zonaData });
    
    // Validar código único si se está actualizando
    if (zonaData.codigo) {
      const { data: existingZonas, error: checkError } = await supabase
        .from('prod_zonas_contrato')
        .select('id, codigo, nombre')
        .eq('codigo', zonaData.codigo)
        .neq('id', id);
      
      if (checkError) {
        console.error('❌ Error verificando código único:', checkError);
        throw new Error('Error verificando la unicidad del código');
      }
      
      if (existingZonas && existingZonas.length > 0) {
        console.error('❌ Código duplicado encontrado:', existingZonas);
        throw new Error(`El código '${zonaData.codigo}' ya está en uso por otra zona: ${existingZonas[0].nombre}`);
      }
    }
    
    const { data: updatedZona, error: userError } = await supabase
      .from('prod_zonas_contrato')
      .update(zonaData)
      .eq('id', id)
      .select()
      .single();
      
    if (userError) {
      console.error('❌ Error actualizando zona en BD:', userError);
      throw userError;
    }
    
    console.log('✅ Zona actualizada exitosamente:', updatedZona);
    return updatedZona;
  },

  // Inactivar una zona
  async deactivateZona(id: number) {
    const { data, error } = await supabase
      .from('prod_zonas_contrato')
      .update({ activo: false })
      .eq('id', id);
    if (error) throw error;
    return data;
  },
  
  // Activar una zona
  async activateZona(id: number) {
    const { data, error } = await supabase
      .from('prod_zonas_contrato')
      .update({ activo: true })
      .eq('id', id);
    if (error) throw error;
    return data;
  },

  // Eliminar una zona permanentemente
  async deleteZonaPermanent(id: number) {
    const { data, error } = await supabase
      .from('prod_zonas_contrato')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return data;
  },

  // Agregar unidad de servicio a una zona
  async addUnidadServicioToZona(idZona: number, idUnidadServicio: number, noPpl?: number) {
    const { data, error } = await supabase
      .from('prod_zonas_detalle_contratos')
      .insert({
        id_zona: idZona,
        id_unidad_servicio: idUnidadServicio,
        no_ppl: noPpl
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Remover unidad de servicio de una zona
  async removeUnidadServicioFromZona(idZona: number, idUnidadServicio: number) {
    const { data, error } = await supabase
      .from('prod_zonas_detalle_contratos')
      .delete()
      .eq('id_zona', idZona)
      .eq('id_unidad_servicio', idUnidadServicio);
    if (error) throw error;
    return data;
  },

  // Actualizar unidades de servicio de una zona
  async updateZonaUnidadesServicio(idZona: number, unidadesDetalle: Array<{
    id_unidad_servicio: number;
    no_ppl: number;
  }>) {
    console.log("🔄 Actualizando unidades de servicio para zona:", idZona, unidadesDetalle);
    
    // Primero, eliminar todas las unidades existentes
    const { error: deleteError } = await supabase
      .from('prod_zonas_detalle_contratos')
      .delete()
      .eq('id_zona', idZona);
    
    if (deleteError) {
      console.error('❌ Error eliminando unidades existentes:', deleteError);
      throw deleteError;
    }
    
    // Luego, insertar las nuevas unidades
    if (unidadesDetalle.length > 0) {
      const unidadesToInsert = unidadesDetalle.map(unidad => ({
        id_zona: idZona,
        id_unidad_servicio: unidad.id_unidad_servicio,
        no_ppl: unidad.no_ppl
      }));
      
      const { data, error: insertError } = await supabase
        .from('prod_zonas_detalle_contratos')
        .insert(unidadesToInsert)
        .select();
      
      if (insertError) {
        console.error('❌ Error insertando nuevas unidades:', insertError);
        throw insertError;
      }
      
      console.log('✅ Unidades de servicio actualizadas:', data);
      return data;
    }
    
    return [];
  }
};
