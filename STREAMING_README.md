# WebSocket Streaming AG-Grid Demo

This project demonstrates real-time data streaming from a FastAPI WebSocket backend to an AG-Grid frontend.

## Features

### Backend (FastAPI)

- **WebSocket Endpoints**: Multiple data stream types
- **Real-time Data Generation**: Stocks, Sports, IoT, Sales data
- **CORS Support**: Frontend integration ready
- **Connection Management**: Handle multiple clients

### Frontend (React + AG-Grid)

- **Real-time Updates**: Data streams in real-time
- **Multiple Data Types**: Switch between different data streams
- **Client-side Grid**: All AG-Grid community features
- **Auto-scroll**: New data appears at the top
- **Connection Status**: Visual WebSocket connection indicator

## Data Types Available

1. **Stock Market Data**

   - Symbol, Price, Change, Volume, Market Cap
   - Real-time price updates with positive/negative indicators

2. **Sports/Athletes Data**

   - Name, Country, Sport, Score, Rank, Age, Medals
   - Performance tracking data

3. **IoT Sensor Data**

   - Device ID, Temperature, Humidity, Pressure, Battery, Location, Status
   - Simulated sensor readings

4. **Sales Transaction Data**

   - Customer ID, Product, Amount, Quantity, Region, Salesperson, Discount
   - E-commerce transaction simulation

5. **Mixed Data**
   - Random combination of all data types

## Quick Start

### 1. Backend Setup

```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Run the FastAPI server
python main.py
```

The backend will be available at:

- **API**: http://localhost:8000
- **Health Check**: http://localhost:8000/health
- **WebSocket**: ws://localhost:8000/ws/stream/{data_type}

### 2. Frontend Setup

```bash
cd chgrid

# Install dependencies (if not already done)
pnpm install

# Start the development server
pnpm dev
```

The frontend will be available at: http://localhost:5174

## Usage

1. **Start the backend** first (FastAPI server on port 8000)
2. **Start the frontend** (React app on port 5174)
3. **Select data type** from the dropdown
4. **Watch real-time updates** in the AG-Grid

### Controls

- **Data Type Selector**: Choose which type of data to stream
- **Connection Status**: Green/Red indicator for WebSocket status
- **Message Counter**: Shows number of WebSocket messages received
- **Row Counter**: Shows current number of rows in the grid
- **Reconnect Button**: Manually reconnect to WebSocket

## WebSocket Endpoints

- `ws://localhost:8000/ws/stream/mixed` - Mixed data types
- `ws://localhost:8000/ws/stream/stocks` - Stock market data only
- `ws://localhost:8000/ws/stream/sports` - Sports data only
- `ws://localhost:8000/ws/stream/iot` - IoT sensor data only
- `ws://localhost:8000/ws/stream/sales` - Sales transaction data only

## Technical Details

### Backend Architecture

- **FastAPI**: Modern Python web framework
- **WebSockets**: Real-time bidirectional communication
- **Async/Await**: Non-blocking concurrent operations
- **Connection Manager**: Handle multiple client connections
- **Data Generators**: Realistic sample data creation

### Frontend Architecture

- **React Hooks**: Modern state management
- **AG-Grid Community**: Client-side data grid
- **WebSocket API**: Native browser WebSocket support
- **Real-time Updates**: Efficient state updates for streaming data

### Performance Features

- **Row Limit**: Automatically keeps only the latest 1000 rows
- **Efficient Updates**: Uses row IDs for optimal rendering
- **Connection Recovery**: Automatic reconnection handling
- **Memory Management**: Prevents memory leaks from infinite data

## Development

### Backend Development

```bash
cd backend

# Run with auto-reload
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Development

```bash
cd chgrid

# Run with hot reload
pnpm dev
```

## Customization

### Adding New Data Types

1. **Backend**: Add new generator function in `main.py`
2. **Frontend**: Update column definitions and data type selector
3. **WebSocket**: Add new endpoint route

### Modifying AG-Grid

- **Columns**: Edit `columnDefs` in `App.tsx`
- **Styling**: Modify CSS classes and themes
- **Features**: Add AG-Grid enterprise features as needed

### Adjusting Stream Settings

- **Frequency**: Modify `asyncio.sleep()` intervals in backend
- **Batch Size**: Change initial data count
- **Data Retention**: Adjust row limit in frontend

## Troubleshooting

### Connection Issues

- Ensure backend is running on port 8000
- Check CORS settings in `main.py`
- Verify WebSocket URL in frontend

### Performance Issues

- Reduce stream frequency in backend
- Lower row limit in frontend
- Check browser developer tools for errors

### Data Issues

- Verify JSON structure in WebSocket messages
- Check data generators in backend
- Validate column field mapping in frontend
