<template>
  <div class="w-full" v-if="isVisible">
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
      <div
        class="
          flex
          cursor-pointer
          items-center
          justify-between
          bg-slate-600
          py-3
          px-4
          rounded-sm
          hover:bg-slate-500
          transition
          duration-75
        "
        @click.prevent="state.isExpanded = !state.isExpanded"
      >
        <span class="mr-2" v-if="getLogoURL"
          ><img class="w-8 rounded-full" :src="getLogoURL" alt="logo"
        /></span>
        <span class="font-semibold text-lg w-full" v-html="getShortName"></span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="fill-current w-4 h-4 text-slate-400 transition duration-150"
          :class="{ 'transform rotate-180': isExpanded }"
          viewBox="0 0 16 16"
        >
          <path
            fill-rule="evenodd"
            d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
          />
        </svg>
      </div>

      <div v-if="isExpanded" class="bg-slate-600 flex flex-col gap-2">
        <!-- banner  -->
        <div
          class="
            _plugin-banner
            w-full
            relative
            flex flex-col
            justify-between
            items-end
            overflow-hidden
          "
          :style="`background: url(${getBannerURL}) no-repeat center center / cover;`"
        >
          <!-- logo  -->
          <div class="flex items-center justify-start w-full p-2">
            <img :src="getLogoURL" class="w-12 h-12 rounded-full shadow" />
          </div>

          <!-- match  -->
          <div
            class="
              w-full
              _overlay-banner
              flex
              items-center
              justify-between
              p-3
              rounded-sm
              text-sm
            "
          >
            <div>
              Installed {{getInstalledVersion}} 
            </div>
            <div>
              <span
                class="rounded-xl font-medium text-white px-3 py-1.5 text-xs"
                :class="{
                  'bg-red-600': accuracy < 50,
                  'bg-yellow-700': accuracy >= 50 && accuracy < 75,
                  'bg-green-700': accuracy >= 75,
                }"
                >{{ accuracy }}% Matched</span
              >
            </div>
          </div>
        </div>

        <!-- details  -->
        <div class="px-3 pb-3 flex flex-col gap-1 text-sm">
          <div class="text-base font-semibold" v-html="name"></div>
          <div v-if="data.author">
            <span
              v-html="data.author ? 'By ' + data.author : '<em>No Author</em>'"
            ></span>
          </div> 
          <div>Current version: {{data.version || 'Unknown'}}</div>
          <div>Installed version : {{getInstalledVersion}}</div>

          <!-- org -->
          <template v-if="state.isListed">
            <div>
              Homepage:
              <a
                :href="data.homepage"
                target="_blank"
                rel="noopener noreferrer"
                class="text-sky-500 hover:underline"
                >{{ data.homepage }}</a
              >
            </div>
            <div>
              WordPress.org:
              <a
                :href="'https://wordpress.org/plugins/' + this.orgSlug"
                target="_blank"
                rel="noopener noreferrer"
                class="text-sky-500 hover:underline"
                >{{ "https://wordpress.org/plugins/" + this.orgSlug }}</a
              >
            </div>
          </template>
          <template v-else>
            This Plugin is not listed on WordPress.org
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script> 

import { Read } from "./../helpers"

