import { supabase } from './supabaseClient';

export interface LineaData {
  id?: number;
  codigo: string;
  nombre: string;
  id_categoria: number;
  estado?: number;
  inv_categorias?: {
    id: number;
    nombre: string;
  } | null;
}

export interface LineaForm {
  codigo?: string;
  nombre: string;
  id_categoria: number;
}

export interface CategoriaData {
  id: number;
  nombre: string;
  isreceta: number;
  requiere_empaques: number;
  estado: number;
  imgruta?: string;
}

export const lineasService = {
  // Listar todas las líneas
  async listLineas() {
    const { data, error } = await supabase
      .from('inv_lineas')
      .select(`
        id,
        codigo,
        nombre,
        id_categoria,
        estado,
        inv_categorias (
          id,
          nombre
        )
      `)
      .order('id', { ascending: false });
    if (error) throw error;
    return data as unknown as LineaData[];
  },

  // Listar todas las categorías
  async listCategorias() {
    const { data, error } = await supabase
      .from('inv_categorias')
      .select(`
        id,
        nombre,
        isreceta,
        requiere_empaques,
        estado,
        imgruta
      `)
      .eq('estado', 1)
      .order('nombre', { ascending: true });
    if (error) throw error;
    return data as CategoriaData[];
  },

  // Crear una nueva línea
  async createLinea(lineaData: LineaData) {
    console.log("➕ lineasService: createLinea llamado con:", lineaData);
    
    const { data: newLinea, error: userError } = await supabase
      .from('inv_lineas')
      .insert(lineaData)
      .select(`
        id,
        codigo,
        nombre,
        id_categoria,
        estado,
        inv_categorias (
          id,
          nombre
        )
      `)
      .single();
    if (userError) throw userError;

    return newLinea;
  },

  // Actualizar una línea
  async updateLinea(id: number, lineaData: Partial<LineaData>) {
    console.log("🔄 lineasService: updateLinea llamado con:", { id, lineaData });
    
    const { data: updatedLinea, error: userError } = await supabase
      .from('inv_lineas')
      .update(lineaData)
      .eq('id', id)
      .select(`
        id,
        codigo,
        nombre,
        id_categoria,
        estado,
        inv_categorias (
          id,
          nombre
        )
      `)
      .single();
    if (userError) throw userError;

    return updatedLinea;
  },

  // Eliminar una línea permanentemente
  async deleteLineaPermanent(id: number) {
    console.log("🗑️ lineasService: deleteLineaPermanent llamado con:", id);
    
    try {
      // Primero verificar si la línea existe
      const { data: linea, error: lineaQueryError } = await supabase
        .from('inv_lineas')
        .select('id, nombre, estado')
        .eq('id', id)
        .single();
      
      if (lineaQueryError) {
        console.error('Error obteniendo línea:', lineaQueryError);
        throw new Error(`No se encontró la línea con ID ${id}`);
      }
      
      console.log("📋 Línea encontrada:", linea);
      
      // Verificar que la línea esté inactiva antes de eliminar
      if (linea.estado === 1) {
        throw new Error('No se puede eliminar una línea activa. Primero debe desactivarla.');
      }
      
      // Verificar si hay referencias en otras tablas
      const { data: sublineasRef, error: sublineasError } = await supabase
        .from('inv_sublineas')
        .select('id')
        .eq('id_linea', id)
        .limit(1);

      if (sublineasError) {
        console.error('Error al verificar referencias en sublíneas:', sublineasError);
      } else if (sublineasRef && sublineasRef.length > 0) {
        throw new Error('No se puede eliminar la línea porque tiene sublíneas asociadas.');
      }

      // Intentar eliminar directamente
      const { error: deleteError } = await supabase
        .from('inv_lineas')
        .delete()
        .eq('id', id);
      
      if (deleteError) {
        console.error('Error eliminando línea directamente:', deleteError);
        throw new Error(`Error al eliminar la línea: ${deleteError.message}`);
      }
      
      console.log("✅ Línea eliminada exitosamente");
      return { id: linea.id, nombre: linea.nombre };
    } catch (error) {
      console.error('Error en deleteLineaPermanent:', error);
      throw error;
    }
  },

  // Activar una línea
  async activateLinea(id: number) {
    console.log("✅ lineasService: activateLinea llamado con:", id);
    
    const { data: updatedLinea, error } = await supabase
      .from('inv_lineas')
      .update({ estado: 1 })
      .eq('id', id)
      .select(`
        id,
        codigo,
        nombre,
        id_categoria,
        estado,
        inv_categorias (
          id,
          nombre
        )
      `)
      .single();
    if (error) throw error;

    return updatedLinea;
  },

  // Desactivar una línea
  async deactivateLinea(id: number) {
    console.log("❌ lineasService: deactivateLinea llamado con:", id);
    
    const { data: updatedLinea, error } = await supabase
      .from('inv_lineas')
      .update({ estado: 0 })
      .eq('id', id)
      .select(`
        id,
        codigo,
        nombre,
        id_categoria,
        estado,
        inv_categorias (
          id,
          nombre
        )
      `)
      .single();
    if (error) throw error;

    return updatedLinea;
  },

  // Obtener el siguiente código disponible
  async getNextCodigo(): Promise<string> {
    const { data, error } = await supabase
      .from('inv_lineas')
      .select('codigo')
      .order('id', { ascending: false })
      .limit(1);

    if (error) {
      console.error('❌ Error obteniendo siguiente código:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      return '01'; // Primer código si no hay líneas
    }

    // Obtener el último código y incrementarlo
    const lastCodigo = data[0].codigo;
    const nextNumber = parseInt(lastCodigo) + 1;
    return nextNumber.toString().padStart(2, '0');
  }
};
