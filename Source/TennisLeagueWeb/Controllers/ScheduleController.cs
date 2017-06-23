using System.Collections.Generic;
using System.Web.Http;
using System.Web.Http.Cors;
using TennisLeagueComponents.Data.DataContext;
using TennisLeagueComponents.Dtos;
using TennisLeagueComponents.Logic;

namespace TennisLeagueWeb.Controllers
{
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    public class ScheduleController : ApiController
    {
        [HttpGet]
        [Route("api/schedule/getSchedule")]
        public string GetSchedule(string divisionName, string seasonName, string leagueName)
        {
            var logic = new ScheduleLogic();
            var schedule = logic.GetSchedule(divisionName, seasonName, leagueName);
            return Helper.JsonSerializeObject(schedule);
        }

        [HttpGet]
        [Route("api/standings/getStandings")]
        public string GetStandings(string divisionName, string seasonName, string leagueName)
        {
            var logic = new ScheduleLogic();
            var standings = logic.GetStandings(divisionName, seasonName, leagueName);
            return Helper.JsonSerializeObject(standings);
        }

        [HttpGet]
        [Route("api/seasons/getSeasons")]
        public List<Season> GetSeasons()
        {
            var logic = new SeasonLogic();
            var seasons = logic.GetSeasons();
            return seasons;
        }
    }
}
