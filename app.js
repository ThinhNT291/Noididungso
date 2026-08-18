// ==========================================
// 1. CẤU HÌNH & KHỞI TẠO DOM
// ==========================================
const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxk_Si6DqBHBpMZ_Thnmmf_3nnTLZCuwJaxY4V1oQZ-nXtcitVcbyJtuFf2jb1oBhQL/exec"; 

// ĐÃ THÊM: chỗ nối sẵn cho Google Sign-In sau này. Hiện tại web CHƯA có đăng nhập nên trả về null
// (Backend sẽ tự dùng chung 1 userId mặc định "default_user" cho mọi request không kèm userId).
// Sau này khi gắn Google Identity Services, chỉ cần sửa hàm này để trả về email/idToken thật của
// người đang đăng nhập — mọi nơi gọi getUserId() trong file này sẽ tự động dùng giá trị mới, không cần sửa gì khác.
function getUserId() {
    return null; // TODO: thay bằng email/idToken thật sau khi có Google Sign-In
}

// ĐÃ THÊM: quản lý phiên đăng nhập Google. Được index.html gọi (window.setAuthSession) ngay sau khi
// Backend xác nhận idToken hợp lệ + email nằm trong whitelist.
let currentIdToken = null;
function getIdToken() { return currentIdToken; }

window.setAuthSession = function(idToken, email) {
    currentIdToken = idToken;
    try { sessionStorage.setItem('gAuthIdToken', idToken); } catch (e) { /* private mode có thể chặn */ }
    // Có phiên hợp lệ rồi mới bắt đầu tải dữ liệu — trước đó backend sẽ từ chối mọi request.
    loadHistory();
    fetchQuestionsFromGAS();
    refreshSrsDueCount(); // ĐÃ THÊM: hiện badge số thẻ ôn tập lỗi sai cần ôn hôm nay
    refreshCurrentLevel(); // ĐÃ THÊM (Mastery): hiện badge cấp độ hiện tại, tự bật đặt trình độ nếu cần
};

window.clearAuthSession = function() {
    currentIdToken = null;
    try { sessionStorage.removeItem('gAuthIdToken'); } catch (e) { /* ignore */ }
};

// Nhận biết lỗi xác thực do Backend trả về (token hết hạn / email bị gỡ quyền giữa phiên làm việc)
function isAuthError(message) {
    return typeof message === 'string' && message.startsWith('AUTH_');
}

marked.setOptions({ breaks: true });

// ==========================================
// ĐÃ THÊM: CHỐNG XSS — dữ liệu chấm điểm (transcript, lỗi sai, nhận xét...) đến từ AI, nhưng AI được
// yêu cầu trích dẫn NGUYÊN VĂN lời nói/bài viết của học viên (vd transcript "verbatim"), tức là nội
// dung học viên tự gõ/nói CÓ THỂ quay lại nguyên xi trong JSON trả về. Đề bài tự nhập (custom-prompt)
// thì càng rõ ràng do chính người dùng tự gõ. Không có bước này, các giá trị đó bị nhét thẳng vào
// innerHTML sẽ cho phép chạy HTML/JS tuỳ ý ngay trong phiên đăng nhập của chính học viên đó (đọc được
// idToken trong sessionStorage, gọi API giả danh họ). MỌI nơi chèn text thuần (không phải markdown)
// vào innerHTML phải qua escapeHtml(); mọi nơi chèn kết quả marked.parse() phải qua safeMarkdown().
function escapeHtml(str) {
    return String(str == null ? '' : str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

// marked.parse() KHÔNG tự lọc HTML thô trong markdown (đây là hành vi mặc định của thư viện, không
// phải lỗi cấu hình) -> phải lọc qua DOMPurify trước khi gán innerHTML, để vẫn giữ được định dạng
// markdown (đậm/nghiêng/danh sách...) như ý đồ ban đầu nhưng loại bỏ thẻ/script nguy hiểm.
function safeMarkdown(text) {
    const rawHtml = marked.parse(text || '');
    return (window.DOMPurify) ? DOMPurify.sanitize(rawHtml) : escapeHtml(text);
}

const skillSelect = document.getElementById('skill-select');
const langSelect = document.getElementById('language-select');
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
let historyCache = []; // ĐÃ THÊM: cache danh sách lịch sử lấy từ backend (Google Sheet), dùng khi mở popup xem lại

let prepInterval, mainInterval;
let prepTimeRemaining = 60;
let mainTimeRemaining = 0;
let isMainRunning = false;

// ==========================================
// 2. KHỞI TẠO & CHUYỂN ĐỔI KỸ NĂNG
// ==========================================
// ĐÃ SỬA (Mastery): không còn dùng để đổ vào dropdown nữa (dropdown "Cấp độ mục tiêu" đã bị gỡ) —
// giờ chỉ dùng để tra "value" (mã cấp độ Backend trả về) sang "text" (tên hiển thị đẹp) cho badge
// và popup đặt trình độ. Key của object (english/chinese/russian) khớp đúng value của <select id=
// "language-select">, và mảng "value" từng cấp khớp NGUYÊN VĂN với MASTERY_LEVEL_ORDER bên Backend.
const LANGUAGE_LEVELS = {
    english: [
        { value: "A1-A2 (Beginner)", text: "A1-A2 (Sơ cấp / IELTS 3.0-4.0)" },
        { value: "B1 (Intermediate)", text: "B1 (Trung cấp / IELTS 4.5-5.0)" },
        { value: "B2 (Upper-Intermediate)", text: "B2 (Trung cao / IELTS 5.5-6.5)" },
        { value: "C1 (Advanced)", text: "C1 (Cao cấp / IELTS 7.0-8.0)" },
        { value: "C2 (Proficient)", text: "C2 (Thành thạo / IELTS 8.5+)" }
    ],
    chinese: [
        { value: "HSK 1-2 (Sơ cấp)", text: "HSK 1 - HSK 2 (Sơ cấp)" },
        { value: "HSK 3-4 (Trung cấp)", text: "HSK 3 - HSK 4 (Trung cấp)" },
        { value: "HSK 5 (Cao cấp)", text: "HSK 5 (Cao cấp)" },
        { value: "HSK 6 (Thành thạo)", text: "HSK 6 (Thành thạo)" }
    ],
    russian: [
        { value: "TORFL A1-A2 (Elementary)", text: "Элементарный (A1-A2 / Sơ cấp)" },
        { value: "TORFL B1 (TRKI-1)", text: "ТРКИ-1 (B1 / Trung cấp)" },
        { value: "TORFL B2 (TRKI-2)", text: "ТРКИ-2 (B2 / Trung cao)" },
        { value: "TORFL C1-C2 (TRKI-3/4)", text: "ТРКИ-3/4 (C1-C2 / Cao cấp)" }
    ]
};

document.addEventListener('DOMContentLoaded', () => {
    skillSelect.value = 'speaking';
    // ĐÃ SỬA: không gọi loadHistory()/fetchQuestionsFromGAS() ở đây nữa — Backend giờ yêu cầu đăng nhập
    // trước, các hàm này được gọi lại trong setAuthSession() ngay sau khi xác thực Google thành công.
    // ĐÃ SỬA (Mastery): đổi ngôn ngữ -> tải lại badge cấp độ (có thể tự bật popup đặt trình độ nếu cần).
    langSelect.addEventListener('change', () => refreshCurrentLevel());
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
    refreshCurrentLevel(); // ĐÃ THÊM (Mastery): đổi kỹ năng -> cấp độ theo dõi cũng đổi theo
});

document.getElementById('toggle-left')?.addEventListener('click', () => {
    document.getElementById('sidebar-left').classList.toggle('collapsed');
    document.querySelector('.app-container').classList.toggle('left-collapsed'); // ĐÃ THÊM: đổi luôn độ rộng cột lưới
});
document.getElementById('toggle-right')?.addEventListener('click', () => {
    document.getElementById('sidebar-right').classList.toggle('collapsed');
    document.querySelector('.app-container').classList.toggle('right-collapsed'); // ĐÃ THÊM: đổi luôn độ rộng cột lưới
});

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
        const payload = { action: 'analyze_image_prompt', image: customImageBase64, idToken: getIdToken() };
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
        speakingPromptText.innerHTML = safeMarkdown(finalPromptText);
        
        const spkImage = document.getElementById('speaking-prompt-image');
        if (customImageBase64) { spkImage.src = customImageBase64; spkImage.classList.remove('hidden'); } 
        else spkImage.classList.add('hidden');
    } else if(currentSkill === 'writing') {
        writingQuestionGrid.querySelectorAll('.q-btn').forEach(b => b.classList.remove('active')); 
        activeWritingPromptBox.classList.remove('hidden');
        writingPromptText.innerHTML = safeMarkdown(finalPromptText);
        
        if (customImageBase64) { writingPromptImage.src = customImageBase64; writingPromptImage.classList.remove('hidden'); } 
        else writingPromptImage.classList.add('hidden');
        
        preloadHintsLogic();
    } else if(currentSkill === 'read-aloud') {
        if(activeReadAloudPromptBox) activeReadAloudPromptBox.classList.remove('hidden');
        if(readAloudPromptText) readAloudPromptText.innerHTML = safeMarkdown(finalPromptText);
    }
    startPrepTimer(); 
});

