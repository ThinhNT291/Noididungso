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
const comprehensionWorkspace = document.getElementById('comprehension-workspace'); // ĐÃ THÊM: Nghe/Đọc hiểu
const ciWorkspace = document.getElementById('ci-workspace'); // ĐÃ THÊM: Đọc/Nghe mở rộng (Comprehensible Input)
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

// ĐÃ SỬA (dựng khung điều hướng 5 khu — Bước 1): tách phần thân xử lý đổi kỹ năng ra hàm dùng chung,
// vì giờ có 2 nơi có thể đổi currentSkill — #skill-select (khu Kiểm tra kỹ năng, 5 lựa chọn) và
// #ci-skill-select (khu Đọc/Nghe mở rộng, 2 lựa chọn) — trước đây chỉ có 1 dropdown gộp chung nên chỉ
// cần 1 listener; logic hiện/ẩn workspace tương ứng giữ NGUYÊN VẸN như cũ, không đổi hành vi gì.
function applySkillChange(newSkill) {
    currentSkill = newSkill;
    resetWorkspace(currentSkill);

    speakingWorkspace.classList.add('hidden');
    writingWorkspace.classList.add('hidden');
    readAloudWorkspace.classList.add('hidden');
    comprehensionWorkspace?.classList.add('hidden');
    ciWorkspace?.classList.add('hidden');

    if (currentSkill === 'writing') {
        writingWorkspace.classList.remove('hidden');
    } else if (currentSkill === 'speaking') {
        speakingWorkspace.classList.remove('hidden');
    } else if (currentSkill === 'read-aloud') {
        readAloudWorkspace.classList.remove('hidden');
    } else if (currentSkill === 'listening' || currentSkill === 'reading') {
        // ĐÃ THÊM: Nghe hiểu/Đọc hiểu (mục 14 bên dưới) — dùng chung 1 workspace cho cả 2 kỹ năng.
        comprehensionWorkspace?.classList.remove('hidden');
        setupComprehensionIntro();
    } else if (currentSkill === 'ci-reading' || currentSkill === 'ci-listening') {
        // ĐÃ THÊM: Đọc/Nghe mở rộng (mục 16 bên dưới, Comprehensible Input) — dùng chung 1 workspace.
        ciWorkspace?.classList.remove('hidden');
        setupCIIntro();
    }
    refreshCurrentLevel(); // ĐÃ THÊM (Mastery): đổi kỹ năng -> cấp độ theo dõi cũng đổi theo
}

skillSelect.addEventListener('change', (e) => applySkillChange(e.target.value));
document.getElementById('ci-skill-select')?.addEventListener('change', (e) => applySkillChange(e.target.value));

// ==========================================
// ĐIỀU HƯỚNG 5 KHU (Bước 1 — dựng khung, dời nội dung ĐÃ CÓ vào đúng khu, KHÔNG thêm tính năng mới):
// Kiểm tra kỹ năng | Học | Đọc/Nghe mở rộng | Ôn & Tiến bộ | Thử thách. Xem index.html #area-nav.
// ==========================================
const AREA_PANELS = {
    test: document.getElementById('area-test'),
    hoc: document.getElementById('area-hoc'),
    ci: document.getElementById('area-ci'),
    'on-tien-bo': document.getElementById('area-on-tien-bo'),
    'thu-thach': document.getElementById('area-thu-thach')
};
const TEST_AREA_SKILLS = ['speaking', 'writing', 'read-aloud', 'listening', 'reading'];
const CI_AREA_SKILLS = ['ci-reading', 'ci-listening'];
const areaNavButtons = document.querySelectorAll('.area-nav-btn');
let currentArea = 'test';

