
import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

type EquipmentData = { 
    id: string;
  name: string;
  equipmentTypeId: string;
  brand?: string;
  model?: string;
  description?: string;
  createdAt: string;
  updatedAt: string; }[];

const EquipmentDataContext = createContext<EquipmentData | undefined>(undefined);

// Define the type for the context value

// Provider component
export function EquipmentProvider({ children }: { children: ReactNode }) {
  const [equipmentData, setEquipmentData] = useState<EquipmentData>([]);

  useEffect(() => {
    // Fetch equipment types for the dropdown
    fetch('http://localhost:3001/api/equipments')
      .then(res => res.json())
      .then(data => setEquipmentData(data));
  }, []);

  return (
    <EquipmentDataContext.Provider value={equipmentData}>
      {children}
    </EquipmentDataContext.Provider>
  );
}
// eslint-disable-next-line react-refresh/only-export-components
export default function useEquipments() {
    const context = useContext(EquipmentDataContext);
    if (context === undefined) {
      throw new Error('useEquipments must be used within an EquipmentProvider');
    }
    return context;
  }