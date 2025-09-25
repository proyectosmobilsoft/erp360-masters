import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Clock, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModernTimePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  format?: 'HH:mm:ss' | 'HH:mm';
  allowSeconds?: boolean;
}

export const ModernTimePicker: React.FC<ModernTimePickerProps> = ({
  value = '00:00:00',
  onChange,
  placeholder = 'Seleccionar tiempo',
  className,
  disabled = false,
  format = 'HH:mm:ss',
  allowSeconds = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [timeParts, setTimeParts] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Parsear el valor inicial
  useEffect(() => {
    if (value) {
      const parts = value.split(':');
      setTimeParts({
        hours: parseInt(parts[0]) || 0,
        minutes: parseInt(parts[1]) || 0,
        seconds: parseInt(parts[2]) || 0
      });
      setInputValue(value);
    }
  }, [value]);

  // Formatear tiempo
  const formatTime = (hours: number, minutes: number, seconds: number): string => {
    const h = hours.toString().padStart(2, '0');
    const m = minutes.toString().padStart(2, '0');
    const s = seconds.toString().padStart(2, '0');
    
    if (format === 'HH:mm:ss' && allowSeconds) {
      return `${h}:${m}:${s}`;
    }
    return `${h}:${m}`;
  };

  // Actualizar tiempo
  const updateTime = (newTimeParts: Partial<typeof timeParts>) => {
    const updated = { ...timeParts, ...newTimeParts };
    
    // Validaciones
    if (updated.hours < 0) updated.hours = 23;
    if (updated.hours > 23) updated.hours = 0;
    if (updated.minutes < 0) { updated.minutes = 59; updated.hours = Math.max(0, updated.hours - 1); }
    if (updated.minutes > 59) { updated.minutes = 0; updated.hours = Math.min(23, updated.hours + 1); }
    if (updated.seconds < 0) { updated.seconds = 59; updated.minutes = Math.max(0, updated.minutes - 1); }
    if (updated.seconds > 59) { updated.seconds = 0; updated.minutes = Math.min(59, updated.minutes + 1); }

    setTimeParts(updated);
    const formatted = formatTime(updated.hours, updated.minutes, updated.seconds);
    setInputValue(formatted);
    onChange?.(formatted);
  };

  // Manejar input manual
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    
    // Validar formato
    const timeRegex = allowSeconds 
      ? /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/
      : /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    
    if (timeRegex.test(val)) {
      const parts = val.split(':');
      setTimeParts({
        hours: parseInt(parts[0]),
        minutes: parseInt(parts[1]),
        seconds: parts[2] ? parseInt(parts[2]) : 0
      });
      onChange?.(val);
    }
  };

  const handleInputBlur = () => {
    // Si el input no es válido, restaurar el último valor válido
    const timeRegex = allowSeconds 
      ? /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/
      : /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    
    if (!timeRegex.test(inputValue)) {
      const formatted = formatTime(timeParts.hours, timeParts.minutes, timeParts.seconds);
      setInputValue(formatted);
    }
  };

  const TimeSelector = () => (
    <div className="p-3 space-y-4 min-w-[200px]">
      {/* Horas */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Horas</label>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateTime({ hours: timeParts.hours - 1 })}
            className="h-8 w-8 p-0"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <div className="flex-1 text-center text-lg font-mono bg-gray-50 rounded px-2 py-1">
            {timeParts.hours.toString().padStart(2, '0')}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateTime({ hours: timeParts.hours + 1 })}
            className="h-8 w-8 p-0"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Minutos */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Minutos</label>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateTime({ minutes: timeParts.minutes - 1 })}
            className="h-8 w-8 p-0"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <div className="flex-1 text-center text-lg font-mono bg-gray-50 rounded px-2 py-1">
            {timeParts.minutes.toString().padStart(2, '0')}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateTime({ minutes: timeParts.minutes + 1 })}
            className="h-8 w-8 p-0"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Segundos */}
      {allowSeconds && format === 'HH:mm:ss' && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Segundos</label>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateTime({ seconds: timeParts.seconds - 1 })}
              className="h-8 w-8 p-0"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
            <div className="flex-1 text-center text-lg font-mono bg-gray-50 rounded px-2 py-1">
              {timeParts.seconds.toString().padStart(2, '0')}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateTime({ seconds: timeParts.seconds + 1 })}
              className="h-8 w-8 p-0"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Input
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            placeholder={placeholder}
            disabled={disabled}
            className={cn("pr-10", className)}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setIsOpen(!isOpen)}
            disabled={disabled}
          >
            <Clock className="h-4 w-4 text-gray-400" />
          </Button>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <TimeSelector />
      </PopoverContent>
    </Popover>
  );
};