function switchArea(area) {
    if (!AREA_PANELS[area] || area === currentArea) return;
    currentArea = area;

    Object.keys(AREA_PANELS).forEach(key => AREA_PANELS[key]?.classList.toggle('hidden', key !== area));
    areaNavButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.area === area));

    // Sidebar trái (Ngôn ngữ/Kỹ năng/Cấp độ...) chỉ còn ý nghĩa ở 2 khu Kiểm tra kỹ năng + Đọc/Nghe
    // mở rộng — 3 khu còn lại (Học/Ôn & Tiến bộ/Thử thách) ở Bước 1 chưa cần tới nó.
    const needsSidebarLeft = (area === 'test' || area === 'ci');
    document.getElementById('sidebar-left')?.classList.toggle('hidden', !needsSidebarLeft);
    document.querySelector('.app-container')?.classList.toggle('hide-sidebar-left', !needsSidebarLeft);
    document.getElementById('skill-select-group')?.classList.toggle('hidden', area !== 'test');
    document.getElementById('ci-skill-select-group')?.classList.toggle('hidden', area !== 'ci');
    document.getElementById('test-only-controls')?.classList.toggle('hidden', area !== 'test');

    // Vào khu Kiểm tra kỹ năng/Đọc-Nghe mở rộng mà currentSkill đang ở khu KHÁC (vd vừa ở CI chuyển
    // sang Kiểm tra) -> đặt về kỹ năng mặc định của khu đó, giữ nguyên lựa chọn nếu đã đúng khu rồi
    // (không mất trạng thái khi bấm qua lại giữa các khu nhiều lần).
    if (area === 'test' && !TEST_AREA_SKILLS.includes(currentSkill)) {
        skillSelect.value = 'speaking';
        applySkillChange('speaking');
    } else if (area === 'ci' && !CI_AREA_SKILLS.includes(currentSkill)) {
        const ciSelect = document.getElementById('ci-skill-select');
        if (ciSelect) ciSelect.value = 'ci-reading';
        applySkillChange('ci-reading');
    }
}
areaNavButtons.forEach(btn => btn.addEventListener('click', () => switchArea(btn.dataset.area)));

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
    if (type === 'listening') return 'Nghe hiểu';
    if (type === 'reading') return 'Đọc hiểu';
    if (type === 'ci-reading') return 'Đọc mở rộng (CI)';
    if (type === 'ci-listening') return 'Nghe mở rộng (CI)';
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
    else if (item.type === 'listening' || item.type === 'reading') assessmentHtml = buildComprehensionAssessmentHTML(item.assessment);
    else if (item.type === 'ci-reading' || item.type === 'ci-listening') assessmentHtml = buildCIAssessmentHTML(item.assessment);

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
    } else if (skill === 'listening' || skill === 'reading') {
        // ĐÃ THÊM: Nghe hiểu/Đọc hiểu (mục 14) — reset về màn hình giới thiệu, huỷ bài đang làm dở.
        resetComprehensionState();
    } else if (skill === 'ci-reading' || skill === 'ci-listening') {
        // ĐÃ THÊM: Đọc/Nghe mở rộng (mục 16, Comprehensible Input) — reset về màn hình giới thiệu.
        resetCIState();
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
    // ĐÃ SỬA: trước đây chỉ có 2 nhánh (speaking/writing) — giờ thẻ SRS còn có thể đến từ Listening/
    // Reading (mục 14), nên đổi sang tra nhãn đầy đủ thay vì ternary nhị phân.
    const srsSkillIcons = { speaking: '🎤 Speaking', writing: '✍️ Writing', listening: '🔊 Listening', reading: '📖 Reading', 'ci-reading': '📚 CI Đọc', 'ci-listening': '🎧 CI Nghe' };
    srsCardSkillEl.textContent = (srsSkillIcons[card.skill] || card.skill) + (card.language ? ' • ' + card.language : '');
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

// ĐÃ THÊM: Đọc/Nghe mở rộng (CI) không tự theo dõi Mastery riêng — nội dung CI dùng CHUNG đúng cấp độ
// đang theo dõi của "reading"/"listening" (đọc, không ghi). Map ở đây để badge hiện cấp độ THẬT đang
// dùng để chọn bài, không phải cấp mặc định (nếu gọi thẳng skill 'ci-reading' thì Backend coi là
// untracked -> luôn trả cấp giữa bảng, sai với cấp thực tế Controller_CIContent.gs đang dùng).
const CI_SKILL_TRACKED_MAP = { 'ci-reading': 'reading', 'ci-listening': 'listening' };

async function refreshCurrentLevel() {
    if (!levelBadge || !getIdToken()) return; // chưa đăng nhập thì chưa gọi được (Backend chặn action chưa auth)
    const skill = CI_SKILL_TRACKED_MAP[currentSkill] || currentSkill;
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

// ==========================================
// 13. BIỂU ĐỒ TIẾN ĐỘ (streak, heatmap hoạt động, đồ thị điểm số, mốc lên cấp, tổng quan SRS)
// ==========================================
// Toàn bộ được vẽ tay bằng DOM/SVG thuần (không thêm thư viện chart ngoài) để tự kiểm soát đúng bộ
// màu + mark spec đã dùng (xem style.css khối ".viz-*"). Mọi text động đều gán qua textContent,
// không phải innerHTML, nên tự động an toàn XSS.
const progressModal = document.getElementById('progress-modal');
const progressBody = document.getElementById('progress-body');
const progressCloseX = document.getElementById('progress-close-x');
const btnOpenProgress = document.getElementById('btn-open-progress');
const vizTooltip = document.getElementById('viz-tooltip');

function showVizTooltip(x, y, lines) {
    if (!vizTooltip) return;
    vizTooltip.innerHTML = '';
    lines.forEach((line, i) => {
        const row = document.createElement('div');
        row.textContent = line;
        if (i === 0) { row.style.fontWeight = '700'; row.style.marginBottom = '2px'; }
        vizTooltip.appendChild(row);
    });
    vizTooltip.style.display = 'block';
    const rect = vizTooltip.getBoundingClientRect();
    let left = x + 12, top = y - rect.height - 10;
    if (left + rect.width > window.innerWidth - 8) left = x - rect.width - 12;
    if (top < 8) top = y + 14;
    vizTooltip.style.left = left + 'px';
    vizTooltip.style.top = top + 'px';
}
function hideVizTooltip() { if (vizTooltip) vizTooltip.style.display = 'none'; }

async function openProgressModal() {
    if (!progressModal) return;
    progressModal.classList.remove('hidden');
    progressBody.innerHTML = '<span class="placeholder-text"><i class="fas fa-spinner fa-spin"></i> Đang tải...</span>';
    try {
        const payload = { action: 'get_progress_stats', idToken: getIdToken() };
        const response = await fetch(GAS_WEB_APP_URL, { method: 'POST', body: JSON.stringify(payload) });
        const result = await response.json();
        if (!result.success) throw new Error(result.error);
        renderProgressDashboard(result.data);
    } catch (err) {
        progressBody.innerHTML = `<span style="color:red;">Lỗi tải tiến độ: ${escapeHtml(err.message)}</span>`;
    }
}

function buildStatTile(label, value) {
    const tile = document.createElement('div');
    tile.className = 'viz-stat-tile';
    const labelEl = document.createElement('div');
    labelEl.className = 'viz-stat-label';
    labelEl.textContent = label;
    const valueEl = document.createElement('div');
    valueEl.className = 'viz-stat-value';
    valueEl.textContent = value;
    tile.appendChild(labelEl);
    tile.appendChild(valueEl);
    return tile;
}

// 5 mức đậm nhạt (giống GitHub contribution graph) theo số hoạt động/ngày — ngưỡng chọn tay cho phù
// hợp quy mô cá nhân (không cần chia theo phân vị thống kê phức tạp cho MVP này).
function heatmapLevelForCount(count) {
    if (!count || count <= 0) return 0;
    if (count === 1) return 1;
    if (count === 2) return 2;
    if (count <= 4) return 3;
    if (count <= 7) return 4;
    return 5;
}

function buildHeatmap(heatmapData, windowDays) {
    const scroll = document.createElement('div');
    scroll.className = 'viz-heatmap-scroll';
    const grid = document.createElement('div');
    grid.className = 'viz-heatmap';

    const countByDate = {};
    heatmapData.forEach(d => { countByDate[d.date] = d.count; });

    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() - (windowDays - 1));

    // grid-auto-flow:column + 7 hàng -> điền theo cột (mỗi cột 1 tuần), đúng thứ tự thời gian trái->
    // phải vì mình append từ ngày cũ nhất đến mới nhất. Không căn chính xác theo đúng Chủ nhật/Thứ 2
    // như GitHub thật — đủ dùng cho MVP, có thể tinh chỉnh sau nếu cần.
    for (let i = 0; i < windowDays; i++) {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        const count = countByDate[key] || 0;
        const cell = document.createElement('div');
        cell.className = 'viz-heatmap-cell';
        cell.dataset.level = heatmapLevelForCount(count);
        const onHover = (e) => showVizTooltip(e.clientX, e.clientY, [key, count + ' hoạt động']);
        cell.addEventListener('mouseenter', onHover);
        cell.addEventListener('mousemove', onHover);
        cell.addEventListener('mouseleave', hideVizTooltip);
        grid.appendChild(cell);
    }
    scroll.appendChild(grid);
    return scroll;
}

function buildScoreTrendChart(scoreTrend) {
    const container = document.createElement('div');
    // Thứ tự màu categorical CỐ ĐỊNH theo palette đã validate (không đảo/không cycle khi thêm series
    // mới) — slot 1-3 dùng cho 3 kỹ năng cũ, slot 4-5 (vàng/magenta) dùng cho Listening/Reading mới.
    const allSeries = [
        { key: 'speaking', label: 'Speaking', hex: '#2a78d6' },
        { key: 'writing', label: 'Writing', hex: '#eb6834' },
        { key: 'read-aloud', label: 'Read-aloud', hex: '#1baf7a' },
        { key: 'listening', label: 'Listening', hex: '#eda100' },
        { key: 'reading', label: 'Reading', hex: '#e87ba4' }
    ];
    const activeSeries = allSeries.filter(s => (scoreTrend[s.key] || []).length > 0);

    if (activeSeries.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'viz-empty-note';
        empty.textContent = 'Chưa có đủ dữ liệu điểm số để vẽ biểu đồ — luyện tập thêm vài bài nhé.';
        container.appendChild(empty);
        return container;
    }

    // Legend — luôn hiện vì có >= 2 series khi nhiều hơn 1 kỹ năng có dữ liệu (đúng quy tắc: legend
    // cho >=2 series, 1 series thì không cần vì tiêu đề mục đã nói rõ đang vẽ gì).
    if (activeSeries.length > 1) {
        const legend = document.createElement('div');
        legend.className = 'viz-legend';
        activeSeries.forEach(s => {
            const item = document.createElement('div');
            item.className = 'viz-legend-item';
            const swatch = document.createElement('span');
            swatch.className = 'viz-legend-swatch';
            swatch.style.background = s.hex;
            const text = document.createElement('span');
            text.textContent = s.label;
            item.appendChild(swatch);
            item.appendChild(text);
            legend.appendChild(item);
        });
        container.appendChild(legend);
    }

    const allDates = Array.from(new Set(activeSeries.flatMap(s => scoreTrend[s.key].map(p => p.date)))).sort();
    const width = 640, height = 220, padding = { top: 10, right: 16, bottom: 24, left: 30 };
    const plotW = width - padding.left - padding.right;
    const plotH = height - padding.top - padding.bottom;

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.style.width = '100%';
    svg.style.height = 'auto';
    svg.style.display = 'block';

    // Gridline hairline ngang, mỗi 2.5 điểm (thang 0-10)
    [0, 2.5, 5, 7.5, 10].forEach(v => {
        const y = padding.top + plotH - (v / 10) * plotH;
        const line = document.createElementNS(svgNS, 'line');
        line.setAttribute('x1', padding.left); line.setAttribute('x2', width - padding.right);
        line.setAttribute('y1', y); line.setAttribute('y2', y);
        line.setAttribute('stroke', '#e1e0d9'); line.setAttribute('stroke-width', '1');
        svg.appendChild(line);
        const label = document.createElementNS(svgNS, 'text');
        label.setAttribute('x', padding.left - 6); label.setAttribute('y', y + 3);
        label.setAttribute('text-anchor', 'end'); label.setAttribute('font-size', '9');
        label.setAttribute('fill', '#898781'); label.textContent = v;
        svg.appendChild(label);
    });

    const xForDate = (dateStr) => {
        if (allDates.length <= 1) return padding.left + plotW / 2;
        return padding.left + (allDates.indexOf(dateStr) / (allDates.length - 1)) * plotW;
    };
    const yForScore = (score) => padding.top + plotH - (score / 10) * plotH;

    if (allDates.length > 0) {
        const firstLabel = document.createElementNS(svgNS, 'text');
        firstLabel.setAttribute('x', padding.left); firstLabel.setAttribute('y', height - 6);
        firstLabel.setAttribute('font-size', '9'); firstLabel.setAttribute('fill', '#898781');
        firstLabel.textContent = allDates[0];
        svg.appendChild(firstLabel);
        const lastLabel = document.createElementNS(svgNS, 'text');
        lastLabel.setAttribute('x', width - padding.right); lastLabel.setAttribute('y', height - 6);
        lastLabel.setAttribute('text-anchor', 'end'); lastLabel.setAttribute('font-size', '9');
        lastLabel.setAttribute('fill', '#898781');
        lastLabel.textContent = allDates[allDates.length - 1];
        svg.appendChild(lastLabel);
    }

    activeSeries.forEach(s => {
        const points = scoreTrend[s.key];
        if (points.length > 1) {
            const polyline = document.createElementNS(svgNS, 'polyline');
            polyline.setAttribute('points', points.map(p => `${xForDate(p.date)},${yForScore(p.score)}`).join(' '));
            polyline.setAttribute('fill', 'none');
            polyline.setAttribute('stroke', s.hex);
            polyline.setAttribute('stroke-width', '2');
            polyline.setAttribute('stroke-linejoin', 'round');
            polyline.setAttribute('stroke-linecap', 'round');
            svg.appendChild(polyline);
        }
        points.forEach(p => {
            const cx = xForDate(p.date), cy = yForScore(p.score);
            // Hit target lớn hơn chấm thật (r=12, chấm thật r=4) — theo interaction.md, tránh chấm quá nhỏ khó trúng khi hover.
            const hit = document.createElementNS(svgNS, 'circle');
            hit.setAttribute('cx', cx); hit.setAttribute('cy', cy); hit.setAttribute('r', '12');
            hit.setAttribute('fill', 'transparent');
            hit.style.cursor = 'pointer';
            hit.addEventListener('mousemove', (e) => showVizTooltip(e.clientX, e.clientY, [s.label + ' • ' + p.date, 'Điểm: ' + p.score]));
            hit.addEventListener('mouseleave', hideVizTooltip);
            svg.appendChild(hit);
            const dot = document.createElementNS(svgNS, 'circle');
            dot.setAttribute('cx', cx); dot.setAttribute('cy', cy); dot.setAttribute('r', '4');
            dot.setAttribute('fill', s.hex);
            dot.setAttribute('stroke', '#fcfcfb'); dot.setAttribute('stroke-width', '2');
            dot.style.pointerEvents = 'none';
            svg.appendChild(dot);
        });
    });

    container.appendChild(svg);
    return container;
}

function buildSrsMeter(srs) {
    const wrap = document.createElement('div');
    if (srs.total === 0) {
        const empty = document.createElement('div');
        empty.className = 'viz-empty-note';
        empty.textContent = 'Chưa có thẻ ôn tập lỗi sai nào.';
        wrap.appendChild(empty);
        return wrap;
    }
    const pct = Math.round((srs.mastered / srs.total) * 100);
    const track = document.createElement('div');
    track.className = 'viz-meter-track';
    const fill = document.createElement('div');
    fill.className = 'viz-meter-fill';
    fill.style.width = pct + '%';
    track.appendChild(fill);
    wrap.appendChild(track);
    const label = document.createElement('div');
    label.className = 'viz-meter-label';
    const left = document.createElement('span');
    left.textContent = `${srs.mastered}/${srs.total} thẻ đã thuộc (${pct}%)`;
    const right = document.createElement('span');
    right.textContent = `${srs.active} đang ôn`;
    label.appendChild(left);
    label.appendChild(right);
    wrap.appendChild(label);
    return wrap;
}

function buildLevelTimeline(levelEvents) {
    if (!levelEvents || levelEvents.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'viz-empty-note';
        empty.textContent = 'Chưa có lần đổi cấp độ nào.';
        return empty;
    }
    const list = document.createElement('ul');
    list.className = 'viz-timeline';
    levelEvents.forEach(ev => {
        const li = document.createElement('li');
        const icon = document.createElement('div');
        icon.className = 'viz-timeline-icon ' + (ev.direction === 'up' ? 'up' : 'down');
        icon.innerHTML = ev.direction === 'up' ? '<i class="fas fa-arrow-up"></i>' : '<i class="fas fa-arrow-down"></i>'; // icon tĩnh, không phải dữ liệu người dùng
        const text = document.createElement('div');
        const skillText = ev.skill === 'speaking' ? 'Speaking' : 'Writing';
        text.textContent = `${ev.date} • ${skillText} (${ev.language}): ${ev.fromLevel} → ${ev.toLevel}`;
        li.appendChild(icon);
        li.appendChild(text);
        list.appendChild(li);
    });
    return list;
}

function addSectionTitle(container, text) {
    const title = document.createElement('div');
    title.className = 'viz-section-title';
    title.textContent = text;
    container.appendChild(title);
}

function renderProgressDashboard(data) {
    progressBody.innerHTML = '';

    const statRow = document.createElement('div');
    statRow.className = 'viz-stat-row';
    statRow.appendChild(buildStatTile('🔥 Chuỗi ngày liên tiếp', data.streak.current + ' ngày'));
    statRow.appendChild(buildStatTile(`🏆 Chuỗi dài nhất (${data.windowDays} ngày qua)`, data.streak.best + ' ngày'));
    progressBody.appendChild(statRow);

    addSectionTitle(progressBody, `Hoạt động ${data.windowDays} ngày qua`);
    progressBody.appendChild(buildHeatmap(data.heatmap, data.windowDays));

    addSectionTitle(progressBody, 'Điểm số theo thời gian');
    progressBody.appendChild(buildScoreTrendChart(data.scoreTrend));

    addSectionTitle(progressBody, 'Ôn tập lỗi sai (SRS)');
    progressBody.appendChild(buildSrsMeter(data.srs));

    addSectionTitle(progressBody, 'Mốc thay đổi cấp độ');
    progressBody.appendChild(buildLevelTimeline(data.levelEvents));
}

btnOpenProgress?.addEventListener('click', openProgressModal);
progressCloseX?.addEventListener('click', () => progressModal.classList.add('hidden'));

// ==========================================
// 14. NGHE HIỂU (Listening) + ĐỌC HIỂU (Reading)
// ==========================================
// 2 kỹ năng mới, đủ bộ 4 kỹ năng chuẩn (Nghe/Nói/Đọc/Viết), dùng CHUNG 1 workspace (chỉ khác cách
// hiện nội dung: audio TTS vs đoạn văn hiện trực tiếp). Trắc nghiệm 4 lựa chọn, tự chấm ngay tại
// server (Controller_Comprehension.gs) — không gọi AI, không có độ trễ. Nghe hiểu tái dùng nguyên hàm
// generateAndPlaySample() đã có sẵn trong index.html (dùng cho Shadowing) để phát audio TTS.
// Toàn bộ nội dung câu hỏi/đáp án hiển thị qua textContent (không phải innerHTML), tự động an toàn XSS.
const comprehensionSkillLabelEl = document.getElementById('comprehension-skill-label');
const comprehensionIntroBox = document.getElementById('comprehension-intro-box');
const activeComprehensionBox = document.getElementById('active-comprehension-box');
const comprehensionItemTitleEl = document.getElementById('comprehension-item-title');
const comprehensionPassageBox = document.getElementById('comprehension-passage-box');
const comprehensionAudioBox = document.getElementById('comprehension-audio-box');
const comprehensionAudioStatus = document.getElementById('comprehension-audio-status');
const comprehensionAudioPlayer = document.getElementById('comprehension-audio-player');
const btnComprehensionPlayAudio = document.getElementById('btn-comprehension-play-audio');
const comprehensionQuestionsList = document.getElementById('comprehension-questions-list');
const btnSubmitComprehension = document.getElementById('btn-submit-comprehension');
const comprehensionResultBox = document.getElementById('comprehension-result-box');
const btnStartComprehension = document.getElementById('btn-start-comprehension');

let comprehensionCurrentItem = null;    // {itemId, title, content, level, questions:[{question,choices}]}
let comprehensionSelectedAnswers = [];  // mảng selectedIndex song song với questions, -1 = chưa chọn

// Gọi khi chuyển sang tab Nghe/Đọc hiểu — chỉ đổi tiêu đề + reset về màn hình giới thiệu, KHÔNG tự
// động tải đề (để người học chủ động bấm "Bắt đầu bài mới" khi sẵn sàng, giống các kỹ năng khác).
function setupComprehensionIntro() {
    resetComprehensionState();
    if (comprehensionSkillLabelEl) {
        comprehensionSkillLabelEl.textContent = currentSkill === 'listening'
            ? 'Luyện Nghe hiểu (Listening)'
            : 'Luyện Đọc hiểu (Reading)';
    }
}

function resetComprehensionState() {
    comprehensionCurrentItem = null;
    comprehensionSelectedAnswers = [];
    if (comprehensionIntroBox) comprehensionIntroBox.classList.remove('hidden');
    if (activeComprehensionBox) activeComprehensionBox.classList.add('hidden');
    if (comprehensionResultBox) { comprehensionResultBox.classList.add('hidden'); comprehensionResultBox.innerHTML = ''; }
    if (comprehensionAudioPlayer) { comprehensionAudioPlayer.pause(); comprehensionAudioPlayer.style.display = 'none'; comprehensionAudioPlayer.src = ''; }
    if (comprehensionAudioStatus) comprehensionAudioStatus.textContent = '';
    if (btnSubmitComprehension) btnSubmitComprehension.disabled = true;
}

async function startComprehensionSession() {
    if (!btnStartComprehension) return;
    const originalHtml = btnStartComprehension.innerHTML;
    btnStartComprehension.disabled = true;
    btnStartComprehension.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang tải đề...';

    // ĐÃ SỬA (Mastery): không gửi "level" — Backend tự tra cấp độ hiện tại (injectAutoLevel_), giống
    // hệt cách evaluate_speaking/evaluate_writing đang làm.
    const payload = { action: 'get_comprehension_item', skill: currentSkill, language: langSelect.value };
    const data = await callBackendAPI(payload, '', false);

    btnStartComprehension.disabled = false;
    btnStartComprehension.innerHTML = originalHtml;

    if (!data) { alert('Không lấy được đề bài, vui lòng thử lại.'); return; }

    comprehensionCurrentItem = data;
    comprehensionSelectedAnswers = new Array(data.questions.length).fill(-1);
    renderComprehensionItem(data);
}
btnStartComprehension?.addEventListener('click', startComprehensionSession);

function renderComprehensionItem(data) {
    comprehensionIntroBox?.classList.add('hidden');
    activeComprehensionBox?.classList.remove('hidden');
    comprehensionResultBox?.classList.add('hidden');
    if (comprehensionResultBox) comprehensionResultBox.innerHTML = '';

    if (comprehensionItemTitleEl) comprehensionItemTitleEl.textContent = data.title || '';

    if (currentSkill === 'reading') {
        if (comprehensionPassageBox) {
            comprehensionPassageBox.textContent = data.content;
            comprehensionPassageBox.classList.remove('hidden');
        }
        comprehensionAudioBox?.classList.add('hidden');
    } else {
        comprehensionPassageBox?.classList.add('hidden');
        comprehensionAudioBox?.classList.remove('hidden');
        if (comprehensionAudioPlayer) { comprehensionAudioPlayer.style.display = 'none'; comprehensionAudioPlayer.src = ''; }
        if (comprehensionAudioStatus) comprehensionAudioStatus.textContent = '';
    }

    if (comprehensionQuestionsList) {
        comprehensionQuestionsList.innerHTML = '';
        data.questions.forEach((q, qIndex) => {
            const qBox = document.createElement('div');
            qBox.style.cssText = 'margin-bottom:16px; padding:12px; background:#fdfdfd; border:1px solid #eee; border-radius:8px;';

            const qText = document.createElement('div');
            qText.style.cssText = 'font-weight:bold; margin-bottom:8px; color:#2c3e50;';
            qText.textContent = `Câu ${qIndex + 1}. ${q.question}`;
            qBox.appendChild(qText);

            const choicesWrap = document.createElement('div');
            choicesWrap.style.cssText = 'display:flex; flex-direction:column; gap:6px;';
            q.choices.forEach((choice, cIndex) => {
                const btn = document.createElement('button');
                btn.className = 'btn';
                // .btn là display:inline-flex; justify-content:center -> phải override justify-content
                // (không chỉ text-align) mới căn trái được đáp án nhiều chữ (bug đã gặp ở Placement Test).
                btn.style.cssText = 'text-align:left; justify-content:flex-start; background:#f4f7f6; color:#2c3e50; border:1px solid #ccc; padding:9px 12px; font-size:0.92em;';
                btn.textContent = String.fromCharCode(65 + cIndex) + '. ' + choice;
                btn.onclick = () => selectComprehensionAnswer(qIndex, cIndex, choicesWrap);
                choicesWrap.appendChild(btn);
            });
            qBox.appendChild(choicesWrap);
            comprehensionQuestionsList.appendChild(qBox);
        });
    }

    if (btnSubmitComprehension) {
        btnSubmitComprehension.disabled = true;
        btnSubmitComprehension.innerHTML = '<i class="fas fa-check-circle"></i> Nộp bài';
    }
}

function selectComprehensionAnswer(qIndex, cIndex, choicesWrap) {
    comprehensionSelectedAnswers[qIndex] = cIndex;
    choicesWrap.querySelectorAll('button').forEach((b, i) => {
        const isSelected = i === cIndex;
        b.style.background = isSelected ? '#2980b9' : '#f4f7f6';
        b.style.color = isSelected ? 'white' : '#2c3e50';
        b.style.borderColor = isSelected ? '#2980b9' : '#ccc';
    });
    if (btnSubmitComprehension) btnSubmitComprehension.disabled = comprehensionSelectedAnswers.some(a => a === -1);
}

btnComprehensionPlayAudio?.addEventListener('click', () => {
    if (!comprehensionCurrentItem || !window.generateAndPlaySample) return;
    // Tái dùng NGUYÊN VẸN hàm phát TTS đã có cho Shadowing (index.html) — transcript CHỈ dùng để tạo
    // audio, không hiện ra chữ (đúng bản chất luyện Nghe, khác Shadowing là luyện đọc theo mẫu).
    window.generateAndPlaySample(comprehensionCurrentItem.content, 'Charon', {
        btnId: 'btn-comprehension-play-audio',
        statusId: 'comprehension-audio-status',
        playerId: 'comprehension-audio-player'
    });
});

async function submitComprehensionAnswers() {
    if (!comprehensionCurrentItem) return;
    if (btnSubmitComprehension) {
        btnSubmitComprehension.disabled = true;
        btnSubmitComprehension.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang chấm...';
    }

    const payload = {
        action: 'submit_comprehension_answers',
        skill: currentSkill,
        language: langSelect.value,
        itemId: comprehensionCurrentItem.itemId,
        answers: comprehensionSelectedAnswers
    };
    const result = await callBackendAPI(payload, '', false);

    if (!result) {
        alert('Chấm điểm thất bại, vui lòng thử lại.');
        if (btnSubmitComprehension) { btnSubmitComprehension.disabled = false; btnSubmitComprehension.innerHTML = '<i class="fas fa-check-circle"></i> Nộp bài'; }
        return;
    }

    renderComprehensionResult(result);
    await saveComprehensionToHistory(result);
}
btnSubmitComprehension?.addEventListener('click', submitComprehensionAnswers);

// ĐÃ SỬA: tách phần dựng HTML ra hàm riêng để tái dùng được khi xem lại lịch sử (giống pattern
// buildSpeakingAssessmentHTML/buildWritingAssessmentHTML/buildReadAloudAssessmentHTML ở trên).
function buildComprehensionAssessmentHTML(data) {
    if (!data) return '<p style="color:#e74c3c;">Không có dữ liệu kết quả.</p>';
    const passRate = data.score_percent || 0;
    const color = passRate >= 75 ? '#27ae60' : (passRate >= 50 ? '#f39c12' : '#e74c3c');
    let html = `
        <div style="background:${color}; padding:15px; border-radius:8px; color:white; margin-bottom:15px;">
            <h3 style="margin:0 0 6px; color:white;"><i class="fas fa-poll"></i> Kết quả: ${data.correct_count}/${data.total_questions} câu đúng (${passRate}%)</h3>
            <div style="font-size:0.9em;">Cấp độ đề: ${escapeHtml(data.level || '')}</div>
        </div>
    `;
    (data.results || []).forEach((r, i) => {
        const borderColor = r.isCorrect ? '#27ae60' : '#e74c3c';
        const chosenText = r.selectedIndex >= 0 && r.choices[r.selectedIndex] !== undefined ? r.choices[r.selectedIndex] : '(chưa chọn)';
        html += `
            <div style="margin-bottom:12px; padding:10px 12px; border-left:4px solid ${borderColor}; background:#f9f9f9; border-radius:4px;">
                <div style="font-weight:bold; margin-bottom:4px;">Câu ${i + 1}. ${escapeHtml(r.question)}</div>
                <div style="font-size:0.9em; color:${r.isCorrect ? '#27ae60' : '#e74c3c'};">
                    <i class="fas ${r.isCorrect ? 'fa-check' : 'fa-times'}"></i>
                    Bạn chọn: ${escapeHtml(chosenText)}
                    ${r.isCorrect ? '' : ' — Đáp án đúng: ' + escapeHtml(r.choices[r.correctIndex])}
                </div>
                ${r.explanation ? `<div style="font-size:0.85em; color:#7f8c8d; margin-top:4px;">${escapeHtml(r.explanation)}</div>` : ''}
            </div>
        `;
    });
    if (data.content) {
        html += `
            <h4 style="margin-top:15px; color:#16a085;"><i class="fas fa-align-left"></i> Xem lại nội dung gốc:</h4>
            <div class="preserve-format" style="white-space:pre-wrap; background:#fdfdfd; padding:12px; border-radius:6px; border:1px solid #eee;">${escapeHtml(data.content)}</div>
        `;
    }
    return html;
}

function renderComprehensionResult(result) {
    if (comprehensionResultBox) {
        comprehensionResultBox.innerHTML = buildComprehensionAssessmentHTML(result);
        comprehensionResultBox.classList.remove('hidden');
    }
    activeComprehensionBox?.classList.add('hidden');
}

// ĐÃ SỬA: không tái dùng saveCurrentSessionToHistory() (được viết riêng cho luồng audio/text +
// nút "Lưu bài" thủ công) — Nghe/Đọc hiểu tự lưu NGAY sau khi chấm xong (không cần người dùng bấm Lưu,
// vì kết quả trắc nghiệm đã chốt, không có gì để "xem rồi mới quyết định lưu" như Speaking/Writing).
async function saveComprehensionToHistory(result) {
    const item = {
        id: Date.now(),
        type: currentSkill, // 'listening' | 'reading'
        title: `[${skillLabel(currentSkill)}] ${result.itemTitle || comprehensionCurrentItem?.title || ''}`,
        date: new Date().toLocaleString('vi-VN'),
        promptText: result.itemTitle || '',
        promptImage: null,
        language: langSelect.options[langSelect.selectedIndex]?.text || '',
        level: result.level || lastKnownLevelDisplayText || '',
        writingText: null,
        driveAudio: null,
        assessment: result
    };

    try {
        const payload = { action: 'save_history_item', idToken: getIdToken(), item: item };
        const response = await fetch(GAS_WEB_APP_URL, { method: 'POST', body: JSON.stringify(payload) });
        const apiResult = await response.json();
        if (!apiResult.success) throw new Error(apiResult.error);
        // ĐÃ THÊM (Mastery): giống hệt saveCurrentSessionToHistory() — báo lên/hạ cấp nếu có.
        if (apiResult.data && apiResult.data.mastery && apiResult.data.mastery.changed) {
            showLevelChangeToast(apiResult.data.mastery.direction, apiResult.data.mastery.newLevel);
            refreshCurrentLevel();
        }
    } catch (err) {
        console.warn("Không lưu được bài Nghe/Đọc hiểu vào lịch sử:", err);
    }
    await loadHistory();
}

// ==========================================
// 15. THI THỬ 4 KỸ NĂNG (MOCK TEST — mô phỏng thi thật, có tính giờ)
// ==========================================
// Nghe → Đọc → Viết → Nói, mỗi phần tính giờ riêng, hết giờ tự nộp. THIẾT KẾ: Backend (Controller_
// MockTest.gs) chỉ có 1 action 'start_mock_test' để lấy/sinh đủ 4 đề 1 lần — chấm điểm từng phần TÁI
// DÙNG NGUYÊN VẸN 3 action đã có (submit_comprehension_answers/evaluate_writing/evaluate_speaking),
// lưu lịch sử qua save_history_item y hệt luyện tập thường (chỉ thêm tiền tố "[Thi thử]") -> SRS/
// Mastery/streak/heatmap tự động hoạt động, không cần code thêm ở các module đó.
const mocktestModal = document.getElementById('mocktest-modal');
const btnOpenMockTest = document.getElementById('btn-open-mocktest');
const mocktestCloseX = document.getElementById('mocktest-close-x');
const mocktestIntro = document.getElementById('mocktest-intro');
const btnMockTestStart = document.getElementById('btn-mocktest-start');
const mocktestSectionArea = document.getElementById('mocktest-section-area');
const mocktestSectionProgress = document.getElementById('mocktest-section-progress');
const mocktestTimerEl = document.getElementById('mocktest-timer');
const mocktestSectionTitle = document.getElementById('mocktest-section-title');
const mocktestSectionBody = document.getElementById('mocktest-section-body');
const btnMockTestSubmitSection = document.getElementById('btn-mocktest-submit-section');
const mocktestReport = document.getElementById('mocktest-report');

const MOCKTEST_SECTION_LABELS = { listening: '🔊 Nghe hiểu', reading: '📖 Đọc hiểu', writing: '✍️ Viết', speaking: '🎤 Nói' };

let mockTestData = null;            // { order, timeLimits, sections } — trả về từ start_mock_test
let mockTestIndex = 0;
let mockTestResults = {};           // { listening: gradedResult, reading:..., writing: assessment, speaking: assessment }
let mockTestTimerInterval = null;
let mockTestSelectedAnswers = [];   // đáp án đang chọn của phần Nghe/Đọc hiện tại
let mockTestSubmitting = false;     // chặn nộp trùng khi hết giờ VÀ người dùng bấm nộp cùng lúc

// --- Ghi âm riêng cho phần Nói trong Mock Test (KHÔNG dùng chung mediaRecorder của workspace Speaking
// thường — tách biệt để không xung đột trạng thái nếu người dùng có bài Speaking dở dang trước đó). ---
let mockTestMediaRecorder = null;
let mockTestSpeakingChunks = [];
let mockTestSpeakingBase64 = null;
let mockTestSpeakingMimeType = 'audio/webm';
let mockTestRecordingStopResolve = null;

function resetMockTestUI() {
    stopMockTestTimer();
    mockTestData = null;
    mockTestIndex = 0;
    mockTestResults = {};
    mockTestSelectedAnswers = [];
    mockTestSpeakingBase64 = null;
    if (mocktestIntro) mocktestIntro.classList.remove('hidden');
    if (mocktestSectionArea) mocktestSectionArea.classList.add('hidden');
    if (mocktestReport) { mocktestReport.classList.add('hidden'); mocktestReport.innerHTML = ''; }
    if (btnMockTestStart) { btnMockTestStart.disabled = false; btnMockTestStart.innerHTML = '<i class="fas fa-play"></i> Bắt đầu thi thử'; }
}

btnOpenMockTest?.addEventListener('click', () => {
    resetMockTestUI();
    mocktestModal?.classList.remove('hidden');
});

mocktestCloseX?.addEventListener('click', () => {
    stopMockTestTimer();
    if (mockTestMediaRecorder && mockTestMediaRecorder.state === 'recording') {
        mockTestMediaRecorder.stop();
        mockTestMediaRecorder.stream.getTracks().forEach(t => t.stop());
    }
    mocktestModal?.classList.add('hidden');
});

async function startMockTest() {
    if (!btnMockTestStart) return;
    btnMockTestStart.disabled = true;
    btnMockTestStart.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang chuẩn bị đề (Nghe/Đọc/Viết/Nói)...';

    const payload = {
        action: 'start_mock_test',
        language: langSelect.value,
        languageDisplayText: langSelect.options[langSelect.selectedIndex]?.text || ''
    };
    const data = await callBackendAPI(payload, '', false);

    if (!data) {
        alert('Không tạo được bài thi thử, vui lòng thử lại (có thể ngôn ngữ này chưa có đủ ngân hàng đề Nghe/Đọc).');
        btnMockTestStart.disabled = false;
        btnMockTestStart.innerHTML = '<i class="fas fa-play"></i> Bắt đầu thi thử';
        return;
    }

    mockTestData = data;
    mockTestIndex = 0;
    mockTestResults = {};
    mocktestIntro.classList.add('hidden');
    mocktestSectionArea.classList.remove('hidden');
    renderMockTestSection(mockTestIndex);
}
btnMockTestStart?.addEventListener('click', startMockTest);

function renderMockTestSection(index) {
    const type = mockTestData.order[index];
    const section = mockTestData.sections[type];
    mocktestSectionProgress.textContent = `Phần ${index + 1}/4 — ${MOCKTEST_SECTION_LABELS[type]}`;
    mocktestSectionTitle.textContent = section.title || '';
    mocktestSectionBody.innerHTML = '';
    btnMockTestSubmitSection.disabled = false;
    btnMockTestSubmitSection.innerHTML = '<i class="fas fa-arrow-right"></i> Nộp & Tiếp tục';

    if (type === 'listening' || type === 'reading') {
        renderMockTestComprehensionSection(type, section);
    } else if (type === 'writing') {
        renderMockTestWritingSection(section);
    } else if (type === 'speaking') {
        renderMockTestSpeakingSection(section);
    }

    startMockTestTimer(mockTestData.timeLimits[type]);
}

function renderMockTestComprehensionSection(type, section) {
    mockTestSelectedAnswers = new Array(section.questions.length).fill(-1);
    btnMockTestSubmitSection.disabled = true;

    if (type === 'reading') {
        const passageBox = document.createElement('div');
        passageBox.className = 'preserve-format';
        passageBox.style.cssText = 'font-size:1.02em; line-height:1.6; background:#fdfdfd; padding:14px; border-radius:8px; border:1px solid #eee; margin-bottom:14px;';
        passageBox.textContent = section.content;
        mocktestSectionBody.appendChild(passageBox);
    } else {
        const audioBox = document.createElement('div');
        audioBox.style.cssText = 'background:#eafaf1; padding:14px; border-radius:8px; border:1px solid #a3e4d7; margin-bottom:14px; text-align:center;';
        audioBox.innerHTML = `
            <button id="btn-mocktest-play-audio" class="btn" style="background:#16a085; color:white;"><i class="fas fa-volume-up"></i> Nghe bài (có thể nghe lại)</button>
            <div id="mocktest-audio-status" style="font-size:0.85em; color:#e67e22; font-style:italic; margin-top:8px;"></div>
            <audio id="mocktest-audio-player" controls style="width:100%; margin-top:10px; display:none;"></audio>
        `;
        mocktestSectionBody.appendChild(audioBox);
        document.getElementById('btn-mocktest-play-audio').onclick = () => {
            window.generateAndPlaySample && window.generateAndPlaySample(section.content, 'Charon', {
                btnId: 'btn-mocktest-play-audio', statusId: 'mocktest-audio-status', playerId: 'mocktest-audio-player'
            });
        };
    }

    section.questions.forEach((q, qIndex) => {
        const qBox = document.createElement('div');
        qBox.style.cssText = 'margin-bottom:14px; padding:12px; background:#fdfdfd; border:1px solid #eee; border-radius:8px;';
        const qText = document.createElement('div');
        qText.style.cssText = 'font-weight:bold; margin-bottom:8px; color:#2c3e50;';
        qText.textContent = `Câu ${qIndex + 1}. ${q.question}`;
        qBox.appendChild(qText);

        const choicesWrap = document.createElement('div');
        choicesWrap.style.cssText = 'display:flex; flex-direction:column; gap:6px;';
        q.choices.forEach((choice, cIndex) => {
            const btn = document.createElement('button');
            btn.className = 'btn';
            btn.style.cssText = 'text-align:left; justify-content:flex-start; background:#f4f7f6; color:#2c3e50; border:1px solid #ccc; padding:9px 12px; font-size:0.92em;';
            btn.textContent = String.fromCharCode(65 + cIndex) + '. ' + choice;
            btn.onclick = () => {
                mockTestSelectedAnswers[qIndex] = cIndex;
                choicesWrap.querySelectorAll('button').forEach((b, i) => {
                    const sel = i === cIndex;
                    b.style.background = sel ? '#2980b9' : '#f4f7f6';
                    b.style.color = sel ? 'white' : '#2c3e50';
                    b.style.borderColor = sel ? '#2980b9' : '#ccc';
                });
                btnMockTestSubmitSection.disabled = mockTestSelectedAnswers.some(a => a === -1);
            };
            choicesWrap.appendChild(btn);
        });
        qBox.appendChild(choicesWrap);
        mocktestSectionBody.appendChild(qBox);
    });
}

function renderMockTestWritingSection(section) {
    const promptBox = document.createElement('div');
    promptBox.className = 'preserve-format';
    promptBox.style.cssText = 'font-size:1.02em; line-height:1.6; background:#fdfdfd; padding:14px; border-radius:8px; border:1px solid #eee; margin-bottom:14px;';
    promptBox.innerHTML = safeMarkdown(section.promptText); // đề do AI sinh, đã qua safeMarkdown() (DOMPurify) giống mọi nơi khác

    const textarea = document.createElement('textarea');
    textarea.id = 'mocktest-writing-input';
    textarea.placeholder = 'Bắt đầu gõ bài viết của bạn tại đây...';
    textarea.style.cssText = 'width:100%; min-height:200px; padding:12px; font-size:1.05em; border-radius:8px; border:1px solid var(--border-color); resize:vertical; line-height:1.6;';

    const wordCount = document.createElement('div');
    wordCount.style.cssText = 'margin-top:8px; font-weight:bold; color:#7f8c8d;';
    wordCount.textContent = 'Số từ: 0';
    textarea.addEventListener('input', () => {
        const words = textarea.value.trim().split(/\s+/).filter(Boolean).length;
        wordCount.textContent = 'Số từ: ' + words;
    });

    mocktestSectionBody.appendChild(promptBox);
    mocktestSectionBody.appendChild(textarea);
    mocktestSectionBody.appendChild(wordCount);
}

function renderMockTestSpeakingSection(section) {
    mockTestSpeakingBase64 = null;
    btnMockTestSubmitSection.disabled = true;

    const promptBox = document.createElement('div');
    promptBox.className = 'preserve-format';
    promptBox.style.cssText = 'font-size:1.02em; line-height:1.6; background:#fdfdfd; padding:14px; border-radius:8px; border:1px solid #eee; margin-bottom:14px;';
    promptBox.innerHTML = safeMarkdown(section.promptText);

    const controlsBox = document.createElement('div');
    controlsBox.style.cssText = 'text-align:center; padding:10px 0;';
    controlsBox.innerHTML = `
        <button id="mocktest-btn-record" class="btn record-btn"><i class="fas fa-microphone"></i> Ghi âm</button>
        <button id="mocktest-btn-stop" class="btn stop-btn" style="margin-left:10px;" disabled><i class="fas fa-stop"></i> Dừng</button>
        <audio id="mocktest-audio-preview" controls style="display:none; width:100%; margin-top:12px;"></audio>
    `;

    mocktestSectionBody.appendChild(promptBox);
    mocktestSectionBody.appendChild(controlsBox);

    document.getElementById('mocktest-btn-record').onclick = startMockTestRecording;
    document.getElementById('mocktest-btn-stop').onclick = stopMockTestRecording;
}

async function startMockTestRecording() {
    const recordBtn = document.getElementById('mocktest-btn-record');
    const stopBtn = document.getElementById('mocktest-btn-stop');
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mockTestMediaRecorder = new MediaRecorder(stream);
        mockTestSpeakingChunks = [];
        mockTestMediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) mockTestSpeakingChunks.push(e.data); };
        mockTestMediaRecorder.onstop = () => {
            const blob = new Blob(mockTestSpeakingChunks, { type: mockTestMediaRecorder.mimeType || 'audio/webm' });
            mockTestSpeakingMimeType = blob.type;
            const preview = document.getElementById('mocktest-audio-preview');
            if (preview) { preview.src = URL.createObjectURL(blob); preview.style.display = 'block'; }
            const reader = new FileReader();
            reader.onloadend = () => {
                mockTestSpeakingBase64 = reader.result;
                if (btnMockTestSubmitSection) btnMockTestSubmitSection.disabled = false;
                if (mockTestRecordingStopResolve) { mockTestRecordingStopResolve(); mockTestRecordingStopResolve = null; }
            };
            reader.readAsDataURL(blob);
        };
        mockTestMediaRecorder.start();
        if (recordBtn) { recordBtn.disabled = true; recordBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Đang thu...'; }
        if (stopBtn) stopBtn.disabled = false;
    } catch (err) { alert('Lỗi Micro: ' + err.message); }
}

