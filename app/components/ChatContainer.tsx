'use client'

import { useState, useRef, useEffect } from 'react'
import { ChatHeader } from './ChatHeader'
import { ChatMessages } from './ChatMessages'
import { ChatInput } from './ChatInput'
import { TypingIndicator } from './TypingIndicator'
import type { Message, ApiMessage } from './types'

export function ChatContainer() {
  const [messages, setMessages] = useState<Message[]>([
    {
      content: "Hello! I'm your AI assistant. How can I help you today?",
      sender: 'bot',
      time: 'Just now'
    }
  ])
  const [isTyping, setIsTyping] = useState(false)
  const [lastRequestTime, setLastRequestTime] = useState<number>(0)

  const chatMessagesRef = useRef<HTMLDivElement>(null)
  const minRequestInterval = 2000 // 2 seconds between requests

  useEffect(() => {
    // Load chat history from localStorage
    const savedHistory = localStorage.getItem('chatbot-history')
    if (savedHistory) {
      const history = JSON.parse(savedHistory)
      if (history.length > 0) {
        setMessages(prev => [...prev, ...history])
      }
    }
  }, [])

  useEffect(() => {
    // Save chat history to localStorage
    if (messages.length > 1) { // Don't save just the initial message
      const historyToSave = messages.slice(1) // Remove initial message
      localStorage.setItem('chatbot-history', JSON.stringify(historyToSave))
    }
  }, [messages])

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isTyping) return

    const newUserMessage: Message = {
      content,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages(prev => [...prev, newUserMessage])
    setIsTyping(true)

    try {
      const response = await getBotResponse(content)
      const botMessage: Message = {
        content: response,
        sender: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      const errorMessage: Message = {
        content: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, errorMessage])
      console.error('Error getting bot response:', error)
    } finally {
      setIsTyping(false)
    }
  }

  const getBotResponse = async (message: string): Promise<string> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))

    try {
      return await getAPIResponse(message)
    } catch (error) {
      console.error('API failed, falling back to demo mode:', error)
      // Fallback to demo response if API fails
      return getDemoResponse(message) + "\n\n(Note: API unavailable, using demo mode)"
    }
  }

  const getDemoResponse = (message: string): string => {
    const responses = [
      "That's an interesting question! Let me think about that...",
      "I understand what you're asking. Here's my perspective on that topic.",
      "Great question! Based on what you've shared, I'd suggest...",
      "I can help you with that. Here are some thoughts:",
      "That's a complex topic. Let me break it down for you:",
      "I appreciate you asking about this. From my understanding...",
      "This is something I can definitely assist with. Consider this:",
      "You've raised an important point. Here's what I think:"
    ]

    const lowerMessage = message.toLowerCase()
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return "Hello! It's great to meet you. How can I assist you today?"
    } else if (lowerMessage.includes('help')) {
      return "I'm here to help! You can ask me questions about various topics, and I'll do my best to provide helpful responses. What would you like to know?"
    } else if (lowerMessage.includes('weather')) {
      return "I don't have access to real-time weather data, but I'd recommend checking a weather app or website for current conditions in your area."
    } else if (lowerMessage.includes('time')) {
      return `The current time is ${new Date().toLocaleTimeString()}. Is there anything else I can help you with?`
    }

    const randomResponse = responses[Math.floor(Math.random() * responses.length)]
    const contextResponses = [
      "Feel free to ask me more questions if you need clarification.",
      "I hope this helps! Let me know if you'd like to explore this topic further.",
      "What are your thoughts on this? I'd be happy to discuss it more.",
      "Is there a specific aspect of this you'd like me to elaborate on?",
      "I'm here if you have any follow-up questions about this topic."
    ]
    
    return randomResponse + " " + contextResponses[Math.floor(Math.random() * contextResponses.length)]
  }

  const getAPIResponse = async (message: string): Promise<string> => {
    try {
      // Convert message history to API format
      const conversationHistory: ApiMessage[] = messages
        .filter(msg => msg.sender !== 'bot' || !msg.content.includes('Just now')) // Exclude initial bot message
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.content
        }))

      // Add the current message
      conversationHistory.push({
        role: 'user',
        content: message
      })

      const response = await fetch('/.netlify/functions/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: conversationHistory, // Send full conversation history
          apiKey: '', // Use default API key from environment
          apiEndpoint: 'gemini' // Use Google Gemini endpoint
        })
      })

      if (!response.ok) {
        console.error('API response not ok:', response.status)
        throw new Error('API request failed')
      }
      
      const data = await response.json()
      if (data.response) {
        return data.response
      } else if (data.error) {
        console.error('API returned error:', data.error)
        throw new Error(data.error)
      } else {
        throw new Error('Invalid API response format')
      }
    } catch (error) {
      console.error('API call failed:', error)
      throw error // Re-throw to be caught by getBotResponse
    }
  }

  const handleClearChat = () => {
    if (confirm('Are you sure you want to clear the chat history?')) {
      setMessages([{
        content: "Hello! I'm your AI assistant. How can I help you today?",
        sender: 'bot',
        time: 'Just now'
      }])
      localStorage.removeItem('chatbot-history')
    }
  }

  return (
    <div className="chat-container">
      <ChatHeader 
        onClearChat={handleClearChat}
      />
      
      <ChatMessages 
        ref={chatMessagesRef}
        messages={messages} 
      />
      
      {isTyping && <TypingIndicator />}
      
      <ChatInput 
        onSendMessage={handleSendMessage}
        disabled={isTyping}
      />
    </div>
  )
}
