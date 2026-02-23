const express = require('express');
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Bot aktif ve Render üzerinde çalışıyor!");
});

app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda dinleniyor.`);
});

const token = process.env.TOKEN;
const channelId = process.env.CHANNEL_ID;
const message = process.env.MESSAGE;

if (!token || !channelId || !message) {
    console.error("HATA: Environment (gizli değişkenler) bölümünde TOKEN, CHANNEL_ID veya MESSAGE eksik!");
} else {
    // Her 5 saniyede bir ana fonksiyonu çalıştırır
    setInterval(handleFlow, 5000);
}

async function handleFlow() {
    try {
        // 1. "Yazıyor..." efektini başlat
        await axios.post(`https://discord.com/api/v9/channels/${channelId}/typing`, {}, {
            headers: { "Authorization": token }
        });

        // 2. Kısa bir süre bekle (İnsansı bir görünüm için 1.5 saniye)
        await new Promise(r => setTimeout(r, 1500));

        // 3. Mesajı gönder
        await axios.post(`https://discord.com/api/v9/channels/${channelId}/messages`, {
            content: message
        }, {
            headers: {
                "Authorization": token,
                "Content-Type": "application/json"
            }
        });

        console.log(`✅ Mesaj ve Yazıyor efekti başarıyla gönderildi: "${message}"`);
    } catch (err) {
        console.error("❌ Hata oluştu:", err.response?.status, err.response?.data);
    }
}
