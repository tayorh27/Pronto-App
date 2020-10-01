import swal from "sweetalert2";
import * as firebase from "firebase/app";
import 'firebase/firestore'
import 'firebase/database'
// import * as Twilio from 'twilio'
import { environment } from "src/environments/environment";
import { HttpClient } from "@angular/common/http";
import { Jobs } from "../model/jobs";
import { JobActivity } from "../model/activity";

// const accountSid = environment.twilioSID
// const authToken = environment.twilioTOKEN
// const client = Twilio(accountSid, authToken)
// const twilioNumber = '(218) 506-5155'
//+12185065155


export class AppConfig {

    constructor() { }//singleton

    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

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

    // validE164(num: string) {
    //     return /^\*?[1-9]\d{1, 14}$/.test(num)
    // }

    sendSMS(http: HttpClient, phoneNumber: string, body: string) {
        return http.get(`https://us-central1-prontoappl.cloudfunctions.net/sendSMS?number=${phoneNumber}&text=${body}`).subscribe()
    }

    async updateJobStatus(http: HttpClient, status: string, reasons: string, selectedJob: Jobs) {
        const current_email = localStorage.getItem('email')
        const current_name = localStorage.getItem('name')

        if (status.toLowerCase() === 'canceled') {
            await this.updateTechnicianStatus(current_email, 'online')
        } else {
            await this.updateTechnicianStatus(current_email, 'offline')
        }

        firebase.firestore().collection('jobs').doc(selectedJob.id).update({
            'status': status
        }).then(async d => {
            //add job activity
            const id = firebase.database().ref().push().key
            const act: JobActivity = {
                id: id,
                comment: `This job status was changed from ${selectedJob.status} to : ${status} by the technician.`,
                action: reasons,
                created_date: `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            }
            firebase.firestore().collection('jobs').doc(selectedJob.id).collection('activities').doc(id).set(act).then(d => {
                this.logActivity(`${current_name}|${current_email} updated job status from ${selectedJob.status} to : ${status}`)
                // this.displayMessage('Status updated successfully', true)
                this.sendSMS(http, selectedJob.agent.phone, `This job status was changed from ${selectedJob.status} to : ${status} by the technician for job id - ${selectedJob.job_id}`)
                if (status.toLowerCase() === 'completed' || status.toLowerCase() === 'canceled' || status.toLowerCase() === 'cancelled') {
                    location.href = '/dashboard'
                }

            }).catch(err => {
                this.displayMessage(`${err}`, false)
            })
        }).catch(err => {
            this.displayMessage(`${err}`, false)
        })
    }

    async updateTechnicianStatus(email: string, status: string) {
        await firebase.firestore().collection('users').doc(email).update({
            'status': status
        })
    }

}