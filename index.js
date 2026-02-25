const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

// UptimeRobot için Web Arayüzü
app.get("/", (req, res) => {
  res.send("Sistem Aktif! Tek kanal ve tek mesaj modu çalışıyor.");
});

app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda aktif.`);
});

// Render Environment Variables
const tokensRaw = process.env.TOKENS; 
const channelId = process.env.CHANNEL_ID;
const message = process.env.MESSAGE1;

// Değişken Kontrolü
if (!tokensRaw || !channelId || !message) {
    console.error("HATA: TOKENS, CHANNEL_ID veya MESSAGE1 eksik!");
} else {
    const tokenList = tokensRaw.split(",").map(t => t.trim());

    // Döngü: 8 Saniye (8000ms)
    const cycleTime = 8000; 
    const staggerDelay = cycleTime / tokenList.length; 

    console.log(`${tokenList.length} bot tek kanala mesaj göndermek için hazır.`);

    tokenList.forEach((token, index) => {
        const initialOffset = index * staggerDelay;

        setTimeout(() => {
            // İlk Mesaj
            sendMessage(token, index + 1);

            // Periyodik Döngü
            setInterval(() => {
                sendMessage(token, index + 1);
            }, cycleTime);

            console.log(`[Bot ${index + 1}] Kuyruğa girdi.`);
        }, initialOffset);
    });
}

// Mesaj Gönderme Fonksiyonu
async function sendMessage(token, botNum) {
    try {
        await axios.post(
            `https://discord.com/api/v9/channels/${channelId}/messages`,
            { content: message },
            { headers: { Authorization: token } }
        );
        console.log(`[Bot ${botNum}] Mesaj başarıyla gönderildi.`);
    } catch (err) {
        if (err.response?.status === 429) {
            console.error(`[Bot ${botNum}] ⚠️ Rate Limit (Hız Sınırı)!`);
        } else {
            console.error(`[Bot ${botNum}] ❌ Hata: ${err.response?.status}`);
        }
    }
}