async function callBackendAPI(payload, loadingMessage, isMainAssessment = true, retriesLeft = 2) {
    if (isMainAssessment) {
        if (resultSection) resultSection.classList.remove('hidden');
        assessmentBox.innerHTML = `<span class="placeholder-text" style="color:#f39c12;"><i class="fas fa-spinner fa-spin"></i> ${loadingMessage}</span>`;
        if (btnSave) btnSave.classList.add('hidden');
    }
    // ĐÃ THÊM: mọi request qua đây đều tự động kèm idToken hiện tại — không cần sửa từng nơi gọi callBackendAPI
    payload.idToken = getIdToken();
    try {
        const response = await fetch(GAS_WEB_APP_URL, { method: 'POST', body: JSON.stringify(payload) });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const result = await response.json();
        if (!result.success) throw new Error(result.error);
        return result.data;
    } catch (err) {
        // ĐÃ THÊM: nếu Backend từ chối vì lý do xác thực (token hết hạn/bị gỡ quyền giữa phiên),
        // đừng thử lại vô ích — bắt đăng nhập lại ngay.
        if (isAuthError(err.message)) {
            window.clearAuthSession && window.clearAuthSession();
            window.showLoginGate && window.showLoginGate(err.message.replace(/^AUTH_(REQUIRED|FORBIDDEN):\s*/, ''));
            if (isMainAssessment) assessmentBox.innerHTML = `<span style="color:red;"><i class="fas fa-exclamation-triangle"></i> Phiên đăng nhập đã hết, vui lòng đăng nhập lại.</span>`;
            return null;
        }
        if (retriesLeft > 0) {
            if (isMainAssessment) assessmentBox.innerHTML = `<span class="placeholder-text" style="color:#f39c12;"><i class="fas fa-spinner fa-spin"></i> ${loadingMessage} (đang thử lại...)</span>`;
            await new Promise(res => setTimeout(res, 1500));
            return callBackendAPI(payload, loadingMessage, isMainAssessment, retriesLeft - 1);
        }
        if (isMainAssessment) assessmentBox.innerHTML = `<span style="color:red;"><i class="fas fa-exclamation-triangle"></i> Lỗi kết nối: ${escapeHtml(err.message)}</span>`;
        return null;
    }
}

