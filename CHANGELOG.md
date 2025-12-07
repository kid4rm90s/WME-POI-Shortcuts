# Changelog - WME POI Shortcuts

All notable changes to this project will be documented in this file.

## [2025.12.07.01] - 2025-12-07

### 🔧 Maintenance Release

#### Changed
- Documentation updates and improvements
- Code cleanup and optimization

#### Fixed
- Minor bug fixes and stability improvements
- Performance optimizations

---

## [2025.11.23.02] - 2025-11-23

### 🚗 Charging Station Automation - Major Feature Release

#### Added
- **Automatic Network Selection**
  - Automatically selects charging station network from WME dropdown when clicking brand buttons
  - Supports: BYD, CG Motors, Tata Motors, Hyundai Motors, Nepal Electricity Authority (NEA), ElectriVa Nepal, Maw Vriddhi
  - Uses shadow DOM traversal to navigate WME's web component architecture
  - Implements retry logic with up to 10 attempts and 200ms delays
  - Opens dropdown first and waits 300ms for dynamic menu item loading

- **Automatic Cost Type Setting**
  - Automatically sets cost type to "Paid" (FEE) for branded charging stations
  - Sets cost type to "Unspecified" (COST_TYPE_UNSPECIFIED) for generic charging stations
  - Accesses wz-select shadow DOM to click and select cost options
  - Logs human-readable labels (Free/Paid/Unspecified) for debugging

- **Automatic Payment Methods Configuration**
  - Auto-populates payment methods based on charging station brand
  - Supported methods: App, Online payment, Debit card, Credit card, Membership card, Other, Plug-in autocharge
  - **Smart Cleanup**: Removes all existing payment methods before adding new ones
  - Prevents accumulation of non-applicable payment methods when switching brands
  - Sequential addition with 400ms delays between each method to prevent conflicts
  - Click-based removal using shadow DOM `.remove-icon` elements

#### Configuration Updates
- Added `networkName` field to all charging station configurations
  - Maps button names to WME dropdown item-ids
  - `null` value for stations not in WME dropdown (MG Motors, Yatri, thee Go, OmodaJaencoo)
  - Empty string `''` for generic charging station (selects "Other")

- Added `costType` field to all charging station configurations
  - `'FEE'` for all branded charging stations
  - `'COST_TYPE_UNSPECIFIED'` for generic charging station

- Added `paymentMethods` array to all charging station configurations
  - Branded stations: `['ONLINE_PAYMENT', 'OTHER', 'DEBIT', 'APP']`
  - Generic station: `['ONLINE_PAYMENT', 'OTHER', 'DEBIT']` (no App)

#### Technical Implementation
- **New Functions**:
  - `selectChargingStationNetwork(networkName, retryCount, maxRetries)` - Shadow DOM network selection
  - `setChargingStationCostType(costType)` - Shadow DOM cost type selection
  - `setChargingStationPaymentMethods(paymentMethods)` - Shadow DOM payment method management
  - `removeAllExistingPaymentMethods()` - Cleanup function for payment method chips

- **Execution Timing** (staggered to prevent conflicts):
  - 0ms: Update venue via SDK (name, brand, aliases, website)
  - 200ms: Select network from dropdown (RETRY_INJECTION_DELAY * 2)
  - 400ms: Set cost type (RETRY_INJECTION_DELAY * 4)
  - 600ms: Set payment methods (RETRY_INJECTION_DELAY * 6)
  - 700ms: Update lock rank (RETRY_INJECTION_DELAY * 3 after cost type)

- **Shadow DOM Navigation**:
  - Network: `div → wz-autocomplete → shadowRoot → wz-text-input → shadowRoot → input`
  - Cost: `wz-select → shadowRoot → .select-box → wz-option`
  - Payment: `wz-autocomplete → shadowRoot → wz-text-input → wz-menu → wz-menu-item`
  - Payment Removal: `wz-card → wz-image-chip → shadowRoot → .remove-icon`

