// https://developer.chrome.com/extensions/tut_analytics
// https://developers.google.com/analytics/devguides/collection/gajs/eventTrackerGuide

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-46800996-8']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

var Logger = {
  enabled: false,
  ns: 'Requestly: ',

  log: function(msg) {
    this.enabled && console.log.apply(console, [this.ns].concat(Array.prototype.slice.call(arguments)));
  },

  error: function(msg) {
    this.enabled && console.error.apply(console, [this.ns].concat(Array.prototype.slice.call(arguments)));
  }
};

var Queue = function(maxSize) {
  this.reset = function() {
    this.head = -1;
    this.queue = [];
  };

  this.reset();
  this.maxSize = maxSize || Queue.MAX_SIZE;

  this.increment = function(number) {
    return (number + 1) % this.maxSize;
  };
};

Queue.MAX_SIZE = Math.pow(2, 53) - 1;

Queue.prototype.enQueue = function(record) {
  this.head = this.increment(this.head);
  this.queue[this.head] = record;
};

/**
 * @param record Record to look for
 * @returns Number Position of record in the queue otherwise -1
 */
Queue.prototype.getElementIndex = function(record) {
  return this.queue.indexOf(record);
};

Queue.prototype.print = function() {
  for(var i = 0; i <= this.head; i++) {
    console.log(this.queue[i]);
  }
};

(function(window, chrome) {
  var TabService = function() {
    this.construct.apply(this, arguments);
  };

  TabService.prototype = {
    construct: function() {
      this.map = {};
      this.initTabs();
      this.registerBinders();
      this.addEventListeners();
    },

    initTabs: function () {
      var that = this;
      chrome.tabs.query({}, function (tabs) {
        that.map = {};
        for (var i = 0; i < tabs.length; i++) {
          var tab = tabs[i];
          that.map[tab.id] = tab;
        }
      });
    },

    addEventListeners: function() {
      var that = this;

      chrome.tabs.onCreated.addListener(function (tab) {
        that.map[tab.id] = tab;
      });

      this.addOnClosedListener(this.handleTabClosed);

      chrome.tabs.onReplaced.addListener(function (addedTabId, removedTabId) {
        that.map.hasOwnProperty(removedTabId) && delete that.map[removedTabId];
        chrome.tabs.get(addedTabId, function (tab) {
          that.map[tab.id] = tab;
        });
      });

      chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
        that.map[tabId] = tab;
      });

      chrome.webRequest.onBeforeRequest.addListener(function(details) {
        if (details.type === 'main_frame') {
          that.map[details.tabId] = that.map[details.tabId] || {};
          that.map[details.tabId]['url'] = details.url;
        }
      }, { urls: ['<all_urls>'] });
    },

    registerBinders: function() {
      this.handleTabClosed = this.handleTabClosed.bind(this);
    },

    getTabs: function() {
      return this.map;
    },

    getTab: function (tabId) {
      return this.map[tabId];
    },

    getTabUrl: function(tabId) {
      var tab = this.getTab(tabId);
      return tab && tab.url;
    },

    focusTab: function(tabId) {
      var tab = this.map[tabId];

      if (tab && tab.windowId) {
        chrome.windows.update(tab.windowId, {focused: true}, function () {
          chrome.tabs.highlight({windowId: tab.windowId, tabs: tab.index});
        });
        return true;
      }

      return false;
    },

    closeTab: function(tabId) {
      chrome.tabs.remove(tabId);
    },

    handleTabClosed: function(tabId) {
      this.map.hasOwnProperty(tabId) && delete this.map[tabId];
    },

    addOnClosedListener: function(listener) {
      if (typeof listener !== 'function') {
        console.error('Chrome Tab Service: Invalid listener passed as onClosedListener ', listener)
      }

      chrome.tabs.onRemoved.addListener(listener);
    }
  };

  // Create only single instance of TabService
  if (typeof window.tabService === 'undefined') {
    window.tabService = new TabService();
  }
})(window, chrome);

window.RQ = window.RQ || {};
window.RQ.configs = {
  "version": "20.3.16",
  "browser": "chrome",
  "storageType": "sync",
  "contextMenuContexts": [
    "browser_action"
  ],
  "env": "prod",
  "WEB_URL": "https://app.requestly.io",
  "firebaseConfig": {
    "apiKey": "AIzaSyC2WOxTtgKH554wCezEJ4plxnMNXaUSFXY",
    "authDomain": "app.requestly.io",
    "databaseURL": "https://requestly.firebaseio.com",
    "projectId": "project-7820168409702389920",
    "storageBucket": "project-7820168409702389920.appspot.com",
    "messagingSenderId": "911299702852"
  },
  "logLevel": "info"
};

window.RQ = window.RQ || {};

RQ.VERSION = 3;

RQ.FILE_PICKER_URL = "/library/filepicker";

RQ.VERSIONS = {
  REPLACE_RULE: 2
};

RQ.PUBLIC_NAMESPACE = '__REQUESTLY__';

// Url which gets opened when User clicks on browserAction (requestly icon) in toolbar
RQ.RULES_PAGE_URL = RQ.configs.WEB_URL + "/rules/";

RQ.RULES_PAGE_URL_PATTERN = RQ.RULES_PAGE_URL + "*";

RQ.PRICING_PAGE_URL = RQ.configs.WEB_URL + "/pricing/";

RQ.GOODBYE_PAGE_URL = RQ.configs.WEB_URL + "/goodbye/";

RQ.BLACK_LIST_DOMAINS = ["requestly.in", "requestly.io"];

RQ.STRING_CONSTANTS = {
  SLASH: "/"
};

RQ.LIMITS = {
  NUMBER_SHARED_LISTS: 10
};

RQ.DEFAULTS = {
  APP_INIT_TIMEOUT: 5000
};

RQ.OBJECT_TYPES = {
  GROUP: "group",
  RULE: "rule"
};

RQ.RULE_TYPES = {
  REDIRECT: "Redirect",
  CANCEL: "Cancel",
  REPLACE: "Replace",
  HEADERS: "Headers",
  USERAGENT: "UserAgent",
  SCRIPT: "Script",
  QUERYPARAM: "QueryParam",
  RESPONSE: "Response"
};

RQ.HEADER_NAMES = {
  USER_AGENT: "User-Agent"
};

RQ.RULE_STATUS = {
  ACTIVE: "Active",
  INACTIVE: "Inactive"
};

RQ.RULE_KEYS = {
  URL: "Url",
  HOST: "host",
  PATH: "path",
  HEADER: "Header",
  OVERWRITE: "Overwrite",
  IGNORE: "Ignore",
  PARAM: "param",
  VALUE: "value"
};

RQ.URL_COMPONENTS = {
  PROTOCOL: "Protocol",
  URL: "Url",
  HOST: "host",
  PATH: "path",
  QUERY: "query",
  HASH: "hash"
};

RQ.RULE_OPERATORS = {
  EQUALS: "Equals",
  CONTAINS: "Contains",
  MATCHES: "Matches",
  WILDCARD_MATCHES: "Wildcard_Matches"
};

RQ.RULE_SOURCE_FILTER_TYPES = {
  PAGE_URL: "pageUrl",
  RESOURCE_TYPE: "resourceType",
  REQUEST_METHOD: "requestMethod"
};

RQ.MODIFICATION_TYPES = {
  ADD: "Add",
  REMOVE: "Remove",
  REMOVE_ALL: "Remove All",
  MODIFY: "Modify",
  REPLACE: "Replace"
};

RQ.NEED_HELP_QUERY_TYPES = {
  FEEDBACK: "Feedback",
  BUG: "Bug",
  QUESTION: "Question",
  FEATURE_REQUEST: "FeatureRequest"
};

RQ.CLIENT_MESSAGES = {
  GET_SCRIPT_RULES: "getScriptRules",
  GET_USER_AGENT_RULE_PAIRS: "getUserAgentRulePairs",
  OVERRIDE_RESPONSE: "overrideResponse",
  NOTIFY_RULES_APPLIED: "notifyRulesApplied"
};

RQ.EXTENSION_MESSAGES = {
  FOCUS_TAB: "focusTab",
  GET_FULL_LOGS: "getFullLogs",
  CLEAR_LOGS_FOR_TAB: "clearLogsForTab",
  CLEAR_LOGS_FOR_DOMAIN: "clearLogsForDomain",
  GET_FAVOURITE_RULES: "getFavouriteRules",
  REMOTE_RULES_SETTINGS_CHANGED: 'remoteRulesSettingsChanged',
  GET_FLAGS: "getFlags"
};

RQ.HEADERS_TARGET = {
  REQUEST: "Request",
  RESPONSE: "Response"
};

RQ.REQUEST_TYPES = {
  MAIN_FRAME: "mainFrame",
  PAGE_REQUEST: "pageRequest"
};

RQ.SCRIPT_TYPES = {
  URL: "url",
  CODE: "code"
};

RQ.SCRIPT_CODE_TYPES = {
  JS: "js",
  CSS: "css"
};

RQ.SCRIPT_LOAD_TIME = {
  BEFORE_PAGE_LOAD: "beforePageLoad",
  AFTER_PAGE_LOAD: "afterPageLoad"
};

RQ.SCRIPT_LIBRARIES = {
  JQUERY: { name: "jQuery", src: "https://code.jquery.com/jquery-2.2.4.js" },
  UNDERSCORE: {
    name: "Underscore",
    src:
      "https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore-min.js"
  }
};

RQ.RESPONSE_CODES = {
  NOT_FOUND: 404
};

RQ.STORAGE_KEYS = {
  REQUESTLY_SETTINGS: "rq_settings",
  USER_INFO: "user_info",
  LATEST_NOTIFICATION_READ_BY_USER: "latestNotificationReadId"
};

RQ.MESSAGES = {
  DELETE_ITEMS_NO_SELECTION_WARNING:
    "Please select one or more rules to delete.",
  DELETE_ITEMS: "Are you sure you want to delete the selected items?",
  DELETE_GROUP_WITH_RULES_WARNING:
    "There are some rules contained in this group. Please delete or ungroup them before deleting the group.",
  DELETE_GROUP: "Are you sure you want to delete the group?",
  UNGROUP_ITEMS_NO_SELECTION_WARNING:
    "Please select one or more rules to ungroup.",
  UNGROUP_ITEMS: "Are you sure you want to ungroup the selected items?",
  SIGN_IN_TO_VIEW_SHARED_LISTS:
    "Please login to view your Shared Lists.",
  SIGN_IN_TO_CREATE_SHARED_LISTS:
    "Please login to share the selected rules",
  SIGN_IN_TO_SUBMIT_QUERY:
    "Please login to contact our support team.",
  ERROR_AUTHENTICATION:
    "Received some error in authentication. Please try again later!!",
  SHARED_LISTS_LIMIT_REACHED: `You can not create more than ${
    RQ.LIMITS.NUMBER_SHARED_LISTS
  } shared lists. 
    Please <a href="/pricing" target="_blank">upgrade your plan</a> to increase the limits.`,
  ERROR_TAB_FOCUS: "The tab cannot be focused, as it might have been closed.",
  DEACTIVATE_REQUESTLY_MENU_OPTION: "Deactivate Requestly"
};

