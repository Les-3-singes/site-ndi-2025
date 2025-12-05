# Site de Sensibilisation aux GAFAM

Site web de la nuit de l'info, interactif visant à sensibiliser aux problématiques liées aux GAFAM (Google, Apple, Facebook, Amazon, Microsoft) et à promouvoir les alternatives libres telles que Linux.
Réalisé par l'équipe des 3 singes 

## Fonctionnalités

- Section Hero avec animations
- Section d'information sur les GAFAM et leurs pratiques
- Quiz interactif de 6 questions
- VM Windows simulée (expérience immersive)
- Jeu Snake intégré dans la VM
- Design responsive compatible mobile/tablette

## Technologies Utilisées

### Backend
- Node.js
- Express.js
- Helmet
- Compression (gzip)

### Frontend
- HTML5
- CSS3 (vanilla)
- JavaScript (vanilla)

## Structure du Projet

```
site/
├── server.js              # Serveur Express
├── package.json           # Dépendances npm
├── public/
│   ├── index.html         # Page principale
│   ├── css/
│   │   └── style.css      # Styles
│   └── js/
│       ├── main.js        # Fonctions générales et animations
│       ├── quiz.js        # Logique du quiz
│       ├── vm.js          # Gestion de la VM Windows
│       └── snake.js       # Jeu Snake
└── mockup/                # Maquette React/Tailwind (référence)
```

## Installation

1. Installer les dépendances :
   npm install

2. Démarrer le serveur :
   npm start

3. Accéder au site :
   http://localhost:3000
   ou 
   https://ndi.0v41n.fr/

## Sécurités Implémentées

- Helmet pour la protection contre les vulnérabilités courantes
- Content Security Policy pour réduire les risques XSS
- Limitation de taille des requêtes (protection DoS)
- Compression gzip
- Gestion personnalisée des erreurs

## Utilisation

### Navigation
- Défilement naturel ou via bouton de scroll

### Quiz
- Sélection d'une réponse pour afficher l'explication
- Progression sur 6 questions
- Faits et informations affichés au fur et à mesure

### VM Windows
1. Connexion (mot de passe libre)
2. Apparition de popups simulant les désagréments classiques
3. Accès au jeu Snake via une popup
4. Contrôles via les flèches du clavier

## Caractéristiques Techniques

### Animations CSS
- Fade-in au chargement
- Effets slide-in lors du scroll (Intersection Observer)
- Transitions fluides

### Quiz Dynamique
- Questions configurables
- Retour visuel immédiat
- Indicateur de progression
- Explications détaillées

### VM Interactive
- Écran de connexion
- Bureau Windows simulé
- Popups temporisées
- Jeu Snake intégré
- Mode plein écran

### Jeu Snake
- Canvas HTML5
- Contrôles clavier
- Système de score
- Détection de collision
- Possibilité de recommencer

## Compatibilité

- Chrome / Edge
- Firefox
- Safari
- Affichage responsive

## Notes de Développement

- Code 100% vanilla (sans frameworks)
- Architecture modulaire
- Commentaires explicites
- Séparation claire HTML / CSS / JS
- Performances optimisées

## Objectif du Projet

Sensibiliser le public :
- à la protection de la vie privée
- aux logiciels libres
- à Linux et aux alternatives open-source
- à la souveraineté numérique

## Licence

MIT
