using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TennisLeagueComponents.Dtos
{
    public class MatchDto
    {
        public int WeekNumber { get; set; }
        public string AwayPlayer { get; set; }
        public string HomePlayer { get; set; }
        public string Winner { get; set; }
        public string Score { get; set; }
    }
}
