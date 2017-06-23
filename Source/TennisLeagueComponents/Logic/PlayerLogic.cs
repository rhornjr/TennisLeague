using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TennisLeagueComponents.Data.DataAccess;
using TennisLeagueComponents.Data.DataContext;

namespace TennisLeagueComponents.Logic
{
    public class PlayerLogic
    {
        public Player Get(int playerId)
        {
            using (var data = new PlayerData())
            {
                return data.Get(playerId);
            }
        }
    }
}
