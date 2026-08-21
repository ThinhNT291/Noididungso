/**
 * =================================================================
 * BUNDLE TĨNH: LÝ THUYẾT NGỮ PHÁP (khu "Học") — sinh TỰ ĐỘNG từ Data_GrammarTopicBank.gs bằng
 * build_grammar_theory_bank_js.py, KHÔNG sửa tay file này (mọi thay đổi sẽ mất khi sinh lại).
 *
 * LÝ DO CÓ FILE NÀY (phản hồi người dùng "lý thuyết giống hệt mỗi lần mở, sao không cache offline cho
 * nhanh, chỉ bài tập cần request để bốc ngẫu nhiên"): trước đây MỌI lần mở 1 chuyên đề đều gọi mạng
 * action get_grammar_topic (Google Apps Script) trả về CẢ theory lẫn exercises trong 1 lần — theory
 * không hề đổi giữa các lần mở (chỉ đổi khi tôi sửa nội dung + deploy lại), nên phần chờ mạng cho theory
 * là lãng phí, GAS lại vốn có độ trễ không nhỏ. File này là 1 bản sao TĨNH của field "theory" (+
 * id/title/level/order/category để hiện tiêu đề/mục lục) của TOÀN BỘ chuyên đề, nạp cùng lúc với app.js
 * (KHÔNG qua mạng nữa) — Frontend đọc thẳng từ đây, hiện lý thuyết GẦN NHƯ TỨC THÌ khi bấm vào 1 chuyên
 * đề. Field "exercises" bị CỐ Ý bỏ khỏi bundle này — bài tập vẫn phải gọi mạng qua action MỚI
 * get_grammar_exercises (xem Controller_GrammarTopic.gs) để Server bốc ngẫu nhiên 10/30 câu mỗi lượt
 * (giữ nguyên cơ chế "chống học vẹt" đã có) — nếu gộp cả 30 câu/chuyên đề (kèm correctIndex) vào bundle
 * tĩnh này thì lộ hết đáp án qua DevTools/Network tab, mất tác dụng bốc ngẫu nhiên.
 *
 * QUAN TRỌNG — QUY TRÌNH DEPLOY: từ nay mỗi khi Data_GrammarTopicBank.gs đổi nội dung theory (thêm
 * chuyên đề mới / sửa lỗi audit / đổi cách dùng...), file này BẮT BUỘC phải chạy lại
 * build_grammar_theory_bank_js.py rồi upload lại lên Frontend tĩnh (GitHub Pages) CÙNG LÚC với app.js —
 * nếu quên, chuyên đề đó sẽ tự động rơi về đường dự phòng (gọi lại action get_grammar_topic đầy đủ như
 * cũ, xem startGrammarTopicSession() trong app.js) nên KHÔNG bị vỡ tính năng, chỉ mất tác dụng "nhanh
 * hơn" cho đúng chuyên đề bị thiếu/lệch dữ liệu.
 * =================================================================
 */
