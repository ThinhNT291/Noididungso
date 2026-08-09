// ==========================================
// 1. CẤU HÌNH HỆ THỐNG
// ==========================================
const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxWpuLpICy8Y0cJIQ32JcBuPCjpPdEdDplCOy273XXz-abSr2NijCSVq5r3LpE6iTI2/exec"; 

// ==========================================
// 2. KHAI BÁO CÁC PHẦN TỬ DOM (Gom hết lên đây)
// ==========================================
// - Nhóm giao diện chính
const btnRecord = document.getElementById('btn-record');
const btnStop = document.getElementById('btn-stop');
const audioPlayback = document.getElementById('audio-playback');
const transcriptBox = document.getElementById('transcript-box');
const assessmentBox = document.getElementById('assessment-box');
const btnStartSession = document.getElementById('btn-start-session');
const currentPrompt = document.getElementById('current-prompt');
const btnSave = document.getElementById('btn-save');

// - Nhóm Cài đặt (Hệ thống)
const langSelect = document.getElementById('language-select');
const levelSelect = document.getElementById('level-select');
const topicSelect = document.getElementById('topic-select');
const promptMode = document.getElementById('prompt-mode');
const sysPromptArea = document.getElementById('system-prompt-area');

// - Nhóm Cài đặt (Custom)
const customPromptArea = document.getElementById('custom-prompt-area');
const customPromptText = document.getElementById('custom-prompt-text');
const customPromptImage = document.getElementById('custom-prompt-image');
const customBankSelect = document.getElementById('custom-bank-select');
const btnSaveBank = document.getElementById('btn-save-bank');
const displayCustomImage = document.getElementById('display-custom-image');

// - Nhóm Timer & Visualizer
const countdownDisplay = document.getElementById('countdown-display');
const canvas = document.getElementById('audio-visualizer');
const canvasCtx = canvas.getContext('2d');

// ==========================================
// 3. BIẾN TOÀN CỤC
// ==========================================
let mediaRecorder;
let audioChunks = [];
let currentBlob = null;
let currentSessionData = null; // Lưu tạm dữ liệu bài test để Save
let customImageBase64 = null; // Lưu ảnh Base64
let timerInterval;
let timeRemaining = 0;
let audioCtx, analyser, animationId;

// ==========================================
// 4. DATA MẪU (PROMPTS)
// ==========================================
const prompts = {
    english: {
        daily: "Describe your typical morning routine.",
        work: "What are your career goals for the next 5 years?",
        travel: "Talk about a memorable trip you have taken."
    },
    chinese: {
        daily: "请描述一下你典型的早晨日常。(Mô tả buổi sáng của bạn)",
        work: "你在未来5年的职业目标是什么？(Mục tiêu 5 năm tới)",
        travel: "说一次让你难忘的旅行。(Một chuyến du lịch đáng nhớ)"
    },
    russian: {
        daily: "Опишите вашу обычную утреннюю рутину. (Mô tả buổi sáng của bạn)",
        work: "Каковы ваши карьерные цели на ближайшие 5 лет? (Mục tiêu 5 năm tới)",
        travel: "Расскажите о запоминающейся поездке. (Một chuyến du lịch đáng nhớ)"
    }
};

// Khởi chạy load lịch sử khi mở web
document.addEventListener('DOMContentLoaded', loadHistory);

// ==========================================
// 5. LOGIC THIẾT LẬP GIAO DIỆN & NGÂN HÀNG ĐỀ
// ==========================================
promptMode.addEventListener('change', (e) => {
    if (e.target.value === 'custom') {
        sysPromptArea.classList.add('hidden');
        customPromptArea.classList.remove('hidden');
        loadCustomBank();
    } else {
        sysPromptArea.classList.remove('hidden');
        customPromptArea.classList.add('hidden');
        customImageBase64 = null; // Xóa ảnh bộ nhớ tạm
    }
});

customPromptImage.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => { customImageBase64 = reader.result; };
        reader.readAsDataURL(file);
    } else {
        customImageBase64 = null;
    }
});

