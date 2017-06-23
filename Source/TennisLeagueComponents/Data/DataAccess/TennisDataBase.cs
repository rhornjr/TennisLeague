using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TennisLeagueComponents.Data.DataContext;

namespace TennisLeagueComponents.Data.DataAccess
{
    internal class TennisDataBase : TennisDataContext
    {
        internal TennisDataBase()
        {
            this.Connection.ConnectionString = ConfigurationManager.ConnectionStrings["Tennis"].ConnectionString;

            // The reason for setting this to false (default is true) is because I would get an error
            // about accessing a disposed object on the caller. I started to include every property
            // in my DB queries and then call ToList() on the query, but that was becoming too much of
            // a pain. So f*ck deferred loading. Let's just get it all at once.
            this.DeferredLoadingEnabled = false;
        }
    }
}
