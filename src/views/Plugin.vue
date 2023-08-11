<script setup>
import { ref, defineProps, computed, reactive, onMounted } from 'vue'
import axios from 'axios';
import useAppStore from '../lib/app';
import Spinner from './Spinner.vue';

const props = defineProps({
    plugin: {
        type: Object,
        required: true,
        default: () => {
            return {}
        }
    },
    slug: {
        type: Object,
        required: true
    }
})

const { Website, WordPress } = useAppStore()

const isOpen = ref(false)
const listed = ref(false)

const plugin = ref({
    ...props.plugin,
    loading: true,
})
const slug = computed(() => plugin.value.slug)

const tryLoadingLogo = async () => {

    const extensions = [
        'svg',
        'gif',
        'png',
        'jpg',
        'jpeg',
    ]

    const sizes = [
        null,
        '128',
        '256',
        '512',
    ]

    const imgElement = document.getElementById(slug.value + '_logo')

    let extensionIndex = 0
    let sizeIndex = 0
    let lastChanged = 'extension'

    const loadLogo = async () => {

        return new Promise(async (resolve) => {
            let extension = extensions[extensionIndex] || 'svg'
            let size = sizes[sizeIndex] || null
            const imageURL = `https://plugins.svn.wordpress.org/${plugin.value.slug}/assets/icon${size ? ('-' + size + 'x' + size) : ''}.${extension}`

            if (!imgElement) return resolve(false)

            imgElement.src = imageURL

            imgElement.onload = () => {
                plugin.value.logo = imageURL
                resolve(true)
            }

            imgElement.onerror = () => {

                if (extensionIndex < extensions.length && sizeIndex < sizes.length) {

                    if (lastChanged === 'extension') {
                        extensionIndex++
                        lastChanged = 'size'
                    } else {
                        sizeIndex++
                        lastChanged = 'extension'
                    }

                    loadLogo()
                } else {
                    // set a default logo 
                    console.log('No logo found', slug.value);
                    // dummy image 

                    imgElement.src = 'https://dummyimage.com/512x512/000/fff&text=' + slug.value
                    resolve(true)
                }
            }

            // await new Promise(r => setTimeout(r, 500));

        })

    }

    await loadLogo()

}

const loadFromWebsite = async () => {
    return new Promise(async (resolve) => {
        const files = [
            'readme.txt',
            'README.txt',
        ]

        for (const file of files) {
            let url = Website.url + '/wp-content/plugins/' + plugin.value.slug + '/' + file
            axios.get(url)
                .then((response) => {

                    // search name, description using regex 
                    const name = response.data.match(/===\s*(.*)\s*===/)[1] || ''

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
                    const textDomain = response.data

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
                        textDomain
                    }


                    plugin.value = {
                        ...plugin.value,
                        ...newPluginData,
                    }

                    resolve(true)
                }).catch((error) => {
                    plugin.value.noreadme = true
                    resolve(false)
                }).finally(() => {
                    plugin.value.loading = false
                })
        }
    })
}



const loadFromOrgAPI = async (search = false) => {
    return new Promise(async (resolve) => {

        const url = search ? `https://api.wordpress.org/plugins/info/1.2/?action=query_plugins&request[search]=${plugin.value.slug}` : `https://api.wordpress.org/plugins/info/1.2/?action=plugin_information&request[slug]=${plugin.value.slug}`
        axios.get(url)
            .then(response => {
                // console.log('Plugin from ORG API', response.data)
                listed.value = true
                const { name, version, homepage, banners, rating, slug } = search ? response.data.plugins[0] : response.data
                plugin.value = {
                    ...plugin.value,
                    name,
                    version,
                    homepage,
                    banners,
                    rating,
                    slug,
                    listed: true,
                }

                resolve(true)
            }).catch(error => {
                plugin.value.listed = false
                // console.log('Plugin from ORG API error', error)

                if (search) {
                    resolve(false)
                    return
                }


                // Bail if the plugin source is namespace
                if (plugin.value.source === 'content') {
                    plugin.value.loading = false
                    resolve(false)
                    return
                }
                // try searching
                loadFromOrgAPI(true).then((result) => {
                    resolve(result)
                })
            }).finally(() => {
                plugin.value.loading = false
                resolve(true)
            })
    })
}
const loadPluginsInformation = async () => {

    // if( slug.value in WordPress.plugins && WordPress.plugins[slug.value] ) {
    //     console.log('Plugin already loaded', slug.value);
    //     plugin.value = WordPress.plugins[slug.value]
    //     plugin.value.loading = false
    //     return
    // }



    loadFromWebsite()
    loadFromOrgAPI()
    tryLoadingLogo()

    // console.log('Adding plugin to WordPress.plugins', slug.value, plugin.value);
    // WordPress.plugins[slug.value] = plugin.value
}

