let db = [];
let round = 1;
let totalScore = 0;
let currentThesis = null;
let selectedED = null;
let selectedKWs = [];
const totalRounds = 5;

// Initialisation : Chargement du JSON local
async function init() {
    try {
        const resp = await fetch('database.json');
        if (!resp.ok) throw new Error("Fichier database.json introuvable");
        db = await resp.json();
        
        document.getElementById('loader').classList.add('hidden');
        document.getElementById('game-ui').classList.remove('hidden');
        newRound();
    } catch (e) {
        console.error(e);
        alert("Erreur : Assure-toi que database.json est bien dans le même dossier et que tu utilises Live Server.");
    }
}

// Lancement d'un nouveau Round
function newRound() {
    // Sélection aléatoire d'une thèse
    currentThesis = db[Math.floor(Math.random() * db.length)];
    
    // Affichage du résumé (abstract)
    document.getElementById('abstract-text').innerText = currentThesis.abstract || "Résumé indisponible pour cette thèse.";
    
    // Affichage des compteurs indicatifs
    document.getElementById('page-count').innerText = currentThesis.pages || "??";
    document.getElementById('ref-count').innerText = currentThesis.pages ? Math.floor(currentThesis.pages * 0.6) : "??";
    
    // Réinitialisation de l'interface utilisateur
    selectedED = null; 
    selectedKWs = [];
    document.getElementById('year-slider').value = 2000;
    document.getElementById('year-display').innerText = "2000";
    document.getElementById('result-overlay').classList.add('hidden');
    document.getElementById('next-btn').classList.add('hidden');
    document.getElementById('validate-btn').classList.remove('hidden');

    // --- Génération du QCM École Doctorale ---
    const edGrid = document.getElementById('ed-grid');
    edGrid.innerHTML = "";
    
    // On crée une liste de 4 choix : la bonne réponse + 3 aléatoires
    let eds = [currentThesis.ed];
    while(eds.length < 4) {
        let randomED = db[Math.floor(Math.random() * db.length)].ed;
        if(randomED && !eds.includes(randomED)) {
            eds.push(randomED);
        }
    }
    
    // Mélange et création des boutons
    eds.sort(() => Math.random() - 0.5).forEach(ed => {
        const b = document.createElement('button');
        b.className = "choice-btn";
        b.innerText = ed;
        b.onclick = () => {
            document.querySelectorAll('#ed-grid .choice-btn').forEach(x => x.classList.remove('selected'));
            b.classList.add('selected');
            selectedED = ed;
        };
        edGrid.appendChild(b);
    });

    // --- Génération des Mots-clés (Keywords) ---
    const kwGrid = document.getElementById('kw-grid');
    kwGrid.innerHTML = "";
    
    const thesisKeywords = currentThesis.keywords || [];
    let correctOnes = thesisKeywords.slice(0, 3); // On en prend jusqu'à 3 vrais
    
    // Liste de faux mots-clés pour compléter
    let fakePool = ["Intelligence Artificielle", "Blockchain", "Moyen-Âge", "Nanostructures", "Droit comparé", "Chimie organique", "Sociologie du travail"];
    let kwChoices = [...correctOnes];
    
    // On complète jusqu'à 6 options
    while(kwChoices.length < 6) {
        let fake = fakePool[Math.floor(Math.random() * fakePool.length)];
        if(!kwChoices.includes(fake)) kwChoices.push(fake);
    }

    kwChoices.sort(() => Math.random() - 0.5).forEach(kw => {
        const b = document.createElement('button');
        b.className = "choice-btn";
        b.innerText = kw;
        b.onclick = () => {
            b.classList.toggle('selected');
            if(b.classList.contains('selected')) {
                selectedKWs.push(kw);
            } else {
                selectedKWs = selectedKWs.filter(x => x !== kw);
            }
        };
        kwGrid.appendChild(b);
    });
}

// Mise à jour de l'affichage du slider en temps réel
document.getElementById('year-slider').oninput = (e) => {
    document.getElementById('year-display').innerText = e.target.value;
};

// Validation des réponses et calcul du score
document.getElementById('validate-btn').onclick = () => {
    let roundPoints = 0;
    
    // 1. Calcul Score Année (Max 2500 pts)
    // Formule de décroissance du score : plus on est loin, moins on a de points
    const userYear = parseInt(document.getElementById('year-slider').value);
    const diff = Math.abs(userYear - currentThesis.annee);
    roundPoints += Math.max(0, 2500 - (diff * 125)); // -125 pts par année d'écart

    // 2. Calcul Score École Doctorale (Max 1250 pts)
    if(selectedED === currentThesis.ed) {
        roundPoints += 1250;
    }

    // 3. Calcul Score Mots-clés (Max 1250 pts)
    const thesisKeywords = currentThesis.keywords || [];
    const correctFound = selectedKWs.filter(k => thesisKeywords.includes(k)).length;
    const nbToFind = Math.min(thesisKeywords.length, 3); // On cherche max 3
    
    if(nbToFind > 0) {
        roundPoints += (correctFound / nbToFind) * 1250;
    }

    // Mise à jour du score total
    totalScore += Math.round(roundPoints);
    document.getElementById('score-val').innerText = totalScore;
    
    // Affichage des résultats du round
    document.getElementById('round-points').innerText = `+ ${Math.round(roundPoints)} pts`;
    document.getElementById('correction-details').innerHTML = `
        <p>Année réelle : <strong>${currentThesis.annee}</strong></p>
        <p>École Doctorale : <strong>${currentThesis.ed}</strong></p>
        <p>Mots-clés : <em>${thesisKeywords.join(', ') || 'Aucun'}</em></p>
    `;
    
    document.getElementById('result-overlay').classList.remove('hidden');
    document.getElementById('validate-btn').classList.add('hidden');
    document.getElementById('next-btn').classList.remove('hidden');
};

// Passage au round suivant ou fin de partie
document.getElementById('next-btn').onclick = () => {
    if(round < totalRounds) {
        round++;
        document.getElementById('current-round').innerText = round;
        newRound();
    } else {
        alert(`🎮 Partie terminée !\nScore Final : ${totalScore} / ${totalRounds * 5000} points.`);
        location.reload(); // Recommencer
    }
};

// Lancement du jeu au chargement de la page
init();
