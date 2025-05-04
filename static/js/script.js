/**
 * Hexyles Global - Main JavaScript File
 * Handles mobile menu, filtering, sliders, form validation, and other interactive elements
 */

document.addEventListener('DOMContentLoaded', function() {
    // ========== Shared DOM Elements ==========
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
    const nav = document.querySelector('nav.main-nav');
    const navLinks = document.querySelectorAll('nav.main-nav ul li a');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    const testimonials = document.querySelectorAll('.testimonial');
    const contactForm = document.getElementById('contactForm');
    const projectsSlider = document.querySelector('.projects-slider');
    const deptCards = document.querySelectorAll('.dept-card');

    // ========== Mobile Menu Functionality ==========
    function initMobileMenu() {
        if (!mobileMenuToggle || !nav) return;

        const menuIcon = mobileMenuToggle.querySelector('.menu-icon');
        const closeIcon = mobileMenuToggle.querySelector('.close-icon');

        function toggleMenu() {
            nav.classList.toggle('active');
            mobileMenuOverlay.classList.toggle('active');
            document.body.classList.toggle('no-scroll');
            
            // Toggle icons
            menuIcon.style.display = nav.classList.contains('active') ? 'none' : 'block';
            closeIcon.style.display = nav.classList.contains('active') ? 'block' : 'none';
        }

        // Toggle menu on button click
        mobileMenuToggle.addEventListener('click', toggleMenu);
        
        // Close menu when clicking overlay
        mobileMenuOverlay.addEventListener('click', toggleMenu);
        
        // Close menu when clicking links
        navLinks.forEach(link => {
            link.addEventListener('click', toggleMenu);
        });
    }

    // ========== Projects Filter ==========
    function initProjectFilter() {
        if (!filterBtns.length || !projectCards.length) return;

        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // Update active button
                filterBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                // Filter projects
                const filter = this.dataset.filter;
                projectCards.forEach(card => {
                    card.style.display = filter === 'all' || card.dataset.category === filter 
                        ? 'block' 
                        : 'none';
                });
            });
        });
    }

    // ========== Testimonial Slider ==========
    function initTestimonialSlider() {
        if (!testimonials.length) return;

        let currentTestimonial = 0;
        const totalTestimonials = testimonials.length;
        
        function showTestimonial(index) {
            testimonials.forEach((t, i) => {
                t.style.opacity = i === index ? '1' : '0';
                t.style.visibility = i === index ? 'visible' : 'hidden';
                t.style.height = i === index ? 'auto' : '0';
            });
        }

        function nextTestimonial() {
            currentTestimonial = (currentTestimonial + 1) % totalTestimonials;
            showTestimonial(currentTestimonial);
        }

        // Show first testimonial
        showTestimonial(0);
        
        // Auto-rotate every 5 seconds
        const sliderInterval = setInterval(nextTestimonial, 5000);
        
        // Pause on hover
        testimonials.forEach(testimonial => {
            testimonial.addEventListener('mouseenter', () => clearInterval(sliderInterval));
            testimonial.addEventListener('mouseleave', () => {
                sliderInterval = setInterval(nextTestimonial, 5000);
            });
        });
    }

    // ========== Contact Form Validation ==========
    function initContactForm() {
        if (!contactForm) return;

        // Form validation
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Reset previous errors
            resetFormErrors();
            
            // Validate form
            const isValid = validateForm();
            
            if (isValid) {
                submitForm();
            }
        });

        function resetFormErrors() {
            const errorElements = contactForm.querySelectorAll('.error-message');
            errorElements.forEach(el => el.remove());
            
            const formGroups = contactForm.querySelectorAll('.form-group');
            formGroups.forEach(group => group.classList.remove('has-error'));
        }

        function validateForm() {
            let isValid = true;
            
            // Name validation
            const nameInput = contactForm.querySelector('#name');
            if (!nameInput.value.trim()) {
                showError(nameInput, 'Please enter your name');
                isValid = false;
            }
            
            // Email validation
            const emailInput = contactForm.querySelector('#email');
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailInput.value.trim()) {
                showError(emailInput, 'Please enter your email');
                isValid = false;
            } else if (!emailRegex.test(emailInput.value.trim())) {
                showError(emailInput, 'Please enter a valid email');
                isValid = false;
            }
            
            // Phone validation (optional)
            const phoneInput = contactForm.querySelector('#phone');
            if (phoneInput.value.trim() && !/^[+]?[0-9]{10,15}$/.test(phoneInput.value.trim())) {
                showError(phoneInput, 'Please enter a valid phone number');
                isValid = false;
            }
            
            // Message validation
            const messageInput = contactForm.querySelector('#message');
            if (!messageInput.value.trim()) {
                showError(messageInput, 'Please enter your message');
                isValid = false;
            } else if (messageInput.value.trim().length < 10) {
                showError(messageInput, 'Message should be at least 10 characters');
                isValid = false;
            }
            
            return isValid;
        }

        function showError(input, message) {
            const formGroup = input.closest('.form-group');
            formGroup.classList.add('has-error');
            
            const errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            errorElement.textContent = message;
            formGroup.appendChild(errorElement);
        }

        function submitForm() {
            const formData = {
                name: contactForm.name.value.trim(),
                email: contactForm.email.value.trim(),
                phone: contactForm.phone.value.trim(),
                subject: contactForm.subject.value,
                message: contactForm.message.value.trim()
            };

            // In a real application, you would use fetch() to submit to a server
            console.log('Form submitted:', formData);
            
            // Show success message
            showFormAlert('success', 'Thank you for your message! We will contact you soon.');
            
            // Reset form
            contactForm.reset();
        }

        function showFormAlert(type, message) {
            // Remove existing alerts
            const existingAlert = contactForm.querySelector('.form-alert');
            if (existingAlert) existingAlert.remove();
            
            // Create new alert
            const alertElement = document.createElement('div');
            alertElement.className = `form-alert ${type}`;
            alertElement.textContent = message;
            
            // Insert at the top of the form
            contactForm.insertBefore(alertElement, contactForm.firstChild);
            
            // Remove after 5 seconds
            setTimeout(() => {
                alertElement.remove();
            }, 5000);
        }
    }

    // ========== Department Cards Interaction ==========
    function initDepartmentCards() {
        if (!deptCards.length) return;

        deptCards.forEach(card => {
            card.addEventListener('click', function() {
                const dept = this.dataset.dept;
                
                // Update contact form subject based on department
                const subjectSelect = contactForm?.querySelector('#subject');
                if (subjectSelect) {
                    subjectSelect.value = dept === 'sales' ? 'quote' : 
                                        dept === 'projects' ? 'service' : 
                                        dept === 'hr' ? 'careers' : 'general';
                }
                
                // Scroll to form
                if (contactForm) {
                    contactForm.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }

    // ========== Smooth Scrolling ==========
    function initSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#' || targetId === '#!') return;
                
                e.preventDefault();
                const target = document.querySelector(targetId);
                if (target) {
                    const headerHeight = document.querySelector('header')?.offsetHeight || 80;
                    window.scrollTo({
                        top: target.offsetTop - headerHeight,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // ========== Active Link Highlighting ==========
    function initActiveLinks() {
        if (!navLinks.length) return;

        const currentPage = location.pathname.split('/').pop() || 'index.html';
        navLinks.forEach(link => {
            const linkPage = link.getAttribute('href');
            if (currentPage === linkPage) {
                link.classList.add('active');
            }
        });
    }

    // ========== Initialize All Functions ==========
    function initAll() {
        initMobileMenu();
        initProjectFilter();
        initTestimonialSlider();
        initContactForm();
        initDepartmentCards();
        initSmoothScrolling();
        initActiveLinks();
    }

    // Start everything
    initAll();
});