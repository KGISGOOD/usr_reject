const submitBtn = document.getElementById('submitBtn');
const userInput = document.getElementById('userInput');
const decisionImage = document.getElementById('decisionImage');
const reasonText = document.getElementById('reasonText');

// 儲存使用者上傳的圖片 URL
let rejectImageUrls = [];
let acceptImageUrls = [];

document.getElementById('rejectImages').addEventListener('change', (event) => {
  rejectImageUrls = Array.from(event.target.files).map(file => URL.createObjectURL(file));
});

document.getElementById('acceptImages').addEventListener('change', (event) => {
  acceptImageUrls = Array.from(event.target.files).map(file => URL.createObjectURL(file));
});

const GROQ_API_KEY = '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'; // 🚨 部署時移除

submitBtn.addEventListener('click', async () => {
  const userText = userInput.value.trim();
  if (!userText) {
    alert('請輸入您的煩惱。');
    return;
  }

  reasonText.textContent = 'AI 正在思考中...';
  decisionImage.src = '';

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
          {
            role: 'system',
            content: '你是一個幫助人們判斷是否應該拒絕他人請求的助手。請根據使用者的描述，判斷是否應該拒絕，並提供理由。請用「建議：接受/拒絕/重新提問」和「理由：...」這兩行格式回覆。'
          },
          {
            role: 'user',
            content: userText
          }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();
    if (!data.choices || !data.choices[0]?.message?.content) {
      reasonText.textContent = 'AI 回覆格式異常，請稍後再試。';
      return;
    }

    const aiReply = data.choices[0].message.content;
    const lines = aiReply.split('\n');
    const decisionLine = lines.find(line => line.startsWith('建議：')) || '';
    const reasonLine = lines.find(line => line.startsWith('理由：')) || '';

    const decision = decisionLine.includes('拒絕') ? '拒絕'
                  : decisionLine.includes('接受') ? '接受'
                  : decisionLine.includes('重新提問') ? '重新提問'
                  : '未知';

    const reason = reasonLine.replace('理由：', '').trim();

    // 顯示圖片與理由
    if (decision === '拒絕') {
      if (rejectImageUrls.length > 0) {
        const randomIndex = Math.floor(Math.random() * rejectImageUrls.length);
        decisionImage.src = rejectImageUrls[randomIndex];
      } else {
        decisionImage.src = 'reject.png';
      }
      reasonText.textContent = reason || '未提供理由。';

    } else if (decision === '接受') {
      if (acceptImageUrls.length > 0) {
        const randomIndex = Math.floor(Math.random() * acceptImageUrls.length);
        decisionImage.src = acceptImageUrls[randomIndex];
      } else {
        decisionImage.src = 'ok.png';
      }
      reasonText.textContent = reason || '未提供理由。';

    } else if (decision === '重新提問') {
      decisionImage.src = 'unknow.png';
      reasonText.textContent = reason || '請說明清楚情況敘述等等。';
    } else {
      decisionImage.src = '';
      reasonText.textContent = 'AI 回覆異常，無法判斷。';
    }

  } catch (error) {
    console.error('發生錯誤：', error);
    reasonText.textContent = '抱歉，AI 回覆時發生錯誤，請稍後再試。';
  }
});