RQ.RESOURCES = {
  EXTENSION_ICON: "/resources/images/48x48.png",
  EXTENSION_ICON_GREYSCALE: "/resources/images/48x48_greyscale.png",
  EXTENSION_ICON_GREEN: "/resources/images/48x48_green.png"
};

RQ.GA_EVENTS = {
  CATEGORIES: {
    RULES: "rules",
    RULE: "rule",
    GROUP: "group",
    USER: "user",
    SHARED_LIST: "shared list",
    RULE_LOGS: "rule logs",
    EXTENSION: "extension",
    IN_APP_NOTIFICATION: "InAppNotification",
    NEED_HELP_FEATURE: "need help feature"
  },
  ACTIONS: {
    MODIFIED: "modified",
    CREATED: "created",
    DELETED: "deleted",
    ACTIVATED: "activated",
    DEACTIVATED: "deactivated",
    IMPORTED: "imported",
    EXPORTED: "exported",
    LIMIT_REACHED: "limit reached",
    AUTHENTICATED: "authenticated",
    VIEWED: "viewed",
    CLICKED: "clicked",
    COPIED: "copied",
    MARKED_FAVOURITE: "marked favourite",
    UNMARKED_FAVOURITE: "unmarked favourite",
    WORKFLOW_STARTED: "workflow started",
    ALREADY_LOGIN: "already login",
    LOGIN_REQUESTED: "login requested",
    LOGIN_DONE: "login done",
    LOGIN_REJECTED: "login rejected",
    FORM_SUBMITTED: "form submitted",
    FORM_REJECTED: "form rejected",
    INVALID_SUBMIT: "invalid submit",
    GROUPED: "grouped",
    UNGROUPED: "ungrouped"
  }
};

RQ.USER = {
  AUTHORIZED: "authorized-user",
  UNAUTHORIZED: "unauthorized-user"
};

RQ.FIREBASE_NODES = {
  USERS: "users",
  PUBLIC: "public",
  SHARED_LISTS: "sharedLists",
  FEEDBACK: "feedback"
};

RQ.DATASTORE = {
  ACTIONS: {
    CHECK_USER_AUTH: "check:userAuthenticated",
    AUTHENTICATE: "authenticate",
    FETCH_USER_DETAILS: "fetchUserDetails",
    GETVALUE: "getValue",
    SETVALUE: "setValue"
  }
};

RQ.MESSAGE_HANDLER = {
  ACTIONS: {
    SUBMIT_EVENT: "submitEvent",
    SUBMIT_ATTR: "submitAttr"
  },
  MESSAGE_TYPES: {
    EVENT: "event",
    ATTRIBUTE: "attribute"
  },
  SINKS: {
    CUSTOMERLY: "customerly"
  }
};

RQ.htmlEncode = function(value) {
  return $("<div/>")
    .text(value)
    .html();
};

RQ.getSharedURL = function(shareId, sharedListName) {
  const formattedSharedListName = sharedListName
    .replace(new RegExp(" +|/+", "g"), "-")
    .replace(/-+/g, "-");
  return (
    RQ.RULES_PAGE_URL + "#sharedList/" + shareId + "-" + formattedSharedListName
  );
};

RQ.getSharedListTimestamp = function(sharedListId) {
  return sharedListId.split("-")[0];
};

RQ.fireAjax = function(requestURL, async) {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open('GET', requestURL, async);
    request.onreadystatechange = function () {
      if (this.readyState === 4) {
        if (this.status >= 200 && this.status < 400) {
          resolve(JSON.parse(this.responseText));
        } else {
          reject();
        }
      }
    };
    request.send();
  });
};
window.RQ = window.RQ || {};
RQ.Utils = RQ.Utils || {};

RQ.Utils.regexFormat = '^\/(.+)\/(|i|g|ig|gi)$';

RQ.Utils.isValidRegex = function(regexStr) {
  return regexStr.search(new RegExp(RQ.Utils.regexFormat)) !== -1;
};

RQ.Utils.toRegex = function(regexStr) {
  var isRegexStringValid = this.isValidRegex(regexStr),
    matchRegExp;

  if (!isRegexStringValid) {
    return null;
  }
  matchRegExp = regexStr.match(new RegExp(RQ.Utils.regexFormat));

  return new RegExp(matchRegExp[1], matchRegExp[2]);
};

RQ.Utils.isValidUrl = function(url) {
  return url.search(/^http:|https:|ftp:|javascript:/) === 0;
};

RQ.Utils.getId = function() {
  return Date.now();
};

RQ.Utils.getCurrentTime = function() {
  return Date.now();
};

RQ.Utils.formatDate = function(dateInMilis, format) {
  const d = new Date(dateInMilis);

  if (dateInMilis && format === 'yyyy-mm-dd') {
    let month = d.getMonth() + 1,
      date = d.getDate();

    date = (String(date).length) < 2 ? ('0' + date) : String(date);
    month = (String(month).length) < 2 ? ('0' + month) : String(month);

    return d.getFullYear() + '-' + month + '-' + date;
  }
};

RQ.Utils.reloadPage = function(wait) {
  wait = wait || 0;

  setTimeout(function () {
    window.location.reload();
  }, wait);
};

RQ.Utils.submitEvent = function(eventCategory, eventAction, eventLabel, eventValue) {
  if (!eventLabel) {
    eventLabel = eventCategory + ' ' + eventAction;
  }

  RQ.ContentScriptMessageHandler.sendMessage({
    action: RQ.MESSAGE_HANDLER.ACTIONS.SUBMIT_EVENT,
    eventCategory: eventCategory,
    eventAction: eventAction,
    eventLabel: eventLabel,
    eventValue: eventValue
  });
};

RQ.Utils.submitAttr = function(attr, value) {
  const messageToSend = {
    action: RQ.MESSAGE_HANDLER.ACTIONS.SUBMIT_ATTR,
    attr: attr,
    value: value
  };

  RQ.ContentScriptMessageHandler.sendMessage(messageToSend);
};

RQ.Utils.removeLastPart = function(str, separater) {
  str = str || '';

  // Return original string when separator is not present
  if (str.indexOf(separater) === -1) {
    return str;
  }

  str = str.split(separater);

  // Remove last part
  str.length--;

  return str.join(separater);
};

RQ.Utils.setCookie = function(name, value, maxAge) {
  document.cookie = name + '=' + value + '; path=/' + '; max-age=' + maxAge;
};

