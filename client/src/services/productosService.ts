import { supabase } from './supabaseClient';

export interface EmpaqueAsociado {
  id?: number;
  id_presentacion: number;
  factor: number;
  descripcion: string;
}

export interface IngredienteDetalle {
  id?: number;
  id_maestro_producto: number;
  id_producto: number;
  id_medida: number;
  cantidad: number;
  costo?: number;
  estado: number;
}

export interface UtilidadProducto {
  id?: number;
  id_producto: number;
  id_indicie_dificultad: number;
  tasa_perdida: number;
  tasa_utilidad: number;
  tiempo_preparacion: string;
  nota: string;
  estado: number;
}

// Función auxiliar para verificar si un tipo de producto es receta
const getTipoProductoEsReceta = async (idTipoProducto: number): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('inv_tipo_producto')
      .select('es_receta')
      .eq('id', idTipoProducto)
      .single();
    
    if (error) {
      console.error('Error obteniendo tipo de producto:', error);
      return false;
    }
    
    return data?.es_receta || false;
  } catch (error) {
    console.error('Error en getTipoProductoEsReceta:', error);
    return false;
  }
};

// Función auxiliar para guardar empaques de un producto
const saveProductoEmpaques = async (idProducto: number, empaques: EmpaqueAsociado[]) => {
  if (!empaques || empaques.length === 0) return;

  // Primero eliminar empaques existentes
  await supabase
    .from('inv_productos_unidades')
    .delete()
    .eq('id_producto', idProducto);

  // Insertar nuevos empaques
  const empaquesData = empaques.map(empaque => ({
    id_producto: idProducto,
    id_presentacion: empaque.id_presentacion,
    factor: empaque.factor,
    descripcion: empaque.descripcion,
    estado: 1
  }));

  const { error } = await supabase
    .from('inv_productos_unidades')
    .insert(empaquesData);

  if (error) {
    console.error('Error al guardar empaques:', error);
    throw error;
  }
};

export interface ProductoData {
  id: number;
  codigo?: string;
  nombre: string;
  id_medida: number | null;
  id_tipo_producto: number;
  id_categoria: number;
  id_sublineas: number;
  id_interfaz_contable?: number;
  id_marca?: number;
  id_color?: number;
  referencia?: string;
  id_clase_servicio?: number;
  tipo_menu?: string;
  no_ciclo?: number;
  ultimo_costo?: number;
  id_proveedor?: number;
  frecuencia?: string;
  controla_existencia?: number;
  controla_lotes?: number;
  imgbase64?: string;
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
    id_linea: number;
    inv_lineas?: {
      id: number;
      nombre: string;
    };
  };
}

export interface ProductoForm {
  id?: number;
  codigo?: string;
  nombre: string;
  id_medida: number | null;
  id_tipo_producto: number;
  id_categoria: number;
  id_linea?: number; // Campo temporal para manejar dependencias
  id_sublineas: number;
  id_interfaz_contable?: number;
  id_marca?: number;
  id_color?: number;
  referencia?: string;
  id_clase_servicio?: number;
  tipo_menu?: string;
  no_ciclo?: number;
  ultimo_costo?: number;
  id_proveedor?: number;
  frecuencia?: string;
  controla_existencia?: number;
  controla_lotes?: number;
  imgbase64?: string;
  id_usuario?: number;
  fecsys?: string;
  estado?: number;
  empaques?: EmpaqueAsociado[];
}

export interface MedidaData {
  id: number;
  nombre: string;
}

export interface CategoriaData {
  id: number;
  nombre: string;
  isreceta?: number;
}

export interface SublineaData {
  id: number;
  nombre: string;
}

/**
 * Lista todos los productos con información de medidas, categorías y sublíneas
 */
