// ==UserScript==
// @name            WME POI Shortcuts
// @namespace       https://greasyfork.org/users/1087400
// @version         2026.08.01.002
// @description     Various UI changes to make editing faster and easier.
// @author          kid4rm90s & copilot
// @include         /^https:\/\/(www|beta)\.waze\.com\/(?!user\/)(.{2,6}\/)?editor\/?.*$/
// @license         GNU GPLv3
// @connect         greasyfork.org
// @connect         translate.googleapis.com
// @grant           GM_xmlhttpRequest
// @grant           GM_addElement
// @grant           unsafeWindow
// @grant           GM_info
// @run-at          document-end
// @require         https://cdn.jsdelivr.net/npm/@turf/turf@7/turf.min.js
// @require         https://greasyfork.org/scripts/560385/code/WazeToastr.js
// @require         https://greasyfork.org/scripts/523706/code/Link%20Enhancer.js
// @require         https://cdn.jsdelivr.net/gh/TheEditorX/wme-sdk-plus@0b212bcaddf3e7983b28b220d120e0dd687a74d1/wme-sdk-plus.js

// ==/UserScript==

/* commit hash for version 1.4.1 : 0b212bcaddf3e7983b28b220d120e0dd687a74d1 ; added on 2026.7.31*/
/* global WazeToastr, wmeSdkPlus, GoogleLinkEnhancer */
/* services icon is referenced from WME-Place-Harmonizer (https://greasyfork.org/en/scripts/28690-wme-place-harmonizer) written by WMEPH Development Group */

