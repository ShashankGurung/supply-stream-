import { useState, useEffect, useCallback, useRef } from 'react';
import { generateInitialState, simulateUpdate, WarehouseState, IncidentType } from '@/data/warehouseData';

export function useWarehouseSimulation(intervalMs = 5000) {
  const [state, setState] = useState<WarehouseState>(generateInitialState);
  const [activeIncident, setActiveIncident] = useState<IncidentType>(null);
  const [isPaused, setIsPaused] = useState(false);
  const incidentRef = useRef<IncidentType>(null);
  const incidentCountRef = useRef(0);

  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(() => {
      setState(prev => {
        const updated = simulateUpdate(prev, incidentRef.current);
        if (incidentRef.current) {
          incidentCountRef.current++;
          if (incidentCountRef.current >= 6) { // ~30 seconds
            incidentRef.current = null;
            setActiveIncident(null);
            incidentCountRef.current = 0;
          }
        }
        return updated;
      });
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, isPaused]);

  const triggerIncident = useCallback((type: IncidentType) => {
    incidentRef.current = type;
    incidentCountRef.current = 0;
    setActiveIncident(type);
    // Immediately trigger one update
    setState(prev => simulateUpdate(prev, type));
  }, []);

  return { state, activeIncident, triggerIncident, isPaused, setIsPaused };
}
