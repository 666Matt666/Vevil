// Script para cargar datos de ejemplo
// Ejecutar desde la consola del navegador cuando estés logueado

(async function seedData() {
    const API_URL = 'https://vevil-dtt7ta.fly.dev/api';
    
    // Obtener token del localStorage
    const token = localStorage.getItem('token');
    
    if (!token) {
        console.error('❌ No estás logueado. Por favor, inicia sesión primero.');
        return;
    }
    
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
    
    console.log('🚀 Iniciando carga de datos...');
    
    // 1. Crear Productos
    const products = [
        { name: 'Nafta Super', type: 'fuel', price: 1.20, stock: 5000, description: 'Combustible estándar' },
        { name: 'Nafta Premium', type: 'fuel', price: 1.50, stock: 3000, description: 'Combustible de alto octanaje' },
        { name: 'Diesel Común', type: 'fuel', price: 1.10, stock: 8000, description: 'Diesel para transporte pesado' },
        { name: 'Aceite Motor 10W40', type: 'other', price: 15.00, stock: 50, description: 'Lubricante sintético' },
        { name: 'Agua Mineral 500ml', type: 'other', price: 1.50, stock: 100, description: 'Bebida refrescante' },
    ];
    
    const createdProducts = [];
    for (const product of products) {
        try {
            const response = await fetch(`${API_URL}/products`, {
                method: 'POST',
                headers,
                body: JSON.stringify(product),
            });
            if (response.ok) {
                const data = await response.json();
                createdProducts.push(data);
                console.log(`✅ Producto creado: ${data.name}`);
            } else {
                const error = await response.json().catch(() => ({ message: response.statusText }));
                console.error(`❌ Error al crear producto ${product.name}:`, error.message);
            }
        } catch (error) {
            console.error(`❌ Error al crear producto ${product.name}:`, error);
        }
    }
    
    // 2. Crear Clientes
    const customers = [
        {
            name: 'Juan Pérez',
            email: 'juan.perez@email.com',
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
            name: 'Empresa de Transportes S.A.',
            email: 'contacto@transporte.com',
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
            name: 'María González',
            email: 'maria.gonzalez@email.com',
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
                headers,
                body: JSON.stringify(customer),
            });
            if (response.ok) {
                const data = await response.json();
                createdCustomers.push(data);
                console.log(`✅ Cliente creado: ${data.name}`);
            } else {
                const error = await response.json().catch(() => ({ message: response.statusText }));
                console.error(`❌ Error al crear cliente ${customer.name}:`, error.message);
            }
        } catch (error) {
            console.error(`❌ Error al crear cliente ${customer.name}:`, error);
        }
    }
    
    // 3. Crear Facturas
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
                    headers,
                    body: JSON.stringify(invoice),
                });
                if (response.ok) {
                    const data = await response.json();
                    console.log(`✅ Factura creada ID: ${data.id} para cliente ${data.customer?.name}`);
                } else {
                    const error = await response.json().catch(() => ({ message: response.statusText }));
                    console.error(`❌ Error al crear factura:`, error.message);
                }
            } catch (error) {
                console.error(`❌ Error al crear factura:`, error);
            }
        }
    } else {
        console.warn('⚠️ No se crearon facturas porque faltan productos o clientes');
    }
    
    console.log('✅ Carga de datos completada!');
    console.log(`📊 Resumen: ${createdProducts.length} productos, ${createdCustomers.length} clientes`);
})();

