// donnees des enseignants et creneaux

var ENSEIGNANTS = [
    { id: 'hamidi',    nom: 'M. Hamidi',    matiere: 'Developpement Web' },
    { id: 'martin',    nom: 'Mme Martin',   matiere: 'Bases de donnees' },
    { id: 'dupont',    nom: 'M. Dupont',    matiere: 'Algorithmique' },
    { id: 'bernard',   nom: 'Mme Bernard',  matiere: 'Cybersecurite' },
    { id: 'leroy',     nom: 'M. Leroy',     matiere: 'Systemes & Reseaux' }
];

var HORAIRES = [
    '08h00 - 09h00',
    '09h00 - 10h00',
    '10h00 - 11h00',
    '11h00 - 12h00',
    '13h00 - 14h00',
    '14h00 - 15h00',
    '15h00 - 16h00',
    '16h00 - 17h00'
];

var JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];

// creneaux deja pris par defaut (pour simuler un calendrier pas vide)
var CRENEAUX_PRIS = [
    { enseignant: 'hamidi',  jour: 0, horaire: 0 },
    { enseignant: 'hamidi',  jour: 0, horaire: 2 },
    { enseignant: 'hamidi',  jour: 2, horaire: 1 },
    { enseignant: 'martin',  jour: 1, horaire: 3 },
    { enseignant: 'martin',  jour: 3, horaire: 0 },
    { enseignant: 'dupont',  jour: 0, horaire: 4 },
    { enseignant: 'dupont',  jour: 4, horaire: 2 },
    { enseignant: 'bernard', jour: 2, horaire: 5 },
    { enseignant: 'leroy',   jour: 1, horaire: 1 },
    { enseignant: 'leroy',   jour: 3, horaire: 6 }
];


// construction du tableau agenda
function construireAgenda() {
    var selectEns  = document.getElementById('filtre-enseignant');
    var corpsTablo = document.getElementById('corps-agenda');

    if (!selectEns || !corpsTablo) return;

    // remplir le select avec les enseignants
    for (var i = 0; i < ENSEIGNANTS.length; i++) {
        var opt = document.createElement('option');
        opt.value = ENSEIGNANTS[i].id;
        opt.textContent = ENSEIGNANTS[i].nom + ' - ' + ENSEIGNANTS[i].matiere;
        selectEns.appendChild(opt);
    }

    selectEns.addEventListener('change', function() {
        afficherAgendaEnseignant(selectEns.value, corpsTablo);
    });

    // afficher le premier par defaut
    afficherAgendaEnseignant(ENSEIGNANTS[0].id, corpsTablo);
    selectEns.value = ENSEIGNANTS[0].id;
}


function afficherAgendaEnseignant(idEns, corps) {
    corps.innerHTML = '';

    var reservations = JSON.parse(localStorage.getItem('efrei_reservations') || '[]');
    var emailUser    = localStorage.getItem('efrei_email_utilisateur') || '';

    for (var iH = 0; iH < HORAIRES.length; iH++) {
        var ligne = document.createElement('tr');

        // colonne heure
        var tdH = document.createElement('td');
        tdH.textContent = HORAIRES[iH];
        tdH.style.fontWeight = '600';
        tdH.style.color = '#0A316C';
        tdH.style.whiteSpace = 'nowrap';
        ligne.appendChild(tdH);

        for (var iJ = 0; iJ < JOURS.length; iJ++) {
            var td = document.createElement('td');

            // verifier si ce creneau est pris par defaut
            var estPris = false;
            for (var p = 0; p < CRENEAUX_PRIS.length; p++) {
                if (CRENEAUX_PRIS[p].enseignant === idEns && CRENEAUX_PRIS[p].jour === iJ && CRENEAUX_PRIS[p].horaire === iH) {
                    estPris = true;
                    break;
                }
            }

            // verifier si il y a une reservation utilisateur sur ce creneau
            var resaUtilisateur = null;
            for (var r = 0; r < reservations.length; r++) {
                if (reservations[r].enseignant === idEns && reservations[r].date && reservations[r].creneau === HORAIRES[iH]) {
                    var jourDate = new Date(reservations[r].date).getDay() - 1;
                    if (jourDate === iJ) {
                        resaUtilisateur = reservations[r];
                        break;
                    }
                }
            }

            if (resaUtilisateur && resaUtilisateur.email === emailUser) {
                td.innerHTML = '<span class="creno-moi">Ma reservation</span>';
            } else if (estPris || resaUtilisateur) {
                td.innerHTML = '<span class="creno-pris">Reserve</span>';
            } else {
                // creer le span libre avec closure pour eviter le probleme de boucle
                td.appendChild(creerSpanLibre(idEns, iH, iJ));
            }

            ligne.appendChild(td);
        }

        corps.appendChild(ligne);
    }
}

// on a besoin d'une fonction separee pour la closure
// sinon idEns/iH/iJ valent toujours la derniere valeur de la boucle quand on clique
function creerSpanLibre(idEns, iH, iJ) {
    var span = document.createElement('span');
    span.className = 'creno-libre';
    span.textContent = 'Libre';
    span.title = 'Cliquer pour reserver';

    span.addEventListener('click', function() {
        var params = 'enseignant=' + idEns + '&creneau=' + encodeURIComponent(HORAIRES[iH]) + '&jour=' + JOURS[iJ];
        window.location.href = 'reserver.html?' + params;
    });

    return span;
}


