import { ref, computed, reactive } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'

const useApp = defineStore('iswp', () => {

  // data 
  const state = reactive({
    isLoading: false,
    themeLoaded: false,
    pluginsLoaded: false,
    currentTab: 'theme',
    error: null,
  })

  const isLoading = computed(() => state.isLoading)
  const themeLoaded = computed(() => state.themeLoaded)
  const pluginsLoaded = computed(() => state.pluginsLoaded)

  const tabs = ref({
    theme: 'Theme',
    plugins: 'Plugins',
    security: 'Security',
  })

  const setTab = (tab) => state.currentTab = tab
  const isTab = computed(() => (tab) => state.currentTab === tab)

  const Website = ref({
    host: "",
    title: "",
    html: "",
    isWordPress: false,
    isHeadlessWordPress: false,
    isBackendWordPress: false,
  })

  const WordPress = ref({
    themeSlug: "",
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

  const isWordPress = computed(() => Website.isWordPress)
  const isHeadlessWordPress = computed(() => Website.isHeadlessWordPress)
  const isBackendWordPress = computed(() => Website.isBackendWordPress)

  const theme = computed(() => WordPress.theme)
  const plugins = computed(() => WordPress.plugins)


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


  const loadContent = async () => {
    const tab = getCurrentTab.value;
    if(!tab) return;

    let content = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: () => {
        return document.documentElement.innerHTML;
      },
    });

    if( !content ){
      state.error = "Unable to load content";
      return;
    }

    Website.value.html = content[0].result
  }


  const scanWebsite = async () => {
    await loadCurrentTab();
    await loadContent();
    await detectWordPress();
  }

  const detectWordPress = async () => {
    console.log('detectWordPress', getHTMLContent.value);
  }
  const scanWordPressInContent = async () => { }
  const scanHeadlessWordPress = async () => { }
  const scanBackendWordPress = async () => { }

  const scanTheme = async () => { }

  const scanPlugins = async () => { }
  const scanPluginsInContent = async () => { }
  const deepScanPlugins = async () => { }

  return {
    state,
    isLoading,
    themeLoaded,
    pluginsLoaded,

    tabs,
    setTab,
    isTab,

    Website,
    WordPress,
    isURLValid,
    isURLEmpty,
    isURLInternal,

    isWordPress,
    isHeadlessWordPress,
    isBackendWordPress,

    theme,
    plugins,

    scanWebsite,
    detectWordPress,
    scanWordPressInContent,
    scanHeadlessWordPress,
    scanBackendWordPress,
    scanTheme,
    scanPlugins,
    scanPluginsInContent,
    deepScanPlugins,
  }
})

export default useApp