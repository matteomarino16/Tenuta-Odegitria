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
            document.documentElement.style.overflow = 'hidden';
            render();
        };

        const close = () => {
            overlay.classList.remove('is-open');
            img.src = '';
            document.documentElement.style.overflow = '';
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

    const applyMosaicLayout = (grid) => {
        if (!grid) return;
        const computed = window.getComputedStyle(grid);
        const rowHeight = parseFloat(computed.getPropertyValue('grid-auto-rows')) || 10;
        const rowGap = parseFloat(computed.getPropertyValue('gap')) || 0;
        const anchorItems = grid.querySelectorAll('.mosaic-item');
        const imgItems = anchorItems.length ? [] : grid.querySelectorAll(':scope > img');
        const items = anchorItems.length ? anchorItems : imgItems;

        items.forEach((item) => {
            const media = item.tagName === 'IMG' ? item : item.querySelector('img');
            if (!media) return;
            const height = media.getBoundingClientRect().height;
            if (!height) return;
            const span = Math.ceil((height + rowGap) / (rowHeight + rowGap));
            item.style.gridRowEnd = `span ${span}`;
        });
    };

    const setupMosaicGalleries = () => {
        const grids = document.querySelectorAll('.mosaic-grid, .apartment-gallery-grid, .gallery-grid');
        grids.forEach((grid) => {
            const imgs = grid.querySelectorAll('img');
            imgs.forEach((img) => {
                if (img.complete) return;
                img.addEventListener('load', () => applyMosaicLayout(grid), { once: true });
            });
            requestAnimationFrame(() => applyMosaicLayout(grid));
        });

        let resizeTimer = null;
        window.addEventListener('resize', () => {
            if (resizeTimer) window.clearTimeout(resizeTimer);
            resizeTimer = window.setTimeout(() => {
                grids.forEach((grid) => applyMosaicLayout(grid));
            }, 120);
        });
    };

    const setupLightboxGalleries = () => {
        const onClick = (e) => {
            const link = e.target.closest('.mosaic-item');
            const directImg = !link ? (e.target.closest('.apartment-gallery-grid > img') || e.target.closest('.gallery-grid > img')) : null;
            if (!link && !directImg) return;
            e.preventDefault();

            const grid = (link || directImg).closest('.mosaic-grid, .apartment-gallery-grid, .gallery-grid');
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

    setupMosaicGalleries();
    setupLightboxGalleries();
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
