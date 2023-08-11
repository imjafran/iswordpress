<script setup>
import { computed } from 'vue'
import Spinner from './Spinner.vue'
import Plugin from './Plugin.vue'
import useAppStore from '../lib/app';

const { state, WordPress } = useAppStore()

const plugins = computed(() => {
    if (!WordPress.plugins) return {};
    return WordPress.plugins || {}
})

const pluginsLength = computed(() => {
    if (!plugins.value) return 0;
    return Object.keys(plugins.value).length
})


</script>

<template>
    <div class="relative flex flex-col gap-5 my-3 text-lg text-slate-700">
        
        <div class="flex items-center justify-center my-3 text-center">
            <!-- count  -->
            <span v-if="!state.loadingPlugins" class="flex items-center justify-center gap-1 text-xl text-gray-600"> 
                <svg  xmlns="http://www.w3.org/2000/svg"
                    class="w-6 text-teal-600 fill-current" viewBox="0 0 16 16">
                    <path
                        d="M6 0a.5.5 0 0 1 .5.5V3h3V.5a.5.5 0 0 1 1 0V3h1a.5.5 0 0 1 .5.5v3A3.5 3.5 0 0 1 8.5 10c-.002.434-.01.845-.04 1.22-.041.514-.126 1.003-.317 1.424a2.083 2.083 0 0 1-.97 1.028C6.725 13.9 6.169 14 5.5 14c-.998 0-1.61.33-1.974.718A1.922 1.922 0 0 0 3 16H2c0-.616.232-1.367.797-1.968C3.374 13.42 4.261 13 5.5 13c.581 0 .962-.088 1.218-.219.241-.123.4-.3.514-.55.121-.266.193-.621.23-1.09.027-.34.035-.718.037-1.141A3.5 3.5 0 0 1 4 6.5v-3a.5.5 0 0 1 .5-.5h1V.5A.5.5 0 0 1 6 0z" />
                </svg> Found total {{ pluginsLength }} plugin{{pluginsLength === 1 ? '' : 's'}}</span>

            <!-- loader  -->
            <Spinner v-else>{{ state.loadingPlugins === true ? 'Scanning plugins..' : state.loadingPlugins}}</Spinner> 
        </div>

        <!-- list  -->
        <div class="flex flex-col gap-3">
            <Plugin v-for="plugin in plugins" :plugin="plugin"/>
        </div>
    </div>
</template>