// ==========================================
// 3. LOAD GRID ĐỀ BÀI VÀ QUẢN LÝ TAB
// ==========================================
async function fetchQuestionsFromGAS() {
    try {
        // ĐÃ SỬA (bảo mật): gọi qua POST thay vì GET-kèm-idToken-trên-URL — token xác thực không nên
        // nằm trong query string (dễ lưu lại trong lịch sử trình duyệt / log truy cập). idToken bắt
        // buộc phải có (Backend chặn get_questions nếu thiếu/không hợp lệ).
        const response = await fetch(GAS_WEB_APP_URL, { method: "POST", body: JSON.stringify({ action: 'get_questions', idToken: getIdToken() }) });
        const result = await response.json();
        
        if(result.success) {
            systemQuestions.speaking = groupQuestionsByTitle(result.data.speaking);
            systemQuestions.writing = groupQuestionsByTitle(result.data.writing);
            renderGrid(speakingQuestionGrid, systemQuestions.speaking, 'speaking');
            renderGrid(writingQuestionGrid, systemQuestions.writing, 'writing');
        } else throw new Error(result.error);
    } catch(e) {
        speakingQuestionGrid.innerHTML = `<span style="color:#e74c3c;">Lỗi: ${escapeHtml(e.message)}</span>`;
        writingQuestionGrid.innerHTML = `<span style="color:#e74c3c;">Lỗi: ${escapeHtml(e.message)}</span>`;
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
        btn.innerHTML = escapeHtml(q.title); // q.title đến từ Google Sheet đề bài (admin quản lý), vẫn escape để phòng hờ
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
        `<button class="tab-btn ${pIndex === 0 ? 'active' : ''}" onclick="switchTab('${skillType}', ${pIndex})">${escapeHtml(p.partName)}</button>`
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
        speakingPromptText.innerHTML = safeMarkdown(displayText);
        if (hasMindmap) {
            speakingMindmapArea.classList.remove('hidden');
            let markdownContent = partData.content.substring(partData.content.indexOf('# '));
            drawMindmapToSVG(markdownContent, speakingMindmapSvg);
        } else speakingMindmapArea.classList.add('hidden');
    } else {
        writingPromptText.innerHTML = safeMarkdown(displayText);
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
        svgElement.innerHTML = `<text x="10" y="20" fill="red">Lỗi vẽ Sơ đồ: ${escapeHtml(err.message)}</text>`;
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
        // ĐÃ SỬA (Mastery): không còn gửi "level" — Backend tự tra cấp độ hiện tại (injectAutoLevel_).
        promptText: activePromptData.text,
        promptImage: activePromptData.image,
        idToken: getIdToken() // ĐÃ THÊM
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

// ĐÃ SỬA: escapeHtml() từng item trước khi nhét vào <li>/<p> — data ở đây là nhận xét/gợi ý do AI
// sinh ra dựa trên đề bài/bài làm của học viên (có thể chứa lại nguyên văn nội dung học viên tự gõ).
const formatList = (data) => Array.isArray(data) ? `<ul class="hint-list">${data.map(item => `<li style="margin-bottom:6px;">${escapeHtml(item)}</li>`).join('')}</ul>` : `<p>${escapeHtml(data || "").replace(/\n/g, '<br>')}</p>`;

function renderHintsToModal(data) {
    hintsModalBody.innerHTML = `
        <div class="hint-section"><h4><i class="fas fa-search"></i> 1. Phân tích đề bài</h4>${formatList(data.analysis)}</div>
        <div class="hint-section"><h4><i class="fas fa-sitemap"></i> 2. Bố cục logic</h4>${formatList(data.organization)}</div>
        <div class="hint-section"><h4><i class="fas fa-chess-knight"></i> 3. Chiến lược đạt điểm cao</h4>${formatList(data.strategy?.advice)}
            <div style="margin-top:10px;"><strong>Từ vựng:</strong><br> ${(data.strategy?.vocabulary || []).map(v => `<span class="hint-pill">${escapeHtml(v)}</span>`).join('')}</div>
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
        hintsModalBody.innerHTML = `<span style="color:red; font-weight:bold;">Lỗi gợi ý: ${escapeHtml(cachedWritingHintsError || "Hệ thống AI không phản hồi đúng định dạng JSON.")}</span><br><br><small style="color:#7f8c8d;">Hãy thử chọn lại đề bài hoặc tải lại trang.</small>`;
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
        // ĐÃ SỬA (Mastery): không còn gửi "level" — Backend tự tra cấp độ hiện tại (injectAutoLevel_).
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
        // ĐÃ SỬA (Mastery): không còn gửi "level" — Backend tự tra cấp độ hiện tại (injectAutoLevel_).
        const payload = { action: 'evaluate_speaking', audio: reader.result, mimeType: blob.type, language: langSelect.options[langSelect.selectedIndex].text, promptText: activePromptData.text, promptImage: activePromptData.image };
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
        // ĐÃ SỬA (Mastery): không còn gửi "level" — Shadowing không theo dõi mastery, nhưng để không
        // đổi hành vi Controller_Shadowing.gs (vốn không dùng payload.level), cứ để nguyên không gửi.
        const payload = {
            action: 'evaluate_read_aloud',
            audio: base64Audio,
            mimeType: blob.type,
            language: langSelect.options[langSelect.selectedIndex].text,
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
            <h2 style="margin:0; color:#f1c40f;"><i class="fas fa-star"></i> Điểm bài đọc: ${escapeHtml(data.score)}/10</h2>
            <p>Độ chính xác âm thanh: <strong>${escapeHtml(data.accuracy_percent)}%</strong></p>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
            <div style="background:#e8f8f5; padding:15px; border-radius:8px; border-left: 5px solid #27ae60;">
                <h4 style="color:#27ae60; margin-top:0;">Điểm mạnh</h4>
                <ul>${(data.strengths || []).map(s => `<li>${escapeHtml(s)}</li>`).join('')}</ul>
            </div>
            <div style="background:#fdedec; padding:15px; border-radius:8px; border-left: 5px solid #e74c3c;">
                <h4 style="color:#e74c3c; margin-top:0;">Cần cải thiện</h4>
                <ul>${(data.weaknesses || []).map(w => `<li>${escapeHtml(w)}</li>`).join('')}</ul>
            </div>
        </div>
        <div style="margin-bottom:20px;">
            <h4><i class="fas fa-comments"></i> Nhận xét chuyên sâu</h4>
            <p style="background:#f4f4f4; padding:15px; border-radius:8px;">${escapeHtml(data.detailed_feedback)}</p>
        </div>
        <div style="background:#fff3cd; padding:15px; border-radius:8px; border: 1px solid #ffeeba;">
            <h4><i class="fas fa-chalkboard-teacher"></i> Bài tập khắc phục lỗi</h4>
            <p><strong>Câu luyện tập:</strong> <em>${escapeHtml(data.drill_sentence)}</em></p>
            <p>${escapeHtml(data.roadmap)}</p>
        </div>
    `;
}

function renderReadAloudAssessment(data) {
    assessmentBox.innerHTML = buildReadAloudAssessmentHTML(data);
    currentSessionData = { type: 'read-aloud', ...data };
    if (btnSave) btnSave.classList.remove('hidden');
    scheduleFeedbackPopup(); // ĐÃ THÊM: chấm điểm thành công -> hẹn giờ bật popup xin phản hồi
}

// ==========================================
// 8. RENDER KẾT QUẢ SPEAKING & WRITING
// ==========================================
// ĐÃ SỬA: tách phần dựng HTML ra hàm riêng để tái dùng được khi xem lại lịch sử
function buildSpeakingAssessmentHTML(data) {
    return `
        <div style="background: linear-gradient(135deg, #2ecc71, #27ae60); padding: 15px; border-radius: 8px; color: white; margin-bottom: 20px;">
            <h3 style="margin: 0 0 10px 0; color: white;"><i class="fas fa-award"></i> Trình độ ước tính: <span style="color: #ffeaa7;">${escapeHtml(data.estimated_level)}</span></h3>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                <div style="flex:1; background:rgba(255,255,255,0.2); padding: 10px; border-radius:8px; text-align:center;"><small>Phát âm</small><br><strong>${data.scores?.pronunciation || 0}/10</strong></div>
                <div style="flex:1; background:rgba(255,255,255,0.2); padding: 10px; border-radius:8px; text-align:center;"><small>Trôi chảy</small><br><strong>${data.scores?.fluency || 0}/10</strong></div>
                <div style="flex:1; background:rgba(255,255,255,0.2); padding: 10px; border-radius:8px; text-align:center;"><small>Từ vựng</small><br><strong>${data.scores?.vocabulary || 0}/10</strong></div>
                <div style="flex:1; background:rgba(255,255,255,0.2); padding: 10px; border-radius:8px; text-align:center;"><small>Ngữ pháp</small><br><strong>${data.scores?.grammar || 0}/10</strong></div>
            </div>
        </div>
        <h4><i class="fas fa-quote-left"></i> Bản Transcript:</h4>
        <p style="white-space: pre-wrap; background: #f8f9fa; padding: 15px; border-radius: 6px; font-style: italic; margin-bottom: 20px;">${escapeHtml(data.transcript)}</p>
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
            ${(data.errors && data.errors.length > 0) ? data.errors.map(err => `<li style="margin-bottom: 10px; background: #fdf2e9; padding: 10px; border-radius: 6px;"><del style="color:red; font-weight: bold;">${escapeHtml(err.original_phrase)}</del> &rarr; <strong style="color:green;">${escapeHtml(err.correction)}</strong><br><small style="color:#555;">${escapeHtml(err.reason)}</small></li>`).join('') : '<li style="color:green; padding: 10px;">Tuyệt vời! Không phát hiện lỗi nghiêm trọng.</li>'}
        </ul>
        <h4 style="color:#8e44ad;"><i class="fas fa-route"></i> Lộ trình thăng cấp</h4>
        ${formatList(data.how_to_improve)}
        <h4 style="color:#2980b9;"><i class="fas fa-magic"></i> Câu trả lời mẫu</h4>
        <p style="white-space: pre-wrap; background:#eafaf1; padding: 15px; border-left: 4px solid #2980b9; border-radius: 4px; margin-bottom: 20px;">${escapeHtml(data.better_version)}</p>
        <div style="white-space: pre-wrap; margin-bottom: 20px;"><strong>Nhận xét chung:</strong><br>${escapeHtml(data.feedback)}</div>
    `;
}

function renderSpeakingAssessment(data) {
    assessmentBox.innerHTML = buildSpeakingAssessmentHTML(data);
    currentSessionData = { type: 'speaking', ...data };
    if (btnSave) btnSave.classList.remove('hidden');
    scheduleFeedbackPopup(); // ĐÃ THÊM: chấm điểm thành công -> hẹn giờ bật popup xin phản hồi
}

// ĐÃ SỬA: tách phần dựng HTML ra hàm riêng để tái dùng được khi xem lại lịch sử
function buildWritingAssessmentHTML(data) {
    return `
        <div style="background: linear-gradient(135deg, #8e44ad, #9b59b6); padding: 15px; border-radius: 8px; color: white; margin-bottom: 20px;">
            <h3 style="margin: 0 0 10px 0; color: white;"><i class="fas fa-award"></i> Trình độ ước tính: <span style="color: #ffeaa7;">${escapeHtml(data.estimated_level)}</span></h3>
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
        <!-- ĐÃ THÊM: AI đã trả về errors[] từ trước nhưng chưa từng được hiển thị ra đây — giờ show
             ra giống bên Speaking, đồng thời đây cũng chính là nguồn dữ liệu nạp vào thẻ ôn tập SRS. -->
        <h4 style="color:#d35400; border-bottom: 1px solid #ccc; padding-bottom: 5px;"><i class="fas fa-search"></i> Phân tích lỗi</h4>
        <ul style="padding-left: 0; list-style: none; margin-bottom: 20px;">
            ${(data.errors && data.errors.length > 0) ? data.errors.map(err => `<li style="margin-bottom: 10px; background: #fdf2e9; padding: 10px; border-radius: 6px;"><del style="color:red; font-weight: bold;">${escapeHtml(err.original_phrase)}</del> &rarr; <strong style="color:green;">${escapeHtml(err.correction)}</strong><br><small style="color:#555;">${escapeHtml(err.reason)}</small></li>`).join('') : '<li style="color:green; padding: 10px;">Tuyệt vời! Không phát hiện lỗi nghiêm trọng.</li>'}
        </ul>
    `;
}

function renderWritingAssessment(data) {
    assessmentBox.innerHTML = buildWritingAssessmentHTML(data);
    currentSessionData = { type: 'writing', ...data };
    if (btnSave) btnSave.classList.remove('hidden');
    scheduleFeedbackPopup(); // ĐÃ THÊM: chấm điểm thành công -> hẹn giờ bật popup xin phản hồi
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
    
    // ĐÃ SỬA (Mastery): không còn gửi "level" — Backend tự tra cấp độ hiện tại (injectAutoLevel_).
    const payload = { action: 'get_random_prompt', language: langSelect.options[langSelect.selectedIndex].text, skill: currentSkill };
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
            speakingPromptText.innerHTML = safeMarkdown(titleHtml);
            document.getElementById('speaking-prompt-image').classList.add('hidden');
        } else if(currentSkill === 'writing') {
            document.getElementById('writing-question-grid-container').classList.add('hidden');
            activeWritingPromptBox.classList.remove('hidden');
            document.getElementById('writing-tabs').innerHTML = '';
            writingPromptText.innerHTML = safeMarkdown(titleHtml);
            writingPromptImage.classList.add('hidden');
            preloadHintsLogic();
        } else if(currentSkill === 'read-aloud') {
            if(activeReadAloudPromptBox) activeReadAloudPromptBox.classList.remove('hidden');
            if(readAloudPromptText) readAloudPromptText.innerHTML = safeMarkdown(titleHtml);
        }
        startPrepTimer();
    } else { 
        alert('Lỗi tạo đề ngẫu nhiên từ AI.'); 
    }
});