#### Supported Charging Stations (Nepal)
1. **BYD** - Network: BYD | Cost: Paid | Payment: App, Online, Debit, Other
2. **CG Motors** - Network: CG Motors | Cost: Paid | Payment: App, Online, Debit, Other
3. **MG Motors** - Network: N/A | Cost: Paid | Payment: App, Online, Debit, Other
4. **Tata Motors** - Network: Tata Motors | Cost: Paid | Payment: App, Online, Debit, Other
5. **Hyundai Motors** - Network: Hyundai Motors | Cost: Paid | Payment: App, Online, Debit, Other
6. **NEA (Nepal Electricity Authority)** - Network: NEA | Cost: Paid | Payment: App, Online, Debit, Other
7. **ElectriVa Nepal** - Network: ElectriVa Nepal | Cost: Paid | Payment: App, Online, Debit, Other | Hours: 24/7
8. **Yatri** - Network: N/A | Cost: Paid | Payment: App, Online, Debit, Other
9. **thee Go** - Network: N/A | Cost: Paid | Payment: App, Online, Debit, Other
10. **MAW Vriddhi** - Network: Maw Vriddhi | Cost: Paid | Payment: App, Online, Debit, Other
11. **OmodaJaencoo** - Network: N/A | Cost: Paid | Payment: App, Online, Debit, Other
12. **Generic Charging Station** - Network: Other | Cost: Unspecified | Payment: Online, Debit, Other

#### Enhanced Logging
- `[Network Selection]` - Network dropdown operations and retry attempts
- `[Cost Type]` - Cost type selection with human-readable labels
- `[Payment Methods]` - Payment method addition/removal with progress tracking
- `[Charging Station]` - Summary logs for network, cost, and payment method results

### Changed
- Updated `handleChargingStationButtonClick()` to integrate network, cost, and payment method automation
- Improved charging station button injection timing and reliability

### Fixed
- Payment methods now properly cleared when switching between different charging station brands
- Network dropdown now opens first before attempting item selection (fixes dynamic loading issue)
- Shadow DOM traversal handles nested web components correctly

---

## [Previous Versions]

### Features Already Present
- Gas station brand buttons for Nepal (NOC) and Pakistan (15+ brands)
- Charging station brand buttons for Nepal (12 charging networks)
- Swap names button for venues (swaps primary name with first alias)
- Convert OTHER venues to Residential (copies name to house number)
- Auto-open edit address for residential venues (configurable)
- Google Link Enhancer integration
- 10 customizable POI shortcuts with category, lock, and geometry settings
- Legacy keyboard shortcuts for POI creation (Ctrl+1 through Ctrl+0)
- Permanent hazard shortcuts (Toll Booth, Level Crossing, School Zone, Sharp Curves, Complex Junctions, Multiple Lanes Merging)
- UI persistence for POI shortcut configurations
- Custom sidebar tab for script settings
- Alias management with mutation observers
- Script update notifications
- WazeWrap integration for alerts and UI

---

## Development Notes

### Shadow DOM Architecture
WME uses nested shadow DOM web components that require multi-level traversal:
- Shadow roots must be accessed sequentially (cannot jump directly to deeply nested elements)
- Menu items in `wz-autocomplete` are light DOM children (not in shadow root)
- `wz-menu-item` elements use `item-id` attribute for identification
- `wz-option` elements use `value` attribute for identification
- Removal icons are inside `wz-image-chip` shadow roots

### Timing Considerations
- Menu items in dropdowns load dynamically (must open dropdown first)
- Sequential operations need delays to prevent conflicts
- Payment method removal requires 100ms between chip removals
- Payment method addition requires 400ms between selections

### Testing Checklist
- ✅ Click charging station button and verify network auto-selection
- ✅ Verify cost type auto-selection (Paid/Unspecified)
- ✅ Verify payment methods auto-population
- ✅ Switch between different brands and verify payment methods are replaced
- ✅ Check console logs for detailed operation tracking
- ✅ Verify lock rank update after all UI operations complete
