import React, { useState } from 'react';

function TestEquipmentPost() {
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState('');
  const [level, setLevel] = useState(1);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResponse(null);

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

  return (
    <div>
      <h2>Test POST Equipment Type</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name: <input value={name} onChange={e => setName(e.target.value)} required /></label>
        </div>
        <div>
          <label>Parent ID: <input value={parentId} onChange={e => setParentId(e.target.value)} /></label>
        </div>
        <div>
          <label>Level: <input type="number" value={level} min={1} max={4} onChange={e => setLevel(Number(e.target.value))} required /></label>
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