function stopMockTestRecording() {
    if (mockTestMediaRecorder && mockTestMediaRecorder.state === 'recording') {
        mockTestMediaRecorder.stop();
        mockTestMediaRecorder.stream.getTracks().forEach(t => t.stop());
        const recordBtn = document.getElementById('mocktest-btn-record');
        const stopBtn = document.getElementById('mocktest-btn-stop');
        if (recordBtn) { recordBtn.disabled = false; recordBtn.innerHTML = '<i class="fas fa-microphone"></i> Ghi âm lại'; }
        if (stopBtn) stopBtn.disabled = true;
    }
}

// Nếu hết giờ ĐÚNG lúc đang ghi âm dở — tự dừng thu, đợi encode xong (FileReader trong onstop ở trên)
// rồi mới cho phép nộp, thay vì mất trắng đoạn đang ghi.
function waitForMockTestRecordingStop() {
    return new Promise((resolve) => {
        if (!mockTestMediaRecorder || mockTestMediaRecorder.state !== 'recording') { resolve(); return; }
        mockTestRecordingStopResolve = resolve;
        stopMockTestRecording();
    });
}

function startMockTestTimer(seconds) {
    stopMockTestTimer();
    let remaining = seconds;
    updateMockTestTimerDisplay(remaining);
    mockTestTimerInterval = setInterval(() => {
        remaining--;
        updateMockTestTimerDisplay(remaining);
        if (remaining <= 0) {
            stopMockTestTimer();
            submitMockTestSection(true); // hết giờ -> tự nộp phần đang làm
        }
    }, 1000);
}

