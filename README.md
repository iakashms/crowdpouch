# serviceApp-Backend
App to Publish a service as a business, Avail the service as a user by registering into the app.
-----------------------USER------------------
Resource : POST http://localhost:4000/api/v1/user
Request : 
{
    "name": "Aditya",
    "email": "Adi@gmail.com",
    "password": "akashms789"
}

Success : 
{
    "status": 200,
    "dataSaved": {
        "_id": "60d2e301f9b65c3a338900de",
        "name": "Aditya",
        "email": "Adi@gmail.com",
        "password": "$2a$10$Bp4NWa1qCzphlYPvdJ3d1.dndUwy2MEevUaaDXohVnIhaK3l6l2fu",
        "__v": 0
    }
}

Error : 
{
    "status": 400,
    "errors": [
        {
            "msg": "akash@gmail.com is Already Taken.",
            "param": "email"
        }
    ]
}
----------------------------------------------------------

---------------Login Response-------------------
-> Resource POST http://localhost:4000/api/v1/login
Request : 
{
    "email": "Adi@gmail.com",
    "password": "akashms789"
}

Response :
{
    "status": 200,
    "loginDetails": {
        "userId": "60d2e301f9b65c3a338900de",
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MGQyZTMwMWY5YjY1YzNhMzM4OTAwZGUiLCJlbWFpbCI6IkFkaUBnbWFpbC5jb20iLCJpYXQiOjE2MjQ0MzQyNjksImV4cCI6MTYyNDQzNzg2OX0.VKlT99NPublIzCvn57_91hI5HCWp9x2y7o6ffkOfcFI",
        "tokenExpiration": 1
    }
}
----------------------------------------------------------

---------------UnAuthenticated Response-------------------
{
    "status": 400,
    "errors": [
        {
            "msg": "Unauthenticated"
        }
    ]
}
-----------------------------------------------------------
