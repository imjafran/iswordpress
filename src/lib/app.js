import { ref, computed, reactive, onMounted } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'

const useAppStore = defineStore('is-wp', () => {

  // data 
  const state = reactive({
    isLoading: true,
    deepScanning: false,
    loadingTheme: true,
    loadingPlugins: true,
    currentTab: 'server',
    error: null,
  })


  const Website = ref({
    html: "",
    isWordPress: false,
    isHeadlessWordPress: false,
  })

  const WordPress = ref({
    name: null,
    description: null,
    url: null,
    gmt_offset: null,
    site_icon_url: null,
    namespaces: [],
    themeSlug: null,
    theme: null,
    plugins: {},
  })


  // computed 
  const isURLEmpty = computed(() => Website.url === "")
  const isURLInternal = computed(() => {
    const strings = "file:// chrome:// moz-extension:// about:blank brave://";
    return strings.split(" ").some((string) => Website.value.url.startsWith(string));
  })
  const isURLValid = computed(() => {
    if (isURLEmpty.value || isURLInternal.value) return false;
    return Website.value.url.startsWith("http");
  })

  // methods 

  const loadCurrentTab = async () => {
    if (!chrome.tabs) return;
    let tabs = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    Website.value.tab = tabs[0];
    // set url the root url
    Website.value.url = new URL(Website.value.tab.url).origin;
  }


  const getCurrentTab = computed(() => {
    return Website.value.tab
  })

  const getHTMLContent = computed(() => {
    return Website.value.html
  })


  const parseWebsiteContent = async () => {
    return new Promise(async (resolve) => {

      const tab = getCurrentTab.value;
      if (!tab) return;

      let content = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => {
          return document.documentElement.innerHTML;
        },
      });

      if (!content) {
        state.error = "Unable to load content";
        return;
      }

      Website.value.html = content[0].result

      resolve(true);
    })
  }

  const scanWordPressInContent = async () => {
    const html = getHTMLContent.value;
    if (!html) return;

    const regex = /wp-content/gi;
    const matches = html.match(regex);
    if (matches && matches.length > 0) {
      Website.value.isWordPress = true;
      state.isLoading = false;
    }
  }

  const scanWordPressEndpoint = async () => {
    const wpJson = `${Website.value.url}/wp-json/`;

   return new Promise( async (resolve) => {
     axios.get(wpJson).then((response) => {

      if (!('home' in response.data)) {
        state.isLoading = false;
        state.deepScanning = false;
        resolve(false);
      }


      WordPress.value.name = response.data.name || ''
      WordPress.value.url = response.data.url || ''
      WordPress.value.description = response.data.description || ''
      WordPress.value.gmt_offset = response.data.gmt_offset || ''
      WordPress.value.site_icon_url = response.data.site_icon_url || ''
      WordPress.value.namespaces = response.data.namespaces || []

      Website.value.isHeadlessWordPress = !Website.value.isWordPress;
      Website.value.isWordPress = true;

      console.log('Headless WordPress', response.data);
    }).catch((error) => {
      console.log('Headless error', error);
    }).finally(() => {
      state.isLoading = false;
      state.deepScanning = false;
      resolve(true);
    })
   })
  }

  const scanWebsite = async () => {
    // Turn on loading
    state.isLoading = true;
    await loadCurrentTab()
    await parseWebsiteContent()
    await detectWordPress()
  }

  const detectWordPress = async () => {
    // Scan WordPress in content
    scanWordPressInContent()

    // Scan WordPress endpoint
    await scanWordPressEndpoint();

    // Turn off loading
    state.isLoading = false;

    if ( Website.value.isWordPress ) {
      // Parallel scanning 
      if ( ! Website.value.isHeadlessWordPress ) {
        console.log('Scanning theme in content');
        scanTheme();
      } else {
        state.loadingTheme = false
      }
      scanPlugins();
    }

  }
  const scanThemeSlug = async () => {

    state.loadingTheme = 'Scanning theme...'

    return new Promise(async (resolve) => {
      const regex = /wp-content\/themes\/([^\/]+)\//gi;
      const matches = getHTMLContent.value.match(regex);

      if (!matches || matches.length === 0) {
        state.loadingTheme = false
        resolve(false)
      }

      // Replace the first match with the theme slug.
      WordPress.value.themeSlug = matches[0].replace(regex, "$1");

      resolve(WordPress.value.themeSlug)
    })
  }

  const parseThemeInformationFromStyle = async () => {

    return new Promise(async (resolve) => {

      if (!WordPress.value.themeSlug) {
        state.loadingTheme = false
        resolve(false)
      }

      state.loadingTheme = 'Theme found: Scanning information...'

      // If the API fails, try getting theme information from the theme's style.css file.
      axios.get(`${Website.value.url}/wp-content/themes/${WordPress.value.themeSlug}/style.css`).then((response) => {
        // console.log('Theme style response', response.data);

        // Parse the theme information from the style.css file.
        const regexes = {
          name: /Theme Name:\s*(.*)/gi,
          description: /Description:\s*(.*)/gi,
          version: /Version:\s*(.*)/gi,
          author: /Author:\s*(.*)/gi,
          author_uri: /Author URI:\s*(.*)/gi,
          theme_uri: /Theme URI:\s*(.*)/gi,
          license: /License:\s*(.*)/gi,
          license_uri: /License URI:\s*(.*)/gi,
          tags: /Tags:\s*(.*)/gi,
          requires_php: /Requires PHP:\s*(.*)/gi,
          requires_at_least: /Requires at least:\s*(.*)/gi,
        }

        let theme = {};

        Object.keys(regexes).forEach((key) => {
          const regex = regexes[key];
          const matches = response.data.match(regex);
          if (matches && matches.length > 0) {
            theme[key] = matches[0].replace(regex, "$1")
          }
        });


        theme.tags = theme.tags.split(',')
        theme.slug = WordPress.value.themeSlug

        // console.log('Theme css response', theme)
        WordPress.value.theme = theme;

        resolve(true)

      }).catch((error) => {
        // console.log('Theme css error', error)
        resolve(false)
      })
    })
  }

  const pullThemeInformationFromAPI = async () => {

    return new Promise(async (resolve) => {

      if (!WordPress.value.themeSlug) {
        state.loadingTheme = false
        resolve(false)
      }

      state.loadingTheme = 'Scanning on WordPress.org...'

      // Try getting theme information from the API.
      axios.get(`https://api.wordpress.org/themes/info/1.2/?action=theme_information&request[slug]=${WordPress.value.themeSlug}`).then((response) => {
        // console.log('Theme API response', response.data);

        const updatable = {
          name: WordPress.value.theme?.name || response.data.name,
          description: WordPress.value.theme?.description || response.data.sections.description,
          version: WordPress.value.theme?.version || response.data.version,
          slug: response.data.slug,
          name: response.data.name,
          latest_version: response.data.version,
          screenshot_url: response.data.screenshot_url,
          homepage: response.data.homepage,
          author: response.data.author?.display_name,
          author_uri: response.data.author?.author_uri || '',
          listed: true,
        }
        // merge with theme
        WordPress.value.theme = {
          ...(WordPress.value.theme || {}),
          ...updatable,
        }

        // console.log("After concat", WordPress.value.theme);
        state.loadingTheme = false
        resolve(true)
      }).catch((error) => {
        // console.log('Theme API error', error);
        state.loadingTheme = false
        resolve(false)
      })
    })
  }

  const scanTheme = async () => {
    const html = getHTMLContent.value;
    if (!html) return;

    await scanThemeSlug();
    await parseThemeInformationFromStyle();
    await pullThemeInformationFromAPI();
    loadThemeScreenshot();
  }

  const loadThemeScreenshot = async () => {
    const imgElement = document.querySelector('#theme_screenshot')

    const extensions = [
        'png',
        'jpg',
        'svg',
    ]

    return new Promise(async (resolve) => {
        let extensionIndex = 0

        const loadImage = () => {
            const url = Website.value.url + '/wp-content/themes/' + WordPress.value.themeSlug + '/screenshot.' + extensions[extensionIndex]
 
            imgElement.src = url
            
            imgElement.onload = () => {
                resolve(true)
            }

            imgElement.onerror = () => { 
                extensionIndex++
                if (extensionIndex >= extensions.length) {
                    resolve(false)
                } else {

                    imgElement.src = 'https://via.placeholder.com/300x150.png?text=No+screenshot+found...'
                    loadImage()
                }
            }
        }

        loadImage()

    })

}

  const scanPlugins = async () => {
    // Get plugins from content.
    const html = getHTMLContent.value;
    if (!html) return;

    if( ! Website.value.isHeadlessWordPress ) {
      await scanPluginsInContent();
    }

    await scanPluginsInNamespaces();
  }

  const scanPluginsInContent = async () => {

    state.loadingPlugins = 'Parsing plugins...'

    const regex = /wp-content\/plugins\/([^\/]+)\//gi;
    const matches = getHTMLContent.value.match(regex);

    if (!matches || matches.length === 0) {
      resolve(false)
    }

    // Replace the first match with the theme slug.
    let plugins = matches.map((match) => {
      return match.replace(regex, "$1");
    });

    plugins.forEach((plugin) => {
      WordPress.value.plugins[plugin] = {
        source: 'content',
        slug: plugin,
      }
    })
  }

  const scanPluginsInNamespaces = async () => {
    state.loadingPlugins = 'Scanning...'

    let namespaces = WordPress.value.namespaces.map((namespace) => {
      return namespace.split('/')[0];
    }).filter((namespace) => {
      return !['oembed', 'wp', 'wp-site-health', 'wp-block-editor', WordPress.value.themeSlug].includes(namespace)
    })
    

    namespaces.forEach((namespace) => {
      WordPress.value.plugins[namespace] = {
        source: 'namespace',
        slug: namespace,
      }
    })

    state.loadingPlugins = false
  }

  // Deep scan
  const DeepScanPlugins = async () => { 

    state.deepScanning = true
    // type cors 
    axios.get( 'https://appdets.com/script/iswp.php' ).then((response) => {
      Website.value.deepPlugins = response.data
    }).catch((error) => {
      console.log('DeepScanPlugins error', error)
    }).finally(() => {
      state.deepScanning = false


      Website.value.deepPlugins.forEach((plugin) => {
          // make a request to plugin's url of the website
          const url = `${Website.value.url}/wp-content/plugins/${plugin.slug}/`
          axios.get( url ).then((response) => {
            console.log('DeepScanPlugins response', response.data)
          }).catch((error) => {})

      })
    })
  }

 

  // Scan WordPress
  onMounted(scanWebsite) 
  // onMounted(DeepScanPlugins) 

  return {
    state,

    Website,
    WordPress,
    isURLValid,
    isURLEmpty,
    isURLInternal,
    getHTMLContent,

    scanWebsite
  }
})

export default useAppStore