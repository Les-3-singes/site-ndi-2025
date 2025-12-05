// ===================================
// QUIZ DATA
// ===================================

const quizQuestions = [
    {
        question: "Selon vous, quelle est la durée de vie moyenne d'un ordinateur sous Windows ?",
        options: [
            {
                text: "10 ans",
                isCorrect: false,
                explanation: "L'obsolescence programmée limite souvent la durée à moins de 5 ans."
            },
            {
                text: "3-5 ans",
                isCorrect: true,
                explanation: "Correct ! Les mises à jour de Windows rendent souvent les anciennes machines inutilisables, alors qu'elles pourraient fonctionner des années avec Linux."
            },
            {
                text: "15 ans",
                isCorrect: false,
                explanation: "Malheureusement, les systèmes propriétaires forcent le renouvellement bien avant."
            }
        ]
    },
    {
        question: "Combien de fois par jour vos données sont-elles vendues à des tiers ?",
        options: [
            {
                text: "Jamais",
                isCorrect: false,
                explanation: "Faux. Vos données sont constamment partagées avec des milliers d'entreprises tierces."
            },
            {
                text: "1-2 fois",
                isCorrect: false,
                explanation: "Bien plus ! Chaque interaction génère des dizaines de transmissions."
            },
            {
                text: "Des centaines de fois",
                isCorrect: true,
                explanation: "Exact ! Chaque clic, recherche ou like alimente un écosystème publicitaire massif."
            }
        ]
    },
    {
        question: "Quelle est l'empreinte carbone annuelle des datacenters des GAFAM ?",
        options: [
            {
                text: "Équivalent à un petit pays",
                isCorrect: true,
                explanation: "Correct ! Les datacenters consomment autant d'énergie que des pays entiers. L'infrastructure cloud a un coût environnemental énorme."
            },
            {
                text: "Négligeable",
                isCorrect: false,
                explanation: "Loin de là. Les datacenters sont parmi les plus gros consommateurs d'énergie au monde."
            },
            {
                text: "Équivalent à 100 voitures",
                isCorrect: false,
                explanation: "C'est bien plus : des millions de serveurs fonctionnent 24h/24."
            }
        ]
    },
    {
        question: "Qu'est-ce que le 'travail caché du clic' ?",
        options: [
            {
                text: "Des virus cachés",
                isCorrect: false,
                explanation: "Non, c'est plus subtil. Il s'agit du travail humain invisible derrière vos interactions."
            },
            {
                text: "La modération de contenu par des humains sous-payés",
                isCorrect: true,
                explanation: "Exact ! Derrière l'IA, des milliers de travailleurs mal payés modèrent contenus violents et traumatisants."
            },
            {
                text: "Des publicités cachées",
                isCorrect: false,
                explanation: "C'est plus grave : il s'agit d'exploitation humaine réelle."
            }
        ]
    },
    {
        question: "Quelle alternative européenne vise à concurrencer le cloud des GAFAM ?",
        options: [
            {
                text: "CloudEU",
                isCorrect: false,
                explanation: "Non, le projet s'appelle Gaia-X."
            },
            {
                text: "Gaia-X",
                isCorrect: true,
                explanation: "Correct ! Gaia-X est le projet européen de cloud souverain pour réduire la dépendance aux GAFAM."
            },
            {
                text: "EuroCloud",
                isCorrect: false,
                explanation: "Le nom est Gaia-X, un projet ambitieux de souveraineté numérique."
            }
        ]
    },
    {
        question: "Combien d'appareils sont jetés chaque année à cause de l'obsolescence programmée ?",
        options: [
            {
                text: "50 millions",
                isCorrect: false,
                explanation: "Bien plus ! Les chiffres sont alarmants."
            },
            {
                text: "Plus de 50 millions de tonnes",
                isCorrect: true,
                explanation: "Exact ! Les déchets électroniques explosent, en grande partie à cause de systèmes qui deviennent 'obsolètes' artificiellement."
            },
            {
                text: "1 million",
                isCorrect: false,
                explanation: "Malheureusement, c'est des dizaines de millions de tonnes."
            }
        ]
    }
];

