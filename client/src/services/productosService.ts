import { supabase } from './supabaseClient';

export interface ProductoData {
  id: number;
  codigo?: string;
  nombre: string;
  id_medida: number;
  id_tipo_producto: number;
  id_categoria: number;
  id_sublineas: number;
  id_interfaz_contable?: number;
  id_marca?: number;
  id_color?: number;
  referencia?: string;
  id_clase_servicio?: number;
  tipo_menu?: number;
  no_ciclo?: number;
  id_tipo_zona?: number;
  ultimo_costo?: number;
  id_proveedor?: number;
  frecuencia?: number;
  controla_existencia?: number;
  controla_lotes?: number;
  imgruta?: string;
  id_usuario?: number;
  fecsys?: string;
  estado: number;
  inv_medidas?: {
    id: number;
    nombre: string;
  };
  inv_categorias?: {
    id: number;
    nombre: string;
  };
  inv_sublineas?: {
    id: number;
    nombre: string;
  };
}

export interface ProductoForm {
  id?: number;
  codigo?: string;
  nombre: string;
  id_medida: number;
  id_tipo_producto: number;
  id_categoria: number;
  id_sublineas: number;
  id_interfaz_contable?: number;
  id_marca?: number;
  id_color?: number;
  referencia?: string;
  id_clase_servicio?: number;
  tipo_menu?: number;
  no_ciclo?: number;
  id_tipo_zona?: number;
  ultimo_costo?: number;
  id_proveedor?: number;
  frecuencia?: number;
  controla_existencia?: number;
  controla_lotes?: number;
  imgruta?: string;
  id_usuario?: number;
  estado?: number;
}

export interface MedidaData {
  id: number;
  nombre: string;
}

export interface CategoriaData {
  id: number;
  nombre: string;
}

export interface SublineaData {
  id: number;
  nombre: string;
}

/**
 * Lista todos los productos con información de medidas, categorías y sublíneas
 */
export const listProductos = async (): Promise<ProductoData[]> => {
  try {
    const { data, error } = await supabase
      .from('inv_productos')
      .select(`
        *,
        inv_medidas!id_medida (
          id,
          nombre
        ),
        inv_categorias!id_categoria (
          id,
          nombre
        ),
        inv_sublineas!id_sublineas (
          id,
          nombre
        )
      `)
      .order('id', { ascending: false });

    if (error) {
      console.error('Error al obtener productos:', error);
      throw error;
    }

    return data as unknown as ProductoData[];
  } catch (error) {
    console.error('Error en listProductos:', error);
    throw error;
  }
};

/**
 * Lista todas las medidas para el select
 */
export const listMedidas = async (): Promise<MedidaData[]> => {
  try {
    const { data, error } = await supabase
      .from('inv_medidas')
      .select('id, nombre')
      .eq('estado', 1)
      .order('nombre', { ascending: true });

    if (error) {
      console.error('Error al obtener medidas:', error);
      throw error;
    }

    return data as unknown as MedidaData[];
  } catch (error) {
    console.error('Error en listMedidas:', error);
    throw error;
  }
};

/**
 * Lista todas las categorías para el select
 */
export const listCategorias = async (): Promise<CategoriaData[]> => {
  try {
    const { data, error } = await supabase
      .from('inv_categorias')
      .select('id, nombre')
      .eq('estado', 1)
      .order('nombre', { ascending: true });

    if (error) {
      console.error('Error al obtener categorías:', error);
      throw error;
    }

    return data as unknown as CategoriaData[];
  } catch (error) {
    console.error('Error en listCategorias:', error);
    throw error;
  }
};

/**
 * Lista todas las sublíneas para el select
 */
export const listSublineas = async (): Promise<SublineaData[]> => {
  try {
    const { data, error } = await supabase
      .from('inv_sublineas')
      .select('id, nombre')
      .eq('estado', 1)
      .order('nombre', { ascending: true });

    if (error) {
      console.error('Error al obtener sublíneas:', error);
      throw error;
    }

    return data as unknown as SublineaData[];
  } catch (error) {
    console.error('Error en listSublineas:', error);
    throw error;
  }
};