// ĐÃ SỬA TOÀN BỘ KHỐI NÀY: trước đây chỉ có xoá, giờ thêm Lưu bài + bấm-để-xem-lại cho cả 3 kỹ năng
// ĐÃ SỬA: lịch sử giờ lấy từ backend (Google Sheet) qua action get_history_list, không còn đọc localStorage
// -> xem được từ bất kỳ thiết bị/trình duyệt nào, miễn là cùng userId (hiện tại dùng chung 1 userId mặc định).
async function loadHistory() {
    const historyList = document.getElementById('history-list');
    if (!historyList) return;
    historyList.innerHTML = '<li class="history-item empty-history"><i class="fas fa-spinner fa-spin"></i> Đang tải lịch sử...</li>';

    const payload = { action: 'get_history_list', idToken: getIdToken() };
    let history = [];
    try {
        const response = await fetch(GAS_WEB_APP_URL, { method: 'POST', body: JSON.stringify(payload) });
        const result = await response.json();
        if (result.success) history = result.data || [];
        else throw new Error(result.error);
    } catch (err) {
        historyList.innerHTML = `<li class="history-item empty-history" style="color:#e74c3c;">Lỗi tải lịch sử: ${escapeHtml(err.message)}</li>`;
        return;
    }

    historyCache = history;
    if (history.length === 0) return historyList.innerHTML = '<li class="history-item empty-history">Chưa có bài lưu nào.</li>';
    historyList.innerHTML = '';
    [...history].reverse().forEach(item => {
        historyList.innerHTML += `
            <li class="history-item" onclick="openHistoryItem(${item.id})" style="cursor:pointer;">
                <div class="history-title">${escapeHtml(item.title)}<br><small style="color:#7f8c8d; font-weight:normal;">${escapeHtml(item.date)}</small></div>
                <i class="fas fa-ellipsis-v history-actions" onclick="event.stopPropagation(); document.getElementById('menu-${item.id}').style.display = document.getElementById('menu-${item.id}').style.display === 'block' ? 'none' : 'block'"></i>
                <div class="action-menu" id="menu-${item.id}">
                    <button onclick="event.stopPropagation(); deleteItem(${item.id})" style="color:red;"><i class="fas fa-trash"></i> Xóa</button>
                </div>
            </li>
        `;
    });
}
window.deleteItem = async (id) => {
    if (!confirm("Xóa bài này?")) return;
    try {
        const payload = { action: 'delete_history_item', id: id, idToken: getIdToken() };
        const response = await fetch(GAS_WEB_APP_URL, { method: 'POST', body: JSON.stringify(payload) });
        const result = await response.json();
        if (!result.success) throw new Error(result.error);
    } catch (err) {
        alert("Không xoá được: " + err.message);
    }
    loadHistory();
}

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
            content: audioDataUrl,
            idToken: getIdToken() // ĐÃ THÊM
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