export const listProductos = async (soloRecetas?: boolean): Promise<ProductoData[]> => {
  try {
    console.log('🔍 listProductos llamado con soloRecetas:', soloRecetas);
    
    // Obtener todos los productos con sus relaciones
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
          nombre,
          isreceta
        ),
        inv_sublineas!id_sublineas (
          id,
          nombre,
          id_linea,
          inv_lineas!id_linea (
            id,
            nombre
          )
        )
      `)
      .order('id', { ascending: false });

    if (error) {
      console.error('Error al obtener productos:', error);
      throw error;
    }

    console.log('📊 Productos obtenidos antes del filtro:', data?.length || 0);

    // Aplicar filtro en el frontend si se solicita
    let productosFiltrados = data as unknown as ProductoData[];
    
    if (soloRecetas) {
      console.log('🎯 Aplicando filtro de recetas en frontend');
      productosFiltrados = productosFiltrados.filter(producto => {
        const esReceta = (producto.inv_categorias as any)?.isreceta === 1;
        console.log(`Producto ${producto.nombre}: esReceta = ${esReceta}`);
        return esReceta;
      });
    }

    console.log('📊 Productos después del filtro:', productosFiltrados.length);
    return productosFiltrados;
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
 * Lista las medidas principales para el select de unidades
 */
export const listMedidasPrincipales = async (): Promise<MedidaData[]> => {
  try {
    const { data, error } = await supabase
      .from('inv_medidas')
      .select('id, nombre, abreviatura')
      .eq('estado', 1)
      .eq('medida_principal', true)
      .order('nombre', { ascending: true });

    if (error) {
      console.error('Error al obtener medidas principales:', error);
      throw error;
    }

    return data as unknown as MedidaData[];
  } catch (error) {
    console.error('Error en listMedidasPrincipales:', error);
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
      .select('id, nombre, isreceta')
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
export const createProducto = async (producto: Omit<ProductoData, 'id'> & { empaques?: EmpaqueAsociado[]; ingredientes?: IngredienteDetalle[] }): Promise<ProductoData> => {
  try {
    // Extraer empaques e ingredientes del producto
    const { empaques, ingredientes, ...productoData } = producto;

    // Preparar datos para inserción
    const datosInsercion = {
      ...productoData,
      // Para recetas, establecer frecuencia como null
      frecuencia: productoData.frecuencia === '1' && productoData.id_tipo_producto ? 
        (await getTipoProductoEsReceta(productoData.id_tipo_producto)) ? null : productoData.frecuencia : 
        productoData.frecuencia,
      // Generar fecsys desde el backend
      fecsys: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('inv_productos')
      .insert([datosInsercion])
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
          nombre,
          id_linea,
          inv_lineas!id_linea (
            id,
            nombre
          )
        )
      `)
      .single();

    if (error) {
      console.error('Error al crear producto:', error);
      throw error;
    }

    // Guardar empaques si existen
    if (empaques && empaques.length > 0) {
      await saveProductoEmpaques(data.id, empaques);
    }

    // Guardar ingredientes si existen
    if (ingredientes && ingredientes.length > 0) {
      await saveProductoIngredientes(data.id, ingredientes);
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
export const updateProducto = async (id: number, producto: Partial<ProductoData> & { empaques?: EmpaqueAsociado[]; ingredientes?: IngredienteDetalle[] }): Promise<ProductoData> => {
  try {
    // Extraer empaques e ingredientes del producto
    const { empaques, ingredientes, ...productoData } = producto;

    // Preparar datos para actualización
    const datosActualizacion = {
      ...productoData,
      // Para recetas, establecer frecuencia como null si es necesario
      frecuencia: productoData.frecuencia === '1' && productoData.id_tipo_producto ? 
        (await getTipoProductoEsReceta(productoData.id_tipo_producto)) ? null : productoData.frecuencia : 
        productoData.frecuencia,
      // Actualizar fecsys
      fecsys: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('inv_productos')
      .update(datosActualizacion)
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
          nombre,
          id_linea,
          inv_lineas!id_linea (
            id,
            nombre
          )
        )
      `)
      .single();

    if (error) {
      console.error('Error al actualizar producto:', error);
      throw error;
    }

    // Guardar empaques si existen
    if (empaques !== undefined) {
      await saveProductoEmpaques(id, empaques);
    }

    // Guardar ingredientes si existen
    if (ingredientes !== undefined) {
      await saveProductoIngredientes(id, ingredientes);
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

    // 1. Eliminar utilidades del producto
    console.log('🗑️ Eliminando utilidades del producto...');
    const { error: utilidadesError } = await supabase
      .from('inv_utilidades_producto')
      .delete()
      .eq('id_producto', id);

    if (utilidadesError) {
      console.error('Error al eliminar utilidades:', utilidadesError);
      throw utilidadesError;
    }

    // 2. Eliminar empaques del producto
    console.log('🗑️ Eliminando empaques del producto...');
    const { error: empaquesError } = await supabase
      .from('inv_productos_unidades')
      .delete()
      .eq('id_producto', id);

    if (empaquesError) {
      console.error('Error al eliminar empaques:', empaquesError);
      throw empaquesError;
    }

    // 3. Eliminar ingredientes del producto
    console.log('🗑️ Eliminando ingredientes del producto...');
    const { error: ingredientesError } = await supabase
      .from('inv_detalle_productos')
      .delete()
      .eq('id_maestro_producto', id);

    if (ingredientesError) {
      console.error('Error al eliminar ingredientes:', ingredientesError);
      throw ingredientesError;
    }

    // 4. Finalmente eliminar el producto principal
    console.log('🗑️ Eliminando producto principal...');
    const { error: deleteError } = await supabase
      .from('inv_productos')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error al eliminar producto:', deleteError);
      throw deleteError;
    }

    console.log('✅ Producto y todas sus relaciones eliminadas exitosamente');
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

// Función para obtener el siguiente consecutivo para una combinación de línea y sublínea
export const getConsecutivoProducto = async (codigoLinea: string, codigoSublinea: string): Promise<number> => {
  try {
    // Buscar el último producto que coincida con el patrón de código
    const patronCodigo = `${codigoLinea}${codigoSublinea}%`;
    
    const { data, error } = await supabase
      .from('inv_productos')
      .select('codigo')
      .like('codigo', patronCodigo)
      .order('codigo', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error obteniendo consecutivo:', error);
      return 1;
    }

    if (!data || data.length === 0) {
      return 1; // Primer producto de esta combinación
    }

    // Extraer el consecutivo del último código
    const ultimoCodigo = data[0].codigo;
    const codigoBase = `${codigoLinea}${codigoSublinea}`;
    const consecutivoStr = ultimoCodigo?.substring(codigoBase.length) || '0';
    const consecutivo = parseInt(consecutivoStr) || 0;
    
    return consecutivo + 1;
  } catch (error) {
    console.error('Error obteniendo consecutivo:', error);
    return 1;
  }
};

// Función auxiliar para guardar ingredientes de un producto
const saveProductoIngredientes = async (idProducto: number, ingredientes: IngredienteDetalle[]) => {
  if (!ingredientes || ingredientes.length === 0) return;

  // Primero eliminar ingredientes existentes
  await supabase
    .from('inv_detalle_productos')
    .delete()
    .eq('id_maestro_producto', idProducto);

  // Insertar nuevos ingredientes
  const ingredientesData = ingredientes.map(ingrediente => ({
    id_maestro_producto: idProducto,
    id_producto: ingrediente.id_producto,
    id_medida: ingrediente.id_medida,
    cantidad: ingrediente.cantidad,
    costo: ingrediente.costo || 0,
    estado: 1
  }));

  const { error } = await supabase
    .from('inv_detalle_productos')
    .insert(ingredientesData);

  if (error) {
    console.error('Error al guardar ingredientes:', error);
    throw error;
  }
};

// Función para obtener ingredientes de un producto
export const getProductoIngredientes = async (idProducto: number): Promise<IngredienteDetalle[]> => {
  try {
    const { data, error } = await supabase
      .from('inv_detalle_productos')
      .select(`
        id,
        id_maestro_producto,
        id_producto,
        id_medida,
        cantidad,
        costo,
        estado
      `)
      .eq('id_maestro_producto', idProducto)
      .eq('estado', 1);

    if (error) {
      console.error('Error obteniendo ingredientes:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error en getProductoIngredientes:', error);
    throw error;
  }
};

/**
 * Guarda las utilidades de un producto
 */
export const saveProductoUtilidades = async (idProducto: number, utilidades: UtilidadProducto): Promise<void> => {
  try {
    const { error } = await supabase
      .from('inv_utilidades_producto')
      .insert({
        id_producto: idProducto,
        id_indicie_dificultad: utilidades.id_indicie_dificultad,
        tasa_perdida: utilidades.tasa_perdida,
        tasa_utilidad: utilidades.tasa_utilidad,
        tiempo_preparacion: utilidades.tiempo_preparacion,
        nota: utilidades.nota,
        estado: utilidades.estado
      });

    if (error) {
      console.error('Error al guardar utilidades del producto:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error en saveProductoUtilidades:', error);
    throw error;
  }
};

/**
 * Obtiene las utilidades de un producto
 */
export const getProductoUtilidades = async (idProducto: number): Promise<UtilidadProducto[]> => {
  try {
    const { data, error } = await supabase
      .from('inv_utilidades_producto')
      .select('*')
      .eq('id_producto', idProducto)
      .eq('estado', 1);

    if (error) {
      console.error('Error al obtener utilidades del producto:', error);
      throw error;
    }

    return data as UtilidadProducto[];
  } catch (error) {
    console.error('Error en getProductoUtilidades:', error);
    throw error;
  }
};

/**
 * Actualiza las utilidades de un producto
 */
export const updateProductoUtilidades = async (idProducto: number, utilidades: UtilidadProducto): Promise<void> => {
  try {
    const { error } = await supabase
      .from('inv_utilidades_producto')
      .update({
        id_indicie_dificultad: utilidades.id_indicie_dificultad,
        tasa_perdida: utilidades.tasa_perdida,
        tasa_utilidad: utilidades.tasa_utilidad,
        tiempo_preparacion: utilidades.tiempo_preparacion,
        nota: utilidades.nota,
        estado: utilidades.estado
      })
      .eq('id_producto', idProducto);

    if (error) {
      console.error('Error al actualizar utilidades del producto:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error en updateProductoUtilidades:', error);
    throw error;
  }
};

/**
 * Guarda o actualiza las utilidades de un producto (upsert)
 */
export const saveOrUpdateProductoUtilidades = async (idProducto: number, utilidades: UtilidadProducto): Promise<void> => {
  try {
    // Primero verificar si ya existe un registro (sin .single() para evitar error cuando no hay filas)
    const { data: existingUtilidades, error: selectError } = await supabase
      .from('inv_utilidades_producto')
      .select('id')
      .eq('id_producto', idProducto)
      .eq('estado', 1);

    if (selectError) {
      console.error('Error al verificar utilidades existentes:', selectError);
      throw selectError;
    }

    if (existingUtilidades && existingUtilidades.length > 0) {
      // Si existe, actualizar
      console.log('🔄 Actualizando utilidades existentes para producto:', idProducto);
      await updateProductoUtilidades(idProducto, utilidades);
    } else {
      // Si no existe, crear nuevo
      console.log('➕ Creando nuevas utilidades para producto:', idProducto);
      await saveProductoUtilidades(idProducto, utilidades);
    }
  } catch (error) {
    console.error('Error en saveOrUpdateProductoUtilidades:', error);
    throw error;
  }
};

export const productosService = {
  listProductos,
  listMedidas,
  listMedidasPrincipales,
  listCategorias,
  listSublineas,
  createProducto,
  updateProducto,
  activateProducto,
  deactivateProducto,
  deleteProductoPermanent,
  getNextCodigo,
  getConsecutivoProducto,
  getProductoIngredientes,
  saveProductoUtilidades,
  getProductoUtilidades,
  updateProductoUtilidades,
  saveOrUpdateProductoUtilidades,
};
