// ==========================================
// 1. CẤU HÌNH HỆ THỐNG
// ==========================================
const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxWpuLpICy8Y0cJIQ32JcBuPCjpPdEdDplCOy273XXz-abSr2NijCSVq5r3LpE6iTI2/exec"; 

// ==========================================
// 2. KHAI BÁO CÁC PHẦN TỬ DOM
// ==========================================
// - Nhóm Cài đặt (Hệ thống & Custom)
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

// - Nhóm Giao diện chung
const btnStartSession = document.getElementById('btn-start-session');
const currentPrompt = document.getElementById('current-prompt');
const displayCustomImage = document.getElementById('display-custom-image');
const countdownDisplay = document.getElementById('countdown-display');
const assessmentBox = document.getElementById('assessment-box');
const resultSection = document.getElementById('result-section');
const btnSave = document.getElementById('btn-save');
const speakingWorkspace = document.getElementById('speaking-workspace');
const writingWorkspace = document.getElementById('writing-workspace');

// - Nhóm Speaking
const btnRecord = document.getElementById('btn-record');
const btnStop = document.getElementById('btn-stop');
const audioPlayback = document.getElementById('audio-playback');
const canvas = document.getElementById('audio-visualizer');
const canvasCtx = canvas.getContext('2d');

// - Nhóm Writing
const writingInput = document.getElementById('writing-input');
const wordCountDisplay = document.getElementById('word-count');
const btnGetHints = document.getElementById('btn-get-hints');
const preWritingArea = document.getElementById('pre-writing-area');
const mindmapSvg = document.getElementById('mindmap-svg');
const writingStrategyText = document.getElementById('writing-strategy-text');
const btnSubmitWriting = document.getElementById('btn-submit-writing');
const btnShowHints = document.getElementById('btn-show-hints');
const btnShowMindmap = document.getElementById('btn-show-mindmap');
const hintsModal = document.getElementById('hints-modal');
const closeModal = document.getElementById('close-modal');
const hintsModalBody = document.getElementById('hints-modal-body');

// - Nhóm Toggle Sidebar
const toggleLeft = document.getElementById('toggle-left');
const toggleRight = document.getElementById('toggle-right');
const sidebarLeft = document.getElementById('sidebar-left');
const sidebarRight = document.getElementById('sidebar-right');

// ==========================================
// 3. BIẾN TOÀN CỤC
// ==========================================
let mediaRecorder;
let audioChunks = [];
let currentBlob = null;
let currentSessionData = null; 
let customImageBase64 = null; 
let timerInterval;
let timeRemaining = 0;
let audioCtx, analyser, animationId;

// ==========================================
// 4. LOGIC GIAO DIỆN CHUNG & CHUYỂN ĐỔI KỸ NĂNG
// ==========================================
// Thu phóng Sidebar
if (toggleLeft && sidebarLeft) toggleLeft.addEventListener('click', () => sidebarLeft.classList.toggle('collapsed'));
if (toggleRight && sidebarRight) toggleRight.addEventListener('click', () => sidebarRight.classList.toggle('collapsed'));

// Chuyển đổi giữa Speaking và Writing
skillSelect.addEventListener('change', (e) => {
    if (e.target.value === 'writing') {
        speakingWorkspace.classList.add('hidden');
        writingWorkspace.classList.remove('hidden');
    } else {
        speakingWorkspace.classList.remove('hidden');
        writingWorkspace.classList.add('hidden');
    }
});

// Load lịch sử khi mở web
document.addEventListener('DOMContentLoaded', loadHistory);

// ==========================================
// 5. LOGIC NGÂN HÀNG ĐỀ & BẮT ĐẦU BÀI THI
// ==========================================
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

// NÚT BẮT ĐẦU BÀI THI
btnStartSession.addEventListener('click', () => {
    if(btnSave) btnSave.classList.add('hidden');
    currentSessionData = null;
    cachedWritingHints = null;
    if (promptMode.value === 'custom') {
        currentPrompt.innerHTML = `<strong>Đề bài:</strong> ${customPromptText.value || "Không có nội dung"}`;
        if (customImageBase64) {
            displayCustomImage.src = customImageBase64;
            displayCustomImage.classList.remove('hidden');
        } else displayCustomImage.classList.add('hidden');
    } else {
        // Data giả lập đề hệ thống (có thể mở rộng sau)
        currentPrompt.innerHTML = `<strong>Đề bài:</strong> Hãy bàn về chủ đề ${topicSelect.options[topicSelect.selectedIndex].text}`;
        displayCustomImage.classList.add('hidden');
    }
    
    updateTimerUI(); 
    assessmentBox.innerHTML = '<span class="placeholder-text">Đang chờ dữ liệu...</span>';
    
    // Reset riêng cho Writing
    writingInput.value = '';
    writingInput.dispatchEvent(new Event('input')); // Kích hoạt đếm từ về 0
    preWritingArea.classList.add('hidden');
});

// ==========================================
// 6. MODULE: LÀM BÀI WRITING
// ==========================================
// Đếm từ Real-time
writingInput.addEventListener('input', () => {
    const text = writingInput.value.trim();
    const words = text.length === 0 ? 0 : text.split(/\s+/).length;
    wordCountDisplay.innerHTML = `<i class="fas fa-pen-nib"></i> Số từ: ${words}`;
    
    // Đổi màu cảnh báo nếu dưới 120 từ (chuẩn B1/B2 thường yêu cầu)
    if (words < 120) {
        wordCountDisplay.className = 'word-count-warning';
    } else {
        wordCountDisplay.className = 'word-count-good';
    }
});

