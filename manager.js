const ball = require('nba-api-client');
const NBA = require("nba");
const nbajs = require("nba.js").default;
const fetch = require("node-fetch");
const teams = require('./teams');
const Youtube = require('youtube-node');
const cheerio = require('cheerio');
const request = require('request');
const xml2js = require("xml2js");

const blank = "https://cdn.clipart.email/ca081e2247437bad37055d21fa5dc003_headshot-silhouette-person-placeholder-hd-png-download-kindpng_860-830.png";
function getTeamAbb(id) {
    for (let i = 0; i < teams.t.length; i++) {
        if (id == teams.t[i].teamId) {
            return teams.t[i].abbreviation;
        }
    }
}

function foo(id) {
    let tmp = checkIfPlayerIsTraded(id);
    if (tmp instanceof Array) {
        tmp.reverse();
        let str = "";
        for (let i = 0; i < tmp.length; i++) {
            for (let j = 0; j < teams.t.length; j++) {
                if (tmp[i] == teams.t[j].teamId) {
                    if (i < tmp.length - 1) {
                        str += `${getTeamAbb(tmp[i])}-`;
                    } else {
                        str += `${getTeamAbb(tmp[i])}`;
                    }
                }
            }
        }
        return str;
    }
    else {
        for (let i = 0; i < teams.t.length; i++) {
            if (tmp == teams.t[i].teamId) {
                return teams.t[i].abbreviation;
            }
        }
    }
}

function findConferenceById(id) {
    for (let i = 0; i < teams.t.length; i++) {
        if (id == teams.t[i].teamId)
            return teams.t[i].conference.toLowerCase();
    }
}

function findDivisionById(id) {
    for (let i = 0; i < teams.t.length; i++) {
        if (id == teams.t[i].teamId)
            return teams.t[i].division.toLowerCase();
    }
}

function checkIfPlayerIsTraded(a) {
        if (a.teams.length > 1) { // sees if a player has been traded
            let arr = new Array();
            for (let i = 1; i < a.teams.length; i++) {
                arr.push(a.teams[i].teamId);
            }
            return arr;
        }
        else {
            return a.teams[0].teamId;
        }
}

class TeamInjuries{
    constructor(teamAbr, players) {
        this.teamAbr = teamAbr;
        this.players = players;
    }
}

class PlayerInjury{
    constructor(name, injury, notes, date) {
        this.name = name;
        this.injury = injury;
        this.notes = notes;
        this.date = date;
    }
}

class PlayerInfo {
    constructor(pic, fName, lName, playerId, teamId, jersey, pos, heightF, heightI, weight, draftTeam, draftYr, draftPick, draftRound,
        yearsPro, college, hs, teams) {
            this.pic = pic;
            this.fName = fName;
            this.lName = lName;
            this.fullName = `${this.fName} ${this.lName}`;
            this.playerId = playerId;
            this.teamId = teamId;
            this.jersey = jersey;
            this.pos = this.setPosition(pos);
            this.heightF = heightF;
            this.heightI = heightI;
            this.weight = weight;
            this.draftTeam = draftTeam
            this.draftYr = draftYr;
            this.draftPick = draftPick;
            this.draftRound = draftRound;
            this.yearsPro = yearsPro;
            this.college = college;
            this.hs = hs;
            this.teams = new Array();
            this.setTeams(teams);
            this.teamUrl = null;
            this.teamName = this.findTeamById(this.teamId);
            this.teamAbb = getTeamAbb(this.teamId);
            this.simpleTeamName = this.getSimple(this.teamId);
        }

    getSimple(id) {
        return teams.t.filter(v => id == v.teamId)[0].simpleName;
    }
    setTeams(data) {
        for (let i = 0; i < data.teams.length; i++) {
            this.teams.push(this.findTeamName(data.teams[i].teamId));//data.teams[i].teamId);
        }
        const unique = new Set(this.teams);
        this.teams = [...unique];
    }

    findTeamById(id) {
        for (let i = 0; i < teams.t.length; i++) {
            if (id == teams.t[i].teamId) {
                let tmp = ball.getTeamLogoURLs(getTeamAbb(this.teamId));
                this.teamUrl = tmp[0];
                return teams.t[i].teamName;
            }
        }
    }

    findTeamName(id) {
        for (let i = 0; i < teams.t.length; i++) {
            if (id == teams.t[i].teamId) {
                let tmp = ball.getTeamLogoURLs(getTeamAbb(this.teamId));
                this.teamUrl = tmp[1];
                return teams.t[i].simpleName;
            }
        }
    }

    setPosition(pos) {
        const positions = ["G", "F", "C", "G-F", "F-C", "C-F", "F-G"];
        const positionFull = ["Guard", "Forward", "Center", "Guard-Forward", "Forward-Center", "Center-Forward", "Forward-Guard"];

        for (let i = 0; i < positions.length; i++) {
            if (pos == positions[i]) {
                return positionFull[i];
            }
        }
    }
}

class Player {
    constructor(yr, PlayerID, teamID, PPG, RPG, APG, SPG, BPG, TPG, MPG, ORB, 
        DRB, FG, TPP, FT, FGM, FGA, FTM, FTA, FG3M, FG3A, gamesPlayed, a) {
        this.seasonYear = yr;
        this.PlayerID = PlayerID;
        this.teamID = teamID;
        this.PointsPerGame = PPG;
        this.ReboundsPerGame = RPG;
        this.AssistsPerGame = APG;
        this.StealsPerGame = SPG;
        this.BlocksPerGame = BPG;
        this.TurnoversPerGame = TPG;
        this.MinutesPerGame = MPG;
        this.TotalOREB = ORB;
        this.TotalDRB = DRB;
        this.FGPercentage = FG;
        this.ThreePtPercentage = (TPP == "NaN" ? "-" : TPP);
        this.FTPercentage = FT;
        this.FGM = FGM;
        this.FGA = FGA;
        this.FTM = FTM;
        this.FTA = FTA;
        this.FG3M = FG3M;
        this.FG3A = FG3A;
        this.teamAbb = foo(a);
        this.gamesPlayed = gamesPlayed;
      }
}

