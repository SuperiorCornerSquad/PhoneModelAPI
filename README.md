# PhoneModelAPI

<!-- TOC depthFrom:1 depthTo:2 withLinks:1 updateOnSave:1 orderedList:0 -->

- [PhoneModelAPI](#phonemodelapi)
    - [User guide](#user-guide)
    - [API overview](#api-overview)
    - [Get calls](#get-calls)
    - [Post calls](#post-calls)
    - [Update calls](#update-calls)
    - [Delete calls](#delete-calls)

<!-- /TOC -->

## User guide

To start running the program you need a MySQL database, PHPStorm or a similar IDE.

To use the database you need to create a .env file in the root directory which contains the information for your database connection.

```
DB_HOST=host
DB_USER=user
DB_PASS=password
DB_NAME=database
```
Start the server with `node server.js`. Now you can start using the API.

## API overview

This is a RESTful API used to get technical information regarding smartphones and phablets.

The API responds in JSON format.

* **Base URL**

`/api/v1/`

## Get calls

* **URL**

  /manufacturers
  
*  **Optional URL Params**

    `no params`

* **Sample Call:**

  `GET http://localhost:8081/api/v1/manufacturers`
  
* **Response:**

  * **Code:** 200 <br />
  * **Content:** `["apple", "samsung"]`
 
***
* **URL**

  /manufacturers/:mfr
  
*  **Optional URL Params**

```
fields=[id,model,releaseDate,weight,displaySize,resolution,cameraRes,batteryCpty,os,osVersion,category]
afterDate=[date]
beforeDate=[date]
minWeight=[integer]
maxWeight=[integer]
minDisplaySize=[float]
maxDisplaySize=[float]
minCameraRes=[integer]
minCameraRes=[integer]
minBatteryCpty=[integer]
minBatteryCpty=[integer]
minOsVersion=[float]
maxOsVersion=[float]
```

* **Sample Call:**

  `GET http://localhost:8081/api/v1/manufacturers/samsung?fields=id,model,weight,displaySize&minDisplaySize=6.8`
  
* **Response:**

  * **Code:** 200 <br />
  * **Content:** `[{"Model_id":1,"Model_name":"Samsung Galaxy S20 Ultra 5G","Weight_g":500,"Display_size_inch":6.9},{"Model_id":4,"Model_name":"Samsung Galaxy Note10+ 5G","Weight_g":198,"Display_size_inch":6.8}]`
 
***

* **URL**

  /manufacturers/:mfr/:id
  
*  **Optional URL Params**

    `fields=[id,model,releaseDate,weight,displaySize,resolution,cameraRes,batteryCpty,os,osVersion,category]`

* **Sample Call:**

  `GET http://localhost:8081/api/v1/manufacturers/samsung/1?fields=model,category`

* **Response:**

  * **Code:** 200 <br />
  * **Content:** `[{"Model_name":"Samsung Galaxy S20 Ultra 5G","Category":"phablet"}]`

***

* **URL**

  `/smartphones`
  
  `/phablets`
  
*  **Optional URL Params**

```
fields=[id,model,releaseDate,weight,displaySize,resolution,cameraRes,batteryCpty,os,osVersion,category]
afterDate=[date]
beforeDate=[date]
minWeight=[integer]
maxWeight=[integer]
minDisplaySize=[float]
maxDisplaySize=[float]
minCameraRes=[integer]
minCameraRes=[integer]
minBatteryCpty=[integer]
minBatteryCpty=[integer]
minOsVersion=[float]
maxOsVersion=[float]
```

* **Sample Call:**

  `GET http://localhost:8081/api/v1/smartphones?fields=model&minBatteryCpty=3000`

* **Response:**

  * **Code:** 200 <br />
  * **Content:** `[{"Model_name":"Apple iPhone 11 Pro MAX"},{"Model_name":"Samsung Galaxy Z Flip"}]`

## Post calls

* **URL**

  /manufacturers
  
*  **JSON Body**

    `{"manufacturer":"Huawei"}`

* **Sample Call:**

  `POST http://localhost:8081/api/v1/manufacturers`
  
* **Response:**

  * **Code:** 200
 
***

* **URL**

  /manufacturers/:mfr
  
*  **JSON Body**

    `{"Model_name": "Samsung Galaxy S20 Ultra 5G","Release_date": "2020-03-05","Weight_g": 222,"Display_size_inch": 6.9,"Resolution": "1440x3200","Camera": 108,"Battery_capacity": 5000,"Operating_system": "Android","OS_version": 10,"Category": "Phablet"}`

* **Sample Call:**

  `POST http://localhost:8081/api/v1/manufacturers/samsung`
  
* **Response:**

  * **Code:** 200
 
## Update calls



## Delete calls
