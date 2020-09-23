import swal from "sweetalert2";
import * as firebase from "firebase/app";
import 'firebase/firestore'
import 'firebase/database'

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
}