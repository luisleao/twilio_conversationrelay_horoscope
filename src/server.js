
require('dotenv').config();



const { TWILIO_NUMBER_TO_CALL, PORT, GEMINI_API_KEY } = process.env;
const { NGROK_ACTIVE, NGROK_TOKEN, NGROK_SUBDOMAIN } = process.env;

const { decodeBase64ToJson, getFirstName } = require('./util/converter');
const { makeCall } = require('./call');
const { print } = require('./printer');

const { GoogleGenerativeAI } = require('@google/generative-ai');



let SERVER = '';
const ngrok = require('ngrok');


const {
    VOICE,
    WELCOME_GREETING,
    WELCOME_GREET_LANGUAGE,
    TRANSCRIPTION_LANGUAGE,
    INTERRUPTIBLE,
    DTMF_DETECTION
} = process.env;



const { SerialPort }  = require('serialport');
const { type } = require('os');
   
console.log('starting...');
(async () => {

    const qrPort = await SerialPort.list().then(ports => {
        ports = ports.filter(p => p.vendorId == '1a86');
        if (ports.length > 0) {
            return ports[0]
        }
        return null;
    });
    if (!qrPort) return;
    
    console.log('PORT FOUND', qrPort);
    const port = new SerialPort({
        path: qrPort.path,
        baudRate: 57600
    });

    port.on('data', async function (data) {

        const userData = data.toString().substring(-2).trim();

        const userDataJson = decodeBase64ToJson(userData);
        console.log('userDataJson', userDataJson);
        if (userDataJson && userDataJson.memberNome) {
            // TODO: make a Twilio call using ConversationRelay and the greeting including the first name

            // const welcomeGreeting = `Olá ${getFirstName(userDataJson.memberNome)}, soy Luzia del Destino! Me cuente cuando nasceu que voy te ajudar a descobrir su futuro.`
            const welcomeGreeting = `Olá ${getFirstName(userDataJson.memberNome)}, me chamo Luzia del Destino! Me conte quando nasceu que vou te ajudar a descobrir seu futuro.`
            console.log('Nome:', userDataJson.memberNome, '\n\n', welcomeGreeting.split('{name}').join(getFirstName(userDataJson.memberNome)));
            makeCall(
                TWILIO_NUMBER_TO_CALL, 
                userDataJson.memberNome,
                userData,
                SERVER
            );
        }
        console.log('userData', userDataJson);

    });

    console.log('SYSTEM STARTED!');
    console.log();
})()






const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const twilio = require('twilio');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });


