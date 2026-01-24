'use client'

import React, { useState, useRef, useEffect } from 'react'
import { X, Send } from 'lucide-react'
import MakerBotIcon from './MakerBotIcon'

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '¡Hola! Soy MakerBot, tu asistente de MakerCycle. ¿En qué puedo ayudarte hoy?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Respuesta predefinida para el streaming
  const predefinedResponse = `¡Gracias por tu mensaje! Soy MakerBot, el asistente virtual de MakerCycle. Estoy aquí para ayudarte con cualquier pregunta sobre nuestra plataforma.

Puedo ayudarte con:
• Cálculo de costes de impresión 3D
• Gestión de proyectos
• Configuración de materiales y filamentos
• Análisis de rentabilidad
• Y mucho más...

¿Hay algo específico en lo que pueda ayudarte?`

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const simulateStreaming = (text: string, callback: (chunk: string) => void) => {
    const words = text.split(' ')
    let currentIndex = 0

    const streamInterval = setInterval(() => {
      if (currentIndex < words.length) {
        const chunk = words.slice(0, currentIndex + 1).join(' ')
        callback(chunk)
        currentIndex++
      } else {
        clearInterval(streamInterval)
        setIsStreaming(false)
      }
    }, 50) // Velocidad de streaming: 50ms por palabra
  }

  const handleSendMessage = () => {
    if (!inputValue.trim() || isStreaming) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setIsStreaming(true)

    // Simular delay antes de empezar a responder
    setTimeout(() => {
      const botMessageId = (Date.now() + 1).toString()
      let currentBotText = ''

      const botMessage: Message = {
        id: botMessageId,
        text: '',
        sender: 'bot',
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMessage])

      simulateStreaming(predefinedResponse, (chunk) => {
        currentBotText = chunk
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMessageId ? { ...msg, text: currentBotText } : msg
          )
        )
      })
    }, 500)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 flex items-center justify-center rounded-full shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 ${
          isOpen
            ? 'w-14 h-14 md:w-16 md:h-16 bg-red-600 hover:bg-red-700'
            : 'w-20 h-20 md:w-24 md:h-24 bg-transparent'
        }`}
        aria-label="Abrir chat"
      >
        {isOpen ? (
          <X className="w-5 h-5 md:w-6 md:h-6 text-white" />
        ) : (
          <MakerBotIcon 
            size={96} 
            className="drop-shadow-lg" 
          />
        )}
      </button>

      {/* Ventana de chat */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-200 overflow-hidden animate-in slide-in-from-bottom-4 duration-300 md:w-96">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#ef2a1f] to-[#d0251b] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center p-1">
                <MakerBotIcon size={40} />
              </div>
              <div>
                <h3 className="font-semibold text-lg">MakerBot</h3>
                <p className="text-xs text-white/80">Asistente virtual</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Cerrar chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.sender === 'user'
                      ? 'bg-[#ef2a1f] text-white rounded-br-sm'
                      : 'bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-200'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message.text}
                    {message.sender === 'bot' && message.id === messages[messages.length - 1]?.id && isStreaming && (
                      <span className="inline-block w-2 h-4 bg-gray-600 ml-1 animate-pulse" />
                    )}
                  </p>
                  <span
                    className={`text-xs mt-1 block ${
                      message.sender === 'user' ? 'text-white/70' : 'text-gray-500'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-4 bg-white">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu mensaje..."
                disabled={isStreaming}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#ef2a1f] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isStreaming}
                className="p-2 bg-[#ef2a1f] text-white rounded-full hover:bg-[#d0251b] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:bg-gray-300"
                aria-label="Enviar mensaje"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              MakerBot está aquí para ayudarte
            </p>
          </div>
        </div>
      )}
    </>
  )
}
