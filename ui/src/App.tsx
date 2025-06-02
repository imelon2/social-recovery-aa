import { Routes, Route } from 'react-router-dom'
import './App.css'
import MenuComponent from './components/MenuComponent'
import NullPage from './pages/Null'
import Web3AuthWithAA from './pages/Web3AuthWithAA'
import AA from './pages/AA'
function App() {

  return (
    <div className="App">
      <nav>
        <MenuComponent />
      </nav>

      <Routes>
        <Route path="/" element={<NullPage name='home'/>} />
        <Route path="/mpc-aa" element={<Web3AuthWithAA/>} />
        <Route path="/aa" element={<AA />} />
      </Routes> 
    </div>
  )
}

export default App
