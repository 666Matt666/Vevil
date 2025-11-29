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

interface Product {
  id: number;
  name: string;
  type: string;
  price: number;
  stock: number;
  description: string;
}

const products = ref<Product[]>([]);
const productDialog = ref(false);
const deleteProductDialog = ref(false);
const product = ref<Partial<Product>>({});
const submitted = ref(false);
const toast = useToast();
const loading = ref(true);

const productTypes = ref([
    { label: 'Combustible', value: 'fuel' },
    { label: 'Otro', value: 'other' }
]);

const fetchProducts = async () => {
  loading.value = true;
  try {
    const response = await axios.get('http://localhost:3000/products');
    products.value = response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron obtener los productos', life: 3000 });
  } finally {
    loading.value = false;
  }
};

const openNew = () => {
  product.value = { type: 'fuel' };
  submitted.value = false;
  productDialog.value = true;
};

const hideDialog = () => {
  productDialog.value = false;
  submitted.value = false;
};

const editProduct = (prod: Product) => {
  product.value = { ...prod };
  productDialog.value = true;
};

const confirmDeleteProduct = (prod: Product) => {
  product.value = prod;
  deleteProductDialog.value = true;
};

const saveProduct = async () => {
  submitted.value = true;

  if (product.value.name?.trim()) {
    try {
      if (product.value.id) {
        await axios.patch(`http://localhost:3000/products/${product.value.id}`, product.value);
        toast.add({ severity: 'success', summary: 'Éxito', detail: 'Producto actualizado', life: 3000 });
      } else {
        await axios.post('http://localhost:3000/products', product.value);
        toast.add({ severity: 'success', summary: 'Éxito', detail: 'Producto creado', life: 3000 });
      }
      productDialog.value = false;
      product.value = {};
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar el producto', life: 3000 });
    }
  }
};

const deleteProduct = async () => {
  try {
    if (product.value.id) {
        await axios.delete(`http://localhost:3000/products/${product.value.id}`);
        toast.add({ severity: 'success', summary: 'Éxito', detail: 'Producto eliminado', life: 3000 });
        deleteProductDialog.value = false;
        product.value = {};
        fetchProducts();
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el producto', life: 3000 });
  }
};

onMounted(fetchProducts);
</script>

<template>
  <div class="card p-4">
    <Toast />
    <Toolbar class="mb-4">
      <template #start>
        <Button label="Nuevo" icon="pi pi-plus" severity="success" class="mr-2" @click="openNew" />
      </template>
    </Toolbar>

    <DataTable :value="products" :loading="loading" tableStyle="min-width: 50rem" paginator :rows="5" :rowsPerPageOptions="[5, 10, 20]">
      <template #header>
        <div class="flex flex-wrap gap-2 align-items-center justify-content-between">
          <h4 class="m-0">Gestionar Productos</h4>
        </div>
      </template>

      <Column field="name" header="Nombre" sortable></Column>
      <Column field="type" header="Tipo" sortable>
        <template #body="slotProps">
            <span :class="'product-badge status-' + (slotProps.data.type ? slotProps.data.type.toLowerCase() : '')">{{slotProps.data.type === 'fuel' ? 'Combustible' : 'Otro'}}</span>
        </template>
      </Column>
      <Column field="price" header="Precio" sortable>
        <template #body="slotProps">
          {{ '$' + slotProps.data.price }}
        </template>
      </Column>
      <Column field="stock" header="Stock" sortable>
          <template #body="slotProps">
              <span :class="{'text-red-500 font-bold': slotProps.data.stock < 10, 'text-green-500': slotProps.data.stock >= 10}">
                  {{ slotProps.data.stock }}
              </span>
          </template>
      </Column>
      <Column :exportable="false" style="min-width:8rem">
        <template #body="slotProps">
          <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editProduct(slotProps.data)" />
          <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteProduct(slotProps.data)" />
        </template>
      </Column>
    </DataTable>

    <Dialog v-model:visible="productDialog" :style="{ width: '450px' }" header="Detalles del Producto" :modal="true" class="p-fluid">
      <div class="field">
        <label for="name">Nombre</label>
        <InputText id="name" v-model.trim="product.name" required="true" autofocus :class="{ 'p-invalid': submitted && !product.name }" />
        <small class="p-error" v-if="submitted && !product.name">El nombre es obligatorio.</small>
      </div>
      <div class="field mt-3">
        <label for="type" class="mb-3">Tipo</label>
        <Dropdown id="type" v-model="product.type" :options="productTypes" optionLabel="label" optionValue="value" placeholder="Seleccione un tipo" />
      </div>
      <div class="formgrid grid mt-3">
        <div class="field col">
          <label for="price">Precio</label>
          <InputNumber id="price" v-model="product.price" mode="currency" currency="USD" locale="en-US" />
        </div>
        <div class="field col">
          <label for="stock">Stock</label>
          <InputNumber id="stock" v-model="product.stock" integeronly />
        </div>
      </div>
      <template #footer>
        <Button label="Cancelar" icon="pi pi-times" text @click="hideDialog" />
        <Button label="Guardar" icon="pi pi-check" text @click="saveProduct" />
      </template>
    </Dialog>

    <Dialog v-model:visible="deleteProductDialog" :style="{ width: '450px' }" header="Confirmar" :modal="true">
      <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
        <span v-if="product">¿Estás seguro de que quieres eliminar <b>{{ product.name }}</b>?</span>
      </div>
      <template #footer>
        <Button label="No" icon="pi pi-times" text @click="deleteProductDialog = false" />
        <Button label="Sí" icon="pi pi-check" text @click="deleteProduct" />
      </template>
    </Dialog>
  </div>
</template>
