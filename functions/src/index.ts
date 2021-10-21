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

        const dt = res.data
        const _dt = dt["data"]

        const otp_body = {
            "otp": _dt["otp"],
            "number": _dt["number"],
            "last_id": _dt["last_id"]
        }

        return axios.post('https://9mobile.nativetalk.com.ng/api/signup/verify_otp', JSON.stringify(otp_body), { headers: _header }).then(_res => {
            response.send(_res.data);
        }).catch(err => {
            response.send(err);
        })



    }).catch(err => {
        response.send(err);
    })


});


export const getcalls = functions.https.onRequest(async (request, response) => {

    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Credentials", "true");
    response.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    response.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Authorization, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");

    const message = request.query

    const user = `${message.phone_login}` //get user uid from call

    const query = await admin.firestore().collection("proj-users").where("SIPexten", "==", user).get()

    if (query.size > 0) {
        const adminUser = query.docs[0].data()

        //save logs
        const key = (await admin.database().ref().push()).key
        const saveData = {
            id: key,
            params: request.query,
            body: request.body,
            header: request.headers,
            assigned_to: "none",
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            hasAccount: false,
            customer_email: "N/A",
            customer_name: "N/A",
            user: adminUser.id
        }

        if (key !== null)
            await admin.firestore().collection("proj-logs").doc(key).set(saveData)

        //get configurations
        const configQuery = await admin.firestore().collection("proj-users").doc(adminUser.id).collection("configs").doc("settings").get()

        if (configQuery.exists) {
            const config = configQuery.data()

            if (config !== undefined) {

                //check if zendesk config exists
                if (config.zendesk !== undefined) {
                    await createTicketForZendesk(config, adminUser.id, request.query)
                }

                //check if zoho config exists
                if (config.zoho !== undefined) {
                    await createTicketForZoho(config, adminUser.id, request.query)
                }

                //check if freshdesk config exists
                if (config.freshdesk !== undefined) {
                    await createTicketForFreshdesk(config, adminUser.id, request.query)
                }
            }

        }
    }
    response.send({ "message": "received" })
})

async function createTicketForZendesk(config: any, userId: any, data: any) {
    const zendesk_subdomain = config.zendesk_subdomain
    const zendesk_email = config.zendesk_email
    const zendesk_password = config.zendesk_password
    // const zendesk_token = config.zendesk_token

    const url = `${zendesk_subdomain}/api/v2/tickets.json`

    const header = {
        "Content-Type": "application/json",
        "Authorization": `${zendesk_email}:${zendesk_password}`
    }

    const body = {
        "ticket": {
            "comment": {
                "body": "The smoke is very colorful."
            },
            "priority": "urgent",
            "subject": "My printer is on fire!"
        }
    }

    const resp = await axios.post(url, body, { headers: header })
    const resData = resp.data

    console.log(resData)

    if (resData["ticket"]) {
        await admin.firestore().collection("proj-users").doc(userId).collection("configs").doc("tickets").update({
            zendesk: admin.firestore.FieldValue.increment(1)
        })
    }


}

async function createTicketForZoho(config: any, userId: any, data: any) {
    const zoho_orgId = config.zoho_orgId
    const zoho_auth = config.zoho_auth
    const zoho_departmentId = config.zoho_departmentId
    const zoho_assigneeId = config.assigneeId

    const url = 'https://desk.zoho.com/api/v1/tickets'

    const header = {
        "Content-Type": "application/json",
        "orgId": zoho_orgId,
        "Authorization": `Zoho-oauthtoken ${zoho_auth}`
    }

    const body = {
        // "entitySkills" : [ "18921000000379001", "18921000000364001", "18921000000379055", "18921000000379031" ],
        // "subCategory" : "Sub General",
        "cf": {
            "cf_permanentaddress": null,
            "cf_dateofpurchase": null,
            "cf_phone": null,
            "cf_numberofitems": null,
            "cf_url": null,
            "cf_secondaryemail": null,
            "cf_severitypercentage": "0.0",
            "cf_modelname": "F3 2017"
        },
        "productId": "",
        "contactId": "",
        "subject": "New Ticket",
        // "dueDate" : "",
        "departmentId": zoho_departmentId,
        "channel": "Api",
        "description": "",
        "language": "English",
        "priority": "High",
        "classification": "",
        "assigneeId": zoho_assigneeId,
        "phone": "",
        "category": "general",
        "email": "",
        "status": "Open"
    }

    const resp = await axios.post(url, body, { headers: header })
    const resData = resp.data

    console.log(resData)

    if (resData["ticketNumber"]) {
        await admin.firestore().collection("proj-users").doc(userId).collection("configs").doc("tickets").update({
            zoho: admin.firestore.FieldValue.increment(1)
        })
    }
}

