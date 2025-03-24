const { PRINTER_ADDRESS } = process.env;

const { ThermalPrinter, PrinterTypes, CharacterSet, BreakLine, CutOptions, breakLine } = require('node-thermal-printer');


const print = async (firstImpression, firstName, name, previsionDate, sign, horoscope, userData) => {
    console.log('PRINTING...');
    

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


            printer.alignCenter();
            await printer.printImage('./assets/twilio-logo.png');

            printer.newLine();
            printer.newLine();
            printer.newLine();

            let description, highlights, price;
            
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
            printer.println(horoscope.message);
            printer.newLine();
            printer.alignCenter();
            printer.bold(true);
            printer.println('NÚMEROS DA SORTE');
            printer.setTextQuadArea()
            printer.println(horoscope.lottery);

            printer.setTextNormal();
            printer.bold(false);
            printer.newLine();

            printer.bold(true);
            printer.println('FRASE DO DIA');
            printer.setTextQuadArea();
            printer.println(horoscope.phrase_of_day);

            printer.setTextNormal();
            printer.bold(false);
            printer.newLine();

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
                printer.setTextNormal();
                printer.newLine();
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

module.exports = { print };