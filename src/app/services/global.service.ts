import swal from "sweetalert2";
import * as firebase from "firebase/app";
import 'firebase/firestore'
import 'firebase/database'

const twilio = require('twilio');
const accountSid = firebase.firestore.config().twilio.sid
const authToken = firebase.firestore.config().twilio.token
const client = new twilio(accountSid, authToken);
const twilioNumber = '(279) 205-4373'


export class AppConfig {
    constructor() { }//singleton
    displayMessage(msg: string, success: boolean) {
        swal({
            title: msg,
            buttonsStyling: false,
            confirmButtonClass: (!success) ? "btn btn-danger" : "btn btn-success"
        }).catch(swal.noop)
    }

    logActivity(message: string) {
        const key = firebase.database().ref().push().key
        firebase.firestore().collection('logs').doc(key).set({
            'id': key,
            'log': message,
            'created_date': `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,
            'timestamp': firebase.firestore.FieldValue.serverTimestamp()
        })
    }

    /**
   * Returns the value of a particular url parameter key
   * @param sParam 
   * @returns string
   */
    getUrlParameter(sParam: string) {
        const sPageURL = window.location.search.substring(1) //get the url parameter
        const sURLVariables = sPageURL.split('&')
        var sParameterName: string[], i: number;

        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');

            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? null : decodeURIComponent(sParameterName[1]);
            }
        }
    }
    validE164(num) {
        return /^\*?[1-9]\d{1, 14}$/.test(num)
    }
    exports.textStatus = firebase.database.ref('/orders/{orderKey}/status').onUpdate(event => {
        const orderKey = event.params.orderKey

        return admin.database().ref(`/orders/${orderKey}`).once("value").then(snapshot => snapshot.val()).then(order => {
            const stauts = order.stauts
            const phoneNumber = order.phoneNumber


            if (!validE164(phoneNumber)) {
                throw new Error('number must be E164 format!')
            }

            const textMessage = {
                body: `Current order status: ${status}`,
                to: phoneNumber,
                from: twilioNumber
            }

            return client.messages.create(textMessage)
        }).then(Message => console.log(message.sid, 'succes'))
            .catch(err => console.log(err))
    });

}