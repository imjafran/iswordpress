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
    <div class="p-1" v-else>
      <div
        class="bg-white w-full mb-2 rounded-sm relative"
        v-if="hasScreenshot"
      >
        <a
          v-if="screenshot"
          class="
            cursor-pointer
            text-white
            hover:bg-blue-400 hover:no-underline
            bg-blue-500
            w-8
            h-6
            text-sm
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
          class="mx-auto max-h-28"
          :src="
            screenshot ||
            'https://cdn.pixabay.com/photo/2015/01/05/11/02/wordpress-589121_1280.jpg'
          "
        />
      </div> 

      <div class="flex flex-col gap-1">

        <div class="flex gap-3">
          <span class="text-slate-500 w-1/2">Name: </span>
          <p class="w-full"><a target="_blank" :href="data.theme_uri || '#'">{{data.name}}</a></p>
        </div>

        <div class="flex gap-3" v-if="data.author">
          <span class="text-slate-500 w-1/2">Author: </span>
          <p class="w-full"><a target="_blank" :href="data.author_uri || '#'">{{data.author}}</a></p>
        </div>

        <div class="flex gap-3" v-if="data.version">
          <span class="text-slate-500 w-1/2">Version: </span>
          <p class="w-full">{{data.version}}</p>
        </div>

        <div class="flex gap-3" v-if="data.text_domain">
          <span class="text-slate-500 w-1/2">Text domain: </span>
          <p class="w-full">{{data.text_domain}}</p>
        </div>

        <div class="flex gap-3" v-if="data.requires_at_least">
          <span class="text-slate-500 w-1/2">Requires: </span>
          <p class="w-full">{{data.requires_at_least}}</p>
        </div>

        <div class="flex gap-3" v-if="data.requires_php">
          <span class="text-slate-500 w-1/2">Requires PHP: </span>
          <p class="w-full">{{data.requires_php}}</p>
        </div>

        <div class="" v-if="data.license">
          <span class="text-slate-500 w-1/2">License: </span>
          <p class="w-full"><a target="_blank" :href="data.license_uri || '#'">{{data.license}}</a></p>
        </div>

        <div class="" v-if="data.tags">
          <span class="text-slate-500">Tags ({{data.tags.split(',').length || 0}}): </span>
          <p class="w-full">
            <span  v-for="(tag, $index) in data.tags.split(',')" :key="tag">
              <a target="_blank" :href="'https://wordpress.org/plugins/tags/' + tag">{{tag.trim()}}</a>{{data.tags.split(',').length - 1 > $index ? ', ' : ''}}
            </span>
          </p>
        </div>

        <div class="" v-if="data.description">
          <span class="text-slate-500">Description: </span>
          <p class="w-full">{{data.description}}</p>
        </div>



        <div class="mt-6">
          <div class="flex items-center justify-center gap-3" v-if="listed">
          <a
            class="flex items-center justify-center gap-2"
            target="_blank"
            :href="'https://wordpress.org/plugins/' + data.slug"
            >More Details             
          </a>          
          <a
            class="flex items-center justify-center gap-2"
            target="_blank"
            :href="homepage"
            >Homepage             
          </a>          
        </div>
        <p v-else class="text-sm text-red-400 italic text-center">Not listed on WordPres.org</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { constants } from "./../helpers";
import axios from "axios";

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
      details: false,
      data: {},
      listed: false,
      hasScreenshot: true,
    };
  },
  computed: {
    keys() {
      return constants.themeKeys;
    },
    screenshot() {
      return this.data.screenshot_uri || "";
    },
  },
  methods: {
    parseData(RAWdata) {
      const data = {};

      for (const key in this.keys) {
        if (this.keys.hasOwnProperty(key)) {
          const searchString = this.keys[key];
          // match case insensitive
          const match = RAWdata.match(
            new RegExp(searchString + ":\\s*(.*)", "i")
          );
          if (match && match.length > 0) {
            data[key] = match[1];
          }
        }
      }

      return data;
    },

    // load from style css
    async loadStyleCSS() {
      const host = this.$parent.host;

      const response = await fetch(
        `${host}/wp-content/themes/${this.slug}/style.css`
      , constants.fetchOptions);

      if (response.ok) {
        const data = await response.text();
        this.data = {
          ...this.data,
          ...this.parseData(data),
        };
        this.listed = true;
      } else {
        this.listed = false;
      }
    },

    // load readme.txt
    async loadReadme() {
      const host = this.$root.host;

      const response = await fetch(
        `${host}/wp-content/themes/${this.slug}/readme.txt`
      , constants.fetchOptions);

      if (response.ok) {
        const data = await response.text();
        this.data = {
          ...this.data,
          ...this.parseData(data),
        };
      }
    },

    // check screenshot exists
    async checkScreenshot() {
      const host = this.$root.host;

      const response = await fetch(
        `${host}/wp-content/themes/${this.slug}/screenshot.png`
      , constants.fetchOptions);

      if (response.ok) {
        this.data.screenshot_uri = `${host}/wp-content/themes/${this.slug}/screenshot.png`;
      } else {
        this.hasScreenshot = false;
        this.data.screenshot_uri = "";
      }
    },

    // check if theme is listed on wordpress.org
    async checkListed() {
      axios
        .get(
          `https://api.wordpress.org/themes/info/1.1/?action=theme_information&request[slug]=${this.slug}`
        )
        .then((response) => {
          const data = response.data;
          if (data) {
            this.listed = true;
          }
        })
        .catch((error) => {
          this.listed = false;
        });
    },
  },
  async mounted() {
    await this.loadStyleCSS();
    this.isLoading = false;
    await this.loadReadme();
    await this.checkScreenshot();
    await this.checkListed();
  },
};
</script>