// ĐÃ SỬA: audio đẩy lên Drive như trước, nhưng bản ghi lịch sử giờ lưu lên Google Sheet qua backend
// (thay vì localStorage) -> mở web ở máy/điện thoại khác vẫn thấy đủ lịch sử.
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
    }

    const item = {
        id: Date.now(),
        type: type,
        title: `[${skillLabel(type)}] ${shortTitle}`,
        date: new Date().toLocaleString('vi-VN'),
        promptText: activePromptData.text || '',
        promptImage: activePromptData.image || null,
        language: langSelect.options[langSelect.selectedIndex]?.text || '',
        // ĐÃ SỬA (Mastery): không còn dropdown "Cấp độ mục tiêu" — dùng cấp độ tự động đang hiển thị
        // trên badge (lastKnownLevelDisplayText, cập nhật trong refreshCurrentLevel() ở mục 12 bên dưới).
        level: lastKnownLevelDisplayText || '',
        writingText: type === 'writing' ? (lastWritingSubmittedText || '') : null,
        driveAudio: driveAudio,
        assessment: currentSessionData
    };

    if (btnSave) { btnSave.disabled = true; btnSave.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lưu...'; }
    try {
        const payload = { action: 'save_history_item', idToken: getIdToken(), item: item };
        const response = await fetch(GAS_WEB_APP_URL, { method: 'POST', body: JSON.stringify(payload) });
        const result = await response.json();
        if (!result.success) throw new Error(result.error);
        // ĐÃ THÊM (Mastery): Backend báo lại nếu cấp độ vừa đổi (updateMasteryAfterAssessment_) ->
        // hiện toast chúc mừng/thông báo + tải lại badge cho khớp cấp mới.
        if (result.data && result.data.mastery && result.data.mastery.changed) {
            showLevelChangeToast(result.data.mastery.direction, result.data.mastery.newLevel);
            refreshCurrentLevel();
        }
    } catch (err) {
        if (btnSave) btnSave.disabled = false;
        return alert("Không lưu được bài: " + err.message);
    }

    if (audioBase64 && !driveAudio) {
        alert("Lưu ý: tải audio lên Google Drive không thành công, bài được lưu KHÔNG kèm audio.");
    }

    await loadHistory();
    if (btnSave) {
        btnSave.disabled = false;
        btnSave.innerHTML = '<i class="fas fa-check"></i> Đã lưu!';
        setTimeout(() => { if (btnSave) btnSave.innerHTML = originalBtnHtml.includes('Đã lưu') ? '<i class="fas fa-save"></i> Lưu bài' : originalBtnHtml; }, 1500);
    }
}
btnSave?.addEventListener('click', saveCurrentSessionToHistory);

// ĐÃ SỬA: mở popup xem lại 1 bài đã lưu — đọc từ historyCache (dữ liệu lấy về từ backend ở loadHistory)
// thay vì localStorage, vì lịch sử giờ nằm trên Google Sheet dùng chung cho mọi thiết bị.
window.openHistoryItem = (id) => {
    const item = historyCache.find(h => Number(h.id) === Number(id));
    if (!item || !historyModalBody || !historyModal) return;

    let assessmentHtml = '';
    if (item.type === 'speaking') assessmentHtml = buildSpeakingAssessmentHTML(item.assessment);
    else if (item.type === 'writing') assessmentHtml = buildWritingAssessmentHTML(item.assessment);
    else if (item.type === 'read-aloud') assessmentHtml = buildReadAloudAssessmentHTML(item.assessment);

    // ĐÃ SỬA: link uc?export=download không hỗ trợ tốt Range request nên thẻ <audio> không tua được.
    // Đổi sang nhúng trình phát có sẵn của Google Drive (/preview) — hỗ trợ tua đầy đủ như mở trực tiếp trên Drive.
    let audioHtml = '';
    if (item.driveAudio && item.driveAudio.fileId) {
        const previewUrl = `https://drive.google.com/file/d/${item.driveAudio.fileId}/preview`;
        audioHtml = `<iframe src="${previewUrl}" width="100%" height="80" allow="autoplay" style="border:none; border-radius:8px; margin-bottom:15px;"></iframe>`;
    } else if (item.audioBase64) {
        audioHtml = `<audio controls style="width:100%; margin-bottom:15px;" src="${item.audioBase64}"></audio>`;
    }

    // ĐÃ SỬA: cho bài Luyện đọc (read-aloud), thay vì hiện sẵn nút "Nghe giọng mẫu" (bấm mới gọi API),
    // giờ chỉ hiện chỗ trống + spinner ở đây — sau khi chèn xong innerHTML bên dưới sẽ tự động dò cache
    // (checkAndRenderHistorySample) và thay bằng: player phát ngay nếu đã có cache, hoặc nút bấm-để-tạo
    // nếu thực sự chưa có.
    let sampleAudioHtml = '';
    if (item.type === 'read-aloud') {
        sampleAudioHtml = `<div id="history-tts-slot-${item.id}" style="margin-bottom:12px; color:#7f8c8d; font-size:0.9em;"><i class="fas fa-spinner fa-spin"></i> Đang kiểm tra audio mẫu đã lưu trong cache...</div>`;
    }

    const promptImageHtml = item.promptImage
        ? `<img src="${escapeHtml(item.promptImage)}" style="max-width:100%; border-radius:8px; margin-bottom:15px;">`
        : '';

    const writingHtml = (item.type === 'writing' && item.writingText)
        ? `<h4 style="margin-bottom:8px;"><i class="fas fa-file-alt"></i> Bài viết đã nộp:</h4>
           <div class="content-box" style="margin-bottom:15px; white-space:pre-wrap;">${escapeHtml(item.writingText)}</div>`
        : '';

    historyModalBody.innerHTML = `
        <span class="close-btn" onclick="document.getElementById('history-modal').classList.add('hidden')" style="position:static; float:right;">&times;</span>
        <h2 style="color:#2c3e50; margin-bottom:5px; clear:both;">${escapeHtml(item.title)}</h2>
        <p style="color:#7f8c8d; font-size:0.85em; margin-bottom:15px;">${escapeHtml(item.date)} • ${escapeHtml(item.language)} • ${escapeHtml(item.level)}</p>
        <h4 style="margin-bottom:8px;"><i class="fas fa-file-signature"></i> Đề bài:</h4>
        <div class="content-box preserve-format" style="margin-bottom:15px;">${safeMarkdown(item.promptText || '')}</div>
        ${promptImageHtml}
        ${sampleAudioHtml}
        ${audioHtml}
        ${writingHtml}
        ${assessmentHtml}
    `;
    historyModal.classList.remove('hidden');

    if (item.type === 'read-aloud') checkAndRenderHistorySample(item); // ĐÃ THÊM
};

// ĐÃ THÊM: chuyển văn bản Markdown gốc (item.promptText) sang text thuần theo ĐÚNG cách Backend
// đã dùng để tính khoá cache lúc luyện tập trực tiếp (safeMarkdown() rồi lấy .innerText của phần
// tử đã render) — bắt buộc phải khớp y hệt, vì khoá cache là hash(text, voice); lệch 1 ký tự cũng
// tính là cache miss và tạo audio mới tốn quota.
function getPlainTextLikeLivePrompt_(rawMarkdown) {
    const tempEl = document.createElement('div');
    tempEl.style.cssText = 'position:absolute; left:-9999px; top:-9999px; visibility:hidden;';
    tempEl.innerHTML = safeMarkdown(rawMarkdown || '');
    document.body.appendChild(tempEl);
    const text = tempEl.innerText.trim();
    document.body.removeChild(tempEl);
    return text;
}

