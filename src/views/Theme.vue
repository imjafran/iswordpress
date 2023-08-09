<script setup>
import { computed, ref, onMounted } from 'vue'
import Spinner from './Spinner.vue';
import useAppStore from '../lib/app.js'
const { state, WordPress, Website } = useAppStore()

const theme = computed(() => {
    if (state.loadingTheme) return null
    if (!WordPress.theme) return null
    return WordPress.theme || null
})

const showFullDescription = ref(false)

const excerpt = computed(() => {
    if (!theme) return ''
    let description = theme.value.sections?.description || theme.value.description
    if (!description) return ''
    if (showFullDescription.value) return description
    return description.slice(0, 200) + (description > 200 ? '...' : '')
})

 

</script>

<template>
    <section class="px-4 my-3 text-lg text-slate-400">
        <!-- loader  -->
        <div v-if="state.loadingTheme" class="my-6 text-center">
            <Spinner>{{ state.loadingTheme === true ? 'Scanning theme...' : state.loadingTheme }}</Spinner>
        </div>
        <div v-if="!state.loadingTheme && !theme" class="px-6 text-center"> Theme not detected due to headless architecture ! </div>
        <!-- theme  -->
        <div v-if="!state.loadingTheme && theme" class="flex flex-col gap-3">
            <!-- basic  -->
            <div class="w-full mx-auto bg-white">
                <img id="theme_screenshot" 
                    class="w-full transition rounded ring-1 ring-transparent hover:ring-slate-300 hover:shadow">
            </div>
            <!-- theme information  -->
            <div class="flex flex-col w-full gap-4 px-4 font-thin ">
                <!-- name  -->
                <div class="flex gap-4 transition rounded">
                    <span class="w-32 font-thin text-gray-400">Name: </span>
                    <a class="w-full" :href="theme.theme_uri || theme.homepage || 'javascript:;'" target="_blank">{{
                        theme.name }}</a>
                </div>
                <!-- author  -->
                <div v-if="theme.author || theme.author_uri" class="flex gap-4 transition rounded">
                    <span class="w-32 font-thin text-gray-400">Author: </span>
                    <a class="w-full" :href="theme.author_uri || 'javascript:;'" target="_blank">{{ theme.author || 'Unknown author' }}</a>
                </div>
                <!-- version  -->
                <div v-if="theme.version || theme.latest_version" class="flex gap-4 transition rounded">
                    <span class="w-32 font-thin text-gray-400">Version: </span>
                    <span class="w-full">{{ theme.version || 'Unknown' }} <span v-if="theme.latest_version"
                            class="px-2 py-1 ml-4 text-sm rounded" :class="{
                                'bg-emerald-50 text-emerald-500': theme.latest_version === theme.version,
                                'bg-rose-50 text-rose-500': theme.latest_version !== theme.version
                            }">{{ theme.latest_version === theme.version ? 'Latest' : 'Update available' }}</span></span>
                </div>
                <!-- requires  -->
                <div v-if="theme.requires || theme.requires_at_least" class="flex gap-4 transition rounded">
                    <span class="w-32 font-thin text-gray-400">Requires: </span>
                    <span class="w-full"> {{ theme.requires || theme.requires_at_least }} or later</span>
                </div>
                <!-- requires_php  -->
                <div v-if="theme.requires_php" class="flex gap-4 transition rounded">
                    <span class="w-32 font-thin text-gray-400">PHP: </span>
                    <span class="w-full"> {{ theme.requires_php }} or later</span>
                </div>
                <!-- tags  -->
                <div v-if="theme.tags && theme.tags.length" class="flex flex-col gap-2 transition rounded">
                    <span class="font-thin text-gray-400">Tags (found {{ Object.keys(theme.tags).length || 0 }}):
                    <a href="#" class="text-base" @click.prevent="state.showTags = ! state.showTags"> 
                        {{ state.showTags ? 'Hide' : 'Show' }} tags</a>
                    </span>
                    <div v-if="state.showTags" class="flex flex-wrap w-full gap-2 text-base text-slate-500">
                        <a v-for="(tagName, tag) in theme.tags" class="rounded cursor-pointer">{{ tagName }}</a>
                    </div>
                </div>
                <!-- description  -->
                <div v-if="excerpt" class="flex flex-col gap-2 transition rounded">
                    <span class="font-thin text-gray-400">Short description: </span>
                    <div class="text-base text-slate-500"> {{ excerpt }} <a href="#"
                            @click.prevent="showFullDescription = !showFullDescription">Read {{ showFullDescription ? 'less'
                                : 'more' }}</a></div>
                </div>
            </div>
            <div class="flex flex-col gap-2 mx-4 text-base">
                <a v-if="theme.homepage" :href="theme.homepage" target="_blank" class="mt-2"> Visit homepage</a>
                <a v-if="theme.listed" :href="`https://wordpress.org/themes/${theme.slug}/`" target="_blank">Learn more on WordPress.org</a>
            </div>
        </div>
    </section>
</template>