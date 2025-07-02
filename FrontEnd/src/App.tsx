
import './App.css'

import { EquipmentProvider } from './contexts/EquipmentProvider'
import { EquipmentTypesProvider } from './contexts/EquipmentTypesProvider'
import EquipmentList from './Components/equipmentList'
import CreateEquipment from './Components/createEquipment'
import CreateEquipmentType from './Components/createEquipmentType'
function App() {
  

  return (<EquipmentTypesProvider>
    <EquipmentProvider>
      <EquipmentList/>
      <div className='flex gap-4'>
     <CreateEquipmentType/>
      <CreateEquipment/></div>
      
    </EquipmentProvider>
  </EquipmentTypesProvider>)
}

export default App
