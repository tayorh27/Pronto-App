import { Component, OnInit } from '@angular/core';
import { Jobs } from './../model/jobs';
import * as firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/database';
import * as geofirex from 'geofirex';
import * as $ from 'jquery';
import 'datatables.net';
import 'datatables.net-bs4';
import { AppConfig } from '../services/global.service';
import swal from 'sweetalert2';
import { AdminUsers } from '../model/admin.users';
import { MainCustomer } from '../model/customer';
import { MainTechnician } from './../model/technician';




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
  jobs: AdminUsers[] = []
  customers: MainCustomer[] = []
  technicians: MainTechnician[] = []

  addNewJob = false
  editJob = false
  currentJobRow: any

  selectedJob: Jobs

  config = new AppConfig()
  button_pressed = false

  user_blocked = 'no'

  constructor() {
  }

  getCustomers() {
    firebase.firestore().collection('customers').orderBy('name', 'asc').get().then(query => {
      this.customers = []
      query.forEach(data => {
        const customer = <MainCustomer>data.data()
        this.customers.push(customer)
      })
    });
  }

  getTechnicians() {
    firebase.firestore().collection('technicians').orderBy('name', 'asc').get().then(query => {
      this.technicians = []
      query.forEach(data => {
        const technician = <MainTechnician>data.data()
        this.technicians.push(technician)
      })
    });
  }

  getJob() {
    firebase.firestore().collection('jobs').where('user_type', '==', 'job').orderBy('timestamp', 'desc').onSnapshot(query => {
      this.data = []
      this.jobs = []
      var index = 0
      query.forEach(data => {
        const job = <AdminUsers>data.data()
        
        this.data.push([job.id, job.assigned_to, job.customer, job.status, job.created_by, job.created_date, job.modified_date, 'btn-link'])
        index = index + 1
      })

      this.dataTable = {
        headerRow: ['assigned_to', 'customer', 'status', 'created_by', 'Created Date', 'Modified Date', 'Actions'],
        footerRow: ['assigned_to', 'customer', 'status', 'created_by', 'Created Date', 'Modified Date', 'Actions'],
        dataRows: this.data
      };
    });
  }

  ngOnInit() {
  }

}
