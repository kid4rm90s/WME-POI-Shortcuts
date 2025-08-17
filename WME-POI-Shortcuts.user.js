// ==UserScript==
// @name            WME POI Shortcuts
// @namespace       https://greasyfork.org/users/45389
// @version         2025.08.17.03
// @description     Various UI changes to make editing faster and easier.
// @author          kid4rm90s
// @include         /^https:\/\/(www|beta)\.waze\.com\/(?!user\/)(.{2,6}\/)?editor\/?.*$/
// @license         GNU GPLv3
// @connect         greasyfork.org
// @contributionURL https://github.com/WazeDev/Thank-The-Authors
// @grant           GM_xmlhttpRequest
// @grant           GM_addElement
// @require         https://greasyfork.org/scripts/24851-wazewrap/code/WazeWrap.js
// @require         https://update.greasyfork.org/scripts/509664/WME%20Utils%20-%20Bootstrap.js
// @require         https://greasyfork.org/scripts/523706-google-link-enhancer/code/Link%20Enhancer.js
// ==/UserScript==

/* global WazeWrap */
/* global bootstrap */

https: (function () {
  ('use strict');

  const updateMessage = `
Fix for swap button not appearing on first venue selection after page refresh.\n Fix for venue name and alias swapping not working correctly.`;
  const scriptName = GM_info.script.name;
  const scriptVersion = GM_info.script.version;
  const downloadUrl = 'https://greasyfork.org/scripts/545278-wme-poi-shortcuts/code/wme-poi-shortcuts.user.js';
  const forumURL = 'https://greasyfork.org/scripts/545278-wme-poi-shortcuts/feedback';

  // Gas Station Brand Names for Nepal and Pakistan
  const GAS_STATION_BRANDNAME = {
    Nepal: {
      countryCode: 'NP',
      brandnames: [
        {
          primaryName: 'NOC',
          brand: 'Nepal Oil Corporation',
          website: 'noc.org.np',
        
        },
      ],
    },
    Pakistan: {
      countryCode: 'PK',
      brandnames: [
        {
          primaryName: 'Askar 1',
          brand: 'Askar 1',
          aliases: ['Askar 1 Petrol Pump'],
          website: 'askaroil.com.pk',
        },
        {
          primaryName: 'Attock',
          brand: 'Attock',
          aliases: ['Attock Petrol Pump'],
          website: 'apl.com.pk',
        },
        {
          primaryName: 'Be Energy',
          brand: 'BE Energy',
          aliases: ['Be Petrol Pump'],
          website: 'beenergy.com.pk',
        },
        {
          primaryName: 'Byco',
          brand: 'Byco',
          aliases: ['Byco Petrol Pump'],
          website: 'byco.com.pk',
        },
        {
          primaryName: 'Caltex',
          brand: 'Caltex',
          aliases: ['Caltex Petrol Pump'],
          website: 'caltex.com',
        },
        {
          primaryName: 'Go',
          brand: 'Go',
          aliases: ['Go Petrol Pump'],
          website: 'gno.com.pk',
        },
        {
          primaryName: 'Hascol',
          brand: 'Hascol',
          aliases: [''],
          website: 'hascol.com',
        },
        {
          primaryName: 'LaGuardia',
          brand: 'LaGuardia',
          aliases: ['LaGuardia'],
          website: 'laguardia-group.com',
        },
        {
          primaryName: 'N3',
          brand: 'N3',
          aliases: ['N3 Petrol Pump'],
          website: 'n3.com.pk',
        },
        {
          primaryName: 'PSO',
          brand: 'Pakistan State Oil',
          aliases: ['PSO Petrol Pump', 'Pakistan State Oil'],
          website: 'psopk.com',
        },
        {
          primaryName: 'Puma Energy',
          brand: 'Puma',
          aliases: ['Puma'],
          website: 'pumaenergy.com',
        },
        {
          primaryName: 'Shell',
          brand: 'Shell',
          aliases: ['Shell'],
          website: 'shell.com.pk',
        },
        {
          primaryName: 'Taj Petroleum',
          brand: 'TAJ',
          aliases: ['Taj Petrol Pump'],
          website: 'tajcorporation.com',
        },
        {
          primaryName: 'Total Parco',
          brand: 'TOTAL - PARCO',
          aliases: ['Total Parco', 'Total', 'Total Petrol Pump'],
          website: 'totalparco.com.pk',
        },
        {
          primaryName: 'Zoom',
          brand: 'Zoom',
          aliases: ['Zoom Petroleum', 'Zoom Petrol Pump'],
          website: 'zoom.org.pk',
        },
        {
          primaryName: 'Target',
          brand: null,
          aliases: ['Target Petrol Pump'],
          website: 'targetlubricants.com',
        },
      ],
    },
  };
  const CHARGING_STATION_BRANDNAME = {
    Nepal: {
      countryCode: 'NP',
      brandnames: [
        {
          primaryName: 'BYD',
          brand: 'BYD',
          aliases: ['EV Charging Station'],
          website: 'cimex.com.np/charging-stations',
        },
        {
          primaryName: 'CG Motors',
          brand: 'CG Motors',
          aliases: ['EV Charging Station'],
          website: 'cg-ev.com/charger-station',
        },
        {
          primaryName: 'MG Motors',
          brand: 'MG Motors',
          aliases: ['EV Charging Station'],
          website: 'mgmotors.com.np/locate-ev-charger',
        },
        {
          primaryName: 'Tata Motors',
          brand: 'Tata Motors',
          aliases: ['EV Charging Station'],
          website: 'tatacars.sipradi.com.np/vehicle/charginglocation',
        },
        {
          primaryName: 'Hyundai Motors',
          brand: 'Hyundai Motors',
          aliases: ['EV Charging Station'],
          website: 'laxmihyundai.com/charge-points',
        },
        {
          primaryName: 'NEA',
          brand: 'Nepal Electricity Authority',
          aliases: ['EV Charging Station'],
          website: 'nea.org.np',
        },
        {
          primaryName: 'ElectriVa',
          brand: 'ElectriVa Nepal',
          aliases: ['EV Charging Station'],
          website: 'electrivanepal.com/locations',
        },
        {
          primaryName: 'Yatri',
          brand: 'Yatri',
          aliases: ['EV Charging Station'],
          website: 'yatrienergy.com/',
        },
        {
          primaryName: 'three Go',
          brand: 'three Go',
          aliases: ['EV Charging Station'],
          website: 'www.theego.com.np/thee-go-chargepoint/',
        },
        {
          primaryName: 'MAW Vriddhi',
          brand: 'MAW Vriddhi',
          aliases: ['EV Charging Station'],
          website: 'mawevcharging.com/',
        },
        {
          primaryName: 'OmodaJaencoo',
          brand: 'OmodaJaencoo',
          aliases: ['EV Charging Station'],
          website: 'omodajaecoonepal.com/charging-stations-in-nepal',
        },
        {
          primaryName: 'Charging Station',
          brand: '',
          aliases: ['EV Charging Station'],
          website: '',
        },
      ],
    },
  };
  if (typeof unsafeWindow !== 'undefined' && unsafeWindow.SDK_INITIALIZED) {
    unsafeWindow.SDK_INITIALIZED.then(initScript);
  } else if (typeof window.SDK_INITIALIZED !== 'undefined') {
    window.SDK_INITIALIZED.then(initScript);
  } else {
    console.error('WME SDK is not available. Script will not run.');
  }

  // Inject custom CSS for grayed out disabled options
  injectCSSWithID('poiDisabledOptionStyle', `select[id^='poiItem'] option:disabled { color: #bbb !important; background: #000000ff !important; }`);

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

  // --- GLE (Google Link Enhancer) Integration ---
  // GLE settings and messages
  // Load GLE enabled state from localStorage
  let gleEnabled = false;
  let gleShowTempClosed = true;
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

  // Add GLE controls to the sidebar UI
  function buildGLEControls() {
    return `
    <div style="margin:6px 0 10px 0; padding:4px 8px; background:transparent; border-radius:4px;">
      <label style="font-size:10px; font-weight:bold;">
        <input type="checkbox" id="_cbEnableGLE" ${GLE && GLE.enabled ? 'checked' : ''} /> Enable Google Link Enhancer
      </label>
    </div>
  `;
  }
  function initScript() {
    // initialize the sdk with your script id and script name
    const wmeSDK = typeof unsafeWindow !== 'undefined' && unsafeWindow.getWmeSdk ? unsafeWindow.getWmeSdk({ scriptId: 'wme-poi', scriptName: 'WME POI' }) : getWmeSdk({ scriptId: 'wme-poi', scriptName: 'WME POI' });

    // Store the original GLE config
    const gleConfig = {
      enabled: GLE.enabled,
      showTempClosedPOIs: GLE.showTempClosedPOIs,
      closedPlace: GLE.closedPlace,
      multiLinked: GLE.multiLinked,
      linkedToThisPlace: GLE.linkedToThisPlace,
      linkedNearby: GLE.linkedNearby,
      linkedToXPlaces: GLE.linkedToXPlaces,
      badLink: GLE.badLink,
      tooFar: GLE.tooFar,
    };

    GLE = new GoogleLinkEnhancer();

    //***** Set Google Link Enhancer strings *****
    GLE.strings.closedPlace = gleConfig.closedPlace;
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

    // register to events
    wmeSDK.Events.once({ eventName: 'wme-ready' }).then(() => {
      // Setup custom shortcuts after WME is ready
      setupShortcuts(wmeSDK);
      // Register script sidebar tab for venue dropdown
      registerSidebarScriptTab(wmeSDK);
      // Check for initial venue selection and inject swap button if needed
      setTimeout(() => {
        injectButtonStation(wmeSDK);
        injectSwapNamesButton(wmeSDK);
      }, 500); // Small delay to ensure UI is fully loaded
    });
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
        injectButtonStation(wmeSDK);
        injectSwapNamesButton(wmeSDK);
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
    // Categories and subcategories as per latest WME spec
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
    let html = `<select id="poiItem${itemNumber}" style="font-size:10px;height:20px;width:100%;max-width:200px;margin:2px 0;">`;
    VENUE_CATEGORIES.forEach((cat) => {
      try {
        const categoryName = I18n?.translations?.[I18n.currentLocale()]?.venues?.categories?.[cat.key] || cat.key;
        html += `<option value="${cat.key}" data-icon="${cat.icon}" style="font-weight:bold;">${categoryName}</option>`;
        cat.subs.forEach((sub) => {
          const subCategoryName = I18n?.translations?.[I18n.currentLocale()]?.venues?.categories?.[sub] || sub;
          html += `<option value="${sub}" data-icon="${cat.icon}">${subCategoryName}</option>`;
        });
      } catch (e) {
        // Fallback if I18n is not available
        html += `<option value="${cat.key}" data-icon="${cat.icon}" style="font-weight:bold;">${cat.key}</option>`;
        cat.subs.forEach((sub) => {
          html += `<option value="${sub}" data-icon="${cat.icon}">${sub}</option>`;
        });
      }
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
    html += `<div style='font-size:10px;color:#888;margin-top:8px;'>You can bind keyboard shortcuts using WME's native shortcuts section.</div>`;
    setTimeout(() => {
      for (let i = 1; i <= 10; i++) {
        loadPOIShortcutItem(i);
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
            // Prevent duplicate category selection
            // if (this.id.startsWith('poiItem')) {
            //   const selectedCategories = [];
            //   for (let j = 1; j <= 10; j++) {
            //     const val = $(`#poiItem${j}`).val();
            //     if (val) selectedCategories.push(val);
            //   }
            //   for (let j = 1; j <= 10; j++) {
            //     $(`#poiItem${j} option`).prop('disabled', false).removeAttr('title');
            //   }
            //   for (let j = 1; j <= 10; j++) {
            //     const currentVal = $(`#poiItem${j}`).val();
            //     for (const cat of selectedCategories) {
            //       if (cat !== currentVal) {
            //         $(`#poiItem${j} option[value='${cat}']`).prop('disabled', true).attr('title', 'this category is already selected.');
            //       }
            //     }
            //   }
            // }
          });
      }
      // Initial duplicate prevention
      // const selectedCategories = [];
      // for (let j = 1; j <= 10; j++) {
      //   const val = $(`#poiItem${j}`).val();
      //   if (val) selectedCategories.push(val);
      // }
      // for (let j = 1; j <= 10; j++) {
      //   $(`#poiItem${j} option`).prop('disabled', false).removeAttr('title');
      // }
      // for (let j = 1; j <= 10; j++) {
      //   const currentVal = $(`#poiItem${j}`).val();
      //   for (const cat of selectedCategories) {
      //     if (cat !== currentVal) {
      //       $(`#poiItem${j} option[value='${cat}']`).prop('disabled', true).attr('title', 'this category is already selected.');
      //     }
      //   }
      // }
    }, 0);
    return html;
  }
  /*
  // --- wmeSDK Shortcuts Setup ---
  // TODO: Re-enable when wmeSDK fixes shortcuts persistence after page refresh
  /*
  function setupShortcuts(wmeSDK) {
    // Create 10 POI shortcut actions, one for each item
    for (let i = 1; i <= 10; i++) {
      // Assign shortcutKeys: C1-C9, C0 for 10
      const shortcutKey = i === 10 ? 'C0' : `C${i}`;
      const shortcutId = `create-poi-shortcut-${i}`;
      // Remove previous shortcut if registered
      if (wmeSDK.Shortcuts.isShortcutRegistered({ shortcutId })) {
        wmeSDK.Shortcuts.deleteShortcut({ shortcutId });
      }
      // Check if shortcut keys are in use
      if (wmeSDK.Shortcuts.areShortcutKeysInUse({ shortcutKeys: shortcutKey })) {
        console.warn(`Shortcut keys ${shortcutKey} already in use, skipping registration for POI Shortcut #${i}`);
        continue;
      }
      wmeSDK.Shortcuts.createShortcut({
        callback: () => {
          // Get selected values from the UI for this item
          const cat = $(`#poiItem${i}`).val();
          const lock = parseInt($(`#poiLock${i}`).val(), 10);
          const geomType = $(`#poiGeom${i}`).val();
          // Geometry: area = drawPolygon, point = drawPoint
          let drawPromise = geomType === 'point' ? wmeSDK.Map.drawPoint() : wmeSDK.Map.drawPolygon();
          drawPromise.then((geometry) => {
            let newVenue = wmeSDK.DataModel.Venues.addVenue({
              category: cat,
              geometry: geometry,
            });
            wmeSDK.Editing.setSelection({
              selection: {
                ids: [newVenue.toString()],
                objectType: 'venue',
              },
            });
            // Only set lock if lock > 0 (lockRank 1-4)
            if (!isNaN(lock) && lock > 0) {
              wmeSDK.DataModel.Venues.updateVenue({
                venueId: newVenue.toString(),
                lockRank: lock,
              });
            }
            // Nepal-specific logic for Gas Station
            const topCountry = wmeSDK.DataModel.Countries.getTopCountry();
            if (topCountry && (topCountry.name === 'Nepal' || topCountry.code === 'NP') && cat === 'GAS_STATION') {
              wmeSDK.DataModel.Venues.updateVenue({
                venueId: newVenue.toString(),
                name: 'NOC',
                brand: 'Nepal Oil Corporation',
              });
            }
          });
        },
        description: `Create POI Shortcut #${i}`,
        shortcutId,
        shortcutKeys: shortcutKey,
      });
    }

    // Shortcuts that click on WME's existing UI buttons for POI creation/modification
    wmeSDK.Shortcuts.createShortcut({
      callback: () => {
        $("wz-icon[name='toll-booth']").parent().trigger('click');
      },
      description: 'Add Toll Booth',
      shortcutId: 'add-toll-booth',
      shortcutKeys: null,
    });

    wmeSDK.Shortcuts.createShortcut({
      callback: () => {
        $("wz-icon[name='railway-crossing']").parent().trigger('click');
      },
      description: 'Add Level Crossing',
      shortcutId: 'add-level-crossing',
      shortcutKeys: null,
    });

    wmeSDK.Shortcuts.createShortcut({
      callback: () => {
        $("wz-icon[name='school-zone']").parent().trigger('click');
      },
      description: 'Create School Zone',
      shortcutId: 'create-school-zone',
      shortcutKeys: null,
    });
  }
  */
  /***********************************************legacy shortcuts below*********************************************** */
  // --- Legacy Shortcuts Setup (Temporary until wmeSDK fixes shortcuts persistence) ---
  function setupShortcuts(wmeSDK) {
    // Legacy shortcuts configuration - maps shortcut numbers to keyboard combos
    var shortcutsConfig = [
      {
        handler: 'WME-POI-Shortcuts_poi1',
        title: 'POI Shortcut 1',
        func: function (ev) {
          createPOIFromShortcut(1, wmeSDK);
        },
        key: null,
        arg: { slotNumber: 1 },
      },
      {
        handler: 'WME-POI-Shortcuts_poi2',
        title: 'POI Shortcut 2',
        func: function (ev) {
          createPOIFromShortcut(2, wmeSDK);
        },
        key: null,
        arg: { slotNumber: 2 },
      },
      {
        handler: 'WME-POI-Shortcuts_poi3',
        title: 'POI Shortcut 3',
        func: function (ev) {
          createPOIFromShortcut(3, wmeSDK);
        },
        key: null,
        arg: { slotNumber: 3 },
      },
      {
        handler: 'WME-POI-Shortcuts_poi4',
        title: 'POI Shortcut 4',
        func: function (ev) {
          createPOIFromShortcut(4, wmeSDK);
        },
        key: null,
        arg: { slotNumber: 4 },
      },
      {
        handler: 'WME-POI-Shortcuts_poi5',
        title: 'POI Shortcut 5',
        func: function (ev) {
          createPOIFromShortcut(5, wmeSDK);
        },
        key: null,
        arg: { slotNumber: 5 },
      },
      {
        handler: 'WME-POI-Shortcuts_poi6',
        title: 'POI Shortcut 6',
        func: function (ev) {
          createPOIFromShortcut(6, wmeSDK);
        },
        key: null,
        arg: { slotNumber: 6 },
      },
      {
        handler: 'WME-POI-Shortcuts_poi7',
        title: 'POI Shortcut 7',
        func: function (ev) {
          createPOIFromShortcut(7, wmeSDK);
        },
        key: null,
        arg: { slotNumber: 7 },
      },
      {
        handler: 'WME-POI-Shortcuts_poi8',
        title: 'POI Shortcut 8',
        func: function (ev) {
          createPOIFromShortcut(8, wmeSDK);
        },
        key: null,
        arg: { slotNumber: 8 },
      },
      {
        handler: 'WME-POI-Shortcuts_poi9',
        title: 'POI Shortcut 9',
        func: function (ev) {
          createPOIFromShortcut(9, wmeSDK);
        },
        key: null,
        arg: { slotNumber: 9 },
      },
      {
        handler: 'WME-POI-Shortcuts_poi10',
        title: 'POI Shortcut 10',
        func: function (ev) {
          createPOIFromShortcut(10, wmeSDK);
        },
        key: null,
        arg: { slotNumber: 10 },
      },
      {
        handler: 'WME-POI-Shortcuts_toll-booth',
        title: 'Add Toll Booth',
        func: function (ev) {
          ensureHazardLayersEnabled('layer-switcher-item_permanent_hazard_toll_booth', () => {
            WazeWrap.Alerts.info('POI Shortcut', `POI Type: <b>Toll Booth</b>`, false, false, 2000);
            $("wz-icon[name='toll-booth']").parent().trigger('click');
          });
        },
        key: -1, // No default key, user can set custom
        arg: {},
      },
      {
        handler: 'WME-POI-Shortcuts_level-crossing',
        title: 'Add Level Crossing',
        func: function (ev) {
          ensureHazardLayersEnabled('layer-switcher-item_permanent_hazard_railroad_crossing', () => {
            WazeWrap.Alerts.info('POI Shortcut', `POI Type: <b>Level Crossing</b>`, false, false, 2000);
            $("wz-icon[name='railway-crossing']").parent().trigger('click');
          });
        },
        key: -1, // No default key, user can set custom
        arg: {},
      },
      {
        handler: 'WME-POI-Shortcuts_school-zone',
        title: 'Create School Zone',
        func: function (ev) {
          ensureHazardLayersEnabled('layer-switcher-item_permanent_hazard_school_zone', () => {
            WazeWrap.Alerts.info('POI Shortcut', `POI Type: <b>School Zone</b>`, false, false, 2000);
            $("wz-icon[name='school-zone']").parent().trigger('click');
          });
        },
        key: -1, // No default key, user can set custom
        arg: {},
      },
      {
        handler: 'WME-POI-Shortcuts_sharp-curves',
        title: 'Create Sharp Curves',
        func: function (ev) {
          ensureHazardLayersEnabled('layer-switcher-item_permanent_hazard_dangerous_curve', () => {
            WazeWrap.Alerts.info('POI Shortcut', `POI Type: <b>Sharp Curves</b>`, false, false, 2000);
            $("wz-icon[name='sharp-curve-ahead']").parent().trigger('click');
          });
        },
        key: -1, // No default key, user can set custom
        arg: {},
      },
      {
        handler: 'WME-POI-Shortcuts_complex-junctions',
        title: 'Create Complex Junctions',
        func: function (ev) {
          ensureHazardLayersEnabled('layer-switcher-item_permanent_hazard_dangerous_intersection', () => {
            WazeWrap.Alerts.info('POI Shortcut', `POI Type: <b>Complex Junctions</b>`, false, false, 2000);
            $("wz-icon[name='dangerous-intersection']").parent().trigger('click');
          });
        },
        key: -1, // No default key, user can set custom
        arg: {},
      },
      {
        handler: 'WME-POI-Shortcuts_multiple-lanes-merging',
        title: 'Create Multiple Lanes Merging',
        func: function (ev) {
          ensureHazardLayersEnabled('layer-switcher-item_permanent_hazard_dangerous_merge', () => {
            WazeWrap.Alerts.info('POI Shortcut', `POI Type: <b>Multiple Lanes Merging</b>`, false, false, 2000);
            $("wz-icon[name='merge-ahead']").parent().trigger('click');
          });
        },
        key: -1, // No default key, user can set custom
        arg: {},
      },
    ];

    // Register legacy shortcuts
    for (var i = 0; i < shortcutsConfig.length; ++i) {
      WMEKSRegisterKeyboardShortcut('WME-POI-Shortcuts', 'WME POI Shortcuts', shortcutsConfig[i].handler, shortcutsConfig[i].title, shortcutsConfig[i].func, shortcutsConfig[i].key, shortcutsConfig[i].arg);
    }

    WMEKSLoadKeyboardShortcuts('WME-POI-Shortcuts');

    window.addEventListener(
      'beforeunload',
      function () {
        WMEKSSaveKeyboardShortcuts('WME-POI-Shortcuts');
      },
      false
    );
  }

  // Function to create POI from shortcut slot
  function createPOIFromShortcut(slotNumber, wmeSDK) {
    try {
      // Get selected values from the UI for this item
      const cat = $(`#poiItem${slotNumber}`).val();
      const lock = parseInt($(`#poiLock${slotNumber}`).val(), 10);
      const geomType = $(`#poiGeom${slotNumber}`).val();

      if (!cat || cat === '') {
        console.warn(`POI Shortcut ${slotNumber}: No category selected`);
        return;
      }
      // Show WazeWrap alert with POI info before drawing
      const poiName = $(`#poiItem${slotNumber} option:selected`).text();
      const lockLevel = !isNaN(lock) ? parseInt(lock, 10) + 1 : 1;
      const areaType = geomType === 'point' ? 'Point' : 'Area';
      WazeWrap.Alerts.info('POI Shortcut', `Selected POI Name: <b>${poiName}</b><br>Lock Level: <b>${lockLevel}</b><br>Type: <b>${areaType}</b>`, false, false, 2500);

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
          // Nepal-specific logic for Gas Station
          const topCountry = wmeSDK.DataModel.Countries.getTopCountry();
          if (topCountry && (topCountry.name === 'Nepal' || topCountry.code === 'NP') && cat === 'GAS_STATION') {
            wmeSDK.DataModel.Venues.updateVenue({
              venueId: newVenue.toString(),
              name: 'NOC',
              brand: 'Nepal Oil Corporation',
            });
          }
        })
        .catch((err) => {
          if (err && err.name === 'InvalidStateError') {
            console.log('POI drawing was cancelled by the user.');
          } else {
            console.error('Error during POI drawing:', err);
          }
        });
    } catch (error) {
      console.error(`Error creating POI from shortcut ${slotNumber}:`, error);
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
          console.warn('Hazard group toggle not found');
        }

        // If group is already enabled, directly enable the specific layer
        enableSpecificHazardLayer(hazardLayerId, callback);
      }, 50);
    } catch (error) {
      console.error('Error enabling hazard layers:', error);
      // Execute callback even if there's an error to prevent hanging
      if (callback && typeof callback === 'function') {
        setTimeout(callback, 100);
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
          console.warn(`Hazard layer element not found: ${hazardLayerId}`);
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
      console.error('Error enabling specific hazard layer:', error);
      // Execute callback even if there's an error to prevent hanging
      if (callback && typeof callback === 'function') {
        setTimeout(callback, 100);
      }
    }
  }

  // --- Legacy Keyboard Shortcuts System (from WME Street to River PLUS) ---
  function WMEKSRegisterKeyboardShortcut(scriptName, shortcutsHeader, newShortcut, shortcutDescription, functionToCall, shortcutKeysObj, arg) {
    try {
      I18n.translations[I18n.locale].keyboard_shortcuts.groups[scriptName].members.length;
    } catch (c) {
      (W.accelerators.Groups[scriptName] = []),
        (W.accelerators.Groups[scriptName].members = []),
        (I18n.translations[I18n.locale].keyboard_shortcuts.groups[scriptName] = []),
        (I18n.translations[I18n.locale].keyboard_shortcuts.groups[scriptName].description = shortcutsHeader),
        (I18n.translations[I18n.locale].keyboard_shortcuts.groups[scriptName].members = []);
    }
    if (functionToCall && 'function' == typeof functionToCall) {
      (I18n.translations[I18n.locale].keyboard_shortcuts.groups[scriptName].members[newShortcut] = shortcutDescription),
        W.accelerators.addAction(newShortcut, {
          group: scriptName,
        });
      var i = '-1',
        j = {};
      (j[i] = newShortcut),
        W.accelerators._registerShortcuts(j),
        null !== shortcutKeysObj && ((j = {}), (j[shortcutKeysObj] = newShortcut), W.accelerators._registerShortcuts(j)),
        W.accelerators.events.register(newShortcut, null, function () {
          functionToCall(arg);
        });
    } else alert('The function ' + functionToCall + ' has not been declared');
  }

  function WMEKSLoadKeyboardShortcuts(scriptName) {
    console.log('WMEKSLoadKeyboardShortcuts(' + scriptName + ')');
    if (localStorage[scriptName + 'KBS'])
      for (var shortcuts = JSON.parse(localStorage[scriptName + 'KBS']), i = 0; i < shortcuts.length; i++)
        try {
          W.accelerators._registerShortcuts(shortcuts[i]);
        } catch (error) {
          console.log(error);
        }
  }

  function WMEKSSaveKeyboardShortcuts(scriptName) {
    console.log('WMEKSSaveKeyboardShortcuts(' + scriptName + ')');
    var shortcuts = [];
    for (var actionName in W.accelerators.Actions) {
      var shortcutString = '';
      if (W.accelerators.Actions[actionName].group == scriptName) {
        W.accelerators.Actions[actionName].shortcut
          ? (W.accelerators.Actions[actionName].shortcut.altKey === !0 && (shortcutString += 'A'),
            W.accelerators.Actions[actionName].shortcut.shiftKey === !0 && (shortcutString += 'S'),
            W.accelerators.Actions[actionName].shortcut.ctrlKey === !0 && (shortcutString += 'C'),
            '' !== shortcutString && (shortcutString += '+'),
            W.accelerators.Actions[actionName].shortcut.keyCode && (shortcutString += W.accelerators.Actions[actionName].shortcut.keyCode))
          : (shortcutString = '-1');
        var shortcutObj = {};
        (shortcutObj[shortcutString] = W.accelerators.Actions[actionName].id), (shortcuts[shortcuts.length] = shortcutObj);
      }
    }
    localStorage[scriptName + 'KBS'] = JSON.stringify(shortcuts);
  }
  /******************************************legacy shortcuts until here above************************************ */

  function getGasStationCategoryKey() {
    // Use I18n to get the correct category key for gas station
    // Fallback to 'GAS_STATION' if not found
    let locale = typeof I18n !== 'undefined' && I18n.currentLocale ? I18n.currentLocale() : 'en';
    let categories = I18n?.translations?.[locale]?.venues?.categories || {};
    // Find the key for 'Gas Station' or 'Petrol Station' in the current language
    for (const key in categories) {
      if (categories[key] === 'Gas Station' || categories[key] === 'Petrol Station') {
        return key;
      }
    }
    // Fallback to 'GAS_STATION'
    return 'GAS_STATION';
  }

  function getChargingStationCategoryKey() {
    // Charging station category key is consistent across all locales
    return 'CHARGING_STATION';
  }

  function swapPrimaryAndAliasNames(wmeSDK, aliasIndex = 0) {
    // Only run if a venue is selected
    const selection = wmeSDK.Editing.getSelection();
    if (!selection || selection.objectType !== 'venue' || !selection.ids || selection.ids.length !== 1) {
      console.warn('No venue selected for name swapping');
      return;
    }

    const venueId = selection.ids[0];
    const venue = wmeSDK.DataModel.Venues.getById({ venueId });

    if (!venue) {
      console.warn('Venue not found');
      return;
    }

    // Check if venue has a name and at least one alias
    if (!venue.name || !venue.aliases || venue.aliases.length === 0) {
      console.warn('Venue must have both a primary name and at least one alias to swap');
      return;
    }

    // Validate alias index
    if (aliasIndex < 0 || aliasIndex >= venue.aliases.length) {
      console.warn(`Invalid alias index: ${aliasIndex}. Available aliases: ${venue.aliases.length}`);
      return;
    }

    // Get current primary name and target alias
    const currentPrimaryName = venue.name;
    const targetAlias = venue.aliases[aliasIndex];

    // Create new aliases array with the old primary name replacing the target alias
    const newAliases = [...venue.aliases];
    newAliases[aliasIndex] = currentPrimaryName;

    try {
      // Update venue with swapped names
      wmeSDK.DataModel.Venues.updateVenue({
        venueId: venueId,
        name: targetAlias,
        aliases: newAliases,
      });

      console.log(`Swapped names: "${currentPrimaryName}" ↔ "${targetAlias}" (alias index: ${aliasIndex})`);

      // Re-inject swap buttons so icon appears immidiately
      setTimeout(function() {
        injectSwapNamesButton(wmeSDK);
      }, 150);

    } catch (error) {
      console.error('Error swapping venue names:', error);
    }
  }

  function injectSwapNamesButton(wmeSDK) {
    // Only run if a venue is selected
    const selection = wmeSDK.Editing.getSelection();
    if (!selection || selection.objectType !== 'venue' || !selection.ids || selection.ids.length !== 1) return;

    const venueId = selection.ids[0];
    const venue = wmeSDK.DataModel.Venues.getById({ venueId });

    if (!venue) return;

    // Wait for the venue aliases section to exist
    function tryInjectSwapButton() {
      // Look for the aliases list and inject button into ALL alias items' actions containers
      const $aliasesList = $('.aliases-list');
      let foundAliases = false;

      if ($aliasesList.length > 0) {
        // Find ALL alias items and add swap button to each
        $aliasesList.find('wz-list-item').each(function (index) {
          const $aliasItem = $(this);
          const $actionsContainer = $aliasItem.find('div[slot="actions"].alias-item-actions');

          if ($actionsContainer.length > 0) {
            // Check if swap button already exists in this specific alias item
            if ($actionsContainer.find('.swap-names-btn').length === 0) {
              foundAliases = true;

              // Check if venue has both name and aliases before showing button
              const hasSwappableNames = venue.name && venue.aliases && venue.aliases.length > 0;
              if (!hasSwappableNames) return true; // Continue to next iteration

              // Create swap button for this specific alias (swap with the alias at this index)
              const buttonHtml = `
                <wz-button color="blue" size="sm" class="alias-item-action alias-item-action-swap swap-names-btn" title="Swap primary name with this alias" data-alias-index="${index}">
                  <i class="w-icon w-icon-arrow-up alias-item-action-icon"></i>
                </wz-button>
              `;

              $actionsContainer.prepend(buttonHtml);
            }
          }
        });
      }

      // Fallback method if no aliases found
      // if (!foundAliases) {
      //   const $nameField = $('input[placeholder*="name" i], input[name*="name" i], .venue-name input, .place-name input');
      //   if ($nameField.length > 0) {
      //     const $targetContainer = $nameField.closest('.form-group, .field-group, .control-group').first();
      //     if ($targetContainer.length > 0 && $('.swap-names-btn').length === 0) {
      //       const hasSwappableNames = venue.name && venue.aliases && venue.aliases.length > 0;
      //       if (hasSwappableNames) {
      //         const buttonHtml = `
      //           <div class='form-group swap-names-container' style='margin: 5px 0; display: inline-block;'>
      //             <wz-button color="blue" size="sm" class="swap-names-btn" title="Swap primary name with first alias" data-alias-index="0">
      //               <i class="w-icon w-icon-arrow-up"></i> Swap Names
      //             </wz-button>
      //           </div>
      //         `;
      //         $targetContainer.after(buttonHtml);
      //         foundAliases = true;
      //       }
      //     }
      //   }
      // }

      if (!foundAliases) {
        setTimeout(tryInjectSwapButton, 100);
        return;
      }

      // Button click handler for all swap buttons
      $('.swap-names-btn')
        .off('click.swapnames')
        .on('click.swapnames', function (e) {
          e.preventDefault();
          const aliasIndex = parseInt($(this).attr('data-alias-index') || '0', 10);
          swapPrimaryAndAliasNames(wmeSDK, aliasIndex);
        });
    }
    tryInjectSwapButton();
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
    const isPakistan = !!topCountry && (topCountry.name === 'Pakistan' || topCountry.code === 'PK');
    const isGasStation = !!venue && Array.isArray(venue.categories) && venue.categories.includes(gasStationKey);
    const isChargingStation = !!venue && Array.isArray(venue.categories) && venue.categories.includes(chargingStationKey);
    
    // Only show buttons for Nepal gas/charging stations or Pakistan gas stations
    if (!((isGasStation || isChargingStation) && isNepal) && !(isGasStation && isPakistan)) return;

    // Show brand buttons for Nepal and Pakistan gas stations, and Nepal charging stations
    function tryInjectBrandButtons() {
      const $catControl = $('.categories-control');
      if ($catControl.length === 0) {
        setTimeout(tryInjectBrandButtons, 150);
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

      // Log current brand value for debugging
      if (isPakistan && isGasStation) {
        console.log('[Brand Debug] Current venue brand value (Pakistan Gas Station):', venue.brand);
      } else if (isNepal && isChargingStation) {
        console.log('[Brand Debug] Current venue brand value (Nepal Charging Station):', venue.brand);
      }

      // Build buttons for each brand
      let buttonsHtml = `<div class='form-group e85 e85-e85-14'><label class='control-label'>Set ${stationTypeName} Brand</label>`;
      countryBrands.forEach((brandObj) => {
        buttonsHtml += `<button class='waze-btn waze-btn-small waze-btn-white e85 ${buttonClass}' style='border:2px solid #0078d7;border-radius:4px;margin:2px;' data-primary='${brandObj.primaryName}' data-brand='${
          brandObj.brand
        }' data-website='${brandObj.website || ''}' data-category='${categoryKey}'>${brandObj.primaryName}</button> `;
      });
      buttonsHtml += `</div>`;
      $catControl.after(buttonsHtml);

      // Button click handler for both gas station and charging station brands
      $('.gas-station-brand-btn, .charging-station-brand-btn').on('click', function () {
        const primaryName = $(this).attr('data-primary');
        const brand = $(this).attr('data-brand');
        const website = $(this).attr('data-website');
        const categoryKey = $(this).attr('data-category');

        // Find the selected brand object to get its predefined aliases
        let selectedBrandObj = null;
        if (countryBrands) {
          selectedBrandObj = countryBrands.find(brandObj => brandObj.primaryName === primaryName);
        }

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

        // Build aliases array: start with existing venue aliases, add current name if different, then add brand aliases
        let aliases = Array.isArray(venue.aliases) ? venue.aliases.slice() : [];
        
        // Add current venue name to aliases if it's different from the selected primaryName
        if (venue.name && venue.name !== primaryName && !aliases.includes(venue.name)) {
          aliases.push(venue.name);
        }
        
        // Add predefined aliases from the brand data
        if (selectedBrandObj && Array.isArray(selectedBrandObj.aliases)) {
          selectedBrandObj.aliases.forEach(alias => {
            // Only add if it's not empty and not already in the aliases array
            if (alias && alias.trim() !== '' && !aliases.includes(alias)) {
              aliases.push(alias);
            }
          });
        }

        // Log venue before update
        const venueBefore = wmeSDK.DataModel.Venues.getById({ venueId });
        console.log('[Brand Debug] Venue before update:', venueBefore);
        console.log('[Brand Debug] Selected brand object:', selectedBrandObj);
        console.log('[Brand Debug] Final aliases array:', aliases);

        const updateObj = {
          venueId: venueId,
          name: primaryName,
          aliases: aliases,
          brand: brand,
        };
        if (website) {
          updateObj.url = website;
        }
        console.log('[Brand Debug] Attempting updateVenue (no lockRank) with:', updateObj);
        try {
          wmeSDK.DataModel.Venues.updateVenue(updateObj);
          console.log('[Brand Debug] updateVenue (no lockRank) called successfully.');
          // Log venue after update
          setTimeout(() => {
            const venueAfter = wmeSDK.DataModel.Venues.getById({ venueId });
            console.log('[Brand Debug] Venue after update:', venueAfter);
          }, 500);
          // Now update lockRank in a separate call
          if (lockRank !== undefined && lockRank !== null) {
            setTimeout(() => {
              try {
                wmeSDK.DataModel.Venues.updateVenue({ venueId: venueId, lockRank: lockRank });
                console.log('[Brand Debug] lockRank updated successfully:', lockRank);
              } catch (err2) {
                console.warn('[Brand Debug] lockRank update failed:', err2);
              }
            }, 300);
          }
        } catch (err) {
          console.warn('[Brand Debug] Update failed:', err);
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
          ${buildGLEControls()}
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
      }, 0);
    } catch (e) {
      console.error('Failed to register POI Shortcuts script tab:', e);
    }
  }

  function scriptupdatemonitor() {
    if (WazeWrap?.Ready) {
      bootstrap({ scriptUpdateMonitor: { downloadUrl } });
      WazeWrap.Interface.ShowScriptUpdate(scriptName, scriptVersion, updateMessage, downloadUrl, forumURL);
    } else {
      setTimeout(scriptupdatemonitor, 250);
    }
  }
  // Start the "scriptupdatemonitor"
  scriptupdatemonitor();
  console.log(`${scriptName} initialized.`);

  /******************************************Changelogs***********************************************************
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