// Middleware to parse JSON bodies
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// WebSocket connection handler
wss.on('connection', (ws) => {
    console.log('WebSocket connection established');

    async function printHoroscope(firstImpression, previsionDate, firstName, sign, horoscope) {
        console.log(`Printing horoscope for ${firstName} (${sign})\n\n${horoscope}\nFirst: ${firstImpression}`);
        
        return {
            printed: await print(
                firstImpression,
                firstName, 
                ws.params.customParameters.name ?? '',
                previsionDate,
                sign, 
                horoscope, 
                ws.params.customParameters.userData ?? null)
        };
    }
    
    const printHoroscopeFunctionDeclaration = {
        name: "printHoroscope",
        parameters: {
            type: "OBJECT",
            description: "Print a horoscope for a given person and sign.",
            properties: {
                firstImpression: {
                    type: "BOOLEAN",
                    description: "This is the first impression the user requested to print the horoscope. Default = true",
                },
                previsionDate: {
                    type: "STRING",
                    description: "Prevision date in the format 'DD/MM/YYYY'.",
                },
                firstName: {
                    type: "STRING",
                    description: "The first name of the person.",
                },
                sign: {
                    type: "STRING",
                    description: "The zodiac sign of the person in Portuguese without accentuation.",
                },
                horoscope: {
                    type: "OBJECT",
                    properties: {
                        "message": {"type": "string", "description": "The full detailed horoscope text. Add new lines without breaking words on every 45 characters."},
                        "lottery": {"type": "string", "description": "The lottery numbers for the day, 6 numbers in total from 1 to 60 in the format '00-00-00-00-00-00'."},
                        "luckyNumber": {"type": "number", "description": "The lucky number for the day."},
                        "luckyColor": {"type": "string", "description": "The lucky color for the day."},
                        "phrase_of_day": {"type": "string", "description": "The phrase of the day. Add new lines without breaking words on every 22 characters"}
                    }

                }
            },
            required: ["firstImpression", "previsionDate", "firstName", "sign", "horoscope"],
        },
    };
      
      // Put functions in a "map" keyed by the function name so it is easier to call
    const functions = {
        printHoroscope: ({ firstImpression, previsionDate, firstName, sign, horoscope }) => {
            return printHoroscope(firstImpression, previsionDate, firstName, sign, horoscope);
        }
    };

    
    /*
        Utilize gênero neutro nas respostas, a não ser que esteja claro o gênero baseado no nome.
    */
    const SYSTEM_INSTRUCTION = `Você é ZorAIde, uma cartomante pronta para prever o futuro de pessoas participando do TDC Summit (TDC corresponde a The Developer's Conference).
        Somente responda em português, inclusive em todos os parâmetros das funções!
        NUNCA fale o nome completo da pessoa, apenas o primeiro nome. NUNCA repita sobre quem é você e o que faz.

        O evento acontece nos dias 26 e 26 de março de 2025 e hoje é dia 26 de março de 2025. Você deve inicialmente criar a previsão para o data de hoje, porém é possível que a pessoa solicite previsões para outros dias.

        A pessoa pode informar a data de nascimento ou o signo para receber uma previsão do futuro para o dia de hoje.

        Você está interagindo com uma pessoa pelo telefone, portanto seja mais breve e direta possível. A cada nova interação, sempre finalize a conversa com uma pergunta para manter a interação.

        Ao responder a previsão por voz seja simples e forneça apenas a mensagem de previsão e nada mais. As demais informações e o formato mais completo da previsão só devem ser enviadas na função de impressão.
        Você pode responder qualquer pergunta que seja relacionada a horóscopo, astrologia ou previsões do futuro e nada mais. Se você não souber a resposta, você pode dizer que não sabe ou que não pode responder.
        Quando fizer sua previsão, você pode oferecer para imprimir o horóscopo da pessoa.
        Se ela aceitar, você deve dizer que vai imprimir o horóscopo, chamar a função 'printHoroscope'. O parâmetro 'horoscope.message' deve ser completo, com pelo menos 200 caracteres e deve quebrar de linha a cada 45 caracteres, mesmo que a frase seja mais longa que isso. O parâmetro horoscope.phrase_of_day deve quebrar de linha a cada 22 caracteres, mesmo que a frase seja mais longa que isso.

        A pessoa deve dizer o primeiro nome. Se ela não disser, você pode perguntar. Quando ela responder, não fale novamente sobre você e seja direta sobre o horóscopo e algum dado que precise.
        Seja sempre gentil e educada. Quando confirmar a impressão, pergunte se a pessoa deseja mais alguma coisa.

        Ao gerar o horóscopo impresso, liste com mais detalhes as previsões para o dia de hoje.

        A pessoa pode solicitar mais de um horóscopo impresso, então você deve estar pronta para atender a solicitação e fazer a impressão especificamente para cada signo solicitado, neste caso NÃO PERGUNTE o nome da pessoa e faça a impressão direta e não ser que a pessoa peça para falar o horóscopo.
        Se a pessoa disser o nome no início, se apresente e fale sobre você faz antes de continuar, porém seja breve e pergunte qual signo ou a data de nascimento da pessoa.`
    


    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.0-flash',
        systemInstruction: SYSTEM_INSTRUCTION, //.split('{name}').join(personName),
        tools: {
            functionDeclarations: [
                printHoroscopeFunctionDeclaration
            ],
        },
    });

    const chat = model.startChat();


    console.log('MODEL INSTRUCTION', JSON.stringify(model.systemInstruction));

    ws.on('message', async (data) => {
        const message = JSON.parse(data);
        switch(message.type) {
            case 'setup':
                console.log('SETUP', message)
                ws.params = message;
                const personName = message.customParameters && message.customParameters.name ? message.customParameters.name : null;

                if (personName) {
                    // Me conte quando nasceu que vou te ajudar a descobrir seu futuro.
                    const resultSetup = await chat.sendMessage(`Me chamo ${personName}.`);
                    ws.send(JSON.stringify({ 
                        type: 'text',
                        token: resultSetup.response.text(),
                        last: true
                    }));
                    console.log('> ', resultSetup.response.text());

                } else {

                    ws.send(JSON.stringify({ 
                        type: 'text',
                        token: `Olá, me chamo ZorAIde, a cartomante feita por IA para o TDC Summit São Paulo! Eu ainda não sei o seu nome. Como você se chama?`,
                        last: true
                    }));

                }

                break;

            case 'interrupt':
                console.log('Interruption:', message);
                // TODO: handle interruption
                // TODO: if Gemini is running a tool, it needs to stop

                // ws.send(JSON.stringify({ 
                //     type: 'text',
                //     token: 'me desculpe',
                //     last: true
                // }));

                // ws.send(JSON.stringify({
                //     "type": "play",
                //     "source": "https://api.twilio.com/cowbell.mp3",
                //     "loop": 1,
                //     "preemptible": true                      
                // }));

                break;

            case 'prompt':
                console.log('Prompt:', message.voicePrompt);
                const result = await chat.sendMessage(message.voicePrompt);

                console.log('RESULT', result);
                console.log('\n\n\n\n\n\n\n\n');

                const calls = await result.response.functionCalls();                
                if (calls && calls.length > 0) {

                    console.log('CALLs', calls);
                    const call = calls[0];


                    // Call the executable function
                    const apiResponse = await functions[call.name](call.args);
                    console.log('API RESPONSE', apiResponse);
                    
                    // Send the API response back to the model
                    const result2 = await chat.sendMessage([{functionResponse: {
                        name: call.name,
                        response: apiResponse
                    }}]);
                    
                    ws.send(JSON.stringify({ 
                        type: 'text',
                        token: result2.response.text(),
                        last: true
                    }));
                    console.log('> ', result2.response.text());
    
                } else {
                    ws.send(JSON.stringify({ 
                        type: 'text',
                        token: result.response.text(),
                        last: true
                    }));
                    console.log('> ', result.response.text());

                }

                break;

            case 'dtmf':
                console.log('DTMF:', message);
                break;

            default:
                console.log('Unknown event:', message);
        }
        console.log();

    });

    ws.on('close', () => {
        console.log('WebSocket connection closed');
        console.log(ws.params);
        console.log();
    });
});


