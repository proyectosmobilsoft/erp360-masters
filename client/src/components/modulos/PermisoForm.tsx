import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ModuloPermiso, CreateModuloPermisoData, UpdateModuloPermisoData } from '@/services/modulosService';
import { useRegisterView } from '@/hooks/useRegisterView';
import { Can } from '@/contexts/PermissionsContext';

const permisoSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  descripcion: z.string().optional(),
  code: z.string()
    .min(1, 'El código es requerido')
    .regex(/^[a-z0-9_-]+$/, 'El código solo puede contener letras minúsculas, números, guiones y guiones bajos')
    .max(50, 'El código no puede exceder 50 caracteres'),
});

type PermisoFormData = z.infer<typeof permisoSchema>;

interface PermisoFormProps {
  moduloId: number;
  permiso?: ModuloPermiso;
  onSubmit: (data: CreateModuloPermisoData | UpdateModuloPermisoData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const PermisoForm: React.FC<PermisoFormProps> = ({
  moduloId,
  permiso,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const { addAction } = useRegisterView('Modulos', 'formulario-permiso', 'Formulario de Permiso');

  React.useEffect(() => {
    addAction('guardar', 'Guardar Permiso');
    addAction('cancelar', 'Cancelar');
  }, [addAction]);

  // Función para generar código automáticamente
  const generateCode = (nombre: string) => {
    return nombre
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remover caracteres especiales
      .replace(/\s+/g, '_') // Reemplazar espacios con guiones bajos
      .substring(0, 50); // Limitar a 50 caracteres
  };

  const form = useForm<PermisoFormData>({
    resolver: zodResolver(permisoSchema),
    defaultValues: {
      nombre: permiso?.nombre || '',
      descripcion: permiso?.descripcion || '',
      code: permiso?.code || '',
    },
  });

  const handleSubmit = (data: PermisoFormData) => {
    if (permiso) {
      // Actualizar permiso existente
      onSubmit(data);
    } else {
      // Crear nuevo permiso
      onSubmit({
        ...data,
        modulo_id: moduloId,
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {permiso ? 'Editar Permiso' : 'Agregar Nuevo Permiso'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ingrese el nombre del permiso"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código *</FormLabel>
                  <FormControl>
                    <div className="flex space-x-2">
                      <Input
                        {...field}
                        placeholder="Ingrese el código del permiso (ej: usuarios_view)"
                        disabled={isLoading}
                        className="flex-1"
                      />
                      {!permiso && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const nombre = form.getValues('nombre');
                            if (nombre) {
                              const generatedCode = generateCode(nombre);
                              form.setValue('code', generatedCode);
                            }
                          }}
                          disabled={isLoading || !form.watch('nombre')}
                          title="Generar código automáticamente basado en el nombre"
                        >
                          Auto
                        </Button>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                  <p className="text-sm text-muted-foreground">
                    Solo letras minúsculas, números, guiones y guiones bajos. Máximo 50 caracteres.
                  </p>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Ingrese una descripción del permiso (opcional)"
                      disabled={isLoading}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Can action="accion-cancelar">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
              </Can>
              
              <Can action="accion-guardar">
                <Button
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? 'Guardando...' : permiso ? 'Actualizar' : 'Crear'}
                </Button>
              </Can>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
