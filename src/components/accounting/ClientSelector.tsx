'use client'

import React, { useState } from 'react'
import { ChevronDown, Plus, User, X } from 'lucide-react'
import { useClients, type Client, type ClientFormData } from '@/hooks/useClients'

interface ClientSelectorProps {
  selectedClientId: string | null
  onClientSelect: (clientId: string | null) => void
  className?: string
}

export function ClientSelector({ selectedClientId, onClientSelect, className = '' }: ClientSelectorProps) {
  const { clients, loading, addClient } = useClients()
  const [isOpen, setIsOpen] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newClientData, setNewClientData] = useState<ClientFormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    taxId: '',
    notes: ''
  })

  const selectedClient = clients.find(client => client.id === selectedClientId)

  const handleCreateClient = async () => {
    if (!newClientData.name.trim()) {
      alert('El nombre del cliente es obligatorio')
      return
    }
    
    try {
      const newClient = await addClient(newClientData)
      onClientSelect(newClient.id)
      setShowCreateForm(false)
      setNewClientData({
        name: '',
        email: '',
        phone: '',
        address: '',
        taxId: '',
        notes: ''
      })
    } catch (error) {
      console.error('Error creating client:', error)
    }
  }

  const handleInputChange = (field: keyof ClientFormData, value: string) => {
    setNewClientData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className={`relative ${className}`}>
      {/* Selected Client Display */}
      <div className="flex items-center justify-between p-3 border border-gray-300 rounded-lg bg-white">
        <div className="flex items-center space-x-3">
          <User className="w-5 h-5 text-gray-400" />
          <div>
            {selectedClient ? (
              <div>
                <p className="font-medium text-gray-900">{selectedClient.name}</p>
                {selectedClient.email && (
                  <p className="text-sm text-gray-500">{selectedClient.email}</p>
                )}
              </div>
            ) : (
              <p className="text-gray-500">Seleccionar cliente...</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {selectedClient && (
            <button
              type="button"
              onClick={() => onClientSelect(null)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {/* Create New Client Button */}
          <button
            type="button"
            onClick={() => setShowCreateForm(true)}
            className="w-full flex items-center space-x-2 p-3 hover:bg-gray-50 border-b border-gray-200"
          >
            <Plus className="w-4 h-4 text-blue-600" />
            <span className="text-blue-600 font-medium">Crear nuevo cliente</span>
          </button>

          {/* Client List */}
          {loading ? (
            <div className="p-3 text-gray-500">Cargando clientes...</div>
          ) : clients.length === 0 ? (
            <div className="p-3 text-gray-500">No hay clientes registrados</div>
          ) : (
            <div>
              {clients.map(client => (
                <button
                  key={client.id}
                  type="button"
                  onClick={() => {
                    onClientSelect(client.id)
                    setIsOpen(false)
                  }}
                  className={`w-full text-left p-3 hover:bg-gray-50 ${
                    selectedClientId === client.id ? 'bg-blue-50 border-l-2 border-blue-500' : ''
                  }`}
                >
                  <div>
                    <p className="font-medium text-gray-900">{client.name}</p>
                    {client.email && (
                      <p className="text-sm text-gray-500">{client.email}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Client Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Crear Nuevo Cliente</h3>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={newClientData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nombre del cliente"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={newClientData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="email@ejemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={newClientData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+34 XXX XXX XXX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección
                </label>
                <textarea
                  value={newClientData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Dirección completa"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CIF/NIF
                </label>
                <input
                  type="text"
                  value={newClientData.taxId}
                  onChange={(e) => handleInputChange('taxId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="B12345678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas
                </label>
                <textarea
                  value={newClientData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Notas adicionales"
                  rows={2}
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleCreateClient}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Crear Cliente
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 