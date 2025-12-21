let correctYear = 0;

async function fetchThesis() {
    const loadBtn = document.getElementById('load-btn');
    const feedback = document.getElementById('feedback');
    const gameArea = document.getElementById('game-area');
    
    loadBtn.innerText = "Recherche...";
    feedback.innerText = "";
    
    try {
        // Nouvelle API theses.fr
        // On demande 1 résultat à un index aléatoire
        const randomStart = Math.floor(Math.random() * 1000);
        const url = `https://theses.fr/api/v1/theses/recherche/?q=resumes.fr:*&nombre=1&debut=${randomStart}`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Erreur API');
        
        const data = await response.json();
        const thesis = data.items[0]; // La liste des thèses est dans 'items'

        // On extrait l'année et le résumé
        correctYear = parseInt(thesis.dateSoutenance.split('-')[0]);
        document.getElementById('abstract-text').innerText = thesis.resumes[0].texte;
        
        gameArea.style.display = "block";
    } catch (error) {
        feedback.innerText = "Impossible de charger les données. Réessaie !";
        console.error(error);
    } finally {
        loadBtn.innerText = "Autre thèse au hasard";
    }
}

document.getElementById('load-btn').onclick = fetchThesis;

document.getElementById('check-btn').onclick = () => {
    const guess = parseInt(document.getElementById('guess-input').value);
    const fb = document.getElementById('feedback');
    if (guess === correctYear) {
        fb.innerHTML = "🏆 Bravo ! C'était bien en " + correctYear;
        fb.style.color = "green";
    } else {
        fb.innerHTML = "❌ Dommage ! C'était en " + correctYear;
        fb.style.color = "red";
    }
};
