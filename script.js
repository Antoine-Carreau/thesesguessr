let db = [];
let current = null;
let score = 0;
let round = 1;
let userChoices = { etab: null, discipline: null, kws: [] };

document.addEventListener('DOMContentLoaded', init);

async function init() {
    try {
        const resp = await fetch('database.json');
        db = await resp.json();
        db.sort(() => Math.random() - 0.5);
        document.getElementById('loader').classList.add('hidden');
        document.getElementById('game-ui').classList.remove('hidden');
        newRound();
    } catch (e) { console.error("Erreur base"); }
}

function newRound() {
    current = db[Math.floor(Math.random() * db.length)];
    userChoices = { etab: null, discipline: null, kws: [] };

    document.getElementById('abstract-text').innerText = current.abstract;
    document.getElementById('round-num').innerText = round;
    document.getElementById('year-slider').value = 2000;
    document.getElementById('year-label').innerText = "2000";
    document.getElementById('preview-container').classList.add('hidden');
    
    // Reset feedbacks
    document.querySelectorAll('.correction-inline').forEach(el => el.innerText = "");
    document.querySelectorAll('.question-block').forEach(el => {
        el.style.background = "transparent";
        el.classList.remove('shake-it');
    });
    
    generateQCM('etab-grid', current.etab, 'etab');
    generateQCM('discipline-grid', current.discipline, 'discipline');
    generateKeywords();

    document.getElementById('validate-btn').classList.remove('hidden');
    document.getElementById('next-btn').classList.add('hidden');
    document.getElementById('link-theses').classList.add('hidden');
}

function generateQCM(targetId, correctValue, type) {
    const grid = document.getElementById(targetId);
    grid.innerHTML = "";
    let pool = [correctValue];
    while(pool.length < 4) {
        let r = db[Math.floor(Math.random()*db.length)][type];
        if(r && !pool.includes(r)) pool.push(r);
    }
    pool.sort(() => Math.random() - 0.5).forEach(val => {
        const btn = document.createElement('button');
        btn.className = "choice-btn";
        btn.innerText = val;
        btn.onclick = () => {
            document.querySelectorAll(`#${targetId} .choice-btn`).forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            userChoices[type] = val;
        };
        grid.appendChild(btn);
    });
}

function generateKeywords() {
    const grid = document.getElementById('kw-grid');
    grid.innerHTML = "";
    const correct = (current.keywords || []).slice(0, 2);
    let pool = [...correct, "Intelligence Artificielle", "Sociologie", "Droit Civil", "Biologie"].sort(() => Math.random() - 0.5);
    pool.forEach(kw => {
        const btn = document.createElement('button');
        btn.className = "choice-btn kw-btn";
        btn.innerText = kw;
        btn.onclick = () => {
            btn.classList.toggle('selected');
            if(btn.classList.contains('selected')) userChoices.kws.push(kw);
            else userChoices.kws = userChoices.kws.filter(x => x !== kw);
        };
        grid.appendChild(btn);
    });
}

document.getElementById('year-slider').oninput = (e) => document.getElementById('year-label').innerText = e.target.value;

document.getElementById('validate-btn').onclick = () => {
    let roundPoints = 0;

    // 1. ANNEE
    const yearDiff = Math.abs(document.getElementById('year-slider').value - current.annee);
    const yearPts = Math.max(0, 2000 - (yearDiff * 100));
    roundPoints += yearPts;
    applyFeedback('block-year', 'corr-year', `Vraie année : ${current.annee} (+${yearPts} pts)`, yearDiff === 0);

    // 2. DISCIPLINE
    const discCorrect = userChoices.discipline === current.discipline;
    const discPts = discCorrect ? 1000 : 0;
    roundPoints += discPts;
    applyFeedback('block-discipline', 'corr-discipline', `Réponse : ${current.discipline} (+${discPts} pts)`, discCorrect);

    // 3. ETABLISSEMENT
    const etabCorrect = userChoices.etab === current.etab;
    const etabPts = etabCorrect ? 1000 : 0;
    roundPoints += etabPts;
    applyFeedback('block-etab', 'corr-etab', `Réponse : ${current.etab} (+${etabPts} pts)`, etabCorrect);

    // 4. MOTS-CLES AVANCE
    let kwPts = 0;
    const kwBtns = document.querySelectorAll('#kw-grid .choice-btn');
    kwBtns.forEach(btn => {
        const val = btn.innerText;
        const isCorrect = current.keywords.includes(val);
        const isSelected = btn.classList.contains('selected');

        if(isSelected && isCorrect) { btn.classList.add('kw-correct-selected'); kwPts += 500; }
        else if(isSelected && !isCorrect) { btn.classList.add('kw-wrong-selected'); kwPts -= 250; }
        else if(!isSelected && isCorrect) { btn.classList.add('kw-missed'); }
    });
    kwPts = Math.max(0, Math.min(1000, kwPts));
    roundPoints += kwPts;
    applyFeedback('block-kw', 'corr-kw', `Mots-clés identifiés (+${kwPts} pts)`, kwPts > 0);

    // MISE À JOUR SCORE
    score += roundPoints;
    animatePoints(roundPoints);

    document.getElementById('validate-btn').classList.add('hidden');
    document.getElementById('next-btn').classList.remove('hidden');
    
    if(current.nnt) {
        const link = document.getElementById('link-theses');
        link.href = `https://theses.fr/${current.nnt}`;
        link.classList.remove('hidden');
        document.getElementById('preview-container').classList.remove('hidden');
        document.getElementById('theses-preview-content').innerHTML = `<strong>${current.titre}</strong><br>Soutenue en ${current.annee} à ${current.etab}`;
    }
};

function applyFeedback(blockId, corrId, text, isCorrect) {
    const block = document.getElementById(blockId);
    const corr = document.getElementById(corrId);
    corr.innerText = text;
    if(!isCorrect) {
        block.classList.add('shake-it');
        block.style.background = "rgba(231, 76, 60, 0.15)";
    } else {
        block.style.background = "rgba(45, 204, 112, 0.15)";
    }
}


function animatePoints(pts) {
    const anim = document.getElementById('points-anim');
    anim.innerText = `+${pts}`;
    anim.classList.add('animate__animated', 'animate__backInUp');
    setTimeout(() => {
        document.getElementById('score-total').innerText = score;
        setTimeout(() => anim.classList.remove('animate__animated', 'animate__backInUp'), 500);
    }, 600);
}

document.getElementById('next-btn').onclick = () => {
    if(round < 5) { round++; newRound(); }
    else { alert(`Partie Terminée ! Score Final : ${score}/25000`); location.reload(); }
};
