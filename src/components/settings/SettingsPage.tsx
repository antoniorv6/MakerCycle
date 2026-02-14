'use client'

import React, { useState, useEffect } from 'react'
import { Save, Building2, User, Shield, Bell, Palette, Settings, Package, DollarSign, Paintbrush, Truck } from 'lucide-react'
import { Printer3D } from '@/components/icons/Printer3D'
import { useCompanySettings } from '@/hooks/useCompanySettings'
import { useCurrency } from '@/components/providers/CurrencyProvider'
import MaterialPresetsManager from './MaterialPresetsManager'
import PostprocessingPresetsManager from './PostprocessingPresetsManager'
import PrinterPresetsManager from './PrinterPresetsManager'
import ShippingPresetsManager from './ShippingPresetsManager'
import { ConfiguracionIcon } from '@/components/icons/MenuIcons'

interface SettingsPageProps {
  initialTab?: string;
}

export default function SettingsPage({ initialTab = 'company' }: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState(initialTab)
  const { companyData, saveCompanyData, isLoading } = useCompanySettings()
  const { currency, currencySymbol, saveUserCurrency, currencies, loading: currencyLoading } = useCurrency()
  const [formData, setFormData] = useState(companyData)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [selectedCurrency, setSelectedCurrency] = useState(currency)
  const [isSavingCurrency, setIsSavingCurrency] = useState(false)
  const [currencySaveMessage, setCurrencySaveMessage] = useState('')

  useEffect(() => {
    setFormData(companyData)
  }, [companyData])

  useEffect(() => {
    setSelectedCurrency(currency)
  }, [currency])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveMessage('Guardando...')
    
    try {
      await saveCompanyData(formData)
      setSaveMessage('¡Configuración guardada!')
      setTimeout(() => setSaveMessage(''), 3000)
    } catch (error) {
      setSaveMessage('Error al guardar la configuración')
      setTimeout(() => setSaveMessage(''), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  const tabs = [
    { id: 'company', label: 'Empresa', icon: Building2 },
    { id: 'materials', label: 'Perfiles materiales', icon: Package },
    { id: 'printers', label: 'Impresoras', icon: Printer3D },
    { id: 'postprocessing', label: 'Postproducción', icon: Paintbrush },
    { id: 'shipping', label: 'Envíos', icon: Truck },
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'currency', label: 'Moneda', icon: DollarSign },
    { id: 'security', label: 'Seguridad', icon: Shield },
    { id: 'notifications', label: 'Notificaciones', icon: Bell },
    { id: 'appearance', label: 'Apariencia', icon: Palette }
  ]

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <ConfiguracionIcon className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Configuración</h1>
            <p className="text-slate-600">Personaliza tu experiencia de gestión 3D</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="flex min-h-[600px]">
          {/* Sidebar */}
          <div className="w-80 bg-slate-50 border-r border-slate-200 p-6">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-slate-100 text-slate-700 border border-slate-200'
                        : 'text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-8">
            {activeTab === 'materials' && (
              <MaterialPresetsManager />
            )}

            {activeTab === 'postprocessing' && (
              <PostprocessingPresetsManager />
            )}

            {activeTab === 'shipping' && (
              <ShippingPresetsManager />
            )}

            {activeTab === 'printers' && (
              <PrinterPresetsManager />
            )}

            {activeTab === 'company' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Información de la empresa</h3>
                  <p className="text-gray-600 mb-6">Configura los datos de tu empresa que aparecerán en los albaranes y facturas.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre de la empresa
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Tu Empresa S.L."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CIF/NIF
                    </label>
                    <input
                      type="text"
                      value={formData.taxId}
                      onChange={(e) => handleInputChange('taxId', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="B12345678"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dirección
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Calle Principal 123"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="+34 91 123 45 67"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="info@tuempresa.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sitio Web
                    </label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="https://tuempresa.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Información Bancaria
                    </label>
                    <input
                      type="text"
                      value={formData.bankInfo}
                      onChange={(e) => handleInputChange('bankInfo', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="ES91 2100 0418 4502 0005 1332"
                    />
                  </div>
                </div>

                <div className="col-span-full">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción de la empresa
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Especialistas en impresión 3D y fabricación digital..."
                  />
                </div>

                <div className="col-span-full">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Términos y condiciones
                  </label>
                  <textarea
                    value={formData.terms}
                    onChange={(e) => handleInputChange('terms', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Términos y condiciones para los servicios..."
                  />
                </div>

                <div className="col-span-full">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pie de página
                  </label>
                  <textarea
                    value={formData.footer}
                    onChange={(e) => handleInputChange('footer', e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Mensaje de agradecimiento..."
                  />
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Perfil de usuario</h3>
                  <p className="text-gray-600 mb-6">Gestiona tu información personal y preferencias.</p>
                </div>
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">Configuración de perfil en desarrollo...</p>
                </div>
              </div>
            )}

            {activeTab === 'currency' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Configuración de moneda</h3>
                  <p className="text-gray-600 mb-6">Selecciona la moneda que deseas usar en toda la aplicación. Los precios se mostrarán con el símbolo de la moneda seleccionada.</p>
                </div>

                <div className="max-w-md">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Moneda preferida
                  </label>
                  <select
                    value={selectedCurrency}
                    onChange={(e) => setSelectedCurrency(e.target.value as any)}
                    disabled={currencyLoading || isSavingCurrency}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {currencies.map((curr) => (
                      <option key={curr.code} value={curr.code}>
                        {curr.symbol} - {curr.name} ({curr.code})
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-sm text-gray-500">
                    Moneda actual: <span className="font-medium">{currencySymbol} ({currency})</span>
                  </p>
                </div>
              </div>
            )}

            {/* Save Button for Currency */}
            {activeTab === 'currency' && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {currencySaveMessage && (
                      <span className={`text-sm ${
                        currencySaveMessage.includes('Error') ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {currencySaveMessage}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={async () => {
                      if (selectedCurrency === currency) return;
                      
                      setIsSavingCurrency(true)
                      setCurrencySaveMessage('Guardando...')
                      
                      try {
                        await saveUserCurrency(selectedCurrency)
                        setCurrencySaveMessage('¡Moneda guardada correctamente!')
                        setTimeout(() => setCurrencySaveMessage(''), 3000)
                      } catch (error) {
                        setCurrencySaveMessage('Error al guardar la moneda')
                        setTimeout(() => setCurrencySaveMessage(''), 3000)
                      } finally {
                        setIsSavingCurrency(false)
                      }
                    }}
                    disabled={isSavingCurrency || currencyLoading || selectedCurrency === currency}
                    className="px-6 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 shadow-md hover:shadow-lg"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSavingCurrency ? 'Guardando...' : 'Guardar moneda'}</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Seguridad</h3>
                  <p className="text-gray-600 mb-6">Configura las opciones de seguridad de tu cuenta.</p>
                </div>
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">Configuración de seguridad en desarrollo...</p>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Notificaciones</h3>
                  <p className="text-gray-600 mb-6">Personaliza cómo recibes las notificaciones.</p>
                </div>
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bell className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">Configuración de notificaciones en desarrollo...</p>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Apariencia</h3>
                  <p className="text-gray-600 mb-6">Personaliza el aspecto visual de la aplicación.</p>
                </div>
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Palette className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">Configuración de apariencia en desarrollo...</p>
                </div>
              </div>
            )}

            {/* Save Button */}
            {activeTab === 'company' && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {saveMessage && (
                      <span className={`text-sm ${
                        saveMessage.includes('Error') ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {saveMessage}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handleSave}
                    disabled={isSaving || isLoading}
                    className="px-6 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 shadow-md hover:shadow-lg"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Guardando...' : 'Guardar configuración'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 