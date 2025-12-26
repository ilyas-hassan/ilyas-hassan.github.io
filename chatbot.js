/* ==========================================
   ILYAS PORTFOLIO - SECURE AI CHATBOT
   With Lead Capture & Security Guardrails
   ========================================== */

// ==========================================
// CONFIGURATION
// ==========================================
const CHATBOT_CONFIG = {
    ownerName: "Ilyas",
    ownerEmail: "yasilhassan@gmail.com",
    ownerRole: "Data Scientist & AI Engineer",
    ownerCompany: "Bio-Techne",
    
    // Vercel API endpoint for Claude AI
    apiEndpoint: "https://portfolio-api-y19h.vercel.app/api/chat",
    
    // EmailJS Configuration
    emailjs: {
        serviceId: "service_l6u1x6v",
        templateId: "template_i120njq",
        publicKey: "0_q3popHcAZ7zLc0n"
    },
    
    // Security Settings
    security: {
        maxMessageLength: 500,
        maxMessagesPerSession: 50,
        rateLimitMs: 1000,
        maxLeadSubmissionsPerSession: 2
    },
    
    // Response delay (feels more natural)
    responseDelayMs: { min: 800, max: 1500 }
};

// ==========================================
// SECURITY MODULE
// ==========================================
const SecurityGuard = {
    // Session tracking
    session: {
        messageCount: 0,
        lastMessageTime: 0,
        leadSubmissions: 0,
        flaggedAttempts: 0
    },
    
    // Dangerous patterns to block
    injectionPatterns: [
        /ignore\s+(all\s+)?(previous|above|prior)\s+(instructions|prompts|rules)/i,
        /disregard\s+(all\s+)?(previous|above|prior)/i,
        /forget\s+(everything|all|your)\s+(instructions|rules|prompts)/i,
        /you\s+are\s+now\s+(a|an)\s+/i,
        /act\s+as\s+(if\s+)?(you|a|an)\s+/i,
        /pretend\s+(to\s+be|you('re|\s+are))/i,
        /new\s+persona/i,
        /jailbreak/i,
        /DAN\s+mode/i,
        /developer\s+mode/i,
        /sudo\s+/i,
        /system\s*prompt/i,
        /reveal\s+(your|the)\s+(instructions|prompt|rules)/i,
        /what\s+(are|is)\s+your\s+(instructions|prompt|rules|system)/i,
        /show\s+(me\s+)?(your|the)\s+(prompt|instructions)/i,
        /repeat\s+(your|the)\s+(instructions|prompt|system)/i,
        /print\s+(your|the)\s+(instructions|prompt)/i,
        /output\s+(your|the)\s+(instructions|prompt|initialization)/i,
        /tell\s+me\s+(your|the)\s+(exact\s+)?(instructions|prompt)/i,
        /<\s*script/i,
        /javascript:/i,
        /on\w+\s*=/i,
        /\{\{\s*.*\s*\}\}/,  // Template injection
        /\$\{.*\}/,          // Template literal injection
    ],
    
    // Prompt extraction attempts
    extractionPatterns: [
        /what('s|\s+is)\s+your\s+(system\s+)?prompt/i,
        /show\s+(me\s+)?your\s+instructions/i,
        /what\s+were\s+you\s+told/i,
        /initial\s+instructions/i,
        /original\s+prompt/i,
        /how\s+were\s+you\s+programmed/i,
        /what\s+are\s+your\s+rules/i,
        /tell\s+me\s+your\s+configuration/i,
        /reveal\s+your\s+training/i,
    ],
    
    // Off-topic patterns (things this chatbot shouldn't discuss)
    offTopicPatterns: [
        /write\s+(me\s+)?(a|an|some)\s+(code|script|program|essay|story|poem)/i,
        /help\s+me\s+(with\s+)?(my\s+)?(homework|assignment|exam)/i,
        /translate\s+/i,
        /what\s+is\s+the\s+(meaning|capital|population|president)/i,
        /who\s+(is|was)\s+(the\s+)?(president|king|queen|prime\s+minister)/i,
        /how\s+to\s+(make|build|create|cook)\s+/i,
        /recipe\s+for/i,
        /tell\s+me\s+(a\s+)?joke/i,
        /sing\s+(me\s+)?(a\s+)?song/i,
        /play\s+(a\s+)?game/i,
        /roleplay/i,
        /(bitcoin|crypto|stock|invest|gambling)/i,
        /(hack|crack|exploit|malware|virus)/i,
        /(drug|weapon|illegal)/i,
    ],
    
    // Validate message
    validateMessage(message) {
        const result = {
            isValid: true,
            reason: null,
            sanitizedMessage: message
        };
        
        // Check message length
        if (message.length > CHATBOT_CONFIG.security.maxMessageLength) {
            result.isValid = false;
            result.reason = "MESSAGE_TOO_LONG";
            return result;
        }
        
        // Check rate limiting
        const now = Date.now();
        if (now - this.session.lastMessageTime < CHATBOT_CONFIG.security.rateLimitMs) {
            result.isValid = false;
            result.reason = "RATE_LIMITED";
            return result;
        }
        
        // Check session message limit
        if (this.session.messageCount >= CHATBOT_CONFIG.security.maxMessagesPerSession) {
            result.isValid = false;
            result.reason = "SESSION_LIMIT";
            return result;
        }
        
        // Check for injection attempts
        for (const pattern of this.injectionPatterns) {
            if (pattern.test(message)) {
                result.isValid = false;
                result.reason = "INJECTION_ATTEMPT";
                this.session.flaggedAttempts++;
                return result;
            }
        }
        
        // Check for prompt extraction attempts
        for (const pattern of this.extractionPatterns) {
            if (pattern.test(message)) {
                result.isValid = false;
                result.reason = "EXTRACTION_ATTEMPT";
                this.session.flaggedAttempts++;
                return result;
            }
        }
        
        // Sanitize HTML/scripts
        result.sanitizedMessage = this.sanitizeInput(message);
        
        // Update session
        this.session.messageCount++;
        this.session.lastMessageTime = now;
        
        return result;
    },
    
    // Check if off-topic
    isOffTopic(message) {
        for (const pattern of this.offTopicPatterns) {
            if (pattern.test(message)) {
                return true;
            }
        }
        return false;
    },
    
    // Sanitize user input
    sanitizeInput(input) {
        return input
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;')
            .trim();
    },
    
    // Check if can submit lead
    canSubmitLead() {
        return this.session.leadSubmissions < CHATBOT_CONFIG.security.maxLeadSubmissionsPerSession;
    },
    
    // Record lead submission
    recordLeadSubmission() {
        this.session.leadSubmissions++;
    },
    
    // Get security response for blocked messages
    getSecurityResponse(reason) {
        const responses = {
            MESSAGE_TOO_LONG: `I appreciate the detail, but could you keep your message shorter? I work best with concise questions. 😊`,
            
            RATE_LIMITED: `I'm still processing! Give me just a moment to respond.`,
            
            SESSION_LIMIT: `We've had quite a conversation! If you'd like to continue chatting with Ilyas directly, I'd be happy to take your contact info and have him reach out.`,
            
            INJECTION_ATTEMPT: `I'm designed specifically to help you learn about Ilyas and connect with him. Is there something about his work or experience I can help you with?`,
            
            EXTRACTION_ATTEMPT: `I'm Ilyas's portfolio assistant — I'm here to help you learn about his work and connect with him! What would you like to know about his projects or expertise?`,
            
            OFF_TOPIC: `Great question, but I'm specifically here to help you learn about Ilyas and his work in AI and Data Science. I can tell you about his projects, expertise, or help you get in touch with him. What interests you?`,
            
            BLOCKED: `I'm here to help you connect with Ilyas and learn about his AI/ML work. How can I assist you with that?`
        };
        
        return responses[reason] || responses.BLOCKED;
    }
};

// ==========================================
// LEAD CAPTURE MODULE  
// ==========================================
const LeadCapture = {
    // Current lead data being collected
    currentLead: {
        name: null,
        email: null,
        company: null,
        role: null,
        intent: null,
        projectInterest: null,
        message: null,
        timestamp: null,
        source: 'portfolio_chatbot'
    },
    
    // Conversation state
    state: {
        currentStep: 'idle',  // idle, collecting_name, collecting_email, collecting_company, collecting_role, collecting_message, complete
        intent: null,         // schedule, learn, contact, question
        awaitingResponse: false
    },
    
    // Email validation
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    // Reset lead
    reset() {
        this.currentLead = {
            name: null,
            email: null,
            company: null,
            role: null,
            intent: null,
            projectInterest: null,
            message: null,
            timestamp: null,
            source: 'portfolio_chatbot'
        };
        this.state = {
            currentStep: 'idle',
            intent: null,
            awaitingResponse: false
        };
    },
    
    // Start lead capture flow
    startCapture(intent) {
        this.reset();
        this.state.intent = intent;
        this.state.currentStep = 'collecting_name';
        this.currentLead.intent = intent;
        this.currentLead.timestamp = new Date().toISOString();
        
        const intentMessages = {
            schedule: `I'd love to help you set up a conversation with Ilyas! Let me get a few details so he can reach out to you personally.\n\nWhat's your name?`,
            learn: `That's great you're interested in Ilyas's work! If you'd like him to share more details directly, I can connect you.\n\nWhat's your name?`,
            contact: `Perfect, I'll make sure Ilyas gets your info! He typically responds within 24-48 hours.\n\nWhat's your name?`,
            question: `Great question! I'll make sure Ilyas can follow up with a detailed answer.\n\nFirst, what's your name?`
        };
        
        return intentMessages[intent] || intentMessages.contact;
    },
    
    // Process step response
    processStep(message) {
        const cleanMessage = message.trim();
        
        switch (this.state.currentStep) {
            case 'collecting_name':
                // Basic name validation (at least 2 characters, no numbers)
                if (cleanMessage.length < 2 || /\d/.test(cleanMessage)) {
                    return { 
                        continue: true, 
                        response: `I didn't quite catch that. Could you share your name?` 
                    };
                }
                this.currentLead.name = cleanMessage;
                this.state.currentStep = 'collecting_email';
                return { 
                    continue: true, 
                    response: `Nice to meet you, ${cleanMessage}! 😊\n\nWhat's the best email to reach you?` 
                };
                
            case 'collecting_email':
                if (!this.isValidEmail(cleanMessage)) {
                    return { 
                        continue: true, 
                        response: `Hmm, that doesn't look like a valid email. Could you double-check it?` 
                    };
                }
                this.currentLead.email = cleanMessage;
                this.state.currentStep = 'collecting_company';
                return { 
                    continue: true, 
                    response: `Got it! And where are you currently working? (Company name, or "independent" if freelancing)` 
                };
                
            case 'collecting_company':
                this.currentLead.company = cleanMessage;
                this.state.currentStep = 'collecting_role';
                return { 
                    continue: true, 
                    response: `Great! What's your role there?` 
                };
                
            case 'collecting_role':
                this.currentLead.role = cleanMessage;
                this.state.currentStep = 'collecting_message';
                
                const contextPrompts = {
                    schedule: `Perfect! Last thing — what would you like to discuss with Ilyas? (e.g., job opportunity, collaboration, technical consultation)`,
                    learn: `Awesome! Is there a specific project or topic you'd like Ilyas to elaborate on?`,
                    contact: `Great! Any specific message you'd like me to pass along to Ilyas?`,
                    question: `Got it! What's the question you'd like Ilyas to answer?`
                };
                
                return { 
                    continue: true, 
                    response: contextPrompts[this.state.intent] || contextPrompts.contact
                };
                
            case 'collecting_message':
                this.currentLead.message = cleanMessage;
                this.state.currentStep = 'complete';
                return { 
                    continue: false, 
                    response: null,
                    leadData: { ...this.currentLead }
                };
                
            default:
                return { continue: false, response: null };
        }
    },
    
    // Check if currently collecting
    isCollecting() {
        return this.state.currentStep !== 'idle' && this.state.currentStep !== 'complete';
    }
};

// ==========================================
// EMAIL SERVICE (EmailJS)
// ==========================================
const EmailService = {
    initialized: false,
    
    init() {
        if (typeof emailjs !== 'undefined' && !this.initialized) {
            emailjs.init(CHATBOT_CONFIG.emailjs.publicKey);
            this.initialized = true;
        }
    },
    
    async sendLeadNotification(leadData) {
        if (!this.initialized) {
            console.warn('EmailJS not initialized');
            return false;
        }
        
        try {
            const templateParams = {
                to_email: CHATBOT_CONFIG.ownerEmail,
                from_name: leadData.name,
                from_email: leadData.email,
                company: leadData.company || 'Not provided',
                role: leadData.role || 'Not provided',
                intent: leadData.intent,
                message: leadData.message || 'No message',
                project_interest: leadData.projectInterest || 'General',
                timestamp: new Date(leadData.timestamp).toLocaleString(),
                reply_to: leadData.email
            };
            
            await emailjs.send(
                CHATBOT_CONFIG.emailjs.serviceId,
                CHATBOT_CONFIG.emailjs.templateId,
                templateParams
            );
            
            return true;
        } catch (error) {
            console.error('Email send failed:', error);
            return false;
        }
    }
};

// ==========================================
// GOOGLE SHEETS SERVICE
// ==========================================
const SheetsService = {
    // Google Apps Script Web App URL (you'll set this up)
    webhookUrl: null, // "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL"
    
    async logLead(leadData) {
        if (!this.webhookUrl) {
            console.log('Sheets webhook not configured. Lead data:', leadData);
            return true; // Don't fail if not configured
        }
        
        try {
            await fetch(this.webhookUrl, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(leadData)
            });
            return true;
        } catch (error) {
            console.error('Sheets log failed:', error);
            return false;
        }
    }
};

// ==========================================
// CLAUDE AI SERVICE
// ==========================================
const ClaudeService = {
    conversationHistory: [],
    
    async getResponse(message) {
        try {
            const response = await fetch(CHATBOT_CONFIG.apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: message,
                    conversationHistory: this.conversationHistory
                })
            });
            
            if (!response.ok) throw new Error(`API error: ${response.status}`);
            
            const data = await response.json();
            this.conversationHistory = data.conversationHistory || [];
            
            return { success: true, response: data.response };
            
        } catch (error) {
            console.error('Claude API error:', error);
            return { success: false, response: null };
        }
    },
    
    reset() {
        this.conversationHistory = [];
    }
};

