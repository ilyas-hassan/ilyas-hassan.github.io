/* ==========================================
   ILYAS PORTFOLIO - INTERACTIVE JAVASCRIPT
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all modules
    initCursorGlow();
    initNavigation();
    initNeuralCanvas();
    initStatCounters();
    initProjectModals();
    initChatbot();
    initScrollAnimations();
    initCurrentYear();
});

/* ==========================================
   CURSOR GLOW EFFECT
   ========================================== */
function initCursorGlow() {
    const cursorGlow = document.getElementById('cursorGlow');
    if (!cursorGlow) return;
    
    let mouseX = 0, mouseY = 0;
    let currentX = 0, currentY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    function animate() {
        // Smooth follow
        currentX += (mouseX - currentX) * 0.1;
        currentY += (mouseY - currentY) * 0.1;
        
        cursorGlow.style.left = currentX + 'px';
        cursorGlow.style.top = currentY + 'px';
        
        requestAnimationFrame(animate);
    }
    animate();
}

/* ==========================================
   NAVIGATION
   ========================================== */
function initNavigation() {
    const nav = document.getElementById('nav');
    const navToggle = document.getElementById('navToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileLinks = document.querySelectorAll('.mobile-link');
    
    // Scroll effect
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    });
    
    // Mobile menu toggle
    navToggle?.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });
    
    // Close mobile menu on link click
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offset = 80;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/* ==========================================
   NEURAL NETWORK CANVAS ANIMATION
   ========================================== */
