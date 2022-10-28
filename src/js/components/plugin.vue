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
        <span class="font-medium text-base w-full" v-html="short_name"></span>
        <div class="w-20 text-right">
          <span
            class="px-2 text-xs py-1 rounded-sm text-right"
            :class="{
              'text-red-500': accuracy < 50,
              'text-yellow-500': accuracy >= 50 && accuracy < 75,
              'b text-green-500': accuracy >= 75,
            }"
            >{{ accuracy }}%</span
          >
        </div>
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
        <div><span class="font-bold" v-html="name"></span></div>
        <div v-if="data.author">
          <span class="text-slate-500">By </span>
          <span v-html="data.author"></span>
        </div>
        <div v-if="data.version">
          <span class="text-slate-500">Version </span> {{ data.version }}
        </div>

        <div>
          <span class="text-slate-500">Accuracy </span>
          <span
            class="text-sm rounded-sm"
            :class="{
              'text-red-500': accuracy < 50,
              'text-yellow-500': accuracy >= 50 && accuracy < 75,
              'b text-green-500': accuracy >= 75,
            }"
            >{{ accuracy }}%</span
          >
        </div>
        <div
          v-if="listed === true"
          class="flex items-center justify-center gap-3 text-sm"
        >
          <a
            class="
              cursor-pointer
              bg-blue-500
              text-white
              hover:no-underline hover:bg-blue-600
              px-3
              py-1.5
              rounded-sm
            "
            target="_blank"
            :href="'https://wordpress.org/plugins/' + this.slug"
            >More details</a
          >
          <a
            v-if="data.homepage"
            class="
              cursor-pointer
              bg-blue-500
              text-white
              hover:no-underline hover:bg-blue-600
              px-3
              py-1.5
              rounded-sm
            "
            target="_blank"
            :href="data.homepage"
            >Homepage</a
          >
        </div>
        <div v-else class="text-red-400 text-center italic text-sm">
          Not listed on WordPres.org
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
      accuracy: 100,
    };
  },
  computed: {
    slug() {
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
      let name = this.name.slice(0, 17);
      return name.length < this.name.length ? name + "..." : name;
    },
  },
  methods: {
    async loadPlugin() {
      const url = `https://api.wordpress.org/plugins/info/1.0/${this.slug}.json`;

      // try {
      //   const response = await axios.get(url);
      //   this.data = response.data;
      //   this.isLoading = false;
      //   console.log(this.data);
      //   this.listed = true;
      // } catch (error) {
      //   this.accuracy = 0;
      // }

      return new Promise((resolve, reject) => {
        try {
          axios
            .get(url)
            .then((response) => {
              this.data = response.data;
              this.isLoading = false;
              console.log("response", response.data);
              this.listed = true;
              this.accuracy = 100;

              resolve(true);
            })
            .catch((error) => {
              console.log("error", error);
              this.accuracy = 0;
              this.listed = false;

              resolve(false);
            });
        } catch (error) {
          console.log("error", error);
          this.accuracy = 0;
          this.listed = false;

          resolve(false);
        }
      });
    },

    async searchPlugin() {
      const url = `https://api.wordpress.org/plugins/info/1.2/?action=query_plugins&request[search]=${this.slug}`;

      return new Promise(async (resolve, reject) => {
        try {
          axios.get(url).then((response) => {
            const plugins = response.data.plugins;

            if(plugins.length === 0) {
              this.accuracy = 0;
              this.listed = false;

              resolve(false);
            }

            // search plugin in slug
            let plugin = plugins.find(
              (plugin) =>
                plugin.slug.toLowerCase().includes(this.slug.toLowerCase())
            );

            this.accuracy = 70;

            if (!plugin) {
              plugin = plugins.find(
                (plugin) =>
                  plugin.name.toLowerCase().includes(this.slug.toLowerCase())
              );
            }

            this.accuracy = 60;

            // search in tags object 
            if (!plugin) {
              plugin = plugins.find((plugin) => {
                let found = false;
                let tags = Object.values(plugin.tags);
                tags.forEach((tag) => {
                  if (tag.toLowerCase().includes(this.slug.toLowerCase())) {
                    found = true;
                  }
                });
              });
            }

            this.accuracy = 50;

            // search in description 
            if (!plugin) {
              plugin = plugins.find((plugin) => {
                let found = false;
                let description = plugin.description;
                if (description.toLowerCase().includes(this.slug.toLowerCase())) {
                  found = true;
                }
              });
            }

            this.accuracy = 40; 

            this.isLoading = false; 
            
            if (plugin) {

              console.log('found on deep search', plugin);
              this.data = plugin;
              this.listed = true;

              resolve(true);
            } else {

              console.log('not found');
              this.accuracy = 10;
              this.listed = false;

              resolve(false);
            }
          }).catch((error) => {
            console.log("error", error);
            this.accuracy = 10;
            this.listed = false;

            resolve(false);
          }); 
        } catch (error) {
          console.log("error", error);
          this.accuracy = 10;
          this.listed = false;

          resolve(false);
        }
      });
    },

    // get banner image
    getBanner() {
      if (this.data.banners) {
        return this.data.banners["high"];
      } else if (this.data.banners) {
        return this.data.banners["low"];
      } else if (this.data.banners) {
        return this.data.banners["medium"];
      } else if (this.data.banners) {
        return this.data.banners["full"];
      } else {
        return false;
      }
    },
  },
  async mounted() {
    let found = await this.loadPlugin();
    
    if ( found ) return;
    console.log("found on initial search", found);
    
    found = await this.searchPlugin(); 
    this.isLoading = false;
    console.log('loading?', this.isLoading); 



  },
};
</script>