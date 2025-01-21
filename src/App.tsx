import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Labs from "./Labs";
import { HashRouter ,Route, Routes , Navigate } from "react-router-dom";
import Kambaz from "./Kambaz";



function App() {
  const [count, setCount] = useState(0)

  return (
    <HashRouter>
    <div>
    <Routes>
          <Route path="/" element={<Navigate to="Kambaz" />} />
          <Route path="/Labs/*" element={<Labs />} />
          <Route path="/Kambaz/*" element={<Kambaz />} />
          
        </Routes>
    </div>
    </HashRouter>
  )
}

export default App
