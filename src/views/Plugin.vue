<script setup>
import { ref, defineProps, computed, onMounted } from 'vue'
import axios from 'axios';
import useAppStore from '../lib/app';

const props = defineProps({
    slug: {
        type: Object,
        required: true
    }
})

const { Website } = useAppStore()

const slug = computed(() => props.slug)
const isOpen = ref(true)
const listed = ref(false)
const plugin = ref({})


const loadFromWebsite = async () => {
    return new Promise(async (resolve) => {
        const files = [
            'readme.txt',
            'README.txt',
        ]

        for (const file of files) {
            let url = Website.host + '/wp-content/plugins/' + slug.value + '/' + file
            console.log('readme', url);
            axios.get(url)
                .then((response) => {

                    // search name, description using regex 
                    const name = response.data.match(/===\s*(.*)\s*===/)[1] || ''

                    // Note: short description is written here, just before the long description

                    // The Elementor Website Builder has it all: drag and drop page builder, pixel perfect design, mobile responsive editing, and more. Get started now!

                    // == Description ==
                    const description = response.data.match(/\n\n([\s\S]+?)(?=\n== Description ==)/)[1] || ''

                    // Stable tag: 1.2
                    const stableTag = response.data.match(/Stable tag:\s*(.*)/)[1] || ''
                    const requires = response.data.match(/Requires at least:\s*(.*)/)[1] || ''
                    const requires_php = response.data.match(/Requires PHP:\s*(.*)/)[1] || ''
                    const tags = response.data.match(/Tags:\s*(.*)/)[1] || ''
                    const license = response.data.match(/License:\s*(.*)/)[1] || ''
                    const licenseURI = response.data.match(/License URI:\s*(.*)/)[1] || ''
                    const contributors = response.data.match(/Contributors:\s*(.*)/)[1] || ''

                    const newPluginData = {
                        name,
                        description,
                        stableTag,
                        requires,
                        requires_php,
                        tags,
                        license,
                        licenseURI,
                        contributors,
                    }

                    console.log('Plugin from Website', newPluginData);

                    resolve(true)
                }).catch((error) => {
                    console.log('Plugin from website error', error);
                    resolve(false)
                })
        }
    })
}

const tryLoadingLogo = async () => {
    console.log('tryLoadingLogo');
    return new Promise(async (resolve) => {
        const extensions = [
            'svg',
            'png',
            'jpg',
            'jpeg',
            'gif',
        ]

        const sizes = [
            'any',
            '128',
            '256',
            '512',
        ]

        const imgElement = document.getElementById(slug.value + '_logo')
        console.log('imgElement', imgElement);

        for (const extension of extensions) {
            for (const size of sizes) {
                const svnUrl = `https://plugins.svn.wordpress.org/${slug.value}/assets/icon${size !== 'any' ? ('-' + size + 'x' + size) : ''}.${extension}`
                // const url = `https://ps.w.org/${slug.value}/assets/icon${size !== 'any' ? ('-' + size + 'x' + size) : ''}.${extension}`


                // if image loaded successfully, stop trying
                await new Promise((resolve) => {
                    console.log('Plugin logo', svnUrl);
                    // try loading image to the Element, try next if failed
                    imgElement.src = svnUrl

                    imgElement.onload = () => {
                        console.log('Plugin logo loaded', svnUrl);
                        plugin.value.logo = svnUrl
                        resolve(true)
                    }
                    // imgElement.onerror = () => {
                    //     console.log('Plugin logo error', svnUrl);
                    //     resolve(false)
                    // }
                })

                // await new Promise((resolve) => {
                //     
                // })
            }
        }
    })
}

const loadFromOrgAPI = async () => {
    return new Promise(async (resolve) => {
        axios.get(`https://api.wordpress.org/plugins/info/1.2/?action=plugin_information&request[slug]=${slug.value}`)
            .then(response => {
                console.log('Plugin from ORG API', response.data)
                listed.value = true
                plugin.value = response.data
                resolve(true)
            }).catch(error => {
                console.log('Plugin from ORG API error', error)
                resolve(false)
            })
    })
}
const loadPluginsInformation = async () => {
    tryLoadingLogo()
    await loadFromOrgAPI()
    await loadFromWebsite()
}


onMounted(loadPluginsInformation)

</script>

<template>
    <div class="relative flex flex-col w-full text-lg border-gray-200 rounded border-y" :class="{ 'shadow': isOpen }">
        <small>{{ plugin.logo }}</small>
        <!-- accordion head  -->
        <div @click="isOpen = !isOpen"
            class="flex items-center justify-between w-full px-4 py-4 text-base border-gray-200 cursor-pointer bg-slate-50 hover:bg-white"
            :class="{ 'border-b': isOpen }">
            <!-- left  -->
            <div class="flex items-center gap-3">
                <img :id="slug + '_logo'" class="w-0" alt="">
                <img :src="plugin.logo" class="w-8 h-8" alt="">
                <span class="text-lg font-semibold text-gray-600" v-html="plugin.name || 'Unknown'"></span>
            </div>
            <!-- arrow  -->
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 transition fill-current" :class="{ 'rotate-90': !isOpen }"
                viewBox="0 0 16 16">
                <path fill-rule="evenodd"
                    d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z" />
            </svg>
        </div>
        <!-- accordion content  -->
        <div class="flex flex-col gap-5 p-4 text-lg font-thin" v-if="isOpen">
            <div class="font-thin text-gray-700">
                <div class="flex items-center gap-3">
                    <span class="font-thin">Installed</span>
                    <span class="font-medium">v1.2</span>
                    <span v-if="1"
                        class="flex items-center justify-center px-2 py-0.5 text-sm text-white rounded bg-emerald-600">Latest</span>
                    <span v-else
                        class="flex items-center justify-center px-2 py-0.5 text-sm text-white bg-red-400 rounded">Outdated</span>
                </div>
            </div>
            <div class="text-gray-700"> Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, voluptatum.
                Quisquam, voluptatum. Quisquam, <a href="https://wordpress.org/plugins/woocommerce/" target="_blank"> Learn
                    more.</a>
            </div>
            <div>
                <!-- Get more information on WordPress.org  -->
                <a href="https://wordpress.org/plugins/woocommerce/" target="_blank">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 fill-current" viewBox="0 0 16 16">
                        <path
                            d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1.002 1.002 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4.018 4.018 0 0 1-.128-1.287z" />
                        <path
                            d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243L6.586 4.672z" />
                    </svg> Get more information on WordPress.org</a>
            </div>
        </div>
    </div>
</template> 