import { Logger } from '@nestjs/common';

const API_URL = 'http://localhost:3000';

async function seed() {
    const logger = new Logger('Seeding');
    logger.log('Starting seed process...');

    // 1. Create Products
    const products = [
        { name: 'Nafta Super (Ejemplo)', type: 'fuel', price: 1.20, stock: 5000, description: 'Combustible estándar de ejemplo' },
        { name: 'Nafta Premium (Ejemplo)', type: 'fuel', price: 1.50, stock: 3000, description: 'Combustible de alto octanaje de ejemplo' },
        { name: 'Diesel Común (Ejemplo)', type: 'fuel', price: 1.10, stock: 8000, description: 'Diesel para transporte pesado de ejemplo' },
        { name: 'Aceite Motor 10W40 (Ejemplo)', type: 'other', price: 15.00, stock: 50, description: 'Lubricante sintético de ejemplo' },
        { name: 'Agua Mineral 500ml (Ejemplo)', type: 'other', price: 1.50, stock: 100, description: 'Bebida refrescante de ejemplo' },
    ];

    const createdProducts = [];
    for (const product of products) {
        try {
            const response = await fetch(`${API_URL}/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(product),
            });
            if (response.ok) {
                const data = await response.json();
                createdProducts.push(data);
                logger.log(`Created product: ${data.name}`);
            } else {
                logger.error(`Failed to create product ${product.name}: ${response.statusText}`);
            }
        } catch (error) {
            logger.error(`Error creating product ${product.name}: ${error}`);
        }
    }

    // 2. Create Customers
    const customers = [
        {
            name: 'Juan Pérez (Ejemplo)',
            email: 'juan.perez.example@email.com',
            phones: [
                { type: 'Móvil', number: '+54 9 11 1234 5678' },
                { type: 'Casa', number: '4567 8901' }
            ],
            address_street: 'Av. Corrientes 1234',
            address_city: 'Buenos Aires',
            address_province: 'CABA',
            address_zip: '1041',
            google_maps_link: 'https://goo.gl/maps/example1',
            tax_id: '20-12345678-9'
        },
        {
            name: 'Empresa de Transportes S.A. (Ejemplo)',
            email: 'contacto@transporte-ejemplo.com',
            phones: [
                { type: 'Oficina', number: '+54 11 4321 8765' }
            ],
            address_street: 'Ruta 9 Km 50',
            address_city: 'Escobar',
            address_province: 'Buenos Aires',
            address_zip: '1625',
            google_maps_link: 'https://goo.gl/maps/example2',
            tax_id: '30-87654321-0'
        },
        {
            name: 'María González (Ejemplo)',
            email: 'maria.gonzalez.example@email.com',
            phones: [
                { type: 'Móvil', number: '+54 9 351 123 4567' }
            ],
            address_street: 'Calle Falsa 123',
            address_city: 'Córdoba',
            address_province: 'Córdoba',
            address_zip: '5000',
            google_maps_link: 'https://goo.gl/maps/example3',
            tax_id: '27-11223344-5'
        }
    ];

    const createdCustomers = [];
    for (const customer of customers) {
        try {
            const response = await fetch(`${API_URL}/customers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(customer),
            });
            if (response.ok) {
                const data = await response.json();
                createdCustomers.push(data);
                logger.log(`Created customer: ${data.name}`);
            } else {
                logger.error(`Failed to create customer ${customer.name}: ${response.statusText}`);
                const text = await response.text();
                logger.error(text);
            }
        } catch (error) {
            logger.error(`Error creating customer ${customer.name}: ${error}`);
        }
    }

    // 3. Create Invoices
    if (createdProducts.length > 0 && createdCustomers.length > 0) {
        const invoices = [
            {
                customerId: createdCustomers[0].id,
                items: [
                    { productId: createdProducts[0].id, quantity: 40 }, // 40L Nafta Super
                    { productId: createdProducts[4].id, quantity: 2 }   // 2 Aguas
                ]
            },
            {
                customerId: createdCustomers[1].id,
                items: [
                    { productId: createdProducts[2].id, quantity: 200 }, // 200L Diesel
                    { productId: createdProducts[3].id, quantity: 5 }    // 5 Aceites
                ]
            },
            {
                customerId: createdCustomers[2].id,
                items: [
                    { productId: createdProducts[1].id, quantity: 35 } // 35L Nafta Premium
                ]
            }
        ];

        for (const invoice of invoices) {
            try {
                const response = await fetch(`${API_URL}/invoices`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(invoice),
                });
                if (response.ok) {
                    const data = await response.json();
                    logger.log(`Created invoice ID: ${data.id} for customer ${data.customer?.name}`);
                } else {
                    logger.error(`Failed to create invoice: ${response.statusText}`);
                    const text = await response.text();
                    logger.error(text);
                }
            } catch (error) {
                logger.error(`Error creating invoice: ${error}`);
            }
        }
    } else {
        logger.warn('Skipping invoice creation because products or customers could not be created.');
    }

    logger.log('Seeding completed.');
}

seed();