RQ.Utils.readCookie = function(name) {
  var nameEQ = name + '=';
  var ca = document.cookie.split(';');
  for(var i=0;i < ca.length;i++) {
    var c = ca[i];
    while (c.charAt(0)==' ') c = c.substring(1,c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
  }

  return null;
};

RQ.Utils.eraseCookie = function (name) {
  RQ.Utils.setCookie(name, '', 1);
};

/**
 *
 * @param url Url from which component has to be extracted
 * @param name Url component name - host, path, url, query, fragment etc.
 */
RQ.Utils.extractUrlComponent = function(url, name) {
  if (!window.dummyAnchor) {
    window.dummyAnchor = document.createElement('a');
  }

  window.dummyAnchor.href = url;

  switch(name) {
    case RQ.URL_COMPONENTS.URL: return url;
    case RQ.URL_COMPONENTS.PROTOCOL: return window.dummyAnchor.protocol;
    case RQ.URL_COMPONENTS.HOST: return window.dummyAnchor.host;
    case RQ.URL_COMPONENTS.PATH: return window.dummyAnchor.pathname;
    case RQ.URL_COMPONENTS.QUERY: return window.dummyAnchor.search;
    case RQ.URL_COMPONENTS.HASH: return window.dummyAnchor.hash;
  }

  console.error('Invalid source key', url, name);
};

/**
 *
 * @param queryString e.g. ?a=1&b=2 or a=1 or ''
 * @returns object { paramName -> [value1, value2] }
 */
RQ.Utils.getQueryParamsMap = function(queryString) {
  var map = {},
    queryParams;

  if (!queryString || queryString === '?') {
    return map;
  }

  if (queryString[0] === '?') {
    queryString = queryString.substr(1);
  }

  queryParams = queryString.split('&');

  queryParams.forEach(function(queryParam) {
    var paramName = queryParam.split('=')[0],
      paramValue = queryParam.split('=')[1];

    // We are keeping value of param as array so that in future we can support multiple param values of same name
    // And we do not want to lose the params if url already contains multiple params of same name
    map[paramName] = map[paramName] || [];
    map[paramName].push(paramValue);
  });

  return map;
};

/**
 * Convert a map to keyvalue pair string (Used for query params)
 * @param queryParamsMap
 * @returns {string}
 */
RQ.Utils.convertQueryParamMapToString = function(queryParamsMap) {
  var queryParamsArr = [];

  for (var paramName in queryParamsMap) {
    var values = queryParamsMap[paramName] || [];

    values.forEach(function(paramValue) {
      if (typeof paramValue === 'undefined') {
        queryParamsArr.push(paramName);
      } else {
        queryParamsArr.push(paramName + '=' + paramValue);
      }
    });
  }

  return queryParamsArr.join('&');
};

RQ.Utils.getUrlWithoutQueryParamsAndHash = function(url) {
  var urlWithoutHash = url.split('#')[0];

  return urlWithoutHash.split('?')[0];
};

window.RQ = window.RQ || {};

RQ.ContentScriptMessageHandler = {
  eventCallbackMap: {},
  requestId: 1,

  constants: {
    CONTENT_SCRIPT: 'content_script',
    PAGE_SCRIPT: 'page_script',
    DOMAIN: RQ.configs.WEB_URL,
    SOURCE_FIELD: 'source',
    ACTION_USER_LOGGED_IN: 'user:loggedIn'
  },

  addMessageListener: function() {
    window.addEventListener('message', this.handleMessageReceived.bind(this));
  },

  getSource: function() {
    return this.constants.CONTENT_SCRIPT;
  },

  registerCallback: function(message, callback) {
    if (!callback) return;

    // Message has requestId when we are sending response
    const requestIdToUse = this.requestId++;
    this.eventCallbackMap[message.action + '_' + requestIdToUse] = callback;
    message.requestId = requestIdToUse;
  },

  invokeCallback: function(event) {
    const callbackRef = this.eventCallbackMap[event.data.action + '_' + event.data.requestId];

    if (typeof callbackRef === 'function') {
      // We should remove the entry from map first before executing the callback otherwise we will store stale references of functions
      delete this.eventCallbackMap[event.data.action];
      callbackRef.call(this, event.data.response);
    }
  },

  sendMessage: function(message, callback) {
    if (!message.action) {
      Logger.error('Invalid message. Must contain some action');
      return;
    }

    this.registerCallback(message, callback);

    message[this.constants.SOURCE_FIELD] = this.getSource();
    window.postMessage(message, this.constants.DOMAIN);
  },

  sendResponse: function(originalEventData, response) {
    const message = {
      action: originalEventData.action,
      requestId: originalEventData.requestId,
      response: response
    };

    message[this.constants.SOURCE_FIELD] = this.constants.CONTENT_SCRIPT;
    window.postMessage(message, this.constants.DOMAIN);
  },

  handleMessageReceived: function(event) {
    const that = this;

    if (event && event.origin !== RQ.configs.WEB_URL) {
      if (RQ.configs.logLevel === 'debug') {
        console.log('Ignoring message from the following domain', event.origin, event.data);
      }

      return;
    }

    if (event && event.data && event.data.source === this.constants.PAGE_SCRIPT) {
      RQ.configs.logLevel === 'debug' && console.log('Received message:', event.data);

      // Check whether it is a response to invoke callback or a request to perform an action
      if (typeof event.data.response !== 'undefined') {
        return this.invokeCallback(event);
      }

      // Process actions
      if (event.data.action === 'GET_STORAGE_TYPE') {
        StorageService.getStorageType().then(storageType => {
          that.sendResponse(event.data, { storageType });
        });
      }

      else if (event.data.action === 'SET_STORAGE_TYPE') {
        StorageService.setStorageType(event.data.storageType).then(() => {
          that.sendResponse(event.data, {success: true});
        });
      }

      else if (event.data.action === 'GET_STORAGE_INFO') {
        StorageService.getStorageType().then(storageType => {
          chrome.storage[storageType].get(null, superObject => {
            const storageCachedRecords = [];
            for (let key in superObject) {
              if (superObject[key].hasOwnProperty('objectType') || superObject[key].hasOwnProperty('ruleType')) {
                storageCachedRecords.push(superObject[key]);
              }
            }

            that.sendResponse(event.data, {
              storageType: storageType,
              numItems: storageCachedRecords.length,
              bytesUsed: JSON.stringify(storageCachedRecords).length
            });
          });
        });
      }

      else if (event.data.action === 'GET_STORAGE_SUPER_OBJECT') {
        StorageService.getStorageType().then(storageType => {
          chrome.storage[storageType].get(null, superObject => {
            that.sendResponse(event.data, superObject);
          });
        });
      }

      else if (event.data.action === 'GET_STORAGE_OBJECT') {
        StorageService.getStorageType().then(storageType => {
          chrome.storage[storageType].get(event.data.key, obj => {
            that.sendResponse(event.data, obj[event.data.key]);
          });
        });
      }

      else if (event.data.action === 'SAVE_STORAGE_OBJECT') {
        StorageService.getStorageType().then(storageType => {
          chrome.storage[storageType].set(event.data.object, () => {
            that.sendResponse(event.data);
          });
        });
      }

      else if (event.data.action === 'REMOVE_STORAGE_OBJECT') {
        StorageService.getStorageType().then(storageType => {
          chrome.storage[storageType].remove(event.data.key, () => {
            that.sendResponse(event.data);
          });
        });
      }

      else if (event.data.action === 'CLEAR_STORAGE') {
        StorageService.getStorageType().then(storageType => {
          chrome.storage[storageType].clear(() => {
            that.sendResponse(event.data);
          });
        });
      }

      else if (event.data.action === 'GET_REMOTE_RULES_SETTINGS') {
        StorageService.getRecordFromStorage('remote_rules_settings', 'sync')
          .then(obj => that.sendResponse(event.data, obj || {}));
      }

      else if (event.data.action === 'SET_REMOTE_RULES_SETTINGS') {
        StorageService.saveRecordInStorage({ remote_rules_settings: event.data.remoteRulesSettings }, 'sync')
          .then(() => {
            // Inform background to start the import periodically
            return new Promise(resolve =>
              chrome.runtime.sendMessage({ action: RQ.EXTENSION_MESSAGES.REMOTE_RULES_SETTINGS_CHANGED }, resolve)
            );
          })
          .then(() => {
            // Send the response back to App UI to show notification
            that.sendResponse(event.data, { success: true });
          });
      }

      else if ([
        RQ.EXTENSION_MESSAGES.FOCUS_TAB,
        RQ.EXTENSION_MESSAGES.GET_FULL_LOGS,
        RQ.EXTENSION_MESSAGES.CLEAR_LOGS_FOR_TAB,
        RQ.EXTENSION_MESSAGES.CLEAR_LOGS_FOR_DOMAIN,
        RQ.EXTENSION_MESSAGES.GET_FLAGS
      ].includes(event.data.action)) {
        this.delegateMessageToBackground(event.data);
      }
    }
  },

  delegateMessageToBackground: function(message) {
    const that = this;
    chrome.runtime.sendMessage(message, bgResponse => {
      that.sendResponse(message, bgResponse);
    });
  },

  init: function() {
    this.addMessageListener();
  }
};

RQ.ContentScriptMessageHandler.init();

window.RQ = window.RQ || {};

RQ.DataStoreUtils = {
  isUserAuthenticated: function(callback) {
    RQ.ContentScriptMessageHandler.sendMessage({
      action: RQ.DATASTORE.ACTIONS.CHECK_USER_AUTH
    }, callback);
  },

  fetchUserDetails: function() {
    return new Promise((resolve, reject) => {
      try {
        RQ.ContentScriptMessageHandler.sendMessage({ action: RQ.DATASTORE.ACTIONS.FETCH_USER_DETAILS }, resolve);
      } catch(e) {
        reject(e);
      }
    });
  },

  authenticate: function(callback) {
    RQ.ContentScriptMessageHandler.sendMessage({ action: RQ.DATASTORE.ACTIONS.AUTHENTICATE }, callback);
  },

  getValue: function(pathArray) {
    return new Promise((resolve, reject) => {
      try {
        RQ.ContentScriptMessageHandler.sendMessage({ action: RQ.DATASTORE.ACTIONS.GETVALUE, pathArray: pathArray }, resolve);
      } catch(e) {
        reject(e)
      }
    });
  },

  setValue: function(pathArray, value, callback) {
    RQ.ContentScriptMessageHandler.sendMessage({ action: RQ.DATASTORE.ACTIONS.SETVALUE, pathArray: pathArray, value: value }, callback);
  }
};

window.RQ = window.RQ || {};
RQ.UserAgentLibrary = RQ.UserAgentLibrary || {};

RQ.UserAgentLibrary = {
  USER_AGENT: {
    device: {
      android: {
        name: 'Android',
        values: {
          phone: {
            name: 'Android Phone',
            value: 'Mozilla/5.0 (Linux; Android 8.0; Pixel 2 Build/OPD3.170816.012) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Mobile Safari/537.36' // Pixel 2
          },
          tablet: {
            name: 'Android Tablet',
            value: 'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 10 Build/MOB31T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36' // Nexus 10
          }
        }
      },
      apple: {
        name: 'Apple',
        values: {
          iphone: {
            name: 'Apple iPhone',
            value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1' // iPhone X
          },
          ipad: {
            name: 'Apple iPad',
            value: 'Mozilla/5.0 (iPad; CPU OS 11_0 like Mac OS X) AppleWebKit/604.1.34 (KHTML, like Gecko) Version/11.0 Mobile/15A5341f Safari/604.1'
          }
        }
      },
      windows: {
        name: 'Windows',
        values: {
          phone: {
            name: 'Windows Phone',
            value: 'Mozilla/5.0 (compatible; MSIE 10.0; Windows Phone 8.0; Trident/6.0; IEMobile/10.0; ARM; Touch; NOKIA; Lumia 920)'
          },
          tablet: {
            name: 'Windows Tablet',
            value: 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; WOW64; Trident/6.0; Touch; NOKIA; Lumia 920)'
          }
        }
      },
      blackberry: {
        name: 'Blackberry',
        values: {
          phone: {
            name: 'Blackberry Phone',
            value: 'Mozilla/5.0 (BlackBerry; U; BlackBerry 9900; en-US) AppleWebKit/534.11 (KHTML, like Gecko) Version/7.0.0.187 Mobile Safari/534.11'
          },
          tablet: {
            name: 'Blackberry Tablet',
            value: 'Mozilla/5.0 (PlayBook; U; RIM Tablet OS 2.0.0; en-US) AppleWebKit/535.8 (KHTML, like Gecko) Version/7.2.0.0 Safari/535.8'
          }
        }
      },
      symbian_phone: {
        name: 'Symbian Phone',
        value: 'Mozilla/5.0 (SymbianOS) AppleWebKit/533.4 (KHTML, like Gecko) NokiaBrowser/7.3.1.33 Mobile Safari/533.4 3gpp-gba'
      }
    },
    browser: {
      chrome: {
        name: 'Google Chrome',
        values: {
          windows: {
            name: 'Chrome on Windows',
            value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36'
          },
          macintosh: {
            name: 'Chrome on Macintosh',
            value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36'
          },
          linux: {
            name: 'Chrome on Linux',
            value: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36'
          }
        }
      },
      firefox: {
        name: 'Mozilla Firefox',
        values: {
          windows: {
            name: 'Firefox on Windows',
            value: 'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:52.0) Gecko/20100101 Firefox/52.0'
          },
          macintosh: {
            name: 'Firfox on Macintosh',
            value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10; rv:52.0) Gecko/20100101 Firefox/52.0'
          },
          linux: {
            name: 'Firefox on Linux',
            value: 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:52.0) Gecko/20100101 Firefox/52.0'
          }
        }
      },
      safari: {
        name: 'Safari',
        value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/602.4.8 (KHTML, like Gecko) Version/10.0.3 Safari/602.4.8'
      },
      msie: {
        name: 'Microsoft Internet Explorer',
        values: {
          msie6: {
            name: 'Internet Explorer 6',
            value: 'Mozilla/4.0(compatible; MSIE 6.0; Windows NT 5.1)'
          },
          msie7: {
            name: 'Internet Explorer 7',
            value: 'Mozilla/4.0(compatible; MSIE 7.0; Windows NT 6.0)'
          },
          msie8: {
            name: 'Internet Explorer 8',
            value: 'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/4.0)'
          },
          msie9: {
            name: 'Internet Explorer 9',
            value: 'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)'
          },
          msie10: {
            name: 'Internet Explorer 10',
            value: 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)'
          },
          msie11: {
            name: 'Internet Explorer 11',
            value: 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko'
          }
        }
      },
      msedge: {
        name: 'Microsoft Edge',
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.10240'
      },
      opera: {
        name: 'Opera',
        value: 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/28.0.1500.52 Safari/537.36 OPR/15.0.1147.100'
      }
    }
  },

  getDefaultUserAgent: function() {
    return navigator && navigator.userAgent || '';
  }
};
window.RQ = window.RQ || {};
RQ.DOMUtils = RQ.DOMUtils || {};

/**
 *
 * @param $el Element on which class should be toggled
 * @param className Class to be toggled
 * @param condition Boolean Condition - When true class will be added otherwise removed
 */
RQ.DOMUtils.toggleClass = function($el, className, condition) {
  condition ? $el.addClass(className) : $el.removeClass(className);
};

/**
 * Wrapper over Chrome Storage Service APIs.
 * Usage
 * StorageService
 *  .getInstance({ cacheRecords: true }, context})
 *  .then(() => ...);
 */

