import { ref } from 'vue'

export const taxModuleLoading = ref(false)

export function setTaxModuleLoading(value) {
  taxModuleLoading.value = value
}
