import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Home from "./Home"
import { RoomProvider } from "./RoomContext"
import Dashboard from "./Dashboard"; 

function App() {
  return (
    <RoomProvider>
      <Router>
        <Routes>
          <Route path='/' element={<Dashboard/>}/>
          <Route path='/home' element={<Home/>}/>
        </Routes>
      </Router>
    </RoomProvider>
  )
}

export default App