export default {
  name: "Plugin",
  props: {
    plugin: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      state: {
        isLoading: true,
        isExpanded: false,
        isListed: false,
        isVisible: true,
      },
      data: {},
      readme: "",
      slug: this.plugin.slug,
      source: this.plugin.source,
      accuracy: 30,
      banner_uri: "",
      logo_uri: "",
    };
  },
  computed: {
    orgSlug() {
      if (this.data && this.data.slug) {
        return this.data.slug;
      }
      return this.slug;
    },
    isListed() {
      return this.state.isListed;
    },
    isLoading() {
      return this.state.isLoading;
    },
    isExpanded() {
      return this.state.isExpanded;
    },
    isVisible() {
      return this.state.isVisible;
    },
    name() {
      return (
        this.data.name ||
        this.slug
          .replace(/-/g, " ")
          .replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase()))
      );
    },
    getShortName() {

      let length = 25;
      // return first 25 characters 
      return this.name.length > length
        ? this.name.substring(0, length) + "..."
        : this.name;
    }, 
    getBannerURL() {
      return (
        this.banner_uri ||
        "https://via.placeholder.com/772x250?text=No+banner+image"
      );
    },
    getLogoURL() {
      return this.logo_uri || "/images/iswp.png";
    },
    getInstalledVersion(){
      const readme = this.readme || '';

      // match stable tag with case insensitive
      const stableTag = readme.match(/Stable tag: (.*)/i);

      // match version with case insensitive
      const version = readme.match(/Version: (.*)/i);

      // return stable tag if exists
      if(stableTag && stableTag[1]){
        return stableTag[1];
      }

      // return version if exists
      if(version && version[1]){
        return version[1];
      }

      // return unknown
      return 'Unknown';
    }
  },
  methods: { 

    async loadFromOrg() {
      const url = `https://api.wordpress.org/plugins/info/1.0/${this.slug}.json`;

      const data = await Read(url);

      if (data) { 
        this.data = data;
        this.accuracy = 100; 
      }

      return data;
    },

    async searchOnOrg() {
      const url = `https://api.wordpress.org/plugins/info/1.2/?action=query_plugins&request[search]=${this.slug}`;

      const data = await Read(url);
      const plugins = data.plugins || null;

      if (!data || !plugins || !plugins.length) {
        return false;
      } 

      let plugin = plugins.find((p) => p.name.includes(this.name));
      this.accuracy = 70;

      // search in tags object, accuracy 60%
      if (!plugin) {
        plugin = plugins.find((p) => {
          const tags = Object.values(p.tags);
          return tags.includes(this.slug);
        });
        this.accuracy = 60;
      }

      // get first plugins
      if (!plugin) {
        plugin = plugins[0];
        this.accuracy = 75;
      }

      // check if found in $root plugins slug
      const foundInPlugins = this.$root.plugins.find(
        (p) => p.slug === plugin.slug
      );

      if (!foundInPlugins) { 
        this.data = plugin;
        return plugin;
      }
 
      // remove current slug from $root.plugins
      this.$root.plugins = this.$root.plugins.filter(
        (p) => p.slug !== this.slug
      );

      this.state.isVisible = false;
      return false;
    },

    // load logo

    async loadLogo() {
      const extensions = ["png", "jpg", "gif", "jpeg"];
      const sizes = ["128x128", "256x256"];

      // check if image exists
      for (let i = 0; i < extensions.length; i++) {
        for (let j = 0; j < sizes.length; j++) {
          const imageUrl = `https://ps.w.org/${this.orgSlug}/assets/icon-${sizes[j]}.${extensions[i]}`;
          const exists = await Read(imageUrl);
          if (exists) {
            this.logo_uri = imageUrl;
            return;
          }
        }
      }
    },

    // get banner image
    async loadBanner() {
      const extensions = ["png", "jpg", "gif", "jpeg"];
      const sizes = ["772x250", "1544x500"];

      // check if image exists
      for (let i = 0; i < extensions.length; i++) {
        for (let j = 0; j < sizes.length; j++) {
          const imageUrl = `https://ps.w.org/${this.orgSlug}/assets/banner-${sizes[j]}.${extensions[i]}`;
          const exists = await Read(imageUrl);
          if (exists) {
            this.banner_uri = imageUrl;
            return;
          }
        }
      }
    },

    async loadReadme() {
      const slugs = [this.slug, this.orgSlug]; 
      const files = ["readme.txt", "README.txt", "README.md", "readme.md"];

      for (let i = 0; i < slugs.length; i++) {
        for (let j = 0; j < files.length; j++) {
          const readmeUrl = `${this.$root.getUrl}wp-content/plugins/${slugs[i]}/${files[j]}`;
          const fileContent = await Read(readmeUrl); 
          if (fileContent) {
            this.readme = fileContent;
            return;
          }
        }
      }
    },
  },
  async mounted() {
    let listed = await this.loadFromOrg(); 

    if (!listed) {
      listed = await this.searchOnOrg(); 
    }

    this.state.isLoading = false;

    if (listed) { 

      this.state.isListed = true;

      this.loadLogo();
      this.loadBanner();
    } else {
      this.state.isListed = false;
    }

    // find readme 
    await this.loadReadme(); 
  },
};
</script>