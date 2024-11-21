class ThemeManager {
    constructor() {
        this.theme = localStorage.getItem('theme') || 'light';
        this.toggleBtn = document.getElementById('theme-toggle');
        this.toggleIcon = this.toggleBtn.querySelector('i');
        
        this.setupTheme();
        this.setupEventListeners();
    }

    setupTheme() {
        document.body.setAttribute('data-theme', this.theme);
        this.updateToggleIcon();
    }

    updateToggleIcon() {
        if (this.theme === 'dark') {
            this.toggleIcon.classList.remove('fa-moon');
            this.toggleIcon.classList.add('fa-sun');
        } else {
            this.toggleIcon.classList.remove('fa-sun');
            this.toggleIcon.classList.add('fa-moon');
        }
    }

    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', this.theme);
        this.setupTheme();
    }

    setupEventListeners() {
        this.toggleBtn.addEventListener('click', () => this.toggleTheme());
    }
}

const themeManager = new ThemeManager(); 