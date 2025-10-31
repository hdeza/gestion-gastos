"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { User, Settings, Key, Trash2, Edit3, Save, X } from "lucide-react";
import { User as UserType } from "../../types/auth";
import Swal from 'sweetalert2';

interface ProfileFormData {
  nombre: string;
  moneda_preferida: string;
  foto_perfil: string;
}

interface PasswordFormData {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

const ProfilePage: React.FC = () => {
  const { user, getProfile, updateProfile, changePassword, deleteAccount, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'view' | 'edit' | 'password' | 'settings'>('view');
  const [profileData, setProfileData] = useState<ProfileFormData>({
    nombre: '',
    moneda_preferida: '',
    foto_perfil: ''
  });
  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const currencies = [
    { value: 'COP', label: 'Peso Colombiano (COP)' },
    { value: 'USD', label: 'Dólar Estadounidense (USD)' },
    { value: 'EUR', label: 'Euro (EUR)' },
    { value: 'MXN', label: 'Peso Mexicano (MXN)' },
    { value: 'ARS', label: 'Peso Argentino (ARS)' },
  ];

  // Funciones de utilidad para mostrar mensajes con SweetAlert2
  const showSuccessMessage = async (title: string, text: string) => {
    await Swal.fire({
      title,
      text,
      icon: 'success',
      timer: 2000,
      showConfirmButton: false,
      buttonsStyling: false
    });
  };

  const showErrorMessage = async (title: string, text: string) => {
    await Swal.fire({
      title,
      text,
      icon: 'error',
      confirmButtonText: 'Entendido',
      buttonsStyling: false,
      customClass: {
        confirmButton: 'swal2-confirm'
      }
    });
  };

  useEffect(() => {
    if (user) {
      setProfileData({
        nombre: user.nombre || '',
        moneda_preferida: user.moneda_preferida || 'COP',
        foto_perfil: user.foto_perfil || ''
      });
    }
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileData.nombre.trim()) {
      await showErrorMessage('Campo obligatorio', 'El nombre es obligatorio');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await updateProfile({
        nombre: profileData.nombre,
        moneda_preferida: profileData.moneda_preferida,
        foto_perfil: profileData.foto_perfil || undefined
      });
      await showSuccessMessage('Perfil actualizado', 'Tu perfil ha sido actualizado exitosamente.');
      setIsEditing(false);
    } catch (err) {
      await showErrorMessage('Error', err instanceof Error ? err.message : 'Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.new_password !== passwordData.confirm_password) {
      await showErrorMessage('Contraseñas no coinciden', 'Las contraseñas nuevas no coinciden');
      return;
    }

    if (passwordData.new_password.length < 6) {
      await showErrorMessage('Contraseña muy corta', 'La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await changePassword({
        old_password: passwordData.old_password,
        new_password: passwordData.new_password
      });
      await showSuccessMessage('Contraseña cambiada', 'Tu contraseña ha sido cambiada exitosamente.');
      setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      await showErrorMessage('Error', err instanceof Error ? err.message : 'Error al cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const result = await Swal.fire({
      title: '¿Eliminar cuenta permanentemente?',
      text: 'Esta acción no se puede deshacer. Se eliminarán todos tus datos, gastos, ingresos y configuraciones.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar cuenta',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      buttonsStyling: false,
      customClass: {
        confirmButton: 'swal2-confirm',
        cancelButton: 'swal2-cancel'
      }
    });

    if (!result.isConfirmed) {
      return;
    }

    // Segunda confirmación para mayor seguridad
    const secondResult = await Swal.fire({
      title: 'Última confirmación',
      text: '¿Estás completamente seguro? Esta es tu última oportunidad para cancelar.',
      icon: 'error',
      showCancelButton: true,
      confirmButtonText: 'Eliminar definitivamente',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      buttonsStyling: false,
      customClass: {
        confirmButton: 'swal2-confirm swal2-danger',
        cancelButton: 'swal2-cancel'
      }
    });

    if (!secondResult.isConfirmed) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await deleteAccount();

      // Mostrar mensaje de éxito antes del logout automático
      await showSuccessMessage('Cuenta eliminada', 'Tu cuenta ha sido eliminada permanentemente.');

      // El logout se maneja automáticamente en deleteAccount
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar la cuenta');
      setLoading(false);

      await showErrorMessage('Error', err instanceof Error ? err.message : 'Error al eliminar la cuenta');
    }
  };

  const tabs = [
    { id: 'view' as const, label: 'Ver Perfil', icon: User },
    { id: 'edit' as const, label: 'Editar Perfil', icon: Edit3 },
    { id: 'password' as const, label: 'Cambiar Contraseña', icon: Key },
    { id: 'settings' as const, label: 'Configuración', icon: Settings },
  ];

  if (isLoading && !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200">
          <h1 className="text-2xl font-semibold text-neutral-900">Mi Perfil</h1>
          <p className="text-neutral-600 mt-1">Gestiona tu información personal y configuraciones de cuenta</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-neutral-200">
          <nav className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Success/Error Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm">{success}</p>
            </div>
          )}

