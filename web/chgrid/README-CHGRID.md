# CHGrid - AG-Grid with ClickHouse Integration

A React application demonstrating AG-Grid Enterprise Server-Side Row Model (SSRM) with ClickHouse database integration via CHProxy.

## Features

### AG-Grid Enterprise Features Implemented:
- **Server-Side Row Model (SSRM)**: Efficient handling of large datasets
- **Set Column Filters**: Advanced filtering with enterprise set filters
- **Sidebar**: Column and filter management panels
- **Status Bar**: Row count and aggregation display
- **Range Selection**: Select multiple cells and ranges
- **Floating Filters**: Quick filter access in column headers
- **Aggregation**: Sum, count, and other aggregation functions
- **Row Selection**: Multiple row selection with checkboxes

### ClickHouse Integration:
- Connects to ClickHouse via CHProxy for connection pooling and security
- Server-side sorting, filtering, and pagination
- Optimized queries for large datasets
- Real-time data updates

## Getting Started

### Prerequisites
1. **ClickHouse and CHProxy running**: 
   ```bash
   cd /Users/dominicleung/Developer/chgrid
   docker-compose -f clickhouse.docker-compose.yaml up -d
   ```

2. **Node.js and pnpm installed**

### Installation
```bash
cd web/chgrid
pnpm install
```

### Development
```bash
pnpm dev
```

The application will be available at `http://localhost:5174/`

## Configuration

### Current Setup (Demo Mode)
The application currently runs with simulated data for demonstration purposes. The grid shows:
- 1000+ sample records
- Server-side sorting and filtering
- Enterprise features like set filters and aggregation

### Connecting to Real ClickHouse Data

To connect to your ClickHouse instance:

1. **Update the component**: Replace the simulated datasource in `CHGridComponent.tsx` with the real ClickHouse service:

```typescript
import { ClickHouseService } from './clickhouse-service';

// In your component:
const clickHouseService = new ClickHouseService({
  chproxyUrl: 'http://localhost:9090',
  database: 'your_database',
  username: 'default',
  password: '',
});

// Replace getServerSideDatasource with real implementation
// (See clickhouse-service.ts for full example)
```

2. **Create your table in ClickHouse**:
```sql
CREATE TABLE athletes (
  id UInt32,
  name String,
  country String,
  age UInt8,
  sport String,
  year UInt16,
  date Date,
  gold UInt8,
  silver UInt8,
  bronze UInt8,
  total UInt8
) ENGINE = MergeTree()
ORDER BY id;
```

3. **Insert sample data**:
```sql
INSERT INTO athletes VALUES
(1, 'Michael Phelps', 'USA', 23, 'Swimming', 2008, '2008-08-24', 8, 0, 0, 8),
(2, 'Usain Bolt', 'Jamaica', 22, 'Athletics', 2008, '2008-08-16', 3, 0, 0, 3);
-- Add more data...
```

## Performance Features

### Server-Side Row Model Benefits:
- **Lazy Loading**: Only loads visible rows
- **Infinite Scrolling**: Smooth scrolling through millions of records
- **Server-Side Operations**: Sorting, filtering, and grouping on the server
- **Memory Efficient**: Low memory footprint regardless of dataset size

### ClickHouse Optimizations:
- **Columnar Storage**: Optimized for analytical queries
- **Compression**: Reduces data transfer
- **Parallel Processing**: Fast aggregations and complex queries
- **Index Support**: Efficient filtering and sorting

## Enterprise Features Usage

### Set Filters
- Click the filter icon on Country or Sport columns
- Select/deselect specific values
- Use search functionality within the filter

### Sidebar
- Toggle with the menu icon
- **Columns Panel**: Show/hide and reorder columns
- **Filters Panel**: Manage all active filters

### Status Bar
- Shows total rows, filtered rows, selected rows
- Displays aggregation results for selected data

### Range Selection
- Click and drag to select cell ranges
- Use Ctrl+click for multiple selections
- View aggregations in the status bar

## Architecture

```
React App (Port 5174)
    ↓
CHProxy (Port 9090)
    ↓  
ClickHouse (Port 8123/9000)
```

## Troubleshooting

### Common Issues:

1. **ClickHouse connection failed**:
   - Ensure Docker containers are running
   - Check CHProxy configuration in `chproxy-config.yml`
   - Verify ClickHouse is accessible on port 8123

2. **Grid not loading data**:
   - Check browser console for errors
   - Verify CHProxy endpoint is accessible
   - Check ClickHouse query logs

3. **Enterprise features not working**:
   - Ensure `ag-grid-enterprise` is installed
   - Verify license (if using licensed version)
   - Check module registration in component

## Next Steps

1. **Add Authentication**: Implement user authentication for CHProxy
2. **Custom Filters**: Create domain-specific filter components
3. **Charts Integration**: Add AG-Grid Charts for data visualization
4. **Real-time Updates**: Implement WebSocket connection for live data
5. **Export Features**: Add Excel/CSV export functionality

## Development Notes

- The application uses AG-Grid v34.2.0 with enterprise features
- TypeScript is configured with strict mode
- Vite is used for fast development and building
- ESLint is configured for code quality