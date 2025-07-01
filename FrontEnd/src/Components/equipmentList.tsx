import React, { useState, useMemo } from 'react';
import useEquipments from '../contexts/EquipmentProvider';
import useEquipmentsTypes from '../contexts/EquipmentTypesProvider';

// Local type definitions
interface EquipmentType {
  id: string;
  name: string;
  parentId: string | null;
  level: number;
  createdAt: string;
  updatedAt: string;
}

interface Equipment {
  id: string;
  name: string;
  equipmentTypeId: string;
  brand?: string;
  model?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

function getTypeByLevel(
  equipmentTypes: EquipmentType[],
  id: string,
  level: number
): EquipmentType | undefined {
  let current = equipmentTypes.find((t) => t.id === id);
  while (true) {
    if (!current) return undefined;
    if (current.level === level) return current;
    if (!current.parentId) return undefined;
    current = equipmentTypes.find((t) => t.id === current?.parentId);
  }
}

const LEVELS = [
  { label: 'Domaine', value: 1 },
  { label: 'Type', value: 2 },
  { label: 'Catégorie', value: 3 },
  { label: 'Sous-catégorie', value: 4 },
];

function getTypeChain(equipmentTypes: EquipmentType[], equipmentTypeId: string) {
  // Returns {1: domainId, 2: typeId, 3: categorieId, 4: sousCategorieId}
  const chain: Record<number, string> = {};
  let current = equipmentTypes.find(t => t.id === equipmentTypeId);
  while (current) {
    chain[current.level] = current.id;
    current = equipmentTypes.find(t => t.id === current?.parentId);
  }
  return chain;
}

export default function EquipmentList() {
  const equipments: Equipment[] = useEquipments();
  const equipmentTypes: EquipmentType[] = useEquipmentsTypes();

  const [filters, setFilters] = useState<Record<number, string>>({
    1: '', // Domaine
    2: '', // Type
    3: '', // Catégorie
    4: '', // Sous-catégorie
  });
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingTypeId, setDeletingTypeId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTypeId, setEditingTypeId] = useState<string | null>(null);
  const [editEquipment, setEditEquipment] = useState<Partial<Equipment>>({});
  const [editEquipmentType, setEditEquipmentType] = useState<Partial<EquipmentType>>({});

  // Delete equipment
  const handleDeleteEquipment = async (id: string) => {
    setDeletingId(id);
    await fetch(`http://localhost:3001/api/equipments/${id}`, { method: 'DELETE' });
    window.location.reload();
  };

  // Delete equipment type
  const handleDeleteEquipmentType = async (id: string) => {
    setDeletingTypeId(id);
    await fetch(`http://localhost:3001/api/equipment-types/${id}`, { method: 'DELETE' });
    window.location.reload();
  };

  // Start editing equipment
  const startEditEquipment = (eq: Equipment) => {
    setEditingId(eq.id);
    setEditEquipment({ ...eq });
  };

