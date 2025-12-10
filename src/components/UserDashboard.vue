<script setup lang="ts">
import { ref } from "vue";
import type { User } from "../types";

const props = defineProps<{
  user: User;
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "logout"): void;
  (e: "update-payment-note", orderId: string, note: string): void;
}>();

const activeTab = ref<"orders" | "profile">("orders");

// Payment Note Editing State
const editingNoteOrderId = ref<string | null>(null);
const noteContent = ref("");
const isSavingNote = ref(false);

const startEditingNote = (orderId: string, currentNote?: string) => {
  editingNoteOrderId.value = orderId;
  noteContent.value = currentNote || "";
};

const cancelEditingNote = () => {
  editingNoteOrderId.value = null;
  noteContent.value = "";
};

const savePaymentNote = async (orderId: string) => {
  // 顯示載入中狀態
  isSavingNote.value = true;

  // 發送事件給父組件處理 API 呼叫和狀態更新
  emit("update-payment-note", orderId, noteContent.value);

  // 等待一下讓父組件完成更新
  await new Promise((resolve) => setTimeout(resolve, 500));

  isSavingNote.value = false;
  editingNoteOrderId.value = null;
};
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-[100] flex items-center justify-center p-4"
  >
    <!-- Backdrop -->
    <div
      class="absolute inset-0 bg-stone-900/40 backdrop-blur-sm transition-opacity"
      @click="emit('close')"
    />

    <!-- Modal -->
    <div
      class="relative bg-washi w-full max-w-2xl h-[80vh] flex flex-col shadow-2xl animate-fade-in-up"
    >
      <button
        @click="emit('close')"
        class="absolute top-6 right-6 text-stone-400 hover:text-sumi z-10"
      >
        ✕
      </button>

      <div class="p-8 md:p-12 border-b border-stone-200">
        <h2 class="text-3xl font-serif text-sumi mb-2">
          Welcome, {{ user.name }}
        </h2>
        <p class="text-xs tracking-widest text-stone-500 uppercase">
          Member Dashboard
        </p>
      </div>

      <div class="flex border-b border-stone-200">
        <button
          class="flex-1 py-4 text-xs uppercase tracking-widest transition-colors"
          :class="
            activeTab === 'orders'
              ? 'bg-stone-100 text-sumi border-b-2 border-sumi'
              : 'text-stone-400 hover:text-stone-600'
          "
          @click="activeTab = 'orders'"
        >
          Order History
        </button>
        <button
          class="flex-1 py-4 text-xs uppercase tracking-widest transition-colors"
          :class="
            activeTab === 'profile'
              ? 'bg-stone-100 text-sumi border-b-2 border-sumi'
              : 'text-stone-400 hover:text-stone-600'
          "
          @click="activeTab = 'profile'"
        >
          Profile
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-8 md:p-12 bg-stone-50">
        <div v-if="activeTab === 'orders'" class="space-y-6">
          <p
            v-if="user.orders.length === 0"
            class="text-stone-500 font-light italic"
          >
            No orders placed yet.
          </p>
          <div
            v-else
            v-for="order in user.orders"
            :key="order.id"
            class="bg-white border border-stone-200 p-6 shadow-sm"
          >
            <div
              class="flex justify-between items-start mb-4 border-b border-stone-100 pb-4"
            >
              <div>
                <span
                  class="block text-xs text-stone-400 uppercase tracking-wider mb-1"
                  >Order ID</span
                >
                <span class="font-serif text-lg text-sumi"
                  >#{{ order.id }}</span
                >
              </div>
              <div class="text-right">
                <span
                  class="block text-xs text-stone-400 uppercase tracking-wider mb-1"
                  >Date</span
                >
                <span class="text-sm font-light text-sumi">{{
                  order.date
                }}</span>
              </div>
            </div>

            <div class="space-y-3 mb-4">
              <div
                v-for="(item, idx) in order.items"
                :key="idx"
                class="flex justify-between text-sm font-light text-stone-600"
              >
                <span
                  >{{ item.product.name }} ({{ item.variant.color }}/{{
                    item.variant.size
                  }})
                  <span class="text-stone-400">x{{ item.quantity }}</span></span
                >
                <span>${{ item.price * item.quantity }}</span>
              </div>
            </div>

            <div
              class="flex justify-between items-center pt-4 border-t border-stone-100"
            >
              <span
                class="text-xs px-2 py-1 uppercase tracking-wider border"
                :class="{
                  'border-yellow-200 bg-yellow-50 text-yellow-800':
                    order.status === 'PENDING',
                  'border-blue-200 bg-blue-50 text-blue-800':
                    order.status === 'SHIPPED',
                  'border-green-200 bg-green-50 text-green-800':
                    order.status === 'PAID' || order.status === 'COMPLETED',
                  'border-red-200 bg-red-50 text-red-800':
                    order.status === 'CANCELLED',
                }"
              >
                {{ order.status }}
              </span>
              <span class="font-serif text-xl text-sumi"
                >${{ order.total }}</span
              >
            </div>

            <!-- Payment Note Section -->
            <div class="mt-6 pt-4 border-t border-stone-200">
              <div v-if="editingNoteOrderId === order.id" class="space-y-3">
                <label
                  class="block text-xs uppercase tracking-widest text-stone-500"
                  >訂單備註</label
                >
                <textarea
                  v-model="noteContent"
                  rows="4"
                  placeholder="匯款範例：&#10;匯款帳號末五碼：12345&#10;匯款金額：$XXX&#10;匯款時間：2025/12/12 12:00"
                  class="w-full border border-stone-300 p-3 text-sm focus:outline-none focus:border-sumi resize-none"
                ></textarea>
                <div class="flex gap-2 justify-end">
                  <button
                    @click="cancelEditingNote"
                    :disabled="isSavingNote"
                    class="px-4 py-2 text-xs uppercase tracking-widest border border-stone-300 text-stone-600 hover:bg-stone-50 disabled:opacity-50"
                  >
                    取消
                  </button>
                  <button
                    @click="savePaymentNote(order.id)"
                    :disabled="isSavingNote"
                    class="px-4 py-2 text-xs uppercase tracking-widest bg-sumi text-washi hover:bg-stone-800 disabled:opacity-70 flex items-center gap-2"
                  >
                    <span
                      v-if="isSavingNote"
                      class="inline-block w-4 h-4 border-2 border-washi border-t-transparent rounded-full animate-spin"
                    ></span>
                    {{ isSavingNote ? "儲存中..." : "儲存" }}
                  </button>
                </div>
              </div>

              <div v-else>
                <div v-if="order.paymentNote" class="space-y-2">
                  <div class="flex justify-between items-start">
                    <span
                      class="text-xs uppercase tracking-widest text-stone-500"
                      >付款備註</span
                    >
                    <button
                      @click="startEditingNote(order.id, order.paymentNote)"
                      class="text-xs text-stone-500 hover:text-sumi underline"
                    >
                      編輯
                    </button>
                  </div>
                  <div
                    class="bg-stone-50 p-3 text-sm text-stone-700 whitespace-pre-wrap font-light"
                  >
                    {{ order.paymentNote }}
                  </div>
                </div>

                <button
                  v-else
                  @click="startEditingNote(order.id)"
                  class="text-xs text-stone-500 hover:text-sumi underline"
                >
                  + 新增付款備註
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="space-y-6 max-w-sm">
          <div>
            <label
              class="block text-xs uppercase tracking-widest text-stone-500 mb-2"
              >Name</label
            >
            <div
              class="w-full bg-white border border-stone-200 p-3 text-sm text-sumi"
            >
              {{ user.name }}
            </div>
          </div>
          <div>
            <label
              class="block text-xs uppercase tracking-widest text-stone-500 mb-2"
              >Email</label
            >
            <div
              class="w-full bg-white border border-stone-200 p-3 text-sm text-sumi"
            >
              {{ user.email }}
            </div>
          </div>
          <div class="pt-8">
            <button
              @click="emit('logout')"
              class="px-6 py-2 border border-stone-300 text-stone-500 text-xs uppercase tracking-widest hover:border-red-900 hover:text-red-900 transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
