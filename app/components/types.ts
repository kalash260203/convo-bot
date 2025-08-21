// Type definitions for the chat application

export interface Message {
  content: string
  sender: 'user' | 'bot'
  time: string
}

export interface ApiMessage {
  role: 'user' | 'assistant'
  content: string
}
