document.addEventListener('DOMContentLoaded', function() {
    // Menu burger
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('nav');
    const navLinks = document.querySelectorAll('nav ul li');
    const themeToggle = document.getElementById('theme-toggle');
    
    // Gestion du thème
    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // Mettre à jour l'icône
        const icon = themeToggle.querySelector('i');
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    // Vérifier le thème sauvegardé ou la préférence système
    const savedTheme = localStorage.getItem('theme') || 
                      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(savedTheme);
    
    // Basculer le thème
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        setTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });
    
    // Menu burger
    burger.addEventListener('click', () => {
        nav.classList.toggle('active');
        burger.classList.toggle('active');
        document.body.classList.toggle('no-scroll');
    });
    
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('active');
            burger.classList.remove('active');
            document.body.classList.remove('no-scroll');
        });
    });
    
    // Smooth scrolling amélioré avec offset pour le header fixe
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Fermer le menu mobile si ouvert
                if (nav.classList.contains('active')) {
                    nav.classList.remove('active');
                    burger.classList.remove('active');
                    document.body.classList.remove('no-scroll');
                }
            }
        });
    });
    
    // Filtrage galerie
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Active le bouton cliqué
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            const filterValue = button.getAttribute('data-filter');
            
            galleryItems.forEach(item => {
                if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';
                    }, 50);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
    
    // Système de réservation amélioré
    const bookingForm = document.getElementById('booking-form');
    const datetimeInput = document.getElementById('datetime');
    
    // Initialiser le datetime picker avec les horaires
    function initBookingSystem() {
        const now = new Date();
        const minDate = new Date(now.setDate(now.getDate() + 1)).toISOString().slice(0, 16);
        datetimeInput.min = minDate;
        
        // Désactiver les heures hors créneau selon les jours
        datetimeInput.addEventListener('input', function() {
            const selectedDate = new Date(this.value);
            if (isNaN(selectedDate.getTime())) return;
            
            const hours = selectedDate.getHours();
            const minutes = selectedDate.getMinutes();
            const day = selectedDate.getDay(); // 0=dimanche, 1=lundi, etc.
            const totalHours = hours + (minutes / 60);
            
            // Lundi (10h-17h)
            if (day === 1) {
                if (totalHours < 10 || totalHours >= 17) {
                    showAlert("Nos horaires du lundi sont de 10h à 17h");
                    this.value = '';
                    return;
                }
            } 
            // Autres jours (9h30-20h)
            else {
                if (totalHours < 9.5 || totalHours >= 20) {
                    showAlert("Nos horaires sont de 9h30 à 20h");
                    this.value = '';
                    return;
                }
            }
            
            // Désactiver les pauses déjeuner (12h30-14h)
            if (totalHours >= 12.5 && totalHours < 14) {
                showAlert("Pause déjeuner entre 12h30 et 14h");
                this.value = '';
            }
        });
    }
    
    // Fonction pour afficher des alertes stylisées
    function showAlert(message) {
        // Supprimer les alertes existantes
        const existingAlerts = document.querySelectorAll('.custom-alert');
        existingAlerts.forEach(alert => alert.remove());
        
        const alertDiv = document.createElement('div');
        alertDiv.className = 'custom-alert';
        alertDiv.textContent = message;
        
        document.body.appendChild(alertDiv);
        
        setTimeout(() => {
            alertDiv.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            alertDiv.classList.remove('show');
            setTimeout(() => {
                alertDiv.remove();
            }, 300);
        }, 3000);
    }
    
    if (bookingForm) {
        initBookingSystem();
        
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Récupérer les valeurs du formulaire
            const formData = {
                name: this.querySelector('#name').value.trim(),
                email: this.querySelector('#email').value.trim(),
                phone: this.querySelector('#phone').value.trim(),
                service: this.querySelector('#service').value,
                datetime: this.querySelector('#datetime').value,
                message: this.querySelector('#message').value.trim()
            };
            
            // Validation améliorée
            if (!formData.name || !formData.phone || !formData.service || !formData.datetime) {
                showAlert('Veuillez remplir tous les champs obligatoires');
                return;
            }
            
            if (!/^[0-9]{10}$/.test(formData.phone)) {
                showAlert('Veuillez entrer un numéro de téléphone valide (10 chiffres)');
                return;
            }
            
            if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                showAlert('Veuillez entrer une adresse email valide');
                return;
            }
            
            // Envoyer les données
            sendBooking(formData);
        });
    }
    
    // Fonction pour envoyer la réservation (simulation)
    function sendBooking(data) {
        // Simulation d'envoi avec timeout
        const submitBtn = bookingForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi en cours...';
        
        // Simuler une requête AJAX
        setTimeout(() => {
            console.log('Données de réservation envoyées:', data);
            showConfirmationModal(data);
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }, 1500);
    }
    
    // Afficher la modal de confirmation améliorée
    function showConfirmationModal(data) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        
        const selectedService = document.querySelector(`#service option[value="${data.service}"]`).textContent;
        const formattedDate = new Date(data.datetime).toLocaleString('fr-FR', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        modal.innerHTML = `
            <div class="modal-content">
                <i class="fas fa-check-circle success-icon"></i>
                <h3>Merci ${data.name} !</h3>
                <p>Votre demande de rendez-vous pour <strong>${selectedService}</strong> a été enregistrée.</p>
                <p><i class="far fa-calendar-alt"></i> Le ${formattedDate}</p>
                <p><i class="fas fa-phone"></i> Nous vous contacterons au <strong>${data.phone}</strong> pour confirmation.</p>
                <button id="close-modal" class="btn">Fermer</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        document.body.classList.add('no-scroll');
        
        // Animation d'apparition
        setTimeout(() => {
            modal.style.opacity = '1';
        }, 10);
        
        // Fermer la modal
        const closeModal = () => {
            modal.style.opacity = '0';
            setTimeout(() => {
                modal.remove();
                document.body.classList.remove('no-scroll');
            }, 300);
        };
        
        modal.querySelector('#close-modal').addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
        
        // Réinitialiser le formulaire
        if (bookingForm) bookingForm.reset();
    }
    
    // Charger les témoignages dynamiquement
    function loadTestimonials() {
        const testimonials = [
            {
                name: "Jean D.",
                rating: 5,
                comment: "Meilleur barber de Neuilly-sur-Marne ! Mon dégradé est toujours parfait.",
                image: "https://randomuser.me/api/portraits/men/32.jpg"
            },
            {
                name: "Marie L.",
                rating: 5,
                comment: "Service exceptionnel et ambiance conviviale. Je recommande !",
                image: "https://randomuser.me/api/portraits/women/44.jpg"
            },
            {
                name: "Thomas P.",
                rating: 4,
                comment: "Rasage à l'ancienne top qualité. Mon barber attitré maintenant.",
                image: "https://randomuser.me/api/portraits/men/67.jpg"
            },
            {
                name: "Alexandre R.",
                rating: 5,
                comment: "Dégradé impeccable à chaque visite. Un vrai professionnel !",
                image: "https://randomuser.me/api/portraits/men/45.jpg"
            }
        ];
        
        const container = document.querySelector('.testimonial-grid');
        if (!container) return;
        
        container.innerHTML = testimonials.map(testimonial => `
            <div class="testimonial-card fade-in">
                <div class="rating">
                    ${'<i class="fas fa-star"></i>'.repeat(testimonial.rating)}
                    ${testimonial.rating < 5 ? '<i class="far fa-star"></i>'.repeat(5 - testimonial.rating) : ''}
                </div>
                <p>${testimonial.comment}</p>
                <div class="client-info">
                    <img src="${testimonial.image}" alt="${testimonial.name}" loading="lazy">
                    <p>${testimonial.name}</p>
                </div>
            </div>
        `).join('');
        
        // Observer les nouveaux éléments pour les animations
        observeElements();
    }
    
    // Intersection Observer pour les animations
    function observeElements() {
        const fadeElements = document.querySelectorAll('.fade-in');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        fadeElements.forEach(element => {
            observer.observe(element);
        });
    }
    
    // Style du header au scroll
    window.addEventListener('scroll', () => {
        const header = document.querySelector('header');
        if (window.scrollY > 50) {
            header.style.background = 'rgba(17, 17, 17, 0.95)';
            header.style.backdropFilter = 'blur(10px)';
            header.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.background = 'var(--secondary-color)';
            header.style.backdropFilter = 'none';
            header.style.boxShadow = 'none';
        }
    });
    
    // Mettre à jour l'année dans le footer
    document.getElementById('current-year').textContent = new Date().getFullYear();
    
    // Gestion de la newsletter
    document.querySelectorAll('.newsletter-form').forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            
            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                showAlert('Veuillez entrer une adresse email valide');
                return;
            }
            
            // Simulation d'envoi
            const btn = this.querySelector('button');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            btn.disabled = true;
            
            setTimeout(() => {
                showAlert('Merci pour votre inscription à notre newsletter !');
                this.reset();
                btn.innerHTML = originalText;
                btn.disabled = false;
            }, 1500);
        });
    });
    
    // Animation du footer lors du scroll
    function animateFooterOnScroll() {
        const footer = document.querySelector('footer');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    footer.classList.add('animated');
                }
            });
        }, { threshold: 0.1 });
        
        observer.observe(footer);
    }
    
    // Charger les témoignages et initialiser les animations
    loadTestimonials();
    observeElements();
    animateFooterOnScroll();
});

// Enregistrement du Service Worker pour PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
            console.log('ServiceWorker enregistré avec succès:', registration.scope);
        }).catch(err => {
            console.log("Échec de l'enregistrement du ServiceWorker:", err);
        });
    });
}

// Fonction pour installer la PWA
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    // Empêche le prompt automatique
    e.preventDefault();
    // Stocke l'événement pour le déclencher plus tard
    deferredPrompt = e;
    
    // Affiche un bouton d'installation
    const installButton = document.createElement('button');
    installButton.id = 'install-pwa-btn';
    installButton.className = 'btn';
    installButton.innerHTML = '<i class="fas fa-download"></i> Installer l\'app';
    installButton.style.position = 'fixed';
    installButton.style.bottom = '20px';
    installButton.style.right = '20px';
    installButton.style.zIndex = '9999';
    
    installButton.addEventListener('click', () => {
        // Masque le bouton
        installButton.style.display = 'none';
        // Montre le prompt d'installation
        deferredPrompt.prompt();
        // Attends que l'utilisateur réponde
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('Utilisateur a accepté l\'installation');
            } else {
                console.log('Utilisateur a refusé l\'installation');
            }
            deferredPrompt = null;
        });
    });
    
    document.body.appendChild(installButton);
});