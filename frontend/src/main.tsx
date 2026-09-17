import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'

import Layout from './Layout.tsx'
import Home from './pages/Home.tsx'
import Login from './pages/Login.tsx'
import Cadastro from './pages/Cadastro.tsx'
import DetalheImovel from './pages/DetalheImovel.tsx'
import NovoImovel from './pages/NovoImovel.tsx'
import MinhasReservas from './pages/MinhasReservas.tsx'

import AdminLogin from './pages/admin/AdminLogin.tsx'
import AdminLayout from './pages/admin/AdminLayout.tsx'
import Dashboard from './pages/admin/Dashboard.tsx'
import ImoveisAdmin from './pages/admin/Imoveis.tsx'
import ReservasAdmin from './pages/admin/Reservas.tsx'

const rotas = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'login', element: <Login /> },
      { path: 'cadastro', element: <Cadastro /> },
      { path: 'imovel/novo', element: <NovoImovel /> },
      { path: 'imovel/:imovelId', element: <DetalheImovel /> },
      { path: 'minhas-reservas', element: <MinhasReservas /> },
      { path: 'admin/login', element: <AdminLogin /> },
      {
        path: 'admin',
        element: <AdminLayout />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: 'imoveis', element: <ImoveisAdmin /> },
          { path: 'reservas', element: <ReservasAdmin /> },
        ],
      },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={rotas} />
  </StrictMode>,
)
