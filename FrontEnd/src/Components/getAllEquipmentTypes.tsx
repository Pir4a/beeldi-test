import React, { useEffect, useState } from 'react';

interface EquipmentType {
  id: string;
  name: string;
  parentId?: string | null;
  level: number;
  createdAt: string;
  updatedAt: string;
}

function GetAllEquipmentTypes() {
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEquipmentTypes = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('http://localhost:3001/api/equipment-types');
        if (!res.ok) throw new Error('Failed to fetch equipment types');
        const data = await res.json();
        setEquipmentTypes(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchEquipmentTypes();
  }, []);

  if (loading) return <div>Loading equipment types...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

  

  return (
    <div>
      <h2>All Equipment Types</h2>
      {equipmentTypes.length === 0 ? (
        <div>No equipment types found.</div>
      ) : (
        <ul>
          {equipmentTypes.map(type => (
            <li key={type.id}>
              <strong>{type.name}</strong> (Level: {type.level})<br />
              Parent ID: {type.parentId || 'None'}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default GetAllEquipmentTypes;
