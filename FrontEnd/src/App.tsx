
import './App.css'
import GetAllEquipments from './Components/getAllEquipments'
import GetAllEquipmentTypes from './Components/getAllEquipmentTypes'
import TestPost from './Components/test'
import TestEquipmentPost from './Components/testequipment'
import { EquipmentProvider } from './contexts/EquipmentProvider'

function App() {
  

  return (
    <EquipmentProvider>
     <TestEquipmentPost/>
      <TestPost/>
      <GetAllEquipments/>
      <GetAllEquipmentTypes/>
    </EquipmentProvider>
  )
}

export default App
