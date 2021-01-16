document.addEventListener("DOMContentLoaded", () => {
    const searchByText = document.getElementById("search-by-text");
    searchByText.addEventListener("click", async event => {
        const text = document.getElementById("filter-by-text").value;

        const byFilm = new QueryBuilder();

        var matchingResults = {};

        // films matchant avec le texte
        byFilm.addPrefix("dbr", "<http://dbpedia.org/resource/>")
            .addPrefix("dbo", "<http://dbpedia.org/ontology/>")
            .addPrefix("dbp", "<http://dbpedia.org/property/>")
            .select("film")
            .where("?film a dbo:Film;")
            .andWhere("dbp:name ?name")
            .filter(`regex(lcase(str(?name)) ,lcase(".*${text}.*"))`);

        const byActor = new QueryBuilder();

        // films par le nom des acteurs
        byActor.addPrefix("dbr", "<http://dbpedia.org/resource/>")
            .addPrefix("dbo", "<http://dbpedia.org/ontology/>")
            .addPrefix("dbp", "<http://dbpedia.org/property/>")
            .select("film")
            .where("?film a dbo:Film;")
            .andWhere("dbp:starring ?actors")
            .filter(`regex(lcase(str(?actors)) ,lcase(".*${text}.*"))`);

        const byDirector = new QueryBuilder();

        // films par le nom du réalisateur
        byDirector.addPrefix("dbr", "<http://dbpedia.org/resource/>")
            .addPrefix("dbo", "<http://dbpedia.org/ontology/>")
            .addPrefix("dbp", "<http://dbpedia.org/property/>")
            .select("film")
            .where("?film a dbo:Film;")
            .andWhere("dbo:director ?director")
            .filter(`regex(lcase(str(?director)) ,lcase(".*${text}.*"))`);

        try
        {
            var result = await byFilm.request();
            matchingResults.byFilm = result.data.results.bindings;
            
            result = await byActor.request();
            matchingResults.byActor = result.data.results.bindings;

            result = await byDirector.request();
            matchingResults.byDirector = result.data.results.bindings;

            console.log(matchingResults);
        } catch(err)
        {
            console.log(err);
        }

    });
});