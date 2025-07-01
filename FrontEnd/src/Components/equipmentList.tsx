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
  const [editingTypeId, setEditingTypeId] = useState<string | null>(null);
  const [editEquipmentType, setEditEquipmentType] = useState<Partial<EquipmentType>>({});

  // Modal state for editing
  const [showEditModal, setShowEditModal] = useState(false);
  const [modalEquipment, setModalEquipment] = useState<Equipment | null>(null);
  const [modalEditEquipment, setModalEditEquipment] = useState<Partial<Equipment>>({});
  const [modalEditChain, setModalEditChain] = useState<Record<number, string>>({ 1: '', 2: '', 3: '', 4: '' });

  // Delete equipment
  const handleDeleteEquipment = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this equipment? This action cannot be undone.')) return;
    setDeletingId(id);
    await fetch(`http://localhost:3001/api/equipments/${id}`, { method: 'DELETE' });
    window.location.reload();
  };

  // Delete equipment type
  const handleDeleteEquipmentType = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this equipment type? This action cannot be undone.')) return;
    setDeletingTypeId(id);
    await fetch(`http://localhost:3001/api/equipment-types/${id}`, { method: 'DELETE' });
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

  // Open modal for editing
  const openEditModal = (eq: Equipment) => {
    setModalEquipment(eq);
    setModalEditEquipment({ ...eq });
    const typeChain = getTypeChain(equipmentTypes, eq.equipmentTypeId);
    setModalEditChain({
      1: typeChain[1] || '',
      2: typeChain[2] || '',
      3: typeChain[3] || '',
      4: typeChain[4] || '',
    });
    setShowEditModal(true);
  };

  // Save from modal
  const saveModalEdit = async () => {
    if (!modalEquipment) return;
    const newTypeId = modalEditChain[4] || modalEditChain[3] || modalEditChain[2] || modalEditChain[1] || '';
    await fetch(`http://localhost:3001/api/equipments/${modalEquipment.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...modalEditEquipment, equipmentTypeId: newTypeId }),
    });
    setShowEditModal(false);
    setModalEquipment(null);
    setModalEditEquipment({});
    setModalEditChain({ 1: '', 2: '', 3: '', 4: '' });
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
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      <h2 style={{ fontWeight: 700, fontSize: 28, marginBottom: 24 }}>Equipment List</h2>
      <div style={{ display: 'flex', gap: 24, marginBottom: 24, alignItems: 'flex-end' }}>
        {LEVELS.map(({ label, value }) => (
          <div key={value}>
            <label style={{ fontWeight: 600 }}>{label}: </label>
            <select
              value={filters[value]}
              onChange={(e) => setFilters((f) => ({ ...f, [value]: e.target.value }))}
              style={{ padding: 6, borderRadius: 4, border: '1px solid #bbb', minWidth: 120 }}
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
          <label style={{ fontWeight: 600 }}>Search Name/Domain: </label>
          <input
            type='text'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder='Search...'
            style={{ padding: 6, borderRadius: 4, border: '1px solid #bbb', minWidth: 180 }}
          />
        </div>
      </div>
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #0001', padding: 24 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 16 }}>
          <thead>
            <tr style={{ background: '#f5f5f5', fontWeight: 700 }}>
              <th style={{ padding: 10 }}>Name</th>
              <th style={{ padding: 10 }}>Model</th>
              <th style={{ padding: 10 }}>Brand</th>
              <th style={{ padding: 10 }}>Description</th>
              <th style={{ padding: 10 }}>Domaine</th>
              <th style={{ padding: 10 }}>Type</th>
              <th style={{ padding: 10 }}>Catégorie</th>
              <th style={{ padding: 10 }}>Sous-catégorie</th>
              <th style={{ padding: 10 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEquipments.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: 24, color: '#888' }}>No equipments found.</td>
              </tr>
            ) : (
              filteredEquipments.map((eq) => {
                const domain = getTypeByLevel(equipmentTypes, eq.equipmentTypeId, 1)?.name || '';
                const type = getTypeByLevel(equipmentTypes, eq.equipmentTypeId, 2)?.name || '';
                const categorie = getTypeByLevel(equipmentTypes, eq.equipmentTypeId, 3)?.name || '';
                const sousCategorie = getTypeByLevel(equipmentTypes, eq.equipmentTypeId, 4)?.name || '';
                return (
                  <tr key={eq.id} style={{ borderBottom: '1px solid #eee', transition: 'background 0.2s' }}>
                    <td style={{ padding: 10 }}>{eq.name}</td>
                    <td style={{ padding: 10 }}>{eq.model || '-'}</td>
                    <td style={{ padding: 10 }}>{eq.brand || '-'}</td>
                    <td style={{ padding: 10 }}>{eq.description || '-'}</td>
                    <td style={{ padding: 10 }}>{domain}</td>
                    <td style={{ padding: 10 }}>{type}</td>
                    <td style={{ padding: 10 }}>{categorie}</td>
                    <td style={{ padding: 10 }}>{sousCategorie}</td>
                    <td style={{ padding: 10 }}>
                      <button
                        onClick={() => openEditModal(eq)}
                        style={{ marginRight: 0, background: '#1976d2', width: 80, color: '#fff', border: 'none', borderRadius: 4, padding: '6px 14px', cursor: 'pointer', fontWeight: 600 }}
                        title='Edit equipment'
                      >Edit</button>
                      <button
                        onClick={() => handleDeleteEquipment(eq.id)}
                        disabled={deletingId === eq.id}
                        style={{ background: '#d32f2f', color: '#fff',width: 80, border: 'none', borderRadius: 4, padding: '6px 14px', cursor: 'pointer', fontWeight: 600 }}
                        title='Delete equipment'
                      >{deletingId === eq.id ? 'Deleting...' : 'Delete'}</button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {showEditModal && modalEquipment && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0007', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 400, boxShadow: '0 4px 24px #0002', position: 'relative' }}>
            <h3 style={{ marginTop: 0, marginBottom: 24, fontWeight: 700 }}>Edit Equipment</h3>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 600 }}>Name:</label>
              <input
                value={modalEditEquipment.name || ''}
                onChange={e => setModalEditEquipment(ed => ({ ...ed, name: e.target.value }))}
                style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #bbb', marginTop: 4 }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 600 }}>Model:</label>
              <input
                value={modalEditEquipment.model || ''}
                onChange={e => setModalEditEquipment(ed => ({ ...ed, model: e.target.value }))}
                style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #bbb', marginTop: 4 }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 600 }}>Brand:</label>
              <input
                value={modalEditEquipment.brand || ''}
                onChange={e => setModalEditEquipment(ed => ({ ...ed, brand: e.target.value }))}
                style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #bbb', marginTop: 4 }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 600 }}>Description:</label>
              <textarea
                value={modalEditEquipment.description || ''}
                onChange={e => setModalEditEquipment(ed => ({ ...ed, description: e.target.value }))}
                style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #bbb', marginTop: 4, minHeight: 60 }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 600 }}>Type:</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                <select
                  value={modalEditChain[1]}
                  onChange={e => {
                    const v = e.target.value;
                    setModalEditChain({ 1: v, 2: '', 3: '', 4: '' });
                  }}
                  style={{ padding: 6, borderRadius: 4, border: '1px solid #bbb', minWidth: 120 }}
                >
                  <option value=''>Domaine</option>
                  {equipmentTypes.filter(t => t.level === 1).map(opt => (
                    <option key={opt.id} value={opt.id}>{opt.name}</option>
                  ))}
                </select>
                <select
                  value={modalEditChain[2]}
                  onChange={e => {
                    const v = e.target.value;
                    setModalEditChain({ 1: modalEditChain[1], 2: v, 3: '', 4: '' });
                  }}
                  disabled={!modalEditChain[1]}
                  style={{ padding: 6, borderRadius: 4, border: '1px solid #bbb', minWidth: 120 }}
                >
                  <option value=''>Type</option>
                  {equipmentTypes.filter(t => t.level === 2 && t.parentId === modalEditChain[1]).map(opt => (
                    <option key={opt.id} value={opt.id}>{opt.name}</option>
                  ))}
                </select>
                <select
                  value={modalEditChain[3]}
                  onChange={e => {
                    const v = e.target.value;
                    setModalEditChain({ 1: modalEditChain[1], 2: modalEditChain[2], 3: v, 4: '' });
                  }}
                  disabled={!modalEditChain[2]}
                  style={{ padding: 6, borderRadius: 4, border: '1px solid #bbb', minWidth: 120 }}
                >
                  <option value=''>Catégorie</option>
                  {equipmentTypes.filter(t => t.level === 3 && t.parentId === modalEditChain[2]).map(opt => (
                    <option key={opt.id} value={opt.id}>{opt.name}</option>
                  ))}
                </select>
                <select
                  value={modalEditChain[4]}
                  onChange={e => {
                    const v = e.target.value;
                    setModalEditChain({ 1: modalEditChain[1], 2: modalEditChain[2], 3: modalEditChain[3], 4: v });
                  }}
                  disabled={!modalEditChain[3]}
                  style={{ padding: 6, borderRadius: 4, border: '1px solid #bbb', minWidth: 120 }}
                >
                  <option value=''>Sous-catégorie</option>
                  {equipmentTypes.filter(t => t.level === 4 && t.parentId === modalEditChain[3]).map(opt => (
                    <option key={opt.id} value={opt.id}>{opt.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button
                onClick={saveModalEdit}
                style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 20px', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}
              >Save</button>
              <button
                onClick={() => { setShowEditModal(false); setModalEquipment(null); setModalEditEquipment({}); setModalEditChain({ 1: '', 2: '', 3: '', 4: '' }); }}
                style={{ background: '#888', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 20px', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}
              >Cancel</button>
            </div>
            <button
              onClick={() => { setShowEditModal(false); setModalEquipment(null); setModalEditEquipment({}); setModalEditChain({ 1: '', 2: '', 3: '', 4: '' }); }}
              style={{ position: 'absolute', top: 12, right: 16, background: 'none', border: 'none', fontSize: 24, color: '#888', cursor: 'pointer' }}
              title='Close'
            >×</button>
          </div>
        </div>
      )}

      {/* Equipment Types Table for Deletion/Editing */}
      <h3 style={{ marginTop: 48, fontWeight: 700, fontSize: 22 }}>Equipment Types</h3>
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #0001', padding: 24, marginTop: 12 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 16 }}>
          <thead>
            <tr style={{ background: '#f5f5f5', fontWeight: 700 }}>
              <th style={{ padding: 10 }}>Name</th>
              <th style={{ padding: 10 }}>Level</th>
              <th style={{ padding: 10 }}>Parent</th>
              <th style={{ padding: 10 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {equipmentTypes.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: 24, color: '#888' }}>No equipment types found.</td>
              </tr>
            ) : (
              equipmentTypes.map((type) => {
                const isEditing = editingTypeId === type.id;
                return (
                  <tr key={type.id} style={{ borderBottom: '1px solid #eee', transition: 'background 0.2s' }}>
                    <td style={{ padding: 10 }}>
                      {isEditing ? (
                        <input
                          value={editEquipmentType.name || ''}
                          onChange={e => setEditEquipmentType(ed => ({ ...ed, name: e.target.value }))}
                          style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #bbb' }}
                        />
                      ) : (
                        type.name
                      )}
                    </td>
                    <td style={{ padding: 10 }}>
                      {isEditing ? (
                        <select
                          value={editEquipmentType.level || type.level}
                          onChange={e => setEditEquipmentType(ed => ({ ...ed, level: Number(e.target.value) }))}
                          style={{ padding: 6, borderRadius: 4, border: '1px solid #bbb', minWidth: 100 }}
                        >
                          {LEVELS.map(l => (
                            <option key={l.value} value={l.value}>{l.label}</option>
                          ))}
                        </select>
                      ) : (
                        LEVELS.find(l => l.value === type.level)?.label || type.level
                      )}
                    </td>
                    <td style={{ padding: 10 }}>
                      {isEditing ? (
                        <select
                          value={editEquipmentType.parentId ?? type.parentId ?? ''}
                          onChange={e => setEditEquipmentType(ed => ({ ...ed, parentId: e.target.value }))}
                          style={{ padding: 6, borderRadius: 4, border: '1px solid #bbb', minWidth: 100 }}
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
                    <td style={{ padding: 10 }}>
                      {isEditing ? (
                        <>
                          <button
                            onClick={saveEditEquipmentType}
                            style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 14px', fontWeight: 600, fontSize: 16, cursor: 'pointer', marginRight: 8 }}
                          >Save</button>
                          <button
                            onClick={() => { setEditingTypeId(null); setEditEquipmentType({}); }}
                            style={{ background: '#888', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 14px', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}
                          >Cancel</button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEditEquipmentType(type)}
                            style={{ marginRight: 8, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 14px', cursor: 'pointer', fontWeight: 600 }}
                            title='Edit type'
                          >Edit</button>
                          <button
                            onClick={() => handleDeleteEquipmentType(type.id)}
                            disabled={deletingTypeId === type.id}
                            style={{ background: '#d32f2f', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 14px', cursor: 'pointer', fontWeight: 600 }}
                            title='Delete type'
                          >{deletingTypeId === type.id ? 'Deleting...' : 'Delete'}</button>
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
    </div>
  );
}
