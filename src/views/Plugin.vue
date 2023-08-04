<script setup>
import { ref } from 'vue'

const isOpen = ref(false)

</script>

<template>
    <div class="relative flex flex-col w-full text-lg border-gray-200 rounded border-y" :class="{'shadow' : isOpen}">

       <!-- accordion head  -->
        <div @click="isOpen = !isOpen" class="flex items-center justify-between w-full px-4 py-4 text-base border-gray-200 cursor-pointer bg-slate-50 hover:bg-white" :class="{'border-b' : isOpen}">
            
            <!-- left  -->
            <div class="flex items-center gap-2">
                <span class="flex items-center justify-center w-8 h-8 text-xs font-thin text-white lowercase bg-teal-600 rounded-full">W</span>
                <span class="text-lg font-semibold text-gray-600">WooCommerce</span>
            </div>

            <!-- arrow  -->
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 transition fill-current" :class="{'rotate-90' : !isOpen}" viewBox="0 0 16 16">
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
                    <span v-if="1" class="flex items-center justify-center px-2 py-0.5 text-sm text-white rounded bg-emerald-600">Latest</span>
                    <span v-else class="flex items-center justify-center px-2 py-0.5 text-sm text-white bg-red-400 rounded">Outdated</span>
                </div>
            </div>

            <div class="text-gray-700">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, voluptatum. Quisquam, voluptatum. Quisquam,
                 <a href="https://wordpress.org/plugins/woocommerce/" target="_blank"> 
                     Learn more.</a>
            </div>

            <div>
                <!-- Get more information on WordPress.org  -->
                <a href="https://wordpress.org/plugins/woocommerce/" target="_blank"> 
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 fill-current" viewBox="0 0 16 16">
                        <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1.002 1.002 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4.018 4.018 0 0 1-.128-1.287z"/>
                        <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243L6.586 4.672z"/>
                    </svg> Get more information on WordPress.org</a>
            </div>
        </div>
    </div>
</template> 