import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity()
@Index(['email'], { unique: true }) // Búsqueda por email
@Index(['name']) // Búsqueda por nombre
@Index(['address_city']) // Filtrado por ciudad
@Index(['address_province']) // Filtrado por provincia
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

    @Column({ type: 'decimal', precision: 12, scale: 2, nullable: false, default: 0 })
    creditBalance: number;
}