/* END MESSAGE
    {
    "type": "end",
    "handoffData": "{\"reasonCode\":\"live-agent-handoff\", \"reason\": \"The caller wants to talk to a real person\"}"
    }

    // handoffData optional

*/


app.post('/connect', (req, res) => {
    console.log();
    console.log();
    console.log('Received connect action'), req.body;
    console.log();
    console.log();
    res.status(200).end();
});



// POST request handler
app.post('/', (req, res) => {
    const twiml = new twilio.twiml.VoiceResponse();
    const connect = twiml.connect({
        action: `${SERVER}/connect`,
    });
    const conversationrelay = connect.conversationRelay({
        url: `wss://${SERVER.split('https://')[1]}`,
        welcomeGreeting: WELCOME_GREETING, //.split('{nome}').join('desconhecido'), 
        welcomeGreetingLanguage: WELCOME_GREET_LANGUAGE,
        transcriptionLanguage: TRANSCRIPTION_LANGUAGE,
        voice: VOICE,
        interruptible: INTERRUPTIBLE,
        dtmfDetection: DTMF_DETECTION,

    });

    // conversationrelay.parameter({
    //     name: 'foo',
    //     value: 'bar'
    // });
    
    res.type('text/xml');
    res.send(twiml.toString());

});

server.listen(PORT, async () => {
    console.log(`Server is running on http://localhost:${PORT}`);

    SERVER = `https://demoleao.sa.ngrok.io`;

    if (NGROK_ACTIVE) {

        SERVER = await ngrok.connect({ authtoken: NGROK_TOKEN, addr: PORT, subdomain: NGROK_SUBDOMAIN });
        
        console.log('URL:', SERVER);
    }
});


const finish = async () => {
    console.log('Server closing...');
    await server.close();
    if (NGROK_ACTIVE) {
        await ngrok.kill();
    }
    process.exit();
}
// detect server close
process.on('SIGINT', finish);

// detect server close
process.on('SIGTERM', finish);