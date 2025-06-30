import React, { useState, useEffect } from 'react';

function TestEquipmentPost() {
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
    <div>
      <h2>Test POST Equipment Type</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name: <input value={name} onChange={e => setName(e.target.value)} required /></label>
        </div>
        <div>
          <label>Parent Name: 
            <select value={parentId} onChange={e => setParentId(e.target.value)} disabled={level === 1} required={level > 1}>
              <option value="">{level === 1 ? 'No parent' : 'Select parent'}</option>
              {validParentOptions.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </label>
          {parentError && <div style={{ color: 'red' }}>{parentError}</div>}
        </div>
        <div>
          <label>Type d'équipement: <select value={level} onChange={e => { setLevel(Number(e.target.value)); setParentId(''); }} required>
      <option value={1}>Domaine</option>
      <option value={2}>Type</option>
      <option value={3}>Catégorie</option>
      <option value={4}>Sous-catégorie</option>
    </select></label>
        </div>
        <button type="submit">Send POST</button>
      </form>
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

export default TestEquipmentPost;