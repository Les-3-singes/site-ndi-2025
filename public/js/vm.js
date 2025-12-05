// ===================================
// VM STATE
// ===================================

let isLoggedIn = false;
let isFullscreen = false;
let popupTimers = [];

// ===================================
// VM LOGIN
// ===================================

function handleLogin(event) {
    event.preventDefault();
    event.stopPropagation();

    console.log('Login button clicked!');

    isLoggedIn = true;

    // Hide login screen
    const loginScreen = document.getElementById('vm-login');
    if (loginScreen) {
        loginScreen.style.display = 'none';
    }

    // Show desktop
    const desktop = document.getElementById('vm-desktop');
    if (desktop) {
        desktop.style.display = 'block';
    }

    // Start clock
    updateClock();
    setInterval(updateClock, 1000);

    // Schedule popups
    schedulePopups();

    // Dispatch event for attaching desktop handlers
    window.dispatchEvent(new Event('vm-logged-in'));

    console.log('Login successful!');
}

function updateClock() {
    const clockElement = document.getElementById('taskbar-time');
    if (clockElement) {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        clockElement.textContent = `${hours}:${minutes}`;
    }
}

// ===================================
// FULLSCREEN TOGGLE
// ===================================

function toggleFullscreen() {
    const vmContainer = document.getElementById('vm-container');
    isFullscreen = !isFullscreen;

    if (isFullscreen) {
        vmContainer.classList.add('fullscreen');
    } else {
        vmContainer.classList.remove('fullscreen');
    }
}

// ===================================
// POPUP SYSTEM
// ===================================

function schedulePopups() {
    // Clear any existing timers
    popupTimers.forEach(timer => clearTimeout(timer));
    popupTimers = [];

    // Schedule update popup after 2 seconds
    popupTimers.push(setTimeout(() => showUpdatePopup(), 2000));

    // Schedule activation popup after 5 seconds
    popupTimers.push(setTimeout(() => showActivationPopup(), 5000));

    // Schedule office popup after 8 seconds
    popupTimers.push(setTimeout(() => showOfficePopup(), 8000));
}

function createPopup(title, content, wide = false) {
    const popup = document.createElement('div');
    popup.className = wide ? 'windows-popup wide' : 'windows-popup';

    const titlebar = document.createElement('div');
    titlebar.className = 'popup-titlebar';

    const titleDiv = document.createElement('div');
    titleDiv.className = 'popup-title';
    titleDiv.innerHTML = title;
    titlebar.appendChild(titleDiv);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'popup-close';
    closeBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>`;
    closeBtn.onclick = () => popup.remove();
    titlebar.appendChild(closeBtn);

    popup.appendChild(titlebar);

    const contentDiv = document.createElement('div');
    contentDiv.className = 'popup-content';
    contentDiv.innerHTML = content;
    popup.appendChild(contentDiv);

    // Make popup draggable
    makeDraggable(popup, titlebar);

    return popup;
}

// ===================================
// DRAG AND DROP UTILITIES
// ===================================

function makeDraggable(element, handle) {
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    handle.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);

    function dragStart(e) {
        // Don't drag if clicking on close button
        if (e.target.closest('.popup-close')) return;

        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;

        isDragging = true;
        handle.style.cursor = 'grabbing';
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault();

            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;

            // Get VM content boundaries
            const vmContent = document.getElementById('vm-content');
            if (vmContent) {
                const vmRect = vmContent.getBoundingClientRect();
                const popupRect = element.getBoundingClientRect();

                // Calculate boundaries (accounting for centered transform)
                const minX = -(vmRect.width / 2) + (popupRect.width / 2) + 10;
                const maxX = (vmRect.width / 2) - (popupRect.width / 2) - 10;
                const minY = -(vmRect.height / 2) + (popupRect.height / 2) + 10;
                const maxY = (vmRect.height / 2) - (popupRect.height / 2) - 10;

                // Constrain position
                currentX = Math.max(minX, Math.min(maxX, currentX));
                currentY = Math.max(minY, Math.min(maxY, currentY));
            }

            xOffset = currentX;
            yOffset = currentY;

            setTranslate(currentX, currentY, element);
        }
    }

    function dragEnd(e) {
        if (isDragging) {
            initialX = currentX;
            initialY = currentY;
            isDragging = false;
            handle.style.cursor = 'grab';
        }
    }

    function setTranslate(xPos, yPos, el) {
        el.style.transform = `translate(calc(-50% + ${xPos}px), calc(-50% + ${yPos}px))`;
    }

    handle.style.cursor = 'grab';
}

function makeDesktopIconDraggable(icon) {
    let isDragging = false;
    let hasMoved = false;
    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let currentY = 0;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    const MIN_DRAG_DISTANCE = 5; // Minimum pixels to move before it's considered a drag

    function onMouseDown(e) {
        // Ignore if not left click
        if (e.button !== 0) return;

        startX = e.clientX;
        startY = e.clientY;
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;
        hasMoved = false;

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);

        e.preventDefault();
    }

    function onMouseMove(e) {
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // Start dragging only if moved more than minimum distance
        if (!isDragging && distance > MIN_DRAG_DISTANCE) {
            isDragging = true;
            hasMoved = true;
            icon.style.cursor = 'grabbing';
            icon.style.zIndex = '100';
        }

        if (isDragging) {
            e.preventDefault();

            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;

            xOffset = currentX;
            yOffset = currentY;

            icon.style.transform = `translate(${currentX}px, ${currentY}px)`;
        }
    }

    function onMouseUp(e) {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);

        if (isDragging) {
            isDragging = false;
            icon.style.cursor = 'grab';
            icon.style.zIndex = '1';
        } else if (!hasMoved) {
            // It was a click, not a drag - trigger the icon action
            const iconId = icon.id;
            if (iconId === 'snake-icon') {
                openSnakeGame();
            } else if (iconId === 'pc-icon') {
                openFileExplorer();
            } else if (iconId === 'recycle-icon') {
                openRecycleBin();
            }
        }

        hasMoved = false;
    }

    icon.addEventListener('mousedown', onMouseDown);
    icon.style.cursor = 'grab';
    icon.style.position = 'relative';
    icon.style.zIndex = '1';
}

function showUpdatePopup() {
    const content = `
        <p>Des mises à jour importantes sont disponibles. Votre ordinateur va redémarrer dans 15 minutes.</p>
        <p class="small-text">Cette opération peut prendre plusieurs heures...</p>
        <div class="popup-buttons">
            <button class="popup-btn primary">Redémarrer maintenant</button>
            <button class="popup-btn secondary" onclick="this.closest('.windows-popup').remove()">Me le rappeler plus tard</button>
        </div>
    `;

    const iconHtml = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #eab308;">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>`;

    const popup = createPopup(iconHtml + ' <span>Mises à jour Windows</span>', content);
    document.getElementById('vm-desktop').appendChild(popup);
}

function showActivationPopup() {
    const content = `
        <p>Cette copie de Windows n'est pas authentique.</p>
        <p class="small-text">Accédez aux Paramètres pour activer Windows.</p>
        <div class="popup-tip">
            <p><strong>Saviez-vous ?</strong> Avec Linux, pas de licence à payer. Jamais. C'est libre et gratuit.</p>
        </div>
        <div class="popup-buttons">
            <button class="popup-btn primary">Activer (299€)</button>
            <button class="popup-btn secondary" onclick="this.closest('.windows-popup').remove()">Plus tard</button>
        </div>
    `;

    const iconHtml = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #ef4444;">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>`;

    const popup = createPopup(iconHtml + ' <span>Activer Windows</span>', content);
    document.getElementById('vm-desktop').appendChild(popup);
}

