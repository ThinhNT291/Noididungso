// ==========================================
// 1. CẤU HÌNH HỆ THỐNG
// ==========================================
const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxWpuLpICy8Y0cJIQ32JcBuPCjpPdEdDplCOy273XXz-abSr2NijCSVq5r3LpE6iTI2/exec"; 

// ==========================================
// 2. KHAI BÁO DOM
// ==========================================
const skillSelect = document.getElementById('skill-select');
const langSelect = document.getElementById('language-select');
const levelSelect = document.getElementById('level-select');
const topicSelect = document.getElementById('topic-select');
const promptMode = document.getElementById('prompt-mode');
const sysPromptArea = document.getElementById('system-prompt-area');
const customPromptArea = document.getElementById('custom-prompt-area');
const customPromptText = document.getElementById('custom-prompt-text');
const customPromptImage = document.getElementById('custom-prompt-image');
const customBankSelect = document.getElementById('custom-bank-select');
const btnSaveBank = document.getElementById('btn-save-bank');

const btnStartSession = document.getElementById('btn-start-session');
const currentPrompt = document.getElementById('current-prompt');
const displayCustomImage = document.getElementById('display-custom-image');
const countdownDisplay = document.getElementById('countdown-display');
const assessmentBox = document.getElementById('assessment-box');
const btnSave = document.getElementById('btn-save');

const speakingWorkspace = document.getElementById('speaking-workspace');
const writingWorkspace = document.getElementById('writing-workspace');

// Speaking DOM
const btnRecord = document.getElementById('btn-record');
const btnStop = document.getElementById('btn-stop');
const audioPlayback = document.getElementById('audio-playback');
const canvas = document.getElementById('audio-visualizer');
const canvasCtx = canvas.getContext('2d');

// Writing DOM
const writingInput = document.getElementById('writing-input');
const wordCountDisplay = document.getElementById('word-count');
const btnGetHints = document.getElementById('btn-get-hints');
const preWritingArea = document.getElementById('pre-writing-area');
const mindmapSvg = document.getElementById('mindmap-svg');
const btnSubmitWriting = document.getElementById('btn-submit-writing');
const btnClearWriting = document.getElementById('btn-clear-writing');
const btnShowHints = document.getElementById('btn-show-hints');
const btnShowMindmap = document.getElementById('btn-show-mindmap');
const hintsModal = document.getElementById('hints-modal');
const closeModal = document.getElementById('close-modal');
const hintsModalBody = document.getElementById('hints-modal-body');

const toggleLeft = document.getElementById('toggle-left');
const toggleRight = document.getElementById('toggle-right');
const sidebarLeft = document.getElementById('sidebar-left');
const sidebarRight = document.getElementById('sidebar-right');

// ==========================================
// 3. BIẾN TOÀN CỤC & INIT
// ==========================================
let mediaRecorder;
let audioChunks = [];
let currentBlob = null;
let currentSessionData = null; 
let currentSkill = 'speaking'; 
let customImageBase64 = null; 
let cachedWritingHints = null;
let timerInterval;
let timeRemaining = 0;
let audioCtx, analyser, animationId;
let systemQuestions = []; // Lưu trữ mảng đề bài từ Google Sheets

document.addEventListener('DOMContentLoaded', () => {
    // Đảm bảo UI khớp với giá trị mặc định
    skillSelect.value = 'speaking';
    speakingWorkspace.classList.remove('hidden');
    writingWorkspace.classList.add('hidden');
    currentPrompt.innerHTML = 'Vui lòng chọn đề hoặc nhập đề tự chọn.';
    
    loadHistory();
    fetchQuestionsFromGAS(); // Load đề hệ thống
});

