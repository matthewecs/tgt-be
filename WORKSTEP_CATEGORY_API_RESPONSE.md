# WorkStep API - Get by Category ID Response Samples

## API Endpoint
```
GET /work-step/category/:categoryId
```

## Request Examples

### Basic Request
```bash
curl -X GET "http://localhost:4000/work-step/category/64f7b8c9e1234567890abcde" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### With Search and Pagination
```bash
curl -X GET "http://localhost:4000/work-step/category/64f7b8c9e1234567890abcde?keyword=actuator&page=1&take=5" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### With Cookie Authentication
```bash
curl -X GET "http://localhost:4000/work-step/category/64f7b8c9e1234567890abcde?page=2&take=3" \
  -b cookies.txt
```

## Complete Response Samples

### Success Response - Basic Category Filter
```json
{
  "data": [
    {
      "_id": "64f7b8c9e1234567890abc01",
      "name": "ACTUATOR 1¼\"",
      "uniqueKey": "64f7b8c9e1234567890abcde-actuator-1¼",
      "description": "Quarter inch actuator for valve control",
      "options": [
        {
          "name": "Pressure Rating",
          "description": "Maximum working pressure",
          "preReqValue": 150,
          "preReqUnit": "psi",
          "metricValue": 10.34,
          "metricUnit": "bar",
          "price": 250.00,
          "quantity": 1,
          "minValue": 50,
          "maxValue": 300
        },
        {
          "name": "Material",
          "description": "Actuator body material",
          "preReqValue": null,
          "preReqUnit": null,
          "metricValue": null,
          "metricUnit": "brass",
          "price": 50.00,
          "quantity": 1,
          "minValue": null,
          "maxValue": null
        }
      ]
    },
    {
      "_id": "64f7b8c9e1234567890abc02",
      "name": "ACTUATOR 1\"",
      "uniqueKey": "64f7b8c9e1234567890abcde-actuator-1",
      "description": "One inch standard actuator",
      "options": [
        {
          "name": "Pressure Rating",
          "description": "Maximum working pressure",
          "preReqValue": 125,
          "preReqUnit": "psi",
          "metricValue": 8.62,
          "metricUnit": "bar",
          "price": 200.00,
          "quantity": 1,
          "minValue": 40,
          "maxValue": 250
        }
      ]
    },
    {
      "_id": "64f7b8c9e1234567890abc03",
      "name": "VALVE ½\" BSP",
      "uniqueKey": "64f7b8c9e1234567890abcde-valve-½-bsp",
      "description": "Half inch British Standard Pipe valve",
      "options": [
        {
          "name": "Thread Type",
          "description": "Threading specification",
          "preReqValue": null,
          "preReqUnit": null,
          "metricValue": null,
          "metricUnit": "BSP",
          "price": 75.00,
          "quantity": 1,
          "minValue": null,
          "maxValue": null
        },
        {
          "name": "Flow Rate",
          "description": "Maximum flow capacity",
          "preReqValue": 15,
          "preReqUnit": "GPM",
          "metricValue": 56.78,
          "metricUnit": "L/min",
          "price": 0,
          "quantity": 1,
          "minValue": 5,
          "maxValue": 25
        }
      ]
    },
    {
      "_id": "64f7b8c9e1234567890abc04",
      "name": "PIPE 2\" STEEL",
      "uniqueKey": "64f7b8c9e1234567890abcde-pipe-2-steel",
      "description": "Two inch steel pipe section",
      "options": [
        {
          "name": "Length",
          "description": "Pipe section length",
          "preReqValue": 12,
          "preReqUnit": "feet",
          "metricValue": 3.66,
          "metricUnit": "meters",
          "price": 45.00,
          "quantity": 1,
          "minValue": 1,
          "maxValue": 20
        },
        {
          "name": "Wall Thickness",
          "description": "Pipe wall thickness",
          "preReqValue": 0.154,
          "preReqUnit": "inches",
          "metricValue": 3.91,
          "metricUnit": "mm",
          "price": 15.00,
          "quantity": 1,
          "minValue": 0.1,
          "maxValue": 0.5
        }
      ]
    }
  ],
  "page": 1,
  "take": 10,
  "total": 4,
  "totalPages": 1
}
```

### Success Response - With Search Filter
```bash
# Request with keyword "actuator"
curl -X GET "http://localhost:4000/work-step/category/64f7b8c9e1234567890abcde?keyword=actuator&page=1&take=10"
```

