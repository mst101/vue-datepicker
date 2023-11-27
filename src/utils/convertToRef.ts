import { isRef, ref } from 'vue'

export default (val: any) => {
  return isRef(val) ? val : ref(val)
}