class CareerStats {
    constructor(PlayerID, PPG, RPG, APG, SPG, BPG, TPG, MPG, FGP, TPP,
        FTP, totalPoints, totalRb, totalAst, totalStl, totalBk, min, gamesPlayed, dd2, td3) {
            this.PlayerID = PlayerID;
            this.PointsPerGame = PPG;
            this.ReboundsPerGame = RPG;
            this.AssistsPerGame = APG;
            this.StealsPerGame = SPG;
            this.BlocksPerGame = BPG;
            this.TurnoversPerGame = TPG;
            this.MinutesPerGame = MPG;
            this.FGPercentage = FGP;
            this.ThreePtPercentage = TPP;
            this.FTPercentage = FTP;
            this.totalPoints = totalPoints;
            this.totalRb = totalRb;
            this.totalAst = totalAst;
            this.totalStl = totalStl;
            this.totalBk = totalBk;
            this.min = min;
            this.gamesPlayed = gamesPlayed
            this.DoubleDouble = dd2;
            this.TripleDouble = td3;
        }
}

class TeamLeaders {
    async setPts(id, value) {
        this.ptsId = await id;
        this.ptsValue = value;
    }
    setRbs(rbsId, rbsValue) {
        this.rbsId = rbsId;
        this.rbsValue = rbsValue;
    }

    setAst(astId, astValue) {
        this.astId = astId;
        this.astValue = astValue;
    }

    setFgp(fgpId, fgpValue) {
        this.fgpId = fgpId;
        this.fgpValue = fgpValue;
    }

    setTpp(ttpId, ttpValue) {
        this.ttpId = ttpId;
        this.ttpValue = ttpValue;
    }

    setFtp( ftpId, ftpValue) {
        this.ftpId = ftpId;
        this.ftpValue = ftpValue;
    }

    setStl(stlId, stlValue) {
        this.stlId = stlId;
        this.stlValue = stlValue;
    }

    setBlk(blkId, blkValue) {
        this.blkId = blkId;
        this.blkValue = blkValue;
    }
}
class Coach {
    constructor(name, position) {
        this.name = name;
        this.position = this.setPosition(position);
    }

    setPosition(position) {
        if (position) {
            return "Assistant Coach"
        } else {
            return "Head Coach"
        }
    }
}

class Standings {
    constructor(teamID, w, l, pct, gb, homeW, homeL, awayW, awayL, last10W, 
        last10L, streak, isWinStreak, pos) {
            this.teamID = teamID;
            this.w = w;
            this.l = l;
            this.pct = pct;
            this.gb = gb;
            this.homeW = homeW;
            this.homeL = homeL;
            this.awayW = awayW;
            this.awayL = awayL;
            this.last10W = last10W;
            this.last10L = last10L;
            this.streak = streak;
            this.isWinStreak = isWinStreak;
            this.pos = pos;
            this.setLogo(this.teamID)
            this.setName(this.teamID)
            this.setAbb(this.teamID)
            this.setAlt(this.teamID)
        }
    setLogo(id){
        for (let i = 0; i <teams.t.length; i++) {
            if (id == teams.t[i].teamId) {
                this.logoUrl = teams.t[i].logoUrl;
                break;
            }
        }
    }

    setAlt(id){
        for (let i = 0; i <teams.t.length; i++) {
            if (id == teams.t[i].teamId) {
                this.logoAlt = teams.t[i].altLogo;
                break;
            }
        }
    }
    setName(id){
        for (let i = 0; i <teams.t.length; i++) {
            if (id == teams.t[i].teamId) {
                this.teamName = teams.t[i].simpleName;
                break;
            }
        }
    }
    setAbb(id){
        for (let i = 0; i <teams.t.length; i++) {
            if (id == teams.t[i].teamId) {
                this.teamAbb = teams.t[i].abbreviation;
                break;
            }
        }
    }
}

async function findIDForPlayer(id) {
    let playersObj;
    let url = `http://data.nba.net/data/10s/prod/v1/2020/players.json`;
    let response = await fetch(url);
    let json = await response.json();

    let e = json.league.standard;
    for (let i = 0; i < e.length; i++) {
        if (e[i].isActive == true && e[i].personId == id) {
            let pic = `https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${e[i].personId}.png`;
            playersObj = new PlayerInfo(pic, e[i].firstName, e[i].lastName,e[i].personId, e[i].teamId, e[i].jersey,
                e[i].pos, e[i].heightFeet, e[i].heightInches, e[i].weightPounds, e[i].draft.teamId,
                e[i].draft.seasonYear, e[i].draft.pickNum, e[i].draft.roundNum,
                ++e[i].yearsPro, e[i].collegeName, e[i].lastAffiliation, e[i]);
        } 
    }

    return playersObj;
}

async function getIDForPlayer(name) {
    let playersObj;
    let url = `http://data.nba.net/data/10s/prod/v1/2020/players.json`;
    let response = await fetch(url);
    let json = await response.json();

    let e = json.league.standard;
    for (let i = 0; i < e.length; i++) {
        let pName = `${e[i].firstName} ${e[i].lastName}`;
        if (e[i].isActive == true && name == pName) {
            let pic = `https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${e[i].personId}.png`;
            playersObj = new PlayerInfo(pic, e[i].firstName, e[i].lastName,e[i].personId, e[i].teamId, e[i].jersey,
                e[i].pos, e[i].heightFeet, e[i].heightInches, e[i].weightPounds, e[i].draft.teamId,
                e[i].draft.seasonYear, e[i].draft.pickNum, e[i].draft.roundNum,
                ++e[i].yearsPro, e[i].collegeName, e[i].lastAffiliation, e[i]);
                break;
            } 
        }
        
    return playersObj.playerId;
}

async function getNumForStanding(id, conference) {
    let s = new Array();
    let url = "http://data.nba.net/prod/v1/current/standings_conference.json";
    const response = await fetch(url);
    const json = await response.json();
    let a;
    if (conference == "East") a = json.league.standard.conference.east;
    else a = json.league.standard.conference.west

    let position;
    for (let i = 0; i < a.length; i++) {
        if (id == a[i].teamId) {
            position = ordinal_suffix_of(i + 1);
            break;
        }
    }
    console.log(position);

    return position;
}

function ordinal_suffix_of(i) {
    var j = i % 10,
        k = i % 100;
    if (j == 1 && k != 11) {
        return i + "st";
    }
    if (j == 2 && k != 12) {
        return i + "nd";
    }
    if (j == 3 && k != 13) {
        return i + "rd";
    }
    return i + "th";
}

