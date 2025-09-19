import { supabase } from './supabaseClient';

export interface CategoriaData {
  id: number;
  nombre: string;
  isreceta: number;
  requiere_empaques: number;
  estado: number;
  imgruta?: string;
}

export interface CategoriaForm {
  id?: number;
  nombre: string;
  isreceta: number;
  requiere_empaques: number;
  estado?: number;
  imgruta?: string;
}

/**
 * Lista todas las categorías
 */
export const listCategorias = async (): Promise<CategoriaData[]> => {
  try {
    const { data, error } = await supabase
      .from('inv_categorias')
      .select('*')
      .order('id', { ascending: false });

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
 * Crea una nueva categoría
 */
export const createCategoria = async (categoria: CategoriaData): Promise<CategoriaData> => {
  try {
    const { data, error } = await supabase
      .from('inv_categorias')
      .insert([categoria])
      .select()
      .single();

    if (error) {
      console.error('Error al crear categoría:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error en createCategoria:', error);
    throw error;
  }
};

/**
 * Actualiza una categoría existente
 */
export const updateCategoria = async (id: number, categoria: Partial<CategoriaData>): Promise<CategoriaData> => {
  try {
    const { data, error } = await supabase
      .from('inv_categorias')
      .update(categoria)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error al actualizar categoría:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error en updateCategoria:', error);
    throw error;
  }
};

/**
 * Activa una categoría
 */
export const activateCategoria = async (id: number): Promise<void> => {
  try {
    const { error } = await supabase
      .from('inv_categorias')
      .update({ estado: 1 })
      .eq('id', id);

    if (error) {
      console.error('Error al activar categoría:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error en activateCategoria:', error);
    throw error;
  }
};

/**
 * Desactiva una categoría
 */
export const deactivateCategoria = async (id: number): Promise<void> => {
  try {
    const { error } = await supabase
      .from('inv_categorias')
      .update({ estado: 0 })
      .eq('id', id);

    if (error) {
      console.error('Error al desactivar categoría:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error en deactivateCategoria:', error);
    throw error;
  }
};

/**
 * Elimina permanentemente una categoría
 */
export const deleteCategoriaPermanent = async (id: number): Promise<{ id: number; nombre: string }> => {
  try {
    console.log('🗑️ categoriasService: deleteCategoriaPermanent llamado con:', id);

    // Primero obtener la categoría para el retorno
    const { data: categoria, error: fetchError } = await supabase
      .from('inv_categorias')
      .select('id, nombre')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error al obtener categoría:', fetchError);
      throw fetchError;
    }

    console.log('📋 Categoría encontrada:', categoria);

    // Intentar eliminación directa primero
    const { error: deleteError } = await supabase
      .from('inv_categorias')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error al eliminar categoría:', deleteError);
      throw deleteError;
    }

    console.log('✅ Categoría eliminada exitosamente');
    return { id: categoria.id, nombre: categoria.nombre };
  } catch (error) {
    console.error('Error en deleteCategoriaPermanent:', error);
    throw error;
  }
};

/**
 * Obtiene el siguiente código disponible para una nueva categoría
 */
export const getNextCodigo = async (): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('inv_categorias')
      .select('id')
      .order('id', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error al obtener siguiente código:', error);
      throw error;
    }

    const nextId = data && data.length > 0 ? data[0].id + 1 : 1;
    return nextId;
  } catch (error) {
    console.error('Error en getNextCodigo:', error);
    throw error;
  }
};

export const categoriasService = {
  listCategorias,
  createCategoria,
  updateCategoria,
  activateCategoria,
  deactivateCategoria,
  deleteCategoriaPermanent,
  getNextCodigo,
};
