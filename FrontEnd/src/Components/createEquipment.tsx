import React, { useEffect, useState } from 'react';

interface EquipmentType {
  id: string;
  name: string;
  level: number;
  parentId: string | null;
}

function CreateEquipment() {
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
    <div className="w-1/2 mt-8 p-4 bg-[#242424] rounded-lg shadow-lg border border-gray-700">
      <h2 className="text-2xl font-bold mb-4 text-gray-100">Create an equipment</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-gray-200 font-medium mb-0.5">Name:
            <input value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full rounded border border-gray-600 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 px-2 py-1.5 text-sm bg-[#181818] text-gray-100 placeholder-gray-400" />
          </label>
        </div>
        <div>
          <label className="block text-gray-200 font-medium mb-0.5">Brand:
            <input value={brand} onChange={e => setBrand(e.target.value)} required className="mt-1 block w-full rounded border border-gray-600 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 px-2 py-1.5 text-sm bg-[#181818] text-gray-100 placeholder-gray-400" />
          </label>
        </div>
        <div>
          <label className="block text-gray-200 font-medium mb-0.5">Description:
            <input value={description} onChange={e => setDescription(e.target.value)} required className="mt-1 block w-full rounded border border-gray-600 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 px-2 py-1.5 text-sm bg-[#181818] text-gray-100 placeholder-gray-400" />
          </label>
        </div>
        <div>
          <label className="block text-gray-200 font-medium mb-0.5">Model:
            <input value={model} onChange={e => setModel(e.target.value)} required className="mt-1 block w-full rounded border border-gray-600 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 px-2 py-1.5 text-sm bg-[#181818] text-gray-100 placeholder-gray-400" />
          </label>
        </div>
        <div className="space-y-2">
          <div>
            <label className="block text-gray-200 font-medium mb-0.5">
              Domaine:
              <select
                value={selectedLevel1}
                onChange={e => {
                  setSelectedLevel1(e.target.value);
                  setSelectedLevel2('');
                  setSelectedLevel3('');
                  setSelectedLevel4('');
                  setEquipmentTypeId(e.target.value); // reset
                }}
                className="mt-1 block w-full rounded border border-gray-600 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 px-2 py-1.5 text-sm bg-[#181818] text-gray-100"
              >
                <option value="" className="text-gray-400">Select Domaine</option>
                {equipmentTypes.filter(type => type.level === 1).map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </label>
          </div>
          <div>
            <label className="block text-gray-200 font-medium mb-0.5">
              Type:
              <select
                value={selectedLevel2}
                onChange={e => {
                  setSelectedLevel2(e.target.value);
                  setSelectedLevel3('');
                  setSelectedLevel4('');
                  setEquipmentTypeId(e.target.value); // reset
                }}
                className="mt-1 block w-full rounded border border-gray-600 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 px-2 py-1.5 text-sm bg-[#181818] text-gray-100"
              >
                <option value="" className="text-gray-400">Select Type</option>
                {equipmentTypes.filter(type => type.level === 2 && type.parentId === selectedLevel1).map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </label>
          </div>
          <div>
            <label className="block text-gray-200 font-medium mb-0.5">
              Catégorie:
              <select
                value={selectedLevel3}
                onChange={e => {
                  setSelectedLevel3(e.target.value);
                  setSelectedLevel4('');
                  setEquipmentTypeId(e.target.value); // reset
                }}
                className="mt-1 block w-full rounded border border-gray-600 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 px-2 py-1.5 text-sm bg-[#181818] text-gray-100"
              >
                <option value="" className="text-gray-400">Select Catégorie</option>
                {equipmentTypes.filter(type => type.level === 3 && type.parentId === selectedLevel2).map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </label>
          </div>
          <div>
            <label className="block text-gray-200 font-medium mb-0.5">
              Sous-catégorie:
              <select
                value={selectedLevel4}
                onChange={e => {
                  setSelectedLevel4(e.target.value);
                  setEquipmentTypeId(e.target.value);
                }}
                className="mt-1 block w-full rounded border border-gray-600 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 px-2 py-1.5 text-sm bg-[#181818] text-gray-100"
              >
                <option value="" className="text-gray-400">Select Sous-catégorie</option>
                {equipmentTypes.filter(type => type.level === 4 && type.parentId === selectedLevel3).map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </label>
          </div>
        </div>
        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1.5 px-4 rounded-md shadow-sm transition-colors duration-200 text-sm border border-blue-700">CREATE EQUIPMENT</button>
      </form>
      {response && (
        <div className="mt-4 p-3 bg-green-900 border border-green-700 rounded">
          <h3 className="font-semibold text-green-300 mb-1">Response:</h3>
          <pre className="text-green-200 text-xs whitespace-pre-wrap">{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
      {error && (
        <div className="mt-4 p-3 bg-red-900 border border-red-700 rounded">
          <h3 className="font-semibold text-red-300 mb-1">Error:</h3>
          <pre className="text-red-200 text-xs whitespace-pre-wrap">{error}</pre>
        </div>
      )}
    </div>
  );
}

export default CreateEquipment;