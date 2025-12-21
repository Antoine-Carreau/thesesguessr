let correctYear = 0;
const loadBtn = document.getElementById('load-btn');
const checkBtn = document.getElementById('check-btn');
const gameArea = document.getElementById('game-area');
const feedback = document.getElementById('feedback');
const abstractText = document.getElementById('abstract-text');
const guessInput = document.getElementById('guess-input');

// On utilise un proxy pour éviter l'erreur de connexion (CORS)
const PROXY_URL = "https://api.allorigins.win/get?url=";

loadBtn.onclick = async () => {
    loadBtn.innerText = "Recherche en cours...";
    loadBtn.disabled = true;
    feedback.innerText = "";
    guessInput.value = "";
    gameArea.classList.add('hidden');
    
    try {
        const randomStart = Math.floor(Math.random() * 2000);
        // On demande l'URL via le proxy
        const targetUrl = `https://theses.fr/api/v1/theses/recherche/?q=resumes.fr:*&nombre=1&debut=${randomStart}`;
        
        const response = await fetch(PROXY_URL + encodeURIComponent(targetUrl));
        const dataProxy = await response.json();
        
        // Les données réelles sont dans dataProxy.contents (format texte JSON)
        const data = JSON.parse(dataProxy.contents);
        const thesis = data.items[0];

        if (thesis && thesis.resumes && thesis.resumes[0]) {
            correctYear = parseInt(thesis.dateSoutenance.split('-')[0]);
            abstractText.innerText = thesis.resumes[0].texte;
            gameArea.classList.remove('hidden');
        } else {
            throw new Error("Données incomplètes");
        }

    } catch (e) {
        console.error(e);
        alert("Erreur de connexion à l'API via le proxy. Réessaie !");
    } finally {
        loadBtn.innerText = "Autre thèse au hasard";
        loadBtn.disabled = false;
    }
};

checkBtn.onclick = () => {
    const userGuess = parseInt(guessInput.value);
    if (isNaN(userGuess)) return;

    const diff = Math.abs(userGuess - correctYear);

    if (diff === 0) {
        feedback.innerHTML = "🏆 Bravo ! C'est l'année exacte.";
        feedback.style.color = "green";
    } else if (diff <= 2) {
        feedback.innerHTML = `🔥 Très proche ! C'était en ${correctYear}.`;
        feedback.style.color = "orange";
    } else {
        feedback.innerHTML = `❄️ Froid ! C'était en ${correctYear}.`;
        feedback.style.color = "red";
    }
};