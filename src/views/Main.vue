<script setup>
import { ref, computed } from 'vue'
import Header from './Header.vue'
import Plugins from './Plugins.vue'
import Theme from './Theme.vue'
import Info from './Info.vue'
import useAppStore from '../lib/app'
const { state, Website } = useAppStore()

const tabs = computed(() => {
  return {
    theme: 'Theme',
    plugins: 'Plugins',
    info: 'Information',
  }
})

</script>
<template>
  <div style="max-height: 600px; width: 350px;"
    class="relative flex flex-col gap-3 overflow-auto bg-white scrollbar-none scrollbar-track-gray-100 scrollbar-thumb-teal-600 rounded-b-md">
    <!-- header  -->
    <Header />
    <!-- main  -->
    <main v-if="Website.isWordPress && !state.isLoading">
      <div
        class="sticky top-0 z-50 flex items-center justify-center gap-2 px-4 text-xl font-thin tracking-wide bg-white text-slate-400">
         
        <span class="flex items-center gap-1 p-2 cursor-pointer hover:underline" v-for="(index, tab) in tabs" :class="{
          'text-teal-600 underline': state.currentTab === tab,
        }" @click="state.currentTab = tab" :key="index"> {{ index }}</span>
      </div>
      <!-- views  -->
      <section v-show="state.currentTab === 'theme'">
        <Theme />
      </section>
      <section v-show="state.currentTab === 'plugins'">
        <Plugins />
      </section>
      <section v-show="state.currentTab === 'info'">
        <Info />
      </section>
    </main>
    <!-- footer  -->
    <footer v-if="!state.isLoading">
      <div class="pb-3 text-center text-gray-400">Developed by <a title="Jafran Hasan" class="text-gray-400" href="//fb.com/IamJafran" target="_blank">Jafran Hasan</a>
      </div>
    </footer>
  </div>
</template>