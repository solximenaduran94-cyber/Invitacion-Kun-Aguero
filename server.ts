import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'rsvps.json');

app.use(express.json());

// Ensure data directory and file exist with initial content
const initialRSVPs = [
  {
    id: 'messi-10',
    name: 'Leo Messi 🐐',
    attending: true,
    foodChoice: 'asado',
    customMessage: '¡Confirmado de una, Kun! Llevo el fernet y el mate. Vamo a comer un buen asadito y metemos play. Abrazo, pa.',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    kunReplyText: '¡Qué grande el capitán! Espectacular pa, de una. Traé el fernet que el asado lo pago yo, bueno vamo a jugá!'
  },
  {
    id: 'ibai-twitch',
    name: 'Ibai Llanos 🎮',
    attending: true,
    foodChoice: 'burger',
    customMessage: '¡Madre mía Sergio! Confirmadísimo. Pero poné buen Wifi en esa mansión que me conozco tus directos y se nos cae el stream entero.',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    kunReplyText: 'Jaja gordo trolo poné fibra en tu casa, acá corre a tres mil megas pa. Te espero con unas buenas burguer, GG!'
  },
  {
    id: 'coscu-army',
    name: 'Coscu ⚡',
    attending: true,
    foodChoice: 'asado',
    customMessage: 'Clave de ruta Kun, obvio que voy. ¿Sale torneo de Valorant nocturno? Nivel 38 es histórico.',
    timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
    kunReplyText: '¡Es buenísimo che! Sale torneo, te juego con una mano sola y te gano igual. Nos vemos ahí, pa.'
  }
];

function getRSVPs(): any[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(initialRSVPs, null, 2), 'utf-8');
      return initialRSVPs;
    }
    const content = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error reading RSVPs file:', error);
    return initialRSVPs;
  }
}

function saveRSVP(rsvp: any) {
  try {
    const list = getRSVPs();
    list.unshift(rsvp); // Add newest first
    fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving RSVP:', error);
  }
}

// REST API
app.get('/api/rsvps', (req, res) => {
  const rsvps = getRSVPs();
  res.json(rsvps);
});

app.post('/api/rsvps', async (req, res) => {
  const { name, attending, foodChoice, customMessage } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Falta el nombre' });
  }

  const newRSVP: any = {
    id: `guest-${Date.now()}`,
    name,
    attending: !!attending,
    foodChoice: foodChoice || 'none',
    customMessage: customMessage || '',
    timestamp: new Date().toISOString()
  };

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
    try {
      console.log('Using Gemini API to generate Kun reply...');
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      // Step 1: Generate Text Reply
      const prompt = `Act as Sergio 'Kun' Agüero, the famous former Argentine soccer player and streamer. 
A friend named "${name}" is RSVP'ing to your 38th birthday party.
Here are their invitation RSVP details:
- Attendance: ${attending ? 'CONFIRMED' : 'DECLINED/CANNOT ATTEND'}
- Selected food: ${foodChoice}
- Personal message to you: "${customMessage}"

Write a message as Sergio 'Kun' Agüero responding to them in your authentic, friendly, casual Twitch streamer Argentine Spanish.
Keep it extremely short (exactly 1 or 2 sentences).
Use typical slangs and phrases like "bueno vamo a jugá", "espectacular pa", "mirá vos", "che", "GG", "viste".
Be hilarious. If they chosen veggies joke about grass, if asado hype it up, if burguer represent gamer food. If they declined, banter about why they can't attend. Stay positive and funny. Do not be overly polite or generic.`;

      const textResponse = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt
      });

      const replyText = textResponse.text?.trim() || `¡Qué grande ${name}! Espectacular che, nos vemos en la partida, bueno vamo a jugá!`;
      newRSVP.kunReplyText = replyText;

      // Step 2: Generate TTS Speech
      try {
        console.log('Generating voice-over from Kun...');
        // Let's shorten it slightly for fast speech generation
        const ttsPrompt = `Say this cheerfully in Spanish as a quick casual audio greeting: ${replyText}`;
        const ttsResponse = await ai.models.generateContent({
          model: "gemini-3.1-flash-tts-preview",
          contents: [{ parts: [{ text: ttsPrompt }] }],
          config: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Kore' } // 'Kore' sounds good and sporty
              }
            }
          }
        });

        const audioBase64 = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (audioBase64) {
          newRSVP.kunReplyAudio = audioBase64;
          console.log('Successfully generated voice-over audio.');
        }
      } catch (ttsErr) {
        console.error('Error generating voice audio with Gemini:', ttsErr);
      }

    } catch (geminiError) {
      console.error('Error calling Gemini API:', geminiError);
      newRSVP.kunReplyText = getDefaultKunReply(name, attending, foodChoice);
    }
  } else {
    console.log('No Gemini API Key found. Returning mock reply.');
    newRSVP.kunReplyText = getDefaultKunReply(name, attending, foodChoice);
  }

  saveRSVP(newRSVP);
  res.json(newRSVP);
});

function getDefaultKunReply(name: string, attending: boolean, food: string): string {
  if (!attending) {
    return `¡Noooo ${name}! ¿Cómo no vas a venir, pa? Te caíste del stream, malísimo che. Desconectado.`;
  }
  let foodComment = '';
  if (food === 'asado') foodComment = '¡Un asadito bien argentino, de una, pa!';
  else if (food === 'burger') foodComment = '¡Gamer de alma con su hamburguesa, espectacular!';
  else if (food === 'veggie') foodComment = '¿Veggie? Jaja bue, te compramos un pastito, espectacular de todos modos che.';
  
  return `¡Eeeh qué grande, ${name}! Reservado tu slot de la partida en nivel 38. ${foodComment} ¡Bueno vamo a jugá!`;
}

// Mount Vite middleware in development, or serve built assets in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
