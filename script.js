let correctYear = 0;

async function fetchThesis() {
    const loadBtn = document.getElementById('load-btn');
    const gameArea = document.getElementById('game-area');
    const abstractText = document.getElementById('abstract-text');
    
    loadBtn.innerText = "Recherche...";
    
    try {
        // Utilisation de la nouvelle route API v1 stable
        const randomStart = Math.floor(Math.random() * 500);
        const url = `https://theses.fr/api/v1/theses/recherche/?q=resumes.fr:*&nombre=1&debut=${randomStart}`;
        
        const response = await fetch(url);
        const data = await response.json();

        // Vérification de sécurité pour éviter l'erreur de ta console
        if (data && data.items && data.items.length > 0) {
            const thesis = data.items[0];
            correctYear = parseInt(thesis.dateSoutenance.split('-')[0]);
            abstractText.innerText = thesis.resumes[0].texte;
            gameArea.style.display = "block";
        } else {
            alert("Aucune thèse trouvée à cet index, réessaie !");
        }
    } catch (error) {
        console.error("Erreur détaillée :", error);
        alert("Connexion impossible. Vérifie que tu es bien en HTTPS sur GitHub.");
    } finally {
        loadBtn.innerText = "Autre thèse au hasard";
    }
}

document.getElementById('load-btn').onclick = fetchThesis;
