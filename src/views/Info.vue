<script setup>
import { computed, onMounted, ref } from 'vue'
import Spinner from './Spinner.vue';
import axios from 'axios';
import useAppStore from '../lib/app';

const { WordPress, state, Website } = useAppStore()

const ip = ref({})
const server = ref({})

const lookUpIP = async () => {
    return new Promise((resolve) => {
        axios.get('http://ip-api.com/json/' + Website.url.replace('https://', '').replace('http://', ''))
            .then(response => {
                if ('status' in response.data && response.data.status === "success") {
                    ip.value = response.data
                    resolve(response.data.query)
                }

                resolve(false)
            }).catch(error => {
                resolve(false)
            })
    })
}

const lookUpServer = async () => {
    const ipAddr = await lookUpIP()
    if (ipAddr) {
        axios.get('http://ip-api.com/json/' + ipAddr)
            .then(response => {
                console.log('server', response.data);
                if ('status' in response.data && response.data.status === 'success') {
                    server.value = response.data
                }
            }).catch(error => {
                console.log(error)
            })
    }
}

const serverTime = computed( () => {
    if (WordPress.gmt_offset) {
        const offset = WordPress.gmt_offset * 60 * 60 * 1000
        const date = new Date(Date.now() + offset).toLocaleString()
        return date
    }

    return '' 
})

const isIPv4 = computed(() => {
    if (ip.value.query) {
        return ip.value.query.split('.').length === 4
    }

    return false
})

// last 5 posts 
const posts = ref([])
const loadPosts = async () => {
    const postAPI = Website.url + '/wp-json/wp/v2/posts?per_page=5&order=desc'
    axios.get(postAPI)
        .then(response => {
            posts.value = response.data
        }).catch(error => {
            console.log(error)
        })
}

onMounted(lookUpServer)
onMounted(loadPosts)

</script>

<template> 
    <div class="flex flex-col w-full px-6 py-2 text-lg text-gray-600">
        <Spinner v-if="state.deepScanning">Loading website information</Spinner>
        <div v-else class="flex flex-col gap-4">
            <h3 class="text-xl font-medium">Basic info</h3>
            <div class="flex text-gray-700">
                <span class="w-32 text-gray-400">Icon</span>
                <span class="w-full"><img class="w-8"
                        :src="WordPress.site_icon_url || 'https://www.google.com/s2/favicons?domain=' + Website.url" /></span>
            </div>
            <div class="flex items-center text-gray-700">
                <span class="w-32 text-gray-400">Name</span>
                <span class="w-full">{{ WordPress.name }}</span>
            </div>
            <div class="flex items-center text-gray-700">
                <span class="w-32 text-gray-400">URL</span>
                <span class="w-full text-base"><a :href="WordPress.url" target="_blank">{{ WordPress.url }}</a></span>
            </div>
            <div class="flex items-center text-gray-700">
                <span class="w-32 text-gray-400">Time</span>
                <span class="w-full">{{ serverTime }}</span>
            </div>
            <div class="flex flex-col text-gray-700">
                <span class="w-32 text-gray-400">Description</span>
                <span class="w-full">{{ WordPress.description }}</span>
            </div>

            <h3 class="pt-6 text-xl font-medium">Server info</h3>

            <div class="flex items-center text-gray-700">
                <span class="w-32 text-gray-400">IP {{ isIPv4 ? 'v4' : 'v6' }}</span>
                <span class="w-full">{{ server.query }}</span>
            </div>
            <div class="flex items-center text-gray-700">
                <span class="w-32 text-gray-400">Hosting</span>
                <span class="w-full">{{ server.org }}</span>
            </div> 
 
            <div class="flex items-center text-gray-700">
                <span class="w-32 text-gray-400">Timezone</span>
                <span class="w-full">{{ server.timezone }}</span>
            </div>

            <div class="flex text-gray-700">
                <span class="w-32 text-gray-400">Location</span>
                <span class="w-full">
                    {{ server.city }},
                    {{ server.regionName }},
                    {{ server.country }},
                    {{ server.zip }}              
                </span>
            </div>
 

            <h3 class="pt-6 text-xl font-medium">Last {{ posts.length }} posts</h3>

            <div class="flex flex-col gap-2">
               <div v-for="post in posts" class="flex flex-col">
                    <a class="cursor-pointer" :href="post.link.rendered" target="_blank" v-html="post.title.rendered"></a>
                    <span class="text-sm text-gray-400">{{ (new Date(post.date_gmt)).toLocaleString() }}</span>
               </div>
            </div>
        </div>
    </div>
</template> 