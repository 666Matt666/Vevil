<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import InputNumber from 'primevue/inputnumber';
import Toolbar from 'primevue/toolbar';
import { useToast } from 'primevue/usetoast';
import Toast from 'primevue/toast';

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
}

interface Customer {
  id: number;
  name: string;
}

interface InvoiceItem {
  productId: number | null;
  quantity: number;
  price?: number;
}

interface Invoice {
  id: number;
  customerId: number;
  customer?: Customer;
  date: string;
  total: number;
  items: InvoiceItem[];
}

const invoices = ref<Invoice[]>([]);
const products = ref<Product[]>([]);
const customers = ref<Customer[]>([]);
const invoiceDialog = ref(false);
const toast = useToast();
const loading = ref(true);

const form = ref<{
  customerId: number | null;
  items: { productId: number | null; quantity: number }[];
}>({
  customerId: null,
  items: [{ productId: null, quantity: 1 }]
});

const fetchInvoices = async () => {
  loading.value = true;
  try {
    const response = await axios.get('http://localhost:3000/invoices');
    invoices.value = response.data;
  } catch (error) {
    console.error('Error fetching invoices:', error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron obtener las facturas', life: 3000 });
  } finally {
    loading.value = false;
  }
};

const fetchData = async () => {
  try {
    const [productsRes, customersRes] = await Promise.all([
      axios.get('http://localhost:3000/products'),
      axios.get('http://localhost:3000/customers')
    ]);
    products.value = productsRes.data;
    customers.value = customersRes.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron obtener los datos', life: 3000 });
  }
};

const openNew = () => {
  form.value = { customerId: null, items: [{ productId: null, quantity: 1 }] };
  invoiceDialog.value = true;
};

const hideDialog = () => {
  invoiceDialog.value = false;
};

const addItem = () => {
  form.value.items.push({ productId: null, quantity: 1 });
};

const removeItem = (index: number) => {
  form.value.items.splice(index, 1);
};

const calculateTotal = computed(() => {
  return form.value.items.reduce((total, item) => {
    const product = products.value.find(p => p.id === item.productId);
    return total + (product ? product.price * item.quantity : 0);
  }, 0);
});

const createInvoice = async () => {
  if (!form.value.customerId || form.value.items.some(i => !i.productId || i.quantity < 1)) {
      toast.add({ severity: 'warn', summary: 'Advertencia', detail: 'Por favor complete todos los campos correctamente', life: 3000 });
      return;
  }

  try {
    await axios.post('http://localhost:3000/invoices', form.value);
    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Factura creada', life: 3000 });
    invoiceDialog.value = false;
    fetchInvoices();
    // Refresh products to show updated stock
    const productsRes = await axios.get('http://localhost:3000/products');
    products.value = productsRes.data;
  } catch (error: any) {
    console.error('Error creating invoice:', error);
    toast.add({ severity: 'error', summary: 'Error', detail: error.response?.data?.message || 'No se pudo crear la factura', life: 3000 });
  }
};

onMounted(() => {
  fetchInvoices();
  fetchData();
});
</script>

<template>
  <div class="card p-4">
    <Toast />
    <Toolbar class="mb-4">
      <template #start>
        <Button label="Nueva Factura" icon="pi pi-plus" severity="success" class="mr-2" @click="openNew" />
      </template>
    </Toolbar>

    <DataTable :value="invoices" :loading="loading" tableStyle="min-width: 50rem" paginator :rows="5" :rowsPerPageOptions="[5, 10, 20]">
      <template #header>
        <div class="flex flex-wrap gap-2 align-items-center justify-content-between">
          <h4 class="m-0">Historial de Facturas</h4>
        </div>
      </template>

      <Column field="id" header="ID" sortable>
          <template #body="slotProps">
              #{{ slotProps.data.id }}
          </template>
      </Column>
      <Column field="customer.name" header="Cliente" sortable></Column>
      <Column field="date" header="Fecha" sortable>
        <template #body="slotProps">
          {{ new Date(slotProps.data.date).toLocaleDateString() }}
        </template>
      </Column>
      <Column field="total" header="Total" sortable>
        <template #body="slotProps">
          ${{ slotProps.data.total }}
        </template>
      </Column>
    </DataTable>

    <Dialog v-model:visible="invoiceDialog" :style="{ width: '600px' }" header="Nueva Factura" :modal="true" class="p-fluid">
      <div class="field">
        <label for="customer" class="mb-3">Cliente</label>
        <Dropdown id="customer" v-model="form.customerId" :options="customers" optionLabel="name" optionValue="id" placeholder="Seleccione un Cliente" filter />
      </div>

      <div class="field mt-4">
        <label class="mb-3">Ítems</label>
        <div v-for="(item, index) in form.items" :key="index" class="flex gap-2 mb-2 align-items-end">
          <div class="flex-1">
              <Dropdown v-model="item.productId" :options="products" optionLabel="name" optionValue="id" placeholder="Seleccione un Producto" filter class="w-full">
                  <template #option="slotProps">
                      <div class="flex align-items-center">
                          <div>{{ slotProps.option.name }} (Stock: {{ slotProps.option.stock }}) - ${{ slotProps.option.price }}</div>
                      </div>
                  </template>
              </Dropdown>
          </div>
          <div style="width: 100px">
              <InputNumber v-model="item.quantity" :min="1" showButtons buttonLayout="horizontal" inputClass="w-full text-center" />
          </div>
          <Button icon="pi pi-trash" severity="danger" text @click="removeItem(index)" />
        </div>
        <Button label="Agregar Ítem" icon="pi pi-plus" text @click="addItem" class="mt-2" />
      </div>

      <div class="flex justify-content-end mt-4">
          <h3 class="m-0">Total: ${{ calculateTotal.toFixed(2) }}</h3>
      </div>

      <template #footer>
        <Button label="Cancelar" icon="pi pi-times" text @click="hideDialog" />
        <Button label="Crear Factura" icon="pi pi-check" text @click="createInvoice" />
      </template>
    </Dialog>
  </div>
</template>