(function(window) {
  // Karma tests complain that StorageService is already defined therefore exit when StorageService already exists
  if (window.StorageService && typeof window.StorageService === 'function') {
    return;
  }

  window.StorageService = class {
    /**
     *
     * @param options StorageService constructor options
     * @param context Context on which to bind e.g. getInstance({}, RQ).
     * Since initialization is async therefore context is taken as an argument
     * @returns {Promise<any>}
     */
    static getInstance(options, context) {
      return new Promise(resolve => {
        StorageService.getStorageType().then(storageType => {
          options.DB = storageType;
          context.StorageService = new StorageService(options);

          resolve();
        });
      });
    }

    constructor(options) {
      this.DB = options.DB ? chrome.storage[options.DB] : chrome.storage[RQ.configs.storageType];
      this.primaryKeys = options.primaryKeys || ['objectType', 'ruleType'];
      this.records = [];
      this.isRecordsFetched = false;
      this.cachingEnabled = options['cacheRecords'];

      if (this.cachingEnabled) {
        chrome.storage.onChanged.addListener(this.updateRecords.bind(this));
      }

      this.saveRecordWithID = this.saveRecordWithID.bind(this);
      this.saveRecord = this.saveRecord.bind(this);
      this.getRecord = this.getRecord.bind(this);
      this.getRecords = this.getRecords.bind(this);
    }

    static getStorageType() {
      return new Promise(resolve => {
        StorageService
          .getRecordFromStorage('storageType', 'sync')
          .then(storageType => {
            // If there is no storageType stored, fallback to default setting
            resolve(storageType || RQ.configs.storageType);
          });
      });
    }

    static setStorageType(newStorageType) {
      return StorageService.saveRecordInStorage({ 'storageType': newStorageType }, 'sync');
    }

    getRecords(objectType, forceFetch) {
      const self = this;

      return new Promise((resolve, reject) => {
        /* If records have been read from storage, return the cached values */
        if (self.cachingEnabled && self.isRecordsFetched && !forceFetch) {
          resolve(self.filterRecordsByType(self.records, objectType));
          return;
        }

        // Clear the existing records
        self.records.length = 0;

        self.DB.get(null, function(superObject) {
          for (let key in superObject) {
            if (self.hasPrimaryKey(superObject[key])) {
              self.records.push(superObject[key]);
            }
          }

          self.isRecordsFetched = true;
          resolve(self.filterRecordsByType(self.records, objectType));
        });
      });
    }

    hasPrimaryKey(record) {
      for (let index = 0; index < this.primaryKeys.length; index++) {
        if (typeof record[this.primaryKeys[index]] !== 'undefined') {
          return true;
        }
      }

      return false;
    }

    filterRecordsByType(records, requestedObjectType) {
      if (!requestedObjectType) {
        return records;
      }

      return records.filter(record => {
        let objectType = record.objectType || RQ.OBJECT_TYPES.RULE;
        return objectType === requestedObjectType;
      });
    }


    saveRecord(object) {
      return new Promise((resolve, reject) => {
        this.DB.set(object, resolve);
      });
    }

    /**
     * Saves the object which contains ID so that we do not need to specify id as the key and whole object as value
     * @param object
     * @returns {Promise<any>}
     */
    saveRecordWithID(object) {
      return new Promise(resolve => {
        this.DB.set({ [object.id]: object }, resolve);
      });
    }

    static saveRecordInStorage(object, storageType) {
      return new Promise(resolve => chrome.storage[storageType].set(object, resolve));
    }

    static getRecordFromStorage(key, storageType) {
      return new Promise(resolve => chrome.storage[storageType].get(key, obj => resolve(obj[key])));
    }

    getRecord(key) {
      const self = this;
      return new Promise(resolve => self.DB.get(key, obj => resolve(obj[key])));
    }

    removeRecord(key) {
      const self = this;
      return new Promise(resolve => self.DB.remove(key, resolve));
    }

    getCachedRecord(key) {
      const recordIndex = this.getCachedRecordIndex(key);
      return this.records[recordIndex];
    }

    getCachedRecordIndex(keyToFind) {
      for (let recordIndex = 0; recordIndex < this.records.length; recordIndex++) {
        const recordKey = this.records[recordIndex].id;

        if (recordKey === keyToFind) {
          return recordIndex;
        }
      }

      return -1;
    }

    /**
     * StorageService.records are updated on every add/edit/delete operation
     * So that background rules can be updated which are executed when each request URL is intercepted
     * @param changes SuperObject with key as Object key which is changed with old and new values
     * @param namespace Storage type: 'sync' or 'local'
     */
    updateRecords(changes, namespace) {
      var changedObject,
        changedObjectIndex,
        objectExists,
        changedObjectKey;

      // If storageType is changed then source the data in new storage
      if (namespace === 'sync' && changes.hasOwnProperty('storageType') && changes['storageType'].newValue) {
        this.switchStorageType(changes['storageType'].newValue);
        return;
      }

      if (this.DB === chrome.storage[namespace]) {
        for (changedObjectKey in changes) {
          if (!changes.hasOwnProperty(changedObjectKey)) {
            continue;
          }

          changedObject = changes[changedObjectKey];
          changedObjectIndex = this.getCachedRecordIndex(changedObjectKey);
          objectExists = (changedObjectIndex !== -1);

          // Add/Update Object operation
          if (typeof changedObject.newValue !== 'undefined') {
            // Don't cache records when objects do not contain primaryKeys
            if (!this.hasPrimaryKey(changedObject.newValue)) {
              continue;
            }

            objectExists
              ? this.records[changedObjectIndex] = changedObject.newValue    /* Update existing object (Edit) */
              : this.records.push(changedObject.newValue);                   /* Create New Object */
          }

          // Delete Rule Operation
          if (typeof changedObject.oldValue !== 'undefined' && typeof changedObject.newValue === 'undefined' && objectExists) {
            this.records.splice(changedObjectIndex, 1);
          }
        }
      }
    }

    printRecords() {
      this.DB.get(null, function (o) {
        console.log(o);
      });
    }

    clearDB() {
      this.DB.clear();
    }

    switchStorageType(newStorageType) {
      if (chrome.storage[newStorageType] === this.DB) {
        Logger.log('Already on the same storage type. Doing nothing!');
        return;
      }

      Logger.log('Changing default storageType to', newStorageType);

      const existingStorage = this.DB;

      this.DB = chrome.storage[newStorageType];

      // Clear the existing records
      this.records.length = 0;

      const self = this;
      existingStorage.get(null, superObject => {
        const keysToRemove = [];
        for (let key in superObject) {
          if (superObject.hasOwnProperty(key) && self.hasPrimaryKey(superObject[key])) {
            // Save data in the new Storage
            chrome.storage[newStorageType].set({ [key]: superObject[key] });
            keysToRemove.push(key);
          }
        }

        // Remove records from existing storage
        existingStorage.remove(keysToRemove);
      });
    }
  }
})(window);

window.RQ = window.RQ || {};

RQ.PreDefinedFunction = function(name, descriptors) {
  this.name = name;

  // Bind all descriptor fields to this object like argument, pattern etc.
  for (var key in descriptors) {
    this[key] = descriptors[key];
  }

  var argumentPattern;
  if (this.argument.constructor === Array && this.argument.length > 0) { // multiple arguments
    argumentPattern = this.argument[0];
    for (var index = 1; index < this.argument.length; index++) {
      argumentPattern += '(' + RQ.PreDefinedFunction.patterns.COMMA + this.argument[index] + ')?';
    }
  } else {
    argumentPattern = this.argument;
  }
  this.pattern = this.pattern || new RegExp(this.name + '\\(' + argumentPattern + '\\)', 'ig');
};

RQ.PreDefinedFunction.patterns = {
  STRING: '((?!rq_).)+', // matches any string not having rq_ (probably another predefined function)
  NUMBER: '[0-9]+',
  COMMA: ' *, *'
};

RQ.PreDefinedFunction.prototype = {
  argument: RQ.PreDefinedFunction.patterns.STRING,

  eval: function(value) {
    var that = this;

    if (typeof this.argumentEvaluator !== 'function') {
      return value;
    }

    return value.replace(this.pattern, function(token) {
      var matches = token.match(new RegExp(that.name + '\\((.*)\\)', 'i')), // extract argument from rq_func(argument)
        args = [];

      if (matches != null && matches.length > 1) {
        matches[1].split(',').forEach(function(arg) {
          args.push(arg.trim());
        });
        return that.argumentEvaluator.apply(that, args);
      }

      return token;
    });
  }
};

window.RQ = window.RQ || {};

RQ.PreDefinedFunctions = {};

/**
 * @param name Name of predefined function, mandatory to start with 'rq_'.
 * @param descriptors Set of properties which define this function. Eg: description, usage, argument
 */
RQ.registerPredefinedFunction = function(name, descriptors) {
  RQ.PreDefinedFunctions[name] = new RQ.PreDefinedFunction(name, descriptors);
};

RQ.registerPredefinedFunction('rq_rand', {
  description: 'Generate Random Number',

  usage: 'rq_rand(4) (Max 8 digits allowed)',

  argument: RQ.PreDefinedFunction.patterns.NUMBER, // rq_rand(argument)

  getRandomNumber: function(numDigits) {
    return Math.ceil(Math.random() * Math.pow(10, numDigits));
  },

  argumentEvaluator: function(arg) {
    var numDigits = Math.min(arg, 8),
      valueToFit = this.getRandomNumber(numDigits);

    // Catch: For <rq_rand(4)>, we may get 3 digit value because leading zeros are omitted from numbers
    valueToFit = valueToFit.toString();
    while (valueToFit.length < numDigits) {
      valueToFit = valueToFit + '0';
    }

    return valueToFit;
  }
});

RQ.registerPredefinedFunction('rq_encode', {
  description: 'Encode part of URL',

  usage: 'rq_encode(user+test@example.com)',

  argument: RQ.PreDefinedFunction.patterns.STRING,

  argumentEvaluator: encodeURIComponent
});

RQ.registerPredefinedFunction('rq_decode', {
  description: 'Encode part of URL',

  usage: 'rq_decode(user%2Btest%40example.com)',

  argument: RQ.PreDefinedFunction.patterns.STRING,

  argumentEvaluator: decodeURIComponent
});

RQ.registerPredefinedFunction('rq_increment', {
  description: 'Increment a number optionally by a step',

  usage: 'rq_increment(3,5)',

  argument: [
    RQ.PreDefinedFunction.patterns.NUMBER,
    RQ.PreDefinedFunction.patterns.NUMBER
  ],

  argumentEvaluator: function(num, step) {
    step = step || 1;
    return parseInt(num) + parseInt(step);
  }
});

RQ.registerPredefinedFunction('rq_decrement', {
  description: 'Decrement a number optionally by a step',

  usage: 'rq_increment(5,2)',

  argument: [
    RQ.PreDefinedFunction.patterns.NUMBER,
    RQ.PreDefinedFunction.patterns.NUMBER
  ],

  argumentEvaluator: function(num, step) {
    step = step || 1;
    return parseInt(num) - parseInt(step);
  }
});

