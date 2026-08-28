// ==========================================================================
// CONVITE INTERATIVO - 80 ANOS DE EDILEUZA (MOTION GRAPHICS UX)
// Lógica de Abertura Vetorial, Confirmação Direta (GitHub Pages & Sheets)
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    initConfigData();
    startCountdown();
    setupMobileUXEventListeners();
});

// --------------------------------------------------------------------------
// 1. Injeção de Dados do Evento a partir do config.js
// --------------------------------------------------------------------------
function initConfigData() {
    if (typeof EVENT_CONFIG === 'undefined') return;

    const guestOfHonorEls = document.querySelectorAll('.inject-guest-name');
    guestOfHonorEls.forEach(el => el.textContent = EVENT_CONFIG.guestOfHonor);
    
    const titleEls = document.querySelectorAll('.inject-title');
    titleEls.forEach(el => el.textContent = EVENT_CONFIG.title);
    
    const subtitleEls = document.querySelectorAll('.inject-subtitle');
    subtitleEls.forEach(el => el.textContent = EVENT_CONFIG.subtitle);
    
    const dateFormattedEls = document.querySelectorAll('.inject-date-formatted');
    dateFormattedEls.forEach(el => el.textContent = EVENT_CONFIG.eventDateFormatted);
    
    const dateYearEls = document.querySelectorAll('.inject-date-year');
    dateYearEls.forEach(el => el.textContent = EVENT_CONFIG.eventYear);
    
    const timeFormattedEl = document.querySelector('.inject-time-formatted');
    if (timeFormattedEl) timeFormattedEl.textContent = EVENT_CONFIG.eventTimeFormatted;

    const locationNameEl = document.querySelector('.inject-location-name');
    if (locationNameEl) locationNameEl.textContent = EVENT_CONFIG.locationName;

    const locationAddressEl = document.querySelector('.inject-location-address');
    if (locationAddressEl) locationAddressEl.textContent = EVENT_CONFIG.locationAddress;
    
    const mapsBtnContainer = document.getElementById('maps-btn-container');
    if (mapsBtnContainer && EVENT_CONFIG.googleMapsUrl && EVENT_CONFIG.googleMapsUrl.trim() !== '') {
        mapsBtnContainer.style.display = 'block';
        const mapsLink = document.getElementById('google-maps-link');
        if (mapsLink) mapsLink.href = EVENT_CONFIG.googleMapsUrl;
    }
}

