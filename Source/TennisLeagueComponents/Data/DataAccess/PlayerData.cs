using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TennisLeagueComponents.Data.DataContext;

namespace TennisLeagueComponents.Data.DataAccess
{
    internal class PlayerData : TennisDataBase
    {
        internal Player Get(int playerId)
        {
            var query = (from player in Players
                         where player.Id == playerId
                         select player).First();

            return query;
        }
    }
}
