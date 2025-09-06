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
        .select('id, nombre')
        .eq('id', id)
        .single();
      
      if (lineaQueryError) {
        console.error('Error obteniendo línea:', lineaQueryError);
        throw new Error(`No se encontró la línea con ID ${id}`);
      }
      
      console.log("📋 Línea encontrada:", linea);
      
      // Intentar eliminar directamente primero
      const { error: deleteError } = await supabase
        .from('inv_lineas')
        .delete()
        .eq('id', id);
      
      if (deleteError) {
        console.error('Error eliminando línea directamente:', deleteError);
        
        // Si hay error de FK, intentar eliminación en cascada
        if (deleteError.code === "23503" || deleteError.message?.includes("foreign key constraint")) {
          console.log("🔄 Intentando eliminación en cascada...");
          
          // Obtener las sublíneas relacionadas
          const { data: sublineas, error: sublineasQueryError } = await supabase
            .from('inv_sublineas')
            .select('id, nombre')
            .eq('id_linea', id);
          
          if (sublineasQueryError) {
            console.error('Error obteniendo sublíneas:', sublineasQueryError);
            throw sublineasQueryError;
          }
          
          // Si hay sublíneas, eliminar los productos relacionados primero
          if (sublineas && sublineas.length > 0) {
            const sublineaIds = sublineas.map(s => s.id);
            
            console.log(`📦 Eliminando productos de ${sublineas.length} sublíneas`);
            
            // Eliminar productos relacionados
            const { error: productosError } = await supabase
              .from('inv_productos')
              .delete()
              .in('id_sublineas', sublineaIds);
            
            if (productosError) {
              console.error('Error eliminando productos:', productosError);
              throw new Error(`No se pudieron eliminar los productos relacionados: ${productosError.message}`);
            }
            
            console.log(`📋 Eliminando ${sublineas.length} sublíneas relacionadas`);
            
            // Eliminar sublíneas
            const { error: sublineasError } = await supabase
              .from('inv_sublineas')
              .delete()
              .eq('id_linea', id);
            
            if (sublineasError) {
              console.error('Error eliminando sublíneas:', sublineasError);
              throw new Error(`No se pudieron eliminar las sublíneas relacionadas: ${sublineasError.message}`);
            }
          }
          
          // Intentar eliminar la línea nuevamente
          const { error: retryDeleteError } = await supabase
            .from('inv_lineas')
            .delete()
            .eq('id', id);
          
          if (retryDeleteError) {
            console.error('Error en segundo intento de eliminación:', retryDeleteError);
            throw new Error(`No se pudo eliminar la línea después de limpiar dependencias: ${retryDeleteError.message}`);
          }
        } else {
          throw new Error(`No se pudo eliminar la línea: ${deleteError.message}`);
        }
      }
      
      console.log("✅ Línea eliminada exitosamente");
      return { id, nombre: linea.nombre };
    } catch (error: any) {
      console.error("❌ Error en eliminación:", error);
      
      // Crear un error más descriptivo
      const errorMessage = error.message || "Error desconocido al eliminar la línea";
      const enhancedError = new Error(errorMessage) as any;
      enhancedError.code = error.code;
      
      throw enhancedError;
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
