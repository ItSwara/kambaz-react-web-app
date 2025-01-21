// Swarali - Degaonkar
import './App.css'
import Labs from "./Labs";
import { HashRouter ,Route, Routes , Navigate } from "react-router-dom";
import Kambaz from "./Kambaz";



function App() {
  // const [count, setCount] = useState(0)

  return (
    <HashRouter>
       {/* Common Information */}
       <div style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
        Name: <b>Swarali Degaonkar</b> <br />
        Section: <b>01</b> <br />
        CRN: <b>35649</b> <br />
        GitHub Repo : <a href="https://github.com/ItSwara/kambaz-react-web-app.git" id="wd-github"> Link</a>
        <br />
      </div>


    <div>
    <Routes>
          <Route path="/" element={<Navigate to="Labs" />} />
          <Route path="/Labs/*" element={<Labs />} />
          <Route path="/Kambaz/*" element={<Kambaz />} />
          
        </Routes>
    </div>
    </HashRouter>
  )
}

export default App
