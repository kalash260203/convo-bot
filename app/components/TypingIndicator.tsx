'use client'

export function TypingIndicator() {
  return (
    <div className="typing-indicator">
      <div className="message-avatar">
        <i className="fas fa-robot"></i>
      </div>
      <div className="typing-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  )
}
