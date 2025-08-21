'use client'

import { forwardRef } from 'react'
import type { Message } from './types'

interface ChatMessagesProps {
  messages: Message[]
}

export const ChatMessages = forwardRef<HTMLDivElement, ChatMessagesProps>(
  ({ messages }, ref) => {
    const formatMessage = (message: string): string => {
      // Format headings
      let formatted = message
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      
      // Format bold text
      formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      formatted = formatted.replace(/__(.*?)__/g, '<strong>$1</strong>')
      
      // Format italic text
      formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>')
      formatted = formatted.replace(/_(.*?)_/g, '<em>$1</em>')
      
      // Format lists
      formatted = formatted.replace(/^\* (.*$)/gim, '<li>$1</li>')
      formatted = formatted.replace(/^- (.*$)/gim, '<li>$1</li>')
      formatted = formatted.replace(/^(\d+)\. (.*$)/gim, '<li>$2</li>')
      
      // Wrap consecutive list items in ul/ol tags
      formatted = formatted.replace(/(<li>.*<\/li>)/g, (match) => {
        return `<ul>${match}</ul>`
      })
      
      // Format code blocks
      formatted = formatted.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        const codeId = 'code-' + Math.random().toString(36).substr(2, 9)
        return `<div class="code-header">${lang || ''}<button class="copy-btn" data-code-id="${codeId}">Copy</button></div><pre><code id="${codeId}" class="language-${lang || ''}">${escapeHtml(code)}</code></pre>`
      })
      
      // Inline code
      formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>')
      
      // Format blockquotes
      formatted = formatted.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
      
      // Format horizontal rules
      formatted = formatted.replace(/^---$/gim, '<hr>')
      
      // Links and line breaks
      formatted = formatted.replace(/\n/g, '<br>')
        .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>')
      
      return formatted
    }

    const escapeHtml = (text: string): string => {
      return text.replace(/[&<>"']/g, function (c) {
        const map: { [key: string]: string } = {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        }
        return map[c]
      })
    }

    const handleCopyCode = (codeId: string) => {
      const codeElement = document.getElementById(codeId)
      if (codeElement) {
        navigator.clipboard.writeText(codeElement.innerText)
        const button = document.querySelector(`[data-code-id="${codeId}"]`) as HTMLButtonElement
        if (button) {
          const originalText = button.textContent
          button.textContent = 'Copied!'
          setTimeout(() => {
            button.textContent = originalText
          }, 1200)
        }
      }
    }

    return (
      <div ref={ref} className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.sender}-message`}>
            <div className="message-avatar">
              <i className={`fas fa-${message.sender === 'user' ? 'user' : 'robot'}`}></i>
            </div>
            <div className="message-content">
              <div 
                dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                onClick={(e) => {
                  const target = e.target as HTMLElement
                  if (target.classList.contains('copy-btn')) {
                    const codeId = target.getAttribute('data-code-id')
                    if (codeId) {
                      handleCopyCode(codeId)
                    }
                  }
                }}
              />
              <span className="message-time">{message.time}</span>
            </div>
          </div>
        ))}
      </div>
    )
  }
)

ChatMessages.displayName = 'ChatMessages'
