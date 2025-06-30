import React, { useEffect, useState } from 'react';

interface EquipmentType {
  id: string;
  name: string;
  level: number;
  parentId: string | null;
}

function TestPost() {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [description, setDescription] = useState('');
  const [equipmentTypeId, setEquipmentTypeId] = useState('');
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([]);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedLevel1, setSelectedLevel1] = useState('');
  const [selectedLevel2, setSelectedLevel2] = useState('');
  const [selectedLevel3, setSelectedLevel3] = useState('');
  const [selectedLevel4, setSelectedLevel4] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResponse(null);

    try {
      const res = await fetch('http://localhost:3001/api/equipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, selectedLevel1,selectedLevel2,selectedLevel3,selectedLevel4, brand, model, description, equipmentTypeId }),
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
      .then(data => setEquipmentTypes(data))
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
        <div>
  <label>
    Domaine:
    <select
      value={selectedLevel1}
      onChange={e => {
        setSelectedLevel1(e.target.value);
        setSelectedLevel2('');
        setSelectedLevel3('');
        setSelectedLevel4('');
        setEquipmentTypeId(''); // reset
      }}
    >
      <option value="">Select Domaine</option>
      {equipmentTypes.filter(type => type.level === 1).map(type => (
        <option key={type.id} value={type.id}>{type.name}</option>
      ))}
    </select>
  </label>
</div>
{selectedLevel1 && (
  <div>
    <label>
      Type:
      <select
        value={selectedLevel2}
        onChange={e => {
          setSelectedLevel2(e.target.value);
          setSelectedLevel3('');
          setSelectedLevel4('');
          setEquipmentTypeId(''); // reset
        }}
      >
        <option value="">Select Type</option>
        {equipmentTypes.filter(type => type.level === 2 && type.parentId === selectedLevel1).map(type => (
          <option key={type.id} value={type.id}>{type.name}</option>
        ))}
      </select>
    </label>
  </div>
)}
{selectedLevel2 && (
  <div>
    <label>
      Catégorie:
      <select
        value={selectedLevel3}
        onChange={e => {
          setSelectedLevel3(e.target.value);
          setSelectedLevel4('');
          setEquipmentTypeId(''); // reset
        }}
      >
        <option value="">Select Catégorie</option>
        {equipmentTypes.filter(type => type.level === 3 && type.parentId === selectedLevel2).map(type => (
          <option key={type.id} value={type.id}>{type.name}</option>
        ))}
      </select>
    </label>
  </div>
)}
{selectedLevel3 && (
  <div>
    <label>
      Sous-catégorie:
      <select
        value={selectedLevel4}
        onChange={e => {
          setSelectedLevel4(e.target.value);
          setEquipmentTypeId(e.target.value);
        }}
      >
        <option value="">Select Sous-catégorie</option>
        {equipmentTypes.filter(type => type.level === 4 && type.parentId === selectedLevel3).map(type => (
          <option key={type.id} value={type.id}>{type.name}</option>
        ))}
      </select>
    </label>
  </div>
)}
          
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