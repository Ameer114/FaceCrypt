import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Outputpage from"./components/Outputpage.jsx"
import Reg from "./components/Reg.jsx"
import Regface from './components/Regface.jsx'
import Records from './components/Records.jsx'
import { BrowserRouter as Router,Routes,Route} from 'react-router-dom'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path='/' element={<App />}></Route>
        <Route path='/reg' element={<Reg />}></Route>
        <Route path='/regface' element={<Regface/>} ></Route>
        <Route path='/rec' element={<Records/>}></Route>
        <Route path='/output' element={<Outputpage />}></Route>
      </Routes>
    </Router>
  </StrictMode>,
)
