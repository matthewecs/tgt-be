# WorkStep API - Get by Category ID

## Endpoint
```
GET /work-step/category/:categoryId
```

## Description
Retrieves all work steps belonging to a specific category. Returns complete work step data without pagination, sorted by name.

## Authentication
Requires JWT token authentication via:
- **Authorization header**: `Authorization: Bearer {jwt_token}`
- **Cookie**: `auth_token` cookie (automatically sent by browser)

## Request Examples

### Basic Request - Get All Work Steps in Category
```bash
curl -X GET "http://localhost:4000/work-step/category/64f7b8c9e1234567890abcde" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NGY3YjhjOWUxMjM0NTY3ODkwYWJjZGUiLCJ1c2VybmFtZSI6InRlc3R1c2VyIiwicm9sZSI6ImVtcGxveWVlIiwiaWF0IjoxNzI2ODM3NzAwLCJleHAiOjE3MjY5MjQxMDB9.XYZ123ABC456DEF789GHI012JKL345MNO678PQR901STU234"
```

### Using Cookie Authentication
```bash
curl -X GET "http://localhost:4000/work-step/category/64f7b8c9e1234567890abcde" \
  -b cookies.txt
```

### With Verbose Output
```bash
curl -X GET "http://localhost:4000/work-step/category/64f7b8c9e1234567890abcde" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Origin: http://localhost:3000" \
  -v
```

## Complete Success Response

```json
[
  {
    "_id": "64f7b8c9e1234567890abc01",
    "name": "ACTUATOR 1¼\"",
    "uniqueKey": "64f7b8c9e1234567890abcde-actuator-1¼",
    "categoryId": "64f7b8c9e1234567890abcde",
    "description": "Quarter inch actuator for precise valve control in high-pressure systems",
    "options": [
      {
        "name": "Pressure Rating",
        "description": "Maximum working pressure capacity",
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
        "name": "Material Grade",
        "description": "Actuator body material specification",
        "preReqValue": null,
        "preReqUnit": null,
        "metricValue": null,
        "metricUnit": "316 Stainless Steel",
        "price": 75.00,
        "quantity": 1,
        "minValue": null,
        "maxValue": null
      },
      {
        "name": "Temperature Range",
        "description": "Operating temperature limits",
        "preReqValue": 200,
        "preReqUnit": "°F",
        "metricValue": 93.33,
        "metricUnit": "°C",
        "price": 0,
        "quantity": 1,
        "minValue": -20,
        "maxValue": 250
      }
    ],
    "nextActions": [
      {
        "nextUniqueKey": "64f7b8c9e1234567890abcde-valve-1¼-ball",
        "isMandatory": true
      },
      {
        "nextUniqueKey": "64f7b8c9e1234567890abcde-pipe-1¼-npt",
        "isMandatory": false
      }
    ]
  },
  {
    "_id": "64f7b8c9e1234567890abc02",
    "name": "ACTUATOR 1\"",
    "uniqueKey": "64f7b8c9e1234567890abcde-actuator-1",
    "categoryId": "64f7b8c9e1234567890abcde",
    "description": "One inch standard actuator for general purpose applications",
    "options": [
      {
        "name": "Pressure Rating",
        "description": "Maximum working pressure capacity",
        "preReqValue": 125,
        "preReqUnit": "psi",
        "metricValue": 8.62,
        "metricUnit": "bar",
        "price": 200.00,
        "quantity": 1,
        "minValue": 40,
        "maxValue": 250
      },
      {
        "name": "Actuation Type",
        "description": "Method of actuator operation",
        "preReqValue": null,
        "preReqUnit": null,
        "metricValue": null,
        "metricUnit": "Pneumatic",
        "price": 100.00,
        "quantity": 1,
        "minValue": null,
        "maxValue": null
      }
    ],
    "nextActions": [
      {
        "nextUniqueKey": "64f7b8c9e1234567890abcde-valve-1-ball",
        "isMandatory": true
      }
    ]
  },
  {
    "_id": "64f7b8c9e1234567890abc03",
    "name": "VALVE ½\" BSP",
    "uniqueKey": "64f7b8c9e1234567890abcde-valve-½-bsp",
    "categoryId": "64f7b8c9e1234567890abcde",
    "description": "Half inch British Standard Pipe threaded ball valve",
    "options": [
      {
        "name": "Thread Type",
        "description": "Threading specification standard",
        "preReqValue": null,
        "preReqUnit": null,
        "metricValue": null,
        "metricUnit": "BSP",
        "price": 25.00,
        "quantity": 1,
        "minValue": null,
        "maxValue": null
      },
      {
        "name": "Flow Coefficient",
        "description": "Valve flow capacity rating",
        "preReqValue": 15.5,
        "preReqUnit": "Cv",
        "metricValue": 13.2,
        "metricUnit": "Kv",
        "price": 0,
        "quantity": 1,
        "minValue": 5,
        "maxValue": 25
      },
      {
        "name": "Seat Material",
        "description": "Valve seat sealing material",
        "preReqValue": null,
        "preReqUnit": null,
        "metricValue": null,
        "metricUnit": "PTFE",
        "price": 35.00,
        "quantity": 1,
        "minValue": null,
        "maxValue": null
      }
    ],
    "nextActions": [
      {
        "nextUniqueKey": "64f7b8c9e1234567890abcde-pipe-½-bsp",
        "isMandatory": true
      },
      {
        "nextUniqueKey": "64f7b8c9e1234567890abcde-actuator-½",
        "isMandatory": false
      }
    ]
  },
  {
    "_id": "64f7b8c9e1234567890abc04",
    "name": "PIPE 2\" STEEL",
    "uniqueKey": "64f7b8c9e1234567890abcde-pipe-2-steel",
    "categoryId": "64f7b8c9e1234567890abcde",
    "description": "Two inch carbon steel pipe section with welded joints",
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
        "description": "Pipe wall thickness specification",
        "preReqValue": 0.154,
        "preReqUnit": "inches",
        "metricValue": 3.91,
        "metricUnit": "mm",
        "price": 15.00,
        "quantity": 1,
        "minValue": 0.1,
        "maxValue": 0.5
      },
      {
        "name": "End Connection",
        "description": "Pipe end preparation type",
        "preReqValue": null,
        "preReqUnit": null,
        "metricValue": null,
        "metricUnit": "Beveled",
        "price": 20.00,
        "quantity": 2,
        "minValue": null,
        "maxValue": null
      }
    ],
    "nextActions": [
      {
        "nextUniqueKey": "64f7b8c9e1234567890abcde-fitting-2-elbow",
        "isMandatory": false
      },
      {
        "nextUniqueKey": "64f7b8c9e1234567890abcde-flange-2-150",
        "isMandatory": false
      }
    ]
  }
]
```

