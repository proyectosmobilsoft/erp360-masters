import { supabase } from "./supabaseClient";

export interface ProductoUnidadData {
  id: number;
  id_producto: number;
  id_presentacion: number;
  factor: number;
  descripcion: string;
  estado: number;
  created_at?: string;
  updated_at?: string;
  // Relaciones
  inv_productos?: {
    id: number;
    nombre: string;
  };
  inv_presentacion_medidas?: {
    id: number;
    nombre: string;
  };
}

export interface ProductoUnidadForm {
  id_producto: number;
  id_presentacion: number;
  factor: number;
  descripcion: string;
  estado?: number;
}

export const productosUnidadesService = {
  // Obtener todas las unidades de productos
  async listProductosUnidades(): Promise<ProductoUnidadData[]> {
    const { data, error } = await supabase
      .from('inv_productos_unidades')
      .select(`
        *,
        inv_productos!fk_productos_unidades_producto (
          id,
          nombre
        ),
        inv_presentacion_medidas!fk_productos_unidades_presentacion (
          id,
          nombre
        )
      `)
      .order('id', { ascending: false });

    if (error) {
      console.error('Error al obtener unidades de productos:', error);
      throw error;
    }

    return data || [];
  },

  // Obtener unidades de productos por producto
  async getProductosUnidadesByProducto(idProducto: number): Promise<ProductoUnidadData[]> {
    const { data, error } = await supabase
      .from('inv_productos_unidades')
      .select(`
        *,
        inv_productos!fk_productos_unidades_producto (
          id,
          nombre
        ),
        inv_presentacion_medidas!fk_productos_unidades_presentacion (
          id,
          nombre
        )
      `)
      .eq('id_producto', idProducto)
      .eq('estado', 1)
      .order('id', { ascending: false });

    if (error) {
      console.error('Error al obtener unidades de productos por producto:', error);
      throw error;
    }

    return data || [];
  },

  // Crear nueva unidad de producto
  async createProductoUnidad(productoUnidad: ProductoUnidadForm): Promise<ProductoUnidadData> {
    const { data, error } = await supabase
      .from('inv_productos_unidades')
      .insert([{
        ...productoUnidad,
        estado: productoUnidad.estado || 1
      }])
      .select(`
        *,
        inv_productos!fk_productos_unidades_producto (
          id,
          nombre
        ),
        inv_presentacion_medidas!fk_productos_unidades_presentacion (
          id,
          nombre
        )
      `)
      .single();

    if (error) {
      console.error('Error al crear unidad de producto:', error);
      throw error;
    }

    return data;
  },

  // Actualizar unidad de producto
  async updateProductoUnidad(id: number, productoUnidad: Partial<ProductoUnidadForm>): Promise<ProductoUnidadData> {
    const { data, error } = await supabase
      .from('inv_productos_unidades')
      .update(productoUnidad)
      .eq('id', id)
      .select(`
        *,
        inv_productos!fk_productos_unidades_producto (
          id,
          nombre
        ),
        inv_presentacion_medidas!fk_productos_unidades_presentacion (
          id,
          nombre
        )
      `)
      .single();

    if (error) {
      console.error('Error al actualizar unidad de producto:', error);
      throw error;
    }

    return data;
  },

  // Desactivar unidad de producto (soft delete)
  async deactivateProductoUnidad(id: number): Promise<ProductoUnidadData> {
    const { data, error } = await supabase
      .from('inv_productos_unidades')
      .update({ estado: 0 })
      .eq('id', id)
      .select(`
        *,
        inv_productos!fk_productos_unidades_producto (
          id,
          nombre
        ),
        inv_presentacion_medidas!fk_productos_unidades_presentacion (
          id,
          nombre
        )
      `)
      .single();

    if (error) {
      console.error('Error al desactivar unidad de producto:', error);
      throw error;
    }

    return data;
  },

  // Activar unidad de producto
  async activateProductoUnidad(id: number): Promise<ProductoUnidadData> {
    const { data, error } = await supabase
      .from('inv_productos_unidades')
      .update({ estado: 1 })
      .eq('id', id)
      .select(`
        *,
        inv_productos!fk_productos_unidades_producto (
          id,
          nombre
        ),
        inv_presentacion_medidas!fk_productos_unidades_presentacion (
          id,
          nombre
        )
      `)
      .single();

    if (error) {
      console.error('Error al activar unidad de producto:', error);
      throw error;
    }

    return data;
  },

  // Eliminar unidad de producto permanentemente
  async deleteProductoUnidadPermanent(id: number): Promise<void> {
    const { error } = await supabase
      .from('inv_productos_unidades')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error al eliminar unidad de producto permanentemente:', error);
      throw error;
    }
  }
};
