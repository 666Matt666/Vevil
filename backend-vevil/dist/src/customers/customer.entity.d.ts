export declare class Customer {
    id: number;
    name: string;
    email: string;
    phones: {
        type: string;
        number: string;
    }[];
    address_street: string;
    address_city: string;
    address_province: string;
    address_zip: string;
    google_maps_link: string;
    tax_id: string;
}