(function(window) {
  window.RuleMatcher = {};

  /**
   *
   * @param finalString String having $values e.g. http://www.example.com?q=$1&p=$2
   * @param matches Array of matches in Regex and wildcard matches
   * @returns String after replacing $s with match values
   */
  RuleMatcher.populateMatchesInString = function(finalString, matches) {
    matches.forEach(function(matchValue, index) {
      // First match is the full string in Regex and empty string in wildcard match
      if (index === 0) {
        return;
      }

      // Issue: 73 We should not leave $i in the Url otherwise browser will encode that.
      // Even if match is not found, just replace that placeholder with empty string
      matchValue = matchValue || '';

      // Replace all $index values in destinationUrl with the matched groups
      finalString = finalString.replace(new RegExp('[\$]' + index, 'g'), matchValue);
    });

    return finalString;
  };

  /**
   *
   * @param regexString Value Field in source object
   * @param inputString UrlComponent of Source - host/url/path
   * @param finalString destinationurl - We need to place the values of groups in this string e.g. http://yahoo.com?q=$1
   * @returns {*}
   */
  RuleMatcher.checkRegexMatch = function(regexString, inputString, finalString) {
    var regex = RQ.Utils.toRegex(regexString),
      matches;

    // Do not match when regex is invalid or regex does not match with Url
    if (!regex || inputString.search(regex) === -1) {
      return null;
    }

    matches = regex.exec(inputString) || [];
    return RuleMatcher.populateMatchesInString(finalString, matches);
  };

  /**
   *
   * @param wildCardString
   * @param inputString
   * @param finalString
   */
  RuleMatcher.checkWildCardMatch = function(wildCardString, inputString, finalString) {
    var matches = [],
      wildCardSplits,
      index,
      substr,
      positionInInput;

    // Wrap wildCardString and inputString with '|' with front and end to handle * in first and last
    wildCardString = '|' + wildCardString + '|';
    inputString = '|' + inputString + '|';

    // Split with '*'
    wildCardSplits = wildCardString.split('*');

    // Traverse over first array, Search the indexOf first[i] in input
    for (index = 0; index < wildCardSplits.length; index++) {
      substr = wildCardSplits[index];
      positionInInput = inputString.indexOf(substr);

      if (positionInInput === -1) {
        return null;
      } else if (positionInInput === 0) {
        matches.push('');
      } else {
        matches.push(inputString.substr(0, positionInInput));
      }

      inputString = inputString.slice(positionInInput + substr.length);
    }

    return RuleMatcher.populateMatchesInString(finalString, matches);
  };

  /**
   * Checks if intercepted HTTP Request Url matches with any Rule
   *
   * @param sourceObject Object e.g. { key: 'Url/host/path', operator: 'Contains/Matches/Equals', value: 'google' }
   * @param url Url for which HTTP Request is intercepted.
   * @param destination String e.g. 'http://www.example.com?a=$1'
   *
   * @returns Empty string ('') If rule should be applied and source object does not affect resulting url.
   * In some cases like wildcard match or regex match, resultingUrl will be destination+replaced group variables.
   */
  RuleMatcher.matchUrlWithRuleSource = function(sourceObject, url, destination) {
    var operator = sourceObject.operator,
      urlComponent = RQ.Utils.extractUrlComponent(url, sourceObject.key),
      value = sourceObject.value,
      blackListedDomains = RQ.BLACK_LIST_DOMAINS || [];

    for (var index = 0; index < blackListedDomains.length; index++) {
      if (url.indexOf(blackListedDomains[index]) !== -1) {
        return null;
      }
    }

    return RuleMatcher.matchUrlCriteria(urlComponent, operator, value, destination);
  };

  RuleMatcher.matchUrlCriteria = function(urlComponent, operator, value, destination) {
    const resultingUrl = destination || ''; // Destination Url is not present in all rule types (e.g. Cancel, QueryParam)

    switch (operator) {
      case RQ.RULE_OPERATORS.EQUALS:
        if (value === urlComponent) { return resultingUrl; }
        break;

      case RQ.RULE_OPERATORS.CONTAINS: if (urlComponent.indexOf(value) !== -1) { return resultingUrl; }
        break;

      case RQ.RULE_OPERATORS.MATCHES: {
        return RuleMatcher.checkRegexMatch(value, urlComponent, resultingUrl);
      }

      case RQ.RULE_OPERATORS.WILDCARD_MATCHES: {
        return RuleMatcher.checkWildCardMatch(value, urlComponent, resultingUrl);
      }
    }

    return null;
  };

  /**
   *
   * @param pairs RulePairs used in Redirect and Cancel Rules
   * @param url Url which is matched with RulePairs
   * @param requestDetails details of request
   * @returns ResultingUrl which is obtained after applying rulePairs to input Url
   */
  RuleMatcher.matchUrlWithRulePairs = function(pairs, url, requestDetails) {
    var pairIndex,
      resultingUrl = url,
      newResultingUrl,
      destination,
      pair;

    for (pairIndex = 0; pairIndex < pairs.length; pairIndex++) {
      pair = pairs[pairIndex];
      destination = typeof pair.destination !== 'undefined' ? pair.destination : null; // We pass destination as null in Cancel ruleType

      if (RuleMatcher.matchRequestWithRuleSourceFilters(pair.source.filters, requestDetails)) {
        newResultingUrl = RuleMatcher.matchUrlWithRuleSource(pair.source, resultingUrl, pair.destination);
        if (newResultingUrl !== null) {
          resultingUrl = newResultingUrl;
        }
      }
    }

    return resultingUrl !== url ? resultingUrl : null;
  };

  RuleMatcher.matchRequestWithRuleSourceFilters = function(sourceFilters, requestDetails) {
    if (!sourceFilters || !requestDetails) {
      return true;
    }

    for (let filter in sourceFilters) {
      const filterValues = sourceFilters[filter] || [];

      switch (filter) {
        case RQ.RULE_SOURCE_FILTER_TYPES.PAGE_URL:
          const matched = filterValues.every(pageUrlFilter => RuleMatcher.matchPageUrlFilter(pageUrlFilter, requestDetails));
          if (!matched) {
            return false;
          }
          break;

        case RQ.RULE_SOURCE_FILTER_TYPES.REQUEST_METHOD:
          if (!filterValues.some(requestMethodFilter => requestDetails.method === requestMethodFilter)) {
            return false;
          }
          break;

        case RQ.RULE_SOURCE_FILTER_TYPES.RESOURCE_TYPE:
          if (!filterValues.some(requestTypeFilter => requestDetails.type === requestTypeFilter)) {
            return false;
          }
          break;
      }
    }

    return true;
  };

  RuleMatcher.matchPageUrlFilter = function(pageUrlFilter, requestDetails) {
    const pageUrl = window.tabService.getTabUrl(requestDetails.tabId);
    return RuleMatcher.matchUrlCriteria(pageUrl, pageUrlFilter.operator, pageUrlFilter.value) !== null;
  };

  /**
   * Matches given value with predefined function patterns,
   * If pattern exists, replaces the pattern with computed value otherwise returns the original value
   * @param value
   * @param preDefinedFunctionsMap
   */
  RuleMatcher.matchValueForPredefinedFunctions = function(value, preDefinedFunctionsMap) {
    if (!value) return value;

    for (var preDefFuncName in preDefinedFunctionsMap) {
      var preDefFunc = preDefinedFunctionsMap[preDefFuncName];
      value = preDefFunc.eval(value);
    }

    return value;
  };
})(window);

/* Logs are stored in following format:
  logs: {
    <tabId>: {
      <domain>: [
        { id, timestamp, ruleId, ruleName, requestURL, description }
      ]
    }
  }
 */

var RuleLoggerService = function() {
  this.construct.apply(this, arguments);
};

RuleLoggerService.prototype = {
  construct: function() {
    const that = this;

    this.logs = {};
    this._listeners = {};

    if (chrome.tabs) {
      chrome.tabs.onRemoved.addListener(this.clearLogsForTab.bind(this));
    }
  },

  /**
   * Consumer of RuleLoggerService can add listener and this will invoke callback whenever logs for a tab are changed
   * @param tabId
   * @param callback
   */
  addChangeListener: function(tabId, callback) {
    if (typeof callback !== 'function') {
      return;
    }

    this._listeners[tabId] = this._listeners[tabId] || [];
    this._listeners[tabId].push(callback);
  },

  removeChangeListener: function(tabId, callback) {
    if (typeof callback !== 'function' || !this._listeners[tabId]) {
      return;
    }

    let listenerIndex = this._listeners[tabId].indexOf(callback);
    if (listenerIndex >= 0) {
      this._listeners[tabId].splice(listenerIndex, 1);
    }
  },

  _invokeListeners: function(tabId) {
    if (this._listeners[tabId] && this._listeners[tabId].length) {
      this._listeners[tabId].forEach(listener => listener());
    }
  },

  _hasUpdates: function(newLogs, oldLogs) {
    if ((!newLogs && oldLogs) || (newLogs && !oldLogs)) {
      return true;
    }

    return JSON.stringify(newLogs) !== JSON.stringify(oldLogs);
  },

  addLog: function(rule, requestDetails, description) {
    const log = {
      id: this._generateLogId(),
      timestamp: Date.now(),
      ruleId: rule.id,
      requestURL: requestDetails.url,
      description: description
    };

    const tabId = requestDetails.tabId;
    const tabUrl = window.tabService.getTabUrl(tabId);
    const domain = RQ.Utils.extractUrlComponent(tabUrl, RQ.URL_COMPONENTS.HOST);

    this.addLogToDomain(tabId, domain, log);
    this._invokeListeners(tabId);
  },

  addLogToDomain: function(tabId, domain, log) {
    let domainLogs = this.logs[tabId] && this.logs[tabId][domain];

    if (domainLogs) {
      // Limit number of logs to be maintained
      const MAX_LOGS_COUNT = 50;
      if (domainLogs.length >= MAX_LOGS_COUNT) {
        domainLogs.splice(0, domainLogs.length - MAX_LOGS_COUNT + 1);
      }

      domainLogs.push(log);
    } else {
      // To optimize, we discard previous domain logs. But as a downside, log for redirect rule applied on last page will be lost.
      this.logs[tabId] = { [domain]: [log] };
    }
  },

  getLogsByTabId: function(tabId, populateRuleData) {
    const logs = this.logs[tabId] || {};

    if (populateRuleData) {
      for (let domain in logs) {
        let domainLogs = logs[domain];
        domainLogs.forEach(log => {
          log.ruleData = RQ.StorageService.getCachedRecord(log.ruleId);
        });
      }
    }

    return logs;
  },

  clearInactiveTabLogs: function() {
    if (!window.tabService) {
      return;
    }

    for (let tabId in this.logs) {
      if (!window.tabService.getTab(tabId)) {
        delete this.logs[tabId];
        delete this._listeners[tabId];
      }
    }
  },

  clearLogsForDomain: function(tabId, domain) {
    if (this.logs[tabId] && this.logs[tabId][domain]) {
      delete this.logs[tabId][domain];

      if (Object.keys(this.logs[tabId]).length === 0) {
        delete this.logs[tabId];
      }
    }
  },

  clearLogsForTab: function(tabId) {
    if (this.logs[tabId]) {
      delete this.logs[tabId];
    }

    if (this._listeners[tabId]) {
      delete this._listeners[tabId];
    }

    // Whenever tab is closed, also remove any inactive logs tab
    this.clearInactiveTabLogs();
  },

  _generateLogId: function() {
    return Math.ceil(Math.random() * 100) + Date.now();
  }
};