const GRAMMAR_THEORY_BANK = {
  "english": {
    "present-simple": {
      "id": "present-simple",
      "title": "Thì hiện tại đơn (Present Simple)",
      "level": "A1",
      "order": 1,
      "category": "tenses",
      "theory": {
        "usages": [
          {
            "label": "Thói quen, hành động lặp đi lặp lại",
            "explanationVi": "Dùng để diễn tả một thói quen, hành động xảy ra lặp đi lặp lại thường xuyên trong hiện tại, thường đi kèm các trạng từ chỉ tần suất như always, usually, often, every day...",
            "examples": [
              {
                "en": "My father drinks a cup of black coffee before work every morning.",
                "vi": "Bố tôi uống một tách cà phê đen trước khi đi làm mỗi sáng."
              },
              {
                "en": "The children brush their teeth twice a day.",
                "vi": "Bọn trẻ đánh răng hai lần một ngày."
              }
            ],
            "tagId": "ps-u1-habits-routines"
          },
          {
            "label": "Sự thật hiển nhiên, chân lý khoa học",
            "explanationVi": "Dùng để nêu các sự thật hiển nhiên, quy luật tự nhiên, chân lý khoa học hoặc điều luôn đúng, không phụ thuộc vào một thời điểm cụ thể nào.",
            "examples": [
              {
                "en": "Water boils at 100 degrees Celsius at sea level.",
                "vi": "Nước sôi ở 100 độ C tại mực nước biển."
              },
              {
                "en": "The Earth revolves around the Sun.",
                "vi": "Trái Đất quay quanh Mặt Trời."
              }
            ],
            "tagId": "ps-u2-facts-truths"
          },
          {
            "label": "Lịch trình, thời gian biểu cố định",
            "explanationVi": "Dùng cho các sự việc theo lịch trình, thời gian biểu cố định như giờ tàu xe, giờ chiếu phim, giờ học, dù hành động đó có thể diễn ra trong tương lai gần.",
            "examples": [
              {
                "en": "The express train to Hue departs at 9:15 every morning.",
                "vi": "Chuyến tàu tốc hành đi Huế khởi hành lúc 9 giờ 15 mỗi sáng."
              },
              {
                "en": "Our English class starts at 6 p.m. on Tuesdays and Fridays.",
                "vi": "Lớp tiếng Anh của chúng tôi bắt đầu lúc 6 giờ tối vào thứ Ba và thứ Sáu."
              }
            ],
            "tagId": "ps-u3-schedules-timetables"
          },
          {
            "label": "Động từ chỉ trạng thái (state verbs)",
            "explanationVi": "Các động từ chỉ trạng thái, cảm xúc, sở hữu, nhận thức, giác quan (like, want, know, believe, own, understand, need, love, hate...) thường KHÔNG chia ở dạng tiếp diễn (-ing) mà dùng thì hiện tại đơn để diễn tả tình trạng đang đúng ở hiện tại.",
            "examples": [
              {
                "en": "She knows the answer to almost every question in the quiz.",
                "vi": "Cô ấy biết câu trả lời cho gần như mọi câu hỏi trong bài trắc nghiệm."
              },
              {
                "en": "My grandparents own a small rice field near the river.",
                "vi": "Ông bà tôi sở hữu một thửa ruộng nhỏ gần bờ sông."
              }
            ],
            "tagId": "ps-u4-state-verbs"
          },
          {
            "label": "Chỉ dẫn, hướng dẫn từng bước",
            "explanationVi": "Dùng trong các câu hướng dẫn, chỉ đường, công thức nấu ăn hoặc quy trình từng bước, thường đi kèm các từ nối như first, then, next, after that.",
            "examples": [
              {
                "en": "First, you crack two eggs into the bowl, then you add a pinch of salt.",
                "vi": "Đầu tiên, bạn đập hai quả trứng vào bát, sau đó bạn thêm một chút muối."
              },
              {
                "en": "You walk straight for two blocks, and then you turn left at the pharmacy.",
                "vi": "Bạn đi thẳng qua hai dãy nhà, rồi rẽ trái ở chỗ hiệu thuốc."
              }
            ],
            "tagId": "ps-u5-instructions-directions"
          }
        ],
        "formulas": {
          "affirmative": "I/You/We/They + V (nguyên thể). Ví dụ: I work every day. | He/She/It + V-s/es. Ví dụ: He works every day.",
          "negative": "I/You/We/They + do not (don't) + V (nguyên thể). Ví dụ: They don't work on Sundays. | He/She/It + does not (doesn't) + V (nguyên thể). Ví dụ: She doesn't work on Sundays.",
          "question": "Do + I/you/we/they + V (nguyên thể) ...? Ví dụ: Do you work here? | Does + he/she/it + V (nguyên thể) ...? Ví dụ: Does she work here?"
        },
        "signalWords": [
          {
            "word": "always",
            "meaningVi": "luôn luôn"
          },
          {
            "word": "usually",
            "meaningVi": "thường thường"
          },
          {
            "word": "often",
            "meaningVi": "thường xuyên"
          },
          {
            "word": "sometimes",
            "meaningVi": "thỉnh thoảng"
          },
          {
            "word": "rarely",
            "meaningVi": "hiếm khi"
          },
          {
            "word": "never",
            "meaningVi": "không bao giờ"
          },
          {
            "word": "every day/week/month",
            "meaningVi": "mỗi ngày/tuần/tháng"
          },
          {
            "word": "once/twice a week",
            "meaningVi": "một/hai lần một tuần"
          }
        ],
        "commonMistakes": [
          "Lỗi quên thêm -s/-es vào động từ khi chủ ngữ là ngôi thứ ba số ít (he/she/it). Ví dụ sai: 'My sister work in a hospital.' ĐÚNG: 'My sister works in a hospital.'",
          "Lỗi chia động từ chỉ trạng thái (state verbs) ở dạng tiếp diễn (-ing) thay vì dùng hiện tại đơn. Ví dụ sai: 'I am wanting a cup of tea right now.' ĐÚNG: 'I want a cup of tea right now.'",
          "Lỗi đặt sai vị trí trạng từ chỉ tần suất: với động từ thường, trạng từ đứng TRƯỚC động từ chính, nhưng với động từ 'to be', trạng từ đứng SAU 'to be'. Ví dụ sai: 'She goes always to school by bike.' và 'She always is late.' ĐÚNG: 'She always goes to school by bike.' và 'She is always late.'",
          "Lỗi chia kép (double marking): khi câu phủ định hoặc nghi vấn đã có 'does', động từ chính phải giữ nguyên thể, không thêm -s nữa. Ví dụ sai: 'Does he plays football on Sundays?' ĐÚNG: 'Does he play football on Sundays?'"
        ]
      }
    },
    "present-continuous": {
      "id": "present-continuous",
      "title": "Thì hiện tại tiếp diễn (Present Continuous)",
      "level": "A1/A2",
      "order": 2,
      "category": "tenses",
      "theory": {
        "usages": [
          {
            "label": "Hành động đang xảy ra ngay lúc nói",
            "explanationVi": "Diễn tả một hành động đang diễn ra ngay tại thời điểm nói, thường có thể nhìn thấy hoặc nghe thấy được.",
            "examples": [
              {
                "en": "Please be quiet, the baby is sleeping in the next room.",
                "vi": "Làm ơn giữ yên lặng, em bé đang ngủ ở phòng bên cạnh."
              },
              {
                "en": "Look! Those two dogs are chasing each other around the yard.",
                "vi": "Nhìn kìa! Hai con chó đó đang đuổi nhau quanh sân."
              }
            ],
            "tagId": "pc-u1-happening-now"
          },
          {
            "label": "Tình huống tạm thời đang diễn ra quanh thời điểm hiện tại",
            "explanationVi": "Diễn tả một việc đang xảy ra trong một khoảng thời gian tạm thời quanh hiện tại (ví dụ: tuần này, tháng này, học kỳ này), nhưng không nhất thiết đúng vào lúc đang nói.",
            "examples": [
              {
                "en": "My sister is staying with us for a few weeks while her flat is being repaired.",
                "vi": "Em gái tôi đang ở tạm với chúng tôi vài tuần trong khi căn hộ của cô ấy đang được sửa."
              },
              {
                "en": "I'm taking an online course on data analysis this semester.",
                "vi": "Học kỳ này tôi đang học một khóa học trực tuyến về phân tích dữ liệu."
              }
            ],
            "tagId": "pc-u2-temporary-around-now"
          },
          {
            "label": "Kế hoạch, sắp xếp đã định trong tương lai gần",
            "explanationVi": "Diễn tả một kế hoạch hoặc sự sắp xếp đã được quyết định cụ thể cho tương lai gần, thường có thời gian hoặc địa điểm rõ ràng.",
            "examples": [
              {
                "en": "We are having dinner with the Nguyens on Saturday evening.",
                "vi": "Chúng tôi sẽ dùng bữa tối với gia đình Nguyễn vào tối thứ Bảy."
              },
              {
                "en": "The manager is flying to Da Nang next Monday for a client meeting.",
                "vi": "Vị quản lý sẽ bay đến Đà Nẵng vào thứ Hai tới để họp với khách hàng."
              }
            ],
            "tagId": "pc-u3-future-arrangement"
          },
          {
            "label": "Xu hướng thay đổi, phát triển dần theo thời gian",
            "explanationVi": "Diễn tả một xu hướng đang thay đổi hoặc phát triển dần dần, thường đi kèm các từ như 'increasingly', 'more and more', 'fewer and fewer'.",
            "examples": [
              {
                "en": "More and more young people are choosing to work remotely nowadays.",
                "vi": "Ngày càng nhiều người trẻ chọn làm việc từ xa trong thời gian gần đây."
              },
              {
                "en": "The price of fresh vegetables is rising steadily this year.",
                "vi": "Giá rau củ tươi đang tăng đều đặn trong năm nay."
              }
            ],
            "tagId": "pc-u4-changing-trend"
          },
          {
            "label": "Phàn nàn về thói quen lặp lại quá thường xuyên (luôn dùng với 'always')",
            "explanationVi": "Diễn tả sự phàn nàn hoặc khó chịu về một thói quen lặp đi lặp lại quá thường xuyên, luôn đi kèm trạng từ 'always' (đôi khi 'forever', 'constantly').",
            "examples": [
              {
                "en": "My roommate is always leaving dirty dishes in the sink!",
                "vi": "Bạn cùng phòng tôi lúc nào cũng để bát đĩa bẩn trong bồn rửa!"
              },
              {
                "en": "He is always interrupting me when I'm trying to explain something.",
                "vi": "Anh ấy lúc nào cũng ngắt lời tôi khi tôi đang cố giải thích điều gì đó."
              }
            ],
            "tagId": "pc-u5-annoying-habit"
          }
        ],
        "formulas": {
          "affirmative": "S + am/is/are + V-ing. Lưu ý cách thêm '-ing': động từ 1 âm tiết tận cùng bằng 1 phụ âm đứng sau 1 nguyên âm ngắn thì nhân đôi phụ âm cuối (run → running, sit → sitting, stop → stopping); động từ tận cùng bằng 'e' câm thì bỏ 'e' rồi thêm '-ing' (write → writing, make → making, take → taking); động từ tận cùng bằng '-ie' thì đổi thành 'y' rồi thêm '-ing' (lie → lying, die → dying).",
          "negative": "S + am/is/are + not + V-ing (thường viết tắt: isn't, aren't; riêng 'am not' không có dạng viết tắt chuẩn).",
          "question": "Am/Is/Are + S + V-ing? Trả lời ngắn: Yes, I am. / No, he isn't. / No, they aren't."
        },
        "signalWords": [
          {
            "word": "now",
            "meaningVi": "bây giờ"
          },
          {
            "word": "right now",
            "meaningVi": "ngay bây giờ"
          },
          {
            "word": "at the moment",
            "meaningVi": "vào lúc này"
          },
          {
            "word": "currently",
            "meaningVi": "hiện đang"
          },
          {
            "word": "at present",
            "meaningVi": "hiện nay"
          },
          {
            "word": "Look! / Listen!",
            "meaningVi": "Nhìn kìa! / Nghe kìa! (báo hiệu hành động đang xảy ra ngay lúc nói)"
          },
          {
            "word": "these days",
            "meaningVi": "dạo này"
          }
        ],
        "commonMistakes": [
          "Lỗi chia thì tiếp diễn cho các động từ chỉ trạng thái (state verbs) như like, want, know, believe, belong, understand — các động từ này thường KHÔNG dùng ở thì tiếp diễn vì diễn tả trạng thái tĩnh chứ không phải hành động đang xảy ra. Ví dụ sai: 'I am liking this song very much.' ĐÚNG: 'I like this song very much.'",
          "Lỗi quên trợ động từ am/is/are khi chia thể khẳng định hoặc nghi vấn. Ví dụ sai: 'She cooking dinner right now.' ĐÚNG: 'She is cooking dinner right now.'",
          "Lỗi thêm đuôi '-ing' sai chính tả: quên bỏ 'e' câm ở cuối động từ (write, make, take...) hoặc quên nhân đôi phụ âm cuối ở động từ 1 âm tiết kết thúc bằng 1 phụ âm sau 1 nguyên âm ngắn (run, sit, stop...). Ví dụ sai: 'He is writeing a report now.' / 'They are runing in the park.' ĐÚNG: 'He is writing a report now.' / 'They are running in the park.'",
          "Lỗi dùng thì hiện tại tiếp diễn cho thói quen hoặc sự thật chung chung (nên dùng hiện tại đơn) thay vì một hành động đang thực sự diễn ra. Ví dụ sai: 'The Earth is going around the Sun.' ĐÚNG: 'The Earth goes around the Sun.'"
        ]
      }
    },
    "past-simple": {
      "id": "past-simple",
      "title": "Thì quá khứ đơn (Past Simple)",
      "level": "A2",
      "order": 3,
      "category": "tenses",
      "theory": {
        "usages": [
          {
            "label": "Hành động đã kết thúc tại một thời điểm/khoảng thời gian xác định trong quá khứ",
            "explanationVi": "Dùng để diễn tả một hành động đã xảy ra và hoàn toàn kết thúc tại một thời điểm hoặc khoảng thời gian cụ thể trong quá khứ, thường đi kèm mốc thời gian rõ ràng như yesterday, last week, in 2019...",
            "examples": [
              {
                "en": "The plumber repaired the leaking pipe yesterday afternoon.",
                "vi": "Người thợ sửa ống nước đã sửa xong đường ống bị rò rỉ vào chiều hôm qua."
              },
              {
                "en": "Our company launched this product in 2019.",
                "vi": "Công ty chúng tôi đã ra mắt sản phẩm này vào năm 2019."
              }
            ],
            "tagId": "past-u1-finished-action"
          },
          {
            "label": "Chuỗi hành động liên tiếp xảy ra trong quá khứ (kể chuyện)",
            "explanationVi": "Dùng Quá khứ đơn để kể lại nhiều hành động xảy ra nối tiếp nhau theo trình tự thời gian trong một câu chuyện, hành động này kết thúc rồi hành động sau mới bắt đầu.",
            "examples": [
              {
                "en": "The old fisherman untied his boat, rowed out to the middle of the lake, and cast his net.",
                "vi": "Người ngư dân già cởi dây buộc thuyền, chèo ra giữa hồ, rồi thả lưới."
              },
              {
                "en": "She grabbed her umbrella, locked the front door, and hurried to catch the bus.",
                "vi": "Cô ấy cầm lấy chiếc ô, khóa cửa trước, rồi vội vã chạy đi bắt xe buýt."
              }
            ],
            "tagId": "past-u2-sequence-of-actions"
          },
          {
            "label": "Thói quen hoặc tình trạng kéo dài trong quá khứ nhưng nay đã chấm dứt",
            "explanationVi": "Diễn tả một thói quen lặp đi lặp lại hoặc một tình trạng kéo dài trong quá khứ, nhưng đến hiện tại không còn diễn ra nữa; thường xuất hiện cùng cụm 'when I was young/a child/a student'. Chỉ cần dùng Quá khứ đơn thông thường, không bắt buộc phải dùng 'used to'.",
            "examples": [
              {
                "en": "When I was a child, I played football with my neighbors every afternoon.",
                "vi": "Hồi còn nhỏ, chiều nào tôi cũng chơi bóng đá với đám bạn hàng xóm."
              },
              {
                "en": "My grandfather smoked two packs of cigarettes a day when he was young.",
                "vi": "Hồi trẻ, ông tôi hút hai gói thuốc lá mỗi ngày."
              }
            ],
            "tagId": "past-u3-habit-state"
          },
          {
            "label": "Động từ 'to be' (was/were) diễn tả trạng thái/tính chất trong quá khứ",
            "explanationVi": "Dùng 'was' với chủ ngữ số ít (I/he/she/it) và 'were' với chủ ngữ số nhiều (we/you/they) để miêu tả đặc điểm, cảm xúc, hoặc trạng thái của người/vật/sự việc tại một thời điểm đã qua.",
            "examples": [
              {
                "en": "The weather was extremely cold during our trip to Sapa.",
                "vi": "Thời tiết cực kỳ lạnh trong chuyến đi Sa Pa của chúng tôi."
              },
              {
                "en": "My classmates were very excited before the final exam results came out.",
                "vi": "Các bạn cùng lớp tôi rất hào hứng trước khi kết quả thi cuối kỳ được công bố."
              }
            ],
            "tagId": "past-u4-to-be-past"
          },
          {
            "label": "Bắt buộc dùng Quá khứ đơn (không dùng Hiện tại hoàn thành) khi câu có mốc thời gian quá khứ cụ thể",
            "explanationVi": "Khi trong câu xuất hiện một mốc thời gian xác định đã kết thúc trong quá khứ (yesterday, last year, in 2020, ... ago), ta PHẢI dùng Quá khứ đơn, tuyệt đối không dùng Hiện tại hoàn thành — dù hành động đó nghe có vẻ 'liên quan' đến hiện tại.",
            "examples": [
              {
                "en": "I met my current business partner two years ago.",
                "vi": "Tôi đã gặp đối tác kinh doanh hiện tại của mình cách đây hai năm."
              },
              {
                "en": "They moved to this apartment last March.",
                "vi": "Họ đã chuyển đến căn hộ này vào tháng Ba năm ngoái."
              }
            ],
            "tagId": "past-u5-definite-time-marker"
          }
        ],
        "formulas": {
          "affirmative": "S + V-ed (động từ có quy tắc) / S + V2 (động từ bất quy tắc — phải học thuộc theo bảng, không thêm '-ed') + O",
          "negative": "S + did not (didn't) + V (nguyên mẫu, KHÔNG chia lại) + O",
          "question": "Did + S + V (nguyên mẫu, KHÔNG chia lại) + O?"
        },
        "signalWords": [
          {
            "word": "yesterday",
            "meaningVi": "hôm qua"
          },
          {
            "word": "last night / last week / last month / last year",
            "meaningVi": "tối qua / tuần trước / tháng trước / năm ngoái"
          },
          {
            "word": "... ago",
            "meaningVi": "cách đây ... (three days ago, two years ago)"
          },
          {
            "word": "in + năm quá khứ",
            "meaningVi": "vào năm ... đã qua (in 2018, in 1990)"
          },
          {
            "word": "when I was young/a child/a student",
            "meaningVi": "hồi tôi còn trẻ/còn nhỏ/còn là học sinh"
          },
          {
            "word": "at that time / at that moment",
            "meaningVi": "vào thời điểm đó"
          },
          {
            "word": "in the past",
            "meaningVi": "trong quá khứ"
          },
          {
            "word": "the day before yesterday",
            "meaningVi": "hôm kia"
          }
        ],
        "commonMistakes": [
          "Dùng Quá khứ đơn thay vì Hiện tại hoàn thành khi câu có 'since/for': hành động bắt đầu trong quá khứ và còn tiếp diễn đến hiện tại phải dùng Hiện tại hoàn thành, không dùng Quá khứ đơn. SAI: I lived in this city since 2015. ĐÚNG: I have lived in this city since 2015.",
          "Chia lại động từ chính thành dạng '-ed' sau khi câu phủ định/nghi vấn đã có 'did': trợ động từ 'did' đã mang chức năng chỉ thì quá khứ, động từ chính phải giữ nguyên dạng nguyên mẫu, không chia thêm lần nữa. SAI: Did you went to school yesterday? ĐÚNG: Did you go to school yesterday?",
          "Chia sai động từ bất quy tắc theo công thức thêm '-ed': không phải mọi động từ đều thêm '-ed' ở Quá khứ đơn, cần học thuộc bảng động từ bất quy tắc (go→went, buy→bought...). SAI: She goed to the market by bike. ĐÚNG: She went to the market by bike.",
          "Chỉ thêm 'not' sau động từ mà quên trợ động từ 'did' trong câu phủ định: câu phủ định Quá khứ đơn bắt buộc phải có 'did not/didn't' đứng trước động từ nguyên mẫu. SAI: I not finished my homework last night. ĐÚNG: I didn't finish my homework last night."
        ]
      }
    },
    "past-continuous": {
      "id": "past-continuous",
      "title": "Thì quá khứ tiếp diễn (Past Continuous)",
      "level": "A2/B1",
      "order": 4,
      "category": "tenses",
      "theory": {
        "usages": [
          {
            "label": "Hành động đang diễn ra tại một thời điểm xác định trong quá khứ",
            "explanationVi": "Dùng để diễn tả một hành động đang xảy ra tại một thời điểm cụ thể trong quá khứ (ví dụ: at 8 p.m. last night, at this time yesterday). Ta không biết chính xác hành động bắt đầu và kết thúc khi nào, chỉ biết nó đang tiếp diễn tại đúng mốc thời gian được nhắc đến.",
            "examples": [
              {
                "en": "At 9 p.m. last night, I was doing my homework in my room.",
                "vi": "Vào lúc 9 giờ tối qua, tôi đang làm bài tập về nhà trong phòng."
              },
              {
                "en": "At this time yesterday, my parents were driving to Da Lat for a short trip.",
                "vi": "Vào giờ này hôm qua, bố mẹ tôi đang lái xe đến Đà Lạt cho một chuyến đi ngắn ngày."
              }
            ],
            "tagId": "pastcont-u1-action-in-progress-at-specific-time"
          },
          {
            "label": "Hành động đang diễn ra thì bị một hành động khác xen vào",
            "explanationVi": "Một hành động dài đang diễn ra trong quá khứ (chia ở thì quá khứ tiếp diễn) thì bất ngờ bị một hành động khác, ngắn hơn, xen vào và làm gián đoạn (chia ở thì quá khứ đơn). Hai hành động thường được nối với nhau bằng 'when'. Cấu trúc: S + was/were + V-ing + when + S + V (quá khứ đơn).",
            "examples": [
              {
                "en": "She was washing the dishes when the lights suddenly went out.",
                "vi": "Cô ấy đang rửa bát thì đèn bỗng nhiên tắt."
              },
              {
                "en": "I was crossing the street when a taxi honked loudly at me.",
                "vi": "Tôi đang băng qua đường thì một chiếc taxi bấm còi inh ỏi khiến tôi giật mình."
              }
            ],
            "tagId": "pastcont-u2-interrupted-action"
          },
          {
            "label": "Hai hành động song song trong quá khứ",
            "explanationVi": "Dùng để diễn tả hai hành động đang xảy ra cùng lúc, song song với nhau trong quá khứ. Cả hai vế đều chia ở thì quá khứ tiếp diễn và thường được nối với nhau bằng 'while'.",
            "examples": [
              {
                "en": "While my mother was cooking dinner, my father was watering the plants in the garden.",
                "vi": "Trong khi mẹ tôi đang nấu bữa tối thì bố tôi đang tưới cây trong vườn."
              },
              {
                "en": "While the children were playing in the yard, the dog was sleeping quietly under the table.",
                "vi": "Trong khi bọn trẻ đang chơi ở sân thì con chó đang ngủ yên lặng dưới gầm bàn."
              }
            ],
            "tagId": "pastcont-u3-parallel-actions"
          },
          {
            "label": "Miêu tả bối cảnh, khung cảnh trong một câu chuyện",
            "explanationVi": "Dùng để miêu tả bối cảnh, không khí, khung cảnh xung quanh tại một thời điểm trong quá khứ, thường xuất hiện ở đầu một câu chuyện hoặc đoạn văn kể chuyện để tạo phông nền trước khi hành động chính xảy ra.",
            "examples": [
              {
                "en": "It was a cold winter evening. The wind was blowing hard, and light snow was falling outside the window.",
                "vi": "Đó là một buổi tối mùa đông lạnh giá. Gió đang thổi mạnh, và tuyết nhẹ đang rơi bên ngoài cửa sổ."
              },
              {
                "en": "The market was full of noise. Vendors were shouting, and customers were bargaining over fresh vegetables.",
                "vi": "Khu chợ đầy ắp tiếng ồn. Những người bán hàng đang rao hàng, còn khách hàng đang mặc cả về rau củ tươi."
              }
            ],
            "tagId": "pastcont-u4-background-scene-setting"
          },
          {
            "label": "Diễn tả một tình huống đang thay đổi, diễn tiến dần",
            "explanationVi": "Dùng để diễn tả một xu hướng hoặc tình huống đang dần dần thay đổi, phát triển hay diễn tiến trong quá khứ, thường đi kèm các động từ như get, become, change, grow.",
            "examples": [
              {
                "en": "The weather was getting colder and colder as we climbed higher up the mountain.",
                "vi": "Thời tiết đang trở nên lạnh hơn khi chúng tôi leo lên cao hơn trên núi."
              },
              {
                "en": "Traditional folk music was becoming more popular among young people in the city at that time.",
                "vi": "Âm nhạc dân gian truyền thống đang trở nên phổ biến hơn với giới trẻ trong thành phố vào thời điểm đó."
              }
            ],
            "tagId": "pastcont-u5-changing-situation"
          }
        ],
        "formulas": {
          "affirmative": "I/He/She/It + was + V-ing. Ví dụ: I was studying at 8 p.m. yesterday. | You/We/They + were + V-ing. Ví dụ: They were studying at 8 p.m. yesterday.",
          "negative": "I/He/She/It + was not (wasn't) + V-ing. Ví dụ: He wasn't sleeping when I called him. | You/We/They + were not (weren't) + V-ing. Ví dụ: We weren't sleeping when you called us.",
          "question": "Was + I/he/she/it + V-ing ...? Ví dụ: Was she working at 10 a.m.? | Were + you/we/they + V-ing ...? Ví dụ: Were they working at 10 a.m.?"
        },
        "signalWords": [
          {
            "word": "at 8 o'clock last night",
            "meaningVi": "vào lúc 8 giờ tối qua"
          },
          {
            "word": "at this time yesterday",
            "meaningVi": "vào giờ này hôm qua"
          },
          {
            "word": "at that moment",
            "meaningVi": "vào khoảnh khắc đó"
          },
          {
            "word": "while",
            "meaningVi": "trong khi (nối hai hành động song song, cả hai đều ở quá khứ tiếp diễn)"
          },
          {
            "word": "when",
            "meaningVi": "khi (thường theo sau là hành động ngắn ở quá khứ đơn, xen vào hành động dài)"
          },
          {
            "word": "all day yesterday",
            "meaningVi": "suốt cả ngày hôm qua"
          },
          {
            "word": "the whole morning/evening",
            "meaningVi": "suốt cả buổi sáng/buổi tối"
          },
          {
            "word": "from 7 to 9 p.m. last night",
            "meaningVi": "từ 7 đến 9 giờ tối qua"
          }
        ],
        "commonMistakes": [
          "Lỗi dùng quá khứ đơn thay vì quá khứ tiếp diễn cho hành động đang diễn ra (hành động nền) khi bị một hành động khác xen vào. Ví dụ sai: 'I read a book when the doorbell rang.' ĐÚNG: 'I was reading a book when the doorbell rang.'",
          "Lỗi chia sai 'was/were' theo chủ ngữ: 'was' dùng cho I/He/She/It, 'were' dùng cho You/We/They. Ví dụ sai: 'They was watching TV at 9 p.m.' ĐÚNG: 'They were watching TV at 9 p.m.'",
          "Lỗi quên thêm đuôi -ing hoặc viết sai chính tả khi thêm -ing (gấp đôi phụ âm cuối, bỏ 'e' câm...). Ví dụ sai: 'She was siting at her desk and writeing a letter.' ĐÚNG: 'She was sitting at her desk and writing a letter.'",
          "Lỗi nhầm lẫn giữa 'when' và 'while': 'while' thường đi với hành động dài (quá khứ tiếp diễn), còn 'when' thường đứng trước hành động ngắn (quá khứ đơn) xen vào hành động dài. Ví dụ sai: 'While the phone rang, I was taking a shower.' ĐÚNG: 'While I was taking a shower, the phone rang.' (hoặc 'I was taking a shower when the phone rang.')",
          "Lỗi thiếu trợ động từ 'was/were' khi đặt câu hỏi, hoặc chia kép/thừa 'not' trong câu phủ định. Ví dụ sai: 'You working late last night?' (thiếu trợ động từ) và 'He wasn't studying not.' (thừa 'not'). ĐÚNG: 'Were you working late last night?' và 'He wasn't studying.'"
        ]
      }
    },
    "future-simple": {
      "id": "future-simple",
      "title": "Thì tương lai đơn (Future Simple - will)",
      "level": "A2",
      "order": 5,
      "category": "tenses",
      "theory": {
        "usages": [
          {
            "label": "Quyết định tức thời tại thời điểm nói",
            "explanationVi": "Dùng 'will' khi vừa nghĩ ra và quyết định làm gì ngay tại thời điểm nói, chưa hề lên kế hoạch từ trước. Đây là điểm khác với 'be going to' (dùng cho dự định đã có sẵn kế hoạch từ trước đó).",
            "examples": [
              {
                "en": "The phone is ringing - I will answer it.",
                "vi": "Điện thoại đang reo - để tôi nghe cho."
              },
              {
                "en": "I don't have any cash on me, so I'll pay by card.",
                "vi": "Tôi không mang tiền mặt, nên tôi sẽ trả bằng thẻ vậy."
              }
            ],
            "tagId": "fs-u1-spontaneous-decision"
          },
          {
            "label": "Dự đoán dựa trên suy nghĩ, quan điểm cá nhân",
            "explanationVi": "Dùng 'will' để đưa ra dự đoán về tương lai dựa trên suy nghĩ, niềm tin hoặc cảm nhận chủ quan của người nói, không dựa trên bằng chứng rõ ràng ở hiện tại. Thường đi kèm các động từ think/believe/suppose/expect hoặc probably/perhaps, I'm sure.",
            "examples": [
              {
                "en": "I think our team will win the match tonight.",
                "vi": "Tôi nghĩ đội của chúng ta sẽ thắng trận đấu tối nay."
              },
              {
                "en": "She will probably forget about the meeting again.",
                "vi": "Có lẽ cô ấy sẽ lại quên mất cuộc họp thôi."
              }
            ],
            "tagId": "fs-u2-prediction-belief"
          },
          {
            "label": "Lời hứa, đề nghị giúp đỡ, yêu cầu (Will you...?)",
            "explanationVi": "Dùng 'will' trong các câu hứa hẹn (promise), đề nghị giúp đỡ ai đó (offer), hoặc câu yêu cầu ai đó làm gì với cấu trúc 'Will you...?'.",
            "examples": [
              {
                "en": "I promise I will call you as soon as I land.",
                "vi": "Anh hứa sẽ gọi cho em ngay khi hạ cánh."
              },
              {
                "en": "Will you pass me the salt, please?",
                "vi": "Bạn làm ơn đưa giúp tôi lọ muối được không?"
              }
            ],
            "tagId": "fs-u3-promise-offer-request"
          },
          {
            "label": "Sự việc chắc chắn xảy ra trong tương lai theo lẽ tự nhiên",
            "explanationVi": "Dùng 'will' cho những sự việc gần như chắc chắn sẽ xảy ra trong tương lai theo quy luật tự nhiên hoặc điều hiển nhiên, không phụ thuộc vào ý muốn hay kế hoạch của con người. Điều này khác với hiện tại đơn dùng cho lịch trình, thời gian biểu đã được sắp xếp cố định từ trước.",
            "examples": [
              {
                "en": "Ice will melt if you leave it outside in this heat.",
                "vi": "Đá sẽ tan chảy nếu bạn để nó ngoài trời nắng nóng thế này."
              },
              {
                "en": "This old wooden bridge will collapse eventually if no one repairs it.",
                "vi": "Cây cầu gỗ cũ này sẽ sập trong tương lai nếu không ai sửa chữa nó."
              }
            ],
            "tagId": "fs-u4-facts-certainty"
          },
          {
            "label": "Không dùng will trong mệnh đề thời gian",
            "explanationVi": "Trong mệnh đề trạng ngữ chỉ thời gian bắt đầu bằng when/as soon as/before/after/until/by the time, KHÔNG dùng 'will' mà dùng thì hiện tại đơn, dù ý nghĩa của mệnh đề đó vẫn chỉ về tương lai. Mệnh đề chính (mang ý chính của câu) vẫn dùng 'will' bình thường.",
            "examples": [
              {
                "en": "I will text you as soon as the bus arrives at the station.",
                "vi": "Tôi sẽ nhắn tin cho bạn ngay khi xe buýt đến bến."
              },
              {
                "en": "We will not leave the house until the rain stops.",
                "vi": "Chúng tôi sẽ không rời khỏi nhà cho đến khi mưa tạnh."
              }
            ],
            "tagId": "fs-u5-time-clause-restriction"
          }
        ],
        "formulas": {
          "affirmative": "S + will + V (nguyên thể) - 'will' không chia theo chủ ngữ ở bất kỳ ngôi nào. Ví dụ: She will arrive tomorrow morning.",
          "negative": "S + will not (won't) + V (nguyên thể). Ví dụ: He won't finish the report today.",
          "question": "Will + S + V (nguyên thể) ...? Ví dụ: Will you join us for dinner tonight?"
        },
        "signalWords": [
          {
            "word": "tomorrow",
            "meaningVi": "ngày mai"
          },
          {
            "word": "next week/month/year",
            "meaningVi": "tuần/tháng/năm tới"
          },
          {
            "word": "soon",
            "meaningVi": "chẳng bao lâu nữa, sớm thôi"
          },
          {
            "word": "in the future",
            "meaningVi": "trong tương lai"
          },
          {
            "word": "someday/one day",
            "meaningVi": "một ngày nào đó"
          },
          {
            "word": "in + khoảng thời gian (in two days, in a few years)",
            "meaningVi": "trong vòng ... nữa (tính từ hiện tại)"
          },
          {
            "word": "I think/I'm sure/probably/perhaps",
            "meaningVi": "tôi nghĩ/tôi chắc chắn/có lẽ"
          }
        ],
        "commonMistakes": [
          "Lỗi dùng 'will' trong mệnh đề thời gian bắt đầu bằng when/as soon as/before/after/until/by the time - mệnh đề này phải chia ở thì hiện tại đơn dù mang nghĩa tương lai. Ví dụ sai: 'I will call you when I will arrive home.' ĐÚNG: 'I will call you when I arrive home.'",
          "Lỗi chia 'will' theo chủ ngữ (thêm -s như động từ thường) - 'will' là trợ động từ khiếm khuyết (modal verb), giữ nguyên ở mọi ngôi. Ví dụ sai: 'She wills help you tomorrow.' ĐÚNG: 'She will help you tomorrow.'",
          "Lỗi quên đảo 'will' lên trước chủ ngữ khi đặt câu hỏi. Ví dụ sai: 'You will come to the party tonight?' ĐÚNG: 'Will you come to the party tonight?'",
          "Lỗi viết thiếu dấu nháy đơn hoặc quên 'not' khi viết câu phủ định rút gọn của 'will not'. Ví dụ sai: 'I wont be late for the meeting.' ĐÚNG: 'I won't be late for the meeting.'",
          "Lỗi dùng 'will' khi tình huống thực ra là một dự định/kế hoạch đã được quyết định từ trước (nên dùng 'be going to'), chứ không phải quyết định tức thời. Ví dụ sai: 'I've already bought the train tickets - I will visit my hometown next week.' ĐÚNG: 'I've already bought the train tickets - I'm going to visit my hometown next week.'"
        ]
      }
    },
    "present-perfect": {
      "id": "present-perfect",
      "title": "Thì hiện tại hoàn thành (Present Perfect)",
      "level": "B1",
      "order": 7,
      "category": "tenses",
      "theory": {
        "usages": [
          {
            "label": "Hành động xảy ra trong quá khứ không rõ thời gian",
            "explanationVi": "Dùng để diễn tả một hành động đã xảy ra tại một thời điểm không xác định trong quá khứ, chúng ta không quan tâm 'khi nào' mà quan tâm 'đã làm'.",
            "examples": [
              {
                "en": "I have visited that ancient castle before.",
                "vi": "Tôi đã từng thăm tòa lâu đài cổ đó trước đây."
              },
              {
                "en": "They have finished their project.",
                "vi": "Họ đã hoàn thành dự án của họ rồi."
              }
            ],
            "tagId": "pp-u1-unspecified-past"
          },
          {
            "label": "Hành động bắt đầu trong quá khứ và còn tiếp diễn đến hiện tại",
            "explanationVi": "Dùng để diễn tả một hành động bắt đầu ở quá khứ và kéo dài đến tận bây giờ, thường đi với since (mốc thời gian) hoặc for (khoảng thời gian).",
            "examples": [
              {
                "en": "We have lived in this city for ten years.",
                "vi": "Chúng tôi đã sống ở thành phố này được mười năm rồi."
              },
              {
                "en": "She has worked at this school since 2015.",
                "vi": "Cô ấy đã làm việc tại ngôi trường này từ năm 2015."
              }
            ],
            "tagId": "pp-u2-since-for"
          },
          {
            "label": "Hành động lặp lại nhiều lần trong quá khứ",
            "explanationVi": "Dùng để diễn tả một việc đã được thực hiện nhiều lần từ quá khứ cho đến hiện tại.",
            "examples": [
              {
                "en": "I have seen this movie three times.",
                "vi": "Tôi đã xem bộ phim này ba lần rồi."
              },
              {
                "en": "He has called her several times today.",
                "vi": "Hôm nay anh ấy đã gọi cho cô ấy vài lần rồi."
              }
            ],
            "tagId": "pp-u3-repeated"
          },
          {
            "label": "Hành động vừa xảy ra để lại dấu hiệu hoặc kết quả ở hiện tại",
            "explanationVi": "Dùng để diễn tả một việc vừa kết thúc và kết quả của nó vẫn còn nhìn thấy được ở ngay lúc nói.",
            "examples": [
              {
                "en": "I have lost my key, so I cannot enter the house.",
                "vi": "Tôi đã làm mất chìa khóa, vì vậy tôi không thể vào nhà."
              },
              {
                "en": "She has just cleaned the room; it looks very tidy.",
                "vi": "Cô ấy vừa mới dọn phòng xong; nó trông rất gọn gàng."
              }
            ],
            "tagId": "pp-u4-result-now"
          },
          {
            "label": "Diễn tả kinh nghiệm hoặc trải nghiệm sống",
            "explanationVi": "Dùng để hỏi hoặc kể về những kinh nghiệm, trải nghiệm bản thân đã có hoặc chưa từng có từ trước đến nay.",
            "examples": [
              {
                "en": "Have you ever travelled to Japan?",
                "vi": "Bạn đã từng đi du lịch tới Nhật Bản chưa?"
              },
              {
                "en": "I have never tasted this kind of fruit.",
                "vi": "Tôi chưa bao giờ nếm thử loại trái cây này."
              }
            ],
            "tagId": "pp-u5-experience"
          }
        ],
        "formulas": {
          "affirmative": "S + have/has + V(p2) + O",
          "negative": "S + have/has + not + V(p2) + O",
          "question": "Have/Has + S + V(p2) + O?"
        },
        "signalWords": [
          {
            "word": "already",
            "meaningVi": "đã ... rồi (dùng trong câu khẳng định, đứng sau have/has và trước V-p2)"
          },
          {
            "word": "just",
            "meaningVi": "vừa mới (dùng trong câu khẳng định, đứng sau have/has)"
          },
          {
            "word": "yet",
            "meaningVi": "chưa (dùng trong câu phủ định/nghi vấn, đứng cuối câu)"
          },
          {
            "word": "ever",
            "meaningVi": "đã từng (dùng trong câu nghi vấn)"
          },
          {
            "word": "never",
            "meaningVi": "chưa bao giờ (dùng trong câu khẳng định mang nghĩa phủ định)"
          },
          {
            "word": "since",
            "meaningVi": "kể từ khi (cộng với mốc thời gian)"
          },
          {
            "word": "for",
            "meaningVi": "trong khoảng (cộng với khoảng thời gian)"
          },
          {
            "word": "recently / lately",
            "meaningVi": "gần đây"
          },
          {
            "word": "so far / up to now",
            "meaningVi": "cho đến bây giờ"
          }
        ],
        "commonMistakes": [
          "Nhầm lẫn giữa thì Hiện tại hoàn thành và Quá khứ đơn: Người Việt hay dùng thì này với mốc thời gian cụ thể trong quá khứ. SAI: I have visited Hanoi yesterday. ĐÚNG: I visited Hanoi yesterday.",
          "Dùng sai Since và For: 'For' đi với khoảng thời gian, 'Since' đi với mốc thời gian. SAI: I have worked here since 5 years. ĐÚNG: I have worked here for 5 years.",
          "Quên chia V-p2 hoặc quên 'have/has': Đây là lỗi cấu trúc cơ bản. SAI: She has finish her homework. ĐÚNG: She has finished her homework."
        ]
      }
    },
    "prepositions": {
      "id": "prepositions",
      "title": "Giới từ (Prepositions)",
      "level": "A2",
      "order": 9,
      "category": "word-classes",
      "theory": {
        "usages": [
          {
            "label": "Giới từ chỉ THỜI GIAN cơ bản (In / On / At)",
            "explanationVi": "Trong tiếng Anh, 'in' dùng cho các khoảng thời gian dài và chung chung như tháng, năm, mùa. 'On' dùng cho các ngày cụ thể như thứ trong tuần hoặc ngày tháng năm. 'At' dùng cho các mốc thời gian chính xác như giờ giấc hoặc một số dịp lễ hội.",
            "examples": [
              {
                "en": "The meeting is at 9:00 AM on Monday.",
                "vi": "Cuộc họp diễn ra vào lúc 9:00 sáng thứ Hai."
              },
              {
                "en": "We usually go on holiday in summer.",
                "vi": "Chúng tôi thường đi nghỉ mát vào mùa hè."
              }
            ],
            "tagId": "prep-u1-time"
          },
          {
            "label": "Giới từ chỉ NƠI CHỐN cơ bản (In / On / At)",
            "explanationVi": "'In' dùng để chỉ vị trí bên trong một không gian kín hoặc một khu vực địa lý lớn (phòng, thành phố, quốc gia). 'On' dùng để chỉ vị trí nằm trên một bề mặt (trên bàn, trên đường). 'At' dùng để chỉ một địa điểm cụ thể, một điểm dừng chân mang tính chức năng (tại trường, tại trạm xe).",
            "examples": [
              {
                "en": "The keys are on the table in the living room.",
                "vi": "Chùm chìa khóa ở trên bàn trong phòng khách."
              },
              {
                "en": "I will meet you at the bus stop.",
                "vi": "Tôi sẽ gặp bạn tại trạm xe buýt."
              }
            ],
            "tagId": "prep-u2-place"
          },
          {
            "label": "Giới từ chỉ CHUYỂN ĐỘNG / PHƯƠNG HƯỚNG",
            "explanationVi": "Nhóm giới từ này diễn tả hướng đi của một hành động. Các giới từ thông dụng nhất ở trình độ A2 gồm: 'to' (đi đến đâu đó), 'into' (đi vào bên trong), 'from' (từ đâu tới), 'through' (đi xuyên qua), 'across' (băng qua đường/sông), và 'along' (đi dọc theo con đường/bờ sông).",
            "examples": [
              {
                "en": "They walked across the street to get to the park.",
                "vi": "Họ đã đi bộ băng qua con đường để đến công viên."
              },
              {
                "en": "The train went through a very dark tunnel.",
                "vi": "Đoàn tàu đã đi xuyên qua một đường hầm rất tối."
              }
            ],
            "tagId": "prep-u3-movement"
          },
          {
            "label": "Giới từ đi kèm TÍNH TỪ thông dụng",
            "explanationVi": "Rất nhiều tính từ luôn đi kèm với một giới từ cố định mà người học bắt buộc phải ghi nhớ. Ở mức độ cơ bản, bạn cần nắm vững các cụm: interested in (quan tâm/thích thú), afraid of (sợ hãi), good/bad at (giỏi/tệ môn gì), married to (kết hôn với), proud of (tự hào về), và famous for (nổi tiếng vì điều gì).",
            "examples": [
              {
                "en": "My little brother is very good at playing chess.",
                "vi": "Em trai tôi rất giỏi chơi cờ vua."
              },
              {
                "en": "She is afraid of dogs, so she never goes near them.",
                "vi": "Cô ấy sợ chó, nên cô ấy không bao giờ lại gần chúng."
              }
            ],
            "tagId": "prep-u4-adjective-prep"
          },
          {
            "label": "Giới từ đi kèm ĐỘNG TỪ thông dụng",
            "explanationVi": "Tương tự tính từ, nhiều động từ cũng yêu cầu giới từ cụ thể để tạo thành cụm có nghĩa. Những cụm quen thuộc nhất gồm: listen to (lắng nghe), look at (nhìn vào), depend on (phụ thuộc vào), wait for (chờ đợi), arrive at (đến một địa điểm nhỏ như nhà ga, sân bay), arrive in (đến thành phố, quốc gia).",
            "examples": [
              {
                "en": "Please listen to the teacher carefully.",
                "vi": "Vui lòng chăm chú lắng nghe giáo viên."
              },
              {
                "en": "I am waiting for my friend outside the cinema.",
                "vi": "Tôi đang đợi bạn tôi ở bên ngoài rạp chiếu phim."
              }
            ],
            "tagId": "prep-u5-verb-prep"
          },
          {
            "label": "Since và For (mốc thời gian vs khoảng thời gian)",
            "explanationVi": "Since và for đều dùng để chỉ thời gian, thường đi kèm thì Hiện tại hoàn thành, nhưng khác nhau về ý nghĩa: 'since' + MỘT MỐC THỜI ĐIỂM cụ thể trong quá khứ (since 2020, since Monday, since I was young); 'for' + MỘT KHOẢNG THỜI GIAN kéo dài (for three years, for a long time, for two weeks).",
            "examples": [
              {
                "en": "I have lived in this city since 2015.",
                "vi": "Tôi đã sống ở thành phố này từ năm 2015."
              },
              {
                "en": "She has worked here for six months.",
                "vi": "Cô ấy đã làm việc ở đây được sáu tháng."
              }
            ],
            "tagId": "prep-since-for"
          }
        ],
        "formulas": null,
        "signalWords": [
          {
            "word": "in / on / at (Thời gian)",
            "meaningVi": "in + tháng/năm/mùa, on + thứ/ngày tháng, at + giờ cụ thể/dịp lễ"
          },
          {
            "word": "in / on / at (Nơi chốn)",
            "meaningVi": "in + bên trong/thành phố, on + trên bề mặt, at + địa điểm cụ thể (trường, siêu thị)"
          },
          {
            "word": "since vs for",
            "meaningVi": "since + mốc thời gian (từ năm 2020), for + khoảng thời gian (trong 3 năm)"
          },
          {
            "word": "to vs at",
            "meaningVi": "to chỉ sự di chuyển (đi đến...), at chỉ trạng thái đứng yên (đang ở tại...)"
          },
          {
            "word": "in vs into",
            "meaningVi": "in chỉ vị trí tĩnh (đang ở trong), into chỉ sự chuyển động (đang đi vào bên trong)"
          },
          {
            "word": "between vs among",
            "meaningVi": "between + giữa 2 người/vật, among + giữa từ 3 người/vật trở lên"
          }
        ],
        "commonMistakes": [
          "Nhầm lẫn các buổi trong ngày: Chúng ta nói 'in the morning', 'in the afternoon', 'in the evening' nhưng dùng 'at night' hoặc 'at noon' cho các mốc giờ cụ thể; 'in the night' thường chỉ xuất hiện trong một số cụm cố định (in the dead of night, woke up in the night) chứ không dùng thay thế 'at night' một cách tuỳ tiện.",
          "Dùng sai giới từ với từ 'married': Người Việt hay dịch word-by-word là 'married with' (kết hôn với), nhưng đúng ngữ pháp tiếng Anh chuẩn phải là 'married to'.",
          "Dùng giới từ chỉ hướng 'to' sau động từ 'arrive': Nhiều người học nói 'arrive to the airport', nhưng cách dùng đúng phải là 'arrive at the airport' (với địa điểm nhỏ) hoặc 'arrive in London' (với thành phố/quốc gia)."
        ]
      }
    },
    "passive-voice": {
      "id": "passive-voice",
      "title": "Câu bị động (Passive Voice)",
      "level": "B1",
      "order": 14,
      "category": "sentence-structure",
      "theory": {
        "usages": [
          {
            "label": "Cấu trúc bị động cơ bản (Các thì thông dụng)",
            "explanationVi": "Câu bị động được dùng khi ta muốn nhấn mạnh vào đối tượng chịu tác động của hành động thay vì người thực hiện. Để tạo câu bị động, ta biến đổi động từ to be theo đúng thì của câu chủ động, sau đó cộng với động từ chính ở dạng phân từ 2 (V3/ed).",
            "examples": [
              {
                "en": "The house is cleaned every day.",
                "vi": "Ngôi nhà được dọn dẹp mỗi ngày."
              },
              {
                "en": "A new bridge was built in this city last year.",
                "vi": "Một cây cầu mới đã được xây dựng ở thành phố này năm ngoái."
              }
            ],
            "tagId": "pv-u1-basic-tenses"
          },
          {
            "label": "Câu bị động với động từ khuyết thiếu (Modal verbs)",
            "explanationVi": "Đối với các động từ khuyết thiếu như can, could, must, should, may, might..., cấu trúc bị động rất đơn giản. Ta chỉ cần giữ nguyên động từ khuyết thiếu, thêm be ở dạng nguyên thể và sau đó là động từ chính ở cột 3 (V3/ed).",
            "examples": [
              {
                "en": "Tickets must be booked in advance.",
                "vi": "Vé phải được đặt trước."
              },
              {
                "en": "This math problem can be solved easily.",
                "vi": "Bài toán này có thể được giải quyết dễ dàng."
              }
            ],
            "tagId": "pv-u2-modal"
          },
          {
            "label": "Câu bị động với động từ có hai tân ngữ",
            "explanationVi": "Một số động từ như give, send, show, buy, teach... thường đi kèm hai tân ngữ (chỉ người và chỉ vật). Ta có thể viết được hai câu bị động khác nhau tuỳ thuộc vào việc đưa tân ngữ nào lên làm chủ ngữ. Việc đưa tân ngữ chỉ người lên làm chủ ngữ thường phổ biến và tự nhiên hơn.",
            "examples": [
              {
                "en": "I was given a beautiful gift by my friends.",
                "vi": "Tôi đã được bạn bè tặng cho một món quà tuyệt đẹp."
              },
              {
                "en": "A beautiful gift was given to me.",
                "vi": "Một món quà tuyệt đẹp đã được tặng cho tôi."
              }
            ],
            "tagId": "pv-u3-two-objects"
          },
          {
            "label": "Câu bị động với các động từ chỉ ý kiến/tường thuật",
            "explanationVi": "Khi dùng các động từ như say, think, believe, report, ta có hai cách đổi sang bị động. Cách thứ nhất dùng chủ ngữ giả (It is/was + V3 + that...). Cách thứ hai đưa chủ ngữ của mệnh đề sau lên đầu, áp dụng cấu trúc (S + is/was + V3 + to V) nếu hành động phụ xảy ra CÙNG LÚC hoặc SAU hành động tường thuật, hoặc (S + is/was + V3 + to HAVE + V3/ed) nếu hành động phụ xảy ra TRƯỚC hành động tường thuật.",
            "examples": [
              {
                "en": "It is believed that he is a millionaire.",
                "vi": "Người ta tin rằng anh ấy là một triệu phú."
              },
              {
                "en": "He is said to work very hard.",
                "vi": "Anh ấy được cho là làm việc rất chăm chỉ."
              },
              {
                "en": "The man is believed to have left the city years ago.",
                "vi": "Người đàn ông đó được cho là đã rời thành phố từ nhiều năm trước."
              }
            ],
            "tagId": "pv-u4-reporting"
          },
          {
            "label": "Câu bị động dạng nhờ vả (Causative Passive)",
            "explanationVi": "Khi bạn thuê hoặc nhờ ai đó làm việc gì cho mình, thay vì dùng dạng chủ động, người bản xứ rất hay dùng cấu trúc (have/get something done) - nghĩa là có cái gì đó được làm bởi người khác. Cấu trúc này nhấn mạnh vào việc công việc đã được hoàn tất.",
            "examples": [
              {
                "en": "She had her car repaired yesterday.",
                "vi": "Cô ấy đã nhờ người sửa xe ngày hôm qua."
              },
              {
                "en": "We will get our house painted next week.",
                "vi": "Chúng tôi sẽ thuê người sơn lại nhà vào tuần tới."
              }
            ],
            "tagId": "pv-u5-causative"
          }
        ],
        "formulas": {
          "affirmative": "S + be + V3/Ved",
          "negative": "S + be + not + V3/Ved",
          "question": "Be + S + V3/Ved?"
        },
        "signalWords": [
          {
            "word": "be said to V",
            "meaningVi": "được cho là, người ta nói rằng"
          },
          {
            "word": "be believed to V",
            "meaningVi": "được tin rằng"
          },
          {
            "word": "be expected to V",
            "meaningVi": "được kỳ vọng sẽ, được dự kiến"
          },
          {
            "word": "be reported to V",
            "meaningVi": "được báo cáo là, có tin cho rằng"
          },
          {
            "word": "have something done",
            "meaningVi": "thuê hoặc nhờ ai đó làm việc gì"
          },
          {
            "word": "get something done",
            "meaningVi": "thuê hoặc nhờ ai đó làm việc gì (dùng nhiều trong văn nói)"
          },
          {
            "word": "be supposed to V",
            "meaningVi": "được cho là phải làm gì, có bổn phận làm gì"
          }
        ],
        "commonMistakes": [
          "Quên biến đổi động từ 'to be' theo thì của câu gốc. Ví dụ: Viết sai 'The letter be sent yesterday' thay vì câu đúng 'The letter was sent yesterday'.",
          "Nhầm lẫn giữa phân từ 2 (V3) và quá khứ đơn (V2) đối với các động từ bất quy tắc. Ví dụ: Viết sai 'The window was broke' thay vì câu đúng 'The window was broken'.",
          "Lạm dụng 'by + tân ngữ' ngay cả khi không cần thiết. Nhiều người học hay viết 'The street is cleaned by people', trong khi chỉ cần nói 'The street is cleaned' là đã đủ tự nhiên và chính xác."
        ]
      }
    },
    "relative-clauses": {
      "id": "relative-clauses",
      "title": "Mệnh đề quan hệ (Relative Clauses)",
      "level": "B1",
      "order": 15,
      "category": "sentence-structure",
      "theory": {
        "usages": [
          {
            "label": "Đại từ quan hệ Who / Whom",
            "explanationVi": "Dùng để thay thế cho danh từ chỉ người đứng ngay trước nó. 'Who' có thể làm chủ ngữ hoặc tân ngữ trong mệnh đề quan hệ. 'Whom' mang tính trang trọng hơn và chỉ được phép dùng khi làm tân ngữ (đối tượng chịu tác động của hành động).",
            "examples": [
              {
                "en": "The boy who is playing the guitar is my brother.",
                "vi": "Cậu bé đang chơi guitar là em trai tôi."
              },
              {
                "en": "The manager whom I met yesterday was very friendly.",
                "vi": "Người quản lý mà tôi gặp hôm qua rất thân thiện."
              }
            ],
            "tagId": "rc-u1-who-whom"
          },
          {
            "label": "Đại từ quan hệ Which / That",
            "explanationVi": "Dùng để thay thế cho danh từ chỉ vật, sự việc hoặc con vật đứng trước nó. Cả hai đều có thể làm chủ ngữ hoặc tân ngữ. 'That' đặc biệt linh hoạt vì nó có thể thay thế cho cả who, whom và which, nhưng chỉ trong mệnh đề quan hệ xác định.",
            "examples": [
              {
                "en": "I have lost the watch which my mother gave me.",
                "vi": "Tôi đã làm mất chiếc đồng hồ mà mẹ tôi tặng."
              },
              {
                "en": "The movie that we watched last night was terrifying.",
                "vi": "Bộ phim mà chúng tôi xem tối qua thật đáng sợ."
              }
            ],
            "tagId": "rc-u2-which-that"
          },
          {
            "label": "Đại từ quan hệ Whose",
            "explanationVi": "Dùng để biểu đạt sự sở hữu, thay thế cho các tính từ sở hữu (my, his, her, their, its...). Nó có thể được dùng cho cả người và vật. Bắt buộc ngay sau 'whose' phải là một danh từ mà không có mạo từ (a/an/the) đi kèm.",
            "examples": [
              {
                "en": "Do you know the girl whose father is a famous doctor?",
                "vi": "Bạn có biết cô gái mà bố của cô ấy là một bác sĩ nổi tiếng không?"
              },
              {
                "en": "They live in a house whose roof is painted green.",
                "vi": "Họ sống trong một ngôi nhà mà mái của nó được sơn màu xanh lá."
              }
            ],
            "tagId": "rc-u3-whose"
          },
          {
            "label": "Trạng từ quan hệ Where / When / Why",
            "explanationVi": "Các trạng từ này thay thế cho một cụm giới từ chỉ nơi chốn, thời gian hoặc lý do. Cụ thể: 'Where' = in/at/on which (nơi mà); 'When' = in/on/at which (khi mà); 'Why' = for which (thường đứng ngay sau cụm 'the reason').",
            "examples": [
              {
                "en": "This is the library where I usually study.",
                "vi": "Đây là thư viện nơi tôi thường xuyên học bài."
              },
              {
                "en": "I will never forget the day when we first met.",
                "vi": "Tôi sẽ không bao giờ quên cái ngày mà lần đầu tiên chúng ta gặp nhau."
              }
            ],
            "tagId": "rc-u4-where-when-why"
          },
          {
            "label": "Mệnh đề quan hệ xác định và không xác định",
            "explanationVi": "Mệnh đề xác định cung cấp thông tin cốt lõi để nhận diện danh từ, không có dấu phẩy. Mệnh đề không xác định chỉ bổ sung thêm thông tin cho một danh từ đã quá rõ ràng (tên riêng, danh từ có từ chỉ định this/that/my/his...), luôn được ngăn cách bằng dấu phẩy. Lưu ý: Tuyệt đối KHÔNG dùng 'that' trong mệnh đề không xác định (sau dấu phẩy).",
            "examples": [
              {
                "en": "The students who pass the exam will be rewarded.",
                "vi": "Những học sinh vượt qua bài kiểm tra sẽ được thưởng. (Xác định, không có phẩy)"
              },
              {
                "en": "My uncle John, who lives in New York, is visiting us.",
                "vi": "Chú John của tôi, người sống ở New York, đang đến thăm chúng tôi. (Không xác định, có phẩy)"
              }
            ],
            "tagId": "rc-u5-defining-nondefining"
          },
          {
            "label": "Rút gọn mệnh đề quan hệ (Reduced Relative Clauses)",
            "explanationVi": "Mệnh đề quan hệ xác định có thể rút gọn để câu văn ngắn gọn hơn: (1) Nếu đại từ quan hệ làm CHỦ NGỮ và động từ ở dạng CHỦ ĐỘNG, rút gọn thành V-ing; (2) Nếu đại từ quan hệ làm CHỦ NGỮ và động từ ở dạng BỊ ĐỘNG, rút gọn thành V3/ed; (3) Nếu phía trước là tính từ so sánh nhất/số thứ tự (the first, the best...), rút gọn bằng to-V.",
            "examples": [
              {
                "en": "The man who is standing near the door is my uncle. -> The man standing near the door is my uncle.",
                "vi": "Mệnh đề chủ động rút gọn bằng V-ing: 'who is standing' rút gọn thành 'standing'."
              },
              {
                "en": "The books which are sold in this shop are very cheap. -> The books sold in this shop are very cheap.",
                "vi": "Mệnh đề bị động rút gọn bằng V3/ed: 'which are sold' rút gọn thành 'sold'."
              }
            ],
            "tagId": "rc-reduced-clauses"
          }
        ],
        "formulas": null,
        "signalWords": [
          {
            "word": "who",
            "meaningVi": "thay thế cho người, làm chủ ngữ hoặc tân ngữ"
          },
          {
            "word": "whom",
            "meaningVi": "thay thế cho người, chỉ làm tân ngữ (thường đi sau giới từ)"
          },
          {
            "word": "which",
            "meaningVi": "thay thế cho vật hoặc sự việc, làm chủ ngữ hoặc tân ngữ"
          },
          {
            "word": "that",
            "meaningVi": "thay thế cho who/whom/which trong mệnh đề xác định (không có dấu phẩy)"
          },
          {
            "word": "whose",
            "meaningVi": "thay thế cho tính từ sở hữu, luôn đứng ngay trước một danh từ"
          },
          {
            "word": "where",
            "meaningVi": "thay thế cho nơi chốn (= giới từ + which)"
          },
          {
            "word": "when",
            "meaningVi": "thay thế cho lý do (thường đi cùng 'the reason')"
          },
          {
            "word": "why",
            "meaningVi": "thay thế cho lý do (luôn đi cùng 'the reason')"
          }
        ],
        "commonMistakes": [
          "Sử dụng 'that' sau dấu phẩy. Đây là lỗi cực kỳ phổ biến. Mệnh đề có dấu phẩy (không xác định) bắt buộc phải dùng 'who/whom' cho người hoặc 'which' cho vật. Ví dụ sai: 'Hanoi, that is the capital of Vietnam...' (Phải dùng 'which').",
          "Giữ lại đại từ nhân xưng thừa trong mệnh đề quan hệ. Khi đại từ quan hệ đã làm chủ ngữ hoặc tân ngữ, ta không được để lại từ chỉ ngôi cũ nữa. Ví dụ sai: 'The man who he is reading a book is my dad.' (Chữ 'he' bị thừa, phải bỏ đi).",
          "Dùng 'what' để bổ nghĩa cho danh từ đứng trước nó thay vì dùng 'which/that'. 'What' mang nghĩa 'những gì' và bản thân nó là một mệnh đề danh ngữ, không phải đại từ quan hệ bổ nghĩa cho danh từ. Ví dụ sai: 'The car what I bought...' (Phải dùng 'which/that')."
        ]
      }
    },
    "reported-speech": {
      "id": "reported-speech",
      "title": "Câu tường thuật (Reported Speech)",
      "level": "B1",
      "order": 16,
      "category": "sentence-structure",
      "theory": {
        "usages": [
          {
            "label": "Câu tường thuật câu kể và quy tắc lùi thì (backshift)",
            "explanationVi": "Khi tường thuật lại một câu kể (statement) bằng động từ tường thuật ở quá khứ (said, told), động từ trong câu trực tiếp thường phải lùi một thì về quá khứ (backshift), có thể thêm liên từ 'that' (thường được lược bỏ trong văn nói). Quy tắc lùi thì cụ thể: hiện tại đơn -> quá khứ đơn; hiện tại tiếp diễn -> quá khứ tiếp diễn; hiện tại hoàn thành -> quá khứ hoàn thành; quá khứ đơn -> quá khứ hoàn thành; will -> would; can -> could; may -> might; must -> had to. Nếu động từ tường thuật ở thì hiện tại (says), động từ trong câu tường thuật không cần lùi thì.",
            "examples": [
              {
                "en": "Direct: \"I am tired,\" she said. -> Reported: She said (that) she was tired.",
                "vi": "Động từ 'am' (hiện tại đơn của to be) lùi thành 'was' (quá khứ đơn); đại từ 'I' đổi thành 'she' vì người tường thuật là người khác."
              },
              {
                "en": "Direct: \"I have finished my homework,\" he told me. -> Reported: He told me (that) he had finished his homework.",
                "vi": "Động từ 'have finished' (hiện tại hoàn thành) lùi thành 'had finished' (quá khứ hoàn thành); đại từ sở hữu 'my' đổi thành 'his' cho phù hợp với chủ thể mới."
              }
            ],
            "tagId": "rs-u1-statements-backshift"
          },
          {
            "label": "Câu tường thuật câu hỏi Yes/No",
            "explanationVi": "Khi tường thuật câu hỏi Yes/No (câu hỏi đảo trợ động từ lên đầu, không có từ để hỏi), ta dùng động từ tường thuật 'asked' rồi nối bằng 'if' hoặc 'whether', sau đó đưa trật tự từ về trật tự câu khẳng định (chủ ngữ đứng trước động từ), bỏ trợ động từ do/does/did, không dùng dấu chấm hỏi ở cuối câu, và vẫn áp dụng đầy đủ quy tắc lùi thì như câu kể.",
            "examples": [
              {
                "en": "Direct: \"Do you like coffee?\" she asked me. -> Reported: She asked me if I liked coffee.",
                "vi": "Trợ động từ 'Do' bị lược bỏ, trật tự đảo ngữ 'you like' được đưa về trật tự khẳng định 'I liked' (lùi thì hiện tại đơn -> quá khứ đơn), nối bằng 'if'."
              },
              {
                "en": "Direct: \"Have you finished the report?\" he asked. -> Reported: He asked whether I had finished the report.",
                "vi": "Trật tự 'Have you finished' đổi thành 'I had finished' (lùi thì hiện tại hoàn thành -> quá khứ hoàn thành), nối bằng 'whether' thay cho 'if'."
              }
            ],
            "tagId": "rs-u2-yes-no-questions"
          },
          {
            "label": "Câu tường thuật câu hỏi có từ để hỏi (Wh-questions)",
            "explanationVi": "Khi tường thuật câu hỏi có từ để hỏi (what, where, when, who, why, how...), ta giữ nguyên từ để hỏi đó và đặt nó ngay sau động từ tường thuật 'asked', sau đó đưa trật tự từ về trật tự câu khẳng định (chủ ngữ đứng trước động từ), không dùng trợ động từ do/does/did, không có dấu chấm hỏi, và vẫn áp dụng quy tắc lùi thì.",
            "examples": [
              {
                "en": "Direct: \"Where do you live?\" he asked her. -> Reported: He asked her where she lived.",
                "vi": "Từ để hỏi 'where' được giữ nguyên; trật tự đảo 'do you live' đổi thành trật tự khẳng định 'she lived' (lùi thì, đổi đại từ)."
              },
              {
                "en": "Direct: \"What time will the train arrive?\" she asked. -> Reported: She asked what time the train would arrive.",
                "vi": "Cụm từ để hỏi 'what time' giữ nguyên vị trí đầu mệnh đề tường thuật; 'will' lùi thành 'would', trật tự chuyển về khẳng định 'the train would arrive'."
              }
            ],
            "tagId": "rs-u3-wh-questions"
          },
          {
            "label": "Câu tường thuật câu mệnh lệnh, yêu cầu",
            "explanationVi": "Khi tường thuật câu mệnh lệnh hoặc lời yêu cầu, ta dùng cấu trúc: told/asked + tân ngữ (O) + (not) + to V (động từ nguyên thể có 'to'). Với câu mệnh lệnh khẳng định, chỉ cần thêm 'to' trước động từ nguyên thể; với câu mệnh lệnh phủ định (có 'don't'), từ 'not' phải đứng ngay trước 'to V'.",
            "examples": [
              {
                "en": "Direct: \"Close the door, please,\" she said to me. -> Reported: She told me to close the door.",
                "vi": "Câu mệnh lệnh khẳng định chuyển thành cấu trúc 'told + O + to V': 'told me to close the door'."
              },
              {
                "en": "Direct: \"Don't touch that wire!\" the teacher said to the students. -> Reported: The teacher told the students not to touch that wire.",
                "vi": "Câu mệnh lệnh phủ định (Don't + V) chuyển thành 'told + O + not + to V', từ 'not' đứng ngay trước 'to touch'."
              }
            ],
            "tagId": "rs-u4-commands-requests"
          },
          {
            "label": "Thay đổi trạng từ chỉ thời gian/nơi chốn và đại từ",
            "explanationVi": "Khi tường thuật, nếu thời điểm hoặc địa điểm nói đã thay đổi so với lúc phát ngôn gốc, các trạng từ chỉ thời gian/nơi chốn và đại từ nhân xưng/sở hữu phải được đổi cho phù hợp với ngữ cảnh của người tường thuật. Một số thay đổi phổ biến: this -> that, these -> those, here -> there, now -> then, today -> that day, tomorrow -> the next day/the following day, yesterday -> the day before/the previous day, next week -> the following week, ago -> before. Đại từ I/you cũng phải đổi thành he/she/they... tùy theo người được tường thuật lại.",
            "examples": [
              {
                "en": "Direct: \"I will meet you here tomorrow,\" he said. -> Reported: He said (that) he would meet me there the next day.",
                "vi": "'here' đổi thành 'there', 'tomorrow' đổi thành 'the next day', đại từ 'I'/'you' đổi thành 'he'/'me' theo đúng ngữ cảnh người tường thuật."
              },
              {
                "en": "Direct: \"I bought this laptop three days ago,\" she said. -> Reported: She said (that) she had bought that laptop three days before.",
                "vi": "'this' đổi thành 'that', 'ago' đổi thành 'before'; động từ 'bought' lùi thành 'had bought' theo quy tắc lùi thì."
              }
            ],
            "tagId": "rs-u5-time-place-pronoun-changes"
          }
        ],
        "formulas": null,
        "signalWords": [
          {
            "word": "said (that)",
            "meaningVi": "tường thuật câu kể, không bắt buộc có tân ngữ, có thể lược bỏ 'that'"
          },
          {
            "word": "told + O",
            "meaningVi": "tường thuật câu kể, bắt buộc phải có tân ngữ chỉ người nghe ngay sau 'told'"
          },
          {
            "word": "asked if/whether",
            "meaningVi": "tường thuật câu hỏi Yes/No, nối mệnh đề bằng 'if' hoặc 'whether'"
          },
          {
            "word": "asked + Wh-word",
            "meaningVi": "tường thuật câu hỏi có từ để hỏi, giữ nguyên từ để hỏi ngay sau 'asked'"
          },
          {
            "word": "told/asked + O + to V",
            "meaningVi": "tường thuật câu mệnh lệnh, yêu cầu ở thể khẳng định"
          },
          {
            "word": "told/asked + O + not to V",
            "meaningVi": "tường thuật câu mệnh lệnh, yêu cầu ở thể phủ định"
          },
          {
            "word": "advised/suggested/wanted",
            "meaningVi": "các động từ tường thuật khác, thường đi theo cấu trúc tương tự told/asked tùy ngữ cảnh"
          },
          {
            "word": "reminded + O + to V",
            "meaningVi": "nhắc nhở ai đó làm việc gì, cấu trúc giống 'told + O + to V'"
          }
        ],
        "commonMistakes": [
          "Quên lùi thì khi động từ tường thuật ở quá khứ. Ví dụ sai: 'She said she is happy.' ĐÚNG: 'She said she was happy.'",
          "Giữ nguyên trật tự đảo ngữ của câu hỏi trong câu tường thuật thay vì đổi về trật tự khẳng định. Ví dụ sai: 'He asked me where did I live.' ĐÚNG: 'He asked me where I lived.'",
          "Dùng 'that' sai trong câu hỏi tường thuật; câu hỏi Yes/No và Wh-question tường thuật không dùng 'that'. Ví dụ sai: 'She asked that if I was ready.' ĐÚNG: 'She asked if I was ready.'",
          "Quên đổi đại từ nhân xưng/sở hữu và từ chỉ thời gian, nơi chốn cho phù hợp với ngữ cảnh mới. Ví dụ sai: 'He said he would call me tomorrow.' (thuật lại một ngày sau đó) ĐÚNG: 'He said he would call me the next day.'",
          "Đặt sai vị trí 'not' trong câu mệnh lệnh phủ định tường thuật. Ví dụ sai: 'She told me to not open the window.' ĐÚNG: 'She told me not to open the window.'"
        ]
      }
    },
    "conditional-sentences": {
      "id": "conditional-sentences",
      "title": "Câu điều kiện (Conditional Sentences)",
      "level": "B1/B2",
      "order": 17,
      "category": "sentence-structure",
      "theory": {
        "usages": [
          {
            "label": "Câu điều kiện loại 0 (Zero Conditional)",
            "explanationVi": "Cấu trúc: If + S + V(hiện tại đơn), S + V(hiện tại đơn). Loại câu này được dùng để diễn tả những sự thật hiển nhiên, các chân lý hoặc quy luật tự nhiên luôn luôn đúng. Cả hai vế đều sử dụng thì hiện tại đơn.",
            "examples": [
              {
                "en": "If you heat ice, it melts.",
                "vi": "Nếu bạn đun nóng đá, nó sẽ tan chảy."
              },
              {
                "en": "Plants die if they don't get enough water.",
                "vi": "Cây cối sẽ chết nếu chúng không nhận đủ nước."
              }
            ],
            "tagId": "cond-u1-zero"
          },
          {
            "label": "Câu điều kiện loại 1 (First Conditional)",
            "explanationVi": "Cấu trúc: If + S + V(hiện tại đơn), S + will/can/may + V_inf. Dùng để nói về một sự việc hoặc tình huống có khả năng cao sẽ xảy ra trong TƯƠNG LAI nếu điều kiện được đáp ứng.",
            "examples": [
              {
                "en": "If it rains tomorrow, we will stay at home.",
                "vi": "Nếu ngày mai trời mưa, chúng tôi sẽ ở nhà."
              },
              {
                "en": "I will send you the report if I finish it early.",
                "vi": "Tôi sẽ gửi cho bạn báo cáo nếu tôi hoàn thành nó sớm."
              }
            ],
            "tagId": "cond-u2-first"
          },
          {
            "label": "Câu điều kiện loại 2 (Second Conditional)",
            "explanationVi": "Cấu trúc: If + S + V2/ed (động từ 'to be' dùng 'were' cho mọi ngôi), S + would/could/might + V_inf. Dùng để diễn tả một giả định không có thật hoặc khó có thể xảy ra ở hiện tại, thường mang tính tưởng tượng hoặc khuyên nhủ.",
            "examples": [
              {
                "en": "If I were you, I would tell her the truth.",
                "vi": "Nếu tôi là bạn, tôi sẽ nói cho cô ấy sự thật."
              },
              {
                "en": "If he had a lot of money, he could buy that sports car.",
                "vi": "Nếu anh ấy có nhiều tiền, anh ấy có thể mua chiếc xe thể thao đó."
              }
            ],
            "tagId": "cond-u3-second"
          },
          {
            "label": "Câu điều kiện loại 3 (Third Conditional)",
            "explanationVi": "Cấu trúc: If + S + had + V3/ed, S + would/could/might + have + V3/ed. Dùng để diễn tả một giả định trái ngược hoàn toàn với những gì đã thực sự xảy ra trong quá khứ, thường mang ý nghĩa nuối tiếc hoặc trách móc.",
            "examples": [
              {
                "en": "If she had studied harder, she would have passed the final exam.",
                "vi": "Nếu cô ấy học chăm chỉ hơn, cô ấy đã vượt qua bài thi cuối kỳ."
              },
              {
                "en": "We wouldn't have missed the flight if we had left the house earlier.",
                "vi": "Giá như chúng tôi rời nhà sớm hơn thì đã không lỡ chuyến bay."
              }
            ],
            "tagId": "cond-u4-third"
          },
          {
            "label": "Câu điều kiện hỗn hợp (Mixed Conditional)",
            "explanationVi": "Có hai kiểu phổ biến: (1) Loại 3 + Loại 2 (If + S + had + V3/ed, S + would + V_inf): giả định trái ngược trong QUÁ KHỨ nhưng kết quả ảnh hưởng đến HIỆN TẠI. (2) Loại 2 + Loại 3 (If + S + V2/ed, S + would have + V3/ed): một trạng thái/tính cách KHÔNG ĐỔI ở hiện tại (diễn tả bằng quá khứ đơn) là nguyên nhân dẫn đến một kết quả không xảy ra trong QUÁ KHỨ.",
            "examples": [
              {
                "en": "If I had eaten breakfast this morning, I wouldn't be so hungry now.",
                "vi": "Nếu sáng nay tôi ăn sáng thì bây giờ tôi đã không đói thế này."
              },
              {
                "en": "If he had taken the map, he wouldn't be lost right now.",
                "vi": "Nếu anh ấy cầm theo bản đồ thì bây giờ anh ấy đã không bị lạc."
              },
              {
                "en": "If she wasn't so afraid of flying, she would have traveled with us last summer.",
                "vi": "Vì tính cách 'sợ bay' của cô ấy không đổi theo thời gian (mệnh đề If dùng quá khứ đơn), nên cô ấy đã không đi du lịch cùng chúng tôi mùa hè trước (kết quả ở mệnh đề chính dùng would have + V3)."
              }
            ],
            "tagId": "cond-u5-mixed"
          },
          {
            "label": "Đảo ngữ trong câu điều kiện (Inversion)",
            "explanationVi": "Trong văn phong trang trọng (formal/written English), có thể bỏ 'If' và đảo trợ động từ lên đầu câu: Loại 1 trang trọng: Should + S + V(nguyên mẫu) [thay cho If + S + should + V]; Loại 2: Were + S (+ to V) [thay cho If + S + were]; Loại 3: Had + S + V3/ed [thay cho If + S + had + V3/ed]. Lưu ý: dạng đảo ngữ 'Was' KHÔNG bao giờ đúng (chỉ dùng 'Were'), khác với 'If I was' vốn được chấp nhận trong văn nói không trang trọng.",
            "examples": [
              {
                "en": "Should you have any questions, feel free to contact us.",
                "vi": "Nếu (lỡ) bạn có bất kỳ câu hỏi nào, đừng ngần ngại liên hệ với chúng tôi. (đảo ngữ loại 1, trang trọng)"
              },
              {
                "en": "Had I known about the traffic, I would have left earlier.",
                "vi": "Nếu tôi biết trước về tình trạng kẹt xe, tôi đã rời đi sớm hơn. (đảo ngữ loại 3)"
              }
            ],
            "tagId": "cond-inversion"
          }
        ],
        "formulas": null,
        "signalWords": [
          {
            "word": "unless",
            "meaningVi": "trừ khi (= if... not)"
          },
          {
            "word": "provided that / providing that",
            "meaningVi": "với điều kiện là, miễn là"
          },
          {
            "word": "as long as",
            "meaningVi": "miễn là"
          },
          {
            "word": "in case",
            "meaningVi": "phòng khi, trong trường hợp"
          },
          {
            "word": "suppose / supposing (that)",
            "meaningVi": "giả sử như"
          },
          {
            "word": "even if",
            "meaningVi": "ngay cả khi, cho dù"
          },
          {
            "word": "only if",
            "meaningVi": "chỉ khi"
          }
        ],
        "commonMistakes": [
          "Sử dụng thì tương lai (will/would) ngay bên trong mệnh đề 'If'. Ví dụ sai: 'If it will rain...'. Cần nhớ mệnh đề If luôn dùng thì hiện tại/quá khứ, thì tương lai/giả định chỉ dùng ở mệnh đề chính.",
          "Nhầm lẫn to be 'was' và 'were' trong câu điều kiện loại 2. Trong tiếng Anh chuẩn, đặc biệt ở ngữ cảnh trang trọng, ta phải dùng 'were' cho mọi chủ ngữ (If I were, If she were) thay vì 'was'.",
          "Quên trợ động từ 'have' trong mệnh đề chính của câu điều kiện loại 3. Ví dụ sai: 'would had done' hoặc 'would done', cách chia đúng luôn phải là 'would have + V3/ed'."
        ]
      }
    },
    "comparatives-superlatives": {
      "id": "comparatives-superlatives",
      "title": "So sánh (Comparatives & Superlatives)",
      "level": "A2",
      "order": 13,
      "category": "sentence-structure",
      "theory": {
        "usages": [
          {
            "label": "So sánh hơn với tính từ/trạng từ ngắn (adj/adv-er + than)",
            "explanationVi": "Với tính từ/trạng từ có 1 âm tiết (tall, fast, cheap, small...) và một số tính từ 2 âm tiết kết thúc bằng -y, -er, -ow, -le (happy, clever, narrow, simple...), ta thêm đuôi -er vào sau tính từ/trạng từ, rồi thêm than trước đối tượng được so sánh. Cấu trúc: S + V + adj/adv-er + than + N/Pronoun.\n\nQuy tắc chính tả cần nhớ:\n- Tính từ tận cùng bằng -e: chỉ thêm -r (nice → nicer, large → larger).\n- Tính từ 1 âm tiết tận cùng là 1 phụ âm đứng sau 1 nguyên âm: nhân đôi phụ âm cuối rồi thêm -er (big → bigger, hot → hotter, thin → thinner). Không nhân đôi nếu tận cùng là w, x, y (new → newer, low → lower).\n- Tính từ tận cùng bằng phụ âm + y: đổi y thành i rồi thêm -er (happy → happier, easy → easier, early → earlier). Nếu y đứng sau một nguyên âm thì giữ nguyên (gray → grayer).",
            "examples": [
              {
                "en": "This laptop is lighter than my old one.",
                "vi": "Chiếc laptop này nhẹ hơn chiếc cũ của tôi."
              },
              {
                "en": "She runs faster than her brother.",
                "vi": "Cô ấy chạy nhanh hơn anh trai mình."
              }
            ],
            "tagId": "comp-u1-short-adjectives"
          },
          {
            "label": "So sánh hơn với tính từ/trạng từ dài (more + adj/adv + than)",
            "explanationVi": "Với tính từ/trạng từ có từ 2 âm tiết trở lên và không thuộc nhóm ngoại lệ ở trên — ví dụ beautiful, expensive, comfortable, carefully, seriously — ta không thêm -er mà dùng more đứng trước tính từ/trạng từ ở dạng nguyên gốc, rồi thêm than. Cấu trúc: S + V + more + adj/adv + than + N/Pronoun.\n\nMột số tính từ 2 âm tiết (quiet, clever, narrow, common, polite...) có thể chấp nhận cả hai cách, nhưng từ 3 âm tiết trở lên thì bắt buộc dùng more, tuyệt đối không thêm -er. Có thể thêm far/much/a lot trước more để nhấn mạnh mức chênh lệch lớn: far more expensive. Lưu ý riêng cho trạng từ: trạng từ hình thành đều đặn bằng cách thêm đuôi -ly vào tính từ (regularly formed -ly adverbs, ví dụ clearly, effectively, carefully) LUÔN dùng more/most, không bao giờ thêm -er/-est, kể cả khi tính từ gốc là từ ngắn (ví dụ tính từ 'slow' dùng được 'slower', nhưng trạng từ 'slowly' phải là 'more slowly', không phải 'slowlier').",
            "examples": [
              {
                "en": "Working from home is more convenient than commuting every day.",
                "vi": "Làm việc tại nhà tiện lợi hơn việc phải đi lại mỗi ngày."
              },
              {
                "en": "He explained the plan more carefully than I expected.",
                "vi": "Anh ấy giải thích kế hoạch cẩn thận hơn tôi tưởng."
              }
            ],
            "tagId": "comp-u2-long-adjectives"
          },
          {
            "label": "So sánh nhất (the + adj/adv-est / the most + adj/adv)",
            "explanationVi": "So sánh nhất dùng để so sánh một người/vật với tất cả những người/vật còn lại trong một nhóm hoặc phạm vi nhất định, và luôn có the đứng trước.\n\n- Tính từ/trạng từ ngắn: the + adj/adv-est, áp dụng cùng quy tắc chính tả như -er (nhân đôi phụ âm, đổi y thành i, chỉ thêm -st nếu đã tận cùng bằng -e). Ví dụ: the tallest, the biggest, the happiest.\n- Tính từ/trạng từ dài: the most + adj/adv. Ví dụ: the most expensive, the most carefully.\n\nSau so sánh nhất thường có in + danh từ số ít chỉ địa điểm/phạm vi, hoặc of + danh từ số nhiều/nhóm người. Có thể thêm by far trước the để nhấn mạnh mức độ vượt trội tuyệt đối (by far the best). Lưu ý: nếu chỉ so sánh ĐÚNG hai đối tượng, phải dùng so sánh hơn (comparative), không dùng so sánh nhất — ví dụ 'Of the two routes, the coastal road is flatter' (không phải 'the flattest'), vì so sánh nhất chỉ dùng khi so sánh từ ba đối tượng trở lên.",
            "examples": [
              {
                "en": "Mount Everest is the highest mountain in the world.",
                "vi": "Đỉnh Everest là ngọn núi cao nhất thế giới."
              },
              {
                "en": "Of the three candidates, she answered the questions the most confidently.",
                "vi": "Trong ba ứng viên, cô ấy trả lời câu hỏi tự tin nhất."
              }
            ],
            "tagId": "comp-u3-superlatives"
          },
          {
            "label": "So sánh bằng (as...as) và dạng phủ định (not as/so...as)",
            "explanationVi": "So sánh bằng dùng để nói hai đối tượng ở cùng một mức độ: as + adj/adv (giữ nguyên dạng, không chia -er/-est) + as. Cấu trúc: S + V + as + adj/adv + as + N/Pronoun/Clause.\n\nỞ dạng phủ định, dùng not as...as hoặc not so...as (hai cách tương đương về nghĩa, trong đó not as...as phổ biến hơn trong văn phong hiện đại) để nói một đối tượng không đạt mức độ như đối tượng kia — về nghĩa gần tương đương với 'kém hơn'.\n\nCó thể thêm just/nearly/almost/twice/three times trước as...as để bổ sung sắc thái: just as...as (y hệt), nearly/almost as...as (gần bằng), twice as...as (gấp đôi).",
            "examples": [
              {
                "en": "This exam is as difficult as the last one.",
                "vi": "Bài thi này khó ngang với bài lần trước."
              },
              {
                "en": "My brother doesn't drive as carefully as my father.",
                "vi": "Em trai tôi lái xe không cẩn thận bằng bố tôi."
              }
            ],
            "tagId": "comp-u4-equality"
          },
          {
            "label": "So sánh bất quy tắc và so sánh kép tăng tiến",
            "explanationVi": "Một số tính từ/trạng từ có dạng so sánh hơn và so sánh nhất bất quy tắc, không theo hai quy tắc -er/more ở trên, cần học thuộc:\n- good/well → better → the best\n- bad/badly → worse → the worst\n- far → further/farther → the furthest/farthest (further thường dùng cho nghĩa trừu tượng như 'thêm nữa', farther thiên về khoảng cách vật lý; cả hai đều dùng được trong tiếng Anh-Mỹ)\n- little (không đếm được) → less → the least\n- many/much → more → the most\n\nSo sánh kép tăng tiến diễn tả một sự thay đổi diễn ra liên tục theo thời gian, gồm hai dạng:\n- Lặp lại tính từ/trạng từ so sánh hơn, nối bằng and: taller and taller (ngày càng cao), more and more expensive (ngày càng đắt).\n- Cấu trúc song song 'the + so sánh hơn..., the + so sánh hơn...' diễn tả quan hệ tỉ lệ thuận giữa hai vế: The more you practice, the better you get (Càng luyện tập nhiều càng tiến bộ). Lưu ý: 'good' là TÍNH TỪ (bổ nghĩa danh từ, đi sau is/looks/seems...), còn 'well' là TRẠNG TỪ tương ứng (bổ nghĩa động từ, ví dụ play well, sing well) — dạng so sánh của cả hai đều là better/best, nhưng phải chọn đúng từ loại theo vai trò trong câu: 'She is a good singer' (tính từ, bổ nghĩa danh từ 'singer') nhưng 'She sings well' (trạng từ, bổ nghĩa động từ 'sings').",
            "examples": [
              {
                "en": "The weather here gets colder and colder every winter.",
                "vi": "Thời tiết ở đây ngày càng lạnh hơn mỗi mùa đông."
              },
              {
                "en": "The more information you give us, the faster we can help you.",
                "vi": "Bạn cung cấp càng nhiều thông tin, chúng tôi càng giúp bạn nhanh hơn."
              }
            ],
            "tagId": "comp-u5-irregular-double"
          }
        ],
        "formulas": null,
        "signalWords": [
          {
            "word": "than",
            "meaningVi": "hơn (đứng sau tính từ/trạng từ so sánh hơn)"
          },
          {
            "word": "as ... as",
            "meaningVi": "bằng, ngang bằng"
          },
          {
            "word": "not as / not so ... as",
            "meaningVi": "không bằng, kém hơn"
          },
          {
            "word": "much / far / a lot + so sánh hơn",
            "meaningVi": "hơn hẳn, hơn nhiều (nhấn mạnh mức chênh lệch lớn)"
          },
          {
            "word": "a little / a bit / slightly + so sánh hơn",
            "meaningVi": "hơn một chút (nhấn mạnh mức chênh lệch nhỏ)"
          },
          {
            "word": "by far the + so sánh nhất",
            "meaningVi": "vượt trội hơn hẳn tất cả"
          },
          {
            "word": "the same as",
            "meaningVi": "giống hệt, bằng với"
          },
          {
            "word": "twice / three times as ... as",
            "meaningVi": "gấp đôi / gấp ba lần"
          }
        ],
        "commonMistakes": [
          "Dùng cả **more** và **-er** cùng lúc, hoặc dùng **-er** cho tính từ dài thay vì **more**. Ví dụ sai: `She is more taller than me.` ĐÚNG: `She is taller than me.` / Ví dụ sai: `This book is interestinger than that one.` ĐÚNG: `This book is more interesting than that one.`",
          "Quên **the** bắt buộc trước so sánh nhất. Ví dụ sai: `He is tallest student in the class.` ĐÚNG: `He is the tallest student in the class.`",
          "Sai quy tắc chính tả khi thêm **-er/-est**: không nhân đôi phụ âm cuối, không đổi y→i, hoặc thêm dư -e. Ví dụ sai: `This bag is biger than mine.` / `She is the happyest person I know.` ĐÚNG: `This bag is bigger than mine.` / `She is the happiest person I know.`",
          "Nhầm lẫn giữa `than` (dùng trong câu so sánh) và `then` (chỉ trình tự thời gian, nghĩa 'sau đó'). Ví dụ sai: `My score is higher then hers.` ĐÚNG: `My score is higher than hers.`"
        ]
      }
    },
    "articles-countable-uncountable": {
      "id": "articles-countable-uncountable",
      "title": "Mạo từ & Danh từ đếm được/không đếm được (Articles & Countable/Uncountable Nouns)",
      "level": "A2",
      "order": 10,
      "category": "word-classes",
      "theory": {
        "usages": [
          {
            "label": "Mạo từ không xác định \"a/an\"",
            "explanationVi": "Dùng \"a/an\" trước danh từ đếm được số ít khi nhắc đến vật/sự việc đó lần đầu tiên (người nghe chưa biết cụ thể là vật nào), hoặc khi nói về một cá thể bất kỳ trong một nhóm chung chung. Không dùng \"a/an\" trước danh từ số nhiều hay danh từ không đếm được. Điểm quan trọng nhất: việc chọn \"a\" hay \"an\" phụ thuộc vào ÂM ĐỌC của từ đứng ngay sau mạo từ (có thể là danh từ hoặc tính từ đứng trước danh từ), chứ không phải chữ cái đầu tiên trên mặt chữ. Nếu từ đó bắt đầu bằng âm nguyên âm thì dùng \"an\"; nếu bắt đầu bằng âm phụ âm thì dùng \"a\". Vì vậy một từ viết bắt đầu bằng nguyên âm nhưng đọc thành âm phụ âm /j/ (như \"university\", \"uniform\") vẫn dùng \"a\", còn một từ viết bắt đầu bằng phụ âm nhưng có \"h\" câm, đọc thành âm nguyên âm (như \"hour\", \"honest\") lại dùng \"an\".",
            "examples": [
              {
                "en": "We need an hour to finish this report.",
                "vi": "Chúng tôi cần một tiếng đồng hồ để hoàn thành báo cáo này."
              },
              {
                "en": "He is a university student majoring in economics.",
                "vi": "Anh ấy là sinh viên đại học chuyên ngành kinh tế."
              }
            ],
            "tagId": "art-u1-indefinite-article"
          },
          {
            "label": "Mạo từ xác định \"the\"",
            "explanationVi": "Dùng \"the\" khi cả người nói và người nghe đều hiểu rõ đang nhắc đến chính xác vật/sự việc nào, thường rơi vào một trong ba trường hợp: (1) vật đó đã được nhắc đến trước đó trong cùng đoạn hội thoại hoặc văn bản; (2) vật đó là duy nhất trong thực tế hoặc trong ngữ cảnh đang nói tới (chỉ có một cái nên ai cũng hiểu là cái nào, ví dụ vật duy nhất trong phòng, hoặc thứ hạng \"đầu tiên/duy nhất/tốt nhất\"); (3) vật đó được xác định rõ ràng nhờ thông tin đi kèm ngay sau nó, như cụm giới từ hay mệnh đề quan hệ, khiến người nghe biết chính xác là cái nào trong nhiều cái cùng loại. \"The\" dùng được cho cả danh từ số ít, số nhiều và danh từ không đếm được, miễn là vật đó đã được xác định cụ thể.",
            "examples": [
              {
                "en": "I bought a laptop yesterday. The laptop was quite expensive.",
                "vi": "Hôm qua tôi đã mua một cái laptop. Cái laptop đó khá đắt."
              },
              {
                "en": "Could you turn off the light before you leave the room?",
                "vi": "Bạn tắt đèn trước khi rời phòng được không?"
              }
            ],
            "tagId": "art-u2-definite-article"
          },
          {
            "label": "Không dùng mạo từ (zero article)",
            "explanationVi": "Không đặt mạo từ nào trước danh từ trong các trường hợp sau: danh từ số nhiều hoặc danh từ không đếm được khi mang nghĩa chung chung, khái quát (nói về cả một loại/khái niệm nói chung, không chỉ một vật cụ thể); tên riêng của người và hầu hết tên địa danh (quốc gia, thành phố, châu lục, hồ, núi số ít...); tên bữa ăn trong ngày (breakfast, lunch, dinner); tên môn thể thao (soccer, tennis, basketball...); tên ngôn ngữ (English, Vietnamese...); và hầu hết phương tiện đi lại khi đứng sau giới từ \"by\" (by car, by bus, by bike, by plane...).",
            "examples": [
              {
                "en": "Vietnam is famous for its beautiful beaches.",
                "vi": "Việt Nam nổi tiếng với những bãi biển đẹp."
              },
              {
                "en": "I go to work by bus, but my sister prefers to walk.",
                "vi": "Tôi đi làm bằng xe buýt, còn em gái tôi thích đi bộ hơn."
              }
            ],
            "tagId": "art-u3-zero-article"
          },
          {
            "label": "Danh từ đếm được vs không đếm được",
            "explanationVi": "Danh từ đếm được là những vật có thể tách ra đếm từng cái một, có cả dạng số ít và số nhiều (a book/two books). Danh từ không đếm được thường chỉ chất liệu, chất lỏng, khái niệm trừu tượng hoặc tập hợp không tách rời (water, rice, advice, furniture, information...); loại này KHÔNG có dạng số nhiều và không đứng trực tiếp sau \"a/an\" (muốn đếm phải thêm đơn vị, ví dụ \"a piece of advice\", \"a cup of water\"). Vì vậy các từ chỉ lượng cũng phải dùng đúng loại: với danh từ đếm được số nhiều dùng \"many\", \"a few\" (một ít nhưng vẫn đủ/có, mang nghĩa tích cực) hoặc \"few\" (hầu như không có, mang nghĩa tiêu cực); với danh từ không đếm được dùng \"much\", \"a little\" (một ít nhưng vẫn đủ/có) hoặc \"little\" (hầu như không có). \"Some\" và \"any\" dùng được cho cả hai loại (some/any thường dùng trong câu khẳng định/nghi vấn/phủ định tương ứng); \"a lot of\"/\"lots of\" cũng dùng được cho cả hai loại.",
            "examples": [
              {
                "en": "There are only a few apples left in the basket.",
                "vi": "Chỉ còn vài quả táo trong giỏ."
              },
              {
                "en": "We don't have much time before the meeting starts.",
                "vi": "Chúng ta không có nhiều thời gian trước khi cuộc họp bắt đầu."
              }
            ],
            "tagId": "art-u4-countable-uncountable"
          },
          {
            "label": "Trường hợp đặc biệt hay nhầm",
            "explanationVi": "Một số danh từ có thể vừa đếm được vừa không đếm được tùy vào nghĩa sử dụng: khi chỉ chất liệu hoặc khái niệm chung, danh từ đó không đếm được (coffee: cà phê nói chung như một chất lỏng/thức uống; paper: giấy nói chung như một chất liệu); nhưng khi chỉ một đơn vị, một loại hoặc một sản phẩm cụ thể, danh từ đó trở thành đếm được (a coffee: một ly cà phê; a paper: một bài báo hoặc một bài luận/bài nghiên cứu). Ngoài ra, có một vài cụm cố định luôn dùng \"the\" mà người học cần nhớ như từ vựng riêng lẻ, không suy luận theo quy tắc thông thường: \"the internet\", \"play the guitar\" (và các nhạc cụ khác như \"the piano\", \"the violin\"), và cấu trúc \"the\" + tính từ để chỉ chung một nhóm người trong xã hội, ví dụ \"the rich\" (người giàu nói chung), \"the poor\" (người nghèo nói chung).",
            "examples": [
              {
                "en": "Coffee is my favorite drink, so I always order a coffee when I visit this cafe.",
                "vi": "Cà phê là thức uống tôi thích nhất, nên tôi luôn gọi một ly cà phê khi ghé quán này."
              },
              {
                "en": "My grandfather learned to play the guitar when he was young, and now he spends hours on the internet watching guitar tutorials.",
                "vi": "Ông tôi học chơi ghi-ta từ khi còn trẻ, giờ đây ông dành hàng giờ trên internet xem video hướng dẫn chơi ghi-ta."
              }
            ],
            "tagId": "art-u5-special-cases"
          }
        ],
        "formulas": null,
        "signalWords": [
          {
            "word": "the only",
            "meaningVi": "duy nhất — luôn đi với \"the\" vì chỉ có một"
          },
          {
            "word": "the same",
            "meaningVi": "giống nhau, đã được nhắc tới hoặc mặc định ai cũng hiểu là gì"
          },
          {
            "word": "the first / the last",
            "meaningVi": "thứ tự đầu tiên/cuối cùng — thường đi với \"the\" vì chỉ có một"
          },
          {
            "word": "the sun / the moon / the sky",
            "meaningVi": "các vật thể tự nhiên duy nhất, luôn dùng \"the\" (riêng \"Earth\" viết hoa, dùng như tên hành tinh, thường KHÔNG có mạo từ — vd \"on Earth\"; còn \"the earth\" viết thường, nghĩa mặt đất/trái đất nói chung, vẫn có \"the\")"
          },
          {
            "word": "by car / by bus / by bike / by plane",
            "meaningVi": "phương tiện đi lại sau \"by\" — không dùng mạo từ"
          },
          {
            "word": "breakfast / lunch / dinner",
            "meaningVi": "tên bữa ăn — không dùng mạo từ khi nói chung"
          },
          {
            "word": "last night / next week / last year",
            "meaningVi": "cụm chỉ thời gian — không dùng mạo từ"
          },
          {
            "word": "the rich / the poor / the elderly",
            "meaningVi": "the + tính từ = một nhóm người trong xã hội"
          }
        ],
        "commonMistakes": [
          "Bỏ qua hoàn toàn mạo từ trước danh từ đếm được số ít vì tiếng Việt không có khái niệm mạo từ. Ví dụ sai: `I have dog and I like it very much.` **ĐÚNG**: `I have a dog and I like it very much.`",
          "Dùng \"a/an\" trước danh từ không đếm được, vì nghĩ rằng cứ có \"một\" trong đầu là phải thêm \"a/an\". Ví dụ sai: `She gave me an advice before the interview.` **ĐÚNG**: `She gave me some advice before the interview.` (hoặc `a piece of advice`)",
          "Chọn \"a\" hay \"an\" theo chữ cái viết đầu tiên thay vì âm đọc thực tế của từ đứng ngay sau. Ví dụ sai: `He is a honest man who never lies.` **ĐÚNG**: `He is an honest man who never lies.` (vì \"h\" trong \"honest\" là âm câm, từ này đọc bắt đầu bằng nguyên âm)",
          "Thêm \"the\" trước danh từ mang nghĩa chung chung, khái quát, trong khi lẽ ra không cần mạo từ nào. Ví dụ sai: `The money can't buy real happiness.` **ĐÚNG**: `Money can't buy real happiness.` (nói về tiền bạc nói chung, không phải một khoản tiền cụ thể)"
        ]
      }
    },
    "modal-verbs": {
      "id": "modal-verbs",
      "title": "Động từ khuyết thiếu (Modal Verbs)",
      "level": "B1",
      "order": 11,
      "category": "word-classes",
      "theory": {
        "usages": [
          {
            "label": "Khả năng (Ability)",
            "explanationVi": "Dùng 'can' để nói về khả năng ở hiện tại. Với quá khứ, có hai lựa chọn cần phân biệt rõ: 'could' diễn tả một khả năng CHUNG mà ai đó có được trong một khoảng thời gian dài ở quá khứ (ví dụ: kỹ năng học được từ nhỏ, hoặc một sự thật chung của cả một giai đoạn), còn 'was/were able to' diễn tả việc ai đó đã LÀM ĐƯỢC một việc CỤ THỂ, chỉ một lần, nhờ nỗ lực hoặc hoàn cảnh tại thời điểm đó — đây chính là điểm hay gây nhầm lẫn nhất của chủ điểm này. Ở thể phủ định, 'couldn't' và 'wasn't/weren't able to' đều dùng được cho cả hai trường hợp (chung lẫn cụ thể) mà không phân biệt nghiêm ngặt như thể khẳng định. Ngoài ra, 'be able to' còn được dùng ở các thì mà 'can' không có dạng tương ứng, ví dụ thì tương lai ('will be able to') hoặc sau một modal khác ('might be able to').",
            "examples": [
              {
                "en": "My grandfather could speak three languages by the time he finished high school.",
                "vi": "Ông tôi có thể nói được ba thứ tiếng vào lúc ông học xong trung học."
              },
              {
                "en": "After hours of searching in the storm, the rescue team was able to find the missing hiker.",
                "vi": "Sau nhiều giờ tìm kiếm trong cơn bão, đội cứu hộ đã tìm được người đi bộ đường dài bị mất tích."
              }
            ],
            "tagId": "modal-u1-ability"
          },
          {
            "label": "Sự cho phép (Permission)",
            "explanationVi": "'Can', 'could' và 'may' đều dùng để xin phép hoặc cho phép ai đó làm việc gì, nhưng khác nhau về mức độ trang trọng. 'Can' là cách nói thông thường, thân mật, dùng nhiều trong giao tiếp hằng ngày. 'Could' lịch sự và nhẹ nhàng hơn một chút, thường dùng khi xin phép người lạ hoặc người lớn tuổi hơn. 'May' là cách nói TRANG TRỌNG nhất, thường xuất hiện trong văn viết, quy định, thông báo chính thức, hoặc khi nói chuyện với người có vị trí cao hơn (giáo viên, cấp trên). Ở thể phủ định, 'may not' thường mang nghĩa 'không được phép' một cách trang trọng (gần với sự cấm đoán), trong khi 'can't' mang tính thông thường hơn. Ở thể khẳng định, 'could' còn dùng để diễn tả một sự cho phép/quy định CHUNG đã tồn tại trong một giai đoạn quá khứ (không phải đang xin phép ngay lúc nói) — ví dụ: 'When my dad was young, teenagers could drive after getting a license at sixteen' (ngày đó, luật cho phép việc này).",
            "examples": [
              {
                "en": "Could I leave the meeting a few minutes early today? I have a doctor's appointment.",
                "vi": "Hôm nay tôi xin phép rời cuộc họp sớm vài phút được không ạ? Tôi có hẹn khám bệnh."
              },
              {
                "en": "Visitors may not enter the laboratory without a security badge.",
                "vi": "Khách tham quan không được phép vào phòng thí nghiệm nếu không có thẻ an ninh."
              }
            ],
            "tagId": "modal-u2-permission"
          },
          {
            "label": "Nghĩa vụ - Sự cần thiết (Obligation & Necessity)",
            "explanationVi": "'Must' và 'have to' đều diễn tả một việc bắt buộc phải làm, nhưng nguồn gốc của nghĩa vụ khác nhau. 'Must' thường được dùng khi nghĩa vụ đến từ chính người nói — cảm giác cá nhân, ý kiến chủ quan, hoặc một quy tắc mà người nói tự đặt ra cho mình. 'Have to' thường được dùng khi nghĩa vụ đến từ một yếu tố KHÁCH QUAN bên ngoài, như luật pháp, quy định của tổ chức, hoặc hoàn cảnh không thể thay đổi. Điểm CỰC KỲ dễ nhầm lẫn nằm ở thể phủ định: 'must not' (viết tắt 'mustn't') mang nghĩa BỊ CẤM — bắt buộc KHÔNG được làm việc đó; trong khi 'don't have to' mang nghĩa hoàn toàn khác — KHÔNG CẦN THIẾT phải làm việc đó, nhưng nếu muốn thì vẫn được phép làm. Hai cấu trúc này thường bị người học nhầm lẫn vì cả hai đều chứa từ phủ định nhưng mang ý nghĩa trái ngược nhau hoàn toàn.",
            "examples": [
              {
                "en": "I must call my sister tonight; I promised her I would, and I don't want to break that promise.",
                "vi": "Tối nay tôi phải gọi cho chị gái; tôi đã hứa với chị ấy rồi và tôi không muốn thất hứa."
              },
              {
                "en": "Employees have to wear a helmet on the construction site, according to the safety regulations.",
                "vi": "Theo quy định an toàn, nhân viên bắt buộc phải đội mũ bảo hộ tại công trường."
              }
            ],
            "tagId": "modal-u3-obligation"
          },
          {
            "label": "Lời khuyên (Advice)",
            "explanationVi": "'Should' và 'ought to' đều dùng để đưa ra lời khuyên hoặc ý kiến về điều nên làm, và về cơ bản có thể thay thế cho nhau; tuy nhiên 'ought to' nghe trang trọng hơn một chút và ít phổ biến hơn trong văn nói hằng ngày so với 'should'. 'Had better' (thường rút gọn thành 'I'd better', 'you'd better'...) mang sắc thái MẠNH và KHẨN CẤP hơn hẳn — nó thường được dùng cho một tình huống CỤ THỂ, trước mắt, kèm theo cảnh báo về một hậu quả xấu nếu người nghe không làm theo. Vì mang tính cảnh báo mạnh, 'had better' ít phù hợp để đưa ra lời khuyên chung chung, nhẹ nhàng — trường hợp đó nên dùng 'should' hoặc 'ought to' thay vì 'had better'.",
            "examples": [
              {
                "en": "You should drink more water during the hot summer months to avoid dehydration.",
                "vi": "Bạn nên uống nhiều nước hơn trong những tháng hè nóng bức để tránh mất nước."
              },
              {
                "en": "You'd better call the doctor right now; that cut on your hand looks infected.",
                "vi": "Bạn nên gọi bác sĩ ngay bây giờ đi; vết cắt trên tay bạn trông có vẻ bị nhiễm trùng rồi."
              }
            ],
            "tagId": "modal-u4-advice"
          },
          {
            "label": "Suy đoán - Khả năng xảy ra ở hiện tại (Present Deduction & Possibility)",
            "explanationVi": "Khi muốn đưa ra một suy đoán về việc gì đó có đúng hay không ở HIỆN TẠI, dựa trên bằng chứng hoặc lý lẽ logic, ta dùng các modal verb theo mức độ chắc chắn khác nhau. 'Must' dùng khi người nói gần như CHẮC CHẮN điều đó đúng, dựa trên bằng chứng rõ ràng. 'May', 'might' và 'could' dùng khi người nói cho rằng điều đó CÓ THỂ đúng nhưng không chắc chắn hoàn toàn; trong ba từ này, 'might' thường được xem là mang mức độ chắc chắn thấp hơn một chút so với 'may', còn 'could' cũng diễn tả khả năng tương tự nhưng ít khi dùng ở thể phủ định với nghĩa này. Khi muốn suy đoán rằng điều gì đó CHẮC CHẮN KHÔNG đúng, ta dùng 'can't' — đây là điểm cần lưu ý vì phủ định của 'must' trong ngữ cảnh suy đoán KHÔNG phải là 'must not' (vốn mang nghĩa cấm đoán) mà là 'can't'.",
            "examples": [
              {
                "en": "The lights are off and no one is answering the door; they must be out right now.",
                "vi": "Đèn tắt hết và không ai ra mở cửa; chắc là họ đang đi vắng."
              },
              {
                "en": "She can't be at work today — I just saw her car parked in the driveway.",
                "vi": "Chắc chắn hôm nay cô ấy không đi làm đâu — tôi vừa thấy xe của cô ấy đậu trong sân nhà."
              }
            ],
            "tagId": "modal-u5-deduction"
          }
        ],
        "formulas": {
          "affirmative": "S + modal + V (nguyên thể, KHÔNG chia theo chủ ngữ, KHÔNG có 'to') — ví dụ: 'She can drive a truck.'",
          "negative": "S + modal + not + V (nguyên thể) — ví dụ: 'He should not (shouldn't) skip breakfast.'",
          "question": "Modal + S + V (nguyên thể) ...? — ví dụ: 'Can you finish this report by Friday?'"
        },
        "signalWords": [
          {
            "word": "definitely / certainly",
            "meaningVi": "chắc chắn — thường đi kèm suy đoán mạnh với 'must'"
          },
          {
            "word": "perhaps / maybe",
            "meaningVi": "có lẽ — thường đi kèm suy đoán không chắc chắn với 'may/might/could'"
          },
          {
            "word": "It's forbidden to / not allowed to",
            "meaningVi": "bị cấm làm gì — tương đương về nghĩa với 'must not'"
          },
          {
            "word": "It's not necessary to / there's no need to",
            "meaningVi": "không cần thiết phải làm gì — tương đương về nghĩa với 'don't have to'"
          },
          {
            "word": "It's compulsory / mandatory",
            "meaningVi": "bắt buộc theo quy định — thường đi cùng 'have to'"
          },
          {
            "word": "I'm sure that / I'm positive that",
            "meaningVi": "tôi chắc chắn rằng — dấu hiệu nên dùng 'must' khi suy đoán"
          },
          {
            "word": "Is it OK if...? / Do you mind if...?",
            "meaningVi": "cách xin phép thân mật, có thể thay cho 'Can/Could I...?'"
          },
          {
            "word": "...or else / ...or you'll...",
            "meaningVi": "cấu trúc cảnh báo hậu quả, thường đi cùng 'had better'"
          }
        ],
        "commonMistakes": [
          "Thêm \"to\" sau modal verb (modal verbs luôn đi với động từ nguyên thể KHÔNG \"to\"). Sai: `She can to swim very well.` **ĐÚNG**: `She can swim very well.`",
          "Chia động từ modal theo ngôi thứ ba số ít (thêm \"-s\") — modal verbs không bao giờ đổi dạng theo chủ ngữ. Sai: `He cans speak French.` **ĐÚNG**: `He can speak French.`",
          "Nhầm lẫn `must not` (bị CẤM, bắt buộc không được làm) với `don't have to` (KHÔNG bắt buộc, được phép không làm). Ví dụ nghĩa sai: nói `You must not finish the homework tonight` khi ý thực sự chỉ là bài tập không cần nộp gấp. **ĐÚNG**: `You don't have to finish the homework tonight` (không bắt buộc, để mai làm cũng được).",
          "Dùng hai modal verbs liên tiếp trong cùng một mệnh đề (tiếng Anh chỉ cho phép một modal verb đứng trước động từ chính). Sai: `I might can help you tomorrow.` **ĐÚNG**: `I might be able to help you tomorrow.`",
          "'Ought to' là modal HIẾM HOI có 'to' ngay sau nó (khác các modal khác trong công thức chung ở trên) — vẫn viết đúng `You ought to see a doctor`, không phải `ought see`. Ngoài ra 'have to' tuy mang nghĩa gần giống modal nhưng KHÔNG phải modal thật sự — nó CHIA theo chủ ngữ/thì như động từ thường ('has to' ở ngôi ba số ít, 'had to' ở quá khứ) và cần trợ động từ do/does/did khi phủ định/nghi vấn (`Does she have to work on Saturdays?`), khác hẳn công thức modal chuẩn ở trên."
        ]
      }
    },
    "future-going-to": {
      "id": "future-going-to",
      "title": "Thì tương lai gần (Future - going to)",
      "level": "A2",
      "order": 6,
      "category": "tenses",
      "theory": {
        "usages": [
          {
            "label": "Dự định, kế hoạch đã có từ trước (không phải quyết định tức thời)",
            "explanationVi": "\"be going to\" diễn tả một dự định hoặc kế hoạch mà người nói ĐÃ QUYẾT ĐỊNH TỪ TRƯỚC thời điểm nói, chứ không phải một quyết định vừa nảy ra ngay lúc đó. Đây chính là điểm khác biệt cốt lõi giữa \"going to\" và \"will\": \"will\" dùng cho quyết định BỘC PHÁT, nghĩ ra ngay tại thời điểm nói (thường là phản ứng trước một tình huống bất ngờ), còn \"going to\" dùng khi kế hoạch đã được cân nhắc, sắp xếp từ trước đó một khoảng thời gian - dù là vài phút, vài giờ hay vài năm. Hãy so sánh hai câu cạnh nhau trong cùng một tình huống: nếu chuông cửa reo và bạn phản ứng ngay \"I'll get it!\" thì đó là will (chưa hề nghĩ tới việc này trước đó); nhưng nếu bạn đã hẹn trước với ai đó rằng mình sẽ ra mở cửa đón khách vào một giờ cụ thể, bạn nói \"I'm going to open the door for the guests at 7 p.m.\" vì đó là kế hoạch đã sắp xếp.",
            "examples": [
              {
                "en": "A: 'This box is too heavy for me.' B: 'Don't worry, I'll carry it upstairs for you.'",
                "vi": "A: 'Cái hộp này nặng quá, tôi không bê nổi.' B: 'Đừng lo, để tôi bê nó lên lầu giúp bạn.' (quyết định nảy ra ngay lúc nghe câu nói của A, dùng 'will')"
              },
              {
                "en": "I'm going to redecorate my living room next month; I've already chosen the paint color and bought the furniture.",
                "vi": "Tôi sắp trang trí lại phòng khách vào tháng tới; tôi đã chọn màu sơn và mua nội thất rồi. (kế hoạch đã có từ trước, dùng 'going to')"
              }
            ],
            "tagId": "fgt-u1-planned-intention"
          },
          {
            "label": "Dự đoán dựa trên bằng chứng có thể quan sát được ở hiện tại",
            "explanationVi": "\"be going to\" còn dùng để đưa ra dự đoán về tương lai khi có BẰNG CHỨNG hoặc DẤU HIỆU cụ thể mà người nói có thể quan sát, nghe, hoặc cảm nhận được NGAY TẠI THỜI ĐIỂM NÓI. Điều này khác với \"will\", vốn thường dùng để đưa ra dự đoán dựa trên Ý KIẾN, niềm tin, kinh nghiệm chung hoặc suy đoán chủ quan mà không cần có bằng chứng cụ thể ngay trước mắt. Ví dụ, khi bạn nhìn thấy những đám mây đen kịt đang kéo đến, bạn có bằng chứng rõ ràng nên nói \"It's going to rain\"; nhưng nếu chỉ đơn thuần đưa ra nhận định chung dựa trên cảm tính, kiểu như dự báo thời tiết cho cả tuần tới mà chưa thấy dấu hiệu gì cụ thể, người ta thường nói \"I think it will rain later this week\". Ghi nhớ: có bằng chứng trước mắt → going to; chỉ là quan điểm/dự đoán chung → will.",
            "examples": [
              {
                "en": "Look at those dark clouds rolling in - it's going to rain any minute now.",
                "vi": "Nhìn những đám mây đen đang kéo đến kìa - trời sắp mưa đến nơi rồi. (có bằng chứng quan sát được ngay lúc này)"
              },
              {
                "en": "I don't see any clear signs yet, but I think it will rain sometime next week.",
                "vi": "Tôi chưa thấy dấu hiệu gì rõ ràng cả, nhưng tôi nghĩ tuần sau trời sẽ mưa. (chỉ là ý kiến cá nhân, không có bằng chứng cụ thể ngay lúc nói)"
              }
            ],
            "tagId": "fgt-u2-evidence-prediction"
          },
          {
            "label": "Sự việc sắp xảy ra trong tương lai rất gần (dấu hiệu rõ ràng ngay trước mắt)",
            "explanationVi": "\"be going to\" dùng để nói về một việc SẮP xảy ra trong tương lai rất gần, gần như ngay lập tức, khi có những dấu hiệu rõ ràng, cụ thể ngay trước mắt cho thấy việc đó chắc chắn sắp diễn ra (near future, on the verge of doing something). Cách dùng này khá gần với usage dự đoán dựa trên bằng chứng ở trên, nhưng nhấn mạnh thêm yếu tố THỜI ĐIỂM: sự việc không chỉ có khả năng xảy ra mà còn được cảm nhận là RẤT GẦN, gần như tức thì. Ví dụ điển hình là khi nhìn một người phụ nữ mang thai với bụng đã rất to, gần đến ngày sinh, ta nói \"She's going to have a baby\" vì các dấu hiệu thể chất cho thấy việc sinh nở sắp xảy ra trong thời gian rất ngắn tới. Tương tự, khi thấy một chiếc ly đang nghiêng dần ở mép bàn, ta thốt lên \"That glass is going to fall!\" vì hành động rơi gần như chắc chắn sẽ xảy ra ngay sau đó.",
            "examples": [
              {
                "en": "She's got a huge bump and her due date is next Monday - she's going to have her baby any day now.",
                "vi": "Bụng cô ấy đã rất to và ngày dự sinh là thứ Hai tới - cô ấy sắp sinh em bé trong nay mai. (dấu hiệu thể chất rõ ràng ngay trước mắt)"
              },
              {
                "en": "Watch out - that stack of plates is going to topple over any second!",
                "vi": "Cẩn thận đó - chồng đĩa kia sắp đổ nhào bất cứ lúc nào! (dấu hiệu quan sát được cho thấy việc sắp xảy ra ngay lập tức)"
              }
            ],
            "tagId": "fgt-u3-near-future-signs"
          },
          {
            "label": "\"Going to\" với động từ chuyển động go/come - thường rút gọn tự nhiên hơn bằng hiện tại tiếp diễn",
            "explanationVi": "Về mặt ngữ pháp, \"be going to\" hoàn toàn có thể kết hợp với chính động từ \"go\" hoặc \"come\", tạo thành cấu trúc như \"I am going to go\" hay \"She is going to come\". Tuy nhiên, vì có hai từ \"going\" xuất hiện liên tiếp gần nhau (going to go) nghe khá cồng kềnh và lặp lại không cần thiết, nên trong tiếng Anh tự nhiên - đặc biệt là văn nói - người bản ngữ thường LƯỢC BỎ phần \"going to\" khi động từ chính là \"go\" hoặc \"come\", và dùng trực tiếp thì hiện tại tiếp diễn (be + V-ing) để diễn tả cùng một ý nghĩa về kế hoạch tương lai. Vì vậy, \"I'm going to the party tonight\" nghe tự nhiên và phổ biến hơn nhiều so với \"I'm going to go to the party tonight\", dù cả hai đều đúng ngữ pháp. Cách rút gọn này áp dụng riêng cho hai động từ chuyển động go/come, không áp dụng cho các động từ khác.",
            "examples": [
              {
                "en": "I'm going to the gym right after work; I already packed my sneakers this morning.",
                "vi": "Tôi sẽ đến phòng gym ngay sau giờ làm; sáng nay tôi đã chuẩn bị sẵn giày thể thao rồi. (tự nhiên hơn nhiều so với 'I'm going to go to the gym')"
              },
              {
                "en": "My cousins are coming to our house for Thanksgiving this year.",
                "vi": "Năm nay các anh chị họ của tôi sẽ đến nhà chúng tôi ăn lễ Tạ ơn. (tự nhiên hơn 'are going to come')"
              }
            ],
            "tagId": "fgt-u4-going-go-come"
          },
          {
            "label": "Câu hỏi, câu phủ định với \"going to\" và cách phân biệt với hiện tại tiếp diễn chỉ tương lai",
            "explanationVi": "Để đặt câu hỏi, ta đảo động từ \"am/is/are\" lên trước chủ ngữ: \"Am/Is/Are + S + going to + V?\". Để phủ định, thêm \"not\" ngay sau \"am/is/are\": \"S + am/is/are + not + going to + V\". Một điểm quan trọng cần phân biệt là giữa \"going to\" và hiện tại tiếp diễn (be + V-ing) khi cả hai cùng diễn tả tương lai: hiện tại tiếp diễn thường dùng cho những SẮP XẾP ĐÃ CHỐT CHẮC CHẮN về mặt chi tiết - đã đặt vé, đã hẹn giờ cụ thể, đã xác nhận với người khác (ví dụ: 'I'm meeting the dentist at 9 a.m. tomorrow' - đã có lịch hẹn cụ thể), trong khi \"going to\" thường dùng cho DỰ ĐỊNH/KẾ HOẠCH nói chung, mang tính chủ định của người nói, nhưng CHƯA CHẮC đã chốt xong mọi chi tiết về thời gian hay cách thức thực hiện (ví dụ: 'I'm going to visit the dentist sometime this month' - mới chỉ là dự định, chưa đặt lịch cụ thể). Nói cách khác, hiện tại tiếp diễn nghiêng về tính XÁC ĐỊNH của sự sắp xếp, còn \"going to\" nghiêng về Ý ĐỊNH của người nói.",
            "examples": [
              {
                "en": "Isn't he going to apply for that scholarship? I heard he was really interested in it.",
                "vi": "Anh ấy không định nộp đơn xin học bổng đó à? Tôi nghe nói anh ấy rất quan tâm đến nó mà."
              },
              {
                "en": "I'm going to fix the leaking faucet sometime this weekend, but I'm meeting a client at 2 p.m. on Saturday, so it depends on my schedule.",
                "vi": "Tôi định sửa vòi nước bị rò rỉ vào cuối tuần này, nhưng tôi có hẹn gặp khách hàng lúc 2 giờ chiều thứ Bảy đã được xác nhận, nên còn tùy vào lịch trình."
              }
            ],
            "tagId": "fgt-u5-question-negative-vs-continuous"
          }
        ],
        "formulas": {
          "affirmative": "S + am/is/are + going to + V (nguyên thể). Ví dụ: 'They are going to build a new bridge here.' (Họ sắp/định xây một cây cầu mới ở đây.)",
          "negative": "S + am/is/are + not + going to + V (nguyên thể). Ví dụ: 'He isn't going to accept that offer.' (Anh ấy sẽ không chấp nhận lời đề nghị đó đâu.)",
          "question": "Am/Is/Are + S + going to + V (nguyên thể) ...? Ví dụ: 'Are you going to join the workshop next Friday?' (Bạn có định tham gia buổi hội thảo thứ Sáu tới không?)"
        },
        "signalWords": [
          {
            "word": "Look at...! / Look out!",
            "meaningVi": "Dùng khi có bằng chứng/dấu hiệu quan sát được ngay trước mắt, thường báo hiệu nên dùng 'going to' thay vì 'will'."
          },
          {
            "word": "I can see (that)... / I can hear (that)...",
            "meaningVi": "Diễn đạt việc nhận biết bằng chứng cụ thể ngay tại thời điểm nói, thường đi kèm 'going to'."
          },
          {
            "word": "already decided / have already planned / have arranged",
            "meaningVi": "Nhấn mạnh dự định/kế hoạch đã có từ trước, không phải vừa nghĩ ra ngay lúc nói."
          },
          {
            "word": "be about to / on the verge of",
            "meaningVi": "Mang nghĩa gần giống 'going to' khi nói về việc sắp xảy ra gần như ngay lập tức."
          },
          {
            "word": "definitely/probably + going to",
            "meaningVi": "Nhấn mạnh mức độ chắc chắn cao của dự định hoặc dự đoán có bằng chứng cụ thể."
          },
          {
            "word": "due date / expecting",
            "meaningVi": "Thường xuất hiện trong ngữ cảnh dự đoán có bằng chứng rõ ràng, ví dụ như mang thai sắp đến ngày sinh."
          }
        ],
        "commonMistakes": [
          "Quên từ **\"to\"** sau \"going\", viết liền với động từ nguyên thể. Ví dụ sai: `I am going study tonight.` ĐÚNG: `I am going to study tonight.`",
          "Dùng \"going to\" cho một quyết định BỘC PHÁT, nảy ra ngay tại thời điểm nói, thay vì dùng \"will\". Ví dụ sai (nếu đây là phản ứng tức thời): `The phone is ringing! I am going to answer it.` ĐÚNG: `The phone is ringing! I'll answer it.`",
          "Quên chia **am/is/are** đúng theo chủ ngữ trước \"going to\". Ví dụ sai: `She going to travel to Japan next year.` ĐÚNG: `She is going to travel to Japan next year.`",
          "Lặp lại một cách không tự nhiên cấu trúc `going to go` với động từ chuyển động \"go\", trong khi nên dùng hiện tại tiếp diễn cho gọn và tự nhiên hơn. Ví dụ kém tự nhiên: `We are going to go to the beach this weekend.` Tự nhiên hơn: `We are going to the beach this weekend.`"
        ]
      }
    },
    "past-perfect": {
      "id": "past-perfect",
      "title": "Thì quá khứ hoàn thành (Past Perfect)",
      "level": "B1",
      "order": 8,
      "category": "tenses",
      "theory": {
        "usages": [
          {
            "label": "Hoàn tất trước một mốc thời gian cụ thể trong quá khứ (by / by the time)",
            "explanationVi": "Dùng quá khứ hoàn thành để diễn tả một hành động hoặc sự việc đã HOÀN TẤT trước một mốc thời gian cụ thể đã qua, thường đi cùng \"by + mốc thời gian\" hoặc \"by the time + mệnh đề chia quá khứ đơn\". Mốc thời gian đóng vai trò là điểm mốc trong quá khứ để so sánh, khác với hiện tại hoàn thành vốn lấy hiện tại làm mốc.",
            "examples": [
              {
                "en": "By the time the plane took off, we had already checked in our luggage.",
                "vi": "Vào lúc máy bay cất cánh, chúng tôi đã làm thủ tục ký gửi hành lý xong rồi."
              },
              {
                "en": "By 2015, the city had built two new bridges across the river.",
                "vi": "Tính đến năm 2015, thành phố đã xây xong hai cây cầu mới bắc qua sông."
              }
            ],
            "tagId": "pastperf-u1-before-past-point"
          },
          {
            "label": "Hành động xảy ra TRƯỚC trong hai hành động liên tiếp ở quá khứ",
            "explanationVi": "Khi có hai hành động xảy ra ở quá khứ, hành động nào xảy ra TRƯỚC dùng quá khứ hoàn thành, hành động xảy ra SAU dùng quá khứ đơn, giúp trình tự thời gian rõ ràng, thường đi cùng before/after/when/as soon as/once. Nếu dùng hai quá khứ đơn liên tiếp, người đọc có thể hiểu nhầm hai việc xảy ra gần như đồng thời.",
            "examples": [
              {
                "en": "After the guests had left, the staff cleaned up the ballroom.",
                "vi": "Sau khi khách khứa đã ra về, nhân viên mới dọn dẹp phòng tiệc."
              },
              {
                "en": "The train had already departed before we reached the platform.",
                "vi": "Đoàn tàu đã rời đi trước khi chúng tôi đến được sân ga."
              }
            ],
            "tagId": "pastperf-u2-sequence-of-events"
          },
          {
            "label": "Giải thích nguyên nhân cho một tình huống/cảm xúc khác trong quá khứ",
            "explanationVi": "Quá khứ hoàn thành được dùng để nêu nguyên nhân (thường sau \"because\") giải thích cho một trạng thái, cảm xúc hoặc sự việc khác đã diễn ra ở quá khứ. Việc là nguyên nhân đã xảy ra TRƯỚC tình huống được kể, nên lùi về quá khứ hoàn thành để mốc thời gian không bị lẫn với mốc chính của câu chuyện.",
            "examples": [
              {
                "en": "Emma looked exhausted because she had cleaned the entire house alone.",
                "vi": "Emma trông kiệt sức vì cô ấy đã tự dọn dẹp cả căn nhà một mình."
              },
              {
                "en": "He couldn't unlock the door because he had left his keys at the office.",
                "vi": "Anh ấy không thể mở khóa cửa vì đã để quên chìa khóa ở văn phòng."
              }
            ],
            "tagId": "pastperf-u3-reason-for-past-situation"
          },
          {
            "label": "Trải nghiệm/thành tựu tính đến một thời điểm trong quá khứ",
            "explanationVi": "Giống cách hiện tại hoàn thành tổng kết trải nghiệm tính đến HIỆN TẠI, quá khứ hoàn thành tổng kết trải nghiệm/thành tựu tính đến một MỐC QUÁ KHỨ cụ thể, thường có \"by the age of...\", \"by the time...\", \"never...before\". Mốc quy chiếu ở đây luôn là một thời điểm đã qua, không phải bây giờ.",
            "examples": [
              {
                "en": "By the age of 25, she had already published two novels.",
                "vi": "Đến năm 25 tuổi, cô ấy đã xuất bản hai cuốn tiểu thuyết."
              },
              {
                "en": "Before he joined our team, Daniel had never worked on a marketing project.",
                "vi": "Trước khi gia nhập đội của chúng tôi, Daniel chưa từng làm dự án marketing nào."
              }
            ],
            "tagId": "pastperf-u4-experience-up-to-past-point"
          },
          {
            "label": "Xuất hiện trong câu điều kiện loại 3 và câu ước tiếc nuối quá khứ (giới thiệu ngắn gọn)",
            "explanationVi": "Cấu trúc \"had + V-p2\" của quá khứ hoàn thành cũng chính là thành phần bắt buộc trong mệnh đề \"if\" của câu điều kiện loại 3 và trong câu ước với \"wish\" khi tiếc nuối về quá khứ. Chuyên đề Câu điều kiện đã dạy chi tiết điều kiện loại 3, ở đây chỉ nhắc lại để người học nhận ra cùng một cấu trúc \"had + V-p2\" xuất hiện xuyên suốt nhiều ngữ cảnh khác nhau.",
            "examples": [
              {
                "en": "If I had known about the traffic, I would have left home earlier.",
                "vi": "Nếu tôi biết trước về tình trạng kẹt xe thì tôi đã rời nhà sớm hơn rồi."
              },
              {
                "en": "I wish I had saved more money when I was younger.",
                "vi": "Giá như tôi đã tiết kiệm nhiều tiền hơn khi còn trẻ."
              }
            ],
            "tagId": "pastperf-u5-conditional-wish"
          }
        ],
        "formulas": {
          "affirmative": "S + had + V-p2 (quá khứ phân từ). Ví dụ: 'They had finished dinner by 8 p.m.' (Họ đã ăn xong bữa tối trước 8 giờ tối.)",
          "negative": "S + had + not (hadn't) + V-p2. Ví dụ: 'She hadn't seen that movie before last night.' (Trước tối qua cô ấy chưa từng xem bộ phim đó.)",
          "question": "Had + S + V-p2...? Ví dụ: 'Had you ever visited Japan before that trip?' (Trước chuyến đi đó, bạn đã từng đến Nhật Bản chưa?)"
        },
        "signalWords": [
          {
            "word": "already",
            "meaningVi": "đã... rồi (thường đứng giữa 'had' và V-p2)"
          },
          {
            "word": "just",
            "meaningVi": "vừa mới"
          },
          {
            "word": "by the time",
            "meaningVi": "tính đến lúc, vào lúc"
          },
          {
            "word": "before",
            "meaningVi": "trước khi"
          },
          {
            "word": "after",
            "meaningVi": "sau khi"
          },
          {
            "word": "when",
            "meaningVi": "khi"
          },
          {
            "word": "as soon as",
            "meaningVi": "ngay khi"
          },
          {
            "word": "once",
            "meaningVi": "một khi, ngay khi"
          },
          {
            "word": "never (before)",
            "meaningVi": "chưa từng (trước đó)"
          }
        ],
        "commonMistakes": [
          "Dùng hai quá khứ đơn liên tiếp khi cần thể hiện rõ việc nào xảy ra trước, việc nào xảy ra sau, khiến trình tự thời gian bị mơ hồ. Ví dụ sai: *'When I arrived, the meeting already finished.'*. **Đúng:** *'When I arrived, the meeting had already finished.'*",
          "Quên từ \"had\", chỉ dùng một mình V-p2 khiến câu không còn mang nghĩa quá khứ hoàn thành. Ví dụ sai: *'She already left when I called her.'*. **Đúng:** *'She had already left when I called her.'*",
          "Nhầm quá khứ hoàn thành với hiện tại hoàn thành khi mốc quy chiếu là một thời điểm trong quá khứ chứ không phải hiện tại. Ví dụ sai: *'By the time he was 20, he has traveled to five countries.'*. **Đúng:** *'By the time he was 20, he had traveled to five countries.'*",
          "Lạm dụng quá khứ hoàn thành cho MỌI hành động trong quá khứ dù không cần thể hiện trình tự trước-sau, làm câu rối và sai nghĩa. Ví dụ sai: *'Yesterday I had gone to school and had met my friend.'* (hai việc diễn ra bình thường, không có việc nào cần nhấn mạnh là xảy ra trước việc kia). **Đúng:** *'Yesterday I went to school and met my friend.'*"
        ]
      }
    },
    "gerund-infinitive": {
      "id": "gerund-infinitive",
      "title": "Danh động từ & Động từ nguyên mẫu (Gerund vs Infinitive)",
      "level": "B1",
      "order": 12,
      "category": "word-classes",
      "theory": {
        "usages": [
          {
            "label": "Động từ CHỈ theo sau bởi V-ing (Gerund)",
            "explanationVi": "Một số động từ trong tiếng Anh luôn đòi hỏi động từ theo sau nó phải ở dạng V-ing (danh động từ), không bao giờ dùng to-V. Nhóm này gồm các động từ phổ biến sau: **enjoy** (thích), **avoid** (tránh), **finish** (hoàn thành xong), **mind** (phiền/ngại), **suggest** (đề nghị), **admit** (thừa nhận), **consider** (cân nhắc), **practice** (luyện tập), **imagine** (tưởng tượng), **risk** (liều lĩnh làm gì), **deny** (phủ nhận), **quit** (bỏ hẳn), **keep/keep on** (tiếp tục, cứ mãi làm gì). Học sinh cần ghi nhớ nhóm động từ này như một danh sách cố định vì không có quy tắc suy luận chung, chỉ có thể học thuộc qua luyện tập nhiều. Lưu ý: sau các động từ này TUYỆT ĐỐI không được dùng 'to + V nguyên mẫu'.",
            "examples": [
              {
                "en": "My little brother really enjoys playing video games after school.",
                "vi": "Em trai tôi rất thích chơi trò chơi điện tử sau giờ học."
              },
              {
                "en": "The manager suggested rescheduling the meeting to next Monday.",
                "vi": "Người quản lý đề nghị dời cuộc họp sang thứ Hai tuần sau."
              }
            ],
            "tagId": "gi-u1-gerund-only"
          },
          {
            "label": "Động từ CHỈ theo sau bởi to-V (Infinitive)",
            "explanationVi": "Ngược lại với nhóm trên, một số động từ luôn đòi hỏi động từ theo sau ở dạng to-V (động từ nguyên mẫu có 'to'), không bao giờ dùng V-ing trực tiếp. Nhóm này gồm: **want** (muốn), **decide** (quyết định), **promise** (hứa), **hope** (hy vọng), **agree** (đồng ý), **refuse** (từ chối), **plan** (lên kế hoạch), **offer** (đề nghị/ngỏ ý), **manage** (xoay xở làm được), **afford** (đủ khả năng), **learn** (học được cách), **seem** (dường như), **tend** (có xu hướng). Cũng giống nhóm V-ing, đây là danh sách cần học thuộc qua luyện tập vì không có quy tắc chung để suy ra. Lưu ý: sau các động từ này TUYỆT ĐỐI không được dùng V-ing trực tiếp làm tân ngữ.",
            "examples": [
              {
                "en": "She decided to apply for the scholarship before the deadline.",
                "vi": "Cô ấy quyết định nộp đơn xin học bổng trước hạn chót."
              },
              {
                "en": "They promised to finish the project by Friday afternoon.",
                "vi": "Họ hứa sẽ hoàn thành dự án trước chiều thứ Sáu."
              }
            ],
            "tagId": "gi-u2-infinitive-only"
          },
          {
            "label": "Động từ theo sau bởi CẢ HAI dạng, ý nghĩa gần như KHÔNG đổi",
            "explanationVi": "Một nhóm động từ khác có thể đứng trước cả V-ing lẫn to-V mà ý nghĩa của câu hầu như không thay đổi, chỉ khác đôi chút về sắc thái trang trọng hoặc thói quen sử dụng. Các động từ tiêu biểu: **start**, **begin** (bắt đầu), **continue** (tiếp tục), **like**, **love**, **hate** (thích/ghét), **prefer** (thích hơn). Ví dụ 'It started to rain' và 'It started raining' đều mang nghĩa 'Trời bắt đầu mưa', có thể dùng thay thế cho nhau trong hầu hết ngữ cảnh. Một lưu ý nhỏ: khi bản thân động từ chính đã ở dạng V-ing (ví dụ đang chia thì tiếp diễn: 'It is starting...'), người bản ngữ thường tránh lặp lại V-ing hai lần liên tiếp và ưu tiên dùng to-V, ví dụ 'It is starting to rain' nghe tự nhiên hơn 'It is starting raining'.",
            "examples": [
              {
                "en": "I like reading mystery novels before bed.",
                "vi": "Tôi thích đọc tiểu thuyết trinh thám trước khi đi ngủ."
              },
              {
                "en": "He began learning French when he was ten years old.",
                "vi": "Anh ấy bắt đầu học tiếng Pháp khi mười tuổi."
              }
            ],
            "tagId": "gi-u3-both-same-meaning"
          },
          {
            "label": "Động từ theo sau bởi CẢ HAI dạng nhưng Ý NGHĨA THAY ĐỔI HẲN",
            "explanationVi": "Đây là điểm ngữ pháp khó và hay xuất hiện trong đề thi nhất của chuyên đề này: một số động từ khi theo sau bởi V-ing và theo sau bởi to-V sẽ mang HAI NGHĨA HOÀN TOÀN KHÁC NHAU. **remember/forget + V-ing** = nhớ/quên một việc ĐÃ làm trong quá khứ (nhìn lại một ký ức); **remember/forget + to-V** = nhớ/quên phải làm một việc CẦN làm (nghĩa vụ ở hiện tại/tương lai). **stop + V-ing** = dừng hẳn, chấm dứt việc đang làm (bỏ luôn); **stop + to-V** = dừng một hành động lại ĐỂ làm việc khác (to-V ở đây là mệnh đề chỉ mục đích, không phải tân ngữ của 'stop'). **try + V-ing** = thử làm một cách nào đó xem kết quả ra sao (thử nghiệm); **try + to-V** = cố gắng, nỗ lực làm một việc khó khăn (có thể thành công hoặc thất bại). **regret + V-ing** = hối hận, lấy làm tiếc về một việc ĐÃ làm trong quá khứ; **regret + to-V** = lấy làm tiếc khi phải thông báo một tin gì đó (thường dùng trong văn phong trang trọng, thư từ, thông báo chính thức).",
            "examples": [
              {
                "en": "I remember meeting him at a conference in Chicago two years ago.",
                "vi": "Tôi nhớ là mình đã gặp anh ấy tại một hội nghị ở Chicago hai năm trước."
              },
              {
                "en": "Please remember to call the dentist and confirm your appointment.",
                "vi": "Hãy nhớ gọi cho nha sĩ để xác nhận lịch hẹn của bạn."
              },
              {
                "en": "He stopped smoking completely after his doctor's warning.",
                "vi": "Anh ấy đã bỏ hẳn hút thuốc sau lời cảnh báo của bác sĩ."
              },
              {
                "en": "We stopped to check the map because we were completely lost.",
                "vi": "Chúng tôi dừng lại để xem bản đồ vì bị lạc đường hoàn toàn."
              },
              {
                "en": "Try restarting your computer if the screen suddenly freezes.",
                "vi": "Hãy thử khởi động lại máy tính nếu màn hình đột nhiên bị đơ."
              },
              {
                "en": "We tried to fix the old printer for an hour but couldn't manage it.",
                "vi": "Chúng tôi đã cố gắng sửa chiếc máy in cũ trong một tiếng nhưng không xoay xở được."
              },
              {
                "en": "She regrets quitting her stable job at the bank last year.",
                "vi": "Cô ấy hối hận vì đã bỏ công việc ổn định tại ngân hàng năm ngoái."
              },
              {
                "en": "We regret to inform you that your application was not successful.",
                "vi": "Chúng tôi rất tiếc phải thông báo rằng đơn ứng tuyển của bạn không thành công."
              }
            ],
            "tagId": "gi-u4-both-different-meaning"
          },
          {
            "label": "V-ing bắt buộc sau giới từ (kể cả 'to' khi là giới từ) và các cấu trúc cố định với tính từ",
            "explanationVi": "Sau BẤT KỲ giới từ nào (in, on, at, about, for, of, without, before, after...) động từ theo sau luôn ở dạng V-ing, không bao giờ dùng to-V hay động từ nguyên thể. Điểm CỰC KỲ hay nhầm: trong một số cụm từ, chữ 'to' không phải là dấu hiệu của động từ nguyên mẫu mà đóng vai trò GIỚI TỪ, nên động từ theo sau nó vẫn phải chia V-ing. Các cụm tiêu biểu: **look forward to V-ing** (mong chờ), **be/get used to V-ing** (quen với việc gì), **object to V-ing** (phản đối), **be committed to V-ing** (cam kết với việc gì). PHẢI phân biệt rõ 'be used to V-ing' (trạng thái quen thuộc ở hiện tại) với cấu trúc hoàn toàn khác 'used to + V nguyên thể' (diễn tả một thói quen hoặc trạng thái đã từng xảy ra trong QUÁ KHỨ nhưng nay không còn nữa) — hai cấu trúc trông giống nhau nhưng ý nghĩa và cách chia động từ theo sau khác hẳn nhau. Ngoài ra, một số cấu trúc với tính từ cũng cần lưu ý: 'It is + adj + to V' (ví dụ It's important to save money) dùng to-V, trong khi 'be interested in V-ing', 'be good at V-ing', 'be afraid of V-ing' lại dùng V-ing vì có giới từ đứng trước.",
            "examples": [
              {
                "en": "She is interested in learning about ancient Roman history.",
                "vi": "Cô ấy quan tâm đến việc tìm hiểu về lịch sử La Mã cổ đại."
              },
              {
                "en": "After graduating, he looked forward to starting his new job.",
                "vi": "Sau khi tốt nghiệp, anh ấy mong chờ được bắt đầu công việc mới."
              },
              {
                "en": "I am used to working late at night now that I run my own business.",
                "vi": "Bây giờ khi tự kinh doanh, tôi đã quen với việc làm việc muộn vào ban đêm."
              },
              {
                "en": "I used to work late at night when I was in college, but not anymore.",
                "vi": "Hồi còn học đại học tôi từng làm việc muộn vào ban đêm, nhưng bây giờ thì không."
              },
              {
                "en": "It is important to drink enough water during hot weather.",
                "vi": "Việc uống đủ nước trong thời tiết nóng bức là điều quan trọng."
              },
              {
                "en": "He apologized for being late to the interview.",
                "vi": "Anh ấy xin lỗi vì đã đến muộn buổi phỏng vấn."
              }
            ],
            "tagId": "gi-u5-after-preposition"
          }
        ],
        "formulas": null,
        "signalWords": [
          {
            "word": "afford (to V)",
            "meaningVi": "đủ khả năng (thời gian/tiền bạc) để làm gì"
          },
          {
            "word": "manage (to V)",
            "meaningVi": "xoay xở và thành công làm được việc gì (thường khó khăn)"
          },
          {
            "word": "avoid (V-ing)",
            "meaningVi": "tránh, né việc làm gì"
          },
          {
            "word": "can't help + V-ing",
            "meaningVi": "không thể kìm được, không nhịn được việc làm gì"
          },
          {
            "word": "mind (V-ing)",
            "meaningVi": "phiền, ngại làm gì (thường dùng trong câu hỏi/phủ định)"
          },
          {
            "word": "consider (V-ing)",
            "meaningVi": "cân nhắc, xem xét việc làm gì"
          },
          {
            "word": "appreciate (V-ing)",
            "meaningVi": "đánh giá cao, biết ơn việc ai đó làm gì"
          },
          {
            "word": "would like/would love + to V",
            "meaningVi": "muốn/rất muốn làm gì trong một tình huống cụ thể (khác với like/love + V-ing chỉ sở thích chung)"
          },
          {
            "word": "spend/waste time + V-ing",
            "meaningVi": "dành/lãng phí thời gian làm gì"
          },
          {
            "word": "feel like + V-ing",
            "meaningVi": "cảm thấy muốn làm gì (thường dùng trong văn nói)"
          }
        ],
        "commonMistakes": [
          "Dùng to-V ngay sau giới từ thay vì V-ing, kể cả khi 'to' đóng vai trò giới từ trong các cụm cố định. Sai: *\"I am looking forward to see you soon.\"* ĐÚNG: \"I am looking forward to seeing you soon.\"",
          "Nhầm lẫn giữa 'be/get used to + V-ing' (quen với việc gì ở hiện tại) và 'used to + V nguyên thể' (thói quen trong quá khứ, nay đã chấm dứt). Sai: *\"She is used to work night shifts now.\"* ĐÚNG: \"She is used to working night shifts now.\" (còn \"She used to work night shifts\" lại mang nghĩa hoàn toàn khác — thói quen quá khứ đã kết thúc).",
          "Nhầm nghĩa của các động từ đổi nghĩa theo dạng V-ing/to-V như remember, stop, try, regret, dẫn đến hiểu sai hoàn toàn ý câu. Sai (hiểu nhầm ý định): *\"He stopped to smoke after the doctor's warning.\"* (câu này thực chất có nghĩa là 'anh ấy dừng lại để hút thuốc', trái ngược với ý muốn diễn đạt). ĐÚNG (bỏ hẳn thuốc lá): \"He stopped smoking after the doctor's warning.\"",
          "Dùng nhầm dạng V-ing cho các động từ chỉ đi với to-V (như want, decide, promise, agree...) hoặc ngược lại dùng to-V cho các động từ chỉ đi với V-ing (như enjoy, avoid, finish, suggest...). Sai: *\"I want going home now.\"* / *\"She suggested to leave early.\"* ĐÚNG: \"I want to go home now.\" / \"She suggested leaving early.\""
        ]
      }
    }
  }
};