<script lang="ts" setup>
import { getHighlighter } from 'shiki'
import { shikiToMonaco } from '@shikijs/monaco'

async function getEditor() {
  if (import.meta.server) {
    return null
  }
  const monaco = await import('monaco-editor-core')
  const highlighter = await getHighlighter({
    themes: ['vitesse-dark'],
    langs: ['javascript', 'vue', 'html']
  })

  monaco.languages.register({ id: 'vue' })
  monaco.languages.register({ id: 'typescript' })
  monaco.languages.register({ id: 'javascript' })
  monaco.languages.register({ id: 'html' })

  shikiToMonaco(highlighter, monaco)

  const editor = monaco.editor.create(document.getElementById('editor')!, {
    language: 'html',
    theme: 'vitesse-dark'
  })

  return editor
}

useHead({
  title: 'Share HTML'
})

const route = useRoute()
const router = useRouter()
const isMounted = useMounted()
const iframe = ref<HTMLIFrameElement | null>(null)

const showEditor = computed({
  get() {
    return !('disable_editor' in route.query)
  },
  set(val) {
    const query = route.query
    if (val) {
      delete query.disable_editor
    } else {
      query.disable_editor = ''
    }
    router.replace({
      query
    })
    if (import.meta.client && val) {
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

getEditor().then((e) => {
  editor = e
  e?.setValue(html.value)
})

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
</script>

<template>
  <div w-screen h-screen>
    <div p-3 flex="~ items-center">
      <UButton v-if="showEditor" mr-3 @click="html = editor?.getValue() || ''"
        >Rerender HTML</UButton
      >
      <UTooltip text="Show Editor" :popper="{ arrow: true }">
        <UToggle
          on-icon="i-heroicons-check-20-solid"
          off-icon="i-heroicons-x-mark-20-solid"
          v-model="showEditor"
        />
      </UTooltip>
    </div>
    <div h-full flex="~ items-start">
      <div flex-1 h-full id="editor" v-show="showEditor"></div>
      <Transition>
        <iframe
          v-if="showIframe"
          h-full
          flex-1
          ref="iframe"
          src="javascript:void(0);"
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
</style>
