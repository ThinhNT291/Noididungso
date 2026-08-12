// ==========================================
// 1. CẤU HÌNH & KHỞI TẠO DOM
// ==========================================
const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxk_Si6DqBHBpMZ_Thnmmf_3nnTLZCuwJaxY4V1oQZ-nXtcitVcbyJtuFf2jb1oBhQL/exec"; 

marked.setOptions({ breaks: true }); 

const skillSelect = document.getElementById('skill-select');
const langSelect = document.getElementById('language-select');
const levelSelect = document.getElementById('level-select');
const btnToggleCustom = document.getElementById('btn-toggle-custom');
const customPromptArea = document.getElementById('custom-prompt-area');
const customPromptText = document.getElementById('custom-prompt-text');
const customPromptImage = document.getElementById('custom-prompt-image');
const imageFileName = document.getElementById('image-file-name');
const btnApplyCustom = document.getElementById('btn-apply-custom');

const speakingWorkspace = document.getElementById('speaking-workspace');
const writingWorkspace = document.getElementById('writing-workspace');
const readAloudWorkspace = document.getElementById('read-aloud-workspace');
const assessmentBox = document.getElementById('assessment-box');
const resultSection = document.getElementById('result-section');
const btnSave = document.getElementById('btn-save');

// Timer DOM
const countdownDisplay = document.getElementById('countdown-display');
const prepTimerBanner = document.getElementById('prep-timer-banner');
const prepTimeDisplay = document.getElementById('prep-time-display');

// Speaking DOM
const speakingQuestionGrid = document.getElementById('speaking-question-grid');
const activeSpeakingPromptBox = document.getElementById('active-speaking-prompt-box');
const speakingPromptText = document.getElementById('speaking-prompt-text');
const btnRecord = document.getElementById('btn-record');
const btnStop = document.getElementById('btn-stop');
const audioPlayback = document.getElementById('audio-playback');
const canvas = document.getElementById('audio-visualizer');
const canvasCtx = canvas ? canvas.getContext('2d') : null;
const speakingMindmapArea = document.getElementById('speaking-mindmap-area');
const speakingMindmapSvg = document.getElementById('speaking-mindmap-svg');

// Writing DOM
const writingQuestionGrid = document.getElementById('writing-question-grid');
const activeWritingPromptBox = document.getElementById('active-writing-prompt-box');
const writingPromptText = document.getElementById('writing-prompt-text');
const writingPromptImage = document.getElementById('writing-prompt-image');
const writingInput = document.getElementById('writing-input');
const wordCountDisplay = document.getElementById('word-count');
const btnSubmitWriting = document.getElementById('btn-submit-writing');
const btnClearWriting = document.getElementById('btn-clear-writing');
const btnShowHints = document.getElementById('btn-show-hints');
const btnShowMindmap = document.getElementById('btn-show-mindmap');
const preWritingArea = document.getElementById('pre-writing-area');
const mindmapSvg = document.getElementById('mindmap-svg');
const hintsModal = document.getElementById('hints-modal');
const closeModal = document.getElementById('close-modal');
const hintsModalBody = document.getElementById('hints-modal-body');

// ĐÃ THÊM: DOM cho popup xem lại lịch sử
const historyModal = document.getElementById('history-modal');
const closeHistoryModal = document.getElementById('close-history-modal');
const historyModalBody = document.getElementById('history-modal-body');

// Read Aloud DOM
const readAloudQuestionGrid = document.getElementById('read-aloud-question-grid');
const activeReadAloudPromptBox = document.getElementById('active-read-aloud-prompt-box');
const readAloudPromptText = document.getElementById('read-aloud-prompt-text');
const btnPlaySample = document.getElementById('btn-play-sample');
const ttsSpeed = document.getElementById('tts-speed');
const ttsSpeedVal = document.getElementById('tts-speed-val');
const ttsStatus = document.getElementById('tts-status');
const btnRecordRead = document.getElementById('btn-record-read');
const btnStopRead = document.getElementById('btn-stop-read');
const audioPlaybackRead = document.getElementById('audio-playback-read');
const canvasRead = document.getElementById('audio-visualizer-read');
const canvasCtxRead = canvasRead ? canvasRead.getContext('2d') : null;
let audioPlayerTTS = null;

// Biến toàn cục
let currentSkill = 'speaking'; 
let customImageBase64 = null; 
let activePromptData = { text: "", image: null }; 
let cachedWritingHints = null;
let isPreloadingHints = false;
let systemQuestions = { speaking: [], writing: [] }; 
let currentSelectedGroup = null; 
let cachedWritingHintsError = null;

let mediaRecorder, audioChunks = [], audioCtx, analyser, animationId;
let mediaRecorderRead, audioChunksRead = [], audioCtxRead, analyserRead, animationIdRead;
let currentBlobRead = null;
let currentAudioBase64 = null;
let currentReadAloudAudioBase64 = null; // ĐÃ THÊM: audio base64 của bản ghi âm luyện đọc (để lưu vào lịch sử)
let currentSessionData = null;
let lastWritingSubmittedText = null; // ĐÃ THÊM: lưu lại bài viết vừa nộp, để có thể lưu vào lịch sử

let prepInterval, mainInterval;
let prepTimeRemaining = 60;
let mainTimeRemaining = 0;
let isMainRunning = false;

// ==========================================
// 2. KHỞI TẠO & CHUYỂN ĐỔI KỸ NĂNG
// ==========================================
const LANGUAGE_LEVELS = {
    english: [
        { value: "A1-A2 (Beginner)", text: "A1-A2 (Sơ cấp / IELTS 3.0-4.0)" },
        { value: "B1 (Intermediate)", text: "B1 (Trung cấp / IELTS 4.5-5.0)" },
        { value: "B2 (Upper-Intermediate)", text: "B2 (Trung cao / IELTS 5.5-6.5)", selected: true },
        { value: "C1 (Advanced)", text: "C1 (Cao cấp / IELTS 7.0-8.0)" },
        { value: "C2 (Proficient)", text: "C2 (Thành thạo / IELTS 8.5+)" }
    ],
    chinese: [
        { value: "HSK 1-2 (Sơ cấp)", text: "HSK 1 - HSK 2 (Sơ cấp)" },
        { value: "HSK 3-4 (Trung cấp)", text: "HSK 3 - HSK 4 (Trung cấp)", selected: true },
        { value: "HSK 5 (Cao cấp)", text: "HSK 5 (Cao cấp)" },
        { value: "HSK 6 (Thành thạo)", text: "HSK 6 (Thành thạo)" }
    ],
    russian: [
        { value: "TORFL A1-A2 (Elementary)", text: "Элементарный (A1-A2 / Sơ cấp)" },
        { value: "TORFL B1 (TRKI-1)", text: "ТРКИ-1 (B1 / Trung cấp)", selected: true },
        { value: "TORFL B2 (TRKI-2)", text: "ТРКИ-2 (B2 / Trung cao)" },
        { value: "TORFL C1-C2 (TRKI-3/4)", text: "ТРКИ-3/4 (C1-C2 / Cao cấp)" }
    ]
};

