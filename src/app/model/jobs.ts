import { AdminUsers } from "./admin.users";
import { MainCustomer } from "./customer";

export interface Jobs {
    id:string
    assigned_to:AdminUsers// technician object
    customer:MainCustomer// customer object
    status:string//id of the status

    created_by?: string
    created_date?: string
    modified_date?: string
    timestamp?: any
}