# GlobeTrotter Smart Planner

## Context-Aware Travel Planning Platform for Odoo SNS Hackathon

### Overview

GlobeTrotter Smart Planner is a dynamic travel planning system that automatically builds, adapts, and optimizes travel itineraries using:
- User intent & preferences
- Budget & time constraints
- GPS location awareness
- City popularity & trends
- Interest graph engine
- Real-time geo-fence alerts

### Key Features

#### 1. **Planning Session Analyzer**
- Analyzes user budget, time window, mood, and preferences
- Auto-generates optimized itineraries
- Respects budget constraints automatically

#### 2. **PlanStream Interface**
- Social media-style feed for trip planning
- Command-based actions: "Optimize for budget", "Add nearby spots", "Make it more relaxed"
- Card-based UI for easy interaction

#### 3. **Interest Graph Engine**
- Builds activity chains based on user interests
- Example: Flower park → Botanical garden → Lake → Café
- Optimizes routes by distance, time, and opening hours

#### 4. **GPS Geo-Fence Alerts**
- 1km radius geo-fencing
- High-intensity audio alerts when approaching destinations
- Real-time location tracking during active trips

#### 5. **QuickPlan Mode**
- Instant planning for current location
- Input: location, available time, budget
- Output: Optimized nearby activities

#### 6. **Budget Engine**
- Auto-calculates cost per day, per city
- Over-budget warnings
- Savings suggestions with cheaper alternatives

#### 7. **Adaptive Alternate Plans**
- Suggests nearby alternatives when:
  - User finishes early
  - Main spot is crowded
  - Travel time increases
- Based on infrastructure quality and specialty

#### 8. **Social Trend Engine**
- City popularity scores
- Trending cities
- Seasonal highlights
- Event tags

### Installation

1. Copy the module to your Odoo addons directory
2. Update the apps list
3. Install "GlobeTrotter Smart Planner"

### Usage

#### Creating a Trip

1. Go to **Dashboard** → **Plan New Trip**
2. Enter trip details (name, dates, budget)
3. Click **Auto Plan** to generate itinerary based on preferences
4. Review and customize stops and activities

#### Setting Preferences

1. Go to **Configuration** → **My Preferences**
2. Set travel style, interests, and budget range
3. Preferences are used for auto-planning

#### QuickPlan

1. Go to **QuickPlan** menu
2. Enter current location (latitude/longitude)
3. Set available time and budget
4. System generates instant plan

#### PlanStream

1. Go to **PlanStream** menu
2. View trips in social feed style
3. Use action buttons to optimize plans

#### Geo-Alerts

- Automatically activates when trip is set to "Active"
- Requires GPS permission in browser
- Alerts trigger when within 1km of destination

### Database Schema

**Core Models:**
- `globetrotter.trip` - Main trip records
- `globetrotter.trip.stop` - City stops in trips
- `globetrotter.city` - City information
- `globetrotter.activity` - Activities/attractions
- `globetrotter.user.preference` - User preferences
- `globetrotter.plan.context` - Planning context
- `globetrotter.geo.alert` - Geo-fence alerts
- `globetrotter.interest.tag` - Interest tags

### API Endpoints

- `/api/globetrotter/quickplan` - QuickPlan API
- `/api/globetrotter/geo/check` - GPS location check
- `/api/globetrotter/planstream` - PlanStream commands
- `/api/globetrotter/trending` - Trending cities
- `/api/globetrotter/interest-chain` - Build interest chains

### Demo Data

The module includes demo data for:
- 7 popular cities (Paris, Tokyo, New York, London, Dubai, Bangkok, Sydney)
- Multiple activities per city
- Interest tags (Nature, Culture, Food, Adventure, etc.)

### Technical Stack

- **Framework:** Odoo 16+
- **Frontend:** OWL (Odoo Web Library)
- **Backend:** Python 3.8+
- **Database:** PostgreSQL (via Odoo)

### Competition Features

This implementation includes all features required for Odoo SNS Hackathon:
- ✅ Clean relational database design
- ✅ End-to-end user flow
- ✅ Context-aware planning
- ✅ GPS integration
- ✅ Budget management
- ✅ Social-style UI
- ✅ Real-time alerts
- ✅ Interest-based recommendations

### Future Enhancements

- AI-powered recommendations
- Live flight/hotel API integration
- Payment processing
- Mobile app
- Social sharing features
- Collaborative planning

### License

LGPL-3

### Author

GlobeTrotter Team