RQ.sampleRulesAndGroupData =
  [
    {
      "creationDate": 1560244776666,
      "description": "Turn it on and try opening example.com?utm_source=gmail",
      "groupId": "Group_1560243566306",
      "id": "QueryParam_1560244776666",
      "isSample": true,
      "name": "Remove UTM Params",
      "objectType": "rule",
      "pairs": [
        {
          "modifications": [
            {
              "actionWhenParamExists": "Overwrite",
              "param": "utm_medium",
              "type": "Remove",
              "value": ""
            },
            {
              "actionWhenParamExists": "Overwrite",
              "param": "utm_source",
              "type": "Remove",
              "value": ""
            }
          ],
          "source": {
            "filters": {
              "resourceType": [
                "main_frame"
              ]
            },
            "key": "Url",
            "operator": "Contains",
            "value": "example.com"
          }
        }
      ],
      "ruleType": "QueryParam",
      "status": "Inactive"
    },
    {
      "creationDate": 1560244567852,
      "description": "Block Facebook, Twitter etc and do something productive.",
      "groupId": "Group_1560243566306",
      "id": "Cancel_1560244567852",
      "isSample": true,
      "name": "Block Social Media Sites",
      "objectType": "rule",
      "pairs": [
        {
          "source": {
            "filters": {
              "resourceType": [
                "main_frame"
              ]
            },
            "key": "Url",
            "operator": "Contains",
            "value": "facebook"
          }
        },
        {
          "source": {
            "filters": {
              "resourceType": [
                "main_frame"
              ]
            },
            "key": "Url",
            "operator": "Contains",
            "value": "twitter"
          }
        }
      ],
      "ruleType": "Cancel",
      "status": "Inactive"
    },
    {
      "creationDate": 1560244092040,
      "description": "Turn it on and your chrome address bar will show results from DuckDuckGo",
      "groupId": "Group_1560243566306",
      "id": "Redirect_1560244092040",
      "isSample": true,
      "name": "Redirect Google Queries to DuckDuckGo",
      "objectType": "rule",
      "pairs": [
        {
          "destination": "$1://duckduckgo.com/?q=$3&$4",
          "source": {
            "filters": {},
            "key": "Url",
            "operator": "Wildcard_Matches",
            "value": "*://www.google.*/search?q=*&*"
          }
        }
      ],
      "ruleType": "Redirect",
      "status": "Inactive"
    },
    {
      "creationDate": 1560243566306,
      "description": "",
      "id": "Group_1560243566306",
      "isSample": true,
      "name": "Sample Rules",
      "objectType": "group",
      "status": "Active"
    }
  ];


RQ.flags = [
  "response_rule_enabled"
];

const BG = {
  Methods: {},
  statusSettings: {
    id: RQ.STORAGE_KEYS.REQUESTLY_SETTINGS,
    avoidCache: true,
    isExtensionEnabled: true
  },
  userInfo: {
    id: RQ.STORAGE_KEYS.USER_INFO,
    avoidCache: true,
    installationDate: Date.now(),
    planName: '',
    isLoggedIn: ''
  },
  remoteRulesSettings: { enabled: false },
  remoteRulesImportJobId: -1,
  remoteRulesGroupId: 'Group_remote_rules',
  extensionStatusContextMenuId: -1,
  modifiedRequestsPool: new Queue(1000)
};

/**
 * Applies replace rule on given url
 * @param rule definition
 * @param url Url on which rule is to be applied
 * @param details details of request
 * @returns resultingUrl after applying replace rule
 */
BG.Methods.applyReplaceRule = function(rule, url, details) {
  let pairs = rule.pairs,
    pair = null,
    from = null,
    isFromPartRegex,
    resultingUrl = url;

  for (let i = 0; i < pairs.length; i++) {
    pair = pairs[i];
    pair.from = pair.from || '';

    if (pair.source && !RuleMatcher.matchRequestWithRuleSourceFilters(pair.source.filters, details)) {
      continue;
    }

    // If Source Value exists and does not match, proceed with next pair
    if (pair.source && pair.source.value && RuleMatcher.matchUrlWithRuleSource(pair.source, resultingUrl) === null) {
      continue;
    }

    // When string pair.from looks like a RegExp, create a RegExp object from it
    from = RQ.Utils.toRegex(pair.from);
    isFromPartRegex = (from !== null);

    from = from || pair.from;

    // Use String.match method when from is Regex otherwise use indexOf
    // Issue-86: String.match("?a=1") fails with an error
    if ((isFromPartRegex && resultingUrl.match(from)) || (resultingUrl.indexOf(from) !== -1)) {
      resultingUrl = resultingUrl.replace(from, pair.to);
    }
  }

  return resultingUrl !== url ? resultingUrl : null;
};

BG.Methods.applyQueryParamModification = function(modification, url) {
  var resultingUrl = url,
    urlWithoutQueryParams = RQ.Utils.getUrlWithoutQueryParamsAndHash(url),
    urlHash = RQ.Utils.extractUrlComponent(url, RQ.URL_COMPONENTS.HASH),
    queryString = RQ.Utils.extractUrlComponent(url, RQ.URL_COMPONENTS.QUERY),
    queryParamsMap = RQ.Utils.getQueryParamsMap(queryString),
    paramName = modification.param,
    paramValue = modification.value;

  switch(modification.type) {
    case RQ.MODIFICATION_TYPES.ADD:
      if (modification.actionWhenParamExists === 'Overwrite') {
        queryParamsMap[paramName] = [];
        queryParamsMap[paramName].push(paramValue);

        queryString = RQ.Utils.convertQueryParamMapToString(queryParamsMap);
        resultingUrl = queryString ? urlWithoutQueryParams + '?' + queryString : urlWithoutQueryParams;
        resultingUrl += urlHash;
      }

      if (modification.actionWhenParamExists === 'Ignore') {
        resultingUrl = url;
      }
      break;

    case RQ.MODIFICATION_TYPES.REMOVE:
      if (paramName in queryParamsMap) {
        delete queryParamsMap[paramName];

        queryString = RQ.Utils.convertQueryParamMapToString(queryParamsMap);

        resultingUrl = queryString ? urlWithoutQueryParams + '?' + queryString : urlWithoutQueryParams;
        resultingUrl += urlHash;
      }
      break;

    case RQ.MODIFICATION_TYPES.REMOVE_ALL:
      resultingUrl = urlWithoutQueryParams + urlHash;
      break;
  }

  return resultingUrl;
};

/**
 * Apply list of query param modifications to given url
 * @param modifications
 * @param url
 * @returns Final Url after applying the given modifications to input url
 */
BG.Methods.applyQueryParamModifications = function(modifications, url) {
  var resultingUrl = url;

  modifications.forEach(function(modification) {
    resultingUrl = BG.Methods.applyQueryParamModification(modification, resultingUrl);
  });

  return resultingUrl;
};

BG.Methods.applyQueryParamRule = function(rule, url, details) {
  var pairs = rule.pairs,
    pair = null,
    resultingUrl = url;

  for (var i = 0; i < pairs.length; i++) {
    pair = pairs[i];

    // If Source does not match, proceed with next pair
    if (!RuleMatcher.matchRequestWithRuleSourceFilters(pair.source.filters, details)
      || RuleMatcher.matchUrlWithRuleSource(pair.source, url) === null) {
      continue;
    }

    resultingUrl = BG.Methods.applyQueryParamModifications(pair.modifications, resultingUrl);
  }

  return resultingUrl !== url ? resultingUrl : null;
};

BG.Methods.addHeader = function(headers, newHeader) {
  headers.push({ name: newHeader.name, value: newHeader.value });
};

BG.Methods.removeHeader = function(headers, name) {
  for (var i = headers.length - 1; i >= 0; i--) {
    var header = headers[i];
    if (header.name && header.name.toLowerCase() === name.toLowerCase()) {
      headers.splice(i, 1);
    }
  }
};

BG.Methods.modifyHeaderIfExists = function(headers, newHeader) {
  for (var i = headers.length - 1; i >= 0; i--) {
    var header = headers[i];
    if (header.name && header.name.toLowerCase() === newHeader.name.toLowerCase()) {
      header.value = newHeader.value;
      break;
    }
  }
};

BG.Methods.replaceHeader = function(headers, newHeader) {
  BG.Methods.removeHeader(headers, newHeader.name);
  BG.Methods.addHeader(headers, newHeader);
};

/**
 *
 * @param originalHeaders Original Headers present in the HTTP(s) request
 * @param headersTarget Request/Response (Where Modification is to be done)
 * @param details (Actual details object)
 * @returns originalHeaders with modifications if modified else returns {code}null{/code}
 */
BG.Methods.modifyHeaders = function(originalHeaders, headersTarget, details) {
  var rule,
    ruleType,
    rulePairs,
    rulePair,
    isRuleApplied = false,
    modification,
    url = details.url,
    mainFrameUrl = BG.Methods.getMainFrameUrl(details),
    enabledRules = BG.Methods.getEnabledRules();

  for (var i = 0; i < enabledRules.length; i++) {
    rule = enabledRules[i];
    ruleType = rule.ruleType;

    if ([RQ.RULE_TYPES.HEADERS, RQ.RULE_TYPES.USERAGENT].indexOf(ruleType) === -1) {
      continue;
    }

    rulePairs = rule.pairs || [];

    for (var index = 0; index < rulePairs.length; index++) {
      rulePair = rulePairs[index];

      // We generate modificationType, target etc for UA rule in this method. These fields are not persisted
      modification = BG.Methods.getHeaderModification(ruleType, rulePair);

      if (modification.target !== headersTarget || !modification.header) {
        continue;
      }

      if (!RuleMatcher.matchRequestWithRuleSourceFilters(modification.source.filters, details)) {
        continue;
      }

      // If Source Value exists and does not match, proceed with next pair
      // In UA Rule Type, we match Source Object with mainFrame as well
      if (modification.source.value
        && RuleMatcher.matchUrlWithRuleSource(modification.source, url) === null
        && !(ruleType === RQ.RULE_TYPES.USERAGENT
          && modification.source.requestType === RQ.REQUEST_TYPES.MAIN_FRAME
          && mainFrameUrl
          && RuleMatcher.matchUrlWithRuleSource(modification.source, mainFrameUrl) !== null)) {
        continue;
      }

      isRuleApplied = true;

      // Check if user has used predefinedFunction in (add/modify) header value
      var valueWithPreDefFunctionsApplied = RuleMatcher.matchValueForPredefinedFunctions(modification.value, RQ.PreDefinedFunctions);

      switch (modification.type) {
        case RQ.MODIFICATION_TYPES.ADD:
          BG.Methods.addHeader(originalHeaders, {
            name: modification.header,
            value: valueWithPreDefFunctionsApplied
          });
          break;

        case RQ.MODIFICATION_TYPES.REMOVE:
          BG.Methods.removeHeader(originalHeaders, modification.header);
          break;

        case RQ.MODIFICATION_TYPES.MODIFY:
          BG.Methods.modifyHeaderIfExists(originalHeaders, {
            name: modification.header,
            value: valueWithPreDefFunctionsApplied
          });
          break;

        // This ensures header is sent only once.
        // If it is not present, we will add this header otherwise modify the existing one
        case RQ.MODIFICATION_TYPES.REPLACE:
          BG.Methods.replaceHeader(originalHeaders, {
            name: modification.header,
            value: valueWithPreDefFunctionsApplied
          });
          break;
      }

      BG.Methods.logRuleApplied(rule, details);
    }
  }

  // If rule is not applied and we return headers object without any change, then chrome treats them as modification
  // And some websites break due to this.
  return isRuleApplied ? originalHeaders : null;
};

