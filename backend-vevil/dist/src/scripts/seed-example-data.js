"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const seed_module_1 = require("./seed.module");
const products_service_1 = require("../products/products.service");
const customers_service_1 = require("../customers/customers.service");
const invoices_service_1 = require("../invoices/invoices.service");
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(seed_module_1.SeedModule);
    const productsService = app.get(products_service_1.ProductsService);
    const customersService = app.get(customers_service_1.CustomersService);
    const invoicesService = app.get(invoices_service_1.InvoicesService);
    console.log('🌱 Iniciando seed de datos de ejemplo...\n');
    console.log('📦 Creando productos de ejemplo...');
    const products = await Promise.all([
        productsService.create({
            name: 'Nafta Super (EJEMPLO)',
            type: 'fuel',
            price: 850.50,
            stock: 5000,
            description: 'Nafta Super 95 octanos - Producto de ejemplo para pruebas',
        }),
        productsService.create({
            name: 'Nafta Premium (EJEMPLO)',
            type: 'fuel',
            price: 950.75,
            stock: 3500,
            description: 'Nafta Premium 98 octanos - Producto de ejemplo para pruebas',
        }),
        productsService.create({
            name: 'Gasoil Común (EJEMPLO)',
            type: 'fuel',
            price: 780.25,
            stock: 6000,
            description: 'Gasoil Común - Producto de ejemplo para pruebas',
        }),
        productsService.create({
            name: 'Gasoil Premium (EJEMPLO)',
            type: 'fuel',
            price: 880.00,
            stock: 4000,
            description: 'Gasoil Premium con aditivos - Producto de ejemplo para pruebas',
        }),
        productsService.create({
            name: 'Aceite Motor 10W40 (EJEMPLO)',
            type: 'other',
            price: 12500.00,
            stock: 150,
            description: 'Aceite sintético para motor 10W40 - Producto de ejemplo para pruebas',
        }),
        productsService.create({
            name: 'Aceite Motor 5W30 (EJEMPLO)',
            type: 'other',
            price: 15800.00,
            stock: 120,
            description: 'Aceite sintético premium 5W30 - Producto de ejemplo para pruebas',
        }),
        productsService.create({
            name: 'Refrigerante (EJEMPLO)',
            type: 'other',
            price: 3200.00,
            stock: 80,
            description: 'Refrigerante para motor - Producto de ejemplo para pruebas',
        }),
        productsService.create({
            name: 'Limpiaparabrisas (EJEMPLO)',
            type: 'other',
            price: 1500.00,
            stock: 200,
            description: 'Líquido limpiaparabrisas concentrado - Producto de ejemplo para pruebas',
        }),
    ]);
    console.log(`✅ ${products.length} productos creados\n`);
    console.log('👥 Creando clientes de ejemplo...');
    const customers = await Promise.all([
        customersService.create({
            name: 'Juan Pérez (EJEMPLO)',
            email: 'juan.perez.ejemplo@test.com',
            phones: [
                { type: 'móvil', number: '+54 9 11 1234-5678' },
                { type: 'trabajo', number: '+54 11 4567-8901' },
            ],
            address_street: 'Av. Libertador 1234',
            address_city: 'Buenos Aires',
            address_province: 'CABA',
            address_zip: 'C1426',
            google_maps_link: 'https://maps.google.com/?q=-34.5731,-58.4387',
            tax_id: '20-12345678-9',
        }),
        customersService.create({
            name: 'María González (EJEMPLO)',
            email: 'maria.gonzalez.ejemplo@test.com',
            phones: [
                { type: 'móvil', number: '+54 9 11 2345-6789' },
            ],
            address_street: 'Calle Corrientes 5678',
            address_city: 'Buenos Aires',
            address_province: 'CABA',
            address_zip: 'C1414',
            google_maps_link: 'https://maps.google.com/?q=-34.6037,-58.4214',
            tax_id: '27-23456789-0',
        }),
        customersService.create({
            name: 'Transportes del Sur S.A. (EJEMPLO)',
            email: 'contacto.ejemplo@transportesdelsur.com',
            phones: [
                { type: 'oficina', number: '+54 11 5678-9012' },
                { type: 'móvil', number: '+54 9 11 3456-7890' },
            ],
            address_street: 'Ruta Nacional 3 Km 45',
            address_city: 'La Plata',
            address_province: 'Buenos Aires',
            address_zip: 'B1900',
            google_maps_link: 'https://maps.google.com/?q=-34.9205,-57.9536',
            tax_id: '30-34567890-1',
        }),
        customersService.create({
            name: 'Carlos Rodríguez (EJEMPLO)',
            email: 'carlos.rodriguez.ejemplo@test.com',
            phones: [
                { type: 'móvil', number: '+54 9 11 4567-8901' },
            ],
            address_street: 'Av. Santa Fe 2345',
            address_city: 'Buenos Aires',
            address_province: 'CABA',
            address_zip: 'C1123',
            google_maps_link: 'https://maps.google.com/?q=-34.5956,-58.3916',
            tax_id: '20-45678901-2',
        }),
        customersService.create({
            name: 'Ana Martínez (EJEMPLO)',
            email: 'ana.martinez.ejemplo@test.com',
            phones: [
                { type: 'móvil', number: '+54 9 11 5678-9012' },
                { type: 'casa', number: '+54 11 6789-0123' },
            ],
            address_street: 'Calle Florida 876',
            address_city: 'Buenos Aires',
            address_province: 'CABA',
            address_zip: 'C1005',
            google_maps_link: 'https://maps.google.com/?q=-34.6018,-58.3747',
            tax_id: '27-56789012-3',
        }),
        customersService.create({
            name: 'Logística Express Ltda. (EJEMPLO)',
            email: 'info.ejemplo@logisticaexpress.com',
            phones: [
                { type: 'oficina', number: '+54 11 7890-1234' },
            ],
            address_street: 'Av. del Libertador 9876',
            address_city: 'Vicente López',
            address_province: 'Buenos Aires',
            address_zip: 'B1638',
            google_maps_link: 'https://maps.google.com/?q=-34.5267,-58.4754',
            tax_id: '30-67890123-4',
        }),
    ]);
    console.log(`✅ ${customers.length} clientes creados\n`);
    console.log('🧾 Creando facturas de ejemplo...');
    const invoice1 = await invoicesService.create({
        customerId: customers[0].id,
        items: [
            {
                productId: products[0].id,
                quantity: 50,
            },
        ],
    });
    console.log(`✅ Factura #${invoice1.id} creada para ${customers[0].name}`);
    const invoice2 = await invoicesService.create({
        customerId: customers[1].id,
        items: [
            {
                productId: products[1].id,
                quantity: 40,
            },
            {
                productId: products[4].id,
                quantity: 2,
            },
        ],
    });
    console.log(`✅ Factura #${invoice2.id} creada para ${customers[1].name}`);
    const invoice3 = await invoicesService.create({
        customerId: customers[2].id,
        items: [
            {
                productId: products[3].id,
                quantity: 500,
            },
            {
                productId: products[5].id,
                quantity: 10,
            },
            {
                productId: products[6].id,
                quantity: 5,
            },
        ],
    });
    console.log(`✅ Factura #${invoice3.id} creada para ${customers[2].name}`);
    const invoice4 = await invoicesService.create({
        customerId: customers[3].id,
        items: [
            {
                productId: products[2].id,
                quantity: 60,
            },
        ],
    });
    console.log(`✅ Factura #${invoice4.id} creada para ${customers[3].name}`);
    const invoice5 = await invoicesService.create({
        customerId: customers[4].id,
        items: [
            {
                productId: products[0].id,
                quantity: 45,
            },
            {
                productId: products[7].id,
                quantity: 3,
            },
        ],
    });
    console.log(`✅ Factura #${invoice5.id} creada para ${customers[4].name}`);
    const invoice6 = await invoicesService.create({
        customerId: customers[5].id,
        items: [
            {
                productId: products[2].id,
                quantity: 300,
            },
            {
                productId: products[3].id,
                quantity: 200,
            },
            {
                productId: products[4].id,
                quantity: 15,
            },
        ],
    });
    console.log(`✅ Factura #${invoice6.id} creada para ${customers[5].name}`);
    const invoice7 = await invoicesService.create({
        customerId: customers[0].id,
        items: [
            {
                productId: products[1].id,
                quantity: 55,
            },
            {
                productId: products[6].id,
                quantity: 1,
            },
        ],
    });
    console.log(`✅ Factura #${invoice7.id} creada para ${customers[0].name}`);
    const invoice8 = await invoicesService.create({
        customerId: customers[2].id,
        items: [
            {
                productId: products[2].id,
                quantity: 400,
            },
        ],
    });
    console.log(`✅ Factura #${invoice8.id} creada para ${customers[2].name}`);
    console.log('\n✨ Seed completado exitosamente!');
    console.log('\n📊 Resumen:');
    console.log(`   - ${products.length} productos creados`);
    console.log(`   - ${customers.length} clientes creados`);
    console.log(`   - 8 facturas creadas`);
    console.log('\n💡 Todos los datos incluyen "(EJEMPLO)" en su descripción/nombre para identificarlos fácilmente.\n');
    await app.close();
}
bootstrap().catch((error) => {
    console.error('❌ Error durante el seed:', error);
    process.exit(1);
});
//# sourceMappingURL=seed-example-data.js.map