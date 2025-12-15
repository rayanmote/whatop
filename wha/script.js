// script.js

// Application State
const AppState = {
    currentUser: null,
    questions: [],
    users: [],
    likedQuestions: new Set()
};

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initApp();
    
    // Set current year in footer
    document.getElementById('current-year').textContent = new Date().getFullYear();
});

// Initialize application
function initApp() {
    // Load data from localStorage
    loadDataFromStorage();
    
    // Setup event listeners
    setupEventListeners();
    
    // Load questions
    loadQuestions();
    
    // Show welcome message if first visit
    if (!localStorage.getItem('whatif_visited')) {
        setTimeout(() => {
            showToast('Welcome to What If? Explore endless possibilities!', 'success');
            localStorage.setItem('whatif_visited', 'true');
        }, 1000);
    }
}

// Load data from localStorage
function loadDataFromStorage() {
    // Load users
    AppState.users = JSON.parse(localStorage.getItem('whatif_users')) || [];
    
    // Load questions
    AppState.questions = JSON.parse(localStorage.getItem('whatif_questions')) || getSampleQuestions();
    
    // Load current user
    AppState.currentUser = JSON.parse(localStorage.getItem('whatif_currentUser')) || null;
    
    // Load liked questions
    const liked = JSON.parse(localStorage.getItem('whatif_likedQuestions')) || [];
    AppState.likedQuestions = new Set(liked);
    
    // Update UI based on login status
    updateLoginUI();
}

// Get sample questions if none exist
function getSampleQuestions() {
    const now = Date.now();
    return [
        {
            id: now - 500000,
            title: "What if humans could photosynthesize like plants?",
            details: "How would society change if we could get our energy from sunlight? Would we still need to eat? Would restaurants become obsolete?",
            category: "science",
            author: "Alex Johnson",
            authorId: "sample1",
            likes: 42,
            comments: 18,
            date: "2023-10-15",
            isSample: true
        },
        {
            id: now - 400000,
            title: "What if the Roman Empire never fell?",
            details: "How would world history be different if Rome continued to dominate Europe and the Mediterranean? Would we have advanced faster technologically?",
            category: "history",
            author: "Maria Rodriguez",
            authorId: "sample2",
            likes: 37,
            comments: 24,
            date: "2023-10-12",
            isSample: true
        },
        {
            id: now - 300000,
            title: "What if we could instantly transfer knowledge to our brains?",
            details: "Imagine downloading skills like in The Matrix. How would education and work change? Would universities still exist?",
            category: "technology",
            author: "Sam Chen",
            authorId: "sample3",
            likes: 55,
            comments: 31,
            date: "2023-10-10",
            isSample: true
        },
        {
            id: now - 200000,
            title: "What if animals could talk to humans?",
            details: "How would our relationship with animals change if we could communicate with them? Would we still eat meat?",
            category: "general",
            author: "Jamie Wilson",
            authorId: "sample4",
            likes: 28,
            comments: 15,
            date: "2023-10-08",
            isSample: true
        },
        {
            id: now - 100000,
            title: "What if we discovered life on Mars?",
            details: "How would this discovery change religion, science, and our place in the universe? Would we try to communicate?",
            category: "science",
            author: "Dr. Evan Park",
            authorId: "sample5",
            likes: 63,
            comments: 42,
            date: "2023-10-05",
            isSample: true
        },
        {
            id: now - 60000,
            title: "What if time travel was possible but only to observe, not interact?",
            details: "How would historians use this technology? What ethical questions would arise about privacy?",
            category: "philosophy",
            author: "Taylor Smith",
            authorId: "sample6",
            likes: 49,
            comments: 29,
            date: "2023-10-03",
            isSample: true
        }
    ];
}