/**
 * Crea un nuevo producto
 */
export const createProducto = async (producto: ProductoData): Promise<ProductoData> => {
  try {
    const { data, error } = await supabase
      .from('inv_productos')
      .insert([producto])
      .select(`
        *,
        inv_medidas!id_medida (
          id,
          nombre
        ),
        inv_categorias!id_categoria (
          id,
          nombre
        ),
        inv_sublineas!id_sublineas (
          id,
          nombre
        )
      `)
      .single();

    if (error) {
      console.error('Error al crear producto:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error en createProducto:', error);
    throw error;
  }
};

/**
 * Actualiza un producto existente
 */
export const updateProducto = async (id: number, producto: Partial<ProductoData>): Promise<ProductoData> => {
  try {
    const { data, error } = await supabase
      .from('inv_productos')
      .update(producto)
      .eq('id', id)
      .select(`
        *,
        inv_medidas!id_medida (
          id,
          nombre
        ),
        inv_categorias!id_categoria (
          id,
          nombre
        ),
        inv_sublineas!id_sublineas (
          id,
          nombre
        )
      `)
      .single();

    if (error) {
      console.error('Error al actualizar producto:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error en updateProducto:', error);
    throw error;
  }
};

/**
 * Activa un producto
 */
export const activateProducto = async (id: number): Promise<void> => {
  try {
    const { error } = await supabase
      .from('inv_productos')
      .update({ estado: 1 })
      .eq('id', id);

    if (error) {
      console.error('Error al activar producto:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error en activateProducto:', error);
    throw error;
  }
};

/**
 * Desactiva un producto
 */
export const deactivateProducto = async (id: number): Promise<void> => {
  try {
    const { error } = await supabase
      .from('inv_productos')
      .update({ estado: 0 })
      .eq('id', id);

    if (error) {
      console.error('Error al desactivar producto:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error en deactivateProducto:', error);
    throw error;
  }
};

/**
 * Elimina permanentemente un producto
 */
export const deleteProductoPermanent = async (id: number): Promise<{ id: number; nombre: string }> => {
  try {
    console.log('🗑️ productosService: deleteProductoPermanent llamado con:', id);

    // Primero obtener el producto para el retorno
    const { data: producto, error: fetchError } = await supabase
      .from('inv_productos')
      .select('id, nombre')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error al obtener producto:', fetchError);
      throw fetchError;
    }

    console.log('📋 Producto encontrado:', producto);

    // Intentar eliminación directa primero
    const { error: deleteError } = await supabase
      .from('inv_productos')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error al eliminar producto:', deleteError);
      throw deleteError;
    }

    console.log('✅ Producto eliminado exitosamente');
    return { id: producto.id, nombre: producto.nombre };
  } catch (error) {
    console.error('Error en deleteProductoPermanent:', error);
    throw error;
  }
};

/**
 * Obtiene el siguiente código disponible para un nuevo producto
 */
export const getNextCodigo = async (): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('inv_productos')
      .select('codigo')
      .order('id', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error al obtener siguiente código:', error);
      throw error;
    }

    if (data && data.length > 0) {
      const lastCode = data[0].codigo;
      // Si el código es numérico, incrementar
      if (lastCode && /^\d+$/.test(lastCode)) {
        const nextNumber = parseInt(lastCode) + 1;
        return nextNumber.toString().padStart(3, '0');
      }
      // Si es alfanumérico, generar secuencia
      return 'PROD' + (data.length + 1).toString().padStart(3, '0');
    }

    return 'PROD001';
  } catch (error) {
    console.error('Error en getNextCodigo:', error);
    throw error;
  }
};

export const productosService = {
  listProductos,
  listMedidas,
  listCategorias,
  listSublineas,
  createProducto,
  updateProducto,
  activateProducto,
  deactivateProducto,
  deleteProductoPermanent,
  getNextCodigo,
};