module.exports = function () {
    return {
        getAllPlayers: function() {
            return new Promise(async function(resolve, reject){
                let playersObj = new Array();
                let url = `http://data.nba.net/data/10s/prod/v1/2020/players.json`;
                let response = await fetch(url);
                let json = await response.json();

                let e = json.league.standard;
                for (let i = 0; i < e.length; i++) {
                    if (e[i].isActive == true) {
                        //https://cdn.nba.com/headshots/nba/latest/1040x760/1627832.png
                        let pic = `https://cdn.nba.com/headshots/nba/latest/1040x760/${e[i].personId}.png`;
                        //let pic = ball.getPlayerHeadshotURL({PlayerID: e[i].personId, TeamID: e[i].teamId})
                        playersObj.push(new PlayerInfo(pic, e[i].firstName, e[i].lastName,e[i].personId, e[i].teamId, e[i].jersey,
                            e[i].pos, e[i].heightFeet, e[i].heightInches, e[i].weightPounds, e[i].draft.teamId,
                            e[i].draft.seasonYear, e[i].draft.pickNum, e[i].draft.roundNum,
                            ++e[i].yearsPro, e[i].collegeName, e[i].lastAffiliation, e[i]));
                    } 
                }
                return resolve(playersObj);
            })
        },
        //s.sort((a, b) => (a.ppg < b.ppg) ? 1 : -1);
        
        getPlayerById: function(p) {
            return new Promise(async function(resolve, reject) {
                let url = `http://data.nba.net/data/10s/prod/v1/2020/players.json`;
                let response = await fetch(url);
                let json = await response.json();

                let tmp = json.league.standard;
                let result = tmp.filter(obj => obj.personId == p);
                var e = result[0];
                let pic = `https://cdn.nba.com/headshots/nba/latest/1040x760/${e.personId}.png`;
                let obj = new PlayerInfo(pic, e.firstName, e.lastName, e.personId, e.teamId, e.jersey,
                    e.pos, e.heightFeet, e.heightInches, e.weightPounds, e.draft.teamId,
                    e.draft.seasonYear, e.draft.pickNum, e.draft.roundNum,
                    ++e.yearsPro, e.collegeName, e.lastAffiliation, e);
                
                return resolve(obj);
            })
        },

        getPlayoffs: function(id) {
            return new Promise(async function(resolve, reject) {

                nbajs.stats.playerInfo({ LeagueID: "00", PlayerID: id })
                .then(response => {
                    return resolve(response)})
                .catch(err => console.log(err));
            })
        },

        getYtVids: function(id) {
            return new Promise((resolve, reject) => {
                let youtube = new Youtube();
                youtube.setKey('AIzaSyD1UVikyVNK1Ylua7p64Lse-G8MhY4zdDg');
                //let s = new Array();
                console.log(id);
                youtube.search(id.toString(), 5, function(error, result) {
                    if (error) { console.log(error )}
                    else {
                        for (let i = 0; i < result.items.length; i++) {
                        if (result.items[i].id['videoId'] && result.items[i].snippet.channelTitle == 'NBA') {
                            return resolve([`${result.items[i].id['videoId']}`])
                        }
                    }
                    }
                } );
            })
        },

        getPbP: function(id) {
            return new Promise(async(resolve, reject) => {
                let url = `http://data.nba.net/data/10s/json/cms/noseason/game/20200722/0011900101/pbp_all.json`;
                let response = await fetch(url);
                let json = await response.json();
                let a = json.sports_content.game.play;

                let s = new Array();
                let huh = 0;
                for (let i = 0; i < a.length; i++) {
                    let str = ""

                    str += `${a[i].team_abr} | ${(a[i].clock == "" ? '12:00' : a[i].clock)} | `;
                    str += a[i].description.replace(/ *\[[^)]*\] */g, "");
                    let obj = {qtr: ordinal_suffix_of(parseInt(a[i].period)), team: a[i].team_abr, clock: a[i].clock, desc: a[i].description, id: a[i].person_id, homeScore: a[i].home_score, visitorScore: a[i].visitor_score}
                    s.push(obj);
                }
                return resolve(s);
            })
        },

        getAwards: function(id) { //! PLAYER AWARDS (FROM Player of the Weeks to MVP)
            return new Promise(async function(resolve, reject) {
                let url = `http://stats.nba.com/stats/playerawards/?playerId=${id}`;
                const response = await fetch(url, {
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Host': 'stats.nba.com',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36',
                        //'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:61.0) Gecko/20100101 Firefox/61.0',
                        'Accept': 'application/json, text/plain, */*',
                        'Accept-Language': 'en-US,en;q=0.5',
                        'Referer': 'https://stats.nba.com/',
                        'Accept-Encoding': 'gzip, deflate, br',
                        'Connection': 'keep-alive',
                        'x-nba-stats-origin': 'stats',
                        'x-nba-stats-token': 'true',
                        "cache-control": "max-age=0"
                      },
                      json: false
                })

                let json = await response.json();
                let mvp = 0, asgMvp = 0, fMvp = 0, dpoy = 0, roty = 0, 
                smoty = 0, mip = 0, allNba = 0, allDef = 0, allRook = false, playerWeek = 0, playerMonth = 0, rookieMonth;

                for (let i = 0; i < json.resultSets[0].rowSet.length; i++) {
                    let x = json.resultSets[0].rowSet[i][4];
                    if (x == "NBA Most Valuable Player" || 
                    x == "NBA Sporting News Most Valuable Player of the Year") {
                        mvp++;
                    }
                    else if (x == "NBA All-Star Most Valuable Player") {
                        asgMvp++;
                    } else if (x == "NBA Finals Most Valuable Player") {
                        fMvp++;
                    } else if (x == "NBA Defensive Player of the Year") {
                        dpoy++;
                    } else if (x == "NBA Rookie of the Year") {
                        roty++;
                    } else if (x == "NBA Sixth Man of the Year") {
                        smoty++;
                    } else if (x == "NBA Most Improved Player") {
                        mip++
                    } else if (x == "All-NBA") {
                        allNba++
                    } else if (x == "All-Defensive Team") {
                        allDef++
                    } else if (x == "All-Rookie Team" || x == "All-Rookie" ) {
                        allRook = true;
                    } else if (x == "NBA Player of the Week") {
                        playerWeek++
                    } else if (x == "NBA Player of the Month") {
                        playerMonth++
                    }
                }

                let arr = new Array();
                arr.push(mvp > 0 ? new PlayerAwards("Most Valuable Player (MVP)", mvp) : null);
                arr.push(asgMvp > 0 ? new PlayerAwards("All-Star MVP", asgMvp) : null);
                arr.push(fMvp > 0 ? new PlayerAwards("Finals MVP", fMvp) : null);
                arr.push(roty > 0 ? new PlayerAwards("Rookie of the Year", roty) : null);
                arr.push(smoty > 0 ? new PlayerAwards("6th Man of the Year", smoty) : null);
                arr.push(dpoy > 0 ? new PlayerAwards("Defensive Player of the Year", dpoy) : null);
                arr.push(mip > 0 ? new PlayerAwards("Most Improved Player", mip) : null);
                arr.push(allNba > 0 ? new PlayerAwards("All-NBA", allNba) : null);
                arr.push(allDef > 0 ? new PlayerAwards("All-Defensive", allDef) : null);
                arr.push(allRook == true ? new PlayerAwards("All-Rookie Team", allRook) : null);
                arr.push(playerWeek > 0 ? new PlayerAwards("Player of the Week", playerWeek) : null);
                arr.push(playerMonth > 0 ? new PlayerAwards("Player of the Month", playerMonth) : null);
                //console.log(json.resultSets[0].rowSet[0][0]);
                return resolve(arr.filter(el => el != null));
            })
        },
        getPlayerPlayoffStats: function(id) {
            return new Promise(function(resolve, reject) { //! FOR PLAYOFFS STATS
                nbajs.stats.playerProfile({LeagueID: "00", PerMode: "PerGame", PlayerID: id})
                .then(res => {
                    return resolve(res);
                })
            })
        },

        teamDetails: function(id) {
            return new Promise(function(resolve, reject) { //! DATA ABOUT TEAM ACCOMPLISHMENTS
                nbajs.stats.teamDetails({TeamID: id})
                .then(res => {
                    return resolve(res);
                })
            })
        },

        gameLogs: function(id) {
            return new Promise(function(resolve, reject) { //! GAME LOGS FROM BEGINNING OF THE SEASON UNTIL LAST GAME PLAYED
                nbajs.stats.playerGamelog({LeagueID: "00", PlayerID: id, Season: "2020-21", SeasonType: "Regular Season"})
                .then(res => {
                    return resolve(res);
                })
            })
        },

        getPlayerByWord: function(word) {
            return new Promise(async function(resolve, reject) {
                word = decodeURIComponent(word);
                word = word.toLocaleLowerCase();
                let playersObj = new Array();
                let url = `http://data.nba.net/data/10s/prod/v1/2020/players.json`;
                let response = await fetch(url);
                let json = await response.json();

                let e = json.league.standard;
                for (let i = 0; i < e.length; i++) {
                    if (e[i].isActive == true) {
                        let pic = `https://cdn.nba.com/headshots/nba/latest/1040x760/${e[i].personId}.png`;
                        playersObj.push(new PlayerInfo(pic, e[i].firstName, e[i].lastName,e[i].personId, e[i].teamId, e[i].jersey,
                            e[i].pos, e[i].heightFeet, e[i].heightInches, e[i].weightPounds, e[i].draft.teamId,
                            e[i].draft.seasonYear, e[i].draft.pickNum, e[i].draft.roundNum,
                            e[i].yearsPro, e[i].collegeName, e[i].lastAffiliation, e[i]));
                    } 
                }
                
                
                let results = new Array();
                console.log()
                for (let i = 0; i < playersObj.length; i++) {
                    let tmp = new String(playersObj[i].fullName);
                    tmp.toLocaleLowerCase();
                    if(tmp.toLocaleLowerCase().includes(word)) {
                        results.push(playersObj[i]);
                    }
                }

                return resolve(results);
            })
        },
        
        getPlayerStats: function(id) {
            return new Promise(async function(resolve, reject) {

                let url = `https://data.nba.net/prod/v1/2020/players/${id}_profile.json`;
                let response = await fetch(url);
                let json = await response.json();
    
                let tmp = json.league.standard.stats.regularSeason.season;
                //console.log(tmp);
                let obj = new Array();
                for (let i = 0; i < tmp.length; i++) {
                    let a = tmp[i].teams[0];
    
                    obj.push(new Player(tmp[i].seasonYear, id, a.teamId, a.ppg, a.rpg, a.apg, a.spg,
                        a.bpg, a.topg, (a.min/a.gamesPlayed).toFixed(1), (a.offReb/a.gamesPlayed).toFixed(1), (a.defReb/a.gamesPlayed).toFixed(1),
                        ((a.fgm/a.fga) * 100).toFixed(1), ((a.tpm/a.tpa) * 100 ).toFixed(1), ( (a.ftm/a.fta) * 100).toFixed(1),
                        (a.fgm/a.gamesPlayed).toFixed(1), (a.fga/a.gamesPlayed).toFixed(1),
                        (a.ftm/a.gamesPlayed).toFixed(1), (a.fta/a.gamesPlayed).toFixed(1), (a.tpm/a.gamesPlayed).toFixed(1),
                        (a.tpa/a.gamesPlayed).toFixed(1), a.gamesPlayed, tmp[i]));
                }
                return resolve(obj);
            })
        },

        getTeamPlayerStats: function(id) {
            return new Promise(async function(resolve, reject) {
                let playerArr = new Array();
                let teamUrl = `https://data.nba.net/prod/v1/2020/players.json`;
                let teamResponse = await fetch(teamUrl);
                let teamJson = await teamResponse.json();
                let e = teamJson.league.standard;

                let tmp = e.filter(obj => obj.teamId == id);

                let playerUrl, playerResponse, playerJson, arr;
                for (let i = 0; i < tmp.length; i++) {
                    playerUrl = `https://data.nba.net/prod/v1/2020/players/${tmp[i].personId}_profile.json`;
                    playerResponse = await fetch(playerUrl);
                    playerJson = await playerResponse.json();
                    arr = playerJson.league.standard.stats.regularSeason.season[0].total;

                    arr["playerId"] = tmp[i].personId;
                    arr["playerName"] = `${tmp[i].firstName} ${tmp[i].lastName}`;
                    //console.log(playerArr);
                    playerArr.push(arr);
                }

                return resolve(playerArr);
            })
        },
        getCareerPlayerStats: function(id) {
            return new Promise(async function(resolve, reject) {
                let url = `https://data.nba.net/prod/v1/2020/players/${id}_profile.json`;
                let response = await fetch(url);
                let json = await response.json();

                let tmp = json.league.standard.stats.careerSummary;

                let obj = new CareerStats(id, tmp.ppg, tmp.rpg, tmp.apg, tmp.spg, tmp.bpg, 
                    (tmp.turnovers/tmp.gamesPlayed).toFixed(1), tmp.mpg, tmp.fgp, tmp.tpp,
                    tmp.ftp, tmp.points, tmp.totReb, tmp.assists, tmp.steals, tmp.blocks, tmp.min,
                     tmp.gamesPlayed, tmp.dd2, tmp.td3)

                return resolve(obj);
            })
        },

        getTeams: function() {
            return new Promise(function(resolve, reject) {
                let obj = teams.t;
                console.log(obj);
                return resolve(teams.t);
            })
        },

        getTeamById: function(id) {
            return new Promise(async function(resolve, reject) {
                for (let i = 0; i < teams.t.length; i++) {
                    if (id == teams.t[i].teamId) {
                        let standing = await getNumForStanding(teams.t[i].teamId, teams.t[i].conference);
                        teams.t[i]["position"] = standing;
                        return resolve(teams.t[i]);
                    }
                }
            })
        },

        getEastTeams: function() {
            return new Promise(function(resolve,reject) {
                let a = new Array();
                const result = teams.t.filter(team => team.conference == "East");

                return resolve(result);
            })
        },

        getWestTeams: function() {
            return new Promise(function(resolve,reject) {
                let a = new Array();
                const result = teams.t.filter(team => team.conference == "West");

                return resolve(result);
            })
        },

        getInjuries: function() {
            return new Promise(function(resolve, reject) {
                let url = 'https://www.fantasybasketballnerd.com/service/injuries/';
                fetch(url)
                .then(response => response.text())
                .then(str => {
                    const parser = new xml2js.Parser();

                    parser.parseString(str, (err, result) => {
                        let arr = result.FantasyBasketballNerd.Team;
                        let players = new Array();
                        let teams = new Array();
                        let code;
                        for (let i = 0; i < arr.length; i++) {
                            code = arr[i].$.code;
                            for (let j = 0; j < arr[i].Player.length; j++) {
                                let a = arr[i].Player[j];
                                players.push(new PlayerInjury(a.name[0], a.injury[0], a.notes[0], a.updated[0]));
                            }

                            teams.push(new TeamInjuries(code, players));
                            players = []; // empty the array before filling it again
                        }

                        return resolve(teams);
                    })
                })
            })
        },

        getInjuriesByTeam: async function(abr) {
            return new Promise(function(resolve, reject) {
                let url = 'https://www.fantasybasketballnerd.com/service/injuries/';
                fetch(url)
                .then(response=>response.text())
                .then(str => {
                    const parser = new xml2js.Parser();

                    parser.parseString(str, async (err, result) => {
                        let arr = result.FantasyBasketballNerd.Team;
                        let players = new Array();
                        let teams = new Array();
                        let code;
                        let found = false;
                        for (let i = 0; i < arr.length; i++) {
                            if (arr[i].$.code == abr) {
                                found = true;
                                code = arr[i].$.code;
                                for (let j = 0; j < arr[i].Player.length; j++) {
                                    let a = arr[i].Player[j];
                                    players.push(new PlayerInjury(a.name[0], a.injury[0], a.notes[0], a.updated[0]));
                                }
                                break;
                            }
                        }

                        if (found) {
                            for (let i = 0; i < players.length; i++) {
                                let id = await getIDForPlayer(players[i].name);
                                players[i]["playerId"] = id;
                            }
                            let team = new TeamInjuries(code, players);

                            return resolve(team);
                        }
                        else {
                            return resolve({message: "Team is not found"});
                        }
                    })
                })
            })
        },

        getCoaches: function (id) {
            return new Promise(async function(resolve, reject) {
                let url = `http://data.nba.net/prod/v1/2020/coaches.json`;
                let response = await fetch(url);
                let json = await response.json();

                let tmp = json.league.standard;

                let coachArr = new Array();
                for (let i = 0; i < tmp.length; i++) {
                    if (id == tmp[i].teamId) {
                        coachArr.push(new Coach(`${tmp[i].firstName} ${tmp[i].lastName}`, tmp[i].isAssistant));
                    }
                }

                return resolve(coachArr);
            })
        },

        getPlayersByTeam: function(id) {
            return new Promise(async function(resolve, reject){
                let playersObj = new Array();
                let url = `http://data.nba.net/data/10s/prod/v1/2020/players.json`;
                let response = await fetch(url);
                let json = await response.json();

                let e = json.league.standard;
                for (let i = 0; i < e.length; i++) {
                    if (e[i].isActive == true && e[i].teamId == id) {
                        let pic = `https://cdn.nba.com/headshots/nba/latest/1040x760/${e[i].personId}.png`;
                        playersObj.push(new PlayerInfo(pic, e[i].firstName, e[i].lastName,e[i].personId, e[i].teamId, e[i].jersey,
                            e[i].pos, e[i].heightFeet, e[i].heightInches, e[i].weightPounds, e[i].draft.teamId,
                            e[i].draft.seasonYear, e[i].draft.pickNum, e[i].draft.roundNum,
                            ++e[i].yearsPro, e[i].collegeName, e[i].lastAffiliation, e[i]));
                    } 
                }
                return resolve(playersObj);
            })
        },

        getTeamLeaders: async function(id) {
            return new Promise(async function(resolve, reject) {
                let url = `http://data.nba.net/prod/v1/2020/teams/${id}/leaders.json`;
                let response = await fetch(url);
                let json = await response.json();

                let tmp = json.league.standard;

                let leaders = new TeamLeaders();
                leaders.setPts(await findIDForPlayer(tmp.ppg[0].personId), tmp.ppg[0].value);
                leaders.setRbs(await findIDForPlayer(tmp.trpg[0].personId), tmp.trpg[0].value);
                leaders.setAst(await findIDForPlayer(tmp.apg[0].personId), tmp.apg[0].value);
                leaders.setFgp(await findIDForPlayer(tmp.fgp[0].personId), (tmp.fgp[0].value * 100).toFixed(1));
                leaders.setTpp(await findIDForPlayer(tmp.tpp[0].personId), (tmp.tpp[0].value * 100).toFixed(1));
                leaders.setFtp(await findIDForPlayer(tmp.ftp[0].personId), (tmp.ftp[0].value * 100).toFixed(1));
                leaders.setStl(await findIDForPlayer(tmp.spg[0].personId), tmp.spg[0].value);
                leaders.setBlk(await findIDForPlayer(tmp.bpg[0].personId), tmp.bpg[0].value);
                //playerObj.push(leaders);

                return resolve(leaders);
            })
        },

        getStandings: async function(conference) {
            return new Promise(async function(resolve, reject) {
                let s = new Array();
                let url = "http://data.nba.net/prod/v1/current/standings_conference.json";
                const response = await fetch(url);
                const json = await response.json();
                let a;
                if (conference == "east") a = json.league.standard.conference.east;
                else a = json.league.standard.conference.west
    
                for (let i = 0; i < a.length; i++) {
                    s.push(new Standings(a[i].teamId, a[i].win, a[i].loss, a[i].winPct, a[i].gamesBehind,
                        a[i].homeWin, a[i].homeLoss, a[i].awayWin, a[i].awayLoss, a[i].lastTenWin,
                        a[i].lastTenLoss, a[i].streak, a[i].isWinStreak, i + 1));
                }

                return resolve(s);
            })
        },

        getAllStandings: async function() {
            return new Promise(async function(resolve, reject) {
                let s = new Array();
                let url = "http://data.nba.net/prod/v1/current/standings_all.json";
                const response = await fetch(url);
                const json = await response.json();
                let a = json.league.standard.teams;
                for (let i = 0; i < a.length; i++) {
                    s.push(new Standings(a[i].teamId, a[i].win, a[i].loss, a[i].winPct, a[i].gamesBehind,
                        a[i].homeWin, a[i].homeLoss, a[i].awayWin, a[i].awayLoss, a[i].lastTenWin,
                        a[i].lastTenLoss, a[i].streak, a[i].isWinStreak, i + 1));
                }

                return resolve(s);
            })
        },

        getTeamStatsById: async function(id) {
            return new Promise(async function(resolve ,reject) {
                let s = new Array();
                let teamUrl = `http://data.nba.net/data/10s/prod/v1/2020/players.json`;
                let response = await fetch(teamUrl);
                let json = await response.json();

                let e = json.league.standard;

                let playerArr = e.filter(obj => obj.teamId == id);

                for (let i = 0; i < playerArr.length; i++) {
                    let playerUrl = `https://data.nba.net/prod/v1/2020/players/${playerArr[i].personId}_profile.json`;
                    let response = await fetch(playerUrl);
                    let json = await response.json();
                    //console.log(playerArr[i].firstName + " " + playerArr[i].personId);

                    if (json.league.standard.stats.regularSeason.season.length > 0) { //rookie that has not played yet
                        let tmp = json.league.standard.stats.regularSeason.season[0];
                        let a = tmp.total;
                        a["playerId"] = playerArr[i].personId;
                        a["name"] = `${playerArr[i].firstName} ${playerArr[i].lastName}`;
                        s.push(a);
                    }
                    else {
                        s.push(new tmp(`${playerArr[i].firstName} ${playerArr[i].lastName}`, playerArr[i].personId));
                    }
                }
                return resolve(s);
            })
        },

        getDivisionStandings: async function(id) {
            return new Promise(async function(resolve, reject) {
                let s = new Array();
                let url = "http://data.nba.net/prod/v1/current/standings_division.json";
                const response = await fetch(url);
                const json = await response.json();
                let conf = findConferenceById(id);
                let div = findDivisionById(id);
                let a;// = json.league.standard.conference;

                if (conf == "east") {
                    if (div == "atlantic") {
                        a = json.league.standard.conference.east.atlantic;
                    }
                    else if (div == "central") {
                        a = json.league.standard.conference.east.central;
                    }
                    else if (div == "southeast") {
                        a = json.league.standard.conference.east.southeast;
                    }
                }
                else {
                    if (div == 'northwest') {
                        a = json.league.standard.conference.west.northwest;
                    }
                    else if (div == 'pacific') {
                        a = json.league.standard.conference.west.pacific;
                    }
                    else if (div == 'southwest') {
                        a = json.league.standard.conference.west.southwest;
                    }
                }

                for (let i = 0; i < a.length; i++) {
                    s.push(new Standings(a[i].teamId, a[i].win, a[i].loss, a[i].winPct, a[i].gamesBehind,
                        a[i].homeWin, a[i].homeLoss, a[i].awayWin, a[i].awayLoss, a[i].lastTenWin,
                        a[i].lastTenLoss, a[i].streak, a[i].isWinStreak, i + 1));
                }

                return resolve(s);
            })
        },

        getTeamRankings: async function() {
            return new Promise(async function(resolve, reject) {
                let s = new Array();
                for (let i = 0; i < teams.t.length; i++) {
                    var url = `http://data.nba.net/json/cms/2019/statistics/${teams.t[i].teamCode}/regseason_stats_and_rankings.json`
                    var response = await fetch(url);
                    var json = await response.json();
                    var tmp = json.sports_content.team;
                    var a = tmp.averages;
                    s.push(new TeamRank(tmp.name, tmp.nickname, tmp.id, Number(a.minutes), Number(a.field_goal_pct), Number(a.three_point_pct), Number(a.free_throw_pct),
                    Number(a.offensive_rebounds_pg), Number(a.defensive_rebounds_pg), Number(a.total_rebounds_pg), Number(a.assists_pg), Number(a.turnovers_pg), Number(a.steals_pg), 
                    Number(a.blocked_shots_pg), Number(a.personal_fouls_pg), Number(a.points_pg), Number(a.points_allowed_pg), Number(a.efficiency), Number(a.defensive_rtg), 
                    Number(a.offensive_rtg), Number(a.pace)));
                }
                return resolve(s);
            })
        },

        getContractsByTeam: async function(id) {
            return new Promise(async function(resolve, reject) {
                request('https://www.basketball-reference.com/contracts/BOS.html', (error, response, html) => {
                    if (!error & response.statusCode == 200) {
                        const $ = cheerio.load(html);
                        const heading = $('thead')

                        //return resolve($('index'))
                        //return resolve(html)
                    }
                })
            })
        },

        sortTeamRankings: async function(sort) {
            return new Promise(async function(resolve, reject) {
                console.time();
                let s = new Array();
                console.log(sort);
                for (let i = 0; i < teams.t.length; i++) {
                    var url = `http://data.nba.net/json/cms/2019/statistics/${teams.t[i].teamCode}/regseason_stats_and_rankings.json`
                    var response = await fetch(url);
                    var json = await response.json();
                    var tmp = json.sports_content.team;
                    var a = tmp.averages;
                    s.push(new TeamRank(tmp.name, tmp.nickname, tmp.id, Number(a.minutes), Number(a.field_goal_pct), Number(a.three_point_pct), Number(a.free_throw_pct),
                    Number(a.offensive_rebounds_pg), Number(a.defensive_rebounds_pg), Number(a.total_rebounds_pg), Number(a.assists_pg), Number(a.turnovers_pg), Number(a.steals_pg), 
                    Number(a.blocked_shots_pg), Number(a.personal_fouls_pg), Number(a.points_pg), Number(a.points_allowed_pg), Number(a.efficiency), Number(a.defensive_rtg), 
                    Number(a.offensive_rtg), Number(a.pace)));
                }
                if (sort == 'PPG') {
                    s.sort((a, b) => (a.ppg < b.ppg) ? 1 : -1);
                }
                else if (sort == 'TRPG') {
                    s.sort((a, b) => (a.trpg < b.trpg) ? 1 : -1);
                }
                else if (sort == 'FGP') {
                    s.sort((a, b) => (a.fgp < b.fgp) ? 1 : -1);
                }
                else if (sort == 'TPP') {
                    s.sort((a, b) => (a.tpp < b.tpp) ? 1 : -1);
                }
                else if (sort == 'FTP') {
                    s.sort((a, b) => (a.ftp < b.ftp) ? 1 : -1);
                }
                else if (sort == 'APG') {
                    s.sort((a, b) => (a.apg < b.apg) ? 1 : -1);
                }
                else if (sort == 'SPG') {
                    s.sort((a, b) => (a.spg < b.spg) ? 1 : -1);
                }
                else if (sort == 'BPG') {
                    s.sort((a, b) => (a.bpg < b.bpg) ? 1 : -1);
                }
                else if (sort == 'MPG') {
                    s.sort((a, b) => (a.min < b.min) ? 1 : -1);
                }
                else if (sort == 'PFPG') {
                    s.sort((a, b) => (a.pfpg < b.pfpg) ? 1 : -1);
                }
                else if (sort == "TPG") {
                    s.sort((a, b) => (a.tpg < b.tpg) ? 1 : -1);
                }
                else if (sort == 'OPPG') {
                    s.sort((a, b) => (a.oppg < b.oppg) ? 1 : -1);
                }
                else if (sort == 'EFF') {
                    s.sort((a, b) => (a.eff < b.eff) ? 1 : -1);
                }
                else if (sort == 'ORTG') {
                    s.sort((a, b) => (a.ortg < b.ortg) ? 1 : -1);
                }
                else if (sort == 'DRTG') {
                    s.sort((a, b) => (a.drtg > b.drtg) ? 1 : -1);
                }
                else if (sort == 'PACE') {
                    s.sort((a, b) => (a.pace < b.pace) ? 1 : -1);
                }
                return resolve(s);
            })
        },

        getTeamRankingsById: async function(id) {
            return new Promise(async function(resolve, reject) {
                let s = new Array();
                let yr = [2019, 2018, 2017, 2016, 2015];
                console.log(yr);
                for (let i = 0; i < teams.t.length; i++) {
                    if (id == teams.t[i].teamId) {
                        for (let j = 0; j < yr.length; j++) {
                            var url = `http://data.nba.net/json/cms/${yr[j]}/statistics/${teams.t[i].teamCode}/regseason_stats_and_rankings.json`
                            var response = await fetch(url);
                            var json = await response.json();
                            var tmp = json.sports_content.team;
                            var a = tmp.averages;
                            s.push(new TeamRank(tmp.name, tmp.nickname, tmp.id, Number(a.minutes), Number(a.field_goal_pct), Number(a.three_point_pct), Number(a.free_throw_pct),
                            Number(a.offensive_rebounds_pg), Number(a.defensive_rebounds_pg), Number(a.total_rebounds_pg), Number(a.assists_pg), Number(a.turnovers_pg), Number(a.steals_pg), 
                            Number(a.blocked_shots_pg), Number(a.personal_fouls_pg), Number(a.points_pg), Number(a.points_allowed_pg), Number(a.efficiency), Number(a.defensive_rtg), 
                            Number(a.offensive_rtg), Number(a.pace), yr[j]));
                        }
                    }
                }
                return resolve(s);
            })
        },


        /*
        leagueId = 00
        perMode = PerGame, Per100Possessions, Per36, Per40, Per48, PerMinute, PerPossession
                   PerPlay, MinutePer, Totals
        Scope = S(all), Rookies
        season =YYYY-YY, All Time
        seasontype: Pre Season, Regular Season, Playoffs, All Star
        StatCategory: PTS. MIN, OREB, DREB, REB, AST, STL, BLK, TOV, EFF
         */
        // https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/977.png
        getLeagueLeaders: function(mode, scope, season, type, category) {
            return new Promise(async function(resolve, reject){
                nbajs.stats.leagueLeaders(
                    {
                      leagueID: "00",
                      perMode: mode,
                      Scope: scope,
                      Season: season,
                      SeasonType: type,
                      StatCategory: category
                    },
                    async function(err, res) {
                        let hi;
                        if (res) {
                            let arr = new Array();
                            //tmp
                            for (let i = 0; i < res.LeagueLeaders.length; i++) {
                                if (category == "PTS") {
                                    let pic = `https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${res.LeagueLeaders[i].player_id}.png`;
                                    arr.push(new Rank(res.LeagueLeaders[i].player_id, pic, category, res.LeagueLeaders[i].player, res.LeagueLeaders[i].rank, res.LeagueLeaders[i].pts))
                                }
                                else if (category == "REB") {
                                    let pic = `https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${res.LeagueLeaders[i].player_id}.png`;
                                    arr.push(new Rank(res.LeagueLeaders[i].player_id, pic, category, res.LeagueLeaders[i].player, res.LeagueLeaders[i].rank, res.LeagueLeaders[i].reb))
                                }
                                else if (category == "AST") {
                                    let pic = `https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${res.LeagueLeaders[i].player_id}.png`;
                                    arr.push(new Rank(res.LeagueLeaders[i].player_id, pic, category, res.LeagueLeaders[i].player, res.LeagueLeaders[i].rank, res.LeagueLeaders[i].ast))
                                }
                                else if (category == "STL") {
                                    let pic = `https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${res.LeagueLeaders[i].player_id}.png`;
                                    arr.push(new Rank(res.LeagueLeaders[i].player_id, pic, category, res.LeagueLeaders[i].player, res.LeagueLeaders[i].rank, res.LeagueLeaders[i].stl))
                                }
                                else if (category == "BLK") {
                                    let pic = `https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${res.LeagueLeaders[i].player_id}.png`;
                                    arr.push(new Rank(res.LeagueLeaders[i].player_id, pic, category, res.LeagueLeaders[i].player, res.LeagueLeaders[i].rank, res.LeagueLeaders[i].blk))
                                }
                                else if (category == "MIN") {
                                    let pic = `https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${res.LeagueLeaders[i].player_id}.png`;
                                    arr.push(new Rank(res.LeagueLeaders[i].player_id, pic, category, res.LeagueLeaders[i].player, res.LeagueLeaders[i].rank, res.LeagueLeaders[i].min))
                                }
                                else if (category == "EFF") {
                                    let pic = `https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${res.LeagueLeaders[i].player_id}.png`;
                                    arr.push(new Rank(res.LeagueLeaders[i].player_id, pic, category, res.LeagueLeaders[i].player, res.LeagueLeaders[i].rank, res.LeagueLeaders[i].eff))
                                }
                            }
                            return resolve(arr);
                        }
                        else return reject(err)})
            })
        },
        
        /*
        leagueId = 00
        perMode = PerGame, Per100Possessions, Per36, Per40, Per48, PerMinute, PerPossession
                   PerPlay, MinutePer, Totals
        Scope = S(all), Rookies
        season =YYYY-YY, All Time
        seasontype: Pre Season, Regular Season, Playoffs, All Star
        StatCategory: PTS. MIN, OREB, DREB, REB, AST, STL, BLK, TOV, EFF
         */
        getAllLeagueLeaders: function() {
            return new Promise(async function(resolve, reject) {
                let categoryArray = ["PTS", "REB", "AST", "STL", "BLK", "MIN", "EFF"];

                let obj = new Array();

                for (let i = 0; i < categoryArray.length; i++) {
                    obj.push(getLeaders(categoryArray[i]));
                }
                return resolve(obj);
            })
        }


    }
}

