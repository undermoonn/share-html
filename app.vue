<script lang="ts" setup>
import { base64ToBytes, bytesToBase64 } from './utils/base64'
import { type Editor, getEditor } from './utils/monaco'
import { useMounted } from './composables/useMounted'
import CopyToShare from './components/CopyToShare.vue'

const route = useRoute()
const router = useRouter()
const isMounted = useMounted()
const iframe = ref<HTMLIFrameElement | null>(null)
const isEditorLoaded = ref(false)
const isRenderEditorOnStart = route.query.mode !== 'share'

const showEditor = computed({
  get() {
    return route.query.mode !== 'share'
  },
  set(val) {
    route.query.mode = val ? 'edit' : 'share'
    router.replace({
      query: route.query
    })
    if (import.meta.client && val && !isRenderEditorOnStart) {
      setTimeout(() => {
        location.reload()
      }, 0)
    }
  }
})

const htmlBase64 = computed({
  get() {
    return (route.query.html as string) || ''
  },
  set(val) {
    router.replace({
      query: {
        ...route.query,
        html: val
      }
    })
  }
})

const showIframe = ref(false)

const html = computed({
  get() {
    if (import.meta.client && isMounted.value) {
      return new TextDecoder().decode(base64ToBytes(htmlBase64.value))
    }
    return ''
  },
  set(val) {
    if (import.meta.client && isMounted.value) {
      htmlBase64.value = bytesToBase64(new TextEncoder().encode(val))
    }
  }
})

watch([html, isMounted], ([_html, _isMounted]) => {
  if (!_isMounted) return
  showIframe.value = false
  setTimeout(() => {
    showIframe.value = true
    setTimeout(() => {
      if (iframe.value) {
        iframe.value.contentWindow?.document.write(_html)
      }
    }, 0)
  }, 0)
})

onMounted(() => {
  if (!html.value) {
    html.value = `<body>
    Welcome to share html! You can write html code there and share web link with others :)
</body>`
  }
})

let editor: Editor | null = null

if (isRenderEditorOnStart) {
  getEditor(() => {
    isEditorLoaded.value = true
  }).then((e) => {
    editor = e
    e?.setValue(html.value)
  })
}
</script>

<template>
  <div class="w-screen h-screen flex flex-col">
    <div
      class="p-3 flex items-center justify-between b-b-1 b-solid b-op-30"
      style="border-color: var(--border-color)"
    >
      <button @click="showEditor = !showEditor" class="group">
        <i
          :class="[
            showEditor
              ? 'i-material-symbols:edit-outline-rounded group-hover:i-material-symbols:edit-off-outline'
              : 'i-material-symbols:edit-off-outline group-hover:i-material-symbols:edit-outline-rounded'
          ]"
        />
      </button>
      <button v-if="showEditor" @click="html = editor?.getValue() || ''">
        <i class="i-material-symbols:sync-alt-rounded" />
      </button>
      <CopyToShare />
    </div>
    <div class="flex flex-1">
      <div class="flex-1 h-full relative" id="editor" v-show="showEditor">
        <div
          v-if="!isEditorLoaded"
          class="h-full w-full absolute left-0 top-0 flex items-center justify-center"
        >
          <i class="i-line-md:loading-loop text-40px op-20" />
        </div>
      </div>
      <Transition>
        <iframe
          v-if="showIframe"
          ref="iframe"
          src="javascript:void(0);"
          class="h-full flex-1 b-l-1 b-solid b-op-30"
          style="border-color: var(--border-color)"
        ></iframe>
      </Transition>
    </div>
  </div>
</template>

<style>
:root {
  --border-color: rgba(27, 31, 35, 0.15);
}
.v-enter-active,
.v-leave-active {
  transition: opacity 0.3s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}

button {
  appearance: none;
  background-color: #fafbfc;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  box-shadow: rgba(27, 31, 35, 0.04) 0 1px 0,
    rgba(255, 255, 255, 0.25) 0 1px 0 inset;
  box-sizing: border-box;
  color: #24292e;
  cursor: pointer;
  display: inline-block;
  font-family: -apple-system, system-ui, 'Segoe UI', Helvetica, Arial,
    sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji';
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  list-style: none;
  padding: 6px 16px;
  position: relative;
  transition: background-color 0.2s cubic-bezier(0.3, 0, 0.5, 1);
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  vertical-align: middle;
  white-space: nowrap;
  word-wrap: break-word;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
button:disabled {
  opacity: 0.3;
}
button:hover:not(:disabled) {
  background-color: #f3f4f6;
  text-decoration: none;
  transition-duration: 0.1s;
}
button:active:not(:disabled) {
  background-color: #edeff2;
  box-shadow: rgba(225, 228, 232, 0.2) 0 1px 0 inset;
  transition: none 0s;
}
</style>
