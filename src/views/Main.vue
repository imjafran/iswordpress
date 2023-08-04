<script setup>
import { ref, onMounted } from 'vue'
import Header from './Header.vue'
import Plugins from './Plugins.vue'
import Theme from './Theme.vue'
import Security from './Security.vue'
import useAppStore from '../lib/app'
const { state, tabs, setTab, isTab, scanWebsite } = useAppStore()

// onMounted(scanWebsite)

</script>
<template>
  <div style="max-height: 600px; width: 400px;" class="relative flex flex-col gap-5 overflow-scroll bg-white scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-teal-600 rounded-b-md">

    <!-- header  -->
    <Header />
    <!-- main  -->
    <main>
      <div class="flex items-center justify-center gap-2 px-4 text-xl font-thin tracking-wide text-slate-400">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 fill-current" viewBox="0 0 16 16">
          <path fill-rule="evenodd"
            d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z" />
        </svg>
        <span class="flex items-center gap-1 p-2 cursor-pointer hover:underline" v-for="(index, tab) in tabs" :class="{
          'text-teal-600 underline': isTab(tab),
        }" @click="setTab(tab)" :key="index"> 
        {{ index }}</span>
      </div>

      <!-- views  -->
      <Theme v-if="isTab('theme')" />
      <Plugins v-if="isTab('plugins')" />
      <Security v-if="isTab('security')" />
      
    </main>
    <!-- footer  -->
    <footer>
      <div class="text-center text-gray-500">
        Developed by <a href="//fb.com/IamJafran" target="_blank">Jafran Hasan</a>
      </div>
    </footer>
  </div>
</template>