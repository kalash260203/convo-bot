// Chatbot Application
class Chatbot {
    constructor() {
        this.messages = [];
        this.settings = {
            apiKey: '',
            apiEndpoint: 'google',
            customUrl: ''
        };
        this.isTyping = false;
        
        this.initializeElements();
        this.loadSettings();
        this.bindEvents();
        this.loadChatHistory();
        this.setupThemeToggle();
    }

    initializeElements() {
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.typingIndicator = document.getElementById('typingIndicator');
        this.charCount = document.getElementById('charCount');
        this.clearChatBtn = document.getElementById('clearChat');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.settingsModal = document.getElementById('settingsModal');
        this.closeSettingsBtn = document.getElementById('closeSettings');
        this.saveSettingsBtn = document.getElementById('saveSettings');
        this.apiKeyInput = document.getElementById('apiKey');
        this.apiEndpointSelect = document.getElementById('apiEndpoint');
        this.customUrlInput = document.getElementById('customUrl');
        this.customEndpointGroup = document.getElementById('customEndpointGroup');
    }

    bindEvents() {
        // Send message events
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Input events
        this.messageInput.addEventListener('input', () => this.updateCharCount());
        this.messageInput.addEventListener('input', () => this.autoResize());

        // UI events
        this.clearChatBtn.addEventListener('click', () => this.clearChat());
        this.settingsBtn.addEventListener('click', () => this.openSettings());
        this.closeSettingsBtn.addEventListener('click', () => this.closeSettings());
        this.saveSettingsBtn.addEventListener('click', () => this.saveSettings());

        // Settings events
        this.apiEndpointSelect.addEventListener('change', () => this.toggleCustomEndpoint());

        // Modal events
        this.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.settingsModal) {
                this.closeSettings();
            }
        });

        document.getElementById('settingsBtn').addEventListener('click', () => {
            const modal = document.getElementById('settingsModal');
            modal.classList.add('show');
        });

        document.getElementById('closeSettings').addEventListener('click', () => {
            const modal = document.getElementById('settingsModal');
            modal.classList.remove('show');
        });
    }

    autoResize() {
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 120) + 'px';
    }

    updateCharCount() {
        const count = this.messageInput.value.length;
        this.charCount.textContent = `${count}/1000`;
        
        if (count > 900) {
            this.charCount.style.color = '#dc3545';
        } else if (count > 700) {
            this.charCount.style.color = '#ffc107';
        } else {
            this.charCount.style.color = '#6c757d';
        }
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message || this.isTyping) return;

        // Add user message
        this.addMessage(message, 'user');
        this.messageInput.value = '';
        this.updateCharCount();
        this.autoResize();

        // Show typing indicator
        this.showTyping();

        try {
            // Get bot response
            const response = await this.getBotResponse(message);
            this.hideTyping();
            this.addMessage(response, 'bot');
        } catch (error) {
            this.hideTyping();
            this.addMessage('Sorry, I encountered an error. Please try again.', 'bot');
            console.error('Error getting bot response:', error);
        }

        this.saveChatHistory();
    }

    addMessage(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-${sender === 'user' ? 'user' : 'robot'}"></i>
            </div>
            <div class="message-content">
                <p>${this.formatMessage(content)}</p>
                <span class="message-time">${time}</span>
            </div>
        `;

        // Add this line before appending the message
        messageDiv.style.opacity = '0';
        
        this.chatMessages.appendChild(messageDiv);
        
        // Trigger reflow to ensure animation plays
        messageDiv.offsetHeight;
        messageDiv.style.opacity = '1';

        this.scrollToBottom();

        // Store message
        this.messages.push({ content, sender, time });

        // Add copy button event listeners
        messageDiv.querySelectorAll('.copy-btn').forEach(btn => {
            btn.onclick = function() {
                const codeId = btn.getAttribute('data-code-id');
                const codeElem = btn.closest('.message').querySelector(`#${codeId}`);
                if (codeElem) {
                    navigator.clipboard.writeText(codeElem.innerText);
                    btn.textContent = 'Copied!';
                    setTimeout(() => { btn.textContent = 'Copy'; }, 1200);
                    alert('Copied!');
                }
            };
        });
    }

    formatMessage(message) {
        // Format code blocks using Prettier if possible, for all languages
        let formatted = message.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
            let formattedCode = code;
            if (window.prettier && window.prettierPlugins) {
                try {
                    // Try to use Prettier for supported languages
                    if (lang === 'js' || lang === 'javascript') {
                        formattedCode = window.prettier.format(code, { parser: 'babel', plugins: window.prettierPlugins });
                    } else if (lang === 'json') {
                        formattedCode = window.prettier.format(code, { parser: 'json', plugins: window.prettierPlugins });
                    } else if (lang === 'css') {
                        formattedCode = window.prettier.format(code, { parser: 'css', plugins: window.prettierPlugins });
                    } else if (lang === 'html') {
                        formattedCode = window.prettier.format(code, { parser: 'html', plugins: window.prettierPlugins });
                    } else {
                        // For unsupported languages, just use the code as-is
                        formattedCode = code;
                    }
                } catch (e) {
                    formattedCode = code;
                }
            }
            // Add a copy button to each code block
            const codeId = 'code-' + Math.random().toString(36).substr(2, 9);
            return `<div class=\"code-header\">${lang || ''}<button class=\"copy-btn\" data-code-id=\"${codeId}\">Copy</button></div><pre><code id=\"${codeId}\" class=\"language-${lang || ''}\">${this.escapeHtml(formattedCode)}</code></pre>`;
        });
        // Inline code
        formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');
        // Links and line breaks
        formatted = formatted.replace(/\n/g, '<br>')
            .replace(/(https?:\/\/[^\s]+)/g, '<a href=\"$1\" target=\"_blank\">$1</a>');
        return formatted;
    }

    escapeHtml(text) {
        return text.replace(/[&<>"']/g, function (c) {
            return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
        });
    }

    showTyping() {
        this.isTyping = true;
        this.typingIndicator.style.display = 'flex';
        this.sendButton.disabled = true;
        this.scrollToBottom();
    }

    hideTyping() {
        this.isTyping = false;
        this.typingIndicator.style.display = 'none';
        this.sendButton.disabled = false;
    }

    scrollToBottom() {
        setTimeout(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }, 100);
    }

    async getBotResponse(message) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        return await this.getAPIResponse(message);
    }

    getDemoResponse(message) {
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

        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        // Add some context-aware responses
        const lowerMessage = message.toLowerCase();
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
            return "Hello! It's great to meet you. How can I assist you today?";
        } else if (lowerMessage.includes('help')) {
            return "I'm here to help! You can ask me questions about various topics, and I'll do my best to provide helpful responses. What would you like to know?";
        } else if (lowerMessage.includes('weather')) {
            return "I don't have access to real-time weather data, but I'd recommend checking a weather app or website for current conditions in your area.";
        } else if (lowerMessage.includes('time')) {
            return `The current time is ${new Date().toLocaleTimeString()}. Is there anything else I can help you with?`;
        }

        return randomResponse + " " + this.generateContextualResponse(message);
    }

    generateContextualResponse(message) {
        const contextResponses = [
            "Feel free to ask me more questions if you need clarification.",
            "I hope this helps! Let me know if you'd like to explore this topic further.",
            "What are your thoughts on this? I'd be happy to discuss it more.",
            "Is there a specific aspect of this you'd like me to elaborate on?",
            "I'm here if you have any follow-up questions about this topic."
        ];
        
        return contextResponses[Math.floor(Math.random() * contextResponses.length)];
    }

    async getAPIResponse(message) {
        // Call ChatAnywhere API directly with provided API key
        const apiKey = 'sk-reZizpMzHjNZZj0lsJSRJOTCUEqDyZjSa7lGwjssqTeAyxFP';
        const url = 'https://api.chatanywhere.tech/v1/chat/completions';
        const payload = {
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'user', content: message }
            ]
        };
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error('API error');
            const data = await response.json();
            if (data.choices && data.choices.length > 0) {
                return data.choices[0].message.content;
            } else {
                return 'Sorry, I could not get a response from ChatAnywhere API.';
            }
        } catch (error) {
            return 'Sorry, there was an error connecting to ChatAnywhere API.';
        }
    }

    clearChat() {
        if (confirm('Are you sure you want to clear the chat history?')) {
            this.chatMessages.innerHTML = `
                <div class="message bot-message">
                    <div class="message-avatar">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="message-content">
                        <p>Hello! I'm your AI assistant. How can I help you today?</p>
                        <span class="message-time">Just now</span>
                    </div>
                </div>
            `;
            this.messages = [];
            this.saveChatHistory();
        }
    }

    openSettings() {
        this.settingsModal.style.display = 'flex';
        this.loadSettingsToForm();
    }

    closeSettings() {
        this.settingsModal.style.display = 'none';
    }

    loadSettingsToForm() {
        this.apiKeyInput.value = this.settings.apiKey;
        this.apiEndpointSelect.value = this.settings.apiEndpoint;
        this.customUrlInput.value = this.settings.customUrl;
        this.toggleCustomEndpoint();
    }

    toggleCustomEndpoint() {
        const isCustom = this.apiEndpointSelect.value === 'custom';
        this.customEndpointGroup.style.display = isCustom ? 'block' : 'none';
    }

    saveSettings() {
        this.settings.apiKey = this.apiKeyInput.value;
        this.settings.apiEndpoint = this.apiEndpointSelect.value;
        this.settings.customUrl = this.customUrlInput.value;
        
        localStorage.setItem('chatbot-settings', JSON.stringify(this.settings));
        this.closeSettings();
        
        // Show confirmation
        this.addMessage('Settings saved successfully!', 'bot');
    }

    loadSettings() {
        const saved = localStorage.getItem('chatbot-settings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
        }
    }

    saveChatHistory() {
        localStorage.setItem('chatbot-history', JSON.stringify(this.messages));
    }

    loadChatHistory() {
        const saved = localStorage.getItem('chatbot-history');
        if (saved) {
            this.messages = JSON.parse(saved);
            // Restore messages to UI (keeping the initial bot message)
            if (this.messages.length > 0) {
                this.chatMessages.innerHTML = `
                    <div class="message bot-message">
                        <div class="message-avatar">
                            <i class="fas fa-robot"></i>
                        </div>
                        <div class="message-content">
                            <p>Hello! I'm your AI assistant. How can I help you today?</p>
                            <span class="message-time">Just now</span>
                        </div>
                    </div>
                `;
                
                this.messages.forEach(msg => {
                    if (msg.content && msg.sender) {
                        this.addMessageToUI(msg.content, msg.sender, msg.time);
                    }
                });
            }
        }
    }

    addMessageToUI(content, sender, time) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-${sender === 'user' ? 'user' : 'robot'}"></i>
            </div>
            <div class="message-content">
                <p>${this.formatMessage(content)}</p>
                <span class="message-time">${time}</span>
            </div>
        `;

        this.chatMessages.appendChild(messageDiv);

        // Add copy button event listeners for restored messages
        messageDiv.querySelectorAll('.copy-btn').forEach(btn => {
            btn.onclick = function() {
                const codeId = btn.getAttribute('data-code-id');
                const codeElem = btn.closest('.message').querySelector(`#${codeId}`);
                if (codeElem) {
                    navigator.clipboard.writeText(codeElem.innerText);
                    btn.textContent = 'Copied!';
                    setTimeout(() => { btn.textContent = 'Copy'; }, 1200);
                    alert('Copied!');
                }
            };
        });
    }

    setupThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        const icon = themeToggle.querySelector('i');
        const setTheme = (light) => {
            if (light) {
                document.body.classList.add('light-mode');
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            } else {
                document.body.classList.remove('light-mode');
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            }
        };
        // Load preference
        const saved = localStorage.getItem('chatbot-theme');
        setTheme(saved === 'light');
        themeToggle.onclick = () => {
            const isLight = !document.body.classList.contains('light-mode');
            setTheme(isLight);
            localStorage.setItem('chatbot-theme', isLight ? 'light' : 'dark');
        };
    }
}

// Initialize the chatbot when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new Chatbot();
});