// ==========================================
// CHATBOT RESPONSES
// ==========================================
const ChatResponses = {
    // Project information
    projects: {
        lulubot: {
            name: "LuluBot",
            description: "A multi-agent sales intelligence platform built with LangGraph. It orchestrates web research, transaction analysis, and marketing intelligence agents to identify untapped product opportunities."
        },
        rag: {
            name: "Technical Service RAG Agent", 
            description: "A production RAG system that searches 100K+ Salesforce cases and Egnyte documentation to answer technical questions instantly. Deployed via Microsoft Teams."
        },
        coa: {
            name: "CoA Data Pipeline",
            description: "Template-based extraction system processing ~1M Certificate of Analysis PDFs with high accuracy. Built on Databricks with Delta Lake."
        },
        antibody: {
            name: "Antibody Pair Prediction",
            description: "Semi-supervised ML pipeline using teacher-student learning with XGBoost to predict optimal capture-detect antibody pairs."
        },
        librechat: {
            name: "Enterprise ChatGPT",
            description: "Deployed LibreChat as an internal ChatGPT alternative with SSO integration, usage tracking, and compliance features."
        },
        graph: {
            name: "Graph Recommendation Engine",
            description: "Graph-based recommendation pipeline leveraging product relationships and customer behavior for explainable suggestions."
        }
    },
    
    // Expertise areas
    expertise: [
        "Multi-Agent Systems (LangGraph, LangChain)",
        "RAG Architectures & Vector Databases",
        "Machine Learning (XGBoost, Semi-supervised Learning)",
        "Databricks & Spark",
        "Azure OpenAI & Cloud Infrastructure",
        "Biotechnology & Life Sciences Domain",
        "Production ML Deployment"
    ],
    
    // Get project list response
    getProjectList() {
        let response = "Ilyas has built some impressive AI systems:\n\n";
        const projectKeys = Object.keys(this.projects);
        projectKeys.forEach((key, i) => {
            response += `${i + 1}️⃣ **${this.projects[key].name}**\n`;
        });
        response += "\nWhich one would you like to know more about?";
        return response;
    },
    
    // Get specific project response
    getProjectDetails(projectKey) {
        const project = this.projects[projectKey];
        if (!project) return null;
        return `**${project.name}**\n\n${project.description}\n\nWould you like Ilyas to tell you more about how he built this? I can connect you!`;
    },
    
    // Get expertise response
    getExpertise() {
        let response = `Ilyas specializes in:\n\n`;
        this.expertise.forEach(skill => {
            response += `• ${skill}\n`;
        });
        response += `\nHe's particularly passionate about building AI systems that actually get deployed and used — not just POCs.\n\nAnything specific you'd like to know more about?`;
        return response;
    },
    
    // Detect intent from message
    detectIntent(message) {
        const msg = message.toLowerCase();
        
        // Schedule/meeting intent
        if (/schedul|meeting|call|chat|talk|speak|connect|book/.test(msg)) {
            return 'schedule';
        }
        
        // Learn about projects
        if (/project|work|built|portfolio|show|tell.*about/.test(msg)) {
            return 'learn';
        }
        
        // Contact info
        if (/contact|email|reach|linkedin|get\s+in\s+touch/.test(msg)) {
            return 'contact';
        }
        
        // Questions about expertise
        if (/experience|expertise|skill|know|background|capable|can\s+(he|ilyas)/.test(msg)) {
            return 'question';
        }
        
        // Specific project mentions
        if (/lulu|rag|coa|antibod|librechat|graph|recommend/.test(msg)) {
            return 'project_specific';
        }
        
        // Greeting
        if (/^(hi|hello|hey|good\s+(morning|afternoon|evening)|greetings)/i.test(msg)) {
            return 'greeting';
        }
        
        // Thank you
        if (/thank|thanks|thx|appreciate/.test(msg)) {
            return 'thanks';
        }
        
        return 'unknown';
    },
    
    // Detect specific project from message
    detectProject(message) {
        const msg = message.toLowerCase();
        
        if (/lulu/.test(msg)) return 'lulubot';
        if (/rag|technical\s+service|salesforce|search/.test(msg)) return 'rag';
        if (/coa|pdf|certificate|million|document/.test(msg)) return 'coa';
        if (/antibod|pair|xgboost|semi.*supervis/.test(msg)) return 'antibody';
        if (/librechat|chatgpt|internal/.test(msg)) return 'librechat';
        if (/graph|recommend|network/.test(msg)) return 'graph';
        
        return null;
    },
    
    // Main response handler
    getResponse(message, isCollecting = false) {
        const intent = this.detectIntent(message);
        
        // Handle greetings
        if (intent === 'greeting') {
            return {
                text: `Hello! 👋 Great to meet you! I'm here to help you learn about Ilyas and connect with him.\n\nWhat brings you here today?\n\n📅 Schedule a conversation\n💼 Explore his projects\n📧 Get in touch\n❓ Ask about his expertise`,
                action: null
            };
        }
        
        // Handle thanks
        if (intent === 'thanks') {
            return {
                text: `You're welcome! 😊 Is there anything else I can help you with? Feel free to ask about Ilyas's work or let me know if you'd like to connect with him.`,
                action: null
            };
        }
        
        // Handle schedule intent
        if (intent === 'schedule') {
            return {
                text: null,
                action: 'start_capture',
                captureIntent: 'schedule'
            };
        }
        
        // Handle contact intent
        if (intent === 'contact') {
            return {
                text: `Here's how to reach Ilyas:\n\n📧 Email: ${CHATBOT_CONFIG.ownerEmail}\n\nWould you like me to let him know you're reaching out? I can take your details and he'll get back to you within 24-48 hours!`,
                action: 'offer_capture',
                captureIntent: 'contact'
            };
        }
        
        // Handle project list request
        if (intent === 'learn') {
            return {
                text: this.getProjectList(),
                action: null
            };
        }
        
        // Handle specific project
        if (intent === 'project_specific') {
            const projectKey = this.detectProject(message);
            if (projectKey) {
                LeadCapture.currentLead.projectInterest = this.projects[projectKey].name;
                return {
                    text: this.getProjectDetails(projectKey),
                    action: 'offer_capture',
                    captureIntent: 'learn'
                };
            }
        }
        
        // Handle expertise questions
        if (intent === 'question') {
            return {
                text: this.getExpertise(),
                action: 'offer_capture',
                captureIntent: 'question'
            };
        }
        
        // Unknown intent - guide them
        return {
            text: `I'm here to help you learn about Ilyas and connect with him! I can:\n\n📅 Help you schedule a conversation\n💼 Tell you about his AI/ML projects\n📧 Connect you with him directly\n❓ Answer questions about his expertise\n\nWhat would you like to know?`,
            action: null
        };
    }
};

