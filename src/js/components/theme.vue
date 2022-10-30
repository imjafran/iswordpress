<template>
  <div class="w-full">
    <!-- loader  -->
    <div class="w-full flex-col gap-3 bg-slate-700" v-if="isLoading">
      <div class="flex items-center justify-between mb-2 animate-pulse">
        <div class="h-28 w-full bg-slate-600 rounded-md"></div>
      </div>

      <div class="flex gap-2 animate-pulse">
        <div class="h-8 w-1/3 bg-slate-600 rounded-md"></div>
        <div class="h-8 w-2/3 bg-slate-600 rounded-md"></div>
      </div>
    </div>

    <!-- content  -->
    <div v-else>
      <div
        class="bg-white w-full mb-2 rounded-sm relative" 
      >
        <a
          v-if="screenshot"
          class="
            cursor-pointer
            text-white
            hover:bg-sky-400 hover:no-underline
            bg-sky-500
            w-8
            h-6 
            rounded-md
            absolute
            right-2
            top-2
            flex
            items-center
            justify-center
          "
          :href="screenshot"
          target="_blank"
          >
          
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="fill-current w-3"
            viewBox="0 0 16 16"
          >
            <path
              fill-rule="evenodd"
              d="M6.5 12a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11zM13 6.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z"
            />
            <path
              d="M10.344 11.742c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1 6.538 6.538 0 0 1-1.398 1.4z"
            />
            <path
              fill-rule="evenodd"
              d="M6.5 3a.5.5 0 0 1 .5.5V6h2.5a.5.5 0 0 1 0 1H7v2.5a.5.5 0 0 1-1 0V7H3.5a.5.5 0 0 1 0-1H6V3.5a.5.5 0 0 1 .5-.5z"
            /></svg>
          
          </a>
        <img
          data-id="screenshot"
          class="mx-auto max-h-32 "
          :src="
            getScreenshot
          "
        />
      </div> 

      <div class="flex flex-col gap-1 w-full text-base">

        <div class="flex gap-3  w-full" v-if="data.name">
          <span class="text-slate-500 w-1/2">Name: </span>
          <p class="w-full"><a target="_blank" :href="data.theme_uri || '#'">{{data.name}}</a></p>
        </div>

        <div class="flex gap-3  w-full" v-if="data.author">
          <span class="text-slate-500 w-1/2">Author: </span>
          <p class="w-full"><a target="_blank" :href="data.author_uri || '#'">{{data.author}}</a></p>
        </div>

        <div class="flex gap-3 w-full" v-if="orgData.version">
          <span class="text-slate-500 w-1/2">Latest: </span>
          <p class="w-full">{{orgData.version}}</p>
        </div>
        <div class="flex gap-3 w-full" v-if="data.version">
          <span class="text-slate-500 w-1/2">Installed: </span>
          <p class="w-full">{{data.version}}</p>
        </div>

        <div class="flex gap-3 w-full" v-if="data.text_domain">
          <span class="text-slate-500 w-1/2">Text domain: </span>
          <p class="w-full">{{data.text_domain}}</p>
        </div>

        <div class="flex gap-3 w-full" v-if="data.requires_at_least">
          <span class="text-slate-500 w-1/2">Requires: </span>
          <p class="w-full">{{data.requires_at_least}}</p>
        </div>

        <div class="flex gap-3 w-full mb-2" v-if="data.requires_php">
          <span class="text-slate-500 w-1/2">Requires PHP: </span>
          <p class="w-full">{{data.requires_php}}</p>
        </div>

        <div class=" w-full mb-2" v-if="data.license">
          <span class="text-slate-500 w-1/2">License: </span>
          <p class="w-full"><a target="_blank" :href="data.license_uri || '#'">{{data.license}}</a></p>
        </div>

        <div class=" w-full mb-2" v-if="data.tags">
          <span class="text-slate-500">Tags ({{data.tags.split(',').length || 0}}): </span>
          <p class="w-full">
            <span  v-for="(tag, $index) in data.tags.split(',')" :key="tag">
              <a target="_blank" :href="'https://wordpress.org/plugins/tags/' + tag">{{tag.trim()}}</a>{{data.tags.split(',').length - 1 > $index ? ', ' : ''}}
            </span>
          </p>
        </div>

        <div class=" w-full mb-2" v-if="data.description">
          <span class="text-slate-500">Description: </span>
          <p class="w-full">{{data.description}}</p>
        </div>



        <div class="mt-6 w-full">
          <div class="flex items-center justify-center gap-3" v-if="isListed">
          <a
            class="flex items-center justify-center gap-2"
            target="_blank"
            :href="'https://wordpress.org/plugins/' + data.slug"
            >View on WordPress.org      
          </a>          
          <a
            class="flex items-center justify-center gap-2"
            target="_blank"
            :href="orgData.homepage"
            >Homepage             
          </a>          
        </div>
        <p v-else class="text-sm text-slate-400 italic text-center">This theme is not listed on WordPress.org</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {  Read, parseData } from "./../helpers";

export default {
  name: "Theme",
  props: {
    slug: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      isLoading: true,
      screenshot_uri: "",
      details: false,
      data: {},
      readme: {},
      css: {},
      orgData: {},
      isListed: false,
    };
  },
  computed: {    
    getScreenshot() {
      return this.screenshot_uri || '/images/iswp.png';
    },
  },
  methods: {
    
    // load from style css
    async loadStyleSheet() { 

      const url = this.$parent.getUrl + "/wp-content/themes/" + this.slug + "/style.css";
      const data = await Read(url); 

      return data;
    },

    // load readme.txt
    async loadReadme() {
      const files = [
        "readme.txt",
        "README.txt",
        "README.md",
        "readme.md",
        "README",
        "readme", 
      ];

      for (const file of files) {
        const url = this.$parent.getUrl + "/wp-content/themes/" + this.slug + "/" + file;
        const data = await Read(url);

        return data;    
      } 
    },

    // check screenshot exists
    async checkScreenshot() { 

      const url = `${this.$root.getUrl}/wp-content/themes/${this.slug}/screenshot.png`;
      const exists = await Read(url);

      this.screenshot_uri = exists ? url : null; 
    },

    // check if theme is isListed on wordpress.org
    async loadOrgData() {
      const url = `https://api.wordpress.org/themes/info/1.1/?action=theme_information&request[slug]=${this.slug}`;

      const data = await Read(url); 
      
      if (data) {
        this.isListed = true;
      } 

      return data;
    },
  },
  async created() {
    
    this.checkScreenshot(); 


    const css = await this.loadStyleSheet();
    if(css) { 
      this.css = parseData(css);
    }

    this.isLoading = false;
        

    const readme = await this.loadReadme();
    if(readme) { 
      this.readme = parseData(readme);
    }

    const orgData = await this.loadOrgData();
    if(orgData) { 
      this.orgData = orgData;
    }
 

    this.data = { 
      ...this.readme,
      ...this.css,
    };
 
  },
};
</script>