import { supabase } from './supabaseClient';

export interface Modulo {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ModuloPermiso {
  id: number;
  modulo_id: number;
  nombre: string;
  descripcion?: string;
  code: string;
  activo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ModuloConPermisos extends Modulo {
  gen_modulo_permisos: ModuloPermiso[];
}

export interface CreateModuloData {
  nombre: string;
  descripcion?: string;
}

export interface UpdateModuloData {
  nombre?: string;
  descripcion?: string;
}

export interface CreateModuloPermisoData {
  modulo_id: number;
  nombre: string;
  descripcion?: string;
  code: string;
}

export interface UpdateModuloPermisoData {
  nombre?: string;
  descripcion?: string;
  code?: string;
}

export const modulosService = {
  // Módulos
  async getModulos(): Promise<Modulo[]> {
    const { data, error } = await supabase
      .from('gen_modulos')
      .select('*')
      .order('nombre');
    
    if (error) throw error;
    return data || [];
  },

  async getModulo(id: number): Promise<Modulo> {
    const { data, error } = await supabase
      .from('gen_modulos')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async createModulo(moduloData: CreateModuloData): Promise<Modulo> {
    const { data, error } = await supabase
      .from('gen_modulos')
      .insert([{ ...moduloData, activo: true }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateModulo(id: number, moduloData: UpdateModuloData): Promise<Modulo> {
    const { data, error } = await supabase
      .from('gen_modulos')
      .update(moduloData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async activateModulo(id: number): Promise<void> {
    const { error } = await supabase
      .from('gen_modulos')
      .update({ activo: true })
      .eq('id', id);
    
    if (error) throw error;
  },

  async deactivateModulo(id: number): Promise<void> {
    const { error } = await supabase
      .from('gen_modulos')
      .update({ activo: false })
      .eq('id', id);
    
    if (error) throw error;
  },

  async deleteModulo(id: number): Promise<void> {
    // Primero eliminar todos los permisos asociados al módulo
    const { error: permisosError } = await supabase
      .from('gen_modulo_permisos')
      .delete()
      .eq('modulo_id', id);
    
    if (permisosError) throw permisosError;
    
    // Luego eliminar el módulo
    const { error: moduloError } = await supabase
      .from('gen_modulos')
      .delete()
      .eq('id', id);
    
    if (moduloError) throw moduloError;
  },

  // Módulos con permisos
  async getModulosConPermisos(): Promise<ModuloConPermisos[]> {
    const { data, error } = await supabase
      .from('gen_modulos')
      .select(`
        *,
        gen_modulo_permisos (
          id,
          nombre,
          descripcion,
          code,
          activo
        )
      `)
      .order('nombre');
    
    if (error) throw error;
    return data || [];
  },

  // Permisos
  async getPermisosByModulo(moduloId: number): Promise<ModuloPermiso[]> {
    const { data, error } = await supabase
      .from('gen_modulo_permisos')
      .select('*')
      .eq('modulo_id', moduloId)
      .order('nombre');
    
    if (error) throw error;
    return data || [];
  },

  async createModuloPermiso(permisoData: CreateModuloPermisoData): Promise<ModuloPermiso> {
    // Verificar si el código ya existe
    const { data: existingPermiso, error: checkError } = await supabase
      .from('gen_modulo_permisos')
      .select('id, code')
      .eq('code', permisoData.code)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw checkError;
    }
    
    if (existingPermiso) {
      throw new Error(`El código '${permisoData.code}' ya existe. Por favor, elige un código diferente.`);
    }
    
    const { data, error } = await supabase
      .from('gen_modulo_permisos')
      .insert([{ ...permisoData, activo: true }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateModuloPermiso(id: number, permisoData: UpdateModuloPermisoData): Promise<ModuloPermiso> {
    const { data, error } = await supabase
      .from('gen_modulo_permisos')
      .update(permisoData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteModuloPermiso(id: number): Promise<void> {
    const { error } = await supabase
      .from('gen_modulo_permisos')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