async function createTicketForFreshdesk(config: any, userId: any, data: any) {
    const freshdesk_subdomain = config.freshdesk_subdomain
    const freshdesk_token =  config.freshdesk_token

    const url = `${freshdesk_subdomain}/api/v2/tickets`

    const header = {
        "Content-Type": "application/json",
        "yourapikey": freshdesk_token,
    }

    const body = { 
        "description": "Details about the issue...", 
        "subject": "Support Needed...", 
        "email": "tom@outerspace.com", 
        "priority": 3, 
        "status": 2,
        "source": 3,
        "phone": '',
        // "cc_emails": ["ram@freshdesk.com","diana@freshdesk.com"] 
    }

    const resp = await axios.post(url, body, { headers: header })
    const resData = resp.data

    console.log(resData)

    if (resData["priority"]) {
        await admin.firestore().collection("proj-users").doc(userId).collection("configs").doc("tickets").update({
            freshdesk: admin.firestore.FieldValue.increment(1)
        })
    }
}


export const detectcalls = functions.https.onRequest(async (request, response) => {

    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Credentials", "true");
    response.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    response.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Authorization, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");

    const key = (await admin.database().ref().push()).key
    const saveData = {
        id: key,
        params: request.query,
        body: request.body,
        header: request.headers,
        assigned_to: "none",
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        hasAccount: false,
        customer_email: "N/A",
        customer_name: "N/A",
    }


    if (request.query.phone_number !== undefined) {
        const query = await admin.firestore().collection('customers').where('phone', '==', `+234${request.query.phone_number}`).get()
        if (query.size > 0) {
            const data = query.docs[0].data()
            saveData.hasAccount = true
            saveData.customer_email = data["email"]
            saveData.customer_name = data["name"]
        }
        if (key !== null) {
            await admin.firestore().collection("incoming-calls").doc(key).set(saveData)
            response.send({ "message": "received" })
        }

    }
    response.send({ "message": "received" })

})

export const sendSMS = functions.https.onRequest(async (request, response) => {

    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Credentials", "true");
    response.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    response.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Authorization, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");

    const phoneNumber = `${request.query.number}`
    const smsText = `${request.query.text}`
    const type = `${request.query.type}`
    const email = `${request.query.email}`

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
            const res = await _sendNotification(tokenMsg, smsText, email)
            response.send(res)
        } else {
            response.send(JSON.stringify({ "message": "done" }))
        }

    } else {
        const sms = _sendSMS(`+${phoneNumber}`, smsText)
        await _sendNotification(tokenMsg, smsText, email)
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

async function _sendNotification(_token: string, smsText: string, _email: string) {
    const key = (await admin.database().ref().push()).key
    await admin.firestore().collection('notifications').doc(key ?? 'asdfghjkl').set({
        id: key,
        message: smsText,
        email: _email,
        read: false,
        created_date: `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
    })
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
    //.where('status', '==', 'Assigned')\
    return admin.firestore().collection('jobs').where('back_end_status', '==', 'active').where('status', '==', 'Pending').get().then(query => {

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
