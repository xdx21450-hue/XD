const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Hızlı Sistem Aktif! 0.3s Aralıklı Gönderim Modu Çalışıyor.");
});

app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda aktif.`);
});

const tokensRaw = process.env.TOKENS; 
const channelId = process.env.CHANNEL_ID;
const message = process.env.MESSAGE1;

if (!tokensRaw || !channelId || !message) {
    console.error("HATA: Değişkenler eksik!");
} else {
    const tokenList = tokensRaw.split(",").map(t => t.trim());

    // AYARLAR
    const cycleTime = 8000; // Toplam döngü (8 saniyede bir başa döner)
    const staggerDelay = 300; // İSTEDİĞİN AYAR: Her bot arası 0.3 saniye (300ms)

    console.log(`Hız modu: ${tokenList.length} bot, ${staggerDelay}ms aralıkla ateşleyecek.`);

    tokenList.forEach((token, index) => {
        // Hesaplama: 1. bot (0*300=0ms), 2. bot (1*300=300ms), 3. bot (2*300=600ms)...
        const initialOffset = index * staggerDelay;

        setTimeout(() => {
            // İlk tetikleme
            sendMessage(token, index + 1);

            // Her 8 saniyede bir aynı hızda tekrarla
            setInterval(() => {
                sendMessage(token, index + 1);
            }, cycleTime);

            console.log(`[Bot ${index + 1}] Aktifleşti (Gecikme: ${initialOffset}ms)`);
        }, initialOffset);
    });
}

async function sendMessage(token, botNum) {
    try {
        await axios.post(
            `https://discord.com/api/v9/channels/${channelId}/messages`,
            { content: message },
            { headers: { Authorization: token } }
        );
        console.log(`[Bot ${botNum}] Mesaj Gönderildi.`);
    } catch (err) {
        if (err.response?.status === 429) {
            console.error(`[Bot ${botNum}] ⚠️ Hız Sınırı! (Discord engelledi)`);
        } else {
            console.error(`[Bot ${botNum}] ❌ Hata: ${err.response?.status}`);
        }
    }
}
