using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace TennisLeagueWeb.Controllers
{
    internal static class Helper
    {
        internal static string JsonSerializeObject<T>(T objectToSerialize)
        {
            var serializerSettings = new JsonSerializerSettings
            {
                PreserveReferencesHandling = PreserveReferencesHandling.Objects
            };
            string serializedObject = JsonConvert.SerializeObject(objectToSerialize, Formatting.Indented, serializerSettings);
            return serializedObject;
        }
    }
}