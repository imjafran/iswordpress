<script setup>
import { onMounted, ref } from 'vue'
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
                if ('status' in response.data && response.data.status === '') {
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
        axios.get('https://api.hackertarget.com/httpheaders/?q=' + ipAddr)
            .then(response => {
                if (response.data) {
                    const serverData = response.data.split('\n').map((item) => {
                        const [key, value] = item.split(': ')
                        return { key, value }
                    })

                    server.value = serverData
                }
            }).catch(error => {
                console.log(error)
            })
    }
}

onMounted(lookUpIP)

</script>

<template>
    <div class="flex flex-col w-full px-6 py-2 text-lg text-gray-600">
        <Spinner v-if="state.deepScanning">Loading website information</Spinner>
        <div v-else class="flex flex-col gap-4">
            <div class="flex items-center text-gray-700">
                <span class="w-32 text-gray-400">Favicon</span>
                <span class="w-full"><img class="w-6"
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
                <span class="w-32 text-gray-400">Timezone</span>
                <span class="w-full">{{ WordPress.gmt_offset }}</span>
            </div>
            <div class="flex flex-col items-center text-gray-700">
                <span class="w-32 text-gray-400">Description</span>
                <span class="w-full">{{ WordPress.description }}</span>
            </div>
        </div>
    </div>
</template> 