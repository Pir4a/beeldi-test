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

  // Pagination for equipment types
  const [typesPage, setTypesPage] = useState(1);
  const TYPES_PER_PAGE = 15;
  const paginatedEquipmentTypes = useMemo(() => {
    const start = (typesPage - 1) * TYPES_PER_PAGE;
    return equipmentTypes.slice(start, start + TYPES_PER_PAGE);
  }, [equipmentTypes, typesPage]);
  const totalTypesPages = Math.ceil(equipmentTypes.length / TYPES_PER_PAGE);

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
      
      return (
      eq.brand && eq.brand.toLowerCase().includes(search.toLowerCase()) ||
        eq.model && eq.model.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [equipments, equipmentTypes, filters, search]);

  // equipment pagination (must be after filteredEquipments)
  const [equipPage, setEquipPage] = useState(1);
  const EQUIP_PER_PAGE = 5;
  const paginatedEquipments = useMemo(() => {
    const start = (equipPage - 1) * EQUIP_PER_PAGE;
    return filteredEquipments.slice(start, start + EQUIP_PER_PAGE);
  }, [filteredEquipments, equipPage]);
  const totalEquipPages = Math.ceil(filteredEquipments.length / EQUIP_PER_PAGE);
  const EQUIP_PAGE_RANGE = 5;
  const currentEquipRangeStart = Math.floor((equipPage - 1) / EQUIP_PAGE_RANGE) * EQUIP_PAGE_RANGE + 1;
  const currentEquipRangeEnd = Math.min(currentEquipRangeStart + EQUIP_PAGE_RANGE - 1, totalEquipPages);

  // Reset page when filters/search change
  React.useEffect(() => {
    setEquipPage(1);
  }, [filters, search]);

  // Calculate page range for pagination (5 at a time)
  const PAGE_RANGE = 5;
  const currentRangeStart = Math.floor((typesPage - 1) / PAGE_RANGE) * PAGE_RANGE + 1;
  const currentRangeEnd = Math.min(currentRangeStart + PAGE_RANGE - 1, totalTypesPages);

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

  // Options for each filter
  const filterOptions: Record<number, EquipmentType[]> = useMemo(() => {
    const options: Record<number, EquipmentType[]> = { 1: [], 2: [], 3: [], 4: [] };
    for (let level = 1; level <= 4; level++) {
      options[level] = equipmentTypes.filter((t) => t.level === level);
    }
    return options;
  }, [equipmentTypes]);

  return (
    <div className='max-w-[1200px] mx-auto p-6'>
      <h2 className='font-bold text-3xl pb-6'>Equipment List</h2>
      <div className='w-4/5 pt-8 grid grid-cols-2 place-items-center gap-6 mb-6 max-w-[1000px]'>
        {LEVELS.map(({ label, value }) => (
          <div key={value} className='min-w-[500px] flex items-center justify-end'>
            <label className="font-semibold">{label}: </label>
            <select
              value={filters[value]}
              onChange={(e) => setFilters((f) => ({ ...f, [value]: e.target.value }))}
              className='w-[250px] border border-gray-300 rounded-md p-2'
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
        
      </div>
      <div className='flex w-4/5 items-center flex-col justify-center mx-auto'>
          <label className="font-semibold">Search Name/Domain: </label>
          <input
            type='text'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder='Search...'
            className="p-1.5 rounded border border-gray-400 min-w-[180px]"
          />
        </div>
      <div className='w-full pt-8'>
        {/* Grid-based table header */}
        <div className="grid grid-cols-9 bg-[#242424] text-white font-semibold border-b border-gray-300">
          <div className='p-2'>Name</div>
          <div className='p-2'>Model</div>
          <div className='p-2'>Brand</div>
          <div className='p-2'>Description</div>
          <div className='p-2'>Domaine</div>
          <div className='p-2'>Type</div>
          <div className='p-2'>Catégorie</div>
          <div className='p-2'>Sous-catégorie</div>
          <div className='p-2'>Actions</div>
        </div>
        {/* Grid-based table body */}
        {paginatedEquipments.length === 0 ? (
          <div className="col-span-9 text-center p-6 color-[#888]">No equipments found.</div>
        ) : (
          paginatedEquipments.map((eq) => {
            const domain = getTypeByLevel(equipmentTypes, eq.equipmentTypeId, 1)?.name || '';
            const type = getTypeByLevel(equipmentTypes, eq.equipmentTypeId, 2)?.name || '';
            const categorie = getTypeByLevel(equipmentTypes, eq.equipmentTypeId, 3)?.name || '';
            const sousCategorie = getTypeByLevel(equipmentTypes, eq.equipmentTypeId, 4)?.name || '';
            return (
              <div key={eq.id} className="grid grid-cols-9 border-b w-full max-h-[125px] overflow-scroll border-[#eee] transition-colors duration-200">
                <div className="bg-[#242424]   text-white p-3 break-words whitespace-pre-line">{eq.name}</div>
                <div className="bg-[#242424] text-white p-3 break-words whitespace-pre-line">{eq.model || '-'}</div>
                <div className="bg-[#242424]  text-white p-3 break-words whitespace-pre-line">{eq.brand || '-'}</div>
                <div className="bg-[#242424]  break-words whitespace-pre-line text-white p-3">{eq.description || '-'}</div>
                <div className="bg-[#242424] text-white p-3 break-words whitespace-pre-line">{domain}</div>
                <div className="bg-[#242424] text-white p-3 break-words whitespace-pre-line">{type}</div>
                <div className="bg-[#242424] text-white p-3 break-words whitespace-pre-line">{categorie}</div>
                <div className="bg-[#242424] text-white p-3 break-words whitespace-pre-line">{sousCategorie}</div>
                <div className="bg-[#242424] text-white p-3 flex flex-col gap-1">
                  <button
                    onClick={() => openEditModal(eq)}
                    className="w-24 border-none rounded mb-1 cursor-pointer font-semibold text-amber-200"
                    title='Edit equipment'
                  >Edit</button>
                  <button
                    onClick={() => handleDeleteEquipment(eq.id)}
                    disabled={deletingId === eq.id}
                    className="text-white w-24 border-none rounded cursor-pointer font-semibold"
                    title='Delete equipment'
                  >{deletingId === eq.id ? 'Deleting...' : 'Delete'}</button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Equipments Pagination Controls */}
      {totalEquipPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            className="px-3 py-1 rounded bg-gray-700 text-white disabled:opacity-50"
            onClick={() => setEquipPage(p => Math.max(1, p - 1))}
            disabled={equipPage === 1}
          >Prev</button>
          <button
            className="px-3 py-1 rounded bg-gray-300 text-gray-800"
            onClick={() => setEquipPage(Math.max(1, currentEquipRangeStart - EQUIP_PAGE_RANGE))}
            disabled={currentEquipRangeStart === 1}
          >&lt;</button>
          {Array.from({ length: currentEquipRangeEnd - currentEquipRangeStart + 1 }, (_, i) => currentEquipRangeStart + i).map(pageNum => (
            <button
              key={pageNum}
              className={`px-3 py-1 rounded ${equipPage === pageNum ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
              onClick={() => setEquipPage(pageNum)}
            >{pageNum}</button>
          ))}
          <button
            className="px-3 py-1 rounded bg-gray-300 text-gray-800"
            onClick={() => setEquipPage(Math.min(totalEquipPages, currentEquipRangeStart + EQUIP_PAGE_RANGE))}
            disabled={currentEquipRangeEnd === totalEquipPages}
          >&gt;</button>
          <button
            className="px-3 py-1 rounded bg-gray-700 text-white disabled:opacity-50"
            onClick={() => setEquipPage(p => Math.min(totalEquipPages, p + 1))}
            disabled={equipPage === totalEquipPages}
          >Next</button>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && modalEquipment && (
        <div className="fixed top-0 left-0 w-screen h-screen bg-black/70 z-50 flex items-center justify-center">
          <div className="bg-[#242424] rounded-xl p-8 min-w-[400px] shadow-2xl relative">
            <h3 className="mt-0 mb-6 font-bold">Edit Equipment</h3>
            <div className="mb-4">
              <label className="font-semibold">Name:</label>
              <input
                value={modalEditEquipment.name || ''}
                onChange={e => setModalEditEquipment(ed => ({ ...ed, name: e.target.value }))}
                className="w-full p-2 rounded border border-gray-400 mt-1"
              />
            </div>
            <div className="mb-4">
              <label className="font-semibold">Model:</label>
              <input
                value={modalEditEquipment.model || ''}
                onChange={e => setModalEditEquipment(ed => ({ ...ed, model: e.target.value }))}
                className="w-full p-2 rounded border border-gray-400 mt-1"
              />
            </div>
            <div className="mb-4">
              <label className="font-semibold">Brand:</label>
              <input
                value={modalEditEquipment.brand || ''}
                onChange={e => setModalEditEquipment(ed => ({ ...ed, brand: e.target.value }))}
                className="w-full p-2 rounded border border-gray-400 mt-1"
              />
            </div>
            <div className="mb-4">
              <label className="font-semibold">Description:</label>
              <textarea
                value={modalEditEquipment.description || ''}
                onChange={e => setModalEditEquipment(ed => ({ ...ed, description: e.target.value }))}
                className="w-full p-2 rounded border border-gray-400 mt-1 min-h-[60px]"
              />
            </div>
            <div className="mb-4">
              <label className="font-semibold">Type:</label>
              <div className="flex gap-2 flex-wrap mt-1">
                <select
                  value={modalEditChain[1]}
                  onChange={e => {
                    const v = e.target.value;
                    setModalEditChain({ 1: v, 2: '', 3: '', 4: '' });
                  }}
                  className="p-1.5 rounded border border-gray-400 min-w-[120px]"
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
                  className="p-1.5 rounded border border-gray-400 min-w-[120px]"
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
                  className="p-1.5 rounded border border-gray-400 min-w-[120px]"
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
                  className="p-1.5 rounded border border-gray-400 min-w-[120px]"
                >
                  <option value=''>Sous-catégorie</option>
                  {equipmentTypes.filter(t => t.level === 4 && t.parentId === modalEditChain[3]).map(opt => (
                    <option key={opt.id} value={opt.id}>{opt.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={saveModalEdit}
                className="bg-[#1976d2] text-white border-none rounded py-2 px-5 font-semibold text-base cursor-pointer"
              >Save</button>
              <button
                onClick={() => { setShowEditModal(false); setModalEquipment(null); setModalEditEquipment({}); setModalEditChain({ 1: '', 2: '', 3: '', 4: '' }); }}
                className="bg-[#888] text-white border-none rounded py-2 px-5 font-semibold text-base cursor-pointer"
              >Cancel</button>
            </div>
            <button
              onClick={() => { setShowEditModal(false); setModalEquipment(null); setModalEditEquipment({}); setModalEditChain({ 1: '', 2: '', 3: '', 4: '' }); }}
              className="absolute top-3 right-4 bg-transparent border-none text-2xl text-gray-400 cursor-pointer"
              title='Close'
            >×</button>
          </div>
        </div>
      )}

      {/* Equipment Types Table for Deletion/Editing */}
      <h3 className='mt-12 font-bold text-2xl'>Equipment Types</h3>
      <div className="bg-[#242424] rounded-xl shadow-lg p-6 mt-3">
        <table className="w-full border-collapse text-base">
          <thead>
            <tr className="bg-[#242424] font-bold">
              <th className="p-2.5">Name</th>
              <th className="p-2.5">Level</th>
              <th className="p-2.5">Parent</th>
              <th className="p-2.5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {equipmentTypes.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center p-6 text-gray-400">No equipment types found.</td>
              </tr>
            ) : (
              paginatedEquipmentTypes.map((type) => {
                const isEditing = editingTypeId === type.id;
                return (
                  <tr key={type.id} className="border-b border-[#eee] transition-colors duration-200">
                    {isEditing ? (
                      <>
                        <td className="bg-[#242424] text-white p-3">
                          <input
                            value={editEquipmentType.name || ''}
                            onChange={e => setEditEquipmentType(ed => ({ ...ed, name: e.target.value }))}
                            className="w-full p-1 rounded border border-gray-400"
                          />
                        </td>
                        <td className="bg-[#242424] text-white p-3">
                          <select
                            value={editEquipmentType.level || type.level}
                            onChange={e => setEditEquipmentType(ed => ({ ...ed, level: Number(e.target.value) }))}
                            className="w-full p-1 rounded border border-gray-400"
                          >
                            {LEVELS.map(lvl => (
                              <option key={lvl.value} value={lvl.value}>{lvl.label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="bg-[#242424] text-white p-3">
                          <select
                            value={editEquipmentType.parentId || ''}
                            onChange={e => setEditEquipmentType(ed => ({ ...ed, parentId: e.target.value }))}
                            className="w-full p-1 rounded border border-gray-400"
                            disabled={(editEquipmentType.level || type.level) === 1}
                          >
                            <option value="">None</option>
                            {equipmentTypes
                              .filter(t => t.level === ((editEquipmentType.level || type.level) - 1))
                              .map(opt => (
                                <option key={opt.id} value={opt.id}>{opt.name}</option>
                              ))}
                          </select>
                        </td>
                        <td className="bg-[#242424] text-white p-3">
                          <button
                            onClick={saveEditEquipmentType}
                            className="w-[100px] bg-red-50"
                          >Save</button>
                          <button
                            onClick={() => { setEditingTypeId(null); setEditEquipmentType({}); }}
                            className="w-[100px] bg-gray-500"
                          >Cancel</button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="bg-[#242424] text-white p-3">{type.name}</td>
                        <td className="bg-[#242424] text-white p-3">{LEVELS.find(l => l.value === type.level)?.label || type.level}</td>
                        <td className="bg-[#242424] text-white p-3">{getTypeByLevel(equipmentTypes, type.parentId || '', type.level - 1)?.name || 'None'}</td>
                        <td className="bg-[#242424] text-white p-3">
                          <button
                            className='w-[100px] mx-auto text-amber-200'
                            onClick={() => startEditEquipmentType(type)}
                            title='Edit type'
                          >Edit</button>
                          <button
                            onClick={() => handleDeleteEquipmentType(type.id)}
                            disabled={deletingTypeId === type.id}
                            className="w-[100px] bg-[red] mx-auto"
                            title='Delete type'
                          >{deletingTypeId === type.id ? 'Deleting...' : 'Delete'}</button>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        {/* Pagination controls */}
        {totalTypesPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <button
              className="px-3 py-1 rounded bg-gray-700 text-white disabled:opacity-50"
              onClick={() => setTypesPage(p => Math.max(1, p - 1))}
              disabled={typesPage === 1}
            >Prev</button>
            {/* Previous range */}
            <button
              className="px-3 py-1 rounded bg-gray-300 text-gray-800"
              onClick={() => setTypesPage(Math.max(1, currentRangeStart - PAGE_RANGE))}
              disabled={currentRangeStart === 1}
            >&lt;</button>
            {/* Page numbers in current range */}
            {Array.from({ length: currentRangeEnd - currentRangeStart + 1 }, (_, i) => currentRangeStart + i).map(pageNum => (
              <button
                key={pageNum}
                className={`px-3 py-1 rounded ${typesPage === pageNum ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                onClick={() => setTypesPage(pageNum)}
              >{pageNum}</button>
            ))}
            {/* Next range */}
            <button
              className="px-3 py-1 rounded bg-gray-300 text-gray-800"
              onClick={() => setTypesPage(Math.min(totalTypesPages, currentRangeStart + PAGE_RANGE))}
              disabled={currentRangeEnd === totalTypesPages}
            >&gt;</button>
            <button
              className="px-3 py-1 rounded bg-gray-700 text-white disabled:opacity-50"
              onClick={() => setTypesPage(p => Math.min(totalTypesPages, p + 1))}
              disabled={typesPage === totalTypesPages}
            >Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
