import * as functions from 'firebase-functions';

import * as admin from 'firebase-admin'
import * as Twilio from 'twilio'

const token = 'e7345006e1b1d5b2c8cc5c225c19af1f'//functions.config().twilio.token
const sid = 'ACbba7700d9e323157f85057848904a325'//functions.config().twilio.sid

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

function getDateDiff(dateString: string) {
    var today = new Date();
    var expiry = new Date(dateString)
    return today.getTime() - expiry.getTime()
}

export const CheckJobsStatus = functions.pubsub.schedule('').timeZone('').onRun(context => {

    admin.firestore().collection('jobs').where('back_end_status', '==', 'active').where('status', '==', 'Pending')
        .where('status', '==', 'Assigned').get().then(query => {

            if (query.empty) {
                return
            }
            const batch = admin.firestore().batch()

            const sms: any[] = []

            query.forEach(dt => {
                const job = dt.data()

                const job_created_date = job.created_date

                const job_status = job.status

                const diff = new Date(getDateDiff(job_created_date)).getMinutes()

                if (diff >= 30) {
                    sms.push({
                        number: job.agent.number,
                        status: job_status,
                        id: job.job_id,
                        technician: job.assigned_to.name
                    })
                    const ref = admin.firestore().collection('jobs').doc(job.id)
                    const update = { 'status': 'OverDue' }
                    batch.update(ref, update)
                }
            })

            batch.commit().then(d => {
                sms.forEach(s => {
                    const message = `This job with job id - ${s.id} has been changed from ${s.status} to OverDue since the assigned technician (${s.technician}) has not performed any action.`
                    _sendSMS(s.number, message)
                })
            })
        })
})