function stopMockTestTimer() {
    if (mockTestTimerInterval) { clearInterval(mockTestTimerInterval); mockTestTimerInterval = null; }
}

function updateMockTestTimerDisplay(seconds) {
    const s = Math.max(0, seconds);
    const mm = String(Math.floor(s / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    if (mocktestTimerEl) {
        mocktestTimerEl.textContent = `${mm}:${ss}`;
        mocktestTimerEl.style.color = s <= 30 ? '#e74c3c' : '#2c3e50';
    }
}

async function submitMockTestSection(isTimeout) {
    if (mockTestSubmitting) return;
    mockTestSubmitting = true;
    stopMockTestTimer();

    const type = mockTestData.order[mockTestIndex];
    const section = mockTestData.sections[type];
    btnMockTestSubmitSection.disabled = true;
    btnMockTestSubmitSection.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang chấm...';

    function backToEditable() {
        mockTestSubmitting = false;
        btnMockTestSubmitSection.disabled = false;
        btnMockTestSubmitSection.innerHTML = '<i class="fas fa-arrow-right"></i> Nộp & Tiếp tục';
    }

    let result = null;

    if (type === 'listening' || type === 'reading') {
        // Nghe/Đọc: cứ nộp thẳng dù chưa chọn hết (câu chưa chọn tính -1 = sai) — Backend đã xử lý sẵn.
        const payload = { action: 'submit_comprehension_answers', skill: type, language: langSelect.value, itemId: section.itemId, answers: mockTestSelectedAnswers };
        result = await callBackendAPI(payload, '', false);
    } else if (type === 'writing') {
        const textarea = document.getElementById('mocktest-writing-input');
        const text = textarea ? textarea.value.trim() : '';
        if (!text || text.length < 5) {
            if (!isTimeout) { alert('Bài viết quá ngắn, viết thêm trước khi nộp nhé.'); backToEditable(); return; }
            result = { skipped: true, reason: 'Hết giờ, chưa nộp đủ bài viết.' };
        } else {
            const payload = { action: 'evaluate_writing', text: text, language: langSelect.options[langSelect.selectedIndex].text, promptText: section.promptText };
            result = await callBackendAPI(payload, '', false);
            if (result) result._mockTestText = text; // giữ lại để lưu vào History (writingText)
        }
    } else if (type === 'speaking') {
        await waitForMockTestRecordingStop();
        if (!mockTestSpeakingBase64) {
            if (!isTimeout) { alert('Hãy ghi âm câu trả lời trước khi nộp.'); backToEditable(); return; }
            result = { skipped: true, reason: 'Hết giờ, chưa ghi âm.' };
        } else {
            const payload = { action: 'evaluate_speaking', audio: mockTestSpeakingBase64, mimeType: mockTestSpeakingMimeType, language: langSelect.options[langSelect.selectedIndex].text, promptText: section.promptText };
            result = await callBackendAPI(payload, '', false);
        }
    }

    if (!result) {
        // Lỗi mạng/API thật (không phải do hết giờ bỏ qua) -> cho thử lại, không ép qua phần tiếp theo.
        alert('Chấm điểm phần này thất bại, vui lòng thử lại.');
        backToEditable();
        return;
    }

    mockTestResults[type] = result;
    if (!result.skipped) await saveMockTestSectionToHistory(type, section, result);

    mockTestSubmitting = false;
    mockTestIndex++;

    if (mockTestIndex >= mockTestData.order.length) {
        finishMockTest();
    } else {
        renderMockTestSection(mockTestIndex);
    }
}
btnMockTestSubmitSection?.addEventListener('click', () => submitMockTestSection(false));

// ĐÃ SỬA: không tái dùng saveCurrentSessionToHistory()/saveComprehensionToHistory() — Mock Test lưu cả
// 4 loại (listening/reading/writing/speaking) qua CÙNG 1 hàm, chỉ khác field nào áp dụng cho loại nào.
async function saveMockTestSectionToHistory(type, section, result) {
    const languageCode = langSelect.value;
    const levelText = section.level ? levelDisplayText(languageCode, section.level) : (lastKnownLevelDisplayText || '');
    const titleSuffix = (type === 'listening' || type === 'reading') ? (section.title || '') : (section.title || '');

    const item = {
        id: Date.now() + Math.floor(Math.random() * 1000), // +random: tránh trùng id nếu 2 phần nộp cùng millisecond
        type: type,
        title: `[Thi thử] ${MOCKTEST_SECTION_LABELS[type]} — ${titleSuffix}`,
        date: new Date().toLocaleString('vi-VN'),
        promptText: (type === 'listening' || type === 'reading') ? (result.itemTitle || titleSuffix) : (section.promptText || ''),
        promptImage: null,
        language: langSelect.options[langSelect.selectedIndex]?.text || '',
        level: levelText,
        writingText: type === 'writing' ? (result._mockTestText || '') : null,
        driveAudio: null, // ĐÃ BỎ (v1): không upload audio Nói lên Drive trong Mock Test — giữ luồng gọn/nhanh, transcript AI vẫn được lưu trong assessment
        assessment: result
    };

    try {
        const payload = { action: 'save_history_item', idToken: getIdToken(), item: item };
        const response = await fetch(GAS_WEB_APP_URL, { method: 'POST', body: JSON.stringify(payload) });
        const apiResult = await response.json();
        if (!apiResult.success) throw new Error(apiResult.error);
        if (apiResult.data && apiResult.data.mastery && apiResult.data.mastery.changed) {
            showLevelChangeToast(apiResult.data.mastery.direction, apiResult.data.mastery.newLevel);
        }
    } catch (err) {
        console.warn('Không lưu được phần thi thử vào lịch sử:', err);
    }
}

function buildMockTestReportHTML() {
    const languageCode = langSelect.value;
    const order = (LANGUAGE_LEVELS[languageCode] || LANGUAGE_LEVELS.english).map(l => l.value);
    const orderIndex = {};
    order.forEach((v, i) => { orderIndex[v] = i; });

    let validIndices = [];
    let sectionsHtml = '';

    ['listening', 'reading', 'writing', 'speaking'].forEach(type => {
        const result = mockTestResults[type];
        sectionsHtml += `<div style="margin-bottom:14px; padding:12px 14px; background:#f9f9f9; border-radius:8px; border-left:4px solid #c0392b;">`;
        sectionsHtml += `<div style="font-weight:bold; color:#2c3e50; margin-bottom:6px;">${MOCKTEST_SECTION_LABELS[type]}</div>`;
        if (!result || result.skipped) {
            sectionsHtml += `<div style="color:#e67e22; font-size:0.9em;"><i class="fas fa-exclamation-triangle"></i> ${escapeHtml((result && result.reason) || 'Chưa hoàn thành phần này.')}</div>`;
        } else {
            if (type === 'listening' || type === 'reading') {
                sectionsHtml += `<div>${result.correct_count}/${result.total_questions} câu đúng (${result.score_percent}%)</div>`;
            } else {
                const s = result.scores || {};
                const vals = Object.values(s).filter(v => typeof v === 'number');
                const avg = vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : '-';
                sectionsHtml += `<div>Điểm trung bình: ${avg}/10</div>`;
            }
            sectionsHtml += `<div style="font-size:0.85em; color:#7f8c8d; margin-top:4px;">Trình độ ước tính: ${escapeHtml(result.estimated_level || '')}</div>`;
            if (typeof orderIndex[result.estimated_level] === 'number') validIndices.push(orderIndex[result.estimated_level]);
        }
        sectionsHtml += `</div>`;
    });

    let overallHtml = '';
    if (validIndices.length) {
        const avgIndex = Math.round(validIndices.reduce((a, b) => a + b, 0) / validIndices.length);
        const overallLevel = order[Math.max(0, Math.min(order.length - 1, avgIndex))];
        overallHtml = `
            <div style="background:linear-gradient(135deg,#c0392b,#e74c3c); padding:16px; border-radius:8px; color:white; margin-bottom:16px;">
                <div style="font-size:0.85em; opacity:0.9;">Trình độ tổng thể ước tính (trung bình 4 kỹ năng)</div>
                <div style="font-size:1.4em; font-weight:bold;">${escapeHtml(levelDisplayText(languageCode, overallLevel))}</div>
            </div>
        `;
    }

    return `
        <h3 style="color:#2c3e50; margin-bottom:12px;"><i class="fas fa-clipboard-check"></i> Kết quả thi thử</h3>
        ${overallHtml}
        ${sectionsHtml}
        <button id="btn-mocktest-close-report" class="btn" style="width:100%; background:#7f8c8d; color:white; margin-top:10px;"><i class="fas fa-times"></i> Đóng</button>
    `;
}

async function finishMockTest() {
    mocktestSectionArea.classList.add('hidden');
    mocktestReport.innerHTML = buildMockTestReportHTML();
    mocktestReport.classList.remove('hidden');
    document.getElementById('btn-mocktest-close-report')?.addEventListener('click', () => mocktestModal.classList.add('hidden'));
    await loadHistory();
    refreshCurrentLevel();
}

// ==========================================
// 16. ĐỌC MỞ RỘNG + NGHE MỞ RỘNG (Comprehensible Input — Krashen's i+1)
// ==========================================
// KHÁC HẲN mục 14 (Nghe hiểu/Đọc hiểu có chấm điểm trắc nghiệm): ở đây KHÔNG chấm điểm, người học chỉ
// đọc/nghe tự nhiên đúng trình độ hiện tại. Điểm khác biệt chính là TÍNH NĂNG BẤM-VÀO-TỪ-ĐỂ-TRA
// (click-to-gloss): mỗi từ trong bài được bọc trong 1 <span> riêng, bấm vào sẽ gọi Backend dịch nghĩa
// THEO ĐÚNG CÂU chứa từ đó (Controller_CIVocab.gs) và tự động thêm 1 thẻ ôn tập SRS — không cần thao
// tác gì thêm từ người học. Nghe mở rộng hiện transcript SONG SONG với audio (khác mục 14, nơi
// transcript bị giấu để đúng bản chất luyện Nghe) vì mục đích ở đây là tiếp nhận (input), không phải
// kiểm tra khả năng nghe.
const ciSkillLabelEl = document.getElementById('ci-skill-label');
const ciIntroBox = document.getElementById('ci-intro-box');
const activeCIBox = document.getElementById('active-ci-box');
const ciItemTitleEl = document.getElementById('ci-item-title');
const ciAudioBox = document.getElementById('ci-audio-box');
const ciAudioStatus = document.getElementById('ci-audio-status');
const ciAudioPlayer = document.getElementById('ci-audio-player');
const btnCIPlayAudio = document.getElementById('btn-ci-play-audio');
const ciContentBox = document.getElementById('ci-content-box');
const ciGlossResult = document.getElementById('ci-gloss-result');
const ciQuestionsList = document.getElementById('ci-questions-list');
const btnCIMarkDone = document.getElementById('btn-ci-mark-done');
const btnStartCI = document.getElementById('btn-start-ci');

let ciCurrentItem = null;      // {itemId, title, content, level, checkQuestions:[{question,modelAnswer}]}
let ciLastActiveWordSpan = null; // span của từ vừa bấm gần nhất — để bỏ highlight khi bấm từ khác

function setupCIIntro() {
    resetCIState();
    if (ciSkillLabelEl) {
        ciSkillLabelEl.textContent = currentSkill === 'ci-listening'
            ? 'Nghe mở rộng (Comprehensible Input)'
            : 'Đọc mở rộng (Comprehensible Input)';
    }
}

function resetCIState() {
    ciCurrentItem = null;
    ciLastActiveWordSpan = null;
    if (ciIntroBox) ciIntroBox.classList.remove('hidden');
    if (activeCIBox) activeCIBox.classList.add('hidden');
    if (ciGlossResult) { ciGlossResult.classList.add('hidden'); ciGlossResult.innerHTML = ''; }
    if (ciAudioPlayer) { ciAudioPlayer.pause(); ciAudioPlayer.style.display = 'none'; ciAudioPlayer.src = ''; }
    if (ciAudioStatus) ciAudioStatus.textContent = '';
    if (ciContentBox) ciContentBox.innerHTML = '';
    if (ciQuestionsList) ciQuestionsList.innerHTML = '';
}

async function startCISession() {
    if (!btnStartCI) return;
    const originalHtml = btnStartCI.innerHTML;
    btnStartCI.disabled = true;
    btnStartCI.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang tải bài...';

    // Không gửi "level" — Backend tự tra cấp độ Mastery hiện tại của reading/listening (đọc, không
    // ghi) để chọn đúng băng nội dung CI (xem Controller_CIContent.gs).
    const payload = { action: 'get_ci_item', skill: currentSkill, language: langSelect.value };
    const data = await callBackendAPI(payload, '', false);

    btnStartCI.disabled = false;
    btnStartCI.innerHTML = originalHtml;

    if (!data) { alert('Không lấy được bài, vui lòng thử lại (có thể ngôn ngữ này chưa có nội dung).'); return; }

    ciCurrentItem = data;
    renderCIItem(data);
}
btnStartCI?.addEventListener('click', startCISession);

function renderCIItem(data) {
    ciIntroBox?.classList.add('hidden');
    activeCIBox?.classList.remove('hidden');
    if (ciGlossResult) { ciGlossResult.classList.add('hidden'); ciGlossResult.innerHTML = ''; }
    ciLastActiveWordSpan = null;

    if (ciItemTitleEl) ciItemTitleEl.textContent = data.title || '';

    if (currentSkill === 'ci-listening') {
        ciAudioBox?.classList.remove('hidden');
        if (ciAudioPlayer) { ciAudioPlayer.style.display = 'none'; ciAudioPlayer.src = ''; }
        if (ciAudioStatus) ciAudioStatus.textContent = '';
    } else {
        ciAudioBox?.classList.add('hidden');
    }

    if (ciContentBox) renderClickableCIContent(ciContentBox, data.content);

    if (ciQuestionsList) {
        ciQuestionsList.innerHTML = '';
        (data.checkQuestions || []).forEach((q, qIndex) => {
            const qBox = document.createElement('div');
            qBox.style.cssText = 'margin-bottom:10px; padding:10px 12px; background:#fdfdfd; border:1px solid #eee; border-radius:8px;';

            const qText = document.createElement('div');
            qText.style.cssText = 'font-weight:bold; color:#2c3e50; margin-bottom:6px;';
            qText.textContent = `Câu hỏi gợi mở ${qIndex + 1}. ${q.question}`;
            qBox.appendChild(qText);

            const revealBtn = document.createElement('button');
            revealBtn.className = 'btn';
            revealBtn.style.cssText = 'font-size:0.82em; padding:5px 10px; background:#f4f7f6; color:#7f8c8d; border:1px solid #ccc;';
            revealBtn.innerHTML = '<i class="fas fa-eye"></i> Xem gợi ý trả lời';

            const answerBox = document.createElement('div');
            answerBox.className = 'hidden';
            answerBox.style.cssText = 'margin-top:6px; font-size:0.9em; color:#16a085; font-style:italic;';
            answerBox.textContent = q.modelAnswer || '';

            revealBtn.addEventListener('click', () => {
                answerBox.classList.toggle('hidden');
                revealBtn.innerHTML = answerBox.classList.contains('hidden')
                    ? '<i class="fas fa-eye"></i> Xem gợi ý trả lời'
                    : '<i class="fas fa-eye-slash"></i> Ẩn gợi ý';
            });

            qBox.appendChild(revealBtn);
            qBox.appendChild(answerBox);
            ciQuestionsList.appendChild(qBox);
        });
    }
}

// Dựng nội dung bài đọc/transcript thành các <span> bấm-được cho từng từ (click-to-gloss). Luôn dùng
// createElement/textContent (không innerHTML) cho dữ liệu động, đúng quy ước XSS của toàn bộ dự án.
// Ngữ cảnh gửi kèm khi tra 1 từ là CÂU chứa từ đó (tách theo dấu .!? cuối câu), không phải cả đoạn —
// giúp Gemini dịch đúng nghĩa theo ngữ cảnh hẹp thay vì mơ hồ.
function renderClickableCIContent(container, text) {
    container.innerHTML = '';
    const lines = String(text || '').split(/\n+/);
    lines.forEach((line, lineIdx) => {
        if (lineIdx > 0) container.appendChild(document.createElement('br'));
        if (!line.trim()) return;

        // Tách câu trong dòng (giữ khoảng trắng phía sau mỗi câu) để làm ngữ cảnh tra từ.
        const sentences = line.match(/[^.!?]+[.!?]*(\s+|$)/g) || [line];
        sentences.forEach(sentence => {
            const trimmedSentence = sentence.trim();
            const tokens = sentence.split(/(\s+)/); // giữ lại khoảng trắng để hiện đúng văn bản gốc

            tokens.forEach(token => {
                if (!token) return;
                if (/^\s+$/.test(token)) {
                    container.appendChild(document.createTextNode(token));
                    return;
                }
                const span = document.createElement('span');
                span.className = 'ci-word';
                span.textContent = token;
                span.addEventListener('click', () => {
                    // \p{L}\p{N} bao trọn chữ cái/số của MỌI ngôn ngữ (Latin/Cyrillic/Hán...), không
                    // chỉ tiếng Anh — để sẵn sàng khi Chinese/Russian có ngân hàng CI ở đợt sau.
                    const cleanWord = token.replace(/^[^\p{L}\p{N}']+|[^\p{L}\p{N}']+$/gu, '');
                    if (!cleanWord) return;
                    handleCIWordClick(cleanWord, trimmedSentence, span);
                });
                container.appendChild(span);
            });
        });
    });
}

btnCIPlayAudio?.addEventListener('click', () => {
    if (!ciCurrentItem || !window.generateAndPlaySample) return;
    // Tái dùng NGUYÊN VẸN hàm phát TTS đã có (index.html) — KHÁC mục 14: ở đây transcript vẫn hiện
    // song song với audio (chủ đích: "nghe + đọc theo", không phải bài kiểm tra khả năng nghe).
    window.generateAndPlaySample(ciCurrentItem.content, 'Charon', {
        btnId: 'btn-ci-play-audio',
        statusId: 'ci-audio-status',
        playerId: 'ci-audio-player'
    });
});

// ĐÃ THÊM (phản hồi "tra chậm quá"): cache tra từ TRÊN TRÌNH DUYỆT theo (ngôn ngữ + từ, không phân
// biệt hoa/thường) — chỉ áp dụng cho đường tra NHANH (quick_translate_word, dịch theo từ đơn nên kết
// quả không đổi theo câu). Tra lại đúng từ đó lần 2 trong cùng phiên -> hiện NGAY từ cache, KHÔNG gửi
// request nào lên Backend nữa. Chỉ là biến JS trong bộ nhớ (không dùng localStorage) -> mất khi tải
// lại trang, chấp nhận được vì tra lại vốn đã rất nhanh.
const ciTranslationCache = new Map();

async function handleCIWordClick(word, contextSentence, spanEl) {
    if (ciLastActiveWordSpan) ciLastActiveWordSpan.classList.remove('ci-word-active');
    spanEl.classList.add('ci-word-active');
    ciLastActiveWordSpan = spanEl;

    if (!ciGlossResult) return;
    const languageCode = langSelect.value;
    const cacheKey = languageCode + '::' + word.toLowerCase();
    const cached = ciTranslationCache.get(cacheKey);

    if (cached) {
        renderCIGlossResult(word, contextSentence, cached, true);
        return; // ĐÃ CÓ trong cache -> không gọi Backend, không tạo thêm thẻ SRS (đã tạo lần tra đầu)
    }

    ciGlossResult.classList.remove('hidden');
    ciGlossResult.innerHTML = '';
    const loadingEl = document.createElement('div');
    loadingEl.style.cssText = 'color:#7f8c8d; font-size:0.9em;';
    loadingEl.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Đang tra "${escapeHtml(word)}"...`;
    ciGlossResult.appendChild(loadingEl);

    // Đường NHANH mặc định: Google Translate qua LanguageApp (Controller_CIVocab.gs), không qua
    // Gemini -> gần như tức thì. Tự tạo thẻ SRS ngay ở Backend.
    const payload = {
        action: 'quick_translate_word',
        word: word,
        contextSentence: contextSentence,
        language: languageCode,
        skill: currentSkill
    };
    const result = await callBackendAPI(payload, '', false);

    if (!result) {
        ciGlossResult.innerHTML = '';
        const errEl = document.createElement('div');
        errEl.style.cssText = 'color:#e74c3c; font-size:0.9em;';
        errEl.textContent = 'Tra từ thất bại, thử lại nhé.';
        ciGlossResult.appendChild(errEl);
        return;
    }

    ciTranslationCache.set(cacheKey, result.translation);
    renderCIGlossResult(word, contextSentence, result.translation, false);
    refreshSrsDueCount(); // ĐÃ THÊM: cập nhật ngay badge số thẻ cần ôn (mỗi lần tra từ MỚI tạo thêm 1 thẻ)
}

// Dựng khung kết quả tra nhanh + nút "Giải thích theo ngữ cảnh" (đường chậm hơn, chỉ gọi khi bấm).
// fromCache=true -> bỏ dòng "Đã thêm vào ôn tập SRS" (không tạo thẻ mới khi lấy từ cache).
function renderCIGlossResult(word, contextSentence, translation, fromCache) {
    if (!ciGlossResult) return;
    ciGlossResult.classList.remove('hidden');
    ciGlossResult.innerHTML = '';

    const wordLine = document.createElement('div');
    wordLine.style.cssText = 'font-weight:bold; color:#16a085; margin-bottom:4px;';
    wordLine.textContent = word;
    ciGlossResult.appendChild(wordLine);

    const translationLine = document.createElement('div');
    translationLine.style.cssText = 'color:#2c3e50; margin-bottom:6px;';
    translationLine.textContent = translation || '';
    ciGlossResult.appendChild(translationLine);

    const actionsRow = document.createElement('div');
    actionsRow.style.cssText = 'display:flex; align-items:center; gap:10px; flex-wrap:wrap;';

    if (!fromCache) {
        const srsNote = document.createElement('span');
        srsNote.style.cssText = 'color:#27ae60; font-size:0.8em;';
        srsNote.innerHTML = '<i class="fas fa-check"></i> Đã thêm vào ôn tập SRS.';
        actionsRow.appendChild(srsNote);
    }

    const explainBtn = document.createElement('button');
    explainBtn.className = 'btn';
    explainBtn.style.cssText = 'font-size:0.78em; padding:4px 9px; background:#f4ecf7; color:#8e44ad; border:1px solid #d7bde2;';
    explainBtn.innerHTML = '<i class="fas fa-comment-dots"></i> Giải thích theo ngữ cảnh';
    explainBtn.addEventListener('click', () => requestCIContextExplanation(word, contextSentence, explainBtn));
    actionsRow.appendChild(explainBtn);

    ciGlossResult.appendChild(actionsRow);

    const explainBox = document.createElement('div');
    explainBox.style.cssText = 'margin-top:6px;';
    ciGlossResult.appendChild(explainBox);
}

// ĐÃ THÊM: đường CHẬM HƠN (vẫn dùng Gemini, model nhẹ gemini-3.5-flash-lite ở Backend) — chỉ gọi khi
// người học chủ động bấm, dùng cho từ đa nghĩa cần phân biệt đúng nghĩa theo câu. KHÔNG tạo thêm thẻ
// SRS (thẻ đã được tạo từ lần tra nhanh trước đó, tránh trùng).
async function requestCIContextExplanation(word, contextSentence, btnEl) {
    const originalHtml = btnEl.innerHTML;
    btnEl.disabled = true;
    btnEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang giải thích...';

    const payload = {
        action: 'explain_word_in_context',
        word: word,
        contextSentence: contextSentence,
        language: langSelect.value,
        skill: currentSkill
    };
    const result = await callBackendAPI(payload, '', false);

    btnEl.disabled = false;
    btnEl.innerHTML = originalHtml;
    btnEl.style.display = 'none'; // đã giải thích xong, ẩn nút để tránh gọi lại nhiều lần không cần thiết

    const explainBox = btnEl.parentElement?.nextElementSibling;
    if (!explainBox) return;
    explainBox.innerHTML = '';

    if (!result) {
        const errEl = document.createElement('div');
        errEl.style.cssText = 'color:#e74c3c; font-size:0.85em;';
        errEl.textContent = 'Giải thích thất bại, thử lại nhé.';
        explainBox.appendChild(errEl);
        return;
    }

    const posLine = document.createElement('div');
    posLine.style.cssText = 'font-size:0.85em; color:#8e44ad;';
    posLine.textContent = (result.part_of_speech ? '(' + result.part_of_speech + ') ' : '') + (result.translation || '');
    explainBox.appendChild(posLine);

    if (result.note) {
        const noteLine = document.createElement('div');
        noteLine.style.cssText = 'color:#7f8c8d; font-size:0.82em; font-style:italic; margin-top:2px;';
        noteLine.textContent = result.note;
        explainBox.appendChild(noteLine);
    }
}

// ĐÃ THÊM: "Xong bài này" — lưu 1 bản ghi TỐI GIẢN vào Lịch sử (không có điểm số/assessment chấm
// điểm gì cả, chỉ để tính vào streak/heatmap qua logActivity_() vốn đã gọi KHÔNG ĐIỀU KIỆN cho MỌI
// loại bài — xem handleSaveHistoryItem() ở Router.gs) rồi tự động tải luôn bài tiếp theo.
async function markCIDone() {
    if (!ciCurrentItem) return;
    if (btnCIMarkDone) { btnCIMarkDone.disabled = true; btnCIMarkDone.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lưu...'; }

    const item = {
        id: Date.now(),
        type: currentSkill, // 'ci-reading' | 'ci-listening'
        title: `[${skillLabel(currentSkill)}] ${ciCurrentItem.title || ''}`,
        date: new Date().toLocaleString('vi-VN'),
        promptText: ciCurrentItem.title || '',
        promptImage: null,
        language: langSelect.options[langSelect.selectedIndex]?.text || '',
        level: ciCurrentItem.level || lastKnownLevelDisplayText || '',
        writingText: null,
        driveAudio: null,
        // KHÔNG có score/estimated_level — CI không chấm điểm. Lưu lại content/checkQuestions để xem
        // lại được ở Lịch sử (buildCIAssessmentHTML), giống cách Nghe/Đọc hiểu lưu lại "content" gốc.
        assessment: { content: ciCurrentItem.content, level: ciCurrentItem.level, checkQuestions: ciCurrentItem.checkQuestions }
    };

    try {
        const payload = { action: 'save_history_item', idToken: getIdToken(), item: item };
        const response = await fetch(GAS_WEB_APP_URL, { method: 'POST', body: JSON.stringify(payload) });
        const apiResult = await response.json();
        if (!apiResult.success) throw new Error(apiResult.error);
    } catch (err) {
        console.warn("Không lưu được bài Đọc/Nghe mở rộng vào lịch sử:", err);
    }
    await loadHistory();

    if (btnCIMarkDone) { btnCIMarkDone.disabled = false; btnCIMarkDone.innerHTML = '<i class="fas fa-check-circle"></i> Xong bài này, lấy bài khác'; }
    await startCISession(); // tự động tải bài tiếp theo, giữ mạch đọc/nghe liên tục
}
btnCIMarkDone?.addEventListener('click', markCIDone);

// Dựng lại HTML khi xem 1 bài CI đã lưu trong Lịch sử — hiện lại nội dung gốc + câu hỏi gợi mở kèm
// LUÔN đáp án mẫu (khác lúc làm bài, ở đây không cần nút "Xem gợi ý" vì chỉ là xem lại).
function buildCIAssessmentHTML(data) {
    if (!data) return '<p style="color:#e74c3c;">Không có dữ liệu.</p>';
    let html = `
        <h4 style="margin-top:15px; color:#8e44ad;"><i class="fas fa-align-left"></i> Nội dung bài:</h4>
        <div class="preserve-format" style="white-space:pre-wrap; background:#fdfdfd; padding:12px; border-radius:6px; border:1px solid #eee; margin-bottom:12px;">${escapeHtml(data.content || '')}</div>
    `;
    (data.checkQuestions || []).forEach((q, i) => {
        html += `
            <div style="margin-bottom:10px; padding:10px 12px; background:#f9f9f9; border-left:4px solid #8e44ad; border-radius:4px;">
                <div style="font-weight:bold; margin-bottom:4px;">Câu hỏi gợi mở ${i + 1}. ${escapeHtml(q.question)}</div>
                <div style="font-size:0.9em; color:#16a085; font-style:italic;">${escapeHtml(q.modelAnswer || '')}</div>
            </div>
        `;
    });
    return html;
}