The real deal to use:

** Backend Calls **

GET /t2/projects --> Returns Projects List
POST /t2/projects --> Add new Project
PUT /t2/projects/:id --> Edit Exisiting Project
DELETE /t2/projects/:id --> Delete Exisiting Project

POST /t2/projects/:projectid/markers --> Add new Marker to Project with ":id"
PUT /t2/projects/:projectid/markers/:markerid --> Edit exisiting Marker with ":markerid" in project with ":id"
DELETE /t2/projects/:projectid/markers/:markerid --> DELETE exisiting Marker with ":markerid" in project with ":id"
 --> DELETE Calls are ID-stable, missing chunks will be padded with "null"

** Frontend Calls **

GET /t2/frontprojects --> Returns simple Project List as String-Arry in data object:
[code]
{
  "data": [
    "Projekt1",
    "Projekt2",
    "Projekt3_Neu",
    "Projekt5",
    "Projekt6"
  ]
}
[/code]

POST /t2/frontprojects/:id --> Login and returns Error or requested Project via :id
Expected Payload:
[code]
{"code":"1234"}
[code]
Expected Return in Error Case:
[code]
{"error": "Code invalid"}
[/code]
Expected Return in Success-Login Case:
[code]
{
  "data": {
    "name": "Projekt1",
    "code": "1234",
    "markers": [
      {
        "name": "Marker1",
        "lat": 13.1234,
        "lng": 15.1234
      }
    ]
  }
}
[/code]

Development IP:
http://10.135.13.8:12345/
Like: http://10.135.13.8:12345/t2/projects

For Future use:
http://54.209.31.24:20001/

project
{
  code,
  name,
  markers[
  {name, lat, lng}
  ]
}

getProjects --> Liste von Projekten
newProject(name)
addMarker(project, marker)
removeMarker(project, marker)

getProjectsPhone --> Reine Projekt Liste, kein Code, keine Markers
login(project, code) --> true/false
getMarkers(project) --> markers list
