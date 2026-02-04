document.addEventListener('DOMContentLoaded', () => {
    // Navigation Toggle
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = navToggle.querySelector('i');
        if (navLinks.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    // Close mobile menu when clicking a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            const icon = navToggle.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        });
    });

    // Navbar Scroll Effect
    // Navbar Scroll Effect - Removed for static clean look
    // The CSS handles the fixed position and backdrop filter.

    // Initialize Lenis (Smooth Scrolling)
    if (typeof Lenis !== 'undefined') {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);
    } else {
        console.warn('Lenis not loaded. Smooth scrolling disabled.');
    }

    // GSAP Animations
    gsap.registerPlugin(ScrollTrigger);

    // Hero Animations
    const tl = gsap.timeline();

    tl.from('.hero-title', {
        y: -50,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        delay: 0.2
    })
        .from('.hero-subtitle', {
            y: -30,
            opacity: 0,
            duration: 1,
            ease: 'power3.out'
        }, '-=0.6')
        .from('.hero-btns', {
            y: -30,
            opacity: 0,
            duration: 1,
            ease: 'power3.out'
        }, '-=0.6');

    // Hero Parallax
    gsap.to('.hero-bg', {
        scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: true
        },
        yPercent: 20,
        scale: 1.1,
        ease: 'none'
    });

    // Scroll Reveal Animations
    const animatedElements = document.querySelectorAll('.service-card, .about-text, .about-image, .section-header');

    animatedElements.forEach(el => {
        gsap.fromTo(el,
            { y: 50, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: el,
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                }
            }
        );
    });

    // PDF Modal Logic
    const modal = document.getElementById('pdfModal');
    const pdfCards = document.querySelectorAll('.pdf-card');
    const closeBtn = document.querySelector('.close-modal');
    const iframe = modal ? modal.querySelector('iframe') : null;

    console.log('Modal:', modal);
    console.log('PDF Cards found:', pdfCards.length);
    console.log('Iframe:', iframe);

    if (modal && iframe) {
        // Open Modal
        pdfCards.forEach(card => {
            card.addEventListener('click', function (e) {
                console.log('Card clicked:', this);
                e.preventDefault(); // Prevent default anchor behavior if any
                const pdfUrl = this.getAttribute('data-pdf');
                console.log('PDF URL:', pdfUrl);

                if (pdfUrl) {
                    iframe.src = pdfUrl;
                    modal.classList.add('show');
                    document.body.style.overflow = 'hidden'; // Prevent scrolling
                } else {
                    console.error('No data-pdf attribute found');
                }
            });
        });

        // Close Modal Function
        function closeModal() {
            console.log('Closing modal');
            modal.classList.remove('show');
            document.body.style.overflow = ''; // Restore scrolling
        }

        if (closeBtn) {
            closeBtn.onclick = closeModal;
        }

        window.onclick = function (event) {
            if (event.target == modal) {
                closeModal();
            }
        }
    } else {
        console.error('Modal or Iframe missing');
    }

    // Image Lightbox Logic
    const imageModal = document.getElementById('imageModal');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightboxImg = document.getElementById('lightboxImg');
    const closeLightbox = document.querySelector('.close-lightbox');

    if (imageModal && lightboxImg) {
        galleryItems.forEach(item => {
            item.addEventListener('click', function () {
                const imgSrc = this.getAttribute('data-image');
                if (imgSrc) {
                    lightboxImg.src = imgSrc;
                    imageModal.classList.add('show');
                    document.body.style.overflow = 'hidden';
                }
            });
        });

        function closeImageModal() {
            imageModal.classList.remove('show');
            document.body.style.overflow = '';
            setTimeout(() => {
                lightboxImg.src = '';
            }, 400);
        }

        if (closeLightbox) {
            closeLightbox.onclick = closeImageModal;
        }

        imageModal.addEventListener('click', function (e) {
            if (e.target === imageModal || e.target.classList.contains('lightbox-content')) {
                closeImageModal();
            }
        });
    }

    // Global Click Logger (Debug)
    window.addEventListener('click', (e) => {
        console.log('Global Click:', e.target);
        console.log('Path:', e.composedPath());
    });
});