function updateLevelOptions(lang) {
    levelSelect.innerHTML = '';
    const levels = LANGUAGE_LEVELS[lang] || LANGUAGE_LEVELS.english;
    levels.forEach(lvl => {
        let opt = document.createElement('option');
        opt.value = lvl.value;
        opt.textContent = lvl.text;
        if (lvl.selected) opt.selected = true;
        levelSelect.appendChild(opt);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    skillSelect.value = 'speaking';
    loadHistory();
    fetchQuestionsFromGAS(); 
    langSelect.addEventListener('change', (e) => updateLevelOptions(e.target.value));
    updateLevelOptions(langSelect.value);
});

skillSelect.addEventListener('change', (e) => {
    currentSkill = e.target.value;
    resetWorkspace(currentSkill);
    
    speakingWorkspace.classList.add('hidden');
    writingWorkspace.classList.add('hidden');
    readAloudWorkspace.classList.add('hidden');

    if (currentSkill === 'writing') {
        writingWorkspace.classList.remove('hidden');
    } else if (currentSkill === 'speaking') {
        speakingWorkspace.classList.remove('hidden');
    } else if (currentSkill === 'read-aloud') {
        readAloudWorkspace.classList.remove('hidden');
    }
});

document.getElementById('toggle-left')?.addEventListener('click', () => document.getElementById('sidebar-left').classList.toggle('collapsed'));
document.getElementById('toggle-right')?.addEventListener('click', () => document.getElementById('sidebar-right').classList.toggle('collapsed'));

btnToggleCustom.addEventListener('click', () => customPromptArea.classList.toggle('hidden'));

customPromptImage.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        if(imageFileName) {
            imageFileName.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Đang đọc ảnh: ${file.name}...`;
            imageFileName.style.color = "#f39c12";
        }
        const reader = new FileReader();
        reader.onloadend = () => { 
            customImageBase64 = reader.result; 
            if(imageFileName) {
                imageFileName.innerHTML = `<i class="fas fa-check-circle"></i> Đã tải xong: ${file.name}`;
                imageFileName.style.color = "#27ae60";
            }
        };
        reader.readAsDataURL(file);
    } else {
        if(imageFileName) {
            imageFileName.innerHTML = "Chưa có ảnh nào";
            imageFileName.style.color = "#27ae60";
        }
        customImageBase64 = null;
    }
});

btnApplyCustom.addEventListener('click', async () => {
    const text = customPromptText.value.trim();
    if (!text && !customImageBase64) return alert("Vui lòng nhập chữ hoặc up ảnh!");
    
    const originalBtnHtml = btnApplyCustom.innerHTML;
    let finalPromptText = text;

    if (customImageBase64) {
        btnApplyCustom.innerHTML = '<i class="fas fa-spinner fa-spin"></i> AI đang phân tích...';
        btnApplyCustom.disabled = true;
        const payload = { action: 'analyze_image_prompt', image: customImageBase64 };
        try {
            const response = await fetch(GAS_WEB_APP_URL, { method: 'POST', body: JSON.stringify(payload) });
            const result = await response.json();
            if (result.success && result.data && result.data.extracted_prompt) {
                finalPromptText = text ? `${text}\n\n[AI Phân tích]:\n${result.data.extracted_prompt}` : `[AI Phân tích]:\n${result.data.extracted_prompt}`;
            }
        } catch (err) { console.error("Lỗi:", err); }
    }

    activePromptData = { text: finalPromptText, image: customImageBase64 };
    
    btnApplyCustom.innerHTML = originalBtnHtml;
    btnApplyCustom.disabled = false;
    customPromptArea.classList.add('hidden');
    
    document.getElementById('speaking-tabs').innerHTML = '';
    document.getElementById('writing-tabs').innerHTML = '';
    speakingMindmapArea.classList.add('hidden');
    preWritingArea?.classList.add('hidden');

    if(currentSkill === 'speaking') {
        speakingQuestionGrid.querySelectorAll('.q-btn').forEach(b => b.classList.remove('active'));
        activeSpeakingPromptBox.classList.remove('hidden');
        speakingPromptText.innerHTML = marked.parse(finalPromptText);
        
        const spkImage = document.getElementById('speaking-prompt-image');
        if (customImageBase64) { spkImage.src = customImageBase64; spkImage.classList.remove('hidden'); } 
        else spkImage.classList.add('hidden');
    } else if(currentSkill === 'writing') {
        writingQuestionGrid.querySelectorAll('.q-btn').forEach(b => b.classList.remove('active')); 
        activeWritingPromptBox.classList.remove('hidden');
        writingPromptText.innerHTML = marked.parse(finalPromptText);
        
        if (customImageBase64) { writingPromptImage.src = customImageBase64; writingPromptImage.classList.remove('hidden'); } 
        else writingPromptImage.classList.add('hidden');
        
        preloadHintsLogic();
    } else if(currentSkill === 'read-aloud') {
        if(activeReadAloudPromptBox) activeReadAloudPromptBox.classList.remove('hidden');
        if(readAloudPromptText) readAloudPromptText.innerHTML = marked.parse(finalPromptText);
    }
    startPrepTimer(); 
});

async function callBackendAPI(payload, loadingMessage, isMainAssessment = true, retriesLeft = 2) {
    if (isMainAssessment) {
        if (resultSection) resultSection.classList.remove('hidden');
        assessmentBox.innerHTML = `<span class="placeholder-text" style="color:#f39c12;"><i class="fas fa-spinner fa-spin"></i> ${loadingMessage}</span>`;
        if (btnSave) btnSave.classList.add('hidden');
    }
    try {
        const response = await fetch(GAS_WEB_APP_URL, { method: 'POST', body: JSON.stringify(payload) });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const result = await response.json();
        if (!result.success) throw new Error(result.error);
        return result.data;
    } catch (err) {
        if (retriesLeft > 0) {
            if (isMainAssessment) assessmentBox.innerHTML = `<span class="placeholder-text" style="color:#f39c12;"><i class="fas fa-spinner fa-spin"></i> ${loadingMessage} (đang thử lại...)</span>`;
            await new Promise(res => setTimeout(res, 1500));
            return callBackendAPI(payload, loadingMessage, isMainAssessment, retriesLeft - 1);
        }
        if (isMainAssessment) assessmentBox.innerHTML = `<span style="color:red;"><i class="fas fa-exclamation-triangle"></i> Lỗi kết nối: ${err.message}</span>`;
        return null;
    }
}

// ==========================================
// 3. LOAD GRID ĐỀ BÀI VÀ QUẢN LÝ TAB
// ==========================================
async function fetchQuestionsFromGAS() {
    try {
        const response = await fetch(GAS_WEB_APP_URL + "?action=get_questions", { method: "GET", redirect: "follow" });
        const result = await response.json();
        
        if(result.success) {
            systemQuestions.speaking = groupQuestionsByTitle(result.data.speaking);
            systemQuestions.writing = groupQuestionsByTitle(result.data.writing);
            renderGrid(speakingQuestionGrid, systemQuestions.speaking, 'speaking');
            renderGrid(writingQuestionGrid, systemQuestions.writing, 'writing');
        } else throw new Error(result.error);
    } catch(e) {
        speakingQuestionGrid.innerHTML = `<span style="color:#e74c3c;">Lỗi: ${e.message}</span>`;
        writingQuestionGrid.innerHTML = `<span style="color:#e74c3c;">Lỗi: ${e.message}</span>`;
    }
}

function groupQuestionsByTitle(flatArray) {
    const groupedObj = {};
    flatArray.forEach(item => {
        if (!groupedObj[item.title]) groupedObj[item.title] = { title: item.title, parts: [] };
        groupedObj[item.title].parts.push({ partName: item.part, content: item.content });
    });
    return Object.values(groupedObj);
}

function renderGrid(container, groupedArray, skillType) {
    container.innerHTML = '';
    if (!groupedArray || groupedArray.length === 0) return container.innerHTML = '<span style="color:#7f8c8d;">Chưa có dữ liệu.</span>';
    groupedArray.forEach((q, idx) => {
        let btn = document.createElement('button');
        btn.className = 'q-btn';
        btn.innerHTML = q.title;
        btn.onclick = () => selectQuestion(skillType, idx, btn);
        container.appendChild(btn);
    });
}

function selectQuestion(skillType, index, btnElem) {
    resetWorkspace(skillType); 
    
    const gridContainer = skillType === 'speaking' ? speakingQuestionGrid : writingQuestionGrid;
    gridContainer.querySelectorAll('.q-btn').forEach(b => b.classList.remove('active'));
    btnElem.classList.add('active');

    currentSelectedGroup = systemQuestions[skillType][index];
    
    activePromptData = { 
        text: currentSelectedGroup.parts.map(p => `[${p.partName}]\n${p.content}`).join('\n\n'), 
        image: null 
    };

    const tabsContainerId = skillType === 'speaking' ? 'speaking-tabs' : 'writing-tabs';
    document.getElementById(tabsContainerId).innerHTML = currentSelectedGroup.parts.map((p, pIndex) => 
        `<button class="tab-btn ${pIndex === 0 ? 'active' : ''}" onclick="switchTab('${skillType}', ${pIndex})">${p.partName}</button>`
    ).join('');

    if (skillType === 'speaking') {
        activeSpeakingPromptBox.classList.remove('hidden');
    } else {
        activeWritingPromptBox.classList.remove('hidden');
        writingPromptImage.classList.add('hidden');
        preloadHintsLogic(); 
    }
    
    switchTab(skillType, 0);
    startPrepTimer(); 
}

window.switchTab = (skillType, partIndex) => {
    const tabsContainerId = skillType === 'speaking' ? 'speaking-tabs' : 'writing-tabs';
    document.getElementById(tabsContainerId).querySelectorAll('.tab-btn').forEach((t, i) => {
        if(i === partIndex) t.classList.add('active'); else t.classList.remove('active');
    });

    const partData = currentSelectedGroup.parts[partIndex];
    let displayText = partData.content;
    let hasMindmap = false;

    if (displayText.includes('# ')) {
        hasMindmap = true;
        displayText = displayText.substring(0, displayText.indexOf('# ')).trim();
    }

    if (skillType === 'speaking') {
        speakingPromptText.innerHTML = marked.parse(displayText);
        if (hasMindmap) {
            speakingMindmapArea.classList.remove('hidden');
            let markdownContent = partData.content.substring(partData.content.indexOf('# '));
            drawMindmapToSVG(markdownContent, speakingMindmapSvg);
        } else speakingMindmapArea.classList.add('hidden');
    } else {
        writingPromptText.innerHTML = marked.parse(displayText);
    }
}

function drawMindmapToSVG(markdownText, svgElement) {
    svgElement.innerHTML = ''; 
    try {
        const { Transformer, Markmap } = window.markmap;
        const transformer = new Transformer();
        const { root } = transformer.transform(markdownText);
        Markmap.create(svgElement, { 
            autoFit: true, 
            spacingHorizontal: 120,
            spacingVertical: 40
        }, root);
    } catch (err) {
        svgElement.innerHTML = `<text x="10" y="20" fill="red">Lỗi vẽ Sơ đồ: ${err.message}</text>`;
    }
}

// ==========================================
// 4. QUẢN LÝ ĐỒNG HỒ (PREP TIMER & MAIN TIMER)
// ==========================================
function startPrepTimer() {
    clearInterval(prepInterval);
    clearInterval(mainInterval);
    isMainRunning = false;
    prepTimeRemaining = 60;
    
    prepTimerBanner.classList.remove('hidden');
    prepTimeDisplay.textContent = prepTimeRemaining;
    updateMainTimerUI(true); 
    
    prepInterval = setInterval(() => {
        prepTimeRemaining--;
        prepTimeDisplay.textContent = prepTimeRemaining;
        if (prepTimeRemaining <= 0) {
            clearInterval(prepInterval);
            prepTimerBanner.classList.add('hidden');
            startMainTimer(); 
        }
    }, 1000);
}

function startMainTimer() {
    if (isMainRunning) return; 
    clearInterval(prepInterval);
    prepTimerBanner.classList.add('hidden');
    isMainRunning = true;
    
    let minutes = parseInt(document.getElementById('time-limit').value) || 0;
    mainTimeRemaining = minutes * 60;
    updateMainTimerUI();
    
    if (mainTimeRemaining > 0) {
        mainInterval = setInterval(() => {
            mainTimeRemaining--;
            updateMainTimerUI();
            if (mainTimeRemaining <= 0) {
                clearInterval(mainInterval);
                if (currentSkill === 'speaking' && mediaRecorder?.state === "recording") btnStop.click();
                if (currentSkill === 'writing') btnSubmitWriting.click();
            }
        }, 1000);
    }
}

function updateMainTimerUI(reset = false) {
    let minutes = parseInt(document.getElementById('time-limit').value) || 0;
    if (minutes === 0) { countdownDisplay.textContent = "∞"; return; }
    
    let timeToDisplay = reset ? (minutes * 60) : mainTimeRemaining;
    let m = Math.floor(timeToDisplay / 60).toString().padStart(2, '0');
    let s = (timeToDisplay % 60).toString().padStart(2, '0');
    countdownDisplay.textContent = `${m}:${s}`;
}

// ==========================================
// 5. GỢI Ý & SOẠN THẢO (WRITING)
// ==========================================
async function preloadHintsLogic() {
    cachedWritingHints = null;
    cachedWritingHintsError = null;
    isPreloadingHints = true;
    btnShowHints.disabled = false;
    btnShowMindmap.disabled = false;
    btnShowHints.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang nạp Gợi ý ngầm...';
    
    const payload = { 
        action: 'get_writing_hints',
        language: langSelect.options[langSelect.selectedIndex].text, 
        level: levelSelect.options[levelSelect.selectedIndex].text,
        promptText: activePromptData.text, 
        promptImage: activePromptData.image 
    };
    
    try {
        const response = await fetch(GAS_WEB_APP_URL, { method: 'POST', body: JSON.stringify(payload) });
        const result = await response.json();
        
        if (result.success) {
            cachedWritingHints = result.data;
        } else {
            cachedWritingHintsError = result.error; 
        }
    } catch (err) { 
        cachedWritingHintsError = "Mất kết nối API: " + err.message;
        console.error("Lỗi:", err); 
    } 
    finally {
        isPreloadingHints = false;
        btnShowHints.innerHTML = '<i class="fas fa-lightbulb"></i> Phân tích & Gợi ý (Popup)';
        if (!hintsModal.classList.contains('hidden') && cachedWritingHints) renderHintsToModal(cachedWritingHints);
    }
}

const formatList = (data) => Array.isArray(data) ? `<ul class="hint-list">${data.map(item => `<li style="margin-bottom:6px;">${item}</li>`).join('')}</ul>` : `<p>${(data || "").replace(/\n/g, '<br>')}</p>`;

function renderHintsToModal(data) {
    hintsModalBody.innerHTML = `
        <div class="hint-section"><h4><i class="fas fa-search"></i> 1. Phân tích đề bài</h4>${formatList(data.analysis)}</div>
        <div class="hint-section"><h4><i class="fas fa-sitemap"></i> 2. Bố cục logic</h4>${formatList(data.organization)}</div>
        <div class="hint-section"><h4><i class="fas fa-chess-knight"></i> 3. Chiến lược đạt điểm cao</h4>${formatList(data.strategy?.advice)}
            <div style="margin-top:10px;"><strong>Từ vựng:</strong><br> ${(data.strategy?.vocabulary || []).map(v => `<span class="hint-pill">${v}</span>`).join('')}</div>
        </div>
        <div class="hint-section" style="background: #fdf2e9; padding: 15px; border-radius: 8px;"><h4><i class="fas fa-exclamation-triangle" style="color:#e74c3c;"></i> 4. Lỗi thường gặp</h4>${formatList(data.common_mistakes)}</div>
        <div class="hint-section"><h4><i class="fas fa-stopwatch"></i> 5. Kiểm tra 2 phút cuối</h4>${formatList(data.last_minute_check)}</div>
    `;
}

btnShowHints.addEventListener('click', () => {
    hintsModal.classList.remove('hidden');
    if (isPreloadingHints) {
        hintsModalBody.innerHTML = '<div style="text-align:center; padding: 30px;"><i class="fas fa-spinner fa-spin fa-2x"></i></div>';
    } else if (cachedWritingHints) {
        renderHintsToModal(cachedWritingHints);
    } else {
        hintsModalBody.innerHTML = `<span style="color:red; font-weight:bold;">Lỗi gợi ý: ${cachedWritingHintsError || "Hệ thống AI không phản hồi đúng định dạng JSON."}</span><br><br><small style="color:#7f8c8d;">Hãy thử chọn lại đề bài hoặc tải lại trang.</small>`;
    }
});

btnShowMindmap.addEventListener('click', () => {
    preWritingArea.classList.remove('hidden');
    if (isPreloadingHints) {
        mindmapSvg.innerHTML = '<text x="20" y="30" fill="#f39c12">Đang nạp dữ liệu Mindmap...</text>';
    } else if (cachedWritingHints && cachedWritingHints.mindmap_markdown) {
        drawMindmapToSVG(cachedWritingHints.mindmap_markdown, mindmapSvg);
    } else {
        mindmapSvg.innerHTML = '<text x="20" y="30" fill="red">Chưa có dữ liệu Sơ đồ. Hãy thử lấy Gợi ý lại.</text>';
    }
});

closeModal.addEventListener('click', () => hintsModal.classList.add('hidden'));

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal').forEach(modal => modal.classList.add('hidden'));
    }
});

writingInput.addEventListener('input', () => {
    const text = writingInput.value.trim();
    const words = text.length === 0 ? 0 : text.split(/\s+/).length;
    wordCountDisplay.innerHTML = `<i class="fas fa-pen-nib"></i> Số từ: ${words}`;
    wordCountDisplay.className = words < 120 ? 'word-count-warning' : 'word-count-good';
});

btnClearWriting.addEventListener('click', () => {
    if(confirm("Xóa toàn bộ bài viết hiện tại?")) {
        writingInput.value = '';
        writingInput.dispatchEvent(new Event('input'));
    }
});

btnSubmitWriting.addEventListener('click', async () => {
    const text = writingInput.value.trim();
    if (text.length < 10) return alert("Bài viết quá ngắn!");
    clearInterval(mainInterval); 
    
    const payload = {
        action: 'evaluate_writing',
        text: text,
        language: langSelect.options[langSelect.selectedIndex].text,
        level: levelSelect.options[levelSelect.selectedIndex].text,
        promptText: activePromptData.text,
        promptImage: activePromptData.image
    };

    lastWritingSubmittedText = text; // ĐÃ THÊM: lưu lại để dùng khi bấm "Lưu bài"
    const data = await callBackendAPI(payload, "Giám khảo AI đang chấm bài Viết...");
    if (data) renderWritingAssessment(data);
});

// ==========================================
// 6. MODULE SPEAKING 
// ==========================================
btnRecord.addEventListener('click', async () => {
    if (!activePromptData.text) return alert("Hãy chọn đề bài trước khi ghi âm!");
    startMainTimer();

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];
        startVisualizer(stream);

        mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunks.push(e.data); };
        mediaRecorder.onstop = () => {
            currentBlob = new Blob(audioChunks, { type: 'audio/webm' }); 
            audioPlayback.src = URL.createObjectURL(currentBlob);
            audioPlayback.classList.remove('hidden');
            processAudioAndSend(currentBlob);
        };
        mediaRecorder.start();
        btnRecord.disabled = true;
        btnRecord.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Đang thu...';
        btnStop.disabled = false;
    } catch (err) { alert("Lỗi Micro: " + err.message); }
});

btnStop.addEventListener('click', () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
        btnRecord.disabled = false;
        btnRecord.innerHTML = '<i class="fas fa-microphone"></i> Ghi âm lại';
        btnStop.disabled = true;
        clearInterval(mainInterval);
        stopVisualizer();
    }
});

function processAudioAndSend(blob) {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = async () => {
        currentAudioBase64 = reader.result;
        const payload = { action: 'evaluate_speaking', audio: reader.result, mimeType: blob.type, language: langSelect.options[langSelect.selectedIndex].text, level: levelSelect.options[levelSelect.selectedIndex].text, promptText: activePromptData.text, promptImage: activePromptData.image };
        const data = await callBackendAPI(payload, "Giám khảo AI đang phân tích âm thanh của bạn...");
        if (data) renderSpeakingAssessment(data);
    };
}

function startVisualizer(stream) {
    if (!canvas) return;
    canvas.classList.remove('hidden');
    canvas.width = canvas.parentElement.clientWidth; 
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    const source = audioCtx.createMediaStreamSource(stream);
    source.connect(analyser);
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    function draw() {
        animationId = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);
        canvasCtx.fillStyle = '#2c3e50';
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
        const barWidth = (canvas.width / bufferLength) * 2.5;
        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
            let barHeight = dataArray[i] / 2;
            canvasCtx.fillStyle = `rgb(${barHeight + 100}, 211, 230)`;
            canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
            x += barWidth + 1;
        }
    }
    draw();
}

function stopVisualizer() {
    cancelAnimationFrame(animationId);
    if (audioCtx) audioCtx.close();
    if (canvasCtx && canvas) canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
}

// ==========================================
// 7. MODULE LUYỆN ĐỌC (READ ALOUD - SHADOWING & TTS)
// ==========================================
function startVisualizerRead(stream) {
    if (!canvasRead) return;
    canvasRead.classList.remove('hidden');
    canvasRead.width = canvasRead.parentElement.clientWidth; 
    audioCtxRead = new (window.AudioContext || window.webkitAudioContext)();
    analyserRead = audioCtxRead.createAnalyser();
    const source = audioCtxRead.createMediaStreamSource(stream);
    source.connect(analyserRead);
    analyserRead.fftSize = 256;
    const bufferLength = analyserRead.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    function draw() {
        animationIdRead = requestAnimationFrame(draw);
        analyserRead.getByteFrequencyData(dataArray);
        canvasCtxRead.fillStyle = '#2c3e50';
        canvasCtxRead.fillRect(0, 0, canvasRead.width, canvasRead.height);
        const barWidth = (canvasRead.width / bufferLength) * 2.5;
        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
            let barHeight = dataArray[i] / 2;
            canvasCtxRead.fillStyle = `rgb(${barHeight + 100}, 211, 230)`;
            canvasCtxRead.fillRect(x, canvasRead.height - barHeight, barWidth, barHeight);
            x += barWidth + 1;
        }
    }
    draw();
}

function stopVisualizerRead() {
    cancelAnimationFrame(animationIdRead);
    if (audioCtxRead) audioCtxRead.close();
    if (canvasRead && canvasCtxRead) canvasCtxRead.clearRect(0, 0, canvasRead.width, canvasRead.height);
}
if (btnRecordRead) {
    btnRecordRead.addEventListener('click', async () => {
        if (!activePromptData.text) return alert("Hãy chọn đề bài trước!");
        startMainTimer();

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            let options = MediaRecorder.isTypeSupported('audio/webm') ? { mimeType: 'audio/webm' } : { mimeType: 'audio/mp4' };
            
            mediaRecorderRead = new MediaRecorder(stream, options);
            audioChunksRead = [];
            startVisualizerRead(stream);

            mediaRecorderRead.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRead.push(e.data); };
            mediaRecorderRead.onstop = () => {
                let actualMimeType = mediaRecorderRead.mimeType || 'audio/mp4';
                currentBlobRead = new Blob(audioChunksRead, { type: actualMimeType }); 
                audioPlaybackRead.src = URL.createObjectURL(currentBlobRead);
                audioPlaybackRead.classList.remove('hidden');
                processAudioReadAndSend(currentBlobRead);
            };
            
            mediaRecorderRead.start();
            btnRecordRead.disabled = true;
            btnRecordRead.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Đang thu...';
            btnStopRead.classList.remove('hidden');
        } catch (err) { alert("Lỗi Micro: " + err.message); }
    });
}

if (btnStopRead) {
    btnStopRead.addEventListener('click', () => {
        if (mediaRecorderRead && mediaRecorderRead.state === "recording") {
            mediaRecorderRead.stop();
            mediaRecorderRead.stream.getTracks().forEach(track => track.stop());
            btnRecordRead.disabled = false;
            btnRecordRead.innerHTML = '<i class="fas fa-microphone"></i> Ghi âm lại';
            btnStopRead.classList.add('hidden');
            clearInterval(mainInterval);
            stopVisualizerRead();
        }
    });
}

async function processAudioReadAndSend(blob) {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = async () => {
        const base64Audio = reader.result;
        currentReadAloudAudioBase64 = base64Audio; // ĐÃ THÊM: lưu lại để dùng khi bấm "Lưu bài"
        const payload = { 
            action: 'evaluate_read_aloud', 
            audio: base64Audio, 
            mimeType: blob.type, 
            language: langSelect.options[langSelect.selectedIndex].text, 
            level: levelSelect.options[levelSelect.selectedIndex].text, 
            promptText: activePromptData.text 
        };
        
        if (resultSection) resultSection.classList.remove('hidden');
        assessmentBox.innerHTML = `<span class="placeholder-text" style="color:#f39c12;"><i class="fas fa-spinner fa-spin"></i> Giám khảo AI đang đối chiếu từng từ trong bài Luyện đọc...</span>`;
        
        const data = await callBackendAPI(payload, "Đang phân tích độ chuẩn xác...", true);
        if (data) renderReadAloudAssessment(data);
    };
}

// ĐÃ SỬA: tách phần dựng HTML ra hàm riêng để tái dùng được khi xem lại lịch sử
function buildReadAloudAssessmentHTML(data) {
    return `
        <div style="background: #2c3e50; padding: 20px; border-radius: 12px; color: white; margin-bottom: 20px;">
            <h2 style="margin:0; color:#f1c40f;"><i class="fas fa-star"></i> Điểm bài đọc: ${data.score}/10</h2>
            <p>Độ chính xác âm thanh: <strong>${data.accuracy_percent}%</strong></p>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
            <div style="background:#e8f8f5; padding:15px; border-radius:8px; border-left: 5px solid #27ae60;">
                <h4 style="color:#27ae60; margin-top:0;">Điểm mạnh</h4>
                <ul>${(data.strengths || []).map(s => `<li>${s}</li>`).join('')}</ul>
            </div>
            <div style="background:#fdedec; padding:15px; border-radius:8px; border-left: 5px solid #e74c3c;">
                <h4 style="color:#e74c3c; margin-top:0;">Cần cải thiện</h4>
                <ul>${(data.weaknesses || []).map(w => `<li>${w}</li>`).join('')}</ul>
            </div>
        </div>
        <div style="margin-bottom:20px;">
            <h4><i class="fas fa-comments"></i> Nhận xét chuyên sâu</h4>
            <p style="background:#f4f4f4; padding:15px; border-radius:8px;">${data.detailed_feedback}</p>
        </div>
        <div style="background:#fff3cd; padding:15px; border-radius:8px; border: 1px solid #ffeeba;">
            <h4><i class="fas fa-chalkboard-teacher"></i> Bài tập khắc phục lỗi</h4>
            <p><strong>Câu luyện tập:</strong> <em>${data.drill_sentence}</em></p>
            <p>${data.roadmap}</p>
        </div>
    `;
}

function renderReadAloudAssessment(data) {
    assessmentBox.innerHTML = buildReadAloudAssessmentHTML(data);
    currentSessionData = { type: 'read-aloud', ...data };
    if (btnSave) btnSave.classList.remove('hidden');
}

// ==========================================
// 8. RENDER KẾT QUẢ SPEAKING & WRITING
// ==========================================
// ĐÃ SỬA: tách phần dựng HTML ra hàm riêng để tái dùng được khi xem lại lịch sử
function buildSpeakingAssessmentHTML(data) {
    return `
        <div style="background: linear-gradient(135deg, #2ecc71, #27ae60); padding: 15px; border-radius: 8px; color: white; margin-bottom: 20px;">
            <h3 style="margin: 0 0 10px 0; color: white;"><i class="fas fa-award"></i> Trình độ ước tính: <span style="color: #ffeaa7;">${data.estimated_level}</span></h3>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                <div style="flex:1; background:rgba(255,255,255,0.2); padding: 10px; border-radius:8px; text-align:center;"><small>Phát âm</small><br><strong>${data.scores?.pronunciation || 0}/10</strong></div>
                <div style="flex:1; background:rgba(255,255,255,0.2); padding: 10px; border-radius:8px; text-align:center;"><small>Trôi chảy</small><br><strong>${data.scores?.fluency || 0}/10</strong></div>
                <div style="flex:1; background:rgba(255,255,255,0.2); padding: 10px; border-radius:8px; text-align:center;"><small>Từ vựng</small><br><strong>${data.scores?.vocabulary || 0}/10</strong></div>
                <div style="flex:1; background:rgba(255,255,255,0.2); padding: 10px; border-radius:8px; text-align:center;"><small>Ngữ pháp</small><br><strong>${data.scores?.grammar || 0}/10</strong></div>
            </div>
        </div>
        <h4><i class="fas fa-quote-left"></i> Bản Transcript:</h4>
        <p style="white-space: pre-wrap; background: #f8f9fa; padding: 15px; border-radius: 6px; font-style: italic; margin-bottom: 20px;">${data.transcript}</p>
        <div style="display: flex; gap: 15px; margin-bottom: 20px; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 200px; border-left: 4px solid #27ae60; padding-left: 10px;">
                <h4 style="color:#27ae60; margin-bottom: 5px;"><i class="fas fa-check-circle"></i> Điểm mạnh</h4>
                ${formatList(data.analysis?.strengths)}
            </div>
            <div style="flex: 1; min-width: 200px; border-left: 4px solid #e74c3c; padding-left: 10px;">
                <h4 style="color:#e74c3c; margin-bottom: 5px;"><i class="fas fa-times-circle"></i> Cần cải thiện</h4>
                ${formatList(data.analysis?.weaknesses)}
            </div>
        </div>
        <h4 style="color:#d35400; border-bottom: 1px solid #ccc; padding-bottom: 5px;"><i class="fas fa-search"></i> Phân tích lỗi</h4>
        <ul style="padding-left: 0; list-style: none; margin-bottom: 20px;">
            ${(data.errors && data.errors.length > 0) ? data.errors.map(err => `<li style="margin-bottom: 10px; background: #fdf2e9; padding: 10px; border-radius: 6px;"><del style="color:red; font-weight: bold;">${err.original_phrase}</del> &rarr; <strong style="color:green;">${err.correction}</strong><br><small style="color:#555;">${err.reason}</small></li>`).join('') : '<li style="color:green; padding: 10px;">Tuyệt vời! Không phát hiện lỗi nghiêm trọng.</li>'}
        </ul>
        <h4 style="color:#8e44ad;"><i class="fas fa-route"></i> Lộ trình thăng cấp</h4>
        ${formatList(data.how_to_improve)}
        <h4 style="color:#2980b9;"><i class="fas fa-magic"></i> Câu trả lời mẫu</h4>
        <p style="white-space: pre-wrap; background:#eafaf1; padding: 15px; border-left: 4px solid #2980b9; border-radius: 4px; margin-bottom: 20px;">${data.better_version}</p>
        <div style="white-space: pre-wrap; margin-bottom: 20px;"><strong>Nhận xét chung:</strong><br>${data.feedback}</div>
    `;
}

function renderSpeakingAssessment(data) {
    assessmentBox.innerHTML = buildSpeakingAssessmentHTML(data);
    currentSessionData = { type: 'speaking', ...data };
    if (btnSave) btnSave.classList.remove('hidden');
}

// ĐÃ SỬA: tách phần dựng HTML ra hàm riêng để tái dùng được khi xem lại lịch sử
function buildWritingAssessmentHTML(data) {
    return `
        <div style="background: linear-gradient(135deg, #8e44ad, #9b59b6); padding: 15px; border-radius: 8px; color: white; margin-bottom: 20px;">
            <h3 style="margin: 0 0 10px 0; color: white;"><i class="fas fa-award"></i> Trình độ ước tính: <span style="color: #ffeaa7;">${data.estimated_level}</span></h3>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                <div style="flex:1; background:rgba(255,255,255,0.2); padding: 10px; border-radius:8px; text-align:center;"><small>Task</small><br><strong>${data.scores?.task_achievement || 0}/10</strong></div>
                <div style="flex:1; background:rgba(255,255,255,0.2); padding: 10px; border-radius:8px; text-align:center;"><small>Coherence</small><br><strong>${data.scores?.coherence || 0}/10</strong></div>
                <div style="flex:1; background:rgba(255,255,255,0.2); padding: 10px; border-radius:8px; text-align:center;"><small>Vocabulary</small><br><strong>${data.scores?.vocabulary || 0}/10</strong></div>
                <div style="flex:1; background:rgba(255,255,255,0.2); padding: 10px; border-radius:8px; text-align:center;"><small>Grammar</small><br><strong>${data.scores?.grammar || 0}/10</strong></div>
            </div>
        </div>
        <div style="display: flex; gap: 15px; margin-bottom: 20px; flex-wrap: wrap;">
            <div style="flex: 1; border-left: 4px solid #27ae60; padding-left: 10px;">
                <h4 style="color:#27ae60; margin-bottom: 5px;"><i class="fas fa-check-circle"></i> Điểm mạnh</h4>
                ${formatList(data.analysis?.strengths)}
            </div>
            <div style="flex: 1; border-left: 4px solid #e74c3c; padding-left: 10px;">
                <h4 style="color:#e74c3c; margin-bottom: 5px;"><i class="fas fa-times-circle"></i> Cần khắc phục</h4>
                ${formatList(data.analysis?.weaknesses)}
            </div>
        </div>
    `;
}

function renderWritingAssessment(data) {
    assessmentBox.innerHTML = buildWritingAssessmentHTML(data);
    currentSessionData = { type: 'writing', ...data };
    if (btnSave) btnSave.classList.remove('hidden');
}

// ==========================================
// 9. LỊCH SỬ & NÚT ĐỀ NGẪU NHIÊN
// ==========================================
document.getElementById('btn-random-prompt')?.addEventListener('click', async () => {
    const btnRandom = document.getElementById('btn-random-prompt');
    const originalText = btnRandom.innerHTML;
    
    btnRandom.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang tạo đề...';
    btnRandom.disabled = true;
    resetWorkspace(currentSkill);
    
    const payload = { action: 'get_random_prompt', language: langSelect.options[langSelect.selectedIndex].text, skill: currentSkill, level: levelSelect.options[levelSelect.selectedIndex].text };
    const data = await callBackendAPI(payload, "Đang nhờ AI sáng tác đề ngẫu nhiên...", false);
    btnRandom.innerHTML = originalText; 
    btnRandom.disabled = false;

    if (data) {
        const promptData = Array.isArray(data) ? data[0] : data;
        activePromptData = { text: promptData.content, image: null };
        let titleHtml = `**${promptData.title}**\n\n${promptData.content}`;

        if(currentSkill === 'speaking') {
            document.getElementById('speaking-question-grid-container').classList.add('hidden');
            activeSpeakingPromptBox.classList.remove('hidden');
            document.getElementById('speaking-tabs').innerHTML = '';
            speakingPromptText.innerHTML = marked.parse(titleHtml);
            document.getElementById('speaking-prompt-image').classList.add('hidden');
        } else if(currentSkill === 'writing') {
            document.getElementById('writing-question-grid-container').classList.add('hidden');
            activeWritingPromptBox.classList.remove('hidden');
            document.getElementById('writing-tabs').innerHTML = '';
            writingPromptText.innerHTML = marked.parse(titleHtml);
            writingPromptImage.classList.add('hidden');
            preloadHintsLogic();
        } else if(currentSkill === 'read-aloud') {
            if(activeReadAloudPromptBox) activeReadAloudPromptBox.classList.remove('hidden');
            if(readAloudPromptText) readAloudPromptText.innerHTML = marked.parse(titleHtml);
        }
        startPrepTimer();
    } else { 
        alert('Lỗi tạo đề ngẫu nhiên từ AI.'); 
    }
});

// ĐÃ SỬA TOÀN BỘ KHỐI NÀY: trước đây chỉ có xoá, giờ thêm Lưu bài + bấm-để-xem-lại cho cả 3 kỹ năng
function loadHistory() {
    const historyList = document.getElementById('history-list');
    let history = JSON.parse(localStorage.getItem('aiTestHistory')) || [];
    if (!historyList) return;
    if (history.length === 0) return historyList.innerHTML = '<li class="history-item empty-history">Chưa có bài lưu nào.</li>';
    historyList.innerHTML = '';
    [...history].reverse().forEach(item => {
        historyList.innerHTML += `
            <li class="history-item" onclick="openHistoryItem(${item.id})" style="cursor:pointer;">
                <div class="history-title">${item.title}<br><small style="color:#7f8c8d; font-weight:normal;">${item.date}</small></div>
                <i class="fas fa-ellipsis-v history-actions" onclick="event.stopPropagation(); document.getElementById('menu-${item.id}').style.display = document.getElementById('menu-${item.id}').style.display === 'block' ? 'none' : 'block'"></i>
                <div class="action-menu" id="menu-${item.id}">
                    <button onclick="event.stopPropagation(); deleteItem(${item.id})" style="color:red;"><i class="fas fa-trash"></i> Xóa</button>
                </div>
            </li>
        `;
    });
}
window.deleteItem = (id) => { if(confirm("Xóa bài này?")) { localStorage.setItem('aiTestHistory', JSON.stringify((JSON.parse(localStorage.getItem('aiTestHistory')) || []).filter(item => item.id !== id))); loadHistory(); } }

// ĐÃ THÊM: nhãn hiển thị theo loại kỹ năng
function skillLabel(type) {
    if (type === 'speaking') return 'Nói';
    if (type === 'writing') return 'Viết';
    if (type === 'read-aloud') return 'Đọc (Shadowing)';
    return type;
}

// ĐÃ THÊM: upload audio (data URL base64) lên Google Drive qua action save_to_drive.
// Trả về {fileId, streamUrl, viewUrl} nếu thành công, null nếu lỗi (để nơi gọi tự fallback).
async function uploadAudioToDrive(audioDataUrl, filenamePrefix) {
    if (!audioDataUrl) return null;
    try {
        const payload = {
            action: 'save_to_drive',
            isAudio: true,
            filename: `${filenamePrefix}_${Date.now()}.webm`,
            content: audioDataUrl
        };
        const response = await fetch(GAS_WEB_APP_URL, { method: 'POST', body: JSON.stringify(payload) });
        const result = await response.json();
        if (result.success && result.data && result.data.fileId) return result.data;
        console.error("Lỗi upload Drive:", result.error);
        return null;
    } catch (err) {
        console.error("Lỗi upload Drive:", err);
        return null;
    }
}

// ĐÃ THÊM: lưu phiên làm việc hiện tại (đề bài + audio nếu có + bài làm/transcript + đánh giá) vào lịch sử.
// Audio giờ được đẩy thẳng lên Google Drive, localStorage chỉ giữ link phát lại (nhẹ, không lo đầy bộ nhớ).
async function saveCurrentSessionToHistory() {
    if (!currentSessionData) return alert("Chưa có kết quả đánh giá để lưu.");
    const type = currentSessionData.type;

    let audioBase64 = null;
    if (type === 'speaking') audioBase64 = currentAudioBase64;
    else if (type === 'read-aloud') audioBase64 = currentReadAloudAudioBase64;

    const rawPrompt = (activePromptData.text || '').replace(/\[.*?\]/g, '').replace(/[#*_`]/g, '').trim();
    const shortTitle = rawPrompt.length > 60 ? rawPrompt.slice(0, 60) + '…' : (rawPrompt || 'Bài tự do');

    const originalBtnHtml = btnSave ? btnSave.innerHTML : '';
    let driveAudio = null;

    if (audioBase64) {
        if (btnSave) { btnSave.disabled = true; btnSave.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang tải audio lên Drive...'; }
        driveAudio = await uploadAudioToDrive(audioBase64, type === 'speaking' ? 'Speaking' : 'Shadowing');
        if (btnSave) btnSave.disabled = false;
    }

    const item = {
        id: Date.now(),
        type: type,
        title: `[${skillLabel(type)}] ${shortTitle}`,
        date: new Date().toLocaleString('vi-VN'),
        promptText: activePromptData.text || '',
        promptImage: activePromptData.image || null,
        language: langSelect.options[langSelect.selectedIndex]?.text || '',
        level: levelSelect.options[levelSelect.selectedIndex]?.text || '',
        writingText: type === 'writing' ? (lastWritingSubmittedText || '') : null,
        // ĐÃ THÊM: ưu tiên lưu link Drive; chỉ giữ base64 trong localStorage khi upload Drive thất bại (fallback)
        driveAudio: driveAudio,
        audioBase64: driveAudio ? null : audioBase64,
        assessment: currentSessionData
    };

    let history = JSON.parse(localStorage.getItem('aiTestHistory')) || [];
    history.push(item);

    try {
        localStorage.setItem('aiTestHistory', JSON.stringify(history));
    } catch (e) {
        // ĐÃ THÊM: localStorage đầy (thường do audio quá nặng) -> thử lưu lại KHÔNG kèm audio thay vì mất trắng
        item.audioBase64 = null;
        history[history.length - 1] = item;
        try {
            localStorage.setItem('aiTestHistory', JSON.stringify(history));
            alert("Bộ nhớ trình duyệt gần đầy nên bài được lưu KHÔNG kèm audio. Các đánh giá/văn bản vẫn được giữ nguyên.");
        } catch (e2) {
            history.pop();
            alert("Không thể lưu bài — bộ nhớ trình duyệt (localStorage) đã đầy. Hãy xoá bớt vài bài cũ trong Lịch sử rồi thử lại.");
            return;
        }
    }

    if (audioBase64 && !driveAudio) {
        alert("Lưu ý: tải audio lên Google Drive không thành công, audio đã được giữ tạm trong bộ nhớ trình duyệt (localStorage) thay thế.");
    }

    loadHistory();
    if (btnSave) {
        btnSave.innerHTML = '<i class="fas fa-check"></i> Đã lưu!';
        setTimeout(() => { if (btnSave) btnSave.innerHTML = originalBtnHtml.includes('Đã lưu') ? '<i class="fas fa-save"></i> Lưu bài' : originalBtnHtml; }, 1500);
    }
}
btnSave?.addEventListener('click', saveCurrentSessionToHistory);

