import { Component, OnInit, OnDestroy } from "@angular/core";
import { AppConfig } from "../../services/global.service";
import * as firebase from "firebase/app"
import 'firebase/firestore';
import 'firebase/database';
import swal from "sweetalert2";
import { OverlayService } from '../../overlay/overlay.module';
import { ProgressSpinnerComponent } from '../../progress-spinner/progress-spinner.module';
import { Statuses } from "src/app/model/status";
import { AdminUsersService } from "src/app/services/admin-users.service";

declare interface TableData {
    headerRow: string[];
    footerRow: string[];
    dataRows: string[][];
}

@Component({
    selector: 'app-status',
    templateUrl: './status.component.html',
    styleUrls: ['./status.component.css']
})

export class StatusComponent implements OnInit, OnDestroy {

    public tableData: TableData;

    statuses: Statuses[] = []
    config = new AppConfig()
    data: string[][] = []
    closeResult = ''

    isAddEdit = false
    isAdding = false
    currentStatus: Statuses

    st_name = ''
    st_color = ''

    button_pressed = false

    service = new AdminUsersService();
    role = ''

    constructor(private previewProgressSpinner: OverlayService) {
        // this.tableData = {
        //     headerRow: ['#', 'Image', 'Title', 'Actions'],
        //     dataRows: this.data
        // };
    }


    ngOnDestroy() {

    }

    getStyle(color:any) {
        let st = {
          'background': `${color}`,
          'width': '20px',
          'height': '20px',
          'border-radius': '10px'
        }
        return st
    }

    getStatus() {
        firebase.firestore().collection('status').orderBy('timestamp', 'desc').onSnapshot(query => {
            this.data = []
            this.statuses = []
            var index = 0
            query.forEach(data => {
                const status = <Statuses>data.data()
                this.statuses.push(status)
                this.data.push([status.id, status.name, status.color, status.created_date, status.modified_date, status.created_by, 'btn-link'])
                index = index + 1

            })

            this.tableData = {
                headerRow: ['Name', 'Color', 'Created Date', 'Modified Date', 'Actions'],
                footerRow: ['Name', 'Color', 'Created Date', 'Modified Date', 'Actions'],
                dataRows: this.data
            };

        });
    }

    ngOnInit() {
        const email = localStorage.getItem('email');
        this.service.getUserData(email).then(user => {
            this.role = user.role
            this.getStatus()
        })
    }

    addStatus() {
        this.isAddEdit = true
        this.isAdding = true
    }

    cancelStatus() {
        this.isAddEdit = false
        this.isAdding = false
        this.button_pressed = false
        this.clearFields()
    }

    clearFields() {
        this.currentStatus = null
        this.st_color = ''
        this.st_name = ''
    }

    editStatus(id: any) {
        this.isAddEdit = true
        this.isAdding = false
        this.currentStatus = this.statuses.find((val, ind, arr) => {
            return val.id === id
        })
        this.st_name = this.currentStatus.name
        this.st_color = this.currentStatus.color
    }

    deleteStatus(st: any) {
        const id = st[0]
        const name = st[1]
        swal({
            title: 'Delete Alert',
            text: 'Are you sure about deleting this status?',
            type: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, keep it',
            confirmButtonClass: "btn btn-success",
            cancelButtonClass: "btn btn-danger",
            buttonsStyling: false
        }).then((result) => {
            if (result.value) {
                firebase.firestore().collection('status').doc(id).delete().then(del => {
                    const current_email = localStorage.getItem('email')
                    const current_name = localStorage.getItem('name')
                    this.config.logActivity(`${current_name}|${current_email} deleted this staus: ${name}`)
                    this.config.displayMessage("Successfully deleted", true);
                }).catch(err => {
                    this.config.displayMessage(`${err}`, false);
                })
            } else {
                swal({
                    title: 'Cancelled',
                    text: 'Deletion not successful',
                    type: 'error',
                    confirmButtonClass: "btn btn-info",
                    buttonsStyling: false
                }).catch(swal.noop)
            }
        })
    }

    async submitStatus() {
        if (this.st_name === '' || this.st_color === '') {
            this.config.displayMessage("Please enter all fields.", false)
            return
        }

        this.button_pressed = true
        const key = (this.isAdding) ? firebase.database().ref().push().key : this.currentStatus.id
        const current_email = localStorage.getItem('email')
        const current_name = localStorage.getItem('name')

        if (this.isAdding) {
            const st: Statuses = {
                id: key,
                name: this.st_name,
                color: this.st_color,
                created_by: `${current_name}|${current_email}`,
                created_date: `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,
                modified_date: `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            }
            firebase.firestore().collection('status').doc(key).set(st).then(d => {
                this.config.logActivity(`${current_name}|${current_email} created this status: ${this.st_name}`)
                this.cancelStatus()
                this.config.displayMessage('Successfully created', true)
              }).catch(err => {
                this.button_pressed = false
                this.config.displayMessage(`${err}`, false)
              })
        }else {
            const st: Statuses = {
                name: this.st_name,
                color: this.st_color,
                modified_date: `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`
            }
            firebase.firestore().collection('status').doc(key).update(st).then(d => {
                this.config.logActivity(`${current_name}|${current_email} updated this status: ${this.st_name}`)
                this.cancelStatus()
                this.config.displayMessage('Successfully updated', true)
              }).catch(err => {
                this.button_pressed = false
                this.config.displayMessage(`${err}`, false)
              })
        }

    }
}