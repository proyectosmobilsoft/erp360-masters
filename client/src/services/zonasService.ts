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

export interface ZonaForm {
  codigo?: string;
  nombre: string;
  abreviatura?: string;
  no_ppl?: number;
  unidadServicioId: number;
  unidadesServicio: Array<{
    id_unidad_servicio: number;
    no_ppl: number;
  }>;
}

export interface UnidadServicioData {
  id?: number;
  codigo?: number;
  nombre_servicio: string;
  id_sucursal?: number;
  no_ppl?: number;
  activo?: boolean;
  created_at?: string;
  updated_at?: string;
  gen_sucursales?: {
    id: number;
    nombre: string;
    gen_municipios?: {
      id: number;
      nombre: string;
    } | null;
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
        id_sucursal,
        no_ppl,
        activo,
        created_at,
        updated_at,
        gen_sucursales (
          id,
          nombre,
          gen_municipios (
            id,
            nombre
          )
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
          id_sucursal,
          no_ppl,
          gen_sucursales (
            id,
            nombre,
            gen_municipios (
              id,
              nombre
            )
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
    
    const { data: newZona, error: userError } = await supabase
      .from('prod_zonas_contrato')
      .insert(zonaData)
      .select()
      .single();
    if (userError) throw userError;

    return newZona;
  },

  // Actualizar una zona
  async updateZona(id: number, zonaData: Partial<ZonaData>) {
    console.log("🔄 zonasService: updateZona llamado con:", { id, zonaData });
    
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
  },

  // Obtener el siguiente código disponible
  async getNextCodigo(): Promise<string> {
    const { data, error } = await supabase
      .from('prod_zonas_contrato')
      .select('codigo')
      .order('id', { ascending: false })
      .limit(1);

    if (error) {
      console.error('❌ Error obteniendo siguiente código:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      return '001'; // Primer código si no hay zonas
    }

    // Obtener el último código y incrementarlo
    const lastCodigo = data[0].codigo;
    const nextNumber = parseInt(lastCodigo) + 1;
    return nextNumber.toString().padStart(3, '0');
  }
};
