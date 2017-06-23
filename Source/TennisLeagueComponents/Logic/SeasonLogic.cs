using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TennisLeagueComponents.Data.DataAccess;
using TennisLeagueComponents.Data.DataContext;

namespace TennisLeagueComponents.Logic
{
    public class SeasonLogic
    {
        public List<Season> GetSeasons()
        {
            using (var data = new SeasonData())
            {
                return data.GetSeasons();
            }
        }
    }
}