// ==========================================
// 4. LẤY DỮ LIỆU TỪ GOOGLE SHEETS
// ==========================================
async function fetchQuestionsFromGAS() {
    try {
        const response = await fetch(GAS_WEB_APP_URL + "?action=get_questions");
        const result = await response.json();
        if(result.success) {
            systemQuestions = result.data;
            topicSelect.innerHTML = '';
            if (systemQuestions.length === 0) {
                topicSelect.innerHTML = '<option value="">Chưa có dữ liệu trong Sheet</option>';
            } else {
                systemQuestions.forEach((q, index) => {
                    let opt = document.createElement('option');
                    opt.value = index;
                    opt.text = `Đề ${index + 1}: ${q.title}`;
                    topicSelect.appendChild(opt);
                });
            }
        }
    } catch(e) {
        topicSelect.innerHTML = '<option value="">Lỗi kết nối CSDL</option>';
        console.error("Lỗi tải đề thi:", e);
    }
}

async function callBackendAPI(payload, loadingMessage, isMainAssessment = true) {
    if (isMainAssessment) {
        assessmentBox.innerHTML = `<span class="placeholder-text" style="color:#f39c12;"><i class="fas fa-spinner fa-spin"></i> ${loadingMessage}</span>`;
        if (btnSave) btnSave.classList.add('hidden');
    }
    try {
        const response = await fetch(GAS_WEB_APP_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (!result.success) throw new Error(result.error);
        return result.data;
    } catch (err) {
        if (isMainAssessment) assessmentBox.innerHTML = `<span style="color:red;"><i class="fas fa-exclamation-triangle"></i> Lỗi kết nối: ${err.message}</span>`;
        console.error(err);
        return null;
    }
}

// ==========================================
// 5. THIẾT LẬP ĐỀ & GIAO DIỆN
// ==========================================
if (toggleLeft && sidebarLeft) toggleLeft.addEventListener('click', () => sidebarLeft.classList.toggle('collapsed'));
if (toggleRight && sidebarRight) toggleRight.addEventListener('click', () => sidebarRight.classList.toggle('collapsed'));

skillSelect.addEventListener('change', (e) => {
    currentSkill = e.target.value;
    currentPrompt.innerHTML = 'Vui lòng chọn đề hoặc nhập đề tự chọn.';
    if (currentSkill === 'writing') {
        speakingWorkspace.classList.add('hidden');
        writingWorkspace.classList.remove('hidden');
    } else {
        speakingWorkspace.classList.remove('hidden');
        writingWorkspace.classList.add('hidden');
    }
});

promptMode.addEventListener('change', (e) => {
    if (e.target.value === 'custom') {
        sysPromptArea.classList.add('hidden');
        customPromptArea.classList.remove('hidden');
        loadCustomBank();
    } else {
        sysPromptArea.classList.remove('hidden');
        customPromptArea.classList.add('hidden');
        customImageBase64 = null;
    }
});

customPromptImage.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => { customImageBase64 = reader.result; };
        reader.readAsDataURL(file);
    } else customImageBase64 = null;
});

function loadCustomBank() {
    let bank = JSON.parse(localStorage.getItem('promptBank')) || [];
    customBankSelect.innerHTML = '<option value="">-- Chọn đề đã lưu --</option>';
    bank.forEach((p, index) => {
        let opt = document.createElement('option');
        opt.value = index;
        opt.text = p.text.substring(0, 30) + '...';
        customBankSelect.appendChild(opt);
    });
}

btnSaveBank.addEventListener('click', () => {
    const text = customPromptText.value.trim();
    if (!text) return alert("Vui lòng nhập nội dung đề bài trước khi lưu!");
    let bank = JSON.parse(localStorage.getItem('promptBank')) || [];
    bank.push({ text: text }); 
    localStorage.setItem('promptBank', JSON.stringify(bank));
    alert("Đã lưu vào Ngân hàng đề!");
    loadCustomBank();
});

customBankSelect.addEventListener('change', (e) => {
    if (e.target.value !== "") {
        let bank = JSON.parse(localStorage.getItem('promptBank')) || [];
        customPromptText.value = bank[e.target.value].text;
    }
});

