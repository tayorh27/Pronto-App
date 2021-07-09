import { MainCategory } from './../model/category';
import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import * as firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/database';
import * as $ from 'jquery';
import 'datatables.net';
import 'datatables.net-bs4';
import { AppConfig } from '../services/global.service';
import swal from 'sweetalert2';
import { AdminUsersService } from '../services/admin-users.service';
import { Conversation, Ticket } from '../model/tickets';
import { AdminUsers } from '../model/admin.users';


// declare const $: any;

declare interface DataTable {
  headerRow: string[];
  footerRow: string[];
  dataRows: string[][];
}


@Component({
  selector: 'app-crm',
  templateUrl: './crm.component.html',
  styleUrls: ['./crm.component.css'],
})
export class CRMComponent implements OnInit {

  config = new AppConfig

  service = new AdminUsersService();

  currentUser: AdminUsers

  button_pressed = false

  tabSelected = "All Enqueued Tickets"

  tickets: Ticket[] = []

  tabbedTickets: Ticket[] = []

  selectedTicket: Ticket

  enqueuedCount = 0
  assignedCount = 0
  resolvedCount = 0

  conversations: Conversation[] = []
  selectedConversation: Conversation

  conversationSubject = ""
  replyMessage = ""

  constructor() { }


  ngOnInit() {
    const email = localStorage.getItem('email');
    this.service.getUserData(email).then(user => {
      this.currentUser = user
      this.getTickets()
    })
  }

  getTickets() {
    firebase.firestore().collection("tickets").orderBy("timestamp", "desc").onSnapshot(query => {
      this.tickets = []
      query.forEach(ticket => {
        const t: Ticket = <Ticket>ticket.data()
        this.tickets.push(t)
      })
      // this.tabbedTickets = this.tickets
      this.getTicketsByType("enqueue")

      this.enqueuedCount = this.getTicketsByTypeCount("enqueue")
      this.assignedCount = this.getTicketsByTypeCount("assigned")
      this.resolvedCount = this.getTicketsByTypeCount("resolved")
    })
  }

  getConversations() {
    firebase.firestore().collection("conversations").where("ticket_id", "==", this.selectedTicket.id).onSnapshot(query => {
      this.conversations = []
      query.forEach(convo => {
        const c: Conversation = <Conversation>convo.data()
        this.conversations.push(c)
      })
    })
  }

  getTicketsByType(type: string) {
    this.tabbedTickets = this.tickets.filter((val, ind, arr) => {
      return val.ticket_type.toLowerCase() === type.toLowerCase()
    })
  }

  getTicketsByTypeCount(type: string) {
    const t = this.tickets.filter((val, ind, arr) => {
      return val.ticket_type.toLowerCase() === type.toLowerCase()
    })
    return t.length
  }

  async openTicket(index: number) {
    const ticket = this.tabbedTickets[index]

    this.selectedTicket = ticket
    this.getConversations()

    if (!ticket.is_assigned) {
      await firebase.firestore().collection("tickets").doc(ticket.id).update({
        "is_assigned": true,
        "assigned_to": this.currentUser,
        "ticket_type": "assigned",
        "status": "Active",
        "modified_date": `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,
      })
      this.config.logActivity(`${this.currentUser.name} accepted ${ticket.email}'s ticket.`)
    }

  }

  async submitReponse(conversation_type: string) {
    if (this.replyMessage === "") {
      return
    }
    this.button_pressed = true
    const key = firebase.database().ref().push().key
    const convo: Conversation = { //send user to messagebird and note to firebase
      id: key,
      ticket_id: this.selectedTicket.id,
      type: conversation_type, //note, user
      reply: "agent",
      from: this.currentUser.email,
      to: this.selectedTicket.email,
      subject: (this.selectedConversation === undefined) ? this.conversations[this.conversations.length - 1].subject : this.selectedConversation.subject,
      html: this.replyMessage,
      created_date: `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,
      modified_date: `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }
    await firebase.firestore().collection("conversations").doc(key).set(convo)
    await firebase.firestore().collection("tickets").doc(this.selectedTicket.id).update({
      "last_message": (this.replyMessage.length > 50) ? this.replyMessage.substring(0, 50) : this.replyMessage,
    })
    this.replyMessage = ""
    this.button_pressed = false
  }

  onTabSelected(value: string, type: string) {
    this.tabSelected = value
    this.getTicketsByType(type)
  }

  onConvoSelected(index:number) {
    this.selectedConversation = this.conversations[index]
    this.conversationSubject = this.selectedConversation.subject
    location.href = "/crm#replyTo"
  }

  async reverseTicket() {
    swal({
      title: 'Confirmation Alert',
      text: 'Are you sure of this action?',
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, continue!',
      cancelButtonText: 'Cancel',
      confirmButtonClass: "btn btn-success",
      cancelButtonClass: "btn btn-danger",
      buttonsStyling: false
    }).then(async (result) => {
      if (result.value) {
        await firebase.firestore().collection("tickets").doc(this.selectedTicket.id).update({
          "is_assigned": false,
          "assigned_to": {},
          "ticket_type": "enqueue",
          "status": "Pending",
          "modified_date": `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,
        })
        this.selectedTicket = null
        this.config.logActivity(`${this.currentUser.name} returned ${this.selectedTicket.email}'s ticket to queue.`)
      } else {
        swal({
          title: 'Cancelled',
          text: 'Action not successful',
          type: 'error',
          confirmButtonClass: "btn btn-info",
          buttonsStyling: false
        }).catch(swal.noop)
      }
    })
  }

  async resolveTicket() {
    swal({
      title: 'Confirmation Alert',
      text: 'Are you sure of this action?',
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, continue!',
      cancelButtonText: 'Cancel',
      confirmButtonClass: "btn btn-success",
      cancelButtonClass: "btn btn-danger",
      buttonsStyling: false
    }).then(async (result) => {
      if (result.value) {
        await firebase.firestore().collection("tickets").doc(this.selectedTicket.id).update({
          "ticket_type": "resolved",
          "modified_date": `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,
        })
        this.selectedTicket = null
        this.config.logActivity(`${this.currentUser.name} resolved ${this.selectedTicket.email}'s ticket.`)
      } else {
        swal({
          title: 'Cancelled',
          text: 'Action not successful',
          type: 'error',
          confirmButtonClass: "btn btn-info",
          buttonsStyling: false
        }).catch(swal.noop)
      }
    })
  }

  updateTicketStatus(status: string) {
    swal({
      title: 'Confirmation Alert',
      text: 'Are you sure of this action?',
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, continue!',
      cancelButtonText: 'Cancel',
      confirmButtonClass: "btn btn-success",
      cancelButtonClass: "btn btn-danger",
      buttonsStyling: false
    }).then(async (result) => {
      if (result.value) {
        await firebase.firestore().collection("tickets").doc(this.selectedTicket.id).update({
          "status": status,
          "modified_date": `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,
        })
        this.config.logActivity(`${this.currentUser.name} changed ${this.selectedTicket.email}'s ticket status to ${status}.`)
      } else {
        swal({
          title: 'Cancelled',
          text: 'Action not successful',
          type: 'error',
          confirmButtonClass: "btn btn-info",
          buttonsStyling: false
        }).catch(swal.noop)
      }
    })
  }

}