function loadCustomBank() {
    let bank = JSON.parse(localStorage.getItem('promptBank')) || [];
    customBankSelect.innerHTML = '<option value="">-- Chọn đề đã lưu --</option>';
    bank.forEach((p, index) => {
        let opt = document.createElement('option');
        opt.value = index;
        opt.text = p.text.substring(0, 30) + (p.text.length > 30 ? '...' : '');
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
    const index = e.target.value;
    if (index !== "") {
        let bank = JSON.parse(localStorage.getItem('promptBank')) || [];
        customPromptText.value = bank[index].text;
    }
});

btnStartSession.addEventListener('click', () => {
    // Ẩn nút lưu bài cũ
    if(btnSave) btnSave.classList.add('hidden');
    currentSessionData = null;

    // Lấy đề bài hiển thị
    if (promptMode.value === 'custom') {
        currentPrompt.innerHTML = `<strong>Đề tự chọn:</strong> ${customPromptText.value || "Không có nội dung"}`;
        if (customImageBase64) {
            displayCustomImage.src = customImageBase64;
            displayCustomImage.classList.remove('hidden');
        } else {
            displayCustomImage.classList.add('hidden');
        }
    } else {
        const lang = langSelect.value;
        const topic = topicSelect.value;
        currentPrompt.innerHTML = `<strong>Đề bài:</strong> ${prompts[lang][topic] || "Hãy giới thiệu bản thân bạn."}`;
        displayCustomImage.classList.add('hidden');
    }
    
    // Reset Timer UI & Các Box
    updateTimerUI(); // Đặt đồng hồ về thời gian chuẩn bị
    transcriptBox.innerHTML = '<span class="placeholder-text">Sẵn sàng ghi âm...</span>';
    assessmentBox.innerHTML = '<span class="placeholder-text">Đang chờ âm thanh...</span>';
    audioPlayback.classList.add('hidden');
});

// ==========================================
// 6. LOGIC GHI ÂM (MICROPHONE)
// ==========================================
btnRecord.addEventListener('click', async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];
        
        startTimer();
        startVisualizer(stream);

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) audioChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
            currentBlob = new Blob(audioChunks, { type: 'audio/webm' }); 
            const audioUrl = URL.createObjectURL(currentBlob);
            audioPlayback.src = audioUrl;
            audioPlayback.classList.remove('hidden');
            
            processAudioAndSend(currentBlob);
        };

        mediaRecorder.start();
        
        btnRecord.disabled = true;
        btnRecord.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Đang thu âm...';
        btnStop.disabled = false;
        
    } catch (err) {
        alert("Không thể truy cập Microphone: " + err.message);
    }
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

