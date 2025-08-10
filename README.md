# WME POI Shortcuts - Waze Map Editor Script

[![Script Status](https://img.shields.io/badge/Status-Active-brightgreen.svg)](https://github.com/kid4rm90s/WME-POI-Shortcuts)
[![License](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)

**Speed up and simplify adding POIs (Places) in Waze Map Editor with custom shortcuts, country-specific features, and UI enhancements.**

## Description

This userscript for the Waze Map Editor (WME) provides a fast and easy way to add and edit POIs (Places) using keyboard shortcuts and a sidebar UI. It supports up to 10 customizable POI shortcuts, lock levels, geometry types, and country-specific logic (e.g., Nepal gas stations). The script also integrates Google Link Enhancer (GLE) controls and other UI tweaks for efficient editing.

**Key Benefits:**

* **Fast POI Creation:** Instantly add POIs with your preferred category, geometry, and lock level using shortcuts.
* **Customizable:** Configure up to 10 POI shortcut slots for your most-used categories.
* **Country-Specific Features:** Automatically apply local rules (e.g., Nepal gas stations get 'NOC' name and brand).
* **UI Enhancements:** Sidebar tab, dropdowns, and Google Link Enhancer controls for a smoother workflow.
* **Special Actions:** Quickly add Toll Booth, Level Crossing, and School Zone via dedicated shortcuts.

## Features

* **POI Shortcuts:**
    * 10 configurable slots for POI creation (category, geometry, lock level).
    * Keyboard shortcuts (C1–C9, C0) for instant POI addition.
    * Sidebar UI for easy configuration and access.
* **Country-Specific Logic:**
    * Nepal: Gas stations get a dedicated 'NOC' button to set name/brand and move old name to alias.
    * More country rules can be added as needed.
* **Special POI Actions:**
    * Add Toll Booth, Level Crossing, and School Zone with one click or shortcut.
* **Google Link Enhancer (GLE):**
    * Enable/disable GLE and highlight temporarily closed places.
* **Lock Level & Geometry:**
    * Choose lock level (1–5) and geometry type (Point/Area) for each shortcut.

## Installation

To install this script, you will need a userscript manager like **Tampermonkey** (for Chrome, Firefox, Safari, Edge) or **Greasemonkey** (for Firefox).

1. **Install a Userscript Manager:**
    * **Chrome/Edge/Safari:** Install [Tampermonkey](https://www.tampermonkey.net/) from your browser's extension store.
    * **Firefox:** Install [Tampermonkey](https://www.tampermonkey.net/) or [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/).

2. **Install the WME POI Shortcuts Script:**
    * Click on the following link to install: [**(https://greasyfork.org/en/scripts/XXXXX-wme-poi-shortcuts)**]
    * Your userscript manager should prompt you to install. Click **"Install"** to confirm.

3. **Verify Installation:**
    * Open the Waze Map Editor (WME) in your browser.
    * Open your userscript manager extension. You should see "WME POI Shortcuts" listed as an installed script.

## Usage

1. **Open Waze Map Editor (WME):** Go to [https://www.waze.com/editor](https://www.waze.com/editor) and log in.
2. **Configure POI Shortcuts:**
    * Open the sidebar tab labeled "POI Shortcuts".
    * Set category, lock level, and geometry for each shortcut slot.
3. **Add POIs Quickly:**
    * Use keyboard shortcuts (C1–C9, C0) or click the sidebar buttons to add POIs.
4. **Country-Specific Actions:**
    * For Nepal gas stations, select the POI and click the "NOC" button to set the name/brand and move the old name to alias.
5. **Special POI Actions:**
    * Use dedicated shortcuts/buttons for Toll Booth, Level Crossing, and School Zone.
6. **Google Link Enhancer:**
    * Enable/disable GLE and highlight temporarily closed places from the sidebar tab.

## Contributing

Contributions are welcome! If you have suggestions for new features, improvements, or bug fixes, please:

* **Open an Issue:** Report bugs or suggest features on GitHub.
* **Submit a Pull Request:** Contribute your improvements.

## License

This script is released under the [**GNU GPLv3 License**](LICENSE). See the `LICENSE` file for more details.

**Disclaimer:**
This script is an unofficial, community-developed tool and is not endorsed or supported by Waze or Google. Use at your own risk.

---

**Acknowledgements**
Thanks to the Waze editing community and script authors for inspiration and code contributions.

**GitHub Repository:** [https://github.com/kid4rm90s/WME-POI-Shortcuts]