// ==========================================
// CẤU HÌNH HỆ THỐNG
// ==========================================
// DÁN WEB APP URL CỦA GAS VÀO ĐÂY (Giữ nguyên trong ngoặc kép)
const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxWpuLpICy8Y0cJIQ32JcBuPCjpPdEdDplCOy273XXz-abSr2NijCSVq5r3LpE6iTI2/exec"; 

// ==========================================
// KHAI BÁO CÁC PHẦN TỬ DOM
// ==========================================
const btnRecord = document.getElementById('btn-record');
const btnStop = document.getElementById('btn-stop');
const audioPlayback = document.getElementById('audio-playback');
const transcriptBox = document.getElementById('transcript-box');
const assessmentBox = document.getElementById('assessment-box');
const btnStartSession = document.getElementById('btn-start-session');
const currentPrompt = document.getElementById('current-prompt');

// Các Settings
const langSelect = document.getElementById('language-select');
const levelSelect = document.getElementById('level-select');
const topicSelect = document.getElementById('topic-select');

// Biến toàn cục xử lý Audio
let mediaRecorder;
let audioChunks = [];
let currentBlob = null;

// ==========================================
// TẠO CÂU HỎI (PROMPT) MẪU
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

btnStartSession.addEventListener('click', () => {
    const lang = langSelect.value;
    const topic = topicSelect.value;
    currentPrompt.innerHTML = `<strong>Đề bài:</strong> ${prompts[lang][topic] || "Hãy giới thiệu bản thân bạn."}`;
    document.getElementById('btn-save').classList.add('hidden');
    
    // Reset UI
    transcriptBox.innerHTML = '<span class="placeholder-text">Sẵn sàng ghi âm...</span>';
    assessmentBox.innerHTML = '<span class="placeholder-text">Đang chờ âm thanh...</span>';
    audioPlayback.classList.add('hidden');
});

// ==========================================
// XỬ LÝ GHI ÂM (MEDIA RECORDER)
// ==========================================
btnRecord.addEventListener('click', async () => {
    try {
        // Yêu cầu quyền Micro
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunks.push(event.data);
            }
        };

        mediaRecorder.onstop = () => {
            // Tạo Blob âm thanh
            currentBlob = new Blob(audioChunks, { type: 'audio/webm' }); 
            
            // Hiện Audio để nghe lại
            const audioUrl = URL.createObjectURL(currentBlob);
            audioPlayback.src = audioUrl;
            audioPlayback.classList.remove('hidden');

            // Xử lý gửi lên Server
            processAudioAndSend(currentBlob);
        };

        // Bắt đầu ghi âm
        mediaRecorder.start();
        
        // Đổi trạng thái UI
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
        // Tắt micro (giải phóng tài nguyên trình duyệt)
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
        
        // Đổi trạng thái UI
        btnRecord.disabled = false;
        btnRecord.innerHTML = '<i class="fas fa-microphone"></i> Ghi âm lại';
        btnStop.disabled = true;
    }
});

