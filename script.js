let db = [];
let currentThesis = null;
let score = 0;
let round = 1;
let selectedED = null;
let selectedKWs = [];

async function init() {
    try {
        const resp = await fetch('database.json');
        if (!resp.ok) throw new Error("HTTP error " + resp.status);
        db = await resp.json();
        
        db.sort(() => Math.random() - 0.5); 
        
        document.getElementById('loader').classList.add('hidden');
        document.getElementById('game-ui').classList.remove('hidden');
        newRound();
    } catch (e) {
        console.error("Erreur de chargement:", e);
        document.querySelector('#loader p').innerText = "Erreur de chargement de database.json";
    }
}

function newRound() {
    currentThesis = db[Math.floor(Math.random() * db.length)];
    
    // Remplissage texte et stats
    document.getElementById('abstract-text').innerText = currentThesis.abstract;
    document.getElementById('page-count').innerText = currentThesis.pages || "180";
    document.getElementById('ref-count').innerText = Math.floor((currentThesis.pages || 180) * 0.6);
    
    // Reset UI
    selectedED = null;
    selectedKWs = [];
    roundPoints = 0;
    document.getElementById('round-num').innerText = round;
    document.getElementById('year-slider').value = 2000;
    document.getElementById('year-label').innerText = "2000";
    document.getElementById('correction').classList.add('hidden');
    document.getElementById('validate-btn').classList.remove('hidden');
    document.getElementById('next-btn').classList.add('hidden');

    // École Doctorale
    const edGrid = document.getElementById('ed-grid');
    edGrid.innerHTML = "";
    let eds = [currentThesis.ed];
    while(eds.length < 4) {
        let r = db[Math.floor(Math.random() * db.length)].ed;
        if(r && !eds.includes(r)) eds.push(r);
    }
    eds.sort().forEach(ed => {
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

    // Mots-clés
    const kwGrid = document.getElementById('kw-grid');
    kwGrid.innerHTML = "";
    const thesisKWs = currentThesis.keywords || [];
    let correctOnes = thesisKWs.slice(0, 2);
    let pool = [...correctOnes, "IA", "Sociologie", "Droit", "Biologie"].sort(() => Math.random() - 0.5);
    
    pool.forEach(kw => {
        const b = document.createElement('button');
        b.className = "choice-btn";
        b.innerText = kw;
        b.onclick = () => {
            b.classList.toggle('selected');
            if(b.classList.contains('selected')) selectedKWs.push(kw);
            else selectedKWs = selectedKWs.filter(x => x !== kw);
        };
        kwGrid.appendChild(b);
    });
}

// Mise à jour de l'affichage de l'année
document.getElementById('year-slider').addEventListener('input', (e) => {
    document.getElementById('year-label').innerText = e.target.value;
});

// Validation
document.getElementById('validate-btn').onclick = () => {
    let rPoints = 0;
    const yearGuess = parseInt(document.getElementById('year-slider').value);
    
    // Année (2500 max)
    const diff = Math.abs(yearGuess - currentThesis.annee);
    rPoints += Math.max(0, 2500 - (diff * 125));

    // ED (1250 max)
    if(selectedED === currentThesis.ed) rPoints += 1250;

    // KWs (1250 max)
    const correctFound = selectedKWs.filter(k => currentThesis.keywords.includes(k)).length;
    rPoints += (correctFound > 0) ? 1250 : 0;

    score += Math.round(rPoints);
    document.getElementById('score-total').innerText = score;
    
    const corr = document.getElementById('correction');
    corr.innerHTML = `<strong>Réponse :</strong> Année ${currentThesis.annee}, ED : ${currentThesis.ed}`;
    corr.classList.remove('hidden');
    
    document.getElementById('validate-btn').classList.add('hidden');
    document.getElementById('next-btn').classList.remove('hidden');
};

document.getElementById('next-btn').onclick = () => {
    if(round < 5) { round++; newRound(); }
    else { alert("Score final : " + score); location.reload(); }
};

init();
