document.addEventListener('DOMContentLoaded', function() {
    // Préremplissage des champs si l'utilisateur est connecté
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        document.getElementById('firstname').value = user.firstname || '';
        document.getElementById('lastname').value = user.lastname || '';
        document.getElementById('email').value = user.email || '';
        document.getElementById('phone').value = user.phone || '';
    }

    // Gestion du menu mobile
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
            mobileMenu.classList.toggle('open');

            const icon = mobileMenuButton.querySelector('i');
            if (mobileMenu.classList.contains('open')) {
                icon.classList.replace('fa-bars', 'fa-times');
            } else {
                icon.classList.replace('fa-times', 'fa-bars');
            }
        });

        // Fermer le menu mobile lorsqu'un lien est cliqué
        const mobileMenuLinks = mobileMenu.querySelectorAll('a');
        mobileMenuLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileMenu.classList.add('hidden');
                mobileMenu.classList.remove('open');
                const icon = mobileMenuButton.querySelector('i');
                if (icon) icon.classList.replace('fa-times', 'fa-bars');
            });
        });

        // Fermer le menu si on clique à l'extérieur
        document.addEventListener('click', function(event) {
            const isClickInside = mobileMenu.contains(event.target) || mobileMenuButton.contains(event.target);
            if (!isClickInside && mobileMenu.classList.contains('open')) {
                mobileMenu.classList.add('hidden');
                mobileMenu.classList.remove('open');
                const icon = mobileMenuButton.querySelector('i');
                if (icon) icon.classList.replace('fa-times', 'fa-bars');
            }
        });
    }

    // Contact Form Handling
    const contactForm = document.getElementById('contact-form');

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Récupérer les valeurs du formulaire
            const formData = {
                firstname: document.getElementById('firstname').value,
                lastname: document.getElementById('lastname').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value
            };

            // Validation basique
            if (!formData.firstname || !formData.lastname || !formData.email || !formData.phone || !formData.subject || !formData.message) {
                showNotification('Veuillez remplir tous les champs du formulaire.', 'error');
                return;
            }

            // Validation de l'email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                showNotification('Veuillez entrer une adresse email valide.', 'error');
                return;
            }

            // Validation du téléphone (format international)
            const phoneRegex = /^\+?[0-9]{8,15}$/;
            if (!phoneRegex.test(formData.phone)) {
                showNotification('Veuillez entrer un numéro de téléphone valide (format international).', 'error');
                return;
            }

            // Afficher le loader
            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerHTML;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi en cours...';
            submitButton.disabled = true;

            // Préparer les paramètres pour EmailJS
            const templateParams = {
                to_email: 'luxbagsavandre@gmail.com',
                from_name: `${formData.firstname} ${formData.lastname}`,
                from_email: formData.email,
                phone: formData.phone,
                subject: formData.subject,
                message: formData.message
            };

            // Envoyer l'email
            emailjs.send('service_gv73c9h', 'template_srcmo2a', templateParams)
                .then(function(response) {
                    showNotification('Votre message a été envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.', 'success');
                    contactForm.reset();

                    // Réinitialiser les champs préremplis si l'utilisateur est connecté
                    if (user) {
                        document.getElementById('firstname').value = user.firstname || '';
                        document.getElementById('lastname').value = user.lastname || '';
                        document.getElementById('email').value = user.email || '';
                        document.getElementById('phone').value = user.phone || '';
                    }
                }, function(error) {
                    let errorMessage = 'Une erreur est survenue lors de l\'envoi du message.';

                    if (error.text) {
                        switch (error.text) {
                            case 'Invalid template ID':
                                errorMessage = 'Erreur de configuration du template. Veuillez contacter l\'administrateur.';
                                break;
                            case 'Invalid service ID':
                                errorMessage = 'Erreur de configuration du service. Veuillez contacter l\'administrateur.';
                                break;
                            case 'Invalid user ID':
                                errorMessage = 'Erreur de configuration de l\'utilisateur. Veuillez contacter l\'administrateur.';
                                break;
                            default:
                                errorMessage = `Erreur: ${error.text}`;
                        }
                    }

                    showNotification(errorMessage, 'error');
                })
                .finally(function() {
                    submitButton.innerHTML = originalButtonText;
                    submitButton.disabled = false;
                });
        });
    }

    // Fonction pour afficher les notifications
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
            type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`;
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    // Map Initialization
    const mapElement = document.getElementById('map');

    if (mapElement) {
        // Coordonnées de la boutique (Atakpamé)
        const boutiqueLocation = [7.5333, 1.1333]; // Coordonnées approximatives d'Atakpamé

        // Initialiser la carte
        const map = L.map('map').setView(boutiqueLocation, 13);

        // Ajouter le fond de carte
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Ajouter un marqueur pour la boutique
        L.marker(boutiqueLocation)
            .addTo(map)
            .bindPopup('Avandre - Boutique Atakpamé')
            .openPopup();
    }
});