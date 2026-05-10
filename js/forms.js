// validation formulaire contact

var formContact = document.getElementById('form-contact');

if (formContact) {

    var champsContact = formContact.querySelectorAll('input[required], textarea[required], select[required]');

    // on valide quand l'utilisateur quitte un champ
    for (var i = 0; i < champsContact.length; i++) {
        champsContact[i].addEventListener('blur', function() {
            validerChamp(this);
        });
        // si le champ est deja rouge on re-verifie en temps reel
        champsContact[i].addEventListener('input', function() {
            if (this.classList.contains('invalide')) {
                validerChamp(this);
            }
        });
    }

    formContact.addEventListener('submit', function(e) {
        e.preventDefault();

        var ok = true;
        for (var j = 0; j < champsContact.length; j++) {
            if (!validerChamp(champsContact[j])) {
                ok = false;
            }
        }

        if (ok) {
            afficherConfirmation();
        }
    });
}


function validerChamp(champ) {
    var valeur = champ.value.trim();
    var msgErreur = champ.parentElement.querySelector('.erreur-msg');
    var valide = true;
    var msg = '';

    if (valeur === '') {
        valide = false;
        msg = 'Ce champ est obligatoire.';
    } else if (champ.type === 'email') {
        // regex simple pour le format email
        var regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regexEmail.test(valeur)) {
            valide = false;
            msg = 'Adresse e-mail invalide.';
        }
    } else if (champ.type === 'tel') {
        var regexTel = /^[0-9\s\+\-\.]{7,15}$/;
        if (!regexTel.test(valeur)) {
            valide = false;
            msg = 'Numero invalide.';
        }
    } else if (champ.minLength && valeur.length < champ.minLength) {
        valide = false;
        msg = 'Minimum ' + champ.minLength + ' caracteres.';
    }

    if (valide) {
        champ.classList.remove('invalide');
        champ.classList.add('valide');
    } else {
        champ.classList.remove('valide');
        champ.classList.add('invalide');
    }

    if (msgErreur) {
        msgErreur.textContent = msg;
        msgErreur.style.display = valide ? 'none' : 'block';
    }

    return valide;
}


function afficherConfirmation() {
    var form = document.getElementById('form-contact');
    var conteneur = form.parentElement;

    form.style.opacity = '0';
    form.style.transition = 'opacity 0.4s';

    setTimeout(function() {
        form.style.display = 'none';

        var bloc = document.createElement('div');
        bloc.style.textAlign = 'center';
        bloc.style.padding = '60px 20px';
        bloc.innerHTML =
            '<div style="font-size:52px; margin-bottom:18px;">&#10003;</div>' +
            '<h3 style="font-family:Montserrat,sans-serif; color:#0A316C; font-size:20px; margin-bottom:10px;">Message envoye !</h3>' +
            '<p style="color:#666; font-size:14px; line-height:1.7; max-width:400px; margin:0 auto 22px;">Notre equipe vous repondra rapidement (en general sous 2 jours ouvres).</p>' +
            '<a href="index.html" class="btn btn-bleu" style="display:inline-block; padding:11px 24px; background:#0A316C; color:#fff; border-radius:6px; font-family:Montserrat,sans-serif; font-weight:600; font-size:14px; text-decoration:none;">Retour a l\'accueil</a>';

        conteneur.appendChild(bloc);
    }, 400);
}


// ---- formulaire reservation ----

var formReservation = document.getElementById('form-reservation');

if (formReservation) {

    var champsResa = formReservation.querySelectorAll('input[required], select[required]');

    for (var k = 0; k < champsResa.length; k++) {
        champsResa[k].addEventListener('blur', function() {
            validerChamp(this);
        });
        champsResa[k].addEventListener('input', function() {
            if (this.classList.contains('invalide')) {
                validerChamp(this);
            }
        });
    }

    formReservation.addEventListener('submit', function(e) {
        e.preventDefault();

        var formOk = true;
        for (var l = 0; l < champsResa.length; l++) {
            if (!validerChamp(champsResa[l])) {
                formOk = false;
            }
        }

        if (formOk) {
            enregistrerReservation();
        }
    });
}


function enregistrerReservation() {
    var nom        = document.getElementById('resa-nom') ? document.getElementById('resa-nom').value.trim() : '';
    var prenom     = document.getElementById('resa-prenom') ? document.getElementById('resa-prenom').value.trim() : '';
    var email      = document.getElementById('resa-email') ? document.getElementById('resa-email').value.trim() : '';
    var enseignant = document.getElementById('resa-enseignant') ? document.getElementById('resa-enseignant').value : '';
    var date       = document.getElementById('resa-date') ? document.getElementById('resa-date').value : '';
    var creneau    = document.getElementById('resa-creneau') ? document.getElementById('resa-creneau').value : '';

    if (!nom || !prenom || !email || !enseignant || !date || !creneau) return;

    var reservations = JSON.parse(localStorage.getItem('efrei_reservations') || '[]');

    var nouvelleResa = {
        id:           Date.now(),
        nom:          nom,
        prenom:       prenom,
        email:        email,
        enseignant:   enseignant,
        date:         date,
        creneau:      creneau,
        statut:       'confirme',
        dateCreation: new Date().toISOString()
    };

    reservations.push(nouvelleResa);
    localStorage.setItem('efrei_reservations', JSON.stringify(reservations));

    window.location.href = 'mes-reservations.html?nouvelle=1';
}
