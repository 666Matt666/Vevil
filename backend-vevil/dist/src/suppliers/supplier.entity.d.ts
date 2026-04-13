export declare class Supplier {
    id: number;
    name: string;
    email: string;
    phones: {
        type: string;
        number: string;
    }[];
    contact_person: string;
    address_street: string;
    address_city: string;
    address_province: string;
    tax_id: string;
    notes: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}
