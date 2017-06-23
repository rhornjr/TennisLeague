using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TennisLeagueComponents.Dtos
{
    public class PlayerStandingsResultsDto
    {
        public int PlayerId { get; set; }
        public string PlayerName { get; set; }
        public int MatchesWon { get; set; }
        public int MatchesLost { get; set; }
        public int SetsWon { get; set; }
        public int SetsLost { get; set; }
        public int GamesWon { get; set; }
        public int GamesLost { get; set; }
    }
}
