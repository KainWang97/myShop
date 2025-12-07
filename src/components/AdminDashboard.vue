<script setup lang="ts">
import { ref, computed } from "vue";
import type { Product, Order, Inquiry, OrderStatus, Category } from "../types";

const props = defineProps<{
  products: Product[];
  categories: Category[];
  orders: Order[];
  inquiries: Inquiry[];
}>();

const emit = defineEmits<{
  (e: "update-order-status", id: string, status: OrderStatus): void;
  (e: "reply-inquiry", id: string): void;
  (e: "create-product", data: Omit<Product, "id">): Promise<Product>;
  (
    e: "update-product",
    id: string,
    data: Partial<Product>
  ): Promise<Product | null>;
  (e: "delete-product", id: string): Promise<boolean>;
  (e: "upload-image", file: File): Promise<string>;
  (e: "create-category", data: Omit<Category, "id">): Promise<void>;
  (e: "update-category", id: string, data: Partial<Category>): Promise<void>;
  (e: "delete-category", id: string): Promise<void>;
}>();

const activeTab = ref<"INVENTORY" | "ORDERS" | "INQUIRIES" | "CATEGORIES">(
  "INVENTORY"
);

// Form State
const isFormOpen = ref(false);
const editingProductId = ref<string | null>(null);
const formData = ref({
  name: "",
  price: 0,
  category: "",
  shortDescription: "",
  details: "",
  material: "",
  origin: "",
  image: "",
  stock: 0,
});

// Image Upload State
const isUploading = ref(false);
const uploadError = ref(false);
const pendingFile = ref<File | null>(null);
const previewUrl = ref<string | null>(null);

// Category Form State
const isCategoryFormOpen = ref(false);
const editingCategoryId = ref<string | null>(null);
const categoryFormData = ref({
  name: "",
  description: "",
});

// Category CRUD Handlers
const openNewCategoryForm = () => {
  editingCategoryId.value = null;
  categoryFormData.value = {
    name: "",
    description: "",
  };
  isCategoryFormOpen.value = true;
};

const openEditCategoryForm = (category: Category) => {
  editingCategoryId.value = category.id;
  categoryFormData.value = {
    name: category.name,
    description: category.description || "",
  };
  isCategoryFormOpen.value = true;
};

const closeCategoryForm = () => {
  isCategoryFormOpen.value = false;
  editingCategoryId.value = null;
};

const submitCategoryForm = async () => {
  try {
    if (editingCategoryId.value) {
      await emit(
        "update-category",
        editingCategoryId.value,
        categoryFormData.value
      );
    } else {
      await emit("create-category", categoryFormData.value);
    }
    closeCategoryForm();
  } catch (error) {
    console.error("Failed to save category:", error);
  }
};

const confirmDeleteCategory = async (category: Category) => {
  if (confirm(`確定要刪除分類 "${category.name}" 嗎？`)) {
    try {
      await emit("delete-category", category.id);
    } catch (error) {
      console.error("Failed to delete category:", error);
    }
  }
};

// Open form for new product
const openNewProductForm = () => {
  editingProductId.value = null;
  formData.value = {
    name: "",
    price: 0,
    category: props.categories[0]?.name || "",
    shortDescription: "",
    details: "",
    material: "",
    origin: "",
    image: "",
    stock: 0,
  };
  previewUrl.value = null;
  pendingFile.value = null;
  uploadError.value = false;
  isFormOpen.value = true;
};

// Open form for editing
const openEditForm = (product: Product) => {
  editingProductId.value = product.id;
  formData.value = {
    name: product.name,
    price: product.price,
    category: product.category,
    shortDescription: product.shortDescription,
    details: product.details,
    material: product.material,
    origin: product.origin,
    image: product.image,
    stock: product.stock || 0,
  };
  previewUrl.value = product.image || null;
  pendingFile.value = null;
  uploadError.value = false;
  isFormOpen.value = true;
};

// Close form
const closeForm = () => {
  isFormOpen.value = false;
  editingProductId.value = null;
  pendingFile.value = null;
  previewUrl.value = null;
  uploadError.value = false;
};

// Handle file selection
const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    pendingFile.value = input.files[0];
    // Create local preview
    previewUrl.value = URL.createObjectURL(input.files[0]);
    uploadError.value = false;
  }
};

