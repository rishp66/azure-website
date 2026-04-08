/* =====================================================================
   RISH PEDNEKAR — CYBERPUNK PORTFOLIO :: main.js
   GSAP + ScrollTrigger + Lenis
   ===================================================================== */

(function () {
    'use strict';

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch = window.matchMedia('(hover: none)').matches || 'ontouchstart' in window;

    document.addEventListener('DOMContentLoaded', init);

    function init() {
        // Wait until GSAP is on the window (deferred load order is index.html)
        if (!window.gsap) {
            window.addEventListener('load', boot);
        } else {
            boot();
        }
    }

    function boot() {
        if (window.gsap && window.ScrollTrigger) {
            gsap.registerPlugin(ScrollTrigger);
        }

        runPreloader();
        initLenis();
        initCursorTrail();
        initCodeRain();
        initTypewriter();
        initRevealHeadings();
        initStatCounters();
        initHorizontalScroll();
        initSkillsFloat();
        initNavActiveState();
    }

    /* ---------- PRELOADER ---------- */
    function runPreloader() {
        const overlay = document.querySelector('.preloader');
        const words = document.querySelectorAll('.pre-word');
        const bar = document.querySelector('.preloader__bar span');
        if (!overlay || !words.length) return;

        if (reduceMotion) {
            overlay.style.display = 'none';
            return;
        }

        // hide all but first
        gsap.set(words, { opacity: 0, y: 18 });

        const tl = gsap.timeline({
            onComplete: () => {
                overlay.style.pointerEvents = 'none';
                overlay.remove();
                playHeroIntro();
            }
        });

        if (bar) {
            tl.to(bar, { width: '100%', duration: 2.2, ease: 'power2.inOut' }, 0);
        }

        words.forEach((w, i) => {
            const isLast = i === words.length - 1;
            tl.to(w, { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' }, '>0.05');
            if (!isLast) {
                tl.to(w, { opacity: 0, y: -18, duration: 0.45, ease: 'power3.in' }, '+=0.35');
            } else {
                tl.to({}, { duration: 0.6 });
            }
        });

        tl.to(overlay, {
            clipPath: 'inset(0 0 100% 0)',
            duration: 1.0,
            ease: 'power4.inOut'
        }, '+=0.1');
    }

    function playHeroIntro() {
        const lines = document.querySelectorAll('.hero__line');
        const meta = document.querySelectorAll('.hero__meta > *');
        const bottom = document.querySelectorAll('.hero__bottom > *');

        if (reduceMotion) return;

        const tl = gsap.timeline();
        tl.from(meta, { opacity: 0, y: -20, duration: 0.7, stagger: 0.1, ease: 'power3.out' }, 0)
          .from(lines, { opacity: 0, y: 80, rotateX: -60, duration: 1.1, stagger: 0.12, ease: 'power4.out', transformOrigin: 'top center' }, 0.1)
          .from(bottom, { opacity: 0, y: 24, duration: 0.7, stagger: 0.1, ease: 'power3.out' }, 0.6);

        // Trigger ScrollTrigger refresh after hero is in
        ScrollTrigger && ScrollTrigger.refresh();
    }

    /* ---------- LENIS SMOOTH SCROLL ---------- */
    function initLenis() {
        if (reduceMotion || !window.Lenis) return;

        const lenis = new Lenis({
            duration: 1.15,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            wheelMultiplier: 1,
            lerp: 0.1
        });

        document.documentElement.classList.add('lenis-active');

        lenis.on('scroll', () => { ScrollTrigger && ScrollTrigger.update(); });

        gsap.ticker.add((time) => lenis.raf(time * 1000));
        gsap.ticker.lagSmoothing(0);

        // Anchor links
        document.querySelectorAll('a[href^="#"]').forEach((a) => {
            a.addEventListener('click', (e) => {
                const href = a.getAttribute('href');
                if (!href || href === '#') return;
                const target = document.querySelector(href);
                if (!target) return;
                e.preventDefault();
                lenis.scrollTo(target, { offset: -20, duration: 1.4 });
            });
        });
    }

    /* ---------- CURSOR TRAIL ---------- */
    function initCursorTrail() {
        if (reduceMotion || isTouch) return;
        const wrap = document.querySelector('.cursor-trail');
        if (!wrap) return;

        const POOL = 22;
        const dots = [];
        for (let i = 0; i < POOL; i++) {
            const d = document.createElement('div');
            d.className = 'cursor-trail__dot';
            wrap.appendChild(d);
            dots.push(d);
        }

        let idx = 0;
        let lastX = 0, lastY = 0;
        let throttled = false;

        window.addEventListener('mousemove', (e) => {
            lastX = e.clientX; lastY = e.clientY;
            if (throttled) return;
            throttled = true;
            requestAnimationFrame(() => {
                const dot = dots[idx % POOL];
                idx++;
                gsap.killTweensOf(dot);
                gsap.set(dot, { x: lastX, y: lastY, scale: 1, opacity: 1 });
                gsap.to(dot, { scale: 0, opacity: 0, duration: 0.7, ease: 'power2.out' });
                throttled = false;
            });
        });
    }

    /* ---------- CODE RAIN ---------- */
    function initCodeRain() {
        if (reduceMotion) return;
        const canvas = document.querySelector('.code-rain');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let w, h, cols, drops;
        const fontSize = 14;
        const charset = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホ0123456789</>{}#$&%*';

        function resize() {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const rect = canvas.parentElement.getBoundingClientRect();
            w = rect.width;
            h = rect.height;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            canvas.style.width = w + 'px';
            canvas.style.height = h + 'px';
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            cols = Math.floor(w / fontSize);
            drops = new Array(cols).fill(0).map(() => Math.random() * h / fontSize);
        }

        resize();
        window.addEventListener('resize', resize);

        let running = true;
        document.addEventListener('visibilitychange', () => {
            running = !document.hidden;
            if (running) loop();
        });

        function loop() {
            if (!running) return;
            ctx.fillStyle = 'rgba(10, 10, 15, 0.08)';
            ctx.fillRect(0, 0, w, h);
            ctx.font = `${fontSize}px JetBrains Mono, monospace`;
            for (let i = 0; i < cols; i++) {
                const ch = charset[Math.floor(Math.random() * charset.length)];
                const x = i * fontSize;
                const y = drops[i] * fontSize;
                ctx.fillStyle = Math.random() > 0.985 ? '#ff00aa' : '#00f0ff';
                ctx.shadowColor = '#00f0ff';
                ctx.shadowBlur = 6;
                ctx.fillText(ch, x, y);
                ctx.shadowBlur = 0;
                if (y > h && Math.random() > 0.975) drops[i] = 0;
                drops[i] += 0.6;
            }
            requestAnimationFrame(loop);
        }
        loop();
    }

    /* ---------- TYPEWRITER ---------- */
    function initTypewriter() {
        const el = document.querySelector('[data-typewriter]');
        if (!el) return;
        const text = el.dataset.typewriter;
        if (reduceMotion) { el.textContent = text; return; }

        let i = 0;
        const speed = 55;
        // Delay until preloader done
        setTimeout(() => {
            const tick = () => {
                if (i <= text.length) {
                    el.textContent = text.slice(0, i);
                    i++;
                    setTimeout(tick, speed);
                }
            };
            tick();
        }, 3200);
    }

    /* ---------- HEADING REVEAL ---------- */
    function initRevealHeadings() {
        if (reduceMotion || !window.ScrollTrigger) return;
        document.querySelectorAll('.reveal > span').forEach((span) => {
            gsap.from(span, {
                yPercent: 110,
                duration: 1.0,
                ease: 'power4.out',
                scrollTrigger: {
                    trigger: span,
                    start: 'top 88%',
                    once: true
                }
            });
        });
    }

    /* ---------- STAT COUNTERS ---------- */
    function initStatCounters() {
        const stats = document.querySelectorAll('.stat__num');
        if (!stats.length) return;
        if (reduceMotion || !window.ScrollTrigger) {
            stats.forEach((s) => { s.textContent = (s.dataset.target || '') + (s.dataset.suffix || ''); });
            return;
        }

        ScrollTrigger.create({
            trigger: '.stats',
            start: 'top 75%',
            once: true,
            onEnter: () => {
                stats.forEach((el) => {
                    const target = parseInt(el.dataset.target, 10) || 0;
                    const suffix = el.dataset.suffix || '';
                    const obj = { val: 0 };
                    gsap.to(obj, {
                        val: target,
                        duration: 2.0,
                        ease: 'power2.out',
                        onUpdate() { el.textContent = Math.floor(obj.val) + suffix; }
                    });
                });
            }
        });
    }

    /* ---------- HORIZONTAL PINNED SCROLL ---------- */
    function initHorizontalScroll() {
        if (!window.ScrollTrigger) return;

        const mm = gsap.matchMedia();

        mm.add('(min-width: 993px)', () => {
            const sections = [
                { section: '#experience', track: '.xp__track' },
                { section: '#projects', track: '.proj__track' }
            ];

            const triggers = [];
            sections.forEach(({ section, track }) => {
                const sec = document.querySelector(section);
                const trk = document.querySelector(track);
                if (!sec || !trk) return;

                const tween = gsap.to(trk, {
                    x: () => -(trk.scrollWidth - window.innerWidth + 80),
                    ease: 'none',
                    scrollTrigger: {
                        trigger: sec,
                        pin: true,
                        scrub: 1,
                        start: 'top top',
                        end: () => '+=' + (trk.scrollWidth - window.innerWidth + 80),
                        invalidateOnRefresh: true,
                        anticipatePin: 1
                    }
                });
                triggers.push(tween);
            });

            return () => { triggers.forEach((t) => t.scrollTrigger && t.scrollTrigger.kill()); };
        });
    }

    /* ---------- SKILLS FLOAT ---------- */
    function initSkillsFloat() {
        if (reduceMotion) return;
        const tags = document.querySelectorAll('.skill-tag');
        tags.forEach((tag) => {
            gsap.to(tag, {
                y: gsap.utils.random(-6, 6),
                x: gsap.utils.random(-4, 4),
                duration: gsap.utils.random(3, 5.5),
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
                delay: gsap.utils.random(0, 2)
            });
        });
    }

    /* ---------- NAV ACTIVE STATE ---------- */
    function initNavActiveState() {
        if (!window.ScrollTrigger) return;
        const links = document.querySelectorAll('.nav__links a');
        links.forEach((link) => {
            const id = link.getAttribute('href');
            const target = document.querySelector(id);
            if (!target) return;
            ScrollTrigger.create({
                trigger: target,
                start: 'top 50%',
                end: 'bottom 50%',
                onToggle: (self) => {
                    if (self.isActive) {
                        links.forEach((l) => l.removeAttribute('aria-current'));
                        link.setAttribute('aria-current', 'true');
                    }
                }
            });
        });
    }
})();
