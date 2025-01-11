import { useState } from 'react'
import {Routes , Route} from 'react-router-dom'
import './App.css'
import Index from './Pages/Index'
import Signin from './Pages/Signin'
import Signup from './Pages/Signup'

function App() {
  
  return (
    <>
     <Routes>
      <Route path='/index' element={<Index/>} />
      <Route path='/signup' element={<Signup/>} />
      <Route path='/signin' element={<Signin/>} />
      <Route path='/' element={<Signin/>} />
      
     </Routes>
  
    </>
  )
}

export default App