// ĐÃ THÊM: mở popup xem lại 1 bài đã lưu — đẩy ngược đề bài, audio, bài làm và đánh giá lên
window.openHistoryItem = (id) => {
    const history = JSON.parse(localStorage.getItem('aiTestHistory')) || [];
    const item = history.find(h => h.id === id);
    if (!item || !historyModalBody || !historyModal) return;

    let assessmentHtml = '';
    if (item.type === 'speaking') assessmentHtml = buildSpeakingAssessmentHTML(item.assessment);
    else if (item.type === 'writing') assessmentHtml = buildWritingAssessmentHTML(item.assessment);
    else if (item.type === 'read-aloud') assessmentHtml = buildReadAloudAssessmentHTML(item.assessment);

    // ĐÃ THÊM: ưu tiên phát audio từ Google Drive (item.driveAudio); các bài lưu trước đây
    // (chưa có Drive) vẫn phát được nhờ fallback về item.audioBase64.
    let audioHtml = '';
    if (item.driveAudio && item.driveAudio.streamUrl) {
        audioHtml = `<audio controls style="width:100%; margin-bottom:5px;" src="${item.driveAudio.streamUrl}"></audio>
            <div style="margin-bottom:15px;"><a href="${item.driveAudio.viewUrl}" target="_blank" style="font-size:0.8em; color:#7f8c8d;"><i class="fab fa-google-drive"></i> Mở file trên Google Drive</a></div>`;
    } else if (item.audioBase64) {
        audioHtml = `<audio controls style="width:100%; margin-bottom:15px;" src="${item.audioBase64}"></audio>`;
    }

    const promptImageHtml = item.promptImage
        ? `<img src="${item.promptImage}" style="max-width:100%; border-radius:8px; margin-bottom:15px;">`
        : '';

    const writingHtml = (item.type === 'writing' && item.writingText)
        ? `<h4 style="margin-bottom:8px;"><i class="fas fa-file-alt"></i> Bài viết đã nộp:</h4>
           <div class="content-box" style="margin-bottom:15px; white-space:pre-wrap;">${item.writingText.replace(/</g, '&lt;')}</div>`
        : '';

    historyModalBody.innerHTML = `
        <span class="close-btn" onclick="document.getElementById('history-modal').classList.add('hidden')" style="position:static; float:right;">&times;</span>
        <h2 style="color:#2c3e50; margin-bottom:5px; clear:both;">${item.title}</h2>
        <p style="color:#7f8c8d; font-size:0.85em; margin-bottom:15px;">${item.date} • ${item.language} • ${item.level}</p>
        <h4 style="margin-bottom:8px;"><i class="fas fa-file-signature"></i> Đề bài:</h4>
        <div class="content-box preserve-format" style="margin-bottom:15px;">${marked.parse(item.promptText || '')}</div>
        ${promptImageHtml}
        ${audioHtml}
        ${writingHtml}
        ${assessmentHtml}
    `;
    historyModal.classList.remove('hidden');
};