// ĐÃ THÊM: bộ giọng đang có trong <select id="voice-select"> ở phần luyện tập trực tiếp — vì lịch sử
// không lưu lại đã nghe bằng giọng nào, nên dò cache theo TẤT CẢ giọng cùng lúc (1 lượt gọi Backend).
const READ_ALOUD_TTS_VOICES_ = ['Aoede', 'Kore', 'Charon', 'Fenrir', 'Puck'];

// ĐÃ THÊM: tự động dò cache (KHÔNG gọi API Gemini, không tốn quota) ngay khi mở modal Lịch sử —
// nếu tìm thấy audio mẫu đã lưu sẵn thì hiện thẳng player để nghe ngay (giống player audio ghi âm),
// không cần bấm nút. Nếu chưa từng lưu, mới hiện nút để bấm-tạo-mới (lúc đó mới thực sự gọi Gemini).
async function checkAndRenderHistorySample(item) {
    const slot = document.getElementById(`history-tts-slot-${item.id}`);
    if (!slot) return;

    const cleanText = getPlainTextLikeLivePrompt_(item.promptText);

    try {
        const payload = { action: 'check_cached_audio', text: cleanText, voiceNames: READ_ALOUD_TTS_VOICES_, idToken: getIdToken() };
        const response = await fetch(GAS_WEB_APP_URL, { method: 'POST', cache: 'no-store', body: JSON.stringify(payload) });
        const result = await response.json();

        if (result.success && result.data && result.data.found) {
            slot.outerHTML = `
                <div style="background:#eafaf1; padding:12px 15px; border-radius:8px; margin-bottom:12px; border:1px solid #a3e4d7;">
                    <div style="font-size:0.85em; color:#27ae60; margin-bottom:6px;"><i class="fas fa-check-circle"></i> Giọng mẫu (${result.data.voiceName}) — lấy từ cache, không tốn thêm quota:</div>
                    <audio controls style="width:100%;" src="${result.data.audioBase64}"></audio>
                </div>
            `;
            return;
        }
    } catch (e) {
        console.warn("Dò cache audio mẫu thất bại:", e);
    }

    // Không thấy cache ở bất kỳ giọng nào (hoặc lượt kiểm tra bị lỗi) — hiện nút để bấm tạo mới nếu cần.
    slot.outerHTML = `
        <div style="background:#eafaf1; padding:12px 15px; border-radius:8px; margin-bottom:12px; border:1px solid #a3e4d7;">
            <div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
                <button class="btn" style="background:#27ae60; color:white;" id="history-tts-btn-${item.id}" onclick="playHistorySampleAudio(${item.id})">
                    <i class="fas fa-volume-up"></i> Nghe giọng mẫu (chưa có sẵn, sẽ tạo mới)
                </button>
                <span id="history-tts-status-${item.id}" style="font-size:0.9em; color:#e67e22; font-style:italic;"></span>
            </div>
            <audio id="history-tts-player-${item.id}" controls style="width:100%; display:none; margin-top:10px;"></audio>
        </div>
    `;
}

// ĐÃ SỬA: dùng đúng getPlainTextLikeLivePrompt_ thay vì regex tự chế, để nếu phải tạo mới,
// văn bản gửi đi khớp y hệt bản gốc — lần sau mở lại lịch sử sẽ dò thấy cache ngay.
window.playHistorySampleAudio = (itemId) => {
    const item = historyCache.find(h => Number(h.id) === Number(itemId));
    if (!item || !window.generateAndPlaySample) return;
    const cleanText = getPlainTextLikeLivePrompt_(item.promptText);
    window.generateAndPlaySample(cleanText, 'Charon', {
        btnId: `history-tts-btn-${item.id}`,
        statusId: `history-tts-status-${item.id}`,
        playerId: `history-tts-player-${item.id}`
        // Không có speedId — modal Lịch sử không có thanh chỉnh tốc độ riêng.
    });
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
    cancelFeedbackPopup(); // ĐÃ THÊM: làm lại/chọn đề khác giữa chừng -> huỷ hẹn giờ popup phản hồi cũ (nếu có)

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
        speakingPromptText.innerHTML = safeMarkdown("🎤 **Chế độ Nói Tự Do:** Bấm Ghi âm để bắt đầu tính giờ làm bài!");
        document.getElementById('speaking-prompt-image').classList.add('hidden');
    } else {
        document.getElementById('writing-question-grid-container').classList.add('hidden');
        document.getElementById('active-writing-prompt-box').classList.remove('hidden');
        document.getElementById('writing-tabs').innerHTML = ''; 
        writingPromptText.innerHTML = safeMarkdown("✍️ **Chế độ Viết Tự Do:** Gõ bài viết của bạn bên dưới, hệ thống sẽ tự bắt đầu tính giờ.");
        document.getElementById('writing-prompt-image').classList.add('hidden');
        btnShowHints.disabled = true; 
    }
    startPrepTimer();
}
document.getElementById('btn-free-speaking')?.addEventListener('click', () => setupFreeMode('speaking'));
document.getElementById('btn-free-writing')?.addEventListener('click', () => setupFreeMode('writing'));

// ==========================================
// 10. POPUP XIN PHẢN HỒI TRẢI NGHIỆM (~15s SAU KHI CHẤM ĐIỂM THÀNH CÔNG)
// ==========================================
// Sau mỗi lần render*Assessment() (Speaking/Writing/Read-aloud) thành công, hẹn giờ 15s rồi tự bật
// popup xin nhận xét. Bấm "Gửi" (khi có nội dung), hoặc bấm "Đóng"/dấu X khi ô ĐÃ có nội dung, đều
// gửi nội dung đó về Google Chat qua Backend (action 'send_feedback' — Backend mới là nơi gọi thẳng
// webhook Google Chat, tránh CORS khi gọi trực tiếp từ trình duyệt). Đóng khi ô trống thì không gửi gì.
const feedbackModal = document.getElementById('feedback-modal');
const feedbackTextarea = document.getElementById('feedback-textarea');
const feedbackBtnSend = document.getElementById('feedback-btn-send');
const feedbackBtnClose = document.getElementById('feedback-btn-close');
const feedbackCloseX = document.getElementById('feedback-close-x');
let feedbackPopupTimer = null;
const FEEDBACK_POPUP_DELAY_MS = 15000;

function scheduleFeedbackPopup() {
    if (!feedbackModal) return;
    cancelFeedbackPopup(); // tránh chồng nhiều lượt hẹn giờ nếu người dùng chấm điểm nhiều lần liên tiếp
    feedbackPopupTimer = setTimeout(() => {
        feedbackPopupTimer = null;
        if (feedbackTextarea) feedbackTextarea.value = '';
        feedbackModal.classList.remove('hidden');
    }, FEEDBACK_POPUP_DELAY_MS);
}

function cancelFeedbackPopup() {
    if (feedbackPopupTimer) { clearTimeout(feedbackPopupTimer); feedbackPopupTimer = null; }
    if (feedbackModal) feedbackModal.classList.add('hidden');
}

