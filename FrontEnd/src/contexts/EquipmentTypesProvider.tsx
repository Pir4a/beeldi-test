
import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

type EquipmentType = {
    id: string;
    name: string;
    parentId: string | null;
    level: number;
    createdAt: string;
    updatedAt: string;
  }[];

const EquipmentTypesDataContext = createContext<EquipmentType | undefined>(undefined);

// Define the type for the context value

// Provider component
export function EquipmentTypesProvider({ children }: { children: ReactNode }) {
  const [equipmentTypesData, setEquipmentTypesData] = useState<EquipmentType>([]);

  useEffect(() => {
    // Fetch equipment types for the dropdown
    fetch('http://localhost:3001/api/equipment-types')
      .then(res => res.json())
      .then(data => setEquipmentTypesData(data));
  }, []);

  return (
    <EquipmentTypesDataContext.Provider value={equipmentTypesData}>
      {children}
    </EquipmentTypesDataContext.Provider>
  );
}
// eslint-disable-next-line react-refresh/only-export-components
export default function useEquipmentsTypes() {
    const context = useContext(EquipmentTypesDataContext);
    if (context === undefined) {
      throw new Error('useEquipments must be used within an EquipmentProvider');
    }
    return context;
  }