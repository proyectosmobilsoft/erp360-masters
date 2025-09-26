import { supabase } from './supabaseClient';

export interface ProductoUnidadData {
  id?: number;
  id_producto: number;
  id_unidad_servicio: number;
  created_at?: string;
  updated_at?: string;
  unidad_servicio?: {
    id: number;
    codigo: number;
    nombre_servicio: string;
    id_sucursal: number;
    no_ppl: number;
    gen_sucursales?: {
      id: number;
      nombre: string;
      municipio?: {
        id: number;
        nombre: string;
      };
    };
  };
}

export const productoUnidadesService = {
  // Obtener todas las unidades de servicio asignadas a un producto
  async getUnidadesByProducto(idProducto: number): Promise<ProductoUnidadData[]> {
    const { data, error } = await supabase
      .from('inv_producto_by_unidades')
      .select(`
        id,
        id_producto,
        id_unidad_servicio,
        created_at,
        updated_at,
        unidad_servicio:prod_unidad_servicios!id_unidad_servicio (
          id,
          codigo,
          nombre_servicio,
          id_sucursal,
          no_ppl,
          gen_sucursales!id_sucursal (
            id,
            nombre,
            municipio:gen_municipios!id_municipio (
              id,
              nombre
            )
          )
        )
      `)
      .eq('id_producto', idProducto)
      .order('id', { ascending: true });

    if (error) throw error;
    return data as ProductoUnidadData[];
  },

  // Asignar una unidad de servicio a un producto
  async asignarUnidad(idProducto: number, idUnidadServicio: number): Promise<ProductoUnidadData> {
    const { data, error } = await supabase
      .from('inv_producto_by_unidades')
      .insert({
        id_producto: idProducto,
        id_unidad_servicio: idUnidadServicio
      })
      .select()
      .single();

    if (error) throw error;
    return data as ProductoUnidadData;
  },

  // Desasignar una unidad de servicio de un producto
  async desasignarUnidad(idProducto: number, idUnidadServicio: number): Promise<void> {
    const { error } = await supabase
      .from('inv_producto_by_unidades')
      .delete()
      .eq('id_producto', idProducto)
      .eq('id_unidad_servicio', idUnidadServicio);

    if (error) throw error;
  },

  // Eliminar todas las unidades asignadas a un producto
  async eliminarTodasLasUnidades(idProducto: number): Promise<void> {
    const { error } = await supabase
      .from('inv_producto_by_unidades')
      .delete()
      .eq('id_producto', idProducto);

    if (error) throw error;
  },

  // Sincronizar las unidades asignadas (eliminar todas y agregar las nuevas)
  async sincronizarUnidades(idProducto: number, idsUnidadesServicio: number[]): Promise<void> {
    // Primero eliminar todas las unidades existentes
    await this.eliminarTodasLasUnidades(idProducto);

    // Luego agregar las nuevas unidades
    if (idsUnidadesServicio.length > 0) {
      const unidadesParaInsertar = idsUnidadesServicio.map(idUnidad => ({
        id_producto: idProducto,
        id_unidad_servicio: idUnidad
      }));

      const { error } = await supabase
        .from('inv_producto_by_unidades')
        .insert(unidadesParaInsertar);

      if (error) throw error;
    }
  }
};
