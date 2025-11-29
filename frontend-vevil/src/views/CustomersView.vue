<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Dropdown from 'primevue/dropdown';
import Toolbar from 'primevue/toolbar';
import { useToast } from 'primevue/usetoast';
import Toast from 'primevue/toast';

interface Phone {
  type: string;
  number: string;
}

interface Customer {
  id: number;
  name: string;
  email: string;
  phones: Phone[];
  address_street: string;
  address_city: string;
  address_province: string;
  address_zip: string;
  google_maps_link: string;
  tax_id: string;
}

const customers = ref<Customer[]>([]);
const customerDialog = ref(false);
const deleteCustomerDialog = ref(false);
const customer = ref<Partial<Customer>>({});
const submitted = ref(false);
const toast = useToast();
const loading = ref(true);

const fetchCustomers = async () => {
  loading.value = true;
  try {
    const response = await axios.get('http://localhost:3000/customers');
    customers.value = response.data;
  } catch (error) {
    console.error('Error fetching customers:', error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron obtener los clientes', life: 3000 });
  } finally {
    loading.value = false;
  }
};

const openNew = () => {
  customer.value = { phones: [] };
  submitted.value = false;
  customerDialog.value = true;
};

const hideDialog = () => {
  customerDialog.value = false;
  submitted.value = false;
};

const editCustomer = (cust: Customer) => {
  customer.value = { ...cust, phones: cust.phones || [] };
  customerDialog.value = true;
};

const confirmDeleteCustomer = (cust: Customer) => {
  customer.value = cust;
  deleteCustomerDialog.value = true;
};

const saveCustomer = async () => {
  submitted.value = true;

  if (customer.value.name?.trim() && customer.value.email?.trim()) {
    try {
      if (customer.value.id) {
        await axios.patch(`http://localhost:3000/customers/${customer.value.id}`, customer.value);
        toast.add({ severity: 'success', summary: 'Éxito', detail: 'Cliente actualizado', life: 3000 });
      } else {
        await axios.post('http://localhost:3000/customers', customer.value);
        toast.add({ severity: 'success', summary: 'Éxito', detail: 'Cliente creado', life: 3000 });
      }
      customerDialog.value = false;
      customer.value = {};
      fetchCustomers();
    } catch (error) {
      console.error('Error saving customer:', error);
      toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar el cliente', life: 3000 });
    }
  }
};

const deleteCustomer = async () => {
  try {
    if (customer.value.id) {
        await axios.delete(`http://localhost:3000/customers/${customer.value.id}`);
        toast.add({ severity: 'success', summary: 'Éxito', detail: 'Cliente eliminado', life: 3000 });
        deleteCustomerDialog.value = false;
        customer.value = {};
        fetchCustomers();
    }
  } catch (error) {
    console.error('Error deleting customer:', error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el cliente', life: 3000 });
  }
};

onMounted(fetchCustomers);
</script>

<template>
  <div class="card p-4">
    <Toast />
    <Toolbar class="mb-4">
      <template #start>
        <Button label="Nuevo" icon="pi pi-plus" severity="success" class="mr-2" @click="openNew" />
      </template>
    </Toolbar>

    <DataTable :value="customers" :loading="loading" tableStyle="min-width: 50rem" paginator :rows="5" :rowsPerPageOptions="[5, 10, 20]">
      <template #header>
        <div class="flex flex-wrap gap-2 align-items-center justify-content-between">
          <h4 class="m-0">Gestionar Clientes</h4>
        </div>
      </template>

      <Column field="name" header="Nombre" sortable></Column>
      <Column field="email" header="Email" sortable></Column>
      <Column header="Teléfonos">
        <template #body="slotProps">
          <div v-for="(phone, index) in slotProps.data.phones" :key="index">
            <small><b>{{ phone.type }}:</b> {{ phone.number }}</small>
          </div>
        </template>
      </Column>
      <Column header="Dirección">
        <template #body="slotProps">
          <div>{{ slotProps.data.address_street }}, {{ slotProps.data.address_city }}</div>
          <div v-if="slotProps.data.google_maps_link">
            <a :href="slotProps.data.google_maps_link" target="_blank" class="text-primary hover:underline">
                <i class="pi pi-map-marker mr-1"></i>Ver en Mapa
            </a>
          </div>
        </template>
      </Column>
      <Column field="tax_id" header="ID Fiscal" sortable></Column>
      <Column :exportable="false" style="min-width:8rem">
        <template #body="slotProps">
          <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editCustomer(slotProps.data)" />
          <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteCustomer(slotProps.data)" />
        </template>
      </Column>
    </DataTable>

    <Dialog v-model:visible="customerDialog" :style="{ width: '450px' }" header="Detalles del Cliente" :modal="true" class="p-fluid">
      <div class="field">
        <label for="name">Nombre</label>
        <InputText id="name" v-model.trim="customer.name" required="true" autofocus :class="{ 'p-invalid': submitted && !customer.name }" />
        <small class="p-error" v-if="submitted && !customer.name">El nombre es obligatorio.</small>
      </div>
      <div class="field mt-3">
        <label for="email">Email</label>
        <InputText id="email" v-model.trim="customer.email" required="true" :class="{ 'p-invalid': submitted && !customer.email }" />
        <small class="p-error" v-if="submitted && !customer.email">El email es obligatorio.</small>
      </div>
      <div class="field mt-3">
        <label class="mb-3">Teléfonos</label>
        <div v-for="(phone, index) in customer.phones" :key="index" class="flex gap-2 mb-2">
            <Dropdown v-model="phone.type" :options="['Móvil', 'Casa', 'Trabajo', 'Otro']" placeholder="Tipo" class="w-4rem" />
            <InputText v-model="phone.number" placeholder="Número" class="flex-1" />
            <Button icon="pi pi-trash" severity="danger" text @click="customer.phones?.splice(index, 1)" />
        </div>
        <Button label="Agregar Teléfono" icon="pi pi-plus" text size="small" @click="customer.phones?.push({ type: 'Móvil', number: '' })" />
      </div>

      <div class="field mt-3">
        <label for="address_street">Calle y Altura</label>
        <InputText id="address_street" v-model.trim="customer.address_street" />
      </div>
      <div class="formgrid grid">
          <div class="field col">
            <label for="address_city">Ciudad</label>
            <InputText id="address_city" v-model.trim="customer.address_city" class="w-full" />
          </div>
          <div class="field col">
            <label for="address_province">Provincia</label>
            <InputText id="address_province" v-model.trim="customer.address_province" class="w-full" />
          </div>
      </div>
      <div class="field">
        <label for="address_zip">Código Postal</label>
        <InputText id="address_zip" v-model.trim="customer.address_zip" />
      </div>

      <div class="field">
        <label for="google_maps_link">Link de Google Maps</label>
        <div class="p-inputgroup">
            <span class="p-inputgroup-addon">
                <i class="pi pi-map-marker"></i>
            </span>
            <InputText id="google_maps_link" v-model.trim="customer.google_maps_link" placeholder="https://maps.google.com/..." />
        </div>
      </div>

      <div class="field mt-3">
        <label for="tax_id">ID Fiscal</label>
        <InputText id="tax_id" v-model.trim="customer.tax_id" />
      </div>
      <template #footer>
        <Button label="Cancelar" icon="pi pi-times" text @click="hideDialog" />
        <Button label="Guardar" icon="pi pi-check" text @click="saveCustomer" />
      </template>
    </Dialog>

    <Dialog v-model:visible="deleteCustomerDialog" :style="{ width: '450px' }" header="Confirmar" :modal="true">
      <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
        <span v-if="customer">¿Estás seguro de que quieres eliminar a <b>{{ customer.name }}</b>?</span>
      </div>
      <template #footer>
        <Button label="No" icon="pi pi-times" text @click="deleteCustomerDialog = false" />
        <Button label="Sí" icon="pi pi-check" text @click="deleteCustomer" />
      </template>
    </Dialog>
  </div>
</template>
