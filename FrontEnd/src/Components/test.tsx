import React, { useEffect, useState } from 'react';

interface EquipmentType {
  id: string;
  name: string;
}

function TestPost() {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [description, setDescription] = useState('');
  const [equipmentTypeId, setEquipmentTypeId] = useState('');
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([]);
  const [level, setLevel] = useState(1);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResponse(null);

    try {
      const res = await fetch('http://localhost:3001/api/equipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, level, brand, model, description, equipmentTypeId }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(JSON.stringify(data, null, 2));
      } else {
        setResponse(data);
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    // Fetch equipment types for the dropdown
    fetch('http://localhost:3001/api/equipment-types')
      .then(res => res.json())
      .then(data => setEquipmentTypes(data));
  }, []);


  return (
    <div>
      <h2>Test POST Equipment Type</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name: <input value={name} onChange={e => setName(e.target.value)} required /></label>
        </div>
        <div>
          <label>Brand: <input value={brand} onChange={e => setBrand(e.target.value)} required /></label>
        </div>
        <div>
          <label>Description: <input value={description} onChange={e => setDescription(e.target.value)} required /></label>
        </div>
        <div>
          <label>Model: <input value={model} onChange={e => setModel(e.target.value)} required /></label>
        </div>
       
        <div>
        <select value={equipmentTypeId} onChange={e => setEquipmentTypeId(e.target.value)} required>
        <option value="">Select equipment type</option>
        {equipmentTypes.map(type => (
          <option key={type.id} value={type.id}>{type.name}</option>
        ))}
      </select>
        </div>
      
        <div>
          <label>Level: <input type="number" value={level} min={1} max={4} onChange={e => setLevel(Number(e.target.value))} required /></label>
        </div>
        <button type="submit">Send POST</button>
      </form> <button onClick={()=> console.log(equipmentTypeId)}></button>
      {response && (
        <div>
          <h3>Response:</h3>
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
      {error && (
        <div style={{ color: 'red' }}>
          <h3>Error:</h3>
          <pre>{error}</pre>
        </div>
      )}
    </div>
  );
}

export default TestPost;