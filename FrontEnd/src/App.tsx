
import './App.css'
import GetAllEquipments from './Components/getAllEquipments'
import GetAllEquipmentTypes from './Components/getAllEquipmentTypes'
import TestPost from './Components/test'
import TestEquipmentPost from './Components/testequipment'

function App() {
  

  return (
    <>
     <TestEquipmentPost/>
      <TestPost/>
      <GetAllEquipments/>
      <GetAllEquipmentTypes/>
    </>
  )
}

export default App