BG.Methods.getMainFrameUrl = function(details) {
  return window.tabService.getTabUrl(details.tabId);
};

BG.Methods.getHeaderModification = function(ruleType, rulePair) {
  var modification;

  if (ruleType === RQ.RULE_TYPES.USERAGENT) {
    return {
      source: rulePair.source,
      target: RQ.HEADERS_TARGET.REQUEST,
      type: RQ.MODIFICATION_TYPES.REPLACE,
      header: RQ.HEADER_NAMES.USER_AGENT,
      value: rulePair.userAgent
    };
  }

  modification = rulePair;
  modification.source = modification.source || {};
  return modification;
};

BG.Methods.getMatchingRulePairs = function(sourceUrl, ruleType){
  if (!BG.statusSettings.isExtensionEnabled) return [];

  return BG.Methods.getEnabledRules()
    .filter(function(enabledRule) {
      return (!ruleType || enabledRule.ruleType === ruleType);
    })
    .reduce(function(matchedRulePairsSoFar, enabledRule) {
      var matchedRulePairs = enabledRule.pairs.filter(function(pair) {
          return RuleMatcher.matchUrlWithRuleSource(pair.source, sourceUrl) !== null;
        });
      return matchedRulePairsSoFar.concat(matchedRulePairs);
    }, []);
};

BG.Methods.getMatchingRules = function(sourceUrl, ruleType) {
  if (!BG.statusSettings.isExtensionEnabled) return [];

  return BG.Methods.getEnabledRules()
    .filter(function(rule) {
      return (!ruleType || rule.ruleType === ruleType) &&
        RuleMatcher.matchUrlWithRulePairs(rule.pairs, sourceUrl) !== null;
    });
};

BG.Methods.modifyUrl = function(details) {
  var requestUrl = details.url,
    resultingUrl = null,
    enabledRules;

  // Do not modify OPTIONS request since preflight requests cannot be redirected
  if (details.method.toLowerCase() === 'options') {
    return;
  }

  // Do not modify URL again if it has been already processed earlier
  if (details.requestId && BG.modifiedRequestsPool.getElementIndex(details.requestId) > -1) {
    return;
  }

  // Issue #142: Handle Shared Urls. Keep this forever
  if (requestUrl.indexOf('web.requestly.in') !== -1) {
    resultingUrl = requestUrl.replace('http://web.requestly.in/', RQ.RULES_PAGE_URL);
    return { redirectUrl: resultingUrl };
  }

  // Issue #277: Move App Pages (Rules, Library) from www. to app. domain
  if (requestUrl.indexOf('www.requestly.in/rules') !== -1 || requestUrl.indexOf('www.requestly.in/library') !== -1) {
    resultingUrl = requestUrl.replace('https://www.requestly.in', RQ.configs.WEB_URL);
    return { redirectUrl: resultingUrl };
  }

  enabledRules = BG.Methods.getEnabledRules();

  for (var i = 0; i < enabledRules.length; i++) {
    var rule = enabledRules[i],
      processedUrl = null;

    switch(rule.ruleType) {
      case RQ.RULE_TYPES.REDIRECT:
        // Introduce Pairs: Transform the Redirect Rule Model to new Model to support multiple entries (pairs)
        if (typeof rule.source !== 'undefined' && typeof rule.destination !== 'undefined') {
          rule.pairs = [{
            source: { key: RQ.RULE_KEYS.URL, operator: rule.source.operator, value: rule.source.values[0] },
            destination: rule.destination
          }];

          delete rule.source;
          delete rule.destination;
        }

        processedUrl = RuleMatcher.matchUrlWithRulePairs(rule.pairs, requestUrl, details);
        processedUrl = RuleMatcher.matchValueForPredefinedFunctions(processedUrl, RQ.PreDefinedFunctions);

        break;

      // In case of Cancel Request, destination url is 'javascript:'
      case RQ.RULE_TYPES.CANCEL:
        // Introduce Pairs: Transform the Cancel Rule Model to new Model to support multiple entries (pairs)
        if (typeof rule.source !== 'undefined') {
          rule.pairs = [{
            source: { key: RQ.RULE_KEYS.URL, operator: rule.source.operator, value: rule.source.values[0] }
          }];

          delete rule.source;
        }

        processedUrl = RuleMatcher.matchUrlWithRulePairs(rule.pairs, requestUrl, details);
        if (processedUrl !== null) {
          processedUrl = 'javascript:';
        }
        break;

      case RQ.RULE_TYPES.REPLACE:
        processedUrl = BG.Methods.applyReplaceRule(rule, requestUrl, details);
        processedUrl = RuleMatcher.matchValueForPredefinedFunctions(processedUrl, RQ.PreDefinedFunctions);

        break;

      case RQ.RULE_TYPES.QUERYPARAM:
        processedUrl = BG.Methods.applyQueryParamRule(rule, requestUrl, details);
        processedUrl = RuleMatcher.matchValueForPredefinedFunctions(processedUrl, RQ.PreDefinedFunctions);

        break;
    }

    if (processedUrl) {
      // allow other rules to apply on resultingUrl
      requestUrl = resultingUrl = processedUrl;
      BG.Methods.logRuleApplied(rule, details, 'redirected to ' + resultingUrl);
    }
  }

  if (resultingUrl) {
    BG.modifiedRequestsPool.enQueue(details.requestId);
    return { redirectUrl: resultingUrl };
  }
};

BG.Methods.logRuleApplied = function(rule, requestDetails, description) {
  if (requestDetails.tabId === chrome.tabs.TAB_ID_NONE) {
    // Requests which are fired from non-tab pages like background, chrome-extension page
    return;
  }

  BG.Methods.setExtensionIconActive(requestDetails.tabId);
  RQ.ruleLoggerService.addLog(rule, requestDetails, description);
};

BG.Methods.modifyRequestHeadersListener = function(details) {
  var modifiedHeaders = BG.Methods.modifyHeaders(details.requestHeaders, RQ.HEADERS_TARGET.REQUEST, details);

  if (modifiedHeaders !== null) {
    return { requestHeaders: modifiedHeaders };
  }
};

BG.Methods.onHeadersReceived = function(details) {
  var modifiedHeaders = BG.Methods.modifyHeaders(details.responseHeaders, RQ.HEADERS_TARGET.RESPONSE, details);

  BG.Methods.overrideResponse(details, modifiedHeaders || details.responseHeaders);
  
  if (modifiedHeaders !== null) {
    return { responseHeaders: modifiedHeaders };
  }
};

BG.Methods.overrideResponse = function(details, responseHeaders) {
  let responseRules = BG.Methods.getMatchingRules(details.url, RQ.RULE_TYPES.RESPONSE);

  if (responseRules.length > 0) {
    const finalResponseRule = responseRules[responseRules.length - 1]; // last overridden response is final

    chrome.tabs.sendMessage(details.tabId, {
      action: RQ.CLIENT_MESSAGES.OVERRIDE_RESPONSE,
      url: details.url,
      responseHeaders,
      rule: {
        id: finalResponseRule.id,
        response: finalResponseRule.pairs[0].response
      }
    }, {frameId: details.frameId});
  }
};

BG.Methods.getEnabledRules = function() {
  var enabledRules = [],
    allRules = [],
    groups = {};

  RQ.StorageService.records.forEach(function(record) {
    if (!record.objectType || record.objectType === RQ.OBJECT_TYPES.RULE) {
      allRules.push(record);
    } else if (record.objectType === RQ.OBJECT_TYPES.GROUP) {
      groups[record.id] = record;
    }
  });

  allRules.forEach(function(rule) {
    var group = rule.groupId && groups[rule.groupId];

    if (rule.status === RQ.RULE_STATUS.ACTIVE && (!group || group.status === RQ.RULE_STATUS.ACTIVE)) {
      enabledRules.push(rule);
    }
  });

  return enabledRules;
};

BG.Methods.getFavouriteRules = function() {
  return RQ.StorageService.records.filter(function(record) {
    return ((!record.objectType || record.objectType === RQ.OBJECT_TYPES.RULE) && record.isFavourite);
  });
};

BG.Methods.registerListeners = function() {
  if (!chrome.webRequest.onBeforeRequest.hasListener(BG.Methods.modifyUrl)) {
    chrome.webRequest.onBeforeRequest.addListener(
      BG.Methods.modifyUrl, { urls: ['<all_urls>'] }, ['blocking']
    );
  }

  if (!chrome.webRequest.onBeforeSendHeaders.hasListener(BG.Methods.modifyRequestHeadersListener)) {
    var onBeforeSendHeadersOptions = ['blocking', 'requestHeaders'];
    if (chrome.webRequest.OnBeforeSendHeadersOptions.EXTRA_HEADERS) {
      onBeforeSendHeadersOptions.push(chrome.webRequest.OnBeforeSendHeadersOptions.EXTRA_HEADERS);
    }

    chrome.webRequest.onBeforeSendHeaders.addListener(
      BG.Methods.modifyRequestHeadersListener, { urls: ['<all_urls>'] }, onBeforeSendHeadersOptions
    );
  }

  if (!chrome.webRequest.onHeadersReceived.hasListener(BG.Methods.onHeadersReceived)) {
    var onHeadersReceivedOptions = ['blocking', 'responseHeaders'];
    if (chrome.webRequest.OnHeadersReceivedOptions.EXTRA_HEADERS) {
      onHeadersReceivedOptions.push(chrome.webRequest.OnHeadersReceivedOptions.EXTRA_HEADERS);
    }

    chrome.webRequest.onHeadersReceived.addListener(
      BG.Methods.onHeadersReceived, { urls: ['<all_urls>'] }, onHeadersReceivedOptions
    );
  }
};

