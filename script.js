document.addEventListener('DOMContentLoaded', () => {
    // iOS Safari only applies :active styles once it knows something is listening
    // for touch — without this, press feedback (buttons, cards, gallery) never shows.
    document.addEventListener('touchstart', () => { }, true);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

    // Navbar Scroll Effect — the floating pill gets denser/opaque once you've
    // actually scrolled, so it reads as a surface over content rather than empty chrome.
    const navbar = document.querySelector('.navbar');
    const updateNavbarState = () => {
        navbar.classList.toggle('scrolled', window.scrollY > 40);
    };
    updateNavbarState();
    window.addEventListener('scroll', updateNavbarState, { passive: true });

    // Scroll-spy — highlight whichever section is actually in view, not just "Home".
    const sections = document.querySelectorAll('#home, #about, #services, #gallery, #contact');
    const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

    if (sections.length && navAnchors.length) {
        const setActiveLink = (id) => {
            navAnchors.forEach(link => {
                link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
            });
        };

        // A band through the upper-middle of the viewport — a section counts as
        // "current" once it crosses that band, which feels right whether you're
        // scrolling past a short section or sitting inside a tall one.
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) setActiveLink(entry.target.id);
            });
        }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

        sections.forEach(section => sectionObserver.observe(section));
    }

    // Initialize Lenis (Smooth Scrolling) — skip entirely under reduced motion,
    // native scrolling is the gentler equivalent.
    if (!prefersReducedMotion && typeof Lenis !== 'undefined') {
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
    } else if (!prefersReducedMotion) {
        console.warn('Lenis not loaded. Smooth scrolling disabled.');
    }

    // GSAP Animations
    gsap.registerPlugin(ScrollTrigger);

    if (prefersReducedMotion) {
        // Reduced motion: settle straight into the final state, no slide/parallax/overshoot.
        gsap.set('.hero-title, .hero-subtitle, .hero-btns', { y: 0, opacity: 1 });
        gsap.set('.service-card, .about-text, .about-image, .section-header', { y: 0, opacity: 1 });
    } else {
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
    }

    // Anchor a modal's opening/closing animation to the element that triggered it,
    // so it visibly grows from its source instead of just appearing centered.
    function anchorToTrigger(triggerEl, contentEl) {
        const triggerRect = triggerEl.getBoundingClientRect();
        const triggerCenterX = triggerRect.left + triggerRect.width / 2;
        const triggerCenterY = triggerRect.top + triggerRect.height / 2;

        // Read the content box after 'show' has been applied (next frame) so its
        // layout position is final, then express the origin relative to that box.
        requestAnimationFrame(() => {
            const contentRect = contentEl.getBoundingClientRect();
            const originX = triggerCenterX - contentRect.left;
            const originY = triggerCenterY - contentRect.top;
            contentEl.style.transformOrigin = `${originX}px ${originY}px`;
        });
    }

    // PDF Modal Logic
    const modal = document.getElementById('pdfModal');
    const pdfCards = document.querySelectorAll('.pdf-card');
    const closeBtn = document.querySelector('.close-modal');
    const iframe = modal ? modal.querySelector('iframe') : null;
    const modalContent = modal ? modal.querySelector('.modal-content') : null;

    if (modal && iframe) {
        // Open Modal
        pdfCards.forEach(card => {
            card.addEventListener('click', function (e) {
                e.preventDefault(); // Prevent default anchor behavior if any
                const pdfUrl = this.getAttribute('data-pdf');

                if (pdfUrl) {
                    iframe.src = pdfUrl;
                    modal.classList.add('show');
                    document.body.style.overflow = 'hidden'; // Prevent scrolling
                    if (modalContent) anchorToTrigger(this, modalContent);
                }
            });
        });

        // Close Modal Function
        function closeModal() {
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
    }

    // Image Lightbox Logic
    const imageModal = document.getElementById('imageModal');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightboxImg = document.getElementById('lightboxImg');
    const closeLightbox = document.querySelector('.close-lightbox');
    const lightboxContent = imageModal ? imageModal.querySelector('.modal-content') : null;

    if (imageModal && lightboxImg) {
        galleryItems.forEach(item => {
            item.addEventListener('click', function () {
                const imgSrc = this.getAttribute('data-image');
                if (imgSrc) {
                    lightboxImg.src = imgSrc;
                    imageModal.classList.add('show');
                    document.body.style.overflow = 'hidden';
                    if (lightboxContent) anchorToTrigger(this, lightboxContent);
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
});