btnStartSession.addEventListener('click', () => {
    if(btnSave) btnSave.classList.add('hidden');
    currentSessionData = null;
    cachedWritingHints = null; // Xóa cache gợi ý cũ
    assessmentBox.innerHTML = '<span class="placeholder-text">Kết quả phân tích sẽ xuất hiện sau khi bạn nộp bài...</span>';

    if (promptMode.value === 'custom') {
        currentPrompt.innerHTML = `<strong>Đề bài:</strong><br>${customPromptText.value.replace(/\n/g, '<br>') || "Không có nội dung"}`;
        if (customImageBase64) {
            displayCustomImage.src = customImageBase64;
            displayCustomImage.classList.remove('hidden');
        } else displayCustomImage.classList.add('hidden');
    } else {
        const selectedIndex = topicSelect.value;
        if (selectedIndex !== "" && systemQuestions[selectedIndex]) {
            currentPrompt.innerHTML = `<strong>Đề bài:</strong><br>${systemQuestions[selectedIndex].content.replace(/\n/g, '<br>')}`;
        } else {
            currentPrompt.innerHTML = `<strong>Đề bài:</strong> Vui lòng chọn một đề hợp lệ.`;
        }
        displayCustomImage.classList.add('hidden');
    }
    
    updateTimerUI(); 
    
    // Reset Writing Workspace
    writingInput.value = '';
    writingInput.dispatchEvent(new Event('input')); 
    preWritingArea.classList.add('hidden');
});

// ==========================================
// 6. MODULE: WRITING & HINTS POPUP
// ==========================================
writingInput.addEventListener('input', () => {
    const text = writingInput.value.trim();
    const words = text.length === 0 ? 0 : text.split(/\s+/).length;
    wordCountDisplay.innerHTML = `<i class="fas fa-pen-nib"></i> Số từ: ${words}`;
    wordCountDisplay.className = words < 120 ? 'word-count-warning' : 'word-count-good';
});

btnClearWriting.addEventListener('click', () => {
    if(confirm("Bạn có chắc muốn xóa toàn bộ bài viết hiện tại?")) {
        writingInput.value = '';
        writingInput.dispatchEvent(new Event('input'));
    }
});

async function fetchWritingHints() {
    if (cachedWritingHints) return cachedWritingHints; 
    
    const payload = {
        action: 'get_writing_hints',
        language: langSelect.options[langSelect.selectedIndex].text,
        promptText: currentPrompt.innerText.replace('Đề bài: ', ''),
        promptImage: customImageBase64
    };
    
    const data = await callBackendAPI(payload, "", false); 
    if (data) cachedWritingHints = data;
    return data;
}

btnShowHints.addEventListener('click', async () => {
    hintsModal.classList.remove('hidden');
    hintsModalBody.innerHTML = '<div style="text-align:center; padding: 30px; color:#f39c12;"><i class="fas fa-spinner fa-spin fa-2x"></i><br>AI đang phân tích chiến thuật...</div>';
    
    const data = await fetchWritingHints();
    if (!data) {
        hintsModalBody.innerHTML = '<span style="color:red;">Lỗi tải dữ liệu.</span>';
        return;
    }
    
    hintsModalBody.innerHTML = `
        <div class="hint-section"><h4><i class="fas fa-search"></i> 1. Phân tích đề bài</h4><p>${data.analysis.replace(/\n/g, '<br>')}</p></div>
        <div class="hint-section"><h4><i class="fas fa-sitemap"></i> 2. Bố cục logic</h4><p>${data.organization.replace(/\n/g, '<br>')}</p></div>
        <div class="hint-section"><h4><i class="fas fa-chess-knight"></i> 3. Chiến lược đạt điểm cao</h4><p>${data.strategy.advice.replace(/\n/g, '<br>')}</p>
            <div style="margin-top:10px;"><strong>Từ vựng "ăn điểm":</strong><br> ${data.strategy.vocabulary.map(v => `<span class="hint-pill">${v}</span>`).join('')}</div>
            <div style="margin-top:10px;"><strong>Từ nối mạch lạc:</strong><br> ${data.strategy.linking_words.map(l => `<span class="hint-pill">${l}</span>`).join('')}</div>
            <div style="margin-top:10px;"><strong>Mẫu câu hay:</strong><br> ${data.strategy.expressions.map(e => `<span class="hint-pill">${e}</span>`).join('')}</div>
        </div>
        <div class="hint-section" style="background: #fdf2e9; padding: 15px; border-radius: 8px;"><h4><i class="fas fa-exclamation-triangle" style="color:#e74c3c;"></i> 4. Lỗi thường gặp</h4><p>${data.common_mistakes.replace(/\n/g, '<br>')}</p></div>
        <div class="hint-section"><h4><i class="fas fa-stopwatch"></i> 5. Kiểm tra 2 phút cuối</h4><p>${data.last_minute_check.replace(/\n/g, '<br>')}</p></div>
        <div class="hint-section"><h4><i class="fas fa-brain"></i> 6. Tư duy làm bài</h4><p>${data.mindset.replace(/\n/g, '<br>')}</p></div>
    `;
});

