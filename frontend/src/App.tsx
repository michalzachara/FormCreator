import {BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
	return <>
    {/* navbnar */}
    <BrowserRouter>
      <Routes>
        <Route path='/login' element={<div>Login Page</div>} />
        <Route path='/register' element={<div>Register Page</div>} />
        <Route path='/' element={<div>Home Page</div>} />
      </Routes>
    </BrowserRouter>
    {/* footer */}
  </>
}

export default App
