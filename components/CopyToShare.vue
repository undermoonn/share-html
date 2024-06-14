<script lang="ts" setup>
const { isShared, share } = useShare()

function useShare() {
  const isShared = ref(false)

  function share() {
    const url = new URL(location.href)
    url.searchParams.set('mode', 'share')
    const shareUrl = url.toString()
    navigator.clipboard.writeText(shareUrl)
    isShared.value = true
    setTimeout(() => {
      isShared.value = false
    }, 1000)
  }

  return { isShared, share }
}
</script>

<template>
  <button class="mr-3 group" @click="share">
    <i
      :class="[
        isShared
          ? 'i-ep:success-filled'
          : 'i-ph:share-bold group-hover:i-ic:baseline-file-copy'
      ]"
    />
  </button>
</template>
