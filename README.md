# NBA API
This web service is an API CLient for www.nba.com. This API provides data about NBA Players and Teams. It contains stats from 2016 to the current NBA season, 2020-21. This API is mainly used for my NBA Angular Application.

# Software Tools
* JavaScript
* JSON
* NodeJS
* ExpressJS
* CORS
* Fetch API
* XML to JSON converter

# Endpoints Example
```js
app.get("/players/:name", (req,res) => {
  m.getPlayerByWord(req.params.name)
  .then((data) => {
      res.json(data)
  })
})
```
This endpoint receives a string which will be used to search for the name of NBA players. It will return a list of names that include that specific string given by the user. Each item on the list will include important data about the NBA player which includes the playerID, teamID, height, weight, teams they've played for, draft and much more.

```json
{
  "pic": "https://cdn.nba.com/headshots/nba/latest/1040x760/201935.png",
  "fName": "James",
  "lName": "Harden",
  "fullName": "James Harden",
  "playerId": "201935",
  "teamId": "1610612751",
  "jersey": "13",
  "pos": "Guard",
  "heightF": "6",
  "heightI": "5",
  "weight": "220",
  "draftTeam": "1610612760",
  "draftYr": "2009",
  "draftPick": "3",
  "draftRound": "1",
  "yearsPro": "11",
  "college": "Arizona State",
  "hs": "Arizona State/USA",
  "teams": [
    "Thunder",
    "Rockets",
    "Nets"
  ],
  "teamUrl": "https://stats.nba.com/media/img/teams/logos/BKN_logo.svg",
  "teamName": "Brooklyn Nets",
  "teamAbb": "BKN",
  "simpleTeamName": "Nets"
}
```
