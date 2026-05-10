// menu burger mobile
var hamburger = document.querySelector('.hamburger');
var nav = document.querySelector('nav');

if (hamburger) {
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('ouvert');
        nav.classList.toggle('ouvert');
    });

    // fermer si on clique ailleurs
    document.addEventListener('click', function(e) {
        if (!hamburger.contains(e.target) && !nav.contains(e.target)) {
            hamburger.classList.remove('ouvert');
            nav.classList.remove('ouvert');
        }
    });

    var liensNav = nav.querySelectorAll('a');
    liensNav.forEach(function(lien) {
        lien.addEventListener('click', function() {
            hamburger.classList.remove('ouvert');
            nav.classList.remove('ouvert');
        });
    });
}


// === carousel ===

function initCarousel(selector) {
    var wrap = document.querySelector(selector);
    if (!wrap) return;

    var piste = wrap.querySelector('.carousel-piste');
    var slides = wrap.querySelectorAll('.carousel-slide');
    var btnPrev = wrap.querySelector('.carousel-btn.prev');
    var btnNext = wrap.querySelector('.carousel-btn.next');
    var dotsWrap = wrap.querySelector('.carousel-dots');

    if (!piste || slides.length === 0) return;

    var current = 0;
    var timer;

    // creation des points
    if (dotsWrap) {
        for (var i = 0; i < slides.length; i++) {
            var dot = document.createElement('button');
            dot.className = i === 0 ? 'carousel-dot actif' : 'carousel-dot';
            dot.setAttribute('aria-label', 'Slide ' + (i + 1));
            // il faut une closure sinon i vaut toujours slides.length a la fin
            (function(idx) {
                dot.addEventListener('click', function() { goTo(idx); });
            })(i);
            dotsWrap.appendChild(dot);
        }
    }

    function goTo(n) {
        slides[current].classList.remove('actif');
        var dots = dotsWrap ? dotsWrap.querySelectorAll('.carousel-dot') : [];
        if (dots[current]) dots[current].classList.remove('actif');

        current = (n + slides.length) % slides.length;
        piste.style.transform = 'translateX(-' + (current * 100) + '%)';

        slides[current].classList.add('actif');
        if (dots[current]) dots[current].classList.add('actif');
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    function resetTimer() {
        clearInterval(timer);
        timer = setInterval(next, 5000);
    }

    if (btnNext) btnNext.addEventListener('click', function() { next(); resetTimer(); });
    if (btnPrev) btnPrev.addEventListener('click', function() { prev(); resetTimer(); });

    timer = setInterval(next, 5000);

    wrap.addEventListener('mouseenter', function() { clearInterval(timer); });
    wrap.addEventListener('mouseleave', function() { timer = setInterval(next, 5000); });

    // support du swipe tactile : on enregistre la position au debut du toucher,
    // et a la fin on regarde dans quel sens le doigt a bouge
    var startX = 0;
    wrap.addEventListener('touchstart', function(e) {
        startX = e.touches[0].clientX;
    });
    wrap.addEventListener('touchend', function(e) {
        var diff = startX - e.changedTouches[0].clientX;
        // seuil de 50px pour eviter les faux positifs
        if (Math.abs(diff) > 50) {
            if (diff > 0) next();
            else prev();
            resetTimer();
        }
    });

    goTo(0);
}

initCarousel('.carousel-wrap');


// fadein au scroll
var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.12 });

document.querySelectorAll('.anim-fadein').forEach(function(el) {
    observer.observe(el);
});


// animation des chiffres (section stats)
function animerNombre(el, max, duree) {
    var step = max / (duree / 16);
    var val = 0;
    var suffix = el.dataset.suffixe || '';

    var interval = setInterval(function() {
        val += step;
        if (val >= max) {
            val = max;
            clearInterval(interval);
        }
        el.textContent = Math.round(val) + suffix;
    }, 16);
}

var obsNombres = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
        if (entry.isIntersecting) {
            var el = entry.target;
            animerNombre(el, parseInt(el.dataset.valeur), 1400);
            obsNombres.unobserve(el);
        }
    });
}, { threshold: 0.3 });

document.querySelectorAll('.nombre[data-valeur], .stat-chiffre[data-valeur]').forEach(function(el) {
    obsNombres.observe(el);
});


// accordeon pour la FAQ
document.querySelectorAll('.faq-question').forEach(function(btn) {
    btn.addEventListener('click', function() {
        var parent = btn.parentElement;
        var reponse = parent.querySelector('.faq-reponse');
        var ouvert = btn.classList.contains('ouvert');

        // fermer tous les autres avant d'ouvrir celui-la
        document.querySelectorAll('.faq-question.ouvert').forEach(function(q) {
            q.classList.remove('ouvert');
            q.parentElement.querySelector('.faq-reponse').classList.remove('ouvert');
        });

        if (!ouvert) {
            btn.classList.add('ouvert');
            reponse.classList.add('ouvert');
        }
    });
});


// lien actif dans le nav selon la page courante
(function() {
    var path = window.location.pathname;
    var pageCourante = path.split('/').pop() || 'index.html';

    document.querySelectorAll('nav a').forEach(function(lien) {
        var href = lien.getAttribute('href');
        if (!href) return;
        var pageLien = href.split('/').pop() || 'index.html';

        if (pageCourante === pageLien) {
            lien.classList.add('actif');
        }
    });
})();
