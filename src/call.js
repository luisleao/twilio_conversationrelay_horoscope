// require('dotenv').config();

const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } = process.env;
const { getFirstName } = require('./util/converter');


const {
    VOICE,
    WELCOME_GREETING,
    WELCOME_GREET_LANGUAGE,
    TRANSCRIPTION_LANGUAGE,
    INTERRUPTIBLE,
    DTMF_DETECTION
} = process.env;


const twilio = require('twilio');
const account = new twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

const makeCall = (to, name, userData, SERVER) => {
    console.log(`Calling ${to}...`);
    console.log('SERVER', SERVER);

    const twiml = new twilio.twiml.VoiceResponse();
    const connect = twiml.connect({
        action: `${SERVER}/connect`,
    });
    const conversationrelay = connect.conversationRelay({
        url: `wss://${SERVER.split('https://')[1]}`,
        welcomeGreeting: WELCOME_GREETING, //.replace('{name}', getFirstName(name)), 
        welcomeGreetingLanguage: WELCOME_GREET_LANGUAGE,
        transcriptionLanguage: TRANSCRIPTION_LANGUAGE,
        voice: VOICE, //'es-US-Journey-F', //'fr-FR-Journey-F', //'fr-CA-Journey-F',
        interruptible: INTERRUPTIBLE,
        dtmfDetection: DTMF_DETECTION,
        // transcriptionProvider: 'Deepgram',
        // ttsProvider: 'Amazon', voice: 'Vitoria-Neural',
    });
    conversationrelay.parameter({
        'name': 'name',
        'value': name
    });
    conversationrelay.parameter({
        'name': 'fistName',
        'value': getFirstName(name)
    });
    conversationrelay.parameter({
        'name': 'userData',
        'value': userData
    });

    console.log();
    console.log(twiml.toString());

    account.calls.create({
        to,
        from: TWILIO_PHONE_NUMBER,
        twiml: twiml.toString()
    }).then(call => console.log(call.sid));

} 

module.exports = { makeCall };