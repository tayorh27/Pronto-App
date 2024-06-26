import * as functions from 'firebase-functions';

import * as admin from 'firebase-admin'
import * as Twilio from 'twilio'

import axios from 'axios'

const token = 'e7345006e1b1d5b2c8cc5c225c19af1f'//functions.config().twilio.token
const sid = 'ACbba7700d9e323157f85057848904a325'//functions.config().twilio.sid

const client = Twilio(sid, token)

const twilioNumber = '+12185065155' //'(218) 506-5155'

admin.initializeApp()

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//

export const cloudpbx = functions.https.onRequest(async (request, response) => {

    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Credentials", "true");
    response.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    response.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Authorization, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");

    const getBody = request.body

    const _header = {
        "Content-Type": "application/json",
        "x-auth-token": "mzFxYakJRhZ8e6nEqMnhvLBVsVpFVj"
    }

    return axios.post('https://9mobile.nativetalk.com.ng/api/signup', getBody, { headers: _header }).then(res => {
        // console.log(res.data)
        response.send(res.data);
    }).catch(err => {
        // console.log(err)
        response.send(err);
    })


});

export const sendSMS = functions.https.onRequest(async (request, response) => {

    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Credentials", "true");
    response.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    response.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Authorization, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");

    const phoneNumber = `${request.query.number}`
    const smsText = `${request.query.text}`
    const type = `${request.query.type}`

    var tokenMsg = request.header("tokenMsg")
    if (tokenMsg === undefined) {
        tokenMsg = ''
    }

    if (type === 'sms') {
        const sms = _sendSMS(`+${phoneNumber}`, smsText)
        if (sms !== undefined) {
            response.send(sms)
        } else {
            response.send(JSON.stringify({ "message": "failed" }))
        }
    } else if (type === 'notification') {
        if (tokenMsg !== '') {
            const res = await _sendNotification(tokenMsg, smsText)
            response.send(res)
        } else {
            response.send(JSON.stringify({ "message": "done" }))
        }

    } else {
        const sms = _sendSMS(`+${phoneNumber}`, smsText)
        await _sendNotification(tokenMsg, smsText)
        if (sms !== undefined) {
            response.send(sms)
        }
    }

});

function _sendSMS(phoneNumber: string, smsText: string) {
    // if (!validE164(phoneNumber)) {
    //     return JSON.stringify({
    //         'type': 'error',
    //         'message': 'Invalid phone number'
    //     })
    // }

    const textMessage = {
        body: smsText,
        to: phoneNumber,
        from: twilioNumber
    }

    client.messages.create(textMessage)
        .then(message => {
            return JSON.stringify({
                'num': phoneNumber,
                'type': 'success',
                'message': message.toJSON()
            })
        })
        .catch(err => {
            return JSON.stringify({
                'num': phoneNumber,
                'type': 'error',
                'message': `${err}`
            })
        })
    return null
}

async function _sendNotification(_token: string, smsText: string) {
    const payload = {
        notification: {
            title: `Message from Pronto`,
            body: smsText,
            click_action: ''
        }
    }
    const ids = _token.split(',')
    const res = await admin.messaging().sendToDevice(ids, payload)
    console.log(res.results)
    return JSON.stringify({ "message": "sent" })
}

// function validE164(num: string) {
//     return /^\*?[1-9]\d{1, 14}$/.test(num)
// }

function getDateDiff(dateString: string) {
    var today = new Date();
    var expiry = new Date(dateString)
    return today.getTime() - expiry.getTime()
}
//*/30 * * * *
export const CheckJobsStatus = functions.pubsub.schedule('every 30 minutes').onRun(context => {

    return admin.firestore().collection('jobs').where('back_end_status', '==', 'active').where('status', '==', 'Pending')
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

            return batch.commit().then(d => {
                sms.forEach(s => {
                    const message = `This job with job id - ${s.id} has been changed from ${s.status} to OverDue since the assigned technician (${s.technician}) has not performed any action.`
                    _sendSMS(s.number, message)
                })
            })
        })
})
