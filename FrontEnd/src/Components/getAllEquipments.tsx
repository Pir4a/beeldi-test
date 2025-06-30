import useEquipments from '../contexts/EquipmentProvider';



function GetAllEquipments() {
 // const [equipments, setEquipments] = useState<Equipment[]>([]);
  //const [loading, setLoading] = useState(true);
  //const [error, setError] = useState<string | null>(null);
  const equipments = useEquipments()


  // useEffect(() => {
  //   const fetchEquipments = async () => {
  //     setLoading(true);
  //     setError(null);
  //     try {
  //       const res = await fetch('http://localhost:3001/api/equipments');
  //       if (!res.ok) throw new Error('Failed to fetch equipments');
  //       const data = await res.json();
  //       setEquipments(data);
  //     } catch (err) {
  //       setError(err instanceof Error ? err.message : 'Unknown error');
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchEquipments();
  // }, []);

  // if (loading) return <div>Loading equipments...</div>;
  // if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

  return (
    <div>
      <button onClick={()=>console.log(equipments)}></button>
      <h2>All Equipments</h2>
      {equipments.length === 0 ? (
        <div>No equipments found.</div>
      ) : (
        <ul>
          {equipments.map(eq => (
            <li key={eq.id}>
              <strong>{eq.name}</strong> (Brand: {eq.brand || 'N/A'}, Model: {eq.model || 'N/A'})<br />
              Type ID: {eq.equipmentTypeId}<br />
              Description: {eq.description || 'N/A'}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default GetAllEquipments;