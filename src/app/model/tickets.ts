import { AdminUsers } from "./admin.users";

export interface Ticket {
    id:string
    ticket_id:number
    email:string
    last_message:string
    assigned_to:AdminUsers
    customer:AdminUsers
    is_assigned:boolean
    ticket_type:string //enqueue, assigned, resolved
    status:string //Active,Pending,Blocked,On Hold
    channel_type:string //email,whatsapp,facebook
    created_date:string
    modified_date:string
    timestamp:any
}

export interface Conversation {
    id:string
    ticket_id:string
    type:string //note, user
    reply:string
    from:string
    to:string
    subject:string
    html:string
    created_date:string
    modified_date:string
    timestamp:any
}