// Upload image with optimistic UI
const uploadImage = async () => {
  if (!pendingFile.value) return;

  isUploading.value = true;
  uploadError.value = false;

  try {
    const url = await emit("upload-image", pendingFile.value);
    formData.value.image = url;
    previewUrl.value = url;
    pendingFile.value = null;
  } catch (error) {
    console.error("Upload failed:", error);
    uploadError.value = true;
  } finally {
    isUploading.value = false;
  }
};

// Submit form
const submitForm = async () => {
  // If there's a pending file, upload first
  if (pendingFile.value && !uploadError.value) {
    await uploadImage();
    if (uploadError.value) return; // Stop if upload failed
  }

  const productData = {
    name: formData.value.name,
    price: formData.value.price,
    category: formData.value.category,
    shortDescription: formData.value.shortDescription,
    details: formData.value.details,
    material: formData.value.material,
    origin: formData.value.origin,
    image: formData.value.image,
    stock: formData.value.stock,
  };

  try {
    if (editingProductId.value) {
      await emit("update-product", editingProductId.value, productData);
    } else {
      await emit("create-product", productData);
    }
    closeForm();
  } catch (error) {
    console.error("Failed to save product:", error);
  }
};

// Delete product with confirmation
const confirmDelete = async (product: Product) => {
  if (confirm(`確定要刪除 "${product.name}" 嗎？此操作無法復原。`)) {
    try {
      await emit("delete-product", product.id);
    } catch (error) {
      console.error("Failed to delete:", error);
    }
  }
};
</script>