async function sendFeedbackToChat(message) {
    try {
        const payload = { action: 'send_feedback', message: message, skill: currentSkill, idToken: getIdToken() };
        const response = await fetch(GAS_WEB_APP_URL, { method: 'POST', body: JSON.stringify(payload) });
        const result = await response.json();
        if (!result.success) console.warn("Gửi phản hồi thất bại:", result.error);
    } catch (err) {
        console.warn("Lỗi kết nối khi gửi phản hồi:", err);
    }
}

// dùng chung cho cả nút "Gửi" và nút "Đóng"/dấu X — chỉ khác nhau ở chỗ "Đóng" khi ô trống thì thoát êm, không cần confirm gì thêm
function handleFeedbackDismiss() {
    const content = feedbackTextarea ? feedbackTextarea.value.trim() : '';
    if (content) sendFeedbackToChat(content);
    if (feedbackModal) feedbackModal.classList.add('hidden');
}

feedbackBtnSend?.addEventListener('click', handleFeedbackDismiss);
feedbackBtnClose?.addEventListener('click', handleFeedbackDismiss);
feedbackCloseX?.addEventListener('click', handleFeedbackDismiss);

// ==========================================
// 11. ÔN TẬP LỖI SAI (SRS — SPACED REPETITION)
// ==========================================
// Mỗi khi lưu bài Speaking/Writing, Backend (Controller_Srs.gs) tự trích errors[] AI vừa chấm
// thành các thẻ ôn tập trong spreadsheet Traininghistory. Ở đây chỉ là giao diện: hiện badge số thẻ
// đến hạn, và luồng flashcard (xem lỗi -> bấm Xem đáp án -> tự chấm mức nhớ -> qua thẻ tiếp theo).
// Toàn bộ nội dung thẻ hiển thị qua textContent (không phải innerHTML) nên tự động an toàn XSS,
// không cần escapeHtml() ở đây.
let srsQueue = [];
let srsCurrentIndex = 0;
const srsModal = document.getElementById('srs-modal');
const btnOpenSrsReview = document.getElementById('btn-open-srs-review');
const srsDueCountEl = document.getElementById('srs-due-count');
const srsProgressEl = document.getElementById('srs-progress');
const srsCardSkillEl = document.getElementById('srs-card-skill');
const srsCardPhraseEl = document.getElementById('srs-card-phrase');
const srsCardAnswerEl = document.getElementById('srs-card-answer');
const srsCardCorrectionEl = document.getElementById('srs-card-correction');
const srsCardReasonEl = document.getElementById('srs-card-reason');
const srsBtnReveal = document.getElementById('srs-btn-reveal');
const srsRatingButtons = document.getElementById('srs-rating-buttons');
const srsEmptyState = document.getElementById('srs-empty-state');
const srsCardBody = document.getElementById('srs-card-body');
const srsCloseX = document.getElementById('srs-close-x');

async function refreshSrsDueCount() {
    if (!btnOpenSrsReview) return;
    try {
        const payload = { action: 'get_srs_due_cards', idToken: getIdToken() };
        const response = await fetch(GAS_WEB_APP_URL, { method: 'POST', body: JSON.stringify(payload) });
        const result = await response.json();
        const count = (result.success && result.data) ? (result.data.total || 0) : 0;
        btnOpenSrsReview.style.display = count > 0 ? 'flex' : 'none';
        if (srsDueCountEl) srsDueCountEl.textContent = count;
    } catch (err) {
        console.warn("Không tải được số thẻ ôn tập:", err);
    }
}

function showCurrentSrsCard() {
    if (srsCurrentIndex >= srsQueue.length) {
        srsCardBody.classList.add('hidden');
        srsBtnReveal.classList.add('hidden');
        srsRatingButtons.classList.add('hidden');
        srsEmptyState.classList.remove('hidden');
        srsProgressEl.textContent = '';
        refreshSrsDueCount();
        return;
    }
    const card = srsQueue[srsCurrentIndex];
    srsProgressEl.textContent = `Thẻ ${srsCurrentIndex + 1}/${srsQueue.length}`;
    srsCardSkillEl.textContent = (card.skill === 'speaking' ? '🎤 Speaking' : '✍️ Writing') + (card.language ? ' • ' + card.language : '');
    srsCardPhraseEl.textContent = card.original_phrase;
    srsCardCorrectionEl.textContent = card.correction;
    srsCardReasonEl.textContent = card.reason;
    srsCardAnswerEl.classList.add('hidden');
    srsBtnReveal.classList.remove('hidden');
    srsRatingButtons.classList.add('hidden');
}

async function openSrsReview() {
    if (!srsModal) return;
    srsModal.classList.remove('hidden');
    srsCardBody.classList.remove('hidden');
    srsEmptyState.classList.add('hidden');
    srsProgressEl.textContent = 'Đang tải...';
    try {
        const payload = { action: 'get_srs_due_cards', idToken: getIdToken() };
        const response = await fetch(GAS_WEB_APP_URL, { method: 'POST', body: JSON.stringify(payload) });
        const result = await response.json();
        srsQueue = (result.success && result.data && result.data.cards) ? result.data.cards : [];
        srsCurrentIndex = 0;
        showCurrentSrsCard();
    } catch (err) {
        srsProgressEl.textContent = 'Lỗi tải thẻ ôn tập: ' + err.message;
    }
}

window.reviewSrsCard = async (quality) => {
    const card = srsQueue[srsCurrentIndex];
    if (!card) return;
    srsRatingButtons.classList.add('hidden');
    try {
        const payload = { action: 'review_srs_card', cardId: card.id, quality: quality, idToken: getIdToken() };
        await fetch(GAS_WEB_APP_URL, { method: 'POST', body: JSON.stringify(payload) });
    } catch (err) {
        console.warn("Không lưu được kết quả ôn tập:", err);
    }
    srsCurrentIndex++;
    showCurrentSrsCard();
};

btnOpenSrsReview?.addEventListener('click', openSrsReview);
srsBtnReveal?.addEventListener('click', () => {
    srsCardAnswerEl.classList.remove('hidden');
    srsBtnReveal.classList.add('hidden');
    srsRatingButtons.classList.remove('hidden');
});
srsCloseX?.addEventListener('click', () => srsModal.classList.add('hidden'));

// ==========================================
// 12. HỆ THỐNG CẤP ĐỘ TỰ ĐỘNG (MASTERY — chôm ý tưởng Khan Academy + Duolingo Test)
// ==========================================
// Thay cho dropdown "Cấp độ mục tiêu" đã bị gỡ: badge bên trái hiện cấp độ hiện tại (đọc từ
// Backend, KHÔNG cho tự chọn), và popup đặt trình độ (bài test thích ứng 12 câu kiểu staircase)
// tự bật khi đổi sang 1 kỹ năng+ngôn ngữ chưa từng luyện. Toàn bộ nội dung câu hỏi hiển thị qua
// textContent (không phải innerHTML) nên tự động an toàn XSS, không cần escapeHtml() ở đây.
const levelBadge = document.getElementById('level-badge');
const levelProgressText = document.getElementById('level-progress-text');
const placementModal = document.getElementById('placement-modal');
const placementProgress = document.getElementById('placement-progress');
const placementQuestionBody = document.getElementById('placement-question-body');
const placementPassage = document.getElementById('placement-passage');
const placementQuestionText = document.getElementById('placement-question-text');
const placementChoices = document.getElementById('placement-choices');
const placementResult = document.getElementById('placement-result');
const placementFinalLevel = document.getElementById('placement-final-level');
const placementBtnStartPractice = document.getElementById('placement-btn-start-practice');
const placementBtnSkip = document.getElementById('placement-btn-skip');

