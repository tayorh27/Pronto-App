import { Component, OnInit } from '@angular/core';
import { Jobs } from './../model/jobs';
import * as firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/database';
import * as $ from 'jquery';
import 'datatables.net';
import 'datatables.net-bs4';
import { AppConfig } from '../services/global.service';
import swal from 'sweetalert2';
import { AdminUsersService } from '../services/admin-users.service';
import { Statuses } from '../model/status';
import { MainCategory } from '../model/category';




declare interface DataTable {
  headerRow: string[];
  footerRow: string[];
  dataRows: string[][];
}
@Component({
  selector: 'app-add-job',
  templateUrl: './add-job.component.html',
  styleUrls: ['./add-job.component.css']
})
export class AddJobComponent implements OnInit {

  public dataTable: DataTable;
  data: string[][] = []
  jobs: Jobs[] = []
  statuses: Statuses[] = []
  categories: MainCategory[] = []

  currentJobRow: any

  selectedJob: Jobs

  viewJob = false

  config = new AppConfig()
  button_pressed = false

  service = new AdminUsersService();
  role = ''

  constructor() {
  }

  getJob() {
    firebase.firestore().collection('jobs').orderBy('timestamp', 'desc').onSnapshot(query => {
      this.data = []
      this.jobs = []
      var index = 0
      query.forEach(data => {
        const job = <Jobs>data.data()
        this.jobs.push(job)
        this.data.push([job.id, job.assigned_to.name, job.customer.name, job.customer.email, job.status, job.created_by, job.created_date, job.modified_date, this.displayHTMLCategories(job.category), 'btn-link'])
        index = index + 1
      })

      this.dataTable = {
        headerRow: ['Assigned To', 'Customer', 'Job Request', 'Status', 'Created By', 'Created Date', 'Modified Date', 'Actions'],
        footerRow: ['Assigned To', 'Customer', 'Job Request', 'Status', 'Created By', 'Created Date', 'Modified Date', 'Actions'],
        dataRows: this.data
      };
    });
  }
  get totalRows(): number {
    return this.getJob.length;
  }

  getStatus() {
    firebase.firestore().collection('status').orderBy('name', 'desc').get().then(query => {
      this.statuses = []
      query.forEach(data => {
        const status = <Statuses>data.data()
        this.statuses.push(status)

      })
    })
  }

  getStatusColorByName(name:string) {
    return this.statuses.find((val,ind,arr)=>{
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
      this.getJob()
    })
  }

  getStyle(name:any) {
    const getStatusName = this.getStatusColorByName(name)
    let st = {
      'background': `${getStatusName}`,
      'width': '20px',
      'height': '20px',
      'border-radius': '10px'
    }
    return st
}

  ngOnInit() {
    const email = localStorage.getItem('email');
    this.service.getUserData(email).then(user => {
      this.role = user.role
      this.getCategories()
      this.getStatus()
    })
  }

  getCategoryNameById(id:string) {
    return this.categories.find((val,ind,arr)=>{
      return val.id === id
    }).name
  }

  displayHTMLCategories(cats:string[]) {
    var html = '<ul>'
    cats.forEach(c => {
      const getCatName = this.getCategoryNameById(c)
      html += (getCatName === undefined) ? '' : `<li><strong>${getCatName}</strong></li>`
    })
    html += '</ul>'
    return html
  }

  editJob(job:any) {
    this.selectedJob = this.jobs.find((val,ind,arr)=>{
      return val.id === job[0]
    })
    this.viewJob = true
  }

  cancelViewJob() {
    this.viewJob = false
    this.selectedJob = null
  }

  deleteJob(job: any) {
    const id = job[0]
    swal({
      title: 'Delete Alert',
      text: 'Are you sure about deleting this job?',
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      confirmButtonClass: "btn btn-success",
      cancelButtonClass: "btn btn-danger",
      buttonsStyling: false
    }).then((result) => {
      if (result.value) {
        firebase.firestore().collection('jobs').doc(id).delete().then(del => {
          const current_email = localStorage.getItem('email')
          const current_name = localStorage.getItem('name')
          this.config.logActivity(`${current_name}|${current_email} deleted a job`)
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

  updateStatus(name:string){
    firebase.firestore().collection('jobs').doc(this.selectedJob.id).update({
      'status': name
    }).then(d => {
      document.getElementById('stat').innerHTML = `Status: <br><strong>${name}</strong>`
      this.config.displayMessage('Status updated successfully', true)
    }).catch(err => {
      this.config.displayMessage(`${err}`, false)
    })
  }

  reassignJob(row: any) {
    location.href = `/new-ticket?customer=${row[3]}&jobid=${row[0]}`
  }

  ngAfterViewInit() {
    //$.noConflict();
    (<any>$('#datatables')).DataTable({
      "pagingType": "full_numbers",
      "lengthMenu": [
        [10, 25, 50, -1],
        [10, 25, 50, "All"]
      ],
      responsive: true,
      language: {
        search: "_INPUT_",
        searchPlaceholder: "Search records",
      }

    });

    const table = (<any>$('#datatables')).DataTable();

    $('.card .material-datatables label').addClass('form-group');
  }
}
