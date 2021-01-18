// ################################################################################
// Web service setup

const express = require("express");
const cors = require("cors");
const path = require("path");
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const HTTP_PORT = process.env.PORT || 8080;
// Or use some other port number that you like better

// Add support for incoming JSON entities
app.use(bodyParser.json());
// Add support for CORS
app.use(cors());



// ################################################################################
// Data model and persistent store setup

const manager = require("./manager.js");
const m = manager();

// ################################################################################
// Deliver the app's home page to browser clients
/*app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  console.log(res);
  next();
});*/

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "/index.html"));
  });

app.get("/players", (req,res) => {
    m.getAllPlayers()
    .then((data) => {
        res.json(data)
    })
})

app.get("/ytvid/:id", (req,res) => {
  m.getYtVids(req.params.id)
  .then((data) => {
    res.json(data)
})
})

app.get("/tmp", (req,res) => {
  m.getPbP()
  .then((data) => {
    res.json(data)
})
})

app.get("/players/:name", (req,res) => {
  m.getPlayerByWord(req.params.name)
  .then((data) => {
      res.json(data)
  })
})

app.get("/contracts/:id", (req,res) => {
  m.getContractsByTeam(req.params.id)
  .then((data) => {
      res.json(data)
  })
})

app.get("/playersId/:id", (req, res) => {
  m.getPlayerById(req.params.id)
  .then((data) => {
    res.json(data)
  })
})

app.get("/playerstats/:id", (req, res) => {
  m.getPlayerStats(req.params.id)
  .then((data) => {
    res.json(data)
  })
})

app.get("/careerstats/:id", (req, res) => {
  m.getCareerPlayerStats(req.params.id)
  .then((data) => {
    res.json(data)
  })
})

app.get("/teams", (req, res) => {
  m.getTeams()
  .then((data) => {
    res.json(data)
  })
})

app.get("/playoffs/:id", (req, res) => {
  m.getPlayerPlayoffStats(req.params.id)
  .then((data) => {
    res.json(data)
  })
})

app.get("/teamD/:id", (req, res) => {
  m.teamDetails(req.params.id)
  .then((data) => {
    res.json(data)
  })
})

app.get("/logs/:id", (req, res) => {
  m.gameLogs(req.params.id)
  .then((data) => {
    res.json(data)
  })
})

app.get("/teams/:id", (req, res) => {
  m.getTeamById(req.params.id)
  .then((data) => {
    res.json(data)
  })
})

app.get("/teams/stats/:id", (req, res) => {
  m.getTeamStatsById(req.params.id)
  .then((data) => {
    res.json(data)
  })
})

app.get("/coaches/:id", (req,res) => {
  m.getCoaches(req.params.id)
  .then((data) => {
    res.json(data)
  })
})

app.get("/teams/players/:id", (req, res) => {
  m.getPlayersByTeam(req.params.id)
  .then((data) => {
    res.json(data)
  })
})

app.get("/teams/leaders/:id", (req, res) => {
  m.getTeamLeaders(req.params.id)
  .then((data) => {
    res.json(data)
  })
})

app.get("/awards/:id", (req, res) => {
  m.getAwards(req.params.id)
  .then((data) => {
    res.json(data)
  })
})
app.get("/standings", (req, res) => {
  m.getAllStandings()
  .then((data) => {
    res.json(data)
  })
})

app.get("/standings/:id", (req, res) => {
  m.getStandings(req.params.id)
  .then((data) => {
    res.json(data)
  })
})

app.get("/division/:id", (req, res) => {
  m.getDivisionStandings(req.params.id)
  .then((data) => {
    res.json(data)
  })
})

app.get("/teamplayerstats/:id", (req, res) => {
  m.getTeamPlayerStats(req.params.id)
  .then((data) => {
    res.json(data)
  })
})


app.get("/east", (req, res) => {
  m.getEastTeams()
  .then((data) => {
    res.json(data)
  })
})

app.get("/west", (req, res) => {
  m.getWestTeams()
  .then((data) => {
    res.json(data)
  })
})

app.get("/playersLeaders", (req, res) => {
  m.getAllLeagueLeaders()
  .then((data) => {
    res.json(data)
  })
})

app.get("/leaders", (req, res) => {
  m.getLeagueLeaders(req.query.mode,req.query.scope, req.query.season, req.query.type, req.query.category)
  .then((data) => {
    res.json(data)
  })
  .catch((err) => {
    res.json(err)
  })
})

app.get("/teamRankings", (req, res) => {
  m.getTeamRankings()
  .then((data) => {
    res.json(data)
  })
  .catch((err) => {
    res.json(err)
  })
})

app.get("/injuries", (req,res) => {
  m.getInjuries()
  .then((data) => {
    res.json(data)
  })
  .catch((err) => {
    res.json(err)
  })
})

app.get("/injuries/:id", (req,res) => {
  m.getInjuriesByTeam(req.params.id)
  .then((data) => {
    res.json(data)
  })
  .catch((err) => {
    res.json(err)
  })
})

app.get("/teamRankings/:id", (req, res) => {
  m.getTeamRankingsById(req.params.id)
  .then((data) => {
    res.json(data)
  })
  .catch((err) => {
    res.json(err)
  })
})

app.get("/sortedTeamRankings/:id", (req, res) => {
  console.log(req.params.id);
  m.sortTeamRankings(req.params.id)
  .then((data) => {
    res.json(data)
  })
  .catch((err) => {
    res.json(err)
  })
})
  
  app.listen(HTTP_PORT, () => { console.log("Ready to handle requests on port " + HTTP_PORT) });