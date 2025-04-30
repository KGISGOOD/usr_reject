// 獲取 DOM 元素
const submitBtn = document.getElementById('submitBtn');
const userInput = document.getElementById('userInput');
const decisionImage = document.getElementById('decisionImage');
const reasonText = document.getElementById('reasonText');
const rejectImagesInput = document.getElementById('rejectImages');
const acceptImagesInput = document.getElementById('acceptImages');

// 儲存使用者上傳的圖片 URL
let rejectImageUrls = [];
let acceptImageUrls = [];

// 處理「上傳照片」按鈕點擊，觸發隱藏的檔案輸入框
document.querySelectorAll('.upload-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = btn.previousElementSibling; // 獲取對應的隱藏 input
    input.click(); // 觸發檔案選擇
  });
});

// 監聽拒絕圖片上傳
rejectImagesInput.addEventListener('change', (event) => {
  rejectImageUrls = Array.from(event.target.files).map(file => URL.createObjectURL(file));
  const status = event.target.nextElementSibling.nextElementSibling; // 獲取 .file-status
  status.textContent = rejectImageUrls.length > 0 
    ? `已選擇 ${rejectImageUrls.length} 個檔案` 
    : '未選擇檔案';
});

// 監聽接受圖片上傳
acceptImagesInput.addEventListener('change', (event) => {
  acceptImageUrls = Array.from(event.target.files).map(file => URL.createObjectURL(file));
  const status = event.target.nextElementSibling.nextElementSibling; // 獲取 .file-status
  status.textContent = acceptImageUrls.length > 0 
    ? `已選擇 ${acceptImageUrls.length} 個檔案` 
    : '未選擇檔案';
});

// 🚨 部署時務必移除 API 金鑰
const GROQ_API_KEY = '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';

// 處理提交按鈕點擊
submitBtn.addEventListener('click', async () => {
  const userText = userInput.value.trim();
  if (!userText) {
    alert('請輸入您的煩惱。');
    return;
  }

  reasonText.textContent = 'AI 正在思考中...';
  decisionImage.src = '';

  // 強化 Prompt 格式要求
  const prompt = `
你是一個幫助人們判斷是否應該拒絕他人請求的助手，風格幽默且判斷寬鬆但專業。
請根據使用者的描述，判斷是否應該拒絕，並提供詳細理由。
❗請「只用以下兩行格式」回覆，並「必須逐行開頭為『建議：』與『理由：』」：
建議：（接受 / 拒絕 / 重新提問）
理由：（請具體描述原因，風格可以幽默但需合理）
請用繁體中文回答。

使用者描述：${userText}
`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192',
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.9
      })
    });

    const data = await response.json();

    if (!data.choices || !data.choices[0]?.message?.content) {
      reasonText.textContent = 'AI 回覆格式異常，請稍後再試。';
      return;
    }

    const aiReply = data.choices[0].message.content;
    console.log('AI 原始回覆：', aiReply); // ✅ 建議開發時保留

    // 正則表達式擷取建議與理由
    const decisionMatch = aiReply.match(/建議[:：]?\s*(接受|拒絕|重新提問)/);
    const reasonMatch = aiReply.match(/理由[:：]?\s*(.+)/);

    const decision = decisionMatch ? decisionMatch[1] : '未知';
    const reason = reasonMatch ? reasonMatch[1].trim() : '未提供理由。';

    // 顯示圖片與理由
    if (decision === '拒絕') {
      decisionImage.src = rejectImageUrls.length > 0
        ? rejectImageUrls[Math.floor(Math.random() * rejectImageUrls.length)]
        : 'reject.png';
      reasonText.textContent = reason;

    } else if (decision === '接受') {
      decisionImage.src = acceptImageUrls.length > 0
        ? acceptImageUrls[Math.floor(Math.random() * acceptImageUrls.length)]
        : 'ok.png';
      reasonText.textContent = reason;

    } else if (decision === '重新提問') {
      decisionImage.src = 'unknow.png';
      reasonText.textContent = reason;

    } else {
      decisionImage.src = '';
      reasonText.textContent = 'AI 回覆異常，無法判斷。';
    }

  } catch (error) {
    console.error('發生錯誤：', error);
    reasonText.textContent = '抱歉，AI 回覆時發生錯誤，請稍後再試。';
  }
});