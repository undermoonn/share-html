<script lang="ts" setup>
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

let editor: Awaited<ReturnType<typeof getEditor>> | null = null

if (isRenderEditorOnStart) {
  getEditor(() => {
    isEditorLoaded.value = true
  }).then((e) => {
    editor = e
    e?.setValue(html.value)
  })
}

// --------------------

async function getEditor(onEditorCreate: () => void) {
  if (import.meta.server) {
    return null
  }

  const [
    monaco,
    { useMonacoEx },
    { default: editorWorker },
    { default: htmlWorker },
    { default: tsWorker },
    { default: cssWorker }
  ] = await Promise.all([
    import('monaco-editor'),
    import('monaco-editor-ex'),
    // @ts-expect-error
    import('monaco-editor/esm/vs/editor/editor.worker?worker'),
    // @ts-expect-error
    import('monaco-editor/esm/vs/language/html/html.worker?worker'),
    // @ts-expect-error
    import('monaco-editor/esm/vs/language/typescript/ts.worker?worker'),
    // @ts-expect-error
    import('monaco-editor/esm/vs/language/css/css.worker?worker')
  ])

  useMonacoEx(monaco)

  self.MonacoEnvironment = {
    getWorker(_, label) {
      if (label === 'css' || label === 'scss' || label === 'less') {
        return new cssWorker()
      }
      if (label === 'html' || label === 'handlebars' || label === 'razor') {
        return new htmlWorker()
      }
      if (label === 'typescript' || label === 'javascript') {
        return new tsWorker()
      }
      return new editorWorker()
    }
  }

  monaco.languages.register({ id: 'html' })
  monaco.languages.register({ id: 'javascript' })
  monaco.languages.register({ id: 'typescript' })
  monaco.languages.register({ id: 'css' })

  const editor = monaco.editor.create(document.getElementById('editor')!, {
    language: 'html'
  })

  onEditorCreate()

  return editor
}

function base64ToBytes(base64: string) {
  const binString = atob(base64)
  // @ts-expect-error
  return Uint8Array.from(binString, (m) => m.codePointAt(0))
}

function bytesToBase64(bytes: Uint8Array) {
  const binString = Array.from(bytes, (byte) =>
    String.fromCodePoint(byte)
  ).join('')
  return btoa(binString)
}

function useMounted() {
  const isMounted = ref(false)
  onMounted(() => {
    isMounted.value = true
  })
  return isMounted
}
</script>

<template>
  <div class="w-screen h-screen flex flex-col">
    <div
      class="p-3 flex items-center gap-3 justify-center b-b-neutral b-1 b-solid b-op-30"
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
          class="h-full flex-1 b-l-neutral b-1 b-solid b-op-30"
        ></iframe>
      </Transition>
    </div>
  </div>
</template>

<style>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.3s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}

button {
  align-items: center;
  appearance: none;
  background-color: #fcfcfd;
  border-radius: 4px;
  border-width: 0;
  box-shadow: rgba(45, 35, 66, 0.4) 0 2px 4px,
    rgba(45, 35, 66, 0.3) 0 7px 13px -3px, #d6d6e7 0 -3px 0 inset;
  box-sizing: border-box;
  color: #36395a;
  cursor: pointer;
  display: inline-flex;
  font-family: monospace;
  height: 30px;
  justify-content: center;
  line-height: 1;
  list-style: none;
  overflow: hidden;
  padding-left: 12px;
  padding-right: 12px;
  position: relative;
  text-align: left;
  text-decoration: none;
  transition: box-shadow 0.15s, transform 0.15s;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  white-space: nowrap;
  will-change: box-shadow, transform;
  font-size: 16px;
}
button:disabled {
  opacity: 0.3;
}
button:hover:not(:disabled) {
  box-shadow: rgba(45, 35, 66, 0.4) 0 4px 8px,
    rgba(45, 35, 66, 0.3) 0 7px 13px -3px, #d6d6e7 0 -3px 0 inset;
  transform: translateY(-2px);
}
button:active:not(:disabled) {
  box-shadow: #d6d6e7 0 3px 7px inset;
  transform: translateY(2px);
}
</style>
