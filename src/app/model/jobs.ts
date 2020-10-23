import { AdminUsers } from "./admin.users";
import { MainCustomer } from "./customer";

export interface Jobs {
    id?:string
    job_id?:number
    assigned_to:AdminUsers// technician object
    customer:MainCustomer// customer object
    agent:AdminUsers
    status:string//name of the status
    back_end_status?:string//active and inactive. make inactive if canceled or completed
    category:string[]
    note:string
    created_by?: string
    created_date?: string
    modified_date?: string
    timestamp?: any
}