// --------------------------------------------------------------------------
// 2. Contador Regressivo para 27/09/2026
// --------------------------------------------------------------------------
function startCountdown() {
    const daysEl = document.getElementById('timer-days');
    const hoursEl = document.getElementById('timer-hours');
    const minutesEl = document.getElementById('timer-minutes');
    const secondsEl = document.getElementById('timer-seconds');
    
    if (!daysEl) return;

    const targetDate = new Date(EVENT_CONFIG.eventDateISO || "2026-09-27T10:00:00").getTime();

    function updateTimer() {
        const now = new Date().getTime();
        const difference = targetDate - now;

        if (difference <= 0) {
            daysEl.textContent = '00';
            hoursEl.textContent = '00';
            minutesEl.textContent = '00';
            secondsEl.textContent = '00';
            return;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        daysEl.textContent = days < 10 ? '0' + days : days;
        hoursEl.textContent = hours < 10 ? '0' + hours : hours;
        minutesEl.textContent = minutes < 10 ? '0' + minutes : minutes;
        secondsEl.textContent = seconds < 10 ? '0' + seconds : seconds;
    }

    updateTimer();
    setInterval(updateTimer, 1000);
}

// --------------------------------------------------------------------------
// 3. Abertura Motion Graphics & Gestão de Confirmação
// --------------------------------------------------------------------------
function setupMobileUXEventListeners() {
    const envelopeWrapper = document.getElementById('envelope-wrapper');
    const envelopeScreen = document.getElementById('envelope-screen');
    const invitationScreen = document.getElementById('invitation-screen');
    const bottomNav = document.getElementById('mobile-bottom-nav');
    const bgAudio = document.getElementById('bg-audio');

    if (envelopeWrapper) {
        envelopeWrapper.addEventListener('click', openCleanEnvelope);
    }

    function openCleanEnvelope() {
        envelopeScreen.classList.add('opened');

        if (bgAudio && EVENT_CONFIG.bgMusicUrl) {
            bgAudio.src = EVENT_CONFIG.bgMusicUrl;
            bgAudio.volume = 0.35;
            bgAudio.play().catch(() => {});
        }

        setTimeout(() => {
            envelopeScreen.style.display = 'none';
            invitationScreen.classList.add('active');
            if (bottomNav) bottomNav.classList.add('active');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 650);
    }

    // Navegação do Bottom Bar
    const navHome = document.getElementById('nav-btn-home');
    if (navHome) {
        navHome.addEventListener('click', () => {
            const homeSec = document.getElementById('section-home');
            if (homeSec) homeSec.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // Controle da Gaveta de Confirmação de Presença
    const openRsvpBtn = document.getElementById('open-rsvp-btn');
    const openRsvpBtnPageEnd = document.getElementById('open-rsvp-btn-page-end');
    const rsvpSheetOverlay = document.getElementById('rsvp-sheet-overlay');
    const rsvpForm = document.getElementById('rsvp-form');

    function openRsvpDrawer() {
        if (rsvpSheetOverlay) rsvpSheetOverlay.classList.add('active');
    }

    if (openRsvpBtn) openRsvpBtn.addEventListener('click', openRsvpDrawer);
    if (openRsvpBtnPageEnd) openRsvpBtnPageEnd.addEventListener('click', openRsvpDrawer);

    if (rsvpSheetOverlay) {
        rsvpSheetOverlay.addEventListener('click', (e) => {
            if (e.target === rsvpSheetOverlay) {
                rsvpSheetOverlay.classList.remove('active');
            }
        });
    }

    // Formulário de Confirmação Profissional (Salva no Sistema e Envia para Nuvem/Sheets)
    if (rsvpForm) {
        rsvpForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('guest-name').value.trim();
            const status = document.getElementById('attendance-status').value;
            const count = document.getElementById('companion-count').value;
            const message = document.getElementById('guest-note').value.trim();

            if (!name) {
                alert('Por favor, informe seu nome.');
                return;
            }

            const record = {
                name: name,
                status: status,
                count: count,
                message: message,
                date: new Date().toISOString()
            };

            // 1. Salvar no localStorage local como fallback
            const existingData = JSON.parse(localStorage.getItem('edileuza_rsvp_data') || '[]');
            existingData.push(record);
            localStorage.setItem('edileuza_rsvp_data', JSON.stringify(existingData));

            // 2. Se houver Webhook do Google Sheets configurado, enviar em nuvem
            if (EVENT_CONFIG.googleSheetWebhookUrl && EVENT_CONFIG.googleSheetWebhookUrl.trim() !== '') {
                fetch(EVENT_CONFIG.googleSheetWebhookUrl, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(record)
                }).catch(() => {});
            }

            // 3. Fechar gaveta e mostrar mensagem de sucesso profissional
            if (rsvpSheetOverlay) rsvpSheetOverlay.classList.remove('active');
            showRsvpSuccessModal(name, status);

            // Limpar formulário
            rsvpForm.reset();
        });
    }

    // Botão Adicionar ao Calendário
    const calendarBtn = document.getElementById('add-calendar-btn');
    if (calendarBtn) {
        calendarBtn.addEventListener('click', generateCalendarEvent);
    }
}

// --------------------------------------------------------------------------
// 4. Modal de Sucesso de Confirmação na Tela
// --------------------------------------------------------------------------
function showRsvpSuccessModal(name, status) {
    let successModal = document.getElementById('rsvp-success-modal');
    
    if (!successModal) {
        successModal = document.createElement('div');
        successModal.id = 'rsvp-success-modal';
        successModal.className = 'bottom-sheet-overlay';
        successModal.innerHTML = `
            <div class="bottom-sheet-drawer" style="text-align: center; padding: 35px 24px;">
                <div class="sheet-drag-handle"></div>
                <div style="font-size: 3rem; margin-bottom: 10px;">🎉</div>
                <h3 id="success-guest-title" class="drawer-title" style="font-size: 1.5rem; color: var(--gold-dark);">Presença Confirmada!</h3>
                <p id="success-guest-msg" class="drawer-sub" style="margin: 12px 0 24px; line-height: 1.5; color: var(--text-primary);">
                    Sua presença foi registrada com sucesso no sistema da família. Edileuza espera por você dia 27 de Setembro no Rancho Nunes!
                </p>
                <button id="btn-close-success" class="btn-drawer-send" style="width: 100%; border-radius: 20px;">
                    Perfeito, Obrigado! ✨
                </button>
            </div>
        `;
        document.body.appendChild(successModal);

        document.getElementById('btn-close-success').addEventListener('click', () => {
            successModal.classList.remove('active');
        });
    }

    const titleEl = document.getElementById('success-guest-title');
    const msgEl = document.getElementById('success-guest-msg');

    if (status === 'sim') {
        titleEl.textContent = `Presença Confirmada, ${name}!`;
        msgEl.textContent = `Sua presença foi registrada no sistema com sucesso. Edileuza espera por você dia 27 de Setembro às 10h no Rancho Nunes!`;
    } else {
        titleEl.textContent = `Agradecemos por Avisar, ${name}`;
        msgEl.textContent = `Registramos sua resposta no sistema. Sentiremos sua falta nesta celebração especial!`;
    }

    setTimeout(() => {
        successModal.classList.add('active');
    }, 100);
}

// --------------------------------------------------------------------------
// 5. Geração de Evento de Calendário
// --------------------------------------------------------------------------
function generateCalendarEvent() {
    const title = encodeURIComponent("80 Anos de Edileuza");
    const details = encodeURIComponent("Celebração dos 80 anos de vida da querida Edileuza no Rancho Nunes. Venha comemorar conosco!");
    const location = encodeURIComponent(EVENT_CONFIG.locationName + " - " + EVENT_CONFIG.locationAddress);
    
    const startDate = "20260927T130000Z";
    const endDate = "20260927T190000Z";

    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&details=${details}&location=${location}`;
    
    window.open(gcalUrl, '_blank');
}
