using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Cors;
using TennisLeagueComponents.Data.DataContext;
using TennisLeagueComponents.Logic;

namespace TennisLeagueWeb.Controllers
{
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    public class PlayerController : ApiController
    {
        [HttpGet]
        public Player Get(int playerId)
        {
            return new PlayerLogic().Get(playerId);
        }
    }
}
