const submitBtn = document.getElementById('submitBtn');
const userInput = document.getElementById('userInput');
const decisionImage = document.getElementById('decisionImage');
const reasonText = document.getElementById('reasonText');

const GROQ_API_KEY = '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'; // 🚨 正式部署請移除，改走後端 API

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
        temperature: 0.9
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

    // 設定圖片與訊息
    if (decision === '拒絕') {
      decisionImage.src = 'reject.png';
      reasonText.textContent = reason ; // 拒絕時顯示理由
    } else if (decision === '接受') {
      decisionImage.src = 'ok.png';
      reasonText.textContent = reason ; // 接受時顯示理由
    } else if (decision === '重新提問') {
      decisionImage.src = 'unknow.png';

      // 根據 AI 回覆生成「重新提問」的訊息
      const newPrompt = lines.find(line => line.startsWith('理由：')) || '';
      const dynamicMessage = newPrompt.replace('理由：', '').trim() || '請說明清楚情況敘述等等。';

      reasonText.textContent = dynamicMessage; // 重新提問時顯示動態訊息
    } else {
      decisionImage.src = ''; // fallback，防止出錯
      reasonText.textContent = 'AI 回覆異常，無法判斷。';
    }

  } catch (error) {
    console.error('發生錯誤：', error);
    reasonText.textContent = '抱歉，AI 回覆時發生錯誤，請稍後再試。';
  }
});
