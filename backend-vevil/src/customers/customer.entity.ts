import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Customer {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @Column({ type: 'jsonb', nullable: true, default: [] })
    phones: { type: string; number: string }[];

    @Column({ nullable: true })
    address_street: string;

    @Column({ nullable: true })
    address_city: string;

    @Column({ nullable: true })
    address_province: string;

    @Column({ nullable: true })
    address_zip: string;

    @Column({ nullable: true })
    google_maps_link: string;

    @Column({ nullable: true })
    tax_id: string; // CUIT/CUIL or similar
}