function initNeuralCanvas() {
    const canvas = document.getElementById('neuralCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let animationId;
    let nodes = [];
    let mouse = { x: null, y: null };
    
    // Configuration
    const config = {
        nodeCount: 80,
        connectionDistance: 150,
        nodeSpeed: 0.3,
        nodeSize: { min: 2, max: 4 },
        colors: {
            node: '#00d4aa',
            connection: 'rgba(0, 212, 170, 0.15)',
            nodeGlow: 'rgba(0, 212, 170, 0.5)'
        }
    };
    
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initNodes();
    }
    
    function initNodes() {
        nodes = [];
        for (let i = 0; i < config.nodeCount; i++) {
            nodes.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * config.nodeSpeed,
                vy: (Math.random() - 0.5) * config.nodeSpeed,
                size: Math.random() * (config.nodeSize.max - config.nodeSize.min) + config.nodeSize.min
            });
        }
    }
    
    function drawNode(node) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
        ctx.fillStyle = config.colors.node;
        ctx.fill();
        
        // Glow effect
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size + 2, 0, Math.PI * 2);
        ctx.fillStyle = config.colors.nodeGlow;
        ctx.fill();
    }
    
    function drawConnections() {
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dx = nodes[i].x - nodes[j].x;
                const dy = nodes[i].y - nodes[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < config.connectionDistance) {
                    const opacity = (1 - distance / config.connectionDistance) * 0.3;
                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.strokeStyle = `rgba(0, 212, 170, ${opacity})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
            
            // Connect to mouse
            if (mouse.x && mouse.y) {
                const dx = nodes[i].x - mouse.x;
                const dy = nodes[i].y - mouse.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < config.connectionDistance * 1.5) {
                    const opacity = (1 - distance / (config.connectionDistance * 1.5)) * 0.5;
                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.strokeStyle = `rgba(0, 180, 216, ${opacity})`;
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                }
            }
        }
    }
    
    function updateNodes() {
        nodes.forEach(node => {
            node.x += node.vx;
            node.y += node.vy;
            
            // Bounce off edges
            if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
            if (node.y < 0 || node.y > canvas.height) node.vy *= -1;
            
            // Mouse interaction
            if (mouse.x && mouse.y) {
                const dx = node.x - mouse.x;
                const dy = node.y - mouse.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    const force = (100 - distance) / 100;
                    node.x += (dx / distance) * force * 2;
                    node.y += (dy / distance) * force * 2;
                }
            }
        });
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        updateNodes();
        drawConnections();
        nodes.forEach(drawNode);
        
        animationId = requestAnimationFrame(animate);
    }
    
    // Event listeners
    window.addEventListener('resize', resize);
    
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });
    
    canvas.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });
    
    // Initialize
    resize();
    animate();
}

/* ==========================================
   STAT COUNTERS
   ========================================== */
function initStatCounters() {
    const stats = document.querySelectorAll('.stat-number');
    
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    stats.forEach(stat => observer.observe(stat));
}

function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-count'));
    const duration = 2000;
    const start = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(target * easeOutQuart);
        
        // Format number
        if (target >= 1000000) {
            element.textContent = (current / 1000000).toFixed(1) + 'M+';
        } else if (target >= 1000) {
            element.textContent = (current / 1000).toFixed(0) + 'K+';
        } else {
            element.textContent = current + (target === 100 ? '%' : '+');
        }
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

/* ==========================================
   PROJECT MODALS
   ========================================== */
function initProjectModals() {
    const modal = document.getElementById('projectModal');
    const modalBody = document.getElementById('modalBody');
    const modalClose = modal?.querySelector('.modal-close');
    const modalBackdrop = modal?.querySelector('.modal-backdrop');
    const projectCards = document.querySelectorAll('.project-card');
    
    const projectData = {
        lulubot: {
            title: 'LuluBot',
            subtitle: 'Multi-Agent Sales Intelligence Platform',
            description: `LuluBot is an orchestrated multi-agent system that revolutionizes how sales teams discover opportunities. 
            By combining web research, transaction analysis, and marketing intelligence, it identifies untapped product opportunities 
            that would take humans weeks to uncover.`,
            architecture: `┌─────────────────────────────────────────────────────────────┐
│                    LULUBOT ARCHITECTURE                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│    ┌──────────┐     ┌──────────┐     ┌──────────────┐       │
│    │   Web    │     │  Sales   │     │  Marketing   │       │
│    │ Research │     │  Data    │     │ Intelligence │       │
│    │  Agent   │     │  Agent   │     │    Agent     │       │
│    └────┬─────┘     └────┬─────┘     └──────┬───────┘       │
│         │                │                   │               │
│         └────────────────┼───────────────────┘               │
│                          ▼                                   │
│              ┌───────────────────────┐                       │
│              │   LangGraph           │                       │
│              │   Orchestrator        │                       │
│              └───────────┬───────────┘                       │
│                          │                                   │
│         ┌────────────────┼────────────────┐                  │
│         ▼                ▼                ▼                  │
│    ┌─────────┐    ┌───────────┐    ┌──────────┐             │
│    │Salesforce│    │ Databricks │    │Azure     │             │
│    │   CRM   │    │   Unity   │    │OpenAI    │             │
│    └─────────┘    └───────────┘    └──────────┘             │
│                                                              │
└─────────────────────────────────────────────────────────────┘`
        },
        rag: {
            title: 'Technical Service RAG Agent',
            subtitle: 'Production-Ready AI for Support Teams',
            description: `A retrieval-augmented generation system that has transformed how our technical service team operates. 
            It searches through 100K+ historical Salesforce cases and Egnyte documentation to provide instant, accurate answers 
            to complex technical questions. Deployed via Microsoft Teams for seamless workflow integration.`,
            architecture: `┌─────────────────────────────────────────────────────────────┐
│              TECHNICAL SERVICE RAG ARCHITECTURE              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│    User Query (MS Teams)                                     │
│           │                                                  │
│           ▼                                                  │
│    ┌───────────────────┐                                     │
│    │  Query Processing │                                     │
│    │  & Intent Router  │                                     │
│    └─────────┬─────────┘                                     │
│              │                                               │
│    ┌─────────┴─────────┐                                     │
│    ▼                   ▼                                     │
│ ┌──────────┐    ┌──────────────┐                             │
│ │Salesforce│    │    Egnyte    │                             │
│ │  Cases   │    │    Docs      │                             │
│ │  (100K+) │    │              │                             │
│ └────┬─────┘    └──────┬───────┘                             │
│      │                 │                                     │
│      └────────┬────────┘                                     │
│               ▼                                              │
│    ┌───────────────────┐                                     │
│    │  Unity Catalog    │                                     │
│    │  Vector Store     │                                     │
│    └─────────┬─────────┘                                     │
│              │                                               │
│              ▼                                               │
│    ┌───────────────────┐                                     │
│    │   Azure OpenAI    │                                     │
│    │   Response Gen    │                                     │
│    └───────────────────┘                                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘`
        },
        coa: {
            title: 'CoA Data Pipeline',
            subtitle: 'Million-Scale PDF Processing',
            description: `Built a robust data extraction system that processes nearly 1 million Certificate of Analysis PDFs. 
            Using template-based extraction with intelligent fallbacks, the system achieves high accuracy while handling 
            the inherent variability in document formats across different time periods and sources.`,
            architecture: `┌─────────────────────────────────────────────────────────────┐
│               COA EXTRACTION PIPELINE                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│    PDF Source (~1M documents)                                │
│           │                                                  │
│           ▼                                                  │
│    ┌───────────────────┐                                     │
│    │  Document         │                                     │
│    │  Classification   │──── Template Detection              │
│    └─────────┬─────────┘                                     │
│              │                                               │
│    ┌─────────┴─────────────────┐                             │
│    ▼                           ▼                             │
│ ┌──────────────┐     ┌──────────────┐                        │
│ │  Template A  │     │  Template B  │  ... N templates       │
│ │  Extractor   │     │  Extractor   │                        │
│ └──────┬───────┘     └──────┬───────┘                        │
│        │                    │                                │
│        └────────┬───────────┘                                │
│                 ▼                                            │
│    ┌───────────────────┐                                     │
│    │  Data Validation  │                                     │
│    │  & Normalization  │                                     │
│    └─────────┬─────────┘                                     │
│              │                                               │
│              ▼                                               │
│    ┌───────────────────┐                                     │
│    │   Delta Lake      │                                     │
│    │   (Databricks)    │                                     │
│    └───────────────────┘                                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘`
        },
        antibody: {
            title: 'Antibody Pair Prediction',
            subtitle: 'Semi-Supervised Learning Pipeline',
            description: `Developed a machine learning system to predict optimal capture-detect antibody pairs using a 
            teacher-student learning approach with XGBoost. The model leverages SPR binding data from Carterra equipment 
            and functional assay results from Ella immunoassay platforms to identify high-performing antibody combinations.`,
            architecture: `┌─────────────────────────────────────────────────────────────┐
│            ANTIBODY PAIR PREDICTION ARCHITECTURE             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│    ┌──────────────┐         ┌──────────────┐                 │
│    │ Carterra SPR │         │    Ella      │                 │
│    │  Binding     │         │ Immunoassay  │                 │
│    │    Data      │         │   Results    │                 │
│    └──────┬───────┘         └──────┬───────┘                 │
│           │                        │                         │
│           └──────────┬─────────────┘                         │
│                      ▼                                       │
│           ┌──────────────────────┐                           │
│           │  Feature Engineering │                           │
│           │  (Antibody Props)    │                           │
│           └──────────┬───────────┘                           │
│                      │                                       │
│    ┌─────────────────┴─────────────────┐                     │
│    ▼                                   ▼                     │
│ ┌────────────────┐          ┌────────────────┐               │
│ │  Teacher Model │          │ Pseudo-labeled │               │
│ │   (Labeled     │ ───────▶ │     Data       │               │
│ │    Data)       │          │                │               │
│ └────────────────┘          └───────┬────────┘               │
│                                     │                        │
│                                     ▼                        │
│                          ┌────────────────┐                  │
│                          │  Student Model │                  │
│                          │   (XGBoost)    │                  │
│                          └───────┬────────┘                  │
│                                  │                           │
│                                  ▼                           │
│                         Pair Recommendations                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘`
        },
        librechat: {
            title: 'Enterprise ChatGPT',
            subtitle: 'Internal AI Platform with LibreChat',
            description: `Deployed LibreChat as an internal ChatGPT alternative, enabling secure AI assistance across the organization. 
            The deployment includes custom integrations for enterprise authentication, usage tracking, and compliance with 
            internal data governance policies.`,
            architecture: `┌─────────────────────────────────────────────────────────────┐
│              ENTERPRISE CHATGPT ARCHITECTURE                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│    Users (Internal)                                          │
│           │                                                  │
│           ▼                                                  │
│    ┌───────────────────┐                                     │
│    │   Azure SSO       │                                     │
│    │   Authentication  │                                     │
│    └─────────┬─────────┘                                     │
│              │                                               │
│              ▼                                               │
│    ┌───────────────────────────────────┐                     │
│    │          LibreChat                │                     │
│    │    ┌─────────────────────┐        │                     │
│    │    │    Web Interface    │        │                     │
│    │    └──────────┬──────────┘        │                     │
│    │               │                   │                     │
│    │    ┌──────────┴──────────┐        │                     │
│    │    │   Model Router      │        │                     │
│    │    └──────────┬──────────┘        │                     │
│    └───────────────┼───────────────────┘                     │
│                    │                                         │
│    ┌───────────────┼───────────────┐                         │
│    ▼               ▼               ▼                         │
│ ┌──────┐      ┌──────┐       ┌──────┐                        │
│ │GPT-4 │      │Claude│       │Gemini│                        │
│ └──────┘      └──────┘       └──────┘                        │
│                                                              │
│    ┌───────────────────────────────────┐                     │
│    │   Usage Analytics & Logging       │                     │
│    └───────────────────────────────────┘                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘`
        },
        graph: {
            title: 'Graph Recommendation Engine',
            subtitle: 'Network-Based Product Discovery',
            description: `A graph-based recommendation system that leverages product relationships and customer behavior 
            patterns to surface relevant suggestions. Unlike traditional collaborative filtering, this approach provides 
            explainable recommendations by traversing the product knowledge graph.`,
            architecture: `┌─────────────────────────────────────────────────────────────┐
│           GRAPH RECOMMENDATION ARCHITECTURE                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│    ┌───────────────┐      ┌───────────────┐                  │
│    │   Product     │      │   Customer    │                  │
│    │   Catalog     │      │  Transaction  │                  │
│    │              │      │     History   │                  │
│    └───────┬───────┘      └───────┬───────┘                  │
│            │                      │                          │
│            └──────────┬───────────┘                          │
│                       ▼                                      │
│            ┌───────────────────┐                             │
│            │   Graph Builder   │                             │
│            │                   │                             │
│            └─────────┬─────────┘                             │
│                      │                                       │
│                      ▼                                       │
│    ┌─────────────────────────────────┐                       │
│    │        Knowledge Graph          │                       │
│    │   ┌─────┐      ┌─────┐          │                       │
│    │   │ (P) ├──────┤ (P) │          │                       │
│    │   └──┬──┘      └──┬──┘          │                       │
│    │      │    ┌───┐   │             │                       │
│    │      └────┤(C)├───┘             │                       │
│    │           └───┘                 │                       │
│    └─────────────┬───────────────────┘                       │
│                  │                                           │
│                  ▼                                           │
│    ┌───────────────────┐    ┌───────────────────┐            │
│    │  Graph Traversal  │    │  GNN Embeddings   │            │
│    │   Algorithms      │    │  (Optional)       │            │
│    └─────────┬─────────┘    └─────────┬─────────┘            │
│              │                        │                      │
│              └──────────┬─────────────┘                      │
│                         ▼                                    │
│              Ranked Recommendations                          │
│              + Explanation Paths                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘`
        }
    };
    
    function openModal(projectId) {
        const data = projectData[projectId];
        if (!data) return;
        
        modalBody.innerHTML = `
            <h3>${data.title}</h3>
            <h4>${data.subtitle}</h4>
            <p>${data.description}</p>
            <div class="architecture-title">System Architecture</div>
            <div class="architecture-diagram">${data.architecture}</div>
        `;
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    projectCards.forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('.project-expand')) {
                const projectId = card.getAttribute('data-project');
                openModal(projectId);
            }
        });
    });
    
    modalClose?.addEventListener('click', closeModal);
    modalBackdrop?.addEventListener('click', closeModal);
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

/* ==========================================
   AI CHATBOT (Loaded from chatbot.js)
   ========================================== */
function initChatbot() {
    // Chatbot initialization is handled by chatbot.js
    // This stub is kept for backwards compatibility
    if (typeof Chatbot !== 'undefined' && Chatbot.init) {
        // Chatbot.init() is called in chatbot.js on DOMContentLoaded
        console.log('Secure chatbot loaded');
    }
}

/* ==========================================
   SCROLL ANIMATIONS
   ========================================== */
function initScrollAnimations() {
    const fadeElements = document.querySelectorAll('.section-header, .about-content, .about-image, .project-card, .skill-category, .contact-card');
    
    fadeElements.forEach(el => {
        el.classList.add('fade-in');
    });
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    fadeElements.forEach(el => observer.observe(el));
}

/* ==========================================
   CURRENT YEAR
   ========================================== */
function initCurrentYear() {
    const yearElement = document.getElementById('currentYear');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

/* ==========================================
   CHATBOT WITH CLAUDE API (OPTIONAL)
   ==========================================
   
   To enable the Claude API integration, replace the getResponse function
   with the following code and add your API key:
   
   async function getClaudeResponse(message) {
       const response = await fetch('https://api.anthropic.com/v1/messages', {
           method: 'POST',
           headers: {
               'Content-Type': 'application/json',
               'x-api-key': 'YOUR_CLAUDE_API_KEY',
               'anthropic-version': '2023-06-01'
           },
           body: JSON.stringify({
               model: 'claude-3-haiku-20240307',
               max_tokens: 1024,
               system: `You are an AI assistant for Ilyas, a Data Scientist at Bio-Techne. 
                        Help visitors learn about Ilyas, his work, and how to connect with him.
                        Be helpful, professional, and personable. Keep responses concise.
                        
                        Key info about Ilyas:
                        - Data Scientist on the Data Lab team at Bio-Techne
                        - Leads GenAI initiatives
                        - Expert in: Multi-Agent Systems, RAG, ML, Databricks, Azure
                        - Email: ${ilyasInfo.email}
                        - LinkedIn: ${ilyasInfo.linkedin}
                        - Calendly: ${ilyasInfo.calendly}`,
               messages: [{ role: 'user', content: message }]
           })
       });
       
       const data = await response.json();
       return data.content[0].text;
   }
   
   ========================================== */
