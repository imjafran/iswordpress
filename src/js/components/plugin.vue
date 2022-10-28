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
        @click.prevent="details = !details"
      >
        <span class="mr-2" v-if="logo"
          ><img class="w-6 rounded-full" :src="logo" alt="Logo"
        /></span>
        <span class="font-medium text-base w-full" v-html="short_name"></span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="fill-current w-4 h-4 text-slate-400 transition duration-150"
          :class="{ 'transform rotate-180': details }"
          viewBox="0 0 16 16"
        >
          <path
            fill-rule="evenodd"
            d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
          />
        </svg>
      </div>

      <div v-if="details" class="bg-slate-600 p-3 flex flex-col gap-2">
        <div
          class="
            _plugin-banner
            w-full
            relative
            flex flex-col
            justify-between
            rounded-sm
            overflow-hidden
          "
          :style="`background: url(${banner}) no-repeat center center / cover;`"
        >
          <div class="_overlay-banner">
            <h3 class="font-bold text-lg z-50 p-1 text-white" v-html="name"></h3>
          </div>
          <div
            class="
              _overlay-banner
              down
              flex
              items-center
              justify-between
              p-3
              rounded-sm text-sm
            "
          >
            <div v-if="data.author">By <span v-html="data.author"></span></div>
            <div> 
              <span
                class="rounded-md font-medium text-white px-2 py-1 text-xs"
                :class="{
                  'bg-red-500': accuracy < 50,
                  'bg-yellow-500': accuracy >= 50 && accuracy < 75,
                  'bg-green-600': accuracy >= 75,
                }"
                >{{ accuracy }}% Match</span
              >
            </div>
          </div>
        </div>
 
        <div
          v-if="listed === true"
          class="flex items-center justify-between gap-3 text-sm my-2"
        >
          <a
            class="
              cursor-pointer
              bg-blue-500
              text-white
              hover:no-underline hover:bg-blue-400
              px-3
              py-1.5
              rounded-md flex items-center justify-center
            "
            target="_blank"
            :href="'https://wordpress.org/plugins/' + this.slug"
            >View on WordPress.org</a
          >
          <a
            v-if="data.homepage"
            class="
              cursor-pointer
              bg-blue-500
              text-white
              hover:no-underline hover:bg-blue-400
              px-3
              py-1.5
              rounded-md flex items-center justify-center
            "
            target="_blank"
            :href="data.homepage"
            >Visit Homepage</a
          >
        </div>
        <div v-else class="text-red-400 text-center italic text-sm">
          Not listed on WordPress.org
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
export default {
  name: "Plugin",
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
      accuracy: 30,
      banner_uri: "",
      logo_uri: "",
    };
  },
  computed: {
    slug() {
      return this.slug;
    },
    orgSlug() {
      
      if(this.data && this.data.slug) {
        return this.data.slug;
      }
      return this.slug;
    },
    name() {
      return (
        this.data.name ||
        this.slug
          .replace(/-/g, " ")
          .replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase()))
      );
    },
    short_name() {
      let name = this.name.slice(0, 40);
      return name.length < this.name.length ? name + "..." : name;
    },
    banner() {
      return (
        this.banner_uri ||
        "https://via.placeholder.com/772x250?text=No+banner+image"
      );
    },
    logo() {
      return this.logo_uri || "/images/iswp.png";
    },
  },
  methods: {
    async loadPlugin() {
      const url = `https://api.wordpress.org/plugins/info/1.0/${this.slug}.json`;

      return new Promise((resolve, reject) => {
        axios
          .get(url)
          .then((response) => {
            this.data = response.data;
            this.listed = true;
            this.accuracy = 100;
            resolve(true);
          })
          .catch((error) => {
            this.listed = false; 
            resolve(false);
          });
      });
    },

    async searchPlugin() {
      const url = `https://api.wordpress.org/plugins/info/1.2/?action=query_plugins&request[search]=${this.slug}`;

      return new Promise((resolve, reject) => {
        axios
          .get(url)
          .then((response) => {
            const plugins = response.data.plugins;

            if( !plugins || plugins.length === 0 ) {
              this.listed = false;
              resolve(false);
              return;
            }

            let plugin = null;

            // search by slug, accuracy 80%
            plugin = plugins.find((p) => p.slug === this.slug);
            this.accuracy = 100;

            // search by name, accuracy 70%
            if (!plugin) {
              plugin = plugins.find((p) => p.name === this.name);
              this.accuracy = 80;
            }

            // search by description, accuracy 70%
            if (!plugin) {
              plugin = plugins.find((p) => p.description === this.name);
              this.accuracy = 60;
            }


            // search in tags object, accuracy 60%
            if (!plugin) {
              plugin = plugins.find((p) => {
                const tags = Object.values(p.tags);
                return tags.includes(this.slug);
              });
              this.accuracy = 70;
            }

            // if plugin not found, accuracy 30%
            if (!plugin) {
              this.accuracy = 30; 
              resolve(false);
            } 

            this.data = plugin;
            console.log(data);
            this.listed = true;
            resolve(true);
          })
          .catch((error) => {
            this.listed = false;
            resolve(false);
          });
      });
    },

    // get banner image
    async loadBanner() {
      const extensions = ["png", "jpg", "gif", "jpeg"];
      const imageUri =
        "https://ps.w.org/" + this.orgSlug + "/assets/banner-772x250.";

      return new Promise((resolve, reject) => {
        let image = new Image();
        image.onload = () => resolve(imageUri + extensions[0]);
        image.onerror = () => {
          extensions.shift();
          if (extensions.length) {
            image.src = imageUri + extensions[0];
            resolve(true);
          } else {
            resolve(false);
          }
        };
        image.src = imageUri + extensions[0];
      })
        .then((image) => {
          this.banner_uri = image;
        })
        .catch(() => {
          this.banner_uri =
            "https://via.placeholder.com/772x250?text=No+banner+image";
        });
    },

    async loadLogo() {
      const extensions = ["png", "jpg", "gif", "jpeg"];
      const imageUri =
        "https://ps.w.org/" + this.orgSlug + "/assets/icon-256x256.";

      new Promise((resolve, reject) => {
        let image = new Image();
        image.onload = () => resolve(imageUri + extensions[0]);
        image.onerror = () => {
          extensions.shift();
          if (extensions.length) {
            image.src = imageUri + extensions[0];
          } else {
            reject();
          }
        };
        image.src = imageUri + extensions[0];
      })
        .then((image) => {
          this.logo_uri = image;
        })
        .catch(() => {});
    },

  },
  async mounted() {

    let found = await this.loadPlugin();
    
    if(!found) {
      found = await this.searchPlugin();
    }

    if (found) {
      await this.loadBanner();
      await this.loadLogo();
    }
     
 
  },
};
</script>