function getLeaders(category) {
    nbajs.stats.leagueLeaders(
    {
    leagueID: "00",
    perMode: "PerGame",
    Scope: "S",
    Season: "2020-21",
    SeasonType: "Regular Season",
    StatCategory: category
    },
    async function(err, res) {
        let hi;
        if (res) {
            for (let i = 0; i < res.LeagueLeaders.length; i++) {
                if (category == "PTS") {
                    let pic = `https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${res.LeagueLeaders[i].player_id}.png`;
                    return new Rank(res.LeagueLeaders[i].player_id, pic, category, res.LeagueLeaders[i].player, res.LeagueLeaders[i].rank, res.LeagueLeaders[i].pts)
                }
                else if (category == "REB") {
                    let pic = `https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${res.LeagueLeaders[i].player_id}.png`;
                    return new Rank(res.LeagueLeaders[i].player_id, pic, category, res.LeagueLeaders[i].player, res.LeagueLeaders[i].rank, res.LeagueLeaders[i].reb)
                }
                else if (category == "AST") {
                    let pic = `https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${res.LeagueLeaders[i].player_id}.png`;
                    return new Rank(res.LeagueLeaders[i].player_id, pic, category, res.LeagueLeaders[i].player, res.LeagueLeaders[i].rank, res.LeagueLeaders[i].ast)
                }
                else if (category == "STL") {
                    let pic = `https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${res.LeagueLeaders[i].player_id}.png`;
                    return new Rank(res.LeagueLeaders[i].player_id, pic, category, res.LeagueLeaders[i].player, res.LeagueLeaders[i].rank, res.LeagueLeaders[i].stl)
                }
                else if (category == "BLK") {
                    let pic = `https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${res.LeagueLeaders[i].player_id}.png`;
                    return new Rank(res.LeagueLeaders[i].player_id, pic, category, res.LeagueLeaders[i].player, res.LeagueLeaders[i].rank, res.LeagueLeaders[i].blk)
                }
                else if (category == "MIN") {
                    let pic = `https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${res.LeagueLeaders[i].player_id}.png`;
                    return new Rank(res.LeagueLeaders[i].player_id, pic, category, res.LeagueLeaders[i].player, res.LeagueLeaders[i].rank, res.LeagueLeaders[i].min)
                }
                else if (category == "EFF") {
                    let pic = `https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${res.LeagueLeaders[i].player_id}.png`;
                    return new Rank(res.LeagueLeaders[i].player_id, pic, category, res.LeagueLeaders[i].player, res.LeagueLeaders[i].rank, res.LeagueLeaders[i].eff)
                }
            }
        }})
}