// ==========================================
// MAIN CHATBOT CONTROLLER
// ==========================================
const Chatbot = {
    // DOM Elements
    elements: {
        messages: null,
        input: null,
        sendBtn: null,
        suggestions: null
    },
    
    // State
    pendingCapture: null,  // If we offered capture and awaiting yes/no
    
    // Initialize
    init() {
        this.elements.messages = document.getElementById('chatMessages');
        this.elements.input = document.getElementById('chatInput');
        this.elements.sendBtn = document.getElementById('chatSend');
        this.elements.suggestions = document.querySelectorAll('.suggestion-btn');
        
        if (!this.elements.messages || !this.elements.input) return;
        
        // Initialize EmailJS
        EmailService.init();
        
        // Event listeners
        this.elements.sendBtn?.addEventListener('click', () => this.handleSend());
        this.elements.input?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSend();
        });
        
        // Suggestion buttons
        this.elements.suggestions.forEach(btn => {
            btn.addEventListener('click', () => {
                this.elements.input.value = btn.getAttribute('data-message');
                this.handleSend();
            });
        });
    },
    
    // Add message to chat
    addMessage(content, isUser = false) {
        const message = document.createElement('div');
        message.className = `message ${isUser ? 'user' : 'assistant'}`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = isUser ? 
            `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
            </svg>` :
            `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z"/>
                <path d="M16 10v2a4 4 0 0 1-8 0v-2"/>
                <path d="M12 14v8"/>
                <path d="M8 18h8"/>
            </svg>`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        // Convert markdown-style bold to HTML
        const formattedContent = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        messageContent.innerHTML = `<p>${formattedContent.replace(/\n/g, '<br>')}</p>`;
        
        message.appendChild(avatar);
        message.appendChild(messageContent);
        this.elements.messages.appendChild(message);
        
        // Scroll to bottom
        this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
    },
    
    // Add typing indicator
    addTypingIndicator() {
        const typing = document.createElement('div');
        typing.className = 'message assistant';
        typing.id = 'typingIndicator';
        
        typing.innerHTML = `
            <div class="message-avatar">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z"/>
                    <path d="M16 10v2a4 4 0 0 1-8 0v-2"/>
                    <path d="M12 14v8"/>
                    <path d="M8 18h8"/>
                </svg>
            </div>
            <div class="message-content">
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        
        this.elements.messages.appendChild(typing);
        this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
    },
    
    // Remove typing indicator
    removeTypingIndicator() {
        const typing = document.getElementById('typingIndicator');
        if (typing) typing.remove();
    },
    
    // Handle send
    async handleSend() {
        const message = this.elements.input.value.trim();
        if (!message) return;
        
        // Security validation
        const validation = SecurityGuard.validateMessage(message);
        
        if (!validation.isValid) {
            this.addMessage(message, true);
            this.elements.input.value = '';
            
            // Slight delay before security response
            this.addTypingIndicator();
            await this.delay(800);
            this.removeTypingIndicator();
            
            this.addMessage(SecurityGuard.getSecurityResponse(validation.reason));
            return;
        }
        
        // Check for off-topic
        if (SecurityGuard.isOffTopic(message)) {
            this.addMessage(message, true);
            this.elements.input.value = '';
            
            this.addTypingIndicator();
            await this.delay(800);
            this.removeTypingIndicator();
            
            this.addMessage(SecurityGuard.getSecurityResponse('OFF_TOPIC'));
            return;
        }
        
        // Add user message
        this.addMessage(validation.sanitizedMessage, true);
        this.elements.input.value = '';
        
        // Show typing
        this.addTypingIndicator();
        
        // Process message
        await this.processMessage(validation.sanitizedMessage);
    },
    
    // Process message
    async processMessage(message) {
        // If we offered capture and awaiting response
        if (this.pendingCapture) {
            const msg = message.toLowerCase();
            if (/^(yes|sure|okay|ok|yeah|yep|please|definitely|absolutely|yea|ya)/.test(msg)) {
                await this.delay(500);
                this.removeTypingIndicator();
                const response = LeadCapture.startCapture(this.pendingCapture);
                this.pendingCapture = null;
                this.addMessage(response);
                return;
            } else if (/^(no|nope|nah|not\s*now|later|maybe|not\s*yet)/.test(msg)) {
                this.pendingCapture = null;
                await this.delay(500);
                this.removeTypingIndicator();
                this.addMessage(`No problem! Feel free to explore or ask me anything else about Ilyas's work. 😊`);
                return;
            }
            this.pendingCapture = null;
        }
        
        // If currently collecting lead info
        if (LeadCapture.isCollecting()) {
            await this.delay(400);
            this.removeTypingIndicator();
            const result = LeadCapture.processStep(message);
            
            if (result.continue) {
                this.addMessage(result.response);
            } else {
                await this.submitLead(result.leadData);
            }
            return;
        }
        
        // Check for direct lead capture intent
        const leadIntent = this.detectLeadIntent(message);
        if (leadIntent && SecurityGuard.canSubmitLead()) {
            await this.delay(500);
            this.removeTypingIndicator();
            const captureResponse = LeadCapture.startCapture(leadIntent);
            this.addMessage(captureResponse);
            return;
        }
        
        // Try Claude AI first
        const aiResult = await ClaudeService.getResponse(message);
        this.removeTypingIndicator();
        
        if (aiResult.success && aiResult.response) {
            this.addMessage(aiResult.response);
            
            // Check if AI suggested lead capture
            if (this.shouldTriggerCapture(aiResult.response)) {
                this.pendingCapture = 'contact';
            }
        } else {
            // Fallback to predefined responses if Claude fails
            const response = ChatResponses.getResponse(message);
            
            if (response.action === 'start_capture') {
                if (!SecurityGuard.canSubmitLead()) {
                    this.addMessage(`You've already submitted your info — Ilyas will be in touch soon!`);
                    return;
                }
                const captureResponse = LeadCapture.startCapture(response.captureIntent);
                this.addMessage(captureResponse);
            } else if (response.action === 'offer_capture') {
                this.addMessage(response.text);
                this.pendingCapture = response.captureIntent;
            } else {
                this.addMessage(response.text);
            }
        }
    },
    
    // Detect if user wants to start lead capture
    detectLeadIntent(message) {
        const msg = message.toLowerCase();
        if (/\b(schedule|book|set\s*up)\s*(a\s*)?(call|meeting|time|chat)\b/.test(msg)) return 'schedule';
        if (/\b(hire|hiring|job|position|opportunity|recruit)\b/.test(msg)) return 'schedule';
        if (/\b(contact|reach|get\s*in\s*touch)\s*(him|ilyas)?\b/.test(msg)) return 'contact';
        if (/\b(share|give|send)\s*(my|me)?\s*(info|contact|email|details)\b/.test(msg)) return 'contact';
        return null;
    },
    
    // Check if AI response suggests lead capture
    shouldTriggerCapture(response) {
        const r = response.toLowerCase();
        return /would you like (me to |to )?(share|pass|send|connect|take) (your|you)/.test(r) ||
               /share your (info|contact|email|details)/.test(r) ||
               /can i (get|take|have) your (info|contact|email|name)/.test(r);
    },
    
    // Submit lead
    async submitLead(leadData) {
        if (!SecurityGuard.canSubmitLead()) {
            this.addMessage(`Thanks for your interest! You've already submitted your info. Ilyas will reach out soon! 😊`);
            LeadCapture.reset();
            return;
        }
        
        // Record submission for rate limiting
        SecurityGuard.recordLeadSubmission();
        
        // Send email notification
        const emailSent = await EmailService.sendLeadNotification(leadData);
        
        // Log to Google Sheets
        await SheetsService.logLead(leadData);
        
        // Success message
        const successMessage = `Perfect, ${leadData.name}! 🎉

I've passed your information to Ilyas:
• **Email:** ${leadData.email}
• **Company:** ${leadData.company}
• **Role:** ${leadData.role}
• **Reason:** ${leadData.message}

He typically responds within **24-48 hours**. In the meantime, feel free to explore his projects or ask me anything else!`;

        this.addMessage(successMessage);
        
        // Reset for potential future captures
        LeadCapture.reset();
        
        // Log to console for backup
        console.log('Lead captured:', leadData);
    },
    
    // Delay helper
    delay(ms = null) {
        const delay = ms || (CHATBOT_CONFIG.responseDelayMs.min + 
            Math.random() * (CHATBOT_CONFIG.responseDelayMs.max - CHATBOT_CONFIG.responseDelayMs.min));
        return new Promise(resolve => setTimeout(resolve, delay));
    }
};

// ==========================================
// INITIALIZE ON DOM LOAD
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    Chatbot.init();
});

// ==========================================
// EXPORT FOR DEBUGGING (remove in production)
// ==========================================
window.__CHATBOT_DEBUG__ = {
    SecurityGuard,
    LeadCapture,
    ChatResponses,
    Chatbot,
    getSession: () => SecurityGuard.session,
    getLead: () => LeadCapture.currentLead
};