// ===================================
// QUIZ STATE
// ===================================

let currentQuestionIndex = 0;
let selectedOptionIndex = null;
let showingExplanation = false;

// ===================================
// QUIZ FUNCTIONS
// ===================================

function initQuiz() {
    renderQuestion();
    renderProgressDots();
    updateProgress();
}

function renderQuestion() {
    const quizContent = document.getElementById('quiz-content');
    const question = quizQuestions[currentQuestionIndex];

    quizContent.innerHTML = '';

    // Question title
    const questionTitle = createElement('h3', 'quiz-question', question.question);
    quizContent.appendChild(questionTitle);

    // Options container
    const optionsContainer = createElement('div', 'quiz-options');

    question.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'quiz-option';
        button.innerHTML = `<span>${option.text}</span>`;
        button.onclick = () => handleOptionClick(index);
        optionsContainer.appendChild(button);
    });

    quizContent.appendChild(optionsContainer);
}

function handleOptionClick(optionIndex) {
    if (showingExplanation) return;

    selectedOptionIndex = optionIndex;
    showingExplanation = true;

    const question = quizQuestions[currentQuestionIndex];
    const options = document.querySelectorAll('.quiz-option');

    // Update option styles
    options.forEach((option, index) => {
        option.disabled = true;

        if (index === optionIndex) {
            if (question.options[index].isCorrect) {
                option.classList.add('correct');
                option.innerHTML = `<span>${question.options[index].text}</span>`;
                option.appendChild(createSVG('check'));
            } else {
                option.classList.add('incorrect');
                option.innerHTML = `<span>${question.options[index].text}</span>`;
                option.appendChild(createSVG('cross'));
            }
        } else {
            option.classList.add('dimmed');
        }
    });

    // Show explanation
    showExplanation(question.options[optionIndex].explanation);
}

function showExplanation(explanation) {
    const quizContent = document.getElementById('quiz-content');

    const explanationDiv = createElement('div', 'quiz-explanation');

    const explanationText = createElement('p', '', explanation);
    explanationDiv.appendChild(explanationText);

    const nextButton = document.createElement('button');
    nextButton.className = 'quiz-next-btn';
    nextButton.onclick = handleNext;

    if (currentQuestionIndex < quizQuestions.length - 1) {
        nextButton.textContent = 'Question suivante ';
        nextButton.appendChild(createSVG('arrow'));
    } else {
        nextButton.textContent = 'Découvrir la VM Windows ';
        nextButton.appendChild(createSVG('arrow'));
    }

    explanationDiv.appendChild(nextButton);
    quizContent.appendChild(explanationDiv);
}

function handleNext() {
    if (currentQuestionIndex < quizQuestions.length - 1) {
        currentQuestionIndex++;
        selectedOptionIndex = null;
        showingExplanation = false;
        renderQuestion();
        updateProgress();
        updateProgressDots();
    } else {
        // Scroll to VM section
        scrollToSection('windows-vm');
    }
}

function updateProgress() {
    document.getElementById('current-question').textContent = currentQuestionIndex + 1;
    document.getElementById('total-questions').textContent = quizQuestions.length;
}

function renderProgressDots() {
    const dotsContainer = document.querySelector('.quiz-dots');
    dotsContainer.innerHTML = '';

    quizQuestions.forEach((_, index) => {
        const dot = createElement('div', 'quiz-dot');
        if (index === 0) dot.classList.add('active');
        dotsContainer.appendChild(dot);
    });
}

function updateProgressDots() {
    const dots = document.querySelectorAll('.quiz-dot');

    dots.forEach((dot, index) => {
        dot.classList.remove('active', 'completed');

        if (index < currentQuestionIndex) {
            dot.classList.add('completed');
        } else if (index === currentQuestionIndex) {
            dot.classList.add('active');
        }
    });
}

// ===================================
// INITIALIZE QUIZ ON LOAD
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    initQuiz();
});