closeHistoryModal?.addEventListener('click', () => historyModal.classList.add('hidden'));

function resetWorkspace(skill) {
    clearInterval(prepInterval);
    clearInterval(mainInterval);
    isMainRunning = false;
    if(prepTimerBanner) prepTimerBanner.classList.add('hidden');
    if(countdownDisplay) countdownDisplay.textContent = "00:00";
    
    if(resultSection) resultSection.classList.add('hidden');
    if(assessmentBox) assessmentBox.innerHTML = '<span class="placeholder-text">Đợi một tý, kết quả phân tích chi tiết sẽ có ngay...</span>';
    if(btnSave) btnSave.classList.add('hidden');
    currentSessionData = null; // ĐÃ THÊM: tránh lưu nhầm kết quả cũ vào lịch sử sau khi reset

    if (skill === 'speaking') {
        audioChunks = []; currentAudioBase64 = null; if(audioPlayback) audioPlayback.classList.add('hidden');
        if(speakingMindmapArea) speakingMindmapArea.classList.add('hidden'); 
    } else if (skill === 'writing') {
        if(writingInput) { writingInput.value = ''; writingInput.dispatchEvent(new Event('input')); }
        preWritingArea?.classList.add('hidden'); 
        lastWritingSubmittedText = null;
    } else if (skill === 'read-aloud') {
        // ĐÃ THÊM: nhánh này trước đây chưa tồn tại — audio/bản ghi cũ của Shadowing không được dọn khi Reset
        audioChunksRead = []; currentBlobRead = null; currentReadAloudAudioBase64 = null;
        if (audioPlaybackRead) audioPlaybackRead.classList.add('hidden');
    }
}

