# ClickHouse + CHProxy Docker Setup

This Docker Compose setup runs ClickHouse database server with CHProxy as a connection proxy.

## Services

- **ClickHouse**: Database server running on ports 8123 (HTTP) and 9000 (Native)
- **CHProxy**: HTTP proxy for ClickHouse running on port 9090

## Quick Start

1. Start the services:
   ```bash
   docker-compose -f clickhouse.docker-compose.yaml up -d
   ```

2. Check service health:
   ```bash
   docker-compose -f clickhouse.docker-compose.yaml ps
   ```

3. Test ClickHouse directly:
   ```bash
   curl "http://localhost:8123/ping"
   ```

4. Test CHProxy:
   ```bash
   curl "http://localhost:9090/ping"
   ```

5. Run a test query through CHProxy:
   ```bash
   curl "http://localhost:9090/?query=SELECT version()"
   ```

## Configuration Files

- `chproxy-config.yml`: CHProxy configuration with connection pooling and rate limiting
- `clickhouse-config/config.xml`: ClickHouse server configuration
- Persistent data is stored in Docker volumes (`clickhouse_data` and `clickhouse_logs`)

## Ports

- **8123**: ClickHouse HTTP interface (direct access)
- **9000**: ClickHouse Native TCP interface
- **9090**: CHProxy HTTP interface (recommended for applications)

## Benefits of CHProxy

- **Connection pooling**: Reduces connection overhead
- **Rate limiting**: Prevents query abuse
- **Load balancing**: Can distribute queries across multiple ClickHouse instances
- **Security**: Additional authentication and authorization layer
- **Caching**: Optional query result caching

## Stopping Services

```bash
docker-compose -f clickhouse.docker-compose.yaml down
```

To remove volumes as well:
```bash
docker-compose -f clickhouse.docker-compose.yaml down -v
```