// Update UI based on login status
function updateLoginUI() {
    const authButtons = document.getElementById('auth-buttons');
    const userProfile = document.getElementById('user-profile');
    const userAvatar = document.getElementById('user-avatar');
    const userName = document.getElementById('user-name');
    const askQuestionBtn = document.getElementById('ask-question-btn');
    
    if (AppState.currentUser) {
        // User is logged in
        authButtons.style.display = 'none';
        userProfile.style.display = 'flex';
        userAvatar.textContent = AppState.currentUser.name.charAt(0).toUpperCase();
        userName.textContent = AppState.currentUser.name.split(' ')[0]; // Show only first name
        askQuestionBtn.disabled = false;
        askQuestionBtn.innerHTML = '<i class="fas fa-plus"></i> Ask a Question';
    } else {
        // User is not logged in
        authButtons.style.display = 'flex';
        userProfile.style.display = 'none';
        askQuestionBtn.disabled = false;
        askQuestionBtn.innerHTML = '<i class="fas fa-plus"></i> Ask a Question';
    }
}

// Load questions to the UI
function loadQuestions(filter = 'all') {
    const questionsContainer = document.getElementById('questions-container');
    let questionsToShow = [...AppState.questions];
    
    // Apply filter if needed
    if (filter !== 'all') {
        if (filter === 'popular') {
            // Sort by likes for popular
            questionsToShow.sort((a, b) => b.likes - a.likes);
        } else {
            // Filter by category
            questionsToShow = questionsToShow.filter(q => q.category === filter);
        }
    }
    
    // Clear container
    questionsContainer.innerHTML = '';
    
    // Check if there are questions to show
    if (questionsToShow.length === 0) {
        questionsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-question-circle"></i>
                <h3>No questions found</h3>
                <p>${filter === 'all' ? 'Be the first to ask a "What If?" question!' : 'No questions in this category yet.'}</p>
                <button class="btn btn-accent" id="empty-state-ask-btn" style="margin-top: 20px;">
                    <i class="fas fa-plus"></i> Ask a Question
                </button>
            </div>
        `;
        
        // Add event listener to the button in empty state
        document.getElementById('empty-state-ask-btn')?.addEventListener('click', function() {
            if (AppState.currentUser) {
                document.getElementById('ask-question-modal').style.display = 'flex';
            } else {
                showToast('Please log in to ask a question', 'error');
                document.getElementById('login-modal').style.display = 'flex';
            }
        });
        
        return;
    }
    
    // Add questions to the container
    questionsToShow.forEach(question => {
        const isLiked = AppState.likedQuestions.has(question.id);
        const questionCard = document.createElement('div');
        questionCard.className = 'question-card';
        questionCard.innerHTML = `
            <div class="question-meta">
                <span class="question-category">${question.category.charAt(0).toUpperCase() + question.category.slice(1)}</span>
                <span class="question-date">${question.date}</span>
            </div>
            <div class="question-content">
                <h3>${question.title}</h3>
                <p>${question.details}</p>
            </div>
            <div class="question-stats">
                <span class="like-btn ${isLiked ? 'liked' : ''}" data-id="${question.id}">
                    <i class="fas fa-heart"></i> 
                    <span class="like-count">${question.likes}</span> Likes
                </span>
                <span><i class="fas fa-comment"></i> ${question.comments} Comments</span>
                <span><i class="fas fa-user"></i> ${question.author}</span>
            </div>
        `;
        questionsContainer.appendChild(questionCard);
    });
    
    // Add like button functionality
    document.querySelectorAll('.like-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const questionId = parseInt(this.getAttribute('data-id'));
            likeQuestion(questionId);
        });
    });
}

// Like a question
function likeQuestion(questionId) {
    // Check if user is logged in
    if (!AppState.currentUser) {
        showToast('Please log in to like questions', 'error');
        document.getElementById('login-modal').style.display = 'flex';
        return;
    }
    
    const questionIndex = AppState.questions.findIndex(q => q.id === questionId);
    
    if (questionIndex === -1) return;
    
    // Check if already liked
    if (AppState.likedQuestions.has(questionId)) {
        // Unlike
        AppState.questions[questionIndex].likes -= 1;
        AppState.likedQuestions.delete(questionId);
        showToast('Question unliked', 'info');
    } else {
        // Like
        AppState.questions[questionIndex].likes += 1;
        AppState.likedQuestions.add(questionId);
        showToast('Question liked!', 'success');
    }
    
    // Update localStorage
    localStorage.setItem('whatif_questions', JSON.stringify(AppState.questions));
    localStorage.setItem('whatif_likedQuestions', JSON.stringify([...AppState.likedQuestions]));
    
    // Update the UI
    const likeBtn = document.querySelector(`.like-btn[data-id="${questionId}"]`);
    const likeCount = likeBtn.querySelector('.like-count');
    
    likeBtn.classList.toggle('liked');
    likeCount.textContent = AppState.questions[questionIndex].likes;
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    
    // Set type class
    toast.className = 'toast';
    toast.classList.add(type);
    
    toast.textContent = message;
    toast.style.display = 'block';
    
    // Hide after 3 seconds
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

// Setup all event listeners
function setupEventListeners() {
    // Login button
    document.getElementById('login-btn').addEventListener('click', function() {
        document.getElementById('login-modal').style.display = 'flex';
        document.getElementById('login-email').focus();
    });
    
    // Signup button
    document.getElementById('signup-btn').addEventListener('click', function() {
        document.getElementById('signup-modal').style.display = 'flex';
        document.getElementById('signup-name').focus();
    });
    
    // Ask question button
    document.getElementById('ask-question-btn').addEventListener('click', function() {
        if (AppState.currentUser) {
            document.getElementById('ask-question-modal').style.display = 'flex';
            document.getElementById('question-title').focus();
        } else {
            showToast('Please log in to ask a question', 'error');
            document.getElementById('login-modal').style.display = 'flex';
        }
    });
    
    // Close modals
    document.getElementById('close-login').addEventListener('click', function() {
        document.getElementById('login-modal').style.display = 'none';
        document.getElementById('login-form').reset();
        clearErrors('login');
    });
    
    document.getElementById('close-signup').addEventListener('click', function() {
        document.getElementById('signup-modal').style.display = 'none';
        document.getElementById('signup-form').reset();
        clearErrors('signup');
    });
    
    document.getElementById('close-question').addEventListener('click', function() {
        document.getElementById('ask-question-modal').style.display = 'none';
        document.getElementById('ask-question-form').reset();
        clearErrors('question');
    });
    
    // Switch between login and signup
    document.getElementById('switch-to-signup').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('login-modal').style.display = 'none';
        document.getElementById('signup-modal').style.display = 'flex';
        clearErrors('login');
    });
    
    document.getElementById('switch-to-login').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('signup-modal').style.display = 'none';
        document.getElementById('login-modal').style.display = 'flex';
        clearErrors('signup');
    });
    
    // Logout button
    document.getElementById('logout-btn').addEventListener('click', function() {
        AppState.currentUser = null;
        localStorage.removeItem('whatif_currentUser');
        updateLoginUI();
        showToast('You have been logged out', 'info');
    });
    
    // Login form submission
    document.getElementById('login-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        
        // Validate inputs
        let hasError = false;
        
        if (!validateEmail(email)) {
            showError('login-email-error', 'Please enter a valid email address');
            hasError = true;
        }
        
        if (password.length < 6) {
            showError('login-password-error', 'Password must be at least 6 characters');
            hasError = true;
        }
        
        if (hasError) return;
        
        // Check if user exists
        const user = AppState.users.find(u => u.email === email && u.password === password);
        
        if (user) {
            // Login successful
            AppState.currentUser = user;
            localStorage.setItem('whatif_currentUser', JSON.stringify(user));
            document.getElementById('login-modal').style.display = 'none';
            document.getElementById('login-form').reset();
            clearErrors('login');
            updateLoginUI();
            showToast(`Welcome back, ${user.name}!`, 'success');
        } else {
            // Login failed
            showError('login-password-error', 'Invalid email or password');
        }
    });
    
    // Signup form submission
    document.getElementById('signup-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('signup-name').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;
        
        // Validate inputs
        let hasError = false;
        
        if (name.length < 2) {
            showError('signup-name-error', 'Name must be at least 2 characters');
            hasError = true;
        }
        
        if (!validateEmail(email)) {
            showError('signup-email-error', 'Please enter a valid email address');
            hasError = true;
        }
        
        if (password.length < 6) {
            showError('signup-password-error', 'Password must be at least 6 characters');
            hasError = true;
        }
        
        if (password !== confirmPassword) {
            showError('signup-confirm-password-error', 'Passwords do not match');
            hasError = true;
        }
        
        if (hasError) return;
        
        // Check if user already exists
        const userExists = AppState.users.some(u => u.email === email);
        
        if (userExists) {
            showError('signup-email-error', 'An account with this email already exists');
            return;
        }
        
        // Create new user
        const newUser = {
            id: Date.now(),
            name: name,
            email: email,
            password: password,
            joinDate: new Date().toISOString().split('T')[0]
        };
        
        // Save user
        AppState.users.push(newUser);
        localStorage.setItem('whatif_users', JSON.stringify(AppState.users));
        
        // Log the user in
        AppState.currentUser = newUser;
        localStorage.setItem('whatif_currentUser', JSON.stringify(newUser));
        
        // Close modal and update UI
        document.getElementById('signup-modal').style.display = 'none';
        document.getElementById('signup-form').reset();
        clearErrors('signup');
        updateLoginUI();
        showToast(`Welcome to What If?, ${name}!`, 'success');
    });
    
    // Ask question form submission
    document.getElementById('ask-question-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const title = document.getElementById('question-title').value.trim();
        const details = document.getElementById('question-details').value.trim();
        const category = document.getElementById('question-category').value;
        
        // Validate title
        if (title.length < 10) {
            showError('question-title-error', 'Title must be at least 10 characters');
            return;
        }
        
        // Create new question
        const newQuestion = {
            id: Date.now(),
            title: title,
            details: details || "No additional details provided.",
            category: category,
            author: AppState.currentUser.name,
            authorId: AppState.currentUser.id,
            likes: 0,
            comments: 0,
            date: new Date().toISOString().split('T')[0],
            isSample: false
        };
        
        // Add question to list
        AppState.questions.unshift(newQuestion);
        localStorage.setItem('whatif_questions', JSON.stringify(AppState.questions));
        
        // Close modal and reload questions
        document.getElementById('ask-question-modal').style.display = 'none';
        document.getElementById('ask-question-form').reset();
        clearErrors('question');
        loadQuestions();
        
        showToast('Your question has been posted!', 'success');
    });
    
    // Filter buttons
    document.querySelectorAll('.filter-buttons button').forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            document.querySelectorAll('.filter-buttons button').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Load questions with filter
            const filter = this.getAttribute('data-filter');
            loadQuestions(filter);
            
            // Scroll to questions if on mobile
            if (window.innerWidth < 768) {
                document.getElementById('questions').scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    
    // Footer category links
    document.querySelectorAll('.footer-links a[data-filter]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const filter = this.getAttribute('data-filter');
            
            // Update active filter button
            document.querySelectorAll('.filter-buttons button').forEach(btn => {
                btn.classList.remove('active');
                if (btn.getAttribute('data-filter') === filter) {
                    btn.classList.add('active');
                }
            });
            
            // Load questions with filter
            loadQuestions(filter);
            
            // Scroll to questions section
            document.getElementById('questions').scrollIntoView({ behavior: 'smooth' });
        });
    });
    
    // Search functionality
    document.getElementById('search-btn').addEventListener('click', performSearch);
    document.getElementById('search-questions').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // Social media links
    document.querySelectorAll('#social-twitter, #social-facebook, #social-instagram, #social-discord').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const platform = this.id.replace('social-', '');
            showToast(`${platform.charAt(0).toUpperCase() + platform.slice(1)} link would open here in a real app`, 'info');
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (e.target === modal) {
                modal.style.display = 'none';
                document.getElementById('login-form').reset();
                document.getElementById('signup-form').reset();
                document.getElementById('ask-question-form').reset();
                clearErrors('all');
            }
        });
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            if (this.getAttribute('href') === '#') return;
            
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#home') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });
    
    // Add active state to nav links on scroll
    window.addEventListener('scroll', function() {
        const sections = document.querySelectorAll('section[id]');
        const scrollY = window.pageYOffset;
        
        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector(`nav a[href="#${sectionId}"]`);
            
            if (navLink && scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLink.style.color = 'var(--primary)';
                navLink.style.fontWeight = '700';
            } else if (navLink) {
                navLink.style.color = '';
                navLink.style.fontWeight = '';
            }
        });
    });
}

// Perform search
function performSearch() {
    const searchTerm = document.getElementById('search-questions').value.toLowerCase().trim();
    
    if (searchTerm === '') {
        loadQuestions();
        return;
    }
    
    const filteredQuestions = AppState.questions.filter(q => 
        q.title.toLowerCase().includes(searchTerm) || 
        q.details.toLowerCase().includes(searchTerm) ||
        q.category.toLowerCase().includes(searchTerm) ||
        q.author.toLowerCase().includes(searchTerm)
    );
    
    if (filteredQuestions.length === 0) {
        document.getElementById('questions-container').innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>No questions found</h3>
                <p>No questions match your search for "${searchTerm}"</p>
                <button class="btn btn-outline" id="clear-search-btn" style="margin-top: 20px;">
                    Clear Search
                </button>
            </div>
        `;
        
        document.getElementById('clear-search-btn').addEventListener('click', function() {
            document.getElementById('search-questions').value = '';
            loadQuestions();
        });
    } else {
        // Temporarily replace questions with filtered results
        const originalQuestions = [...AppState.questions];
        AppState.questions = filteredQuestions;
        loadQuestions();
        // Restore original questions
        AppState.questions = originalQuestions;
    }
}

