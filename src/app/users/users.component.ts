import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { TableData } from '../md/md-table/md-table.component';
import * as $ from 'jquery';
import 'datatables.net';
import 'datatables.net-bs4';
import * as firebase from "firebase";
// import { Users } from '../models/users';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { OverlayService } from '../overlay/overlay.module';
import { ProgressSpinnerComponent } from '../progress-spinner/progress-spinner.module';
import { AppConfig } from '../services/global.service';

declare interface DataTable {
  headerRow: string[];
  footerRow: string[];
  dataRows: string[][];
}

@Component({
  selector: 'app-users-cmp',
  templateUrl: 'users.component.html',
  styleUrls: ['./users.component.css']
})

export class UsersComponent implements OnInit {

  public dataTable: DataTable;
  data: string[][] = []
  // users: Users[] = []
  config = new AppConfig()
  blocked_value = ''
  // current_user: Users
  closeResult = ''

  blocks_data = [
    { value: 'false', viewValue: 'False' },
    { value: 'true', viewValue: 'True' },
  ]

  ngOnInit() {
    // this.getUsers()
  }

  @ViewChild('user', { static: false }) private userContainer: ElementRef;

  constructor(private modalService: NgbModal, private previewProgressSpinner: OverlayService) {
  }

  // getUsers() {
  //   firebase.firestore().collection('users').onSnapshot(query => {
  //     this.data = []
  //     var data_index = 0
  //     var index = 1
  //     query.forEach(data => {
  //       const user = <Users>data.data()
  //       this.users.push(user)
  //       this.data.push([`${index}`, `${user.firstname} ${user.lastname}`, user.email, user.country, `${user.blocked}`, user.created_date, 'btn-link', `${data_index}`])
  //       index = index + 1
  //       data_index = data_index + 1
  //     })
  //     this.dataTable = {
  //       headerRow: ['ID', 'Username', 'Email Address', 'Country', 'Blocked', 'Created Date'],
  //       footerRow: ['ID', 'Username', 'Email Address', 'Country', 'Blocked', 'Created Date'],
  //       dataRows: this.data
  //     };
  //   });
  // }

  // editUser(_id: any) {
  //   console.log(_id)
  //   this.current_user = this.users[_id]
  //   this.blocked_value = `${this.users[_id].blocked}`
  //   this.open(this.userContainer, '', '')
  // }

  // userButtonAction() {
  //   this.previewProgressSpinner.open({ hasBackdrop: true }, ProgressSpinnerComponent);
  //   firebase.firestore().collection('users').doc(this.current_user.id).update({
  //     'blocked': (this.blocked_value == 'true') ? true : false
  //   }).then(d => {
  //     this.previewProgressSpinner.close()
  //     this.modalService.dismissAll()
  //     this.config.displayMessage("User successfully updated.", true);
  //     this.blocked_value = ''
  //   }).catch(err => {
  //     this.previewProgressSpinner.close()
  //     this.config.displayMessage(`${err}`, false);
  //   })
  // }

  open(content, type, modalDimension) {
    if (modalDimension === 'sm' && type === 'modal_mini') {
      this.modalService.open(content, { windowClass: 'modal-mini', size: 'sm', centered: true }).result.then((result) => {
        this.closeResult = 'Closed with: $result';
      }, (reason) => {
        this.closeResult = 'Dismissed $this.getDismissReason(reason)';
      });
    } else if (modalDimension === '' && type === 'Notification') {
      this.modalService.open(content, { windowClass: 'modal-danger', centered: true }).result.then((result) => {
        this.closeResult = 'Closed with: $result';
      }, (reason) => {
        this.closeResult = 'Dismissed $this.getDismissReason(reason)';
      });
    } else {
      this.modalService.open(content, { centered: true }).result.then((result) => {
        this.closeResult = 'Closed with: $result';
      }, (reason) => {
        this.closeResult = 'Dismissed $this.getDismissReason(reason)';
      });
    }
  }

  ngAfterViewInit() {
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