// page mes reservations
function afficherMesReservations() {
    var conteneur = document.getElementById('liste-reservations');
    if (!conteneur) return;

    var reservations = JSON.parse(localStorage.getItem('efrei_reservations') || '[]');

    // notif apres une nouvelle reservation
    var urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('nouvelle') === '1') {
        var notif = document.createElement('div');
        notif.style.cssText = 'background:#e8f8f5; border:1px solid #a8e6cf; border-radius:6px; padding:14px 18px; margin-bottom:22px; color:#1a7a5a; font-size:14px;';
        notif.innerHTML = '<strong>OK</strong> — Votre reservation a bien ete enregistree.';
        conteneur.parentElement.insertBefore(notif, conteneur);
        window.history.replaceState({}, '', window.location.pathname);
    }

    if (reservations.length === 0) {
        conteneur.innerHTML = '<div class="resa-vide"><p>Vous n\'avez aucune reservation pour l\'instant.</p><a href="reserver.html" class="btn btn-bleu" style="display:inline-block; margin-top:14px; padding:11px 22px; background:#0A316C; color:#fff; border-radius:6px; font-family:Montserrat,sans-serif; font-weight:600; font-size:14px; text-decoration:none;">Reserver un creneau</a></div>';
        return;
    }

    // tri par date
    reservations.sort(function(a, b) {
        return new Date(a.date) - new Date(b.date);
    });

    for (var i = 0; i < reservations.length; i++) {
        var r = reservations[i];
        var ens = null;

        for (var j = 0; j < ENSEIGNANTS.length; j++) {
            if (ENSEIGNANTS[j].id === r.enseignant) {
                ens = ENSEIGNANTS[j];
                break;
            }
        }

        var dateFormatee = r.date
            ? new Date(r.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
            : 'date inconnue';

        var carte = document.createElement('div');
        carte.className = 'resa-carte';
        carte.dataset.id = r.id;

        var nomEns  = ens ? ens.nom     : r.enseignant;
        var matiere = ens ? ens.matiere : '';
        var statut  = r.statut === 'confirme' ? 'Confirme' : 'En attente';

        carte.innerHTML =
            '<div class="resa-info">' +
                '<h4>' + nomEns + ' &mdash; ' + matiere + '</h4>' +
                '<p>' + dateFormatee + ' &bull; ' + r.creneau + '</p>' +
                '<p style="margin-top:4px;color:#aaa;font-size:12px;">Reserve par ' + r.prenom + ' ' + r.nom + '</p>' +
            '</div>' +
            '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:10px;flex-shrink:0;">' +
                '<span class="resa-statut statut-' + r.statut + '">' + statut + '</span>' +
                '<button class="btn-annuler" onclick="annulerReservation(' + r.id + ')">Annuler</button>' +
            '</div>';

        conteneur.appendChild(carte);
    }

    // animer les cartes
    setTimeout(function() {
        var cartes = document.querySelectorAll('.resa-carte');
        for (var k = 0; k < cartes.length; k++) {
            cartes[k].classList.add('visible');
        }
    }, 100);
}


function annulerReservation(id) {
    if (!confirm('Annuler cette reservation ?')) return;

    var reservations = JSON.parse(localStorage.getItem('efrei_reservations') || '[]');
    var nouvelles = [];
    for (var i = 0; i < reservations.length; i++) {
        if (reservations[i].id !== id) {
            nouvelles.push(reservations[i]);
        }
    }
    localStorage.setItem('efrei_reservations', JSON.stringify(nouvelles));

    var carte = document.querySelector('.resa-carte[data-id="' + id + '"]');
    if (carte) {
        carte.style.transition = 'opacity 0.3s, transform 0.3s';
        carte.style.opacity = '0';
        carte.style.transform = 'translateX(20px)';
        setTimeout(function() {
            carte.remove();
            var conteneur = document.getElementById('liste-reservations');
            if (conteneur && conteneur.children.length === 0) {
                afficherMesReservations();
            }
        }, 300);
    }
}


// pre-remplissage du formulaire si on vient de l'agenda
function preRemplirFormReservation() {
    var params       = new URLSearchParams(window.location.search);
    var selectEns    = document.getElementById('resa-enseignant');
    var selectCreno  = document.getElementById('resa-creneau');

    if (selectEns) {
        for (var i = 0; i < ENSEIGNANTS.length; i++) {
            var opt = document.createElement('option');
            opt.value = ENSEIGNANTS[i].id;
            opt.textContent = ENSEIGNANTS[i].nom + ' - ' + ENSEIGNANTS[i].matiere;
            if (ENSEIGNANTS[i].id === params.get('enseignant')) {
                opt.selected = true;
            }
            selectEns.appendChild(opt);
        }
    }

    if (selectCreno) {
        for (var j = 0; j < HORAIRES.length; j++) {
            var optH = document.createElement('option');
            optH.value = HORAIRES[j];
            optH.textContent = HORAIRES[j];
            if (HORAIRES[j] === params.get('creneau')) {
                optH.selected = true;
            }
            selectCreno.appendChild(optH);
        }
    }

    var inputJour = document.getElementById('resa-jour-info');
    if (inputJour && params.get('jour')) {
        inputJour.value = params.get('jour');
    }

    // sauvegarder l'email pour retrouver les reservations de l'utilisateur
    var inputEmail = document.getElementById('resa-email');
    if (inputEmail) {
        inputEmail.addEventListener('change', function() {
            localStorage.setItem('efrei_email_utilisateur', inputEmail.value.trim());
        });
    }
}


// init selon la page
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('corps-agenda'))       construireAgenda();
    if (document.getElementById('liste-reservations')) afficherMesReservations();
    if (document.getElementById('form-reservation'))   preRemplirFormReservation();
});