// Helper functions
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function showError(elementId, message) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.style.display = 'block';
}

function clearErrors(formType) {
    if (formType === 'login' || formType === 'all') {
        document.getElementById('login-email-error').style.display = 'none';
        document.getElementById('login-password-error').style.display = 'none';
    }
    
    if (formType === 'signup' || formType === 'all') {
        document.getElementById('signup-name-error').style.display = 'none';
        document.getElementById('signup-email-error').style.display = 'none';
        document.getElementById('signup-password-error').style.display = 'none';
        document.getElementById('signup-confirm-password-error').style.display = 'none';
    }
    
    if (formType === 'question' || formType === 'all') {
        document.getElementById('question-title-error').style.display = 'none';
    }
}
// script.js - Complete File

// Application State
const AppState = {
    currentUser: null,
    questions: [],
    users: [],
    likedQuestions: new Set()
};

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initApp();
    
    // Set current year in footer
    document.getElementById('current-year').textContent = new Date().getFullYear();
});

// Initialize application
function initApp() {
    // Load data from localStorage
    loadDataFromStorage();
    
    // Setup event listeners
    setupEventListeners();
    
    // Load questions
    loadQuestions();
    
    // Show welcome message if first visit
    if (!localStorage.getItem('whatif_visited')) {
        setTimeout(() => {
            showToast('Welcome to What If? Explore endless possibilities!', 'success');
            localStorage.setItem('whatif_visited', 'true');
        }, 1000);
    }
}

