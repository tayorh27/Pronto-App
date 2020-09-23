export interface AdminUsers {
    id?: string
    email: string
    name: string
    user_position?: string
    image?: string
    role?: string
    blocked: boolean


    user_type?: string//admin | technician
    address?: string
    position?: any
    phone?: string
    category?: string[]
    status?: string
    created_by?: string
    created_date?: string
    modified_date?: string
    timestamp?: any
}