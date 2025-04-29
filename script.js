const submitBtn = document.getElementById('submitBtn');
const userInput = document.getElementById('userInput');
const decisionImage = document.getElementById('decisionImage');
const reasonText = document.getElementById('reasonText');

const GROQ_API_KEY = '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'; // 切勿公開部署

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
            content: '你是一個幫助人們判斷是否應該拒絕他人請求的助手。請根據使用者的描述，判斷是否應該拒絕，並提供理由。請用「建議：接受/拒絕」和「理由：...」這兩行格式回覆。'
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
    const aiReply = data.choices[0].message.content;

    const [decisionLine, reasonLine] = aiReply.split('\n');
    const decision = decisionLine.includes('拒絕') ? '拒絕' : '接受';
    const reason = reasonLine.replace('理由：', '').trim();

    decisionImage.src = decision === '拒絕' ? 'reject.png' : 'ok.png';
    reasonText.textContent = reason;

  } catch (error) {
    console.error('發生錯誤：', error);
    reasonText.textContent = '抱歉，AI 回覆時發生錯誤，請稍後再試。';
  }
});