// Load data from localStorage
function loadDataFromStorage() {
    // Load users
    AppState.users = JSON.parse(localStorage.getItem('whatif_users')) || [];
    
    // Load questions
    AppState.questions = JSON.parse(localStorage.getItem('whatif_questions')) || getSampleQuestions();
    
    // Load current user
    AppState.currentUser = JSON.parse(localStorage.getItem('whatif_currentUser')) || null;
    
    // Load liked questions
    const liked = JSON.parse(localStorage.getItem('whatif_likedQuestions')) || [];
    AppState.likedQuestions = new Set(liked);
    
    // Update UI based on login status
    updateLoginUI();
}

// Get sample questions if none exist
function getSampleQuestions() {
    const now = Date.now();
    return [
        {
            id: now - 500000,
            title: "What if humans could photosynthesize like plants?",
            details: "How would society change if we could get our energy from sunlight? Would we still need to eat? Would restaurants become obsolete?",
            category: "science",
            author: "Alex Johnson",
            authorId: "sample1",
            likes: 42,
            comments: 18,
            date: "2023-10-15",
            isSample: true
        },
        {
            id: now - 400000,
            title: "What if the Roman Empire never fell?",
            details: "How would world history be different if Rome continued to dominate Europe and the Mediterranean? Would we have advanced faster technologically?",
            category: "history",
            author: "Maria Rodriguez",
            authorId: "sample2",
            likes: 37,
            comments: 24,
            date: "2023-10-12",
            isSample: true
        },
        {
            id: now - 300000,
            title: "What if we could instantly transfer knowledge to our brains?",
            details: "Imagine downloading skills like in The Matrix. How would education and work change? Would universities still exist?",
            category: "technology",
            author: "Sam Chen",
            authorId: "sample3",
            likes: 55,
            comments: 31,
            date: "2023-10-10",
            isSample: true
        },
        {
            id: now - 200000,
            title: "What if animals could talk to humans?",
            details: "How would our relationship with animals change if we could communicate with them? Would we still eat meat?",
            category: "general",
            author: "Jamie Wilson",
            authorId: "sample4",
            likes: 28,
            comments: 15,
            date: "2023-10-08",
            isSample: true
        },
        {
            id: now - 100000,
            title: "What if we discovered life on Mars?",
            details: "How would this discovery change religion, science, and our place in the universe? Would we try to communicate?",
            category: "science",
            author: "Dr. Evan Park",
            authorId: "sample5",
            likes: 63,
            comments: 42,
            date: "2023-10-05",
            isSample: true
        }
    ];
}

