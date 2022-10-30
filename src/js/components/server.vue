<template>
  <div class="w-full">
    <!-- loader  -->
    <div
      v-if="isLoading"
      class="flex items-center justify-between gap-3 animate-pulse w-full"
    >
      <div class="h-12 w-full bg-slate-600 rounded-sm"></div>
      <div class="h-12 w-20 bg-slate-600 rounded-sm"></div>
    </div>

    <!-- information  -->
    <div v-else>
      Lorem ipsum, dolor sit amet consectetur adipisicing elit. Quasi enim velit deserunt, voluptatem impedit, nesciunt, maxime expedita quidem laboriosam veritatis in cum amet temporibus quaerat officiis. Cumque fugiat eos numquam.
    </div>
  </div>
</template>

<script> 
import { Read } from "./../helpers"
export default {
  name: "Server",
   
  data() {
    return {
      isLoading: true, 
      data: {}, 
    };
  },
  computed: {
     
  },
  methods: {

    async API(url = ''){ 
      url = this.$root.getUrl + "wp-json/" + url;

      return await Read(url); 
    },

    async lookupHost() {
      this.isLoading = true;
      const host = this.$root.host

      // lookup host 
      const response = await Read(`https://api.wordpress.org/core/version-check/1.7/?locale=en_US&version=5.8&php=7.4&mysql=5.6&local_package=fr_FR&blogs=1&multisite=0&initial_db_version=0&url=${host}&locale=en_US&packages=full&tz=Europe%2FParis&skip_cache=1`)

      console.log(response); 

    },

    async initServer()
    {
      
    }
  },
  async mounted() {
    await this.lookupHost();
    this.isLoading = false;
  },
};
</script>