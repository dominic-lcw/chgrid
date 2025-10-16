import { useState, useEffect, useRef, useCallback } from "react";
import "./App.css";

import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import type { ColDef, GridApi } from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);

// Define data types
interface StockData {
  id: string;
  symbol: string;
  price: number;
  change: number;
  change_percent: number;
  volume: number;
  timestamp: string;
  market_cap: number;
  transactions_today: number;
  high_52w: number;
  low_52w: number;
  type: "stock";
}

interface WebSocketMessage {
  type: "initial_data" | "update";
  data: StockData | StockData[];
}

function App() {
  const [rowData, setRowData] = useState<StockData[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const gridApiRef = useRef<GridApi | null>(null);

  // Column definitions for stock data only
  const columnDefs: ColDef[] = [
    {
      field: "symbol",
      headerName: "Symbol",
      width: 100,
      pinned: "left",
      cellRenderer: (params: any) => params.value || "-",
    },
    {
      field: "price",
      headerName: "Price",
      width: 100,
      cellRenderer: (params: any) => (params.value ? `$${params.value}` : "-"),
      type: "numericColumn",
    },
    {
      field: "change",
      headerName: "Change",
      width: 100,
      cellRenderer: (params: any) => {
        if (params.value === undefined || params.value === null) return "-";
        const isPositive = params.value >= 0;
        return `${isPositive ? "+" : ""}${params.value}`;
      },
      cellStyle: (params: any) => {
        if (params.value === undefined || params.value === null) {
          return { color: "#666", fontWeight: "normal" };
        }
        const isPositive = params.value >= 0;
        return {
          color: isPositive ? "#28a745" : "#dc3545",
          fontWeight: "bold",
        };
      },
      type: "numericColumn",
    },
    {
      field: "change_percent",
      headerName: "Change %",
      width: 110,
      cellRenderer: (params: any) => {
        if (params.value === undefined || params.value === null) return "-";
        const isPositive = params.value >= 0;
        return `${isPositive ? "+" : ""}${params.value}%`;
      },
      cellStyle: (params: any) => {
        if (params.value === undefined || params.value === null) {
          return { color: "#666", fontWeight: "normal" };
        }
        const isPositive = params.value >= 0;
        return {
          color: isPositive ? "#28a745" : "#dc3545",
          fontWeight: "bold",
        };
      },
      type: "numericColumn",
    },
    {
      field: "volume",
      headerName: "Volume",
      width: 120,
      cellRenderer: (params: any) =>
        params.value ? params.value.toLocaleString() : "-",
      type: "numericColumn",
    },
    {
      field: "market_cap",
      headerName: "Market Cap",
      width: 140,
      cellRenderer: (params: any) => {
        if (!params.value) return "-";
        const value = params.value;
        if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
        if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
        if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
        return `$${value.toLocaleString()}`;
      },
      type: "numericColumn",
    },
    {
      field: "high_52w",
      headerName: "52W High",
      width: 100,
      cellRenderer: (params: any) => (params.value ? `$${params.value}` : "-"),
      type: "numericColumn",
    },
    {
      field: "low_52w",
      headerName: "52W Low",
      width: 100,
      cellRenderer: (params: any) => (params.value ? `$${params.value}` : "-"),
      type: "numericColumn",
    },
    {
      field: "transactions_today",
      headerName: "Transactions",
      width: 120,
      cellRenderer: (params: any) => params.value || "-",
      type: "numericColumn",
    },
    {
      field: "timestamp",
      headerName: "Last Update",
      width: 140,
      cellRenderer: (params: any) =>
        new Date(params.value).toLocaleTimeString(),
    },
  ];

  const defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    flex: 1,
    minWidth: 80,
  };

  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.close();
    }

    const ws = new WebSocket(`ws://localhost:8000/ws/stream`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected");
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        setMessageCount((prev) => prev + 1);

        if (message.type === "initial_data" && Array.isArray(message.data)) {
          // Initialize with stock data
          setRowData(message.data);
        } else if (message.type === "update" && !Array.isArray(message.data)) {
          // Update existing stock
          setRowData((prev) => {
            const updatedData = [...prev];
            const index = updatedData.findIndex(
              (item) => item.id === (message.data as StockData).id
            );
            if (index >= 0) {
              // Track which fields changed for targeted cell flashing
              const oldData = updatedData[index];
              const newData = message.data as StockData;
              const changedColumns: string[] = [];

              // Compare old and new data to find changed fields
              Object.keys(newData).forEach((key) => {
                const typedKey = key as keyof StockData;
                if (
                  key !== "timestamp" &&
                  oldData[typedKey] !== newData[typedKey]
                ) {
                  changedColumns.push(key);
                }
              });

              // Update existing stock in place
              updatedData[index] = {
                ...updatedData[index],
                ...newData,
              };

              // Flash only the specific cells that changed
              if (gridApiRef.current && changedColumns.length > 0) {
                setTimeout(() => {
                  const rowNode =
                    gridApiRef.current?.getDisplayedRowAtIndex(index);
                  if (rowNode) {
                    // Flash only the changed cells
                    gridApiRef.current?.flashCells({
                      rowNodes: [rowNode],
                      columns: changedColumns,
                    });
                  }
                }, 50);
              }
            }
            return updatedData;
          });
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsConnected(false);
    };
  }, []);

  const onGridReady = (params: any) => {
    gridApiRef.current = params.api;
  };

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connectWebSocket]);

  return (
    <div
      style={{
        padding: "20px",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        <h1 style={{ margin: 0 }}>Stock Market Streaming Demo</h1>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span>Status:</span>
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor: isConnected ? "green" : "red",
            }}
          ></div>
          <span>{isConnected ? "Connected" : "Disconnected"}</span>
        </div>

        <div>
          <span>Messages: {messageCount}</span>
        </div>

        <div>
          <span>Rows: {rowData.length}</span>
        </div>

        <button
          onClick={connectWebSocket}
          style={{
            padding: "5px 10px",
            backgroundColor: "#007acc",
            color: "white",
            border: "none",
            borderRadius: "3px",
            cursor: "pointer",
          }}
        >
          Reconnect
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 0 }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          className="ag-theme-alpine"
          onGridReady={onGridReady}
          animateRows={true}
          enableCellTextSelection={true}
          suppressRowClickSelection={false}
          rowSelection="multiple"
          getRowId={(params) => params.data.id}
        />
      </div>

      <div style={{ marginTop: "10px", fontSize: "12px", color: "#666" }}>
        <p>
          <strong>Fixed Entity Updates:</strong> This demo shows fixed entities
          (stocks, athletes, IoT devices) that get updated with real
          transactions/events rather than adding new rows.
        </p>
        <p>
          <strong>Features:</strong> Stock prices update in real-time, athlete
          scores change with competitions, IoT sensors send new readings, sales
          create new transactions.
        </p>
        <p>
          Backend must be running on <code>localhost:8000</code> - see
          backend/main.py
        </p>
      </div>
    </div>
  );
}

export default App;
