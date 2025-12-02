import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import FormBuilderPage from './pages/FormBuilderPage'
import PublicTest from './pages/PublicTest'
import Login from './pages/Login'
import Register from './pages/Register'
import { AuthProvider } from './context/AuthContext'
import ToastProvider from './components/ToastProvider'

function App() {
	return (
		<AuthProvider>
			<ToastProvider />
			{/* navbnar */}
			<BrowserRouter>
				<Routes>
					<Route path="/login" element={<Login />} />
					<Route path="/register" element={<Register />} />
					<Route path="/" element={<Home />} />
					<Route path="/test/:id/builder" element={<FormBuilderPage />} />
					<Route path="/public/:link" element={<PublicTest />} />
				</Routes>
			</BrowserRouter>
			{/* footer */}
		</AuthProvider>
	)
}

export default App