class Rank {
    constructor(playerId, pic, category, name, rank, value) {
        this.playerId = playerId;
        this.pic = pic;
        this.category = category;
        this.name = name;
        this.rank = rank;
        this.value = value;
        this.url = ball.getTeamLogoURLs(getTeamAbb(NBA.findPlayer(this.name).teamId))[1];
    }
}
async function findLogoForPlayer(id) {
    let url = `http://data.nba.net/data/10s/prod/v1/2020/players.json`;
    let response = await fetch(url);
    let json = await response.json();
    let e = json.league.standard;
    for (let i = 0; i < e.length; i++) {
        if (e[i].isActive == true && e[i].personId == id) {
            for (let j = 0; j < teams.t.length; j++) {
                if (e[i].teamId == teams.t[j].teamId) {
                    return teams.t[j].altLogo;
                }
            }
        } 
    }
}

async function getTeamByPlayerId(id) {
    let url = `http://data.nba.net/data/10s/prod/v1/2020/players.json`;
    let response = await fetch(url);
    let json = await response.json();

    let tmp = json.league.standard;
    let result = tmp.filter(obj => obj.personId == id)[0];
    return result.teamId;
}

class tmp {
    constructor(name, id) {
        this.playerId = id;
        this.name = name;
    }
}

class TeamRank {
    constructor(name, nickname, id, min, fgp, tpp, ftp, orpg, drpg, trpg, apg, tpg, spg, bpg, pfpg, ppg, oppg, eff, ortg, drtg, pace, year) {
        this.name = name;
        this.nickname = nickname;
        this.id = id;
        this.min = min;
        this.fgp = fgp;
        this.tpp = tpp;
        this.ftp = ftp;
        this.orpg = orpg;
        this.drpg = drpg;
        this.trpg = trpg;
        this.apg = apg;
        this.tpg = tpg;
        this.spg = spg;
        this.bpg = bpg; 
        this.pfpg = pfpg;
        this.ppg = ppg;
        this.oppg = oppg;
        this.eff = eff;
        this.ortg = ortg;
        this.drtg = drtg;
        this.pace = pace;
        this.url = teams.t.filter(v => id == v.teamId)[0].altLogo;
        this.abb = teams.t.filter(v => id == v.teamId)[0].abbreviation;
        this.year = year;
        
    }
}


class PlayerAwards {
    constructor(desc, amount) {
        this.desc = desc;
        this.amount = amount;
    }
}