function showOfficePopup() {
    const content = `
        <p>Votre abonnement Office 365 a expiré.</p>
        <p class="small-text">Renouvelez maintenant pour continuer à utiliser Word, Excel, PowerPoint...</p>
        <div class="popup-alternative">
            <p><strong>Alternative libre :</strong> LibreOffice offre les mêmes fonctionnalités, gratuitement et sans abonnement ! 🐧</p>
        </div>
        <div class="popup-buttons">
            <button class="popup-btn orange">S'abonner (69€/an)</button>
            <button class="popup-btn secondary" onclick="this.closest('.windows-popup').remove()">Plus tard</button>
        </div>
    `;

    const iconHtml = '<div style="width: 24px; height: 24px; background-color: #f97316; border-radius: 4px;"></div>';
    const popup = createPopup(iconHtml + ' <span>Microsoft Office</span>', content);
    document.getElementById('vm-desktop').appendChild(popup);
}

// ===================================
// SNAKE GAME POPUP
// ===================================

function openSnakeGame() {
    // Check if snake game is already open
    const existingSnake = document.querySelector('.snake-game-popup');
    if (existingSnake) {
        console.log('Snake game already open, focusing existing window');
        return;
    }

    const content = '<div id="snake-container"></div>';
    const popup = createPopup('🐍 <span>Snake Game</span>', content, true);
    popup.classList.add('snake-game-popup');

    // Add close button handler
    const closeBtn = popup.querySelector('.popup-close');
    closeBtn.onclick = () => {
        console.log('Closing snake game');
        stopSnakeGame();
        popup.remove();
    };

    document.getElementById('vm-desktop').appendChild(popup);

    // Initialize snake game
    setTimeout(() => initSnakeGame(), 100);
}

// ===================================
// WINDOWS START MENU
// ===================================

