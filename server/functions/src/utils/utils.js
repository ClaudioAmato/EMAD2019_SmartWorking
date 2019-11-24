const firebase = require("firebase/app");
require("firebase/firestore")
const nodemailer = require('nodemailer');
const cors = require('cors')({origin: true});

const db = firebase.firestore();

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'smartworking.unisa@gmail.com',
        pass: 'SWunisa2019'
    }
});


module.exports = {  

    'sortDates': function sortDates(dates) {
        let sortedDates = dates.sort(first, second => {
                        
            const data_1 = new Date(parseInt(first.anno), parseInt(first.mese), parseInt(first.giorno));
            const data_2 = new Date(parseInt(second.anno), parseInt(second.mese), parseInt(second.giorno));
    
            if (data_1.getTime() < data_2.getTime()) {
            return -1;
            } else if (data_1.getTime() > data_2.getTime()){
            return 1;
            } else {
            return  0;
            } 

        })

        return sortedDates;
    },

    'getWeekNumber': function getWeekNumber(elem) {
    const d = new Date(Date.UTC(parseInt(elem.anno), parseInt(elem.mese), parseInt(elem.giorno)));

    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);

    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));

    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    },

    'areValidDates': function areValidDates(dates) {
        let week = 0;
        let occurrences = 0;
        let flag = true;

        for(i = 0; i < dates.length; i++) {

            week = getWeekNumber(dates[i])

            for(j = 0; j < dates.length; j++) {
                if (j == i)
                    continue;
                
                else {
                    if (week == getWeekNumber(dates[j]))
                        occurrences++;
                }
            }

            if (occurrences > 2) {
                flag = false

                break;

            } else {

                occurrences = 0
            }
        }

        return flag;
    },

    'addDates': function addDates(dates, uid, batch) {
        let doc;

        dates.forEach(elem => {
            doc = db.collection("SmartWorking").doc();

            batch.set(doc, {
                giorno: elem.giorno,
                mese: elem.mese,
                anno: elem.anno,
                dipendente: uid
            })
        })
    },

    'createSmartWorkingCalendarForEmail': function createSmartWorkingCalendarForEmail(dates) {
        let s = "";

        for(i = 0; i < dates.length; i++) {
            date = dates[i].giorno + "/" + dates[i].mese + "/" + dates[i].anno
            s = s 
            + "<div style=\"display: flex; flex-direction: row; align-items: center; justify-content: center;\">"
            + "<img style=\"width: 30px; height: 30px;\" src=\"https://firebasestorage.googleapis.com/v0/b/smart-working-5f3ea.appspot.com/o/calendar.png?alt=media&token=9d32b1a0-e195-4768-9fae-af0e6d0eec59\" />"
            + "<p style=\"font-size: 18px; margin-left: 15px; font-weight: bold;\">"+ date +"</p>"
            + "</div>"
        }

        return "<div style=\"display: flex; flex-direction: column;\"" + s + "</div"
    },

    'sendEmail': function sendEmail(uid, request, response, dates) {

        db.collection('Dipendente').doc(uid).get().then(document => {
            
            cors(request, response, () => {
        
                const mailOptions = {
                    from: 'Amministratore Smart Working<smartworking.unisa@gmail.com>',
                    to: document.data().email,
                    subject: 'Piano di Smart Working',
                    html: "<p style=\"font-size: 16px;\">Ciao " + document.data().nome + " " + document.data().cognome + ",</p>" 
                    + "<p style=\"font-size: 16px;\">ecco il tuo piano di Smart Working per il prossimo mese:</p>" 
                    + "<br /> "
                    + "<div style=\"display: flex; flex-direction: column;\"" 
                    + this.createSmartWorkingCalendarForEmail(dates)
                    + "<br /> "
                    + "<p style=\"font-size: 16px;\">Cordiali saluti,</p>"
                    + "<p style=\"font-size: 16px;\">il team Smart Working</p>"
                    + "</div>"

                };
                                    
                return transporter.sendMail(mailOptions, (error, info) => {
                    if(error){

                        return response.send({hasError: true, error: error.message});

                    } else {

                        return response.send({hasError: false});
                    }
                });
            });  

        }).catch(error => response.send({hasError: true, error: error.message}))

    }

}