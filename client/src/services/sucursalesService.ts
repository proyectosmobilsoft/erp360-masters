import { supabase } from './supabaseClient';

export interface SucursalData {
  id?: number;
  codigo: string;
  nombre: string;
  id_empresa: number;
  id_municipio: number;
  estado: number;
  tipo_control_fecha?: string;
  created_at?: string;
  updated_at?: string;
  // Campos relacionados
  gen_empresa?: {
    id: number;
    nombre: string;
    documento_empresa: string;
  };
  gen_municipios?: {
    id: number;
    nombre: string;
  };
}

export interface SucursalForm {
  codigo: string;
  nombre: string;
  id_empresa: number;
  id_municipio: number;
  estado: number;
}

export const sucursalesService = {
  // Listar todas las sucursales
  async listSucursales(): Promise<SucursalData[]> {
    const { data, error } = await supabase
      .from('gen_sucursales')
      .select(`
        id,
        codigo,
        nombre,
        id_empresa,
        id_municipio,
        estado,
        tipo_control_fecha,
        created_at,
        updated_at,
        gen_empresa!id_empresa (
          id,
          nombre,
          documento_empresa
        ),
        gen_municipios!id_municipio (
          id,
          nombre
        )
      `)
      .order('nombre', { ascending: true });

    if (error) {
      console.error('❌ Error listando sucursales:', error);
      throw error;
    }

    return data || [];
  },

  // Crear nueva sucursal
  async createSucursal(sucursalData: SucursalForm): Promise<SucursalData> {
    const { data, error } = await supabase
      .from('gen_sucursales')
      .insert([sucursalData])
      .select(`
        id,
        codigo,
        nombre,
        id_empresa,
        id_municipio,
        estado,
        tipo_control_fecha,
        created_at,
        updated_at,
        gen_empresa!id_empresa (
          id,
          nombre,
          documento_empresa
        ),
        gen_municipios!id_municipio (
          id,
          nombre
        )
      `)
      .single();

    if (error) {
      console.error('❌ Error creando sucursal:', error);
      throw error;
    }

    return data;
  },

  // Actualizar sucursal
  async updateSucursal(id: number, sucursalData: Partial<SucursalForm>): Promise<SucursalData> {
    const { data, error } = await supabase
      .from('gen_sucursales')
      .update(sucursalData)
      .eq('id', id)
      .select(`
        id,
        codigo,
        nombre,
        id_empresa,
        id_municipio,
        estado,
        tipo_control_fecha,
        created_at,
        updated_at,
        gen_empresa!id_empresa (
          id,
          nombre,
          documento_empresa
        ),
        gen_municipios!id_municipio (
          id,
          nombre
        )
      `)
      .single();

    if (error) {
      console.error('❌ Error actualizando sucursal:', error);
      throw error;
    }

    return data;
  },

  // Activar sucursal
  async activateSucursal(id: number): Promise<SucursalData> {
    return this.updateSucursal(id, { estado: 1 });
  },

  // Desactivar sucursal
  async deactivateSucursal(id: number): Promise<SucursalData> {
    return this.updateSucursal(id, { estado: 0 });
  },

  // Eliminar sucursal permanentemente
  async deleteSucursalPermanent(id: number): Promise<void> {
    console.log('🗑️ Servicio: Eliminando sucursal ID:', id);
    const { error } = await supabase
      .from('gen_sucursales')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Error eliminando sucursal:', error);
      throw error;
    }
    console.log('✅ Servicio: Sucursal eliminada exitosamente');
  },

  // Obtener sucursal por ID
  async getSucursalById(id: number): Promise<SucursalData | null> {
    const { data, error } = await supabase
      .from('gen_sucursales')
      .select(`
        id,
        codigo,
        nombre,
        id_empresa,
        id_municipio,
        estado,
        tipo_control_fecha,
        created_at,
        updated_at,
        gen_empresa!id_empresa (
          id,
          nombre,
          documento_empresa
        ),
        gen_municipios!id_municipio (
          id,
          nombre
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ Error obteniendo sucursal:', error);
      throw error;
    }

    return data;
  }
};
