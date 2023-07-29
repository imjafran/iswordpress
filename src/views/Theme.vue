<script setup>
import Spinner from './Spinner.vue';
import useApp from '../lib/app.js'
const { themeLoaded } = useApp()
</script>

<template>
    <section class="px-4 my-3 text-lg text-slate-400">
        <!-- loader  -->
        <div v-if="!themeLoaded" class="my-6">
            <Spinner >Scanning theme</Spinner>
        </div>

        <!-- theme  -->
        <div v-else class="flex flex-col gap-3">
            <!-- basic  -->
            <div class="mx-auto bg-white w-44">
                <span class="absolute text-xs -translate-x-1/2 bottom-2 left-1/2">Screenshot</span>
                <img src="https://wppool.dev/wp-content/themes/wppool/screenshot.png"
                    class="w-full transition rounded ring-1 ring-transparent hover:ring-slate-300 hover:shadow">
            </div>
            <!-- theme information  -->
            <div class="flex flex-col w-full font-thin divide-y divide-slate-100">
                <div class="flex gap-4 px-4 py-1 transition rounded" v-for="info in 10">
                    <span class="font-thin text-gray-400">Name </span>
                    <span class="text-slate-700">lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam,
                        voluptatum. Quisquam, voluptatum. Quisquam,</span>
                </div>
            </div>
            <div class="flex flex-col gap-2 mx-4">
                <a href="https://wordpress.org/plugins/woocommerce/" target="_blank" class="mt-2"> Visit homepage</a>
                <a href="https://wordpress.org/themes/twentytwenty/" target="_blank">Get more information on
                    WordPress.org</a>
            </div>
        </div>
    </section>
</template>