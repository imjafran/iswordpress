<script setup>
import { computed } from 'vue'
import useAppStore from '../lib/app'
const { Website, isLoading, state, getHTMLContent } = useAppStore()


const siteTitle = computed(() => {
    if (!Website.html) return ''
    // search title in html 
    const title = Website.html.match(/<title[^>]*>([^<]+)<\/title>/)[1] || ''
    if (title) {
        // try to remove other tags from title, split by special character and return first part using regex
        const titleParts = title.replace(/<[^>]*>?/gm, '').split(/[\s-]+/)
        const titleText = titleParts[0]
        return titleText || ''
    }

    // Return domain name without tld if title is empty
    const domain = Website.domain.replace('www.', '')
    const domainParts = domain.split('.')
    const domainName = domainParts[0]
    return domainName || ''
})

const titleText = computed(() => {
   // if loading
    if (state.isLoading) return 'Scanning ' + siteTitle.value

    // if Website is not wordpress
    if (Website.isWordPress) {
            // if Website is headless
        if (Website.isHeadless) return 'Headless WordPress!'
        // If Website is backend wordpress
        if (Website.isBackend) return 'Backend WordPress!'

        return 'WordPress Inside!'
    }

    return 'Not WordPress!'
})

</script>
<template>
    <div> <!-- close  -->
        <button
            class="absolute px-1 py-1 text-gray-300 transition duration-100 cursor-pointer hover:text-gray-700 right-1 top-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-auto fill-current" viewBox="0 0 16 16">
                <path
                    d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
            </svg>
        </button>
        <!-- header  -->
        <header class="sticky top-0 tracking-wide border-b border-slate-200">
            <h1 class="flex items-center justify-center gap-3 px-3 py-4 text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 text-teal-600 rounded-full fill-current"
                    viewBox="0 0 16 16">
                    <path fill-rule="evenodd"
                        d="M2.854 15.854A.5.5 0 0 1 2 15.5V14H.5a.5.5 0 0 1-.354-.854l1.5-1.5A.5.5 0 0 1 2 11.5h1.793l.53-.53c-.771-.802-1.328-1.58-1.704-2.32-.798-1.575-.775-2.996-.213-4.092C3.426 2.565 6.18 1.809 8 3.233c1.25-.98 2.944-.928 4.212-.152L13.292 2 12.147.854A.5.5 0 0 1 12.5 0h3a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.854.354L14 2.707l-1.006 1.006c.236.248.44.531.6.845.562 1.096.585 2.517-.213 4.092-.793 1.563-2.395 3.288-5.105 5.08L8 13.912l-.276-.182a21.86 21.86 0 0 1-2.685-2.062l-.539.54V14a.5.5 0 0 1-.146.354l-1.5 1.5Zm2.893-4.894A20.419 20.419 0 0 0 8 12.71c2.456-1.666 3.827-3.207 4.489-4.512.679-1.34.607-2.42.215-3.185-.817-1.595-3.087-2.054-4.346-.761L8 4.62l-.358-.368c-1.259-1.293-3.53-.834-4.346.761-.392.766-.464 1.845.215 3.185.323.636.815 1.33 1.519 2.065l1.866-1.867a.5.5 0 1 1 .708.708L5.747 10.96Z" />
                </svg>
                <span class="text-2xl font-thin">{{ titleText || 'Scaning...' }}</span>
            </h1>
        </header>
    </div>
</template>