<template>
  <div class="min-h-screen bg-stone-100 pt-32 pb-24 px-6 animate-fade-in">
    <div class="max-w-7xl mx-auto">
      <div class="flex justify-between items-end mb-12">
        <div>
          <h1 class="text-3xl font-serif text-sumi mb-2">Admin Dashboard</h1>
          <p class="text-xs uppercase tracking-widest text-stone-500">
            Store Management System
          </p>
        </div>
        <div class="flex gap-1 bg-white p-1 rounded-sm border border-stone-200">
          <button
            v-for="tab in ['INVENTORY', 'CATEGORIES', 'ORDERS', 'INQUIRIES']"
            :key="tab"
            @click="activeTab = tab as any"
            class="px-6 py-2 text-xs uppercase tracking-widest transition-all"
            :class="
              activeTab === tab
                ? 'bg-sumi text-washi'
                : 'text-stone-500 hover:bg-stone-50'
            "
          >
            {{ tab }}
          </button>
        </div>
      </div>

      <div class="bg-white border border-stone-200 shadow-sm min-h-[600px] p-8">
        <!-- Inventory Tab -->
        <div v-if="activeTab === 'INVENTORY'" class="space-y-6">
          <div
            class="flex justify-between items-center border-b border-stone-100 pb-4"
          >
            <h2 class="font-serif text-xl text-sumi">Product Inventory</h2>
            <button
              @click="openNewProductForm"
              class="px-6 py-2 bg-sumi text-washi text-xs uppercase tracking-widest hover:bg-stone-800 transition-colors"
            >
              + New Product
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr
                  class="text-xs uppercase tracking-widest text-stone-400 border-b border-stone-200"
                >
                  <th class="pb-4 font-normal">Product</th>
                  <th class="pb-4 font-normal">Category</th>
                  <th class="pb-4 font-normal">Price</th>
                  <th class="pb-4 font-normal">Stock</th>
                  <th class="pb-4 font-normal">Actions</th>
                </tr>
              </thead>
              <tbody class="text-sm font-light text-stone-600">
                <tr
                  v-for="product in products"
                  :key="product.id"
                  class="border-b border-stone-50 hover:bg-stone-50/50"
                >
                  <td class="py-4 pr-4">
                    <div class="flex items-center gap-4">
                      <!-- Image or Placeholder -->
                      <div
                        class="w-10 h-10 bg-stone-200 flex items-center justify-center overflow-hidden"
                      >
                        <img
                          v-if="product.image"
                          :src="product.image"
                          class="w-full h-full object-cover"
                          alt=""
                        />
                        <div
                          v-else
                          class="text-[8px] text-stone-400 text-center p-1 leading-tight"
                        >
                          {{ product.name.substring(0, 10) }}
                        </div>
                      </div>
                      <span class="font-medium text-sumi">{{
                        product.name
                      }}</span>
                    </div>
                  </td>
                  <td class="py-4">{{ product.category }}</td>
                  <td class="py-4">${{ product.price }}</td>
                  <td class="py-4">
                    <span
                      class="px-2 py-1 min-w-[40px] text-center inline-block"
                      :class="
                        (product.stock || 0) < 5
                          ? 'bg-red-50 text-red-700'
                          : 'bg-stone-100'
                      "
                    >
                      {{ product.stock || 0 }}
                    </span>
                  </td>
                  <td class="py-4">
                    <div class="flex items-center gap-2">
                      <button
                        @click="openEditForm(product)"
                        class="px-3 py-1 text-xs border border-stone-300 hover:bg-stone-100 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        @click="confirmDelete(product)"
                        class="px-3 py-1 text-xs border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Categories Tab -->
        <div v-if="activeTab === 'CATEGORIES'" class="space-y-6">
          <div
            class="flex justify-between items-center border-b border-stone-100 pb-4"
          >
            <h2 class="font-serif text-xl text-sumi">Categories</h2>
            <button
              @click="openNewCategoryForm"
              class="px-6 py-2 bg-sumi text-washi text-xs uppercase tracking-widest hover:bg-stone-800 transition-colors"
            >
              + New Category
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr
                  class="text-xs uppercase tracking-widest text-stone-400 border-b border-stone-200"
                >
                  <th class="pb-4 font-normal">Name</th>
                  <th class="pb-4 font-normal">Description</th>
                  <th class="pb-4 font-normal">Actions</th>
                </tr>
              </thead>
              <tbody class="text-sm font-light text-stone-600">
                <tr
                  v-for="category in categories"
                  :key="category.id"
                  class="border-b border-stone-50 hover:bg-stone-50/50"
                >
                  <td class="py-4 font-medium text-sumi">
                    {{ category.name }}
                  </td>
                  <td class="py-4">{{ category.description }}</td>
                  <td class="py-4">
                    <div class="flex items-center gap-2">
                      <button
                        @click="openEditCategoryForm(category)"
                        class="px-3 py-1 text-xs border border-stone-300 hover:bg-stone-100 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        @click="confirmDeleteCategory(category)"
                        class="px-3 py-1 text-xs border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Orders Tab -->
        <div v-if="activeTab === 'ORDERS'" class="space-y-6">
          <h2
            class="font-serif text-xl text-sumi border-b border-stone-100 pb-4"
          >
            Recent Orders
          </h2>
          <p v-if="orders.length === 0" class="text-stone-400 italic">
            No orders found.
          </p>
          <div v-else class="space-y-4">
            <div
              v-for="order in orders"
              :key="order.id"
              class="border border-stone-200 p-6 flex flex-col md:flex-row justify-between gap-6 hover:shadow-md transition-shadow"
            >
              <div class="space-y-2">
                <div class="flex items-center gap-4">
                  <span class="font-serif text-lg text-sumi"
                    >Order #{{ order.id }}</span
                  >
                  <span class="text-xs text-stone-400">{{ order.date }}</span>
                </div>
                <div class="text-sm text-stone-600">
                  <p class="font-medium">
                    {{ order.shippingDetails?.fullName }}
                  </p>
                  <p class="text-stone-400 text-xs">
                    {{ order.shippingDetails?.email }}
                  </p>
                </div>
                <div class="text-xs text-stone-500 mt-2">
                  {{
                    order.items
                      .map((i) => `${i.name} (x${i.quantity})`)
                      .join(", ")
                  }}
                </div>
              </div>

              <div class="flex flex-col items-end gap-4 min-w-[200px]">
                <span class="font-serif text-xl">${{ order.total }}</span>
                <div class="flex items-center gap-2">
                  <span class="text-xs uppercase tracking-widest text-stone-400"
                    >Status:</span
                  >
                  <select
                    :value="order.status"
                    @change="
                      emit(
                        'update-order-status',
                        order.id,
                        ($event.target as HTMLSelectElement)
                          .value as OrderStatus
                      )
                    "
                    class="bg-stone-50 border border-stone-200 text-xs uppercase p-2 focus:outline-none focus:border-sumi"
                  >
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <!-- Payment Note Section (User's remittance info) -->
              <div
                v-if="order.paymentNote"
                class="w-full mt-4 pt-4 border-t border-stone-200"
              >
                <div class="flex items-start gap-2">
                  <span
                    class="text-xs uppercase tracking-widest text-stone-400 shrink-0"
                    >付款備註：</span
                  >
                  <p
                    class="text-sm text-stone-600 whitespace-pre-wrap font-light"
                  >
                    {{ order.paymentNote }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Inquiries Tab -->
        <div v-if="activeTab === 'INQUIRIES'" class="space-y-6">
          <h2
            class="font-serif text-xl text-sumi border-b border-stone-100 pb-4"
          >
            Customer Inquiries
          </h2>
          <p v-if="inquiries.length === 0" class="text-stone-400 italic">
            No new messages.
          </p>
          <div v-else class="grid grid-cols-1 gap-4">
            <div
              v-for="inquiry in inquiries"
              :key="inquiry.id"
              class="p-6 border"
              :class="
                inquiry.status === 'PENDING'
                  ? 'border-sumi/20 bg-stone-50'
                  : 'border-stone-100 opacity-60'
              "
            >
              <div class="flex justify-between items-start mb-4">
                <div>
                  <h3 class="font-serif text-sumi">{{ inquiry.name }}</h3>
                  <p class="text-xs text-stone-400">{{ inquiry.email }}</p>
                </div>
                <span class="text-xs text-stone-400">{{ inquiry.date }}</span>
              </div>
              <p
                class="text-sm text-stone-600 font-light mb-4 leading-relaxed bg-white p-4 border border-stone-100"
              >
                {{ inquiry.message }}
              </p>
              <div class="flex justify-end">
                <button
                  v-if="inquiry.status === 'PENDING'"
                  @click="emit('reply-inquiry', inquiry.id)"
                  class="px-4 py-2 bg-sumi text-washi text-xs uppercase tracking-widest hover:bg-stone-800"
                >
                  Mark as Replied
                </button>
                <span
                  v-else
                  class="text-xs uppercase tracking-widest text-green-700 flex items-center gap-2"
                >
                  ✓ Replied
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Category Form Modal -->
    <div
      v-if="isCategoryFormOpen"
      class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      @click.self="closeCategoryForm"
    >
      <div class="bg-white max-w-md w-full p-8 shadow-xl">
        <div class="flex justify-between items-center mb-8">
          <h2 class="font-serif text-2xl text-sumi">
            {{ editingCategoryId ? "Edit Category" : "New Category" }}
          </h2>
          <button
            @click="closeCategoryForm"
            class="text-stone-400 hover:text-sumi text-2xl"
          >
            &times;
          </button>
        </div>

        <form @submit.prevent="submitCategoryForm" class="space-y-6">
          <div class="space-y-2">
            <label
              class="block text-xs uppercase tracking-widest text-stone-500"
              >Name *</label
            >
            <input
              v-model="categoryFormData.name"
              required
              class="w-full border border-stone-300 p-3 focus:outline-none focus:border-sumi"
            />
          </div>

          <div class="space-y-2">
            <label
              class="block text-xs uppercase tracking-widest text-stone-500"
              >Description</label
            >
            <textarea
              v-model="categoryFormData.description"
              rows="3"
              class="w-full border border-stone-300 p-3 focus:outline-none focus:border-sumi resize-none"
            ></textarea>
          </div>

          <div class="flex justify-end gap-4 pt-4 border-t border-stone-200">
            <button
              type="button"
              @click="closeCategoryForm"
              class="px-6 py-3 border border-stone-300 text-stone-600 text-xs uppercase tracking-widest hover:bg-stone-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-6 py-3 bg-sumi text-washi text-xs uppercase tracking-widest hover:bg-stone-800"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Product Form Modal -->
    <div
      v-if="isFormOpen"
      class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      @click.self="closeForm"
    >
      <div
        class="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 shadow-xl"
      >
        <div class="flex justify-between items-center mb-8">
          <h2 class="font-serif text-2xl text-sumi">
            {{ editingProductId ? "Edit Product" : "New Product" }}
          </h2>
          <button
            @click="closeForm"
            class="text-stone-400 hover:text-sumi text-2xl"
          >
            &times;
          </button>
        </div>

        <form @submit.prevent="submitForm" class="space-y-6">
          <!-- Image Upload Section -->
          <div class="space-y-2">
            <label
              class="block text-xs uppercase tracking-widest text-stone-500"
              >Product Image</label
            >
            <div class="flex gap-4 items-start">
              <!-- Image Preview / Placeholder -->
              <div
                class="w-32 h-32 bg-stone-200 flex items-center justify-center overflow-hidden relative"
              >
                <img
                  v-if="previewUrl && !uploadError"
                  :src="previewUrl"
                  class="w-full h-full object-cover"
                  alt="Preview"
                />
                <div v-else-if="!previewUrl" class="text-center p-2">
                  <p class="text-xs text-stone-500 font-medium">
                    {{ formData.name || "Product" }}
                  </p>
                  <p class="text-[10px] text-stone-400 mt-1">
                    {{ formData.shortDescription || "Description" }}
                  </p>
                </div>

                <!-- Upload Animation Overlay -->
                <div
                  v-if="isUploading"
                  class="absolute inset-0 bg-white/80 flex items-center justify-center"
                >
                  <div
                    class="w-8 h-8 border-2 border-sumi border-t-transparent rounded-full animate-spin"
                  ></div>
                </div>
              </div>

              <div class="flex-1 space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  @change="handleFileSelect"
                  class="block w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:border file:border-stone-300 file:text-xs file:bg-white file:text-stone-700 hover:file:bg-stone-50"
                />

                <!-- Upload Error with Retry Button -->
                <div v-if="uploadError" class="flex items-center gap-2">
                  <span class="text-xs text-red-600">上傳失敗</span>
                  <button
                    type="button"
                    @click="uploadImage"
                    class="px-3 py-1 text-xs bg-red-600 text-white hover:bg-red-700 transition-colors"
                  >
                    重新上傳
                  </button>
                </div>

                <!-- Pending File Indicator -->
                <p
                  v-if="pendingFile && !uploadError && !isUploading"
                  class="text-xs text-stone-500"
                >
                  Selected: {{ pendingFile.name }} (will upload on save)
                </p>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label
                class="block text-xs uppercase tracking-widest text-stone-500"
                >Name *</label
              >
              <input
                v-model="formData.name"
                required
                class="w-full border border-stone-300 p-3 focus:outline-none focus:border-sumi"
              />
            </div>
            <div class="space-y-2">
              <label
                class="block text-xs uppercase tracking-widest text-stone-500"
                >Price *</label
              >
              <input
                v-model.number="formData.price"
                type="number"
                min="0"
                step="0.01"
                required
                class="w-full border border-stone-300 p-3 focus:outline-none focus:border-sumi"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label
                class="block text-xs uppercase tracking-widest text-stone-500"
                >Category *</label
              >
              <select
                v-model="formData.category"
                required
                class="w-full border border-stone-300 p-3 focus:outline-none focus:border-sumi bg-white"
              >
                <option
                  v-for="cat in categories"
                  :key="cat.id"
                  :value="cat.name"
                >
                  {{ cat.name }}
                </option>
              </select>
            </div>
            <div class="space-y-2">
              <label
                class="block text-xs uppercase tracking-widest text-stone-500"
                >Stock</label
              >
              <input
                v-model.number="formData.stock"
                type="number"
                min="0"
                class="w-full border border-stone-300 p-3 focus:outline-none focus:border-sumi"
              />
            </div>
          </div>

          <div class="space-y-2">
            <label
              class="block text-xs uppercase tracking-widest text-stone-500"
              >Short Description</label
            >
            <input
              v-model="formData.shortDescription"
              class="w-full border border-stone-300 p-3 focus:outline-none focus:border-sumi"
            />
          </div>

          <div class="space-y-2">
            <label
              class="block text-xs uppercase tracking-widest text-stone-500"
              >Details</label
            >
            <textarea
              v-model="formData.details"
              rows="3"
              class="w-full border border-stone-300 p-3 focus:outline-none focus:border-sumi resize-none"
            ></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label
                class="block text-xs uppercase tracking-widest text-stone-500"
                >Material</label
              >
              <input
                v-model="formData.material"
                class="w-full border border-stone-300 p-3 focus:outline-none focus:border-sumi"
              />
            </div>
            <div class="space-y-2">
              <label
                class="block text-xs uppercase tracking-widest text-stone-500"
                >Origin</label
              >
              <input
                v-model="formData.origin"
                class="w-full border border-stone-300 p-3 focus:outline-none focus:border-sumi"
              />
            </div>
          </div>

          <div class="flex justify-end gap-4 pt-4 border-t border-stone-200">
            <button
              type="button"
              @click="closeForm"
              class="px-6 py-3 border border-stone-300 text-stone-600 text-xs uppercase tracking-widest hover:bg-stone-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isUploading"
              class="px-6 py-3 bg-sumi text-washi text-xs uppercase tracking-widest hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{
                isUploading
                  ? "Uploading..."
                  : editingProductId
                  ? "Save Changes"
                  : "Create Product"
              }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