```json
{
  "data": [
    {
      "_id": "64f7b8c9e1234567890abc01",
      "name": "ACTUATOR 1¼\"",
      "uniqueKey": "64f7b8c9e1234567890abcde-actuator-1¼",
      "description": "Quarter inch actuator for valve control",
      "options": [
        {
          "name": "Pressure Rating",
          "description": "Maximum working pressure",
          "preReqValue": 150,
          "preReqUnit": "psi",
          "metricValue": 10.34,
          "metricUnit": "bar",
          "price": 250.00,
          "quantity": 1,
          "minValue": 50,
          "maxValue": 300
        }
      ]
    },
    {
      "_id": "64f7b8c9e1234567890abc02",
      "name": "ACTUATOR 1\"",
      "uniqueKey": "64f7b8c9e1234567890abcde-actuator-1",
      "description": "One inch standard actuator",
      "options": [
        {
          "name": "Pressure Rating",
          "description": "Maximum working pressure",
          "preReqValue": 125,
          "preReqUnit": "psi",
          "metricValue": 8.62,
          "metricUnit": "bar",
          "price": 200.00,
          "quantity": 1,
          "minValue": 40,
          "maxValue": 250
        }
      ]
    }
  ],
  "page": 1,
  "take": 10,
  "total": 2,
  "totalPages": 1
}
```

### Success Response - With Pagination
```bash
# Request with pagination: page 2, take 2
curl -X GET "http://localhost:4000/work-step/category/64f7b8c9e1234567890abcde?page=2&take=2"
```

```json
{
  "data": [
    {
      "_id": "64f7b8c9e1234567890abc03",
      "name": "VALVE ½\" BSP",
      "uniqueKey": "64f7b8c9e1234567890abcde-valve-½-bsp",
      "description": "Half inch British Standard Pipe valve",
      "options": [
        {
          "name": "Thread Type",
          "description": "Threading specification",
          "preReqValue": null,
          "preReqUnit": null,
          "metricValue": null,
          "metricUnit": "BSP",
          "price": 75.00,
          "quantity": 1,
          "minValue": null,
          "maxValue": null
        }
      ]
    },
    {
      "_id": "64f7b8c9e1234567890abc04",
      "name": "PIPE 2\" STEEL",
      "uniqueKey": "64f7b8c9e1234567890abcde-pipe-2-steel",
      "description": "Two inch steel pipe section",
      "options": [
        {
          "name": "Length",
          "description": "Pipe section length",
          "preReqValue": 12,
          "preReqUnit": "feet",
          "metricValue": 3.66,
          "metricUnit": "meters",
          "price": 45.00,
          "quantity": 1,
          "minValue": 1,
          "maxValue": 20
        }
      ]
    }
  ],
  "page": 2,
  "take": 2,
  "total": 6,
  "totalPages": 3
}
```

### Empty Result Response
```bash
# Request with non-matching keyword
curl -X GET "http://localhost:4000/work-step/category/64f7b8c9e1234567890abcde?keyword=nonexistent"
```

```json
{
  "data": [],
  "page": 1,
  "take": 10,
  "total": 0,
  "totalPages": 0
}
```

## Error Responses

### Invalid Category ID
```bash
curl -X GET "http://localhost:4000/work-step/category/invalid-id" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

```json
{
  "success": false,
  "message": "Invalid ObjectId format"
}
```

### Unauthorized Access
```bash
curl -X GET "http://localhost:4000/work-step/category/64f7b8c9e1234567890abcde"
# (without Authorization header or cookie)
```

```json
{
  "success": false,
  "message": "Access token is required"
}
```

### Invalid/Expired Token
```bash
curl -X GET "http://localhost:4000/work-step/category/64f7b8c9e1234567890abcde" \
  -H "Authorization: Bearer invalid_or_expired_token"
```

```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

### Category Not Found (Valid ID but no results)
```bash
curl -X GET "http://localhost:4000/work-step/category/64f7b8c9e1234567890abcff" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

```json
{
  "data": [],
  "page": 1,
  "take": 10,
  "total": 0,
  "totalPages": 0
}
```

## Response Structure Details

### Main Response Object
- **data**: Array of work step objects matching the category
- **page**: Current page number (from query parameter, default: 1)
- **take**: Items per page (from query parameter, default: 10)
- **total**: Total number of work steps in the category (after search filter)
- **totalPages**: Total number of pages available

### WorkStep Object Structure
- **_id**: MongoDB ObjectId of the work step
- **name**: Human-readable name with special characters preserved
- **uniqueKey**: System-generated unique identifier (categoryId-kebab-case-name)
- **description**: Detailed description of the work step
- **options**: Array of configuration options for this work step

### Option Object Structure
- **name**: Option display name
- **description**: Detailed option description
- **preReqValue**: Prerequisite numeric value
- **preReqUnit**: Unit for prerequisite value
- **metricValue**: Metric equivalent value
- **metricUnit**: Metric unit
- **price**: Additional cost for this option
- **quantity**: Default quantity
- **minValue**: Minimum allowed value (validation)
- **maxValue**: Maximum allowed value (validation)

## Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| categoryId | ObjectId | Yes | - | MongoDB ObjectId of the category (path parameter) |
| keyword | String | No | - | Search term for name/description filtering |
| page | Integer | No | 1 | Page number for pagination |
| take | Integer | No | 10 | Number of items per page |

## HTTP Status Codes

- **200 OK**: Successful response with data
- **401 Unauthorized**: Missing or invalid authentication
- **403 Forbidden**: Token expired or malformed
- **500 Internal Server Error**: Database or server error
