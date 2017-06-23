using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.Linq;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TennisLeagueComponents.Data.DataContext;
using TennisLeagueComponents.Dtos;

namespace TennisLeagueComponents.Data.DataAccess
{
    internal class ScheduleData : TennisDataBase
    {
        internal ScheduleAndResultsDto GetSchedule(string divisionName, string seasonName, string leagueName)
        {
            var query = from match in Matches                        
                        join ms in MatchSets on match.Id equals ms.MatchId
                            into matchSets from x in matchSets.DefaultIfEmpty() // basically, left join
                        join p in Players on match.Player.Id equals p.Id
                        join p2 in Players on match.Player1.Id equals p2.Id
                        join d in Divisions on match.Division.Id equals d.Id
                        where match.Division.Name == divisionName
                           && match.Division.Season.Name == seasonName
                           && match.Division.Season.League.Name == leagueName
                        select new { Match = match, MatchSets = matchSets, Division = d, HomePlayer = p, AwayPlayer = p2 };

            var schedule = new ScheduleAndResultsDto();
            schedule.Matches = new List<MatchDto>();

            // HACK: Since joining to MatchSets causes multiple rows for one match, only add one row.
            //       To remove this hack, do a group by in the LINQ above (I think).
            int previousMatchId = 0;
            foreach (var record in query)
            {
                if (record.Match.Id == previousMatchId) { continue; }
                previousMatchId = record.Match.Id;
                schedule.DivisionName = record.Division.Name;
                var match = new MatchDto();
                match.WeekNumber = record.Match.WeekNumber;
                match.AwayPlayer = record.AwayPlayer.FirstName + " " + record.AwayPlayer.LastName;
                match.HomePlayer = record.HomePlayer.FirstName + " " + record.HomePlayer.LastName;
                SetScoreAndSetWinner(record.MatchSets.ToList(), match);
                schedule.Matches.Add(match);
            }

            return schedule;
        }

        private static void SetScoreAndSetWinner(List<MatchSet> matchSets, MatchDto match)
        {
            int awaySetsWon = 0;
            int homeSetsWon = 0;
            foreach (var set in matchSets)
            {
                if (set.HomeGamesWon > set.AwayGamesWon)
                {
                    homeSetsWon += 1;
                    continue;
                }
                awaySetsWon += 1;
            }

            if (homeSetsWon > awaySetsWon) { match.Winner = match.HomePlayer; }
            if (awaySetsWon > homeSetsWon) { match.Winner = match.AwayPlayer; }

            var stringBuilder = new StringBuilder();

            foreach (var set in matchSets)
            {
                if (match.Winner == match.HomePlayer)
                {
                    stringBuilder.Append(set.HomeGamesWon + "-" + set.AwayGamesWon + ", ");
                    continue;
                };
                stringBuilder.Append(set.AwayGamesWon + "-" + set.HomeGamesWon + ", ");
            }

            // Remove trailing delimter
            var score = stringBuilder.ToString();
            if (score.Length > 2)
            {
                score = score.Remove(score.Length - 2);
            }

            match.Score = score;
        }

        internal List<PlayerStandingsResultsDto> GetStandings(string divisionName, string seasonName, string leagueName)
        {
            // Include certain properties on Match.
            var loadOptions = new DataLoadOptions();
            loadOptions.LoadWith<Match>(x => x.MatchSets);
            loadOptions.LoadWith<Match>(x => x.Division);
            loadOptions.LoadWith<Match>(x => x.Player);
            loadOptions.LoadWith<Match>(x => x.Player1);
            this.LoadOptions = loadOptions;

            var query = from match in Matches
                        where match.Division.Name == divisionName
                           && match.Division.Season.Name == seasonName
                           && match.Division.Season.League.Name == leagueName
                        orderby match.Id
                        select match;

            var playerIdToStandingsMapping = new Dictionary<int, PlayerStandingsResultsDto>();
            var standings = new PlayerStandingsResultsDto();

            int previousMatchId = 0;
            foreach (var match in query)
            {
                if (match.Id == previousMatchId) { continue; }
                previousMatchId = match.Id;
                UpdateHomeResults(match, playerIdToStandingsMapping);
                UpdateAwayResults(match, playerIdToStandingsMapping);
            }

            //return playerIdToStandingsMapping.Values.ToList()
            //    .OrderByDescending(x => x.MatchesWon).ThenByDescending(x => x.SetsWon).ThenByDescending(x => x.GamesWon)
            //    .ThenBy(x => x.SetsLost).ThenBy(x => x.GamesLost).ToList();

            return playerIdToStandingsMapping.Values.ToList()
                .OrderByDescending(x => x.MatchesWon - x.MatchesLost)
                .ThenByDescending(x => x.SetsWon - x.SetsLost)
                .ThenByDescending(x => x.GamesWon - x.GamesLost)
                .ToList();
        }

        private static void UpdateHomeResults(Match match, Dictionary<int, PlayerStandingsResultsDto> standingsDictionary)
        {
            PlayerStandingsResultsDto resultsHome = GetResultsDto(standingsDictionary, match.Player);

            var homeSetsWon = match.MatchSets.Count(x => x.HomeGamesWon > x.AwayGamesWon);
            var awaySetsWon = match.MatchSets.Count(x => x.AwayGamesWon > x.HomeGamesWon);

            if (homeSetsWon > awaySetsWon)
            {
                resultsHome.MatchesWon += 1;
            }
            else if (awaySetsWon > homeSetsWon) // they could be the same (0-0) if the match hasn't been played yet
            {
                resultsHome.MatchesLost += 1;
            }

            resultsHome.GamesWon += match.MatchSets.Sum(x => x.HomeGamesWon);
            resultsHome.GamesLost += match.MatchSets.Sum(x => x.AwayGamesWon);
            resultsHome.SetsWon += homeSetsWon;
            resultsHome.SetsLost += awaySetsWon;
        }

        private static void UpdateAwayResults(Match match, Dictionary<int, PlayerStandingsResultsDto> standingsDictionary)
        {
            PlayerStandingsResultsDto resultsAway = GetResultsDto(standingsDictionary, match.Player1);

            var homeSetsWon = match.MatchSets.Count(x => x.HomeGamesWon > x.AwayGamesWon);
            var awaySetsWon = match.MatchSets.Count(x => x.AwayGamesWon > x.HomeGamesWon);

            if (homeSetsWon > awaySetsWon)
            {
                resultsAway.MatchesLost += 1;
            }
            else if (awaySetsWon > homeSetsWon) // they could be the same (0-0) if the match hasn't been played yet
            {
                resultsAway.MatchesWon += 1;
            }

            resultsAway.GamesWon += match.MatchSets.Sum(x => x.AwayGamesWon);
            resultsAway.GamesLost += match.MatchSets.Sum(x => x.HomeGamesWon);
            resultsAway.SetsWon += awaySetsWon;
            resultsAway.SetsLost += homeSetsWon;
        }

        private static PlayerStandingsResultsDto GetResultsDto(Dictionary<int, PlayerStandingsResultsDto> standingsDictionary,
            Player player)
        {
            PlayerStandingsResultsDto resultsDto;

            if (standingsDictionary.ContainsKey(player.Id))
            {
                resultsDto = standingsDictionary[player.Id];
            }
            else
            {
                resultsDto = new PlayerStandingsResultsDto();
                resultsDto.PlayerId = player.Id;
                resultsDto.PlayerName = player.FirstName + " " + player.LastName;
                standingsDictionary.Add(player.Id, resultsDto);
            }

            return resultsDto;
        }        
    }
}
