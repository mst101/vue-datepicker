import { isRef, ref } from 'vue'

export default (val) => {
  return isRef(val) ? val : ref(val)
}