(function () {
  ('use strict');

  const updateMessage = `
      <strong>WHAT'S NEW :-</strong><br><br>
      - Added 'Create School Zone using Drawline' shortcut: draw a line and a 10m-wide school zone is created automatically<br>
      - Fixed a bug where typed primary name is missing when translation button is pressed<br>+ and other minor bug fixes and improvements.<br><br>
  `;
  const scriptName = GM_info.script.name;
  const scriptVersion = GM_info.script.version;
  const downloadUrl = 'https://greasyfork.org/scripts/545278-wme-poi-shortcuts/code/wme-poi-shortcuts.user.js';
  const forumURL = 'https://greasyfork.org/scripts/545278-wme-poi-shortcuts/feedback';

  // Global SDK instance — assigned in initScript() after SDK_INITIALIZED resolves
  let wmeSDK;
  const settings = {};

  // Gas Station Brand Names for Nepal and Pakistan
  const GAS_STATION_BRANDNAME = {
    Nepal: {
      countryCode: 'NP',
      brandnames: [
        {
          buttonLabel: 'NOC', primaryName: 'NOC',
          brand: 'Nepal Oil Corporation',
          aliases: ['Nepal Oil Corporation'],
          website: 'noc.org.np',
        },
      ],
    },
    India: {
      countryCode: 'IN',
      brandnames: [
        { buttonLabel: 'ADANI', primaryName: 'ADANI', brand: 'Adani CNG ', aliases: ['Adani'], },
        { buttonLabel: 'BP', primaryName: 'Bharat Petroleum', brand: 'Bharat Petroleum', aliases: ['BP'],},
        { buttonLabel: 'GO', primaryName: 'Go Gas CNG', brand: 'Go Gas CNG', aliases: [],},
        { buttonLabel: 'GUJ', primaryName: 'Gujarat Gas CNG', brand: 'Gujarat Gas CNG', aliases: [], },
        { buttonLabel: 'HP', primaryName: 'Hindustan Petroleum', brand: 'Hindustan Petroleum', aliases: ['HP'], },
        { buttonLabel: 'IOC', primaryName: 'Indian Oil', brand: 'Indian Oil', aliases: ['IOC'], },
        { buttonLabel: 'INDRA', primaryName: 'Indraprastha Gas', brand: 'Indraprastha Gas', aliases: [], },
        { buttonLabel: 'JIO', primaryName: 'Jio - bp', brand: 'Jio - bp', aliases: [], },
        { buttonLabel: 'MNGL', primaryName: 'MNGL CNG', brand: 'MNGL CNG ', aliases: [], },
        { buttonLabel: 'NAYARA', primaryName: 'Nayara Energy', brand: 'Nayara Energy', aliases: ['Nayara'], },
        { buttonLabel: 'ONGC', primaryName: 'ONGC', brand: 'ONGC', aliases: [], },
        { buttonLabel: 'RELIANCE', primaryName: 'Reliance Petroleum', brand: 'Reliance Petroleum', aliases: [], },
        { buttonLabel: 'SHELL', primaryName: 'Shell', brand: 'Shell', aliases: [], },
      ],
    },
    Pakistan: {
      countryCode: 'PK',
      brandnames: [
        { buttonLabel: 'ASKAR', primaryName: 'Askar 1', brand: 'Askar 1', aliases: ['Askar 1 Petrol Pump'], website: 'askaroil.com.pk', },
        { buttonLabel: 'ATTOCK', primaryName: 'Attock', brand: 'Attock', aliases: ['Attock Petrol Pump'], website: 'apl.com.pk', },
        { buttonLabel: 'BE', primaryName: 'Be Energy', brand: 'BE Energy', aliases: ['Be Petrol Pump'], website: 'beenergy.com.pk',},
        { buttonLabel: 'BYCO', primaryName: 'Byco', brand: 'Byco', aliases: ['Byco Petrol Pump'], website: 'byco.com.pk', },
        { buttonLabel: 'CALTEX', primaryName: 'Caltex', brand: 'Caltex', aliases: ['Caltex Petrol Pump'], website: 'caltex.com', },
        { buttonLabel: 'GO', primaryName: 'Go', brand: 'Go', aliases: ['Go Petrol Pump'], website: 'gno.com.pk', },
        { buttonLabel: 'HASCOL', primaryName: 'Hascol', brand: 'Hascol', aliases: [''], website: 'hascol.com', },
        { buttonLabel: 'LAGUARDIA', primaryName: 'LaGuardia', brand: 'LaGuardia', aliases: ['LaGuardia'], website: 'laguardia-group.com',},
        { buttonLabel: 'N3', primaryName: 'N3', brand: 'N3', aliases: ['N3 Petrol Pump'], website: 'n3.com.pk', },
        { buttonLabel: 'PSO', primaryName: 'Pakistan State Oil', brand: 'Pakistan State Oil', aliases: ['PSO Petrol Pump', 'Pakistan State Oil'], website: 'psopk.com', },
        { buttonLabel: 'PUMA', primaryName: 'Puma Energy', brand: 'Puma', aliases: ['Puma'], website: 'pumaenergy.com', },
        { buttonLabel: 'SHELL', primaryName: 'Shell', brand: 'Shell', aliases: ['Shell'], website: 'shell.com.pk', },
        { buttonLabel: 'TAJ', primaryName: 'Taj Petroleum', brand: 'TAJ', aliases: ['Taj Petrol Pump'], website: 'tajcorporation.com', },
        { buttonLabel: 'TOTAL', primaryName: 'Total Parco', brand: 'TOTAL - PARCO', aliases: ['Total Parco', 'Total', 'Total Petrol Pump'], website: 'totalparco.com.pk', },
        { buttonLabel: 'ZOOM', primaryName: 'Zoom', brand: 'Zoom', aliases: ['Zoom Petroleum', 'Zoom Petrol Pump'], website: 'zoom.org.pk', },
        { buttonLabel: 'TARGET', primaryName: 'Target', brand: null, aliases: ['Target Petrol Pump'], website: 'targetlubricants.com', },
      ],
    },
  };
  const CHARGING_STATION_BRANDNAME = {
    Nepal: {
      countryCode: 'NP',
      brandnames: [
        {
          buttonLabel: 'BYD',
          primaryName: 'BYD Charging Station',
          brand: 'BYD',
          networkName: 'BYD', // WME dropdown item-id
          costType: 'FEE', // FREE, FEE, or COST_TYPE_UNSPECIFIED
          paymentMethods: ['ONLINE_PAYMENT', 'OTHER', 'DEBIT', 'APP'], // WME payment method item-ids
          aliases: ['EV Charging Station'],
          website: 'cimex.com.np/charging-stations',
        },
        {
          buttonLabel: 'CG',
          primaryName: 'CG Motors Charging Station',
          brand: 'CG Motors',
          networkName: 'CG Motors', // WME dropdown item-id
          costType: 'FEE', // FREE, FEE, or COST_TYPE_UNSPECIFIED
          paymentMethods: ['ONLINE_PAYMENT', 'OTHER', 'DEBIT', 'APP'], // WME payment method item-ids
          aliases: ['EV Charging Station'],
          website: 'cg-ev.com/charger-station',
        },
        {
          buttonLabel: 'MG',
          primaryName: 'MG Motors Charging Station',
          brand: 'MG Motors',
          networkName: 'MG Motors', // WME dropdown item-id
          costType: 'FEE', // FREE, FEE, or COST_TYPE_UNSPECIFIED
          paymentMethods: ['ONLINE_PAYMENT', 'OTHER', 'DEBIT', 'APP'], // WME payment method item-ids
          aliases: ['EV Charging Station'],
          website: 'mgmotors.com.np/locate-ev-charger',
        },
        {
          buttonLabel: 'Tata',
          primaryName: 'Tata Motors Charging Station',
          brand: 'Tata Motors',
          networkName: 'Tata Motors', // WME dropdown item-id
          costType: 'FEE', // FREE, FEE, or COST_TYPE_UNSPECIFIED
          paymentMethods: ['ONLINE_PAYMENT', 'OTHER', 'DEBIT', 'APP'], // WME payment method item-ids
          aliases: ['EV Charging Station'],
          website: 'tatacars.sipradi.com.np/vehicle/charginglocation',
        },
        {
          buttonLabel: 'Hyundai',
          primaryName: 'Hyundai Motors Charging Station',
          brand: 'Hyundai Motors',
          networkName: 'Hyundai Motors', // WME dropdown item-id
          costType: 'FEE', // FREE, FEE, or COST_TYPE_UNSPECIFIED
          paymentMethods: ['ONLINE_PAYMENT', 'OTHER', 'DEBIT', 'APP'], // WME payment method item-ids
          aliases: ['EV Charging Station'],
          website: 'laxmihyundai.com/charge-points',
        },
        {
          buttonLabel: 'NEA',
          primaryName: 'NEA Charging Station',
          brand: 'Nepal Electricity Authority',
          networkName: 'Nepal Electricity Authority', // WME dropdown item-id
          costType: 'FEE', // FREE, FEE, or COST_TYPE_UNSPECIFIED
          paymentMethods: ['ONLINE_PAYMENT', 'OTHER', 'DEBIT', 'APP'], // WME payment method item-ids
          aliases: ['EV Charging Station'],
          website: 'nea.org.np',
        },
        {
          buttonLabel: 'ElectriVa',
          primaryName: 'ElectriVa Charging Station',
          brand: 'ElectriVa Nepal',
          networkName: 'ElectriVa Nepal', // WME dropdown item-id
          costType: 'FEE', // FREE, FEE, or COST_TYPE_UNSPECIFIED
          paymentMethods: ['ONLINE_PAYMENT', 'OTHER', 'APP'], // WME payment method item-ids
          aliases: ['EV Charging Station'],
          website: 'electrivanepal.com/locations',
          openingHours: [{ days: [0, 1, 2, 3, 4, 5, 6], fromHour: '00:00', toHour: '00:00' }], // 24 hours, 7 days a week (days: 0=Sun, 1=Mon, ..., 6=Sat)
          is24_7: true, // Flag for display purposes
        },
        {
          buttonLabel: 'Yatri',
          primaryName: 'Yatri Charging Station',
          brand: 'Yatri',
          networkName: 'Yatri', // WME dropdown item-id
          costType: 'FEE', // FREE, FEE, or COST_TYPE_UNSPECIFIED
          paymentMethods: ['ONLINE_PAYMENT', 'OTHER', 'DEBIT', 'APP'], // WME payment method item-ids
          aliases: ['EV Charging Station'],
          website: 'yatrienergy.com/',
        },
        {
          buttonLabel: 'thee GO',
          primaryName: 'thee GO Charging Station',
          brand: 'thee GO',
          networkName: 'thee GO', // WME dropdown item-id
          costType: 'FEE', // FREE, FEE, or COST_TYPE_UNSPECIFIED
          paymentMethods: ['ONLINE_PAYMENT', 'OTHER', 'DEBIT', 'APP'], // WME payment method item-ids
          aliases: ['EV Charging Station'],
          website: 'www.theego.com.np/thee-go-chargepoint/',
        },
        {
          buttonLabel: 'MAW Vriddhi',
          primaryName: 'MAW Vriddhi Charging Station',
          brand: 'Maw Vriddhi',
          networkName: 'Maw Vriddhi', // WME dropdown item-id
          costType: 'FEE', // FREE, FEE, or COST_TYPE_UNSPECIFIED
          paymentMethods: ['ONLINE_PAYMENT', 'OTHER', 'DEBIT', 'APP'], // WME payment method item-ids
          aliases: ['EV Charging Station'],
          website: 'mawevcharging.com/',
        },
        {
          buttonLabel: 'OmodaJaecoo',
          primaryName: 'OmodaJaecoo Charging Station',
          brand: 'OmodaJaecoo',
          networkName: 'Omoda & Jaecoo', // WME dropdown item-id
          costType: 'FEE', // FREE, FEE, or COST_TYPE_UNSPECIFIED
          paymentMethods: ['ONLINE_PAYMENT', 'OTHER', 'DEBIT', 'APP'], // WME payment method item-ids
          aliases: ['EV Charging Station'],
          website: 'omodajaecoonepal.com/charging-stations-in-nepal',
        },
        {
          buttonLabel: 'GoStation',
          primaryName: 'GoStation Charging Station',
          brand: 'GoStation',
          networkName: 'GoStation', // WME dropdown item-id
          costType: 'FEE', // FREE, FEE, or COST_TYPE_UNSPECIFIED
          paymentMethods: ['ONLINE_PAYMENT', 'OTHER', 'DEBIT', 'APP'], // WME payment method item-ids
          aliases: ['EV Charging Station'],
          website: 'gogoronp-nebula.com',
          openingHours: [{ days: [0, 1, 2, 3, 4, 5, 6], fromHour: '00:00', toHour: '00:00' }], // 24 hours, 7 days a week (days: 0=Sun, 1=Mon, ..., 6=Sat)
          is24_7: true, // Flag for display purposes
        },
        {
          buttonLabel: 'EV Park',
          primaryName: 'EV Park Charging Station',
          brand: 'EV Park',
          networkName: 'EV Park', // WME dropdown item-id
          costType: 'FEE', // FREE, FEE, or COST_TYPE_UNSPECIFIED
          paymentMethods: ['ONLINE_PAYMENT', 'OTHER', 'DEBIT', 'APP'], // WME payment method item-ids
          aliases: ['EV Charging Station'],
          website: 'evparknepal.com/stations',
          openingHours: [{ days: [0, 1, 2, 3, 4, 5, 6], fromHour: '00:00', toHour: '00:00' }], // 24 hours, 7 days a week (days: 0=Sun, 1=Mon, ..., 6=Sat)
          is24_7: true, // Flag for display purposes
        },
        {
          buttonLabel: 'Other',
          primaryName: 'EV Charging Station',
          brand: '',
          networkName: '', // WME dropdown "Other" option
          costType: 'FEE', // FREE, FEE, or COST_TYPE_UNSPECIFIED
          paymentMethods: ['ONLINE_PAYMENT', 'OTHER', 'DEBIT'], // WME payment method item-ids
          aliases: ['EV Charging Station'],
          website: '',
        },
      ],
    },
  };

  // --- Service definitions for venue services panel ---
  const GENERAL_SERVICES = [
    'VALLET_SERVICE',
    'DRIVETHROUGH',
    'WI_FI',
    'RESTROOMS',
    'CREDIT_CARDS',
    'RESERVATIONS',
    'OUTSIDE_SEATING',
    'AIR_CONDITIONING',
    'PARKING_FOR_CUSTOMERS',
    'DELIVERIES',
    'TAKE_AWAY',
    'CURBSIDE_PICKUP',
    'WHEELCHAIR_ACCESSIBLE',
  ];
  const PARKING_LOT_SERVICES = [
    'AIRPORT_SHUTTLE',
    'CAR_WASH',
    'CARPOOL_PARKING',
    'COVERED',
    'DISABILITY_PARKING',
    'EV_CHARGING_STATION',
    'ON_SITE_ATTENDANT',
    'PARK_AND_RIDE',
    'RESERVATIONS',
    'SECURITY',
    'VALET',
    'VALLET_SERVICE',
  ];
  const SERVICE_DISPLAY = {
    VALLET_SERVICE:        { servClass: 'serv-valet-service', label: 'Valet Service' },
    DRIVETHROUGH:          { servClass: 'serv-drivethru',     label: 'Drive-Thru' },
    WI_FI:                 { servClass: 'serv-wifi',          label: 'WiFi' },
    RESTROOMS:             { servClass: 'serv-restrooms',     label: 'Restrooms' },
    CREDIT_CARDS:          { servClass: 'serv-credit',        label: 'Credit Cards' },
    RESERVATIONS:          { servClass: 'serv-reservations',  label: 'Reservations' },
    OUTSIDE_SEATING:       { servClass: 'serv-outdoor',       label: 'Out. Seating' },
    AIR_CONDITIONING:      { servClass: 'serv-ac',            label: 'AC' },
    PARKING_FOR_CUSTOMERS: { servClass: 'serv-parking',       label: 'Parking' },
    DELIVERIES:            { servClass: 'serv-deliveries',    label: 'Delivery' },
    TAKE_AWAY:             { servClass: 'serv-takeaway',      label: 'Take-Away' },
    CURBSIDE_PICKUP:       { servClass: 'serv-curbside',      label: 'Curbside' },
    WHEELCHAIR_ACCESSIBLE: { servClass: 'serv-wheelchair',    label: 'Wheelchair' },
    AIRPORT_SHUTTLE:       { servClass: 'serv-airportshuttle',label: 'Air Shuttle' },
    CAR_WASH:              { servClass: 'serv-carwash',       label: 'Car Wash' },
    CARPOOL_PARKING:       { servClass: 'serv-carpool',       label: 'Carpool' },
    COVERED:               { servClass: 'serv-covered',       label: 'Covered' },
    DISABILITY_PARKING:    { servClass: 'serv-wheelchair',    label: 'Disability P.' },
    EV_CHARGING_STATION:   { servClass: 'serv-ev',            label: 'EV Charging' },
    ON_SITE_ATTENDANT:     { servClass: 'serv-attendant',     label: 'Attendant' },
    PARK_AND_RIDE:         { servClass: 'serv-parkandride',   label: 'P & R' },
    SECURITY:              { servClass: 'serv-security',      label: 'Security' },
    VALET:                 { servClass: 'serv-valet',         label: 'Valet' },
  };

  function getApplicableServices(venue) {
    if (venue && Array.isArray(venue.categories) && venue.categories.includes('PARKING_LOT')) {
      return PARKING_LOT_SERVICES;
    }
    return GENERAL_SERVICES;
  }

  // Debounce utility to prevent excessive function calls
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Debounced version of injection functions
  const debouncedInjectSwapButton = debounce((wmeSDK) => injectSwapNamesButton(wmeSDK), 100);
  const debouncedInjectButtonStation = debounce((wmeSDK) => injectButtonStation(wmeSDK), 100);
  const debouncedInjectServicesPanel = debounce((wmeSDK) => injectServicesPanel(wmeSDK), 100);
  const debouncedInjectPOITranslateButton = debounce((wmeSDK) => injectPOITranslateButton(wmeSDK), 100);

  // Global variables to track observers and prevent duplicates
  let aliasListObserver = null;
  let observedAliasItems = new Set();
  let nameInputObserved = false;
  let aliasObservers = new Set(); // Track individual alias observers
  let nameAttrObserver = null; // Track name attribute observer

  // Constants for timeouts and delays
  const ALIAS_INJECTION_DELAY = 50;
  const RETRY_INJECTION_DELAY = 100;
  const BRAND_BUTTON_RETRY_DELAY = 150;
  const SCRIPT_UPDATE_MONITOR_DELAY = 250;
  const UI_ELEMENT_WAIT_DELAY = 50;
  const MAX_RETRY_ATTEMPTS = 20; // Prevent infinite recursion

  // Logging utility with consistent prefixes
  const Logger = {
    info: (message, ...args) => console.log(`[WME POI Shortcuts] ${message}`, ...args),
    warn: (message, ...args) => console.warn(`[WME POI Shortcuts] ${message}`, ...args),
    error: (message, ...args) => console.error(`[WME POI Shortcuts] ${message}`, ...args),
  };

  // Helper function to safely disconnect observer
  function disconnectAliasObserver() {
    if (aliasListObserver) {
      try {
        aliasListObserver.disconnect();
        aliasListObserver = null;
      } catch (error) {
        Logger.warn('Error disconnecting alias observer:', error);
        aliasListObserver = null;
      }
    }

    // Disconnect all individual alias observers
    aliasObservers.forEach((observer) => {
      try {
        observer.disconnect();
      } catch (error) {
        Logger.warn('Error disconnecting individual alias observer:', error);
      }
    });
    aliasObservers.clear();

    // Disconnect name attribute observer
    if (nameAttrObserver) {
      try {
        nameAttrObserver.disconnect();
        nameAttrObserver = null;
      } catch (error) {
        Logger.warn('Error disconnecting name attribute observer:', error);
        nameAttrObserver = null;
      }
    }

    observedAliasItems.clear();
    nameInputObserved = false;
  }
  
  unsafeWindow.SDK_INITIALIZED.then(initScript).catch(err =>
    console.error(`[${scriptName}] Initialization failed:`, err)
  );
  // if (typeof unsafeWindow !== 'undefined' && unsafeWindow.SDK_INITIALIZED) {
  //   unsafeWindow.SDK_INITIALIZED.then(initScript);
  // } else if (typeof window.SDK_INITIALIZED !== 'undefined') {
  //   window.SDK_INITIALIZED.then(initScript);
  // } else {
  //   Logger.error('WME SDK is not available. Script will not run.');
  // }

  // Inject custom CSS for grayed out disabled options
  injectCSSWithID('poiDisabledOptionStyle', `select[id^='poiItem'] option:disabled { color: #bbb !important; background: #000000ff !important; }`);

  // Inject CSS for service icon buttons
  appendServiceButtonIconCss();
  injectCSSWithID(
    'poiServicesBannerStyle',
    `
    #poi-services-panel {
      margin: 6px 0;
    }
    #poi-services-panel .poi-services-icons {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-top: 4px;
    }
    .poi-service-btn {
      height: 27px !important;
      width: 27px !important;
      background-size: contain !important;
      background-repeat: no-repeat !important;
      background-position: center !important;
      border: 0 !important;
      padding: 0 !important;
      cursor: pointer;
      outline: 2px solid transparent;
      outline-offset: 2px;
      border-radius: 3px;
    }
    .poi-service-btn:hover {
      outline-color: #5b9bd5;
    }
    /* Light mode: inactive icons dimmed, active icons vivid */
    .poi-service-btn:not([class*="-active"]) {
      opacity: 0.6;
    }
    .poi-service-btn[class*="-active"] {
      opacity: 1;
      filter: brightness(1) saturate(2);
    }
    /* Dark mode: inactive icons brightened to be visible, active icons at normal brightness */
    [wz-theme="dark"] .poi-service-btn:not([class*="-active"]) {
      opacity: 1;
      filter: brightness(7) saturate(1);
    }
    [wz-theme="dark"] .poi-service-btn[class*="-active"] {
      filter: brightness(1) saturate(1);
    }
  `
  );

  // Inject CSS for swap names button
  injectCSSWithID(
    'swapNamesButtonStyle',
    `
    .alias-item-action-swap {
      margin-left: 4px !important;
      opacity: 1 !important;
      visibility: visible !important;
    }
    .alias-item-action-swap .w-icon-arrow-up {
      font-size: 14px !important;
      color: #ffffff !important;
    }
    .swap-names-container {
      text-align: center;
    }
    .swap-names-container .w-icon-arrow-up {
      margin-right: 4px;
      color: #ffffff !important;
    }
  `
  );

  // POI translate button CSS is injected directly into the wz-text-input shadow DOM
  // (see injectTranslateButtonIntoDOM) — matching Road Name Helper WMERNH_container pattern.

  // --- GLE (Google Link Enhancer) Integration ---
  // GLE settings and messages
  // Load GLE enabled state from localStorage
  let gleEnabled = false;
  let gleShowTempClosed = true;
  let openEditAddressOnRPP = false;
  let schoolZoneSpeedLimit = 20; // Default speed limit for school zones, can be customized in settings
  let schoolZoneWidth = 10; // Default width (meters) of the drawn line when creating school zones via draw line
  try {
    gleEnabled = JSON.parse(localStorage.getItem('wme-poi-shortcuts-gle-enabled'));
  } catch (e) {
    gleEnabled = false;
  }
  try {
    gleShowTempClosed = JSON.parse(localStorage.getItem('wme-poi-shortcuts-gle-show-temp-closed'));
  } catch (e) {
    gleShowTempClosed = true;
  }
  try {
    openEditAddressOnRPP = JSON.parse(localStorage.getItem('wme-poi-shortcuts-open-edit-address-rpp'));
  } catch (e) {
    openEditAddressOnRPP = false;
  }
  try {
    const storedSpeedLimit = parseInt(localStorage.getItem('wme-poi-shortcuts-school-zone-speed-limit'), 10);
    if (!isNaN(storedSpeedLimit) && storedSpeedLimit > 0) {
      schoolZoneSpeedLimit = storedSpeedLimit;
    }
  } catch (e) {
    schoolZoneSpeedLimit = 20; // Default school zone speed limit if parsing fails
  }
  try {
    const storedSchoolZoneWidth = parseInt(localStorage.getItem('wme-poi-shortcuts-school-zone-width'), 10);
    if (!isNaN(storedSchoolZoneWidth) && storedSchoolZoneWidth > 0) {
      schoolZoneWidth = storedSchoolZoneWidth;
    }
  } catch (e) {
    schoolZoneWidth = 10; // Default school zone line width if parsing fails
  }

  // --- POI Translation settings ---
  //const POI_TRANSLATION_SPREADSHEET_ID = '1v5oktSBohAGIc_yAs2XBT2xK8oZ9FFR9tT5rT_hL_C8'; // Same sheet as Road Name Helper for GoogleTranslate sheet
  const POI_TRANSLATION_LOCALES = [
    { code: 'ne', name: 'Nepali', label: 'ने. (Nepali)', buttonLabel: 'ने.' },
    { code: 'hi', name: 'Hindi', label: 'हि. (Hindi)', buttonLabel: 'हि.' },
    { code: 'bn', name: 'Bengali', label: 'বা. (Bengali)', buttonLabel: 'বা.' },
    { code: 'ta', name: 'Tamil', label: 'த. (Tamil)', buttonLabel: 'த.' },
    { code: 'te', name: 'Telugu', label: 'తె. (Telugu)', buttonLabel: 'తె.' },
    { code: 'mr', name: 'Marathi', label: 'मरा. (Marathi)', buttonLabel: 'मरा.' },
    { code: 'gu', name: 'Gujarati', label: 'ગુ. (Gujarati)', buttonLabel: 'ગુ.' },
    { code: 'kn', name: 'Kannada', label: 'ಕ. (Kannada)', buttonLabel: 'ಕ.' },
    { code: 'ml', name: 'Malayalam', label: 'മ. (Malayalam)', buttonLabel: 'മ.' },
    { code: 'pa', name: 'Punjabi', label: 'ਪੰ. (Punjabi)', buttonLabel: 'ਪੰ.' },
    { code: 'si', name: 'Sinhala', label: 'සි. (Sinhala)', buttonLabel: 'සි.' },
    { code: 'th', name: 'Thai', label: 'ท. (Thai)', buttonLabel: 'ท.' },
    { code: 'my', name: 'Burmese', label: 'မြ. (Burmese)', buttonLabel: 'မြ.' },
    { code: 'ur', name: 'Urdu', label: 'ا. (Urdu)', buttonLabel: 'ا.' },
    { code: 'ar', name: 'Arabic', label: 'ع. (Arabic)', buttonLabel: 'ع.' },
    { code: 'fa', name: 'Persian', label: 'ف. (Persian)', buttonLabel: 'ف.' },
  ];
  // Deduplicate by code (keep first occurrence)
  const _uniqueLocales = [];
  const _seenCodes = new Set();
  for (const loc of POI_TRANSLATION_LOCALES) {
    if (!_seenCodes.has(loc.code)) { _seenCodes.add(loc.code); _uniqueLocales.push(loc); }
  }
  const UNIQUE_TRANSLATION_LOCALES = _uniqueLocales;

  let poiTranslationActive = false;
  let poiTranslationTargetLanguage = 'ne';
  let poiTranslationSourceLanguage = 'auto';
  let poiTranslationButtonLabel = 'ने.'; // Default Nepal button label
  let poiTranslationLocaleName = 'Nepali'; // Default Nepal locale name
  let poiTranslationSpecialRules = []; // Pre-translation regex rules
  // Load POI translation settings from localStorage
  try {
    const storedActive = localStorage.getItem('wme-poi-shortcuts-poi-translate-enabled');
    if (storedActive !== null) poiTranslationActive = storedActive === 'true';
    const storedLocale = localStorage.getItem('wme-poi-shortcuts-poi-translate-locale');
    if (storedLocale) {
      const found = UNIQUE_TRANSLATION_LOCALES.find(l => l.code === storedLocale);
      if (found) {
        poiTranslationTargetLanguage = found.code;
        poiTranslationButtonLabel = found.buttonLabel;
        poiTranslationLocaleName = found.name;
      }
    }
  } catch (e) { /* ignore */ }

  let GLE = {
    enabled: gleEnabled,
    showTempClosedPOIs: gleShowTempClosed,
    enable() {
      this.enabled = true;
      ToggleExternalProvidersCSS(true);
    },
    disable() {
      this.enabled = false;
      ToggleExternalProvidersCSS(false);
    },
    closedPlace: 'Google indicates this place is permanently closed.\nVerify with other sources or your editor community before deleting.',
    multiLinked: 'Linked more than once already. Please find and remove multiple links.',
    linkedToThisPlace: 'Already linked to this place',
    linkedNearby: 'Already linked to a nearby place',
    linkedToXPlaces: 'This is linked to {0} places',
    badLink: 'Invalid Google link.  Please remove it.',
    tooFar: 'The Google linked place is more than {0} meters from the Waze place.  Please verify the link is correct.',
  };

  // Inject CSS helper
  function injectCSSWithID(id, css) {
    let style = document.getElementById(id);
    if (!style) {
      style = document.createElement('style');
      style.id = id;
      style.type = 'text/css';
      style.appendChild(document.createTextNode(css));
      document.head.appendChild(style);
    }
  }

  // Toggle external providers CSS
  function ToggleExternalProvidersCSS(truthiness) {
    if (truthiness) injectCSSWithID('poiExternalProvidersTweaks', '#edit-panel .external-providers-view .select2-container {width:90%; margin-bottom:2px;}');
    else {
      var styles = document.getElementById('poiExternalProvidersTweaks');
      if (styles) styles.parentNode.removeChild(styles);
    }
  }

  async function initScript() {
    // initialize the sdk with your script id and script name
    const wmeSdk = await getWmeSdk({ scriptId: 'wme-poi', scriptName: 'WME POI Shortcuts' });
    const sdkPlus = await initWmeSdkPlus(wmeSdk);
    wmeSDK = sdkPlus || wmeSdk;
    console.log(`${scriptName} SDK+ initialized successfully`);
    
    const onReady = () => {
      // Load saved shortcut settings (migrates legacy keys on first call)
      loadShortcutSettings(true);
      // Setup custom shortcuts after WME is ready
      setupShortcuts(wmeSDK);
      // Register script sidebar tab for venue dropdown
      registerSidebarScriptTab(wmeSDK);
      // Check for initial venue selection and inject swap button if needed
      setTimeout(() => {
        debouncedInjectButtonStation(wmeSDK);
        debouncedInjectSwapButton(wmeSDK);
        debouncedInjectServicesPanel(wmeSDK);
        debouncedInjectPOITranslateButton(wmeSDK);
      }, 500); // Small delay to ensure UI is fully loaded
    };

    if (wmeSDK.State.isReady) {
      onReady();
    } else {
      wmeSDK.Events.once({ eventName: 'wme-ready' }).then(onReady);
    }

    // Check if GoogleLinkEnhancer is loaded and initialize if available
    if (typeof GoogleLinkEnhancer !== 'undefined') {
      // Store the original GLE config
      const gleConfig = {
        enabled: GLE.enabled,
        showTempClosedPOIs: GLE.showTempClosedPOIs,
        permClosedPlace: GLE.closedPlace,
        tempClosedPlace: 'Google indicates this place is temporarily closed.',
        multiLinked: GLE.multiLinked,
        linkedToThisPlace: GLE.linkedToThisPlace,
        linkedNearby: GLE.linkedNearby,
        linkedToXPlaces: GLE.linkedToXPlaces,
        badLink: GLE.badLink,
        tooFar: GLE.tooFar,
      };

      try {
        GLE = new GoogleLinkEnhancer(wmeSdk, turf);

        //***** Set Google Link Enhancer strings *****
        GLE.strings.permClosedPlace = gleConfig.permClosedPlace;
        GLE.strings.tempClosedPlace = gleConfig.tempClosedPlace;
        GLE.strings.multiLinked = gleConfig.multiLinked;
        GLE.strings.linkedToThisPlace = gleConfig.linkedToThisPlace;
        GLE.strings.linkedNearby = gleConfig.linkedNearby;
        GLE.strings.linkedToXPlaces = gleConfig.linkedToXPlaces;
        GLE.strings.badLink = gleConfig.badLink;
        GLE.strings.tooFar = gleConfig.tooFar;

        // Apply the config to the GoogleLinkEnhancer instance AFTER strings are set
        GLE.showTempClosedPOIs = gleConfig.showTempClosedPOIs;

        if (gleConfig.enabled) {
          GLE.enable();
        }
      } catch (gleError) {
        console.error('[WME POI Shortcuts] Error initializing GoogleLinkEnhancer:', gleError);
        GLE = null;
      }
    } else {
      console.warn('[WME POI Shortcuts] GoogleLinkEnhancer library failed to load. Link validation features will be unavailable.');
    }
    // query the WME data model
    // Example: Get the currently selected segment if available
    const selection = wmeSDK.Editing.getSelection();
    let mySegment;
    if (selection && selection.objectType === 'segment' && selection.ids && selection.ids.length === 1) {
      mySegment = wmeSDK.DataModel.Segments.getById({ segmentId: selection.ids[0] });
      if (mySegment && mySegment.isAtoB) {
        // do something
      }
    }

/*

    wmeSDK.Events.once({ eventName: 'wme-ready' }).then(() => {
      // Setup custom shortcuts after WME is ready
      setupShortcuts(wmeSDK);
      // Register script sidebar tab for venue dropdown
      registerSidebarScriptTab(wmeSDK);
      // Check for initial venue selection and inject swap button if needed
      setTimeout(() => {
        debouncedInjectButtonStation(wmeSDK);
        debouncedInjectSwapButton(wmeSDK);
      }, 500); // Small delay to ensure UI is fully loaded
    });*/
    // register to events
    wmeSDK.Events.on({
      eventName: 'wme-map-move',
      eventHandler: () => {
        /* Handle map move events */
      },
    });
    wmeSDK.Events.on({
      eventName: 'wme-map-data-loaded',
      eventHandler: () => {
        /* Handle map data loaded events */
      },
    });
    wmeSDK.Events.on({
      eventName: 'wme-selection-changed',
      eventHandler: () => {
        // Only process venue selections — skip segments, junctions, etc.
        // This prevents interference with other scripts like WME Segment City Tool.
        const currentSelection = wmeSDK.Editing.getSelection();
        if (!currentSelection || currentSelection.objectType !== 'venue') {
          return;
        }

        // Clean up old observers/handlers before setting up new ones
        disconnectAliasObserver();
        $('.gas-station-brand-btn, .charging-station-brand-btn').off('click').remove();
        $('.swap-names-btn').off('click.swapnames').remove();
        $('#poi-services-panel').remove();

        debouncedInjectButtonStation(wmeSDK);
        debouncedInjectSwapButton(wmeSDK);
        debouncedInjectServicesPanel(wmeSDK);
        debouncedInjectPOITranslateButton(wmeSDK);

        // Handle edit address for residential venues if setting is enabled
        handleEditAddressForRPP(wmeSDK);
      },
    });
  }

  // --- Persistence Helpers ---
  function getPOIShortcutsConfig() {
    try {
      return JSON.parse(localStorage.getItem('wme-poi-shortcuts-config') || '{}');
    } catch (e) {
      return {};
    }
  }
  function setPOIShortcutsConfig(config) {
    localStorage.setItem('wme-poi-shortcuts-config', JSON.stringify(config));
  }
  function savePOIShortcutItem(itemNumber) {
    const config = getPOIShortcutsConfig();
    config[itemNumber] = {
      category: $(`#poiItem${itemNumber}`).val(),
      lock: $(`#poiLock${itemNumber}`).val(),
      geometry: $(`#poiGeom${itemNumber}`).val(),
    };
    setPOIShortcutsConfig(config);
  }
  function loadPOIShortcutItem(itemNumber) {
    const config = getPOIShortcutsConfig();
    if (config[itemNumber]) {
      $(`#poiItem${itemNumber}`).val(config[itemNumber].category);
      $(`#poiLock${itemNumber}`).val(config[itemNumber].lock);
      $(`#poiGeom${itemNumber}`).val(config[itemNumber].geometry);
    }
  }

  // --- UI Builders ---
  function buildItemList(itemNumber) {
    // Categories and subcategories as per latest WME spec with icon mappings
    const VENUE_CATEGORIES = [
      { key: 'CAR_SERVICES', icon: 'car-services', subs: ['CAR_WASH', 'CHARGING_STATION', 'GARAGE_AUTOMOTIVE_SHOP', 'GAS_STATION'] },
      { key: 'CRISIS_LOCATIONS', icon: 'crisis-locations', subs: ['DONATION_CENTERS', 'SHELTER_LOCATIONS'] },
      {
        key: 'CULTURE_AND_ENTERTAINEMENT',
        icon: 'culture-and-entertainement',
        subs: ['ART_GALLERY', 'CASINO', 'CLUB', 'TOURIST_ATTRACTION_HISTORIC_SITE', 'MOVIE_THEATER', 'MUSEUM', 'MUSIC_VENUE', 'PERFORMING_ARTS_VENUE', 'GAME_CLUB', 'STADIUM_ARENA', 'THEME_PARK', 'ZOO_AQUARIUM', 'RACING_TRACK', 'THEATER'],
      },
      { key: 'FOOD_AND_DRINK', icon: 'food-and-drink', subs: ['RESTAURANT', 'BAKERY', 'DESSERT', 'CAFE', 'FAST_FOOD', 'FOOD_COURT', 'BAR', 'ICE_CREAM'] },
      { key: 'LODGING', icon: 'lodging', subs: ['HOTEL', 'HOSTEL', 'CAMPING_TRAILER_PARK', 'COTTAGE_CABIN', 'BED_AND_BREAKFAST'] },
      { key: 'NATURAL_FEATURES', icon: 'natural-features', subs: ['ISLAND', 'SEA_LAKE_POOL', 'RIVER_STREAM', 'FOREST_GROVE', 'FARM', 'CANAL', 'SWAMP_MARSH', 'DAM'] },
      { key: 'OTHER', icon: 'other', subs: ['CONSTRUCTION_SITE'] },
      { key: 'OUTDOORS', icon: 'outdoors', subs: ['PARK', 'PLAYGROUND', 'BEACH', 'SPORTS_COURT', 'GOLF_COURSE', 'PLAZA', 'PROMENADE', 'POOL', 'SCENIC_LOOKOUT_VIEWPOINT', 'SKI_AREA'] },
      { key: 'PARKING_LOT', icon: 'parking-lot', subs: [] },
      {
        key: 'PROFESSIONAL_AND_PUBLIC',
        icon: 'professional-and-public',
        subs: [
          'COLLEGE_UNIVERSITY',
          'SCHOOL',
          'CONVENTIONS_EVENT_CENTER',
          'GOVERNMENT',
          'LIBRARY',
          'CITY_HALL',
          'ORGANIZATION_OR_ASSOCIATION',
          'PRISON_CORRECTIONAL_FACILITY',
          'COURTHOUSE',
          'CEMETERY',
          'FIRE_DEPARTMENT',
          'POLICE_STATION',
          'MILITARY',
          'HOSPITAL_URGENT_CARE',
          'DOCTOR_CLINIC',
          'OFFICES',
          'POST_OFFICE',
          'RELIGIOUS_CENTER',
          'KINDERGARDEN',
          'FACTORY_INDUSTRIAL',
          'EMBASSY_CONSULATE',
          'INFORMATION_POINT',
          'EMERGENCY_SHELTER',
          'TRASH_AND_RECYCLING_FACILITIES',
        ],
      },
      {
        key: 'SHOPPING_AND_SERVICES',
        icon: 'shopping-and-services',
        subs: [
          'ARTS_AND_CRAFTS',
          'BANK_FINANCIAL',
          'SPORTING_GOODS',
          'BOOKSTORE',
          'PHOTOGRAPHY',
          'CAR_DEALERSHIP',
          'FASHION_AND_CLOTHING',
          'CONVENIENCE_STORE',
          'PERSONAL_CARE',
          'DEPARTMENT_STORE',
          'PHARMACY',
          'ELECTRONICS',
          'FLOWERS',
          'FURNITURE_HOME_STORE',
          'GIFTS',
          'GYM_FITNESS',
          'SWIMMING_POOL',
          'HARDWARE_STORE',
          'MARKET',
          'SUPERMARKET_GROCERY',
          'JEWELRY',
          'LAUNDRY_DRY_CLEAN',
          'SHOPPING_CENTER',
          'MUSIC_STORE',
          'PET_STORE_VETERINARIAN_SERVICES',
          'TOY_STORE',
          'TRAVEL_AGENCY',
          'ATM',
          'CURRENCY_EXCHANGE',
          'CAR_RENTAL',
          'TELECOM',
        ],
      },
      {
        key: 'TRANSPORTATION',
        icon: 'transportation',
        subs: ['AIRPORT', 'BUS_STATION', 'FERRY_PIER', 'SEAPORT_MARINA_HARBOR', 'SUBWAY_STATION', 'TRAIN_STATION', 'BRIDGE', 'TUNNEL', 'TAXI_STATION', 'JUNCTION_INTERCHANGE', 'REST_AREAS', 'CARPOOL_SPOT'],
      },
    ];

    // Get localized names from SDK (already translated to editor's language)
    let mainCategoryMap = new Map();
    let subCategoryMap = new Map();

    try {
      // Fetch main categories from SDK with localized names
      const mainCategories = wmeSDK.DataModel.Venues.getVenueMainCategories() || [];
      mainCategories.forEach((cat) => {
        mainCategoryMap.set(cat.id, cat.localizedName);
      });

      // Fetch sub-categories from SDK with localized names
      const subCategories = wmeSDK.DataModel.Venues.getVenueSubCategories() || [];
      subCategories.forEach((sub) => {
        subCategoryMap.set(sub.subCategoryId, sub.localizedName);
      });
    } catch (e) {
      Logger.warn('Failed to fetch SDK localized venue categories:', e);
    }

    // Helper function to get localized name with fallback to category ID
    const getLocalizedCategoryName = (categoryId) => mainCategoryMap.get(categoryId) || categoryId;
    const getLocalizedSubCategoryName = (subCategoryId) => subCategoryMap.get(subCategoryId) || subCategoryId;

    let html = `<select id="poiItem${itemNumber}" style="font-size:10px;height:20px;width:100%;max-width:200px;margin:2px 0;">`;
    VENUE_CATEGORIES.forEach((cat) => {
      const categoryName = getLocalizedCategoryName(cat.key);
      html += `<option value="${cat.key}" data-icon="${cat.icon}" style="font-weight:bold;">${categoryName}</option>`;
      cat.subs.forEach((sub) => {
        const subCategoryName = getLocalizedSubCategoryName(sub);
        html += `<option value="${sub}" data-icon="${cat.icon}">${subCategoryName}</option>`;
      });
    });
    html += '</select>';
    return html;
  }
  function buildLockLevelDropdown(itemNumber) {
    // Show lock dropdown for all 10 items
    let html = `<select id="poiLock${itemNumber}" style="margin-left:4px;font-size:10px;height:20px;width:35px;">`;
    for (let i = 0; i <= 4; i++) {
      html += `<option value="${i}">${i + 1}</option>`;
    }
    html += '</select>';
    return html;
  }
  function buildGeometryTypeDropdown(itemNumber) {
    // Dropdown for geometry type: Point or Area
    return `<select id="poiGeom${itemNumber}" style="margin-left:4px;font-size:10px;height:20px;width:55px;">
        <option value="area">Area</option>
        <option value="point">Point</option>
    </select>`;
  }
  function buildItemOption(itemNumber) {
    var $section = $('<div>', { style: 'padding:4px 8px;font-size:10px;', id: 'poiPlaceCat' + itemNumber });
    $section.html(
      [
        `<span style="font-size:10px;font-weight:bold;">Item ${itemNumber}</span>`,
        buildItemList(itemNumber),
        `<div style="display:flex;align-items:center;gap:6px;margin:3px 0 0 0;">
            <label style="font-size:10px;min-width:28px;">Lock</label> ${buildLockLevelDropdown(itemNumber)}
            <label style="font-size:10px;min-width:40px;">Geometry</label> ${buildGeometryTypeDropdown(itemNumber)}
        </div>`,
      ].join(' ')
    );
    return $section.html();
  }
  function buildAllItemOptions() {
    let html = '';
    for (let i = 1; i <= 10; i++) {
      html += buildItemOption(i);
    }
    // Add checkboxes before the keyboard shortcuts message
    html += `
    <div style="margin:12px 0 8px 0; padding:4px 8px; background:transparent; border-radius:4px;">
      <label style="font-size:10px; font-weight:bold;">
        <input type="checkbox" id="_cbEnableGLE" ${GLE && GLE.enabled ? 'checked' : ''} /> Enable Google Link Enhancer
      </label>
      <br>
      <label style="font-size:10px; font-weight:bold; margin-top:4px; display:inline-block;">
        <input type="checkbox" id="_cbOpenEditAddressRPP" ${openEditAddressOnRPP ? 'checked' : ''} /> Open edit address when RPP selected
      </label>
      <br>
      <label style="font-size:10px; font-weight:bold; margin-top:4px; display:inline-block;">
        <input type="checkbox" id="_cbEnablePOITranslate" ${poiTranslationActive ? 'checked' : ''} /> Show Translate button for POI names
      </label>
      <select id="_selPOITranslateLocale" style="margin-left:4px;font-size:10px;height:20px;width:100px;">
        ${UNIQUE_TRANSLATION_LOCALES.map(l => `<option value="${l.code}" ${l.code === poiTranslationTargetLanguage ? 'selected' : ''}>${l.label}</option>`).join('')}
      </select>
      <br>
      <label style="font-size:10px; font-weight:bold; margin-top:4px; display:inline-block;">
        School Zone SL: <input type="number" id="_inputSchoolZoneSpeedLimit" value="${schoolZoneSpeedLimit}" min="1" max="100" style="width:50px; margin-left:4px;" />
        <div style="margin-top:6px;">
          School Zone Width (m): <input type="number" id="_inputSchoolZoneWidth" value="${schoolZoneWidth}" min="1" max="200" style="width:50px; margin-left:4px;" />
        </div>
      </label>
    </div>`;
    html += `<div style='font-size:10px;color:#888;margin-top:8px;'>You can bind keyboard shortcuts using WME's native shortcuts section.</div>`;
    setTimeout(() => {
      for (let i = 1; i <= 10; i++) {
        loadPOIShortcutItem(i);
        // Sync the shortcut description with the currently-selected category in the dropdown
        _refreshPOIShortcut(i, wmeSDK);
        //legacy shortcuts key added from here
        // Populate shortcut input with the actual shortcut key
        const shortcutKey = i === 10 ? 'Ctrl+0' : `Ctrl+${i}`;
        $(`#poiShortcut${i}`).val(shortcutKey);
        // legacy shortcuts key added until above
        // Save on change
        $(`#poiItem${i},#poiLock${i},#poiGeom${i}`)
          .off('change.wmepoi')
          .on('change.wmepoi', function () {
            savePOIShortcutItem(i);
            // When the category dropdown changes, update the shortcut description
            // to show the selected category name (e.g., "Create Gas Station")
            if (this.id.startsWith('poiItem')) {
              _refreshPOIShortcut(i, wmeSDK);
            }

          });
      }
    }, 0);
    return html;
  }
  // ===================================================================
  // SDK SHORTCUT SETUP — Unified Pattern
  // ===================================================================

  // Hazard layer ID mapping for shortcuts that require enabling layers
  const _hazardLayerMap = {
    'toll-booth': 'layer-switcher-item_permanent_hazard_toll_booth',
    'level-crossing': 'layer-switcher-item_permanent_hazard_railroad_crossing',
    'school-zone': 'layer-switcher-item_permanent_hazard_school_zone',
    'sharp-curves': 'layer-switcher-item_permanent_hazard_dangerous_curve',
    'complex-junctions': 'layer-switcher-item_permanent_hazard_dangerous_intersection',
    'multiple-lanes-merging': 'layer-switcher-item_permanent_hazard_dangerous_merge',
    'raised-crosswalk': 'layer-switcher-item_permanent_hazard_raised_crosswalk',
    'highway-crosswalk': 'layer-switcher-item_permanent_hazard_highway_crosswalk',
    'narrow-bridge': 'layer-switcher-item_permanent_hazard_narrow_bridge',
    'both-lanes-ending': 'layer-switcher-item_permanent_hazard_lane_ending',
    'both-shoulders-ending': 'layer-switcher-item_permanent_hazard_shoulder_ending',
  };

  /**
   * Read a hazard's localized label from the WME layer switcher DOM.
   * Falls back to English if the DOM element isn't available.
   * Tries multiple strategies: label attribute, shadow DOM text, parent/sibling text.
   */
  const _hazardEnglishFallback = {
    'toll-booth': 'Toll Booth',
    'level-crossing': 'Level Crossing',
    'school-zone': 'School Zone',
    'sharp-curves': 'Sharp Curves',
    'complex-junctions': 'Complex Junctions',
    'multiple-lanes-merging': 'Multiple Lanes Merging',
    'raised-crosswalk': 'Raised Pedestrian Crossing',
    'highway-crosswalk': 'Pedestrian Crossing',
    'narrow-bridge': 'Narrow Bridge',
    'both-lanes-ending': 'Lane End (abrupt)',
    'both-shoulders-ending': 'Shoulder End (abrupt)',
  };

  function _getHazardLocalizedName(hazardKey) {
    try {
      const el = document.getElementById(_hazardLayerMap[hazardKey]);
      if (!el) return _hazardEnglishFallback[hazardKey] || hazardKey;

      // Pattern 1: wz-checkbox label attribute
      var label = el.getAttribute('label');
      if (label && label.trim()) return label.trim();

      // Pattern 2: shadow DOM text content
      if (el.shadowRoot) {
        var shadowText = el.shadowRoot.textContent.trim();
        if (shadowText) return shadowText;
      }

      // Pattern 3: parent element text content (excluding the checkbox itself)
      var parent = el.parentElement;
      if (parent) {
        var clone = parent.cloneNode(true);
        var childEl = clone.querySelector('#' + _hazardLayerMap[hazardKey].replace(/[:.]/g, '\\$&'));
        if (childEl) childEl.remove();
        var parentText = clone.textContent.trim();
        if (parentText) return parentText;
      }
    } catch (e) { /* DOM read failed, use fallback */ }
    return _hazardEnglishFallback[hazardKey] || hazardKey;
  }

  /**
   * Finds the name of the school venue closest to the center of the given geometry.
   * Used to automatically name newly created school zones.
   * @param geometry A GeoJSON Polygon geometry.
   * @returns The nearest school's name, or an empty string if none is found.
   */
  function _findNearestSchoolName(geometry) {
              var schoolName = '';
              try {
                var allVenues = wmeSDK.DataModel.Venues.getAll();
                var schools = allVenues.filter(function (venue) {
                  return venue.categories && venue.categories.some(function (cat) { return cat === 'SCHOOL' || cat === 'COLLEGE_UNIVERSITY'; });
                });
                if (schools.length > 0 && geometry.coordinates && geometry.coordinates[0]) {
                  var coords = geometry.coordinates[0];
                  var sumLon = 0, sumLat = 0, count = coords.length - 1;
                  for (var ci = 0; ci < count; ci++) { sumLon += coords[ci][0]; sumLat += coords[ci][1]; }
                  var centerLon = sumLon / count, centerLat = sumLat / count;
                  var nearestSchool = null, minDistance = Infinity;
                  schools.forEach(function (school) {
                    var schoolLon, schoolLat;
                    if (school.geometry.type === 'Point') { schoolLon = school.geometry.coordinates[0]; schoolLat = school.geometry.coordinates[1]; }
                    else if (school.geometry.type === 'Polygon' && school.geometry.coordinates[0]) {
                      var sc = school.geometry.coordinates[0], sLon = 0, sLat = 0, sCount = sc.length - 1;
                      for (var si = 0; si < sCount; si++) { sLon += sc[si][0]; sLat += sc[si][1]; }
                      schoolLon = sLon / sCount; schoolLat = sLat / sCount;
                    }
                    if (schoolLon !== undefined && schoolLat !== undefined) {
                      var dist = Math.sqrt(Math.pow(schoolLon - centerLon, 2) + Math.pow(schoolLat - centerLat, 2));
                      if (dist < minDistance) { minDistance = dist; nearestSchool = school; }
                    }
                  });
                  if (nearestSchool && nearestSchool.name && nearestSchool.name.trim()) {
                    schoolName = nearestSchool.name.trim();
                    Logger.info('Found nearby school: ' + schoolName);
                  }
                }
              } catch (schoolSearchError) {
                Logger.warn('Error finding nearby school:', schoolSearchError);
              }
    return schoolName;
  }

  /**
   * Creates a school zone with the given geometry, auto-naming it after the nearest school.
   * @param geometry A GeoJSON Polygon geometry.
   * @returns The ID of the newly created school zone.
   */
  function _createSchoolZone(geometry) {
    var schoolName = _findNearestSchoolName(geometry);
              var schoolZoneId = wmeSDK.DataModel.PermanentHazards.addSchoolZone({
                geometry: geometry,
                name: schoolName,
                speedLimit: schoolZoneSpeedLimit,
                excludedRoadTypes: [],
              });
              Logger.info('School zone created with ID:', schoolZoneId);
              try {
                WazeToastr.Alerts.success('POI Shortcut', schoolName
                  ? '<b>School Zone</b> created: ' + schoolName + ' with speed limit ' + schoolZoneSpeedLimit + ' km/h'
                  : '<b>School Zone</b> created successfully', false, false, 2500);
              } catch (e) { Logger.warn('WazeToastr.Alerts.success failed:', e); }
    return schoolZoneId;
  }

  function _buildHazardCallback(hazardKey, drawMode) {
    return function () {
      ensureHazardLayersEnabled(_hazardLayerMap[hazardKey], function () {
        if (hazardKey === 'school-zone') {
          // School zone uses SDK drawing + PermanentHazards.addSchoolZone.
          // drawMode: 'polygon' (draw an area) or 'line' (draw a line buffered into a polygon)
          var isLineMode = drawMode === 'line';
          try {
            WazeToastr.Alerts.info('POI Shortcut', isLineMode
              ? 'Draw the <b>School Zone</b> line on the map'
              : 'Draw the <b>School Zone</b> area on the map', false, false, 3000);
          } catch (e) {
            Logger.warn('WazeToastr.Alerts.info failed:', e);
          }
          var drawPromise = isLineMode ? wmeSDK.Map.drawLine() : wmeSDK.Map.drawPolygon();
          drawPromise.then(function (drawn) {
            try {
              var geometry = drawn;
              if (isLineMode) {
                var lineGeometry = drawn.geometry || drawn;
                geometry = turf.buffer(lineGeometry, schoolZoneWidth / 2, { units: 'meters' }).geometry;
              }
              _createSchoolZone(geometry);
            } catch (error) {
              Logger.error('Failed to create school zone:', error);
              try { WazeToastr.Alerts.error('POI Shortcut', 'Failed to create <b>School Zone</b>: ' + error.message, false, false, 3000); } catch (e) { Logger.warn('WazeToastr.Alerts.error failed:', e); }
            }
          }).catch(function (error) {
            Logger.warn('User cancelled school zone drawing or error occurred:', error);
          });
        } else {
          // All other hazards: click the WME button
          const iconName = {
            'toll-booth': 'toll-booth',
            'level-crossing': 'railway-crossing',
            'sharp-curves': 'sharp-curve-ahead',
            'complex-junctions': 'dangerous-intersection',
            'multiple-lanes-merging': 'merge-ahead',
            'raised-crosswalk': 'raised-crosswalk',
            'highway-crosswalk': 'highway-crosswalk',
            'narrow-bridge': 'narrow-bridge',
            'both-lanes-ending': 'both-lanes-ending',
            'both-shoulders-ending': 'both-shoulders-ending',
          }[hazardKey];
          try {
            WazeToastr.Alerts.info('POI Shortcut', 'Hazard Type: <b>' + _getHazardLocalizedName(hazardKey) + '</b>', false, false, 2000);
          } catch (e) { Logger.warn('WazeToastr.Alerts.info failed:', e); }
          $("wz-icon[name='" + iconName + "']").parent().trigger('click');
        }
      });
    };
  }

  /**
   * Dynamic re-registration — updates a POI shortcut's description when the user
   * changes the category in the sidebar dropdown.
   * Re-registers ALL shortcuts in order so they maintain their position in
   * WME Settings → Keyboard Shortcuts (otherwise the updated one would jump to the bottom).
   */
  function _refreshPOIShortcut(itemNum, wmeSDK) {
    const shortcutId = 'WMEPOI_poi' + itemNum;
    const catName = $('#poiItem' + itemNum + ' option:selected').text();
    const description = catName && catName !== String(itemNum)
      ? 'Create ' + catName
      : 'POI Shortcut ' + itemNum;

    // Update in-memory shortcut definition
    for (let j = 0; j < _shortcutDefs.length; j++) {
      if (_shortcutDefs[j].id === shortcutId) {
        _shortcutDefs[j].description = description;
        break;
      }
    }

    // Re-register all shortcuts in order so the updated one keeps its position
    _reregisterAllShortcuts(wmeSDK);
  }

  // Session-level set of settingsKeys whose conflict has already been surfaced
  // this session — the toast fires once per conflict, not on every re-register
  // (the sidebar build calls re-register once per POI item, and every dropdown
  // change calls it again).
  const _warnedConflictKeys = new Set();
  let _reregisterTimer = null;

  /**
   * Full re-registration of all shortcuts in definition order.
   * Source of truth is SAVED SETTINGS (localStorage) — never the SDK-reported
   * state. getAllShortcuts() can report stale keys (WME SDK originalShortcut
   * bug), and trusting it here pulled phantom conflicts into registration
   * (e.g. Complex Junctions showing key "0" it was never assigned). This
   * mirrors EZRoad Mod's initializeSDKShortcuts(): delete all, then recreate in
   * definition order from saved settings so a description change keeps the
   * script's position in WME Settings → Keyboard Shortcuts.
   * Non-destructive: keys that cannot be assigned (already in use elsewhere, or
   * duplicated among our own saved keys) are PRESERVED in settings, added to
   * _conflictBlockedKeys (so the poll never nulls them), and registered keyless
   * with a warning.
   *
   * Coalesces rapid successive calls (sidebar build + dropdown changes) into a
   * single re-registration so the conflict toast doesn't fire repeatedly.
   */
  function _reregisterAllShortcuts(wmeSDK) {
    if (_reregisterTimer) clearTimeout(_reregisterTimer);
    _reregisterTimer = setTimeout(function () {
      _reregisterTimer = null;
      _doReregisterAllShortcuts(wmeSDK);
    }, 0);
  }

  function _doReregisterAllShortcuts(wmeSDK) {
    // Read SDK-reported keys for SELF-HEAL decisions only — never as the source
    // of what to register. A saved combo that duplicates an earlier def AND that
    // the SDK reports as keyless is phantom pollution (the old poll wrote WME's
    // stale report into localStorage); clear it silently instead of blocking a
    // shortcut the user never actually assigned.
    const sdkComboById = {};
    try {
      const sdkShortcuts = wmeSDK.Shortcuts.getAllShortcuts();
      for (let si = 0; si < sdkShortcuts.length; si++) {
        sdkComboById[sdkShortcuts[si].shortcutId] = _normalizeShortcut(sdkShortcuts[si].shortcutKeys).combo || null;
      }
    } catch (e) { /* ignore */ }

    // Delete all existing registrations
    for (let idx = 0; idx < _shortcutDefs.length; idx++) {
      if (wmeSDK.Shortcuts.isShortcutRegistered({ shortcutId: _shortcutDefs[idx].id })) {
        wmeSDK.Shortcuts.deleteShortcut({ shortcutId: _shortcutDefs[idx].id });
      }
    }

    // Normalize all saved settings — source of truth is localStorage, mirroring
    // EZRoad Mod's initializeSDKShortcuts().
    for (let idx = 0; idx < _shortcutDefs.length; idx++) {
      settings[_shortcutDefs[idx].settingsKey] = _normalizeShortcut(settings[_shortcutDefs[idx].settingsKey]);
    }

    const conflictMsgs = [];

    // Pre-detect duplicate combos among our own saved shortcuts (same as EZRoad):
    // keep the earlier definition's key. A later duplicate that the SDK reports
    // as keyless is phantom pollution — clear it silently. A later duplicate the
    // SDK actually holds is a real conflict — preserve, keyless-register, warn.
    const taken = {};
    for (let idx = 0; idx < _shortcutDefs.length; idx++) {
      const def = _shortcutDefs[idx];
      const combo = settings[def.settingsKey] && settings[def.settingsKey].combo;
      if (!combo) continue;
      if (taken[combo] === undefined) {
        taken[combo] = def.settingsKey;
        continue;
      }
      if (!sdkComboById[def.id]) {
        // Phantom duplicate: WME holds no key on this shortcut. Clear the
        // polluted saved value so it stops blocking the shortcut.
        settings[def.settingsKey] = { raw: null, combo: null };
        Logger.info('Cleared phantom duplicate key "' + combo + '" on ' + def.settingsKey + ' (SDK reports no key assigned).');
        continue;
      }
      _conflictBlockedKeys.add(def.settingsKey);
      if (!_warnedConflictKeys.has(def.settingsKey)) {
        _warnedConflictKeys.add(def.settingsKey);
        conflictMsgs.push(def.description + ' (' + combo + ')');
      }
    }

    // Register all in definition order — from saved settings only
    for (let idx = 0; idx < _shortcutDefs.length; idx++) {
      const def = _shortcutDefs[idx];
      const savedCombo = settings[def.settingsKey] && settings[def.settingsKey].combo;
      // Blocked keys are registered keyless (saved value preserved, never nulled)
      const keysToRegister = _conflictBlockedKeys.has(def.settingsKey) ? null : (savedCombo ? savedCombo : null);
      try {
        wmeSDK.Shortcuts.createShortcut({
          shortcutId: def.id,
          description: def.description,
          callback: def.callback,
          shortcutKeys: keysToRegister,
        });
      } catch (error) {
        if (String(error).indexOf('already in use') !== -1) {
          // Key taken by WME or another script — preserve the saved value,
          // register keyless, and block so the poll doesn't clobber it back.
          if (!_conflictBlockedKeys.has(def.settingsKey)) {
            _conflictBlockedKeys.add(def.settingsKey);
            if (!_warnedConflictKeys.has(def.settingsKey)) {
              _warnedConflictKeys.add(def.settingsKey);
              conflictMsgs.push(def.description + ' (' + (savedCombo ? savedCombo : 'key in use') + ')');
            }
          }
          try {
            wmeSDK.Shortcuts.createShortcut({
              shortcutId: def.id,
              description: def.description,
              callback: def.callback,
              shortcutKeys: null,
            });
          } catch (error2) {
            Logger.error('Unable to create shortcut: ' + def.id + '. ' + error2);
          }
        } else {
          Logger.error('Unable to create shortcut: ' + def.id + '. ' + error);
        }
      }
    }

    if (conflictMsgs.length > 0) {
      try {
        WazeToastr?.Alerts?.warning?.('POI Shortcut', 'Shortcut conflict: ' + conflictMsgs.join(', ') + ' could not be assigned a key. Resolve it in WME Settings → Keyboard Shortcuts.', false, false, 8000);
      } catch (e) {
        Logger.warn('WazeToastr.Alerts.warning failed:', e);
      }
      Logger.warn('Shortcut conflicts preserved (key not assigned): ' + conflictMsgs.join(', '));
    }
  }

  // Session-level set of settingsKeys whose saved key was preserved but could not
  // be assigned (legacy duplicate or external conflict). The poll skips these so
  // it never clobbers the preserved value back to null. Removed when the user
  // reassigns the shortcut in WME Settings → Keyboard Shortcuts.
  const _conflictBlockedKeys = new Set();
  // Session-level map: settingsKey → stale combo that getAllShortcuts() still
  // reports after WME moved that key away (WME SDK bug — originalShortcut is not
  // cleared on conflict resolution). The poll ignores these until the user
  // actually changes them (a different combo), so the stale value is never
  // written back to localStorage.
  const _conflictStaleKeys = new Map();
  let _shortcutPersistTimer = null;

  /**
   * Shortcut definitions — data-driven array (unified pattern)
   * All keys start as null — users assign in WME Settings → Keyboard Shortcuts
   */
  let _shortcutDefs = [
    // 10 POI creation shortcuts
    { id: 'WMEPOI_poi1', description: 'POI Shortcut 1', settingsKey: 'POI1Shortcut', callback: function () { createPOIFromShortcut(1, wmeSDK); } },
    { id: 'WMEPOI_poi2', description: 'POI Shortcut 2', settingsKey: 'POI2Shortcut', callback: function () { createPOIFromShortcut(2, wmeSDK); } },
    { id: 'WMEPOI_poi3', description: 'POI Shortcut 3', settingsKey: 'POI3Shortcut', callback: function () { createPOIFromShortcut(3, wmeSDK); } },
    { id: 'WMEPOI_poi4', description: 'POI Shortcut 4', settingsKey: 'POI4Shortcut', callback: function () { createPOIFromShortcut(4, wmeSDK); } },
    { id: 'WMEPOI_poi5', description: 'POI Shortcut 5', settingsKey: 'POI5Shortcut', callback: function () { createPOIFromShortcut(5, wmeSDK); } },
    { id: 'WMEPOI_poi6', description: 'POI Shortcut 6', settingsKey: 'POI6Shortcut', callback: function () { createPOIFromShortcut(6, wmeSDK); } },
    { id: 'WMEPOI_poi7', description: 'POI Shortcut 7', settingsKey: 'POI7Shortcut', callback: function () { createPOIFromShortcut(7, wmeSDK); } },
    { id: 'WMEPOI_poi8', description: 'POI Shortcut 8', settingsKey: 'POI8Shortcut', callback: function () { createPOIFromShortcut(8, wmeSDK); } },
    { id: 'WMEPOI_poi9', description: 'POI Shortcut 9', settingsKey: 'POI9Shortcut', callback: function () { createPOIFromShortcut(9, wmeSDK); } },
    { id: 'WMEPOI_poi10', description: 'POI Shortcut 10', settingsKey: 'POI10Shortcut', callback: function () { createPOIFromShortcut(10, wmeSDK); } },
    // Hazard shortcuts
    { id: 'WMEPOI_toll-booth', description: 'Add Toll Booth', settingsKey: 'TollBoothShortcut', callback: _buildHazardCallback('toll-booth') },
    { id: 'WMEPOI_level-crossing', description: 'Add Level Crossing', settingsKey: 'LevelCrossingShortcut', callback: _buildHazardCallback('level-crossing') },
    { id: 'WMEPOI_school-zone', description: 'Create School Zone', settingsKey: 'SchoolZoneShortcut', callback: _buildHazardCallback('school-zone') },
    { id: 'WMEPOI_school-zone-line', description: 'Create School Zone using Drawline', settingsKey: 'SchoolZoneLineShortcut', callback: _buildHazardCallback('school-zone', 'line') },
    { id: 'WMEPOI_sharp-curves', description: 'Create Sharp Curves', settingsKey: 'SharpCurvesShortcut', callback: _buildHazardCallback('sharp-curves') },
    { id: 'WMEPOI_complex-junctions', description: 'Create Complex Junctions', settingsKey: 'ComplexJunctionsShortcut', callback: _buildHazardCallback('complex-junctions') },
    { id: 'WMEPOI_multiple-lanes-merging', description: 'Create Multiple Lanes Merging', settingsKey: 'MultipleLanesMergingShortcut', callback: _buildHazardCallback('multiple-lanes-merging') },
    { id: 'WMEPOI_raised-crosswalk', description: 'Create Raised Pedestrian Crossing', settingsKey: 'RaisedCrosswalkShortcut', callback: _buildHazardCallback('raised-crosswalk') },
    { id: 'WMEPOI_highway-crosswalk', description: 'Create Pedestrian Crossing', settingsKey: 'PedestrianCrossingShortcut', callback: _buildHazardCallback('highway-crosswalk') },
    { id: 'WMEPOI_narrow-bridge', description: 'Create Narrow Bridge', settingsKey: 'NarrowBridgeShortcut', callback: _buildHazardCallback('narrow-bridge') },
    { id: 'WMEPOI_both-lanes-ending', description: 'Create Lane End (abrupt)', settingsKey: 'LaneEndingShortcut', callback: _buildHazardCallback('both-lanes-ending') },
    { id: 'WMEPOI_both-shoulders-ending', description: 'Create Shoulder End (abrupt)', settingsKey: 'ShoulderEndingShortcut', callback: _buildHazardCallback('both-shoulders-ending') },
    // Utility shortcuts
    { id: 'WMEPOI_convert-other-to-residential', description: 'Convert OTHER to Residential (Copy Name to House Number)', settingsKey: 'ConvertOtherShortcut', callback: function () { convertOtherToResidential(wmeSDK); } },
  ];

  function setupShortcuts(wmeSDK) {
    // Apply localized names for hazard shortcuts from the WME layer switcher DOM
    // This runs after WME is ready, so the DOM labels are available in the editor's language
    for (const hk in _hazardLayerMap) {
      if (_hazardLayerMap.hasOwnProperty(hk)) {
        const localizedName = _getHazardLocalizedName(hk);
        for (let di = 0; di < _shortcutDefs.length; di++) {
          if (_shortcutDefs[di].id === 'WMEPOI_' + hk) {
            _shortcutDefs[di].description = localizedName.indexOf(' ') !== -1
              ? (localizedName.toLowerCase().indexOf('create') !== -1 || localizedName.toLowerCase().indexOf('add') !== -1
                ? localizedName
                : 'Add ' + localizedName)
              : 'Add ' + localizedName;
            break;
          }
        }
      }
    }

    // Normalize all saved settings before registration
    for (let di = 0; di < _shortcutDefs.length; di++) {
      settings[_shortcutDefs[di].settingsKey] = _normalizeShortcut(settings[_shortcutDefs[di].settingsKey]);
    }

    // Register all shortcuts in definition order
    _reregisterAllShortcuts(wmeSDK);

    Logger.info('Shortcuts initialized - assign keys in Settings > Keyboard Shortcuts');

    // Persistence: auto-save on interval + beforeunload
    if (!_shortcutPersistTimer) {
      _shortcutPersistTimer = setInterval(checkShortcutsChanged, 5000);
    }
    
  window.addEventListener('beforeunload', function () {
    disconnectAliasObserver();
    $(document).off('focusout.wme-poi-shortcuts');
    $(document).off('click.wme-poi-shortcuts-alias');
    checkShortcutsChanged();
  });
  }

  /**
   * Converts OTHER type venues to residential places by copying the primary name
   * to the venue address house number and triggering the conversion button.
   *
   * @param {Object} wmeSDK - The WME SDK instance
   */
  function convertOtherToResidential(wmeSDK) {
    try {
      const venue = getSelectedVenue(wmeSDK);
      if (!venue) return;

      if (!isValidOtherVenue(venue)) return;

      if (!hasValidPrimaryName(venue)) return;

      checkAndUpdateVenueAddress(wmeSDK, venue);
    } catch (error) {
      Logger.error('Error in convertOtherToResidential:', error);
      try {
        WazeToastr.Alerts.error('POI Shortcut', 'An unexpected error occurred during conversion.', false, false, 3000);
      } catch (e) {
        Logger.warn('WazeToastr.Alerts.error failed:', e);
      }
    }
  }

  /**
   * Gets the currently selected venue from WME
   *
   * @param {Object} wmeSDK - The WME SDK instance
   * @returns {Object|null} - The selected venue or null if invalid selection
   */
  function getSelectedVenue(wmeSDK) {
    const selection = wmeSDK.Editing.getSelection();

    if (!selection || selection.objectType !== 'venue' || !selection.ids || selection.ids.length !== 1) {
      try {
        WazeToastr.Alerts.warning('POI Shortcut', 'Please select a venue first.', false, false, 3000);
      } catch (e) {
        Logger.warn('WazeToastr.Alerts.warning failed:', e);
      }
      return null;
    }

    const venueId = selection.ids[0];
    const venue = wmeSDK.DataModel.Venues.getById({ venueId });

    if (!venue) {
      try {
        WazeToastr.Alerts.error('POI Shortcut', 'Venue not found.', false, false, 3000);
      } catch (e) {
        Logger.warn('WazeToastr.Alerts.error failed:', e);
      }
      return null;
    }

    return venue;
  }

  /**
   * Validates if the venue is of type OTHER
   *
   * @param {Object} venue - The venue object
   * @returns {boolean} - True if venue is valid OTHER type
   */
  function isValidOtherVenue(venue) {
    const otherCategories = ['OTHER', 'other'];
    const venueCategories = venue.categories || [];
    const isOther = venueCategories.some((cat) => otherCategories.includes(cat));

    Logger.info('Venue categories:', venueCategories);

    if (!isOther) {
      try {
        WazeToastr.Alerts.warning('POI Shortcut', `This function only works with venues of type OTHER. Actual: ${venueCategories.join(', ')}`, false, false, 3000);
      } catch (e) {
        Logger.warn('WazeToastr.Alerts.warning failed:', e);
      }
      return false;
    }

    return true;
  }

  /**
   * Validates if the venue has a valid primary name
   *
   * @param {Object} venue - The venue object
   * @returns {boolean} - True if venue has valid primary name
   */
  function hasValidPrimaryName(venue) {
    if (!venue.name || !venue.name.trim()) {
      try {
        WazeToastr.Alerts.warning('POI Shortcut', 'Primary name is empty and cannot be used as house number.', false, false, 3000);
      } catch (e) {
        Logger.warn('WazeToastr.Alerts.warning failed:', e);
      }
      return false;
    }

    return true;
  }

  /**
   * Checks venue address and updates it if needed
   *
   * @param {Object} wmeSDK - The WME SDK instance
   * @param {Object} venue - The venue object
   */
  function checkAndUpdateVenueAddress(wmeSDK, venue) {
    checkExistingHouseNumber(wmeSDK, venue)
      .then((hasHouseNumber) => {
        if (hasHouseNumber) {
          try {
            WazeToastr.Alerts.warning('POI Shortcut', 'Venue already has a house number in its address.', false, false, 3000);
          } catch (e) {
            Logger.warn('WazeToastr.Alerts.warning failed:', e);
          }
          return;
        }

        return updateVenueAddressHouseNumber(wmeSDK, venue);
      })
      .then(() => {
        triggerResidentialConversion(venue.name);
      })
      .catch((error) => {
        Logger.error('Error updating venue address:', error);
        try {
          WazeToastr.Alerts.error('POI Shortcut', 'Failed to update venue address.', false, false, 3000);
        } catch (e) {
          Logger.warn('WazeToastr.Alerts.error failed:', e);
        }
      });
  }

  /**
   * Checks if venue already has a house number in its address
   *
   * @param {Object} wmeSDK - The WME SDK instance
   * @param {Object} venue - The venue object
   * @returns {Promise<boolean>} - Promise resolving to true if house number exists
   */
  function checkExistingHouseNumber(wmeSDK, venue) {
    return new Promise((resolve, reject) => {
      try {
        const address = wmeSDK.DataModel.Venues.getAddress({ venueId: venue.id });
        const hasExistingHouseNumber = address && address.houseNumber && address.houseNumber.trim();
        resolve(!!hasExistingHouseNumber);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Updates venue address with the primary name as house number
   *
   * @param {Object} wmeSDK - The WME SDK instance
   * @param {Object} venue - The venue object
   * @returns {Promise<void>} - Promise that resolves when update is complete
   */
  function updateVenueAddressHouseNumber(wmeSDK, venue) {
    return new Promise((resolve, reject) => {
      try {
        wmeSDK.DataModel.Venues.updateAddress({
          venueId: venue.id,
          houseNumber: venue.name,
        });
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Triggers the residential conversion by clicking the convert button
   *
   * @param {string} venueName - The name of the venue being converted
   */
  function triggerResidentialConversion(venueName) {
    // Small delay to ensure UI updates after address change
    setTimeout(() => {
      const buttonClicked = clickConvertToResidentialButton();

      if (buttonClicked) {
        try {
          WazeToastr.Alerts.info('POI Shortcut', `Successfully converted venue "${venueName}" to residential.`, false, false, 1000);
        } catch (e) {
          Logger.warn('WazeToastr.Alerts.info failed:', e);
        }
      } else {
        try {
          WazeToastr.Alerts.warning('POI Shortcut', `House number set to "${venueName}". Please manually click "Convert to residential" button.`, false, false, 3000);
        } catch (e) {
          Logger.warn('WazeToastr.Alerts.warning failed:', e);
        }
      }
    }, 500);
  }

  /**
   * Attempts to click the convert to residential button
   *
   * @returns {boolean} - True if button was found and clicked
   */
  function clickConvertToResidentialButton() {
    const selectors = ['wz-button.toggle-residential-button[color="secondary"][size="sm"]', 'wz-button.toggle-residential-button', '.toggle-residential-control wz-button'];

    for (const selector of selectors) {
      const button = document.querySelector(selector);

      if (button && button.getAttribute('disabled') !== 'true') {
        button.click();
        Logger.info(`Clicked convert to residential button using selector: ${selector}`);
        return true;
      }
    }

    Logger.warn('Convert to residential button not found or disabled');
    return false;
  }

  /**
   * Clicks the edit address button for residential venues when the setting is enabled
   *
   * @param {Object} wmeSDK - The WME SDK instance
   */
  function handleEditAddressForRPP(wmeSDK) {
    if (!openEditAddressOnRPP) {
      Logger.info('Open edit address for RPP is disabled');
      return;
    }
    try {
      const selection = wmeSDK.Editing.getSelection();
      if (!selection || selection.objectType !== 'venue' || !selection.ids || selection.ids.length !== 1) {
        Logger.info('No venue selected or invalid selection');
        return;
      }
      const venueId = selection.ids[0];
      const venue = wmeSDK.DataModel.Venues.getById({ venueId });
      if (!venue) {
        Logger.warn('Venue not found');
        return;
      }
      Logger.info('Venue categories:', venue.categories);
      const isResidential = venue.categories && venue.categories.includes('RESIDENTIAL');
      if (isResidential) {
        Logger.info('Residential venue detected, attempting to click edit address button');
        setTimeout(() => {
          // Only select the exact icon
          const editButton = document.querySelector('i.w-icon.w-icon-pencil-fill.edit-button[aria-disabled="false"]');
          if (editButton) {
            editButton.click();
            Logger.info('Clicked EXACT edit address icon for residential venue');

            // After clicking edit button, wait and then focus house number input inside shadow DOM
            setTimeout(() => {
              const wzTextInput = document.querySelector('wz-text-input[placeholder="Add house number"]');
              if (wzTextInput && wzTextInput.shadowRoot) {
                const input = wzTextInput.shadowRoot.querySelector('input');
                if (input) {
                  input.focus();
                  input.click();
                  if (input.value && input.value.length) {
                    input.setSelectionRange(input.value.length, input.value.length);
                  }
                  Logger.info('Focused and clicked on house number input inside shadow DOM');
                } else {
                  Logger.warn('Input inside shadow DOM not found');
                }
              } else {
                Logger.warn('wz-text-input element or its shadowRoot not found');
              }
            }, 500);
          } else {
            Logger.warn('EXACT edit address icon not found for residential venue');
          }
        }, 300);
      } else {
        Logger.info('Selected venue is not residential, skipping edit address action');
      }
    } catch (error) {
      Logger.error('Error in handleEditAddressForRPP:', error);
    }
  }

  // Function to create POI from shortcut slot
  function createPOIFromShortcut(slotNumber, wmeSDK) {
    try {
      // Get selected values from the UI for this item
      const cat = $(`#poiItem${slotNumber}`).val();
      const lock = parseInt($(`#poiLock${slotNumber}`).val(), 10);
      const geomType = $(`#poiGeom${slotNumber}`).val();

      if (!cat || cat === '') {
        Logger.warn(`POI Shortcut ${slotNumber}: No category selected`);
        return;
      }
      // Show WazeToastr alert with POI info before drawing
      const poiName = $(`#poiItem${slotNumber} option:selected`).text();
      const lockLevel = !isNaN(lock) ? parseInt(lock, 10) + 1 : 1;
      const areaType = geomType === 'point' ? 'Point' : 'Area';
      try {
        WazeToastr.Alerts.info('POI Shortcut', `Selected POI Name: <b>${poiName}</b><br>Lock Level: <b>${lockLevel}</b><br>Type: <b>${areaType}</b>`, false, false, 2500);
      } catch (e) {
        Logger.warn('WazeToastr.Alerts.info failed:', e);
      }

      // Geometry: area = drawPolygon, point = drawPoint
      let drawPromise = geomType === 'point' ? wmeSDK.Map.drawPoint() : wmeSDK.Map.drawPolygon();
      drawPromise
        .then((geometry) => {
          let newVenue = wmeSDK.DataModel.Venues.addVenue({
            category: cat,
            geometry: geometry,
          });

          // Add a small delay to ensure the venue is fully created before selecting it
          setTimeout(() => {
            wmeSDK.Editing.setSelection({
              selection: {
                ids: [newVenue.toString()],
                objectType: 'venue',
              },
            });
          }, 100);

          // Only set lock if lock > 0 (lockRank 1-4)
          if (!isNaN(lock) && lock > 0) {
            setTimeout(() => {
              wmeSDK.DataModel.Venues.updateVenue({
                venueId: newVenue.toString(),
                lockRank: lock,
              });
            }, 200);
          }
        })
        .catch((err) => {
          if (err && err.name === 'InvalidStateError') {
            Logger.info('POI drawing was cancelled by the user.');
          } else {
            Logger.error('Error during POI drawing:', err);
          }
        });
    } catch (error) {
      Logger.error(`Error creating POI from shortcut ${slotNumber}:`, error);
    }
  }

  // Helper function to ensure hazard layer group and specific hazard layer are enabled
  function ensureHazardLayersEnabled(hazardLayerId, callback) {
    try {
      // Wait a bit to ensure the layer UI is ready
      setTimeout(() => {
        // First, ensure the permanent hazards group is enabled
        const hazardGroupToggle = document.getElementById('layer-switcher-group_permanent_hazards');
        if (hazardGroupToggle) {
          // For wz-toggle-switch: checked="" means enabled, checked="false" means disabled
          const checkedAttr = hazardGroupToggle.getAttribute('checked');
          const isGroupEnabled = checkedAttr === '' || checkedAttr === 'true';

          if (!isGroupEnabled) {
            hazardGroupToggle.click();
            // Wait for the group to be enabled before enabling individual layers
            setTimeout(() => {
              enableSpecificHazardLayer(hazardLayerId, callback);
            }, 400);
            return;
          }
        } else {
          Logger.warn('Hazard group toggle not found');
        }

        // If group is already enabled, directly enable the specific layer
        enableSpecificHazardLayer(hazardLayerId, callback);
      }, UI_ELEMENT_WAIT_DELAY);
    } catch (error) {
      Logger.error('Error enabling hazard layers:', error);
      // Execute callback even if there's an error to prevent hanging
      if (callback && typeof callback === 'function') {
        setTimeout(callback, RETRY_INJECTION_DELAY);
      }
    }
  }

  // Helper function to enable a specific hazard layer
  function enableSpecificHazardLayer(hazardLayerId, callback) {
    try {
      if (hazardLayerId) {
        const hazardLayerCheckbox = document.getElementById(hazardLayerId);
        if (hazardLayerCheckbox) {
          // For wz-checkbox: checked="" means enabled, checked="false" means disabled
          const checkedAttr = hazardLayerCheckbox.getAttribute('checked');
          const isLayerEnabled = checkedAttr === '' || checkedAttr === 'true';

          if (!isLayerEnabled) {
            hazardLayerCheckbox.click();
            // Wait for layer to be enabled before executing callback
            setTimeout(() => {
              if (callback && typeof callback === 'function') {
                callback();
              }
            }, 300);
          } else {
            // Layer is already enabled, execute callback immediately
            if (callback && typeof callback === 'function') {
              callback();
            }
          }
        } else {
          Logger.warn(`Hazard layer element not found: ${hazardLayerId}`);
          // Execute callback even if element not found to prevent hanging
          if (callback && typeof callback === 'function') {
            setTimeout(callback, 100);
          }
        }
      } else {
        // No specific layer ID provided, execute callback
        if (callback && typeof callback === 'function') {
          callback();
        }
      }
    } catch (error) {
      Logger.error('Error enabling specific hazard layer:', error);
      // Execute callback even if there's an error to prevent hanging
      if (callback && typeof callback === 'function') {
        setTimeout(callback, RETRY_INJECTION_DELAY);
      }
    }
  }

  // ===================================================================
  // FORMAT CONVERTERS — PIE-style bidirectional system
  // ===================================================================

  const _KEYCODE_TO_CHAR = {
    65:'A',66:'B',67:'C',68:'D',69:'E',70:'F',71:'G',72:'H',73:'I',74:'J',75:'K',76:'L',
    77:'M',78:'N',79:'O',80:'P',81:'Q',82:'R',83:'S',84:'T',85:'U',86:'V',87:'W',88:'X',
    89:'Y',90:'Z',
    48:'0',49:'1',50:'2',51:'3',52:'4',53:'5',54:'6',55:'7',56:'8',57:'9',
    112:'F1',113:'F2',114:'F3',115:'F4',116:'F5',117:'F6',
    118:'F7',119:'F8',120:'F9',121:'F10',122:'F11',123:'F12',
    32:'Space',13:'Enter',9:'Tab',27:'Esc',8:'Backspace',46:'Delete',
    36:'Home',35:'End',33:'PageUp',34:'PageDown',45:'Insert',
    37:'←',38:'↑',39:'→',40:'↓',
    188:',',190:'.',191:'/',186:';',222:"'",219:'[',221:']',220:'\\',189:'-',187:'=',192:'',
  };

  const _CHAR_TO_KEYCODE = Object.fromEntries(
    Object.entries(_KEYCODE_TO_CHAR).map(function (entry) { return [entry[1].toUpperCase(), Number(entry[0])]; })
  );

  const _MOD_CHAR_TO_VAL = { C: 1, S: 2, A: 4 };

  function _comboToRaw(str) {
    if (!str || str === '' || str === '-1' || str === 'None') return null;
    if (/^\d+,-?\d+$/.test(str)) {
      var keyCode = parseInt(str.split(',')[1], 10);
      return keyCode < 0 ? null : str;
    }
    // Handle bare numeric key code (legacy format stores just the key code number,
    // e.g. "49" for the '1' key). Only 2+ digit bare numbers are keycodes — the
    // SDK reports single-digit shortcut keys as the CHARACTER (e.g. "8" means the
    // '8' key = keycode 56, NOT Backspace = keycode 8). Treating single digits as
    // keycodes made digit shortcuts flip to Backspace/Tab and caused endless
    // save/rewrite churn. Legacy migration pre-converts bare keycodes to
    // "mod,key" before this is reached, so a single digit here is always a char.
    if (/^\d{2,}$/.test(str)) {
      return '0,' + str;
    }
    var upperStr = String(str).toUpperCase();
    if (/^[A-Z0-9]$/.test(upperStr)) return '0,' + _CHAR_TO_KEYCODE[upperStr];
    if (_CHAR_TO_KEYCODE[upperStr] !== undefined) return '0,' + _CHAR_TO_KEYCODE[upperStr];

    var letterMatch = upperStr.match(/^([ACS]+)\+([A-Z0-9])$/);
    if (letterMatch) {
      var modValue = letterMatch[1].split('').reduce(function (acc, char) { return acc | (_MOD_CHAR_TO_VAL[char] || 0); }, 0);
      return modValue + ',' + letterMatch[2].charCodeAt(0);
    }
    var numericMatch = upperStr.match(/^([ACS]+)\+(\d+)$/);
    if (numericMatch) {
      var modValue = numericMatch[1].split('').reduce(function (acc, char) { return acc | (_MOD_CHAR_TO_VAL[char] || 0); }, 0);
      return modValue + ',' + numericMatch[2];
    }
    var specialMatch = upperStr.match(/^([ACS]+)\+(.+)$/);
    if (specialMatch && _CHAR_TO_KEYCODE[specialMatch[2]] !== undefined) {
      var modValue = specialMatch[1].split('').reduce(function (acc, char) { return acc | (_MOD_CHAR_TO_VAL[char] || 0); }, 0);
      return modValue + ',' + _CHAR_TO_KEYCODE[specialMatch[2]];
    }
    return null;
  }

  function _rawToCombo(str) {
    var raw = _comboToRaw(str);
    if (!raw) return null;
    var parts = raw.split(',');
    var modValue = parseInt(parts[0], 10);
    var keyCode = parseInt(parts[1], 10);
    var keyChar = _KEYCODE_TO_CHAR[keyCode] || String(keyCode);
    var modifiers = '';
    if (modValue & 1) modifiers += 'C';
    if (modValue & 2) modifiers += 'S';
    if (modValue & 4) modifiers += 'A';
    return modifiers ? modifiers + '+' + keyChar : keyChar;
  }

  function _normalizeShortcut(value) {
    const src = value && typeof value === 'object' ? (value.raw !== undefined ? value.raw : value.combo) : value;
    const raw = _comboToRaw(src);
    const combo = _rawToCombo(raw);
    return { raw: raw, combo: combo };
  }

  // ===================================================================
  // SETTINGS PERSISTENCE
  // ===================================================================

  const SHORTCUTS_STORAGE_KEY = 'WMEPOIShortcuts_Settings';

  const shortcutDefaultSettings = {
    POI1Shortcut: null, POI2Shortcut: null, POI3Shortcut: null, POI4Shortcut: null, POI5Shortcut: null,
    POI6Shortcut: null, POI7Shortcut: null, POI8Shortcut: null, POI9Shortcut: null, POI10Shortcut: null,
    TollBoothShortcut: null, LevelCrossingShortcut: null, SchoolZoneShortcut: null, SchoolZoneLineShortcut: null,
    SharpCurvesShortcut: null, ComplexJunctionsShortcut: null, MultipleLanesMergingShortcut: null,
    RaisedCrosswalkShortcut: null, PedestrianCrossingShortcut: null, NarrowBridgeShortcut: null,
    LaneEndingShortcut: null, ShoulderEndingShortcut: null, ConvertOtherShortcut: null,
  };

  function loadShortcutSettings(firstCall) {
    try {
      const saved = JSON.parse(localStorage.getItem(SHORTCUTS_STORAGE_KEY));
      for (const key in shortcutDefaultSettings) {
        if (shortcutDefaultSettings.hasOwnProperty(key)) {
          settings[key] = (saved && saved[key] !== undefined) ? saved[key] : shortcutDefaultSettings[key];
        }
      }
    } catch (error) {
      for (const key in shortcutDefaultSettings) {
        if (shortcutDefaultSettings.hasOwnProperty(key)) {
          settings[key] = shortcutDefaultSettings[key];
        }
      }
    }

    // Legacy migration (first call only — runs once per page load)
    if (firstCall) {
      _migrateLegacyShortcutKeys();
    }

    // Normalize all shortcut values to {raw, combo}
    _normalizeAllShortcutValues();
  }

  function saveShortcutSettings() {
    const toSave = {};
    for (const key in shortcutDefaultSettings) {
      if (shortcutDefaultSettings.hasOwnProperty(key)) {
        toSave[key] = settings[key];
      }
    }
    localStorage.setItem(SHORTCUTS_STORAGE_KEY, JSON.stringify(toSave));
  }

  function _normalizeAllShortcutValues() {
    for (const key in shortcutDefaultSettings) {
      if (shortcutDefaultSettings.hasOwnProperty(key)) {
        settings[key] = _normalizeShortcut(settings[key]);
      }
    }
  }

  // ===================================================================
  // LEGACY KEY MIGRATION — reads old localStorage['WME-POI-ShortcutsKBS']
  // ===================================================================

  function _migrateLegacyShortcutKeys() {
    var oldKey = 'WME-POI-ShortcutsKBS';
    var raw;
    try {
      raw = JSON.parse(localStorage.getItem(oldKey));
      if (!raw || typeof raw !== 'object') return false;
    } catch (e) {
      return false;
    }

    // Map old shortcut IDs to new settings keys
    var legacyMap = {
      'WME-POI-Shortcuts_poi1': 'POI1Shortcut',
      'WME-POI-Shortcuts_poi2': 'POI2Shortcut',
      'WME-POI-Shortcuts_poi3': 'POI3Shortcut',
      'WME-POI-Shortcuts_poi4': 'POI4Shortcut',
      'WME-POI-Shortcuts_poi5': 'POI5Shortcut',
      'WME-POI-Shortcuts_poi6': 'POI6Shortcut',
      'WME-POI-Shortcuts_poi7': 'POI7Shortcut',
      'WME-POI-Shortcuts_poi8': 'POI8Shortcut',
      'WME-POI-Shortcuts_poi9': 'POI9Shortcut',
      'WME-POI-Shortcuts_poi10': 'POI10Shortcut',
      'WME-POI-Shortcuts_toll-booth': 'TollBoothShortcut',
      'WME-POI-Shortcuts_level-crossing': 'LevelCrossingShortcut',
      'WME-POI-Shortcuts_school-zone': 'SchoolZoneShortcut',
      'WME-POI-Shortcuts_school-zone-line': 'SchoolZoneLineShortcut',
      'WME-POI-Shortcuts_sharp-curves': 'SharpCurvesShortcut',
      'WME-POI-Shortcuts_complex-junctions': 'ComplexJunctionsShortcut',
      'WME-POI-Shortcuts_multiple-lanes-merging': 'MultipleLanesMergingShortcut',
      'WME-POI-Shortcuts_raised-crosswalk': 'RaisedCrosswalkShortcut',
      'WME-POI-Shortcuts_highway-crosswalk': 'PedestrianCrossingShortcut',
      'WME-POI-Shortcuts_narrow-bridge': 'NarrowBridgeShortcut',
      'WME-POI-Shortcuts_both-lanes-ending': 'LaneEndingShortcut',
      'WME-POI-Shortcuts_both-shoulders-ending': 'ShoulderEndingShortcut',
      'WME-POI-Shortcuts_convert-other-to-residential': 'ConvertOtherShortcut',
    };

    var migrated = false;

    // Old format is an array of { "keyString": "handlerId" } objects
    for (var i = 0; i < raw.length; i++) {
      var entry = raw[i];
      for (var keyStr in entry) {
        if (entry.hasOwnProperty(keyStr)) {
          var handlerId = entry[keyStr];
          var currentKey = legacyMap[handlerId];
          if (!currentKey) continue;

          // Skip if current setting already has a non-null value
          if (settings[currentKey] && settings[currentKey].combo !== null) continue;

          // Old W.accelerators format has "+" separator already (e.g. "C+82" for Ctrl+R,
          // "CS+49" for Ctrl+Shift+1). But bare keycodes like "49" (just the "1" key)
          // have no "+" prefix and fail to parse. Convert bare keycodes to raw "0,49".
          var convertKey = keyStr;
          if (convertKey !== '-1' && convertKey !== 'None' && convertKey !== '') {
            // Check for bare numeric keycode (no modifier letters, no "+")
            if (/^\d+$/.test(convertKey) && convertKey.indexOf(',') === -1) {
              // "49" → "0,49" (raw format, no modifiers)
              convertKey = '0,' + convertKey;
            }
          }
          var normalized = _normalizeShortcut(convertKey);
          if (normalized && normalized.combo !== null) {
            settings[currentKey] = normalized;
            migrated = true;
            Logger.info('Migrated legacy key "' + keyStr + '" → ' + currentKey + ': ' + normalized.combo);
          }
        }
      }
    }

    if (migrated) {
      saveShortcutSettings();
      // Remove the legacy key so migration runs exactly once — mirroring EZRoad
      // Mod. Re-running it every page load can re-apply stale legacy values on
      // top of the user's current WME assignments.
      localStorage.removeItem(oldKey);
      Logger.info('Legacy shortcut keys migrated successfully');
    }
    return migrated;
  }

  // ===================================================================
  // PERSISTENCE — auto-save when user changes shortcuts in WME UI
  // ===================================================================
  //
  // WME SDK BUG WORKAROUND: when a key is moved, WME clears the old holder's
  // live shortcut but getAllShortcuts() still reports its stale originalShortcut
  // (originalShortcut is NOT cleared during conflict resolution). This makes two
  // of our shortcuts report the same combo. We detect that duplicate and treat
  // the member that did NOT change (saved value == SDK value) as the stale one:
  // clear it and remember it in _conflictStaleKeys so the poll ignores the
  // stale value on later runs instead of writing it back.

  function checkShortcutsChanged() {
    if (!wmeSDK || !wmeSDK.Shortcuts || !_shortcutDefs) return;
    var shortcuts;
    try {
      shortcuts = wmeSDK.Shortcuts.getAllShortcuts();
    } catch (e) {
      return;
    }
    if (!shortcuts) return;

    // Pass 1: our shortcuts' SDK-reported state + combo index (for stale dupes)
    var sdkState = {};  // settingsKey -> { combo, shortcutKeys }
    var comboKeys = {}; // combo -> [settingsKey]
    for (var i = 0; i < shortcuts.length; i++) {
      var shortcut = shortcuts[i];
      var matchingDef = null;
      for (var j = 0; j < _shortcutDefs.length; j++) {
        if (_shortcutDefs[j].id === shortcut.shortcutId) {
          matchingDef = _shortcutDefs[j];
          break;
        }
      }
      if (!matchingDef) continue;
      var normalized = _normalizeShortcut(shortcut.shortcutKeys);
      var settingsKey = matchingDef.settingsKey;
      sdkState[settingsKey] = { combo: normalized.combo, shortcutKeys: shortcut.shortcutKeys };
      if (normalized.combo) {
        (comboKeys[normalized.combo] = comboKeys[normalized.combo] || []).push(settingsKey);
      }
    }

    // Pass 2: detect which of our shortcuts changed (updated or cleared)
    var changedKeys = [];
    for (var settingsKey in sdkState) {
      var savedCombo = (settings[settingsKey] && settings[settingsKey].combo) || null;
      var sdkCombo = sdkState[settingsKey].combo || null;

      // Stale keys (WME SDK bug): we cleared them, but the SDK still reports the
      // old combo. Ignore until the user actually changes them (different combo).
      if (_conflictStaleKeys.has(settingsKey)) {
        if (sdkCombo === _conflictStaleKeys.get(settingsKey)) continue;
        _conflictStaleKeys.delete(settingsKey); // user changed it — re-evaluate
      }

      // Blocked keys: skip unless the user reassigned them (SDK value non-null)
      if (_conflictBlockedKeys.has(settingsKey)) {
        if (sdkCombo === null) continue; // still blocked — preserve saved value
        _conflictBlockedKeys.delete(settingsKey); // user reassigned — unblock
      }

      if (savedCombo !== sdkCombo) {
        changedKeys.push(settingsKey);
      }
    }

    // Pass 3: resolve stale duplicates (WME SDK bug). If exactly one member of a
    // duplicated combo changed, it is the real holder; the other members are the
    // stale displaced shortcuts — the UI already cleared them, so clear + suppress.
    var changed = false;
    for (var combo in comboKeys) {
      var keys = comboKeys[combo];
      if (keys.length < 2) continue;
      var changedMembers = [];
      for (var k = 0; k < keys.length; k++) {
        if (changedKeys.indexOf(keys[k]) !== -1) changedMembers.push(keys[k]);
      }
      if (changedMembers.length !== 1) continue; // no clear stale signature — leave for init
      var newHolder = changedMembers[0];
      for (var k2 = 0; k2 < keys.length; k2++) {
        var staleKey = keys[k2];
        if (staleKey === newHolder) continue;
        if (_conflictBlockedKeys.has(staleKey)) continue;
        if (_conflictStaleKeys.has(staleKey)) continue; // already handled
        settings[staleKey] = { raw: null, combo: null };
        _conflictStaleKeys.set(staleKey, combo);
        changed = true;
        Logger.info('SDK bug workaround: cleared stale key for ' + staleKey + ' (getAllShortcuts() still reports "' + combo + '")');
      }
    }

    if (!changed && changedKeys.length === 0) return;

    // Debug: dump exactly what getAllShortcuts() returned (the native UI state),
    // including stale keys, so we can see what is (and isn't) saved.
    var sdkDump = [];
    for (var z = 0; z < shortcuts.length; z++) {
      var sz = shortcuts[z];
      var defZ = null;
      for (var y = 0; y < _shortcutDefs.length; y++) {
        if (_shortcutDefs[y].id === sz.shortcutId) {
          defZ = _shortcutDefs[y];
        break;
      }
    }
      if (!defZ) continue;
      sdkDump.push(defZ.settingsKey + '="' + sz.shortcutKeys + '"');
    }
    Logger.info('getAllShortcuts() (native UI state): ' + sdkDump.join(', '));

    // Pass 4: sync the genuinely-changed keys (stale keys are already cleared)
    for (var a = 0; a < shortcuts.length; a++) {
      var sc = shortcuts[a];
      var defA = null;
      for (var b = 0; b < _shortcutDefs.length; b++) {
        if (_shortcutDefs[b].id === sc.shortcutId) {
          defA = _shortcutDefs[b];
            break;
          }
        }
      if (!defA) continue;
      if (changedKeys.indexOf(defA.settingsKey) === -1) continue;
      if (_conflictStaleKeys.has(defA.settingsKey)) continue; // already cleared
      settings[defA.settingsKey] = _normalizeShortcut(sc.shortcutKeys);
      Logger.info('SDK → localStorage: ' + defA.settingsKey + ' = "' + sc.shortcutKeys + '" → ' + JSON.stringify(settings[defA.settingsKey]));
        }

    // Pass 5: persist
      saveShortcutSettings();
    Logger.info('SDK shortcut changes saved.');
  }
  /******************************************legacy shortcuts until here above************************************ */

  function getGasStationCategoryKey() {
    // Category key is consistent across all locales
    // Localized display name is handled by SDK's getVenueSubCategories()
    return 'GAS_STATION';
  }

  function getChargingStationCategoryKey() {
    // Category key is consistent across all locales
    // Localized display name is handled by SDK's getVenueSubCategories()
    return 'CHARGING_STATION';
  }

  /**
   * Convert payment method ID to human-readable label
   * @param {string} paymentMethodId - The payment method ID (e.g., 'ONLINE_PAYMENT', 'APP')
   * @returns {string} - Human-readable label (e.g., 'Online payment', 'App')
   */
  function getPaymentMethodLabel(paymentMethodId) {
    switch (paymentMethodId) {
      case 'APP':
        return 'App';
      case 'CREDIT':
        return 'Credit card';
      case 'DEBIT':
        return 'Debit card';
      case 'MEMBERSHIP_CARD':
        return 'Membership card';
      case 'ONLINE_PAYMENT':
        return 'Online payment';
      case 'OTHER':
        return 'Other';
      case 'PLUG_IN_AUTO_CHARGE':
        return 'Plug-in autocharge';
      default:
        return paymentMethodId;
    }
  }

  /**
   * Set the cost type for a charging station
   * @param {string} costType - The cost type to select: 'FREE', 'FEE', or 'COST_TYPE_UNSPECIFIED'
   * @returns {Promise<boolean>} - Returns promise that resolves to true if selection was successful
   */
  function setChargingStationCostType(costType) {
    return new Promise((resolve) => {
      try {
        // Find the cost wz-select element
        const costSelect = document.querySelector('wz-select[label="Cost"]');
        if (!costSelect) {
          Logger.warn('[Cost Type] wz-select with label "Cost" not found');
          resolve(false);
          return;
        }

        // Wait for shadow root to be attached
        if (!costSelect.shadowRoot) {
          Logger.warn('[Cost Type] Shadow root not attached to wz-select');
          resolve(false);
          return;
        }

        // Find the select box to click and open the dropdown
        const selectBox = costSelect.shadowRoot.querySelector('.select-box');
        if (!selectBox) {
          Logger.warn('[Cost Type] Select box not found in shadow root');
          resolve(false);
          return;
        }

        // Find the wz-menu inside the shadow root
        const menu = costSelect.shadowRoot.querySelector('wz-menu');
        if (!menu) {
          Logger.warn('[Cost Type] wz-menu not found in shadow root');
          resolve(false);
          return;
        }

        Logger.info(`[Cost Type] Setting cost type to: ${costType}`);

        // Click the select box to open the dropdown
        selectBox.click();

        // Wait for menu to open and options to be available
        setTimeout(() => {
          // Find the wz-option elements (they are light DOM children of wz-select)
          const options = costSelect.querySelectorAll('wz-option');

          Logger.info(`[Cost Type] Found ${options.length} cost options`);

          let targetOption = null;
          for (const option of options) {
            const value = option.getAttribute('value');
            Logger.info(`[Cost Type] Checking option: "${value}"`);
            if (value === costType) {
              targetOption = option;
              Logger.info(`[Cost Type] Found matching option for: ${costType}`);
              break;
            }
          }

          if (!targetOption) {
            Logger.warn(`[Cost Type] Option not found for cost type: ${costType}`);
            resolve(false);
            return;
          }

          // Click the option to select it
          targetOption.click();
          Logger.info(`[Cost Type] Successfully set cost type to: ${costType}`);
          resolve(true);
        }, 100);
      } catch (error) {
        Logger.error('[Cost Type] Error setting cost type:', error);
        resolve(false);
      }
    });
  }

  /**
   * Set payment methods for a charging station
   * @param {Array<string>} paymentMethods - Array of payment method item-ids to select (e.g., ['APP', 'CREDIT', 'DEBIT', 'ONLINE_PAYMENT'])
   * @returns {Promise<boolean>} - Returns promise that resolves to true if all selections were successful
   */
  function setChargingStationPaymentMethods(paymentMethods) {
    return new Promise((resolve) => {
      try {
        if (!paymentMethods || !Array.isArray(paymentMethods) || paymentMethods.length === 0) {
          Logger.warn('[Payment Methods] No payment methods provided or invalid format');
          resolve(false);
          return;
        }

        // Find the payment method wz-autocomplete element
        const paymentAutocomplete = document.querySelector('#venue-edit-general wz-autocomplete[placeholder=""]');
        if (!paymentAutocomplete) {
          Logger.warn('[Payment Methods] Payment method wz-autocomplete not found');
          resolve(false);
          return;
        }

        // Wait for shadow root to be attached
        if (!paymentAutocomplete.shadowRoot) {
          Logger.warn('[Payment Methods] Shadow root not attached to wz-autocomplete');
          resolve(false);
          return;
        }

        // Find the wz-text-input inside the shadow root
        const wzTextInput = paymentAutocomplete.shadowRoot.querySelector('wz-text-input');
        if (!wzTextInput) {
          Logger.warn('[Payment Methods] wz-text-input not found in payment autocomplete shadow root');
          resolve(false);
          return;
        }

        // Find the input element inside wz-text-input shadow root
        if (!wzTextInput.shadowRoot) {
          Logger.warn('[Payment Methods] Shadow root not attached to wz-text-input');
          resolve(false);
          return;
        }

        const input = wzTextInput.shadowRoot.querySelector('input');
        if (!input) {
          Logger.warn('[Payment Methods] Input element not found in wz-text-input shadow root');
          resolve(false);
          return;
        }

        Logger.info(`[Payment Methods] Setting ${paymentMethods.length} payment methods: ${paymentMethods.join(', ')}`);

        // Function to remove all existing payment method chips
        const removeAllExistingPaymentMethods = () => {
          return new Promise((resolveRemove) => {
            try {
              // Find the multiselect card that contains the chips
              const multiselectCard = document.querySelector('#venue-edit-general wz-card.wz-multiselect-card .wz-multiselect-card-content');
              if (!multiselectCard) {
                Logger.info('[Payment Methods] No existing payment methods to remove');
                resolveRemove(true);
                return;
              }

              // Find all wz-image-chip elements
              const existingChips = multiselectCard.querySelectorAll('wz-image-chip[removable]');
              if (existingChips.length === 0) {
                Logger.info('[Payment Methods] No existing payment methods found');
                resolveRemove(true);
                return;
              }

              Logger.info(`[Payment Methods] Removing ${existingChips.length} existing payment methods`);

              // Click the remove icon in each chip's shadow root
              const removeChip = (chip, index) => {
                return new Promise((resolveChip) => {
                  if (!chip.shadowRoot) {
                    Logger.warn(`[Payment Methods] Shadow root not found for chip ${index}`);
                    resolveChip(false);
                    return;
                  }

                  // Find the remove icon span inside the shadow root
                  const removeIcon = chip.shadowRoot.querySelector('.remove-icon');
                  if (!removeIcon) {
                    Logger.warn(`[Payment Methods] Remove icon not found for chip ${index}`);
                    resolveChip(false);
                    return;
                  }

                  // Click the remove icon
                  removeIcon.click();
                  Logger.info(`[Payment Methods] Removed existing payment method chip ${index + 1}/${existingChips.length}`);
                  resolveChip(true);
                });
              };

              // Remove all chips sequentially
              const removeChipsSequentially = async () => {
                for (let i = 0; i < existingChips.length; i++) {
                  await removeChip(existingChips[i], i);
                  // Small delay between removals
                  if (i < existingChips.length - 1) {
                    await new Promise((r) => setTimeout(r, 100));
                  }
                }
                Logger.info('[Payment Methods] All existing payment methods removed');
                resolveRemove(true);
              };

              removeChipsSequentially();
            } catch (error) {
              Logger.error('[Payment Methods] Error removing existing payment methods:', error);
              resolveRemove(false);
            }
          });
        };

        // Function to add a single payment method
        const addPaymentMethod = (methodId, index) => {
          return new Promise((resolveMethod) => {
            try {
              // Focus and click the input to open dropdown
              input.focus();
              input.click();
              input.dispatchEvent(new Event('focus', { bubbles: true }));
              input.dispatchEvent(new MouseEvent('click', { bubbles: true }));

              // Wait for menu to open and items to load
              setTimeout(() => {
                // Find the wz-menu inside the shadow root
                const menu = paymentAutocomplete.shadowRoot.querySelector('wz-menu');
                if (!menu) {
                  Logger.warn(`[Payment Methods] wz-menu not found for method ${methodId}`);
                  resolveMethod(false);
                  return;
                }

                // Find all menu items (they are light DOM children of wz-menu)
                const menuItems = menu.querySelectorAll('wz-menu-item');
                Logger.info(`[Payment Methods] Found ${menuItems.length} payment method menu items`);

                // Find the menu item that matches the payment method ID
                let targetMenuItem = null;
                for (const item of menuItems) {
                  const itemId = item.getAttribute('item-id');
                  if (itemId === methodId) {
                    targetMenuItem = item;
                    Logger.info(`[Payment Methods] Found matching menu item for: ${methodId}`);
                    break;
                  }
                }

                if (!targetMenuItem) {
                  Logger.warn(`[Payment Methods] Menu item not found for payment method: ${methodId}`);
                  resolveMethod(false);
                  return;
                }

                // Click the menu item to select it
                targetMenuItem.click();
                Logger.info(`[Payment Methods] Successfully selected payment method: ${methodId}`);
                resolveMethod(true);
              }, 300); // Wait for menu to open
            } catch (error) {
              Logger.error(`[Payment Methods] Error adding payment method ${methodId}:`, error);
              resolveMethod(false);
            }
          });
        };

        // Add payment methods sequentially with delays between each
        const addMethodsSequentially = async () => {
          // First, remove all existing payment methods
          await removeAllExistingPaymentMethods();

          // Wait a bit after removal before adding new ones
          await new Promise((r) => setTimeout(r, 50));

          const results = [];
          for (let i = 0; i < paymentMethods.length; i++) {
            const methodId = paymentMethods[i];
            const success = await addPaymentMethod(methodId, i);
            results.push(success);

            // Wait between selections to avoid conflicts
            if (i < paymentMethods.length - 1) {
              await new Promise((r) => setTimeout(r, 100));
            }
          }

          const allSuccessful = results.every((r) => r === true);
          const successCount = results.filter((r) => r === true).length;

          Logger.info(`[Payment Methods] Added ${successCount}/${paymentMethods.length} payment methods successfully`);
          resolve(allSuccessful);
        };

        addMethodsSequentially();
      } catch (error) {
        Logger.error('[Payment Methods] Error setting payment methods:', error);
        resolve(false);
      }
    });
  }

  /**
   * Programmatically select a charging station network from the WME dropdown
   * Uses multiple approaches: direct menu click, typing simulation, and wz-autocomplete API
   * @param {string} networkName - The network name to select (must match WME's item-id)
   * @param {number} retryCount - Current retry attempt (default: 0)
   * @param {number} maxRetries - Maximum number of retries (default: 10)
   * @returns {Promise<boolean>} - Returns promise that resolves to true if selection was successful
   */
  function selectChargingStationNetwork(networkName, retryCount = 0, maxRetries = 10) {
    return new Promise((resolve) => {
      try {
        // Find the charging station network autocomplete control
        let networkControlDiv = document.querySelector('#venue-edit-general .charging-station-network-control-autocomplete');

        // Try alternative selectors if not found
        if (!networkControlDiv) {
          networkControlDiv = document.querySelector('.charging-station-network-control-autocomplete');
        }

        if (!networkControlDiv) {
          if (retryCount < maxRetries) {
            Logger.info(`[Network Selection] Control div not found, retrying... (${retryCount + 1}/${maxRetries})`);
            setTimeout(() => {
              selectChargingStationNetwork(networkName, retryCount + 1, maxRetries).then(resolve);
            }, RETRY_INJECTION_DELAY * 2);
            return;
          }
          Logger.warn('[Network Selection] Charging station network control div not found after retries');
          resolve(false);
          return;
        }

        // Get the wz-autocomplete element (direct child of the div)
        const wzAutocomplete = networkControlDiv.querySelector('wz-autocomplete');
        if (!wzAutocomplete) {
          if (retryCount < maxRetries) {
            Logger.info(`[Network Selection] wz-autocomplete not found, retrying... (${retryCount + 1}/${maxRetries})`);
            setTimeout(() => {
              selectChargingStationNetwork(networkName, retryCount + 1, maxRetries).then(resolve);
            }, RETRY_INJECTION_DELAY * 2);
            return;
          }
          Logger.warn('[Network Selection] wz-autocomplete not found after retries');
          resolve(false);
          return;
        }

        // Wait for shadow root to be attached to wz-autocomplete
        if (!wzAutocomplete.shadowRoot) {
          if (retryCount < maxRetries) {
            Logger.info(`[Network Selection] wz-autocomplete shadow root not attached, retrying... (${retryCount + 1}/${maxRetries})`);
            setTimeout(() => {
              selectChargingStationNetwork(networkName, retryCount + 1, maxRetries).then(resolve);
            }, RETRY_INJECTION_DELAY * 2);
            return;
          }
          Logger.warn('[Network Selection] wz-autocomplete shadow root not attached after retries');
          resolve(false);
          return;
        }

        // Get wz-text-input from inside wz-autocomplete's shadow DOM
        const textInput = wzAutocomplete.shadowRoot.querySelector('wz-text-input');
        if (!textInput) {
          if (retryCount < maxRetries) {
            Logger.info(`[Network Selection] wz-text-input not found in shadow root, retrying... (${retryCount + 1}/${maxRetries})`);
            setTimeout(() => {
              selectChargingStationNetwork(networkName, retryCount + 1, maxRetries).then(resolve);
            }, RETRY_INJECTION_DELAY * 2);
            return;
          }
          Logger.warn('[Network Selection] wz-text-input not found in shadow root after retries');
          resolve(false);
          return;
        }

        // Wait for shadow root to be attached to wz-text-input
        if (!textInput.shadowRoot) {
          if (retryCount < maxRetries) {
            Logger.info(`[Network Selection] wz-text-input shadow root not attached, retrying... (${retryCount + 1}/${maxRetries})`);
            setTimeout(() => {
              selectChargingStationNetwork(networkName, retryCount + 1, maxRetries).then(resolve);
            }, RETRY_INJECTION_DELAY * 2);
            return;
          }
          Logger.warn('[Network Selection] wz-text-input shadow root not attached after retries');
          resolve(false);
          return;
        }

        // Get the actual input element from wz-text-input's shadow DOM
        const input = textInput.shadowRoot.querySelector('input');
        if (!input) {
          Logger.warn('[Network Selection] Input element not found in wz-text-input shadow root');
          resolve(false);
          return;
        }

        // Find the wz-menu inside wz-autocomplete's shadow DOM
        const menu = wzAutocomplete.shadowRoot.querySelector('wz-menu');
        if (!menu) {
          Logger.warn('[Network Selection] wz-menu not found in wz-autocomplete shadow root');
          resolve(false);
          return;
        }

        // IMPORTANT: Menu items are loaded dynamically when the dropdown is opened
        // We need to trigger the dropdown to open first, then wait for items to load
        Logger.info('[Network Selection] Opening dropdown to load menu items...');

        // Focus and click the input to open the dropdown
        input.focus();
        input.click();

        // Trigger input event to open dropdown
        input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
        input.dispatchEvent(new Event('focus', { bubbles: true, composed: true }));
        input.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));

        // Wait for menu items to load (they're populated asynchronously)
        setTimeout(() => {
          // Find the menu items - they are LIGHT DOM children of wz-menu (slotted content)
          const menuItems = menu.querySelectorAll('wz-menu-item');

          Logger.info(`[Network Selection] Found ${menuItems.length} menu items after opening dropdown`);

          if (menuItems.length === 0) {
            Logger.warn('[Network Selection] No menu items loaded even after opening dropdown');
            resolve(false);
            return;
          }

          let targetMenuItem = null;

          for (const item of menuItems) {
            const itemId = item.getAttribute('item-id');
            Logger.info(`[Network Selection] Checking menu item: "${itemId}"`);
            if (itemId === networkName) {
              targetMenuItem = item;
              Logger.info(`[Network Selection] Found matching menu item for: ${networkName}`);
              break;
            }
          }

          if (!targetMenuItem) {
            Logger.warn(
              `[Network Selection] Menu item not found for network: "${networkName}". Available items: ${Array.from(menuItems)
                .map((item) => `"${item.getAttribute('item-id')}"`)
                .join(', ')}`
            );
            resolve(false);
            return;
          }

          // Get the display text from the menu item
          const title = targetMenuItem.getAttribute('title') || networkName;

          // Type the network name to filter/highlight the item
          Logger.info(`[Network Selection] Typing network name: ${title}`);

          // Clear and type the network name
          input.value = '';
          input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));

          setTimeout(() => {
            input.value = title;

            // Dispatch events to trigger autocomplete filtering
            input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
            input.dispatchEvent(new Event('change', { bubbles: true, composed: true }));

            // Click the menu item directly to select it
            setTimeout(() => {
              targetMenuItem.click();
              Logger.info(`[Network Selection] Successfully selected network: ${networkName}`);
              resolve(true);
            }, 100);
          }, 50);
        }, 300); // Wait 300ms for menu items to load after opening dropdown
      } catch (error) {
        Logger.error('[Network Selection] Error selecting network:', error);
        resolve(false);
      }
    });
  }

  function swapPrimaryAndAliasNames(wmeSDK, aliasIndex = 0) {
    // Only run if a venue is selected
    const selection = wmeSDK.Editing.getSelection();
    if (!selection || selection.objectType !== 'venue' || !selection.ids || selection.ids.length !== 1) {
      Logger.warn('No venue selected for name swapping');
      return;
    }

    const venueId = selection.ids[0];
    const venue = wmeSDK.DataModel.Venues.getById({ venueId });

    if (!venue) {
      Logger.warn('Venue not found');
      return;
    }

    // Check if venue has at least one alias to swap
    if (!venue.aliases || venue.aliases.length === 0) {
      Logger.warn('Venue must have at least one alias to swap');
      return;
    }

    // Validate alias index
    if (aliasIndex < 0 || aliasIndex >= venue.aliases.length) {
      Logger.warn(`Invalid alias index: ${aliasIndex}. Available aliases: ${venue.aliases.length}`);
      return;
    }

    // Get current primary name (can be empty) and target alias
    const currentPrimaryName = venue.name || '';
    const targetAlias = venue.aliases[aliasIndex];

    // Create new aliases array
    let newAliases = [...venue.aliases];

    // If primary name exists, replace the target alias with it
    // If primary name is empty, just remove the target alias
    if (currentPrimaryName.trim() !== '') {
      newAliases[aliasIndex] = currentPrimaryName;
    } else {
      newAliases.splice(aliasIndex, 1); // Remove the alias that becomes primary
    }

    try {
      // Update venue with swapped names
      wmeSDK.DataModel.Venues.updateVenue({
        venueId: venueId,
        name: targetAlias,
        aliases: newAliases,
      });

      Logger.info(`Swapped names: "${currentPrimaryName}" ↔ "${targetAlias}" (alias index: ${aliasIndex})`);
      try {
        WazeToastr.Alerts.info('POI Shortcut', `Swapped names: "<b>${currentPrimaryName}</b>" ↔ "<b>${targetAlias}</b>"`, false, false, 3000);
      } catch (e) {
        Logger.warn('WazeToastr.Alerts.info failed:', e);
      }

      // Re-inject swap buttons so icon appears immediately
      setTimeout(function () {
        injectSwapNamesButton(wmeSDK);
      }, 150);
    } catch (error) {
      Logger.error('Error swapping venue names:', error);
    }
  }

  function injectSwapNamesButton(wmeSDK) {
    // Always disconnect previous observers/listeners before setting up new ones
    disconnectAliasObserver();

    // Remove any existing event handlers to prevent accumulation
    $(document).off('focusout.wme-poi-shortcuts');
    $(document).off('click.wme-poi-shortcuts-alias');
    document.removeEventListener('venueSelected', handleVenueSelected, true);

    // Define handlers with proper scope
    function handleVenueSelected() {
      setTimeout(() => tryInjectSwapButton(), 100);
    }

    // Ensure swap buttons are injected after venue creation and alias addition
    // Listen for venue creation (new venue selection)
    document.addEventListener('venueSelected', handleVenueSelected, true);

    // Listen for alias addition (when alias input loses focus or alias is added)
    $(document).on('focusout.wme-poi-shortcuts', '.alias-item-content input', function () {
      debouncedInjectSwapButton(wmeSDK);
    });

    // Listen for alias addition via button click (if applicable)
    $(document).on('click.wme-poi-shortcuts-alias', '.add-alias-btn', function () {
      debouncedInjectSwapButton(wmeSDK);
    });
    // Clean up existing observer when selection changes
    disconnectAliasObserver();

    // Only run if a venue is selected
    const selection = wmeSDK.Editing.getSelection();
    if (!selection || selection.objectType !== 'venue' || !selection.ids || selection.ids.length !== 1) {
      return;
    }

    const venueId = selection.ids[0];
    const venue = wmeSDK.DataModel.Venues.getById({ venueId });

    if (!venue) return;

    // Setup MutationObserver to watch for changes in aliases list
    function setupAliasObserver() {
      const aliasesList = document.querySelector('.aliases-list');
      const nameInput = document.querySelector('input[placeholder*="name" i], input[name*="name" i], .venue-name input, .place-name input');
      if (!aliasesList && !nameInput) return;

      try {
        // Observe the aliases list for new alias additions (only if not already observing)
        if (aliasesList && !aliasListObserver) {
          aliasListObserver = new MutationObserver((mutations) => {
            let shouldReinject = false;
            mutations.forEach((mutation) => {
              if (mutation.type === 'childList' && (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0)) {
                shouldReinject = true;
              }
            });
            if (shouldReinject) {
              debouncedInjectSwapButton(wmeSDK);
            }
          });
          aliasListObserver.observe(aliasesList, { childList: true, subtree: true });
        }

        // Observe existing alias items for text changes (only if not already observed)
        const aliasItems = document.querySelectorAll('div[slot="item-key"].alias-item-content');
        aliasItems.forEach((aliasItem) => {
          const itemKey = aliasItem.outerHTML;
          if (!observedAliasItems.has(itemKey)) {
            observedAliasItems.add(itemKey);
            const aliasObserver = new MutationObserver(() => {
              debouncedInjectSwapButton(wmeSDK);
            });
            aliasObserver.observe(aliasItem, { childList: true, subtree: true, characterData: true });
            // Track this observer for proper cleanup
            aliasObservers.add(aliasObserver);
          }
        });

        // Observe name input for changes (only if not already observed)
        if (nameInput && !nameInputObserved) {
          nameInputObserved = true;
          nameInput.addEventListener('input', () => {
            debouncedInjectSwapButton(wmeSDK);
          });
          // Also observe attribute changes (for autofill etc)
          if (!nameAttrObserver) {
            nameAttrObserver = new MutationObserver(() => {
              debouncedInjectSwapButton(wmeSDK);
            });
            nameAttrObserver.observe(nameInput, { attributes: true });
          }
        }
      } catch (error) {
        Logger.warn('Error setting up alias observer:', error);
      }
    }

    // Wait for the venue aliases section to exist and inject swap buttons
    function tryInjectSwapButton(attemptCount = 0) {
      if (attemptCount >= MAX_RETRY_ATTEMPTS) {
        Logger.warn('Max retry attempts reached for swap button injection');
        return;
      }

      const $aliasItems = $('div[slot="item-key"].alias-item-content').closest('wz-list-item');

      if ($aliasItems.length === 0) {
        // Even if no aliases exist yet, set up observers to catch them when they're added
        setupAliasObserver();
        setTimeout(() => tryInjectSwapButton(attemptCount + 1), RETRY_INJECTION_DELAY);
        return;
      }

      // Setup observer for alias items (in case they weren't set up already)
      setupAliasObserver();

      let foundAliases = false;

      // Process each alias item and add swap button if needed
      $aliasItems.each(function (index) {
        const $aliasItem = $(this);
        const $actionsContainer = $aliasItem.find('div[slot="actions"].alias-item-actions');

        if ($actionsContainer.length === 0) return true; // Continue to next iteration

        // Remove unwanted "To Name" button from other script such as WME Place Interface Enhancement
        $actionsContainer
          .find('wz-button.makePrimary.alias-item-action, div.make-primary-venue-button')
          .filter(function () {
            const text = $(this).text().trim();
            return text === 'To Name' || text === 'Make primary';
          })
          .remove();

        // Check if swap button already exists in this specific alias item
        if ($actionsContainer.find('.swap-names-btn').length > 0) {
          foundAliases = true;
          return true; // Continue to next iteration
        }

        // Check if venue has aliases before showing button (primary name can be empty)
        const hasSwappableNames = venue.aliases && venue.aliases.length > 0;
        if (!hasSwappableNames) return true; // Continue to next iteration

        // Create swap button for this specific alias
        const buttonHtml = `
          <wz-button color="blue" size="sm" class="alias-item-action alias-item-action-swap swap-names-btn" title="Swap primary name with this alias" data-alias-index="${index}">
            <i class="w-icon w-icon-arrow-up alias-item-action-icon"></i>
          </wz-button>
        `;

        $actionsContainer.prepend(buttonHtml);
        foundAliases = true;
      });

      // Retry if no aliases found yet
      if (!foundAliases) {
        setTimeout(() => tryInjectSwapButton(attemptCount + 1), RETRY_INJECTION_DELAY);
        return;
      }

      // Attach click handler for all swap buttons
      $('.swap-names-btn')
        .off('click.swapnames')
        .on('click.swapnames', function (e) {
          e.preventDefault();
          e.stopPropagation();
          const aliasIndex = parseInt($(this).attr('data-alias-index') || '0', 10);
          swapPrimaryAndAliasNames(wmeSDK, aliasIndex);
        });

      // If primary name is empty, optionally disable swap buttons
      if (!venue.name || venue.name.trim() === '') {
        // Always enable swap buttons if there are aliases
        $('.swap-names-btn').removeAttr('disabled').attr('title', 'Promote this alias to primary name');
      } else {
        $('.swap-names-btn').removeAttr('disabled').attr('title', 'Swap primary name with this alias');
      }
    }

    // Start the injection process and setup observers immediately
    setupAliasObserver();
    tryInjectSwapButton();
  }

  /**
   * Read the current venue name from the UI input field (catches unsaved typed text).
   * Falls back to the SDK venue object if the UI isn't available or is empty.
   */
  function getCurrentVenueName(venue) {
    try {
      const nameInput = document.querySelector('#venue-edit-general wz-text-input[name="name"]');
      if (nameInput && nameInput.shadowRoot) {
        const shadowInput = nameInput.shadowRoot.querySelector('input');
        if (shadowInput && shadowInput.value.trim()) {
          return shadowInput.value.trim();
        }
      }
    } catch (e) { /* ignore */ }
    return venue.name ? venue.name.trim() : '';
  }

  /**
   * Handles NOC button click with specific business logic for Nepal gas stations
   *
   * This function implements intelligent NOC name management with three distinct cases:
   *
   * CASE 1: Empty Gas Station
   * - Condition: No primary name AND no aliases
   * - Action: Sets "NOC" as primary name
   * - Example: Empty venue → Primary: "NOC", Aliases: []
   *
   * CASE 2: NOC Primary with Aliases (Smart Swap)
   * - Condition: Primary name is "NOC" AND has at least one alias
   * - Action: Swaps primary name with first English alias (uses regex), moves "NOC" to aliases
   * - Prioritizes English over Nepali names when selecting which alias to promote
   * - Example: Primary: "NOC", Aliases: ["नेपाल तेल", "Shell"] → Primary: "Shell", Aliases: ["NOC", "नेपाल तेल"]
   *
   * CASE 3: Non-NOC Primary (Add as Alias)
   * - Condition: Primary name is NOT "NOC" AND "NOC" not in aliases
   * - Action: Adds "NOC" as an additional alias
   * - Example: Primary: "Shell", Aliases: ["Pump"] → Primary: "Shell", Aliases: ["Pump", "NOC"]
   *
   * Additional Features:
   * - Conditionally sets brand to "Nepal Oil Corporation" only if different/empty
   * - Conditionally sets website to "noc.org.np" only if different/empty
   * - Always applies lock rank if different from current (even when no name changes needed)
   * - Uses proper delays to prevent WME update conflicts
   * - Comprehensive error handling to prevent InvalidStateError
   *
   * @param {Object} wmeSDK - The WME SDK instance
   * @param {string} venueId - The venue ID
   * @param {Object} venue - The venue object
   * @param {number} lockRank - The lock rank to apply
   */
  function handleNOCButtonClick(wmeSDK, venueId, venue, lockRank) {
    // Read from UI first to catch unsaved typed text, fall back to SDK data
    const currentName = getCurrentVenueName(venue);
    const currentAliases = Array.isArray(venue.aliases) ? venue.aliases.slice() : [];

    // Helper function to build update object with conditional brand/url setting
    function buildUpdateObject(baseObj) {
      const updateObj = { ...baseObj };

      // Only set brand if it's empty or different from target brand
      if (!venue.brand || venue.brand !== 'Nepal Oil Corporation') {
        updateObj.brand = 'Nepal Oil Corporation';
      }

      // Only set URL if it's empty or different from target URL
      if (!venue.url || venue.url !== 'noc.org.np') {
        updateObj.url = 'noc.org.np';
      }

      return updateObj;
    }

    // Case 1: Gas station has no names - add "NOC" as primary name
    if (!currentName && currentAliases.length === 0) {
      const updateObj = buildUpdateObject({
        venueId: venueId,
        name: 'NOC',
        aliases: [],
      });

      try {
        wmeSDK.DataModel.Venues.updateVenue(updateObj);
        Logger.info('NOC: Added NOC as primary name to empty gas station');

        // Apply lock rank with delay and combined alert
        if (lockRank !== undefined && lockRank !== null && lockRank !== venue.lockRank) {
          setTimeout(() => {
            try {
              wmeSDK.DataModel.Venues.updateVenue({ venueId: venueId, lockRank: lockRank });
              Logger.info('[NOC Debug] lockRank updated successfully:', lockRank);
              try {
                WazeToastr.Alerts.info('NOC Update', `<b>Case 1:</b> Empty gas station updated<br>Primary: <b>NOC</b><br>Brand: <b>Nepal Oil Corporation</b><br>Lock Rank: <b>${venue.lockRank + 1}</b> → <b>${lockRank + 1}</b>`, false, false, 3000);
              } catch (e) {
                Logger.warn('WazeToastr.Alerts.info failed:', e);
              }
            } catch (err) {
              Logger.warn('[NOC Debug] lockRank update failed:', err);
              try {
                WazeToastr.Alerts.warning('NOC Update', `<b>Case 1:</b> Empty gas station updated<br>Primary: <b>NOC</b><br>Brand: <b>Nepal Oil Corporation</b><br>⚠️ Lock rank update failed`, false, false, 3000);
              } catch (e) {
                Logger.warn('WazeToastr.Alerts.warning failed:', e);
              }
            }
          }, RETRY_INJECTION_DELAY * 3);
        } else {
          const lockMessage = lockRank !== undefined && lockRank !== null ? `<br>Lock Rank: <b>${lockRank + 1}</b> (unchanged)` : '';
          try {
            WazeToastr.Alerts.info('NOC Update', `<b>Case 1:</b> Empty gas station updated<br>Primary: <b>NOC</b><br>Brand: <b>Nepal Oil Corporation</b>${lockMessage}`, false, false, 3000);
          } catch (e) {
            Logger.warn('WazeToastr.Alerts.info failed:', e);
          }
        }
      } catch (err) {
        Logger.error('NOC: Error updating venue (Case 1):', err);
        try {
          WazeToastr.Alerts.error('NOC Error', 'Failed to update empty gas station', false, false, 3000);
        } catch (e) {
          Logger.warn('WazeToastr.Alerts.error failed:', e);
        }
        return;
      }
      return;
    }

    // Case 2: Primary name is "NOC" and has aliases - swap primary with English alias preferentially
    if (currentName === 'NOC' && currentAliases.length > 0) {
      // Helper function to detect if text is likely English (uses Latin characters)
      const isEnglish = (text) => /^[a-zA-Z0-9\s\-'&.()]+$/.test(text.trim());

      // Find the first English alias, fallback to first alias if none found
      let selectedAliasIndex = 0;
      for (let i = 0; i < currentAliases.length; i++) {
        if (isEnglish(currentAliases[i])) {
          selectedAliasIndex = i;
          break;
        }
      }

      const newPrimaryName = currentAliases[selectedAliasIndex];
      // Create new aliases array: NOC first, then remaining aliases (excluding the selected one)
      const remainingAliases = currentAliases.filter((_, index) => index !== selectedAliasIndex);
      const newAliases = ['NOC', ...remainingAliases];

      const updateObj = buildUpdateObject({
        venueId: venueId,
        name: newPrimaryName,
        aliases: newAliases,
      });

      try {
        wmeSDK.DataModel.Venues.updateVenue(updateObj);
        Logger.info(`NOC: Swapped NOC with ${newPrimaryName}, NOC is now alias`);

        // Apply lock rank with delay and combined alert
        if (lockRank !== undefined && lockRank !== null && lockRank !== venue.lockRank) {
          setTimeout(() => {
            try {
              wmeSDK.DataModel.Venues.updateVenue({ venueId: venueId, lockRank: lockRank });
              Logger.info('[NOC Debug] lockRank updated successfully:', lockRank);
              try {
                WazeToastr.Alerts.info('NOC Update', `<b>Case 2:</b> Smart swap completed<br>Primary: <b>${newPrimaryName}</b><br>NOC moved to aliases<br>Lock Rank: <b>${venue.lockRank + 1}</b> → <b>${lockRank + 1}</b>`, false, false, 3000);
              } catch (e) {
                Logger.warn('WazeToastr.Alerts.info failed:', e);
              }
            } catch (err) {
              Logger.warn('[NOC Debug] lockRank update failed:', err);
              try {
                WazeToastr.Alerts.warning('NOC Update', `<b>Case 2:</b> Smart swap completed<br>Primary: <b>${newPrimaryName}</b><br>NOC moved to aliases<br>⚠️ Lock rank update failed`, false, false, 3000);
              } catch (e) {
                Logger.warn('WazeToastr.Alerts.warning failed:', e);
              }
            }
          }, RETRY_INJECTION_DELAY * 3);
        } else {
          const lockMessage = lockRank !== undefined && lockRank !== null ? `<br>Lock Rank: <b>${lockRank + 1}</b> (unchanged)` : '';
          try {
            WazeToastr.Alerts.info('NOC Update', `<b>Case 2:</b> Smart swap completed<br>Primary: <b>${newPrimaryName}</b><br>NOC moved to aliases${lockMessage}`, false, false, 3000);
          } catch (e) {
            Logger.warn('WazeToastr.Alerts.info failed:', e);
          }
        }
      } catch (err) {
        Logger.error('NOC: Error updating venue (Case 2):', err);
        try {
          WazeToastr.Alerts.error('NOC Error', 'Failed to swap NOC with alias name', false, false, 3000);
        } catch (e) {
          Logger.warn('WazeToastr.Alerts.error failed:', e);
        }
        return;
      }
      return;
    }

    // Case 3: Primary name is not "NOC" and no "NOC" alias exists - add "NOC" as alias
    if (currentName !== 'NOC' && !currentAliases.includes('NOC')) {
      const newAliases = [...currentAliases, 'NOC'];

      const updateObj = buildUpdateObject({
        venueId: venueId,
        name: currentName,
        aliases: newAliases,
      });

      try {
        wmeSDK.DataModel.Venues.updateVenue(updateObj);
        Logger.info(`NOC: Added NOC as alias to gas station with primary name: ${currentName}`);

        // Apply lock rank with delay and combined alert
        if (lockRank !== undefined && lockRank !== null && lockRank !== venue.lockRank) {
          setTimeout(() => {
            try {
              wmeSDK.DataModel.Venues.updateVenue({ venueId: venueId, lockRank: lockRank });
              Logger.info('[NOC Debug] lockRank updated successfully:', lockRank);
              try {
                WazeToastr.Alerts.info('NOC Update', `<b>Case 3:</b> NOC added as alias<br>Primary: <b>${currentName}</b><br>NOC added to aliases<br>Lock Rank: <b>${venue.lockRank + 1}</b> → <b>${lockRank + 1}</b>`, false, false, 3000);
              } catch (e) {
                Logger.warn('WazeToastr.Alerts.info failed:', e);
              }
            } catch (err) {
              Logger.warn('[NOC Debug] lockRank update failed:', err);
              try {
                WazeToastr.Alerts.warning('NOC Update', `<b>Case 3:</b> NOC added as alias<br>Primary: <b>${currentName}</b><br>NOC added to aliases<br>⚠️ Lock rank update failed`, false, false, 3000);
              } catch (e) {
                Logger.warn('WazeToastr.Alerts.warning failed:', e);
              }
            }
          }, RETRY_INJECTION_DELAY * 3);
        } else {
          const lockMessage = lockRank !== undefined && lockRank !== null ? `<br>Lock Rank: <b>${lockRank + 1}</b> (unchanged)` : '';
          try {
            WazeToastr.Alerts.info('NOC Update', `<b>Case 3:</b> NOC added as alias<br>Primary: <b>${currentName}</b><br>NOC added to aliases${lockMessage}`, false, false, 3000);
          } catch (e) {
            Logger.warn('WazeToastr.Alerts.info failed:', e);
          }
        }
      } catch (err) {
        Logger.error('NOC: Error updating venue (Case 3):', err);
        try {
          WazeToastr.Alerts.error('NOC Error', 'Failed to add NOC as alias', false, false, 3000);
        } catch (e) {
          Logger.warn('WazeToastr.Alerts.error failed:', e);
        }
        return;
      }
      return;
    }

    // Edge case: Primary name is not "NOC" but "NOC" already exists as alias
    if (currentName !== 'NOC' && currentAliases.includes('NOC')) {
      Logger.info('NOC: NOC already exists as alias, checking lock rank');

      // Still apply lock rank if it's different from current
      if (lockRank !== undefined && lockRank !== null && lockRank !== venue.lockRank) {
        setTimeout(() => {
          try {
            wmeSDK.DataModel.Venues.updateVenue({ venueId: venueId, lockRank: lockRank });
            Logger.info(`[NOC Debug] lockRank updated successfully: ${lockRank} (was ${venue.lockRank})`);
            try {
              WazeToastr.Alerts.info('NOC Update', `<b>Edge Case:</b> NOC already in aliases<br>Lock rank updated: <b>${venue.lockRank + 1}</b> → <b>${lockRank + 1}</b>`, false, false, 3000);
            } catch (e) {
              Logger.warn('WazeToastr.Alerts.info failed:', e);
            }
          } catch (err) {
            Logger.warn('[NOC Debug] lockRank update failed:', err);
            try {
              WazeToastr.Alerts.warning('NOC Update', `<b>Edge Case:</b> NOC already in aliases<br>⚠️ Lock rank update failed`, false, false, 3000);
            } catch (e) {
              Logger.warn('WazeToastr.Alerts.warning failed:', e);
            }
          }
        }, RETRY_INJECTION_DELAY * 3);
      } else {
        Logger.info('NOC: No changes needed - NOC exists and lock rank unchanged');
        try {
          WazeToastr.Alerts.info('NOC Update', '<b>No Changes:</b> NOC already in aliases<br>Lock rank already correct', false, false, 2500);
        } catch (e) {
          Logger.warn('WazeToastr.Alerts.info failed:', e);
        }
      }
      return;
    }

    // Edge case: Primary name is "NOC" but no aliases
    if (currentName === 'NOC' && currentAliases.length === 0) {
      Logger.info('NOC: Gas station already has NOC as primary name with no aliases, checking lock rank');

      // Still apply lock rank if it's different from current
      if (lockRank !== undefined && lockRank !== null && lockRank !== venue.lockRank) {
        setTimeout(() => {
          try {
            wmeSDK.DataModel.Venues.updateVenue({ venueId: venueId, lockRank: lockRank });
            Logger.info(`[NOC Debug] lockRank updated successfully: ${lockRank} (was ${venue.lockRank})`);
            try {
              WazeToastr.Alerts.info('NOC Update', `<b>Edge Case:</b> NOC already primary<br>Lock rank updated: <b>${venue.lockRank + 1}</b> → <b>${lockRank + 1}</b>`, false, false, 3000);
            } catch (e) {
              Logger.warn('WazeToastr.Alerts.info failed:', e);
            }
          } catch (err) {
            Logger.warn('[NOC Debug] lockRank update failed:', err);
            try {
              WazeToastr.Alerts.warning('NOC Update', `<b>Edge Case:</b> NOC already primary<br>⚠️ Lock rank update failed`, false, false, 3000);
            } catch (e) {
              Logger.warn('WazeToastr.Alerts.warning failed:', e);
            }
          }
        }, RETRY_INJECTION_DELAY * 3);
      } else {
        Logger.info('NOC: No changes needed - NOC is primary and lock rank unchanged');
        try {
          WazeToastr.Alerts.info('NOC Update', '<b>No Changes:</b> NOC already primary<br>Lock rank already correct', false, false, 2500);
        } catch (e) {
          Logger.warn('WazeToastr.Alerts.info failed:', e);
        }
      }
      return;
    }
  }

  /**
   * Handles charging station brand/network button clicks
   * Updates primary name, brand, website, aliases, and lock rank
   *
   * @param {Object} wmeSDK - The WME SDK instance
   * @param {string} venueId - The venue ID
   * @param {Object} venue - The venue object
   * @param {string} primaryName - The primary network/brand name
   * @param {string} brand - The brand value
   * @param {string} website - The website URL
   * @param {number} lockRank - The lock rank to apply
   * @param {Array} countryBrands - Array of brand objects for the country
   */
  function handleChargingStationButtonClick(wmeSDK, venueId, venue, primaryName, brand, website, lockRank, countryBrands) {
    try {
      // Find the selected brand object to get its predefined aliases
      const selectedBrandObj = countryBrands ? countryBrands.find((brandObj) => brandObj.primaryName === primaryName) : null;

      // Read current name from UI first (catches unsaved typed text)
      const currentVenueName = getCurrentVenueName(venue);

      // Build aliases array following SDK best practices
      let aliases = Array.isArray(venue.aliases) ? venue.aliases.slice() : [];

      // Add current venue name to aliases if it's different from the selected primaryName
      if (currentVenueName && currentVenueName !== primaryName && !aliases.includes(currentVenueName)) {
        aliases.push(currentVenueName);
      }

      // Add predefined aliases from the brand data
      if (selectedBrandObj && Array.isArray(selectedBrandObj.aliases)) {
        selectedBrandObj.aliases.forEach((alias) => {
          if (alias && alias.trim() !== '' && !aliases.includes(alias)) {
            aliases.push(alias);
          }
        });
      }

      // Build update object with conditional property setting
      const updateObj = {
        venueId: venueId,
        name: primaryName,
        aliases: aliases,
      };

      // Only set brand if it's different from current
      // Commented out for future use - brand field not currently needed for charging stations
      // if (!venue.brand || venue.brand !== brand) {
      //   updateObj.brand = brand;
      // }

      // Only set URL if it's different from current
      if (website && (!venue.url || venue.url !== website)) {
        updateObj.url = website;
      }

      // Set opening hours if specified in brand data (e.g., ElectriVa is 24/7)
      if (selectedBrandObj && selectedBrandObj.openingHours) {
        updateObj.openingHours = selectedBrandObj.openingHours;
      }

      Logger.info('[Charging Station] Updating with:', updateObj);

      // Apply venue updates using SDK updateVenue method
      wmeSDK.DataModel.Venues.updateVenue(updateObj);
      Logger.info(`[Charging Station] Updated to ${primaryName}`);

      // Select the charging station network from WME dropdown if networkName is available
      if (selectedBrandObj && selectedBrandObj.networkName !== undefined && selectedBrandObj.networkName !== null) {
        setTimeout(() => {
          selectChargingStationNetwork(selectedBrandObj.networkName).then((networkSelected) => {
            if (networkSelected) {
              Logger.info(`[Charging Station] Network dropdown updated to: ${selectedBrandObj.networkName}`);
            } else {
              Logger.warn(`[Charging Station] Failed to update network dropdown for: ${selectedBrandObj.networkName}`);
            }
          });
        }, RETRY_INJECTION_DELAY * 2);
      }

      // Set the cost type from WME dropdown if costType is available
      if (selectedBrandObj && selectedBrandObj.costType) {
        setTimeout(() => {
          setChargingStationCostType(selectedBrandObj.costType).then((costTypeSet) => {
            if (costTypeSet) {
              const costLabel = selectedBrandObj.costType === 'FREE' ? 'Free' : selectedBrandObj.costType === 'FEE' ? 'Paid' : 'Unspecified';
              Logger.info(`[Charging Station] Cost type set to: ${costLabel}`);
            } else {
              Logger.warn(`[Charging Station] Failed to set cost type to: ${selectedBrandObj.costType}`);
            }
          });
        }, RETRY_INJECTION_DELAY * 4); // Wait longer to ensure network dropdown is done
      }

      // Set payment methods from WME dropdown if paymentMethods array is available
      if (selectedBrandObj && selectedBrandObj.paymentMethods && Array.isArray(selectedBrandObj.paymentMethods) && selectedBrandObj.paymentMethods.length > 0) {
        setTimeout(() => {
          setChargingStationPaymentMethods(selectedBrandObj.paymentMethods).then((paymentMethodsSet) => {
            if (paymentMethodsSet) {
              const paymentLabels = selectedBrandObj.paymentMethods.map(getPaymentMethodLabel).join(', ');
              Logger.info(`[Charging Station] Payment methods set to: ${paymentLabels}`);
            } else {
              const paymentLabels = selectedBrandObj.paymentMethods.map(getPaymentMethodLabel).join(', ');
              Logger.warn(`[Charging Station] Failed to set payment methods: ${paymentLabels}`);
            }
          });
        }, RETRY_INJECTION_DELAY * 6); // Wait even longer to avoid conflicts with cost type
      }

      // Apply lock rank with delay to prevent conflicts
      if (lockRank !== undefined && lockRank !== null && lockRank !== venue.lockRank) {
        setTimeout(() => {
          try {
            wmeSDK.DataModel.Venues.updateVenue({ venueId: venueId, lockRank: lockRank });
            Logger.info(`[Charging Station] Lock rank updated to ${lockRank}`);
            // Build additional info message for opening hours and payment methods
            let additionalInfo = '';
            if (selectedBrandObj && selectedBrandObj.is24_7) {
              additionalInfo += '<br><b>Hours:</b> Open 24/7';
            }
            if (selectedBrandObj && selectedBrandObj.paymentMethods && selectedBrandObj.paymentMethods.length > 0) {
              const paymentDisplay = selectedBrandObj.paymentMethods.map(getPaymentMethodLabel).join(', ');
              additionalInfo += `<br><b>Payment:</b> ${paymentDisplay}`;
            }

            try {
              WazeToastr.Alerts.success(
                'Charging Station Updated',
                `<b>Network:</b> ${primaryName}<br><b>Brand:</b> ${brand}<br><b>Aliases:</b> ${aliases.length > 0 ? aliases.join(', ') : 'None'}<br><b>Lock Rank:</b> ${venue.lockRank + 1} → ${lockRank + 1}${additionalInfo}`,
                false,
                false,
                4000
              );
            } catch (e) {
              Logger.warn('WazeToastr.Alerts.success failed:', e);
            }
          } catch (err) {
            Logger.warn('[Charging Station] Lock rank update failed:', err);
            try {
              WazeToastr.Alerts.warning('Charging Station Updated', `<b>Network:</b> ${primaryName}<br><b>Brand:</b> ${brand}<br><b>Aliases:</b> ${aliases.length > 0 ? aliases.join(', ') : 'None'}<br>⚠️ Lock rank update failed`, false, false, 3000);
            } catch (e) {
              Logger.warn('WazeToastr.Alerts.warning failed:', e);
            }
          }
        }, RETRY_INJECTION_DELAY * 3);
      } else {
        const lockMessage = lockRank !== undefined && lockRank !== null ? `<br><b>Lock Rank:</b> ${lockRank + 1} (unchanged)` : '';

        // Build additional info message for opening hours and payment methods
        let additionalInfo = '';
        if (selectedBrandObj && selectedBrandObj.is24_7) {
          additionalInfo += '<br><b>Hours:</b> Open 24/7';
        }
        if (selectedBrandObj && selectedBrandObj.paymentMethods && selectedBrandObj.paymentMethods.length > 0) {
          const paymentDisplay = selectedBrandObj.paymentMethods.map(getPaymentMethodLabel).join(', ');
          additionalInfo += `<br><b>Payment:</b> ${paymentDisplay}`;
        }

        try {
          WazeToastr.Alerts.success('Charging Station Updated', `<b>Network:</b> ${primaryName}<br><b>Brand:</b> ${brand}<br><b>Aliases:</b> ${aliases.length > 0 ? aliases.join(', ') : 'None'}${lockMessage}${additionalInfo}`, false, false, 4000);
        } catch (e) {
          Logger.warn('WazeToastr.Alerts.success failed:', e);
        }
      }
    } catch (error) {
      Logger.error('[Charging Station] Error updating:', error);
      try {
        WazeToastr.Alerts.error('Charging Station Error', `Failed to update to ${primaryName}`, false, false, 3000);
      } catch (e) {
        Logger.warn('WazeToastr.Alerts.error failed:', e);
      }
    }
  }

  /**
   * Handles gas station brand button clicks (non-NOC)
   * Updates primary name, brand, website, aliases, and lock rank
   *
   * @param {Object} wmeSDK - The WME SDK instance
   * @param {string} venueId - The venue ID
   * @param {Object} venue - The venue object
   * @param {string} primaryName - The primary brand name
   * @param {string} brand - The brand value
   * @param {string} website - The website URL
   * @param {number} lockRank - The lock rank to apply
   * @param {Array} countryBrands - Array of brand objects for the country
   */
  function handleGasStationButtonClick(wmeSDK, venueId, venue, primaryName, brand, website, lockRank, countryBrands) {
    try {
      // Find the selected brand object to get its predefined aliases
      const selectedBrandObj = countryBrands ? countryBrands.find((brandObj) => brandObj.primaryName === primaryName) : null;

      // Read current name from UI first (catches unsaved typed text)
      const currentVenueName = getCurrentVenueName(venue);

      // Build aliases array following SDK best practices
      let aliases = Array.isArray(venue.aliases) ? venue.aliases.slice() : [];

      // Add current venue name to aliases if it's different from the selected primaryName
      if (currentVenueName && currentVenueName !== primaryName && !aliases.includes(currentVenueName)) {
        aliases.push(currentVenueName);
      }

      // Add predefined aliases from the brand data
      if (selectedBrandObj && Array.isArray(selectedBrandObj.aliases)) {
        selectedBrandObj.aliases.forEach((alias) => {
          if (alias && alias.trim() !== '' && !aliases.includes(alias)) {
            aliases.push(alias);
          }
        });
      }

      // Build update object with conditional property setting
      const updateObj = {
        venueId: venueId,
        name: primaryName,
        aliases: aliases,
      };

      // Only set brand if it's different from current
      if (!venue.brand || venue.brand !== brand) {
        updateObj.brand = brand;
      }

      // Only set URL if it's different from current
      if (website && (!venue.url || venue.url !== website)) {
        updateObj.url = website;
      }

      Logger.info('[Gas Station] Updating with:', updateObj);

      // Apply venue updates using SDK updateVenue method
      wmeSDK.DataModel.Venues.updateVenue(updateObj);
      Logger.info(`[Gas Station] Updated to ${primaryName}`);

      // Apply lock rank with delay to prevent conflicts
      if (lockRank !== undefined && lockRank !== null && lockRank !== venue.lockRank) {
        setTimeout(() => {
          try {
            wmeSDK.DataModel.Venues.updateVenue({ venueId: venueId, lockRank: lockRank });
            Logger.info(`[Gas Station] Lock rank updated to ${lockRank}`);
            WazeToastr.Alerts.success(
              'Gas Station Updated',
              `<b>Brand:</b> ${primaryName}<br><b>Company:</b> ${brand}<br><b>Aliases:</b> ${aliases.length > 0 ? aliases.join(', ') : 'None'}<br><b>Lock Rank:</b> ${venue.lockRank + 1} → ${lockRank + 1}`,
              false,
              false,
              3000
            );
          } catch (err) {
            Logger.warn('[Gas Station] Lock rank update failed:', err);
            WazeToastr.Alerts.warning('Gas Station Updated', `<b>Brand:</b> ${primaryName}<br><b>Company:</b> ${brand}<br><b>Aliases:</b> ${aliases.length > 0 ? aliases.join(', ') : 'None'}<br>⚠️ Lock rank update failed`, false, false, 3000);
          }
        }, RETRY_INJECTION_DELAY * 3);
      } else {
        const lockMessage = lockRank !== undefined && lockRank !== null ? `<br><b>Lock Rank:</b> ${lockRank + 1} (unchanged)` : '';
        WazeToastr.Alerts.success('Gas Station Updated', `<b>Brand:</b> ${primaryName}<br><b>Company:</b> ${brand}<br><b>Aliases:</b> ${aliases.length > 0 ? aliases.join(', ') : 'None'}${lockMessage}`, false, false, 3000);
      }
    } catch (error) {
      Logger.error('[Gas Station] Error updating:', error);
      WazeToastr.Alerts.error('Gas Station Error', `Failed to update to ${primaryName}`, false, false, 3000);
    }
  }

  function injectServicesPanel(wmeSDK) {
    // Only run if a single venue is selected
    const selection = wmeSDK.Editing.getSelection();
    if (!selection || selection.objectType !== 'venue' || !selection.ids || selection.ids.length !== 1) return;

    const venueId = selection.ids[0];
    const venue = wmeSDK.DataModel.Venues.getById({ venueId });
    if (!venue) return;

    // Don't re-inject if already present
    if ($('#poi-services-panel').length > 0) return;

    const applicableServices = getApplicableServices(venue);
    // Current services array from the venue (may be undefined)
    const currentServices = Array.isArray(venue.services) ? venue.services : [];

    // Find a good anchor in the WME edit panel (service checkboxes section or fallback to categories-control)
    let $anchor = $('.more-info-section.services-section');
    if ($anchor.length === 0) $anchor = $('.service-types-control');
    if ($anchor.length === 0) $anchor = $('.categories-control');
    if ($anchor.length === 0) return; // nowhere to inject

    // Build the icons HTML
    let iconsHtml = '';
    applicableServices.forEach((serviceId) => {
      const display = SERVICE_DISPLAY[serviceId] || { servClass: null, label: serviceId };
      const isActive = currentServices.includes(serviceId);
      const iconClass = display.servClass ? (isActive ? `${display.servClass}-active` : display.servClass) : '';
      iconsHtml += `<input type="button" class="poi-service-btn ${iconClass}" data-service-id="${serviceId}" title="${display.label}">`;
    });

    const panelHtml = `
      <div id="poi-services-panel" class="form-group">
        <label class="control-label" style="font-size:12px;font-weight:bold;margin-bottom:4px;">Services</label>
        <div class="poi-services-icons">${iconsHtml}</div>
      </div>`;

    $anchor.before(panelHtml);

    // Click handler: toggle service
    $('#poi-services-panel').on('click', '.poi-service-btn', function () {
      const serviceId = $(this).attr('data-service-id');
      const currentVenue = wmeSDK.DataModel.Venues.getById({ venueId });
      if (!currentVenue) return;

      const services = Array.isArray(currentVenue.services) ? currentVenue.services.slice() : [];
      const idx = services.indexOf(serviceId);
      if (idx === -1) {
        services.push(serviceId);
      } else {
        services.splice(idx, 1);
      }
      try {
        wmeSDK.DataModel.Venues.updateVenue({ venueId, services });
        // Update button UI to reflect new state
        const isNowActive = services.includes(serviceId);
        const display = SERVICE_DISPLAY[serviceId];
        if (display && display.servClass) {
          $(this).removeClass(`${display.servClass} ${display.servClass}-active`);
          $(this).addClass(isNowActive ? `${display.servClass}-active` : display.servClass);
        }
        const label = display ? display.label : serviceId;
        Logger.info(`Service ${serviceId} ${isNowActive ? 'added to' : 'removed from'} venue ${venueId}`);
        try {
          WazeToastr.Alerts.info('Services', `${isNowActive ? 'Added' : 'Removed'}: <b>${label}</b>`, false, false, 2000);
        } catch (e) { /* silent */ }
      } catch (error) {
        Logger.error('[Services Panel] Error updating services:', error);
      }
    });
  }

  // ========== POI TRANSLATION ==========

  /**
   * Parse the gviz JSON response from Google Sheets.

  function parseGvizJson(responseText) {
    const match = responseText.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?\s*$/);
    if (!match) throw new Error('[WME POI Shortcuts] Could not parse gviz response');
    const parsed = JSON.parse(match[1]);
    const rows = parsed.table.rows || [];
    return rows.map((row) => row.c.map((cell) => (cell ? cell.v : null)));
  }


   * Fetch a sheet from Google Sheets as gviz JSON using GM_xmlhttpRequest.

  function fetchSheetRows(sheetName) {
    return new Promise((resolve, reject) => {
      const url = `https://docs.google.com/spreadsheets/d/${POI_TRANSLATION_SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;
      GM_xmlhttpRequest({
        method: 'GET',
        url,
        onload(response) {
          if (response.status < 200 || response.status >= 300) {
            reject(new Error(`[WME POI Shortcuts] HTTP ${response.status} fetching sheet "${sheetName}"`));
            return;
          }
          try {
            resolve(parseGvizJson(response.responseText));
          } catch (e) {
            reject(e);
          }
        },
        onerror(err) {
          reject(new Error(`[WME POI Shortcuts] Network error fetching sheet "${sheetName}": ${JSON.stringify(err)}`));
        },
      });
    });
  }
   */
  /**
   * Load POI translation settings from localStorage.
   * Falls back to Nepal defaults if nothing saved.
   */
  function loadPOITranslationSettings() {
    poiTranslationActive = false;
    poiTranslationTargetLanguage = 'ne';
    poiTranslationSourceLanguage = 'auto';
    poiTranslationButtonLabel = 'ने.';
    poiTranslationLocaleName = 'Nepali';
    poiTranslationSpecialRules = [];
    try {
      const storedActive = localStorage.getItem('wme-poi-shortcuts-poi-translate-enabled');
      if (storedActive !== null) poiTranslationActive = storedActive === 'true';
      const storedLocale = localStorage.getItem('wme-poi-shortcuts-poi-translate-locale');
      if (storedLocale) {
        const found = UNIQUE_TRANSLATION_LOCALES.find(l => l.code === storedLocale);
        if (found) {
          poiTranslationTargetLanguage = found.code;
          poiTranslationButtonLabel = found.buttonLabel;
          poiTranslationLocaleName = found.name;
        }
      }
    } catch (e) { /* ignore */ }
    Logger.info(`POI Translation settings: active=${poiTranslationActive}, targetLang="${poiTranslationTargetLanguage}", localeName="${poiTranslationLocaleName}", buttonLabel="${poiTranslationButtonLabel}"`);
  }

  // Hardcoded post-translation cleanup rules (applied after any sheet-loaded rules)
  // These fix commonly mistranslated abbreviations from Google Translate:
  const HARDCODED_POST_RULES = [
    { regex: /(^|\s)मावि(?=\s|$)/g, replace: '$1माध्यमिक विद्यालय' },
  ];

  /**
   * Translate POI name to the target language (Nepali by default)
   * Uses Google Translate API with pre/post processing rules.
   */
  async function translatePOIName(text) {
    if (!text || !text.trim()) return text;

    // Apply pre-translation special rules
    let processed = text;
    let specialMatched = false;
    for (const rule of poiTranslationSpecialRules) {
      try {
        const regex = rule.regex instanceof RegExp ? rule.regex : new RegExp(rule.regex, 'gi');
        if (regex.test(processed)) {
          processed = processed.replace(regex, rule.replace);
          specialMatched = true;
        }
      } catch (e) {
        Logger.warn('Invalid regex in POI translation pre-rule:', rule, e);
      }
    }
    if (specialMatched && processed !== text) {
      // Recursively translate if special rules changed the text
      return await translatePOIName(processed);
    }

    // Simple token preservation for {...} blocks
    const tokenRegex = /({[^}]+})/g;
    const tokens = [];
    const tokenized = text.replace(tokenRegex, (m) => {
      tokens.push(m);
      return `__TOKEN_${tokens.length - 1}__`;
    });

    const hasLatin = /[A-Za-z]/.test(tokenized);
    const hasDevanagari = /[\u0900-\u097F]/.test(tokenized);
    const hasCJ = /[\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF\uAC00-\uD7AF]/.test(tokenized);

    let sourceLang = poiTranslationSourceLanguage;
    if (sourceLang === 'auto') {
      if (hasLatin && !hasDevanagari && !hasCJ) {
        sourceLang = 'en';
      } else if (hasDevanagari && !hasLatin) {
        sourceLang = poiTranslationTargetLanguage;
      }
    }

    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${poiTranslationTargetLanguage}&dt=t&q=${encodeURIComponent(tokenized)}`;
      return await new Promise((resolve) => {
        GM_xmlhttpRequest({
          method: 'GET',
          url,
          responseType: 'json',
          onload(response) {
            if (response.status < 200 || response.status >= 300) {
              Logger.error('POI Translate HTTP error:', response.status);
              resolve(text);
              return;
            }
            let res = response.response;
            if (typeof res === 'string') {
              try { res = JSON.parse(res); } catch { /* ignore */ }
            }
            let translated = Array.isArray(res) && Array.isArray(res[0])
              ? res[0].map((seg) => (Array.isArray(seg) ? seg[0] : '')).join('')
              : (res?.[0]?.[0]?.[0] ?? tokenized);

            // Restore tokens
            translated = translated.replace(/__TOKEN_(\d+)__/g, (_, i) => tokens[+i] || '');

            Logger.info(`Translation result for "${text}": "${translated}"`);

            // Apply hardcoded post-translation correction rules
            for (const rule of HARDCODED_POST_RULES) {
              try {
                const regex = rule.regex instanceof RegExp ? rule.regex : new RegExp(rule.regex, 'g');
                translated = translated.replace(regex, rule.replace);
              } catch (e) {
                Logger.warn('Invalid regex in POI translation post-rule:', rule, e);
              }
            }

            resolve(translated);
          },
          onerror() {
            Logger.error('POI Translate API network error');
            resolve(text);
          },
        });
      });
    } catch (e) {
      Logger.error('POI Translation exception:', e);
      return text;
    }
  }

  /**
   * Inject a translate button next to the POI name input field.
   * Observes the venue name input and adds a translate button that:
   * 1. Translates the current POI name to Nepali
   * 2. Adds the translated name as an alias to the venue
   */
  let poiTranslateObserver = null;

  function injectPOITranslateButton(wmeSDK) {
    // Clean up previous observer
    if (poiTranslateObserver) {
      poiTranslateObserver.disconnect();
      poiTranslateObserver = null;
    }
    $('#poi-translate-container').remove();

    // Only run if a venue is selected
    const selection = wmeSDK.Editing.getSelection();
    if (!selection || selection.objectType !== 'venue' || !selection.ids || selection.ids.length !== 1) return;

    const venueId = selection.ids[0];
    const venue = wmeSDK.DataModel.Venues.getById({ venueId });
    if (!venue) return;

    // Load translation settings from localStorage
    loadPOITranslationSettings();
    if (poiTranslationActive) {
      injectTranslateButtonIntoDOM(wmeSDK, venueId);
    }
  }

  function injectTranslateButtonIntoDOM(wmeSDK, venueId) {
    // Find the name input element
    const nameInput = document.querySelector('#venue-edit-general wz-text-input[name="name"]');
    if (!nameInput || !nameInput.shadowRoot) {
      // Retry if element not found yet
      setTimeout(() => injectTranslateButtonIntoDOM(wmeSDK, venueId), 300);
      return;
    }

    // Don't inject if already present (check inside shadow DOM, matching Road Name Helper pattern)
    if (nameInput.shadowRoot.getElementById('poi-translate-container')) return;

    const shadowInput = nameInput.shadowRoot.querySelector('input');
    if (!shadowInput) return;

    // Find the status-text-container inside the shadow DOM (matching Road Name Helper pattern)
    // WME venue edit: wz-text-input has <div class="status-text-container"><div class="length-text" dir="ltr">12 / 100</div></div>
    const statusTextContainer = nameInput.shadowRoot.querySelector('.status-text-container');
    if (!statusTextContainer) {
      Logger.warn('Could not find .status-text-container in venue name input shadow DOM');
      return;
    }

    // Create translate container — matching Road Name Helper WMERNH_container design exactly
    const container = document.createElement('div');
    container.id = 'poi-translate-container';
    container.className = 'info';

    // Build translate button HTML with inline styles (matching WMERNH_translate_btn pattern)
    const translateBtnHtml = `<button id="poi-translate-btn" title="Translate POI name and add as alias" style="margin-left:8px;display:flex;align-items:center;gap:2px;padding:2px 6px;font-size:13px;border:1px solid #bbb;border-radius:4px;cursor:pointer;background:#f0f0f0;color:#333;font-weight:bold;">
        <i class="fa fa-language" aria-hidden="true" style="font-size:14px;"></i>
        ${poiTranslationButtonLabel}
      </button>`;

    // Container inner HTML: icon div + output div + translate button (matching WMERNH_container layout)
    container.innerHTML =
      '<div class="poi-translate-icon" title="POI Translate">' +
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path fill-rule="evenodd" d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1ZM7 2.06A5.992 5.992 0 0 0 2.06 7H4.2c.1-.9.36-1.76.78-2.55.52-.98 1.2-1.82 2.02-2.39Zm2 0a6.108 6.108 0 0 1 2.02 2.4c.42.78.68 1.64.78 2.54h2.14A5.992 5.992 0 0 0 9 2.06ZM9 8c0 .7-.1 1.38-.28 2H7.28A8.26 8.26 0 0 1 7 8c0-.7.1-1.38.28-2h1.44c.18.62.28 1.3.28 2Zm-2 0c0 .7.1 1.38.28 2H5.3A6.08 6.08 0 0 1 5 8c0-.7.1-1.38.28-2h1.98A8.26 8.26 0 0 0 7 8Zm.28-4H5.72a6.068 6.068 0 0 1 1.25-1.78c.02.02.04.04.06.06.28.38.52.81.66 1.3.08.14.17.28.25.42h1.44c.08-.14.17-.28.25-.42.14-.49.38-.92.66-1.3.02-.02.04-.04.06-.06A6.068 6.068 0 0 1 10.28 4H8.72ZM8 13.94c-.82-.57-1.5-1.41-2.02-2.4A5.99 5.99 0 0 1 5.2 9H3.06A5.992 5.992 0 0 0 7 13.94ZM8.45 14A6.108 6.108 0 0 0 10.47 11.6c.42-.78.68-1.64.78-2.54h1.4A5.992 5.992 0 0 1 8.45 14Z" clip-rule="evenodd"/></svg>' +
      '</div>' +
      //'<div id="poi-translate-output">POI Translate</div>' +
      translateBtnHtml;

    // Insert at the beginning of status-text-container (matching Road Name Helper insertBefore pattern)
    statusTextContainer.insertBefore(container, statusTextContainer.firstChild);

    // Create and append Nepali suggestion span (matching WMERNH_nepali_suggestion pattern)
    const suggestionSpan = document.createElement('span');
    suggestionSpan.id = 'poi-translation-suggestion';
    suggestionSpan.style.cssText = 'margin-left:10px;color:#1565c0;font-size:0.95em;font-style:italic;';
    container.appendChild(suggestionSpan);

    // Inject CSS directly into the shadow root (matching Road Name Helper CSS pattern exactly)
    const css = [
      '.status-text-container {display: flex; flex-direction: column-reverse;}',
      '#poi-translate-container {display: flex; align-items: center; flex-grow: 1; margin-top: var(--wz-label-margin, 8px); padding: 0 2px; border-radius: 5px; background: #ffffff; color: #ffffff; gap: 5px; cursor: default; transition: background 0.25s linear, color 0.25s linear; font-size: 0.9em;}',
      '#poi-translate-output {color: #000000; white-space: pre-wrap; flex-grow: 1;}',
      '.poi-translate-icon {display: inline-flex; padding: 2px; height: 12px; background: rgba(0,0,0,0.5); border-radius: 3px; flex-shrink: 0; margin-right: 5px;}',
      '.poi-translate-icon svg {height: 100%;}',
      '#poi-translate-container.info {background: #e0f2fe; color: #e0f2fe;}',
      '#poi-translate-container.check {background: #fef3c7; color: #fef3c7; cursor: pointer;}',
      '#poi-translate-container.check:hover {background: #fde68a; color: #fde68a;}',
      '#poi-translate-container.valid {background: #d1fae5; color: #d1fae5;}'
    ].join(' ');
    const styleElement = document.createElement('style');
    styleElement.type = 'text/css';
    styleElement.textContent = css;
    nameInput.shadowRoot.appendChild(styleElement);

    const translateBtn = container.querySelector('#poi-translate-btn');

    // Show live translation suggestion as user types (debounced, matching Road Name Helper pattern)
    let suggestTimeout;
    let lastSuggestValue = '';

    async function updateTranslationSuggestion() {
      const currentValue = shadowInput.value.trim();
      if (!currentValue || !poiTranslationActive) {
        suggestionSpan.textContent = '';
        container.className = 'info';
        lastSuggestValue = '';
        return;
      }
      // Avoid duplicate requests for same value
      if (currentValue === lastSuggestValue) return;
      lastSuggestValue = currentValue;
      suggestionSpan.textContent = 'Translating...';
      container.className = 'check';
      const translated = await translatePOIName(currentValue);
      Logger.info(`Suggestion for "${currentValue}": "${translated}"`);
      if (translated && translated !== currentValue) {
        suggestionSpan.textContent = translated;
        container.className = 'valid';
      } else {
        suggestionSpan.textContent = '';
        container.className = 'info';
      }
    }

    shadowInput.addEventListener('input', () => {
      clearTimeout(suggestTimeout);
      suggestTimeout = setTimeout(updateTranslationSuggestion, 350);
    });
    // Initial suggestion
    updateTranslationSuggestion();

    // Translate button click handler
    translateBtn.addEventListener('click', async function () {
      const currentValue = shadowInput.value.trim();
      if (!currentValue) return;

      // Reuse the already-translated text from the suggestion span if available
      const cachedSuggestion = suggestionSpan.textContent.trim();
      let translated;
      if (cachedSuggestion && cachedSuggestion !== 'Translating...' && cachedSuggestion !== currentValue) {
        translated = cachedSuggestion;
      } else {
        this.disabled = true;
        this.textContent = 'Translating...';
        translated = await translatePOIName(currentValue);
        this.innerHTML = `<i class="fa fa-language" aria-hidden="true" style="font-size:14px;"></i> ${poiTranslationButtonLabel}`;
        this.disabled = false;
      }
      Logger.info(`Button click: adding translation "${translated}" for "${currentValue}"`);

      if (!translated || translated === currentValue) {
        WazeToastr.Alerts.info('POI Translate', 'Translation unavailable or same as original.', false, false, 2000);
        return;
      }

      // Add translated name as an alias using WME SDK
      try {
        const currentVenue = wmeSDK.DataModel.Venues.getById({ venueId });
        if (!currentVenue) {
          WazeToastr.Alerts.error('POI Translate', 'Venue not found.', false, false, 2000);
          return;
        }

        const aliases = Array.isArray(currentVenue.aliases) ? [...currentVenue.aliases] : [];

        // Read the current primary name from the UI input first (catches unsaved typed text),
        // falling back to the SDK model. This MUST be passed along with aliases in the update,
        // otherwise WME clears the primary name field.
        const currentName = getCurrentVenueName(currentVenue);

        // Check if translated name already exists as an alias or primary name
        if (aliases.some((a) => a.toLowerCase() === translated.toLowerCase()) ||
            (currentName && currentName.toLowerCase() === translated.toLowerCase())) {
          WazeToastr.Alerts.info('POI Translate', `"${translated}" already exists as a name for this venue.`, false, false, 2000);
          return;
        }

        // Add the translation as a new alias, preserving the current primary name
        aliases.push(translated);
        await wmeSDK.DataModel.Venues.updateVenue({ venueId, name: currentName, aliases });
        Logger.info(`Added ${poiTranslationLocaleName} alias "${translated}" to venue ${venueId}`);
        WazeToastr.Alerts.success('POI Translate', `Added ${poiTranslationLocaleName} alias: "${translated}"`, false, false, 3000);
      } catch (err) {
        Logger.error('Failed to add translated alias:', err);
        WazeToastr.Alerts.error('POI Translate', `Failed to add alias: ${err.message}`, false, false, 3000);
      }
    });
  }

  function injectButtonStation(wmeSDK) {
    // Only run if a venue is selected
    const selection = wmeSDK.Editing.getSelection();
    if (!selection || selection.objectType !== 'venue' || !selection.ids || selection.ids.length !== 1) return;

    const venueId = selection.ids[0];
    const venue = wmeSDK.DataModel.Venues.getById({ venueId });
    const topCountry = wmeSDK.DataModel.Countries.getTopCountry();
    const gasStationKey = getGasStationCategoryKey();
    const chargingStationKey = getChargingStationCategoryKey();

    // Check if venue.categories (array) contains the gas station or charging station key and country is Nepal or Pakistan
    const isNepal = !!topCountry && (topCountry.name === 'Nepal' || topCountry.code === 'NP');
    const isIndia = !!topCountry && (topCountry.name === 'India' || topCountry.code === 'IN');
    const isPakistan = !!topCountry && (topCountry.name === 'Pakistan' || topCountry.code === 'PK');
    const isGasStation = !!venue && Array.isArray(venue.categories) && venue.categories.includes(gasStationKey);
    const isChargingStation = !!venue && Array.isArray(venue.categories) && venue.categories.includes(chargingStationKey);

    // Only show buttons for Nepal gas/charging stations or Pakistan gas stations
    if (!((isGasStation || isChargingStation) && isNepal) && !(isGasStation && isIndia) && !(isGasStation && isPakistan)) return;

    // Show brand buttons for Nepal and Pakistan gas stations, and Nepal charging stations
    function tryInjectBrandButtons(attemptCount = 0) {
      if (attemptCount >= MAX_RETRY_ATTEMPTS) {
        Logger.warn('Max retry attempts reached for brand button injection');
        return;
      }

      const $catControl = $('.categories-control');
      if ($catControl.length === 0) {
        setTimeout(() => tryInjectBrandButtons(attemptCount + 1), BRAND_BUTTON_RETRY_DELAY);
        return;
      }
      // Prevent duplicate buttons
      if ($('.gas-station-brand-btn, .charging-station-brand-btn').length > 0) return;

      // Determine which type of station and get relevant brands
      let countryBrands = null;
      let stationTypeName = '';
      let buttonClass = '';
      let categoryKey = '';

      if (isGasStation) {
        stationTypeName = 'Gas Station';
        buttonClass = 'gas-station-brand-btn';
        categoryKey = gasStationKey;
        if (isNepal) {
          countryBrands = GAS_STATION_BRANDNAME.Nepal.brandnames;
        } else if (isIndia) {
          countryBrands = GAS_STATION_BRANDNAME.India.brandnames;
        } else if (isPakistan) {
          countryBrands = GAS_STATION_BRANDNAME.Pakistan.brandnames;
        }
      } else if (isChargingStation && isNepal) {
        stationTypeName = 'Charging Station';
        buttonClass = 'charging-station-brand-btn';
        categoryKey = chargingStationKey;
        countryBrands = CHARGING_STATION_BRANDNAME.Nepal.brandnames;
      }

      if (!countryBrands) return;

      // Build buttons for each brand
      let buttonsHtml = `<div class='form-group e85 e85-e85-14'><label class='control-label'>Set ${stationTypeName} Brand</label>`;
      countryBrands.forEach((brandObj) => {
      const btnLabel = brandObj.buttonLabel || brandObj.primaryName;
      buttonsHtml += `<button class='waze-btn waze-btn-small waze-btn-white e85 ${buttonClass}' style='border:1px solid #0078d7;border-radius:4px;margin:2px;padding:4px 8px;font-size:11px;min-width:32px;' data-primary='${brandObj.primaryName}' data-brand='${brandObj.brand}' data-website='${brandObj.website || ''}' data-category='${categoryKey}'>${btnLabel}</button> `;
      });
      buttonsHtml += `</div>`;
      $catControl.after(buttonsHtml);

      // Button click handler for both gas station and charging station brands
      $('.gas-station-brand-btn, .charging-station-brand-btn').on('click', function () {
        const primaryName = $(this).attr('data-primary');
        const brand = $(this).attr('data-brand');
        const website = $(this).attr('data-website');
        const categoryKey = $(this).attr('data-category');
        const isChargingStationBtn = $(this).hasClass('charging-station-brand-btn');

        // Read lockRank for the station category from localStorage config
        let lockRank = null;
        let config = {};
        try {
          config = JSON.parse(localStorage.getItem('wme-poi-shortcuts-config') || '{}');
        } catch (e) {
          config = {};
        }
        let foundConfig = false;
        for (let i = 1; i <= 10; i++) {
          if (config[i] && config[i].category === categoryKey) {
            lockRank = parseInt(config[i].lock, 10);
            foundConfig = true;
            break;
          }
        }
        if (!foundConfig || isNaN(lockRank)) {
          lockRank = venue.lockRank && !isNaN(venue.lockRank) ? venue.lockRank : 1;
        }

        // Special handling for NOC button in Nepal
        if (primaryName === 'NOC' && isNepal && isGasStation) {
          handleNOCButtonClick(wmeSDK, venueId, venue, lockRank);
          return; // Exit early for NOC
        }

        // Handle charging station or regular gas station brand updates
        if (isChargingStationBtn) {
          handleChargingStationButtonClick(wmeSDK, venueId, venue, primaryName, brand, website, lockRank, countryBrands);
        } else {
          handleGasStationButtonClick(wmeSDK, venueId, venue, primaryName, brand, website, lockRank, countryBrands);
        }
      });
    }
    tryInjectBrandButtons();
  }

  async function registerSidebarScriptTab(wmeSDK) {
    // Register a script tab in the Scripts sidebar
    try {
      const { tabLabel, tabPane } = await wmeSDK.Sidebar.registerScriptTab();
      // Add label/icon to the tab
      tabLabel.innerHTML = '<span style="display:flex;align-items:center;"><span style="font-size:16px;margin-right:4px;">⭐</span>POI Shortcuts</span>';
      // Use buildAllItemOptions to show all 10 dropdowns with script info header
      tabPane.innerHTML = `
        <div id='wme-poi-shortcuts-content'>
          <div style="padding: 8px 16px; background: #f5f5f5; border-bottom: 1px solid #ddd; margin-bottom: 10px;">
            <div style="font-weight: bold; font-size: 14px; color: #333;">${scriptName}</div>
            <div style="font-size: 12px; color: #666;">${scriptVersion}</div>
          </div>
          ${buildAllItemOptions()}
        </div>`;
      // Add event listeners for GLE controls
      setTimeout(() => {
        const cbEnableGLE = document.getElementById('_cbEnableGLE');
        if (cbEnableGLE) {
          // Restore checkbox state from localStorage
          cbEnableGLE.checked = !!gleEnabled;
          cbEnableGLE.addEventListener('change', function () {
            // Save state to localStorage
            localStorage.setItem('wme-poi-shortcuts-gle-enabled', JSON.stringify(this.checked));
            if (this.checked) {
              // Enable GLE functionality
              if (GLE && typeof GLE.enable === 'function') {
                GLE.enable();
              }
            } else {
              // Disable GLE functionality completely
              if (GLE && typeof GLE.disable === 'function') {
                GLE.disable();
              }
              // Force map refresh to remove lingering highlights
              setTimeout(() => {
                if (typeof W !== 'undefined' && W.map && W.map.getOLMap()) {
                  const olMap = W.map.getOLMap();
                  if (olMap && typeof olMap.redraw === 'function') {
                    olMap.redraw();
                  }
                }
              }, 100);
            }
            // Update GLE enabled state
            if (GLE) {
              GLE.enabled = this.checked;
            }
          });
        }

        // Add event listener for Open Edit Address on RPP checkbox
        const cbOpenEditAddressRPP = document.getElementById('_cbOpenEditAddressRPP');
        if (cbOpenEditAddressRPP) {
          // Restore checkbox state from localStorage
          cbOpenEditAddressRPP.checked = !!openEditAddressOnRPP;
          cbOpenEditAddressRPP.addEventListener('change', function () {
            // Save state to localStorage
            openEditAddressOnRPP = this.checked;
            localStorage.setItem('wme-poi-shortcuts-open-edit-address-rpp', JSON.stringify(this.checked));
            Logger.info(`Open edit address on RPP setting ${this.checked ? 'enabled' : 'disabled'}`);
          });
        }

        // Add event listener for School Zone Speed Limit input
        const inputSchoolZoneSpeedLimit = document.getElementById('_inputSchoolZoneSpeedLimit');
        if (inputSchoolZoneSpeedLimit) {
          // Restore value from localStorage
          inputSchoolZoneSpeedLimit.value = schoolZoneSpeedLimit;
          inputSchoolZoneSpeedLimit.addEventListener('change', function () {
            const newLimit = parseInt(this.value, 10);
            if (!isNaN(newLimit) && newLimit > 0 && newLimit <= 100) {
              schoolZoneSpeedLimit = newLimit;
              localStorage.setItem('wme-poi-shortcuts-school-zone-speed-limit', newLimit.toString());
              Logger.info(`School zone speed limit set to ${newLimit}`);
            } else {
              // Restore previous valid value if invalid input
              this.value = schoolZoneSpeedLimit;
              Logger.warn('Invalid school zone speed limit. Must be between 1 and 100.');
            }
          });
        }

        // Add event listener for School Zone Width input
        const inputSchoolZoneWidth = document.getElementById('_inputSchoolZoneWidth');
        if (inputSchoolZoneWidth) {
          // Restore value from localStorage
          inputSchoolZoneWidth.value = schoolZoneWidth;
          inputSchoolZoneWidth.addEventListener('change', function () {
            const newWidth = parseInt(this.value, 10);
            if (!isNaN(newWidth) && newWidth > 0 && newWidth <= 200) {
              schoolZoneWidth = newWidth;
              localStorage.setItem('wme-poi-shortcuts-school-zone-width', newWidth.toString());
              Logger.info(`School zone line width set to ${newWidth}`);
            } else {
              // Restore previous valid value if invalid input
              this.value = schoolZoneWidth;
              Logger.warn('Invalid school zone width. Must be between 1 and 200.');
            }
          });
        }

        // Add event listener for POI Translate checkbox
        const cbEnablePOITranslate = document.getElementById('_cbEnablePOITranslate');
        if (cbEnablePOITranslate) {
          cbEnablePOITranslate.checked = !!poiTranslationActive;
          cbEnablePOITranslate.addEventListener('change', function () {
            poiTranslationActive = this.checked;
            localStorage.setItem('wme-poi-shortcuts-poi-translate-enabled', JSON.stringify(this.checked));
            Logger.info(`POI Translate ${this.checked ? 'enabled' : 'disabled'}`);
            // Hide/show the translate button based on setting
            const translateContainer = document.getElementById('poi-translate-container');
            if (translateContainer) {
              translateContainer.style.display = this.checked ? 'flex' : 'none';
            }
          });
        }

        // Add event listener for POI Translate locale dropdown
        const selPOITranslateLocale = document.getElementById('_selPOITranslateLocale');
        if (selPOITranslateLocale) {
          selPOITranslateLocale.addEventListener('change', function () {
            const code = this.value;
            const found = UNIQUE_TRANSLATION_LOCALES.find(l => l.code === code);
            if (found) {
              poiTranslationTargetLanguage = found.code;
              poiTranslationButtonLabel = found.buttonLabel;
              poiTranslationLocaleName = found.name;
              localStorage.setItem('wme-poi-shortcuts-poi-translate-locale', code);
              Logger.info(`POI Translate locale set to: ${code} (${poiTranslationLocaleName})`);
            }
          });
        }
      }, 0);
    } catch (e) {
      console.error('Failed to register POI Shortcuts script tab:', e);
    }
  }


  function appendServiceButtonIconCss() {
    const cssArray = [
      '.serv-airportshuttle { width: 50px; height: 50px; display: inline-block; background: transparent url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAD4UlEQVR4AeyZv28TMRTHk0xMCITK0GQoE1IRvwRSxdZOSPzoxgCCCgkGBkBCdG/yB8AAAhZ+FJBgYCuVADG0AwKGMjDAgJDokJQfFSxMCNTyeW6cni93ZzuXSwMKel/es/3es79nn89xC7n/5F+PSLdNZG9GejOS0RPwXVo7isXihVKp9AA9kxHukPcMfPcAZ/EhcoIO3pL58vLy8lH0cEY4Sd4b9DXX399/BdtJnIiQdArcc8rYRqd8Pn+O2b/qktJKBAIXSXQYaPmB8YROKlmA3PfBV6CE2T+LMQYSxUqE6ONACUlv1mq1IXCgWq2WswC5x8BuOmysAB7mOOVEsRHZQPQuoGRhYeE5xkeQtXxmtl8EOtmOvRHEio1IgwQZFlmvg6As4EWcEO0CH1+dj/6K4DvQslMbUdpGJBjTx9Ka0OCJlbVt0z6+wVx0vgk4iSZSYh3KzvSJqEOg22WU8c6BGQbaB3KayD4KsjMN0Ji0Q8zi10nQXbMwxv3UygdzmGV7BHuFCOtymxTqUAzrtqHYTUY6CaNzszCoi4VCYbPYekbE/qfRI9Jt06dmhC/0u8DAFgO2YfKSJZ14295mdG4W3uvi0tLSN7EVEYxX4DGY52VuHA0ohyWrE29c3nD/qswYn2G8AbOcNh6hV3YtjCqNo2AL9jTodplirHvBCANVK0jPCGW78IVOdeLlq10O54iq0z72Ea16eBHhXUp14mUZVMI5ouq0z+ow7ZYXEXu6tfNoFxE5MhxsgYbEyYveQqgZkpoIW/JL8BRMg9dm+vgSvjpObdvxnm4taYmU6EYOnCglQ/w/AGwSjpNZUYc/W2Bce1oifyIS/46oC1dFxaltNOzoWk5L5Atb5S3dGfZt7BqwSTjuGgHy8wDVmqQlkmOrPM2HaZ0A+5TrMPDVceux5abENTTSLzWRetZfaAHKSyTmp1dEjHO7iMSk71y1FxF+SaobFJvm56fzDUtSLp/H4EWEc1HjFiXJ5qV3vmFJypMZEZ/Enfb1mhGedNPpNzDg2aj2YB1P3zj9EtvYcoN+2qbdWbyIsE2GT7+NgUiPEe2Gf/ikKzFBhOODbTbbi4gt2Vq2+xKRM1EQ7R67zq21c34bEVk68zobJ1Z1Ug1q3caX/bq2XTUxd7Uv789EMK/Yug0tY5CxYEaLjUiOzirRoU216hKgqTa5YpJmuURAxYvLGKxESD9Joq3oS0CeigF2mPO052lrSYiVS4RjBBt5pUzuCu1yISKEqYoXFyIS/YGE46Dp7pedxulvfJIkAQ9jcpeJkWWFShZXIslZuqC1R6QLJsEYQm9GjMfRBYW/AAAA///d8GdKAAAABklEQVQDAOjZlZI1xoAxAAAAAElFTkSuQmCC) center/contain no-repeat; }',
      '.serv-airportshuttle-active { width: 50px; height: 50px; display: inline-block; background: transparent url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAECElEQVR4AexZO28TQRDeTWG7QiAEDSlChRTES4kU0YUitsQjHQUIIiRQLgUgIdIn+QFQgIA44hFAgoIuRILYRVIgoEgKCigQEilAPCJoaGKDsnyz9lp7l3vs+uz4QLbm887uzszOd3ser88d7D95tYkkbSPbO9LekSZdAdtba282v3opN1V6NDBVnm8GcpOle7nJ8gj49gDGYkPkdDZfesMYvyoEO8GF6G8GBGdnBBe3sNZidqp8jRm+jIgg6AzwwDBm48yEuDCQL183CRhJJJdfvYxAxwAlP6E8AyaaAcHYQ8b4N1Z9cSbOQx0CQiWSiGD8lIqAoLcLTroPOAyMNwNFJz1UcFIHGGe1OwB3w6jKIaiNIrIZjvsBKXNOpgjlA9Bs+cIZf6Etsgf6FiBQoojUSDAmVnBluoHxKsaqreqHtTa2Mo4QYgey/gEo2acUvzaKiObDt6EzpmFc0/VxP93GVvffijWMRBHpxNWlyvQRXkeBpMsg8l2k7zEkSheYKSIHMUCVqQsGgRVCcL6wkUBOvpKdXM1hooe+x/Bdcxx6hQiS300dAhKVDEn3ojicOrSR8K6v+qKjo1vpTIjtpKsdIf2fRptI0rZP7kjBSb9VieEDtKJ0b0tVIgQNPw1711d9vrb2TumM8++kSyJQXgFPgWWQqh0N0HcJSDblxBsU17W41imMZObQXUJhWigMp55Ar1QtKJ9AYBDYCX0WSLrMINdeqqBIVN5BakfQN5K4J176hvfG8BtTNkZJkZEVEVyFuCfeCZ8YfmNyHUrQFFZETIO2wq5RROjIcKQOAuTXX4ffOpfYRHC8eQk8B2aB1+tWCBiArfKTZTvAzHg4LpFOrEQHTjRS+vDeBUSJy4/KLxzk4Q9tXRKXyB+fVX/7jHmH/PxkGfUamvbjEvnKuLijLXYX+mcgSlx++Fl7Aw4LQN0SlwgrDGfOoaRmqjhrmonmt2nOSdGTElNXX7vYRKpRS2gJaKyEfH5ZeQQYN4pIQPiNG7YigpIpn3AYtGMGNpGxbC6DFREE1p9whOl0fgqbN53DkmZiS8QsagusbImoU6neyrTptwEUfdxPp52qjVd94CalNo6e0qGaiRURlFh5KtVaV+3Xxr12qu866XpT9Pp758P6VkTCArV6zpYInVR1NDp/FVu1xvGjiNCts6yioaTOe6Hm8LPzptJNW/jc12ypZLvia3OUA+WiDbnVKCIM9y198Nxe/j35EMB/KnB0GjNLQKiY5BBJBCtMI9Au/OFzhaqMF3hkeRHzHHZ1CXx7gZPeuNRHQCoO9ECECKMbLCZEyPt90UmN4lZY9+wXj2aM/uOjICF47BvbSVO5ptsqxLUyZUqkYp3g9zaRpG1Oe0eStiN/AQAA//+zXvm6AAAABklEQVQDAD4ni5Jd4gdxAAAAAElFTkSuQmCC) center/contain no-repeat; }',
      '.serv-carwash { width: 50px; height: 50px; display: inline-block; background: transparent url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAEz0lEQVR4AeyZP4hdRRTG71osEgisJDb71koMUUkRiEhMikgIBBuLsIIQg1hIEC22EMHG3SqxSEgjKWx0IYImELGxCEEtJGBjEyFC0Oa9t80SkjIQdvP7bs7czBvuezP3byBkOd+dc87MnHO+uffN/bPPZU/JX9dEnmedPjBIR+1GuiSydzAYXBsMBuuGa1DYCzqRrogcp/gbVHwYODlsvuPO0WbbOhGKPQ1+pcgFEMqC+sDpsKOp3SqRpaWlLyjoIvDlSwyBppCLNrZwNFXaJLK8vb191i9obm7u49FodEaQ7vfZ2GXf10Rvi8gyl8tPfiEU/+JwOPzW+aTL52y1NqcVMm0QKSPxAoVuglA2IaO+wt8WmaZEjlkhRWEU+grGXTBN7tqYot9iHCscNZQmRHZTwNd+Tgp8C/s2iMltG1uMs1i7C0dFpTYRdh2R2O/yUdi76Lp30CTJDZvjBu+3mM6u1NYisri4+Cm7zkdeJm2vv3h2qqo5mpuPV0zFzo2KhzpEDrGV6mzkqUh+lZU9kxs1DpqrGG6qxT7k7NS2MhGuZa3gDkswGo/Hss2s11iMkc3eYTnMTGuqEtGe/44LzWqKxC1nN2hvWSwXQjmUy9nRthIRVuoTF5FL4Bv0ddCWrFvMPJ6fK3dEDlWIfEisI0CyyZ164nFEzqawmO5GqlzKmRQ2mYi/Qqzcd0QfgrZlaLHzuH7O3DHjkErkBDHeAJIHrNz3UrqAxX5gsZVTuc2c3iQR4UblB/uBcDdBKG3Ziq0cebwgd+4rO6QQ2ck+XxBhd/m5LFCbPj+H5d4Zix8lwnX6PkHmgURb7VUpHUM5lEtp5q0G6VMRJcJMEaHJMn6IP3KqV/uAcmWP/4oaHrsmtRQiAzeF0/xVn3B5aYsa0EulEpHSCP04GxPR25x7rtKltcYprw3O5mo4v8znxnhrpBpUi+eaVGNnZGIl2ONXm4CHw7VwfpnPjZksNZuoJejLYkS0EuGcJ2XPrCVG5N+gaj3/9Ak/fViL3xc9I/cYvQFyYT//rU/kSR8dVINqeWSVHGNnRFNmroQG9IBoDVEi7CB/eIX+jt4nSJdpt/RryMr+okTYQf7yJh7hOegUeLtjnCKnfos0WRbUkPvCQ5QIE/4GhfCV4/PC6EgpyTFRQ1naFCL6oZ1zk7nUPnN6V22QQ7lVw8x0KUQyLqNzBP/fRWLn2u4SLo9yKrezZ7VJRAiwsbW1pZVB7U8sZ/RsqKJUIhmPEvpqclmTesJly5mULpmIonGa36MNPzroG+5R+uZq4igxw2/GQ2IpF11pUomIQpLgJVr39oaaHeT3ch2cx6jyNV1f888z7zrzDgIn+linHM5OaisTUVTIvEp7AfiyQlF/8vao/yPqHf81v9N0+U5ojMbiWwG+XLDYvi9Jr0VEkUm4wq6yhj4GTvbwfnGWIq+Af8B97gk3BelAvisaw4Q9wMlYsRTTOaq2tYkoEXfcVZIfUBHYPiHMXObpe13Ach8wUAtxBA4oVuGtoTQiYvk2VASE9oGTrPYl/HfANLmjMRoL9mkuA5O2WMZNlTaIuOAq/hJb5kkK3AUWwMvgTYN0+XZpDJNihBmSLm0SCbPq/eE/nHroFKTLh6t96ZJI+9XOiPiMyIzFeSJdDwEAAP//kXRIQgAAAAZJREFUAwDBxSiSrKvqZAAAAABJRU5ErkJggg==) center/contain no-repeat; }',
      '.serv-carwash-active { width: 50px; height: 50px; display: inline-block; background: transparent url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAE8UlEQVR4AexZQYgcRRT95WEmBAIrWU/iSZSoeBAiEuMhEnYnePGwrCDEEHLYCaKHHETIxc3J5KDkImbWiy5EiAlEcpHMIupBFrx4WSFCSC6b7GUJyS2zBCrvVVd1upveqeru6lkIWf7r+v9X1fv/9cx0ujvPyVPy17aQXThPn1jQh9uOtSlkX2/wcGV2MFom6EPCPqAVa0vIETS/qkW957qmzxziI0B0iy6kd2HrJBr+DZ1OAUWb4hzXFCeaxlGF9C6MvtRKf59rSslpITJJruHaTKqxG1PIvFZyNtuRUmphuND9mqCfnbNr57O5Jn4sIfP4yvySbWTY775wfaHzg8vRZ87FHO2eKGJiCCkT8Twa3QSKtgkxnEvzscQ0FTJjG0kbQ6OvILgPbGf37Zp03nLMpIkaThMh073B6Fy2Jhp8F/FNwGc37dp0neWaThMVndpCcBbPaZG3XD009iH8VSDUVu0es55c5DRBjUMtIb3Bw89Q6wSQWHJ5vZYElY7XJNnrNp2w3C4OHusIOahFPflKabnKy2twxcJCsxccLm25D7o4dKwsZHZpdBrkuwHaneHJLmP6tWE57liC3baGDcOGqkLmRcsHjhrfcYq44eIG4w3LlVAkNSr9+1JJyMzS1qdJJcFXW30nIstALFtWYjgNX7aWSXgOVYQcV1ofIp8SvXm938ndjjDfFOQkN3lsreP0QxAsZGYwSj8NrdWPIF8HYtu65Ta82ZomMeYQKmROibxteR7hx/mT9aMPlvsRiW3NOfo+BAnpLY2ekCn5GaRrQNFixWv4AbKG4cvVNpnyQ4iQPVpLKgTX/V/LqeJlszVs7T0+dq+Q2cHWxyDpADReaq/SaRmswVos07E90N8WXiF4AKIQR3AJ90OLkwAKXgKMFXowueLBKwSXwRczm76CP0mgnEihByn78wrBpqwQhDti3h58Qvg05+6rqOAMDk2wWLK/LOdqYLkx9sBeTFB28AnJnQncDy02xJmS/WU5U6fQcK6Xwpz4hPBMFPfsVDy2F5+Q/wtd815rksiWL/aSnfN+Ig+wegMwhsvuH5OEKZoc2AN7SaKSo+8TEa3U2DNRwhk9FdKDVwiu4X+5zkD45yTh6mZ7cLni6BWCq8w/bhMID60sdI4B77eMY6zl6mZ7cLni6BWCDf8Cqc0ubX2RBi05JTVyPZSVDRGyoUV9k27W+vPUb8vJ1LC1+WMfWy1EiKz0OxRy2zHhyqXbhKuD8batDXe8BQkBBT4VTTFwJ2daTE3vp8GOQoXgU9nFtyaXuWlCuLzSNzWDygULIRuuHh9hLL504Dvcw5hTNXEYnMV3xuvgYi1MhVklIaREgZcwuqc3uHIAv5ff8RT3LYIqb9OnuYd7se8A4Iwv61jDxUFjZSFkhZjXRNR5yf3pU73B6G/7f4N8xn89N50EzM1xDdeK6FNJ2h3V+YTbxeFjLSGkH/Y7bILPDXcZE1rkVa3kLM7yFeA/YASsWdBn7grXcC33WJADt/OG06aqDbWFsMyw3+Vzw374OUGInfGlxRsICPpwc2YFdPeTKzdTMWgkxNbaYBPAm8BR0XIR+XvAdnaPa7gW4J5FLAy6xGLdthZDiCNn8xfxpvAoGtwLTAEvA+9Y0GduL9dgk08wloRbTCHFqnx+uIUkbzoJ+swhFd/aFBK/2zGMz4SMOTk7MvUYAAD//4gLCk0AAAAGSURBVAMAlZ4AktVwHWoAAAAASUVORK5CYII=) center/contain no-repeat; }',
      '.serv-carpool { width: 50px; height: 50px; display: inline-block; background: transparent url(data:image/png;base64,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) center/contain no-repeat; }',
      '.serv-carpool-active { width: 50px; height: 50px; display: inline-block; background: transparent url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAHC0lEQVR4AeyZf4hUVRTH7+2PmQX7DRL91DRSsz8kiVL6YcW+0X5hkUWllRozJhWlaRTBblAWaj9IpH1TZoVaYKKmqDsmaWRW2C9JS/pBv5UyNYOYGYPb57yZ+/bO+N7uzOwuRO1yvu+ce+65555z73333jd7lPqP/PUl8m+byL4Z6ZuRXhqBvqXVSwPbsNv/3YwkGaprU37+Ps8vtAoop8CxoKfoeByNF98BssXplK8C0jesc+pyRnDakvILO+CrjdLP4K5FQHkD+AK0Uq6pM+yiKCE+wE6wEoPAvzJmIeW15b6lD6riqdNEcPQ5TVuNUmfDo+gUlC3N2eIG+CBQLw30ssW1NJLgxRdiJZX7biGWnytrKkuxidDwTUyHA0sFbdTLSqlHy9gPD0gbM4ZkFgWFOh60WczINztN/kAO/Btt2pDzwNIpnl982haqeVwiEzC8BgQkTnOZ5ND2acnJ8NYyhlC5HAQkyZB8l0sgMOYhttIG0dJy/A4Dgf+N6aa7kGWWX7IGSpn7kSU2WCVFJkIn0qBsabLilMJ3wKV9dHQjijXA0lgrdMWN1pc6NmvKvvY4OhH3oJ9KAlkpCCpjE00JUYmcQdUoEFAu0xQ6CRRVDzpy6y+oqo4turNR5eOINlUxSGwDq42iEpHptHYyCx/ZQgyXl9VO/wcxNlHqnYFS6wVw8QGLJYnhB6e2pkRCe6ZfEgnLcQIjOhUMBxfG2VTrsT0XDM2lE/dW10WVieXbKL3VRc3Ir7ayPP0n2nIXfFdM/VD0Z4Eo2h2ljND1L8diqw5awfKoRCSg0rRj1dyWvwNWD/Vv9ovzvbbiJl7MA0AOza/gv4N1YC7OzgQ1U8rP3+QYf438KaigqETE4A15CLTWc+AjQVck9WMI9D2tzEylzeUo5NoBC0hmdhzSLM8vboPfCWqhkUbpeY7hEkcOxchEWLs+Ft8AoSTBbff8vOjGo3CDo1giTujnPL/wNqW4ZUSVJXMSti+ksoVlVhPBx3n06fmF7dQ1AaGdxObukqILEJkINbJ/V42YTuN0JfjeowNsQkr5hcc5oe8JFUr9QofjgWwAx8GPBXLY3YDNARCQMepmhIql6xE4MGCdUjqtnD98yLlVfdYEFnGJnEpwsgwKgVXlgxtvRQfDjFIPWxOW1bt0KO/AanTyvh2C/wm+BCuoO00r9QlyQAS8GOFkYCluGRdS2SKHozrdGrr8iEQ8rs8430JwszGMutVKYHIfolopr43ZCKTSoz3TdDFSEcTRX+2Z5HluJf09Zstaq9esXMWTxpgZ2G5O+fm7q+pURSIYzGSJLMRoMLD0McKTjOQoMAD0B/ZO1U9pdR31JdJmVkmo5akzjtUU5H5AtaeTt+Bfg9PBaKWD2ZbNQaoFg4zSC0jIxiC6ikSmYDA/0JYe8mJNxNlI8BCq94Gcru5os8zQlimXbgp3u7IqluUyiU1VlcdVlX+ivC2XTj6RyyRHg4mUw2MBWa72YTJ2Rs4hw45ruFbraHgJxktBZ+R2/iOGNd0EsBOSXdH9xnB9SX01lpZjCm/cGLQA2TDCGRmAwtJnjMLtFMLvDeQ4cjsPbwRxxhH63xyd68tRV4j7SUZ2LjeZv8XCzsh6dhuu7vpZDGW32ieVNcAdUdltKpZaF+3lPBrh2Ox15E5FYiQZk4VPxjBIyiai2G1IIkEyKnKfpkEUyTre4VRc4chdiRc5BrI117MsFVd72SzkizVwEyYSlBp66PCl5T1zrxKdesP2EWvAF+hmKzfKu51ILpNwt8bBBBjuJHFBYSMvafgRxhfoljjbWvXdToSOZI26M9HiZQuvoJcvTVgFDfHa8u+gCZPVWssPCq+j6xb1RCKs1yS3ANNxmTPqNkZ9V7Nf+NDL5l9szuafp7wVbFday8lfClqbRe3pxMxSoXvPHklEQii/fDI7UhT04051vjJ6qjZ6GorR4GhgaTkHaNXF1FbVz3sqkasZbUP3kT/VoI+iCeU2k6Iq69V1OxGWzwoCcn8SkhgOa6PaEZYYpZ+Cz6MsW+V65MMgJNq+CsQ21DUidCsRAjjE8rne6Xgv5bm5THIEP+aNhU/amEk8AJ9NWX7cuxJ5hNjQxj0APc/PN3IzwE2JGk4k5RffwsUxwNIyghzFFf1BFPIdAoukXWKD7Rg+h7d2WOj+7Ghy8+5Q1SE1lIjXVphjlHFPcbnm30q/9ZzOu3nZOd2d3U7r6XxKyLcGruqjRhLxlFZyrbc9rWJ03bLV18TLu90qa8w7JT/YyX3PqmridSfi+QXZRq3zgyTR8WFltXXyso/wtyr6CE/9Wl3VnQidtir+4cMvf5uRT1A99Ce+xKdsBMj0UZ/juhMR97lMYsbGdOIykXsS4lM2gkZ8NpRIIx31dpu+RHp7hOv13zcj9Y5Yb9v/AwAA///7KBbeAAAABklEQVQDABkCVYMrityeAAAAAElFTkSuQmCC) center/contain no-repeat; }',
      '.serv-covered { width: 50px; height: 50px; display: inline-block; background: transparent url(data:image/png;base64,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) center/contain no-repeat; }',
      '.serv-covered-active { width: 50px; height: 50px; display: inline-block; background: transparent url(data:image/png;base64,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) center/contain no-repeat; }',
      '.serv-ev { width: 50px; height: 50px; display: inline-block; background: transparent url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAADrUlEQVR4AeyYPWgUQRTH764OYuVH7kQbG6OViAQCKtiJwU/8AgkBm1gpErDKpdKgxEosLAIGNNgEQQkIkthYSARRtBHB4u7sRDQIFhJ//8nNMnfZHHvZmVwu3PH++97M3r55/3nztZvLbJBfh8h6S2QnI52MBOqBZodWvlAojIHpfD4/mxIT+Cn64tUMkX4Cf7e4uDgMThDA4ZQYwM8IPt/ipwBSSWIiNHiNlrYC33IA39fTOk1K5BgNKQMoI5PZbHY0mw5PjKelizpp15K57LqJITgG2fvc2QNiJRGR7u7unc7TM+Vy+XKpVCqmxEV8/gFW3I6yddK9DMFhjCHieIqOJZOISC6X24IDI2RBY9rYHi6RL3p9pYz8te3Qds9KZBIRsY5apOcgMGrbxo4l0w5EMhrCEIgjE2WxLYgoG3FkWABGdE8IRUQTV1Ab3lBPBscDwEx+70SYtEV6yuz6NBKEDH5/ACu9MrwTYak8LceB8cH6p+N2yPZN5BRO9wLJApc5sCbilQhD6qwT9SPHDm76JLKbaM8DI+z+E8ZIeGFIHqIjzNyqah1b9id8POONCI1HJGj8DZgHzYgWBhfj+JxnJ7+RxIk3IjR2FViZtEZazUZ4Bx99oKH4InKGVuwRf4HGt7GaFC241w8aCs/UnKbdP5OZu245zvZChIbcbHQx3kdccP8ZjV8CDUUbngVzrMf580Hs6DiCvUy8ECHoj8s811WQHS0GdbUNi5/r7oYnUqlUbtUPDZXdQOjph27Zt+0lIwT1nUBrXrSoMzsuWjLDpQyCiS8i9QFuZrgN2krGe9BsqJ0gRJjc5+S8ii/oaRBUghAh4ivACHPF/chg6kJcQhDRsUJQvP+YO2ty5vJOhGX2uBhUoWx8rdpBlXcibrRM8im3vAo7eg2gg3QOkwvtJ9bW+/x7VXonwlAqQuCIQAMvwKqF+fXaPswqqM+rEywks7YOXQKGrHciOJbIuSB71aBTxiHwyXGgd3RlxFaNY/wE/o7xchYAvzg16Ltw9GrrtPGArN+z5VAZsf596JcE3AcuMNRuogfBUTDkOm8HIor3N5cphtpttN48X6FrpF2I1AQdV1iJyHb+rCXOgmKN2Pq0usYpBetPuotyYoklwhJXAdGHAFaO6NOkbPdeGpsoFTAqk4nx+9jcSHiJI+IubwndBPnbvma8xhH5xoqgY4b2gZaBGE6mJaLnn+PI7M6t0gRhjh7oRBKXkUQPrrc/dYh0MhKoBzbM0PoPAAD//zKQVJkAAAAGSURBVAMAy97udAescRQAAAAASUVORK5CYII=) center/contain no-repeat; }',
      '.serv-ev-active { width: 50px; height: 50px; display: inline-block; background: transparent url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAD4UlEQVR4AexYTWgUMRR+8dDtQcSTP6jYixerJxEpFGzBbg/S4i/+gUjBttSTIgVPW08qSj2JnXooKGjxUgSluEVaLx6kgih6EcGDPzcRLdJdkPi92c00O03bbCdpu2WH9817SSYv70symWTW0Cq5qkRW2kBWR6Q6Ip56oNyptaU1yN1IB7mRlsH8eBK0DuSG4KfPFa9yiLSng/wbSdSLxg8JKZuSQAo6R0SZliD3GnorkEisiaD3LxLJjYlaM1QWRHvRQZcMRWVl2RI5yL2vPEuiB7CvJoEQ9Aj1iyLRSVRH5mtdK0/ngek7KN4JGMWKSHowv12rPTrWlTqb7Ur1JcHzztRp+PwLKGlSRkw3oON6SYgevFOPUWYkY0WEpNwAB0p4Tis7kZZCRL4Q5FwjktMaqcdzRjJ2RDRPy2BOoE2exlChGMlUAhHiKQwKJjLRKFYEEZAwksG3KMNlDF9E+MVlcBvOEB8ZWfgWhS+/cyJ4GfuAcQYY+CLzE76VNLDhnAicHgW8ihTinWoAHbaNbddEjsDpLoBlCjdecaD8i1Mi6J3jUchS3o/sJTBcEtmBeE8CoWS7a4dCw/KG6bIf+7loR50OpnnbsseyOjkjgl1sRAKNvwImAWvhvZwOItGfDnKT6cHpy2RxOSMiSFxQ7QkpeFOpksm0FDfhoBGYV1wROUYzW/wpKeQm9CYvwyEQQTuwkPCXW0f0PHzdihJzGE6IYG5Ho4F21gIZHQjkCdJngHmFP3ga6rWH98GOtiOwZ4kTIoLo/SzPsQyQ4cUgljtv8mOs1D+RbGfNNTSqTwtlI7sg6Ol7BcvP3cmIILQfCLTkoIW88IsLzTKK2zfAm7giEg9wPTI6gFBA0utocCNeiLQE+RPsvIhP0COAV/FCRJA8r6KWUv/JoHLdax9EeFvB4Gj/jXWnlmTP5ZwIltk2ZlAE//L5XLS9KudE9Gjxkg/r6XJtbCSjYwA6SB3S6nhPpnyhjbdsOycCx7wMN0M3o4FnwKIFAb/UKmdwRuf/xeNa3lfYIVnnROCYhZ0z2F400Bn9qPwBCEUWzujaF15y+S8u9EWEfbvAb5Dh/8LR0XbGqbyb7aq9rdIrnQjHmQWZRuAUElegO4ADINGDdCSVQISD/YPbMAhch+aT5wvoEqkUIiVBmxJzEdmMh3m5U0CyRFR+Ul3iFAnljzWfa5BlJ0YiWLO/A+FPNtZwxQclqFAynOcCWF454NApbnG/D5FnLSYi2vJm7cfHg7vLcWoi8gUvVZsUYmI5gRgOJyXC9Z+OddY0LycQRLj1gLYS04hYVVxpD1WJVEfEUw+smqn1HwAA//9ZOh+jAAAABklEQVQDADwdJYOEIx4pAAAAAElFTkSuQmCC) center/contain no-repeat; }',
      '.serv-attendant { width: 50px; height: 50px; display: inline-block; background: transparent url(data:image/png;base64,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) center/contain no-repeat; }',
      '.serv-attendant-active { width: 50px; height: 50px; display: inline-block; background: transparent url(data:image/png;base64,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) center/contain no-repeat; }',
      '.serv-parkandride { width: 50px; height: 50px; display: inline-block; background: transparent url(data:image/png;base64,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) center/contain no-repeat; }',
      '.serv-parkandride-active { width: 50px; height: 50px; display: inline-block; background: transparent url(data:image/png;base64,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) center/contain no-repeat; }',
      '.serv-security { width: 50px; height: 50px; display: inline-block; background: transparent url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAEsElEQVR4AeyZXYhNURTHz8yboiiKmXlQ5EWhKE+KB4V8f6R8FAoPIiGFNKMmpWjKg1DyWTyYfOUBY5AURRohCpPmi8nIg2YePIzfOvbe7XPm7HPPOffe7m1crf/Za6+z1trrv/c+5+y5qr1h8q9CpNwWsrIilRUp0gz8d1trLhNZSjB8vORakS21tbXN4FGJ0Q6NTcApcURmUfxxIleCUstEajlPEVNApDiJ1NTUbCRiDCgbgcw2VzFOIlVVVdN0EPqRrq6uqhJhnq6DdiaIFCeRSO8yNlaIlNviVFaksiJFmoFy2FoTC8GtpETq6uoa+Mi1CyCTF6FCEqGW5MLJoX5wcLBeRQgJOZSqbvqmJESEBKeFBl0uhN6h3waZJY7IgM7KQCO1nm8bJkG+tu7u7lW0P0GU2GObmsKOTiIUbxIzezXhwCz9CBKvOL8JiY+ufDw/Zmy7prC/kwiOhggJJtDPS+TBZkLMdiLZC0XiM7pTiDFEcDI1oQfESaS6utoOspMFEjDLV8BbjGtBpAgJJkM/2OLzDBKrUb6CWCHOTGKopkCck0hnZ+cHy9Mks2yeFMiMrQdT2QLXuLcFBER8KMYm8USR6Aw4ujtm7FBNgQgnEbzsfTuK/pC/zkh8BbsRyJyj8J3agN4QIvFQkfimfRK09t8gdk2B0KREPIpcEoj81/lEYctQ+4EvFH4S3wNhEtjv4Svb6YfvmOwyGzd7W2ci0s+WuU8iLYu1EmpvU+BybHaBRync3k53ecUKiV/4JRYmY6F2VrWYCdN23catiEcxzdqRVr68k2mj5AFk5EeKjvBNCrjFvTXYf4NUwvhm8tDtWobkiSVCAS12hD1Dtl3pT/EXMvbyN/McCQnnh0zFRjWyrczzQe5ALeGAWCI4fwGXgC/Myi6U8cAlLxlQPnCncDiBLiT+oKcWnrO9VpDUILVYpqCai4hHMRetkMl8Mw5a/Sj1HTE7wD5uDoIsspkgmQQaL1yDbwtfchIhoJV9fpPWF3R5vZqH0DcW9jKe1TCTxXgydmuuIZIQ8djnh0jUA3zhWTngK0W4qBXXL5UeNXbOkRIRIct7toqQQfXkbTaHWbvsdwp4YYIaWAFZcT+rGvO938lxSUpE0shvr2dEUdgAmdNKz7sRErxM6q1EMpaMaZncahoi8tDJqrRZ6bZDRn7otkzp1QgSbWo1EidLRYSsfQwg34rn6Fr2SiG6k7IdzUQ0hVbiuRqjL02utEQk9xcGWsbg96QjQK+noLvo00FSWU7MI5x3A1/II+cxObvFfjN859AlCxFJ0cvZaQXKdaBlEYW1sDpbtcHR4lbbxOUG92cALddVzl5tSNNmJSJjDLAy8tFqlI7CWGb1LEW2gu3KpptRkDyG/TUGswroIo0qV5ajjMR7+RDxE1DAYbCOjvnOoMv/aZym6A5wCDSC75Dcz71xQEuPxILD2pC1zZuIGvgqxSxAvwBsqaMjKyZvuxHotlxQMVdtY1a9UERk/DcUthnMp3MHuOSO+AA5T71xOaW1F5KIHruFIpeCSRj2gMcKe8QGltKPPZJzP7UUg4guQl7TTRQ+T6GJG6lfq8QkkmISSVRAoZyGDZG/AAAA//+OS8+lAAAABklEQVQDAHPjHIP2ioUiAAAAAElFTkSuQmCC) center/contain no-repeat; }',
      '.serv-security-active { width: 50px; height: 50px; display: inline-block; background: transparent url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAFC0lEQVR4AexYTYgcRRR+NYedFQwoKMSfQ8DgRVBBwZPgHrZXRZOYGISoYAJuL4giRoS4yK6wCEIk4EG2F8S/QDxkURNymN41UUSIoEhCEhJINoQE8kMScgjJzARS+V71X3VPV09Pz0xmSGZ4X9V71a9eva+quqt7SnSH/AZE+m0hBysyWJEuzcBdt7VewET2Ehg+W5qtyKZRpzZvObV9PcZJ0HgHMEoWkWeR/FZBtNbY+/ZdWIFcvsNwjwOpYiRiOfW30eN+oG9k1KmPm5IxEpGCntQ6fe7aZdEjjIR5CHom1BOKkUjCr+/NAZF+W6LBigxWpEsz0A9ba0UnuPWUCE7raeAkA2TaItRJIsglvyD5KXgzUBGT4JdSKvrrCRGfxLSW9GHou4DCYiQipLweRJUk7g30dusUEgfw6rMOcS8DaRKOreeUdDQSIUlh4JKQDyc7FrFTSPznkzhmioeX12hsLaekv5lISYREbpJ4KNmxVRskeCsxgq7/+CROBA3ptTaJWk5JXzMRKUMiJakFS0SwZmvbkeQhNL8BpAquM4HgxiYS8m+QeJ2ITgFNREaTqOWU7GQkgoGOBs6SKAoWNKJWCQp6E+oT0H9GvQmICdrjJEj+6Y4PM4kzMUejEe0GPaeku5EIHPV9uwx2w9cZAm9HeyhI+ltrtvp+0AA7RkKQ+N21FYlzgU+OWv8G0XOKdc1LhMac6quxnp5xHGRWQ70GeCLE19ZcbUsDCUmVij3EK3HRc8xVPgev6GYnKkSEk3MRSMlNUXpFKY3FLpBZI0hGCUr6Am7hPYGtuacyUWYSV9CeWzAZL2nOnAvnpDVFataKwEvMo1CCZzifvCuV0VgsVOxh/pPidMMlQb8t2OX1aL8KtCra5EW5pAXJJOLaQ4t6J+x/fYb0S6z/5dplJqMv/7w7rkiEhys75gRvq/D+cBO5JGNkEoHzEgn6EbUnQnwAZTlgkn9du7yOpPxGkvgKOq/EDZNzVju21ebwupfDUminKM2IEGb0B63fSmuu/qlmp6mH3Ynh9xbsoY9xUQJFZCM68SSgomQOqi1ZNCWCDnuBXwFPpOTHa9YW8/yKl8uxGvpk8dicQ2bEPEQIW2QSUc4CSnCvbFFKFwp/xYOHyll/7KYj5SKCKEdiAYV4HrP2E9o7Kog5jfuLV1zF9cc8oowmRV4iHAb/vUqHFR9vWU511tfbriynFnsLIFJjYcx8oVshgi02zFvsQBRa2Pg/dmtkF9MaSRC+UdRYuQO2RARRL2G51+JbZT90JTjRN/uJKLvF4j7LqW9DnynAE0n71RhEl7yGfGWrRDjqkjtRXi0kVdjwMYX3qz3QnwLyyhpMwD4i+WHQgWNybCLKPDMCf70uQoT7X8C702s4LHeyoSDp5TGnujg2V39X2ebiEQurABK/wOVpwBNBO1VMogteQ2tlUSI8ynUclutBZoYNhiTxgJRyDonuxb1jc5uGZWNO7UvLqf6vr4K6LmhGxSIq8iqjQrRDRAVAAp9hT2+AEZ4zSHQE986s5dROA5PADHBeEn1CJB6k6MfnxAaOETUV09om4g+7A2RexB7/3reD6lEovGKTqO8BQmFf7oOGHUDb0ikinMhB7PGNSG4Uxm7AJLvZh33hcBDoiHSSSJDQIhJdBTyGLfaRFOIPBuvcBqyCY+zzAHbb0g0iQVJL+D7ftjA+NMJgHRdafqyiTy7pJpFcCXTK6Y4hcgsAAP//MkEDHgAAAAZJREFUAwDH0wWD2/EQZwAAAABJRU5ErkJggg==) center/contain no-repeat; }',
      '.serv-valet-service { width: 50px; height: 50px; display: inline-block; background: transparent url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAF+ElEQVR4AeyZeYhVVRzH7xvQoGwsaH0z+Ef1R9FMFBpaWS4tIybSomWFtk9BCy1j2MabggxNjQgCY6LIwnJokalm0sTSTKxBJBJayIpmoZB0ipA2ps/3eM/hzH33jfdtl0Fm+H3v73d/Z/t9z++ce899UxMcJn+jREZaIkczUoGMTKcPi5Oxy5LUM1JXV9cMusFmD32y6+vrW0tlkyoRgl1FoKvBRBCV6YODgznqqDxadsj71IgQ4BtEcz+wcoDAd3PzM/Clmcy85DuS2GkRaSCYa4ERCHT19vY29vX1NaAngCmZTOYJU8iF8ltQ2j+oZJIKkWw2e4MXzjcQWMj998DKjp6eHu2PfdZBBnNkplXAdys4EhSUVIhkMplLbQTMdhv2XpAnZOYhz2n2DPW1b9og1A+e98qHmKkQYUT3eCUb2he48oQk1K3I84YOCNWCu6m0LnQNUWkRyXqjHufZ1mwgwC3cjAdWOjBWEnwb8MnPp24embSItBOUEfZLkzG8C0tmEbenACMssZvBXNBCBm8HUynYBazMx5gEnKRF5CM7IvtFG98ncxQz7vYQ5cup+wrwZT+kzsHxMTDChOiBYWxdUiFCEK8z2OfACEuji0A60Q/i0OyejTbC00t1jR29QPId68M+y9rSqRBhoD8hcy/aCYHM4mYFZF5G+/Klf+PbkCxYlhYRxbMDMnrxrdXNMBgy03499lLBsjSJKCa9+K6HkPbIIzjeBFr37uXIkrsHX5yMYy9d5xVs9OwgbSJ27A2QeRosADPAYlvAkrsNW/sG5eQClqD2zhTroc0Ga0tXkoj6KxXaxHpvmPYEvQ78BnTc/w79KQVzgRHI6lzWbW7Cy0ghEjDD9xGTAkYZOZarjvunoZ2IBJte5zLnk1EOkcuYqa3gJzCYBGzWAfZAF1rvihMUgIc9kJnD/VsgTyCwlfJ5cSRUuSQiBNNC4B/Sgd64E9CJhM1aS0BN6MW0/4RGFwNfBhQsOAnobd+CXghmQeAiKsaSxF/8Zmc2WwnmGTUuE6dD5lX6OBpE5RccayCwEv0a0KShCktRGREJZjNnu4OQnj5TGTCTEFna++s7C5lm2185OjGRKAkGbSfdeh9sw04q/RwA9cTxz1LaF8O11xlLJ159Jp9fqGIiInEkyMA1hTpN4N9eoM5Y/DPJ0uNgI/gP7AQ6tq9Cb2N/vk0d932DbcQSOY9KS4H/E42zWQ5uOdGqvUwSdBH4b+iAcdeDP8BfYBMVngSXABsf5kFhOV9JnbwvRVWcTMFnVHsY6IM/DhQZSUrieGrH9aMlotlVGVWMyNbLbpy5y7/8g0vHGAHTyNVaJcYKLzWQ8L+TQ3e8SpiJm+jzV+Ay6tkiET1+RAfrx6HH7AOMNxmMBTrGzCAb2l8UBwGrZJoxwosyclVo6+1qGtiG0rYsqSboIQMkaPcVdVYz1iJwKsiCeeBZ/O4bBjvg4eJnRS4HEXE3oaHKFqEruSIAzdoLtLB9xOmnqHc5OAY0gjupvwbsAYVkEpOUs4Vkx52Y5YsjIn85+JHA7gJ52fV8jzHAB2AAHEpmQ2At+IKK2k+oQNl51xjhpRpEwq7LUorrRoLfBN6npwXACdlQ1t9zDgw1QI0YOZH3hM5huyCgl+bMSGQHuH+RveKfDnAFxZ+1TKvKXWrpqkmPUgjoVPwts62TcSN+JzyhduNfwtI8E9zhCjwj7Yy4wJlxLZu96C4CzRGoTsUq98ILOgj8Co41DWRhGQU/gFipNhH9cjiHGV9OwNvBADCBE42WzRh0nDwHgTOAXpTr4ypEfSLSaZ0MopeY/5G02ZZJU+6XJbH306aDGdc3ufveVl8e/sbuVB0Cnwh0ktbX4tf4E0sNDaO/KyVuXGpFgt4Ccox9ITgCzGb56AfsnWGfRStlRD9nLqVl9D9HuCojBN0NlhFwExhD0NOADob+N3pZg4nIPjp/FOg/R8O9xEotG0/Q54IlRKqfcP5FV1xExO807jhRru93f4Bq2VEi1Rqn6v2OEqn6FBc5wGhGipywqlc/bDLyPwAAAP//49vHhQAAAAZJREFUAwD4a/eDnn7UBwAAAABJRU5ErkJggg==) center/contain no-repeat; }',
      '.serv-valet-service-active { width: 50px; height: 50px; display: inline-block; background: transparent url(data:image/png;base64,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) center/contain no-repeat; }',
      '.serv-247 { width: 73px; height: 50px; display: inline-block; background: transparent url(data:image/png;base64,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) center/contain no-repeat }',
      '.serv-247-active { width: 73px; height: 50px; display: inline-block; background: transparent url(data:image/png;base64,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) center/contain no-repeat }',
      '.serv-ac { width: 50px; height: 50px; display: inline-block; background: transparent url(data:image/png;base64,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) center/contain no-repeat }',
      '.serv-ac-active { width: 50px; height: 50px; display: inline-block; background: transparent url(data:image/png;base64,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) center/contain no-repeat }',
      '.serv-credit { width: 73px; height: 50px; display: inline-block; background: transparent url(data:image/png;base64,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) center/contain no-repeat }',
      '.serv-credit-active { width: 75px; height: 50px; display: inline-block; background: transparent url(data:image/png;base64,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) center/contain no-repeat; }',
      '.serv-deliveries { width: 86px; height: 50px; display: inline-block; background: transparent url(data:image/png;base64,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) center/contain no-repeat }',
      '.serv-deliveries-active { width: 86px; height: 50px; display: inline-block; background: transparent url(data:image/png;base64,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) center/contain no-repeat; }',
      '.serv-drivethru { width: 78px; height: 50px; display: inline-block; background: transparent url(data:image/png;base64,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) center/contain no-repeat }',
      '.serv-drivethru-active { width: 78px; height: 50px; display: inline-block; background: transparent url(data:image/png;base64,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) center/contain no-repeat }',
      '.serv-outdoor { width: 73px; height: 50px; display: inline-block; background: transparent url(data:image/png;base64,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) center/contain no-repeat }',
      '.serv-outdoor-active { width: 73px; height: 50px; display: inline-block; background: transparent url(data:image/png;base64,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) center/contain no-repeat }',
      '.serv-parking { width: 46px; height: 50px; display: inline-block; background: transparent url(data:image/png;base64,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) center/contain no-repeat }',
      '.serv-parking-active { width: 46px; height: 50px; display: inline-block; background: transparent url(data:image/png;base64,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) center/contain no-repeat }',
      '.serv-reservations { width: 55px; height: 50px; display: inline-block; background: transparent url(data:image/png;base64,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) center/contain no-repeat }',
      '.serv-reservations-active { width: 55px; height: 50px; display: inline-block; background: transparent url(data:image/png;base64,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) center/contain no-repeat }',
      '.serv-restrooms { width: 49px; height: 50px; display: inline-block; background: transparent url(data:image/png;base64,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) center/contain no-repeat }',
      '.serv-restrooms-active { width: 49px; height: 50px; display: inline-block; background: transparent url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADEAAAAyCAYAAAD1CDOyAAAQAElEQVR4AZxaCXSVRZa+94VsgIFEZNPBiCKMCrIvIcCDAAEJGIIgICCgJKDSM6en21H7tMg5My4zaHs4tkIIS7OILA1M2AJJIKxBMKB0qzQ2I84RgkBIAmQjyV/zffXeC3nJSzr6Tt3/3rpb1a3lVv1/4pJ//KvRWbRoUbOxY8eGGmO0llmNvBbv55I1Puh79uzZYWyrlpOgWnQ9ssa4nkSEHSU4iYmJrUenVrye2+H1A9UTdxyOX34nfejQoc9u3ryZzh0RacwPxI0W2jr01bt37znxqXcyLscsP5Tb8Xd7Ry8rXzh37tx7YF0NoB5Q/dKgAKoKMG63u33p2E2fipG3RTUaOEJUxoY9l/lZWuHTv4UOyy8NhO07aKNZWmHikjYpuatUTG81Eixi+ojq0h8HfLJy2rRpbdAI2+CggfQvdOLP8dSoTCMJmb7/DbDGiujSopVDejlbxg0sWz8yRkS+APz+ySefjAVmacgXZYFAwbRtFBcXz0Kn/xX1jLINo/tHZM0YbLYmDDAi68CbfMO95lfALNV40A7obmmoYav42GOPdRJjEqCesT8l5F9OnjxZkJWVVXzkyJGTCISNhrZfcPIFyFmq8GjIH0T1im0Ds9Dyvvkn2MmLnU69PPvw4cPfb9mypSwzM/O71lkzXoVVPoKZMn78eM4GqvWXbqONFhUVNUdLlaqSS2tA+IABAyKAJTIy8izwX42azsnJyZh+EXSoUX/Qr1d++OGHe8F8GJCXlpb2E7Br8ODB3AeCYK6ISiZmKcqrBzE4fNaCRhtt06aNwSg0R8a432tT9vnnn1eQLi8vDweOFOOqGjlypF0WqP+cgvERCQ8Phz8tQUfv8xo7x44dA0+Em92IdhLRyqioKMuTAL9Gg+jcuTNH5v9EdAqyEfeB4OdxlpS+CHQnzETOlClTuFYlJyfHYvCbUgyVvvnmmysiJltEh/bq1WuSeH53iFYWTlioxrhBH4Dvi8As9dpoKAgqunbs2FFUvGrof8KyddhzmQfil5evGLW84vejl93JFtWXROV/QtKTPoKchcnAkGgiUJc2Ur35qQ9hU4C9sXX08op0wKL41IpPjegfwP/2zsZ49gGkNMPDAPxKQ0GYPn362AawfPZgE0+G1WkjOhNr4HVRpztmYFnp2rg5u3fvLoSMe8IAN7XADYZAxC7D7OzsUyE7J42H8SZAd8BvsI7HAG+6/afh4zEL50CzcHDZL9qzbiFQEFRw5eXlVVoNPJCNtjbf++xTpeviEm6uHjbV2ZIQl5kctuDo0aMMABpCXXYokD/KawP9M2DqE8vkyZPDd+3alfv4udfmoI1EpPJZaCfp3pzZr2B/fA95S+xLnx0DoV1NWzWEtxWfogPD9k888cQLo1LLP+HUlo3Z9FnzWVlvRcw59IZO2bN0dGrFFiyttaOX3/kAZ8Vwrz07VtenV2QRZeyADBkypH/88or34pdVZBSPXH8aS+jc193ePd58VnZq6xePvIZ2/rvAveZAfOqdv0F+Jj61Mhv9eDM2NraP9eSZRfrzy7kMwMrdbndPGO7tuDAvTY1OwCndDbclnBkaBYUIbLb24HWFhydETEq7l04eYLAzZ85sCzkD4ZSD9Cv0T5n06NFjUviMrCxE8yr8MvPdAc0RDoPfCCyllrBsAeAeYCJh9uoA/uLmM7NPjFpW/mvIWOjPhX6QtkDa8J4UMj2Dm7UnHC4p3zDKXbIuLq5FxtQhwelJg70QE7QjMe56asxwyLmW8xDs/J9iV75uPYmwQ7UDYQBW1KdPn8T2L5/aiODLsWzGI3HQpxsJIhZLdhD8x5AGHox6TKusGUOB3dj8sSVrR0xFsJdU9f3Ry+8kW4ciDjtOmpgNy4ULFyaK0cFiZMn++aG/xQn6Hdf+9u3bC7iJfbB3795reXl5xZAf6JibwlP9axHzPA6qx+kQQJ9AtjAIgyXaKir5ODNNmWt74tMnT57chcRx0+eT2dBHE7OOA+8GMTZ/AfbHptK1I+LhsdCIeWPUqFEdQdcsJzbCDRbU4ZW86RD8GLr7mfeAWcLwYPbhyPoBriUhkDVbs2bNFRWzDHRky1nZvv3BzW79gm/xxYsXHwfxIOr/lZGRYW8B0dHR9O/nF/J6da+eIJC/YTb+AD+drl69OgC6NUGQlsuXLz8i4jyJWTi0c+fO65YpUg7MDnH9cbZqAAcVDyXemSR095TD0CswglkE4S2+2aCNRL1wdAj4LZA2LwHbgsDon/KGwLbr1eMekb+/2y0HxqVtXzo1AtgGgaDsGhbHcXqLaMuiVUP2i+cXhE3eGkBj42HdfYLfEkuEm1DS09PPIvhcOOudlJTUwavFIMDy1IxLuYmlRYsW9EemC/a8vpAOBLS17UKPs27psLAwDmqwitPjgw8+CPdrJGJOThd4qsDGwfoWGThw4FMh0/btvnHjxlDwWXzTTFpCp+9fXDRy/cdooBUZ6tLzaOXRS5cu9WIdwFEE8hYjdtaCgoKgJtK9e/cxsF+PfdTVq8FOe0mLbL1v3779i+LWrxs0aNAockNCQnyDYDAgWhOEfe10dBiUrjzyyCPfAQuCGgccg0Y51SBF0WFiC44x0WhlZkFBgc3d15cPOgGBaTX3sO+eVY3ZYuBgi6ixMy++X8eFX/SFfVJVVVU3Lw9Ve5Kzyr45JCLnHRupKlPueT6nL+uq8CRwpy4TGRlpqCj8lZSUtAW7M+ivNmzYcBNYRF2sfx8dHf1X8fwMsgUDsnYqmgX2revXr7cDlqioqGPAnI2evnfkW7duKXi2oDVrZyt4ON6ZwTK2nQXLAGxZtGiRxXzAARMLo+MyEtygrZ4aRwsLC+1MWAeVlZWMMhpSvicIprgTjvpH4eQc0yswC8REYke3eNWQv6BW2e7lL+xMtG/fvhj12yraDymRAyBIw2AFLoosQkmzZs18flkNBHYZ1hUYzAQGH2Mj2I6QYqr6AZmitFiOJkgZhEaYDk+zAkDVo4sDC1URvG9w7+SrmFim23Xr1pXAXR6gVVFRkc3hVrGBB3puZwaDRd8NaMGb+C9Drz7uoJ7+WCfWWuWfgb/Cnf4UsLSYdYDrtAw32IOsA6iLdkUSEhKqURceSMDfAO7HBnsAWPI/6ncIOLTDwjzfvuASUPDqFUX09ZgBGC7lSrorwIsU+6G4sugDDzzgiXDMmDHRUOkOuJCamloKzMKTtzgiIuJ7VrBBlZiwePFiOmFQrHKm7sPo2IxUXV39LZiVLtER4Pls7PID3xYkCotxF/LJbf3nPmrvCcHUM4CH4PECHXE/AA9BPb9Lly43QAvu9HbvkAbUBHFjxeCvUNeoecdtGsZM0gc2t+mM19a2kNUrCLQerzEGgnXVkaNrHk5+fr5nJu6Zc5jrt6T809EZFJWWlvK8aO+IHvjwww+LyAOw40D+BUFyJr5TY7pi5F2ezKaZ0GpfVlbGZAHSc5iSqA2NLSfcBmo6iiBqaK+9X1+8EZrBEBYjdXF9y33zc3ugLrdWD7X7AzQPFz9DnBe2PnHixOuiehnrs+uIESMYPHai87+wCW85++BAYBarq47nTY4MC7jFWRzggURhbSjyBevc3UPeoFwOlrtxud3u1uD0RMsXcKPkhwF8alI2XhIcHMz1LdChLz/AeWEb4UcCNXIewuhr1655gtg2AVkKHo36XSmMOrw6CPyiSViIJ1Vbqs6j9kxAZNtCMHZvYYbBEoybE4yl6XJVVFRwNtCYdly6dGko7yJQ7oNITuMbE9e31NkPdEBw8OAMSeHK2GzQcv/CL3CBROcn7bKHU92sghkroB5O6DJiHK584bFkrYeCJgD5F+MYq49ly4snVrAW4UpS4crNzcXG1Z1Q77IrLGV9RouXfwe6s6rr7JIlS+yIom5HArhusY0h22DGzDUjOrVnz57TMev8cic3Vw874jWwI1i8cihvulKduJ3LV1Rc9qKonmuE4Ed/HBzfzQCsuwV6GGyRh/7tL8+AGyyqO4cPH17FWZB7c55/z4isFiMUMgisEPMjFFnomLgeuN1umIkgV+eLuHg1GdB2wecbRLTF1U8GzMMA7RD8oKdA0q5duxNwvE9EF+Cd+jhGdI6IVKFz1g9oB+/QnfF1PCkmJuZuZlPhyEMss/Gl/DCUX0VfT8ifE6x/BuHauHHjTzGX335RRFNEpBRQhE8oPLRA2gwGO5L+gGVmDz3sj2IsDWYkKJhDobsmxX355ZdpqLAo9HhtUFzXb1VteepXcLYagghAJMBBMDZI0NJ85oGR+Dr+Edb9w6xbMIb2JDth9KNU9I/N0icm79+//yqZDILTF4IDzNmXHLwCzL+ryNVWrVp9Dbpu4bIg+Pjoj4SycvbNB48DV8AW71M7rS1mgHuGOhBh7PDEnep8Zkro3EGX32b65asq9mY19SBlcfimF4Y0z76RAUOFWxEVXRGT/07vfSkhr+zZs4f3NsHPXgCBPXm8X79+j4poO7R6ZoPvJitWpuL5ceQJnprAr4jdbLhPsdEQMYovIGJ/mAG4smTth+0wBq380tLeTAilqmp5VkldHPVyl8tV046qL4s559566y3f0vLZ2AsgO1gt+OFlA1cHwyC6Y4O+iO9J8TgP+OZmO4NN1BVgb6xQZ+GXwm5du3adXDlh21wwFLm8f1xcHL90C3J97VmD2JZq7wwJpqClIg1arvdhcL0W0SC8vbFfUvvniDb31hkAg7VVjp4lvI9bwJdh/U/YoCvwPWkJ3up4moMtgre85OCpe99HJ1pbBh74ejHhwV+f3QxyGoBTc4GY4L2okfQDzJAdNFV1jCiaE+OngCytihRQhwmW42XRnna2yiDowDIwE4eu/LHf+Ivvdx8H39ioph1O8WCriYcxBhlDHywuLvaNiMCQGxTNmlVFK4cMvbl62L9jhIuhzneJmtFivRGAG38pNrY/w7/mp88gKGYgghG6ffbs2dPnz58/osbZZ0RLsTYNFTxgmLlu4YD0jYggCsqrb/1p+CZ8Rzpy4sSJb+GHnWdDlEkTfk3Sw9wE1PMFYdtxu91ca5ZncGVAL1x4dQSyYkGH+YYfJLV+8MqZUmQTH99mK6hAhGfTyt02GtHHPSOgnu2wzw4jyBEm+Fj1MLxU4trAkbYyjA59KJYiMXk1MlaaCE0KGG0F1PM1XL8tpI36zIAcbjJTayMizoB6XmZA1CQbo1gLAcwbDiKAckCW9zqNTa8B5b+QicxWY2mMp/M/fya8LgJ0TpHD7wavwn0ktWbCa/nLEBzXGwwwuO8adAibBmVM3g5uqHX3iP9mF3s5Mw17aVQCO0P/wB49VEAb5/bt21ymlokggkjgUIGMlD80GISqBME4pHlz/ilb7A8e+OUiAvcqXwYC356iQchiDfqCUsCC9I3OaSjOlRq5iott3ItvWJ3F+0Ng/OgsmG4764JTCVBTGm7YGLxnSAeTlJ5IbbyG3os1yc86nVrMOjiOvMTExIex/0lX4XOitUSPZAAAAXdJREFU56shBf8YMD4iHTt2ZBuhkclHR/pM1JhBoEPCp2eOAZaDBw82w4D2J+1S9f2NkPYYU3LFXrM9lOeJoAWjI1K1edwWEeU3p//A3+b+fHvMZ3tRHyb2Z97F+8DW0rGbtsHToyqyBx8M+NUj4KusNbn7gImngq8qp1DZrUbn82938LkPGWg2pcAzUN/7zvlB2VjXT4vK1g7Hk9EnSv0h0EwwEMGV+aeStcMXIDNsRicnqCi+BurSwrRYXvT4rjEJrh4yapY5WxN+8/HHH99G3ffuALLRgr6L2hvp1oTXVEwaOt0PFgMw6hvxd+s5KvIO6mwTf24wqdc+GfjSmjVrisBjn20fQdtChiVqPdgAq8q/ysTkv/2ca/vTMbpt/GD+k8qpU6dWP37utWfBG6nbJrj5p2D+MwkM0C7GDEQTCtsgKG33pYTNw98EY8P3TInJmBfyXE5Ozpp9KaFvIpgRobue6bc/JSzlzJkz1+CXbfgFAJ78PwAAAP//1eSkSgAAAAZJREFUAwA9dZ3ggvz3hgAAAABJRU5ErkJggg==) center/contain no-repeat }',
      '.serv-takeaway { width: 34px; height: 50px; display: inline-block; background: transparent url(data:image/png;base64,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) center/contain no-repeat }',
      '.serv-takeaway-active { width: 34px; height: 50px; display: inline-block; background: transparent url(data:image/png;base64,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) center/contain no-repeat }',
      '.serv-valet { width: 50px; height: 50px; display: inline-block; background: transparent url(data:image/png;base64,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) center/contain no-repeat; }',
      '.serv-valet-active { width: 50px; height: 50px; display: inline-block; background: transparent url(data:image/png;base64,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) center/contain no-repeat; }',
      '.serv-wheelchair { width: 50px; height: 50px; display: inline-block; background: transparent url(data:image/png;base64,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) center/contain no-repeat }',
      '.serv-wheelchair-active { width: 50px; height: 50px; display: inline-block; background: transparent url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAQAElEQVR4AcxZCXjN17Zf+yTOMVWLjvpKtbR5Wv3a0uGGaKicSEKSSoWYBTnRomh7L94ryv3wWtzSIicNYhZBBIkMNTTmeSqK1jzPLeLkJOfs9/v9c46agivvfZ/z7fVfa6+99tp77b322sMxyV8/RbJr165VYmJi/KKiol4jtG7d+vW2bdu+xDIPGHIe+pFBXkOIdURExHvH3p2w60Jg8o4r1lk7AbsuNZm29fwHUw4EJTomenqtPfiRQjTgRoeuh87tiUw1wDXAPg+cADYpreLr1avXEDSTDz+PEngNKXYXLcc8nasMTHd6Gfg5ANPlp59++iIJwCM3K15D3Oic1NrZd7goGSii85DfCrwO+DcA04k+ffockeLfI2sIO6YmTJhwNSfOMiLHVvaD7DhzAHG0z/RG6PthQKHL5SoC5uzRtUoLvtDlHUiQpUs3KzKMgTqDp5RygZZu3bpdRM8vgbaEhoYWAFOOBrG8NEAd9ASjPegtVbpdCTtJ5dKqVSuOuAwZMuRZMKuildrBiQWDwsPDOwXZHZ8GJzq7W+3OHohmn1ntjt7BdkdP8q12Z1xwgjPeoBMcvYw8ZJkv5jttYWFhsQgckYGBgS9CL9u7vR9g/3upJAUqNTXV1aJFiyfXPjdgIVRWB/hqLV87wlKTlagftNaJWEMTEM2+E1FjtajvyQfPrpWeaNBKjTPykGW+mK8TCsMXTKoatzbNHJO92d/f/x0RKbUxJRli8K9cuRKBRt7TIhk1Nvds9vSqriFP/twljPDM6m7NXtj4yQfAAc+vj2/w3Nq4hsCBwE3B+7DaOltjlqNOI4K37Nk13YP+Y0OPJkrkG+iu+lin5XHATGARPRwYHS6pqsPhuMIypaTozJkzztOnT+uLFy8KaPepU6d8Dx06VOHEiROPHTly5PFjx45VOnr0aLnjx4+XAc9CmuUnT56sSAC/AmTMwGWQL9RKlaNutyjDhUFjvPB9yFSSIW7qe+ONN5aIUrmiJcIRlrrc1Cojy/1ReopPdGYq6Dm+rZfOBaR4gXyCJ88yAsvnqo+XEBPSoWOVaN0LbVwwL2o5BbjUqSRDODqmxMTE/GjTtDZoheH3ctWVnQMsSz6uWWVFp1fhLq8QQPvdBF6+geFetQGvPP5T+9qUBX6l9s5+tbHW5kKnQF9MRkbGKtCcFWPwQD9UKskQKqMxRvhF5jLgzOzZs1cvXrz4/Jw5c07OmDHjFIH0zUCeF5KTk08TEDhOk0c8fvz4I+7U0OnQV+Dr6+vdbI22wHvodC9DDKWIThwtbl76l19+MRtMzwdlpr59+9bq0KHD6+3atasLmscaT+kNZEKoLYOcCeGWeuTatWtsV/v4+Bh5lJU6UeH9lDCacMTKYzaqtW/fvlaQveCr4ISCLOwl23b7jdx3pmHSrnONJu8E/as1sWCD1V6QSRmE75pQ7t6yZUsh8cqVK6kLZHEqKiqi3uJMKb8lGjJ48GCjUaUUd+CraKf6iir9tp8NmHQABUPdSl4A7xdAsoixp/CYPx1lv4P3IvDQgubzDloTHaubNGkSAh4TDRIYQFosFouB/y8+JRmivv76a2O0IiMj2Yn6nsaOXp4U0B0Lvl6uzfJajs3SDtAVZzIb4BPS2XGWtsB1fNM/euuPyY26ijbVQhTLpEFWq/U96oFLcXBUQQFPPOSUHu5mCHk0QgfbHX3yQ1IykTkJGBQlyfU2btyYBBfbOm7cOAuOMTVx/moGVxocbC8YiuNLOAx/eciQIeUzMzO3b9iwYXLzgoQaovSXolUDiVq8PiQkJPbx2Dx/dN3n/3NG4BHGcUGsducYLepfoiXthQ096ubaLMNsNlvhhx9++I7V7rAvsdgu/NF0xt6iiLSl6NQQLfIV9pr0/JCU3TjWXMAamUbZ3r17F+TElR2FMMz1stAVuXAS5AcArrlcLrYHsvSJo+/VQqXoj0hwonM0/L6vEjU+J97ScvLkyVewcP2sWMTY8DaKqFgRSXfMDOrkmhsaUi4zukGl3HYNilJCQq/PaNoeZSlKpANlgxIKUpo1a/ZicnLyYbjcR9BrRznbVYWFhYxmgvUIVukSFXo1GLTV7uitte6ntCRn28y8+nJ2emDh7oVggODihc2tOjrVLi8vL2XZsmVZ6enpa+fNm7d2+fLlS1etWjUPZZ0rZse8oEWNVkqisZNvh0u1QH3BWorXItzNKyHSwTARrEejbZY/LBgK4Os+UOCCf78rosaKVsuzbOaugl+w3fE5RnECyA3VN31aixcvbm7IY9CF9ajjZiBPLViw4HiuzfwFDouvQfZXuNQiDNKXoCXXZokVuCzof0ZFRTEAcPFTB1gPl1jZOLKzen5oyvfAV17a3rujUsptxX1DixrFRofX2xWQlJR0BuXcxFhPg3YBeLS4GchjGWVMU6ZM2dOtcnoDyOE6oL7BuokELdXW2/oR46VmDDGAOoAeLhmNsSrWRXd0mDPyRUJCwgm8ZTX2zMTa4fV3ta5fv36hZ2fm6D1Io5Rxs050dLRrwCtrW8EtN2LdTPWuGSX6C7TtD+OaAUudOnV4cuCMeoGzzqL7Ag1xIZyWd2vdB9K/x5hnTgOW84GThwH/UWtH3yivEStXrqQRYD94Yh0a07hx46Jqa22dULMS1gzvIlJjS29uopd8WmXgwUNkz549TpRzRr2gkX8gY2iI4JRbE9J1EO8TunTp4mjatGmEIO5Dy3A8SJyGMl92CPj2hGpCHcQEL32LnKeuCZHrV2FIF2kVHBz8NtrNR6UfRKkAXpk5M0FBQeEE7E/NsXYrCtwCADF875HYsBSEpTahTMWstsuJTdFLGGGu1dnz96nMA+gmQLckKoetxr5DTKAcMctuEfZmTGnhuP6idy0XfUqee17zbGKl1Xc+0ZlLcW9JJ2B/Wnz+/PmWUvwrUV9xsRijKaLkYxE5NH/+/G3ffvttBcxGGHqTPXbsWC5u+is7CJEbSYFClNYK/h5qTSxItWKPwRGEelAkqA6tpP4C6lBZWVm828wBOwYnADPu7Azr5F1EpX9UyGrTVYv6AeVijsni4wTJ+wKP4c+LqEZaZA8ilcb0Y8HLszo1LF3u/jOMYFFwojMJ/p6BbocjHyRRi1OtCY5E0ExQeYcxhgdc/LHBfAiYdu/e/Tz2kIugtwMOIyx/k5aWNrl75YXc+a/gAsY1g6L7JxMOboZy9O68R/w54sqVK58lvgsY8g0bNoxBWSwiT5L/qRE1Ay+MrkZalOqO/SgKZUxQS3QDaJxAdz44FrwJ+AEL6rFtv/79+7/EPI799AIYoZ5h/kHAhJcSNuZ0zg5ezQrP996CGRIe23cxDzAaB/YmI1++47LWIupsVpwlDi5ycuDAgec+uDCG0acQ+1EHKf4ZssXkX1+TyXSFOZzN/pNYtOLeVP7cuXPljTw+ME4rcXufaNlHcEtOxuiy2ByTY9BaFCuVxcmUEYNFdwctDizZCri+lvUKXL58mWcnpd1yz/O52+3mfiE+CyPpVt7qN3C5cuXgVSb3Obv/5RvM+xCmxx57TEPGrEW/Dywnxr7FvxF8nU7nK8wDaBjQrenatCbcbyokXY5IwO5dFrNi3l5r2AhI+ZbLbMWzFEi5a93r169z5HnJwkM5xJTm/pT/1FNP0RME5ajnBty9PmrckUxPPPEElQjmwfBHhCLe8ATvVkb+jhpihFu1Zs2aTJR9K1o6zna2vYSj+3XS8If/WbRoURbKmBipiL3AzglOvRXAcKHtP4FRTT0OvGPkyJGMXvLnn3/CO5QJcmA/WDINHz78lIj6CdrwTKNV9+7dd4jIybLtfzLORKA5Y0B3Jpxy/34pqWE4BGaLkhmkc+Ms/T2SRqc9tBcZhj0Rm8dA4fbz8zs5d+5cLuz60HHDzZ555hns7Npdpgw91Vv13hiWQ0BJGr6127RpU79fv37XResM9CIAC5izwsaL5SDkSWjXoNSmTZsWI2zG4lTciTS4qAqzRLwyYBmJOnRkZOTLKEC41tPhjs6JEyfyGl3TpGWVIYVPfn4+RED8G4nKxbI46mfWwf+FVmKVFpEBXGlzjcHxwEyGHInbgA1yRG8G8gi3iRrGSX7I3N4sMKVF8qYoZWKyjFNFhZyYmeQTlFImjAYScw8GRgfxLnUA4tsBtjFjxpTLzs7GZqj5r9UAlFUHv4gHP+C7JbiB3Ax3yHjquvj2hYnqDSszsMNviouLK4N566mVWsn7Cyoa/WHUAi0wiAMkOHMZWXxo3O0AthhHFJ/o6GhnmUUth4HzwtKKn8QBS5UVnbm7Ws4EJKXydMyDn6dDLH5g4OMc69rt9vJnG03m0aSgyvKOxl3kcL3vB0JRNUkN+yewQL9hCF1Lw4yqtnVGmEaIp3tryNwNjDr8cDQV3mAXYLTylFaDOnbsWBXPoGsRYjtjxN4ddyo4w2sMlHHzYj0F+l6JMr7YpQtpxHzdZTEq1MGAtU1JSdnfuXPnF1F5sIhakZubu0xEFAxmh0VEAMqFCBq6YsWKisCmzZs3l7kdIMTEOoqNceoMXCErhv5b5UyDpBREEzNC7FRMb5zSOvD7k9Y8BAM2znDNyhwdTj2B9Ym9gD4bYboIjxY150vntbgiNEGHPueAQbfPSf9EnslcliVRfJVnh1iHOqV8+fKgNY/4YSP2+68PtjtXD9hSdw1h4Na6qwdurptHGi818/HvF08Hmh0QTB1nxQcHNoRe3Q+b44dJlyK44Ul2nPnHwjnN2qGlehcbTz0YlFgwsmfPntWQZ2I9Ag0j9oKOjY2tFmwvGIpHi4MQrI1dvH1ufFnjWgvdMxAZg/CI1xEzvRvlHADqACly4cIFPkEafQPjNVHyPix7h0APuSnfsjB8wSKstce9wpA3RlDhleNfOB8MBaM1n3LgFmUwvbPwL1QAFuXPSss/9tcd/RtOuXlB+C8R4TQE710RCAqheKALs9odfa12Z+7x9yb+juH9CnoWPr2q69tLly6diWcfX6u9YB54bTDTY/CINxs0+8ABAIku4ouNEH0W44ikRPNAuQHsLQYo2QipjRDYhjxTratXr1alEmYIaJdIJDfeMpjGKCXRC6TLUq6Z6dOnr86NMzfGc2moiPpRlKqhcG/ID0nJPPT2uIV4yM7AIXAJykaJaD+M+OSyGa0+wKb5EV5d9mHUXl5X7b9yRCRKiQzDTH8OmulGu8hwVhTeDM6C5jVYtKgnQfOlpR5wPTDeJWiRt5BH0vZZs2YdvNkQMCEiRiQzjIFff0k3O93gx33BdkcfbGAV4QpLc2zmz2LMs169PCngnQMj/aLPJbzfTYuKPzTq9Rbn7X97NUqSX82JL/spjip5vXr1qhSU6PgMEWovDGwsomzZNssgKf6xfV1M3vrNsVn+G/r9j499q8Ph0XXbnB7/TsipH+pHI9/+xLi3Y45992ZHvC3/DR5k7HVUdKsGKXYxMBWfOitktXlTRO3UuGvjPHUArjECLtRg6tSphFxcYwAAAV1JREFURXgH3oz/CVO3bds2Kddmth84cGDJ1q1bf4OrObAI/SE7ad/ro35VuMaKSBb+RK2fYzNzkSvkCZwBkLck7ckp6F+HB4kZ+/fvT9m5c2fWrl27UpGfiQvZnL17907H2/J6yFJPcdRC5vbkVWYEADTexGdhZCsIHQH0hwutNsdkH7FiLaCzaVgviRj1iaDnWBOdOcBHsQjXQJZPqzsQxhvl2CzhcAH6uXfwvG1A7K6J5T7ch1DKkG9AYGCgL8HD90EZ5YqjFjJ3SxRwYVelsMJinQe/bgC/98MI90AhFptuhIqRolR38GygW2NtNEHZdrhkTxhfCwaEIIzzHGXy6OIsQATS908u7kMQY8g3AHtNEcHD9waJ4vUAwRKTJzSzYR+llAt+vy873pyQa7M0f/P3r558fd+A6nj7ItR46+CgGqCfYFmurex4GM8rAaeeg+H26CqxrdIU/C8AAAD//9Ji9UEAAAAGSURBVAMA4KeyOqzVdDsAAAAASUVORK5CYII=) center/contain no-repeat }',
      '.serv-wifi { width: 67px; height: 50px; display: inline-block; background: transparent url(data:image/png;base64,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) center/contain no-repeat }',
      '.serv-wifi-active { width: 67px; height: 50px; display: inline-block; background: transparent url(data:image/png;base64,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) center/contain no-repeat }',
      '.serv-curbside { width: 50px; height: 50px; display: inline-block; background: transparent url(data:image/png;base64,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) center/contain no-repeat }',
      '.serv-curbside-active { width: 50px; height: 50px; display: inline-block; background: transparent url(data:image/png;base64,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) center/contain no-repeat }',
      /* Inactive service icons - reduced brightness & saturation for lower contrast */
      '[class^="serv-"]:not([class*="-active"]) { opacity: 0.6}',
      /* Active service icons - enhanced brightness & full saturation for higher contrast */
      '[class^="serv-"][class*="-active"] { opacity: 1; filter: brightness(1) saturate(2);}',
      /* Dark theme inactive - even more reduced for visibility */
      '[wz-theme="dark"] [class^="serv-"]:not([class*="-active"]) { filter: brightness(5) saturate(1); }',
      /* Dark theme active - enhanced for visibility */
      '[wz-theme="dark"] [class^="serv-"][class*="-active"] { filter: brightness(1) saturate(1); }', //filter: brightness(1.8) saturate(1.3);
    ];
    $('head').append($('<style>', { type: 'text/css' }).html(cssArray.join('\n')));
  }

  function scriptupdatemonitor() {
    if (WazeToastr?.Ready) {
      // Create and start the ScriptUpdateMonitor
      const updateMonitor = new WazeToastr.Alerts.ScriptUpdateMonitor(scriptName, scriptVersion, downloadUrl, GM_xmlhttpRequest);
      updateMonitor.start(2, true); // Check every 2 hours, check immediately

      // Show the update dialog for the current version
      WazeToastr.Interface.ShowScriptUpdate(scriptName, scriptVersion, updateMessage, downloadUrl, forumURL);
    } else {
      setTimeout(scriptupdatemonitor, 250);
    }
  }
  scriptupdatemonitor();
  Logger.info(`${scriptName} initialized.`);

  /******************************************Changelogs***********************************************************
  2026.07.31.001
  - Added 'Create School Zone using Drawline' shortcut: draw a line and a 10m-wide school zone is created automatically
  2026.07.30.001
        <strong>WHAT'S NEW :-</strong><br><br>
      - Fixed a bug where typed primary name is missing when translation button is pressed<br>+ and other minor bug fixes and improvements.<br><br>
  2026.09.29.006
        - Migrated to use latest sdk patterns for keyboard shortcuts<br> + Added various language translation support for venue<br>+ and other minor bug fixes and improvements.<br><br>
  2026.07.17.02
        - Fixed: Interference between SCT Tool cities dropdown list<br>
    And minor bug fixes.<br><br>
  2026.07.11.001      
      - Venue and subvenue categories now follow editor's locale<br>
    And minor bug fixes.<br><br>
  2026.06.27.01
      - Bug fix for Lane end PH<br>
      - Bug fix for Shoulder end PH<br>
    And minor bug fixes.<br><br>
  2026.05.19.01
  <strong>NEW :- Added keyboard shortcuts for latest Hazard types:</strong><br><br>
  - Raised Pedestrian Crossing<br><br>
  - Pedestrian Crossing<br><br>
  - Narrow Bridge<br><br>
  - Lane End (abrupt)<br><br>
  - Shoulder End (abrupt)<br>
  2026.06.19.01
  - Now it uses the SDK version of link Enhancer!
  2026.06.15.01
  - Fixed issue with wme-sdk-plus preventing loading the script. Updated the commit hash for wme-sdk-plus to the latest version.
  2026.04.13.00
    - Updated from div.makePrimary.alias-item-action to div.makePrimary.alias-item-action-button for better compatibility PIE and to fix issues with WME PIE.
    2026.02.11.01
    - Added support for auto applying school names and speed limits for schoolzones using wmesdkplus
    - Minor bug fixes
    2026.01.22.01
    - Added Indian Petrol Stations
    - Added Nepal Petrol station and charging station brands button names
    - Minor bug fixes
    2026.01.08.01
  - Added GoStation brand
  2025.12.27.01
  - Temporary fix for alerts not displaying properly.
  2025.11.25.02
        <strong>Charging Station Automation:</strong><br>
      • Automatically sets network, cost type, and payment methods<br>
      • Auto-selects network from dropdown (BYD, CG Motors, Tata, etc.)<br>
      • Sets cost to "Paid" for branded stations<br>
      • Auto-populates payment methods (App, Online, Debit, Other)<br>
      <br>
      <strong>Supported Nepal Charging Stations:</strong><br>
      BYD, CG Motors, MG Motors, Tata Motors, Hyundai Motors, NEA, ElectriVa Nepal, Yatri, thee Go, MAW Vriddhi, OmodaJaecoo<br>
  2025.11.23.01
 - minor bug fixes for thee Go charging stations
  2025.11.13.02
 - minor bug fixes for electriva charging stations
  2025.11.12.01
 - Added ElectriVa charging station brand button for Nepal with aliases, 24/7 hours.
  2025.09.24.02
 - Enhanced NOC Button for Nepal Gas Stations with WazeToastr alert:</b><br>
    • <b>Case 1:</b> Empty gas station → Sets "NOC" as primary name<br>
    • <b>Case 2:</b> "NOC" primary with aliases → Prioritizes English aliases over Nepali<br>
    • <b>Case 3:</b> Non-NOC primary → Adds "NOC" as alias<br>
    • Uses regex to detect English vs Nepali text for smart name swapping<br>
    • Improved error handling and logging
  2025.09.24.01
  - Fixed     * Case 2: "NOC" primary with aliases → Prioritizes English aliases over Nepali<br>
  2025.09.22.01
  -Enhanced NOC Button for Nepal Gas Stations:</b><br>
    * Case 1: Empty gas station → Sets "NOC" as primary name<br>
    * Case 2: "NOC" primary with aliases → Swaps primary with first alias<br>
    * Case 3: Non-NOC primary → Adds "NOC" as alias<br>
  - Fixed InvalidStateError when brand already exists<br>
  - Improved error handling and logging</br>
  2025.09.05.01
  - Minor bug fixes for NOC.
  2025.08.28.01
  - Now when adding or selecting the RPP, it will auto open the address field and will select the house number field automatically
  2025.08.27.02
  - Now when adding or selecting the RPP, it will auto open the address field.
  2025.08.27.01
  - Fixed major memory leaks causing WME slowdowns after prolonged panning:
    * Properly cleanup MutationObservers and event listeners on selection changes
    * Added debouncing to prevent excessive function calls during UI updates
    * Prevented infinite recursion with retry limits for injection functions
    * Tracked and cleaned up individual alias observers to prevent accumulation
    * Added proper cleanup on page unload and selection changes
    * Improved performance by reducing unnecessary DOM queries and event handler registrations
2025.08.23.01
- Bug fixes for swapping POI names.
2025.08.19.04
  - Enhanced "Convert OTHER to Residential" with professional code refactoring and improved reliability.
  - Added comprehensive JSDoc documentation and modular function structure for better maintainability.
  - Improved error handling, user feedback, and multiple fallback strategies for button clicking.
  - Now fully automates the conversion process including clicking the "Convert to residential" button.
  - Compatible with new WME v2.309 house number types for both Residential Point Places (RPP) and venues.
2025.08.19.03
  - Added new shortcut "Convert OTHER to Residential" that prepares OTHER type venues for residential conversion.
  - When conditions are met (venue is OTHER type, name matches pattern like building numbers with Cyrillic characters, no existing house numbers), 
    the function copies the primary name to house numbers. User then manually clicks WME's "Convert to residential" button.
  - Simplified functionality to let WME handle the actual conversion process (RPP, etc.).
2025.08.18.01
  - Fix for multiple name swapping buttons displayed when used with WME PIE.
  2025.08.17.02
  - Fix for swap button not appearing on first venue selection after page refresh.
  - Added initial venue selection check after WME ready event.
2025.08.17.01
  - Re-inject swap buttons so icon appears immediately.
  2025.08.16.03
  - Fix for bug where POI points were not being selected correctly after creation.
  2025.08.16.02
  - Fix for bug where alt names were not adding correctly for gas stations and charging stations button clicked.
  - Charging stations button for Nepal has been added.
  2025.08.16.01
  - Fix for bug where gas station failed to save when gas station button pressed.
2025.08.15.03
  - Added automatic hazard layer group and individual layer enabling for hazard shortcuts.
  - Added support for Sharp Curves.
  - Added support for Complex Junctions.
  - Added support for Multiple Lanes Merge.
2025.08.11.04
  - Added support for updating Pakistan Petroleum brands using buttons.
  - Minor bug fixes.
2025.08.11.03
  - Added support for updating Pakistan Petroleum brands using buttons.
  - Added button colours
2025.08.10.15
  - Enhanced swap names functionality with arrow-up buttons for all aliases
  - Improved button visibility with white icons and proper positioning before delete buttons
  - Added support for swapping primary name with any specific alias (not just first one)
2025.08.10.14
  - Added swap names functionality between primary and alias names using WME SDK
2025.08.10.011
  - Legacy shortcuts key support
  ******************************************************************************************************************/
})();
