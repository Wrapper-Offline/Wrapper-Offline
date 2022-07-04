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