// ==========================================
// XỬ LÝ CHUYỂN ĐỔI BASE64 VÀ GỌI API
// ==========================================
function processAudioAndSend(blob) {
    transcriptBox.innerHTML = '<span class="placeholder-text" style="color:#f39c12;"><i class="fas fa-spinner fa-spin"></i> AI đang nghe và bóc băng...</span>';
    assessmentBox.innerHTML = '<span class="placeholder-text" style="color:#f39c12;"><i class="fas fa-spinner fa-spin"></i> Đang phân tích ngữ pháp, từ vựng...</span>';

    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = async () => {
        const base64data = reader.result; // Chứa cả header data:audio/...
        
        const payload = {
            audio: base64data,
            mimeType: blob.type,
            language: langSelect.options[langSelect.selectedIndex].text,
            level: levelSelect.options[levelSelect.selectedIndex].text
        };

        try {
            // Gọi lên GAS. Dùng text/plain để né preflight CORS
            const response = await fetch(GAS_WEB_APP_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8',
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (result.success) {
                renderAssessment(result.data);
            } else {
                throw new Error(result.error);
            }

        } catch (error) {
            console.error(error);
            transcriptBox.innerHTML = `<span style="color:red;">Lỗi kết nối: ${error.message}</span>`;
            assessmentBox.innerHTML = `<span style="color:red;">Vui lòng kiểm tra lại URL GAS hoặc API Key.</span>`;
        }
    };
}

// ==========================================
// HIỂN THỊ KẾT QUẢ TỪ AI VÀ KÍCH HOẠT NÚT LƯU
// ==========================================
function renderAssessment(data) {
    // 1. Hiển thị Transcript
    transcriptBox.innerHTML = `<p style="font-size: 1.1em; line-height: 1.5;">${data.transcript}</p>`;

    // 2. Build HTML cho phần Assessment
    let html = `
        <div style="display: flex; gap: 15px; margin-bottom: 20px;">
            <div style="flex:1; background:#e8f4f8; padding: 10px; border-radius:8px; text-align:center;">
                <strong>Phát âm</strong><br><span style="font-size:1.5em; color:#2980b9;">${data.scores.pronunciation}/10</span>
            </div>
            <div style="flex:1; background:#e8f4f8; padding: 10px; border-radius:8px; text-align:center;">
                <strong>Trôi chảy</strong><br><span style="font-size:1.5em; color:#2980b9;">${data.scores.fluency}/10</span>
            </div>
            <div style="flex:1; background:#e8f4f8; padding: 10px; border-radius:8px; text-align:center;">
                <strong>Từ vựng</strong><br><span style="font-size:1.5em; color:#2980b9;">${data.scores.vocabulary}/10</span>
            </div>
            <div style="flex:1; background:#e8f4f8; padding: 10px; border-radius:8px; text-align:center;">
                <strong>Ngữ pháp</strong><br><span style="font-size:1.5em; color:#2980b9;">${data.scores.grammar}/10</span>
            </div>
        </div>
        
        <h4 style="color:#d35400; margin-bottom:10px;"><i class="fas fa-exclamation-circle"></i> Lỗi cần khắc phục:</h4>
        <ul style="padding-left: 20px; margin-bottom: 20px;">
    `;

    if (data.errors && data.errors.length > 0) {
        data.errors.forEach(err => {
            html += `<li style="margin-bottom:8px;">
                <del style="color:red;">${err.original_phrase}</del> 
                &rarr; <strong style="color:green;">${err.correction}</strong> 
                <br><small style="color:#7f8c8d;">(${err.reason})</small>
            </li>`;
        });
    } else {
        html += `<li style="color:green;">Tuyệt vời! Không phát hiện lỗi ngữ pháp/từ vựng đáng kể.</li>`;
    }
    html += `</ul>`;

    html += `
        <h4 style="color:#27ae60; margin-bottom:10px;"><i class="fas fa-magic"></i> Câu trả lời gợi ý (Tự nhiên hơn):</h4>
        <p style="background:#eaafc; padding: 15px; border-left: 4px solid #27ae60; border-radius: 4px; font-style: italic;">
            ${data.better_version}
        </p>

        <h4 style="margin-top:20px;"><i class="fas fa-comment-dots"></i> Nhận xét từ Giám khảo AI:</h4>
        <p>${data.feedback}</p>
    `;

    assessmentBox.innerHTML = html;
    
    // --- FIX LOGIC LƯU BÀI TẠI ĐÂY ---
    // Lưu trữ data vào biến toàn cục đã khai báo ở phần lịch sử
    currentSessionData = data; 
    
    // Tìm và gỡ bỏ class 'hidden' để hiển thị nút Lưu bài
    const btnSave = document.getElementById('btn-save');
    if (btnSave) {
        btnSave.classList.remove('hidden');
    }
}
// --- LOGIC LƯU VÀ QUẢN LÝ LỊCH SỬ ---
let currentSessionData = null; // Biến lưu tạm dữ liệu bài test hiện tại

// Gọi hàm này bên trong renderAssessment(data) khi nhận kết quả từ API thành công
// currentSessionData = data; 
// document.getElementById('btn-save').classList.remove('hidden');

document.getElementById('btn-save').addEventListener('click', () => {
    if (!currentSessionData) return;
    let history = JSON.parse(localStorage.getItem('speakingHistory')) || [];
    
    const newItem = {
        id: Date.now(),
        date: new Date().toLocaleString('vi-VN'),
        data: currentSessionData
    };
    history.push(newItem);
    localStorage.setItem('speakingHistory', JSON.stringify(history));
    alert("Đã lưu bài!");
    document.getElementById('btn-save').classList.add('hidden');
    loadHistory();
});

function loadHistory() {
    const historyList = document.getElementById('history-list');
    let history = JSON.parse(localStorage.getItem('speakingHistory')) || [];
    
    if (history.length === 0) {
        historyList.innerHTML = '<li class="history-item empty-history">Chưa có bài lưu nào.</li>';
        return;
    }
    
    historyList.innerHTML = '';
    // Xếp bài mới nhất lên trên
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

// Ẩn/Hiện Menu 3 chấm
window.toggleMenu = (id) => {
    const menu = document.getElementById(`menu-${id}`);
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

// Chức năng Xóa
window.deleteItem = (id) => {
    if(confirm("Bạn có chắc muốn xóa?")) {
        let history = JSON.parse(localStorage.getItem('speakingHistory')) || [];
        history = history.filter(item => item.id !== id);
        localStorage.setItem('speakingHistory', JSON.stringify(history));
        loadHistory();
    }
}

// Chức năng Tải về (.txt)
window.downloadItem = (id) => {
    let history = JSON.parse(localStorage.getItem('speakingHistory')) || [];
    const item = history.find(i => i.id === id);
    if (!item) return;
    
    // Format nội dung tải về
    const content = `BÀI TEST NGÀY: ${item.date}\n\n`
                  + `TRANSCRIPT:\n${item.data.transcript}\n\n`
                  + `ĐIỂM SỐ:\nPhát âm: ${item.data.scores.pronunciation} | Trôi chảy: ${item.data.scores.fluency} | Từ vựng: ${item.data.scores.vocabulary} | Ngữ pháp: ${item.data.scores.grammar}\n\n`
                  + `NHẬN XÉT: ${item.data.feedback}`;
                  
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Speaking_Test_${item.id}.txt`;
    a.click();
}

// Chức năng Chia sẻ (Dùng Web Share API nếu đt hỗ trợ, hoặc Copy Clipboard)
window.shareItem = (id) => {
    let history = JSON.parse(localStorage.getItem('speakingHistory')) || [];
    const item = history.find(i => i.id === id);
    if (!item) return;
    
    const shareText = `Tôi vừa đạt điểm Speaking: Ngữ pháp ${item.data.scores.grammar}/10, Từ vựng ${item.data.scores.vocabulary}/10 trên AI Speaking Test!`;
    
    if (navigator.share) {
        navigator.share({ title: 'Kết quả Speaking', text: shareText })
            .catch(console.error);
    } else {
        navigator.clipboard.writeText(shareText);
        alert("Đã copy kết quả vào Clipboard!");
    }
}

// Khởi chạy load lịch sử khi mở web
document.addEventListener('DOMContentLoaded', loadHistory);