let currentPlacementId = null;
let lastKnownLevelDisplayText = ''; // dùng khi lưu lịch sử (item.level) — xem saveCurrentSessionToHistory ở trên

// Tra "value" (mã cấp độ Backend trả về, vd "B2 (Upper-Intermediate)") sang "text" hiển thị đẹp
// (vd "B2 (Trung cao / IELTS 5.5-6.5)"). Nếu không tìm thấy (ngôn ngữ chưa có trong LANGUAGE_LEVELS
// hoặc giá trị lạ) thì hiện thẳng value gốc, còn hơn hiện trống.
function levelDisplayText(languageCode, value) {
    const levels = LANGUAGE_LEVELS[languageCode] || LANGUAGE_LEVELS.english;
    const found = levels.find(l => l.value === value);
    return found ? found.text : value;
}

async function refreshCurrentLevel() {
    if (!levelBadge || !getIdToken()) return; // chưa đăng nhập thì chưa gọi được (Backend chặn action chưa auth)
    const skill = currentSkill;
    const languageCode = langSelect.value; // "english" | "chinese" | "russian" — khớp key LANGUAGE_LEVELS
    levelBadge.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang tải...';
    if (levelProgressText) levelProgressText.textContent = '';
    try {
        const payload = { action: 'get_current_level', skill: skill, language: languageCode, idToken: getIdToken() };
        const response = await fetch(GAS_WEB_APP_URL, { method: 'POST', body: JSON.stringify(payload) });
        const result = await response.json();
        if (!result.success) throw new Error(result.error);
        const data = result.data;

        if (data.needsPlacement) {
            levelBadge.innerHTML = '<i class="fas fa-question-circle"></i> Chưa xác định';
            openPlacementTest(skill, languageCode);
            return;
        }

        lastKnownLevelDisplayText = levelDisplayText(languageCode, data.level);
        levelBadge.innerHTML = `<i class="fas fa-award"></i> ${escapeHtml(lastKnownLevelDisplayText)}`;
        if (levelProgressText) {
            levelProgressText.textContent = (data.tracked && data.progress && data.progress.windowSize > 0)
                ? `${data.progress.passed}/${data.progress.windowSize} bài gần nhất để đổi cấp`
                : '';
        }
    } catch (err) {
        levelBadge.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Lỗi tải cấp độ';
        console.warn("Không tải được cấp độ hiện tại:", err);
    }
}

// Toast nhỏ góc màn hình khi lên/hạ cấp — tự ẩn sau vài giây, không chặn thao tác gì khác.
function showLevelChangeToast(direction, newLevelValue) {
    const languageCode = langSelect.value;
    const text = levelDisplayText(languageCode, newLevelValue);
    const isUp = direction === 'up';
    const toast = document.createElement('div');
    toast.style.cssText = `position:fixed; bottom:20px; right:20px; z-index:9999; background:${isUp ? '#27ae60' : '#e67e22'}; color:white; padding:14px 20px; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.2); font-weight:bold; max-width:320px;`;
    toast.innerHTML = isUp
        ? `<i class="fas fa-arrow-up"></i> Chúc mừng! Bạn đã lên cấp: ${escapeHtml(text)}`
        : `<i class="fas fa-arrow-down"></i> Cấp độ điều chỉnh xuống: ${escapeHtml(text)} — luyện thêm để lên lại nhé!`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 6000);
}

async function openPlacementTest(skill, languageCode) {
    if (!placementModal) return;
    placementModal.classList.remove('hidden');
    placementResult.classList.add('hidden');
    placementQuestionBody.classList.remove('hidden');
    placementProgress.textContent = 'Đang chuẩn bị bài test...';
    placementChoices.innerHTML = '';
    try {
        const payload = { action: 'start_placement_test', skill: skill, language: languageCode, idToken: getIdToken() };
        const response = await fetch(GAS_WEB_APP_URL, { method: 'POST', body: JSON.stringify(payload) });
        const result = await response.json();
        if (!result.success) throw new Error(result.error);
        currentPlacementId = result.data.placementId;
        renderPlacementQuestion(result.data);
    } catch (err) {
        placementProgress.textContent = 'Lỗi tải bài test: ' + err.message;
    }
}

function renderPlacementQuestion(data) {
    placementProgress.textContent = `Câu ${data.step}/${data.totalSteps}`;
    const q = data.question;
    if (q.passage) {
        placementPassage.textContent = q.passage;
        placementPassage.classList.remove('hidden');
    } else {
        placementPassage.classList.add('hidden');
    }
    placementQuestionText.textContent = q.question;
    placementChoices.innerHTML = '';
    (q.choices || []).forEach((choice, idx) => {
        const btn = document.createElement('button');
        btn.className = 'btn';
        // ĐÃ SỬA: .btn trong style.css là "display:inline-flex; justify-content:center" -> chỉ đặt
        // text-align:left KHÔNG đủ để căn trái (justify-content mới quyết định vị trí nội dung trong
        // flex container), phải override cả justify-content thì đáp án nhiều chữ mới đọc dễ.
        btn.style.cssText = 'text-align:left; justify-content:flex-start; background:#f4f7f6; color:#2c3e50; border:1px solid #ccc; padding:10px 14px;';
        btn.textContent = choice;
        btn.onclick = () => submitPlacementAnswer(idx);
        placementChoices.appendChild(btn);
    });
}

async function submitPlacementAnswer(selectedIndex) {
    placementChoices.querySelectorAll('button').forEach(b => b.disabled = true);
    try {
        const payload = { action: 'answer_placement_question', placementId: currentPlacementId, selectedIndex: selectedIndex, idToken: getIdToken() };
        const response = await fetch(GAS_WEB_APP_URL, { method: 'POST', body: JSON.stringify(payload) });
        const result = await response.json();
        if (!result.success) throw new Error(result.error);
        if (result.data.finished) {
            finishPlacementTest(result.data.finalLevel);
        } else {
            renderPlacementQuestion(result.data);
        }
    } catch (err) {
        placementProgress.textContent = 'Lỗi: ' + err.message;
        placementChoices.querySelectorAll('button').forEach(b => b.disabled = false);
    }
}

function finishPlacementTest(finalLevelValue) {
    placementQuestionBody.classList.add('hidden');
    placementResult.classList.remove('hidden');
    placementFinalLevel.textContent = levelDisplayText(langSelect.value, finalLevelValue);
    currentPlacementId = null;
}

placementBtnStartPractice?.addEventListener('click', () => {
    placementModal.classList.add('hidden');
    refreshCurrentLevel();
});

placementBtnSkip?.addEventListener('click', async () => {
    try {
        const payload = { action: 'skip_placement_test', skill: currentSkill, language: langSelect.value, idToken: getIdToken() };
        await fetch(GAS_WEB_APP_URL, { method: 'POST', body: JSON.stringify(payload) });
    } catch (err) {
        console.warn("Không bỏ qua được bài đặt trình độ:", err);
    }
    placementModal.classList.add('hidden');
    currentPlacementId = null;
    refreshCurrentLevel();
});