document.getElementById('btn-redo-speaking')?.addEventListener('click', () => { resetWorkspace('speaking'); startPrepTimer(); });
document.getElementById('btn-redo-writing')?.addEventListener('click', () => { resetWorkspace('writing'); startPrepTimer(); });
document.getElementById('btn-new-speaking')?.addEventListener('click', () => { resetWorkspace('speaking'); document.getElementById('active-speaking-prompt-box').classList.add('hidden'); document.getElementById('speaking-question-grid-container').classList.remove('hidden'); });
document.getElementById('btn-new-writing')?.addEventListener('click', () => { resetWorkspace('writing'); document.getElementById('active-writing-prompt-box').classList.add('hidden'); document.getElementById('writing-question-grid-container').classList.remove('hidden'); });

function setupFreeMode(skill) {
    resetWorkspace(skill);
    activePromptData = { text: "Hãy thực hiện bài kiểm tra tự do không phụ thuộc vào đề bài cụ thể.", image: null };
    if (skill === 'speaking') {
        document.getElementById('speaking-question-grid-container').classList.add('hidden');
        document.getElementById('active-speaking-prompt-box').classList.remove('hidden');
        document.getElementById('speaking-tabs').innerHTML = ''; 
        speakingPromptText.innerHTML = marked.parse("🎤 **Chế độ Nói Tự Do:** Bấm Ghi âm để bắt đầu tính giờ làm bài!");
        document.getElementById('speaking-prompt-image').classList.add('hidden');
    } else {
        document.getElementById('writing-question-grid-container').classList.add('hidden');
        document.getElementById('active-writing-prompt-box').classList.remove('hidden');
        document.getElementById('writing-tabs').innerHTML = ''; 
        writingPromptText.innerHTML = marked.parse("✍️ **Chế độ Viết Tự Do:** Gõ bài viết của bạn bên dưới, hệ thống sẽ tự bắt đầu tính giờ.");
        document.getElementById('writing-prompt-image').classList.add('hidden');
        btnShowHints.disabled = true; 
    }
    startPrepTimer();
}
document.getElementById('btn-free-speaking')?.addEventListener('click', () => setupFreeMode('speaking'));
document.getElementById('btn-free-writing')?.addEventListener('click', () => setupFreeMode('writing'));