btnShowMindmap.addEventListener('click', async () => {
    preWritingArea.classList.remove('hidden');
    mindmapSvg.innerHTML = '<text x="20" y="30" fill="#f39c12">Đang nạp dữ liệu Mindmap...</text>';
    
    const data = await fetchWritingHints();
    if (data && data.mindmap_markdown) {
        drawMindmap(data.mindmap_markdown);
    } else {
        mindmapSvg.innerHTML = '<text x="20" y="30" fill="red">Không thể tạo Mindmap.</text>';
    }
});

closeModal.addEventListener('click', () => hintsModal.classList.add('hidden'));
window.addEventListener('click', (e) => { if (e.target === hintsModal) hintsModal.classList.add('hidden'); });

function drawMindmap(markdownText) {
    mindmapSvg.innerHTML = ''; 
    try {
        const { Transformer, Markmap } = window.markmap;
        const transformer = new Transformer();
        const { root } = transformer.transform(markdownText);
        Markmap.create(mindmapSvg, null, root);
    } catch (err) {
        console.error(err);
        mindmapSvg.innerHTML = `<text x="10" y="20" fill="red">Lỗi render Mindmap: ${err.message}</text>`;
    }
}

btnSubmitWriting.addEventListener('click', async () => {
    const text = writingInput.value.trim();
    if (text.length < 10) return alert("Bài viết quá ngắn!");
    clearInterval(timerInterval); 
    const payload = {
        action: 'evaluate_writing',
        text: text,
        language: langSelect.options[langSelect.selectedIndex].text,
        level: levelSelect.options[levelSelect.selectedIndex].text,
        promptText: currentPrompt.innerText.replace('Đề bài: ', ''),
        promptImage: customImageBase64
    };
    const data = await callBackendAPI(payload, "Giám khảo AI đang chấm điểm bài Viết của bạn...");
    if (data) renderWritingAssessment(data);
});

// ==========================================
// 7. MODULE: SPEAKING
// ==========================================
btnRecord.addEventListener('click', async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];
        
        startTimer();
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
        clearInterval(timerInterval);
        stopVisualizer();
    }
});

async function processAudioAndSend(blob) {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = async () => {
        const payload = {
            action: 'evaluate_speaking',
            audio: reader.result,
            mimeType: blob.type,
            language: langSelect.options[langSelect.selectedIndex].text,
            level: levelSelect.options[levelSelect.selectedIndex].text,
            promptText: currentPrompt.innerText.replace('Đề bài: ', ''),
            promptImage: customImageBase64 
        };
        const data = await callBackendAPI(payload, "Giám khảo AI đang phân tích âm thanh của bạn...");
        if (data) renderSpeakingAssessment(data);
    };
}

