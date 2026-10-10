import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import CartPage from './pages/CartPage.jsx'
import Checkout from './pages/Checkout.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Orders from './pages/Orders.jsx'
import AdminProducts from './pages/admin/AdminProducts.jsx'
import AdminOrders from './pages/admin/AdminOrders.jsx'
import CompraTranquila from './pages/CompraTranquila.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AdminRoute from './components/AdminRoute.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { AuthProvider } from './context/AuthProvider.jsx'
import { CompraTranquilaProvider } from './context/CompraTranquilaProvider.jsx'
import { ArrepentimientoProvider } from './context/ArrepentimientoProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <CompraTranquilaProvider>
            <ArrepentimientoProvider>
            <Routes>
              <Route path="/" element={<App />} />
              <Route path="/compra-tranquila" element={<CompraTranquila />} />
              <Route path="/carrito" element={<CartPage />} />
              <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/registro" element={<Register />} />
              <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
              <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
            </Routes>
            </ArrepentimientoProvider>
          </CompraTranquilaProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
