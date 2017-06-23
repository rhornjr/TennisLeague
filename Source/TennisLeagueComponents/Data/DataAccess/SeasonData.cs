using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TennisLeagueComponents.Data.DataContext;

namespace TennisLeagueComponents.Data.DataAccess
{
    internal class SeasonData : TennisDataBase
    {
        internal List<Season> GetSeasons()
        {
            var query = (from season in Seasons
                         select season);

            return query.ToList();
        }
    }
}
