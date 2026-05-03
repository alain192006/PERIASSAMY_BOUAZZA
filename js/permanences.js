/* ============================================================
   DONNÉES DE L'AGENDA
   Simule les créneaux de permanences des enseignants
   ============================================================ */

const ENSEIGNANTS = [
    { id: 'hamidi',    nom: 'M. Hamidi',    matiere: 'Développement Web' },
    { id: 'martin',    nom: 'Mme Martin',   matiere: 'Bases de données' },
    { id: 'dupont',    nom: 'M. Dupont',    matiere: 'Algorithmique' },
    { id: 'bernard',   nom: 'Mme Bernard',  matiere: 'Cybersécurité' },
    { id: 'leroy',     nom: 'M. Leroy',     matiere: 'Systèmes & Réseaux' },
];

const HORAIRES = [
    '08h00 – 09h00',
    '09h00 – 10h00',
    '10h00 – 11h00',
    '11h00 – 12h00',
    '13h00 – 14h00',
    '14h00 – 15h00',
    '15h00 – 16h00',
    '16h00 – 17h00',
];

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];

/* créneaux réservés par défaut (simulés) */
const CRENEAUX_PRIS_DEFAUT = [
    { enseignant: 'hamidi',  jour: 0, horaire: 0 },
    { enseignant: 'hamidi',  jour: 0, horaire: 2 },
    { enseignant: 'hamidi',  jour: 2, horaire: 1 },
    { enseignant: 'martin',  jour: 1, horaire: 3 },
    { enseignant: 'martin',  jour: 3, horaire: 0 },
    { enseignant: 'dupont',  jour: 0, horaire: 4 },
    { enseignant: 'dupont',  jour: 4, horaire: 2 },
    { enseignant: 'bernard', jour: 2, horaire: 5 },
    { enseignant: 'leroy',   jour: 1, horaire: 1 },
    { enseignant: 'leroy',   jour: 3, horaire: 6 },
];

/* ============================================================
   AGENDA — affichage du tableau de créneaux
   ============================================================ */
function construireAgenda() {
    const selectEns  = document.getElementById('filtre-enseignant');
    const corpsTablo = document.getElementById('corps-agenda');

    if (!selectEns || !corpsTablo) return;

    // remplir le <select>
    ENSEIGNANTS.forEach(ens => {
        const opt = document.createElement('option');
        opt.value = ens.id;
        opt.textContent = ens.nom + ' – ' + ens.matiere;
        selectEns.appendChild(opt);
    });

    selectEns.addEventListener('change', () => afficherAgendaEnseignant(selectEns.value, corpsTablo));

    // afficher le premier enseignant par défaut
    afficherAgendaEnseignant(ENSEIGNANTS[0].id, corpsTablo);
    selectEns.value = ENSEIGNANTS[0].id;
}

function afficherAgendaEnseignant(idEns, corps) {
    corps.innerHTML = '';

    const reservations = JSON.parse(localStorage.getItem('efrei_reservations') || '[]');
    const userEmail    = localStorage.getItem('efrei_email_utilisateur') || '';

    HORAIRES.forEach((horaire, iH) => {
        const ligne = document.createElement('tr');

        // colonne horaire
        const tdHoraire = document.createElement('td');
        tdHoraire.textContent = horaire;
        tdHoraire.style.fontWeight = '600';
        tdHoraire.style.color = '#0A316C';
        tdHoraire.style.whiteSpace = 'nowrap';
        ligne.appendChild(tdHoraire);

        JOURS.forEach((_, iJ) => {
            const td = document.createElement('td');

            const estPrisDefaut = CRENEAUX_PRIS_DEFAUT.some(
                c => c.enseignant === idEns && c.jour === iJ && c.horaire === iH
            );

            const resaUtilisateur = reservations.find(
                r => r.enseignant === idEns &&
                     r.date &&
                     new Date(r.date).getDay() - 1 === iJ &&  // 1=Lundi
                     r.creneau === horaire
            );

            if (resaUtilisateur && resaUtilisateur.email === userEmail) {
                td.innerHTML = '<span class="creno-moi">Ma réservation</span>';
            } else if (estPrisDefaut || resaUtilisateur) {
                td.innerHTML = '<span class="creno-pris">Réservé</span>';
            } else {
                const span = document.createElement('span');
                span.className = 'creno-libre';
                span.textContent = 'Libre';
                span.title = 'Cliquez pour réserver ce créneau';
                span.addEventListener('click', () => {
                    const ens = ENSEIGNANTS.find(e => e.id === idEns);
                    const params = new URLSearchParams({
                        enseignant: idEns,
                        creneau:    horaire,
                        jour:       JOURS[iJ]
                    });
                    window.location.href = 'reserver.html?' + params.toString();
                });
                td.appendChild(span);
            }

            ligne.appendChild(td);
        });

        corps.appendChild(ligne);
    });
}

/* ============================================================
   MES RÉSERVATIONS
   ============================================================ */
