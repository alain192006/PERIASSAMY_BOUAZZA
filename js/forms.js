/* ============================================================
   VALIDATION DU FORMULAIRE DE CONTACT
   ============================================================ */

const formContact = document.getElementById('form-contact');

if (formContact) {
    const champs = formContact.querySelectorAll('input[required], textarea[required], select[required]');

    // validation en temps réel
    champs.forEach(champ => {
        champ.addEventListener('blur', () => validerChamp(champ));
        champ.addEventListener('input', () => {
            if (champ.classList.contains('invalide')) validerChamp(champ);
        });
    });

    formContact.addEventListener('submit', (e) => {
        e.preventDefault();
        let formValide = true;

        champs.forEach(champ => {
            if (!validerChamp(champ)) formValide = false;
        });

        if (formValide) {
            afficherConfirmation();
        }
    });
}

function validerChamp(champ) {
    const valeur   = champ.value.trim();
    const erreurEl = champ.parentElement.querySelector('.erreur-msg');
    let valide = true;
    let msg    = '';

    if (!valeur) {
        valide = false;
        msg = 'Ce champ est obligatoire.';
    } else if (champ.type === 'email') {
        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regexEmail.test(valeur)) {
            valide = false;
            msg = 'Veuillez entrer une adresse e-mail valide.';
        }
    } else if (champ.type === 'tel') {
        const regexTel = /^[0-9\s\+\-\.]{7,15}$/;
        if (!regexTel.test(valeur)) {
            valide = false;
            msg = 'Numéro de téléphone invalide.';
        }
    } else if (champ.minLength && valeur.length < champ.minLength) {
        valide = false;
        msg = `Minimum ${champ.minLength} caractères requis.`;
    }

    champ.classList.toggle('valide',   valide);
    champ.classList.toggle('invalide', !valide);

    if (erreurEl) {
        erreurEl.textContent = msg;
        erreurEl.style.display = valide ? 'none' : 'block';
    }

    return valide;
}

function afficherConfirmation() {
    const form       = document.getElementById('form-contact');
    const conteneur  = form.parentElement;

    form.style.opacity = '0';
    form.style.transition = 'opacity 0.4s ease';

    setTimeout(() => {
        form.style.display = 'none';

        const confirmation = document.createElement('div');
        confirmation.style.cssText = `
            text-align: center;
            padding: 60px 30px;
            animation: fadeUp 0.5s ease forwards;
        `;
        confirmation.innerHTML = `
            <div style="font-size: 56px; margin-bottom: 20px;">&#10003;</div>
            <h3 style="font-family:'Montserrat',sans-serif; color:#0A316C; font-size:22px; margin-bottom:12px;">
                Message envoyé !
            </h3>
            <p style="color:#666; font-size:15px; line-height:1.6; max-width:440px; margin:0 auto 24px;">
                Merci pour votre message. Notre équipe vous répondra dans les plus brefs délais, généralement sous 2 jours ouvrés.
            </p>
            <a href="index.html" class="btn btn-bleu" style="display:inline-flex; align-items:center; gap:8px; padding:12px 26px; background:#0A316C; color:#fff; border-radius:6px; font-family:'Montserrat',sans-serif; font-weight:600; font-size:14px; text-decoration:none;">
                Retour à l'accueil
            </a>
        `;
        conteneur.appendChild(confirmation);
    }, 400);
}

/* ============================================================
   VALIDATION DU FORMULAIRE DE RÉSERVATION
   ============================================================ */

const formReservation = document.getElementById('form-reservation');

if (formReservation) {
    const champsResa = formReservation.querySelectorAll('input[required], select[required]');

    champsResa.forEach(champ => {
        champ.addEventListener('blur', () => validerChamp(champ));
        champ.addEventListener('input', () => {
            if (champ.classList.contains('invalide')) validerChamp(champ);
        });
    });

    formReservation.addEventListener('submit', (e) => {
        e.preventDefault();
        let formValide = true;

        champsResa.forEach(champ => {
            if (!validerChamp(champ)) formValide = false;
        });

        if (formValide) {
            enregistrerReservation();
        }
    });
}

function enregistrerReservation() {
    const nom       = document.getElementById('resa-nom')?.value.trim();
    const prenom    = document.getElementById('resa-prenom')?.value.trim();
    const email     = document.getElementById('resa-email')?.value.trim();
    const enseignant = document.getElementById('resa-enseignant')?.value;
    const date      = document.getElementById('resa-date')?.value;
    const creneau   = document.getElementById('resa-creneau')?.value;

    if (!nom || !prenom || !email || !enseignant || !date || !creneau) return;

    const reservations = JSON.parse(localStorage.getItem('efrei_reservations') || '[]');

    const nouvelleResa = {
        id:          Date.now(),
        nom,
        prenom,
        email,
        enseignant,
        date,
        creneau,
        statut:      'confirme',
        dateCreation: new Date().toISOString()
    };

    reservations.push(nouvelleResa);
    localStorage.setItem('efrei_reservations', JSON.stringify(reservations));

    // rediriger vers mes réservations
    window.location.href = 'mes-reservations.html?nouvelle=1';
}
