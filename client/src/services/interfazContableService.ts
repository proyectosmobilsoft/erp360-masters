import { supabase } from './supabaseClient';

export interface InterfazContableData {
  id: number;
  codigo: string;
  nombre: string;
  clase: number;
  tasa_iva: number;
  tasa_retencion: number;
  base_retencion: number;
  id_usuario: number;
  estado: number;
}

export interface InterfazContableForm {
  codigo: string;
  nombre: string;
  clase: number;
  tasa_iva: number;
  tasa_retencion: number;
  base_retencion: number;
  id_usuario: number;
  estado: number;
}

export const interfazContableService = {
  // Obtener todas las interfaces contables
  async listInterfacesContables(): Promise<InterfazContableData[]> {
    const { data, error } = await supabase
      .from('inv_interfaz_contable')
      .select('*')
      .eq('estado', 1)
      .order('nombre');

    if (error) {
      console.error('Error fetching interfaces contables:', error);
      throw error;
    }

    return data || [];
  },

  // Obtener una interfaz contable por ID
  async getInterfazContable(id: number): Promise<InterfazContableData | null> {
    const { data, error } = await supabase
      .from('inv_interfaz_contable')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching interfaz contable:', error);
      return null;
    }

    return data;
  },

  // Crear nueva interfaz contable
  async createInterfazContable(interfazData: InterfazContableForm): Promise<InterfazContableData> {
    const { data, error } = await supabase
      .from('inv_interfaz_contable')
      .insert([interfazData])
      .select()
      .single();

    if (error) {
      console.error('Error creating interfaz contable:', error);
      throw error;
    }

    return data;
  },

  // Actualizar interfaz contable
  async updateInterfazContable(id: number, interfazData: Partial<InterfazContableForm>): Promise<InterfazContableData> {
    const { data, error } = await supabase
      .from('inv_interfaz_contable')
      .update(interfazData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating interfaz contable:', error);
      throw error;
    }

    return data;
  },

  // Desactivar interfaz contable
  async deactivateInterfazContable(id: number): Promise<void> {
    const { error } = await supabase
      .from('inv_interfaz_contable')
      .update({ estado: 0 })
      .eq('id', id);

    if (error) {
      console.error('Error deactivating interfaz contable:', error);
      throw error;
    }
  },

  // Activar interfaz contable
  async activateInterfazContable(id: number): Promise<void> {
    const { error } = await supabase
      .from('inv_interfaz_contable')
      .update({ estado: 1 })
      .eq('id', id);

    if (error) {
      console.error('Error activating interfaz contable:', error);
      throw error;
    }
  },

  // Eliminar interfaz contable permanentemente
  async deleteInterfazContablePermanent(id: number): Promise<void> {
    const { error } = await supabase
      .from('inv_interfaz_contable')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting interfaz contable:', error);
      throw error;
    }
  }
};
