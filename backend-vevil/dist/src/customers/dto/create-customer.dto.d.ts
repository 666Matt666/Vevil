export declare class CreateCustomerDto {
    name: string;
    email: string;
    phones?: PhoneDto[];
    address_street?: string;
    address_city?: string;
    address_province?: string;
    address_zip?: string;
    google_maps_link?: string;
    tax_id?: string;
}
export declare class PhoneDto {
    type: string;
    number: string;
}