// Vẽ Sơ đồ tư duy Mindmap (Dùng Markmap)
function drawMindmap(markdownText) {
    preWritingArea.classList.remove('hidden');
    mindmapSvg.innerHTML = ''; // Xóa bản cũ
    
    try {
        const { Transformer, Markmap } = window.markmap;
        const transformer = new Transformer();
        // Phân tích markdown thành dạng node cây
        const { root } = transformer.transform(markdownText);
        // Render ra file SVG
        Markmap.create(mindmapSvg, null, root);
    } catch (err) {
        console.error("Lỗi vẽ Mindmap:", err);
        writingStrategyText.innerHTML += `<br><span style="color:red;">Không thể render Mindmap.</span>`;
    }
}

// Biến lưu trữ tạm dữ liệu gợi ý để không gọi API 2 lần
let cachedWritingHints = null;

async function fetchWritingHints() {
    if (cachedWritingHints) return cachedWritingHints; // Nếu có rồi thì dùng luôn
    
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

// Xử lý nút: XEM GỢI Ý (POPUP)
btnShowHints.addEventListener('click', async () => {
    hintsModal.classList.remove('hidden');
    hintsModalBody.innerHTML = '<div style="text-align:center; padding: 30px; color:#f39c12;"><i class="fas fa-spinner fa-spin fa-2x"></i><br>AI đang phân tích chiến thuật...</div>';
    
    const data = await fetchWritingHints();
    if (!data) {
        hintsModalBody.innerHTML = '<span style="color:red;">Lỗi tải dữ liệu.</span>';
        return;
    }
    
    // Render format xịn sò vào Popup
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

// Xử lý nút: VẼ MINDMAP (INLINE)
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

// Đóng Popup
closeModal.addEventListener('click', () => hintsModal.classList.add('hidden'));
window.addEventListener('click', (e) => { if (e.target === hintsModal) hintsModal.classList.add('hidden'); });

// Reset Cache khi bắt đầu bài mới (Thêm dòng này vào trong sự kiện btnStartSession.addEventListener)
// cachedWritingHints = null;
        // Mẫu Markdown Mindmap trả về từ AI
        const mockMarkdown = `
# Bố cục Bài Viết
## Mở bài
- Giới thiệu chủ đề
- Đưa ra quan điểm cá nhân (Thesis statement)
## Thân bài 1 (Ưu điểm)
- Luận điểm chính 1
- Giải thích chi tiết
- Ví dụ thực tế
## Thân bài 2 (Nhược điểm)
- Luận điểm chính 2
- So sánh & Đối chiếu
## Kết bài
- Tóm tắt lại vấn đề
- Lời khuyên / Tương lai
        `;
        drawMindmap(mockMarkdown.trim());
    }, 1500);
});

// Bấm nút Nộp bài Writing
btnSubmitWriting.addEventListener('click', () => {
    const text = writingInput.value.trim();
    if (text.length < 10) return alert("Viết gì ít thế. Vui lòng viết thêm!");
    
    clearInterval(timerInterval); // Dừng thời gian thi
    
    const payload = {
        action: 'evaluate_writing',
        text: text,
        language: langSelect.options[langSelect.selectedIndex].text,
        level: levelSelect.options[levelSelect.selectedIndex].text,
        promptText: currentPrompt.innerText.replace('Đề bài: ', ''),
        promptImage: customImageBase64
    };

    assessmentBox.innerHTML = '<span class="placeholder-text" style="color:#f39c12;"><i class="fas fa-spinner fa-spin"></i> Chờ tí, mấy thầy cô đang chấm bài...</span>';
    
    // Gọi Backend thực sự tại đây (Sẽ hoàn thiện cùng GAS)
    // callBackendAPI(payload) 
});

// ==========================================
// 7. MODULE: LÀM BÀI SPEAKING (Giữ nguyên logic cũ)
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
            processAudioAndSend(currentBlob); // Hàm cũ xử lý gửi Audio
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

// Hàm cũ: Gửi Audio (Cần refactor lại ở bước sau để dùng chung callBackendAPI)
function processAudioAndSend(blob) {
    assessmentBox.innerHTML = '<span class="placeholder-text" style="color:#f39c12;"><i class="fas fa-spinner fa-spin"></i> Đang phân tích âm thanh...</span>';
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
        // await callBackendAPI(payload);
    };
}

// ==========================================
// 8. HỖ TRỢ: TIMER & VISUALIZER
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
                if (!speakingWorkspace.classList.contains('hidden')) btnStop.click();
                if (!writingWorkspace.classList.contains('hidden')) btnSubmitWriting.click();
            }
        }, 1000);
    }
}

function updateTimerUI() {
    let m = Math.floor(timeRemaining / 60).toString().padStart(2, '0');
    let s = (timeRemaining % 60).toString().padStart(2, '0');
    countdownDisplay.textContent = timeRemaining > 0 ? `${m}:${s}` : "00:00";
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
// 9. LỊCH SỬ (Giữ nguyên như cũ)
// ==========================================
function loadHistory() { /* Tạm ẩn để code gọn, giữ nguyên hàm cũ của ông */ }
