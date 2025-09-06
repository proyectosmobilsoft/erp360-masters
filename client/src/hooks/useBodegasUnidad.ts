import { useQuery } from '@tanstack/react-query';
import { bodegasService, BodegaUnidadData } from '@/services/bodegasService';

export interface UseBodegasUnidadOptions {
  unidadId?: number;
  enabled?: boolean;
}

export const useBodegasUnidad = ({ unidadId, enabled = true }: UseBodegasUnidadOptions) => {
  const query = useQuery({
    queryKey: ['bodegas-unidad', unidadId],
    queryFn: () => bodegasService.getBodegasByUnidad(unidadId!),
    enabled: enabled && !!unidadId,
  });

  return {
    bodegas: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};
