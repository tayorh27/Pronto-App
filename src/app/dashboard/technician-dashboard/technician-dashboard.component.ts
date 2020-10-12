import { Jobs } from '../../model/jobs';
import { Component, OnInit, AfterViewInit, Input } from '@angular/core';
import 'firebase/firestore';
import 'firebase/database';
import * as firebase from 'firebase/app';
import { AdminUsersService } from '../../services/admin-users.service';
import { Statuses } from 'src/app/model/status';
import { MainCategory } from 'src/app/model/category';
import swal from 'sweetalert2';
import { AppConfig } from 'src/app/services/global.service';
import { HttpClient } from '@angular/common/http';
import { ProgressSpinnerComponent } from '../../progress-spinner/progress-spinner.module';
import { OverlayService } from '../../overlay/overlay.module';

declare const $: any

@Component({
  selector: 'app-technician-dashboard',
  templateUrl: './technician-dashboard.component.html'
})

export class TechnicianDashboardComponent implements OnInit {

  service = new AdminUsersService()
  config = new AppConfig()
  techStatus = false

  selectedJob: Jobs

  statuses: Statuses[] = []
  categories: MainCategory[] = []

  cancelPending = false
  cancelAssigned = false
  cancelProgress = false

  _note = ''

  constructor(private http: HttpClient, private previewProgressSpinner: OverlayService) {

  }

  getCurrentJob() {
    firebase.firestore().collection('jobs').where('back_end_status', '==', 'active').onSnapshot(query => {
      // query.forEach(data => {
      //   const job = <Jobs>data.data()
      // })
      if (query.size === 0) {
        return
      }
      this.selectedJob = <Jobs>query.docs[0].data()
    })
  }

  ngOnInit() {
    // this.config.sendSMS(this.http, '+2348100865962', 'Testing one two')
    const email = localStorage.getItem('email')
    this.service.getUserData(email).then(user => {
      this.techStatus = user.status === 'online'
      this.getStatus()
    })
  }

  getStatus() {
    firebase.firestore().collection('status').orderBy('name', 'desc').get().then(query => {
      this.statuses = []
      query.forEach(data => {
        const status = <Statuses>data.data()
        this.statuses.push(status)
      })
      this.getCategories()
    })
  }

  getStatusColorByName(name: string) {
    return this.statuses.find((val, ind, arr) => {
      return val.name === name
    }).color
  }

  getCategories() {
    firebase.firestore().collection('categories').orderBy('name', 'desc').onSnapshot(query => {
      this.categories = []
      query.forEach(data => {
        const category = <MainCategory>data.data()
        this.categories.push(category)
      })
      this.getCurrentJob()
    })
  }

  getCategoryNameById(id: string) {
    return this.categories.find((val, ind, arr) => {
      return val.id === id
    }).name
  }

  displayHTMLCategories(cats: string[]) {
    var html = '<ul>'
    cats.forEach(c => {
      const getCatName = this.getCategoryNameById(c)
      html += (getCatName === undefined) ? '' : `<li><strong>${getCatName}</strong></li>`
    })
    html += '</ul>'
    return html
  }

  toggleStatus() {
    const current_email = localStorage.getItem('email')
    const st = (this.techStatus) ? 'online' : 'offline'
    this.config.updateTechnicianStatus(current_email, st).then(d => {
      this.config.displayMessage('Updated successfully', false)
    })
  }

  /** button functions */
  cancelPendingJob() {
    this.cancelPending = !this.cancelPending
  }

  acceptPendingJob() {
    this.previewProgressSpinner.open({ hasBackdrop: true }, ProgressSpinnerComponent)
    this.config.updateJobStatus(this.http, 'Assigned', '', this.selectedJob).then(d => {
      this.previewProgressSpinner.close()
    })
  }

  submitCancelJob() {
    swal({
      title: 'Cancelation Alert',
      text: 'Are you sure about canceling this job?',
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, cancel it!',
      cancelButtonText: 'No, keep it',
      confirmButtonClass: "btn btn-success",
      cancelButtonClass: "btn btn-danger",
      buttonsStyling: false
    }).then((result) => {
      if (result.value) {
        if (this._note === '') {
          this.config.displayMessage('Enter your reasons', false)
          return
        }
        this.previewProgressSpinner.open({ hasBackdrop: true }, ProgressSpinnerComponent)
        this.config.updateJobStatus(this.http, 'Canceled', this._note, this.selectedJob).then(d => {
          this.previewProgressSpinner.close()
        })
      } else {
        swal({
          title: 'Cancelled',
          text: 'Cancelation not successful',
          type: 'error',
          confirmButtonClass: "btn btn-info",
          buttonsStyling: false
        }).catch(swal.noop)
      }
    })
  }

  cancelAssignedJob() {
    this.cancelAssigned = !this.cancelAssigned
  }

  acceptAssignedJob() {
    this.previewProgressSpinner.open({ hasBackdrop: true }, ProgressSpinnerComponent)
    this.config.updateJobStatus(this.http, 'In-Progress', '', this.selectedJob).then(d => {
      this.previewProgressSpinner.close()
    })
  }

  cancelProgressJob() {
    this.cancelProgress = !this.cancelProgress
  }

  completeJob() {
    this.previewProgressSpinner.open({ hasBackdrop: true }, ProgressSpinnerComponent)
    this.config.updateJobStatus(this.http, 'Pending Approval', '', this.selectedJob).then(d => {
      this.previewProgressSpinner.close()
    })
  }
}
