
import './App.css'
import GetAllEquipments from './Components/getAllEquipments'
import GetAllEquipmentTypes from './Components/getAllEquipmentTypes'
import TestPost from './Components/test'
import TestEquipmentPost from './Components/testequipment'
import { EquipmentProvider } from './contexts/EquipmentProvider'
import { EquipmentTypesProvider } from './contexts/EquipmentTypesProvider'
import EquipmentList from './Components/equipmentList'
function App() {
  

  return (<EquipmentTypesProvider>
    <EquipmentProvider>
      <EquipmentList/>
     <TestEquipmentPost/>
      <TestPost/>
      <GetAllEquipments/>
      <GetAllEquipmentTypes/>
    </EquipmentProvider>
  </EquipmentTypesProvider>)
}

export default App
