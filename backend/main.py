from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json
import random
from datetime import datetime
from typing import List, Dict, Any

app = FastAPI(title="Streaming Data API")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5174",
        "http://localhost:3000",
    ],  # Add your frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                # Connection is probably closed, remove it
                self.active_connections.remove(connection)


manager = ConnectionManager()

# Stock data only
COMPANIES = [
    "AAPL",
    "GOOGL",
    "MSFT",
    "AMZN",
    "TSLA",
    "META",
    "NVDA",
    "NFLX",
    "CRM",
    "ORCL",
    "UBER",
    "ZOOM",
    "SHOP",
    "SQ",
    "SNAP",
]

# Fixed stock entities that will be updated
FIXED_STOCKS = {}


def initialize_stock_entities():
    """Initialize fixed stock entities with base data"""
    global FIXED_STOCKS

    # Initialize stocks
    for symbol in COMPANIES:
        base_price = random.uniform(50, 500)
        FIXED_STOCKS[symbol] = {
            "id": symbol,
            "symbol": symbol,
            "price": round(base_price, 2),
            "change": 0.0,
            "change_percent": 0.0,
            "volume": random.randint(1000000, 10000000),
            "timestamp": datetime.now().isoformat(),
            "market_cap": round(base_price * random.randint(1000000, 50000000), 2),
            "transactions_today": 0,
            "high_52w": round(base_price * random.uniform(1.2, 1.8), 2),
            "low_52w": round(base_price * random.uniform(0.5, 0.8), 2),
            "type": "stock",
        }


def update_stock_transaction(symbol: str) -> Dict[str, Any]:
    """Update a stock with a new transaction"""
    if symbol not in FIXED_STOCKS:
        return {}

    stock = FIXED_STOCKS[symbol]
    old_price = stock["price"]

    # Generate price change based on market conditions
    volatility = random.uniform(0.5, 3.0)  # Different volatility for different stocks
    change = random.uniform(-volatility, volatility)
    new_price = max(0.01, old_price + change)  # Prevent negative prices

    # Update stock data
    stock.update(
        {
            "price": round(new_price, 2),
            "change": round(change, 2),
            "change_percent": round((change / old_price) * 100, 2),
            "volume": stock["volume"] + random.randint(1000, 100000),
            "transactions_today": stock["transactions_today"] + 1,
            "timestamp": datetime.now().isoformat(),
        }
    )

    # Update 52-week high/low occasionally
    if random.random() < 0.1:  # 10% chance
        if new_price > stock["high_52w"]:
            stock["high_52w"] = new_price
        elif new_price < stock["low_52w"]:
            stock["low_52w"] = new_price

    return stock.copy()


# Initialize stock entities on startup
initialize_stock_entities()


# Initialize entities on startup
initialize_stock_entities()


@app.get("/")
async def root():
    return {"message": "FastAPI WebSocket Streaming Server", "status": "running"}


@app.get("/health")
async def health_check():
    return {"status": "healthy", "connections": len(manager.active_connections)}


@app.websocket("/ws/stream")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # Send initial stock data
        initial_data = list(FIXED_STOCKS.values())

        await websocket.send_text(
            json.dumps({"type": "initial_data", "data": initial_data})
        )

        # Stream continuous updates to stocks
        while True:
            await asyncio.sleep(random.uniform(0.5, 2.0))

            # Update a random stock
            symbol = random.choice(list(FIXED_STOCKS.keys()))
            updated_data = update_stock_transaction(symbol)

            await websocket.send_text(
                json.dumps({"type": "update", "data": updated_data})
            )

    except WebSocketDisconnect:
        manager.disconnect(websocket)
        print("Client disconnected from stock stream")
    except Exception as e:
        print(f"Error in websocket: {e}")
        manager.disconnect(websocket)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