function afficherMesReservations() {
    const conteneur = document.getElementById('liste-reservations');
    if (!conteneur) return;

    const reservations = JSON.parse(localStorage.getItem('efrei_reservations') || '[]');

    // notif si on vient de réserver
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('nouvelle') === '1') {
        const notif = document.createElement('div');
        notif.style.cssText = `
            background-color: rgba(0,184,148,0.12);
            border: 1px solid rgba(0,184,148,0.3);
            border-radius: 6px;
            padding: 14px 18px;
            margin-bottom: 24px;
            color: #006d5b;
            font-size: 14px;
            font-family: 'Open Sans', sans-serif;
            display: flex;
            align-items: center;
            gap: 10px;
        `;
        notif.innerHTML = '<strong>&#10003;</strong> Votre réservation a bien été enregistrée.';
        conteneur.parentElement.insertBefore(notif, conteneur);

        // retirer le param de l'URL sans recharger
        window.history.replaceState({}, '', window.location.pathname);
    }

    if (reservations.length === 0) {
        conteneur.innerHTML = `
            <div class="resa-vide">
                <p>Vous n'avez aucune réservation pour le moment.</p>
                <a href="reserver.html" class="btn btn-bleu" style="display:inline-flex;align-items:center;gap:8px;padding:12px 24px;background:#0A316C;color:#fff;border-radius:6px;font-family:'Montserrat',sans-serif;font-weight:600;font-size:14px;text-decoration:none;">
                    Réserver un créneau
                </a>
            </div>
        `;
        return;
    }

    // tri par date
    reservations.sort((a, b) => new Date(a.date) - new Date(b.date));

    reservations.forEach((r, index) => {
        const ens = ENSEIGNANTS.find(e => e.id === r.enseignant);
        const dateFormatee = r.date
            ? new Date(r.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
            : 'Date non définie';

        const carte = document.createElement('div');
        carte.className = 'resa-carte anim-fadein del-' + (Math.min(index + 1, 6));
        carte.dataset.id = r.id;
        carte.innerHTML = `
            <div class="resa-info">
                <h4>${ens ? ens.nom : r.enseignant} — ${ens ? ens.matiere : ''}</h4>
                <p>${dateFormatee} &bull; ${r.creneau}</p>
                <p style="margin-top:4px; color:#aaa; font-size:12px;">Réservé par ${r.prenom} ${r.nom}</p>
            </div>
            <div style="display:flex; flex-direction:column; align-items:flex-end; gap:10px; flex-shrink:0;">
                <span class="resa-statut statut-${r.statut}">${r.statut === 'confirme' ? 'Confirmé' : 'En attente'}</span>
                <button class="btn-annuler" onclick="annulerReservation(${r.id})">Annuler</button>
            </div>
        `;
        conteneur.appendChild(carte);
    });

    // déclencher les animations
    setTimeout(() => {
        document.querySelectorAll('.anim-fadein').forEach(el => el.classList.add('visible'));
    }, 100);
}

function annulerReservation(id) {
    if (!confirm('Voulez-vous vraiment annuler cette réservation ?')) return;

    let reservations = JSON.parse(localStorage.getItem('efrei_reservations') || '[]');
    reservations = reservations.filter(r => r.id !== id);
    localStorage.setItem('efrei_reservations', JSON.stringify(reservations));

    // supprimer la carte de l'interface
    const carte = document.querySelector(`.resa-carte[data-id="${id}"]`);
    if (carte) {
        carte.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        carte.style.opacity = '0';
        carte.style.transform = 'translateX(20px)';
        setTimeout(() => {
            carte.remove();
            // si plus de réservations, afficher le message vide
            const conteneur = document.getElementById('liste-reservations');
            if (conteneur && conteneur.children.length === 0) {
                afficherMesReservations();
            }
        }, 300);
    }
}

/* ============================================================
   PRÉ-REMPLISSAGE DU FORMULAIRE DE RÉSERVATION
   ============================================================ */
function preRemplirFormReservation() {
    const params = new URLSearchParams(window.location.search);
    const selectEns    = document.getElementById('resa-enseignant');
    const selectCreno  = document.getElementById('resa-creneau');

    if (selectEns) {
        ENSEIGNANTS.forEach(ens => {
            const opt = document.createElement('option');
            opt.value = ens.id;
            opt.textContent = ens.nom + ' – ' + ens.matiere;
            if (ens.id === params.get('enseignant')) opt.selected = true;
            selectEns.appendChild(opt);
        });
    }

    if (selectCreno) {
        HORAIRES.forEach(h => {
            const opt = document.createElement('option');
            opt.value = h;
            opt.textContent = h;
            if (h === params.get('creneau')) opt.selected = true;
            selectCreno.appendChild(opt);
        });
    }

    const inputJour = document.getElementById('resa-jour-info');
    if (inputJour && params.get('jour')) {
        inputJour.value = params.get('jour');
    }

    // sauvegarder l'email pour les correspondances
    const inputEmail = document.getElementById('resa-email');
    if (inputEmail) {
        inputEmail.addEventListener('change', () => {
            localStorage.setItem('efrei_email_utilisateur', inputEmail.value.trim());
        });
    }
}

/* ============================================================
   INITIALISATION SELON LA PAGE
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('corps-agenda'))      construireAgenda();
    if (document.getElementById('liste-reservations')) afficherMesReservations();
    if (document.getElementById('form-reservation'))   preRemplirFormReservation();
});