## Empty Category Response

```bash
# Request for category with no work steps
curl -X GET "http://localhost:4000/work-step/category/64f7b8c9e1234567890abcff" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

```json
[]
```

## Error Responses

### Missing Authentication
```bash
curl -X GET "http://localhost:4000/work-step/category/64f7b8c9e1234567890abcde"
# (no Authorization header or cookie)
```

**Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Access token is required"
}
```

### Invalid/Expired Token
```bash
curl -X GET "http://localhost:4000/work-step/category/64f7b8c9e1234567890abcde" \
  -H "Authorization: Bearer invalid_token_here"
```

**Response (403 Forbidden):**
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

### Invalid Category ID Format
```bash
curl -X GET "http://localhost:4000/work-step/category/invalid-objectid" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response (500 Internal Server Error):**
```json
{
  "success": false,
  "message": "Cast to ObjectId failed for value \"invalid-objectid\" (type string) at path \"categoryId\" for model \"WorkStep\""
}
```

### CORS Error (from browser without proper origin)
```bash
# Browser request from unauthorized origin
fetch('http://localhost:4000/work-step/category/64f7b8c9e1234567890abcde')
```

**Browser Console Error:**
```
Access to fetch at 'http://localhost:4000/work-step/category/64f7b8c9e1234567890abcde' 
from origin 'http://unauthorized-domain.com' has been blocked by CORS policy
```

## Response Structure Details

### WorkStep Object
| Field | Type | Description |
|-------|------|-------------|
| _id | ObjectId | MongoDB document identifier |
| name | String | Human-readable work step name with preserved special characters |
| uniqueKey | String | System-generated unique identifier (categoryId-processed-name) |
| categoryId | ObjectId | Reference to WorkStepCategory |
| description | String | Detailed description of the work step |
| options | Array | Configuration options for this work step |
| nextActions | Array | Possible next work steps in the workflow |

### Option Object
| Field | Type | Description |
|-------|------|-------------|
| name | String | Option display name |
| description | String | Detailed option description |
| preReqValue | Number/null | Prerequisite numeric value |
| preReqUnit | String/null | Unit for prerequisite value |
| metricValue | Number/null | Metric equivalent value |
| metricUnit | String/null | Metric unit or material specification |
| price | Number | Additional cost for this option |
| quantity | Number | Default quantity |
| minValue | Number/null | Minimum allowed value (for validation) |
| maxValue | Number/null | Maximum allowed value (for validation) |

### NextAction Object
| Field | Type | Description |
|-------|------|-------------|
| nextUniqueKey | String | Unique key of the next possible work step |
| isMandatory | Boolean | Whether this next step is required |

## Key Features

✅ **Special Character Preservation**: Names like "ACTUATOR 1¼\"" maintain fractions and quotes  
✅ **Unique Key Generation**: Custom algorithm creates distinct keys for similar names  
✅ **Complete Data**: Returns full work step objects with all options and next actions  
✅ **Sorted Results**: Automatically sorted alphabetically by name  
✅ **No Pagination**: Returns all work steps in the category (use main endpoint for pagination)  
✅ **Authentication Required**: Protected with JWT token validation  
✅ **CORS Enabled**: Supports cross-origin requests from allowed domains  

## Use Cases

- **Category Browse**: Display all work steps in a specific category
- **Workflow Building**: Get available work steps for workflow creation
- **Inventory Display**: Show complete catalog for a category
- **Admin Management**: Category-specific work step administration
