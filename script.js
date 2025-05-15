document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const gameBoard = document.getElementById('game-board');
    const startButton = document.getElementById('start-button');
    const levelDisplay = document.getElementById('level-display');
    const scoreDisplay = document.getElementById('score-display');
    const messageDisplay = document.getElementById('message-display');
    
    // Metric Elements
    const maxLevelDisplay = document.getElementById('max-level');
    const bestScoreDisplay = document.getElementById('best-score');
    const gamesPlayedDisplay = document.getElementById('games-played');
    const factDisplay = document.getElementById('fact');

    // Game variables
    const colors = [
        '#61dafb', // Turquoise
        '#B19CD9', // Lavender
        '#FF7F50', // Coral
        '#FFEB3B'  // Yellow
    ];
    let sequence = [];
    let playerSequence = [];
    let level = 1;
    let score = 0;
    let canPlayerClick = false;
    let gameStarted = false;
    
    // Metrics variables
    let maxLevel = 0;
    let bestScore = 0;
    let gamesPlayed = 0;
    
    // Facts about memory training
    const facts = [
        "Regular memory training can delay age-related cognitive changes by 7-14 years.",
        "The adult brain can create new neural connections even in old age.",
        "15 minutes of memory training per day can improve concentration by 30%.",
        "The sequences you memorize in this game activate working memory — a key component of intelligence.",
        "Sequence memory games are particularly effective for improving memory in children.",
        "Musicians perform better in sequence memory games due to their auditory memory training.",
        "With regular training, working memory capacity can increase by 15-20%.",
        "Memorizing color sequences activates both hemispheres of the brain."
    ];

    // Initialize game
    createShapes();
    loadMetrics();
    showRandomFact();

    // Event listeners
    startButton.addEventListener('click', startGame);

    // Game functions
    function startGame() {
        gameStarted = true;
        level = 1;
        score = 0;
        sequence = [];
        playerSequence = [];
        startButton.innerHTML = '<i class="fas fa-redo-alt"></i> Restart';
        updateLevelDisplay();
        updateScoreDisplay();
        messageDisplay.textContent = 'Game started!';
        
        // Update games played
        gamesPlayed++;
        updateMetricsDisplay();
        saveMetrics();
        
        nextLevel();
    }

    function nextLevel() {
        level++;
        updateLevelDisplay();
        playerSequence = [];
        
        // Update max level if current level is higher
        if (level - 1 > maxLevel) {
            maxLevel = level - 1;
            updateMetricsDisplay();
            saveMetrics();
        }
        
        // Add a new random color to the sequence
        const randomColorIndex = Math.floor(Math.random() * colors.length);
        sequence.push(randomColorIndex);
        
        // Show the sequence to the player after a slight delay
        setTimeout(() => {
            showSequence();
        }, 1000);
    }

    function showSequence() {
        canPlayerClick = false;
        messageDisplay.innerHTML = '<i class="fas fa-eye"></i> Remember the sequence...';
        
        // Display the sequence with delays between each step
        let i = 0;
        const intervalId = setInterval(() => {
            const shapeIndex = sequence[i];
            const shape = document.querySelector(`[data-index="${shapeIndex}"]`);
            
            highlightShape(shape);
            
            i++;
            if (i >= sequence.length) {
                clearInterval(intervalId);
                
                // After showing the sequence, allow player to click
                setTimeout(() => {
                    canPlayerClick = true;
                    messageDisplay.innerHTML = '<i class="fas fa-hand-pointer"></i> Your turn!';
                }, 1000);
            }
        }, 1000);
    }

    function handleShapeClick(event) {
        if (!canPlayerClick || !gameStarted) return;
        
        const clickedShape = event.target;
        const clickedIndex = parseInt(clickedShape.getAttribute('data-index'));
        
        playerSequence.push(clickedIndex);
        
        // Check if the current click matches the sequence
        const currentIndex = playerSequence.length - 1;
        
        if (playerSequence[currentIndex] === sequence[currentIndex]) {
            // Correct click
            highlightShape(clickedShape, 'correct');
            
            // If player completed the full sequence
            if (playerSequence.length === sequence.length) {
                score += level * 10;
                updateScoreDisplay();
                
                // Update best score if current score is higher
                if (score > bestScore) {
                    bestScore = score;
                    updateMetricsDisplay();
                    saveMetrics();
                }
                
                canPlayerClick = false;
                messageDisplay.innerHTML = '<i class="fas fa-check-circle"></i> Excellent! Moving to the next level...';
                
                setTimeout(() => {
                    nextLevel();
                }, 1500);
            }
        } else {
            // Incorrect click
            highlightShape(clickedShape, 'wrong');
            canPlayerClick = false;
            messageDisplay.innerHTML = '<i class="fas fa-times-circle"></i> Error! Game over. Press "Restart" to play again.';
            showCorrectSequence();
        }
    }

    function showCorrectSequence() {
        // Show the correct sequence after player makes a mistake
        sequence.forEach((colorIndex, i) => {
            setTimeout(() => {
                const shape = document.querySelector(`[data-index="${colorIndex}"]`);
                highlightShape(shape);
            }, i * 1000 + 1500);
        });
    }

    function createShapes() {
        gameBoard.innerHTML = '';
        
        for (let i = 0; i < colors.length; i++) {
            const shape = document.createElement('div');
            shape.className = 'shape';
            shape.style.backgroundColor = colors[i];
            shape.setAttribute('data-index', i);
            
            shape.addEventListener('click', handleShapeClick);
            gameBoard.appendChild(shape);
        }
    }

    function highlightShape(shape, type = 'active') {
        const originalColor = shape.style.backgroundColor;
        
        // Add the appropriate class for highlighting
        shape.classList.add(type);
        
        // Remove the class after a short delay
        setTimeout(() => {
            shape.classList.remove(type);
        }, 500);
    }

    function updateLevelDisplay() {
        levelDisplay.innerHTML = `<i class="fas fa-layer-group"></i> Level: ${level - 1}`;
    }

    function updateScoreDisplay() {
        scoreDisplay.innerHTML = `<i class="fas fa-star"></i> Score: ${score}`;
    }
    
    // Metrics functions
    function updateMetricsDisplay() {
        maxLevelDisplay.textContent = maxLevel;
        bestScoreDisplay.textContent = bestScore;
        gamesPlayedDisplay.textContent = gamesPlayed;
    }
    
    function saveMetrics() {
        const metrics = {
            maxLevel,
            bestScore,
            gamesPlayed
        };
        localStorage.setItem('colorSyncMetrics', JSON.stringify(metrics));
    }
    
    function loadMetrics() {
        const savedMetrics = localStorage.getItem('colorSyncMetrics');
        if (savedMetrics) {
            const metrics = JSON.parse(savedMetrics);
            maxLevel = metrics.maxLevel || 0;
            bestScore = metrics.bestScore || 0;
            gamesPlayed = metrics.gamesPlayed || 0;
            updateMetricsDisplay();
        }
    }
    
    function showRandomFact() {
        const randomIndex = Math.floor(Math.random() * facts.length);
        factDisplay.textContent = facts[randomIndex];
        
        // Change fact every 20 seconds
        setInterval(() => {
            const newIndex = Math.floor(Math.random() * facts.length);
            factDisplay.textContent = facts[newIndex];
        }, 20000);
    }
}); 