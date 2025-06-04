import { Routes, Route } from 'react-router-dom'
import './App.css'
import MenuComponent from './components/MenuComponent'
import NullPage from './pages/Null'
import Web3AuthWithAA from './pages/Web3AuthWithAA'
import AA from './pages/AA'
import AAWithPM from './pages/AAWithPM'
function App() {

  return (
    <div className="App">
      <nav>
        <MenuComponent />
      </nav>

      <Routes>
        <Route path="/" element={<NullPage name='home'/>} />
        <Route path="/aa" element={<AA />} />
        <Route path="/aa-with-pm" element={<AAWithPM />} />
        <Route path="/mpc-aa" element={<Web3AuthWithAA/>} />
      </Routes> 
    </div>
  )
}

export default App
