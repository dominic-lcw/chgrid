// Real-world ClickHouse integration example
// This shows how you would modify the CHGridComponent to connect to your ClickHouse instance

export interface ClickHouseConfig {
  chproxyUrl: string;
  database: string;
  username?: string;
  password?: string;
}

export const DEFAULT_CONFIG: ClickHouseConfig = {
  chproxyUrl: 'http://localhost:9090',
  database: 'default',
  username: 'default',
  password: '',
};

export class ClickHouseService {
  private config: ClickHouseConfig;

  constructor(config: ClickHouseConfig = DEFAULT_CONFIG) {
    this.config = config;
  }

  async executeQuery(query: string): Promise<any[]> {
    const url = new URL(this.config.chproxyUrl);
    url.searchParams.set('query', query);
    
    if (this.config.database) {
      url.searchParams.set('database', this.config.database);
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        ...(this.config.username && {
          'Authorization': `Basic ${btoa(`${this.config.username}:${this.config.password || ''}`)}`
        })
      },
    });

    if (!response.ok) {
      throw new Error(`ClickHouse query failed: ${response.statusText}`);
    }

    const text = await response.text();
    return this.parseTabSeparatedValues(text);
  }

  private parseTabSeparatedValues(data: string): any[] {
    const lines = data.trim().split('\n');
    if (lines.length === 0) return [];

    // Assuming first line contains headers
    const headers = lines[0].split('\t');
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split('\t');
      const row: any = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || null;
      });
      
      rows.push(row);
    }

    return rows;
  }

  // Example method to get paginated data for AG-Grid SSRM
  async getServerSideData(params: {
    startRow: number;
    endRow: number;
    sortModel?: any[];
    filterModel?: any;
    tableName: string;
  }): Promise<{ data: any[]; totalCount: number }> {
    const { startRow, endRow, sortModel, filterModel, tableName } = params;
    
    let query = `SELECT * FROM ${tableName}`;
    let countQuery = `SELECT COUNT(*) as total FROM ${tableName}`;
    
    // Add WHERE clauses for filtering
    const whereConditions: string[] = [];
    if (filterModel) {
      Object.entries(filterModel).forEach(([field, filter]: [string, any]) => {
        if (filter.filter) {
          whereConditions.push(`${field} ILIKE '%${filter.filter}%'`);
        }
      });
    }
    
    if (whereConditions.length > 0) {
      const whereClause = ` WHERE ${whereConditions.join(' AND ')}`;
      query += whereClause;
      countQuery += whereClause;
    }
    
    // Add ORDER BY clause for sorting
    if (sortModel && sortModel.length > 0) {
      const orderBy = sortModel
        .map(sort => `${sort.colId} ${sort.sort.toUpperCase()}`)
        .join(', ');
      query += ` ORDER BY ${orderBy}`;
    }
    
    // Add LIMIT and OFFSET for pagination
    query += ` LIMIT ${endRow - startRow} OFFSET ${startRow}`;
    
    // Execute both queries
    const [data, countResult] = await Promise.all([
      this.executeQuery(query),
      this.executeQuery(countQuery)
    ]);
    
    const totalCount = countResult[0]?.total || 0;
    
    return { data, totalCount };
  }
}

// Example usage in your CHGridComponent:
/*
// Replace the getServerSideDatasource implementation with:

const clickHouseService = new ClickHouseService();

const getServerSideDatasource = useCallback((): IServerSideDatasource => {
  return {
    getRows: async (params: IServerSideGetRowsParams) => {
      try {
        const result = await clickHouseService.getServerSideData({
          startRow: params.request.startRow || 0,
          endRow: params.request.endRow || 100,
          sortModel: params.request.sortModel,
          filterModel: params.request.filterModel,
          tableName: 'your_table_name', // Replace with your actual table name
        });

        const lastRow = result.data.length < (params.request.endRow! - params.request.startRow!) 
          ? params.request.startRow! + result.data.length 
          : -1;

        params.success({
          rowData: result.data,
          rowCount: lastRow === -1 ? undefined : result.totalCount,
        });
      } catch (error) {
        console.error('Error fetching data from ClickHouse:', error);
        params.fail();
      }
    },
  };
}, []);
*/