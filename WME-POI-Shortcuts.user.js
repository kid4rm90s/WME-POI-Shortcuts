// ==UserScript==
// @name            WME POI Shortcuts
// @namespace       https://greasyfork.org/users/45389
// @version         2025.08.10.007
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
// @require         https://update.greasyfork.org/scripts/523706/1569240/Link%20Enhancer.js
// ==/UserScript==

/* global WazeWrap */
/* global bootstrap */

(function () {
  ('use strict');

  if (typeof unsafeWindow !== 'undefined' && unsafeWindow.SDK_INITIALIZED) {
    unsafeWindow.SDK_INITIALIZED.then(initScript);
  } else if (typeof window.SDK_INITIALIZED !== 'undefined') {
    window.SDK_INITIALIZED.then(initScript);
  } else {
    console.error('WME SDK is not available. Script will not run.');
  }
  // --- GLE (Google Link Enhancer) Integration ---
  // GLE settings and messages
  let GLE = {
    enabled: false,
    showTempClosedPOIs: true,
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
    if (truthiness) injectCSSWithID('pieExternalProvidersTweaks', '#edit-panel .external-providers-view .select2-container {width:90%; margin-bottom:2px;}');
    else {
      var styles = document.getElementById('pieExternalProvidersTweaks');
      if (styles) styles.parentNode.removeChild(styles);
    }
  }

  // Add GLE controls to the sidebar UI
  function buildGLEControls() {
    return `
    <div style="margin:6px 0 10px 0; padding:4px 8px; background:#f8f8f8; border-radius:4px;">
      <label style="font-size:10px; font-weight:bold;">
        <input type="checkbox" id="_cbEnableGLE" ${GLE && GLE.enabled ? 'checked' : ''} /> Enable Google Link Enhancer
      </label><br>
      <label style="font-size:10px; margin-left:16px;">
        <input type="checkbox" id="_cbGLEShowTempClosed" ${GLE && GLE.showTempClosedPOIs ? 'checked' : ''} ${GLE && !GLE.enabled ? 'disabled' : ''} /> Highlight temporarily closed Places
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
      tooFar: GLE.tooFar
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

    // Example: add new features (category/geometry must be defined in your logic)
    // wmeSDK.DataModel.Venues.addVenue({category, geometry});

    // Example: save edits (only if you have edits to save)
    // wmeSDK.Editing.save().then(() => {
    //   // edits saved
    // });

    // register to events
    wmeSDK.Events.once({ eventName: 'wme-ready' }).then(() => {
      // Setup custom shortcuts after WME is ready
      setupShortcuts(wmeSDK);
      // Register script sidebar tab for venue dropdown
      registerSidebarScriptTab(wmeSDK);
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
        injectNOCButtonIfNepalGasStation(wmeSDK);
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
      category: $(`#pieItem${itemNumber}`).val(),
      lock: $(`#pieLock${itemNumber}`).val(),
      geometry: $(`#pieGeom${itemNumber}`).val(),
    };
    setPOIShortcutsConfig(config);
  }
  function loadPOIShortcutItem(itemNumber) {
    const config = getPOIShortcutsConfig();
    if (config[itemNumber]) {
      $(`#pieItem${itemNumber}`).val(config[itemNumber].category);
      $(`#pieLock${itemNumber}`).val(config[itemNumber].lock);
      $(`#pieGeom${itemNumber}`).val(config[itemNumber].geometry);
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
    let html = `<select id="pieItem${itemNumber}" style="font-size:10px;height:20px;width:100%;max-width:200px;margin:2px 0;">`;
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
    let html = `<select id="pieLock${itemNumber}" style="margin-left:4px;font-size:10px;height:20px;width:35px;">`;
    for (let i = 0; i <= 4; i++) {
      html += `<option value="${i}">${i + 1}</option>`;
    }
    html += '</select>';
    return html;
  }
  function buildGeometryTypeDropdown(itemNumber) {
    // Dropdown for geometry type: Point or Area
    return `<select id="pieGeom${itemNumber}" style="margin-left:4px;font-size:10px;height:20px;width:55px;">
        <option value="area">Area</option>
        <option value="point">Point</option>
    </select>`;
  }
  function buildItemOption(itemNumber) {
    var $section = $('<div>', { style: 'padding:4px 8px;font-size:10px;', id: 'piePlaceCat' + itemNumber });
    $section.html(
      [
        `<span style="font-size:10px;font-weight:bold;">Item ${itemNumber}</span>`,
        buildItemList(itemNumber),
        `<div style="display:flex;align-items:center;gap:6px;margin:3px 0 0 0;">
            <label style="font-size:10px;min-width:28px;">Lock</label> ${buildLockLevelDropdown(itemNumber)}
            <label style="font-size:10px;min-width:40px;">Geometry</label> ${buildGeometryTypeDropdown(itemNumber)}
            <label style="font-size:10px;min-width:45px;">Shortcut</label> <input type="text" id="pieShortcut${itemNumber}" value="" placeholder="(none)" disabled style="margin-left:2px;width:60px;font-size:10px;height:18px;" />
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
    setTimeout(() => {
      for (let i = 1; i <= 10; i++) {
        loadPOIShortcutItem(i);
        // Save on change
        $(`#pieItem${i},#pieLock${i},#pieGeom${i}`)
          .off('change.wmepoi')
          .on('change.wmepoi', function () {
            savePOIShortcutItem(i);
          });
      }
    }, 0);
    return html;
  }

  // --- Shortcuts Setup ---
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
          const cat = $(`#pieItem${i}`).val();
          const lock = parseInt($(`#pieLock${i}`).val(), 10);
          const geomType = $(`#pieGeom${i}`).val();
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

  function getGasStationCategoryKey() {
    // Use I18n to get the correct category key for gas station
    // Fallback to 'GAS_STATION' if not found
    let locale = (typeof I18n !== 'undefined' && I18n.currentLocale) ? I18n.currentLocale() : 'en';
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

  function injectNOCButtonIfNepalGasStation(wmeSDK) {
    // Only run if a venue is selected
    const selection = wmeSDK.Editing.getSelection();
    if (!selection || selection.objectType !== 'venue' || !selection.ids || selection.ids.length !== 1) return;

    const venueId = selection.ids[0];
    const venue = wmeSDK.DataModel.Venues.getById({ venueId });
    const topCountry = wmeSDK.DataModel.Countries.getTopCountry();
    const gasStationKey = getGasStationCategoryKey();

    // Check if venue.categories (array) contains the gas station key
    const isNepalGasStation = !!venue && !!topCountry && (topCountry.name === 'Nepal' || topCountry.code === 'NP') && Array.isArray(venue.categories) && venue.categories.includes(gasStationKey);
    if (!isNepalGasStation) return;

    // Wait for the categories-control element to exist
    function tryInject() {
      const $catControl = $('.categories-control');
      if ($catControl.length === 0) {
        setTimeout(tryInject, 150); // Retry after 150ms
        return;
      }
      // Prevent duplicate button
      if ($('.noc-gas-station-btn').length > 0) return;
      // Inject button after categories-control
      const buttonHtml = `
        <div class='form-group e85 e85-e85-14'>
          <label class='control-label'>Setup Station as</label>
          <button class='waze-btn waze-btn-small waze-btn-white e85 noc-gas-station-btn'>NOC</button>
        </div>
      `;
      $catControl.after(buttonHtml);
      // Button click handler
      $('.noc-gas-station-btn').on('click', function() {
        // Read lockRank for GAS_STATION from localStorage config
        let lockRank = null;
        let config = {};
        try {
          config = JSON.parse(localStorage.getItem('wme-poi-shortcuts-config') || '{}');
        } catch (e) {
          config = {};
        }
        let foundConfig = false;
        for (let i = 1; i <= 10; i++) {
          if (config[i] && config[i].category === gasStationKey) {
            lockRank = parseInt(config[i].lock, 10);
            console.log(`[NOC Debug] Found gas station shortcut config: slot=${i}, lockRank=${lockRank}`);
            foundConfig = true;
            break;
          }
        }
        if (!foundConfig || isNaN(lockRank)) {
          console.log(`[NOC Debug] Using fallback lockRank. venue.lockRank=${venue.lockRank}`);
          lockRank = (venue.lockRank && !isNaN(venue.lockRank)) ? venue.lockRank : 1;
        }
        console.log(`[NOC Debug] Final lockRank to be used: ${lockRank}`);
        // Move current name to aliases if not 'NOC'
        if (venue.name !== 'NOC') {
          let aliases = Array.isArray(venue.aliases) ? venue.aliases.slice() : [];
          if (venue.name && !aliases.includes(venue.name)) {
            aliases.push(venue.name);
          }
            const updateObj = {
              venueId: venueId,
              name: 'NOC',
              aliases: aliases
            };
            if (venue.brand !== 'Nepal Oil Corporation') {
              updateObj.brand = 'Nepal Oil Corporation';
              console.log('[NOC Debug] Brand updated to Nepal Oil Corporation');
            } else {
              console.log('[NOC Debug] Brand already Nepal Oil Corporation, skipping brand update');
            }
            if (venue.lockRank !== lockRank && (!venue.isLocked || venue.isLocked === false)) {
              updateObj.lockRank = lockRank;
              console.log(`[NOC Debug] lockRank updated to ${lockRank}`);
            } else {
              console.log(`[NOC Debug] lockRank already ${venue.lockRank}, skipping lockRank update`);
            }
            try {
              wmeSDK.DataModel.Venues.updateVenue(updateObj);
            } catch (err) {
              console.warn('[NOC Debug] Update failed:', err);
            }
        } else {
          const updateObj = {
            venueId: venueId
          };
          if (venue.brand !== 'Nepal Oil Corporation') {
            updateObj.brand = 'Nepal Oil Corporation';
            console.log('[NOC Debug] Brand updated to Nepal Oil Corporation');
          } else {
            console.log('[NOC Debug] Brand already Nepal Oil Corporation, skipping brand update');
          }
          if (venue.lockRank !== lockRank && (!venue.isLocked || venue.isLocked === false)) {
            updateObj.lockRank = lockRank;
            console.log(`[NOC Debug] lockRank updated to ${lockRank}`);
          } else {
            console.log(`[NOC Debug] lockRank already ${venue.lockRank}, skipping lockRank update`);
          }
          try {
            wmeSDK.DataModel.Venues.updateVenue(updateObj);
          } catch (err) {
            console.warn('[NOC Debug] Update failed:', err);
          }
        }
      });
    }
    tryInject();
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
            <div style="font-weight: bold; font-size: 14px; color: #333;">WME POI Shortcuts</div>
            <div style="font-size: 12px; color: #666;">Version 2025.08.09.000</div>
          </div>
          ${buildGLEControls()}
          ${buildAllItemOptions()}
        </div>`;
      // Add event listeners for GLE controls
      setTimeout(() => {
        const cbEnableGLE = document.getElementById('_cbEnableGLE');
        const cbGLEShowTempClosed = document.getElementById('_cbGLEShowTempClosed');
        if (cbEnableGLE) {
          cbEnableGLE.addEventListener('change', function () {
            if (this.checked) {
              GLE.enable();
            } else {
              GLE.disable();
              // Force map refresh to remove lingering highlights
              setTimeout(() => {
                if (typeof W !== 'undefined' && W.map && W.map.getOLMap()) {
                  W.map.getOLMap().redraw();
                }
              }, 100);
            }
            cbGLEShowTempClosed.disabled = !this.checked;
          });
        }
        if (cbGLEShowTempClosed) {
          cbGLEShowTempClosed.addEventListener('change', function () {
            GLE.showTempClosedPOIs = this.checked;
            // Force map refresh when toggling temp closed highlights
            setTimeout(() => {
              if (typeof W !== 'undefined' && W.map && W.map.getOLMap()) {
                W.map.getOLMap().redraw();
              }
            }, 100);
          });
        }
      }, 0);
    } catch (e) {
      console.error('Failed to register POI Shortcuts script tab:', e);
    }
  }
})();