// ==========================================
// 8. RENDER KẾT QUẢ ĐÁNH GIÁ (GIỮ NGUYÊN)
// ==========================================
function renderSpeakingAssessment(data) {
    let html = `
        <div style="background: linear-gradient(135deg, #2ecc71, #27ae60); padding: 15px; border-radius: 8px; color: white; margin-bottom: 20px;">
            <h3 style="margin: 0 0 10px 0; color: white;"><i class="fas fa-award"></i> Trình độ ước tính: <span style="color: #ffeaa7;">${data.estimated_level}</span></h3>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                <div style="flex:1; background:rgba(255,255,255,0.2); padding: 10px; border-radius:8px; text-align:center;"><small>Phát âm</small><br><strong>${data.scores.pronunciation}/10</strong></div>
                <div style="flex:1; background:rgba(255,255,255,0.2); padding: 10px; border-radius:8px; text-align:center;"><small>Trôi chảy</small><br><strong>${data.scores.fluency}/10</strong></div>
                <div style="flex:1; background:rgba(255,255,255,0.2); padding: 10px; border-radius:8px; text-align:center;"><small>Từ vựng</small><br><strong>${data.scores.vocabulary}/10</strong></div>
                <div style="flex:1; background:rgba(255,255,255,0.2); padding: 10px; border-radius:8px; text-align:center;"><small>Ngữ pháp</small><br><strong>${data.scores.grammar}/10</strong></div>
            </div>
        </div>
        <h4><i class="fas fa-quote-left"></i> Bản Transcript:</h4>
        <p style="background: #f8f9fa; padding: 15px; border-radius: 6px; font-style: italic; margin-bottom: 20px;">${data.transcript}</p>
        <div style="display: flex; gap: 15px; margin-bottom: 20px; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 200px; border-left: 4px solid #27ae60; padding-left: 10px;">
                <h4 style="color:#27ae60; margin-bottom: 5px;"><i class="fas fa-check-circle"></i> Điểm mạnh</h4>
                <ul style="padding-left: 15px; font-size: 0.95em;">${data.analysis.strengths.map(s => `<li>${s}</li>`).join('')}</ul>
            </div>
            <div style="flex: 1; min-width: 200px; border-left: 4px solid #e74c3c; padding-left: 10px;">
                <h4 style="color:#e74c3c; margin-bottom: 5px;"><i class="fas fa-times-circle"></i> Cần cải thiện</h4>
                <ul style="padding-left: 15px; font-size: 0.95em;">${data.analysis.weaknesses.map(w => `<li>${w}</li>`).join('')}</ul>
            </div>
        </div>
        <h4 style="color:#d35400; border-bottom: 1px solid #ccc; padding-bottom: 5px;"><i class="fas fa-search"></i> Phân tích lỗi</h4>
        <ul style="padding-left: 0; list-style: none; margin-bottom: 20px;">
            ${data.errors.length > 0 ? data.errors.map(err => `<li style="margin-bottom: 10px; background: #fdf2e9; padding: 10px; border-radius: 6px;">
                <del style="color:red; font-weight: bold;">${err.original_phrase}</del> &rarr; <strong style="color:green;">${err.correction}</strong><br>
                <small style="color:#555;">${err.reason}</small>
            </li>`).join('') : '<li style="color:green; padding: 10px;">Tuyệt vời! Không phát hiện lỗi nghiêm trọng.</li>'}
        </ul>
        <h4 style="color:#8e44ad;"><i class="fas fa-route"></i> Lộ trình thăng cấp</h4>
        <ul style="padding-left: 20px; font-size: 0.95em; margin-bottom: 20px;">${data.how_to_improve.map(step => `<li>${step}</li>`).join('')}</ul>
        <h4 style="color:#2980b9;"><i class="fas fa-magic"></i> Câu trả lời mẫu</h4>
        <p style="background:#eafaf1; padding: 15px; border-left: 4px solid #2980b9; border-radius: 4px; margin-bottom: 20px;">${data.better_version}</p>
        <p><strong>Nhận xét chung:</strong> ${data.feedback}</p>
    `;
    assessmentBox.innerHTML = html;
    currentSessionData = { type: 'speaking', ...data };
    if (btnSave) btnSave.classList.remove('hidden');
}

