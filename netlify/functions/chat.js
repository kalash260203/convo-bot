exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { messages, apiKey, apiEndpoint } = JSON.parse(event.body);

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Messages array is required' })
      };
    }

    // If using demo mode, return a demo response
    if (apiEndpoint === 'demo') {
      const latestMessage = messages[messages.length - 1]?.content || '';
      const response = getDemoResponse(latestMessage, messages.length);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ response })
      };
    }

    // If using actual API (Google Gemini)
    if (apiEndpoint === 'gemini' || !apiEndpoint) {
      const response = await getGeminiResponse(messages, apiKey);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ response })
      };
    }

    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid API endpoint' })
    };
  } catch (error) {
    console.error('Chat API error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

function getDemoResponse(message, conversationLength = 0) {
  const responses = [
    "That's an interesting question! Let me think about that...",
    "I understand what you're asking. Here's my perspective on that topic.",
    "Great question! Based on what you've shared, I'd suggest...",
    "I can help you with that. Here are some thoughts:",
    "That's a complex topic. Let me break it down for you:",
    "I appreciate you asking about this. From my understanding...",
    "This is something I can definitely assist with. Consider this:",
    "You've raised an important point. Here's what I think:"
  ];

  const lowerMessage = message.toLowerCase();
  
  // Context-aware responses for follow-up questions
  if (conversationLength > 2) {
    if (lowerMessage.includes('what about') || lowerMessage.includes('and') || lowerMessage.includes('also')) {
      return "Building on our previous discussion, " + responses[Math.floor(Math.random() * responses.length)].toLowerCase();
    }
    if (lowerMessage.includes('but') || lowerMessage.includes('however')) {
      return "I see you have a different perspective. Let me address that point...";
    }
  }
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return conversationLength > 0 ? 
      "Hello again! How can I continue to help you?" : 
      "Hello! It's great to meet you. How can I assist you today?";
  } else if (lowerMessage.includes('help')) {
    return "I'm here to help! You can ask me questions about various topics, and I'll do my best to provide helpful responses. What would you like to know?";
  } else if (lowerMessage.includes('weather')) {
    return "I don't have access to real-time weather data, but I'd recommend checking a weather app or website for current conditions in your area.";
  } else if (lowerMessage.includes('time')) {
    return `The current time is ${new Date().toLocaleTimeString()}. Is there anything else I can help you with?`;
  }

  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  const contextResponses = [
    "Feel free to ask me more questions if you need clarification.",
    "I hope this helps! Let me know if you'd like to explore this topic further.",
    "What are your thoughts on this? I'd be happy to discuss it more.",
    "Is there a specific aspect of this you'd like me to elaborate on?",
    "I'm here if you have any follow-up questions about this topic."
  ];
  
  return randomResponse + " " + contextResponses[Math.floor(Math.random() * contextResponses.length)];
}

// Gemini API integration using native fetch
async function getGeminiResponse(messages, apiKey) {
  const key = apiKey || process.env.GEMINI_API_KEY || '';
  if (!key) {
    return 'Google Gemini API key is missing. Please provide a valid key.';
  }

  // Gemini expects a different message format
  const geminiMessages = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + key;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: geminiMessages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status === 429) {
        return 'Rate limit exceeded. Please wait before sending another message.';
      } else if (response.status === 401) {
        return 'API key is invalid. Please check your Google Gemini API key.';
      } else {
        return `Gemini API error (${response.status}): ${errorText}`;
      }
    }

    const data = await response.json();
    if (data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts.length > 0) {
      return data.candidates[0].content.parts[0].text;
    } else {
      return 'Sorry, I could not get a response from the Gemini API.';
    }
  } catch (error) {
    console.error('Gemini API error:', error);
    return 'Sorry, there was an error connecting to the Gemini API. Please check your internet connection or try again later.';
  }
}
