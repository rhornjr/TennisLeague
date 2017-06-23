using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TennisLeagueComponents.Data.DataAccess;
using TennisLeagueComponents.Dtos;

namespace TennisLeagueComponents.Logic
{
    public class ScheduleLogic
    {
        public ScheduleAndResultsDto GetSchedule(string divisionName, string seasonName, string leagueName)
        {
            using (var data = new ScheduleData())
            {
                return data.GetSchedule(divisionName, seasonName, leagueName);
            }
        }

        public List<PlayerStandingsResultsDto> GetStandings(string divisionName, string seasonName, string leagueName)
        {
            using (var data = new ScheduleData())
            {
                return data.GetStandings(divisionName, seasonName, leagueName);
            }
        }
    }
}
