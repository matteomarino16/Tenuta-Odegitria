document.addEventListener('DOMContentLoaded', () => {
    // Mobile Nav Toggle
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');
    const navLinks = document.querySelectorAll('.nav-links li');

    burger.addEventListener('click', () => {
        // Toggle Nav
        nav.classList.toggle('nav-active');

        // Animate Links
        navLinks.forEach((link, index) => {
            if (link.style.animation) {
                link.style.animation = '';
            } else {
                link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
            }
        });

        // Burger Animation
        burger.classList.toggle('toggle');
    });

    // Smooth Scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            // Chiudi il menu mobile se aperto
            if (nav.classList.contains('nav-active')) {
                nav.classList.remove('nav-active');
                burger.classList.remove('toggle');
                navLinks.forEach(link => link.style.animation = '');
            }

            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Form submission handling (simulation)
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Grazie per la tua richiesta! Ti contatteremo al più presto.');
            contactForm.reset();
        });
    }

    const setupScrollReveal = () => {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const elements = Array.from(document.querySelectorAll('.section-header, .section-header-top, .content-grid, .apartment-row, .feature-item, .service-split-item, footer'));

        if (prefersReducedMotion || window.innerWidth <= 1024) {
            elements.forEach((el) => {
                el.classList.add('reveal', 'is-visible');
            });
            return;
        }

        elements.forEach((el) => {
            el.classList.add('reveal', 'is-visible');
        });
        return;

        elements.forEach((el, idx) => {
            el.classList.add('reveal');
            if (el.classList.contains('content-grid')) {
                el.classList.add(idx % 2 === 0 ? 'reveal-left' : 'reveal-right');
            } else if (el.classList.contains('apartment-row')) {
                el.classList.add('reveal-scale');
            }
        });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });

        elements.forEach((el) => observer.observe(el));
    };

    const lightbox = (() => {
        const overlay = document.createElement('div');
        overlay.className = 'lightbox-overlay';

        const frame = document.createElement('div');
        frame.className = 'lightbox-frame';

        const img = document.createElement('img');
        img.className = 'lightbox-image';
        img.alt = '';

        const closeBtn = document.createElement('button');
        closeBtn.className = 'lightbox-close';
        closeBtn.type = 'button';
        closeBtn.innerHTML = '&times;';

        const prevBtn = document.createElement('button');
        prevBtn.className = 'lightbox-prev';
        prevBtn.type = 'button';
        prevBtn.innerHTML = '&#8249;';

        const nextBtn = document.createElement('button');
        nextBtn.className = 'lightbox-next';
        nextBtn.type = 'button';
        nextBtn.innerHTML = '&#8250;';

        frame.appendChild(img);
        frame.appendChild(closeBtn);
        frame.appendChild(prevBtn);
        frame.appendChild(nextBtn);
        overlay.appendChild(frame);
        document.body.appendChild(overlay);

        let items = [];
        let index = 0;
        let startX = null;
        let startY = null;
        let lastWheelAt = 0;
        let prevOverflowHtml = '';
        let prevOverflowBody = '';

        const render = () => {
            const item = items[index];
            if (!item) return;
            img.src = item.href;
            img.alt = item.alt || '';
        };

        const open = (newItems, newIndex) => {
            items = newItems;
            index = newIndex;
            overlay.classList.add('is-open');
            prevOverflowHtml = document.documentElement.style.overflow || '';
            prevOverflowBody = document.body.style.overflow || '';
            document.documentElement.style.overflow = 'hidden';
            document.body.style.overflow = 'hidden';
            render();
        };

        const close = () => {
            overlay.classList.remove('is-open');
            img.src = '';
            document.documentElement.style.overflow = prevOverflowHtml;
            document.body.style.overflow = prevOverflowBody;
        };

        const next = () => {
            if (!items.length) return;
            index = (index + 1) % items.length;
            render();
        };

        const prev = () => {
            if (!items.length) return;
            index = (index - 1 + items.length) % items.length;
            render();
        };

        closeBtn.addEventListener('click', close);
        nextBtn.addEventListener('click', next);
        prevBtn.addEventListener('click', prev);

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) close();
        });

        document.addEventListener('keydown', (e) => {
            if (!overlay.classList.contains('is-open')) return;
            if (e.key === 'Escape') close();
            if (e.key === 'ArrowRight') next();
            if (e.key === 'ArrowLeft') prev();
        });

        overlay.addEventListener('touchstart', (e) => {
            if (!overlay.classList.contains('is-open')) return;
            const t = e.touches[0];
            startX = t.clientX;
            startY = t.clientY;
        }, { passive: true });

        overlay.addEventListener('touchend', (e) => {
            if (!overlay.classList.contains('is-open')) return;
            if (startX == null || startY == null) return;
            const t = e.changedTouches[0];
            const dx = t.clientX - startX;
            const dy = t.clientY - startY;
            startX = null;
            startY = null;

            if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return;
            if (dx < 0) next();
            if (dx > 0) prev();
        });

        overlay.addEventListener('wheel', (e) => {
            if (!overlay.classList.contains('is-open')) return;
            const now = Date.now();
            if (now - lastWheelAt < 250) return;
            if (Math.abs(e.deltaY) < 25) return;
            lastWheelAt = now;
            if (e.deltaY > 0) next();
            if (e.deltaY < 0) prev();
        }, { passive: true });

        return { open };
    })();

    const setupLightboxGalleries = () => {
        let lastTouchMoveAt = 0;
        document.addEventListener('touchmove', () => {
            lastTouchMoveAt = Date.now();
        }, { passive: true });

        const onClick = (e) => {
            if (Date.now() - lastTouchMoveAt < 350) return;
            const link = e.target.closest('.mosaic-item');
            const directImg = !link ? (e.target.closest('.apartment-gallery-grid > img') || e.target.closest('.gallery-grid > img')) : null;
            if (!link && !directImg) return;
            e.preventDefault();

            const grid = (link || directImg).closest('.mosaic-grid, .apartment-gallery-grid, .gallery-grid, .home-gallery-grid');
            if (!grid) return;

            const links = Array.from(grid.querySelectorAll('.mosaic-item'));
            const items = links.length
                ? links.map((a) => {
                    const img = a.querySelector('img');
                    return { href: a.getAttribute('href'), alt: img ? img.alt : '' };
                }).filter((x) => Boolean(x.href))
                : Array.from(grid.querySelectorAll(':scope > img')).map((img) => ({ href: img.getAttribute('src'), alt: img.alt || '' })).filter((x) => Boolean(x.href));

            const targetHref = link ? link.getAttribute('href') : directImg.getAttribute('src');
            const idx = Math.max(0, items.findIndex((x) => x.href === targetHref));
            lightbox.open(items, idx);
        };

        document.addEventListener('click', onClick);
    };

    setupLightboxGalleries();
    setupScrollReveal();
});

// Keyframe for nav links animation
const style = document.createElement('style');
style.innerHTML = `
@keyframes navLinkFade {
    from {
        opacity: 0;
        transform: translateX(50px);
    }
    to {
        opacity: 1;
        transform: translateX(0px);
    }
}
.toggle .line1 {
    transform: rotate(-45deg) translate(-5px, 6px);
}
.toggle .line2 {
    opacity: 0;
}
.toggle .line3 {
    transform: rotate(45deg) translate(-5px, -6px);
}
`;
document.head.appendChild(style);
