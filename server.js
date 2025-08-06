const express = require('express')
const cors = require('cors')
const { default: makeWASocket, useSingleFileAuthState } = require('@whiskeysockets/baileys')
const qrcode = require('qrcode')
const { state, saveState } = useSingleFileAuthState('./auth_info.json')

let sock;
let qrData = "";

async function connectToWhatsApp() {
    sock = makeWASocket({ auth: state });
    sock.ev.on('creds.update', saveState)

    sock.ev.on('connection.update', async (update) => {
        const { qr, connection } = update
        if (qr) {
            qrData = await qrcode.toDataURL(qr) // QR को base64 image में बदलते हैं
        }
        if (connection === 'open') {
            console.log('✅ WhatsApp connected!')
        }
    })
}

connectToWhatsApp()

const app = express();
app.use(cors());
app.use(express.json());

// API to get QR
app.get('/get-qr', (req, res) => {
    if (!qrData) return res.json({ status: 'waiting', message: 'QR code generating...' })
    res.json({ status: 'success', qr: qrData })
})

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