function renderWritingAssessment(data) {
    let html = `
        <div style="background: linear-gradient(135deg, #8e44ad, #9b59b6); padding: 15px; border-radius: 8px; color: white; margin-bottom: 20px;">
            <h3 style="margin: 0 0 10px 0; color: white;"><i class="fas fa-award"></i> Trình độ ước tính: <span style="color: #ffeaa7;">${data.estimated_level}</span></h3>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                <div style="flex:1; background:rgba(255,255,255,0.2); padding: 10px; border-radius:8px; text-align:center;"><small>Task Achievement</small><br><strong>${data.scores.task_achievement}/10</strong></div>
                <div style="flex:1; background:rgba(255,255,255,0.2); padding: 10px; border-radius:8px; text-align:center;"><small>Coherence</small><br><strong>${data.scores.coherence}/10</strong></div>
                <div style="flex:1; background:rgba(255,255,255,0.2); padding: 10px; border-radius:8px; text-align:center;"><small>Vocabulary</small><br><strong>${data.scores.vocabulary}/10</strong></div>
                <div style="flex:1; background:rgba(255,255,255,0.2); padding: 10px; border-radius:8px; text-align:center;"><small>Grammar</small><br><strong>${data.scores.grammar}/10</strong></div>
            </div>
        </div>
        <div style="display: flex; gap: 15px; margin-bottom: 20px; flex-wrap: wrap;">
            <div style="flex: 1; border-left: 4px solid #27ae60; padding-left: 10px;">
                <h4 style="color:#27ae60; margin-bottom: 5px;"><i class="fas fa-check-circle"></i> Điểm mạnh</h4>
                <ul style="padding-left: 15px; font-size: 0.95em;">${data.analysis.strengths.map(s => `<li>${s}</li>`).join('')}</ul>
            </div>
            <div style="flex: 1; border-left: 4px solid #e74c3c; padding-left: 10px;">
                <h4 style="color:#e74c3c; margin-bottom: 5px;"><i class="fas fa-times-circle"></i> Cần khắc phục</h4>
                <ul style="padding-left: 15px; font-size: 0.95em;">${data.analysis.weaknesses.map(w => `<li>${w}</li>`).join('')}</ul>
            </div>
        </div>
        <h4 style="color:#d35400; border-bottom: 1px solid #ccc; padding-bottom: 5px;"><i class="fas fa-search"></i> Lỗi chi tiết (Writing)</h4>
        <ul style="padding-left: 0; list-style: none; margin-bottom: 20px;">
            ${data.errors.length > 0 ? data.errors.map(err => `<li style="margin-bottom: 10px; background: #fdf2e9; padding: 10px; border-radius: 6px;">
                <del style="color:red; font-weight: bold;">${err.original_phrase}</del> &rarr; <strong style="color:green;">${err.correction}</strong><br>
                <small style="color:#555;">${err.reason}</small>
            </li>`).join('') : '<li style="color:green; padding: 10px;">Tuyệt vời! Không phát hiện lỗi sai.</li>'}
        </ul>
        <h4 style="color:#8e44ad;"><i class="fas fa-route"></i> Hướng dẫn thăng hạng</h4>
        <ul style="padding-left: 20px; font-size: 0.95em; margin-bottom: 20px;">${data.how_to_improve.map(step => `<li>${step}</li>`).join('')}</ul>
        <h4 style="color:#2980b9;"><i class="fas fa-copy"></i> Bản nâng cấp (Giữ văn phong)</h4>
        <p style="background:#eafaf1; padding: 15px; border-left: 4px solid #2980b9; border-radius: 4px; margin-bottom: 20px;">${data.better_versions.upgraded}</p>
        <h4 style="color:#f39c12;"><i class="fas fa-crown"></i> Bản Chuyên gia</h4>
        <p style="background:#fdf2e9; padding: 15px; border-left: 4px solid #f39c12; border-radius: 4px; margin-bottom: 20px;">${data.better_versions.expert}</p>
        <h4 style="color:#2c3e50;"><i class="fas fa-link"></i> Nguồn tham khảo hữu ích</h4>
        <ul style="padding-left: 20px; margin-bottom: 20px;">
            ${data.reference_links.map(link => `<li><a href="${link.url}" target="_blank" style="color: #2980b9; text-decoration: none; font-weight: bold;">${link.title}</a></li>`).join('')}
        </ul>
    `;
    assessmentBox.innerHTML = html;
    currentSessionData = { type: 'writing', ...data };
    if (btnSave) btnSave.classList.remove('hidden');
}

