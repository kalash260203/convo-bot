'use client'

import { useState, useRef, useEffect } from 'react'

interface ChatInputProps {
  onSendMessage: (message: string) => void
  disabled?: boolean
}

export function ChatInput({ onSendMessage, disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !disabled) {
      onSendMessage(message.trim())
      setMessage('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
    autoResize()
  }

  const autoResize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
    }
  }

  useEffect(() => {
    autoResize()
  }, [message])

  const charCount = message.length
  const maxChars = 1000

  return (
    <div className="chat-input-container">
      <form onSubmit={handleSubmit} className="chat-input">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Type your message here..."
          className="message-input"
          maxLength={maxChars}
          rows={1}
          disabled={disabled}
        />
        <button 
          type="submit" 
          className="send-btn"
          disabled={disabled || !message.trim()}
        >
          <i className="fas fa-paper-plane"></i>
        </button>
      </form>
      <div className="input-footer">
        <span 
          className="char-count"
          style={{
            color: charCount > 900 ? '#dc3545' : charCount > 700 ? '#ffc107' : '#6c757d'
          }}
        >
          {charCount}/{maxChars}
        </span>
        <span className="powered-by">Powered by AI</span>
      </div>
    </div>
  )
}