function openStartMenu() {
    // Check if menu already exists
    const existingMenu = document.querySelector('.start-menu-popup');
    if (existingMenu) {
        existingMenu.remove();
        return;
    }

    const content = `
        <div style="display: flex; height: 480px;">
            <!-- Left sidebar -->
            <div class="start-sidebar" style="width: 60px; background: linear-gradient(180deg, #1e3a8a 0%, #1e40af 100%); display: flex; flex-direction: column; align-items: center; padding: 16px 0; gap: 12px;">
                <div class="sidebar-btn" data-action="documents" style="width: 40px; height: 40px; background: rgba(255,255,255,0.2); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px; cursor: pointer;" title="Documents">📄</div>
                <div class="sidebar-btn" data-action="images" style="width: 40px; height: 40px; background: rgba(255,255,255,0.2); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px; cursor: pointer;" title="Images">🖼️</div>
                <div class="sidebar-btn" data-action="explorer" style="width: 40px; height: 40px; background: rgba(255,255,255,0.2); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px; cursor: pointer;" title="Explorateur">📁</div>
                <div style="flex: 1;"></div>
                <div class="sidebar-btn" data-action="settings" style="width: 40px; height: 40px; background: rgba(255,255,255,0.2); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px; cursor: pointer;" title="Paramètres">⚙️</div>
                <div class="sidebar-btn" data-action="shutdown" style="width: 40px; height: 40px; background: rgba(255,255,255,0.2); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px; cursor: pointer;" title="Éteindre">🔌</div>
            </div>
            <!-- Main content -->
            <div style="flex: 1; background: #f8fafc; padding: 20px;">
                <div style="margin-bottom: 20px;">
                    <h4 style="color: #1e293b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; font-weight: 600;">Applications récentes</h4>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
                        <div class="app-tile" data-app="snake" style="background: white; padding: 16px; border-radius: 8px; text-align: center; cursor: pointer; border: 2px solid transparent; transition: all 0.2s;">
                            <div style="font-size: 32px; margin-bottom: 8px;">🐍</div>
                            <div style="font-size: 11px; color: #475569; font-weight: 500;">Snake</div>
                        </div>
                        <div class="app-tile" data-app="explorer" style="background: white; padding: 16px; border-radius: 8px; text-align: center; cursor: pointer; border: 2px solid transparent; transition: all 0.2s;">
                            <div style="font-size: 32px; margin-bottom: 8px;">📁</div>
                            <div style="font-size: 11px; color: #475569; font-weight: 500;">Explorer</div>
                        </div>
                        <div class="app-tile" data-app="recycle" style="background: white; padding: 16px; border-radius: 8px; text-align: center; cursor: pointer; border: 2px solid transparent; transition: all 0.2s;">
                            <div style="font-size: 32px; margin-bottom: 8px;">🗑️</div>
                            <div style="font-size: 11px; color: #475569; font-weight: 500;">Corbeille</div>
                        </div>
                        <div class="app-tile" data-app="edge" style="background: white; padding: 16px; border-radius: 8px; text-align: center; cursor: pointer; border: 2px solid transparent; transition: all 0.2s;">
                            <div style="font-size: 32px; margin-bottom: 8px;">🌐</div>
                            <div style="font-size: 11px; color: #475569; font-weight: 500;">Edge</div>
                        </div>
                        <div class="app-tile" data-app="settings" style="background: white; padding: 16px; border-radius: 8px; text-align: center; cursor: pointer; border: 2px solid transparent; transition: all 0.2s;">
                            <div style="font-size: 32px; margin-bottom: 8px;">⚙️</div>
                            <div style="font-size: 11px; color: #475569; font-weight: 500;">Settings</div>
                        </div>
                        <div class="app-tile" data-app="notes" style="background: white; padding: 16px; border-radius: 8px; text-align: center; cursor: pointer; border: 2px solid transparent; transition: all 0.2s;">
                            <div style="font-size: 32px; margin-bottom: 8px;">📝</div>
                            <div style="font-size: 11px; color: #475569; font-weight: 500;">Notes</div>
                        </div>
                    </div>
                </div>
                <div style="margin-top: 24px; padding: 16px; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 1px solid #fbbf24; border-radius: 12px; box-shadow: 0 2px 8px rgba(251, 191, 36, 0.2);">
                    <div style="display: flex; align-items: start; gap: 12px;">
                        <div style="font-size: 24px;">💡</div>
                        <div>
                            <div style="font-weight: 600; color: #92400e; margin-bottom: 4px; font-size: 13px;">Le saviez-vous ?</div>
                            <div style="font-size: 12px; color: #78350f; line-height: 1.5;">Sous Linux, le menu d'applications est instantané, personnalisable et sans publicités intégrées !</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    const popup = document.createElement('div');
    popup.className = 'windows-popup start-menu-popup';
    popup.style.position = 'absolute';
    popup.style.bottom = '60px';
    popup.style.left = '10px';
    popup.style.top = 'auto';
    popup.style.transform = 'none';
    popup.style.width = '520px';
    popup.style.maxWidth = '520px';
    popup.style.background = 'white';
    popup.style.borderRadius = '12px';
    popup.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)';
    popup.style.overflow = 'hidden';

    const contentDiv = document.createElement('div');
    contentDiv.innerHTML = content;
    popup.appendChild(contentDiv);

    document.getElementById('vm-desktop').appendChild(popup);

    // Attach event listeners APRÈS avoir ajouté au DOM
    const sidebarBtns = popup.querySelectorAll('.sidebar-btn');
    sidebarBtns.forEach(btn => {
        btn.addEventListener('mouseover', () => btn.style.background = 'rgba(255,255,255,0.3)');
        btn.addEventListener('mouseout', () => btn.style.background = 'rgba(255,255,255,0.2)');
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            popup.remove();
            if (action === 'explorer') openFileExplorer();
            else if (action === 'settings') openWindowsSettings();
            else if (action === 'shutdown') alert('🔌 Au revoir ! Sous Linux, extinction instantanée sans attendre les mises à jour forcées 🐧');
            else if (action === 'documents') openFileExplorer('Documents');
            else if (action === 'images') openFileExplorer('Images');
        });
    });

    const appTiles = popup.querySelectorAll('.app-tile');
    appTiles.forEach(tile => {
        tile.addEventListener('mouseover', () => {
            tile.style.borderColor = '#3b82f6';
            tile.style.transform = 'translateY(-2px)';
        });
        tile.addEventListener('mouseout', () => {
            tile.style.borderColor = 'transparent';
            tile.style.transform = 'translateY(0)';
        });
        tile.addEventListener('click', () => {
            const app = tile.dataset.app;
            popup.remove();
            if (app === 'snake') openSnakeGame();
            else if (app === 'explorer') openFileExplorer();
            else if (app === 'recycle') openRecycleBin();
            else if (app === 'edge') openEdgeBrowser();
            else if (app === 'settings') openWindowsSettings();
            else if (app === 'notes') alert('📝 Bloatware Windows ! Utilisez LibreOffice Writer sur Linux à la place 🐧');
        });
    });

    // Animate in
    popup.style.opacity = '0';
    popup.style.transform = 'translateY(20px)';
    setTimeout(() => {
        popup.style.transition = 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)';
        popup.style.opacity = '1';
        popup.style.transform = 'translateY(0)';
    }, 10);
}

// ===================================
// FILE EXPLORER
// ===================================

function openFileExplorer(folder = 'root') {
    let path = 'C:\\';
    let files = [];

    if (folder === 'Documents') {
        path = 'C:\\Users\\Utilisateur\\Documents';
        files = [
            { icon: '📄', name: 'Rapport.docx', type: 'Document Word', size: '245 Ko', fileType: 'docx' },
            { icon: '📄', name: 'CV.pdf', type: 'Document PDF', size: '156 Ko', fileType: 'pdf' },
            { icon: '📁', name: 'Travail', type: 'Dossier de fichiers', folder: true, action: 'Travail' },
            { icon: '📄', name: 'Notes.txt', type: 'Fichier texte', size: '12 Ko', fileType: 'txt' },
        ];
    } else if (folder === 'Travail') {
        path = 'C:\\Users\\Utilisateur\\Documents\\Travail';
        files = [
            { icon: '📄', name: 'Projet2024.docx', type: 'Document Word', size: '567 Ko', fileType: 'docx' },
            { icon: '📄', name: 'Budget.xlsx', type: 'Excel', size: '89 Ko' },
            { icon: '📁', name: 'Archives', type: 'Dossier de fichiers', folder: true, action: 'Archives' },
        ];
    } else if (folder === 'Archives') {
        path = 'C:\\Users\\Utilisateur\\Documents\\Travail\\Archives';
        files = [];  // Empty folder
    } else if (folder === 'Images') {
        path = 'C:\\Users\\Utilisateur\\Images';
        files = [
            { icon: '🖼️', name: 'gigatux.jpg', type: 'Image JPEG', size: '2.4 Mo', fileType: 'image', imagePath: '/images/gigatux.jpg' },
            { icon: '🖼️', name: 'singes.jpg', type: 'Image JPEG', size: '1.8 Mo', fileType: 'image', imagePath: '/images/singes.jpg' },
            { icon: '📁', name: 'Famille', type: 'Dossier de fichiers', folder: true, action: 'Famille' },
            { icon: '📁', name: 'Vacances', type: 'Dossier de fichiers', folder: true, action: 'Vacances' },
        ];
    } else if (folder === 'Famille') {
        path = 'C:\\Users\\Utilisateur\\Images\\Famille';
        files = [];  // Empty folder
    } else if (folder === 'Vacances') {
        path = 'C:\\Users\\Utilisateur\\Images\\Vacances';
        files = [];  // Empty folder
    } else if (folder === 'Téléchargements') {
        path = 'C:\\Users\\Utilisateur\\Téléchargements';
        files = [
            { icon: '📦', name: 'setup.exe', type: 'Application', size: '45 Mo' },
            { icon: '📄', name: 'facture.pdf', type: 'Document PDF', size: '234 Ko', fileType: 'pdf' },
            { icon: '🎵', name: 'music.mp3', type: 'Fichier audio', size: '4.2 Mo', fileType: 'corrupted' },
            { icon: '🎬', name: 'video.mp4', type: 'Vidéo', size: '128 Mo', fileType: 'corrupted' },
            { icon: '📄', name: 'readme.txt', type: 'Fichier texte', size: '8 Ko', fileType: 'txt' },
        ];
    } else {
        // Root
        files = [
            { icon: '📁', name: 'Documents', type: 'Dossier de fichiers', folder: true, action: 'Documents' },
            { icon: '📁', name: 'Images', type: 'Dossier de fichiers', folder: true, action: 'Images' },
            { icon: '📁', name: 'Téléchargements', type: 'Dossier de fichiers', folder: true, action: 'Téléchargements' },
            { icon: '📄', name: 'important.docx', type: 'Document Word', size: '245 Ko', fileType: 'docx' },
        ];
    }

    const filesHtml = files.map((file, index) => {
        const dataAction = file.action ? `data-folder="${file.action}"` : '';
        const dataFileType = file.fileType ? `data-filetype="${file.fileType}"` : '';
        const dataImagePath = file.imagePath ? `data-imagepath="${file.imagePath}"` : '';
        return `
            <div class="explorer-file-item" ${dataAction} ${dataFileType} ${dataImagePath} data-index="${index}" data-filename="${file.name}" style="display: flex; align-items: center; gap: 12px; padding: 8px; border-radius: 4px; cursor: pointer; margin-bottom: 4px;">
                <span style="font-size: 24px;">${file.icon}</span>
                <div>
                    <div style="font-weight: 500; color: #1e293b;">${file.name}</div>
                    <div style="font-size: 12px; color: #64748b;">${file.type}${file.size ? ' • ' + file.size : ''}</div>
                </div>
            </div>
        `;
    }).join('');

    const content = `
        <div style="display: flex; flex-direction: column; height: 450px;">
            <div style="background: #f1f5f9; padding: 8px; border-bottom: 1px solid #cbd5e1; display: flex; gap: 8px;">
                <button class="explorer-back-btn" style="padding: 4px 12px; background: white; border: 1px solid #cbd5e1; border-radius: 4px; cursor: pointer;">← Retour</button>
                <input type="text" value="${path}" readonly style="flex: 1; padding: 4px 8px; border: 1px solid #cbd5e1; border-radius: 4px; background: white; color: #1e293b;">
            </div>
            <div style="flex: 1; background: white; padding: 16px; overflow-y: auto;">
                ${filesHtml}
                <div style="margin-top: 24px; padding: 16px; background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px;">
                    <p style="margin: 0; font-size: 14px; color: #92400e;"><strong>Conseil :</strong> Sous Linux, le gestionnaire de fichiers est plus rapide et consomme moins de ressources !</p>
                </div>
            </div>
        </div>
    `;

    // Remove existing explorer if any
    const existing = document.querySelector('.file-explorer-popup');
    if (existing) existing.remove();

    const popup = createPopup('📁 <span>Explorateur de fichiers</span>', content, true);
    popup.classList.add('file-explorer-popup');
    document.getElementById('vm-desktop').appendChild(popup);

    // Attach event listeners
    const backBtn = popup.querySelector('.explorer-back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => openFileExplorer('root'));
    }

    const fileItems = popup.querySelectorAll('.explorer-file-item');
    fileItems.forEach(item => {
        item.addEventListener('mouseover', () => item.style.background = '#e2e8f0');
        item.addEventListener('mouseout', () => item.style.background = 'transparent');
        item.addEventListener('click', () => {
            const folderAction = item.dataset.folder;
            const fileType = item.dataset.filetype;
            const fileName = item.dataset.filename;
            const imagePath = item.dataset.imagepath;

            if (folderAction) {
                // Open folder
                openFileExplorer(folderAction);
            } else if (fileType === 'txt') {
                // Open text file in Notepad
                let content = '';
                if (fileName === 'Notes.txt') {
                    content = 'Réunion équipe - 15/03/2024\n\nPoints à aborder :\n- Budget Q2\n- Nouveaux projets\n- Vacances d\'été\n\nTâches à faire :\n- Finaliser présentation\n- Envoyer rapport\n- Contacter client';
                } else if (fileName === 'readme.txt') {
                    content = 'INSTRUCTIONS D\'INSTALLATION\n\nÉtape 1 : Extraire l\'archive\nÉtape 2 : Lancer setup.exe\nÉtape 3 : Suivre l\'assistant\n\n⚠️ ATTENTION : Nécessite des droits administrateur\n⚠️ Cette application collecte vos données\n\nSous Linux : Installation simple via gestionnaire de paquets, aucun .exe louche !';
                }
                openNotepad(fileName, content);
            } else if (fileType === 'image') {
                // Open image in viewer
                openImageViewer(fileName, imagePath);
            } else if (fileType === 'pdf') {
                // Open PDF in viewer
                openPdfViewer(fileName);
            } else if (fileType === 'docx') {
                // Open DOCX in viewer
                openDocxViewer(fileName);
            } else if (fileType === 'corrupted') {
                // Show corrupted file error
                alert('❌ ERREUR : Fichier corrompu !\n\n' + fileName + ' ne peut pas être ouvert.\n\nLe fichier est endommagé ou dans un format non pris en charge.\n\n💡 Sous Linux, VLC et autres logiciels gratuits gèrent mieux les formats corrompus ! 🐧');
            } else {
                // Generic file
                alert('📄 Fichier ouvert ! Sous Linux, tous les logiciels 🐧 de lecture sont gratuits et performants');
            }
        });
    });
}

// ===================================
// RECYCLE BIN
// ===================================

function openRecycleBin() {
    const content = `
        <div style="padding: 20px; text-align: center;">
            <div style="font-size: 64px; margin-bottom: 16px;">🗑️</div>
            <h3 style="margin-bottom: 12px; color: #1e293b;">Corbeille vide</h3>
            <p style="color: #64748b; margin-bottom: 24px;">Aucun élément dans la corbeille</p>
            <div style="padding: 16px; background: #dcfce7; border: 1px solid #86efac; border-radius: 8px;">
                <p style="margin: 0; font-size: 14px;"><strong>Astuce :</strong> Sous Linux, la gestion des fichiers supprimés est plus transparente et vous garde le contrôle total !</p>
            </div>
        </div>
    `;

    const popup = createPopup('🗑️ <span>Corbeille</span>', content);
    document.getElementById('vm-desktop').appendChild(popup);
}

// ===================================
// DESKTOP CONTEXT MENU
// ===================================

function showDesktopContextMenu(event) {
    // Don't show on icons or taskbar
    if (event.target.closest('.desktop-icon') || event.target.closest('.taskbar')) {
        return;
    }

    event.preventDefault();

    // Remove existing context menu if any
    const existingMenu = document.querySelector('.context-menu');
    if (existingMenu) {
        existingMenu.remove();
    }

    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.style.position = 'absolute';
    menu.style.left = event.clientX + 'px';
    menu.style.top = event.clientY + 'px';
    menu.style.background = 'white';
    menu.style.border = '1px solid #cbd5e1';
    menu.style.borderRadius = '8px';
    menu.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    menu.style.padding = '4px';
    menu.style.minWidth = '200px';
    menu.style.zIndex = '1000';

    menu.innerHTML = `
        <div class="context-item" data-action="refresh" style="padding: 8px 12px; cursor: pointer; border-radius: 4px; font-size: 14px; color: #1e293b;">
            Actualiser
        </div>
        <hr style="margin: 4px 0; border: none; border-top: 1px solid #e2e8f0;">
        <div class="context-item" data-action="folder" style="padding: 8px 12px; cursor: pointer; border-radius: 4px; font-size: 14px; color: #1e293b;">
            📁 Nouveau dossier
        </div>
        <div class="context-item" data-action="document" style="padding: 8px 12px; cursor: pointer; border-radius: 4px; font-size: 14px; color: #1e293b;">
            Nouveau document
        </div>
        <hr style="margin: 4px 0; border: none; border-top: 1px solid #e2e8f0;">
        <div class="context-item" data-action="settings" style="padding: 8px 12px; cursor: pointer; border-radius: 4px; font-size: 14px; color: #1e293b;">
            ⚙️ Personnaliser
        </div>
    `;

    document.getElementById('vm-desktop').appendChild(menu);

    // Attach event listeners
    const menuItems = menu.querySelectorAll('.context-item');
    menuItems.forEach(item => {
        item.addEventListener('mouseover', () => item.style.background = '#e2e8f0');
        item.addEventListener('mouseout', () => item.style.background = 'transparent');
        item.addEventListener('click', () => {
            const action = item.dataset.action;
            menu.remove();
            if (action === 'refresh') {
                alert('🔄 Actualisation... Sous Linux, tout est instantané ! 🐧');
            } else if (action === 'folder') {
                openFileExplorer();
            } else if (action === 'document') {
                alert('Nouveau document... Sur Linux, LibreOffice est déjà installé gratuitement ! 🐧');
            } else if (action === 'settings') {
                openWindowsSettings();
            }
        });
    });

    // Close menu on click outside
    const closeMenu = (e) => {
        if (!menu.contains(e.target)) {
            menu.remove();
            document.removeEventListener('click', closeMenu);
        }
    };

    setTimeout(() => {
        document.addEventListener('click', closeMenu);
    }, 10);
}

// ===================================
// NOTEPAD VIEWER
// ===================================

function openNotepad(fileName, content) {
    const notepadContent = `
        <div style="display: flex; flex-direction: column; height: 450px;">
            <div style="background: #f1f5f9; padding: 8px; border-bottom: 1px solid #cbd5e1; display: flex; gap: 8px;">
                <button style="padding: 4px 12px; background: white; border: 1px solid #cbd5e1; border-radius: 4px; cursor: pointer; font-size: 12px;">Fichier</button>
                <button style="padding: 4px 12px; background: white; border: 1px solid #cbd5e1; border-radius: 4px; cursor: pointer; font-size: 12px;">Édition</button>
                <button style="padding: 4px 12px; background: white; border: 1px solid #cbd5e1; border-radius: 4px; cursor: pointer; font-size: 12px;">Aide</button>
            </div>
            <textarea readonly style="flex: 1; padding: 12px; font-family: 'Courier New', monospace; font-size: 14px; border: none; resize: none; background: white; color: #1e293b;">${content}</textarea>
            <div style="background: #f1f5f9; padding: 8px; border-top: 1px solid #cbd5e1; font-size: 12px; color: #64748b;">
                Lecture seule | ${fileName}
            </div>
            <div style="margin: 12px; padding: 12px; background: #dcfce7; border: 1px solid #86efac; border-radius: 8px;">
                <p style="margin: 0; font-size: 13px; color: #166534;"><strong>Sous Linux :</strong> Gedit, Nano, Vim... Tous gratuits et puissants ! 🐧</p>
            </div>
        </div>
    `;

    const popup = createPopup('<span>' + fileName + ' - Bloc-notes</span>', notepadContent, true);
    popup.classList.add('notepad-popup');
    document.getElementById('vm-desktop').appendChild(popup);
}

// ===================================
// IMAGE VIEWER
// ===================================

function openImageViewer(fileName, imagePath) {
    const imageContent = `
        <div style="display: flex; flex-direction: column; height: 500px; background: #1e293b;">
            <div style="background: #0f172a; padding: 8px; border-bottom: 1px solid #334155; display: flex; gap: 8px; align-items: center;">
                <button style="padding: 4px 12px; background: #334155; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Zoom +</button>
                <button style="padding: 4px 12px; background: #334155; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Zoom -</button>
                <div style="flex: 1; text-align: center; color: white; font-size: 14px;">${fileName}</div>
            </div>
            <div style="flex: 1; display: flex; align-items: center; justify-content: center; overflow: auto; padding: 20px;">
                <img src="${imagePath}" alt="${fileName}" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 8px;">
            </div>
            <div style="background: #0f172a; padding: 12px; border-top: 1px solid #334155;">
                <div style="padding: 12px; background: #dcfce7; border: 1px solid #86efac; border-radius: 8px;">
                    <p style="margin: 0; font-size: 13px; color: #166534;"><strong>Sous Linux :</strong> GIMP (gratuit) = Photoshop mais en mieux et sans abonnement ! 🐧</p>
                </div>
            </div>
        </div>
    `;

    const popup = createPopup('<span>' + fileName + '</span>', imageContent, true);
    popup.classList.add('image-viewer-popup');
    document.getElementById('vm-desktop').appendChild(popup);
}

// ===================================
// PDF VIEWER
// ===================================

function openPdfViewer(fileName) {
    const pdfContent = `
        <div style="display: flex; flex-direction: column; height: 500px; background: #f8fafc;">
            <div style="background: #334155; padding: 8px; border-bottom: 1px solid #1e293b; display: flex; gap: 8px; align-items: center;">
                <button style="padding: 4px 12px; background: #475569; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">← Page précédente</button>
                <button style="padding: 4px 12px; background: #475569; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Page suivante →</button>
                <div style="flex: 1; text-align: center; color: white; font-size: 14px;">Page 1 / 1</div>
                <button style="padding: 4px 12px; background: #475569; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Zoom +</button>
                <button style="padding: 4px 12px; background: #475569; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Zoom -</button>
            </div>
            <div style="flex: 1; display: flex; align-items: center; justify-content: center; overflow: auto; padding: 20px; background: #64748b;">
                <div style="background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); max-width: 600px; width: 100%;">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <div style="font-size: 24px; font-weight: bold; color: #1e293b; margin-bottom: 8px;">${fileName}</div>
                        <div style="height: 2px; background: #e2e8f0; margin: 16px 0;"></div>
                    </div>
                    <div style="font-family: 'Times New Roman', serif; font-size: 14px; line-height: 1.8; color: #1e293b;">
                        <p><strong>Objet :</strong> Rapport d'activité Q4 2024</p>
                        <p style="margin-top: 16px;">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                        <p style="margin-top: 12px;">Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                        <ul style="margin-top: 12px; padding-left: 24px;">
                            <li>Point 1 : Objectifs atteints à 95%</li>
                            <li>Point 2 : Budget respecté</li>
                            <li>Point 3 : Équipe performante</li>
                        </ul>
                        <p style="margin-top: 16px; font-style: italic;">Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
                    </div>
                </div>
            </div>
            <div style="background: #334155; padding: 12px; border-top: 1px solid #1e293b;">
                <div style="padding: 12px; background: #dcfce7; border: 1px solid #86efac; border-radius: 8px;">
                    <p style="margin: 0; font-size: 13px; color: #166534;"><strong>Sous Linux :</strong> Evince, Okular, PDF.js... Lecteurs PDF gratuits et performants ! 🐧</p>
                </div>
            </div>
        </div>
    `;

    const popup = createPopup('<span>' + fileName + '</span>', pdfContent, true);
    popup.classList.add('pdf-viewer-popup');
    document.getElementById('vm-desktop').appendChild(popup);
}

// ===================================
// DOCX VIEWER
// ===================================

function openDocxViewer(fileName) {
    const docxContent = `
        <div style="display: flex; flex-direction: column; height: 500px; background: #f8fafc;">
            <div style="background: #2563eb; padding: 8px; border-bottom: 1px solid #1e40af; display: flex; gap: 8px; align-items: center;">
                <button style="padding: 4px 12px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Fichier</button>
                <button style="padding: 4px 12px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Accueil</button>
                <button style="padding: 4px 12px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Insertion</button>
                <button style="padding: 4px 12px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Révision</button>
                <div style="flex: 1;"></div>
                <div style="color: white; font-size: 14px; font-weight: bold;">Microsoft Word</div>
            </div>
            <div style="flex: 1; display: flex; align-items: center; justify-content: center; overflow: auto; padding: 20px; background: #cbd5e1;">
                <div style="background: white; padding: 60px; border-radius: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); max-width: 700px; width: 100%;">
                    <div style="font-family: 'Calibri', sans-serif; font-size: 16px; line-height: 1.6; color: #1e293b;">
                        <h1 style="font-size: 28px; font-weight: bold; margin-bottom: 16px; color: #1e293b;">Document Professionnel</h1>
                        <div style="height: 2px; background: #2563eb; margin: 16px 0; width: 100px;"></div>
                        <p style="margin-top: 20px;"><strong>Date :</strong> 15 mars 2024</p>
                        <p style="margin-top: 16px;">Bonjour,</p>
                        <p style="margin-top: 12px;">Ce document contient des informations importantes concernant le projet en cours. Veuillez trouver ci-dessous les détails :</p>
                        <ul style="margin-top: 16px; padding-left: 32px; line-height: 2;">
                            <li>Livrable 1 : Analyse complète</li>
                            <li>Livrable 2 : Prototype fonctionnel</li>
                            <li>Livrable 3 : Documentation technique</li>
                        </ul>
                        <p style="margin-top: 20px;">Merci de votre attention.</p>
                        <p style="margin-top: 20px; font-style: italic; color: #64748b;">Cordialement,<br>L'équipe projet</p>
                    </div>
                </div>
            </div>
            <div style="background: #2563eb; padding: 12px; border-top: 1px solid #1e40af;">
                <div style="padding: 12px; background: #dcfce7; border: 1px solid #86efac; border-radius: 8px;">
                    <p style="margin: 0; font-size: 13px; color: #166534;"><strong>Sous Linux :</strong> LibreOffice Writer = Word gratuit et sans abonnement ! 🐧</p>
                </div>
            </div>
        </div>
    `;

    const popup = createPopup('<span>' + fileName + ' - Microsoft Word</span>', docxContent, true);
    popup.classList.add('docx-viewer-popup');
    document.getElementById('vm-desktop').appendChild(popup);
}

// ===================================
// EDGE BROWSER WITH ADS
// ===================================

function openEdgeBrowser() {
    const content = `
        <div style="display: flex; flex-direction: column; height: 500px;">
            <!-- Browser toolbar -->
            <div style="background: #f1f5f9; padding: 8px; border-bottom: 1px solid #cbd5e1; display: flex; gap: 8px; align-items: center;">
                <button style="padding: 4px 12px; background: white; border: 1px solid #cbd5e1; border-radius: 4px; cursor: pointer;">←</button>
                <button style="padding: 4px 12px; background: white; border: 1px solid #cbd5e1; border-radius: 4px; cursor: pointer;">→</button>
                <button style="padding: 4px 12px; background: white; border: 1px solid #cbd5e1; border-radius: 4px; cursor: pointer;">↻</button>
                <input type="text" value="https://www.google.com" readonly style="flex: 1; padding: 6px 12px; border: 1px solid #cbd5e1; border-radius: 20px; background: white; color: #1e293b;">
            </div>
            <!-- Page content avec PUBS partout -->
            <div style="flex: 1; background: white; overflow-y: auto; position: relative;">
                <!-- PUB TOP -->
                <div class="edge-ad" data-msg="🚫 PUBLICITÉ BLOQUÉE ! Sous Linux avec Firefox/Chrome + uBlock Origin, vous ne verriez jamais ça !" style="background: linear-gradient(90deg, #ff6b6b, #ee5a6f); padding: 16px; text-align: center; color: white; cursor: pointer;">
                    <strong>⚠️ VOTRE PC EST EN DANGER !</strong> Cliquez ici pour scanner maintenant !
                </div>

                <!-- Contenu fake Google -->
                <div style="padding: 40px 20px; text-align: center;">
                    <div style="font-size: 48px; color: #4285f4; font-weight: bold; margin-bottom: 20px;">Gøøgle</div>
                    <input type="text" placeholder="Rechercher..." style="width: 80%; padding: 12px; border: 1px solid #ddd; border-radius: 24px; font-size: 16px;">
                </div>

                <!-- PUB SIDEBAR GAUCHE -->
                <div class="edge-ad" data-msg="💰 SCAM DÉTECTÉ ! Ces pubs sont souvent des arnaques. Linux + navigateur propre = 0 pub !" style="position: absolute; left: 0; top: 120px; width: 160px; background: #fff3cd; border: 2px solid #ffc107; padding: 12px; cursor: pointer;">
                    <div style="font-size: 12px; font-weight: bold; color: #856404; margin-bottom: 8px;">GAGNEZ 5000€</div>
                    <div style="font-size: 10px; color: #856404;">Cliquez maintenant !</div>
                </div>

                <!-- PUB SIDEBAR DROITE -->
                <div class="edge-ad" data-msg="🎰 CASINO EN LIGNE ! Très addictif et souvent arnaque. Bloqué par défaut sur navigateurs Linux bien configurés." style="position: absolute; right: 0; top: 120px; width: 160px; background: #f8d7da; border: 2px solid #f5c6cb; padding: 12px; cursor: pointer;">
                    <div style="font-size: 12px; font-weight: bold; color: #721c24; margin-bottom: 8px;">CASINO 100% BONUS</div>
                    <div style="font-size: 10px; color: #721c24;">Jouez maintenant</div>
                </div>

                <!-- PUB MILIEU -->
                <div class="edge-ad" data-msg="📦 FAUSSE LIVRAISON ! Technique de phishing classique. Sous Linux, plus de vigilance et moins de risques avec de bonnes pratiques." style="margin: 20px auto; width: 60%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px; border-radius: 12px; text-align: center; color: white; cursor: pointer;">
                    <div style="font-size: 18px; font-weight: bold; margin-bottom: 8px;">📦 Votre colis est arrivé !</div>
                    <div style="font-size: 14px; margin-bottom: 12px;">Cliquez pour suivre votre livraison</div>
                    <button style="background: white; color: #667eea; border: none; padding: 10px 24px; border-radius: 20px; font-weight: bold; cursor: pointer;">Suivre maintenant</button>
                </div>

                <!-- PUB BOTTOM -->
                <div class="edge-ad" data-msg="💊 PUB MÉDICAMENT DOUTEUX ! Souvent illégal. Navigateurs Linux avec extensions anti-pub = tranquillité totale." style="background: #d1ecf1; border: 2px solid #bee5eb; padding: 16px; margin: 20px; text-align: center; cursor: pointer;">
                    <strong style="color: #0c5460;">💊 PERDEZ 10KG EN 1 SEMAINE</strong><br>
                    <span style="font-size: 12px; color: #0c5460;">Méthode miracle des médecins !</span>
                </div>

                <!-- Astuce Linux -->
                <div style="margin: 20px; padding: 20px; background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%); border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                    <div style="font-size: 20px; margin-bottom: 12px;">🐧 <strong>Sous Linux :</strong></div>
                    <ul style="text-align: left; line-height: 1.8; color: #1e293b;">
                        <li>Firefox/Chrome avec uBlock Origin = <strong>ZÉRO pub</strong></li>
                        <li>Pas de bloatware Edge forcé</li>
                        <li>Meilleure protection vie privée</li>
                        <li>Extensions de sécurité optimales</li>
                    </ul>
                </div>
            </div>
        </div>
    `;

    const popup = createPopup('🌐 <span>Microsoft Edge</span>', content, true);
    popup.classList.add('edge-browser-popup');
    document.getElementById('vm-desktop').appendChild(popup);

    // Attach event listeners to ads
    const ads = popup.querySelectorAll('.edge-ad');
    ads.forEach(ad => {
        ad.addEventListener('click', (e) => {
            e.stopPropagation();
            alert(ad.dataset.msg);
        });
    });
}

// ===================================
// WINDOWS SETTINGS
// ===================================

function openWindowsSettings(section = 'Système') {
    // Remove existing settings popup if any
    const existing = document.querySelector('.settings-popup');
    if (existing) existing.remove();

    let sectionContent = '';

    if (section === 'Système') {
        sectionContent = `
            <h2 style="color: #1e293b; margin-bottom: 24px;">Système</h2>

            <div style="background: white; padding: 16px; border-radius: 8px; margin-bottom: 16px; border: 1px solid #e2e8f0;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <div>
                        <div style="font-weight: 500; color: #1e293b;">Télémétrie et collecte de données</div>
                        <div style="font-size: 12px; color: #64748b;">Microsoft collecte vos données d'utilisation</div>
                    </div>
                    <div style="background: #3b82f6; width: 48px; height: 24px; border-radius: 12px; position: relative; cursor: not-allowed;">
                        <div style="position: absolute; right: 2px; top: 2px; width: 20px; height: 20px; background: white; border-radius: 50%;"></div>
                    </div>
                </div>
                <div style="font-size: 11px; color: #dc2626; margin-top: 8px;">⚠️ Impossible à désactiver complètement</div>
            </div>

            <div style="background: white; padding: 16px; border-radius: 8px; margin-bottom: 16px; border: 1px solid #e2e8f0;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <div>
                        <div style="font-weight: 500; color: #1e293b;">Publicités personnalisées</div>
                        <div style="font-size: 12px; color: #64748b;">Afficher des pubs basées sur vos données</div>
                    </div>
                    <div style="background: #3b82f6; width: 48px; height: 24px; border-radius: 12px; position: relative; cursor: not-allowed;">
                        <div style="position: absolute; right: 2px; top: 2px; width: 20px; height: 20px; background: white; border-radius: 50%;"></div>
                    </div>
                </div>
                <div style="font-size: 11px; color: #dc2626; margin-top: 8px;">⚠️ Activé par défaut, difficile à désactiver</div>
            </div>

            <div style="background: white; padding: 16px; border-radius: 8px; margin-bottom: 16px; border: 1px solid #e2e8f0;">
                <div style="font-weight: 500; color: #1e293b; margin-bottom: 8px;">Mises à jour forcées</div>
                <div style="font-size: 12px; color: #64748b; margin-bottom: 12px;">Windows redémarre automatiquement pour installer les mises à jour</div>
                <button disabled style="padding: 8px 16px; background: #e2e8f0; color: #94a3b8; border: none; border-radius: 6px; cursor: not-allowed;">Désactiver (indisponible)</button>
            </div>
        `;
    } else if (section === 'Personnalisation') {
        sectionContent = `
            <h2 style="color: #1e293b; margin-bottom: 24px;">Personnalisation</h2>

            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 16px; border: 2px solid #f59e0b;">
                <div style="font-weight: 600; color: #1e293b; margin-bottom: 12px; font-size: 16px;">🌙 Mode sombre</div>
                <div style="font-size: 14px; color: #64748b; margin-bottom: 16px;">Le mode sombre réduit la fatigue oculaire et économise la batterie</div>
                <div style="background: #fef3c7; padding: 16px; border-radius: 8px; border: 2px dashed #f59e0b; margin-bottom: 16px;">
                    <div style="font-size: 20px; font-weight: bold; color: #92400e; margin-bottom: 8px;">💰 Fonctionnalité Premium</div>
                    <div style="font-size: 14px; color: #78350f;">Payez <strong>29,99€</strong> pour débloquer le mode sombre !</div>
                </div>
                <button disabled style="padding: 10px 20px; background: #f59e0b; color: white; border: none; border-radius: 6px; cursor: not-allowed; font-weight: bold; opacity: 0.6;">Acheter maintenant (29,99€)</button>
            </div>

            <div style="background: white; padding: 16px; border-radius: 8px; margin-bottom: 16px; border: 1px solid #e2e8f0;">
                <div style="font-weight: 500; color: #1e293b; margin-bottom: 8px;">Couleur d'accentuation</div>
                <div style="font-size: 12px; color: #64748b; margin-bottom: 12px;">Choisir la couleur principale de Windows</div>
                <div style="display: flex; gap: 8px;">
                    <div style="width: 40px; height: 40px; background: #3b82f6; border-radius: 8px; border: 3px solid #1e40af;"></div>
                    <div style="width: 40px; height: 40px; background: #64748b; border-radius: 8px; opacity: 0.5; cursor: not-allowed;"></div>
                    <div style="width: 40px; height: 40px; background: #10b981; border-radius: 8px; opacity: 0.5; cursor: not-allowed;"></div>
                    <div style="width: 40px; height: 40px; background: #f59e0b; border-radius: 8px; opacity: 0.5; cursor: not-allowed;"></div>
                </div>
                <div style="font-size: 11px; color: #dc2626; margin-top: 8px;">⚠️ Couleurs supplémentaires : 9,99€</div>
            </div>

            <div style="background: white; padding: 16px; border-radius: 8px; margin-bottom: 16px; border: 1px solid #e2e8f0;">
                <div style="font-weight: 500; color: #1e293b; margin-bottom: 8px;">Fond d'écran personnalisé</div>
                <div style="font-size: 12px; color: #64748b; margin-bottom: 12px;">Changer l'image du bureau</div>
                <button disabled style="padding: 8px 16px; background: #e2e8f0; color: #94a3b8; border: none; border-radius: 6px; cursor: not-allowed;">Parcourir... (Premium)</button>
            </div>
        `;
    } else if (section === 'Réseau') {
        sectionContent = `
            <h2 style="color: #1e293b; margin-bottom: 24px;">Réseau et Internet</h2>

            <div style="background: white; padding: 16px; border-radius: 8px; margin-bottom: 16px; border: 1px solid #e2e8f0;">
                <div style="font-weight: 500; color: #1e293b; margin-bottom: 8px;">État de la connexion</div>
                <div style="font-size: 14px; color: #10b981; margin-bottom: 12px;">✓ Connecté à Internet</div>
                <div style="font-size: 12px; color: #64748b;">Réseau : Windows Network</div>
            </div>

            <div style="background: white; padding: 16px; border-radius: 8px; margin-bottom: 16px; border: 1px solid #e2e8f0;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <div>
                        <div style="font-weight: 500; color: #1e293b;">Partage de bande passante</div>
                        <div style="font-size: 12px; color: #64748b;">Windows utilise votre connexion pour distribuer des mises à jour</div>
                    </div>
                    <div style="background: #3b82f6; width: 48px; height: 24px; border-radius: 12px; position: relative; cursor: not-allowed;">
                        <div style="position: absolute; right: 2px; top: 2px; width: 20px; height: 20px; background: white; border-radius: 50%;"></div>
                    </div>
                </div>
                <div style="font-size: 11px; color: #dc2626; margin-top: 8px;">⚠️ Activé par défaut - utilise votre bande passante</div>
            </div>

            <div style="background: white; padding: 16px; border-radius: 8px; margin-bottom: 16px; border: 1px solid #e2e8f0;">
                <div style="font-weight: 500; color: #1e293b; margin-bottom: 8px;">Collecte de données réseau</div>
                <div style="font-size: 12px; color: #64748b; margin-bottom: 12px;">Microsoft analyse votre trafic pour "améliorer les services"</div>
                <button disabled style="padding: 8px 16px; background: #e2e8f0; color: #94a3b8; border: none; border-radius: 6px; cursor: not-allowed;">Désactiver (impossible)</button>
            </div>
        `;
    } else if (section === 'Confidentialité') {
        sectionContent = `
            <h2 style="color: #1e293b; margin-bottom: 24px;">Confidentialité et sécurité</h2>

            <div style="background: white; padding: 16px; border-radius: 8px; margin-bottom: 16px; border: 1px solid #e2e8f0;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <div>
                        <div style="font-weight: 500; color: #1e293b;">Suivi publicitaire</div>
                        <div style="font-size: 12px; color: #64748b;">Autorise les apps à utiliser votre ID publicitaire</div>
                    </div>
                    <div style="background: #3b82f6; width: 48px; height: 24px; border-radius: 12px; position: relative; cursor: not-allowed;">
                        <div style="position: absolute; right: 2px; top: 2px; width: 20px; height: 20px; background: white; border-radius: 50%;"></div>
                    </div>
                </div>
                <div style="font-size: 11px; color: #dc2626; margin-top: 8px;">⚠️ Désactivation partielle seulement</div>
            </div>

            <div style="background: white; padding: 16px; border-radius: 8px; margin-bottom: 16px; border: 1px solid #e2e8f0;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <div>
                        <div style="font-weight: 500; color: #1e293b;">Localisation</div>
                        <div style="font-size: 12px; color: #64748b;">Windows et les apps peuvent accéder à votre position</div>
                    </div>
                    <div style="background: #3b82f6; width: 48px; height: 24px; border-radius: 12px; position: relative; cursor: not-allowed;">
                        <div style="position: absolute; right: 2px; top: 2px; width: 20px; height: 20px; background: white; border-radius: 50%;"></div>
                    </div>
                </div>
            </div>

            <div style="background: white; padding: 16px; border-radius: 8px; margin-bottom: 16px; border: 1px solid #e2e8f0;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <div>
                        <div style="font-weight: 500; color: #1e293b;">Historique d'activité</div>
                        <div style="font-size: 12px; color: #64748b;">Envoyer l'historique à Microsoft</div>
                    </div>
                    <div style="background: #3b82f6; width: 48px; height: 24px; border-radius: 12px; position: relative; cursor: not-allowed;">
                        <div style="position: absolute; right: 2px; top: 2px; width: 20px; height: 20px; background: white; border-radius: 50%;"></div>
                    </div>
                </div>
                <div style="font-size: 11px; color: #dc2626; margin-top: 8px;">⚠️ Synchronisé sur tous vos appareils</div>
            </div>

            <div style="background: white; padding: 16px; border-radius: 8px; margin-bottom: 16px; border: 1px solid #e2e8f0;">
                <div style="font-weight: 500; color: #1e293b; margin-bottom: 8px;">Caméra et micro</div>
                <div style="font-size: 12px; color: #64748b; margin-bottom: 12px;">Applications ayant accès : 12 apps</div>
                <button disabled style="padding: 8px 16px; background: #e2e8f0; color: #94a3b8; border: none; border-radius: 6px; cursor: not-allowed;">Gérer les autorisations</button>
            </div>
        `;
    } else if (section === 'Windows Update') {
        sectionContent = `
            <h2 style="color: #1e293b; margin-bottom: 24px;">Windows Update</h2>

            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 16px; border: 2px solid #dc2626;">
                <div style="font-weight: 600; color: #1e293b; margin-bottom: 12px; font-size: 16px;">⚠️ Mises à jour disponibles</div>
                <div style="font-size: 14px; color: #64748b; margin-bottom: 16px;">15 mises à jour critiques en attente (2.4 Go)</div>
                <div style="background: #fee2e2; padding: 16px; border-radius: 8px; border: 2px dashed #dc2626; margin-bottom: 16px;">
                    <div style="font-size: 20px; font-weight: bold; color: #991b1b; margin-bottom: 8px;">💰 Service Premium Windows Update+</div>
                    <div style="font-size: 14px; color: #7f1d1d; margin-bottom: 8px;">Payez <strong>49,99€</strong> pour installer les mises à jour maintenant !</div>
                    <div style="font-size: 12px; color: #991b1b;">Sinon, installation automatique dans 7 jours avec redémarrage forcé</div>
                </div>
                <button disabled style="padding: 10px 20px; background: #dc2626; color: white; border: none; border-radius: 6px; cursor: not-allowed; font-weight: bold; opacity: 0.6;">Acheter Windows Update+ (49,99€)</button>
            </div>

            <div style="background: white; padding: 16px; border-radius: 8px; margin-bottom: 16px; border: 1px solid #e2e8f0;">
                <div style="font-weight: 500; color: #1e293b; margin-bottom: 8px;">Options de redémarrage</div>
                <div style="font-size: 12px; color: #64748b; margin-bottom: 12px;">Redémarrage automatique prévu pour : Aujourd'hui à 03:00</div>
                <button disabled style="padding: 8px 16px; background: #e2e8f0; color: #94a3b8; border: none; border-radius: 6px; cursor: not-allowed;">Modifier l'heure (indisponible)</button>
                <div style="font-size: 11px; color: #dc2626; margin-top: 8px;">⚠️ Impossible d'annuler le redémarrage</div>
            </div>

            <div style="background: white; padding: 16px; border-radius: 8px; margin-bottom: 16px; border: 1px solid #e2e8f0;">
                <div style="font-weight: 500; color: #1e293b; margin-bottom: 8px;">Mises à jour des pilotes</div>
                <div style="font-size: 12px; color: #64748b; margin-bottom: 12px;">Windows installe automatiquement les pilotes (parfois incompatibles)</div>
                <button disabled style="padding: 8px 16px; background: #e2e8f0; color: #94a3b8; border: none; border-radius: 6px; cursor: not-allowed;">Désactiver (indisponible)</button>
            </div>
        `;
    }

    const content = `
        <div style="display: flex; height: 450px;">
            <!-- Sidebar -->
            <div class="settings-sidebar" style="width: 200px; background: #f8fafc; border-right: 1px solid #e2e8f0; padding: 16px;">
                <div class="settings-nav-item" data-section="Système" style="padding: 12px; border-radius: 8px; margin-bottom: 8px; cursor: pointer; color: #64748b;">⚙️ Système</div>
                <div class="settings-nav-item" data-section="Personnalisation" style="padding: 12px; border-radius: 8px; margin-bottom: 8px; cursor: pointer; color: #64748b;">🎨 Personnalisation</div>
                <div class="settings-nav-item" data-section="Réseau" style="padding: 12px; border-radius: 8px; margin-bottom: 8px; cursor: pointer; color: #64748b;">📶 Réseau</div>
                <div class="settings-nav-item" data-section="Confidentialité" style="padding: 12px; border-radius: 8px; margin-bottom: 8px; cursor: pointer; color: #64748b;">🔒 Confidentialité</div>
                <div class="settings-nav-item" data-section="Windows Update" style="padding: 12px; border-radius: 8px; margin-bottom: 8px; cursor: pointer; color: #64748b;">🔄 Windows Update</div>
            </div>
            <!-- Content -->
            <div class="settings-content" style="flex: 1; padding: 24px; overflow-y: auto;">
                ${sectionContent}

                <div style="margin-top: 32px; padding: 20px; background: linear-gradient(135deg, #dcfce7 0%, #d1fae5 100%); border: 2px solid #86efac; border-radius: 12px;">
                    <div style="font-size: 18px; font-weight: bold; color: #166534; margin-bottom: 12px;">🐧 Avec Linux :</div>
                    <ul style="color: #166534; line-height: 1.8; margin: 0;">
                        <li><strong>Aucune télémétrie forcée</strong> - Vous contrôlez vos données</li>
                        <li><strong>Zéro publicité</strong> - Système 100% propre</li>
                        <li><strong>Mises à jour à votre rythme</strong> - Vous décidez quand</li>
                        <li><strong>Tout est gratuit</strong> - Pas de fonctionnalités payantes</li>
                        <li><strong>Transparence totale</strong> - Code open source</li>
                    </ul>
                </div>
            </div>
        </div>
    `;

    const popup = createPopup('⚙️ <span>Paramètres Windows</span>', content, true);
    popup.classList.add('settings-popup');
    document.getElementById('vm-desktop').appendChild(popup);

    // Highlight active section
    const navItems = popup.querySelectorAll('.settings-nav-item');
    navItems.forEach(item => {
        if (item.dataset.section === section) {
            item.style.background = '#e0f2fe';
            item.style.color = '#0369a1';
            item.style.fontWeight = '500';
        }

        // Add click handlers
        item.addEventListener('click', () => {
            openWindowsSettings(item.dataset.section);
        });

        // Hover effects
        item.addEventListener('mouseover', () => {
            if (item.dataset.section !== section) {
                item.style.background = '#f1f5f9';
            }
        });
        item.addEventListener('mouseout', () => {
            if (item.dataset.section !== section) {
                item.style.background = 'transparent';
            }
        });
    });
}

// ===================================
// INITIALIZE VM
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('VM JavaScript loaded');

    // Attach login form handler
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        console.log('Login form found, attaching event listener');
        loginForm.addEventListener('submit', handleLogin);
    } else {
        console.error('Login form not found!');
    }

    // Attach fullscreen button handler
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', toggleFullscreen);
        console.log('Fullscreen button attached');
    }

    // Attach desktop handlers (for when desktop is shown)
    const attachDesktopHandlers = () => {
        const windowsBtn = document.getElementById('windows-btn');
        if (windowsBtn && !windowsBtn.dataset.attached) {
            windowsBtn.addEventListener('click', openStartMenu);
            windowsBtn.dataset.attached = 'true';
            console.log('Windows button handler attached');
        }

        // Make all desktop icons draggable
        const desktopIcons = document.querySelectorAll('.desktop-icon');
        desktopIcons.forEach(icon => {
            if (!icon.dataset.draggableAttached) {
                makeDesktopIconDraggable(icon);
                icon.dataset.draggableAttached = 'true';
            }
        });

        // Attach right-click context menu to desktop
        const desktop = document.getElementById('vm-desktop');
        if (desktop && !desktop.dataset.contextMenuAttached) {
            desktop.addEventListener('contextmenu', showDesktopContextMenu);
            desktop.dataset.contextMenuAttached = 'true';
            console.log('Desktop context menu attached');
        }
    };

    // Attach handlers after login
    window.addEventListener('vm-logged-in', attachDesktopHandlers);
});