// ==========================================
// 9. TIMER & VISUALIZER
// ==========================================
function startTimer() {
    let minutes = parseInt(document.getElementById('time-limit').value) || 0;
    timeRemaining = minutes * 60;
    updateTimerUI();
    if (timeRemaining > 0) {
        timerInterval = setInterval(() => {
            timeRemaining--;
            updateTimerUI();
            if (timeRemaining <= 0) {
                clearInterval(timerInterval);
                if (currentSkill === 'speaking') btnStop.click();
                if (currentSkill === 'writing') btnSubmitWriting.click();
            }
        }, 1000);
    }
}

function updateTimerUI() {
    let minutes = parseInt(document.getElementById('time-limit').value) || 0;
    if (minutes === 0) {
        countdownDisplay.textContent = "∞";
        return;
    }
    let m = Math.floor(timeRemaining / 60).toString().padStart(2, '0');
    let s = (timeRemaining % 60).toString().padStart(2, '0');
    countdownDisplay.textContent = `${m}:${s}`;
}

function startVisualizer(stream) {
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
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
}

// ==========================================
// 10. LỊCH SỬ BÀI LÀM
// ==========================================
if (btnSave) {
    btnSave.addEventListener('click', () => {
        if (!currentSessionData) return;
        let history = JSON.parse(localStorage.getItem('aiTestHistory')) || [];
        const prefix = currentSessionData.type === 'speaking' ? '[Nói]' : '[Viết]';
        const newItem = { 
            id: Date.now(), 
            date: new Date().toLocaleString('vi-VN'), 
            title: `${prefix} ${currentPrompt.innerText.substring(0, 30)}...`,
            data: currentSessionData 
        };
        history.push(newItem);
        localStorage.setItem('aiTestHistory', JSON.stringify(history));
        alert("Đã lưu bài!");
        btnSave.classList.add('hidden');
        loadHistory();
    });
}

function loadHistory() {
    const historyList = document.getElementById('history-list');
    let history = JSON.parse(localStorage.getItem('aiTestHistory')) || [];
    if (history.length === 0) {
        historyList.innerHTML = '<li class="history-item empty-history">Chưa có bài lưu nào.</li>';
        return;
    }
    historyList.innerHTML = '';
    history.reverse().forEach(item => {
        const li = document.createElement('li');
        li.className = 'history-item';
        li.innerHTML = `
            <div class="history-title">${item.title}<br><small style="color:#7f8c8d; font-weight:normal;">${item.date}</small></div>
            <i class="fas fa-ellipsis-v history-actions" onclick="toggleMenu(${item.id})"></i>
            <div class="action-menu" id="menu-${item.id}">
                <button onclick="deleteItem(${item.id})" style="color:red;"><i class="fas fa-trash"></i> Xóa</button>
            </div>
        `;
        historyList.appendChild(li);
    });
}

window.toggleMenu = (id) => {
    const menu = document.getElementById(`menu-${id}`);
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

window.deleteItem = (id) => {
    if(confirm("Bạn có chắc muốn xóa bài này?")) {
        let history = JSON.parse(localStorage.getItem('aiTestHistory')) || [];
        history = history.filter(item => item.id !== id);
        localStorage.setItem('aiTestHistory', JSON.stringify(history));
        loadHistory();
    }
}
