// ============================================================
// PhishGuard UTB - Mapa de Iconos (react-icons)
// Reemplaza emojis por iconos SVG reales
// ============================================================

import {
  FiShield, FiMail, FiUsers, FiPhone, FiHardDrive,
  FiAward, FiBarChart2, FiBookOpen, FiCheckCircle,
  FiClipboard, FiEdit3, FiSearch, FiStar, FiZap,
  FiLoader, FiTrendingUp, FiAlertTriangle, FiUser,
  FiLock, FiLogIn, FiUserPlus, FiDownload, FiArrowRight,
  FiArrowLeft, FiMenu, FiX, FiLogOut, FiToggleLeft,
  FiToggleRight, FiBell, FiCheck, FiSettings, FiPlus,
  FiTrash2, FiClock, FiTarget, FiGlobe,
} from 'react-icons/fi';

// Mapa de nombre de icono (string) -> componente React
const iconMap = {
  FiShield, FiMail, FiUsers, FiPhone, FiHardDrive,
  FiAward, FiBarChart2, FiBookOpen, FiCheckCircle,
  FiClipboard, FiEdit3, FiSearch, FiStar, FiZap,
  FiLoader, FiTrendingUp, FiAlertTriangle, FiUser,
  FiLock, FiLogIn, FiUserPlus, FiDownload, FiArrowRight,
  FiArrowLeft, FiMenu, FiX, FiLogOut, FiToggleLeft,
  FiToggleRight, FiBell, FiCheck, FiSettings, FiPlus,
  FiTrash2, FiClock, FiTarget, FiGlobe,
};

// Renderizar icono por nombre string (para datos de BD)
export const DynamicIcon = ({ name, size = 24, color, style = {} }) => {
  const IconComponent = iconMap[name];
  if (!IconComponent) return <FiShield size={size} color={color} style={style} />;
  return <IconComponent size={size} color={color} style={style} />;
};

// Iconos de modulos por titulo
export const MODULE_ICONS = {
  'Phishing': FiMail,
  'Pretexting': FiUsers,
  'Vishing': FiPhone,
  'Baiting': FiHardDrive,
};

// Obtener icono de modulo
export const getModuleIcon = (titulo) => {
  return MODULE_ICONS[titulo] || FiBookOpen;
};

export {
  FiShield, FiMail, FiUsers, FiPhone, FiHardDrive,
  FiAward, FiBarChart2, FiBookOpen, FiCheckCircle,
  FiClipboard, FiEdit3, FiSearch, FiStar, FiZap,
  FiLoader, FiTrendingUp, FiAlertTriangle, FiUser,
  FiLock, FiLogIn, FiUserPlus, FiDownload, FiArrowRight,
  FiArrowLeft, FiMenu, FiX, FiLogOut, FiToggleLeft,
  FiToggleRight, FiBell, FiCheck, FiSettings, FiPlus,
  FiTrash2, FiClock, FiTarget, FiGlobe,
};
