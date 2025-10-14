-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.categorias_productos (
  id integer NOT NULL DEFAULT nextval('categorias_productos_id_seq'::regclass),
  sublinea_id integer NOT NULL,
  nombre character varying NOT NULL,
  descripcion text,
  activa boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT categorias_productos_pkey PRIMARY KEY (id),
  CONSTRAINT categorias_productos_sublinea_id_fkey FOREIGN KEY (sublinea_id) REFERENCES public.sublineas_productos(id)
);
CREATE TABLE public.ciudades (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  departamento_id uuid,
  codigo character varying NOT NULL,
  nombre character varying NOT NULL,
  activo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ciudades_pkey PRIMARY KEY (id),
  CONSTRAINT ciudades_departamento_id_fkey FOREIGN KEY (departamento_id) REFERENCES public.departamentos(id)
);
CREATE TABLE public.clientes (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  tipo_persona_id uuid NOT NULL,
  tipo_documento_id uuid NOT NULL,
  numero_documento character varying NOT NULL,
  digito_verificacion character varying,
  primer_nombre character varying,
  segundo_nombre character varying,
  primer_apellido character varying,
  segundo_apellido character varying,
  razon_social character varying,
  nombre_comercial character varying,
  telefono character varying,
  celular character varying,
  email character varying,
  sitio_web character varying,
  direccion text,
  ciudad character varying,
  codigo_postal character varying,
  regimen_fiscal_id uuid,
  responsable_iva boolean DEFAULT false,
  gran_contribuyente boolean DEFAULT false,
  autorretenedor boolean DEFAULT false,
  limite_credito numeric DEFAULT 0,
  dias_credito integer DEFAULT 0,
  descuento_porcentaje numeric DEFAULT 0,
  activo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  usuario_creacion uuid,
  usuario_actualizacion uuid,
  ciudad_id uuid,
  fecha_creacion timestamp with time zone DEFAULT now(),
  fecha_actualizacion timestamp with time zone DEFAULT now(),
  empresa_id integer,
  CONSTRAINT clientes_pkey PRIMARY KEY (id),
  CONSTRAINT clientes_tipo_persona_id_fkey FOREIGN KEY (tipo_persona_id) REFERENCES public.tipos_persona(id),
  CONSTRAINT clientes_tipo_documento_id_fkey FOREIGN KEY (tipo_documento_id) REFERENCES public.tipos_documento(id),
  CONSTRAINT clientes_regimen_fiscal_id_fkey FOREIGN KEY (regimen_fiscal_id) REFERENCES public.regimenes_fiscales(id),
  CONSTRAINT clientes_ciudad_id_fkey FOREIGN KEY (ciudad_id) REFERENCES public.ciudades(id),
  CONSTRAINT clientes_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id)
);
CREATE TABLE public.codigos_verificacion (
  id integer NOT NULL DEFAULT nextval('codigos_verificacion_id_seq'::regclass),
  email character varying NOT NULL,
  codigo character varying NOT NULL,
  tipo character varying NOT NULL DEFAULT 'recuperacion'::character varying,
  usado boolean DEFAULT false,
  fecha_expiracion timestamp with time zone NOT NULL,
  fecha_creacion timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT codigos_verificacion_pkey PRIMARY KEY (id)
);
CREATE TABLE public.con_terceros (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  id_tipo_tercero integer NOT NULL,
  documento character varying NOT NULL,
  digito character varying,
  id_tipo_documento integer NOT NULL,
  nombre_tercero character varying NOT NULL,
  primer_nombre character varying NOT NULL,
  segundo_nombre character varying NOT NULL,
  primer_apellido character varying NOT NULL,
  segundo_apellido character varying NOT NULL,
  id_tipo_regimen integer NOT NULL,
  id_municipio integer NOT NULL,
  id_actividad_ciiu integer,
  id_lista_precio integer,
  id_zona integer,
  id_tipo_forma_pago integer NOT NULL,
  direccion character varying NOT NULL,
  telefono character varying NOT NULL,
  celular character varying NOT NULL,
  email character varying NOT NULL,
  cupo_credito numeric,
  plazo integer,
  estado integer NOT NULL,
  id_cuenta_retencion integer,
  retencion_porcentaje numeric,
  id_cuenta_reteica integer,
  reteica_porcentaje numeric,
  base_retencion integer,
  CONSTRAINT con_terceros_pkey PRIMARY KEY (id),
  CONSTRAINT con_terceros_ibfk_1 FOREIGN KEY (id_tipo_tercero) REFERENCES public.con_tipos_tercero(id),
  CONSTRAINT con_terceros_ibfk_2 FOREIGN KEY (id_actividad_ciiu) REFERENCES public.gen_actividades_ciiu(id),
  CONSTRAINT con_terceros_ibfk_3 FOREIGN KEY (id_tipo_documento) REFERENCES public.gen_tipo_documentos_dian(id),
  CONSTRAINT con_terceros_ibfk_4 FOREIGN KEY (id_tipo_forma_pago) REFERENCES public.gen_tipo_formas_pagos(id),
  CONSTRAINT con_terceros_ibfk_5 FOREIGN KEY (id_tipo_regimen) REFERENCES public.gen_tipo_regimenes(id),
  CONSTRAINT con_terceros_ibfk_6 FOREIGN KEY (id_zona) REFERENCES public.gen_zonas(id),
  CONSTRAINT con_terceros_ibfk_7 FOREIGN KEY (id_municipio) REFERENCES public.gen_municipios(id)
);
CREATE TABLE public.con_tipos_tercero (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre character varying NOT NULL,
  estado integer NOT NULL,
  CONSTRAINT con_tipos_tercero_pkey PRIMARY KEY (id)
);
CREATE TABLE public.config_empresa (
  id integer NOT NULL DEFAULT nextval('config_empresa_id_seq'::regclass),
  razon_social character varying NOT NULL,
  nit character varying NOT NULL,
  direccion text NOT NULL,
  telefono character varying,
  email character varying,
  representante_legal character varying,
  cargo_representante character varying,
  ciudad character varying,
  departamento character varying,
  estado character varying DEFAULT 'activo'::character varying,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT config_empresa_pkey PRIMARY KEY (id)
);
CREATE TABLE public.cotizaciones (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  numero_cotizacion character varying NOT NULL,
  fecha_cotizacion date NOT NULL,
  fecha_vencimiento date NOT NULL,
  cliente_id uuid NOT NULL,
  vendedor_id uuid,
  lista_precio_id uuid,
  subtotal numeric DEFAULT 0,
  descuento_porcentaje numeric DEFAULT 0,
  descuento_valor numeric DEFAULT 0,
  iva_porcentaje numeric DEFAULT 19.00,
  iva_valor numeric DEFAULT 0,
  anticipos numeric DEFAULT 0,
  domicilios numeric DEFAULT 0,
  total numeric DEFAULT 0,
  observaciones text,
  estado character varying DEFAULT 'BORRADOR'::character varying CHECK (estado::text = ANY (ARRAY['BORRADOR'::character varying, 'ENVIADA'::character varying, 'APROBADA'::character varying, 'RECHAZADA'::character varying, 'VENCIDA'::character varying]::text[])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  usuario_creacion uuid,
  usuario_actualizacion uuid,
  empresa_id integer,
  CONSTRAINT cotizaciones_pkey PRIMARY KEY (id),
  CONSTRAINT cotizaciones_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id),
  CONSTRAINT cotizaciones_vendedor_id_fkey FOREIGN KEY (vendedor_id) REFERENCES public.vendedores(id),
  CONSTRAINT cotizaciones_lista_precio_id_fkey FOREIGN KEY (lista_precio_id) REFERENCES public.listas_precios(id),
  CONSTRAINT cotizaciones_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id)
);
CREATE TABLE public.cotizaciones_detalle (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  cotizacion_id uuid NOT NULL,
  producto_id integer NOT NULL,
  cantidad numeric NOT NULL,
  precio_unitario numeric NOT NULL,
  descuento_porcentaje numeric DEFAULT 0,
  descuento_valor numeric DEFAULT 0,
  iva_porcentaje numeric DEFAULT 19.00,
  iva_valor numeric DEFAULT 0,
  total numeric NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT cotizaciones_detalle_pkey PRIMARY KEY (id),
  CONSTRAINT cotizaciones_detalle_cotizacion_id_fkey FOREIGN KEY (cotizacion_id) REFERENCES public.cotizaciones(id),
  CONSTRAINT cotizaciones_detalle_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.inv_productos(id)
);
CREATE TABLE public.departamentos (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  codigo character varying NOT NULL UNIQUE,
  nombre character varying NOT NULL,
  activo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT departamentos_pkey PRIMARY KEY (id)
);
CREATE TABLE public.empresas (
  id integer NOT NULL DEFAULT nextval('empresas_new_id_seq'::regclass),
  razon_social character varying NOT NULL,
  nit character varying NOT NULL,
  tipo_documento character varying DEFAULT 'nit'::character varying,
  regimen_tributario_id character varying,
  direccion text,
  ciudad character varying,
  telefono character varying,
  email character varying,
  representante_legal character varying,
  numero_empleados integer DEFAULT 1,
  tipo_empresa character varying NOT NULL,
  activo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  documento_contrato text,
  documento_camara_comercio text,
  documento_rut text,
  actividad_economica_id character varying,
  logo_base64 text,
  identificador character varying,
  CONSTRAINT empresas_pkey PRIMARY KEY (id)
);
CREATE TABLE public.empresas_backup (
  id character varying,
  razon_social character varying,
  nit character varying,
  tipo_documento character varying,
  regimen_tributario_id character varying,
  direccion text,
  ciudad character varying,
  telefono character varying,
  email character varying,
  representante_legal character varying,
  numero_empleados integer,
  tipo_empresa character varying,
  activo boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  documento_contrato text,
  documento_camara_comercio text,
  documento_rut text,
  actividad_economica_id character varying,
  logo_base64 text,
  identificador character varying
);
CREATE TABLE public.facturas (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  numero_factura character varying NOT NULL,
  fecha_factura date NOT NULL,
  fecha_vencimiento date,
  remision_id uuid,
  pedido_id uuid,
  cliente_id uuid NOT NULL,
  vendedor_id uuid,
  prefijo character varying,
  numero_consecutivo character varying,
  cufe character varying,
  qr_code text,
  subtotal numeric NOT NULL DEFAULT 0,
  descuento_porcentaje numeric DEFAULT 0,
  descuento_valor numeric DEFAULT 0,
  iva_porcentaje numeric DEFAULT 19.00,
  iva_valor numeric DEFAULT 0,
  impoconsumo_valor numeric DEFAULT 0,
  retencion_iva numeric DEFAULT 0,
  retencion_fuente numeric DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  observaciones text,
  estado character varying NOT NULL DEFAULT 'BORRADOR'::character varying CHECK (estado::text = ANY (ARRAY['BORRADOR'::character varying, 'ENVIADA'::character varying, 'ACEPTADA'::character varying, 'RECHAZADA'::character varying, 'ANULADA'::character varying]::text[])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  usuario_creacion uuid,
  usuario_actualizacion uuid,
  empresa_id integer,
  CONSTRAINT facturas_pkey PRIMARY KEY (id),
  CONSTRAINT facturas_remision_id_fkey FOREIGN KEY (remision_id) REFERENCES public.remisiones(id),
  CONSTRAINT facturas_pedido_id_fkey FOREIGN KEY (pedido_id) REFERENCES public.pedidos(id),
  CONSTRAINT facturas_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id),
  CONSTRAINT facturas_vendedor_id_fkey FOREIGN KEY (vendedor_id) REFERENCES public.vendedores(id),
  CONSTRAINT facturas_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id)
);
CREATE TABLE public.facturas_detalle (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  factura_id uuid NOT NULL,
  producto_id integer NOT NULL,
  cantidad numeric NOT NULL,
  precio_unitario numeric NOT NULL,
  descuento_porcentaje numeric DEFAULT 0,
  descuento_valor numeric DEFAULT 0,
  subtotal numeric NOT NULL,
  iva_porcentaje numeric DEFAULT 19.00,
  iva_valor numeric DEFAULT 0,
  impoconsumo_valor numeric DEFAULT 0,
  total numeric NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT facturas_detalle_pkey PRIMARY KEY (id),
  CONSTRAINT facturas_detalle_factura_id_fkey FOREIGN KEY (factura_id) REFERENCES public.facturas(id),
  CONSTRAINT facturas_detalle_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.inv_productos(id)
);
CREATE TABLE public.gen_actividades_ciiu (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  codigo character varying NOT NULL UNIQUE,
  nombre character varying NOT NULL,
  estado integer NOT NULL,
  CONSTRAINT gen_actividades_ciiu_pkey PRIMARY KEY (id)
);
CREATE TABLE public.gen_bodegas (
  id integer NOT NULL DEFAULT nextval('gen_bodegas_id_seq'::regclass),
  codigo character varying NOT NULL,
  nombre character varying NOT NULL,
  id_unidad integer,
  tipo_bodega integer DEFAULT 0,
  estado integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT gen_bodegas_pkey PRIMARY KEY (id),
  CONSTRAINT fk_gen_bodegas_unidad FOREIGN KEY (id_unidad) REFERENCES public.prod_unidad_servicios(id)
);
CREATE TABLE public.gen_departamentos (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  id_pais integer NOT NULL,
  codigo character varying NOT NULL,
  nombre character varying NOT NULL,
  estado integer NOT NULL,
  CONSTRAINT gen_departamentos_pkey PRIMARY KEY (id),
  CONSTRAINT gen_departamentos_ibfk_1 FOREIGN KEY (id_pais) REFERENCES public.gen_paises(id)
);
CREATE TABLE public.gen_empresa (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  id_municipio integer NOT NULL,
  id_tipo_regimen integer NOT NULL,
  codigo character varying NOT NULL,
  documento_empresa character varying NOT NULL,
  nombre character varying NOT NULL,
  direccion character varying NOT NULL,
  telefono character varying NOT NULL,
  fecha_inicio_operacion date NOT NULL,
  nombre_gerente character varying NOT NULL,
  nombre_contador character varying NOT NULL,
  estado integer NOT NULL,
  CONSTRAINT gen_empresa_pkey PRIMARY KEY (id),
  CONSTRAINT gen_empresa_ibfk_1 FOREIGN KEY (id_municipio) REFERENCES public.gen_municipios(id),
  CONSTRAINT gen_empresa_ibfk_2 FOREIGN KEY (id_tipo_regimen) REFERENCES public.gen_tipo_regimenes(id)
);
CREATE TABLE public.gen_modulo_permisos (
  id integer NOT NULL DEFAULT nextval('gen_modulo_permisos_id_seq'::regclass),
  modulo_id integer NOT NULL,
  nombre character varying NOT NULL,
  descripcion text,
  code character varying NOT NULL UNIQUE,
  activo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT gen_modulo_permisos_pkey PRIMARY KEY (id),
  CONSTRAINT gen_modulo_permisos_modulo_id_fkey FOREIGN KEY (modulo_id) REFERENCES public.gen_modulos(id)
);
CREATE TABLE public.gen_modulos (
  id integer NOT NULL DEFAULT nextval('gen_modulos_id_seq'::regclass),
  nombre character varying NOT NULL UNIQUE,
  descripcion text,
  activo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT gen_modulos_pkey PRIMARY KEY (id)
);
CREATE TABLE public.gen_municipios (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  id_departamento integer NOT NULL,
  codigo character varying NOT NULL UNIQUE,
  nombre character varying NOT NULL,
  estado integer NOT NULL,
  CONSTRAINT gen_municipios_pkey PRIMARY KEY (id),
  CONSTRAINT gen_municipios_ibfk_1 FOREIGN KEY (id_departamento) REFERENCES public.gen_departamentos(id)
);
CREATE TABLE public.gen_paises (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  codigo character varying NOT NULL,
  nombre character varying NOT NULL,
  estado integer NOT NULL,
  CONSTRAINT gen_paises_pkey PRIMARY KEY (id)
);
CREATE TABLE public.gen_roles (
  id integer NOT NULL DEFAULT nextval('gen_roles_id_seq'::regclass),
  nombre character varying NOT NULL,
  descripcion text,
  activo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT gen_roles_pkey PRIMARY KEY (id)
);
CREATE TABLE public.gen_roles_modulos (
  id integer NOT NULL DEFAULT nextval('gen_roles_modulos_id_seq'::regclass),
  rol_id integer NOT NULL,
  modulo_id integer NOT NULL,
  selected_actions_codes ARRAY DEFAULT '{}'::text[],
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT gen_roles_modulos_pkey PRIMARY KEY (id),
  CONSTRAINT gen_roles_modulos_rol_id_fkey FOREIGN KEY (rol_id) REFERENCES public.gen_roles(id),
  CONSTRAINT gen_roles_modulos_modulo_id_fkey FOREIGN KEY (modulo_id) REFERENCES public.gen_modulos(id)
);
CREATE TABLE public.gen_sucursales (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre character varying NOT NULL,
  codigo character varying NOT NULL,
  estado integer NOT NULL,
  id_empresa integer NOT NULL,
  id_municipio integer NOT NULL,
  tipo_control_fecha character varying DEFAULT 'FS'::character varying,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT gen_sucursales_pkey PRIMARY KEY (id),
  CONSTRAINT gen_sucursales_ibfk_2 FOREIGN KEY (id_municipio) REFERENCES public.gen_municipios(id),
  CONSTRAINT gen_sucursales_ibfk_1 FOREIGN KEY (id_empresa) REFERENCES public.gen_empresa(id)
);
CREATE TABLE public.gen_tipo_documentos_dian (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  codigo character varying NOT NULL UNIQUE,
  nombre character varying NOT NULL,
  estado integer NOT NULL,
  requiere_digito integer NOT NULL,
  requiere_razon integer NOT NULL,
  CONSTRAINT gen_tipo_documentos_dian_pkey PRIMARY KEY (id)
);
CREATE TABLE public.gen_tipo_formas_pagos (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  codigo character varying NOT NULL UNIQUE,
  nombre character varying NOT NULL,
  estado integer NOT NULL,
  CONSTRAINT gen_tipo_formas_pagos_pkey PRIMARY KEY (id)
);
CREATE TABLE public.gen_tipo_regimenes (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  codigo character varying NOT NULL UNIQUE,
  nombre character varying NOT NULL,
  estado integer NOT NULL,
  CONSTRAINT gen_tipo_regimenes_pkey PRIMARY KEY (id)
);
CREATE TABLE public.gen_usuario_empresas (
  id integer NOT NULL DEFAULT nextval('gen_usuario_empresas_id_seq'::regclass),
  usuario_id integer NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  empresa_id integer,
  CONSTRAINT gen_usuario_empresas_pkey PRIMARY KEY (id),
  CONSTRAINT gen_usuario_empresas_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.gen_usuarios(id),
  CONSTRAINT gen_usuario_empresas_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id)
);
CREATE TABLE public.gen_usuario_roles (
  id integer NOT NULL DEFAULT nextval('gen_usuario_roles_id_seq'::regclass),
  usuario_id integer NOT NULL,
  rol_id integer NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT gen_usuario_roles_pkey PRIMARY KEY (id),
  CONSTRAINT gen_usuario_roles_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.gen_usuarios(id),
  CONSTRAINT gen_usuario_roles_rol_id_fkey FOREIGN KEY (rol_id) REFERENCES public.gen_roles(id)
);
CREATE TABLE public.gen_usuarios (
  id integer NOT NULL DEFAULT nextval('gen_usuarios_id_seq'::regclass),
  identificacion character varying,
  primer_nombre character varying NOT NULL,
  segundo_nombre character varying,
  primer_apellido character varying NOT NULL,
  segundo_apellido character varying,
  telefono character varying,
  email character varying NOT NULL UNIQUE,
  username character varying NOT NULL UNIQUE,
  password character varying NOT NULL,
  activo boolean DEFAULT true,
  foto_base64 text,
  ultimo_acceso timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  auth_user_id uuid,
  CONSTRAINT gen_usuarios_pkey PRIMARY KEY (id)
);
CREATE TABLE public.gen_zonas (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre character varying NOT NULL,
  estado integer NOT NULL,
  CONSTRAINT gen_zonas_pkey PRIMARY KEY (id)
);
CREATE TABLE public.inv_categorias (
  id integer NOT NULL DEFAULT nextval('inv_categorias_id_seq'::regclass),
  nombre character varying NOT NULL,
  isreceta integer NOT NULL DEFAULT 0,
  requiere_empaques integer NOT NULL,
  estado integer NOT NULL,
  imgruta text,
  CONSTRAINT inv_categorias_pkey PRIMARY KEY (id)
);
CREATE TABLE public.inv_clase_servicios (
  id integer NOT NULL DEFAULT nextval('inv_clase_servicios_id_seq'::regclass),
  nombre character varying NOT NULL,
  orden integer,
  estado integer NOT NULL DEFAULT 1,
  CONSTRAINT inv_clase_servicios_pkey PRIMARY KEY (id)
);
CREATE TABLE public.inv_colores (
  id integer NOT NULL DEFAULT nextval('inv_colores_id_seq'::regclass),
  codigo character varying NOT NULL,
  estado integer NOT NULL,
  nombre character varying NOT NULL,
  CONSTRAINT inv_colores_pkey PRIMARY KEY (id)
);
CREATE TABLE public.inv_detalle_productos (
  id integer NOT NULL DEFAULT nextval('inv_detalle_productos_id_seq'::regclass),
  id_maestro_producto integer NOT NULL,
  id_producto integer NOT NULL,
  id_medida integer NOT NULL,
  cantidad integer NOT NULL,
  costo numeric DEFAULT NULL::numeric,
  estado integer NOT NULL DEFAULT 1,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT inv_detalle_productos_pkey PRIMARY KEY (id),
  CONSTRAINT fk_detalle_productos_maestro FOREIGN KEY (id_maestro_producto) REFERENCES public.inv_productos(id),
  CONSTRAINT fk_detalle_productos_ingrediente FOREIGN KEY (id_producto) REFERENCES public.inv_productos(id),
  CONSTRAINT fk_detalle_productos_medida FOREIGN KEY (id_medida) REFERENCES public.inv_medidas(id)
);
CREATE TABLE public.inv_interfaz_contable (
  id integer NOT NULL DEFAULT nextval('inv_interfaz_contable_id_seq'::regclass),
  codigo character varying NOT NULL UNIQUE,
  nombre character varying NOT NULL,
  clase integer DEFAULT 1,
  tasa_iva numeric NOT NULL DEFAULT 0.00,
  tasa_retencion numeric NOT NULL DEFAULT 0.00,
  base_retencion numeric NOT NULL DEFAULT 0.00,
  id_usuario integer NOT NULL,
  estado integer NOT NULL,
  CONSTRAINT inv_interfaz_contable_pkey PRIMARY KEY (id)
);
CREATE TABLE public.inv_lineas (
  id integer NOT NULL DEFAULT nextval('inv_lineas_id_seq'::regclass),
  codigo character varying NOT NULL UNIQUE,
  nombre character varying NOT NULL,
  id_categoria integer NOT NULL,
  estado integer NOT NULL,
  CONSTRAINT inv_lineas_pkey PRIMARY KEY (id),
  CONSTRAINT fk_lineas_categoria FOREIGN KEY (id_categoria) REFERENCES public.inv_categorias(id)
);
CREATE TABLE public.inv_marcas (
  id integer NOT NULL DEFAULT nextval('inv_marcas_id_seq'::regclass),
  codigo character varying NOT NULL,
  nombre character varying NOT NULL,
  estado integer NOT NULL,
  CONSTRAINT inv_marcas_pkey PRIMARY KEY (id)
);
CREATE TABLE public.inv_medidas (
  id integer NOT NULL DEFAULT nextval('inv_medidas_id_seq'::regclass),
  codigo text NOT NULL,
  nombre character varying NOT NULL,
  abreviatura character varying NOT NULL,
  clase_medida character varying CHECK (clase_medida::text = ANY (ARRAY['Peso'::character varying, 'Volumen'::character varying, 'Area'::character varying]::text[])),
  id_medida_principal integer,
  id_unidad_hija integer,
  cantidad integer NOT NULL,
  factor numeric,
  permite_cambio smallint NOT NULL DEFAULT 0,
  val_excedente numeric NOT NULL DEFAULT 0.00,
  estado integer DEFAULT 1,
  medida_principal boolean NOT NULL DEFAULT false,
  conversion_factor numeric DEFAULT 1000.00,
  CONSTRAINT inv_medidas_pkey PRIMARY KEY (id)
);
CREATE TABLE public.inv_medidas_detalle (
  id integer NOT NULL DEFAULT nextval('inv_medidas_detalle_id_seq'::regclass),
  id_medida integer NOT NULL,
  codigo character varying NOT NULL,
  nombre character varying NOT NULL,
  abreviatura character varying NOT NULL,
  clase_medida character varying,
  cantidad numeric NOT NULL DEFAULT 1,
  val_excedente numeric NOT NULL DEFAULT 0,
  medida_principal boolean NOT NULL DEFAULT false,
  estado integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT inv_medidas_detalle_pkey PRIMARY KEY (id),
  CONSTRAINT inv_medidas_detalle_id_medida_fkey FOREIGN KEY (id_medida) REFERENCES public.inv_medidas(id)
);
CREATE TABLE public.inv_presentacion_medidas (
  id integer NOT NULL DEFAULT nextval('inv_presentacion_medidas_id_seq'::regclass),
  nombre character varying NOT NULL,
  estado integer NOT NULL DEFAULT 1,
  id_medida integer,
  CONSTRAINT inv_presentacion_medidas_pkey PRIMARY KEY (id),
  CONSTRAINT inv_presentacion_medidas_id_medida_fkey FOREIGN KEY (id_medida) REFERENCES public.inv_medidas(id)
);
CREATE TABLE public.inv_producto_by_unidades (
  id integer NOT NULL DEFAULT nextval('inv_producto_by_unidades_id_seq'::regclass),
  id_producto integer NOT NULL,
  id_unidad_servicio integer NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT inv_producto_by_unidades_pkey PRIMARY KEY (id),
  CONSTRAINT inv_producto_by_unidades_id_producto_fkey FOREIGN KEY (id_producto) REFERENCES public.inv_productos(id),
  CONSTRAINT inv_producto_by_unidades_id_unidad_servicio_fkey FOREIGN KEY (id_unidad_servicio) REFERENCES public.prod_unidad_servicios(id)
);
CREATE TABLE public.inv_productos (
  id integer NOT NULL DEFAULT nextval('inv_productos_id_seq'::regclass),
  codigo character varying,
  nombre character varying NOT NULL,
  id_medida integer,
  id_tipo_producto integer NOT NULL,
  id_categoria integer NOT NULL,
  id_sublineas integer NOT NULL,
  id_interfaz_contable integer,
  id_marca integer,
  id_color integer,
  referencia character varying,
  id_clase_servicio integer,
  tipo_menu character varying,
  no_ciclo integer,
  ultimo_costo numeric DEFAULT 0.00,
  id_proveedor integer,
  frecuencia character varying DEFAULT 1,
  controla_existencia smallint,
  controla_lotes smallint,
  imgbase64 text,
  id_usuario integer,
  fecsys timestamp without time zone,
  estado integer,
  CONSTRAINT inv_productos_pkey PRIMARY KEY (id),
  CONSTRAINT fk_productos_tipo_producto FOREIGN KEY (id_tipo_producto) REFERENCES public.inv_tipo_producto(id),
  CONSTRAINT fk_productos_clase_servicios FOREIGN KEY (id_clase_servicio) REFERENCES public.inv_clase_servicios(id),
  CONSTRAINT fk_productos_medida FOREIGN KEY (id_medida) REFERENCES public.inv_medidas(id),
  CONSTRAINT fk_productos_categoria FOREIGN KEY (id_categoria) REFERENCES public.inv_categorias(id),
  CONSTRAINT fk_productos_sublineas FOREIGN KEY (id_sublineas) REFERENCES public.inv_sublineas(id),
  CONSTRAINT fk_productos_interfaz_contable FOREIGN KEY (id_interfaz_contable) REFERENCES public.inv_interfaz_contable(id),
  CONSTRAINT fk_productos_marca FOREIGN KEY (id_marca) REFERENCES public.inv_marcas(id),
  CONSTRAINT fk_productos_color FOREIGN KEY (id_color) REFERENCES public.inv_colores(id)
);
CREATE TABLE public.inv_productos_unidad_servicio (
  id integer NOT NULL DEFAULT nextval('inv_productos_unidad_servicio_id_seq'::regclass),
  id_producto_by_unidad integer NOT NULL,
  id_contrato integer,
  id_unidad_servicio integer NOT NULL,
  estado integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT inv_productos_unidad_servicio_pkey PRIMARY KEY (id),
  CONSTRAINT fk_productos_unidad_servicio_contrato FOREIGN KEY (id_contrato) REFERENCES public.prod_contratos(id),
  CONSTRAINT fk_productos_unidad_servicio_unidad FOREIGN KEY (id_unidad_servicio) REFERENCES public.prod_unidad_servicios(id),
  CONSTRAINT fk_inv_productos_unidad_servicio_producto_by_unidad FOREIGN KEY (id_producto_by_unidad) REFERENCES public.inv_producto_by_unidades(id)
);
CREATE TABLE public.inv_productos_unidades (
  id integer NOT NULL DEFAULT nextval('inv_productos_unidades_id_seq'::regclass),
  id_producto integer NOT NULL,
  id_presentacion integer NOT NULL,
  factor numeric NOT NULL,
  descripcion character varying NOT NULL,
  estado integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT inv_productos_unidades_pkey PRIMARY KEY (id),
  CONSTRAINT fk_productos_unidades_producto FOREIGN KEY (id_producto) REFERENCES public.inv_productos(id),
  CONSTRAINT fk_productos_unidades_presentacion FOREIGN KEY (id_presentacion) REFERENCES public.inv_presentacion_medidas(id)
);
CREATE TABLE public.inv_sublineas (
  id integer NOT NULL DEFAULT nextval('inv_sublineas_id_seq'::regclass),
  id_linea integer NOT NULL,
  codigo character varying NOT NULL,
  nombre character varying NOT NULL,
  estado integer NOT NULL,
  id_componente_menu integer,
  CONSTRAINT inv_sublineas_pkey PRIMARY KEY (id),
  CONSTRAINT fk_sublineas_linea FOREIGN KEY (id_linea) REFERENCES public.inv_lineas(id),
  CONSTRAINT fk_sublineas_componente_menu FOREIGN KEY (id_componente_menu) REFERENCES public.prod_componentes_menus(id),
  CONSTRAINT inv_sublineas_id_componente_menu_fkey FOREIGN KEY (id_componente_menu) REFERENCES public.prod_componentes_menus(id)
);
CREATE TABLE public.inv_tipo_producto (
  id integer NOT NULL DEFAULT nextval('inv_tipo_producto_id_seq'::regclass),
  codigo character varying NOT NULL,
  nombre character varying NOT NULL,
  estado integer NOT NULL DEFAULT 1,
  es_receta boolean NOT NULL DEFAULT false,
  CONSTRAINT inv_tipo_producto_pkey PRIMARY KEY (id)
);
CREATE TABLE public.inv_utilidades_producto (
  id integer NOT NULL DEFAULT nextval('inv_utilidades_producto_id_seq'::regclass),
  id_producto integer NOT NULL,
  id_indicie_dificultad integer DEFAULT 1,
  tasa_perdida numeric NOT NULL,
  tasa_utilidad numeric DEFAULT 0.00000,
  tiempo_preparacion character varying NOT NULL,
  nota character varying DEFAULT ''::character varying,
  estado integer NOT NULL DEFAULT 1,
  CONSTRAINT inv_utilidades_producto_pkey PRIMARY KEY (id),
  CONSTRAINT fk_utilidades_producto FOREIGN KEY (id_producto) REFERENCES public.inv_productos(id)
);
CREATE TABLE public.lineas_productos (
  id integer NOT NULL DEFAULT nextval('lineas_productos_id_seq'::regclass),
  nombre character varying NOT NULL,
  descripcion text,
  activa boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT lineas_productos_pkey PRIMARY KEY (id)
);
CREATE TABLE public.listas_precios (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  nombre character varying NOT NULL,
  descripcion text,
  activo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  codigo character varying NOT NULL,
  fecha_inicio date NOT NULL,
  fecha_fin date,
  activa boolean DEFAULT true,
  usuario_creacion uuid,
  usuario_actualizacion uuid,
  empresa_id integer,
  CONSTRAINT listas_precios_pkey PRIMARY KEY (id),
  CONSTRAINT listas_precios_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id)
);
CREATE TABLE public.notificaciones (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  usuario_id uuid NOT NULL,
  tipo character varying NOT NULL CHECK (tipo::text = ANY (ARRAY['REMISION_ESTADO'::character varying, 'REMISION_ENTREGADA'::character varying, 'REMISION_CREADA'::character varying, 'REMISION_CANCELADA'::character varying]::text[])),
  titulo character varying NOT NULL,
  mensaje text NOT NULL,
  datos_adicionales jsonb,
  leida boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  empresa_id integer,
  CONSTRAINT notificaciones_pkey PRIMARY KEY (id),
  CONSTRAINT notificaciones_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id)
);
CREATE TABLE public.pedidos (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  numero_pedido character varying NOT NULL,
  fecha_pedido date NOT NULL,
  fecha_entrega_estimada date,
  cliente_id uuid NOT NULL,
  vendedor_id uuid,
  lista_precio_id uuid,
  subtotal numeric NOT NULL DEFAULT 0,
  descuento_porcentaje numeric DEFAULT 0,
  descuento_valor numeric DEFAULT 0,
  iva_porcentaje numeric DEFAULT 19.00,
  iva_valor numeric DEFAULT 0,
  impoconsumo_valor numeric DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  observaciones text,
  instrucciones_entrega text,
  estado character varying NOT NULL DEFAULT 'BORRADOR'::character varying CHECK (estado::text = ANY (ARRAY['BORRADOR'::character varying, 'CONFIRMADO'::character varying, 'EN_PROCESO'::character varying, 'PARCIALMENTE_REMITIDO'::character varying, 'REMITIDO'::character varying, 'CANCELADO'::character varying]::text[])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  usuario_creacion uuid,
  usuario_actualizacion uuid,
  cotizacion_id uuid,
  empresa_id integer,
  CONSTRAINT pedidos_pkey PRIMARY KEY (id),
  CONSTRAINT pedidos_lista_precio_id_fkey FOREIGN KEY (lista_precio_id) REFERENCES public.listas_precios(id),
  CONSTRAINT pedidos_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id),
  CONSTRAINT pedidos_vendedor_id_fkey FOREIGN KEY (vendedor_id) REFERENCES public.vendedores(id),
  CONSTRAINT pedidos_cotizacion_id_fkey FOREIGN KEY (cotizacion_id) REFERENCES public.cotizaciones(id),
  CONSTRAINT pedidos_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id)
);
CREATE TABLE public.pedidos_detalle (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  pedido_id uuid NOT NULL,
  producto_id integer NOT NULL,
  cantidad numeric NOT NULL,
  cantidad_remitida numeric DEFAULT 0,
  precio_unitario numeric NOT NULL,
  descuento_porcentaje numeric DEFAULT 0,
  descuento_valor numeric DEFAULT 0,
  subtotal numeric NOT NULL,
  iva_porcentaje numeric DEFAULT 19.00,
  iva_valor numeric DEFAULT 0,
  impoconsumo_valor numeric DEFAULT 0,
  total numeric NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT pedidos_detalle_pkey PRIMARY KEY (id),
  CONSTRAINT pedidos_detalle_pedido_id_fkey FOREIGN KEY (pedido_id) REFERENCES public.pedidos(id),
  CONSTRAINT pedidos_detalle_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.inv_productos(id)
);
CREATE TABLE public.precios_lista (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  lista_precio_id uuid NOT NULL,
  producto_id integer NOT NULL,
  precio numeric NOT NULL,
  descuento_porcentaje numeric DEFAULT 0,
  precio_final numeric DEFAULT (precio * ((1)::numeric - (descuento_porcentaje / (100)::numeric))),
  activo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  usuario_creacion uuid,
  usuario_actualizacion uuid,
  CONSTRAINT precios_lista_pkey PRIMARY KEY (id),
  CONSTRAINT precios_lista_lista_precio_id_fkey FOREIGN KEY (lista_precio_id) REFERENCES public.listas_precios(id),
  CONSTRAINT precios_lista_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.inv_productos(id)
);
CREATE TABLE public.prod_componentes_menus (
  id integer NOT NULL DEFAULT nextval('prod_componentes_menus_id_seq'::regclass),
  nombre character varying NOT NULL,
  id_clase_servicio integer,
  CONSTRAINT prod_componentes_menus_pkey PRIMARY KEY (id),
  CONSTRAINT fk_componentes_menus_clase_servicio FOREIGN KEY (id_clase_servicio) REFERENCES public.inv_clase_servicios(id)
);
CREATE TABLE public.prod_contratos (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL UNIQUE,
  no_contrato character varying,
  id_tercero integer NOT NULL,
  id_usuario integer NOT NULL,
  codigo character varying NOT NULL,
  id_sucursal integer NOT NULL,
  fecha_final date NOT NULL,
  fecha_inicial date NOT NULL,
  fecha_arranque date,
  objetivo character varying NOT NULL,
  observacion character varying NOT NULL,
  tasa_impuesto numeric NOT NULL,
  valor_racion numeric,
  valor_contrato numeric NOT NULL,
  valor_facturado numeric,
  estado integer,
  fecsys timestamp with time zone NOT NULL,
  no_ppl integer,
  no_ciclos integer,
  no_servicios integer NOT NULL,
  clausulas text,
  estado_proceso USER-DEFINED,
  CONSTRAINT prod_contratos_pkey PRIMARY KEY (fecha_inicial, id),
  CONSTRAINT fk_sucursal_contrato FOREIGN KEY (id_sucursal) REFERENCES public.gen_sucursales(id),
  CONSTRAINT fk_tercero_contrato FOREIGN KEY (id_tercero) REFERENCES public.con_terceros(id)
);
CREATE TABLE public.prod_minutas_contratos (
  id integer NOT NULL DEFAULT nextval('prod_minutas_contratos_id_seq'::regclass),
  id_contrato integer NOT NULL,
  id_unidad_servicio integer,
  id_sucursal integer NOT NULL,
  id_menu_contrato integer NOT NULL,
  id_producto_menu integer NOT NULL,
  id_maestro_producto integer NOT NULL,
  id_producto integer,
  id_medida integer NOT NULL,
  cantidad numeric NOT NULL,
  costo numeric NOT NULL,
  comentario character varying NOT NULL DEFAULT ''::character varying,
  estado integer NOT NULL,
  CONSTRAINT prod_minutas_contratos_pkey PRIMARY KEY (id),
  CONSTRAINT fk_minutas_unidad_servicio FOREIGN KEY (id_unidad_servicio) REFERENCES public.prod_unidad_servicios(id),
  CONSTRAINT fk_minutas_contrato FOREIGN KEY (id_contrato) REFERENCES public.prod_contratos(id),
  CONSTRAINT fk_minutas_sucursal FOREIGN KEY (id_sucursal) REFERENCES public.gen_sucursales(id),
  CONSTRAINT fk_minutas_maestro_producto FOREIGN KEY (id_maestro_producto) REFERENCES public.inv_productos(id),
  CONSTRAINT fk_minutas_medida FOREIGN KEY (id_medida) REFERENCES public.inv_medidas(id),
  CONSTRAINT fk_minutas_producto FOREIGN KEY (id_producto) REFERENCES public.inv_productos(id)
);
CREATE TABLE public.prod_planeacion_contratos (
  id integer NOT NULL DEFAULT nextval('prod_planeacion_contratos_id_seq'::regclass),
  no_req integer,
  id_contrato integer,
  id_sede integer,
  id_detalle_zona integer,
  fecha_inicial date,
  fecha_final date,
  num_ciclos integer,
  estado character varying DEFAULT 'ENPROCESO'::character varying CHECK (estado::text = ANY (ARRAY['ENPROCESO'::character varying, 'CERRADO'::character varying]::text[])),
  id_usuario integer,
  fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT prod_planeacion_contratos_pkey PRIMARY KEY (id),
  CONSTRAINT fk_prod_planeacion_contratos_id_contrato FOREIGN KEY (id_contrato) REFERENCES public.prod_contratos(id),
  CONSTRAINT fk_prod_planeacion_contratos_id_sede FOREIGN KEY (id_sede) REFERENCES public.gen_sucursales(id),
  CONSTRAINT fk_prod_planeacion_contratos_id_detalle_zona FOREIGN KEY (id_detalle_zona) REFERENCES public.prod_zonas_detalle_contratos(id),
  CONSTRAINT fk_prod_planeacion_contratos_id_usuario FOREIGN KEY (id_usuario) REFERENCES public.gen_usuarios(id)
);
CREATE TABLE public.prod_unidad_servicios (
  id integer NOT NULL DEFAULT nextval('prod_unidad_servicios_id_seq'::regclass),
  codigo integer,
  nombre_servicio character varying NOT NULL,
  no_ppl integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  activo boolean DEFAULT true,
  id_sucursal integer,
  CONSTRAINT prod_unidad_servicios_pkey PRIMARY KEY (id),
  CONSTRAINT fk_unidad_servicios_sucursal FOREIGN KEY (id_sucursal) REFERENCES public.gen_sucursales(id)
);
CREATE TABLE public.prod_zonas_by_contrato (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  id_zona integer NOT NULL,
  id_contrato integer NOT NULL,
  CONSTRAINT prod_zonas_by_contrato_pkey PRIMARY KEY (id),
  CONSTRAINT id_contratos FOREIGN KEY (id_contrato) REFERENCES public.prod_contratos(id),
  CONSTRAINT id_zona FOREIGN KEY (id_zona) REFERENCES public.prod_zonas_contrato(id)
);
CREATE TABLE public.prod_zonas_contrato (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  codigo character varying NOT NULL,
  nombre character varying NOT NULL,
  abreviatura character varying,
  no_ppl integer,
  activo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT prod_zonas_contrato_pkey PRIMARY KEY (id)
);
CREATE TABLE public.prod_zonas_detalle_contratos (
  id integer NOT NULL DEFAULT nextval('prod_zonas_detalle_contratos_id_seq'::regclass),
  id_zona integer NOT NULL,
  id_unidad_servicio integer NOT NULL,
  no_ppl integer,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT prod_zonas_detalle_contratos_pkey PRIMARY KEY (id),
  CONSTRAINT id_zona_FK FOREIGN KEY (id_zona) REFERENCES public.prod_zonas_contrato(id),
  CONSTRAINT id_unidad_FK FOREIGN KEY (id_unidad_servicio) REFERENCES public.prod_unidad_servicios(id)
);
CREATE TABLE public.productos_servicios (
  id integer NOT NULL DEFAULT nextval('productos_servicios_id_seq'::regclass),
  empresa_id character varying NOT NULL,
  codigo character varying NOT NULL,
  nombre character varying NOT NULL,
  descripcion text,
  linea_id integer,
  sublinea_id integer,
  categoria_id integer,
  unidad_medida_id integer,
  precio_base numeric DEFAULT 0,
  iva_porcentaje numeric DEFAULT 19,
  activo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT productos_servicios_pkey PRIMARY KEY (id),
  CONSTRAINT productos_servicios_linea_id_fkey FOREIGN KEY (linea_id) REFERENCES public.lineas_productos(id),
  CONSTRAINT productos_servicios_sublinea_id_fkey FOREIGN KEY (sublinea_id) REFERENCES public.sublineas_productos(id),
  CONSTRAINT productos_servicios_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES public.categorias_productos(id),
  CONSTRAINT productos_servicios_unidad_medida_id_fkey FOREIGN KEY (unidad_medida_id) REFERENCES public.unidades_medida(id)
);
CREATE TABLE public.regimenes_fiscales (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  codigo character varying NOT NULL UNIQUE,
  nombre character varying NOT NULL,
  descripcion text,
  activo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT regimenes_fiscales_pkey PRIMARY KEY (id)
);
CREATE TABLE public.remisiones (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  numero_remision character varying NOT NULL,
  fecha_remision date NOT NULL,
  fecha_entrega_estimada date,
  pedido_id uuid,
  cliente_id uuid NOT NULL,
  vendedor_id uuid,
  direccion_entrega text,
  ciudad_entrega character varying,
  telefono_contacto character varying,
  persona_contacto character varying,
  subtotal numeric NOT NULL DEFAULT 0,
  descuento_porcentaje numeric DEFAULT 0,
  descuento_valor numeric DEFAULT 0,
  iva_porcentaje numeric DEFAULT 19.00,
  iva_valor numeric DEFAULT 0,
  impoconsumo_valor numeric DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  observaciones text,
  instrucciones_entrega text,
  estado character varying NOT NULL DEFAULT 'BORRADOR'::character varying CHECK (estado::text = ANY (ARRAY['BORRADOR'::character varying, 'EN_TRANSITO'::character varying, 'ENTREGADO'::character varying, 'CANCELADO'::character varying]::text[])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  usuario_creacion uuid,
  usuario_actualizacion uuid,
  empresa_id integer,
  CONSTRAINT remisiones_pkey PRIMARY KEY (id),
  CONSTRAINT remisiones_pedido_id_fkey FOREIGN KEY (pedido_id) REFERENCES public.pedidos(id),
  CONSTRAINT remisiones_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id),
  CONSTRAINT remisiones_vendedor_id_fkey FOREIGN KEY (vendedor_id) REFERENCES public.vendedores(id),
  CONSTRAINT remisiones_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id)
);
CREATE TABLE public.remisiones_detalle (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  remision_id uuid NOT NULL,
  pedido_detalle_id uuid,
  producto_id integer NOT NULL,
  cantidad numeric NOT NULL,
  cantidad_entregada numeric DEFAULT 0,
  precio_unitario numeric NOT NULL,
  descuento_porcentaje numeric DEFAULT 0,
  descuento_valor numeric DEFAULT 0,
  subtotal numeric NOT NULL,
  iva_porcentaje numeric DEFAULT 19.00,
  iva_valor numeric DEFAULT 0,
  impoconsumo_valor numeric DEFAULT 0,
  total numeric NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT remisiones_detalle_pkey PRIMARY KEY (id),
  CONSTRAINT remisiones_detalle_remision_id_fkey FOREIGN KEY (remision_id) REFERENCES public.remisiones(id),
  CONSTRAINT remisiones_detalle_pedido_detalle_id_fkey FOREIGN KEY (pedido_detalle_id) REFERENCES public.pedidos_detalle(id),
  CONSTRAINT remisiones_detalle_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.inv_productos(id)
);
CREATE TABLE public.sublineas_productos (
  id integer NOT NULL DEFAULT nextval('sublineas_productos_id_seq'::regclass),
  linea_id integer NOT NULL,
  nombre character varying NOT NULL,
  descripcion text,
  activa boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT sublineas_productos_pkey PRIMARY KEY (id),
  CONSTRAINT sublineas_productos_linea_id_fkey FOREIGN KEY (linea_id) REFERENCES public.lineas_productos(id)
);
CREATE TABLE public.tipos_documento (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  codigo character varying NOT NULL UNIQUE,
  nombre character varying NOT NULL,
  descripcion text,
  activo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tipos_documento_pkey PRIMARY KEY (id)
);
CREATE TABLE public.tipos_persona (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  codigo character varying NOT NULL UNIQUE,
  nombre character varying NOT NULL,
  descripcion text,
  activo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tipos_persona_pkey PRIMARY KEY (id)
);
CREATE TABLE public.unidades_medida (
  id integer NOT NULL DEFAULT nextval('unidades_medida_id_seq'::regclass),
  nombre character varying NOT NULL,
  simbolo character varying NOT NULL,
  descripcion text,
  activa boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unidades_medida_pkey PRIMARY KEY (id)
);
CREATE TABLE public.vendedores (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  tipo_documento_id uuid NOT NULL,
  numero_documento character varying NOT NULL,
  primer_nombre character varying NOT NULL,
  segundo_nombre character varying,
  primer_apellido character varying NOT NULL,
  segundo_apellido character varying,
  telefono character varying,
  celular character varying,
  email character varying,
  codigo_vendedor character varying NOT NULL,
  comision_porcentaje numeric DEFAULT 0,
  meta_mensual numeric DEFAULT 0,
  activo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  usuario_creacion uuid,
  usuario_actualizacion uuid,
  empresa_id integer,
  CONSTRAINT vendedores_pkey PRIMARY KEY (id),
  CONSTRAINT vendedores_tipo_documento_id_fkey FOREIGN KEY (tipo_documento_id) REFERENCES public.tipos_documento(id),
  CONSTRAINT vendedores_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id)
);
CREATE TABLE public.ventas_directas (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  numero_venta character varying NOT NULL,
  fecha_venta date NOT NULL,
  cliente_id uuid,
  vendedor_id uuid,
  lista_precio_id uuid,
  subtotal numeric NOT NULL DEFAULT 0,
  descuento_porcentaje numeric DEFAULT 0,
  descuento_valor numeric DEFAULT 0,
  iva_porcentaje numeric DEFAULT 19.00,
  iva_valor numeric DEFAULT 0,
  impoconsumo_valor numeric DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  observaciones text,
  estado character varying NOT NULL DEFAULT 'COMPLETADA'::character varying CHECK (estado::text = ANY (ARRAY['BORRADOR'::character varying, 'COMPLETADA'::character varying, 'CANCELADA'::character varying]::text[])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  usuario_creacion uuid,
  usuario_actualizacion uuid,
  factura_id uuid,
  empresa_id integer,
  CONSTRAINT ventas_directas_pkey PRIMARY KEY (id),
  CONSTRAINT ventas_directas_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id),
  CONSTRAINT ventas_directas_vendedor_id_fkey FOREIGN KEY (vendedor_id) REFERENCES public.vendedores(id),
  CONSTRAINT ventas_directas_lista_precio_id_fkey FOREIGN KEY (lista_precio_id) REFERENCES public.listas_precios(id),
  CONSTRAINT ventas_directas_factura_id_fkey FOREIGN KEY (factura_id) REFERENCES public.facturas(id),
  CONSTRAINT ventas_directas_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id)
);
CREATE TABLE public.ventas_directas_detalle (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  venta_directa_id uuid NOT NULL,
  producto_id integer NOT NULL,
  cantidad numeric NOT NULL,
  precio_unitario numeric NOT NULL,
  descuento_porcentaje numeric DEFAULT 0,
  descuento_valor numeric DEFAULT 0,
  subtotal numeric NOT NULL,
  iva_porcentaje numeric DEFAULT 19.00,
  iva_valor numeric DEFAULT 0,
  impoconsumo_valor numeric DEFAULT 0,
  total numeric NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ventas_directas_detalle_pkey PRIMARY KEY (id),
  CONSTRAINT ventas_directas_detalle_venta_directa_id_fkey FOREIGN KEY (venta_directa_id) REFERENCES public.ventas_directas(id),
  CONSTRAINT ventas_directas_detalle_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.inv_productos(id)
);