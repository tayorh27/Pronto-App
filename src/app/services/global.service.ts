import swal from "sweetalert2";
import * as firebase from "firebase/app";
import 'firebase/firestore'
import 'firebase/database'

export class AppConfig {
    constructor(){}//singleton
    displayMessage(msg:string, success:boolean) {
        swal({
            title: msg,
            buttonsStyling: false,
            confirmButtonClass: (!success) ? "btn btn-danger" : "btn btn-success"
        }).catch(swal.noop)
    }

    logActivity(message:string) {
        const key = firebase.database().ref().push().key
        firebase.firestore().collection('logs').doc(key).set({
            'id':key,
            'log':message,
            'created_date': `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,
            'timestamp': firebase.firestore.FieldValue.serverTimestamp()
        })
    }
}