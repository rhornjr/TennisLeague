using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TennisLeagueComponents.Data.DataContext;

namespace TennisLeagueComponents.Dtos
{
    public class ScheduleAndResultsDto
    {
        public string DivisionName { get; set; }
        public List<MatchDto> Matches { get; set; }
    }
}
