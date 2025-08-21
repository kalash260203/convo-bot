'use client'

interface ChatHeaderProps {
  onClearChat: () => void
}

export function ChatHeader({ onClearChat }: ChatHeaderProps) {
  return (
    <div className="chat-header">
      <div className="header-content">
        <div className="bot-avatar">
          <i className="fas fa-robot"></i>
        </div>
        <div className="bot-info">
          <h2>ConvoBOT</h2>
          <span className="status">Online</span>
        </div>
        <div className="header-actions">
          <button 
            onClick={onClearChat} 
            className="clear-btn" 
            title="Clear Chat"
          >
            <i className="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
  )
}