const pluginName = computed(() => {
    if (!plugin.value.name) {
        // first character uppercase and remove dashes
        return slug.value.replace(/-/g, ' ').replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase())
    }
    return plugin.value.name
})

const shortName = computed(() => {
    return pluginName.value.slice(0, 30) + (pluginName.value.length > 30 ? '...' : '')
})

onMounted(() => {
    setTimeout(loadPluginsInformation, 50)
    plugin.value.slug = slug.value
})

</script>

<template>
    <div class="relative flex flex-col w-full text-lg border-gray-200 rounded border-y" :class="{
        'shadow': isOpen,
    }">
        <!-- accordion head  -->
        <div @click="isOpen = !isOpen"
            class="flex items-center justify-between w-full px-4 py-4 text-base border-gray-200 cursor-pointer bg-slate-50 hover:bg-white"
            :class="{ 'border-b': isOpen }">
            <!-- left  -->
            <div class="flex items-center gap-3">
                <img :id="plugin.slug + '_logo'" class="w-8 h-8" alt="">
                <span class="text-lg font-semibold text-gray-600" v-html="shortName"></span>
            </div>
            <!-- arrow  -->
            <Spinner v-if="plugin.loading"></Spinner>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 transition fill-current" :class="{ 'rotate-90': !isOpen }"
                viewBox="0 0 16 16">
                <path fill-rule="evenodd"
                    d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z" />
            </svg>
        </div>
        <!-- accordion content  -->
        <div v-if="isOpen" class="flex flex-col gap-5 p-4 text-lg font-thin">
            <div v-if="plugin.loading">
                <Spinner>Loading plugin information</Spinner>
            </div>
            <h3 class="text-lg font-medium" v-html="pluginName"></h3>
            <img class="w-full h-auto"
                :src="plugin.banners && plugin.banners.high ? plugin.banners.high : 'https://via.placeholder.com/300x150.png?text=Banner+not+found'">
            <div class="font-thin text-gray-700">
                <div class="flex items-center gap-3">
                    <span class="font-thin text-gray-500">Installed</span>
                    <span class="font-medium"> {{ plugin.stableTag }} </span>
                    <span v-if="plugin.stableTag === plugin.version"
                        class="flex items-center justify-center px-2 py-0.5 text-sm  rounded bg-emerald-50 text-emerald-500">Latest</span>
                    <span v-else
                        class="flex items-center justify-center px-2 py-0.5 text-sm text-red-500 bg-red-50 rounded">Outdated</span>
                </div>
            </div>
            <div class="text-base text-gray-500"> {{ plugin.description }} </div>
            <div class="text-base">
                <!-- Get more information on WordPress.org  -->
                <a v-if="plugin.listed" :href="`https://wordpress.org/plugins/` + slug" target="_blank">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 fill-current" viewBox="0 0 16 16">
                        <path
                            d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1.002 1.002 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4.018 4.018 0 0 1-.128-1.287z" />
                        <path
                            d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243L6.586 4.672z" />
                    </svg> Learn more on WordPress.org</a>
                <span v-if="plugin.listed === false"> The plugin is not listed on WordPress.org </span>
            </div>
        </div>
    </div>
</template> 