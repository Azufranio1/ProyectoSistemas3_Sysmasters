document.addEventListener('DOMContentLoaded', function() {
    
    const animateElements = () => {
        const heroTitle = document.querySelector('.hero-title');
        const heroText = document.querySelector('.hero-text');
        const heroBtn = document.querySelector('.hero .btn');
        
        if(heroTitle) heroTitle.style.animation = 'fadeInUp 1s forwards';
        if(heroText) setTimeout(() => heroText.style.animation = 'fadeInUp 1s forwards', 300);
        if(heroBtn) setTimeout(() => heroBtn.style.animation = 'fadeInUp 1s forwards', 600);
    };
    
    const createObserver = (elements, threshold = 0.1, delay = 200) => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, index * delay);
                }
            });
        }, { threshold });
        
        elements.forEach(el => observer.observe(el));
    };
    
    const featureBoxes = document.querySelectorAll('.feature-box');
    const ctaElements = document.querySelectorAll('.cta-title, .cta-text, .cta-section .btn');
    
    if(featureBoxes.length) createObserver(featureBoxes);
    if(ctaElements.length) createObserver(ctaElements, 0.1, 300);
    
    const heroSection = document.querySelector('.hero');
    if(heroSection) {
        window.addEventListener('scroll', function() {
            const scrollPosition = window.scrollY;
            heroSection.style.backgroundPositionY = `${scrollPosition * 0.5}px`;
        });
    }
});