import React, { useCallback, useMemo, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry } from "ag-grid-community";
import type {
  ColDef,
  GridReadyEvent,
  IServerSideDatasource,
  IServerSideGetRowsParams,
  SideBarDef,
} from "ag-grid-community";
import { ServerSideRowModelModule } from "ag-grid-enterprise";
import { ColumnsToolPanelModule } from "ag-grid-enterprise";
import { FiltersToolPanelModule } from "ag-grid-enterprise";
import { MenuModule } from "ag-grid-enterprise";
import { SetFilterModule } from "ag-grid-enterprise";
import { StatusBarModule } from "ag-grid-enterprise";
import { RangeSelectionModule } from "ag-grid-enterprise";

// Register AG-Grid modules
ModuleRegistry.registerModules([
  ServerSideRowModelModule,
  ColumnsToolPanelModule,
  FiltersToolPanelModule,
  MenuModule,
  SetFilterModule,
  StatusBarModule,
  RangeSelectionModule,
]);

interface SampleData {
  id: number;
  name: string;
  country: string;
  age: number;
  sport: string;
  year: number;
  date: string;
  gold: number;
  silver: number;
  bronze: number;
  total: number;
}

const CHGridComponent: React.FC = () => {
  const gridRef = useRef<AgGridReact>(null);

  // Column definitions with enterprise features
  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        field: "id",
        headerName: "ID",
        width: 80,
        sortable: true,
        filter: "agNumberColumnFilter",
        checkboxSelection: true,
        headerCheckboxSelection: true,
      },
      {
        field: "name",
        headerName: "Athlete",
        width: 150,
        sortable: true,
        filter: "agTextColumnFilter",
      },
      {
        field: "country",
        headerName: "Country",
        width: 120,
        sortable: true,
        filter: "agSetColumnFilter", // Enterprise feature
      },
      {
        field: "age",
        headerName: "Age",
        width: 80,
        sortable: true,
        filter: "agNumberColumnFilter",
      },
      {
        field: "sport",
        headerName: "Sport",
        width: 120,
        sortable: true,
        filter: "agSetColumnFilter", // Enterprise feature
      },
      {
        field: "year",
        headerName: "Year",
        width: 80,
        sortable: true,
        filter: "agNumberColumnFilter",
      },
      {
        field: "date",
        headerName: "Date",
        width: 110,
        sortable: true,
        filter: "agDateColumnFilter",
      },
      {
        field: "gold",
        headerName: "Gold",
        width: 80,
        sortable: true,
        filter: "agNumberColumnFilter",
        aggFunc: "sum", // Enterprise feature
      },
      {
        field: "silver",
        headerName: "Silver",
        width: 80,
        sortable: true,
        filter: "agNumberColumnFilter",
        aggFunc: "sum", // Enterprise feature
      },
      {
        field: "bronze",
        headerName: "Bronze",
        width: 80,
        sortable: true,
        filter: "agNumberColumnFilter",
        aggFunc: "sum", // Enterprise feature
      },
      {
        field: "total",
        headerName: "Total",
        width: 80,
        sortable: true,
        filter: "agNumberColumnFilter",
        aggFunc: "sum", // Enterprise feature
      },
    ],
    []
  );

  // Default column definition
  const defaultColDef = useMemo<ColDef>(
    () => ({
      flex: 1,
      minWidth: 100,
      resizable: true,
      sortable: true,
      filter: true,
      floatingFilter: true, // Enterprise feature
    }),
    []
  );

  // Sidebar configuration (Enterprise feature)
  const sideBar = useMemo<SideBarDef>(
    () => ({
      toolPanels: [
        {
          id: "columns",
          labelDefault: "Columns",
          labelKey: "columns",
          iconKey: "columns",
          toolPanel: "agColumnsToolPanel",
        },
        {
          id: "filters",
          labelDefault: "Filters",
          labelKey: "filters",
          iconKey: "filter",
          toolPanel: "agFiltersToolPanel",
        },
      ],
      defaultToolPanel: "columns",
    }),
    []
  );

  // Status bar configuration (Enterprise feature)
  const statusBar = useMemo(
    () => ({
      statusPanels: [
        { statusPanel: "agTotalAndFilteredRowCountComponent" },
        { statusPanel: "agTotalRowCountComponent" },
        { statusPanel: "agFilteredRowCountComponent" },
        { statusPanel: "agSelectedRowCountComponent" },
        { statusPanel: "agAggregationComponent" },
      ],
    }),
    []
  );

  // Server-side datasource implementation
  const getServerSideDatasource = useCallback((): IServerSideDatasource => {
    return {
      getRows: async (params: IServerSideGetRowsParams) => {
        console.log("Server-side request:", params.request);

        try {
          // In a real application, you would call your ClickHouse endpoint via CHProxy
          // For demo purposes, we'll simulate server-side data
          const simulatedData = generateSampleData(
            params.request.startRow || 0,
            params.request.endRow || 100
          );

          // Simulate server delay
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Apply sorting if requested
          if (params.request.sortModel && params.request.sortModel.length > 0) {
            const sortModel = params.request.sortModel[0];
            simulatedData.sort((a: any, b: any) => {
              const aVal = a[sortModel.colId];
              const bVal = b[sortModel.colId];
              if (sortModel.sort === "asc") {
                return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
              } else {
                return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
              }
            });
          }

          // Apply filtering if requested
          let filteredData = simulatedData;
          if (params.request.filterModel) {
            filteredData = simulatedData.filter((row: any) => {
              for (const [field, filter] of Object.entries(
                params.request.filterModel || {}
              )) {
                const filterValue = (filter as any).filter;
                const rowValue = row[field];
                if (
                  filterValue &&
                  !String(rowValue)
                    .toLowerCase()
                    .includes(String(filterValue).toLowerCase())
                ) {
                  return false;
                }
              }
              return true;
            });
          }

          const rowsThisPage = filteredData.slice(
            params.request.startRow || 0,
            params.request.endRow || 100
          );

          // Simulate total row count (in real app, this would come from COUNT query)
          const lastRow =
            filteredData.length <= (params.request.endRow || 100)
              ? filteredData.length
              : -1;

          params.success({
            rowData: rowsThisPage,
            rowCount: lastRow,
          });
        } catch (error) {
          console.error("Error fetching data:", error);
          params.fail();
        }
      },
    };
  }, []);

  // Generate sample data (in real app, this would be your ClickHouse query)
  const generateSampleData = (
    startRow: number,
    endRow: number
  ): SampleData[] => {
    const countries = [
      "USA",
      "UK",
      "Canada",
      "Australia",
      "Germany",
      "France",
      "Italy",
      "Spain",
    ];
    const sports = [
      "Swimming",
      "Athletics",
      "Cycling",
      "Rowing",
      "Boxing",
      "Gymnastics",
    ];
    const names = [
      "Michael",
      "Sarah",
      "John",
      "Emma",
      "David",
      "Lisa",
      "Mark",
      "Anna",
    ];

    const data: SampleData[] = [];
    const count = endRow - startRow;

    for (let i = 0; i < count; i++) {
      const id = startRow + i + 1;
      const year = 2000 + Math.floor(Math.random() * 24);
      data.push({
        id,
        name:
          names[Math.floor(Math.random() * names.length)] +
          " " +
          (startRow + i),
        country: countries[Math.floor(Math.random() * countries.length)],
        age: 18 + Math.floor(Math.random() * 20),
        sport: sports[Math.floor(Math.random() * sports.length)],
        year,
        date: `${year}-0${Math.floor(Math.random() * 9) + 1}-${String(
          Math.floor(Math.random() * 28) + 1
        ).padStart(2, "0")}`,
        gold: Math.floor(Math.random() * 5),
        silver: Math.floor(Math.random() * 5),
        bronze: Math.floor(Math.random() * 5),
        total: 0,
      });
      data[i].total = data[i].gold + data[i].silver + data[i].bronze;
    }

    return data;
  };

  // Grid ready event handler
  const onGridReady = useCallback(
    (params: GridReadyEvent) => {
      console.log("Grid is ready");

      // Set the server-side datasource
      const datasource = getServerSideDatasource();
      params.api.setGridOption("serverSideDatasource", datasource);
    },
    [getServerSideDatasource]
  );

  // Refresh data function
  const refreshData = useCallback(() => {
    if (gridRef.current?.api) {
      gridRef.current.api.refreshServerSide({ purge: true });
    }
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
        <h2>AG-Grid Server-Side Row Model with ClickHouse</h2>
        <p>
          This grid demonstrates AG-Grid Enterprise features with Server-Side
          Row Model. In a production setup, this would connect to ClickHouse via
          CHProxy.
        </p>
        <button onClick={refreshData} style={{ marginRight: "10px" }}>
          Refresh Data
        </button>
        <span style={{ color: "#666", fontSize: "14px" }}>
          Enterprise features: Set filters, sidebar, status bar, floating
          filters, aggregation
        </span>
      </div>

      <div style={{ flex: 1 }}>
        <AgGridReact
          ref={gridRef}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          rowModelType="serverSide"
          cacheBlockSize={100}
          maxBlocksInCache={10}
          purgeClosedRowNodes={true}
          maxConcurrentDatasourceRequests={2}
          blockLoadDebounceMillis={200}
          onGridReady={onGridReady}
          sideBar={sideBar}
          statusBar={statusBar}
          enableRangeSelection={true}
          enableCharts={true}
          rowSelection="multiple"
          suppressRowClickSelection={true}
          animateRows={true}
          enableCellTextSelection={true}
          ensureDomOrder={true}
          pagination={false}
          suppressPaginationPanel={true}
          className="ag-theme-alpine"
        />
      </div>
    </div>
  );
};

export default CHGridComponent;