          {/* View Profile Tab */}
          {activeTab === 'view' && user && (
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                  {user.foto_perfil ? (
                    <img
                      src={user.foto_perfil}
                      alt={user.nombre}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-8 w-8 text-blue-600" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900">{user.nombre}</h2>
                  <p className="text-neutral-600">{user.correo}</p>
                  <p className="text-sm text-neutral-500 mt-1">
                    Miembro desde {new Date(user.fecha_creacion).toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700">Nombre</label>
                    <p className="mt-1 text-neutral-900">{user.nombre}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700">Correo Electrónico</label>
                    <p className="mt-1 text-neutral-900">{user.correo}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700">Moneda Preferida</label>
                    <p className="mt-1 text-neutral-900">
                      {currencies.find(c => c.value === user.moneda_preferida)?.label || user.moneda_preferida}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700">ID de Usuario</label>
                    <p className="mt-1 text-neutral-900 font-mono text-sm">{user.id}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Edit Profile Tab */}
          {activeTab === 'edit' && (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                  {profileData.foto_perfil ? (
                    <img
                      src={profileData.foto_perfil}
                      alt="Preview"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-8 w-8 text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Foto de Perfil (URL)
                  </label>
                  <input
                    type="url"
                    value={profileData.foto_perfil}
                    onChange={(e) => setProfileData(prev => ({ ...prev, foto_perfil: e.target.value }))}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://ejemplo.com/foto.jpg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={profileData.nombre}
                    onChange={(e) => setProfileData(prev => ({ ...prev, nombre: e.target.value }))}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tu nombre completo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Moneda Preferida
                  </label>
                  <select
                    value={profileData.moneda_preferida}
                    onChange={(e) => setProfileData(prev => ({ ...prev, moneda_preferida: e.target.value }))}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {currencies.map((currency) => (
                      <option key={currency.value} value={currency.value}>
                        {currency.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="h-4 w-4" />
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (user) {
                      setProfileData({
                        nombre: user.nombre || '',
                        moneda_preferida: user.moneda_preferida || 'COP',
                        foto_perfil: user.foto_perfil || ''
                      });
                    }
                    setIsEditing(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50"
                >
                  <X className="h-4 w-4" />
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {/* Change Password Tab */}
          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-md">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Contraseña Actual *
                </label>
                <input
                  type="password"
                  required
                  value={passwordData.old_password}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, old_password: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tu contraseña actual"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Nueva Contraseña *
                </label>
                <input
                  type="password"
                  required
                  value={passwordData.new_password}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nueva contraseña (mínimo 6 caracteres)"
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Confirmar Nueva Contraseña *
                </label>
                <input
                  type="password"
                  required
                  value={passwordData.confirm_password}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirm_password: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Repite la nueva contraseña"
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Key className="h-4 w-4" />
                {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
              </button>
            </form>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="border border-red-200 rounded-lg p-6 bg-red-50">
                <div className="flex items-start gap-3">
                  <Trash2 className="h-5 w-5 text-red-600 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-red-900">Eliminar Cuenta</h3>
                    <p className="text-red-700 mt-1">
                      Esta acción eliminará permanentemente tu cuenta y todos tus datos asociados.
                      No podrás recuperar tu información después de eliminar la cuenta.
                    </p>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={loading}
                      className="mt-4 flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="h-4 w-4" />
                      {loading ? 'Eliminando...' : 'Eliminar Cuenta'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
