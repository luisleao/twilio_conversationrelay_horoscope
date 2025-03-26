const { PRINTER_ADDRESS } = process.env;

const { ThermalPrinter, PrinterTypes, CharacterSet, BreakLine, CutOptions, breakLine } = require('node-thermal-printer');

const limitLine = (text, maxLineLength) => {
    let lines = [];
    let words = text.split(' ');
    let line = '';

    words.forEach(word => {
        if (line.length + word.length + (line ? 1 : 0) > maxLineLength) {
            lines.push(line.trim());
            line = '';
        }
        line += (line ? ' ' : '') + word;
    });

    if (line) lines.push(line); // Adiciona a última linha
    return lines; //.join('\n');
};



const print = async (firstImpression, firstName, name, previsionDate, sign, horoscope, userData) => {
    console.log('PRINTING...');
    

    let printer = new ThermalPrinter({
        type: PrinterTypes.EPSON,
        breakLine: BreakLine.CHARACTER,
        interface: PRINTER_ADDRESS,
        width: 46
    });

    if (!printer.isPrinterConnected()) {
        console.log('ERROR - COUPOM PRINTER NOT CONNECTED!!!');
        return false;
    } else {

        try {


            printer.alignCenter();
            await printer.printImage('./assets/twilio-logo.png');

            printer.newLine();
            printer.newLine();
            printer.newLine();
            

            printer.alignCenter();
            printer.setTextDoubleHeight();
            printer.println(`Horoscopo para`);
            printer.setTextQuadArea();
            printer.println(sign.toUpperCase());
            printer.newLine();
            printer.setTextDoubleWidth();
            printer.println(previsionDate);
            printer.newLine();
            printer.newLine();


            printer.alignLeft();
            printer.setTextNormal();
            // printer.println(limitLine(horoscope.message, 50));
            limitLine(horoscope.message.split('\n').join(' '), 45).forEach(line => {
                printer.println(line);
            });
            // printer.println(limitLine(horoscope.message, 45));
            printer.newLine();


            printer.alignCenter();
            printer.bold(true);
            printer.println('FRASE DO DIA');
            printer.setTextQuadArea();
            // printer.println(limitLine(horoscope.phrase_of_day, 25));
            limitLine(horoscope.phrase_of_day, 20).forEach(line => {
                printer.println(line);
            });

            printer.setTextNormal();
            printer.bold(false);
            printer.newLine();


            printer.alignCenter();
            printer.bold(true);
            printer.println('NÚMEROS DA SORTE');
            printer.setTextQuadArea()
            printer.println(horoscope.lottery);

            printer.setTextNormal();
            printer.bold(false);
            printer.newLine();


            printer.alignCenter();
            printer.bold(true);
            printer.println('COR DA SORTE');
            printer.setTextQuadArea();
            printer.println(horoscope.luckyColor);


            printer.setTextNormal();
            printer.bold(false);
            printer.newLine();


            printer.newLine();
            printer.newLine();
            printer.newLine();


            printer.alignCenter();
            printer.printQR('https://github.com/luisleao/twilio_conversationrelay_horoscope', { // https://wa.me/551150393737?text=Teste
                cellSize: 8,             // 1 - 8
                correction: 'M',         // L(7%), M(15%), Q(25%), H(30%)
                model: 3                 // 1 - Model 1
                                         // 2 - Model 2 (standard)
                                         // 3 - Micro QR
            });
            printer.println('Conheça como fui desenvolvida\nlendo este QR Code!')
            printer.newLine();
            printer.newLine();
            printer.cut();



            if (userData && firstImpression) {
                printer.alignCenter();
                printer.printQR(userData, { // https://wa.me/551150393737?text=Teste
                    cellSize: 6,             // 1 - 8
                    correction: 'M',         // L(7%), M(15%), Q(25%), H(30%)
                    model: 3                 // 1 - Model 1
                                             // 2 - Model 2 (standard)
                                             // 3 - Micro QR
                });
    
                printer.alignLeft();
                printer.newLine();
                printer.setTextDoubleWidth();
                printer.bold(true);
                printer.println(name.toUpperCase());
                printer.bold(false);
                printer.println(sign);
                printer.newLine();
                printer.newLine();
                printer.newLine();
                printer.cut();
    
            }

            printer.execute(err => {
                if (err) throw err;
            });

            return true;

        } catch (error) {
            console.error('ERROR PRINTING', error);
            return false;
        }
    }

}

const printCredential = async (name, userData) => {
    console.log();
    console.log();
    console.log();
    console.log('PRINTING CREDENTIAL...');
    console.log('NAME', name);
    console.log('USER DATA', userData);
    console.log();
    console.log();
    console.log();
    
    
    let printer = new ThermalPrinter({
        type: PrinterTypes.EPSON,
        breakLine: BreakLine.WORD,
        interface: PRINTER_ADDRESS,
        width: 46
    });

    if (!printer.isPrinterConnected()) {
        console.log('ERROR - COUPOM PRINTER NOT CONNECTED!!!');
        return false;
    } else {

        try {

            if (userData) {
                printer.alignCenter();
                printer.printQR(userData, { // https://wa.me/551150393737?text=Teste
                    cellSize: 6,             // 1 - 8
                    correction: 'M',         // L(7%), M(15%), Q(25%), H(30%)
                    model: 3                 // 1 - Model 1
                                             // 2 - Model 2 (standard)
                                             // 3 - Micro QR
                });
    
                printer.setTextDoubleWidth();
                printer.println(name.toString().toUpperCase());
                printer.newLine();
                printer.cut();
    
            }

            printer.execute(err => {
                if (err) throw err;
            });

            return true;

        } catch (error) {
            console.error('ERROR PRINTING', error);
            return false;
        }
    }


}

module.exports = { print, printCredential };