// ==========================================
// 7. GỌI API & RENDER KẾT QUẢ
// ==========================================
function processAudioAndSend(blob) {
    transcriptBox.innerHTML = '<span class="placeholder-text" style="color:#f39c12;"><i class="fas fa-spinner fa-spin"></i> AI đang nghe và bóc băng...</span>';
    assessmentBox.innerHTML = '<span class="placeholder-text" style="color:#f39c12;"><i class="fas fa-spinner fa-spin"></i> Đang phân tích ngữ pháp, từ vựng...</span>';

    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = async () => {
        const base64data = reader.result; 
        
        const payload = {
            audio: base64data,
            mimeType: blob.type,
            language: langSelect.options[langSelect.selectedIndex].text,
            level: levelSelect.options[levelSelect.selectedIndex].text,
            promptText: promptMode.value === 'custom' ? customPromptText.value : currentPrompt.innerText.replace('Đề bài: ', ''),
            promptImage: customImageBase64 
        };

        try {
            const response = await fetch(GAS_WEB_APP_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (result.success) renderAssessment(result.data);
            else throw new Error(result.error);

        } catch (error) {
            console.error(error);
            transcriptBox.innerHTML = `<span style="color:red;">Lỗi kết nối: ${error.message}</span>`;
            assessmentBox.innerHTML = `<span style="color:red;">Vui lòng kiểm tra lại URL GAS hoặc API Key.</span>`;
        }
    };
}

// ==========================================
// HIỂN THỊ KẾT QUẢ ĐÁNH GIÁ SƯ PHẠM ĐA CHIỀU
// ==========================================
function renderAssessment(data) {
    // 1. Hiển thị Transcript
    transcriptBox.innerHTML = `<p style="font-size: 1.1em; line-height: 1.6;">${data.transcript}</p>`;

    // 2. Build HTML cho phần Assessment
    let html = `
        <!-- Trình độ và Điểm số -->
        <div style="background: linear-gradient(135deg, #6dd5ed, #2193b0); padding: 15px; border-radius: 8px; color: white; margin-bottom: 20px;">
            <h3 style="margin: 0 0 10px 0; color: white;"><i class="fas fa-award"></i> Trình độ ước tính: <span style="color: #ffeaa7;">${data.estimated_level}</span></h3>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                <div style="flex:1; min-width: 80px; background:rgba(255,255,255,0.2); padding: 10px; border-radius:8px; text-align:center;">
                    <small>Phát âm</small><br><strong style="font-size:1.3em;">${data.scores.pronunciation}/10</strong>
                </div>
                <div style="flex:1; min-width: 80px; background:rgba(255,255,255,0.2); padding: 10px; border-radius:8px; text-align:center;">
                    <small>Trôi chảy</small><br><strong style="font-size:1.3em;">${data.scores.fluency}/10</strong>
                </div>
                <div style="flex:1; min-width: 80px; background:rgba(255,255,255,0.2); padding: 10px; border-radius:8px; text-align:center;">
                    <small>Từ vựng</small><br><strong style="font-size:1.3em;">${data.scores.vocabulary}/10</strong>
                </div>
                <div style="flex:1; min-width: 80px; background:rgba(255,255,255,0.2); padding: 10px; border-radius:8px; text-align:center;">
                    <small>Ngữ pháp</small><br><strong style="font-size:1.3em;">${data.scores.grammar}/10</strong>
                </div>
            </div>
        </div>

        <!-- Điểm mạnh & Điểm yếu -->
        <div style="display: flex; gap: 15px; margin-bottom: 20px; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 200px; border-left: 4px solid #27ae60; padding-left: 10px;">
                <h4 style="color:#27ae60; margin-bottom: 5px;"><i class="fas fa-check-circle"></i> Điểm mạnh</h4>
                <ul style="padding-left: 15px; font-size: 0.95em; color: #333;">
                    ${data.analysis.strengths.map(s => `<li>${s}</li>`).join('')}
                </ul>
            </div>
            <div style="flex: 1; min-width: 200px; border-left: 4px solid #e74c3c; padding-left: 10px;">
                <h4 style="color:#e74c3c; margin-bottom: 5px;"><i class="fas fa-times-circle"></i> Cần cải thiện</h4>
                <ul style="padding-left: 15px; font-size: 0.95em; color: #333;">
                    ${data.analysis.weaknesses.map(w => `<li>${w}</li>`).join('')}
                </ul>
            </div>
        </div>
        
        <!-- Bảng phân tích lỗi chi tiết -->
        <h4 style="color:#d35400; margin-bottom:10px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">
            <i class="fas fa-search"></i> Phân tích lỗi chi tiết
        </h4>
        <ul style="padding-left: 0; list-style: none; margin-bottom: 20px;">
    `;

    if (data.errors && data.errors.length > 0) {
        data.errors.forEach(err => {
            html += `<li style="margin-bottom: 15px; background: #fdf2e9; padding: 10px; border-radius: 6px;">
                <div><del style="color:red; font-weight: bold;">${err.original_phrase}</del> &rarr; <strong style="color:green;">${err.correction}</strong></div>
                <div style="font-size: 0.9em; color:#555; margin-top: 5px;"><i class="fas fa-info-circle text-muted"></i> ${err.reason}</div>
            </li>`;
        });
    } else {
        html += `<li style="color:green; padding: 10px;">Tuyệt vời! AI không phát hiện lỗi ngữ pháp/phát âm nghiêm trọng nào.</li>`;
    }
    html += `</ul>`;

    // Lộ trình nâng cấp & Bài mẫu
    html += `
        <h4 style="color:#8e44ad; margin-bottom:10px;"><i class="fas fa-route"></i> Lộ trình thăng cấp</h4>
        <ul style="padding-left: 20px; margin-bottom: 20px; font-size: 0.95em;">
            ${data.how_to_improve.map(step => `<li>${step}</li>`).join('')}
        </ul>

        <h4 style="color:#27ae60; margin-bottom:10px;"><i class="fas fa-magic"></i> Câu trả lời gợi ý (Tự nhiên hơn)</h4>
        <p style="background:#eafaf1; padding: 15px; border-left: 4px solid #27ae60; border-radius: 4px; font-style: italic; font-size: 1.05em; margin-bottom: 20px;">
            ${data.better_version}
        </p>

        <h4 style="margin-top:20px; color:#2c3e50;"><i class="fas fa-comment-dots"></i> Tổng kết Task Achievement</h4>
        <p style="font-size: 0.95em; color: #444;">${data.feedback}</p>
    `;

    assessmentBox.innerHTML = html;
    
    currentSessionData = data; 
    if (btnSave) btnSave.classList.remove('hidden');
}
// ==========================================
// 8. LOGIC LỊCH SỬ (HISTORY)
// ==========================================
if(btnSave) {
    btnSave.addEventListener('click', () => {
        if (!currentSessionData) return;
        let history = JSON.parse(localStorage.getItem('speakingHistory')) || [];
        const newItem = { id: Date.now(), date: new Date().toLocaleString('vi-VN'), data: currentSessionData };
        history.push(newItem);
        localStorage.setItem('speakingHistory', JSON.stringify(history));
        alert("Đã lưu bài!");
        btnSave.classList.add('hidden');
        loadHistory();
    });
}

function loadHistory() {
    const historyList = document.getElementById('history-list');
    let history = JSON.parse(localStorage.getItem('speakingHistory')) || [];
    
    if (history.length === 0) {
        historyList.innerHTML = '<li class="history-item empty-history">Chưa có bài lưu nào.</li>';
        return;
    }
    
    historyList.innerHTML = '';
    history.reverse().forEach(item => {
        const li = document.createElement('li');
        li.className = 'history-item';
        li.innerHTML = `
            <div class="history-title">Bài lưu: ${item.date}</div>
            <i class="fas fa-ellipsis-v history-actions" onclick="toggleMenu(${item.id})"></i>
            <div class="action-menu" id="menu-${item.id}">
                <button onclick="downloadItem(${item.id})"><i class="fas fa-download"></i> Tải Text</button>
                <button onclick="shareItem(${item.id})"><i class="fas fa-share"></i> Chia sẻ</button>
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
    if(confirm("Bạn có chắc muốn xóa?")) {
        let history = JSON.parse(localStorage.getItem('speakingHistory')) || [];
        history = history.filter(item => item.id !== id);
        localStorage.setItem('speakingHistory', JSON.stringify(history));
        loadHistory();
    }
}

window.downloadItem = (id) => {
    let history = JSON.parse(localStorage.getItem('speakingHistory')) || [];
    const item = history.find(i => i.id === id);
    if (!item) return;
    
    const content = `BÀI TEST NGÀY: ${item.date}\n\nTRANSCRIPT:\n${item.data.transcript}\n\nĐIỂM SỐ:\nPhát âm: ${item.data.scores.pronunciation} | Trôi chảy: ${item.data.scores.fluency} | Từ vựng: ${item.data.scores.vocabulary} | Ngữ pháp: ${item.data.scores.grammar}\n\nNHẬN XÉT: ${item.data.feedback}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Speaking_Test_${item.id}.txt`;
    a.click();
}

window.shareItem = (id) => {
    let history = JSON.parse(localStorage.getItem('speakingHistory')) || [];
    const item = history.find(i => i.id === id);
    if (!item) return;
    const shareText = `Tôi vừa đạt điểm Speaking: Ngữ pháp ${item.data.scores.grammar}/10, Từ vựng ${item.data.scores.vocabulary}/10 trên AI Speaking Test!`;
    if (navigator.share) navigator.share({ title: 'Kết quả Speaking', text: shareText }).catch(console.error);
    else { navigator.clipboard.writeText(shareText); alert("Đã copy vào Clipboard!"); }
}

// ==========================================
// 9. LOGIC HỖ TRỢ (TIMER & VISUALIZER)
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
                document.getElementById('btn-stop').click();
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
    
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();
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
