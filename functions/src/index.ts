import * as functions from 'firebase-functions';

import * as admin from 'firebase-admin'
import * as Twilio from 'twilio'

const token = functions.config().twilio.token
const sid = functions.config().twilio.sid

const client = Twilio(token, sid)

const twilioNumber = '+12185065155' //'(218) 506-5155'

admin.initializeApp()

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//


export const sendSMS = functions.https.onRequest((request, response) => {

    const phoneNumber = `${request.query.number}`
    const smsText = `${request.query.text}`

    const sms = _sendSMS(phoneNumber, smsText)

    if (sms !== undefined) {
        response.send(sms)
    }

});

function _sendSMS(phoneNumber: string, smsText: string) {
    if (!validE164(phoneNumber)) {
        return JSON.stringify({
            'type': 'error',
            'message': 'Invalid phone number'
        })
    }

    const textMessage = {
        body: smsText,
        to: phoneNumber,
        from: twilioNumber
    }

    client.messages.create(textMessage)
        .then(message => {
            return JSON.stringify({
                'type': 'success',
                'message': message.toJSON()
            })
        })
        .catch(err => {
            return JSON.stringify({
                'type': 'error',
                'message': `${err}`
            })
        })
    return null
}

function validE164(num: string) {
    return /^\*?[1-9]\d{1, 14}$/.test(num)
}
