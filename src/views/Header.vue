<script setup>
import { computed } from 'vue'
import useAppStore from '../lib/app'
const { Website, state } = useAppStore()


const siteTitle = computed(() => {
    if (!Website.html) return ''

    const domain = Website.url.replace('https://', '').replace('http://', '').replace('www.', '').split(/[./?#]/)[0]

    let titleText = Website.html.match(/<title[^>]*>([^<]+)<\/title>/)[1] || ''
    let finalTitle = titleText || domain

    if (titleText) {

        titleText = titleText.split(/[^a-zA-Z0-1 ]+/).map(part => part.trim())

        if (titleText.length > 1) {
            finalTitle = titleText.find(part => {
                const partText = part.toLowerCase().replace(/[^a-z0-9]/g, '').trim()
                return partText.includes(domain) || domain.includes(partText)
            }) || titleText[0]
        } else {
            finalTitle = titleText[0]
        }
    } else {
        finalTitle = domain
    }

    return !finalTitle || finalTitle.length > 100 ? (domain.split('')[0].toUpperCase() + domain.split('').slice(1, 50).join('')) : finalTitle

})

const headerText = computed(() => {
    // if loading
    if (state.isLoading) {
        if (typeof state.isLoading === 'string') return state.isLoading
        return 'Scanning ' + (siteTitle.value.length > 20 ? siteTitle.value.substr(0, 20) + '...' : siteTitle.value)
    }

    return Website.isWordPress ? 'WordPress Detected!' : 'Not a WordPress!'
})

</script>
<template>
    <!-- header  -->
    <header class="tracking-wide bg-white border-b border-slate-200">
        <h1 class="flex items-center justify-center gap-3 px-3 py-4 text-gray-700">
            <svg v-if="!state.isLoading" xmlns="http://www.w3.org/2000/svg" :class="{
                'text-teal-600': Website.isWordPress,
                'text-red-400': !Website.isWordPress
            }" class="w-6 rounded-full fill-current" viewBox="0 0 16 16">
                <path v-if="Website.isWordPress" fill-rule="evenodd" d="M2.854 15.854A.5.5 0 0 1 2 15.5V14H.5a.5.5 0 0 1-.354-.854l1.5-1.5A.5.5 0 0 1 2 11.5h1.793l3.103-3.104a.5.5 0 1 1 .708.708L4.5 12.207V14a.5.5 0 0 1-.146.354l-1.5 1.5ZM16 3.5a.5.5 0 0 1-.854.354L14 2.707l-1.006 1.006c.236.248.44.531.6.845.562 1.096.585 2.517-.213 4.092-.793 1.563-2.395 3.288-5.105 5.08L8 13.912l-.276-.182A23.825 23.825 0 0 1 5.8 12.323L8.31 9.81a1.5 1.5 0 0 0-2.122-2.122L3.657 10.22a8.827 8.827 0 0 1-1.039-1.57c-.798-1.576-.775-2.997-.213-4.093C3.426 2.565 6.18 1.809 8 3.233c1.25-.98 2.944-.928 4.212-.152L13.292 2 12.147.854A.5.5 0 0 1 12.5 0h3a.5.5 0 0 1 .5.5v3Z"/>
                <path v-else d="M8.931.586 7 3l1.5 4-2 3L8 15C22.534 5.396 13.757-2.21 8.931.586ZM7.358.77 5.5 3 7 7l-1.5 3 1.815 4.537C-6.533 4.96 2.685-2.467 7.358.77Z"/>
            </svg>
           
            <span v-if="state.isLoading"
                class="flex items-center justify-center w-5 h-5 border-2 border-teal-600 rounded-full border-t-transparent animate-spin"></span>
            <span class="text-xl font-medium">{{ headerText }}</span>
        </h1>
        <div v-if="!state.isLoading" class="px-4 mb-3 text-base text-center text-gray-600">
            <span v-if="Website.isWordPress"> <u>{{ siteTitle }}</u> is running under {{ Website.isHeadlessWordPress ? ' Headless ' : '' }} WordPress </span>
            <span v-if="!Website.isWordPress"> <u>{{ siteTitle }}</u> is not running under WordPress </span>
        </div>
    </header>
</template>