  // Save equipment edit
  const saveEditEquipment = async () => {
    if (!editingId) return;
    await fetch(`http://localhost:3001/api/equipments/${editingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editEquipment),
    });
    setEditingId(null);
    setEditEquipment({});
    window.location.reload();
  };

  // Start editing equipment type
  const startEditEquipmentType = (type: EquipmentType) => {
    setEditingTypeId(type.id);
    setEditEquipmentType({ ...type });
  };

  // Save equipment type edit
  const saveEditEquipmentType = async () => {
    if (!editingTypeId) return;
    await fetch(`http://localhost:3001/api/equipment-types/${editingTypeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editEquipmentType),
    });
    setEditingTypeId(null);
    setEditEquipmentType({});
    window.location.reload();
  };

  // Filtered equipment list
  const filteredEquipments = useMemo(() => {
    return equipments.filter((eq) => {
      // Get the type chain for this equipment
      const typeChain: Record<number, string> = {};
      let current = equipmentTypes.find((t) => t.id === eq.equipmentTypeId);
      while (current) {
        typeChain[current.level] = current.id;
        current = equipmentTypes.find((t) => t.id === current?.parentId);
      }
      // Apply filters
      for (let level = 1; level <= 4; level++) {
        if (filters[level] && typeChain[level] !== filters[level]) {
          return false;
        }
      }
      // Search by name or domain
      const domainName = getTypeByLevel(equipmentTypes, eq.equipmentTypeId, 1)?.name || '';
      return (
        eq.name.toLowerCase().includes(search.toLowerCase()) ||
        domainName.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [equipments, equipmentTypes, filters, search]);

  // Options for each filter
  const filterOptions: Record<number, EquipmentType[]> = useMemo(() => {
    const options: Record<number, EquipmentType[]> = { 1: [], 2: [], 3: [], 4: [] };
    for (let level = 1; level <= 4; level++) {
      options[level] = equipmentTypes.filter((t) => t.level === level);
    }
    return options;
  }, [equipmentTypes]);

  return (
    <div>
      <h2>Equipment List</h2>
      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        {LEVELS.map(({ label, value }) => (
          <div key={value}>
            <label>{label}: </label>
            <select
              value={filters[value]}
              onChange={(e) => setFilters((f) => ({ ...f, [value]: e.target.value }))}
            >
              <option value=''>All</option>
              {filterOptions[value].map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.name}
                </option>
              ))}
            </select>
          </div>
        ))}
        <div>
          <label>Search Name/Domain: </label>
          <input
            type='text'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder='Search...'
          />
        </div>
      </div>
      <table border={1} cellPadding={6} style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Domaine</th>
            <th>Type</th>
            <th>Catégorie</th>
            <th>Sous-catégorie</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredEquipments.length === 0 ? (
            <tr>
              <td colSpan={6}>No equipments found.</td>
            </tr>
          ) : (
            filteredEquipments.map((eq) => {
              const domain = getTypeByLevel(equipmentTypes, eq.equipmentTypeId, 1)?.name || '';
              const type = getTypeByLevel(equipmentTypes, eq.equipmentTypeId, 2)?.name || '';
              const categorie = getTypeByLevel(equipmentTypes, eq.equipmentTypeId, 3)?.name || '';
              const sousCategorie = getTypeByLevel(equipmentTypes, eq.equipmentTypeId, 4)?.name || '';
              const isEditing = editingId === eq.id;

              // For editing: build the type chain and local state for dropdowns
              const typeChain = getTypeChain(equipmentTypes, editEquipment.equipmentTypeId || eq.equipmentTypeId);
              // Local state for dropdowns
              const [editChain, setEditChain] = isEditing
                ? [
                    {
                      1: typeChain[1] || '',
                      2: typeChain[2] || '',
                      3: typeChain[3] || '',
                      4: typeChain[4] || '',
                    },
                    (newChain: Record<number, string>) => {
                      // Only update equipmentTypeId in editEquipment
                      setEditEquipment(ed => ({
                        ...ed,
                        equipmentTypeId:
                          newChain[4] || newChain[3] || newChain[2] || newChain[1] || '',
                      }));
                    },
                  ]
                : [typeChain, () => {}];

              // Dropdown options
              const domainOptions = equipmentTypes.filter(t => t.level === 1);
              const typeOptions = equipmentTypes.filter(t => t.level === 2 && t.parentId === editChain[1]);
              const categorieOptions = equipmentTypes.filter(t => t.level === 3 && t.parentId === editChain[2]);
              const sousCategorieOptions = equipmentTypes.filter(t => t.level === 4 && t.parentId === editChain[3]);

              return (
                <tr key={eq.id}>
                  <td>
                    {isEditing ? (
                      <>
                        <input
                          value={editEquipment.name || ''}
                          onChange={e => setEditEquipment(ed => ({ ...ed, name: e.target.value }))}
                        />
                        <br />
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <select
                            value={editChain[1]}
                            onChange={e => {
                              const v = e.target.value;
                              setEditChain({ 1: v, 2: '', 3: '', 4: '' });
                            }}
                          >
                            <option value=''>Domaine</option>
                            {domainOptions.map(opt => (
                              <option key={opt.id} value={opt.id}>{opt.name}</option>
                            ))}
                          </select>
                          <select
                            value={editChain[2]}
                            onChange={e => {
                              const v = e.target.value;
                              setEditChain({ 1: editChain[1], 2: v, 3: '', 4: '' });
                            }}
                            disabled={!editChain[1]}
                          >
                            <option value=''>Type</option>
                            {typeOptions.map(opt => (
                              <option key={opt.id} value={opt.id}>{opt.name}</option>
                            ))}
                          </select>
                          <select
                            value={editChain[3]}
                            onChange={e => {
                              const v = e.target.value;
                              setEditChain({ 1: editChain[1], 2: editChain[2], 3: v, 4: '' });
                            }}
                            disabled={!editChain[2]}
                          >
                            <option value=''>Catégorie</option>
                            {categorieOptions.map(opt => (
                              <option key={opt.id} value={opt.id}>{opt.name}</option>
                            ))}
                          </select>
                          <select
                            value={editChain[4]}
                            onChange={e => {
                              const v = e.target.value;
                              setEditChain({ 1: editChain[1], 2: editChain[2], 3: editChain[3], 4: v });
                            }}
                            disabled={!editChain[3]}
                          >
                            <option value=''>Sous-catégorie</option>
                            {sousCategorieOptions.map(opt => (
                              <option key={opt.id} value={opt.id}>{opt.name}</option>
                            ))}
                          </select>
                        </div>
                      </>
                    ) : (
                      eq.name
                    )}
                  </td>
                  <td>{domain}</td>
                  <td>{type}</td>
                  <td>{categorie}</td>
                  <td>{sousCategorie}</td>
                  <td>
                    {isEditing ? (
                      <>
                        <button onClick={saveEditEquipment}>Save</button>
                        <button onClick={() => { setEditingId(null); setEditEquipment({}); }}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEditEquipment(eq)}>Edit</button>{' '}
                        <button
                          onClick={() => handleDeleteEquipment(eq.id)}
                          disabled={deletingId === eq.id}
                          style={{ color: 'red' }}
                        >
                          {deletingId === eq.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* Equipment Types Table for Deletion/Editing */}
      <h3 style={{ marginTop: 32 }}>Equipment Types</h3>
      <table border={1} cellPadding={6} style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Level</th>
            <th>Parent</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {equipmentTypes.length === 0 ? (
            <tr>
              <td colSpan={4}>No equipment types found.</td>
            </tr>
          ) : (
            equipmentTypes.map((type) => {
              const isEditing = editingTypeId === type.id;
              return (
                <tr key={type.id}>
                  <td>
                    {isEditing ? (
                      <input
                        value={editEquipmentType.name || ''}
                        onChange={e => setEditEquipmentType(ed => ({ ...ed, name: e.target.value }))}
                      />
                    ) : (
                      type.name
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <select
                        value={editEquipmentType.level || type.level}
                        onChange={e => setEditEquipmentType(ed => ({ ...ed, level: Number(e.target.value) }))}
                      >
                        {LEVELS.map(l => (
                          <option key={l.value} value={l.value}>{l.label}</option>
                        ))}
                      </select>
                    ) : (
                      LEVELS.find(l => l.value === type.level)?.label || type.level
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <select
                        value={editEquipmentType.parentId ?? type.parentId ?? ''}
                        onChange={e => setEditEquipmentType(ed => ({ ...ed, parentId: e.target.value }))}
                      >
                        <option value=''>None</option>
                        {equipmentTypes
                          .filter(t => t.id !== type.id && t.level === (editEquipmentType.level || type.level) - 1)
                          .map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                      </select>
                    ) : (
                      getTypeByLevel(equipmentTypes, type.parentId || '', type.level - 1)?.name || 'None'
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <>
                        <button onClick={saveEditEquipmentType}>Save</button>
                        <button onClick={() => { setEditingTypeId(null); setEditEquipmentType({}); }}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEditEquipmentType(type)}>Edit</button>{' '}
                        <button
                          onClick={() => handleDeleteEquipmentType(type.id)}
                          disabled={deletingTypeId === type.id}
                          style={{ color: 'red' }}
                        >
                          {deletingTypeId === type.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
