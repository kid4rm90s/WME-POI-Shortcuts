# Release Notes - v2025.11.23.02

## 🚗 Charging Station Automation - Major Update

This release brings comprehensive automation for charging station editing in Nepal, streamlining the workflow for adding and updating charging station venues.

### 🎯 Key Features

**1. Auto Network Selection**
- Click any charging station brand button and the network is automatically selected from WME's dropdown
- Supports 7 major networks: BYD, CG Motors, Tata Motors, Hyundai Motors, NEA, ElectriVa Nepal, MAW Vriddhi
- Smart handling for brands not in WME's network list (MG Motors, Yatri, thee Go, OmodaJaencoo)

**2. Auto Cost Type Setting**
- Branded stations → Automatically set to "Paid"
- Generic charging station → Automatically set to "Unspecified"
- No more manual dropdown clicking!

**3. Auto Payment Methods**
- Automatically populates payment methods based on brand configuration
- **Smart cleanup**: Removes old payment methods when switching brands
- Prevents accumulation of incorrect payment types
- Common methods: App, Online payment, Debit card, Other

### 📋 Supported Charging Stations

All 12 Nepal charging networks are fully supported:
- BYD
- CG Motors
- MG Motors
- Tata Motors
- Hyundai Motors
- NEA (Nepal Electricity Authority)
- ElectriVa Nepal (24/7 hours auto-configured)
- Yatri
- thee Go
- MAW Vriddhi
- OmodaJaencoo
- Generic Charging Station

### 🔧 How It Works

1. Select a charging station venue in WME
2. Click the desired brand button
3. Script automatically:
   - Updates name, brand, and aliases
   - Selects network from dropdown (if available)
   - Sets cost type (Paid/Unspecified)
   - Removes existing payment methods
   - Adds correct payment methods
   - Updates lock rank
   - Shows success notification

### ⚡ Technical Highlights

- Advanced shadow DOM traversal for WME's web components
- Intelligent retry logic with timeout handling
- Staggered execution to prevent UI conflicts
- Comprehensive logging for debugging
- Handles dynamic menu loading automatically

### 🐛 Bug Fixes

- Fixed payment methods not being cleared when switching brands
- Improved network dropdown reliability with pre-opening
- Enhanced shadow DOM navigation for nested components

### 📝 Usage Example

**Before**: Click button → Manually select network → Manually set cost → Manually add 4 payment methods → Set lock rank  
**After**: Click button → Everything done automatically ✨

### 🔍 Console Logging

The script provides detailed logs for monitoring:
- `[Network Selection]` - Network dropdown operations
- `[Cost Type]` - Cost type changes
- `[Payment Methods]` - Payment method additions/removals
- `[Charging Station]` - Summary of all updates

### ⚙️ Configuration

All charging station configurations are pre-configured. No setup required!

Each station has:
- `networkName` - WME network dropdown value
- `costType` - FREE, FEE, or COST_TYPE_UNSPECIFIED
- `paymentMethods` - Array of payment method IDs
- Standard fields: brand, aliases, website

---

**Upgrade now to streamline your charging station editing workflow!**

For issues or feedback, visit: https://greasyfork.org/scripts/545278-wme-poi-shortcuts/feedback
