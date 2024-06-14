export async function getEditor(onEditorCreate: () => void) {
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

export type Editor = Awaited<ReturnType<typeof getEditor>>