// http://stackoverflow.com/questions/23001428/chrome-webrequest-onbeforerequest-removelistener-how-to-stop-a-chrome-web
// Documentation: https://developer.chrome.com/extensions/events
BG.Methods.unregisterListeners = function() {
  chrome.webRequest.onBeforeRequest.removeListener(BG.Methods.modifyUrl);
  chrome.webRequest.onBeforeSendHeaders.removeListener(BG.Methods.modifyRequestHeadersListener);
  chrome.webRequest.onHeadersReceived.removeListener(BG.Methods.onHeadersReceived);
};

BG.Methods.disableExtension = function() {
  BG.statusSettings['isExtensionEnabled'] = false;
  RQ.StorageService.saveRecord({ rq_settings: BG.statusSettings }).then(BG.Methods.handleExtensionDisabled);
};

BG.Methods.enableExtension = function() {
  BG.statusSettings['isExtensionEnabled'] = true;
  RQ.StorageService.saveRecord({ rq_settings: BG.statusSettings }).then(BG.Methods.handleExtensionEnabled);
};

BG.Methods.handleExtensionDisabled = function() {
  BG.Methods.unregisterListeners();
  chrome.contextMenus.update(BG.extensionStatusContextMenuId, {
    title: 'Activate Requestly',
    onclick: BG.Methods.enableExtension
  });
  chrome.browserAction.setIcon({ path: RQ.RESOURCES.EXTENSION_ICON_GREYSCALE });
  BG.Methods.sendMessage({ isExtensionEnabled: false });

  Logger.log('Requestly disabled');
};

BG.Methods.handleExtensionEnabled = function() {
  BG.Methods.registerListeners();
  chrome.contextMenus.update(BG.extensionStatusContextMenuId, {
    title: 'Deactivate Requestly',
    onclick: BG.Methods.disableExtension
  });
  chrome.browserAction.setIcon({ path: RQ.RESOURCES.EXTENSION_ICON });
  BG.Methods.sendMessage({ isExtensionEnabled: true });

  Logger.log('Requestly enabled');
};

BG.Methods.setExtensionIconActive = function(tabId) {
  var updateIcon = function() {
    chrome.browserAction.setIcon({path: RQ.RESOURCES.EXTENSION_ICON_GREEN, tabId: tabId});
  };

  chrome.tabs.get(tabId, function(tab) {
    if (!tab) return; // Do nothing if tab does not exist

    if (tab.status === 'complete') {
      updateIcon();
    } else {
      // icon resets to default while tab is loading, so listen to onUpdated event
      var handler = function(currentTabId, tabChangeInfo) {
        if (currentTabId === tabId && tabChangeInfo.status === 'complete') {
          updateIcon();
          chrome.tabs.onUpdated.removeListener(handler);
        }
      };
      chrome.tabs.onUpdated.addListener(handler);
    }
  });
};

BG.Methods.readExtensionStatus = function() {
  RQ.StorageService.getRecord(RQ.STORAGE_KEYS.REQUESTLY_SETTINGS).then(alreadyStoredSettings => {
    BG.statusSettings = alreadyStoredSettings || BG.statusSettings;
    BG.statusSettings['isExtensionEnabled'] ? BG.Methods.handleExtensionEnabled() : BG.Methods.handleExtensionDisabled();
  });
};

BG.Methods.createContextMenu = function(title, contexts, handler) {
  return chrome.contextMenus.create({
    title: title,
    type: 'normal',
    contexts: contexts,
    onclick: typeof handler === 'function' || function() { console.log('Requestly Default handler executed'); }
  });
};

BG.Methods.sendMessage = function(messageObject, callback) {
  callback = callback || function() { console.log('DefaultHandler: Sending Message to Runtime: ', messageObject); };

  chrome.tabs.query({ url: RQ.RULES_PAGE_URL_PATTERN }, function(tabs) {
    // Send message to each opened tab which matches the url
    for (let tabIndex = 0; tabIndex < tabs.length; tabIndex++) {
      chrome.tabs.sendMessage(tabs[tabIndex].id, messageObject, callback);
    }
  });
};

BG.Methods.handleExtensionInstalledOrUpdated = function(details) {
  if (details.reason === 'install') {
    // Set installation date in storage so that we can take decisions based on usage time in future
    RQ.StorageService.saveRecord({ user_info: BG.userInfo });

    // Add Sample Rules (& Group) to users' storage
    RQ.sampleRulesAndGroupData.forEach(RQ.StorageService.saveRecordWithID);
  }

  // Send extension install/update event to google analytics
  _gaq.push([
    '_trackEvent',
    RQ.GA_EVENTS.CATEGORIES.EXTENSION,
    details.reason,
    'extension ' + details.reason + ' version: ' + chrome.runtime.getManifest().version
  ]);

  Logger.log('Requestly: ' + details.reason);
};

BG.Methods.addListenerForExtensionMessages = function() {
  chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    switch(message.action) {
      case RQ.CLIENT_MESSAGES.GET_SCRIPT_RULES:
        if (message.url) {
          sendResponse(BG.Methods.getMatchingRules(message.url, RQ.RULE_TYPES.SCRIPT));
        }
        break;

      case RQ.CLIENT_MESSAGES.GET_USER_AGENT_RULE_PAIRS:
        if (message.url) {
          sendResponse(BG.Methods.getMatchingRulePairs(message.url, RQ.RULE_TYPES.USERAGENT));
        }
        break;

      case RQ.CLIENT_MESSAGES.NOTIFY_RULES_APPLIED:
        if (message.rules) {
          message.rules.forEach(function(rule) {
            BG.Methods.logRuleApplied(rule, {tabId: sender.tab.id, url: message.url});
          });
        }
        if (message.ruleIds) {
          message.ruleIds.forEach(ruleId => {
            RQ.StorageService.getRecord(ruleId).then(rule => {
              BG.Methods.logRuleApplied(rule, {tabId: sender.tab.id, url: message.url})
            });
          });
        }
        break;

      case RQ.EXTENSION_MESSAGES.FOCUS_TAB:
        if (message.tabId) {
          sendResponse(window.tabService.focusTab(message.tabId));
        }
        break;

      case RQ.EXTENSION_MESSAGES.GET_FULL_LOGS:
        if (message.tabId) {
          sendResponse(RQ.ruleLoggerService.getLogsByTabId(message.tabId, true));
        }
        break;

      case RQ.EXTENSION_MESSAGES.CLEAR_LOGS_FOR_TAB:
        if (message.tabId) {
          sendResponse(RQ.ruleLoggerService.clearLogsForTab(message.tabId));
        }
        break;

      case RQ.EXTENSION_MESSAGES.CLEAR_LOGS_FOR_DOMAIN:
        if (message.tabId && message.domain) {
          sendResponse(RQ.ruleLoggerService.getLogsByTabId(message.tabId, message.domain));
        }
        break;

      case RQ.EXTENSION_MESSAGES.GET_FAVOURITE_RULES:
        sendResponse(BG.Methods.getFavouriteRules());
        break;

      case RQ.EXTENSION_MESSAGES.REMOTE_RULES_SETTINGS_CHANGED:
        sendResponse(BG.Methods.startRemoteRulesImportJob());
        break;

      case RQ.EXTENSION_MESSAGES.GET_FLAGS:
        sendResponse(RQ.flags);
        break;
    }
  });
};

BG.Methods.cleanUpRemoteRulesGroup = function() {
  return new Promise(resolve => {
    RQ.StorageService.getRecord(BG.remoteRulesGroupId).then(obj => {
      // Create if group for remote rules does not exist
      // Hotfix - We missed to add status to group due to which rule was not getting executed
      if (!obj || !obj.status) {
        const remoteRulesGroupObj = {
          id: BG.remoteRulesGroupId,
          objectType: RQ.OBJECT_TYPES.GROUP,
          name: 'Remote Server Rules (Imported Periodically - Do not Edit)',
          status: RQ.RULE_STATUS.ACTIVE,
          creationDate: Date.now()
        };

        return RQ.StorageService.saveRecordWithID(remoteRulesGroupObj);
      }
    }).then(() => {
      // Clean up all the existing rules in Remote Rules Group
      RQ.StorageService.getRecords(RQ.OBJECT_TYPES.RULE).then(rules => {
        const rulesToDelete = [];
        rules.forEach(rule => rule.groupId === BG.remoteRulesGroupId && rulesToDelete.push(rule.id));

        Logger.log('Removing records from Remote Group', rulesToDelete);

        if (rulesToDelete.length > 0) {
          RQ.StorageService.removeRecord(rulesToDelete).then(resolve);
        } else {
          resolve();
        }
      });
    });
  });
};

BG.Methods.importRemoteRules = function() {
  Logger.log('Importing Remote Rules');

  BG.Methods.cleanUpRemoteRulesGroup().then(() => {
    // Make an ajax request to fetch the rules (e.g. https://requestly.page.link/HmjE)
    RQ.fireAjax(BG.remoteRulesSettings.endPoint, true).then(rules => {
      rules.forEach(obj => {
        // Do not import anything besides rule objects
        if (obj.objectType === 'rule' || obj.ruleType) {
          // Set GroupID to Remote Rules Group
          obj.groupId = BG.remoteRulesGroupId;
          RQ.StorageService.saveRecordWithID(obj);
        }
      });
    });
  });
};

BG.Methods.startRemoteRulesImportJob = function() {
  clearInterval(BG.remoteRulesImportJobId);

  StorageService.getRecordFromStorage('remote_rules_settings', 'sync').then(obj => {
    BG.remoteRulesSettings = typeof obj !== 'undefined' ? obj : BG.remoteRulesSettings;

    if (BG.remoteRulesSettings.enabled) {
      BG.remoteRulesImportJobId = setInterval(BG.Methods.importRemoteRules, BG.remoteRulesSettings.frequency * 1000 * 60);
    }
  });
};

BG.Methods.init = function() {
  // Create contextMenu Action to Enable/Disable Requestly (Default Options)
  chrome.contextMenus.removeAll();
  BG.extensionStatusContextMenuId = BG.Methods.createContextMenu(
    RQ.MESSAGES.DEACTIVATE_REQUESTLY_MENU_OPTION,
    RQ.configs.contextMenuContexts
  );

  StorageService.getInstance({ cacheRecords: true }, RQ)
    .then(() => {
      // Handle extension install/update - https://developer.chrome.com/extensions/runtime#event-onStartup
      chrome.runtime.onInstalled.addListener(BG.Methods.handleExtensionInstalledOrUpdated);

      chrome.runtime.setUninstallURL(RQ.GOODBYE_PAGE_URL, () => {
      });

      Logger.log('StorageService Initialized', RQ.StorageService);
      RQ.ruleLoggerService = new RuleLoggerService();

      // Fetch records
      RQ.StorageService.getRecords().then(BG.Methods.readExtensionStatus);

      // Start Remote Rules Import Job
      BG.Methods.startRemoteRulesImportJob();
    });

    // Add Listener to reply to requests from extension content scripts or popup
    BG.Methods.addListenerForExtensionMessages();
};

// Background Initialization Code
(function() {
  try {
    BG.Methods.init();
  } catch(e) {
    // Do nothing
  }
})();
