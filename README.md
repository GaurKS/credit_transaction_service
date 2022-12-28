# Credit Transaction Service

## Objective

Implement a service application which takes customer credit transactions as input and calculates minimum, maximum and ending balance by month for every customer.

## Tech Stack 
- Nodejs
- Expressjs
- Google Firebase Storage

## Pre-requisites
-   Install  [Node.js](https://nodejs.org/en/)


## Getting Started

-   Clone the repository
```
git clone  <project_url>

```
-   Install dependencies
```
cd <project_name>
npm install
```
- Create a project in google firebase console and add the `serviceAccountKey.json` in the root directory.
```
// serviceAccountKey.json
{
	"type":  "",
	"project_id":  "",
	"private_key_id":  "",
	"private_key":  "",
	"client_email":  "",
	"client_id":  "",
	"auth_uri":  "",
	"token_uri":  "",
	"auth_provider_x509_cert_url":  "",
	"client_x509_cert_url":  ""	
}
```
- Add `.env` file in the root directory
```
PORT=8000
GCS_STORAGE_URL='<gc_project_url>.appspot.com'
```
-   Build and run the project
```
npm run start
```

-   Navigate to  `http://localhost:8000`.


## API endpoints

**GET**: `localhost:8000/api/ping/test`

**POST**: `localhost:8000/api/local/upload/csv`
- The post endpoint will upload the input csv to root directory
> project_name/uploads/1672213221072-inputFile.csv
- The output csv file will be created in the root directory 
> project_name/outputs/1672213221072.csv

**POST**: `localhost:8000/api/cloud/upload/csv`
- The post endpoint will upload the input csv to root directory
> project_name/uploads/1672213221072-inputFile.csv
- The output csv file will be created in the root directory. This endpoint will also upload the generated file to firebase and returning a download url for the same. 
> project_name/outputs/1672213221072.csv

Complete details related to application endpoints, request body and sample response can be found in [this Postman Collection](https://api.postman.com/collections/17353116-8feb9aba-6242-4787-89f0-a63d36a5d67a?access_key=PMAT-01GNCB5CR000T63FSSX273MWAY).

## References
[Refer here](https://firebase.google.com/docs/admin/setup#add_firebase_to_your_app:~:text=To%20generate%20a,containing%20the%20key.) to setup a new google firebase project and generate `serviceAccountKey.json `.
