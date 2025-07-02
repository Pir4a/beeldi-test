import React, { useState, useEffect } from 'react';

function CreateEquipmentType() {
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState('');
  const [level, setLevel] = useState(1);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState<string | null>(null);
  const [equipmentTypes, setEquipmentTypes] = useState<{ id: string; name: string; level: number }[]>([]);
  const [parentError, setParentError] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:3001/api/equipment-types')
      .then(res => res.json())
      .then(data => setEquipmentTypes(data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResponse(null);
    setParentError(null);

    if (level > 1 && !parentId) {
      setParentError('Parent is required for this level.');
      return;
    }

    // Build the payload
    const payload: Record<string, unknown> = { name, level };
    if (parentId.trim() !== '') payload.parentId = parentId;

    try {
      const res = await fetch('http://localhost:3001/api/equipment-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(JSON.stringify(data, null, 2));
      } else {
        setResponse(data);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    }
  };

  // Only show valid parents: level must be one less than selected level
  const validParentOptions = equipmentTypes.filter(type => type.level === level - 1);

  return (
    <div className="w-1/2 mt-8 p-4 bg-[#242424] rounded-lg shadow-lg border border-gray-700 flex flex-col min-h-[500px]">
      <h2 className="text-2xl font-bold mb-4 text-gray-100">Create Equipment Type</h2>
      <form onSubmit={handleSubmit} className="space-y-3 flex-1">
        <div>
          <label className="block text-gray-200 font-medium mb-0.5">Name:
            <input value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full rounded border border-gray-600 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 px-2 py-1.5 text-sm bg-[#181818] text-gray-100 placeholder-gray-400" />
          </label>
        </div>
        <div>
          <label className="block text-gray-200 font-medium mb-0.5">Parent Name:
            <select value={parentId} onChange={e => setParentId(e.target.value)} disabled={level === 1} required={level > 1} className="mt-1 block w-full rounded border border-gray-600 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 px-2 py-1.5 text-sm bg-[#181818] text-gray-100 disabled:bg-gray-800 disabled:text-gray-500">
              <option value="" className="text-gray-400">{level === 1 ? 'No parent' : 'Select parent'}</option>
              {validParentOptions.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </label>
          {parentError && <div className="mt-1 text-xs text-red-400">{parentError}</div>}
        </div>
        <div>
          <label className="block text-gray-200 font-medium mb-0.5">Type d'équipement:
            <select value={level} onChange={e => { setLevel(Number(e.target.value)); setParentId(''); }} required className="mt-1 block w-full rounded border border-gray-600 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 px-2 py-1.5 text-sm bg-[#181818] text-gray-100">
              <option value={1}>Domaine</option>
              <option value={2}>Type</option>
              <option value={3}>Catégorie</option>
              <option value={4}>Sous-catégorie</option>
            </select>
          </label>
        </div>
        <div className="mt-auto">
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1.5 px-4 rounded-md shadow-sm transition-colors duration-200 text-sm border border-blue-700">CREATE EQUIPMENT TYPE</button>
        </div>
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

export default CreateEquipmentType;