// Update UI based on login status
function updateLoginUI() {
    const authButtons = document.getElementById('auth-buttons');
    const userProfile = document.getElementById('user-profile');
    const userAvatar = document.getElementById('user-avatar');
    const userName = document.getElementById('user-name');
    const askQuestionBtn = document.getElementById('ask-question-btn');
    
    if (AppState.currentUser) {
        // User is logged in
        authButtons.style.display = 'none';
        userProfile.style.display = 'flex';
        userAvatar.textContent = AppState.currentUser.name.charAt(0).toUpperCase();
        userName.textContent = AppState.currentUser.name.split(' ')[0];
        askQuestionBtn.disabled = false;
        askQuestionBtn.innerHTML = '<i class="fas fa-plus"></i> Ask a Question';
    } else {
        // User is not logged in
        authButtons.style.display = 'flex';
        userProfile.style.display = 'none';
        askQuestionBtn.disabled = false;
        askQuestionBtn.innerHTML = '<i class="fas fa-plus"></i> Ask a Question';
    }
}

// Load questions to the UI
function loadQuestions(filter = 'all') {
    const questionsContainer = document.getElementById('questions-container');
    let questionsToShow = [...AppState.questions];
    
    // Apply filter if needed
    if (filter !== 'all') {
        if (filter === 'popular') {
            // Sort by likes for popular
            questionsToShow.sort((a, b) => b.likes - a.likes);
        } else {
            // Filter by category
            questionsToShow = questionsToShow.filter(q => q.category === filter);
        }
    }
    
    // Clear container
    questionsContainer.innerHTML = '';
    
    // Check if there are questions to show
    if (questionsToShow.length === 0) {
        questionsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-question-circle"></i>
                <h3>No questions found</h3>
                <p>${filter === 'all' ? 'Be the first to ask a "What If?" question!' : 'No questions in this category yet.'}</p>
                <button class="btn btn-accent" id="empty-state-ask-btn" style="margin-top: 20px;">
                    <i class="fas fa-plus"></i> Ask a Question
                </button>
            </div>
        `;
        
        // Add event listener to the button in empty state
        document.getElementById('empty-state-ask-btn')?.addEventListener('click', function() {
            if (AppState.currentUser) {
                document.getElementById('ask-question-modal').style.display = 'flex';
            } else {
                showToast('Please log in to ask a question', 'error');
                document.getElementById('login-modal').style.display = 'flex';
            }
        });
        
        return;
    }
    
    // Add questions to the container
    questionsToShow.forEach(question => {
        const isLiked = AppState.likedQuestions.has(question.id);
        const questionCard = document.createElement('div');
        questionCard.className = 'question-card';
        questionCard.innerHTML = `
            <div class="question-meta">
                <span class="question-category">${question.category.charAt(0).toUpperCase() + question.category.slice(1)}</span>
                <span class="question-date">${question.date}</span>
            </div>
            <div class="question-content">
                <h3>${question.title}</h3>
                <p>${question.details}</p>
            </div>
            <div class="question-stats">
                <span class="like-btn ${isLiked ? 'liked' : ''}" data-id="${question.id}">
                    <i class="fas fa-heart"></i> 
                   