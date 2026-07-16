// ============================================================
// PhishGuard UTB - Contexto de Autenticación
// ============================================================

import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Cargar sesión al montar
  useEffect(() => {
    const cargarSesion = async () => {
      const tokenGuardado = localStorage.getItem('phishguard_token');
      const usuarioGuardado = localStorage.getItem('phishguard_user');

      if (tokenGuardado && usuarioGuardado) {
        try {
          setToken(tokenGuardado);
          // Verificar token con el backend
          const res = await api.get('/auth/me');
          setUsuario(res.data.data.usuario);
        } catch (error) {
          // Token inválido o expirado
          localStorage.removeItem('phishguard_token');
          localStorage.removeItem('phishguard_user');
          setToken(null);
          setUsuario(null);
        }
      }
      setCargando(false);
    };

    cargarSesion();
  }, []);

  // Registro
  const registro = async (datos) => {
    const res = await api.post('/auth/register', datos);
    const { usuario: nuevoUsuario, token: nuevoToken } = res.data.data;
    
    localStorage.setItem('phishguard_token', nuevoToken);
    localStorage.setItem('phishguard_user', JSON.stringify(nuevoUsuario));
    setToken(nuevoToken);
    setUsuario(nuevoUsuario);
    
    return res.data;
  };

  // Login
  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { usuario: usuarioLogueado, token: nuevoToken } = res.data.data;
    
    localStorage.setItem('phishguard_token', nuevoToken);
    localStorage.setItem('phishguard_user', JSON.stringify(usuarioLogueado));
    setToken(nuevoToken);
    setUsuario(usuarioLogueado);
    
    return res.data;
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('phishguard_token');
    localStorage.removeItem('phishguard_user');
    setToken(null);
    setUsuario(null);
  };

  // Actualizar usuario en el contexto
  const actualizarUsuario = (datosActualizados) => {
    const actualizado = { ...usuario, ...datosActualizados };
    setUsuario(actualizado);
    localStorage.setItem('phishguard_user', JSON.stringify(actualizado));
  };

  const value = {
    usuario,
    token,
    cargando,
    estaAutenticado: !!token && !!usuario,
    esAdmin: usuario?.rol === 'admin',
    registro,
    login,
    logout,
    actualizarUsuario,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
