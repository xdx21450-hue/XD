const express = require('express');
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Bot calisiyor!");
});

app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda aktif.`);
});

const token = process.env.TOKEN;
const channelId = process.env.CHANNEL_ID;
const message = process.env.MESSAGE;

// Süreyi 5 saniyeden 10 saniyeye çıkarıyoruz (Engeli aşmak için)
const DELAY = 10000; 

if (!token || !channelId || !message) {
    console.error("HATA: TOKEN, CHANNEL_ID veya MESSAGE eksik!");
} else {
    // Döngüyü başlat
    startLoop();
}

async function startLoop() {
    while (true) {
        try {
            // 1. Yazıyor efekti
            await axios.post(`https://discord.com/api/v9/channels/${channelId}/typing`, {}, {
                headers: { "Authorization": token }
            });

            // 2. 2 saniye bekle
            await new Promise(r => setTimeout(r, 2000));

            // 3. Mesajı gönder
            await axios.post(`https://discord.com/api/v9/channels/${channelId}/messages`, {
                content: message
            }, {
                headers: {
                    "Authorization": token,
                    "Content-Type": "application/json"
                }
            });

            console.log(`✅ Mesaj gitti: ${new Date().toLocaleTimeString()}`);
            
            // Başarılı olursa 10 saniye bekle
            await new Promise(r => setTimeout(r, DELAY));

        } catch (err) {
            if (err.response?.status === 429) {
                console.log("⏳ Çok hızlı gidiyorsun! 30 saniye mola veriliyor...");
                await new Promise(r => setTimeout(r, 30000)); // Rate limit yersen 30 saniye dur
            } else {
                console.error("❌ Hata oluştu (Cloudflare veya IP engeli olabilir). 10 saniye sonra tekrar denenecek.");
                await new Promise(r => setTimeout(r, 10000));
            }
        }
    }
}
