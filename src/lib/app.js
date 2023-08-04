import { ref, computed, reactive, onMounted } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import DemoWebsiteHTML from './../test/html.js'

const useAppStore = defineStore('is-wp', () => {

  // data 
  const state = reactive({
    isLoading: true,
    pluginsLoaded: false,
    currentTab: 'theme',
    error: null,
  })

  const isLoading = computed(() => state.isLoading)
  const pluginsLoaded = computed(() => state.pluginsLoaded)

  const tabs = ref({
    theme: 'Theme',
    plugins: 'Plugins',
    security: 'Security',
  })

  const setTab = (tab) => state.currentTab = tab
  const isTab = (tab) => state.currentTab === tab

  const Website = ref({
    host: "https://wpfy.co.uk",
    wordpress_url: "",
    html: "",
    isWordPress: false,
    isHeadlessWordPress: false,
    isBackendWordPress: false,
  })

  const WordPress = ref({
    themeSlug: null,
    theme: {},
    plugins: [],
  })


  // computed 
  const isURLEmpty = computed(() => Website.host === "")
  const isURLInternal = computed(() => {
    const strings = "file:// chrome:// moz-extension:// about:blank brave://";
    return strings.split(" ").some((string) => Website.value.host.startsWith(string));
  })
  const isURLValid = computed(() => {
    if (isURLEmpty.value || isURLInternal.value) return false;
    return Website.value.host.startsWith("http");
  })

  const isWordPress = computed(() => Website.value.isWordPress)
  const isHeadlessWordPress = computed(() => Website.value.isHeadlessWordPress)
  const isBackendWordPress = computed(() => Website.value.isBackendWordPress)

  const theme = computed(() => WordPress.value.theme)
  const plugins = computed(() => WordPress.value.plugins)



  // methods 

  const loadCurrentTab = async () => {
    if (!chrome.tabs) return;
    let tabs = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    Website.value.tab = tabs[0];
  }


  const getCurrentTab = computed(() => {
    return Website.value.tab
  })

  const getHTMLContent = computed(() => {
    return Website.value.html
  })


  const parseWebsiteContent = async () => {
    // console.log('Parse website content');
    return new Promise(async (resolve) => {

      // for test 
      Website.value.html = DemoWebsiteHTML;
      resolve(true);

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
    })
  }

  const scanWordPressInContent = async () => {
    // console.log('Scan WordPress in content');
    return new Promise((resolve, reject) => {
      const html = getHTMLContent.value;
      if (!html) return;

      const regex = /wp-content/gi;
      const matches = html.match(regex);
      if (matches && matches.length > 0) {
        Website.value.isWordPress = true;
      }

      resolve();
    })
  }
  const scanHeadlessWordPress = async () => {
    return new Promise((resolve, reject) => {
      resolve(isWordPress.value);
    })
  }
  const scanBackendWordPress = async () => {
    return new Promise((resolve, reject) => {
      resolve(isWordPress.value);
    })
  }

  const scanWebsite = async () => {
    // Turn on loading
    state.isLoading = true;
    // console.log('Loading on start', isLoading.value);
    // loadCurrentTab().then(parseWebsiteContent).then(detectIfWordPress);
    await parseWebsiteContent()
    await detectIfWordPress()
  }

  const detectIfWordPress = async () => {
    await scanWordPressInContent()

    // console.log('After scanning content', isWordPress.value);

    if (!isWordPress.value) {
      await scanHeadlessWordPress();
    }

    if (!isWordPress.value) {
      await scanBackendWordPress();
    }

    // Turn off loading
    state.isLoading = false;

    // console.log('Loading after scanning', isLoading.value);

    if (isWordPress.value) {
      await scanTheme();
      await scanPlugins();
    }

  }
  const scanThemeId = async () => {

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

      // Get theme info from API.
      console.log('Theme slug', WordPress.value.themeSlug);


      resolve(true)
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
      axios.get(`${Website.value.host}/wp-content/themes/${WordPress.value.themeSlug}/style.css`).then((response) => {
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

        console.log('Theme css response', theme)
        WordPress.value.theme = theme;

        resolve(true)

      }).catch((error) => {
        console.log('Theme css error', error)
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
        console.log('Theme API response', response.data);

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

        console.log("After concat", WordPress.value.theme);
        state.loadingTheme = false
        resolve(true)
      }).catch((error) => {
        console.log('Theme API error', error);
        state.loadingTheme = false
        resolve(false)
      })
    })
  }

  const scanTheme = async () => {
    console.log('Scanning theme');
    // Get theme id from content.
    const html = getHTMLContent.value;
    if (!html) resolve();

    await scanThemeId();
    parseThemeInformationFromStyle();
    pullThemeInformationFromAPI();
  }

  const scanPlugins = async () => { }
  const scanPluginsInContent = async () => { }
  const deepScanPlugins = async () => { }


  // Scan WordPress
  onMounted(() => {
    scanWebsite();
  })

  return {
    state,
    isLoading,
    pluginsLoaded,

    tabs,
    setTab,
    isTab,

    Website,
    WordPress,
    isURLValid,
    isURLEmpty,
    isURLInternal,
    getHTMLContent,

    isWordPress,
    isHeadlessWordPress,
    isBackendWordPress,

    theme,
    plugins,

    scanWebsite,
    detectIfWordPress,
    scanWordPressInContent,
    scanHeadlessWordPress,
    scanBackendWordPress,
    scanTheme,
    scanPlugins,
    scanPluginsInContent,
    deepScanPlugins,
  }
})

export default useAppStore